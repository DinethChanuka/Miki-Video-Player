import React from 'react';
import { MediaHistoryItem } from '../../store/playerStore';
import { PLAYER_THEMES } from '../../types/theme';
import { usePlayerStore } from '../../store/playerStore';
import {
  Play,
  RotateCcw,
  X,
  Clock,
  Film,
} from 'lucide-react';

interface ResumeChoiceModalProps {
  item: MediaHistoryItem | null;
  isOpen: boolean;
  onClose: () => void;
  onResume: (item: MediaHistoryItem) => void;
  onRestart: (item: MediaHistoryItem) => void;
}

export const ResumeChoiceModal: React.FC<ResumeChoiceModalProps> = ({
  item,
  isOpen,
  onClose,
  onResume,
  onRestart,
}) => {
  const themeId = usePlayerStore((s) => s.themeId);
  const theme = PLAYER_THEMES[themeId] || PLAYER_THEMES.cyberpunk;

  if (!isOpen || !item) return null;

  const formatTime = (ms: number) => {
    const totalSec = Math.max(0, Math.floor(ms / 1000));
    const h = Math.floor(totalSec / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    const s = totalSec % 60;
    if (h > 0) {
      return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const percent = Math.min(100, Math.max(0, item.progressPercent || 0));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md animate-in fade-in duration-200 select-none p-4">
      <div
        className={`w-full max-w-md p-6 rounded-3xl flex flex-col gap-5 border shadow-2xl bg-slate-950/95 ${theme.glassBorder}`}
        style={{
          boxShadow: `0 20px 50px rgba(0, 0, 0, 0.8), 0 0 30px ${theme.haloGlow}`,
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2.5">
            <div
              className={`p-2 rounded-xl bg-gradient-to-r ${theme.accentGradient} text-white shadow-md`}
            >
              <Film className="w-4 h-4 fill-white" />
            </div>
            <h3 className="text-base font-bold text-white tracking-tight">
              Resume Playback
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-white/60 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Media Preview Card */}
        <div className="flex flex-col gap-3">
          {/* Stopped-Point Thumbnail Preview */}
          <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-black/60 border border-white/10 shadow-inner">
            {item.thumbnailUri ? (
              <img
                src={item.thumbnailUri}
                alt={item.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-white/30 gap-1.5 bg-gradient-to-br from-slate-900 to-black">
                <Film className="w-8 h-8 opacity-40 text-cyan-400" />
                <span className="text-[10px] font-mono">Stopped Point Frame</span>
              </div>
            )}

            {/* Position badge */}
            <div className="absolute bottom-2 right-2 px-2.5 py-1 rounded-lg bg-black/85 backdrop-blur-md text-[11px] font-mono font-bold text-white border border-white/20">
              {formatTime(item.lastPositionMs)} / {formatTime(item.durationMs)}
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <h4 className="text-sm font-bold text-white line-clamp-2 leading-snug">
              {item.title}
            </h4>

            <div className="flex items-center justify-between text-xs text-white/60 mt-1">
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-cyan-400" />
                Last stopped at <strong className="text-white font-mono">{formatTime(item.lastPositionMs)}</strong>
              </span>
              <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md ${theme.badgeClass}`}>
                {percent.toFixed(0)}% watched
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden mt-1.5 p-0.5">
              <div
                className={`h-full rounded-full bg-gradient-to-r ${theme.timelineTrack}`}
                style={{ width: `${percent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Choice Prompt Buttons */}
        <div className="flex flex-col gap-2.5 pt-2 border-t border-white/10">
          <button
            onClick={() => onResume(item)}
            className={`w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r ${theme.accentGradient} text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg hover:brightness-110 active:scale-98 transition-all`}
            style={{ boxShadow: `0 4px 18px ${theme.haloGlow}` }}
          >
            <Play className="w-4 h-4 fill-white" />
            <span>Resume from {formatTime(item.lastPositionMs)}</span>
          </button>

          <button
            onClick={() => onRestart(item)}
            className="w-full py-3 px-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/90 hover:text-white font-semibold text-xs flex items-center justify-center gap-2 active:scale-98 transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5 text-cyan-400" />
            <span>Play from Beginning (0:00)</span>
          </button>
        </div>
      </div>
    </div>
  );
};

