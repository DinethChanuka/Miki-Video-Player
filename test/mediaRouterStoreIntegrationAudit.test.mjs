import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

describe('MediaEngineRouter Store & UI Integration Audit', () => {
  const playerStorePath = path.join(rootDir, 'src/store/playerStore.ts');
  const eqModalPath = path.join(rootDir, 'src/components/hud/EqualizerModal.tsx');
  const homePath = path.join(rootDir, 'src/components/home/HomeDashboardView.tsx');

  it('verifies playerStore integrates MediaEngineRouter and exposes dspBypass state and toggles', () => {
    const storeCode = fs.readFileSync(playerStorePath, 'utf-8');
    assert.match(
      storeCode,
      /MediaEngineRouter/i,
      'playerStore must import and initialize MediaEngineRouter'
    );
    assert.match(
      storeCode,
      /dspBypass:\s*boolean/i,
      'playerStore state interface must include dspBypass: boolean'
    );
    assert.match(
      storeCode,
      /setDspBypass|toggleDspBypass/i,
      'playerStore must provide dspBypass modifier functions'
    );
  });

  it('verifies EqualizerModal provides a user toggle for Direct Audio / Bypass DSP', () => {
    const eqCode = fs.readFileSync(eqModalPath, 'utf-8');
    assert.match(
      eqCode,
      /dspBypass|setDspBypass|toggleDspBypass/i,
      'EqualizerModal must access dspBypass state from playerStore'
    );
    assert.match(
      eqCode,
      /Bypass DSP|Direct Audio/i,
      'EqualizerModal must render a user-facing label for Direct Audio / Bypass DSP'
    );
  });

  it('verifies "Adze. DESIGN" brand text is completely absent from all rendered UI', () => {
    const homeCode = fs.readFileSync(homePath, 'utf-8');
    assert.equal(
      /<span[^>]*>\s*Adze\.?\s*<\/span>/i.test(homeCode),
      false,
      'HomeDashboardView must not render "Adze." in the sidebar'
    );
    assert.equal(
      /<span[^>]*>\s*DESIGN\s*<\/span>/i.test(homeCode),
      false,
      'HomeDashboardView must not render "DESIGN" in the sidebar'
    );
  });
});
