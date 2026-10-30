import React, { useState, useEffect } from 'react';
import { usePlayerStore } from '../../store/playerStore';
import { PLAYER_THEMES } from '../../types/theme';
import { TimelineScrubber } from './TimelineScrubber';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  RotateCcw,
  RotateCw,
  Volume2,
  VolumeX,
  Volume1,
  Sliders,
  Bookmark,
  Subtitles,
  Maximize,
  Minimize,
  FastForward,
  Settings,
  FolderOpen,
  Repeat,
  Camera,
} from 'lucide-react';

interface ControlsOverlayProps {
  onOpenEq: () => void;
  onOpenSettings: () => void;
  onOpenFileBrowser: () => void;
  containerRef: React.RefObject<HTMLDivElement | null>;
  isVisible?: boolean;
}

export const ControlsOverlay: React.FC<ControlsOverlayProps> = ({
  onOpenEq,
  onOpenSettings,
  onOpenFileBrowser,
  containerRef,
  isVisible = true,
}) => {
  const isPaused = usePlayerStore((s) => s.isPaused);
  const togglePlay = usePlayerStore((s) => s.togglePlay);
  const volume = usePlayerStore((s) => s.volume); // 0 to 200
  const setVolume = usePlayerStore((s) => s.setVolume);
  const isMuted = usePlayerStore((s) => s.isMuted);
  const playbackRate = usePlayerStore((s) => s.playbackRate);
  const setPlaybackRate = usePlayerStore((s) => s.setPlaybackRate);
  const positionMs = usePlayerStore((s) => s.positionMs);
  const durationMs = usePlayerStore((s) => s.durationMs);
  const seek = usePlayerStore((s) => s.seek);
  const addBookmark = usePlayerStore((s) => s.addBookmark);
  const audioTracks = usePlayerStore((s) => s.audioTracks);
  const subtitleTracks = usePlayerStore((s) => s.subtitleTracks);
  const isLooping = usePlayerStore((s) => s.isLooping);
  const toggleLoop = usePlayerStore((s) => s.toggleLoop);
  const playNextMedia = usePlayerStore((s) => s.playNextMedia);
  const playPreviousMedia = usePlayerStore((s) => s.playPreviousMedia);
  const takeSnapshot = usePlayerStore((s) => s.takeSnapshot);
  const themeId = usePlayerStore((s) => s.themeId);

  const theme = PLAYER_THEMES[themeId] || PLAYER_THEMES.cyberpunk;

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [showTrackMenu, setShowTrackMenu] = useState(false);

  useEffect(() => {
    const handleFsChange = () => {
      const doc = document as any;
      setIsFullscreen(
        !!(
          doc.fullscreenElement ||
          doc.webkitFullscreenElement ||
          doc.mozFullScreenElement ||
          doc.msFullscreenElement
        )
      );
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    document.addEventListener('webkitfullscreenchange', handleFsChange);
    document.addEventListener('mozfullscreenchange', handleFsChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFsChange);
      document.removeEventListener('webkitfullscreenchange', handleFsChange);
      document.removeEventListener('mozfullscreenchange', handleFsChange);
    };
  }, []);

  const toggleFullscreen = () => {
    const doc = document as any;
    const elem = containerRef.current || document.documentElement;
    const isCurrentlyFs = !!(
      doc.fullscreenElement ||
      doc.webkitFullscreenElement ||
      doc.mozFullScreenElement ||
      doc.msFullscreenElement
    );

    // 1. macOS Cocoa native WebKit bridge
    if (
      typeof window !== 'undefined' &&
      (window as any)?.webkit?.messageHandlers?.windowAction
    ) {
      (window as any).webkit.messageHandlers.windowAction.postMessage('toggleFullscreen');
    }

    // 2. Tauri window API
    if (typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window) {
      import('@tauri-apps/api/window')
        .then(({ getCurrentWindow }) => getCurrentWindow().toggleMaximize())
        .catch(() => {});
    }

    // 3. HTML5 Fullscreen API (cross-browser fallbacks)
    const el = elem as any;
    if (!isCurrentlyFs) {
      if (el.requestFullscreen) {
        el.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
      } else if (el.webkitRequestFullscreen) {
        el.webkitRequestFullscreen();
        setIsFullscreen(true);
      } else if (el.mozRequestFullScreen) {
        el.mozRequestFullScreen();
        setIsFullscreen(true);
      } else if (el.msRequestFullscreen) {
        el.msRequestFullscreen();
        setIsFullscreen(true);
      }
    } else {
      if (doc.exitFullscreen) {
        doc.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
      } else if (doc.webkitExitFullscreen) {
        doc.webkitExitFullscreen();
        setIsFullscreen(false);
      } else if (doc.mozCancelFullScreen) {
        doc.mozCancelFullScreen();
        setIsFullscreen(false);
      } else if (doc.msExitFullscreen) {
        doc.msExitFullscreen();
        setIsFullscreen(false);
      }
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
      className={`absolute inset-0 z-40 flex flex-col justify-end p-6 transition-all duration-500 select-none ${
        isVisible ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-4 pointer-events-none'
      }`}
    >
      {/* Center Big Play Trigger Area */}
      <div
        className={`absolute inset-0 flex items-center justify-center cursor-pointer pointer-events-auto transition-all duration-300 ${
          isPaused ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={togglePlay}
      >
        {isPaused && (
          <div
            className="p-7 rounded-3xl backdrop-blur-xl bg-black/60 shadow-2xl scale-100 hover:scale-110 active:scale-95 transition-all duration-300 border border-white/20 group"
            style={{ boxShadow: `0 0 35px ${theme.haloGlow}` }}
          >
            <Play className="w-14 h-14 text-white fill-white translate-x-1 group-hover:scale-105 transition-transform" />
          </div>
        )}
      </div>

      {/* Bottom Floating Glass HUD */}
      <div
        className={`backdrop-blur-2xl p-5 rounded-3xl flex flex-col gap-4 pointer-events-auto shadow-2xl border transition-all duration-300 z-10 ${theme.glassBg} ${theme.glassBorder}`}
        style={{
          boxShadow: `0 20px 50px rgba(0, 0, 0, 0.7), 0 0 30px ${theme.haloGlow}`,
        }}
      >
        {/* Magnetic Timeline */}
        <TimelineScrubber />

        {/* Action Controls */}
        <div className="flex items-center justify-between pt-1">
          {/* Left Controls: Prev, Rewind, Play/Pause, Forward, Next, VLC Volume */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Previous Video / Track */}
            <button
              onClick={playPreviousMedia}
              className="p-2.5 rounded-2xl bg-white/5 hover:bg-white/15 border border-white/10 text-white/80 hover:text-white transition-all active:scale-95"
              title="Previous Video (Shift+P)"
            >
              <SkipBack className="w-4 h-4" />
            </button>

            {/* Quick Rewind 10s */}
            <button
              onClick={() => seek(Math.max(0, positionMs - 10_000))}
              className="p-2.5 rounded-2xl bg-white/5 hover:bg-white/15 border border-white/10 text-white/80 hover:text-white transition-all active:scale-95"
              title="Rewind 10s (Left Arrow)"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {/* Prominent Play/Pause Button */}
            <button
              onClick={togglePlay}
              className={`p-3.5 rounded-2xl bg-gradient-to-r ${theme.accentGradient} text-white shadow-lg hover:brightness-110 active:scale-95 transition-all duration-200 flex items-center justify-center`}
              style={{
                boxShadow: `0 4px 18px ${theme.haloGlow}`,
              }}
              title={isPaused ? 'Play (Space)' : 'Pause (Space)'}
            >
              {isPaused ? (
                <Play className="w-5 h-5 fill-white translate-x-0.5" />
              ) : (
                <Pause className="w-5 h-5 fill-white" />
              )}
            </button>

            {/* Quick Forward 10s */}
            <button
              onClick={() => seek(positionMs + 10_000)}
              className="p-2.5 rounded-2xl bg-white/5 hover:bg-white/15 border border-white/10 text-white/80 hover:text-white transition-all active:scale-95"
              title="Forward 10s (Right Arrow)"
            >
              <RotateCw className="w-4 h-4" />
            </button>

            {/* Next Video / Track */}
            <button
              onClick={playNextMedia}
              className="p-2.5 rounded-2xl bg-white/5 hover:bg-white/15 border border-white/10 text-white/80 hover:text-white transition-all active:scale-95"
              title="Next Video (Shift+N)"
            >
              <SkipForward className="w-4 h-4" />
            </button>

            {/* VLC-Style 200% Overdrive Volume Slider */}
            <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-2xl bg-white/5 border border-white/10 ml-1">
              <button
                onClick={() => setVolume(volume === 0 ? 100 : 0)}
                className="text-white/70 hover:text-white transition-colors"
                title={volume > 100 ? `VLC Overdrive (${volume}%)` : `Volume (${volume}%)`}
              >
                {volume === 0 || isMuted ? (
                  <VolumeX className="w-4 h-4 text-rose-400" />
                ) : volume > 100 ? (
                  <Volume2 className="w-4 h-4 text-amber-400" />
                ) : volume > 50 ? (
                  <Volume2 className="w-4 h-4 text-cyan-400" />
                ) : (
                  <Volume1 className="w-4 h-4 text-white/70" />
                )}
              </button>

              <div className="flex flex-col justify-center">
                <input
                  type="range"
                  min={0}
                  max={200}
                  step={1}
                  value={volume}
                  onChange={(e) => setVolume(parseInt(e.target.value, 10))}
                  className="w-20 sm:w-24 h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                />
              </div>

              {/* Volume Percentage Badge */}
              <span
                className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-lg transition-colors ${
                  volume > 100
                    ? 'text-amber-300 bg-amber-500/20 border border-amber-400/40'
                    : 'text-white/70 bg-white/5 border border-white/10'
                }`}
              >
                {volume}%
              </span>
            </div>

            {/* Timestamps */}
            <div className="hidden lg:flex items-center font-mono text-xs text-white/60 tracking-wider pl-1">
              <span className="text-white font-medium">{formatTime(positionMs)}</span>
              <span className="mx-1 text-white/30">/</span>
              <span>{formatTime(durationMs)}</span>
            </div>
          </div>

          {/* Right Controls: Loop, Speed, EQ, Tracks, Fullscreen */}
          <div className="flex items-center gap-2">
            {/* Lossless Snapshot Button */}
            <button
              onClick={takeSnapshot}
              className="p-2.5 rounded-2xl bg-white/5 hover:bg-white/15 border border-white/10 text-white/80 hover:text-white transition-all active:scale-95"
              title="Capture Lossless Frame (Snapshot)"
            >
              <Camera className="w-4 h-4 text-sky-400" />
            </button>

            {/* Loop Toggle */}
            <button
              onClick={toggleLoop}
              className={`p-2.5 rounded-2xl transition-all active:scale-95 border ${
                isLooping
                  ? `${theme.badgeClass} shadow-md`
                  : 'bg-white/5 hover:bg-white/15 border-white/10 text-white/70 hover:text-white'
              }`}
              title={isLooping ? 'Looping Enabled' : 'Loop Off'}
            >
              <Repeat className="w-4 h-4" />
            </button>

            {/* Playback Speed Selector */}
            <div className="relative">
              <button
                onClick={() => setShowSpeedMenu(!showSpeedMenu)}
                className="px-3 py-2 rounded-2xl bg-white/5 hover:bg-white/15 border border-white/10 text-xs font-mono font-medium text-white/80 hover:text-white flex items-center gap-1.5 transition-all active:scale-95"
                title="Playback Speed"
              >
                <FastForward className="w-3.5 h-3.5 text-cyan-400" />
                {playbackRate}x
              </button>
              {showSpeedMenu && (
                <div
                  className={`absolute bottom-12 right-0 p-2 rounded-2xl flex flex-col gap-1 min-w-28 z-50 backdrop-blur-2xl border shadow-2xl ${theme.glassBg} ${theme.glassBorder}`}
                >
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-white/40 px-2 py-1">
                    Speed
                  </div>
                  {[0.25, 0.5, 0.75, 1.0, 1.25, 1.5, 2.0, 3.0, 4.0].map((r) => (
                    <button
                      key={r}
                      onClick={() => {
                        setPlaybackRate(r);
                        setShowSpeedMenu(false);
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-mono text-left transition-all ${
                        playbackRate === r
                          ? `${theme.badgeClass} font-bold`
                          : 'hover:bg-white/10 text-white/80'
                      }`}
                    >
                      {r}x {r === 1.0 && '• Normal'}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Audio & Subtitle Tracks Popover */}
            <div className="relative">
              <button
                onClick={() => setShowTrackMenu(!showTrackMenu)}
                className="p-2.5 rounded-2xl bg-white/5 hover:bg-white/15 border border-white/10 text-white/80 hover:text-white transition-all active:scale-95"
                title="Tracks & Subtitles"
              >
                <Subtitles className="w-4 h-4 text-purple-400" />
              </button>
              {showTrackMenu && (
                <div
                  className={`absolute bottom-12 right-0 p-3.5 rounded-2xl flex flex-col gap-2 min-w-52 z-50 backdrop-blur-2xl border shadow-2xl ${theme.glassBg} ${theme.glassBorder}`}
                >
                  <span className="text-[10px] font-semibold text-white/50 uppercase tracking-wider">
                    Audio & Subtitles
                  </span>
                  {audioTracks.length > 0 && (
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] text-cyan-400 font-semibold uppercase">Audio</span>
                      {audioTracks.map((t) => (
                        <span key={t.id} className="text-xs text-white/90 truncate">
                          {t.label}
                        </span>
                      ))}
                    </div>
                  )}
                  {subtitleTracks.length > 0 && (
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] text-purple-400 font-semibold uppercase">Subtitles</span>
                      {subtitleTracks.map((t) => (
                        <span key={t.id} className="text-xs text-white/90 truncate">
                          {t.label}
                        </span>
                      ))}
                    </div>
                  )}
                  {audioTracks.length === 0 && subtitleTracks.length === 0 && (
                    <span className="text-xs text-white/40 italic py-1">Embedded tracks auto-syncing</span>
                  )}
                </div>
              )}
            </div>

            {/* Bookmark button */}
            <button
              onClick={() => addBookmark(`Bookmark at ${formatTime(positionMs)}`)}
              className="p-2.5 rounded-2xl bg-white/5 hover:bg-white/15 border border-white/10 text-white/80 hover:text-white transition-all active:scale-95"
              title="Add Bookmark (B)"
            >
              <Bookmark className="w-4 h-4 text-amber-400" />
            </button>

            {/* Media Explorer / Library Button */}
            <button
              onClick={onOpenFileBrowser}
              className="p-2.5 rounded-2xl bg-white/5 hover:bg-white/15 border border-white/10 text-white/80 hover:text-white transition-all active:scale-95"
              title="Media Library & Streams"
            >
              <FolderOpen className="w-4 h-4 text-sky-400" />
            </button>

            {/* 10-Band Parametric Equalizer Button */}
            <button
              onClick={onOpenEq}
              className="p-2.5 rounded-2xl bg-white/5 hover:bg-white/15 border border-white/10 text-white/80 hover:text-white transition-all active:scale-95"
              title="10-Band Audio Equalizer (E)"
            >
              <Sliders className="w-4 h-4 text-emerald-400" />
            </button>

            {/* Video Settings, Shaders & 10 Themes */}
            <button
              onClick={onOpenSettings}
              className="p-2.5 rounded-2xl bg-white/5 hover:bg-white/15 border border-white/10 text-white/80 hover:text-white transition-all active:scale-95"
              title="Video Enhancements & Themes"
            >
              <Settings className="w-4 h-4 text-fuchsia-400" />
            </button>

            {/* Fullscreen Toggle (macOS Cocoa + Tauri + HTML5) */}
            <button
              onClick={toggleFullscreen}
              className={`p-2.5 rounded-2xl border transition-all active:scale-95 ${
                isFullscreen
                  ? 'bg-cyan-500/25 border-cyan-400/40 text-cyan-300 shadow-md'
                  : 'bg-white/5 hover:bg-white/15 border-white/10 text-white/80 hover:text-white'
              }`}
              title={isFullscreen ? 'Exit Fullscreen (F)' : 'Fullscreen (F)'}
            >
              {isFullscreen ? (
                <Minimize className="w-4 h-4 text-cyan-300" />
              ) : (
                <Maximize className="w-4 h-4 text-white" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
