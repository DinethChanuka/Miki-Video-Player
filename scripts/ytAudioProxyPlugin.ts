/**
 * Miki Player - YouTube audio proxy (Vite dev-server middleware)
 *
 * Endpoints
 *   GET /api/stream-audio?id=<videoId>&stream=true   -> audio bytes, Range supported
 *   GET /api/stream-audio?id=<videoId>               -> JSON { url, id, ... }
 *   GET /api/stream-audio?id=<videoId>&warm=1        -> resolves in the background, answers at once
 *   GET /api/search-youtube?q=<query>                -> JSON array of tracks
 *
 * What makes it faster than the old inline version
 *   1. Resolves the audio URL with one direct YouTube request first (usually well under
 *      a second). yt-dlp, which takes several seconds to start, is only the fallback.
 *   2. Requests for the same video share one resolution (no parallel yt-dlp storms).
 *   3. Open-ended Range requests are answered in 1 MB pieces, so playback starts at once
 *      and seeking is quick.
 *   4. Upstream sockets are reused (keep-alive) and closed as soon as the browser aborts.
 *   5. An expired upstream URL (403/404/410) is re-resolved once and retried.
 *   6. /api/stream-audio?...&warm=1 lets the UI pre-resolve the next track.
 *
 * Environment overrides
 *   YT_DLP_PATH             path to the yt-dlp binary (default: ./bin/yt-dlp, then PATH)
 *   MIKI_YT_FAST_PATH=0     disable the direct-request fast path and always use yt-dlp
 *   MIKI_YT_VR_VERSION      client version string used by the fast path
 */

import https from 'node:https';
import fs from 'node:fs';
import path from 'node:path';
import { execFile } from 'node:child_process';
import type { IncomingMessage, ServerResponse } from 'node:http';
import type { Plugin } from 'vite';

const DESKTOP_UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';
const VR_VERSION = process.env.MIKI_YT_VR_VERSION || '1.65.10';
const VR_UA = `com.google.android.apps.youtube.vr.oculus/${VR_VERSION} (Linux; U; Android 12L; eureka-user Build/SQ3A.220605.009.A1) gzip`;
const WEB_CLIENT_VERSION = '2.20250801.00.00';

const CHUNK_BYTES = 1024 * 1024; // answer open-ended ranges in 1 MB pieces
const MAX_RANGE_BYTES = CHUNK_BYTES * 4;
const FALLBACK_TTL_MS = 3 * 60 * 60 * 1000;
const INNERTUBE_TIMEOUT_MS = 3500;
const SEARCH_TIMEOUT_MS = 6000;
const YTDLP_TIMEOUT_MS = 20000;
const MAX_CACHE_ENTRIES = 300;

const agent = new https.Agent({ keepAlive: true, maxSockets: 24 });

interface ResolvedAudio {
  url: string;
  expiresAt: number;
  ua: string;
  via: 'innertube' | 'yt-dlp';
  mime: string;
}

interface SearchTrack {
  id: string;
  youtubeId: string;
  title: string;
  artist: string;
  duration: string;
  durationSec: number;
  coverUrl: string;
  streamUrl: string;
  platform: 'youtube';
  genre: string;
  badge: string;
}

const resolvedCache = new Map<string, ResolvedAudio>();
const inflight = new Map<string, Promise<ResolvedAudio | null>>();
const searchCache = new Map<string, { at: number; tracks: SearchTrack[] }>();

// Circuit breaker for the fast path: two failures in a row switch it off for 10 minutes.
let fastPathFailures = 0;
let fastPathDisabledUntil = 0;

function fastPathAllowed(): boolean {
  if (process.env.MIKI_YT_FAST_PATH === '0') return false;
  return Date.now() >= fastPathDisabledUntil;
}

function noteFastPath(ok: boolean): void {
  if (ok) {
    fastPathFailures = 0;
    return;
  }
  fastPathFailures += 1;
  if (fastPathFailures >= 2) {
    fastPathFailures = 0;
    fastPathDisabledUntil = Date.now() + 10 * 60 * 1000;
    console.warn('[Miki YT proxy] Fast path failed twice, using yt-dlp for the next 10 minutes.');
  }
}

function expiryFromUrl(url: string): number {
  try {
    const expire = Number(new URL(url).searchParams.get('expire'));
    if (expire > 0) return expire * 1000 - 5 * 60 * 1000;
  } catch {
    // fall through
  }
  return Date.now() + FALLBACK_TTL_MS;
}

function rememberResolved(id: string, value: ResolvedAudio): void {
  resolvedCache.set(id, value);
  if (resolvedCache.size > MAX_CACHE_ENTRIES) {
    const oldest = resolvedCache.keys().next().value;
    if (oldest) resolvedCache.delete(oldest);
  }
}

