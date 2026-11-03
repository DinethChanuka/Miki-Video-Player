import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { StreamFailoverManager } from '../src/core/StreamFailoverManager.ts';

describe('StreamFailoverManager Controller Audit', () => {
  it('initializes with primary URL and backup URLs', () => {
    const manager = new StreamFailoverManager({
      primaryUrl: 'https://example.com/primary.m3u8',
      backupUrls: ['https://example.com/backup1.m3u8', 'https://example.com/backup2.m3u8'],
      maxRetriesPerSource: 2,
    });

    assert.equal(manager.getCurrentUrl(), 'https://example.com/primary.m3u8');
    assert.equal(manager.isExhausted(), false);
  });

  it('cycles through backup URLs when current source fails beyond retry threshold', () => {
    const manager = new StreamFailoverManager({
      primaryUrl: 'https://example.com/primary.m3u8',
      backupUrls: ['https://example.com/backup1.m3u8', 'https://example.com/backup2.m3u8'],
      maxRetriesPerSource: 1,
    });

    // First failure on primary (retry 1 of 1)
    const retry1 = manager.recordFailure('timeout');
    assert.equal(retry1.action, 'retry');
    assert.equal(retry1.url, 'https://example.com/primary.m3u8');

    // Second failure on primary (threshold exceeded -> failover to backup1)
    const failover1 = manager.recordFailure('timeout');
    assert.equal(failover1.action, 'switch_source');
    assert.equal(failover1.url, 'https://example.com/backup1.m3u8');
    assert.equal(manager.getCurrentUrl(), 'https://example.com/backup1.m3u8');

    // Failure on backup1 (threshold exceeded -> failover to backup2)
    manager.recordFailure('timeout');
    const failover2 = manager.recordFailure('timeout');
    assert.equal(failover2.action, 'switch_source');
    assert.equal(failover2.url, 'https://example.com/backup2.m3u8');

    // Failure on backup2 (threshold exceeded -> all sources exhausted)
    manager.recordFailure('timeout');
    const exhausted = manager.recordFailure('timeout');
    assert.equal(exhausted.action, 'exhausted');
    assert.equal(manager.isExhausted(), true);
  });

  it('cancels pending failovers and invalidates session when cancelled or reset', () => {
    const manager = new StreamFailoverManager({
      primaryUrl: 'https://example.com/primary.m3u8',
      backupUrls: ['https://example.com/backup1.m3u8'],
    });

    const sessionId = manager.getSessionId();
    manager.cancel();
    assert.notEqual(manager.getSessionId(), sessionId);
    assert.equal(manager.isSessionActive(sessionId), false);
  });
});

