import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

describe('Task 3: Inbuilt Games Level Selection & Infinity Mode Audit', () => {
  const repoRoot = process.cwd();
  const modalPath = path.join(repoRoot, 'src/components/games/FullWindowGamesModal.tsx');
  const inbuiltPath = path.join(repoRoot, 'src/utils/inbuiltGames.ts');

  test('inbuiltGames.ts universal bridge handles miki:set-game-mode and sets global variables', () => {
    assert.ok(fs.existsSync(inbuiltPath), 'src/utils/inbuiltGames.ts must exist');
    const code = fs.readFileSync(inbuiltPath, 'utf8');

    assert.match(
      code,
      /miki:set-game-mode/,
      'Universal input bridge script must handle miki:set-game-mode messages'
    );

    assert.match(
      code,
      /__MIKI_GAME_MODE/,
      'Must expose window.__MIKI_GAME_MODE for game engines'
    );

    assert.match(
      code,
      /__MIKI_GAME_LEVEL/,
      'Must expose window.__MIKI_GAME_LEVEL for game engines'
    );
  });

  test('FullWindowGamesModal.tsx renders Level Selection (1-10) and Infinity Mode controls', () => {
    assert.ok(fs.existsSync(modalPath), 'FullWindowGamesModal.tsx must exist');
    const code = fs.readFileSync(modalPath, 'utf8');

    assert.match(
      code,
      /gameMode|setGameMode/,
      'FullWindowGamesModal must manage gameMode state'
    );

    assert.match(
      code,
      /selectedLevel|setSelectedLevel/,
      'FullWindowGamesModal must manage selectedLevel state'
    );

    assert.match(
      code,
      /Infinity Mode|∞/,
      'Must render Infinity Mode indicator or toggle button'
    );

    assert.match(
      code,
      /Level\s+([1-9]|10)|Lv\.\s*|selectedLevel/,
      'Must support Level 1-10 selection'
    );

    assert.match(
      code,
      /postMessage\s*\(\s*\{\s*(?:type:\s*['"]miki:set-game-mode['"]|mode|level)/,
      'Must dispatch miki:set-game-mode via postMessage to game iframe'
    );
  });
});
