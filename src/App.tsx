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

  // Initialize playback engine on mount
  useEffect(() => {
    bootEngine(undefined, videoRef.current ?? undefined);
  }, [bootEngine]);

  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      // Always create a direct, unconstrained blob URL for the video element
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
      {/* Standalone Window Frameless Chrome / Header Drag Region */}
      <div
        className="w-full h-8 z-50 flex items-center justify-between px-3 bg-black/40 backdrop-blur-md border-b border-white/5"
        style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
      >
        {/* macOS Traffic Lights Simulation */}
        <div
          className="flex items-center gap-2"
          style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
        >
          <button
            onClick={() => window.close()}
            className="w-3 h-3 rounded-full bg-rose-500 hover:opacity-80 transition-opacity"
            title="Close"
          />
          <button
            onClick={() => {
              if (document.fullscreenElement) {
                document.exitFullscreen().catch(() => {});
              }
            }}
            className="w-3 h-3 rounded-full bg-amber-500 hover:opacity-80 transition-opacity"
            title="Minimize"
          />
          <button
            onClick={() => {
              if (!document.fullscreenElement) {
                containerRef.current?.requestFullscreen().catch(() => {});
              } else {
                document.exitFullscreen().catch(() => {});
              }
            }}
            className="w-3 h-3 rounded-full bg-emerald-500 hover:opacity-80 transition-opacity"
            title="Maximize"
          />
        </div>

        {/* Window Title & Engine Status */}
        <div className="flex items-center gap-2 text-xs text-white/60">
          <Film className="w-3.5 h-3.5 text-sky-400" />
          <span className="font-semibold text-white/80">AetherPlayer</span>
          <span>•</span>
          <span className="text-[10px] font-mono uppercase tracking-wider text-sky-400/80">
            {activeEngineType === 'tauri-mpv' ? 'Native libmpv' : 'Web Media Engine'}
          </span>
        </div>

        {/* Quick Header Buttons */}
        <div
          className="flex items-center gap-2"
          style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
        >
          {currentUri && (
            <button
              onClick={closeMedia}
              className="flex items-center gap-1 text-[11px] text-white/70 hover:text-white px-2 py-0.5 rounded-lg hover:bg-white/10 transition-colors"
              title="Close Video and Go Back"
            >
              <ArrowLeft className="w-3 h-3 text-sky-400" />
              <span>Back</span>
            </button>
          )}
          <button
            onClick={() => setIsFileBrowserOpen(true)}
            className="text-[11px] text-white/70 hover:text-white px-2 py-0.5 rounded-lg hover:bg-white/10 transition-colors"
          >
            Library
          </button>
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="text-[11px] text-white/70 hover:text-white px-2 py-0.5 rounded-lg hover:bg-white/10 transition-colors"
          >
            <Settings className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Main Player Viewport Area */}
      <div className="relative flex-1 w-full h-full overflow-hidden flex items-center justify-center">
        {/* Ambient Lighting Canvas Layer */}
        <AmbientCanvas videoRef={videoRef} />

        {/* Video Viewport Layer */}
        {activeEngineType === 'web-media' ? (
          <video
            ref={videoRef}
            className="w-full h-full object-contain z-10"
            playsInline
          />
        ) : (
          /* Native Engine mode: Video renders into transparent native child surface behind WebView */
          <div className="w-full h-full pointer-events-none z-10" />
        )}

        {/* Empty State / Welcome Home Screen & Built-in Explorer Trigger */}
        {!currentUri && (
          <div className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-6 p-8 pointer-events-auto bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
            <div className="p-8 rounded-3xl glass-panel flex flex-col items-center gap-5 text-center max-w-lg border border-white/15 shadow-2xl">
              <div className="p-4 rounded-3xl bg-gradient-to-br from-sky-500/20 to-indigo-500/20 border border-sky-400/30 text-sky-400 shadow-xl shadow-sky-500/10">
                <Film className="w-12 h-12" />
              </div>
              <div>
                <h1 className="text-3xl font-extrabold tracking-tight text-white">AetherPlayer</h1>
                <p className="text-sm text-white/60 mt-1.5 leading-relaxed">
                  Ultra-modern, cross-platform multimedia player with 200% VLC overdrive, real-time ambient glow, and 10-band audio DSP.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-3 w-full mt-2">
                {/* Native OS File Chooser */}
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

                {/* Built-in Media Library & Test Streams */}
                <button
                  onClick={() => setIsFileBrowserOpen(true)}
                  className="flex-1 w-full flex items-center justify-center gap-2 px-5 py-3 rounded-2xl glass-pill font-bold text-xs text-white/90 hover:text-white transition-all shadow-lg active:scale-95"
                >
                  <Sparkles className="w-4 h-4 text-sky-400" />
                  Explore Library & Demos
                </button>
              </div>

              {/* Quick History Bar */}
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
        {resumeBannerPositionMs !== null && (
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

        {/* Glassmorphic Controls Overlay */}
        {currentUri && (
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
