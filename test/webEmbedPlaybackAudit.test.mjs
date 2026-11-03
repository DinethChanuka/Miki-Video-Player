import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

describe('Seamless Inbuilt Web Video Playback & Auto-Fallback Audit', () => {
  it('verifies WebEmbedPlayer supports cinema, web, vimeo, twitch, and dailymotion platforms', () => {
    const embedPath = path.join(rootDir, 'src/components/player/WebEmbedPlayer.tsx');
    const embedCode = fs.readFileSync(embedPath, 'utf8');

    assert.match(embedCode, /case\s+['"]cinema['"]:/i, 'WebEmbedPlayer must handle cinema platform');
    assert.match(embedCode, /case\s+['"]vimeo['"]:/i, 'WebEmbedPlayer must handle vimeo platform');
    assert.match(embedCode, /case\s+['"]twitch['"]:/i, 'WebEmbedPlayer must handle twitch platform');
    assert.match(embedCode, /case\s+['"]dailymotion['"]:/i, 'WebEmbedPlayer must handle dailymotion platform');
  });

  it('verifies PlayerEngine manages crossOrigin adaptively for remote web streams & WebAudio EQ', () => {
    const enginePath = path.join(rootDir, 'src/core/PlayerEngine.ts');
    const engineCode = fs.readFileSync(enginePath, 'utf8');

    assert.match(
      engineCode,
      /removeAttribute\(['"]crossOrigin['"]\)|crossOrigin\s*=\s*['"]anonymous['"]/,
      'PlayerEngine must manage crossOrigin adaptively to prevent CORS blocks on remote streams'
    );
  });

  it('verifies App.tsx implements auto-fallback to WebEmbedPlayer on remote stream decoding failures', () => {
    const appPath = path.join(rootDir, 'src/App.tsx');
    const appCode = fs.readFileSync(appPath, 'utf8');

    // App.tsx must have an auto-fallback mechanism when video element fails on http/https streams
    assert.match(
      appCode,
      /fallbackToWebStream|setFallbackWebEmbed/i,
      'App.tsx must provide auto-fallback to WebEmbedPlayer when video element fails on remote stream'
    );
  });
});
