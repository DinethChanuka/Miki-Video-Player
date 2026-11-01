import React from 'react';
import { usePlayerStore } from '../../store/playerStore';
import { AlertCircle, RefreshCw, X, Bookmark, Trash2, FileQuestion } from 'lucide-react';

export const ErrorToast: React.FC = () => {
  const lastError = usePlayerStore((s) => s.lastError);
  const dismissError = usePlayerStore((s) => s.dismissError);
  const currentUri = usePlayerStore((s) => s.currentUri);
  const removeRecentMedia = usePlayerStore((s) => s.removeRecentMedia);

  if (!lastError) return null;

  const isBookmark = lastError.code === 'BOOKMARK_SAVED';
  const isMissingOrMoved =
    lastError.code === 'MEDIA_NOT_FOUND' ||
    (lastError.message && lastError.message.toLowerCase().includes('not found')) ||
    (lastError.details && lastError.details.toLowerCase().includes('404')) ||
    (lastError.code === 'CODEC_UNSUPPORTED' && currentUri && !currentUri.startsWith('http'));

  const handleRemoveFromRecent = () => {
    if (currentUri) {
      removeRecentMedia(currentUri);
    }
    dismissError();
  };

  // Missing or moved media: Enhanced Smart Alert Modal
  if (isMissingOrMoved) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
        <div className="max-w-md w-full bg-slate-900/95 border border-amber-500/30 rounded-3xl p-6 shadow-2xl flex flex-col gap-4">
          <div className="flex items-start gap-3.5">
            <div className="p-3 rounded-2xl bg-amber-500/15 border border-amber-500/25 text-amber-400 shrink-0">
              <FileQuestion className="w-6 h-6" />
            </div>
            <div className="flex-1 flex flex-col gap-1">
              <h3 className="text-base font-semibold text-white tracking-wide">
                Media File Moved or Unavailable
              </h3>
              <p className="text-xs text-white/70 leading-relaxed">
                The selected video file could not be accessed at its recorded location. It may have been moved, renamed, or deleted.
              </p>
            </div>
          </div>

          {currentUri && (
            <div className="p-3 rounded-xl bg-black/50 border border-white/10 text-xs font-mono text-white/60 truncate selection:bg-amber-500/30">
              {currentUri}
            </div>
          )}

          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-white/10">
            <button
              onClick={dismissError}
              className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-medium text-white/80 transition-colors"
            >
              Dismiss
            </button>
            <button
              onClick={handleRemoveFromRecent}
              className="px-4 py-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/30 text-xs font-semibold text-rose-300 hover:text-white flex items-center gap-1.5 transition-all shadow-lg shadow-rose-500/10"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Remove from Recents
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Standard non-blocking toast
  return (
    <div className="fixed top-6 right-6 z-50 max-w-md animate-in slide-in-from-top-4 duration-300">
      <div
        className={`glass-panel p-4 rounded-2xl shadow-2xl flex items-start gap-3 bg-slate-950/90 border backdrop-blur-xl ${
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
              className={`text-[10px] px-2 py-0.5 rounded-full font-mono ${
                isBookmark
                  ? 'bg-sky-500/20 text-sky-300 border border-sky-400/30'
                  : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
              }`}
            >
              {isBookmark ? 'SAVED' : lastError.severity}
            </span>
          </div>
          <p className="text-sm font-semibold text-white">{lastError.message}</p>
          {lastError.details && (
            <p className="text-xs text-slate-300 line-clamp-2 font-mono">{lastError.details}</p>
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
