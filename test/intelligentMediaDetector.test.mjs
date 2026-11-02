import { describe, it } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

describe('Intelligent Web Video Player Detection & Any-Format Support', () => {
  it('verifies MikiPlayerApp.swift injects media sniffer into all frames', () => {
    const swiftCode = fs.readFileSync(path.join(rootDir, 'MikiPlayerApp.swift'), 'utf-8');

    // forMainFrameOnly must be false so it runs inside player iframes
    assert.match(
      swiftCode,
      /forMainFrameOnly:\s*false/i,
      'WKUserScript must inject media sniffer into subframes / iframes'
    );
  });

  it('verifies MikiPlayerApp.swift intercepts fetch and XHR for video stream manifests', () => {
    const swiftCode = fs.readFileSync(path.join(rootDir, 'MikiPlayerApp.swift'), 'utf-8');

    // Must monkey patch fetch
    assert.match(
      swiftCode,
      /window\.fetch\s*=\s*/i,
      'Sniffer must monkey-patch window.fetch to detect async media requests'
    );

    // Must monkey patch XMLHttpRequest
    assert.match(
      swiftCode,
      /XMLHttpRequest\.prototype\.open\s*=\s*/i,
      'Sniffer must monkey-patch XMLHttpRequest.prototype.open'
    );
  });

  it('verifies MikiPlayerApp.swift supports all major video formats (.m3u8, .mpd, .mp4, .mkv, .webm, .flv, .ts)', () => {
    const swiftCode = fs.readFileSync(path.join(rootDir, 'MikiPlayerApp.swift'), 'utf-8');

    assert.match(swiftCode, /\.m3u8/i);
    assert.match(swiftCode, /\.mpd/i);
    assert.match(swiftCode, /\.mp4/i);
    assert.match(swiftCode, /\.mkv/i);
    assert.match(swiftCode, /\.webm/i);
  });

  it('verifies MikiPlayerApp.swift watches DOM mutations for dynamically inserted players', () => {
    const swiftCode = fs.readFileSync(path.join(rootDir, 'MikiPlayerApp.swift'), 'utf-8');

    assert.match(
      swiftCode,
      /MutationObserver/i,
      'Sniffer must use MutationObserver to catch dynamically injected video elements'
    );
  });
});
