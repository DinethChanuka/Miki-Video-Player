import { describe, it } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';

describe('Task 2: 100% Channel Mirror Coverage & Resilient Store Failover Audit', () => {
  it('verifies getChannelByName is exported and finds channel by exact or normalized name', async () => {
    const catalogModule = await import('../src/utils/channelCatalog.ts');
    assert.equal(typeof catalogModule.getChannelByName, 'function', 'getChannelByName must be exported as a function');

    const nasa = catalogModule.getChannelByName('NASA TV Public HD');
    assert.ok(nasa, 'Must find NASA TV Public HD by name');
    assert.equal(nasa.id, 'nasa-tv');

    const france = catalogModule.getChannelByName('france 24 english live');
    assert.ok(france, 'Must find France 24 case-insensitively');
    assert.equal(france.id, 'france-24-en');
  });

  it('verifies 100% of all 63 channels in CURATED_CHANNELS have at least 2 verified backup URLs', async () => {
    const { CURATED_CHANNELS } = await import('../src/utils/channelCatalog.ts');
    assert.ok(CURATED_CHANNELS.length >= 60, 'Catalog must contain 60+ channels');

    const failingChannels = [];
    for (const channel of CURATED_CHANNELS) {
      if (!channel.backupUrls || channel.backupUrls.length < 2) {
        failingChannels.push({ id: channel.id, name: channel.name, backups: channel.backupUrls?.length || 0 });
      }
    }

    assert.equal(
      failingChannels.length,
      0,
      `Every channel must have at least 2 backup URLs. Found ${failingChannels.length} without 2 backups: ${JSON.stringify(failingChannels.slice(0, 5))}`
    );
  });

  it('verifies playerStore matches failed channels by name and curUri with top-level channelCatalog integration', () => {
    const storePath = path.resolve(process.cwd(), 'src/store/playerStore.ts');
    const storeCode = fs.readFileSync(storePath, 'utf-8');

    assert.match(
      storeCode,
      /getChannelByName\s*\(curTitle\)/,
      'playerStore must look up failed channels by title/name to guarantee failover even if URI params differed'
    );
    assert.match(
      storeCode,
      /getChannelByUri\s*\(curUri\)/,
      'playerStore must also look up failed channels by URI'
    );
  });
});

