import Hls from 'hls.js';
import { diagnoseStreamFailure, type StreamDiagnosticResult } from './StreamDiagnostics.ts';

export interface HlsStreamControllerConfig {
  maxNetworkRetries?: number;
  onFatalError?: (diagnostic: StreamDiagnosticResult) => void;
  onManifestParsed?: () => void;
  onLevelChanged?: (level: number) => void;
}

export class HlsStreamController {
  private hls: Hls | null = null;
  private networkRetryCount: number = 0;
  private maxNetworkRetries: number;
  private onFatalError?: (diagnostic: StreamDiagnosticResult) => void;
  private onManifestParsed?: () => void;
  private onLevelChanged?: (level: number) => void;
  private currentUri: string = '';

  constructor(config?: HlsStreamControllerConfig) {
    this.maxNetworkRetries = config?.maxNetworkRetries ?? 3;
    this.onFatalError = config?.onFatalError;
    this.onManifestParsed = config?.onManifestParsed;
    this.onLevelChanged = config?.onLevelChanged;
  }

  static isHlsUrl(url: string): boolean {
    if (!url || typeof url !== 'string') return false;
    const clean = url.split('?')[0].toLowerCase();
    return (
      clean.endsWith('.m3u8') ||
      clean.endsWith('.m3u') ||
      url.includes('/hls/') ||
      url.includes('master.m3u8') ||
      url.includes('playlist.m3u8')
    );
  }

  getNetworkRetryCount(): number {
    return this.networkRetryCount;
  }

  getHlsInstance(): Hls | null {
    return this.hls;
  }

  handleNetworkError(details?: string): boolean {
    if (this.networkRetryCount < this.maxNetworkRetries) {
      this.networkRetryCount++;
      return true;
    }

    // Retries exhausted -> escalate to failover
    const diag = diagnoseStreamFailure(details || 'manifestLoadError', undefined, this.currentUri);
    if (this.onFatalError) {
      this.onFatalError(diag);
    }
    return false;
  }

  load(
    videoEl: HTMLVideoElement,
    uri: string,
    startPositionMs: number = 0
  ): boolean {
    this.destroy();
    this.currentUri = uri;
    this.networkRetryCount = 0;

    // Check if Hls.js is supported in this environment
    if (!Hls.isSupported()) {
      if (videoEl.canPlayType('application/vnd.apple.mpegurl')) {
        videoEl.src = uri;
        videoEl.load();
        if (startPositionMs > 0) {
          videoEl.currentTime = startPositionMs / 1000;
        }
        return true;
      }
      const diag = diagnoseStreamFailure('HLS is not supported by this browser engine.', undefined, uri);
      if (this.onFatalError) this.onFatalError(diag);
      return false;
    }

    this.hls = new Hls({
      enableWorker: true,
      lowLatencyMode: true,
      startFragPrefetch: true,
      backBufferLength: 90,
      maxBufferLength: 60,
      maxMaxBufferLength: 120,
      maxBufferSize: 60 * 1024 * 1024,
      progressive: true,
      fragLoadingTimeOut: 20000,
      manifestLoadingTimeOut: 15000,
      levelLoadingTimeOut: 15000,
      fragLoadingMaxRetry: 3,
      manifestLoadingMaxRetry: 3,
      levelLoadingMaxRetry: 3,
      fragLoadingRetryDelay: 1000,
      manifestLoadingRetryDelay: 1000,
      levelLoadingRetryDelay: 1000,
    });

    this.hls.loadSource(uri);
    this.hls.attachMedia(videoEl);

    this.hls.on(Hls.Events.MANIFEST_PARSED, () => {
      if (startPositionMs > 0) {
        videoEl.currentTime = startPositionMs / 1000;
      }
      if (this.onManifestParsed) {
        this.onManifestParsed();
      }
    });

    this.hls.on(Hls.Events.LEVEL_SWITCHED, (_event, data) => {
      if (this.onLevelChanged) {
        this.onLevelChanged(data.level);
      }
    });

    this.hls.on(Hls.Events.ERROR, (_event, data) => {
      // Dynamic level healing if a bitrate variant fails
      if (
        data.details === Hls.ErrorDetails.LEVEL_LOAD_ERROR ||
        data.details === Hls.ErrorDetails.LEVEL_LOAD_TIMEOUT
      ) {
        if (this.hls && this.hls.levels && this.hls.levels.length > 1) {
          const nextIdx = Math.max(0, this.hls.currentLevel > 0 ? this.hls.currentLevel - 1 : 0);
          this.hls.nextLevel = nextIdx;
          this.hls.startLoad();
          return;
        }
      }

      if (data.fatal) {
        if (typeof window !== 'undefined') {
          import('../store/playerStore')
            .then(({ usePlayerStore }) => usePlayerStore.setState({ isBuffering: false }))
            .catch(() => {});
        }

        // Native AVPlayer Fallback for WebKit / Safari on CORS or network issues
        if (videoEl.canPlayType('application/vnd.apple.mpegurl')) {
          this.destroy();
          videoEl.src = uri;
          videoEl.load();
          videoEl.play().catch(() => {});
          return;
        }

        switch (data.type) {
          case Hls.ErrorTypes.NETWORK_ERROR:
            if (this.handleNetworkError(data.details)) {
              this.hls?.startLoad();
            } else {
              this.destroy();
            }
            break;
          case Hls.ErrorTypes.MEDIA_ERROR:
            this.hls?.recoverMediaError();
            break;
          default:
            this.destroy();
            const diag = diagnoseStreamFailure(data.details, undefined, uri);
            if (this.onFatalError) this.onFatalError(diag);
            break;
        }
      }
    });

    return true;
  }

  destroy(): void {
    if (this.hls) {
      this.hls.destroy();
      this.hls = null;
    }
    this.networkRetryCount = 0;
  }
}
