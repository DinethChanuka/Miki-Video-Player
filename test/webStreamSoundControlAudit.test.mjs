import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

describe('Web Stream Sound Controls & Multi-Platform Support Audit', () => {
  it('parses Facebook video and reel URLs into embed-compatible formats', async () => {
    const { parseFacebookUrl, parseWebStream } = await import('../src/utils/webStreamUtils.ts');

    assert.equal(typeof parseFacebookUrl, 'function', 'parseFacebookUrl must be exported');

    const fbWatchUrl = 'https://www.facebook.com/watch/?v=123456789012345';
    const parsedWatch = parseWebStream(fbWatchUrl);
    assert.ok(parsedWatch, 'Facebook watch URL must be recognized');
    assert.equal(parsedWatch.platform, 'facebook');
    assert.match(parsedWatch.embedUrl, /facebook\.com\/plugins\/video\.php/);

    const fbReelUrl = 'https://www.facebook.com/reel/987654321098765';
    const parsedReel = parseWebStream(fbReelUrl);
    assert.ok(parsedReel, 'Facebook reel URL must be recognized');
    assert.equal(parsedReel.platform, 'facebook');
    assert.match(parsedReel.embedUrl, /facebook\.com\/plugins\/video\.php/);

    const fbShortUrl = 'https://fb.watch/sampleReel123/';
    const parsedShort = parseWebStream(fbShortUrl);
    assert.ok(parsedShort, 'fb.watch short URL must be recognized');
    assert.equal(parsedShort.platform, 'facebook');
  });

  it('verifies playerStore dispatches custom events and native bridge messages for volume and equalizer', () => {
    const storeCode = fs.readFileSync(path.join(rootDir, 'src/store/playerStore.ts'), 'utf8');

    // Check volume change event dispatch
    assert.match(
      storeCode,
      /miki:volume-change/,
      'playerStore must dispatch miki:volume-change custom event on volume update'
    );

    // Check native browserViewAction IPC for volume
    assert.match(
      storeCode,
      /browserViewAction.*setVolume|action:\s*['"]setVolume['"]/,
      'playerStore must post setVolume action to native browserViewAction'
    );

    // Check equalizer change event dispatch
    assert.match(
      storeCode,
      /miki:equalizer-change/,
      'playerStore must dispatch miki:equalizer-change custom event on equalizer update'
    );

    // Check native browserViewAction IPC for equalizer
    assert.match(
      storeCode,
      /action:\s*['"]setEqualizer['"]/,
      'playerStore must post setEqualizer action to native browserViewAction'
    );
  });

  it('verifies MikiPlayerApp.swift handles setVolume and setEqualizer in browserViewAction', () => {
    const swiftCode = fs.readFileSync(path.join(rootDir, 'MikiPlayerApp.swift'), 'utf8');

    assert.match(
      swiftCode,
      /case\s+"setVolume":/,
      'MikiPlayerApp.swift must implement case "setVolume" in browserViewAction'
    );

    assert.match(
      swiftCode,
      /querySelectorAll\('video,\s*audio'\)/,
      'MikiPlayerApp.swift must target HTML media elements to sync volume and mute states'
    );

    assert.match(
      swiftCode,
      /case\s+"setEqualizer":/,
      'MikiPlayerApp.swift must implement case "setEqualizer" in browserViewAction'
    );
  });

  it('verifies WebBrowserModal provides volume slider, mute toggle, and equalizer button in top bar', () => {
    const modalCode = fs.readFileSync(path.join(rootDir, 'src/components/hud/WebBrowserModal.tsx'), 'utf8');

    assert.match(modalCode, /Volume2|VolumeX|Volume1/, 'WebBrowserModal must render volume icon controls');
    assert.match(modalCode, /type="range"/, 'WebBrowserModal must render interactive volume slider');
    assert.match(modalCode, /Equalizer|Sliders|setIsEqOpen|onOpenEq/, 'WebBrowserModal must provide Equalizer launcher');
  });

  it('verifies WebEmbedPlayer provides embedded volume and sound control options for social streams', () => {
    const embedCode = fs.readFileSync(path.join(rootDir, 'src/components/player/WebEmbedPlayer.tsx'), 'utf8');

    assert.match(embedCode, /setVolume/, 'WebEmbedPlayer must support adjusting volume');
    assert.match(embedCode, /Volume2|VolumeX/, 'WebEmbedPlayer must include volume / mute controls');
    assert.match(embedCode, /facebook/i, 'WebEmbedPlayer must support Facebook platform branding');
  });

  it('verifies YouTubePlayer synchronizes volume on initialization, infoDelivery, and volume-change events', () => {
    const ytCode = fs.readFileSync(path.join(rootDir, 'src/components/player/YouTubePlayer.tsx'), 'utf8');

    assert.match(ytCode, /miki:volume-change/, 'YouTubePlayer must listen for miki:volume-change events');
    assert.match(ytCode, /setVolume/, 'YouTubePlayer must sync setVolume to iframe');
  });
});
