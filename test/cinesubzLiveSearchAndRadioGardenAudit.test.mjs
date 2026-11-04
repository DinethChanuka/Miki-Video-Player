import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

describe('CineSubz Real Search Results & Radio Garden Channels Audit', () => {
  const repoRoot = process.cwd();

  it('verifies parseCineSubzHtml correctly parses Dooplay display items and decodes HTML entities', async () => {
    const { parseCineSubzHtml, decodeHtmlEntities } = await import('../src/utils/cinesubzService.ts');

    assert.equal(typeof decodeHtmlEntities, 'function');
    assert.equal(decodeHtmlEntities('Batman: Knightfall &#8211; Part 1 &#8217;26'), "Batman: Knightfall – Part 1 '26");

    const sampleHtml = `
      <div id="item-999888" class="display-item">
        <div class="item-box">
          <a href="https://cinesubz.lk/movies/avatar-3-2026-sinhala-subtitles/" title="Avatar: Fire &#8211; Ash (2026) Sinhala Subtitles | සිංහල උපසිරැසි සමඟ"></a>
          <img src="https://cinesubz.lk/wp-content/uploads/2026/10/avatar3.jpg" class="thumb mli-thumb" />
          <span class="imdb-score">8.4</span>
          <span class="badge-quality-corner">IMAX 4K</span>
        </div>
      </div>
    `;

    const parsed = parseCineSubzHtml(sampleHtml);
    assert.equal(parsed.length, 1);
    assert.equal(parsed[0].id, 'cinesubz-999888');
    assert.equal(parsed[0].title, 'Avatar: Fire – Ash');
    assert.equal(parsed[0].year, 2026);
    assert.equal(parsed[0].rating, '★ 8.4 IMDb');
    assert.equal(parsed[0].quality, 'IMAX 4K');
    assert.equal(parsed[0].posterUrl, 'https://cinesubz.lk/wp-content/uploads/2026/10/avatar3.jpg');
    assert.equal(parsed[0].watchUrl, 'https://cinesubz.lk/movies/avatar-3-2026-sinhala-subtitles/');
  });

  it('verifies searchCineSubzLive provides live and fallback search results', async () => {
    const { searchCineSubzLive } = await import('../src/utils/cinesubzService.ts');
    assert.equal(typeof searchCineSubzLive, 'function');

    // Empty query returns empty array
    const emptyResult = await searchCineSubzLive('');
    assert.deepEqual(emptyResult, []);

    // Local fallback test for cached titles
    const searchRes = await searchCineSubzLive('Apocalypse');
    assert.ok(Array.isArray(searchRes));
    assert.ok(searchRes.length > 0);
    assert.ok(searchRes.some((m) => m.title.toLowerCase().includes('apocalypse')));
  });

  it('verifies RADIO_GARDEN_STATIONS contains authentic channels with valid Radio Garden URLs', async () => {
    const { RADIO_GARDEN_STATIONS, searchRadioGardenStations } = await import('../src/utils/radioGardenCatalog.ts');

    assert.ok(Array.isArray(RADIO_GARDEN_STATIONS));
    assert.ok(RADIO_GARDEN_STATIONS.length >= 10, 'Must have at least 10 world city stations');

    // Check required fields and Radio Garden visit URL format
    for (const station of RADIO_GARDEN_STATIONS) {
      assert.ok(station.id, 'Station must have id');
      assert.ok(station.title, 'Station must have title');
      assert.ok(station.city, 'Station must have city');
      assert.ok(station.country, 'Station must have country');
      assert.ok(station.flag, 'Station must have country flag emoji');
      assert.ok(station.streamUrl, 'Station must have streamUrl');
      assert.ok(station.radioGardenUrl.startsWith('https://radio.garden/visit/'), `Must point to radio.garden visit URL: ${station.radioGardenUrl}`);
    }

    // Verify search and filtering
    const londonStations = searchRadioGardenStations('London');
    assert.ok(londonStations.length > 0);
    assert.equal(londonStations[0].city, 'London');

    const tokyoStations = searchRadioGardenStations('Tokyo');
    assert.ok(tokyoStations.length > 0);
    assert.equal(tokyoStations[0].city, 'Tokyo');
  });

  it('verifies HomeDashboardView incorporates CineSubz live search and Radio Garden 3D Globe', () => {
    const dashboardPath = path.join(repoRoot, 'src/components/home/HomeDashboardView.tsx');
    const content = fs.readFileSync(dashboardPath, 'utf8');

    assert.ok(content.includes('searchCineSubzLive'), 'HomeDashboardView must import and call searchCineSubzLive');
    assert.ok(content.includes('RADIO_GARDEN_STATIONS'), 'HomeDashboardView must import RADIO_GARDEN_STATIONS');
    assert.ok(content.includes('radio.garden'), 'HomeDashboardView must reference radio.garden');
    assert.ok(content.includes('https://radio.garden/'), 'HomeDashboardView must embed https://radio.garden/ iframe');
    assert.ok(content.includes('radioViewMode'), 'HomeDashboardView must support radioViewMode (stations / globe)');
  });

  it('verifies playerStore prevents sticky playback mode bug (videos never misclassified as audio)', async () => {
    const playerStorePath = path.join(repoRoot, 'src/store/playerStore.ts');
    const content = fs.readFileSync(playerStorePath, 'utf8');

    // Verify explicit video detection
    assert.ok(
      content.includes('isExplicitVideo'),
      'playerStore must define isExplicitVideo check'
    );
    assert.ok(
      content.includes('mediaType === \'video\''),
      'playerStore must support explicit mediaType: video'
    );
    assert.ok(
      content.includes('isExplicitVideo ? \'video\''),
      'playbackMode must prioritize video when isExplicitVideo is true'
    );
  });

  it('verifies App.tsx mounts HomeDashboardView for radio mode and hides video element', () => {
    const appPath = path.join(repoRoot, 'src/App.tsx');
    const content = fs.readFileSync(appPath, 'utf8');

    // Check dashboard mounting condition includes radio mode
    assert.ok(
      content.includes("activePlaybackMode === 'music' || activePlaybackMode === 'radio'"),
      'App.tsx must keep HomeDashboardView mounted and hide video element for both music and radio modes'
    );
  });
});
