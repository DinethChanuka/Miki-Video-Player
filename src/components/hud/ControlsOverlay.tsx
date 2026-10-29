import React, { useState, useEffect, useRef } from 'react';
import { usePlayerStore } from '../../store/playerStore';
import { TimelineScrubber } from './TimelineScrubber';
import {
  Play,
  Pause,
  RotateCcw,
  RotateCw,
  Volume2,
  VolumeX,
  Sliders,
  Bookmark,
  Subtitles,
  Maximize,
  Minimize,
  FastForward,
} from 'lucide-react';

interface ControlsOverlayProps {
  onOpenEq: () => void;
  containerRef: React.RefObject<HTMLDivElement | null>;
}

export const ControlsOverlay: React.FC<ControlsOverlayProps> = ({ onOpenEq, containerRef }) => {
  const isPaused = usePlayerStore((s) => s.isPaused);
  const togglePlay = usePlayerStore((s) => s.togglePlay);
  const volume = usePlayerStore((s) => s.volume);
  const setVolume = usePlayerStore((s) => s.setVolume);
  const isMuted = usePlayerStore((s) => s.isMuted);
  const playbackRate = usePlayerStore((s) => s.playbackRate);
  const setPlaybackRate = usePlayerStore((s) => s.setPlaybackRate);
  const positionMs = usePlayerStore((s) => s.positionMs);
  const durationMs = usePlayerStore((s) => s.durationMs);
  const seek = usePlayerStore((s) => s.seek);
  const addBookmark = usePlayerStore((s) => s.addBookmark);
  const currentTitle = usePlayerStore((s) => s.currentTitle);
  const audioTracks = usePlayerStore((s) => s.audioTracks);
  const subtitleTracks = usePlayerStore((s) => s.subtitleTracks);

  const [isVisible, setIsVisible] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [showTrackMenu, setShowTrackMenu] = useState(false);
  const hideTimerRef = useRef<number | null>(null);

  // Auto-hide controls after 3 seconds of inactivity during active playback
  const resetHideTimer = () => {
    setIsVisible(true);
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    if (!isPaused) {
      hideTimerRef.current = window.setTimeout(() => {
        setIsVisible(false);
      }, 3000);
    }
  };

  useEffect(() => {
    resetHideTimer();
    return () => {
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    };
  }, [isPaused]);

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
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
      onMouseMove={resetHideTimer}
      className={`absolute inset-0 z-40 flex flex-col justify-between p-6 transition-opacity duration-300 pointer-events-none select-none ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      {/* Top Header Bar */}
      <div className="flex items-center justify-between pointer-events-auto">
        <div className="flex items-center gap-3 glass-panel px-4 py-2 rounded-2xl">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <h1 className="text-sm font-semibold text-white/90 truncate max-w-md">
            {currentTitle || 'AetherPlayer'}
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => addBookmark(`Bookmark at ${formatTime(positionMs)}`)}
            className="glass-pill p-2.5 rounded-xl text-white/80 hover:text-white transition-colors"
            title="Add Bookmark"
          >
            <Bookmark className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Center Big Play Trigger Area */}
      <div
        className="flex-1 flex items-center justify-center cursor-pointer pointer-events-auto"
        onClick={togglePlay}
      >
        {isPaused && (
          <div className="p-6 rounded-full glass-panel shadow-2xl scale-100 hover:scale-110 transition-transform duration-200 border border-white/20">
            <Play className="w-12 h-12 text-white fill-white translate-x-1" />
          </div>
        )}
      </div>

      {/* Bottom Floating Glass HUD */}
      <div className="glass-panel p-4 rounded-3xl flex flex-col gap-3 pointer-events-auto shadow-2xl border border-white/15">
        {/* Magnetic Timeline */}
        <TimelineScrubber />

        {/* Action Controls */}
        <div className="flex items-center justify-between pt-1">
          {/* Left Controls: Play/Pause, Seek, Volume, Timestamps */}
          <div className="flex items-center gap-4">
            <button
              onClick={togglePlay}
              className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              {isPaused ? <Play className="w-5 h-5 fill-white" /> : <Pause className="w-5 h-5 fill-white" />}
            </button>

            <button
              onClick={() => seek(Math.max(0, positionMs - 10_000))}
              className="p-2 text-white/70 hover:text-white transition-colors"
              title="Rewind 10s"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <button
              onClick={() => seek(positionMs + 10_000)}
              className="p-2 text-white/70 hover:text-white transition-colors"
              title="Forward 10s"
            >
              <RotateCw className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2 group">
              <button
                onClick={() => setVolume(volume === 0 ? 100 : 0)}
                className="p-2 text-white/70 hover:text-white transition-colors"
              >
                {volume === 0 || isMuted ? (
                  <VolumeX className="w-4 h-4 text-rose-400" />
                ) : (
                  <Volume2 className="w-4 h-4" />
                )}
              </button>
              <input
                type="range"
                min={0}
                max={100}
                value={volume}
                onChange={(e) => setVolume(parseInt(e.target.value, 10))}
                className="w-20 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-sky-400"
              />
            </div>

            <div className="font-mono text-xs text-white/60">
              <span className="text-white/90">{formatTime(positionMs)}</span> / {formatTime(durationMs)}
            </div>
          </div>

          {/* Right Controls: Speed, EQ, Tracks, Fullscreen */}
          <div className="flex items-center gap-2">
            {/* Speed Selector */}
            <div className="relative">
              <button
                onClick={() => setShowSpeedMenu(!showSpeedMenu)}
                className="glass-pill px-3 py-1.5 rounded-xl text-xs font-mono font-medium text-white/80 hover:text-white flex items-center gap-1.5"
              >
                <FastForward className="w-3.5 h-3.5" />
                {playbackRate}x
              </button>
              {showSpeedMenu && (
                <div className="absolute bottom-10 right-0 glass-panel p-2 rounded-xl flex flex-col gap-1 min-w-24 z-50">
                  {[0.5, 0.75, 1.0, 1.25, 1.5, 2.0].map((r) => (
                    <button
                      key={r}
                      onClick={() => {
                        setPlaybackRate(r);
                        setShowSpeedMenu(false);
                      }}
                      className={`px-3 py-1 rounded-lg text-xs font-mono text-left transition-colors ${
                        playbackRate === r ? 'bg-sky-500/30 text-sky-300 font-bold' : 'hover:bg-white/10 text-white/80'
                      }`}
                    >
                      {r}x
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Audio & Subtitle Tracks Popover */}
            <div className="relative">
              <button
                onClick={() => setShowTrackMenu(!showTrackMenu)}
                className="glass-pill p-2 rounded-xl text-white/80 hover:text-white transition-colors"
                title="Tracks & Subtitles"
              >
                <Subtitles className="w-4 h-4" />
              </button>
              {showTrackMenu && (
                <div className="absolute bottom-10 right-0 glass-panel p-3 rounded-2xl flex flex-col gap-2 min-w-48 z-50">
                  <span className="text-[11px] font-semibold text-white/50 uppercase tracking-wider">
                    Audio & Subtitles
                  </span>
                  {audioTracks.length > 0 && (
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] text-sky-400 font-semibold uppercase">Audio</span>
                      {audioTracks.map((t) => (
                        <span key={t.id} className="text-xs text-white/80">
                          {t.label}
                        </span>
                      ))}
                    </div>
                  )}
                  {subtitleTracks.length > 0 && (
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] text-sky-400 font-semibold uppercase">Subtitles</span>
                      {subtitleTracks.map((t) => (
                        <span key={t.id} className="text-xs text-white/80">
                          {t.label}
                        </span>
                      ))}
                    </div>
                  )}
                  {audioTracks.length === 0 && subtitleTracks.length === 0 && (
                    <span className="text-xs text-white/40 italic">Embedded tracks auto-syncing</span>
                  )}
                </div>
              )}
            </div>

            {/* Parametric Equalizer Button */}
            <button
              onClick={onOpenEq}
              className="glass-pill p-2 rounded-xl text-white/80 hover:text-white transition-colors"
              title="Equalizer & DSP"
            >
              <Sliders className="w-4 h-4" />
            </button>

            {/* Fullscreen Toggle */}
            <button
              onClick={toggleFullscreen}
              className="glass-pill p-2 rounded-xl text-white/80 hover:text-white transition-colors"
            >
              {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
