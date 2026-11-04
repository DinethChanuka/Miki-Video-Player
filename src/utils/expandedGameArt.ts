/**
 * Dedicated Vector SVG Artwork for Expanded Inbuilt & Web Games
 * Provides authentic, high-resolution visual previews for all games.
 */

export function getExpandedGameArtSvg(gameId: string): string | null {
  // 1. Check if it's one of the 100 Web Arcade Titles
  if (gameId.startsWith('web-arcade-title-')) {
    const num = parseInt(gameId.replace('web-arcade-title-', ''), 10) || 1;
    const categories = ['Arcade', 'Puzzle', 'Sports', 'Retro', 'Classic', 'Action', 'Strategy', 'Cards'];
    const cat = categories[(num - 1) % categories.length];
    return getCategoryWebArtSvg(gameId, num, cat);
  }

  // 2. Specific handcrafted SVG artwork for the 50 new Inbuilt Games
  switch (gameId) {
    case 'neon-invaders-dx':
      return `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 180" width="100%" height="100%">
          <rect width="320" height="180" fill="#090a0f"/>
          <!-- Starfield -->
          <circle cx="20" cy="25" r="1.5" fill="#fff" opacity="0.8"/>
          <circle cx="110" cy="15" r="1" fill="#fff" opacity="0.5"/>
          <circle cx="220" cy="30" r="1.5" fill="#fff" opacity="0.9"/>
          <circle cx="290" cy="70" r="1" fill="#fff" opacity="0.4"/>
          <!-- Alien Wave -->
          <g fill="#06b6d4">
            <rect x="70" y="30" width="24" height="16" rx="3"/>
            <rect x="110" y="30" width="24" height="16" rx="3"/>
            <rect x="150" y="30" width="24" height="16" rx="3"/>
            <rect x="190" y="30" width="24" height="16" rx="3"/>
            <rect x="230" y="30" width="24" height="16" rx="3"/>
          </g>
          <g fill="#ec4899">
            <rect x="80" y="55" width="24" height="16" rx="3"/>
            <rect x="120" y="55" width="24" height="16" rx="3"/>
            <rect x="160" y="55" width="24" height="16" rx="3"/>
            <rect x="200" y="55" width="24" height="16" rx="3"/>
          </g>
          <!-- Player Cannon -->
          <polygon points="160,135 150,155 170,155" fill="#10b981"/>
          <!-- Laser Beam -->
          <line x1="160" y1="130" x2="160" y2="75" stroke="#a7f3d0" stroke-width="3" stroke-linecap="round"/>
          <text x="160" y="172" font-family="system-ui, sans-serif" font-size="11" font-weight="900" fill="#38bdf8" text-anchor="middle" letter-spacing="1">NEON SPACE INVADERS DX</text>
        </svg>
      `;

    case 'space-shooter-2d':
      return `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 180" width="100%" height="100%">
          <rect width="320" height="180" fill="#030712"/>
          <circle cx="160" cy="50" r="28" fill="#3b82f6" opacity="0.2"/>
          <!-- Enemy ship -->
          <polygon points="160,65 140,35 180,35" fill="#ef4444"/>
          <!-- Lasers -->
          <line x1="148" y1="100" x2="148" y2="70" stroke="#f43f5e" stroke-width="2"/>
          <line x1="172" y1="100" x2="172" y2="70" stroke="#f43f5e" stroke-width="2"/>
          <!-- Player Fighter -->
          <polygon points="160,105 140,145 180,145" fill="#0ea5e9"/>
          <polygon points="160,115 150,145 170,145" fill="#38bdf8"/>
          <!-- Engine flame -->
          <polygon points="160,155 155,145 165,145" fill="#f59e0b"/>
          <text x="160" y="172" font-family="system-ui, sans-serif" font-size="11" font-weight="900" fill="#38bdf8" text-anchor="middle">GALACTIC STARFIGHTER 2D</text>
        </svg>
      `;

    case 'brick-breaker-neo':
      return `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 180" width="100%" height="100%">
          <rect width="320" height="180" fill="#0f172a"/>
          <!-- Brick Rows -->
          <rect x="40" y="25" width="40" height="14" rx="2" fill="#ef4444"/>
          <rect x="85" y="25" width="40" height="14" rx="2" fill="#f97316"/>
          <rect x="130" y="25" width="40" height="14" rx="2" fill="#eab308"/>
          <rect x="175" y="25" width="40" height="14" rx="2" fill="#10b981"/>
          <rect x="220" y="25" width="40" height="14" rx="2" fill="#06b6d4"/>
          <rect x="62" y="45" width="40" height="14" rx="2" fill="#8b5cf6"/>
          <rect x="107" y="45" width="40" height="14" rx="2" fill="#ec4899"/>
          <rect x="152" y="45" width="40" height="14" rx="2" fill="#3b82f6"/>
          <rect x="197" y="45" width="40" height="14" rx="2" fill="#14b8a6"/>
          <!-- Ball & Trail -->
          <circle cx="140" cy="100" r="5" fill="#f8fafc"/>
          <line x1="140" y1="100" x2="130" y2="120" stroke="#38bdf8" stroke-width="2" opacity="0.6"/>
          <!-- Paddle -->
          <rect x="100" y="140" width="70" height="10" rx="5" fill="#38bdf8"/>
          <text x="160" y="172" font-family="system-ui, sans-serif" font-size="11" font-weight="900" fill="#e2e8f0" text-anchor="middle">NEON BRICK BUSTER PRO</text>
        </svg>
      `;

    case 'pipe-bird-fly':
      return `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 180" width="100%" height="100%">
          <rect width="320" height="180" fill="#1e1b4b"/>
          <!-- Glowing Pipes -->
          <rect x="180" y="0" width="36" height="60" fill="#22c55e" rx="4"/>
          <rect x="176" y="52" width="44" height="12" fill="#16a34a" rx="2"/>
          <rect x="180" y="115" width="36" height="65" fill="#22c55e" rx="4"/>
          <rect x="176" y="115" width="44" height="12" fill="#16a34a" rx="2"/>
          <!-- Bird -->
          <circle cx="100" cy="85" r="14" fill="#facc15"/>
          <circle cx="106" cy="81" r="3" fill="#0f172a"/>
          <polygon points="112,85 124,88 112,93" fill="#ea580c"/>
          <ellipse cx="94" cy="88" rx="8" ry="5" fill="#fef08a"/>
          <text x="160" y="172" font-family="system-ui, sans-serif" font-size="11" font-weight="900" fill="#fde047" text-anchor="middle">NEON FLAP FLIGHT</text>
        </svg>
      `;

    case 'snake-speed-run':
      return `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 180" width="100%" height="100%">
          <rect width="320" height="180" fill="#052e16"/>
          <!-- Grid lines -->
          <path d="M0 45H320M0 90H320M0 135H320M60 0V180M120 0V180M180 0V180M240 0V180" stroke="#064e3b" stroke-width="1"/>
          <!-- Snake Body -->
          <rect x="80" y="70" width="20" height="20" rx="4" fill="#22c55e"/>
          <rect x="105" y="70" width="20" height="20" rx="4" fill="#22c55e"/>
          <rect x="130" y="70" width="20" height="20" rx="4" fill="#4ade80"/>
          <rect x="130" y="95" width="20" height="20" rx="4" fill="#4ade80"/>
          <rect x="155" y="95" width="20" height="20" rx="4" fill="#86efac"/>
          <!-- Cyber Food -->
          <circle cx="210" cy="105" r="8" fill="#ef4444"/>
          <text x="160" y="172" font-family="system-ui, sans-serif" font-size="11" font-weight="900" fill="#4ade80" text-anchor="middle">CYBER SNAKE TURBO RUN</text>
        </svg>
      `;

    case 'color-switch-canvas':
      return `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 180" width="100%" height="100%">
          <rect width="320" height="180" fill="#18181b"/>
          <!-- Ring segments -->
          <circle cx="160" cy="80" r="45" fill="none" stroke="#e11d48" stroke-width="10" stroke-dasharray="70 220"/>
          <circle cx="160" cy="80" r="45" fill="none" stroke="#2563eb" stroke-width="10" stroke-dasharray="70 220" stroke-dashoffset="-70"/>
          <circle cx="160" cy="80" r="45" fill="none" stroke="#eab308" stroke-width="10" stroke-dasharray="70 220" stroke-dashoffset="-140"/>
          <circle cx="160" cy="80" r="45" fill="none" stroke="#9333ea" stroke-width="10" stroke-dasharray="70 220" stroke-dashoffset="-210"/>
          <!-- Bouncing ball -->
          <circle cx="160" cy="80" r="8" fill="#eab308"/>
          <text x="160" y="172" font-family="system-ui, sans-serif" font-size="11" font-weight="900" fill="#f43f5e" text-anchor="middle">COLOR MATCH PULSE</text>
        </svg>
      `;

    case 'gravity-run-canvas':
      return `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 180" width="100%" height="100%">
          <rect width="320" height="180" fill="#0f172a"/>
          <!-- Top & Bottom Rails -->
          <rect x="0" y="20" width="320" height="12" fill="#0284c7"/>
          <rect x="0" y="130" width="320" height="12" fill="#0284c7"/>
          <!-- Obstacle Spikes -->
          <polygon points="120,32 130,50 140,32" fill="#f43f5e"/>
          <polygon points="210,130 220,112 230,130" fill="#f43f5e"/>
          <!-- Running Cyber Character -->
          <circle cx="80" cy="115" r="6" fill="#38bdf8"/>
          <line x1="80" y1="120" x2="80" y2="130" stroke="#38bdf8" stroke-width="3"/>
          <!-- Gravity Arrow -->
          <polygon points="80,75 75,85 85,85" fill="#a855f7"/>
          <text x="160" y="172" font-family="system-ui, sans-serif" font-size="11" font-weight="900" fill="#38bdf8" text-anchor="middle">GRAVITY INVERSION RUNNER</text>
        </svg>
      `;

    case 'dungeon-crawl-retro':
      return `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 180" width="100%" height="100%">
          <rect width="320" height="180" fill="#1c1917"/>
          <!-- Dungeon Wall Blocks -->
          <rect x="30" y="20" width="260" height="120" fill="#292524" rx="8"/>
          <!-- Torch Glow -->
          <circle cx="60" cy="50" r="15" fill="#f59e0b" opacity="0.3"/>
          <circle cx="60" cy="50" r="4" fill="#fbbf24"/>
          <!-- Hero Sprite -->
          <rect x="145" y="70" width="30" height="30" rx="4" fill="#3b82f6"/>
          <rect x="155" y="75" width="10" height="6" fill="#fde047"/>
          <!-- Chest -->
          <rect x="220" y="75" width="24" height="20" rx="3" fill="#ca8a04"/>
          <text x="160" y="172" font-family="system-ui, sans-serif" font-size="11" font-weight="900" fill="#fbbf24" text-anchor="middle">RETRO DUNGEON RAIDER</text>
        </svg>
      `;

    case 'subway-runner-canvas':
      return `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 180" width="100%" height="100%">
          <rect width="320" height="180" fill="#020617"/>
          <!-- 3 perspective rail lanes -->
          <line x1="160" y1="20" x2="40" y2="150" stroke="#334155" stroke-width="2"/>
          <line x1="160" y1="20" x2="160" y2="150" stroke="#334155" stroke-width="2"/>
          <line x1="160" y1="20" x2="280" y2="150" stroke="#334155" stroke-width="2"/>
          <!-- Train Barrier on Left Lane -->
          <polygon points="70,120 110,120 100,80 80,80" fill="#e11d48"/>
          <!-- Player Runner -->
          <circle cx="160" cy="115" r="9" fill="#10b981"/>
          <rect x="154" y="124" width="12" height="16" rx="3" fill="#059669"/>
          <text x="160" y="172" font-family="system-ui, sans-serif" font-size="11" font-weight="900" fill="#10b981" text-anchor="middle">CYBER SUBWAY 3-LANE DASH</text>
        </svg>
      `;

    case 'jump-tower-canvas':
      return `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 180" width="100%" height="100%">
          <rect width="320" height="180" fill="#1e1b4b"/>
          <!-- Floating Platforms -->
          <rect x="60" y="125" width="60" height="10" rx="4" fill="#a855f7"/>
          <rect x="170" y="95" width="60" height="10" rx="4" fill="#a855f7"/>
          <rect x="90" y="55" width="60" height="10" rx="4" fill="#a855f7"/>
          <!-- Hopper -->
          <circle cx="120" cy="38" r="9" fill="#38bdf8"/>
          <path d="M120 47 Q120 52 116 54 M120 47 Q120 52 124 54" stroke="#38bdf8" stroke-width="2"/>
          <text x="160" y="172" font-family="system-ui, sans-serif" font-size="11" font-weight="900" fill="#c084fc" text-anchor="middle">NEON TOWER HOPPER</text>
        </svg>
      `;

    case 'tank-battle-2d':
      return `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 180" width="100%" height="100%">
          <rect width="320" height="180" fill="#14532d"/>
          <!-- Green Tank -->
          <rect x="60" y="70" width="45" height="30" rx="4" fill="#15803d"/>
          <circle cx="82" cy="85" r="9" fill="#166534"/>
          <line x1="82" y1="85" x2="115" y2="85" stroke="#166534" stroke-width="4"/>
          <!-- Red Tank -->
          <rect x="215" y="70" width="45" height="30" rx="4" fill="#b91c1c"/>
          <circle cx="237" cy="85" r="9" fill="#991b1b"/>
          <line x1="237" y1="85" x2="204" y2="85" stroke="#991b1b" stroke-width="4"/>
          <!-- Bullet Flash -->
          <circle cx="160" cy="85" r="4" fill="#facc15"/>
          <text x="160" y="172" font-family="system-ui, sans-serif" font-size="11" font-weight="900" fill="#86efac" text-anchor="middle">CYBER TANK COMBAT 2D</text>
        </svg>
      `;

    case 'speed-drift-canvas':
      return `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 180" width="100%" height="100%">
          <rect width="320" height="180" fill="#18181b"/>
          <!-- Track curve -->
          <path d="M40 150 Q160 30 280 150" fill="none" stroke="#27272a" stroke-width="40"/>
          <path d="M40 150 Q160 30 280 150" fill="none" stroke="#ef4444" stroke-width="2" stroke-dasharray="10 10"/>
          <!-- Drift Car -->
          <g transform="translate(145, 65) rotate(25)">
            <rect x="0" y="0" width="36" height="20" rx="4" fill="#06b6d4"/>
            <rect x="18" y="3" width="12" height="14" rx="2" fill="#0891b2"/>
          </g>
          <text x="160" y="172" font-family="system-ui, sans-serif" font-size="11" font-weight="900" fill="#22d3ee" text-anchor="middle">NEON DRIFT CIRCUIT PRO</text>
        </svg>
      `;

    case 'memory-cards-dx':
      return `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 180" width="100%" height="100%">
          <rect width="320" height="180" fill="#311042"/>
          <!-- Cards Grid -->
          <rect x="50" y="30" width="40" height="50" rx="4" fill="#9333ea"/>
          <rect x="105" y="30" width="40" height="50" rx="4" fill="#9333ea"/>
          <rect x="160" y="30" width="40" height="50" rx="4" fill="#a855f7"/>
          <circle cx="180" cy="55" r="10" fill="#facc15"/>
          <rect x="215" y="30" width="40" height="50" rx="4" fill="#a855f7"/>
          <circle cx="235" cy="55" r="10" fill="#facc15"/>
          <rect x="105" y="90" width="40" height="50" rx="4" fill="#9333ea"/>
          <rect x="160" y="90" width="40" height="50" rx="4" fill="#9333ea"/>
          <text x="160" y="172" font-family="system-ui, sans-serif" font-size="11" font-weight="900" fill="#d8b4fe" text-anchor="middle">CYBER MEMORY MATRIX DX</text>
        </svg>
      `;

    case 'minesweeper-dx':
      return `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 180" width="100%" height="100%">
          <rect width="320" height="180" fill="#0f172a"/>
          <!-- Cells -->
          <g fill="#1e293b" stroke="#334155" stroke-width="1">
            <rect x="90" y="25" width="28" height="28" rx="2"/>
            <rect x="122" y="25" width="28" height="28" rx="2"/>
            <rect x="154" y="25" width="28" height="28" rx="2"/>
            <rect x="186" y="25" width="28" height="28" rx="2"/>
            <rect x="90" y="57" width="28" height="28" rx="2"/>
            <rect x="122" y="57" width="28" height="28" rx="2" fill="#090d16"/>
            <rect x="154" y="57" width="28" height="28" rx="2"/>
            <rect x="186" y="57" width="28" height="28" rx="2"/>
          </g>
          <!-- Flag & Number -->
          <polygon points="100,32 108,36 100,40" fill="#ef4444"/>
          <line x1="100" y1="32" x2="100" y2="46" stroke="#94a3b8" stroke-width="2"/>
          <text x="136" y="76" font-family="system-ui, sans-serif" font-size="16" font-weight="bold" fill="#3b82f6" text-anchor="middle">1</text>
          <text x="160" y="172" font-family="system-ui, sans-serif" font-size="11" font-weight="900" fill="#e2e8f0" text-anchor="middle">QUANTUM MINEFIELD DX</text>
        </svg>
      `;

    case 'checkers-board-canvas':
      return `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 180" width="100%" height="100%">
          <rect width="320" height="180" fill="#2d1203"/>
          <!-- Checkered Tiles -->
          <g transform="translate(90, 20)">
            <rect width="140" height="120" fill="#d97706" rx="4"/>
            <rect x="0" y="0" width="35" height="30" fill="#78350f"/>
            <rect x="70" y="0" width="35" height="30" fill="#78350f"/>
            <rect x="35" y="30" width="35" height="30" fill="#78350f"/>
            <rect x="105" y="30" width="35" height="30" fill="#78350f"/>
            <!-- Pieces -->
            <circle cx="17" cy="15" r="11" fill="#ef4444"/>
            <circle cx="87" cy="15" r="11" fill="#ef4444"/>
            <circle cx="52" cy="45" r="11" fill="#f8fafc"/>
          </g>
          <text x="160" y="172" font-family="system-ui, sans-serif" font-size="11" font-weight="900" fill="#fde68a" text-anchor="middle">NEON CHECKERS MASTER</text>
        </svg>
      `;

    case 'sliding-tile-puzzle':
      return `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 180" width="100%" height="100%">
          <rect width="320" height="180" fill="#0c4a6e"/>
          <g transform="translate(100, 20)">
            <rect width="120" height="120" fill="#0369a1" rx="6"/>
            <rect x="5" y="5" width="34" height="34" rx="4" fill="#38bdf8"/>
            <text x="22" y="28" font-family="system-ui, sans-serif" font-size="14" font-weight="bold" fill="#082f49" text-anchor="middle">1</text>
            <rect x="43" y="5" width="34" height="34" rx="4" fill="#38bdf8"/>
            <text x="60" y="28" font-family="system-ui, sans-serif" font-size="14" font-weight="bold" fill="#082f49" text-anchor="middle">2</text>
            <rect x="81" y="5" width="34" height="34" rx="4" fill="#38bdf8"/>
            <text x="98" y="28" font-family="system-ui, sans-serif" font-size="14" font-weight="bold" fill="#082f49" text-anchor="middle">3</text>
          </g>
          <text x="160" y="172" font-family="system-ui, sans-serif" font-size="11" font-weight="900" fill="#7dd3fc" text-anchor="middle">15-PUZZLE NUMBER MATRIX</text>
        </svg>
      `;

    case 'neon-pong-battle':
      return `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 180" width="100%" height="100%">
          <rect width="320" height="180" fill="#050505"/>
          <line x1="160" y1="10" x2="160" y2="150" stroke="#222" stroke-width="2" stroke-dasharray="6 6"/>
          <!-- Left & Right Paddles -->
          <rect x="30" y="60" width="8" height="45" rx="4" fill="#06b6d4"/>
          <rect x="282" y="40" width="8" height="45" rx="4" fill="#f43f5e"/>
          <!-- Neon Ball with Glow -->
          <circle cx="140" cy="80" r="5" fill="#f8fafc"/>
          <line x1="140" y1="80" x2="115" y2="70" stroke="#06b6d4" stroke-width="2" opacity="0.7"/>
          <text x="160" y="172" font-family="system-ui, sans-serif" font-size="11" font-weight="900" fill="#a5f3fc" text-anchor="middle">HYPER PONG DUEL</text>
        </svg>
      `;

    case 'fruit-slice-canvas':
      return `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 180" width="100%" height="100%">
          <rect width="320" height="180" fill="#270915"/>
          <!-- Sliced Watermelon -->
          <path d="M120 70 A 25 25 0 0 0 160 95 Z" fill="#ef4444"/>
          <path d="M165 60 A 25 25 0 0 1 205 85 Z" fill="#ef4444"/>
          <!-- Slicing Blade Slash Trail -->
          <line x1="80" y1="130" x2="240" y2="40" stroke="#38bdf8" stroke-width="4" stroke-linecap="round"/>
          <line x1="80" y1="130" x2="240" y2="40" stroke="#fff" stroke-width="1.5" stroke-linecap="round"/>
          <text x="160" y="172" font-family="system-ui, sans-serif" font-size="11" font-weight="900" fill="#f87171" text-anchor="middle">CYBER BLADE FRUIT SLICER</text>
        </svg>
      `;

    case 'bubble-pop-canvas':
      return `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 180" width="100%" height="100%">
          <rect width="320" height="180" fill="#0f172a"/>
          <!-- Bubble Clusters -->
          <circle cx="100" cy="40" r="14" fill="#3b82f6"/>
          <circle cx="130" cy="40" r="14" fill="#ef4444"/>
          <circle cx="160" cy="40" r="14" fill="#10b981"/>
          <circle cx="190" cy="40" r="14" fill="#facc15"/>
          <circle cx="115" cy="65" r="14" fill="#ef4444"/>
          <circle cx="145" cy="65" r="14" fill="#3b82f6"/>
          <!-- Shooter Arrow -->
          <line x1="160" y1="150" x2="160" y2="105" stroke="#f43f5e" stroke-width="3"/>
          <circle cx="160" cy="100" r="12" fill="#ef4444"/>
          <text x="160" y="172" font-family="system-ui, sans-serif" font-size="11" font-weight="900" fill="#60a5fa" text-anchor="middle">BUBBLE SHOOTER CANNON</text>
        </svg>
      `;

    case 'match-three-gem':
      return `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 180" width="100%" height="100%">
          <rect width="320" height="180" fill="#1e1035"/>
          <!-- Gems -->
          <polygon points="100,50 115,70 100,90 85,70" fill="#06b6d4"/>
          <polygon points="140,50 155,70 140,90 125,70" fill="#ec4899"/>
          <polygon points="180,50 195,70 180,90 165,70" fill="#ec4899"/>
          <polygon points="220,50 235,70 220,90 205,70" fill="#ec4899"/>
          <!-- Glow Match Line -->
          <line x1="130" y1="70" x2="230" y2="70" stroke="#f472b6" stroke-width="3" opacity="0.8"/>
          <text x="160" y="172" font-family="system-ui, sans-serif" font-size="11" font-weight="900" fill="#f472b6" text-anchor="middle">NEON GEM CASCADE MATCH-3</text>
        </svg>
      `;

    case 'solitaire-klondike-dx':
      return `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 180" width="100%" height="100%">
          <rect width="320" height="180" fill="#064e3b"/>
          <!-- Tableau piles -->
          <rect x="60" y="25" width="36" height="50" rx="3" fill="#f8fafc" stroke="#cbd5e1"/>
          <text x="70" y="42" font-family="system-ui, sans-serif" font-size="13" font-weight="bold" fill="#ef4444">A♥</text>
          <rect x="110" y="25" width="36" height="50" rx="3" fill="#f8fafc" stroke="#cbd5e1"/>
          <text x="120" y="42" font-family="system-ui, sans-serif" font-size="13" font-weight="bold" fill="#0f172a">K♠</text>
          <rect x="160" y="25" width="36" height="50" rx="3" fill="#f8fafc" stroke="#cbd5e1"/>
          <text x="170" y="42" font-family="system-ui, sans-serif" font-size="13" font-weight="bold" fill="#ef4444">Q♦</text>
          <rect x="210" y="25" width="36" height="50" rx="3" fill="#f8fafc" stroke="#cbd5e1"/>
          <text x="220" y="42" font-family="system-ui, sans-serif" font-size="13" font-weight="bold" fill="#0f172a">J♣</text>
          <text x="160" y="172" font-family="system-ui, sans-serif" font-size="11" font-weight="900" fill="#86efac" text-anchor="middle">KLONDIKE SOLITAIRE PRO DX</text>
        </svg>
      `;

    case 'pinball-arcade-canvas':
      return `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 180" width="100%" height="100%">
          <rect width="320" height="180" fill="#09090b"/>
          <!-- Bumpers -->
          <circle cx="120" cy="50" r="16" fill="#ef4444"/>
          <circle cx="200" cy="50" r="16" fill="#3b82f6"/>
          <circle cx="160" cy="80" r="18" fill="#eab308"/>
          <!-- Flippers -->
          <line x1="100" y1="140" x2="140" y2="150" stroke="#f97316" stroke-width="6" stroke-linecap="round"/>
          <line x1="220" y1="140" x2="180" y2="150" stroke="#f97316" stroke-width="6" stroke-linecap="round"/>
          <!-- Pinball -->
          <circle cx="155" cy="110" r="6" fill="#e2e8f0"/>
          <text x="160" y="172" font-family="system-ui, sans-serif" font-size="11" font-weight="900" fill="#facc15" text-anchor="middle">RETRO CYBER PINBALL DX</text>
        </svg>
      `;

    case 'piano-tiles-canvas':
      return `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 180" width="100%" height="100%">
          <rect width="320" height="180" fill="#020617"/>
          <!-- 4 Vertical Piano Keys -->
          <rect x="80" y="10" width="40" height="140" fill="#f8fafc" stroke="#020617"/>
          <rect x="120" y="10" width="40" height="140" fill="#f8fafc" stroke="#020617"/>
          <rect x="160" y="10" width="40" height="140" fill="#f8fafc" stroke="#020617"/>
          <rect x="200" y="10" width="40" height="140" fill="#f8fafc" stroke="#020617"/>
          <!-- Falling Black Note Tiles -->
          <rect x="80" y="20" width="40" height="40" rx="3" fill="#09090b"/>
          <rect x="160" y="60" width="40" height="40" rx="3" fill="#09090b"/>
          <rect x="120" y="100" width="40" height="40" rx="3" fill="#06b6d4"/>
          <text x="160" y="172" font-family="system-ui, sans-serif" font-size="11" font-weight="900" fill="#38bdf8" text-anchor="middle">NEON PIANO KEY RHYTHM</text>
        </svg>
      `;

    default:
      // Return null so callers fall back to category or generic renderer
      return null;
  }
}

