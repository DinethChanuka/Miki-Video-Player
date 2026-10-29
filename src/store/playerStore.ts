import { create } from 'zustand';
import { invoke } from '@tauri-apps/api/core';
import {
  IPlayerEngine,
  TauriMpvEngine,
  WebMediaEngine,
  EngineType,
  PlaybackTelemetry,
  PlayerErrorEnvelope,
  TrackInfo,
  ChapterInfo,
  VideoShaderConfig,
  parsePlayerError,
} from '../core/PlayerEngine';

export interface MediaHistoryItem {
  mediaId: string;
  uri: string;
  title: string;
  durationMs: number;
  lastPositionMs: number;
  progressPercent: number;
  isCompleted: boolean;
  playCount: number;
  thumbnailUri?: string;
  lastPlayedAt: number;
}

export interface MediaBookmark {
  id: number;
  mediaId: string;
  timestampMs: number;
  label: string;
  thumbnailUri?: string;
  createdAt: number;
}

export interface MediaPreferences {
  mediaId: string;
  audioTrackId: string | null;
  subtitleTrackId: string | null;
  audioDelayMs: number;
  subtitleDelayMs: number;
  playbackRate: number;
  aspectRatio: string;
  shaderPreset: string;
  eqGainsJson: string;
  nightModeEnabled: boolean;
}

export interface MediaSessionBundle {
  mediaId: string;
  history: MediaHistoryItem | null;
  preferences: MediaPreferences;
  bookmarks: MediaBookmark[];
}

export interface PlayerStoreState {
  // Engine & Media Identity
  engine: IPlayerEngine | null;
  activeEngineType: EngineType;
  currentMediaId: string | null;
  currentUri: string | null;
  currentTitle: string;

  // Real-Time Playback Telemetry
  positionMs: number;
  durationMs: number;
  bufferedMs: number;
  isPaused: boolean;
  isBuffering: boolean;
  volume: number;
  isMuted: boolean;
  playbackRate: number;
  audioTracks: TrackInfo[];
  subtitleTracks: TrackInfo[];
  chapters: ChapterInfo[];

  // Audio DSP & Shaders
  eqGainsDb: number[];
  nightModeEnabled: boolean;
  shaderConfig: VideoShaderConfig;

  // SQLite Hydrated State
  recentMedia: MediaHistoryItem[];
  bookmarks: MediaBookmark[];
  resumeBannerPositionMs: number | null;

  // Error & Recovery State
  lastError: PlayerErrorEnvelope | null;
  retryCount: number;

  // Actions
  bootEngine: (preferred?: EngineType, videoEl?: HTMLVideoElement) => Promise<void>;
  openMedia: (uri: string, title?: string, autoResume?: boolean) => Promise<void>;
  togglePlay: () => Promise<void>;
  seek: (timestampMs: number, exact?: boolean) => Promise<void>;
  setVolume: (volume: number) => Promise<void>;
  setPlaybackRate: (rate: number) => Promise<void>;
  setEqualizer: (gainsDb: number[], nightMode: boolean) => Promise<void>;
  addBookmark: (label: string) => Promise<void>;
  refreshRecentMedia: () => Promise<void>;
  dismissError: () => void;
}

const isTauriRuntime = () => typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;

let lastSqliteSyncMs = 0;

