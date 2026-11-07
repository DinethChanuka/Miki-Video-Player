/**
 * Unified Media Engine Router (Miki Player)
 *
 * Provides a single unified playback contract (MediaEngine) that orchestrates:
 * 1. Native Media Engine: Rust + libmpv + hardware video decoding (tauri-mpv)
 * 2. Web Media Engine: HTML5 Video + Hls.js + WebAudio 10-band EQ (web-media)
 * 3. Web Embed Engine: YouTube, TikTok, Vimeo, Twitch & Cinema iframes (web-embed)
 *
 * Key Capabilities:
 * - Deterministic engine selection based on media protocol, format, and capabilities.
 * - Mutual exclusion: guarantees two engines never play simultaneously.
 * - Seamless automatic engine fallback (Native -> Web) with timestamp persistence.
 * - Dedicated AudioEngine DSP bypass switch for zero-CPU mode and CORS audio safety.
 * - Unified error reporting and real-time telemetry synchronization.
 */

import {
  IPlayerEngine,
  TauriMpvEngine,
  WebMediaEngine,
  PlaybackTelemetry,
  PlayerErrorEnvelope,
  VideoShaderConfig,
  parsePlayerError,
} from './PlayerEngine';
import { parseWebStream, isDirectMediaUrl } from '../utils/webStreamUtils';

export type UnifiedEngineType = 'tauri-mpv' | 'web-media' | 'web-embed';

export interface MediaEngine {
  readonly engineType: UnifiedEngineType;
  initialize(container?: HTMLVideoElement): Promise<void>;
  load(source: string, startPositionMs?: number): Promise<void>;
  play(): Promise<void>;
  pause(): Promise<void>;
  seek(timestampMs: number, exact?: boolean): Promise<void>;
  setVolume(volumePercent: number): Promise<void>;
  setMuted(muted: boolean): Promise<void>;
  getState(): PlaybackTelemetry;
  dispose(): Promise<void>;
}

export function isTauriEnvironment(): boolean {
  return typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;
}

/**
 * Web Embed Adapter Engine
 * Wraps YouTube, Vimeo, TikTok, Twitch and web embeds to adhere to MediaEngine contract.
 */
export class WebEmbedMediaEngine implements MediaEngine {
  public readonly engineType: UnifiedEngineType = 'web-embed';
  private currentUri: string = '';

  public getCurrentUri(): string {
    return this.currentUri;
  }
  private positionMs: number = 0;
  private durationMs: number = 0;
  private isPaused: boolean = true;
  private volumePercent: number = 100;
  private isMuted: boolean = false;
  private telemetryInterval: ReturnType<typeof setInterval> | null = null;
  private telemetryListeners = new Set<(t: PlaybackTelemetry) => void>();
  private errorListeners = new Set<(e: PlayerErrorEnvelope) => void>();

  async initialize(): Promise<void> {
    this.startVirtualTelemetry();
  }

  async load(uri: string, startPositionMs = 0): Promise<void> {
    this.currentUri = uri;
    this.positionMs = startPositionMs;
    this.isPaused = false;
    this.notifyTelemetry();
  }

  async play(): Promise<void> {
    this.isPaused = false;
    this.notifyTelemetry();
  }

  async pause(): Promise<void> {
    this.isPaused = true;
    this.notifyTelemetry();
  }

  async seek(timestampMs: number): Promise<void> {
    this.positionMs = Math.max(0, timestampMs);
    this.notifyTelemetry();
  }

  async setVolume(volumePercent: number): Promise<void> {
    this.volumePercent = Math.max(0, Math.min(200, volumePercent));
    this.notifyTelemetry();
  }

  async setMuted(muted: boolean): Promise<void> {
    this.isMuted = muted;
    this.notifyTelemetry();
  }

  getState(): PlaybackTelemetry {
    return {
      positionMs: this.positionMs,
      durationMs: this.durationMs,
      bufferedMs: this.positionMs,
      isPaused: this.isPaused,
      isBuffering: false,
      playbackRate: 1.0,
      volume: this.volumePercent,
      isMuted: this.isMuted,
      audioTracks: [],
      subtitleTracks: [],
      chapters: [],
    };
  }

