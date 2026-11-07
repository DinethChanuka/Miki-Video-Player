/**
 * Audio Stream & Artwork Persistent Cache
 * 
 * Stores resolved direct streaming endpoints, track metadata, and cover artwork
 * in memory and localStorage to enable 0-millisecond instant repeat playback.
 */

export interface CachedStreamItem {
  id: string;
  streamUrl: string;
  title: string;
  artist: string;
  coverUrl?: string;
  durationSec?: number;
  timestamp: number;
}

const STORAGE_KEY = 'miki_audio_stream_cache_v2';
const memoryCache = new Map<string, CachedStreamItem>();

// Hydrate from localStorage safely
function loadFromStorage(): void {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed: Record<string, CachedStreamItem> = JSON.parse(raw);
      const now = Date.now();
      // Keep items from last 7 days
      Object.entries(parsed).forEach(([id, item]) => {
        if (now - item.timestamp < 7 * 24 * 3600 * 1000) {
          memoryCache.set(id, item);
        }
      });
    }
  } catch {}
}

function saveToStorage(): void {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    const obj: Record<string, CachedStreamItem> = {};
    // Cap stored cache to 150 tracks
    const entries = Array.from(memoryCache.entries()).slice(-150);
    entries.forEach(([id, item]) => {
      obj[id] = item;
    });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(obj));
  } catch {}
}

// Initial load
loadFromStorage();

export const audioStreamCache = {
  get(id: string): CachedStreamItem | null {
    if (!id) return null;
    const cleanId = id.trim();
    const item = memoryCache.get(cleanId);
    if (!item) return null;
    return item;
  },

  set(id: string, item: Omit<CachedStreamItem, 'timestamp'>): void {
    if (!id) return;
    const cleanId = id.trim();
    const entry: CachedStreamItem = {
      ...item,
      id: cleanId,
      timestamp: Date.now(),
    };
    memoryCache.set(cleanId, entry);
    saveToStorage();

    // Preload cover image into browser image cache if URL is present
    if (typeof window !== 'undefined' && item.coverUrl) {
      const img = new Image();
      img.src = item.coverUrl;
    }
  },

  has(id: string): boolean {
    if (!id) return false;
    return memoryCache.has(id.trim());
  },

  clear(): void {
    memoryCache.clear();
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch {}
    }
  },
};

export { persistentAudioCache, isLiveStreamUrl, shouldCacheAudioUrl } from './persistentAudioCache.ts';


