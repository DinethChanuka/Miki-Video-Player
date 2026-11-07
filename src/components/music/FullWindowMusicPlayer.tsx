import React, { useState, useEffect, useRef } from 'react';
import { usePlayerStore } from '../../store/playerStore';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  Volume1,
  VolumeX,
  Sliders,
  X,
  ChevronDown,
  ListMusic,
  ListPlus,
  MessageSquareText,
  Sparkles,
  Music,
  FolderOpen,
  RefreshCw,
  Activity,
  Radio,
  Waves,
  Check,
} from 'lucide-react';
import { FEATURED_MUSIC_TRACKS } from './MusicPlayerView';
import { fetchTrackLyrics, LyricsResult } from '../../utils/lyricsService';
import {
  renderCyberSpectrum,
  renderOrbitalSoundwave,
  renderLiquidOscilloscope,
  VisualizerMode,
} from './canvasVisualizers';

export interface FullWindowMusicPlayerProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenEq?: () => void;
  onStartWindowDrag?: (e: React.MouseEvent) => void;
}

export const FullWindowMusicPlayer: React.FC<FullWindowMusicPlayerProps> = ({
  isOpen,
  onClose,
  onOpenEq,
  onStartWindowDrag,
}) => {
  const currentUri = usePlayerStore((s) => s.currentUri);
  const currentTitle = usePlayerStore((s) => s.currentTitle);
  const currentArtwork = usePlayerStore((s) => s.currentArtwork);
  const isPaused = usePlayerStore((s) => s.isPaused);
  const isBuffering = usePlayerStore((s) => s.isBuffering);
  const positionMs = usePlayerStore((s) => s.positionMs);
  const durationMs = usePlayerStore((s) => s.durationMs);
  const volume = usePlayerStore((s) => s.volume);
  const isMuted = usePlayerStore((s) => s.isMuted);
  const preampGain = usePlayerStore((s) => s.preampGain);
  const setVolume = usePlayerStore((s) => s.setVolume);
  const setMuted = usePlayerStore((s) => s.setMuted);
  const togglePlay = usePlayerStore((s) => s.togglePlay);
  const seek = usePlayerStore((s) => s.seek);
  const openMedia = usePlayerStore((s) => s.openMedia);
  const closeMedia = usePlayerStore((s) => s.closeMedia);

  const customPlaylists = usePlayerStore((s) => s.customPlaylists);
  const createPlaylist = usePlayerStore((s) => s.createPlaylist);
  const addTrackToPlaylist = usePlayerStore((s) => s.addTrackToPlaylist);

  const [tracks, setTracks] = useState(FEATURED_MUSIC_TRACKS);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isLyricsOpen, setIsLyricsOpen] = useState(false);
  const [isQueueOpen, setIsQueueOpen] = useState(false);
  const [visualizerMode, setVisualizerMode] = useState<VisualizerMode>('spectrum');
  const [syncAudio, setSyncAudio] = useState(true);

  // Synchronized lyrics state
  const [lyricsData, setLyricsData] = useState<LyricsResult | null>(null);
  const [isLoadingLyrics, setIsLoadingLyrics] = useState(false);
  const activeLyricRef = useRef<HTMLDivElement | null>(null);

  // Custom playlist modal state
  const [isPlaylistModalOpen, setIsPlaylistModalOpen] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [playlistAddedTrackId, setPlaylistAddedTrackId] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const createdBlobUrlsRef = useRef<string[]>([]);

  const activeTrack = tracks[activeIndex] || tracks[0];
  // Detect if current audio is an online stream or YouTube direct audio bridge
  const isYouTubeAudioStream = Boolean(currentUri?.match(/(?:youtube\.com|youtu\.be)/i));

  // Fetch synchronized lyrics on track change
  useEffect(() => {
    if (!activeTrack) return;
    let isCancelled = false;
    setIsLoadingLyrics(true);

    fetchTrackLyrics(activeTrack.title, activeTrack.artist)
      .then((res) => {
        if (!isCancelled) {
          setLyricsData(res);
          setIsLoadingLyrics(false);
        }
      })
      .catch(() => {
        if (!isCancelled) {
          setLyricsData(null);
          setIsLoadingLyrics(false);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [activeTrack?.title, activeTrack?.artist]);

  const lastActiveIndexRef = useRef<number>(-1);

  // Auto-scroll active lyric line into view only when active line transitions
  useEffect(() => {
    if (!isLyricsOpen || !lyricsData?.syncedLyrics) return;
    const synced = lyricsData.syncedLyrics;
    let activeIdx = -1;
    for (let i = 0; i < synced.length; i++) {
      if (synced[i].timeMs <= positionMs) {
        activeIdx = i;
      } else {
        break;
      }
    }
    if (activeIdx !== -1 && activeIdx !== lastActiveIndexRef.current) {
      lastActiveIndexRef.current = activeIdx;
      activeLyricRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, [positionMs, isLyricsOpen, lyricsData?.syncedLyrics]);

  // Revoke created blob URLs on unmount to eliminate memory leaks
  useEffect(() => {
    return () => {
      createdBlobUrlsRef.current.forEach((url) => {
        try {
          URL.revokeObjectURL(url);
        } catch {}
      });
      createdBlobUrlsRef.current = [];
    };
  }, []);

  // Sync activeIndex with currentUri if playing a track from list or dynamic stream
  useEffect(() => {
    if (currentUri) {
      setTracks((prev) => {
        const idx = prev.findIndex((t) => t.url === currentUri);
        if (idx !== -1) {
          setActiveIndex(idx);
          if (durationMs > 0 && prev[idx].durationSec !== Math.floor(durationMs / 1000)) {
            const updated = [...prev];
            updated[idx] = { ...updated[idx], durationSec: Math.floor(durationMs / 1000) };
            return updated;
          }
          return prev;
        } else if (currentTitle) {
          let songTitle = currentTitle;
          let songArtist = 'Studio Master';
          if (currentTitle.includes(' - ')) {
            const parts = currentTitle.split(' - ');
            songTitle = parts[1]?.trim() || parts[0]?.trim() || currentTitle;
            songArtist = parts[0]?.trim() || 'Studio Master';
          } else if (currentTitle.includes(' | ')) {
            const parts = currentTitle.split(' | ');
            songTitle = parts[0]?.trim() || currentTitle;
            songArtist = parts[1]?.trim() || 'Studio Master';
          }
          const newTrack = {
            id: `current-${Date.now()}`,
            title: songTitle,
            artist: songArtist,
            url: currentUri,
            durationSec: durationMs ? Math.floor(durationMs / 1000) : 210,
            albumArt: currentArtwork || 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=500&auto=format&fit=crop&q=80',
          };
          setActiveIndex(0);
          return [newTrack, ...prev.filter((t) => t.url !== currentUri)];
        }
        return prev;
      });
    }
  }, [currentUri, currentTitle, currentArtwork]);

  const handleSelectTrack = (idx: number) => {
    setActiveIndex(idx);
    const tr = tracks[idx];
    if (tr) {
      openMedia(tr.url, tr.title, true, 0, tr.albumArt, 'music');
    }
  };

  const handlePlayToggle = () => {
    if (!currentUri && activeTrack) {
      openMedia(activeTrack.url, activeTrack.title, true, 0, activeTrack.albumArt, 'music');
    } else {
      togglePlay();
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

  const handleVolumeChange = (newVal: number) => {
    // 1. Instantaneous direct hardware volume update with smooth perceptual logarithmic curve:
    const video = (document.getElementById('aether-video-viewport') as HTMLVideoElement) || null;
    if (video) {
      const isMutedNow = newVal === 0;
      video.muted = isMutedNow;
      const normalizedPercent = Math.min(100, newVal) / 100;
      const smoothGain = Math.pow(normalizedPercent, 1.4);
      video.volume = Math.max(0, Math.min(1.0, smoothGain));
    }
    // 2. Synchronous player store dispatch
    setVolume(newVal);
  };

  const handleOpenLocalAudio = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const uri = URL.createObjectURL(file);
      createdBlobUrlsRef.current.push(uri);
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
      openMedia(uri, newTrack.title, true, 0, newTrack.albumArt, 'music');
    }
  };

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        handlePlayToggle();
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

  // Tri-Mode Premium Audio Reactive Visualizer Canvas
  useEffect(() => {
    if (!isOpen || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let phase = 0;

    const render = () => {
      phase += 0.03;
      const dpr = window.devicePixelRatio || 1;
      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;
      if (canvas.width !== w * dpr || canvas.height !== h * dpr) {
        canvas.width = w * dpr;
        canvas.height = h * dpr;
      }
      ctx.save();
      ctx.scale(dpr, dpr);

      const engine = usePlayerStore.getState().engine;
      const freqData = engine?.getFrequencyData ? engine.getFrequencyData() : null;

      if (visualizerMode === 'orbital') {
        renderOrbitalSoundwave(ctx, w, h, freqData, phase, !isPaused, syncAudio);
      } else if (visualizerMode === 'ribbon') {
        renderLiquidOscilloscope(ctx, w, h, freqData, phase, !isPaused, syncAudio);
      } else {
        renderCyberSpectrum(ctx, w, h, freqData, phase, !isPaused, syncAudio);
      }

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [isOpen, isPaused, visualizerMode, syncAudio]);

  const effectiveDuration = durationMs > 0 ? durationMs : (activeTrack?.durationSec ? activeTrack.durationSec * 1000 : 0);
  const progressPercent = effectiveDuration > 0 ? Math.min(100, (positionMs / effectiveDuration) * 100) : 0;

  const formatTime = (ms: number) => {
    const s = Math.floor(ms / 1000);
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec < 10 ? '0' : ''}${sec}`;
  };

  const handleInternalWindowDrag = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('input') || target.closest('label') || target.closest('a')) {
      return;
    }
    if (onStartWindowDrag) {
      onStartWindowDrag(e);
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[#05060a] text-white flex flex-col select-none overflow-hidden animate-in fade-in zoom-in-95 duration-200">
      {/* Background Visualizer Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />

      {/* Top Header Bar with Borderless Window Dragging */}
      <div
        data-tauri-drag-region
        onMouseDown={handleInternalWindowDrag}
        className="relative z-10 w-full h-14 flex items-center justify-between px-6 border-b border-white/10 bg-slate-950/60 backdrop-blur-xl select-none cursor-default"
        style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
      >
        <div
          className="flex items-center gap-3"
          style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
        >
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
            <p className="text-[11px] text-white/50">
              {isYouTubeAudioStream
                ? 'Studio Master Lossless Audio & Spatial Soundstage'
                : 'Studio Master 24-Bit / 192kHz Audio'}
            </p>
          </div>
        </div>

        <div
          className="flex items-center gap-2"
          style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
        >
          {/* Visualizer Mode Switcher */}
          <div className="flex items-center gap-1 bg-white/5 p-1 rounded-2xl border border-white/10">
            <button
              onClick={() => setVisualizerMode('spectrum')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-semibold transition-all ${
                visualizerMode === 'spectrum'
                  ? 'bg-cyan-500/25 text-cyan-300 border border-cyan-400/30 shadow-sm'
                  : 'text-white/60 hover:text-white'
              }`}
              title="Cyber Spectrum Bars"
            >
              <Activity className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Spectrum</span>
            </button>
            <button
              onClick={() => setVisualizerMode('orbital')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-semibold transition-all ${
                visualizerMode === 'orbital'
                  ? 'bg-purple-500/25 text-purple-300 border border-purple-400/30 shadow-sm'
                  : 'text-white/60 hover:text-white'
              }`}
              title="Orbital Pulsar Soundwave"
            >
              <Radio className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Orbital</span>
            </button>
            <button
              onClick={() => setVisualizerMode('ribbon')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-semibold transition-all ${
                visualizerMode === 'ribbon'
                  ? 'bg-pink-500/25 text-pink-300 border border-pink-400/30 shadow-sm'
                  : 'text-white/60 hover:text-white'
              }`}
              title="Liquid Oscilloscope Ribbon"
            >
              <Waves className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Ribbon</span>
            </button>
          </div>

          {/* Sync to Audio Toggle Button */}
          <button
            onClick={() => setSyncAudio(!syncAudio)}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
              syncAudio
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400/40 shadow-[0_0_12px_rgba(6,182,212,0.3)] animate-pulse'
                : 'bg-white/5 text-white/40 border-white/10 hover:text-white/70'
            }`}
            title="Toggle Music-Sync Animation"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Sync Audio</span>
          </button>

          {/* Add Track to Playlist Button */}
          <button
            onClick={() => setIsPlaylistModalOpen(true)}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white border border-white/10 transition-all active:scale-95"
            title="Add Track to Custom Playlist"
          >
            <ListPlus className="w-4 h-4 text-cyan-400" />
          </button>

          <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 text-xs font-semibold text-white/80 hover:text-white cursor-pointer transition-all active:scale-95">
            <FolderOpen className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden lg:inline">Open Audio</span>
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
            title="Synchronized Lyrics"
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

          {/* Minimize back to persistent Music Control Hub without terminating playback */}
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/20 text-white/70 hover:text-white border border-white/10 flex items-center justify-center transition-all cursor-pointer"
            title="Minimize to System Music Hub"
          >
            <ChevronDown className="w-4 h-4" />
          </button>

          {/* Stop playback and close */}
          <button
            onClick={() => {
              onClose();
              closeMedia();
            }}
            className="w-8 h-8 rounded-xl bg-white/5 hover:bg-rose-500/30 text-white/70 hover:text-rose-200 border border-white/10 flex items-center justify-center transition-all cursor-pointer"
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
                onClick={() => (isCenter ? handlePlayToggle() : handleSelectTrack(idx))}
                className="absolute w-64 h-64 cursor-pointer transition-all duration-500 ease-out flex flex-col items-center group select-none"
                style={{
                  transform,
                  zIndex,
                  opacity,
                  transformStyle: 'preserve-3d',
                }}
              >
                {/* 3D Vinyl / Cover Art Card */}
                <div className="relative w-full h-full rounded-2xl overflow-hidden border-2 border-white/20 shadow-2xl bg-slate-900 group-hover:border-cyan-400/60 transition-all duration-300">
                  <img
                    src={track.albumArt}
                    alt={track.title}
                    className="w-full h-full object-cover select-none pointer-events-none"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                  {isCenter && (
                    isBuffering ? (
                      <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-amber-500/90 backdrop-blur-md text-[10px] font-mono text-slate-950 font-bold flex items-center gap-1.5 shadow-lg animate-pulse z-30">
                        <RefreshCw className="w-3 h-3 animate-spin" /> LOADING STREAM...
                      </div>
                    ) : !isPaused ? (
                      <div className="absolute top-3 right-3 px-2 py-1 rounded-full bg-cyan-500/80 backdrop-blur-md text-[10px] font-mono text-black font-bold flex items-center gap-1 shadow-lg z-30">
                        <Sparkles className="w-3 h-3 animate-spin" /> PLAYING
                      </div>
                    ) : null
                  )}

                  {/* Frosted Loading Indicator Overlay when Stream is Buffering */}
                  {isCenter && isBuffering && (
                    <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm flex flex-col items-center justify-center gap-2 rounded-2xl z-20 pointer-events-none animate-in fade-in duration-200">
                      <div className="p-3 rounded-full bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 shadow-xl">
                        <RefreshCw className="w-7 h-7 animate-spin" />
                      </div>
                      <span className="text-[11px] font-mono font-bold tracking-wider text-white uppercase drop-shadow">
                        Buffering Audio Stream...
                      </span>
                    </div>
                  )}
                </div>

                {/* Floor Contact Shadow / Ambient Occlusion */}
                <div
                  className="contact-shadow absolute -bottom-3 left-1/2 -translate-x-1/2 w-56 h-5 rounded-full pointer-events-none blur-sm"
                  style={{
                    background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.4) 45%, transparent 75%)',
                    transform: 'rotateX(80deg)',
                  }}
                />

                {/* Realistic 3D Floor Reflection */}
                <div
                  className="floor-reflection absolute top-[258px] left-0 right-0 h-32 overflow-hidden pointer-events-none select-none"
                  style={{
                    transform: 'scaleY(-1)',
                    transformOrigin: 'top',
                    opacity: isCenter ? 0.45 : 0.25,
                    WebkitMaskImage: 'linear-gradient(to top, transparent 0%, rgba(0,0,0,0.15) 35%, rgba(0,0,0,0.75) 100%)',
                    maskImage: 'linear-gradient(to top, transparent 0%, rgba(0,0,0,0.15) 35%, rgba(0,0,0,0.75) 100%)',
                    filter: 'blur(0.6px)',
                  }}
                >
                  <div className="w-64 h-64 rounded-2xl overflow-hidden bg-slate-900 border border-white/10">
                    <img
                      src={track.albumArt}
                      alt=""
                      className="w-full h-full object-cover select-none pointer-events-none"
                    />
                  </div>
                  {/* Dark Glass Floor Tint Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#05060a]/30 to-[#05060a]/80" />
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
              onClick={handlePlayToggle}
              className="w-12 h-12 rounded-2xl bg-gradient-to-r from-cyan-400 to-blue-500 hover:brightness-110 text-slate-950 flex items-center justify-center transition-all shadow-lg shadow-cyan-500/30 active:scale-95"
              title={isBuffering ? "Loading Audio Stream..." : isPaused ? "Play (Space)" : "Pause (Space)"}
            >
              {isBuffering ? (
                <RefreshCw className="w-5 h-5 animate-spin text-slate-950" />
              ) : isPaused ? (
                <Play className="w-5 h-5 fill-current ml-0.5" />
              ) : (
                <Pause className="w-5 h-5 fill-current" />
              )}
            </button>
            <button
              onClick={handleNext}
              className="p-2.5 rounded-2xl hover:bg-white/10 text-white/70 hover:text-white transition-all active:scale-95"
              title="Next Track (Arrow Right)"
            >
              <SkipForward className="w-5 h-5 fill-white/80" />
            </button>
          </div>

          {/* Center: Mini Track Badge & Interactive Scrubber Bar with Indeterminate Buffering Animation */}
          <div className="flex-1 flex flex-col gap-1.5 min-w-0 px-2">
            <div className="flex items-center justify-between text-[11px] font-mono text-white/50">
              <span className="truncate max-w-[200px] font-semibold text-white/90 flex items-center gap-1.5">
                {isBuffering && <RefreshCw className="w-3 h-3 animate-spin text-cyan-400 shrink-0" />}
                {activeTrack?.title}
              </span>
              <span className={isBuffering && positionMs === 0 ? "text-cyan-400 font-semibold animate-pulse" : ""}>
                {isBuffering && positionMs === 0
                  ? 'Buffering Audio...'
                  : `${formatTime(positionMs)} / ${formatTime(effectiveDuration)}`}
              </span>
            </div>
            {/* Scrubber */}
            <div
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const pos = (e.clientX - rect.left) / rect.width;
                if (effectiveDuration > 0) {
                  seek(pos * effectiveDuration, true);
                }
              }}
              className="relative w-full h-2 rounded-full bg-white/10 cursor-pointer overflow-hidden group"
            >
              {/* Indeterminate Shimmer Beam when Buffering */}
              {isBuffering && <div className="miki-timeline-buffering-beam z-10" />}
              <div
                className="h-full bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-500 transition-all rounded-full group-hover:brightness-125"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Right: Sound Controls & Drawers */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 transition-all">
              <button
                onClick={() => {
                  if (isMuted) {
                    if (volume === 0) {
                      handleVolumeChange(80);
                    } else {
                      setMuted(false);
                    }
                  } else {
                    setMuted(true);
                  }
                }}
                className="p-1 rounded-lg hover:bg-white/10 text-white/70 hover:text-white transition-colors cursor-pointer"
                title={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className="w-4 h-4 text-rose-400" />
                ) : volume < 50 ? (
                  <Volume1 className="w-4 h-4 text-white/80" />
                ) : (
                  <Volume2 className="w-4 h-4 text-cyan-400" />
                )}
              </button>

              <div className="relative flex items-center group/vol">
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="1"
                  value={isMuted ? 0 : volume}
                  onInput={(e) => handleVolumeChange(Number((e.target as HTMLInputElement).value))}
                  onChange={(e) => handleVolumeChange(Number(e.target.value))}
                  className="w-24 h-1.5 bg-white/20 rounded-full appearance-none cursor-pointer accent-cyan-400 hover:accent-cyan-300 transition-all"
                  title={`Volume: ${Math.round(isMuted ? 0 : volume)}%`}
                />
              </div>

              <span className="text-[10px] font-mono text-white/60 min-w-[28px] text-right font-medium">
                {isMuted ? '0%' : `${Math.round(volume)}%`}
              </span>

              {preampGain > 1.0 && (
                <span
                  onClick={onOpenEq}
                  className="hidden sm:inline-block text-[9px] font-mono px-1.5 py-0.5 rounded-md bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 font-bold cursor-pointer hover:bg-cyan-500/30 transition-all select-none"
                  title={`Preamp Boost Active: ${preampGain.toFixed(1)}x. Click to adjust.`}
                >
                  +{Math.round((preampGain - 1.0) * 100)}% BOOST
                </span>
              )}
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

      {/* Slide-In Synchronized Lyrics Drawer */}
      {isLyricsOpen && (
        <div className="absolute top-14 right-6 bottom-28 w-88 bg-slate-950/95 backdrop-blur-2xl border border-white/20 rounded-3xl p-5 z-30 shadow-2xl flex flex-col gap-3 animate-in slide-in-from-right duration-200">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-2">
              <MessageSquareText className="w-4 h-4 text-cyan-400" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-white/80">Synchronized Lyrics</h3>
              {lyricsData?.source && (
                <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
                  {lyricsData.source.toUpperCase()}
                </span>
              )}
            </div>
            <button
              onClick={() => setIsLyricsOpen(false)}
              className="p-1.5 rounded-xl hover:bg-white/10 text-white/40 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {isLoadingLyrics ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-3 text-white/50 py-12">
              <RefreshCw className="w-6 h-6 animate-spin text-cyan-400" />
              <p className="text-xs font-mono font-medium tracking-wide">Syncing real-time lyrics...</p>
            </div>
          ) : lyricsData?.syncedLyrics && lyricsData.syncedLyrics.length > 0 ? (
            <div className="flex-1 overflow-y-auto space-y-3 py-4 px-2 scroll-smooth">
              <div className="text-center pb-2 border-b border-white/5">
                <p className="text-xs font-bold text-white/90 truncate">{activeTrack?.title}</p>
                <p className="text-[11px] text-cyan-400/70 truncate">{activeTrack?.artist}</p>
              </div>
              {lyricsData.syncedLyrics.map((line, idx) => {
                const isPastOrCurrent = line.timeMs <= positionMs;
                const nextLine = lyricsData.syncedLyrics![idx + 1];
                const isActive = isPastOrCurrent && (!nextLine || nextLine.timeMs > positionMs);

                return (
                  <div
                    key={`${line.timeMs}-${idx}`}
                    ref={isActive ? activeLyricRef : null}
                    onClick={() => seek(line.timeMs, true)}
                    className={`cursor-pointer transition-all duration-300 px-3 py-2 rounded-xl text-center select-none ${
                      isActive
                        ? 'bg-gradient-to-r from-cyan-500/20 via-purple-500/20 to-pink-500/20 border border-cyan-400/40 text-cyan-300 font-bold text-sm scale-[1.03] shadow-[0_0_16px_rgba(6,182,212,0.3)]'
                        : isPastOrCurrent
                        ? 'text-white/80 text-xs hover:text-white hover:bg-white/5'
                        : 'text-white/35 text-xs hover:text-white/60 hover:bg-white/5'
                    }`}
                  >
                    <p className="leading-relaxed">{line.text || '♪'}</p>
                    <span className="text-[9px] font-mono text-white/20 mt-0.5 block">
                      {formatTime(line.timeMs)}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : lyricsData?.plainLyrics ? (
            <div className="flex-1 overflow-y-auto space-y-3 py-4 px-2 text-center">
              <div className="pb-2 border-b border-white/5">
                <p className="text-xs font-bold text-white/90 truncate">{activeTrack?.title}</p>
                <p className="text-[11px] text-cyan-400/70 truncate">{activeTrack?.artist}</p>
              </div>
              <div className="text-xs text-white/70 leading-relaxed whitespace-pre-line py-2">
                {lyricsData.plainLyrics}
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center py-12 px-4">
              <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-cyan-400">
                <Music className="w-6 h-6" />
              </div>
              <p className="text-sm font-bold text-white/90">Studio Instrumental Master</p>
              <p className="text-xs text-white/50 leading-relaxed max-w-[220px]">
                Lyrics are not published or track is an instrumental studio soundscape.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Custom Playlist Selection & Creation Modal */}
      {isPlaylistModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-3xl bg-slate-950 border border-white/15 p-6 shadow-2xl flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <ListPlus className="w-5 h-5 text-cyan-400" />
                <h3 className="text-base font-bold text-white">Add to Playlist</h3>
              </div>
              <button
                onClick={() => setIsPlaylistModalOpen(false)}
                className="p-1.5 rounded-xl hover:bg-white/10 text-white/40 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Create New Playlist */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (newPlaylistName.trim()) {
                  const newId = createPlaylist(newPlaylistName.trim());
                  if (activeTrack) {
                    addTrackToPlaylist(newId, {
                      id: activeTrack.id,
                      title: activeTrack.title,
                      artist: activeTrack.artist,
                      url: activeTrack.url,
                      coverUrl: activeTrack.albumArt,
                      durationSec: activeTrack.durationSec,
                    });
                    setPlaylistAddedTrackId(newId);
                    setTimeout(() => setPlaylistAddedTrackId(null), 2000);
                  }
                  setNewPlaylistName('');
                }
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                placeholder="New Playlist Name..."
                value={newPlaylistName}
                onChange={(e) => setNewPlaylistName(e.target.value)}
                className="flex-1 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder-white/30 focus:outline-none focus:border-cyan-400 transition-colors"
              />
              <button
                type="submit"
                disabled={!newPlaylistName.trim()}
                className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 text-slate-950 text-xs font-bold transition-all"
              >
                Create
              </button>
            </form>

            {/* Existing Playlists List */}
            <div className="max-h-60 overflow-y-auto space-y-2 py-2">
              <p className="text-[11px] font-mono uppercase tracking-wider text-white/40">Select Existing Playlist</p>
              {customPlaylists.length === 0 ? (
                <p className="text-xs text-white/30 italic py-4 text-center">No playlists created yet. Type a name above to create one!</p>
              ) : (
                customPlaylists.map((pl) => {
                  const isAdded = playlistAddedTrackId === pl.id;
                  return (
                    <div
                      key={pl.id}
                      onClick={() => {
                        if (activeTrack) {
                          addTrackToPlaylist(pl.id, {
                            id: activeTrack.id,
                            title: activeTrack.title,
                            artist: activeTrack.artist,
                            url: activeTrack.url,
                            coverUrl: activeTrack.albumArt,
                            durationSec: activeTrack.durationSec,
                          });
                          setPlaylistAddedTrackId(pl.id);
                          setTimeout(() => setPlaylistAddedTrackId(null), 2000);
                        }
                      }}
                      className="flex items-center justify-between p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 cursor-pointer transition-all group"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold text-xs shrink-0">
                          {pl.name.slice(0, 1).toUpperCase()}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="text-sm font-semibold text-white/90 truncate group-hover:text-cyan-300">
                            {pl.name}
                          </span>
                          <span className="text-[10px] text-white/40 font-mono">
                            {pl.tracks.length} {pl.tracks.length === 1 ? 'track' : 'tracks'}
                          </span>
                        </div>
                      </div>
                      {isAdded ? (
                        <span className="flex items-center gap-1 text-xs font-bold text-emerald-400 bg-emerald-500/20 px-2 py-1 rounded-lg">
                          <Check className="w-3.5 h-3.5" /> Added
                        </span>
                      ) : (
                        <span className="text-xs text-white/40 group-hover:text-white font-medium">
                          + Add
                        </span>
                      )}
                    </div>
                  );
                })
              )}
            </div>
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
