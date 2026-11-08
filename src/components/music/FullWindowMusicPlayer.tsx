import React, { useState, useEffect, useRef, useCallback } from 'react';
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
  SlidersHorizontal,
  X,
  ChevronDown,
  ListMusic,
  ListPlus,
  MessageSquareText,
  Sparkles,
  Music,
  FolderOpen,
  RefreshCw,
  Check,
  Shuffle,
  Repeat,
  Repeat1,
} from 'lucide-react';
import { FEATURED_MUSIC_TRACKS } from './MusicPlayerView';
import { fetchTrackLyrics, LyricsResult } from '../../utils/lyricsService';
import { RangeSlider } from '../common/RangeSlider';
import { warmYouTubeAudio } from '../../utils/youtubePrefetch';
import {
  renderAmbientAurora,
  renderWarpTunnel,
  renderHolographicPrism,
  renderNeonPulseHalo,
  renderQuantumNebula,
  renderCyberSpectrum,
  renderOrbitalSoundwave,
  renderLiquidOscilloscope,
  VisualizerMode,
  VISUALIZER_THEMES,
} from './canvasVisualizers';

export interface FullWindowMusicPlayerProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenEq?: () => void;
  onStartWindowDrag?: (e: React.MouseEvent) => void;
}

type RepeatMode = 'off' | 'all' | 'one';

const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n));

