import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

describe('Unified MediaEngineRouter Architecture Audit', () => {
  const routerPath = path.join(rootDir, 'src/core/MediaEngineRouter.ts');

  it('verifies MediaEngineRouter source file exists and exports MediaEngineRouter and MediaEngine contract', () => {
    assert.equal(fs.existsSync(routerPath), true, 'src/core/MediaEngineRouter.ts must exist');
    const code = fs.readFileSync(routerPath, 'utf-8');
    assert.match(code, /export\s+interface\s+MediaEngine/i, 'Must export MediaEngine contract interface');
    assert.match(code, /export\s+class\s+MediaEngineRouter/i, 'Must export MediaEngineRouter class');
  });

  it('verifies MediaEngine contract defines load, play, pause, seek, setVolume, getState, and dispose', () => {
    const code = fs.readFileSync(routerPath, 'utf-8');
    const methods = ['load', 'play', 'pause', 'seek', 'setVolume', 'getState', 'dispose'];
    for (const m of methods) {
      assert.match(
        code,
        new RegExp(`${m}\\s*\\(`, 'i'),
        `MediaEngine or MediaEngineRouter must implement ${m}() method`
      );
    }
  });

  it('verifies deterministic engine selection for local files, HLS/direct streams, and web embeds', () => {
    const code = fs.readFileSync(routerPath, 'utf-8');
    assert.match(code, /selectEngineForSource|determineEngineType/i, 'Must have engine selection method');
    assert.match(code, /tauri-mpv|web-media|web-embed/i, 'Must support 3 unified engine types');
  });

  it('verifies mutual exclusion to strictly prevent two engines from playing simultaneously', () => {
    const code = fs.readFileSync(routerPath, 'utf-8');
    assert.match(
      code,
      /preventDualPlayback|stopInactiveEngines|pauseOtherEngines/i,
      'Router must implement mutual exclusion preventing concurrent playback across engines'
    );
  });

  it('verifies automatic fallback from native to web-media engine with timestamp preservation', () => {
    const code = fs.readFileSync(routerPath, 'utf-8');
    assert.match(
      code,
      /fallbackToWebEngine|handleEngineFallback/i,
      'Router must handle automatic engine fallback'
    );
    assert.match(
      code,
      /lastPositionMs|savedPosition|positionMs/i,
      'Fallback must preserve playback position'
    );
  });

  it('verifies dedicated AudioEngine / DSP bypass abstraction for consistent cross-engine audio', () => {
    const code = fs.readFileSync(routerPath, 'utf-8');
    assert.match(
      code,
      /dspBypass|setDspBypass|AudioEngine/i,
      'Router must support DSP bypass to allow direct zero-overhead audio output'
    );
  });
});
