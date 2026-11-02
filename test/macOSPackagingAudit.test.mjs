import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

describe('Thumbnail Resolution, libmpv Candidates & macOS Packaging Audit', () => {
  it('verifies thumb:// protocol handler in src-tauri/src/lib.rs passes real media path instead of empty string', () => {
    const libPath = path.join(rootDir, 'src-tauri/src/lib.rs');
    const libCode = fs.readFileSync(libPath, 'utf8');

    // Make sure thumb handler doesn't pass hardcoded empty string "" to get_or_extract_thumbnail
    assert.doesNotMatch(
      libCode,
      /get_or_extract_thumbnail\(\s*""\s*,/i,
      'thumb:// handler must NOT pass an empty string "" to get_or_extract_thumbnail'
    );
  });

  it('verifies mpv_ffi.rs searches for bundled libmpv in app Frameworks directory', () => {
    const ffiPath = path.join(rootDir, 'src-tauri/src/engine/mpv_ffi.rs');
    const ffiCode = fs.readFileSync(ffiPath, 'utf8');

    assert.match(
      ffiCode,
      /@executable_path\/\.\.\/Frameworks\/libmpv/i,
      'mpv_ffi.rs must search @executable_path/../Frameworks/ for bundled libmpv'
    );
  });

  it('verifies scripts/package-mac.sh signs the bundle with ad-hoc signature', () => {
    const scriptPath = path.join(rootDir, 'scripts/package-mac.sh');
    const scriptCode = fs.readFileSync(scriptPath, 'utf8');

    assert.match(
      scriptCode,
      /codesign\s+--force\s+--deep/i,
      'package-mac.sh must codesign the macOS app bundle'
    );
  });
});
