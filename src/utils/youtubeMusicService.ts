/**
 * YouTube Music Live Discovery & Search Service
 * Provides direct access to full-length audio tracks, accurate durations,
 * artist/channel attribution, and high-resolution album artwork.
 */

import { warmYouTubeAudioBatch } from './youtubePrefetch.ts';

export interface YouTubeMusicTrack {
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

// Curated verified full tracks for popular music searches (offline resilient & 100% embed-compatible)
export const CURATED_YOUTUBE_TRACKS: Record<string, YouTubeMusicTrack[]> = {
  samjhawan: [
    {
      id: 'yt-H2f7MZaw3Yo',
      youtubeId: 'H2f7MZaw3Yo',
      title: 'Samjhawan (Full Song) - Arijit Singh & Shreya Ghoshal',
      artist: 'Sony Music India',
      duration: '4:26',
      durationSec: 266,
      coverUrl: 'https://img.youtube.com/vi/H2f7MZaw3Yo/hqdefault.jpg',
      streamUrl: 'https://www.youtube.com/watch?v=H2f7MZaw3Yo',
      platform: 'youtube',
      genre: 'Bollywood Romantic',
      badge: 'YouTube Music Full Track',
    },
    {
      id: 'yt-yQ6d627OZig',
      youtubeId: 'yQ6d627OZig',
      title: 'Main Tenu Samjhawan Ki (Full Audio) - Humpty Sharma Ki Dulhania',
      artist: 'Sony Music India',
      duration: '4:29',
      durationSec: 269,
      coverUrl: 'https://img.youtube.com/vi/yQ6d627OZig/hqdefault.jpg',
      streamUrl: 'https://www.youtube.com/watch?v=yQ6d627OZig',
      platform: 'youtube',
      genre: 'Bollywood Romantic',
      badge: 'YouTube Music Full Track',
    },
  ],
  dooriyan: [
    {
      id: 'yt-7z3YeFqd7xQ',
      youtubeId: '7z3YeFqd7xQ',
      title: 'Dooriyan - Full Audio Song | Love Aaj Kal | Mohit Chauhan | Pritam',
      artist: 'Sony Music India',
      duration: '5:34',
      durationSec: 334,
      coverUrl: 'https://img.youtube.com/vi/7z3YeFqd7xQ/hqdefault.jpg',
      streamUrl: 'https://www.youtube.com/watch?v=7z3YeFqd7xQ',
      platform: 'youtube',
      genre: 'Bollywood Classics',
      badge: 'YouTube Music Full Track',
    },
    {
      id: 'yt-kPtn26x8TZM',
      youtubeId: 'kPtn26x8TZM',
      title: 'Dooriyan - Lyrical Video | Love Aaj Kal | Mohit Chauhan | Pritam',
      artist: 'Sony Music India',
      duration: '5:38',
      durationSec: 338,
      coverUrl: 'https://img.youtube.com/vi/kPtn26x8TZM/hqdefault.jpg',
      streamUrl: 'https://www.youtube.com/watch?v=kPtn26x8TZM',
      platform: 'youtube',
      genre: 'Bollywood Classics',
      badge: 'YouTube Music Full Track',
    },
  ],
  saiyaara: [
    {
      id: 'yt-BSJa1UytM8w',
      youtubeId: 'BSJa1UytM8w',
      title: 'Saiyaara Title Song | Tanishk Bagchi, Faheem Abdullah, Arslan Nizami, Irshad Kamil',
      artist: 'YRF',
      duration: '4:08',
      durationSec: 248,
      coverUrl: 'https://img.youtube.com/vi/BSJa1UytM8w/hqdefault.jpg',
      streamUrl: 'https://www.youtube.com/watch?v=BSJa1UytM8w',
      platform: 'youtube',
      genre: 'Bollywood Hits',
      badge: 'YouTube Music Full Track',
    },
    {
      id: 'yt-MQoColHyGzQ',
      youtubeId: 'MQoColHyGzQ',
      title: 'Saiyaara Full Song | Ahaan Panday, Aneet Padda | Tanishk Bagchi',
      artist: 'YRF',
      duration: '5:44',
      durationSec: 344,
      coverUrl: 'https://img.youtube.com/vi/MQoColHyGzQ/hqdefault.jpg',
      streamUrl: 'https://www.youtube.com/watch?v=MQoColHyGzQ',
      platform: 'youtube',
      genre: 'Bollywood Hits',
      badge: 'YouTube Music Full Track',
    },
    {
      id: 'yt-8PbIHTX8QZE',
      youtubeId: '8PbIHTX8QZE',
      title: 'Saiyaara Title Song | Full Song Audio | Tanishk Bagchi, Faheem Abdullah',
      artist: 'Official Music',
      duration: '4:12',
      durationSec: 252,
      coverUrl: 'https://img.youtube.com/vi/8PbIHTX8QZE/hqdefault.jpg',
      streamUrl: 'https://www.youtube.com/watch?v=8PbIHTX8QZE',
      platform: 'youtube',
      genre: 'Bollywood Hits',
      badge: 'YouTube Music Full Track',
    },
  ],
  bintere: [
    {
      id: 'yt-pGuc4hPhiKw',
      youtubeId: 'pGuc4hPhiKw',
      title: 'Bin Tere - Lyrical Song | I Hate Luv Storys | Vishal & Shekhar',
      artist: 'Sony Music India',
      duration: '5:32',
      durationSec: 332,
      coverUrl: 'https://img.youtube.com/vi/pGuc4hPhiKw/hqdefault.jpg',
      streamUrl: 'https://www.youtube.com/watch?v=pGuc4hPhiKw',
      platform: 'youtube',
      genre: 'Romantic',
      badge: 'YouTube Music Full Track',
    },
    {
      id: 'yt-7Eaa-Zg2tYM',
      youtubeId: '7Eaa-Zg2tYM',
      title: 'Bin Tere Best Audio Song - I Hate Luv Storys | Sunidhi Chauhan',
      artist: 'Sony Music India',
      duration: '5:32',
      durationSec: 332,
      coverUrl: 'https://img.youtube.com/vi/7Eaa-Zg2tYM/hqdefault.jpg',
      streamUrl: 'https://www.youtube.com/watch?v=7Eaa-Zg2tYM',
      platform: 'youtube',
      genre: 'Romantic',
      badge: 'YouTube Music Full Track',
    },
  ],
  soniyo: [
    {
      id: 'yt-y1iA6Egisj0',
      youtubeId: 'y1iA6Egisj0',
      title: 'Soniyo Best Audio Song - Raaz The Mystery Continues | Sonu Nigam, Shreya Ghoshal',
      artist: 'Sony Music India',
      duration: '5:31',
      durationSec: 331,
      coverUrl: 'https://img.youtube.com/vi/y1iA6Egisj0/hqdefault.jpg',
      streamUrl: 'https://www.youtube.com/watch?v=y1iA6Egisj0',
      platform: 'youtube',
      genre: 'Bollywood Hits',
      badge: 'YouTube Music Full Track',
    },
  ],
  darkhaast: [
    {
      id: 'yt-fPii4kwD7Zc',
      youtubeId: 'fPii4kwD7Zc',
      title: 'Darkhaast Full Audio Song - Shivaay | Arijit Singh, Sunidhi Chauhan | Mithoon',
      artist: 'T-Series',
      duration: '6:15',
      durationSec: 375,
      coverUrl: 'https://img.youtube.com/vi/fPii4kwD7Zc/hqdefault.jpg',
      streamUrl: 'https://www.youtube.com/watch?v=fPii4kwD7Zc',
      platform: 'youtube',
      genre: 'Bollywood Hits',
      badge: 'YouTube Music Full Track',
    },
    {
      id: 'yt-LMnJp_dSdnw',
      youtubeId: 'LMnJp_dSdnw',
      title: 'Darkhaast Full Video Song - Shivaay | Arijit Singh & Sunidhi Chauhan',
      artist: 'T-Series',
      duration: '7:12',
      durationSec: 432,
      coverUrl: 'https://img.youtube.com/vi/LMnJp_dSdnw/hqdefault.jpg',
      streamUrl: 'https://www.youtube.com/watch?v=LMnJp_dSdnw',
      platform: 'youtube',
      genre: 'Bollywood Hits',
      badge: 'YouTube Music Full Track',
    },
  ],
};

function parseDurationText(text: string): number {
  if (!text) return 210;
  const parts = text.split(':').map((p) => parseInt(p, 10));
  if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
    return parts[0] * 60 + parts[1];
  }
  if (parts.length === 3 && !isNaN(parts[0]) && !isNaN(parts[1]) && !isNaN(parts[2])) {
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  }
  return 210;
}

