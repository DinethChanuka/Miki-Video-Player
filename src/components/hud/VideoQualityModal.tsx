import React from 'react';
import { usePlayerStore } from '../../store/playerStore';
import { PLAYER_THEMES } from '../../types/theme';
import { VideoShaderConfig } from '../../core/PlayerEngine';
import {
  X,
  Sparkles,
  Sun,
  Contrast,
  ShieldCheck,
  Zap,
  SlidersHorizontal,
  Split,
  Eye,
} from 'lucide-react';

interface VideoQualityModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const VideoQualityModal: React.FC<VideoQualityModalProps> = ({ isOpen, onClose }) => {
  const themeId = usePlayerStore((s) => s.themeId);
  const theme = PLAYER_THEMES[themeId] || PLAYER_THEMES.cyberpunk;

  const shaderConfig = usePlayerStore((s) => s.shaderConfig);
  const updateShaderConfig = usePlayerStore((s) => s.updateShaderConfig);

  if (!isOpen) return null;

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
              <Sparkles className="w-5 h-5 fill-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white tracking-tight">
                  Video Resolution & Clarity Improvement Engine
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
                  Super-Res AI
                </span>
              </div>
              <p className="text-xs text-white/50">
                Real-time GPU shader upscaling, Anime4K edge clarity, and de-noising
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 text-white/60 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-5">
          {/* 1-Click Super-Resolution Presets */}
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
                        ? `bg-white/10 ${theme.glassBorder} shadow-lg ring-1 ring-white/30 scale-[1.01]`
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

          {/* Interactive Split-Screen Before/After Compare Mode */}
          <div className="p-4 rounded-3xl bg-white/5 border border-white/10 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-purple-500/20 text-purple-300">
                  <Split className="w-4 h-4" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-white">
                    Live Split-Screen Compare Mode
                  </span>
                  <span className="text-[10px] text-white/40">
                    Compare Original Source (Left) vs Super-Resolution (Right)
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
                <span>{shaderConfig.splitCompareEnabled ? 'Split On' : 'Split Off'}</span>
              </button>
            </div>

            {shaderConfig.splitCompareEnabled && (
              <div className="flex flex-col gap-1.5 pt-2 border-t border-white/10">
                <div className="flex items-center justify-between text-xs text-white/70 font-mono">
                  <span>Divider Position</span>
                  <span className="text-purple-300 font-bold">
                    {shaderConfig.splitComparePosition ?? 50}%
                  </span>
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
              Clarity & Shader Parameters
            </span>

            {/* Resolution Upscale Clarity */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-xs text-white/80">
                <span>Texture Detail & Clarity Extraction</span>
                <span className="font-mono text-cyan-400">
                  {Math.round((shaderConfig.clarityBoost ?? 0) * 100)}%
                </span>
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

            {/* Edge Sharpening */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-xs text-white/80">
                <span>Edge Sharpening (Unsharp Masking)</span>
                <span className="font-mono text-cyan-400">
                  {Math.round((shaderConfig.sharpness ?? 0) * 100)}%
                </span>
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

            {/* Compression De-Noising */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-xs text-white/80">
                <span>Compression Artifact Reduction & Smoothing</span>
                <span className="font-mono text-cyan-400">
                  {Math.round((shaderConfig.deNoise ?? 0) * 100)}%
                </span>
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

            {/* Contrast */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-xs text-white/80">
                <span className="flex items-center gap-1.5">
                  <Contrast className="w-3.5 h-3.5 text-indigo-400" />
                  Dynamic Contrast
                </span>
                <span className="font-mono text-cyan-400">
                  {Math.round(shaderConfig.contrast * 100)}%
                </span>
              </div>
              <input
                type="range"
                min={0.5}
                max={1.6}
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
                  <Sun className="w-3.5 h-3.5 text-amber-400" />
                  Color Vibrance
                </span>
                <span className="font-mono text-cyan-400">
                  {Math.round(shaderConfig.saturation * 100)}%
                </span>
              </div>
              <input
                type="range"
                min={0.5}
                max={2.0}
                step={0.05}
                value={shaderConfig.saturation}
                onChange={(e) => updateShaderConfig({ saturation: parseFloat(e.target.value) })}
                className="w-full h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-white/10">
          <span className="text-[11px] text-white/40 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            GPU-accelerated real-time post-processing shaders
          </span>
          <button
            onClick={() =>
              updateShaderConfig({
                superResolution: 'off',
                sharpness: 0,
                clarityBoost: 0,
                deNoise: 0,
                contrast: 1.0,
                saturation: 1.0,
                brightness: 0,
                splitCompareEnabled: false,
              })
            }
            className="text-xs text-white/60 hover:text-white px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
          >
            Reset Filters
          </button>
        </div>
      </div>
    </div>
  );
};
