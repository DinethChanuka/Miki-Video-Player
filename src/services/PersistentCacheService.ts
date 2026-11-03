/**
 * Persistent Cache Service
 * Two-tiered caching (In-Memory Map + LocalStorage) for zero-latency UI rendering,
 * instant thumbnail retrieval, and fast channel/game menu loading.
 */

interface CacheEntry<T> {
  value: T;
  timestamp: number;
  ttlMs: number;
}

export class PersistentCacheService {
  private static memoryCache: Map<string, CacheEntry<unknown>> = new Map();
  private static prefix = 'miki_cache_';
  private static defaultTtlMs = 24 * 60 * 60 * 1000; // 24 hours

  /**
   * Retrieves a cached value from Memory or LocalStorage.
   * Returns null if not found or expired.
   */
  static get<T>(key: string): T | null {
    const mem = this.memoryCache.get(key) as CacheEntry<T> | undefined;
    const now = Date.now();

    if (mem) {
      if (now - mem.timestamp < mem.ttlMs) {
        return mem.value;
      }
      this.memoryCache.delete(key);
    }

    if (typeof window === 'undefined' || !window.localStorage) {
      return null;
    }

    try {
      const serialized = window.localStorage.getItem(this.prefix + key);
      if (!serialized) return null;

      const entry: CacheEntry<T> = JSON.parse(serialized);
      if (now - entry.timestamp < entry.ttlMs) {
        // Hydrate memory cache
        this.memoryCache.set(key, entry as CacheEntry<unknown>);
        return entry.value;
      }

      window.localStorage.removeItem(this.prefix + key);
    } catch {
      // Storage parsing error or security restriction
    }

    return null;
  }

  /**
   * Persists a key-value pair to Memory and LocalStorage.
   */
  static set<T>(key: string, value: T, ttlMs?: number): void {
    const entry: CacheEntry<T> = {
      value,
      timestamp: Date.now(),
      ttlMs: ttlMs ?? this.defaultTtlMs,
    };

    // Update memory
    this.memoryCache.set(key, entry as CacheEntry<unknown>);

    if (typeof window === 'undefined' || !window.localStorage) {
      return;
    }

    try {
      window.localStorage.setItem(this.prefix + key, JSON.stringify(entry));
    } catch {
      // Quota exceeded: evict older items
      this.pruneOldestEntries();
    }
  }

  /**
   * Removes a specific key from both caches.
   */
  static remove(key: string): void {
    this.memoryCache.delete(key);
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        window.localStorage.removeItem(this.prefix + key);
      } catch {}
    }
  }

  /**
   * Clears all Miki Player cached data.
   */
  static clear(): void {
    this.memoryCache.clear();
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const keysToRemove: string[] = [];
        for (let i = 0; i < window.localStorage.length; i++) {
          const k = window.localStorage.key(i);
          if (k && k.startsWith(this.prefix)) {
            keysToRemove.push(k);
          }
        }
        keysToRemove.forEach((k) => window.localStorage.removeItem(k));
      } catch {}
    }
  }

  private static pruneOldestEntries(): void {
    if (typeof window === 'undefined' || !window.localStorage) return;
    try {
      const keys: string[] = [];
      for (let i = 0; i < window.localStorage.length; i++) {
        const k = window.localStorage.key(i);
        if (k && k.startsWith(this.prefix)) keys.push(k);
      }
      // Remove first 25% of items to relieve pressure
      keys.slice(0, Math.ceil(keys.length * 0.25)).forEach((k) => {
        window.localStorage.removeItem(k);
      });
    } catch {}
  }
}
