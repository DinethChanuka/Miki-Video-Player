import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

describe('CineSubz Search, Theme Visual Previews, Background Removal & Header Cleanup Audit', () => {
  const homeDashboardFile = path.resolve('src/components/home/HomeDashboardView.tsx');
  const videoSettingsFile = path.resolve('src/components/hud/VideoSettingsModal.tsx');
  const appFile = path.resolve('src/App.tsx');

  it('verifies search bar in HomeDashboardView includes CineSubz movies & TV shows in search results', () => {
    assert.ok(fs.existsSync(homeDashboardFile), 'HomeDashboardView.tsx must exist');
    const content = fs.readFileSync(homeDashboardFile, 'utf8');

    // CineSubz search filtering
    assert.match(
      content,
      /cinesubzList\.filter|filteredCinesubzMovies|filteredCinesubz/i,
      'HomeDashboardView must filter CineSubz movies in search'
    );
    assert.match(
      content,
      /cinesubzTvList\.filter|filteredCinesubzTv/i,
      'HomeDashboardView must filter CineSubz TV shows in search'
    );
    // Renders CineSubz results in the search dropdown
    assert.match(
      content,
      /CineSubz/i,
      'Search dropdown must include CineSubz results header or section'
    );
  });

  it('verifies VideoSettingsModal renders live visual preview cards for themes and allows removing background', () => {
    assert.ok(fs.existsSync(videoSettingsFile), 'VideoSettingsModal.tsx must exist');
    const content = fs.readFileSync(videoSettingsFile, 'utf8');

    // Theme live visual card mockup
    assert.match(
      content,
      /previewColors|theme-preview|Visual Theme Preview|glassBorder/i,
      'Theme selector must render visual preview cards for themes'
    );

    // Ability to remove background / clean dark mode
    assert.match(
      content,
      /setCustomBgImage\(null\)|Remove Background|None \(Clean Dark\)|Clean AMOLED/i,
      'Background settings must provide explicit option to remove background image'
    );
  });

  it('verifies App.tsx top-right header removes Library nav link and displays section name, network strength, and user profile', () => {
    assert.ok(fs.existsSync(appFile), 'App.tsx must exist');
    const content = fs.readFileSync(appFile, 'utf8');

    // "Library" button removed from top-right titlebar
    assert.ok(
      !content.includes('<span>Library</span>'),
      'Top-right titlebar must not contain standalone Library button'
    );

    // Current section name display
    assert.match(
      content,
      /activePlaybackMode|currentSectionName|sectionName|lastActiveNav/i,
      'Top-right or titlebar must indicate the active section'
    );

    // Network strength indicator
    assert.match(
      content,
      /Wifi|network-strength|Signal|100%|Online|networkStrength/i,
      'Header must display network strength indicator'
    );

    // Logged user profile
    assert.match(
      content,
      /Suriya|userProfile|User Profile|user-profile|avatar/i,
      'Header must display logged-in user profile'
    );
  });
});
