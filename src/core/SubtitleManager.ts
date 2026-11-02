/**
 * Advanced Video Subtitle & Caption Management Engine
 * 
 * Supports SRT and WebVTT parsing, sub-second sync adjustment,
 * persistent video-to-subtitle association, and custom styling.
 */

import React from 'react';
import type { ReactNode } from 'react';

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

const STORAGE_PREFIX_SUBTITLES = 'miki_sub_v2_';
export const MAX_STORAGE_RAW_LENGTH = 65536; // 64KB safety limit for localStorage

export const DEFAULT_SUBTITLE_STYLE: SubtitleStyleConfig = {
  fontSize: 'medium',
  textColor: '#ffffff',
  backgroundColor: '#000000',
  backgroundOpacity: 0.65,
  bottomOffsetPercent: 12,
};

/**
 * Deterministic pure-JS SHA-256 implementation producing a 64-character hex digest
 */
function sha256Hex(ascii: string): string {
  function rightRotate(value: number, amount: number) {
    return (value >>> amount) | (value << (32 - amount));
  }
  const lengthProp = 'length';
  let i = 0, j = 0;
  let result = '';
  const words: number[] = [];
  const asciiBitLength = ascii[lengthProp] * 8;
  const hash = [
    0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a,
    0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19
  ];
  const k = [
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
    0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
    0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
    0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
  ];

  for (i = 0; i < ascii[lengthProp]; i++) {
    const code = ascii.charCodeAt(i);
    words[i >> 2] |= (code & 0xff) << ((3 - (i % 4)) * 8);
  }
  words[asciiBitLength >> 5] |= 0x80 << (24 - (asciiBitLength % 32));
  words[(((asciiBitLength + 64) >> 9) << 4) + 15] = asciiBitLength;

  for (i = 0; i < words.length; i += 16) {
    const w = words.slice(i, i + 16);
    const oldHash = [...hash];
    for (j = 0; j < 64; j++) {
      if (j >= 16) {
        const s0 = rightRotate(w[j - 15], 7) ^ rightRotate(w[j - 15], 18) ^ (w[j - 15] >>> 3);
        const s1 = rightRotate(w[j - 2], 17) ^ rightRotate(w[j - 2], 19) ^ (w[j - 2] >>> 10);
        w[j] = (w[j - 16] + s0 + w[j - 7] + s1) | 0;
      }
      const ch = (hash[4] & hash[5]) ^ (~hash[4] & hash[6]);
      const maj = (hash[0] & hash[1]) ^ (hash[0] & hash[2]) ^ (hash[1] & hash[2]);
      const temp1 = (hash[7] + (rightRotate(hash[4], 6) ^ rightRotate(hash[4], 11) ^ rightRotate(hash[4], 25)) + ch + k[j] + w[j]) | 0;
      const temp2 = ((rightRotate(hash[0], 2) ^ rightRotate(hash[0], 13) ^ rightRotate(hash[0], 22)) + maj) | 0;

      hash[7] = hash[6];
      hash[6] = hash[5];
      hash[5] = hash[4];
      hash[4] = (hash[3] + temp1) | 0;
      hash[3] = hash[2];
      hash[2] = hash[1];
      hash[1] = hash[0];
      hash[0] = (temp1 + temp2) | 0;
    }
    for (j = 0; j < 8; j++) {
      hash[j] = (hash[j] + oldHash[j]) | 0;
    }
  }

  for (i = 0; i < 8; i++) {
    for (j = 3; j >= 0; j--) {
      const b = (hash[i] >> (j * 8)) & 255;
      result += (b < 16 ? '0' : '') + b.toString(16);
    }
  }
  return result;
}

/**
 * Computes a collision-resistant 64-character hex hash for any video path or stream URI
 */
export function computeSubtitleMediaHash(uri: string): string {
  if (!uri) return '0'.repeat(64);
  return sha256Hex(uri.trim());
}

/**
 * Safely parses subtitle text into React virtual nodes, supporting safe formatting tags
 * (italic, bold, underline, font color) while completely neutralizing HTML/XSS injection.
 */
