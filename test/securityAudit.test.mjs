import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { validateSafeMediaUri } from '../src/utils/urlSecurity.ts';

describe('Task 7 Audit: Tauri Security, Strict CSP & URI Validation', () => {
  const tauriConfigRaw = fs.readFileSync(
    path.resolve('src-tauri/tauri.conf.json'),
    'utf-8'
  );
  const tauriConfig = JSON.parse(tauriConfigRaw);

  it('enforces a strict Content-Security-Policy in tauri.conf.json instead of null', () => {
    const csp = tauriConfig.app?.security?.csp;
    assert.ok(csp && typeof csp === 'string', 'CSP must be a non-null string in tauri.conf.json');
    assert.ok(csp.includes("default-src 'self'"), "CSP must include default-src 'self'");
    assert.ok(csp.includes("frame-src"), "CSP must define frame-src for stream embedding");
    assert.ok(csp.includes("media-src"), "CSP must define media-src for video playback");
    assert.ok(csp.includes("connect-src"), "CSP must define connect-src");
  });

  it('blocks dangerous URL schemes while allowing valid local and remote video URIs', () => {
    // Dangerous attack payloads
    assert.equal(validateSafeMediaUri('javascript:alert(1)'), false);
    assert.equal(validateSafeMediaUri('JAVASCRIPT:fetch("https://evil.com")'), false);
    assert.equal(validateSafeMediaUri('vbscript:msgbox(1)'), false);
    assert.equal(validateSafeMediaUri('data:text/html,<script>alert(1)</script>'), false);
    assert.equal(validateSafeMediaUri(''), false);
    assert.equal(validateSafeMediaUri(null), false);

    // Legitimate local paths and web streams
    assert.equal(validateSafeMediaUri('https://www.youtube.com/watch?v=dQw4w9WgXcQ'), true);
    assert.equal(validateSafeMediaUri('https://example.com/movie.mp4'), true);
    assert.equal(validateSafeMediaUri('/Users/d/Movies/Sample.mkv'), true);
    assert.equal(validateSafeMediaUri('C:\\Users\\Videos\\Sample.mp4'), true);
    assert.equal(validateSafeMediaUri('file:///home/user/video.webm'), true);
    assert.equal(validateSafeMediaUri('blob:http://localhost:1420/some-guid'), true);
  });
});

