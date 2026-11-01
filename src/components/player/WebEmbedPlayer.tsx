import React, { useState } from 'react';
import { ExternalLink, RefreshCw, AlertCircle, Share2 } from 'lucide-react';
import { WebPlatform } from '../../utils/webStreamUtils';

interface WebEmbedPlayerProps {
  platform: WebPlatform;
  embedUrl: string;
  originalUrl: string;
  title?: string;
  onEnded?: () => void;
}

export const WebEmbedPlayer: React.FC<WebEmbedPlayerProps> = ({
  platform,
  embedUrl,
  originalUrl,
  title,
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [key, setKey] = useState(0);

  const getPlatformDetails = () => {
    switch (platform) {
      case 'tiktok':
        return {
          name: 'TikTok Web Player',
          gradient: 'from-cyan-400 via-rose-500 to-amber-400',
          badgeBg: 'bg-black/80 text-rose-300 border-rose-500/40',
          aspect: 'max-w-[420px] aspect-[9/16] sm:aspect-[9/16] h-full max-h-[92vh]',
        };
      case 'instagram':
        return {
          name: 'Instagram Web Player',
          gradient: 'from-purple-500 via-pink-500 to-amber-500',
          badgeBg: 'bg-black/80 text-pink-300 border-pink-500/40',
          aspect: 'max-w-[480px] aspect-[9/16] sm:aspect-[4/5] h-full max-h-[92vh]',
        };
      default:
        return {
          name: 'Web Stream',
          gradient: 'from-cyan-500 to-blue-600',
          badgeBg: 'bg-black/80 text-cyan-300 border-cyan-500/40',
          aspect: 'w-full h-full',
        };
    }
  };

  const details = getPlatformDetails();

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center bg-black/95 overflow-hidden select-none">
      {/* Top Floating Mini-Nav for Web Stream */}
      <div className="absolute top-3 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-black/75 backdrop-blur-md border border-white/15 shadow-xl text-xs">
        <span
          className={`px-2 py-0.5 rounded-full font-bold uppercase text-[10px] tracking-wider border ${details.badgeBg}`}
        >
          {platform}
        </span>
        <span className="text-white/80 font-medium truncate max-w-xs text-[11px]">
          {title || details.name}
        </span>

        <div className="flex items-center gap-1 border-l border-white/10 pl-2">
          <button
            onClick={() => {
              setIsLoading(true);
              setKey((k) => k + 1);
            }}
            className="p-1 rounded-lg hover:bg-white/10 text-white/70 hover:text-white transition-colors"
            title="Reload Embed"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
          <a
            href={originalUrl}
            target="_blank"
            rel="noreferrer"
            className="p-1 rounded-lg hover:bg-white/10 text-white/70 hover:text-white transition-colors flex items-center"
            title="Open Original Page in Browser"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Frame Loading Spinner */}
      {isLoading && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-12 h-12 rounded-full border-3 border-transparent border-t-cyan-400 border-r-fuchsia-400 animate-spin" />
          <span className="text-xs font-semibold text-white/80 mt-3 flex items-center gap-1.5">
            <Share2 className="w-3.5 h-3.5 animate-pulse text-cyan-400" />
            Loading {details.name}...
          </span>
        </div>
      )}

      {/* Embedded IFrame Viewport */}
      <div className={`relative ${details.aspect} flex items-center justify-center shadow-2xl rounded-2xl overflow-hidden border border-white/10 bg-black`}>
        <iframe
          key={key}
          src={embedUrl}
          title={`${platform} web player`}
          className="w-full h-full border-0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
          allowFullScreen
          onLoad={() => setIsLoading(false)}
          onError={() => {
            setIsLoading(false);
            setHasError(true);
          }}
        />

        {hasError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950 p-6 text-center gap-3">
            <AlertCircle className="w-8 h-8 text-rose-400" />
            <h3 className="text-sm font-bold text-white">Stream Failed to Load</h3>
            <p className="text-xs text-white/60">
              The external platform restricted embedding for this post.
            </p>
            <a
              href={originalUrl}
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold border border-white/20"
            >
              Open in Web Browser
            </a>
          </div>
        )}
      </div>
    </div>
  );
};
