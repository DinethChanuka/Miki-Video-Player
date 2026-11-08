import React, { useCallback, useRef, useState } from 'react';

/**
 * RangeSlider
 *
 * A self-drawn slider used for the volume bar and the seek bar.
 *
 * Why this exists: the old bars were native <input type="range"> elements with
 * Tailwind's `appearance-none`. That class removes the browser's thumb and track,
 * and nothing in the project styled them again, so the bar looked dead even when
 * the value changed. This component draws its own track, fill and thumb, and it
 * supports mouse, touch, pen and keyboard.
 */
export interface RangeSliderProps {
  value: number;
  min?: number;
  max: number;
  step?: number;
  /** Fires continuously while dragging and on every key press. */
  onChange?: (value: number) => void;
  /** Fires once when the user releases the pointer (or after a key press). */
  onCommit?: (value: number) => void;
  /** 0..100, optional lighter bar behind the fill (buffered data). */
  bufferedPercent?: number;
  disabled?: boolean;
  ariaLabel: string;
  valueText?: string;
  title?: string;
  className?: string;
  trackClassName?: string;
  fillClassName?: string;
  showThumb?: 'always' | 'hover';
}

const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n));

export const RangeSlider: React.FC<RangeSliderProps> = ({
  value,
  min = 0,
  max,
  step = 1,
  onChange,
  onCommit,
  bufferedPercent,
  disabled = false,
  ariaLabel,
  valueText,
  title,
  className = '',
  trackClassName = '',
  fillClassName = 'bg-gradient-to-r from-cyan-400 to-purple-500',
  showThumb = 'always',
}) => {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const draggingRef = useRef(false);
  const lastValueRef = useRef<number>(value);
  const [dragValue, setDragValue] = useState<number | null>(null);

  const span = max - min;
  const shown = dragValue ?? value;
  const percent = span > 0 ? clamp(((shown - min) / span) * 100, 0, 100) : 0;
  const isDragging = dragValue !== null;

  const valueFromPointer = useCallback(
    (clientX: number): number => {
      const el = trackRef.current;
      if (!el) return min;
      const rect = el.getBoundingClientRect();
      if (rect.width <= 0) return min;
      const ratio = clamp((clientX - rect.left) / rect.width, 0, 1);
      const raw = min + ratio * span;
      const snapped = step > 0 ? Math.round((raw - min) / step) * step + min : raw;
      return clamp(snapped, min, max);
    },
    [min, max, span, step]
  );

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (disabled || e.button !== 0) return;
    e.preventDefault();
    e.stopPropagation();
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // Pointer capture is optional.
    }
    e.currentTarget.focus({ preventScroll: true });
    draggingRef.current = true;
    const v = valueFromPointer(e.clientX);
    lastValueRef.current = v;
    setDragValue(v);
    onChange?.(v);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current) return;
    const v = valueFromPointer(e.clientX);
    if (v !== lastValueRef.current) {
      lastValueRef.current = v;
      setDragValue(v);
      onChange?.(v);
    }
  };

  const finishDrag = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current) return;
    draggingRef.current = false;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      // Already released.
    }
    const v = lastValueRef.current;
    setDragValue(null);
    onCommit?.(v);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (disabled) return;
    const big = Math.max(step * 10, span / 10);
    let next: number;
    switch (e.key) {
      case 'ArrowLeft':
      case 'ArrowDown':
        next = shown - step;
        break;
      case 'ArrowRight':
      case 'ArrowUp':
        next = shown + step;
        break;
      case 'PageDown':
        next = shown - big;
        break;
      case 'PageUp':
        next = shown + big;
        break;
      case 'Home':
        next = min;
        break;
      case 'End':
        next = max;
        break;
      default:
        return;
    }
    // Keep global shortcuts (previous / next track etc.) from also reacting.
    e.preventDefault();
    e.stopPropagation();
    const v = clamp(next, min, max);
    onChange?.(v);
    onCommit?.(v);
  };

  return (
    <div
      role="slider"
      tabIndex={disabled ? -1 : 0}
      aria-label={ariaLabel}
      aria-valuemin={min}
      aria-valuemax={max}
      aria-valuenow={Math.round(shown)}
      aria-valuetext={valueText}
      aria-disabled={disabled}
      title={title}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={finishDrag}
      onPointerCancel={finishDrag}
      onKeyDown={handleKeyDown}
      style={{ touchAction: 'none' }}
      className={`group relative flex items-center h-5 cursor-pointer select-none outline-none rounded-full focus-visible:ring-2 focus-visible:ring-cyan-400/60 ${
        disabled ? 'opacity-40 pointer-events-none' : ''
      } ${className}`}
    >
      <div ref={trackRef} className={`relative w-full h-1.5 rounded-full bg-white/15 ${trackClassName}`}>
        {typeof bufferedPercent === 'number' && bufferedPercent > 0 && (
          <div
            className="absolute inset-y-0 left-0 rounded-full bg-white/20"
            style={{ width: `${clamp(bufferedPercent, 0, 100)}%` }}
          />
        )}
        <div
          className={`absolute inset-y-0 left-0 rounded-full ${fillClassName}`}
          style={{ width: `${percent}%` }}
        />
        <div
          className={`absolute top-1/2 w-3.5 h-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white shadow-md shadow-black/50 transition-transform ${
            isDragging ? 'scale-125' : 'group-hover:scale-110'
          } ${
            showThumb === 'hover'
              ? 'opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100'
              : ''
          }`}
          style={{ left: `${percent}%` }}
        />
      </div>
    </div>
  );
};

export default RangeSlider;
