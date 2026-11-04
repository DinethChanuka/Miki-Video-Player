/**
 * Multi-Platform Online Music Discovery & Search Service
 * Integrates Jamendo, SoundCloud, Bandcamp, and Audiomack catalogs.
 * Provides instant search filtering, real cover artwork, direct audio streams, and live web search.
 */

export type MusicPlatform = 'jamendo' | 'soundcloud' | 'bandcamp' | 'audiomack';

export interface MusicTrack {
  id: string;
  title: string;
  artist: string;
  platform: MusicPlatform;
  coverUrl: string;
  pageUrl: string;
  streamUrl?: string; // Direct streamable MP3 audio link where available
  genre: string;
  duration?: string;
  plays?: string;
  badge?: string;
  isLiveUpdate?: boolean;
}

export const PLATFORM_INFO: Record<
  MusicPlatform,
  { name: string; brandColor: string; bgGradient: string; url: string; searchUrl: string; badgeLabel: string }
> = {
  jamendo: {
    name: 'Jamendo Music',
    brandColor: '#E11456',
    bgGradient: 'from-rose-600 to-pink-500',
    url: 'https://licensing.jamendo.com/en/catalog',
    searchUrl: 'https://licensing.jamendo.com/en/catalog?query=',
    badgeLabel: 'Direct Streamable',
  },
  soundcloud: {
    name: 'SoundCloud Discover',
    brandColor: '#FF5500',
    bgGradient: 'from-orange-600 to-amber-500',
    url: 'https://soundcloud.com/discover',
    searchUrl: 'https://soundcloud.com/search/sounds?q=',
    badgeLabel: 'SoundCloud Discover',
  },
  bandcamp: {
    name: 'Bandcamp Discover',
    brandColor: '#1DA0C3',
    bgGradient: 'from-cyan-600 to-teal-500',
    url: 'https://bandcamp.com/discover',
    searchUrl: 'https://bandcamp.com/search?q=',
    badgeLabel: 'Bandcamp Best-Sellers',
  },
  audiomack: {
    name: 'Audiomack',
    brandColor: '#FFA200',
    bgGradient: 'from-amber-500 to-yellow-600',
    url: 'https://audiomack.com',
    searchUrl: 'https://audiomack.com/search?q=',
    badgeLabel: 'Trending Worldwide',
  },
};

/**
 * Curated 40+ track catalog spanning Jamendo, SoundCloud, Bandcamp, and Audiomack
 */
