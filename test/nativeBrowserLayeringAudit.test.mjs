import { describe, it } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';

describe('Task 1: Native WebKit Browser Layering & Configuration Audit', () => {
  const swiftPath = path.resolve(process.cwd(), 'MikiPlayerApp.swift');
  const swiftCode = fs.readFileSync(swiftPath, 'utf-8');

  it('verifies MikiPlayerApp.swift sets a desktop Safari User-Agent on browserWebView', () => {
    assert.match(
      swiftCode,
      /bView\.customUserAgent\s*=\s*"Mozilla\/5\.0.*Version\/.*Safari\//,
      'bView must set a desktop Safari User-Agent to bypass Cloudflare/anti-bot blocks'
    );
  });

  it('verifies case "open" resets alphaValue, unhides view, and updates layout in correct order', () => {
    const openBlockMatch = swiftCode.match(/case\s+"open":([\s\S]*?)case\s+"close":/);
    assert.ok(openBlockMatch, 'Must find case "open" block');
    const openBlock = openBlockMatch[1];

    assert.match(
      openBlock,
      /bView\.alphaValue\s*=\s*1\.0/,
      'case "open" must explicitly reset bView.alphaValue = 1.0'
    );

    assert.match(
      openBlock,
      /bView\.isHidden\s*=\s*false[\s\S]*updateBrowserViewLayout/,
      'case "open" must set isHidden = false BEFORE updateBrowserViewLayout'
    );

    assert.match(
      openBlock,
      /addSubview\(bView,\s*positioned:\s*\.above,\s*relativeTo:\s*self\.webView\)/,
      'case "open" must bring bView above webView in subview hierarchy'
    );
  });
});
