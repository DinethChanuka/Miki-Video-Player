import { describe, it } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';

describe('Task 3: Inbuilt Offline Canvas Games & Sandbox Safety Audit', () => {
  it('verifies inbuiltGames.ts generates offline engines for pong, breakout, tron, lunar-lander, wordle, tictactoe', async () => {
    const { getInbuiltGameSrcDoc } = await import('../src/utils/inbuiltGames.ts');
    assert.equal(typeof getInbuiltGameSrcDoc, 'function');

    const expectedNewEngines = ['pong', 'breakout', 'tron', 'lunar-lander', 'wordle', 'tictactoe'];
    for (const gameId of expectedNewEngines) {
      const srcDoc = getInbuiltGameSrcDoc(gameId);
      assert.ok(srcDoc, `Engine must generate srcDoc for ${gameId}`);
      assert.ok(srcDoc.includes('<!DOCTYPE html>'), `${gameId} must generate full HTML document`);
      assert.ok(srcDoc.includes('<script>'), `${gameId} must contain game script`);
    }
  });

  it('verifies GAMES_CATALOG marks newly generated games as isInbuilt: true with srcDoc', async () => {
    const { GAMES_CATALOG } = await import('../src/utils/gamesCatalog.ts');
    const checkedIds = ['pong', 'breakout', 'tron', 'lunar-lander', 'wordle', 'tictactoe'];

    for (const id of checkedIds) {
      const game = GAMES_CATALOG.find((g) => g.id === id);
      assert.ok(game, `Game ${id} must exist in catalog`);
      assert.equal(game.isInbuilt, true, `Game ${id} must be marked isInbuilt: true`);
      assert.ok(game.srcDoc, `Game ${id} must have srcDoc attached`);
    }
  });

  it('verifies FullWindowGamesModal and GamesSection allow safe same-origin execution in iframe sandboxes', () => {
    const fullModalCode = fs.readFileSync(
      path.resolve(process.cwd(), 'src/components/games/FullWindowGamesModal.tsx'),
      'utf-8'
    );
    const gamesSectionCode = fs.readFileSync(
      path.resolve(process.cwd(), 'src/components/games/GamesSection.tsx'),
      'utf-8'
    );

    assert.match(
      fullModalCode,
      /allow-same-origin/,
      'FullWindowGamesModal must include allow-same-origin in sandbox'
    );
    assert.match(
      gamesSectionCode,
      /allow-same-origin/,
      'GamesSection must include allow-same-origin in sandbox'
    );
  });

  it('verifies FileBrowserModal passes searchTerm to GamesSection for unified filtering', () => {
    const fileBrowserCode = fs.readFileSync(
      path.resolve(process.cwd(), 'src/components/hud/FileBrowserModal.tsx'),
      'utf-8'
    );

    assert.match(
      fileBrowserCode,
      /<GamesSection[\s\S]*?searchTerm=\{searchTerm\}/,
      'FileBrowserModal must pass searchTerm to GamesSection'
    );
  });
});

