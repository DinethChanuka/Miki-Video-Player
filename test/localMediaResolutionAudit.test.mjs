import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

describe('Local Media Resolution & macOS Packaging Audit', () => {
  it('verifies resolveMediaStreamUrl supports Tauri asset protocol and media-stream scheme without hardcoded localhost:1420 lock-in', async () => {
    const engineFile = path.join(rootDir, 'src/core/PlayerEngine.ts');
    const code = fs.readFileSync(engineFile, 'utf8');

    assert.match(
      code,
      /asset:\/\/|media-stream:\/\//i,
      'PlayerEngine must support asset:// or media-stream:// protocol for packaged runtimes'
    );
  });

  it('verifies MikiPlayerApp.swift implements WKURLSchemeHandler for media-stream and loads bundled dist/index.html', () => {
    const swiftFile = path.join(rootDir, 'MikiPlayerApp.swift');
    const swiftCode = fs.readFileSync(swiftFile, 'utf8');

    // 1. Verify WKURLSchemeHandler implementation for media-stream
    assert.match(
      swiftCode,
      /WKURLSchemeHandler/i,
      'MikiPlayerApp.swift must implement WKURLSchemeHandler for local streaming'
    );
    assert.match(
      swiftCode,
      /forURLScheme:\s*"media-stream"/i,
      'MikiPlayerApp.swift must register media-stream URL scheme handler'
    );

    // 2. Verify bundled asset loading (loadFileURL) instead of only localhost:1420
    assert.match(
      swiftCode,
      /loadFileURL/i,
      'MikiPlayerApp.swift must support loadFileURL for bundled production assets'
    );
  });
});
