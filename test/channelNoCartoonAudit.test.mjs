import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  CURATED_CHANNELS,
  getChannelBackupUrl,
  getChannelByName,
  getChannelByUri,
} from '../src/utils/channelCatalog.ts';

describe('Task 2: Zero Bunny Cartoon & Verified Live IPTV Stream Coverage Audit', () => {
  it('verifies zero occurrences of Big Buck Bunny or demo video files in CURATED_CHANNELS stream URLs', () => {
    const invalidStreams = CURATED_CHANNELS.filter((ch) =>
      /bunny|mux\.dev|cph-p2p|tears_of_steel|sintel/i.test(ch.streamUrl)
    );
    assert.deepEqual(
      invalidStreams.map((c) => ({ id: c.id, name: c.name, streamUrl: c.streamUrl })),
      [],
      'No curated channel should use sample videos or bunny cartoon streams as its primary stream'
    );
  });

  it('verifies zero occurrences of Big Buck Bunny or demo video files in backupUrls', () => {
    const invalidBackups = [];
    CURATED_CHANNELS.forEach((ch) => {
      (ch.backupUrls || []).forEach((b) => {
        if (/bunny|mux\.dev|cph-p2p|tears_of_steel|sintel/i.test(b)) {
          invalidBackups.push({ channel: ch.name, backupUrl: b });
        }
      });
    });
    assert.deepEqual(
      invalidBackups,
      [],
      'Backup URLs must be legitimate live stream mirrors and never bunny cartoon files'
    );
  });

  it('verifies no channel title contains Big Buck Bunny or mock video labels', () => {
    const mockTitles = CURATED_CHANNELS.filter((ch) =>
      /big buck bunny|tears of steel/i.test(ch.name)
    );
    assert.deepEqual(
      mockTitles.map((c) => c.name),
      [],
      'Channel titles must represent real broadcast channels'
    );
  });

  it('verifies 100% of channels have at least 2 backup mirrors', () => {
    const underProvisioned = CURATED_CHANNELS.filter(
      (c) => !c.backupUrls || c.backupUrls.length < 2
    );
    assert.deepEqual(
      underProvisioned.map((c) => c.name),
      [],
      'All channels must have at least 2 backup URLs'
    );
  });

  it('verifies getChannelBackupUrl works with channel name or URI', () => {
    const sample = CURATED_CHANNELS[0];
    const backupFromName = getChannelBackupUrl(sample.name);
    const backupFromUri = getChannelBackupUrl(sample.streamUrl);
    assert.ok(backupFromName, 'getChannelBackupUrl must resolve by channel name');
    assert.ok(backupFromUri, 'getChannelBackupUrl must resolve by channel streamUrl');
    assert.equal(backupFromName, sample.backupUrls[0]);
  });
});
