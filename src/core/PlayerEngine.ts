import { invoke, Channel } from '@tauri-apps/api/core';
import Hls from 'hls.js';

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
  | 'IPC_CHANNEL_CLOSED';

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
  sharpness: number; // 0.0 to 1.0
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

  async destroy(): Promise<void> {
    this.telemetryListeners.clear();
    this.errorListeners.clear();
    await invoke('destroy_native_player').catch(() => {});
  }
}

/**
 * 2. Web & Cloud Streaming Engine (HTML5 Video + HLS.js + WebAudio 10-Band EQ + 200% VLC Overdrive)
 */
export class WebMediaEngine implements IPlayerEngine {
  public readonly engineType: EngineType = 'web-media';
  private videoEl: HTMLVideoElement | null = null;
  private hls: Hls | null = null;
  private audioCtx: AudioContext | null = null;
  private gainNode: GainNode | null = null;
  private eqBands: BiquadFilterNode[] = [];
  private compressorNode: DynamicsCompressorNode | null = null;
  private rafId: number | null = null;
  private currentVolumePercent: number = 100;

  private telemetryListeners = new Set<(t: PlaybackTelemetry) => void>();
  private errorListeners = new Set<(e: PlayerErrorEnvelope) => void>();

  private static readonly EQ_FREQUENCIES = [31, 62, 125, 250, 500, 1000, 2000, 4000, 8000, 16000];

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
    this.startTelemetryLoop();
  }

  public bindVideoElement(el: HTMLVideoElement): void {
    if (this.videoEl === el) return;
    this.videoEl = el;
    this.videoEl.playsInline = true;
    this.videoEl.preload = 'auto';

    // Hook critical HTML5 video events
    this.videoEl.onplay = () => this.notifyTelemetry();
    this.videoEl.onpause = () => this.notifyTelemetry();
    this.videoEl.onended = () => this.notifyTelemetry();
    this.videoEl.ontimeupdate = () => this.notifyTelemetry();
    this.videoEl.onerror = () => {
      const src = this.videoEl?.src || '';
      // Completely ignore video errors for YouTube links or blank sources
      if (!src || src.includes('youtube.com') || src.includes('youtu.be')) return;
      const err = this.videoEl?.error;
      this.emitError({
        code: 'CODEC_UNSUPPORTED',
        message: err?.message || 'Media playback error encountered in video element.',
        severity: 'recoverable',
        recovery: 'retry_with_backoff',
        timestampMs: Date.now(),
      });
    };
  }

  private setupWebAudioGraph(): void {
    const el = this.getVideoEl();
    if (!el || this.audioCtx) return;
    try {
      const AudioCtxClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtxClass) return;
      this.audioCtx = new AudioCtxClass();

      // Only attempt media element source if crossOrigin is supported or local
      const source = this.audioCtx.createMediaElementSource(el);

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

      let currentNode: AudioNode = source;
      for (const band of this.eqBands) {
        currentNode.connect(band);
        currentNode = band;
      }
      currentNode.connect(this.compressorNode);
      this.compressorNode.connect(this.gainNode);
      this.gainNode.connect(this.audioCtx.destination);
    } catch (err) {
      logWarn('WebAudio advanced routing optional or bypassed for CORS stream: ' + String(err));
    }
  }

  async load(uri: string, startPositionMs = 0): Promise<void> {
    // If YouTube URL, never pass to <video> src
    if (/(?:youtube\.com\/(?:watch\?.*v=|embed\/|shorts\/)|youtu\.be\/)/.test(uri)) {
      const el = this.getVideoEl();
      if (el) {
        el.pause();
        el.removeAttribute('src');
        el.load();
      }
      return;
    }

    const el = this.getVideoEl();
    if (!el) return;

    if (this.hls) {
      this.hls.destroy();
      this.hls = null;
    }

    const isHls = uri.includes('.m3u8');
    if (isHls && Hls.isSupported()) {
      // High-performance Network Optimizer configuration
      this.hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        startFragPrefetch: true, // Fast initial frame prefetch
        backBufferLength: 90,
        maxBufferLength: 60,     // 60-second forward buffer
        maxMaxBufferLength: 120,
        maxBufferSize: 60 * 1024 * 1024, // 60MB memory buffer
        progressive: true,
        fragLoadingTimeOut: 15000,
        manifestLoadingTimeOut: 10000,
      });
      this.hls.loadSource(uri);
      this.hls.attachMedia(el);
      this.hls.on(Hls.Events.MANIFEST_PARSED, () => {
        if (startPositionMs > 0) {
          el.currentTime = startPositionMs / 1000;
        }
        this.play().catch(() => {});
      });
      this.hls.on(Hls.Events.ERROR, (_event, data) => {
        if (data.fatal) {
          this.emitError({
            code: data.type === Hls.ErrorTypes.NETWORK_ERROR ? 'STREAM_TIMEOUT' : 'CODEC_UNSUPPORTED',
            message: `HLS stream error: ${data.details}`,
            severity: 'recoverable',
            recovery: data.type === Hls.ErrorTypes.NETWORK_ERROR ? 'retry_with_backoff' : 'none',
            timestampMs: Date.now(),
          });
        }
      });
    } else {
      el.src = uri;
      el.load();

      const onCanPlay = () => {
        if (startPositionMs > 0) {
          el.currentTime = startPositionMs / 1000;
        }
        el.removeEventListener('canplay', onCanPlay);
        this.play().catch(() => {});
      };
      el.addEventListener('canplay', onCanPlay);
    }
  }

  async play(): Promise<void> {
    const el = this.getVideoEl();
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      await this.audioCtx.resume().catch(() => {});
    }
    if (el) {
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

    if (clamped > 100) {
      this.setupWebAudioGraph();
    }

    if (this.videoEl) {
      // HTML5 video element standard volume only supports 0 to 1 (0% to 100%)
      this.videoEl.volume = Math.min(1, clamped / 100);
    }

    if (this.gainNode) {
      // Gain node delivers the amplified 101% - 200% volume boost
      this.gainNode.gain.value = clamped / 100;
    }
  }

  async setMuted(muted: boolean): Promise<void> {
    if (this.videoEl) {
      this.videoEl.muted = muted;
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
    this.videoEl.style.filter = `brightness(${brightnessVal}%) contrast(${config.contrast}) saturate(${config.saturation})`;

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

  async destroy(): Promise<void> {
    if (this.rafId) cancelAnimationFrame(this.rafId);
    this.hls?.destroy();
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
