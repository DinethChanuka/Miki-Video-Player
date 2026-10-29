import React, { useEffect, useRef, useState } from 'react';
import { usePlayerStore } from './store/playerStore';
import { AmbientCanvas } from './components/ambient/AmbientCanvas';
import { ControlsOverlay } from './components/hud/ControlsOverlay';
import { EqualizerModal } from './components/hud/EqualizerModal';
import { ErrorToast } from './components/hud/ErrorToast';
import { usePlayerGestures } from './hooks/usePlayerGestures';
import { FolderOpen, Film, Clock, Play } from 'lucide-react';

export const App: React.FC = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const activeEngineType = usePlayerStore((s) => s.activeEngineType);
  const currentUri = usePlayerStore((s) => s.currentUri);
  const bootEngine = usePlayerStore((s) => s.bootEngine);
  const openMedia = usePlayerStore((s) => s.openMedia);
  const recentMedia = usePlayerStore((s) => s.recentMedia);
  const resumeBannerPositionMs = usePlayerStore((s) => s.resumeBannerPositionMs);
  const seek = usePlayerStore((s) => s.seek);

  const [isEqOpen, setIsEqOpen] = useState(false);
  const [showRecentModal, setShowRecentModal] = useState(false);

  const { handleTouchStart, handleTouchEnd } = usePlayerGestures(containerRef);

  // Initialize playback engine on mount
  useEffect(() => {
    bootEngine(undefined, videoRef.current ?? undefined);
  }, [bootEngine]);

  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      // In web fallback, create object URL; in Tauri, full path is passed
      const uri = (file as unknown as { path?: string }).path || URL.createObjectURL(file);
      openMedia(uri, file.name);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
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
      className="relative w-screen h-screen overflow-hidden bg-transparent select-none flex items-center justify-center font-sans"
    >
      {/* Ambient Lighting Canvas Layer */}
      <AmbientCanvas videoRef={videoRef} />

      {/* Video Viewport Layer */}
      {activeEngineType === 'web-media' ? (
        <video
          ref={videoRef}
          className="w-full h-full object-contain z-10 bg-black/40"
          playsInline
        />
      ) : (
        /* Native Engine mode: Video renders into transparent native child surface behind WebView */
        <div className="w-full h-full pointer-events-none z-10" />
      )}

      {/* Empty State / Welcome Dropzone */}
      {!currentUri && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-6 p-8 pointer-events-auto bg-black/60 backdrop-blur-md">
          <div className="p-8 rounded-3xl glass-panel flex flex-col items-center gap-4 text-center max-w-md border border-white/10 shadow-2xl">
            <div className="p-4 rounded-2xl bg-sky-500/10 border border-sky-400/20 text-sky-400">
              <Film className="w-10 h-10" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white">AetherPlayer</h1>
              <p className="text-sm text-white/60 mt-1">
                Drag and drop any media file here, or select from history.
              </p>
            </div>

            <div className="flex items-center gap-3 w-full mt-2">
              <label className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-semibold text-sm cursor-pointer transition-all shadow-lg shadow-sky-500/20">
                <FolderOpen className="w-4 h-4" />
                Open File
                <input
                  type="file"
                  className="hidden"
                  accept="video/*,audio/*,.mkv,.mp4,.avi,.mov,.webm"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const uri = (file as unknown as { path?: string }).path || URL.createObjectURL(file);
                      openMedia(uri, file.name);
                    }
                  }}
                />
              </label>

              {recentMedia.length > 0 && (
                <button
                  onClick={() => setShowRecentModal(true)}
                  className="glass-pill px-4 py-2.5 rounded-xl text-sm font-medium text-white/80 hover:text-white transition-colors"
                >
                  Recent ({recentMedia.length})
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Auto-Resume Notification Banner */}
      {resumeBannerPositionMs !== null && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-top duration-300">
          <div className="glass-panel px-5 py-2.5 rounded-2xl border border-sky-400/30 shadow-2xl flex items-center gap-3">
            <span className="text-sm text-white/90">
              Resume playback at <strong className="text-sky-300">{formatTime(resumeBannerPositionMs)}</strong>?
            </span>
            <button
              onClick={() => {
                seek(resumeBannerPositionMs, true);
                usePlayerStore.setState({ resumeBannerPositionMs: null });
              }}
              className="px-3 py-1 rounded-lg bg-sky-500 text-slate-950 font-semibold text-xs hover:bg-sky-400 transition-colors"
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
      {currentUri && <ControlsOverlay onOpenEq={() => setIsEqOpen(true)} containerRef={containerRef} />}

      {/* 10-Band Parametric Equalizer Modal */}
      <EqualizerModal isOpen={isEqOpen} onClose={() => setIsEqOpen(false)} />

      {/* Error & Recovery Toast Notification */}
      <ErrorToast />

      {/* Recent Media History Drawer */}
      {showRecentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="glass-panel w-full max-w-xl p-6 rounded-2xl flex flex-col gap-4 border border-white/20 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Clock className="w-5 h-5 text-sky-400" />
                Recent Media
              </h2>
              <button
                onClick={() => setShowRecentModal(false)}
                className="text-white/60 hover:text-white text-sm"
              >
                Close
              </button>
            </div>

            <div className="flex flex-col gap-2 max-h-80 overflow-y-auto pr-1">
              {recentMedia.map((item) => (
                <div
                  key={item.mediaId}
                  onClick={() => {
                    openMedia(item.uri, item.title);
                    setShowRecentModal(false);
                  }}
                  className="flex items-center justify-between p-3 rounded-xl glass-pill cursor-pointer transition-all"
                >
                  <div className="flex flex-col gap-0.5 truncate pr-4">
                    <span className="text-sm font-medium text-white truncate">{item.title}</span>
                    <span className="text-xs text-white/50">
                      Progress: {item.progressPercent.toFixed(0)}% • {formatTime(item.lastPositionMs)}
                    </span>
                  </div>
                  <Play className="w-4 h-4 text-sky-400 shrink-0" />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
