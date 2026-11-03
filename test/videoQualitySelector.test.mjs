import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { HlsStreamController } from '../src/core/HlsStreamController.ts';

describe('Task 4: Video Quality Changer & HLS Level Control Audit', () => {
  const controllerPath = resolve(process.cwd(), 'src/core/HlsStreamController.ts');
  const storePath = resolve(process.cwd(), 'src/store/playerStore.ts');
  const controlsPath = resolve(process.cwd(), 'src/components/hud/ControlsOverlay.tsx');

  const controllerCode = readFileSync(controllerPath, 'utf-8');
  const storeCode = readFileSync(storePath, 'utf-8');
  const controlsCode = readFileSync(controlsPath, 'utf-8');

  it('verifies HlsStreamController implements getQualityLevels and setQualityLevel', () => {
    assert.ok(
      controllerCode.includes('getQualityLevels'),
      'HlsStreamController must implement getQualityLevels'
    );
    assert.ok(
      controllerCode.includes('setQualityLevel'),
      'HlsStreamController must implement setQualityLevel'
    );
    assert.ok(
      controllerCode.includes('getCurrentQualityLevel'),
      'HlsStreamController must implement getCurrentQualityLevel'
    );
  });

  it('verifies playerStore manages streamQualityLevels and setStreamQuality', () => {
    assert.ok(
      storeCode.includes('streamQualityLevels'),
      'playerStore must store streamQualityLevels'
    );
    assert.ok(
      storeCode.includes('setStreamQuality'),
      'playerStore must provide setStreamQuality action'
    );
  });

  it('verifies ControlsOverlay provides a stream video quality changer button/menu', () => {
    assert.ok(
      controlsCode.includes('Quality') || controlsCode.includes('streamQuality') || controlsCode.includes('VideoQualitySelector'),
      'ControlsOverlay must render video quality changer'
    );
  });
});

