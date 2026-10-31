import React, { useState, useRef, useEffect, useCallback } from 'react';
import { usePlayerStore } from '../../store/playerStore';
import { PLAYER_THEMES, PlayerThemeId } from '../../types/theme';
import { SpeakerLevels, SpatialProfileId } from '../../core/SpatialAudioEngine';
import { VideoShaderConfig } from '../../core/PlayerEngine';
import {
  X,
  Camera,
  Repeat,
  Tv,
  SlidersHorizontal,
  Sparkles,
  Ratio,
  Palette,
  Check,
  ShieldCheck,
  Zap,
  Headphones,
  Radio,
  RotateCcw,
  Volume2,
  VolumeX,
  Split,
  Eye,
  FolderOpen,
} from 'lucide-react';

interface VideoSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenEq: () => void;
  initialTab?: 'themes' | 'clarity' | 'spatial' | 'tools';
}

export const VideoSettingsModal: React.FC<VideoSettingsModalProps> = ({
  isOpen,
  onClose,
  onOpenEq,
  initialTab = 'themes',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isDraggingRef = useRef(false);

  const themeId = usePlayerStore((s) => s.themeId);
  const setTheme = usePlayerStore((s) => s.setTheme);
  const currentTheme = PLAYER_THEMES[themeId] || PLAYER_THEMES.cyberpunk;

  const shaderConfig = usePlayerStore((s) => s.shaderConfig);
  const updateShaderConfig = usePlayerStore((s) => s.updateShaderConfig);
  const isLooping = usePlayerStore((s) => s.isLooping);
  const toggleLoop = usePlayerStore((s) => s.toggleLoop);
  const takeSnapshot = usePlayerStore((s) => s.takeSnapshot);
  const screenshotDirectory = usePlayerStore((s) => s.screenshotDirectory);
  const setScreenshotDirectory = usePlayerStore((s) => s.setScreenshotDirectory);
  const snapshotNotification = usePlayerStore((s) => s.snapshotNotification);

  const customBgImage = usePlayerStore((s) => s.customBgImage);
  const customBgOpacity = usePlayerStore((s) => s.customBgOpacity);
  const customBgBlur = usePlayerStore((s) => s.customBgBlur);
  const setCustomBgImage = usePlayerStore((s) => s.setCustomBgImage);
  const setCustomBgOpacity = usePlayerStore((s) => s.setCustomBgOpacity);
  const setCustomBgBlur = usePlayerStore((s) => s.setCustomBgBlur);

  const spatialState = usePlayerStore((s) => s.spatialState);
  const setSpatialAudioEnabled = usePlayerStore((s) => s.setSpatialAudioEnabled);
  const setSpatialProfile = usePlayerStore((s) => s.setSpatialProfile);
  const setSpatialCoordinates = usePlayerStore((s) => s.setSpatialCoordinates);
  const setSpeakerVolume = usePlayerStore((s) => s.setSpeakerVolume);
  const setLfeCrossover = usePlayerStore((s) => s.setLfeCrossover);

  const handleBrowseScreenshotDir = () => {
    if (
      typeof window !== 'undefined' &&
      (window as unknown as { webkit?: { messageHandlers?: { openNativeDirectoryDialog?: { postMessage: (msg: string) => void } } } })
        .webkit?.messageHandlers?.openNativeDirectoryDialog
    ) {
      (window as unknown as { webkit: { messageHandlers: { openNativeDirectoryDialog: { postMessage: (msg: string) => void } } } })
        .webkit.messageHandlers.openNativeDirectoryDialog.postMessage('open');
    }
  };

  const [activeTab, setActiveTab] = useState<'themes' | 'clarity' | 'spatial' | 'tools'>(initialTab);

  // Draw 3D Soundstage Radar Canvas
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

    // Radial background
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

    // Direction indicator
    ctx.fillStyle = currentTheme.primaryHex || '#06b6d4';
    ctx.beginPath();
    ctx.moveTo(cx - 5, cy - 12);
    ctx.lineTo(cx, cy - 20);
    ctx.lineTo(cx + 5, cy - 12);
    ctx.closePath();
    ctx.fill();

    // Sound Source (Draggable Orb)
    const sx = cx + spatialState.coordinates.x * (r * 0.8);
    const sy = cy - spatialState.coordinates.z * (r * 0.8);

    ctx.strokeStyle = currentTheme.primaryHex || '#06b6d4';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(sx, sy, 18, 0, Math.PI * 2);
    ctx.stroke();

    const orbGrad = ctx.createRadialGradient(sx, sy, 2, sx, sy, 10);
    orbGrad.addColorStop(0, '#ffffff');
    orbGrad.addColorStop(1, currentTheme.primaryHex || '#06b6d4');
    ctx.fillStyle = orbGrad;
    ctx.beginPath();
    ctx.arc(sx, sy, 10, 0, Math.PI * 2);
    ctx.fill();
  }, [spatialState.coordinates, currentTheme.primaryHex]);

  useEffect(() => {
    if (isOpen && activeTab === 'spatial') {
      drawSoundstage();
    }
  }, [isOpen, activeTab, drawSoundstage]);

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

  if (!isOpen) return null;

  const togglePiP = async () => {
    try {
      const video = document.querySelector('video');
      if (video) {
        if (document.pictureInPictureElement) {
          await document.exitPictureInPicture();
        } else {
          await video.requestPictureInPicture();
        }
      }
    } catch {}
  };

  const RESOLUTION_PRESETS: {
    id: VideoShaderConfig['superResolution'];
    name: string;
    desc: string;
    badge: string;
    gradient: string;
  }[] = [
    {
      id: 'anime4k',
      name: 'Anime4K Neural Upscaler',
      desc: 'Edge-preserving line art clarify, perfect for animation & anime',
      badge: 'Edge Sharp',
      gradient: 'from-fuchsia-500 to-cyan-500',
    },
    {
      id: 'clarity-ultra',
      name: 'Ultra Clarity 4K',
      desc: 'Fine texture detail extraction and unsharp mask de-blurring',
      badge: 'Crisp 4K',
      gradient: 'from-cyan-400 to-blue-500',
    },
    {
      id: 'cinematic-crisp',
      name: 'Cinematic Master Hi-Fi',
      desc: 'Expanded dynamic contrast with true-to-life color calibration',
      badge: 'Cinema',
      gradient: 'from-amber-400 to-rose-500',
    },
    {
      id: 'hdr-enhanced',
      name: 'HDR Dynamic Tone Mapping',
      desc: 'Deep shadow detail recovery and highlight glare protection',
      badge: 'HDR Tone',
      gradient: 'from-emerald-400 to-teal-500',
    },
    {
      id: 'off',
      name: 'Original Source (Pass-Through)',
      desc: 'Raw video stream playback without post-processing filters',
      badge: 'Bypass',
      gradient: 'from-white/20 to-white/10',
    },
  ];

  const PROFILES: { id: SpatialProfileId; name: string; desc: string; icon: string }[] = [
    { id: 'imax_3d', name: 'IMAX 3D Cinema', desc: 'Enriched dialogue center with wide surround reverb', icon: '🎬' },
    { id: 'binaural_360', name: 'Binaural 360° Studio', desc: 'Full 3D spherical HRTF virtualization for headphones', icon: '🎧' },
    { id: 'concert_hall', name: 'Concert Hall Live', desc: 'Expansive acoustic reverberation and wide separation', icon: '🏟️' },
    { id: 'tactical_gaming', name: 'Tactical 3D Gaming', desc: 'Pinpoint acoustic localization and directional clarity', icon: '🎮' },
    { id: 'vocal_isolation', name: 'Vocal Isolation', desc: 'Centers vocals & dialogues, softening side ambience', icon: '🗣️' },
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
      <div className="glass-panel w-full max-w-3xl p-6 rounded-3xl flex flex-col gap-5 border border-white/20 shadow-2xl max-h-[90vh] overflow-hidden bg-slate-950/95">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div
              className={`p-3 rounded-2xl bg-gradient-to-r ${currentTheme.accentGradient} text-white shadow-lg`}
              style={{ boxShadow: `0 0 15px ${currentTheme.haloGlow}` }}
            >
              <Palette className="w-5 h-5 fill-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">Player Settings & Audio/Video DSP</h2>
              <p className="text-xs text-white/50">Themes, Clarity Super-Resolution, 3D Spatial Audio & Speaker Matrix</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2.5 rounded-full hover:bg-white/10 text-white/60 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 4 Unified Luxury Tabs */}
        <div className="flex items-center gap-2 border-b border-white/10 pb-2.5 overflow-x-auto">
          <button
            onClick={() => setActiveTab('themes')}
            className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-semibold transition-all shrink-0 ${
              activeTab === 'themes'
                ? `${currentTheme.badgeClass} shadow-md`
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <Palette className="w-3.5 h-3.5" />
            10 Themes
          </button>

          <button
            onClick={() => setActiveTab('clarity')}
            className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-semibold transition-all shrink-0 ${
              activeTab === 'clarity'
                ? `${currentTheme.badgeClass} shadow-md`
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            Clarity AI & Super-Res
          </button>

          <button
            onClick={() => setActiveTab('spatial')}
            className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-semibold transition-all shrink-0 ${
              activeTab === 'spatial'
                ? `${currentTheme.badgeClass} shadow-md`
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <Headphones className="w-3.5 h-3.5" />
            3D Sound & Speakers
          </button>

          <button
            onClick={() => setActiveTab('tools')}
            className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-semibold transition-all shrink-0 ${
              activeTab === 'tools'
                ? `${currentTheme.badgeClass} shadow-md`
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <Ratio className="w-3.5 h-3.5" />
            Aspect Ratio & Tools
          </button>
        </div>

        {/* Tab Body */}
        <div className="flex-1 overflow-y-auto pr-1">
          {/* TAB 1: 10 PLAYER THEMES */}
          {activeTab === 'themes' && (
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-white/70">
                  Select Theme (Automatically Saved in Database)
                </span>
                <span className="text-[11px] font-mono text-cyan-400 font-bold uppercase">
                  Active: {currentTheme.name}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {(Object.keys(PLAYER_THEMES) as PlayerThemeId[]).map((tId) => {
                  const t = PLAYER_THEMES[tId];
                  const isSelected = tId === themeId;

                  return (
                    <button
                      key={tId}
                      onClick={() => setTheme(tId)}
                      className={`p-3.5 rounded-2xl text-left border flex items-center justify-between gap-3 transition-all ${
                        isSelected
                          ? `bg-white/10 ${t.glassBorder} shadow-lg ring-1 ring-white/30 scale-[1.01]`
                          : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                      }`}
                      style={{
                        boxShadow: isSelected ? `0 0 20px ${t.haloGlow}` : undefined,
                      }}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="relative w-8 h-8 rounded-full overflow-hidden shrink-0 border border-white/20 shadow-inner flex">
                          <div
                            className="w-1/2 h-full"
                            style={{ backgroundColor: t.previewColors[0] }}
                          />
                          <div
                            className="w-1/2 h-full"
                            style={{ backgroundColor: t.previewColors[1] }}
                          />
                        </div>

                        <div className="flex flex-col min-w-0">
                          <span className="text-xs font-bold text-white truncate">{t.name}</span>
                          <span className="text-[10px] text-white/50 truncate">{t.tagline}</span>
                        </div>
                      </div>

                      {isSelected ? (
                        <div className="p-1 rounded-full bg-white/20 text-white shrink-0">
                          <Check className="w-3.5 h-3.5" />
                        </div>
                      ) : (
                        <span className="text-[10px] font-mono text-white/30 shrink-0">Select</span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Custom Glass Background & Wallpapers */}
              <div className="flex flex-col gap-3 pt-4 border-t border-white/10">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-white/90 flex items-center gap-2">
                    <Palette className="w-4 h-4 text-fuchsia-400" />
                    Custom Glass Background Layer
                  </span>
                  {customBgImage && (
                    <button
                      onClick={() => setCustomBgImage(null)}
                      className="text-[11px] font-semibold text-rose-300 hover:text-rose-200 transition-colors"
                    >
                      Clear Background
                    </button>
                  )}
                </div>
                <p className="text-[10px] text-white/50">
                  Sets a background image rendered below the glassmorphic player interface with dynamic blur and opacity.
                </p>

                {/* Curated Aesthetic Wallpaper Presets */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    { name: 'Cyberpunk Neon', url: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1200&q=80' },
                    { name: 'Deep Nebula', url: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=1200&q=80' },
                    { name: 'Aurora Borealis', url: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?auto=format&fit=crop&w=1200&q=80' },
                    { name: 'Dark Abstract', url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80' },
                    { name: 'Liquid Glass', url: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&w=1200&q=80' },
                    { name: 'Synthwave Sunset', url: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&w=1200&q=80' },
                  ].map((bg) => (
                    <button
                      key={bg.name}
                      onClick={() => setCustomBgImage(bg.url)}
                      className={`relative h-14 rounded-2xl overflow-hidden border transition-all text-left p-2 flex items-end group ${
                        customBgImage === bg.url
                          ? 'border-fuchsia-400 shadow-md shadow-fuchsia-500/30'
                          : 'border-white/10 hover:border-white/30'
                      }`}
                      style={{
                        backgroundImage: `url(${bg.url})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                      }}
                    >
                      <div className="absolute inset-0 bg-black/50 group-hover:bg-black/30 transition-colors" />
                      <span className="relative z-10 text-[10px] font-bold text-white drop-shadow">
                        {bg.name}
                      </span>
                    </button>
                  ))}
                </div>

                {/* Upload Custom Image & Controls */}
                <div className="flex flex-col sm:flex-row items-center gap-2 pt-1">
                  <label className="flex-1 w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-xs text-white/80 hover:text-white cursor-pointer transition-all active:scale-95">
                    <FolderOpen className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Upload Image File...</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (event) => {
                            if (typeof event.target?.result === 'string') {
                              setCustomBgImage(event.target.result);
                            }
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </label>
                </div>

                {/* Sliders: Opacity & Blur */}
                {customBgImage && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 rounded-2xl bg-white/5 border border-white/10">
                    <div className="flex flex-col gap-1">
                      <div className="flex justify-between text-[11px] text-white/70">
                        <span>Background Opacity</span>
                        <span className="font-mono text-fuchsia-300 font-bold">{Math.round(customBgOpacity * 100)}%</span>
                      </div>
                      <input
                        type="range"
                        min={0.1}
                        max={1.0}
                        step={0.05}
                        value={customBgOpacity}
                        onChange={(e) => setCustomBgOpacity(parseFloat(e.target.value))}
                        className="w-full h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer accent-fuchsia-400"
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <div className="flex justify-between text-[11px] text-white/70">
                        <span>Background Blur</span>
                        <span className="font-mono text-cyan-300 font-bold">{customBgBlur}px</span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={30}
                        step={1}
                        value={customBgBlur}
                        onChange={(e) => setCustomBgBlur(parseInt(e.target.value, 10))}
                        className="w-full h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: CLARITY AI & SUPER-RESOLUTION */}
          {activeTab === 'clarity' && (
            <div className="flex flex-col gap-5">
              <div className="flex flex-col gap-2.5">
                <span className="text-xs font-semibold text-white/80 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-cyan-400" />
                  1-Click Super-Resolution Modes
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {RESOLUTION_PRESETS.map((preset) => {
                    const isSelected = shaderConfig.superResolution === preset.id;
                    return (
                      <button
                        key={preset.id}
                        onClick={() => {
                          updateShaderConfig({
                            superResolution: preset.id,
                            sharpness: preset.id === 'off' ? 0 : 0.8,
                            clarityBoost: preset.id === 'off' ? 0 : 0.6,
                            deNoise: preset.id === 'anime4k' ? 0.4 : 0.2,
                            contrast: preset.id === 'cinematic-crisp' ? 1.25 : 1.1,
                          });
                        }}
                        className={`p-3.5 rounded-2xl text-left border flex items-center justify-between gap-3 transition-all ${
                          isSelected
                            ? `bg-white/10 ${currentTheme.glassBorder} shadow-lg ring-1 ring-white/30 scale-[1.01]`
                            : 'bg-white/5 border-white/10 hover:bg-white/10'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div
                            className={`w-3.5 h-3.5 rounded-full shrink-0 bg-gradient-to-r ${preset.gradient}`}
                          />
                          <div className="flex flex-col min-w-0">
                            <span className="text-xs font-bold text-white truncate">{preset.name}</span>
                            <span className="text-[10px] text-white/50 truncate">{preset.desc}</span>
                          </div>
                        </div>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-white/10 text-white/70 shrink-0">
                          {preset.badge}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Split Screen Compare Mode Toggle */}
              <div className="p-4 rounded-3xl bg-white/5 border border-white/10 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-xl bg-purple-500/20 text-purple-300">
                      <Split className="w-4 h-4" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-white">Live Split-Screen Compare Mode</span>
                      <span className="text-[10px] text-white/40">
                        Shows an interactive draggable divider: Original (Left) vs Clarity AI (Right)
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() =>
                      updateShaderConfig({
                        splitCompareEnabled: !shaderConfig.splitCompareEnabled,
                      })
                    }
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                      shaderConfig.splitCompareEnabled
                        ? 'bg-purple-500/30 text-purple-200 border border-purple-400/40 shadow-sm'
                        : 'bg-white/5 text-white/50 border border-white/10'
                    }`}
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>{shaderConfig.splitCompareEnabled ? 'Split: ON' : 'Split: OFF'}</span>
                  </button>
                </div>

                {shaderConfig.splitCompareEnabled && (
                  <div className="flex flex-col gap-1.5 pt-2 border-t border-white/10">
                    <div className="flex items-center justify-between text-xs text-white/70 font-mono">
                      <span>Divider Position (Drag directly on video or use slider)</span>
                      <span className="text-purple-300 font-bold">{shaderConfig.splitComparePosition ?? 50}%</span>
                    </div>
                    <input
                      type="range"
                      min={10}
                      max={90}
                      step={1}
                      value={shaderConfig.splitComparePosition ?? 50}
                      onChange={(e) =>
                        updateShaderConfig({ splitComparePosition: parseInt(e.target.value, 10) })
                      }
                      className="w-full h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer accent-purple-400"
                    />
                  </div>
                )}
              </div>

              {/* Fine-Tuning Sliders */}
              <div className="flex flex-col gap-4 border-t border-white/10 pt-4">
                <span className="text-xs font-semibold text-white/70 flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-cyan-400" />
                  Manual Clarity & Shader Tuning
                </span>

                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between text-xs text-white/80">
                    <span>Texture Detail & Clarity Extraction</span>
                    <span className="font-mono text-cyan-400">{Math.round((shaderConfig.clarityBoost ?? 0) * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={2.0}
                    step={0.05}
                    value={shaderConfig.clarityBoost ?? 0}
                    onChange={(e) => updateShaderConfig({ clarityBoost: parseFloat(e.target.value) })}
                    className="w-full h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between text-xs text-white/80">
                    <span>Edge Sharpening (Unsharp Masking)</span>
                    <span className="font-mono text-cyan-400">{Math.round((shaderConfig.sharpness ?? 0) * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={2.0}
                    step={0.05}
                    value={shaderConfig.sharpness ?? 0}
                    onChange={(e) => updateShaderConfig({ sharpness: parseFloat(e.target.value) })}
                    className="w-full h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between text-xs text-white/80">
                    <span>Compression Artifact Reduction & De-Noising</span>
                    <span className="font-mono text-cyan-400">{Math.round((shaderConfig.deNoise ?? 0) * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={1.0}
                    step={0.05}
                    value={shaderConfig.deNoise ?? 0}
                    onChange={(e) => updateShaderConfig({ deNoise: parseFloat(e.target.value) })}
                    className="w-full h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: 3D SPATIAL AUDIO & MULTI-SPEAKER SYSTEM */}
          {activeTab === 'spatial' && (
            <div className="flex flex-col gap-5">
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white/5 border border-white/10">
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-white">3D Spatial Audio Virtualizer (HRTF)</span>
                  <span className="text-[10px] text-white/40">Real-time binaural spherical audio for headphones & 5.1/7.1 sound</span>
                </div>
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
              </div>

              {/* Radar & Position Control */}
              <div className="flex flex-col sm:flex-row items-center gap-6 p-4 rounded-3xl bg-white/5 border border-white/10">
                <div className="relative">
                  <canvas
                    ref={canvasRef}
                    width={240}
                    height={240}
                    onMouseDown={(e) => {
                      isDraggingRef.current = true;
                      handleCanvasInteraction(e.clientX, e.clientY);
                    }}
                    onMouseMove={(e) => {
                      if (isDraggingRef.current) handleCanvasInteraction(e.clientX, e.clientY);
                    }}
                    onMouseUp={() => { isDraggingRef.current = false; }}
                    onMouseLeave={() => { isDraggingRef.current = false; }}
                    className="rounded-2xl cursor-grab active:cursor-grabbing border border-white/10 shadow-inner bg-slate-950"
                  />
                  <span className="absolute bottom-2 right-2 text-[10px] font-mono text-white/40">
                    Drag sound orb
                  </span>
                </div>

                <div className="flex-1 flex flex-col gap-2.5 min-w-0">
                  <span className="text-xs font-bold text-white uppercase tracking-wider">
                    Interactive 360° Soundstage
                  </span>
                  <p className="text-xs text-white/60 leading-relaxed">
                    Drag the orb to physically move sound origin in virtual 3D space around your head.
                  </p>

                  <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                    <div className="p-2 rounded-xl bg-black/40 border border-white/10">
                      <span className="text-[10px] text-white/40 block">Azimuth (X)</span>
                      <span className="text-cyan-400 font-bold">{(spatialState.coordinates.x * 100).toFixed(0)}%</span>
                    </div>
                    <div className="p-2 rounded-xl bg-black/40 border border-white/10">
                      <span className="text-[10px] text-white/40 block">Elevation (Z)</span>
                      <span className="text-purple-400 font-bold">{(spatialState.coordinates.z * 100).toFixed(0)}%</span>
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

              {/* Spatial Profiles */}
              <div className="flex flex-col gap-2">
                <span className="text-xs font-semibold text-white/70">1-Click Sound Profiles</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {PROFILES.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => setSpatialProfile(p.id)}
                      className={`p-3 rounded-2xl text-left border flex items-center gap-2.5 transition-all ${
                        spatialState.profile === p.id
                          ? `bg-white/10 ${currentTheme.glassBorder} shadow-lg ring-1 ring-white/30`
                          : 'bg-white/5 border-white/10 hover:bg-white/10'
                      }`}
                    >
                      <span className="text-xl">{p.icon}</span>
                      <div className="flex flex-col min-w-0">
                        <span className="text-xs font-bold text-white truncate">{p.name}</span>
                        <span className="text-[10px] text-white/50 truncate">{p.desc}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Speaker Volume Matrix */}
              <div className="flex flex-col gap-2.5 pt-2 border-t border-white/10">
                <span className="text-xs font-semibold text-white/70">Individual Speaker Channel Levels</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {SPEAKER_LABELS.map((spk) => {
                    const vol = spatialState.speakers[spk.key];
                    const percent = Math.round(vol * 100);

                    return (
                      <div
                        key={spk.key}
                        className="p-3 rounded-2xl bg-white/5 border border-white/10 flex flex-col gap-1.5"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-white">{spk.name}</span>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setSpeakerVolume(spk.key, vol === 0 ? 1.0 : 0)}
                              className="text-white/60 hover:text-white"
                            >
                              {vol === 0 ? <VolumeX className="w-3.5 h-3.5 text-rose-400" /> : <Volume2 className="w-3.5 h-3.5 text-cyan-400" />}
                            </button>
                            <span className="text-[11px] font-mono font-bold text-cyan-300">{percent}%</span>
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

                {/* Subwoofer LFE Crossover */}
                <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex flex-col gap-2 mt-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white flex items-center gap-2">
                      <Radio className="w-3.5 h-3.5 text-fuchsia-400" />
                      Subwoofer Low-Pass LFE Crossover
                    </span>
                    <span className="text-xs font-mono font-bold text-fuchsia-300">
                      {spatialState.lfeCrossoverHz || 80} Hz
                    </span>
                  </div>
                  <input
                    type="range"
                    min={40}
                    max={200}
                    step={5}
                    value={spatialState.lfeCrossoverHz || 80}
                    onChange={(e) => setLfeCrossover(parseInt(e.target.value, 10))}
                    className="w-full h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer accent-fuchsia-400"
                  />
                  <div className="flex justify-between text-[10px] text-white/40 font-mono">
                    <span>40 Hz (Deep Sub)</span>
                    <span>80 Hz (THX Cinema)</span>
                    <span>200 Hz (Punchy Bass)</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: ASPECT RATIO & TOOLS */}
          {activeTab === 'tools' && (
            <div className="flex flex-col gap-5">
              <div className="flex flex-col gap-2.5">
                <label className="text-xs font-semibold text-white/70 flex items-center gap-2">
                  <Ratio className="w-4 h-4 text-cyan-400" />
                  Aspect Ratio & Cropping
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {(['auto', '16:9', '4:3', '21:9', '1:1', 'fill'] as const).map((ratio) => (
                    <button
                      key={ratio}
                      onClick={() => updateShaderConfig({ aspectRatio: ratio })}
                      className={`py-2.5 px-2 rounded-2xl text-xs font-mono font-semibold transition-all uppercase ${
                        shaderConfig.aspectRatio === ratio
                          ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/30'
                          : 'bg-white/5 border border-white/10 text-white/70 hover:text-white'
                      }`}
                    >
                      {ratio}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-2.5 border-t border-white/10 pt-4">
                <span className="text-xs font-semibold text-white/70">Quick Player Utilities</span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <button
                    onClick={takeSnapshot}
                    className="flex flex-col items-center justify-center gap-2 p-3.5 rounded-2xl bg-white/5 border border-white/10 hover:border-cyan-400/40 transition-all text-center"
                    title="Lossless Frame Snapshot"
                  >
                    <Camera className="w-5 h-5 text-cyan-400" />
                    <span className="text-[11px] font-semibold text-white/80">Snapshot</span>
                  </button>

                  <button
                    onClick={togglePiP}
                    className="flex flex-col items-center justify-center gap-2 p-3.5 rounded-2xl bg-white/5 border border-white/10 hover:border-cyan-400/40 transition-all text-center"
                    title="Picture in Picture"
                  >
                    <Tv className="w-5 h-5 text-purple-400" />
                    <span className="text-[11px] font-semibold text-white/80">PiP Mode</span>
                  </button>

                  <button
                    onClick={toggleLoop}
                    className={`flex flex-col items-center justify-center gap-2 p-3.5 rounded-2xl transition-all text-center ${
                      isLooping
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 shadow-lg shadow-cyan-500/20'
                        : 'bg-white/5 border border-white/10 text-white/80'
                    }`}
                    title="Toggle Repeat"
                  >
                    <Repeat className="w-5 h-5" />
                    <span className="text-[11px] font-semibold">{isLooping ? 'Loop: On' : 'Loop: Off'}</span>
                  </button>

                  <button
                    onClick={() => {
                      onClose();
                      onOpenEq();
                    }}
                    className="flex flex-col items-center justify-center gap-2 p-3.5 rounded-2xl bg-white/5 border border-white/10 hover:border-cyan-400/40 transition-all text-center"
                    title="Audio Equalizer"
                  >
                    <SlidersHorizontal className="w-5 h-5 text-emerald-400" />
                    <span className="text-[11px] font-semibold text-white/80">Audio DSP</span>
                  </button>
                </div>
              </div>

              {/* Screenshot Saving Path Configuration */}
              <div className="flex flex-col gap-3 border-t border-white/10 pt-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-white/90 flex items-center gap-2">
                    <Camera className="w-4 h-4 text-cyan-400" />
                    Screenshot Storage Location
                  </span>
                  {snapshotNotification && (
                    <span className="text-[11px] font-mono text-cyan-300 bg-cyan-950/80 px-2.5 py-0.5 rounded-lg border border-cyan-400/40 animate-pulse">
                      {snapshotNotification}
                    </span>
                  )}
                </div>

                {/* Preset Directory Selectors */}
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: 'Pictures (Default)', path: '~/Pictures/Miki Player/Screenshots' },
                    { label: 'Downloads', path: '~/Downloads' },
                    { label: 'Desktop', path: '~/Desktop' },
                  ].map((preset) => (
                    <button
                      key={preset.path}
                      onClick={() => setScreenshotDirectory(preset.path)}
                      className={`py-2 px-3 rounded-xl text-xs font-medium transition-all text-center truncate ${
                        screenshotDirectory === preset.path
                          ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/50 shadow-md shadow-cyan-500/20 font-bold'
                          : 'bg-white/5 border border-white/10 text-white/70 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>

                {/* Custom Path Input + Native Browse Button */}
                <div className="flex items-center gap-2">
                  <div className="flex-1 flex items-center gap-2 px-3.5 py-2.5 rounded-2xl bg-black/40 border border-white/15 focus-within:border-cyan-400/60 transition-colors">
                    <FolderOpen className="w-4 h-4 text-white/40 shrink-0" />
                    <input
                      type="text"
                      value={screenshotDirectory}
                      onChange={(e) => setScreenshotDirectory(e.target.value)}
                      placeholder="~/Pictures/Miki Player/Screenshots"
                      className="w-full bg-transparent text-xs text-white placeholder-white/30 focus:outline-none font-mono"
                    />
                  </div>

                  <button
                    onClick={handleBrowseScreenshotDir}
                    className="px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/15 text-xs font-semibold text-white transition-all active:scale-95 shrink-0 flex items-center gap-1.5"
                    title="Choose custom folder on disk"
                  >
                    <FolderOpen className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Browse...</span>
                  </button>

                  <button
                    onClick={takeSnapshot}
                    className="px-3.5 py-2.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-fuchsia-500 text-white text-xs font-bold shadow-md hover:brightness-110 active:scale-95 transition-all shrink-0 flex items-center gap-1.5"
                    title="Capture test frame now"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>Capture</span>
                  </button>
                </div>
                <p className="text-[10px] text-white/40">
                  Lossless PNG snapshots will be automatically saved to this configured folder.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center pt-3 border-t border-white/10">
          <span className="text-[11px] text-white/40 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            All settings, audio profiles & themes stored in database
          </span>
          <button
            onClick={() =>
              updateShaderConfig({
                brightness: 0,
                contrast: 1.0,
                saturation: 1.0,
                aspectRatio: 'auto',
                ambientGlowEnabled: true,
                superResolution: 'off',
                sharpness: 0,
                clarityBoost: 0,
                deNoise: 0,
                splitCompareEnabled: false,
              })
            }
            className="text-xs text-white/60 hover:text-white px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
          >
            Reset All Settings
          </button>
        </div>
      </div>
    </div>
  );
};
