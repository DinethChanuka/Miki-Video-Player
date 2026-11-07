/**
 * Synchronized Lyrics Service
 * 
 * Powered by LRCLIB public lyrics database with LRC timestamp parsing,
 * fuzzy title cleaning, memory caching, and active line synchronization.
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

// In-memory cache to prevent repeat lookups
const lyricsCache = new Map<string, LyricsResult | null>();

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

/**
 * Parses standard LRC format: `[mm:ss.xx] line of text` into sorted LyricLine array
 */
export function parseLrcLyrics(lrc: string): LyricLine[] {
  if (!lrc || typeof lrc !== 'string') return [];

  const lines: LyricLine[] = [];
  const regex = /\[(\d{2}):(\d{2})(?:\.(\d{2,3}))?\](.*)/g;

  let match: RegExpExecArray | null;
  while ((match = regex.exec(lrc)) !== null) {
    const minutes = parseInt(match[1], 10);
    const seconds = parseInt(match[2], 10);
    const hundredths = match[3] ? parseInt(match[3].padEnd(3, '0').slice(0, 3), 10) : 0;
    const timeMs = minutes * 60 * 1000 + seconds * 1000 + hundredths;
    const text = (match[4] || '').trim();

    if (text) {
      lines.push({ timeMs, text });
    }
  }

  return lines.sort((a, b) => a.timeMs - b.timeMs);
}

/**
 * Fetches lyrics from LRCLIB with memory cache
 */
export async function fetchTrackLyrics(title: string, rawArtist?: string): Promise<LyricsResult | null> {
  const { trackTitle, artist } = cleanTrackSearchQuery(title, rawArtist);
  const cacheKey = `${trackTitle.toLowerCase()}___${artist.toLowerCase()}`;

  if (lyricsCache.has(cacheKey)) {
    return lyricsCache.get(cacheKey) || null;
  }

  try {
    // 1. Try exact match first
    const params = new URLSearchParams();
    params.set('track_name', trackTitle);
    if (artist) {
      params.set('artist_name', artist);
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4500);

    let res = await fetch(`https://lrclib.net/api/get?${params.toString()}`, {
      headers: {
        'User-Agent': 'MikiPlayer/2.0 (https://github.com/Mikey-Player)',
      },
      signal: controller.signal,
    }).catch(() => null);

    let data = res && res.ok ? await res.json() : null;

    // 2. Fallback to fuzzy search query if exact match not found
    if (!data || (!data.syncedLyrics && !data.plainLyrics)) {
      const searchParams = new URLSearchParams({ q: `${trackTitle} ${artist}`.trim() });
      const searchRes = await fetch(`https://lrclib.net/api/search?${searchParams.toString()}`, {
        headers: {
          'User-Agent': 'MikiPlayer/2.0 (https://github.com/Mikey-Player)',
        },
        signal: controller.signal,
      }).catch(() => null);

      if (searchRes && searchRes.ok) {
        const searchResults = await searchRes.json();
        if (Array.isArray(searchResults) && searchResults.length > 0) {
          // Prefer result with syncedLyrics
          data = searchResults.find((r) => r.syncedLyrics) || searchResults[0];
        }
      }
    }

    clearTimeout(timeoutId);

    if (data && (data.syncedLyrics || data.plainLyrics)) {
      const result: LyricsResult = {
        trackName: data.trackName || trackTitle,
        artistName: data.artistName || artist || 'Unknown Artist',
        syncedLyrics: data.syncedLyrics ? parseLrcLyrics(data.syncedLyrics) : null,
        plainLyrics: data.plainLyrics || null,
        source: 'LRCLIB Public Database',
      };
      if (lyricsCache.size > 200) {
        const oldest = lyricsCache.keys().next().value;
        if (oldest) lyricsCache.delete(oldest);
      }
      lyricsCache.set(cacheKey, result);
      return result;
    }
  } catch (err) {
    console.warn('[Miki Lyrics] Fetch error:', err);
  }

  if (lyricsCache.size > 200) {
    const oldest = lyricsCache.keys().next().value;
    if (oldest) lyricsCache.delete(oldest);
  }
  lyricsCache.set(cacheKey, null);
  return null;
}

