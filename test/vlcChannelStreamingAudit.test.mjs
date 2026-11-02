import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

describe('VLC-Inspired Live Channel Streaming Audit', () => {
  it('verifies channelCatalog exports curated channels and robust M3U/M3U8 parser', async () => {
    const { CURATED_CHANNELS, parseM3UPlaylist, validateStreamUrl } = await import(
      '../src/utils/channelCatalog.ts'
    );

    assert.ok(Array.isArray(CURATED_CHANNELS), 'CURATED_CHANNELS must be an array');
    assert.ok(CURATED_CHANNELS.length >= 20, `Must have at least 20 curated channels, found ${CURATED_CHANNELS.length}`);

    // Verify channel structure
    for (const ch of CURATED_CHANNELS) {
      assert.ok(ch.id, `Channel must have id: ${JSON.stringify(ch)}`);
      assert.ok(ch.name, `Channel must have name: ${ch.id}`);
      assert.ok(ch.category, `Channel must have category: ${ch.id}`);
      assert.ok(ch.streamUrl, `Channel must have streamUrl: ${ch.id}`);
      assert.ok(
        ch.streamUrl.startsWith('http://') || ch.streamUrl.startsWith('https://'),
        `Channel streamUrl must be valid HTTP/HTTPS: ${ch.streamUrl}`
      );
    }

    // Verify M3U Playlist Parser (VLC format)
    assert.equal(typeof parseM3UPlaylist, 'function', 'parseM3UPlaylist must be exported');
    const sampleM3U = `#EXTM3U
#EXTINF:-1 tvg-id="bbc1" tvg-name="BBC One" tvg-logo="https://example.com/bbc.png" group-title="News",BBC One HD
https://stream.example.com/bbc1.m3u8
#EXTINF:-1 tvg-id="cnn" group-title="News",CNN International
https://stream.example.com/cnn.m3u8`;

    const parsed = parseM3UPlaylist(sampleM3U);
    assert.equal(parsed.length, 2, 'Should parse 2 channels from sample M3U');
    assert.equal(parsed[0].name, 'BBC One HD');
    assert.equal(parsed[0].category, 'News');
    assert.equal(parsed[0].logo, 'https://example.com/bbc.png');
    assert.equal(parsed[0].streamUrl, 'https://stream.example.com/bbc1.m3u8');
    assert.equal(parsed[1].name, 'CNN International');
    assert.equal(parsed[1].streamUrl, 'https://stream.example.com/cnn.m3u8');

    // Verify stream validator
    assert.equal(typeof validateStreamUrl, 'function', 'validateStreamUrl must be exported');
    assert.ok(validateStreamUrl('https://example.com/live.m3u8'));
    assert.ok(validateStreamUrl('http://iptv.provider.com:8080/stream'));
    assert.strictEqual(validateStreamUrl('javascript:alert(1)'), false);
    assert.strictEqual(validateStreamUrl(''), false);
  });

  it('verifies LiveChannelsModal component exists and provides network stream input & category filters', () => {
    const modalPath = path.join(rootDir, 'src/components/hud/LiveChannelsModal.tsx');
    assert.ok(fs.existsSync(modalPath), 'LiveChannelsModal.tsx must exist');

    const code = fs.readFileSync(modalPath, 'utf8');
    assert.match(code, /LiveChannelsModal/i, 'Must export LiveChannelsModal');
    assert.match(code, /parseM3UPlaylist/i, 'Must use parseM3UPlaylist for custom playlist import');
    assert.match(code, /onPlayChannel|openMedia/i, 'Must handle channel playback');
    assert.match(code, /search|category/i, 'Must support searching and filtering channels');
  });

  it('verifies Channels item is wired in ApplicationMenu and App.tsx', () => {
    const menuPath = path.join(rootDir, 'src/components/hud/ApplicationMenu.tsx');
    const menuCode = fs.readFileSync(menuPath, 'utf8');
    assert.match(menuCode, /Channels|onOpenChannels/i, 'ApplicationMenu must feature Channels');

    const appPath = path.join(rootDir, 'src/App.tsx');
    const appCode = fs.readFileSync(appPath, 'utf8');
    assert.match(appCode, /LiveChannelsModal/i, 'App.tsx must render LiveChannelsModal');
  });
});
