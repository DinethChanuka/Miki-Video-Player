import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  CINEMA_LINKS,
  filterCinemaLinks,
} from '../src/utils/cinemaLinks.ts';

describe('Cinema & Fast Streaming Links Catalog', () => {
  it('contains essential curated streaming portals including CineSubz and social platforms', () => {
    const cinesub = CINEMA_LINKS.find((item) => item.id === 'cinesubz');
    assert.ok(cinesub, 'CineSubz portal must be present');
    assert.equal(cinesub.url, 'https://cinesubz.co');
    assert.equal(cinesub.category, 'Subtitles');
    assert.equal(cinesub.isAdShieldRecommended, true);

    const yt = CINEMA_LINKS.find((item) => item.id === 'youtube');
    assert.ok(yt, 'YouTube must be present');

    const tt = CINEMA_LINKS.find((item) => item.id === 'tiktok');
    assert.ok(tt, 'TikTok must be present');

    const ig = CINEMA_LINKS.find((item) => item.id === 'instagram');
    assert.ok(ig, 'Instagram must be present');

    const fb = CINEMA_LINKS.find((item) => item.id === 'facebook');
    assert.ok(fb, 'Facebook must be present');
  });

  it('filters streaming portals by category correctly', () => {
    const all = filterCinemaLinks(CINEMA_LINKS, '', 'All');
    assert.equal(all.length, CINEMA_LINKS.length);

    const subtitles = filterCinemaLinks(CINEMA_LINKS, '', 'Subtitles');
    assert.ok(subtitles.some((item) => item.id === 'cinesubz'));
    assert.ok(subtitles.every((item) => item.category === 'Subtitles'));

    const social = filterCinemaLinks(CINEMA_LINKS, '', 'Social');
    assert.ok(social.some((item) => item.id === 'tiktok'));
    assert.ok(social.some((item) => item.id === 'instagram'));
    assert.ok(social.some((item) => item.id === 'facebook'));
  });

  it('filters portals with search query case-insensitively', () => {
    const matches = filterCinemaLinks(CINEMA_LINKS, 'cine', 'All');
    assert.ok(matches.length > 0);
    assert.ok(matches.some((item) => item.name.toLowerCase().includes('cine') || item.id.includes('cine')));

    const emptyMatches = filterCinemaLinks(CINEMA_LINKS, 'xyznonexistentportal999', 'All');
    assert.equal(emptyMatches.length, 0);
  });
});
