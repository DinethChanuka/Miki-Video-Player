import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  CINEMA_LINKS,
  filterCinemaLinks,
} from '../src/utils/cinemaLinks.ts';
import { SOCIAL_LINKS } from '../src/utils/socialLinks.ts';

describe('Cinema & Fast Streaming Links Catalog', () => {
  it('contains essential curated streaming portals including CineSubz and movie portals', () => {
    const cinesub = CINEMA_LINKS.find((item) => item.id === 'cinesubz');
    assert.ok(cinesub, 'CineSubz portal must be present');
    assert.equal(cinesub.url, 'https://cinesubz.lk');
    assert.equal(cinesub.canonicalUrl, 'https://cinesubz.lk');
    assert.equal(cinesub.category, 'Subtitles');
    assert.equal(cinesub.isAdShieldRecommended, true);

    const fmovies = CINEMA_LINKS.find((item) => item.id === 'fmovies');
    assert.ok(fmovies, 'FMovies must be present');

    const bflix = CINEMA_LINKS.find((item) => item.id === 'bflix');
    assert.ok(bflix, 'BFlix must be present');

    // Social platforms are maintained in SOCIAL_LINKS
    const yt = SOCIAL_LINKS.find((item) => item.id === 'youtube');
    assert.ok(yt, 'YouTube must be present in SOCIAL_LINKS');

    const tt = SOCIAL_LINKS.find((item) => item.id === 'tiktok');
    assert.ok(tt, 'TikTok must be present in SOCIAL_LINKS');

    const ig = SOCIAL_LINKS.find((item) => item.id === 'instagram');
    assert.ok(ig, 'Instagram must be present in SOCIAL_LINKS');

    const fb = SOCIAL_LINKS.find((item) => item.id === 'facebook');
    assert.ok(fb, 'Facebook must be present in SOCIAL_LINKS');
  });

  it('filters streaming portals by category correctly', () => {
    const all = filterCinemaLinks(CINEMA_LINKS, '', 'All');
    assert.equal(all.length, CINEMA_LINKS.length);

    const subtitles = filterCinemaLinks(CINEMA_LINKS, '', 'Subtitles');
    assert.ok(subtitles.some((item) => item.id === 'cinesubz'));
    assert.ok(subtitles.every((item) => item.category === 'Subtitles'));

    const anime = filterCinemaLinks(CINEMA_LINKS, '', 'Anime');
    assert.ok(anime.some((item) => item.id === 'aniwave'));

    const cinema = filterCinemaLinks(CINEMA_LINKS, '', 'Cinema');
    assert.ok(cinema.some((item) => item.id === 'fmovies'));
    assert.ok(cinema.some((item) => item.id === 'soap2day'));
  });

  it('filters portals with search query case-insensitively', () => {
    const matches = filterCinemaLinks(CINEMA_LINKS, 'cine', 'All');
    assert.ok(matches.length > 0);
    assert.ok(matches.some((item) => item.name.toLowerCase().includes('cine') || item.id.includes('cine')));

    const emptyMatches = filterCinemaLinks(CINEMA_LINKS, 'xyznonexistentportal999', 'All');
    assert.equal(emptyMatches.length, 0);
  });
});

