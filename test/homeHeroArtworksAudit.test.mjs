import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

describe('Task 1: Themed Right-Side Hero Artwork for All Home Sections Audit', () => {
  const repoRoot = process.cwd();
  const heroArtworksPath = path.join(repoRoot, 'src/utils/heroArtworks.ts');
  const homeDashboardPath = path.join(repoRoot, 'src/components/home/HomeDashboardView.tsx');

  test('heroArtworks.ts exists and exports HERO_ARTWORKS with all 6 required section artworks', async () => {
    assert.ok(fs.existsSync(heroArtworksPath), 'src/utils/heroArtworks.ts must exist');
    const heroCode = fs.readFileSync(heroArtworksPath, 'utf8');

    assert.match(heroCode, /export\s+const\s+HERO_ARTWORKS/, 'Must export HERO_ARTWORKS dictionary');
    assert.match(heroCode, /spiderMan:/, 'Must contain spiderMan artwork');
    assert.match(heroCode, /soulConductor:/, 'Must contain soulConductor artwork');
    assert.match(heroCode, /broadcastCenter:/, 'Must contain broadcastCenter artwork');
    assert.match(heroCode, /cyberArcade:/, 'Must contain cyberArcade artwork');
    assert.match(heroCode, /audioSynthesizer:/, 'Must contain audioSynthesizer artwork');
    assert.match(heroCode, /animeCyberpunk:/, 'Must contain animeCyberpunk artwork');
    assert.match(heroCode, /export\s+function\s+getHeroArtworkForSection/, 'Must export getHeroArtworkForSection');
  });

  test('HomeDashboardView.tsx imports heroArtworks and renders the right-side visual banner', () => {
    assert.ok(fs.existsSync(homeDashboardPath), 'HomeDashboardView.tsx must exist');
    const homeCode = fs.readFileSync(homeDashboardPath, 'utf8');

    assert.match(
      homeCode,
      /import\s+.*(?:HERO_ARTWORKS|getHeroArtworkForSection).*from\s+['"]\.\.\/\.\.\/utils\/heroArtworks['"]/,
      'HomeDashboardView must import from heroArtworks'
    );

    assert.match(
      homeCode,
      /HERO_ARTWORKS|getHeroArtworkForSection/,
      'HomeDashboardView must render the right-side artwork'
    );

    // Verify right-side positioning and fade gradient overlay
    assert.match(
      homeCode,
      /absolute\s+right-0|relative\s+w-full|flex\s+items-center\s+justify-end|col-span/,
      'Hero banner must have right-side container positioning'
    );
  });
});
