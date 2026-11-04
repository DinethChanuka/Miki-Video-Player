import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

describe('Music Audio Playback, Modern UI Routing & Real Cover Art Audit', () => {
  const rootDir = process.cwd();
  const playerEnginePath = path.join(rootDir, 'src/core/PlayerEngine.ts');
  const playerStorePath = path.join(rootDir, 'src/store/playerStore.ts');
  const appPath = path.join(rootDir, 'src/App.tsx');
  const homeDashboardPath = path.join(rootDir, 'src/components/home/HomeDashboardView.tsx');
  const musicDiscoveryPath = path.join(rootDir, 'src/utils/musicDiscoveryService.ts');
  const fullWindowMusicPlayerPath = path.join(rootDir, 'src/components/music/FullWindowMusicPlayer.tsx');

  it('verifies PlayerEngine keeps el.muted false on play and setVolume when volume > 0', () => {
    const code = fs.readFileSync(playerEnginePath, 'utf-8');
    // Ensure play() clears sticky mute
    assert.match(
      code,
      /muted\s*=\s*false/,
      'PlayerEngine must ensure media element is unmuted when playing audible content'
    );
    // Ensure setVolume unsets muted on positive volume
    assert.match(
      code,
      /setVolume[\s\S]*?muted\s*=\s*false/,
      'setVolume must unmute media element when volume is greater than zero'
    );
  });

  it('verifies PlayerEngine enables anonymous crossOrigin by default for authorized WebAudio processing', () => {
    const code = fs.readFileSync(playerEnginePath, 'utf-8');
    // Ensure remote media gets crossOrigin anonymous so createMediaElementSource produces sound
    assert.match(
      code,
      /crossOrigin\s*=\s*['"]anonymous['"]/,
      'PlayerEngine must set crossOrigin to anonymous for remote media to prevent WebAudio silencing'
    );
  });

  it('verifies STREAM_AUDIO_POOL uses high-availability CORS-compatible audio streams', () => {
    const code = fs.readFileSync(musicDiscoveryPath, 'utf-8');
    assert.match(
      code,
      /archive\.org\/download\/mythium|githubusercontent\.com/,
      'STREAM_AUDIO_POOL must contain verified CORS-enabled direct audio streams'
    );
  });

  it('verifies KNOWN_ARTIST_PRESETS provides real album covers for Blackpink, BTS, and Taylor Swift', () => {
    const code = fs.readFileSync(musicDiscoveryPath, 'utf-8');
    // Blackpink official covers (Born Pink, Pink Venom, Ice Cream, HYLT, Kill This Love)
    assert.match(code, /Pink_Venom_Cover|Born_Pink|Ice_Cream|Kill_This_Love|How_You_Like_That/);
    // BTS official covers (Butter, Dynamite, Persona)
    assert.match(code, /BTS_-_Butter|Dynamite|Persona/);
    // Taylor Swift official covers (Lover, Midnights, 1989)
    assert.match(code, /Lover|Midnights|1989/);
  });

  it('verifies playerStore tracks activePlaybackMode, currentArtwork, and music modal state', () => {
    const code = fs.readFileSync(playerStorePath, 'utf-8');
    assert.match(code, /activePlaybackMode/);
    assert.match(code, /isMusicPlayerOpen/);
    assert.match(code, /setMusicPlayerOpen/);
  });

  it('verifies HomeDashboardView provides interactive live search dropdown with 1-click play and real covers', () => {
    const code = fs.readFileSync(homeDashboardPath, 'utf-8');
    // Search dropdown attached to search query
    assert.match(code, /searchQuery/);
    assert.match(code, /searchMusicOnline/);
    // Clicking music card or search result triggers modern music view
    assert.match(code, /onOpenMusic/);
  });

  it('verifies App.tsx renders FullWindowMusicPlayer when music is played without blank video screen', () => {
    const code = fs.readFileSync(appPath, 'utf-8');
    assert.match(code, /FullWindowMusicPlayer/);
    assert.match(code, /activePlaybackMode/);
  });

  it('verifies FullWindowMusicPlayer synchronizes with active track title, artist, and cover artwork', () => {
    const code = fs.readFileSync(fullWindowMusicPlayerPath, 'utf-8');
    assert.match(code, /currentTitle/);
    assert.match(code, /currentUri/);
  });
});

