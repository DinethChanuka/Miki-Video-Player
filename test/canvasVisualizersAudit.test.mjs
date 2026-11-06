import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  renderCyberSpectrum,
  renderOrbitalSoundwave,
  renderLiquidOscilloscope,
} from '../src/components/music/canvasVisualizers.ts';

describe('Task 3: Tri-Mode Premium Canvas Visualizer Engine', () => {
  test('exports 3 high-level graphic renderers and VisualizerMode type', () => {
    assert.equal(typeof renderCyberSpectrum, 'function');
    assert.equal(typeof renderOrbitalSoundwave, 'function');
    assert.equal(typeof renderLiquidOscilloscope, 'function');
  });

  test('renderers execute on mock canvas context without error', () => {
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

    assert.doesNotThrow(() => {
      renderCyberSpectrum(mockCtx, 800, 300, new Uint8Array(64), 0.5, true);
      renderOrbitalSoundwave(mockCtx, 800, 300, new Uint8Array(64), 0.5, true);
      renderLiquidOscilloscope(mockCtx, 800, 300, new Uint8Array(64), 0.5, true);
    });
  });
});
