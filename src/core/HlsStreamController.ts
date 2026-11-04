import Hls from 'hls.js';
import { diagnoseStreamFailure, type StreamDiagnosticResult } from './StreamDiagnostics.ts';

export interface StreamQualityLevel {
  id: number;
  name: string;
  height: number;
  width: number;
  bitrate: number;
}

export interface HlsStreamControllerConfig {
  maxNetworkRetries?: number;
  onFatalError?: (diagnostic: StreamDiagnosticResult) => void;
  onManifestParsed?: () => void;
  onLevelChanged?: (level: number) => void;
}

export class HlsStreamController {
  private hls: Hls | null = null;
  private networkRetryCount: number = 0;
  private mediaRetryCount: number = 0;
  private maxNetworkRetries: number;
  private maxMediaRetries: number = 2;
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

  getQualityLevels(): StreamQualityLevel[] {
    if (!this.hls || !this.hls.levels || this.hls.levels.length === 0) {
      return [];
    }
    const levels: StreamQualityLevel[] = [
      { id: -1, name: 'Auto', height: 0, width: 0, bitrate: 0 },
    ];
    this.hls.levels.forEach((lvl, idx) => {
      const name = lvl.height ? `${lvl.height}p` : `Level ${idx + 1}`;
      levels.push({
        id: idx,
        name,
        height: lvl.height || 0,
        width: lvl.width || 0,
        bitrate: lvl.bitrate || 0,
      });
    });
    return levels;
  }

  getCurrentQualityLevel(): number {
    return this.hls ? this.hls.currentLevel : -1;
  }

  setQualityLevel(levelId: number): void {
    if (!this.hls) return;
    this.hls.currentLevel = levelId;
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
      if (typeof window !== 'undefined') {
        import('../store/playerStore')
          .then(({ usePlayerStore }) => {
            usePlayerStore.getState().updateStreamQualityLevels(this.getQualityLevels());
          })
          .catch(() => {});
      }
      if (this.onManifestParsed) {
        this.onManifestParsed();
      }
    });

    this.hls.on(Hls.Events.LEVEL_SWITCHED, (_event, data) => {
      if (typeof window !== 'undefined') {
        import('../store/playerStore')
          .then(({ usePlayerStore }) => {
            usePlayerStore.setState({ currentQualityLevel: data.level });
          })
          .catch(() => {});
      }
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
          const onNativeError = () => {
            videoEl.removeEventListener('error', onNativeError);
            const diag = diagnoseStreamFailure(
              'Native WebKit HLS load failure: ' + (videoEl.error?.message || 'network timeout'),
              undefined,
              uri
            );
            if (this.onFatalError) this.onFatalError(diag);
          };
          videoEl.addEventListener('error', onNativeError, { once: true });
          videoEl.src = uri;
          videoEl.load();
          videoEl.play().catch((err) => {
            if (err.name !== 'AbortError' && err.name !== 'NotAllowedError') {
              onNativeError();
            }
          });
          return;
        }

        switch (data.type) {
          case Hls.ErrorTypes.NETWORK_ERROR:
            if (
              data.details === Hls.ErrorDetails.MANIFEST_LOAD_ERROR ||
              data.details === Hls.ErrorDetails.MANIFEST_LOAD_TIMEOUT
            ) {
              this.destroy();
              const diag = diagnoseStreamFailure(data.details, undefined, uri);
              if (this.onFatalError) this.onFatalError(diag);
              break;
            }
            if (this.handleNetworkError(data.details)) {
              this.hls?.startLoad();
            } else {
              this.destroy();
            }
            break;
          case Hls.ErrorTypes.MEDIA_ERROR:
            if (this.mediaRetryCount < this.maxMediaRetries) {
              this.mediaRetryCount++;
              if (this.mediaRetryCount === 1) {
                this.hls?.recoverMediaError();
              } else {
                this.hls?.swapAudioCodec();
                this.hls?.recoverMediaError();
              }
            } else {
              this.destroy();
              const diag = diagnoseStreamFailure(data.details || 'mediaError', undefined, uri);
              if (this.onFatalError) this.onFatalError(diag);
            }
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
    this.mediaRetryCount = 0;
  }
}
