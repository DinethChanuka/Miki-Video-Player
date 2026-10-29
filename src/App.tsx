import React, { useEffect, useRef, useState } from 'react';
import { usePlayerStore } from './store/playerStore';
import { AmbientCanvas } from './components/ambient/AmbientCanvas';
import { ControlsOverlay } from './components/hud/ControlsOverlay';
import { EqualizerModal } from './components/hud/EqualizerModal';
import { VideoSettingsModal } from './components/hud/VideoSettingsModal';
import { FileBrowserModal } from './components/hud/FileBrowserModal';
import { ErrorToast } from './components/hud/ErrorToast';
import { usePlayerGestures } from './hooks/usePlayerGestures';
import { FolderOpen, Film, Clock, Sparkles, Settings, ArrowLeft } from 'lucide-react';

export function parseYouTubeId(url: string | null): string | null {
  if (!url) return null;
  const match = url.match(
    /(?:youtube\.com\/(?:watch\?.*v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  );
  return match ? match[1] : null;
}

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
      onDrop={handleFileDrop}
      onDragOver={handleDragOver}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className="relative w-screen h-screen overflow-hidden bg-slate-950 select-none flex flex-col font-sans"
    >
      {/* Sleek, Clean Frameless Titlebar - No duplicate traffic lights */}
      <div
        className="w-full h-9 z-50 flex items-center justify-between px-4 bg-black/60 backdrop-blur-md border-b border-white/5 select-none"
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
            <div className="flex items-center gap-2 text-xs font-bold text-white tracking-wide">
              <Film className="w-4 h-4 text-sky-400" />
              <span>AetherPlayer</span>
            </div>
          )}

          {currentUri && (
            <span className="text-xs text-white/70 font-medium truncate max-w-sm">
              {currentTitle}
            </span>
          )}
        </div>

        {/* Center Engine Indicator */}
        <div className="hidden sm:flex items-center gap-2 text-[10px] font-mono tracking-wider uppercase text-sky-400/70 bg-white/5 px-2.5 py-0.5 rounded-full border border-white/5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>
            {youtubeId
              ? 'YouTube Stream Optimizer'
              : activeEngineType === 'tauri-mpv'
                ? 'Native Hardware GPU'
                : 'Web Media Engine'}
          </span>
        </div>

        {/* Right Navigation & Tools */}
        <div
          className="flex items-center gap-2"
          style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
        >
          <button
            onClick={() => setIsFileBrowserOpen(true)}
            className="text-xs text-white/70 hover:text-white glass-pill px-3 py-1 rounded-xl transition-colors font-medium flex items-center gap-1.5"
          >
            <FolderOpen className="w-3.5 h-3.5 text-sky-400" />
            <span>Library</span>
          </button>
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="text-xs text-white/70 hover:text-white glass-pill p-1.5 rounded-xl transition-colors"
            title="Video & Shaders Settings"
          >
            <Settings className="w-3.5 h-3.5 text-indigo-300" />
          </button>
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
            className="w-full h-full object-contain z-10"
            playsInline
            preload="auto"
          />
        ) : (
          <div className="w-full h-full pointer-events-none z-10" />
        )}

        {/* Empty State / Welcome Screen */}
        {!currentUri && (
          <div className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-6 p-8 pointer-events-auto bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
            <div className="p-8 rounded-3xl glass-panel flex flex-col items-center gap-5 text-center max-w-lg border border-white/15 shadow-2xl">
              <div className="p-4 rounded-3xl bg-gradient-to-br from-sky-500/20 to-indigo-500/20 border border-sky-400/30 text-sky-400 shadow-xl shadow-sky-500/10">
                <Film className="w-12 h-12" />
              </div>
              <div>
                <h1 className="text-3xl font-extrabold tracking-tight text-white">AetherPlayer</h1>
                <p className="text-sm text-white/60 mt-1.5 leading-relaxed">
                  Ultra-modern, cross-platform multimedia player with 200% VLC overdrive, real-time ambient glow, and YouTube stream optimizer.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-3 w-full mt-2">
                <label className="flex-1 w-full flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs cursor-pointer transition-all shadow-xl shadow-sky-500/25 active:scale-95">
                  <FolderOpen className="w-4 h-4" />
                  Browse Local Files
                  <input
                    type="file"
                    className="hidden"
                    accept="video/*,audio/*,.mkv,.mp4,.avi,.mov,.webm,.m3u8"
                    onChange={handleNativeFileSelect}
                  />
                </label>

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
    </div>
  );
};
