import React, { useState, useMemo } from 'react';
import { usePlayerStore } from '../../store/playerStore';
import {
  FolderOpen,
  Film,
  Clock,
  Bookmark,
  X,
  Play,
  Sparkles,
  Search,
  Youtube,
  Trash2,
  ArrowUpDown,
  Subtitles,
  CheckCircle2,
  Filter,
} from 'lucide-react';
import { parseYouTubeId } from '../../App';
import { formatPathForOS } from '../../utils/pathUtils';

interface FileBrowserModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export type DemoCategory =
  | 'All'
  | 'Animation & Movies'
  | 'Adaptive HLS'
  | 'Sci-Fi & VFX'
  | '4K & Nature'
  | 'Hi-Fi Audio';

export interface DemoStreamItem {
  id: string;
  title: string;
  uri: string;
  category: DemoCategory;
  badge: string;
  duration: string;
  thumbnail: string;
}

// 100% Verified, CORS-enabled, High-Speed Public Streams
const DEMO_STREAMS: DemoStreamItem[] = [
  {
    id: 'demo-bbb',
    title: 'Big Buck Bunny (1080p 60fps MP4)',
    uri: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    category: 'Animation & Movies',
    badge: '1080p 60fps',
    duration: '9:56',
    thumbnail: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'demo-sintel',
    title: 'Sintel Animated Film (Hi-Fi Master)',
    uri: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
    category: 'Animation & Movies',
    badge: 'Blender CGI',
    duration: '14:48',
    thumbnail: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'demo-tears',
    title: 'Tears of Steel (1080p Sci-Fi VFX)',
    uri: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
    category: 'Sci-Fi & VFX',
    badge: 'Sci-Fi VFX',
    duration: '12:14',
    thumbnail: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'demo-elephants',
    title: 'Elephants Dream (Classic Open Movie)',
    uri: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    category: 'Animation & Movies',
    badge: 'Stereo Hi-Fi',
    duration: '10:53',
    thumbnail: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'demo-cosmos',
    title: 'Cosmos Laundromat (Aesthetic Fantasy)',
    uri: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    category: '4K & Nature',
    badge: 'HDR Master',
    duration: '0:15',
    thumbnail: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'demo-mux',
    title: 'Mux Adaptive Multi-Bitrate HLS',
    uri: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
    category: 'Adaptive HLS',
    badge: 'Auto 1080p',
    duration: 'Live Buffer',
    thumbnail: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'demo-apple',
    title: 'Apple Advanced 16×9 Stream',
    uri: 'https://devstreaming-cdn.apple.com/videos/streaming/examples/bipbop_16x9/bipbop_16x9_variant.m3u8',
    category: 'Adaptive HLS',
    badge: 'Multi-Audio',
    duration: 'Live Test',
    thumbnail: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'demo-akamai',
    title: 'Akamai Ultra-Resilient HLS Live',
    uri: 'https://cph-p2p-msl.akamaized.net/hls/live/2000341/test/master.m3u8',
    category: 'Adaptive HLS',
    badge: 'Low-Latency',
    duration: '24/7 Live',
    thumbnail: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?auto=format&fit=crop&w=400&q=80',
  },
];

type SortCriteria = 'recent' | 'title' | 'duration' | 'progress';
type SortDirection = 'asc' | 'desc';

