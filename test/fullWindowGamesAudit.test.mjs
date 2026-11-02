import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

describe('Full-Window Games Viewport & Integration Audit', () => {
  it('verifies FullWindowGamesModal implementation meets all architectural requirements', () => {
    const modalPath = path.join(rootDir, 'src/components/games/FullWindowGamesModal.tsx');
    assert.ok(fs.existsSync(modalPath), 'FullWindowGamesModal.tsx must exist');

    const code = fs.readFileSync(modalPath, 'utf8');
    // Full window layout
    assert.match(code, /fixed inset-0/i, 'Must occupy edge-to-edge fixed inset-0 viewport');
    // Zero-failure srcDoc support
    assert.match(code, /srcDoc/i, 'Must support srcDoc for zero-latency inbuilt canvas games');
    // Search & Category Filtering
    assert.match(code, /searchQuery|searchTerm/i, 'Must support dynamic search query filtering');
    assert.match(code, /selectedCategory|activeCategory/i, 'Must support category filtering');
    // Live Keyboard & Mouse HUD
    assert.match(code, /activeKeys/i, 'Must maintain activeKeys state for live HUD');
    assert.match(code, /KeyW|ArrowUp/i, 'Must detect movement keys in live HUD');
    assert.match(code, /stopPropagation/i, 'Must stop key event propagation to prevent video seeking while gaming');
  });

  it('verifies FileBrowserModal and App.tsx are wired to open full-window games', () => {
    const appPath = path.join(rootDir, 'src/App.tsx');
    const appCode = fs.readFileSync(appPath, 'utf8');
    assert.match(appCode, /FullWindowGamesModal/i, 'App.tsx must import and render FullWindowGamesModal');

    const fileBrowserPath = path.join(rootDir, 'src/components/hud/FileBrowserModal.tsx');
    const fileBrowserCode = fs.readFileSync(fileBrowserPath, 'utf8');
    assert.match(fileBrowserCode, /onOpenGames|FullWindowGamesModal/i, 'FileBrowserModal must wire full window games modal');
  });
});
