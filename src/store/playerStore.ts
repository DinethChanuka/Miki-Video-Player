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
import { PlayerThemeId } from '../types/theme';
import {
  SpatialAudioEngine,
  SpatialAudioState,
  SpeakerLevels,
  SpatialProfileId,
  DEFAULT_SPATIAL_STATE,
} from '../core/SpatialAudioEngine';

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

export interface YouTubeHistoryItem {
  id: string;
  url: string;
  title: string;
  timestamp: number;
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
  isLooping: boolean;

  // Real-Time Playback Telemetry
  positionMs: number;
  durationMs: number;
  bufferedMs: number;
  isPaused: boolean;
  isBuffering: boolean;
  volume: number; // 0 to 200 (%)
  isMuted: boolean;
  playbackRate: number;
  audioTracks: TrackInfo[];
  subtitleTracks: TrackInfo[];
  chapters: ChapterInfo[];

  // Audio DSP & Shaders
  eqGainsDb: number[];
  nightModeEnabled: boolean;
  shaderConfig: VideoShaderConfig;

  // Themes & Customization
  themeId: PlayerThemeId;
  setTheme: (themeId: PlayerThemeId) => void;

  // Hydrated State & History
  recentMedia: MediaHistoryItem[];
  bookmarks: MediaBookmark[];
  youtubeHistory: YouTubeHistoryItem[];
  resumeBannerPositionMs: number | null;

  // Error & Recovery State
  lastError: PlayerErrorEnvelope | null;
  retryCount: number;

  // 3D Spatial Audio & Multi-Speaker System
  spatialAudio: SpatialAudioEngine;
  spatialState: SpatialAudioState;
  setSpatialAudioEnabled: (enabled: boolean) => void;
  setSpatialProfile: (profile: SpatialProfileId) => void;
  setSpatialCoordinates: (x: number, y: number, z: number) => void;
  setSpeakerVolume: (speaker: keyof SpeakerLevels, volume: number) => void;
  setLfeCrossover: (hz: number) => void;

  // Video Super-Resolution & Split Comparison
  setSuperResolution: (mode: VideoShaderConfig['superResolution']) => void;
  setSplitCompare: (enabled: boolean, position?: number) => void;

  // Track & Playlist Navigation
  playNextMedia: () => Promise<void>;
  playPreviousMedia: () => Promise<void>;

  // Thumbnail stopped-point persistence
  saveCurrentThumbnail: (dataUrl: string) => void;

  // Actions
  bootEngine: (preferred?: EngineType, videoEl?: HTMLVideoElement) => Promise<void>;
  openMedia: (uri: string, title?: string, autoResume?: boolean) => Promise<void>;
  closeMedia: () => Promise<void>;
  togglePlay: () => Promise<void>;
  seek: (timestampMs: number, exact?: boolean) => Promise<void>;
  setVolume: (volume: number) => Promise<void>;
  setPlaybackRate: (rate: number) => Promise<void>;
  setEqualizer: (gainsDb: number[], nightMode: boolean) => Promise<void>;
  updateShaderConfig: (config: Partial<VideoShaderConfig>) => Promise<void>;
  toggleLoop: () => void;
  takeSnapshot: () => void;
  addBookmark: (label?: string) => Promise<void>;
  removeRecentMedia: (uri: string) => void;
  addYouTubeHistory: (url: string, title?: string) => void;
  removeYouTubeHistory: (url: string) => void;
  refreshRecentMedia: () => Promise<void>;
  dismissError: () => void;
}

const isTauriRuntime = () => typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;

const STORAGE_KEY_RECENT = 'miki_recent_media';
const STORAGE_KEY_BOOKMARKS = 'miki_bookmarks';

const loadStoredRecentMedia = (): MediaHistoryItem[] => {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY_RECENT);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const saveStoredRecentMedia = (items: MediaHistoryItem[]) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY_RECENT, JSON.stringify(items.slice(0, 30)));
  } catch {}
};

const loadStoredBookmarks = (): MediaBookmark[] => {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY_BOOKMARKS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const saveStoredBookmarks = (items: MediaBookmark[]) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY_BOOKMARKS, JSON.stringify(items.slice(0, 50)));
  } catch {}
};

const STORAGE_KEY_THEME = 'miki_player_theme';
const STORAGE_KEY_YOUTUBE = 'miki_youtube_history';

const loadStoredTheme = (): PlayerThemeId => {
  if (typeof window === 'undefined') return 'cyberpunk';
  try {
    const raw = localStorage.getItem(STORAGE_KEY_THEME);
    return (raw as PlayerThemeId) || 'cyberpunk';
  } catch {
    return 'cyberpunk';
  }
};

