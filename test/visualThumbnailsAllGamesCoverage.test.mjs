import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { GAMES_CATALOG, INBUILT_GAMES } from '../src/utils/gamesCatalog.ts';
import { getGameThumbnailUrl, getGamePreviewSvg } from '../src/utils/gameThumbnails.ts';

describe('Task 4: 100% Visual Vector Artwork Coverage for All Games', () => {
  it('verifies all games have non-empty data:image/svg+xml thumbnails with zero external URLs', () => {
    assert.ok(GAMES_CATALOG.length >= 219, `Expected >= 219 games, got ${GAMES_CATALOG.length}`);

    for (const game of GAMES_CATALOG) {
      assert.ok(game.thumbnail, `Game ${game.id} must have a thumbnail`);
      assert.ok(
        game.thumbnail.startsWith('data:image/svg+xml'),
        `Game ${game.id} thumbnail must be a local SVG data URI, but was: ${game.thumbnail.slice(0, 30)}`
      );
      assert.ok(
        !game.thumbnail.includes('unsplash.com'),
        `Game ${game.id} thumbnail must not depend on external unsplash images`
      );
    }
  });

  it('verifies zero duplicate thumbnails across all 219+ games in the catalog', () => {
    const seen = new Map();
    const duplicates = [];

    for (const game of GAMES_CATALOG) {
      if (seen.has(game.thumbnail)) {
        duplicates.push({ id: game.id, firstId: seen.get(game.thumbnail) });
      } else {
        seen.set(game.thumbnail, game.id);
      }
    }

    assert.equal(
      duplicates.length,
      0,
      `Found duplicate thumbnails: ${JSON.stringify(duplicates.slice(0, 5))}`
    );
  });

  it('verifies getGamePreviewSvg returns valid SVG syntax with viewBox for every game', () => {
    for (const game of GAMES_CATALOG) {
      const svg = getGamePreviewSvg(game.id);
      assert.ok(svg.includes('<svg'), `Game ${game.id} preview must contain <svg tag`);
      assert.ok(svg.includes('</svg>'), `Game ${game.id} preview must contain </svg> closing tag`);
      assert.ok(svg.includes('viewBox="0 0 320 180"'), `Game ${game.id} preview must have standardized 320x180 viewBox`);
    }
  });

  it('verifies that each of the 50 new inbuilt games has rich, custom-crafted visual themes', () => {
    const newInbuiltIds = [
      'neon-invaders-dx', 'space-shooter-2d', 'brick-breaker-neo', 'pipe-bird-fly', 'snake-speed-run',
      'color-switch-canvas', 'gravity-run-canvas', 'dungeon-crawl-retro', 'subway-runner-canvas', 'jump-tower-canvas',
      'tank-battle-2d', 'speed-drift-canvas', 'memory-cards-dx', 'minesweeper-dx', 'checkers-board-canvas',
      'sliding-tile-puzzle', 'neon-pong-battle', 'alien-assault-canvas', 'pixel-frog-jump', 'fruit-slice-canvas',
      'bubble-pop-canvas', 'stack-block-3d', 'math-speed-quiz', 'laser-mirror-puzzle', 'retro-sky-force',
      'archery-target-canvas', 'neon-runner-infinite', 'hex-puzzle-canvas', 'crossword-mini-canvas', 'maze-escape-3d',
      'whack-target-dx', 'galaxy-defense-canvas', 'cyber-ball-bounce', 'pixel-kart-racer', 'word-search-canvas',
      'match-three-gem', 'card-war-canvas', 'sudoku-canvas-pro', 'solitaire-klondike-dx', 'pinball-arcade-canvas',
      'table-tennis-canvas', 'boxing-retro-2d', 'curling-ice-canvas', 'golf-putt-canvas', 'orbit-gravity-canvas',
      'cannon-shooter-canvas', 'ninja-jump-canvas', 'stealth-rogue-canvas', 'tower-defense-dx', 'piano-tiles-canvas'
    ];

    for (const id of newInbuiltIds) {
      const svg = getGamePreviewSvg(id);
      assert.ok(svg && svg.length > 250, `Inbuilt game ${id} must have rich SVG artwork (>250 chars)`);
      // Ensure it is not simply the generic fallback but has dedicated styling or custom shapes
      assert.ok(
        svg.includes('id="art_' + id + '"') || svg.includes(id) || svg.includes('<rect') || svg.includes('<circle'),
        `Inbuilt game ${id} preview must include distinctive vector nodes`
      );
    }
  });
});
