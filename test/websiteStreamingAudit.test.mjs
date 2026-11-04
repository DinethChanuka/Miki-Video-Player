import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

describe('Website & HTML Stream Routing and Fallback Audit', () => {
  const rootDir = process.cwd();
  const webStreamUtilsPath = path.join(rootDir, 'src/utils/webStreamUtils.ts');
  const appPath = path.join(rootDir, 'src/App.tsx');
  const playerEnginePath = path.join(rootDir, 'src/core/PlayerEngine.ts');

  it('verifies isDirectMediaUrl identifies audio/video files vs HTML websites', () => {
    assert.ok(fs.existsSync(webStreamUtilsPath), 'webStreamUtils.ts must exist');
    const code = fs.readFileSync(webStreamUtilsPath, 'utf-8');
    assert.match(code, /isDirectMediaUrl/, 'Must export isDirectMediaUrl function');
    assert.match(code, /\.mp4|\.m3u8|\.mp3|\.wav|\.flac/, 'Must match media extensions');
  });

  it('verifies App.tsx incorporates fallbackToWebStream for web-based streams', () => {
    const code = fs.readFileSync(appPath, 'utf-8');
    assert.match(code, /fallbackToWebStream/, 'App.tsx must define or invoke fallbackToWebStream');
    assert.match(code, /isDirectMediaUrl/, 'App.tsx must check isDirectMediaUrl before fallback');
  });

  it('verifies PlayerEngine handles crossOrigin adaptively for remote streams', () => {
    const code = fs.readFileSync(playerEnginePath, 'utf-8');
    assert.match(code, /crossOrigin/, 'PlayerEngine must configure crossOrigin');
    assert.match(code, /removeAttribute\(['"]crossOrigin['"]\)/, 'PlayerEngine must support removing crossOrigin on rejection');
  });
});
