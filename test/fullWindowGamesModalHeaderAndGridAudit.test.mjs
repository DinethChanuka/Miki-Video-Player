import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

describe('Full-Window Games Modal Single Header & Grid Card Sizing Audit', () => {
  const modalPath = path.join(rootDir, 'src/components/games/FullWindowGamesModal.tsx');
  assert.ok(fs.existsSync(modalPath), 'FullWindowGamesModal.tsx must exist');
  const modalCode = fs.readFileSync(modalPath, 'utf8');

  it('verifies FullWindowGamesModal does not render duplicate headers or redundant drawer titles', () => {
    // Should NOT have duplicate drawer header with "50+ Titles" inside body
    assert.doesNotMatch(
      modalCode,
      /50\+\s*Titles/i,
      'FullWindowGamesModal must not render outdated/duplicate "50+ Titles" drawer header'
    );

    // Only ONE <header> tag should exist in the modal
    const headerMatches = modalCode.match(/<header\b/g);
    assert.equal(
      headerMatches ? headerMatches.length : 0,
      1,
      'FullWindowGamesModal must contain exactly ONE unified top header bar'
    );
  });

  it('verifies FullWindowGamesModal contains only ONE search input element to avoid duplicate search bars', () => {
    const inputMatches = modalCode.match(/<input\b[^>]*type=["']text["']/g);
    assert.equal(
      inputMatches ? inputMatches.length : 0,
      1,
      'FullWindowGamesModal must contain only 1 text input across the entire component'
    );
  });

  it('verifies game cards in the grid enforce explicit height and do not collapse into flat bars', () => {
    assert.match(
      modalCode,
      /h-\[235px\]|min-h-\[230px\]|h-\[240px\]/,
      'Game cards must enforce explicit minimum height to prevent squashing'
    );
    assert.match(
      modalCode,
      /relative\s+h-28\s+w-full\s+shrink-0/,
      'Game card thumbnail container must include shrink-0 so flexbox cannot compress it'
    );
  });

  it('verifies grid container includes min-h-0 and auto-rows-max for resilient scrolling', () => {
    assert.match(
      modalCode,
      /min-h-0\s+overflow-y-auto/,
      'Grid container must include min-h-0 to enable proper flex child scrolling'
    );
    assert.match(
      modalCode,
      /auto-rows-max/,
      'Grid container must use auto-rows-max so row heights are sized by card content'
    );
  });

  it('verifies footer accurately reflects Playing vs Previewing mode and total titles count', () => {
    assert.match(
      modalCode,
      /Playing:\s*<strong/i,
      'Footer must display Playing status when in-game'
    );
    assert.match(
      modalCode,
      /Previewing:\s*<strong/i,
      'Footer must display Previewing status when in gallery mode'
    );
    assert.match(
      modalCode,
      /Available\s+Games/i,
      'Footer must display available games counter'
    );
  });
});
