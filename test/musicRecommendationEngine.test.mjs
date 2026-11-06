import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { getRecommendedTracks } from '../src/utils/musicRecommendationEngine.ts';

describe('Task 5: Song Recommendation Algorithm', () => {
  const mockCatalog = [
    { id: '1', title: 'Tum Hi Ho', artist: 'Arijit Singh', category: 'romantic', streamUrl: 'https://youtube.com/watch?v=1', coverUrl: '' },
    { id: '2', title: 'Kesariya', artist: 'Arijit Singh', category: 'romantic', streamUrl: 'https://youtube.com/watch?v=2', coverUrl: '' },
    { id: '3', title: 'Tokyo Drift', artist: 'Drift Kingz', category: 'phonk', streamUrl: 'https://youtube.com/watch?v=3', coverUrl: '' },
    { id: '4', title: 'Midnight Chill', artist: 'Lo-Fi Panda', category: 'lo-fi', streamUrl: 'https://youtube.com/watch?v=4', coverUrl: '' },
    { id: '5', title: 'Channa Mereya', artist: 'Arijit Singh', category: 'hindi', streamUrl: 'https://youtube.com/watch?v=5', coverUrl: '' },
  ];

  test('prioritizes songs by matching artist and category affinity', () => {
    const recent = [
      { uri: 'https://youtube.com/watch?v=1', title: 'Tum Hi Ho - Arijit Singh', timestamp: Date.now() }
    ];

    const recommendations = getRecommendedTracks(mockCatalog, recent, 'https://youtube.com/watch?v=1', 3);
    assert.equal(recommendations.length, 3);
    // Does not include the currently playing song (id: 1)
    assert.ok(!recommendations.some(r => r.id === '1'));
    // Arijit Singh tracks should be top prioritized
    assert.ok(recommendations[0].artist.includes('Arijit') || recommendations[1].artist.includes('Arijit'));
  });

  test('returns fallback diverse tracks when no listening history exists', () => {
    const recommendations = getRecommendedTracks(mockCatalog, [], null, 3);
    assert.equal(recommendations.length, 3);
  });
});

