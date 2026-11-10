import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

describe('Groovvy Sub-Bar Removal, Dynamic Updating Hero Banner & Line-by-Line Search Mode Audit', () => {
  const rootDir = process.cwd();
  const homeViewFile = path.resolve(rootDir, 'src/components/home/HomeDashboardView.tsx');
  const homeCode = fs.readFileSync(homeViewFile, 'utf-8');

  test('Removes redundant Groovvy sub-navigation bar (MUSIC | PODCAST | LIVE | Type here to search)', () => {
    assert.doesNotMatch(
      homeCode,
      /Type here to search/i,
      'Must remove redundant "Type here to search" bar from 3D Music'
    );
    assert.doesNotMatch(
      homeCode,
      /groovvySubTab/i,
      'Must remove groovvySubTab MUSIC/PODCAST/LIVE tab state'
    );
    assert.doesNotMatch(
      homeCode,
      /groovvySearch/i,
      'Must remove redundant groovvySearch state'
    );
  });

  test('Implements dynamic updating Hero Banner carousel with clean studio portraits and slide controls', () => {
    assert.match(homeCode, /export const GROOVVY_HERO_BANNERS:/);
    assert.match(homeCode, /ARTIST_AVATARS\.camilaCabelloHero/);
    assert.match(homeCode, /ARTIST_AVATARS\.theWeekndHero/);
    assert.match(homeCode, /ARTIST_AVATARS\.arijitSingh/);
    assert.match(homeCode, /ARTIST_AVATARS\.billieEilishHero/);

    // Auto-rotation & interactive dot switching
    assert.match(homeCode, /setHeroBannerIndex\(/);
    assert.match(homeCode, /isHeroBannerHovered/);
    assert.match(homeCode, /maskImage:/);

    // Hero assets exist on disk
    for (const filename of [
      'camila_cabello_hero.jpg',
      'the_weeknd_hero.jpg',
      'arijit_singh.jpg',
      'billie_eilish_hero.jpg',
    ]) {
      const p = path.resolve(rootDir, 'public/artists', filename);
      assert.ok(fs.existsSync(p), `${filename} must exist in public/artists/`);
      assert.ok(fs.statSync(p).size > 20 * 1024, `${filename} must be > 20KB`);
    }
  });

  test('Hides banner, top artists, and player during 3D Music search and renders only full-width line-by-line results', () => {
    // Search-only gate wraps entire normal showcase (Hero Banner, Top Artists, Genres, Charts, Player)
    assert.match(
      homeCode,
      /\{isSearchingInMusic \?\s*\([\s\S]*?renderSoundLoungeResults\(true,\s*filteredMusicTracks\)\s*\)\s*:\s*\(\s*<>/
    );

    // Suppresses floating search overlay popup while in 3D Music section
    assert.match(
      homeCode,
      /isSearchFocused && effectiveSection !== ['"]music['"]/
    );

    // Renders tabular line-by-line columns & hairline-divided rows in full-width search
    assert.match(homeCode, /const renderSoundLoungeResults = \(/);
    assert.match(homeCode, /divide-y divide-white\/\[0\.06\]/);
    assert.match(homeCode, /Clear Search/);
  });
});
