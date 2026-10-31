import React from 'react';
import { SubtitleCue, SubtitleStyleConfig, DEFAULT_SUBTITLE_STYLE } from '../../core/SubtitleManager';

interface SubtitleOverlayProps {
  cues: SubtitleCue[];
  currentPositionSec: number;
  syncOffsetSec?: number;
  styleConfig?: Partial<SubtitleStyleConfig>;
  isVisible?: boolean;
}

export const SubtitleOverlay: React.FC<SubtitleOverlayProps> = ({
  cues,
  currentPositionSec,
  syncOffsetSec = 0,
  styleConfig = {},
  isVisible = true,
}) => {
  if (!isVisible || !cues || cues.length === 0) return null;

  const adjustedTime = currentPositionSec - syncOffsetSec;

  // Find active cue matching current time
  const activeCue = cues.find(
    (cue) => adjustedTime >= cue.startTime && adjustedTime <= cue.endTime
  );

  if (!activeCue) return null;

  const config = { ...DEFAULT_SUBTITLE_STYLE, ...styleConfig };

  const fontSizeClass = {
    small: 'text-sm sm:text-base',
    medium: 'text-base sm:text-lg md:text-xl',
    large: 'text-lg sm:text-2xl md:text-3xl font-semibold',
    'extra-large': 'text-2xl sm:text-3xl md:text-4xl font-bold',
  }[config.fontSize];

  return (
    <div
      className="absolute left-0 right-0 z-20 flex justify-center items-center pointer-events-none px-6 transition-all duration-150"
      style={{
        bottom: `${config.bottomOffsetPercent}%`,
      }}
    >
      <div
        className={`max-w-4xl text-center px-4 py-2 rounded-xl backdrop-blur-sm select-none shadow-2xl transition-opacity duration-150 ${fontSizeClass}`}
        style={{
          color: config.textColor,
          backgroundColor: `rgba(0, 0, 0, ${config.backgroundOpacity})`,
          textShadow: '0 2px 4px rgba(0,0,0,0.9), 0 0 10px rgba(0,0,0,0.8)',
          whiteSpace: 'pre-line',
          lineHeight: '1.4',
        }}
      >
        {activeCue.text}
      </div>
    </div>
  );
};
