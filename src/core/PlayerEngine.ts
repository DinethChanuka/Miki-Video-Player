import { invoke, Channel } from '@tauri-apps/api/core';
import Hls from 'hls.js';
import { SpatialAudioEngine } from './SpatialAudioEngine';
import { HlsStreamController } from './HlsStreamController.ts';
import { ChunkedAudioStreamController } from './ChunkedAudioStreamController.ts';
import { parseYouTubeId } from '../utils/webStreamUtils.ts';

export type EngineType = 'tauri-mpv' | 'web-media';

export type ErrorCode =
  | 'MPV_LIB_MISSING'
  | 'MPV_INIT_FAILED'
  | 'GPU_SURFACE_LOST'
  | 'HW_DEC_FAILED'
  | 'MEDIA_NOT_FOUND'
  | 'CODEC_UNSUPPORTED'
  | 'STREAM_TIMEOUT'
  | 'AUDIO_DSP_INVALID'
  | 'DB_QUERY_FAILED'
  | 'THUMBNAIL_EXTRACT_FAILED'
  | 'IPC_CHANNEL_CLOSED'
  | 'STREAM_ERROR'
  | 'BOOKMARK_SAVED';

export type RecoveryStrategy =
  | 'none'
  | 'retry_with_backoff'
  | 'retry_software_decode'
  | 'fallback_to_web_engine'
  | 'reset_audio_filters'
  | 'skip_to_next_track';

export interface PlayerErrorEnvelope {
  code: ErrorCode;
  message: string;
  details?: string;
  severity: 'warning' | 'recoverable' | 'critical';
  recovery: RecoveryStrategy;
  timestampMs: number;
}

export interface TrackInfo {
  id: string;
  kind: 'audio' | 'subtitle' | 'video';
  label: string;
  language?: string;
  codec?: string;
  selected: boolean;
}

export interface ChapterInfo {
  id: string;
  title: string;
  startTimeMs: number;
  endTimeMs: number;
}

export interface VideoShaderConfig {
  ambientGlowEnabled: boolean;
  brightness: number; // -50 to 50 (%)
  contrast: number; // 0.5 to 1.5
  saturation: number; // 0.0 to 2.0
  sharpness: number; // 0.0 to 2.0
  clarityBoost: number; // 0.0 to 2.0 (Texture detail extraction)
  deNoise: number; // 0.0 to 1.0 (Compression artifact reduction)
  deBanding: boolean; // Color gradation smoothing
  superResolution: 'off' | 'anime4k' | 'clarity-ultra' | 'cinematic-crisp' | 'hdr-enhanced';
  splitCompareEnabled: boolean; // Split-screen before/after
  splitComparePosition: number; // 0 to 100 (%)
  aspectRatio: 'auto' | '16:9' | '4:3' | '21:9' | '1:1' | 'fill';
  upscaleMode: 'none' | 'anime4k-fast' | 'anime4k-hq';
}

export interface PlaybackTelemetry {
  positionMs: number;
  durationMs: number;
  bufferedMs: number;
  isPaused: boolean;
  isBuffering: boolean;
  playbackRate: number;
  volume: number; // 0 to 200 (%)
  isMuted: boolean;
  audioTracks: TrackInfo[];
  subtitleTracks: TrackInfo[];
  chapters: ChapterInfo[];
}

export interface IPlayerEngine {
  readonly engineType: EngineType;
  initialize(container?: HTMLVideoElement): Promise<void>;
  load(uri: string, startPositionMs?: number): Promise<void>;
  play(): Promise<void>;
  pause(): Promise<void>;
  seek(timestampMs: number, exact?: boolean): Promise<void>;
  setVolume(volume: number): Promise<void>;
  setMuted(muted: boolean): Promise<void>;
  setPlaybackRate(rate: number): Promise<void>;
  setAudioTrack(trackId: string): Promise<void>;
  setSubtitleTrack(trackId: string | null): Promise<void>;
  setEqualizer(gainsDb: number[], nightMode: boolean): Promise<void>;
  applyVideoFilter(config: VideoShaderConfig): Promise<void>;
  captureSnapshot?(): string | null;
  getQualityLevels?(): any[];
  setQualityLevel?(level: number): void;
  setDspBypass?(bypass: boolean): void;
  getDspBypass?(): boolean;
  onTelemetry(callback: (telemetry: PlaybackTelemetry) => void): () => void;
  onError(callback: (error: PlayerErrorEnvelope) => void): () => void;
  destroy(): Promise<void>;
}

