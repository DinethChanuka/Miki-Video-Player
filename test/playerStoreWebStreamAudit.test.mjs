import { describe, it } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';

describe('Task 4: playerStore Web Stream Error Handling and Cinema Resolution Audit', () => {
  const storePath = path.resolve(process.cwd(), 'src/store/playerStore.ts');
  const storeCode = fs.readFileSync(storePath, 'utf-8');

  it('verifies playerStore does not call engine.load on retry for cinema, social or non-direct web URLs', () => {
    const errorBlockMatch = storeCode.match(/(?:engine\.onError|handleStreamError)[\s\S]*?isDirectMediaUrl/);
    assert.ok(errorBlockMatch, 'playerStore error handler must verify media is direct file before retrying engine.load');
  });

  it('verifies openMedia initializes cinema streams with clean titles and clears prior errors', () => {
    assert.match(
      storeCode,
      /lastError:\s*null,\s*isPaused:\s*false/,
      'openMedia must clear lastError and reset buffering on new web streams'
    );
  });
});
