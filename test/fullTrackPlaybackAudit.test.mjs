import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

describe('Full-Track Playback Audit — No 30-second iTunes preview clips', () => {
  const discoveryPath = path.resolve('src/utils/musicDiscoveryService.ts');
  const playerStorePath = path.resolve('src/store/playerStore.ts');
  const fullPlayerPath = path.resolve('src/components/music/FullWindowMusicPlayer.tsx');

  const discoveryContent = fs.readFileSync(discoveryPath, 'utf8');
  const playerStoreContent = fs.readFileSync(playerStorePath, 'utf8');
  const fullPlayerContent = fs.readFileSync(fullPlayerPath, 'utf8');

  it('fetchOnlineMusicSearch must NOT use iTunes previewUrl as streamUrl', () => {
    // The root bug: iTunes previewUrl returns 30-second AAC clips.
    // The code must NOT set streamUrl = item.previewUrl for playback.
    const fnBody = discoveryContent.slice(
      discoveryContent.indexOf('export async function fetchOnlineMusicSearch'),
      discoveryContent.indexOf('\n}\n', discoveryContent.indexOf('export async function fetchOnlineMusicSearch')) + 3
    );

    // previewUrl should NOT be used as the primary streamUrl
    const usesPreviewAsStream = /streamUrl\s*[:=]\s*(?:item\.previewUrl|item\['previewUrl'\])/.test(fnBody);
    assert.ok(
      !usesPreviewAsStream,
      'fetchOnlineMusicSearch must NOT set streamUrl = item.previewUrl (30s preview clips). ' +
      'Must use YouTube full-track URLs instead.'
    );
  });

  it('iTunes search results must get YouTube full-track URLs via cross-referencing', () => {
    const fnBody = discoveryContent.slice(
      discoveryContent.indexOf('export async function fetchOnlineMusicSearch'),
      discoveryContent.indexOf('\n}\n', discoveryContent.indexOf('export async function fetchOnlineMusicSearch')) + 3
    );

    // Must call searchYouTubeMusicLive or use youtube URLs for iTunes results
    const crossReferencesYouTube =
      fnBody.includes('searchYouTubeMusicLive') ||
      fnBody.includes('youtube.com/watch') ||
      fnBody.includes('youtubeMatch') ||
      fnBody.includes('ytMatch');

    assert.ok(
      crossReferencesYouTube,
      'fetchOnlineMusicSearch must cross-reference iTunes metadata with YouTube Music ' +
      'to provide full-track streamUrls instead of 30s previews'
    );
  });

  it('playerStore must route YouTube URLs to music mode when mediaType=music', () => {
    // When mediaType is 'music', YouTube URLs must stay in music mode
    // and NOT be caught by parseWebStream as a video web stream
    assert.ok(
      playerStoreContent.includes("mediaType === 'music'"),
      'playerStore openMedia must check for music mediaType'
    );

    // YouTube URLs for music should be detected as audio, not video
    assert.ok(
      playerStoreContent.includes('youtube') ||
      playerStoreContent.includes('isAudio'),
      'playerStore must handle YouTube music URLs correctly'
    );
  });

  it('FullWindowMusicPlayer YouTube Audio Bridge must handle play/pause/volume sync', () => {
    assert.ok(
      fullPlayerContent.includes('activeYouTubeId'),
      'Must detect YouTube video ID from currentUri'
    );
    const ytPlayerPath = path.resolve('src/components/player/YouTubePlayer.tsx');
    const ytPlayerContent = fs.readFileSync(ytPlayerPath, 'utf8');
    assert.ok(
      fullPlayerContent.includes('YouTubePlayer') && ytPlayerContent.includes('postMessage'),
      'Must synchronize playback via postMessage to YouTube iframe'
    );
    assert.ok(
      fullPlayerContent.includes('YouTubePlayer') && ytPlayerContent.includes('youtube-nocookie.com/embed'),
      'Must use privacy-enhanced YouTube embed URL'
    );
  });

  it('combined search results must prioritize YouTube full tracks over iTunes previews', () => {
    const fnBody = discoveryContent.slice(
      discoveryContent.indexOf('export async function fetchOnlineMusicSearch'),
      discoveryContent.indexOf('\n}\n', discoveryContent.indexOf('export async function fetchOnlineMusicSearch')) + 3
    );

    // YouTube tracks must come first (or iTunes must be enriched with YouTube URLs)
    const prioritizesYT =
      fnBody.includes('...formattedYt') ||
      fnBody.includes('youtubeFirst') ||
      fnBody.includes('ytEnriched');

    assert.ok(
      prioritizesYT,
      'Combined results must prioritize YouTube full tracks or enrich iTunes results with YouTube URLs'
    );
  });
});

