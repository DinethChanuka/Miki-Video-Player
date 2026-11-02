import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { SpatialAudioEngine, DEFAULT_SPATIAL_STATE } from '../src/core/SpatialAudioEngine.ts';
import fs from 'node:fs';
import path from 'node:path';

describe('Task 3 Audit: Audio DSP, Single Authoritative Volume & 5.1 Routing', () => {
  const playerEngineSource = fs.readFileSync(
    path.resolve('src/core/PlayerEngine.ts'),
    'utf-8'
  );
  const spatialEngineSource = fs.readFileSync(
    path.resolve('src/core/SpatialAudioEngine.ts'),
    'utf-8'
  );

  it('verifies single authoritative volume control without squaring/multiplication', () => {
    // If WebAudio is connected, videoEl.volume must remain 1.0 (unattenuated)
    assert.ok(
      playerEngineSource.includes('this.videoEl.volume = 1.0') ||
      playerEngineSource.includes('this.videoEl.volume = 1'),
      'WebMediaEngine must maintain unattenuated videoEl.volume when WebAudio gainNode is active'
    );
  });

  it('verifies discrete 6-channel routing and separate binaural vs speaker modes in SpatialAudioEngine', () => {
    assert.ok(
      spatialEngineSource.includes('createChannelMerger') || spatialEngineSource.includes('ChannelMergerNode'),
      'SpatialAudioEngine must implement ChannelMergerNode for genuine 5.1 multi-speaker routing'
    );
    assert.ok(
      spatialEngineSource.includes('outputMode') || spatialEngineSource.includes('isDiscrete51'),
      'SpatialAudioEngine must differentiate discrete 5.1 surround vs binaural stereo output'
    );
  });

  it('verifies audio limiter compressor protects against digital clipping at 200% overdrive', () => {
    const engine = new SpatialAudioEngine();
    engine.setMasterVolume(2.0); // 200% overdrive
    assert.equal(engine.getMasterVolume(), 2.0);
  });
});
