import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

describe('Music Player Interface & Missing File Modal Fix Audit', () => {
  const errorToastFile = path.resolve('src/components/hud/ErrorToast.tsx');
  const playerStoreFile = path.resolve('src/store/playerStore.ts');
  const appFile = path.resolve('src/App.tsx');
  const homeDashboardFile = path.resolve('src/components/home/HomeDashboardView.tsx');
  const musicPlayerViewFile = path.resolve('src/components/music/MusicPlayerView.tsx');

  it('verifies ErrorToast restricts "Media File Moved or Unavailable" exclusively to local files', () => {
    assert.ok(fs.existsSync(errorToastFile), 'ErrorToast.tsx must exist');
    const content = fs.readFileSync(errorToastFile, 'utf8');

    // Must check that currentUri is not an HTTP/HTTPS remote stream
    assert.match(
      content,
      /!currentUri\.startsWith\(['"]http/i,
      'ErrorToast must verify the URI is not a remote HTTP/HTTPS stream before showing missing file modal'
    );
  });

  it('verifies playerStore prevents audio streams from being hijacked into video playback mode', () => {
    assert.ok(fs.existsSync(playerStoreFile), 'playerStore.ts must exist');
    const content = fs.readFileSync(playerStoreFile, 'utf8');

    // activeWebStream check must ensure it is not an audio stream
    assert.match(
      content,
      /!isAudio\s*&&\s*isHttp/i,
      'playerStore must never classify an audio stream as a cinema web video stream'
    );

    // openMedia should preserve activePlaybackMode as music/radio for audio tracks
    assert.match(
      content,
      /activePlaybackMode:\s*playbackMode/i,
      'playerStore openMedia must set activePlaybackMode to playbackMode for audio tracks'
    );
  });

  it('verifies soundhelix URLs are replaced with reliable, CORS-friendly audio streams', () => {
    const homeContent = fs.readFileSync(homeDashboardFile, 'utf8');
    const musicContent = fs.readFileSync(musicPlayerViewFile, 'utf8');

    assert.ok(
      !homeContent.includes('soundhelix.com'),
      'COVER_FLOW_ALBUMS must not use CORS-blocked soundhelix URLs'
    );
    assert.ok(
      !musicContent.includes('soundhelix.com'),
      'FEATURED_MUSIC_TRACKS must not use CORS-blocked soundhelix URLs'
    );
  });
});
