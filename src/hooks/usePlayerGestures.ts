import { useEffect, useRef } from 'react';
import { usePlayerStore } from '../store/playerStore';

export function usePlayerGestures(containerRef: React.RefObject<HTMLDivElement | null>) {
  const togglePlay = usePlayerStore((s) => s.togglePlay);
  const seek = usePlayerStore((s) => s.seek);
  const positionMs = usePlayerStore((s) => s.positionMs);
  const volume = usePlayerStore((s) => s.volume);
  const setVolume = usePlayerStore((s) => s.setVolume);
  const playbackRate = usePlayerStore((s) => s.playbackRate);
  const setPlaybackRate = usePlayerStore((s) => s.setPlaybackRate);

  const prevSpeedRef = useRef<number>(1.0);
  const holdTimerRef = useRef<number | null>(null);

  // Desktop Hotkeys Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore keystrokes inside text inputs
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;

      switch (e.key) {
        case ' ':
        case 'k':
        case 'K':
          e.preventDefault();
          togglePlay();
          break;
        case 'j':
        case 'J':
          e.preventDefault();
          seek(Math.max(0, positionMs - 10_000));
          break;
        case 'l':
        case 'L':
          e.preventDefault();
          seek(positionMs + 10_000);
          break;
        case 'ArrowLeft':
          e.preventDefault();
          seek(Math.max(0, positionMs - 5_000));
          break;
        case 'ArrowRight':
          e.preventDefault();
          seek(positionMs + 5_000);
          break;
        case 'ArrowUp':
          e.preventDefault();
          setVolume(Math.min(100, volume + 5));
          break;
        case 'ArrowDown':
          e.preventDefault();
          setVolume(Math.max(0, volume - 5));
          break;
        case ',': // Previous frame (~42ms at 24fps)
          e.preventDefault();
          seek(Math.max(0, positionMs - 42), true);
          break;
        case '.': // Next frame
          e.preventDefault();
          seek(positionMs + 42, true);
          break;
        case 'f':
        case 'F':
          e.preventDefault();
          if (!document.fullscreenElement) {
            containerRef.current?.requestFullscreen().catch(() => {});
          } else {
            document.exitFullscreen().catch(() => {});
          }
          break;
        case '[':
          e.preventDefault();
          setPlaybackRate(Math.max(0.25, Number((playbackRate - 0.25).toFixed(2))));
          break;
        case ']':
          e.preventDefault();
          setPlaybackRate(Math.min(4.0, Number((playbackRate + 0.25).toFixed(2))));
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [togglePlay, seek, positionMs, volume, setVolume, playbackRate, setPlaybackRate, containerRef]);

  // Touch & Long-Press 2x Speed Manager
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      prevSpeedRef.current = playbackRate;
      holdTimerRef.current = window.setTimeout(() => {
        setPlaybackRate(2.0); // 2x speed boost on hold
      }, 500);
    }
  };

  const handleTouchEnd = () => {
    if (holdTimerRef.current) {
      clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }
    if (playbackRate === 2.0 && prevSpeedRef.current !== 2.0) {
      setPlaybackRate(prevSpeedRef.current);
    }
  };

  return {
    handleTouchStart,
    handleTouchEnd,
  };
}
