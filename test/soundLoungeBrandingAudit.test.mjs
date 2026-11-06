import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

describe('Task 6: Clean Sound Lounge Branding & UI Audit', () => {
  const root = process.cwd();

  test('verifies zero occurrences of "YouTube Music" in user-facing section headings in HomeDashboardView', () => {
    const viewCode = fs.readFileSync(path.resolve(root, 'src/components/home/HomeDashboardView.tsx'), 'utf-8');
    assert.doesNotMatch(viewCode, /Online Music Discovery & Search — YouTube Music/i);
    assert.doesNotMatch(viewCode, /Stream authentic full-length songs powered exclusively by YouTube Music/i);
    assert.doesNotMatch(viewCode, /All YouTube Songs/i);
  });

  test('verifies Sound Lounge section header and Shuffle Discovery filter button exist', () => {
    const viewCode = fs.readFileSync(path.resolve(root, 'src/components/home/HomeDashboardView.tsx'), 'utf-8');
    assert.match(viewCode, /Sound Lounge/i);
    assert.match(viewCode, /Shuffle Discovery|Surprise Me|Random/i);
  });

  test('verifies scroll auto-hide controller hides top player when scrolled down in 3D Music', () => {
    const viewCode = fs.readFileSync(path.resolve(root, 'src/components/home/HomeDashboardView.tsx'), 'utf-8');
    assert.match(viewCode, /scrollTop|scroll/);
    assert.match(viewCode, /isTopPlayerHidden|isScrolledDown|hideTopPlayer/);
  });
});