/* ------------------------------------------------------------------ */
/* Resolution: fast path                                               */
/* ------------------------------------------------------------------ */

function pickAudioFormat(formats: any[]): any | null {
  // WebKit (the macOS app) cannot play WebM/Opus reliably, so only take MP4/AAC.
  const mp4 = formats.filter(
    (f) => f && typeof f.url === 'string' && typeof f.mimeType === 'string' && f.mimeType.startsWith('audio/mp4')
  );
  if (mp4.length === 0) return null;
  // Closest to ~128 kbps (itag 140): good quality, small, starts quickly.
  mp4.sort((a, b) => Math.abs((a.bitrate || 0) - 130000) - Math.abs((b.bitrate || 0) - 130000));
  return mp4[0];
}

async function resolveViaFastPath(id: string): Promise<ResolvedAudio | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), INNERTUBE_TIMEOUT_MS);
  try {
    const res = await fetch('https://www.youtube.com/youtubei/v1/player?prettyPrint=false', {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': VR_UA,
        'X-YouTube-Client-Name': '28',
        'X-YouTube-Client-Version': VR_VERSION,
        Origin: 'https://www.youtube.com',
      },
      body: JSON.stringify({
        videoId: id,
        contentCheckOk: true,
        racyCheckOk: true,
        context: {
          client: {
            clientName: 'ANDROID_VR',
            clientVersion: VR_VERSION,
            deviceMake: 'Oculus',
            deviceModel: 'Quest 3',
            osName: 'Android',
            osVersion: '12L',
            androidSdkVersion: 32,
            hl: 'en',
            gl: 'US',
          },
        },
      }),
    });
    if (!res.ok) return null;
    const data: any = await res.json();
    if (data?.playabilityStatus?.status !== 'OK') return null;
    const format = pickAudioFormat(data?.streamingData?.adaptiveFormats || []);
    if (!format) return null;
    return {
      url: format.url,
      expiresAt: expiryFromUrl(format.url),
      ua: VR_UA,
      via: 'innertube',
      mime: 'audio/mp4',
    };
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

/* ------------------------------------------------------------------ */
/* Resolution: yt-dlp fallback                                         */
/* ------------------------------------------------------------------ */

function ytDlpBinary(): string {
  if (process.env.YT_DLP_PATH) return process.env.YT_DLP_PATH;
  const exe = process.platform === 'win32' ? 'yt-dlp.exe' : 'yt-dlp';
  const local = path.resolve(process.cwd(), 'bin', exe);
  return fs.existsSync(local) ? local : 'yt-dlp';
}

function resolveViaYtDlp(id: string): Promise<ResolvedAudio | null> {
  return new Promise((resolve) => {
    execFile(
      ytDlpBinary(),
      [
        '--force-ipv4',
        '--no-check-certificates',
        '--geo-bypass',
        '--no-playlist',
        '--no-warnings',
        '--socket-timeout', '8',
        '--extractor-args', 'youtube:skip=hls,dash,translated_subs',
        '-f', 'bestaudio[ext=m4a]/bestaudio[ext=mp4]/bestaudio',
        '-g',
        `https://www.youtube.com/watch?v=${id}`,
      ],
      { timeout: YTDLP_TIMEOUT_MS, maxBuffer: 1024 * 1024 },
      (err, stdout) => {
        if (err || !stdout || !stdout.trim()) return resolve(null);
        const url = stdout.trim().split('\n')[0].trim();
        if (!/^https?:\/\//i.test(url)) return resolve(null);
        resolve({ url, expiresAt: expiryFromUrl(url), ua: DESKTOP_UA, via: 'yt-dlp', mime: 'audio/mp4' });
      }
    );
  });
}

/* ------------------------------------------------------------------ */
/* Resolution: public entry (cache + de-duplication)                   */
/* ------------------------------------------------------------------ */

async function resolveAudio(id: string, force = false): Promise<ResolvedAudio | null> {
  if (!force) {
    const cached = resolvedCache.get(id);
    if (cached && cached.expiresAt > Date.now()) return cached;
  }
  const running = inflight.get(id);
  if (running) return running;

  const task = (async () => {
    let result: ResolvedAudio | null = null;
    if (fastPathAllowed()) {
      result = await resolveViaFastPath(id);
      noteFastPath(Boolean(result));
    }
    if (!result) result = await resolveViaYtDlp(id);
    if (result) rememberResolved(id, result);
    return result;
  })().finally(() => inflight.delete(id));

  inflight.set(id, task);
  return task;
}

/* ------------------------------------------------------------------ */
/* Streaming proxy                                                     */
/* ------------------------------------------------------------------ */

function buildUpstreamRange(header: string | undefined): string {
  const m = /^bytes=(\d+)-(\d*)$/.exec(header || '');
  if (!m) {
    if (header && /^bytes=-\d+$/.test(header)) return header; // suffix range, pass through
    return `bytes=0-${CHUNK_BYTES - 1}`;
  }
  const start = Number(m[1]);
  const end = m[2] === '' ? start + CHUNK_BYTES - 1 : Math.min(Number(m[2]), start + MAX_RANGE_BYTES - 1);
  return `bytes=${start}-${end}`;
}

function sendJson(res: ServerResponse, status: number, body: unknown): void {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify(body));
}

