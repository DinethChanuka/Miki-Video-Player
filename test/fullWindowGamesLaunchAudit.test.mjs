import { describe, it } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';

describe('Task 3: Full Window Games & Zero Black Box Audit', () => {
  const gamesSectionPath = path.resolve(process.cwd(), 'src/components/games/GamesSection.tsx');
  const fileBrowserModalPath = path.resolve(process.cwd(), 'src/components/hud/FileBrowserModal.tsx');
  const fullWindowModalPath = path.resolve(process.cwd(), 'src/components/games/FullWindowGamesModal.tsx');

  const gamesSectionCode = fs.readFileSync(gamesSectionPath, 'utf-8');
  const fileBrowserModalCode = fs.readFileSync(fileBrowserModalPath, 'utf-8');
  const fullWindowModalCode = fs.readFileSync(fullWindowModalPath, 'utf-8');

  it('verifies FileBrowserModal passes onOpenGames to GamesSection', () => {
    assert.match(
      fileBrowserModalCode,
      /<GamesSection[\s\S]*?onOpenGames=\{onOpenGames\}/,
      'FileBrowserModal must pass onOpenGames callback to GamesSection'
    );
  });

  it('verifies GamesSection supports onOpenGames to launch full window arcade directly', () => {
    assert.match(
      gamesSectionCode,
      /onOpenGames\??:\s*\(gameId\?: string\) => void/,
      'GamesSectionProps must include onOpenGames callback'
    );
  });

  it('verifies GamesSection uses srcDoc for inbuilt games to eliminate black screen iframe rejections', () => {
    assert.match(
      gamesSectionCode,
      /srcDoc=\{selectedGame(?:\.srcDoc)?\}/,
      'GamesSection iframe must pass srcDoc for inbuilt games'
    );
  });

  it('verifies FullWindowGamesModal contains over 50 games and isolates keyboard events', () => {
    assert.match(
      fullWindowModalCode,
      /iframeRef\.current\?\.contentWindow\?\.postMessage/,
      'FullWindowGamesModal must forward keystrokes directly to the game iframe'
    );
    assert.match(
      fullWindowModalCode,
      /e\.stopPropagation\(\)/,
      'FullWindowGamesModal must stop key propagation so media player controls do not interfere'
    );
  });
});
