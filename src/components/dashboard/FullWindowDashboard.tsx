import React, { useState, useMemo } from 'react';
import { usePlayerStore, MediaHistoryItem } from '../../store/playerStore';
import { CURATED_CHANNELS, LiveChannel } from '../../utils/channelCatalog';
import { GAMES_CATALOG, GameItem } from '../../utils/gamesCatalog';
import { CINEMA_LINKS, CinemaSiteItem } from '../../utils/cinemaLinks';
import { FEATURED_MUSIC_TRACKS } from '../music/MusicPlayerView';
import { PersistentCacheService } from '../../services/PersistentCacheService';
import {
  Film,
  Play,
  Tv,
  Gamepad2,
  Music,
  Clock,
  Bookmark,
  Search,
  Settings,
  X,
  ExternalLink,
  Sparkles,
  ArrowLeft,
  Sliders,
} from 'lucide-react';

export type DashboardTab =
  | 'home'
  | 'cinema'
  | 'channels'
  | 'games'
  | 'music'
  | 'history'
  | 'bookmarks';

interface FullWindowDashboardProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenGames?: (gameId?: string) => void;
  onOpenMusic?: () => void;
  onOpenWebBrowser?: (url: string) => void;
  onOpenSettings?: () => void;
  onOpenEq?: () => void;
}

