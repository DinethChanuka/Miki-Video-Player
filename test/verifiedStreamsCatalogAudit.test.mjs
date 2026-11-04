import { describe, it } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';

describe('Task 1: Verified Streams and Channels Catalog Audit', () => {
  const channelCatalogPath = path.resolve(process.cwd(), 'src/utils/channelCatalog.ts');
  const fileBrowserModalPath = path.resolve(process.cwd(), 'src/components/hud/FileBrowserModal.tsx');

  const channelCatalogCode = fs.readFileSync(channelCatalogPath, 'utf-8');
  const fileBrowserModalCode = fs.readFileSync(fileBrowserModalPath, 'utf-8');

  it('verifies no 403 Google Cloud common data storage bucket links remain in channelCatalog', () => {
    assert.strictEqual(
      channelCatalogCode.includes('commondatastorage.googleapis.com'),
      false,
      'channelCatalog.ts must not contain broken 403 commondatastorage.googleapis.com links'
    );
  });

  it('verifies France 24 English Live uses active 200 OK master HLS URL', () => {
    assert.match(
      channelCatalogCode,
      /https:\/\/live\.france24\.com\/hls\/live\/2037218\/F24_EN_HI_HLS\/master_2300\.m3u8/,
      'France 24 must use the working high-definition master HLS stream'
    );
    assert.strictEqual(
      channelCatalogCode.includes('static.france24.com/live/F24_EN_LO_HLS/live_tv.m3u8'),
      false,
      'channelCatalog.ts must not use dead 404 static.france24.com URL'
    );
  });

  it('verifies no 403 Google Cloud links remain in DEMO_STREAMS of FileBrowserModal', () => {
    assert.strictEqual(
      fileBrowserModalCode.includes('commondatastorage.googleapis.com'),
      false,
      'FileBrowserModal.tsx DEMO_STREAMS must not contain broken 403 commondatastorage links'
    );
  });

  it('verifies DEMO_STREAMS is purged from FileBrowserModal', () => {
    assert.strictEqual(
      fileBrowserModalCode.includes("activeTab === 'demos'"),
      false,
      'FileBrowserModal must not have demos tab'
    );
    assert.strictEqual(
      fileBrowserModalCode.includes('demo-bbb'),
      false,
      'FileBrowserModal must not contain demo-bbb'
    );
  });
});

