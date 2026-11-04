import React, { useState, useMemo } from 'react';
import { usePlayerStore } from '../../store/playerStore';
import { CURATED_CHANNELS, LiveChannel } from '../../utils/channelCatalog';
import { GAMES_CATALOG, GameItem } from '../../utils/gamesCatalog';
import { CINEMA_LINKS, CinemaSiteItem } from '../../utils/cinemaLinks';
import { INTERNET_MUSIC_STREAMS, InternetMusicStation } from '../../utils/musicStreams';
import { MOVIE_POSTERS, ALBUM_POSTERS } from '../../utils/mediaPosters';
import {
  Film,
  Play,
  Pause,
  Tv,
  Gamepad2,
  Music,
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
  Heart,
  Download,
  Bell,
  Compass,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  FolderOpen,
} from 'lucide-react';

export type HomeViewCategory =
  | 'All'
  | 'Movies'
  | 'Tv series'
  | 'Animation'
  | 'Sports'
  | 'Live TV'
  | 'Games'
  | 'Music';

export type HomeNavTab =
  | 'browse'
  | 'watchlist'
  | 'coming_soon'
  | 'channels'
  | 'games'
  | 'music'
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
}

const COVER_FLOW_ALBUMS: CoverFlowTrack[] = [
  {
    id: 'track-bin-tere',
    title: 'Bin Tere',
    artist: 'Vishal-Shekhar, Shafqat Amanat Ali',
    album: 'I Hate Luv Storys',
    albumArt: ALBUM_POSTERS.binTere,
    url: 'https://cdn.freesound.org/previews/612/612627_5674468-lq.mp3',
    durationSec: 330,
  },
  {
    id: 'track-soniyo',
    title: 'Soniyo',
    artist: 'Raju Singh, Sonu Nigam, Shreya Ghoshal',
    album: 'Raaz: The Mystery Continues',
    albumArt: ALBUM_POSTERS.soniyo,
    url: 'https://cdn.freesound.org/previews/615/615483_11861866-lq.mp3',
    durationSec: 312,
  },
  {
    id: 'track-dooriyan',
    title: 'Dooriyan',
    artist: 'Pritam, Mohit Chauhan',
    album: 'Love Aaj Kal',
    albumArt: ALBUM_POSTERS.dooriyan,
    url: 'https://cdn.freesound.org/previews/530/530704_11861866-lq.mp3',
    durationSec: 338,
  },
  {
    id: 'track-darkhaast',
    title: 'Darkhaast',
    artist: 'Mithoon, Arijit Singh, Sunidhi Chauhan',
    album: 'Shivaay',
    albumArt: ALBUM_POSTERS.darkhaast,
    url: 'https://cdn.freesound.org/previews/530/530704_11861866-lq.mp3',
    durationSec: 374,
  },
  {
    id: 'track-tujhko-jo-paaya',
    title: 'Tujhko Jo Paaya',
    artist: 'Pritam, Mohit Chauhan',
    album: 'Crook',
    albumArt: ALBUM_POSTERS.tujhkoJoPaaya,
    url: 'https://cdn.freesound.org/previews/612/612627_5674468-lq.mp3',
    durationSec: 290,
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
    id: 'harry-potter',
    title: 'Harry Potter (2011)',
    year: '2011',
    rating: 'IMDb 8.1',
    genre: 'Fantasy, Adventure',
    duration: '2h 10min',
    image: MOVIE_POSTERS.harryPotter,
    url: 'https://cinesubz.co',
  },
  {
    id: 'interstellar',
    title: 'Interstellar',
    year: '2014',
    rating: 'IMDb 8.7',
    genre: 'Sci-Fi, Adventure',
    duration: '2h 49min',
    image: MOVIE_POSTERS.interstellar,
    url: 'https://cinesubz.co',
  },
  {
    id: 'inception',
    title: 'Inception',
    year: '2010',
    rating: 'IMDb 8.8',
    genre: 'Sci-Fi, Action',
    duration: '2h 28min',
    image: MOVIE_POSTERS.inception,
    url: 'https://cinesubz.co',
  },
  {
    id: 'tenet',
    title: 'Tenet',
    year: '2020',
    rating: 'IMDb 7.3',
    genre: 'Sci-Fi, Action',
    duration: '2h 30min',
    image: MOVIE_POSTERS.tenet,
    url: 'https://cinesubz.co',
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
    url: 'https://cinesubz.co',
  },
  {
    id: 'party-wonderwoman',
    title: 'Wonder Woman',
    genre: 'Adventure, Action',
    viewers: '+7 friends watching',
    image: MOVIE_POSTERS.wonderWoman,
    url: 'https://cinesubz.co',
  },
  {
    id: 'party-mortalengines',
    title: 'Mortal Engines',
    genre: 'Science Fiction, Suspense',
    viewers: '+3 friends watching',
    image: MOVIE_POSTERS.mortalEngines,
    url: 'https://cinesubz.co',
  },
  {
    id: 'party-rampage',
    title: 'Rampage',
    genre: 'Adventure, Action',
    viewers: '+9 friends watching',
    image: MOVIE_POSTERS.rampage,
    url: 'https://cinesubz.co',
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
  const [activeNav, setActiveNav] = useState<HomeNavTab>('browse');
  const [activeCategory, setActiveCategory] = useState<HomeViewCategory>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isMusicMode, setIsMusicMode] = useState<boolean>(false);
  const [activeAlbumIdx, setActiveAlbumIdx] = useState<number>(2); // Default to Dooriyan (Love Aaj Kal)
  const [isCoverFlowPlaying, setIsCoverFlowPlaying] = useState<boolean>(false);
  const [partiesToggle, setPartiesToggle] = useState<boolean>(true);
  const [continueToggle, setContinueToggle] = useState<boolean>(true);

  const recentMedia = usePlayerStore((s) => s.recentMedia);
  const openMedia = usePlayerStore((s) => s.openMedia);
  const volume = usePlayerStore((s) => s.volume);
  const isMuted = usePlayerStore((s) => s.isMuted);
  const toggleMute = usePlayerStore((s) => s.toggleMute);

  const activeAlbum = COVER_FLOW_ALBUMS[activeAlbumIdx] || COVER_FLOW_ALBUMS[0];

  // Filtered Channels for search
  const filteredChannels = useMemo(() => {
    if (!searchQuery.trim()) return CURATED_CHANNELS;
    const q = searchQuery.toLowerCase();
    return CURATED_CHANNELS.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.category.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  // Filtered Games for search
  const filteredGames = useMemo(() => {
    if (!searchQuery.trim()) return GAMES_CATALOG;
    const q = searchQuery.toLowerCase();
    return GAMES_CATALOG.filter(
      (g) =>
        g.title.toLowerCase().includes(q) ||
        g.category.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  // Filtered Cinema for search
  const filteredCinema = useMemo(() => {
    if (!searchQuery.trim()) return CINEMA_LINKS;
    const q = searchQuery.toLowerCase();
    return CINEMA_LINKS.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.category.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  const handlePlayAlbum = (idx: number) => {
    setActiveAlbumIdx(idx);
    const track = COVER_FLOW_ALBUMS[idx];
    if (track) {
      openMedia(track.url, `${track.title} - ${track.artist}`);
      setIsCoverFlowPlaying(true);
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
                setIsMusicMode(false);
              }}
              className={`p-2.5 rounded-full transition-all cursor-pointer ${
                activeNav === 'browse' && !isMusicMode
                  ? 'bg-rose-600 text-white shadow-md shadow-rose-600/40'
                  : 'text-white/50 hover:text-white hover:bg-white/10'
              }`}
              title="Home"
            >
              <Film className="w-4 h-4" />
            </button>

            <button
              onClick={() => {
                setActiveNav('watchlist');
                setIsMusicMode(false);
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
                setIsMusicMode(false);
              }}
              className={`p-2.5 rounded-full transition-all cursor-pointer ${
                activeNav === 'channels'
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
                setIsMusicMode(false);
              }}
              className={`p-2.5 rounded-full transition-all cursor-pointer ${
                activeNav === 'games'
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/40'
                  : 'text-white/50 hover:text-white hover:bg-white/10'
              }`}
              title="Games Arcade"
            >
              <Gamepad2 className="w-4 h-4" />
            </button>

            <button
              onClick={() => {
                setIsMusicMode(true);
                setActiveNav('music');
              }}
              className={`p-2.5 rounded-full transition-all cursor-pointer ${
                isMusicMode
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/40'
                  : 'text-white/50 hover:text-white hover:bg-white/10'
              }`}
              title="Apple Cover Flow 3D Music"
            >
              <Music className="w-4 h-4" />
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

          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-rose-500 border border-white/20 flex items-center justify-center text-xs font-bold text-white shadow-md">
            S
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 2. ADZE.DESIGN & NETFLIX LEFT SIDEBAR NAVIGATION             */}
      {/* ============================================================ */}
      <aside className="w-60 bg-[#090c14]/90 border-r border-white/5 flex flex-col justify-between p-4 shrink-0 backdrop-blur-2xl">
        <div className="flex flex-col gap-6">
          {/* Brand Logo (Adze.DESIGN red accent + Netflix bold) */}
          <div className="flex items-center gap-2 px-2 pt-1">
            <span className="text-lg font-black tracking-tight text-white">Adze.</span>
            <span className="text-lg font-black tracking-tight text-rose-500">DESIGN</span>
          </div>

          {/* Section: News Feed */}
          <div className="flex flex-col gap-1">
            <span className="px-3 text-[10px] font-bold text-white/40 uppercase tracking-wider mb-1">
              News Feed
            </span>

            <button
              onClick={() => {
                setActiveNav('browse');
                setIsMusicMode(false);
              }}
              className={`relative flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all text-left cursor-pointer ${
                activeNav === 'browse' && !isMusicMode
                  ? 'text-white bg-white/5 font-bold'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              {activeNav === 'browse' && !isMusicMode && (
                <span className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r-full bg-rose-500 shadow-sm shadow-rose-500" />
              )}
              <Compass className="w-4 h-4 text-rose-500" />
              <span>Browse</span>
            </button>

            <button
              onClick={() => {
                setActiveNav('watchlist');
                setIsMusicMode(false);
              }}
              className={`relative flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all text-left cursor-pointer ${
                activeNav === 'watchlist'
                  ? 'text-white bg-white/5 font-bold'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              {activeNav === 'watchlist' && (
                <span className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r-full bg-rose-500 shadow-sm shadow-rose-500" />
              )}
              <Heart className="w-4 h-4 text-white/50" />
              <span>Watchlist</span>
            </button>

            <button
              onClick={() => {
                setActiveNav('coming_soon');
                setIsMusicMode(false);
              }}
              className={`relative flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all text-left cursor-pointer ${
                activeNav === 'coming_soon'
                  ? 'text-white bg-white/5 font-bold'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-3">
                <Clock className="w-4 h-4 text-white/50" />
                <span>Coming Soon</span>
              </div>
              <span className="px-1.5 py-0.2 rounded-full bg-rose-500 text-[9px] font-bold text-white">
                3
              </span>
            </button>
          </div>

          {/* Section: Who's Watching / Following (From Adze & Netflix Images) */}
          <div className="flex flex-col gap-1.5">
            <span className="px-3 text-[10px] font-bold text-white/40 uppercase tracking-wider mb-1">
              Who's Watching & Following
            </span>

            {[
              { name: 'Sharma', alias: 'Ikako.t', color: 'bg-emerald-400', initial: 'S' },
              { name: 'Divi boo', alias: 'Nick.B', color: 'bg-teal-400', initial: 'D' },
              { name: 'Adhi', alias: 'Vika.J', color: 'bg-amber-400', initial: 'A' },
              { name: 'Harsha', alias: 'Alesanda.B', color: 'bg-blue-400', initial: 'H' },
              { name: 'Anna.S', alias: 'Anna.S', color: 'bg-rose-500', initial: 'N' },
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

            <button className="flex items-center gap-1.5 px-3 py-1 text-[11px] text-white/40 hover:text-white/80 transition-colors cursor-pointer mt-1">
              <ChevronDown className="w-3.5 h-3.5" />
              <span>Load more</span>
            </button>
          </div>
        </div>

        {/* Sidebar Bottom: Log Out */}
        <div className="pt-4 border-t border-white/5">
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
                onClick={() => setIsMusicMode(false)}
                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-all cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsMusicMode(true)}
                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-all cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Adze "Search everything" Bar */}
            <div className="relative min-w-[280px] sm:min-w-[340px]">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/40" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search everything..."
                className="w-full pl-9 pr-8 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-white/40 focus:outline-none focus:border-rose-500/50 transition-all font-medium"
              />
              <button
                type="button"
                onClick={onOpenEq}
                title="Audio Equalizer & 3D Spatial Audio"
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-white/30 hover:text-white transition-colors"
              >
                <Sliders className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Netflix Category Pills */}
          <div className="hidden lg:flex items-center gap-1.5">
            {(['All', 'Movies', 'Tv series', 'Animation', 'Live TV', 'Games', 'Music'] as HomeViewCategory[]).map(
              (cat) => (
                <button
                  key={cat}
                  onClick={() => {
                    setActiveCategory(cat);
                    if (cat === 'Music') setIsMusicMode(true);
                    else setIsMusicMode(false);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    activeCategory === cat
                      ? 'bg-rose-600 text-white font-bold shadow-md shadow-rose-600/30'
                      : 'text-white/60 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {cat}
                </button>
              )
            )}
          </div>

          {/* Right Header Icons: Bell & Avatar */}
          <div className="flex items-center gap-3">
            <button className="relative p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-all cursor-pointer">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-rose-500" />
            </button>

            <div className="flex items-center gap-2 pl-2 border-l border-white/10">
              <div className="w-8 h-8 rounded-full bg-slate-800 border border-white/20 flex items-center justify-center text-xs font-bold text-white shadow-md">
                S
              </div>
              <span className="text-xs font-semibold text-white/80 hidden sm:inline">
                Suriya sharma
              </span>
            </div>
          </div>
        </header>

        {/* SCROLLABLE HOME VIEWPORT */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 flex flex-col gap-8 scrollbar-thin">
          {/* ============================================================ */}
          {/* A. APPLE COVER FLOW 3D MUSIC MODE (USER UPLOADED IMAGE 1)    */}
          {/* ============================================================ */}
          {isMusicMode ? (
            <div className="flex flex-col gap-8 items-center justify-center min-h-[500px]">
              {/* 3D Perspective Carousel Container */}
              <div
                className="relative w-full max-w-4xl h-72 flex items-center justify-center"
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

                  return (
                    <div
                      key={album.id}
                      onClick={() => handlePlayAlbum(idx)}
                      className="absolute w-52 h-52 rounded-2xl overflow-hidden cursor-pointer transition-all duration-500 ease-out shadow-2xl border border-white/20 select-none group"
                      style={{
                        transform,
                        zIndex,
                        opacity,
                        transformStyle: 'preserve-3d',
                      }}
                    >
                      <img
                        src={album.albumArt}
                        alt={album.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-3">
                        <div>
                          <h4 className="text-xs font-bold text-white truncate">{album.title}</h4>
                          <p className="text-[10px] text-white/60 truncate">{album.artist}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Active Album Title & Artist Display */}
              <div className="text-center flex flex-col items-center gap-1 animate-in fade-in duration-300">
                <h2 className="text-xl font-bold text-white tracking-wide">
                  {activeAlbum.title}
                </h2>
                <p className="text-xs text-white/60 font-medium">
                  {activeAlbum.artist}
                </p>
              </div>

              {/* FLOATING TRANSLUCENT GLASS PILL PLAYBACK BAR (IMAGE 1) */}
              <div className="w-full max-w-2xl px-6 py-3 rounded-full bg-slate-950/80 backdrop-blur-2xl border border-white/15 shadow-2xl flex items-center justify-between gap-4">
                {/* Left Playback Controls */}
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
                    onClick={() => handlePlayAlbum(activeAlbumIdx)}
                    className="p-2.5 rounded-full bg-white text-slate-950 hover:scale-105 transition-all cursor-pointer shadow-lg"
                  >
                    {isCoverFlowPlaying ? (
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

                {/* Center Mini Track Pill & Waveform Scrubber */}
                <div className="flex-1 flex items-center gap-3 px-3 py-1.5 rounded-2xl bg-white/5 border border-white/10 min-w-0">
                  <div className="w-8 h-8 rounded-lg overflow-hidden bg-black/60 shrink-0">
                    <img
                      src={activeAlbum.albumArt}
                      alt={activeAlbum.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex flex-col min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white truncate">
                        {activeAlbum.title}
                      </span>
                      <span className="text-[10px] text-white/40 font-mono">3:38</span>
                    </div>
                    {/* Simulated Waveform Scrubber */}
                    <div className="w-full h-1 bg-white/20 rounded-full overflow-hidden mt-1">
                      <div className="w-2/5 h-full bg-gradient-to-r from-rose-500 to-cyan-400 rounded-full" />
                    </div>
                  </div>
                </div>

                {/* Right Sound & Aux Buttons */}
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

              {/* 24/7 Live Internet Radio Stations */}
              <div className="w-full max-w-5xl flex flex-col gap-4 mt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Music className="w-4 h-4 text-emerald-400" />
                    <h3 className="text-sm font-bold text-white tracking-wide uppercase">
                      24/7 Live Internet Radio Stations
                    </h3>
                  </div>
                  <span className="text-xs text-white/50">{INTERNET_MUSIC_STREAMS.length} Channels Broadcasting</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                  {INTERNET_MUSIC_STREAMS.map((station: InternetMusicStation) => (
                    <div
                      key={station.id}
                      onClick={() => openMedia(station.streamUrl, `${station.title} - ${station.artist}`, true)}
                      className="group flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/10 hover:border-emerald-500/50 hover:bg-white/10 transition-all cursor-pointer shadow-lg"
                    >
                      <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 bg-black/40 border border-white/10">
                        <img src={station.logoUrl} alt={station.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                      </div>
                      <div className="flex flex-col min-w-0 flex-1">
                        <span className="text-xs font-bold text-white truncate group-hover:text-emerald-400 transition-colors">
                          {station.title}
                        </span>
                        <span className="text-[10px] text-white/60 truncate">
                          {station.genre} • {station.artist}
                        </span>
                        <span className="text-[9px] font-mono text-emerald-400/90 mt-0.5">
                          {station.badge}
                        </span>
                      </div>
                      <button
                        type="button"
                        className="w-8 h-8 rounded-full bg-white/10 group-hover:bg-emerald-500 group-hover:text-black flex items-center justify-center text-white/70 transition-all shrink-0"
                      >
                        <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* ============================================================ */
            /* B. NETFLIX & ADZE.DESIGN HERO STREAMING DASHBOARD            */
            /* ============================================================ */
            <>
              {/* 1. HERO SHOWCASE FEATURE BANNER (IMAGE 2 & 3) */}
              <div className="relative w-full rounded-3xl overflow-hidden border border-white/10 shadow-2xl bg-[#090d16] p-8 sm:p-10 flex flex-col justify-between min-h-[380px] group">
                {/* Background Artwork */}
                <div
                  className="absolute inset-0 bg-cover bg-center opacity-40 group-hover:scale-105 transition-transform duration-700 pointer-events-none"
                  style={{
                    backgroundImage:
                      'url(https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=1600&q=80)',
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#07090e] via-[#07090e]/70 to-transparent pointer-events-none" />
                <div className="absolute inset-0 bg-gradient-to-r from-[#07090e] via-[#07090e]/85 to-transparent pointer-events-none" />

                {/* Hero Metadata Badges */}
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

                {/* Hero Title & Description */}
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

                {/* Hero Actions Row & Friends Watching Avatar Pill */}
                <div className="relative z-10 flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => {
                        if (onOpenWebBrowser) onOpenWebBrowser('https://cinesubz.co');
                        else openMedia(CURATED_CHANNELS[0].streamUrl, 'Spider-Man');
                      }}
                      className="flex items-center gap-2 px-6 py-3 rounded-full bg-white text-slate-950 hover:bg-slate-200 text-xs font-bold transition-all shadow-xl active:scale-95 cursor-pointer"
                    >
                      <Play className="w-4 h-4 fill-current" />
                      <span>Watch</span>
                    </button>

                    <button
                      onClick={() => {
                        if (onOpenWebBrowser) onOpenWebBrowser('https://cinesubz.co');
                      }}
                      className="flex items-center gap-2 px-5 py-3 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 text-white text-xs font-semibold transition-all backdrop-blur-md cursor-pointer"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download</span>
                    </button>

                    {/* Social Indicator Pill (Adze Image 2) */}
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

                  {/* Corner Mini Carousel Thumbnails (From Adze Image 2) */}
                  <div className="hidden sm:flex items-center gap-2">
                    <div className="w-14 h-10 rounded-xl overflow-hidden border border-rose-500/50 bg-black/60 shadow-lg">
                      <img
                        src="https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=200&q=80"
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="w-14 h-10 rounded-xl overflow-hidden border border-white/10 bg-black/60">
                      <img
                        src="https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=200&q=80"
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* 2. PARTIES CAROUSEL (ADZE IMAGE 2) */}
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
                        else openMedia(CURATED_CHANNELS[0].streamUrl, party.title);
                      }}
                      className="group flex flex-col p-3 rounded-2xl bg-white/5 border border-white/10 hover:border-rose-500/50 hover:bg-white/10 transition-all cursor-pointer shadow-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl overflow-hidden bg-black/60 shrink-0 border border-white/10">
                          <img
                            src={party.image}
                            alt={party.title}
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

              {/* 3. CONTINUE WATCHING CAROUSEL (ADZE & NETFLIX IMAGES) */}
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
                        onClick={() => openMedia(item.uri, item.title, true, item.lastPositionMs)}
                        className="group relative flex flex-col rounded-2xl overflow-hidden bg-white/5 border border-white/10 hover:border-rose-400/50 hover:bg-white/10 transition-all cursor-pointer shadow-lg"
                      >
                        <div className="relative aspect-video w-full overflow-hidden bg-black/60">
                          {item.thumbnailUri ? (
                            <img
                              src={item.thumbnailUri}
                              alt={item.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-slate-900 text-white/30">
                              <Film className="w-6 h-6" />
                            </div>
                          )}
                          <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="w-8 h-8 rounded-full bg-rose-600 flex items-center justify-center shadow-lg shadow-rose-600/40 text-white">
                              <Play className="w-4 h-4 fill-white ml-0.5" />
                            </div>
                          </div>
                          {/* Progress Meter Bar */}
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
                          else openMedia(CURATED_CHANNELS[0].streamUrl, mov.title);
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

              {/* 4. RECOMMENDED MOVIES ROW (NETFLIX IMAGE 3) */}
              <section className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-bold text-white tracking-wide">
                    Recommended movies
                  </h2>
                  <button
                    onClick={() => {
                      if (onOpenWebBrowser) onOpenWebBrowser('https://cinesubz.co');
                    }}
                    className="text-xs text-rose-400 hover:underline cursor-pointer"
                  >
                    See all
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {RECOMMENDED_MOVIES.map((movie) => (
                    <div
                      key={movie.id}
                      onClick={() => {
                        if (onOpenWebBrowser) onOpenWebBrowser(movie.url);
                        else openMedia(CURATED_CHANNELS[0].streamUrl, movie.title);
                      }}
                      className="group relative flex flex-col rounded-2xl overflow-hidden bg-white/5 border border-white/10 hover:border-rose-500/50 hover:bg-white/10 transition-all cursor-pointer shadow-lg"
                    >
                      <div className="relative aspect-[3/4] w-full overflow-hidden bg-black/60">
                        <img
                          src={movie.image}
                          alt={movie.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
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
                          <span>{movie.genre.split(',')[0]}</span>
                          <span className="font-mono">{movie.duration}</span>
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
                  <span className="text-xs font-mono text-amber-400">100% Verified Akamai Mirrors</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                  {filteredChannels.slice(0, 6).map((ch: LiveChannel) => (
                    <div
                      key={ch.id}
                      onClick={() => openMedia(ch.streamUrl, ch.name)}
                      className="group flex flex-col rounded-2xl overflow-hidden bg-white/5 border border-white/10 hover:border-amber-400/50 hover:bg-white/10 transition-all cursor-pointer shadow-lg"
                    >
                      <div className="relative aspect-video w-full overflow-hidden bg-black/60">
                        <img
                          src={ch.logo}
                          alt={ch.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
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
                      Miki Game Arcade (50+ Titles)
                    </h2>
                  </div>
                  {onOpenGames && (
                    <button
                      onClick={() => onOpenGames()}
                      className="text-xs text-purple-400 hover:underline cursor-pointer"
                    >
                      Open Full Arcade
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                  {filteredGames.filter((g) => g.isInbuilt).slice(0, 6).map((game: GameItem) => (
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
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-500 text-black">
                            INBUILT
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
    </div>
  );
};
