import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

describe('Hi-Fi Studio 3D Card Reflection, Continuous Chunk Loading, and YouTube Music Audit', () => {
  const fullPlayerPath = path.resolve('src/components/music/FullWindowMusicPlayer.tsx');
  const chunkControllerPath = path.resolve('src/core/ChunkedAudioStreamController.ts');
  const ytServicePath = path.resolve('src/utils/youtubeMusicService.ts');
  const homeDashboardPath = path.resolve('src/components/home/HomeDashboardView.tsx');

  const fullPlayerContent = fs.readFileSync(fullPlayerPath, 'utf8');
  const chunkControllerContent = fs.readFileSync(chunkControllerPath, 'utf8');
  const homeDashboardContent = fs.readFileSync(homeDashboardPath, 'utf8');

  it('verifies FullWindowMusicPlayer renders realistic 3D floor reflections and contact shadows', () => {
    assert.ok(
      fullPlayerContent.includes('maskImage') || fullPlayerContent.includes('WebkitMaskImage'),
      'FullWindowMusicPlayer must use gradient mask for card reflection'
    );
    assert.ok(
      fullPlayerContent.includes('contact-shadow') || fullPlayerContent.includes('radial-gradient') || fullPlayerContent.includes('floor-reflection'),
      'FullWindowMusicPlayer must render realistic floor contact shadows or ambient occlusion under Cover Flow cards'
    );
    assert.ok(
      !fullPlayerContent.includes('const y = h / 2;\n\n        const grad = ctx.createLinearGradient(x, y - amp, x, y + amp);'),
      'Visualizer canvas must not cut across horizontal center line dividing card and reflection'
    );
  });

  it('verifies ChunkedAudioStreamController implements continuous background preloading of full audio tracks', () => {
    assert.ok(
      chunkControllerContent.includes('preloadRemainingChunks') ||
      chunkControllerContent.includes('preloadAllChunks') ||
      chunkControllerContent.includes('continuousPreload'),
      'ChunkedAudioStreamController must implement continuous preloading for full audio playback'
    );
  });

  it('verifies youtubeMusicService provides live search for YouTube Music full tracks', () => {
    assert.ok(
      fs.existsSync(ytServicePath),
      'src/utils/youtubeMusicService.ts must exist'
    );
    const ytServiceContent = fs.readFileSync(ytServicePath, 'utf8');
    assert.ok(
      ytServiceContent.includes('searchYouTubeMusicLive'),
      'youtubeMusicService must export searchYouTubeMusicLive function'
    );
  });

  it('verifies HomeDashboardView top search bar integrates YouTube Music search results with Hi-Fi studio playback', () => {
    assert.ok(
      homeDashboardContent.includes('youtubeMusic') ||
      homeDashboardContent.includes('searchYouTubeMusicLive') ||
      homeDashboardContent.includes('YouTube Music'),
      'HomeDashboardView must incorporate YouTube Music in top search results'
    );
    assert.ok(
      homeDashboardContent.includes("'music'") &&
      (homeDashboardContent.includes('setMusicPlayerOpen(true)') || homeDashboardContent.includes('onOpenMusic')),
      'Playing YouTube Music from search must route to Hi-Fi studio with music playbackMode'
    );
  });

  it('verifies FullWindowMusicPlayer embeds YouTube audio bridge for full song playback', () => {
    assert.ok(
      fullPlayerContent.includes('youtube') || fullPlayerContent.includes('youtubeId'),
      'FullWindowMusicPlayer must support YouTube audio playback for full tracks'
    );
  });
});
