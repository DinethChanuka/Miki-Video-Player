import { describe, it } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';

describe('Task 2: Buffering Error State & Infinite Spinner Prevention Audit', () => {
  const playerStorePath = path.resolve(process.cwd(), 'src/store/playerStore.ts');
  const playerEnginePath = path.resolve(process.cwd(), 'src/core/PlayerEngine.ts');
  const appPath = path.resolve(process.cwd(), 'src/App.tsx');

  const playerStoreCode = fs.readFileSync(playerStorePath, 'utf-8');
  const playerEngineCode = fs.readFileSync(playerEnginePath, 'utf-8');
  const appCode = fs.readFileSync(appPath, 'utf-8');

  it('verifies playerStore clears isBuffering when an error occurs', () => {
    assert.match(
      playerStoreCode,
      /engine\.onError[\s\S]*?set\(\{\s*(?:[^}]*?\s*)?isBuffering:\s*false/m,
      'playerStore must reset isBuffering: false when engine.onError is triggered'
    );
  });

  it('verifies App.tsx does not display the buffering loading HUD when lastError is active', () => {
    assert.match(
      appCode,
      /isBuffering\s*&&\s*!lastError\s*&&\s*currentUri/,
      'App.tsx must suppress loading spinner if an error is present'
    );
  });

  it('verifies PlayerEngine clears buffering on fatal HLS error', () => {
    assert.match(
      playerEngineCode,
      /data\.fatal[\s\S]*?isBuffering:\s*false/,
      'PlayerEngine must ensure buffering state is cleared on fatal HLS error'
    );
  });
});
