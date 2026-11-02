import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

describe('Web Browser Full Window, Dragging & Loading Fixes', () => {
  const browserSource = fs.readFileSync(
    path.resolve('src/components/hud/WebBrowserModal.tsx'),
    'utf-8'
  );
  const tauriConfigRaw = fs.readFileSync(
    path.resolve('src-tauri/tauri.conf.json'),
    'utf-8'
  );
  const tauriConfig = JSON.parse(tauriConfigRaw);
  const swiftAppSource = fs.readFileSync(
    path.resolve('MikiPlayerApp.swift'),
    'utf-8'
  );

  it('renders web browser full screen without popup window wrappers or search URL header bar', () => {
    // Must NOT be a constrained popup modal card with max-w-6xl or rounded-3xl
    assert.ok(
      !browserSource.includes('max-w-6xl') && !browserSource.includes('rounded-3xl'),
      'Web browser must open fully edge-to-edge, not as a constrained popup modal card'
    );

    // Must NOT show the search URL header input or Go button
    assert.ok(
      !browserSource.includes('placeholder="Enter website URL'),
      'Web browser must not display the search URL header bar'
    );
  });

  it('enables window dragging in browser mode top bar', () => {
    assert.ok(
      browserSource.includes('onStartWindowDrag') || browserSource.includes('handleStartWindowDrag'),
      'Web browser top bar must provide window drag handler'
    );
  });

  it('configures permissive frame-src in CSP so arbitrary websites and stream links can load', () => {
    const csp = tauriConfig.app?.security?.csp || '';
    assert.ok(
      csp.includes('frame-src') && (csp.includes('https:') || csp.includes('*')),
      'CSP must permit https: in frame-src so external websites are not blocked'
    );
  });

  it('fixes window drag in native Swift borderless window by caching lastMouseDownEvent', () => {
    assert.ok(
      swiftAppSource.includes('lastMouseDownEvent'),
      'MikiPlayerApp.swift must track lastMouseDownEvent to pass valid .leftMouseDown to performDrag'
    );
  });
});

