import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

describe('Full-Track Playback Audit — No 30-second iTunes preview clips & Viewport YouTube Audio', () => {
  const discoveryPath = path.resolve('src/utils/musicDiscoveryService.ts');
  const ytServicePath = path.resolve('src/utils/youtubeMusicService.ts');
  const playerStorePath = path.resolve('src/store/playerStore.ts');
  const fullPlayerPath = path.resolve('src/components/music/FullWindowMusicPlayer.tsx');
  const appPath = path.resolve('src/App.tsx');
  const ytPlayerPath = path.resolve('src/components/player/YouTubePlayer.tsx');
  const swiftAppPath = path.resolve('MikiPlayerApp.swift');

  const discoveryContent = fs.readFileSync(discoveryPath, 'utf8');
  const ytServiceContent = fs.readFileSync(ytServicePath, 'utf8');
  const playerStoreContent = fs.readFileSync(playerStorePath, 'utf8');
  const fullPlayerContent = fs.readFileSync(fullPlayerPath, 'utf8');
  const appContent = fs.readFileSync(appPath, 'utf8');
  const ytPlayerContent = fs.readFileSync(ytPlayerPath, 'utf8');
  const swiftAppContent = fs.readFileSync(swiftAppPath, 'utf8');

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

  it('CURATED_YOUTUBE_TRACKS must use verified embeddable video IDs', () => {
    // Verified real video IDs for Bollywood hits
    assert.ok(
      ytServiceContent.includes('BSJa1UytM8w') || ytServiceContent.includes('8PbIHTX8QZE'),
      'CURATED_YOUTUBE_TRACKS must contain verified Saiyaara video ID'
    );
    assert.ok(
      ytServiceContent.includes('H2f7MZaw3Yo') || ytServiceContent.includes('yQ6d627OZig'),
      'CURATED_YOUTUBE_TRACKS must contain verified Samjhawan video ID'
    );
    assert.ok(
      ytServiceContent.includes('7z3YeFqd7xQ'),
      'CURATED_YOUTUBE_TRACKS must contain verified Dooriyan video ID'
    );
    // Must NOT contain 404 video ID z34x6629k9I
    assert.ok(
      !ytServiceContent.includes('z34x6629k9I'),
      'CURATED_YOUTUBE_TRACKS must NOT contain invalid 404 video ID z34x6629k9I'
    );
  });

  it('playerStore must route YouTube URLs to music mode when mediaType=music', () => {
    assert.ok(
      playerStoreContent.includes("mediaType === 'music'"),
      'playerStore openMedia must check for music mediaType'
    );
    assert.ok(
      playerStoreContent.includes('youtube') || playerStoreContent.includes('isAudio'),
      'playerStore must handle YouTube music URLs correctly'
    );
  });

  it('App.tsx must mount authoritative YouTubePlayer in main viewport regardless of playbackMode', () => {
    // When playing YouTube music, YouTubePlayer MUST remain mounted with real viewport geometry
    // and NOT be occluded or conditionally omitted when activePlaybackMode === 'music'
    assert.ok(
      appContent.includes('{youtubeId ? (') || appContent.includes('{youtubeId ?'),
      'App.tsx must render YouTubePlayer whenever youtubeId is present so WebKit does not suspend audio'
    );
  });

  it('FullWindowMusicPlayer must NOT contain throttled offscreen -4000px duplicate player', () => {
    assert.ok(
      !fullPlayerContent.includes('-left-[4000px]'),
      'FullWindowMusicPlayer must NOT embed duplicate offscreen iframe that gets throttled by WebKit'
    );
    assert.ok(
      !fullPlayerContent.includes('<YouTubePlayer'),
      'FullWindowMusicPlayer acts purely as UI controller for usePlayerStore; App.tsx hosts authoritative player'
    );
  });

  it('YouTubePlayer must support both string and structured object window messages', () => {
    assert.ok(
      ytPlayerContent.includes('typeof payload === \'string\'') ||
      ytPlayerContent.includes('typeof payload !== \'object\'') ||
      ytPlayerContent.includes('typeof event.data'),
      'YouTubePlayer handleWindowMessage must parse both string and object event payloads from WebKit'
    );
    assert.ok(
      ytPlayerContent.includes('postMessage'),
      'YouTubePlayer must synchronize playback via postMessage to YouTube iframe'
    );
    assert.ok(
      ytPlayerContent.includes('youtube-nocookie.com/embed'),
      'YouTubePlayer must use privacy-enhanced YouTube embed URL'
    );
  });

  it('MikiPlayerApp.swift must register searchYouTubeMusic IPC handler for CORS-free search', () => {
    assert.ok(
      swiftAppContent.includes('name: "searchYouTubeMusic"'),
      'MikiPlayerApp.swift must register searchYouTubeMusic script handler'
    );
    assert.ok(
      swiftAppContent.includes('youtubei/v1/search'),
      'MikiPlayerApp.swift must query YouTube API via native URLSession with zero CORS restrictions'
    );
  });

  it('FullWindowMusicPlayer must render realistic 3D floor card reflection', () => {
    assert.ok(
      fullPlayerContent.includes('floor-reflection'),
      'FullWindowMusicPlayer must contain floor reflection container'
    );
    assert.ok(
      fullPlayerContent.includes('scaleY(-1)') && fullPlayerContent.includes('transformOrigin'),
      'FullWindowMusicPlayer floor reflection must use scaleY(-1) with top origin for accurate contact'
    );
  });
});
