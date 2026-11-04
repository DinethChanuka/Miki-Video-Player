import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { usePlayerStore, MediaHistoryItem } from './store/playerStore';
import { PLAYER_THEMES } from './types/theme';
import { AmbientCanvas } from './components/ambient/AmbientCanvas';
import { ControlsOverlay } from './components/hud/ControlsOverlay';
import { EqualizerModal } from './components/hud/EqualizerModal';
import { VideoSettingsModal } from './components/hud/VideoSettingsModal';
import { FileBrowserModal } from './components/hud/FileBrowserModal';
import { WebBrowserModal } from './components/hud/WebBrowserModal';
import { FullWindowGamesModal } from './components/games/FullWindowGamesModal';
import { LiveChannelsModal } from './components/hud/LiveChannelsModal';
import { ResumeChoiceModal } from './components/hud/ResumeChoiceModal';
import { SystemAccessModal } from './components/hud/SystemAccessModal';
import { ErrorToast } from './components/hud/ErrorToast';
import { SplashScreen } from './components/splash/SplashScreen';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { usePlayerGestures } from './hooks/usePlayerGestures';
import { YouTubePlayer } from './components/player/YouTubePlayer';
import { WebEmbedPlayer } from './components/player/WebEmbedPlayer';
import { SubtitleOverlay } from './components/player/SubtitleOverlay';
import { ApplicationMenu } from './components/hud/ApplicationMenu';
import { GmailSignInModal } from './components/hud/GmailSignInModal';
import { FullWindowMusicPlayer } from './components/music/FullWindowMusicPlayer';
import { PersistentMusicControlHub } from './components/hud/PersistentMusicControlHub';
import { FullWindowDashboard } from './components/dashboard/FullWindowDashboard';
import { HomeDashboardView } from './components/home/HomeDashboardView';
import { parseWebStream, isDirectMediaUrl, WebPlatform } from './utils/webStreamUtils';
import { HlsStreamController } from './core/HlsStreamController';
import {
  ArrowLeft,
  Camera,
  RefreshCw,
  Music,
  Sliders,
  Sparkles,
  Wifi,
} from 'lucide-react';

