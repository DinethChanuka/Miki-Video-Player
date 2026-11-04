import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

describe('Dedicated Radio Side Nav, Music Pagination & In-App Playback Audit', () => {
  const homePath = path.join(rootDir, 'src/components/home/HomeDashboardView.tsx');
  const servicePath = path.join(rootDir, 'src/utils/musicDiscoveryService.ts');

  it('verifies HomeDashboardView has separate 3D Music and Live Radio buttons in sidebar and floating dock', () => {
    const code = fs.readFileSync(homePath, 'utf-8');

    // Sidebar items
    assert.match(
      code,
      /<span[^>]*>\s*3D Music\s*<\/span>/i,
      'Must have dedicated 3D Music button in sidebar'
    );
    assert.match(
      code,
      /<span[^>]*>\s*Music Radio Live\s*<\/span>|<span[^>]*>\s*Live Radio Stations\s*<\/span>/i,
      'Must have dedicated Radio button in sidebar'
    );

    // Left floating dock items
    assert.match(
      code,
      /title="3D Music/i,
      'Must have 3D Music icon in left dock'
    );
    assert.match(
      code,
      /title="Music Radio Live/i,
      'Must have Music Radio Live icon in left dock'
    );
  });

  it('verifies effectiveSection separates Music view from Radio view without mixed radio stations in Music', () => {
    const code = fs.readFileSync(homePath, 'utf-8');

    // Music view should show Cover Flow and Online Music Discovery
    assert.match(
      code,
      /effectiveSection === 'music'[\s\S]*?COVER_FLOW_ALBUMS[\s\S]*?filteredMusicTracks/i,
      'Music section must feature Cover Flow and filtered music discovery'
    );

    // Radio view should show curated 24/7 internet radio stations
    assert.match(
      code,
      /effectiveSection === 'radio'[\s\S]*?INTERNET_MUSIC_STREAMS/i,
      'Radio section must feature 24/7 internet radio streams separately'
    );
  });

  it('verifies music discovery implements page pagination controls (Previous, Page Numbers, Next)', () => {
    const code = fs.readFileSync(homePath, 'utf-8');
    assert.match(
      code,
      /musicCurrentPage|musicPage|currentMusicPage/i,
      'HomeDashboardView must maintain current page state for music'
    );
    assert.match(
      code,
      /totalPages|musicTotalPages|numPages/i,
      'HomeDashboardView must calculate total pages for music'
    );
    assert.match(
      code,
      /Previous|Next/i,
      'Must render pagination navigation buttons'
    );
  });

  it('verifies music cards play 100% in-app via openMedia and never navigate to external web browser', () => {
    const code = fs.readFileSync(homePath, 'utf-8');

    // When clicking a music card or its play button, it must call openMedia
    assert.match(
      code,
      /openMedia\(\s*track\.streamUrl/i,
      'Music card must call openMedia with track.streamUrl'
    );

    // It should not call onOpenWebBrowser when playing a music card
    assert.equal(
      /onClick=\{[^}]*onOpenWebBrowser\(track\.pageUrl\)/.test(code),
      false,
      'Music card must not navigate to external web page on click'
    );
  });

  it('verifies searchMusicOnline returns rich playable tracks for any query like "black pink"', async () => {
    const { searchMusicOnline } = await import('../src/utils/musicDiscoveryService.ts');

    const results = searchMusicOnline('black pink');
    assert.ok(results.length > 0, 'Searching "black pink" must return matching tracks');

    const hasBlackpink = results.some(
      (t) =>
        t.artist.toLowerCase().includes('blackpink') ||
        t.title.toLowerCase().includes('pink') ||
        t.title.toLowerCase().includes('black')
    );
    assert.equal(hasBlackpink, true, 'Results must contain Blackpink music titles or artist');

    // Every track must have a playable streamUrl
    for (const track of results) {
      assert.ok(track.streamUrl, `Track "${track.title}" must have a valid streamUrl for in-app playback`);
      assert.ok(track.streamUrl.startsWith('http'), 'streamUrl must be a valid http(s) URL');
    }
  });
});

