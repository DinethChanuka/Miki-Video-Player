import { describe, it } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

describe('Native Web Browser Engine & X-Frame-Options Resolution Audit', () => {
  it('verifies MikiPlayerApp.swift configures native top-level WKWebView with window resizing and 44px top-bar clearance', () => {
    const swiftCode = fs.readFileSync(path.join(rootDir, 'MikiPlayerApp.swift'), 'utf-8');

    // Must define browserWebView
    assert.match(
      swiftCode,
      /var\s+browserWebView:\s*WKWebView\?/i,
      'MikiPlayerApp.swift must declare optional native browserWebView'
    );

    // Must calculate frame with 44pt clearance for top bar
    assert.match(
      swiftCode,
      /height\s*-\s*44/i,
      'browserWebView frame must leave 44pt clearance for the top bar'
    );

    // Must track windowDidResize to maintain frame bounds during window maximize/resize
    assert.match(
      swiftCode,
      /windowDidResize/i,
      'AppDelegate must update browserWebView bounds in windowDidResize'
    );
  });

  it('verifies MikiPlayerApp.swift handles browserViewAction and browserMediaDetected IPC handlers', () => {
    const swiftCode = fs.readFileSync(path.join(rootDir, 'MikiPlayerApp.swift'), 'utf-8');

    // Must register script message handlers
    assert.ok(
      swiftCode.includes('browserViewAction'),
      'Must register browserViewAction script message handler'
    );
    assert.ok(
      swiftCode.includes('browserMediaDetected'),
      'Must register browserMediaDetected script message handler'
    );

    // Must handle open, close, and reload actions
    assert.ok(swiftCode.includes('"open"'), 'Must handle open action');
    assert.ok(swiftCode.includes('"close"'), 'Must handle close action');
    assert.ok(swiftCode.includes('"reload"'), 'Must handle reload action');
  });

  it('verifies target=_blank clicks on movie links navigate in-place instead of dropping clicks', () => {
    const swiftCode = fs.readFileSync(path.join(rootDir, 'MikiPlayerApp.swift'), 'utf-8');

    // Must intercept target="_blank" navigations
    assert.match(
      swiftCode,
      /createWebViewWith/i,
      'MikiPlayerApp.swift must implement createWebViewWith for popup and blank target interception'
    );
  });

  it('verifies WebBrowserModal.tsx synchronizes with native browserViewAction IPC for seamless browsing', () => {
    const browserCode = fs.readFileSync(path.join(rootDir, 'src/components/hud/WebBrowserModal.tsx'), 'utf-8');

    // Must post browserViewAction messages
    assert.match(
      browserCode,
      /browserViewAction\.postMessage/i,
      'WebBrowserModal.tsx must post message to native browserViewAction handler'
    );

    // Must listen for media detection and loading events
    assert.match(
      browserCode,
      /miki:browser-media-detected/i,
      'WebBrowserModal.tsx must listen for miki:browser-media-detected events'
    );
  });
});

