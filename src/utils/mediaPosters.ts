/**
 * Authentic Offline Vector Posters & Cover Artwork
 * Provides instant zero-latency visual posters for Movies, TV Series, and Music Albums.
 */

function encodeSvg(svg: string): string {
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg.trim())}`;
}

export function createMoviePosterSvg(title: string, subtitle: string, rating: string, bg1: string, bg2: string, accent: string): string {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 450" width="100%" height="100%">
      <defs>
        <linearGradient id="pGrad_${title.replace(/[^a-zA-Z0-9]/g, '')}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${bg1}"/>
          <stop offset="60%" stop-color="${bg2}"/>
          <stop offset="100%" stop-color="#020408"/>
        </linearGradient>
      </defs>
      <rect width="300" height="450" rx="16" fill="url(#pGrad_${title.replace(/[^a-zA-Z0-9]/g, '')})"/>
      
      <!-- Cinematic Vignette & Light Beam -->
      <circle cx="150" cy="180" r="110" fill="${accent}" opacity="0.18"/>
      <polygon points="50,0 250,0 190,260 110,260" fill="url(#pGrad_${title.replace(/[^a-zA-Z0-9]/g, '')})" opacity="0.3"/>
      
      <!-- Film Reel Icon / Vector Graphic -->
      <circle cx="150" cy="160" r="42" fill="none" stroke="${accent}" stroke-width="3" opacity="0.6"/>
      <circle cx="150" cy="160" r="16" fill="${accent}" opacity="0.4"/>
      <polygon points="144,148 162,160 144,172" fill="#ffffff"/>
      
      <!-- Badges -->
      <rect x="24" y="24" width="70" height="24" rx="6" fill="rgba(0,0,0,0.6)" stroke="rgba(255,255,255,0.2)"/>
      <text x="59" y="40" font-family="system-ui, sans-serif" font-size="11" font-weight="900" fill="#facc15" text-anchor="middle">★ ${rating}</text>
      
      <rect x="226" y="24" width="50" height="24" rx="6" fill="${accent}" opacity="0.9"/>
      <text x="251" y="40" font-family="system-ui, sans-serif" font-size="10" font-weight="900" fill="#ffffff" text-anchor="middle">4K HDR</text>

      <!-- Bottom Gradient Banner -->
      <rect y="310" width="300" height="140" fill="url(#pGrad_${title.replace(/[^a-zA-Z0-9]/g, '')})" opacity="0.95"/>
      <line x1="24" y1="330" x2="276" y2="330" stroke="${accent}" stroke-width="2" stroke-linecap="round"/>
      
      <!-- Title & Subtitle -->
      <text x="24" y="365" font-family="system-ui, sans-serif" font-size="18" font-weight="900" fill="#ffffff">
        ${title}
      </text>
      <text x="24" y="390" font-family="system-ui, sans-serif" font-size="12" font-weight="600" fill="rgba(255,255,255,0.7)">
        ${subtitle}
      </text>
      <text x="24" y="415" font-family="system-ui, sans-serif" font-size="10" font-weight="bold" fill="${accent}" letter-spacing="1">
        WATCH IN FULL HD
      </text>
    </svg>
  `;
  return encodeSvg(svg);
}

