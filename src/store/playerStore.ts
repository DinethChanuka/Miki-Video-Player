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
import { MediaEngineRouter } from '../core/MediaEngineRouter';
import { PlayerThemeId } from '../types/theme';
import {
  SpatialAudioEngine,
  SpatialAudioState,
  SpeakerLevels,
  SpatialProfileId,
  DEFAULT_SPATIAL_STATE,
} from '../core/SpatialAudioEngine';
import {
  SubtitleTrackData,
  SubtitleStyleConfig,
  DEFAULT_SUBTITLE_STYLE,
  parseSubtitleText,
  memorizeSubtitleForVideo,
  getMemorizedSubtitleForVideo,
} from '../core/SubtitleManager';
import { getWebsiteFaviconUrl, extractDomain } from '../utils/faviconService';
import {
  getOSPresetDirectories,
  extractCleanFileName,
} from '../utils/pathUtils';
import { parseWebStream, isDirectMediaUrl, WebPlatform } from '../utils/webStreamUtils';
import { getChannelByUri, getChannelBackupUrl, getChannelByName, CURATED_CHANNELS } from '../utils/channelCatalog';
import { StreamFailoverManager } from '../core/StreamFailoverManager.ts';
import { ALBUM_POSTERS } from '../utils/mediaPosters';
import { CINESUBZ_MOVIES } from '../utils/cinesubzService';

let activeFailoverManager: StreamFailoverManager | null = null;

export function lookupArtwork(uri: string, title?: string, explicitArtwork?: string): string | undefined {
  if (explicitArtwork) return explicitArtwork;
  if (!uri) return undefined;

  // 1. Channel catalog matching
  const ch = CURATED_CHANNELS.find(
    (c) => c.streamUrl === uri || (title && c.name.toLowerCase() === title.toLowerCase())
  );
  if (ch?.logo) return ch.logo;

  // 2. Known music tracks and albums
  const lowerTitle = (title || '').toLowerCase();
  const lowerUri = uri.toLowerCase();
  if (lowerTitle.includes('dooriyan') || lowerUri.includes('dooriyan')) return ALBUM_POSTERS.dooriyan;
  if (lowerTitle.includes('soniyo') || lowerUri.includes('soniyo')) return ALBUM_POSTERS.soniyo;
  if (lowerTitle.includes('bin tere') || lowerUri.includes('bin tere')) return ALBUM_POSTERS.binTere;
  if (lowerTitle.includes('darkhaast') || lowerUri.includes('darkhaast')) return ALBUM_POSTERS.darkhaast;
  if (lowerTitle.includes('tujhko') || lowerUri.includes('tujhko')) return ALBUM_POSTERS.tujhkoJoPaaya;
  if (lowerTitle.includes('blackpink') || lowerTitle.includes('black pink')) {
    return 'https://upload.wikimedia.org/wikipedia/en/b/be/Blackpink_-_The_Album.png';
  }
  if (lowerTitle.includes('bts') || lowerTitle.includes('dynamite') || lowerTitle.includes('butter')) {
    return 'https://upload.wikimedia.org/wikipedia/en/5/50/BTS_-_Butter.png';
  }
  if (lowerTitle.includes('taylor swift') || lowerTitle.includes('cardigan') || lowerTitle.includes('anti-hero') || lowerTitle.includes('lover')) {
    return 'https://upload.wikimedia.org/wikipedia/en/9/9f/Midnights_-_Taylor_Swift.png';
  }

  // 3. CineSubz movies
  const movie = CINESUBZ_MOVIES.find(
    (m) => m.watchUrl === uri || m.downloadUrl === uri || (title && m.title.toLowerCase() === title.toLowerCase())
  );
  if (movie?.posterUrl) return movie.posterUrl;
  if (movie?.remotePosterUrl) return movie.remotePosterUrl;

  return undefined;
}

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
  isYouTube?: boolean;
  youtubeId?: string;
  webPlatform?: WebPlatform;
  webStreamId?: string;
  webDomain?: string;
  faviconUrl?: string;
}

export interface BookmarkedWebsite {
  id: string;
  title: string;
  url: string;
  domain: string;
  faviconUrl?: string;
  badge?: string;
  addedAt: number;
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
  lastPositionMs?: number;
  durationMs?: number;
  progressPercent?: number;
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
  router: MediaEngineRouter | null;
  activeEngineType: EngineType;
  currentSessionId: string;
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
  dspBypass: boolean;
  setDspBypass: (bypass: boolean) => void;
  toggleDspBypass: () => void;
  shaderConfig: VideoShaderConfig;

  // Themes & Customization
  themeId: PlayerThemeId;
  setTheme: (themeId: PlayerThemeId) => void;

  // Hydrated State & History
  recentMedia: MediaHistoryItem[];
  bookmarks: MediaBookmark[];
  bookmarkedWebsites: BookmarkedWebsite[];
  toggleWebsiteBookmark: (
    urlOrObj: string | { url: string; title?: string; badge?: string; faviconUrl?: string },
    title?: string,
    badge?: string
  ) => void;
  removeWebsiteBookmark: (urlOrId: string) => void;
  isWebsiteBookmarked: (url: string) => boolean;
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

  // Playback Mode & Music Studio Routing
  activePlaybackMode: 'video' | 'music' | 'radio';
  setActivePlaybackMode: (mode: 'video' | 'music' | 'radio') => void;
  currentArtwork: string | null;
  setCurrentArtwork: (url: string | null) => void;
  isMusicPlayerOpen: boolean;
  setMusicPlayerOpen: (open: boolean) => void;

  // Track & Playlist Navigation
  playNextMedia: () => Promise<void>;
  playPreviousMedia: () => Promise<void>;

  // Thumbnail stopped-point persistence
  saveCurrentThumbnail: (dataUrl: string) => void;

