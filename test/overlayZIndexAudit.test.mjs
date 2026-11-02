import { describe, it } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

describe('Native View Z-Ordering & Overlay Visibility Audit', () => {
  it('verifies MikiPlayerApp.swift handles setOverlayVisible action', () => {
    const swiftCode = fs.readFileSync(path.join(rootDir, 'MikiPlayerApp.swift'), 'utf-8');

    assert.match(
      swiftCode,
      /case\s*["']setOverlayVisible["']:/i,
      'MikiPlayerApp.swift must handle setOverlayVisible IPC action'
    );
  });

  it('verifies ApplicationMenu or modals dispatch setOverlayVisible to native app', () => {
    const menuCode = fs.readFileSync(path.join(rootDir, 'src/components/hud/ApplicationMenu.tsx'), 'utf-8');
    const browserCode = fs.readFileSync(path.join(rootDir, 'src/components/hud/WebBrowserModal.tsx'), 'utf-8');

    const hasOverlayDispatch =
      menuCode.includes('setOverlayVisible') || browserCode.includes('setOverlayVisible');

    assert.ok(
      hasOverlayDispatch,
      'Either ApplicationMenu or WebBrowserModal must dispatch setOverlayVisible action'
    );
  });
});
