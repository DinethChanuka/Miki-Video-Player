/**
 * Real Visualized Game Preview Artwork Generator
 * Provides authentic, crisp, zero-latency vector SVG previews for all 50+ games.
 */

function encodeSvg(svg: string): string {
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg.trim())}`;
}

export function getGamePreviewSvg(gameId: string): string {
  switch (gameId) {
    case '2048':
      return `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 180" width="100%" height="100%">
          <rect width="320" height="180" fill="#bbada0" rx="12"/>
          <g transform="translate(60, 20)">
            <rect width="200" height="140" fill="#cdc1b4" rx="8"/>
            <rect x="10" y="10" width="38" height="38" rx="4" fill="#eee4da"/>
            <text x="29" y="34" font-family="system-ui, sans-serif" font-size="16" font-weight="bold" fill="#776e65" text-anchor="middle">2</text>
            <rect x="58" y="10" width="38" height="38" rx="4" fill="#ede0c8"/>
            <text x="77" y="34" font-family="system-ui, sans-serif" font-size="16" font-weight="bold" fill="#776e65" text-anchor="middle">4</text>
            <rect x="106" y="10" width="38" height="38" rx="4" fill="#f2b179"/>
            <text x="125" y="34" font-family="system-ui, sans-serif" font-size="16" font-weight="bold" fill="#f9f6f2" text-anchor="middle">8</text>
            <rect x="154" y="10" width="38" height="38" rx="4" fill="#f59563"/>
            <text x="173" y="34" font-family="system-ui, sans-serif" font-size="15" font-weight="bold" fill="#f9f6f2" text-anchor="middle">16</text>
            
            <rect x="10" y="54" width="38" height="38" rx="4" fill="#f67c5f"/>
            <text x="29" y="78" font-family="system-ui, sans-serif" font-size="15" font-weight="bold" fill="#f9f6f2" text-anchor="middle">32</text>
            <rect x="58" y="54" width="38" height="38" rx="4" fill="#f65e3b"/>
            <text x="77" y="78" font-family="system-ui, sans-serif" font-size="15" font-weight="bold" fill="#f9f6f2" text-anchor="middle">64</text>
            <rect x="106" y="54" width="38" height="38" rx="4" fill="#edcf72"/>
            <text x="125" y="78" font-family="system-ui, sans-serif" font-size="13" font-weight="bold" fill="#f9f6f2" text-anchor="middle">128</text>
            <rect x="154" y="54" width="38" height="38" rx="4" fill="#edcc61"/>
            <text x="173" y="78" font-family="system-ui, sans-serif" font-size="13" font-weight="bold" fill="#f9f6f2" text-anchor="middle">256</text>

            <rect x="10" y="98" width="86" height="34" rx="4" fill="#edc22e"/>
            <text x="53" y="121" font-family="system-ui, sans-serif" font-size="16" font-weight="900" fill="#f9f6f2" text-anchor="middle">2048</text>
            <rect x="106" y="98" width="38" height="34" rx="4" fill="#edc850"/>
            <text x="125" y="120" font-family="system-ui, sans-serif" font-size="12" font-weight="bold" fill="#f9f6f2" text-anchor="middle">512</text>
            <rect x="154" y="98" width="38" height="34" rx="4" fill="#edc53f"/>
            <text x="173" y="120" font-family="system-ui, sans-serif" font-size="11" font-weight="bold" fill="#f9f6f2" text-anchor="middle">1024</text>
          </g>
        </svg>
      `;

    case 'snake':
      return `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 180" width="100%" height="100%">
          <rect width="320" height="180" fill="#0f172a"/>
          <!-- Grid lines -->
          <path d="M0 30H320M0 60H320M0 90H320M0 120H320M0 150H320M40 0V180M80 0V180M120 0V180M160 0V180M200 0V180M240 0V180M280 0V180" stroke="#1e293b" stroke-width="1"/>
          <!-- Snake Body -->
          <rect x="60" y="90" width="28" height="28" rx="6" fill="#10b981"/>
          <rect x="90" y="90" width="28" height="28" rx="6" fill="#10b981"/>
          <rect x="120" y="90" width="28" height="28" rx="6" fill="#10b981"/>
          <rect x="120" y="60" width="28" height="28" rx="6" fill="#10b981"/>
          <rect x="150" y="60" width="28" height="28" rx="6" fill="#10b981"/>
          <rect x="180" y="60" width="28" height="28" rx="6" fill="#34d399"/>
          <!-- Snake Eyes -->
          <circle cx="198" cy="70" r="3" fill="#0f172a"/>
          <circle cx="198" cy="78" r="3" fill="#0f172a"/>
          <!-- Apple with glow -->
          <circle cx="250" cy="74" r="12" fill="#ef4444"/>
          <path d="M250 62 Q254 56 258 58" stroke="#10b981" stroke-width="2.5" fill="none"/>
        </svg>
      `;

    case 'pong':
      return `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 180" width="100%" height="100%">
          <rect width="320" height="180" fill="#090d16"/>
          <!-- Dashed Center Line -->
          <line x1="160" y1="10" x2="160" y2="170" stroke="#475569" stroke-width="4" stroke-dasharray="8 8"/>
          <!-- Left Paddle -->
          <rect x="25" y="55" width="10" height="70" rx="3" fill="#38bdf8"/>
          <!-- Right Paddle -->
          <rect x="285" y="70" width="10" height="70" rx="3" fill="#f43f5e"/>
          <!-- Ball & Motion Trail -->
          <circle cx="120" cy="92" r="6" fill="#38bdf8" opacity="0.3"/>
          <circle cx="140" cy="94" r="7" fill="#38bdf8" opacity="0.6"/>
          <rect x="158" y="91" width="10" height="10" fill="#ffffff" rx="2"/>
          <!-- Retro Scores -->
          <text x="120" y="45" font-family="Courier, monospace" font-size="28" font-weight="900" fill="#94a3b8">03</text>
          <text x="175" y="45" font-family="Courier, monospace" font-size="28" font-weight="900" fill="#94a3b8">02</text>
        </svg>
      `;

    case 'breakout':
      return `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 180" width="100%" height="100%">
          <rect width="320" height="180" fill="#0a0a0f"/>
          <!-- Bricks -->
          <g transform="translate(20, 20)">
            <!-- Row 1: Red -->
            <rect x="0" y="0" width="42" height="12" rx="2" fill="#ef4444"/>
            <rect x="47" y="0" width="42" height="12" rx="2" fill="#ef4444"/>
            <rect x="94" y="0" width="42" height="12" rx="2" fill="#ef4444"/>
            <rect x="141" y="0" width="42" height="12" rx="2" fill="#ef4444"/>
            <rect x="188" y="0" width="42" height="12" rx="2" fill="#ef4444"/>
            <rect x="235" y="0" width="42" height="12" rx="2" fill="#ef4444"/>
            <!-- Row 2: Orange -->
            <rect x="0" y="16" width="42" height="12" rx="2" fill="#f97316"/>
            <rect x="47" y="16" width="42" height="12" rx="2" fill="#f97316"/>
            <rect x="141" y="16" width="42" height="12" rx="2" fill="#f97316"/>
            <rect x="235" y="16" width="42" height="12" rx="2" fill="#f97316"/>
            <!-- Row 3: Green -->
            <rect x="0" y="32" width="42" height="12" rx="2" fill="#10b981"/>
            <rect x="47" y="32" width="42" height="12" rx="2" fill="#10b981"/>
            <rect x="94" y="32" width="42" height="12" rx="2" fill="#10b981"/>
            <rect x="188" y="32" width="42" height="12" rx="2" fill="#10b981"/>
            <!-- Row 4: Yellow -->
            <rect x="0" y="48" width="42" height="12" rx="2" fill="#eab308"/>
            <rect x="141" y="48" width="42" height="12" rx="2" fill="#eab308"/>
            <rect x="188" y="48" width="42" height="12" rx="2" fill="#eab308"/>
            <rect x="235" y="48" width="42" height="12" rx="2" fill="#eab308"/>
          </g>
          <!-- Ball bouncing -->
          <circle cx="160" cy="115" r="7" fill="#ffffff"/>
          <line x1="180" y1="135" x2="160" y2="115" stroke="#38bdf8" stroke-width="2" stroke-dasharray="3 3"/>
          <!-- Paddle -->
          <rect x="130" y="155" width="65" height="12" rx="6" fill="#38bdf8"/>
        </svg>
      `;

    case 'flappy-bird':
      return `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 180" width="100%" height="100%">
          <rect width="320" height="180" fill="#38bdf8"/>
          <!-- Clouds -->
          <ellipse cx="60" cy="40" rx="30" ry="14" fill="#ffffff" opacity="0.9"/>
          <ellipse cx="240" cy="35" rx="35" ry="16" fill="#ffffff" opacity="0.9"/>
          <!-- Pipes -->
          <rect x="90" y="0" width="34" height="60" fill="#22c55e" stroke="#15803d" stroke-width="3"/>
          <rect x="86" y="50" width="42" height="14" fill="#22c55e" stroke="#15803d" stroke-width="3"/>
          <rect x="90" y="115" width="34" height="65" fill="#22c55e" stroke="#15803d" stroke-width="3"/>
          <rect x="86" y="110" width="42" height="14" fill="#22c55e" stroke="#15803d" stroke-width="3"/>
          <rect x="230" y="0" width="34" height="40" fill="#22c55e" stroke="#15803d" stroke-width="3"/>
          <rect x="226" y="30" width="42" height="14" fill="#22c55e" stroke="#15803d" stroke-width="3"/>
          <rect x="230" y="95" width="34" height="85" fill="#22c55e" stroke="#15803d" stroke-width="3"/>
          <rect x="226" y="90" width="42" height="14" fill="#22c55e" stroke="#15803d" stroke-width="3"/>
          <!-- Flappy Bird -->
          <circle cx="165" cy="85" r="14" fill="#facc15"/>
          <circle cx="171" cy="80" r="4" fill="#ffffff"/>
          <circle cx="173" cy="80" r="2" fill="#000000"/>
          <polygon points="175,84 187,88 175,92" fill="#f97316"/>
          <ellipse cx="158" cy="88" rx="8" ry="5" fill="#ffffff" opacity="0.9"/>
          <!-- Ground -->
          <rect x="0" y="165" width="320" height="15" fill="#84cc16"/>
        </svg>
      `;

    case 'asteroids':
      return `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 180" width="100%" height="100%">
          <rect width="320" height="180" fill="#020617"/>
          <!-- Stars -->
          <circle cx="45" cy="30" r="1" fill="#ffffff"/>
          <circle cx="140" cy="20" r="1.5" fill="#ffffff"/>
          <circle cx="280" cy="50" r="1" fill="#ffffff"/>
          <circle cx="70" cy="140" r="1.5" fill="#ffffff"/>
          <circle cx="260" cy="150" r="1" fill="#ffffff"/>
          <!-- Vector Asteroid 1 -->
          <polygon points="50,60 75,45 100,55 110,85 85,105 55,90" fill="none" stroke="#22d3ee" stroke-width="2.5"/>
          <!-- Vector Asteroid 2 -->
          <polygon points="220,100 245,85 270,95 285,120 255,140 230,130" fill="none" stroke="#22d3ee" stroke-width="2.5"/>
          <!-- Small Asteroid -->
          <polygon points="230,30 245,22 255,35 240,45" fill="none" stroke="#22d3ee" stroke-width="2"/>
          <!-- Spaceship -->
          <g transform="translate(150, 85) rotate(-35)">
            <polygon points="0,-18 12,14 0,8 -12,14" fill="#0f172a" stroke="#ffffff" stroke-width="2.5"/>
            <!-- Thruster flame -->
            <polygon points="0,9 5,18 0,25 -5,18" fill="#f97316"/>
            <!-- Laser shot -->
            <line x1="0" y1="-25" x2="0" y2="-45" stroke="#ef4444" stroke-width="3" stroke-linecap="round"/>
          </g>
        </svg>
      `;

    case 'tetris':
      return `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 180" width="100%" height="100%">
          <rect width="320" height="180" fill="#030712"/>
          <!-- Matrix Grid background -->
          <rect x="90" y="10" width="140" height="160" fill="#111827" stroke="#1f2937" stroke-width="2"/>
          <!-- Falling T piece (Purple) -->
          <g transform="translate(132, 40)">
            <rect x="0" y="0" width="18" height="18" rx="2" fill="#a855f7" stroke="#9333ea" stroke-width="1.5"/>
            <rect x="18" y="0" width="18" height="18" rx="2" fill="#a855f7" stroke="#9333ea" stroke-width="1.5"/>
            <rect x="36" y="0" width="18" height="18" rx="2" fill="#a855f7" stroke="#9333ea" stroke-width="1.5"/>
            <rect x="18" y="18" width="18" height="18" rx="2" fill="#a855f7" stroke="#9333ea" stroke-width="1.5"/>
          </g>
          <!-- Stacked Pieces at bottom -->
          <!-- Cyan I bar -->
          <rect x="94" y="150" width="18" height="18" rx="2" fill="#06b6d4" stroke="#0891b2" stroke-width="1.5"/>
          <rect x="112" y="150" width="18" height="18" rx="2" fill="#06b6d4" stroke="#0891b2" stroke-width="1.5"/>
          <rect x="130" y="150" width="18" height="18" rx="2" fill="#06b6d4" stroke="#0891b2" stroke-width="1.5"/>
          <rect x="148" y="150" width="18" height="18" rx="2" fill="#06b6d4" stroke="#0891b2" stroke-width="1.5"/>
          <!-- Yellow O square -->
          <rect x="166" y="150" width="18" height="18" rx="2" fill="#eab308" stroke="#ca8a04" stroke-width="1.5"/>
          <rect x="184" y="150" width="18" height="18" rx="2" fill="#eab308" stroke="#ca8a04" stroke-width="1.5"/>
          <rect x="166" y="132" width="18" height="18" rx="2" fill="#eab308" stroke="#ca8a04" stroke-width="1.5"/>
          <rect x="184" y="132" width="18" height="18" rx="2" fill="#eab308" stroke="#ca8a04" stroke-width="1.5"/>
          <!-- Red Z piece -->
          <rect x="202" y="150" width="18" height="18" rx="2" fill="#ef4444" stroke="#dc2626" stroke-width="1.5"/>
          <rect x="202" y="132" width="18" height="18" rx="2" fill="#ef4444" stroke="#dc2626" stroke-width="1.5"/>
          <!-- Score HUD -->
          <text x="245" y="45" font-family="monospace" font-size="11" fill="#9ca3af">LINES</text>
          <text x="245" y="62" font-family="monospace" font-size="14" font-weight="bold" fill="#38bdf8">024</text>
        </svg>
      `;

    case 'dino':
      return `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 180" width="100%" height="100%">
          <rect width="320" height="180" fill="#f8fafc"/>
          <!-- Pixel Ground -->
          <line x1="10" y1="140" x2="310" y2="140" stroke="#475569" stroke-width="2"/>
          <line x1="40" y1="145" x2="60" y2="145" stroke="#94a3b8" stroke-width="1.5"/>
          <line x1="120" y1="145" x2="150" y2="145" stroke="#94a3b8" stroke-width="1.5"/>
          <line x1="220" y1="145" x2="250" y2="145" stroke="#94a3b8" stroke-width="1.5"/>
          <!-- Cacti -->
          <g transform="translate(210, 105)">
            <rect x="10" y="0" width="8" height="35" fill="#334155"/>
            <rect x="0" y="10" width="10" height="6" fill="#334155"/>
            <rect x="0" y="5" width="5" height="10" fill="#334155"/>
            <rect x="18" y="14" width="10" height="6" fill="#334155"/>
            <rect x="23" y="8" width="5" height="12" fill="#334155"/>
          </g>
          <!-- T-Rex Dino Mid-Jump -->
          <g transform="translate(85, 75)">
            <!-- Head & Eye -->
            <rect x="18" y="0" width="22" height="16" fill="#1e293b"/>
            <rect x="32" y="4" width="4" height="4" fill="#ffffff"/>
            <!-- Body -->
            <rect x="10" y="14" width="20" height="26" fill="#1e293b"/>
            <!-- Arm -->
            <rect x="30" y="24" width="8" height="4" fill="#1e293b"/>
            <!-- Tail -->
            <rect x="0" y="20" width="12" height="12" fill="#1e293b"/>
            <!-- Legs jumping -->
            <rect x="12" y="40" width="5" height="8" fill="#1e293b"/>
            <rect x="22" y="40" width="5" height="8" fill="#1e293b"/>
          </g>
          <!-- High Score HUD -->
          <text x="240" y="30" font-family="monospace" font-size="12" font-weight="bold" fill="#64748b">HI 01842</text>
        </svg>
      `;

    case 'minesweeper':
      return `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 180" width="100%" height="100%">
          <rect width="320" height="180" fill="#c0c0c0"/>
          <!-- Top Display -->
          <rect x="40" y="12" width="240" height="30" fill="#c0c0c0" stroke="#808080" stroke-width="2"/>
          <rect x="48" y="16" width="40" height="22" fill="#000000"/>
          <text x="68" y="32" font-family="Courier, monospace" font-size="18" font-weight="bold" fill="#ef4444" text-anchor="middle">010</text>
          <circle cx="160" cy="27" r="10" fill="#facc15" stroke="#000000" stroke-width="1.5"/>
          <circle cx="157" cy="25" r="1.5" fill="#000000"/>
          <circle cx="163" cy="25" r="1.5" fill="#000000"/>
          <path d="M156 31 Q160 34 164 31" stroke="#000000" stroke-width="1.5" fill="none"/>
          <rect x="232" y="16" width="40" height="22" fill="#000000"/>
          <text x="252" y="32" font-family="Courier, monospace" font-size="18" font-weight="bold" fill="#ef4444" text-anchor="middle">045</text>
          <!-- Grid cells -->
          <g transform="translate(40, 50)">
            <!-- Revealed numbers -->
            <rect x="0" y="0" width="28" height="28" fill="#e5e5e5" stroke="#999999"/>
            <text x="14" y="20" font-family="sans-serif" font-size="16" font-weight="bold" fill="#2563eb" text-anchor="middle">1</text>
            <rect x="30" y="0" width="28" height="28" fill="#e5e5e5" stroke="#999999"/>
            <text x="44" y="20" font-family="sans-serif" font-size="16" font-weight="bold" fill="#16a34a" text-anchor="middle">2</text>
            <rect x="60" y="0" width="28" height="28" fill="#e5e5e5" stroke="#999999"/>
            <text x="74" y="20" font-family="sans-serif" font-size="16" font-weight="bold" fill="#dc2626" text-anchor="middle">3</text>
            <!-- Flag -->
            <rect x="90" y="0" width="28" height="28" fill="#d4d4d4" stroke="#ffffff" stroke-width="2"/>
            <polygon points="102,6 102,16 114,11" fill="#ef4444"/>
            <line x1="102" y1="6" x2="102" y2="22" stroke="#000000" stroke-width="2"/>
            <!-- Mine -->
            <rect x="120" y="0" width="28" height="28" fill="#f87171" stroke="#999999"/>
            <circle cx="134" cy="14" r="7" fill="#000000"/>
            <line x1="124" y1="14" x2="144" y2="14" stroke="#000000" stroke-width="2"/>
            <line x1="134" y1="4" x2="134" y2="24" stroke="#000000" stroke-width="2"/>
          </g>
        </svg>
      `;

    case 'pacman':
      return `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 180" width="100%" height="100%">
          <rect width="320" height="180" fill="#000000"/>
          <!-- Blue Maze Walls -->
          <rect x="20" y="20" width="280" height="140" fill="none" stroke="#2563eb" stroke-width="6" rx="10"/>
          <path d="M70 60 H130 V120 H70" fill="none" stroke="#2563eb" stroke-width="6" rx="4"/>
          <path d="M190 60 H250 V120 H190" fill="none" stroke="#2563eb" stroke-width="6" rx="4"/>
          <line x1="160" y1="20" x2="160" y2="60" stroke="#2563eb" stroke-width="6"/>
          <!-- Pellets -->
          <circle cx="160" cy="85" r="3" fill="#fef08a"/>
          <circle cx="180" cy="85" r="3" fill="#fef08a"/>
          <circle cx="200" cy="85" r="3" fill="#fef08a"/>
          <circle cx="220" cy="85" r="3" fill="#fef08a"/>
          <!-- Pac-Man -->
          <path d="M130 85 L145 74 A16 16 0 1 0 145 96 Z" fill="#facc15"/>
          <!-- Blinky (Red Ghost) -->
          <g transform="translate(60, 72)">
            <path d="M0 16 A12 12 0 0 1 24 16 L24 24 L20 20 L16 24 L12 20 L8 24 L4 20 L0 24 Z" fill="#ef4444"/>
            <circle cx="7" cy="12" r="3" fill="#ffffff"/>
            <circle cx="8" cy="12" r="1.5" fill="#0000ff"/>
            <circle cx="17" cy="12" r="3" fill="#ffffff"/>
            <circle cx="18" cy="12" r="1.5" fill="#0000ff"/>
          </g>
        </svg>
      `;

    case 'space-invaders':
      return `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 180" width="100%" height="100%">
          <rect width="320" height="180" fill="#090514"/>
          <!-- Invader Row 1 (Cyan) -->
          <g fill="#06b6d4" transform="translate(45, 25)">
            <rect x="0" y="4" width="24" height="14" rx="3"/>
            <rect x="50" y="4" width="24" height="14" rx="3"/>
            <rect x="100" y="4" width="24" height="14" rx="3"/>
            <rect x="150" y="4" width="24" height="14" rx="3"/>
            <rect x="200" y="4" width="24" height="14" rx="3"/>
          </g>
          <!-- Invader Row 2 (Magenta) -->
          <g fill="#ec4899" transform="translate(55, 50)">
            <rect x="0" y="4" width="24" height="14" rx="3"/>
            <rect x="50" y="4" width="24" height="14" rx="3"/>
            <rect x="100" y="4" width="24" height="14" rx="3"/>
            <rect x="150" y="4" width="24" height="14" rx="3"/>
            <rect x="200" y="4" width="24" height="14" rx="3"/>
          </g>
          <!-- Green Bunker Shields -->
          <path d="M60 135 H85 V120 H60 Z" fill="#22c55e"/>
          <path d="M150 135 H175 V120 H150 Z" fill="#22c55e"/>
          <path d="M240 135 H265 V120 H240 Z" fill="#22c55e"/>
          <!-- Player Cannon -->
          <g transform="translate(145, 150)">
            <rect x="5" y="0" width="6" height="8" fill="#22c55e"/>
            <rect x="0" y="8" width="16" height="8" rx="2" fill="#22c55e"/>
          </g>
          <!-- Laser Beam -->
          <line x1="153" y1="80" x2="153" y2="140" stroke="#facc15" stroke-width="2.5"/>
        </svg>
      `;

    case 'chess':
      return `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 180" width="100%" height="100%">
          <rect width="320" height="180" fill="#1e1e24"/>
          <!-- Chessboard -->
          <g transform="translate(80, 15)">
            <rect width="160" height="150" fill="#769656" rx="4"/>
            <!-- Alternating light squares -->
            <rect x="0" y="0" width="40" height="37.5" fill="#eeeed2"/>
            <rect x="80" y="0" width="40" height="37.5" fill="#eeeed2"/>
            <rect x="40" y="37.5" width="40" height="37.5" fill="#eeeed2"/>
            <rect x="120" y="37.5" width="40" height="37.5" fill="#eeeed2"/>
            <rect x="0" y="75" width="40" height="37.5" fill="#eeeed2"/>
            <rect x="80" y="75" width="40" height="37.5" fill="#eeeed2"/>
            <rect x="40" y="112.5" width="40" height="37.5" fill="#eeeed2"/>
            <rect x="120" y="112.5" width="40" height="37.5" fill="#eeeed2"/>
            <!-- White Knight Piece -->
            <text x="60" y="65" font-size="34" fill="#ffffff" text-anchor="middle" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.5))">♞</text>
            <!-- Black Queen Piece -->
            <text x="100" y="102" font-size="34" fill="#18181b" text-anchor="middle">♛</text>
          </g>
        </svg>
      `;

    case 'solitaire':
    case 'spider-solitaire':
    case 'freecell':
      return `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 180" width="100%" height="100%">
          <rect width="320" height="180" fill="#065f46"/>
          <!-- Cards layout -->
          <g transform="translate(35, 20)">
            <!-- Top Foundation Deck -->
            <rect x="0" y="0" width="34" height="48" rx="4" fill="#047857" stroke="#34d399" stroke-width="1.5"/>
            <rect x="42" y="0" width="34" height="48" rx="4" fill="#ffffff" stroke="#94a3b8"/>
            <text x="59" y="30" font-family="serif" font-size="18" fill="#dc2626" text-anchor="middle">♥ A</text>
            <rect x="84" y="0" width="34" height="48" rx="4" fill="#047857" stroke="#34d399" stroke-width="1.5"/>
            <rect x="126" y="0" width="34" height="48" rx="4" fill="#047857" stroke="#34d399" stroke-width="1.5"/>
            <!-- Cascading Tableau -->
            <rect x="42" y="60" width="34" height="48" rx="4" fill="#ffffff" stroke="#cbd5e1"/>
            <text x="59" y="85" font-family="serif" font-size="16" font-weight="bold" fill="#000000" text-anchor="middle">♠ K</text>
            <rect x="84" y="60" width="34" height="48" rx="4" fill="#ffffff" stroke="#cbd5e1"/>
            <text x="101" y="85" font-family="serif" font-size="16" font-weight="bold" fill="#dc2626" text-anchor="middle">♦ Q</text>
            <rect x="84" y="80" width="34" height="48" rx="4" fill="#ffffff" stroke="#cbd5e1"/>
            <text x="101" y="105" font-family="serif" font-size="16" font-weight="bold" fill="#000000" text-anchor="middle">♣ J</text>
          </g>
        </svg>
      `;

    case 'sudoku':
      return `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 180" width="100%" height="100%">
          <rect width="320" height="180" fill="#f1f5f9"/>
          <!-- Sudoku Grid -->
          <g transform="translate(85, 15)">
            <rect width="150" height="150" fill="#ffffff" stroke="#0f172a" stroke-width="3"/>
            <!-- 3x3 bold box lines -->
            <line x1="50" y1="0" x2="50" y2="150" stroke="#0f172a" stroke-width="2.5"/>
            <line x1="100" y1="0" x2="100" y2="150" stroke="#0f172a" stroke-width="2.5"/>
            <line x1="0" y1="50" x2="150" y2="50" stroke="#0f172a" stroke-width="2.5"/>
            <line x1="0" y1="100" x2="150" y2="100" stroke="#0f172a" stroke-width="2.5"/>
            <!-- Digits -->
            <text x="25" y="35" font-family="sans-serif" font-size="20" font-weight="bold" fill="#2563eb" text-anchor="middle">5</text>
            <text x="75" y="35" font-family="sans-serif" font-size="20" font-weight="bold" fill="#0f172a" text-anchor="middle">3</text>
            <text x="125" y="35" font-family="sans-serif" font-size="20" font-weight="bold" fill="#0f172a" text-anchor="middle">7</text>
            <text x="25" y="85" font-family="sans-serif" font-size="20" font-weight="bold" fill="#0f172a" text-anchor="middle">6</text>
            <text x="75" y="85" font-family="sans-serif" font-size="20" font-weight="bold" fill="#dc2626" text-anchor="middle">9</text>
            <text x="125" y="85" font-family="sans-serif" font-size="20" font-weight="bold" fill="#2563eb" text-anchor="middle">1</text>
            <text x="75" y="135" font-family="sans-serif" font-size="20" font-weight="bold" fill="#0f172a" text-anchor="middle">8</text>
          </g>
        </svg>
      `;

    case 'tic-tac-toe':
      return `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 180" width="100%" height="100%">
          <rect width="320" height="180" fill="#0f172a"/>
          <g transform="translate(100, 25)">
            <line x1="40" y1="0" x2="40" y2="130" stroke="#475569" stroke-width="4" stroke-linecap="round"/>
            <line x1="80" y1="0" x2="80" y2="130" stroke="#475569" stroke-width="4" stroke-linecap="round"/>
            <line x1="0" y1="45" x2="120" y2="45" stroke="#475569" stroke-width="4" stroke-linecap="round"/>
            <line x1="0" y1="85" x2="120" y2="85" stroke="#475569" stroke-width="4" stroke-linecap="round"/>
            <!-- X and O -->
            <text x="20" y="35" font-family="system-ui, sans-serif" font-size="28" font-weight="900" fill="#06b6d4" text-anchor="middle">X</text>
            <circle cx="60" cy="22" r="14" fill="none" stroke="#ec4899" stroke-width="4"/>
            <text x="100" y="35" font-family="system-ui, sans-serif" font-size="28" font-weight="900" fill="#06b6d4" text-anchor="middle">X</text>
            <circle cx="20" cy="65" r="14" fill="none" stroke="#ec4899" stroke-width="4"/>
            <text x="60" y="75" font-family="system-ui, sans-serif" font-size="28" font-weight="900" fill="#06b6d4" text-anchor="middle">X</text>
            <circle cx="100" cy="105" r="14" fill="none" stroke="#ec4899" stroke-width="4"/>
            <!-- Strike line -->
            <line x1="0" y1="15" x2="120" y2="120" stroke="#facc15" stroke-width="4" stroke-linecap="round"/>
          </g>
        </svg>
      `;

    default:
      // Generic high-res arcade visualizer tailored to category colors
      return `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 180" width="100%" height="100%">
          <defs>
            <linearGradient id="bgGrad_${gameId}" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#1e1b4b"/>
              <stop offset="50%" stop-color="#0f172a"/>
              <stop offset="100%" stop-color="#172554"/>
            </linearGradient>
            <pattern id="grid_${gameId}" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(255,255,255,0.05)" stroke-width="1"/>
            </pattern>
          </defs>
          <rect width="320" height="180" fill="url(#bgGrad_${gameId})"/>
          <rect width="320" height="180" fill="url(#grid_${gameId})"/>
          <!-- Arcade Glow Element -->
          <circle cx="160" cy="80" r="45" fill="#8b5cf6" opacity="0.15"/>
          <circle cx="160" cy="80" r="30" fill="none" stroke="#38bdf8" stroke-width="2"/>
          <polygon points="152,70 172,80 152,90" fill="#38bdf8"/>
          <!-- Retro Scanlines -->
          <line x1="40" y1="135" x2="280" y2="135" stroke="#a855f7" stroke-width="2" stroke-linecap="round"/>
          <text x="160" y="152" font-family="system-ui, sans-serif" font-size="12" font-weight="bold" fill="#e2e8f0" text-anchor="middle" letter-spacing="2">
            ${gameId.replace(/-/g, ' ').toUpperCase()}
          </text>
        </svg>
      `;
  }
}

export function getGameThumbnailUrl(gameId: string): string {
  const svg = getGamePreviewSvg(gameId);
  return encodeSvg(svg);
}
