import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  DEFAULT_SPATIAL_STATE,
  SpatialAudioEngine,
} from '../src/core/SpatialAudioEngine.ts';

describe('Spatial Audio Configuration (SpatialAudioEngine)', () => {
  it('defines valid initial default state', () => {
    assert.equal(typeof DEFAULT_SPATIAL_STATE, 'object');
    assert.equal(DEFAULT_SPATIAL_STATE.enabled, true);
    assert.equal(DEFAULT_SPATIAL_STATE.profile, 'imax_3d');
  });

  it('configures 6-channel speaker matrix within safe gain bounds', () => {
    const { speakers } = DEFAULT_SPATIAL_STATE;
    assert.ok(speakers.frontLeft >= 0 && speakers.frontLeft <= 1.5);
    assert.ok(speakers.center >= 0 && speakers.center <= 1.5);
    assert.ok(speakers.frontRight >= 0 && speakers.frontRight <= 1.5);
    assert.ok(speakers.surroundLeft >= 0 && speakers.surroundLeft <= 1.5);
    assert.ok(speakers.surroundRight >= 0 && speakers.surroundRight <= 1.5);
    assert.ok(speakers.subwoofer >= 0 && speakers.subwoofer <= 2.0);
  });

  it('configures spatial 3D coordinates within [-1, 1] range', () => {
    const { coordinates } = DEFAULT_SPATIAL_STATE;
    assert.ok(coordinates.x >= -1.0 && coordinates.x <= 1.0);
    assert.ok(coordinates.y >= -1.0 && coordinates.y <= 1.0);
    assert.ok(coordinates.z >= -1.0 && coordinates.z <= 1.0);
  });

  it('configures LFE crossover frequency and preamp within safe audio acoustic limits', () => {
    assert.ok(DEFAULT_SPATIAL_STATE.lfeCrossoverHz >= 40 && DEFAULT_SPATIAL_STATE.lfeCrossoverHz <= 200);
    assert.ok(DEFAULT_SPATIAL_STATE.reverbAmount >= 0.0 && DEFAULT_SPATIAL_STATE.reverbAmount <= 1.0);
    assert.ok(DEFAULT_SPATIAL_STATE.stereoPan >= -1.0 && DEFAULT_SPATIAL_STATE.stereoPan <= 1.0);
    assert.ok(DEFAULT_SPATIAL_STATE.preampGain >= 1.0 && DEFAULT_SPATIAL_STATE.preampGain <= 2.5);
  });

  it('supports setMasterVolume from 0.0 (mute) to 2.0 (200% overdrive) without throwing', () => {
    const engine = new SpatialAudioEngine();
    assert.doesNotThrow(() => engine.setMasterVolume(0));
    assert.doesNotThrow(() => engine.setMasterVolume(1.0));
    assert.doesNotThrow(() => engine.setMasterVolume(2.0));
  });
});


