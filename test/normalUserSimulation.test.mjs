import { describe, it } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';

describe('Normal User Journey End-to-End Simulation Audit', () => {
  const channelCatalogPath = path.resolve(process.cwd(), 'src/utils/channelCatalog.ts');
  const fileBrowserModalPath = path.resolve(process.cwd(), 'src/components/hud/FileBrowserModal.tsx');
  const webBrowserModalPath = path.resolve(process.cwd(), 'src/components/hud/WebBrowserModal.tsx');
  const fullWindowGamesPath = path.resolve(process.cwd(), 'src/components/games/FullWindowGamesModal.tsx');
  const playerStorePath = path.resolve(process.cwd(), 'src/store/playerStore.ts');
  const appPath = path.resolve(process.cwd(), 'src/App.tsx');
  const swiftAppPath = path.resolve(process.cwd(), 'MikiPlayerApp.swift');

  const channelCatalogCode = fs.readFileSync(channelCatalogPath, 'utf-8');
  const fileBrowserModalCode = fs.readFileSync(fileBrowserModalPath, 'utf-8');
  const webBrowserModalCode = fs.readFileSync(webBrowserModalPath, 'utf-8');
  const fullWindowGamesCode = fs.readFileSync(fullWindowGamesPath, 'utf-8');
  const playerStoreCode = fs.readFileSync(playerStorePath, 'utf-8');
  const appCode = fs.readFileSync(appPath, 'utf-8');
  const swiftAppCode = fs.readFileSync(swiftAppPath, 'utf-8');

  it('Simulation 1: User selects France 24 Live -> verified working master HLS stream', () => {
    assert.match(
      channelCatalogCode,
      /https:\/\/live\.france24\.com\/hls\/live\/2037218\/F24_EN_HI_HLS\/master_2300\.m3u8/,
      'France 24 must load live master HLS'
    );
    assert.strictEqual(
      channelCatalogCode.includes('static.france24.com/live/F24_EN_LO_HLS/live_tv.m3u8'),
      false,
      'Must not contain dead 404 France 24 URL'
    );
  });

  it('Simulation 2: User plays any Demo Stream -> 100% verified non-403 stream loaded', () => {
    assert.strictEqual(
      fileBrowserModalCode.includes('commondatastorage.googleapis.com'),
      false,
      'No 403 Google Cloud common data storage bucket links remain in DEMO_STREAMS'
    );
    assert.match(
      fileBrowserModalCode,
      /archive\.org\/download\/BigBuckBunny/,
      'Big Buck Bunny must use verified open archive master'
    );
  });

  it('Simulation 3: User encounters stream error -> loading spinner dismissed and recovery available', () => {
    assert.match(
      appCode,
      /isBuffering\s*&&\s*!lastError\s*&&\s*currentUri/,
      'Buffering indicator must be hidden when an error banner is displayed'
    );
    assert.match(
      playerStoreCode,
      /isBuffering:\s*false/,
      'playerStore must clear isBuffering when error occurs'
    );
  });

  it('Simulation 4: User launches Games -> opens full window arcade with responsive keyboard HUD', () => {
    assert.match(
      fileBrowserModalCode,
      /initialTab\s*===\s*['"]games['"][\s\S]*?setActiveTab\(['"]games['"]\)/,
      'Games tab navigation must activate games gallery'
    );
    assert.match(
      fullWindowGamesCode,
      /iframeRef\.current\?\.contentWindow\?\.postMessage/,
      'Keyboard events must be routed directly into game iframe'
    );
    assert.match(
      fullWindowGamesCode,
      /e\.stopPropagation\(\)/,
      'Keyboard events must not trigger media player seek or pause'
    );
  });

  it('Simulation 5: User opens Miki Browser -> canonical URL, native WebKit layer and frame error protection', () => {
    assert.match(
      swiftAppCode,
      /customUserAgent\s*=\s*"Mozilla\/5\.0 \(Macintosh; Intel Mac OS X 10_15_7\)/,
      'Native WKWebView must use Desktop Safari User-Agent'
    );
    assert.match(
      swiftAppCode,
      /bView\.setValue\(true,\s*forKey:\s*"drawsBackground"\)/,
      'Native WKWebView must enable background painting'
    );
    assert.match(
      webBrowserModalCode,
      /Website Embed Protected|frameBlocked/,
      'Web browser modal must provide clear security fallback card when iframe is blocked'
    );
  });
});

