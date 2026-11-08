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

describe('Task 5: Cyber Spectrum Full-Width Animation & Holographic Prism Visibility Audit', () => {
  test('renderCyberSpectrum generates dynamic bar heights across all 48 bars with realistic audio FFT data', () => {
    const barsDrawn = [];
    const mockCtx = {
      clearRect: () => {},
      createLinearGradient: () => ({ addColorStop: () => {} }),
      fillRect: (x, y, w, h) => {
        barsDrawn.push({ x, y, w, h });
      },
    };

    // Realistic AAC/Opus frequency data: strong bass/mids in bins 0..20, steep rolloff above bin 25 (zeros in bins 25..63)
    const realisticFft = new Uint8Array(64);
    for (let i = 0; i < 20; i++) realisticFft[i] = Math.max(20, 240 - i * 10);
    // Bins 25..63 are near 0 or 0, typical of compressed 128k audio streams
    for (let i = 25; i < 64; i++) realisticFft[i] = 0;

    renderCyberSpectrum(mockCtx, 1000, 600, realisticFft, 1.0, true, true);

    // Each bar draws an upward bar, downward reflection, and peak cap (3 fillRect calls per bar = 144 calls for 48 bars)
    assert.ok(barsDrawn.length >= 48, `Expected at least 48 bars rendered, got ${barsDrawn.length}`);

    // Check upward bars across the second half of the screen (bars 24..47)
    // Upward bars have y < centerY (where centerY = 600 * 0.65 = 390) and height > 8px
    const upwardBars = barsDrawn.filter((b) => b.y < 390 && b.h > 8);
    const rightSideBars = upwardBars.filter((b) => b.x > 500);

    assert.ok(
      rightSideBars.length >= 15,
      `Cyber Spectrum right half must not be flat or dead; expected active right-side bars, got ${rightSideBars.length}`
    );
  });

  test('renderHolographicPrism projects structure visible beyond the 256px center cover flow card', () => {
    const verticesProjected = [];
    const mockCtx = {
      clearRect: () => {},
      beginPath: () => {},
      moveTo: (x, y) => verticesProjected.push({ x, y }),
      lineTo: (x, y) => verticesProjected.push({ x, y }),
      stroke: () => {},
      fill: () => {},
      arc: (x, y) => verticesProjected.push({ x, y }),
      createLinearGradient: () => ({ addColorStop: () => {} }),
      createRadialGradient: () => ({ addColorStop: () => {} }),
      fillRect: () => {},
    };

    const freqData = new Uint8Array(64).fill(120);
    renderHolographicPrism(mockCtx, 1200, 800, freqData, 1.0, true, true);

    const centerX = 600;
    const centerY = 416; // 800 * 0.52

    // Cover Flow card is 256px wide (radius 128px from center).
    // The holographic prism vertices/structure must extend noticeably beyond 150px (e.g. 200px+) so it frames the card
    const maxDistFromCenter = Math.max(
      ...verticesProjected.map((v) => Math.hypot(v.x - centerX, v.y - centerY))
    );

    assert.ok(
      maxDistFromCenter > 200,
      `Holographic Prism must extend beyond 200px from center to avoid being occluded by 256px Cover Flow card. Got: ${maxDistFromCenter}px`
    );
  });
});

describe('Task 6: Sinhala & Hindi Lyrics Detection & Sanitization Audit', () => {
  test('cleanTrackSearchQuery isolates pure track title and artist for Bollywood and Sinhala tracks', async () => {
    const { cleanTrackSearchQuery } = await import('../src/utils/lyricsService.ts');

    // 1. Bollywood title with Movie and singers in pipes
    const res1 = cleanTrackSearchQuery(
      'Bin Tere (Full Song) - I Hate Luv Storys | Sunidhi Chauhan, Shafqat Amanat Ali',
      'Sony Music India'
    );
    assert.equal(res1.trackTitle, 'Bin Tere');
    assert.match(res1.artist, /Sunidhi Chauhan/i);

    // 2. Bollywood title with "Title Song" suffix and multi-artist pipe
    const res2 = cleanTrackSearchQuery(
      'Saiyaara Title Song | Tanishk Bagchi, Faheem Abdullah, Arslan Nizami, Irshad Kamil',
      'YRF'
    );
    assert.equal(res2.trackTitle, 'Saiyaara');
    assert.match(res2.artist, /Tanishk Bagchi/i);

    // 3. Bollywood title with movie and actors in multiple pipes
    const res3 = cleanTrackSearchQuery(
      'Kesariya - Brahmāstra | Ranbir Kapoor | Alia Bhatt | Pritam | Arijit Singh | Amitabh Bhattacharya',
      'Sony Music India'
    );
    assert.equal(res3.trackTitle, 'Kesariya');
    assert.match(res3.artist, /Pritam|Arijit Singh/i);

    // 4. Sinhala track with native script in parens and teledrama / theme song tags
    const res4 = cleanTrackSearchQuery(
      'Digvijaya (දිග්විජය) Theme Song | Official Music Video | Pradeep Rangana',
      'Pradeep Rangana Official'
    );
    assert.equal(res4.trackTitle, 'Digvijaya');

    // 5. Sinhala Baila / Teledrama track with Sinhala script and artist
    const res5 = cleanTrackSearchQuery(
      'Manike Mage Hithe (මැණිකේ මගේ හිතේ) - Yohani & Satheeshan | Official Music Video',
      'Yohani'
    );
    assert.equal(res5.trackTitle, 'Manike Mage Hithe');
    assert.match(res5.artist, /Yohani/i);
  });
});

describe('Task 7: High-Contrast Lyrics UI & Timeline Duration Sanity Audit', () => {
  test('FullWindowMusicPlayer renders high-contrast lyrics styling and sparkle indicator', () => {
    const code = fs.readFileSync(path.resolve(process.cwd(), 'src/components/music/FullWindowMusicPlayer.tsx'), 'utf-8');

    // Inactive lyrics must have high contrast (text-white/70 or text-white/75 or higher, not text-white/35)
    assert.ok(
      !code.includes('text-white/35'),
      'Inactive lyrics must not be low contrast (text-white/35)'
    );
    assert.match(code, /text-white\/7[05]|text-white\/80/);

    // Active line must feature sparkle indicator (Sparkles icon)
    assert.match(code, /<Sparkles/);
  });

  test('FullWindowMusicPlayer corrects WebKit 2x HE-AAC duration doubling bug on timeline', () => {
    const code = fs.readFileSync(path.resolve(process.cwd(), 'src/components/music/FullWindowMusicPlayer.tsx'), 'utf-8');

    // Must include duration validation/sanity check against WebKit 2x HE-AAC bug
    assert.match(
      code,
      /durationSec[\s\S]*?(?:correctedDurationMs|effectiveDuration)[\s\S]*?(?:1\.7|1\.8|2\.2|\* 2|\/ 2)/,
      'Must contain logic to detect and correct doubled duration'
    );
  });
});
