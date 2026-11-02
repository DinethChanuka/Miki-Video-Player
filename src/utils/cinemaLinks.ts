/**
 * Cinema & Fast Streaming Links Catalog
 * Provides curated streaming portals and social media web targets with category filtering
 * and high-resolution real website logos.
 */


export type CinemaCategory =
  | 'All'
  | 'Cinema'
  | 'Subtitles'
  | 'Social'
  | 'Anime'
  | 'Documentary';

export interface CinemaSiteItem {
  id: string;
  name: string;
  url: string;
  logoUrl?: string;
  category: CinemaCategory;
  description: string;
  badge: string;
  isAdShieldRecommended: boolean;
  accentColor: string;
  tags: string[];
}

export const CINEMA_LINKS: CinemaSiteItem[] = [
  {
    id: 'cinesubz',
    name: 'CineSubz Movies & Series',
    url: 'https://cinesubz.co',
    logoUrl: 'https://www.google.com/s2/favicons?domain=cinesubz.lk&sz=128',
    category: 'Subtitles',
    description: 'Premier Sinhala subtitle movie portal with international HD blockbusters & TV series.',
    badge: 'Sinhala & Global Subtitles',
    isAdShieldRecommended: true,
    accentColor: 'from-amber-500 to-rose-500',
    tags: ['cinesub', 'cinesubz', 'sinhala', 'subtitles', 'movies', 'cinema', 'series'],
  },
  {
    id: 'fmovies',
    name: 'FMovies HD Cinema',
    url: 'https://fmoviesz.to',
    logoUrl: 'https://www.google.com/s2/favicons?domain=fmovies.to&sz=128',
    category: 'Cinema',
    description: 'High-definition streaming directory with latest theatrical releases and trending series.',
    badge: '1080p Cinema',
    isAdShieldRecommended: true,
    accentColor: 'from-blue-500 to-indigo-600',
    tags: ['fmovies', 'free movies', 'cinema', 'hollywood', 'streaming', 'hd'],
  },
  {
    id: '123movies',
    name: '123Movies Global',
    url: 'https://123movies-to.org',
    logoUrl: 'https://www.google.com/s2/favicons?domain=123movies.net&sz=128',
    category: 'Cinema',
    description: 'Classic and modern cinema catalog across Hollywood, European, and Asian productions.',
    badge: 'Multi-Server Cinema',
    isAdShieldRecommended: true,
    accentColor: 'from-emerald-500 to-teal-600',
    tags: ['123movies', 'cinema', 'films', 'watch free'],
  },
  {
    id: 'bflix',
    name: 'BFlix Stream Directory',
    url: 'https://bflix.sx',
    logoUrl: 'https://www.google.com/s2/favicons?domain=bflix.to&sz=128',
    category: 'Cinema',
    description: 'Fast streaming video servers with multiple audio tracks and instant subtitles.',
    badge: 'Fast CDN Cinema',
    isAdShieldRecommended: true,
    accentColor: 'from-purple-500 to-pink-500',
    tags: ['bflix', 'movies', 'fast cdn', 'cinema'],
  },
  {
    id: 'aniwave',
    name: 'AniWave Anime Portal',
    url: 'https://aniwave.to',
    logoUrl: 'https://www.google.com/s2/favicons?domain=aniwave.to&sz=128',
    category: 'Anime',
    description: 'Vast animation library featuring subbed and dubbed Japanese anime in high definition.',
    badge: 'Sub & Dub Anime',
    isAdShieldRecommended: true,
    accentColor: 'from-fuchsia-500 to-pink-600',
    tags: ['anime', 'aniwave', '9anime', 'animation', 'japanese'],
  },
  {
    id: 'archive_cinema',
    name: 'Internet Archive Open Cinema',
    url: 'https://archive.org/details/feature_films',
    logoUrl: 'https://www.google.com/s2/favicons?domain=archive.org&sz=128',
    category: 'Documentary',
    description: 'Tens of thousands of classic, public domain, noir, and independent documentary films.',
    badge: 'Open Legal Cinema',
    isAdShieldRecommended: false,
    accentColor: 'from-stone-500 to-slate-700',
    tags: ['archive', 'documentary', 'public domain', 'classic', 'retro'],
  },
  {
    id: 'youtube',
    name: 'YouTube Web',
    url: 'https://www.youtube.com',
    logoUrl: 'https://www.google.com/s2/favicons?domain=youtube.com&sz=128',
    category: 'Social',
    description: 'World-leading video streaming platform with music, podcasts, creator channels & 4K streams.',
    badge: 'Google Video',
    isAdShieldRecommended: true,
    accentColor: 'from-red-600 to-rose-600',
    tags: ['youtube', 'yt', 'social', 'google', 'streams', 'music'],
  },
  {
    id: 'tiktok',
    name: 'TikTok Web',
    url: 'https://www.tiktok.com',
    logoUrl: 'https://www.google.com/s2/favicons?domain=tiktok.com&sz=128',
    category: 'Social',
    description: 'Trending vertical short-form video feed, creators, and algorithmic recommendations.',
    badge: 'Short-Form Video',
    isAdShieldRecommended: false,
    accentColor: 'from-cyan-400 via-rose-500 to-amber-400',
    tags: ['tiktok', 'shorts', 'social', 'trends', 'viral'],
  },
  {
    id: 'instagram',
    name: 'Instagram Reels & Web',
    url: 'https://www.instagram.com',
    logoUrl: 'https://www.google.com/s2/favicons?domain=instagram.com&sz=128',
    category: 'Social',
    description: 'Explore trending Instagram Reels, visual storytelling, and creator portfolios.',
    badge: 'Visual Stories',
    isAdShieldRecommended: false,
    accentColor: 'from-purple-500 via-pink-500 to-amber-500',
    tags: ['instagram', 'reels', 'social', 'meta'],
  },
  {
    id: 'facebook',
    name: 'Facebook Watch & Video',
    url: 'https://www.facebook.com/watch',
    logoUrl: 'https://www.google.com/s2/favicons?domain=facebook.com&sz=128',
    category: 'Social',
    description: 'Popular viral videos, creator streams, community series, and news broadcasts.',
    badge: 'Community Video',
    isAdShieldRecommended: true,
    accentColor: 'from-blue-600 to-indigo-700',
    tags: ['facebook', 'fb', 'watch', 'meta', 'social'],
  },
];

export function filterCinemaLinks(
  links: CinemaSiteItem[],
  query: string,
  category: CinemaCategory
): CinemaSiteItem[] {
  let result = links;

  if (category !== 'All') {
    result = result.filter((item) => item.category === category);
  }

  if (query && query.trim()) {
    const q = query.toLowerCase().trim();
    result = result.filter(
      (item) =>
        item.name.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.url.toLowerCase().includes(q) ||
        item.tags.some((t) => t.includes(q))
    );
  }

  return result;
}
