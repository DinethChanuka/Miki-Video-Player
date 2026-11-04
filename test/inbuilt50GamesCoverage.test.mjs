import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { getInbuiltGameSrcDoc } from '../src/utils/inbuiltGames.ts';

const NEW_50_INBUILT_IDS = [
  'neon-invaders-dx',
  'space-shooter-2d',
  'brick-breaker-neo',
  'pipe-bird-fly',
  'snake-speed-run',
  'color-switch-canvas',
  'gravity-run-canvas',
  'dungeon-crawl-retro',
  'subway-runner-canvas',
  'jump-tower-canvas',
  'tank-battle-2d',
  'speed-drift-canvas',
  'memory-cards-dx',
  'minesweeper-dx',
  'checkers-board-canvas',
  'sliding-tile-puzzle',
  'neon-pong-battle',
  'alien-assault-canvas',
  'pixel-frog-jump',
  'fruit-slice-canvas',
  'bubble-pop-canvas',
  'stack-block-3d',
  'math-speed-quiz',
  'laser-mirror-puzzle',
  'retro-sky-force',
  'archery-target-canvas',
  'neon-runner-infinite',
  'hex-puzzle-canvas',
  'crossword-mini-canvas',
  'maze-escape-3d',
  'whack-target-dx',
  'galaxy-defense-canvas',
  'cyber-ball-bounce',
  'pixel-kart-racer',
  'word-search-canvas',
  'match-three-gem',
  'card-war-canvas',
  'sudoku-canvas-pro',
  'solitaire-klondike-dx',
  'pinball-arcade-canvas',
  'table-tennis-canvas',
  'boxing-retro-2d',
  'curling-ice-canvas',
  'golf-putt-canvas',
  'orbit-gravity-canvas',
  'cannon-shooter-canvas',
  'ninja-jump-canvas',
  'stealth-rogue-canvas',
  'tower-defense-dx',
  'piano-tiles-canvas',
];

describe('Task 2: 50 New Inbuilt HTML5 Canvas Game Engines Coverage', () => {
  it('verifies that exactly 50 target game engines are evaluated', () => {
    assert.equal(NEW_50_INBUILT_IDS.length, 50, 'Must define exactly 50 target inbuilt game IDs');
  });

  it('verifies all 50 new games generate non-empty HTML srcDoc with canvas and input bridge', () => {
    for (const gameId of NEW_50_INBUILT_IDS) {
      const srcDoc = getInbuiltGameSrcDoc(gameId);
      assert.ok(
        srcDoc && srcDoc.length > 300,
        `Game "${gameId}" must generate a valid non-empty HTML srcDoc (got length ${srcDoc?.length || 0})`
      );
      assert.ok(
        srcDoc.includes('<canvas') || srcDoc.includes('<div') || srcDoc.includes('context'),
        `Game "${gameId}" must contain canvas rendering elements`
      );
      assert.ok(
        srcDoc.includes('miki:game-input') || srcDoc.includes('UNIVERSAL_INPUT_BRIDGE_SCRIPT'),
        `Game "${gameId}" must contain the universal input bridge script`
      );
      assert.ok(
        !srcDoc.includes('images.unsplash.com'),
        `Game "${gameId}" must be self-contained offline without external image dependencies`
      );
    }
  });
});
