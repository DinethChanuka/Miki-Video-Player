import React, { useState } from 'react';
import { usePlayerStore } from '../../store/playerStore';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Volume1,
  Maximize2,
  ChevronDown,
  X,
  Music,
  Radio,
} from 'lucide-react';

export interface PersistentMusicControlHubProps {
  onOpenStudio?: () => void;
}

export const PersistentMusicControlHub: React.FC<PersistentMusicControlHubProps> = ({
  onOpenStudio,
}) => {
  const currentUri = usePlayerStore((s) => s.currentUri);
  const currentTitle = usePlayerStore((s) => s.currentTitle);
  const currentArtwork = usePlayerStore((s) => s.currentArtwork);
  const isPaused = usePlayerStore((s) => s.isPaused);
  const positionMs = usePlayerStore((s) => s.positionMs);
  const durationMs = usePlayerStore((s) => s.durationMs);
  const volume = usePlayerStore((s) => s.volume);
  const isMuted = usePlayerStore((s) => s.isMuted);
  const togglePlay = usePlayerStore((s) => s.togglePlay);
  const playNextMedia = usePlayerStore((s) => s.playNextMedia);
  const playPreviousMedia = usePlayerStore((s) => s.playPreviousMedia);
  const setVolume = usePlayerStore((s) => s.setVolume);
  const toggleMute = usePlayerStore((s) => s.toggleMute);
  const seek = usePlayerStore((s) => s.seek);
  const closeMedia = usePlayerStore((s) => s.closeMedia);
  const activePlaybackMode = usePlayerStore((s) => s.activePlaybackMode);

  const [isMinimized, setIsMinimized] = useState(false);

  if (!currentUri || (activePlaybackMode !== 'music' && activePlaybackMode !== 'radio')) {
    return null;
  }

  const formatTime = (ms: number) => {
    if (!ms || isNaN(ms)) return '0:00';
    const s = Math.floor(ms / 1000);
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec < 10 ? '0' : ''}${sec}`;
  };

  const progressPercent =
    durationMs > 0 ? Math.min(100, Math.max(0, (positionMs / durationMs) * 100)) : 0;

  // Minimized Compact Floating Chip
  if (isMinimized) {
    return (
      <div className="fixed bottom-4 right-4 z-40 animate-in fade-in slide-in-from-bottom-2 duration-200">
        <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-2xl bg-slate-950/90 backdrop-blur-2xl border border-white/15 shadow-2xl text-white">
          <div className="w-7 h-7 rounded-lg overflow-hidden bg-black/60 shrink-0 border border-white/10 relative">
            {currentArtwork ? (
              <img
                src={currentArtwork}
                alt={currentTitle}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).style.display = 'none';
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-cyan-500/20 text-cyan-300">
                <Music className="w-3.5 h-3.5" />
              </div>
            )}
          </div>

          <div className="flex flex-col min-w-0 max-w-[130px] sm:max-w-[180px]">
            <span className="text-xs font-bold text-white truncate leading-tight">
              {currentTitle || 'Audio Track'}
            </span>
            <span className="text-[10px] text-cyan-400 font-mono">
              {formatTime(positionMs)} {durationMs > 0 ? `/ ${formatTime(durationMs)}` : ''}
            </span>
          </div>

          <div className="flex items-center gap-1 shrink-0 ml-1">
            <button
              onClick={togglePlay}
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer"
              title={isPaused ? 'Play' : 'Pause'}
            >
              {isPaused ? <Play className="w-3.5 h-3.5 fill-current ml-0.5" /> : <Pause className="w-3.5 h-3.5 fill-current" />}
            </button>

            <button
              onClick={() => setIsMinimized(false)}
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition-all cursor-pointer"
              title="Expand Music Control Hub"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Full System-Wide Persistent Music Control Hub
  return (
    <aside
      aria-label="Persistent Music Control Hub"
      className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 w-[95%] max-w-3xl animate-in slide-in-from-bottom duration-300 select-none"
    >
      <div className="relative px-4 py-3 sm:px-6 sm:py-3.5 rounded-2xl sm:rounded-full bg-slate-950/90 backdrop-blur-2xl border border-white/15 shadow-[0_15px_35px_rgba(0,0,0,0.7)] flex flex-col sm:flex-row items-center justify-between gap-3 text-white">
        
        {/* Left: Artwork & Track Metadata */}
        <div className="flex items-center gap-3 w-full sm:w-auto min-w-0">
          <div
            onClick={onOpenStudio}
            className="w-11 h-11 rounded-xl overflow-hidden bg-black/60 shrink-0 border border-white/15 relative shadow-md cursor-pointer group"
            title="Open Full-Window Music Studio"
          >
            {currentArtwork ? (
              <img
                src={currentArtwork}
                alt={currentTitle}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src =
                    'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&auto=format&fit=crop&q=80';
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-tr from-cyan-600/30 to-purple-600/30 text-cyan-300">
                {activePlaybackMode === 'radio' ? <Radio className="w-5 h-5" /> : <Music className="w-5 h-5" />}
              </div>
            )}
            {!isPaused && (
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center gap-0.5 pointer-events-none">
                <span className="w-1 h-3 bg-cyan-400 rounded-full animate-pulse" />
                <span className="w-1 h-4 bg-purple-400 rounded-full animate-pulse delay-75" />
                <span className="w-1 h-2 bg-emerald-400 rounded-full animate-pulse delay-150" />
              </div>
            )}
          </div>

          <div className="flex flex-col min-w-0 flex-1 sm:max-w-[180px] md:max-w-[220px]">
            <h4
              onClick={onOpenStudio}
              className="text-xs font-bold text-white truncate cursor-pointer hover:text-cyan-300 transition-colors"
              title={currentTitle}
            >
              {currentTitle || 'Audio Track'}
            </h4>
            <div className="flex items-center gap-1.5 text-[10px] text-white/60">
              <span className="px-1.5 py-0.2 rounded bg-white/10 font-mono text-[9px] text-cyan-300 uppercase">
                {activePlaybackMode}
              </span>
              <span className="truncate">Active In-App Playback</span>
            </div>
          </div>
        </div>

        {/* Center: Playback Controls & Progress Scrubber */}
        <div className="flex flex-col items-center gap-1 w-full sm:flex-1 sm:max-w-xs">
          <div className="flex items-center gap-2.5">
            <button
              onClick={playPreviousMedia}
              className="p-1.5 rounded-full hover:bg-white/10 text-white/70 hover:text-white transition-all cursor-pointer active:scale-95"
              title="Previous Track (Shift+P)"
            >
              <SkipBack className="w-4 h-4 fill-current" />
            </button>

            <button
              onClick={togglePlay}
              className="p-2 rounded-full bg-white text-slate-950 hover:bg-cyan-200 transition-all cursor-pointer shadow-lg hover:scale-105 active:scale-95"
              title={isPaused ? 'Play (Space)' : 'Pause (Space)'}
            >
              {isPaused ? (
                <Play className="w-4 h-4 fill-current ml-0.5" />
              ) : (
                <Pause className="w-4 h-4 fill-current" />
              )}
            </button>

            <button
              onClick={playNextMedia}
              className="p-1.5 rounded-full hover:bg-white/10 text-white/70 hover:text-white transition-all cursor-pointer active:scale-95"
              title="Next Track (Shift+N)"
            >
              <SkipForward className="w-4 h-4 fill-current" />
            </button>
          </div>

          {/* Timeline Scrubber */}
          <div className="w-full flex items-center gap-2 text-[10px] font-mono text-white/50">
            <span className="w-8 text-right text-white/70">{formatTime(positionMs)}</span>
            <div
              onClick={(e) => {
                if (durationMs <= 0) return;
                const rect = e.currentTarget.getBoundingClientRect();
                const clickX = e.clientX - rect.left;
                const pct = Math.max(0, Math.min(1, clickX / rect.width));
                seek(pct * durationMs);
              }}
              className="flex-1 h-1.5 bg-white/15 rounded-full overflow-hidden relative cursor-pointer group"
            >
              <div
                className="h-full bg-gradient-to-r from-cyan-400 via-purple-400 to-rose-400 rounded-full transition-all duration-100"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <span className="w-8 text-left text-white/70">
              {durationMs > 0 ? formatTime(durationMs) : 'Live'}
            </span>
          </div>
        </div>

        {/* Right: Volume, Expand to Studio & Minimize / Close */}
        <div className="flex items-center justify-end gap-2 w-full sm:w-auto shrink-0">
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-xl bg-white/5 border border-white/10">
            <button
              onClick={toggleMute}
              className="text-white/70 hover:text-white transition-colors cursor-pointer"
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="w-3.5 h-3.5 text-rose-400" />
              ) : volume < 0.5 ? (
                <Volume1 className="w-3.5 h-3.5" />
              ) : (
                <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
              )}
            </button>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={isMuted ? 0 : volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="w-14 sm:w-16 h-1 accent-cyan-400 bg-white/20 rounded-full cursor-pointer"
              title={`Volume: ${Math.round(volume * 100)}%`}
            />
          </div>

          {onOpenStudio && (
            <button
              onClick={onOpenStudio}
              className="p-2 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-400/30 text-cyan-300 hover:text-white transition-all cursor-pointer shadow-sm active:scale-95"
              title="Open Full-Window Music Studio"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            onClick={() => setIsMinimized(true)}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 text-white/60 hover:text-white transition-all cursor-pointer"
            title="Minimize to Floating Chip"
          >
            <ChevronDown className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={closeMedia}
            className="p-2 rounded-xl bg-white/5 hover:bg-rose-500/20 border border-white/10 text-white/60 hover:text-rose-300 transition-all cursor-pointer"
            title="Stop Playback"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </aside>
  );
};
