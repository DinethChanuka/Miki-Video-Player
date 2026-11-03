import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

describe('Task 1: Complete Removal of Demo Section Audit', () => {
  const fileBrowserPath = resolve(process.cwd(), 'src/components/hud/FileBrowserModal.tsx');
  const appPath = resolve(process.cwd(), 'src/App.tsx');
  const appMenuPath = resolve(process.cwd(), 'src/components/hud/ApplicationMenu.tsx');
  const musicPath = resolve(process.cwd(), 'src/components/music/MusicPlayerView.tsx');

  const fileBrowserCode = readFileSync(fileBrowserPath, 'utf-8');
  const appCode = readFileSync(appPath, 'utf-8');
  const appMenuCode = readFileSync(appMenuPath, 'utf-8');
  const musicCode = existsSync(musicPath) ? readFileSync(musicPath, 'utf-8') : '';

  it('verifies demos tab is removed from FileBrowserModal', () => {
    assert.equal(
      fileBrowserCode.includes("activeTab === 'demos'"),
      false,
      "FileBrowserModal must not have activeTab === 'demos'"
    );
    assert.equal(
      fileBrowserCode.includes('demo-bbb'),
      false,
      'FileBrowserModal must not contain demo-bbb'
    );
    assert.equal(
      fileBrowserCode.includes('filteredAndSortedDemos'),
      false,
      'FileBrowserModal must not contain filteredAndSortedDemos'
    );
  });

  it('verifies demos option is purged from ApplicationMenu and App.tsx', () => {
    assert.equal(
      appMenuCode.includes("'demos'"),
      false,
      "ApplicationMenu must not offer 'demos' tab"
    );
    assert.equal(
      appCode.includes("| 'demos'"),
      false,
      "App.tsx must not have 'demos' in openLibraryTab types"
    );
  });

  it('verifies DEMO_MUSIC_TRACKS is replaced or removed from MusicPlayerView', () => {
    assert.equal(
      musicCode.includes('DEMO_MUSIC_TRACKS'),
      false,
      'MusicPlayerView must not export or use DEMO_MUSIC_TRACKS'
    );
  });
});

