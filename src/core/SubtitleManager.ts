/**
 * Advanced Video Subtitle & Caption Management Engine
 * 
 * Supports SRT and WebVTT parsing, sub-second sync adjustment,
 * persistent video-to-subtitle association, and custom styling.
 */

export interface SubtitleCue {
  id: string;
  startTime: number; // in seconds
  endTime: number;   // in seconds
  text: string;
}

export interface SubtitleStyleConfig {
  fontSize: 'small' | 'medium' | 'large' | 'extra-large';
  textColor: string;
  backgroundColor: string;
  backgroundOpacity: number; // 0.0 to 1.0
  bottomOffsetPercent: number; // 5% to 30%
}

export interface SubtitleTrackData {
  id: string;
  fileName: string;
  sourceUri: string;
  cues: SubtitleCue[];
  syncOffsetSec: number; // +/- offset for lip-sync alignment
  rawContent?: string;
}

const STORAGE_PREFIX_SUBTITLES = 'miki_subtitle_assoc_';

export const DEFAULT_SUBTITLE_STYLE: SubtitleStyleConfig = {
  fontSize: 'medium',
  textColor: '#ffffff',
  backgroundColor: '#000000',
  backgroundOpacity: 0.65,
  bottomOffsetPercent: 12,
};

/**
 * Parses timestamp string "00:01:23,456" or "00:01:23.456" into seconds (float)
 */
function parseTimestamp(timeStr: string): number {
  const normalized = timeStr.trim().replace(',', '.');
  const parts = normalized.split(':');
  if (parts.length === 3) {
    const hours = parseFloat(parts[0]) || 0;
    const minutes = parseFloat(parts[1]) || 0;
    const seconds = parseFloat(parts[2]) || 0;
    return hours * 3600 + minutes * 60 + seconds;
  } else if (parts.length === 2) {
    const minutes = parseFloat(parts[0]) || 0;
    const seconds = parseFloat(parts[1]) || 0;
    return minutes * 60 + seconds;
  }
  return parseFloat(normalized) || 0;
}

/**
 * Parses standard SRT or WebVTT content into SubtitleCue items
 */
export function parseSubtitleText(content: string): SubtitleCue[] {
  const cues: SubtitleCue[] = [];
  if (!content) return cues;

  // Normalize line breaks
  const normalized = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const blocks = normalized.split(/\n\s*\n/);

  let cueIndex = 0;
  for (const block of blocks) {
    const lines = block.trim().split('\n');
    if (!lines.length) continue;

    // Skip WebVTT header block
    if (lines[0].toUpperCase().startsWith('WEBVTT')) continue;

    let timeLineIndex = 0;
    // Check if line 0 is numeric index (SRT standard)
    if (/^\d+$/.test(lines[0].trim()) && lines.length > 1) {
      timeLineIndex = 1;
    }

    const timeLine = lines[timeLineIndex];
    if (!timeLine || !timeLine.includes('-->')) continue;

    const [startStr, endStr] = timeLine.split('-->');
    if (!startStr || !endStr) continue;

    const startTime = parseTimestamp(startStr.trim().split(' ')[0]);
    const endTime = parseTimestamp(endStr.trim().split(' ')[0]);

    // Text content lines
    const textLines = lines.slice(timeLineIndex + 1);
    const text = textLines
      .join('\n')
      .replace(/<[^>]*>/g, '') // Strip HTML tags
      .trim();

    if (text && endTime > startTime) {
      cues.push({
        id: `cue-${cueIndex++}`,
        startTime,
        endTime,
        text,
      });
    }
  }

  return cues;
}

/**
 * Memorize and persist subtitle file association with a specific video URI
 */
export function memorizeSubtitleForVideo(
  videoUri: string,
  fileName: string,
  rawContent: string,
  syncOffsetSec: number = 0
): void {
  if (typeof window === 'undefined' || !videoUri) return;

  try {
    const key = STORAGE_PREFIX_SUBTITLES + btoa(encodeURIComponent(videoUri)).substring(0, 48);
    const data = {
      videoUri,
      fileName,
      rawContent,
      syncOffsetSec,
      updatedAt: Date.now(),
    };
    localStorage.setItem(key, JSON.stringify(data));
  } catch (err) {
    console.warn('Failed to store subtitle association:', err);
  }
}

/**
 * Retrieve memorized subtitle for a given video URI
 */
export function getMemorizedSubtitleForVideo(videoUri: string): {
  fileName: string;
  rawContent: string;
  syncOffsetSec: number;
} | null {
  if (typeof window === 'undefined' || !videoUri) return null;

  try {
    const key = STORAGE_PREFIX_SUBTITLES + btoa(encodeURIComponent(videoUri)).substring(0, 48);
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return {
      fileName: parsed.fileName || 'Subtitles.srt',
      rawContent: parsed.rawContent || '',
      syncOffsetSec: parsed.syncOffsetSec || 0,
    };
  } catch {
    return null;
  }
}
