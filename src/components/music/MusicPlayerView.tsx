import React, { useState, useEffect, useRef } from 'react';
import {
  MusicAudioEngine,
  MusicTrack,
  MusicEqualizerPreset,
  MUSIC_PRESETS,
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
    artist: 'Miki Hi-Fi Studio',
    url: 'https://raw.githubusercontent.com/rafaelreis-hotmart/Audio-Sample-files/master/sample.mp3',
    durationSec: 142,
    albumArt: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'music-analog-chillwave',
    title: 'Deep Analog Chillwave Groove',
    artist: 'Antigravity Resonance',
    url: 'https://raw.githubusercontent.com/rafaelreis-hotmart/Audio-Sample-files/master/sample2.mp3',
    durationSec: 96,
    albumArt: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'music-neon-retrowave',
    title: 'Neon Horizon Retrowave Drive',
    artist: 'Aether Audio Lab',
    url: 'https://ice1.somafm.com/groovesalad-128-mp3',
    durationSec: 120,
    albumArt: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=400&q=80',
  },
];

export const MusicPlayerView: React.FC = () => {
  const engineRef = useRef<MusicAudioEngine | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);

  const [tracks, setTracks] = useState<MusicTrack[]>(FEATURED_MUSIC_TRACKS);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1.0);
  const [bassBoost, setBassBoost] = useState(true);
  const [activePreset, setActivePreset] = useState<MusicEqualizerPreset>('Bass Boost');

  const currentTrack = tracks[currentTrackIndex];

  useEffect(() => {
    const engine = new MusicAudioEngine();
    engineRef.current = engine;

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  // Visualizer Animation Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const render = () => {
      const engine = engineRef.current;
      if (engine && isPlaying) {
        const freqData = engine.getByteFrequencyData();
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const barWidth = (canvas.width / freqData.length) * 2.2;
        let x = 0;

        for (let i = 0; i < freqData.length / 2; i++) {
          const val = freqData[i] || 0;
          const barHeight = (val / 255) * canvas.height;

          // Gradient bar
          const grad = ctx.createLinearGradient(0, canvas.height - barHeight, 0, canvas.height);
          grad.addColorStop(0, '#f43f5e'); // Rose
          grad.addColorStop(0.5, '#a855f7'); // Purple
          grad.addColorStop(1, '#06b6d4'); // Cyan

          ctx.fillStyle = grad;
          ctx.fillRect(x, canvas.height - barHeight, barWidth - 1.5, barHeight);
          x += barWidth;
        }

        setCurrentTime(engine.getCurrentTime());
        setDuration(engine.getDuration());
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
    if (engineRef.current && track) {
      await engineRef.current.loadTrack(track);
      setIsPlaying(true);
    }
  };

  const handleTogglePlay = async () => {
    if (!engineRef.current) return;
    if (!isPlaying && !engineRef.current.currentTrack) {
      await handlePlayTrack(currentTrackIndex);
    } else {
      await engineRef.current.togglePlay();
      setIsPlaying(engineRef.current.isPlaying);
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
    const pos = parseFloat(e.target.value);
    setCurrentTime(pos);
    engineRef.current?.seek(pos);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const vol = parseFloat(e.target.value);
    setVolume(vol);
    engineRef.current?.setVolume(vol);
  };

  const handleToggleBassBoost = () => {
    const next = !bassBoost;
    setBassBoost(next);
    engineRef.current?.setBassBoost(next);
  };

  const handlePresetSelect = (preset: MusicEqualizerPreset) => {
    setActivePreset(preset);
    engineRef.current?.applyPreset(preset);
  };

  const handleLoadLocalAudio = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const localUrl = URL.createObjectURL(file);
      const newTrack: MusicTrack = {
        id: `local-${Date.now()}`,
        title: file.name.replace(/\.[^/.]+$/, ''),
        artist: 'Local Music Track',
        url: localUrl,
        durationSec: 180,
      };
      setTracks((prev) => [newTrack, ...prev]);
      handlePlayTrack(0);
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
            value={volume}
            onChange={handleVolumeChange}
            className="w-20 h-1.5 bg-white/10 rounded-full appearance-none accent-purple-500 cursor-pointer"
          />
          <span className="text-[10px] font-mono text-white/60">{(volume * 100).toFixed(0)}%</span>
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
