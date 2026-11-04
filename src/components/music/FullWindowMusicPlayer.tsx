import React, { useState, useEffect, useRef } from 'react';
import { usePlayerStore } from '../../store/playerStore';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Sliders,
  X,
  ListMusic,
  MessageSquareText,
  Sparkles,
  Music,
  FolderOpen,
} from 'lucide-react';
import { FEATURED_MUSIC_TRACKS } from './MusicPlayerView';

export interface FullWindowMusicPlayerProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenEq?: () => void;
}

export const FullWindowMusicPlayer: React.FC<FullWindowMusicPlayerProps> = ({
  isOpen,
  onClose,
  onOpenEq,
}) => {
  const currentUri = usePlayerStore((s) => s.currentUri);
  const isPaused = usePlayerStore((s) => s.isPaused);
  const positionMs = usePlayerStore((s) => s.positionMs);
  const durationMs = usePlayerStore((s) => s.durationMs);
  const volume = usePlayerStore((s) => s.volume);
  const isMuted = usePlayerStore((s) => s.isMuted);
  const setVolume = usePlayerStore((s) => s.setVolume);
  const setMuted = usePlayerStore((s) => s.setMuted);
  const togglePlay = usePlayerStore((s) => s.togglePlay);
  const seek = usePlayerStore((s) => s.seek);
  const openMedia = usePlayerStore((s) => s.openMedia);

  const [tracks, setTracks] = useState(FEATURED_MUSIC_TRACKS);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isLyricsOpen, setIsLyricsOpen] = useState(false);
  const [isQueueOpen, setIsQueueOpen] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Sync activeIndex with currentUri if playing a track from list
  useEffect(() => {
    if (currentUri) {
      const idx = tracks.findIndex((t) => t.url === currentUri);
      if (idx !== -1) {
        setActiveIndex(idx);
      }
    }
  }, [currentUri, tracks]);

  const activeTrack = tracks[activeIndex] || tracks[0];

  const handleSelectTrack = (idx: number) => {
    setActiveIndex(idx);
    const tr = tracks[idx];
    if (tr) {
      openMedia(tr.url, tr.title, true);
    }
  };

  const handlePrev = () => {
    const nextIdx = (activeIndex - 1 + tracks.length) % tracks.length;
    handleSelectTrack(nextIdx);
  };

  const handleNext = () => {
    const nextIdx = (activeIndex + 1) % tracks.length;
    handleSelectTrack(nextIdx);
  };

  const handleOpenLocalAudio = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const uri = URL.createObjectURL(file);
      const newTrack = {
        id: `local-${Date.now()}`,
        title: file.name.replace(/\.[^/.]+$/, ''),
        artist: 'Local Music Track',
        url: uri,
        durationSec: 180,
        albumArt: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=400&q=80',
      };
      setTracks((prev) => [newTrack, ...prev]);
      setActiveIndex(0);
      openMedia(uri, newTrack.title, true);
    }
  };

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        togglePlay();
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        handlePrev();
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        handleNext();
      } else if (e.code === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, activeIndex, togglePlay, onClose]);

  // Ambient Audio Reactive Visualizer Canvas
  useEffect(() => {
    if (!isOpen || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let phase = 0;

    const render = () => {
      phase += 0.03;
      const w = (canvas.width = canvas.offsetWidth);
      const h = (canvas.height = canvas.offsetHeight);

      ctx.clearRect(0, 0, w, h);

      // Atmospheric glowing gradient
      const bgGrad = ctx.createRadialGradient(w / 2, h / 2, 40, w / 2, h / 2, w * 0.7);
      bgGrad.addColorStop(0, 'rgba(30, 27, 75, 0.45)');
      bgGrad.addColorStop(0.5, 'rgba(15, 23, 42, 0.65)');
      bgGrad.addColorStop(1, 'rgba(5, 6, 10, 0.95)');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);

      // Floating sine wave spectrum bars
      const barCount = 48;
      const barWidth = w / barCount;
      const isAudible = !isPaused;

      for (let i = 0; i < barCount; i++) {
        const factor = Math.sin(phase + i * 0.25) * 0.5 + 0.5;
        const amp = isAudible ? factor * (h * 0.18) + 10 : 6;
        const x = i * barWidth;
        const y = h / 2;

        const grad = ctx.createLinearGradient(x, y - amp, x, y + amp);
        grad.addColorStop(0, '#38bdf8');
        grad.addColorStop(0.5, '#a855f7');
        grad.addColorStop(1, '#ec4899');

        ctx.fillStyle = grad;
        ctx.fillRect(x + barWidth * 0.2, y - amp, barWidth * 0.6, amp * 2);
      }

      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [isOpen, isPaused]);

  const progressPercent = durationMs > 0 ? (positionMs / durationMs) * 100 : 0;

  const formatTime = (ms: number) => {
    const s = Math.floor(ms / 1000);
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec < 10 ? '0' : ''}${sec}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[#05060a] text-white flex flex-col select-none overflow-hidden animate-in fade-in zoom-in-95 duration-200">
      {/* Background Visualizer Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />

      {/* Top Header Bar */}
      <div className="relative z-10 w-full h-14 flex items-center justify-between px-6 border-b border-white/10 bg-slate-950/60 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 to-purple-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <Music className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-tight text-white flex items-center gap-2">
              Full-Window Hi-Fi Music Studio
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
                Cover Flow 3D
              </span>
            </h1>
            <p className="text-[11px] text-white/50">Studio Master 24-Bit / 192kHz Audio</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 text-xs font-semibold text-white/80 hover:text-white cursor-pointer transition-all active:scale-95">
            <FolderOpen className="w-3.5 h-3.5 text-cyan-400" />
            <span>Open Audio File</span>
            <input type="file" accept="audio/*" onChange={handleOpenLocalAudio} className="hidden" />
          </label>

          <button
            onClick={() => setIsQueueOpen(!isQueueOpen)}
            className={`p-2 rounded-xl border transition-all ${
              isQueueOpen ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400/40' : 'bg-white/5 text-white/70 hover:text-white border-white/10'
            }`}
            title="Queue / Playlist"
          >
            <ListMusic className="w-4 h-4" />
          </button>

          <button
            onClick={() => setIsLyricsOpen(!isLyricsOpen)}
            className={`p-2 rounded-xl border transition-all ${
              isLyricsOpen ? 'bg-purple-500/20 text-purple-300 border-purple-400/40' : 'bg-white/5 text-white/70 hover:text-white border-white/10'
            }`}
            title="Lyrics Viewer"
          >
            <MessageSquareText className="w-4 h-4" />
          </button>

          {onOpenEq && (
            <button
              onClick={onOpenEq}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white border border-white/10 transition-all"
              title="10-Band Equalizer"
            >
              <Sliders className="w-4 h-4 text-emerald-400" />
            </button>
          )}

          <div className="w-[1px] h-4 bg-white/15 mx-1" />

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-white/5 hover:bg-rose-500/30 text-white/70 hover:text-rose-200 border border-white/10 flex items-center justify-center transition-all"
            title="Close Full-Window Music Player"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main 3D Cover Flow Viewport */}
      <div className="relative flex-1 w-full h-full flex flex-col items-center justify-center overflow-hidden z-10 px-4">
        {/* 3D Perspective Carousel Container */}
        <div
          className="relative w-full max-w-5xl h-80 flex items-center justify-center"
          style={{ perspective: '1200px', transformStyle: 'preserve-3d' }}
        >
          {tracks.map((track, idx) => {
            const offset = idx - activeIndex;
            const isCenter = offset === 0;

            // Compute 3D Cover Flow transforms
            let transform = '';
            let zIndex = 50 - Math.abs(offset);
            let opacity = 1;

            if (isCenter) {
              transform = 'translateX(0) translateZ(80px) rotateY(0deg) scale(1.08)';
            } else if (offset < 0) {
              // Left cards angled
              transform = `translateX(${offset * 140 - 70}px) translateZ(${offset * 40}px) rotateY(45deg) scale(0.85)`;
              opacity = Math.max(0.35, 1 - Math.abs(offset) * 0.25);
            } else {
              // Right cards angled
              transform = `translateX(${offset * 140 + 70}px) translateZ(-${offset * 40}px) rotateY(-45deg) scale(0.85)`;
              opacity = Math.max(0.35, 1 - Math.abs(offset) * 0.25);
            }

            return (
              <div
                key={track.id}
                onClick={() => handleSelectTrack(idx)}
                className="absolute w-64 h-64 cursor-pointer transition-all duration-500 ease-out flex flex-col items-center group"
                style={{
                  transform,
                  zIndex,
                  opacity,
                  transformStyle: 'preserve-3d',
                }}
              >
                {/* Vinyl / Cover Card */}
                <div className="relative w-full h-full rounded-2xl overflow-hidden border-2 border-white/20 shadow-2xl bg-slate-900 group-hover:border-cyan-400/60 transition-colors">
                  <img
                    src={track.albumArt}
                    alt={track.title}
                    className="w-full h-full object-cover select-none"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                  {isCenter && !isPaused && (
                    <div className="absolute top-3 right-3 px-2 py-1 rounded-full bg-cyan-500/80 backdrop-blur-md text-[10px] font-mono text-black font-bold flex items-center gap-1 shadow-lg">
                      <Sparkles className="w-3 h-3 animate-spin" /> PLAYING
                    </div>
                  )}
                </div>

                {/* Mirror Reflection Effect */}
                <div
                  className="w-full h-20 mt-1 rounded-b-2xl overflow-hidden opacity-30 pointer-events-none"
                  style={{
                    transform: 'scaleY(-1)',
                    WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,0.8), transparent)',
                    maskImage: 'linear-gradient(to bottom, rgba(0,0,0,0.8), transparent)',
                  }}
                >
                  <img src={track.albumArt} alt="" className="w-full h-full object-cover" />
                </div>
              </div>
            );
          })}
        </div>

        {/* Focused Track Metadata Display */}
        <div className="flex flex-col items-center mt-6 text-center animate-in fade-in duration-300">
          <h2 className="text-2xl font-black text-white tracking-tight drop-shadow-md">
            {activeTrack?.title || 'Unknown Track'}
          </h2>
          <p className="text-sm font-medium text-cyan-300/80 mt-1">
            {activeTrack?.artist || 'Unknown Artist'}
          </p>
        </div>
      </div>

      {/* Floating Translucent Glass Playback Pill Bar (Inspired by Image 3) */}
      <div className="relative z-20 w-full px-6 pb-6 flex justify-center">
        <div className="w-full max-w-3xl h-20 rounded-3xl bg-slate-950/80 backdrop-blur-2xl border border-white/20 shadow-2xl flex items-center justify-between px-6 gap-4">
          {/* Left: Previous, Play/Pause, Next */}
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrev}
              className="p-2.5 rounded-2xl hover:bg-white/10 text-white/70 hover:text-white transition-all active:scale-95"
              title="Previous Track (Arrow Left)"
            >
              <SkipBack className="w-5 h-5 fill-white/80" />
            </button>
            <button
              onClick={togglePlay}
              className="w-12 h-12 rounded-2xl bg-gradient-to-r from-cyan-400 to-blue-500 hover:brightness-110 text-slate-950 flex items-center justify-center transition-all shadow-lg shadow-cyan-500/30 active:scale-95"
              title="Play / Pause (Space)"
            >
              {isPaused ? <Play className="w-5 h-5 fill-current ml-0.5" /> : <Pause className="w-5 h-5 fill-current" />}
            </button>
            <button
              onClick={handleNext}
              className="p-2.5 rounded-2xl hover:bg-white/10 text-white/70 hover:text-white transition-all active:scale-95"
              title="Next Track (Arrow Right)"
            >
              <SkipForward className="w-5 h-5 fill-white/80" />
            </button>
          </div>

          {/* Center: Mini Track Badge & Interactive Scrubber Bar */}
          <div className="flex-1 flex flex-col gap-1.5 min-w-0 px-2">
            <div className="flex items-center justify-between text-[11px] font-mono text-white/50">
              <span className="truncate max-w-[200px] font-semibold text-white/90">
                {activeTrack?.title}
              </span>
              <span>
                {formatTime(positionMs)} / {formatTime(durationMs)}
              </span>
            </div>
            {/* Scrubber */}
            <div
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const pos = (e.clientX - rect.left) / rect.width;
                if (durationMs > 0) {
                  seek(pos * durationMs, true);
                }
              }}
              className="relative w-full h-2 rounded-full bg-white/10 cursor-pointer overflow-hidden group"
            >
              <div
                className="h-full bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-500 transition-all rounded-full group-hover:brightness-125"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Right: Sound Controls & Drawers */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setMuted(!isMuted)}
                className="p-2 rounded-xl hover:bg-white/10 text-white/70 hover:text-white"
                title={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted || volume === 0 ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4" />}
              </button>
              <input
                type="range"
                min="0"
                max="200"
                value={isMuted ? 0 : volume}
                onChange={(e) => setVolume(Number(e.target.value))}
                className="w-20 accent-cyan-400 h-1 bg-white/20 rounded-lg cursor-pointer"
              />
            </div>

            <button
              onClick={() => setIsLyricsOpen(!isLyricsOpen)}
              className={`p-2 rounded-xl transition-all ${
                isLyricsOpen ? 'bg-cyan-500/20 text-cyan-300' : 'hover:bg-white/10 text-white/60 hover:text-white'
              }`}
              title="Toggle Lyrics"
            >
              <MessageSquareText className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Slide-In Lyrics Drawer */}
      {isLyricsOpen && (
        <div className="absolute top-14 right-6 bottom-28 w-80 bg-slate-950/90 backdrop-blur-2xl border border-white/20 rounded-3xl p-5 z-30 shadow-2xl flex flex-col gap-3 animate-in slide-in-from-right duration-200">
          <div className="flex items-center justify-between border-b border-white/10 pb-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white/50">Synchronized Lyrics</h3>
            <button onClick={() => setIsLyricsOpen(false)} className="text-white/40 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto space-y-4 text-center py-4">
            <p className="text-sm font-semibold text-cyan-300">♪ {activeTrack?.title} ♪</p>
            <p className="text-xs text-white/60 leading-relaxed">
              Drifting across the electric neon horizon,<br />
              Synthesizers echoing through celestial frequencies.<br />
              Bassline resonating with high-fidelity depth,<br />
              The soundscape expands without boundaries.
            </p>
            <p className="text-xs text-white/40">Studio Instrumental Master</p>
          </div>
        </div>
      )}

      {/* Slide-In Queue / Playlist Drawer */}
      {isQueueOpen && (
        <div className="absolute top-14 left-6 bottom-28 w-80 bg-slate-950/90 backdrop-blur-2xl border border-white/20 rounded-3xl p-5 z-30 shadow-2xl flex flex-col gap-3 animate-in slide-in-from-left duration-200">
          <div className="flex items-center justify-between border-b border-white/10 pb-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white/50">Playback Queue ({tracks.length})</h3>
            <button onClick={() => setIsQueueOpen(false)} className="text-white/40 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto space-y-2">
            {tracks.map((tr, idx) => {
              const isCurrent = idx === activeIndex;
              return (
                <div
                  key={tr.id}
                  onClick={() => handleSelectTrack(idx)}
                  className={`flex items-center gap-3 p-2 rounded-2xl cursor-pointer transition-all ${
                    isCurrent ? 'bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 font-bold' : 'hover:bg-white/5 text-white/70'
                  }`}
                >
                  <img src={tr.albumArt} alt="" className="w-10 h-10 rounded-xl object-cover shrink-0" />
                  <div className="flex flex-col min-w-0 flex-1">
                    <span className="text-xs truncate">{tr.title}</span>
                    <span className="text-[10px] text-white/40 truncate">{tr.artist}</span>
                  </div>
                  {isCurrent && <Play className="w-3.5 h-3.5 fill-current text-cyan-400" />}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