const YT_SEARCH_CACHE = new Map<string, YouTubeMusicTrack[]>();

// Helper to invoke native macOS Swift IPC for CORS-free YouTube Music queries
function searchViaNativeBridge(cleanQuery: string): Promise<YouTubeMusicTrack[] | null> {
  if (typeof window === 'undefined') return Promise.resolve(null);
  const webkit = (window as unknown as { webkit?: { messageHandlers?: { searchYouTubeMusic?: { postMessage: (msg: any) => void } } } }).webkit;
  if (!webkit?.messageHandlers?.searchYouTubeMusic) return Promise.resolve(null);

  return new Promise((resolve) => {
    const requestId = `yt-req-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const timer = setTimeout(() => {
      window.removeEventListener('miki:youtubeMusicResults', handler as EventListener);
      resolve(null);
    }, 8000);

    const handler = (e: CustomEvent<{ requestId: string; results: YouTubeMusicTrack[] }>) => {
      if (e.detail?.requestId === requestId) {
        clearTimeout(timer);
        window.removeEventListener('miki:youtubeMusicResults', handler as EventListener);
        if (Array.isArray(e.detail.results) && e.detail.results.length > 0) {
          resolve(e.detail.results);
        } else {
          resolve(null);
        }
      }
    };

    window.addEventListener('miki:youtubeMusicResults', handler as EventListener);
    try {
      webkit.messageHandlers?.searchYouTubeMusic?.postMessage({ query: cleanQuery, requestId });
    } catch {
      clearTimeout(timer);
      window.removeEventListener('miki:youtubeMusicResults', handler as EventListener);
      resolve(null);
    }
  });
}

/** Fetches a JSON array of tracks from a local search endpoint. Never throws. */
async function fetchTracksFrom(url: string, timeoutMs: number): Promise<YouTubeMusicTrack[] | null> {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(timeoutMs) });
    if (!res.ok) return null;
    const data = await res.json();
    return Array.isArray(data) && data.length > 0 ? (data as YouTubeMusicTrack[]) : null;
  } catch {
    return null;
  }
}

/** Resolves with the first source that returns tracks; null only when every source failed. */
function firstWithResults(
  sources: Array<Promise<YouTubeMusicTrack[] | null>>
): Promise<YouTubeMusicTrack[] | null> {
  return new Promise((resolve) => {
    let pending = sources.length;
    if (pending === 0) {
      resolve(null);
      return;
    }
    const settleEmpty = () => {
      pending -= 1;
      if (pending === 0) resolve(null);
    };
    for (const source of sources) {
      source
        .then((tracks) => {
          if (tracks && tracks.length > 0) resolve(tracks);
          else settleEmpty();
        })
        .catch(settleEmpty);
    }
  });
}

function rememberAndWarm(cacheKey: string, tracks: YouTubeMusicTrack[]): YouTubeMusicTrack[] {
  YT_SEARCH_CACHE.set(cacheKey, tracks);
  // Resolve the first results on the server now, so pressing play starts at once.
  warmYouTubeAudioBatch(tracks.map((t) => t.youtubeId), 3);
  return tracks;
}

/**
 * Searches live YouTube Music tracks with authentic duration, video IDs, and high-res art.
 *
 * All local sources are asked at the same time and the first one with results wins,
 * instead of waiting for each one to time out in turn.
 */
export async function searchYouTubeMusicLive(query: string): Promise<YouTubeMusicTrack[]> {
  const clean = query.trim();
  if (!clean) return [];

  const cacheKey = clean.toLowerCase();
  if (YT_SEARCH_CACHE.has(cacheKey)) {
    return YT_SEARCH_CACHE.get(cacheKey)!;
  }

  // 1. Curated catalog matches first for an instant response
  const normalized = clean.toLowerCase().replace(/[^a-z0-9]/g, '');
  for (const [key, tracks] of Object.entries(CURATED_YOUTUBE_TRACKS)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return rememberAndWarm(cacheKey, tracks);
    }
  }

  // 2. Same-origin dev server, native LocalAppServer and the macOS bridge, all at once
  const encoded = encodeURIComponent(clean);
  const sources: Array<Promise<YouTubeMusicTrack[] | null>> = [];
  const origin =
    typeof window !== 'undefined' && window.location?.origin?.startsWith('http') ? window.location.origin : '';
  if (origin) {
    sources.push(fetchTracksFrom(`${origin}/api/search-youtube?q=${encoded}`, 6000));
  }
  if (origin !== 'http://127.0.0.1:39281') {
    sources.push(fetchTracksFrom(`http://127.0.0.1:39281/api/search-youtube?q=${encoded}`, 6000));
  }
  sources.push(searchViaNativeBridge(clean));

  const fromLocal = await firstWithResults(sources);
  if (fromLocal) {
    return rememberAndWarm(cacheKey, fromLocal);
  }

  // 3. Direct web fetch (works in environments where CORS is disabled or proxied)
  try {
    const res = await fetch('https://www.youtube.com/youtubei/v1/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(6000),
      body: JSON.stringify({
        context: {
          client: {
            clientName: 'WEB',
            clientVersion: '2.20250801.00.00',
            hl: 'en',
          },
        },
        query: `${clean} audio`,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      const sections: any[] =
        data?.contents?.twoColumnSearchResultsRenderer?.primaryContents?.sectionListRenderer?.contents || [];

      const tracks: YouTubeMusicTrack[] = [];
      const seen = new Set<string>();
      for (const section of sections) {
        for (const item of section?.itemSectionRenderer?.contents || []) {
          const v = item?.videoRenderer;
          if (!v || !v.videoId || seen.has(v.videoId)) continue;
          const durationStr = v.lengthText?.simpleText;
          if (!durationStr) continue; // skip live streams
          seen.add(v.videoId);

          const rawTitle = v.title?.runs?.[0]?.text || `${clean} Song`;
          const rawArtist = v.ownerText?.runs?.[0]?.text || 'Official Artist';
          const durationSec = parseDurationText(durationStr);

          // Clean title of unnecessary clutter
          const cleanTitle = rawTitle
            .replace(/\[.*?\]|\(.*?\)/g, (match: string) => {
              if (/official|video|audio|lyrics|hd|4k|song/i.test(match)) return '';
              return match;
            })
            .trim();

          tracks.push({
            id: `yt-${v.videoId}`,
            youtubeId: v.videoId,
            title: cleanTitle || rawTitle,
            artist: rawArtist,
            duration: durationStr,
            durationSec,
            coverUrl: `https://img.youtube.com/vi/${v.videoId}/hqdefault.jpg`,
            streamUrl: `https://www.youtube.com/watch?v=${v.videoId}`,
            platform: 'youtube',
            genre: 'YouTube Music',
            badge: 'YouTube Music Full Track',
          });

          if (tracks.length >= 10) break;
        }
        if (tracks.length >= 10) break;
      }

      if (tracks.length > 0) {
        return rememberAndWarm(cacheKey, tracks);
      }
    }
  } catch {
    // Network / CORS fallback
  }

  // 4. Nothing found. The old code returned a made-up track that always played the same
  //    unrelated song under the searched title. Returning an empty list lets the caller
  //    fall back to the built-in catalog instead. Empty results are not cached, so the
  //    next attempt retries the network.
  return [];
}
