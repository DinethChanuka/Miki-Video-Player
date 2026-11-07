import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import {
  isLiveStreamUrl,
  shouldCacheAudioUrl,
  persistentAudioCache,
} from '../src/utils/persistentAudioCache.ts';

describe('Task 2: Persistent Local Audio Cache Engine', () => {
  beforeEach(async () => {
    await persistentAudioCache.clearAll();
  });

  it('detects live radio streams and ignores them for complete song caching', () => {
    assert.strictEqual(isLiveStreamUrl('https://somafm.com/groovesalad130.pls'), true);
    assert.strictEqual(isLiveStreamUrl('http://stream.radioparadise.com/aac-128'), true);
    assert.strictEqual(isLiveStreamUrl('https://radio.garden/api/ara/content/listen/abc/channel.mp3'), true);
    assert.strictEqual(isLiveStreamUrl('https://live-radio.icecast.net/stream.m3u8'), true);
    assert.strictEqual(isLiveStreamUrl('http://127.0.0.1:39281/api/stream-audio?id=dQw4w9WgXcQ&stream=true'), false);
    assert.strictEqual(isLiveStreamUrl('https://audio.example.com/song.flac'), false);
    assert.strictEqual(isLiveStreamUrl('https://audio.example.com/track.mp3'), false);

    assert.strictEqual(shouldCacheAudioUrl('https://somafm.com/live.aac'), false);
    assert.strictEqual(shouldCacheAudioUrl('https://example.com/music.mp3'), true);
    assert.strictEqual(shouldCacheAudioUrl('http://127.0.0.1:39281/api/stream-audio?id=test123'), true);
  });

  it('saves binary audio buffer with metadata and retrieves it correctly', async () => {
    const fakeBuffer = new Uint8Array([0x49, 0x44, 0x33, 0x03, 0x00, 0x00, 0x00]).buffer;
    const metadata = {
      title: 'Kesariya',
      artist: 'Arijit Singh',
      durationSec: 268,
      contentType: 'audio/mp4',
    };

    await persistentAudioCache.saveTrack('track_kesariya', 'http://127.0.0.1:39281/stream/kesariya.m4a', fakeBuffer, metadata);

    const hasItem = await persistentAudioCache.hasTrack('track_kesariya');
    assert.strictEqual(hasItem, true);

    const cached = await persistentAudioCache.getCachedTrack('track_kesariya');
    assert.ok(cached);
    assert.strictEqual(cached.id, 'track_kesariya');
    assert.strictEqual(cached.title, 'Kesariya');
    assert.strictEqual(cached.artist, 'Arijit Singh');
    assert.strictEqual(cached.durationSec, 268);
    assert.strictEqual(cached.contentType, 'audio/mp4');
    assert.strictEqual(cached.data.byteLength, 7);
  });

  it('allows lookup by URL as well as ID', async () => {
    const fakeBuffer = new Uint8Array([1, 2, 3, 4, 5]).buffer;
    const url = 'https://music.example.com/audio/song_abc.mp3';

    await persistentAudioCache.saveTrack('song_abc', url, fakeBuffer, { title: 'Test Song' });

    const byId = await persistentAudioCache.getCachedTrack('song_abc');
    const byUrl = await persistentAudioCache.getCachedTrack(url);

    assert.ok(byId);
    assert.ok(byUrl);
    assert.strictEqual(byId.id, byUrl.id);
  });

  it('performs LRU eviction when capacity limit is reached', async () => {
    const buf1 = new Uint8Array([1, 2, 3]).buffer;
    const buf2 = new Uint8Array([4, 5, 6]).buffer;
    const buf3 = new Uint8Array([7, 8, 9]).buffer;

    await persistentAudioCache.saveTrack('t1', 'http://test/1.mp3', buf1, { title: '1' });
    await persistentAudioCache.saveTrack('t2', 'http://test/2.mp3', buf2, { title: '2' });
    await persistentAudioCache.saveTrack('t3', 'http://test/3.mp3', buf3, { title: '3' });

    // Enforce max 2 items
    await persistentAudioCache.evictOldest(2, 100000);

    const hasT1 = await persistentAudioCache.hasTrack('t1');
    const hasT2 = await persistentAudioCache.hasTrack('t2');
    const hasT3 = await persistentAudioCache.hasTrack('t3');

    assert.strictEqual(hasT1, false, 'Oldest track t1 should be evicted');
    assert.strictEqual(hasT2, true, 't2 should remain in cache');
    assert.strictEqual(hasT3, true, 't3 should remain in cache');
  });

  it('clears all cached items on clearAll()', async () => {
    const buf = new Uint8Array([10, 20]).buffer;
    await persistentAudioCache.saveTrack('item1', 'http://test/1.mp3', buf);
    assert.strictEqual(await persistentAudioCache.hasTrack('item1'), true);

    await persistentAudioCache.clearAll();
    assert.strictEqual(await persistentAudioCache.hasTrack('item1'), false);
  });
});
