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
  spiderMan: '/posters/spiderman.jpg',
  soulConductor: '/posters/soulconductor.jpg',
  harryPotter: '/posters/harrypotter.jpg',
  interstellar: '/posters/interstellar.jpg',
  inception: '/posters/inception.jpg',
  tenet: '/posters/tenet.jpg',
  wonderWoman: '/posters/wonderwoman.jpg',
  mortalEngines: '/posters/mortalengines.jpg',
  rampage: '/posters/rampage.jpg',
  moneyHeist: '/posters/moneyheist.jpg',
  wednesday: '/posters/wednesday.jpg',
  neverHaveIEver: '/posters/neverhaveiever.jpg',
  lucifer: '/posters/lucifer.jpg',
};

export const ALBUM_POSTERS = {
  dooriyan: '/posters/albums/dooriyan.jpg',
  soniyo: '/posters/albums/soniyo.jpg',
  binTere: '/posters/albums/bintere.jpg',
  darkhaast: '/posters/albums/darkhaast.jpg',
  tujhkoJoPaaya: '/posters/albums/tujhko.jpg',
};

export const ARTIST_AVATARS = {
  camilaCabello: '/artists/camila_cabello.jpg',
  camilaCabelloHero: '/artists/camila_cabello_hero.jpg',
  travisScott: '/artists/travis_scott.jpg',
  billieEilish: '/artists/billie_eilish.jpg',
  kanyeWest: '/artists/kanye_west.jpg',
  nickiMinaj: '/artists/nicki_minaj.jpg',
  theWeeknd: '/artists/the_weeknd.jpg',
  duaLipa: '/artists/dua_lipa.jpg',
  johnLegend: '/artists/john_legend.jpg',
  adele: '/artists/adele.jpg',
  aliciaKeys: '/artists/alicia_keys.jpg',
  brunoMars: '/artists/bruno_mars.jpg',
  samSmith: '/artists/sam_smith.jpg',
  michaelBuble: '/artists/michael_buble.jpg',
  stevieWonder: '/artists/stevie_wonder.jpg',
};
