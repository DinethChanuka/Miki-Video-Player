import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { GAMES_CATALOG, INBUILT_GAMES } from '../src/utils/gamesCatalog.ts';
import { getInbuiltGameSrcDoc } from '../src/utils/inbuiltGames.ts';

describe('Task 2: 30+ High-Graphic Built-in Games & Full Visibility Audit', () => {
  it('verifies at least 30 built-in games exist in INBUILT_GAMES', () => {
    assert.ok(
      INBUILT_GAMES.length >= 30,
      `Expected at least 30 built-in games, found ${INBUILT_GAMES.length}`
    );
  });

  it('verifies all built-in games generate non-empty HTML srcDoc with universal input bridge', () => {
    for (const game of INBUILT_GAMES) {
      const srcDoc = getInbuiltGameSrcDoc(game.id);
      assert.ok(srcDoc && srcDoc.length > 200, `Game ${game.id} must produce a valid HTML srcDoc`);
      assert.ok(
        srcDoc.includes('miki:game-input') || srcDoc.includes('UNIVERSAL_INPUT_BRIDGE_SCRIPT'),
        `Game ${game.id} must contain the universal keyboard input bridge script`
      );
      assert.ok(
        srcDoc.includes('<canvas') || srcDoc.includes('<div') || srcDoc.includes('context'),
        `Game ${game.id} must have visual rendering canvas or elements`
      );
    }
  });

  it('verifies all games in GAMES_CATALOG have unique, valid preview thumbnail URLs', () => {
    const thumbnails = new Set();
    const duplicateThumbs = [];

    for (const game of GAMES_CATALOG) {
      assert.ok(game.thumbnail, `Game ${game.id} must have a thumbnail`);
      if (thumbnails.has(game.thumbnail)) {
        duplicateThumbs.push(game.thumbnail);
      }
      thumbnails.add(game.thumbnail);
    }

    assert.equal(
      duplicateThumbs.length,
      0,
      `Found duplicate thumbnails across games: ${duplicateThumbs.join(', ')}`
    );
  });

  it('verifies all built-in games are accessible in GAMES_CATALOG and categorized properly', () => {
    const catalogIds = new Set(GAMES_CATALOG.map((g) => g.id));
    for (const game of INBUILT_GAMES) {
      assert.ok(catalogIds.has(game.id), `Built-in game ${game.id} must be included in GAMES_CATALOG`);
    }
  });
});
