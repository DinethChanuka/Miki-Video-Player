import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { CURATED_CHANNELS, getChannelBackupUrl } from '../src/utils/channelCatalog.ts';

describe('Task 3: 100+ Curated Live Channels & Unique Logos Audit', () => {
  it('verifies CURATED_CHANNELS contains at least 100 channels', () => {
    assert.ok(
      CURATED_CHANNELS.length >= 100,
      `Expected at least 100 curated channels, found ${CURATED_CHANNELS.length}`
    );
  });

  it('verifies 100% of channels have at least 2 backup URLs', () => {
    const deficient = CURATED_CHANNELS.filter(
      (c) => !c.backupUrls || c.backupUrls.length < 2
    ).map((c) => c.name);

    assert.equal(
      deficient.length,
      0,
      `The following channels have fewer than 2 backups: ${deficient.join(', ')}`
    );
  });

  it('verifies 100% of channels have unique logo URLs (no duplicates)', () => {
    const seen = new Set();
    const duplicates = [];

    for (const channel of CURATED_CHANNELS) {
      assert.ok(channel.logo, `Channel ${channel.name} must have a logo`);
      if (seen.has(channel.logo)) {
        duplicates.push(`${channel.name}: ${channel.logo}`);
      }
      seen.add(channel.logo);
    }

    assert.equal(
      duplicates.length,
      0,
      `Found duplicate logos across channels: ${duplicates.join(' | ')}`
    );
  });

  it('verifies diverse categorization across major VLC categories', () => {
    const categories = new Set(CURATED_CHANNELS.map((c) => c.category));
    assert.ok(categories.has('News'), 'Must include News');
    assert.ok(categories.has('Movies'), 'Must include Movies');
    assert.ok(categories.has('Music'), 'Must include Music');
    assert.ok(categories.has('Sports'), 'Must include Sports');
    assert.ok(categories.has('Tech'), 'Must include Tech');
    assert.ok(categories.has('Nature'), 'Must include Nature');
  });
});
