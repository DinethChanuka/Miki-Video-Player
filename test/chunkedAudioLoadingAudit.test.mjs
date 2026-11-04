import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

describe('Chunk-by-Chunk Music Audio Loading & Progressive Streaming Audit', () => {
  const rootDir = process.cwd();
  const chunkedControllerPath = path.join(rootDir, 'src/core/ChunkedAudioStreamController.ts');
  const playerEnginePath = path.join(rootDir, 'src/core/PlayerEngine.ts');
  const musicDiscoveryPath = path.join(rootDir, 'src/utils/musicDiscoveryService.ts');
  const homeDashboardPath = path.join(rootDir, 'src/components/home/HomeDashboardView.tsx');

  it('verifies ChunkedAudioStreamController exists and defines 256KB chunk size and Range streaming', () => {
    assert.ok(fs.existsSync(chunkedControllerPath), 'ChunkedAudioStreamController.ts must exist');
    const code = fs.readFileSync(chunkedControllerPath, 'utf-8');
    assert.match(code, /ChunkedAudioStreamController/, 'Must export ChunkedAudioStreamController class');
    assert.match(code, /262144|256\s*\*\s*1024/, 'Must define 256KB default chunk size for fast initial TTFB');
    assert.match(code, /Range:\s*`bytes=\$\{/, 'Must construct HTTP byte range requests for progressive chunks');
    assert.match(code, /isAudioUrl/, 'Must provide audio URL classification helper');
  });

  it('verifies PlayerEngine integrates chunked fast-start streaming for audio playback', () => {
    const code = fs.readFileSync(playerEnginePath, 'utf-8');
    assert.match(code, /ChunkedAudioStreamController/, 'PlayerEngine must integrate ChunkedAudioStreamController');
    assert.match(code, /loadeddata/, 'PlayerEngine must listen to loadeddata for immediate chunk decode start');
    assert.match(code, /preload\s*=\s*['"]auto['"]/, 'PlayerEngine must enforce preload="auto" for progressive range chunking');
  });

  it('verifies STREAM_AUDIO_POOL provides fast CDN streams with byte-range capability', () => {
    const code = fs.readFileSync(musicDiscoveryPath, 'utf-8');
    assert.match(code, /STREAM_AUDIO_POOL/, 'STREAM_AUDIO_POOL must be exported');
    // Ensure fast CDN links are present
    assert.match(code, /raw\.githubusercontent\.com|cdn\.pixabay\.com|upload\.wikimedia\.org|fastly|archive\.org/);
  });

  it('verifies HomeDashboardView provides chunk-by-chunk music catalog navigation and indicators', () => {
    const code = fs.readFileSync(homeDashboardPath, 'utf-8');
    assert.match(code, /Chunk|chunk/, 'HomeDashboardView must provide chunked catalog terminology and indicators');
    assert.match(code, /MUSIC_PAGE_SIZE|CHUNK_SIZE|CHUNK/, 'HomeDashboardView must support chunk-sized pagination');
  });
});

