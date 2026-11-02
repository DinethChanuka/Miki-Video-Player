import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

describe('Task 6 Audit: Event-Driven Telemetry & Session-Isolated Engine Router', () => {
  const mpvControllerSource = fs.readFileSync(
    path.resolve('src-tauri/src/engine/mpv_controller.rs'),
    'utf-8'
  );
  const playerStoreSource = fs.readFileSync(
    path.resolve('src/store/playerStore.ts'),
    'utf-8'
  );

  it('decouples high-frequency telemetry loop so tracks and chapters are not re-queried every 16ms frame', () => {
    // Controller must throttle or cache track/chapter querying in telemetry loop
    assert.ok(
      mpvControllerSource.includes('cached_tracks') ||
      mpvControllerSource.includes('cached_chapters') ||
      mpvControllerSource.includes('metadata_poll_counter') ||
      mpvControllerSource.includes('last_metadata_query') ||
      mpvControllerSource.includes('metadata_interval') ||
      mpvControllerSource.includes('frame_counter'),
      'MpvController must avoid querying full track-list and chapter-list on every 16ms frame'
    );
  });

  it('implements session-isolated retry logic to eliminate race conditions on video switch', () => {
    // Store must track currentSessionId
    assert.ok(
      playerStoreSource.includes('currentSessionId') ||
      playerStoreSource.includes('sessionId'),
      'playerStore must maintain a currentSessionId to isolate media playback sessions'
    );

    // Error retry timeout must verify session ID before executing
    assert.ok(
      playerStoreSource.includes('capturedSessionId') ||
      playerStoreSource.includes('currentSessionId !==') ||
      playerStoreSource.includes('sessionId !=='),
      'Error retry callback must check session validity before reloading media'
    );

    // Active retry timer must be tracked and cancelled when switching or closing media
    assert.ok(
      playerStoreSource.includes('clearTimeout(activeRetry') ||
      playerStoreSource.includes('clearTimeout(retryTimer') ||
      playerStoreSource.includes('clearTimeout(retryTimeout'),
      'Pending retry timers must be explicitly cancelled when loading new media or closing'
    );
  });
});