  // Navigation & Category History Preservation
  lastActiveNav: string;
  setLastActiveNav: (nav: string) => void;
  lastActiveCategory: string;
  setLastActiveCategory: (category: string) => void;

  // Actions
  bootEngine: (preferred?: EngineType, videoEl?: HTMLVideoElement) => Promise<void>;
  handleStreamError: (error: PlayerErrorEnvelope) => Promise<void>;
  openMedia: (uri: string, title?: string, autoResume?: boolean, startPositionMs?: number, artworkUrl?: string, mediaType?: 'video' | 'music' | 'radio') => Promise<void>;
  closeMedia: () => Promise<void>;
  togglePlay: () => Promise<void>;
  seek: (timestampMs: number, exact?: boolean) => Promise<void>;
  setVolume: (volume: number) => Promise<void>;
  setMuted: (muted: boolean) => Promise<void>;
  toggleMute: () => Promise<void>;
  setPlaybackRate: (rate: number) => Promise<void>;
  setEqualizer: (gainsDb: number[], nightMode: boolean) => Promise<void>;
  updateShaderConfig: (config: Partial<VideoShaderConfig>) => Promise<void>;
  toggleLoop: () => void;
  takeSnapshot: () => void;
  screenshotDirectory: string;
  setScreenshotDirectory: (dir: string) => void;
  snapshotNotification: string | null;
  setSnapshotNotification: (msg: string | null) => void;
  customBgImage: string | null;
  customBgOpacity: number;
  customBgBlur: number;
  customBgBrightness: number;
  customBgTint: 'obsidian' | 'navy' | 'aurora' | 'amethyst' | 'clear';
  setCustomBgImage: (url: string | null) => void;
  setCustomBgOpacity: (opacity: number) => void;
  setCustomBgBlur: (blur: number) => void;
  setCustomBgBrightness: (brightness: number) => void;
  setCustomBgTint: (tint: 'obsidian' | 'navy' | 'aurora' | 'amethyst' | 'clear') => void;
  
  // Sound System Advanced Controls
  preampGain: number;
  stereoPan: number;
  setPreampGain: (gain: number) => void;
  setStereoPan: (pan: number) => void;
  playAudioTestChime: () => void;

  // Subtitle & Caption Management
  activeSubtitleTrack: SubtitleTrackData | null;
  isSubtitlesVisible: boolean;
  subtitleStyle: SubtitleStyleConfig;
  loadSubtitleFromFile: (file: File) => Promise<void>;
  loadSubtitleFromText: (fileName: string, content: string, syncOffset?: number) => void;
  setSubtitleSyncOffset: (offsetSec: number) => void;
  toggleSubtitles: () => void;
  updateSubtitleStyle: (style: Partial<SubtitleStyleConfig>) => void;
  clearSubtitle: () => void;

  // YouTube stopped place persistence
  saveYouTubeProgress: (youtubeId: string, positionMs: number, durationMs: number) => void;

  // Stream Quality Levels (HLS ABR & Manual Level Switching)
  streamQualityLevels: Array<{ id: number; name: string; height: number; width: number; bitrate: number }>;
  currentQualityLevel: number;
  setStreamQuality: (levelId: number) => void;
  updateStreamQualityLevels: (levels: Array<{ id: number; name: string; height: number; width: number; bitrate: number }>) => void;

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
    const recents: MediaHistoryItem[] = raw ? JSON.parse(raw) : [];

    // Merge any previous YouTube history items into recents
    const rawYt = localStorage.getItem(STORAGE_KEY_YOUTUBE);
    const yts: YouTubeHistoryItem[] = rawYt ? JSON.parse(rawYt) : [];

    for (const yt of yts) {
      if (!recents.some((r) => r.uri === yt.url || r.youtubeId === yt.id)) {
        recents.push({
          mediaId: yt.url,
          uri: yt.url,
          title: yt.title,
          durationMs: 0,
          lastPositionMs: 0,
          progressPercent: 100,
          isCompleted: false,
          playCount: 1,
          lastPlayedAt: yt.timestamp,
          thumbnailUri: `https://img.youtube.com/vi/${yt.id}/mqdefault.jpg`,
          isYouTube: true,
          youtubeId: yt.id,
        });
      }
    }

    return recents.sort((a, b) => (b.lastPlayedAt || 0) - (a.lastPlayedAt || 0)).slice(0, 30);
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

const STORAGE_KEY_BOOKMARKED_WEBSITES = 'miki_bookmarked_websites';

const loadStoredBookmarkedWebsites = (): BookmarkedWebsite[] => {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY_BOOKMARKED_WEBSITES);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const saveStoredBookmarkedWebsites = (items: BookmarkedWebsite[]) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY_BOOKMARKED_WEBSITES, JSON.stringify(items.slice(0, 100)));
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

const STORAGE_KEY_SCREENSHOT_DIR = 'miki_screenshot_directory';
export const DEFAULT_SCREENSHOT_DIR = getOSPresetDirectories()[0]?.path || '~/Pictures/Miki Player/Screenshots';

const loadStoredScreenshotDirectory = (): string => {
  if (typeof window === 'undefined') return DEFAULT_SCREENSHOT_DIR;
  try {
    return localStorage.getItem(STORAGE_KEY_SCREENSHOT_DIR) || DEFAULT_SCREENSHOT_DIR;
  } catch {
    return DEFAULT_SCREENSHOT_DIR;
  }
};

const saveStoredScreenshotDirectory = (dir: string) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY_SCREENSHOT_DIR, dir);
  } catch {}
};

const STORAGE_KEY_BG_IMAGE = 'miki_custom_bg_image';
const STORAGE_KEY_BG_OPACITY = 'miki_custom_bg_opacity';
const STORAGE_KEY_BG_BLUR = 'miki_custom_bg_blur';
const STORAGE_KEY_BG_BRIGHTNESS = 'miki_custom_bg_brightness';
const STORAGE_KEY_BG_TINT = 'miki_custom_bg_tint';

