import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {
  renderAmbientAurora,
  renderWarpTunnel,
  renderHolographicPrism,
  renderNeonPulseHalo,
  renderQuantumNebula,
  renderCyberSpectrum,
  VISUALIZER_THEMES,
} from '../src/components/music/canvasVisualizers.ts';

describe('Task 1: 6 Modern Generative Audio Visualizers Audit', () => {
  test('exports 6 modern visualizer renderers and VISUALIZER_THEMES catalog', () => {
    assert.equal(typeof renderAmbientAurora, 'function');
    assert.equal(typeof renderWarpTunnel, 'function');
    assert.equal(typeof renderHolographicPrism, 'function');
    assert.equal(typeof renderNeonPulseHalo, 'function');
    assert.equal(typeof renderQuantumNebula, 'function');
    assert.equal(typeof renderCyberSpectrum, 'function');
    assert.ok(Array.isArray(VISUALIZER_THEMES));
    assert.ok(VISUALIZER_THEMES.length >= 6);

    const themeIds = VISUALIZER_THEMES.map((t) => t.id);
    assert.ok(themeIds.includes('aurora'));
    assert.ok(themeIds.includes('tunnel'));
    assert.ok(themeIds.includes('prism'));
    assert.ok(themeIds.includes('halo'));
    assert.ok(themeIds.includes('nebula'));
    assert.ok(themeIds.includes('spectrum'));
  });

  test('all 6 visualizer renderers execute on canvas 2D mock without throwing', () => {
    const mockCtx = {
      clearRect: () => {},
      beginPath: () => {},
      arc: () => {},
      fill: () => {},
      stroke: () => {},
      moveTo: () => {},
      lineTo: () => {},
      bezierCurveTo: () => {},
      closePath: () => {},
      createLinearGradient: () => ({ addColorStop: () => {} }),
      createRadialGradient: () => ({ addColorStop: () => {} }),
      fillRect: () => {},
      save: () => {},
      restore: () => {},
      translate: () => {},
      rotate: () => {},
      fillStyle: '',
      strokeStyle: '',
      lineWidth: 1,
      shadowBlur: 0,
      shadowColor: '',
    };

    const freqData = new Uint8Array(64).fill(128);

    assert.doesNotThrow(() => {
      renderAmbientAurora(mockCtx, 1200, 800, freqData, 1.0, true, true);
      renderWarpTunnel(mockCtx, 1200, 800, freqData, 1.0, true, true);
      renderHolographicPrism(mockCtx, 1200, 800, freqData, 1.0, true, true);
      renderNeonPulseHalo(mockCtx, 1200, 800, freqData, 1.0, true, true);
      renderQuantumNebula(mockCtx, 1200, 800, freqData, 1.0, true, true);
      renderCyberSpectrum(mockCtx, 1200, 800, freqData, 1.0, true, true);
    });
  });
});

describe('Task 2: Studio Settings Modal & Theme Selection Audit', () => {
  test('verifies FullWindowMusicPlayer embeds Studio Settings modal with all 6 visualizer cards', () => {
    const code = fs.readFileSync(path.resolve(process.cwd(), 'src/components/music/FullWindowMusicPlayer.tsx'), 'utf-8');
    assert.match(code, /isStudioSettingsOpen/);
    assert.match(code, /VISUALIZER_THEMES\.map/);
    assert.match(code, /Sync Animation to Audio Beats|Sync Audio Beats/i);
    // Header must no longer contain the hardcoded 3-button mode switcher in top bar
    assert.ok(!code.includes('title="Cyber Spectrum Bars"'));
  });
});

describe('Task 3: Approach A 3-Column Playback Dock Audit', () => {
  test('verifies FullWindowMusicPlayer implements Approach A 3-column playback dock', () => {
    const code = fs.readFileSync(path.resolve(process.cwd(), 'src/components/music/FullWindowMusicPlayer.tsx'), 'utf-8');
    assert.match(code, /Hi-Res|Studio Master/i);
    assert.match(code, /RangeSlider/);
    assert.match(code, /handlePrev/);
    assert.match(code, /handleNext/);
    assert.match(code, /handlePlayToggle/);
  });
});
