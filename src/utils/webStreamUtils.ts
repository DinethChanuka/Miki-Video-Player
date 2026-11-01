/**
 * Web Stream Parsing & Embed URL Generation Utilities
 * Supports YouTube, TikTok, and Instagram standalone web playback
 */

export type WebPlatform = 'youtube' | 'tiktok' | 'instagram';

export interface ParsedWebStream {
  platform: WebPlatform;
  id: string;
  embedUrl: string;
  originalUrl: string;
  title?: string;
}

export function parseYouTubeId(url: string): string | null {
  if (!url) return null;
  const match = url.match(
    /(?:youtube\.com\/(?:watch\?.*v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/i
  );
  return match ? match[1] : null;
}

export function parseTikTokId(url: string): string | null {
  if (!url) return null;
  const match = url.match(/(?:video\/|v\/|embed\/v2\/|embed\/|item\/)(\d{15,22})/i);
  return match ? match[1] : null;
}

export function parseInstagramCode(url: string): string | null {
  if (!url) return null;
  const match = url.match(/(?:instagram\.com\/(?:p|reel|tv)\/([a-zA-Z0-9_-]+))/i);
  return match ? match[1] : null;
}

export function parseWebStream(url: string): ParsedWebStream | null {
  if (!url) return null;
  const trimmed = url.trim();

  // 1. YouTube
  const ytId = parseYouTubeId(trimmed);
  if (ytId) {
    return {
      platform: 'youtube',
      id: ytId,
      embedUrl: `https://www.youtube-nocookie.com/embed/${ytId}?autoplay=1&enablejsapi=1&playsinline=1&rel=0`,
      originalUrl: trimmed,
    };
  }

  // 2. TikTok
  const ttId = parseTikTokId(trimmed);
  if (ttId) {
    return {
      platform: 'tiktok',
      id: ttId,
      embedUrl: `https://www.tiktok.com/embed/v2/${ttId}?lang=en`,
      originalUrl: trimmed,
    };
  }

  // 3. Instagram
  const igCode = parseInstagramCode(trimmed);
  if (igCode) {
    return {
      platform: 'instagram',
      id: igCode,
      embedUrl: `https://www.instagram.com/reel/${igCode}/embed`,
      originalUrl: trimmed,
    };
  }

  return null;
}

export function isSocialWebStream(url: string): boolean {
  return parseWebStream(url) !== null;
}
