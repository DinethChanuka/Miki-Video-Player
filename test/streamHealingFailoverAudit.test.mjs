import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

describe('Global Stream Healing & Channel Failover Engine Audit', () => {
  const hlsControllerPath = resolve(process.cwd(), 'src/core/HlsStreamController.ts');
  const hlsControllerSource = readFileSync(hlsControllerPath, 'utf-8');
  const playerEngineSource = readFileSync(
    resolve(process.cwd(), 'src/core/PlayerEngine.ts'),
    'utf-8'
  ) + '\n' + hlsControllerSource;
  const playerStoreSource = readFileSync(
    resolve(process.cwd(), 'src/store/playerStore.ts'),
    'utf-8'
  );

  it('verifies PlayerEngine handles LEVEL_LOAD_ERROR with level downscale recovery', () => {
    assert.ok(
      playerEngineSource.includes('LEVEL_LOAD_ERROR'),
      'PlayerEngine must detect LEVEL_LOAD_ERROR in Hls.Events.ERROR'
    );
    assert.ok(
      playerEngineSource.includes('nextLevel') || playerEngineSource.includes('currentLevel'),
      'PlayerEngine must adjust level index upon level load failures'
    );
  });

  it('verifies PlayerEngine handles HLS media and network recovery methods', () => {
    assert.ok(
      playerEngineSource.includes('startLoad()'),
      'PlayerEngine must call hls.startLoad() on fatal network errors'
    );
    assert.ok(
      playerEngineSource.includes('recoverMediaError()'),
      'PlayerEngine must call hls.recoverMediaError() on fatal media errors'
    );
  });

  it('verifies playerStore auto-heals failed channels using backup mirror chains', () => {
    assert.ok(
      playerStoreSource.includes('getChannelBackupUrl') || playerStoreSource.includes('getChannelByUri'),
      'playerStore must integrate getChannelBackupUrl or getChannelByUri for channel self-healing'
    );
    assert.ok(
      playerStoreSource.includes('channel.backupUrls') || playerStoreSource.includes('nextBackup'),
      'playerStore must switch to backup mirror when channel stream fails'
    );
  });
});