  onTelemetry(callback: (telemetry: PlaybackTelemetry) => void): () => void {
    this.telemetryListeners.add(callback);
    return () => this.telemetryListeners.delete(callback);
  }

  onError(callback: (error: PlayerErrorEnvelope) => void): () => void {
    this.errorListeners.add(callback);
    return () => this.errorListeners.delete(callback);
  }

  private notifyTelemetry(): void {
    const state = this.getState();
    this.telemetryListeners.forEach((cb) => cb(state));
  }

  private startVirtualTelemetry(): void {
    if (this.telemetryInterval) clearInterval(this.telemetryInterval);
    this.telemetryInterval = setInterval(() => {
      if (!this.isPaused && this.durationMs > 0 && this.positionMs < this.durationMs) {
        this.positionMs += 1000;
        this.notifyTelemetry();
      }
    }, 1000);
  }

  async dispose(): Promise<void> {
    if (this.telemetryInterval) {
      clearInterval(this.telemetryInterval);
      this.telemetryInterval = null;
    }
    this.isPaused = true;
    this.currentUri = '';
    this.telemetryListeners.clear();
    this.errorListeners.clear();
  }
}

/**
 * Unified Media Engine Router
 * Centrally selects, runs, and fails over media engines with zero duplicate playback.
 */
export class MediaEngineRouter implements MediaEngine {
  private nativeEngine: TauriMpvEngine | null = null;
  private webMediaEngine: WebMediaEngine | null = null;
  private webEmbedEngine: WebEmbedMediaEngine | null = null;

  private activeEngine: UnifiedEngineType = 'web-media';
  private currentUri: string = '';
  private lastPositionMs: number = 0;
  private dspBypass: boolean = false;
  private containerEl: HTMLVideoElement | null = null;

  private telemetryListeners = new Set<(t: PlaybackTelemetry) => void>();
  private errorListeners = new Set<(e: PlayerErrorEnvelope) => void>();

  constructor() {
    // Lazily initialized on demand to prevent redundant competing engine creation
  }

  public get engineType(): UnifiedEngineType {
    return this.activeEngine;
  }

  /**
   * Deterministically selects the optimal engine for a given source URI.
   */
  public selectEngineForSource(uri: string): UnifiedEngineType {
    if (!uri) return 'web-media';

    // 1. Web embed portals (YouTube, TikTok, Vimeo, Twitch, Cinema)
    const webStream = parseWebStream(uri);
    const isHttp = uri.startsWith('http://') || uri.startsWith('https://');
    if (webStream || (isHttp && !isDirectMediaUrl(uri) && !uri.includes('.m3u8') && !uri.includes('.mp3'))) {
      return 'web-embed';
    }

    // 2. High-performance local containers in Tauri (MKV, AVI, raw TS, FLAC, HEVC)
    if (isTauriEnvironment()) {
      const isLocal = !uri.startsWith('http://') && !uri.startsWith('https://');
      const isHeavyCodec = /\.(mkv|avi|mov|flac|wav|ts|webm|wmv)($|\?)/i.test(uri);
      if (isLocal || isHeavyCodec) {
        return 'tauri-mpv';
      }
    }

    // 3. Web Media Engine for HLS, direct MP4, Icecast, SomaFM, and web fallback
    return 'web-media';
  }

  /**
   * Mutual exclusion: prevents dual playback across engines by halting all inactive engines.
   */
  public async preventDualPlayback(exceptEngineType?: UnifiedEngineType): Promise<void> {
    if (exceptEngineType !== 'tauri-mpv' && this.nativeEngine) {
      try {
        await this.nativeEngine.pause();
      } catch {}
    }

    if (exceptEngineType !== 'web-media' && this.webMediaEngine) {
      try {
        await this.webMediaEngine.pause();
      } catch {}
    }

    if (exceptEngineType !== 'web-embed' && this.webEmbedEngine) {
      try {
        await this.webEmbedEngine.pause();
      } catch {}
    }
  }

  /**
   * Convenience alias for stopping inactive engines
   */
  public async stopInactiveEngines(activeEngineType?: UnifiedEngineType): Promise<void> {
    await this.preventDualPlayback(activeEngineType);
  }

