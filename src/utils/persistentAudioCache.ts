/**
 * Persistent Audio Stream & Offline Local Cache Pipeline
 * 
 * High-performance binary storage in IndexedDB (miki_audio_persistent_cache_v3)
 * storing complete audio blobs, ETags, content types, and timestamps.
 * 
 * Features:
 * - Instant (0ms) playback from local blob URLs on cache hit
 * - 100% offline playback support for cached tracks
 * - Live radio and HLS stream bypass (never caches infinite live radio)
 * - Automatic LRU eviction on storage limits (500MB / 150 tracks)
 * - Safe Blob URL management with automatic revocation
 */

export interface CachedAudioMetadata {
  title?: string;
  artist?: string;
  coverUrl?: string;
  durationSec?: number;
  contentType?: string;
  etag?: string;
  lastModified?: string;
  totalBytes?: number;
}

export interface CachedAudioRecord extends CachedAudioMetadata {
  id: string;
  url: string;
  data: ArrayBuffer;
  size: number;
  createdAt: number;
  lastAccessedAt: number;
}

const DB_NAME = 'miki_audio_persistent_cache_v3';
const DB_VERSION = 1;
const STORE_NAME = 'cached_tracks';

const MAX_CACHED_TRACKS = 150;
const MAX_CACHED_BYTES = 500 * 1024 * 1024; // 500 MB

/**
 * Checks whether a URL represents a continuous live radio or live HLS stream.
 * Live streams should never be saved to persistent song storage.
 */
export function isLiveStreamUrl(url: string): boolean {
  if (!url) return false;
  const lower = url.toLowerCase();
  return (
    lower.includes('.m3u8') ||
    lower.includes('icecast') ||
    lower.includes('shoutcast') ||
    lower.includes('somafm.com') ||
    lower.includes('radio.garden') ||
    lower.includes('stream.radioparadise.com') ||
    lower.includes('.pls') ||
    lower.includes('stream=live') ||
    lower.includes('/live/') ||
    lower.includes('live-radio')
  );
}

/**
 * Determines whether a URL is suitable for persistent audio caching.
 */
export function shouldCacheAudioUrl(url: string): boolean {
  if (!url) return false;
  if (url.startsWith('blob:') || url.startsWith('data:')) return false;
  return !isLiveStreamUrl(url);
}

// In-memory fallback cache (used in Node testing or if IndexedDB is blocked)
const memoryRecordStore = new Map<string, CachedAudioRecord>();
const activeBlobUrls = new Map<string, string>();

function getIndexedDB(): IDBFactory | null {
  if (typeof window !== 'undefined' && window.indexedDB) {
    return window.indexedDB;
  }
  if (typeof globalThis !== 'undefined' && (globalThis as any).indexedDB) {
    return (globalThis as any).indexedDB;
  }
  return null;
}

