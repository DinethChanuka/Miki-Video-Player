import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { isDirectMediaUrl } from '../src/utils/webStreamUtils.ts';

describe('Open Music In Full-Window Hi-Fi Music Studio Audit', () => {
  const playerStoreFile = path.resolve('src/store/playerStore.ts');
  const appFile = path.resolve('src/App.tsx');
  const homeDashboardFile = path.resolve('src/components/home/HomeDashboardView.tsx');
  const fullWindowMusicPlayerFile = path.resolve('src/components/music/FullWindowMusicPlayer.tsx');

  it('verifies playerStore automatically opens Full-Window Music Studio on music playback and closes it on video', () => {
    assert.ok(fs.existsSync(playerStoreFile), 'playerStore.ts must exist');
    const content = fs.readFileSync(playerStoreFile, 'utf8');

    // openMedia should compute autoOpenStudio for music playback
    assert.match(
      content,
      /const autoOpenStudio = playbackMode === 'music'/i,
      'playerStore openMedia must determine autoOpenStudio from music playbackMode'
    );

    // openMedia should set isMusicPlayerOpen to true for music and false for video
    assert.match(
      content,
      /isMusicPlayerOpen:\s*autoOpenStudio \? true : false/i,
      'playerStore must automatically open music studio when music is played and close it when video is played'
    );

    // explicit video detection must guard against overriding explicit music/radio mediaType
    assert.match(
      content,
      /mediaType !== 'music'\s*&&\s*mediaType !== 'radio'/i,
      'playerStore must not classify music or radio as explicit video'
    );
  });

  it('verifies App.tsx prevents video ControlsOverlay from rendering during music playback or when music studio is open', () => {
    assert.ok(fs.existsSync(appFile), 'App.tsx must exist');
    const content = fs.readFileSync(appFile, 'utf8');

    // ControlsOverlay must check !isMusicPlayerOpen and activePlaybackMode === 'video'
    assert.match(
      content,
      /activePlaybackMode === 'video'\s*&&\s*!isMusicPlayerOpen/i,
      'App.tsx must ensure video ControlsOverlay never renders when isMusicPlayerOpen is true'
    );

    // App.tsx must render FullWindowMusicPlayer with isOpen={isMusicPlayerOpen}
    assert.match(
      content,
      /<FullWindowMusicPlayer[\s\S]*?isOpen=\{isMusicPlayerOpen\}/i,
      'App.tsx must connect FullWindowMusicPlayer to isMusicPlayerOpen state'
    );

    // App.tsx fallbackToWebStream must never hijack music or radio streams
    assert.match(
      content,
      /if\s*\(\s*currentMode === 'music' \|\| currentMode === 'radio'\s*\)\s*\{\s*return false;\s*\}/i,
      'fallbackToWebStream must immediately abort for music and radio modes'
    );
  });

  it('verifies HomeDashboardView search result clicks immediately open Full-Window Music Studio', () => {
    assert.ok(fs.existsSync(homeDashboardFile), 'HomeDashboardView.tsx must exist');
    const content = fs.readFileSync(homeDashboardFile, 'utf8');

    // liveSearchTracks items must call setMusicPlayerOpen(true)
    assert.match(
      content,
      /setMusicPlayerOpen\(true\)/i,
      'HomeDashboardView must invoke setMusicPlayerOpen(true) when search result track is clicked'
    );

    // previouslyPlayed must not match webPlatform === 'cinema' or blindly fall back to recentMedia[0]
    assert.ok(
      !content.includes("m.webPlatform === 'cinema' || Boolean(m.thumbnailUri)) || recentMedia[0]"),
      'HomeDashboardView must not fall back to cinema videos for previously played music track'
    );

    // Cover flow and pill play button must pass 'music' as mediaType to openMedia
    assert.match(
      content,
      /openMedia\(track\.url,.*?'music'\)/i,
      'HomeDashboardView cover flow must pass music mediaType to openMedia'
    );
  });

  it('verifies isDirectMediaUrl recognizes audio extensions including .m4a and direct audio domains', () => {
    assert.ok(isDirectMediaUrl('https://audio-ssl.itunes.apple.com/itunes-assets/sample.m4a'));
    assert.ok(isDirectMediaUrl('https://example.com/stream.mp3'));
    assert.ok(isDirectMediaUrl('https://example.com/audio.weba'));
    assert.ok(isDirectMediaUrl('https://example.com/track.opus'));
  });

  it('verifies FullWindowMusicPlayer invokes openMedia with music mediaType', () => {
    assert.ok(fs.existsSync(fullWindowMusicPlayerFile), 'FullWindowMusicPlayer.tsx must exist');
    const content = fs.readFileSync(fullWindowMusicPlayerFile, 'utf8');

    assert.match(
      content,
      /openMedia\([^)]*?'music'\)/i,
      'FullWindowMusicPlayer must pass music mediaType to openMedia'
    );
  });
});