export function createAlbumCoverSvg(title: string, artist: string, movie: string, color1: string, color2: string): string {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300" width="100%" height="100%">
      <defs>
        <linearGradient id="aGrad_${title.replace(/[^a-zA-Z0-9]/g, '')}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${color1}"/>
          <stop offset="100%" stop-color="${color2}"/>
        </linearGradient>
      </defs>
      <rect width="300" height="300" rx="18" fill="url(#aGrad_${title.replace(/[^a-zA-Z0-9]/g, '')})"/>
      
      <!-- Vinyl Disc Rim -->
      <circle cx="150" cy="120" r="70" fill="none" stroke="rgba(255,255,255,0.15)" stroke-width="20"/>
      <circle cx="150" cy="120" r="30" fill="rgba(0,0,0,0.4)"/>
      <circle cx="150" cy="120" r="8" fill="#ffffff"/>

      <!-- Sony / Studio Branding -->
      <text x="260" y="35" font-family="system-ui, sans-serif" font-size="9" font-weight="bold" fill="rgba(255,255,255,0.6)" text-anchor="end">SONY MUSIC</text>
      
      <!-- Movie Logo Banner -->
      <rect x="30" y="180" width="240" height="26" rx="4" fill="rgba(0,0,0,0.5)"/>
      <text x="150" y="198" font-family="system-ui, sans-serif" font-size="12" font-weight="900" fill="#facc15" text-anchor="middle" letter-spacing="2">
        ${movie.toUpperCase()}
      </text>

      <!-- Song Title -->
      <text x="150" y="240" font-family="system-ui, sans-serif" font-size="20" font-weight="900" fill="#ffffff" text-anchor="middle">
        ${title}
      </text>
      
      <!-- Artists -->
      <text x="150" y="265" font-family="system-ui, sans-serif" font-size="12" font-weight="600" fill="rgba(255,255,255,0.75)" text-anchor="middle">
        ${artist}
      </text>
    </svg>
  `;
  return encodeSvg(svg);
}

export const MOVIE_POSTERS = {
  spiderMan: createMoviePosterSvg('Spider-Man', 'Across the Spider-Verse', '8.9', '#7f1d1d', '#180202', '#ef4444'),
  soulConductor: createMoviePosterSvg('The SOUL CONDUCTOR', 'Paranormal Sci-Fi Thriller', '7.8', '#172554', '#020617', '#38bdf8'),
  harryPotter: createMoviePosterSvg('Harry Potter', 'Deathly Hallows Part 2', '8.1', '#14532d', '#052e16', '#22c55e'),
  interstellar: createMoviePosterSvg('Interstellar', 'Christopher Nolan Epic', '8.7', '#1e1b4b', '#030712', '#818cf8'),
  inception: createMoviePosterSvg('Inception', 'Your Mind Is The Scene', '8.8', '#312e81', '#090d16', '#6366f1'),
  tenet: createMoviePosterSvg('Tenet', 'Time Runs Out', '7.3', '#042f2e', '#021815', '#14b8a6'),
  wonderWoman: createMoviePosterSvg('Wonder Woman', 'DC Superhero Action', '7.4', '#831843', '#1e040f', '#ec4899'),
  mortalEngines: createMoviePosterSvg('Mortal Engines', 'Predator Cities Collide', '6.5', '#78350f', '#1c0c03', '#f59e0b'),
  rampage: createMoviePosterSvg('Rampage', 'Big Meets Bigger', '6.1', '#374151', '#111827', '#9ca3af'),
  moneyHeist: createMoviePosterSvg('Money Heist', 'La Casa de Papel Part 5', '8.2', '#991b1b', '#200505', '#f87171'),
  wednesday: createMoviePosterSvg('Wednesday', 'Nevermore Academy Mystery', '8.1', '#2e1065', '#0f0422', '#c084fc'),
  neverHaveIEver: createMoviePosterSvg('Never Have I Ever', 'Final Senior Year', '7.9', '#065f46', '#022118', '#34d399'),
  lucifer: createMoviePosterSvg('Lucifer', 'The Devil Has Arrived', '8.1', '#881337', '#1d040c', '#fb7185'),
};

export const ALBUM_POSTERS = {
  dooriyan: createAlbumCoverSvg('Dooriyan', 'Pritam, Mohit Chauhan', 'Love Aaj Kal', '#1e3a8a', '#0f172a'),
  soniyo: createAlbumCoverSvg('Soniyo', 'Raju Singh, Sonu Nigam', 'Raaz: The Mystery Continues', '#581c87', '#180728'),
  binTere: createAlbumCoverSvg('Bin Tere', 'Vishal-Shekhar, Shafqat Amanat Ali', 'I Hate Luv Storys', '#be123c', '#270915'),
  darkhaast: createAlbumCoverSvg('Darkhaast', 'Mithoon, Arijit Singh', 'Shivaay', '#0f766e', '#042f2e'),
  tujhkoJoPaaya: createAlbumCoverSvg('Tujhko Jo Paaya', 'Pritam, Mohit Chauhan', 'Crook', '#854d0e', '#291804'),
};
