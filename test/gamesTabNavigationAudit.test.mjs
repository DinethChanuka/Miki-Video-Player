import { describe, it } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';

describe('Task 5: Games Tab Navigation and Zero Black Box Audit', () => {
  const modalPath = path.resolve(process.cwd(), 'src/components/hud/FileBrowserModal.tsx');
  const modalCode = fs.readFileSync(modalPath, 'utf-8');

  it('verifies FileBrowserModal redirects initialTab === "games" to onOpenGames', () => {
    assert.match(
      modalCode,
      /initialTab\s*===\s*['"]games['"][\s\S]*?onOpenGames/,
      'FileBrowserModal must launch full window games when initialTab is games'
    );
  });

  it('verifies Games tab button in FileBrowserModal triggers onOpenGames', () => {
    assert.match(
      modalCode,
      /onOpenGames\(\)/,
      'Clicking Games tab must call onOpenGames()'
    );
  });
});
