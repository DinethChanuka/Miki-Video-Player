import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

describe('Hidara Architecture YouTube Music Audio Stream Resolution Audit', () => {
  test('verifies standalone yt-dlp binary exists and is executable in bin/yt-dlp', () => {
    const ytDlpPath = path.resolve(process.cwd(), 'bin/yt-dlp');
    assert.ok(fs.existsSync(ytDlpPath), 'bin/yt-dlp must exist in workspace root');
    const stat = fs.statSync(ytDlpPath);
    // Check executable bit
    assert.ok((stat.mode & 0o111) !== 0, 'bin/yt-dlp must have executable permissions');
  });

  test('verifies scripts/package-mac.sh bundles bin/yt-dlp into app Resources/bin', () => {
    const packageScript = fs.readFileSync(path.resolve(process.cwd(), 'scripts/package-mac.sh'), 'utf-8');
    assert.match(packageScript, /mkdir -p "Miki Player\.app\/Contents\/Resources\/bin"/);
    assert.match(packageScript, /cp bin\/yt-dlp "Miki Player\.app\/Contents\/Resources\/bin\/yt-dlp"/);
    assert.match(packageScript, /chmod \+x "Miki Player\.app\/Contents\/Resources\/bin\/yt-dlp"/);
  });

  test('verifies MikiPlayerApp.swift implements /api/stream-audio endpoint with caching', () => {
    const swiftCode = fs.readFileSync(path.resolve(process.cwd(), 'MikiPlayerApp.swift'), 'utf-8');
    assert.match(swiftCode, /\/api\/stream-audio/);
    assert.match(swiftCode, /resolveAudioStream/);
    assert.match(swiftCode, /streamCache/);
    assert.match(swiftCode, /Location: \\\(directUrl\)/);
  });

  test('verifies vite.config.ts localMediaStreamerPlugin provides /api/stream-audio parity', () => {
    const viteConfig = fs.readFileSync(path.resolve(process.cwd(), 'vite.config.ts'), 'utf-8');
    assert.match(viteConfig, /\/api\/stream-audio/);
    assert.match(viteConfig, /execFile/);
    assert.match(viteConfig, /ytStreamCache/);
  });

  test('verifies PlayerEngine exports resolveYouTubeAudioStream and loads native audio stream directly', () => {
    const engineCode = fs.readFileSync(path.resolve(process.cwd(), 'src/core/PlayerEngine.ts'), 'utf-8');
    assert.match(engineCode, /export async function resolveYouTubeAudioStream/);
    assert.match(engineCode, /const youtubeId = parseYouTubeId\(uri\)/);
    assert.match(engineCode, /resolveYouTubeAudioStream\(youtubeId\)/);
    assert.match(engineCode, /el\.src = directAudioUrl/);
  });

  test('verifies FullWindowMusicPlayer handles track title, artist split, and effective duration correctly', () => {
    const musicPlayerCode = fs.readFileSync(path.resolve(process.cwd(), 'src/components/music/FullWindowMusicPlayer.tsx'), 'utf-8');
    assert.match(musicPlayerCode, /currentTitle\.includes\(' - '\)/);
    assert.match(musicPlayerCode, /formatTime\(positionMs\)/);
    assert.match(musicPlayerCode, /formatTime\(effectiveDuration\)/);
  });

  test('verifies MikiPlayerApp.swift and vite.config.ts select m4a for AVFoundation macOS hardware-accelerated playback', () => {
    const swiftCode = fs.readFileSync(path.resolve(process.cwd(), 'MikiPlayerApp.swift'), 'utf-8');
    assert.match(swiftCode, /bestaudio\[ext=m4a\]/);
    const viteConfig = fs.readFileSync(path.resolve(process.cwd(), 'vite.config.ts'), 'utf-8');
    assert.match(viteConfig, /bestaudio\[ext=m4a\]/);
  });

  test('verifies App.tsx keeps native video viewport mounted and suppresses youtubeId in music/radio mode', () => {
    const appCode = fs.readFileSync(path.resolve(process.cwd(), 'src/App.tsx'), 'utf-8');
    assert.match(appCode, /isAudioMode\s*=\s*activePlaybackMode === 'music' \|\| activePlaybackMode === 'radio'/);
    assert.match(appCode, /const youtubeId = !isAudioMode && activeWebStream\?\.platform === 'youtube'/);
  });

  test('verifies playerStore onTelemetry receives telemetry for music and does not discard it as external stream', () => {
    const storeCode = fs.readFileSync(path.resolve(process.cwd(), 'src/store/playerStore.ts'), 'utf-8');
    assert.match(storeCode, /isMusicOrRadio/);
    assert.match(storeCode, /!isMusicOrRadio\s*&&\s*activeUri\s*&&/);
  });

  test('verifies MikiPlayerApp.swift handles audio proxying with byte range support and CORS headers', () => {
    const swiftCode = fs.readFileSync(path.resolve(process.cwd(), 'MikiPlayerApp.swift'), 'utf-8');
    assert.match(swiftCode, /Access-Control-Expose-Headers.*Content-Range/);
    assert.match(swiftCode, /Accept-Ranges: bytes/);
  });
});
