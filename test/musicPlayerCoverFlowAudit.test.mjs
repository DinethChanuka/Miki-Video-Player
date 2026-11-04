import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

describe('Music Section Top Player View & Cover Flow Alignment Audit', () => {
  const dashboardPath = path.join(rootDir, 'src/components/home/HomeDashboardView.tsx');
  const dashboardCode = fs.readFileSync(dashboardPath, 'utf-8');

  it('verifies music section container does not use justify-center with min-h to prevent negative top overflow clipping', () => {
    // Look at effectiveSection === 'music' render block
    const musicSectionMatch = dashboardCode.match(/effectiveSection === ['"]music['"]\s*\?\s*\([\s\S]*?3D Perspective/);
    assert.ok(musicSectionMatch, 'Must locate effectiveSection === music render block');

    const musicBlock = musicSectionMatch[0];
    assert.equal(
      /justify-center/.test(musicBlock),
      false,
      'effectiveSection === music outer container must not use justify-center (causes top overflow clipping in flexbox)'
    );
    assert.equal(
      /min-h-\[\d+px\]/.test(musicBlock),
      false,
      'effectiveSection === music outer container must not use hardcoded min-h-[500px]'
    );
  });

  it('verifies 3D perspective carousel container provides adequate top padding and height', () => {
    assert.match(
      dashboardCode,
      /perspectiveCarousel|perspective:\s*['"]1200px['"]/i,
      'Must define 3D perspective carousel container'
    );

    // Carousel container should have top clearance
    assert.match(
      dashboardCode,
      /h-(?:72|80)[\s\S]*?perspective:\s*['"]1200px['"]/,
      'Carousel container must allocate sufficient height for scaled 3D cards'
    );
  });

  it('verifies scrollable viewport has ref to reset scroll to top on section change', () => {
    assert.match(
      dashboardCode,
      /scrollViewportRef|scrollContainerRef/i,
      'Must define a ref for scrollable viewport to reset scroll position'
    );
    assert.match(
      dashboardCode,
      /scrollTo\(\s*{\s*top:\s*0/i,
      'Must scroll to top when changing effectiveSection'
    );
  });
});
