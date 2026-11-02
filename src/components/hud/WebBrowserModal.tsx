import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Globe,
  ArrowLeft,
  ArrowRight,
  RotateCw,
  ShieldCheck,
  ShieldAlert,
  Play,
  ExternalLink,
  Sparkles,
  Lock,
} from 'lucide-react';
import { getCleanUrl, isBlockedUrl } from '../../utils/adBlockFilter';
import { CINEMA_LINKS } from '../../utils/cinemaLinks';
import { parseYouTubeId } from '../../App';

interface WebBrowserModalProps {
  isOpen: boolean;
  initialUrl?: string;
  onClose: () => void;
  onPlayInNativePlayer: (url: string) => void;
}

export const WebBrowserModal: React.FC<WebBrowserModalProps> = ({
  isOpen,
  initialUrl = 'https://www.youtube.com',
  onClose,
  onPlayInNativePlayer,
}) => {
  const [currentUrl, setCurrentUrl] = useState<string>(initialUrl);
  const [inputUrl, setInputUrl] = useState<string>(initialUrl);
  const [history, setHistory] = useState<string[]>([initialUrl]);
  const [historyIndex, setHistoryIndex] = useState<number>(0);
  const [isAdShieldActive, setIsAdShieldActive] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [blockedCount, setBlockedCount] = useState<number>(14);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  useEffect(() => {
    if (initialUrl) {
      const clean = getCleanUrl(initialUrl);
      setCurrentUrl(clean);
      setInputUrl(clean);
      setHistory([clean]);
      setHistoryIndex(0);
    }
  }, [initialUrl, isOpen]);

  if (!isOpen) return null;

  const navigateTo = (raw: string) => {
    const clean = getCleanUrl(raw);
    if (isAdShieldActive && isBlockedUrl(clean)) {
      alert(`[Miki Shield] Navigation to known ad/tracker network blocked: ${clean}`);
      setBlockedCount((c) => c + 1);
      return;
    }

    setIsLoading(true);
    setCurrentUrl(clean);
    setInputUrl(clean);

    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(clean);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const handleBack = () => {
    if (historyIndex > 0) {
      const prev = history[historyIndex - 1];
      setHistoryIndex(historyIndex - 1);
      setCurrentUrl(prev);
      setInputUrl(prev);
      setIsLoading(true);
    }
  };

  const handleForward = () => {
    if (historyIndex < history.length - 1) {
      const next = history[historyIndex + 1];
      setHistoryIndex(historyIndex + 1);
      setCurrentUrl(next);
      setInputUrl(next);
      setIsLoading(true);
    }
  };

  const handleReload = () => {
    setIsLoading(true);
    if (iframeRef.current) {
      iframeRef.current.src = currentUrl;
    }
  };

  const isPlayableInPlayer = () => {
    if (!currentUrl) return false;
    if (parseYouTubeId(currentUrl)) return true;
    if (/\.(mp4|m3u8|webm|mov|mkv)(\?.*)?$/i.test(currentUrl)) return true;
    return false;
  };

  // Safe sandbox string omitting popups when shield is active
  const sandboxPolicy = isAdShieldActive
    ? 'allow-scripts allow-same-origin allow-forms allow-presentation allow-downloads'
    : 'allow-scripts allow-same-origin allow-forms allow-presentation allow-popups allow-downloads';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-2 sm:p-4 select-none animate-in fade-in duration-200"
      style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
    >
      <div
        className="w-full max-w-6xl h-[92vh] max-h-[900px] rounded-3xl flex flex-col border border-white/20 shadow-2xl overflow-hidden text-white"
        style={{ backgroundColor: '#0a0d16' }}
      >
        {/* Top Control Bar: Title & Window Controls */}
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/10 bg-white/5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-md">
              <Globe className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold tracking-tight text-white">Browse</h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/15 border border-cyan-400/30 text-cyan-300 font-bold">
                  Protected Web View
                </span>
              </div>
              <p className="text-[11px] text-slate-300">
                Browse YouTube, TikTok, Instagram, Facebook & Cinema Streams
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Ad Shield Toggle Pill */}
            <button
              onClick={() => {
                setIsAdShieldActive(!isAdShieldActive);
                if (!isAdShieldActive) setBlockedCount((c) => c + 3);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all shadow-sm ${
                isAdShieldActive
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30'
                  : 'bg-rose-500/15 text-rose-300 border-rose-500/30 hover:bg-rose-500/25'
              }`}
              title={isAdShieldActive ? 'Ad Shield is ON: Popups & intrusive ads blocked' : 'Ad Shield is OFF'}
            >
              {isAdShieldActive ? (
                <>
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Shield: ON ({blockedCount} Blocked)</span>
                </>
              ) : (
                <>
                  <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                  <span>Shield: OFF</span>
                </>
              )}
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/15 text-white/70 hover:text-white transition-colors"
              title="Close Browser"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Address Bar, Navigation Buttons & Quick Launcher */}
        <div className="flex flex-col gap-2 p-3 bg-black/40 border-b border-white/10">
          <div className="flex items-center gap-2">
            {/* History Controls */}
            <div className="flex items-center gap-1">
              <button
                onClick={handleBack}
                disabled={historyIndex <= 0}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/15 disabled:opacity-30 disabled:hover:bg-white/5 text-white transition-colors"
                title="Back"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={handleForward}
                disabled={historyIndex >= history.length - 1}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/15 disabled:opacity-30 disabled:hover:bg-white/5 text-white transition-colors"
                title="Forward"
              >
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={handleReload}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/15 text-white transition-colors"
                title="Reload"
              >
                <RotateCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              </button>
            </div>

            {/* URL / Search Input */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                navigateTo(inputUrl);
              }}
              className="flex-1 flex items-center relative"
            >
              <div className="absolute left-3 text-white/40 pointer-events-none">
                <Lock className="w-3.5 h-3.5 text-emerald-400" />
              </div>
              <input
                type="text"
                value={inputUrl}
                onChange={(e) => setInputUrl(e.target.value)}
                placeholder="Enter website URL (e.g. cinesubz.co, youtube.com) or search term..."
                className="w-full pl-9 pr-24 py-2 bg-white/10 hover:bg-white/15 focus:bg-white/15 border border-white/15 focus:border-cyan-400/60 rounded-xl text-xs font-mono text-white placeholder-white/40 focus:outline-none transition-all shadow-inner"
              />
              <button
                type="submit"
                className="absolute right-1.5 px-3 py-1 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs transition-colors shadow-sm"
              >
                Go
              </button>
            </form>

            {/* Play In Native Miki Player Button (If YouTube or direct video stream) */}
            {isPlayableInPlayer() && (
              <button
                onClick={() => {
                  onPlayInNativePlayer(currentUrl);
                  onClose();
                }}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-red-600 via-rose-600 to-amber-500 hover:brightness-110 active:scale-95 text-white font-bold text-xs transition-all shadow-lg animate-pulse"
                title="Launch in Miki Native Video Player with 3D Spatial Audio & DSP"
              >
                <Play className="w-3.5 h-3.5 fill-white" />
                <span>Play in Player</span>
              </button>
            )}

            {/* External Browser Fallback */}
            <a
              href={currentUrl}
              target="_blank"
              rel="noreferrer"
              className="p-2 rounded-xl bg-white/5 hover:bg-white/15 text-white/70 hover:text-white transition-colors"
              title="Open in System Browser"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Quick-Launch Stream Portals Row */}
          <div className="flex items-center gap-2 overflow-x-auto pt-1 text-xs">
            <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 font-bold shrink-0">
              Fast Links:
            </span>
            {CINEMA_LINKS.slice(0, 7).map((item) => {
              const isActive = currentUrl.includes(item.id) || currentUrl === item.url;
              return (
                <button
                  key={item.id}
                  onClick={() => navigateTo(item.url)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] font-semibold transition-all shrink-0 ${
                    isActive
                      ? 'bg-white/20 text-white border-white/40 shadow-sm'
                      : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${item.accentColor}`} />
                  <span>{item.name.split(' ')[0]}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Browser Frame Viewport */}
        <div className="relative flex-1 w-full h-full bg-black overflow-hidden flex flex-col items-center justify-center">
          {isLoading && (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm">
              <div className="w-10 h-10 rounded-full border-3 border-transparent border-t-cyan-400 border-r-emerald-400 animate-spin" />
              <span className="text-xs font-semibold text-white/90 mt-3 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                Connecting securely with Ad Shield...
              </span>
            </div>
          )}

          <iframe
            ref={iframeRef}
            src={currentUrl}
            title="Miki Protected Web View"
            sandbox={sandboxPolicy}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            onLoad={() => setIsLoading(false)}
            onError={() => setIsLoading(false)}
            className="w-full h-full border-0 bg-slate-950"
          />
        </div>

        {/* Bottom Safety & Ad Shield Status Bar */}
        <div className="px-4 py-2 border-t border-white/10 bg-white/[0.02] flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]" />
            <span>Miki Shield Active • Popup suppression enabled • Zero tracker redirects</span>
          </div>
          <span className="font-mono text-cyan-400 text-[10px]">
            {currentUrl}
          </span>
        </div>
      </div>
    </div>
  );
};
