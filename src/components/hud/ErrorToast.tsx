import React from 'react';
import { usePlayerStore } from '../../store/playerStore';
import { AlertCircle, RefreshCw, X, Bookmark } from 'lucide-react';

export const ErrorToast: React.FC = () => {
  const lastError = usePlayerStore((s) => s.lastError);
  const dismissError = usePlayerStore((s) => s.dismissError);

  if (!lastError) return null;

  const isBookmark = lastError.code === 'BOOKMARK_SAVED';

  return (
    <div className="fixed top-6 right-6 z-50 max-w-md animate-in slide-in-from-top-4 duration-300">
      <div
        className={`glass-panel p-4 rounded-xl shadow-2xl flex items-start gap-3 bg-slate-900/90 border ${
          isBookmark ? 'border-sky-400/40 shadow-sky-500/10' : 'border-rose-500/30'
        }`}
      >
        {isBookmark ? (
          <Bookmark className="w-5 h-5 text-amber-400 shrink-0 mt-0.5 fill-amber-400/20" />
        ) : (
          <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
        )}
        <div className="flex-1 flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <span
              className={`text-xs font-mono font-semibold uppercase tracking-wider ${
                isBookmark ? 'text-sky-300' : 'text-rose-400'
              }`}
            >
              {lastError.code}
            </span>
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full ${
                isBookmark
                  ? 'bg-sky-500/20 text-sky-300'
                  : 'bg-rose-500/20 text-rose-300'
              }`}
            >
              {isBookmark ? 'saved' : lastError.severity}
            </span>
          </div>
          <p className="text-sm font-medium text-white">{lastError.message}</p>
          {lastError.details && (
            <p className="text-xs text-white/60 line-clamp-2 font-mono">{lastError.details}</p>
          )}
          {lastError.recovery !== 'none' && (
            <div className="mt-1 flex items-center gap-1.5 text-xs text-sky-400">
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>Self-healing: {lastError.recovery.replace(/_/g, ' ')}</span>
            </div>
          )}
        </div>
        <button
          onClick={dismissError}
          className="text-white/60 hover:text-white transition-colors p-1"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
