/**
 * Miki Player - YouTube audio proxy (Vite dev-server middleware)   [version 2]
 * Replaces scripts/ytAudioProxyPlugin.ts from the first fix.
 *
 * Endpoints
 *   GET /api/stream-audio?id=<videoId>&stream=true   -> audio bytes, Range supported
 *   GET /api/stream-audio?id=<videoId>               -> JSON { url, id, ... }
 *   GET /api/stream-audio?id=<videoId>&warm=1        -> resolves in the background, answers at once
 *   GET /api/audio-cache                             -> JSON { files, bytes, downloading }
 *   GET /api/search-youtube?q=<query>                -> JSON array of tracks
 *
 * New in version 2
 *   1. DISK CACHE. The first time a song is played, the whole file is also downloaded to
 *      .miki-cache/audio/<id>.m4a in the background. Every later play (and every seek)
 *      is served straight from disk: instant start, works offline, no YouTube round trip.
 *      While the download is still running, bytes that are already on disk are served
 *      from the partial file, so seeking back never waits on the network.
 *   2. FULL PLAYBACK. If YouTube drops the connection in the middle of a piece, the proxy
 *      reconnects and continues from the exact byte where it stopped (up to 2 times)
 *      instead of cutting the song off.
 *
 * From version 1 (unchanged)
 *   Direct fast-path resolution with yt-dlp as fallback, shared resolution per video,
 *   1 MB range pieces, keep-alive sockets, retry on expired URL, search endpoint.
 *
 * Environment overrides
 *   YT_DLP_PATH              path to the yt-dlp binary (default: ./bin/yt-dlp, then PATH)
 *   MIKI_YT_FAST_PATH=0      disable the direct-request fast path and always use yt-dlp
 *   MIKI_YT_VR_VERSION       client version string used by the fast path
 *   MIKI_AUDIO_CACHE=0       turn the disk cache off
 *   MIKI_AUDIO_CACHE_DIR     cache folder (default: ./.miki-cache/audio)
 *   MIKI_AUDIO_CACHE_MB      total cache size limit in MB (default 1024)
 */

import https from 'node:https';
import fs from 'node:fs';
import path from 'node:path';
import { execFile } from 'node:child_process';
import type { IncomingMessage, ServerResponse, ClientRequest } from 'node:http';
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
const UPSTREAM_TIMEOUT_MS = 15000;
const MAX_CACHE_ENTRIES = 300;
const MAX_RESUMES = 2;

const CACHE_ENABLED = process.env.MIKI_AUDIO_CACHE !== '0';
const CACHE_DIR = process.env.MIKI_AUDIO_CACHE_DIR || path.resolve(process.cwd(), '.miki-cache', 'audio');
const MAX_CACHE_BYTES = Math.max(50, Number(process.env.MIKI_AUDIO_CACHE_MB || 1024)) * 1024 * 1024;
const MAX_TRACK_BYTES = 80 * 1024 * 1024; // do not cache hour-long mixes

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
/* Disk cache                                                          */
/* ------------------------------------------------------------------ */

interface PartialDownload {
  id: string;
  partPath: string;
  size: number | null; // total file size, known after the first piece arrives
  written: number; // contiguous bytes from 0 that are safely on disk
  mime: string;
}

const downloads = new Map<string, PartialDownload>();
let cacheDirReady = false;

function ensureCacheDir(): boolean {
  if (cacheDirReady) return true;
  try {
    fs.mkdirSync(CACHE_DIR, { recursive: true });
    cacheDirReady = true;
  } catch (err) {
    console.warn('[Miki YT proxy] Cannot create cache folder, disk cache disabled:', (err as Error).message);
  }
  return cacheDirReady;
}

const finalPathOf = (id: string) => path.join(CACHE_DIR, `${id}.m4a`);
const metaPathOf = (id: string) => path.join(CACHE_DIR, `${id}.json`);

interface CompleteFile {
  filePath: string;
  size: number;
  mime: string;
}

function getCompleteFile(id: string): CompleteFile | null {
  if (!CACHE_ENABLED) return null;
  try {
    const filePath = finalPathOf(id);
    const stat = fs.statSync(filePath);
    if (!stat.isFile() || stat.size === 0) return null;
    let mime = 'audio/mp4';
    let expected = stat.size;
    try {
      const meta = JSON.parse(fs.readFileSync(metaPathOf(id), 'utf8'));
      if (typeof meta.mime === 'string') mime = meta.mime;
      if (typeof meta.size === 'number') expected = meta.size;
    } catch {
      // no meta: trust the file
    }
    if (expected !== stat.size) return null; // incomplete or damaged
    return { filePath, size: stat.size, mime };
  } catch {
    return null;
  }
}

