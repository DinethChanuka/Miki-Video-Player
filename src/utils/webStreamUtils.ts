/**
 * Web Stream Parsing & Embed URL Generation Utilities
 * Supports YouTube, TikTok, Instagram, Facebook, Vimeo, Twitch, Dailymotion,
 * Cinema Portals (CineSubz, FMovies, etc.) and Universal Web Video Streams.
 */

export type WebPlatform =
  | 'youtube'
  | 'tiktok'
  | 'instagram'
  | 'facebook'
  | 'vimeo'
  | 'twitch'
  | 'dailymotion'
  | 'cinema'
  | 'web';

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

export function parseFacebookUrl(url: string): { id: string; embedUrl: string } | null {
  if (!url) return null;
  const trimmed = url.trim();
  const isFb = /(?:facebook\.com|fb\.watch)/i.test(trimmed);
  if (!isFb) return null;

  const match = trimmed.match(/(?:videos\/|reel\/|\?v=)(\d+)/i) || trimmed.match(/fb\.watch\/([a-zA-Z0-9_-]+)/i);
  const id = match ? match[1] : `fb_${Date.now()}`;
  const embedUrl = `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(trimmed)}&show_text=0`;
  return { id, embedUrl };
}

export function parseVimeoUrl(url: string): { id: string; embedUrl: string } | null {
  if (!url) return null;
  const match = url.trim().match(/vimeo\.com\/(?:video\/)?(\d+)/i);
  if (!match) return null;
  const id = match[1];
  return {
    id,
    embedUrl: `https://player.vimeo.com/video/${id}?autoplay=1`,
  };
}

export function parseTwitchUrl(url: string): { id: string; embedUrl: string } | null {
  if (!url) return null;
  const trimmed = url.trim();
  if (!/twitch\.tv/i.test(trimmed)) return null;

  const videoMatch = trimmed.match(/twitch\.tv\/videos\/(\d+)/i);
  if (videoMatch) {
    const id = videoMatch[1];
    return {
      id,
      embedUrl: `https://player.twitch.tv/?video=${id}&parent=localhost&autoplay=true`,
    };
  }

  const channelMatch = trimmed.match(/twitch\.tv\/([a-zA-Z0-9_]+)/i);
  if (channelMatch && channelMatch[1] !== 'directory') {
    const channel = channelMatch[1];
    return {
      id: channel,
      embedUrl: `https://player.twitch.tv/?channel=${channel}&parent=localhost&autoplay=true`,
    };
  }

  return null;
}

export function parseDailymotionUrl(url: string): { id: string; embedUrl: string } | null {
  if (!url) return null;
  const match = url.trim().match(/dailymotion\.com\/(?:video|embed\/video)\/([a-zA-Z0-9]+)/i);
  if (!match) return null;
  const id = match[1];
  return {
    id,
    embedUrl: `https://www.dailymotion.com/embed/video/${id}?autoplay=1`,
  };
}

export function parseCinemaUrl(url: string): { id: string; embedUrl: string } | null {
  if (!url) return null;
  const trimmed = url.trim();
  const cinemaDomains = [
    'cinesubz.co',
    'fmoviesz.to',
    '123movies',
    'bflix',
    'vidsrc.to',
    'vidsrc.me',
    'vidsrc.cc',
    'streamtape.com',
    'rabbitstream.net',
    'filelions.to',
    'embed.su',
    'superembed.stream',
    '2embed.cc',
  ];

  const matchesCinemaDomain = cinemaDomains.some((d) => trimmed.toLowerCase().includes(d));
  if (matchesCinemaDomain) {
    let embedUrl = trimmed;
    // Resolve clean embed URL if available
    try {
      const parsed = new URL(trimmed);
      embedUrl = parsed.toString();
    } catch {}

    const id = `cinema_${encodeURIComponent(trimmed.replace(/https?:\/\//, '').split('/')[0])}`;
    return { id, embedUrl };
  }

  return null;
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

  // 4. Facebook
  const fb = parseFacebookUrl(trimmed);
  if (fb) {
    return {
      platform: 'facebook',
      id: fb.id,
      embedUrl: fb.embedUrl,
      originalUrl: trimmed,
    };
  }

  // 5. Vimeo
  const vimeo = parseVimeoUrl(trimmed);
  if (vimeo) {
    return {
      platform: 'vimeo',
      id: vimeo.id,
      embedUrl: vimeo.embedUrl,
      originalUrl: trimmed,
    };
  }

  // 6. Twitch
  const twitch = parseTwitchUrl(trimmed);
  if (twitch) {
    return {
      platform: 'twitch',
      id: twitch.id,
      embedUrl: twitch.embedUrl,
      originalUrl: trimmed,
    };
  }

  // 7. Dailymotion
  const dm = parseDailymotionUrl(trimmed);
  if (dm) {
    return {
      platform: 'dailymotion',
      id: dm.id,
      embedUrl: dm.embedUrl,
      originalUrl: trimmed,
    };
  }

  // 8. Cinema Movie Portals & Stream Embeds
  const cinema = parseCinemaUrl(trimmed);
  if (cinema) {
    return {
      platform: 'cinema',
      id: cinema.id,
      embedUrl: cinema.embedUrl,
      originalUrl: trimmed,
    };
  }

  return null;
}

export function isSocialWebStream(url: string): boolean {
  return parseWebStream(url) !== null;
}

export function isDirectMediaUrl(uri: string): boolean {
  if (!uri) return false;
  const clean = uri.split('?')[0].toLowerCase();
  return (
    clean.endsWith('.mp4') ||
    clean.endsWith('.mkv') ||
    clean.endsWith('.webm') ||
    clean.endsWith('.avi') ||
    clean.endsWith('.mov') ||
    clean.endsWith('.m3u8') ||
    clean.endsWith('.m3u') ||
    clean.endsWith('.mp3') ||
    clean.includes('-mp3') ||
    clean.includes('/mp3') ||
    clean.endsWith('.wav') ||
    clean.endsWith('.flac') ||
    clean.endsWith('.aac') ||
    clean.includes('/aac') ||
    clean.endsWith('.ogg') ||
    clean.endsWith('.m4a') ||
    clean.endsWith('.weba') ||
    clean.endsWith('.opus') ||
    clean.includes('somafm.com') ||
    clean.includes('storage.jamendo.com') ||
    clean.includes('freesound.org') ||
    clean.includes('raw.githubusercontent.com') ||
    clean.includes('radio.garden') ||
    clean.includes('apple.com') ||
    clean.includes('itunes') ||
    clean.includes('archive.org') ||
    uri.includes('format=mp3')
  );
}
