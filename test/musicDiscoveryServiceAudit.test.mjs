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

  it('verifies expanded catalog contains at least 36-40 songs across all 4 platforms', async () => {
    const { MUSIC_DISCOVERY_CATALOG } = await import(`file://${servicePath}`);
    assert.ok(Array.isArray(MUSIC_DISCOVERY_CATALOG), 'Catalog must be an array');
    assert.ok(MUSIC_DISCOVERY_CATALOG.length >= 36, `Catalog has ${MUSIC_DISCOVERY_CATALOG.length}, expected >= 36`);

    const jamendo = MUSIC_DISCOVERY_CATALOG.filter((t) => t.platform === 'jamendo');
    const soundcloud = MUSIC_DISCOVERY_CATALOG.filter((t) => t.platform === 'soundcloud');
    const bandcamp = MUSIC_DISCOVERY_CATALOG.filter((t) => t.platform === 'bandcamp');
    const audiomack = MUSIC_DISCOVERY_CATALOG.filter((t) => t.platform === 'audiomack');

    assert.ok(jamendo.length >= 9, 'Must contain at least 9 Jamendo songs');
    assert.ok(soundcloud.length >= 9, 'Must contain at least 9 SoundCloud songs');
    assert.ok(bandcamp.length >= 9, 'Must contain at least 9 Bandcamp songs');
    assert.ok(audiomack.length >= 9, 'Must contain at least 9 Audiomack songs');
  });

  it('verifies getPlatformSearchUrl and searchMusicOnline generate live query links', async () => {
    const { getPlatformSearchUrl, searchMusicOnline } = await import(`file://${servicePath}`);

    const scUrl = getPlatformSearchUrl('soundcloud', 'chillhop beats');
    assert.match(scUrl, /soundcloud\.com\/search\/sounds\?q=chillhop%20beats/);

    const jmUrl = getPlatformSearchUrl('jamendo', 'ambient');
    assert.match(jmUrl, /jamendo\.com\/en\/catalog\?query=ambient/);

    const onlineResults = searchMusicOnline('cyberpunk', 'all');
    assert.ok(onlineResults.length > 0);
    // Should have live search result badges
    assert.ok(onlineResults.some((t) => t.isLiveUpdate === true));
  });

  it('verifies Jamendo tracks provide direct playable audio stream URLs', async () => {
    const { MUSIC_DISCOVERY_CATALOG } = await import(`file://${servicePath}`);
    const jamendoTracks = MUSIC_DISCOVERY_CATALOG.filter((t) => t.platform === 'jamendo');
    for (const track of jamendoTracks) {
      assert.ok(
        track.streamUrl && track.streamUrl.startsWith('http'),
        `Jamendo track ${track.title} must have direct stream URL`
      );
    }
  });

  it('verifies fetchLiveMusicDiscovery returns a Promise resolving to catalog items', async () => {
    const { fetchLiveMusicDiscovery } = await import(`file://${servicePath}`);
    const liveTracks = await fetchLiveMusicDiscovery();
    assert.ok(Array.isArray(liveTracks));
    assert.ok(liveTracks.length >= 36);
  });
});
