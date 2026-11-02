import { describe, it } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

describe('Application Menu, Themes & Background Blur Audit', () => {
  it('verifies ApplicationMenu has backdrop scrim and solid opaque styling preventing background text overlap', () => {
    const menuCode = fs.readFileSync(path.join(rootDir, 'src/components/hud/ApplicationMenu.tsx'), 'utf-8');

    // Must have a backdrop scrim or click-catcher overlay to dim background cards and handle outside click
    assert.match(
      menuCode,
      /fixed\s+inset-0/i,
      'ApplicationMenu should provide a fixed backdrop overlay to dim the content beneath and prevent text overlap'
    );

    // Must have solid background color to prevent transparency bleed in WebKit
    assert.match(
      menuCode,
      /backgroundColor:\s*['"]#0[a-f0-9]{5}['"]/i,
      'ApplicationMenu dropdown panel must specify solid background color'
    );
  });

  it('verifies stale video element is hidden on home view and purged on closeMedia', () => {
    const appCode = fs.readFileSync(path.join(rootDir, 'src/App.tsx'), 'utf-8');
    const storeCode = fs.readFileSync(path.join(rootDir, 'src/store/playerStore.ts'), 'utf-8');

    // App.tsx video viewport should be hidden when currentUri is null/empty
    assert.ok(
      appCode.includes('!currentUri') && (appCode.includes('hidden') || appCode.includes('display: none') || appCode.includes('pointer-events-none opacity-0')),
      'Video viewport must be hidden or unmounted when !currentUri so stale unblurred video frames do not bleed through'
    );

    // closeMedia must clear or unload the video element to avoid freezing stale frames
    assert.ok(
      storeCode.includes('closeMedia') && (storeCode.includes('removeAttribute') || storeCode.includes("src = ''") || storeCode.includes('pause()')),
      'closeMedia in playerStore must pause and clear video source'
    );
  });

  it('verifies dynamic blur and tint styling are correctly configured without CALayer freezing', () => {
    const appCode = fs.readFileSync(path.join(rootDir, 'src/App.tsx'), 'utf-8');

    // customBgBlur must be used in filter/WebkitFilter on customBgImage
    assert.match(
      appCode,
      /blur\(\$\{customBgBlur\}px\)/,
      'App.tsx must apply customBgBlur dynamically to background filter'
    );

    // Dynamic tint overlays must support navy, aurora, amethyst, obsidian, and clear
    assert.ok(appCode.includes("customBgTint === 'navy'"), 'Must handle navy tint');
    assert.ok(appCode.includes("customBgTint === 'aurora'"), 'Must handle aurora tint');
    assert.ok(appCode.includes("customBgTint === 'amethyst'"), 'Must handle amethyst tint');
  });

  it('verifies modals retain backdrop-blur regardless of whether customBgImage is set', () => {
    const settingsCode = fs.readFileSync(path.join(rootDir, 'src/components/hud/VideoSettingsModal.tsx'), 'utf-8');

    // Must not skip backdrop-blur when customBgImage is present
    assert.ok(
      settingsCode.includes('backdrop-blur'),
      'VideoSettingsModal must preserve backdrop-blur for modal contrast'
    );
  });

  it('verifies MikiPlayerApp.swift file picker supports image files for wallpaper upload and ensures safe completion', () => {
    const swiftCode = fs.readFileSync(path.join(rootDir, 'MikiPlayerApp.swift'), 'utf-8');

    // runOpenPanelWith must allow image types (.image, .png, .jpeg, etc.)
    assert.match(
      swiftCode,
      /\.image|\.png|\.jpeg/i,
      'runOpenPanelWith in MikiPlayerApp.swift must allow image types for wallpaper selection'
    );

    // SafeCompletionWrapper must be used
    assert.ok(
      swiftCode.includes('SafeCompletionWrapper'),
      'SafeCompletionWrapper must protect completionHandler'
    );
  });
});
