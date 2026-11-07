import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

describe('Dedicated Music & Live Radio Sections Audit', () => {
  const rootDir = process.cwd();
  const dashboardPath = path.join(rootDir, 'src/components/home/HomeDashboardView.tsx');
  const dashboardCode = fs.readFileSync(dashboardPath, 'utf8');

  it('verifies HomeNavTab and HomeViewCategory include dedicated radio types', () => {
    assert.match(
      dashboardCode,
      /export\s+type\s+HomeNavTab[\s\S]*?['"]radio['"]/i,
      'HomeNavTab must include radio'
    );
    assert.match(
      dashboardCode,
      /export\s+type\s+HomeViewCategory[\s\S]*?['"]Radio['"]/i,
      'HomeViewCategory must include Radio'
    );
  });

  it('verifies side navigation bar contains separate 3D Music and Music Radio Live buttons', () => {
    assert.match(
      dashboardCode,
      /setActiveNav\(['"]music['"]\)/,
      'Side nav must have dedicated 3D Music button'
    );
    assert.match(
      dashboardCode,
      /setActiveNav\(['"]radio['"]\)/,
      'Side nav must have dedicated Music Radio Live button'
    );
    assert.match(
      dashboardCode,
      /Music Radio Live|Live Radio/i,
      'Side nav must label radio section clearly'
    );
  });

  it('verifies effectiveSection supports distinct music and radio modes', () => {
    assert.match(
      dashboardCode,
      /effectiveSection[\s\S]*?['"]radio['"]/,
      'effectiveSection must support radio mode'
    );
    assert.match(
      dashboardCode,
      /effectiveSection\s*===\s*['"]radio['"]/,
      'Must have dedicated block for effectiveSection === radio'
    );
  });

  it('verifies radio stations are isolated in effectiveSection === radio and not mixed into music view', () => {
    // effectiveSection === 'music' block should not contain 24/7 Live Internet Radio Stations
    const musicBlockMatch = dashboardCode.match(/effectiveSection === ['"]music['"]\s*\?\s*\([\s\S]*?\)\s*:\s*effectiveSection/);
    assert.ok(musicBlockMatch, 'Must find effectiveSection === music block');
    assert.equal(
      /24\/7 Live Internet Radio Stations/i.test(musicBlockMatch[0]),
      false,
      'effectiveSection === music must not contain radio stations (moved to radio section)'
    );

    // effectiveSection === 'radio' block must contain INTERNET_MUSIC_STREAMS
    const radioBlockMatch = dashboardCode.match(/effectiveSection === ['"]radio['"][\s\S]*?INTERNET_MUSIC_STREAMS/);
    assert.ok(radioBlockMatch, 'effectiveSection === radio must contain INTERNET_MUSIC_STREAMS');
  });

  it('verifies music section contains dedicated live search and multi-platform cards', () => {
    assert.match(
      dashboardCode,
      /searchMusicOnline|filteredMusicTracks/i,
      'Music section must compute search results'
    );
    assert.match(
      dashboardCode,
      /Sound Lounge|Online Music Discovery & Search/i,
      'Music section must display Sound Lounge header'
    );
  });
});

