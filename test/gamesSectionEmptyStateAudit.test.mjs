import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

describe('Task 4: Games Section Visual Preview & Empty State Audit', () => {
  const rootDir = process.cwd();
  const gamesSectionPath = path.join(rootDir, 'src', 'components', 'games', 'GamesSection.tsx');

  it('verifies GamesSection implements an empty state and reset filter button when no games match', () => {
    const code = fs.readFileSync(gamesSectionPath, 'utf-8');
    assert.match(
      code,
      /filteredGames\.length\s*===\s*0/,
      'GamesSection must explicitly check for filteredGames.length === 0'
    );
    assert.match(
      code,
      /Clear Filters|Show All/i,
      'GamesSection must provide a reset filter action when empty'
    );
  });

  it('verifies GamesSection provides an onError fallback on game thumbnail images', () => {
    const code = fs.readFileSync(gamesSectionPath, 'utf-8');
    assert.match(
      code,
      /onError\s*=\s*\{/,
      'Game thumbnail img tag must include an onError fallback'
    );
  });
});
