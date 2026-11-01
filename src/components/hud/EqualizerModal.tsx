import React from 'react';
import { usePlayerStore } from '../../store/playerStore';
import { X, Moon, RotateCcw } from 'lucide-react';

interface EqualizerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const FREQUENCY_LABELS = ['31Hz', '62Hz', '125Hz', '250Hz', '500Hz', '1kHz', '2kHz', '4kHz', '8kHz', '16kHz'];

export const EqualizerModal: React.FC<EqualizerModalProps> = ({ isOpen, onClose }) => {
  const eqGainsDb = usePlayerStore((s) => s.eqGainsDb);
  const nightModeEnabled = usePlayerStore((s) => s.nightModeEnabled);
  const setEqualizer = usePlayerStore((s) => s.setEqualizer);

  if (!isOpen) return null;

  const handleGainChange = (index: number, value: number) => {
    const updated = [...eqGainsDb];
    updated[index] = value;
    setEqualizer(updated, nightModeEnabled);
  };

  const handleReset = () => {
    setEqualizer([0, 0, 0, 0, 0, 0, 0, 0, 0, 0], false);
  };

  const toggleNightMode = () => {
    setEqualizer(eqGainsDb, !nightModeEnabled);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="glass-panel w-full max-w-2xl p-6 rounded-2xl shadow-2xl flex flex-col gap-6 border border-white/20">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold tracking-tight text-white">Equalizer</h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-400/30">
              10-Band
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-white/70 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 10-Band Vertical Sliders */}
        <div className="grid grid-cols-10 gap-3 py-4 items-end h-56">
          {FREQUENCY_LABELS.map((label, idx) => {
            const gain = eqGainsDb[idx] ?? 0;
            return (
              <div key={label} className="flex flex-col items-center h-full justify-between gap-2">
                <span className="text-[11px] font-mono text-sky-400 font-semibold">
                  {gain > 0 ? `+${gain.toFixed(0)}` : gain.toFixed(0)}dB
                </span>
                <div className="relative flex-1 flex items-center justify-center w-full">
                  <input
                    type="range"
                    min={-20}
                    max={20}
                    step={1}
                    value={gain}
                    onChange={(e) => handleGainChange(idx, parseFloat(e.target.value))}
                    className="w-32 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer -rotate-90 origin-center accent-sky-400"
                  />
                </div>
                <span className="text-[11px] font-medium text-white/70 mt-1">{label}</span>
              </div>
            );
          })}
        </div>

        {/* Footer Actions: Night Mode & Reset */}
        <div className="flex items-center justify-between pt-4 border-t border-white/10">
          <button
            onClick={toggleNightMode}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              nightModeEnabled
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30 border border-indigo-400/40'
                : 'glass-pill text-white/80'
            }`}
          >
            <Moon className="w-4 h-4" />
            Night Mode (DRC)
          </button>

          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white/80 glass-pill transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            Reset to Flat
          </button>
        </div>
      </div>
    </div>
  );
};
