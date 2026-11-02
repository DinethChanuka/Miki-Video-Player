import { describe, it } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

describe('Player Lifecycle & Web State Synchronization Audit', () => {
  it('verifies WebBrowserModal closes web browser when routing detected media to system engine', () => {
    const modalCode = fs.readFileSync(path.join(rootDir, 'src/components/hud/WebBrowserModal.tsx'), 'utf-8');

    assert.match(
      modalCode,
      /handleClose\(\);[\s\S]*onPlayInNativePlayer\(/i,
      'WebBrowserModal must close web view before starting system playback'
    );
  });

  it('verifies MikiPlayerApp.swift unloads about:blank and returns first responder to main webView on close', () => {
    const swiftCode = fs.readFileSync(path.join(rootDir, 'MikiPlayerApp.swift'), 'utf-8');

    assert.match(swiftCode, /about:blank/);
    assert.match(swiftCode, /makeFirstResponder\(self\.webView\)/);
  });
});