function openDatabase(): Promise<IDBDatabase | null> {
  const idb = getIndexedDB();
  if (!idb) return Promise.resolve(null);

  return new Promise((resolve) => {
    try {
      const request = idb.open(DB_NAME, DB_VERSION);
      request.onupgradeneeded = (event: any) => {
        const db = event.target.result as IDBDatabase;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
          store.createIndex('by_url', 'url', { unique: false });
          store.createIndex('by_access', 'lastAccessedAt', { unique: false });
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => {
        console.warn('[PersistentAudioCache] Failed to open IndexedDB:', request.error);
        resolve(null);
      };
    } catch (err) {
      console.warn('[PersistentAudioCache] Open DB error:', err);
      resolve(null);
    }
  });
}

export const persistentAudioCache = {
  /**
   * Saves an audio binary buffer with metadata into persistent cache
   */
  async saveTrack(
    id: string,
    url: string,
    data: ArrayBuffer | Uint8Array,
    metadata: CachedAudioMetadata = {}
  ): Promise<void> {
    if (!id || !url || !data) return;
    if (!shouldCacheAudioUrl(url)) return;

    const buffer: ArrayBuffer =
      data instanceof ArrayBuffer
        ? data
        : (data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength) as ArrayBuffer);

    const now = Date.now();
    const record: CachedAudioRecord = {
      id: id.trim(),
      url: url.trim(),
      data: buffer,
      size: buffer.byteLength,
      createdAt: now,
      lastAccessedAt: now,
      title: metadata.title,
      artist: metadata.artist,
      coverUrl: metadata.coverUrl,
      durationSec: metadata.durationSec,
      contentType: metadata.contentType || 'audio/mpeg',
      etag: metadata.etag,
      lastModified: metadata.lastModified,
      totalBytes: metadata.totalBytes ?? buffer.byteLength,
    };

    memoryRecordStore.set(record.id, record);

    const db = await openDatabase();
    if (db) {
      try {
        await new Promise<void>((resolve, reject) => {
          const tx = db.transaction(STORE_NAME, 'readwrite');
          const store = tx.objectStore(STORE_NAME);
          store.put(record);
          tx.oncomplete = () => resolve();
          tx.onerror = () => reject(tx.error);
        });
      } catch (err) {
        console.warn('[PersistentAudioCache] Save error:', err);
      } finally {
        db.close();
      }
    }

    // Check capacity and evict oldest if needed
    await this.evictOldest(MAX_CACHED_TRACKS, MAX_CACHED_BYTES).catch(() => {});
  },

  /**
   * Retrieves a cached track record by track ID or URL
   */
  async getCachedTrack(idOrUrl: string): Promise<CachedAudioRecord | null> {
    if (!idOrUrl) return null;
    const key = idOrUrl.trim();

    // Check memory store first
    if (memoryRecordStore.has(key)) {
      const record = memoryRecordStore.get(key)!;
      record.lastAccessedAt = Date.now();
      return record;
    }

    for (const record of memoryRecordStore.values()) {
      if (record.url === key) {
        record.lastAccessedAt = Date.now();
        return record;
      }
    }

    const db = await openDatabase();
    if (!db) return null;

    try {
      const record = await new Promise<CachedAudioRecord | null>((resolve) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);

        // Try direct ID lookup
        const idReq = store.get(key);
        idReq.onsuccess = () => {
          if (idReq.result) {
            const item = idReq.result as CachedAudioRecord;
            item.lastAccessedAt = Date.now();
            store.put(item);
            resolve(item);
          } else {
            // Try lookup by url index
            const urlIndex = store.index('by_url');
            const urlReq = urlIndex.get(key);
            urlReq.onsuccess = () => {
              if (urlReq.result) {
                const item = urlReq.result as CachedAudioRecord;
                item.lastAccessedAt = Date.now();
                store.put(item);
                resolve(item);
              } else {
                resolve(null);
              }
            };
            urlReq.onerror = () => resolve(null);
          }
        };
        idReq.onerror = () => resolve(null);
      });

      if (record) {
        memoryRecordStore.set(record.id, record);
      }
      return record;
    } catch {
      return null;
    } finally {
      db.close();
    }
  },

  /**
   * Returns a local object URL (blob:...) for the track if cached, or null.
   */
  async getCachedBlobUrl(idOrUrl: string): Promise<string | null> {
    const record = await this.getCachedTrack(idOrUrl);
    if (!record || !record.data) return null;

    if (activeBlobUrls.has(record.id)) {
      return activeBlobUrls.get(record.id)!;
    }

    if (typeof URL !== 'undefined' && typeof URL.createObjectURL === 'function') {
      try {
        const blob = new Blob([record.data], { type: record.contentType || 'audio/mpeg' });
        const blobUrl = URL.createObjectURL(blob);
        activeBlobUrls.set(record.id, blobUrl);
        return blobUrl;
      } catch (err) {
        console.warn('[PersistentAudioCache] Create blob URL error:', err);
      }
    }
    return null;
  },

  /**
   * Checks if an audio track exists in cache
   */
  async hasTrack(idOrUrl: string): Promise<boolean> {
    const record = await this.getCachedTrack(idOrUrl);
    return record !== null;
  },

  /**
   * Evicts oldest accessed tracks to remain under limits
   */
  async evictOldest(maxItems = MAX_CACHED_TRACKS, maxBytes = MAX_CACHED_BYTES): Promise<void> {
    // Memory store eviction (enforcing maxItems and maxBytes)
    let totalMemBytes = Array.from(memoryRecordStore.values()).reduce((sum, r) => sum + r.size, 0);
    if (memoryRecordStore.size > maxItems || totalMemBytes > maxBytes) {
      const sorted = Array.from(memoryRecordStore.values()).sort(
        (a, b) => a.lastAccessedAt - b.lastAccessedAt
      );
      while ((sorted.length > maxItems || totalMemBytes > maxBytes) && sorted.length > 0) {
        const toRemove = sorted.shift()!;
        memoryRecordStore.delete(toRemove.id);
        totalMemBytes -= toRemove.size;
        const existingUrl = activeBlobUrls.get(toRemove.id);
        if (existingUrl && typeof URL !== 'undefined' && typeof URL.revokeObjectURL === 'function') {
          URL.revokeObjectURL(existingUrl);
          activeBlobUrls.delete(toRemove.id);
        }
      }
    }

    const db = await openDatabase();
    if (!db) return;

    try {
      const records = await new Promise<CachedAudioRecord[]>((resolve) => {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const req = store.getAll();
        req.onsuccess = () => resolve(req.result || []);
        req.onerror = () => resolve([]);
      });

      let totalDbBytes = records.reduce((sum, r) => sum + r.size, 0);
      if (records.length <= maxItems && totalDbBytes <= maxBytes) return;

      records.sort((a, b) => a.lastAccessedAt - b.lastAccessedAt);
      const toDelete: CachedAudioRecord[] = [];
      let remainingCount = records.length;

      for (const rec of records) {
        if (remainingCount <= maxItems && totalDbBytes <= maxBytes) break;
        toDelete.push(rec);
        remainingCount--;
        totalDbBytes -= rec.size;
      }

      await new Promise<void>((resolve) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        toDelete.forEach((r) => store.delete(r.id));
        tx.oncomplete = () => resolve();
        tx.onerror = () => resolve();
      });
    } catch {
      // Ignore eviction failure
    } finally {
      db.close();
    }
  },

  /**
   * Clears all cached tracks and revokes all active blob URLs
   */
  async clearAll(): Promise<void> {
    if (typeof URL !== 'undefined' && typeof URL.revokeObjectURL === 'function') {
      activeBlobUrls.forEach((url) => {
        try { URL.revokeObjectURL(url); } catch {}
      });
    }
    activeBlobUrls.clear();
    memoryRecordStore.clear();

    const db = await openDatabase();
    if (!db) return;

    try {
      await new Promise<void>((resolve) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        const req = store.clear();
        req.onsuccess = () => resolve();
        req.onerror = () => resolve();
      });
    } catch {
      // Ignore clear failure
    } finally {
      db.close();
    }
  },
};
