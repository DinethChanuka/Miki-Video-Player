import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

describe('Task 4: Resolve Origin Not Found and Safe Browser Launch Audit', () => {
  const repoRoot = process.cwd();
  const catalogPath = path.join(repoRoot, 'src/utils/gamesCatalog.ts');
  const modalPath = path.join(repoRoot, 'src/components/games/FullWindowGamesModal.tsx');

  test('gamesCatalog.ts contains 0 dummy .local URLs across all 219+ games', async () => {
    assert.ok(fs.existsSync(catalogPath), 'src/utils/gamesCatalog.ts must exist');
    const catalogCode = fs.readFileSync(catalogPath, 'utf8');

    const localMatch = catalogCode.match(/https?:\/\/[^\s'"`]+\.local[^\s'"`]*/g);
    assert.equal(
      localMatch,
      null,
      `Found dummy .local URLs that cause "origin not found": ${JSON.stringify(localMatch?.slice(0, 5))}`
    );

    // Import runtime catalog
    const { GAMES_CATALOG } = await import(`file://${catalogPath}`);
    assert.ok(GAMES_CATALOG.length >= 200, 'Must have at least 200 games');

    for (const game of GAMES_CATALOG) {
      assert.ok(!game.url.includes('.local'), `Game ${game.id} has invalid .local URL: ${game.url}`);
      assert.ok(
        game.url.startsWith('https://') || game.url.startsWith('http://') || game.url.startsWith('data:'),
        `Game ${game.id} must have a valid protocol: ${game.url}`
      );
    }
  });

  test('FullWindowGamesModal.tsx sanitizes browser launch URLs and creates Blob/Data URLs for inbuilt games', () => {
    assert.ok(fs.existsSync(modalPath), 'FullWindowGamesModal.tsx must exist');
    const modalCode = fs.readFileSync(modalPath, 'utf8');

    // Must prevent .local URLs from being passed
    assert.match(
      modalCode,
      /createObjectURL|Blob|data:text\/html|resolveSafeBrowserUrl|handleOpenInBrowser/,
      'Modal must have safe URL resolution or Blob generator for external browser'
    );

    // Must have try/catch error handling around browser dispatch
    assert.match(
      modalCode,
      /try\s*\{[\s\S]*?(?:browserViewAction|window\.open)[\s\S]*?\}\s*catch/,
      'Modal must wrap external browser actions in try-catch error handling'
    );
  });
});
