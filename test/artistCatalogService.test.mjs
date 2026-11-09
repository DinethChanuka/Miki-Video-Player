import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  ARTIST_CATALOG,
  searchArtists,
  getArtistById,
  fetchArtistSongsLive,
} from '../src/utils/artistCatalogService.ts';

describe('Multilingual Artist Catalog & Search Service', () => {
  test('Catalog contains extensive artists across English, Hindi, and Sinhala', () => {
    assert.ok(ARTIST_CATALOG.length >= 30, 'Catalog should contain at least 30 artists');

    const englishArtists = ARTIST_CATALOG.filter((a) => a.language === 'english');
    const hindiArtists = ARTIST_CATALOG.filter((a) => a.language === 'hindi');
    const sinhalaArtists = ARTIST_CATALOG.filter((a) => a.language === 'sinhala');

    assert.ok(englishArtists.length >= 10, 'Must have at least 10 English artists');
    assert.ok(hindiArtists.length >= 10, 'Must have at least 10 Hindi artists');
    assert.ok(sinhalaArtists.length >= 10, 'Must have at least 10 Sinhala artists');
  });

  test('Finds English artists by name or alias', () => {
    const travis = searchArtists('Travis Scott');
    assert.ok(travis.length > 0);
    assert.equal(travis[0].id, 'travis-scott');

    const weeknd = searchArtists('Starboy');
    assert.ok(weeknd.length > 0);
    assert.equal(weeknd[0].id, 'the-weeknd');

    const camila = searchArtists('Camila');
    assert.ok(camila.length > 0);
    assert.equal(camila[0].id, 'camila-cabello');
  });

  test('Finds Hindi artists by English romanized and Devanagari native script', () => {
    // English query
    const arijit = searchArtists('Arijit Singh');
    assert.ok(arijit.length > 0);
    assert.equal(arijit[0].id, 'arijit-singh');

    // Hindi Devanagari query
    const shreya = searchArtists('श्रेया घोषाल');
    assert.ok(shreya.length > 0);
    assert.equal(shreya[0].id, 'shreya-ghoshal');

    // Partial Devanagari query
    const sonu = searchArtists('सोनू');
    assert.ok(sonu.length > 0);
    assert.equal(sonu[0].id, 'sonu-nigam');
  });

  test('Finds Sinhala artists by English romanized and Sinhala Unicode script', () => {
    // English query
    const kasun = searchArtists('Kasun Kalhara');
    assert.ok(kasun.length > 0);
    assert.equal(kasun[0].id, 'kasun-kalhara');

    // Sinhala script query
    const jothipala = searchArtists('ජෝතිපාල');
    assert.ok(jothipala.length > 0);
    assert.equal(jothipala[0].id, 'hr-jothipala');

    // Sinhala script Amaradeva
    const amaradeva = searchArtists('අමරදේව');
    assert.ok(amaradeva.length > 0);
    assert.equal(amaradeva[0].id, 'wd-amaradeva');

    // BNS alias
    const bns = searchArtists('BNS');
    assert.ok(bns.length > 0);
    assert.equal(bns[0].id, 'bns');
  });

  test('Filters artists by language', () => {
    const hindiOnly = searchArtists('', 'hindi');
    assert.ok(hindiOnly.length >= 10);
    assert.ok(hindiOnly.every((a) => a.language === 'hindi'));

    const sinhalaOnly = searchArtists('', 'sinhala');
    assert.ok(sinhalaOnly.length >= 10);
    assert.ok(sinhalaOnly.every((a) => a.language === 'sinhala'));

    const englishOnly = searchArtists('', 'english');
    assert.ok(englishOnly.length >= 10);
    assert.ok(englishOnly.every((a) => a.language === 'english'));
  });

  test('getArtistById returns exact artist profile or null', () => {
    const artist = getArtistById('billie-eilish');
    assert.ok(artist);
    assert.equal(artist?.name, 'Billie Eilish');

    const nonExistent = getArtistById('non-existent-artist');
    assert.equal(nonExistent, null);
  });

  test('fetchArtistSongsLive loads tracks for an artist and returns structured music tracks', async () => {
    const songs = await fetchArtistSongsLive('Arijit Singh');
    assert.ok(Array.isArray(songs), 'Must return an array of songs');
    assert.ok(songs.length > 0, 'Must load tracks for Arijit Singh');
    assert.ok(songs[0].streamUrl, 'Tracks must have valid streamUrl');
    assert.ok(songs[0].title, 'Tracks must have title');
  });
});