  /**
   * Initializes router with target HTMLVideoElement container
   */
  async initialize(container?: HTMLVideoElement): Promise<void> {
    this.containerEl = container ?? (typeof document !== 'undefined' ? (document.getElementById('aether-video-viewport') as HTMLVideoElement) : null);

    if (this.webMediaEngine) {
      await this.webMediaEngine.initialize(this.containerEl ?? undefined);
      this.webMediaEngine.onTelemetry((t) => {
        if (this.activeEngine === 'web-media') {
          this.lastPositionMs = t.positionMs;
          this.notifyTelemetry(t);
        }
      });
      this.webMediaEngine.onError((err) => {
        if (this.activeEngine === 'web-media') {
          this.notifyError(err);
        }
      });
    }

    if (this.nativeEngine) {
      try {
        await this.nativeEngine.initialize();
        this.nativeEngine.onTelemetry((t) => {
          if (this.activeEngine === 'tauri-mpv') {
            this.lastPositionMs = t.positionMs;
            this.notifyTelemetry(t);
          }
        });
        this.nativeEngine.onError(async (err) => {
          if (this.activeEngine === 'tauri-mpv') {
            await this.handleEngineFallback(this.currentUri, err);
          }
        });
      } catch {
        this.nativeEngine = null;
      }
    }

    if (this.webEmbedEngine) {
      await this.webEmbedEngine.initialize();
      this.webEmbedEngine.onTelemetry((t) => {
        if (this.activeEngine === 'web-embed') {
          this.lastPositionMs = t.positionMs;
          this.notifyTelemetry(t);
        }
      });
    }
  }

  /**
   * Loads media URI onto the optimal engine, guaranteeing single-engine playback.
   */
  async load(uri: string, startPositionMs = 0): Promise<void> {
    this.currentUri = uri;
    const targetEngine = this.selectEngineForSource(uri);

    // Enforce mutual exclusion
    await this.preventDualPlayback(targetEngine);
    this.activeEngine = targetEngine;
    this.lastPositionMs = startPositionMs;

    const engine = this.getEngineInstance(targetEngine);
    if (!engine) {
      // Fallback to web-media if selected engine is unavailable
      this.activeEngine = 'web-media';
      await this.webMediaEngine?.load(uri, startPositionMs);
      return;
    }

    await engine.load(uri, startPositionMs);
  }

  async play(): Promise<void> {
    await this.preventDualPlayback(this.activeEngine);
    const engine = this.getEngineInstance(this.activeEngine);
    await engine?.play();
  }

  async pause(): Promise<void> {
    const engine = this.getEngineInstance(this.activeEngine);
    await engine?.pause();
  }

  async seek(timestampMs: number, exact = false): Promise<void> {
    this.lastPositionMs = timestampMs;
    const engine = this.getEngineInstance(this.activeEngine);
    if (engine && 'seek' in engine) {
      await (engine as { seek: (ts: number, ex?: boolean) => Promise<void> }).seek(timestampMs, exact);
    }
  }

  async setVolume(volumePercent: number): Promise<void> {
    const engine = this.getEngineInstance(this.activeEngine);
    await engine?.setVolume(volumePercent);
  }

  async setMuted(muted: boolean): Promise<void> {
    const engine = this.getEngineInstance(this.activeEngine);
    await engine?.setMuted(muted);
  }

  async setPlaybackRate(rate: number): Promise<void> {
    const engine = this.getEngineInstance(this.activeEngine);
    if (engine && 'setPlaybackRate' in engine) {
      await (engine as { setPlaybackRate: (r: number) => Promise<void> }).setPlaybackRate(rate);
    }
  }

  async setEqualizer(gainsDb: number[], nightMode: boolean): Promise<void> {
    if (this.dspBypass) return;
    const engine = this.getEngineInstance(this.activeEngine);
    if (engine && 'setEqualizer' in engine) {
      await (engine as { setEqualizer: (g: number[], n: boolean) => Promise<void> }).setEqualizer(gainsDb, nightMode);
    }
  }

