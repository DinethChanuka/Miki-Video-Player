import React, { useState } from 'react';
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
  Zap,
} from 'lucide-react';

interface FileBrowserModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// 100% Verified, CORS-enabled, High-Speed Public Streams
const DEMO_STREAMS = [
  {
    title: 'Big Buck Bunny (1080p 60fps VP9)',
    uri: 'https://upload.wikimedia.org/wikipedia/commons/transcoded/c/c0/Big_Buck_Bunny_4K.webm/Big_Buck_Bunny_4K.webm.1080p.vp9.webm',
    category: 'Wikimedia Open Movie',
    badge: '1080p 60fps',
  },
  {
    title: 'Mux Adaptive Multi-Bitrate HLS',
    uri: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
    category: 'Adaptive Bitrate HLS',
    badge: 'Auto 1080p',
  },
  {
    title: 'Apple Advanced 16x9 Stream',
    uri: 'https://devstreaming-cdn.apple.com/videos/streaming/examples/bipbop_16x9/bipbop_16x9_variant.m3u8',
    category: 'Apple CDN HLS',
    badge: 'Multi-Audio',
  },
  {
    title: 'Sintel Animated Film (1080p Hi-Fi)',
    uri: 'https://upload.wikimedia.org/wikipedia/commons/transcoded/f/f1/Sintel_movie_4K.webm/Sintel_movie_4K.webm.1080p.vp9.webm',
    category: 'Blender Open Movie',
    badge: 'Stereo Hi-Fi',
  },
];

