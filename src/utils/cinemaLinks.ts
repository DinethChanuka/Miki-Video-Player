/**
 * Cinema & Fast Streaming Links Catalog
 * Provides curated streaming portals and social media web targets with category filtering.
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
    category: 'Social',
    description: 'Explore trending Instagram Reels, visual storytelling, and creator portfolios.',
    badge: 'Reels & Visuals',
    isAdShieldRecommended: false,
    accentColor: 'from-purple-500 via-pink-500 to-amber-500',
    tags: ['instagram', 'ig', 'reels', 'social', 'meta'],
  },
  {
    id: 'facebook',
    name: 'Facebook Watch',
    url: 'https://www.facebook.com/watch',
    category: 'Social',
    description: 'Facebook Watch video streaming destination for shows, sports, and viral media.',
    badge: 'Meta Video',
    isAdShieldRecommended: true,
    accentColor: 'from-blue-600 to-sky-500',
    tags: ['facebook', 'fb', 'watch', 'social', 'meta', 'community'],
  },
];

/**
 * Filters cinema and social streaming portals by keyword and category.
 */
export function filterCinemaLinks(
  links: CinemaSiteItem[],
  query: string,
  category: string
): CinemaSiteItem[] {
  const q = (query || '').trim().toLowerCase();
  const cat = (category || 'All').trim();

  return links.filter((item) => {
    // Category check
    if (cat !== 'All' && item.category !== cat) {
      return false;
    }

    // Query check
    if (!q) return true;

    return (
      item.name.toLowerCase().includes(q) ||
      item.description.toLowerCase().includes(q) ||
      item.id.toLowerCase().includes(q) ||
      item.tags.some((t) => t.toLowerCase().includes(q))
    );
  });
}
