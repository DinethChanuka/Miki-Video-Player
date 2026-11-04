/**
 * Themed Right-Side Hero Visual Artworks for Mikey Player Home Dashboard
 *
 * 100% offline-resilient vector artwork encoded as SVG data URIs.
 * Designed to faithfully reproduce the user's reference designs:
 * - Spider-Man (Multiverse Miles Morales & neon web nexus)
 * - The SOUL CONDUCTOR (Ethereal soul transference & hooded mystic)
 * - Broadcast Operations (Global telemetry satellite, radar dish & waveform feeds)
 * - Cyber Arcade (Synthwave neon arcade, vector starfighter & CRT scanlines)
 * - 3D Audio Synthesizer (Holographic headphones & circular spectrum rings)
 * - Anime Cyberpunk (Neo-Tokyo skyline, giant neon moon & katana wanderer)
 */

function encodeSvg(svg: string): string {
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg.trim())}`;
}

export const HERO_ARTWORKS = {
  // Spider-Man: Across the Spider-Verse
  spiderMan: encodeSvg(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 480" width="100%" height="100%">
      <defs>
        <radialGradient id="portalGlow" cx="60%" cy="45%" r="55%">
          <stop offset="0%" stop-color="#ff0055" stop-opacity="0.45"/>
          <stop offset="45%" stop-color="#00e5ff" stop-opacity="0.25"/>
          <stop offset="85%" stop-color="#090d16" stop-opacity="0.95"/>
          <stop offset="100%" stop-color="#090d16" stop-opacity="1"/>
        </radialGradient>
        <linearGradient id="suitGrad" x1="20%" y1="0%" x2="80%" y2="100%">
          <stop offset="0%" stop-color="#1e2230"/>
          <stop offset="50%" stop-color="#0e111a"/>
          <stop offset="100%" stop-color="#06070a"/>
        </linearGradient>
        <linearGradient id="spiderRed" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#ff1a53"/>
          <stop offset="100%" stop-color="#b3002d"/>
        </linearGradient>
        <filter id="neonGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="6" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="intenseGlow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="12" result="blur1" />
          <feGaussianBlur stdDeviation="4" result="blur2" />
          <feMerge>
            <feMergeNode in="blur1" />
            <feMergeNode in="blur2" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <!-- Background Atmosphere & Fade -->
      <rect width="640" height="480" fill="url(#portalGlow)"/>

      <!-- Multiverse Glitch Rings -->
      <g opacity="0.35" stroke="#00e5ff" stroke-width="1.5" fill="none">
        <circle cx="380" cy="220" r="140" stroke-dasharray="8 6"/>
        <circle cx="380" cy="220" r="190" stroke-dasharray="14 10"/>
        <circle cx="380" cy="220" r="240" stroke-dasharray="4 8"/>
      </g>
      <g opacity="0.3" stroke="#ff0055" stroke-width="2" fill="none">
        <circle cx="380" cy="220" r="110" stroke-dasharray="16 8"/>
        <circle cx="380" cy="220" r="170" stroke-dasharray="20 12"/>
      </g>

      <!-- Perspective Neon Spider Web Lines -->
      <g stroke="#ff0055" stroke-width="1.2" opacity="0.45" filter="url(#neonGlow)">
        <line x1="380" y1="220" x2="100" y2="40"/>
        <line x1="380" y1="220" x2="640" y2="60"/>
        <line x1="380" y1="220" x2="620" y2="460"/>
        <line x1="380" y1="220" x2="180" y2="480"/>
        <line x1="380" y1="220" x2="50" y2="280"/>
        <line x1="380" y1="220" x2="520" y2="20"/>
      </g>

      <!-- Web polygon cross rings -->
      <path d="M 280,160 L 450,150 L 510,240 L 430,320 L 290,290 Z" fill="none" stroke="#00e5ff" stroke-width="1" opacity="0.35"/>
      <path d="M 220,130 L 490,110 L 570,250 L 470,360 L 240,320 Z" fill="none" stroke="#ff0055" stroke-width="1.2" opacity="0.3"/>

      <!-- Miles Morales Mask & Torso Silhouette -->
      <g transform="translate(240, 60)">
        <!-- Shoulders / Upper Torso -->
        <path d="M 60,380 C 70,300 110,260 170,240 C 230,260 270,300 280,380 Z" fill="url(#suitGrad)" stroke="#1a2233" stroke-width="2"/>
        
        <!-- Chest Spider Emblem -->
        <g transform="translate(170, 290)" filter="url(#intenseGlow)">
          <path d="M 0,-15 L 8,-3 L 15,-10 L 12,5 L 25,2 L 14,12 L 20,25 L 8,18 L 0,35 L -8,18 L -20,25 L -14,12 L -25,2 L -12,5 L -15,-10 L -8,-3 Z" fill="url(#spiderRed)"/>
        </g>

        <!-- Head / Mask -->
        <ellipse cx="170" cy="160" rx="85" ry="105" fill="url(#suitGrad)" stroke="#222b3d" stroke-width="2.5"/>

        <!-- Mask Web Pattern Lines -->
        <g stroke="#ff1a53" stroke-width="1.4" opacity="0.75">
          <path d="M 170,60 Q 170,160 170,265" fill="none"/>
          <path d="M 170,160 Q 130,155 85,160" fill="none"/>
          <path d="M 170,160 Q 210,155 255,160" fill="none"/>
          <path d="M 170,160 Q 120,110 100,85" fill="none"/>
          <path d="M 170,160 Q 220,110 240,85" fill="none"/>
          <path d="M 170,160 Q 115,210 95,230" fill="none"/>
          <path d="M 170,160 Q 225,210 245,230" fill="none"/>
        </g>

        <!-- Right Eye Lens (Widescreen angle) -->
        <g filter="url(#neonGlow)">
          <path d="M 185,130 C 215,132 245,152 248,175 C 248,192 215,198 188,180 C 182,176 182,145 185,130 Z" fill="#ffffff" stroke="#ff0055" stroke-width="4.5"/>
          <path d="M 190,136 C 212,138 238,154 240,172 C 240,185 214,190 192,176 Z" fill="#00e5ff" opacity="0.35"/>
        </g>

        <!-- Left Eye Lens -->
        <g filter="url(#neonGlow)">
          <path d="M 155,130 C 125,132 95,152 92,175 C 92,192 125,198 152,180 C 158,176 158,145 155,130 Z" fill="#ffffff" stroke="#ff0055" stroke-width="4.5"/>
          <path d="M 150,136 C 128,138 102,154 100,172 C 100,185 126,190 148,176 Z" fill="#00e5ff" opacity="0.35"/>
        </g>
      </g>

      <!-- Multiverse Floating Sparks / Hexes -->
      <g fill="#00e5ff" opacity="0.75" filter="url(#neonGlow)">
        <polygon points="520,80 526,84 526,92 520,96 514,92 514,84"/>
        <polygon points="460,340 468,345 468,355 460,360 452,355 452,345"/>
        <polygon points="580,280 585,283 585,290 580,293 575,290 575,283"/>
      </g>
      <g fill="#ff0055" opacity="0.75" filter="url(#neonGlow)">
        <circle cx="560" cy="140" r="3.5"/>
        <circle cx="320" cy="380" r="4"/>
        <circle cx="210" cy="110" r="2.5"/>
      </g>

      <!-- Smooth Left Edge Gradient Blend to UI Background #090d16 -->
      <rect x="0" y="0" width="220" height="480" fill="url(#portalFadeLeft)"/>
      <defs>
        <linearGradient id="portalFadeLeft" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#090d16" stop-opacity="1"/>
          <stop offset="60%" stop-color="#090d16" stop-opacity="0.85"/>
          <stop offset="100%" stop-color="#090d16" stop-opacity="0"/>
        </linearGradient>
      </defs>
    </svg>
  `),

  // The SOUL CONDUCTOR (Mystic hooded silhouette & ethereal spirit face)
  soulConductor: encodeSvg(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 480" width="100%" height="100%">
      <defs>
        <radialGradient id="soulGlow" cx="65%" cy="45%" r="60%">
          <stop offset="0%" stop-color="#38bdf8" stop-opacity="0.5"/>
          <stop offset="35%" stop-color="#e11d48" stop-opacity="0.35"/>
          <stop offset="75%" stop-color="#0a0a14" stop-opacity="0.95"/>
          <stop offset="100%" stop-color="#0a0a14" stop-opacity="1"/>
        </radialGradient>
        <filter id="soulBlur" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="8" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="spectralGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="16" result="bigBlur" />
          <feGaussianBlur stdDeviation="5" result="sharpBlur" />
          <feMerge>
            <feMergeNode in="bigBlur" />
            <feMergeNode in="sharpBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <!-- Ambient void background -->
      <rect width="640" height="480" fill="url(#soulGlow)"/>

      <!-- Spectral Tendrils & Telepathic Energy Streams -->
      <g stroke="#38bdf8" stroke-width="2" fill="none" opacity="0.6" filter="url(#soulBlur)">
        <path d="M 330,220 C 370,180 410,240 460,200 C 490,175 510,190 530,210"/>
        <path d="M 310,250 C 360,270 420,210 470,250 C 500,270 520,240 540,230"/>
        <path d="M 340,190 C 390,160 430,210 480,180 C 510,160 530,170 550,185"/>
      </g>
      <g stroke="#e11d48" stroke-width="2.5" fill="none" opacity="0.55" filter="url(#soulBlur)">
        <path d="M 320,280 C 370,300 400,260 450,290 C 490,310 520,280 550,295"/>
        <path d="M 350,160 C 380,130 420,170 460,140 C 490,120 520,140 550,150"/>
      </g>

      <!-- Translucent Ethereal Spirit Profile (Left Face) -->
      <g transform="translate(240, 100)" filter="url(#spectralGlow)">
        <!-- Cyan Luminescent Spirit Head -->
        <path d="M 120,40 C 90,60 70,100 70,140 C 70,160 78,175 88,185 C 92,190 85,200 80,210 C 75,220 85,228 95,228 C 98,235 92,245 96,252 C 102,260 115,262 125,258 C 135,275 160,285 185,280 C 170,230 160,150 150,80 Z" fill="#38bdf8" opacity="0.65"/>
        <ellipse cx="102" cy="155" rx="6" ry="3" fill="#ffffff" opacity="0.9"/>
        <!-- Mystic Sigil Forehead Light -->
        <circle cx="115" cy="100" r="4" fill="#ffffff" filter="url(#soulBlur)"/>
      </g>

      <!-- Hooded Mystic Silhouette (Right Figure) -->
      <g transform="translate(390, 80)">
        <!-- Dark Hood Outer Cloak -->
        <path d="M 90,35 C 50,45 30,80 25,140 C 20,200 10,280 0,380 L 220,380 C 215,310 205,230 195,150 C 185,90 150,40 105,35 Z" fill="#0d111a" stroke="#232938" stroke-width="2"/>
        
        <!-- Hood Edge Highlight & Face Cavity -->
        <path d="M 90,45 C 65,55 50,85 45,130 C 40,175 55,210 70,230 C 85,245 105,245 115,230 C 120,200 120,150 115,110 C 110,75 100,50 90,45 Z" fill="#05070a"/>
        
        <!-- Subtle Warm Face Contour inside Hood -->
        <path d="M 52,135 C 55,145 62,150 68,150 C 72,155 70,165 74,170 C 78,175 86,174 90,170 C 92,185 85,205 78,215" fill="none" stroke="#f43f5e" stroke-width="2" opacity="0.65" filter="url(#soulBlur)"/>
        <circle cx="68" cy="142" r="2.5" fill="#fecdd3" opacity="0.85"/>

        <!-- Extended Mystical Hand towards Spirit -->
        <path d="M 30,260 C 0,250 -30,245 -60,240 C -68,238 -75,242 -72,248 C -68,255 -55,258 -45,262 C -30,268 0,280 25,295 Z" fill="#1e2433" stroke="#f43f5e" stroke-width="1.5" opacity="0.8"/>
      </g>

      <!-- Particle Swarm -->
      <g fill="#38bdf8" opacity="0.8" filter="url(#soulBlur)">
        <circle cx="360" cy="140" r="2"/>
        <circle cx="410" cy="230" r="3"/>
        <circle cx="480" cy="110" r="1.5"/>
        <circle cx="330" cy="320" r="2.5"/>
        <circle cx="560" cy="260" r="2"/>
      </g>
      <g fill="#f43f5e" opacity="0.8" filter="url(#soulBlur)">
        <circle cx="390" cy="300" r="2.5"/>
        <circle cx="440" cy="180" r="2"/>
        <circle cx="510" cy="340" r="3"/>
      </g>

      <!-- Left Gradient Fade to #0a0a14 -->
      <rect x="0" y="0" width="220" height="480" fill="url(#soulFadeLeft)"/>
      <defs>
        <linearGradient id="soulFadeLeft" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#0a0a14" stop-opacity="1"/>
          <stop offset="60%" stop-color="#0a0a14" stop-opacity="0.85"/>
          <stop offset="100%" stop-color="#0a0a14" stop-opacity="0"/>
        </linearGradient>
      </defs>
    </svg>
  `),

  // Broadcast Center / Live TV Operations
  broadcastCenter: encodeSvg(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 480" width="100%" height="100%">
      <defs>
        <radialGradient id="satGlow" cx="65%" cy="40%" r="60%">
          <stop offset="0%" stop-color="#0284c7" stop-opacity="0.45"/>
          <stop offset="40%" stop-color="#4f46e5" stop-opacity="0.25"/>
          <stop offset="80%" stop-color="#070c18" stop-opacity="0.95"/>
          <stop offset="100%" stop-color="#070c18" stop-opacity="1"/>
        </radialGradient>
        <filter id="radarGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="5" result="blur"/>
          <feMerge>
            <feMergeNode in="blur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>

      <rect width="640" height="480" fill="url(#satGlow)"/>

      <!-- Global Latitude / Longitude Sphere -->
      <g transform="translate(420, 230)" opacity="0.3" stroke="#38bdf8" stroke-width="1.2" fill="none">
        <circle cx="0" cy="0" r="160"/>
        <ellipse cx="0" cy="0" rx="160" ry="60"/>
        <ellipse cx="0" cy="0" rx="160" ry="110"/>
        <ellipse cx="0" cy="0" rx="60" ry="160"/>
        <ellipse cx="0" cy="0" rx="110" ry="160"/>
        <line x1="-160" y1="0" x2="160" y2="0"/>
        <line x1="0" y1="-160" x2="0" y2="160"/>
      </g>

      <!-- Satellite Dish & Transceiver -->
      <g transform="translate(360, 140)" filter="url(#radarGlow)">
        <!-- Mounting Base & Gimbal -->
        <path d="M 80,240 L 90,160 L 110,160 L 120,240 Z" fill="#1e293b" stroke="#38bdf8" stroke-width="2"/>
        <circle cx="100" cy="155" r="14" fill="#334155" stroke="#38bdf8" stroke-width="2"/>

        <!-- Main Parabolic Dish Shell -->
        <path d="M 10,70 C 60,150 140,150 190,70 C 160,110 80,110 10,70 Z" fill="#0f172a" stroke="#00f2fe" stroke-width="3.5"/>
        <ellipse cx="100" cy="80" rx="85" ry="32" fill="#1e293b" stroke="#38bdf8" stroke-width="2"/>

        <!-- Feed Horn & Quad-Strut -->
        <line x1="20" y1="80" x2="100" y2="0" stroke="#38bdf8" stroke-width="2"/>
        <line x1="180" y1="80" x2="100" y2="0" stroke="#38bdf8" stroke-width="2"/>
        <circle cx="100" cy="0" r="10" fill="#f43f5e" stroke="#ffffff" stroke-width="2"/>

        <!-- Radiating Microwaves / Broadcast Waves -->
        <g stroke="#38bdf8" stroke-width="2" fill="none" opacity="0.8">
          <path d="M 80,-20 A 30 30 0 0 1 120 -20"/>
          <path d="M 65,-40 A 55 55 0 0 1 135 -40" stroke-width="2.5"/>
          <path d="M 50,-60 A 80 80 0 0 1 150 -60" stroke-width="3" stroke="#00f2fe"/>
        </g>
      </g>

      <!-- Telemetry Monitor Panels with Audio/Video Waveforms -->
      <g transform="translate(440, 280)">
        <rect x="0" y="0" width="160" height="90" rx="8" fill="#090d16" stroke="#38bdf8" stroke-width="2" opacity="0.9"/>
        <path d="M 10,45 L 30,45 L 40,25 L 50,65 L 60,35 L 70,55 L 80,45 L 100,45 L 110,20 L 120,70 L 130,45 L 150,45" fill="none" stroke="#22c55e" stroke-width="2.5" filter="url(#radarGlow)"/>
        <text x="12" y="20" fill="#94a3b8" font-size="10" font-family="monospace" font-weight="bold">CH-01 // 1080p60</text>
      </g>

      <!-- Broadcast Status Blinking Beacons -->
      <circle cx="560" cy="90" r="5" fill="#ef4444" filter="url(#radarGlow)"/>
      <circle cx="580" cy="90" r="3" fill="#22c55e"/>
      <circle cx="600" cy="90" r="3" fill="#3b82f6"/>

      <!-- Smooth Left Edge Gradient Fade to #070c18 -->
      <rect x="0" y="0" width="220" height="480" fill="url(#broadFadeLeft)"/>
      <defs>
        <linearGradient id="broadFadeLeft" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#070c18" stop-opacity="1"/>
          <stop offset="60%" stop-color="#070c18" stop-opacity="0.85"/>
          <stop offset="100%" stop-color="#070c18" stop-opacity="0"/>
        </linearGradient>
      </defs>
    </svg>
  `),

  // Cyber Arcade (Neon retro synthwave cabinet & starfighters)
  cyberArcade: encodeSvg(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 480" width="100%" height="100%">
      <defs>
        <radialGradient id="arcadeGlow" cx="65%" cy="45%" r="60%">
          <stop offset="0%" stop-color="#ec4899" stop-opacity="0.45"/>
          <stop offset="40%" stop-color="#8b5cf6" stop-opacity="0.3"/>
          <stop offset="80%" stop-color="#080714" stop-opacity="0.95"/>
          <stop offset="100%" stop-color="#080714" stop-opacity="1"/>
        </radialGradient>
        <filter id="synthGlow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="6" result="blur"/>
          <feMerge>
            <feMergeNode in="blur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>

      <rect width="640" height="480" fill="url(#arcadeGlow)"/>

      <!-- Perspective Neon Synthwave Grid Floor -->
      <g stroke="#ec4899" stroke-width="1.5" opacity="0.45" filter="url(#synthGlow)">
        <line x1="200" y1="360" x2="640" y2="360"/>
        <line x1="160" y1="390" x2="640" y2="390"/>
        <line x1="120" y1="430" x2="640" y2="430"/>
        <line x1="80" y1="480" x2="640" y2="480"/>
        
        <!-- Vanishing perspective rays -->
        <line x1="450" y1="320" x2="150" y2="480"/>
        <line x1="450" y1="320" x2="250" y2="480"/>
        <line x1="450" y1="320" x2="350" y2="480"/>
        <line x1="450" y1="320" x2="450" y2="480"/>
        <line x1="450" y1="320" x2="550" y2="480"/>
        <line x1="450" y1="320" x2="640" y2="460"/>
      </g>

      <!-- Retro Neon Sun -->
      <g transform="translate(450, 220)">
        <circle cx="0" cy="0" r="70" fill="#f43f5e" opacity="0.85" filter="url(#synthGlow)"/>
        <!-- Sun horizontal slice blinds -->
        <line x1="-70" y1="10" x2="70" y2="10" stroke="#080714" stroke-width="4"/>
        <line x1="-65" y1="24" x2="65" y2="24" stroke="#080714" stroke-width="6"/>
        <line x1="-55" y1="42" x2="55" y2="42" stroke="#080714" stroke-width="8"/>
        <line x1="-40" y1="60" x2="40" y2="60" stroke="#080714" stroke-width="10"/>
      </g>

      <!-- Arcade Cabinet Silhouette & CRT Display -->
      <g transform="translate(320, 110)" filter="url(#synthGlow)">
        <!-- Cabinet body -->
        <path d="M 30,30 L 120,10 L 150,50 L 140,250 L 5,270 L 0,80 Z" fill="#131126" stroke="#06b6d4" stroke-width="2.5"/>
        <path d="M 120,10 L 170,30 L 190,240 L 140,250 Z" fill="#0d0b1a" stroke="#8b5cf6" stroke-width="2"/>
        
        <!-- Marquee Sign -->
        <polygon points="35,35 115,20 115,55 35,65" fill="#ec4899" stroke="#ffffff" stroke-width="1.5"/>
        <text x="44" y="52" fill="#ffffff" font-size="11" font-family="sans-serif" font-weight="900" letter-spacing="2">ARCADE</text>

        <!-- Glowing Beveled CRT Monitor -->
        <polygon points="25,75 115,65 110,165 20,170" fill="#030712" stroke="#06b6d4" stroke-width="2"/>
        <!-- CRT Game Graphics -->
        <g transform="translate(30, 85)">
          <!-- Pixel Starfighter -->
          <polygon points="40,20 48,35 44,40 40,36 36,40 32,35" fill="#00f2fe"/>
          <circle cx="40" cy="12" r="2" fill="#ec4899"/>
          <line x1="20" y1="65" x2="30" y2="60" stroke="#a855f7" stroke-width="2"/>
          <line x1="50" y1="60" x2="60" y2="65" stroke="#a855f7" stroke-width="2"/>
        </g>

        <!-- Joystick & Push Buttons -->
        <path d="M 15,180 L 125,175 L 120,225 L 10,230 Z" fill="#1e1b4b" stroke="#ec4899" stroke-width="1.5"/>
        <!-- Balltop Joystick -->
        <line x1="45" y1="195" x2="40" y2="180" stroke="#94a3b8" stroke-width="4"/>
        <circle cx="39" cy="176" r="7" fill="#ef4444" filter="url(#synthGlow)"/>
        <!-- Buttons -->
        <circle cx="70" cy="195" r="5" fill="#06b6d4"/>
        <circle cx="85" cy="190" r="5" fill="#eab308"/>
        <circle cx="100" cy="195" r="5" fill="#22c55e"/>
      </g>

      <!-- Flying Vector Starfighters in Horizon -->
      <g stroke="#00f2fe" stroke-width="2" fill="none" opacity="0.8" filter="url(#synthGlow)">
        <polygon points="560,90 575,100 565,103 560,99 555,103 545,100"/>
        <polygon points="280,180 290,186 284,188 280,185 276,188 270,186" opacity="0.6"/>
      </g>

      <!-- Left Gradient Fade to #080714 -->
      <rect x="0" y="0" width="220" height="480" fill="url(#arcadeFadeLeft)"/>
      <defs>
        <linearGradient id="arcadeFadeLeft" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#080714" stop-opacity="1"/>
          <stop offset="60%" stop-color="#080714" stop-opacity="0.85"/>
          <stop offset="100%" stop-color="#080714" stop-opacity="0"/>
        </linearGradient>
      </defs>
    </svg>
  `),

  // 3D Music Synthesizer & Headphones
  audioSynthesizer: encodeSvg(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 480" width="100%" height="100%">
      <defs>
        <radialGradient id="audioGlow" cx="65%" cy="45%" r="60%">
          <stop offset="0%" stop-color="#8b5cf6" stop-opacity="0.45"/>
          <stop offset="35%" stop-color="#f59e0b" stop-opacity="0.3"/>
          <stop offset="80%" stop-color="#090a12" stop-opacity="0.95"/>
          <stop offset="100%" stop-color="#090a12" stop-opacity="1"/>
        </radialGradient>
        <filter id="musicGlow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="7" result="blur"/>
          <feMerge>
            <feMergeNode in="blur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>

      <rect width="640" height="480" fill="url(#audioGlow)"/>

      <!-- Circular Radial Spectrum Equalizer Rings -->
      <g transform="translate(430, 240)" opacity="0.55" filter="url(#musicGlow)">
        <!-- Outer frequency ring -->
        <circle cx="0" cy="0" r="160" stroke="#8b5cf6" stroke-width="1.5" stroke-dasharray="3 7" fill="none"/>
        <circle cx="0" cy="0" r="130" stroke="#f59e0b" stroke-width="2" stroke-dasharray="8 6" fill="none"/>
        <circle cx="0" cy="0" r="100" stroke="#ec4899" stroke-width="2.5" stroke-dasharray="14 10" fill="none"/>
      </g>

      <!-- Holographic Over-Ear Headphones (Perspective 3D angle) -->
      <g transform="translate(340, 110)" filter="url(#musicGlow)">
        <!-- Padded Headband Arch -->
        <path d="M 40,150 C 40,30 200,30 200,150" fill="none" stroke="#2e1065" stroke-width="28" stroke-linecap="round"/>
        <path d="M 40,150 C 40,30 200,30 200,150" fill="none" stroke="#8b5cf6" stroke-width="6" stroke-linecap="round"/>
        
        <!-- Left Ear Cup (Angled) -->
        <g transform="translate(25, 140)">
          <ellipse cx="15" cy="40" rx="22" ry="42" fill="#0f172a" stroke="#8b5cf6" stroke-width="3.5"/>
          <ellipse cx="15" cy="40" rx="14" ry="30" fill="#1e1b4b" stroke="#f59e0b" stroke-width="2"/>
          <circle cx="15" cy="40" r="6" fill="#ec4899"/>
        </g>

        <!-- Right Ear Cup (Facing viewer) -->
        <g transform="translate(180, 140)">
          <ellipse cx="15" cy="40" rx="25" ry="46" fill="#0f172a" stroke="#8b5cf6" stroke-width="3.5"/>
          <ellipse cx="15" cy="40" rx="16" ry="34" fill="#1e1b4b" stroke="#f59e0b" stroke-width="2"/>
          <circle cx="15" cy="40" r="8" fill="#ec4899"/>
        </g>
      </g>

      <!-- Floating 3D Soundwaves / Sinusoids -->
      <g stroke="#38bdf8" stroke-width="2.5" fill="none" opacity="0.75" filter="url(#musicGlow)">
        <path d="M 230,360 Q 280,310 330,360 T 430,360 T 530,360 T 630,360"/>
        <path d="M 250,380 Q 300,430 350,380 T 450,380 T 550,380 T 640,380" stroke="#f59e0b" stroke-width="2"/>
      </g>

      <!-- Floating Music Notes & Sound Sparkles -->
      <g fill="#f59e0b" opacity="0.85" filter="url(#musicGlow)">
        <circle cx="540" cy="110" r="3"/>
        <circle cx="310" cy="180" r="3.5"/>
        <circle cx="580" cy="270" r="2.5"/>
      </g>

      <!-- Left Gradient Fade to #090a12 -->
      <rect x="0" y="0" width="220" height="480" fill="url(#audioFadeLeft)"/>
      <defs>
        <linearGradient id="audioFadeLeft" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#090a12" stop-opacity="1"/>
          <stop offset="60%" stop-color="#090a12" stop-opacity="0.85"/>
          <stop offset="100%" stop-color="#090a12" stop-opacity="0"/>
        </linearGradient>
      </defs>
    </svg>
  `),

  // Anime & Cyberpunk Series (Neo-Tokyo skyline, giant moon & katana silhouette)
  animeCyberpunk: encodeSvg(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 480" width="100%" height="100%">
      <defs>
        <radialGradient id="animeGlow" cx="65%" cy="40%" r="60%">
          <stop offset="0%" stop-color="#e11d48" stop-opacity="0.5"/>
          <stop offset="40%" stop-color="#6366f1" stop-opacity="0.3"/>
          <stop offset="80%" stop-color="#0a0714" stop-opacity="0.95"/>
          <stop offset="100%" stop-color="#0a0714" stop-opacity="1"/>
        </radialGradient>
        <filter id="animeNeon" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="6" result="blur"/>
          <feMerge>
            <feMergeNode in="blur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>

      <rect width="640" height="480" fill="url(#animeGlow)"/>

      <!-- Giant Blood-Orange Cyberpunk Moon -->
      <circle cx="460" cy="180" r="95" fill="#f43f5e" opacity="0.8" filter="url(#animeNeon)"/>
      <circle cx="460" cy="180" r="85" fill="#fb7185" opacity="0.4"/>

      <!-- Neo-Tokyo Skyscraper Skylines -->
      <g fill="#0c091d" stroke="#6366f1" stroke-width="1.2">
        <rect x="330" y="240" width="45" height="240"/>
        <rect x="380" y="200" width="55" height="280"/>
        <rect x="440" y="260" width="40" height="220"/>
        <rect x="490" y="170" width="60" height="310"/>
        <rect x="560" y="220" width="70" height="260"/>
      </g>

      <!-- Neon Window Grid Matrices on Buildings -->
      <g fill="#38bdf8" opacity="0.6">
        <rect x="390" y="220" width="4" height="6"/>
        <rect x="400" y="220" width="4" height="6"/>
        <rect x="410" y="220" width="4" height="6"/>
        <rect x="390" y="240" width="4" height="6"/>
        <rect x="410" y="240" width="4" height="6"/>
        <rect x="505" y="190" width="5" height="8" fill="#f43f5e"/>
        <rect x="520" y="190" width="5" height="8" fill="#f43f5e"/>
        <rect x="505" y="210" width="5" height="8" fill="#f43f5e"/>
      </g>

      <!-- Anime Swordsman / Ronin Silhouette on Rooftop -->
      <g transform="translate(360, 165)" filter="url(#animeNeon)">
        <!-- Flowing Scarf / Cape -->
        <path d="M 40,85 C 10,80 -20,65 -50,55 C -30,75 -10,95 30,100 Z" fill="#e11d48"/>
        
        <!-- Torso & Trenchcoat -->
        <path d="M 35,70 L 55,70 L 65,130 L 25,130 Z" fill="#05030a" stroke="#f43f5e" stroke-width="1"/>
        <!-- Head & Hair Spike Silhouette -->
        <circle cx="45" cy="55" r="12" fill="#05030a"/>
        <polygon points="38,45 44,32 48,45" fill="#05030a"/>
        <polygon points="46,45 52,36 55,48" fill="#05030a"/>
        <polygon points="32,50 25,40 36,52" fill="#05030a"/>

        <!-- Glowing Katana Blade -->
        <line x1="30" y1="65" x2="-25" y2="15" stroke="#38bdf8" stroke-width="3" filter="url(#animeNeon)"/>
        <line x1="-25" y1="15" x2="-28" y2="12" stroke="#ffffff" stroke-width="3.5"/>
      </g>

      <!-- Flying Neon Cyber-Vehicles (Spinners) -->
      <g filter="url(#animeNeon)">
        <line x1="280" y1="130" x2="330" y2="126" stroke="#38bdf8" stroke-width="2.5"/>
        <line x1="320" y1="126" x2="330" y2="126" stroke="#ffffff" stroke-width="3.5"/>
        
        <line x1="570" y1="110" x2="620" y2="114" stroke="#f43f5e" stroke-width="2"/>
      </g>

      <!-- Left Gradient Fade to #0a0714 -->
      <rect x="0" y="0" width="220" height="480" fill="url(#animeFadeLeft)"/>
      <defs>
        <linearGradient id="animeFadeLeft" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#0a0714" stop-opacity="1"/>
          <stop offset="60%" stop-color="#0a0714" stop-opacity="0.85"/>
          <stop offset="100%" stop-color="#0a0714" stop-opacity="0"/>
        </linearGradient>
      </defs>
    </svg>
  `),
};

/**
 * Returns the matching hero artwork for the currently active section or category
 */
export function getHeroArtworkForSection(sectionId: string): string {
  switch (sectionId.toLowerCase()) {
    case 'movies':
    case 'movie':
      return HERO_ARTWORKS.soulConductor;
    case 'channels':
    case 'live tv':
    case 'livetv':
      return HERO_ARTWORKS.broadcastCenter;
    case 'games':
    case 'game':
      return HERO_ARTWORKS.cyberArcade;
    case 'music':
      return HERO_ARTWORKS.audioSynthesizer;
    case 'series':
    case 'tv series':
    case 'animation':
    case 'anime':
      return HERO_ARTWORKS.animeCyberpunk;
    case 'all':
    case 'browse':
    default:
      return HERO_ARTWORKS.spiderMan;
  }
}
