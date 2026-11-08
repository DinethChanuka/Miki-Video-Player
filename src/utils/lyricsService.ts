/**
 * Synchronized Lyrics Service
 *
 * Powered by the LRCLIB public lyrics database.
 *
 * What was wrong before
 *  - Every lookup shared ONE 4.5 s timer, so a slow first request starved the fallback.
 *  - A network failure or timeout was cached as "no lyrics" for the whole session, so lyrics
 *    never loaded again for that song.
 *  - YouTube titles like "Samjhawan (Full Song) - Arijit Singh & Shreya Ghoshal" with the
 *    channel "Sony Music India" as artist never matched anything.
 *  - Any result was accepted, even for a different song.
 *  - Lines with two timestamps and 1-digit minutes were not parsed.
 *
 * Now
 *  - Several lookups run at the same time; the first good synced result wins.
 *  - Results must actually match the song title (and are ranked by artist and duration).
 *  - Failures are not cached. "Really not found" is cached for 30 minutes only.
 *  - Found lyrics are kept in localStorage, so repeat plays show lyrics instantly.
 */

export interface LyricLine {
  timeMs: number;
  text: string;
}

export interface LyricsResult {
  trackName: string;
  artistName: string;
  syncedLyrics: LyricLine[] | null;
  plainLyrics: string | null;
  source: string;
}

const API = 'https://lrclib.net/api';
const LOOKUP_TIMEOUT_MS = 6000;
const NEGATIVE_TTL_MS = 30 * 60 * 1000;
const STORAGE_KEY = 'miki_lyrics_cache_v1';
const MAX_STORED = 80;

const memoryCache = new Map<string, { at: number; value: LyricsResult | null }>();
const inflight = new Map<string, Promise<LyricsResult | null>>();
let storedCache: Record<string, LyricsResult> | null = null;

/* ------------------------------------------------------------------ */
/* Title cleaning                                                      */
/* ------------------------------------------------------------------ */

/**
 * Cleans YouTube/Music video titles to isolate true track title and artist
 * e.g. "Digvijaya (දිග්විජය) Theme Song | Official Music Video | Pradeep Rangana" -> title: "Digvijaya", artist: "Pradeep Rangana"
 */
export function cleanTrackSearchQuery(rawTitle: string, rawArtist?: string): { trackTitle: string; artist: string } {
  if (!rawTitle) return { trackTitle: '', artist: rawArtist || '' };

  let title = rawTitle;
  let artist = rawArtist || '';

  // Remove common YouTube suffixes and junk in brackets/parentheses
  title = title
    .replace(/\s*[\(\[](?:Official\s*(?:Music\s*)?Video|Full\s*(?:Song\s*)?Audio|Audio|Video|Lyric\s*Video|HD|4K|Lyrics)[\)\]]/gi, '')
    .replace(/\s*[\(\[][^\)\]]*[\)\]]/g, '') // remove non-latin or extra info in parens and brackets
    .trim();

  // If title has pipes or dashes: e.g. "Title | Tag | Artist" or "Artist - Title"
  if (title.includes(' | ')) {
    const parts = title.split(' | ').map((p) => p.trim());
    if (parts.length >= 2) {
      title = parts[0];
      // Check if trailing part is artist or tags
      const lastPart = parts[parts.length - 1];
      if (!lastPart.toLowerCase().includes('video') && !lastPart.toLowerCase().includes('audio')) {
        artist = lastPart;
      }
    }
  } else if (title.includes(' - ')) {
    const parts = title.split(' - ').map((p) => p.trim());
    if (parts.length >= 2) {
      if (!artist || artist === 'YouTube Music' || artist === 'Official Artist') {
        artist = parts[0];
        title = parts[1];
      }
    }
  }

  // Remove trailing "Title Song", "Theme Song", "Full Song"
  title = title.replace(/\s*(?:Title\s*Song|Theme\s*Song|Full\s*Song|Song)\s*$/i, '').trim();

  return {
    trackTitle: title || rawTitle,
    artist: artist && artist !== 'YouTube Music' ? artist : '',
  };
}

