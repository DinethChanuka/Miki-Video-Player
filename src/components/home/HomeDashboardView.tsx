import React, { useState, useMemo, useEffect, useRef } from 'react';
import { usePlayerStore } from '../../store/playerStore';
import { CURATED_CHANNELS, LiveChannel } from '../../utils/channelCatalog';
import { GAMES_CATALOG, GameItem } from '../../utils/gamesCatalog';
import { CINEMA_LINKS, CinemaSiteItem } from '../../utils/cinemaLinks';
import { INTERNET_MUSIC_STREAMS } from '../../utils/musicStreams';
import { RADIO_GARDEN_STATIONS, RadioGardenStation, searchRadioGardenStations } from '../../utils/radioGardenCatalog';
import { MOVIE_POSTERS, ALBUM_POSTERS } from '../../utils/mediaPosters';
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
import { getRecommendedTracks } from '../../utils/musicRecommendationEngine';
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
  onOpenWebBrowser?: (url: string) => void;
  onOpenSettings?: () => void;
  onOpenEq?: () => void;
  onOpenLocalFile?: () => void;
}

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
  const [selectedMusicPlatform, setSelectedMusicPlatform] = useState<MusicPlatform | 'all'>('youtube');
  const [musicDiscoveryList, setMusicDiscoveryList] = useState<MusicTrack[]>(() =>
    [...MUSIC_DISCOVERY_CATALOG].sort(() => Math.random() - 0.5)
  );
  const [isTopPlayerHidden, setIsTopPlayerHidden] = useState<boolean>(false);
  const [isPlaylistModalOpen, setIsPlaylistModalOpen] = useState<boolean>(false);
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

  const handleShuffleDiscovery = () => {
    setMusicDiscoveryList((prev) => [...prev].sort(() => Math.random() - 0.5));
    const categories = ['romantic', 'hindi', 'english', 'sinhala', 'phonk', 'lo-fi', 'all'];
    const randomCat = categories[Math.floor(Math.random() * categories.length)];
    setSelectedMusicCategory(randomCat);
  };

  const recommendedTracks = useMemo(() => {
    return getRecommendedTracks(musicDiscoveryList, recentMedia, currentUri, 6);
  }, [musicDiscoveryList, recentMedia, currentUri]);

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
      fetchOnlineMusicSearch(q, selectedMusicPlatform)
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
                  onClick={() => setSearchQuery('')}
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

              {/* Live Instant Search Dropdown */}
              {searchQuery.trim().length > 0 && isSearchFocused && (
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
                <div className="relative">
                  <div className="w-8 h-8 rounded-full bg-slate-800 border border-white/20 flex items-center justify-center text-xs font-bold text-white shadow-md">
                    S
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border border-[#07090e]" />
                </div>
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
                <div className="w-8 h-8 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-xs font-bold text-white/60">
                  G
                </div>
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
            <div className="flex flex-col gap-6 items-center w-full pt-2 pb-12">
              {/* Collapsible 3D Perspective Carousel & Top Player Container */}
              <div
                className={`transition-all duration-500 ease-in-out overflow-hidden flex flex-col items-center w-full ${
                  isTopPlayerHidden
                    ? 'max-h-0 opacity-0 -translate-y-8 pointer-events-none mb-0 scale-95'
                    : 'max-h-[600px] opacity-100 translate-y-0 mb-4 scale-100'
                }`}
              >
                {/* 3D Perspective Carousel Container */}
                <div
                  className="relative w-full max-w-4xl h-72 sm:h-80 flex items-center justify-center pt-4 pb-2"
                  style={{ perspective: '1200px' }}
                >
                {COVER_FLOW_ALBUMS.map((album, idx) => {
                  const offset = idx - activeAlbumIdx;
                  const isCenter = offset === 0;

                  let transform = '';
                  let zIndex = 10;
                  let opacity = 0.5;

                  if (isCenter) {
                    transform = 'translateX(0px) translateZ(100px) rotateY(0deg) scale(1.15)';
                    zIndex = 40;
                    opacity = 1;
                  } else if (offset < 0) {
                    transform = `translateX(${offset * 120}px) translateZ(${offset * -50}px) rotateY(45deg) scale(0.85)`;
                    zIndex = 30 + offset;
                    opacity = Math.max(0.3, 0.9 + offset * 0.2);
                  } else {
                    transform = `translateX(${offset * 120}px) translateZ(${offset * -50}px) rotateY(-45deg) scale(0.85)`;
                    zIndex = 30 - offset;
                    opacity = Math.max(0.3, 0.9 - offset * 0.2);
                  }

                  const displayCover =
                    isCenter && previouslyPlayed?.thumbnailUri
                      ? previouslyPlayed.thumbnailUri
                      : album.albumArt;
                  const displayTitle =
                    isCenter && previouslyPlayed?.title
                      ? previouslyPlayed.title
                      : album.title;
                  const displayArtist =
                    isCenter && previouslyPlayed
                      ? 'Resume Playback • Recent Media'
                      : album.artist;

                  return (
                    <div
                      key={album.id}
                      onClick={() => {
                        if (isCenter && previouslyPlayed) {
                          openMedia(
                            previouslyPlayed.uri,
                            previouslyPlayed.title,
                            true,
                            previouslyPlayed.lastPositionMs,
                            previouslyPlayed.thumbnailUri,
                            'music'
                          );
                        } else {
                          handlePlayAlbum(idx);
                        }
                      }}
                      className="absolute w-52 h-52 rounded-2xl overflow-hidden cursor-pointer transition-all duration-500 ease-out shadow-2xl border border-white/20 select-none group"
                      style={{
                        transform,
                        zIndex,
                        opacity,
                        transformStyle: 'preserve-3d',
                      }}
                    >
                      <img
                        src={displayCover}
                        alt={displayTitle}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-3">
                        <div>
                          <h4 className="text-xs font-bold text-white truncate">{displayTitle}</h4>
                          <p className="text-[10px] text-white/60 truncate">{displayArtist}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Active Album Title & Artist Display */}
              <div className="text-center flex flex-col items-center gap-1 animate-in fade-in duration-300">
                {previouslyPlayed ? (
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-[10px] font-bold text-emerald-300 mb-1">
                    <Clock className="w-3 h-3 text-emerald-400" />
                    <span>PREVIOUSLY PLAYED TRACK</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/20 border border-red-500/30 text-[10px] font-bold text-red-300 mb-1">
                    <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
                    <span>YOUTUBE MUSIC EXCLUSIVE</span>
                  </div>
                )}
                <h2 className="text-xl font-bold text-white tracking-wide">
                  {previouslyPlayed ? previouslyPlayed.title : activeAlbum.title}
                </h2>
                <p className="text-xs text-white/60 font-medium">
                  {previouslyPlayed
                    ? 'Resume Playback • Recent Media'
                    : `${activeAlbum.artist} — ${activeAlbum.album}`}
                </p>
              </div>

              {/* FLOATING TRANSLUCENT GLASS PILL PLAYBACK BAR (IMAGE 1) */}
              <div className="w-full max-w-2xl px-6 py-3 rounded-full bg-slate-950/80 backdrop-blur-2xl border border-white/15 shadow-2xl flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() =>
                      handlePlayAlbum((activeAlbumIdx - 1 + COVER_FLOW_ALBUMS.length) % COVER_FLOW_ALBUMS.length)
                    }
                    className="p-2 text-white/70 hover:text-white transition-colors cursor-pointer"
                  >
                    <SkipBack className="w-4 h-4 fill-current" />
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
                      } else {
                        handlePlayAlbum(activeAlbumIdx);
                      }
                    }}
                    className="p-2.5 rounded-full bg-white text-slate-950 hover:scale-105 transition-all cursor-pointer shadow-lg"
                    title={isBuffering ? "Loading Audio Stream..." : !isPaused && activePlaybackMode === 'music' ? "Pause (Space)" : "Play (Space)"}
                  >
                    {isBuffering ? (
                      <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                    ) : !isPaused && activePlaybackMode === 'music' ? (
                      <Pause className="w-4 h-4 fill-current" />
                    ) : (
                      <Play className="w-4 h-4 fill-current ml-0.5" />
                    )}
                  </button>

                  <button
                    onClick={() =>
                      handlePlayAlbum((activeAlbumIdx + 1) % COVER_FLOW_ALBUMS.length)
                    }
                    className="p-2 text-white/70 hover:text-white transition-colors cursor-pointer"
                  >
                    <SkipForward className="w-4 h-4 fill-current" />
                  </button>
                </div>

                <div
                  onClick={() => {
                    if (onOpenMusic) onOpenMusic();
                  }}
                  className="flex-1 flex items-center gap-3 px-3 py-1.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 min-w-0 cursor-pointer transition-colors"
                  title="Open Full-Window Music Player"
                >
                  <div className="w-8 h-8 rounded-lg overflow-hidden bg-black/60 shrink-0">
                    <img
                      src={previouslyPlayed?.thumbnailUri || activeAlbum.albumArt}
                      alt={previouslyPlayed ? previouslyPlayed.title : activeAlbum.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex flex-col min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white truncate">
                        {previouslyPlayed ? previouslyPlayed.title : activeAlbum.title}
                      </span>
                      <span className="text-[10px] text-white/40 font-mono">
                        {previouslyPlayed ? 'Recent' : '3:38'}
                      </span>
                    </div>
                    <div className="w-full h-1 bg-white/20 rounded-full overflow-hidden mt-1">
                      <div className="w-2/5 h-full bg-gradient-to-r from-orange-500 to-rose-400 rounded-full" />
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-white/60">
                  <button className="p-1.5 hover:text-white transition-colors cursor-pointer">
                    <MessageSquareText className="w-4 h-4" />
                  </button>
                  <button
                    onClick={onOpenMusic}
                    title="Open Full Music Player"
                    className="p-1.5 hover:text-white transition-colors cursor-pointer"
                  >
                    <ListMusic className="w-4 h-4" />
                  </button>
                  <button
                    onClick={toggleMute}
                    className="p-1.5 hover:text-white transition-colors cursor-pointer"
                  >
                    {isMuted || volume === 0 ? (
                      <VolumeX className="w-4 h-4 text-rose-400" />
                    ) : (
                      <Volume2 className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>

              {/* Sound Lounge Discovery & Live Search */}
              <div className="w-full max-w-5xl flex flex-col gap-5 mt-2">
                {/* In-Section Live Music Search Bar */}
                <div className="relative w-full">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Live search songs, artists & soundscapes..."
                    className="w-full pl-11 pr-24 py-3 rounded-2xl bg-white/5 border border-white/10 text-xs text-white placeholder-white/40 focus:outline-none focus:border-cyan-500/60 focus:bg-white/10 transition-all font-medium"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 px-2.5 py-1 rounded-lg bg-white/10 text-[10px] text-white/70 hover:text-white hover:bg-white/20 transition-all cursor-pointer"
                    >
                      Clear
                    </button>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-600 via-purple-600 to-pink-500 flex items-center justify-center text-white shadow-lg shadow-cyan-500/20">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white tracking-wide uppercase flex items-center gap-2">
                        Sound Lounge
                        <span className="text-[10px] font-normal normal-case px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                          {filteredMusicTracks.length} Songs
                        </span>
                      </h3>
                      <p className="text-[11px] text-white/50">
                        Lossless Studio Soundscapes & Spatial Discovery
                      </p>
                    </div>
                  </div>

                  {/* Category Filter Buttons & Shuffle */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <button
                      onClick={handleShuffleDiscovery}
                      className="px-3 py-1 rounded-xl text-xs font-semibold bg-purple-500/15 hover:bg-purple-500/25 text-purple-300 border border-purple-500/30 transition-all cursor-pointer flex items-center gap-1.5 shadow-sm active:scale-95"
                      title="Shuffle & Discover Random Tracks"
                    >
                      <Shuffle className="w-3.5 h-3.5 text-purple-400" />
                      <span>Shuffle Discovery</span>
                    </button>

                    {[
                      { id: 'all', label: 'All Songs', color: 'bg-rose-500' },
                      { id: 'romantic', label: 'Romantic', color: 'bg-pink-400' },
                      { id: 'hindi', label: 'Hindi', color: 'bg-amber-400' },
                      { id: 'english', label: 'English', color: 'bg-cyan-400' },
                      { id: 'sinhala', label: 'Sinhala', color: 'bg-emerald-400' },
                      { id: 'phonk', label: 'Phonk', color: 'bg-purple-500' },
                      { id: 'lo-fi', label: 'Lo-Fi', color: 'bg-indigo-400' },
                    ].map((p) => {
                      const isActive = selectedMusicCategory === p.id;
                      return (
                        <button
                          key={p.id}
                          onClick={() => setSelectedMusicCategory(p.id)}
                          className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                            isActive
                              ? 'bg-gradient-to-r from-cyan-600 to-purple-600 text-white font-bold shadow-md shadow-cyan-500/20'
                              : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white border border-white/10'
                          }`}
                        >
                          <span className={`w-2 h-2 rounded-full ${p.color}`} />
                          <span>{p.label}</span>
                        </button>
                      );
                    })}

                    {/* Spotify-style Live Catalog Sync */}
                    <button
                      onClick={() => {
                        setIsRefreshingMusic(true);
                        fetchLiveMusicDiscovery()
                          .then((tracks) => {
                            if (tracks && tracks.length > 0) setMusicDiscoveryList(tracks);
                          })
                          .finally(() => setTimeout(() => setIsRefreshingMusic(false), 600));
                      }}
                      className="px-3 py-1 rounded-xl text-xs font-semibold bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 transition-all cursor-pointer flex items-center gap-1.5"
                      title="Sync & load latest fresh releases like Spotify"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isRefreshingMusic ? 'animate-spin' : ''}`} />
                      <span>Live Sync</span>
                    </button>
                  </div>
                </div>

                {/* Algorithmic Recommendations: Suggested For You */}
                {!searchQuery && recommendedTracks.length > 0 && (
                  <div className="flex flex-col gap-3 p-4 rounded-3xl bg-gradient-to-r from-purple-950/20 via-slate-900/40 to-cyan-950/20 border border-white/10 backdrop-blur-md">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-cyan-400" />
                        <h4 className="text-xs font-bold uppercase tracking-wider text-white/90">
                          Suggested For You
                        </h4>
                      </div>
                      <span className="text-[10px] text-white/40 font-mono">Personalized Stream Engine</span>
                    </div>

                    <div className="flex items-center gap-3 overflow-x-auto pb-1 scrollbar-none">
                      {recommendedTracks.map((rTrack) => (
                        <div
                          key={`rec-${rTrack.id}`}
                          onClick={() => {
                            if (rTrack.streamUrl) {
                              openMedia(rTrack.streamUrl, `${rTrack.title} - ${rTrack.artist}`, true, 0, rTrack.coverUrl, 'music');
                              setMusicPlayerOpen(true);
                              if (onOpenMusic) onOpenMusic();
                            }
                          }}
                          className="flex items-center gap-3 p-2 rounded-2xl bg-white/5 hover:bg-white/15 border border-white/10 cursor-pointer min-w-[220px] max-w-[240px] shrink-0 transition-all hover:scale-[1.02] group"
                        >
                          <img
                            src={rTrack.coverUrl}
                            alt=""
                            className="w-12 h-12 rounded-xl object-cover shrink-0"
                            onError={(e) => {
                              (e.currentTarget as HTMLImageElement).src =
                                'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&auto=format&fit=crop&q=80';
                            }}
                          />
                          <div className="flex flex-col min-w-0 flex-1">
                            <span className="text-xs font-bold text-white truncate group-hover:text-cyan-400 transition-colors">
                              {rTrack.title}
                            </span>
                            <span className="text-[10px] text-white/50 truncate">{rTrack.artist}</span>
                          </div>
                          <Play className="w-4 h-4 text-cyan-400 fill-current opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Music Cards Grid */}
                {filteredMusicTracks.length === 0 ? (
                  <div className="p-8 rounded-2xl bg-white/5 border border-white/10 text-center flex flex-col items-center gap-2">
                    <Music className="w-8 h-8 text-white/30" />
                    <p className="text-xs text-white/60">No tracks found matching "{searchQuery}"</p>
                    <button
                      onClick={() => {
                        setSearchQuery('');
                        setSelectedMusicPlatform('all');
                      }}
                      className="text-xs text-rose-400 hover:underline cursor-pointer mt-1"
                    >
                      Clear search filters
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-6 w-full">
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                      {paginatedMusicTracks.map((track) => {
                        return (
                          <div
                            key={track.id}
                            onClick={() => {
                              if (track.streamUrl) {
                                openMedia(track.streamUrl, `${track.title} - ${track.artist}`, true, 0, track.coverUrl, 'music');
                                setMusicPlayerOpen(true);
                                if (onOpenMusic) onOpenMusic();
                              }
                            }}
                            className="group relative flex flex-col rounded-2xl bg-white/5 border border-white/10 overflow-hidden hover:border-cyan-500/50 hover:bg-white/10 transition-all shadow-xl hover:shadow-2xl cursor-pointer"
                          >
                            {/* Cover Image Container with Preview Zoom */}
                            <div className="relative aspect-square w-full overflow-hidden bg-black/60">
                              <img
                                src={track.coverUrl}
                                alt={track.title}
                                loading="lazy"
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                onError={(e) => {
                                  (e.currentTarget as HTMLImageElement).src =
                                    'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&auto=format&fit=crop&q=80';
                                }}
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80 group-hover:opacity-60 transition-opacity" />

                              {/* Audio Quality / Genre Badge */}
                              <div
                                className="absolute top-2 left-2 flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold text-white shadow-md backdrop-blur-md border border-white/20"
                                style={{
                                  background:
                                    track.category === 'romantic'
                                      ? 'linear-gradient(135deg, #ec4899, #f43f5e)'
                                      : track.category === 'phonk'
                                      ? 'linear-gradient(135deg, #8b5cf6, #6366f1)'
                                      : track.category === 'hindi'
                                      ? 'linear-gradient(135deg, #f59e0b, #d97706)'
                                      : track.category === 'sinhala'
                                      ? 'linear-gradient(135deg, #10b981, #059669)'
                                      : 'linear-gradient(135deg, #06b6d4, #2563eb)',
                                }}
                              >
                                <span>{track.category ? track.category.toUpperCase() : 'HI-FI STUDIO'}</span>
                              </div>

                              {/* Add to Playlist button */}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedTrackForPlaylist({
                                    id: track.id,
                                    title: track.title,
                                    artist: track.artist,
                                    url: track.streamUrl,
                                    coverUrl: track.coverUrl,
                                  });
                                  setIsPlaylistModalOpen(true);
                                }}
                                className="absolute bottom-2 right-2 p-1.5 rounded-xl bg-black/60 hover:bg-cyan-500 text-white/80 hover:text-white backdrop-blur-md border border-white/20 opacity-0 group-hover:opacity-100 transition-all cursor-pointer shadow-lg"
                                title="Add to Playlist"
                              >
                                <ListPlus className="w-3.5 h-3.5" />
                              </button>

                              {/* Duration / Plays Badge */}
                              {(track.duration || track.plays) && (
                                <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded-md text-[9px] font-mono text-white/90 bg-black/70 backdrop-blur-md border border-white/10">
                                  {track.duration || track.plays}
                                </div>
                              )}

                              {/* Center Play Button Overlay */}
                              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 backdrop-blur-[2px]">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (track.streamUrl) {
                                      openMedia(track.streamUrl, `${track.title} - ${track.artist}`, true, 0, track.coverUrl, 'music');
                                      setMusicPlayerOpen(true);
                                      if (onOpenMusic) onOpenMusic();
                                    }
                                  }}
                                  className="w-11 h-11 rounded-full bg-white text-black hover:scale-110 flex items-center justify-center shadow-xl transition-all cursor-pointer"
                                  title="Play in Miki Player"
                                >
                                  <Play className="w-5 h-5 fill-current ml-0.5 text-black" />
                                </button>
                              </div>
                            </div>

                            {/* Track Details & Action Footer */}
                            <div className="p-3 flex flex-col flex-1 justify-between gap-2">
                              <div>
                                <h4
                                  className="text-xs font-bold text-white truncate group-hover:text-emerald-400 transition-colors"
                                  title={track.title}
                                >
                                  {track.title}
                                </h4>
                                <p className="text-[11px] text-white/60 truncate" title={track.artist}>
                                  {track.artist}
                                </p>
                                <div className="mt-1 flex items-center gap-1">
                                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/10 text-white/70 font-medium truncate">
                                    {track.genre}
                                  </span>
                                </div>
                              </div>

                              {/* In-App Direct Play Action */}
                              <div className="pt-2 border-t border-white/5 flex items-center justify-between gap-1">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (track.streamUrl) {
                                      openMedia(track.streamUrl, `${track.title} - ${track.artist}`, true, 0, track.coverUrl, 'music');
                                      setMusicPlayerOpen(true);
                                      if (onOpenMusic) onOpenMusic();
                                    }
                                  }}
                                  className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-emerald-600/80 hover:bg-emerald-500 hover:scale-[1.02] text-white text-[10px] font-bold shadow-md transition-all cursor-pointer"
                                  title="Play Directly in Miki Player"
                                >
                                  <Play className="w-3.5 h-3.5 fill-current" />
                                  <span>Play Song In-App</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Chunk-by-Chunk Progressive Music Loading & Pagination Controls */}
                    {filteredMusicTracks.length > MUSIC_PAGE_SIZE && (
                      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-6 border-t border-white/10 w-full">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 font-mono text-[10px] font-bold border border-emerald-500/30">
                            Chunk {musicCurrentPage} of {musicTotalPages}
                          </span>
                          <span className="text-xs text-white/50 font-mono">
                            Showing {(musicCurrentPage - 1) * MUSIC_PAGE_SIZE + 1} -{' '}
                            {Math.min(filteredMusicTracks.length, musicCurrentPage * MUSIC_PAGE_SIZE)} of{' '}
                            {filteredMusicTracks.length} Songs (Chunked Streaming)
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => setMusicCurrentPage((p) => Math.max(1, p - 1))}
                            disabled={musicCurrentPage === 1}
                            className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-white/5 hover:bg-white/10 text-white border border-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer flex items-center gap-1"
                          >
                            <ChevronLeft className="w-3.5 h-3.5" />
                            <span>Previous Chunk</span>
                          </button>

                          {Array.from({ length: musicTotalPages }, (_, i) => i + 1).map((chunkNum) => {
                            if (
                              chunkNum === 1 ||
                              chunkNum === musicTotalPages ||
                              (chunkNum >= musicCurrentPage - 2 && chunkNum <= musicCurrentPage + 2)
                            ) {
                              const isActive = musicCurrentPage === chunkNum;
                              return (
                                <button
                                  key={chunkNum}
                                  onClick={() => setMusicCurrentPage(chunkNum)}
                                  className={`w-8 h-8 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                    isActive
                                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/40'
                                      : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white border border-white/10'
                                  }`}
                                >
                                  {chunkNum}
                                </button>
                              );
                            }
                            if (chunkNum === musicCurrentPage - 3 || chunkNum === musicCurrentPage + 3) {
                              return (
                                <span key={chunkNum} className="text-xs text-white/40 px-1">
                                  ...
                                </span>
                              );
                            }
                            return null;
                          })}

                          <button
                            onClick={() => setMusicCurrentPage((p) => Math.min(musicTotalPages, p + 1))}
                            disabled={musicCurrentPage === musicTotalPages}
                            className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-white/5 hover:bg-white/10 text-white border border-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer flex items-center gap-1"
                          >
                            <span>Next Chunk</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
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
    </div>
  );
};
