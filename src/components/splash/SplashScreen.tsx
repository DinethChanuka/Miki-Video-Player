import React, { useEffect, useRef, useState, useCallback } from 'react';

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
    // Keyboard shortcut to skip intro video if needed (Space, Escape, or Enter)
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        handleFinish();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    // Safeguard timeout: automatically transition after 12 seconds maximum
    const safeguardTimer = setTimeout(() => {
      handleFinish();
    }, 12000);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      clearTimeout(safeguardTimer);
    };
  }, [handleFinish]);

  // Play startup video with sound (unmuted)
  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      video.muted = false;
      video.volume = 1.0;
      video.play().catch(() => {
        // Fallback to muted playback only if browser blocks unmuted sound
        video.muted = true;
        video.play().catch(() => {
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
      {/* Cinematic Splash Video Viewport with full audio playback */}
      <video
        ref={videoRef}
        src="/splash.mp4"
        autoPlay
        playsInline
        preload="auto"
        onEnded={handleFinish}
        onError={handleFinish}
        className="w-full h-full object-contain pointer-events-none"
      />

      {/* Subtle Bottom Loading Progress Bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/5 overflow-hidden">
        <div className="h-full bg-gradient-to-r from-sky-400 via-indigo-500 to-purple-500 animate-pulse w-full" />
      </div>
    </div>
  );
};
