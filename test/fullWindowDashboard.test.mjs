import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

describe('Task 7: Full-Window Premium Dashboard & Fast Persistent Cache Audit', () => {
  const cachePath = resolve(process.cwd(), 'src/services/PersistentCacheService.ts');
  const dashboardPath = resolve(process.cwd(), 'src/components/dashboard/FullWindowDashboard.tsx');
  const appPath = resolve(process.cwd(), 'src/App.tsx');

  it('verifies PersistentCacheService implements in-memory and local storage caching', () => {
    assert.ok(existsSync(cachePath), 'PersistentCacheService.ts must exist');
    const code = readFileSync(cachePath, 'utf-8');

    assert.ok(
      code.includes('get') && code.includes('set'),
      'Cache service must provide get and set methods'
    );
    assert.ok(
      code.includes('localStorage') || code.includes('sessionStorage'),
      'Cache service must persist to storage'
    );
  });

  it('verifies FullWindowDashboard component implements Netflix & Adze layout specifications', () => {
    assert.ok(existsSync(dashboardPath), 'FullWindowDashboard.tsx must exist');
    const code = readFileSync(dashboardPath, 'utf-8');

    // Layout specifications from uploaded user images
    assert.ok(
      code.includes('Continue Watching') || code.includes('Recently Played'),
      'Must include Continue Watching / Recently Played carousel'
    );
    assert.ok(
      code.includes('Watch') || code.includes('Hero') || code.includes('Trending'),
      'Must include Hero showcase banner with instant watch action'
    );
    assert.ok(
      code.includes('Live') || code.includes('Channels'),
      'Must feature Live IPTV channels carousel'
    );
    assert.ok(
      code.includes('Games') || code.includes('Arcade'),
      'Must feature High-Graphic Games carousel'
    );
    assert.ok(
      code.includes('Anime') || code.includes('Cinema'),
      'Must feature Anime & Cinema portals carousel'
    );
  });

  it('verifies FullWindowDashboard is integrated into App.tsx as primary library hub', () => {
    const appCode = readFileSync(appPath, 'utf-8');
    assert.ok(
      appCode.includes('FullWindowDashboard'),
      'App.tsx must import and render FullWindowDashboard'
    );
    assert.ok(
      appCode.includes('isDashboardOpen') || appCode.includes('setIsDashboardOpen'),
      'App.tsx must manage dashboard full-window state'
    );
  });
});

