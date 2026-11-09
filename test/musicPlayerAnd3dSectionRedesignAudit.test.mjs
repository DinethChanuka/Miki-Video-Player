import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

describe('Task 1 & 2: 3D Music Section Groovvy Redesign Audit (Image 2)', () => {
  const homeCode = fs.readFileSync(
    path.resolve(process.cwd(), 'src/components/home/HomeDashboardView.tsx'),
    'utf-8'
  );

  test('HomeDashboardView renders Trending New Hits hero banner with artist visual and Listen Now action', () => {
    assert.match(homeCode, /Trending New Hits/i);
    assert.match(homeCode, /Listen Now/i);
    assert.match(homeCode, /Million Plays|M Plays/i);
  });

  test('HomeDashboardView renders Top Artists horizontal ribbon with rich colorful cards and play counts', () => {
    assert.match(homeCode, /Top Artists/i);
    // Must feature artists from ribbon like Travis Scott, Billie Eilish, Camila Cabello, The Weeknd, etc.
    assert.match(homeCode, /Travis Scott/i);
    assert.match(homeCode, /Billie Eilish/i);
    // Ribbon must render play count indicators
    assert.match(homeCode, /\d+M Plays/i);
  });

  test('HomeDashboardView renders Genres grid and Top Charts ranked list', () => {
    assert.match(homeCode, /Genres/i);
    assert.match(homeCode, /Top Charts/i);
    assert.match(homeCode, /#01|#1|01/);
  });

  test('HomeDashboardView renders dedicated Right-Side Player card with live scrubber and lyrics toggle', () => {
    assert.match(homeCode, />Player</i);
    assert.match(homeCode, /LYRICS/i);
  });
});

describe('Task 1 & 3: Spotify-Style Playlist Player Audit (Image 1)', () => {
  const musicPlayerCode = fs.readFileSync(
    path.resolve(process.cwd(), 'src/components/music/MusicPlayerView.tsx'),
    'utf-8'
  );

  test('MusicPlayerView renders Artist Spotlight hero with verified badge and monthly listeners', () => {
    assert.match(musicPlayerCode, /Monthly Listeners/i);
    assert.match(musicPlayerCode, /Verified|Artist/i);
  });

  test('MusicPlayerView renders comprehensive Playlist track table with ranking, stream count, and duration', () => {
    assert.match(musicPlayerCode, /Playlist/i);
    assert.match(musicPlayerCode, /#\d+|idx \+ 1/i);
    assert.match(musicPlayerCode, /Headphones|plays|listeners/i);
  });

  test('MusicPlayerView renders New Album discography shelf', () => {
    assert.match(musicPlayerCode, /New Album|Albums/i);
  });

  test('MusicPlayerView renders Top Song and Fans Like too side panels', () => {
    assert.match(musicPlayerCode, /Top Song/i);
    assert.match(musicPlayerCode, /Fans Like too|Fans Also Like/i);
  });

  test('MusicPlayerView embeds interactive playback dock with scrubber and transport controls', () => {
    assert.match(musicPlayerCode, /currentTime|formatTime|seek/);
    assert.match(musicPlayerCode, /togglePlay|isPaused/);
  });
});