export const usePlayerStore = create<PlayerStoreState>((set, get) => ({
  engine: null,
  activeEngineType: isTauriRuntime() ? 'tauri-mpv' : 'web-media',
  currentMediaId: null,
  currentUri: null,
  currentTitle: '',

  positionMs: 0,
  durationMs: 0,
  bufferedMs: 0,
  isPaused: true,
  isBuffering: false,
  volume: 100,
  isMuted: false,
  playbackRate: 1.0,
  audioTracks: [],
  subtitleTracks: [],
  chapters: [],

  eqGainsDb: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  nightModeEnabled: false,
  shaderConfig: {
    ambientGlowEnabled: true,
    sharpness: 0.2,
    contrast: 1.0,
    saturation: 1.0,
    upscaleMode: 'none',
  },

  recentMedia: [],
  bookmarks: [],
  resumeBannerPositionMs: null,

  lastError: null,
  retryCount: 0,

  bootEngine: async (preferred, videoEl) => {
    const current = get().engine;
    if (current) await current.destroy();

    const targetType: EngineType =
      preferred ?? (isTauriRuntime() ? 'tauri-mpv' : 'web-media');

    const engine: IPlayerEngine =
      targetType === 'tauri-mpv' ? new TauriMpvEngine() : new WebMediaEngine();

    engine.onTelemetry((telemetry: PlaybackTelemetry) => {
      set({
        positionMs: telemetry.positionMs,
        durationMs: telemetry.durationMs,
        bufferedMs: telemetry.bufferedMs,
        isPaused: telemetry.isPaused,
        isBuffering: telemetry.isBuffering,
        playbackRate: telemetry.playbackRate,
        volume: telemetry.volume,
        isMuted: telemetry.isMuted,
        audioTracks: telemetry.audioTracks,
        subtitleTracks: telemetry.subtitleTracks,
        chapters: telemetry.chapters,
      });

      // Throttled SQLite checkpoint every 2,000ms during active playback
      const now = Date.now();
      const mediaId = get().currentMediaId;
      if (isTauriRuntime() && mediaId && !telemetry.isPaused && now - lastSqliteSyncMs > 2000) {
        lastSqliteSyncMs = now;
        invoke('db_update_progress', {
          mediaId,
          positionMs: telemetry.positionMs,
          durationMs: telemetry.durationMs,
        }).catch(() => {});
      }
    });

    engine.onError(async (error: PlayerErrorEnvelope) => {
      set({ lastError: error });

      // Automated Self-Healing Recovery Execution
      if (error.recovery === 'fallback_to_web_engine' && get().activeEngineType !== 'web-media') {
        await get().bootEngine('web-media', videoEl);
        const uri = get().currentUri;
        if (uri) await get().openMedia(uri, get().currentTitle);
      } else if (error.recovery === 'retry_with_backoff' && get().retryCount < 3) {
        const nextRetry = get().retryCount + 1;
        set({ retryCount: nextRetry });
        const delayMs = Math.pow(2, nextRetry) * 500;
        setTimeout(() => {
          const uri = get().currentUri;
          if (uri) get().engine?.load(uri, get().positionMs);
        }, delayMs);
      } else if (error.recovery === 'reset_audio_filters') {
        await get().setEqualizer([0, 0, 0, 0, 0, 0, 0, 0, 0, 0], false);
      }
    });

    try {
      await engine.initialize(videoEl);
      set({ engine, activeEngineType: engine.engineType, lastError: null });
      if (isTauriRuntime()) {
        await get().refreshRecentMedia();
      }
    } catch (err) {
      const parsed = parsePlayerError(err);
      if (targetType === 'tauri-mpv') {
        // Automatic fallback to WebMediaEngine if libmpv fails to initialize
        await get().bootEngine('web-media', videoEl);
      } else {
        set({ lastError: parsed });
      }
    }
  },

  openMedia: async (uri, title, autoResume = true) => {
    const resolvedTitle = title ?? uri.split(/[\\/]/).pop() ?? 'Untitled Media';
    let startPos = 0;

    if (isTauriRuntime()) {
      try {
        const session = await invoke<MediaSessionBundle>('db_load_or_init_session', {
          uri,
          title: resolvedTitle,
        });

        const parsedEq: number[] = JSON.parse(session.preferences.eqGainsJson || '[0,0,0,0,0,0,0,0,0,0]');
        const savedPos = session.history?.lastPositionMs ?? 0;
        startPos = autoResume ? savedPos : 0;

        set({
          currentMediaId: session.mediaId,
          currentUri: uri,
          currentTitle: resolvedTitle,
          bookmarks: session.bookmarks,
          eqGainsDb: parsedEq,
          nightModeEnabled: session.preferences.nightModeEnabled,
          playbackRate: session.preferences.playbackRate,
          resumeBannerPositionMs: !autoResume && savedPos > 0 ? savedPos : null,
          retryCount: 0,
        });

        await get().engine?.load(uri, startPos);
        await get().engine?.setPlaybackRate(session.preferences.playbackRate);
        await get().engine?.setEqualizer(parsedEq, session.preferences.nightModeEnabled);

        if (session.preferences.audioTrackId) {
          await get().engine?.setAudioTrack(session.preferences.audioTrackId);
        }
        if (session.preferences.subtitleTrackId) {
          await get().engine?.setSubtitleTrack(session.preferences.subtitleTrackId);
        }

        await get().refreshRecentMedia();
        return;
      } catch (err) {
        set({ lastError: parsePlayerError(err) });
      }
    }

    // Browser-only fallback path
    set({ currentUri: uri, currentTitle: resolvedTitle, retryCount: 0 });
    await get().engine?.load(uri, startPos);
  },

  togglePlay: async () => {
    const { engine, isPaused, currentMediaId, positionMs, durationMs } = get();
    if (!engine) return;

    if (isPaused) {
      await engine.play();
      set({ isPaused: false });
    } else {
      await engine.pause();
      set({ isPaused: true });
      if (isTauriRuntime() && currentMediaId) {
        await invoke('db_update_progress', {
          mediaId: currentMediaId,
          positionMs,
          durationMs,
        }).catch(() => {});
      }
    }
  },

  seek: async (timestampMs, exact = false) => {
    set({ positionMs: timestampMs }); // Optimistic UI update
    await get().engine?.seek(timestampMs, exact);
  },

  setVolume: async (volume) => {
    set({ volume });
    await get().engine?.setVolume(volume);
  },

  setPlaybackRate: async (rate) => {
    set({ playbackRate: rate });
    await get().engine?.setPlaybackRate(rate);
  },

  setEqualizer: async (gainsDb, nightMode) => {
    set({ eqGainsDb: gainsDb, nightModeEnabled: nightMode });
    await get().engine?.setEqualizer(gainsDb, nightMode);

    const { currentMediaId, playbackRate } = get();
    if (isTauriRuntime() && currentMediaId) {
      await invoke('db_save_preferences', {
        prefs: {
          mediaId: currentMediaId,
          audioTrackId: null,
          subtitleTrackId: null,
          audioDelayMs: 0,
          subtitleDelayMs: 0,
          playbackRate,
          aspectRatio: 'auto',
          shaderPreset: 'ambient_default',
          eqGainsJson: JSON.stringify(gainsDb),
          nightModeEnabled: nightMode,
        },
      }).catch(() => {});
    }
  },

  addBookmark: async (label) => {
    const { currentMediaId, positionMs, bookmarks } = get();
    if (!isTauriRuntime() || !currentMediaId) return;

    const newBookmark = await invoke<MediaBookmark>('db_add_bookmark', {
      mediaId: currentMediaId,
      timestampMs: positionMs,
      label,
    });
    set({
      bookmarks: [...bookmarks, newBookmark].sort((a, b) => a.timestampMs - b.timestampMs),
    });
  },

  refreshRecentMedia: async () => {
    if (!isTauriRuntime()) return;
    const items = await invoke<MediaHistoryItem[]>('db_get_recent_media', { limit: 25 });
    set({ recentMedia: items });
  },

  dismissError: () => set({ lastError: null }),
}));
