import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

describe('Task 2: Dynamic Home Section Cards & Custom Themed Heroes Audit', () => {
  const homeDashPath = resolve(process.cwd(), 'src/components/home/HomeDashboardView.tsx');
  const content = readFileSync(homeDashPath, 'utf8');

  it('verifies HomeDashboardView contains dedicated dynamic section blocks for Movies, Channels, Games, and Music', () => {
    // Must handle switching by activeCategory or activeNav
    assert.ok(
      content.includes("activeCategory === 'Movies'") || content.includes("sectionMode === 'movies'"),
      'HomeDashboardView must have conditional rendering branch for Movies section'
    );
    assert.ok(
      content.includes("activeCategory === 'Live TV'") || content.includes("activeNav === 'channels'"),
      'HomeDashboardView must have conditional rendering branch for Live TV Channels section'
    );
    assert.ok(
      content.includes("activeCategory === 'Games'") || content.includes("activeNav === 'games'"),
      'HomeDashboardView must have conditional rendering branch for Games section'
    );
    assert.ok(
      content.includes("activeCategory === 'Music'") || content.includes("activeNav === 'music'") || content.includes('isMusicMode'),
      'HomeDashboardView must have conditional rendering branch for Music section'
    );
  });

  it('verifies Channels section renders full live channels grid with offline logos and category filters', () => {
    assert.ok(
      content.includes('CURATED_CHANNELS'),
      'Channels section must use CURATED_CHANNELS'
    );
    assert.ok(
      content.includes('selectedChannelCategory') || content.includes('channelFilterCategory'),
      'Channels section must provide category filtering (News, Sports, Movies, etc.)'
    );
  });

  it('verifies Games section renders games catalog with interactive launch and category filters', () => {
    assert.ok(
      content.includes('GAMES_CATALOG'),
      'Games section must use GAMES_CATALOG'
    );
    assert.ok(
      content.includes('selectedGameCategory') || content.includes('gameFilterCategory'),
      'Games section must provide category filtering (Arcade, Puzzle, Action, etc.)'
    );
  });

  it('verifies Movie section features blockbusters, watch parties, and cinema streaming portals', () => {
    assert.ok(
      content.includes('RECOMMENDED_MOVIES') || content.includes('MOVIE_POSTERS'),
      'Movie section must feature movie posters'
    );
    assert.ok(
      content.includes('CINEMA_LINKS'),
      'Movie section must link to verified cinema and subtitle portals'
    );
  });
});
