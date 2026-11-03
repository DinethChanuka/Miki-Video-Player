import { describe, it } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';

describe('React Hook Consistency & Error 310 Prevention Audit', () => {
  it('verifies WebBrowserModal.tsx has no hooks called after if (!isOpen) return null', () => {
    const filePath = path.resolve(process.cwd(), 'src/components/hud/WebBrowserModal.tsx');
    const content = fs.readFileSync(filePath, 'utf-8');

    const earlyReturnIdx = content.indexOf('if (!isOpen) return null;');
    assert.notEqual(earlyReturnIdx, -1, 'Must contain early return when !isOpen');

    const contentAfterReturn = content.slice(earlyReturnIdx);
    const hookMatches = contentAfterReturn.match(/\buse(State|Effect|Memo|Callback|Ref|Context)\b/);
    assert.equal(
      hookMatches,
      null,
      `WebBrowserModal must NOT have any hooks after if (!isOpen) return null, but found: ${hookMatches?.[0]}`
    );
  });

  it('verifies all modal components place early return after all React hooks', () => {
    const modalFiles = [
      'src/components/hud/WebBrowserModal.tsx',
      'src/components/hud/FileBrowserModal.tsx',
      'src/components/games/FullWindowGamesModal.tsx',
      'src/components/hud/EqualizerModal.tsx',
      'src/components/hud/LiveChannelsModal.tsx',
      'src/components/hud/VideoSettingsModal.tsx',
      'src/components/hud/SystemAccessModal.tsx',
      'src/components/hud/GmailSignInModal.tsx',
    ];

    for (const relPath of modalFiles) {
      const fullPath = path.resolve(process.cwd(), relPath);
      const code = fs.readFileSync(fullPath, 'utf-8');
      const returnIdx = code.indexOf('if (!isOpen) return null;');
      if (returnIdx !== -1) {
        const after = code.slice(returnIdx);
        const hook = after.match(/\buse(State|Effect|Memo|Callback|Ref|Context)\b/);
        assert.equal(
          hook,
          null,
          `${relPath} has hook "${hook?.[0]}" after early return, violating React rules and causing error 310`
        );
      }
    }
  });
});
