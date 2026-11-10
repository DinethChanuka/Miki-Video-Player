import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { usePlayerStore } from '../../store/playerStore';
import { CURATED_CHANNELS, LiveChannel } from '../../utils/channelCatalog';
import { GAMES_CATALOG, GameItem } from '../../utils/gamesCatalog';
import { CINEMA_LINKS, CinemaSiteItem } from '../../utils/cinemaLinks';
import { INTERNET_MUSIC_STREAMS } from '../../utils/musicStreams';
import { RADIO_GARDEN_STATIONS, RadioGardenStation, searchRadioGardenStations } from '../../utils/radioGardenCatalog';
import { MOVIE_POSTERS, ALBUM_POSTERS, ARTIST_AVATARS } from '../../utils/mediaPosters';
import { HERO_ARTWORKS } from '../../utils/heroArtworks';
import { CINESUBZ_MOVIES, fetchLatestCineSubzMovies, searchCineSubzLive, CineSubzMovie } from '../../utils/cinesubzService';
import { CINESUBZ_TV_SHOWS, fetchLatestCineSubzTvShows, CineSubzTvShow } from '../../utils/cinesubzTvService';
import {
  MUSIC_DISCOVERY_CATALOG,
  searchMusicOnline,
  fetchOnlineMusicSearch,
  fetchLiveMusicDiscovery,
  MusicTrack,
  MusicPlatform,
} from '../../utils/musicDiscoveryService';
import { AllArtistsModal } from '../music/AllArtistsModal';
import {
  ArtistProfile,
  fetchArtistSongsLive,
  searchArtists,
} from '../../utils/artistCatalogService';
import { ApplicationMenu } from '../hud/ApplicationMenu';
import {
  Film,
  Play,
  Pause,
  Tv,
  Tv2,
  Gamepad2,
  Music,
  Radio,
  Clock,
  Search,
  Settings,
  Sliders,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  MessageSquareText,
  ListMusic,
  ListPlus,
  Shuffle,
  Repeat,
  Headphones,
  ChevronDown,
  Heart,
  Download,
  Bell,
  Compass,
  ChevronLeft,
  ChevronRight,
  FolderOpen,
  LogIn,
  LogOut,
  Sparkles,
  X,
  RefreshCw,
  Image as ImageIcon,
  HardDrive,
  FileVideo,
  FileAudio,
  FileImage,
  Eye,
  Globe,
  ExternalLink,
} from 'lucide-react';

export type HomeViewCategory =
  | 'All'
  | 'My Files'
  | 'Movies'
  | 'Tv series'
  | 'Animation'
  | 'Sports'
  | 'Live TV'
  | 'Games'
  | 'Music'
  | 'Radio';

export const HOME_VIEW_CATEGORIES: HomeViewCategory[] = ['All', 'My Files', 'Movies', 'Tv series', 'Animation', 'Live TV', 'Games', 'Music', 'Radio'];

export type HomeNavTab =
  | 'browse'
  | 'my_files'
  | 'watchlist'
  | 'coming_soon'
  | 'channels'
  | 'games'
  | 'music'
  | 'radio'
  | 'history'
  | 'settings';

interface HomeDashboardViewProps {
  onOpenGames?: (gameId?: string) => void;
  onOpenMusic?: () => void;
  onOpenWebBrowser?: (url?: string) => void;
  onOpenSettings?: () => void;
  onOpenEq?: () => void;
  onOpenLocalFile?: () => void;
  onOpenGmailSignIn?: () => void;
  onOpenLibrary?: (initialTab?: 'youtube' | 'tiktok' | 'instagram' | 'recent' | 'bookmarks' | 'cinema' | 'social' | 'games' | 'music') => void;
  onOpenSystemAccess?: () => void;
  onOpenChannels?: () => void;
}

// Groovvy-inspired 3D Music Data (Image 2)
export interface GroovvyArtist {
  id: string;
  name: string;
  plays: string;
  imageUrl: string;
  gradient: string;
  accentColor: string;
}

export const GROOVVY_TOP_ARTISTS: GroovvyArtist[] = [
  {
    id: 'travis-scott',
    name: 'Travis Scott',
    plays: '44M Plays',
    imageUrl: ARTIST_AVATARS.travisScott,
    gradient: 'from-blue-900/80 via-indigo-950/60 to-slate-900',
    accentColor: 'text-blue-400',
  },
  {
    id: 'billie-eilish',
    name: 'Billie Eilish',
    plays: '203M Plays',
    imageUrl: ARTIST_AVATARS.billieEilish,
    gradient: 'from-amber-900/80 via-yellow-950/60 to-slate-900',
    accentColor: 'text-amber-400',
  },
  {
    id: 'camila-cabello',
    name: 'Camila Cabello',
    plays: '63M Plays',
    imageUrl: ARTIST_AVATARS.camilaCabello,
    gradient: 'from-teal-900/80 via-emerald-950/60 to-slate-900',
    accentColor: 'text-teal-400',
  },
  {
    id: 'kanye-west',
    name: 'Kanye West',
    plays: '15M Plays',
    imageUrl: ARTIST_AVATARS.kanyeWest,
    gradient: 'from-orange-900/80 via-rose-950/60 to-slate-900',
    accentColor: 'text-orange-400',
  },
  {
    id: 'nicki-minaj',
    name: 'Nicki Minaj',
    plays: '100M Plays',
    imageUrl: ARTIST_AVATARS.nickiMinaj,
    gradient: 'from-pink-900/80 via-rose-950/60 to-slate-900',
    accentColor: 'text-pink-400',
  },
  {
    id: 'the-weeknd',
    name: 'Starboy',
    plays: '100M Plays',
    imageUrl: ARTIST_AVATARS.theWeeknd,
    gradient: 'from-red-900/80 via-purple-950/60 to-slate-900',
    accentColor: 'text-red-400',
  },
  {
    id: 'arijit-singh',
    name: 'Arijit Singh',
    plays: '88M Plays',
    imageUrl: ARTIST_AVATARS.arijitSingh,
    gradient: 'from-cyan-900/80 via-blue-950/60 to-slate-900',
    accentColor: 'text-cyan-400',
  },
  {
    id: 'dua-lipa',
    name: 'Dua Lipa',
    plays: '110M Plays',
    imageUrl: ARTIST_AVATARS.duaLipa,
    gradient: 'from-violet-900/80 via-purple-950/60 to-slate-900',
    accentColor: 'text-violet-400',
  },
];

export interface GroovvyHeroBannerSlide {
  id: string;
  tag: string;
  title: string;
  artist: string;
  plays: string;
  languageLabel: string;
  imageUrl: string;
  streamUrl: string;
  glowColor: string;
}

export const GROOVVY_HERO_BANNERS: GroovvyHeroBannerSlide[] = [
  {
    id: 'camila-in-my-feelings',
    tag: 'Trending New Hits',
    title: 'In My Feelings',
    artist: 'Camila Cabello',
    plays: '63Million Plays',
    languageLabel: 'English Hit',
    imageUrl: ARTIST_AVATARS.camilaCabelloHero,
    streamUrl: 'https://www.youtube.com/watch?v=HCjNJDNgk8Y',
    glowColor: 'from-rose-600/20 via-blue-600/10 to-transparent',
  },
  {
    id: 'weeknd-blinding-lights',
    tag: 'Global Chart #1',
    title: 'Blinding Lights',
    artist: 'The Weeknd',
    plays: '108M Plays',
    languageLabel: 'Starboy Studio',
    imageUrl: ARTIST_AVATARS.theWeekndHero,
    streamUrl: 'https://www.youtube.com/watch?v=4NRXx6U8ABQ',
    glowColor: 'from-amber-600/20 via-red-600/10 to-transparent',
  },
  {
    id: 'arijit-samjhawan',
    tag: 'Bollywood Spotlight',
    title: 'Samjhawan (Live)',
    artist: 'Arijit Singh',
    plays: '88M Plays',
    languageLabel: 'Hindi Classic',
    imageUrl: ARTIST_AVATARS.arijitSingh,
    streamUrl: 'https://www.youtube.com/watch?v=H2f7MZaw3Yo',
    glowColor: 'from-cyan-600/20 via-indigo-600/10 to-transparent',
  },
  {
    id: 'billie-birds-of-a-feather',
    tag: 'Studio Master Hi-Fi',
    title: 'Birds of a Feather',
    artist: 'Billie Eilish',
    plays: '203M Plays',
    languageLabel: 'Alt Pop',
    imageUrl: ARTIST_AVATARS.billieEilishHero,
    streamUrl: 'https://www.youtube.com/watch?v=V9PVRfjEBTI',
    glowColor: 'from-sky-500/25 via-blue-700/15 to-transparent',
  },
];

export interface GroovvyGenre {
  id: string;
  name: string;
  bgClass: string;
  textClass: string;
  borderClass: string;
}

export const GROOVVY_GENRES: GroovvyGenre[] = [
  { id: 'dance-beat', name: 'Dance Beat', bgClass: 'bg-[#1e3a5f]', textClass: 'text-blue-100', borderClass: 'border-blue-400/20' },
  { id: 'electro-pop', name: 'Electro Pop', bgClass: 'bg-[#6b583e]', textClass: 'text-amber-100', borderClass: 'border-amber-400/20' },
  { id: 'alt-indie', name: 'Alternative Indie', bgClass: 'bg-[#7a3b2e]', textClass: 'text-orange-100', borderClass: 'border-orange-400/20' },
  { id: 'hip-hop', name: 'Hip Hop', bgClass: 'bg-[#1b4332]', textClass: 'text-emerald-100', borderClass: 'border-emerald-400/20' },
  { id: 'classical', name: 'Classical Period', bgClass: 'bg-[#5c3d4e]', textClass: 'text-rose-100', borderClass: 'border-rose-400/20' },
  { id: 'hip-hop-rap', name: 'Hip Hop Rap', bgClass: 'bg-[#2b3a67]', textClass: 'text-indigo-100', borderClass: 'border-indigo-400/20' },
];

export interface GroovvyChartTrack {
  id: string;
  rank: string;
  title: string;
  artist: string;
  duration: string;
  durationSec: number;
  plays: string;
  cover: string;
  url: string;
}

export const GROOVVY_TOP_CHARTS: GroovvyChartTrack[] = [
  {
    id: 'chart-01',
    rank: '#01',
    title: 'Havana',
    artist: 'Camila Cabello',
    duration: '3:45',
    durationSec: 225,
    plays: '128M Plays',
    cover: ARTIST_AVATARS.camilaCabello,
    url: 'https://www.youtube.com/watch?v=HCjNJDNgk8Y',
  },
  {
    id: 'chart-02',
    rank: '#02',
    title: 'Jesus Is King',
    artist: 'Kanye West',
    duration: '3:45',
    durationSec: 225,
    plays: '95M Plays',
    cover: ARTIST_AVATARS.kanyeWest,
    url: 'https://www.youtube.com/watch?v=34d7uI3l1W0',
  },
  {
    id: 'chart-03',
    rank: '#03',
    title: 'Closer',
    artist: 'The Chainsmokers',
    duration: '3:45',
    durationSec: 225,
    plays: '210M Plays',
    cover: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=400&q=80',
    url: 'https://www.youtube.com/watch?v=0zGcUoRlhmw',
  },
  {
    id: 'chart-04',
    rank: '#04',
    title: 'Lean On',
    artist: 'Major Lazer ft DJ Snake',
    duration: '3:45',
    durationSec: 225,
    plays: '180M Plays',
    cover: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=400&q=80',
    url: 'https://www.youtube.com/watch?v=YqeW9_5kURI',
  },
  {
    id: 'chart-05',
    rank: '#05',
    title: 'Saiyaara',
    artist: 'Faheem Abdullah, Tanishk Bagchi',
    duration: '4:12',
    durationSec: 252,
    plays: '85M Plays',
    cover: ALBUM_POSTERS.binTere || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=400&q=80',
    url: 'https://www.youtube.com/watch?v=K5N0yW0J_q0',
  },
  {
    id: 'chart-06',
    rank: '#06',
    title: 'Butterfly Effect',
    artist: 'Travis Scott',
    duration: '3:10',
    durationSec: 190,
    plays: '140M Plays',
    cover: ARTIST_AVATARS.travisScott,
    url: 'https://www.youtube.com/watch?v=3bZ41p70uNk',
  },
];

// Cover Flow Albums inspired directly by user-uploaded Image 1
export interface CoverFlowTrack {
  id: string;
  title: string;
  artist: string;
  album: string;
  albumArt: string;
  url: string;
  durationSec: number;
  platform?: string;
}

const COVER_FLOW_ALBUMS: CoverFlowTrack[] = [
  {
    id: 'track-bin-tere',
    title: 'Bin Tere',
    artist: 'Vishal-Shekhar, Shafqat Amanat Ali',
    album: 'I Hate Luv Storys',
    albumArt: ALBUM_POSTERS.binTere,
    url: 'https://www.youtube.com/watch?v=3bZ41p70uNk',
    durationSec: 331,
  },
  {
    id: 'track-soniyo',
    title: 'Soniyo',
    artist: 'Raju Singh, Sonu Nigam, Shreya Ghoshal',
    album: 'Raaz: The Mystery Continues',
    albumArt: ALBUM_POSTERS.soniyo,
    url: 'https://www.youtube.com/watch?v=K5N0yW0J_q0',
    durationSec: 309,
  },
  {
    id: 'track-hindisongs3-yt',
    title: 'Hindi Songs 3',
    artist: 'Pritam, Mohit Chauhan & Arijit Singh',
    album: 'YouTube Music Hits',
    albumArt: ALBUM_POSTERS.dooriyan,
    url: 'https://www.youtube.com/watch?v=7z3YeFqd7xQ',
    durationSec: 334,
    platform: 'youtube',
  },
  {
    id: 'track-darkhaast',
    title: 'Darkhaast',
    artist: 'Mithoon, Arijit Singh, Sunidhi Chauhan',
    album: 'Shivaay',
    albumArt: ALBUM_POSTERS.darkhaast,
    url: 'https://www.youtube.com/watch?v=6p0zY0v4u78',
    durationSec: 374,
  },
  {
    id: 'track-tujhko-jo-paaya',
    title: 'Tujhko Jo Paaya',
    artist: 'Pritam, Mohit Chauhan',
    album: 'Crook',
    albumArt: ALBUM_POSTERS.tujhkoJoPaaya,
    url: 'https://www.youtube.com/watch?v=z34x6629k9I',
    durationSec: 253,
  },
];

// Recommended Movies inspired by Netflix Image 3
interface MovieItem {
  id: string;
  title: string;
  year: string;
  rating: string;
  genre: string;
  duration: string;
  image: string;
  url: string;
}

const RECOMMENDED_MOVIES: MovieItem[] = [
  {
    id: 'soul-conductor',
    title: 'The SOUL CONDUCTOR',
    year: '2024',
    rating: 'IMDb 7.8',
    genre: 'Sci-Fi, Mystery',
    duration: '2h 15min',
    image: MOVIE_POSTERS.soulConductor,
    url: 'https://cinesubz.lk',
  },
  {
    id: 'spider-man',
    title: 'Spider-Man: Across the Spider-Verse',
    year: '2023',
    rating: 'IMDb 8.9',
    genre: 'Animation, Action',
    duration: '2h 20min',
    image: MOVIE_POSTERS.spiderMan,
    url: 'https://cinesubz.lk',
  },
  {
    id: 'harry-potter',
    title: 'Harry Potter (2011)',
    year: '2011',
    rating: 'IMDb 8.1',
    genre: 'Fantasy, Adventure',
    duration: '2h 10min',
    image: MOVIE_POSTERS.harryPotter,
    url: 'https://cinesubz.lk',
  },
  {
    id: 'interstellar',
    title: 'Interstellar',
    year: '2014',
    rating: 'IMDb 8.7',
    genre: 'Sci-Fi, Adventure',
    duration: '2h 49min',
    image: MOVIE_POSTERS.interstellar,
    url: 'https://cinesubz.lk',
  },
  {
    id: 'inception',
    title: 'Inception',
    year: '2010',
    rating: 'IMDb 8.8',
    genre: 'Sci-Fi, Action',
    duration: '2h 28min',
    image: MOVIE_POSTERS.inception,
    url: 'https://cinesubz.lk',
  },
  {
    id: 'tenet',
    title: 'Tenet',
    year: '2020',
    rating: 'IMDb 7.3',
    genre: 'Sci-Fi, Action',
    duration: '2h 30min',
    image: MOVIE_POSTERS.tenet,
    url: 'https://cinesubz.lk',
  },
  {
    id: 'mortal-engines',
    title: 'Mortal Engines',
    year: '2018',
    rating: 'IMDb 6.5',
    genre: 'Sci-Fi, Action',
    duration: '2h 08min',
    image: MOVIE_POSTERS.mortalEngines,
    url: 'https://cinesubz.lk',
  },
  {
    id: 'wonder-woman',
    title: 'Wonder Woman',
    year: '2017',
    rating: 'IMDb 7.4',
    genre: 'Action, Fantasy',
    duration: '2h 21min',
    image: MOVIE_POSTERS.wonderWoman,
    url: 'https://cinesubz.lk',
  },
];

// Parties section from Adze Image 2
interface PartyItem {
  id: string;
  title: string;
  genre: string;
  viewers: string;
  image: string;
  url: string;
}

const ADZE_PARTIES: PartyItem[] = [
  {
    id: 'party-spiderman',
    title: 'Spider Man',
    genre: 'Science Fiction, Fantasy',
    viewers: '+4 friends watching',
    image: MOVIE_POSTERS.spiderMan,
    url: 'https://cinesubz.lk',
  },
  {
    id: 'party-wonderwoman',
    title: 'Wonder Woman',
    genre: 'Adventure, Action',
    viewers: '+7 friends watching',
    image: MOVIE_POSTERS.wonderWoman,
    url: 'https://cinesubz.lk',
  },
  {
    id: 'party-mortalengines',
    title: 'Mortal Engines',
    genre: 'Science Fiction, Suspense',
    viewers: '+3 friends watching',
    image: MOVIE_POSTERS.mortalEngines,
    url: 'https://cinesubz.lk',
  },
  {
    id: 'party-rampage',
    title: 'Rampage',
    genre: 'Adventure, Action',
    viewers: '+9 friends watching',
    image: MOVIE_POSTERS.rampage,
    url: 'https://cinesubz.lk',
  },
];

// Local media item interface and classifications
export type LocalMediaCategory = 'video' | 'movie' | 'music' | 'image';

export interface LocalMediaItem {
  id: string;
  title: string;
  uri: string;
  category: LocalMediaCategory;
  extension: string;
  durationMs?: number;
  lastPositionMs?: number;
  progressPercent?: number;
  thumbnailUrl?: string;
  sizeFormatted?: string;
  resolution?: string;
  lastPlayedAt: number;
  isLocalOrigin?: boolean;
}

export function classifyLocalMedia(uri: string, title: string): LocalMediaCategory {
  const lower = (uri + ' ' + title).toLowerCase();
  if (
    lower.endsWith('.png') ||
    lower.endsWith('.jpg') ||
    lower.endsWith('.jpeg') ||
    lower.endsWith('.webp') ||
    lower.endsWith('.bmp') ||
    lower.endsWith('.gif') ||
    lower.includes('snapshot') ||
    lower.includes('screenshot') ||
    lower.includes('miki_')
  ) {
    return 'image';
  }
  if (
    lower.endsWith('.mp3') ||
    lower.endsWith('.flac') ||
    lower.endsWith('.wav') ||
    lower.endsWith('.aac') ||
    lower.endsWith('.m4a') ||
    lower.endsWith('.ogg') ||
    lower.endsWith('.opus') ||
    lower.includes('audio') ||
    lower.includes('song') ||
    lower.includes('track')
  ) {
    return 'music';
  }
  if (
    lower.includes('movie') ||
    lower.includes('cinema') ||
    lower.includes('remux') ||
    lower.includes('bluray') ||
    lower.includes('1080p') ||
    lower.includes('2160p') ||
    lower.includes('4k')
  ) {
    return 'movie';
  }
  return 'video';
}

export function extractFileExtension(pathStr: string): string {
  const clean = pathStr.split('?')[0].split('#')[0];
  const lastDot = clean.lastIndexOf('.');
  if (lastDot !== -1 && lastDot < clean.length - 1) {
    return clean.slice(lastDot + 1).slice(0, 5).toUpperCase();
  }
  return 'FILE';
}

export function formatMediaRelativeTime(timestamp: number): string {
  const diffSec = Math.max(0, Math.floor((Date.now() - timestamp) / 1000));
  if (diffSec < 60) return 'Just now';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return 'Yesterday';
  return `${diffDays}d ago`;
}

