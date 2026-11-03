import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

describe('Library Modal Channels Tab & Games Gallery Audit', () => {
  const fileBrowserModalSource = readFileSync(
    resolve(process.cwd(), 'src/components/hud/FileBrowserModal.tsx'),
    'utf-8'
  );

  it('verifies FileBrowserModal includes channels in TabType and navigation tabs', () => {
    assert.ok(
      fileBrowserModalSource.includes("'channels'"),
      'FileBrowserModal TabType must include channels'
    );
    assert.ok(
      fileBrowserModalSource.includes('setActiveTab(\'channels\')'),
      'FileBrowserModal must include a button to activate channels tab'
    );
    assert.ok(
      fileBrowserModalSource.includes('CURATED_CHANNELS'),
      'FileBrowserModal must import and display CURATED_CHANNELS'
    );
  });

  it('verifies FileBrowserModal renders channels tab content with 1-click play', () => {
    assert.ok(
      fileBrowserModalSource.includes("activeTab === 'channels'"),
      'FileBrowserModal must have conditional rendering for activeTab === channels'
    );
    assert.ok(
      fileBrowserModalSource.includes('openMedia(ch.streamUrl') || fileBrowserModalSource.includes('openMedia(channel.streamUrl'),
      'Channels tab must call openMedia on channel click'
    );
  });
});