const GENERIC_ARTIST =
  /\b(music|records?|series|vevo|official|studio|studios|entertainment|label|topic|channel|youtube|audio|lyrics?|films?|company)\b/i;

const NOISE_WORDS =
  /\b(?:best\s+)?(?:full\s+)?(?:video\s+|audio\s+|lyrical\s+)?song\b|\bofficial\s*(?:music\s*)?(?:video|audio)\b|\blyrical(?:\s*video)?\b|\blyric\s*video\b|\btitle\s*(?:song|track)\b|\btheme\s*song\b|\bfull\s*audio\b|\bhd\b|\b4k\b/gi;

function stripNoise(s: string): string {
  return s
    .replace(/[\(\[][^\)\]]*[\)\]]/g, ' ')
    .replace(NOISE_WORDS, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function normalize(s: string): string {
  return (s || '')
    .toLowerCase()
    .replace(/[^\p{L}\p{N} ]+/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function unique(list: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const item of list) {
    const key = normalize(item);
    if (key && !seen.has(key)) {
      seen.add(key);
      out.push(item.trim());
    }
  }
  return out;
}

interface Candidates {
  titles: string[];
  artists: string[];
  segments: string[];
}

function buildCandidates(rawTitle: string, rawArtist?: string): Candidates {
  const segments = rawTitle
    .split(/\s+[-–—|]\s+|\s*\|\s*/)
    .map(stripNoise)
    .filter((s) => s.length > 0);

  const classic = cleanTrackSearchQuery(rawTitle, rawArtist);
  const channelArtist = rawArtist && !GENERIC_ARTIST.test(rawArtist) ? rawArtist : '';

  const titles = unique([segments[0] || '', stripNoise(classic.trackTitle), segments[1] || '']).slice(0, 3);
  const artists = unique([channelArtist, classic.artist, segments[1] || '', segments[2] || '']).filter(
    (a) => !GENERIC_ARTIST.test(a)
  );

  return { titles, artists, segments };
}

/* ------------------------------------------------------------------ */
/* LRC parsing                                                         */
/* ------------------------------------------------------------------ */

/**
 * Parses standard LRC format: `[mm:ss.xx] line of text` into sorted LyricLine array.
 * Accepts 1-3 digit minutes, optional fractions, several timestamps on one line and
 * ignores metadata tags such as [ar:...] and word-level <mm:ss.xx> marks.
 */
export function parseLrcLyrics(lrc: string): LyricLine[] {
  if (!lrc || typeof lrc !== 'string') return [];

  const lines: LyricLine[] = [];
  for (const raw of lrc.split(/\r?\n/)) {
    const stampRegex = /\[(\d{1,3}):(\d{1,2})(?:[.:](\d{1,3}))?\]/g;
    const stamps: Array<[number, number, number]> = [];
    let m: RegExpExecArray | null;
    while ((m = stampRegex.exec(raw)) !== null) {
      const frac = m[3] ? parseInt(m[3].padEnd(3, '0').slice(0, 3), 10) : 0;
      stamps.push([parseInt(m[1], 10), parseInt(m[2], 10), frac]);
    }
    if (stamps.length === 0) continue;

    const text = raw.replace(/\[[^\]]*\]/g, '').replace(/<[^>]*>/g, '').trim();
    if (!text) continue;

    for (const [min, sec, frac] of stamps) {
      lines.push({ timeMs: min * 60000 + sec * 1000 + frac, text });
    }
  }

  return lines.sort((a, b) => a.timeMs - b.timeMs);
}

/* ------------------------------------------------------------------ */
/* Persistent cache                                                    */
/* ------------------------------------------------------------------ */

function loadStored(): Record<string, LyricsResult> {
  if (storedCache) return storedCache;
  storedCache = {};
  try {
    if (typeof localStorage !== 'undefined') {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) storedCache = JSON.parse(raw) || {};
    }
  } catch {
    storedCache = {};
  }
  return storedCache!;
}