export function formatMediaDurationMs(ms?: number): string {
  if (!ms || ms <= 0) return '';
  const totalSec = Math.floor(ms / 1000);
  const hours = Math.floor(totalSec / 3600);
  const minutes = Math.floor((totalSec % 3600) / 60);
  const seconds = totalSec % 60;
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

const SAMPLE_LOCAL_FILES: LocalMediaItem[] = [
  {
    id: 'sample-local-movie-1',
    title: 'Interstellar (2014) IMAX 4K Remux.mkv',
    uri: '/Users/d/Movies/Interstellar.2014.IMAX.2160p.UHD.Remux.mkv',
    category: 'movie',
    extension: 'MKV',
    durationMs: 169 * 60 * 1000,
    lastPositionMs: 48 * 60 * 1000,
    progressPercent: 28,
    thumbnailUrl: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?w=600&auto=format&fit=crop&q=80',
    sizeFormatted: '48.2 GB',
    resolution: '4K UHD • HDR10',
    lastPlayedAt: Date.now() - 1000 * 60 * 35,
    isLocalOrigin: true,
  },
  {
    id: 'sample-local-movie-2',
    title: 'Spider-Man Across the Spider-Verse (2023).mp4',
    uri: '/Users/d/Movies/Spider-Man.Across.the.Spider-Verse.2023.1080p.mp4',
    category: 'movie',
    extension: 'MP4',
    durationMs: 140 * 60 * 1000,
    lastPositionMs: 95 * 60 * 1000,
    progressPercent: 68,
    thumbnailUrl: HERO_ARTWORKS.spiderMan,
    sizeFormatted: '6.4 GB',
    resolution: '1080p • Dolby Atmos',
    lastPlayedAt: Date.now() - 1000 * 60 * 180,
    isLocalOrigin: true,
  },
  {
    id: 'sample-local-video-1',
    title: 'Cyberpunk Edgerunners - Episode 01.mkv',
    uri: '/Users/d/Videos/Anime/Cyberpunk.Edgerunners.S01E01.1080p.mkv',
    category: 'video',
    extension: 'MKV',
    durationMs: 24 * 60 * 1000,
    lastPositionMs: 22 * 60 * 1000,
    progressPercent: 92,
    thumbnailUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=600&auto=format&fit=crop&q=80',
    sizeFormatted: '1.2 GB',
    resolution: '1080p • 60 FPS',
    lastPlayedAt: Date.now() - 1000 * 60 * 60 * 20,
    isLocalOrigin: true,
  },
  {
    id: 'sample-local-video-2',
    title: 'Planet Earth III - Extreme Deserts 4K.mp4',
    uri: '/Users/d/Videos/Nature/Planet.Earth.III.Deserts.2160p.mp4',
    category: 'video',
    extension: 'MP4',
    durationMs: 58 * 60 * 1000,
    lastPositionMs: 15 * 60 * 1000,
    progressPercent: 26,
    thumbnailUrl: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=600&auto=format&fit=crop&q=80',
    sizeFormatted: '9.8 GB',
    resolution: '4K HDR • 60 FPS',
    lastPlayedAt: Date.now() - 1000 * 60 * 60 * 48,
    isLocalOrigin: true,
  },
  {
    id: 'sample-local-music-1',
    title: 'Pritam, Mohit Chauhan - Dooriyan (Studio Master).flac',
    uri: '/Users/d/Music/Hi-Res/Dooriyan_Studio_Master_24bit_96k.flac',
    category: 'music',
    extension: 'FLAC',
    durationMs: 326 * 1000,
    lastPositionMs: 145 * 1000,
    progressPercent: 44,
    thumbnailUrl: ALBUM_POSTERS.dooriyan,
    sizeFormatted: '94 MB',
    resolution: '24-bit / 96 kHz Hi-Res',
    lastPlayedAt: Date.now() - 1000 * 60 * 15,
    isLocalOrigin: true,
  },
  {
    id: 'sample-local-music-2',
    title: 'Vishal-Shekhar - Bin Tere (Acoustic Vinyl Rip).wav',
    uri: '/Users/d/Music/Vinyl/Bin_Tere_Acoustic_Rip.wav',
    category: 'music',
    extension: 'WAV',
    durationMs: 330 * 1000,
    lastPositionMs: 210 * 1000,
    progressPercent: 63,
    thumbnailUrl: ALBUM_POSTERS.binTere,
    sizeFormatted: '58 MB',
    resolution: '16-bit / 44.1 kHz PCM',
    lastPlayedAt: Date.now() - 1000 * 60 * 90,
    isLocalOrigin: true,
  },
  {
    id: 'sample-local-music-3',
    title: 'The Weeknd - Blinding Lights (Spatial Audio Master).flac',
    uri: '/Users/d/Music/Lossless/Blinding_Lights_Master.flac',
    category: 'music',
    extension: 'FLAC',
    durationMs: 200 * 1000,
    lastPositionMs: 180 * 1000,
    progressPercent: 90,
    thumbnailUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80',
    sizeFormatted: '46 MB',
    resolution: '24-bit / 48 kHz FLAC',
    lastPlayedAt: Date.now() - 1000 * 60 * 60 * 24,
    isLocalOrigin: true,
  },
  {
    id: 'sample-local-music-4',
    title: 'Lofi Girl - Chill Beats Late Night Session.mp3',
    uri: '/Users/d/Music/Lofi/Lofi_Girl_Late_Night.mp3',
    category: 'music',
    extension: 'MP3',
    durationMs: 2890 * 1000,
    lastPositionMs: 820 * 1000,
    progressPercent: 28,
    thumbnailUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80',
    sizeFormatted: '112 MB',
    resolution: '320 kbps Stereo',
    lastPlayedAt: Date.now() - 1000 * 60 * 60 * 36,
    isLocalOrigin: true,
  },
  {
    id: 'sample-local-image-1',
    title: 'Miki_Player_Interstellar_4K_Snapshot.png',
    uri: '/Users/d/Pictures/Miki_Player/Miki_Interstellar_4K_Snapshot.png',
    category: 'image',
    extension: 'PNG',
    thumbnailUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800&auto=format&fit=crop&q=80',
    sizeFormatted: '6.4 MB',
    resolution: '3840 × 2160 (4K UHD)',
    lastPlayedAt: Date.now() - 1000 * 60 * 10,
    isLocalOrigin: true,
  },
  {
    id: 'sample-local-image-2',
    title: 'Cyberpunk_Neon_Street_Wallpaper.jpg',
    uri: '/Users/d/Pictures/Wallpapers/Cyberpunk_Neon_Street.jpg',
    category: 'image',
    extension: 'JPG',
    thumbnailUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=800&auto=format&fit=crop&q=80',
    sizeFormatted: '3.8 MB',
    resolution: '2560 × 1440 (QHD)',
    lastPlayedAt: Date.now() - 1000 * 60 * 75,
    isLocalOrigin: true,
  },
  {
    id: 'sample-local-image-3',
    title: 'Studio_Sound_Visualizer_Waveform_Capture.png',
    uri: '/Users/d/Pictures/Miki_Player/Miki_Visualizer_Waveform.png',
    category: 'image',
    extension: 'PNG',
    thumbnailUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80',
    sizeFormatted: '2.1 MB',
    resolution: '1920 × 1080 (FHD)',
    lastPlayedAt: Date.now() - 1000 * 60 * 60 * 5,
    isLocalOrigin: true,
  },
  {
    id: 'sample-local-image-4',
    title: 'Cinematic_Film_Grade_Color_LUT_Sample.webp',
    uri: '/Users/d/Pictures/LUTs/Cinematic_LUT_Sample.webp',
    category: 'image',
    extension: 'WEBP',
    thumbnailUrl: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800&auto=format&fit=crop&q=80',
    sizeFormatted: '850 KB',
    resolution: '1920 × 1080',
    lastPlayedAt: Date.now() - 1000 * 60 * 60 * 72,
    isLocalOrigin: true,
  },
];

export const HomeDashboardView: React.FC<HomeDashboardViewProps> = ({
  onOpenGames,
  onOpenMusic,
  onOpenWebBrowser,
  onOpenSettings,
  onOpenEq,
  onOpenLocalFile,
  onOpenGmailSignIn,
  onOpenLibrary,
  onOpenSystemAccess,
  onOpenChannels,
}) => {
  const lastActiveNav = usePlayerStore((s) => s.lastActiveNav);
  const setLastActiveNav = usePlayerStore((s) => s.setLastActiveNav);
  const lastActiveCategory = usePlayerStore((s) => s.lastActiveCategory);
  const setLastActiveCategory = usePlayerStore((s) => s.setLastActiveCategory);
  const setMusicPlayerOpen = usePlayerStore((s) => s.setMusicPlayerOpen);

  const [activeNav, setActiveNavState] = useState<HomeNavTab>(
    ((lastActiveNav as HomeNavTab) || 'browse')
  );
  const [activeCategory, setActiveCategoryState] = useState<HomeViewCategory>(
    ((lastActiveCategory as HomeViewCategory) || 'All')
  );

  const setActiveNav = (nav: HomeNavTab) => {
    setActiveNavState(nav);
    setLastActiveNav(nav);
  };

  const setActiveCategory = (cat: HomeViewCategory) => {
    setActiveCategoryState(cat);
    setLastActiveCategory(cat);
  };
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSearchFocused, setIsSearchFocused] = useState<boolean>(false);
  const [isRefreshingMusic, setIsRefreshingMusic] = useState<boolean>(false);
  const [channelFilterCategory, setChannelFilterCategory] = useState<string>('All');
  const [gameFilterCategory, setGameFilterCategory] = useState<string>('All');
  const [isUserLoggedIn, setIsUserLoggedIn] = useState<boolean>(true);
  const [activeAlbumIdx, setActiveAlbumIdx] = useState<number>(2); // Default to Hindi Songs 3 (YouTube Music)
  const [partiesToggle, setPartiesToggle] = useState<boolean>(true);
  const [continueToggle, setContinueToggle] = useState<boolean>(true);
  const [cinesubzList, setCinesubzList] = useState<CineSubzMovie[]>(CINESUBZ_MOVIES);
  const [cinesubzTvList, setCinesubzTvList] = useState<CineSubzTvShow[]>(CINESUBZ_TV_SHOWS);
  const [selectedMusicCategory, setSelectedMusicCategory] = useState<string>('all');
  const [selectedMusicPlatform] = useState<MusicPlatform | 'all'>('youtube');
  const [musicDiscoveryList, setMusicDiscoveryList] = useState<MusicTrack[]>(() =>
    [...MUSIC_DISCOVERY_CATALOG].sort(() => Math.random() - 0.5)
  );
  const [isTopPlayerHidden, setIsTopPlayerHidden] = useState<boolean>(false);
  const [isPlaylistModalOpen, setIsPlaylistModalOpen] = useState<boolean>(false);
  const [isAllArtistsModalOpen, setIsAllArtistsModalOpen] = useState<boolean>(false);
  const [selectedArtistProfile, setSelectedArtistProfile] = useState<ArtistProfile | null>(null);
  const [isLoadingArtistSongs, setIsLoadingArtistSongs] = useState<boolean>(false);
  const [loadingArtistName, setLoadingArtistName] = useState<string>('');
  const [selectedTrackForPlaylist, setSelectedTrackForPlaylist] = useState<any>(null);
  const [newPlaylistName, setNewPlaylistName] = useState<string>('');
  const [liveSearchedTracks, setLiveSearchedTracks] = useState<MusicTrack[]>([]);
  const [liveCinesubzMovies, setLiveCinesubzMovies] = useState<CineSubzMovie[]>([]);
  const [isSearchingCinesubz, setIsSearchingCinesubz] = useState<boolean>(false);
  const [radioViewMode, setRadioViewMode] = useState<'stations' | 'globe'>('stations');
  const [radioFilterGenre, setRadioFilterGenre] = useState<string>('All');
  const [musicCurrentPage, setMusicCurrentPage] = useState<number>(1);
  const CHUNK_SIZE = 12; // 12 tracks per chunk for progressive stream buffering
  const MUSIC_PAGE_SIZE = CHUNK_SIZE;

  const [myFilesFilter, setMyFilesFilter] = useState<'all' | 'videos' | 'music' | 'images'>('all');
  const [previewImage, setPreviewImage] = useState<{
    title: string;
    url: string;
    size?: string;
    dimensions?: string;
  } | null>(null);

  // Background auto-refresh for latest CineSubz & Music Discovery releases
  useEffect(() => {
    fetchLatestCineSubzMovies()
      .then((movies) => {
        if (movies && movies.length > 0) {
          setCinesubzList(movies);
        }
      })
      .catch(() => {});

    fetchLatestCineSubzTvShows()
      .then((shows) => {
        if (shows && shows.length > 0) {
          setCinesubzTvList(shows);
        }
      })
      .catch(() => {});

    fetchLiveMusicDiscovery()
      .then((tracks) => {
        if (tracks && tracks.length > 0) {
          setMusicDiscoveryList(tracks);
        }
      })
      .catch(() => {});
  }, []);

  const recentMedia = usePlayerStore((s) => s.recentMedia);
  const openMedia = usePlayerStore((s) => s.openMedia);
  const volume = usePlayerStore((s) => s.volume);
  const isMuted = usePlayerStore((s) => s.isMuted);
  const toggleMute = usePlayerStore((s) => s.toggleMute);
  const isBuffering = usePlayerStore((s) => s.isBuffering);
  const isPaused = usePlayerStore((s) => s.isPaused);
  const togglePlay = usePlayerStore((s) => s.togglePlay);
  const activePlaybackMode = usePlayerStore((s) => s.activePlaybackMode);
  const currentUri = usePlayerStore((s) => s.currentUri);
  const customPlaylists = usePlayerStore((s) => s.customPlaylists);
  const createPlaylist = usePlayerStore((s) => s.createPlaylist);
  const addTrackToPlaylist = usePlayerStore((s) => s.addTrackToPlaylist);
  const positionMs = usePlayerStore((s) => s.positionMs);
  const durationMs = usePlayerStore((s) => s.durationMs);
  const seek = usePlayerStore((s) => s.seek);
  const currentTitle = usePlayerStore((s) => s.currentTitle);
  const currentArtwork = usePlayerStore((s) => s.currentArtwork);

  const [isHeroLiked, setIsHeroLiked] = useState(false);
  const [heroBannerIndex, setHeroBannerIndex] = useState(0);
  const [isHeroBannerHovered, setIsHeroBannerHovered] = useState(false);
  const [showAllMusicResults, setShowAllMusicResults] = useState(false);

  // Auto-update Trending New Hits banner carousel when not hovered
  useEffect(() => {
    if (isHeroBannerHovered) return;
    const timer = setInterval(() => {
      setHeroBannerIndex((prev) => (prev + 1) % GROOVVY_HERO_BANNERS.length);
    }, 6500);
    return () => clearInterval(timer);
  }, [isHeroBannerHovered]);

  const activeHeroBanner = GROOVVY_HERO_BANNERS[heroBannerIndex] || GROOVVY_HERO_BANNERS[0];

  // Clear selected artist spotlight when user clears the top search query
  useEffect(() => {
    if (!searchQuery.trim() && selectedArtistProfile) {
      setSelectedArtistProfile(null);
    }
  }, [searchQuery, selectedArtistProfile]);

  const handleSelectArtist = useCallback(
    async (artist: ArtistProfile | string) => {
      const isProfile = typeof artist === 'object' && artist !== null;
      const artistName = isProfile ? artist.name : artist.trim();
      if (!artistName) return;

      if (isProfile) {
        setSelectedArtistProfile(artist);
      } else {
        const matched = searchArtists(artistName)[0] || null;
        setSelectedArtistProfile(matched);
      }

      setLoadingArtistName(artistName);
      setIsLoadingArtistSongs(true);
      setSearchQuery(artistName);
      setShowAllMusicResults(true);
      setIsSearchFocused(false);

      try {
        const liveTracks = await fetchArtistSongsLive(artist);
        if (liveTracks && liveTracks.length > 0) {
          setLiveSearchedTracks(liveTracks);
          const first = liveTracks[0];
          openMedia(
            first.streamUrl || first.pageUrl,
            `${first.title} - ${first.artist}`,
            true,
            0,
            first.coverUrl,
            'music'
          );
          setMusicPlayerOpen(false);
        }
      } catch (err) {
        console.error('Failed to load live artist songs:', err);
      } finally {
        setIsLoadingArtistSongs(false);
      }
    },
    [openMedia, setMusicPlayerOpen]
  );

  const formatGroovvyTime = (sec: number) => {
    if (isNaN(sec) || sec < 0) return '0:00';
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const handleShuffleDiscovery = () => {
    setMusicDiscoveryList((prev) => [...prev].sort(() => Math.random() - 0.5));
    const categories = ['romantic', 'hindi', 'english', 'sinhala', 'phonk', 'lo-fi', 'all'];
    const randomCat = categories[Math.floor(Math.random() * categories.length)];
    setSelectedMusicCategory(randomCat);
  };

  const activeAlbum = COVER_FLOW_ALBUMS[activeAlbumIdx] || COVER_FLOW_ALBUMS[0];

  // Detect previously played music or media from recent history
  const previouslyPlayed = useMemo(() => {
    if (!recentMedia || recentMedia.length === 0) return null;
    return (
      recentMedia.find(
        (m) =>
          (m.uri && /\.(mp3|wav|flac|aac|m4a|ogg|opus)/i.test(m.uri)) ||
          m.uri.includes('/mp3') ||
          m.uri.includes('-mp3') ||
          m.uri.includes('somafm') ||
          m.uri.includes('soundcloud') ||
          m.uri.includes('jamendo') ||
          m.uri.includes('audiomack') ||
          m.uri.includes('bandcamp') ||
          m.title.toLowerCase().includes('hindi') ||
          m.title.toLowerCase().includes('dooriyan') ||
          m.title.toLowerCase().includes('saiyaara') ||
          m.title.toLowerCase().includes('song') ||
          m.title.toLowerCase().includes('track')
      ) || null
    );
  }, [recentMedia]);

  // Extract and categorize local files from recent media + sample local media
  const localMediaList: LocalMediaItem[] = useMemo(() => {
    const list: LocalMediaItem[] = [];

    // 1. Process recentMedia from player store
    if (recentMedia && recentMedia.length > 0) {
      for (const item of recentMedia) {
        // Local if no webPlatform, not youtube, and uri doesn't start with external http (or is file:// or localhost)
        const isExternalWeb = Boolean(
          item.webPlatform ||
            item.isYouTube ||
            (item.uri.startsWith('http://') && !item.uri.includes('localhost') && !item.uri.includes('127.0.0.1')) ||
            (item.uri.startsWith('https://') && !item.uri.includes('localhost') && !item.uri.includes('127.0.0.1'))
        );
        if (!isExternalWeb || item.uri.startsWith('file://')) {
          const category = classifyLocalMedia(item.uri, item.title);
          const ext = extractFileExtension(item.uri || item.title);
          list.push({
            id: item.mediaId || item.uri,
            title: item.title,
            uri: item.uri,
            category,
            extension: ext,
            durationMs: item.durationMs,
            lastPositionMs: item.lastPositionMs,
            progressPercent: item.progressPercent,
            thumbnailUrl: item.thumbnailUri,
            lastPlayedAt: item.lastPlayedAt || Date.now(),
            isLocalOrigin: true,
          });
        }
      }
    }

    // 2. Include sample local files (filter out if same uri already present)
    for (const sample of SAMPLE_LOCAL_FILES) {
      if (!list.some((existing) => existing.uri === sample.uri || existing.title === sample.title)) {
        list.push(sample);
      }
    }

    return list;
  }, [recentMedia]);

  const filteredLocalFiles = useMemo(() => {
    let list = localMediaList;

    if (myFilesFilter === 'videos') {
      list = list.filter((f) => f.category === 'video' || f.category === 'movie');
    } else if (myFilesFilter === 'music') {
      list = list.filter((f) => f.category === 'music');
    } else if (myFilesFilter === 'images') {
      list = list.filter((f) => f.category === 'image');
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (f) =>
          f.title.toLowerCase().includes(q) ||
          f.extension.toLowerCase().includes(q) ||
          (f.resolution && f.resolution.toLowerCase().includes(q))
      );
    }

    return list;
  }, [localMediaList, myFilesFilter, searchQuery]);

  const localFileCounts = useMemo(() => {
    return {
      all: localMediaList.length,
      videos: localMediaList.filter((f) => f.category === 'video' || f.category === 'movie').length,
      music: localMediaList.filter((f) => f.category === 'music').length,
      images: localMediaList.filter((f) => f.category === 'image').length,
    };
  }, [localMediaList]);

  // Live dynamic online search across iTunes & streaming APIs when user searches (Race condition resilient)
  useEffect(() => {
    let isCancelled = false;
    const q = searchQuery.trim();
    if (!q) {
      setLiveSearchedTracks([]);
      return;
    }
    const timer = setTimeout(() => {
      const matchedArtist = searchArtists(q)[0];
      const searchPromise = matchedArtist
        ? fetchArtistSongsLive(matchedArtist)
        : fetchOnlineMusicSearch(q, selectedMusicPlatform);

      searchPromise
        .then((tracks) => {
          if (!isCancelled && tracks && tracks.length > 0) {
            setLiveSearchedTracks(tracks);
          }
        })
        .catch(() => {});
    }, 200);
    return () => {
      isCancelled = true;
      clearTimeout(timer);
    };
  }, [searchQuery, selectedMusicPlatform]);

  // Live dynamic online search across CineSubz real movie database (Race condition resilient)
  useEffect(() => {
    let isCancelled = false;
    const q = searchQuery.trim();
    if (!q || q.length < 2) {
      setLiveCinesubzMovies([]);
      setIsSearchingCinesubz(false);
      return;
    }
    setIsSearchingCinesubz(true);
    const timer = setTimeout(() => {
      searchCineSubzLive(q)
        .then((movies) => {
          if (!isCancelled && movies && movies.length > 0) {
            setLiveCinesubzMovies(movies);
          }
        })
        .catch(() => {})
        .finally(() => {
          if (!isCancelled) {
            setIsSearchingCinesubz(false);
          }
        });
    }, 250);
    return () => {
      isCancelled = true;
      clearTimeout(timer);
    };
  }, [searchQuery]);

  // Determine effective section mode
  const effectiveSection: 'all' | 'my_files' | 'movies' | 'series' | 'channels' | 'games' | 'music' | 'radio' | 'watchlist' = useMemo(() => {
    if (activeNav === 'my_files' || activeCategory === 'My Files') return 'my_files';
    if (activeNav === 'watchlist') return 'watchlist';
    if (activeNav === 'channels' || activeCategory === 'Live TV') return 'channels';
    if (activeNav === 'games' || activeCategory === 'Games') return 'games';
    if (activeNav === 'radio' || activeCategory === 'Radio') return 'radio';
    if (activeNav === 'music' || activeCategory === 'Music') return 'music';
    if (activeCategory === 'Movies') return 'movies';
    if (activeCategory === 'Tv series' || activeCategory === 'Animation') return 'series';
    return 'all';
  }, [activeNav, activeCategory]);

  const scrollViewportRef = useRef<HTMLDivElement>(null);

  // Automatically reset scroll position to top when switching sections
  useEffect(() => {
    scrollViewportRef.current?.scrollTo({ top: 0, behavior: 'instant' });
  }, [effectiveSection]);

  // Filtered Channels
  const filteredChannels = useMemo(() => {
    let list = CURATED_CHANNELS;
    if (channelFilterCategory !== 'All') {
      list = list.filter((c) => c.category === channelFilterCategory);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.category.toLowerCase().includes(q) ||
          c.country.toLowerCase().includes(q)
      );
    }
    return list;
  }, [searchQuery, channelFilterCategory]);

  // Filtered Games
  const filteredGames = useMemo(() => {
    let list = GAMES_CATALOG;
    if (gameFilterCategory !== 'All') {
      list = list.filter((g) => g.category === gameFilterCategory);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (g) =>
          g.title.toLowerCase().includes(q) ||
          g.category.toLowerCase().includes(q)
      );
    }
    return list;
  }, [searchQuery, gameFilterCategory]);

  // Filtered Cinema for search
  const filteredCinema = useMemo(() => {
    if (!searchQuery.trim()) return CINEMA_LINKS;
    const q = searchQuery.toLowerCase();
    return CINEMA_LINKS.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.category.toLowerCase().includes(q) ||
        c.tags.some((t) => t.includes(q))
    );
  }, [searchQuery]);

  // Filtered CineSubz Sinhala Subtitle Releases with Real Live Search Integration
  const filteredCinesubz = useMemo(() => {
    if (!searchQuery.trim()) return cinesubzList;
    const q = searchQuery.toLowerCase();
    const localMatches = cinesubzList.filter(
      (m) =>
        m.title.toLowerCase().includes(q) ||
        m.sinhalaTitle.toLowerCase().includes(q) ||
        m.genres.some((g) => g.toLowerCase().includes(q))
    );
    // Combine live results from cinesubz.lk with local matches, deduplicated by title
    const combined = [...liveCinesubzMovies, ...localMatches];
    const seen = new Set<string>();
    const unique: CineSubzMovie[] = [];
    for (const m of combined) {
      const key = m.title.toLowerCase().trim();
      if (!seen.has(key)) {
        seen.add(key);
        unique.push(m);
      }
    }
    return unique;
  }, [cinesubzList, liveCinesubzMovies, searchQuery]);

  // Filtered CineSubz Sinhala Subtitle TV Series
  const filteredCinesubzTv = useMemo(() => {
    if (!searchQuery.trim()) return cinesubzTvList;
    const q = searchQuery.toLowerCase();
    return cinesubzTvList.filter(
      (m) =>
        m.title.toLowerCase().includes(q) ||
        m.sinhalaTitle.toLowerCase().includes(q) ||
        m.season.toLowerCase().includes(q) ||
        m.genres.some((g) => g.toLowerCase().includes(q))
    );
  }, [cinesubzTvList, searchQuery]);

  // Filtered YouTube Music Catalog with Live YouTube Music Search & Categories
  const filteredMusicTracks = useMemo(() => {
    if (searchQuery.trim()) {
      if (liveSearchedTracks.length > 0) {
        return liveSearchedTracks;
      }
      return searchMusicOnline(searchQuery, 'youtube');
    }
    let list = musicDiscoveryList;
    if (selectedMusicCategory !== 'all') {
      const cat = selectedMusicCategory.toLowerCase();
      list = list.filter(
        (t) =>
          t.genre.toLowerCase().includes(cat) ||
          t.title.toLowerCase().includes(cat) ||
          t.artist.toLowerCase().includes(cat)
      );
    }
    return list;
  }, [musicDiscoveryList, selectedMusicCategory, searchQuery, liveSearchedTracks]);

  // Reset pagination to page 1 whenever search query or category changes
  useEffect(() => {
    setMusicCurrentPage(1);
  }, [searchQuery, selectedMusicCategory]);

  const musicTotalPages = useMemo(() => {
    return Math.max(1, Math.ceil(filteredMusicTracks.length / MUSIC_PAGE_SIZE));
  }, [filteredMusicTracks.length]);

  const paginatedMusicTracks = useMemo(() => {
    const start = (musicCurrentPage - 1) * MUSIC_PAGE_SIZE;
    return filteredMusicTracks.slice(start, start + MUSIC_PAGE_SIZE);
  }, [filteredMusicTracks, musicCurrentPage]);

  const isSearchingInMusic = useMemo(() => {
    return searchQuery.trim().length > 0 || Boolean(selectedArtistProfile);
  }, [searchQuery, selectedArtistProfile]);

  const isMusicSearchOrFilterActive = useMemo(() => {
    return (
      isSearchingInMusic ||
      selectedMusicCategory !== 'all'
    );
  }, [isSearchingInMusic, selectedMusicCategory]);

  const matchingSearchArtists = useMemo(() => {
    const q = searchQuery.trim();
    if (q.length < 2 || selectedArtistProfile) return [];
    return searchArtists(q).slice(0, 6);
  }, [searchQuery, selectedArtistProfile]);

  // Shared Sound Lounge line-by-line results renderer (used full-width in Search mode & in-column for filters)
  const renderSoundLoungeResults = (
    isFullWidthSearch: boolean,
    tracks: MusicTrack[] = filteredMusicTracks
  ) => (
    <div className="w-full flex flex-col gap-3">
      <div className="flex items-center justify-between pb-2 border-b border-white/10 gap-3 flex-wrap">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-cyan-600 via-purple-600 to-pink-500 flex items-center justify-center text-white shadow-md shrink-0">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-bold text-white tracking-wide uppercase flex items-center gap-2 flex-wrap">
              <span>Sound Lounge Results</span>
              <span className="text-[10px] font-normal normal-case px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                {tracks.length} Songs
              </span>
              {isFullWidthSearch && searchQuery.trim() && (
                <span className="text-[11px] font-medium normal-case text-white/50 truncate max-w-[260px]">
                  for &ldquo;{searchQuery.trim()}&rdquo;
                </span>
              )}
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleShuffleDiscovery}
            title="Shuffle Discovery"
            className="px-2.5 py-1 rounded-xl bg-white/10 hover:bg-white/15 text-white/80 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Shuffle className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Shuffle Discovery</span>
          </button>
          <button
            onClick={() => {
              setIsRefreshingMusic(true);
              fetchLiveMusicDiscovery()
                .then((tracks) => {
                  if (tracks && tracks.length > 0) setMusicDiscoveryList(tracks);
                })
                .finally(() => setTimeout(() => setIsRefreshingMusic(false), 600));
            }}
            className="px-2.5 py-1 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Live Catalog Sync"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshingMusic ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Sync</span>
          </button>
          <button
            onClick={() => {
              setSelectedArtistProfile(null);
              setSearchQuery('');
              setSelectedMusicCategory('all');
              setShowAllMusicResults(false);
            }}
            className="px-3 py-1 rounded-xl bg-white/10 hover:bg-white/15 text-white/80 hover:text-white text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
            <span>{isFullWidthSearch ? 'Clear Search' : 'Reset'}</span>
          </button>
        </div>
      </div>

      {/* Matching Multilingual Artists Quick Strip */}
      {matchingSearchArtists.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-[10px] font-bold uppercase tracking-wider text-white/40 shrink-0">
            Artists:
          </span>
          {matchingSearchArtists.map((artist) => (
            <button
              key={artist.id}
              onClick={() => handleSelectArtist(artist)}
              className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-white/5 hover:bg-blue-500/20 border border-white/10 hover:border-blue-500/40 transition-all cursor-pointer shrink-0 group"
            >
              <img
                src={artist.imageUrl}
                alt={artist.name}
                className="w-5 h-5 rounded-full object-cover"
              />
              <span className="text-xs font-semibold text-white group-hover:text-blue-300">
                {artist.name}
              </span>
              {artist.nativeName && (
                <span className="text-[10px] text-white/50">{artist.nativeName}</span>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Live Artist Loading State */}
      {isLoadingArtistSongs && (
        <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-gradient-to-r from-blue-900/30 via-indigo-900/20 to-purple-900/10 border border-blue-500/30 text-white animate-pulse">
          <RefreshCw className="w-4 h-4 text-cyan-400 animate-spin shrink-0" />
          <div className="flex flex-col min-w-0">
            <span className="text-xs font-bold text-cyan-300 truncate">
              Loading all live songs from internet for {loadingArtistName}...
            </span>
            <span className="text-[11px] text-white/50 truncate">
              Streaming live YouTube Music tracks with lossless audio
            </span>
          </div>
        </div>
      )}

      {/* Artist Spotlight Banner */}
      {selectedArtistProfile && (
        <div className="p-3.5 rounded-2xl bg-gradient-to-r from-blue-900/40 via-purple-900/20 to-black/40 border border-white/10 flex items-center justify-between gap-3 shadow-lg">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 border border-white/10 shadow-md">
              <img
                src={selectedArtistProfile.imageUrl}
                alt={selectedArtistProfile.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  if (selectedArtistProfile.fallbackImageUrl) {
                    (e.currentTarget as HTMLImageElement).src = selectedArtistProfile.fallbackImageUrl;
                  }
                }}
              />
            </div>
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs sm:text-sm font-extrabold text-white truncate">
                  {selectedArtistProfile.name}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white/10 text-white/80 border border-white/10">
                  {selectedArtistProfile.language === 'english' && '🇺🇸 English'}
                  {selectedArtistProfile.language === 'hindi' && '🇮🇳 Hindi'}
                  {selectedArtistProfile.language === 'sinhala' && '🇱🇰 Sinhala'}
                </span>
              </div>
              {selectedArtistProfile.nativeName && (
                <span className="text-[11px] font-semibold text-white/60">
                  {selectedArtistProfile.nativeName}
                </span>
              )}
              <span className="text-[10px] text-cyan-300 font-mono">
                {selectedArtistProfile.genre} • {selectedArtistProfile.plays}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => {
                if (filteredMusicTracks.length > 0) {
                  const first = filteredMusicTracks[0];
                  openMedia(first.streamUrl || first.pageUrl, `${first.title} - ${first.artist}`, true, 0, first.coverUrl, 'music');
                  setMusicPlayerOpen(false);
                }
              }}
              className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 active:scale-95 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-md shadow-blue-600/30 transition-all cursor-pointer"
            >
              <Play className="w-3 h-3 fill-white" />
              <span>Play All</span>
            </button>
            <button
              onClick={() => {
                setSelectedArtistProfile(null);
                setSearchQuery('');
              }}
              className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/40 hover:text-white transition-colors cursor-pointer"
              title="Clear artist filter"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Line-by-Line Track List */}
      {filteredMusicTracks.length === 0 ? (
        <div className="p-8 rounded-2xl bg-white/5 border border-white/5 text-center flex flex-col items-center gap-2 my-2">
          <Music className="w-8 h-8 text-white/30" />
          <p className="text-xs text-white/60">No songs found matching your search</p>
          <button
            onClick={() => {
              setSelectedArtistProfile(null);
              setSearchQuery('');
              setSelectedMusicCategory('all');
              setShowAllMusicResults(false);
            }}
            className="text-xs text-[#4361ee] hover:underline cursor-pointer"
          >
            Reset Search
          </button>
        </div>
      ) : (
        <div className="w-full rounded-2xl bg-white/[0.02] border border-white/10 overflow-hidden shadow-lg">
          {isFullWidthSearch && (
            <div className="hidden sm:flex items-center justify-between gap-4 px-4 py-2 border-b border-white/10 bg-white/[0.03] text-[10px] font-bold uppercase tracking-wider text-white/40">
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <span className="w-6 text-center shrink-0">#</span>
                <span className="flex-1 min-w-0">Title</span>
                <span className="w-44 lg:w-56 shrink-0">Artist</span>
              </div>
              <div className="flex items-center gap-4 shrink-0">
                <span className="hidden md:inline-block w-28 text-left">Genre</span>
                <span className="w-12 text-right">Time</span>
                <span className="w-16 text-right">Play</span>
              </div>
            </div>
          )}
          <div className="flex flex-col divide-y divide-white/[0.06]">
            {paginatedMusicTracks.map((track, idx) => {
              const trackIndex = (musicCurrentPage - 1) * MUSIC_PAGE_SIZE + idx + 1;
              const isCurrentTrack =
                currentTitle === `${track.title} - ${track.artist}` ||
                currentTitle === track.title;
              return (
                <div
                  key={track.id || `${track.title}-${idx}`}
                  onClick={() => {
                    if (isCurrentTrack) {
                      togglePlay();
                    } else {
                      openMedia(
                        track.streamUrl || track.pageUrl,
                        `${track.title} - ${track.artist}`,
                        true,
                        0,
                        track.coverUrl,
                        'music'
                      );
                      setMusicPlayerOpen(false);
                    }
                  }}
                  className={`flex items-center justify-between gap-4 px-4 py-2.5 transition-colors cursor-pointer group ${
                    isCurrentTrack
                      ? 'bg-blue-500/15'
                      : 'hover:bg-white/[0.06]'
                  }`}
                >
                  <div className="flex items-center gap-3.5 flex-1 min-w-0">
                    <span
                      className={`text-xs font-mono font-bold w-6 text-center shrink-0 ${
                        isCurrentTrack
                          ? 'text-[#4361ee]'
                          : 'text-white/40 group-hover:text-[#4361ee]'
                      }`}
                    >
                      {trackIndex < 10 ? `0${trackIndex}` : trackIndex}
                    </span>
                    <div className="w-9 h-9 rounded-lg overflow-hidden bg-black/60 shrink-0 border border-white/10 shadow-sm relative">
                      <img
                        src={track.coverUrl}
                        alt={track.title}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                      {isCurrentTrack && !isPaused && (
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                          <div className="w-2 h-2 rounded-full bg-[#4361ee] animate-ping" />
                        </div>
                      )}
                    </div>
                    <div className={`flex min-w-0 flex-1 ${isFullWidthSearch ? 'flex-col sm:flex-row sm:items-center sm:gap-4' : 'flex-col'}`}>
                      <span
                        className={`text-xs sm:text-[13px] font-semibold truncate ${isFullWidthSearch ? 'sm:flex-1' : ''} ${
                          isCurrentTrack
                            ? 'text-blue-300'
                            : 'text-white group-hover:text-blue-300'
                        }`}
                      >
                        {track.title}
                      </span>
                      <span
                        className={`text-[11px] sm:text-xs text-white/55 truncate ${
                          isFullWidthSearch ? 'sm:w-44 lg:w-56 sm:shrink-0' : ''
                        }`}
                      >
                        {track.artist}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    {isFullWidthSearch && (
                      <span className="hidden md:inline-block w-28 truncate text-[11px] text-white/40">
                        {track.genre || 'Live Audio'}
                      </span>
                    )}
                    <div className="flex items-center gap-1 text-xs font-mono text-white/45 w-12 justify-end">
                      <Headphones className="w-3 h-3 text-white/25 hidden sm:inline" />
                      <span>{track.duration || '3:45'}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedTrackForPlaylist(track);
                          setIsPlaylistModalOpen(true);
                        }}
                        title="Add to Playlist"
                        className="p-1.5 rounded-lg text-white/30 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                      >
                        <ListPlus className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (isCurrentTrack) {
                            togglePlay();
                          } else {
                            openMedia(
                              track.streamUrl || track.pageUrl,
                              `${track.title} - ${track.artist}`,
                              true,
                              0,
                              track.coverUrl,
                              'music'
                            );
                            setMusicPlayerOpen(false);
                          }
                        }}
                        className={`p-1.5 rounded-lg text-white transition-colors shadow-sm cursor-pointer ${
                          isCurrentTrack
                            ? 'bg-[#4361ee]'
                            : 'bg-white/10 group-hover:bg-[#4361ee]'
                        }`}
                      >
                        {isCurrentTrack && !isPaused ? (
                          <Pause className="w-3.5 h-3.5 fill-current" />
                        ) : (
                          <Play className="w-3.5 h-3.5 fill-current" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Chunked Streaming Pagination Controls */}
      {filteredMusicTracks.length > MUSIC_PAGE_SIZE && (
        <div className="flex items-center justify-between pt-2 border-t border-white/5 mt-1">
          <span className="text-[11px] font-mono text-white/40">
            Showing {(musicCurrentPage - 1) * MUSIC_PAGE_SIZE + 1} -{' '}
            {Math.min(filteredMusicTracks.length, musicCurrentPage * MUSIC_PAGE_SIZE)} of{' '}
            {filteredMusicTracks.length} Songs (Chunked Streaming)
          </span>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setMusicCurrentPage((p) => Math.max(1, p - 1))}
              disabled={musicCurrentPage <= 1}
              className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-white/70 disabled:opacity-30 disabled:pointer-events-none transition-all flex items-center gap-1 cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Previous</span>
            </button>
            <span className="text-xs font-mono text-white/50 px-1">
              Chunk {musicCurrentPage} of {musicTotalPages}
            </span>
            <button
              onClick={() => setMusicCurrentPage((p) => Math.min(musicTotalPages, p + 1))}
              disabled={musicCurrentPage >= musicTotalPages}
              className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-white/70 disabled:opacity-30 disabled:pointer-events-none transition-all flex items-center gap-1 cursor-pointer"
            >
              <span>Next</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );

  // Filtered Radio Garden & Worldwide Live Stations
  const filteredRadioStations = useMemo<RadioGardenStation[]>(() => {
    const gardenStations = searchRadioGardenStations(searchQuery, radioFilterGenre);
    if (gardenStations.length > 0) return gardenStations;
    return INTERNET_MUSIC_STREAMS.map((s) => ({
      id: s.id,
      title: s.title,
      city: 'Global Broadcast',
      country: 'Worldwide',
      countryCode: 'WW',
      flag: '🌐',
      genre: s.genre,
      streamUrl: s.streamUrl,
      radioGardenUrl: `https://radio.garden/visit/global/${s.id}`,
      logoUrl: s.logoUrl,
      description: s.description,
      badge: s.badge,
      accentColor: s.accentColor,
    }));
  }, [radioFilterGenre, searchQuery]);

  const liveSearchTracks = useMemo(() => {
    if (!searchQuery.trim()) return [];
    if (liveSearchedTracks.length > 0) return liveSearchedTracks.slice(0, 8);
    return searchMusicOnline(searchQuery, 'all').slice(0, 8);
  }, [searchQuery, liveSearchedTracks]);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.search-bar-container')) {
        setIsSearchFocused(false);
      }
    };
    window.addEventListener('mousedown', handleOutsideClick);
    return () => window.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const handlePlayAlbum = (idx: number) => {
    setActiveAlbumIdx(idx);
    const track = COVER_FLOW_ALBUMS[idx];
    if (track) {
      openMedia(track.url, `${track.title} - ${track.artist}`, true, 0, track.albumArt, 'music');
      setMusicPlayerOpen(false);
    }
  };

  return (
    <div className="w-full h-full bg-[#07090e] text-white flex select-none overflow-hidden font-sans">
      {/* ============================================================ */}
      {/* 1. FLOATING PILL DOCK (NETFLIX STYLE - EXTREME LEFT)         */}
      {/* ============================================================ */}
      <div className="w-16 py-6 bg-[#04060a] border-r border-white/5 flex flex-col items-center justify-between shrink-0 z-30">
        <div className="flex flex-col items-center gap-6">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-600 via-red-600 to-amber-500 flex items-center justify-center text-white shadow-lg shadow-rose-600/30">
            <Film className="w-5 h-5" />
          </div>

          <div className="flex flex-col items-center gap-3 p-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-xl">
            <button
              onClick={() => {
                setActiveNav('browse');
                setActiveCategory('All');
              }}
              className={`p-2.5 rounded-full transition-all cursor-pointer ${
                activeNav === 'browse' && activeCategory === 'All'
                  ? 'bg-rose-600 text-white shadow-md shadow-rose-600/40'
                  : 'text-white/50 hover:text-white hover:bg-white/10'
              }`}
              title="Home (All Sections)"
            >
              <Compass className="w-4 h-4" />
            </button>

            <button
              onClick={() => {
                setActiveNav('my_files');
                setActiveCategory('My Files');
              }}
              className={`p-2.5 rounded-full transition-all cursor-pointer ${
                effectiveSection === 'my_files'
                  ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/40'
                  : 'text-white/50 hover:text-white hover:bg-white/10'
              }`}
              title="My Files (Videos, Movies, Music, Images)"
            >
              <FolderOpen className="w-4 h-4" />
            </button>

            <button
              onClick={() => {
                setActiveCategory('Movies');
                setActiveNav('browse');
              }}
              className={`p-2.5 rounded-full transition-all cursor-pointer ${
                effectiveSection === 'movies'
                  ? 'bg-rose-600 text-white shadow-md shadow-rose-600/40'
                  : 'text-white/50 hover:text-white hover:bg-white/10'
              }`}
              title="Movies & Cinema"
            >
              <Film className="w-4 h-4" />
            </button>

            <button
              onClick={() => {
                setActiveCategory('Tv series');
                setActiveNav('browse');
              }}
              className={`p-2.5 rounded-full transition-all cursor-pointer ${
                effectiveSection === 'series'
                  ? 'bg-fuchsia-600 text-white shadow-md shadow-fuchsia-600/40'
                  : 'text-white/50 hover:text-white hover:bg-white/10'
              }`}
              title="TV Series & Shows"
            >
              <Tv2 className="w-4 h-4" />
            </button>

            <button
              onClick={() => {
                setActiveNav('watchlist');
              }}
              className={`p-2.5 rounded-full transition-all cursor-pointer ${
                activeNav === 'watchlist'
                  ? 'bg-rose-600 text-white shadow-md shadow-rose-600/40'
                  : 'text-white/50 hover:text-white hover:bg-white/10'
              }`}
              title="Favorites / Watchlist"
            >
              <Heart className="w-4 h-4" />
            </button>

            <button
              onClick={() => {
                setActiveNav('channels');
                setActiveCategory('Live TV');
              }}
              className={`p-2.5 rounded-full transition-all cursor-pointer ${
                activeNav === 'channels' || activeCategory === 'Live TV'
                  ? 'bg-amber-600 text-white shadow-md shadow-amber-600/40'
                  : 'text-white/50 hover:text-white hover:bg-white/10'
              }`}
              title="Live TV Channels"
            >
              <Tv className="w-4 h-4" />
            </button>

            <button
              onClick={() => {
                setActiveNav('games');
                setActiveCategory('Games');
              }}
              className={`p-2.5 rounded-full transition-all cursor-pointer ${
                activeNav === 'games' || activeCategory === 'Games'
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/40'
                  : 'text-white/50 hover:text-white hover:bg-white/10'
              }`}
              title="Games Arcade"
            >
              <Gamepad2 className="w-4 h-4" />
            </button>

            <button
              onClick={() => {
                setActiveNav('music');
                setActiveCategory('Music');
              }}
              className={`p-2.5 rounded-full transition-all cursor-pointer ${
                effectiveSection === 'music'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/40'
                  : 'text-white/50 hover:text-white hover:bg-white/10'
              }`}
              title="3D Music & Discovery"
            >
              <Music className="w-4 h-4" />
            </button>

            <button
              onClick={() => {
                setActiveNav('radio');
                setActiveCategory('Radio');
              }}
              className={`p-2.5 rounded-full transition-all cursor-pointer ${
                effectiveSection === 'radio'
                  ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/40'
                  : 'text-white/50 hover:text-white hover:bg-white/10'
              }`}
              title="Music Radio Live (24/7)"
            >
              <Radio className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex flex-col items-center gap-3">
          {onOpenSettings && (
            <button
              onClick={onOpenSettings}
              className="p-2.5 rounded-full text-white/50 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
              title="Settings"
            >
              <Settings className="w-4 h-4" />
            </button>
          )}

          <div
            onClick={() => setIsUserLoggedIn(!isUserLoggedIn)}
            className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-rose-500 border border-white/20 flex items-center justify-center text-xs font-bold text-white shadow-md cursor-pointer hover:scale-105 transition-transform"
            title={isUserLoggedIn ? 'Click to Log Out' : 'Click to Sign In'}
          >
            {isUserLoggedIn ? 'S' : 'G'}
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 2. LEFT SIDEBAR NAVIGATION                                   */}
      {/* ============================================================ */}
      <aside className="w-60 bg-[#090c14]/90 border-r border-white/5 flex flex-col justify-between p-4 shrink-0 backdrop-blur-2xl">
        <div className="flex flex-col gap-6 pt-1">
          {/* Section: Navigation Feeds */}
          <div className="flex flex-col gap-1">
            <span className="px-3 text-[10px] font-bold text-white/40 uppercase tracking-wider mb-1">
              Main Sections
            </span>

            <button
              onClick={() => {
                setActiveNav('browse');
                setActiveCategory('All');
              }}
              className={`relative flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all text-left cursor-pointer ${
                effectiveSection === 'all'
                  ? 'text-white bg-white/5 font-bold'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              {effectiveSection === 'all' && (
                <span className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r-full bg-rose-500 shadow-sm shadow-rose-500" />
              )}
              <Compass className="w-4 h-4 text-rose-500" />
              <span>Browse All</span>
            </button>

            <button
              onClick={() => {
                setActiveNav('my_files');
                setActiveCategory('My Files');
              }}
              className={`relative flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all text-left cursor-pointer ${
                effectiveSection === 'my_files'
                  ? 'text-white bg-white/5 font-bold'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              {effectiveSection === 'my_files' && (
                <span className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r-full bg-cyan-500 shadow-sm shadow-cyan-500" />
              )}
              <FolderOpen className="w-4 h-4 text-cyan-400" />
              <span>My Files</span>
            </button>

            <button
              onClick={() => {
                setActiveCategory('Movies');
                setActiveNav('browse');
              }}
              className={`relative flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all text-left cursor-pointer ${
                effectiveSection === 'movies'
                  ? 'text-white bg-white/5 font-bold'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              {effectiveSection === 'movies' && (
                <span className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r-full bg-rose-500 shadow-sm shadow-rose-500" />
              )}
              <Film className="w-4 h-4 text-rose-400" />
              <span>Movies & Cinema</span>
            </button>

            <button
              onClick={() => {
                setActiveCategory('Tv series');
                setActiveNav('browse');
              }}
              className={`relative flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all text-left cursor-pointer ${
                effectiveSection === 'series'
                  ? 'text-white bg-white/5 font-bold'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              {effectiveSection === 'series' && (
                <span className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r-full bg-fuchsia-500 shadow-sm shadow-fuchsia-500" />
              )}
              <Tv2 className="w-4 h-4 text-fuchsia-400" />
              <span>TV Series & Shows</span>
            </button>

            <button
              onClick={() => {
                setActiveNav('channels');
                setActiveCategory('Live TV');
              }}
              className={`relative flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all text-left cursor-pointer ${
                effectiveSection === 'channels'
                  ? 'text-white bg-white/5 font-bold'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              {effectiveSection === 'channels' && (
                <span className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r-full bg-amber-500 shadow-sm shadow-amber-500" />
              )}
              <Tv className="w-4 h-4 text-amber-400" />
              <span>Live TV (100+)</span>
            </button>

            <button
              onClick={() => {
                setActiveNav('games');
                setActiveCategory('Games');
              }}
              className={`relative flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all text-left cursor-pointer ${
                effectiveSection === 'games'
                  ? 'text-white bg-white/5 font-bold'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              {effectiveSection === 'games' && (
                <span className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r-full bg-purple-500 shadow-sm shadow-purple-500" />
              )}
              <Gamepad2 className="w-4 h-4 text-purple-400" />
              <span>Game Arcade (219+)</span>
            </button>

            <button
              onClick={() => {
                setActiveNav('music');
                setActiveCategory('Music');
              }}
              className={`relative flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all text-left cursor-pointer ${
                effectiveSection === 'music'
                  ? 'text-white bg-white/5 font-bold'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              {effectiveSection === 'music' && (
                <span className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r-full bg-emerald-500 shadow-sm shadow-emerald-500" />
              )}
              <Music className="w-4 h-4 text-emerald-400" />
              <span>3D Music</span>
            </button>

            <button
              onClick={() => {
                setActiveNav('radio');
                setActiveCategory('Radio');
              }}
              className={`relative flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all text-left cursor-pointer ${
                effectiveSection === 'radio'
                  ? 'text-white bg-white/5 font-bold'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              {effectiveSection === 'radio' && (
                <span className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r-full bg-cyan-500 shadow-sm shadow-cyan-500" />
              )}
              <Radio className="w-4 h-4 text-cyan-400" />
              <span>Music Radio Live</span>
            </button>

            <button
              onClick={() => setActiveNav('watchlist')}
              className={`relative flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all text-left cursor-pointer ${
                activeNav === 'watchlist'
                  ? 'text-white bg-white/5 font-bold'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              {activeNav === 'watchlist' && (
                <span className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r-full bg-rose-500 shadow-sm shadow-rose-500" />
              )}
              <Heart className="w-4 h-4 text-rose-400" />
              <span>Watchlist</span>
            </button>

            <button
              onClick={() => setActiveNav('coming_soon')}
              className={`relative flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all text-left cursor-pointer ${
                activeNav === 'coming_soon'
                  ? 'text-white bg-white/5 font-bold'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              {activeNav === 'coming_soon' && (
                <span className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r-full bg-rose-500 shadow-sm shadow-rose-500" />
              )}
              <Clock className="w-4 h-4 text-white/50" />
              <span>Coming Soon</span>
            </button>
          </div>

          {/* Section: Following Users (From Adze Image 2) */}
          <div className="flex flex-col gap-1">
            <span className="px-3 text-[10px] font-bold text-white/40 uppercase tracking-wider mb-1">
              Following &amp; Who's Watching
            </span>

            {[
              { name: 'Ikako.T', alias: 'Sharma', color: 'bg-emerald-400', initial: 'I' },
              { name: 'Nick.B', alias: 'Divi boo', color: 'bg-amber-400', initial: 'N' },
              { name: 'Vika.J', alias: 'Adhi', color: 'bg-purple-400', initial: 'V' },
              { name: 'Alesanda.B', alias: 'Harsha', color: 'bg-blue-400', initial: 'A' },
            ].map((usr, i) => (
              <div
                key={i}
                className="flex items-center justify-between px-3 py-1.5 rounded-xl hover:bg-white/5 transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-slate-800 to-slate-700 flex items-center justify-center text-[10px] font-bold text-white/90 border border-white/10 group-hover:border-rose-400/50">
                    {usr.initial}
                  </div>
                  <span className="text-xs text-white/70 group-hover:text-white truncate">
                    {usr.name}
                  </span>
                </div>
                <span className={`w-2 h-2 rounded-full ${usr.color}`} />
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar Bottom: Log Out / Sign In & Local Media */}
        <div className="pt-3 border-t border-white/5 flex flex-col gap-1.5">
          {isUserLoggedIn ? (
            <button
              onClick={() => setIsUserLoggedIn(false)}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-rose-400/80 hover:text-rose-300 hover:bg-rose-500/10 transition-all cursor-pointer font-medium"
            >
              <LogOut className="w-4 h-4 text-rose-500" />
              <span>Log Out</span>
            </button>
          ) : (
            <button
              onClick={() => setIsUserLoggedIn(true)}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 transition-all cursor-pointer font-semibold"
            >
              <LogIn className="w-4 h-4 text-emerald-400" />
              <span>Sign In</span>
            </button>
          )}

          <button
            onClick={() => {
              if (onOpenLocalFile) onOpenLocalFile();
            }}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-white/50 hover:text-white hover:bg-white/5 transition-all cursor-pointer"
          >
            <FolderOpen className="w-4 h-4 text-cyan-400" />
            <span>Open Local Media</span>
          </button>
        </div>
      </aside>

      {/* ============================================================ */}
      {/* 3. MAIN DASHBOARD STREAMING CANVAS                           */}
      {/* ============================================================ */}
      <main className="flex-1 flex flex-col h-full overflow-hidden bg-[#07090e]">
        {/* TOP HEADER: NAVIGATION CHEVRONS + SEARCH BAR + CATEGORIES */}
        <header className="h-16 px-6 border-b border-white/5 flex items-center justify-between gap-4 shrink-0 bg-[#07090e]/95 backdrop-blur-xl z-20">
          <div className="flex items-center gap-3">
            {/* Chevrons < > */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => {
                  setActiveNav('browse');
                  setActiveCategory('All');
                }}
                className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/70 hover:text-white transition-all cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  setActiveCategory('Movies');
                }}
                className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/70 hover:text-white transition-all cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Search Bar with Live Results Dropdown */}
            <div className="search-bar-container relative min-w-[260px] sm:min-w-[340px] z-50">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/40" />
              <input
                type="text"
                value={searchQuery}
                onFocus={() => setIsSearchFocused(true)}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setIsSearchFocused(true);
                }}
                placeholder="Search everything across movies, channels, games, music..."
                className="w-full pl-9 pr-14 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-white/40 focus:outline-none focus:border-emerald-500/50 transition-all font-medium"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedArtistProfile(null);
                    setShowAllMusicResults(false);
                  }}
                  title="Clear search"
                  className="absolute right-8 top-1/2 -translate-y-1/2 p-1 text-white/40 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                type="button"
                onClick={onOpenEq}
                title="Audio Equalizer & Spatial Audio"
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-white/30 hover:text-white transition-colors cursor-pointer"
              >
                <Sliders className="w-3.5 h-3.5" />
              </button>

              {/* Live Instant Search Dropdown (suppressed in 3D Music where full-width line-by-line results show directly) */}
              {searchQuery.trim().length > 0 && isSearchFocused && effectiveSection !== 'music' && (
                <div
                  className="absolute left-0 right-0 top-full mt-2 bg-[#090d16]/95 backdrop-blur-2xl border border-white/15 rounded-2xl shadow-2xl p-3 flex flex-col gap-3 max-h-[460px] overflow-y-auto scrollbar-thin z-50 animate-in fade-in zoom-in-95 duration-150"
                  onMouseDown={(e) => e.stopPropagation()}
                >
                  {/* CineSubz Movies & TV Shows Section */}
                  {(filteredCinesubz.length > 0 || filteredCinesubzTv.length > 0) && (
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center justify-between px-1 pb-1 border-b border-white/10 text-[10px] font-bold text-rose-400 tracking-wider">
                        <span className="flex items-center gap-1.5">
                          <span>CINESUBZ LIVE RESULTS ({filteredCinesubz.length + filteredCinesubzTv.length})</span>
                          {isSearchingCinesubz && (
                            <span className="text-[9px] text-rose-400/80 animate-pulse font-normal">
                              • Querying cinesubz.lk...
                            </span>
                          )}
                        </span>
                        <button
                          onClick={() => {
                            setActiveNav('browse');
                            setActiveCategory('Movies');
                            setIsSearchFocused(false);
                          }}
                          className="text-rose-400 hover:text-rose-300 transition-colors font-medium cursor-pointer"
                        >
                          View in Movies & Cinema
                        </button>
                      </div>

                      <div className="flex flex-col gap-1.5">
                        {filteredCinesubz.slice(0, 8).map((movie) => (
                          <div
                            key={movie.id}
                            onClick={() => {
                              if (onOpenWebBrowser) {
                                onOpenWebBrowser(movie.watchUrl || 'https://cinesubz.lk');
                              } else {
                                openMedia(movie.watchUrl || 'https://cinesubz.lk', movie.title);
                              }
                              setIsSearchFocused(false);
                            }}
                            className="flex items-center justify-between gap-3 p-2 rounded-xl bg-white/5 hover:bg-rose-500/15 border border-transparent hover:border-rose-500/30 transition-all cursor-pointer group"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className="w-9 h-12 rounded-lg overflow-hidden bg-black/60 shrink-0 border border-white/10 relative">
                                <img
                                  src={movie.posterUrl}
                                  alt={movie.title}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                  onError={(e) => {
                                    (e.currentTarget as HTMLImageElement).src =
                                      'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=500&auto=format&fit=crop&q=80';
                                  }}
                                />
                              </div>
                              <div className="min-w-0 flex flex-col">
                                <span className="text-xs font-bold text-white truncate group-hover:text-rose-300 transition-colors">
                                  {movie.title}
                                </span>
                                <span className="text-[10px] text-white/60 truncate">
                                  {movie.sinhalaTitle} • {movie.year}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 font-bold">
                                {movie.quality || 'HD'}
                              </span>
                              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                                {movie.rating}
                              </span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (onOpenWebBrowser) {
                                    onOpenWebBrowser(movie.watchUrl || 'https://cinesubz.lk');
                                  } else {
                                    openMedia(movie.watchUrl || 'https://cinesubz.lk', movie.title);
                                  }
                                  setIsSearchFocused(false);
                                }}
                                className="w-7 h-7 rounded-lg bg-rose-600 hover:bg-rose-500 text-white flex items-center justify-center font-bold shadow-md transition-transform hover:scale-110 active:scale-95 cursor-pointer"
                                title="Watch Movie"
                              >
                                <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                              </button>
                            </div>
                          </div>
                        ))}

                        {filteredCinesubzTv.slice(0, 3).map((show) => (
                          <div
                            key={show.id}
                            onClick={() => {
                              if (onOpenWebBrowser) {
                                onOpenWebBrowser(show.watchUrl || 'https://cinesubz.lk/tvshows/');
                              } else {
                                openMedia(show.watchUrl || 'https://cinesubz.lk/tvshows/', show.title);
                              }
                              setIsSearchFocused(false);
                            }}
                            className="flex items-center justify-between gap-3 p-2 rounded-xl bg-white/5 hover:bg-fuchsia-500/15 border border-transparent hover:border-fuchsia-500/30 transition-all cursor-pointer group"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className="w-9 h-12 rounded-lg overflow-hidden bg-black/60 shrink-0 border border-white/10 relative">
                                <img
                                  src={show.posterUrl}
                                  alt={show.title}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                  onError={(e) => {
                                    (e.currentTarget as HTMLImageElement).src =
                                      'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=500&auto=format&fit=crop&q=80';
                                  }}
                                />
                              </div>
                              <div className="min-w-0 flex flex-col">
                                <span className="text-xs font-bold text-white truncate group-hover:text-fuchsia-300 transition-colors">
                                  {show.title}
                                </span>
                                <span className="text-[10px] text-white/60 truncate">
                                  {show.sinhalaTitle} • {show.season}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-fuchsia-500/20 text-fuchsia-300 border border-fuchsia-500/30 font-bold">
                                TV Series
                              </span>
                              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                                {show.rating}
                              </span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (onOpenWebBrowser) {
                                    onOpenWebBrowser(show.watchUrl || 'https://cinesubz.lk/tvshows/');
                                  } else {
                                    openMedia(show.watchUrl || 'https://cinesubz.lk/tvshows/', show.title);
                                  }
                                  setIsSearchFocused(false);
                                }}
                                className="w-7 h-7 rounded-lg bg-fuchsia-600 hover:bg-fuchsia-500 text-white flex items-center justify-center font-bold shadow-md transition-transform hover:scale-110 active:scale-95 cursor-pointer"
                                title="Watch TV Series"
                              >
                                <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Live Music & Tracks Section */}
                  {liveSearchTracks.length > 0 && (
                    <div className="flex flex-col gap-2 pt-1">
                      <div className="flex items-center justify-between px-1 pb-1 border-b border-white/10 text-[10px] font-bold text-emerald-400 tracking-wider">
                        <span>ONLINE & YOUTUBE MUSIC DISCOVERY ({liveSearchTracks.length})</span>
                        <button
                          onClick={() => {
                            setActiveNav('music');
                            setIsSearchFocused(false);
                          }}
                          className="text-emerald-400 hover:text-emerald-300 transition-colors font-medium cursor-pointer"
                        >
                          View in 3D Music
                        </button>
                      </div>

                      <div className="flex flex-col gap-1.5">
                        {liveSearchTracks.map((track) => (
                          <div
                            key={track.id}
                            onClick={() => {
                              if (track.streamUrl) {
                                openMedia(track.streamUrl, `${track.title} - ${track.artist}`, true, 0, track.coverUrl, 'music');
                                setMusicPlayerOpen(true);
                                if (onOpenMusic) onOpenMusic();
                                setIsSearchFocused(false);
                              }
                            }}
                            className="flex items-center justify-between gap-3 p-2 rounded-xl bg-white/5 hover:bg-emerald-500/15 border border-transparent hover:border-emerald-500/30 transition-all cursor-pointer group"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className="w-9 h-9 rounded-lg overflow-hidden bg-black/60 shrink-0 border border-white/10 relative">
                                <img
                                  src={track.coverUrl}
                                  alt={track.title}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                  onError={(e) => {
                                    (e.currentTarget as HTMLImageElement).src =
                                      'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&auto=format&fit=crop&q=80';
                                  }}
                                />
                              </div>
                              <div className="min-w-0 flex flex-col">
                                <div className="flex items-center gap-1.5">
                                  <span className="text-xs font-bold text-white truncate group-hover:text-emerald-300 transition-colors">
                                    {track.title}
                                  </span>
                                  {track.platform === 'youtube' && (
                                    <span className="text-[8px] font-bold px-1.5 py-0.2 rounded bg-red-600/30 text-rose-300 border border-red-500/30 shrink-0">
                                      YouTube Music
                                    </span>
                                  )}
                                </div>
                                <span className="text-[10px] text-white/60 truncate">
                                  {track.artist}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-white/10 text-white/70">
                                {track.duration || track.genre.split('/')[0].trim()}
                              </span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (track.streamUrl) {
                                    openMedia(track.streamUrl, `${track.title} - ${track.artist}`, true, 0, track.coverUrl, 'music');
                                    setMusicPlayerOpen(true);
                                    if (onOpenMusic) onOpenMusic();
                                    setIsSearchFocused(false);
                                  }
                                }}
                                className="w-7 h-7 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 flex items-center justify-center font-bold shadow-md transition-transform hover:scale-110 active:scale-95 cursor-pointer"
                                title="Play Track in Hi-Fi Music Studio"
                              >
                                <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {filteredCinesubz.length === 0 &&
                    filteredCinesubzTv.length === 0 &&
                    liveSearchTracks.length === 0 && (
                      <div className="p-4 text-center text-xs text-white/50">
                        No movies, TV shows, or songs found matching "{searchQuery}".
                      </div>
                    )}
                </div>
              )}
            </div>
          </div>

          {/* Right Header Icons: Bell & User Authentication Status */}
          <div className="flex items-center gap-3">
            <button className="relative p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-all cursor-pointer">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-rose-500" />
            </button>

            {isUserLoggedIn ? (
              <div className="flex items-center gap-2.5 pl-2 border-l border-white/10">
                <ApplicationMenu
                  align="right"
                  onOpenGmailSignIn={onOpenGmailSignIn || (() => {})}
                  onOpenLibrary={onOpenLibrary || (() => {})}
                  onOpenWebBrowser={(url) => onOpenWebBrowser?.(url || '')}
                  onOpenSettings={onOpenSettings || (() => {})}
                  onOpenEq={onOpenEq || (() => {})}
                  onOpenLocalFile={onOpenLocalFile || (() => {})}
                  onOpenSystemAccess={onOpenSystemAccess || (() => {})}
                  onOpenGames={onOpenGames}
                  onOpenMusic={onOpenMusic}
                  onOpenChannels={onOpenChannels}
                  customTrigger={
                    <div className="relative group cursor-pointer" title="Open User & Application Menu">
                      <div className="w-8 h-8 rounded-full bg-slate-800 border border-white/20 group-hover:border-cyan-400 flex items-center justify-center text-xs font-bold text-white shadow-md transition-all group-hover:scale-105">
                        S
                      </div>
                      <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border border-[#07090e]" />
                    </div>
                  }
                />
                <div className="hidden sm:flex flex-col">
                  <span className="text-xs font-semibold text-white/90">Suriya sharma</span>
                  <button
                    onClick={() => setIsUserLoggedIn(false)}
                    className="text-[10px] text-rose-400 hover:underline text-left cursor-pointer"
                  >
                    Log Out
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 pl-2 border-l border-white/10">
                <ApplicationMenu
                  align="right"
                  onOpenGmailSignIn={onOpenGmailSignIn || (() => {})}
                  onOpenLibrary={onOpenLibrary || (() => {})}
                  onOpenWebBrowser={(url) => onOpenWebBrowser?.(url || '')}
                  onOpenSettings={onOpenSettings || (() => {})}
                  onOpenEq={onOpenEq || (() => {})}
                  onOpenLocalFile={onOpenLocalFile || (() => {})}
                  onOpenSystemAccess={onOpenSystemAccess || (() => {})}
                  onOpenGames={onOpenGames}
                  onOpenMusic={onOpenMusic}
                  onOpenChannels={onOpenChannels}
                  customTrigger={
                    <div className="w-8 h-8 rounded-full bg-white/10 border border-white/20 hover:border-cyan-400 flex items-center justify-center text-xs font-bold text-white/60 cursor-pointer transition-all hover:scale-105" title="Open Application Menu">
                      G
                    </div>
                  }
                />
                <div className="hidden sm:flex flex-col">
                  <span className="text-xs font-semibold text-white/70">Guest User</span>
                  <button
                    onClick={() => setIsUserLoggedIn(true)}
                    className="text-[10px] text-emerald-400 hover:underline text-left cursor-pointer font-bold"
                  >
                    Sign In
                  </button>
                </div>
              </div>
            )}
          </div>
        </header>

        {/* SCROLLABLE HOME VIEWPORT */}
        <div
          ref={scrollViewportRef}
          onScroll={(e) => {
            const top = e.currentTarget.scrollTop;
            if (top > 120 && !isTopPlayerHidden) {
              setIsTopPlayerHidden(true);
            } else if (top < 50 && isTopPlayerHidden) {
              setIsTopPlayerHidden(false);
            }
          }}
          className="flex-1 overflow-y-auto p-6 sm:p-8 flex flex-col gap-8 scrollbar-thin"
        >
          {/* ============================================================ */}
          {/* 0. DYNAMIC SECTION: MY FILES & LOCAL MEDIA HUB               */}
          {/* ============================================================ */}
          {effectiveSection === 'my_files' ? (
            <div className="flex flex-col gap-6 w-full pt-1 pb-12">
              {/* Header: Title, Description, and Open Local File Action */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-white/5">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-600 via-teal-600 to-blue-600 flex items-center justify-center text-white shadow-xl shadow-cyan-600/30">
                    <FolderOpen className="w-6 h-6" />
                  </div>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                        My Files & Local Media Hub
                      </h1>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-bold">
                        {localMediaList.length} Files
                      </span>
                    </div>
                    <p className="text-xs text-white/60">
                      Quickly access, resume, and manage your recently played local videos, movies, music, and images.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <button
                    onClick={() => {
                      if (onOpenLocalFile) onOpenLocalFile();
                      const input = document.getElementById('miki-main-file-input');
                      input?.click();
                    }}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition-all shadow-lg shadow-cyan-600/30 cursor-pointer active:scale-95"
                    title="Open local media file from your computer"
                  >
                    <FolderOpen className="w-4 h-4" />
                    <span>Open Local File...</span>
                  </button>
                </div>
              </div>

              {/* Filter Tabs: All Files, Videos & Movies, Music & Audio, Images & Snapshots */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => setMyFilesFilter('all')}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    myFilesFilter === 'all'
                      ? 'bg-cyan-600 text-white font-bold shadow-md shadow-cyan-600/30'
                      : 'bg-white/5 text-white/60 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <HardDrive className="w-3.5 h-3.5" />
                  <span>All Files</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-black/40 text-cyan-300 font-bold">
                    {localFileCounts.all}
                  </span>
                </button>

                <button
                  onClick={() => setMyFilesFilter('videos')}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    myFilesFilter === 'videos'
                      ? 'bg-rose-600 text-white font-bold shadow-md shadow-rose-600/30'
                      : 'bg-white/5 text-white/60 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Film className="w-3.5 h-3.5" />
                  <span>Videos & Movies</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-black/40 text-rose-300 font-bold">
                    {localFileCounts.videos}
                  </span>
                </button>

                <button
                  onClick={() => setMyFilesFilter('music')}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    myFilesFilter === 'music'
                      ? 'bg-emerald-600 text-white font-bold shadow-md shadow-emerald-600/30'
                      : 'bg-white/5 text-white/60 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Music className="w-3.5 h-3.5" />
                  <span>Music & Audio</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-black/40 text-emerald-300 font-bold">
                    {localFileCounts.music}
                  </span>
                </button>

                <button
                  onClick={() => setMyFilesFilter('images')}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    myFilesFilter === 'images'
                      ? 'bg-amber-600 text-white font-bold shadow-md shadow-amber-600/30'
                      : 'bg-white/5 text-white/60 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <ImageIcon className="w-3.5 h-3.5" />
                  <span>Images & Snapshots</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-black/40 text-amber-300 font-bold">
                    {localFileCounts.images}
                  </span>
                </button>
              </div>

              {/* Drag & Drop File Selector Banner */}
              <div
                onClick={() => {
                  if (onOpenLocalFile) onOpenLocalFile();
                  const input = document.getElementById('miki-main-file-input');
                  input?.click();
                }}
                className="w-full rounded-2xl border-2 border-dashed border-cyan-500/30 hover:border-cyan-500/60 bg-gradient-to-r from-cyan-950/25 via-blue-950/15 to-transparent p-4 flex items-center justify-between gap-4 transition-all cursor-pointer group shadow-inner"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 group-hover:scale-110 group-hover:bg-cyan-500/20 transition-all">
                    <FolderOpen className="w-5 h-5" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors">
                      Drag & Drop or Click to Open Local Media
                    </span>
                    <span className="text-[10px] text-white/50">
                      Instant playback for Videos (.mkv, .mp4, .mov, .avi), Music (.flac, .mp3, .wav), and Images (.png, .jpg)
                    </span>
                  </div>
                </div>

                <span className="text-[11px] font-semibold text-cyan-400 px-3 py-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20 group-hover:bg-cyan-500 group-hover:text-black transition-all">
                  Browse Files
                </span>
              </div>

              {/* File Cards Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {filteredLocalFiles.map((file) => (
                  <div
                    key={file.id + '-' + file.uri}
                    onClick={() => {
                      if (file.category === 'image') {
                        setPreviewImage({
                          title: file.title,
                          url: file.thumbnailUrl || file.uri,
                          size: file.sizeFormatted,
                          dimensions: file.resolution,
                        });
                      } else if (file.category === 'music') {
                        openMedia(file.uri, file.title, true, file.lastPositionMs || 0, file.thumbnailUrl, 'music');
                        usePlayerStore.setState({ isMusicPlayerOpen: true });
                      } else {
                        openMedia(file.uri, file.title, true, file.lastPositionMs || 0);
                      }
                    }}
                    className="group relative flex flex-col rounded-2xl overflow-hidden bg-white/5 border border-white/10 hover:border-cyan-400/50 hover:bg-white/10 transition-all cursor-pointer shadow-lg"
                  >
                    <div className="relative aspect-video w-full overflow-hidden bg-black/60">
                      {file.thumbnailUrl ? (
                        <img
                          src={file.thumbnailUrl}
                          alt={file.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 text-white/40 gap-2 p-3">
                          {file.category === 'video' || file.category === 'movie' ? (
                            <FileVideo className="w-8 h-8 text-rose-400" />
                          ) : file.category === 'music' ? (
                            <FileAudio className="w-8 h-8 text-emerald-400" />
                          ) : (
                            <FileImage className="w-8 h-8 text-amber-400" />
                          )}
                        </div>
                      )}

                      {/* Extension and Category Badges */}
                      <div className="absolute top-2 left-2 flex items-center gap-1.5">
                        <span
                          className={`text-[8px] font-bold uppercase tracking-wider px-2 py-0.5 rounded shadow-md ${
                            file.category === 'movie'
                              ? 'bg-rose-600 text-white'
                              : file.category === 'video'
                              ? 'bg-blue-600 text-white'
                              : file.category === 'music'
                              ? 'bg-emerald-600 text-white'
                              : 'bg-amber-600 text-white'
                          }`}
                        >
                          {file.category}
                        </span>
                        <span className="text-[8px] font-mono font-bold px-1.5 py-0.5 rounded bg-black/70 text-white/90 border border-white/10">
                          .{file.extension}
                        </span>
                      </div>

                      {file.resolution && (
                        <div className="absolute top-2 right-2">
                          <span className="text-[8px] font-mono px-1.5 py-0.5 rounded bg-black/70 text-cyan-300 border border-white/10">
                            {file.resolution.split('•')[0].trim()}
                          </span>
                        </div>
                      )}

                      {/* Hover Overlay Button */}
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="w-10 h-10 rounded-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 flex items-center justify-center shadow-xl shadow-cyan-500/40 transition-transform group-hover:scale-110">
                          {file.category === 'image' ? (
                            <Eye className="w-5 h-5 text-slate-950" />
                          ) : (
                            <Play className="w-5 h-5 fill-slate-950 ml-0.5 text-slate-950" />
                          )}
                        </div>
                      </div>

                      {/* Progress Bar for Videos & Music */}
                      {file.progressPercent !== undefined && file.progressPercent > 0 && file.category !== 'image' && (
                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
                          <div
                            className={`h-full ${
                              file.category === 'music' ? 'bg-emerald-500' : 'bg-rose-500'
                            }`}
                            style={{ width: `${Math.min(100, Math.max(5, file.progressPercent))}%` }}
                          />
                        </div>
                      )}
                    </div>

                    <div className="p-3 flex flex-col gap-1.5">
                      <span
                        className="text-xs font-bold text-white truncate group-hover:text-cyan-300 transition-colors"
                        title={file.title}
                      >
                        {file.title}
                      </span>

                      <div className="flex items-center justify-between text-[10px] text-white/50">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3 h-3 text-cyan-400" />
                          <span>{formatMediaRelativeTime(file.lastPlayedAt)}</span>
                        </div>
                        {file.durationMs ? (
                          <span className="font-mono text-white/70">{formatMediaDurationMs(file.durationMs)}</span>
                        ) : file.sizeFormatted ? (
                          <span className="font-mono text-white/70">{file.sizeFormatted}</span>
                        ) : null}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {filteredLocalFiles.length === 0 && (
                <div className="p-12 text-center flex flex-col items-center justify-center gap-3 rounded-2xl bg-white/5 border border-white/10">
                  <FolderOpen className="w-10 h-10 text-white/30" />
                  <span className="text-sm font-semibold text-white/70">
                    No files found in {myFilesFilter} category
                  </span>
                  <p className="text-xs text-white/40 max-w-sm">
                    Open a local file from your system to have it indexed and displayed here.
                  </p>
                </div>
              )}
            </div>
          ) : effectiveSection === 'music' ? (
            <div
              className="flex flex-col gap-8 items-center w-full max-w-6xl pt-2 pb-12 animate-in fade-in duration-300"
              data-studio-albums={COVER_FLOW_ALBUMS.length}
            >
              {/* Groovvy 3D Perspective Music Studio */}
              {isSearchingInMusic ? (
                /* Search Mode: Hide Hero Banner, Top Artists, Genres, Charts & Player — show only results line by line */
                renderSoundLoungeResults(true, filteredMusicTracks)
              ) : (
                <>
                  {/* 1. Dynamic Updating Trending Hits Hero Banner */}
                  <div
                    onMouseEnter={() => setIsHeroBannerHovered(true)}
                    onMouseLeave={() => setIsHeroBannerHovered(false)}
                    className="relative w-full rounded-3xl bg-[#090d16] border border-white/10 overflow-hidden shadow-2xl flex items-center justify-between min-h-[260px] h-72 sm:h-80"
                    style={{ perspective: '1200px' }}
                  >
                    {/* Dynamic Slide Ambient Glow */}
                    <div
                      className={`absolute inset-0 bg-gradient-to-br ${activeHeroBanner.glowColor} pointer-events-none transition-all duration-700`}
                    />

                    {/* Full-Bleed Seamlessly Masked Right Artist Backdrop */}
                    <div
                      className="absolute inset-y-0 right-0 w-full sm:w-[60%] pointer-events-none select-none overflow-hidden"
                      style={{
                        maskImage: 'linear-gradient(to left, rgba(0,0,0,0.95) 35%, rgba(0,0,0,0.55) 68%, transparent 100%)',
                        WebkitMaskImage: 'linear-gradient(to left, rgba(0,0,0,0.95) 35%, rgba(0,0,0,0.55) 68%, transparent 100%)',
                      }}
                    >
                      {heroBannerIndex === 0 ? (
                        <img
                          src={ARTIST_AVATARS.camilaCabelloHero}
                          alt={activeHeroBanner.artist}
                          className="w-full h-full object-cover object-[50%_20%] filter contrast-105 transition-all duration-700"
                        />
                      ) : (
                        <img
                          src={activeHeroBanner.imageUrl}
                          alt={activeHeroBanner.artist}
                          className="w-full h-full object-cover object-top filter contrast-105 transition-all duration-700"
                        />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-r from-[#090d16] via-[#090d16]/60 to-transparent" />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#090d16] via-transparent to-[#090d16]/40" />
                    </div>

                    {/* Left Content */}
                    <div className="relative z-10 flex flex-col items-start max-w-xl p-6 sm:p-10">
                      <div className="text-[11px] font-bold uppercase tracking-widest text-white/60 mb-2.5 flex items-center gap-2 flex-wrap">
                        <span>Groovvy 3D Sound Lounge</span>
                        <span className="text-white/30">•</span>
                        <span className="text-blue-400">Trending New Hits</span>
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-semibold bg-white/10 border border-white/10 text-white/80">
                          {activeHeroBanner.languageLabel}
                        </span>
                      </div>

                      <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-none mb-3 drop-shadow-lg">
                        {activeHeroBanner.title}
                      </h1>

                      <p className="text-sm font-semibold text-white/80 mb-6 flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleSelectArtist(activeHeroBanner.artist)}
                          className="hover:text-blue-400 transition-colors cursor-pointer"
                        >
                          {activeHeroBanner.artist}
                        </button>
                        <span className="w-1.5 h-1.5 rounded-full bg-white/30" />
                        <span className="text-white/55 font-normal">{activeHeroBanner.plays}</span>
                      </p>

                      <div className="flex items-center gap-3 flex-wrap">
                        <button
                          onClick={() => {
                            openMedia(
                              activeHeroBanner.streamUrl,
                              `${activeHeroBanner.title} - ${activeHeroBanner.artist}`,
                              true,
                              0,
                              activeHeroBanner.imageUrl,
                              'music'
                            );
                            setMusicPlayerOpen(false);
                          }}
                          className="px-6 py-2.5 rounded-full bg-[#4361ee] hover:bg-[#3b52d4] active:scale-95 text-white font-bold text-xs tracking-wider uppercase transition-all shadow-xl shadow-blue-600/30 cursor-pointer flex items-center gap-2"
                        >
                          <Play className="w-3.5 h-3.5 fill-white" />
                          <span>Listen Now</span>
                        </button>

                        <button
                          onClick={() => setIsHeroLiked((prev) => !prev)}
                          className={`p-2.5 rounded-full border transition-all cursor-pointer backdrop-blur-md ${
                            isHeroLiked
                              ? 'bg-rose-500/20 border-rose-500/40 text-rose-400'
                              : 'bg-white/10 hover:bg-white/15 border-white/15 text-white/80 hover:text-white'
                          }`}
                          title="Like song"
                        >
                          <Heart className={`w-4 h-4 ${isHeroLiked ? 'fill-rose-400' : ''}`} />
                        </button>

                        <button
                          onClick={() => handleSelectArtist(activeHeroBanner.artist)}
                          className="px-4 py-2 rounded-full bg-white/10 hover:bg-white/15 border border-white/10 text-xs font-semibold text-white/80 hover:text-white transition-all backdrop-blur-md cursor-pointer"
                        >
                          All Artist Songs
                        </button>
                      </div>
                    </div>

                    {/* Right Edge Vertical Slide Dots */}
                    <div className="relative z-20 hidden sm:flex flex-col items-center gap-2 pr-6">
                      {GROOVVY_HERO_BANNERS.map((slide, idx) => (
                        <button
                          key={slide.id}
                          onClick={() => setHeroBannerIndex(idx)}
                          title={`${slide.title} — ${slide.artist}`}
                          className={`transition-all cursor-pointer rounded-full ${
                            heroBannerIndex === idx
                              ? 'w-2 h-6 bg-[#4361ee] shadow-lg shadow-blue-500/50'
                              : 'w-2 h-2 bg-white/30 hover:bg-white/60'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

              {/* 2. Top Artists Ribbon (Image 2 - "also show ribbon of artist") */}
              <div className="w-full flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-extrabold text-white tracking-wide">
                    Top Artists
                  </h3>
                  <button
                    onClick={() => {
                      setIsAllArtistsModalOpen(true);
                    }}
                    className="text-xs font-semibold text-white/40 hover:text-white transition-colors cursor-pointer"
                  >
                    See all
                  </button>
                </div>

                {/* Horizontal Scrolling Ribbon Shelf */}
                <div className="flex items-center gap-4 overflow-x-auto pb-2 pt-1 scrollbar-none w-full">
                  {GROOVVY_TOP_ARTISTS.map((artist) => (
                    <div
                      key={artist.id}
                      onClick={() => {
                        handleSelectArtist(artist.name);
                      }}
                      className="group flex flex-col items-center p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 min-w-[130px] sm:min-w-[140px] cursor-pointer hover:-translate-y-1 transition-all shadow-lg select-none"
                    >
                      <div className="relative w-20 h-20 sm:w-22 sm:h-22 rounded-2xl overflow-hidden mb-2.5 shadow-md border border-white/10 group-hover:scale-105 transition-transform">
                        <img
                          src={artist.imageUrl}
                          alt={artist.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const img = e.currentTarget as HTMLImageElement;
                            if (artist.id === 'travis-scott') img.src = 'https://thumb.wikimedia.org/wikipedia/commons/thumb/1/14/TravisScott-byPhilipRomano_%28cropped%29.jpg/960px-TravisScott-byPhilipRomano_%28cropped%29.jpg';
                            else if (artist.id === 'billie-eilish') img.src = 'https://thumb.wikimedia.org/wikipedia/commons/thumb/9/91/BillieEilishO2160622_%2817_of_45%29_%2852153177539%29_%28cropped_2%29.jpg/960px-BillieEilishO2160622_%2817_of_45%29_%2852153177539%29_%28cropped_2%29.jpg';
                            else if (artist.id === 'camila-cabello') img.src = 'https://thumb.wikimedia.org/wikipedia/commons/thumb/f/fe/Camila_Cabello_Sundance_2024_Cropped_%28cropped%29.jpg/960px-Camila_Cabello_Sundance_2024_Cropped_%28cropped%29.jpg';
                            else if (artist.id === 'kanye-west') img.src = 'https://thumb.wikimedia.org/wikipedia/commons/thumb/5/58/Kanye_West_at_the_2009_Tribeca_Film_Festival_%28crop_2%29.jpg/960px-Kanye_West_at_the_2009_Tribeca_Film_Festival_%28crop_2%29.jpg';
                            else if (artist.id === 'nicki-minaj') img.src = 'https://thumb.wikimedia.org/wikipedia/commons/thumb/1/14/Nicki_Minaj_at_the_2022_MTV_VMAs_02_%28cropped%29.jpg/960px-Nicki_Minaj_at_the_2022_MTV_VMAs_02_%28cropped%29.jpg';
                            else if (artist.id === 'the-weeknd') img.src = 'https://thumb.wikimedia.org/wikipedia/commons/thumb/a/a0/The_Weeknd_Cannes_2023_%28cropped%29.jpg/960px-The_Weeknd_Cannes_2023_%28cropped%29.jpg';
                            else if (artist.id === 'dua-lipa') img.src = 'https://thumb.wikimedia.org/wikipedia/commons/thumb/1/1c/DuaLipaO2020522_%2840_of_99%29_%2852052474369%29_%28cropped%29.jpg/960px-DuaLipaO2020522_%2840_of_99%29_%2852052474369%29_%28cropped%29.jpg';
                          }}
                        />
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors" />
                      </div>
                      <span className="text-xs font-bold text-white group-hover:text-blue-400 transition-colors truncate max-w-[120px] text-center">
                        {artist.name}
                      </span>
                      <span className="text-[11px] font-semibold text-white/40 group-hover:text-white/70 transition-colors mt-0.5">
                        {artist.plays}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 3. Lower Section: 2 Columns (Genres & Top Charts on Left, Player Card on Right) */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full items-start">
                {/* Left Column (col-span-7) */}
                <div className="lg:col-span-7 flex flex-col gap-6 w-full">
                  {isMusicSearchOrFilterActive || showAllMusicResults ? (
                    renderSoundLoungeResults(false, filteredMusicTracks)
                  ) : (
                    <>
                      {/* Genres Section */}
                      <div className="w-full flex flex-col gap-3">
                        <div className="flex items-center justify-between">
                          <h3 className="text-base font-extrabold text-white tracking-wide">
                            Genres
                          </h3>
                          <button
                            onClick={() => setShowAllMusicResults(true)}
                            className="text-xs font-semibold text-white/40 hover:text-white transition-colors cursor-pointer"
                          >
                            See all
                          </button>
                        </div>

                        {/* 2 x 3 Colored Genre Cards */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                          {GROOVVY_GENRES.map((genre) => (
                            <div
                              key={genre.id}
                              onClick={() => {
                                setSelectedMusicCategory(
                                  genre.id === 'dance-beat' ? 'phonk' :
                                  genre.id === 'electro-pop' ? 'lo-fi' :
                                  genre.id === 'alt-indie' ? 'english' :
                                  genre.id === 'hip-hop' ? 'hindi' :
                                  genre.id === 'classical' ? 'romantic' : 'all'
                                );
                              }}
                              className={`${genre.bgClass} ${genre.borderClass} border rounded-2xl p-4 flex items-center justify-center text-center cursor-pointer hover:scale-[1.03] transition-all shadow-md group`}
                            >
                              <span className={`text-xs font-bold tracking-wide ${genre.textClass}`}>
                                {genre.name}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Top Charts Section */}
                      <div className="w-full flex flex-col gap-3">
                        <div className="flex items-center justify-between">
                          <h3 className="text-base font-extrabold text-white tracking-wide">
                            Top Charts
                          </h3>
                          <div className="flex items-center gap-3">
                            <button
                              onClick={handleShuffleDiscovery}
                              title="Shuffle Discovery"
                              className="text-xs font-semibold text-white/40 hover:text-white transition-colors cursor-pointer flex items-center gap-1"
                            >
                              <Shuffle className="w-3 h-3" />
                              <span>Shuffle</span>
                            </button>
                            <button
                              onClick={() => setShowAllMusicResults(true)}
                              className="text-xs font-semibold text-white/40 hover:text-white transition-colors cursor-pointer"
                            >
                              See all
                            </button>
                          </div>
                        </div>

                        {/* Ranked Tracks List */}
                        <div className="flex flex-col gap-2">
                          {GROOVVY_TOP_CHARTS.map((track) => (
                            <div
                              key={track.id}
                              onClick={() => {
                                openMedia(track.url, `${track.title} - ${track.artist}`, true, 0, track.cover, 'music');
                                setMusicPlayerOpen(false);
                              }}
                              className="flex items-center justify-between p-2.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/15 transition-all cursor-pointer group"
                            >
                              <div className="flex items-center gap-3.5 min-w-0">
                                <span className="text-xs font-black text-white/40 group-hover:text-[#4361ee] transition-colors w-6 text-center">
                                  {track.rank}
                                </span>
                                <div className="w-10 h-10 rounded-xl overflow-hidden bg-black/60 shrink-0 border border-white/10 shadow-sm">
                                  <img
                                    src={track.cover}
                                    alt={track.title}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                                <div className="flex flex-col min-w-0">
                                  <span className="text-xs font-bold text-white group-hover:text-blue-300 transition-colors truncate">
                                    {track.title}
                                  </span>
                                  <span className="text-[11px] text-white/50 truncate">
                                    {track.artist}
                                  </span>
                                </div>
                              </div>

                              <div className="flex items-center gap-3 shrink-0">
                                <div className="flex items-center gap-1 text-xs font-mono text-white/40">
                                  <Headphones className="w-3 h-3 text-white/30" />
                                  <span>{track.duration}</span>
                                </div>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    openMedia(track.url, `${track.title} - ${track.artist}`, true, 0, track.cover, 'music');
                                    setMusicPlayerOpen(false);
                                  }}
                                  className="p-2 rounded-xl bg-white/10 group-hover:bg-[#4361ee] text-white transition-colors shadow-sm"
                                >
                                  <Play className="w-3.5 h-3.5 fill-current" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* Right Column (col-span-5): Dedicated Player Card (Image 2) */}
                <div className="lg:col-span-5 flex flex-col rounded-3xl bg-[#0f1422] border border-white/10 p-5 shadow-2xl backdrop-blur-xl gap-4 w-full">
                  <div className="flex items-center justify-between w-full">
                    <h3 className="text-sm font-black text-white uppercase tracking-wider">Player</h3>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={toggleMute}
                        title={isMuted || volume === 0 ? "Unmute" : "Mute"}
                        className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                      >
                        {isMuted || volume === 0 ? (
                          <VolumeX className="w-4 h-4 text-rose-400" />
                        ) : (
                          <Volume2 className="w-4 h-4" />
                        )}
                      </button>
                      <button
                        onClick={onOpenMusic}
                        title="Chat & Lyrics"
                        className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                      >
                        <MessageSquareText className="w-4 h-4" />
                      </button>
                      <button
                        onClick={onOpenMusic}
                        title="Open Full Player"
                        className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                      >
                        <ListMusic className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Album Artwork */}
                  <div className="relative w-44 h-44 sm:w-52 sm:h-52 mx-auto rounded-2xl overflow-hidden shadow-2xl border border-white/15 my-1 group">
                    <img
                      src={
                        currentArtwork ||
                        previouslyPlayed?.thumbnailUri ||
                        activeAlbum.albumArt ||
                        ARTIST_AVATARS.travisScott
                      }
                      alt={currentTitle || 'Butterfly Effect'}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button
                        onClick={togglePlay}
                        className="p-3.5 rounded-full bg-white text-[#4361ee] shadow-2xl hover:scale-110 active:scale-95 transition-all"
                      >
                        {!isPaused && currentUri ? (
                          <Pause className="w-5 h-5 fill-current" />
                        ) : (
                          <Play className="w-5 h-5 fill-current ml-0.5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Track Info */}
                  <div className="flex flex-col items-center text-center gap-0.5">
                    <h4 className="text-base font-extrabold text-white truncate max-w-xs">
                      {currentTitle || 'Butterfly Effect'}
                    </h4>
                    <p className="text-xs font-semibold text-white/60 truncate max-w-xs">
                      {previouslyPlayed ? 'Resume Playback' : activeAlbum.artist || 'Travis Scott'}
                    </p>
                    <span className="text-[10px] text-white/40 font-mono mt-0.5">
                      Best of 2020
                    </span>
                  </div>

                  {/* Scrubber Progress Bar */}
                  <div className="flex flex-col gap-1 w-full pt-1">
                    <div className="flex items-center justify-between text-[11px] font-mono text-white/40">
                      <span>{formatGroovvyTime(currentUri ? positionMs / 1000 : 165)}</span>
                      <span>
                        {durationMs > 0
                          ? formatGroovvyTime(Math.max(0, (durationMs - positionMs) / 1000))
                          : '1:02'}
                      </span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={durationMs > 0 ? durationMs / 1000 : 227}
                      value={positionMs / 1000}
                      onChange={(e) => {
                        const targetMs = parseFloat(e.target.value) * 1000;
                        seek(targetMs);
                      }}
                      className="w-full h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer accent-[#4361ee]"
                    />
                  </div>

                  {/* Royal Blue Playback Controls Deck (Image 2) */}
                  <div className="rounded-2xl bg-[#4361ee] p-4 flex flex-col gap-3 shadow-xl w-full">
                    <div className="flex items-center justify-between text-white">
                      <button
                        onClick={handleShuffleDiscovery}
                        className="p-1.5 hover:text-white/80 transition-colors cursor-pointer"
                        title="Shuffle Discovery"
                      >
                        <Shuffle className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => {
                          handlePlayAlbum((activeAlbumIdx - 1 + COVER_FLOW_ALBUMS.length) % COVER_FLOW_ALBUMS.length);
                          setMusicPlayerOpen(false);
                        }}
                        className="p-1.5 hover:text-white/80 transition-colors cursor-pointer"
                        title="Previous"
                      >
                        <SkipBack className="w-5 h-5 fill-current" />
                      </button>

                      <button
                        onClick={() => {
                          if (currentUri && activePlaybackMode === 'music') {
                            togglePlay();
                          } else if (previouslyPlayed) {
                            openMedia(
                              previouslyPlayed.uri,
                              previouslyPlayed.title,
                              true,
                              previouslyPlayed.lastPositionMs,
                              previouslyPlayed.thumbnailUri,
                              'music'
                            );
                            setMusicPlayerOpen(false);
                          } else {
                            handlePlayAlbum(activeAlbumIdx);
                            setMusicPlayerOpen(false);
                          }
                        }}
                        className="p-3 rounded-full bg-white text-[#4361ee] shadow-lg hover:scale-105 active:scale-95 transition-all cursor-pointer"
                        title={!isPaused && activePlaybackMode === 'music' ? 'Pause' : 'Play'}
                      >
                        {isBuffering ? (
                          <RefreshCw className="w-5 h-5 animate-spin" />
                        ) : !isPaused && activePlaybackMode === 'music' ? (
                          <Pause className="w-5 h-5 fill-current" />
                        ) : (
                          <Play className="w-5 h-5 fill-current ml-0.5" />
                        )}
                      </button>

                      <button
                        onClick={() => {
                          handlePlayAlbum((activeAlbumIdx + 1) % COVER_FLOW_ALBUMS.length);
                          setMusicPlayerOpen(false);
                        }}
                        className="p-1.5 hover:text-white/80 transition-colors cursor-pointer"
                        title="Next"
                      >
                        <SkipForward className="w-5 h-5 fill-current" />
                      </button>

                      <button
                        onClick={() => {
                          if (positionMs > 0) seek(0);
                        }}
                        className="p-1.5 hover:text-white/80 transition-colors cursor-pointer"
                        title="Repeat"
                      >
                        <Repeat className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Expandable ^ LYRICS Button */}
                    <button
                      onClick={() => {
                        if (onOpenMusic) onOpenMusic();
                      }}
                      className="w-full pt-1 pb-0.5 flex items-center justify-center gap-1.5 text-[11px] font-black uppercase tracking-widest text-white/90 hover:text-white transition-colors cursor-pointer border-t border-white/20"
                    >
                      <ChevronDown className="w-3.5 h-3.5 rotate-180" />
                      <span>LYRICS</span>
                    </button>
                  </div>
                </div>
              </div>
                </>
              )}
            </div>
          ) : effectiveSection === 'radio' ? (
            /* ============================================================ */
            /* A2. DYNAMIC SECTION: RADIO GARDEN GLOBAL LIVE CHANNELS       */
            /* ============================================================ */
            <div className="flex flex-col gap-6 w-full">
              {/* Radio Garden Broadcast Hero Banner */}
              <div className="relative w-full rounded-3xl overflow-hidden border border-emerald-500/20 bg-gradient-to-r from-emerald-950/80 via-slate-900 to-black p-8 sm:p-10 flex flex-col justify-between min-h-[280px] shadow-2xl">
                {/* Right Side Visual Artwork */}
                <div className="absolute right-0 top-0 bottom-0 w-1/2 lg:w-3/5 pointer-events-none z-0 overflow-hidden flex items-center justify-end">
                  <img
                    src={HERO_ARTWORKS.audioSynthesizer}
                    alt="Radio Garden Broadcast Artwork"
                    className="h-full w-full object-cover object-right opacity-80"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-transparent to-transparent pointer-events-none" />
                </div>

                <div className="relative z-10 flex flex-col gap-3 max-w-xl">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-semibold w-fit">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>Radio Garden Global Live Infrastructure</span>
                  </div>
                  <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight flex items-center gap-3">
                    <span>Radio Garden Live</span>
                    <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-mono font-bold border border-emerald-500/30">
                      radio.garden
                    </span>
                  </h1>
                  <p className="text-sm text-white/70 leading-relaxed">
                    Tune into live radio broadcasts around the globe powered by Radio Garden. Explore cities and stations from London to Tokyo, Paris, New York, and Colombo in pristine audio.
                  </p>

                  <div className="flex items-center gap-3 pt-2 flex-wrap">
                    <button
                      onClick={() => {
                        const station = RADIO_GARDEN_STATIONS[0];
                        if (station) openMedia(station.streamUrl, `${station.title} (${station.city}, ${station.country})`, false, 0, station.logoUrl, 'radio');
                      }}
                      className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/30 transition-all cursor-pointer"
                    >
                      <Play className="w-4 h-4 fill-current" />
                      <span>Play London Soho Radio</span>
                    </button>

                    {/* View Switcher: Stations vs 3D Globe */}
                    <div className="flex items-center gap-1 p-1 rounded-xl bg-white/10 border border-white/15 backdrop-blur-md">
                      <button
                        onClick={() => setRadioViewMode('stations')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                          radioViewMode === 'stations'
                            ? 'bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/30'
                            : 'text-white/70 hover:text-white'
                        }`}
                      >
                        <Radio className="w-3.5 h-3.5" />
                        <span>Curated Stations</span>
                      </button>
                      <button
                        onClick={() => setRadioViewMode('globe')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                          radioViewMode === 'globe'
                            ? 'bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/30'
                            : 'text-white/70 hover:text-white'
                        }`}
                      >
                        <Globe className="w-3.5 h-3.5" />
                        <span>3D Interactive Globe</span>
                      </button>
                    </div>

                    <span className="text-xs text-white/50">{RADIO_GARDEN_STATIONS.length || INTERNET_MUSIC_STREAMS.length} Global Cities Live</span>
                  </div>
                </div>
              </div>

              {/* View 1: 3D Interactive Radio Garden Globe */}
              {radioViewMode === 'globe' ? (
                <div className="flex flex-col gap-3 w-full">
                  <div className="flex items-center justify-between px-2 text-xs text-white/70">
                    <span className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      <span>Spin the interactive 3D globe to tune into thousands of stations on earth (radio.garden)</span>
                    </span>
                    <a
                      href="https://radio.garden/"
                      target="_blank"
                      rel="noreferrer"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onOpenWebBrowser) onOpenWebBrowser('https://radio.garden/');
                      }}
                      className="text-emerald-400 hover:text-emerald-300 transition-colors flex items-center gap-1 font-semibold"
                    >
                      <span>Open in Browser</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                  <div className="relative w-full h-[660px] rounded-3xl overflow-hidden border border-emerald-500/30 bg-black/95 shadow-2xl">
                    <iframe
                      src="https://radio.garden/"
                      title="Radio Garden Live Interactive 3D Globe"
                      className="w-full h-full border-0 rounded-3xl"
                      allow="autoplay; encrypted-media"
                      sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
                    />
                  </div>
                </div>
              ) : (
                /* View 2: Curated Radio Garden Stations Directory */
                <div className="flex flex-col gap-5 w-full">
                  {/* Radio City & Genre Filter Pills */}
                  <div className="flex items-center gap-2 flex-wrap">
                    {['All', 'London', 'Tokyo', 'Paris', 'New York', 'Amsterdam', 'Berlin', 'Colombo', 'Sydney', 'Rio', 'Ambient', 'Indie', 'Classical'].map((filterName) => {
                      const isActive = radioFilterGenre === filterName;
                      return (
                        <button
                          key={filterName}
                          onClick={() => setRadioFilterGenre(filterName)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                            isActive
                              ? 'bg-emerald-600 text-white font-bold shadow-md shadow-emerald-600/30'
                              : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white border border-white/10'
                          }`}
                        >
                          {filterName}
                        </button>
                      );
                    })}
                  </div>

                  {/* Radio Garden Stations Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {filteredRadioStations.map((station: RadioGardenStation) => (
                      <div
                        key={station.id}
                        onClick={() => openMedia(station.streamUrl, `${station.title} (${station.city}, ${station.country})`, false, 0, station.logoUrl, 'radio')}
                        className="group flex flex-col justify-between p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-emerald-500/50 hover:bg-white/10 transition-all cursor-pointer shadow-lg relative overflow-hidden"
                      >
                        <div className="flex items-center gap-3.5">
                          <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 bg-black/40 border border-white/10">
                            <img src={station.logoUrl} alt={station.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                          </div>
                          <div className="flex flex-col min-w-0 flex-1">
                            <div className="flex items-center gap-1.5">
                              <span className="text-sm">{station.flag}</span>
                              <span className="text-xs font-bold text-white truncate group-hover:text-emerald-400 transition-colors">
                                {station.title}
                              </span>
                            </div>
                            <span className="text-[11px] text-white/60 truncate">
                              {station.city}, {station.country} • {station.genre}
                            </span>
                            <span className="text-[9px] font-mono text-emerald-400/90 mt-1 font-semibold">
                              {station.badge}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-3 mt-3 border-t border-white/5 text-[11px]">
                          <a
                            href={station.radioGardenUrl}
                            target="_blank"
                            rel="noreferrer"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (onOpenWebBrowser) {
                                onOpenWebBrowser(station.radioGardenUrl);
                              }
                            }}
                            className="text-white/40 hover:text-emerald-400 transition-colors flex items-center gap-1 text-[10px]"
                          >
                            <span>radio.garden</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                          <button
                            type="button"
                            className="px-3 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 group-hover:bg-emerald-500 group-hover:text-black font-bold text-xs flex items-center gap-1 transition-all"
                          >
                            <Play className="w-3.5 h-3.5 fill-current" />
                            <span>Play Live</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : effectiveSection === 'channels' ? (
            /* ============================================================ */
            /* B. DYNAMIC SECTION: LIVE TV CHANNELS (100+ CURATED)          */
            /* ============================================================ */
            <div className="flex flex-col gap-6">
              {/* Broadcast Hero Banner */}
              <div className="relative w-full rounded-3xl overflow-hidden border border-amber-500/20 bg-gradient-to-r from-amber-950/60 via-slate-900 to-black p-8 sm:p-10 flex flex-col justify-between min-h-[300px] shadow-2xl">
                {/* Right Side Themed Visual Artwork */}
                <div className="absolute right-0 top-0 bottom-0 w-1/2 lg:w-3/5 pointer-events-none z-0 overflow-hidden flex items-center justify-end">
                  <img
                    src={HERO_ARTWORKS.broadcastCenter}
                    alt="Broadcast Center Artwork"
                    className="h-full w-full object-cover object-right opacity-90"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-transparent to-transparent pointer-events-none" />
                </div>
                <div className="relative z-10 flex items-center gap-2.5">
                  <span className="flex items-center gap-1.5 text-[10px] font-bold px-3 py-1 rounded-full bg-red-600 text-white shadow-lg shadow-red-600/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                    LIVE ON AIR
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-white/10 text-white/80 border border-white/10">
                    100+ Global Feeds
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-white/10 text-cyan-400 border border-white/10">
                    1080p & 4K HD
                  </span>
                </div>

                <div className="relative z-10 max-w-2xl my-3">
                  <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                    Global IPTV Master Control Center
                  </h1>
                  <p className="text-xs sm:text-sm text-white/70 mt-2 leading-relaxed">
                    Direct low-latency television broadcasts across worldwide news networks, live sports arenas, theatrical movie channels, and wildlife feeds with offline local logos and automated failover mirrors.
                  </p>
                </div>

                <div className="relative z-10 flex items-center gap-3">
                  <button
                    onClick={() => openMedia(CURATED_CHANNELS[0].streamUrl, CURATED_CHANNELS[0].name)}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs shadow-xl active:scale-95 transition-all cursor-pointer"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    <span>Watch {CURATED_CHANNELS[0].name}</span>
                  </button>
                  <span className="text-xs text-white/50">{filteredChannels.length} Streams Active</span>
                </div>
              </div>

              {/* Channel Category Filter Pills */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                {['All', 'News', 'Movies', 'Music', 'Sports', 'Tech', 'Nature', 'Entertainment'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setChannelFilterCategory(cat)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                      channelFilterCategory === cat
                        ? 'bg-amber-500 text-black font-bold shadow-md shadow-amber-500/20'
                        : 'bg-white/5 text-white/60 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Complete Live Channels Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {filteredChannels.map((ch: LiveChannel) => (
                  <div
                    key={ch.id}
                    onClick={() => openMedia(ch.streamUrl, ch.name)}
                    className="group flex flex-col rounded-2xl overflow-hidden bg-white/5 border border-white/10 hover:border-amber-400/50 hover:bg-white/10 transition-all cursor-pointer shadow-lg"
                  >
                    <div className="relative aspect-video w-full overflow-hidden bg-black/60 p-2 flex items-center justify-center">
                      <img
                        src={ch.logo}
                        alt={ch.name}
                        className="w-full h-full object-contain group-hover:scale-105 transition-transform"
                        loading="lazy"
                      />
                      <div className="absolute top-2 left-2">
                        <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-red-600 text-white flex items-center gap-1">
                          <span className="w-1 h-1 rounded-full bg-white animate-pulse" />
                          LIVE
                        </span>
                      </div>
                      <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Play className="w-7 h-7 text-amber-400 fill-amber-400" />
                      </div>
                    </div>

                    <div className="p-2.5 flex flex-col gap-0.5">
                      <span className="text-xs font-bold text-white truncate group-hover:text-amber-300">
                        {ch.name}
                      </span>
                      <div className="flex items-center justify-between text-[10px] text-white/50">
                        <span>{ch.category}</span>
                        <span className="font-mono text-cyan-400">{ch.quality}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : effectiveSection === 'games' ? (
            /* ============================================================ */
            /* C. DYNAMIC SECTION: GAME ARCADE (219+ TITLES, 67+ INBUILT)   */
            /* ============================================================ */
            <div className="flex flex-col gap-6">
              {/* Arcade Hero Banner */}
              <div className="relative w-full rounded-3xl overflow-hidden border border-purple-500/20 bg-gradient-to-r from-purple-950/70 via-slate-900 to-black p-8 sm:p-10 flex flex-col justify-between min-h-[300px] shadow-2xl">
                {/* Right Side Themed Visual Artwork */}
                <div className="absolute right-0 top-0 bottom-0 w-1/2 lg:w-3/5 pointer-events-none z-0 overflow-hidden flex items-center justify-end">
                  <img
                    src={HERO_ARTWORKS.cyberArcade}
                    alt="Cyber Arcade Artwork"
                    className="h-full w-full object-cover object-right opacity-90"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-transparent to-transparent pointer-events-none" />
                </div>
                <div className="relative z-10 flex items-center gap-2.5">
                  <span className="flex items-center gap-1.5 text-[10px] font-bold px-3 py-1 rounded-full bg-purple-600 text-white shadow-lg shadow-purple-600/30">
                    <Gamepad2 className="w-3.5 h-3.5" />
                    219+ GAMES
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-white/10 text-emerald-400 border border-white/10">
                    67+ Offline Engines
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-white/10 text-cyan-400 border border-white/10">
                    Zero-Latency HTML5 Canvas
                  </span>
                </div>

                <div className="relative z-10 max-w-2xl my-3">
                  <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                    Miki Cyber Arcade: Instant Offline Play
                  </h1>
                  <p className="text-xs sm:text-sm text-white/70 mt-2 leading-relaxed">
                    Play instantly in the media player viewport with full keyboard, mouse, and audio sound synthesizer support. Includes retro space combat, breakout, physics puzzles, and drifting.
                  </p>
                </div>

                <div className="relative z-10 flex items-center gap-3">
                  <button
                    onClick={() => {
                      if (onOpenGames) onOpenGames('neon-invaders-dx');
                    }}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-xl active:scale-95 transition-all cursor-pointer"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    <span>Launch Neon Space Invaders DX</span>
                  </button>
                  {onOpenGames && (
                    <button
                      onClick={() => onOpenGames()}
                      className="px-5 py-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-semibold border border-white/15 transition-all cursor-pointer"
                    >
                      Open Full Arcade View
                    </button>
                  )}
                </div>
              </div>

              {/* Game Category Filter Pills */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                {['All', 'Arcade', 'Puzzle', 'Sports', 'Retro', 'Classic', 'Action', 'Strategy', 'Cards'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setGameFilterCategory(cat)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                      gameFilterCategory === cat
                        ? 'bg-purple-600 text-white font-bold shadow-md shadow-purple-600/20'
                        : 'bg-white/5 text-white/60 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Complete Games Catalog Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {filteredGames.map((game: GameItem) => (
                  <div
                    key={game.id}
                    onClick={() => {
                      if (onOpenGames) onOpenGames(game.id);
                    }}
                    className="group flex flex-col rounded-2xl overflow-hidden bg-white/5 border border-white/10 hover:border-purple-400/50 hover:bg-white/10 transition-all cursor-pointer shadow-lg"
                  >
                    <div className="relative aspect-video w-full overflow-hidden bg-black/60">
                      <img
                        src={game.thumbnail}
                        alt={game.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        loading="lazy"
                      />
                      <div className="absolute top-2 left-2">
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                          game.isInbuilt ? 'bg-emerald-500 text-black' : 'bg-purple-600 text-white'
                        }`}>
                          {game.isInbuilt ? 'INBUILT' : 'WEB'}
                        </span>
                      </div>
                      <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Play className="w-7 h-7 text-purple-400 fill-purple-400" />
                      </div>
                    </div>

                    <div className="p-2.5 flex flex-col gap-0.5">
                      <span className="text-xs font-bold text-white truncate group-hover:text-purple-300">
                        {game.title}
                      </span>
                      <div className="flex items-center justify-between text-[10px] text-white/50">
                        <span>{game.category}</span>
                        <span className="font-mono text-white/40">{game.controlsHint.slice(0, 16)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : effectiveSection === 'movies' ? (
            /* ============================================================ */
            /* D. DYNAMIC SECTION: MOVIES & THEATRICAL RELEASES             */
            /* ============================================================ */
            <div className="flex flex-col gap-8">
              {/* Themed Movie Hero Banner (The SOUL CONDUCTOR - Image 2) */}
              <div className="relative w-full rounded-3xl overflow-hidden border border-rose-500/20 bg-gradient-to-r from-red-950/70 via-slate-900 to-black p-8 sm:p-10 flex flex-col justify-between min-h-[360px] shadow-2xl">
                {/* Right Side Themed Visual Artwork */}
                <div className="absolute right-0 top-0 bottom-0 w-1/2 lg:w-3/5 pointer-events-none z-0 overflow-hidden flex items-center justify-end">
                  <img
                    src={HERO_ARTWORKS.soulConductor}
                    alt="The SOUL CONDUCTOR Artwork"
                    className="h-full w-full object-cover object-right opacity-95"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-transparent to-transparent pointer-events-none" />
                </div>
                <div className="relative z-10 flex items-center gap-2.5">
                  <span className="flex items-center gap-1.5 text-[10px] font-bold px-3 py-1 rounded-full bg-rose-600 text-white shadow-lg shadow-rose-600/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                    Now Trending
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-white/10 text-white/80 border border-white/10">
                    Sci-Fi
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-white/10 text-white/80 border border-white/10">
                    Mystery
                  </span>
                  <span className="text-[10px] font-bold text-amber-400">★ 7.8 IMDb</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded border border-white/20 text-white/70">
                    English
                  </span>
                </div>

                <div className="relative z-10 max-w-2xl my-3">
                  <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
                    The SOUL CONDUCTOR
                  </h1>
                  <p className="text-xs sm:text-sm text-white/70 mt-2 leading-relaxed">
                    When digital frequencies bleed through the veil of mortal consciousness, an elite paranormal investigative team enters the frequency void to decode unexplained transmissions.
                  </p>
                </div>

                <div className="relative z-10 flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => {
                        if (onOpenWebBrowser) onOpenWebBrowser('https://cinesubz.lk');
                      }}
                      className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-all shadow-xl active:scale-95 cursor-pointer"
                    >
                      <Play className="w-4 h-4 fill-current" />
                      <span>Watch</span>
                    </button>

                    <button
                      onClick={() => {
                        if (onOpenWebBrowser) onOpenWebBrowser('https://cinesubz.lk');
                      }}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 text-white text-xs font-semibold transition-all backdrop-blur-md cursor-pointer"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download</span>
                    </button>

                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/60 border border-white/10 text-xs text-white/80">
                      <div className="flex -space-x-1.5">
                        <div className="w-5 h-5 rounded-full bg-purple-500 border border-black text-[9px] flex items-center justify-center font-bold">
                          I
                        </div>
                        <div className="w-5 h-5 rounded-full bg-amber-500 border border-black text-[9px] flex items-center justify-center font-bold">
                          N
                        </div>
                        <div className="w-5 h-5 rounded-full bg-emerald-500 border border-black text-[9px] flex items-center justify-center font-bold">
                          V
                        </div>
                      </div>
                      <span className="text-[11px]">+5 friends are watching</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Parties (Adze Image 2) */}
              <section className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-bold text-white tracking-wide">Parties</h2>
                  <button
                    onClick={() => setPartiesToggle(!partiesToggle)}
                    className="w-8 h-4 rounded-full bg-rose-600 flex items-center px-0.5 cursor-pointer transition-colors"
                  >
                    <span
                      className={`w-3 h-3 rounded-full bg-white shadow-sm transition-transform ${
                        partiesToggle ? 'translate-x-4' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                  {ADZE_PARTIES.map((party) => (
                    <div
                      key={party.id}
                      onClick={() => {
                        if (onOpenWebBrowser) onOpenWebBrowser(party.url);
                      }}
                      className="group flex flex-col p-3 rounded-2xl bg-white/5 border border-white/10 hover:border-rose-500/50 hover:bg-white/10 transition-all cursor-pointer shadow-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl overflow-hidden bg-black/60 shrink-0 border border-white/10">
                          <img
                            src={party.image}
                            alt={party.title}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                        </div>
                        <div className="flex flex-col min-w-0 flex-1">
                          <span className="text-xs font-bold text-white truncate group-hover:text-rose-300 transition-colors">
                            {party.title}
                          </span>
                          <span className="text-[10px] text-white/50 truncate">{party.genre}</span>
                          <span className="text-[9px] text-rose-400 font-medium mt-1">
                            {party.viewers}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Latest Blockbusters & Theatrical Releases */}
              <section className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
                    <h2 className="text-base font-bold text-white tracking-wide">
                      Latest Theatrical Releases & Blockbusters
                    </h2>
                  </div>
                  <span className="text-xs text-rose-400 font-mono">Ultra HD 4K • CineSubz Releases</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3.5">
                  {(filteredCinesubz.length > 0 ? filteredCinesubz.slice(0, 6) : RECOMMENDED_MOVIES.map((m) => ({
                    id: m.id,
                    title: m.title,
                    sinhalaTitle: 'සිංහල උපසිරැසි සමඟ',
                    year: Number(m.year) || 2026,
                    rating: m.rating,
                    quality: '1080p WEB-DL',
                    posterUrl: m.image,
                    watchUrl: m.url,
                  }))).map((movie) => (
                    <div
                      key={movie.id}
                      onClick={() => {
                        if (onOpenWebBrowser) onOpenWebBrowser(movie.watchUrl);
                      }}
                      className="group relative flex flex-col rounded-2xl overflow-hidden bg-white/5 border border-white/10 hover:border-rose-500/50 hover:bg-white/10 transition-all cursor-pointer shadow-lg"
                    >
                      <div className="relative aspect-[2/3] w-full overflow-hidden bg-black/60">
                        <img
                          src={movie.posterUrl}
                          alt={movie.title}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                          onError={(e) => {
                            const img = e.currentTarget;
                            const remoteUrl = (movie as { remotePosterUrl?: string }).remotePosterUrl;
                            if (remoteUrl && img.src !== remoteUrl) {
                              img.src = remoteUrl;
                            }
                          }}
                        />
                        <div className="absolute top-2 left-2 flex flex-col gap-1">
                          <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-black/80 backdrop-blur-md text-amber-400 font-bold border border-white/10">
                            {movie.rating}
                          </span>
                          <span className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-rose-600 text-white shadow">
                            {movie.quality}
                          </span>
                        </div>

                        <div className="absolute bottom-2 right-2 w-8 h-8 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-white group-hover:bg-rose-600 transition-all shadow-lg">
                          <Play className="w-3.5 h-3.5 fill-white ml-0.5" />
                        </div>
                      </div>

                      <div className="p-2.5 flex flex-col gap-1">
                        <span className="text-xs font-bold text-white truncate group-hover:text-rose-300">
                          {movie.title}
                        </span>
                        <span className="text-[10px] text-rose-400 font-medium truncate">
                          {movie.sinhalaTitle}
                        </span>
                        <div className="flex items-center justify-between text-[9px] text-white/50">
                          <span>{movie.year}</span>
                          <span className="text-emerald-400 font-mono">සිංහල උපසිරැසි</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* CineSubz Sinhala Subtitle Releases Section */}
              <section className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
                    <h2 className="text-base font-bold text-white tracking-wide">
                      CineSubz Sinhala Subtitle Releases (සිංහල උපසිරැසි)
                    </h2>
                  </div>
                  <span className="text-xs text-rose-400 font-mono">Auto-Updating • 1080p & 4K</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3.5">
                  {filteredCinesubz.map((movie) => (
                    <div
                      key={movie.id}
                      onClick={() => {
                        if (onOpenWebBrowser) onOpenWebBrowser(movie.watchUrl);
                      }}
                      className="group relative flex flex-col rounded-2xl overflow-hidden bg-white/5 border border-white/10 hover:border-rose-500/50 hover:bg-white/10 transition-all cursor-pointer shadow-lg"
                    >
                      <div className="relative aspect-[2/3] w-full overflow-hidden bg-black/60">
                        <img
                          src={movie.posterUrl}
                          alt={movie.title}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                          onError={(e) => {
                            const img = e.currentTarget;
                            if (movie.remotePosterUrl && img.src !== movie.remotePosterUrl) {
                              img.src = movie.remotePosterUrl;
                            }
                          }}
                        />
                        <div className="absolute top-2 left-2 flex flex-col gap-1">
                          <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-black/80 backdrop-blur-md text-amber-400 font-bold border border-white/10">
                            {movie.rating}
                          </span>
                          <span className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-rose-600 text-white shadow">
                            {movie.quality}
                          </span>
                        </div>

                        <div className="absolute bottom-2 right-2 w-8 h-8 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-white group-hover:bg-rose-600 transition-all shadow-lg">
                          <Play className="w-3.5 h-3.5 fill-white ml-0.5" />
                        </div>
                      </div>

                      <div className="p-2.5 flex flex-col gap-1">
                        <span className="text-xs font-bold text-white truncate group-hover:text-rose-300">
                          {movie.title}
                        </span>
                        <span className="text-[10px] text-rose-400 font-medium truncate">
                          {movie.sinhalaTitle}
                        </span>
                        <div className="flex items-center justify-between text-[9px] text-white/50">
                          <span>{movie.year}</span>
                          <span className="text-emerald-400 font-mono">සිංහල උපසිරැසි</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Dedicated Cinema & Subtitles Streaming Portals */}
              <section className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-bold text-white tracking-wide">
                    Dedicated Cinema & Subtitle Portals
                  </h2>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                  {filteredCinema.map((site: CinemaSiteItem) => (
                    <div
                      key={site.id}
                      onClick={() => {
                        if (onOpenWebBrowser) onOpenWebBrowser(site.url);
                      }}
                      className="group flex flex-col rounded-2xl overflow-hidden bg-white/5 border border-white/10 hover:border-rose-400/50 hover:bg-white/10 transition-all cursor-pointer shadow-lg p-3.5"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl overflow-hidden bg-black/60 shrink-0 border border-white/10 p-1 flex items-center justify-center">
                          <img
                            src={site.logoUrl}
                            alt={site.name}
                            className="w-full h-full object-contain"
                            loading="lazy"
                          />
                        </div>
                        <div className="flex flex-col min-w-0 flex-1">
                          <span className="text-xs font-bold text-white truncate group-hover:text-rose-300 transition-colors">
                            {site.name}
                          </span>
                          <span className="text-[10px] text-rose-400 font-mono">{site.category}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          ) : effectiveSection === 'series' ? (
            /* ============================================================ */
            /* E. DYNAMIC SECTION: TV SERIES & ANIMATION                   */
            /* ============================================================ */
            <div className="flex flex-col gap-8">
              <div className="relative w-full rounded-3xl overflow-hidden border border-fuchsia-500/20 bg-gradient-to-r from-purple-950/70 via-slate-900 to-black p-8 sm:p-10 flex flex-col justify-between min-h-[300px] shadow-2xl">
                {/* Right Side Themed Visual Artwork */}
                <div className="absolute right-0 top-0 bottom-0 w-1/2 lg:w-3/5 pointer-events-none z-0 overflow-hidden flex items-center justify-end">
                  <img
                    src={HERO_ARTWORKS.animeCyberpunk}
                    alt="Anime Cyberpunk Artwork"
                    className="h-full w-full object-cover object-right opacity-90"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-transparent to-transparent pointer-events-none" />
                </div>
                <div className="relative z-10 flex items-center gap-2.5">
                  <span className="text-[10px] font-bold px-3 py-1 rounded-full bg-fuchsia-600 text-white shadow-lg">
                    TV SERIES & ANIME
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-white/10 text-cyan-400 border border-white/10">
                    Sub & Dub Available
                  </span>
                </div>
                <div className="relative z-10 max-w-2xl my-3">
                  <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                    Anime & International Television Series
                  </h1>
                  <p className="text-xs sm:text-sm text-white/70 mt-2 leading-relaxed">
                    Stream trending anime simulcasts, complete seasonal TV dramas, and high-definition series from verified global platforms.
                  </p>
                </div>
              </div>

              {/* CineSubz Sinhala Subtitle TV Series Section */}
              <section className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-fuchsia-500 animate-pulse" />
                    <h2 className="text-base font-bold text-white tracking-wide">
                      CineSubz Sinhala Subtitle TV Series (සිංහල උපසිරැසි ටෙලිනාට්‍ය)
                    </h2>
                  </div>
                  <button
                    onClick={() => {
                      if (onOpenWebBrowser) onOpenWebBrowser('https://cinesubz.lk/tvshows/');
                    }}
                    className="text-xs text-fuchsia-400 hover:text-fuchsia-300 font-mono flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <span>Browse All on CineSubz TV</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3.5">
                  {filteredCinesubzTv.map((show) => (
                    <div
                      key={show.id}
                      onClick={() => {
                        if (onOpenWebBrowser) onOpenWebBrowser(show.watchUrl);
                      }}
                      className="group relative flex flex-col rounded-2xl overflow-hidden bg-white/5 border border-white/10 hover:border-fuchsia-500/50 hover:bg-white/10 transition-all cursor-pointer shadow-lg"
                    >
                      <div className="relative aspect-[2/3] w-full overflow-hidden bg-black/60">
                        <img
                          src={show.posterUrl}
                          alt={show.title}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                          onError={(e) => {
                            const img = e.currentTarget;
                            if (show.remotePosterUrl && img.src !== show.remotePosterUrl) {
                              img.src = show.remotePosterUrl;
                            }
                          }}
                        />
                        <div className="absolute top-2 left-2 flex flex-col gap-1">
                          <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-black/80 backdrop-blur-md text-amber-400 font-bold border border-white/10">
                            {show.rating}
                          </span>
                          <span className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-fuchsia-600 text-white shadow">
                            {show.season}
                          </span>
                        </div>

                        <div className="absolute top-2 right-2">
                          <span className="text-[8px] font-mono px-1.5 py-0.5 rounded bg-black/70 text-cyan-300 border border-white/10">
                            {show.quality}
                          </span>
                        </div>

                        <div className="absolute bottom-2 right-2 w-8 h-8 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-white group-hover:bg-fuchsia-600 transition-all shadow-lg">
                          <Play className="w-3.5 h-3.5 fill-white ml-0.5" />
                        </div>
                      </div>

                      <div className="p-2.5 flex flex-col gap-1">
                        <span className="text-xs font-bold text-white truncate group-hover:text-fuchsia-300">
                          {show.title}
                        </span>
                        <span className="text-[10px] text-fuchsia-400 font-medium truncate">
                          {show.sinhalaTitle}
                        </span>
                        <div className="flex items-center justify-between text-[9px] text-white/50">
                          <span>{show.year}</span>
                          <span className="text-emerald-400 font-mono">සිංහල උපසිරැසි</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Dedicated Anime Platforms */}
              <section className="flex flex-col gap-3">
                <h2 className="text-base font-bold text-white tracking-wide">
                  Anime Streaming Hubs
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {filteredCinema.filter((c) => c.category === 'Anime').map((site) => (
                    <div
                      key={site.id}
                      onClick={() => {
                        if (onOpenWebBrowser) onOpenWebBrowser(site.url);
                      }}
                      className="group flex flex-col rounded-2xl overflow-hidden bg-white/5 border border-white/10 hover:border-fuchsia-400/50 hover:bg-white/10 transition-all cursor-pointer shadow-lg p-3.5"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl overflow-hidden bg-black/60 shrink-0 border border-white/10 p-1 flex items-center justify-center">
                          <img src={site.logoUrl} alt={site.name} className="w-full h-full object-contain" />
                        </div>
                        <div className="flex flex-col min-w-0 flex-1">
                          <span className="text-xs font-bold text-white truncate group-hover:text-fuchsia-300">
                            {site.name}
                          </span>
                          <span className="text-[10px] text-fuchsia-400 font-mono">{site.badge}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          ) : (
            /* ============================================================ */
            /* F. ALL / BROWSE OVERVIEW SECTION                            */
            /* ============================================================ */
            <>
              {/* 1. HERO SHOWCASE FEATURE BANNER */}
              <div className="relative w-full rounded-3xl overflow-hidden border border-white/10 shadow-2xl bg-[#090d16] p-8 sm:p-10 flex flex-col justify-between min-h-[380px] group">
                {/* Right Side Themed Visual Artwork */}
                <div className="absolute right-0 top-0 bottom-0 w-1/2 lg:w-3/5 pointer-events-none z-0 overflow-hidden flex items-center justify-end">
                  <img
                    src={HERO_ARTWORKS.spiderMan}
                    alt="Spider-Man Across the Spider-Verse Artwork"
                    className="h-full w-full object-cover object-right opacity-95"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-[#090d16] via-transparent to-transparent pointer-events-none" />
                </div>
                <div className="relative z-10 flex items-center gap-2.5">
                  <span className="flex items-center gap-1.5 text-[10px] font-bold px-3 py-1 rounded-full bg-rose-600 text-white shadow-lg shadow-rose-600/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                    Now Trending
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-white/10 text-white/80 border border-white/10">
                    Animation
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-white/10 text-white/80 border border-white/10">
                    Adventure
                  </span>
                  <span className="text-[10px] font-bold text-amber-400">★ 8.9 IMDb</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded border border-white/20 text-white/70">
                    U/A 13+
                  </span>
                </div>

                <div className="relative z-10 max-w-2xl flex flex-col gap-2.5 my-4">
                  <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
                    Spider-Man: Across the Spider-Verse
                  </h1>
                  <p className="text-xs sm:text-sm text-white/70 line-clamp-3 leading-relaxed">
                    Miles Morales catapults across the Multiverse, where he encounters a team of
                    Spider-People charged with protecting its very existence. A visual masterpiece
                    in immersive cinema.
                  </p>
                </div>

                <div className="relative z-10 flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => {
                        if (onOpenWebBrowser) onOpenWebBrowser('https://cinesubz.lk');
                      }}
                      className="flex items-center gap-2 px-6 py-3 rounded-full bg-white text-slate-950 hover:bg-slate-200 text-xs font-bold transition-all shadow-xl active:scale-95 cursor-pointer"
                    >
                      <Play className="w-4 h-4 fill-current" />
                      <span>Watch</span>
                    </button>

                    <button
                      onClick={() => {
                        if (onOpenWebBrowser) onOpenWebBrowser('https://cinesubz.lk');
                      }}
                      className="flex items-center gap-2 px-5 py-3 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 text-white text-xs font-semibold transition-all backdrop-blur-md cursor-pointer"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download</span>
                    </button>

                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/60 border border-white/10 text-xs text-white/80">
                      <div className="flex -space-x-1.5">
                        <div className="w-5 h-5 rounded-full bg-purple-500 border border-black text-[9px] flex items-center justify-center font-bold">
                          I
                        </div>
                        <div className="w-5 h-5 rounded-full bg-amber-500 border border-black text-[9px] flex items-center justify-center font-bold">
                          N
                        </div>
                        <div className="w-5 h-5 rounded-full bg-emerald-500 border border-black text-[9px] flex items-center justify-center font-bold">
                          V
                        </div>
                      </div>
                      <span className="text-[11px]">+5 friends are watching</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 2. PARTIES CAROUSEL */}
              <section className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <h2 className="text-base font-bold text-white tracking-wide">Parties</h2>
                    <button
                      onClick={() => setPartiesToggle(!partiesToggle)}
                      className="w-8 h-4 rounded-full bg-rose-600 flex items-center px-0.5 cursor-pointer transition-colors"
                    >
                      <span
                        className={`w-3 h-3 rounded-full bg-white shadow-sm transition-transform ${
                          partiesToggle ? 'translate-x-4' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                  {ADZE_PARTIES.map((party) => (
                    <div
                      key={party.id}
                      onClick={() => {
                        if (onOpenWebBrowser) onOpenWebBrowser(party.url);
                      }}
                      className="group flex flex-col p-3 rounded-2xl bg-white/5 border border-white/10 hover:border-rose-500/50 hover:bg-white/10 transition-all cursor-pointer shadow-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl overflow-hidden bg-black/60 shrink-0 border border-white/10">
                          <img
                            src={party.image}
                            alt={party.title}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                        </div>
                        <div className="flex flex-col min-w-0 flex-1">
                          <span className="text-xs font-bold text-white truncate group-hover:text-rose-300 transition-colors">
                            {party.title}
                          </span>
                          <span className="text-[10px] text-white/50 truncate">{party.genre}</span>
                          <span className="text-[9px] text-rose-400 font-medium mt-1">
                            {party.viewers}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* 2.5 MY RECENT LOCAL FILES SHELF */}
              <section className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <FolderOpen className="w-4 h-4 text-cyan-400" />
                    <h2 className="text-base font-bold text-white tracking-wide">
                      My Recent Local Files
                    </h2>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                      Videos, Movies, Music & Images
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      setActiveNav('my_files');
                      setActiveCategory('My Files');
                    }}
                    className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <span>See all in My Files</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                  {localMediaList.slice(0, 6).map((file) => (
                    <div
                      key={'browse-local-' + file.id}
                      onClick={() => {
                        if (file.category === 'image') {
                          setPreviewImage({
                            title: file.title,
                            url: file.thumbnailUrl || file.uri,
                            size: file.sizeFormatted,
                            dimensions: file.resolution,
                          });
                        } else if (file.category === 'music') {
                          openMedia(file.uri, file.title, true, file.lastPositionMs || 0, file.thumbnailUrl, 'music');
                          usePlayerStore.setState({ isMusicPlayerOpen: true });
                        } else {
                          openMedia(file.uri, file.title, true, file.lastPositionMs || 0);
                        }
                      }}
                      className="group relative flex flex-col rounded-2xl overflow-hidden bg-white/5 border border-white/10 hover:border-cyan-400/50 hover:bg-white/10 transition-all cursor-pointer shadow-lg"
                    >
                      <div className="relative aspect-video w-full overflow-hidden bg-black/60">
                        {file.thumbnailUrl ? (
                          <img
                            src={file.thumbnailUrl}
                            alt={file.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            onError={(e) => {
                              (e.currentTarget as HTMLImageElement).style.display = 'none';
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 text-white/40 gap-1.5 p-2">
                            <FolderOpen className="w-6 h-6 text-cyan-400" />
                          </div>
                        )}
                        <div className="absolute top-1.5 left-1.5 flex items-center gap-1">
                          <span className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-black/70 text-cyan-300 border border-white/10">
                            .{file.extension}
                          </span>
                        </div>
                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="w-8 h-8 rounded-full bg-cyan-500 flex items-center justify-center shadow-lg shadow-cyan-500/40 text-black">
                            {file.category === 'image' ? (
                              <Eye className="w-4 h-4 text-slate-950" />
                            ) : (
                              <Play className="w-4 h-4 fill-slate-950 ml-0.5 text-slate-950" />
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="p-2.5 flex flex-col gap-0.5">
                        <span className="text-xs font-bold text-white truncate group-hover:text-cyan-300">
                          {file.title}
                        </span>
                        <div className="flex items-center justify-between text-[10px] text-white/50">
                          <span>{formatMediaRelativeTime(file.lastPlayedAt)}</span>
                          <span className="font-mono capitalize text-cyan-400/80">{file.category}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* 3. CONTINUE WATCHING CAROUSEL */}
              <section className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <h2 className="text-base font-bold text-white tracking-wide">
                      Continue Watching
                    </h2>
                    <button
                      onClick={() => setContinueToggle(!continueToggle)}
                      className="w-8 h-4 rounded-full bg-rose-600 flex items-center px-0.5 cursor-pointer transition-colors"
                    >
                      <span
                        className={`w-3 h-3 rounded-full bg-white shadow-sm transition-transform ${
                          continueToggle ? 'translate-x-4' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                  {recentMedia && recentMedia.length > 0 ? (
                    recentMedia.slice(0, 6).map((item) => (
                      <div
                        key={item.uri}
                        onClick={() => {
                          const isItemAudio =
                            (item.uri && /\.(mp3|wav|flac|aac|m4a|ogg|opus)/i.test(item.uri)) ||
                            item.uri.includes('/mp3') ||
                            item.uri.includes('somafm') ||
                            item.uri.includes('soundcloud') ||
                            item.uri.includes('jamendo') ||
                            item.uri.includes('audiomack') ||
                            item.uri.includes('bandcamp') ||
                            item.uri.includes('apple.com') ||
                            item.uri.includes('itunes') ||
                            item.title.toLowerCase().includes('song') ||
                            item.title.toLowerCase().includes('track') ||
                            item.title.toLowerCase().includes('hindi') ||
                            item.title.toLowerCase().includes('dooriyan') ||
                            item.title.toLowerCase().includes('saiyaara');
                          openMedia(item.uri, item.title, true, item.lastPositionMs, item.thumbnailUri, isItemAudio ? 'music' : 'video');
                          if (isItemAudio) setMusicPlayerOpen(true);
                        }}
                        className="group relative flex flex-col rounded-2xl overflow-hidden bg-white/5 border border-white/10 hover:border-rose-400/50 hover:bg-white/10 transition-all cursor-pointer shadow-lg"
                      >
                        <div className="relative aspect-video w-full overflow-hidden bg-black/60">
                          {item.thumbnailUri && !item.thumbnailUri.includes('google.com/s2/favicons') ? (
                            <img
                              src={item.thumbnailUri}
                              alt={item.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            />
                          ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 text-white/40 gap-1.5 p-2">
                              {item.thumbnailUri ? (
                                <img src={item.thumbnailUri} alt="" className="w-7 h-7 rounded-lg object-contain bg-black/40 p-1 border border-white/10" />
                              ) : (
                                <Film className="w-6 h-6 text-rose-400" />
                              )}
                              <span className="text-[10px] text-white/60 font-medium truncate max-w-full text-center px-1">
                                {item.title}
                              </span>
                            </div>
                          )}
                          <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="w-8 h-8 rounded-full bg-rose-600 flex items-center justify-center shadow-lg shadow-rose-600/40 text-white">
                              <Play className="w-4 h-4 fill-white ml-0.5" />
                            </div>
                          </div>
                          <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
                            <div
                              className="h-full bg-rose-600"
                              style={{ width: `${Math.min(100, Math.max(5, item.progressPercent))}%` }}
                            />
                          </div>
                        </div>

                        <div className="p-2.5 flex flex-col gap-0.5">
                          <span className="text-xs font-bold text-white truncate group-hover:text-rose-300">
                            {item.title}
                          </span>
                          <span className="text-[10px] text-white/50">{item.progressPercent}% viewed</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    RECOMMENDED_MOVIES.slice(0, 4).map((mov) => (
                      <div
                        key={mov.id}
                        onClick={() => {
                          if (onOpenWebBrowser) onOpenWebBrowser(mov.url);
                        }}
                        className="group relative flex flex-col rounded-2xl overflow-hidden bg-white/5 border border-white/10 hover:border-rose-400/50 hover:bg-white/10 transition-all cursor-pointer shadow-lg"
                      >
                        <div className="relative aspect-video w-full overflow-hidden bg-black/60">
                          <img
                            src={mov.image}
                            alt={mov.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                          <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="w-8 h-8 rounded-full bg-rose-600 flex items-center justify-center shadow-lg shadow-rose-600/40 text-white">
                              <Play className="w-4 h-4 fill-white ml-0.5" />
                            </div>
                          </div>
                          <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
                            <div className="h-full bg-rose-600 w-3/5" />
                          </div>
                        </div>

                        <div className="p-2.5 flex flex-col gap-0.5">
                          <span className="text-xs font-bold text-white truncate group-hover:text-rose-300">
                            {mov.title}
                          </span>
                          <span className="text-[10px] text-white/50">{mov.genre}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </section>

              {/* 4. RECOMMENDED MOVIES ROW */}
              <section className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-bold text-white tracking-wide">
                    Recommended movies
                  </h2>
                  <button
                    onClick={() => setActiveCategory('Movies')}
                    className="text-xs text-rose-400 hover:underline cursor-pointer"
                  >
                    See all
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {(filteredCinesubz.length >= 4
                    ? filteredCinesubz.slice(0, 4).map((m) => ({
                        id: m.id,
                        title: m.title,
                        rating: m.rating,
                        genre: m.sinhalaTitle,
                        duration: String(m.year),
                        image: m.posterUrl,
                        remoteImage: m.remotePosterUrl,
                        url: m.watchUrl,
                      }))
                    : RECOMMENDED_MOVIES.slice(0, 4).map((m) => ({
                        id: m.id,
                        title: m.title,
                        rating: m.rating,
                        genre: m.genre.split(',')[0],
                        duration: m.duration,
                        image: m.image,
                        remoteImage: undefined,
                        url: m.url,
                      }))
                  ).map((movie) => (
                    <div
                      key={movie.id}
                      onClick={() => {
                        if (onOpenWebBrowser) onOpenWebBrowser(movie.url);
                      }}
                      className="group relative flex flex-col rounded-2xl overflow-hidden bg-white/5 border border-white/10 hover:border-rose-500/50 hover:bg-white/10 transition-all cursor-pointer shadow-lg"
                    >
                      <div className="relative aspect-[3/4] w-full overflow-hidden bg-black/60">
                        <img
                          src={movie.image}
                          alt={movie.title}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            const img = e.currentTarget;
                            if (movie.remoteImage && img.src !== movie.remoteImage) {
                              img.src = movie.remoteImage;
                            }
                          }}
                        />
                        <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                          <span className="text-[9px] font-mono px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-md text-white/90 border border-white/10">
                            {movie.rating}
                          </span>
                        </div>

                        <div className="absolute bottom-3 right-3 w-9 h-9 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-white group-hover:bg-rose-600 transition-all shadow-lg">
                          <Play className="w-4 h-4 fill-white ml-0.5" />
                        </div>
                      </div>

                      <div className="p-3 flex flex-col gap-1">
                        <span className="text-xs font-bold text-white truncate group-hover:text-rose-300">
                          {movie.title}
                        </span>
                        <div className="flex items-center justify-between text-[10px] text-white/50">
                          <span className="text-rose-400 font-medium truncate">{movie.genre}</span>
                          <span className="font-mono text-emerald-400">{movie.duration}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* 5. TRENDING LIVE TV CHANNELS ROW */}
              <section className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Tv className="w-4 h-4 text-amber-400" />
                    <h2 className="text-base font-bold text-white tracking-wide">
                      Live IPTV Broadcasts (100+)
                    </h2>
                  </div>
                  <button
                    onClick={() => {
                      setActiveNav('channels');
                      setActiveCategory('Live TV');
                    }}
                    className="text-xs font-mono text-amber-400 hover:underline cursor-pointer"
                  >
                    See all 100+ channels →
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                  {filteredChannels.slice(0, 6).map((ch: LiveChannel) => (
                    <div
                      key={ch.id}
                      onClick={() => openMedia(ch.streamUrl, ch.name)}
                      className="group flex flex-col rounded-2xl overflow-hidden bg-white/5 border border-white/10 hover:border-amber-400/50 hover:bg-white/10 transition-all cursor-pointer shadow-lg"
                    >
                      <div className="relative aspect-video w-full overflow-hidden bg-black/60 p-2 flex items-center justify-center">
                        <img
                          src={ch.logo}
                          alt={ch.name}
                          className="w-full h-full object-contain group-hover:scale-105 transition-transform"
                          loading="lazy"
                        />
                        <div className="absolute top-2 left-2">
                          <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-red-600 text-white flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                            LIVE
                          </span>
                        </div>
                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <Play className="w-7 h-7 text-white fill-white" />
                        </div>
                      </div>

                      <div className="p-2.5 flex flex-col gap-0.5">
                        <span className="text-xs font-bold text-white truncate group-hover:text-amber-300">
                          {ch.name}
                        </span>
                        <div className="flex items-center justify-between text-[10px] text-white/50">
                          <span>{ch.category}</span>
                          <span className="font-mono text-cyan-400">{ch.quality}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* 6. BUILT-IN GAMES ARCADE ROW */}
              <section className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Gamepad2 className="w-4 h-4 text-purple-400" />
                    <h2 className="text-base font-bold text-white tracking-wide">
                      Miki Game Arcade (219+ Titles)
                    </h2>
                  </div>
                  <button
                    onClick={() => {
                      setActiveNav('games');
                      setActiveCategory('Games');
                    }}
                    className="text-xs text-purple-400 hover:underline cursor-pointer"
                  >
                    See all 219+ games →
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                  {filteredGames.slice(0, 6).map((game: GameItem) => (
                    <div
                      key={game.id}
                      onClick={() => {
                        if (onOpenGames) onOpenGames(game.id);
                      }}
                      className="group flex flex-col rounded-2xl overflow-hidden bg-white/5 border border-white/10 hover:border-purple-400/50 hover:bg-white/10 transition-all cursor-pointer shadow-lg"
                    >
                      <div className="relative aspect-video w-full overflow-hidden bg-black/60">
                        <img
                          src={game.thumbnail}
                          alt={game.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          loading="lazy"
                        />
                        <div className="absolute top-2 left-2">
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                            game.isInbuilt ? 'bg-emerald-500 text-black' : 'bg-purple-600 text-white'
                          }`}>
                            {game.isInbuilt ? 'INBUILT' : 'WEB'}
                          </span>
                        </div>
                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <Play className="w-7 h-7 text-purple-400 fill-purple-400" />
                        </div>
                      </div>

                      <div className="p-2.5 flex flex-col gap-0.5">
                        <span className="text-xs font-bold text-white truncate group-hover:text-purple-300">
                          {game.title}
                        </span>
                        <span className="text-[10px] text-white/50 truncate">{game.badge}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* 7. POPULAR ANIME & CINEMA STREAMING PORTALS */}
              <section className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Film className="w-4 h-4 text-rose-400" />
                    <h2 className="text-base font-bold text-white tracking-wide">
                      Dedicated Anime & Cinema Streaming Hub
                    </h2>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                  {filteredCinema.slice(0, 6).map((site: CinemaSiteItem) => (
                    <div
                      key={site.id}
                      onClick={() => {
                        if (onOpenWebBrowser) onOpenWebBrowser(site.url);
                      }}
                      className="group flex flex-col rounded-2xl overflow-hidden bg-white/5 border border-white/10 hover:border-rose-400/50 hover:bg-white/10 transition-all cursor-pointer shadow-lg p-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl overflow-hidden bg-black/60 shrink-0 border border-white/10 p-1 flex items-center justify-center">
                          <img
                            src={site.logoUrl}
                            alt={site.name}
                            className="w-full h-full object-contain"
                            loading="lazy"
                          />
                        </div>
                        <div className="flex flex-col min-w-0 flex-1">
                          <span className="text-xs font-bold text-white truncate group-hover:text-rose-300 transition-colors">
                            {site.name}
                          </span>
                          <span className="text-[10px] text-rose-400 font-mono">{site.category}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </>
          )}
        </div>
      </main>

      {/* Lightbox / Fullscreen Preview Modal for Images & Snapshots */}
      {previewImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 sm:p-8 animate-in fade-in duration-200"
          onClick={() => setPreviewImage(null)}
        >
          <div
            className="relative max-w-5xl max-h-[90vh] bg-[#0c101b] border border-white/15 rounded-3xl p-4 sm:p-6 flex flex-col gap-4 shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <FileImage className="w-5 h-5 text-amber-400 shrink-0" />
                <h3 className="text-sm font-bold text-white truncate">
                  {previewImage.title}
                </h3>
                {previewImage.dimensions && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/10 text-cyan-300">
                    {previewImage.dimensions}
                  </span>
                )}
                {previewImage.size && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/10 text-white/60">
                    {previewImage.size}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={previewImage.url}
                  download={previewImage.title}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer"
                  title="Download / Open Fullscreen"
                >
                  <Download className="w-4 h-4" />
                </a>
                <button
                  onClick={() => setPreviewImage(null)}
                  className="p-2 rounded-xl bg-white/10 hover:bg-rose-600/80 text-white transition-all cursor-pointer"
                  title="Close Preview"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex-1 flex items-center justify-center overflow-hidden rounded-2xl bg-black/60 max-h-[70vh]">
              <img
                src={previewImage.url}
                alt={previewImage.title}
                className="max-w-full max-h-[70vh] object-contain rounded-xl"
              />
            </div>
          </div>
        </div>
      )}

      {/* Custom Playlist Modal */}
      {isPlaylistModalOpen && selectedTrackForPlaylist && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-200"
          onClick={() => {
            setIsPlaylistModalOpen(false);
            setSelectedTrackForPlaylist(null);
          }}
        >
          <div
            className="relative w-full max-w-md bg-[#0c101b] border border-white/15 rounded-3xl p-6 flex flex-col gap-4 shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <ListPlus className="w-5 h-5 text-cyan-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Add to Playlist</h3>
              </div>
              <button
                onClick={() => {
                  setIsPlaylistModalOpen(false);
                  setSelectedTrackForPlaylist(null);
                }}
                className="p-1 rounded-lg text-white/50 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/10">
              <img
                src={selectedTrackForPlaylist.coverUrl || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&auto=format&fit=crop&q=80'}
                alt=""
                className="w-12 h-12 rounded-xl object-cover shrink-0"
              />
              <div className="flex flex-col min-w-0 flex-1">
                <span className="text-xs font-bold text-white truncate">{selectedTrackForPlaylist.title}</span>
                <span className="text-[10px] text-white/50 truncate">{selectedTrackForPlaylist.artist}</span>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-xs font-semibold text-white/70">Your Playlists</span>
              <div className="max-h-48 overflow-y-auto space-y-1.5 scrollbar-thin">
                {customPlaylists.map((pl) => (
                  <button
                    key={pl.id}
                    onClick={() => {
                      addTrackToPlaylist(pl.id, selectedTrackForPlaylist);
                      setIsPlaylistModalOpen(false);
                      setSelectedTrackForPlaylist(null);
                    }}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl bg-white/5 hover:bg-cyan-500/20 text-white/80 hover:text-white border border-white/10 transition-all text-xs font-medium cursor-pointer"
                  >
                    <span>{pl.name}</span>
                    <span className="text-[10px] text-white/40 font-mono">{pl.tracks.length} tracks</span>
                  </button>
                ))}
                {customPlaylists.length === 0 && (
                  <p className="text-xs text-white/40 italic py-2 text-center">No playlists created yet.</p>
                )}
              </div>
            </div>

            {/* Create New Playlist Inline */}
            <div className="flex items-center gap-2 pt-2 border-t border-white/10">
              <input
                type="text"
                value={newPlaylistName}
                onChange={(e) => setNewPlaylistName(e.target.value)}
                placeholder="New playlist title..."
                className="flex-1 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-white/40 focus:outline-none focus:border-cyan-400"
              />
              <button
                onClick={() => {
                  if (newPlaylistName.trim()) {
                    const id = createPlaylist(newPlaylistName.trim());
                    addTrackToPlaylist(id, selectedTrackForPlaylist);
                    setNewPlaylistName('');
                    setIsPlaylistModalOpen(false);
                    setSelectedTrackForPlaylist(null);
                  }
                }}
                className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition-all cursor-pointer"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Multilingual All Artists Explorer Modal */}
      <AllArtistsModal
        isOpen={isAllArtistsModalOpen}
        onClose={() => setIsAllArtistsModalOpen(false)}
        onSelectArtist={handleSelectArtist}
      />
    </div>
  );
};
