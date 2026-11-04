import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

describe('Multi-Platform Music Discovery Service Audit', async () => {
  const servicePath = path.resolve(process.cwd(), 'src/utils/musicDiscoveryService.ts');

  it('verifies src/utils/musicDiscoveryService.ts exists and exports catalog and search functions', async () => {
    assert.ok(fs.existsSync(servicePath), 'src/utils/musicDiscoveryService.ts must exist');
    const serviceCode = fs.readFileSync(servicePath, 'utf8');

    assert.match(serviceCode, /export\s+interface\s+MusicTrack/, 'Must export MusicTrack interface');
    assert.match(serviceCode, /export\s+type\s+MusicPlatform/, 'Must export MusicPlatform type');
    assert.match(serviceCode, /export\s+const\s+MUSIC_DISCOVERY_CATALOG/, 'Must export MUSIC_DISCOVERY_CATALOG');
    assert.match(serviceCode, /export\s+function\s+searchMusicTracks/, 'Must export searchMusicTracks');
    assert.match(serviceCode, /export\s+async\s+function\s+fetchLiveMusicDiscovery/, 'Must export fetchLiveMusicDiscovery');
  });

  it('verifies catalog contains songs across all 4 platforms: jamendo, soundcloud, bandcamp, audiomack', async () => {
    const { MUSIC_DISCOVERY_CATALOG } = await import(`file://${servicePath}`);
    assert.ok(Array.isArray(MUSIC_DISCOVERY_CATALOG), 'Catalog must be an array');
    assert.ok(MUSIC_DISCOVERY_CATALOG.length >= 16, 'Catalog must contain at least 16 curated tracks');

    const platforms = new Set(MUSIC_DISCOVERY_CATALOG.map((t) => t.platform));
    assert.ok(platforms.has('jamendo'), 'Must contain Jamendo songs');
    assert.ok(platforms.has('soundcloud'), 'Must contain SoundCloud songs');
    assert.ok(platforms.has('bandcamp'), 'Must contain Bandcamp songs');
    assert.ok(platforms.has('audiomack'), 'Must contain Audiomack songs');
  });

  it('verifies all tracks have complete metadata including cover images and page links', async () => {
    const { MUSIC_DISCOVERY_CATALOG } = await import(`file://${servicePath}`);
    for (const track of MUSIC_DISCOVERY_CATALOG) {
      assert.ok(track.id && track.id.trim().length > 0, `Track ${track.id} must have non-empty ID`);
      assert.ok(track.title && track.title.trim().length > 0, `Track ${track.id} must have title`);
      assert.ok(track.artist && track.artist.trim().length > 0, `Track ${track.id} must have artist`);
      assert.ok(
        track.coverUrl && (track.coverUrl.startsWith('http') || track.coverUrl.startsWith('data:image') || track.coverUrl.startsWith('/')),
        `Track ${track.id} must have valid coverUrl`
      );
      assert.ok(
        track.pageUrl && track.pageUrl.startsWith('http'),
        `Track ${track.id} must have valid web pageUrl link`
      );
      assert.ok(track.genre && track.genre.trim().length > 0, `Track ${track.id} must have genre`);
      assert.ok(['jamendo', 'soundcloud', 'bandcamp', 'audiomack'].includes(track.platform));
    }
  });

  it('verifies Jamendo tracks provide direct playable audio stream URLs', async () => {
    const { MUSIC_DISCOVERY_CATALOG } = await import(`file://${servicePath}`);
    const jamendoTracks = MUSIC_DISCOVERY_CATALOG.filter((t) => t.platform === 'jamendo');
    assert.ok(jamendoTracks.length >= 4, 'Must have at least 4 Jamendo tracks');
    for (const track of jamendoTracks) {
      assert.ok(
        track.streamUrl && track.streamUrl.startsWith('http'),
        `Jamendo track ${track.title} must have direct stream URL`
      );
    }
  });

  it('verifies searchMusicTracks filters accurately by query string and platform', async () => {
    const { MUSIC_DISCOVERY_CATALOG, searchMusicTracks } = await import(`file://${servicePath}`);
    // 1. All results with empty query
    const all = searchMusicTracks('', 'all');
    assert.equal(all.length, MUSIC_DISCOVERY_CATALOG.length);

    // 2. Filter by platform
    const soundcloudOnly = searchMusicTracks('', 'soundcloud');
    assert.ok(soundcloudOnly.length > 0);
    assert.ok(soundcloudOnly.every((t) => t.platform === 'soundcloud'));

    const bandcampOnly = searchMusicTracks('', 'bandcamp');
    assert.ok(bandcampOnly.length > 0);
    assert.ok(bandcampOnly.every((t) => t.platform === 'bandcamp'));

    const audiomackOnly = searchMusicTracks('', 'audiomack');
    assert.ok(audiomackOnly.length > 0);
    assert.ok(audiomackOnly.every((t) => t.platform === 'audiomack'));

    // 3. Search by title/artist
    const firstTrack = MUSIC_DISCOVERY_CATALOG[0];
    const searchTitle = searchMusicTracks(firstTrack.title.slice(0, 4), 'all');
    assert.ok(searchTitle.some((t) => t.id === firstTrack.id));
  });

  it('verifies fetchLiveMusicDiscovery returns a Promise resolving to catalog items', async () => {
    const { fetchLiveMusicDiscovery } = await import(`file://${servicePath}`);
    const liveTracks = await fetchLiveMusicDiscovery();
    assert.ok(Array.isArray(liveTracks));
    assert.ok(liveTracks.length > 0);
  });
});
