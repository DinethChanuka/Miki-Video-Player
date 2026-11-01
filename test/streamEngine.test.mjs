import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

describe('External Web Stream Detection & Telemetry Isolation', () => {
  const isExternalWebStream = (uri) => {
    if (!uri) return false;
    return /(?:youtube\.com|youtu\.be|tiktok\.com|instagram\.com)/i.test(uri);
  };

  const parsePlatformType = (uri) => {
    if (!uri) return null;
    if (/(?:youtube\.com|youtu\.be)/i.test(uri)) return 'youtube';
    if (/tiktok\.com/i.test(uri)) return 'tiktok';
    if (/instagram\.com/i.test(uri)) return 'instagram';
    return null;
  };

  it('correctly identifies YouTube URLs as external web stream', () => {
    assert.equal(isExternalWebStream('https://www.youtube.com/watch?v=dQw4w9WgXcQ'), true);
    assert.equal(isExternalWebStream('https://youtu.be/dQw4w9WgXcQ'), true);
    assert.equal(parsePlatformType('https://youtu.be/dQw4w9WgXcQ'), 'youtube');
  });

  it('correctly identifies TikTok URLs as external web stream', () => {
    assert.equal(isExternalWebStream('https://www.tiktok.com/@scout2015/video/6718335390845095173'), true);
    assert.equal(parsePlatformType('https://www.tiktok.com/@scout2015/video/6718335390845095173'), 'tiktok');
  });

  it('correctly identifies Instagram URLs as external web stream', () => {
    assert.equal(isExternalWebStream('https://www.instagram.com/reel/C21AbCdEfGh/'), true);
    assert.equal(parsePlatformType('https://www.instagram.com/reel/C21AbCdEfGh/'), 'instagram');
  });

  it('returns false for local video files and standard HLS streams', () => {
    assert.equal(isExternalWebStream('/Users/d/Movies/sample.mp4'), false);
    assert.equal(isExternalWebStream('https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8'), false);
    assert.equal(parsePlatformType('/Users/d/Movies/sample.mp4'), null);
  });

  it('skips background telemetry state overwrite if external stream is active', () => {
    let storeState = { isPaused: false, positionMs: 5000 };
    const mockHandleTelemetry = (telemetry, activeUri) => {
      if (isExternalWebStream(activeUri)) {
        // Must NOT overwrite isPaused or positionMs from idle HTML5 video element
        return false;
      }
      storeState.isPaused = telemetry.isPaused;
      storeState.positionMs = telemetry.positionMs;
      return true;
    };

    const idleVideoTelemetry = { isPaused: true, positionMs: 0 };
    const result = mockHandleTelemetry(idleVideoTelemetry, 'https://youtu.be/dQw4w9WgXcQ');

    assert.equal(result, false);
    assert.equal(storeState.isPaused, false);
    assert.equal(storeState.positionMs, 5000);
  });
});
