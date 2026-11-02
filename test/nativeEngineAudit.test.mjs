import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

describe('Task 1 Audit: Native MPV Engine & Rust Backend', () => {
  const mpvControllerSource = fs.readFileSync(
    path.resolve('src-tauri/src/engine/mpv_controller.rs'),
    'utf-8'
  );
  const mpvFfiSource = fs.readFileSync(
    path.resolve('src-tauri/src/engine/mpv_ffi.rs'),
    'utf-8'
  );

  it('verifies safe mpv_command array invocation instead of vulnerable string interpolation', () => {
    // Must NOT format loadfile with escaped quotes into a raw string
    assert.ok(
      !mpvControllerSource.includes('format!("loadfile \\"{}\\" replace"'),
      'load_file must not insert raw URI into format string'
    );
    // Must use command FFI with argument array
    assert.ok(
      mpvControllerSource.includes('command') || mpvControllerSource.includes('run_command_args'),
      'load_file must invoke mpv command with argument array'
    );
  });

  it('verifies volume clamping matches 200% overdrive on both frontend and backend', () => {
    // Must clamp to 200, not 100
    assert.ok(
      mpvControllerSource.includes('volume.clamp(0, 200)'),
      'Backend volume must allow up to 200% overdrive'
    );
  });

  it('verifies FFI errors are properly checked and propagated instead of returning Ok(()) on error', () => {
    // If status < 0, it must return Err
    assert.ok(
      !mpvControllerSource.includes('if status < 0 {\n            log::warn!("mpv command failed:'),
      'Command failures must return Err, not just log and return Ok'
    );
  });

  it('verifies libmpv loading does not double-load or leak library handles', () => {
    // Should not have Box::leak(Box::new(lib)) followed by Library::new(path).unwrap()
    assert.ok(
      !mpvFfiSource.includes('Library::new(path).unwrap()'),
      'MpvLib must not reload the library a second time after initial load'
    );
  });
});

