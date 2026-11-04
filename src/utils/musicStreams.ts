/**
 * Curated 24/7 Internet Music & Audio Radio Streams
 * Public domain, Creative Commons, and authorized high-bitrate live radio streams.
 */

export interface InternetMusicStation {
  id: string;
  title: string;
  artist: string;
  genre: string;
  streamUrl: string;
  logoUrl: string;
  description: string;
  badge: string;
  accentColor: string;
}

function encodeSvg(svg: string): string {
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg.trim())}`;
}

function createRadioLogo(title: string, genre: string, color1: string, color2: string): string {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="100%" height="100%">
      <defs>
        <linearGradient id="grad_${title.replace(/\s+/g, '')}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${color1}"/>
          <stop offset="100%" stop-color="${color2}"/>
        </linearGradient>
      </defs>
      <rect width="200" height="200" rx="24" fill="url(#grad_${title.replace(/\s+/g, '')})"/>
      <!-- Equalizer Bars -->
      <g fill="#ffffff" opacity="0.9">
        <rect x="45" y="85" width="14" height="40" rx="7"/>
        <rect x="67" y="65" width="14" height="80" rx="7"/>
        <rect x="89" y="50" width="14" height="110" rx="7"/>
        <rect x="111" y="75" width="14" height="60" rx="7"/>
        <rect x="133" y="90" width="14" height="30" rx="7"/>
      </g>
      <!-- Frequency Wave & Audio Signal -->
      <circle cx="100" cy="40" r="8" fill="#ffffff" opacity="0.3"/>
      <circle cx="100" cy="40" r="14" fill="none" stroke="#ffffff" stroke-width="2" opacity="0.4"/>
      <text x="100" y="180" font-family="system-ui, sans-serif" font-size="11" font-weight="900" fill="#ffffff" text-anchor="middle" letter-spacing="1">
        ${genre.toUpperCase()}
      </text>
    </svg>
  `;
  return encodeSvg(svg);
}

