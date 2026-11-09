import React, { useState, useEffect, useRef } from 'react';
import { usePlayerStore } from '../../store/playerStore';
import {
  MusicTrack,
} from '../../core/MusicAudioEngine';
import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Volume2,
  VolumeX,
  Shuffle,
  Repeat,
  Heart,
  Download,
  Headphones,
  Search,
  CheckCircle2,
  FolderOpen,
  Sparkles,
} from 'lucide-react';

export interface SpotifyAlbum {
  id: string;
  title: string;
  year: string;
  coverUrl: string;
}

export interface RelatedArtist {
  id: string;
  name: string;
  avatarUrl: string;
}

export const SPOTIFY_ALBUMS: SpotifyAlbum[] = [
  {
    id: 'bigger-love',
    title: 'Bigger Love',
    year: '2020',
    coverUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'love-in-the-future',
    title: 'Love In The Future',
    year: '2013',
    coverUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'darkness-and-light',
    title: 'Darkness and Light',
    year: '2016',
    coverUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'get-lifted',
    title: 'Get Lifted',
    year: '2004',
    coverUrl: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'once-again',
    title: 'Once Again',
    year: '2006',
    coverUrl: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'wake-up',
    title: 'Wake Up!',
    year: '2010',
    coverUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80',
  },
];

