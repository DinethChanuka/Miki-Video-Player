/**
 * Chunked & Progressive Audio Stream Controller
 * 
 * Provides high-efficiency progressive streaming and persistent local caching for audio playback.
 * - Checks persistent audio cache first for instant (0ms) repeat playback
 * - Binds genuine readiness events (loadeddata / canplay) without premature 250ms race conditions
 * - Performs single-pass streaming download into persistent cache in the background
 * - Automatically bypasses persistent caching for continuous live radio/HLS streams
 */

import { persistentAudioCache, shouldCacheAudioUrl } from '../utils/persistentAudioCache.ts';

export const DEFAULT_CHUNK_SIZE = 256 * 1024; // 256 KB per chunk (~11s of 192kbps MP3)

export interface ChunkedAudioConfig {
  chunkSize?: number;
  maxPreloadChunks?: number;
  onChunkLoaded?: (chunkIndex: number, totalBytes: number) => void;
  onInitialChunkReady?: () => void;
  onError?: (err: Error) => void;
}

export class ChunkedAudioStreamController {
  private chunkSize: number;
  private maxPreloadChunks: number;
  private abortController: AbortController | null = null;
  private activeUrl: string = '';
  private currentChunkIndex: number = 0;
  private totalContentLength: number | null = null;
  private isDestroyed: boolean = false;
  private mediaSource: MediaSource | null = null;
  private sourceBuffer: SourceBuffer | null = null;

  public onChunkLoaded?: (chunkIndex: number, totalBytes: number) => void;
  public onInitialChunkReady?: () => void;
  public onError?: (err: Error) => void;

  constructor(config?: ChunkedAudioConfig) {
    this.chunkSize = config?.chunkSize ?? DEFAULT_CHUNK_SIZE;
    this.maxPreloadChunks = config?.maxPreloadChunks ?? 3;
    this.onChunkLoaded = config?.onChunkLoaded;
    this.onInitialChunkReady = config?.onInitialChunkReady;
    this.onError = config?.onError;
  }

  public getChunkSize(): number {
    return this.chunkSize;
  }

  public getActiveUrl(): string {
    return this.activeUrl;
  }

  public getTotalContentLength(): number | null {
    return this.totalContentLength;
  }

  public getCurrentChunkIndex(): number {
    return this.currentChunkIndex;
  }

  public getMaxPreloadChunks(): number {
    return this.maxPreloadChunks;
  }

  public getSourceBuffer(): SourceBuffer | null {
    return this.sourceBuffer;
  }

  /**
   * Identifies whether a given URL is a direct audio stream or file.
   * Handles standard audio files, streaming CDNs, and Piped/YouTube direct audio streams.
   */
  public static isAudioUrl(url: string): boolean {
    if (!url || typeof url !== 'string') return false;
    const clean = url.split('?')[0].toLowerCase();
    const full = url.toLowerCase();
    return (
      clean.endsWith('.mp3') ||
      clean.endsWith('.ogg') ||
      clean.endsWith('.wav') ||
      clean.endsWith('.flac') ||
      clean.endsWith('.aac') ||
      clean.endsWith('.m4a') ||
      clean.endsWith('.weba') ||
      clean.endsWith('.opus') ||
      full.includes('.mp3') ||
      full.includes('-mp3') ||
      full.includes('.m4a') ||
      full.includes('.aac') ||
      full.includes('.webm') ||
      full.includes('.opus') ||
      full.includes('jamendo') ||
      full.includes('soundcloud') ||
      full.includes('audiomack') ||
      full.includes('bandcamp') ||
      full.includes('apple') ||
      full.includes('/mp3/') ||
      full.includes('mythium') ||
      full.includes('somafm.com') ||
      full.includes('radio.garden') ||
      full.includes('icecast') ||
      full.includes('shoutcast') ||
      // Piped API direct audio stream URLs (googlevideo CDN)
      full.includes('googlevideo.com') ||
      full.includes('piped') ||
      // YouTube direct audio CDN patterns from Piped resolution
      full.includes('mime=audio') ||
      full.includes('itag=') ||
      (full.includes('youtube.com') && full.includes('mime='))
    );
  }

  /**
   * Fetches an isolated byte-range chunk from the remote audio server
   */
  public async fetchChunk(
    url: string,
    startByte: number,
    endByte: number,
    signal?: AbortSignal
  ): Promise<ArrayBuffer> {
    const headers: Record<string, string> = {
      Range: `bytes=${startByte}-${endByte}`,
    };

    const res = await fetch(url, {
      method: 'GET',
      headers,
      signal: signal || this.abortController?.signal,
    });

    if (!res.ok && res.status !== 206) {
      throw new Error(`Failed to fetch audio chunk [${startByte}-${endByte}]: HTTP ${res.status}`);
    }

    const contentRange = res.headers.get('Content-Range');
    if (contentRange) {
      const match = contentRange.match(/\/(\d+)$/);
      if (match && match[1]) {
        this.totalContentLength = parseInt(match[1], 10);
      }
    }

    return await res.arrayBuffer();
  }

