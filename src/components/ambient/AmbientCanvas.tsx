import React, { useEffect, useRef } from 'react';
import { usePlayerStore } from '../../store/playerStore';

interface AmbientCanvasProps {
  videoRef?: React.RefObject<HTMLVideoElement | null>;
}

export const AmbientCanvas: React.FC<AmbientCanvasProps> = ({ videoRef }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const shaderConfig = usePlayerStore((s) => s.shaderConfig);
  const isPaused = usePlayerStore((s) => s.isPaused);
  const activeEngineType = usePlayerStore((s) => s.activeEngineType);

  useEffect(() => {
    if (!shaderConfig.ambientGlowEnabled) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { willReadFrequently: false });
    if (!ctx) return;

    let animId: number;

    const renderGlow = () => {
      const video = videoRef?.current;
      if (activeEngineType === 'web-media' && video && !video.paused && video.readyState >= 2) {
        try {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        } catch {
          // Cross-origin or tainted canvas fallback
        }
      }
      animId = requestAnimationFrame(renderGlow);
    };

    if (!isPaused || activeEngineType === 'tauri-mpv') {
      animId = requestAnimationFrame(renderGlow);
    }

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [shaderConfig.ambientGlowEnabled, isPaused, activeEngineType, videoRef]);

  if (!shaderConfig.ambientGlowEnabled) return null;

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
      <canvas
        ref={canvasRef}
        width={32}
        height={18}
        className="w-full h-full opacity-60 scale-125 blur-3xl transform transition-opacity duration-1000"
        style={{
          filter: `blur(64px) saturate(${shaderConfig.saturation * 1.5}) contrast(${shaderConfig.contrast})`,
        }}
      />
      <div className="absolute inset-0 bg-black/40" />
    </div>
  );
};
