import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { HlsStreamController } from '../src/core/HlsStreamController.ts';

describe('HlsStreamController & Playback Routing Audit', () => {
  it('detects HLS stream URLs accurately', () => {
    assert.equal(HlsStreamController.isHlsUrl('https://example.com/master.m3u8'), true);
    assert.equal(HlsStreamController.isHlsUrl('https://example.com/live/playlist.m3u8?token=123'), true);
    assert.equal(HlsStreamController.isHlsUrl('https://example.com/hls/channel/stream'), true);
    assert.equal(HlsStreamController.isHlsUrl('https://example.com/video.mp4'), false);
    assert.equal(HlsStreamController.isHlsUrl(''), false);
  });

  it('bounds network error retries to maximum threshold and escalates failure', () => {
    let escalatedError = null;
    const controller = new HlsStreamController({
      maxNetworkRetries: 2,
      onFatalError: (err) => {
        escalatedError = err;
      },
    });

    // Verify initial retry count
    assert.equal(controller.getNetworkRetryCount(), 0);

    // Simulate 1st fatal network error (retry count increases to 1)
    const shouldRetry1 = controller.handleNetworkError('manifestLoadError');
    assert.equal(shouldRetry1, true);
    assert.equal(controller.getNetworkRetryCount(), 1);
    assert.equal(escalatedError, null);

    // Simulate 2nd fatal network error (retry count increases to 2)
    const shouldRetry2 = controller.handleNetworkError('manifestLoadError');
    assert.equal(shouldRetry2, true);
    assert.equal(controller.getNetworkRetryCount(), 2);
    assert.equal(escalatedError, null);

    // Simulate 3rd fatal network error (threshold reached -> escalate to failover, do not loop)
    const shouldRetry3 = controller.handleNetworkError('manifestLoadError');
    assert.equal(shouldRetry3, false);
    assert.notEqual(escalatedError, null);
    assert.equal(escalatedError.reason, 'CORS_RESTRICTED');
  });

  it('provides safe cleanup and reset on destroy', () => {
    const controller = new HlsStreamController();
    controller.destroy();
    assert.equal(controller.getNetworkRetryCount(), 0);
  });
});