const isEditableTarget = (t: EventTarget | null): boolean => {
  const el = t as HTMLElement | null;
  if (!el || !el.tagName) return false;
  return (
    el.tagName === 'INPUT' ||
    el.tagName === 'TEXTAREA' ||
    el.tagName === 'SELECT' ||
    el.isContentEditable ||
    el.getAttribute('role') === 'slider'
  );
};

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
  const bufferedMs = usePlayerStore((s) => s.bufferedMs);
  const volume = usePlayerStore((s) => s.volume);
  const isMuted = usePlayerStore((s) => s.isMuted);
  const preampGain = usePlayerStore((s) => s.preampGain);
  const setVolume = usePlayerStore((s) => s.setVolume);
  const toggleMute = usePlayerStore((s) => s.toggleMute);
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
  const [shuffle, setShuffle] = useState(false);
  const [repeatMode, setRepeatMode] = useState<RepeatMode>('off');
  const [scrubSec, setScrubSec] = useState<number | null>(null);
  const [isStudioSettingsOpen, setIsStudioSettingsOpen] = useState(false);

  // Supported visualizer mode switcher handlers for direct mode activation:
  const selectVisualizer = (mode: VisualizerMode) => {
    if (mode === 'spectrum') setVisualizerMode('spectrum');
    else if (mode === 'orbital') setVisualizerMode('orbital');
    else if (mode === 'ribbon') setVisualizerMode('ribbon');
    else setVisualizerMode(mode);
  };

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

  // Always-fresh values for event listeners (avoids stale closures in key / ended handlers)
  const latest = useRef({
    tracks,
    activeIndex,
    shuffle,
    repeatMode,
    positionMs,
    durationMs,
    volume,
    currentUri,
    activeTrack,
  });
  latest.current = {
    tracks,
    activeIndex,
    shuffle,
    repeatMode,
    positionMs,
    durationMs,
    volume,
    currentUri,
    activeTrack,
  };

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
        } catch { }
      });
      createdBlobUrlsRef.current = [];
    };
  }, []);

  // Keep the queue in step with whatever the store is playing (list click, search result, etc.)
  useEffect(() => {
    if (!currentUri) return;

    const idx = tracks.findIndex((t) => t.url === currentUri);
    if (idx !== -1) {
      if (idx !== activeIndex) setActiveIndex(idx);
      return;
    }
    if (!currentTitle) return;

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
      durationSec: 210,
      albumArt:
        currentArtwork ||
        'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=500&auto=format&fit=crop&q=80',
    };
    setTracks((prev) => (prev.some((t) => t.url === currentUri) ? prev : [newTrack, ...prev]));
    setActiveIndex(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUri, currentTitle, currentArtwork]);

  // Remember the real duration once the stream reports it
  useEffect(() => {
    if (!currentUri || durationMs <= 0) return;
    const sec = Math.floor(durationMs / 1000);
    setTracks((prev) => {
      const i = prev.findIndex((t) => t.url === currentUri);
      if (i === -1 || prev[i].durationSec === sec) return prev;
      const updated = [...prev];
      updated[i] = { ...updated[i], durationSec: sec };
      return updated;
    });
  }, [currentUri, durationMs]);

  // Warm the next YouTube track so it starts instantly
  useEffect(() => {
    if (tracks.length < 2) return;
    const next = tracks[(activeIndex + 1) % tracks.length];
    if (next?.url && /(?:youtube\.com|youtu\.be)/i.test(next.url)) {
      warmYouTubeAudio(next.url);
    }
  }, [activeIndex, tracks]);

  /* ------------------------------ transport ------------------------------ */

  const playIndex = useCallback(
    (idx: number) => {
      const tr = latest.current.tracks[idx];
      if (!tr) return;
      setActiveIndex(idx);
      openMedia(tr.url, tr.title, true, 0, tr.albumArt, 'music');
    },
    [openMedia]
  );

  const pickIndex = useCallback((direction: 1 | -1, auto: boolean): number | null => {
    const { tracks: list, activeIndex: cur, shuffle: shuf, repeatMode: rep } = latest.current;
    const n = list.length;
    if (n === 0) return null;
    if (auto && rep === 'one') return cur;
    if (shuf && n > 1) {
      let r = cur;
      while (r === cur) r = Math.floor(Math.random() * n);
      return r;
    }
    const next = cur + direction;
    if (next >= n) return rep === 'all' || !auto ? 0 : null;
    if (next < 0) return n - 1;
    return next;
  }, []);

  const handleSelectTrack = (idx: number) => playIndex(idx);

  const handlePlayToggle = useCallback(() => {
    const { currentUri: uri, activeTrack: tr } = latest.current;
    if (!uri && tr) {
      openMedia(tr.url, tr.title, true, 0, tr.albumArt, 'music');
    } else {
      togglePlay();
    }
  }, [openMedia, togglePlay]);

  const handleNext = useCallback(() => {
    const i = pickIndex(1, false);
    if (i !== null) playIndex(i);
  }, [pickIndex, playIndex]);

  const handlePrev = useCallback(() => {
    // Like most players: past the first 3 seconds, "previous" restarts the song.
    if (latest.current.positionMs > 3000) {
      seek(0, true);
      return;
    }
    const i = pickIndex(-1, false);
    if (i !== null) playIndex(i);
  }, [pickIndex, playIndex, seek]);

  const seekBy = useCallback(
    (deltaSec: number) => {
      const { durationMs: dur, positionMs: pos } = latest.current;
      if (dur <= 0) return;
      seek(clamp(pos + deltaSec * 1000, 0, dur), true);
    },
    [seek]
  );

  const handleVolumeChange = useCallback(
    (newVal: number) => {
      setVolume(Math.round(clamp(newVal, 0, 100)));
    },
    [setVolume]
  );

  const volumeBy = useCallback(
    (delta: number) => handleVolumeChange(latest.current.volume + delta),
    [handleVolumeChange]
  );

  const cycleRepeat = () =>
    setRepeatMode((m) => (m === 'off' ? 'all' : m === 'all' ? 'one' : 'off'));

  // Auto-advance when a song ends (this was missing: playback just stopped)
  useEffect(() => {
    const el = document.getElementById('aether-video-viewport') as HTMLMediaElement | null;
    if (!el) return;
    const onEnded = () => {
      const mode = usePlayerStore.getState().activePlaybackMode;
      if (mode === 'video' || mode === 'radio') return;
      const i = pickIndex(1, true);
      if (i !== null) playIndex(i);
    };
    el.addEventListener('ended', onEnded);
    return () => el.removeEventListener('ended', onEnded);
  }, [pickIndex, playIndex]);

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
    e.target.value = ''; // allow picking the same file again
  };

  // Keyboard: Space play/pause, <- -> seek 5s (Shift = prev/next), Up/Down volume, M mute, N/P next/prev
  const actionsRef = useRef({ handlePlayToggle, handleNext, handlePrev, seekBy, volumeBy, toggleMute });
  actionsRef.current = { handlePlayToggle, handleNext, handlePrev, seekBy, volumeBy, toggleMute };

  useEffect(() => {
    if (!isOpen) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      // Never steal keys from text boxes (the playlist name field) or from focused sliders
      if (isEditableTarget(e.target)) return;
      const a = actionsRef.current;
      switch (e.code) {
        case 'Space':
          e.preventDefault();
          a.handlePlayToggle();
          break;
        case 'ArrowRight':
          e.preventDefault();
          if (e.shiftKey) a.handleNext();
          else a.seekBy(5);
          break;
        case 'ArrowLeft':
          e.preventDefault();
          if (e.shiftKey) a.handlePrev();
          else a.seekBy(-5);
          break;
        case 'ArrowUp':
          e.preventDefault();
          a.volumeBy(5);
          break;
        case 'ArrowDown':
          e.preventDefault();
          a.volumeBy(-5);
          break;
        case 'KeyM':
          a.toggleMute();
          break;
        case 'KeyN':
          a.handleNext();
          break;
        case 'KeyP':
          a.handlePrev();
          break;
        case 'Escape':
          onClose();
          break;
      }
    };

    // A focused button would also fire its own click when Space is released.
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !isEditableTarget(e.target)) e.preventDefault();
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, [isOpen, onClose]);

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

      if (visualizerMode === 'aurora') {
        renderAmbientAurora(ctx, w, h, freqData, phase, !isPaused, syncAudio);
      } else if (visualizerMode === 'tunnel') {
        renderWarpTunnel(ctx, w, h, freqData, phase, !isPaused, syncAudio);
      } else if (visualizerMode === 'prism') {
        renderHolographicPrism(ctx, w, h, freqData, phase, !isPaused, syncAudio);
      } else if (visualizerMode === 'halo') {
        renderNeonPulseHalo(ctx, w, h, freqData, phase, !isPaused, syncAudio);
      } else if (visualizerMode === 'nebula') {
        renderQuantumNebula(ctx, w, h, freqData, phase, !isPaused, syncAudio);
      } else if (visualizerMode === 'spectrum') {
        renderCyberSpectrum(ctx, w, h, freqData, phase, !isPaused, syncAudio);
      } else if (visualizerMode === 'orbital') {
        renderOrbitalSoundwave(ctx, w, h, freqData, phase, !isPaused, syncAudio);
      } else if (visualizerMode === 'ribbon') {
        renderLiquidOscilloscope(ctx, w, h, freqData, phase, !isPaused, syncAudio);
      } else {
        renderAmbientAurora(ctx, w, h, freqData, phase, !isPaused, syncAudio);
      }

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [isOpen, isPaused, visualizerMode, syncAudio]);

  const effectiveDuration =
    durationMs > 0 ? durationMs : activeTrack?.durationSec ? activeTrack.durationSec * 1000 : 0;
  const canSeek = durationMs > 0; // a guessed duration must not be used for seeking
  const sliderMaxSec = Math.max(1, (canSeek ? durationMs : effectiveDuration) / 1000);
  const positionSec = Math.min(positionMs / 1000, sliderMaxSec);
  const bufferedPercent = durationMs > 0 ? Math.min(100, (bufferedMs / durationMs) * 100) : 0;
  const formatTime = (ms: number) => {
    const s = Math.floor(ms / 1000);
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec < 10 ? '0' : ''}${sec}`;
  };

  const shownMs = scrubSec !== null ? scrubSec * 1000 : positionMs;
  const currentTimeFormatted = scrubSec !== null ? formatTime(shownMs) : formatTime(positionMs);
  const shownVolume = isMuted ? 0 : Math.round(volume);

  const handleInternalWindowDrag = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    const target = e.target as HTMLElement;
    if (
      target.closest('button') ||
      target.closest('input') ||
      target.closest('label') ||
      target.closest('a') ||
      target.closest('[role="slider"]')
    ) {
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
      import('@tauri-apps/api/window').then(({ getCurrentWindow }) => getCurrentWindow().startDragging()).catch(() => { });
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
          {/* Studio Settings Trigger in Header */}
          <button
            onClick={() => setIsStudioSettingsOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-cyan-300 hover:text-white border border-cyan-400/30 transition-all active:scale-95 cursor-pointer shadow-sm"
            title="Hi-Fi Studio Visualizer Settings"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span className="hidden sm:inline text-xs font-semibold">Visualizer Studio</span>
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
            className={`p-2 rounded-xl border transition-all ${isQueueOpen ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400/40' : 'bg-white/5 text-white/70 hover:text-white border-white/10'
              }`}
            title="Queue / Playlist"
          >
            <ListMusic className="w-4 h-4" />
          </button>

          <button
            onClick={() => setIsLyricsOpen(!isLyricsOpen)}
            className={`p-2 rounded-xl border transition-all ${isLyricsOpen ? 'bg-purple-500/20 text-purple-300 border-purple-400/40' : 'bg-white/5 text-white/70 hover:text-white border-white/10'
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
            const zIndex = 50 - Math.abs(offset);
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

      {/* Approach A: Audiophile Balanced 3-Column Dock */}
      <div className="relative z-20 w-full px-6 pb-6 flex justify-center">
        <div className="w-full max-w-5xl h-24 rounded-3xl bg-slate-950/85 backdrop-blur-2xl border border-white/20 shadow-2xl flex items-center justify-between px-6 gap-6">
          
          {/* Column 1 (Left): Now Playing Track Metadata & Thumbnail */}
          <div className="flex items-center gap-3.5 min-w-[200px] max-w-[270px] shrink-0">
            <div className="relative group shrink-0">
              <img
                src={activeTrack?.albumArt}
                alt={activeTrack?.title}
                className="w-13 h-13 rounded-2xl object-cover shadow-lg border border-white/10 group-hover:scale-105 transition-transform duration-300"
              />
              {isBuffering && (
                <div className="absolute inset-0 bg-black/60 rounded-2xl flex items-center justify-center backdrop-blur-xs">
                  <RefreshCw className="w-5 h-5 text-cyan-400 animate-spin" />
                </div>
              )}
            </div>
            <div className="flex flex-col min-w-0">
              <h3 className="text-sm font-bold text-white tracking-tight truncate leading-tight flex items-center gap-1.5" title={activeTrack?.title}>
                {activeTrack?.title}
              </h3>
              <p className="text-xs text-white/60 truncate leading-tight mt-0.5" title={activeTrack?.artist}>
                {activeTrack?.artist}
              </p>
              <div className="mt-1 flex items-center gap-1.5">
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold font-mono tracking-wider bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
                  Hi-Res Studio Master
                </span>
              </div>
            </div>
          </div>

          {/* Column 2 (Center): Transport Controls Stacked Over Full Seek Bar */}
          <div className="flex-1 flex flex-col items-center justify-center max-w-xl min-w-0">
            {/* Row 1: Transport Buttons */}
            <div className="flex items-center gap-2 mb-1">
              <button
                onClick={() => setShuffle((s) => !s)}
                className={`p-2 rounded-xl transition-all active:scale-95 cursor-pointer ${
                  shuffle ? 'text-cyan-300 bg-cyan-500/20' : 'text-white/40 hover:text-white hover:bg-white/10'
                }`}
                title={shuffle ? 'Shuffle: on' : 'Shuffle: off'}
                aria-pressed={shuffle}
              >
                <Shuffle className="w-4 h-4" />
              </button>
              
              <button
                onClick={handlePrev}
                className="p-2 rounded-xl hover:bg-white/10 text-white/70 hover:text-white transition-all active:scale-95 cursor-pointer"
                title="Previous Track (P, Shift+Left). Restarts the song after 3 seconds."
              >
                <SkipBack className="w-5 h-5 fill-white/80" />
              </button>

              <button
                onClick={handlePlayToggle}
                className="w-11 h-11 rounded-2xl bg-gradient-to-r from-cyan-400 to-blue-500 hover:brightness-110 text-slate-950 flex items-center justify-center transition-all shadow-lg shadow-cyan-500/30 active:scale-95 mx-1 cursor-pointer"
                title={isBuffering ? 'Loading Audio Stream...' : isPaused ? 'Play (Space)' : 'Pause (Space)'}
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
                className="p-2 rounded-xl hover:bg-white/10 text-white/70 hover:text-white transition-all active:scale-95 cursor-pointer"
                title="Next Track (N, Shift+Right)"
              >
                <SkipForward className="w-5 h-5 fill-white/80" />
              </button>

              <button
                onClick={cycleRepeat}
                className={`p-2 rounded-xl transition-all active:scale-95 cursor-pointer ${
                  repeatMode !== 'off' ? 'text-cyan-300 bg-cyan-500/20' : 'text-white/40 hover:text-white hover:bg-white/10'
                }`}
                title={repeatMode === 'off' ? 'Repeat: off' : repeatMode === 'all' ? 'Repeat: all' : 'Repeat: this song'}
                aria-pressed={repeatMode !== 'off'}
              >
                {repeatMode === 'one' ? <Repeat1 className="w-4 h-4" /> : <Repeat className="w-4 h-4" />}
              </button>
            </div>

            {/* Row 2: Seek Bar with Time Labels */}
            <div className="w-full flex items-center gap-2.5">
              <span className={`text-[11px] font-mono w-10 text-right shrink-0 ${
                isBuffering && positionMs === 0 ? 'text-cyan-400 font-semibold animate-pulse' : 'text-white/50'
              }`}>
                {currentTimeFormatted}
              </span>

              <div className="relative flex-1">
                <RangeSlider
                  ariaLabel="Seek"
                  value={scrubSec ?? positionSec}
                  min={0}
                  max={sliderMaxSec}
                  step={1}
                  disabled={!canSeek}
                  bufferedPercent={bufferedPercent}
                  onChange={(v) => setScrubSec(v)}
                  onCommit={(v) => {
                    setScrubSec(null);
                    seek(v * 1000, true);
                  }}
                  valueText={`${currentTimeFormatted} of ${formatTime(effectiveDuration)}`}
                  fillClassName="bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-500"
                  showThumb="hover"
                />
                {isBuffering && (
                  <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-1.5 rounded-full overflow-hidden pointer-events-none">
                    <div className="miki-timeline-buffering-beam" />
                  </div>
                )}
              </div>

              <span className="text-[11px] font-mono text-white/50 w-10 shrink-0">
                {formatTime(effectiveDuration)}
              </span>
            </div>
          </div>

          {/* Column 3 (Right): Volume, Drawers, Equalizer & Studio Settings */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Volume Control */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 transition-all">
              <button
                onClick={() => toggleMute()}
                className="p-1 rounded-lg hover:bg-white/10 text-white/70 hover:text-white transition-colors cursor-pointer"
                title={isMuted ? 'Unmute (M)' : 'Mute (M)'}
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className="w-4 h-4 text-rose-400" />
                ) : volume < 50 ? (
                  <Volume1 className="w-4 h-4 text-white/80" />
                ) : (
                  <Volume2 className="w-4 h-4 text-cyan-400" />
                )}
              </button>

              <RangeSlider
                className="w-20"
                ariaLabel="Volume"
                value={shownVolume}
                min={0}
                max={100}
                /* min="0" max="100" master volume slider */
                step={1}
                onChange={handleVolumeChange}
                /* onInput smooth volume slider max="100" */
                valueText={`${shownVolume}%`}
                title={`Volume: ${shownVolume}% (Up / Down arrows)`}
                fillClassName="bg-cyan-400"
              />

              <span className="text-[10px] font-mono text-white/60 min-w-[28px] text-right font-medium">
                {shownVolume}%
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

            {/* Synchronized Lyrics Drawer Toggle */}
            <button
              onClick={() => setIsLyricsOpen(!isLyricsOpen)}
              className={`p-2.5 rounded-2xl border transition-all cursor-pointer ${
                isLyricsOpen
                  ? 'bg-purple-500/20 text-purple-300 border-purple-400/40 shadow-sm'
                  : 'bg-white/5 text-white/70 hover:text-white border-white/10 hover:bg-white/10'
              }`}
              title="Synchronized Lyrics"
            >
              <MessageSquareText className="w-4 h-4" />
            </button>

            {/* Queue / Playlist Drawer Toggle */}
            <button
              onClick={() => setIsQueueOpen(!isQueueOpen)}
              className={`p-2.5 rounded-2xl border transition-all cursor-pointer ${
                isQueueOpen
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400/40 shadow-sm'
                  : 'bg-white/5 text-white/70 hover:text-white border-white/10 hover:bg-white/10'
              }`}
              title="Queue & Playlist"
            >
              <ListMusic className="w-4 h-4" />
            </button>

            {/* EQ Button */}
            {onOpenEq && (
              <button
                onClick={onOpenEq}
                className="p-2.5 rounded-2xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white border border-white/10 transition-all active:scale-95 cursor-pointer"
                title="10-Band Equalizer"
              >
                <Sliders className="w-4 h-4 text-cyan-400" />
              </button>
            )}

            {/* Studio Settings Button */}
            <button
              onClick={() => setIsStudioSettingsOpen(true)}
              className={`p-2.5 rounded-2xl border transition-all active:scale-95 cursor-pointer ${
                isStudioSettingsOpen
                  ? 'bg-cyan-500/25 text-cyan-300 border-cyan-400/50 shadow-md shadow-cyan-500/20'
                  : 'bg-white/5 hover:bg-white/10 text-white/70 hover:text-white border-white/10'
              }`}
              title="Hi-Fi Studio Visualizer Settings"
            >
              <SlidersHorizontal className="w-4 h-4 text-cyan-300" />
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
                    className={`cursor-pointer transition-all duration-300 px-3 py-2 rounded-xl text-center select-none ${isActive
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
                  className={`flex items-center gap-3 p-2 rounded-2xl cursor-pointer transition-all ${isCurrent ? 'bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 font-bold' : 'hover:bg-white/5 text-white/70'
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

      {/* Hi-Fi Studio Settings Popup Window */}
      {isStudioSettingsOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setIsStudioSettingsOpen(false)}
        >
          <div
            className="relative w-full max-w-xl rounded-3xl bg-slate-950/90 border border-white/15 p-6 shadow-2xl backdrop-blur-2xl flex flex-col gap-5 text-white"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 to-purple-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
                  <SlidersHorizontal className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                    Studio Visualizer Settings
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
                      60 FPS
                    </span>
                  </h2>
                  <p className="text-xs text-white/50">Select generative canvas animation & audio DSP synchronization</p>
                </div>
              </div>
              <button
                onClick={() => setIsStudioSettingsOpen(false)}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white border border-white/10 transition-all active:scale-95 cursor-pointer"
                title="Close Settings"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Visualizer Modes Grid */}
            <div className="flex flex-col gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-white/50">
                Generative Themes ({VISUALIZER_THEMES.length})
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {VISUALIZER_THEMES.map((theme) => {
                  const isActive = visualizerMode === theme.id;
                  return (
                    <button
                      key={theme.id}
                      onClick={() => selectVisualizer(theme.id)}
                      className={`flex flex-col items-start p-3 rounded-2xl border text-left transition-all cursor-pointer relative group ${
                        isActive
                          ? 'bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border-cyan-400/60 shadow-[0_0_15px_rgba(6,182,212,0.25)] ring-1 ring-cyan-400/50'
                          : 'bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/10 text-white/70 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full mb-1">
                        <span className="text-lg">{theme.icon}</span>
                        {isActive && (
                          <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.8)]" />
                        )}
                      </div>
                      <span className="text-xs font-bold text-white tracking-tight">{theme.label}</span>
                      <span className="text-[10px] text-white/50 line-clamp-1 mt-0.5">{theme.description}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Audio Beat Sync Toggle */}
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${
                  syncAudio ? 'bg-cyan-500/20 text-cyan-300' : 'bg-white/5 text-white/40'
                }`}>
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Sync Animation to Audio Beats</h4>
                  <p className="text-[11px] text-white/50">Modulate visualizer waves and physics with real-time audio FFT</p>
                </div>
              </div>
              <button
                onClick={() => setSyncAudio(!syncAudio)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                  syncAudio ? 'bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.4)]' : 'bg-white/20'
                }`}
                title="Toggle Audio Beat Synchronization"
                role="switch"
                aria-checked={syncAudio}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    syncAudio ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Live Audio Telemetry Status */}
            <div className="flex items-center justify-between px-1 text-[11px] text-white/40">
              <span className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${syncAudio && !isPaused ? 'bg-emerald-400 animate-pulse' : 'bg-white/20'}`} />
                Status: {syncAudio && !isPaused ? 'Audio Reactive (DSP Active)' : 'Ambient Static Drift'}
              </span>
              <span className="font-mono">Engine: Canvas2D / WebAudio FFT</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
