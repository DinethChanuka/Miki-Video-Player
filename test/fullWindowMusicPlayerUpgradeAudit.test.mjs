import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

describe('Task 3 & 4 Audit: FullWindowMusicPlayer Hi-Fi Studio Upgrade', () => {
  const playerFilePath = path.resolve(process.cwd(), 'src/components/music/FullWindowMusicPlayer.tsx');
  const code = fs.readFileSync(playerFilePath, 'utf8');

  it('verifies synchronized lyrics engine integration and auto-scroll highlighting', () => {
    assert.match(
      code,
      /fetchTrackLyrics/i,
      'FullWindowMusicPlayer must import and call fetchTrackLyrics'
    );
    assert.match(
      code,
      /lyricsData/i,
      'FullWindowMusicPlayer must manage lyricsData state'
    );
    assert.match(
      code,
      /syncedLyrics/i,
      'FullWindowMusicPlayer must render syncedLyrics when available'
    );
    assert.match(
      code,
      /scrollIntoView/i,
      'FullWindowMusicPlayer must auto-scroll active lyric line into view'
    );
    assert.match(
      code,
      /seek\(line\.timeMs/i,
      'FullWindowMusicPlayer must seek playback when clicking a lyric line'
    );
  });

  it('verifies tri-mode canvas visualizers and music-sync toggle', () => {
    assert.match(
      code,
      /renderCyberSpectrum/i,
      'Must import and support renderCyberSpectrum'
    );
    assert.match(
      code,
      /renderOrbitalSoundwave/i,
      'Must import and support renderOrbitalSoundwave'
    );
    assert.match(
      code,
      /renderLiquidOscilloscope/i,
      'Must import and support renderLiquidOscilloscope'
    );
    assert.match(
      code,
      /setVisualizerMode\(['"]spectrum['"]\)/i,
      'Must provide Spectrum mode switcher'
    );
    assert.match(
      code,
      /setVisualizerMode\(['"]orbital['"]\)/i,
      'Must provide Orbital mode switcher'
    );
    assert.match(
      code,
      /setVisualizerMode\(['"]ribbon['"]\)/i,
      'Must provide Ribbon mode switcher'
    );
    assert.match(
      code,
      /setSyncAudio\(!syncAudio\)/i,
      'Must provide Music Sync toggle button'
    );
  });

  it('verifies custom playlist modal integration in Hi-Fi Studio', () => {
    assert.match(
      code,
      /customPlaylists/i,
      'FullWindowMusicPlayer must access customPlaylists store'
    );
    assert.match(
      code,
      /createPlaylist/i,
      'FullWindowMusicPlayer must allow creating custom playlists'
    );
    assert.match(
      code,
      /addTrackToPlaylist/i,
      'FullWindowMusicPlayer must allow adding current track to custom playlists'
    );
    assert.match(
      code,
      /isPlaylistModalOpen/i,
      'FullWindowMusicPlayer must manage playlist selection modal state'
    );
  });

  it('verifies clean unbranded studio master presentation', () => {
    assert.doesNotMatch(
      code,
      /YouTube Music Hi-Fi Audio/i,
      'Must not display YouTube Music in player subtitles'
    );
    assert.match(
      code,
      /Studio Master Lossless Audio & Spatial Soundstage/i,
      'Must display high-fidelity Studio Master presentation'
    );
  });
});