export const DEFAULT_BG_IMAGE = 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=1920&q=80'; // Deep Nebula

const loadStoredBgImage = (): string | null => {
  if (typeof window === 'undefined') return DEFAULT_BG_IMAGE;
  try {
    const v = localStorage.getItem(STORAGE_KEY_BG_IMAGE);
    return v !== null ? v : DEFAULT_BG_IMAGE;
  } catch {
    return DEFAULT_BG_IMAGE;
  }
};

const loadStoredBgOpacity = (): number => {
  if (typeof window === 'undefined') return 0.55;
  try {
    const v = localStorage.getItem(STORAGE_KEY_BG_OPACITY);
    return v !== null ? parseFloat(v) : 0.55;
  } catch {
    return 0.55;
  }
};

const loadStoredBgBlur = (): number => {
  if (typeof window === 'undefined') return 22;
  try {
    const v = localStorage.getItem(STORAGE_KEY_BG_BLUR);
    return v !== null ? parseFloat(v) : 22;
  } catch {
    return 22;
  }
};

const loadStoredBgBrightness = (): number => {
  if (typeof window === 'undefined') return 1.0;
  try {
    const v = localStorage.getItem(STORAGE_KEY_BG_BRIGHTNESS);
    return v !== null ? parseFloat(v) : 1.0;
  } catch {
    return 1.0;
  }
};

const loadStoredBgTint = (): 'obsidian' | 'navy' | 'aurora' | 'amethyst' | 'clear' => {
  if (typeof window === 'undefined') return 'obsidian';
  try {
    const v = localStorage.getItem(STORAGE_KEY_BG_TINT);
    return (v as 'obsidian' | 'navy' | 'aurora' | 'amethyst' | 'clear') || 'obsidian';
  } catch {
    return 'obsidian';
  }
};

let lastSqliteSyncMs = 0;
let activeRetryTimer: ReturnType<typeof setTimeout> | null = null;
let sessionCounter = 0;

