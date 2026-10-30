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
  Trash2,
} from 'lucide-react';
import { parseYouTubeId } from '../../App';

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
  const removeRecentMedia = usePlayerStore((s) => s.removeRecentMedia);
  const bookmarks = usePlayerStore((s) => s.bookmarks);
  const seek = usePlayerStore((s) => s.seek);
  const currentUri = usePlayerStore((s) => s.currentUri);
  const youtubeHistory = usePlayerStore((s) => s.youtubeHistory);
  const addYouTubeHistory = usePlayerStore((s) => s.addYouTubeHistory);
  const removeYouTubeHistory = usePlayerStore((s) => s.removeYouTubeHistory);

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
    const trimmed = customUrl.trim();
    if (trimmed) {
      addYouTubeHistory(trimmed);
      openMedia(trimmed);
      onClose();
    }
  };

  const filteredDemos = DEMO_STREAMS.filter((d) =>
    d.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md animate-in fade-in duration-200 p-4">
      <div className="glass-panel w-full max-w-4xl h-[620px] p-6 rounded-3xl flex flex-col gap-5 border border-white/20 shadow-2xl overflow-hidden bg-slate-950/90">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-400/30">
              <Film className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">Media Explorer & Streams</h2>
              <p className="text-xs text-white/50">Local files, YouTube stream cards, and high-speed test streams</p>
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
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs cursor-pointer transition-all shadow-lg shadow-cyan-500/20 active:scale-95"
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

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-white/10 pb-2.5">
          <button
            onClick={() => setActiveTab('demos')}
            className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-semibold transition-all ${
              activeTab === 'demos'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 shadow-sm'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            Fast Demo Streams
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
                  className="w-full pl-9 pr-4 py-2.5 bg-white/5 rounded-2xl border border-white/10 text-xs text-white placeholder-white/40 focus:outline-none focus:border-cyan-400/50"
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
                    className="flex items-center justify-between p-3.5 rounded-2xl bg-white/5 border border-white/10 hover:border-cyan-400/40 hover:bg-white/10 cursor-pointer group transition-all"
                  >
                    <div className="flex items-center gap-3 truncate pr-4">
                      <div className="p-2.5 rounded-xl bg-white/5 group-hover:bg-cyan-500/20 text-cyan-400 transition-colors">
                        <Play className="w-4 h-4 fill-cyan-400" />
                      </div>
                      <div className="flex flex-col gap-0.5 truncate">
                        <span className="text-sm font-semibold text-white group-hover:text-cyan-300 transition-colors truncate">
                          {demo.title}
                        </span>
                        <span className="text-xs text-white/40">{demo.category}</span>
                      </div>
                    </div>
                    <span className="text-[11px] font-mono px-3 py-1 rounded-full bg-white/10 text-white/70 border border-white/10 shrink-0">
                      {demo.badge}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'url' && (
            <div className="flex flex-col gap-5 py-1">
              {/* Form to load URL */}
              <form onSubmit={handlePlayUrl} className="flex flex-col gap-3">
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex flex-col gap-1.5">
                  <div className="flex items-center gap-2 text-rose-400 font-semibold text-xs">
                    <Youtube className="w-4 h-4" />
                    YouTube & Network Stream Fast-Loader
                  </div>
                  <p className="text-xs text-white/60 leading-relaxed">
                    Paste any <strong>YouTube URL</strong> or direct <strong>HLS / DASH / MP4</strong> stream link.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    required
                    placeholder="Paste YouTube or video URL (https://youtube.com/watch?v=...)"
                    value={customUrl}
                    onChange={(e) => setCustomUrl(e.target.value)}
                    className="flex-1 px-4 py-3 bg-white/5 rounded-2xl border border-white/15 text-xs text-white placeholder-white/30 focus:outline-none focus:border-cyan-400"
                  />
                  <button
                    type="submit"
                    className="px-5 py-3 rounded-2xl bg-gradient-to-r from-rose-500 to-red-600 hover:brightness-110 text-white font-bold text-xs shadow-lg shadow-rose-500/20 transition-all shrink-0 active:scale-95 flex items-center gap-1.5"
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
                    Previously Played YouTube Streams ({youtubeHistory.length})
                  </span>
                  {youtubeHistory.length > 0 && (
                    <span className="text-[11px] text-white/40 font-mono">1-Click Fast Resume</span>
                  )}
                </div>

                {youtubeHistory.length === 0 ? (
                  <div className="flex flex-col items-center justify-center p-8 rounded-2xl bg-white/5 border border-white/10 text-white/40 text-xs gap-2 text-center">
                    <Youtube className="w-8 h-8 opacity-40 text-rose-400" />
                    No YouTube videos played yet. Paste a link above to stream and save it to your library cards!
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {youtubeHistory.map((item) => {
                      const yId = parseYouTubeId(item.url) || item.id;
                      const thumb = yId
                        ? `https://img.youtube.com/vi/${yId}/mqdefault.jpg`
                        : undefined;

                      return (
                        <div
                          key={item.id}
                          className="group relative rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-rose-400/40 p-3 flex flex-col gap-2.5 transition-all shadow-md"
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
                              <span className="text-[10px] text-white/30">
                                {new Date(item.timestamp).toLocaleDateString()}
                              </span>
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex items-center justify-between pt-1 border-t border-white/10">
                            <button
                              onClick={() => {
                                openMedia(item.url, item.title);
                                onClose();
                              }}
                              className="px-3 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 font-semibold text-[11px] flex items-center gap-1.5 transition-colors"
                            >
                              <Play className="w-3 h-3 fill-rose-300" />
                              <span>Play Now</span>
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
              {recentMedia.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-48 text-white/40 text-xs gap-2">
                  <Clock className="w-8 h-8 opacity-40" />
                  No playback history recorded yet.
                </div>
              ) : (
                recentMedia.map((item) => (
                  <div
                    key={item.mediaId}
                    className="flex items-center justify-between p-3.5 rounded-2xl bg-white/5 border border-white/10 hover:border-cyan-400/40 hover:bg-white/10 cursor-pointer transition-all group"
                  >
                    <div
                      className="flex flex-col gap-1 truncate pr-4 flex-1"
                      onClick={() => {
                        openMedia(item.uri, item.title);
                        onClose();
                      }}
                    >
                      <span className="text-sm font-medium text-white truncate group-hover:text-cyan-300 transition-colors">
                        {item.title}
                      </span>
                      <div className="flex items-center gap-3 text-xs text-white/50">
                        <span>{item.progressPercent.toFixed(0)}% watched</span>
                        <span>•</span>
                        <span className="font-mono truncate">{item.uri}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => {
                          openMedia(item.uri, item.title);
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
