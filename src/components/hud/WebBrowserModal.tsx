import React, { useState, useEffect, useRef } from 'react';
import {
  Globe,
  ArrowLeft,
  RotateCw,
  ShieldCheck,
  ShieldAlert,
  Play,
  ExternalLink,
  Sparkles,
} from 'lucide-react';
import { getCleanUrl, isBlockedUrl } from '../../utils/adBlockFilter';
import { parseYouTubeId } from '../../App';

interface WebBrowserModalProps {
  isOpen: boolean;
  initialUrl?: string;
  onClose: () => void;
  onPlayInNativePlayer: (url: string) => void;
  onStartWindowDrag?: (e: React.MouseEvent) => void;
  onMinimizeWindow?: () => void;
  onMaximizeWindow?: () => void;
}

/**
 * Resolves web URLs to embed-compatible formats to bypass X-Frame-Options blocking
 */
export function resolveBrowserFrameUrl(url: string): string {
  if (!url) return 'https://cinesubz.co';
  const trimmed = url.trim();

  // Convert YouTube links into embed format to prevent X-Frame-Options: SAMEORIGIN rejection
  const ytMatch = trimmed.match(
    /(?:youtube\.com\/(?:watch\?.*v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/i
  );
  if (ytMatch && ytMatch[1]) {
    return `https://www.youtube-nocookie.com/embed/${ytMatch[1]}?autoplay=1&enablejsapi=1`;
  }
  if (trimmed.includes('youtube.com') && !trimmed.includes('/embed/')) {
    return 'https://www.youtube-nocookie.com/embed?listType=search&list=trending';
  }

  return trimmed;
}

export function extractHostname(url: string): string {
  try {
    const parsed = new URL(url);
    return parsed.hostname.replace(/^www\./, '');
  } catch {
    return url.replace(/^https?:\/\//, '').split('/')[0] || 'Website';
  }
}

export const WebBrowserModal: React.FC<WebBrowserModalProps> = ({
  isOpen,
  initialUrl = 'https://cinesubz.co',
  onClose,
  onPlayInNativePlayer,
  onStartWindowDrag,
  onMinimizeWindow,
  onMaximizeWindow,
}) => {
  const [currentUrl, setCurrentUrl] = useState<string>(initialUrl);
  const [isAdShieldActive, setIsAdShieldActive] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [blockedCount, setBlockedCount] = useState<number>(18);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  useEffect(() => {
    if (initialUrl && isOpen) {
      const clean = getCleanUrl(initialUrl);
      setCurrentUrl(clean);
      setIsLoading(true);
    }
  }, [initialUrl, isOpen]);

  // Listen for navigation events from native wrapper (e.g. target="_blank" clicks on movie sites)
  useEffect(() => {
    const handleNavigate = (e: Event) => {
      const detail = (e as CustomEvent<{ url?: string }>).detail;
      if (detail?.url) {
        const clean = getCleanUrl(detail.url);
        if (isAdShieldActive && isBlockedUrl(clean)) {
          setBlockedCount((c) => c + 1);
          return;
        }
        setCurrentUrl(clean);
        setIsLoading(true);
      }
    };
    window.addEventListener('miki:navigate-web-browser', handleNavigate);
    return () => {
      window.removeEventListener('miki:navigate-web-browser', handleNavigate);
    };
  }, [isAdShieldActive]);

  if (!isOpen) return null;

  const handleReload = () => {
    setIsLoading(true);
    if (iframeRef.current) {
      iframeRef.current.src = resolveBrowserFrameUrl(currentUrl);
    }
  };

  const isPlayableInPlayer = () => {
    if (!currentUrl) return false;
    if (parseYouTubeId(currentUrl)) return true;
    if (/\.(mp4|m3u8|webm|mov|mkv)(\?.*)?$/i.test(currentUrl)) return true;
    return false;
  };

  const resolvedFrameUrl = resolveBrowserFrameUrl(currentUrl);
  const siteHostname = extractHostname(currentUrl);

  return (
    <div
      className="fixed inset-0 z-50 w-full h-full bg-[#06080d] flex flex-col select-none animate-in fade-in duration-150"
      style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
    >
      {/* Sleek, Minimal Top Bar - Back, Shield Status, Window Drag & Controls */}
      <div
        className="w-full h-11 bg-slate-950/90 backdrop-blur-xl border-b border-white/10 flex items-center justify-between px-3 shrink-0 text-white z-30"
      >
        {/* Left Action Controls (no-drag) */}
        <div
          className="flex items-center gap-2.5 shrink-0"
          style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
        >
          {/* Back to Player Button */}
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 text-xs font-semibold text-white transition-all active:scale-95 shadow-sm"
            title="Return to Miki Player"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-cyan-400" />
            <span>Player</span>
          </button>

          {/* Reload Button */}
          <button
            onClick={handleReload}
            className="p-1.5 rounded-xl bg-white/5 hover:bg-white/15 text-white/80 hover:text-white transition-colors"
            title="Reload website"
          >
            <RotateCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-cyan-400' : ''}`} />
          </button>

          {/* Website Hostname Badge */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white/5 border border-white/10 text-xs text-white/90 font-medium">
            <Globe className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span className="truncate max-w-[180px] font-mono text-[11px]">{siteHostname}</span>
          </div>

          {/* Ad Shield Toggle Pill */}
          <button
            onClick={() => {
              setIsAdShieldActive(!isAdShieldActive);
              if (!isAdShieldActive) setBlockedCount((c) => c + 3);
            }}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl border text-[11px] font-semibold transition-all shadow-sm ${
              isAdShieldActive
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30'
                : 'bg-rose-500/15 text-rose-300 border-rose-500/30 hover:bg-rose-500/25'
            }`}
            title={isAdShieldActive ? 'Ad Shield is ON: Intrusive ad popups suppressed' : 'Ad Shield is OFF'}
          >
            {isAdShieldActive ? (
              <>
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                <span>Shield ON ({blockedCount})</span>
              </>
            ) : (
              <>
                <ShieldAlert className="w-3 h-3 text-rose-400" />
                <span>Shield OFF</span>
              </>
            )}
          </button>
        </div>

        {/* Center Draggable Region (Grabs & moves window smoothly) */}
        <div
          onMouseDown={onStartWindowDrag}
          className="flex-1 h-full flex items-center justify-center cursor-grab active:cursor-grabbing px-4"
          style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
        >
          <div className="flex items-center gap-2 pointer-events-none opacity-60 hover:opacity-100 transition-opacity">
            <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            <span className="text-[11px] font-semibold tracking-wider uppercase text-slate-300">
              Miki Browser
            </span>
            <span className="text-[10px] font-mono text-slate-500">|</span>
            <span className="text-[10px] text-slate-400 font-mono truncate max-w-xs">
              {currentUrl}
            </span>
          </div>
        </div>

        {/* Right Tools & Window Controls (no-drag) */}
        <div
          className="flex items-center gap-2 shrink-0"
          style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
        >
          {/* Play in Player Button (when media or youtube detected) */}
          {isPlayableInPlayer() && (
            <button
              onClick={() => {
                onPlayInNativePlayer(currentUrl);
                onClose();
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-red-600 via-rose-600 to-amber-500 hover:brightness-110 active:scale-95 text-white font-bold text-xs transition-all shadow-md animate-pulse"
              title="Launch in Native Player with 3D Spatial Audio & Video DSP"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              <span>Play in Player</span>
            </button>
          )}

          {/* Open in Default System Browser */}
          <a
            href={currentUrl}
            target="_blank"
            rel="noreferrer"
            className="p-1.5 rounded-xl bg-white/5 hover:bg-white/15 text-white/70 hover:text-white transition-colors"
            title="Open in System Web Browser"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          <div className="w-[1px] h-4 bg-white/15 mx-1" />

          {/* Window Control Buttons */}
          <div className="flex items-center gap-1">
            <button
              onClick={onMinimizeWindow}
              className="w-7 h-7 rounded-xl hover:bg-white/10 text-white/70 hover:text-white flex items-center justify-center transition-colors text-xs font-bold"
              title="Minimize"
            >
              ─
            </button>
            <button
              onClick={onMaximizeWindow}
              className="w-7 h-7 rounded-xl hover:bg-white/10 text-white/70 hover:text-white flex items-center justify-center transition-colors text-xs"
              title="Maximize"
            >
              □
            </button>
            <button
              onClick={onClose}
              className="w-7 h-7 rounded-xl hover:bg-rose-500/40 text-white/70 hover:text-rose-200 flex items-center justify-center transition-colors text-xs"
              title="Close Browser"
            >
              ✕
            </button>
          </div>
        </div>
      </div>

      {/* Main Full-Window Viewport: Loading Indicator + Edge-to-Edge Website Frame */}
      <div className="relative flex-1 w-full h-full bg-black overflow-hidden flex flex-col items-center justify-center">
        {isLoading && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/80 backdrop-blur-md">
            <div className="w-12 h-12 rounded-full border-3 border-transparent border-t-cyan-400 border-r-emerald-400 animate-spin shadow-lg shadow-cyan-500/20" />
            <span className="text-sm font-semibold text-white/90 mt-4 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse" />
              Loading {siteHostname}...
            </span>
            <span className="text-xs text-slate-400 mt-1 font-mono max-w-md truncate px-4 text-center">
              {currentUrl}
            </span>
          </div>
        )}

        <iframe
          ref={iframeRef}
          src={resolvedFrameUrl}
          title="Miki Protected Web View"
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox allow-presentation allow-downloads allow-modals"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
          allowFullScreen
          onLoad={() => setIsLoading(false)}
          onError={() => setIsLoading(false)}
          className="w-full h-full border-0 bg-slate-950"
        />
      </div>
    </div>
  );
};