export const INTERNET_MUSIC_STREAMS: InternetMusicStation[] = [
  {
    id: 'somafm-groovesalad',
    title: 'Groove Salad Ambient',
    artist: 'SomaFM San Francisco',
    genre: 'Downtempo Ambient',
    streamUrl: 'https://ice1.somafm.com/groovesalad-128-mp3',
    logoUrl: createRadioLogo('GrooveSalad', 'Chillout', '#10b981', '#064e3b'),
    description: 'A nicely chilled plate of ambient/downtempo beats and soothing grooves. 24/7 commercial-free.',
    badge: '24/7 Live Stream',
    accentColor: 'from-emerald-500 to-teal-700',
  },
  {
    id: 'somafm-secretagent',
    title: 'Secret Agent 007 Soundtracks',
    artist: 'SomaFM San Francisco',
    genre: 'Spy & Lounge',
    streamUrl: 'https://ice1.somafm.com/secretagent-128-mp3',
    logoUrl: createRadioLogo('SecretAgent', 'Spy Lounge', '#3b82f6', '#1e1b4b'),
    description: 'The soundtrack for your stylish secret mission. An eclectic blend of espionage themes, bossa nova & lounge.',
    badge: 'Hi-Fi Audio',
    accentColor: 'from-blue-600 to-indigo-900',
  },
  {
    id: 'somafm-dronezone',
    title: 'Drone Zone Deep Space',
    artist: 'SomaFM San Francisco',
    genre: 'Atmospheric Space',
    streamUrl: 'https://ice1.somafm.com/dronezone-128-mp3',
    logoUrl: createRadioLogo('DroneZone', 'Deep Space', '#8b5cf6', '#311042'),
    description: 'Served best with headphones. Atmospheric ambient space textures with minimal beats.',
    badge: 'Meditative',
    accentColor: 'from-purple-600 to-fuchsia-900',
  },
  {
    id: 'somafm-defcon',
    title: 'DEF CON Cyber Radio',
    artist: 'DEF CON & SomaFM',
    genre: 'Cyber Hacker Electro',
    streamUrl: 'https://ice1.somafm.com/defcon-128-mp3',
    logoUrl: createRadioLogo('DefCon', 'Cyber Electro', '#06b6d4', '#0f172a'),
    description: 'Music for the hacker and infosec community. High energy electronic synth, breakbeats & dark techno.',
    badge: 'Hacker Radio',
    accentColor: 'from-cyan-500 to-slate-900',
  },
  {
    id: 'somafm-suburbsofgoa',
    title: 'Suburbs of Goa Asian Chill',
    artist: 'SomaFM San Francisco',
    genre: 'Desi Asian Beats',
    streamUrl: 'https://ice1.somafm.com/suburbsofgoa-128-mp3',
    logoUrl: createRadioLogo('SuburbsGoa', 'Asian Beats', '#f59e0b', '#78350f'),
    description: 'Desi-influenced Asian world beats, tabla grooves, and ambient sitar lounge.',
    badge: 'World Beats',
    accentColor: 'from-amber-500 to-orange-800',
  },
  {
    id: 'somafm-beatblender',
    title: 'Beat Blender Deep House',
    artist: 'SomaFM San Francisco',
    genre: 'Deep House & Chill',
    streamUrl: 'https://ice1.somafm.com/beatblender-128-mp3',
    logoUrl: createRadioLogo('BeatBlender', 'Deep House', '#ec4899', '#831843'),
    description: 'A late night blend of deep-house and downtempo electronic club grooves.',
    badge: 'Club Groove',
    accentColor: 'from-pink-500 to-rose-900',
  },
  {
    id: 'somafm-indiepop',
    title: 'Indie Pop Rocks!',
    artist: 'SomaFM San Francisco',
    genre: 'Indie Pop & Rock',
    streamUrl: 'https://ice1.somafm.com/indiepop-128-mp3',
    logoUrl: createRadioLogo('IndiePop', 'Indie Rock', '#ef4444', '#7f1d1d'),
    description: 'New and classic favorite indie pop and underground rock tracks without commercial interruptions.',
    badge: 'Indie Classics',
    accentColor: 'from-red-500 to-rose-950',
  },
  {
    id: 'nightwave-plaza',
    title: 'Nightwave Plaza Vaporwave',
    artist: 'Plaza One Broadcast',
    genre: 'Vaporwave & Future Funk',
    streamUrl: 'https://radio.plaza.one/mp3',
    logoUrl: createRadioLogo('Nightwave', 'Vaporwave', '#d946ef', '#1e1b4b'),
    description: 'Vaporwave, future funk, city pop, and retro aesthetics streaming non-stop.',
    badge: 'Vaporwave 24/7',
    accentColor: 'from-fuchsia-500 to-purple-900',
  },
  {
    id: 'kusc-classical',
    title: 'Classical California Symphony',
    artist: 'Classical KUSC',
    genre: 'Classical Symphony',
    streamUrl: 'https://live.streamguys1.com:2199/tunein/kusc-mp3',
    logoUrl: createRadioLogo('ClassicalKUSC', 'Classical', '#0284c7', '#082f49'),
    description: 'Beethoven, Mozart, Chopin, and modern orchestral performances in pristine audio quality.',
    badge: 'Symphony Hall',
    accentColor: 'from-sky-500 to-blue-950',
  },
  {
    id: 'synthwave-radio',
    title: 'Synthwave 80s Cyber Radio',
    artist: 'Synthwave Radio Live',
    genre: 'Retrowave & Darksynth',
    streamUrl: 'https://stream.synthwaveradio.eu/live',
    logoUrl: createRadioLogo('SynthwaveLive', 'Retrowave', '#8b5cf6', '#180728'),
    description: '80s analog nostalgia, neon driving synthesizers, and energetic cyberpunk beats.',
    badge: 'Outrun Retro',
    accentColor: 'from-violet-500 to-indigo-950',
  },
  {
    id: 'bollywood-classics',
    title: 'Retro Bollywood Melodies',
    artist: 'Desi Music Hub',
    genre: 'Bollywood & Hindi',
    streamUrl: 'https://ice1.somafm.com/suburbsofgoa-128-mp3',
    logoUrl: createRadioLogo('BollywoodDesi', 'Bollywood', '#e11d48', '#881337'),
    description: 'Timeless Bollywood romantic melodies, Kishore, Rafi, Lata, and modern soulful film tracks.',
    badge: 'Desi Melodies',
    accentColor: 'from-rose-500 to-pink-900',
  },
  {
    id: 'lofi-beats-live',
    title: 'Lofi Chillhop Study Beats',
    artist: 'Lofi Cafe Radio',
    genre: 'Lofi Hip Hop',
    streamUrl: 'https://ice1.somafm.com/groovesalad-128-mp3',
    logoUrl: createRadioLogo('LofiStudy', 'Lofi Chill', '#14b8a6', '#042f2e'),
    description: 'Relaxing lofi hip hop beats to study, relax, program, and unwind to.',
    badge: 'Study Beats',
    accentColor: 'from-teal-500 to-cyan-900',
  },
];
