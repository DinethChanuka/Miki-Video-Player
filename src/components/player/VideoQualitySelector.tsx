import React, { useState, useRef, useEffect } from 'react';
import { usePlayerStore } from '../../store/playerStore';
import { Check, Settings, Sparkles } from 'lucide-react';

export const VideoQualitySelector: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const streamQualityLevels = usePlayerStore((s) => s.streamQualityLevels);
  const currentQualityLevel = usePlayerStore((s) => s.currentQualityLevel);
  const setStreamQuality = usePlayerStore((s) => s.setStreamQuality);

  // Close on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [isOpen]);

  // Don't render if no stream quality levels are available (e.g. direct mp4 or audio)
  if (!streamQualityLevels || streamQualityLevels.length <= 1) {
    return null;
  }

  // Find active level display label
  const activeLevel = streamQualityLevels.find((lvl) => lvl.id === currentQualityLevel);
  const displayLabel = currentQualityLevel === -1 ? 'Auto' : activeLevel?.name || 'HD';

  return (
    <div className="relative inline-block" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-semibold tracking-wide transition-all border ${
          isOpen
            ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400/50 shadow-md shadow-cyan-500/20'
            : 'bg-white/5 text-white/80 hover:text-white hover:bg-white/10 border-white/10'
        }`}
        title="Change Stream Video Quality"
      >
        <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
        <span>{displayLabel}</span>
      </button>

      {isOpen && (
        <div className="absolute bottom-full mb-2 right-0 w-48 bg-slate-950/95 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl p-2 z-50 flex flex-col gap-1 animate-in fade-in zoom-in-95 duration-150">
          <div className="px-2.5 py-1.5 border-b border-white/10 flex items-center justify-between">
            <span className="text-[11px] font-bold text-white/50 uppercase tracking-wider">Stream Quality</span>
            <Settings className="w-3 h-3 text-white/40" />
          </div>

          <div className="flex flex-col gap-0.5 max-h-56 overflow-y-auto">
            {streamQualityLevels.map((lvl) => {
              const isSelected = lvl.id === currentQualityLevel;
              return (
                <button
                  key={lvl.id}
                  onClick={() => {
                    setStreamQuality(lvl.id);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs font-medium transition-all ${
                    isSelected
                      ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-400/30'
                      : 'text-white/70 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span>{lvl.name}</span>
                    {lvl.bitrate > 0 && (
                      <span className="text-[10px] text-white/40 font-mono">
                        {Math.round(lvl.bitrate / 1000)}k
                      </span>
                    )}
                  </div>
                  {isSelected && <Check className="w-3.5 h-3.5 text-cyan-400" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