  async applyVideoFilter(config: VideoShaderConfig): Promise<void> {
    const engine = this.getEngineInstance(this.activeEngine);
    if (engine && 'applyVideoFilter' in engine) {
      await (engine as { applyVideoFilter: (c: VideoShaderConfig) => Promise<void> }).applyVideoFilter(config);
    }
  }

  /**
   * Dedicated AudioEngine DSP Bypass: disables WebAudio filter graph completely for zero CPU cost
   * and prevents CORS silencing on external audio streams.
   */
  public setDspBypass(bypass: boolean): void {
    this.dspBypass = bypass;
    if (this.webMediaEngine) {
      this.webMediaEngine.setDspBypass?.(bypass);
    }
  }

  public getDspBypass(): boolean {
    return this.dspBypass;
  }

  /**
   * Automatic fallback from native engine to web-media engine with timestamp preservation.
   */
  public async handleEngineFallback(failedUri: string, error: PlayerErrorEnvelope): Promise<void> {
    const savedPos = this.lastPositionMs;
    console.warn(`[MediaEngineRouter] Native engine failure for ${failedUri}. Failing over to web-media at ${savedPos}ms:`, error.message);

    await this.preventDualPlayback('web-media');
    this.activeEngine = 'web-media';

    if (this.webMediaEngine) {
      try {
        await this.webMediaEngine.load(failedUri, savedPos);
        await this.webMediaEngine.play();
      } catch (fallbackErr) {
        this.notifyError(parsePlayerError(fallbackErr));
      }
    }
  }

  public fallbackToWebEngine(failedUri?: string): Promise<void> {
    return this.handleEngineFallback(failedUri || this.currentUri, {
      code: 'HW_DEC_FAILED',
      message: 'Native playback fallback triggered',
      severity: 'recoverable',
      recovery: 'fallback_to_web_engine',
      timestampMs: Date.now(),
    });
  }

  getState(): PlaybackTelemetry {
    const engine = this.getEngineInstance(this.activeEngine);
    if (engine && 'getState' in engine) {
      return (engine as MediaEngine).getState();
    }
    return {
      positionMs: this.lastPositionMs,
      durationMs: 0,
      bufferedMs: 0,
      isPaused: true,
      isBuffering: false,
      playbackRate: 1.0,
      volume: 100,
      isMuted: false,
      audioTracks: [],
      subtitleTracks: [],
      chapters: [],
    };
  }

  public getActiveEngineInstance(): MediaEngine | IPlayerEngine | null {
    return this.getEngineInstance(this.activeEngine);
  }

  private getEngineInstance(type: UnifiedEngineType): MediaEngine | IPlayerEngine | null {
    if (type === 'tauri-mpv') {
      if (!this.nativeEngine && isTauriEnvironment()) {
        this.nativeEngine = new TauriMpvEngine();
      }
      return this.nativeEngine;
    }
    if (type === 'web-embed') {
      if (!this.webEmbedEngine) {
        this.webEmbedEngine = new WebEmbedMediaEngine();
      }
      return this.webEmbedEngine;
    }
    if (!this.webMediaEngine) {
      this.webMediaEngine = new WebMediaEngine();
    }
    return this.webMediaEngine;
  }

  onTelemetry(callback: (telemetry: PlaybackTelemetry) => void): () => void {
    this.telemetryListeners.add(callback);
    return () => this.telemetryListeners.delete(callback);
  }

  onError(callback: (error: PlayerErrorEnvelope) => void): () => void {
    this.errorListeners.add(callback);
    return () => this.errorListeners.delete(callback);
  }

  private notifyTelemetry(t: PlaybackTelemetry): void {
    this.telemetryListeners.forEach((cb) => cb(t));
  }

  private notifyError(e: PlayerErrorEnvelope): void {
    this.errorListeners.forEach((cb) => cb(e));
  }

  async dispose(): Promise<void> {
    await this.preventDualPlayback();
    if (this.nativeEngine) await this.nativeEngine.destroy().catch(() => {});
    if (this.webMediaEngine) await this.webMediaEngine.destroy().catch(() => {});
    if (this.webEmbedEngine) await this.webEmbedEngine.dispose().catch(() => {});
    this.telemetryListeners.clear();
    this.errorListeners.clear();
  }

  async destroy(): Promise<void> {
    await this.dispose();
  }
}