function evictIfNeeded(): void {
  try {
    const entries = fs
      .readdirSync(CACHE_DIR)
      .filter((f) => f.endsWith('.m4a'))
      .map((f) => {
        const p = path.join(CACHE_DIR, f);
        const st = fs.statSync(p);
        return { id: f.slice(0, -4), path: p, size: st.size, used: st.mtimeMs };
      })
      .sort((a, b) => a.used - b.used);
    let total = entries.reduce((sum, e) => sum + e.size, 0);
    for (const e of entries) {
      if (total <= MAX_CACHE_BYTES) break;
      if (downloads.has(e.id)) continue;
      try {
        fs.unlinkSync(e.path);
        fs.unlinkSync(metaPathOf(e.id));
      } catch {
        // already gone
      }
      total -= e.size;
    }
  } catch {
    // ignore
  }
}

interface RangeResult {
  buf: Buffer;
  total: number | null;
  mime: string;
  wholeFile: boolean;
}

function fetchRange(resolved: ResolvedAudio, start: number, end: number): Promise<RangeResult | null> {
  return new Promise((resolve) => {
    let target: URL;
    try {
      target = new URL(resolved.url);
    } catch {
      resolve(null);
      return;
    }
    const req = https.request(
      target,
      {
        agent,
        method: 'GET',
        headers: {
          'User-Agent': resolved.ua,
          Range: `bytes=${start}-${end}`,
          Accept: '*/*',
          'Accept-Encoding': 'identity',
          Origin: 'https://www.youtube.com',
          Referer: 'https://www.youtube.com/',
        },
      },
      (up) => {
        const status = up.statusCode || 0;
        if (status !== 200 && status !== 206) {
          up.resume();
          resolve(null);
          return;
        }
        const parts: Buffer[] = [];
        up.on('data', (c: Buffer) => parts.push(c));
        up.on('error', () => resolve(null));
        up.on('close', () => {
          if (!up.complete) {
            resolve(null);
            return;
          }
          const buf = Buffer.concat(parts);
          const cr = /\/(\d+)\s*$/.exec(String(up.headers['content-range'] || ''));
          resolve({
            buf,
            total: cr ? Number(cr[1]) : status === 200 ? buf.length : null,
            mime: String(up.headers['content-type'] || resolved.mime),
            wholeFile: status === 200,
          });
        });
      }
    );
    req.setTimeout(UPSTREAM_TIMEOUT_MS, () => req.destroy(new Error('timeout')));
    req.on('error', () => resolve(null));
    req.end();
  });
}

/** Downloads the whole track to disk in 1 MB pieces. Safe to call repeatedly. */
function startDownload(id: string, initial: ResolvedAudio): void {
  if (!CACHE_ENABLED || downloads.has(id) || getCompleteFile(id) || !ensureCacheDir()) return;

  const state: PartialDownload = {
    id,
    partPath: path.join(CACHE_DIR, `${id}.part`),
    size: null,
    written: 0,
    mime: 'audio/mp4',
  };
  downloads.set(id, state);

  (async () => {
    let handle: fs.promises.FileHandle | null = null;
    let ok = false;
    try {
      handle = await fs.promises.open(state.partPath, 'w');
      let resolved = initial;
      let offset = 0;
      let failures = 0;

      while (state.size === null || offset < state.size) {
        const r = await fetchRange(resolved, offset, offset + CHUNK_BYTES - 1);
        if (!r || r.buf.length === 0) {
          failures += 1;
          if (failures > 2) throw new Error('download failed');
          const fresh = await resolveAudio(id, true);
          if (!fresh) throw new Error('re-resolve failed');
          resolved = fresh;
          continue;
        }
        failures = 0;

        if (state.size === null) {
          if (!r.total) throw new Error('unknown size (live stream?)');
          if (r.total > MAX_TRACK_BYTES) throw new Error('track too large to cache');
          state.size = r.total;
          state.mime = r.mime.startsWith('audio/') ? r.mime : 'audio/mp4';
        }
        const writeAt = r.wholeFile ? 0 : offset;
        await handle.write(r.buf, 0, r.buf.length, writeAt);
        offset = writeAt + r.buf.length;
        state.written = offset;
        if (r.wholeFile) break;
      }

      await handle.close();
      handle = null;
      if (state.size === null || state.written !== state.size) throw new Error('size mismatch');

      fs.writeFileSync(metaPathOf(id), JSON.stringify({ mime: state.mime, size: state.size, createdAt: Date.now() }));
      fs.renameSync(state.partPath, finalPathOf(id));
      ok = true;
      evictIfNeeded();
    } catch {
      // keep playing from upstream; just no cache for this track
    } finally {
      if (handle) await handle.close().catch(() => {});
      if (!ok) fs.promises.unlink(state.partPath).catch(() => {});
      downloads.delete(id);
    }
  })();
}