  /**
   * Attaches progressive streaming and persistent caching to an HTMLMediaElement
   */
  public async load(
    el: HTMLMediaElement,
    url: string,
    startPositionMs = 0,
    metadata?: Record<string, any>
  ): Promise<void> {
    this.destroy();
    this.isDestroyed = false;
    this.activeUrl = url;
    this.abortController = new AbortController();

    // 1. Check persistent cache first: if already downloaded, play immediately with 0ms delay
    const cachedBlobUrl = await persistentAudioCache.getCachedBlobUrl(url);
    if (cachedBlobUrl && !this.isDestroyed) {
      console.log(`%c[Miki Cache] Playing from persistent local cache: ${url}`, 'color: #10b981; font-weight: bold;');
      el.preload = 'auto';
      el.src = cachedBlobUrl;
      el.load();

      if (startPositionMs > 0) {
        el.currentTime = startPositionMs / 1000;
      }
      if (this.onInitialChunkReady) {
        this.onInitialChunkReady();
      }
      if (typeof window !== 'undefined') {
        import('../store/playerStore')
          .then(({ usePlayerStore }) => usePlayerStore.setState({ isBuffering: false }))
          .catch(() => {});
      }
      return;
    }

    // 2. Uncached track: configure aggressive progressive streaming
    el.preload = 'auto';

    try {
      el.crossOrigin = 'anonymous';
    } catch {
      el.removeAttribute('crossOrigin');
    }

    await new Promise<void>((resolve) => {
      let isResolved = false;

      const triggerReady = () => {
        if (isResolved || this.isDestroyed) return;
        isResolved = true;

        if (startPositionMs > 0) {
          el.currentTime = startPositionMs / 1000;
        }

        if (this.onInitialChunkReady) {
          this.onInitialChunkReady();
        }

        // Auto-dismiss store buffering indicator on first chunk decode
        if (typeof window !== 'undefined') {
          import('../store/playerStore')
            .then(({ usePlayerStore }) => usePlayerStore.setState({ isBuffering: false }))
            .catch(() => {});
        }

        resolve();
      };

      // Listen for genuine readiness events (loadeddata / canplay)
      const onLoadedData = () => {
        el.removeEventListener('loadeddata', onLoadedData);
        el.removeEventListener('canplay', onLoadedData);
        triggerReady();
      };

      el.addEventListener('loadeddata', onLoadedData, { once: true });
      el.addEventListener('canplay', onLoadedData, { once: true });

      // Fallback for CORS restriction on audio servers: strip crossOrigin and reload directly
      const onMediaError = () => {
        el.removeEventListener('error', onMediaError);
        if (el.crossOrigin) {
          el.removeAttribute('crossOrigin');
          el.src = url;
          el.load();
        }
      };
      el.addEventListener('error', onMediaError, { once: true });

      // Safe bounded recovery timeout (5000ms): only triggers if network/decoder stalls
      const recoveryTimer = setTimeout(() => {
        if (!isResolved && !this.isDestroyed) {
          console.warn('[ChunkedAudioStreamController] Media readiness timeout after 5000ms; attempting fallback playback start');
          triggerReady();
        }
      }, 5000);

      const cleanup = () => clearTimeout(recoveryTimer);
      el.addEventListener('loadeddata', cleanup, { once: true });
      el.addEventListener('canplay', cleanup, { once: true });

      // Set source and initiate browser progressive streaming
      el.src = url;
      el.load();
    });

    // 3. Concurrently stream complete track into persistent cache in background (single download)
    if (shouldCacheAudioUrl(url)) {
      this.streamToCacheInBackground(url, metadata);
    }
  }

  /**
   * Background worker: downloads complete track once and stores in persistentAudioCache.
   * Cancels cleanly if destroyed or if song changes.
   */
  private async streamToCacheInBackground(url: string, metadata?: Record<string, any>): Promise<void> {
    if (this.isDestroyed || !this.abortController) return;

    try {
      const response = await fetch(url, {
        signal: this.abortController.signal,
      });

      if (!response.ok || !response.body) {
        return;
      }

      const reader = response.body.getReader();
      const chunks: Uint8Array[] = [];
      let totalReceived = 0;
      let chunkIdx = 0;

      while (!this.isDestroyed) {
        const { done, value } = await reader.read();
        if (done) break;

        if (value) {
          chunks.push(value);
          totalReceived += value.byteLength;
          chunkIdx++;
          this.currentChunkIndex = chunkIdx;
          if (this.onChunkLoaded) {
            this.onChunkLoaded(chunkIdx, totalReceived);
          }
        }
      }

      if (!this.isDestroyed && totalReceived > 0) {
        // Assemble complete audio buffer
        const fullBuffer = new Uint8Array(totalReceived);
        let offset = 0;
        for (const chunk of chunks) {
          fullBuffer.set(chunk, offset);
          offset += chunk.byteLength;
        }

        const contentType = response.headers.get('content-type') || 'audio/mp4';
        const etag = response.headers.get('etag') || undefined;

        await persistentAudioCache.saveTrack(url, url, fullBuffer.buffer, {
          ...metadata,
          contentType,
          etag,
          totalBytes: totalReceived,
        });

        console.log(`%c[Miki Cache] Successfully cached complete track (${(totalReceived / (1024 * 1024)).toFixed(2)} MB): ${url}`, 'color: #10b981;');
      }
    } catch {
      // Aborted or cancelled cleanly on track change/destroy
    }
  }

  public destroy(): void {
    this.isDestroyed = true;
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
    }
    if (this.mediaSource && this.mediaSource.readyState === 'open') {
      try {
        this.mediaSource.endOfStream();
      } catch {}
    }
    this.mediaSource = null;
    this.sourceBuffer = null;
    this.activeUrl = '';
  }
}
