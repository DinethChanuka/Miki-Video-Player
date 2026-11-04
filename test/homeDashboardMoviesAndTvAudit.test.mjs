import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

describe('HomeDashboardView CineSubz Latest Movies & TV Shows Audit', () => {
  const dashboardPath = path.join(rootDir, 'src/components/home/HomeDashboardView.tsx');
  const dashboardCode = fs.readFileSync(dashboardPath, 'utf-8');

  it('verifies HomeDashboardView imports and utilizes cinesubzTvService', () => {
    assert.match(
      dashboardCode,
      /from\s+['"].*cinesubzTvService['"]/i,
      'HomeDashboardView must import from cinesubzTvService'
    );
    assert.match(
      dashboardCode,
      /CINESUBZ_TV_SHOWS/i,
      'HomeDashboardView must use CINESUBZ_TV_SHOWS'
    );
    assert.match(
      dashboardCode,
      /fetchLatestCineSubzTvShows/i,
      'HomeDashboardView must call fetchLatestCineSubzTvShows'
    );
  });

  it('verifies TV series section renders CineSubz TV Shows catalog with watch actions', () => {
    // Must render TV shows section when effectiveSection === 'series'
    assert.match(
      dashboardCode,
      /CineSubz.*(?:TV|Series|ටෙලිනාට්‍ය)/i,
      'Must render CineSubz TV Series section title'
    );
    assert.match(
      dashboardCode,
      /https:\/\/cinesubz\.lk\/tvshows\//i,
      'Must contain direct link to cinesubz.lk/tvshows/'
    );
    assert.match(
      dashboardCode,
      /season/i,
      'Must display season badge on TV show cards'
    );
  });

  it('verifies Latest Movies section features CineSubz latest releases with preview images', () => {
    assert.match(
      dashboardCode,
      /filteredCinesubz|cinesubzList/i,
      'Latest movies shelf must use CineSubz latest releases'
    );
  });

  it('verifies zero occurrences of legacy cinesubz.co domain in HomeDashboardView', () => {
    const legacyMatches = dashboardCode.match(/cinesubz\.co/g);
    assert.equal(
      legacyMatches,
      null,
      `Found ${legacyMatches ? legacyMatches.length : 0} occurrences of legacy cinesubz.co in HomeDashboardView.tsx`
    );
  });
});