export function parsePlayerError(err: unknown): PlayerErrorEnvelope {
  if (typeof err === 'object' && err !== null && 'code' in err && 'recovery' in err) {
    return err as PlayerErrorEnvelope;
  }
  return {
    code: 'CODEC_UNSUPPORTED',
    message: err instanceof Error ? err.message : String(err),
    severity: 'recoverable',
    recovery: 'none',
    timestampMs: Date.now(),
  };
}

/**
 * 1. Native Rust + libmpv Engine (Zero-Copy Window Compositor + 60Hz Tauri v2 Channel)
 */
export class TauriMpvEngine implements IPlayerEngine {
  public readonly engineType: EngineType = 'tauri-mpv';
  private telemetryListeners = new Set<(t: PlaybackTelemetry) => void>();
  private errorListeners = new Set<(e: PlayerErrorEnvelope) => void>();
  private channel: Channel<PlaybackTelemetry> | null = null;

  async initialize(): Promise<void> {
    try {
      await invoke('init_native_player');
      this.channel = new Channel<PlaybackTelemetry>();
      this.channel.onmessage = (telemetry) => {
        this.telemetryListeners.forEach((cb) => cb(telemetry));
      };
      await invoke('subscribe_telemetry', { channel: this.channel });
    } catch (err) {
      const parsed = parsePlayerError(err);
      this.emitError(parsed);
      throw parsed;
    }
  }

  async load(uri: string, startPositionMs = 0): Promise<void> {
    try {
      await invoke('load_media_file', { uri, startPositionMs });
    } catch (err) {
      const parsed = parsePlayerError(err);
      this.emitError(parsed);
      throw parsed;
    }
  }

  async play(): Promise<void> {
    await invoke('player_play');
  }

  async pause(): Promise<void> {
    await invoke('player_pause');
  }

  async seek(timestampMs: number, exact = false): Promise<void> {
    await invoke('player_seek', { timestampMs: Math.max(0, Math.round(timestampMs)), exact });
  }

  async setVolume(volume: number): Promise<void> {
    // Allows volume boost up to 200%
    await invoke('player_set_volume', { volume: Math.max(0, Math.min(200, volume)) });
  }

  async setMuted(muted: boolean): Promise<void> {
    await invoke('player_set_muted', { muted });
  }

  async setPlaybackRate(rate: number): Promise<void> {
    await invoke('player_set_rate', { rate: Math.max(0.25, Math.min(4.0, rate)) });
  }

  async setAudioTrack(trackId: string): Promise<void> {
    await invoke('player_set_audio_track', { trackId });
  }

  async setSubtitleTrack(trackId: string | null): Promise<void> {
    await invoke('player_set_subtitle_track', { trackId });
  }

  async setEqualizer(gainsDb: number[], nightMode: boolean): Promise<void> {
    try {
      await invoke('player_set_eq', { gainsDb, nightMode });
    } catch (err) {
      this.emitError(parsePlayerError(err));
    }
  }

  async applyVideoFilter(config: VideoShaderConfig): Promise<void> {
    await invoke('player_apply_shader', { config });
  }

  onTelemetry(callback: (telemetry: PlaybackTelemetry) => void): () => void {
    this.telemetryListeners.add(callback);
    return () => this.telemetryListeners.delete(callback);
  }

  onError(callback: (error: PlayerErrorEnvelope) => void): () => void {
    this.errorListeners.add(callback);
    return () => this.errorListeners.delete(callback);
  }

  private emitError(err: PlayerErrorEnvelope) {
    this.errorListeners.forEach((cb) => cb(err));
  }

  getQualityLevels(): any[] {
    return [];
  }

  setQualityLevel(_level: number): void {}

  async destroy(): Promise<void> {
    this.telemetryListeners.clear();
    this.errorListeners.clear();
    await invoke('destroy_native_player').catch(() => {});
  }
}

/**
 * Resolves a direct audio stream URL for a YouTube track via the local stream-audio backend.
 * Adopts the Hidara architecture pattern using yt-dlp direct Opus/WebM extraction.
 */
