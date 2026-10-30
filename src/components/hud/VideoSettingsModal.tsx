import React from 'react';
import { usePlayerStore } from '../../store/playerStore';
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
    } catch {
      // PiP not supported or permission denied
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md animate-in fade-in duration-200 select-none">
      <div className="glass-panel w-full max-w-xl p-6 rounded-3xl flex flex-col gap-6 border border-white/20 shadow-2xl max-h-[85vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-400/30">
              <SlidersHorizontal className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">Video & Player Settings</h2>
              <p className="text-xs text-white/50">Customized color grading, shaders, aspect ratios and tools</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-white/60 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Tools Row: Snapshot, PiP, Loop, Equalizer */}
        <div className="grid grid-cols-4 gap-2.5">
          <button
            onClick={takeSnapshot}
            className="flex flex-col items-center justify-center gap-2 p-3 rounded-2xl glass-pill hover:border-sky-400/40 transition-all text-center"
            title="Lossless Frame Snapshot"
          >
            <Camera className="w-5 h-5 text-sky-400" />
            <span className="text-[11px] font-semibold text-white/80">Snapshot</span>
          </button>

          <button
            onClick={togglePiP}
            className="flex flex-col items-center justify-center gap-2 p-3 rounded-2xl glass-pill hover:border-sky-400/40 transition-all text-center"
            title="Picture in Picture"
          >
            <Tv className="w-5 h-5 text-indigo-400" />
            <span className="text-[11px] font-semibold text-white/80">PiP Mode</span>
          </button>

          <button
            onClick={toggleLoop}
            className={`flex flex-col items-center justify-center gap-2 p-3 rounded-2xl transition-all text-center ${
              isLooping
                ? 'bg-sky-500/20 text-sky-300 border border-sky-400/40 shadow-lg shadow-sky-500/20'
                : 'glass-pill text-white/80'
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
            className="flex flex-col items-center justify-center gap-2 p-3 rounded-2xl glass-pill hover:border-sky-400/40 transition-all text-center"
            title="Audio Equalizer"
          >
            <SlidersHorizontal className="w-5 h-5 text-emerald-400" />
            <span className="text-[11px] font-semibold text-white/80">Audio DSP</span>
          </button>
        </div>

        {/* Aspect Ratio Selection */}
        <div className="flex flex-col gap-2.5">
          <label className="text-xs font-semibold text-white/70 flex items-center gap-2">
            <Ratio className="w-4 h-4 text-sky-400" />
            Aspect Ratio & Crop Fit
          </label>
          <div className="grid grid-cols-6 gap-2">
            {(['auto', '16:9', '4:3', '21:9', '1:1', 'fill'] as const).map((ratio) => (
              <button
                key={ratio}
                onClick={() => updateShaderConfig({ aspectRatio: ratio })}
                className={`py-2 px-1 rounded-xl text-xs font-mono font-semibold transition-all uppercase ${
                  shaderConfig.aspectRatio === ratio
                    ? 'bg-sky-500 text-slate-950 font-bold shadow-md shadow-sky-500/30'
                    : 'glass-pill text-white/70 hover:text-white'
                }`}
              >
                {ratio}
              </button>
            ))}
          </div>
        </div>

        {/* Color Grading & Shaders Sliders */}
        <div className="flex flex-col gap-4 border-t border-white/10 pt-4">
          <span className="text-xs font-semibold text-white/70 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-accent" />
            Visual Enhancement & Shaders
          </span>

          {/* Ambient Lighting Glow Toggle */}
          <div className="flex items-center justify-between p-3 rounded-2xl glass-pill">
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-white">YouTube-Style Ambient Glow</span>
              <span className="text-[10px] text-white/40">
                Projects blurred real-time video colors behind the screen
              </span>
            </div>
            <input
              type="checkbox"
              checked={shaderConfig.ambientGlowEnabled}
              onChange={(e) => updateShaderConfig({ ambientGlowEnabled: e.target.checked })}
              className="w-4 h-4 accent-sky-400 cursor-pointer"
            />
          </div>

          {/* Brightness */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-xs text-white/80">
              <span className="flex items-center gap-1.5">
                <Sun className="w-3.5 h-3.5 text-amber-400" />
                Brightness
              </span>
              <span className="font-mono text-sky-400">{shaderConfig.brightness ?? 0}%</span>
            </div>
            <input
              type="range"
              min={-50}
              max={50}
              step={1}
              value={shaderConfig.brightness ?? 0}
              onChange={(e) => updateShaderConfig({ brightness: parseInt(e.target.value, 10) })}
              className="w-full h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer accent-sky-400"
            />
          </div>

          {/* Contrast */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-xs text-white/80">
              <span className="flex items-center gap-1.5">
                <Contrast className="w-3.5 h-3.5 text-indigo-400" />
                Contrast
              </span>
              <span className="font-mono text-sky-400">{(shaderConfig.contrast * 100).toFixed(0)}%</span>
            </div>
            <input
              type="range"
              min={0.5}
              max={1.5}
              step={0.05}
              value={shaderConfig.contrast}
              onChange={(e) => updateShaderConfig({ contrast: parseFloat(e.target.value) })}
              className="w-full h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer accent-sky-400"
            />
          </div>

          {/* Saturation */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-xs text-white/80">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                Saturation & Vibrance
              </span>
              <span className="font-mono text-sky-400">{(shaderConfig.saturation * 100).toFixed(0)}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={2.0}
              step={0.05}
              value={shaderConfig.saturation}
              onChange={(e) => updateShaderConfig({ saturation: parseFloat(e.target.value) })}
              className="w-full h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer accent-sky-400"
            />
          </div>
        </div>

        {/* Footer Reset Button */}
        <div className="flex justify-end pt-2 border-t border-white/10">
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
            className="text-xs text-white/60 hover:text-white glass-pill px-4 py-2 rounded-xl transition-colors"
          >
            Reset Video Settings
          </button>
        </div>
      </div>
    </div>
  );
};

