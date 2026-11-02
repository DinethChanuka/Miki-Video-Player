import { describe, it } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

describe('Dedicated Social Section & Expanded Free Movie Catalog Audit', () => {
  it('verifies CINEMA_LINKS does not contain social platforms and contains at least 12 movie portals', async () => {
    const { CINEMA_LINKS } = await import('../src/utils/cinemaLinks.ts');

    const ids = CINEMA_LINKS.map(item => item.id);
    assert.strictEqual(ids.includes('tiktok'), false, 'Cinema links must not contain TikTok');
    assert.strictEqual(ids.includes('instagram'), false, 'Cinema links must not contain Instagram');
    assert.strictEqual(ids.includes('facebook'), false, 'Cinema links must not contain Facebook');

    assert.ok(
      CINEMA_LINKS.length >= 12,
      `Expected at least 12 free cinema streaming portals, found ${CINEMA_LINKS.length}`
    );

    const names = CINEMA_LINKS.map(item => item.name.toLowerCase());
    assert.ok(names.some(n => n.includes('cinesubz')));
    assert.ok(names.some(n => n.includes('fmovies')));
    assert.ok(names.some(n => n.includes('123movies')));
    assert.ok(names.some(n => n.includes('bflix')));
    assert.ok(names.some(n => n.includes('soap2day')));
    assert.ok(names.some(n => n.includes('solarmovie')));
    assert.ok(names.some(n => n.includes('flixtor')));
  });

  it('verifies SOCIAL_LINKS defines dedicated TikTok, Instagram, and Facebook portals with browseUrl', async () => {
    const { SOCIAL_LINKS } = await import('../src/utils/socialLinks.ts');

    const ids = SOCIAL_LINKS.map(item => item.id);
    assert.ok(ids.includes('tiktok'));
    assert.ok(ids.includes('instagram'));
    assert.ok(ids.includes('facebook'));

    for (const item of SOCIAL_LINKS) {
      assert.ok(item.browseUrl || item.url, `${item.id} must define a browse URL`);
      assert.ok(item.logoUrl, `${item.id} must define an official brand logoUrl`);
    }
  });

  it('verifies FileBrowserModal renders dedicated Social tab with Browse button', () => {
    const modalCode = fs.readFileSync(path.join(rootDir, 'src/components/hud/FileBrowserModal.tsx'), 'utf-8');

    // Must have social tab
    assert.match(modalCode, /activeTab === ['"]social['"]/i);
    // Must render Browse button
    assert.match(modalCode, /Browse/i);
  });
});