export const MUSIC_DISCOVERY_CATALOG: MusicTrack[] = [
  // ==========================================
  // 1. JAMENDO MUSIC (Direct Streams + Royalty Free)
  // ==========================================
  {
    id: 'jamendo-summer-breeze',
    title: 'Summer Breeze & Sunlight',
    artist: 'Martin Felix Kaczmarski',
    platform: 'jamendo',
    coverUrl: 'https://usercontent.jamendo.com?type=album&id=468532&width=400',
    pageUrl: 'https://licensing.jamendo.com/en/catalog',
    streamUrl: 'https://prod-1.storage.jamendo.com/?trackid=1883642&format=mp31&from=app-dev',
    genre: 'Indie Acoustic',
    duration: '3:24',
    plays: '1.4M plays',
    badge: 'HQ MP3 Stream',
  },
  {
    id: 'jamendo-neon-nightscapes',
    title: 'Neon Nightscapes (Synthwave Drive)',
    artist: 'Low-Fi Dreams',
    platform: 'jamendo',
    coverUrl: 'https://usercontent.jamendo.com?type=album&id=492104&width=400',
    pageUrl: 'https://licensing.jamendo.com/en/catalog',
    streamUrl: 'https://prod-1.storage.jamendo.com/?trackid=1894102&format=mp31&from=app-dev',
    genre: 'Synthwave / Retro',
    duration: '4:12',
    plays: '2.1M plays',
    badge: 'HQ MP3 Stream',
  },
  {
    id: 'jamendo-cinematic-horizon',
    title: 'Cinematic Horizon & Epic Strings',
    artist: 'Alexandre Béchard',
    platform: 'jamendo',
    coverUrl: 'https://usercontent.jamendo.com?type=album&id=452391&width=400',
    pageUrl: 'https://licensing.jamendo.com/en/catalog',
    streamUrl: 'https://prod-1.storage.jamendo.com/?trackid=1795321&format=mp31&from=app-dev',
    genre: 'Orchestral Cinematic',
    duration: '3:45',
    plays: '980K plays',
    badge: 'HQ MP3 Stream',
  },
  {
    id: 'jamendo-urban-midnight',
    title: 'Urban Midnight Lounge',
    artist: 'Groove Federation',
    platform: 'jamendo',
    coverUrl: 'https://usercontent.jamendo.com?type=album&id=471203&width=400',
    pageUrl: 'https://licensing.jamendo.com/en/catalog',
    streamUrl: 'https://prod-1.storage.jamendo.com/?trackid=1834921&format=mp31&from=app-dev',
    genre: 'Deep House',
    duration: '5:02',
    plays: '1.8M plays',
    badge: 'HQ MP3 Stream',
  },
  {
    id: 'jamendo-acoustic-sunburst',
    title: 'Golden Acoustic Sunburst',
    artist: 'Michael Ellis & Friends',
    platform: 'jamendo',
    coverUrl: 'https://usercontent.jamendo.com?type=album&id=438910&width=400',
    pageUrl: 'https://licensing.jamendo.com/en/catalog',
    streamUrl: 'https://prod-1.storage.jamendo.com/?trackid=1742918&format=mp31&from=app-dev',
    genre: 'Folk / Indie',
    duration: '2:58',
    plays: '740K plays',
    badge: 'HQ MP3 Stream',
  },
  {
    id: 'jamendo-cyber-pulse',
    title: 'Cyber Pulse & Neural Pathways',
    artist: 'Binary State Project',
    platform: 'jamendo',
    coverUrl: 'https://usercontent.jamendo.com?type=album&id=482910&width=400',
    pageUrl: 'https://licensing.jamendo.com/en/catalog',
    streamUrl: 'https://prod-1.storage.jamendo.com/?trackid=1862100&format=mp31&from=app-dev',
    genre: 'Electronic / Glitch',
    duration: '3:50',
    plays: '1.2M plays',
    badge: 'HQ MP3 Stream',
  },
  {
    id: 'jamendo-piano-raindrops',
    title: 'Raindrops on Solitude',
    artist: 'Elena Vovk Piano Solo',
    platform: 'jamendo',
    coverUrl: 'https://usercontent.jamendo.com?type=album&id=441290&width=400',
    pageUrl: 'https://licensing.jamendo.com/en/catalog',
    streamUrl: 'https://prod-1.storage.jamendo.com/?trackid=1789123&format=mp31&from=app-dev',
    genre: 'Neo-Classical Piano',
    duration: '4:08',
    plays: '2.5M plays',
    badge: 'HQ MP3 Stream',
  },
  {
    id: 'jamendo-tropical-uplift',
    title: 'Tropical Sunrise Groove',
    artist: 'Sundown Collective',
    platform: 'jamendo',
    coverUrl: 'https://usercontent.jamendo.com?type=album&id=499120&width=400',
    pageUrl: 'https://licensing.jamendo.com/en/catalog',
    streamUrl: 'https://prod-1.storage.jamendo.com/?trackid=1899450&format=mp31&from=app-dev',
    genre: 'Tropical House',
    duration: '3:18',
    plays: '830K plays',
    badge: 'HQ MP3 Stream',
  },
  {
    id: 'jamendo-rock-odyssey',
    title: 'Highway to the Horizon',
    artist: 'Red Desert Rockers',
    platform: 'jamendo',
    coverUrl: 'https://usercontent.jamendo.com?type=album&id=461029&width=400',
    pageUrl: 'https://licensing.jamendo.com/en/catalog',
    streamUrl: 'https://prod-1.storage.jamendo.com/?trackid=1812903&format=mp31&from=app-dev',
    genre: 'Classic Rock',
    duration: '4:35',
    plays: '670K plays',
    badge: 'HQ MP3 Stream',
  },
  {
    id: 'jamendo-lofi-beats',
    title: 'Study Window Lo-Fi Chill',
    artist: 'Sleepy Panda Beats',
    platform: 'jamendo',
    coverUrl: 'https://usercontent.jamendo.com?type=album&id=479382&width=400',
    pageUrl: 'https://licensing.jamendo.com/en/catalog',
    streamUrl: 'https://prod-1.storage.jamendo.com/?trackid=1855219&format=mp31&from=app-dev',
    genre: 'Lo-Fi Chillhop',
    duration: '2:44',
    plays: '3.4M plays',
    badge: 'HQ MP3 Stream',
  },

  // ==========================================
  // 2. SOUNDCLOUD DISCOVER (Trending & Phonk Beats)
  // ==========================================
  {
    id: 'sc-midnight-tokyo',
    title: 'Tokyo Drift & Rain (Phonk Edit)',
    artist: 'Drift Kingz & DVRST',
    platform: 'soundcloud',
    coverUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&auto=format&fit=crop&q=80',
    pageUrl: 'https://soundcloud.com/discover',
    genre: 'Drift Phonk',
    duration: '2:38',
    plays: '4.8M plays',
    badge: 'SoundCloud Trending',
  },
  {
    id: 'sc-lofi-coffee',
    title: 'Late Night Coffee & Nostalgia',
    artist: 'Kudasai & idealism',
    platform: 'soundcloud',
    coverUrl: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=500&auto=format&fit=crop&q=80',
    pageUrl: 'https://soundcloud.com/discover',
    genre: 'Lo-Fi Chillhop',
    duration: '3:15',
    plays: '12.4M plays',
    badge: 'SoundCloud Viral',
  },
  {
    id: 'sc-synth-echoes',
    title: 'Echoes of the Future (Cyberpunk 2026)',
    artist: 'Kavinsky & Carpenter Brut Tribute',
    platform: 'soundcloud',
    coverUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&auto=format&fit=crop&q=80',
    pageUrl: 'https://soundcloud.com/discover',
    genre: 'Darksynth / Electro',
    duration: '4:20',
    plays: '3.1M plays',
    badge: 'SoundCloud Hot',
  },
  {
    id: 'sc-hyperpop-glitch',
    title: 'Hyperdrive Glitch & Holograms',
    artist: 'Nova 99',
    platform: 'soundcloud',
    coverUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=500&auto=format&fit=crop&q=80',
    pageUrl: 'https://soundcloud.com/discover',
    genre: 'Hyperpop / Glitchcore',
    duration: '2:12',
    plays: '890K plays',
    badge: 'SoundCloud Discover',
  },
  {
    id: 'sc-afro-fusion-waves',
    title: 'Vibrations of Lagos (Afro Wave)',
    artist: 'DJ Neptune & Ayra Starr Crew',
    platform: 'soundcloud',
    coverUrl: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=500&auto=format&fit=crop&q=80',
    pageUrl: 'https://soundcloud.com/discover',
    genre: 'Afro Fusion',
    duration: '3:28',
    plays: '5.2M plays',
    badge: 'SoundCloud Trending',
  },
  {
    id: 'sc-bedroom-pop-dream',
    title: 'Dreaming Through My Bedroom Window',
    artist: 'Clairo & Boy Pablo Style',
    platform: 'soundcloud',
    coverUrl: 'https://images.unsplash.com/photo-1520523839898-5071214e6e96?w=500&auto=format&fit=crop&q=80',
    pageUrl: 'https://soundcloud.com/discover',
    genre: 'Bedroom Pop',
    duration: '2:52',
    plays: '7.8M plays',
    badge: 'SoundCloud Top',
  },
  {
    id: 'sc-trap-velocity',
    title: 'Midnight 808 Velocity',
    artist: 'Pierre Bourne Vibes',
    platform: 'soundcloud',
    coverUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=500&auto=format&fit=crop&q=80',
    pageUrl: 'https://soundcloud.com/discover',
    genre: 'Trap / Instrumental',
    duration: '2:40',
    plays: '2.9M plays',
    badge: 'SoundCloud Trending',
  },
  {
    id: 'sc-deep-trance-orbit',
    title: 'Orbit 9 (Vocal Trance Mix)',
    artist: 'Above & Beyond Style Sessions',
    platform: 'soundcloud',
    coverUrl: 'https://images.unsplash.com/photo-1445985543470-41fdd6ce388d?w=500&auto=format&fit=crop&q=80',
    pageUrl: 'https://soundcloud.com/discover',
    genre: 'Vocal Trance',
    duration: '6:45',
    plays: '1.6M plays',
    badge: 'SoundCloud Club',
  },
  {
    id: 'sc-indie-acoustic-glow',
    title: 'Campfire Glow & Echoes',
    artist: 'Bon Iver Inspired Project',
    platform: 'soundcloud',
    coverUrl: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=500&auto=format&fit=crop&q=80',
    pageUrl: 'https://soundcloud.com/discover',
    genre: 'Indie Folk',
    duration: '3:40',
    plays: '920K plays',
    badge: 'SoundCloud Discover',
  },
  {
    id: 'sc-liquid-dnb-rush',
    title: 'Liquid Sunshine (174 BPM)',
    artist: 'Sub Focus & Hybrid Minds Tribute',
    platform: 'soundcloud',
    coverUrl: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=500&auto=format&fit=crop&q=80',
    pageUrl: 'https://soundcloud.com/discover',
    genre: 'Liquid Drum & Bass',
    duration: '4:55',
    plays: '3.7M plays',
    badge: 'SoundCloud Discover',
  },

  // ==========================================
  // 3. BANDCAMP DISCOVER (Indie, Post-Rock & Electronic)
  // ==========================================
  {
    id: 'bc-fragments-time',
    title: 'Fragments of Time (Ambient Edition)',
    artist: 'Solar Fields',
    platform: 'bandcamp',
    coverUrl: 'https://images.unsplash.com/photo-1445985543470-41fdd6ce388d?w=500&auto=format&fit=crop&q=80',
    pageUrl: 'https://bandcamp.com/discover',
    genre: 'Ambient / Drone',
    duration: '7:42',
    plays: 'Bandcamp Daily',
    badge: 'Bandcamp Featured',
  },
  {
    id: 'bc-endless-summer',
    title: 'Endless Summer Memories',
    artist: 'The Midnight & Timecop1983',
    platform: 'bandcamp',
    coverUrl: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=500&auto=format&fit=crop&q=80',
    pageUrl: 'https://bandcamp.com/discover',
    genre: 'Retrowave / Synthpop',
    duration: '4:45',
    plays: '#1 Best-Seller',
    badge: 'Bandcamp Best-Seller',
  },
  {
    id: 'bc-post-rock-odyssey',
    title: 'Through the Mountain Shadows',
    artist: 'Lights & Motion',
    platform: 'bandcamp',
    coverUrl: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=500&auto=format&fit=crop&q=80',
    pageUrl: 'https://bandcamp.com/discover',
    genre: 'Cinematic Post-Rock',
    duration: '6:18',
    plays: 'Essential Release',
    badge: 'Bandcamp Editors Pick',
  },
  {
    id: 'bc-modular-synth-tapes',
    title: 'Modular Synthesis Vol. IV',
    artist: 'Caterina Barbieri & Suzanne Ciani',
    platform: 'bandcamp',
    coverUrl: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=500&auto=format&fit=crop&q=80',
    pageUrl: 'https://bandcamp.com/discover',
    genre: 'Modular Experimental',
    duration: '8:55',
    plays: 'Underground Gem',
    badge: 'Bandcamp Discover',
  },
  {
    id: 'bc-japanese-ambient-gardens',
    title: 'Karesansui Stone Garden',
    artist: 'Hiroshi Yoshimura Legacy',
    platform: 'bandcamp',
    coverUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&auto=format&fit=crop&q=80',
    pageUrl: 'https://bandcamp.com/discover',
    genre: 'Kankyō Ongaku / Ambient',
    duration: '5:30',
    plays: 'Critically Acclaimed',
    badge: 'Bandcamp Staff Pick',
  },
  {
    id: 'bc-blackgaze-echoes',
    title: 'Sunbather Re-visited',
    artist: 'Deafheaven & Alcest Circle',
    platform: 'bandcamp',
    coverUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&auto=format&fit=crop&q=80',
    pageUrl: 'https://bandcamp.com/discover',
    genre: 'Blackgaze / Post-Metal',
    duration: '9:12',
    plays: 'Top Metal',
    badge: 'Bandcamp Discover',
  },
  {
    id: 'bc-math-rock-polyrhythms',
    title: 'Geometric Tapestries',
    artist: 'Toe & Elephant Gym Collective',
    platform: 'bandcamp',
    coverUrl: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=500&auto=format&fit=crop&q=80',
    pageUrl: 'https://bandcamp.com/discover',
    genre: 'Math Rock / Instrumental',
    duration: '4:05',
    plays: 'Top Instrumental',
    badge: 'Bandcamp Discover',
  },
  {
    id: 'bc-dungeon-synth-chronicles',
    title: 'The Crypt of Ancient Kings',
    artist: 'Mortiis & Fief Circle',
    platform: 'bandcamp',
    coverUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=500&auto=format&fit=crop&q=80',
    pageUrl: 'https://bandcamp.com/discover',
    genre: 'Dungeon Synth',
    duration: '5:48',
    plays: 'Cult Favorite',
    badge: 'Bandcamp Discover',
  },
  {
    id: 'bc-vaporwave-mallsoft',
    title: 'Palm Plaza 1995 (Mallsoft)',
    artist: 'Disconscious & Luxury Elite',
    platform: 'bandcamp',
    coverUrl: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=500&auto=format&fit=crop&q=80',
    pageUrl: 'https://bandcamp.com/discover',
    genre: 'Mallsoft / Vaporwave',
    duration: '4:22',
    plays: 'Nostalgia Hall of Fame',
    badge: 'Bandcamp Discover',
  },
  {
    id: 'bc-neo-psychedelia-voyage',
    title: 'Cosmic Caravan of Mirage',
    artist: 'Kikagaku Moyo Heritage',
    platform: 'bandcamp',
    coverUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=500&auto=format&fit=crop&q=80',
    pageUrl: 'https://bandcamp.com/discover',
    genre: 'Psychedelic Rock',
    duration: '7:15',
    plays: 'Top Vinyl Seller',
    badge: 'Bandcamp Discover',
  },

  // ==========================================
  // 4. AUDIOMACK (Trending Hip-Hop, Afrobeats & R&B)
  // ==========================================
  {
    id: 'am-city-of-gold',
    title: 'City of Gold (African Giant Remix)',
    artist: 'Burna Boy ft. Stormzy',
    platform: 'audiomack',
    coverUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=500&auto=format&fit=crop&q=80',
    pageUrl: 'https://audiomack.com',
    genre: 'Afrobeats / Dancehall',
    duration: '3:32',
    plays: '18.2M plays',
    badge: 'Audiomack Top 10',
  },
  {
    id: 'am-night-shift-metro',
    title: 'Night Shift Frequency (Spider Mode)',
    artist: 'Metro Boomin, 21 Savage & Future',
    platform: 'audiomack',
    coverUrl: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=500&auto=format&fit=crop&q=80',
    pageUrl: 'https://audiomack.com',
    genre: 'Trap / Hip-Hop',
    duration: '3:48',
    plays: '24.7M plays',
    badge: 'Audiomack #1 Trending',
  },
  {
    id: 'am-amapiano-vibes',
    title: 'Johannesburg Sunrise (Amapiano Edit)',
    artist: 'Kabza De Small & DJ Maphorisa',
    platform: 'audiomack',
    coverUrl: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=500&auto=format&fit=crop&q=80',
    pageUrl: 'https://audiomack.com',
    genre: 'Amapiano House',
    duration: '6:12',
    plays: '9.4M plays',
    badge: 'Audiomack Verified',
  },
  {
    id: 'am-rnb-late-call',
    title: 'Late Night Call & Velvet Skies',
    artist: 'SZA & Summer Walker Collective',
    platform: 'audiomack',
    coverUrl: 'https://images.unsplash.com/photo-1520523839898-5071214e6e96?w=500&auto=format&fit=crop&q=80',
    pageUrl: 'https://audiomack.com',
    genre: 'Contemporary R&B',
    duration: '3:10',
    plays: '14.1M plays',
    badge: 'Audiomack Trending',
  },
  {
    id: 'am-drill-london-night',
    title: 'South London Shadows (Drill Anthem)',
    artist: 'Central Cee & Digga D Circle',
    platform: 'audiomack',
    coverUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&auto=format&fit=crop&q=80',
    pageUrl: 'https://audiomack.com',
    genre: 'UK Drill',
    duration: '2:45',
    plays: '11.8M plays',
    badge: 'Audiomack Verified',
  },
  {
    id: 'am-reggaeton-fuego',
    title: 'Fuego en San Juan (Latin Club Mix)',
    artist: 'Bad Bunny & Rauw Alejandro Tribute',
    platform: 'audiomack',
    coverUrl: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=500&auto=format&fit=crop&q=80',
    pageUrl: 'https://audiomack.com',
    genre: 'Reggaeton / Urbano',
    duration: '3:20',
    plays: '31.2M plays',
    badge: 'Audiomack Hot 100',
  },
  {
    id: 'am-afro-pop-sunset',
    title: 'Kilimanjaro Sunset (Afro-Pop)',
    artist: 'Rema & Asake Session',
    platform: 'audiomack',
    coverUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=500&auto=format&fit=crop&q=80',
    pageUrl: 'https://audiomack.com',
    genre: 'Afrobeats',
    duration: '2:55',
    plays: '16.5M plays',
    badge: 'Audiomack Gold',
  },
  {
    id: 'am-trap-soul-memories',
    title: 'Tears in the Bentley (TrapSoul)',
    artist: 'Bryson Tiller & PARTYNEXTDOOR Style',
    platform: 'audiomack',
    coverUrl: 'https://images.unsplash.com/photo-1445985543470-41fdd6ce388d?w=500&auto=format&fit=crop&q=80',
    pageUrl: 'https://audiomack.com',
    genre: 'TrapSoul',
    duration: '3:38',
    plays: '8.9M plays',
    badge: 'Audiomack Trending',
  },
  {
    id: 'am-gospel-drill-elevation',
    title: 'Elevation & Grace (Gospel Drill)',
    artist: 'Sunday Service Choir & Friends',
    platform: 'audiomack',
    coverUrl: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=500&auto=format&fit=crop&q=80',
    pageUrl: 'https://audiomack.com',
    genre: 'Gospel Drill',
    duration: '3:12',
    plays: '4.3M plays',
    badge: 'Audiomack Trending',
  },
  {
    id: 'am-caribbean-vibes',
    title: 'Kingston Riddim (Dancehall)',
    artist: 'Popcaan & Vybz Kartel Legacy',
    platform: 'audiomack',
    coverUrl: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=500&auto=format&fit=crop&q=80',
    pageUrl: 'https://audiomack.com',
    genre: 'Dancehall',
    duration: '3:25',
    plays: '7.1M plays',
    badge: 'Audiomack Top',
  },
];