const saveStoredTheme = (themeId: PlayerThemeId) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY_THEME, themeId);
  } catch {}
};

const loadStoredYouTubeHistory = (): YouTubeHistoryItem[] => {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY_YOUTUBE);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const saveStoredYouTubeHistory = (items: YouTubeHistoryItem[]) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY_YOUTUBE, JSON.stringify(items.slice(0, 30)));
  } catch {}
};

let lastSqliteSyncMs = 0;

export const usePlayerStore = create<PlayerStoreState>((set, get) => ({
  engine: null,
  activeEngineType: isTauriRuntime() ? 'tauri-mpv' : 'web-media',
  currentMediaId: null,
  currentUri: null,
  currentTitle: '',
  isLooping: false,

  positionMs: 0,
  durationMs: 0,
  bufferedMs: 0,
  isPaused: true,
  isBuffering: false,
  volume: 100, // Default 100%, can boost up to 200%
  isMuted: false,
  playbackRate: 1.0,
  audioTracks: [],
  subtitleTracks: [],
  chapters: [],

  eqGainsDb: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  nightModeEnabled: false,
  shaderConfig: {
    ambientGlowEnabled: true,
    brightness: 0,
    contrast: 1.0,
    saturation: 1.0,
    sharpness: 0.2,
    clarityBoost: 0,
    deNoise: 0,
    deBanding: false,
    superResolution: 'off',
    splitCompareEnabled: false,
    splitComparePosition: 50,
    aspectRatio: 'auto',
    upscaleMode: 'none',
  },

  spatialAudio: new SpatialAudioEngine(),
  spatialState: { ...DEFAULT_SPATIAL_STATE },
  setSpatialAudioEnabled: (enabled) => {
    get().spatialAudio.setEnabled(enabled);
    set((state) => ({
      spatialState: { ...state.spatialState, enabled },
    }));
  },
  setSpatialProfile: (profile) => {
    get().spatialAudio.setProfile(profile);
    set({ spatialState: get().spatialAudio.getState() });
  },
  setSpatialCoordinates: (x, y, z) => {
    get().spatialAudio.setCoordinates(x, y, z);
    set((state) => ({
      spatialState: {
        ...state.spatialState,
        coordinates: { x, y, z },
      },
    }));
  },
  setSpeakerVolume: (speaker, volume) => {
    get().spatialAudio.setSpeakerVolume(speaker, volume);
    set((state) => ({
      spatialState: {
        ...state.spatialState,
        speakers: { ...state.spatialState.speakers, [speaker]: volume },
      },
    }));
  },
  setLfeCrossover: (hz) => {
    const next = { ...get().spatialState, lfeCrossoverHz: hz };
    get().spatialAudio.applyState(next);
    set({ spatialState: next });
  },
  setSuperResolution: (mode) => {
    get().updateShaderConfig({ superResolution: mode });
  },
  setSplitCompare: (enabled, position) => {
    get().updateShaderConfig({
      splitCompareEnabled: enabled,
      ...(position !== undefined ? { splitComparePosition: position } : {}),
    });
  },
  playNextMedia: async () => {
    const { recentMedia, currentUri, openMedia } = get();
    if (recentMedia.length <= 1) return;
    const idx = recentMedia.findIndex((m) => m.uri === currentUri);
    const nextIdx = (idx + 1) % recentMedia.length;
    const nextItem = recentMedia[nextIdx];
    if (nextItem) {
      await openMedia(nextItem.uri, nextItem.title);
    }
  },
  playPreviousMedia: async () => {
    const { recentMedia, currentUri, openMedia } = get();
    if (recentMedia.length <= 1) return;
    const idx = recentMedia.findIndex((m) => m.uri === currentUri);
    const prevIdx = (idx - 1 + recentMedia.length) % recentMedia.length;
    const prevItem = recentMedia[prevIdx];
    if (prevItem) {
      await openMedia(prevItem.uri, prevItem.title);
    }
  },
  saveCurrentThumbnail: (dataUrl) => {
    const { currentUri, recentMedia } = get();
    if (!currentUri || !dataUrl) return;
    const updated = recentMedia.map((m) =>
      m.uri === currentUri ? { ...m, thumbnailUri: dataUrl } : m
    );
    saveStoredRecentMedia(updated);
    set({ recentMedia: updated });
  },

  themeId: loadStoredTheme(),
  setTheme: (themeId) => {
    set({ themeId });
    saveStoredTheme(themeId);
  },

  recentMedia: loadStoredRecentMedia(),
  bookmarks: loadStoredBookmarks(),
  youtubeHistory: loadStoredYouTubeHistory(),
  resumeBannerPositionMs: null,

  addYouTubeHistory: (url, title) => {
    const parsedId = url.match(/(?:youtube\.com\/(?:watch\?.*v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/)?.[1] || '';
    if (!parsedId) return;
    const existing = get().youtubeHistory;
    const item: YouTubeHistoryItem = {
      id: parsedId,
      url,
      title: title || `YouTube Stream (${parsedId})`,
      timestamp: Date.now(),
    };
    const updated = [item, ...existing.filter((y) => y.id !== parsedId)].slice(0, 30);
    set({ youtubeHistory: updated });
    saveStoredYouTubeHistory(updated);
  },

  removeYouTubeHistory: (url) => {
    const updated = get().youtubeHistory.filter((y) => y.url !== url && y.id !== url);
    set({ youtubeHistory: updated });
    saveStoredYouTubeHistory(updated);
  },

  removeRecentMedia: (uri) => {
    const updated = get().recentMedia.filter((m) => m.uri !== uri);
    set({ recentMedia: updated });
    saveStoredRecentMedia(updated);
  },

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

      // Handle video loop completion
      if (get().isLooping && telemetry.durationMs > 0 && telemetry.positionMs >= telemetry.durationMs - 200) {
        get().seek(0);
        get().engine?.play();
      }

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

      // Live progress persistence for recently played card displays
      const curUri = get().currentUri;
      if (curUri && telemetry.durationMs > 0 && !telemetry.isPaused) {
        const pct = Math.min(100, Math.round((telemetry.positionMs / telemetry.durationMs) * 100));
        const recents = get().recentMedia;
        const target = recents.find((r) => r.uri === curUri);
        if (target && target.progressPercent !== pct) {
          target.progressPercent = pct;
          target.lastPositionMs = telemetry.positionMs;
          target.durationMs = telemetry.durationMs;
          saveStoredRecentMedia(recents);
        }
      }
    });

    engine.onError(async (error: PlayerErrorEnvelope) => {
      // Never display codec errors or trigger retry loops for YouTube embeds
      const curUri = get().currentUri;
      if (curUri && /(?:youtube\.com|youtu\.be)/.test(curUri)) {
        return;
      }

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
          if (uri && !/(?:youtube\.com|youtu\.be)/.test(uri)) {
            get().engine?.load(uri, get().positionMs);
          }
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
        await get().bootEngine('web-media', videoEl);
      } else {
        set({ lastError: parsed });
      }
    }
  },

  openMedia: async (uri, title, autoResume = true) => {
    const resolvedTitle = title ?? uri.split(/[\\/]/).pop() ?? 'Untitled Media';
    let startPos = 0;

    // Check if it's a YouTube URL! If so, don't pass to HTML5 <video>
    const isYouTube = /(?:youtube\.com\/(?:watch\?.*v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/.test(uri);
    if (isYouTube) {
      get().addYouTubeHistory(uri, resolvedTitle);
      const video = document.getElementById('aether-video-viewport') as HTMLVideoElement | null;
      if (video) {
        video.pause();
        video.removeAttribute('src');
        video.load();
      }
      set({
        currentUri: uri,
        currentTitle: resolvedTitle,
        retryCount: 0,
        lastError: null,
        isPaused: false,
      });
      return;
    }

    // Record and persist to recent media (both web/local & Tauri)
    const existingRecent = get().recentMedia;
    const existingItem = existingRecent.find((m) => m.uri === uri);
    const savedPos = existingItem?.lastPositionMs ?? 0;
    if (!isTauriRuntime()) {
      startPos = autoResume ? savedPos : 0;
    }
    const mediaId = uri;
    const newHistoryItem: MediaHistoryItem = {
      mediaId,
      uri,
      title: resolvedTitle,
      durationMs: existingItem?.durationMs ?? 0,
      lastPositionMs: startPos > 0 ? startPos : (existingItem?.lastPositionMs ?? 0),
      progressPercent: existingItem?.progressPercent ?? 0,
      isCompleted: false,
      playCount: (existingItem?.playCount ?? 0) + 1,
      lastPlayedAt: Date.now(),
      thumbnailUri: existingItem?.thumbnailUri,
    };

    const updatedRecent = [
      newHistoryItem,
      ...existingRecent.filter((m) => m.uri !== uri),
    ].slice(0, 30);

    set({ recentMedia: updatedRecent });
    saveStoredRecentMedia(updatedRecent);

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

    // Web / Standalone mode
    set({
      currentUri: uri,
      currentTitle: resolvedTitle,
      retryCount: 0,
      lastError: null,
      resumeBannerPositionMs: null,
    });
    await get().engine?.load(uri, startPos);
    await get().engine?.play();
  },

  closeMedia: async () => {
    const engine = get().engine;
    if (engine) {
      await engine.pause();
    }
    set({
      currentUri: null,
      currentTitle: '',
      currentMediaId: null,
      positionMs: 0,
      durationMs: 0,
      isPaused: true,
      resumeBannerPositionMs: null,
    });
  },

  togglePlay: async () => {
    const { engine, isPaused, currentMediaId, positionMs, durationMs } = get();

    // Direct DOM element control for 100% reliable local video playback
    const video = (document.getElementById('aether-video-viewport') as HTMLVideoElement) || null;
    if (video) {
      if (video.paused) {
        try {
          await video.play();
          set({ isPaused: false });
        } catch {
          video.muted = false;
          await video.play().catch(() => {});
          set({ isPaused: false });
        }
        if (engine && 'play' in engine) {
          await engine.play().catch(() => {});
        }
      } else {
        video.pause();
        set({ isPaused: true });
        if (engine && 'pause' in engine) {
          await engine.pause().catch(() => {});
        }
      }
      return;
    }

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
    set({ positionMs: timestampMs });
    await get().engine?.seek(timestampMs, exact);
  },

  setVolume: async (volume) => {
    // Allows 0% to 200% VLC overdrive
    const clamped = Math.max(0, Math.min(200, volume));
    set({ volume: clamped, isMuted: clamped === 0 });
    await get().engine?.setVolume(clamped);
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

  updateShaderConfig: async (partial) => {
    const updated = { ...get().shaderConfig, ...partial };
    set({ shaderConfig: updated });
    await get().engine?.applyVideoFilter(updated);
  },

  toggleLoop: () => {
    set((s) => ({ isLooping: !s.isLooping }));
  },

  takeSnapshot: () => {
    const engine = get().engine;
    if (engine?.captureSnapshot) {
      const dataUrl = engine.captureSnapshot();
      if (dataUrl) {
        const a = document.createElement('a');
        a.href = dataUrl;
        a.download = `aether-snapshot-${Date.now()}.png`;
        a.click();
      }
    }
  },

  addBookmark: async (label) => {
    const { currentUri, positionMs, bookmarks, currentMediaId } = get();
    const targetUri = currentUri || currentMediaId;
    if (!targetUri) return;

    const formatMs = (ms: number) => {
      const totalSec = Math.max(0, Math.floor(ms / 1000));
      const m = Math.floor(totalSec / 60);
      const s = totalSec % 60;
      return `${m}:${s.toString().padStart(2, '0')}`;
    };

    const newBookmark: MediaBookmark = {
      id: Date.now(),
      mediaId: targetUri,
      timestampMs: positionMs,
      label: label || `Bookmark at ${formatMs(positionMs)}`,
      createdAt: Date.now(),
    };

    if (isTauriRuntime() && currentMediaId) {
      try {
        const saved = await invoke<MediaBookmark>('db_add_bookmark', {
          mediaId: currentMediaId,
          timestampMs: positionMs,
          label: newBookmark.label,
        });
        newBookmark.id = saved.id;
      } catch {}
    }

    const updated = [...bookmarks, newBookmark].sort((a, b) => a.timestampMs - b.timestampMs);
    set({ bookmarks: updated });
    saveStoredBookmarks(updated);

    // Provide friendly confirmation toast to user
    set({
      lastError: {
        code: 'BOOKMARK_SAVED',
        message: `🔖 ${newBookmark.label} saved successfully!`,
        severity: 'recoverable',
        recovery: 'none',
        timestampMs: Date.now(),
      },
    });

    setTimeout(() => {
      if (get().lastError?.code === 'BOOKMARK_SAVED') {
        get().dismissError();
      }
    }, 2500);
  },

  refreshRecentMedia: async () => {
    if (isTauriRuntime()) {
      const items = await invoke<MediaHistoryItem[]>('db_get_recent_media', { limit: 25 });
      set({ recentMedia: items });
      saveStoredRecentMedia(items);
    } else {
      set({ recentMedia: loadStoredRecentMedia() });
    }
  },

  dismissError: () => set({ lastError: null }),
}));
