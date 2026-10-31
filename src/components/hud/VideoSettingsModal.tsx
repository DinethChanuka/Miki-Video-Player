import React, { useState, useRef, useEffect, useCallback } from 'react';
import { usePlayerStore } from '../../store/playerStore';
import { PLAYER_THEMES, PlayerThemeId } from '../../types/theme';
import { SpeakerLevels, SpatialProfileId } from '../../core/SpatialAudioEngine';
import { VideoShaderConfig } from '../../core/PlayerEngine';
import {
  X,
  Camera,
  Sparkles,
  Ratio,
  Palette,
  Check,
  ShieldCheck,
  Zap,
  Headphones,
  Volume2,
  Eye,
  FolderOpen,
  Subtitles,
  Activity,
  Sliders,
} from 'lucide-react';
import { detectOperatingSystem, getOSPresetDirectories } from '../../utils/pathUtils';

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
  const visualizerCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const isDraggingRef = useRef(false);

  const themeId = usePlayerStore((s) => s.themeId);
  const setTheme = usePlayerStore((s) => s.setTheme);
  const currentTheme = PLAYER_THEMES[themeId] || PLAYER_THEMES.cyberpunk;

  const shaderConfig = usePlayerStore((s) => s.shaderConfig);
  const updateShaderConfig = usePlayerStore((s) => s.updateShaderConfig);
  const takeSnapshot = usePlayerStore((s) => s.takeSnapshot);
  const screenshotDirectory = usePlayerStore((s) => s.screenshotDirectory);
  const setScreenshotDirectory = usePlayerStore((s) => s.setScreenshotDirectory);
  const snapshotNotification = usePlayerStore((s) => s.snapshotNotification);

  const customBgImage = usePlayerStore((s) => s.customBgImage);
  const customBgOpacity = usePlayerStore((s) => s.customBgOpacity);
  const customBgBlur = usePlayerStore((s) => s.customBgBlur);
  const customBgTint = usePlayerStore((s) => s.customBgTint);
  const setCustomBgImage = usePlayerStore((s) => s.setCustomBgImage);
  const setCustomBgOpacity = usePlayerStore((s) => s.setCustomBgOpacity);
  const setCustomBgBlur = usePlayerStore((s) => s.setCustomBgBlur);
  const setCustomBgTint = usePlayerStore((s) => s.setCustomBgTint);

  const spatialAudio = usePlayerStore((s) => s.spatialAudio);
  const spatialState = usePlayerStore((s) => s.spatialState);
  const setSpatialAudioEnabled = usePlayerStore((s) => s.setSpatialAudioEnabled);
  const setSpatialProfile = usePlayerStore((s) => s.setSpatialProfile);
  const setSpatialCoordinates = usePlayerStore((s) => s.setSpatialCoordinates);
  const setSpeakerVolume = usePlayerStore((s) => s.setSpeakerVolume);
  const preampGain = usePlayerStore((s) => s.preampGain);
  const stereoPan = usePlayerStore((s) => s.stereoPan);
  const setPreampGain = usePlayerStore((s) => s.setPreampGain);
  const setStereoPan = usePlayerStore((s) => s.setStereoPan);
  const playAudioTestChime = usePlayerStore((s) => s.playAudioTestChime);

  // Subtitles
  const activeSubtitleTrack = usePlayerStore((s) => s.activeSubtitleTrack);
  const isSubtitlesVisible = usePlayerStore((s) => s.isSubtitlesVisible);
  const subtitleStyle = usePlayerStore((s) => s.subtitleStyle);
  const toggleSubtitles = usePlayerStore((s) => s.toggleSubtitles);
  const updateSubtitleStyle = usePlayerStore((s) => s.updateSubtitleStyle);
  const setSubtitleSyncOffset = usePlayerStore((s) => s.setSubtitleSyncOffset);

  const detectedOS = detectOperatingSystem();
  const osPresetDirs = getOSPresetDirectories(detectedOS);

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
    bgGrad.addColorStop(0, 'rgba(30, 41, 59, 0.7)');
    bgGrad.addColorStop(1, 'rgba(15, 23, 42, 0.95)');
    ctx.fillStyle = bgGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();

    // Radar rings
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
    ctx.lineWidth = 1;
    [0.33, 0.66, 1.0].forEach((fraction) => {
      ctx.beginPath();
      ctx.arc(cx, cy, r * fraction, 0, Math.PI * 2);
      ctx.stroke();
    });

    // Crosshairs
    ctx.beginPath();
    ctx.moveTo(cx, cy - r);
    ctx.lineTo(cx, cy + r);
    ctx.moveTo(cx - r, cy);
    ctx.lineTo(cx + r, cy);
    ctx.stroke();

    // Center Listener Icon
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(cx, cy, 6, 0, Math.PI * 2);
    ctx.fill();
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

  // Real-time Audio Visualizer Loop
  useEffect(() => {
    if (!isOpen || activeTab !== 'spatial') return;
    drawSoundstage();

    let animId: number;
    const canvas = visualizerCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const buffer = new Uint8Array(32);

    const render = () => {
      spatialAudio.getFrequencyData(buffer);
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const numBars = buffer.length;
      const barWidth = (canvas.width / numBars) * 0.75;
      const gap = (canvas.width / numBars) * 0.25;

      for (let i = 0; i < numBars; i++) {
        const val = buffer[i] / 255;
        const barHeight = Math.max(3, val * canvas.height * 0.9);
        const x = i * (barWidth + gap);
        const y = canvas.height - barHeight;

        const grad = ctx.createLinearGradient(x, y, x, canvas.height);
        grad.addColorStop(0, currentTheme.primaryHex || '#06b6d4');
        grad.addColorStop(1, 'rgba(255, 255, 255, 0.15)');

        ctx.fillStyle = grad;
        ctx.fillRect(x, y, barWidth, barHeight);
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [isOpen, activeTab, drawSoundstage, spatialAudio, currentTheme.primaryHex]);

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

  const WALLPAPERS = [
    {
      name: 'Deep Nebula',
      url: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=1200&q=80',
      badge: 'Deep Space',
    },
    {
      name: 'Liquid Glass',
      url: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&w=1200&q=80',
      badge: 'Prismatic',
    },
    {
      name: 'Cyberpunk Neon',
      url: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1200&q=80',
      badge: 'Neon Glow',
    },
    {
      name: 'Aurora Borealis',
      url: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?auto=format&fit=crop&w=1200&q=80',
      badge: 'Northern Light',
    },
    {
      name: 'Dark Abstract',
      url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80',
      badge: 'Silicon Grid',
    },
    {
      name: 'Synthwave Sunset',
      url: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&w=1200&q=80',
      badge: 'Retro 80s',
    },
    {
      name: 'Obsidian Velvet',
      url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
      badge: 'Luxury Dark',
    },
    {
      name: 'Cyber Horizon',
      url: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80',
      badge: 'Matrix Wave',
    },
  ];

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
      <div className="glass-panel w-full max-w-3xl p-6 rounded-3xl flex flex-col gap-4 border border-white/20 shadow-2xl max-h-[90vh] overflow-hidden bg-slate-950/95">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
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
        <div className="flex items-center gap-2 border-b border-white/10 pb-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('themes')}
            className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-semibold transition-all shrink-0 ${
              activeTab === 'themes'
                ? `${currentTheme.badgeClass} shadow-md`
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <Palette className="w-3.5 h-3.5" />
            10 Themes & Wallpapers
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
            Aspect, Subtitles & Paths
          </button>
        </div>

        {/* Tab Body */}
        <div className="flex-1 overflow-y-auto pr-1">
          {/* TAB 1: 10 PLAYER THEMES & WALLPAPERS */}
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {(Object.keys(PLAYER_THEMES) as PlayerThemeId[]).map((tId) => {
                  const t = PLAYER_THEMES[tId];
                  const isSelected = tId === themeId;

                  return (
                    <button
                      key={tId}
                      onClick={() => setTheme(tId)}
                      className={`p-3 rounded-2xl text-left border flex items-center justify-between gap-3 transition-all ${
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
              <div className="flex flex-col gap-3 pt-3 border-t border-white/10">
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
                  Sets an ultra-wide panoramic wallpaper rendered below the glassmorphic player interface with dynamic blur, opacity, and tint.
                </p>

                {/* Curated Aesthetic Wallpaper Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {WALLPAPERS.map((bg) => {
                    const isSelected = customBgImage === bg.url;
                    return (
                      <button
                        key={bg.name}
                        onClick={() => setCustomBgImage(bg.url)}
                        className={`group relative h-20 rounded-2xl overflow-hidden border transition-all text-left flex flex-col justify-between p-2.5 shadow-md ${
                          isSelected
                            ? 'border-fuchsia-400 ring-2 ring-fuchsia-400/50 shadow-fuchsia-500/20 scale-[1.02]'
                            : 'border-white/15 hover:border-white/40'
                        }`}
                        style={{
                          backgroundImage: `url(${bg.url})`,
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                        }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/20 group-hover:from-black/60 transition-colors" />

                        {/* Top Badge */}
                        <div className="relative z-10 flex justify-between items-center w-full">
                          <span className="text-[9px] font-mono px-1.5 py-0.5 rounded-md bg-black/60 text-white/80 border border-white/10">
                            {bg.badge}
                          </span>
                          {isSelected && (
                            <div className="p-0.5 rounded-full bg-fuchsia-500 text-white">
                              <Check className="w-3 h-3" />
                            </div>
                          )}
                        </div>

                        {/* Bottom Name Label */}
                        <span className="relative z-10 text-[11px] font-bold text-white drop-shadow truncate">
                          {bg.name}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Upload Custom Image & Controls */}
                <div className="flex flex-col sm:flex-row items-center gap-2 pt-1">
                  <label className="flex-1 w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-xs text-white/80 hover:text-white cursor-pointer transition-all active:scale-95">
                    <FolderOpen className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Upload Custom Image File...</span>
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

                {/* Extended Sliders: Opacity (0-100%) & Blur (0-80px) & Tint */}
                {customBgImage && (
                  <div className="flex flex-col gap-3 p-3.5 rounded-2xl bg-white/5 border border-white/10 mt-1">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="flex flex-col gap-1.5">
                        <div className="flex justify-between text-[11px] text-white/70">
                          <span>Background Opacity / Transparency</span>
                          <span className="font-mono text-fuchsia-300 font-bold">{Math.round(customBgOpacity * 100)}%</span>
                        </div>
                        <input
                          type="range"
                          min={0.0}
                          max={1.0}
                          step={0.05}
                          value={customBgOpacity}
                          onChange={(e) => setCustomBgOpacity(parseFloat(e.target.value))}
                          className="w-full h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer accent-fuchsia-400"
                        />
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <div className="flex justify-between text-[11px] text-white/70">
                          <span>Background Blur Spread</span>
                          <span className="font-mono text-cyan-300 font-bold">{customBgBlur}px</span>
                        </div>
                        <input
                          type="range"
                          min={0}
                          max={80}
                          step={1}
                          value={customBgBlur}
                          onChange={(e) => setCustomBgBlur(parseInt(e.target.value, 10))}
                          className="w-full h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                        />
                      </div>
                    </div>

                    {/* Tint Selector */}
                    <div className="flex flex-col gap-1.5 pt-2 border-t border-white/10">
                      <span className="text-[11px] text-white/70">Glass Overlay Tint:</span>
                      <div className="grid grid-cols-5 gap-1.5">
                        {[
                          { id: 'obsidian', label: 'Dark Obsidian' },
                          { id: 'navy', label: 'Midnight Navy' },
                          { id: 'aurora', label: 'Emerald Aurora' },
                          { id: 'amethyst', label: 'Amethyst' },
                          { id: 'clear', label: 'Pure Clear' },
                        ].map((t) => (
                          <button
                            key={t.id}
                            onClick={() => setCustomBgTint(t.id as 'obsidian' | 'navy' | 'aurora' | 'amethyst' | 'clear')}
                            className={`py-1.5 px-2 rounded-xl text-[10px] font-semibold transition-all truncate text-center ${
                              customBgTint === t.id
                                ? 'bg-white/20 text-white border border-white/40 shadow-sm font-bold'
                                : 'bg-white/5 text-white/50 hover:text-white border border-white/5'
                            }`}
                          >
                            {t.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: CLARITY AI & SUPER-RESOLUTION */}
          {activeTab === 'clarity' && (
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-white/70">
                  Super-Resolution & Clarity Filters
                </span>
                <span className="text-[11px] font-mono text-purple-400 font-bold uppercase">
                  Engine: {shaderConfig.superResolution}
                </span>
              </div>

              {/* Super-Resolution Presets */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {RESOLUTION_PRESETS.map((p) => {
                  const isSelected = shaderConfig.superResolution === p.id;
                  return (
                    <button
                      key={p.id}
                      onClick={() => updateShaderConfig({ superResolution: p.id })}
                      className={`p-3 rounded-2xl text-left border flex flex-col justify-between gap-1.5 transition-all ${
                        isSelected
                          ? 'bg-purple-950/40 border-purple-400 ring-1 ring-purple-400/40 shadow-lg shadow-purple-500/10'
                          : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white">{p.name}</span>
                        <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-full bg-gradient-to-r ${p.gradient} text-white`}>
                          {p.badge}
                        </span>
                      </div>
                      <p className="text-[10px] text-white/50">{p.desc}</p>
                    </button>
                  );
                })}
              </div>

              {/* Sliders for Video Clarity & Sharpness */}
              <div className="flex flex-col gap-3 p-3.5 rounded-2xl bg-white/5 border border-white/10">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-white/90 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-purple-400" />
                    Texture Detail & Edge Clarifier
                  </span>
                  <span className="text-xs font-mono font-bold text-purple-300">
                    +{Math.round((shaderConfig.clarityBoost || 0) * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min={0.0}
                  max={2.0}
                  step={0.1}
                  value={shaderConfig.clarityBoost || 0}
                  onChange={(e) => updateShaderConfig({ clarityBoost: parseFloat(e.target.value) })}
                  className="w-full h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer accent-purple-400"
                />

                <div className="flex items-center justify-between pt-2 border-t border-white/10">
                  <span className="text-xs font-semibold text-white/90 flex items-center gap-2">
                    <Eye className="w-4 h-4 text-cyan-400" />
                    Interactive Split Compare Mode
                  </span>
                  <button
                    onClick={() => updateShaderConfig({ splitCompareEnabled: !shaderConfig.splitCompareEnabled })}
                    className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all ${
                      shaderConfig.splitCompareEnabled
                        ? 'bg-cyan-500 text-slate-950 font-bold'
                        : 'bg-white/10 text-white/60'
                    }`}
                  >
                    {shaderConfig.splitCompareEnabled ? 'Split View: Active' : 'Off'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: 3D SOUND & SPEAKERS */}
          {activeTab === 'spatial' && (
            <div className="flex flex-col gap-4">
              {/* Header Toggle & Profile */}
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white/5 border border-white/10">
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-xl ${spatialState.enabled ? 'bg-cyan-500/20 text-cyan-300' : 'bg-white/10 text-white/40'}`}>
                    <Headphones className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">3D Spatial Audio & Multi-Speaker Sound System</h4>
                    <p className="text-[10px] text-white/50">HRTF Acoustic Virtualizer, Preamp Booster & 6-Channel Matrix</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      onClose();
                      onOpenEq();
                    }}
                    className="px-3 py-1.5 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-200 border border-purple-500/30 font-semibold text-[11px] flex items-center gap-1.5 transition-all active:scale-95"
                    title="Open 10-Band Graphic Equalizer"
                  >
                    <Sliders className="w-3.5 h-3.5 text-purple-400" />
                    <span>10-Band EQ</span>
                  </button>

                  <button
                    onClick={playAudioTestChime}
                    className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-[11px] flex items-center gap-1.5 transition-all active:scale-95 border border-white/15"
                    title="Play 3D audio test sweep"
                  >
                    <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Test Sweep</span>
                  </button>

                  <button
                    onClick={() => setSpatialAudioEnabled(!spatialState.enabled)}
                    className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all ${
                      spatialState.enabled
                        ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                        : 'bg-white/10 text-white/50'
                    }`}
                  >
                    {spatialState.enabled ? 'Enabled' : 'Bypass'}
                  </button>
                </div>
              </div>

              {/* Real-time Frequency Analyser Visualizer */}
              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-xs text-white/70">
                  <span className="flex items-center gap-2 font-semibold">
                    <Activity className="w-4 h-4 text-cyan-400" />
                    Live Audio Spectrum Analyser
                  </span>
                  <span className="text-[10px] font-mono text-cyan-300">32-Band FFT</span>
                </div>
                <canvas
                  ref={visualizerCanvasRef}
                  width={600}
                  height={48}
                  className="w-full h-12 rounded-xl bg-black/40 border border-white/5"
                />
              </div>

              {/* Master Preamp Gain Booster & Stereo Channel Balance */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-2xl bg-white/5 border border-white/10">
                <div className="flex flex-col gap-1.5">
                  <div className="flex justify-between text-xs text-white/80 font-semibold">
                    <span className="flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-amber-400" />
                      Smart Preamp Volume Booster
                    </span>
                    <span className="font-mono text-amber-300 font-bold">{Math.round(preampGain * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min={1.0}
                    max={2.2}
                    step={0.05}
                    value={preampGain}
                    onChange={(e) => setPreampGain(parseFloat(e.target.value))}
                    className="w-full h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer accent-amber-400"
                  />
                  <span className="text-[10px] text-white/40">Boost quiet movies & streams up to 220% cleanly</span>
                </div>

                <div className="flex flex-col gap-1.5">
                  <div className="flex justify-between text-xs text-white/80 font-semibold">
                    <span className="flex items-center gap-1.5">
                      <Sliders className="w-3.5 h-3.5 text-cyan-400" />
                      Stereo Balance (Pan)
                    </span>
                    <span className="font-mono text-cyan-300 font-bold">
                      {stereoPan === 0 ? 'Center' : stereoPan < 0 ? `L ${Math.round(Math.abs(stereoPan) * 100)}%` : `R ${Math.round(stereoPan * 100)}%`}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={-1.0}
                    max={1.0}
                    step={0.05}
                    value={stereoPan}
                    onChange={(e) => setStereoPan(parseFloat(e.target.value))}
                    className="w-full h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                  />
                  <div className="flex justify-between text-[10px] text-white/40 font-mono">
                    <span>Left</span>
                    <span>Center</span>
                    <span>Right</span>
                  </div>
                </div>
              </div>

              {/* Profiles */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {PROFILES.map((p) => {
                  const isSelected = spatialState.profile === p.id;
                  return (
                    <button
                      key={p.id}
                      onClick={() => setSpatialProfile(p.id)}
                      className={`p-2.5 rounded-2xl text-center border flex flex-col items-center gap-1 transition-all ${
                        isSelected
                          ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 font-bold shadow-md shadow-cyan-500/20'
                          : 'bg-white/5 border-white/10 text-white/70 hover:text-white'
                      }`}
                    >
                      <span className="text-lg">{p.icon}</span>
                      <span className="text-[11px] truncate w-full">{p.name}</span>
                    </button>
                  );
                })}
              </div>

              {/* Interactive Radar Canvas */}
              <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-white/5 border border-white/10">
                <canvas
                  ref={canvasRef}
                  width={240}
                  height={180}
                  onMouseDown={(e) => {
                    isDraggingRef.current = true;
                    handleCanvasInteraction(e.clientX, e.clientY);
                  }}
                  onMouseMove={(e) => {
                    if (isDraggingRef.current) handleCanvasInteraction(e.clientX, e.clientY);
                  }}
                  onMouseUp={() => (isDraggingRef.current = false)}
                  onMouseLeave={() => (isDraggingRef.current = false)}
                  className="cursor-crosshair rounded-xl border border-white/10"
                />
                <span className="text-[10px] text-white/40 mt-1">Drag glowing orb to position 3D sound source in space</span>
              </div>

              {/* 6 Discrete Speaker Volume Controls */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {SPEAKER_LABELS.map((spk) => (
                  <div key={spk.key} className="p-2.5 rounded-xl bg-white/5 border border-white/10 flex flex-col gap-1">
                    <div className="flex justify-between text-[11px] text-white/80 font-semibold">
                      <span>{spk.name}</span>
                      <span className="font-mono text-cyan-300 font-bold">
                        {Math.round((spatialState.speakers[spk.key] || 1.0) * 100)}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min={0.0}
                      max={spk.max}
                      step={0.05}
                      value={spatialState.speakers[spk.key] || 1.0}
                      onChange={(e) => setSpeakerVolume(spk.key, parseFloat(e.target.value))}
                      className="w-full h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: ASPECT RATIO, SUBTITLES & PATHS */}
          {activeTab === 'tools' && (
            <div className="flex flex-col gap-4">
              {/* Aspect Ratio */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-white/70 flex items-center gap-2">
                  <Ratio className="w-4 h-4 text-cyan-400" />
                  Aspect Ratio & Cropping
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {(['auto', '16:9', '4:3', '21:9', '1:1', 'fill'] as const).map((ratio) => (
                    <button
                      key={ratio}
                      onClick={() => updateShaderConfig({ aspectRatio: ratio })}
                      className={`py-2 px-2 rounded-2xl text-xs font-mono font-semibold transition-all uppercase ${
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

              {/* Subtitle & Caption Customizer */}
              <div className="flex flex-col gap-3 p-3.5 rounded-2xl bg-white/5 border border-white/10">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-white/90 flex items-center gap-2">
                    <Subtitles className="w-4 h-4 text-amber-400" />
                    Video Subtitles & Closed Captions (CC)
                  </span>
                  <button
                    onClick={toggleSubtitles}
                    className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all ${
                      isSubtitlesVisible
                        ? 'bg-amber-500 text-slate-950 font-bold'
                        : 'bg-white/10 text-white/40'
                    }`}
                  >
                    {isSubtitlesVisible ? 'Captions: Visible' : 'Hidden'}
                  </button>
                </div>

                {activeSubtitleTrack && (
                  <div className="flex items-center justify-between text-xs text-white/60 bg-black/30 p-2 rounded-xl">
                    <span className="truncate">Loaded: {activeSubtitleTrack.fileName}</span>
                    <span className="font-mono text-amber-300">{activeSubtitleTrack.cues.length} Cues</span>
                  </div>
                )}

                {/* Subtitle Style Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] text-white/60 font-semibold">Font Size:</span>
                    <div className="grid grid-cols-4 gap-1">
                      {(['small', 'medium', 'large', 'extra-large'] as const).map((sz) => (
                        <button
                          key={sz}
                          onClick={() => updateSubtitleStyle({ fontSize: sz })}
                          className={`py-1 rounded-lg text-[10px] font-semibold uppercase ${
                            subtitleStyle.fontSize === sz
                              ? 'bg-amber-500/30 text-amber-300 border border-amber-400/50'
                              : 'bg-white/5 text-white/50'
                          }`}
                        >
                          {sz === 'extra-large' ? 'XL' : sz[0].toUpperCase()}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <div className="flex justify-between text-[10px] text-white/60">
                      <span>Box Opacity</span>
                      <span className="font-mono text-amber-300">{Math.round(subtitleStyle.backgroundOpacity * 100)}%</span>
                    </div>
                    <input
                      type="range"
                      min={0.0}
                      max={1.0}
                      step={0.05}
                      value={subtitleStyle.backgroundOpacity}
                      onChange={(e) => updateSubtitleStyle({ backgroundOpacity: parseFloat(e.target.value) })}
                      className="w-full h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-amber-400"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <div className="flex justify-between text-[10px] text-white/60">
                      <span>Vertical Offset</span>
                      <span className="font-mono text-amber-300">{subtitleStyle.bottomOffsetPercent}%</span>
                    </div>
                    <input
                      type="range"
                      min={5}
                      max={35}
                      step={1}
                      value={subtitleStyle.bottomOffsetPercent}
                      onChange={(e) => updateSubtitleStyle({ bottomOffsetPercent: parseInt(e.target.value, 10) })}
                      className="w-full h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-amber-400"
                    />
                  </div>
                </div>

                {/* Lip-Sync Sync Offset */}
                <div className="flex flex-col gap-1 pt-1 border-t border-white/10">
                  <div className="flex justify-between text-[11px] text-white/70">
                    <span>Subtitle Lip-Sync Offset:</span>
                    <span className="font-mono text-amber-300 font-bold">
                      {(activeSubtitleTrack?.syncOffsetSec || 0) > 0 ? `+${(activeSubtitleTrack?.syncOffsetSec || 0).toFixed(1)}s` : `${(activeSubtitleTrack?.syncOffsetSec || 0).toFixed(1)}s`}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={-5.0}
                    max={5.0}
                    step={0.1}
                    value={activeSubtitleTrack?.syncOffsetSec || 0}
                    onChange={(e) => setSubtitleSyncOffset(parseFloat(e.target.value))}
                    className="w-full h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-amber-400"
                  />
                  <div className="flex justify-between text-[9px] text-white/40 font-mono">
                    <span>-5.0s (Earlier)</span>
                    <span>0.0s (Exact)</span>
                    <span>+5.0s (Later)</span>
                  </div>
                </div>
              </div>

              {/* OS-Aware Screenshot Saving Path Configuration */}
              <div className="flex flex-col gap-3 p-3.5 rounded-2xl bg-white/5 border border-white/10">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-white/90 flex items-center gap-2">
                    <Camera className="w-4 h-4 text-cyan-400" />
                    Screenshot Storage Location
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-white/10 text-cyan-300 border border-white/10 uppercase">
                      OS: {detectedOS}
                    </span>
                    {snapshotNotification && (
                      <span className="text-[11px] font-mono text-cyan-300 bg-cyan-950/80 px-2.5 py-0.5 rounded-lg border border-cyan-400/40 animate-pulse">
                        {snapshotNotification}
                      </span>
                    )}
                  </div>
                </div>

                {/* Preset Directory Selectors for detected OS */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {osPresetDirs.map((preset) => (
                    <button
                      key={preset.path}
                      onClick={() => setScreenshotDirectory(preset.path)}
                      className={`py-2 px-2.5 rounded-xl text-xs font-medium transition-all text-center truncate ${
                        screenshotDirectory === preset.path
                          ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/50 shadow-md shadow-cyan-500/20 font-bold'
                          : 'bg-white/5 border border-white/10 text-white/70 hover:text-white hover:bg-white/10'
                      }`}
                      title={preset.description}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>

                {/* Custom Path Input + Native Browse Button */}
                <div className="flex items-center gap-2">
                  <div className="flex-1 flex items-center gap-2 px-3 py-2 rounded-2xl bg-black/40 border border-white/15 focus-within:border-cyan-400/60 transition-colors">
                    <FolderOpen className="w-4 h-4 text-white/40 shrink-0" />
                    <input
                      type="text"
                      value={screenshotDirectory}
                      onChange={(e) => setScreenshotDirectory(e.target.value)}
                      placeholder={osPresetDirs[0]?.path || '~/Pictures/Miki Player/Screenshots'}
                      className="w-full bg-transparent text-xs text-white placeholder-white/30 focus:outline-none font-mono"
                    />
                  </div>

                  <button
                    onClick={handleBrowseScreenshotDir}
                    className="px-4 py-2 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/15 text-xs font-semibold text-white transition-all active:scale-95 shrink-0 flex items-center gap-1.5"
                    title="Choose custom folder on disk"
                  >
                    <FolderOpen className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Browse...</span>
                  </button>

                  <button
                    onClick={takeSnapshot}
                    className="px-3.5 py-2 rounded-2xl bg-gradient-to-r from-cyan-500 to-fuchsia-500 text-white text-xs font-bold shadow-md hover:brightness-110 active:scale-95 transition-all shrink-0 flex items-center gap-1.5"
                    title="Capture test frame now"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>Capture</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center pt-2 border-t border-white/10">
          <span className="text-[11px] text-white/40 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            All settings, audio profiles & themes stored in database
          </span>
          <button
            onClick={() => {
              updateShaderConfig({
                superResolution: 'off',
                clarityBoost: 0,
                brightness: 0,
                contrast: 1.0,
                saturation: 1.0,
                aspectRatio: 'auto',
                splitCompareEnabled: false,
              });
              setPreampGain(1.0);
              setStereoPan(0.0);
            }}
            className="text-[11px] text-white/40 hover:text-white/80 transition-colors"
          >
            Reset All Settings
          </button>
        </div>
      </div>
    </div>
  );
};
