import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

describe('Native Stream Detection & Fragment Filtering Audit', () => {
  it('verifies MikiPlayerApp.swift excludes raw .ts fragments from standalone media detection', () => {
    const swiftPath = path.join(rootDir, 'MikiPlayerApp.swift');
    const swiftCode = fs.readFileSync(swiftPath, 'utf8');

    // Make sure mediaRegex does NOT treat raw .ts fragments as standalone videos
    const match = swiftCode.match(/var\s+mediaRegex\s*=\s*\/[\\.]+\(([^)]+)\)/);
    assert.ok(match, 'mediaRegex must be defined in Swift script');
    const extensions = match[1].split('|');
    assert.ok(
      !extensions.includes('ts'),
      'mediaRegex must not include raw .ts fragments which fail in HTML5 video elements'
    );
  });

  it('verifies WebBrowserModal cleanly launches detected stream or web embed in player', () => {
    const modalPath = path.join(rootDir, 'src/components/hud/WebBrowserModal.tsx');
    const modalCode = fs.readFileSync(modalPath, 'utf8');

    assert.match(
      modalCode,
      /onPlayInNativePlayer/i,
      'WebBrowserModal must wire onPlayInNativePlayer'
    );
    assert.match(
      modalCode,
      /detectedMediaUrl/i,
      'WebBrowserModal must detect media URL'
    );
  });
});
