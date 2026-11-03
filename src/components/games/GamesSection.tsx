import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { GAMES_CATALOG, GameItem } from '../../utils/gamesCatalog';
import {
  Play,
  RotateCcw,
  Maximize,
  Minimize,
  Sparkles,
  MousePointer,
  Search,
  Filter,
} from 'lucide-react';

interface GamesSectionProps {
  onClose?: () => void;
  onOpenGames?: (gameId?: string) => void;
}

const CATEGORIES = ['All', 'Arcade', 'Retro', 'Classic', 'Puzzle', 'Action', 'Sports'];

export const GamesSection: React.FC<GamesSectionProps> = ({ onClose: _onClose, onOpenGames }) => {
  const [selectedGame, setSelectedGame] = useState<GameItem>(GAMES_CATALOG[0]);
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [activeKeys, setActiveKeys] = useState<{ [key: string]: boolean }>({});
  const [mouseActivity, setMouseActivity] = useState<boolean>(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseTimeoutRef = useRef<any>(null);

  const filteredGames = useMemo(() => {
    return GAMES_CATALOG.filter((game) => {
      const matchesCat = activeCategory === 'All' || game.category.toLowerCase() === activeCategory.toLowerCase();
      const matchesSearch =
        searchQuery.trim() === '' ||
        game.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        game.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCat && matchesSearch;
    });
  }, [activeCategory, searchQuery]);

  // Keyboard input detector & event capturer to prevent global hotkeys while gaming
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
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
      'Escape',
    ];

    if (trackedKeys.includes(key)) {
      setActiveKeys((prev) => ({ ...prev, [key]: true }));
      // Stop event from triggering player pause / seek
      e.stopPropagation();
    }
  }, []);

  const handleKeyUp = useCallback((e: KeyboardEvent) => {
    const key = e.code;
    setActiveKeys((prev) => ({ ...prev, [key]: false }));
    e.stopPropagation();
  }, []);

  const handleMouseMove = useCallback(() => {
    setMouseActivity(true);
    if (mouseTimeoutRef.current) clearTimeout(mouseTimeoutRef.current);
    mouseTimeoutRef.current = setTimeout(() => {
      setMouseActivity(false);
    }, 1500);
  }, []);

  useEffect(() => {
    if (isPlaying) {
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
  }, [isPlaying, handleKeyDown, handleKeyUp, handleMouseMove]);

  const handleReloadGame = () => {
    if (iframeRef.current) {
      iframeRef.current.src = selectedGame.url;
    }
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

  return (
    <div
      ref={containerRef}
      className={`flex flex-col gap-4 w-full h-full ${
        isFullscreen ? 'fixed inset-0 z-50 bg-black p-4' : ''
      }`}
    >
      {/* Top Controller Bar */}
      <div className="flex items-center justify-between gap-3 p-3 rounded-2xl bg-white/5 border border-white/10">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-purple-500/20 border border-purple-500/30 text-purple-400">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white flex items-center gap-2">
              <span>{selectedGame.title}</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-lg bg-black/60 border border-white/10 text-cyan-300">
                {selectedGame.category}
              </span>
            </h3>
            <p className="text-[11px] text-slate-300">{selectedGame.controlsHint}</p>
          </div>
        </div>

        {/* Live Input Indicator HUD */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-xl bg-black/50 border border-white/10 text-[10px] font-mono">
            <span
              className={`px-1.5 py-0.5 rounded ${
                activeKeys['KeyW'] || activeKeys['ArrowUp']
                  ? 'bg-emerald-500 text-black font-bold'
                  : 'text-white/40'
              }`}
            >
              W/↑
            </span>
            <span
              className={`px-1.5 py-0.5 rounded ${
                activeKeys['KeyA'] || activeKeys['ArrowLeft']
                  ? 'bg-emerald-500 text-black font-bold'
                  : 'text-white/40'
              }`}
            >
              A/←
            </span>
            <span
              className={`px-1.5 py-0.5 rounded ${
                activeKeys['KeyS'] || activeKeys['ArrowDown']
                  ? 'bg-emerald-500 text-black font-bold'
                  : 'text-white/40'
              }`}
            >
              S/↓
            </span>
            <span
              className={`px-1.5 py-0.5 rounded ${
                activeKeys['KeyD'] || activeKeys['ArrowRight']
                  ? 'bg-emerald-500 text-black font-bold'
                  : 'text-white/40'
              }`}
            >
              D/→
            </span>
            <span
              className={`px-1.5 py-0.5 rounded ${
                activeKeys['Space'] ? 'bg-cyan-400 text-black font-bold' : 'text-white/40'
              }`}
            >
              SPACE
            </span>
            <span
              className={`px-1.5 py-0.5 rounded flex items-center gap-1 ${
                mouseActivity ? 'bg-amber-400 text-black font-bold' : 'text-white/40'
              }`}
            >
              <MousePointer className="w-2.5 h-2.5" />
              <span>MOUSE</span>
            </span>
          </div>

          <button
            onClick={handleReloadGame}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-colors"
            title="Reload Game"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={handleToggleFullscreen}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-colors"
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen Game'}
          >
            {isFullscreen ? (
              <Minimize className="w-3.5 h-3.5" />
            ) : (
              <Maximize className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      </div>

      {/* Game Playing Frame or Selection Grid */}
      {isPlaying ? (
        <div className="relative flex-1 w-full min-h-[460px] rounded-2xl overflow-hidden border border-white/10 bg-black shadow-2xl">
          <iframe
            ref={iframeRef}
            srcDoc={selectedGame.srcDoc}
            src={!selectedGame.srcDoc ? selectedGame.url : undefined}
            title={selectedGame.title}
            className="w-full h-full min-h-[460px] border-0"
            allow="autoplay; fullscreen; gamepad; focus-without-user-activation *"
            sandbox={
              selectedGame.srcDoc
                ? 'allow-scripts allow-pointer-lock allow-forms'
                : 'allow-scripts allow-forms allow-pointer-lock allow-popups'
            }
            tabIndex={0}
          />
          <button
            onClick={() => setIsPlaying(false)}
            className="absolute top-3 right-3 px-3 py-1.5 rounded-xl bg-black/80 hover:bg-black text-white text-xs font-semibold border border-white/20 backdrop-blur-md transition-all shadow-lg"
          >
            Switch Game
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-3.5">
          {/* Category Filters & Quick Search */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white/5 p-3 rounded-2xl border border-white/10">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
              <span className="text-[11px] text-white/40 font-semibold mr-1 flex items-center gap-1 shrink-0">
                <Filter className="w-3 h-3 text-purple-400" />
                Category:
              </span>
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-3 py-1 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                    activeCategory === cat
                      ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                      : 'bg-white/5 text-white/60 hover:text-white hover:bg-white/10 border border-white/5'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="relative min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/40" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search games..."
                className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-black/40 border border-white/10 text-xs text-white placeholder-white/30 focus:outline-none focus:border-purple-400 transition-all"
              />
            </div>
          </div>

          {/* Grid of Games */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5 overflow-y-auto max-h-[460px] pr-1 scrollbar-thin">
            {filteredGames.map((game) => (
              <div
                key={game.id}
                onClick={() => {
                  if (onOpenGames) {
                    if (_onClose) _onClose();
                    onOpenGames(game.id);
                  } else {
                    setSelectedGame(game);
                    setIsPlaying(true);
                  }
                }}
                className="p-3.5 rounded-2xl bg-white/5 border border-white/10 hover:border-purple-400/50 hover:bg-white/10 cursor-pointer transition-all flex flex-col justify-between gap-3 group shadow-md"
              >
                <div className="relative aspect-video rounded-xl overflow-hidden bg-black/40 border border-white/10">
                  <img
                    src={game.thumbnail}
                    alt={game.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-purple-600/90 text-white font-bold text-[10px] shadow">
                    {game.badge}
                  </div>
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="p-2.5 rounded-xl bg-purple-600 text-white shadow-lg">
                      <Play className="w-5 h-5 fill-white" />
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <h4 className="text-xs font-bold text-white group-hover:text-purple-300 transition-colors">
                    {game.title}
                  </h4>
                  <p className="text-[11px] text-slate-300 line-clamp-2 leading-relaxed">
                    {game.description}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-white/10 text-[10px] text-slate-400">
                  <span>{game.controlsHint}</span>
                  <span className="text-purple-400 font-bold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                    Play Now →
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
