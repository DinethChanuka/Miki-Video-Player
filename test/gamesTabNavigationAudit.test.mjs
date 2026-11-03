import { describe, it } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';

describe('Task 3: Games Tab Navigation & Decoupled Gallery Audit', () => {
  const modalPath = path.resolve(process.cwd(), 'src/components/hud/FileBrowserModal.tsx');
  const menuPath = path.resolve(process.cwd(), 'src/components/hud/ApplicationMenu.tsx');

  const modalCode = fs.readFileSync(modalPath, 'utf-8');
  const menuCode = fs.readFileSync(menuPath, 'utf-8');

  it('verifies FileBrowserModal activates "games" tab when initialTab is games without closing modal', () => {
    assert.match(
      modalCode,
      /initialTab\s*===\s*['"]games['"][\s\S]*?setActiveTab\(['"]games['"]\)/,
      'FileBrowserModal must show games gallery when initialTab is games'
    );
  });

  it('verifies Games tab button in FileBrowserModal sets activeTab to games', () => {
    assert.match(
      modalCode,
      /onClick=\{[\s\S]*?setActiveTab\(['"]games['"]\)/,
      'Clicking Games tab must activate the games gallery tab'
    );
  });

  it('verifies ApplicationMenu routes Games click to onOpenLibrary("games")', () => {
    assert.match(
      menuCode,
      /onOpenLibrary\(['"]games['"]\)/,
      'ApplicationMenu must open library to games tab so user sees all games with previews'
    );
  });
});
