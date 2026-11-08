/**
 * YouTube audio pre-warming.
 *
 * The slow part of starting a YouTube track is the server working out the direct
 * audio URL. If we ask for that early (when search results show up, or when the
 * next track in the queue is known), the URL is already cached on the server by
 * the time the user presses play.
 */

const WARM_TTL_MS = 3 * 60 * 60 * 1000; // resolved URLs live ~6h, re-warm after 3h
const warmed = new Map<string, number>();

function apiOrigin(): string {
  if (typeof window !== 'undefined' && window.location?.origin?.startsWith('http')) {
    return window.location.origin;
  }
  return 'http://127.0.0.1:39281';
}

export function extractYouTubeId(input: string): string | null {
  if (!input) return null;
  const trimmed = input.trim();
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) return trimmed;
  const match = trimmed.match(
    /(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  );
  return match ? match[1] : null;
}

/** Fire-and-forget: ask the server to resolve and cache the audio URL for this video. */
export function warmYouTubeAudio(idOrUrl: string): void {
  const id = extractYouTubeId(idOrUrl);
  if (!id) return;

  const last = warmed.get(id);
  if (last && Date.now() - last < WARM_TTL_MS) return;
  warmed.set(id, Date.now());

  if (typeof fetch !== 'function') return;
  try {
    fetch(`${apiOrigin()}/api/stream-audio?id=${encodeURIComponent(id)}&warm=1`, {
      cache: 'no-store',
    }).catch(() => {
      warmed.delete(id);
    });
  } catch {
    warmed.delete(id);
  }
}

/** Warm the first few items of a list (search results, queue). */
export function warmYouTubeAudioBatch(idsOrUrls: string[], limit = 3): void {
  for (const item of idsOrUrls.slice(0, limit)) {
    warmYouTubeAudio(item);
  }
}