export const usePlayerStore = create<PlayerStoreState>((set, get) => ({
  engine: null,
  router: null,
  activeEngineType: isTauriRuntime() ? 'tauri-mpv' : 'web-media',
  currentSessionId: 'session_initial',
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
  dspBypass: false,
  setDspBypass: (bypass: boolean) => {
    set({ dspBypass: bypass });
    get().router?.setDspBypass(bypass);
    const engine = get().engine;
    if (engine && 'setDspBypass' in engine) {
      (engine as { setDspBypass?: (b: boolean) => void }).setDspBypass?.(bypass);
    }
  },
  toggleDspBypass: () => {
    const next = !get().dspBypass;
    get().setDspBypass(next);
  },
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

  activePlaybackMode: 'video',
  setActivePlaybackMode: (mode) => set({ activePlaybackMode: mode }),
  currentArtwork: null,
  setCurrentArtwork: (url) => set({ currentArtwork: url }),
  isMusicPlayerOpen: false,
  setMusicPlayerOpen: (open) => set({ isMusicPlayerOpen: open }),
  lastActiveNav: 'browse',
  setLastActiveNav: (nav) => set({ lastActiveNav: nav }),
  lastActiveCategory: 'All',
  setLastActiveCategory: (category) => set({ lastActiveCategory: category }),

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
  bookmarkedWebsites: loadStoredBookmarkedWebsites(),
  toggleWebsiteBookmark: (
    urlOrObj: string | { url: string; title?: string; badge?: string; faviconUrl?: string },
    titleArg?: string,
    badgeArg?: string
  ) => {
    const rawUrl = typeof urlOrObj === 'string' ? urlOrObj : urlOrObj.url;
    const cleanUrl = (rawUrl || '').trim();
    if (!cleanUrl) return;
    const finalTitle = typeof urlOrObj === 'string' ? titleArg : (urlOrObj.title || titleArg);
    const finalBadge = typeof urlOrObj === 'string' ? badgeArg : (urlOrObj.badge || badgeArg);
    const customFavicon = typeof urlOrObj === 'object' ? urlOrObj.faviconUrl : undefined;

    const domain = extractDomain(cleanUrl);
    const existing = get().bookmarkedWebsites;
    const isAlreadyBookmarked = existing.some((b) => b.url === cleanUrl || (domain && b.domain === domain));
    let updated: BookmarkedWebsite[];
    if (isAlreadyBookmarked) {
      updated = existing.filter((b) => b.url !== cleanUrl && b.domain !== domain);
    } else {
      const newItem: BookmarkedWebsite = {
        id: `bm_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        title: finalTitle || domain || 'Website Bookmark',
        url: cleanUrl,
        domain,
        faviconUrl: customFavicon || getWebsiteFaviconUrl(cleanUrl, 64),
        badge: finalBadge || 'Web Portal',
        addedAt: Date.now(),
      };
      updated = [newItem, ...existing];
    }
    set({ bookmarkedWebsites: updated });
    saveStoredBookmarkedWebsites(updated);
  },
  removeWebsiteBookmark: (urlOrId: string) => {
    const updated = get().bookmarkedWebsites.filter((b) => b.id !== urlOrId && b.url !== urlOrId);
    set({ bookmarkedWebsites: updated });
    saveStoredBookmarkedWebsites(updated);
  },
  isWebsiteBookmarked: (url: string) => {
    if (!url) return false;
    const domain = extractDomain(url);
    return get().bookmarkedWebsites.some((b) => b.url === url.trim() || (domain && b.domain === domain));
  },
  youtubeHistory: loadStoredYouTubeHistory(),
  resumeBannerPositionMs: null,
  screenshotDirectory: loadStoredScreenshotDirectory(),
  setScreenshotDirectory: (dir) => {
    set({ screenshotDirectory: dir });
    saveStoredScreenshotDirectory(dir);
  },
  snapshotNotification: null,
  setSnapshotNotification: (msg) => set({ snapshotNotification: msg }),
  customBgImage: loadStoredBgImage(),
  customBgOpacity: loadStoredBgOpacity(),
  customBgBlur: loadStoredBgBlur(),
  customBgBrightness: loadStoredBgBrightness(),
  setCustomBgImage: (url) => {
    set({ customBgImage: url });
    if (url) {
      try {
        localStorage.setItem(STORAGE_KEY_BG_IMAGE, url);
      } catch {}
    } else {
      try {
        localStorage.removeItem(STORAGE_KEY_BG_IMAGE);
      } catch {}
    }
  },
  setCustomBgOpacity: (opacity) => {
    set({ customBgOpacity: opacity });
    try {
      localStorage.setItem(STORAGE_KEY_BG_OPACITY, opacity.toString());
    } catch {}
  },
  setCustomBgBlur: (blur) => {
    set({ customBgBlur: blur });
    try {
      localStorage.setItem(STORAGE_KEY_BG_BLUR, blur.toString());
    } catch {}
  },
  setCustomBgBrightness: (brightness) => {
    set({ customBgBrightness: brightness });
    try {
      localStorage.setItem(STORAGE_KEY_BG_BRIGHTNESS, brightness.toString());
    } catch {}
  },

  customBgTint: loadStoredBgTint(),
  setCustomBgTint: (tint) => {
    set({ customBgTint: tint });
    try {
      localStorage.setItem(STORAGE_KEY_BG_TINT, tint);
    } catch {}
  },

  // Sound System Advanced Controls
  streamQualityLevels: [],
  currentQualityLevel: -1,
  updateStreamQualityLevels: (levels) => set({ streamQualityLevels: levels }),
  setStreamQuality: (levelId) => {
    set({ currentQualityLevel: levelId });
    const engine = get().engine;
    if (engine && engine.setQualityLevel) {
      engine.setQualityLevel(levelId);
    }
  },

  preampGain: 1.0,
  stereoPan: 0.0,
  setPreampGain: (gain) => {
    const clamped = Math.max(0.5, Math.min(2.5, gain));
    get().spatialAudio.setPreampGain(clamped);
    set({ preampGain: clamped });
  },
  setStereoPan: (pan) => {
    const clamped = Math.max(-1.0, Math.min(1.0, pan));
    get().spatialAudio.setStereoPan(clamped);
    set({ stereoPan: clamped });
  },
  playAudioTestChime: () => {
    get().spatialAudio.playTestChime();
  },

  // Subtitle & Caption Management
  activeSubtitleTrack: null,
  isSubtitlesVisible: true,
  subtitleStyle: { ...DEFAULT_SUBTITLE_STYLE },

  loadSubtitleFromFile: async (file: File) => {
    try {
      const text = await file.text();
      const cues = parseSubtitleText(text);
      const curUri = get().currentUri || file.name;
      const track: SubtitleTrackData = {
        id: `sub-${Date.now()}`,
        fileName: file.name,
        sourceUri: curUri,
        cues,
        syncOffsetSec: 0,
        rawContent: text,
      };
      set({
        activeSubtitleTrack: track,
        isSubtitlesVisible: true,
      });
      memorizeSubtitleForVideo(curUri, file.name, text, 0);
    } catch (e) {
      console.warn('Failed to load subtitle file:', e);
    }
  },

  loadSubtitleFromText: (fileName: string, content: string, syncOffset: number = 0) => {
    const cues = parseSubtitleText(content);
    const curUri = get().currentUri || fileName;
    const track: SubtitleTrackData = {
      id: `sub-${Date.now()}`,
      fileName,
      sourceUri: curUri,
      cues,
      syncOffsetSec: syncOffset,
      rawContent: content,
    };
    set({
      activeSubtitleTrack: track,
      isSubtitlesVisible: true,
    });
    memorizeSubtitleForVideo(curUri, fileName, content, syncOffset);
  },

  setSubtitleSyncOffset: (offsetSec: number) => {
    const active = get().activeSubtitleTrack;
    if (!active) return;
    const updated = { ...active, syncOffsetSec: offsetSec };
    set({ activeSubtitleTrack: updated });
    if (active.sourceUri && active.rawContent) {
      memorizeSubtitleForVideo(active.sourceUri, active.fileName, active.rawContent, offsetSec);
    }
  },

  toggleSubtitles: () => {
    set((s) => ({ isSubtitlesVisible: !s.isSubtitlesVisible }));
  },

  updateSubtitleStyle: (style: Partial<SubtitleStyleConfig>) => {
    set((s) => ({ subtitleStyle: { ...s.subtitleStyle, ...style } }));
  },

  clearSubtitle: () => {
    set({ activeSubtitleTrack: null });
  },

  saveYouTubeProgress: (youtubeId: string, positionMs: number, durationMs: number) => {
    if (!youtubeId || positionMs <= 0) return;
    const progressPercent = durationMs > 0 ? Math.min(100, Math.round((positionMs / durationMs) * 100)) : 0;
    const isCompleted = progressPercent >= 95;

    // 1. Update youtubeHistory
    const existingHistory = get().youtubeHistory;
    const updatedHistory = existingHistory.map((item) => {
      if (item.id === youtubeId || item.url.includes(youtubeId)) {
        return {
          ...item,
          lastPositionMs: positionMs,
          durationMs,
          progressPercent,
          timestamp: Date.now(),
        };
      }
      return item;
    });
    set({ youtubeHistory: updatedHistory });
    saveStoredYouTubeHistory(updatedHistory);

    // 2. Update recentMedia so Jump Back In cards and Resume Choice Modal have the stopped position!
    const recents = get().recentMedia;
    const targetUrl = `https://www.youtube.com/watch?v=${youtubeId}`;
    const foundIndex = recents.findIndex((r) => r.youtubeId === youtubeId || r.uri.includes(youtubeId));

    if (foundIndex >= 0) {
      const updatedRecents = [...recents];
      updatedRecents[foundIndex] = {
        ...updatedRecents[foundIndex],
        lastPositionMs: positionMs,
        durationMs: durationMs || updatedRecents[foundIndex].durationMs,
        progressPercent,
        isCompleted,
        lastPlayedAt: Date.now(),
      };
      set({ recentMedia: updatedRecents });
      saveStoredRecentMedia(updatedRecents);
    } else {
      const newRecent: MediaHistoryItem = {
        mediaId: targetUrl,
        uri: targetUrl,
        title: `YouTube Video (${youtubeId})`,
        durationMs,
        lastPositionMs: positionMs,
        progressPercent,
        isCompleted,
        playCount: 1,
        lastPlayedAt: Date.now(),
        thumbnailUri: `https://img.youtube.com/vi/${youtubeId}/mqdefault.jpg`,
        isYouTube: true,
        youtubeId,
      };
      const updatedRecents = [newRecent, ...recents].slice(0, 30);
      set({ recentMedia: updatedRecents });
      saveStoredRecentMedia(updatedRecents);
    }
  },

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

    const router = new MediaEngineRouter();
    router.setDspBypass(get().dspBypass);
    try {
      await router.initialize(videoEl);
    } catch {}
    set({ router });

    const targetType: EngineType =
      preferred ?? (isTauriRuntime() ? 'tauri-mpv' : 'web-media');

    const engine: IPlayerEngine =
      targetType === 'tauri-mpv' ? new TauriMpvEngine() : new WebMediaEngine();

    if (engine && 'attachSpatialAudio' in engine) {
      (engine as { attachSpatialAudio: (s: any) => void }).attachSpatialAudio(get().spatialAudio);
    }
    if (engine && 'setDspBypass' in engine) {
      (engine as { setDspBypass: (b: boolean) => void }).setDspBypass(get().dspBypass);
    }

    engine.onTelemetry((telemetry: PlaybackTelemetry) => {
      // If an external web stream (YouTube, TikTok, Instagram) is actively playing,
      // completely IGNORE telemetry from the background idle/paused HTML5 <video> element!
      const activeUri = get().currentUri;
      const isExternalStream =
        activeUri && /(?:youtube\.com|youtu\.be|tiktok\.com|instagram\.com)/i.test(activeUri);

      if (isExternalStream) {
        // Do not let background paused video element overwrite external player state!
        return;
      }

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

      // Live progress persistence for recently played card displays (immutable update)
      const curUri = get().currentUri;
      if (curUri && telemetry.durationMs > 0 && !telemetry.isPaused) {
        const pct = Math.min(100, Math.round((telemetry.positionMs / telemetry.durationMs) * 100));
        const recents = get().recentMedia;
        const target = recents.find((r) => r.uri === curUri);
        if (target && target.progressPercent !== pct) {
          const updatedRecents = recents.map((item) =>
            item.uri === curUri
              ? {
                  ...item,
                  progressPercent: pct,
                  lastPositionMs: telemetry.positionMs,
                  durationMs: telemetry.durationMs,
                }
              : item
          );
          saveStoredRecentMedia(updatedRecents);
          set({ recentMedia: updatedRecents });
        }
      }
    });

    engine.onError(async (error: PlayerErrorEnvelope) => {
      await get().handleStreamError(error);
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

  handleStreamError: async (error: PlayerErrorEnvelope) => {
    // Never display codec errors or trigger retry loops for YouTube embeds
    const curUri = get().currentUri;
    if (curUri && /(?:youtube\.com|youtu\.be)/.test(curUri)) {
      return;
    }

    // Automated Channel Self-Healing: If a live channel fails, coordinate with StreamFailoverManager
    if (curUri && (error.code === 'STREAM_TIMEOUT' || error.code === 'STREAM_ERROR' || error.code === 'CODEC_UNSUPPORTED')) {
      try {
        const curTitle = get().currentTitle;
        const channel = (curTitle ? getChannelByName(curTitle) : undefined) || getChannelByUri(curUri);
        if (channel && channel.backupUrls && channel.backupUrls.length > 0) {
          if (!activeFailoverManager || activeFailoverManager.getCurrentUrl() !== curUri) {
            activeFailoverManager = new StreamFailoverManager({
              primaryUrl: channel.streamUrl,
              backupUrls: channel.backupUrls,
              channelName: channel.name,
              maxRetriesPerSource: 0,
            });
          }
          const failover = activeFailoverManager.recordFailure(error.message);
          const nextBackup =
            failover.action === 'switch_source'
              ? failover.url
              : getChannelBackupUrl(channel.name, curUri) ||
                getChannelBackupUrl(channel.streamUrl, curUri);

          if (nextBackup && nextBackup !== curUri) {
            console.log(
              `[playerStore] Live channel ${channel.name} encountered ${error.message}. Auto-healing via backup mirror: ${nextBackup}`
            );
            set({ isBuffering: true, lastError: null, retryCount: 0 });
            await get().openMedia(nextBackup, channel.name, false);
            return;
          } else if (failover.action === 'exhausted') {
            console.warn(`[playerStore] All backup mirrors exhausted for ${channel.name}`);
            set({
              isBuffering: false,
              lastError: {
                code: 'STREAM_TIMEOUT',
                message: `All broadcast streams for ${channel.name} are currently unreachable.`,
                details: 'Every configured primary and secondary CDN mirror timed out or rejected the connection.',
                severity: 'critical',
                recovery: 'none',
                timestampMs: Date.now(),
              },
            });
            return;
          }
        }
      } catch (e) {
        console.warn('[playerStore] Channel failover lookup error:', e);
      }
    }

    set({ lastError: error, isBuffering: false });

    // Automated Self-Healing Recovery Execution
    if (error.recovery === 'fallback_to_web_engine' && get().activeEngineType !== 'web-media') {
      await get().bootEngine('web-media');
      const uri = get().currentUri;
      if (uri) await get().openMedia(uri, get().currentTitle);
    } else if (error.recovery === 'retry_with_backoff' && get().retryCount < 3) {
      const nextRetry = get().retryCount + 1;
      set({ retryCount: nextRetry });
      const delayMs = Math.pow(2, nextRetry) * 500;
      const capturedSessionId = get().currentSessionId;

      if (activeRetryTimer) {
        clearTimeout(activeRetryTimer);
      }

      activeRetryTimer = setTimeout(() => {
        activeRetryTimer = null;
        if (get().currentSessionId !== capturedSessionId) {
          return;
        }
        const uri = get().currentUri;
        if (uri && !/(?:youtube\.com|youtu\.be)/.test(uri)) {
          if (isDirectMediaUrl(uri) || (!uri.startsWith('http://') && !uri.startsWith('https://'))) {
            get().engine?.load(uri, get().positionMs);
          }
        }
      }, delayMs);
    } else if (error.recovery === 'reset_audio_filters') {
      await get().setEqualizer([0, 0, 0, 0, 0, 0, 0, 0, 0, 0], false);
    }
  },

  openMedia: async (uri, title, autoResume = true, startPositionMs?: number, artworkUrl?: string, mediaType?: 'video' | 'music' | 'radio') => {
    // Invalidate prior sessions and cancel any pending retry timeouts
    if (activeRetryTimer) {
      clearTimeout(activeRetryTimer);
      activeRetryTimer = null;
    }
    const newSessionId = `session_${Date.now()}_${++sessionCounter}`;
    set({ currentSessionId: newSessionId, retryCount: 0 });

    const resolvedTitle = title ?? extractCleanFileName(uri);
    let startPos = startPositionMs ?? 0;
    const resolvedArtwork = lookupArtwork(uri, resolvedTitle, artworkUrl);

    // Explicit video detection: video files and video web streams MUST NEVER be misclassified as audio
    const isExplicitVideo =
      mediaType === 'video' ||
      /\.(?:mp4|mkv|webm|avi|mov|m4v|flv|ts|wmv|3gp|m3u8)(?:\?|$)/i.test(uri) ||
      Boolean(parseWebStream(uri));

    // Explicit radio stream detection
    const isRadio =
      mediaType === 'radio' ||
      (!isExplicitVideo && (
        uri.includes('somafm.com') ||
        uri.includes('radio.garden') ||
        uri.includes('/listen/') ||
        uri.includes('plaza.one') ||
        uri.includes('streamguys') ||
        uri.includes('synthwaveradio') ||
        (get().lastActiveCategory === 'Radio' && !isExplicitVideo) ||
        (get().lastActiveNav === 'radio' && !isExplicitVideo)
      ));

    // Audio stream detection
    const isAudio =
      mediaType === 'music' ||
      isRadio ||
      (!isExplicitVideo && (
        /\.(?:mp3|ogg|flac|wav|aac|m4a|weba|opus)(?:\?|$)/i.test(uri) ||
        uri.includes('/mp3') ||
        uri.includes('-mp3') ||
        uri.includes('format=mp3') ||
        uri.includes('soundcloud') ||
        uri.includes('jamendo') ||
        uri.includes('audiomack') ||
        uri.includes('bandcamp') ||
        uri.includes('mythium') ||
        uri.includes('icecast') ||
        uri.includes('shoutcast') ||
        Boolean(artworkUrl) ||
        get().lastActiveCategory === 'Music' ||
        get().lastActiveNav === 'music'
      ));

    // Resolved authoritative playback mode: explicit videos are always 'video'
    const playbackMode: 'video' | 'music' | 'radio' =
      isExplicitVideo ? 'video' :
      isRadio ? 'radio' :
      isAudio ? 'music' : 'video';

    // Check if it's an external web stream (YouTube, TikTok, Instagram, Vimeo, Twitch, Dailymotion, Cinema portals or Web stream)
    const webStream = parseWebStream(uri);
    const isHttp = uri.startsWith('http://') || uri.startsWith('https://');
    const activeWebStream = webStream || (!isAudio && isHttp && !isDirectMediaUrl(uri) ? {
      platform: 'cinema' as const,
      id: `cinema_${Date.now()}`,
      embedUrl: uri,
      originalUrl: uri,
      title: resolvedTitle,
    } : null);

    if (activeWebStream) {
      if (activeWebStream.platform === 'youtube') {
        get().addYouTubeHistory(uri, resolvedTitle);
      }

      const platform = activeWebStream.platform;
      const streamId = activeWebStream.id;

      const existingRecent = get().recentMedia;
      const existingWeb = existingRecent.find(
        (m) => m.uri === uri || (streamId && (m.youtubeId === streamId || m.webStreamId === streamId))
      );
      if (startPositionMs !== undefined) {
        startPos = startPositionMs;
      } else if (autoResume && existingWeb?.lastPositionMs) {
        startPos = existingWeb.lastPositionMs;
      }

      const defaultThumb = activeWebStream.platform === 'youtube' && activeWebStream.id
        ? `https://img.youtube.com/vi/${activeWebStream.id}/mqdefault.jpg`
        : resolvedArtwork || (isHttp ? getWebsiteFaviconUrl(uri, 128) : undefined);

      const webHistoryItem: MediaHistoryItem = {
        mediaId: uri,
        uri,
        title:
          resolvedTitle ||
          (platform === 'tiktok'
            ? `TikTok Video (${streamId || 'Web'})`
            : platform === 'instagram'
            ? `Instagram Reel (${streamId || 'Web'})`
            : platform === 'facebook'
            ? `Facebook Video (${streamId || 'Web'})`
            : platform === 'youtube'
            ? `YouTube (${streamId || 'Web'})`
            : platform === 'vimeo'
            ? `Vimeo Video (${streamId || 'Web'})`
            : platform === 'twitch'
            ? `Twitch Stream (${streamId || 'Web'})`
            : platform === 'dailymotion'
            ? `Dailymotion Video (${streamId || 'Web'})`
            : `Cinema Stream (${extractDomain(uri) || 'Web'})`),
        durationMs: existingWeb?.durationMs || 0,
        lastPositionMs: startPos,
        progressPercent: existingWeb?.progressPercent || 0,
        isCompleted: false,
        playCount: (existingWeb?.playCount ?? 0) + 1,
        lastPlayedAt: Date.now(),
        thumbnailUri: defaultThumb,
        isYouTube: platform === 'youtube',
        youtubeId: platform === 'youtube' ? streamId : undefined,
        webPlatform: platform,
        webStreamId: streamId,
        webDomain: isHttp ? extractDomain(uri) : undefined,
      };

      const updatedRecent = [
        webHistoryItem,
        ...existingRecent.filter(
          (m) => m.uri !== uri && (!streamId || (m.youtubeId !== streamId && m.webStreamId !== streamId))
        ),
      ].slice(0, 30);
      set({ recentMedia: updatedRecent });
      saveStoredRecentMedia(updatedRecent);

      const video = document.getElementById('aether-video-viewport') as HTMLVideoElement | null;
      if (video) {
        video.pause();
        video.removeAttribute('src');
        video.load();
      }
      set({
        currentUri: uri,
        currentTitle: webHistoryItem.title,
        currentArtwork: defaultThumb || null,
        activePlaybackMode: 'video',
        positionMs: startPos,
        durationMs: existingWeb?.durationMs || 0,
        retryCount: 0,
        lastError: null,
        isPaused: false,
        resumeBannerPositionMs: null,
      });

      // Restore any memorized subtitles for this video
      const memorizedSub = getMemorizedSubtitleForVideo(uri);
      if (memorizedSub && memorizedSub.rawContent) {
        const cues = parseSubtitleText(memorizedSub.rawContent);
        set({
          activeSubtitleTrack: {
            id: 'memorized-sub',
            fileName: memorizedSub.fileName,
            sourceUri: uri,
            cues,
            syncOffsetSec: memorizedSub.syncOffsetSec || 0,
            rawContent: memorizedSub.rawContent,
          },
          isSubtitlesVisible: true,
        });
      }
      return;
    }

    // Record and persist to recent media (both web/local & Tauri)
    const existingRecent = get().recentMedia;
    const existingItem = existingRecent.find((m) => m.uri === uri);
    const savedPos = existingItem?.lastPositionMs ?? 0;
    if (startPositionMs !== undefined) {
      startPos = startPositionMs;
    } else if (!isTauriRuntime()) {
      startPos = autoResume ? savedPos : 0;
    }
    const domain = isHttp ? extractDomain(uri) : undefined;
    const defaultThumb = resolvedArtwork || (isHttp ? getWebsiteFaviconUrl(uri, 128) : undefined);
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
      thumbnailUri: existingItem?.thumbnailUri || defaultThumb,
      webPlatform: isHttp ? 'cinema' : undefined,
      webDomain: domain,
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
          currentArtwork: resolvedArtwork || null,
          activePlaybackMode: playbackMode,
          isMusicPlayerOpen: get().isMusicPlayerOpen,
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
      currentArtwork: resolvedArtwork || null,
      activePlaybackMode: playbackMode,
      isMusicPlayerOpen: get().isMusicPlayerOpen,
      retryCount: 0,
      lastError: null,
      resumeBannerPositionMs: null,
      isBuffering: true,
    });

    // Restore any memorized subtitles for this video
    const memorizedSub = getMemorizedSubtitleForVideo(uri);
    if (memorizedSub && memorizedSub.rawContent) {
      const cues = parseSubtitleText(memorizedSub.rawContent);
      set({
        activeSubtitleTrack: {
          id: 'memorized-sub',
          fileName: memorizedSub.fileName,
          sourceUri: uri,
          cues,
          syncOffsetSec: memorizedSub.syncOffsetSec || 0,
          rawContent: memorizedSub.rawContent,
        },
        isSubtitlesVisible: true,
      });
    }

    await get().engine?.load(uri, startPos);
    await get().engine?.play();
  },

  closeMedia: async () => {
    if (activeRetryTimer) {
      clearTimeout(activeRetryTimer);
      activeRetryTimer = null;
    }
    if (activeFailoverManager) {
      activeFailoverManager.cancel();
      activeFailoverManager = null;
    }
    const closedSessionId = `session_closed_${Date.now()}_${++sessionCounter}`;
    set({ currentSessionId: closedSessionId, retryCount: 0 });

    const engine = get().engine;
    if (engine) {
      await engine.pause();
    }
    // Cleanly purge HTML5 video viewport DOM element so stale video frames do not bleed into the UI
    if (typeof document !== 'undefined') {
      const videoEl = document.getElementById('aether-video-viewport') as HTMLVideoElement | null;
      if (videoEl) {
        videoEl.pause();
        videoEl.removeAttribute('src');
        videoEl.load();
      }
    }
    set({
      currentUri: null,
      currentTitle: '',
      currentMediaId: null,
      currentArtwork: null,
      activePlaybackMode: 'video',
      isMusicPlayerOpen: false,
      positionMs: 0,
      durationMs: 0,
      isPaused: true,
      isBuffering: false,
      resumeBannerPositionMs: null,
    });
  },

  togglePlay: async () => {
    const { engine, isPaused, currentMediaId, currentUri, positionMs, durationMs } = get();

    // Check if currently playing YouTube
    const isYouTube = /(?:youtube\.com\/(?:watch\?.*v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/.test(currentUri || '');
    if (isYouTube) {
      set({ isPaused: !isPaused });
      return;
    }

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
    const { currentUri, engine } = get();
    const isYouTube = /(?:youtube\.com\/(?:watch\?.*v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/.test(currentUri || '');
    if (isYouTube) {
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('miki:youtube-seek', { detail: { positionSec: timestampMs / 1000 } }));
      }
      return;
    }
    await engine?.seek(timestampMs, exact);
  },

  setVolume: async (volume) => {
    // Allows 0% to 200% VLC overdrive
    const clamped = Math.max(0, Math.min(200, volume));
    const isMuted = clamped === 0;
    set({ volume: clamped, isMuted });
    await get().engine?.setVolume(clamped);

    // Broadcast sound change across web streams, YouTube & native WKWebView
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('miki:volume-change', {
          detail: { volume: clamped, isMuted },
        })
      );
      const webkit = (window as unknown as { webkit?: { messageHandlers?: { browserViewAction?: { postMessage: (msg: unknown) => void } } } }).webkit;
      if (webkit?.messageHandlers?.browserViewAction) {
        webkit.messageHandlers.browserViewAction.postMessage({
          action: 'setVolume',
          volume: clamped,
          isMuted,
        });
      }
    }
  },

  setMuted: async (muted) => {
    set({ isMuted: muted });
    const currentVol = get().volume;
    const effectiveVol = muted ? 0 : currentVol;
    await get().engine?.setVolume(effectiveVol);

    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('miki:volume-change', {
          detail: { volume: effectiveVol, isMuted: muted },
        })
      );
      const webkit = (window as unknown as { webkit?: { messageHandlers?: { browserViewAction?: { postMessage: (msg: unknown) => void } } } }).webkit;
      if (webkit?.messageHandlers?.browserViewAction) {
        webkit.messageHandlers.browserViewAction.postMessage({
          action: 'setVolume',
          volume: effectiveVol,
          isMuted: muted,
        });
      }
    }
  },

  toggleMute: async () => {
    const nextMuted = !get().isMuted;
    await get().setMuted(nextMuted);
  },

  setPlaybackRate: async (rate) => {
    set({ playbackRate: rate });
    await get().engine?.setPlaybackRate(rate);
  },

  setEqualizer: async (gainsDb, nightMode) => {
    set({ eqGainsDb: gainsDb, nightModeEnabled: nightMode });
    await get().engine?.setEqualizer(gainsDb, nightMode);

    // Broadcast equalizer update across web streams and native WKWebView
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('miki:equalizer-change', {
          detail: { gainsDb, nightMode },
        })
      );
      const webkit = (window as unknown as { webkit?: { messageHandlers?: { browserViewAction?: { postMessage: (msg: unknown) => void } } } }).webkit;
      if (webkit?.messageHandlers?.browserViewAction) {
        webkit.messageHandlers.browserViewAction.postMessage({
          action: 'setEqualizer',
          gainsDb,
          nightMode,
        });
      }
    }

    const {
      currentMediaId,
      playbackRate,
      audioTracks,
      subtitleTracks,
      shaderConfig,
    } = get();

    const activeAudioTrackId = audioTracks.find((t) => t.selected)?.id || null;
    const activeSubtitleTrackId = subtitleTracks.find((t) => t.selected)?.id || null;

    if (isTauriRuntime() && currentMediaId) {
      try {
        await invoke('db_update_eq_preferences', {
          mediaId: currentMediaId,
          eqGainsJson: JSON.stringify(gainsDb),
          nightModeEnabled: nightMode,
        });
      } catch {
        // Fallback preserving active tracks and playback settings
        await invoke('db_save_preferences', {
          prefs: {
            mediaId: currentMediaId,
            audioTrackId: activeAudioTrackId,
            subtitleTrackId: activeSubtitleTrackId,
            audioDelayMs: 0,
            subtitleDelayMs: 0,
            playbackRate: playbackRate || 1.0,
            aspectRatio: 'auto',
            shaderPreset: shaderConfig.superResolution || 'ambient_default',
            eqGainsJson: JSON.stringify(gainsDb),
            nightModeEnabled: nightMode,
          },
        }).catch(() => {});
      }
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
        const titleClean = (get().currentTitle || 'Media').replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 30);
        const filename = `Miki_${titleClean}_${Date.now()}.png`;
        const dir = get().screenshotDirectory || DEFAULT_SCREENSHOT_DIR;

        // 1. macOS Cocoa native WebKit bridge
        if (
          typeof window !== 'undefined' &&
          (window as unknown as { webkit?: { messageHandlers?: { saveScreenshot?: { postMessage: (msg: unknown) => void } } } })
            .webkit?.messageHandlers?.saveScreenshot
        ) {
          (window as unknown as { webkit: { messageHandlers: { saveScreenshot: { postMessage: (msg: unknown) => void } } } })
            .webkit.messageHandlers.saveScreenshot.postMessage({
              base64Data: dataUrl,
              filename,
              directory: dir,
            });
          set({ snapshotNotification: `Snapshot saved to ${dir}/${filename}` });
          setTimeout(() => set({ snapshotNotification: null }), 4000);
          return;
        }

        // 2. Web / Browser download fallback
        const a = document.createElement('a');
        a.href = dataUrl;
        a.download = filename;
        a.click();
        set({ snapshotNotification: `Snapshot saved: ${filename}` });
        setTimeout(() => set({ snapshotNotification: null }), 4000);
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
