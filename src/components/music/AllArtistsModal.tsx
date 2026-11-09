import React, { useState, useMemo, useEffect } from 'react';
import {
  X,
  Search,
  Sparkles,
  Play,
  Globe,
  Radio,
  Music,
} from 'lucide-react';
import {
  ARTIST_CATALOG,
  ArtistProfile,
  ArtistLanguage,
  searchArtists,
} from '../../utils/artistCatalogService.ts';

export interface AllArtistsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectArtist: (artist: ArtistProfile | string) => void;
}

export const AllArtistsModal: React.FC<AllArtistsModalProps> = ({
  isOpen,
  onClose,
  onSelectArtist,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedLanguage, setSelectedLanguage] = useState<ArtistLanguage>('all');

  // Handle ESC key press to close modal
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Counts for language pills
  const counts = useMemo(() => {
    return {
      all: ARTIST_CATALOG.length,
      english: ARTIST_CATALOG.filter((a) => a.language === 'english').length,
      hindi: ARTIST_CATALOG.filter((a) => a.language === 'hindi').length,
      sinhala: ARTIST_CATALOG.filter((a) => a.language === 'sinhala').length,
    };
  }, []);

  // Filtered artists
  const filteredArtists = useMemo(() => {
    return searchArtists(searchQuery, selectedLanguage);
  }, [searchQuery, selectedLanguage]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-xl animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-5xl max-h-[90vh] flex flex-col rounded-3xl bg-[#0b0e14]/95 border border-white/10 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/10 bg-gradient-to-r from-blue-900/20 via-purple-900/10 to-transparent shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-fuchsia-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Music className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black text-white tracking-wide">
                  All Artists Directory
                </h2>
                <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-blue-500/15 border border-blue-500/30 text-blue-300">
                  <Sparkles className="w-3 h-3 text-cyan-400" />
                  <span>English • Hindi • Sinhala</span>
                </span>
              </div>
              <p className="text-xs text-white/50 mt-0.5">
                Select an artist to stream all their live songs from the internet
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white transition-all cursor-pointer"
            title="Close (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Language Filters Bar */}
        <div className="p-5 border-b border-white/10 bg-black/30 flex flex-col gap-4 shrink-0">
          {/* Search Input */}
          <div className="relative w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search artists in English, Hindi, Sinhala (e.g. Kasun Kalhara, Arijit Singh, Billie Eilish, කසුන්, अरिजीत)..."
              autoFocus
              className="w-full pl-11 pr-10 py-3 rounded-2xl bg-white/5 border border-white/10 focus:border-blue-500/50 focus:bg-white/10 text-sm text-white placeholder-white/40 outline-none transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 rounded-lg text-white/40 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Language Selector Pills */}
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1">
            <button
              onClick={() => setSelectedLanguage('all')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                selectedLanguage === 'all'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                  : 'bg-white/5 hover:bg-white/10 text-white/60 hover:text-white border border-white/5'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>All Artists</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-white/15">
                {counts.all}
              </span>
            </button>

            <button
              onClick={() => setSelectedLanguage('english')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                selectedLanguage === 'english'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                  : 'bg-white/5 hover:bg-white/10 text-white/60 hover:text-white border border-white/5'
              }`}
            >
              <span>🇺🇸 English Hits</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-white/15">
                {counts.english}
              </span>
            </button>

            <button
              onClick={() => setSelectedLanguage('hindi')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                selectedLanguage === 'hindi'
                  ? 'bg-orange-600 text-white shadow-lg shadow-orange-600/30'
                  : 'bg-white/5 hover:bg-white/10 text-white/60 hover:text-white border border-white/5'
              }`}
            >
              <span>🇮🇳 Hindi • बॉलीवुड</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-white/15">
                {counts.hindi}
              </span>
            </button>

            <button
              onClick={() => setSelectedLanguage('sinhala')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                selectedLanguage === 'sinhala'
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                  : 'bg-white/5 hover:bg-white/10 text-white/60 hover:text-white border border-white/5'
              }`}
            >
              <span>🇱🇰 Sinhala • ශ්‍රී ලංකා</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-white/15">
                {counts.sinhala}
              </span>
            </button>
          </div>
        </div>

        {/* Scrollable Artists Grid */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 scrollbar-thin">
          {filteredArtists.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {filteredArtists.map((artist) => (
                <div
                  key={artist.id}
                  onClick={() => {
                    onSelectArtist(artist);
                    onClose();
                  }}
                  className="group relative flex flex-col p-3.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-blue-500/40 transition-all cursor-pointer shadow-lg hover:-translate-y-1 select-none"
                >
                  {/* Portrait Avatar Container */}
                  <div className="relative w-full aspect-square rounded-xl overflow-hidden mb-3 bg-black/40 shadow-inner">
                    <img
                      src={artist.imageUrl}
                      alt={artist.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        const img = e.currentTarget as HTMLImageElement;
                        if (artist.fallbackImageUrl) {
                          img.src = artist.fallbackImageUrl;
                        }
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />

                    {/* Language Badge */}
                    <div className="absolute top-2 left-2">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-black/60 backdrop-blur-md border border-white/10 text-white">
                        {artist.language === 'english' && '🇺🇸 EN'}
                        {artist.language === 'hindi' && '🇮🇳 HI'}
                        {artist.language === 'sinhala' && '🇱🇰 SI'}
                      </span>
                    </div>

                    {/* Floating Play Icon */}
                    <div className="absolute bottom-2 right-2 w-9 h-9 rounded-xl bg-blue-600 group-hover:bg-blue-500 flex items-center justify-center text-white shadow-lg opacity-0 group-hover:opacity-100 group-hover:scale-100 scale-75 transition-all">
                      <Play className="w-4 h-4 fill-white ml-0.5" />
                    </div>
                  </div>

                  {/* Metadata */}
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs sm:text-sm font-bold text-white group-hover:text-blue-400 transition-colors truncate">
                      {artist.name}
                    </span>

                    {artist.nativeName && (
                      <span className="text-[11px] font-medium text-white/50 truncate mt-0.5">
                        {artist.nativeName}
                      </span>
                    )}

                    <div className="flex items-center justify-between text-[11px] text-white/40 mt-1.5 pt-1.5 border-t border-white/5">
                      <span className="truncate max-w-[80px]">
                        {artist.genre.split('/')[0]}
                      </span>
                      <span className="font-semibold text-white/60">
                        {artist.plays}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Arbitrary Search & Live YouTube Discovery Fallback Card */
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
              <div className="w-16 h-16 rounded-3xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-4 shadow-xl">
                <Radio className="w-8 h-8 animate-pulse" />
              </div>

              <h3 className="text-lg font-bold text-white mb-1">
                Search "{searchQuery}" Live on the Internet
              </h3>
              <p className="text-xs text-white/50 max-w-md mb-6">
                Not in the presets? No problem! Mikey Player can search and stream all songs of any artist in English, Hindi, or Sinhala live from YouTube Music.
              </p>

              <button
                onClick={() => {
                  onSelectArtist(searchQuery.trim());
                  onClose();
                }}
                className="flex items-center gap-2.5 px-6 py-3 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-fuchsia-600 hover:brightness-110 active:scale-95 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-xl shadow-blue-600/30 cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-yellow-300" />
                <span>Stream "{searchQuery}" Live from Internet</span>
              </button>
            </div>
          )}
        </div>

        {/* Bottom Footer Info */}
        <div className="px-6 py-3.5 border-t border-white/10 bg-black/40 flex items-center justify-between text-xs text-white/40 shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-white/60">
              Live YouTube Music Streaming Active
            </span>
          </div>
          <span>Showing {filteredArtists.length} of {counts.all} artists</span>
        </div>
      </div>
    </div>
  );
};