export const FANS_LIKE_TOO: RelatedArtist[] = [
  { id: 'alicia-keys', name: 'Alicia Keys', avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80' },
  { id: 'sam-smith', name: 'Sam Smith', avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80' },
  { id: 'adele', name: 'Adele', avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=300&q=80' },
  { id: 'bruno-mars', name: 'Bruno Mars', avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80' },
  { id: 'michael-buble', name: 'Michael Bublé', avatarUrl: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=300&q=80' },
  { id: 'stevie-wonder', name: 'Stevie Wonder', avatarUrl: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=300&q=80' },
];

export const FEATURED_MUSIC_TRACKS: (MusicTrack & { plays?: string })[] = [
  {
    id: 'track-i-know-better',
    title: 'I Know Better',
    artist: 'John Legend',
    url: 'https://archive.org/download/mythium/PNY04-05_M.mp3',
    durationSec: 233,
    plays: '264,341,875',
    albumArt: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'track-bigger-love',
    title: 'Bigger Love',
    artist: 'John Legend',
    url: 'https://archive.org/download/mythium/PNY04-05_OTW.mp3',
    durationSec: 264,
    plays: '128,636,453',
    albumArt: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'track-all-of-me',
    title: 'All Of Me',
    artist: 'John Legend',
    url: 'https://archive.org/download/mythium/BSFM_ATKM.mp3',
    durationSec: 222,
    plays: '952,772,984',
    albumArt: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'track-this-christmas',
    title: 'This Christmas',
    artist: 'John Legend',
    url: 'https://archive.org/download/mythium/PNY04-05_M.mp3',
    durationSec: 218,
    plays: '52,672,984',
    albumArt: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'track-wild',
    title: 'Wild (feat. Gary Clark Jr)',
    artist: 'John Legend',
    url: 'https://archive.org/download/mythium/PNY04-05_OTW.mp3',
    durationSec: 196,
    plays: '84,192,019',
    albumArt: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'track-minefields',
    title: 'Minefields (feat. Faouzia)',
    artist: 'John Legend',
    url: 'https://archive.org/download/mythium/BSFM_ATKM.mp3',
    durationSec: 217,
    plays: '142,501,882',
    albumArt: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80',
  },
];

export const MusicPlayerView: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const previousBlobUrlRef = useRef<string | null>(null);

  // Authoritative Player Store Integration
  const currentUri = usePlayerStore((s) => s.currentUri);
  const isPaused = usePlayerStore((s) => s.isPaused);
  const positionMs = usePlayerStore((s) => s.positionMs);
  const durationMs = usePlayerStore((s) => s.durationMs);
  const storeVolume = usePlayerStore((s) => s.volume);
  const isMuted = usePlayerStore((s) => s.isMuted);
  const toggleMute = usePlayerStore((s) => s.toggleMute);
  const openMedia = usePlayerStore((s) => s.openMedia);
  const togglePlay = usePlayerStore((s) => s.togglePlay);
  const seek = usePlayerStore((s) => s.seek);
  const setStoreVolume = usePlayerStore((s) => s.setVolume);

  const [tracks, setTracks] = useState<(MusicTrack & { plays?: string })[]>(FEATURED_MUSIC_TRACKS);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'library' | 'genre' | 'playlist'>('playlist');
  const [activePreset, setActivePreset] = useState<string>('Studio Master');
  const [likedSongIds, setLikedSongIds] = useState<Record<string, boolean>>({
    'track-i-know-better': true,
    'track-all-of-me': true,
  });

  const isPlaying = !isPaused && Boolean(currentUri);
  const currentTime = positionMs / 1000;
  const currentTrack = tracks[currentTrackIndex] || tracks[0];
  const duration = durationMs > 0 ? durationMs / 1000 : (currentTrack?.durationSec || 233);

  // Realtime spectrum visualizer loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let phase = 0;
    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const barCount = 16;
      const barWidth = canvas.width / barCount;

      if (isPlaying) {
        phase += 0.08;
      }

      for (let i = 0; i < barCount; i++) {
        let barHeight = 2;
        if (isPlaying) {
          const wave = Math.sin(phase + i * 0.45) * 0.5 + 0.5;
          barHeight = Math.max(3, wave * canvas.height * 0.9);
        }
        const x = i * barWidth;
        const grad = ctx.createLinearGradient(0, canvas.height - barHeight, 0, canvas.height);
        grad.addColorStop(0, '#06b6d4');
        grad.addColorStop(1, '#a855f7');
        ctx.fillStyle = grad;
        ctx.fillRect(x, canvas.height - barHeight, barWidth - 1.5, barHeight);
      }
      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isPlaying]);

  // Match currentUri to tracks array if already active
  useEffect(() => {
    if (currentUri) {
      const idx = tracks.findIndex((t) => t.url === currentUri);
      if (idx !== -1) {
        setCurrentTrackIndex(idx);
      }
    }
  }, [currentUri, tracks]);

  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      if (previousBlobUrlRef.current) {
        URL.revokeObjectURL(previousBlobUrlRef.current);
      }
    };
  }, []);

  const handlePlayTrack = async (index: number) => {
    setCurrentTrackIndex(index);
    const track = tracks[index];
    if (track) {
      await openMedia(track.url, `${track.title} - ${track.artist}`, true, 0, track.albumArt, 'music');
    }
  };

  const handleTogglePlay = async () => {
    if (!currentUri) {
      await handlePlayTrack(currentTrackIndex);
    } else {
      await togglePlay();
    }
  };

  const handleNext = () => {
    const nextIdx = (currentTrackIndex + 1) % tracks.length;
    handlePlayTrack(nextIdx);
  };

  const handlePrev = () => {
    const prevIdx = (currentTrackIndex - 1 + tracks.length) % tracks.length;
    handlePlayTrack(prevIdx);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const posSec = parseFloat(e.target.value);
    seek(posSec * 1000);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const vol = parseFloat(e.target.value);
    setStoreVolume(vol);
  };

  const toggleSongLike = (id: string) => {
    setLikedSongIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleLoadLocalAudio = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (previousBlobUrlRef.current) {
        URL.revokeObjectURL(previousBlobUrlRef.current);
      }
      const localUrl = URL.createObjectURL(file);
      previousBlobUrlRef.current = localUrl;
      const newTrack: MusicTrack & { plays?: string } = {
        id: `local-${Date.now()}`,
        title: file.name.replace(/\.[^/.]+$/, ''),
        artist: 'Local Track',
        url: localUrl,
        durationSec: 180,
        plays: '1,200',
        albumArt: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=400&q=80',
      };
      setTracks((prev) => [newTrack, ...prev]);
      setCurrentTrackIndex(0);
      openMedia(localUrl, newTrack.title, true, 0, undefined, 'music');
    }
  };

  const formatSeconds = (sec: number) => {
    if (isNaN(sec) || sec < 0) return '0:00';
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const filteredTracks = tracks.filter((t) => {
    if (!searchQuery) return true;
    return (
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.artist.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <div className="flex flex-col w-full h-full bg-[#121418] text-white rounded-3xl overflow-hidden border border-white/10 shadow-2xl select-none">
      {/* 1. Spotify Top Navigation Bar */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-[#161920]/80 backdrop-blur-md">
        <div className="flex items-center gap-6">
          <button
            onClick={() => setActiveTab('library')}
            className={`text-xs font-bold transition-colors cursor-pointer ${
              activeTab === 'library' ? 'text-white' : 'text-white/50 hover:text-white'
            }`}
          >
            Library
          </button>
          <button
            onClick={() => setActiveTab('genre')}
            className={`text-xs font-bold transition-colors cursor-pointer ${
              activeTab === 'genre' ? 'text-white' : 'text-white/50 hover:text-white'
            }`}
          >
            Genre
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative w-72 sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/40" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search songs, artists..."
            className="w-full pl-9 pr-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-white placeholder-white/40 focus:outline-none focus:border-cyan-500/50 focus:bg-white/10 transition-all"
          />
        </div>

        {/* Go Pro & Local Import */}
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-white/80 cursor-pointer transition-all">
            <FolderOpen className="w-3.5 h-3.5 text-cyan-400" />
            <span>Import</span>
            <input
              type="file"
              accept="audio/*,.mp3,.flac,.wav,.m4a,.aac,.ogg,.opus"
              className="hidden"
              onChange={handleLoadLocalAudio}
            />
          </label>

          <div className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 text-amber-300 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Go Pro</span>
          </div>
        </div>
      </div>

      {/* Main Content Area: Left Playlist & Shelf, Right Top Songs & Fans Like */}
      <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-8 custom-scrollbar">
        {/* 2. Artist Spotlight Hero Banner (Image 1) */}
        <div className="relative w-full rounded-3xl bg-gradient-to-r from-neutral-900 via-neutral-900/90 to-neutral-800 border border-white/10 overflow-hidden shadow-2xl flex flex-col sm:flex-row items-center justify-between min-h-[220px]">
          <div className="flex flex-col p-8 sm:p-10 z-10 max-w-lg">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-white/60">
                Artist
              </span>
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-cyan-500/20 border border-cyan-500/30 text-[10px] font-bold text-cyan-400">
                <CheckCircle2 className="w-3 h-3 text-cyan-400" />
                <span>Verified</span>
              </span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight mb-2">
              John Legend
            </h1>

            <p className="text-xs font-semibold text-white/60">
              54,698,364 Monthly Listeners
            </p>
          </div>

          {/* Duotone Artist Photo with Seamless Radial Fade */}
          <div className="relative w-full sm:w-80 h-56 sm:h-64 shrink-0 flex items-center justify-end">
            <div className="absolute inset-0 bg-gradient-to-r from-neutral-900 via-transparent to-transparent z-10 pointer-events-none" />
            <img
              src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=700&q=80"
              alt="John Legend Spotlight"
              className="w-full h-full object-cover object-top filter grayscale contrast-125"
            />
          </div>
        </div>

        {/* 3. Playlist Tracks Table & Right Side Panels Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column (col-span-8): Playlist Track Table & New Album Shelf */}
          <div className="lg:col-span-8 flex flex-col gap-8">
            {/* Playlist Table */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-black text-white tracking-wide">
                  Playlist
                </h3>
                <button className="text-xs font-semibold text-white/40 hover:text-white transition-colors cursor-pointer">
                  See all
                </button>
              </div>

              {/* Tracks Table Header */}
              <div className="grid grid-cols-12 gap-3 px-4 py-2 text-[11px] font-bold uppercase tracking-wider text-white/40 border-b border-white/5">
                <span className="col-span-1 text-center">#</span>
                <span className="col-span-6">Title</span>
                <span className="col-span-3 text-right">Plays</span>
                <span className="col-span-2 text-right">Duration</span>
              </div>

              {/* Tracks Rows */}
              <div className="flex flex-col gap-1.5">
                {filteredTracks.map((track, idx) => {
                  const isCurrent = currentTrackIndex === idx;
                  const isLiked = likedSongIds[track.id] || false;
                  return (
                    <div
                      key={track.id}
                      onClick={() => handlePlayTrack(idx)}
                      className={`grid grid-cols-12 gap-3 items-center px-4 py-3 rounded-2xl border transition-all cursor-pointer group ${
                        isCurrent
                          ? 'bg-white/10 border-white/20 text-white shadow-md'
                          : 'bg-white/5 hover:bg-white/8 border-transparent hover:border-white/10 text-white/80'
                      }`}
                    >
                      {/* Rank / Play Indicator */}
                      <div className="col-span-1 flex items-center justify-center">
                        {isCurrent && isPlaying ? (
                          <div className="flex items-end gap-0.5 h-3.5">
                            <span className="w-0.5 h-3 bg-cyan-400 animate-pulse" />
                            <span className="w-0.5 h-3.5 bg-rose-400 animate-pulse" />
                            <span className="w-0.5 h-2 bg-purple-400 animate-pulse" />
                          </div>
                        ) : (
                          <span className="text-xs font-bold font-mono text-white/40 group-hover:hidden">
                            #{idx + 1}
                          </span>
                        )}
                        <Play className="w-3.5 h-3.5 fill-white hidden group-hover:block" />
                      </div>

                      {/* Cover & Title */}
                      <div className="col-span-6 flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-xl overflow-hidden bg-black/50 shrink-0 border border-white/10 shadow-sm">
                          <img
                            src={track.albumArt || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=400&q=80'}
                            alt={track.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="text-xs font-extrabold text-white truncate group-hover:text-cyan-300 transition-colors">
                            {track.title}
                          </span>
                          <span className="text-[11px] text-white/50 truncate">
                            {track.artist}
                          </span>
                        </div>
                      </div>

                      {/* Stream Count with Headphones Icon */}
                      <div className="col-span-3 flex items-center justify-end gap-1.5 text-xs text-white/60 font-mono">
                        <Headphones className="w-3.5 h-3.5 text-white/40" />
                        <span>{track.plays || '154,209,112'}</span>
                      </div>

                      {/* Duration & Like Button */}
                      <div className="col-span-2 flex items-center justify-end gap-3 text-xs font-mono text-white/50">
                        <span>{formatSeconds(track.durationSec)}</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleSongLike(track.id);
                          }}
                          className="p-1 hover:text-white transition-colors cursor-pointer"
                        >
                          <Heart
                            className={`w-3.5 h-3.5 ${
                              isLiked ? 'fill-rose-500 text-rose-500' : 'text-white/40 hover:text-white'
                            }`}
                          />
                        </button>
                        <button
                          onClick={(e) => e.stopPropagation()}
                          className="p-1 text-white/30 hover:text-white transition-colors cursor-pointer"
                          title="More options"
                        >
                          <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                            <circle cx="5" cy="12" r="2" />
                            <circle cx="12" cy="12" r="2" />
                            <circle cx="19" cy="12" r="2" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 4. New Album / Discography Shelf (Image 1) */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-black text-white tracking-wide">
                  New Album
                </h3>
                <button className="text-xs font-semibold text-white/40 hover:text-white transition-colors cursor-pointer">
                  See all
                </button>
              </div>

              {/* Horizontal Album Shelf */}
              <div className="flex items-center gap-4 overflow-x-auto pb-2 scrollbar-none w-full">
                {SPOTIFY_ALBUMS.map((album) => (
                  <div
                    key={album.id}
                    className="flex flex-col min-w-[130px] sm:min-w-[140px] p-2.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all cursor-pointer group shadow-lg"
                  >
                    <div className="w-full aspect-square rounded-xl overflow-hidden mb-2.5 shadow-md border border-white/10 relative">
                      <img
                        src={album.coverUrl}
                        alt={album.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors" />
                    </div>
                    <span className="text-xs font-bold text-white truncate group-hover:text-cyan-400 transition-colors">
                      {album.title}
                    </span>
                    <span className="text-[11px] font-mono text-white/40 mt-0.5">
                      {album.year}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column (col-span-4): Top Song & Fans Like too */}
          <div className="lg:col-span-4 flex flex-col gap-8">
            {/* Top Song Panel */}
            <div className="flex flex-col gap-3 p-5 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md shadow-xl">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-extrabold text-white tracking-wide">
                  Top Song
                </h3>
                <button className="text-xs font-semibold text-white/40 hover:text-white transition-colors cursor-pointer">
                  See all
                </button>
              </div>

              <div className="flex flex-col gap-2">
                {[
                  { rank: '#1', title: 'All of Me - John Legend', duration: '3:42', idx: 2 },
                  { rank: '#2', title: 'Wild (feat Gary Clark Jr)', duration: '3:16', idx: 4 },
                  { rank: '#3', title: 'Minefields (feat Faouzia)', duration: '3:37', idx: 5 },
                ].map((item) => (
                  <div
                    key={item.rank}
                    onClick={() => handlePlayTrack(item.idx)}
                    className="flex items-center justify-between p-2.5 rounded-2xl bg-black/30 hover:bg-white/10 border border-white/5 transition-all cursor-pointer group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-xs font-mono font-bold text-white/40 group-hover:text-cyan-400 transition-colors w-5">
                        {item.rank}
                      </span>
                      <div className="w-8 h-8 rounded-lg overflow-hidden bg-black/60 shrink-0">
                        <img
                          src={tracks[item.idx]?.albumArt || tracks[0].albumArt}
                          alt={item.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <span className="text-xs font-bold text-white truncate group-hover:text-cyan-300 transition-colors">
                        {item.title}
                      </span>
                    </div>

                    <div className="flex items-center gap-2.5 shrink-0">
                      <span className="text-[11px] font-mono text-white/40">
                        {item.duration}
                      </span>
                      <Play className="w-3 h-3 fill-white text-white/60 group-hover:text-white group-hover:fill-cyan-400 transition-colors" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Fans Like too Panel (Image 1) */}
            <div className="flex flex-col gap-3 p-5 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md shadow-xl">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-extrabold text-white tracking-wide">
                  Fans Like too
                </h3>
                <button className="text-xs font-semibold text-white/40 hover:text-white transition-colors cursor-pointer">
                  See all
                </button>
              </div>

              {/* 3 x 2 Avatar Grid */}
              <div className="grid grid-cols-3 gap-3 pt-1">
                {FANS_LIKE_TOO.map((artist) => (
                  <div
                    key={artist.id}
                    className="flex flex-col items-center gap-1.5 p-2 rounded-2xl bg-black/20 hover:bg-white/10 transition-all cursor-pointer group"
                  >
                    <div className="w-14 h-14 rounded-2xl overflow-hidden border border-white/10 shadow-md group-hover:scale-105 transition-transform">
                      <img
                        src={artist.avatarUrl}
                        alt={artist.name}
                        className="w-full h-full object-cover filter contrast-105"
                      />
                    </div>
                    <span className="text-[11px] font-semibold text-white/70 group-hover:text-white transition-colors truncate max-w-[80px] text-center">
                      {artist.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Bottom Playback Dock (Image 1) */}
      <div className="w-full px-6 py-3.5 bg-[#0e1014] border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 shrink-0 shadow-2xl z-20">
        {/* Left: Current Track Thumbnail & Metadata */}
        <div className="flex items-center gap-3.5 min-w-0 w-full sm:w-1/4">
          <div className="w-12 h-12 rounded-xl overflow-hidden bg-black/60 border border-white/15 shrink-0 shadow-md">
            <img
              src={currentTrack.albumArt || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=400&q=80'}
              alt={currentTrack.title}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-xs font-bold text-white truncate">
              {currentTrack.title}
            </span>
            <span className="text-[11px] text-white/50 truncate">
              {currentTrack.artist}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-white/40 shrink-0">
            <button
              onClick={() => toggleSongLike(currentTrack.id)}
              className="p-1 hover:text-white transition-colors cursor-pointer"
            >
              <Heart
                className={`w-3.5 h-3.5 ${
                  likedSongIds[currentTrack.id] ? 'fill-rose-500 text-rose-500' : ''
                }`}
              />
            </button>
            <button className="p-1 hover:text-white transition-colors cursor-pointer">
              <Download className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Center: Transport Controls & Scrubber Timeline */}
        <div className="flex flex-col items-center gap-1.5 w-full sm:w-2/4 max-w-lg">
          <div className="flex items-center gap-4 text-white/70">
            <button
              onClick={() => {
                setTracks((prev) => [...prev].sort(() => Math.random() - 0.5));
              }}
              className="p-1.5 hover:text-white transition-colors cursor-pointer"
              title="Shuffle"
            >
              <Shuffle className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handlePrev}
              className="p-1.5 hover:text-white transition-colors cursor-pointer"
              title="Previous Track"
            >
              <SkipBack className="w-4 h-4 fill-current" />
            </button>
            <button
              onClick={handleTogglePlay}
              className="p-2 rounded-full bg-white text-black shadow-lg hover:scale-105 active:scale-95 transition-all cursor-pointer"
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? (
                <Pause className="w-4 h-4 fill-current" />
              ) : (
                <Play className="w-4 h-4 fill-current ml-0.5" />
              )}
            </button>
            <button
              onClick={handleNext}
              className="p-1.5 hover:text-white transition-colors cursor-pointer"
              title="Next Track"
            >
              <SkipForward className="w-4 h-4 fill-current" />
            </button>
            <button
              onClick={() => {
                if (positionMs > 0) seek(0);
              }}
              className="p-1.5 hover:text-white transition-colors cursor-pointer"
              title="Repeat"
            >
              <Repeat className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Scrubber Progress Bar */}
          <div className="flex items-center gap-2 w-full text-[10px] font-mono text-white/40">
            <span className="w-8 text-right">{formatSeconds(currentTime)}</span>
            <input
              type="range"
              min={0}
              max={duration}
              step={0.5}
              value={currentTime}
              onChange={handleSeek}
              className="flex-1 h-1 bg-white/20 rounded-full appearance-none cursor-pointer accent-white hover:accent-cyan-400"
            />
            <span className="w-8">{formatSeconds(duration)}</span>
          </div>
        </div>

        {/* Right: Visualizer, Preset & Volume */}
        <div className="flex items-center justify-end gap-3 w-full sm:w-1/4 text-white/60">
          <div className="hidden xl:flex items-center gap-2 px-2 py-1 rounded-lg bg-black/40 border border-white/10">
            <div className="w-16 h-4 overflow-hidden">
              <canvas ref={canvasRef} width={64} height={16} className="w-full h-full" />
            </div>
            <button
              onClick={() => setActivePreset((p) => p === 'Studio Master' ? 'Bass Boost' : 'Studio Master')}
              className="text-[9px] font-mono text-cyan-400 hover:text-cyan-300 font-bold uppercase transition-colors"
              title="Toggle Audio Preset"
            >
              Preset: {activePreset}
            </button>
          </div>

          <button
            onClick={toggleMute}
            className="p-1.5 hover:text-white transition-colors cursor-pointer"
          >
            {isMuted || storeVolume === 0 ? (
              <VolumeX className="w-4 h-4 text-rose-400" />
            ) : (
              <Volume2 className="w-4 h-4" />
            )}
          </button>
          <input
            type="range"
            min={0}
            max={100}
            step={1}
            value={isMuted ? 0 : storeVolume}
            onChange={handleVolumeChange}
            className="w-20 h-1 bg-white/20 rounded-full appearance-none cursor-pointer accent-white"
          />
        </div>
      </div>
    </div>
  );
};
export default MusicPlayerView;
