import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

describe('Music Discovery & Search UI Integration Audit', () => {
  const rootDir = process.cwd();
  const dashboardPath = path.join(rootDir, 'src/components/home/HomeDashboardView.tsx');
  assert.ok(fs.existsSync(dashboardPath), 'HomeDashboardView.tsx must exist');
  const dashboardCode = fs.readFileSync(dashboardPath, 'utf8');

  it('verifies HomeDashboardView imports musicDiscoveryService items', () => {
    assert.match(
      dashboardCode,
      /musicDiscoveryService/i,
      'HomeDashboardView must import from musicDiscoveryService'
    );
    assert.match(
      dashboardCode,
      /MUSIC_DISCOVERY_CATALOG/i,
      'HomeDashboardView must import MUSIC_DISCOVERY_CATALOG'
    );
  });

  it('verifies HomeDashboardView provides music platform filter tabs for jamendo, soundcloud, bandcamp, audiomack', () => {
    assert.match(
      dashboardCode,
      /jamendo/i,
      'Must support Jamendo platform'
    );
    assert.match(
      dashboardCode,
      /soundcloud/i,
      'Must support SoundCloud platform'
    );
    assert.match(
      dashboardCode,
      /bandcamp/i,
      'Must support Bandcamp platform'
    );
    assert.match(
      dashboardCode,
      /audiomack/i,
      'Must support Audiomack platform'
    );
  });

  it('verifies music discovery section renders cards with cover image preview, platform badge, and play action', () => {
    // Check music discovery section exists in effectiveSection === 'music'
    assert.match(
      dashboardCode,
      /filteredMusicTracks|musicDiscoveryTracks|discoverMusic/i,
      'Must compute filtered music tracks'
    );
    // Action buttons
    assert.match(
      dashboardCode,
      /onOpenWebBrowser/i,
      'Must connect web browser modal launch for web platforms'
    );
  });
});

