import React, { useEffect, useRef, useState, useCallback } from 'react';
import { usePlayerStore } from './store/playerStore';
import { AmbientCanvas } from './components/ambient/AmbientCanvas';
import { ControlsOverlay } from './components/hud/ControlsOverlay';
import { EqualizerModal } from './components/hud/EqualizerModal';
import { VideoSettingsModal } from './components/hud/VideoSettingsModal';
import { FileBrowserModal } from './components/hud/FileBrowserModal';
import { ErrorToast } from './components/hud/ErrorToast';
import { SplashScreen } from './components/splash/SplashScreen';
import { usePlayerGestures } from './hooks/usePlayerGestures';
import { FolderOpen, Clock, Sparkles, Settings, ArrowLeft } from 'lucide-react';

export function parseYouTubeId(url: string | null): string | null {
  if (!url) return null;
  const match = url.match(
    /(?:youtube\.com\/(?:watch\?.*v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  );
  return match ? match[1] : null;
}

const handleWindowMinimize = () => {
  if (typeof window !== 'undefined' && (window as unknown as { webkit?: { messageHandlers?: { windowAction?: { postMessage: (a: string) => void } } } }).webkit?.messageHandlers?.windowAction) {
    (window as unknown as { webkit: { messageHandlers: { windowAction: { postMessage: (a: string) => void } } } }).webkit.messageHandlers.windowAction.postMessage('minimize');
  } else if (typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window) {
    import('@tauri-apps/api/window').then(({ getCurrentWindow }) => getCurrentWindow().minimize()).catch(() => {});
  }
};

const handleWindowMaximize = () => {
  if (typeof window !== 'undefined' && (window as unknown as { webkit?: { messageHandlers?: { windowAction?: { postMessage: (a: string) => void } } } }).webkit?.messageHandlers?.windowAction) {
    (window as unknown as { webkit: { messageHandlers: { windowAction: { postMessage: (a: string) => void } } } }).webkit.messageHandlers.windowAction.postMessage('maximize');
  } else if (typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window) {
    import('@tauri-apps/api/window').then(({ getCurrentWindow }) => getCurrentWindow().toggleMaximize()).catch(() => {});
  }
};

const handleWindowClose = () => {
  if (typeof window !== 'undefined' && (window as unknown as { webkit?: { messageHandlers?: { windowAction?: { postMessage: (a: string) => void } } } }).webkit?.messageHandlers?.windowAction) {
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
  const resumeBannerPositionMs = usePlayerStore((s) => s.resumeBannerPositionMs);
  const seek = usePlayerStore((s) => s.seek);

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
    // Only auto-hide after 5 seconds of inactivity when media is actively loaded
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

  // Ensure DOM element is always attached
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
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
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
        className={`w-full h-10 z-50 flex items-center justify-between px-4 bg-black/70 backdrop-blur-md border-b border-white/10 select-none transition-all duration-500 ${
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
              className="flex items-center gap-1.5 glass-pill px-3 py-1 rounded-xl text-xs font-semibold text-white/90 hover:text-white transition-all active:scale-95 shadow-sm"
              title="Return to Library / Home"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-sky-400" />
              <span>Back</span>
            </button>
          ) : (
            <div className="flex items-center gap-2.5 text-xs font-bold text-white tracking-wide">
              <img
                src="/logo.png"
                alt="Miki Player"
                className="w-5 h-5 rounded-md object-contain bg-white/10 p-0.5"
              />
              <span className="bg-gradient-to-r from-sky-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent font-extrabold text-sm tracking-tight">
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

        {/* Center Engine Indicator */}
        <div className="hidden sm:flex items-center gap-2 text-[10px] font-mono tracking-wider uppercase text-sky-400/80 bg-white/5 px-3 py-1 rounded-full border border-white/10">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>
            {youtubeId
              ? 'YouTube Stream Optimizer'
              : activeEngineType === 'tauri-mpv'
                ? 'Native Hardware GPU'
                : 'Web Media Engine'}
          </span>
        </div>

        {/* Right Navigation & Window Controls */}
        <div
          className="flex items-center gap-2"
          style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
        >
          <button
            onClick={() => setIsFileBrowserOpen(true)}
            className="text-xs text-white/80 hover:text-white glass-pill px-3 py-1 rounded-xl transition-colors font-medium flex items-center gap-1.5"
          >
            <FolderOpen className="w-3.5 h-3.5 text-sky-400" />
            <span>Library</span>
          </button>
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="text-xs text-white/80 hover:text-white glass-pill p-1.5 rounded-xl transition-colors"
            title="Video & Shaders Settings"
          >
            <Settings className="w-3.5 h-3.5 text-indigo-300" />
          </button>

          {/* Custom Window Controls (Pure Undecorated Frame) */}
          <div className="flex items-center gap-1 ml-1 pl-2 border-l border-white/10">
            <button
              onClick={handleWindowMinimize}
              className="w-6 h-6 rounded-lg hover:bg-white/10 text-white/70 hover:text-white flex items-center justify-center transition-colors text-xs font-bold"
              title="Minimize"
            >
              ─
            </button>
            <button
              onClick={handleWindowMaximize}
              className="w-6 h-6 rounded-lg hover:bg-white/10 text-white/70 hover:text-white flex items-center justify-center transition-colors text-xs"
              title="Maximize"
            >
              □
            </button>
            <button
              onClick={handleWindowClose}
              className="w-6 h-6 rounded-lg hover:bg-rose-500/40 text-white/70 hover:text-rose-200 flex items-center justify-center transition-colors text-xs"
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

        {/* Empty State / Welcome Screen */}
        {!currentUri && (
          <div className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-6 p-8 pointer-events-auto bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
            <div className="p-8 rounded-3xl glass-panel flex flex-col items-center gap-5 text-center max-w-lg border border-white/15 shadow-2xl">
              <div className="p-3 rounded-3xl bg-white/5 border border-white/15 shadow-2xl shadow-sky-500/10">
                <img
                  src="/logo.png"
                  alt="Miki Player"
                  className="w-20 h-20 rounded-2xl object-contain shadow-md"
                />
              </div>
              <div>
                <h1 className="text-3xl font-extrabold tracking-tight text-white">Miki Player</h1>
                <p className="text-sm text-white/60 mt-1.5 leading-relaxed">
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
                  className="flex-1 w-full flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs cursor-pointer transition-all shadow-xl shadow-sky-500/25 active:scale-95"
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
                  className="flex-1 w-full flex items-center justify-center gap-2 px-5 py-3 rounded-2xl glass-pill font-bold text-xs text-white/90 hover:text-white transition-all shadow-lg active:scale-95"
                >
                  <Sparkles className="w-4 h-4 text-sky-400" />
                  Explore Library & Demos
                </button>
              </div>

              {recentMedia.length > 0 && (
                <div className="w-full pt-4 border-t border-white/10 flex items-center justify-between text-xs text-white/60">
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-sky-400" />
                    Recent Media:
                  </span>
                  <button
                    onClick={() => setIsFileBrowserOpen(true)}
                    className="text-sky-400 hover:underline font-semibold"
                  >
                    View All ({recentMedia.length})
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Auto-Resume Notification Banner */}
        {resumeBannerPositionMs !== null && !youtubeId && (
          <div className="absolute top-12 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-top duration-300">
            <div className="glass-panel px-5 py-2.5 rounded-2xl border border-sky-400/30 shadow-2xl flex items-center gap-3">
              <span className="text-sm text-white/90">
                Resume <strong className="text-white">{currentTitle}</strong> at{' '}
                <strong className="text-sky-300 font-mono">{formatTime(resumeBannerPositionMs)}</strong>?
              </span>
              <button
                onClick={() => {
                  seek(resumeBannerPositionMs, true);
                  usePlayerStore.setState({ resumeBannerPositionMs: null });
                }}
                className="px-3.5 py-1 rounded-xl bg-sky-500 text-slate-950 font-bold text-xs hover:bg-sky-400 transition-colors shadow-md shadow-sky-500/20"
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
