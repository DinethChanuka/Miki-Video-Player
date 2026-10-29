import React, { useEffect, useRef, useState, useCallback } from 'react';
import { FastForward } from 'lucide-react';

interface SplashScreenProps {
  onComplete: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  const [isFading, setIsFading] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const finishTriggered = useRef(false);

  const handleFinish = useCallback(() => {
    if (finishTriggered.current) return;
    finishTriggered.current = true;
    setIsFading(true);
    // Smooth cross-fade transition delay before removing from DOM
    setTimeout(() => {
      onComplete();
    }, 700);
  }, [onComplete]);

  useEffect(() => {
    // Keyboard shortcut to skip intro video (Space, Escape, or Enter)
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        handleFinish();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    // Safeguard timeout: automatically transition after 10 seconds maximum
    const safeguardTimer = setTimeout(() => {
      handleFinish();
    }, 10000);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      clearTimeout(safeguardTimer);
    };
  }, [handleFinish]);

  // Attempt unmuted or muted auto-play on mount
  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      video.play().catch(() => {
        // Fallback to muted playback if autoplay policy restricts sound
        video.muted = true;
        video.play().catch(() => {
          // If video playback fails entirely, transition smoothly to dashboard
          handleFinish();
        });
      });
    }
  }, [handleFinish]);

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black transition-opacity duration-700 ease-out select-none ${
        isFading ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
      style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
    >
      {/* Cinematic Splash Video Viewport */}
      <video
        ref={videoRef}
        src="/splash.mp4"
        autoPlay
        playsInline
        muted
        preload="auto"
        onEnded={handleFinish}
        onError={handleFinish}
        className="w-full h-full object-contain pointer-events-none"
      />

      {/* Top Bar Branding Indicator & Skip Button */}
      <div
        className="absolute top-4 right-4 z-10 flex items-center gap-3"
        style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
      >
        <button
          onClick={handleFinish}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white/70 hover:text-white backdrop-blur-md border border-white/15 text-xs font-medium transition-all active:scale-95 shadow-lg"
          title="Skip intro loading screen (Space or Esc)"
        >
          <span>Skip</span>
          <FastForward className="w-3.5 h-3.5 text-sky-400" />
        </button>
      </div>

      {/* Subtle Bottom Loading Progress Bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/5 overflow-hidden">
        <div className="h-full bg-gradient-to-r from-sky-400 via-indigo-500 to-purple-500 animate-pulse w-full" />
      </div>
    </div>
  );
};
