import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

describe('Task 4 Audit: Unified Single Authoritative Playback Engine Architecture', () => {
  const storePath = path.resolve(process.cwd(), 'src/store/playerStore.ts');
  const routerPath = path.resolve(process.cwd(), 'src/core/MediaEngineRouter.ts');

  const storeCode = fs.readFileSync(storePath, 'utf8');
  const routerCode = fs.readFileSync(routerPath, 'utf8');

  it('verifies bootEngine in playerStore does not instantiate redundant MediaEngineRouter and duplicate engines', () => {
    // Inside bootEngine, new MediaEngineRouter() must not be invoked
    assert.doesNotMatch(
      storeCode,
      /bootEngine:\s*async\s*\([^)]*\)\s*=>\s*\{[\s\S]*?new\s+MediaEngineRouter\(\)/,
      'bootEngine must not instantiate redundant MediaEngineRouter'
    );
  });

  it('verifies playerStore designates engine as the single authoritative playback controller', () => {
    assert.match(
      storeCode,
      /engine:\s*IPlayerEngine\s*\|\s*null/,
      'playerStore must have a single authoritative engine reference'
    );
  });

  it('verifies MediaEngineRouter uses lazy or coordinated engine instantiation rather than eager duplicate creation in constructor', () => {
    // Constructor should not eagerly instantiate all 3 engines at once
    assert.doesNotMatch(
      routerCode,
      /constructor\(\)\s*\{[\s\S]*?new\s+WebMediaEngine\(\)[\s\S]*?new\s+TauriMpvEngine\(\)/,
      'MediaEngineRouter must not eagerly instantiate competing engines in constructor'
    );
  });
});

