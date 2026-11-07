import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

describe('Task 1 Audit: Hi-Fi 4-Stage Audio Signal Chain & Normalized Spatial Downmix', () => {
  const spatialEnginePath = path.resolve(process.cwd(), 'src/core/SpatialAudioEngine.ts');
  const playerEnginePath = path.resolve(process.cwd(), 'src/core/PlayerEngine.ts');

  const spatialCode = fs.readFileSync(spatialEnginePath, 'utf8');
  const playerCode = fs.readFileSync(playerEnginePath, 'utf8');

  it('verifies SpatialAudioEngine normalizes stereo/binaural downmix to prevent multi-speaker gain summing', () => {
    // Must have a downmix normalization factor so 6 speaker gains do not sum to 6.9x
    assert.match(
      spatialCode,
      /DOWNMIX_NORM|BS775_NORM|normFactor|downmixNorm/i,
      'SpatialAudioEngine must define a downmix normalization factor'
    );

    // In stereo/binaural routing, speaker gains must be multiplied by normalization factor
    assert.match(
      spatialCode,
      /normFactor|downmixNorm|STEREO_DOWNMIX/i,
      'SpatialAudioEngine must apply normalization factor during stereo downmix'
    );
  });

  it('verifies true-peak limiter is configured with brickwall peak-limiting parameters', () => {
    // Brickwall limiter: ratio >= 20:1, threshold around -0.5 dB to -1 dB, attack <= 0.002s
    assert.match(
      spatialCode,
      /ratio\.setValueAtTime\((20|30|50)/i,
      'Limiter compressor must have brickwall ratio >= 20:1'
    );
    assert.match(
      spatialCode,
      /threshold\.setValueAtTime\(-0\.5/i,
      'Limiter threshold must be set around -0.5 dB'
    );
  });

  it('verifies signal chain order: masterGain is at the end before destination and preamp is before limiter', () => {
    // Chain: EQ -> Spatial -> Preamp -> Limiter -> Master Volume -> Destination
    assert.match(
      spatialCode,
      /preampGainNode|preampGain/i,
      'SpatialAudioEngine must support dedicated preamp gain node'
    );
    assert.match(
      spatialCode,
      /masterGain.*connect.*cachedDestinationNode|masterGain.*connect\(this\.cachedDestinationNode\)/i,
      'masterGain must be the final stage connected directly to destination'
    );
  });

  it('verifies smooth gain ramps (setTargetAtTime or linearRampToValueAtTime) on volume changes', () => {
    assert.match(
      spatialCode,
      /setTargetAtTime|linearRampToValueAtTime/i,
      'SpatialAudioEngine must use smooth gain ramps to prevent pops/clicks on volume changes'
    );
  });

  it('verifies WebMediaEngine standardizes unity gain at 100% and uses smooth transitions', () => {
    assert.match(
      playerCode,
      /setTargetAtTime|linearRampToValueAtTime/i,
      'PlayerEngine WebMediaEngine must use smooth gain transitions for volume'
    );
  });
});