export const FullWindowDashboard: React.FC<FullWindowDashboardProps> = ({
  isOpen,
  onClose,
  onOpenGames,
  onOpenMusic,
  onOpenWebBrowser,
  onOpenSettings,
  onOpenEq,
}) => {
  const [activeTab, setActiveTab] = useState<DashboardTab>(() => {
    return PersistentCacheService.get<DashboardTab>('dashboard_active_tab') || 'home';
  });

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');

  const recentMedia = usePlayerStore((s) => s.recentMedia);
  const openMedia = usePlayerStore((s) => s.openMedia);
  const bookmarks = usePlayerStore((s) => s.bookmarks);
  const bookmarkedWebsites = usePlayerStore((s) => s.bookmarkedWebsites);

  // Tab switch handler with instant persistent caching
  const handleSelectTab = (tab: DashboardTab) => {
    setActiveTab(tab);
    PersistentCacheService.set('dashboard_active_tab', tab);
  };

  // Filtered Channels for search
  const filteredChannels = useMemo(() => {
    if (!searchQuery.trim()) return CURATED_CHANNELS;
    const q = searchQuery.toLowerCase();
    return CURATED_CHANNELS.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.category.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  // Filtered Games for search
  const filteredGames = useMemo(() => {
    if (!searchQuery.trim()) return GAMES_CATALOG;
    const q = searchQuery.toLowerCase();
    return GAMES_CATALOG.filter(
      (g) =>
        g.title.toLowerCase().includes(q) ||
        g.category.toLowerCase().includes(q) ||
        g.description.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  // Filtered Cinema & Anime for search
  const filteredCinema = useMemo(() => {
    if (!searchQuery.trim()) return CINEMA_LINKS;
    const q = searchQuery.toLowerCase();
    return CINEMA_LINKS.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.category.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  // Filtered Recents for search
  const filteredRecents = useMemo(() => {
    if (!searchQuery.trim()) return recentMedia;
    const q = searchQuery.toLowerCase();
    return recentMedia.filter(
      (r) =>
        r.title.toLowerCase().includes(q) ||
        r.uri.toLowerCase().includes(q)
    );
  }, [recentMedia, searchQuery]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[#07090e]/98 text-white flex select-none overflow-hidden animate-in fade-in duration-200">
      {/* ============================================================ */}
      {/* 1. LEFT FLOATING NAVIGATION DOCK / SIDEBAR (NETFLIX & ADZE)  */}
      {/* ============================================================ */}
      <aside className="w-64 bg-[#0a0d16]/95 border-r border-white/10 flex flex-col justify-between p-4 shrink-0 backdrop-blur-2xl">
        <div className="flex flex-col gap-6">
          {/* Brand Header */}
          <div className="flex items-center gap-3 px-2 pt-2">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-600 via-purple-600 to-cyan-400 flex items-center justify-center text-white shadow-lg shadow-purple-600/30">
              <Film className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-black text-sm tracking-tight bg-gradient-to-r from-white via-cyan-200 to-purple-400 bg-clip-text text-transparent">
                  MIKI CINEMA
                </span>
                <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 font-bold">
                  PRO
                </span>
              </div>
              <p className="text-[10px] text-white/40">Premium Hub & Streaming</p>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="flex flex-col gap-1.5">
            <span className="px-3 text-[10px] font-bold text-white/40 uppercase tracking-wider mb-1">
              Menu
            </span>

            {[
              { id: 'home', label: 'Home & Trending', icon: Sparkles, color: 'text-cyan-400' },
              { id: 'cinema', label: 'Cinema & Anime', icon: Film, color: 'text-rose-400' },
              { id: 'channels', label: 'Live TV Channels', icon: Tv, color: 'text-amber-400' },
              { id: 'games', label: 'Game Arcade (50+)', icon: Gamepad2, color: 'text-purple-400' },
              { id: 'music', label: 'Cover Flow Music', icon: Music, color: 'text-emerald-400' },
              { id: 'history', label: 'Continue Watching', icon: Clock, color: 'text-blue-400' },
              { id: 'bookmarks', label: 'Saved Bookmarks', icon: Bookmark, color: 'text-amber-300' },
            ].map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleSelectTab(item.id as DashboardTab)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-2xl text-xs font-semibold transition-all text-left group cursor-pointer ${
                    isActive
                      ? 'bg-gradient-to-r from-white/15 to-white/5 text-white shadow-md border border-white/15 ring-1 ring-cyan-400/30'
                      : 'text-white/60 hover:text-white hover:bg-white/5 border border-transparent'
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${item.color}`} />
                  <span className="flex-1 truncate">{item.label}</span>
                  {isActive && (
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-sm shadow-cyan-400 animate-pulse" />
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer Actions */}
        <div className="flex flex-col gap-2 pt-4 border-t border-white/10">
          <div className="flex items-center justify-between px-2 text-[11px] text-white/50">
            <span>Miki Engine v2.0</span>
            <span className="text-emerald-400 font-mono flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Ready
            </span>
          </div>

          <div className="flex items-center gap-2">
            {onOpenSettings && (
              <button
                onClick={onOpenSettings}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-white/80 hover:text-white transition-all cursor-pointer"
                title="Open Settings"
              >
                <Settings className="w-3.5 h-3.5 text-white/60" />
                <span>Settings</span>
              </button>
            )}

            {onOpenEq && (
              <button
                onClick={onOpenEq}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 hover:text-white transition-all cursor-pointer"
                title="Equalizer"
              >
                <Sliders className="w-3.5 h-3.5 text-cyan-400" />
              </button>
            )}

            <button
              onClick={onClose}
              className="flex items-center justify-center gap-1 px-3 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs font-bold transition-all cursor-pointer"
              title="Return to Video Player (Esc)"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Player</span>
            </button>
          </div>
        </div>
      </aside>

      {/* ============================================================ */}
      {/* 2. MAIN DASHBOARD CONTENT AREA                               */}
      {/* ============================================================ */}
      <main className="flex-1 flex flex-col h-full overflow-hidden bg-[#07090e]">
        {/* TOP SEARCH & ACTIONS HEADER BAR */}
        <header className="h-16 px-6 border-b border-white/10 flex items-center justify-between gap-4 shrink-0 bg-[#0a0d16]/80 backdrop-blur-xl">
          {/* Search Bar */}
          <div className="relative flex-1 max-w-xl">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search movies, anime, live channels, games, or history..."
              className="w-full pl-10 pr-4 py-2 rounded-2xl bg-white/5 border border-white/10 text-xs text-white placeholder-white/40 focus:outline-none focus:border-cyan-400/50 transition-all font-medium"
            />
          </div>

          {/* Category Filter Pills */}
          <div className="hidden lg:flex items-center gap-1.5">
            {['All', 'Movies', 'Anime', 'Live TV', 'Games', 'Music'].map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  categoryFilter === cat
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 shadow-sm'
                    : 'text-white/60 hover:text-white hover:bg-white/5 border border-transparent'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 text-white/70 hover:text-white transition-all cursor-pointer"
            title="Close Dashboard"
          >
            <X className="w-4 h-4" />
          </button>
        </header>

        {/* SCROLLABLE DASHBOARD VIEWPORT */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-8 scrollbar-thin">
          {/* ============================================================ */}
          {/* TAB: HOME & TRENDING (NETFLIX & ADZE HERO + CAROUSELS)       */}
          {/* ============================================================ */}
          {activeTab === 'home' && (
            <>
              {/* 1. HERO SHOWCASE FEATURE BANNER (ADZE / NETFLIX INSPIRED) */}
              <div className="relative w-full rounded-3xl overflow-hidden border border-white/15 shadow-2xl bg-gradient-to-r from-purple-950/80 via-slate-950 to-black p-8 sm:p-10 flex flex-col justify-between min-h-[340px] group">
                {/* Cinematic Ambient Background */}
                <div
                  className="absolute inset-0 bg-cover bg-center opacity-30 group-hover:scale-105 transition-transform duration-700 pointer-events-none"
                  style={{
                    backgroundImage:
                      'url(https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=1600&q=80)',
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#07090e] via-[#07090e]/60 to-transparent pointer-events-none" />
                <div className="absolute inset-0 bg-gradient-to-r from-[#07090e] via-[#07090e]/80 to-transparent pointer-events-none" />

                {/* Top Badge & Metadata */}
                <div className="relative z-10 flex items-center gap-2.5">
                  <span className="flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full bg-rose-600 text-white shadow-lg shadow-rose-600/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                    Now Trending
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-white/10 text-white/80 border border-white/10">
                    4K Ultra HD
                  </span>
                  <span className="text-[10px] font-bold text-amber-400 flex items-center gap-1">
                    ★ 8.9 IMDb
                  </span>
                  <span className="text-[10px] text-white/50 hidden sm:inline">
                    Animation • Sci-Fi • Action
                  </span>
                </div>

                {/* Hero Title & Synopsis */}
                <div className="relative z-10 max-w-2xl flex flex-col gap-2 my-4">
                  <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight leading-tight">
                    Spider-Man: Across the Spider-Verse
                  </h1>
                  <p className="text-xs sm:text-sm text-white/70 line-clamp-2 leading-relaxed">
                    Miles Morales catapults across the Multiverse, where he encounters a team of
                    Spider-People charged with protecting its very existence. A visual masterpiece
                    in immersive cinema.
                  </p>
                </div>

                {/* Hero Call to Action Row */}
                <div className="relative z-10 flex flex-wrap items-center gap-3">
                  <button
                    onClick={() => {
                      if (onOpenWebBrowser) {
                        onOpenWebBrowser('https://cinesubz.co');
                      } else {
                        openMedia(CURATED_CHANNELS[0].streamUrl, 'Trending Cinema Stream');
                      }
                      onClose();
                    }}
                    className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-rose-600 to-orange-500 hover:from-rose-500 hover:to-orange-400 text-white text-xs font-bold transition-all shadow-xl shadow-rose-600/30 active:scale-95 cursor-pointer"
                  >
                    <Play className="w-4 h-4 fill-white" />
                    <span>Watch Now</span>
                  </button>

                  <button
                    onClick={() => handleSelectTab('cinema')}
                    className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/15 text-white text-xs font-semibold transition-all backdrop-blur-md cursor-pointer"
                  >
                    <Film className="w-4 h-4 text-cyan-400" />
                    <span>Browse Anime & Cinema</span>
                  </button>

                  <div className="hidden sm:flex items-center gap-2 ml-2 text-xs text-white/50">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span>+12 friends watching right now</span>
                  </div>
                </div>
              </div>

              {/* 2. CONTINUE WATCHING / RECENTLY PLAYED CAROUSEL (IMAGE 1 & 2) */}
              <section className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-cyan-400" />
                    <h2 className="text-sm font-bold text-white tracking-wide">
                      Continue Watching & Recent
                    </h2>
                  </div>
                  {filteredRecents.length > 0 && (
                    <button
                      onClick={() => handleSelectTab('history')}
                      className="text-xs text-cyan-400 hover:underline"
                    >
                      See all ({filteredRecents.length})
                    </button>
                  )}
                </div>

                {filteredRecents.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                    {filteredRecents.slice(0, 6).map((item: MediaHistoryItem) => (
                      <div
                        key={item.uri}
                        onClick={() => {
                          openMedia(item.uri, item.title, true, item.lastPositionMs);
                          onClose();
                        }}
                        className="group relative flex flex-col rounded-2xl overflow-hidden bg-white/5 border border-white/10 hover:border-cyan-400/50 hover:bg-white/10 transition-all cursor-pointer shadow-lg"
                      >
                        {/* Thumbnail & Progress Bar */}
                        <div className="relative aspect-video w-full overflow-hidden bg-black/60">
                          {item.thumbnailUri ? (
                            <img
                              src={item.thumbnailUri}
                              alt={item.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-900 to-indigo-950 text-white/30">
                              <Film className="w-6 h-6" />
                            </div>
                          )}
                          <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="w-8 h-8 rounded-full bg-cyan-500 flex items-center justify-center shadow-lg shadow-cyan-500/40 text-black">
                              <Play className="w-4 h-4 fill-current ml-0.5" />
                            </div>
                          </div>
                          {/* Progress Meter Bar */}
                          <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
                            <div
                              className="h-full bg-gradient-to-r from-cyan-400 to-rose-500"
                              style={{ width: `${Math.min(100, Math.max(5, item.progressPercent))}%` }}
                            />
                          </div>
                        </div>

                        <div className="p-2.5 flex flex-col gap-1">
                          <span className="text-xs font-bold text-white truncate group-hover:text-cyan-300 transition-colors">
                            {item.title}
                          </span>
                          <span className="text-[10px] text-white/50">
                            {item.progressPercent}% completed
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-6 rounded-2xl bg-white/5 border border-white/10 text-center text-xs text-white/40">
                    No recently played streams yet. Select any live channel, movie, or anime below to begin watching!
                  </div>
                )}
              </section>

              {/* 3. TRENDING LIVE TV CHANNELS CAROUSEL */}
              <section className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Tv className="w-4 h-4 text-amber-400" />
                    <h2 className="text-sm font-bold text-white tracking-wide">
                      Trending Live IPTV Channels (100+)
                    </h2>
                  </div>
                  <button
                    onClick={() => handleSelectTab('channels')}
                    className="text-xs text-amber-400 hover:underline"
                  >
                    View All 108 Channels
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                  {CURATED_CHANNELS.slice(0, 6).map((ch: LiveChannel) => (
                    <div
                      key={ch.id}
                      onClick={() => {
                        openMedia(ch.streamUrl, ch.name);
                        onClose();
                      }}
                      className="group relative flex flex-col rounded-2xl overflow-hidden bg-white/5 border border-white/10 hover:border-amber-400/50 hover:bg-white/10 transition-all cursor-pointer shadow-lg"
                    >
                      <div className="relative aspect-video w-full overflow-hidden bg-black/60">
                        <img
                          src={ch.logo}
                          alt={ch.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          loading="lazy"
                        />
                        <div className="absolute top-2 left-2 flex items-center gap-1">
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
                        <span className="text-xs font-bold text-white truncate group-hover:text-amber-300 transition-colors">
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

              {/* 4. HIGH-GRAPHIC BUILT-IN GAMES CAROUSEL */}
              <section className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Gamepad2 className="w-4 h-4 text-purple-400" />
                    <h2 className="text-sm font-bold text-white tracking-wide">
                      Featured High-Graphic Games Hub (50+ Titles)
                    </h2>
                  </div>
                  <button
                    onClick={() => {
                      if (onOpenGames) onOpenGames();
                      else handleSelectTab('games');
                    }}
                    className="text-xs text-purple-400 hover:underline"
                  >
                    Open Full Arcade
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                  {GAMES_CATALOG.filter((g) => g.isInbuilt).slice(0, 6).map((game: GameItem) => (
                    <div
                      key={game.id}
                      onClick={() => {
                        if (onOpenGames) {
                          onOpenGames(game.id);
                          onClose();
                        } else {
                          handleSelectTab('games');
                        }
                      }}
                      className="group relative flex flex-col rounded-2xl overflow-hidden bg-white/5 border border-white/10 hover:border-purple-400/50 hover:bg-white/10 transition-all cursor-pointer shadow-lg"
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
                        <span className="text-xs font-bold text-white truncate group-hover:text-purple-300 transition-colors">
                          {game.title}
                        </span>
                        <span className="text-[10px] text-white/50 truncate">
                          {game.badge}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* 5. POPULAR ANIME & CINEMA STREAMING CAROUSEL */}
              <section className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Film className="w-4 h-4 text-rose-400" />
                    <h2 className="text-sm font-bold text-white tracking-wide">
                      Dedicated Anime & Cinema Streaming Hub
                    </h2>
                  </div>
                  <button
                    onClick={() => handleSelectTab('cinema')}
                    className="text-xs text-rose-400 hover:underline"
                  >
                    View All Portals
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                  {CINEMA_LINKS.slice(0, 6).map((site: CinemaSiteItem) => (
                    <div
                      key={site.id}
                      onClick={() => {
                        if (onOpenWebBrowser) {
                          onOpenWebBrowser(site.url);
                          onClose();
                        }
                      }}
                      className="group relative flex flex-col rounded-2xl overflow-hidden bg-white/5 border border-white/10 hover:border-rose-400/50 hover:bg-white/10 transition-all cursor-pointer shadow-lg p-3"
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
                          <span className="text-[10px] text-rose-400 font-mono">
                            {site.category}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </>
          )}

          {/* ============================================================ */}
          {/* TAB: CINEMA & ANIME DIRECTORY                                */}
          {/* ============================================================ */}
          {activeTab === 'cinema' && (
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-white">Cinema & Anime Portals</h2>
                  <p className="text-xs text-white/50">
                    Ad-shielded streaming sites with zero popups and native video player routing
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {filteredCinema.map((site: CinemaSiteItem) => (
                  <div
                    key={site.id}
                    onClick={() => {
                      if (onOpenWebBrowser) {
                        onOpenWebBrowser(site.url);
                        onClose();
                      }
                    }}
                    className="flex flex-col justify-between p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-rose-500/50 hover:bg-white/10 transition-all cursor-pointer group shadow-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-black/60 p-1.5 border border-white/10 shrink-0 flex items-center justify-center">
                        <img src={site.logoUrl} alt={site.name} className="w-full h-full object-contain" />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-sm font-bold text-white group-hover:text-rose-300 transition-colors truncate">
                          {site.name}
                        </span>
                        <span className="text-[10px] font-mono text-rose-400">{site.category}</span>
                      </div>
                    </div>

                    <p className="text-xs text-white/60 line-clamp-2 mt-3 leading-relaxed">
                      {site.description}
                    </p>

                    <div className="flex items-center justify-between pt-3 mt-3 border-t border-white/10 text-xs font-semibold text-cyan-400">
                      <span>Launch Portal</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* TAB: LIVE TV CHANNELS (100+ VLC CATALOG)                     */}
          {/* ============================================================ */}
          {activeTab === 'channels' && (
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-white">Live IPTV Channels</h2>
                  <p className="text-xs text-white/50">
                    100+ verified global broadcast streams with automated failover mirrors
                  </p>
                </div>
                <span className="text-xs font-mono px-2.5 py-1 rounded-full bg-red-500/20 text-red-400 border border-red-500/30">
                  {filteredChannels.length} Channels Online
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                {filteredChannels.map((ch: LiveChannel) => (
                  <div
                    key={ch.id}
                    onClick={() => {
                      openMedia(ch.streamUrl, ch.name);
                      onClose();
                    }}
                    className="flex flex-col rounded-2xl overflow-hidden bg-white/5 border border-white/10 hover:border-amber-400/50 hover:bg-white/10 transition-all cursor-pointer group shadow-lg"
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

                    <div className="p-2.5 flex flex-col gap-1">
                      <span className="text-xs font-bold text-white truncate group-hover:text-amber-300 transition-colors">
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
          )}

          {/* ============================================================ */}
          {/* TAB: GAMES ARCADE HUB                                        */}
          {/* ============================================================ */}
          {activeTab === 'games' && (
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-white">Miki Game Arcade</h2>
                  <p className="text-xs text-white/50">
                    50+ built-in high-graphic and retro arcade games with zero latency
                  </p>
                </div>
                <button
                  onClick={() => {
                    if (onOpenGames) {
                      onOpenGames();
                      onClose();
                    }
                  }}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-500 text-white text-xs font-bold shadow-md shadow-purple-600/30 cursor-pointer"
                >
                  Launch Full Window Arcade
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                {filteredGames.map((game: GameItem) => (
                  <div
                    key={game.id}
                    onClick={() => {
                      if (onOpenGames) {
                        onOpenGames(game.id);
                        onClose();
                      }
                    }}
                    className="flex flex-col rounded-2xl overflow-hidden bg-white/5 border border-white/10 hover:border-purple-400/50 hover:bg-white/10 transition-all cursor-pointer group shadow-lg"
                  >
                    <div className="relative aspect-video w-full overflow-hidden bg-black/60">
                      <img
                        src={game.thumbnail}
                        alt={game.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        loading="lazy"
                      />
                      <div className="absolute top-2 left-2">
                        {game.isInbuilt && (
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-500 text-black">
                            INBUILT
                          </span>
                        )}
                      </div>
                      <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Play className="w-7 h-7 text-purple-400 fill-purple-400" />
                      </div>
                    </div>

                    <div className="p-2.5 flex flex-col gap-0.5">
                      <span className="text-xs font-bold text-white truncate group-hover:text-purple-300 transition-colors">
                        {game.title}
                      </span>
                      <span className="text-[10px] text-white/50 truncate">{game.badge}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* TAB: MUSIC HUB                                               */}
          {/* ============================================================ */}
          {activeTab === 'music' && (
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-white">Cover Flow Hi-Fi Music</h2>
                  <p className="text-xs text-white/50">
                    Audiophile 3D Cover Flow player with real-time spectrum visualizer
                  </p>
                </div>
                {onOpenMusic && (
                  <button
                    onClick={() => {
                      onOpenMusic();
                      onClose();
                    }}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-cyan-500 text-white text-xs font-bold shadow-md shadow-emerald-600/30 cursor-pointer"
                  >
                    Launch 3D Cover Flow
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {FEATURED_MUSIC_TRACKS.map((track) => (
                  <div
                    key={track.id}
                    onClick={() => {
                      openMedia(track.url, track.title);
                      if (onOpenMusic) onOpenMusic();
                      onClose();
                    }}
                    className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/10 hover:border-emerald-400/50 hover:bg-white/10 transition-all cursor-pointer group shadow-lg"
                  >
                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-black/60 shrink-0 border border-white/10">
                      <img src={track.albumArt} alt={track.title} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex flex-col min-w-0 flex-1">
                      <span className="text-xs font-bold text-white group-hover:text-emerald-300 transition-colors truncate">
                        {track.title}
                      </span>
                      <span className="text-[11px] text-white/50 truncate">{track.artist}</span>
                      <span className="text-[10px] font-mono text-cyan-400 mt-1">
                        {Math.floor(track.durationSec / 60)}:
                        {(track.durationSec % 60).toString().padStart(2, '0')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* TAB: HISTORY & CONTINUE WATCHING                             */}
          {/* ============================================================ */}
          {activeTab === 'history' && (
            <div className="flex flex-col gap-4">
              <h2 className="text-lg font-bold text-white">Playback History & Resume Points</h2>
              {filteredRecents.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {filteredRecents.map((item: MediaHistoryItem) => (
                    <div
                      key={item.uri}
                      onClick={() => {
                        openMedia(item.uri, item.title, true, item.lastPositionMs);
                        onClose();
                      }}
                      className="flex flex-col rounded-2xl overflow-hidden bg-white/5 border border-white/10 hover:border-cyan-400/50 hover:bg-white/10 transition-all cursor-pointer group shadow-lg"
                    >
                      <div className="relative aspect-video w-full bg-black/60">
                        {item.thumbnailUri ? (
                          <img src={item.thumbnailUri} alt={item.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-slate-900 text-white/30">
                            <Film className="w-8 h-8" />
                          </div>
                        )}
                        <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-white/20">
                          <div
                            className="h-full bg-gradient-to-r from-cyan-400 to-rose-500"
                            style={{ width: `${Math.min(100, Math.max(5, item.progressPercent))}%` }}
                          />
                        </div>
                      </div>
                      <div className="p-3 flex flex-col gap-1">
                        <span className="text-xs font-bold text-white truncate group-hover:text-cyan-300">
                          {item.title}
                        </span>
                        <span className="text-[10px] text-white/50">{item.progressPercent}% viewed</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 rounded-2xl bg-white/5 border border-white/10 text-center text-xs text-white/40">
                  No playback history recorded yet.
                </div>
              )}
            </div>
          )}

          {/* ============================================================ */}
          {/* TAB: BOOKMARKS                                               */}
          {/* ============================================================ */}
          {activeTab === 'bookmarks' && (
            <div className="flex flex-col gap-6">
              {bookmarkedWebsites && bookmarkedWebsites.length > 0 && (
                <div className="flex flex-col gap-3">
                  <h2 className="text-base font-bold text-white">Bookmarked Streaming Sites</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {bookmarkedWebsites.map((site) => (
                      <div
                        key={site.id}
                        onClick={() => {
                          if (onOpenWebBrowser) {
                            onOpenWebBrowser(site.url);
                            onClose();
                          }
                        }}
                        className="p-3 rounded-2xl bg-white/5 border border-white/10 hover:border-amber-400/50 hover:bg-white/10 transition-all cursor-pointer group shadow-lg flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2.5 truncate">
                          {site.faviconUrl ? (
                            <img src={site.faviconUrl} alt="" className="w-5 h-5 rounded" />
                          ) : (
                            <Bookmark className="w-4 h-4 text-amber-400 shrink-0" />
                          )}
                          <span className="text-xs font-bold text-white group-hover:text-amber-300 truncate">
                            {site.title}
                          </span>
                        </div>
                        <ExternalLink className="w-3.5 h-3.5 text-white/40 group-hover:text-amber-400 shrink-0" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex flex-col gap-3">
                <h2 className="text-base font-bold text-white">Saved Timestamps & Scenes</h2>
                {bookmarks && bookmarks.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {bookmarks.map((bm) => (
                      <div
                        key={bm.id}
                        onClick={() => {
                          openMedia(bm.mediaId, bm.label, true, bm.timestampMs);
                          onClose();
                        }}
                        className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-amber-400/50 hover:bg-white/10 transition-all cursor-pointer group shadow-lg flex flex-col justify-between"
                      >
                        <span className="text-xs font-bold text-white group-hover:text-amber-300 truncate">
                          {bm.label || bm.mediaId}
                        </span>
                        <span className="text-[10px] font-mono text-cyan-400 mt-2">
                          Timestamp: {Math.floor(bm.timestampMs / 60000)}:
                          {Math.floor((bm.timestampMs % 60000) / 1000).toString().padStart(2, '0')}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 rounded-2xl bg-white/5 border border-white/10 text-center text-xs text-white/40">
                    No timestamp bookmarks saved yet. Use the bookmark icon in the video player controls to save scenes!
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
