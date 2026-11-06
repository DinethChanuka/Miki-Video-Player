import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

describe('Task 4: Custom Playlist Management System Audit', () => {
  const root = process.cwd();

  test('verifies playerStore declares customPlaylists and playlist actions', () => {
    const storeCode = fs.readFileSync(path.resolve(root, 'src/store/playerStore.ts'), 'utf-8');
    assert.match(storeCode, /customPlaylists:\s*CustomPlaylist\[\]/);
    assert.match(storeCode, /createPlaylist:\s*\(name:\s*string\)/);
    assert.match(storeCode, /addTrackToPlaylist:\s*\(/);
    assert.match(storeCode, /deletePlaylist:\s*\(/);
    assert.match(storeCode, /playPlaylist:\s*\(/);
  });
});