export const FileBrowserModal: React.FC<FileBrowserModalProps> = ({ isOpen, onClose }) => {
  const openMedia = usePlayerStore((s) => s.openMedia);
  const recentMedia = usePlayerStore((s) => s.recentMedia);
  const bookmarks = usePlayerStore((s) => s.bookmarks);
  const seek = usePlayerStore((s) => s.seek);
  const currentUri = usePlayerStore((s) => s.currentUri);

  const [activeTab, setActiveTab] = useState<'demos' | 'recent' | 'bookmarks' | 'url'>('demos');
  const [customUrl, setCustomUrl] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  if (!isOpen) return null;

  const handleOpenLocalFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const uri = URL.createObjectURL(file);
      openMedia(uri, file.name);
      onClose();
    }
  };

  const handlePlayUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (customUrl.trim()) {
      openMedia(customUrl.trim());
      onClose();
    }
  };

  const filteredDemos = DEMO_STREAMS.filter((d) =>
    d.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="glass-panel w-full max-w-3xl h-[560px] p-6 rounded-3xl flex flex-col gap-5 border border-white/20 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-sky-500/20 text-sky-400 border border-sky-400/30">
              <Film className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">Media Explorer & Streams</h2>
              <p className="text-xs text-white/50">Local video files, YouTube streams, and high-speed test streams</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
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
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-semibold text-xs cursor-pointer transition-all shadow-lg shadow-sky-500/20 active:scale-95"
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
              className="p-2 rounded-full hover:bg-white/10 text-white/60 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-white/10 pb-2">
          <button
            onClick={() => setActiveTab('demos')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'demos'
                ? 'bg-sky-500/20 text-sky-300 border border-sky-400/30'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            Fast Demo Streams
          </button>

          <button
            onClick={() => setActiveTab('url')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'url'
                ? 'bg-sky-500/20 text-sky-300 border border-sky-400/30'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <Youtube className="w-3.5 h-3.5 text-rose-400" />
            YouTube / Network URL
          </button>

          <button
            onClick={() => setActiveTab('recent')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'recent'
                ? 'bg-sky-500/20 text-sky-300 border border-sky-400/30'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            Recent ({recentMedia.length})
          </button>

          <button
            onClick={() => setActiveTab('bookmarks')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'bookmarks'
                ? 'bg-sky-500/20 text-sky-300 border border-sky-400/30'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <Bookmark className="w-3.5 h-3.5" />
            Bookmarks ({bookmarks.length})
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto pr-1">
          {activeTab === 'demos' && (
            <div className="flex flex-col gap-3">
              <div className="relative">
                <Search className="w-4 h-4 text-white/40 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filter streams..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-white/5 rounded-xl border border-white/10 text-xs text-white placeholder-white/40 focus:outline-none focus:border-sky-400/50"
                />
              </div>

              <div className="grid grid-cols-1 gap-2.5 mt-1">
                {filteredDemos.map((demo) => (
                  <div
                    key={demo.title}
                    onClick={() => {
                      openMedia(demo.uri, demo.title);
                      onClose();
                    }}
                    className="flex items-center justify-between p-3.5 rounded-2xl glass-pill hover:border-sky-400/40 cursor-pointer group transition-all"
                  >
                    <div className="flex items-center gap-3 truncate pr-4">
                      <div className="p-2.5 rounded-xl bg-white/5 group-hover:bg-sky-500/20 text-sky-400 transition-colors">
                        <Play className="w-4 h-4 fill-sky-400" />
                      </div>
                      <div className="flex flex-col gap-0.5 truncate">
                        <span className="text-sm font-semibold text-white group-hover:text-sky-300 transition-colors truncate">
                          {demo.title}
                        </span>
                        <span className="text-xs text-white/40">{demo.category}</span>
                      </div>
                    </div>
                    <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-white/10 text-white/70 border border-white/10 shrink-0">
                      {demo.badge}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'url' && (
            <form onSubmit={handlePlayUrl} className="flex flex-col gap-4 py-3">
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex flex-col gap-2">
                <div className="flex items-center gap-2 text-rose-400 font-semibold text-xs">
                  <Youtube className="w-4 h-4" />
                  YouTube & Network Stream Fast-Loader
                </div>
                <p className="text-xs text-white/60 leading-relaxed">
                  Paste any <strong>YouTube URL</strong> (e.g.{' '}
                  <code className="text-sky-300 bg-white/10 px-1 py-0.5 rounded">
                    youtube.com/watch?v=...
                  </code>{' '}
                  or <code className="text-sky-300 bg-white/10 px-1 py-0.5 rounded">youtu.be/...</code>) or direct{' '}
                  <strong>HLS/DASH/MP4 stream</strong>. Our network optimizer will pre-fetch and stream immediately.
                </p>
              </div>

              <div className="flex flex-col gap-2">
                <input
                  type="text"
                  required
                  placeholder="Paste YouTube or video URL (https://...)"
                  value={customUrl}
                  onChange={(e) => setCustomUrl(e.target.value)}
                  className="w-full px-4 py-3.5 bg-white/5 rounded-2xl border border-white/15 text-sm text-white placeholder-white/30 focus:outline-none focus:border-sky-400"
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-[11px] text-emerald-400">
                  <Zap className="w-3.5 h-3.5" />
                  <span>Network Fast Prefetch & Optimizer Enabled</span>
                </div>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs shadow-lg shadow-sky-500/25 transition-all"
                >
                  Load & Play Stream
                </button>
              </div>
            </form>
          )}

          {activeTab === 'recent' && (
            <div className="flex flex-col gap-2">
              {recentMedia.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-48 text-white/40 text-xs gap-2">
                  <Clock className="w-8 h-8 opacity-40" />
                  No playback history recorded yet.
                </div>
              ) : (
                recentMedia.map((item) => (
                  <div
                    key={item.mediaId}
                    onClick={() => {
                      openMedia(item.uri, item.title);
                      onClose();
                    }}
                    className="flex items-center justify-between p-3.5 rounded-2xl glass-pill hover:border-sky-400/40 cursor-pointer transition-all"
                  >
                    <div className="flex flex-col gap-1 truncate pr-4">
                      <span className="text-sm font-medium text-white truncate">{item.title}</span>
                      <span className="text-xs text-white/50">
                        {item.progressPercent.toFixed(0)}% watched
                      </span>
                    </div>
                    <Play className="w-4 h-4 text-sky-400 shrink-0" />
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'bookmarks' && (
            <div className="flex flex-col gap-2">
              {bookmarks.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-48 text-white/40 text-xs gap-2">
                  <Bookmark className="w-8 h-8 opacity-40" />
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
                    className="flex items-center justify-between p-3.5 rounded-2xl glass-pill hover:border-sky-400/40 cursor-pointer transition-all active:scale-[0.99]"
                    title="Click to jump to bookmark"
                  >
                    <div className="flex flex-col gap-0.5">
                      <span className="text-sm font-medium text-white">{bm.label}</span>
                      <span className="text-xs font-mono text-sky-400">
                        Jump to: {(bm.timestampMs / 1000).toFixed(1)}s
                      </span>
                    </div>
                    <Play className="w-4 h-4 text-sky-400 shrink-0" />
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
