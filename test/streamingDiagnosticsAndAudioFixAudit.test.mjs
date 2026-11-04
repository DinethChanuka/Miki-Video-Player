import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

describe('Streaming Diagnostics, Audio DSP Bypass & Thumbnail Fix Audit', () => {
  const playerEnginePath = path.join(rootDir, 'src/core/PlayerEngine.ts');
  const hlsControllerPath = path.join(rootDir, 'src/core/HlsStreamController.ts');
  const dashboardPath = path.join(rootDir, 'src/components/home/HomeDashboardView.tsx');
  const musicViewPath = path.join(rootDir, 'src/components/music/MusicPlayerView.tsx');
  const playerStorePath = path.join(rootDir, 'src/store/playerStore.ts');

  it('verifies PlayerEngine differentiates video element error codes instead of hardcoding CODEC_UNSUPPORTED', () => {
    const code = fs.readFileSync(playerEnginePath, 'utf-8');
    // Ensure error handler checks error code (e.g. MEDIA_ERR_DECODE, MEDIA_ERR_SRC_NOT_SUPPORTED, MEDIA_ERR_NETWORK)
    assert.match(
      code,
      /MEDIA_ERR_DECODE|err\.code\s*===\s*3/i,
      'PlayerEngine must distinguish decode errors (MEDIA_ERR_DECODE) from network or missing source errors'
    );
    assert.match(
      code,
      /MEDIA_ERR_SRC_NOT_SUPPORTED|MEDIA_ERR_NETWORK|err\.code\s*===\s*4/i,
      'PlayerEngine must recognize source-not-supported and network errors as STREAM_ERROR / MEDIA_NOT_FOUND'
    );
  });

  it('verifies WebMediaEngine supports explicit DSP bypass for low-overhead audio and cross-origin CORS safety', () => {
    const code = fs.readFileSync(playerEnginePath, 'utf-8');
    assert.match(
      code,
      /dspBypass|setDspBypass/i,
      'WebMediaEngine must provide a DSP bypass method or property to skip Web Audio hijacking'
    );
  });

  it('verifies HlsStreamController caps fatal MEDIA_ERROR recovery retries to prevent infinite loops', () => {
    const code = fs.readFileSync(hlsControllerPath, 'utf-8');
    assert.match(
      code,
      /mediaRetryCount|maxMediaRetries/i,
      'HlsStreamController must track media error retries'
    );
    assert.match(
      code,
      /onFatalError/i,
      'HlsStreamController must escalate to onFatalError when media error retries are exhausted'
    );
  });

  it('verifies HomeDashboardView and MusicPlayerView do not use dead 404 freesound URLs', () => {
    const dashboardCode = fs.readFileSync(dashboardPath, 'utf-8');
    const musicCode = fs.readFileSync(musicViewPath, 'utf-8');

    assert.equal(
      dashboardCode.includes('cdn.freesound.org'),
      false,
      'HomeDashboardView must not contain dead cdn.freesound.org links'
    );
    assert.equal(
      musicCode.includes('cdn.freesound.org'),
      false,
      'MusicPlayerView must not contain dead cdn.freesound.org links'
    );
  });

  it('verifies playerStore openMedia accepts or looks up rich artwork to prevent blurry Continue Watching thumbnails', () => {
    const code = fs.readFileSync(playerStorePath, 'utf-8');
    // openMedia signature or body should support artwork/poster
    assert.match(
      code,
      /artworkUrl|posterUrl|thumbnailUri/i,
      'openMedia in playerStore must support artwork/poster propagation'
    );
    assert.match(
      code,
      /ALBUM_POSTERS|CURATED_CHANNELS|lookupArtwork/i,
      'playerStore must look up curated artwork before falling back to low-res favicons'
    );
  });
});
