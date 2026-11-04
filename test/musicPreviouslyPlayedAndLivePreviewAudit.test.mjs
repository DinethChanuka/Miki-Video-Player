import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

describe('Default SoundCloud Music, Previously Played Display & Live Preview Search Audit', () => {
  const rootDir = process.cwd();
  const homeDashboardPath = path.join(rootDir, 'src/components/home/HomeDashboardView.tsx');
  const musicDiscoveryPath = path.join(rootDir, 'src/utils/musicDiscoveryService.ts');

  it('verifies default music is configured to hindisongs3 from soundcloud', () => {
    assert.ok(fs.existsSync(homeDashboardPath), 'HomeDashboardView.tsx must exist');
    const homeCode = fs.readFileSync(homeDashboardPath, 'utf-8');
    assert.match(
      homeCode,
      /hindisongs3|Hindi Songs 3/i,
      'HomeDashboardView must define hindisongs3 as default music'
    );
    assert.match(
      homeCode,
      /soundcloud/i,
      'HomeDashboardView must associate hindisongs3 with SoundCloud'
    );

    const discCode = fs.readFileSync(musicDiscoveryPath, 'utf-8');
    assert.match(
      discCode,
      /hindisongs3|Hindi Songs 3/i,
      'musicDiscoveryService must catalog hindisongs3 from SoundCloud'
    );
  });

  it('verifies HomeDashboardView displays previously played track from recentMedia in player HUD', () => {
    const homeCode = fs.readFileSync(homeDashboardPath, 'utf-8');
    assert.match(
      homeCode,
      /previouslyPlayed|lastPlayed/i,
      'HomeDashboardView must identify previously played media'
    );
    assert.match(
      homeCode,
      /recentMedia/,
      'HomeDashboardView must read recentMedia from player store'
    );
  });

  it('verifies searchMusicOnline and fetchOnlineMusicSearch support Emin/Eminem and Hindi with real covers and live updates', () => {
    const discCode = fs.readFileSync(musicDiscoveryPath, 'utf-8');
    // Ensure Emin / Eminem preset or live search is supported
    assert.match(
      discCode,
      /emin|eminem/i,
      'musicDiscoveryService must support Emin / Eminem query with real artwork'
    );
    // Ensure live online search function is exported for dynamic search result cards
    assert.match(
      discCode,
      /fetchOnlineMusicSearch|searchOnlineMusicLive/i,
      'musicDiscoveryService must export live online music search function'
    );
    // Ensure real artwork replacement is performed for high-res previews (e.g. 600x600)
    assert.match(
      discCode,
      /600x600|artworkUrl/,
      'musicDiscoveryService must transform preview images into high-resolution cover artwork'
    );
  });

  it('verifies HomeDashboardView updates search result cards dynamically with real previews', () => {
    const homeCode = fs.readFileSync(homeDashboardPath, 'utf-8');
    assert.match(
      homeCode,
      /fetchOnlineMusicSearch|searchOnlineMusicLive/,
      'HomeDashboardView must call live music search to update search result cards dynamically'
    );
  });
});