export function parseSubtitleToReactNodes(rawText: string): ReactNode[] {
  if (!rawText) return [];

  // Strip dangerous tags completely
  const cleaned = rawText
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/<(?:object|embed|svg|img|link|meta|input|form|button)\b[^>]*>/gi, '');

  const nodes: ReactNode[] = [];
  const tagRegex = /<\/?(?:i|b|u|font)(?:\s+color=["']?([#a-zA-Z0-9]+)["']?)?>/gi;

  let lastIndex = 0;
  let match: RegExpExecArray | null;

  let isItalic = false;
  let isBold = false;
  let isUnderline = false;
  let fontColor: string | undefined = undefined;

  let keyCounter = 0;
  const pushSegment = (textChunk: string) => {
    if (!textChunk) return;
    let node: ReactNode = textChunk;
    if (fontColor) {
      node = React.createElement('span', { key: `fc-${keyCounter++}`, style: { color: fontColor } }, node);
    }
    if (isUnderline) {
      node = React.createElement('u', { key: `u-${keyCounter++}` }, node);
    }
    if (isBold) {
      node = React.createElement('b', { key: `b-${keyCounter++}` }, node);
    }
    if (isItalic) {
      node = React.createElement('i', { key: `i-${keyCounter++}` }, node);
    }
    nodes.push(node);
  };

  while ((match = tagRegex.exec(cleaned)) !== null) {
    const textBefore = cleaned.substring(lastIndex, match.index);
    if (textBefore) {
      pushSegment(textBefore);
    }

    const fullTag = match[0].toLowerCase();
    if (fullTag.startsWith('</')) {
      if (fullTag.includes('i')) isItalic = false;
      else if (fullTag.includes('b')) isBold = false;
      else if (fullTag.includes('u')) isUnderline = false;
      else if (fullTag.includes('font')) fontColor = undefined;
    } else {
      if (fullTag.startsWith('<i')) isItalic = true;
      else if (fullTag.startsWith('<b')) isBold = true;
      else if (fullTag.startsWith('<u')) isUnderline = true;
      else if (fullTag.startsWith('<font')) {
        fontColor = match[1] || undefined;
      }
    }
    lastIndex = tagRegex.lastIndex;
  }

  const textRemaining = cleaned.substring(lastIndex);
  if (textRemaining) {
    pushSegment(textRemaining);
  }

  return nodes.length > 0 ? nodes : [cleaned];
}

/**
 * Preserves safe subtitle formatting tags (italic, bold, underline, font color) while stripping dangerous HTML/scripts
 */
export function sanitizeSubtitleFormatting(rawText: string): string {
  if (!rawText) return '';
  // 1. Strip dangerous tags and content
  let cleaned = rawText
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '');

  // 2. Strip event handlers (onload, onerror, onclick, etc.)
  cleaned = cleaned.replace(/\son\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, '');

  // 3. Allow only safe tags: <i>, </i>, <b>, </b>, <u>, </u>, <font color="...">, </font>
  cleaned = cleaned.replace(/<\/?([a-z0-9]+)([^>]*)>/gi, (match, tag, attrs) => {
    const lower = tag.toLowerCase();
    if (lower === 'i' || lower === 'b' || lower === 'u') {
      return `<${match.startsWith('</') ? '/' : ''}${lower}>`;
    }
    if (lower === 'font') {
      if (match.startsWith('</')) return '</font>';
      const colorMatch = attrs.match(/color=["']?([#a-zA-Z0-9]+)["']?/i);
      return colorMatch ? `<font color="${colorMatch[1]}">` : '<font>';
    }
    return '';
  });

  return cleaned.trim();
}

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
    const rawJoinedText = textLines.join('\n').trim();
    const text = sanitizeSubtitleFormatting(rawJoinedText);

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
    const hash = computeSubtitleMediaHash(videoUri);
    const key = STORAGE_PREFIX_SUBTITLES + hash;
    // Don't store massive multi-megabyte raw subtitle texts in localStorage to prevent QuotaExceededError
    const storedContent = rawContent.length > MAX_STORAGE_RAW_LENGTH ? '' : rawContent;
    const data = {
      videoUri,
      fileName,
      rawContent: storedContent,
      syncOffsetSec,
      hash,
      isTruncated: rawContent.length > MAX_STORAGE_RAW_LENGTH,
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
    const hash = computeSubtitleMediaHash(videoUri);
    const key = STORAGE_PREFIX_SUBTITLES + hash;
    const raw = localStorage.getItem(key);
    if (!raw) {
      // Legacy fallback check for previous truncated btoa keys
      const legacyKey = 'miki_subtitle_assoc_' + btoa(encodeURIComponent(videoUri)).substring(0, 48);
      const legacyRaw = localStorage.getItem(legacyKey);
      if (!legacyRaw) return null;
      const legacyParsed = JSON.parse(legacyRaw);
      return {
        fileName: legacyParsed.fileName || 'Subtitles.srt',
        rawContent: legacyParsed.rawContent || '',
        syncOffsetSec: legacyParsed.syncOffsetSec || 0,
      };
    }
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

