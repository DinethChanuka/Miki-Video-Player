import { describe, it } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

describe('Hardened Ad-Blocker & Redirect Suppression Shield', () => {
  it('verifies adBlockFilter identifies ad redirects and popups', async () => {
    const { isBlockedUrl } = await import('../src/utils/adBlockFilter.ts');

    assert.strictEqual(isBlockedUrl('https://onclickalgo.com/track?id=123'), true);
    assert.strictEqual(isBlockedUrl('https://popcash.net/serve'), true);
    assert.strictEqual(isBlockedUrl('https://adsterra.com/click'), true);
    assert.strictEqual(isBlockedUrl('https://monetag.com/sdk'), true);
    assert.strictEqual(isBlockedUrl('https://deloton.com/redirect'), true);

    // Legitimate streaming sites must not be blocked
    assert.strictEqual(isBlockedUrl('https://cinesubz.co/movie/test'), false);
    assert.strictEqual(isBlockedUrl('https://fmoviesz.to/watch'), false);
    assert.strictEqual(isBlockedUrl('https://www.youtube.com'), false);
  });

  it('verifies generateAdBlockScript includes click capture and auto-redirect protection', async () => {
    const { generateAdBlockScript } = await import('../src/utils/adBlockFilter.ts');
    const script = generateAdBlockScript();

    assert.match(script, /window\.open\s*=\s*/i);
    assert.match(script, /addEventListener\(\s*['"]click['"]/i);
    assert.match(script, /onbeforeunload/i);
  });

  it('verifies MikiPlayerApp.swift enforces isAdUrl check on both popups and navigation actions', () => {
    const swiftCode = fs.readFileSync(path.join(rootDir, 'MikiPlayerApp.swift'), 'utf-8');

    assert.match(swiftCode, /func isAdUrl\(/);
    assert.match(swiftCode, /isAdUrl\(targetUrl\)/);
  });
});
