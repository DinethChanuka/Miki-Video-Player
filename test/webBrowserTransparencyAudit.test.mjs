import { describe, it } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';

describe('Task 2: WebBrowserModal Transparency and Fallback Resilience', () => {
  const modalPath = path.resolve(process.cwd(), 'src/components/hud/WebBrowserModal.tsx');
  const modalCode = fs.readFileSync(modalPath, 'utf-8');

  it('verifies WebBrowserModal uses transparent viewport background when native browser is active', () => {
    // When isNativeBrowserSupported is true, outer container must not force opaque solid background
    assert.match(
      modalCode,
      /isNativeBrowserSupported\s*\?\s*['"][^'"]*bg-transparent[^'"]*['"]\s*:\s*['"][^'"]*bg-\[#06080d\]/,
      'WebBrowserModal container must use bg-transparent when isNativeBrowserSupported is true to reveal native WKWebView'
    );
  });

  it('verifies viewport overlay uses pointer-events-none when native browser is active', () => {
    assert.match(
      modalCode,
      /pointer-events-none/,
      'Viewport container must allow pointer events to pass through to native WKWebView'
    );
  });

  it('verifies iframe fallback handles frame errors with a helpful stream player fallback', () => {
    assert.match(
      modalCode,
      /handlePlayInPlayer|onPlayInNativePlayer/,
      'Must offer 1-click play in native player when frame encounters errors'
    );
  });
});
