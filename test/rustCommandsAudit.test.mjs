import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

describe('Rust Backend & Tauri Commands Audit', () => {
  it('verifies load_media_file declares mutable guard to satisfy load_file(&mut self)', () => {
    const commandsPath = path.join(rootDir, 'src-tauri/src/commands.rs');
    const commandsCode = fs.readFileSync(commandsPath, 'utf8');

    // Find load_media_file function definition
    const loadFnMatch = commandsCode.match(
      /pub\s+async\s+fn\s+load_media_file[\s\S]*?\{([\s\S]*?)\}/
    );
    assert.ok(loadFnMatch, 'load_media_file command must exist');

    const fnBody = loadFnMatch[1];
    assert.match(
      fnBody,
      /let\s+mut\s+guard\s*=\s*controller\.lock\(\);/,
      'load_media_file must declare guard as mutable: let mut guard = controller.lock();'
    );
    assert.match(
      fnBody,
      /guard\.load_file\(&uri,\s*start_position_ms\)/,
      'guard.load_file must be called with &uri and start_position_ms'
    );
  });

  it('verifies mpv_controller queries demuxer-cache-time and paused-for-cache for genuine telemetry', () => {
    const mpvControllerPath = path.join(rootDir, 'src-tauri/src/engine/mpv_controller.rs');
    const mpvCode = fs.readFileSync(mpvControllerPath, 'utf8');

    assert.match(
      mpvCode,
      /demuxer-cache-time/,
      'mpv_controller must query demuxer-cache-time property'
    );
    assert.match(
      mpvCode,
      /paused-for-cache/,
      'mpv_controller must query paused-for-cache property'
    );
    assert.match(
      mpvCode,
      /buffered_ms:\s*\(\(pos_sec\s*\+\s*demuxer_cache_sec\)/,
      'mpv_controller must calculate buffered_ms from pos_sec + demuxer_cache_sec'
    );
  });
});
