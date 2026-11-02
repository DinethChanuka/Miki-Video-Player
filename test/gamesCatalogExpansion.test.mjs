import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

describe('50+ Games Catalog & Inbuilt Canvas Engines Audit', () => {
  it('contains at least 50 games across diverse categories in GAMES_CATALOG', async () => {
    const { GAMES_CATALOG } = await import('../src/utils/gamesCatalog.ts');
    assert.ok(Array.isArray(GAMES_CATALOG), 'GAMES_CATALOG must be an array');
    assert.ok(
      GAMES_CATALOG.length >= 50,
      `GAMES_CATALOG must contain at least 50 games, currently has ${GAMES_CATALOG.length}`
    );

    // Verify all game entries have valid structure
    for (const game of GAMES_CATALOG) {
      assert.ok(game.id, `Game must have an id: ${JSON.stringify(game)}`);
      assert.ok(game.title, `Game must have a title: ${game.id}`);
      assert.ok(game.category, `Game must have a category: ${game.id}`);
      assert.ok(game.description, `Game must have a description: ${game.id}`);
      assert.ok(game.controlsHint, `Game must have controlsHint: ${game.id}`);
      assert.ok(
        game.srcDoc || (game.url && game.url.startsWith('http')),
        `Game must have either self-contained srcDoc or valid URL: ${game.id}`
      );
    }
  });

  it('provides zero-latency inbuilt HTML5 Canvas engines for core games', async () => {
    const { GAMES_CATALOG, getInbuiltGameSrcDoc } = await import('../src/utils/gamesCatalog.ts');
    assert.equal(typeof getInbuiltGameSrcDoc, 'function', 'getInbuiltGameSrcDoc must be exported');

    const coreInbuiltGameIds = [
      '2048',
      'snake',
      'pong',
      'breakout',
      'flappy-bird',
      'asteroids',
      'tetris',
      'dino',
      'minesweeper',
      'tic-tac-toe',
      'connect-four',
      'memory-match',
      'maze',
    ];

    for (const id of coreInbuiltGameIds) {
      const srcDoc = getInbuiltGameSrcDoc(id);
      assert.ok(srcDoc && srcDoc.length > 200, `Inbuilt game '${id}' must have substantial canvas srcDoc`);
      assert.match(srcDoc, /<canvas|<script/i, `Inbuilt game '${id}' srcDoc must contain canvas or script`);
    }
  });

  it('verifies FullWindowGamesModal exists with full-window layout, category filters, and search', () => {
    const modalPath = path.join(rootDir, 'src/components/games/FullWindowGamesModal.tsx');
    assert.ok(fs.existsSync(modalPath), 'FullWindowGamesModal.tsx must exist');

    const modalCode = fs.readFileSync(modalPath, 'utf8');
    assert.match(modalCode, /fixed inset-0/i, 'FullWindowGamesModal must render fixed inset-0 full window');
    assert.match(modalCode, /srcDoc/, 'FullWindowGamesModal must support rendering srcDoc for zero-failure games');
    assert.match(modalCode, /search/i, 'FullWindowGamesModal must include search filtering');
    assert.match(modalCode, /activeKeys|ArrowUp|KeyW/i, 'FullWindowGamesModal must include live keyboard HUD');
  });
});
