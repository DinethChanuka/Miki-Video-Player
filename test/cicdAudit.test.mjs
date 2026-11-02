import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

describe('Task 8 Audit: Cross-Platform CI/CD Pipeline & Build Hardening', () => {
  const workflowPath = path.resolve('.github/workflows/build-crossplatform.yml');
  const workflowContent = fs.readFileSync(workflowPath, 'utf-8');
  const packageIosContent = fs.readFileSync(path.resolve('scripts/package-ios.sh'), 'utf-8');
  const packageAndroidContent = fs.readFileSync(path.resolve('scripts/package-android.sh'), 'utf-8');

  it('includes native macOS desktop application packaging job', () => {
    assert.ok(
      workflowContent.includes('build-macos-app:'),
      'Workflow must define build-macos-app job'
    );
    assert.ok(
      workflowContent.includes('./scripts/package-mac.sh'),
      'Workflow must invoke package-mac.sh to compile native macOS app bundle'
    );
  });

  it('verifies artifact existence before uploading build targets', () => {
    assert.ok(
      workflowContent.includes('Verify macOS Application Artifacts'),
      'macOS job must verify Miki Player.app exists'
    );
    assert.ok(
      workflowContent.includes('Verify Windows Artifacts'),
      'Windows job must verify .exe / .msi existence'
    );
    assert.ok(
      workflowContent.includes('Verify Linux Artifacts'),
      'Linux job must verify distribution packages existence'
    );
  });

  it('removes masked failures (|| true) from build scripts', () => {
    assert.ok(
      !packageIosContent.includes('tauri ios build --no-signing || true'),
      'package-ios.sh must not mask build failures with || true'
    );
    assert.ok(
      !packageAndroidContent.includes('tauri android build --apk || true'),
      'package-android.sh must not mask build failures with || true'
    );
  });
});

