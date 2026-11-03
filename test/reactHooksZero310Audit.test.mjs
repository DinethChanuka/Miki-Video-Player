import { describe, it } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    const full = path.join(dir, file);
    const stat = fs.statSync(full);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(full));
    } else if (file.endsWith('.tsx')) {
      results.push(full);
    }
  });
  return results;
}

describe('Task 4: Strict AST Verification - Zero React Error #310 Violations', () => {
  const tsxFiles = walk('./src');

  it('scans all tsx components to ensure no React hooks are called conditionally', () => {
    function isHook(name) {
      return /^use[A-Z0-9]/.test(name);
    }

    const violations = [];

    for (const file of tsxFiles) {
      const code = fs.readFileSync(file, 'utf-8');
      const sourceFile = ts.createSourceFile(file, code, ts.ScriptTarget.Latest, true);

      function walkTree(node) {
        if (ts.isCallExpression(node)) {
          let callName = '';
          if (ts.isIdentifier(node.expression)) callName = node.expression.text;
          else if (ts.isPropertyAccessExpression(node.expression)) callName = node.expression.name.text;

          if (isHook(callName)) {
            let parent = node.parent;
            while (parent && parent !== sourceFile) {
              if (
                ts.isIfStatement(parent) ||
                ts.isConditionalExpression(parent) ||
                ts.isForStatement(parent) ||
                ts.isWhileStatement(parent) ||
                ts.isDoStatement(parent) ||
                ts.isSwitchStatement(parent)
              ) {
                const pos = sourceFile.getLineAndCharacterOfPosition(node.getStart());
                violations.push({
                  file: path.relative(process.cwd(), file),
                  line: pos.line + 1,
                  hook: callName,
                  construct: ts.SyntaxKind[parent.kind],
                });
                break;
              }
              parent = parent.parent;
            }
          }
        }
        ts.forEachChild(node, walkTree);
      }

      walkTree(sourceFile);
    }

    assert.equal(
      violations.length,
      0,
      `Found conditional hooks violating React rules: ${JSON.stringify(violations)}`
    );
  });

  it('verifies all modal components place early return strictly AFTER all hook calls', () => {
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
      const earlyReturnIdx = code.indexOf('if (!isOpen) return null;');
      if (earlyReturnIdx !== -1) {
        const after = code.slice(earlyReturnIdx);
        const hookMatch = after.match(/\buse(State|Effect|Memo|Callback|Ref|Context|Reducer)\b/);
        assert.equal(
          hookMatch,
          null,
          `${relPath} has hook "${hookMatch?.[0]}" after early return, which causes Minified React error #310`
        );
      }
    }
  });
});
