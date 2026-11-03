import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

describe('Task 1: Startup Intro Video Loading & Scheme Range Streaming Audit', () => {
  const rootDir = process.cwd();
  const appPath = path.join(rootDir, 'src', 'App.tsx');
  const splashPath = path.join(rootDir, 'src', 'components', 'splash', 'SplashScreen.tsx');
  const swiftPath = path.join(rootDir, 'MikiPlayerApp.swift');

  it('verifies src/App.tsx initializes showSplash to true on player startup', () => {
    const appContent = fs.readFileSync(appPath, 'utf-8');
    assert.match(
      appContent,
      /const\s*\[\s*showSplash\s*,\s*setShowSplash\s*\]\s*=\s*useState\s*\(\s*true\s*\)/,
      'App.tsx must initialize showSplash to true on startup'
    );
  });

  it('verifies SplashScreen.tsx has sufficient safeguard timeout (>= 10s) and skip controls', () => {
    const splashContent = fs.readFileSync(splashPath, 'utf-8');
    
    // Safeguard timeout should be at least 10s (10000ms) to allow the 10-second splash.mp4 to play fully
    const timeoutMatch = splashContent.match(/setTimeout\s*\(\s*\(\)\s*=>\s*\{\s*handleFinish\(\);\s*\}\s*,\s*(\d+)\s*\)/);
    assert.ok(timeoutMatch, 'SplashScreen must have a safeguard timeout');
    const timeoutMs = parseInt(timeoutMatch[1], 10);
    assert.ok(
      timeoutMs >= 10000,
      `Safeguard timeout must be >= 10000ms for 10s intro video, got ${timeoutMs}ms`
    );

    // Verify skip button and key listeners exist
    assert.match(splashContent, /Escape/i, 'Must support Escape key to skip');
    assert.match(splashContent, /Skip/i, 'Must render visible Skip button');
  });

  it('verifies MikiPlayerApp.swift AppAssetSchemeHandler supports Range requests with HTTP 206', () => {
    const swiftContent = fs.readFileSync(swiftPath, 'utf-8');
    
    // AppAssetSchemeHandler must check Range header and respond with 206 and Content-Range
    assert.match(
      swiftContent,
      /class\s+AppAssetSchemeHandler[\s\S]*?Range[\s\S]*?Content-Range[\s\S]*?206/,
      'AppAssetSchemeHandler must support byte Range requests returning HTTP 206 for video streaming'
    );
  });
});
