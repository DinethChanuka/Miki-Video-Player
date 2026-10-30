export type PlayerThemeId =
  | 'cyberpunk'
  | 'midnight'
  | 'violet'
  | 'emerald'
  | 'sunset'
  | 'glacier'
  | 'gold'
  | 'crimson'
  | 'synthwave'
  | 'nordic';

export interface PlayerTheme {
  id: PlayerThemeId;
  name: string;
  tagline: string;
  primaryHex: string;
  accentGradient: string;
  haloGlow: string;
  timelineTrack: string;
  timelineThumb: string;
  glassBg: string;
  glassBorder: string;
  badgeClass: string;
  previewColors: [string, string];
}

export const PLAYER_THEMES: Record<PlayerThemeId, PlayerTheme> = {
  cyberpunk: {
    id: 'cyberpunk',
    name: 'Cyberpunk Neon',
    tagline: 'High-contrast neon cyan and hot magenta glow',
    primaryHex: '#06b6d4',
    accentGradient: 'from-cyan-400 via-sky-500 to-fuchsia-500',
    haloGlow: 'rgba(6, 182, 212, 0.45)',
    timelineTrack: 'from-cyan-400 to-fuchsia-500',
    timelineThumb: 'bg-cyan-400 shadow-cyan-500/50',
    glassBg: 'bg-slate-950/80',
    glassBorder: 'border-cyan-500/30',
    badgeClass: 'text-cyan-400 bg-cyan-500/15 border-cyan-400/30',
    previewColors: ['#06b6d4', '#d946ef'],
  },
  midnight: {
    id: 'midnight',
    name: 'Midnight OLED',
    tagline: 'Ultra-deep pure obsidian with silver frost accents',
    primaryHex: '#94a3b8',
    accentGradient: 'from-slate-200 via-zinc-400 to-slate-500',
    haloGlow: 'rgba(148, 163, 184, 0.35)',
    timelineTrack: 'from-slate-100 to-zinc-400',
    timelineThumb: 'bg-white shadow-white/40',
    glassBg: 'bg-black/90',
    glassBorder: 'border-white/15',
    badgeClass: 'text-slate-200 bg-white/10 border-white/20',
    previewColors: ['#0f172a', '#e2e8f0'],
  },
  violet: {
    id: 'violet',
    name: 'Tokyo Violet',
    tagline: 'Cinematic deep indigo and fluorescent purple glow',
    primaryHex: '#8b5cf6',
    accentGradient: 'from-violet-400 via-purple-500 to-indigo-500',
    haloGlow: 'rgba(139, 92, 246, 0.45)',
    timelineTrack: 'from-indigo-400 to-purple-500',
    timelineThumb: 'bg-purple-400 shadow-purple-500/50',
    glassBg: 'bg-[#0d0a1a]/85',
    glassBorder: 'border-purple-500/30',
    badgeClass: 'text-purple-300 bg-purple-500/15 border-purple-400/30',
    previewColors: ['#6366f1', '#a855f7'],
  },
  emerald: {
    id: 'emerald',
    name: 'Matrix Emerald',
    tagline: 'Deep dark forest with vibrant electric emerald green',
    primaryHex: '#10b981',
    accentGradient: 'from-emerald-400 via-green-500 to-teal-400',
    haloGlow: 'rgba(16, 185, 129, 0.45)',
    timelineTrack: 'from-emerald-400 to-teal-400',
    timelineThumb: 'bg-emerald-400 shadow-emerald-500/50',
    glassBg: 'bg-[#04120b]/85',
    glassBorder: 'border-emerald-500/30',
    badgeClass: 'text-emerald-300 bg-emerald-500/15 border-emerald-400/30',
    previewColors: ['#10b981', '#14b8a6'],
  },
  sunset: {
    id: 'sunset',
    name: 'Sunset Horizon',
    tagline: 'Warm golden amber, coral, and glowing rose red',
    primaryHex: '#f59e0b',
    accentGradient: 'from-amber-400 via-orange-500 to-rose-500',
    haloGlow: 'rgba(245, 158, 11, 0.45)',
    timelineTrack: 'from-amber-400 via-orange-500 to-rose-500',
    timelineThumb: 'bg-amber-400 shadow-amber-500/50',
    glassBg: 'bg-[#140b08]/85',
    glassBorder: 'border-amber-500/30',
    badgeClass: 'text-amber-300 bg-amber-500/15 border-amber-400/30',
    previewColors: ['#f59e0b', '#f43f5e'],
  },
  glacier: {
    id: 'glacier',
    name: 'Glacier Frost',
    tagline: 'Arctic blue, crystalline ice cyan, and pure silver',
    primaryHex: '#38bdf8',
    accentGradient: 'from-sky-300 via-cyan-400 to-blue-500',
    haloGlow: 'rgba(56, 189, 248, 0.45)',
    timelineTrack: 'from-sky-300 to-blue-500',
    timelineThumb: 'bg-sky-400 shadow-sky-500/50',
    glassBg: 'bg-[#06101e]/85',
    glassBorder: 'border-sky-400/30',
    badgeClass: 'text-sky-300 bg-sky-500/15 border-sky-400/30',
    previewColors: ['#38bdf8', '#2563eb'],
  },
  gold: {
    id: 'gold',
    name: 'Royal Obsidian',
    tagline: 'Prestige obsidian black and champagne gold luxury',
    primaryHex: '#eab308',
    accentGradient: 'from-yellow-300 via-amber-400 to-amber-600',
    haloGlow: 'rgba(234, 179, 8, 0.45)',
    timelineTrack: 'from-yellow-300 to-amber-500',
    timelineThumb: 'bg-yellow-300 shadow-yellow-500/50',
    glassBg: 'bg-[#120f06]/85',
    glassBorder: 'border-yellow-400/30',
    badgeClass: 'text-yellow-300 bg-yellow-500/15 border-yellow-400/30',
    previewColors: ['#fde047', '#b45309'],
  },
  crimson: {
    id: 'crimson',
    name: 'Crimson Velvet',
    tagline: 'Bold ruby crimson and deep dark neon burgundy',
    primaryHex: '#e11d48',
    accentGradient: 'from-rose-500 via-red-500 to-rose-700',
    haloGlow: 'rgba(225, 29, 72, 0.45)',
    timelineTrack: 'from-rose-400 to-red-600',
    timelineThumb: 'bg-rose-500 shadow-rose-500/50',
    glassBg: 'bg-[#16060a]/85',
    glassBorder: 'border-rose-500/30',
    badgeClass: 'text-rose-300 bg-rose-500/15 border-rose-400/30',
    previewColors: ['#f43f5e', '#be123c'],
  },
  synthwave: {
    id: 'synthwave',
    name: 'Retro Synthwave',
    tagline: '80s arcade neon pink, laser cyan, and deep purple',
    primaryHex: '#ec4899',
    accentGradient: 'from-pink-500 via-purple-600 to-cyan-400',
    haloGlow: 'rgba(236, 72, 153, 0.45)',
    timelineTrack: 'from-pink-500 via-purple-600 to-cyan-400',
    timelineThumb: 'bg-pink-400 shadow-pink-500/50',
    glassBg: 'bg-[#110517]/85',
    glassBorder: 'border-pink-500/30',
    badgeClass: 'text-pink-300 bg-pink-500/15 border-pink-400/30',
    previewColors: ['#ec4899', '#06b6d4'],
  },
  nordic: {
    id: 'nordic',
    name: 'Nordic Frost',
    tagline: 'Minimalist Scandinavian matte steel and fog glass',
    primaryHex: '#cbd5e1',
    accentGradient: 'from-slate-200 via-slate-400 to-zinc-400',
    haloGlow: 'rgba(203, 213, 225, 0.35)',
    timelineTrack: 'from-slate-200 to-slate-400',
    timelineThumb: 'bg-slate-200 shadow-slate-300/50',
    glassBg: 'bg-slate-900/80',
    glassBorder: 'border-slate-400/25',
    badgeClass: 'text-slate-300 bg-slate-400/15 border-slate-400/30',
    previewColors: ['#cbd5e1', '#64748b'],
  },
};

