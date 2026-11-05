import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

describe('Game Loading Timeout, Categories, and Security Audit', () => {
  const modalPath = path.resolve('src/components/games/FullWindowGamesModal.tsx');
  const sectionPath = path.resolve('src/components/games/GamesSection.tsx');
  const catalogPath = path.resolve('src/utils/gamesCatalog.ts');

  const modalContent = fs.readFileSync(modalPath, 'utf8');
  const sectionContent = fs.readFileSync(sectionPath, 'utf8');
  const catalogContent = fs.readFileSync(catalogPath, 'utf8');

  it('verifies game loading timeout in FullWindowGamesModal is at least 15 seconds', () => {
    assert.ok(
      !modalContent.includes('}, 5000);'),
      'FullWindowGamesModal must not use aggressive 5-second timeout'
    );
    assert.ok(
      modalContent.includes('15000') || modalContent.includes('12000'),
      'FullWindowGamesModal should allow at least 12-15 seconds for heavy WebGL game assets to load'
    );
  });

  it('verifies GamesSection supports Strategy and Cards categories', () => {
    assert.ok(
      sectionContent.includes('Strategy') && sectionContent.includes('Cards'),
      'GamesSection must include Strategy and Cards categories to match FullWindowGamesModal and catalog'
    );
  });

  it('verifies message listener in FullWindowGamesModal validates event.source', () => {
    assert.ok(
      modalContent.includes('e.source !== iframeRef.current.contentWindow') ||
      modalContent.includes('e.source === iframeRef.current?.contentWindow') ||
      modalContent.includes('e.source === iframeRef.current.contentWindow'),
      'Message listener must validate event.source matches the game iframe window'
    );
  });

  it('verifies postMessage specifies target origin for external games', () => {
    assert.ok(
      modalContent.includes('targetOrigin'),
      'postMessage must compute and use targetOrigin instead of broadcasting unconditionally with wildcard'
    );
  });
});
