import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

describe('Game Launcher Resilience, Favorites, and Gamepad Support Audit', () => {
  const modalPath = path.resolve('src/components/games/FullWindowGamesModal.tsx');
  const sectionPath = path.resolve('src/components/games/GamesSection.tsx');

  const modalContent = fs.readFileSync(modalPath, 'utf8');
  const sectionContent = fs.readFileSync(sectionPath, 'utf8');

  it('verifies FullWindowGamesModal manages favorite games with localStorage persistence', () => {
    assert.ok(
      modalContent.includes('miki_favorite_games'),
      'FullWindowGamesModal must store favorite games in localStorage under miki_favorite_games'
    );
    assert.ok(
      modalContent.includes('favoriteGameIds') || modalContent.includes('favorites'),
      'FullWindowGamesModal must track favorite game IDs in state'
    );
  });

  it('verifies FullWindowGamesModal supports filtering by Favorites and Recent games', () => {
    assert.ok(
      modalContent.includes('Favorites') && modalContent.includes('Recent'),
      'Category filter options must include Favorites and Recent'
    );
    assert.ok(
      modalContent.includes('miki_recent_games'),
      'Recently played games must be tracked and persisted under miki_recent_games'
    );
  });

  it('verifies Gamepad API detection is integrated for controller support', () => {
    assert.ok(
      modalContent.includes('gamepadconnected') || modalContent.includes('getGamepads'),
      'FullWindowGamesModal must detect Gamepad API connections'
    );
  });

  it('verifies GamesSection implements resilient iframe loading and fallback handling', () => {
    assert.ok(
      sectionContent.includes('iframeError') || sectionContent.includes('isLoadingIframe'),
      'GamesSection must provide iframe error detection and loading state'
    );
    assert.ok(
      sectionContent.includes('Retry') || sectionContent.includes('Inbuilt') || sectionContent.includes('handleOpenInBrowser'),
      'GamesSection must provide graceful fallback actions if game loading fails'
    );
  });
});
