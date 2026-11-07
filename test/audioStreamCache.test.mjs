import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { audioStreamCache } from '../src/utils/audioStreamCache.ts';

describe('Task 2: Audio Stream Caching System', () => {
  test('caches resolved audio stream and metadata', () => {
    audioStreamCache.set('song-123', {
      id: 'song-123',
      streamUrl: 'http://127.0.0.1:39281/api/stream-audio?id=song-123',
      title: 'Maan Meri Jaan',
      artist: 'King',
      coverUrl: 'https://example.com/cover.jpg',
      durationSec: 210,
    });

    assert.equal(audioStreamCache.has('song-123'), true);
    const item = audioStreamCache.get('song-123');
    assert.ok(item);
    assert.equal(item.title, 'Maan Meri Jaan');
    assert.equal(item.streamUrl, 'http://127.0.0.1:39281/api/stream-audio?id=song-123');
  });

  test('returns null for non-cached track', () => {
    assert.equal(audioStreamCache.has('non-existent-track'), false);
    assert.equal(audioStreamCache.get('non-existent-track'), null);
  });
});

