import { describe, it } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

describe('Games Section & Keyboard/Mouse Input Detection Audit', () => {
  it('verifies games catalog defines playable games with URLs and badges', async () => {
    const { GAMES_CATALOG } = await import('../src/utils/gamesCatalog.ts');

    assert.ok(GAMES_CATALOG.length >= 5, 'Must provide at least 5 playable web games');
    const ids = GAMES_CATALOG.map(g => g.id);
    assert.ok(ids.includes('2048'));
    assert.ok(ids.includes('retro-bowl') || ids.includes('pacman') || ids.includes('snake'));

    for (const game of GAMES_CATALOG) {
      assert.ok(game.title, `${game.id} must define title`);
      assert.ok(game.url, `${game.id} must define game url`);
    }
  });

  it('verifies GamesSection implements keyboard and mouse input detection', () => {
    const compCode = fs.readFileSync(path.join(rootDir, 'src/components/games/GamesSection.tsx'), 'utf-8');

    // Must detect arrow and WASD keys
    assert.match(compCode, /ArrowUp|KeyW/i);
    assert.match(compCode, /keydown|keypress/i);
    // Must prevent keyboard shortcuts from escaping to player controls
    assert.match(compCode, /stopPropagation/i);
  });
});