function failStream(res: ServerResponse, status: number): void {
  if (!res.headersSent) {
    res.statusCode = status;
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.end();
  } else {
    res.destroy();
  }
}

function pipeAudio(
  req: IncomingMessage,
  res: ServerResponse,
  id: string,
  resolved: ResolvedAudio,
  attempt: number
): void {
  let closed = false;
  let upstream: ReturnType<typeof https.request> | null = null;
  res.on('close', () => {
    closed = true;
    upstream?.destroy();
  });

  let target: URL;
  try {
    target = new URL(resolved.url);
  } catch {
    failStream(res, 502);
    return;
  }

  upstream = https.request(
    target,
    {
      agent,
      method: 'GET',
      headers: {
        'User-Agent': resolved.ua,
        Range: buildUpstreamRange(req.headers.range),
        Accept: '*/*',
        'Accept-Encoding': 'identity',
        Origin: 'https://www.youtube.com',
        Referer: 'https://www.youtube.com/',
      },
    },
    (up) => {
      const status = up.statusCode || 502;

      // The upstream URL expired or was rejected: resolve a fresh one and retry once.
      if ((status === 403 || status === 404 || status === 410) && attempt === 0 && !closed) {
        up.resume();
        resolvedCache.delete(id);
        resolveAudio(id, true)
          .then((fresh) => {
            if (closed) return;
            if (fresh) pipeAudio(req, res, id, fresh, 1);
            else failStream(res, 502);
          })
          .catch(() => failStream(res, 502));
        return;
      }

      if (status >= 400) {
        up.resume();
        failStream(res, 502);
        return;
      }

      res.statusCode = status;
      res.setHeader('Content-Type', up.headers['content-type'] || resolved.mime);
      res.setHeader('Accept-Ranges', 'bytes');
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Expose-Headers', 'Content-Length, Content-Range, Accept-Ranges');
      res.setHeader('Cache-Control', 'no-store');
      if (up.headers['content-length']) res.setHeader('Content-Length', up.headers['content-length']);
      if (up.headers['content-range']) res.setHeader('Content-Range', up.headers['content-range']);

      up.on('error', () => res.destroy());
      up.pipe(res);
    }
  );

  upstream.setTimeout(15000, () => upstream?.destroy(new Error('upstream timeout')));
  upstream.on('error', () => {
    if (!closed) failStream(res, 502);
  });
  upstream.end();
}

function parseVideoId(searchParams: URLSearchParams): string {
  const direct = (searchParams.get('id') || '').trim();
  if (/^[a-zA-Z0-9_-]{11}$/.test(direct)) return direct;

  const rawUrl = (searchParams.get('url') || '').trim();
  if (rawUrl) {
    const m = rawUrl.match(/(?:[?&]v=|youtu\.be\/|embed\/|shorts\/)([a-zA-Z0-9_-]{11})/);
    if (m) return m[1];
  }
  return '';
}

async function handleStreamAudio(req: IncomingMessage, res: ServerResponse): Promise<void> {
  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Range, Content-Type');
    res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
    res.end();
    return;
  }

  const url = new URL(req.url || '/', 'http://localhost');
  const id = parseVideoId(url.searchParams);
  if (!id) {
    sendJson(res, 400, { error: 'missing_or_invalid_id' });
    return;
  }

  const warm = url.searchParams.get('warm') === '1';
  const redirect = url.searchParams.get('redirect') === 'true';
  const wantsStream = url.searchParams.get('stream') === 'true' || Boolean(req.headers.range);

  if (warm) {
    const cached = resolvedCache.get(id);
    if (cached && cached.expiresAt > Date.now()) {
      sendJson(res, 200, { status: 'ready', id });
    } else {
      resolveAudio(id).catch(() => {});
      sendJson(res, 202, { status: 'warming', id });
    }
    return;
  }

  const resolved = await resolveAudio(id);
  if (!resolved) {
    if (wantsStream) {
      sendJson(res, 502, { error: 'resolve_failed', id });
    } else {
      sendJson(res, 200, { url: `https://www.youtube.com/watch?v=${id}`, id, fallback: true });
    }
    return;
  }

  if (redirect) {
    res.statusCode = 302;
    res.setHeader('Location', resolved.url);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.end();
    return;
  }

  if (wantsStream) {
    pipeAudio(req, res, id, resolved, 0);
    return;
  }

  sendJson(res, 200, { url: resolved.url, id, source: 'youtube', kind: 'direct_stream', via: resolved.via });
}

