import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  isBlockedUrl,
  getCleanUrl,
  generateAdBlockScript,
  AD_BLOCK_DOMAINS,
} from '../src/utils/adBlockFilter.ts';

describe('Ad-Block & Popup Suppression Shield Engine', () => {
  it('detects and blocks prominent ad networks and popup trackers', () => {
    assert.equal(isBlockedUrl('https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js'), true);
    assert.equal(isBlockedUrl('https://adservice.google.com/adsid/integrator.js'), true);
    assert.equal(isBlockedUrl('https://securepubads.g.doubleclick.net/gampad/ads'), true);
    assert.equal(isBlockedUrl('https://servedby.adbutler.com/app.js'), true);
    assert.equal(isBlockedUrl('https://syndication.exoclick.com/splash.php'), true);
    assert.equal(isBlockedUrl('https://cdn.popcash.net/pop.js'), true);
    assert.equal(isBlockedUrl('https://adsterra.com/tag.js'), true);
    assert.equal(isBlockedUrl('https://propellerads.com/interstitial'), true);
  });

  it('allows legitimate video, social, and movie streaming domains', () => {
    assert.equal(isBlockedUrl('https://www.youtube.com/watch?v=dQw4w9WgXcQ'), false);
    assert.equal(isBlockedUrl('https://www.tiktok.com/@creator/video/12345'), false);
    assert.equal(isBlockedUrl('https://www.instagram.com/reel/C21AbCdEfGh/'), false);
    assert.equal(isBlockedUrl('https://www.facebook.com/watch?v=999'), false);
    assert.equal(isBlockedUrl('https://cinesubz.co/movies/kingdom-2024'), false);
  });

  it('cleans and normalizes entered search queries and URLs', () => {
    assert.equal(getCleanUrl('youtube.com'), 'https://youtube.com');
    assert.equal(getCleanUrl('https://cinesubz.co/'), 'https://cinesubz.co/');
    assert.equal(getCleanUrl('marvel deadpool trailer'), 'https://www.google.com/search?q=marvel+deadpool+trailer');
  });

  it('generates protective script that stubs window.open and blocks popup traps', () => {
    const script = generateAdBlockScript();
    assert.ok(script.includes('window.open = function'));
    assert.ok(script.includes('window.alert = function'));
    assert.ok(AD_BLOCK_DOMAINS.length > 50);
  });
});
