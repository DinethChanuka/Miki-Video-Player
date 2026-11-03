import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

describe('Game Iframe Sandbox & Fallback Resilience Audit', () => {
  const fullWindowGamesModalSource = readFileSync(
    resolve(process.cwd(), 'src/components/games/FullWindowGamesModal.tsx'),
    'utf-8'
  );
  const gamesSectionSource = readFileSync(
    resolve(process.cwd(), 'src/components/games/GamesSection.tsx'),
    'utf-8'
  );

  it('verifies FullWindowGamesModal includes allow-same-origin in external game sandbox', () => {
    assert.ok(
      fullWindowGamesModalSource.includes('allow-same-origin'),
      'FullWindowGamesModal must include allow-same-origin in external game sandbox to support localStorage'
    );
  });

  it('verifies GamesSection includes allow-same-origin in external game sandbox', () => {
    assert.ok(
      gamesSectionSource.includes('allow-same-origin'),
      'GamesSection must include allow-same-origin in external game sandbox to support localStorage'
    );
  });

  it('verifies FullWindowGamesModal provides graceful fallback card with Inbuilt and Browser buttons', () => {
    assert.ok(
      fullWindowGamesModalSource.includes('Play Inbuilt') || fullWindowGamesModalSource.includes('Inbuilt Alternative'),
      'FullWindowGamesModal must provide a 1-click Inbuilt alternative button'
    );
    assert.ok(
      fullWindowGamesModalSource.includes('Web Browser') || fullWindowGamesModalSource.includes('browserViewAction'),
      'FullWindowGamesModal must provide an option to launch game in web browser'
    );
  });
});