function saveStored(key: string, value: LyricsResult): void {
  const store = loadStored();
  delete store[key];
  store[key] = value;
  const keys = Object.keys(store);
  if (keys.length > MAX_STORED) {
    for (const k of keys.slice(0, keys.length - MAX_STORED)) delete store[k];
  }
  try {
    if (typeof localStorage !== 'undefined') localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch {
    // storage full or unavailable
  }
}

/* ------------------------------------------------------------------ */
/* Lookup                                                              */
/* ------------------------------------------------------------------ */

interface LrcItem {
  trackName?: string;
  artistName?: string;
  duration?: number;
  instrumental?: boolean;
  syncedLyrics?: string | null;
  plainLyrics?: string | null;
}

function titleMatches(resultName: string | undefined, titles: string[]): boolean {
  const n = normalize(resultName || '');
  if (n.length < 2) return false;
  return titles.some((t) => {
    const c = normalize(t);
    if (c.length < 2) return false;
    return n === c || (c.length >= 3 && n.includes(c)) || (n.length >= 3 && c.includes(n));
  });
}

function scoreItem(item: LrcItem, cands: Candidates, durationSec?: number): number {
  if (item.instrumental) return -100;
  if (!item.syncedLyrics && !item.plainLyrics) return -100;
  if (!titleMatches(item.trackName, cands.titles)) return -100;

  let score = item.syncedLyrics ? 10 : 0;
  const artistName = normalize(item.artistName || '');
  if (artistName && cands.artists.some((a) => {
    const c = normalize(a);
    return c.length > 1 && (artistName.includes(c) || c.includes(artistName));
  })) {
    score += 4;
  }
  if (durationSec && durationSec > 0 && item.duration && item.duration > 0) {
    const diff = Math.abs(item.duration - durationSec);
    score += diff <= 3 ? 5 : diff <= 8 ? 2 : diff > 20 ? -4 : 0;
  }
  return score;
}

function toResult(item: LrcItem, fallbackTitle: string, fallbackArtist: string): LyricsResult | null {
  const synced = item.syncedLyrics ? parseLrcLyrics(item.syncedLyrics) : [];
  const plain = item.plainLyrics || null;
  if (synced.length === 0 && !plain) return null;
  return {
    trackName: item.trackName || fallbackTitle,
    artistName: item.artistName || fallbackArtist || 'Unknown Artist',
    syncedLyrics: synced.length > 0 ? synced : null,
    plainLyrics: plain,
    source: 'LRCLIB Public Database',
  };
}

function currentDurationSec(): number | undefined {
  if (typeof document === 'undefined') return undefined;
  const el = document.getElementById('aether-video-viewport') as HTMLMediaElement | null;
  const d = el?.duration;
  return d && Number.isFinite(d) && d > 0 ? d : undefined;
}

async function lookupLyrics(
  rawTitle: string,
  rawArtist: string | undefined,
  durationSec: number | undefined
): Promise<{ result: LyricsResult | null; networkFailed: boolean }> {
  const cands = buildCandidates(rawTitle, rawArtist);
  const title0 = cands.titles[0] || rawTitle;
  const artist0 = cands.artists[0] || '';

  const controller = new AbortController();
  let networkFailed = false;
  let successfulRequests = 0;

  const getJson = async (url: string): Promise<any | null> => {
    try {
      const res = await fetch(url, { signal: controller.signal });
      if (res.status === 404) {
        successfulRequests++;
        return null;
      }
      if (!res.ok) {
        networkFailed = true;
        return null;
      }
      successfulRequests++;
      return await res.json();
    } catch {
      if (!controller.signal.aborted) networkFailed = true;
      return null;
    }
  };

  const qs = (obj: Record<string, string>) => new URLSearchParams(obj).toString();
  const tasks: Array<() => Promise<LrcItem[]>> = [];

  // Exact lookups (the cached endpoint answers from LRCLIB's database only, so it is quick)
  const exact = { track_name: title0, ...(artist0 ? { artist_name: artist0 } : {}) } as Record<string, string>;
  if (durationSec) exact.duration = String(Math.round(durationSec));
  tasks.push(async () => {
    const d = await getJson(`${API}/get-cached?${qs(exact)}`);
    return d && !Array.isArray(d) ? [d] : [];
  });
  tasks.push(async () => {
    const d = await getJson(`${API}/get?${qs(exact)}`);
    return d && !Array.isArray(d) ? [d] : [];
  });

  // Search lookups
  const searchTask = (params: Record<string, string>) => async (): Promise<LrcItem[]> => {
    const d = await getJson(`${API}/search?${qs(params)}`);
    return Array.isArray(d) ? d : [];
  };
  tasks.push(searchTask({ track_name: title0, ...(artist0 ? { artist_name: artist0 } : {}) }));
  tasks.push(searchTask({ q: `${title0} ${artist0}`.trim() }));
  if (artist0) tasks.push(searchTask({ q: title0 }));
  if (cands.segments[1] && cands.segments[1] !== title0) tasks.push(searchTask({ q: cands.segments[1] }));

  const pool: LrcItem[] = [];
  const pickBest = (): { item: LrcItem; score: number } | null => {
    let best: { item: LrcItem; score: number } | null = null;
    for (const item of pool) {
      const score = scoreItem(item, cands, durationSec);
      if (score > -100 && (!best || score > best.score)) best = { item, score };
    }
    return best;
  };

  const best = await new Promise<{ item: LrcItem; score: number } | null>((resolve) => {
    let pending = tasks.length;
    let finished = false;
    const timer = setTimeout(() => finish(pickBest()), LOOKUP_TIMEOUT_MS);

    const finish = (value: { item: LrcItem; score: number } | null) => {
      if (finished) return;
      finished = true;
      clearTimeout(timer);
      controller.abort(); // stop the slower duplicate requests
      resolve(value);
    };

    for (const run of tasks) {
      run()
        .then((items) => {
          pool.push(...items);
          const current = pickBest();
          // A synced match for this exact song is good enough: stop waiting for the rest.
          if (current && current.item.syncedLyrics && current.score >= 10) finish(current);
        })
        .catch(() => {})
        .finally(() => {
          pending -= 1;
          if (pending === 0) finish(pickBest());
        });
    }
  });

  if (best) {
    return { result: toResult(best.item, title0, artist0), networkFailed: false };
  }
  // "Not found" only counts if at least one request really got an answer.
  return { result: null, networkFailed: networkFailed && successfulRequests === 0 };
}

/**
 * Fetches lyrics from LRCLIB. Never throws.
 * durationSec is optional; when omitted the duration of the playing media element is used.
 */
export async function fetchTrackLyrics(
  title: string,
  rawArtist?: string,
  durationSec?: number
): Promise<LyricsResult | null> {
  if (!title) return null;
  const { trackTitle, artist } = cleanTrackSearchQuery(title, rawArtist);
  const cacheKey = `${normalize(trackTitle)}___${normalize(artist)}`;

  const mem = memoryCache.get(cacheKey);
  if (mem && (mem.value || Date.now() - mem.at < NEGATIVE_TTL_MS)) return mem.value;

  const stored = loadStored()[cacheKey];
  if (stored) {
    memoryCache.set(cacheKey, { at: Date.now(), value: stored });
    return stored;
  }

  const running = inflight.get(cacheKey);
  if (running) return running;

  const task = (async () => {
    try {
      const { result, networkFailed } = await lookupLyrics(title, rawArtist, durationSec ?? currentDurationSec());
      if (result) {
        memoryCache.set(cacheKey, { at: Date.now(), value: result });
        saveStored(cacheKey, result);
      } else if (!networkFailed) {
        memoryCache.set(cacheKey, { at: Date.now(), value: null });
      }
      // On a network failure nothing is cached, so the next attempt retries.
      return result;
    } catch (err) {
      console.warn('[Miki Lyrics] Lookup error:', err);
      return null;
    }
  })().finally(() => inflight.delete(cacheKey));

  inflight.set(cacheKey, task);
  return task;
}
