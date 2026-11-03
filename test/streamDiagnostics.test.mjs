import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  diagnoseStreamFailure,
  isCorsLikely,
} from '../src/core/StreamDiagnostics.ts';

describe('StreamDiagnostics Engine Audit', () => {
  it('diagnoses HTTP 403 Forbidden', () => {
    const diag = diagnoseStreamFailure(new Error('Forbidden'), 403, 'https://example.com/live.m3u8');
    assert.equal(diag.reason, 'HTTP_FORBIDDEN');
    assert.equal(diag.httpStatus, 403);
    assert.match(diag.userMessage, /access restricted|forbidden/i);
    assert.equal(diag.isRecoverable, true);
  });

  it('diagnoses HTTP 404 Not Found', () => {
    const diag = diagnoseStreamFailure(new Error('Not Found'), 404, 'https://example.com/live.m3u8');
    assert.equal(diag.reason, 'HTTP_NOT_FOUND');
    assert.equal(diag.httpStatus, 404);
    assert.match(diag.userMessage, /stream not found/i);
  });

  it('diagnoses CORS restrictions on remote manifests', () => {
    const corsError = new Error('Failed to fetch manifest due to CORS policy');
    const diag = diagnoseStreamFailure(corsError, 0, 'https://example.com/playlist.m3u8');
    assert.equal(diag.reason, 'CORS_RESTRICTED');
    assert.match(diag.userMessage, /cross-origin|cors/i);
    assert.ok(isCorsLikely(corsError, 'https://example.com/playlist.m3u8'));
  });

  it('diagnoses segment load timeouts', () => {
    const diag = diagnoseStreamFailure({ details: 'fragLoadTimeOut' }, undefined);
    assert.equal(diag.reason, 'SEGMENT_TIMEOUT');
    assert.equal(diag.isRecoverable, true);
  });

  it('diagnoses offline network states', () => {
    const diag = diagnoseStreamFailure(new Error('NetworkError when attempting to fetch resource.'), undefined);
    assert.equal(diag.reason, 'NETWORK_OFFLINE');
  });
});
