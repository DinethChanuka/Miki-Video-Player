/**
 * Cinema & Movie Streaming Links Catalog
 * Curated movie and series streaming portals with Sinhala & Global subtitles,
 * multi-server streaming directories, and real website logos.
 */

export type CinemaCategory =
  | 'All'
  | 'Cinema'
  | 'Subtitles'
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
    badge: 'Sinhala Subtitles',
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
    id: 'soap2day',
    name: 'Soap2Day HD Movies',
    url: 'https://soap2day.pe',
    logoUrl: 'https://www.google.com/s2/favicons?domain=soap2day.pe&sz=128',
    category: 'Cinema',
    description: 'Extensive popular catalog of blockbuster films, full TV seasons, and trending entertainment.',
    badge: 'Popular Cinema',
    isAdShieldRecommended: true,
    accentColor: 'from-orange-500 to-amber-600',
    tags: ['soap2day', 'free movies', 'cinema', 'shows'],
  },
  {
    id: 'solarmovie',
    name: 'SolarMovie Free Cinema',
    url: 'https://solarmovie.pe',
    logoUrl: 'https://www.google.com/s2/favicons?domain=solarmovie.pe&sz=128',
    category: 'Cinema',
    description: 'Ultra-fast search streaming portal with crystal clear audio and multi-source streaming.',
    badge: 'HD Streams',
    isAdShieldRecommended: true,
    accentColor: 'from-yellow-500 to-orange-500',
    tags: ['solarmovie', 'cinema', 'hd', 'blockbuster'],
  },
  {
    id: 'flixtor',
    name: 'FlixTor HD Series & Movies',
    url: 'https://flixtor.to',
    logoUrl: 'https://www.google.com/s2/favicons?domain=flixtor.to&sz=128',
    category: 'Cinema',
    description: 'Automated video streaming platform indexing highest quality theatrical releases.',
    badge: 'VIP Cinema',
    isAdShieldRecommended: true,
    accentColor: 'from-teal-500 to-cyan-600',
    tags: ['flixtor', 'movies', 'series', 'high quality'],
  },
  {
    id: 'gomovies',
    name: 'GoMovies Global Portal',
    url: 'https://gomovies.sx',
    logoUrl: 'https://www.google.com/s2/favicons?domain=gomovies.sx&sz=128',
    category: 'Cinema',
    description: 'Clean streaming portal with instant video loading and sorted genres across the globe.',
    badge: 'Global Cinema',
    isAdShieldRecommended: true,
    accentColor: 'from-blue-600 to-sky-500',
    tags: ['gomovies', 'free films', 'watch online'],
  },
  {
    id: 'watchseries',
    name: 'WatchSeries Free HD',
    url: 'https://watchseries.bar',
    logoUrl: 'https://www.google.com/s2/favicons?domain=watchseries.bar&sz=128',
    category: 'Cinema',
    description: 'Dedicated portal for international television series, documentaries, and drama episodes.',
    badge: 'TV Shows & Series',
    isAdShieldRecommended: true,
    accentColor: 'from-violet-500 to-purple-600',
    tags: ['watchseries', 'series', 'tv shows', 'episodes'],
  },
  {
    id: 'hdtoday',
    name: 'HDToday Cinema Stream',
    url: 'https://hdtoday.tv',
    logoUrl: 'https://www.google.com/s2/favicons?domain=hdtoday.tv&sz=128',
    category: 'Cinema',
    description: 'High-speed cloud servers with 1080p Full HD video streams and zero buffering.',
    badge: '1080p Cloud',
    isAdShieldRecommended: true,
    accentColor: 'from-rose-500 to-red-600',
    tags: ['hdtoday', '1080p', 'cloud cinema'],
  },
  {
    id: 'vumoo',
    name: 'Vumoo Streaming Cinema',
    url: 'https://vumoo.to',
    logoUrl: 'https://www.google.com/s2/favicons?domain=vumoo.to&sz=128',
    category: 'Cinema',
    description: 'Minimalist video streaming directory with multi-language subtitle support.',
    badge: 'Fast Stream',
    isAdShieldRecommended: true,
    accentColor: 'from-indigo-500 to-blue-500',
    tags: ['vumoo', 'cinema', 'movies online'],
  },
  {
    id: 'cinebloom',
    name: 'CineBloom Free Cinema',
    url: 'https://cinebloom.org',
    logoUrl: 'https://www.google.com/s2/favicons?domain=cinebloom.org&sz=128',
    category: 'Cinema',
    description: 'Ad-minimal community portal with high-bitrate streaming servers and direct links.',
    badge: 'Direct Stream',
    isAdShieldRecommended: true,
    accentColor: 'from-emerald-600 to-teal-500',
    tags: ['cinebloom', 'direct stream', 'cinema'],
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
    id: 'yts',
    name: 'YTS Movie Directory',
    url: 'https://yts.mx',
    logoUrl: 'https://www.google.com/s2/favicons?domain=yts.mx&sz=128',
    category: 'Cinema',
    description: 'World-renowned high-definition 720p/1080p/4K movie catalog with detailed metadata.',
    badge: '4K & 1080p',
    isAdShieldRecommended: true,
    accentColor: 'from-lime-500 to-emerald-600',
    tags: ['yts', 'movies', '4k', '1080p', 'cinema'],
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
