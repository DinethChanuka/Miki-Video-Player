import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { GAMES_CATALOG, GameItem, GameCategory } from '../../utils/gamesCatalog.ts';
import {
  ArrowLeft,
  RotateCcw,
  Maximize,
  Minimize,
  Sparkles,
  Gamepad2,
  Search,
  X,
  Play,
  MousePointer,
  Sliders,
} from 'lucide-react';

interface FullWindowGamesModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialGameId?: string;
}

const CATEGORIES: ('All' | GameCategory)[] = [
  'All',
  'Arcade',
  'Puzzle',
  'Retro',
  'Classic',
  'Action',
  'Sports',
  'Strategy',
  'Cards',
];

export const FullWindowGamesModal: React.FC<FullWindowGamesModalProps> = ({
  isOpen,
  onClose,
  initialGameId,
}) => {
  const [selectedGame, setSelectedGame] = useState<GameItem>(() => {
    if (initialGameId) {
      const match = GAMES_CATALOG.find((g) => g.id === initialGameId);
      if (match) return match;
    }
    return GAMES_CATALOG[0];
  });

  const [activeCategory, setActiveCategory] = useState<'All' | GameCategory>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isCatalogDrawerOpen, setIsCatalogDrawerOpen] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [activeKeys, setActiveKeys] = useState<{ [key: string]: boolean }>({});
  const [mouseActive, setMouseActive] = useState<boolean>(false);
  const [gameKey, setGameKey] = useState<number>(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const mouseTimeoutRef = useRef<any>(null);

  // Update initial game if prop changes
  useEffect(() => {
    if (initialGameId) {
      const match = GAMES_CATALOG.find((g) => g.id === initialGameId);
      if (match) setSelectedGame(match);
    }
  }, [initialGameId]);

  // Live Keyboard & Mouse HUD and key isolation from media player
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!isOpen) return;
      const key = e.code;
      const trackedKeys = [
        'ArrowUp',
        'ArrowDown',
        'ArrowLeft',
        'ArrowRight',
        'KeyW',
        'KeyA',
        'KeyS',
        'KeyD',
        'Space',
        'Enter',
      ];

      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
        return;
      }

      if (trackedKeys.includes(key)) {
        setActiveKeys((prev) => ({ ...prev, [key]: true }));
        // Stop propagation so media player doesn't seek or pause
        e.stopPropagation();
      }
    },
    [isOpen, isFullscreen]
  );

  const handleKeyUp = useCallback(
    (e: KeyboardEvent) => {
      if (!isOpen) return;
      const key = e.code;
      setActiveKeys((prev) => ({ ...prev, [key]: false }));
      e.stopPropagation();
    },
    [isOpen]
  );

  const handleMouseMove = useCallback(() => {
    if (!isOpen) return;
    setMouseActive(true);
    if (mouseTimeoutRef.current) clearTimeout(mouseTimeoutRef.current);
    mouseTimeoutRef.current = setTimeout(() => {
      setMouseActive(false);
    }, 1500);
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown, true);
      window.addEventListener('keyup', handleKeyUp, true);
      window.addEventListener('mousemove', handleMouseMove, true);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown, true);
      window.removeEventListener('keyup', handleKeyUp, true);
      window.removeEventListener('mousemove', handleMouseMove, true);
      if (mouseTimeoutRef.current) clearTimeout(mouseTimeoutRef.current);
    };
  }, [isOpen, handleKeyDown, handleKeyUp, handleMouseMove]);

  const handleReload = () => {
    setGameKey((k) => k + 1);
  };

  const handleToggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!isFullscreen) {
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen();
      }
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
      setIsFullscreen(false);
    }
  };

  const filteredGames = useMemo(() => {
    return GAMES_CATALOG.filter((game) => {
      const matchesCategory =
        activeCategory === 'All' || game.category === activeCategory;
      const matchesSearch =
        searchQuery.trim() === '' ||
        game.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        game.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        game.category.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, searchQuery]);

  if (!isOpen) return null;

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 bg-[#06080d] text-white flex flex-col select-none overflow-hidden"
    >
      {/* TOP HEADER CONTROLLER BAR */}
      <header className="h-14 px-4 bg-[#0c101c]/95 border-b border-white/10 backdrop-blur-xl flex items-center justify-between gap-3 shrink-0 z-20">
        {/* Left: Back button & Active Game Title */}
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 text-white/80 hover:text-white transition-all text-xs font-semibold"
            title="Return to Video Player"
          >
            <ArrowLeft className="w-4 h-4 text-cyan-400" />
            <span className="hidden sm:inline">Player</span>
          </button>

          <div className="h-5 w-px bg-white/10" />

          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Gamepad2 className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xs font-bold text-white tracking-wide truncate max-w-[180px] sm:max-w-xs">
                  {selectedGame.title}
                </h1>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-purple-500/20 border border-purple-400/30 text-purple-300 hidden md:inline">
                  {selectedGame.badge}
                </span>
                {selectedGame.isInbuilt && (
                  <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hidden lg:inline">
                    Offline Ready
                  </span>
                )}
              </div>
              <p className="text-[10px] text-white/50 truncate max-w-[200px] sm:max-w-sm hidden sm:block">
                {selectedGame.controlsHint}
              </p>
            </div>
          </div>
        </div>

        {/* Center: Live Keyboard / Mouse HUD */}
        <div className="hidden lg:flex items-center gap-1.5 px-3 py-1 rounded-xl bg-black/60 border border-white/10 text-[10px] font-mono">
          <Sliders className="w-3.5 h-3.5 text-white/40 mr-1" />
          <span
            className={`px-1.5 py-0.5 rounded transition-colors ${
              activeKeys['KeyW'] || activeKeys['ArrowUp']
                ? 'bg-emerald-500 text-black font-bold shadow-sm shadow-emerald-500/50'
                : 'text-white/40'
            }`}
          >
            W/↑
          </span>
          <span
            className={`px-1.5 py-0.5 rounded transition-colors ${
              activeKeys['KeyA'] || activeKeys['ArrowLeft']
                ? 'bg-emerald-500 text-black font-bold shadow-sm shadow-emerald-500/50'
                : 'text-white/40'
            }`}
          >
            A/←
          </span>
          <span
            className={`px-1.5 py-0.5 rounded transition-colors ${
              activeKeys['KeyS'] || activeKeys['ArrowDown']
                ? 'bg-emerald-500 text-black font-bold shadow-sm shadow-emerald-500/50'
                : 'text-white/40'
            }`}
          >
            S/↓
          </span>
          <span
            className={`px-1.5 py-0.5 rounded transition-colors ${
              activeKeys['KeyD'] || activeKeys['ArrowRight']
                ? 'bg-emerald-500 text-black font-bold shadow-sm shadow-emerald-500/50'
                : 'text-white/40'
            }`}
          >
            D/→
          </span>
          <span
            className={`px-2 py-0.5 rounded transition-colors ${
              activeKeys['Space']
                ? 'bg-emerald-500 text-black font-bold shadow-sm shadow-emerald-500/50'
                : 'text-white/40'
            }`}
          >
            SPACE
          </span>
          <div className="h-3 w-px bg-white/20 mx-1" />
          <MousePointer
            className={`w-3.5 h-3.5 transition-colors ${
              mouseActive ? 'text-cyan-400 animate-pulse' : 'text-white/30'
            }`}
          />
        </div>

        {/* Right Actions: Catalog Drawer Toggle, Reload, Fullscreen, Close */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsCatalogDrawerOpen((prev) => !prev)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition-all text-xs font-semibold ${
              isCatalogDrawerOpen
                ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                : 'bg-white/5 border-white/10 text-white/80 hover:bg-white/10 hover:text-white'
            }`}
          >
            <Sliders className="w-3.5 h-3.5 text-cyan-400" />
            <span>Games ({GAMES_CATALOG.length})</span>
          </button>

          <button
            onClick={handleReload}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 text-white/70 hover:text-white transition-all"
            title="Restart Game"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={handleToggleFullscreen}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 text-white/70 hover:text-white transition-all hidden sm:flex"
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
          >
            {isFullscreen ? (
              <Minimize className="w-3.5 h-3.5" />
            ) : (
              <Maximize className="w-3.5 h-3.5" />
            )}
          </button>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-300 transition-all ml-1"
            title="Exit Game Window"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* MAIN VIEWPORT BODY */}
      <div className="relative flex-1 w-full h-full bg-[#03060a] overflow-hidden">
        {/* GAME IFRAME VIEWPORT */}
        <div className="w-full h-full flex items-center justify-center bg-black">
          <iframe
            key={`${selectedGame.id}-${gameKey}`}
            ref={iframeRef}
            srcDoc={selectedGame.srcDoc}
            src={!selectedGame.srcDoc ? selectedGame.url : undefined}
            title={selectedGame.title}
            sandbox={
              selectedGame.srcDoc
                ? 'allow-scripts allow-pointer-lock allow-forms'
                : 'allow-scripts allow-forms allow-pointer-lock allow-popups'
            }
            allow="fullscreen; autoplay"
            className="w-full h-full border-0 bg-black"
          />
        </div>

        {/* 50+ GAMES DRAWER / SELECTOR OVERLAY */}
        {isCatalogDrawerOpen && (
          <div className="absolute inset-0 z-30 bg-black/85 backdrop-blur-2xl flex flex-col p-4 sm:p-6 animate-fadeIn">
            {/* Drawer Header */}
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 to-cyan-500 flex items-center justify-center text-white shadow-lg">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white flex items-center gap-2">
                    <span>Miki Game Arcade</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
                      50+ Titles
                    </span>
                  </h2>
                  <p className="text-xs text-white/50">
                    High-performance zero-latency HTML5 canvas and retro games
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsCatalogDrawerOpen(false)}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Filter Bar: Categories + Search */}
            <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between py-4">
              {/* Category Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                      activeCategory === cat
                        ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/20'
                        : 'bg-white/5 text-white/60 hover:text-white hover:bg-white/10 border border-white/5'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Search Bar */}
              <div className="relative min-w-[220px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search 50+ games..."
                  className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-white/30 focus:outline-none focus:border-cyan-400 transition-all"
                />
              </div>
            </div>

            {/* Games Grid */}
            <div className="flex-1 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3.5 pr-1 scrollbar-thin">
              {filteredGames.map((game) => {
                const isCurrent = game.id === selectedGame.id;
                return (
                  <div
                    key={game.id}
                    onClick={() => {
                      setSelectedGame(game);
                      setIsCatalogDrawerOpen(false);
                      setGameKey((k) => k + 1);
                    }}
                    className={`group relative flex flex-col rounded-2xl overflow-hidden border cursor-pointer transition-all duration-200 transform hover:-translate-y-1 hover:shadow-xl ${
                      isCurrent
                        ? 'bg-purple-900/30 border-purple-500 shadow-lg shadow-purple-500/20 ring-1 ring-purple-500'
                        : 'bg-white/5 border-white/10 hover:border-cyan-500/50 hover:bg-white/10'
                    }`}
                  >
                    {/* Game Thumbnail */}
                    <div className="relative h-28 w-full overflow-hidden bg-black/40">
                      <img
                        src={game.thumbnail}
                        alt={game.title}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />
                      <div className="absolute top-2 left-2 flex items-center gap-1">
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-md border border-white/10 text-cyan-300">
                          {game.category}
                        </span>
                        {game.isInbuilt && (
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/80 text-black">
                            INBUILT
                          </span>
                        )}
                      </div>
                      <div className="absolute bottom-2 right-2 p-1.5 rounded-lg bg-black/60 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity text-cyan-400">
                        <Play className="w-3.5 h-3.5 fill-current" />
                      </div>
                    </div>

                    {/* Game Info */}
                    <div className="p-3 flex flex-col flex-1 justify-between gap-2">
                      <div>
                        <h3 className="text-xs font-bold text-white line-clamp-1 group-hover:text-cyan-300 transition-colors">
                          {game.title}
                        </h3>
                        <p className="text-[11px] text-white/50 line-clamp-2 mt-1 leading-snug">
                          {game.description}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[10px] text-white/40">
                        <span className="truncate max-w-[120px]">{game.controlsHint}</span>
                        {isCurrent ? (
                          <span className="text-purple-400 font-bold">PLAYING</span>
                        ) : (
                          <span className="text-cyan-400 font-semibold group-hover:underline">
                            Launch →
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* FOOTER BAR: CONTROLS & HUD SUMMARY */}
      <footer className="h-8 px-4 bg-[#0a0d17] border-t border-white/10 flex items-center justify-between text-[11px] text-white/50 shrink-0">
        <div className="flex items-center gap-4">
          <span className="text-white/70">
            Current: <strong className="text-white">{selectedGame.title}</strong>
          </span>
          <span className="hidden md:inline text-white/40">|</span>
          <span className="hidden md:inline text-white/60">
            Controls: {selectedGame.controlsHint}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden sm:inline text-white/40">Press Esc to exit fullscreen</span>
          <span className="text-cyan-400">54+ Available Games</span>
        </div>
      </footer>
    </div>
  );
};

export default FullWindowGamesModal;
