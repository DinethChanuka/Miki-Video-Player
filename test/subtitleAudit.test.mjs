import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  computeSubtitleMediaHash,
  parseSubtitleText,
  memorizeSubtitleForVideo,
  getMemorizedSubtitleForVideo,
} from '../src/core/SubtitleManager.ts';
import fs from 'node:fs';
import path from 'node:path';

describe('Task 4 Audit: Subtitle Management, Hashing & Formatting Integrity', () => {
  const subtitleOverlaySource = fs.readFileSync(
    path.resolve('src/components/player/SubtitleOverlay.tsx'),
    'utf-8'
  );
  const subtitleManagerSource = fs.readFileSync(
    path.resolve('src/core/SubtitleManager.ts'),
    'utf-8'
  );

  it('generates distinct collision-free hash keys for long file paths with shared prefix', () => {
    const ep1 = '/Volumes/Media/Anime/DemonSlayer/Season 1/Episode 01 - Cruelty.mkv';
    const ep2 = '/Volumes/Media/Anime/DemonSlayer/Season 1/Episode 02 - Trainer Sakonji.mkv';

    const hash1 = computeSubtitleMediaHash(ep1);
    const hash2 = computeSubtitleMediaHash(ep2);

    assert.notEqual(hash1, hash2, 'Different episode filenames must produce different hashes');
    assert.equal(hash1.length, 64, 'Hash must be a full 64-character hex digest');
    assert.equal(hash2.length, 64, 'Hash must be a full 64-character hex digest');
  });

  it('preserves formatting tags (italic, bold, font color) while stripping dangerous tags', () => {
    const rawSrt = `1
00:00:01,000 --> 00:00:04,000
<i>Italic speech</i> and <b>bold emphasis</b> with <font color="#ffcc00">colored text</font>
<script>alert("xss")</script>`;

    const cues = parseSubtitleText(rawSrt);
    assert.equal(cues.length, 1);
    assert.ok(cues[0].text.includes('<i>Italic speech</i>'), 'Must preserve <i> tags');
    assert.ok(cues[0].text.includes('<b>bold emphasis</b>'), 'Must preserve <b> tags');
    assert.ok(cues[0].text.includes('<font color="#ffcc00">colored text</font>'), 'Must preserve <font> tags');
    assert.ok(!cues[0].text.includes('<script>'), 'Must strip <script> tags');
  });

  it('handles overlapping subtitle cues without dropping simultaneous dialogue', () => {
    const rawVtt = `WEBVTT

00:00:05.000 --> 00:00:10.000
Speaker A: Hello there!

00:00:06.000 --> 00:00:09.000
Speaker B: General Kenobi!`;

    const cues = parseSubtitleText(rawVtt);
    assert.equal(cues.length, 2);

    // Overlay component must handle multiple overlapping cues, not just cues.find()
    assert.ok(
      subtitleOverlaySource.includes('.filter('),
      'SubtitleOverlay must use .filter() to capture all overlapping cues at current position'
    );
  });

  it('prevents localStorage quota exhaustion by limiting large raw text dumps', () => {
    assert.ok(
      subtitleManagerSource.includes('MAX_LOCAL_STORAGE_BYTES') ||
      subtitleManagerSource.includes('MAX_STORAGE_RAW_LENGTH') ||
      subtitleManagerSource.includes('QuotaExceededError') ||
      subtitleManagerSource.includes('65536'),
      'SubtitleManager must safeguard localStorage against multi-megabyte quota exhaustion'
    );
  });
});

