import { describe, it } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';

describe('Task 1: Native AVPlayer Fallback & HLS Self-Healing in PlayerEngine Audit', () => {
  const enginePath = path.resolve(process.cwd(), 'src/core/PlayerEngine.ts');
  const engineCode = fs.readFileSync(enginePath, 'utf-8');

  it('verifies PlayerEngine configures resilient HLS loading retries and timeouts', () => {
    assert.match(
      engineCode,
      /manifestLoadingMaxRetry:\s*[345]/,
      'PlayerEngine must configure manifestLoadingMaxRetry with at least 3 retries'
    );
    assert.match(
      engineCode,
      /fragLoadingMaxRetry:\s*[345]/,
      'PlayerEngine must configure fragLoadingMaxRetry with at least 3 retries'
    );
    assert.match(
      engineCode,
      /levelLoadingMaxRetry:\s*[345]/,
      'PlayerEngine must configure levelLoadingMaxRetry with at least 3 retries'
    );
  });

  it('verifies PlayerEngine does not immediately emit fatal error while startLoad or recoverMediaError is attempting recovery', () => {
    // There must be a return or recovery gate so error is not emitted when recovery is triggered
    assert.match(
      engineCode,
      /startLoad\(\);\s*return;/,
      'HLS network error recovery must return to allow reload before emitting fatal error'
    );
    assert.match(
      engineCode,
      /recoverMediaError\(\);\s*return;/,
      'HLS media error recovery must return to allow recovery before emitting fatal error'
    );
  });

  it('verifies PlayerEngine provides seamless fallback to native AVPlayer on WebKit/Safari when Hls.js encounters fatal errors', () => {
    assert.match(
      engineCode,
      /canPlayType\(['"]application\/vnd\.apple\.mpegurl['"]\)/,
      'PlayerEngine must check canPlayType for native HLS support'
    );
    assert.match(
      engineCode,
      /el\.src\s*=\s*resolvedUri[\s\S]*?el\.load\(\)/,
      'PlayerEngine must assign resolvedUri to video element and load natively on HLS failure'
    );
  });
});