/**
 * Serves a byte range from a file on disk.
 * `available` is how many bytes (from 0) may be read: the whole size for a finished file,
 * the downloaded part for a running download. Returns false if the range is not on disk yet.
 */
function serveFromFile(
  req: IncomingMessage,
  res: ServerResponse,
  filePath: string,
  size: number,
  available: number,
  mime: string
): boolean {
  const header = req.headers.range;
  let start = 0;
  let end = available - 1;
  const complete = available >= size;

  if (header) {
    const m = /^bytes=(\d*)-(\d*)$/.exec(header);
    if (!m) return false;
    if (m[1] === '') {
      if (!complete) return false;
      start = Math.max(0, size - Number(m[2]));
      end = size - 1;
    } else {
      start = Number(m[1]);
      if (m[2] !== '') end = Math.min(Number(m[2]), available - 1);
    }
  } else if (!complete) {
    return false;
  }

  if (start >= size) {
    res.statusCode = 416;
    res.setHeader('Content-Range', `bytes */${size}`);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.end();
    return true;
  }
  if (start > end || start >= available) return false; // not downloaded yet

  res.statusCode = header ? 206 : 200;
  res.setHeader('Content-Type', mime);
  res.setHeader('Accept-Ranges', 'bytes');
  res.setHeader('Content-Length', String(end - start + 1));
  if (header) res.setHeader('Content-Range', `bytes ${start}-${end}/${size}`);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Expose-Headers', 'Content-Length, Content-Range, Accept-Ranges');
  res.setHeader('X-Miki-Source', complete ? 'disk-cache' : 'disk-partial');
  res.setHeader('Cache-Control', 'no-store');

  const stream = fs.createReadStream(filePath, { start, end });
  stream.on('error', () => res.destroy());
  res.on('close', () => stream.destroy());
  stream.pipe(res);

  if (complete) {
    const now = new Date();
    fs.utimes(filePath, now, now, () => {}); // mark as recently used for eviction
  }
  return true;
}

/* ------------------------------------------------------------------ */
/* Streaming proxy                                                     */
/* ------------------------------------------------------------------ */

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

/** Returns the byte window to fetch from upstream, or null for a suffix range. */
function planRange(header: string | undefined): { start: number; end: number } | null {
  if (!header) return { start: 0, end: CHUNK_BYTES - 1 };
  const m = /^bytes=(\d+)-(\d*)$/.exec(header);
  if (!m) return null;
  const start = Number(m[1]);
  const end = m[2] === '' ? start + CHUNK_BYTES - 1 : Math.min(Number(m[2]), start + MAX_RANGE_BYTES - 1);
  return { start, end };
}