export function parseYouTubeId(url: string | null): string | null {
  if (!url) return null;
  const match = url.match(
    /(?:youtube\.com\/(?:watch\?.*v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  );
  return match ? match[1] : null;
}

const handleWindowMinimize = () => {
  if (
    typeof window !== 'undefined' &&
    (window as unknown as { webkit?: { messageHandlers?: { windowAction?: { postMessage: (a: string) => void } } } }).webkit?.messageHandlers?.windowAction
  ) {
    (window as unknown as { webkit: { messageHandlers: { windowAction: { postMessage: (a: string) => void } } } }).webkit.messageHandlers.windowAction.postMessage('minimize');
  } else if (typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window) {
    import('@tauri-apps/api/window').then(({ getCurrentWindow }) => getCurrentWindow().minimize()).catch(() => {});
  }
};

const handleWindowMaximize = () => {
  if (
    typeof window !== 'undefined' &&
    (window as unknown as { webkit?: { messageHandlers?: { windowAction?: { postMessage: (a: string) => void } } } }).webkit?.messageHandlers?.windowAction
  ) {
    (window as unknown as { webkit: { messageHandlers: { windowAction: { postMessage: (a: string) => void } } } }).webkit.messageHandlers.windowAction.postMessage('maximize');
  } else if (typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window) {
    import('@tauri-apps/api/window').then(({ getCurrentWindow }) => getCurrentWindow().toggleMaximize()).catch(() => {});
  }
};

const handleWindowClose = () => {
  if (
    typeof window !== 'undefined' &&
    (window as unknown as { webkit?: { messageHandlers?: { windowAction?: { postMessage: (a: string) => void } } } }).webkit?.messageHandlers?.windowAction
  ) {
    (window as unknown as { webkit: { messageHandlers: { windowAction: { postMessage: (a: string) => void } } } }).webkit.messageHandlers.windowAction.postMessage('close');
  } else if (typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window) {
    import('@tauri-apps/api/window').then(({ getCurrentWindow }) => getCurrentWindow().close()).catch(() => {});
  } else {
    window.close();
  }
};

export const App: React.FC = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const activeEngineType = usePlayerStore((s) => s.activeEngineType);
  const currentUri = usePlayerStore((s) => s.currentUri);
  const currentTitle = usePlayerStore((s) => s.currentTitle);
  const bootEngine = usePlayerStore((s) => s.bootEngine);
  const openMedia = usePlayerStore((s) => s.openMedia);
  const closeMedia = usePlayerStore((s) => s.closeMedia);
  const resumeBannerPositionMs = usePlayerStore((s) => s.resumeBannerPositionMs);
  const seek = usePlayerStore((s) => s.seek);
  const themeId = usePlayerStore((s) => s.themeId);
  const shaderConfig = usePlayerStore((s) => s.shaderConfig);
  const saveCurrentThumbnail = usePlayerStore((s) => s.saveCurrentThumbnail);
  const playNextMedia = usePlayerStore((s) => s.playNextMedia);
  const playPreviousMedia = usePlayerStore((s) => s.playPreviousMedia);
  const snapshotNotification = usePlayerStore((s) => s.snapshotNotification);
  const customBgImage = usePlayerStore((s) => s.customBgImage);
  const customBgOpacity = usePlayerStore((s) => s.customBgOpacity);
  const customBgBlur = usePlayerStore((s) => s.customBgBlur);
  const customBgBrightness = usePlayerStore((s) => s.customBgBrightness);
  const customBgTint = usePlayerStore((s) => s.customBgTint);
  const isBuffering = usePlayerStore((s) => s.isBuffering);
  const lastError = usePlayerStore((s) => s.lastError);
  const positionMs = usePlayerStore((s) => s.positionMs);
  const activeSubtitleTrack = usePlayerStore((s) => s.activeSubtitleTrack);
  const isSubtitlesVisible = usePlayerStore((s) => s.isSubtitlesVisible);
  const subtitleStyle = usePlayerStore((s) => s.subtitleStyle);
  const activePlaybackMode = usePlayerStore((s) => s.activePlaybackMode);
  const currentArtwork = usePlayerStore((s) => s.currentArtwork);
  const isPaused = usePlayerStore((s) => s.isPaused);
  const isMusicPlayerOpen = usePlayerStore((s) => s.isMusicPlayerOpen);
  const setMusicPlayerOpen = usePlayerStore((s) => s.setMusicPlayerOpen);
  const lastActiveNav = usePlayerStore((s) => s.lastActiveNav);
  const lastActiveCategory = usePlayerStore((s) => s.lastActiveCategory);

  const currentSectionName = useMemo(() => {
    if (activePlaybackMode === 'video' && currentUri) return 'Video Player';
    if (activePlaybackMode === 'music' && isMusicPlayerOpen) return 'Hi-Fi Music Studio';
    if (lastActiveCategory === 'Movies') return 'Movies & Cinema';
    if (lastActiveCategory === 'Tv series') return 'TV Series & Shows';
    if (lastActiveCategory === 'Live TV' || lastActiveNav === 'channels') return 'Live TV (100+)';
    if (lastActiveCategory === 'Games' || lastActiveNav === 'games') return 'Game Arcade (219+)';
    if (lastActiveCategory === 'Music' || lastActiveNav === 'music') return '3D Music';
    if (lastActiveCategory === 'Radio' || lastActiveNav === 'radio') return 'Music Radio Live';
    if (lastActiveNav === 'watchlist') return 'Watchlist';
    if (lastActiveNav === 'coming_soon') return 'Coming Soon';
    return 'Browse All';
  }, [activePlaybackMode, currentUri, isMusicPlayerOpen, lastActiveCategory, lastActiveNav]);

  const theme = PLAYER_THEMES[themeId] || PLAYER_THEMES.cyberpunk;

  const [isEqOpen, setIsEqOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isFileBrowserOpen, setIsFileBrowserOpen] = useState(false);
  const [fileBrowserInitialTab, setFileBrowserInitialTab] = useState<
    | 'youtube'
    | 'tiktok'
    | 'instagram'
    | 'recent'
    | 'bookmarks'
    | 'cinema'
    | 'social'
    | 'games'
    | 'music'
    | 'history'
    | 'saved'
  >('cinema');
  const [isWebBrowserOpen, setIsWebBrowserOpen] = useState(false);
  const [webBrowserUrl, setWebBrowserUrl] = useState('https://www.youtube.com');
  const [isGamesOpen, setIsGamesOpen] = useState(false);
  const [selectedGameId, setSelectedGameId] = useState<string | undefined>(undefined);
  const [isDashboardOpen, setIsDashboardOpen] = useState(false);
  const [isChannelsOpen, setIsChannelsOpen] = useState(false);
  const [isSystemAccessOpen, setIsSystemAccessOpen] = useState(false);
  const [isGmailSignInOpen, setIsGmailSignInOpen] = useState(false);
  const [pendingResumeItem, setPendingResumeItem] = useState<MediaHistoryItem | null>(null);
  const [isResumeChoiceOpen, setIsResumeChoiceOpen] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const [areControlsVisible, setAreControlsVisible] = useState(true);
  const hideControlsTimerRef = useRef<number | null>(null);
  const lastThumbCaptureTimeRef = useRef<number>(0);
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const isDraggingSplitterRef = useRef(false);

  const handleSplitterMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    isDraggingSplitterRef.current = true;
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDraggingSplitterRef.current || !viewportRef.current) return;
      const rect = viewportRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const pct = Math.min(95, Math.max(5, (x / rect.width) * 100));
      usePlayerStore.getState().setSplitCompare(true, Math.round(pct));
    };

    const handleMouseUp = () => {
      isDraggingSplitterRef.current = false;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  const handleConfirmResume = (item: MediaHistoryItem) => {
    setIsResumeChoiceOpen(false);
    setPendingResumeItem(null);
    openMedia(item.uri, item.title, true, item.lastPositionMs);
  };

  const handleConfirmRestart = (item: MediaHistoryItem) => {
    setIsResumeChoiceOpen(false);
    setPendingResumeItem(null);
    openMedia(item.uri, item.title, false, 0);
  };

  // Auto-capture video thumbnail of the stopped point
  const captureCurrentVideoFrame = useCallback(() => {
    const v = videoRef.current;
    if (!v || v.videoWidth === 0 || v.videoHeight === 0) return;
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 320;
      canvas.height = Math.round((320 * v.videoHeight) / v.videoWidth) || 180;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.drawImage(v, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
      saveCurrentThumbnail(dataUrl);
    } catch {}
  }, [saveCurrentThumbnail]);

  const resetControlsTimer = useCallback(() => {
    setAreControlsVisible(true);
    if (hideControlsTimerRef.current) {
      window.clearTimeout(hideControlsTimerRef.current);
    }
    // Auto-hide HUD after 5 seconds of mouse inactivity when media is actively loaded
    if (currentUri) {
      hideControlsTimerRef.current = window.setTimeout(() => {
        setAreControlsVisible(false);
      }, 5000);
    }
  }, [currentUri]);

  useEffect(() => {
    resetControlsTimer();
    return () => {
      if (hideControlsTimerRef.current) {
        window.clearTimeout(hideControlsTimerRef.current);
      }
    };
  }, [resetControlsTimer]);

  const handleStartWindowDrag = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('input') || target.closest('label') || target.closest('a')) {
      return;
    }
    if (
      typeof window !== 'undefined' &&
      (window as unknown as { webkit?: { messageHandlers?: { windowAction?: { postMessage: (msg: string) => void } } } }).webkit?.messageHandlers?.windowAction
    ) {
      (window as unknown as { webkit: { messageHandlers: { windowAction: { postMessage: (msg: string) => void } } } }).webkit.messageHandlers.windowAction.postMessage('startDrag');
    } else if (typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window) {
      import('@tauri-apps/api/window').then(({ getCurrentWindow }) => getCurrentWindow().startDragging()).catch(() => {});
    }
  };

  const { handleTouchStart, handleTouchEnd } = usePlayerGestures(containerRef);

  const [fallbackWebEmbed, setFallbackWebEmbed] = useState<{
    platform: WebPlatform;
    embedUrl: string;
    originalUrl: string;
  } | null>(null);

  const webStream = useMemo(() => (currentUri ? parseWebStream(currentUri) : null), [currentUri]);
  const activeWebStream = webStream || fallbackWebEmbed;
  const youtubeId = activeWebStream?.platform === 'youtube' ? (webStream?.id || null) : null;

  useEffect(() => {
    setFallbackWebEmbed(null);
  }, [currentUri]);

  const fallbackToWebStream = useCallback((uri: string) => {
    if (uri && (uri.startsWith('http://') || uri.startsWith('https://'))) {
      const isCinema = /cinesubz|fmovies|123movies|bflix|vidsrc|streamtape/i.test(uri);
      setFallbackWebEmbed({
        platform: isCinema ? 'cinema' : 'web',
        embedUrl: uri,
        originalUrl: uri,
      });
      usePlayerStore.setState({ lastError: null, isBuffering: false });
      return true;
    }
    return false;
  }, []);

  // Listen for native / global triggers for Gmail signin, web streams, browser, settings & EQ
  useEffect(() => {
    const handleOpenGmail = () => setIsGmailSignInOpen(true);
    const handleOpenSettings = () => setIsSettingsOpen(true);
    const handleOpenEq = () => setIsEqOpen(true);
    const handleOpenLibrary = () => setIsDashboardOpen(true);
    const handleOpenStream = (e: Event) => {
      const detail = (e as CustomEvent<{ tab?: 'youtube' | 'tiktok' | 'instagram' | 'cinema' }>).detail;
      if (detail?.tab) setFileBrowserInitialTab(detail.tab);
      setIsFileBrowserOpen(true);
    };
    const handleOpenBrowser = (e: Event) => {
      const detail = (e as CustomEvent<{ url?: string }>).detail;
      if (detail?.url) setWebBrowserUrl(detail.url);
      setIsWebBrowserOpen(true);
    };
    const handleOpenGamesEvent = (e: Event) => {
      const detail = (e as CustomEvent<{ gameId?: string }>).detail;
      if (detail?.gameId) setSelectedGameId(detail.gameId);
      setIsGamesOpen(true);
    };
    const handleOpenChannelsEvent = () => {
      setIsChannelsOpen(true);
    };
    window.addEventListener('miki:open-gmail-signin', handleOpenGmail);
    window.addEventListener('miki:open-settings', handleOpenSettings);
    window.addEventListener('miki:open-eq', handleOpenEq);
    window.addEventListener('miki:open-library', handleOpenLibrary);
    window.addEventListener('miki:open-web-stream', handleOpenStream);
    window.addEventListener('miki:open-web-browser', handleOpenBrowser);
    window.addEventListener('miki:open-games', handleOpenGamesEvent);
    window.addEventListener('miki:open-channels', handleOpenChannelsEvent);
    return () => {
      window.removeEventListener('miki:open-gmail-signin', handleOpenGmail);
      window.removeEventListener('miki:open-settings', handleOpenSettings);
      window.removeEventListener('miki:open-eq', handleOpenEq);
      window.removeEventListener('miki:open-library', handleOpenLibrary);
      window.removeEventListener('miki:open-web-stream', handleOpenStream);
      window.removeEventListener('miki:open-web-browser', handleOpenBrowser);
      window.removeEventListener('miki:open-games', handleOpenGamesEvent);
      window.removeEventListener('miki:open-channels', handleOpenChannelsEvent);
    };
  }, []);

  // Initialize playback engine on mount
  useEffect(() => {
    bootEngine(undefined, videoRef.current ?? undefined);
  }, [bootEngine]);

  // Ensure DOM video element is always attached and spatial audio engine is connected
  useEffect(() => {
    if (videoRef.current) {
      const engine = usePlayerStore.getState().engine;
      if (engine && 'bindVideoElement' in engine) {
        (engine as { bindVideoElement: (el: HTMLVideoElement) => void }).bindVideoElement(
          videoRef.current
        );
      }
      if (engine && 'attachSpatialAudio' in engine) {
        (engine as { attachSpatialAudio: (s: any) => void }).attachSpatialAudio(
          usePlayerStore.getState().spatialAudio
        );
      }
    }
  }, [videoRef]);

  // Disable default browser/WebView right-click context menu
  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };
    window.addEventListener('contextmenu', handleContextMenu);
    return () => window.removeEventListener('contextmenu', handleContextMenu);
  }, []);

  // Listen to Cocoa native file picker event from BorderlessKeyWindow
  useEffect(() => {
    const handleNativePicked = (e: Event) => {
      const customEvent = e as CustomEvent<{ path: string; name: string }>;
      if (customEvent.detail && customEvent.detail.path) {
        openMedia(customEvent.detail.path, customEvent.detail.name);
      }
    };
    window.addEventListener('miki:nativeFileSelected', handleNativePicked);
    return () => window.removeEventListener('miki:nativeFileSelected', handleNativePicked);
  }, [openMedia]);

  // Check initial OS System Permissions Access confirmation on first launch
  useEffect(() => {
    const hasAccepted = localStorage.getItem('miki_os_permissions_accepted');
    if (!hasAccepted) {
      const timer = setTimeout(() => {
        setIsSystemAccessOpen(true);
      }, 700);
      return () => clearTimeout(timer);
    }
  }, []);

  // Allow reopening OS System Access dialog from settings or anywhere
  useEffect(() => {
    const handleOpenAccess = () => setIsSystemAccessOpen(true);
    window.addEventListener('miki:open-system-access', handleOpenAccess);
    return () => window.removeEventListener('miki:open-system-access', handleOpenAccess);
  }, []);

  // Listen for web browser navigation requests
  useEffect(() => {
    const handleNavigateBrowser = (e: Event) => {
      const detail = (e as CustomEvent<{ url?: string }>).detail;
      if (detail?.url) {
        setWebBrowserUrl(detail.url);
        setIsWebBrowserOpen(true);
      }
    };
    window.addEventListener('miki:navigate-web-browser', handleNavigateBrowser);
    return () => window.removeEventListener('miki:navigate-web-browser', handleNavigateBrowser);
  }, []);

  // Listen to Cocoa native directory picker and screenshot saved events
  useEffect(() => {
    const handleDirPicked = (e: Event) => {
      const customEvent = e as CustomEvent<{ path: string }>;
      if (customEvent.detail && customEvent.detail.path) {
        usePlayerStore.getState().setScreenshotDirectory(customEvent.detail.path);
      }
    };
    const handleScreenshotSaved = (e: Event) => {
      const customEvent = e as CustomEvent<{ path: string }>;
      if (customEvent.detail && customEvent.detail.path) {
        usePlayerStore.getState().setSnapshotNotification(`Saved to: ${customEvent.detail.path}`);
        setTimeout(() => usePlayerStore.getState().setSnapshotNotification(null), 4000);
      }
    };
    window.addEventListener('miki:nativeDirectorySelected', handleDirPicked);
    window.addEventListener('miki:screenshotSaved', handleScreenshotSaved);
    return () => {
      window.removeEventListener('miki:nativeDirectorySelected', handleDirPicked);
      window.removeEventListener('miki:screenshotSaved', handleScreenshotSaved);
    };
  }, []);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement;
      if (activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA')) {
        return;
      }

      resetControlsTimer();

      switch (e.key.toLowerCase()) {
        case ' ':
          e.preventDefault();
          usePlayerStore.getState().togglePlay();
          break;
        case 'f':
          e.preventDefault();
          if (
            typeof window !== 'undefined' &&
            (window as unknown as { webkit?: { messageHandlers?: { windowAction?: { postMessage: (msg: string) => void } } } }).webkit?.messageHandlers?.windowAction
          ) {
            (window as unknown as { webkit: { messageHandlers: { windowAction: { postMessage: (msg: string) => void } } } }).webkit.messageHandlers.windowAction.postMessage('toggleFullscreen');
          } else if (containerRef.current) {
            if (!document.fullscreenElement) {
              containerRef.current.requestFullscreen().catch(() => {});
            } else {
              document.exitFullscreen().catch(() => {});
            }
          }
          break;
        case 'arrowleft':
          e.preventDefault();
          seek(Math.max(0, usePlayerStore.getState().positionMs - 10000));
          break;
        case 'arrowright':
          e.preventDefault();
          seek(usePlayerStore.getState().positionMs + 10000);
          break;
        case 'm':
          e.preventDefault();
          usePlayerStore.getState().setVolume(usePlayerStore.getState().volume === 0 ? 100 : 0);
          break;
        case 'b':
          e.preventDefault();
          usePlayerStore.getState().addBookmark();
          break;
        case 'e':
          e.preventDefault();
          setIsEqOpen((prev) => !prev);
          break;
        case 's':
          e.preventDefault();
          setIsSettingsOpen((prev) => !prev);
          break;
        case 'n':
          if (e.shiftKey) {
            e.preventDefault();
            playNextMedia();
          }
          break;
        case 'p':
          if (e.shiftKey) {
            e.preventDefault();
            playPreviousMedia();
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [seek, resetControlsTimer, playNextMedia, playPreviousMedia]);

  const handleOpenLocalFileDialog = useCallback(() => {
    if (
      typeof window !== 'undefined' &&
      (window as unknown as { webkit?: { messageHandlers?: { openNativeFileDialog?: { postMessage: (msg: string) => void } } } }).webkit?.messageHandlers?.openNativeFileDialog
    ) {
      (window as unknown as { webkit: { messageHandlers: { openNativeFileDialog: { postMessage: (msg: string) => void } } } }).webkit.messageHandlers.openNativeFileDialog.postMessage('open');
    } else {
      const input = document.getElementById('miki-main-file-input') as HTMLInputElement | null;
      input?.click();
    }
  }, []);

  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      const uri = URL.createObjectURL(file);
      openMedia(uri, file.name);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleNativeFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const uri = URL.createObjectURL(file);
      openMedia(uri, file.name);
    }
  };

  const formatTime = (ms: number) => {
    const totalSec = Math.max(0, Math.floor(ms / 1000));
    const h = Math.floor(totalSec / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    const s = totalSec % 60;
    if (h > 0) {
      return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={resetControlsTimer}
      onMouseDown={resetControlsTimer}
      onKeyDown={resetControlsTimer}
      onDrop={handleFileDrop}
      onDragOver={handleDragOver}
      onTouchStart={(e) => {
        resetControlsTimer();
        handleTouchStart(e);
      }}
      onTouchEnd={handleTouchEnd}
      onContextMenu={(e) => e.preventDefault()}
      className={`relative w-screen h-screen overflow-hidden bg-slate-950 select-none flex flex-col font-sans ${
        areControlsVisible || !currentUri ? 'cursor-default' : 'cursor-none'
      }`}
    >
      {/* Custom Background Image Layer (Below all Glassmorphic Layers with Extended Spread) */}
      {customBgImage && (
        <div className="absolute -inset-10 z-0 pointer-events-none overflow-hidden">
          <img
            src={customBgImage}
            alt="Custom background wallpaper"
            className="w-full h-full object-cover transition-all duration-200 ease-out"
            style={{
              opacity: customBgOpacity,
              WebkitFilter: `blur(${customBgBlur}px) brightness(${customBgBrightness ?? 1.0})`,
              filter: `blur(${customBgBlur}px) brightness(${customBgBrightness ?? 1.0})`,
              transform: `scale(${1.08 + (customBgBlur / 80) * 0.12})`,
              WebkitTransform: `scale(${1.08 + (customBgBlur / 80) * 0.12})`,
            }}
          />
          {/* Dynamic Tint Overlay Layer */}
          <div
            className={`absolute inset-0 pointer-events-none transition-colors duration-300 ${
              customBgTint === 'navy'
                ? 'bg-blue-950/60'
                : customBgTint === 'aurora'
                  ? 'bg-emerald-950/50'
                  : customBgTint === 'amethyst'
                    ? 'bg-purple-950/50'
                    : customBgTint === 'clear'
                      ? 'bg-transparent'
                      : 'bg-black/55'
            }`}
            style={{
              opacity: customBgTint === 'clear' ? 0 : Math.min(1, Math.max(0.2, (customBgOpacity ?? 1) * 0.85)),
            }}
          />
        </div>
      )}

      {/* Global Theme Ambient Atmosphere Layer */}
      <div
        className="absolute inset-0 pointer-events-none z-0 transition-all duration-700 overflow-hidden"
        style={{
          background: `radial-gradient(ellipse 95% 70% at 50% -10%, ${theme.haloGlow}, transparent 70%), radial-gradient(circle 800px at 0% 100%, ${theme.previewColors[0]}44, transparent 65%), radial-gradient(circle 800px at 100% 100%, ${theme.previewColors[1]}44, transparent 65%)`,
          mixBlendMode: customBgImage ? 'screen' : 'normal',
          opacity: customBgImage ? 0.85 : 1,
        }}
      />

      {/* Sleek, Clean Frameless Titlebar - Drag & Always Visible Menubar */}
      <div
        onMouseDown={handleStartWindowDrag}
        className={`w-full h-11 z-50 flex items-center justify-between px-4 backdrop-blur-xl border-b select-none opacity-100 translate-y-0 transition-all duration-300 ${
          theme.glassBg
        } ${theme.glassBorder}`}
        style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
      >
        {/* Left Branding & Return Button */}
        <div
          className="flex items-center gap-3"
          style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
        >
          {currentUri && activePlaybackMode === 'video' ? (
            <button
              onClick={() => {
                captureCurrentVideoFrame();
                closeMedia();
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-white/5 hover:bg-white/15 border border-white/10 text-xs font-semibold text-white/90 hover:text-white transition-all active:scale-95 shadow-sm cursor-pointer"
              title="Return to Library / Home"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-cyan-400" />
              <span>Back</span>
            </button>
          ) : (
            <div className="flex items-center gap-2.5 text-xs font-bold text-white tracking-wide">
              <img
                src="/logo.png"
                alt="Miki Player"
                className="w-5 h-5 rounded-md object-contain bg-white/10 p-0.5"
              />
              <span
                className={`bg-gradient-to-r ${theme.accentGradient} bg-clip-text text-transparent font-extrabold text-sm tracking-tight`}
              >
                Miki Player
              </span>
            </div>
          )}

          {/* Application Menu: Google/Gmail Sign-in, Web Streams, Quick Tools */}
          <ApplicationMenu
            onOpenGmailSignIn={() => setIsGmailSignInOpen(true)}
            onOpenLibrary={(tab) => {
              if (tab) setFileBrowserInitialTab(tab);
              setIsFileBrowserOpen(true);
            }}
            onOpenWebBrowser={(url) => {
              if (url) setWebBrowserUrl(url);
              setIsWebBrowserOpen(true);
            }}
            onOpenSettings={() => setIsSettingsOpen(true)}
            onOpenEq={() => setIsEqOpen(true)}
            onOpenLocalFile={handleOpenLocalFileDialog}
            onOpenSystemAccess={() => setIsSystemAccessOpen(true)}
            onOpenGames={(gameId?: string) => {
              if (gameId) setSelectedGameId(gameId);
              setIsGamesOpen(true);
            }}
            onOpenMusic={() => setMusicPlayerOpen(true)}
            onOpenChannels={() => setIsChannelsOpen(true)}
          />

          {currentUri && (
            <div className="flex items-center gap-2">
              <img
                src="/logo.png"
                alt="Miki Player"
                className="w-4 h-4 rounded-md object-contain bg-white/10 p-0.5"
              />
              <span className="text-xs text-white/80 font-medium truncate max-w-sm">
                {currentTitle}
              </span>
            </div>
          )}
        </div>

        {/* Right Navigation, Network Strength & Logged User Profile */}
        <div
          className="flex items-center gap-2.5"
          style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
        >
          {/* Current Section Name Badge */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white/5 border border-white/10 text-white shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            <span className="text-xs font-bold tracking-tight text-white/90">
              {currentSectionName}
            </span>
          </div>

          {/* Network Strength Indicator */}
          <div
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-mono font-semibold"
            title="Network Strength: 100% (Ultra HD 4K Ready)"
          >
            <Wifi className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-[10px] hidden sm:inline">100%</span>
          </div>

          {/* Logged User Profile (Suriya Sharma) */}
          <div
            className="flex items-center gap-2 pl-1 pr-2.5 py-1 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors cursor-pointer select-none"
            title="Logged in as Suriya Sharma • Online"
            onClick={() => setIsSettingsOpen(true)}
          >
            <div className="relative">
              <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-cyan-500 to-purple-600 flex items-center justify-center text-[10px] font-extrabold text-white shadow-sm">
                SS
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 border border-[#07090e]" />
            </div>
            <div className="hidden md:flex flex-col text-left">
              <span className="text-xs font-semibold text-white/95 leading-none">
                Suriya Sharma
              </span>
              <span className="text-[9px] text-emerald-400 font-mono leading-none mt-0.5">
                Online
              </span>
            </div>
          </div>

          {/* Custom Window Controls (Pure Undecorated Frame) */}
          <div className="flex items-center gap-1 ml-0.5 pl-2 border-l border-white/10">
            <button
              onClick={handleWindowMinimize}
              className="w-7 h-7 rounded-xl hover:bg-white/10 text-white/70 hover:text-white flex items-center justify-center transition-colors text-xs font-bold"
              title="Minimize"
            >
              ─
            </button>
            <button
              onClick={handleWindowMaximize}
              className="w-7 h-7 rounded-xl hover:bg-white/10 text-white/70 hover:text-white flex items-center justify-center transition-colors text-xs"
              title="Maximize"
            >
              □
            </button>
            <button
              onClick={handleWindowClose}
              className="w-7 h-7 rounded-xl hover:bg-rose-500/40 text-white/70 hover:text-rose-200 flex items-center justify-center transition-colors text-xs"
              title="Close"
            >
              ✕
            </button>
          </div>
        </div>
      </div>

      {/* Main Viewport Area */}
      <div className="relative flex-1 w-full h-full overflow-hidden flex items-center justify-center">
        {/* Ambient Lighting Canvas Layer */}
        {!youtubeId && !activeWebStream && <AmbientCanvas videoRef={videoRef} />}

        {/* Web Stream (YouTube, TikTok, Instagram, Cinema, Vimeo, Twitch) or Standard Video */}
        {youtubeId ? (
          <YouTubePlayer
            youtubeId={youtubeId}
            initialPositionMs={usePlayerStore.getState().positionMs}
          />
        ) : activeWebStream ? (
          <WebEmbedPlayer
            platform={activeWebStream.platform}
            embedUrl={activeWebStream.embedUrl}
            originalUrl={activeWebStream.originalUrl}
            title={currentTitle}
            onOpenEq={() => setIsEqOpen(true)}
          />
        ) : activeEngineType === 'web-media' ? (
          <div ref={viewportRef} className={`relative w-full h-full flex items-center justify-center overflow-hidden ${!currentUri ? 'hidden' : ''}`}>
            {/* When playing Music, display Modern Music Studio Viewport with Real Cover Artwork & Visualizer */}
            {activePlaybackMode === 'music' && (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center pointer-events-auto p-6 bg-gradient-to-b from-slate-950/80 via-slate-900/90 to-slate-950/95 backdrop-blur-xl animate-in fade-in duration-300">
                {/* Ambient Glow matching cover art */}
                <div
                  className="absolute w-96 h-96 rounded-full blur-3xl opacity-35 -z-10 animate-pulse pointer-events-none"
                  style={{
                    background: 'radial-gradient(circle, rgba(168,85,247,0.4) 0%, rgba(6,182,212,0.2) 60%, transparent 100%)',
                  }}
                />

                {/* Album Cover Art Display */}
                <div className="relative group mb-6">
                  <div className="relative w-64 h-64 sm:w-80 sm:h-80 rounded-2xl overflow-hidden shadow-2xl shadow-cyan-950/60 border border-white/10 ring-1 ring-white/10 transition-all duration-300 group-hover:scale-[1.02]">
                    <img
                      src={currentArtwork || 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=500&auto=format&fit=crop&q=80'}
                      alt={currentTitle || 'Now Playing'}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src =
                          'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=500&auto=format&fit=crop&q=80';
                      }}
                    />
                    {/* Vinyl Groove Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-black/40 via-transparent to-white/10 pointer-events-none" />
                  </div>

                  {/* Audio Status Pill */}
                  <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-slate-950/80 backdrop-blur-md border border-white/15 text-[10px] font-mono text-cyan-300 font-bold shadow-lg flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${!isPaused ? 'bg-emerald-400 animate-ping' : 'bg-amber-400'}`} />
                    <span>{!isPaused ? 'PLAYING' : 'PAUSED'}</span>
                  </div>

                  {/* Quality Badge */}
                  <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-full bg-slate-950/80 backdrop-blur-md border border-white/15 text-[10px] font-mono text-purple-300 font-bold shadow-lg flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-purple-400" />
                    <span>24-BIT / 192kHz HI-FI</span>
                  </div>
                </div>

                {/* Track Metadata */}
                <div className="text-center max-w-lg mb-4">
                  <h2 className="text-lg sm:text-2xl font-black text-white tracking-tight drop-shadow truncate px-2">
                    {currentTitle || 'Miki Audio Stream'}
                  </h2>
                  <p className="text-xs sm:text-sm text-white/60 font-medium mt-1">
                    Lossless Audio Pipeline • Chunk-by-Chunk Progressive Engine
                  </p>
                </div>

                {/* Dynamic Equalizer Waveform Bars */}
                <div className="flex items-center gap-1 h-8 mb-5">
                  {[24, 38, 55, 75, 42, 88, 62, 95, 70, 48, 80, 58, 32, 68, 90, 45].map((h, i) => (
                    <div
                      key={i}
                      className="w-1 rounded-full bg-gradient-to-t from-cyan-500 to-purple-500 transition-all duration-150"
                      style={{
                        height: !isPaused ? `${h}%` : '20%',
                        opacity: !isPaused ? 0.9 : 0.35,
                      }}
                    />
                  ))}
                </div>

                {/* Action Buttons: Full Studio & EQ */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setMusicPlayerOpen(true)}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 text-white text-xs font-bold shadow-lg shadow-cyan-600/30 border border-white/20 transition-all hover:scale-105 active:scale-95 cursor-pointer flex items-center gap-1.5"
                  >
                    <Music className="w-3.5 h-3.5" />
                    <span>Open Full-Window Studio</span>
                  </button>
                  <button
                    onClick={() => setIsEqOpen(true)}
                    className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold border border-white/15 transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <Sliders className="w-3.5 h-3.5 text-emerald-400" />
                    <span>10-Band EQ</span>
                  </button>
                </div>
              </div>
            )}

            <video
              id="aether-video-viewport"
              ref={videoRef}
              className={`w-full h-full object-contain z-10 cursor-pointer ${
                !currentUri ? 'hidden' : activePlaybackMode === 'music' ? 'opacity-0 pointer-events-none absolute w-1 h-1' : ''
              }`}
              playsInline
              preload="auto"
              onWaiting={() => usePlayerStore.setState({ isBuffering: true })}
              onPlaying={() => usePlayerStore.setState({ isBuffering: false })}
              onCanPlay={() => usePlayerStore.setState({ isBuffering: false })}
              onLoadedData={() => usePlayerStore.setState({ isBuffering: false })}
              onLoadStart={() => usePlayerStore.setState({ isBuffering: true })}
              onError={(e) => {
                // Auto-fallback to resilient WebEmbedPlayer only for web sites, never for direct media/HLS streams
                if (
                  currentUri &&
                  (currentUri.startsWith('http://') || currentUri.startsWith('https://')) &&
                  !isDirectMediaUrl(currentUri) &&
                  !HlsStreamController.isHlsUrl(currentUri)
                ) {
                  const recovered = fallbackToWebStream(currentUri);
                  if (recovered) return;
                }

                const err = e.currentTarget.error;
                let code: 'STREAM_ERROR' | 'MEDIA_NOT_FOUND' | 'CODEC_UNSUPPORTED' | 'STREAM_TIMEOUT' = 'STREAM_ERROR';
                let message = 'Failed to load video stream or file.';
                let details = err?.message || 'Media source unreachable or unsupported format.';
                let severity: 'warning' | 'recoverable' | 'critical' = 'recoverable';
                let recovery: 'none' | 'retry_with_backoff' | 'retry_software_decode' = 'retry_with_backoff';

                if (err?.code === 1) {
                  code = 'STREAM_ERROR';
                  message = 'Media playback was aborted.';
                  severity = 'warning';
                  recovery = 'none';
                } else if (err?.code === 2) {
                  code = 'STREAM_TIMEOUT';
                  message = 'A network error occurred while downloading the media.';
                  severity = 'recoverable';
                  recovery = 'retry_with_backoff';
                } else if (err?.code === 3) {
                  code = 'CODEC_UNSUPPORTED';
                  message = 'Video decoding failed: media format or codec is corrupted or unsupported.';
                  severity = 'recoverable';
                  recovery = 'retry_software_decode';
                } else if (err?.code === 4) {
                  code = 'MEDIA_NOT_FOUND';
                  message = 'Media file or stream not supported or source could not be found.';
                  severity = 'critical';
                  recovery = 'none';
                }
                usePlayerStore.getState().handleStreamError({
                  code,
                  message,
                  details,
                  severity,
                  recovery,
                  timestampMs: Date.now(),
                });
              }}
              onClick={() => usePlayerStore.getState().togglePlay()}
              onPlay={() => usePlayerStore.setState({ isPaused: false, isBuffering: false })}
              onPause={() => {
                usePlayerStore.setState({ isPaused: true });
                captureCurrentVideoFrame();
              }}
              onEnded={() => {
                usePlayerStore.setState({ isPaused: true, isBuffering: false });
                captureCurrentVideoFrame();
              }}
              onTimeUpdate={(e) => {
                const v = e.currentTarget;
                const pos = Math.round(v.currentTime * 1000);
                usePlayerStore.setState({
                  positionMs: pos,
                  durationMs: Math.round((v.duration || 0) * 1000),
                });

                // Periodically capture frame thumbnail (every 5 seconds)
                if (Date.now() - lastThumbCaptureTimeRef.current > 5000) {
                  lastThumbCaptureTimeRef.current = Date.now();
                  captureCurrentVideoFrame();
                }
              }}
            />

            {/* High-Performance Loading / Buffering HUD Animation Indicator */}
            {isBuffering && !lastError && currentUri && (
              <div className="absolute inset-0 pointer-events-none z-20 flex flex-col items-center justify-center bg-black/45 backdrop-blur-sm animate-in fade-in duration-200">
                <div className="relative flex items-center justify-center">
                  {/* Outer Pulsing Aura */}
                  <div
                    className={`absolute -inset-6 rounded-full bg-gradient-to-r ${theme.accentGradient} opacity-35 blur-xl animate-pulse`}
                  />
                  {/* Outer Spinning Ring */}
                  <div
                    className="w-16 h-16 rounded-full border-4 border-transparent border-t-cyan-400 border-r-fuchsia-400 animate-spin"
                    style={{ animationDuration: '0.85s' }}
                  />
                  {/* Inner Counter-Spinning Ring */}
                  <div
                    className="absolute w-10 h-10 rounded-full border-2 border-transparent border-b-cyan-300 border-l-purple-400 animate-spin"
                    style={{ animationDirection: 'reverse', animationDuration: '1.2s' }}
                  />
                  {/* Center Spinning Icon */}
                  <div className="absolute flex items-center justify-center">
                    <RefreshCw className="w-5 h-5 text-white animate-spin opacity-85" />
                  </div>
                </div>

                <div className="mt-4 flex flex-col items-center gap-1">
                  <span className="text-xs font-bold text-white tracking-wider uppercase drop-shadow flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                    Loading Media Stream...
                  </span>
                  {currentTitle && (
                    <span className="text-[11px] text-white/70 font-medium max-w-sm truncate drop-shadow px-2">
                      {currentTitle}
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Subtitle Caption Overlay */}
            {activeSubtitleTrack && (
              <SubtitleOverlay
                cues={activeSubtitleTrack.cues}
                currentPositionSec={positionMs / 1000}
                syncOffsetSec={activeSubtitleTrack.syncOffsetSec}
                styleConfig={subtitleStyle}
                isVisible={isSubtitlesVisible}
              />
            )}

            {/* Split-Screen Compare Mode: Draggable Divider & Unclipped Comparison */}
            {shaderConfig.splitCompareEnabled && (
              <>
                {/* Clarity AI Enhanced Right Side Filter Overlay */}
                <div
                  className="absolute inset-0 pointer-events-none z-20 backdrop-filter"
                  style={{
                    clipPath: `polygon(${shaderConfig.splitComparePosition}% 0, 100% 0, 100% 100%, ${shaderConfig.splitComparePosition}% 100%)`,
                    backdropFilter: 'contrast(135%) brightness(108%) saturate(120%)',
                    WebkitBackdropFilter: 'contrast(135%) brightness(108%) saturate(120%)',
                  }}
                />

                {/* Unclipped High-Visibility Badges & Interactive Divider Line */}
                <div className="absolute inset-0 pointer-events-none z-30">
                  <div className="absolute top-4 left-4 px-3 py-1.5 rounded-xl bg-black/80 backdrop-blur-md text-[10px] font-mono font-bold text-white/90 border border-white/20 shadow-lg flex items-center gap-1.5 pointer-events-auto">
                    <span className="w-2 h-2 rounded-full bg-white/40" />
                    <span>ORIGINAL (LEFT)</span>
                  </div>
                  <div className="absolute top-4 right-4 px-3 py-1.5 rounded-xl bg-cyan-950/85 backdrop-blur-md text-[10px] font-mono font-bold text-cyan-300 border border-cyan-400/40 shadow-lg flex items-center gap-1.5 pointer-events-auto">
                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                    <span>CLARITY AI (RIGHT)</span>
                  </div>

                  {/* Interactive Draggable Splitter Line & Knob */}
                  <div
                    className="absolute top-0 bottom-0 pointer-events-auto cursor-ew-resize group select-none"
                    style={{
                      left: `${shaderConfig.splitComparePosition}%`,
                      transform: 'translateX(-50%)',
                      width: '32px',
                    }}
                    onMouseDown={handleSplitterMouseDown}
                    title="Drag left/right to compare Before/After"
                  >
                    {/* Glowing vertical line */}
                    <div className="w-1 h-full mx-auto bg-gradient-to-b from-cyan-400 via-fuchsia-400 to-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.95)] group-hover:w-1.5 transition-all" />

                    {/* Centered Grabbable Knob */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-slate-950 border-2 border-cyan-400 group-hover:border-fuchsia-400 flex items-center justify-center shadow-[0_0_20px_rgba(34,211,238,0.7)] group-hover:scale-110 active:scale-95 transition-all">
                      <div className="flex items-center gap-0.5 pointer-events-none">
                        <div className="w-0.5 h-3.5 bg-cyan-400 rounded-full" />
                        <div className="w-0.5 h-3.5 bg-fuchsia-400 rounded-full" />
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="w-full h-full pointer-events-none z-10" />
        )}

        {/* Complete Home Streaming Dashboard (Netflix + Adze.DESIGN + Apple Cover Flow 3D) */}
        {(!currentUri && (activePlaybackMode !== 'video' || !currentUri) || (activePlaybackMode === 'music' && !isMusicPlayerOpen)) && (
          <div className="absolute inset-0 z-30 pointer-events-auto animate-in fade-in duration-300 overflow-hidden">
            <HomeDashboardView
              onOpenGames={(gameId) => {
                if (gameId) setSelectedGameId(gameId);
                setIsGamesOpen(true);
              }}
              onOpenMusic={() => setMusicPlayerOpen(true)}
              onOpenWebBrowser={(url) => {
                if (url) setWebBrowserUrl(url);
                setIsWebBrowserOpen(true);
              }}
              onOpenSettings={() => setIsSettingsOpen(true)}
              onOpenEq={() => setIsEqOpen(true)}
              onOpenLocalFile={() => {
                handleOpenLocalFileDialog();
                const input = document.getElementById("miki-main-file-input");
                input?.click();
              }}
            />
            {/* Hidden file input for native file select dialog */}
            <input
              id="miki-main-file-input"
              type="file"
              className="hidden"
              accept="video/*,audio/*,.mkv,.mp4,.avi,.mov,.webm,.m3u8"
              onChange={handleNativeFileSelect}
            />
          </div>
        )}

        {/* Auto-Resume Notification Banner */}
        {resumeBannerPositionMs !== null && !youtubeId && (
          <div className="absolute top-14 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-top duration-300">
            <div
              className={`backdrop-blur-2xl px-5 py-2.5 rounded-2xl border shadow-2xl flex items-center gap-3.5 ${theme.glassBg} ${theme.glassBorder}`}
              style={{ boxShadow: `0 10px 30px ${theme.haloGlow}` }}
            >
              <span className="text-xs text-white/90">
                Resume <strong className="text-white">{currentTitle}</strong> at{' '}
                <strong className="text-cyan-300 font-mono">
                  {formatTime(resumeBannerPositionMs)}
                </strong>
                ?
              </span>
              <button
                onClick={() => {
                  seek(resumeBannerPositionMs, true);
                  usePlayerStore.setState({ resumeBannerPositionMs: null });
                }}
                className={`px-3.5 py-1.5 rounded-xl bg-gradient-to-r ${theme.accentGradient} text-white font-bold text-xs hover:brightness-110 transition-colors shadow-md`}
              >
                Resume
              </button>
              <button
                onClick={() => usePlayerStore.setState({ resumeBannerPositionMs: null })}
                className="text-xs text-white/60 hover:text-white transition-colors"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        {/* Screenshot Notification Toast */}
        {snapshotNotification && (
          <div className="absolute top-14 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-top duration-300 pointer-events-none">
            <div
              className={`backdrop-blur-2xl px-5 py-2.5 rounded-2xl border shadow-2xl flex items-center gap-2.5 ${theme.glassBg} ${theme.glassBorder}`}
              style={{ boxShadow: `0 10px 30px ${theme.haloGlow}` }}
            >
              <Camera className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-semibold text-white/90 font-mono">
                {snapshotNotification}
              </span>
            </div>
          </div>
        )}

        {/* Glassmorphic Controls Overlay (for native/local/HLS video & streams) */}
        {currentUri && !activeWebStream && activePlaybackMode === 'video' && (
          <ControlsOverlay
            onOpenEq={() => setIsEqOpen(true)}
            onOpenSettings={() => setIsSettingsOpen(true)}
            onOpenFileBrowser={() => {
              setIsDashboardOpen(true);
            }}
            containerRef={containerRef}
            isVisible={areControlsVisible}
          />
        )}

        {/* Persistent System-Wide Music Control Hub (Active across all sections) */}
        {currentUri && (activePlaybackMode === 'music' || activePlaybackMode === 'radio') && !isMusicPlayerOpen && (
          <PersistentMusicControlHub
            onOpenStudio={() => setMusicPlayerOpen(true)}
          />
        )}
      </div>

      {/* Modals wrapped in ErrorBoundary to guarantee uninterrupted UI */}
      <ErrorBoundary onReset={() => setIsDashboardOpen(false)}>
        <FullWindowDashboard
          isOpen={isDashboardOpen}
          onClose={() => setIsDashboardOpen(false)}
          onOpenGames={(gameId) => {
            if (gameId) setSelectedGameId(gameId);
            setIsGamesOpen(true);
          }}
          onOpenMusic={() => setMusicPlayerOpen(true)}
          onOpenWebBrowser={(url) => {
            if (url) setWebBrowserUrl(url);
            setIsWebBrowserOpen(true);
          }}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onOpenEq={() => setIsEqOpen(true)}
        />
      </ErrorBoundary>

      <ErrorBoundary onReset={() => setIsWebBrowserOpen(false)}>
        <WebBrowserModal
          isOpen={isWebBrowserOpen}
          initialUrl={webBrowserUrl}
          onClose={() => setIsWebBrowserOpen(false)}
          onPlayInNativePlayer={(url, title) => {
            openMedia(url, title);
          }}
          onStartWindowDrag={handleStartWindowDrag}
          onMinimizeWindow={handleWindowMinimize}
          onMaximizeWindow={handleWindowMaximize}
          onOpenEq={() => setIsEqOpen(true)}
        />
      </ErrorBoundary>

      <ErrorBoundary onReset={() => setIsFileBrowserOpen(false)}>
        <FileBrowserModal
          isOpen={isFileBrowserOpen}
          onClose={() => setIsFileBrowserOpen(false)}
          initialTab={fileBrowserInitialTab}
          onOpenGames={(gameId) => {
            if (gameId) setSelectedGameId(gameId);
            setIsGamesOpen(true);
          }}
        />
      </ErrorBoundary>

      <ErrorBoundary onReset={() => setIsGamesOpen(false)}>
        <FullWindowGamesModal
          isOpen={isGamesOpen}
          initialGameId={selectedGameId}
          onClose={() => setIsGamesOpen(false)}
        />
      </ErrorBoundary>

      <ErrorBoundary onReset={() => setMusicPlayerOpen(false)}>
        <FullWindowMusicPlayer
          isOpen={isMusicPlayerOpen}
          onClose={() => setMusicPlayerOpen(false)}
          onOpenEq={() => setIsEqOpen(true)}
          onStartWindowDrag={handleStartWindowDrag}
        />
      </ErrorBoundary>

      <ErrorBoundary onReset={() => setIsChannelsOpen(false)}>
        <LiveChannelsModal
          isOpen={isChannelsOpen}
          onClose={() => setIsChannelsOpen(false)}
          onPlayChannel={(channel) => {
            openMedia(channel.streamUrl, channel.name);
          }}
        />
      </ErrorBoundary>

      <ErrorBoundary onReset={() => setIsGmailSignInOpen(false)}>
        <GmailSignInModal
          isOpen={isGmailSignInOpen}
          onClose={() => setIsGmailSignInOpen(false)}
        />
      </ErrorBoundary>

      <ErrorBoundary onReset={() => setIsSettingsOpen(false)}>
        <VideoSettingsModal
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          onOpenEq={() => setIsEqOpen(true)}
        />
      </ErrorBoundary>

      <ErrorBoundary onReset={() => setIsEqOpen(false)}>
        <EqualizerModal isOpen={isEqOpen} onClose={() => setIsEqOpen(false)} />
      </ErrorBoundary>

      <ErrorBoundary onReset={() => setIsResumeChoiceOpen(false)}>
        <ResumeChoiceModal
          isOpen={isResumeChoiceOpen}
          item={pendingResumeItem}
          onClose={() => {
            setIsResumeChoiceOpen(false);
            setPendingResumeItem(null);
          }}
          onResume={handleConfirmResume}
          onRestart={handleConfirmRestart}
        />
      </ErrorBoundary>

      <ErrorBoundary onReset={() => setIsSystemAccessOpen(false)}>
        <SystemAccessModal
          isOpen={isSystemAccessOpen}
          onClose={() => setIsSystemAccessOpen(false)}
        />
      </ErrorBoundary>

      <ErrorToast />

      {/* Cinematic Startup Video Splash Loader */}
      {showSplash && <SplashScreen onComplete={() => setShowSplash(false)} />}
    </div>
  );
};
