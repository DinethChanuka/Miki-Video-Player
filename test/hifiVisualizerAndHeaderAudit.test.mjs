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

  test('verifies Approach A dock thumbnail has strict dimensions and overflow clipping without invalid w-13 classes', () => {
    const code = fs.readFileSync(path.resolve(process.cwd(), 'src/components/music/FullWindowMusicPlayer.tsx'), 'utf-8');
    // Must NOT contain invalid Tailwind classes like w-13 or h-13 which cause unconstrained giant image blowout
    assert.ok(!code.includes('w-13'), 'Must not contain non-existent Tailwind class w-13');
    assert.ok(!code.includes('h-13'), 'Must not contain non-existent Tailwind class h-13');

    // Thumbnail container must constrain width, height, and overflow
    assert.match(code, /w-1[24]\s+h-1[24][\s\S]*?overflow-hidden/);
  });
});

describe('Task 4: Single User Profile Shower & Header Menu Audit', () => {
  test('verifies single user profile shower and header menu button removal', () => {
    const appCode = fs.readFileSync(path.resolve(process.cwd(), 'src/App.tsx'), 'utf-8');
    const homeCode = fs.readFileSync(path.resolve(process.cwd(), 'src/components/home/HomeDashboardView.tsx'), 'utf-8');
    
    // Titlebar must not contain the duplicate user profile widget
    assert.ok(!appCode.includes('title="Logged in as Suriya Sharma • Online"'));
    // Titlebar must not render standalone ApplicationMenu button
    assert.ok(!appCode.includes('<ApplicationMenu'));
    
    // HomeDashboardView must provide the single profile menu trigger
    assert.match(homeCode, /ApplicationMenu|onOpenSettings/);
  });
});
