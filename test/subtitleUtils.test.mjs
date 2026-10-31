import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  parseSubtitleText,
  DEFAULT_SUBTITLE_STYLE,
} from '../src/core/SubtitleManager.ts';

describe('Subtitle & Caption Management (SubtitleManager)', () => {
  describe('DEFAULT_SUBTITLE_STYLE', () => {
    it('provides sensible accessibility defaults', () => {
      assert.equal(DEFAULT_SUBTITLE_STYLE.fontSize, 'medium');
      assert.equal(DEFAULT_SUBTITLE_STYLE.textColor, '#ffffff');
      assert.equal(DEFAULT_SUBTITLE_STYLE.backgroundColor, '#000000');
      assert.ok(DEFAULT_SUBTITLE_STYLE.backgroundOpacity > 0);
      assert.ok(DEFAULT_SUBTITLE_STYLE.bottomOffsetPercent >= 5);
    });
  });

  describe('parseSubtitleText', () => {
    it('parses standard SubRip (.srt) cues correctly', () => {
      const srtSample = `1
00:00:01,500 --> 00:00:04,200
Welcome to Miki Player!

2
00:01:10,000 --> 00:01:15,500
Enjoy crystal-clear 4K HDR playback
and immersive 3D Spatial Audio.
`;
      const cues = parseSubtitleText(srtSample);
      assert.equal(cues.length, 2);

      assert.equal(cues[0].startTime, 1.5);
      assert.equal(cues[0].endTime, 4.2);
      assert.equal(cues[0].text, 'Welcome to Miki Player!');

      assert.equal(cues[1].startTime, 70);
      assert.equal(cues[1].endTime, 75.5);
      assert.ok(cues[1].text.includes('crystal-clear 4K HDR'));
    });

    it('parses WebVTT (.vtt) cues and strips header tags', () => {
      const vttSample = `WEBVTT - Demonstration Track

00:00.500 --> 00:03.000
<b>Hello World!</b>

00:05.120 --> 00:08.900
<i>This is an italicized caption</i>
`;
      const cues = parseSubtitleText(vttSample);
      assert.equal(cues.length, 2);
      assert.equal(cues[0].text, 'Hello World!');
      assert.equal(cues[1].text, 'This is an italicized caption');
      assert.equal(cues[0].startTime, 0.5);
      assert.equal(cues[0].endTime, 3.0);
    });

    it('handles empty or malformed input without throwing', () => {
      assert.deepEqual(parseSubtitleText(''), []);
      assert.deepEqual(parseSubtitleText(null), []);
      assert.deepEqual(parseSubtitleText('This is not a subtitle file at all.'), []);
    });
  });
});
