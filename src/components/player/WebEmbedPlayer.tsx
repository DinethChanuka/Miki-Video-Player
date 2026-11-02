import React, { useState } from 'react';
import { ExternalLink, RefreshCw, AlertCircle, Share2, Volume2, VolumeX, Volume1, Sliders } from 'lucide-react';
import { WebPlatform } from '../../utils/webStreamUtils';
import { usePlayerStore } from '../../store/playerStore';

interface WebEmbedPlayerProps {
  platform: WebPlatform;
  embedUrl: string;
  originalUrl: string;
  title?: string;
  onEnded?: () => void;
  onOpenEq?: () => void;
}

const EQ_PRESETS = [
  { name: 'Flat', gains: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
  { name: 'Bass Boost', gains: [6, 5, 4, 2, 0, 0, 0, 0, 0, 0] },
  { name: 'Vocal', gains: [-2, -1, 1, 3, 5, 4, 3, 1, 0, -1] },
  { name: 'Cinema', gains: [4, 3, 1, 0, -1, 1, 3, 4, 5, 5] },
];

export const WebEmbedPlayer: React.FC<WebEmbedPlayerProps> = ({
  platform,
  embedUrl,
  originalUrl,
  title,
  onOpenEq,
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [key, setKey] = useState(0);
  const [activePreset, setActivePreset] = useState<string>('Flat');

  const volume = usePlayerStore((s) => s.volume);
  const isMuted = usePlayerStore((s) => s.isMuted);
  const setVolume = usePlayerStore((s) => s.setVolume);
  const toggleMute = usePlayerStore((s) => s.toggleMute);
  const setEqualizer = usePlayerStore((s) => s.setEqualizer);
  const nightModeEnabled = usePlayerStore((s) => s.nightModeEnabled);

  const handleApplyPreset = (name: string, gains: number[]) => {
    setActivePreset(name);
    setEqualizer(gains, nightModeEnabled);
  };

  const getPlatformDetails = () => {
    switch (platform) {
      case 'tiktok':
        return {
          name: 'TikTok Web Player',
          gradient: 'from-cyan-400 via-rose-500 to-amber-400',
          badgeBg: 'bg-black/80 text-rose-300 border-rose-500/40',
          aspect: 'max-w-[420px] aspect-[9/16] sm:aspect-[9/16] h-full max-h-[82vh]',
        };
      case 'instagram':
        return {
          name: 'Instagram Web Player',
          gradient: 'from-purple-500 via-pink-500 to-amber-500',
          badgeBg: 'bg-black/80 text-pink-300 border-pink-500/40',
          aspect: 'max-w-[480px] aspect-[9/16] sm:aspect-[4/5] h-full max-h-[82vh]',
        };
      case 'facebook':
        return {
          name: 'Facebook Video Player',
          gradient: 'from-blue-600 via-indigo-600 to-sky-500',
          badgeBg: 'bg-black/80 text-blue-300 border-blue-500/40',
          aspect: 'max-w-[720px] aspect-video w-full h-full max-h-[82vh]',
        };
      default:
        return {
          name: 'Web Stream',
          gradient: 'from-cyan-500 to-blue-600',
          badgeBg: 'bg-black/80 text-cyan-300 border-cyan-500/40',
          aspect: 'w-full h-full max-h-[82vh]',
        };
    }
  };

  const details = getPlatformDetails();

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-between p-4 bg-black/95 overflow-hidden select-none">
      {/* Top Floating Mini-Nav for Web Stream */}
      <div className="relative z-30 flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-black/75 backdrop-blur-md border border-white/15 shadow-xl text-xs mb-2">
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
      <div className={`relative ${details.aspect} flex items-center justify-center shadow-2xl rounded-2xl overflow-hidden border border-white/10 bg-black flex-1`}>
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

      {/* Bottom Floating Sound Control Bar (0-200% VLC Overdrive & Audio DSP Options) */}
      <div className="relative z-30 mt-3 flex items-center flex-wrap justify-center gap-3 px-4 py-2 rounded-2xl bg-black/85 backdrop-blur-xl border border-white/15 shadow-2xl text-xs">
        {/* Mute & Volume Slider */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => toggleMute()}
            className="p-1.5 rounded-xl hover:bg-white/10 text-white/80 hover:text-white transition-colors"
            title={isMuted ? 'Unmute Sound' : 'Mute Sound'}
          >
            {isMuted || volume === 0 ? (
              <VolumeX className="w-4 h-4 text-rose-400" />
            ) : volume > 100 ? (
              <Volume2 className="w-4 h-4 text-amber-400" />
            ) : volume > 50 ? (
              <Volume2 className="w-4 h-4 text-cyan-400" />
            ) : (
              <Volume1 className="w-4 h-4 text-white/80" />
            )}
          </button>

          <input
            type="range"
            min={0}
            max={200}
            step={1}
            value={isMuted ? 0 : volume}
            onChange={(e) => setVolume(parseInt(e.target.value, 10))}
            className="w-24 sm:w-32 h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer accent-cyan-400"
            title={`Sound Volume: ${volume}% (up to 200% VLC overdrive)`}
          />

          <span
            className={`font-mono text-[11px] font-bold w-11 ${
              volume > 100 ? 'text-amber-400' : 'text-cyan-300'
            }`}
          >
            {isMuted ? 'Muted' : `${volume}%`}
          </span>
        </div>

        <div className="w-[1px] h-4 bg-white/20 hidden sm:block" />

        {/* Quick EQ Profile Presets */}
        <div className="flex items-center gap-1.5">
          {EQ_PRESETS.map((p) => (
            <button
              key={p.name}
              onClick={() => handleApplyPreset(p.name, p.gains)}
              className={`px-2.5 py-1 rounded-xl text-[10px] font-semibold transition-all ${
                activePreset === p.name
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-sm'
                  : 'bg-white/5 hover:bg-white/15 text-white/70 hover:text-white border border-white/10'
              }`}
            >
              {p.name}
            </button>
          ))}

          {onOpenEq && (
            <button
              onClick={onOpenEq}
              className="p-1.5 rounded-xl bg-white/5 hover:bg-white/15 text-white/70 hover:text-white border border-white/10 transition-colors ml-1"
              title="Open Full 10-Band Equalizer"
            >
              <Sliders className="w-3.5 h-3.5 text-cyan-400" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

