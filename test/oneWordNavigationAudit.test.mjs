import { describe, it } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

describe('Simplified One-Word Navigation & Menu Headers Audit', () => {
  it('verifies ApplicationMenu section titles are single concise words', () => {
    const menuCode = fs.readFileSync(path.join(rootDir, 'src/components/hud/ApplicationMenu.tsx'), 'utf-8');

    // Section titles must be single words: "Streams", "Media", "System"
    assert.match(menuCode, />\s*Streams\s*</i);
    assert.match(menuCode, />\s*Media\s*</i);
    assert.match(menuCode, />\s*System\s*</i);

    // Multi-word headers must be eliminated
    assert.doesNotMatch(menuCode, />\s*Streams & Web\s*</i);
    assert.doesNotMatch(menuCode, />\s*Media & Storage\s*</i);
  });

  it('verifies FileBrowserModal tabs use single words: Cinema, Social, Music, Games, History, Saved and no Demos', () => {
    const modalCode = fs.readFileSync(path.join(rootDir, 'src/components/hud/FileBrowserModal.tsx'), 'utf-8');

    assert.match(modalCode, />\s*Cinema/i);
    assert.match(modalCode, />\s*Social/i);
    assert.match(modalCode, />\s*Music/i);
    assert.match(modalCode, />\s*Games/i);
    assert.doesNotMatch(modalCode, />\s*Demos/i);
    assert.match(modalCode, />\s*History/i);
    assert.match(modalCode, />\s*Saved/i);
  });
});
