import { describe, it } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';

describe('Task 2: Real Visualized Preview Images for Games Audit', () => {
  it('verifies src/utils/gameThumbnails.ts exists and provides real visualized preview graphics', async () => {
    const thumbnailsPath = path.resolve(process.cwd(), 'src/utils/gameThumbnails.ts');
    assert.ok(fs.existsSync(thumbnailsPath), 'src/utils/gameThumbnails.ts must exist');

    const { getGameThumbnailUrl } = await import('../src/utils/gameThumbnails.ts');
    assert.equal(typeof getGameThumbnailUrl, 'function', 'getGameThumbnailUrl must be a function');

    const pacmanPreview = getGameThumbnailUrl('pacman');
    assert.ok(pacmanPreview.startsWith('data:image/svg+xml'), 'Preview must be an SVG data URI');
    assert.match(decodeURIComponent(pacmanPreview), /pacman|ghost|<svg/i, 'Preview must contain authentic SVG artwork');
  });

  it('verifies all 50+ games in GAMES_CATALOG use authentic visualized SVG preview thumbnails without generic stock images', async () => {
    const { GAMES_CATALOG } = await import('../src/utils/gamesCatalog.ts');
    assert.ok(GAMES_CATALOG.length >= 50, 'Catalog must contain 50+ games');

    for (const game of GAMES_CATALOG) {
      assert.ok(
        game.thumbnail && (game.thumbnail.startsWith('data:image/svg+xml') || game.thumbnail.startsWith('/')),
        `Game "${game.title}" (${game.id}) must have a visualized local/SVG preview thumbnail, got: ${game.thumbnail.slice(0, 40)}`
      );
      assert.ok(
        !game.thumbnail.includes('images.unsplash.com'),
        `Game "${game.title}" (${game.id}) must not use generic unsplash stock photos`
      );
    }
  });
});

