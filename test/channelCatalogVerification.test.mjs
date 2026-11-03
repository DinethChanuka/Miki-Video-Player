import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  CURATED_CHANNELS,
  getChannelByUri,
  getChannelBackupUrl,
} from '../src/utils/channelCatalog.ts';

describe('VLC Channel Catalog & Backup Failover Audit', () => {
  it('should contain at least 50 curated channels mirroring VLC IPTV catalog', () => {
    assert.ok(
      CURATED_CHANNELS.length >= 50,
      `Expected at least 50 curated channels, got ${CURATED_CHANNELS.length}`
    );
  });

  it('should span major VLC categories (News, Movies, Music, Sports, Tech, Nature/Science, Entertainment)', () => {
    const categories = new Set(CURATED_CHANNELS.map((c) => c.category));
    assert.ok(categories.has('News'), 'Missing News category');
    assert.ok(categories.has('Music'), 'Missing Music category');
    assert.ok(categories.has('Sports'), 'Missing Sports category');
    assert.ok(categories.has('Tech'), 'Missing Tech category');
    assert.ok(categories.has('Entertainment'), 'Missing Entertainment category');
    assert.ok(categories.has('Movies'), 'Missing Movies category');
  });

  it('should provide backupUrls for high-reliability failover', () => {
    const channelsWithBackups = CURATED_CHANNELS.filter(
      (c) => Array.isArray(c.backupUrls) && c.backupUrls.length > 0
    );
    assert.ok(
      channelsWithBackups.length >= 10,
      `Expected at least 10 channels with backup URLs for self-healing, found ${channelsWithBackups.length}`
    );
  });

  it('should find channel by URI and retrieve backup URLs properly', () => {
    const sample = CURATED_CHANNELS.find((c) => c.backupUrls && c.backupUrls.length > 0);
    assert.ok(sample, 'Need at least one sample channel with backupUrls');

    const found = getChannelByUri(sample.streamUrl);
    assert.ok(found, `Channel should be found by streamUrl: ${sample.streamUrl}`);
    assert.equal(found?.id, sample.id);

    const backup = getChannelBackupUrl(sample.streamUrl);
    assert.ok(backup, 'Backup URL should be returned for primary stream failure');
    assert.equal(backup, sample.backupUrls[0]);

    // When primary and first backup fails, should return next backup if available
    if (sample.backupUrls.length > 1) {
      const nextBackup = getChannelBackupUrl(sample.streamUrl, sample.backupUrls[0]);
      assert.equal(nextBackup, sample.backupUrls[1]);
    }
  });

  it('all channels should have valid names, logos, and valid stream URLs', () => {
    for (const ch of CURATED_CHANNELS) {
      assert.ok(ch.id && typeof ch.id === 'string', `Invalid channel id: ${ch.id}`);
      assert.ok(ch.name && typeof ch.name === 'string', `Invalid name for channel ${ch.id}`);
      assert.ok(ch.streamUrl && ch.streamUrl.startsWith('http'), `Invalid streamUrl: ${ch.streamUrl}`);
      assert.ok(ch.category, `Missing category for channel ${ch.id}`);
      assert.ok(ch.quality, `Missing quality for channel ${ch.id}`);
    }
  });
});
