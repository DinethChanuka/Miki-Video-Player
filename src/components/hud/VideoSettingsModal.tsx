import React, { useState } from 'react';
import { usePlayerStore } from '../../store/playerStore';
import { PLAYER_THEMES, PlayerThemeId } from '../../types/theme';
import {
  X,
  Camera,
  Repeat,
  Tv,
  Sun,
  Contrast,
  SlidersHorizontal,
  Sparkles,
  Ratio,
  Palette,
  Check,
  ShieldCheck,
  Zap,
} from 'lucide-react';

interface VideoSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenEq: () => void;
}

export const VideoSettingsModal: React.FC<VideoSettingsModalProps> = ({
  isOpen,
  onClose,
  onOpenEq,
}) => {
  const shaderConfig = usePlayerStore((s) => s.shaderConfig);
  const updateShaderConfig = usePlayerStore((s) => s.updateShaderConfig);
  const isLooping = usePlayerStore((s) => s.isLooping);
  const toggleLoop = usePlayerStore((s) => s.toggleLoop);
  const takeSnapshot = usePlayerStore((s) => s.takeSnapshot);
  const themeId = usePlayerStore((s) => s.themeId);
  const setTheme = usePlayerStore((s) => s.setTheme);

  const [activeTab, setActiveTab] = useState<'themes' | 'quality' | 'tools'>('themes');

  if (!isOpen) return null;

  const currentTheme = PLAYER_THEMES[themeId] || PLAYER_THEMES.cyberpunk;

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
    } catch {
      // PiP not supported or permission denied
    }
  };

  const applyQualityPreset = (preset: 'anime4k' | 'hdr' | 'vivid' | 'night' | 'crisp' | 'neutral') => {
    switch (preset) {
      case 'anime4k':
        updateShaderConfig({
          brightness: 2,
          contrast: 1.25,
          saturation: 1.2,
          ambientGlowEnabled: true,
        });
        break;
      case 'hdr':
        updateShaderConfig({
          brightness: -2,
          contrast: 1.3,
          saturation: 1.25,
          ambientGlowEnabled: true,
        });
        break;
      case 'vivid':
        updateShaderConfig({
          brightness: 5,
          contrast: 1.15,
          saturation: 1.45,
          ambientGlowEnabled: true,
        });
        break;
      case 'night':
        updateShaderConfig({
          brightness: 25,
          contrast: 1.1,
          saturation: 0.95,
          ambientGlowEnabled: true,
        });
        break;
      case 'crisp':
        updateShaderConfig({
          brightness: 0,
          contrast: 1.1,
          saturation: 1.08,
          ambientGlowEnabled: true,
        });
        break;
      case 'neutral':
        updateShaderConfig({
          brightness: 0,
          contrast: 1.0,
          saturation: 1.0,
          ambientGlowEnabled: true,
        });
        break;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md animate-in fade-in duration-200 select-none p-4">
      <div className="glass-panel w-full max-w-2xl p-6 rounded-3xl flex flex-col gap-5 border border-white/20 shadow-2xl max-h-[88vh] overflow-hidden bg-slate-950/95">
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
              <h2 className="text-lg font-bold text-white tracking-tight">Player Customization & Video DSP</h2>
              <p className="text-xs text-white/50">10 Luxury Themes, Anime4K Video Quality Enhancer, and Aspect Ratios</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2.5 rounded-full hover:bg-white/10 text-white/60 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 border-b border-white/10 pb-2.5">
          <button
            onClick={() => setActiveTab('themes')}
            className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-semibold transition-all ${
              activeTab === 'themes'
                ? `${currentTheme.badgeClass} shadow-md`
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <Palette className="w-3.5 h-3.5" />
            10 Player Themes
          </button>

          <button
            onClick={() => setActiveTab('quality')}
            className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-semibold transition-all ${
              activeTab === 'quality'
                ? `${currentTheme.badgeClass} shadow-md`
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            Video Quality Enhancers
          </button>

          <button
            onClick={() => setActiveTab('tools')}
            className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-semibold transition-all ${
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
                        {/* Dual-color preview orb */}
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
                          <span className="text-xs font-bold text-white truncate">
                            {t.name}
                          </span>
                          <span className="text-[10px] text-white/50 truncate">
                            {t.tagline}
                          </span>
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
            </div>
          )}

          {/* TAB 2: IN-BUILD VIDEO QUALITY ENHANCERS */}
          {activeTab === 'quality' && (
            <div className="flex flex-col gap-5">
              {/* 1-Click One-Touch Quality Presets */}
              <div className="flex flex-col gap-2.5">
                <span className="text-xs font-semibold text-white/80 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-cyan-400" />
                  1-Click Video Quality Optimizers (Anime4K & Shaders)
                </span>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {[
                    {
                      id: 'anime4k',
                      name: 'Anime4K Sharp',
                      desc: 'Crisp line art & upscaled clarity',
                      color: 'from-fuchsia-500 to-cyan-500',
                    },
                    {
                      id: 'hdr',
                      name: 'Cinematic HDR',
                      desc: 'Dynamic tone mapping & contrast',
                      color: 'from-amber-500 to-rose-500',
                    },
                    {
                      id: 'vivid',
                      name: 'Vivid Vibrance',
                      desc: 'Deep color saturation & punch',
                      color: 'from-emerald-400 to-teal-500',
                    },
                    {
                      id: 'night',
                      name: 'Night Vision Boost',
                      desc: 'Lift dark shadows & low-light',
                      color: 'from-sky-400 to-indigo-500',
                    },
                    {
                      id: 'crisp',
                      name: 'Studio Crisp Hi-Fi',
                      desc: 'Balanced clarity & true color',
                      color: 'from-slate-300 to-zinc-400',
                    },
                    {
                      id: 'neutral',
                      name: 'Neutral Native',
                      desc: 'Unfiltered raw source',
                      color: 'from-white/20 to-white/10',
                    },
                  ].map((p) => (
                    <button
                      key={p.id}
                      onClick={() => applyQualityPreset(p.id as any)}
                      className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-left flex flex-col gap-1 transition-all active:scale-95"
                    >
                      <span className="text-xs font-bold text-white flex items-center gap-1.5">
                        <span
                          className={`w-2 h-2 rounded-full bg-gradient-to-r ${p.color}`}
                        />
                        {p.name}
                      </span>
                      <span className="text-[10px] text-white/50">{p.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Fine-Tuning Sliders */}
              <div className="flex flex-col gap-4 border-t border-white/10 pt-4">
                <span className="text-xs font-semibold text-white/70">
                  Manual Color Grading Sliders
                </span>

                {/* Brightness */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between text-xs text-white/80">
                    <span className="flex items-center gap-1.5">
                      <Sun className="w-3.5 h-3.5 text-amber-400" />
                      Brightness
                    </span>
                    <span className="font-mono text-cyan-400">{shaderConfig.brightness ?? 0}%</span>
                  </div>
                  <input
                    type="range"
                    min={-50}
                    max={50}
                    step={1}
                    value={shaderConfig.brightness ?? 0}
                    onChange={(e) => updateShaderConfig({ brightness: parseInt(e.target.value, 10) })}
                    className="w-full h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                  />
                </div>

                {/* Contrast */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between text-xs text-white/80">
                    <span className="flex items-center gap-1.5">
                      <Contrast className="w-3.5 h-3.5 text-indigo-400" />
                      Contrast
                    </span>
                    <span className="font-mono text-cyan-400">
                      {(shaderConfig.contrast * 100).toFixed(0)}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0.5}
                    max={1.5}
                    step={0.05}
                    value={shaderConfig.contrast}
                    onChange={(e) => updateShaderConfig({ contrast: parseFloat(e.target.value) })}
                    className="w-full h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                  />
                </div>

                {/* Saturation */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between text-xs text-white/80">
                    <span className="flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                      Saturation & Vibrance
                    </span>
                    <span className="font-mono text-cyan-400">
                      {(shaderConfig.saturation * 100).toFixed(0)}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={2.0}
                    step={0.05}
                    value={shaderConfig.saturation}
                    onChange={(e) => updateShaderConfig({ saturation: parseFloat(e.target.value) })}
                    className="w-full h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                  />
                </div>

                {/* Ambient Glow Toggle */}
                <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white/5 border border-white/10 mt-1">
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-white">
                      Real-Time Ambient Glow Canvas
                    </span>
                    <span className="text-[10px] text-white/40">
                      Synchronizes dynamic halo reflections behind video
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={shaderConfig.ambientGlowEnabled}
                    onChange={(e) => updateShaderConfig({ ambientGlowEnabled: e.target.checked })}
                    className="w-4 h-4 accent-cyan-400 cursor-pointer"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: ASPECT RATIO & TOOLS */}
          {activeTab === 'tools' && (
            <div className="flex flex-col gap-5">
              {/* Aspect Ratio Selection */}
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

              {/* Quick Tools Row: Snapshot, PiP, Loop, Equalizer */}
              <div className="flex flex-col gap-2.5 border-t border-white/10 pt-4">
                <span className="text-xs font-semibold text-white/70">
                  Quick Player Utilities
                </span>
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
                    <span className="text-[11px] font-semibold">
                      {isLooping ? 'Loop: On' : 'Loop: Off'}
                    </span>
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
            </div>
          )}
        </div>

        {/* Footer Reset Button */}
        <div className="flex justify-between items-center pt-3 border-t border-white/10">
          <span className="text-[11px] text-white/40 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            Theme and settings stored in persistent state
          </span>
          <button
            onClick={() =>
              updateShaderConfig({
                brightness: 0,
                contrast: 1.0,
                saturation: 1.0,
                aspectRatio: 'auto',
                ambientGlowEnabled: true,
              })
            }
            className="text-xs text-white/60 hover:text-white px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
          >
            Reset Settings
          </button>
        </div>
      </div>
    </div>
  );
};
