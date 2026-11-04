import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

describe('Persistent Music Control Hub, Cover Art Fix, Window Dragging & Nav History Audit', () => {
  const homeDashboardFile = path.resolve('src/components/home/HomeDashboardView.tsx');
  const fullPlayerFile = path.resolve('src/components/music/FullWindowMusicPlayer.tsx');
  const hubFile = path.resolve('src/components/hud/PersistentMusicControlHub.tsx');
  const appFile = path.resolve('src/App.tsx');
  const storeFile = path.resolve('src/store/playerStore.ts');
  const chunkedAudioFile = path.resolve('src/core/ChunkedAudioStreamController.ts');

  it('verifies center Cover Flow card displays previouslyPlayed track artwork and does not auto-open full player modal on play', () => {
    assert.ok(fs.existsSync(homeDashboardFile), 'HomeDashboardView.tsx must exist');
    const content = fs.readFileSync(homeDashboardFile, 'utf8');

    // 1. Center card must use previouslyPlayed.thumbnailUri if available
    assert.match(
      content,
      /previouslyPlayed\?\.thumbnailUri/,
      'Center card or active card must use previouslyPlayed.thumbnailUri to avoid cover mismatch'
    );

    // 2. handlePlayAlbum should NOT call onOpenMusic automatically
    const handlePlayAlbumMatch = content.match(/const handlePlayAlbum = [\s\S]*?\{([\s\S]*?)\n {2}\};/);
    assert.ok(handlePlayAlbumMatch, 'handlePlayAlbum must exist');
    assert.ok(
      !handlePlayAlbumMatch[1].includes('if (onOpenMusic) onOpenMusic();'),
      'handlePlayAlbum must not forcefully auto-launch onOpenMusic modal'
    );
  });

  it('verifies FullWindowMusicPlayer top bar supports native and web borderless window dragging', () => {
    assert.ok(fs.existsSync(fullPlayerFile), 'FullWindowMusicPlayer.tsx must exist');
    const content = fs.readFileSync(fullPlayerFile, 'utf8');

    // Must have dragging attributes on the top bar
    assert.match(
      content,
      /data-tauri-drag-region/,
      'FullWindowMusicPlayer top bar must have data-tauri-drag-region attribute'
    );
    assert.match(
      content,
      /WebkitAppRegion:\s*['"]drag['"]/,
      'FullWindowMusicPlayer top bar must have WebkitAppRegion: drag style'
    );
    assert.match(
      content,
      /WebkitAppRegion:\s*['"]no-drag['"]/,
      'FullWindowMusicPlayer interactive buttons must have WebkitAppRegion: no-drag style'
    );
  });

  it('verifies ChunkedAudioStreamController recognizes streaming audio platforms and initiates fast chunk loading', () => {
    assert.ok(fs.existsSync(chunkedAudioFile), 'ChunkedAudioStreamController.ts must exist');
    const content = fs.readFileSync(chunkedAudioFile, 'utf8');

    // Identifies SoundCloud, Jamendo, Audiomack, Bandcamp or Apple previews
    assert.match(
      content,
      /jamendo|soundcloud|audiomack|bandcamp/i,
      'ChunkedAudioStreamController must recognize streaming music platforms for chunk loading'
    );
    assert.match(
      content,
      /loadeddata/,
      'ChunkedAudioStreamController must hook loadeddata for instant chunk ready notification'
    );
  });

  it('verifies PersistentMusicControlHub exists with playback controls, cover preview, volume, and studio toggle', () => {
    assert.ok(fs.existsSync(hubFile), 'PersistentMusicControlHub.tsx must exist');
    const content = fs.readFileSync(hubFile, 'utf8');

    assert.match(content, /playPreviousMedia|SkipBack/i, 'Hub must provide previous track control');
    assert.match(content, /playNextMedia|SkipForward/i, 'Hub must provide next track control');
    assert.match(content, /togglePlay|isPaused/i, 'Hub must provide play/pause control');
    assert.match(content, /volume|isMuted/i, 'Hub must provide volume control');
    assert.match(content, /FullWindowMusicPlayer|setMusicPlayerOpen|onOpenStudio/i, 'Hub must allow opening full window studio');
  });

  it('verifies playerStore and App.tsx support section-aware navigation and persistent music browsing', () => {
    assert.ok(fs.existsSync(storeFile), 'playerStore.ts must exist');
    assert.ok(fs.existsSync(appFile), 'App.tsx must exist');

    const storeContent = fs.readFileSync(storeFile, 'utf8');
    const appContent = fs.readFileSync(appFile, 'utf8');

    // Store does not force isMusicPlayerOpen on openMedia
    assert.ok(
      !storeContent.includes("isMusicPlayerOpen: playbackMode === 'music' ? true :"),
      'openMedia must not forcefully set isMusicPlayerOpen to true'
    );

    // App mounts PersistentMusicControlHub
    assert.match(
      appContent,
      /<PersistentMusicControlHub/i,
      'App.tsx must mount PersistentMusicControlHub'
    );

    // Navigation state in store
    assert.match(
      storeContent,
      /lastActiveNav/i,
      'playerStore must store lastActiveNav for history preservation'
    );
  });
});