function getCategoryWebArtSvg(gameId: string, num: number, cat: string): string {
  const colors: Record<string, { bg1: string; bg2: string; accent: string; text: string }> = {
    Arcade: { bg1: '#1e1b4b', bg2: '#0f172a', accent: '#a855f7', text: '#d8b4fe' },
    Puzzle: { bg1: '#042f2e', bg2: '#022c22', accent: '#14b8a6', text: '#5eead4' },
    Sports: { bg1: '#172554', bg2: '#0f172a', accent: '#38bdf8', text: '#7dd3fc' },
    Retro: { bg1: '#311042', bg2: '#180728', accent: '#f43f5e', text: '#fda4af' },
    Classic: { bg1: '#14532d', bg2: '#052e16', accent: '#22c55e', text: '#86efac' },
    Action: { bg1: '#450a0a', bg2: '#180202', accent: '#ef4444', text: '#fca5a5' },
    Strategy: { bg1: '#1c1917', bg2: '#0c0a09', accent: '#f59e0b', text: '#fde68a' },
    Cards: { bg1: '#1e293b', bg2: '#0f172a', accent: '#6366f1', text: '#a5b4fc' },
  };

  const scheme = colors[cat] || colors.Arcade;

  return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 180" width="100%" height="100%">
      <defs>
        <linearGradient id="webGrad_${gameId}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${scheme.bg1}"/>
          <stop offset="100%" stop-color="${scheme.bg2}"/>
        </linearGradient>
      </defs>
      <rect width="320" height="180" fill="url(#webGrad_${gameId})"/>
      
      <!-- Category Specific Motif -->
      <g opacity="0.25">
        <circle cx="160" cy="75" r="50" fill="${scheme.accent}"/>
        <polygon points="160,35 195,95 125,95" fill="none" stroke="${scheme.accent}" stroke-width="2"/>
      </g>
      
      <!-- Badges -->
      <rect x="110" y="45" width="100" height="60" rx="8" fill="rgba(255,255,255,0.05)" stroke="${scheme.accent}" stroke-width="1.5"/>
      <text x="160" y="72" font-family="system-ui, sans-serif" font-size="12" font-weight="900" fill="#fff" text-anchor="middle" letter-spacing="1">
        ${cat.toUpperCase()} ARENA
      </text>
      <text x="160" y="92" font-family="system-ui, sans-serif" font-size="11" font-weight="bold" fill="${scheme.accent}" text-anchor="middle">
        LEVEL #${num < 10 ? '0' + num : num}
      </text>

      <line x1="50" y1="135" x2="270" y2="135" stroke="${scheme.accent}" stroke-width="1" stroke-dasharray="4 4" opacity="0.4"/>
      
      <text x="160" y="160" font-family="system-ui, sans-serif" font-size="12" font-weight="bold" fill="${scheme.text}" text-anchor="middle" letter-spacing="1.5">
        CYBER ARENA ${cat.toUpperCase()} ${num < 10 ? '0' + num : num}
      </text>
    </svg>
  `;
}