/* ------------------------------------------------------------------ */
/* Search                                                              */
/* ------------------------------------------------------------------ */

function parseDuration(text: string): number {
  const parts = (text || '').split(':').map((p) => parseInt(p, 10));
  if (parts.some((n) => Number.isNaN(n))) return 0;
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  return 0;
}

function cleanTitle(raw: string): string {
  const cleaned = raw
    .replace(/\[.*?\]|\(.*?\)/g, (match) => (/official|video|audio|lyrics|hd|4k|song/i.test(match) ? '' : match))
    .replace(/\s{2,}/g, ' ')
    .trim();
  return cleaned || raw;
}

async function searchYouTube(query: string): Promise<SearchTrack[]> {
  const key = query.toLowerCase();
  const hit = searchCache.get(key);
  if (hit && Date.now() - hit.at < 10 * 60 * 1000) return hit.tracks;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), SEARCH_TIMEOUT_MS);
  try {
    const res = await fetch('https://www.youtube.com/youtubei/v1/search?prettyPrint=false', {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': DESKTOP_UA,
        'Accept-Language': 'en-US,en;q=0.9',
      },
      body: JSON.stringify({
        context: { client: { clientName: 'WEB', clientVersion: WEB_CLIENT_VERSION, hl: 'en', gl: 'US' } },
        query: `${query} audio`,
      }),
    });
    if (!res.ok) return [];
    const data: any = await res.json();
    const sections: any[] =
      data?.contents?.twoColumnSearchResultsRenderer?.primaryContents?.sectionListRenderer?.contents || [];

    const tracks: SearchTrack[] = [];
    const seen = new Set<string>();
    for (const section of sections) {
      for (const item of section?.itemSectionRenderer?.contents || []) {
        const v = item?.videoRenderer;
        if (!v?.videoId || seen.has(v.videoId)) continue;
        const durationText: string = v.lengthText?.simpleText || '';
        if (!durationText) continue; // skip live streams
        seen.add(v.videoId);

        const rawTitle: string = (v.title?.runs || []).map((r: any) => r.text).join('') || `${query} Song`;
        tracks.push({
          id: `yt-${v.videoId}`,
          youtubeId: v.videoId,
          title: cleanTitle(rawTitle),
          artist: v.ownerText?.runs?.[0]?.text || 'Official Artist',
          duration: durationText,
          durationSec: parseDuration(durationText),
          coverUrl: `https://img.youtube.com/vi/${v.videoId}/hqdefault.jpg`,
          streamUrl: `https://www.youtube.com/watch?v=${v.videoId}`,
          platform: 'youtube',
          genre: 'YouTube Music',
          badge: 'YouTube Music Full Track',
        });
        if (tracks.length >= 12) break;
      }
      if (tracks.length >= 12) break;
    }

    if (tracks.length > 0) {
      searchCache.set(key, { at: Date.now(), tracks });
      // Start resolving the first results right away so pressing play is instant.
      for (const t of tracks.slice(0, 3)) resolveAudio(t.youtubeId).catch(() => {});
    }
    return tracks;
  } catch {
    return [];
  } finally {
    clearTimeout(timer);
  }
}

async function handleSearch(req: IncomingMessage, res: ServerResponse): Promise<void> {
  const url = new URL(req.url || '/', 'http://localhost');
  const q = (url.searchParams.get('q') || '').trim();
  if (!q || q.length > 200) {
    sendJson(res, 400, { error: 'invalid_query' });
    return;
  }
  sendJson(res, 200, await searchYouTube(q));
}

/* ------------------------------------------------------------------ */
/* Plugin                                                              */
/* ------------------------------------------------------------------ */

type Middlewares = { use: (route: string, fn: (req: IncomingMessage, res: ServerResponse) => void) => void };

function register(middlewares: Middlewares): void {
  middlewares.use('/api/stream-audio', (req, res) => {
    handleStreamAudio(req, res).catch(() => failStream(res, 500));
  });
  middlewares.use('/api/search-youtube', (req, res) => {
    handleSearch(req, res).catch(() => sendJson(res, 500, { error: 'search_failed' }));
  });
}

export function ytAudioProxyPlugin(): Plugin {
  return {
    name: 'miki-yt-audio-proxy',
    configureServer(server) {
      register(server.middlewares as unknown as Middlewares);
    },
    configurePreviewServer(server) {
      register(server.middlewares as unknown as Middlewares);
    },
  };
}
