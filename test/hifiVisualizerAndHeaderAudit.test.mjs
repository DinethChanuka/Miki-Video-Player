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
