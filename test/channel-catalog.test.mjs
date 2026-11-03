import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { parseM3UPlaylist } from '../src/utils/channelCatalog.ts';

describe('Channel Catalog & LiveChannelsModal Enhancements Audit', () => {
  const rootDir = process.cwd();
  const modalPath = path.join(rootDir, 'src', 'components', 'hud', 'LiveChannelsModal.tsx');

  it('verifies LiveChannelsModal includes Movies in category filter buttons', () => {
    const code = fs.readFileSync(modalPath, 'utf-8');
    assert.match(
      code,
      /CATEGORIES[\s\S]*?'Movies'/,
      'LiveChannelsModal CATEGORIES array must include Movies'
    );
  });

  it('verifies parseM3UPlaylist categorizes channels into diverse categories and preserves them', () => {
    const sampleM3u = `#EXTM3U
#EXTINF:-1 group-title="News",News 24
https://example.com/news.m3u8
#EXTINF:-1 group-title="Movies",Cinema HD
https://example.com/movie.m3u8
#EXTINF:-1 group-title="Sports",Live Stadium
https://example.com/sports.m3u8`;

    const parsed = parseM3UPlaylist(sampleM3u);
    assert.equal(parsed.length, 3);
    assert.equal(parsed[0].category, 'News');
    assert.equal(parsed[1].category, 'Movies');
    assert.equal(parsed[2].category, 'Sports');
  });

  it('verifies LiveChannelsModal does not force all imported channels into Custom category exclusively', () => {
    const code = fs.readFileSync(modalPath, 'utf-8');
    assert.doesNotMatch(
      code,
      /setSelectedCategory\(['"]Custom['"]\)/,
      'Importing M3U playlist should set category to All so all imported channels are visible across their true categories'
    );
  });
});
