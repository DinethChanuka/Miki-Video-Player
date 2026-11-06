/**
 * Smart Music Recommendation Algorithm
 * 
 * Computes cosine-like contextual affinity scores based on:
 * - Current track artist and genre
 * - User's recent listening history
 * - Mood and category tags
 * - Diversity exploration
 */

export interface TrackCandidate {
  id: string;
  title: string;
  artist: string;
  category?: string;
  genre?: string;
  streamUrl?: string;
  coverUrl?: string;
  duration?: string;
  [key: string]: any;
}

export interface HistoryItem {
  uri?: string;
  title?: string;
  [key: string]: any;
}

export function getRecommendedTracks<T extends TrackCandidate>(
  catalog: T[],
  recentHistory: HistoryItem[] = [],
  currentUri: string | null = null,
  limit = 6
): T[] {
  if (!catalog || catalog.length === 0) return [];

  // 1. Filter out currently playing track
  const candidates = catalog.filter((c) => {
    if (!currentUri) return true;
    return c.streamUrl !== currentUri && c.id !== currentUri;
  });

  if (candidates.length <= limit) return candidates;

  // 2. Extract artist and category frequencies from history
  const artistWeights = new Map<string, number>();
  const categoryWeights = new Map<string, number>();

  recentHistory.slice(0, 15).forEach((h, index) => {
    const recencyMultiplier = 1.0 - (index / 15) * 0.5; // recent items have higher weight
    const titleStr = (h.title || '').toLowerCase();

    // Check against catalog artists
    catalog.forEach((c) => {
      const art = c.artist.toLowerCase();
      if (titleStr.includes(art)) {
        artistWeights.set(art, (artistWeights.get(art) || 0) + 3 * recencyMultiplier);
        if (c.category) {
          const cat = c.category.toLowerCase();
          categoryWeights.set(cat, (categoryWeights.get(cat) || 0) + 2 * recencyMultiplier);
        }
      }
    });
  });

  // 3. Score candidates
  const scored = candidates.map((cand) => {
    let score = Math.random() * 0.5; // slight entropy for discovery excitement
    const candArtist = cand.artist.toLowerCase();
    const candCat = (cand.category || '').toLowerCase();

    // Artist affinity match
    if (artistWeights.has(candArtist)) {
      score += artistWeights.get(candArtist)!;
    }

    // Category / genre affinity match
    if (categoryWeights.has(candCat)) {
      score += categoryWeights.get(candCat)!;
    }

    return { candidate: cand, score };
  });

  // Sort descending by score
  scored.sort((a, b) => b.score - a.score);

  return scored.slice(0, limit).map((s) => s.candidate);
}
