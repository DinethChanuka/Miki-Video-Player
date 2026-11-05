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
    assert.match(serviceCode, /export\s+function\s+searchMusicOnline/, 'Must export searchMusicOnline');
    assert.match(serviceCode, /export\s+function\s+getPlatformSearchUrl/, 'Must export getPlatformSearchUrl');
    assert.match(serviceCode, /export\s+async\s+function\s+fetchLiveMusicDiscovery/, 'Must export fetchLiveMusicDiscovery');
  });

  it('verifies expanded catalog contains exclusively YouTube Music full-length tracks', async () => {
    const { MUSIC_DISCOVERY_CATALOG } = await import(`file://${servicePath}`);
    assert.ok(Array.isArray(MUSIC_DISCOVERY_CATALOG), 'Catalog must be an array');
    assert.ok(MUSIC_DISCOVERY_CATALOG.length >= 20, `Catalog has ${MUSIC_DISCOVERY_CATALOG.length}, expected >= 20`);

    const nonYouTube = MUSIC_DISCOVERY_CATALOG.filter((t) => t.platform !== 'youtube');
    assert.equal(nonYouTube.length, 0, 'Catalog must not contain any third-party platforms (Jamendo, SoundCloud, Bandcamp, Audiomack)');

    const youtubeTracks = MUSIC_DISCOVERY_CATALOG.filter((t) => t.platform === 'youtube');
    assert.ok(youtubeTracks.length >= 20, 'Must contain at least 20 verified YouTube Music songs');

    for (const track of youtubeTracks) {
      assert.ok(
        track.streamUrl && track.streamUrl.includes('youtube.com/watch?v='),
        `YouTube track ${track.title} must have direct youtube.com/watch URL`
      );
      assert.ok(
        track.coverUrl && (track.coverUrl.includes('youtube.com') || track.coverUrl.includes('unsplash.com')),
        `YouTube track ${track.title} must have valid cover artwork`
      );
    }
  });

  it('verifies getPlatformSearchUrl and searchMusicOnline generate live query links', async () => {
    const { getPlatformSearchUrl, searchMusicOnline } = await import(`file://${servicePath}`);

    const ytUrl = getPlatformSearchUrl('youtube', 'saiyaara');
    assert.match(ytUrl, /music\.youtube\.com\/search\?q=saiyaara/);

    const fallbackUrl = getPlatformSearchUrl('soundcloud', 'chillhop beats');
    assert.match(fallbackUrl, /music\.youtube\.com\/search\?q=chillhop%20beats/);

    const onlineResults = searchMusicOnline('cyberpunk', 'all');
    assert.ok(onlineResults.length > 0);
    // Should have live search result badges
    assert.ok(onlineResults.some((t) => t.isLiveUpdate === true));
  });

  it('verifies all catalog tracks provide direct playable YouTube stream URLs', async () => {
    const { MUSIC_DISCOVERY_CATALOG } = await import(`file://${servicePath}`);
    for (const track of MUSIC_DISCOVERY_CATALOG) {
      assert.ok(
        track.streamUrl && track.streamUrl.startsWith('http'),
        `Track ${track.title} must have direct stream URL`
      );
    }
  });

  it('verifies fetchLiveMusicDiscovery returns a Promise resolving to catalog items', async () => {
    const { fetchLiveMusicDiscovery } = await import(`file://${servicePath}`);
    const liveTracks = await fetchLiveMusicDiscovery();
    assert.ok(Array.isArray(liveTracks));
    assert.ok(liveTracks.length >= 20);
    assert.ok(liveTracks.every((t) => t.platform === 'youtube'));
  });
});
