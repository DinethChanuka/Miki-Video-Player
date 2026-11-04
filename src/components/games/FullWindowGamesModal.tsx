import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { GAMES_CATALOG, GameItem, GameCategory } from '../../utils/gamesCatalog.ts';
import {
  ArrowLeft,
  RotateCcw,
  Maximize,
  Minimize,
  Gamepad2,
  Search,
  X,
  Play,
  MousePointer,
  Sliders,
  AlertCircle,
  ExternalLink,
  Star,
  Clock,
} from 'lucide-react';

interface FullWindowGamesModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialGameId?: string;
}

const CATEGORIES: ('All' | 'Favorites' | 'Recent' | GameCategory)[] = [
  'All',
  'Favorites',
  'Recent',
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
  const [isPlayingGame, setIsPlayingGame] = useState<boolean>(() => Boolean(initialGameId));
  const [selectedGame, setSelectedGame] = useState<GameItem>(() => {
    if (initialGameId) {
      const match = GAMES_CATALOG.find((g) => g.id === initialGameId);
      if (match) return match;
    }
    return GAMES_CATALOG[0];
  });

  const [previewGame, setPreviewGame] = useState<GameItem>(() => {
    if (initialGameId) {
      const match = GAMES_CATALOG.find((g) => g.id === initialGameId);
      if (match) return match;
    }
    return GAMES_CATALOG[0];
  });

  const [activeCategory, setActiveCategory] = useState<'All' | 'Favorites' | 'Recent' | GameCategory>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [gameMode, setGameMode] = useState<'level' | 'infinity'>('infinity');
  const [selectedLevel, setSelectedLevel] = useState<number>(1);
  const [activeKeys, setActiveKeys] = useState<{ [key: string]: boolean }>({});
  const [mouseActive, setMouseActive] = useState<boolean>(false);
  const [gameKey, setGameKey] = useState<number>(0);
  const [iframeError, setIframeError] = useState<boolean>(false);
  const [isLoadingIframe, setIsLoadingIframe] = useState<boolean>(false);

  // Favorite games state persisted in localStorage
  const [favoriteGameIds, setFavoriteGameIds] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem('miki_favorite_games');
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  // Recently played games state persisted in localStorage
  const [recentGameIds, setRecentGameIds] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem('miki_recent_games');
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  // Native Gamepad API connection status
  const [isGamepadConnected, setIsGamepadConnected] = useState<boolean>(() => {
    if (typeof navigator !== 'undefined' && navigator.getGamepads) {
      return Array.from(navigator.getGamepads()).some((gp) => gp !== null);
    }
    return false;
  });

  useEffect(() => {
    const onConnect = () => setIsGamepadConnected(true);
    const onDisconnect = () => {
      if (typeof navigator !== 'undefined' && navigator.getGamepads) {
        setIsGamepadConnected(Array.from(navigator.getGamepads()).some((gp) => gp !== null));
      } else {
        setIsGamepadConnected(false);
      }
    };
    window.addEventListener('gamepadconnected', onConnect);
    window.addEventListener('gamepaddisconnected', onDisconnect);
    return () => {
      window.removeEventListener('gamepadconnected', onConnect);
      window.removeEventListener('gamepaddisconnected', onDisconnect);
    };
  }, []);

  const handleToggleFavorite = (gameId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setFavoriteGameIds((prev) => {
      const next = prev.includes(gameId) ? prev.filter((id) => id !== gameId) : [...prev, gameId];
      try {
        localStorage.setItem('miki_favorite_games', JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const containerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const mouseTimeoutRef = useRef<any>(null);

  // Monitor loading timeout for external non-srcDoc games (Generous 15s timeout for heavy WebGL assets)
  useEffect(() => {
    setIframeError(false);
    if (isPlayingGame && !selectedGame.srcDoc) {
      setIsLoadingIframe(true);
      const timer = setTimeout(() => {
        setIsLoadingIframe(false);
        setIframeError(true);
      }, 15000);
      return () => clearTimeout(timer);
    } else {
      setIsLoadingIframe(false);
    }
  }, [isPlayingGame, selectedGame.id, gameKey, selectedGame.srcDoc]);

  // Update initial game if prop changes
  useEffect(() => {
    if (initialGameId) {
      const match = GAMES_CATALOG.find((g) => g.id === initialGameId);
      if (match) {
        setSelectedGame(match);
        setPreviewGame(match);
        setIsPlayingGame(true);
      }
    } else {
      setIsPlayingGame(false);
    }
  }, [initialGameId]);

  // Category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {
      All: GAMES_CATALOG.length,
      Favorites: favoriteGameIds.length,
      Recent: recentGameIds.length,
    };
    for (const g of GAMES_CATALOG) {
      counts[g.category] = (counts[g.category] || 0) + 1;
    }
    return counts;
  }, [favoriteGameIds.length, recentGameIds.length]);

  // Filtered games
  const filteredGames = useMemo(() => {
    return GAMES_CATALOG.filter((game) => {
      const matchesCategory =
        activeCategory === 'All'
          ? true
          : activeCategory === 'Favorites'
          ? favoriteGameIds.includes(game.id)
          : activeCategory === 'Recent'
          ? recentGameIds.includes(game.id)
          : game.category === activeCategory;
      const q = searchQuery.trim().toLowerCase();
      const matchesSearch =
        q === '' ||
        game.title.toLowerCase().includes(q) ||
        game.description.toLowerCase().includes(q) ||
        game.category.toLowerCase().includes(q) ||
        game.controlsHint.toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, searchQuery, favoriteGameIds, recentGameIds]);

  // Live Keyboard & Mouse HUD and key isolation from media player
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!isOpen || !isPlayingGame) return;
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
        // Forward key event to game iframe with safe origin resolution
        const targetOrigin = selectedGame.srcDoc ? '*' : (() => {
          try {
            return new URL(selectedGame.url).origin;
          } catch {
            return '*';
          }
        })();
        iframeRef.current?.contentWindow?.postMessage(
          { type: 'miki:game-input', action: 'down', key: e.key, code: e.code },
          targetOrigin
        );
        // Stop propagation so media player doesn't seek or pause
        e.stopPropagation();
      }
    },
    [isOpen, isPlayingGame, isFullscreen, selectedGame.srcDoc, selectedGame.url]
  );

  const handleKeyUp = useCallback(
    (e: KeyboardEvent) => {
      if (!isOpen || !isPlayingGame) return;
      const key = e.code;
      setActiveKeys((prev) => ({ ...prev, [key]: false }));
      const targetOrigin = selectedGame.srcDoc ? '*' : (() => {
        try {
          return new URL(selectedGame.url).origin;
        } catch {
          return '*';
        }
      })();
      iframeRef.current?.contentWindow?.postMessage(
        { type: 'miki:game-input', action: 'up', key: e.key, code: e.code },
        targetOrigin
      );
      e.stopPropagation();
    },
    [isOpen, isPlayingGame, selectedGame.srcDoc, selectedGame.url]
  );

  // Auto-focus game iframe on mount and game switch
  useEffect(() => {
    if (isOpen && isPlayingGame && iframeRef.current) {
      iframeRef.current?.focus();
    }
  }, [isOpen, isPlayingGame, selectedGame.id, gameKey]);

  // Synchronize bi-directional key activity reported from inside game iframe (Origin & sender verified)
  useEffect(() => {
    const handleMessage = (e: MessageEvent) => {
      if (iframeRef.current && e.source !== iframeRef.current.contentWindow) return;
      if (e.data && typeof e.data === 'object' && e.data.type === 'miki:key-activity') {
        if (typeof e.data.code === 'string') {
          setActiveKeys((prev) => ({ ...prev, [e.data.code]: Boolean(e.data.isDown) }));
        }
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const syncGameMode = useCallback((mode: 'level' | 'infinity', level: number) => {
    if (iframeRef.current && iframeRef.current.contentWindow) {
      try {
        const targetOrigin = selectedGame.srcDoc ? '*' : (() => {
          try {
            return new URL(selectedGame.url).origin;
          } catch {
            return '*';
          }
        })();
        iframeRef.current.contentWindow.postMessage(
          { type: 'miki:set-game-mode', mode, level },
          targetOrigin
        );
      } catch (err) {}
    }
  }, [selectedGame.srcDoc, selectedGame.url]);

  const handleToggleInfinity = () => {
    const nextMode = gameMode === 'infinity' ? 'level' : 'infinity';
    setGameMode(nextMode);
    syncGameMode(nextMode, selectedLevel);
  };

  const handleSelectLevel = (lvl: number) => {
    setSelectedLevel(lvl);
    setGameMode('level');
    syncGameMode('level', lvl);
  };

  const handleMouseMove = useCallback(() => {
    if (!isOpen) return;
    setMouseActive(true);
    if (mouseTimeoutRef.current) clearTimeout(mouseTimeoutRef.current);
    mouseTimeoutRef.current = setTimeout(() => {
      setMouseActive(false);
    }, 1500);
  }, [isOpen]);

  const handleBlur = useCallback(() => {
    setActiveKeys({});
  }, []);

  useEffect(() => {
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown, true);
      window.addEventListener('keyup', handleKeyUp, true);
      window.addEventListener('mousemove', handleMouseMove, true);
      window.addEventListener('blur', handleBlur);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown, true);
      window.removeEventListener('keyup', handleKeyUp, true);
      window.removeEventListener('mousemove', handleMouseMove, true);
      window.removeEventListener('blur', handleBlur);
      if (mouseTimeoutRef.current) clearTimeout(mouseTimeoutRef.current);
    };
  }, [isOpen, handleKeyDown, handleKeyUp, handleMouseMove, handleBlur]);

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

  const handleLaunchGame = (game: GameItem) => {
    setSelectedGame(game);
    setPreviewGame(game);
    setIsPlayingGame(true);
    setGameKey((k) => k + 1);

    // Persist to recently played games
    setRecentGameIds((prev) => {
      const next = [game.id, ...prev.filter((id) => id !== game.id)].slice(0, 15);
      try {
        localStorage.setItem('miki_recent_games', JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const handleOpenInBrowser = useCallback(
    (game: GameItem) => {
      let targetUrl = game.url;

      // For self-contained engines with srcDoc, generate an offline-ready Blob URL or data URI
      if (game.srcDoc) {
        try {
          const blob = new Blob([game.srcDoc], { type: 'text/html;charset=utf-8' });
          targetUrl = URL.createObjectURL(blob);
        } catch {
          targetUrl = `data:text/html;charset=utf-8,${encodeURIComponent(game.srcDoc)}`;
        }
      }

      // Eliminate any potential .local or invalid protocol that causes origin errors
      if (
        !targetUrl ||
        targetUrl.includes('.local') ||
        (!targetUrl.startsWith('http') &&
          !targetUrl.startsWith('blob:') &&
          !targetUrl.startsWith('data:'))
      ) {
        targetUrl = 'https://html5games.com';
      }

      try {
        if (
          typeof window !== 'undefined' &&
          (window as unknown as { webkit?: { messageHandlers?: { browserViewAction?: { postMessage: (msg: unknown) => void } } } }).webkit?.messageHandlers?.browserViewAction
        ) {
          (window as unknown as { webkit: { messageHandlers: { browserViewAction: { postMessage: (msg: unknown) => void } } } }).webkit.messageHandlers.browserViewAction.postMessage({
            action: 'open',
            url: targetUrl,
          });
          onClose();
        } else if (typeof window !== 'undefined') {
          window.open(targetUrl, '_blank', 'noopener,noreferrer');
        }
      } catch (err) {
        console.warn('Failed to launch external browser for game:', err);
      }
    },
    [onClose]
  );

  if (!isOpen) return null;

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 bg-[#06080d] text-white flex flex-col select-none overflow-hidden"
    >
      {/* SINGLE UNIFIED TOP HEADER BAR */}
      <header className="h-14 px-4 bg-[#0c101c]/95 border-b border-white/10 backdrop-blur-xl flex items-center justify-between gap-3 shrink-0 z-20">
        {/* Left: Navigation & Mode Context */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={isPlayingGame ? () => setIsPlayingGame(false) : onClose}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 text-white/80 hover:text-white transition-all text-xs font-semibold cursor-pointer"
            title={isPlayingGame ? 'Back to Games Gallery' : 'Return to Video Player'}
          >
            <ArrowLeft className="w-4 h-4 text-cyan-400" />
            <span className="hidden sm:inline">
              {isPlayingGame ? 'All Games' : 'Player'}
            </span>
          </button>

          <div className="h-5 w-px bg-white/10" />

          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-purple-600 to-cyan-500 flex items-center justify-center text-white shadow-md">
              <Gamepad2 className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xs font-bold text-white tracking-wide truncate max-w-[180px] sm:max-w-xs">
                  {isPlayingGame ? selectedGame.title : 'Miki Game Arcade'}
                </h1>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-purple-500/20 border border-purple-400/30 text-purple-300 hidden md:inline">
                  {isPlayingGame ? selectedGame.badge : `${GAMES_CATALOG.length} Titles`}
                </span>
                {isPlayingGame && selectedGame.isInbuilt && (
                  <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hidden lg:inline">
                    Offline Ready
                  </span>
                )}
              </div>
              <p className="text-[10px] text-white/50 truncate max-w-[200px] sm:max-w-sm hidden sm:block">
                {isPlayingGame
                  ? selectedGame.controlsHint
                  : 'Zero-latency HTML5 canvas and retro arcade games'}
              </p>
            </div>
          </div>
        </div>

        {/* Center: In-Game Live HUD & Level / Infinity Selector OR Single Gallery Search Input */}
        {isPlayingGame ? (
          <div className="flex items-center gap-2">
            {/* Level Selection (1-10) & Infinity Mode */}
            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-black/60 border border-white/10">
              <button
                type="button"
                onClick={handleToggleInfinity}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  gameMode === 'infinity'
                    ? 'bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 text-white shadow-md shadow-pink-500/40 ring-1 ring-white/30'
                    : 'bg-white/5 hover:bg-white/10 text-white/60 hover:text-white'
                }`}
                title="Toggle Endless Infinity Mode (∞)"
              >
                <span className="text-sm font-black">∞</span>
                <span className="hidden sm:inline">Infinity Mode</span>
              </button>

              <div className="flex items-center gap-1 pl-1 border-l border-white/10">
                <span className="text-[10px] text-white/50 uppercase font-mono hidden md:inline">
                  Level:
                </span>
                <select
                  value={selectedLevel}
                  onChange={(e) => handleSelectLevel(Number(e.target.value))}
                  className="bg-white/10 hover:bg-white/15 text-cyan-400 font-bold rounded-lg px-2 py-1 text-xs border border-white/10 focus:outline-none focus:ring-1 focus:ring-cyan-400 cursor-pointer"
                  title="Select Stage Level (1-10)"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((lvl) => (
                    <option key={lvl} value={lvl} className="bg-slate-900 text-white">
                      Level {lvl}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* In-Game Key HUD */}
            <div className="hidden xl:flex items-center gap-1.5 px-3 py-1 rounded-xl bg-black/60 border border-white/10 text-[10px] font-mono">
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
          </div>
        ) : (
          <div className="flex-1 max-w-md mx-2 hidden sm:block">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-cyan-400/70" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={`Search ${GAMES_CATALOG.length}+ games by title or category...`}
                className="w-full pl-9 pr-8 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-white/30 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/40 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white p-0.5 cursor-pointer"
                  title="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Right Actions */}
        <div className="flex items-center gap-2 shrink-0">
          {isGamepadConnected && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[10px] font-mono shadow-sm">
              <Gamepad2 className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              <span className="hidden sm:inline">GAMEPAD</span>
            </div>
          )}

          {isPlayingGame && (
            <button
              onClick={() => handleOpenInBrowser(selectedGame)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-400/30 text-cyan-300 text-xs font-semibold transition-all cursor-pointer"
              title="Open Game in Full Web Browser"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Open in Browser</span>
            </button>
          )}

          {isPlayingGame && (
            <button
              onClick={() => setIsPlayingGame(false)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-cyan-400/40 bg-cyan-500/20 text-cyan-300 text-xs font-semibold hover:bg-cyan-500/30 transition-all cursor-pointer"
            >
              <Gamepad2 className="w-3.5 h-3.5" />
              <span>Browse Games</span>
            </button>
          )}

          {isPlayingGame && (
            <button
              onClick={handleReload}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 text-white/70 hover:text-white transition-all cursor-pointer"
              title="Restart Game"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            onClick={handleToggleFullscreen}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 text-white/70 hover:text-white transition-all hidden sm:flex cursor-pointer"
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
            className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-300 transition-all ml-1 cursor-pointer"
            title="Exit Game Window"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* GALLERY MODE: CATEGORY FILTER BAR */}
      {!isPlayingGame && (
        <div className="px-4 py-2.5 bg-[#080c16]/95 border-b border-white/5 flex items-center justify-between gap-3 overflow-x-auto scrollbar-none shrink-0 z-10">
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-0.5">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeCategory === cat
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/25 border border-cyan-400/40'
                    : 'bg-white/5 text-white/60 hover:text-white hover:bg-white/10 border border-white/5'
                }`}
              >
                {cat === 'Favorites' && <Star className="w-3 h-3 text-amber-400 fill-amber-400" />}
                {cat === 'Recent' && <Clock className="w-3 h-3 text-cyan-400" />}
                <span>{cat}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    activeCategory === cat
                      ? 'bg-black/30 text-cyan-200'
                      : 'bg-white/10 text-white/40'
                  }`}
                >
                  {categoryCounts[cat] || 0}
                </span>
              </button>
            ))}
          </div>

          <div className="hidden sm:flex items-center gap-1.5 text-xs text-white/40 shrink-0 font-mono">
            <span className="text-cyan-400 font-bold">{filteredGames.length}</span>
            <span>titles available</span>
          </div>
        </div>
      )}

      {/* MAIN VIEWPORT BODY */}
      <div className="relative flex-1 w-full min-h-0 bg-[#03060a] overflow-hidden flex flex-col">
        {/* IN-GAME VIEWPORT */}
        {isPlayingGame ? (
          <div className="w-full h-full flex items-center justify-center bg-black relative">
            <iframe
              key={`${selectedGame.id}-${gameKey}`}
              ref={iframeRef}
              srcDoc={selectedGame.srcDoc}
              src={!selectedGame.srcDoc ? selectedGame.url : undefined}
              title={selectedGame.title}
              sandbox={
                selectedGame.srcDoc
                  ? 'allow-scripts allow-forms allow-pointer-lock'
                  : 'allow-scripts allow-same-origin allow-forms allow-pointer-lock allow-popups'
              }
              allow="fullscreen; autoplay; gamepad; focus-without-user-activation *"
              className="w-full h-full border-0 bg-black"
              onLoad={() => {
                setIsLoadingIframe(false);
                setIframeError(false);
                syncGameMode(gameMode, selectedLevel);
              }}
              onError={() => {
                setIsLoadingIframe(false);
                setIframeError(true);
              }}
            />

            {/* Loading Indicator for Remote Games */}
            {isLoadingIframe && !selectedGame.srcDoc && (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/75 backdrop-blur-sm gap-3 pointer-events-none">
                <div className="w-8 h-8 rounded-full border-2 border-purple-500 border-t-transparent animate-spin" />
                <span className="text-xs text-white/70 font-mono">
                  Loading {selectedGame.title}...
                </span>
              </div>
            )}

            {/* Graceful Fallback Card when embedding is restricted or fails */}
            {iframeError && !selectedGame.srcDoc && (
              <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/90 backdrop-blur-md p-6">
                <div className="max-w-md w-full p-6 rounded-3xl bg-slate-900 border border-purple-500/30 flex flex-col items-center text-center gap-4 shadow-2xl">
                  <div className="p-3 rounded-2xl bg-purple-500/20 text-purple-400">
                    <AlertCircle className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">
                      {selectedGame.title} Embedding Restricted
                    </h3>
                    <p className="text-xs text-white/60 mt-1.5 leading-relaxed">
                      This game server restricts third-party iframe embedding or is temporarily unreachable. You can launch it directly in the ad-shielded browser or enjoy an instant offline inbuilt title.
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full mt-2">
                    <button
                      onClick={() => {
                        const fallback =
                          GAMES_CATALOG.find((g) => g.isInbuilt && g.id === 'pacman') ||
                          GAMES_CATALOG[0];
                        setSelectedGame(fallback);
                        setPreviewGame(fallback);
                        setIframeError(false);
                        setGameKey((k) => k + 1);
                      }}
                      className="flex-1 w-full py-2.5 px-4 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition-all shadow-lg shadow-purple-600/30 flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Gamepad2 className="w-4 h-4" />
                      <span>Play Inbuilt Alternative</span>
                    </button>
                    <button
                      onClick={() => handleOpenInBrowser(selectedGame)}
                      className="flex-1 w-full py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/10 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <ExternalLink className="w-4 h-4 text-cyan-400" />
                      <span>Launch in Web Browser</span>
                    </button>
                  </div>
                  <button
                    onClick={() => {
                      setIframeError(false);
                      setGameKey((k) => k + 1);
                    }}
                    className="text-[11px] text-white/40 hover:text-white transition-colors cursor-pointer mt-1"
                  >
                    Retry Loading
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* GALLERY OVERVIEW: GAMES GRID + PREVIEW INSPECTOR */
          <div className="flex-1 min-h-0 overflow-hidden flex flex-col lg:flex-row gap-4 p-4 sm:p-5">
            {/* Left: Scrollable Games Grid */}
            <div className="flex-1 min-h-0 overflow-y-auto pr-1 scrollbar-thin">
              {filteredGames.length === 0 ? (
                <div className="h-full min-h-[300px] flex flex-col items-center justify-center text-center p-8 rounded-2xl bg-white/[0.02] border border-white/5">
                  <Gamepad2 className="w-12 h-12 text-white/20 mb-3" />
                  <h3 className="text-sm font-bold text-white">No games matched your search</h3>
                  <p className="text-xs text-white/50 mt-1 max-w-xs">
                    Try a different keyword or switch to "All" to browse all {GAMES_CATALOG.length} titles.
                  </p>
                  <button
                    onClick={() => {
                      setActiveCategory('All');
                      setSearchQuery('');
                    }}
                    className="mt-4 px-4 py-2 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 text-xs font-semibold hover:bg-cyan-500/30 transition-all cursor-pointer"
                  >
                    Reset Filters
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 auto-rows-max pb-4">
                  {filteredGames.map((game) => {
                    const isCurrent = game.id === selectedGame.id;
                    const isPreview = game.id === previewGame.id;
                    return (
                      <div
                        key={game.id}
                        onClick={() => setPreviewGame(game)}
                        onDoubleClick={() => handleLaunchGame(game)}
                        className={`group relative flex flex-col h-[235px] min-h-[230px] rounded-2xl overflow-hidden border cursor-pointer transition-all duration-200 transform hover:-translate-y-1 hover:shadow-xl ${
                          isPreview
                            ? 'bg-cyan-950/40 border-cyan-400 shadow-lg shadow-cyan-500/25 ring-1 ring-cyan-400'
                            : isCurrent && isPlayingGame
                            ? 'bg-purple-900/30 border-purple-500 shadow-md ring-1 ring-purple-500'
                            : 'bg-white/5 border-white/10 hover:border-cyan-500/50 hover:bg-white/10'
                        }`}
                      >
                        {/* Game Thumbnail with Real Visualized SVG Preview */}
                        <div className="relative h-28 w-full shrink-0 overflow-hidden bg-slate-900">
                          <img
                            src={game.thumbnail}
                            alt={game.title}
                            className="w-full h-full object-cover shrink-0 select-none transition-transform duration-300 group-hover:scale-105"
                            loading="lazy"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-black/30 pointer-events-none" />
                          <div className="absolute top-2 left-2 flex items-center gap-1.5 z-10">
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-md border border-white/10 text-cyan-300 font-semibold">
                              {game.category}
                            </span>
                            {game.isInbuilt && (
                              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/90 text-black">
                                INBUILT
                              </span>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={(e) => handleToggleFavorite(game.id, e)}
                            className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/60 hover:bg-black/90 backdrop-blur-md border border-white/10 text-white/50 hover:text-amber-400 transition-colors z-10 cursor-pointer"
                            title={favoriteGameIds.includes(game.id) ? 'Remove from favorites' : 'Add to favorites'}
                          >
                            <Star
                              className={`w-3.5 h-3.5 ${
                                favoriteGameIds.includes(game.id)
                                  ? 'fill-amber-400 text-amber-400'
                                  : 'text-white/60 hover:text-amber-300'
                              }`}
                            />
                          </button>
                          <div className="absolute bottom-2 right-2 p-1.5 rounded-lg bg-black/70 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity text-cyan-400 z-10">
                            <Play className="w-3.5 h-3.5 fill-current" />
                          </div>
                        </div>

                        {/* Game Info */}
                        <div className="p-3 flex flex-col flex-1 justify-between min-h-0 bg-slate-950/70">
                          <div className="min-h-0">
                            <h3 className="text-xs font-bold text-white truncate group-hover:text-cyan-300 transition-colors">
                              {game.title}
                            </h3>
                            <p className="text-[11px] text-white/50 line-clamp-2 mt-1 leading-snug">
                              {game.description}
                            </p>
                          </div>

                          <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[10px] text-white/40 shrink-0">
                            <span className="truncate max-w-[110px]" title={game.controlsHint}>
                              {game.controlsHint}
                            </span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleLaunchGame(game);
                              }}
                              className="px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer bg-gradient-to-r from-purple-600 to-cyan-500 text-white hover:brightness-110 shadow-sm"
                            >
                              <Play className="w-3 h-3 fill-current" />
                              <span>Play</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Right: Live Interactive Preview Inspector Panel */}
            <div className="w-full lg:w-80 shrink-0 bg-slate-900/95 border border-white/10 rounded-2xl p-4 flex flex-col justify-between gap-4 backdrop-blur-xl shadow-2xl overflow-y-auto min-h-0">
              <div className="flex flex-col gap-3 min-h-0">
                <div className="relative aspect-video w-full rounded-xl overflow-hidden border border-white/15 bg-black/80 shadow-md shrink-0">
                  <img
                    src={previewGame.thumbnail}
                    alt={previewGame.title}
                    className="w-full h-full object-cover select-none"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent flex items-end p-3 pointer-events-none">
                    <div>
                      <span className="text-[9px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-md bg-purple-600/90 text-white font-bold">
                        {previewGame.badge}
                      </span>
                      <h3 className="text-sm font-bold text-white mt-1">{previewGame.title}</h3>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
                    {previewGame.category}
                  </span>
                  {previewGame.isInbuilt && (
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      Zero-Latency Offline Canvas
                    </span>
                  )}
                </div>

                <p className="text-xs text-white/70 leading-relaxed overflow-y-auto max-h-24">
                  {previewGame.description}
                </p>

                {/* Keymap & Input Controls Box */}
                <div className="p-2.5 rounded-xl bg-black/60 border border-white/10 flex flex-col gap-1.5 shrink-0">
                  <span className="text-[10px] font-bold text-white/50 uppercase tracking-wider flex items-center gap-1.5">
                    <Sliders className="w-3 h-3 text-cyan-400" />
                    Keymap & Input Controls
                  </span>
                  <span className="text-xs text-cyan-300 font-mono font-medium">
                    {previewGame.controlsHint}
                  </span>
                </div>
              </div>

              {/* Inspector Action Buttons */}
              <div className="flex flex-col gap-2 shrink-0 pt-2 border-t border-white/10">
                <button
                  onClick={() => handleLaunchGame(previewGame)}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 hover:brightness-110 active:scale-98 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-purple-600/30 transition-all cursor-pointer"
                >
                  <Play className="w-4 h-4 fill-white" />
                  <span>Launch Game in Viewport</span>
                </button>

                <button
                  type="button"
                  onClick={(e) => handleToggleFavorite(previewGame.id, e)}
                  className={`w-full py-2 rounded-xl border flex items-center justify-center gap-1.5 font-semibold text-xs transition-all cursor-pointer ${
                    favoriteGameIds.includes(previewGame.id)
                      ? 'bg-amber-500/20 border-amber-500/40 text-amber-300 hover:bg-amber-500/30'
                      : 'bg-white/5 hover:bg-white/10 border-white/10 text-white/80 hover:text-white'
                  }`}
                >
                  <Star
                    className={`w-3.5 h-3.5 ${
                      favoriteGameIds.includes(previewGame.id)
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-white/60'
                    }`}
                  />
                  <span>
                    {favoriteGameIds.includes(previewGame.id)
                      ? 'Starred in Favorites'
                      : 'Add to Favorites'}
                  </span>
                </button>

                {!previewGame.srcDoc && (
                  <button
                    onClick={() => {
                      if (
                        typeof window !== 'undefined' &&
                        (window as any).webkit?.messageHandlers?.browserViewAction
                      ) {
                        (window as any).webkit.messageHandlers.browserViewAction.postMessage({
                          action: 'open',
                          url: previewGame.url,
                        });
                        onClose();
                      } else {
                        window.open(previewGame.url, '_blank');
                      }
                    }}
                    className="w-full py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/80 hover:text-white font-semibold text-xs border border-white/10 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Open in Web Browser</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* FOOTER BAR: CONTROLS & STATUS SUMMARY */}
      <footer className="h-8 px-4 bg-[#0a0d17] border-t border-white/10 flex items-center justify-between text-[11px] text-white/50 shrink-0">
        <div className="flex items-center gap-4">
          <span className="text-white/70">
            {isPlayingGame ? (
              <>
                Playing: <strong className="text-white">{selectedGame.title}</strong>
              </>
            ) : (
              <>
                Previewing: <strong className="text-white">{previewGame.title}</strong>
              </>
            )}
          </span>
          <span className="hidden md:inline text-white/40">|</span>
          <span className="hidden md:inline text-white/60">
            Controls: {isPlayingGame ? selectedGame.controlsHint : previewGame.controlsHint}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden sm:inline text-white/40">Press Esc to exit fullscreen</span>
          <span className="text-cyan-400 font-medium">
            {filteredGames.length} of {GAMES_CATALOG.length} Available Games
          </span>
        </div>
      </footer>
    </div>
  );
};

export default FullWindowGamesModal;
