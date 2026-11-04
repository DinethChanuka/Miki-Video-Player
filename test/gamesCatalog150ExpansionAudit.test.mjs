import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { GAMES_CATALOG, INBUILT_GAMES } from '../src/utils/gamesCatalog.ts';

describe('Task 3: 150+ Games Catalog Expansion & 67+ Inbuilt Engines Audit', () => {
  it('verifies GAMES_CATALOG contains at least 219 games (69 initial + 150 added)', () => {
    assert.ok(
      GAMES_CATALOG.length >= 219,
      `Expected at least 219 games in GAMES_CATALOG, but found ${GAMES_CATALOG.length}`
    );
  });

  it('verifies INBUILT_GAMES contains at least 67 zero-latency offline engines', () => {
    assert.ok(
      INBUILT_GAMES.length >= 67,
      `Expected at least 67 inbuilt games in INBUILT_GAMES, but found ${INBUILT_GAMES.length}`
    );
  });

  it('verifies all games have non-empty titles, valid categories, badges, and controls hints', () => {
    const validCategories = [
      'Arcade',
      'Puzzle',
      'Sports',
      'Retro',
      'Classic',
      'Action',
      'Strategy',
      'Cards',
    ];

    const ids = new Set();
    for (const game of GAMES_CATALOG) {
      assert.ok(game.id && game.id.trim().length > 0, 'Game id must be non-empty');
      assert.ok(!ids.has(game.id), `Duplicate game id found: ${game.id}`);
      ids.add(game.id);

      assert.ok(game.title && game.title.trim().length > 0, `Game ${game.id} title must be non-empty`);
      assert.ok(
        validCategories.includes(game.category),
        `Game ${game.id} has invalid category: ${game.category}`
      );
      assert.ok(game.badge && game.badge.trim().length > 0, `Game ${game.id} badge must be non-empty`);
      assert.ok(game.controlsHint && game.controlsHint.trim().length > 0, `Game ${game.id} controlsHint must be non-empty`);
      assert.ok(game.url && game.url.trim().length > 0, `Game ${game.id} url must be non-empty`);

      if (game.isInbuilt) {
        assert.ok(
          game.srcDoc && game.srcDoc.length > 200,
          `Inbuilt game ${game.id} must have a valid non-empty srcDoc`
        );
      }
    }
  });
});
