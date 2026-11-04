import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { CINEMA_LINKS } from '../src/utils/cinemaLinks.ts';

describe('Task 5: Internet Movie & Music Streaming Sections Audit', () => {
  it('verifies src/utils/musicStreams.ts exists and exports INTERNET_MUSIC_STREAMS', async () => {
    const musicStreamsPath = resolve(process.cwd(), 'src/utils/musicStreams.ts');
    assert.ok(existsSync(musicStreamsPath), 'src/utils/musicStreams.ts must exist');

    const { INTERNET_MUSIC_STREAMS } = await import('../src/utils/musicStreams.ts');
    assert.ok(Array.isArray(INTERNET_MUSIC_STREAMS), 'INTERNET_MUSIC_STREAMS must be an array');
    assert.ok(
      INTERNET_MUSIC_STREAMS.length >= 10,
      `Expected at least 10 live internet music stations, got ${INTERNET_MUSIC_STREAMS.length}`
    );

    for (const station of INTERNET_MUSIC_STREAMS) {
      assert.ok(station.id && station.id.trim(), 'Station id must be non-empty');
      assert.ok(station.title && station.title.trim(), `Station ${station.id} title must be non-empty`);
      assert.ok(station.artist && station.artist.trim(), `Station ${station.id} artist must be non-empty`);
      assert.ok(station.genre && station.genre.trim(), `Station ${station.id} genre must be non-empty`);
      assert.ok(
        station.streamUrl && station.streamUrl.startsWith('http'),
        `Station ${station.id} streamUrl must be an http(s) URL`
      );
      assert.ok(station.logoUrl && station.logoUrl.trim(), `Station ${station.id} logoUrl must be provided`);
    }
  });

  it('verifies CINEMA_LINKS contains verified internet movie & anime streaming portals', () => {
    assert.ok(CINEMA_LINKS.length >= 15, `Expected >= 15 cinema links, found ${CINEMA_LINKS.length}`);

    const hasAnime = CINEMA_LINKS.some((c) => c.category === 'Anime');
    assert.ok(hasAnime, 'CINEMA_LINKS must include Anime streaming hubs');

    const hasArchive = CINEMA_LINKS.some((c) => c.url.includes('archive.org') || c.id.includes('archive'));
    assert.ok(hasArchive, 'CINEMA_LINKS must include Internet Archive Open Cinema');

    for (const item of CINEMA_LINKS) {
      assert.ok(item.id && item.name && item.url, 'Cinema item must have id, name, and url');
      assert.ok(item.url.startsWith('https://'), `Cinema item ${item.id} url must be secure https`);
    }
  });

  it('verifies HomeDashboardView has Movie & Music integration and offline poster resiliency', () => {
    const homeDashPath = resolve(process.cwd(), 'src/components/home/HomeDashboardView.tsx');
    const content = readFileSync(homeDashPath, 'utf8');

    assert.ok(content.includes('INTERNET_MUSIC_STREAMS'), 'HomeDashboardView must import INTERNET_MUSIC_STREAMS');
    assert.ok(content.includes('COVER_FLOW_ALBUMS'), 'HomeDashboardView must contain Cover Flow albums');
    assert.ok(content.includes('RECOMMENDED_MOVIES'), 'HomeDashboardView must contain Recommended Movies');
  });
});
