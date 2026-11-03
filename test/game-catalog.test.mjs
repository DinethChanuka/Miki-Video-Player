import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { validateGamesCatalog } from '../src/utils/gameCatalogValidator.ts';
import { GAMES_CATALOG } from '../src/utils/gamesCatalog.ts';

describe('Game Catalog Validator Audit', () => {
  it('validates production GAMES_CATALOG has zero fatal schema errors', () => {
    const report = validateGamesCatalog(GAMES_CATALOG);
    assert.deepEqual(
      report.errors,
      [],
      `GAMES_CATALOG should have no validation errors, got: ${report.errors.join('; ')}`
    );
    assert.equal(report.isValid, true);
  });

  it('detects duplicate game IDs accurately', () => {
    const mockGames = [
      { id: 'game-1', title: 'Game 1', category: 'Arcade', thumbnail: 'thumb1.png', controlsHint: 'Keys' },
      { id: 'game-1', title: 'Game 1 Duplicate', category: 'Arcade', thumbnail: 'thumb2.png', controlsHint: 'Keys' },
    ];
    const report = validateGamesCatalog(mockGames);
    assert.equal(report.isValid, false);
    assert.ok(report.errors.some((e) => e.includes('Duplicate game ID')));
  });

  it('detects inbuilt games missing required srcDoc', () => {
    const mockGames = [
      { id: 'broken-inbuilt', title: 'Broken Game', category: 'Arcade', isInbuilt: true, thumbnail: 'thumb.png', controlsHint: 'Keys' },
    ];
    const report = validateGamesCatalog(mockGames);
    assert.equal(report.isValid, false);
    assert.ok(report.errors.some((e) => e.includes('missing non-empty srcDoc')));
  });
});