function pipeAudio(req: IncomingMessage, res: ServerResponse, id: string, initial: ResolvedAudio): void {
  let closed = false;
  let current: ClientRequest | null = null;
  res.on('close', () => {
    closed = true;
    current?.destroy();
  });

  const plan = planRange(req.headers.range);
  const suffixHeader = plan ? null : req.headers.range || null;
  const baseStart = plan ? plan.start : 0;
  const hardEnd = plan ? plan.end : null;

  let resolved = initial;
  let sent = 0; // body bytes already written to the browser
  let resumes = 0;
  let refreshed = false;
  let headersWritten = false;

  const attempt = (): void => {
    if (closed) return;
    let target: URL;
    try {
      target = new URL(resolved.url);
    } catch {
      failStream(res, 502);
      return;
    }

    const from = baseStart + sent;
    const rangeValue = suffixHeader ? suffixHeader : `bytes=${from}-${hardEnd}`;

    const upstream = https.request(
      target,
      {
        agent,
        method: 'GET',
        headers: {
          'User-Agent': resolved.ua,
          Range: rangeValue,
          Accept: '*/*',
          'Accept-Encoding': 'identity',
          Origin: 'https://www.youtube.com',
          Referer: 'https://www.youtube.com/',
        },
      },
      (up) => {
        const status = up.statusCode || 502;

        // The upstream URL expired or was rejected: resolve a fresh one and retry once.
        if ((status === 403 || status === 404 || status === 410) && !refreshed && !closed) {
          refreshed = true;
          up.resume();
          resolvedCache.delete(id);
          resolveAudio(id, true)
            .then((fresh) => {
              if (closed) return;
              if (fresh) {
                resolved = fresh;
                attempt();
              } else {
                failStream(res, 502);
              }
            })
            .catch(() => failStream(res, 502));
          return;
        }

        if (status >= 400) {
          up.resume();
          failStream(res, 502);
          return;
        }

        if (!headersWritten) {
          headersWritten = true;
          res.statusCode = status;
          res.setHeader('Content-Type', up.headers['content-type'] || resolved.mime);
          res.setHeader('Accept-Ranges', 'bytes');
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.setHeader('Access-Control-Expose-Headers', 'Content-Length, Content-Range, Accept-Ranges');
          res.setHeader('X-Miki-Source', 'upstream');
          res.setHeader('Cache-Control', 'no-store');
          if (up.headers['content-length']) res.setHeader('Content-Length', up.headers['content-length']);
          if (up.headers['content-range']) res.setHeader('Content-Range', up.headers['content-range']);
        }
        const canResume = status === 206 && !suffixHeader;

        up.on('data', (chunk: Buffer) => {
          sent += chunk.length;
          if (!res.write(chunk)) {
            up.pause();
            res.once('drain', () => up.resume());
          }
        });
        up.on('error', () => {});
        up.on('close', () => {
          if (closed) return;
          if (up.complete) {
            res.end();
            return;
          }
          // The connection dropped before the piece was finished: continue from the same byte.
          if (canResume && resumes < MAX_RESUMES) {
            resumes += 1;
            attempt();
          } else {
            res.destroy();
          }
        });
      }
    );

    current = upstream;
    upstream.setTimeout(UPSTREAM_TIMEOUT_MS, () => upstream.destroy(new Error('upstream timeout')));
    upstream.on('error', () => {
      if (closed) return;
      if (!headersWritten) {
        failStream(res, 502);
      }
      // After headers: the 'close' handler of the response above decides about resuming.
    });
    upstream.end();
  };

  attempt();
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
    if (getCompleteFile(id)) {
      sendJson(res, 200, { status: 'cached', id });
      return;
    }
    const cached = resolvedCache.get(id);
    if (cached && cached.expiresAt > Date.now()) {
      sendJson(res, 200, { status: 'ready', id });
    } else {
      resolveAudio(id).catch(() => {});
      sendJson(res, 202, { status: 'warming', id });
    }
    return;
  }

  if (wantsStream && !redirect) {
    // 1. Already downloaded: serve from disk (instant, offline).
    const done = getCompleteFile(id);
    if (done && serveFromFile(req, res, done.filePath, done.size, done.size, done.mime)) return;

    // 2. Download in progress and this range is already on disk.
    const partial = downloads.get(id);
    if (partial && partial.size !== null && partial.written > 0) {
      if (serveFromFile(req, res, partial.partPath, partial.size, partial.written, partial.mime)) return;
    }
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
    startDownload(id, resolved); // keep a copy for next time
    pipeAudio(req, res, id, resolved);
    return;
  }

  sendJson(res, 200, { url: resolved.url, id, source: 'youtube', kind: 'direct_stream', via: resolved.via });
}

function handleCacheInfo(res: ServerResponse): void {
  let files = 0;
  let bytes = 0;
  try {
    for (const f of fs.readdirSync(CACHE_DIR)) {
      if (!f.endsWith('.m4a')) continue;
      files += 1;
      bytes += fs.statSync(path.join(CACHE_DIR, f)).size;
    }
  } catch {
    // folder not created yet
  }
  sendJson(res, 200, { enabled: CACHE_ENABLED, dir: CACHE_DIR, files, bytes, downloading: downloads.size });
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
  middlewares.use('/api/audio-cache', (_req, res) => handleCacheInfo(res));
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
