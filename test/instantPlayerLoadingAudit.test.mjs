import { describe, it } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';

describe('Task 1: Instant Media Player Loading & Zero Black Screen Audit', () => {
  const appPath = path.resolve(process.cwd(), 'src/App.tsx');
  const splashPath = path.resolve(process.cwd(), 'src/components/splash/SplashScreen.tsx');
  const swiftPath = path.resolve(process.cwd(), 'MikiPlayerApp.swift');

  const appCode = fs.readFileSync(appPath, 'utf-8');
  const splashCode = fs.readFileSync(splashPath, 'utf-8');
  const swiftCode = fs.readFileSync(swiftPath, 'utf-8');

  it('verifies App.tsx mounts player startup intro with showSplash', () => {
    assert.match(
      appCode,
      /showSplash\s*,\s*setShowSplash\s*\]\s*=\s*useState\s*\(\s*true\s*\)/,
      'App.tsx showSplash state must default to true so startup intro video plays'
    );
  });

  it('verifies SplashScreen has safeguard timeout allowing 10s video to play', () => {
    assert.match(
      splashCode,
      /safeguardTimer\s*=\s*setTimeout\([\s\S]*?,\s*(?:10000|12000)\)/,
      'SplashScreen safeguard timer must be at least 10000ms for 10s intro'
    );
  });

  it('verifies AppAssetSchemeHandler supports video/mp4 MIME type', () => {
    assert.match(
      swiftCode,
      /ext\s*==\s*"mp4"[\s\S]*?"video\/mp4"/,
      'MikiPlayerApp.swift AppAssetSchemeHandler must handle mp4 with video/mp4'
    );
  });
});

