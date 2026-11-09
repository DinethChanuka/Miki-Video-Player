import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

describe('Real Artist Profile Pictures Audit', () => {
  const rootDir = process.cwd();
  const artistsDir = path.resolve(rootDir, 'public/artists');
  const mediaPostersFile = path.resolve(rootDir, 'src/utils/mediaPosters.ts');
  const homeViewFile = path.resolve(rootDir, 'src/components/home/HomeDashboardView.tsx');
  const musicPlayerViewFile = path.resolve(rootDir, 'src/components/music/MusicPlayerView.tsx');

  const requiredArtists = [
    'camila_cabello.jpg',
    'camila_cabello_hero.jpg',
    'travis_scott.jpg',
    'billie_eilish.jpg',
    'kanye_west.jpg',
    'nicki_minaj.jpg',
    'the_weeknd.jpg',
    'dua_lipa.jpg',
    'john_legend.jpg',
    'adele.jpg',
    'alicia_keys.jpg',
    'bruno_mars.jpg',
    'sam_smith.jpg',
    'michael_buble.jpg',
    'stevie_wonder.jpg',
  ];

  test('All required real artist portrait images exist in public/artists/ with valid non-zero sizes (> 20KB)', () => {
    assert.ok(fs.existsSync(artistsDir), 'public/artists directory must exist');
    for (const filename of requiredArtists) {
      const filePath = path.join(artistsDir, filename);
      assert.ok(fs.existsSync(filePath), `Artist file ${filename} must exist`);
      const stat = fs.statSync(filePath);
      assert.ok(stat.size > 20 * 1024, `Artist file ${filename} must be > 20KB, got ${stat.size} bytes`);
    }
  });

  test('mediaPosters.ts exports ARTIST_AVATARS mapping all artists to /artists/*.jpg', () => {
    const code = fs.readFileSync(mediaPostersFile, 'utf-8');
    assert.match(code, /export const ARTIST_AVATARS = \{/);
    assert.match(code, /camilaCabello:\s*'\/artists\/camila_cabello\.jpg'/);
    assert.match(code, /camilaCabelloHero:\s*'\/artists\/camila_cabello_hero\.jpg'/);
    assert.match(code, /travisScott:\s*'\/artists\/travis_scott\.jpg'/);
    assert.match(code, /billieEilish:\s*'\/artists\/billie_eilish\.jpg'/);
    assert.match(code, /kanyeWest:\s*'\/artists\/kanye_west\.jpg'/);
    assert.match(code, /nickiMinaj:\s*'\/artists\/nicki_minaj\.jpg'/);
    assert.match(code, /theWeeknd:\s*'\/artists\/the_weeknd\.jpg'/);
    assert.match(code, /duaLipa:\s*'\/artists\/dua_lipa\.jpg'/);
    assert.match(code, /johnLegend:\s*'\/artists\/john_legend\.jpg'/);
    assert.match(code, /adele:\s*'\/artists\/adele\.jpg'/);
    assert.match(code, /aliciaKeys:\s*'\/artists\/alicia_keys\.jpg'/);
    assert.match(code, /brunoMars:\s*'\/artists\/bruno_mars\.jpg'/);
    assert.match(code, /samSmith:\s*'\/artists\/sam_smith\.jpg'/);
  });

  test('HomeDashboardView wires ARTIST_AVATARS to Groovvy 3D Music Hero, Top Artists ribbon, and Top Charts', () => {
    const code = fs.readFileSync(homeViewFile, 'utf-8');
    assert.match(code, /import \{[^}]*ARTIST_AVATARS[^}]*\} from '\.\.\/\.\.\/utils\/mediaPosters'/);
    assert.match(code, /name:\s*'Travis Scott'[\s\S]*?imageUrl:\s*ARTIST_AVATARS\.travisScott/);
    assert.match(code, /name:\s*'Billie Eilish'[\s\S]*?imageUrl:\s*ARTIST_AVATARS\.billieEilish/);
    assert.match(code, /name:\s*'Camila Cabello'[\s\S]*?imageUrl:\s*ARTIST_AVATARS\.camilaCabello/);
    assert.match(code, /name:\s*'Kanye West'[\s\S]*?imageUrl:\s*ARTIST_AVATARS\.kanyeWest/);
    assert.match(code, /name:\s*'Nicki Minaj'[\s\S]*?imageUrl:\s*ARTIST_AVATARS\.nickiMinaj/);
    assert.match(code, /name:\s*'Starboy'[\s\S]*?imageUrl:\s*ARTIST_AVATARS\.theWeeknd/);
    assert.match(code, /src=\{ARTIST_AVATARS\.camilaCabelloHero\}/);
    assert.match(code, /title:\s*'Havana'[\s\S]*?cover:\s*ARTIST_AVATARS\.camilaCabello/);
    assert.match(code, /title:\s*'Jesus Is King'[\s\S]*?cover:\s*ARTIST_AVATARS\.kanyeWest/);
    assert.match(code, /title:\s*'Butterfly Effect'[\s\S]*?cover:\s*ARTIST_AVATARS\.travisScott/);
  });

  test('MusicPlayerView wires ARTIST_AVATARS to John Legend spotlight and FANS_LIKE_TOO', () => {
    const code = fs.readFileSync(musicPlayerViewFile, 'utf-8');
    assert.match(code, /import \{ ARTIST_AVATARS \} from '\.\.\/\.\.\/utils\/mediaPosters'/);
    assert.match(code, /src=\{ARTIST_AVATARS\.johnLegend\}/);
    assert.match(code, /id:\s*'alicia-keys'[\s\S]*?avatarUrl:\s*ARTIST_AVATARS\.aliciaKeys/);
    assert.match(code, /id:\s*'sam-smith'[\s\S]*?avatarUrl:\s*ARTIST_AVATARS\.samSmith/);
    assert.match(code, /id:\s*'adele'[\s\S]*?avatarUrl:\s*ARTIST_AVATARS\.adele/);
    assert.match(code, /id:\s*'bruno-mars'[\s\S]*?avatarUrl:\s*ARTIST_AVATARS\.brunoMars/);
    assert.match(code, /id:\s*'michael-buble'[\s\S]*?avatarUrl:\s*ARTIST_AVATARS\.michaelBuble/);
    assert.match(code, /id:\s*'stevie-wonder'[\s\S]*?avatarUrl:\s*ARTIST_AVATARS\.stevieWonder/);
  });
});
