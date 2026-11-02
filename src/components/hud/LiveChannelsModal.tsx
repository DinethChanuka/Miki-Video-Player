import React, { useState, useMemo, useRef } from 'react';
import {
  CURATED_CHANNELS,
  LiveChannel,
  ChannelCategory,
  parseM3UPlaylist,
  validateStreamUrl,
} from '../../utils/channelCatalog.ts';
import {
  Tv,
  Radio,
  Search,
  X,
  Play,
  Globe,
  CheckCircle2,
  FolderOpen,
} from 'lucide-react';

interface LiveChannelsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPlayChannel: (channel: LiveChannel) => void;
}

const CATEGORIES: ('All' | ChannelCategory)[] = [
  'All',
  'News',
  'Tech',
  'Sports',
  'Music',
  'Nature',
  'Entertainment',
  'Custom',
];

export const LiveChannelsModal: React.FC<LiveChannelsModalProps> = ({
  isOpen,
  onClose,
  onPlayChannel,
}) => {
  const [channels, setChannels] = useState<LiveChannel[]>(CURATED_CHANNELS);
  const [selectedCategory, setSelectedCategory] = useState<'All' | ChannelCategory>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [networkUrlInput, setNetworkUrlInput] = useState<string>('');
  const [networkUrlError, setNetworkUrlError] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredChannels = useMemo(() => {
    return channels.filter((ch) => {
      const matchesCategory =
        selectedCategory === 'All' || ch.category === selectedCategory;
      const matchesSearch =
        searchQuery.trim() === '' ||
        ch.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ch.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ch.category.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [channels, selectedCategory, searchQuery]);

  const handleOpenDirectStream = () => {
    setNetworkUrlError(null);
    const trimmed = networkUrlInput.trim();
    if (!validateStreamUrl(trimmed)) {
      setNetworkUrlError('Please enter a valid http:// or https:// stream URL.');
      return;
    }

    const customChannel: LiveChannel = {
      id: `custom-${Date.now()}`,
      name: trimmed.split('/').pop()?.split('?')[0] || 'Custom Network Stream',
      category: 'Custom',
      streamUrl: trimmed,
      logo: 'https://images.unsplash.com/photo-1594909122845-11baa439b7bf?auto=format&fit=crop&w=200&q=80',
      country: 'NET',
      quality: 'Direct Stream',
      description: `Direct network stream from ${trimmed}`,
      isLive: true,
    };

    setChannels((prev) => [customChannel, ...prev]);
    onPlayChannel(customChannel);
    onClose();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (!text) return;

      const imported = parseM3UPlaylist(text);
      if (imported.length > 0) {
        setChannels((prev) => [...imported, ...prev]);
        setSelectedCategory('Custom');
        setSuccessNotice(`Successfully imported ${imported.length} channels from ${file.name}!`);
        setTimeout(() => setSuccessNotice(null), 4000);
      } else {
        setNetworkUrlError('No valid stream URLs found in this M3U file.');
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-6 animate-fadeIn">
      <div className="relative w-full max-w-5xl h-[88vh] bg-[#0c101c]/95 border border-white/10 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-white">
        {/* HEADER BAR */}
        <header className="px-6 py-4 border-b border-white/10 flex items-center justify-between gap-4 shrink-0 bg-[#0f1424]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-rose-600 flex items-center justify-center text-white shadow-lg shadow-amber-500/20">
              <Tv className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-tight">
                  VLC Live Channel Streaming
                </h2>
                <span className="flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                  LIVE IPTV
                </span>
              </div>
              <p className="text-xs text-white/50">
                Stream 24/7 news, space feeds, music, and custom M3U/M3U8 network playlists
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 text-white/70 hover:text-white transition-all"
            title="Close Channels Guide"
          >
            <X className="w-5 h-5" />
          </button>
        </header>

        {/* VLC-STYLE OPEN NETWORK STREAM INPUT BAR */}
        <div className="px-6 py-3 bg-[#080b14] border-b border-white/5 flex flex-col gap-2 shrink-0">
          <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center">
            <div className="relative flex-1">
              <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-400" />
              <input
                type="text"
                value={networkUrlInput}
                onChange={(e) => {
                  setNetworkUrlInput(e.target.value);
                  setNetworkUrlError(null);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleOpenDirectStream();
                }}
                placeholder="Open Network Stream (e.g. https://.../playlist.m3u8 or vlc stream URL)"
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-white/40 focus:outline-none focus:border-amber-400 transition-all font-mono"
              />
            </div>

            <button
              onClick={handleOpenDirectStream}
              className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white text-xs font-bold transition-all shadow-md shadow-orange-600/30 whitespace-nowrap"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Play Stream</span>
            </button>

            <label className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-white text-xs font-semibold cursor-pointer transition-all whitespace-nowrap">
              <FolderOpen className="w-3.5 h-3.5 text-cyan-400" />
              <span>Import M3U</span>
              <input
                ref={fileInputRef}
                type="file"
                accept=".m3u,.m3u8,.txt"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>

          {networkUrlError && (
            <span className="text-[11px] text-rose-400 font-medium">{networkUrlError}</span>
          )}

          {successNotice && (
            <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{successNotice}</span>
            </div>
          )}
        </div>

        {/* CATEGORY TABS & SEARCH FILTER BAR */}
        <div className="px-6 py-3 bg-[#0b0f1c] border-b border-white/5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shrink-0">
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20 font-bold'
                    : 'bg-white/5 text-white/60 hover:text-white hover:bg-white/10 border border-white/5'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative min-w-[220px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search channels..."
              className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-white/30 focus:outline-none focus:border-amber-400 transition-all"
            />
          </div>
        </div>

        {/* CHANNEL GUIDE GRID */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 scrollbar-thin bg-[#06080e]">
          {filteredChannels.length === 0 ? (
            <div className="col-span-full py-16 flex flex-col items-center justify-center text-center">
              <Radio className="w-10 h-10 text-white/20 mb-3 animate-pulse" />
              <h3 className="text-sm font-bold text-white/70">No channels found</h3>
              <p className="text-xs text-white/40 mt-1">
                Try selecting another category or enter an M3U network stream URL above.
              </p>
            </div>
          ) : (
            filteredChannels.map((channel) => (
              <div
                key={channel.id}
                onClick={() => {
                  onPlayChannel(channel);
                  onClose();
                }}
                className="group relative flex flex-col justify-between p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-amber-500/50 hover:bg-white/10 transition-all cursor-pointer shadow-lg hover:shadow-amber-500/10"
              >
                <div className="flex items-start gap-3.5">
                  {/* Channel Logo */}
                  <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-black/50 border border-white/10 shrink-0">
                    <img
                      src={channel.logo}
                      alt={channel.name}
                      className="w-full h-full object-cover transition-transform group-hover:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute top-1 left-1 w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  </div>

                  {/* Channel Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-black/60 border border-white/10 text-amber-300 font-semibold">
                        {channel.country}
                      </span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/5 text-white/60">
                        {channel.category}
                      </span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-400/20">
                        {channel.quality}
                      </span>
                    </div>

                    <h3 className="text-xs font-bold text-white group-hover:text-amber-300 transition-colors mt-1.5 truncate">
                      {channel.name}
                    </h3>

                    <p className="text-[11px] text-white/50 line-clamp-2 mt-1 leading-snug">
                      {channel.description}
                    </p>
                  </div>
                </div>

                {/* Card Action Footer */}
                <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between">
                  <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    ONLINE BROADCAST
                  </span>

                  <span className="text-xs font-bold text-amber-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    <span>Watch Live</span>
                    <Play className="w-3 h-3 fill-current" />
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* MODAL FOOTER */}
        <footer className="px-6 py-2.5 bg-[#090c16] border-t border-white/10 flex items-center justify-between text-xs text-white/50 shrink-0">
          <div className="flex items-center gap-2">
            <Radio className="w-3.5 h-3.5 text-amber-400" />
            <span>{channels.length} Live Channels Available</span>
          </div>
          <span className="hidden sm:inline text-white/40">
            Powered by VLC-compatible HLS network buffer & audio overdrive
          </span>
        </footer>
      </div>
    </div>
  );
};

export default LiveChannelsModal;