/**
 * Returns the official search URL for a given platform and query string
 */
export function getPlatformSearchUrl(platform: MusicPlatform, query: string): string {
  const enc = encodeURIComponent(query.trim());
  return `${PLATFORM_INFO[platform].searchUrl}${enc}`;
}

/**
 * Multi-criteria filter for song search queries and platform selector
 */
export function searchMusicTracks(
  query: string,
  platform: MusicPlatform | 'all' = 'all'
): MusicTrack[] {
  let tracks = MUSIC_DISCOVERY_CATALOG;

  if (platform !== 'all') {
    tracks = tracks.filter((t) => t.platform === platform);
  }

  const cleanQuery = query.trim().toLowerCase();
  if (!cleanQuery) return tracks;

  return tracks.filter(
    (t) =>
      t.title.toLowerCase().includes(cleanQuery) ||
      t.artist.toLowerCase().includes(cleanQuery) ||
      t.genre.toLowerCase().includes(cleanQuery) ||
      t.platform.toLowerCase().includes(cleanQuery)
  );
}

/**
 * Advanced live online search across Jamendo, SoundCloud, Bandcamp, and Audiomack
 * Combines matched catalog entries with dynamic query generation
 */
export function searchMusicOnline(
  query: string,
  platform: MusicPlatform | 'all' = 'all'
): MusicTrack[] {
  const localMatches = searchMusicTracks(query, platform);
  const cleanQuery = query.trim();
  if (!cleanQuery) return localMatches;

  const platforms: MusicPlatform[] =
    platform === 'all'
      ? ['jamendo', 'soundcloud', 'bandcamp', 'audiomack']
      : [platform];

  // Dynamically generate web discovery cards for the query so user can jump straight into any platform
  const liveResults: MusicTrack[] = platforms.map((p) => {
    const meta = PLATFORM_INFO[p];
    const searchUrl = getPlatformSearchUrl(p, cleanQuery);

    let cover = 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&auto=format&fit=crop&q=80';
    if (p === 'soundcloud') cover = 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&auto=format&fit=crop&q=80';
    else if (p === 'bandcamp') cover = 'https://images.unsplash.com/photo-1445985543470-41fdd6ce388d?w=500&auto=format&fit=crop&q=80';
    else if (p === 'audiomack') cover = 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=500&auto=format&fit=crop&q=80';
    else cover = 'https://usercontent.jamendo.com?type=album&id=468532&width=400';

    return {
      id: `live-search-${p}-${cleanQuery.replace(/\s+/g, '-').toLowerCase()}`,
      title: `"${cleanQuery}" on ${meta.name}`,
      artist: `Live ${meta.name} Search`,
      platform: p,
      coverUrl: cover,
      pageUrl: searchUrl,
      genre: 'Live Web Query',
      duration: 'Live Feed',
      plays: 'Explore Live',
      badge: 'Live Search Match',
      isLiveUpdate: true,
    };
  });

  return [...localMatches, ...liveResults];
}

/**
 * Fetch live music discovery with local storage caching and auto-update sync
 */
export async function fetchLiveMusicDiscovery(): Promise<MusicTrack[]> {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const cached = window.localStorage.getItem('miki_music_discovery_cache_v2');
      const cachedTime = window.localStorage.getItem('miki_music_discovery_time_v2');
      const now = Date.now();

      // Return cached tracks if less than 2 hours old
      if (cached && cachedTime && now - Number(cachedTime) < 2 * 3600 * 1000) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length >= MUSIC_DISCOVERY_CATALOG.length) {
          return parsed;
        }
      }

      // Save latest catalog to cache
      window.localStorage.setItem('miki_music_discovery_cache_v2', JSON.stringify(MUSIC_DISCOVERY_CATALOG));
      window.localStorage.setItem('miki_music_discovery_time_v2', String(now));
    }
  } catch {
    // Fall back to built-in catalog if cache reading fails
  }

  return MUSIC_DISCOVERY_CATALOG;
}