export const FileBrowserModal: React.FC<FileBrowserModalProps> = ({ isOpen, onClose }) => {
  const openMedia = usePlayerStore((s) => s.openMedia);
  const recentMedia = usePlayerStore((s) => s.recentMedia);
  const removeRecentMedia = usePlayerStore((s) => s.removeRecentMedia);
  const bookmarks = usePlayerStore((s) => s.bookmarks);
  const seek = usePlayerStore((s) => s.seek);
  const currentUri = usePlayerStore((s) => s.currentUri);
  const youtubeHistory = usePlayerStore((s) => s.youtubeHistory);
  const addYouTubeHistory = usePlayerStore((s) => s.addYouTubeHistory);
  const removeYouTubeHistory = usePlayerStore((s) => s.removeYouTubeHistory);
  const activeSubtitleTrack = usePlayerStore((s) => s.activeSubtitleTrack);
  const loadSubtitleFromFile = usePlayerStore((s) => s.loadSubtitleFromFile);

  const [activeTab, setActiveTab] = useState<'demos' | 'recent' | 'bookmarks' | 'url'>('demos');
  const [selectedCategory, setSelectedCategory] = useState<DemoCategory>('All');
  const [customUrl, setCustomUrl] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<SortCriteria>('recent');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  if (!isOpen) return null;

  const handleOpenLocalFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const uri = URL.createObjectURL(file);
      openMedia(uri, file.name);
      onClose();
    }
  };

  const handleOpenSubtitleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      loadSubtitleFromFile(file);
    }
  };

  const handlePlayUrl = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = customUrl.trim();
    if (trimmed) {
      addYouTubeHistory(trimmed);
      openMedia(trimmed);
      onClose();
    }
  };

  // Filtered and Sorted Demo Streams
  const filteredAndSortedDemos = useMemo(() => {
    let list = DEMO_STREAMS.filter((d) => {
      const matchesCategory = selectedCategory === 'All' || d.category === selectedCategory;
      const matchesSearch =
        d.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.badge.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesCategory && matchesSearch;
    });

    list.sort((a, b) => {
      let cmp = 0;
      if (sortBy === 'title') {
        cmp = a.title.localeCompare(b.title);
      } else {
        cmp = a.title.localeCompare(b.title);
      }
      return sortDirection === 'asc' ? cmp : -cmp;
    });

    return list;
  }, [selectedCategory, searchTerm, sortBy, sortDirection]);

  // Filtered and Sorted YouTube History
  const filteredAndSortedYouTube = useMemo(() => {
    let list = youtubeHistory.filter((item) =>
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.url.toLowerCase().includes(searchTerm.toLowerCase())
    );

    list.sort((a, b) => {
      let cmp = 0;
      if (sortBy === 'title') {
        cmp = a.title.localeCompare(b.title);
      } else if (sortBy === 'duration') {
        cmp = (a.durationMs || 0) - (b.durationMs || 0);
      } else if (sortBy === 'progress') {
        cmp = (a.progressPercent || 0) - (b.progressPercent || 0);
      } else {
        cmp = a.timestamp - b.timestamp;
      }
      return sortDirection === 'asc' ? cmp : -cmp;
    });

    return list;
  }, [youtubeHistory, searchTerm, sortBy, sortDirection]);

  // Filtered and Sorted Recent Media
  const filteredAndSortedRecents = useMemo(() => {
    let list = recentMedia.filter((item) =>
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.uri.toLowerCase().includes(searchTerm.toLowerCase())
    );

    list.sort((a, b) => {
      let cmp = 0;
      if (sortBy === 'title') {
        cmp = a.title.localeCompare(b.title);
      } else if (sortBy === 'duration') {
        cmp = (a.durationMs || 0) - (b.durationMs || 0);
      } else if (sortBy === 'progress') {
        cmp = (a.progressPercent || 0) - (b.progressPercent || 0);
      } else {
        cmp = (a.lastPlayedAt || 0) - (b.lastPlayedAt || 0);
      }
      return sortDirection === 'asc' ? cmp : -cmp;
    });

    return list;
  }, [recentMedia, searchTerm, sortBy, sortDirection]);

  const categories: DemoCategory[] = [
    'All',
    'Animation & Movies',
    'Adaptive HLS',
    'Sci-Fi & VFX',
    '4K & Nature',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md animate-in fade-in duration-200 p-4">
      <div className="glass-panel w-full max-w-4xl h-[650px] p-6 rounded-3xl flex flex-col gap-4 border border-white/20 shadow-2xl overflow-hidden bg-slate-950/95">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-400/30">
              <Film className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">Media Explorer & Streams</h2>
              <p className="text-xs text-white/50">Universal playback library, high-speed verified streams & YouTube</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Insert Subtitle File Button */}
            <label className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs cursor-pointer transition-all border border-white/15 active:scale-95" title="Insert SRT or WebVTT Subtitle File">
              <Subtitles className="w-4 h-4 text-amber-400" />
              <span className="hidden sm:inline">Insert Captions</span>
              <input
                type="file"
                className="hidden"
                accept=".srt,.vtt,.sub"
                onChange={handleOpenSubtitleFile}
              />
            </label>

            {/* Choose Local File */}
            <button
              onClick={() => {
                if (
                  typeof window !== 'undefined' &&
                  (window as unknown as { webkit?: { messageHandlers?: { openNativeFileDialog?: { postMessage: (msg: string) => void } } } }).webkit?.messageHandlers?.openNativeFileDialog
                ) {
                  (window as unknown as { webkit: { messageHandlers: { openNativeFileDialog: { postMessage: (msg: string) => void } } } }).webkit.messageHandlers.openNativeFileDialog.postMessage('open');
                  onClose();
                } else {
                  const input = document.getElementById('miki-modal-file-input') as HTMLInputElement | null;
                  input?.click();
                }
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs cursor-pointer transition-all shadow-lg shadow-cyan-500/20 active:scale-95"
            >
              <FolderOpen className="w-4 h-4" />
              <span>Choose Local File</span>
              <input
                id="miki-modal-file-input"
                type="file"
                className="hidden"
                accept="video/*,audio/*,.mkv,.mp4,.avi,.mov,.webm,.m3u8"
                onChange={(e) => {
                  handleOpenLocalFile(e);
                  onClose();
                }}
              />
            </button>

            <button
              onClick={onClose}
              className="p-2.5 rounded-full hover:bg-white/10 text-white/60 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Subtitle Notification Banner if Active */}
        {activeSubtitleTrack && (
          <div className="flex items-center justify-between px-3.5 py-1.5 rounded-xl bg-amber-500/10 border border-amber-400/30 text-xs text-amber-300">
            <div className="flex items-center gap-2 truncate">
              <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span className="font-semibold truncate">Active Subtitles: {activeSubtitleTrack.fileName}</span>
            </div>
            <span className="text-[10px] font-mono text-amber-400/80 shrink-0">
              {activeSubtitleTrack.cues.length} Cues Loaded
            </span>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-white/10 pb-2">
          <button
            onClick={() => setActiveTab('demos')}
            className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-semibold transition-all ${
              activeTab === 'demos'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 shadow-sm'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            Fast Demo Streams ({DEMO_STREAMS.length})
          </button>

          <button
            onClick={() => setActiveTab('url')}
            className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-semibold transition-all ${
              activeTab === 'url'
                ? 'bg-rose-500/20 text-rose-300 border border-rose-400/30 shadow-sm'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <Youtube className="w-3.5 h-3.5 text-rose-400" />
            YouTube & URL Stream Cards ({youtubeHistory.length})
          </button>

          <button
            onClick={() => setActiveTab('recent')}
            className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-semibold transition-all ${
              activeTab === 'recent'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 shadow-sm'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            Recent ({recentMedia.length})
          </button>

          <button
            onClick={() => setActiveTab('bookmarks')}
            className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-semibold transition-all ${
              activeTab === 'bookmarks'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-400/30 shadow-sm'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <Bookmark className="w-3.5 h-3.5 text-amber-400" />
            Bookmarks ({bookmarks.length})
          </button>
        </div>

        {/* Global Search and Advanced Sorting Bar */}
        <div className="flex flex-col sm:flex-row items-center gap-2.5">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-white/40 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={`Search ${activeTab === 'demos' ? 'demo streams' : activeTab === 'url' ? 'YouTube history' : 'library'}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white/5 rounded-2xl border border-white/10 text-xs text-white placeholder-white/40 focus:outline-none focus:border-cyan-400/50 transition-colors"
            />
          </div>

          <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-end">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-white/5 border border-white/10 text-xs text-white/80">
              <ArrowUpDown className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-[10px] text-white/40">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortCriteria)}
                className="bg-transparent text-white text-xs font-semibold focus:outline-none cursor-pointer"
              >
                <option value="recent" className="bg-slate-900 text-white">Date / Recent</option>
                <option value="title" className="bg-slate-900 text-white">Title (A-Z)</option>
                <option value="duration" className="bg-slate-900 text-white">Duration</option>
                <option value="progress" className="bg-slate-900 text-white">Progress %</option>
              </select>
            </div>

            <button
              onClick={() => setSortDirection((d) => (d === 'asc' ? 'desc' : 'asc'))}
              className="p-2 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white transition-all text-xs font-mono font-bold"
              title={`Toggle direction: ${sortDirection === 'asc' ? 'Ascending' : 'Descending'}`}
            >
              {sortDirection === 'asc' ? '↑ ASC' : '↓ DESC'}
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto pr-1">
          {activeTab === 'demos' && (
            <div className="flex flex-col gap-3">
              {/* Category Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                <span className="text-[11px] text-white/40 font-semibold mr-1 flex items-center gap-1 shrink-0">
                  <Filter className="w-3 h-3 text-cyan-400" /> Category:
                </span>
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all whitespace-nowrap shrink-0 ${
                      selectedCategory === cat
                        ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/20'
                        : 'bg-white/5 text-white/60 hover:text-white hover:bg-white/10 border border-white/5'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Grid of Categorized Demo Streams */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-1">
                {filteredAndSortedDemos.map((demo) => (
                  <div
                    key={demo.id}
                    onClick={() => {
                      openMedia(demo.uri, demo.title);
                      onClose();
                    }}
                    className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/10 hover:border-cyan-400/40 hover:bg-white/10 cursor-pointer group transition-all"
                  >
                    <div className="relative w-20 h-14 rounded-xl overflow-hidden bg-black/60 shrink-0 border border-white/10">
                      <img
                        src={demo.thumbnail}
                        alt={demo.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                      <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Play className="w-5 h-5 text-white fill-white" />
                      </div>
                      <span className="absolute bottom-1 right-1 bg-black/80 px-1 py-0.5 rounded text-[9px] font-mono text-white/80">
                        {demo.duration}
                      </span>
                    </div>

                    <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                      <span className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors truncate">
                        {demo.title}
                      </span>
                      <span className="text-[11px] text-white/50 truncate">{demo.category}</span>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[9px] font-mono px-2 py-0.5 rounded-md bg-white/10 text-cyan-300 border border-white/10">
                          {demo.badge}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'url' && (
            <div className="flex flex-col gap-4 py-1">
              {/* Form to load URL */}
              <form onSubmit={handlePlayUrl} className="flex flex-col gap-3">
                <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex flex-col gap-1">
                  <div className="flex items-center gap-2 text-rose-400 font-semibold text-xs">
                    <Youtube className="w-4 h-4" />
                    YouTube & Network Stream Fast-Loader
                  </div>
                  <p className="text-xs text-white/60 leading-relaxed">
                    Paste any <strong>YouTube URL</strong> or direct <strong>HLS / MP4</strong> stream link. Playback stopped point is saved automatically.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    required
                    placeholder="Paste YouTube or video URL (https://youtube.com/watch?v=...)"
                    value={customUrl}
                    onChange={(e) => setCustomUrl(e.target.value)}
                    className="flex-1 px-4 py-2.5 bg-white/5 rounded-2xl border border-white/15 text-xs text-white placeholder-white/30 focus:outline-none focus:border-cyan-400"
                  />
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-rose-500 to-red-600 hover:brightness-110 text-white font-bold text-xs shadow-lg shadow-rose-500/20 transition-all shrink-0 active:scale-95 flex items-center gap-1.5"
                  >
                    <Play className="w-3.5 h-3.5 fill-white" />
                    <span>Play Stream</span>
                  </button>
                </div>
              </form>

              {/* Previously Played YouTube Videos in Cards */}
              <div className="flex flex-col gap-3 pt-2 border-t border-white/10">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <Youtube className="w-3.5 h-3.5 text-rose-400" />
                    Previously Played YouTube Streams ({filteredAndSortedYouTube.length})
                  </span>
                  {filteredAndSortedYouTube.length > 0 && (
                    <span className="text-[11px] text-white/40 font-mono">1-Click Fast Resume</span>
                  )}
                </div>

                {filteredAndSortedYouTube.length === 0 ? (
                  <div className="flex flex-col items-center justify-center p-8 rounded-2xl bg-white/5 border border-white/10 text-white/40 text-xs gap-2 text-center">
                    <Youtube className="w-8 h-8 opacity-40 text-rose-400" />
                    No YouTube videos played yet. Paste a link above to stream and save it to your library cards!
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {filteredAndSortedYouTube.map((item) => {
                      const yId = parseYouTubeId(item.url) || item.id;
                      const thumb = yId
                        ? `https://img.youtube.com/vi/${yId}/mqdefault.jpg`
                        : undefined;

                      return (
                        <div
                          key={item.id}
                          className="group relative rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-rose-400/40 p-3 flex flex-col gap-2 transition-all shadow-md"
                        >
                          <div className="flex gap-3 items-center">
                            {/* Thumbnail */}
                            <div className="relative w-24 h-16 rounded-xl overflow-hidden bg-black/60 shrink-0 border border-white/10">
                              {thumb ? (
                                <img
                                  src={thumb}
                                  alt={item.title}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                  onError={(e) => {
                                    (e.target as HTMLElement).style.display = 'none';
                                  }}
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-white/30">
                                  <Youtube className="w-6 h-6" />
                                </div>
                              )}
                              <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <Play className="w-6 h-6 text-white fill-white" />
                              </div>
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0 flex flex-col justify-between">
                              <div>
                                <h4 className="text-xs font-semibold text-white truncate group-hover:text-rose-300 transition-colors">
                                  {item.title || 'YouTube Stream'}
                                </h4>
                                <p className="text-[10px] text-white/40 font-mono truncate mt-0.5">
                                  ID: {yId || 'stream'}
                                </p>
                              </div>
                              <div className="flex items-center justify-between text-[10px] text-white/40 pt-1">
                                <span>{item.progressPercent ? `${item.progressPercent}% watched` : 'Recently saved'}</span>
                                <span>{new Date(item.timestamp).toLocaleDateString()}</span>
                              </div>
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex items-center justify-between pt-1 border-t border-white/10">
                            <button
                              onClick={() => {
                                openMedia(item.url, item.title, true, item.lastPositionMs);
                                onClose();
                              }}
                              className="px-3 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 font-semibold text-[11px] flex items-center gap-1.5 transition-colors"
                            >
                              <Play className="w-3 h-3 fill-rose-300" />
                              <span>{item.lastPositionMs ? 'Resume' : 'Play Now'}</span>
                            </button>

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                removeYouTubeHistory(item.url);
                              }}
                              className="p-1.5 rounded-lg hover:bg-rose-500/20 text-white/40 hover:text-rose-300 transition-colors"
                              title="Remove from history"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'recent' && (
            <div className="flex flex-col gap-2">
              {filteredAndSortedRecents.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-48 text-white/40 text-xs gap-2">
                  <Clock className="w-8 h-8 opacity-40" />
                  No matching playback history recorded yet.
                </div>
              ) : (
                filteredAndSortedRecents.map((item) => (
                  <div
                    key={item.mediaId}
                    className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/10 hover:border-cyan-400/40 hover:bg-white/10 cursor-pointer transition-all group"
                  >
                    <div
                      className="flex flex-col gap-1 truncate pr-4 flex-1"
                      onClick={() => {
                        openMedia(item.uri, item.title, true, item.lastPositionMs);
                        onClose();
                      }}
                    >
                      <span className="text-sm font-medium text-white truncate group-hover:text-cyan-300 transition-colors">
                        {item.title}
                      </span>
                      <div className="flex items-center gap-3 text-xs text-white/50">
                        <span>{item.progressPercent.toFixed(0)}% watched</span>
                        <span>•</span>
                        <span className="font-mono truncate">{formatPathForOS(item.uri)}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => {
                          openMedia(item.uri, item.title, true, item.lastPositionMs);
                          onClose();
                        }}
                        className="p-2 rounded-xl bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30 transition-colors"
                        title="Resume playback"
                      >
                        <Play className="w-4 h-4 fill-cyan-300" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeRecentMedia(item.uri);
                        }}
                        className="p-2 rounded-xl hover:bg-rose-500/20 text-white/40 hover:text-rose-300 transition-colors"
                        title="Remove from history"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'bookmarks' && (
            <div className="flex flex-col gap-2">
              {bookmarks.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-48 text-white/40 text-xs gap-2">
                  <Bookmark className="w-8 h-8 opacity-40 text-amber-400" />
                  No bookmarks saved. Click the bookmark icon in controls during playback to save one.
                </div>
              ) : (
                bookmarks.map((bm) => (
                  <div
                    key={bm.id}
                    onClick={() => {
                      if (currentUri !== bm.mediaId) {
                        openMedia(bm.mediaId);
                      }
                      seek(bm.timestampMs);
                      onClose();
                    }}
                    className="flex items-center justify-between p-3.5 rounded-2xl bg-white/5 border border-white/10 hover:border-amber-400/40 hover:bg-white/10 cursor-pointer transition-all active:scale-[0.99] group"
                    title="Click to jump to bookmark"
                  >
                    <div className="flex flex-col gap-0.5">
                      <span className="text-sm font-medium text-white group-hover:text-amber-300 transition-colors">
                        {bm.label}
                      </span>
                      <span className="text-xs font-mono text-amber-400">
                        Jump to: {(bm.timestampMs / 1000).toFixed(1)}s
                      </span>
                    </div>
                    <Play className="w-4 h-4 text-amber-400 shrink-0" />
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
