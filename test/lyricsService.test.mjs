import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { parseLrcLyrics, cleanTrackSearchQuery } from '../src/utils/lyricsService.ts';

describe('Task 1: Lyrics Service & LRC Synchronized Parser', () => {
  test('cleanTrackSearchQuery cleans video suffixes, official tags, and noise', () => {
    const raw1 = 'Digvijaya (දිග්විජය) Theme Song | Official Music Video | Pradeep Rangana';
    const cleaned1 = cleanTrackSearchQuery(raw1);
    assert.equal(cleaned1.trackTitle, 'Digvijaya');
    assert.equal(cleaned1.artist, 'Pradeep Rangana');

    const raw2 = 'Saiyaara Title Song | Full Song Audio | Tanishk Bagchi, Faheem Abdullah';
    const cleaned2 = cleanTrackSearchQuery(raw2);
    assert.equal(cleaned2.trackTitle, 'Saiyaara');
    assert.equal(cleaned2.artist, 'Tanishk Bagchi, Faheem Abdullah');
  });

  test('parseLrcLyrics parses standard LRC timestamps into sorted timeMs and text', () => {
    const sampleLrc = `
[00:04.12] First line of song
[00:09.50] Second line of song
[00:15.80] Third line with deep rhythm
[01:02.10] Chorus starts here
`;
    const lines = parseLrcLyrics(sampleLrc);
    assert.equal(lines.length, 4);
    assert.equal(lines[0].timeMs, 4120);
    assert.equal(lines[0].text, 'First line of song');
    assert.equal(lines[1].timeMs, 9500);
    assert.equal(lines[1].text, 'Second line of song');
    assert.equal(lines[3].timeMs, 62100);
    assert.equal(lines[3].text, 'Chorus starts here');
  });

  test('parseLrcLyrics handles empty or invalid LRC gracefully', () => {
    assert.deepEqual(parseLrcLyrics(''), []);
    assert.deepEqual(parseLrcLyrics('No timestamp text line'), []);
  });
});

