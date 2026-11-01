import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { usePlayerStore, MediaHistoryItem } from './store/playerStore';
import { PLAYER_THEMES } from './types/theme';
import { AmbientCanvas } from './components/ambient/AmbientCanvas';
import { ControlsOverlay } from './components/hud/ControlsOverlay';
import { EqualizerModal } from './components/hud/EqualizerModal';
import { VideoSettingsModal } from './components/hud/VideoSettingsModal';
import { FileBrowserModal } from './components/hud/FileBrowserModal';
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
import { parseWebStream } from './utils/webStreamUtils';
import {
  FolderOpen,
  Sparkles,
  Settings,
  ArrowLeft,
  Play,
  Trash2,
  Film,
  Plus,
  Camera,
  RefreshCw,
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
  const recentMedia = usePlayerStore((s) => s.recentMedia);
  const removeRecentMedia = usePlayerStore((s) => s.removeRecentMedia);
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
  const positionMs = usePlayerStore((s) => s.positionMs);
  const activeSubtitleTrack = usePlayerStore((s) => s.activeSubtitleTrack);
  const isSubtitlesVisible = usePlayerStore((s) => s.isSubtitlesVisible);
  const subtitleStyle = usePlayerStore((s) => s.subtitleStyle);

  const theme = PLAYER_THEMES[themeId] || PLAYER_THEMES.cyberpunk;

  const [isEqOpen, setIsEqOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isFileBrowserOpen, setIsFileBrowserOpen] = useState(false);
  const [fileBrowserInitialTab, setFileBrowserInitialTab] = useState<'youtube' | 'tiktok' | 'instagram' | 'demos' | 'recent' | 'bookmarks'>('youtube');
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

  const handleCardClick = (item: MediaHistoryItem) => {
    if (item.lastPositionMs && item.lastPositionMs > 1000) {
      setPendingResumeItem(item);
      setIsResumeChoiceOpen(true);
    } else {
      openMedia(item.uri, item.title, false, 0);
    }
  };

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

  const webStream = useMemo(() => (currentUri ? parseWebStream(currentUri) : null), [currentUri]);
  const youtubeId = webStream?.platform === 'youtube' ? webStream.id : null;

  // Listen for native / global triggers for Gmail signin & web streams
  useEffect(() => {
    const handleOpenGmail = () => setIsGmailSignInOpen(true);
    const handleOpenStream = (e: Event) => {
      const detail = (e as CustomEvent<{ tab?: 'youtube' | 'tiktok' | 'instagram' }>).detail;
      if (detail?.tab) setFileBrowserInitialTab(detail.tab);
      setIsFileBrowserOpen(true);
    };
    window.addEventListener('miki:open-gmail-signin', handleOpenGmail);
    window.addEventListener('miki:open-web-stream', handleOpenStream);
    return () => {
      window.removeEventListener('miki:open-gmail-signin', handleOpenGmail);
      window.removeEventListener('miki:open-web-stream', handleOpenStream);
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

  const handleOpenLocalFileDialog = () => {
    if (
      typeof window !== 'undefined' &&
      (window as unknown as { webkit?: { messageHandlers?: { openNativeFileDialog?: { postMessage: (msg: string) => void } } } }).webkit?.messageHandlers?.openNativeFileDialog
    ) {
      (window as unknown as { webkit: { messageHandlers: { openNativeFileDialog: { postMessage: (msg: string) => void } } } }).webkit.messageHandlers.openNativeFileDialog.postMessage('open');
    }
  };

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
          <div
            className="w-full h-full bg-cover bg-center transition-all duration-300 ease-out transform scale-105"
            style={{
              backgroundImage: `url(${customBgImage})`,
              opacity: customBgOpacity,
              filter: `blur(${customBgBlur}px) brightness(${customBgBrightness ?? 1.0})`,
            }}
          />
          {/* Dynamic Tint Overlay Layer */}
          <div
            className={`absolute inset-0 pointer-events-none transition-colors duration-300 ${
              customBgTint === 'navy'
                ? 'bg-blue-950/40'
                : customBgTint === 'aurora'
                  ? 'bg-emerald-950/30'
                  : customBgTint === 'amethyst'
                    ? 'bg-purple-950/30'
                    : customBgTint === 'clear'
                      ? 'bg-transparent'
                      : 'bg-black/40'
            }`}
            style={{
              opacity: customBgTint === 'clear' ? 0 : Math.min(1, (customBgOpacity ?? 1) * 0.9),
            }}
          />
        </div>
      )}

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
          {currentUri ? (
            <button
              onClick={() => {
                captureCurrentVideoFrame();
                closeMedia();
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-white/5 hover:bg-white/15 border border-white/10 text-xs font-semibold text-white/90 hover:text-white transition-all active:scale-95 shadow-sm"
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
            onOpenSettings={() => setIsSettingsOpen(true)}
            onOpenEq={() => setIsEqOpen(true)}
            onOpenLocalFile={() => {
              handleOpenLocalFileDialog();
              const input = document.getElementById('miki-main-file-input') as HTMLInputElement | null;
              input?.click();
            }}
            onOpenSystemAccess={() => setIsSystemAccessOpen(true)}
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

        {/* Right Navigation & Window Controls */}
        <div
          className="flex items-center gap-2"
          style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
        >
          <button
            onClick={() => setIsFileBrowserOpen(true)}
            className="text-xs text-white/80 hover:text-white px-3 py-1.5 rounded-2xl bg-white/5 hover:bg-white/15 border border-white/10 transition-colors font-medium flex items-center gap-1.5 active:scale-95"
          >
            <FolderOpen className="w-3.5 h-3.5 text-cyan-400" />
            <span>Library</span>
          </button>

          <button
            onClick={() => setIsSettingsOpen(true)}
            className="text-xs text-white/80 hover:text-white p-2 rounded-2xl bg-white/5 hover:bg-white/15 border border-white/10 transition-colors active:scale-95"
            title="Themes, 3D Sound, Clarity & Settings"
          >
            <Settings className="w-3.5 h-3.5 text-fuchsia-400" />
          </button>

          {/* Custom Window Controls (Pure Undecorated Frame) */}
          <div className="flex items-center gap-1 ml-1 pl-2 border-l border-white/10">
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
        {!youtubeId && !webStream && <AmbientCanvas videoRef={videoRef} />}

        {/* Web Stream (YouTube, TikTok, Instagram) or Standard Video */}
        {youtubeId ? (
          <YouTubePlayer
            youtubeId={youtubeId}
            initialPositionMs={usePlayerStore.getState().positionMs}
          />
        ) : webStream ? (
          <WebEmbedPlayer
            platform={webStream.platform}
            embedUrl={webStream.embedUrl}
            originalUrl={webStream.originalUrl}
            title={currentTitle}
          />
        ) : activeEngineType === 'web-media' ? (
          <div ref={viewportRef} className="relative w-full h-full flex items-center justify-center overflow-hidden">
            <video
              id="aether-video-viewport"
              ref={videoRef}
              crossOrigin="anonymous"
              className="w-full h-full object-contain z-10 cursor-pointer"
              playsInline
              preload="auto"
              onWaiting={() => usePlayerStore.setState({ isBuffering: true })}
              onPlaying={() => usePlayerStore.setState({ isBuffering: false })}
              onCanPlay={() => usePlayerStore.setState({ isBuffering: false })}
              onLoadedData={() => usePlayerStore.setState({ isBuffering: false })}
              onLoadStart={() => usePlayerStore.setState({ isBuffering: true })}
              onError={(e) => {
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
                usePlayerStore.setState({
                  isBuffering: false,
                  lastError: {
                    code,
                    message,
                    details,
                    severity,
                    recovery,
                    timestampMs: Date.now(),
                  },
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
            {isBuffering && currentUri && (
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

        {/* Home View / Top-Aligned Jump Back In & Card Previews */}
        {!currentUri && (
          <div
            className={`absolute inset-0 z-30 flex flex-col items-center justify-start pt-6 sm:pt-8 pb-12 px-6 sm:px-10 pointer-events-auto animate-in fade-in duration-300 overflow-y-auto ${
              customBgImage ? 'bg-black/25' : 'bg-black/75 backdrop-blur-md'
            }`}
          >
            {recentMedia.length > 0 ? (
              /* Rich Card Grid: Stopped-Point Video Preview Thumbnail, No Paths/URLs */
              <div className="w-full max-w-6xl flex flex-col gap-6">
                {/* Header Action Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
                  <div className="flex items-center gap-3.5">
                    <div
                      className={`p-3 rounded-2xl bg-gradient-to-r ${theme.accentGradient} text-white shadow-lg`}
                      style={{ boxShadow: `0 0 18px ${theme.haloGlow}` }}
                    >
                      <Film className="w-6 h-6 fill-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-extrabold text-white tracking-tight">
                        Resume
                      </h2>
                      <p className="text-xs text-slate-300">
                        Pick up right where you left off with stopped-point frame previews
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <button
                      onClick={() => {
                        handleOpenLocalFileDialog();
                        const input = document.getElementById('miki-main-file-input') as HTMLInputElement | null;
                        input?.click();
                      }}
                      className={`px-4 py-2.5 rounded-2xl bg-gradient-to-r ${theme.accentGradient} text-white font-bold text-xs cursor-pointer transition-all shadow-lg active:scale-95 flex items-center gap-1.5`}
                      style={{ boxShadow: `0 4px 15px ${theme.haloGlow}` }}
                    >
                      <Plus className="w-4 h-4" />
                      <span>Open</span>
                      <input
                        id="miki-main-file-input"
                        type="file"
                        className="hidden"
                        accept="video/*,audio/*,.mkv,.mp4,.avi,.mov,.webm,.m3u8"
                        onChange={handleNativeFileSelect}
                      />
                    </button>

                    <button
                      onClick={() => setIsFileBrowserOpen(true)}
                      className="px-4 py-2.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold text-xs transition-all active:scale-95 flex items-center gap-1.5"
                    >
                      <Sparkles className="w-4 h-4 text-cyan-400" />
                      <span>Library</span>
                    </button>
                  </div>
                </div>

                {/* Cards Grid: Preview Image of Stopped Point, No Path/URL shown */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {recentMedia.map((item) => {
                    const percent = Math.min(100, Math.max(0, item.progressPercent || 0));

                    return (
                      <div
                        key={item.mediaId}
                        onClick={() => handleCardClick(item)}
                        className={`group relative rounded-3xl p-4 border transition-all duration-300 flex flex-col gap-3.5 bg-white/5 hover:bg-white/10 ${theme.glassBorder} shadow-xl hover:shadow-2xl hover:scale-[1.015] cursor-pointer`}
                        style={{
                          boxShadow: `0 12px 35px rgba(0, 0, 0, 0.55)`,
                        }}
                      >
                        {/* 16:9 Stopped-Point Video Preview Thumbnail / YouTube Placeholder */}
                        <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-black/60 border border-white/10 group-hover:border-cyan-400/40 transition-colors">
                          {item.isYouTube && (
                            <div className="absolute top-2.5 left-2.5 z-20 px-2.5 py-0.5 rounded-lg bg-red-600 text-white font-extrabold text-[10px] tracking-wide flex items-center gap-1 shadow-lg shadow-red-900/40">
                              <Play className="w-2.5 h-2.5 fill-white" />
                              <span>YouTube</span>
                            </div>
                          )}

                          {item.thumbnailUri ? (
                            <img
                              src={item.thumbnailUri}
                              alt={item.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              onError={(e) => {
                                (e.currentTarget as HTMLElement).style.display = 'none';
                              }}
                            />
                          ) : item.isYouTube ? (
                            <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-red-950/60 via-slate-900 to-black text-white/50 gap-2">
                              <div className="p-3 rounded-2xl bg-red-600/20 border border-red-500/30 text-red-400">
                                <Play className="w-6 h-6 fill-red-500" />
                              </div>
                              <span className="text-[11px] font-mono text-white/70 font-semibold">YouTube Stream</span>
                            </div>
                          ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 to-black text-white/30 gap-2">
                              <Film className="w-8 h-8 opacity-40 text-cyan-400" />
                              <span className="text-[10px] font-mono">Video Preview</span>
                            </div>
                          )}

                          {/* Hover Play Glow Overlay */}
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className={`p-3.5 rounded-2xl ${item.isYouTube ? 'bg-red-600 text-white shadow-xl shadow-red-600/40' : 'bg-cyan-500/90 text-white shadow-xl shadow-cyan-500/40'} scale-95 group-hover:scale-105 transition-transform`}>
                              <Play className="w-6 h-6 fill-white translate-x-0.5" />
                            </div>
                          </div>

                          {/* Stopped Position & Duration Badge */}
                          <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-lg bg-black/80 backdrop-blur-md text-[10px] font-mono font-bold text-white/90 border border-white/15">
                            {item.isYouTube && !item.lastPositionMs ? 'YouTube Stream' : `${formatTime(item.lastPositionMs)} / ${item.durationMs > 0 ? formatTime(item.durationMs) : (item.isYouTube ? 'YouTube' : '0:00')}`}
                          </div>
                        </div>

                        {/* Title & Watched Percentage Badge (NO Path or URL shown) */}
                        <div className="flex flex-col gap-2">
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors line-clamp-2 leading-snug">
                              {item.title}
                            </h3>
                            <span
                              className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-lg shrink-0 ${
                                item.isYouTube && (!item.lastPositionMs || percent === 0)
                                  ? 'bg-red-500/20 text-red-300 border border-red-400/30'
                                  : percent > 80
                                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30'
                                    : `${theme.badgeClass}`
                              }`}
                            >
                              {item.isYouTube && (!item.lastPositionMs || percent === 0)
                                ? 'YouTube'
                                : `${percent.toFixed(0)}% watched`}
                            </span>
                          </div>
                        </div>

                        {/* Theme-Gradient Progress Bar */}
                        <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden p-0.5 border border-white/5">
                          <div
                            className={`h-full rounded-full bg-gradient-to-r ${item.isYouTube ? 'from-red-500 to-rose-600' : theme.timelineTrack} transition-all duration-300`}
                            style={{ width: `${item.isYouTube && (!item.lastPositionMs || percent === 0) ? 100 : percent}%` }}
                          />
                        </div>

                        {/* Card Actions: Resume & Remove */}
                        <div className="flex items-center justify-between pt-2 border-t border-white/10">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCardClick(item);
                            }}
                            className={`px-4 py-2 rounded-2xl bg-gradient-to-r ${item.isYouTube ? 'from-red-600 to-rose-600' : theme.accentGradient} text-white font-bold text-xs flex items-center gap-1.5 shadow-md hover:brightness-110 active:scale-95 transition-all`}
                          >
                            <Play className="w-3.5 h-3.5 fill-white" />
                            <span>{item.lastPositionMs > 1000 ? 'Resume Playback' : item.isYouTube ? 'Play Stream' : 'Play Now'}</span>
                          </button>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              removeRecentMedia(item.uri);
                            }}
                            className="p-2 rounded-xl hover:bg-rose-500/20 text-white/40 hover:text-rose-300 transition-colors"
                            title="Remove from history"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              /* Welcome Screen when History is Empty */
              <div
                className={`p-10 rounded-3xl backdrop-blur-2xl flex flex-col items-center gap-6 text-center max-w-lg border shadow-2xl mt-12 ${theme.glassBg} ${theme.glassBorder}`}
                style={{
                  boxShadow: `0 20px 50px rgba(0, 0, 0, 0.7), 0 0 35px ${theme.haloGlow}`,
                }}
              >
                <div className="p-4 rounded-3xl bg-white/5 border border-white/15 shadow-2xl">
                  <img
                    src="/logo.png"
                    alt="Miki Player"
                    className="w-20 h-20 rounded-2xl object-contain shadow-md"
                  />
                </div>
                <div>
                  <h1 className="text-3xl font-extrabold tracking-tight text-white">Miki Player</h1>
                  <p className="text-sm text-white/60 mt-2 leading-relaxed">
                    Ultra-modern, cross-platform multimedia player with 3D Spatial Audio, 200% VLC overdrive, Anime4K Super-Resolution, and YouTube stream optimizer.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-3 w-full mt-2">
                  <button
                    onClick={() => {
                      handleOpenLocalFileDialog();
                      const input = document.getElementById('miki-main-file-input') as HTMLInputElement | null;
                      input?.click();
                    }}
                    className={`flex-1 w-full flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl bg-gradient-to-r ${theme.accentGradient} text-white font-bold text-xs cursor-pointer transition-all shadow-xl active:scale-95`}
                    style={{ boxShadow: `0 4px 20px ${theme.haloGlow}` }}
                  >
                    <FolderOpen className="w-4 h-4" />
                    <span>Browse Local Files</span>
                    <input
                      id="miki-main-file-input"
                      type="file"
                      className="hidden"
                      accept="video/*,audio/*,.mkv,.mp4,.avi,.mov,.webm,.m3u8"
                      onChange={handleNativeFileSelect}
                    />
                  </button>

                  <button
                    onClick={() => setIsFileBrowserOpen(true)}
                    className="flex-1 w-full flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 font-bold text-xs text-white/90 hover:text-white transition-all shadow-lg active:scale-95"
                  >
                    <Sparkles className="w-4 h-4 text-cyan-400" />
                    <span>Explore Library</span>
                  </button>
                </div>
              </div>
            )}
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

        {/* Glassmorphic Controls Overlay (for native/local/HLS video) */}
        {currentUri && !youtubeId && !webStream && (
          <ControlsOverlay
            onOpenEq={() => setIsEqOpen(true)}
            onOpenSettings={() => setIsSettingsOpen(true)}
            onOpenFileBrowser={() => setIsFileBrowserOpen(true)}
            containerRef={containerRef}
            isVisible={areControlsVisible}
          />
        )}
      </div>

      {/* Modals wrapped in ErrorBoundary to guarantee uninterrupted UI */}
      <ErrorBoundary onReset={() => setIsFileBrowserOpen(false)}>
        <FileBrowserModal
          isOpen={isFileBrowserOpen}
          onClose={() => setIsFileBrowserOpen(false)}
          initialTab={fileBrowserInitialTab}
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
