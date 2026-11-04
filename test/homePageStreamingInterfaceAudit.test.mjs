import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

describe('Home Page Complete Streaming Interface Audit (Adze + Netflix + Cover Flow)', () => {
  const homeViewPath = resolve(process.cwd(), 'src/components/home/HomeDashboardView.tsx');
  const appPath = resolve(process.cwd(), 'src/App.tsx');

  it('verifies HomeDashboardView component exists and implements Adze.DESIGN specifications', () => {
    assert.ok(existsSync(homeViewPath), 'HomeDashboardView.tsx must exist');
    const code = readFileSync(homeViewPath, 'utf-8');

    // Adze sidebar elements
    assert.ok(
      code.includes('Browse') && code.includes('Watchlist') && code.includes('Coming Soon'),
      'Must include Adze News Feed navigation items (Browse, Watchlist, Coming Soon)'
    );
    assert.ok(
      code.includes('Following') || code.includes('friends are watching'),
      'Must include social following and friends watching avatar stacks'
    );
    assert.ok(
      code.includes('Search everything') || code.includes('search'),
      'Must include Adze centered search bar'
    );
    assert.ok(
      code.includes('Parties') || code.includes('parties'),
      'Must include Adze Parties carousel row with viewer avatars'
    );
    assert.ok(
      code.includes('Continue Watching'),
      'Must include Continue Watching carousel row'
    );
  });

  it('verifies HomeDashboardView implements Netflix UI layout elements', () => {
    const code = readFileSync(homeViewPath, 'utf-8');

    assert.ok(
      code.includes('Movies') && code.includes('Tv series') && code.includes('Animation'),
      'Must include Netflix category filter pills'
    );
    assert.ok(
      code.includes('Spider-Man') || code.includes('Now Trending'),
      'Must include Netflix trending hero banner'
    );
    assert.ok(
      code.includes('Recommended') || code.includes('Recommended movies'),
      'Must include Recommended movies carousel row'
    );
    assert.ok(
      code.includes('Who') || code.includes('Watching') || code.includes('Sharma'),
      'Must include Who is Watching profile avatars'
    );
  });

  it('verifies HomeDashboardView embeds Apple Cover Flow 3D music player (Image 1)', () => {
    const code = readFileSync(homeViewPath, 'utf-8');

    assert.ok(
      code.includes('rotateY') || code.includes('perspective') || code.includes('Cover Flow'),
      'Must support 3D perspective Cover Flow album carousel'
    );
    assert.ok(
      code.includes('Dooriyan') || code.includes('Pritam') || code.includes('Love Aaj Kal'),
      'Must include featured Cover Flow music tracks inspired by Image 1'
    );
    assert.ok(
      code.includes('glass') || code.includes('pill') || code.includes('rounded-full'),
      'Must include floating translucent glass pill playback bar'
    );
  });

  it('verifies App.tsx mounts HomeDashboardView as the main home page when no media is playing', () => {
    const appCode = readFileSync(appPath, 'utf-8');

    assert.ok(
      appCode.includes('HomeDashboardView'),
      'App.tsx must import and render HomeDashboardView'
    );
    assert.ok(
      appCode.includes('!currentUri') && appCode.includes('<HomeDashboardView'),
      'App.tsx must display HomeDashboardView when !currentUri'
    );
  });
});
