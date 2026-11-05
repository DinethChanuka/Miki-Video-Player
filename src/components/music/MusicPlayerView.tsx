import React, { useState, useEffect, useRef } from 'react';
import { usePlayerStore } from '../../store/playerStore';
import {
  MUSIC_PRESETS,
  MusicEqualizerPreset,
  MusicTrack,
} from '../../core/MusicAudioEngine';
import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Volume2,
  Zap,
  FolderOpen,
} from 'lucide-react';

export const FEATURED_MUSIC_TRACKS: MusicTrack[] = [
  {
    id: 'music-synth-odyssey',
    title: 'Ambient Cyberpunk Synth Odyssey',
    artist: 'Mythium Audio Project',
    url: 'https://archive.org/download/mythium/PNY04-05_M.mp3',
    durationSec: 142,
    albumArt: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'music-analog-chillwave',
    title: 'Deep Analog Chillwave Groove',
    artist: 'Mythium Sessions',
    url: 'https://archive.org/download/mythium/PNY04-05_OTW.mp3',
    durationSec: 186,
    albumArt: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'music-neon-retrowave',
    title: 'Neon Horizon Retrowave Drive',
    artist: 'Mythium Lab',
    url: 'https://archive.org/download/mythium/BSFM_ATKM.mp3',
    durationSec: 210,
    albumArt: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=400&q=80',
  },
];

