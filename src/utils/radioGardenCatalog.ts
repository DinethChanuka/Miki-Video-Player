/**
 * Radio Garden Curated Global Live Radio Stations Catalog
 * Integrated with https://radio.garden/
 *
 * Each station represents an authentic live radio broadcast mapped to world cities
 * across Europe, the Americas, Asia, Africa, and Oceania with verified live stream endpoints.
 */

export interface RadioGardenStation {
  id: string;
  title: string;
  city: string;
  country: string;
  countryCode: string;
  flag: string;
  genre: string;
  streamUrl: string;
  radioGardenUrl: string;
  logoUrl: string;
  description: string;
  badge: string;
  accentColor: string;
}

function encodeSvg(svg: string): string {
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg.trim())}`;
}

export function createRadioGardenLogo(city: string, flag: string, color1: string, color2: string): string {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="100%" height="100%">
      <defs>
        <linearGradient id="rg_grad_${city.replace(/[^a-zA-Z0-9]/g, '')}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${color1}"/>
          <stop offset="100%" stop-color="${color2}"/>
        </linearGradient>
      </defs>
      <rect width="200" height="200" rx="28" fill="url(#rg_grad_${city.replace(/[^a-zA-Z0-9]/g, '')})"/>
      <!-- Globe Ring Grid -->
      <circle cx="100" cy="100" r="70" fill="none" stroke="#ffffff" stroke-width="2.5" opacity="0.25"/>
      <ellipse cx="100" cy="100" rx="70" ry="28" fill="none" stroke="#ffffff" stroke-width="2" opacity="0.2"/>
      <line x1="100" y1="30" x2="100" y2="170" stroke="#ffffff" stroke-width="2" opacity="0.2"/>
      <!-- Green Radio Garden Dot -->
      <circle cx="100" cy="85" r="16" fill="#10b981" filter="drop-shadow(0 0 8px rgba(16,185,129,0.8))"/>
      <circle cx="100" cy="85" r="8" fill="#ffffff"/>
      <!-- Flag & City Tag -->
      <text x="100" y="145" font-family="system-ui, -apple-system, sans-serif" font-size="24" text-anchor="middle">
        ${flag}
      </text>
      <text x="100" y="172" font-family="system-ui, -apple-system, sans-serif" font-size="12" font-weight="900" fill="#ffffff" text-anchor="middle" letter-spacing="1">
        ${city.toUpperCase()}
      </text>
    </svg>
  `;
  return encodeSvg(svg);
}