export async function resolveYouTubeAudioStream(youtubeId: string): Promise<string> {
  const origin =
    typeof window !== 'undefined' && window.location?.origin?.startsWith('http')
      ? window.location.origin
      : 'http://127.0.0.1:39281';

  // Hidara pattern: Return direct local audio streaming proxy endpoint
  // Ensures same-origin, Range byte-seeking, and CORS headers for WebAudio DSP
  return `${origin}/api/stream-audio?id=${encodeURIComponent(youtubeId)}&stream=true`;
}

export function resolveMediaStreamUrl(uri: string): string {
  if (!uri) return uri;
  if (
    uri.startsWith('blob:') ||
    uri.startsWith('data:') ||
    uri.startsWith('http://') ||
    uri.startsWith('https://') ||
    uri.startsWith('asset:') ||
    uri.startsWith('media-stream:') ||
    uri.startsWith('tauri:')
  ) {
    return uri;
  }

  // 1. In native macOS WebKit application bundle (loads via custom WKURLSchemeHandler)
  if (
    typeof window !== 'undefined' &&
    (window as unknown as { webkit?: { messageHandlers?: Record<string, unknown> } }).webkit?.messageHandlers
  ) {
    const cleanPath = uri.replace(/^file:\/\//, '');
    return `media-stream://localhost?path=${encodeURIComponent(cleanPath)}`;
  }

  // 2. In Tauri desktop runtime: use Tauri asset protocol
  if (
    typeof window !== 'undefined' &&
    ('__TAURI_INTERNALS__' in window || (window as unknown as { __TAURI__?: unknown }).__TAURI__)
  ) {
    try {
      const cleanPath = uri.replace(/^file:\/\//, '');
      return `http://asset.localhost/${encodeURI(cleanPath.replace(/^[a-zA-Z]:[/\\]/, '').replace(/^\//, ''))}`;
    } catch {
      // Fallback
    }
  }

  // 3. In Vite development environment
  return `http://localhost:1420/@media-stream?path=${encodeURIComponent(uri)}`;
}

/**
 * 2. Web & Cloud Streaming Engine (HTML5 Video + HLS.js + WebAudio 10-Band EQ + 200% VLC Overdrive)
 */
export class WebMediaEngine implements IPlayerEngine {
  public readonly engineType: EngineType = 'web-media';
  private videoEl: HTMLVideoElement | null = null;
  private hlsController: HlsStreamController | null = null;
  private chunkedAudioController: ChunkedAudioStreamController | null = null;

  public get hls(): Hls | null {
    return this.hlsController?.getHlsInstance() || null;
  }
  private audioCtx: AudioContext | null = null;
  private gainNode: GainNode | null = null;
  private eqBands: BiquadFilterNode[] = [];
  private compressorNode: DynamicsCompressorNode | null = null;
  private spatialAudio: SpatialAudioEngine | null = null;
  private mediaSourceNode: MediaElementAudioSourceNode | null = null;
  private lastEqNode: AudioNode | null = null;
  private rafId: number | null = null;
  private currentVolumePercent: number = 100;

  private telemetryListeners = new Set<(t: PlaybackTelemetry) => void>();
  private errorListeners = new Set<(e: PlayerErrorEnvelope) => void>();

  private static readonly EQ_FREQUENCIES = [31, 62, 125, 250, 500, 1000, 2000, 4000, 8000, 16000];

  private dspBypass: boolean = true;

  public setDspBypass(bypass: boolean): void {
    this.dspBypass = bypass;
    if (bypass) {
      if (this.videoEl) {
        this.videoEl.volume = Math.min(1, this.currentVolumePercent / 100);
      }
    } else {
      this.setupWebAudioGraph();
    }
  }

  public getDspBypass(): boolean {
    return this.dspBypass;
  }

  public attachSpatialAudio(spatial: SpatialAudioEngine): void {
    this.spatialAudio = spatial;
    if (this.audioCtx && this.lastEqNode) {
      this.spatialAudio.init(this.audioCtx, this.lastEqNode, this.audioCtx.destination);
    }
  }

  private getVideoEl(): HTMLVideoElement | null {
    if (this.videoEl && document.contains(this.videoEl)) {
      return this.videoEl;
    }
    const dom = document.getElementById('aether-video-viewport') as HTMLVideoElement | null;
    if (dom) {
      this.bindVideoElement(dom);
      return dom;
    }
    return this.videoEl;
  }

  async initialize(container?: HTMLVideoElement): Promise<void> {
    const el = container ?? (document.getElementById('aether-video-viewport') as HTMLVideoElement) ?? document.createElement('video');
    this.bindVideoElement(el);
    this.setupWebAudioGraph();
    this.startTelemetryLoop();
  }

  public bindVideoElement(el: HTMLVideoElement): void {
    if (this.videoEl === el) return;
    this.videoEl = el;
    this.videoEl.playsInline = true;
    this.videoEl.preload = 'auto';
    this.setupWebAudioGraph();

    // Hook critical HTML5 video events with detailed console logs
    this.videoEl.onplay = () => {
      console.log(`%c[Miki Music Action] Play event fired on HTML5 element`, 'color: #10b981;');
      this.notifyTelemetry();
    };
    this.videoEl.onpause = () => {
      console.log(`%c[Miki Music Action] Pause event fired on HTML5 element`, 'color: #8b5cf6;');
      this.notifyTelemetry();
    };
    this.videoEl.onended = () => {
      console.log(`%c[Miki Music Status] Playback ended on HTML5 element`, 'color: #06b6d4;');
      this.notifyTelemetry();
    };
    this.videoEl.ontimeupdate = () => this.notifyTelemetry();
    this.videoEl.onwaiting = () => {
      console.log(`%c[Miki Music Status] Audio buffering / waiting for stream data...`, 'color: #f59e0b; font-weight: bold;');
      if (typeof window !== 'undefined') {
        import('../store/playerStore').then(({ usePlayerStore }) => usePlayerStore.setState({ isBuffering: true })).catch(() => {});
      }
      this.notifyTelemetry();
    };
    this.videoEl.onplaying = () => {
      console.log(`%c[Miki Music Status] Audio stream active & playing (time: ${this.videoEl?.currentTime.toFixed(2)}s)`, 'color: #10b981; font-weight: bold;');
      if (typeof window !== 'undefined') {
        import('../store/playerStore').then(({ usePlayerStore }) => usePlayerStore.setState({ isBuffering: false, isPaused: false })).catch(() => {});
      }
      this.notifyTelemetry();
    };
    this.videoEl.oncanplay = () => {
      console.log(`%c[Miki Music Status] Audio canplay ready (readyState: ${this.videoEl?.readyState})`, 'color: #06b6d4;');
      if (typeof window !== 'undefined') {
        import('../store/playerStore').then(({ usePlayerStore }) => usePlayerStore.setState({ isBuffering: false })).catch(() => {});
      }
      this.notifyTelemetry();
    };
    this.videoEl.onerror = () => {
      const src = this.videoEl?.src || '';
      console.error(`[Miki Music Error] HTML5 element error code:`, this.videoEl?.error?.code, `message:`, this.videoEl?.error?.message, `src:`, src);
      // Completely ignore video errors for YouTube links or blank sources
      if (!src || src.includes('youtube.com') || src.includes('youtu.be')) return;

      // Adaptive CORS Recovery: if crossOrigin was active, remove it and reload without failing
      if (this.videoEl?.hasAttribute('crossOrigin')) {
        this.videoEl.removeAttribute('crossOrigin');
        this.videoEl.load();
        this.videoEl.play().catch(() => {});
        return;
      }

      if (typeof window !== 'undefined') {
        import('../store/playerStore')
          .then(({ usePlayerStore }) => usePlayerStore.setState({ isBuffering: false }))
          .catch(() => {});
      }
      const err = this.videoEl?.error;
      let code: ErrorCode = 'STREAM_ERROR';
      let recovery: RecoveryStrategy = 'retry_with_backoff';

      if (err) {
        // HTMLMediaElement standard error codes:
        // 1 = MEDIA_ERR_ABORTED
        // 2 = MEDIA_ERR_NETWORK
        // 3 = MEDIA_ERR_DECODE
        // 4 = MEDIA_ERR_SRC_NOT_SUPPORTED
        if (err.code === 3 || (typeof MediaError !== 'undefined' && err.code === MediaError.MEDIA_ERR_DECODE)) {
          code = 'CODEC_UNSUPPORTED';
          recovery = 'fallback_to_web_engine';
        } else if (err.code === 2 || (typeof MediaError !== 'undefined' && err.code === MediaError.MEDIA_ERR_NETWORK)) {
          code = 'STREAM_TIMEOUT';
          recovery = 'retry_with_backoff';
        } else if (err.code === 4 || (typeof MediaError !== 'undefined' && err.code === MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED)) {
          code = 'MEDIA_NOT_FOUND';
          recovery = 'retry_with_backoff';
        }
      }

      this.emitError({
        code,
        message: err?.message || (code === 'MEDIA_NOT_FOUND' ? 'Media stream source not found or unreachable.' : 'Media playback error encountered in video element.'),
        severity: code === 'MEDIA_NOT_FOUND' ? 'warning' : 'recoverable',
        recovery,
        timestampMs: Date.now(),
      });
    };
  }

  public setupWebAudioGraph(): void {
    if (this.dspBypass) return;
    const el = this.getVideoEl();
    if (!el) return;
    try {
      if (!this.audioCtx) {
        const AudioCtxClass =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (!AudioCtxClass) return;
        this.audioCtx = new AudioCtxClass();
      }

      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume().catch(() => {});
      }

      if (!this.mediaSourceNode) {
        this.mediaSourceNode = this.audioCtx.createMediaElementSource(el);

        this.eqBands = WebMediaEngine.EQ_FREQUENCIES.map((freq) => {
          const filter = this.audioCtx!.createBiquadFilter();
          filter.type = 'peaking';
          filter.frequency.value = freq;
          filter.Q.value = 1.41;
          filter.gain.value = 0;
          return filter;
        });

        this.compressorNode = this.audioCtx.createDynamicsCompressor();
        this.compressorNode.threshold.value = -24;
        this.compressorNode.knee.value = 30;
        this.compressorNode.ratio.value = 1;

        this.gainNode = this.audioCtx.createGain();
        this.gainNode.gain.value = this.currentVolumePercent / 100;

        let currentNode: AudioNode = this.mediaSourceNode;
        for (const band of this.eqBands) {
          currentNode.connect(band);
          currentNode = band;
        }
        this.lastEqNode = currentNode;

        if (this.spatialAudio) {
          this.spatialAudio.init(this.audioCtx, this.lastEqNode, this.audioCtx.destination);
        } else {
          this.lastEqNode.connect(this.compressorNode);
          this.compressorNode.connect(this.gainNode);
          this.gainNode.connect(this.audioCtx.destination);
        }
      }
    } catch (err) {
      logWarn('WebAudio advanced routing optional or bypassed for CORS stream: ' + String(err));
    }
  }

  async load(uri: string, startPositionMs = 0): Promise<void> {
    this.setupWebAudioGraph();

    const el = this.getVideoEl();
    if (!el) return;

    if (this.hlsController) {
      this.hlsController.destroy();
      this.hlsController = null;
    }
    if (this.chunkedAudioController) {
      this.chunkedAudioController.destroy();
      this.chunkedAudioController = null;
    }

    // Direct YouTube Music Audio Stream Resolution (Hidara Architecture)
    const youtubeId = parseYouTubeId(uri);
    if (youtubeId) {
      // Direct audio bypass: never enforce crossOrigin on YouTube audio streams to prevent CORS block
      el.removeAttribute('crossOrigin');

      console.log(
        `%c[Miki Music Request] Loading YouTube track ID: ${youtubeId}, URI: ${uri}`,
        'color: #06b6d4; font-weight: bold;'
      );

      // Explicitly set isBuffering: true on starting so UI displays loading animation immediately
      if (typeof window !== 'undefined') {
        import('../store/playerStore')
          .then(({ usePlayerStore }) => usePlayerStore.setState({ isBuffering: true, positionMs: 0 }))
          .catch(() => {});
      }

      try {
        console.log(
          `%c[Miki Music Processing] Resolving audio stream for ID: ${youtubeId}...`,
          'color: #f59e0b; font-weight: bold;'
        );
        const directAudioUrl = await resolveYouTubeAudioStream(youtubeId);
        console.log(
          `%c[Miki Music Response] Direct stream URL ready: ${directAudioUrl}`,
          'color: #10b981; font-weight: bold;'
        );

        el.src = directAudioUrl;
        el.muted = false;
        el.volume = Math.min(1.0, this.currentVolumePercent / 100);
        if (startPositionMs > 0) {
          el.currentTime = startPositionMs / 1000;
        }

        console.log(
          `%c[Miki Music Processing] Starting HTML5 playback (hardware direct CoreAudio)...`,
          'color: #a855f7; font-weight: bold;'
        );
        await this.play().catch((playErr) => {
          console.warn('[Miki Music Status] Autoplay waiting for user gesture or audio buffer:', playErr);
        });
        return;
      } catch (err) {
        console.error('[Miki Music Error] Failed to resolve YouTube audio stream:', err);
        logWarn('YouTube direct audio stream loading fallback: ' + String(err));
      }
    }

    const resolvedUri = resolveMediaStreamUrl(uri);
    const isHls = HlsStreamController.isHlsUrl(resolvedUri);
    const isAudio = ChunkedAudioStreamController.isAudioUrl(resolvedUri);

    // Enable crossOrigin = 'anonymous' so WebAudio createMediaElementSource receives authorized audio
    // Adaptive CORS recovery in onerror will automatically remove crossOrigin if the remote server rejects it
    try {
      el.crossOrigin = 'anonymous';
    } catch {
      el.removeAttribute('crossOrigin');
    }

    if (isHls) {
      this.hlsController = new HlsStreamController({
        maxNetworkRetries: 3,
        onManifestParsed: () => {
          if (startPositionMs > 0) {
            el.currentTime = startPositionMs / 1000;
          }
          this.play().catch(() => {});
        },
        onFatalError: (diag) => {
          if (typeof window !== 'undefined') {
            import('../store/playerStore')
              .then(({ usePlayerStore }) => usePlayerStore.setState({ isBuffering: false }))
              .catch(() => {});
          }
          this.emitError({
            code: diag.reason === 'CODEC_UNSUPPORTED' ? 'CODEC_UNSUPPORTED' : 'STREAM_TIMEOUT',
            message: diag.userMessage,
            details: `HLS error (${diag.reason}) on ${resolvedUri}`,
            severity: 'recoverable',
            recovery: 'retry_with_backoff',
            timestampMs: Date.now(),
          });
        },
      });

      this.hlsController.load(el, resolvedUri, startPositionMs);
    } else if (isAudio) {
      // High-efficiency chunk-by-chunk progressive streaming for instant audio playback (<200ms)
      el.preload = 'auto';
      this.chunkedAudioController = new ChunkedAudioStreamController({
        onInitialChunkReady: () => {
          if (startPositionMs > 0) {
            el.currentTime = startPositionMs / 1000;
          }
          this.play().catch(() => {});
        },
        onError: (err) => {
          logWarn('Chunked audio notice: ' + err.message);
        },
      });
      await this.chunkedAudioController.load(el, resolvedUri, startPositionMs);
    } else {
      el.preload = 'auto';
      el.src = resolvedUri;
      el.load();

      const onReady = () => {
        if (startPositionMs > 0) {
          el.currentTime = startPositionMs / 1000;
        }
        el.removeEventListener('loadeddata', onReady);
        el.removeEventListener('canplay', onReady);
        this.play().catch(() => {});
      };
      // loadeddata fires as soon as the first media frame is decoded (< 200ms)
      el.addEventListener('loadeddata', onReady, { once: true });
      el.addEventListener('canplay', onReady, { once: true });
    }
  }

  async play(): Promise<void> {
    const el = this.getVideoEl();
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      await this.audioCtx.resume().catch(() => {});
    }
    if (el) {
      if (this.currentVolumePercent > 0 && el.muted) {
        // Enforce unmuted state for audible playback, clearing any prior NotAllowedError muted flag
        el.muted = false;
      }
      try {
        await el.play();
      } catch (err: unknown) {
        const error = err as Error;
        logWarn('Autoplay or play promise rejected: ' + error.message);
        if (error.name === 'NotAllowedError') {
          el.muted = true;
          await el.play().catch(() => {});
        }
      }
    }
    this.notifyTelemetry();
  }

  async pause(): Promise<void> {
    const el = this.getVideoEl();
    el?.pause();
    this.notifyTelemetry();
  }

  async seek(timestampMs: number): Promise<void> {
    const el = this.getVideoEl();
    if (el) {
      el.currentTime = Math.max(0, timestampMs / 1000);
      this.notifyTelemetry();
    }
  }

  async setVolume(volume: number): Promise<void> {
    // VLC Overdrive range: 0% to 200%
    const clamped = Math.max(0, Math.min(200, volume));
    this.currentVolumePercent = clamped;

    const el = this.getVideoEl();
    if (el && clamped > 0 && el.muted) {
      el.muted = false;
    }

    console.log(`%c[Miki Music Action] PlayerEngine.setVolume: ${clamped}% (hardware volume: ${(Math.min(1, clamped / 100) * 100).toFixed(0)}%)`, 'color: #06b6d4;');

    if (this.dspBypass) {
      if (el) {
        el.muted = clamped === 0;
        const normalizedPercent = Math.min(100, clamped) / 100;
        const smoothGain = Math.pow(normalizedPercent, 1.4);
        el.volume = Math.max(0, Math.min(1.0, smoothGain));
      }
      this.notifyTelemetry();
      return;
    }

    this.setupWebAudioGraph();

    const hasWebAudio = Boolean(this.gainNode || this.spatialAudio || this.mediaSourceNode);

    if (el) {
      if (hasWebAudio) {
        el.volume = 1.0;
      } else {
        const normalizedPercent = Math.min(100, clamped) / 100;
        const smoothGain = Math.pow(normalizedPercent, 1.4);
        el.volume = Math.max(0, Math.min(1.0, smoothGain));
      }
    }

    if (this.gainNode && this.audioCtx) {
      this.gainNode.gain.setValueAtTime(clamped / 100, this.audioCtx.currentTime);
    }

    if (this.spatialAudio) {
      this.spatialAudio.setMasterVolume(clamped / 100);
    }
  }

  async setMuted(muted: boolean): Promise<void> {
    if (this.dspBypass) {
      if (this.videoEl) {
        this.videoEl.muted = muted;
        if (!muted) {
          this.videoEl.volume = Math.min(1, this.currentVolumePercent / 100);
        }
      }
      return;
    }

    const hasWebAudio = Boolean(this.gainNode || this.spatialAudio || this.mediaSourceNode);
    if (this.videoEl) {
      this.videoEl.muted = muted;
      if (!muted && hasWebAudio) {
        this.videoEl.volume = 1.0;
      }
    }
    const targetVolume = muted ? 0 : this.currentVolumePercent / 100;
    if (this.spatialAudio) {
      this.spatialAudio.setMasterVolume(targetVolume);
    } else if (this.gainNode && this.audioCtx) {
      this.gainNode.gain.setValueAtTime(targetVolume, this.audioCtx.currentTime);
    }
  }

  async setPlaybackRate(rate: number): Promise<void> {
    if (this.videoEl) {
      this.videoEl.playbackRate = Math.max(0.25, Math.min(4.0, rate));
    }
  }

  async setAudioTrack(trackId: string): Promise<void> {
    if (this.hls) {
      this.hls.audioTrack = Number(trackId);
    }
  }

  async setSubtitleTrack(trackId: string | null): Promise<void> {
    if (this.hls) {
      this.hls.subtitleTrack = trackId === null ? -1 : Number(trackId);
    }
  }

  async setEqualizer(gainsDb: number[], nightMode: boolean): Promise<void> {
    this.setupWebAudioGraph();
    this.eqBands.forEach((band, idx) => {
      const clamped = Math.max(-20, Math.min(20, gainsDb[idx] ?? 0));
      band.gain.value = clamped;
    });
    if (this.compressorNode) {
      this.compressorNode.ratio.value = nightMode ? 12 : 1;
    }
  }

  async applyVideoFilter(config: VideoShaderConfig): Promise<void> {
    if (!this.videoEl) return;
    const brightnessVal = 100 + (config.brightness || 0); // e.g. 100% standard
    let filters = `brightness(${brightnessVal}%) contrast(${config.contrast}) saturate(${config.saturation})`;

    if (config.superResolution && config.superResolution !== 'off') {
      filters += ` contrast(${Math.round(config.contrast * 105)}%) drop-shadow(0 0 1px rgba(255,255,255,0.08))`;
    }
    if (config.clarityBoost && config.clarityBoost > 0) {
      filters += ` contrast(${Math.round(100 + config.clarityBoost * 15)}%)`;
    }
    if (config.deNoise && config.deNoise > 0) {
      filters += ` blur(${Math.min(0.35, config.deNoise * 0.25)}px)`;
    }
    this.videoEl.style.filter = filters;

    // Aspect ratio application
    switch (config.aspectRatio) {
      case '16:9':
        this.videoEl.style.aspectRatio = '16/9';
        this.videoEl.style.objectFit = 'contain';
        break;
      case '4:3':
        this.videoEl.style.aspectRatio = '4/3';
        this.videoEl.style.objectFit = 'contain';
        break;
      case '21:9':
        this.videoEl.style.aspectRatio = '21/9';
        this.videoEl.style.objectFit = 'contain';
        break;
      case '1:1':
        this.videoEl.style.aspectRatio = '1/1';
        this.videoEl.style.objectFit = 'contain';
        break;
      case 'fill':
        this.videoEl.style.aspectRatio = 'auto';
        this.videoEl.style.objectFit = 'fill';
        break;
      default:
        this.videoEl.style.aspectRatio = 'auto';
        this.videoEl.style.objectFit = 'contain';
    }
  }

  captureSnapshot(): string | null {
    if (!this.videoEl || this.videoEl.videoWidth === 0) return null;
    const canvas = document.createElement('canvas');
    canvas.width = this.videoEl.videoWidth;
    canvas.height = this.videoEl.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    ctx.drawImage(this.videoEl, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/png');
  }

  private notifyTelemetry(): void {
    if (!this.videoEl) return;
    // If no media source is attached to the video element, do not emit spurious paused telemetry
    const elSrc = this.videoEl.currentSrc || this.videoEl.src || '';
    if (!elSrc || (typeof window !== 'undefined' && elSrc === window.location.href)) {
      return;
    }

    const bufferedEnd =
      this.videoEl.buffered.length > 0
        ? this.videoEl.buffered.end(this.videoEl.buffered.length - 1) * 1000
        : 0;

    const telemetry: PlaybackTelemetry = {
      positionMs: Math.round(this.videoEl.currentTime * 1000),
      durationMs: Math.round((this.videoEl.duration || 0) * 1000),
      bufferedMs: Math.round(bufferedEnd),
      isPaused: this.videoEl.paused,
      isBuffering: this.videoEl.readyState < 3,
      playbackRate: this.videoEl.playbackRate,
      volume: this.currentVolumePercent,
      isMuted: this.videoEl.muted,
      audioTracks: [],
      subtitleTracks: [],
      chapters: [],
    };

    this.telemetryListeners.forEach((cb) => cb(telemetry));
  }

  private startTelemetryLoop(): void {
    const tick = () => {
      this.notifyTelemetry();
      this.rafId = requestAnimationFrame(tick);
    };
    this.rafId = requestAnimationFrame(tick);
  }

  onTelemetry(callback: (telemetry: PlaybackTelemetry) => void): () => void {
    this.telemetryListeners.add(callback);
    return () => this.telemetryListeners.delete(callback);
  }

  onError(callback: (error: PlayerErrorEnvelope) => void): () => void {
    this.errorListeners.add(callback);
    return () => this.errorListeners.delete(callback);
  }

  private emitError(err: PlayerErrorEnvelope) {
    this.errorListeners.forEach((cb) => cb(err));
  }

  getQualityLevels(): any[] {
    return this.hlsController?.getQualityLevels() || [];
  }

  setQualityLevel(level: number): void {
    this.hlsController?.setQualityLevel(level);
  }

  async destroy(): Promise<void> {
    if (this.rafId) cancelAnimationFrame(this.rafId);
    this.hlsController?.destroy();
    this.chunkedAudioController?.destroy();
    this.chunkedAudioController = null;
    await this.audioCtx?.close().catch(() => {});
    this.telemetryListeners.clear();
    this.errorListeners.clear();
  }
}

function logWarn(msg: string) {
  if (typeof console !== 'undefined') {
    console.warn('[MikiPlayer]', msg);
  }
}
