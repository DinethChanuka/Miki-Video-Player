import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { CINEMA_LINKS } from '../src/utils/cinemaLinks.ts';

describe('Task 5: Anime Sites & High-Level Cinema Error Handling Audit', () => {
  const browserModalPath = resolve(process.cwd(), 'src/components/hud/WebBrowserModal.tsx');
  const browserModalCode = readFileSync(browserModalPath, 'utf-8');

  it('verifies CINEMA_LINKS contains dedicated Anime streaming sites', () => {
    const animeSites = CINEMA_LINKS.filter((c) => c.category === 'Anime');
    assert.ok(
      animeSites.length >= 4,
      `Expected at least 4 anime portals, found ${animeSites.length}`
    );

    const names = animeSites.map((s) => s.name.toLowerCase());
    const hasCrunchyroll = names.some((n) => n.includes('crunchyroll'));
    const hasHiAnime = names.some((n) => n.includes('hianime') || n.includes('zoro'));
    const hasAnimePahe = names.some((n) => n.includes('animepahe'));
    const hasAniWave = names.some((n) => n.includes('aniwave') || n.includes('9anime'));

    assert.ok(hasCrunchyroll, 'Must include Crunchyroll');
    assert.ok(hasHiAnime, 'Must include HiAnime');
    assert.ok(hasAnimePahe, 'Must include AnimePahe');
    assert.ok(hasAniWave, 'Must include AniWave');
  });

  it('verifies all anime and cinema sites have valid and unique logos', () => {
    const seen = new Set();
    const dupes = [];

    for (const site of CINEMA_LINKS) {
      assert.ok(site.logoUrl, `Site ${site.name} must have a logo`);
      if (seen.has(site.logoUrl)) {
        dupes.push(site.logoUrl);
      }
      seen.add(site.logoUrl);
    }

    assert.equal(dupes.length, 0, `Duplicate logos in CINEMA_LINKS: ${dupes.join(', ')}`);
  });

  it('verifies WebBrowserModal handles frame errors with seamless fallback actions', () => {
    assert.ok(
      browserModalCode.includes('iframeError') || browserModalCode.includes('frame-ancestor'),
      'WebBrowserModal must detect iframe embedding blocks'
    );
    assert.ok(
      browserModalCode.includes('browserViewAction'),
      'WebBrowserModal must provide native web browser handoff'
    );
  });
});

