import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

describe('Task 3 Audit: Single-Download Progressive Streaming with Persistent Cache', () => {
  const controllerPath = path.resolve(process.cwd(), 'src/core/ChunkedAudioStreamController.ts');
  const code = fs.readFileSync(controllerPath, 'utf8');

  it('verifies persistent audio cache integration on load', () => {
    assert.match(
      code,
      /persistentAudioCache|getCachedBlobUrl|getCachedTrack/i,
      'ChunkedAudioStreamController must check persistent audio cache on load'
    );
  });

  it('verifies removal of redundant 120ms duplicate range fetch loop without persistence', () => {
    // Should NOT have the old pattern that fetched chunks every 120ms and discarded them
    assert.doesNotMatch(
      code,
      /setTimeout\(fetchNext,\s*120\)/,
      'Must eliminate the unpersisted 120ms duplicate chunk fetching loop'
    );
  });

  it('verifies removal of premature 250ms ready timeout race condition', () => {
    // Must NOT have premature 250ms ready trigger that plays before media is decoded
    assert.doesNotMatch(
      code,
      /setTimeout\(\(\)\s*=>\s*\{\s*triggerReady\(\);\s*\},\s*250\)/,
      'Must remove premature 250ms ready timeout'
    );
  });

  it('verifies genuine readiness event binding (loadeddata, canplay) and background persistent caching', () => {
    assert.match(
      code,
      /loadeddata|canplay/i,
      'Must bind genuine media readiness events'
    );
    assert.match(
      code,
      /saveTrack|persistentAudioCache\.save/i,
      'Must persist complete downloaded track into persistentAudioCache'
    );
  });
});

