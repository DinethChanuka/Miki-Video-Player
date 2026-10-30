import React, { useRef, useEffect, useState, useCallback } from 'react';
import { usePlayerStore } from '../../store/playerStore';
import { PLAYER_THEMES } from '../../types/theme';
import { SpeakerLevels, SpatialProfileId } from '../../core/SpatialAudioEngine';
import {
  X,
  Headphones,
  Volume2,
  VolumeX,
  Radio,
  RotateCcw,
  Sparkles,
  ShieldCheck,
  Compass,
} from 'lucide-react';

interface SpatialAudioModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SpatialAudioModal: React.FC<SpatialAudioModalProps> = ({ isOpen, onClose }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isDraggingRef = useRef(false);

  const themeId = usePlayerStore((s) => s.themeId);
  const theme = PLAYER_THEMES[themeId] || PLAYER_THEMES.cyberpunk;

  const spatialState = usePlayerStore((s) => s.spatialState);
  const setSpatialAudioEnabled = usePlayerStore((s) => s.setSpatialAudioEnabled);
  const setSpatialProfile = usePlayerStore((s) => s.setSpatialProfile);
  const setSpatialCoordinates = usePlayerStore((s) => s.setSpatialCoordinates);
  const setSpeakerVolume = usePlayerStore((s) => s.setSpeakerVolume);
  const setLfeCrossover = usePlayerStore((s) => s.setLfeCrossover);

  const [activeTab, setActiveTab] = useState<'soundstage' | 'speakers'>('soundstage');

  // Draw 3D Soundstage Radar
  const drawSoundstage = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    const cx = w / 2;
    const cy = h / 2;
    const r = Math.min(cx, cy) - 24;

    ctx.clearRect(0, 0, w, h);

    // Background radial gradient
    const bgGrad = ctx.createRadialGradient(cx, cy, 10, cx, cy, r);
    bgGrad.addColorStop(0, 'rgba(6, 182, 212, 0.08)');
    bgGrad.addColorStop(1, 'rgba(2, 6, 23, 0.6)');
    ctx.fillStyle = bgGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();

    // Radar Concentric Circles
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;
    [0.33, 0.66, 1.0].forEach((ratio) => {
      ctx.beginPath();
      ctx.arc(cx, cy, r * ratio, 0, Math.PI * 2);
      ctx.stroke();
    });

    // Crosshairs
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(cx - r, cy);
    ctx.lineTo(cx + r, cy);
    ctx.moveTo(cx, cy - r);
    ctx.lineTo(cx, cy + r);
    ctx.stroke();
    ctx.setLineDash([]);

    // Speaker Positions around perimeter
    const speakers = [
      { label: 'FL', angle: -Math.PI / 4, color: '#38bdf8' },
      { label: 'C', angle: -Math.PI / 2, color: '#a855f7' },
      { label: 'FR', angle: -3 * Math.PI / 4, color: '#38bdf8' },
      { label: 'SR', angle: 3 * Math.PI / 4, color: '#06b6d4' },
      { label: 'SL', angle: Math.PI / 4, color: '#06b6d4' },
    ];

    speakers.forEach((spk) => {
      const sx = cx + Math.cos(spk.angle) * (r - 12);
      const sy = cy + Math.sin(spk.angle) * (r - 12);

      ctx.fillStyle = spk.color;
      ctx.beginPath();
      ctx.arc(sx, sy, 6, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.font = 'bold 9px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(spk.label, sx, sy - 12);
    });

    // Subwoofer LFE box in corner
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.roundRect(14, h - 28, 42, 16, 4);
    ctx.fill();
    ctx.fillStyle = '#020617';
    ctx.font = 'bold 8px monospace';
    ctx.fillText('SUB LFE', 35, h - 20);

    // Center Listener (Head + Ears)
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(cx, cy, 14, 0, Math.PI * 2);
    ctx.fill();

    // Direction indicator (Nose facing top)
    ctx.fillStyle = theme.primaryHex || '#06b6d4';
    ctx.beginPath();
    ctx.moveTo(cx - 5, cy - 12);
    ctx.lineTo(cx, cy - 20);
    ctx.lineTo(cx + 5, cy - 12);
    ctx.closePath();
    ctx.fill();

    // Ears
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.beginPath();
    ctx.ellipse(cx - 16, cy, 3, 6, 0, 0, Math.PI * 2);
    ctx.ellipse(cx + 16, cy, 3, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    // Sound Source (Draggable Orb with 3D waves)
    const sx = cx + spatialState.coordinates.x * (r * 0.8);
    const sy = cy - spatialState.coordinates.z * (r * 0.8);

    // Ripple wave
    ctx.strokeStyle = theme.primaryHex || '#06b6d4';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(sx, sy, 18, 0, Math.PI * 2);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(sx, sy, 26, 0, Math.PI * 2);
    ctx.stroke();

    // Center Sound Orb
    const orbGrad = ctx.createRadialGradient(sx, sy, 2, sx, sy, 10);
    orbGrad.addColorStop(0, '#ffffff');
    orbGrad.addColorStop(1, theme.primaryHex || '#06b6d4');
    ctx.fillStyle = orbGrad;
    ctx.beginPath();
    ctx.arc(sx, sy, 10, 0, Math.PI * 2);
    ctx.fill();

    ctx.shadowBlur = 15;
    ctx.shadowColor = theme.primaryHex || '#06b6d4';
    ctx.stroke();
    ctx.shadowBlur = 0;
  }, [spatialState.coordinates, theme.primaryHex]);

  useEffect(() => {
    if (isOpen) {
      drawSoundstage();
    }
  }, [isOpen, drawSoundstage]);

  const handleCanvasInteraction = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const r = (Math.min(cx, cy) - 24) * 0.8;

    const normX = Math.max(-1.0, Math.min(1.0, (x - cx) / r));
    const normZ = Math.max(-1.0, Math.min(1.0, (cy - y) / r));

    setSpatialCoordinates(normX, 0, normZ);
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    isDraggingRef.current = true;
    handleCanvasInteraction(e.clientX, e.clientY);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isDraggingRef.current) {
      handleCanvasInteraction(e.clientX, e.clientY);
    }
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  if (!isOpen) return null;

  const PROFILES: { id: SpatialProfileId; name: string; desc: string; icon: string }[] = [
    {
      id: 'imax_3d',
      name: 'IMAX 3D Cinema',
      desc: 'Enriched dialogue center with wide surround reverb',
      icon: '🎬',
    },
    {
      id: 'binaural_360',
      name: 'Binaural 360° Studio',
      desc: 'Full 3D spherical HRTF virtualization for headphones',
      icon: '🎧',
    },
    {
      id: 'concert_hall',
      name: 'Concert Hall Live',
      desc: 'Expansive acoustic reverberation and wide separation',
      icon: '🏟️',
    },
    {
      id: 'tactical_gaming',
      name: 'Tactical 3D Gaming',
      desc: 'Pinpoint acoustic localization and directional clarity',
      icon: '🎮',
    },
    {
      id: 'vocal_isolation',
      name: 'Vocal Isolation',
      desc: 'Centers vocals & dialogues, softening side ambience',
      icon: '🗣️',
    },
  ];

  const SPEAKER_LABELS: { key: keyof SpeakerLevels; name: string; role: string; max: number }[] = [
    { key: 'frontLeft', name: 'Front Left', role: 'Main stereo soundstage', max: 1.5 },
    { key: 'center', name: 'Center', role: 'Speech, vocals & dialogue focus', max: 1.5 },
    { key: 'frontRight', name: 'Front Right', role: 'Main stereo soundstage', max: 1.5 },
    { key: 'surroundLeft', name: 'Surround Left', role: 'Rear spatial reflections', max: 1.5 },
    { key: 'surroundRight', name: 'Surround Right', role: 'Rear spatial reflections', max: 1.5 },
    { key: 'subwoofer', name: 'Subwoofer (LFE)', role: 'Deep low-end rumble (200% boost)', max: 2.0 },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md animate-in fade-in duration-200 select-none p-4">
      <div className="glass-panel w-full max-w-2xl p-6 rounded-3xl flex flex-col gap-5 border border-white/20 shadow-2xl max-h-[90vh] overflow-hidden bg-slate-950/95">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div
              className={`p-3 rounded-2xl bg-gradient-to-r ${theme.accentGradient} text-white shadow-lg`}
              style={{ boxShadow: `0 0 15px ${theme.haloGlow}` }}
            >
              <Headphones className="w-5 h-5 fill-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white tracking-tight">
                  3D Spatial Audio & Speaker Sound System
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
                  HRTF 5.1
                </span>
              </div>
              <p className="text-xs text-white/50">
                Interactive 360° soundstage radar and individual 6-speaker channel control
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* 3D Audio Master Toggle */}
            <button
              onClick={() => setSpatialAudioEnabled(!spatialState.enabled)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                spatialState.enabled
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 shadow-sm'
                  : 'bg-white/5 text-white/50 border border-white/10'
              }`}
            >
              <Radio className="w-3.5 h-3.5" />
              <span>{spatialState.enabled ? '3D Active' : 'Bypass'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-white/10 text-white/60 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 border-b border-white/10 pb-2.5">
          <button
            onClick={() => setActiveTab('soundstage')}
            className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-semibold transition-all ${
              activeTab === 'soundstage'
                ? `${theme.badgeClass} shadow-md`
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            360° Soundstage Radar & Presets
          </button>

          <button
            onClick={() => setActiveTab('speakers')}
            className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-semibold transition-all ${
              activeTab === 'speakers'
                ? `${theme.badgeClass} shadow-md`
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <Volume2 className="w-3.5 h-3.5" />
            Individual Speaker Levels ({SPEAKER_LABELS.length})
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-5">
          {activeTab === 'soundstage' && (
            <div className="flex flex-col gap-5">
              {/* Radar & Position Control */}
              <div className="flex flex-col sm:flex-row items-center gap-6 p-4 rounded-3xl bg-white/5 border border-white/10">
                <div className="relative">
                  <canvas
                    ref={canvasRef}
                    width={260}
                    height={260}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                    className="rounded-2xl cursor-grab active:cursor-grabbing border border-white/10 shadow-inner bg-slate-950"
                  />
                  <span className="absolute bottom-2 right-2 text-[10px] font-mono text-white/40">
                    Drag sound orb
                  </span>
                </div>

                <div className="flex-1 flex flex-col gap-3 min-w-0">
                  <span className="text-xs font-bold text-white uppercase tracking-wider">
                    Positional Acoustics
                  </span>
                  <p className="text-xs text-white/60 leading-relaxed">
                    Drag the luminous orb across the soundstage radar to physically steer sound orientation in 360° virtual binaural space.
                  </p>

                  <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                    <div className="p-2.5 rounded-xl bg-black/40 border border-white/10">
                      <span className="text-[10px] text-white/40 block">Azimuth (X)</span>
                      <span className="text-cyan-400 font-bold">
                        {(spatialState.coordinates.x * 100).toFixed(0)}%
                      </span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-black/40 border border-white/10">
                      <span className="text-[10px] text-white/40 block">Elevation (Z)</span>
                      <span className="text-purple-400 font-bold">
                        {(spatialState.coordinates.z * 100).toFixed(0)}%
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => setSpatialCoordinates(0, 0, 0.5)}
                    className="self-start text-[11px] text-white/60 hover:text-white px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 flex items-center gap-1.5 transition-colors"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Recenter Audio Source</span>
                  </button>
                </div>
              </div>

              {/* Spatial Profiles Grid */}
              <div className="flex flex-col gap-2.5">
                <span className="text-xs font-semibold text-white/70">
                  1-Click 3D Spatial Audio Profiles
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {PROFILES.map((p) => {
                    const isSelected = spatialState.profile === p.id;
                    return (
                      <button
                        key={p.id}
                        onClick={() => setSpatialProfile(p.id)}
                        className={`p-3.5 rounded-2xl text-left border flex items-center gap-3 transition-all ${
                          isSelected
                            ? `bg-white/10 ${theme.glassBorder} shadow-lg ring-1 ring-white/30 scale-[1.01]`
                            : 'bg-white/5 border-white/10 hover:bg-white/10'
                        }`}
                      >
                        <span className="text-2xl">{p.icon}</span>
                        <div className="flex flex-col min-w-0">
                          <span className="text-xs font-bold text-white truncate">{p.name}</span>
                          <span className="text-[10px] text-white/50 truncate">{p.desc}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'speakers' && (
            <div className="flex flex-col gap-4">
              <span className="text-xs font-semibold text-white/70">
                Discrete Multi-Speaker Level Matrix & Crossover
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {SPEAKER_LABELS.map((spk) => {
                  const vol = spatialState.speakers[spk.key];
                  const percent = Math.round(vol * 100);

                  return (
                    <div
                      key={spk.key}
                      className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex flex-col gap-2"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-white">{spk.name}</span>
                          <span className="text-[10px] text-white/40">{spk.role}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setSpeakerVolume(spk.key, vol === 0 ? 1.0 : 0)}
                            className="p-1 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-colors"
                            title="Mute Channel"
                          >
                            {vol === 0 ? (
                              <VolumeX className="w-3.5 h-3.5 text-rose-400" />
                            ) : (
                              <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
                            )}
                          </button>
                          <span
                            className={`text-xs font-mono font-bold px-2 py-0.5 rounded-md ${
                              percent > 100
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-400/30'
                                : 'bg-white/5 text-white/80'
                            }`}
                          >
                            {percent}%
                          </span>
                        </div>
                      </div>

                      <input
                        type="range"
                        min={0}
                        max={spk.max}
                        step={0.05}
                        value={vol}
                        onChange={(e) => setSpeakerVolume(spk.key, parseFloat(e.target.value))}
                        className="w-full h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                      />
                    </div>
                  );
                })}
              </div>

              {/* Subwoofer Bass Crossover Frequency */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex flex-col gap-2 mt-2">
                <div className="flex items-center justify-between text-xs font-semibold text-white/80">
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    Subwoofer LFE Low-Pass Crossover Frequency
                  </span>
                  <span className="font-mono text-amber-400">{spatialState.lfeCrossoverHz} Hz</span>
                </div>
                <input
                  type="range"
                  min={60}
                  max={160}
                  step={5}
                  value={spatialState.lfeCrossoverHz}
                  onChange={(e) => setLfeCrossover(parseInt(e.target.value, 10))}
                  className="w-full h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer accent-amber-400"
                />
                <span className="text-[10px] text-white/40">
                  Controls the cutoff frequency where deep bass rumble is routed to the subwoofer channel
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-white/10">
          <span className="text-[11px] text-white/40 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            Real-time DSP hardware-accelerated binaural virtualization
          </span>
          <button
            onClick={() => setSpatialProfile('imax_3d')}
            className="text-xs text-white/60 hover:text-white px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
          >
            Reset Spatial Settings
          </button>
        </div>
      </div>
    </div>
  );
};

