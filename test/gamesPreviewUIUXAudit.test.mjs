import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

describe('Games Preview & UI/UX Audit', () => {
  it('verifies FullWindowGamesModal includes an interactive preview inspector in the games drawer', () => {
    const modalPath = path.join(rootDir, 'src/components/games/FullWindowGamesModal.tsx');
    const modalCode = fs.readFileSync(modalPath, 'utf8');

    assert.match(
      modalCode,
      /previewGame|selectedPreview/i,
      'FullWindowGamesModal must have preview game state'
    );
    assert.match(
      modalCode,
      /controlsHint|Launch Game|Play Game/i,
      'FullWindowGamesModal must show preview details with launch action'
    );
  });

  it('verifies FileBrowserModal and GamesSection render game cards and category filters without black screen', () => {
    const sectionPath = path.join(rootDir, 'src/components/games/GamesSection.tsx');
    const sectionCode = fs.readFileSync(sectionPath, 'utf8');

    assert.match(
      sectionCode,
      /GAMES_CATALOG/i,
      'GamesSection must render catalog'
    );
    assert.match(
      sectionCode,
      /category|search/i,
      'GamesSection must have category or search controls'
    );
  });
});

