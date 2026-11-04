import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

describe('CineSubz TV Shows & Series Service Audit', () => {
  it('verifies CINESUBZ_TV_SHOWS is exported with at least 20 real TV series', async () => {
    const { CINESUBZ_TV_SHOWS, parseCineSubzTvHtml } = await import('../src/utils/cinesubzTvService.ts');

    assert.ok(Array.isArray(CINESUBZ_TV_SHOWS), 'CINESUBZ_TV_SHOWS must be an array');
    assert.ok(CINESUBZ_TV_SHOWS.length >= 20, `Expected at least 20 TV shows, found ${CINESUBZ_TV_SHOWS.length}`);

    for (const show of CINESUBZ_TV_SHOWS) {
      assert.ok(show.id.startsWith('cinesubz-tv-'), `Invalid show id: ${show.id}`);
      assert.ok(show.title && show.title.trim().length > 0, 'TV show must have a title');
      assert.ok(show.season && show.season.trim().length > 0, 'TV show must have season info');
      assert.ok(show.rating.includes('IMDb'), 'TV show must have IMDb rating');
      assert.ok(show.posterUrl.startsWith('/posters/tvshows/'), `Poster must point to local /posters/tvshows/: ${show.posterUrl}`);
      assert.ok(show.watchUrl.includes('cinesubz.lk/tvshows/'), `Watch URL must point to cinesubz.lk/tvshows/: ${show.watchUrl}`);
      assert.ok(show.subtitles.includes('Sinhala'), 'Subtitles must indicate Sinhala');

      // Verify poster exists on disk
      const fullPosterPath = path.join(rootDir, 'public', show.posterUrl.replace(/^\//, ''));
      assert.ok(fs.existsSync(fullPosterPath), `Local poster file must exist: ${fullPosterPath}`);
      const stats = fs.statSync(fullPosterPath);
      assert.ok(stats.size > 2000, `Poster file ${fullPosterPath} must not be empty (size: ${stats.size})`);
    }
  });

  it('verifies parseCineSubzTvHtml parses sample HTML and extracts TV series properly', async () => {
    const { parseCineSubzTvHtml } = await import('../src/utils/cinesubzTvService.ts');

    const sampleHtml = `
      <div id="item-999999" class="display-item">
        <div class="item-box">
          <a href="https://cinesubz.lk/tvshows/test-series-2026/" title="Test Series (2026) TV Series | S01 | EP01-08"></a>
          <img data-original="https://cinesubz.lk/wp-content/uploads/2026/10/test-poster.jpg" />
          <span class="imdb-score">8.5</span>
          <span class="badge-quality-corner">HD 1080p</span>
          <span class="badge-season-corner">Season 1</span>
        </div>
      </div>
    `;

    const parsed = parseCineSubzTvHtml(sampleHtml);
    assert.equal(parsed.length, 1);
    assert.equal(parsed[0].id, 'cinesubz-tv-999999');
    assert.equal(parsed[0].title, 'Test Series');
    assert.equal(parsed[0].season, 'Season 1');
    assert.equal(parsed[0].rating, '★ 8.5 IMDb');
    assert.equal(parsed[0].quality, 'HD 1080p');
    assert.equal(parsed[0].watchUrl, 'https://cinesubz.lk/tvshows/test-series-2026/');
  });

  it('verifies fetchLatestCineSubzTvShows retrieves TV series catalog with cache support', async () => {
    const { fetchLatestCineSubzTvShows } = await import('../src/utils/cinesubzTvService.ts');

    const shows = await fetchLatestCineSubzTvShows();
    assert.ok(Array.isArray(shows));
    assert.ok(shows.length >= 20);
  });
});
