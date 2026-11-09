import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

describe('Normal View In-Window Music Search Results & Legacy Grid Removal Audit', () => {
  const root = process.cwd();
  const dashboardPath = path.resolve(root, 'src/components/home/HomeDashboardView.tsx');
  const viewCode = fs.readFileSync(dashboardPath, 'utf-8');

  test('verifies legacy Sound Lounge discovery grid and Suggested For You shelf are removed from normal view', () => {
    // 1. Should not contain green "Play Song In-App" button
    assert.doesNotMatch(
      viewCode,
      /Play Song In-App/i,
      'Normal view must not contain legacy green "Play Song In-App" button'
    );

    // 2. Should not contain old Suggested For You recommendations shelf
    assert.doesNotMatch(
      viewCode,
      /Algorithmic Recommendations:\s*Suggested For You/i,
      'Normal view must not contain legacy Suggested For You shelf'
    );

    // 3. Should not contain redundant secondary in-section search input
    assert.doesNotMatch(
      viewCode,
      /Live search songs, artists & soundscapes\.\.\./i,
      'Normal view must not contain redundant secondary search input'
    );
  });

  test('verifies search and filter results are rendered directly in the normal window', () => {
    // 1. Must render Sound Lounge Results in the left column
    assert.match(
      viewCode,
      /Sound Lounge Results/i,
      'Must render Sound Lounge Results header in normal window'
    );

    // 2. Must display dynamic song count in results badge
    assert.match(
      viewCode,
      /filteredMusicTracks\.length/i,
      'Must bind song count to filteredMusicTracks.length'
    );

    // 3. Must render in-window search results using paginated tracks
    assert.match(
      viewCode,
      /paginatedMusicTracks\.map/i,
      'Must map paginated tracks for in-window search table'
    );
  });

  test('verifies in-window playback retains normal view and updates right-side player card without popping full-window modal', () => {
    // Groovvy section must call setMusicPlayerOpen(false) to prevent opening FullWindowMusicPlayer
    assert.match(
      viewCode,
      /openMedia\([^)]*?'music'\);\s*setMusicPlayerOpen\(false\);/,
      'Playing in normal window must call setMusicPlayerOpen(false) to prevent full-window modal popup'
    );

    // Right-side player card must be present with Player title, live scrubber, and controls
    assert.match(
      viewCode,
      /<h3[^>]*>Player<\/h3>/i,
      'Right-side Player card must be rendered in normal window'
    );
    assert.match(
      viewCode,
      /formatGroovvyTime/i,
      'Must format live scrubber time in normal window Player card'
    );
  });

  test('verifies in-window search results support chunked streaming pagination', () => {
    assert.match(
      viewCode,
      /Chunk\s*\{musicCurrentPage\}\s*of\s*\{musicTotalPages\}/i,
      'Must render chunk indicator'
    );
    assert.match(
      viewCode,
      /Chunked Streaming/i,
      'Must display Chunked Streaming status indicator'
    );
  });
});
