import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

describe('Task 1: Home Direct Launch & ControlsOverlay Isolation Audit', () => {
  const appPath = path.join(rootDir, 'src/App.tsx');
  assert.ok(fs.existsSync(appPath), 'src/App.tsx must exist');
  const appCode = fs.readFileSync(appPath, 'utf8');

  it('verifies ControlsOverlay is conditionally gated behind active media to never obscure Home Dashboard', () => {
    // ControlsOverlay must only be mounted when currentUri is active
    assert.match(
      appCode,
      /\{(?:\s*Boolean\(currentUri\)|\s*currentUri)\s*&&[^<]*<ControlsOverlay/i,
      'ControlsOverlay must be conditionally rendered only when currentUri is present'
    );
  });

  it('verifies HomeDashboardView is displayed directly when currentUri is null without intrusive overlays', () => {
    assert.match(
      appCode,
      /!currentUri\s*&&\s*\(/,
      'HomeDashboardView must be rendered directly whenever currentUri is null'
    );
    assert.match(
      appCode,
      /<HomeDashboardView/,
      'HomeDashboardView component must be mounted in App.tsx'
    );
  });
});
