/**
 * High-Resolution Website Favicon & Brand Logo Service
 * Provides crisp official logos from Google Favicon V2 API, DuckDuckGo Icon API,
 * and high-definition local vector/SVG brands.
 */

export function extractDomain(url: string): string {
  if (!url) return '';
  try {
    const parsed = new URL(url.startsWith('http') ? url : `https://${url}`);
    return parsed.hostname.replace(/^www\./, '').toLowerCase();
  } catch {
    return url.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0].toLowerCase();
  }
}

/**
 * Returns the Google Favicon V2 URL delivering crisp 64x64 or 128x128 official brand icons
 */
export function getWebsiteFaviconUrl(urlOrDomain: string, size = 64): string {
  const domain = extractDomain(urlOrDomain);
  if (!domain) return '';
  return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=${size}`;
}

/**
 * Secondary fallback favicon service using DuckDuckGo icon CDN
 */
export function getDuckDuckGoFaviconUrl(urlOrDomain: string): string {
  const domain = extractDomain(urlOrDomain);
  if (!domain) return '';
  return `https://icons.duckduckgo.com/ip3/${encodeURIComponent(domain)}.ico`;
}

/**
 * Curated high-resolution brand icons for popular streaming and cinema platforms
 */
export const POPULAR_PORTAL_LOGOS: Record<string, string> = {
  'cinesubz.co': 'https://www.google.com/s2/favicons?domain=cinesubz.lk&sz=128',
  'cinesubz.lk': 'https://www.google.com/s2/favicons?domain=cinesubz.lk&sz=128',
  'cinesubz.net': 'https://www.google.com/s2/favicons?domain=cinesubz.lk&sz=128',
  'fmoviesz.to': 'https://www.google.com/s2/favicons?domain=fmovies.to&sz=128',
  '123movies-to.org': 'https://www.google.com/s2/favicons?domain=123movies.net&sz=128',
  'bflix.sx': 'https://www.google.com/s2/favicons?domain=bflix.to&sz=128',
  'aniwave.to': 'https://www.google.com/s2/favicons?domain=aniwave.to&sz=128',
  'archive.org': 'https://www.google.com/s2/favicons?domain=archive.org&sz=128',
  'youtube.com': 'https://www.google.com/s2/favicons?domain=youtube.com&sz=128',
  'tiktok.com': 'https://www.google.com/s2/favicons?domain=tiktok.com&sz=128',
  'instagram.com': 'https://www.google.com/s2/favicons?domain=instagram.com&sz=128',
};

