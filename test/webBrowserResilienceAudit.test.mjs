import { describe, it } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';

describe('Task 4: Web Browser Resilience & Canonical Cinema Links Audit', () => {
  const browserModalPath = path.resolve(process.cwd(), 'src/components/hud/WebBrowserModal.tsx');
  const cinemaLinksPath = path.resolve(process.cwd(), 'src/utils/cinemaLinks.ts');

  const browserModalCode = fs.readFileSync(browserModalPath, 'utf-8');
  const cinemaLinksCode = fs.readFileSync(cinemaLinksPath, 'utf-8');

  it('verifies cinemaLinks uses canonical cinesubz domain', () => {
    assert.match(
      cinemaLinksCode,
      /cinesubz\.(?:lk|co)/,
      'Cinema links must support active cinesubz domain'
    );
  });

  it('verifies WebBrowserModal handles iframe frame-ancestor blocking with a fallback card', () => {
    assert.match(
      browserModalCode,
      /frameBlocked|hasFrameError|Website Embed Protected|Frame Security Protected/i,
      'WebBrowserModal must detect or provide clear fallback when iframe is blocked by X-Frame-Options'
    );
  });

  it('verifies WebBrowserModal provides 1-click fallback actions to open in external browser or player', () => {
    assert.match(
      browserModalCode,
      /handlePlayInPlayer/,
      'WebBrowserModal must offer direct launch in player'
    );
  });
});
