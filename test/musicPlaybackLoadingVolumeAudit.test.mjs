import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

describe('Music Playback, Loading State, Volume & Controls Audit', () => {
  const root = process.cwd();

  test('verifies playerStore controls DOM video element directly on togglePlay for music/radio', () => {
    const storeCode = fs.readFileSync(path.resolve(root, 'src/store/playerStore.ts'), 'utf-8');
    assert.match(storeCode, /isMusicOrRadio\s*=\s*activePlaybackMode === 'music' \|\| activePlaybackMode === 'radio'/);
    assert.match(storeCode, /isYouTubeVideo\s*=\s*!isMusicOrRadio\s*&&/);
    assert.match(storeCode, /const video = \(document\.getElementById\('aether-video-viewport'\)/);
  });

  test('verifies playerStore setVolume applies smooth perceptual volume curve to video element', () => {
    const storeCode = fs.readFileSync(path.resolve(root, 'src/store/playerStore.ts'), 'utf-8');
    assert.match(storeCode, /Math\.pow\(.*,\s*1\.[3-6]\)/);
    assert.match(storeCode, /video\.muted = isMuted/);
  });

  test('verifies playerStore onTelemetry preserves user volume without 60fps overwrites', () => {
    const storeCode = fs.readFileSync(path.resolve(root, 'src/store/playerStore.ts'), 'utf-8');
    // Ensure onTelemetry does not continuously overwrite volume/isMuted from background video element
    assert.doesNotMatch(storeCode, /set\(\{\s*positionMs:[^}]*volume:\s*telemetry\.volume/);
  });

  test('verifies playerStore openMedia sets isBuffering: true on media start in Tauri & web runtimes', () => {
    const storeCode = fs.readFileSync(path.resolve(root, 'src/store/playerStore.ts'), 'utf-8');
    assert.match(storeCode, /isBuffering:\s*true/);
  });

  test('verifies PlayerEngine handles onwaiting, onplaying, oncanplay to drive isBuffering', () => {
    const engineCode = fs.readFileSync(path.resolve(root, 'src/core/PlayerEngine.ts'), 'utf-8');
    assert.match(engineCode, /this\.videoEl\.onwaiting/);
    assert.match(engineCode, /usePlayerStore\.setState\(\{\s*isBuffering:\s*true\s*\}\)/);
    assert.match(engineCode, /this\.videoEl\.onplaying/);
    assert.match(engineCode, /usePlayerStore\.setState\(\{\s*isBuffering:\s*false/);
  });

  test('verifies FullWindowMusicPlayer displays RefreshCw spinner and loading states when isBuffering', () => {
    const playerCode = fs.readFileSync(path.resolve(root, 'src/components/music/FullWindowMusicPlayer.tsx'), 'utf-8');
    assert.match(playerCode, /RefreshCw/);
    assert.match(playerCode, /isBuffering/);
    assert.match(playerCode, /isBuffering\s*\?\s*\(?\s*<RefreshCw/);
    assert.match(playerCode, /LOADING STREAM|Buffering/i);
  });

  test('verifies FullWindowMusicPlayer handles real-time onInput and smooth volume slider', () => {
    const playerCode = fs.readFileSync(path.resolve(root, 'src/components/music/FullWindowMusicPlayer.tsx'), 'utf-8');
    assert.match(playerCode, /onInput/);
    assert.match(playerCode, /max=["']100["']/);
  });

  test('verifies PersistentMusicControlHub volume range is 0-100 and shows loading spinner when isBuffering', () => {
    const hubCode = fs.readFileSync(path.resolve(root, 'src/components/hud/PersistentMusicControlHub.tsx'), 'utf-8');
    assert.match(hubCode, /max=\{100\}/);
    assert.match(hubCode, /RefreshCw/);
    assert.match(hubCode, /isBuffering/);
  });

  test('verifies PlayerEngine setVolume and setMuted NEVER overwrite el.volume to 1.0 when hasWebAudio', () => {
    const engineCode = fs.readFileSync(path.resolve(root, 'src/core/PlayerEngine.ts'), 'utf-8');
    // Ensure el.volume is never forced to 1.0 when hasWebAudio is true
    assert.doesNotMatch(engineCode, /hasWebAudio\)\s*\{\s*el\.volume\s*=\s*1\.0/);
    assert.doesNotMatch(engineCode, /hasWebAudio\)\s*\{\s*this\.videoEl\.volume\s*=\s*1\.0/);
    // Ensure PlayerEngine setVolume applies smooth perceptual gain
    assert.match(engineCode, /smoothGain\s*=\s*Math\.pow\(normalizedPercent,\s*1\.[3-6]\)/);
  });

  test('verifies playerStore setMuted and toggleMute coordinate mute state cleanly with engine', () => {
    const storeCode = fs.readFileSync(path.resolve(root, 'src/store/playerStore.ts'), 'utf-8');
    assert.match(storeCode, /engine\?\.setMuted\(muted\)/);
    assert.match(storeCode, /!nextMuted\s*&&\s*get\(\)\.volume\s*===\s*0/);
  });

  test('verifies MusicPlayerView volume slider is calibrated to standard 0-100 range', () => {
    const viewCode = fs.readFileSync(path.resolve(root, 'src/components/music/MusicPlayerView.tsx'), 'utf-8');
    assert.match(viewCode, /max=\{100\}/);
    assert.match(viewCode, /step=\{1\}/);
  });
});
