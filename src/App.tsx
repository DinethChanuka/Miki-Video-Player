import React, { useEffect, useRef, useState, useCallback } from 'react';
import { usePlayerStore } from './store/playerStore';
import { PLAYER_THEMES } from './types/theme';
import { AmbientCanvas } from './components/ambient/AmbientCanvas';
import { ControlsOverlay } from './components/hud/ControlsOverlay';
import { EqualizerModal } from './components/hud/EqualizerModal';
import { VideoSettingsModal } from './components/hud/VideoSettingsModal';
import { FileBrowserModal } from './components/hud/FileBrowserModal';
import { ErrorToast } from './components/hud/ErrorToast';
import { SplashScreen } from './components/splash/SplashScreen';
import { usePlayerGestures } from './hooks/usePlayerGestures';
import {
  FolderOpen,
  Sparkles,
  Settings,
  ArrowLeft,
  Play,
  Trash2,
  Film,
  Plus,
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

  const theme = PLAYER_THEMES[themeId] || PLAYER_THEMES.cyberpunk;

  const [isEqOpen, setIsEqOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isFileBrowserOpen, setIsFileBrowserOpen] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const [areControlsVisible, setAreControlsVisible] = useState(true);
  const hideControlsTimerRef = useRef<number | null>(null);

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

  const youtubeId = parseYouTubeId(currentUri);

  // Initialize playback engine on mount
  useEffect(() => {
    bootEngine(undefined, videoRef.current ?? undefined);
  }, [bootEngine]);

  // Ensure DOM video element is always attached
  useEffect(() => {
    if (videoRef.current) {
      const engine = usePlayerStore.getState().engine;
      if (engine && 'bindVideoElement' in engine) {
        (engine as { bindVideoElement: (el: HTMLVideoElement) => void }).bindVideoElement(
          videoRef.current
        );
      }
    }
  }, [videoRef]);

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
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [seek, resetControlsTimer]);

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
      className={`relative w-screen h-screen overflow-hidden bg-slate-950 select-none flex flex-col font-sans ${
        areControlsVisible || !currentUri ? 'cursor-default' : 'cursor-none'
      }`}
    >
      {/* Sleek, Clean Frameless Titlebar - Drag & 5s Inactivity Auto-Hide */}
      <div
        onMouseDown={handleStartWindowDrag}
        className={`w-full h-11 z-50 flex items-center justify-between px-4 backdrop-blur-xl border-b select-none transition-all duration-500 ${
          theme.glassBg
        } ${theme.glassBorder} ${
          areControlsVisible || !currentUri
            ? 'opacity-100 translate-y-0'
            : 'opacity-0 -translate-y-full pointer-events-none'
        }`}
        style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
      >
        {/* Left Branding & Return Button */}
        <div
          className="flex items-center gap-3"
          style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
        >
          {currentUri ? (
            <button
              onClick={closeMedia}
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

        {/* Center Engine & Active Theme Indicator */}
        <div className="hidden sm:flex items-center gap-2 text-[10px] font-mono tracking-wider uppercase text-white/70 bg-white/5 px-3 py-1 rounded-full border border-white/10">
          <span
            className="w-2 h-2 rounded-full animate-pulse"
            style={{ backgroundColor: theme.primaryHex }}
          />
          <span>
            {youtubeId
              ? 'YouTube Stream Optimizer'
              : activeEngineType === 'tauri-mpv'
                ? 'Native Hardware GPU'
                : 'Web Media Engine'}
          </span>
          <span className="text-white/30">•</span>
          <span className="text-cyan-400 font-bold">{theme.name}</span>
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
            title="Themes, Shaders & Settings"
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
        {!youtubeId && <AmbientCanvas videoRef={videoRef} />}

        {/* YouTube Video Stream or Standard Video */}
        {youtubeId ? (
          <div className="w-full h-full z-10 bg-black flex items-center justify-center">
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${youtubeId}?autoplay=1&enablejsapi=1&rel=0&modestbranding=1`}
              title="YouTube video player"
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          </div>
        ) : activeEngineType === 'web-media' ? (
          <video
            id="aether-video-viewport"
            ref={videoRef}
            className="w-full h-full object-contain z-10 cursor-pointer"
            playsInline
            preload="auto"
            onClick={() => usePlayerStore.getState().togglePlay()}
            onPlay={() => usePlayerStore.setState({ isPaused: false })}
            onPause={() => usePlayerStore.setState({ isPaused: true })}
            onEnded={() => usePlayerStore.setState({ isPaused: true })}
            onTimeUpdate={(e) => {
              const v = e.currentTarget;
              usePlayerStore.setState({
                positionMs: Math.round(v.currentTime * 1000),
                durationMs: Math.round((v.duration || 0) * 1000),
              });
            }}
          />
        ) : (
          <div className="w-full h-full pointer-events-none z-10" />
        )}

        {/* Home View / Recently Viewed Cards & Welcome Screen */}
        {!currentUri && (
          <div className="absolute inset-0 z-30 flex flex-col items-center justify-center p-6 sm:p-10 pointer-events-auto bg-black/70 backdrop-blur-md animate-in fade-in duration-300 overflow-y-auto">
            {recentMedia.length > 0 ? (
              /* Rich Card Grid for Recently Viewed Videos with Timeline Percentage */
              <div className="w-full max-w-5xl flex flex-col gap-6 py-6">
                {/* Top Action Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-3 rounded-2xl bg-gradient-to-r ${theme.accentGradient} text-white shadow-lg`}
                      style={{ boxShadow: `0 0 15px ${theme.haloGlow}` }}
                    >
                      <Film className="w-6 h-6 fill-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-extrabold text-white tracking-tight">
                        Jump Back In
                      </h2>
                      <p className="text-xs text-white/50">
                        Pick up right where you left off with 1-click instant resume
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
                      <span>Open File</span>
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
                      <span>Library & Streams</span>
                    </button>
                  </div>
                </div>

                {/* Cards Grid with Progress Bars & Percentage */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {recentMedia.map((item) => {
                    const percent = Math.min(100, Math.max(0, item.progressPercent || 0));

                    return (
                      <div
                        key={item.mediaId}
                        className={`group relative rounded-3xl p-5 border transition-all duration-300 flex flex-col justify-between gap-4 bg-white/5 hover:bg-white/10 ${theme.glassBorder} shadow-xl hover:shadow-2xl hover:scale-[1.01]`}
                        style={{
                          boxShadow: `0 10px 30px rgba(0, 0, 0, 0.5)`,
                        }}
                      >
                        {/* Title & Metadata */}
                        <div className="flex flex-col gap-2">
                          <div className="flex items-start justify-between gap-2">
                            <span className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors line-clamp-2 leading-snug">
                              {item.title}
                            </span>
                            <span
                              className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-lg shrink-0 ${
                                percent > 80
                                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30'
                                  : `${theme.badgeClass}`
                              }`}
                            >
                              {percent.toFixed(0)}% watched
                            </span>
                          </div>
                          <span className="text-[11px] font-mono text-white/40 truncate">
                            {item.uri}
                          </span>
                        </div>

                        {/* Interactive Progress Bar */}
                        <div className="flex flex-col gap-1.5">
                          <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden p-0.5 border border-white/5">
                            <div
                              className={`h-full rounded-full bg-gradient-to-r ${theme.timelineTrack} transition-all duration-300`}
                              style={{ width: `${percent}%` }}
                            />
                          </div>

                          <div className="flex items-center justify-between text-[11px] font-mono text-white/50">
                            <span>{formatTime(item.lastPositionMs)}</span>
                            <span>{formatTime(item.durationMs)}</span>
                          </div>
                        </div>

                        {/* Card Actions: Resume & Remove */}
                        <div className="flex items-center justify-between pt-2 border-t border-white/10">
                          <button
                            onClick={() => openMedia(item.uri, item.title, true)}
                            className={`px-4 py-2 rounded-2xl bg-gradient-to-r ${theme.accentGradient} text-white font-bold text-xs flex items-center gap-1.5 shadow-md hover:brightness-110 active:scale-95 transition-all`}
                          >
                            <Play className="w-3.5 h-3.5 fill-white" />
                            <span>Resume Playback</span>
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
                className={`p-10 rounded-3xl backdrop-blur-2xl flex flex-col items-center gap-6 text-center max-w-lg border shadow-2xl ${theme.glassBg} ${theme.glassBorder}`}
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
                    Ultra-modern, cross-platform multimedia player with 200% VLC overdrive, real-time ambient glow, and YouTube stream optimizer.
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

        {/* Glassmorphic Controls Overlay (for native/local/HLS video) */}
        {currentUri && !youtubeId && (
          <ControlsOverlay
            onOpenEq={() => setIsEqOpen(true)}
            onOpenSettings={() => setIsSettingsOpen(true)}
            onOpenFileBrowser={() => setIsFileBrowserOpen(true)}
            containerRef={containerRef}
            isVisible={areControlsVisible}
          />
        )}
      </div>

      {/* Modals */}
      <EqualizerModal isOpen={isEqOpen} onClose={() => setIsEqOpen(false)} />
      <VideoSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onOpenEq={() => setIsEqOpen(true)}
      />
      <FileBrowserModal isOpen={isFileBrowserOpen} onClose={() => setIsFileBrowserOpen(false)} />
      <ErrorToast />

      {/* Cinematic Startup Video Splash Loader */}
      {showSplash && <SplashScreen onComplete={() => setShowSplash(false)} />}
    </div>
  );
};
