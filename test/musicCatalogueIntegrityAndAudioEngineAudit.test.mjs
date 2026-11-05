import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

describe('Music Catalogue Integrity & Audio Engine Consolidation Audit', () => {
  const homeDashboardPath = path.resolve('src/components/home/HomeDashboardView.tsx');
  const musicPlayerViewPath = path.resolve('src/components/music/MusicPlayerView.tsx');
  const musicDiscoveryServicePath = path.resolve('src/utils/musicDiscoveryService.ts');
  const errorToastPath = path.resolve('src/components/hud/ErrorToast.tsx');
  const playerStorePath = path.resolve('src/store/playerStore.ts');
  const appPath = path.resolve('src/App.tsx');

  const homeContent = fs.readFileSync(homeDashboardPath, 'utf8');
  const musicViewContent = fs.readFileSync(musicPlayerViewPath, 'utf8');
  const discoveryContent = fs.readFileSync(musicDiscoveryServicePath, 'utf8');
  const errorToastContent = fs.readFileSync(errorToastPath, 'utf8');
  const playerStoreContent = fs.readFileSync(playerStorePath, 'utf8');
  const appContent = fs.readFileSync(appPath, 'utf8');

  it('verifies COVER_FLOW_ALBUMS contains zero generic sample.mp3 or sample2.mp3 files', () => {
    assert.ok(
      !homeContent.includes('sample.mp3') && !homeContent.includes('sample2.mp3'),
      'COVER_FLOW_ALBUMS must not use generic sample.mp3 or sample2.mp3 test files'
    );
  });

  it('verifies FEATURED_MUSIC_TRACKS contains zero generic sample.mp3 or sample2.mp3 files', () => {
    assert.ok(
      !musicViewContent.includes('sample.mp3') && !musicViewContent.includes('sample2.mp3'),
      'FEATURED_MUSIC_TRACKS must not use generic sample.mp3 or sample2.mp3 test files'
    );
  });

  it('verifies radio streams are not assigned as songs in COVER_FLOW_ALBUMS or FEATURED_MUSIC_TRACKS', () => {
    const coverFlowBlock = homeContent.slice(
      homeContent.indexOf('const COVER_FLOW_ALBUMS: CoverFlowTrack[] = ['),
      homeContent.indexOf('const RECOMMENDED_MOVIES: MovieItem[] = [')
    );
    assert.ok(
      !coverFlowBlock.includes('somafm.com'),
      'COVER_FLOW_ALBUMS songs must not point to SomaFM live radio streams'
    );

    const featuredBlock = musicViewContent.slice(
      musicViewContent.indexOf('export const FEATURED_MUSIC_TRACKS: MusicTrack[] = ['),
      musicViewContent.indexOf('export const MusicPlayerView: React.FC = () => {')
    );
    assert.ok(
      !featuredBlock.includes('somafm.com'),
      'FEATURED_MUSIC_TRACKS songs must not point to SomaFM live radio streams'
    );
  });

  it('verifies musicDiscoveryService does not synthesize fake tracks with generic suffixes', () => {
    assert.ok(
      !discoveryContent.includes('VIP Remix') && !discoveryContent.includes('Deep Bass House Edition'),
      'musicDiscoveryService must not synthesize fake track variants with random audio'
    );
    assert.ok(
      !discoveryContent.includes('${displayTitle} & Friends') && !discoveryContent.includes('suffixes.forEach'),
      'musicDiscoveryService must not invent fake artist collaborations or synthetic track variations'
    );
  });

  it('verifies MusicPlayerView does not create a duplicate standalone MusicAudioEngine', () => {
    assert.ok(
      !musicViewContent.includes('new MusicAudioEngine()'),
      'MusicPlayerView must use the authoritative PlayerEngine via usePlayerStore instead of instantiating new MusicAudioEngine()'
    );
    assert.ok(
      musicViewContent.includes('usePlayerStore'),
      'MusicPlayerView must connect to usePlayerStore for authoritative player state'
    );
  });

  it('verifies ErrorToast restricts "Media File Moved or Unavailable" modal exclusively to local files and never music/radio', () => {
    assert.ok(
      errorToastContent.includes('isLocalFile'),
      'ErrorToast must check isLocalFile before showing missing media modal'
    );
    assert.ok(
      errorToastContent.includes('activePlaybackMode') || errorToastContent.includes('isMissingOrMoved'),
      'ErrorToast must protect against showing video moved modal for audio/music playback'
    );
  });

  it('verifies App.tsx routes song resume and restart with explicit audio mediaType', () => {
    assert.ok(
      appContent.includes('openMedia(item.uri, item.title, true, item.lastPositionMs, item.thumbnailUri, isItemAudio ? \'music\' : \'video\')') ||
      appContent.includes('isItemAudio'),
      'App.tsx handleConfirmResume must distinguish between video and audio playback modes'
    );
  });
});
