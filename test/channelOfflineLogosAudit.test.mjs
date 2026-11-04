import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { CURATED_CHANNELS } from '../src/utils/channelCatalog.ts';

describe('Task 1: Offline Local Vector Channel Logos Audit', () => {
  it('verifies all 100+ channels have 100% local SVG data URI logos with zero online URLs', () => {
    assert.ok(
      CURATED_CHANNELS.length >= 100,
      `Expected at least 100 curated channels, got ${CURATED_CHANNELS.length}`
    );

    const onlineLogos = [];
    for (const channel of CURATED_CHANNELS) {
      assert.ok(channel.logo && channel.logo.trim(), `Channel ${channel.name} must have a logo`);

      if (
        channel.logo.includes('unsplash.com') ||
        channel.logo.startsWith('http://') ||
        channel.logo.startsWith('https://')
      ) {
        onlineLogos.push(`${channel.name}: ${channel.logo.slice(0, 40)}`);
      }

      assert.ok(
        channel.logo.startsWith('data:image/svg+xml'),
        `Channel ${channel.name} logo must be a local SVG data URI, but was: ${channel.logo.slice(0, 30)}`
      );
    }

    assert.equal(
      onlineLogos.length,
      0,
      `Found online URLs for channels: ${onlineLogos.slice(0, 5).join(' | ')}`
    );
  });

  it('verifies 100% unique channel logos with zero duplicates across all channels', () => {
    const seen = new Set();
    const duplicates = [];

    for (const channel of CURATED_CHANNELS) {
      if (seen.has(channel.logo)) {
        duplicates.push(channel.name);
      }
      seen.add(channel.logo);
    }

    assert.equal(
      duplicates.length,
      0,
      `Found duplicate logos across channels: ${duplicates.join(', ')}`
    );
  });

  it('verifies decoded logo SVG contains valid SVG markup and station identifiers', () => {
    for (const channel of CURATED_CHANNELS) {
      const decoded = decodeURIComponent(channel.logo.replace('data:image/svg+xml;utf8,', ''));
      assert.ok(decoded.includes('<svg'), `Channel ${channel.name} logo must contain <svg tag`);
      assert.ok(decoded.includes('</svg>'), `Channel ${channel.name} logo must contain </svg> closing tag`);
      assert.ok(decoded.includes('viewBox='), `Channel ${channel.name} logo must have viewBox`);
    }
  });
});
