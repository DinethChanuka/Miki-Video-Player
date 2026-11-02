import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

describe('Subtitle Rendering & Security Hardening Audit', () => {
  it('verifies SubtitleOverlay does NOT use dangerouslySetInnerHTML', () => {
    const overlayPath = path.join(
      rootDir,
      'src/components/player/SubtitleOverlay.tsx'
    );
    const code = fs.readFileSync(overlayPath, 'utf8');

    assert.doesNotMatch(
      code,
      /dangerouslySetInnerHTML/i,
      'SubtitleOverlay must NOT use dangerouslySetInnerHTML; render safe React nodes instead'
    );
  });

  it('verifies parseSubtitleToReactNodes safely parses formatting tags and neutralizes script injection', async () => {
    const { parseSubtitleToReactNodes } = await import(
      '../src/core/SubtitleManager.ts'
    );

    assert.equal(
      typeof parseSubtitleToReactNodes,
      'function',
      'parseSubtitleToReactNodes must be exported from SubtitleManager'
    );

    // Test safe formatting tags
    const sampleFormatted = '<i>Italic</i> and <b>Bold</b> and <font color="#ff0000">Red</font>';
    const nodes = parseSubtitleToReactNodes(sampleFormatted);
    assert.ok(Array.isArray(nodes), 'Must return an array of nodes');
    assert.ok(nodes.length >= 3, 'Must parse multiple tokens');

    // Test XSS payload neutralization
    const malicious = '<script>alert("pwned")</script><img src=x onerror=alert(1)>Hello <b>World</b>';
    const safeNodes = parseSubtitleToReactNodes(malicious);
    const serialized = JSON.stringify(safeNodes);
    assert.doesNotMatch(serialized, /<script/i, 'Script tags must be stripped');
    assert.doesNotMatch(serialized, /onerror/i, 'onerror handlers must be stripped');
  });
});
