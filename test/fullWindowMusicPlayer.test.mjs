import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

describe('Task 6: Full-Window 3D Cover Flow Music Player Audit', () => {
  const musicPlayerPath = resolve(process.cwd(), 'src/components/music/FullWindowMusicPlayer.tsx');
  const appPath = resolve(process.cwd(), 'src/App.tsx');

  it('verifies FullWindowMusicPlayer component exists and implements 3D Cover Flow transforms', () => {
    assert.ok(existsSync(musicPlayerPath), 'FullWindowMusicPlayer.tsx must exist');
    const code = readFileSync(musicPlayerPath, 'utf-8');

    assert.ok(
      code.includes('rotateY') || code.includes('perspective') || code.includes('preserve-3d'),
      'Must implement 3D Cover Flow perspective carousel'
    );
    assert.ok(
      code.includes('canvas') || code.includes('visualizer'),
      'Must render audio reactive ambient visualizer'
    );
    assert.ok(
      code.includes('lyrics') || code.includes('Lyrics'),
      'Must provide lyrics drawer or viewer'
    );
  });

  it('verifies FullWindowMusicPlayer is wired into App.tsx for full-window music playback', () => {
    const appCode = readFileSync(appPath, 'utf-8');
    assert.ok(
      appCode.includes('FullWindowMusicPlayer'),
      'App.tsx must import and render FullWindowMusicPlayer'
    );
    assert.ok(
      appCode.includes('isMusicPlayerOpen') || appCode.includes('onOpenMusic'),
      'App.tsx must manage music player full-window open state'
    );
  });
});
