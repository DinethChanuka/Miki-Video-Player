import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { getInbuiltGameSrcDoc } from '../src/utils/inbuiltGames.ts';
import { GAMES_CATALOG } from '../src/utils/gamesCatalog.ts';

describe('Inbuilt Zero-Latency Offline Games Expansion Audit', () => {
  const newGames = [
    'pacman',
    'space-invaders',
    'solitaire',
    'sudoku',
    'simon-says',
    'space-defender',
    'whack-a-mole',
  ];

  for (const gameId of newGames) {
    it(`should generate a complete, valid HTML5 srcDoc for game '${gameId}'`, () => {
      const srcDoc = getInbuiltGameSrcDoc(gameId);
      assert.ok(srcDoc && typeof srcDoc === 'string', `srcDoc for ${gameId} must not be undefined or empty`);
      assert.ok(srcDoc.includes('<!DOCTYPE html>'), `${gameId} srcDoc must contain DOCTYPE html`);
      assert.ok(srcDoc.includes('<script>'), `${gameId} srcDoc must contain executable script`);
      assert.ok(srcDoc.includes('miki:game-input') || srcDoc.includes('keydown'), `${gameId} srcDoc must support keyboard input`);
    });
  }

  it('GAMES_CATALOG should mark these games as isInbuilt with non-empty srcDoc', () => {
    for (const gameId of newGames) {
      const game = GAMES_CATALOG.find((g) => g.id === gameId);
      assert.ok(game, `Game ${gameId} should be present in GAMES_CATALOG`);
      assert.equal(game.isInbuilt, true, `Game ${gameId} must be marked isInbuilt: true`);
      assert.ok(game.srcDoc && game.srcDoc.length > 50, `Game ${gameId} must carry srcDoc payload`);
    }
  });

  it('at least 20 games in GAMES_CATALOG should now be 100% offline-ready with inbuilt engines', () => {
    const inbuiltCount = GAMES_CATALOG.filter((g) => g.isInbuilt && g.srcDoc).length;
    assert.ok(
      inbuiltCount >= 20,
      `Expected at least 20 inbuilt offline games, found ${inbuiltCount}`
    );
  });
});

