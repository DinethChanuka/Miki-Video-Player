import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

describe('Task 5 Audit: Zustand State Immutability & Atomic SQLite Persistence', () => {
  const storeSource = fs.readFileSync(
    path.resolve('src/store/playerStore.ts'),
    'utf-8'
  );
  const dbModSource = fs.readFileSync(
    path.resolve('src-tauri/src/db/mod.rs'),
    'utf-8'
  );
  const commandsSource = fs.readFileSync(
    path.resolve('src-tauri/src/commands.rs'),
    'utf-8'
  );

  it('ensures recentMedia telemetry updates are immutable and produce new state references', () => {
    // Must NOT mutate target.progressPercent directly without set()
    assert.ok(
      !storeSource.includes('target.progressPercent = pct'),
      'Store must not directly mutate target.progressPercent in-place'
    );
    // Must update immutably via set() and .map()
    assert.ok(
      storeSource.includes('recentMedia: updatedRecents') ||
      storeSource.includes('recentMedia: updated'),
      'Store must call set({ recentMedia }) with a newly mapped array'
    );
  });

  it('prevents setEqualizer from wiping existing audio/subtitle tracks and preferences', () => {
    // Find the implementation of setEqualizer in storeSource
    const setEqualizerIdx = storeSource.indexOf('setEqualizer: async');
    const setEqualizerBlock = storeSource.substring(setEqualizerIdx, setEqualizerIdx + 600);

    // It must NOT hardcode audioTrackId: null or subtitleTrackId: null
    assert.ok(
      !setEqualizerBlock.includes('audioTrackId: null'),
      'setEqualizer must not overwrite active audioTrackId with null'
    );
    assert.ok(
      !setEqualizerBlock.includes('subtitleTrackId: null'),
      'setEqualizer must not overwrite active subtitleTrackId with null'
    );
  });

  it('implements atomic partial preference updates in Rust database manager', () => {
    assert.ok(
      dbModSource.includes('update_eq_preferences') ||
      dbModSource.includes('save_partial_preferences'),
      'Rust SQLite DatabaseManager must support partial EQ preference updates'
    );
    assert.ok(
      commandsSource.includes('db_update_eq_preferences') ||
      commandsSource.includes('update_eq_preferences'),
      'Rust commands must expose partial preference update endpoint'
    );
  });
});

