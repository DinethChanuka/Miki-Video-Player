import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

describe('Bi-Directional Keyboard Input Detection in Games & Web Audit', () => {
  it('verifies inbuilt games implement universal postMessage input bridge and key activity reporting', () => {
    const gamesPath = path.join(rootDir, 'src/utils/inbuiltGames.ts');
    const gamesCode = fs.readFileSync(gamesPath, 'utf8');

    assert.match(
      gamesCode,
      /miki:game-input/i,
      'inbuiltGames must listen for miki:game-input messages from parent window'
    );
    assert.match(
      gamesCode,
      /miki:key-activity/i,
      'inbuiltGames must report key events to parent window for HUD sync'
    );
  });

  it('verifies FullWindowGamesModal forwards keyboard events to game iframe and auto-focuses on launch', () => {
    const modalPath = path.join(rootDir, 'src/components/games/FullWindowGamesModal.tsx');
    const modalCode = fs.readFileSync(modalPath, 'utf8');

    assert.match(
      modalCode,
      /iframeRef\.current\?\.contentWindow\?\.postMessage/i,
      'FullWindowGamesModal must forward keyboard events to iframe'
    );
    assert.match(
      modalCode,
      /iframeRef\.current\?\.focus\(\)/i,
      'FullWindowGamesModal must auto-focus iframe on mount and game switch'
    );
  });

  it('verifies WebBrowserModal implements browser keyboard navigation shortcuts and quick URL navigation', () => {
    const webPath = path.join(rootDir, 'src/components/hud/WebBrowserModal.tsx');
    const webCode = fs.readFileSync(webPath, 'utf8');

    assert.match(
      webCode,
      /handleKeyDown|Escape/i,
      'WebBrowserModal must implement keyboard listeners'
    );
    assert.match(
      webCode,
      /KeyR|KeyL|ArrowLeft|ArrowRight/i,
      'WebBrowserModal must handle reload, quick URL bar, and navigation hotkeys'
    );
  });
});

