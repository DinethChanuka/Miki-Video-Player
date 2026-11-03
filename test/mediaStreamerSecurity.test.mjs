import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

describe('Vite Media Streamer Security & Range Validation Audit', () => {
  it('verifies vite.config.ts validates canonical paths and restricts to media extensions', () => {
    const configPath = path.join(rootDir, 'vite.config.ts');
    const configCode = fs.readFileSync(configPath, 'utf8');

    // 1. Check for media extension restriction / validation
    assert.match(
      configCode,
      /ALLOWED_MEDIA_EXTENSIONS|isAllowedMedia/i,
      'vite.config.ts must validate file extensions against allowed media types'
    );

    // 2. No wildcard CORS
    assert.doesNotMatch(
      configCode,
      /'Access-Control-Allow-Origin':\s*'\*'/i,
      'vite.config.ts must not have wildcard Access-Control-Allow-Origin: *'
    );

    // 3. No filesystem path disclosure in error responses
    assert.doesNotMatch(
      configCode,
      /File not found:\s*\${filePath}/i,
      'vite.config.ts must not disclose raw file system paths in error responses'
    );

    // 4. HTTP 416 Range Not Satisfiable handling
    assert.match(
      configCode,
      /416/,
      'vite.config.ts must return HTTP 416 for invalid or unsatisfiable range requests'
    );
  });
});
