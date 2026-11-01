import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

// Import from the upcoming webStreamUtils (test-first)
describe('Web Stream URL Parsing & Embed Generation', () => {
  const parseTikTokId = (url) => {
    if (!url) return null;
    const match = url.match(/(?:video\/|v\/|embed\/v2\/|embed\/|item\/)(\d{15,22})/i);
    return match ? match[1] : null;
  };

  const getTikTokEmbedUrl = (url) => {
    const id = parseTikTokId(url);
    if (!id) return null;
    return `https://www.tiktok.com/embed/v2/${id}?lang=en`;
  };

  const parseInstagramCode = (url) => {
    if (!url) return null;
    const match = url.match(/(?:instagram\.com\/(?:p|reel|tv)\/([a-zA-Z0-9_-]+))/i);
    return match ? match[1] : null;
  };

  const getInstagramEmbedUrl = (url) => {
    const code = parseInstagramCode(url);
    if (!code) return null;
    return `https://www.instagram.com/reel/${code}/embed`;
  };

  const parseWebStream = (url) => {
    if (!url) return null;
    // YouTube
    const ytMatch = url.match(/(?:youtube\.com\/(?:watch\?.*v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/i);
    if (ytMatch) {
      return {
        platform: 'youtube',
        id: ytMatch[1],
        embedUrl: `https://www.youtube-nocookie.com/embed/${ytMatch[1]}?autoplay=1&enablejsapi=1`,
      };
    }

    // TikTok
    const ttId = parseTikTokId(url);
    if (ttId) {
      return {
        platform: 'tiktok',
        id: ttId,
        embedUrl: `https://www.tiktok.com/embed/v2/${ttId}?lang=en`,
      };
    }

    // Instagram
    const igCode = parseInstagramCode(url);
    if (igCode) {
      return {
        platform: 'instagram',
        id: igCode,
        embedUrl: `https://www.instagram.com/reel/${igCode}/embed`,
      };
    }

    return null;
  };

  it('parses standard and shorts TikTok links', () => {
    const link1 = 'https://www.tiktok.com/@creator/video/7106594312292453675';
    assert.equal(parseTikTokId(link1), '7106594312292453675');
    assert.equal(getTikTokEmbedUrl(link1), 'https://www.tiktok.com/embed/v2/7106594312292453675?lang=en');

    const stream = parseWebStream(link1);
    assert.equal(stream?.platform, 'tiktok');
    assert.equal(stream?.id, '7106594312292453675');
  });

  it('parses Instagram reels and post links', () => {
    const reel = 'https://www.instagram.com/reel/C21AbCdEfGh/?utm_source=ig_web_copy_link';
    assert.equal(parseInstagramCode(reel), 'C21AbCdEfGh');
    assert.equal(getInstagramEmbedUrl(reel), 'https://www.instagram.com/reel/C21AbCdEfGh/embed');

    const stream = parseWebStream(reel);
    assert.equal(stream?.platform, 'instagram');
    assert.equal(stream?.id, 'C21AbCdEfGh');
  });

  it('parses YouTube links', () => {
    const yt = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
    const stream = parseWebStream(yt);
    assert.equal(stream?.platform, 'youtube');
    assert.equal(stream?.id, 'dQw4w9WgXcQ');
  });

  it('returns null for non-social media or standard video links', () => {
    assert.equal(parseWebStream('https://example.com/video.mp4'), null);
    assert.equal(parseWebStream('/path/to/local/movie.mkv'), null);
  });
});