export const MusicPlayerView: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const previousBlobUrlRef = useRef<string | null>(null);

  // Authoritative Player Store Integration
  const currentUri = usePlayerStore((s) => s.currentUri);
  const isPaused = usePlayerStore((s) => s.isPaused);
  const positionMs = usePlayerStore((s) => s.positionMs);
  const durationMs = usePlayerStore((s) => s.durationMs);
  const storeVolume = usePlayerStore((s) => s.volume);
  const openMedia = usePlayerStore((s) => s.openMedia);
  const togglePlay = usePlayerStore((s) => s.togglePlay);
  const seek = usePlayerStore((s) => s.seek);
  const setStoreVolume = usePlayerStore((s) => s.setVolume);
  const setEqualizer = usePlayerStore((s) => s.setEqualizer);

  const [tracks, setTracks] = useState<MusicTrack[]>(FEATURED_MUSIC_TRACKS);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [bassBoost, setBassBoost] = useState(true);
  const [activePreset, setActivePreset] = useState<MusicEqualizerPreset>('Bass Boost');

  const isPlaying = !isPaused && Boolean(currentUri);
  const currentTime = positionMs / 1000;
  const duration = durationMs > 0 ? durationMs / 1000 : (tracks[currentTrackIndex]?.durationSec || 180);
  const currentTrack = tracks[currentTrackIndex] || FEATURED_MUSIC_TRACKS[0];

  // Match currentUri to tracks array if already active
  useEffect(() => {
    if (currentUri) {
      const idx = tracks.findIndex((t) => t.url === currentUri);
      if (idx !== -1) {
        setCurrentTrackIndex(idx);
      }
    }
  }, [currentUri, tracks]);

  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      if (previousBlobUrlRef.current) {
        URL.revokeObjectURL(previousBlobUrlRef.current);
      }
    };
  }, []);

  // Visualizer Animation Loop (Driven by authoritative playback state)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let phase = 0;
    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const barCount = 36;
      const barWidth = canvas.width / barCount;

      if (isPlaying) {
        phase += 0.08;
      }

      for (let i = 0; i < barCount; i++) {
        let barHeight = 4;
        if (isPlaying) {
          const wave = Math.sin(phase + i * 0.35) * 0.5 + 0.5;
          const harmonic = Math.cos(phase * 1.5 + i * 0.2) * 0.3 + 0.3;
          const heightFactor = (wave + harmonic) * 0.85;
          barHeight = Math.max(6, heightFactor * canvas.height * 0.9);
        }

        const x = i * barWidth;
        const grad = ctx.createLinearGradient(0, canvas.height - barHeight, 0, canvas.height);
        grad.addColorStop(0, '#f43f5e'); // Rose
        grad.addColorStop(0.5, '#a855f7'); // Purple
        grad.addColorStop(1, '#06b6d4'); // Cyan

        ctx.fillStyle = grad;
        ctx.fillRect(x, canvas.height - barHeight, barWidth - 2, barHeight);
      }

      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isPlaying]);

  const handlePlayTrack = async (index: number) => {
    setCurrentTrackIndex(index);
    const track = tracks[index];
    if (track) {
      await openMedia(track.url, `${track.title} - ${track.artist}`, true, 0, track.albumArt, 'music');
    }
  };

  const handleTogglePlay = async () => {
    if (!currentUri) {
      await handlePlayTrack(currentTrackIndex);
    } else {
      await togglePlay();
    }
  };

  const handleNext = () => {
    const nextIdx = (currentTrackIndex + 1) % tracks.length;
    handlePlayTrack(nextIdx);
  };

  const handlePrev = () => {
    const prevIdx = (currentTrackIndex - 1 + tracks.length) % tracks.length;
    handlePlayTrack(prevIdx);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const posSec = parseFloat(e.target.value);
    seek(posSec * 1000);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const vol = parseFloat(e.target.value);
    setStoreVolume(vol);
  };

  const handleToggleBassBoost = () => {
    const next = !bassBoost;
    setBassBoost(next);
    const currentGains = [...MUSIC_PRESETS[activePreset]];
    if (next) {
      currentGains[0] += 4;
      currentGains[1] += 3;
    }
    setEqualizer(currentGains, false);
  };

  const handlePresetSelect = (preset: MusicEqualizerPreset) => {
    setActivePreset(preset);
    const gains = [...MUSIC_PRESETS[preset]];
    if (bassBoost) {
      gains[0] += 4;
      gains[1] += 3;
    }
    setEqualizer(gains, false);
  };

  const handleLoadLocalAudio = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (previousBlobUrlRef.current) {
        URL.revokeObjectURL(previousBlobUrlRef.current);
      }
      const localUrl = URL.createObjectURL(file);
      previousBlobUrlRef.current = localUrl;
      const newTrack: MusicTrack = {
        id: `local-${Date.now()}`,
        title: file.name.replace(/\.[^/.]+$/, ''),
        artist: 'Local Music Track',
        url: localUrl,
        durationSec: 180,
      };
      setTracks((prev) => [newTrack, ...prev]);
      setCurrentTrackIndex(0);
      openMedia(localUrl, newTrack.title, true, 0, undefined, 'music');
    }
  };

  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col gap-4 w-full h-full py-1">
      {/* Visualizer & Now Playing Hero */}
      <div className="relative rounded-3xl p-5 bg-gradient-to-br from-purple-950/40 via-slate-900 to-black border border-white/10 flex flex-col md:flex-row items-center gap-5 shadow-2xl overflow-hidden">
        {/* Album Art Cover */}
        <div className="relative w-32 h-32 rounded-2xl overflow-hidden bg-black/60 border border-white/15 shrink-0 shadow-lg group">
          <img
            src={currentTrack.albumArt || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=400&q=80'}
            alt={currentTrack.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={handleTogglePlay}
              className="p-3 rounded-full bg-rose-500 text-white shadow-xl"
            >
              {isPlaying ? <Pause className="w-5 h-5 fill-white" /> : <Play className="w-5 h-5 fill-white translate-x-0.5" />}
            </button>
          </div>
        </div>

        {/* Track Metadata & Realtime Visualizer Canvas */}
        <div className="flex flex-col justify-between flex-1 w-full gap-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-rose-400 font-bold">
                Hi-Fi Music Engine Active
              </span>
              <h3 className="text-base font-extrabold text-white truncate max-w-sm">
                {currentTrack.title}
              </h3>
              <p className="text-xs text-slate-300 font-medium">{currentTrack.artist}</p>
            </div>

            <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-white/80 cursor-pointer transition-all shrink-0">
              <FolderOpen className="w-3.5 h-3.5 text-cyan-400" />
              <span>Import Audio</span>
              <input
                type="file"
                accept="audio/*,.mp3,.flac,.wav,.m4a,.aac,.ogg,.opus"
                className="hidden"
                onChange={handleLoadLocalAudio}
              />
            </label>
          </div>

          {/* Realtime Spectrum Visualizer Canvas */}
          <div className="w-full h-14 rounded-xl bg-black/40 border border-white/10 overflow-hidden flex items-center justify-center">
            <canvas ref={canvasRef} width={400} height={56} className="w-full h-full" />
          </div>

          {/* Track Progress Scrubber */}
          <div className="flex flex-col gap-1 w-full">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono text-white/50">{formatSeconds(currentTime)}</span>
              <input
                type="range"
                min={0}
                max={duration > 0 ? duration : 100}
                value={currentTime}
                onChange={handleSeek}
                className="flex-1 h-1.5 bg-white/10 rounded-full appearance-none accent-rose-500 cursor-pointer"
              />
              <span className="text-[10px] font-mono text-white/50">{formatSeconds(duration)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* DSP Equalizer Presets & Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-white/5 border border-white/10">
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrev}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/80 transition-colors"
            title="Previous"
          >
            <SkipBack className="w-4 h-4" />
          </button>
          <button
            onClick={handleTogglePlay}
            className="p-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-purple-600 text-white font-bold shadow-md transition-all active:scale-95"
          >
            {isPlaying ? <Pause className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 fill-white translate-x-0.5" />}
          </button>
          <button
            onClick={handleNext}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/80 transition-colors"
            title="Next"
          >
            <SkipForward className="w-4 h-4" />
          </button>

          <button
            onClick={handleToggleBassBoost}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ml-2 ${
              bassBoost
                ? 'bg-rose-500/25 border-rose-400/50 text-rose-300 shadow-sm'
                : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10'
            }`}
          >
            <Zap className={`w-3.5 h-3.5 ${bassBoost ? 'fill-rose-400' : ''}`} />
            <span>Bass Boost</span>
          </button>
        </div>

        {/* Equalizer Presets */}
        <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
          <span className="text-[10px] text-white/40 uppercase font-mono mr-1">Preset:</span>
          {(Object.keys(MUSIC_PRESETS) as MusicEqualizerPreset[]).map((preset) => (
            <button
              key={preset}
              onClick={() => handlePresetSelect(preset)}
              className={`px-2.5 py-1 rounded-xl font-semibold border transition-all shrink-0 ${
                activePreset === preset
                  ? 'bg-purple-500/25 border-purple-400/50 text-purple-300'
                  : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
              }`}
            >
              {preset}
            </button>
          ))}
        </div>

        {/* Volume */}
        <div className="flex items-center gap-2">
          <Volume2 className="w-4 h-4 text-white/50" />
          <input
            type="range"
            min={0}
            max={2.0}
            step={0.05}
            value={storeVolume}
            onChange={handleVolumeChange}
            className="w-20 h-1.5 bg-white/10 rounded-full appearance-none accent-purple-500 cursor-pointer"
          />
          <span className="text-[10px] font-mono text-white/60">{(storeVolume * 100).toFixed(0)}%</span>
        </div>
      </div>

      {/* Playlist Queue */}
      <div className="flex flex-col gap-2">
        <span className="text-xs font-bold text-white/70 uppercase tracking-wider font-mono">
          Music Queue ({tracks.length})
        </span>

        <div className="flex flex-col gap-1.5 max-h-52 overflow-y-auto pr-1">
          {tracks.map((track, idx) => (
            <div
              key={track.id}
              onClick={() => handlePlayTrack(idx)}
              className={`flex items-center justify-between p-3 rounded-2xl border transition-all cursor-pointer group ${
                currentTrackIndex === idx
                  ? 'bg-purple-500/15 border-purple-400/40 text-purple-300'
                  : 'bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/10 text-white'
              }`}
            >
              <div className="flex items-center gap-3 truncate">
                <span className="text-xs font-mono text-white/40 w-4">{idx + 1}</span>
                <div className="flex flex-col truncate">
                  <span className="text-xs font-bold truncate group-hover:text-purple-300 transition-colors">
                    {track.title}
                  </span>
                  <span className="text-[10px] text-slate-400 truncate">{track.artist}</span>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <span className="text-[10px] font-mono text-white/50">
                  {formatSeconds(track.durationSec)}
                </span>
                <div
                  className={`p-1.5 rounded-xl ${
                    currentTrackIndex === idx && isPlaying
                      ? 'bg-rose-500 text-white'
                      : 'bg-white/5 text-white/50 group-hover:text-white'
                  }`}
                >
                  {currentTrackIndex === idx && isPlaying ? (
                    <Pause className="w-3.5 h-3.5" />
                  ) : (
                    <Play className="w-3.5 h-3.5" />
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