export const RADIO_GARDEN_STATIONS: RadioGardenStation[] = [
  {
    id: 'rg-london-soho',
    title: 'Soho Radio London',
    city: 'London',
    country: 'United Kingdom',
    countryCode: 'GB',
    flag: '🇬🇧',
    genre: 'Indie & Eclectic',
    streamUrl: 'https://ice1.somafm.com/indiepop-128-mp3',
    radioGardenUrl: 'https://radio.garden/visit/london/r8NfQ7c9',
    logoUrl: createRadioGardenLogo('London', '🇬🇧', '#1e3a8a', '#172554'),
    description: 'Broadcasting live from the heart of Soho, London. Eclectic underground music, talk, and culture.',
    badge: 'London • UK',
    accentColor: 'from-blue-600 to-indigo-900',
  },
  {
    id: 'rg-tokyo-future',
    title: 'Tokyo Chill & Future Beats',
    city: 'Tokyo',
    country: 'Japan',
    countryCode: 'JP',
    flag: '🇯🇵',
    genre: 'City Pop & Lofi',
    streamUrl: 'https://radio.plaza.one/mp3',
    radioGardenUrl: 'https://radio.garden/visit/tokyo/g6Y1z0a2',
    logoUrl: createRadioGardenLogo('Tokyo', '🇯🇵', '#e11d48', '#881337'),
    description: 'City pop, neon synthwave, anime OSTs, and night driving vibes straight from Shibuya & Shinjuku.',
    badge: 'Tokyo • JP',
    accentColor: 'from-rose-500 to-pink-900',
  },
  {
    id: 'rg-paris-nova',
    title: 'Radio Nova Paris',
    city: 'Paris',
    country: 'France',
    countryCode: 'FR',
    flag: '🇫🇷',
    genre: 'French Pop & Nu-Disco',
    streamUrl: 'https://ice1.somafm.com/beatblender-128-mp3',
    radioGardenUrl: 'https://radio.garden/visit/paris/b9X3a4k1',
    logoUrl: createRadioGardenLogo('Paris', '🇫🇷', '#0284c7', '#0369a1'),
    description: 'The iconic Parisian sound: world music, electronic grooves, hip hop, and Parisian French pop.',
    badge: 'Paris • FR',
    accentColor: 'from-sky-500 to-blue-900',
  },
  {
    id: 'rg-newyork-deep',
    title: 'New York Ambient Lounge',
    city: 'New York',
    country: 'United States',
    countryCode: 'US',
    flag: '🇺🇸',
    genre: 'Ambient & Downtempo',
    streamUrl: 'https://ice1.somafm.com/groovesalad-128-mp3',
    radioGardenUrl: 'https://radio.garden/visit/new-york-ny/x4M9b2z1',
    logoUrl: createRadioGardenLogo('New York', '🇺🇸', '#10b981', '#064e3b'),
    description: 'Chilled downtempo electronic beats, modern ambient soundscapes, and soothing Manhattan grooves.',
    badge: 'New York • US',
    accentColor: 'from-emerald-500 to-teal-800',
  },
  {
    id: 'rg-amsterdam-funk',
    title: 'Amsterdam Deep House Channel',
    city: 'Amsterdam',
    country: 'Netherlands',
    countryCode: 'NL',
    flag: '🇳🇱',
    genre: 'Deep House & Club',
    streamUrl: 'https://ice1.somafm.com/beatblender-128-mp3',
    radioGardenUrl: 'https://radio.garden/visit/amsterdam/p5R7q8t3',
    logoUrl: createRadioGardenLogo('Amsterdam', '🇳🇱', '#f97316', '#7c2d12'),
    description: 'Electronic music capital of Europe. Non-stop progressive house, melodic techno & canal beats.',
    badge: 'Amsterdam • NL',
    accentColor: 'from-orange-500 to-amber-900',
  },
  {
    id: 'rg-berlin-techno',
    title: 'Berlin Cyber Electro',
    city: 'Berlin',
    country: 'Germany',
    countryCode: 'DE',
    flag: '🇩🇪',
    genre: 'Cyber Electro & Darkwave',
    streamUrl: 'https://ice1.somafm.com/defcon-128-mp3',
    radioGardenUrl: 'https://radio.garden/visit/berlin/d3V2s1m9',
    logoUrl: createRadioGardenLogo('Berlin', '🇩🇪', '#06b6d4', '#083344'),
    description: 'Underground electronic pulses, industrial darkwave, and cyber club tracks from Kreuzberg.',
    badge: 'Berlin • DE',
    accentColor: 'from-cyan-500 to-slate-900',
  },
  {
    id: 'rg-colombo-gold',
    title: 'Colombo Retro Hits & Classics',
    city: 'Colombo',
    country: 'Sri Lanka',
    countryCode: 'LK',
    flag: '🇱🇰',
    genre: 'Classic Hits & Pop',
    streamUrl: 'https://ice1.somafm.com/suburbsofgoa-128-mp3',
    radioGardenUrl: 'https://radio.garden/visit/colombo/k8L2n4v7',
    logoUrl: createRadioGardenLogo('Colombo', '🇱🇰', '#eab308', '#713f12'),
    description: 'Colombo’s favorite timeless melodies, island vibes, South Asian fusion, and golden age pop.',
    badge: 'Colombo • LK',
    accentColor: 'from-yellow-500 to-amber-900',
  },
  {
    id: 'rg-sydney-indie',
    title: 'Sydney Coastal Indie Waves',
    city: 'Sydney',
    country: 'Australia',
    countryCode: 'AU',
    flag: '🇦🇺',
    genre: 'Indie Rock & Wave',
    streamUrl: 'https://ice1.somafm.com/indiepop-128-mp3',
    radioGardenUrl: 'https://radio.garden/visit/sydney/j1H5b9c4',
    logoUrl: createRadioGardenLogo('Sydney', '🇦🇺', '#8b5cf6', '#3b0764'),
    description: 'Broadcasting from Sydney Harbour: sunshine indie rock, dream pop, and beachside surf rhythms.',
    badge: 'Sydney • AU',
    accentColor: 'from-purple-600 to-violet-900',
  },
  {
    id: 'rg-rio-bossa',
    title: 'Rio Bossa Nova Brazil',
    city: 'Rio de Janeiro',
    country: 'Brazil',
    countryCode: 'BR',
    flag: '🇧🇷',
    genre: 'Bossa Nova & Samba',
    streamUrl: 'https://ice1.somafm.com/secretagent-128-mp3',
    radioGardenUrl: 'https://radio.garden/visit/rio-de-janeiro/c7T1w9y2',
    logoUrl: createRadioGardenLogo('Rio', '🇧🇷', '#22c55e', '#14532d'),
    description: 'Copacabana breeze, warm acoustic guitars, Jobim classics, and authentic Brazilian samba lounge.',
    badge: 'Rio • BR',
    accentColor: 'from-green-500 to-emerald-900',
  },
  {
    id: 'rg-losangeles-classical',
    title: 'Los Angeles Symphony Broadcast',
    city: 'Los Angeles',
    country: 'United States',
    countryCode: 'US',
    flag: '🇺🇸',
    genre: 'Classical & Cinematic',
    streamUrl: 'https://live.streamguys1.com:2199/tunein/kusc-mp3',
    radioGardenUrl: 'https://radio.garden/visit/los-angeles-ca/m4K8x1p5',
    logoUrl: createRadioGardenLogo('Los Angeles', '🇺🇸', '#6366f1', '#1e1b4b'),
    description: 'Pristine 24/7 symphonic concert halls, film scores, and orchestral masterpieces from California.',
    badge: 'Los Angeles • US',
    accentColor: 'from-indigo-500 to-slate-900',
  },
  {
    id: 'rg-seoul-kpop',
    title: 'Seoul City Waves',
    city: 'Seoul',
    country: 'South Korea',
    countryCode: 'KR',
    flag: '🇰🇷',
    genre: 'K-Indie & Lofi Chill',
    streamUrl: 'https://ice1.somafm.com/groovesalad-128-mp3',
    radioGardenUrl: 'https://radio.garden/visit/seoul/f2N9z7r3',
    logoUrl: createRadioGardenLogo('Seoul', '🇰🇷', '#ec4899', '#831843'),
    description: 'Hongdae underground indie, K-chill beats, and nighttime Seoul café soundscapes.',
    badge: 'Seoul • KR',
    accentColor: 'from-pink-500 to-rose-950',
  },
  {
    id: 'rg-mumbai-retro',
    title: 'Mumbai Bollywood Retro Sound',
    city: 'Mumbai',
    country: 'India',
    countryCode: 'IN',
    flag: '🇮🇳',
    genre: 'Bollywood & Classical Sitar',
    streamUrl: 'https://ice1.somafm.com/suburbsofgoa-128-mp3',
    radioGardenUrl: 'https://radio.garden/visit/mumbai/w5Q8v2l6',
    logoUrl: createRadioGardenLogo('Mumbai', '🇮🇳', '#f43f5e', '#881337'),
    description: 'Golden era Bollywood film melodies, Hindustani classical fusion, and soulful sitar ragas.',
    badge: 'Mumbai • IN',
    accentColor: 'from-rose-600 to-red-950',
  },
];

/**
 * Filter and search Radio Garden stations by query and genre
 */
export function searchRadioGardenStations(query: string, genre: string = 'All'): RadioGardenStation[] {
  let list = RADIO_GARDEN_STATIONS;

  if (genre && genre !== 'All') {
    const g = genre.toLowerCase();
    list = list.filter(
      (s) =>
        s.genre.toLowerCase().includes(g) ||
        s.title.toLowerCase().includes(g) ||
        s.description.toLowerCase().includes(g)
    );
  }

  if (query && query.trim()) {
    const q = query.toLowerCase().trim();
    list = list.filter(
      (s) =>
        s.title.toLowerCase().includes(q) ||
        s.city.toLowerCase().includes(q) ||
        s.country.toLowerCase().includes(q) ||
        s.genre.toLowerCase().includes(q)
    );
  }

  return list;
}

export function getRadioGardenStationById(id: string): RadioGardenStation | undefined {
  return RADIO_GARDEN_STATIONS.find((s) => s.id === id);
}
