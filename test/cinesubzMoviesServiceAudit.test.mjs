import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

describe('Task 2: CineSubz Auto-Updating Movies Catalog Audit', () => {
  const repoRoot = process.cwd();
  const cinesubzServicePath = path.join(repoRoot, 'src/utils/cinesubzService.ts');
  const homeDashboardPath = path.join(repoRoot, 'src/components/home/HomeDashboardView.tsx');

  test('cinesubzService.ts exists and exports CINESUBZ_MOVIES and fetchLatestCineSubzMovies', async () => {
    assert.ok(fs.existsSync(cinesubzServicePath), 'src/utils/cinesubzService.ts must exist');
    const serviceCode = fs.readFileSync(cinesubzServicePath, 'utf8');

    assert.match(serviceCode, /export\s+interface\s+CineSubzMovie/, 'Must export CineSubzMovie interface');
    assert.match(serviceCode, /sinhalaTitle:/, 'CineSubzMovie must include sinhalaTitle');
    assert.match(serviceCode, /posterUrl:/, 'CineSubzMovie must include posterUrl');
    assert.match(serviceCode, /watchUrl:/, 'CineSubzMovie must include watchUrl');
    assert.match(serviceCode, /export\s+const\s+CINESUBZ_MOVIES/, 'Must export CINESUBZ_MOVIES catalog');
    assert.match(serviceCode, /export\s+async\s+function\s+fetchLatestCineSubzMovies/, 'Must export fetchLatestCineSubzMovies');

    // Dynamically import the module to test runtime behavior
    const { CINESUBZ_MOVIES, fetchLatestCineSubzMovies } = await import(
      `file://${cinesubzServicePath}`
    );

    assert.ok(Array.isArray(CINESUBZ_MOVIES), 'CINESUBZ_MOVIES must be an array');
    assert.ok(CINESUBZ_MOVIES.length >= 10, 'Must have at least 10 curated CineSubz movies');

    const first = CINESUBZ_MOVIES[0];
    assert.ok(first.id, 'Movie must have id');
    assert.ok(first.title, 'Movie must have title');
    assert.ok(first.sinhalaTitle, 'Movie must have sinhalaTitle');
    assert.ok(first.posterUrl, 'Movie must have posterUrl');
    assert.ok(first.watchUrl, 'Movie must have watchUrl');

    const liveList = await fetchLatestCineSubzMovies();
    assert.ok(Array.isArray(liveList), 'fetchLatestCineSubzMovies must return an array');
    assert.ok(liveList.length >= 10, 'Must return at least 10 movies');
  });

  test('HomeDashboardView.tsx integrates CineSubz movies section with preview images and Sinhala badges', () => {
    assert.ok(fs.existsSync(homeDashboardPath), 'HomeDashboardView.tsx must exist');
    const homeCode = fs.readFileSync(homeDashboardPath, 'utf8');

    assert.match(
      homeCode,
      /import\s+.*(?:CINESUBZ_MOVIES|fetchLatestCineSubzMovies|CineSubzMovie).*from\s+['"]\.\.\/\.\.\/utils\/cinesubzService['"]/,
      'HomeDashboardView must import from cinesubzService'
    );

    assert.match(
      homeCode,
      /CineSubz/i,
      'HomeDashboardView must feature CineSubz section title'
    );

    assert.match(
      homeCode,
      /sinhalaTitle|සිංහල උපසිරැසි/,
      'HomeDashboardView must display Sinhala subtitle identifiers'
    );
  });
});
