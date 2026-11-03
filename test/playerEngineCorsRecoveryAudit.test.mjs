import { describe, it } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';

describe('Task 3: Adaptive CORS Recovery and Resilient Audio in PlayerEngine', () => {
  const enginePath = path.resolve(process.cwd(), 'src/core/PlayerEngine.ts');
  const engineCode = fs.readFileSync(enginePath, 'utf-8');
  const appPath = path.resolve(process.cwd(), 'src/App.tsx');
  const appCode = fs.readFileSync(appPath, 'utf-8');

  it('verifies WebMediaEngine implements adaptive CORS fallback on video element error', () => {
    assert.match(
      engineCode,
      /removeAttribute\(['"]crossOrigin['"]\)|crossOrigin\s*=\s*(null|['"]['"])/,
      'WebMediaEngine must remove crossOrigin when a remote stream fails to load due to CORS'
    );
  });

  it('verifies videoEl.volume is synchronized with setVolume for non-CORS native audio fallback', () => {
    assert.match(
      engineCode,
      /this\.videoEl\.volume\s*=/,
      'WebMediaEngine must set this.videoEl.volume directly to ensure audio plays even when WebAudio CORS graph is bypassed'
    );
  });

  it('verifies App.tsx does not hardcode static crossOrigin="anonymous" on the video element', () => {
    // Look for <video id="aether-video-viewport" without hardcoded crossOrigin="anonymous"
    const videoTagMatch = appCode.match(/<video[\s\S]*?id="aether-video-viewport"[\s\S]*?\/>/);
    assert.ok(videoTagMatch, 'Must find aether-video-viewport');
    assert.ok(
      !videoTagMatch[0].includes('crossOrigin="anonymous"'),
      'aether-video-viewport must not hardcode static crossOrigin="anonymous" to avoid CORS rejections on remote movie streams'
    );
  });
});
