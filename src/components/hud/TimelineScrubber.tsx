import React, { useState, useRef, useCallback } from 'react';
import { usePlayerStore } from '../../store/playerStore';

export const TimelineScrubber: React.FC = () => {
  const positionMs = usePlayerStore((s) => s.positionMs);
  const durationMs = usePlayerStore((s) => s.durationMs);
  const bufferedMs = usePlayerStore((s) => s.bufferedMs);
  const chapters = usePlayerStore((s) => s.chapters);
  const currentMediaId = usePlayerStore((s) => s.currentMediaId);
  const seek = usePlayerStore((s) => s.seek);

  const [hoverTimeMs, setHoverTimeMs] = useState<number | null>(null);
  const [hoverX, setHoverX] = useState<number>(0);
  const [isScrubbing, setIsScrubbing] = useState<boolean>(false);
  const barRef = useRef<HTMLDivElement | null>(null);

  const formatTime = (ms: number) => {
    const totalSec = Math.max(0, Math.floor(ms / 1000));
    const h = Math.floor(totalSec / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    const s = totalSec % 60;
    if (h > 0) {
      return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const getPositionFromEvent = useCallback(
    (clientX: number): number => {
      if (!barRef.current || durationMs <= 0) return 0;
      const rect = barRef.current.getBoundingClientRect();
      const pct = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
      let targetMs = pct * durationMs;

      // Magnetic chapter snapping (within 1.5% distance threshold)
      const snapThresholdMs = durationMs * 0.015;
      for (const ch of chapters) {
        if (Math.abs(ch.startTimeMs - targetMs) < snapThresholdMs) {
          targetMs = ch.startTimeMs;
          break;
        }
      }

      return targetMs;
    },
    [durationMs, chapters]
  );

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!barRef.current || durationMs <= 0) return;
    const rect = barRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
    setHoverX(x);
    setHoverTimeMs(getPositionFromEvent(e.clientX));
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsScrubbing(true);
    const targetMs = getPositionFromEvent(e.clientX);
    seek(targetMs, false);

    const onMouseMove = (moveEvent: MouseEvent) => {
      const ms = getPositionFromEvent(moveEvent.clientX);
      seek(ms, false);
      if (barRef.current) {
        const rect = barRef.current.getBoundingClientRect();
        setHoverX(Math.max(0, Math.min(rect.width, moveEvent.clientX - rect.left)));
        setHoverTimeMs(ms);
      }
    };

    const onMouseUp = (upEvent: MouseEvent) => {
      setIsScrubbing(false);
      const finalMs = getPositionFromEvent(upEvent.clientX);
      seek(finalMs, true);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  const progressPct = durationMs > 0 ? (positionMs / durationMs) * 100 : 0;
  const bufferedPct = durationMs > 0 ? (bufferedMs / durationMs) * 100 : 0;

  return (
    <div
      ref={barRef}
      className="relative w-full h-8 flex items-center cursor-pointer group select-none"
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setHoverTimeMs(null)}
      onMouseDown={handleMouseDown}
    >
      {/* Background Track */}
      <div className="relative w-full h-1.5 bg-white/20 rounded-full overflow-hidden transition-all duration-200 group-hover:h-2.5">
        {/* Buffer Health Bar */}
        <div
          className="absolute top-0 bottom-0 left-0 bg-white/30 rounded-full transition-all duration-150"
          style={{ width: `${bufferedPct}%` }}
        />
        {/* Active Progress Fill */}
        <div
          className="absolute top-0 bottom-0 left-0 bg-gradient-to-r from-sky-400 to-indigo-500 rounded-full"
          style={{ width: `${progressPct}%` }}
        />
      </div>

      {/* Scrubber Thumb Knob */}
      <div
        className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3.5 h-3.5 bg-white rounded-full shadow-lg scale-0 group-hover:scale-100 transition-transform duration-150 border border-sky-400"
        style={{ left: `${progressPct}%` }}
      />

      {/* Chapter Marker Ticks */}
      {chapters.map((ch) => {
        const chPct = durationMs > 0 ? (ch.startTimeMs / durationMs) * 100 : 0;
        return (
          <div
            key={ch.id}
            className="absolute top-0 bottom-0 w-0.5 bg-black/60 pointer-events-none"
            style={{ left: `${chPct}%` }}
            title={ch.title}
          />
        );
      })}

      {/* Hover Preview Card with Thumbnail and Timestamp */}
      {hoverTimeMs !== null && (
        <div
          className="absolute bottom-10 -translate-x-1/2 pointer-events-none flex flex-col items-center z-50 transition-opacity duration-150"
          style={{ left: `${hoverX}px` }}
        >
          <div className="glass-panel p-1 rounded-xl shadow-2xl flex flex-col items-center gap-1 border border-white/20">
            {currentMediaId && (
              <img
                src={`thumb://localhost/${currentMediaId}/${hoverTimeMs}`}
                alt="Preview"
                className="w-40 h-24 object-cover rounded-lg bg-black/80"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            )}
            <span className="font-mono text-xs text-sky-300 font-semibold px-2 py-0.5">
              {formatTime(hoverTimeMs)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
