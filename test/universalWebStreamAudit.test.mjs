import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseWebStream } from '../src/utils/webStreamUtils.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

describe('Universal Web Stream Parsing & Cinema Platform Support Audit', () => {
  it('parses Vimeo video URLs into embed URLs', () => {
    const stream = parseWebStream('https://vimeo.com/76979871');
    assert.ok(stream, 'Vimeo URL must be recognized');
    assert.equal(stream.platform, 'vimeo');
    assert.equal(stream.id, '76979871');
    assert.equal(stream.embedUrl, 'https://player.vimeo.com/video/76979871?autoplay=1');
  });

  it('parses Twitch stream and video URLs', () => {
    const stream = parseWebStream('https://www.twitch.tv/esl_csgo');
    assert.ok(stream, 'Twitch URL must be recognized');
    assert.equal(stream.platform, 'twitch');
    assert.equal(stream.id, 'esl_csgo');
    assert.match(stream.embedUrl, /player\.twitch\.tv/i);
  });

  it('parses Dailymotion video URLs', () => {
    const stream = parseWebStream('https://www.dailymotion.com/video/x8xyz12');
    assert.ok(stream, 'Dailymotion URL must be recognized');
    assert.equal(stream.platform, 'dailymotion');
    assert.equal(stream.id, 'x8xyz12');
    assert.equal(stream.embedUrl, 'https://www.dailymotion.com/embed/video/x8xyz12?autoplay=1');
  });

  it('parses CineSubz and popular cinema portals into cinema web streams', () => {
    const cinesubz = parseWebStream('https://cinesubz.co/movie/alien-romulus-2024/');
    assert.ok(cinesubz, 'CineSubz link must parse as cinema web stream');
    assert.equal(cinesubz.platform, 'cinema');
    assert.equal(cinesubz.originalUrl, 'https://cinesubz.co/movie/alien-romulus-2024/');

    const fmovies = parseWebStream('https://fmoviesz.to/watch/movie-123');
    assert.ok(fmovies, 'FMovies link must parse as cinema web stream');
    assert.equal(fmovies.platform, 'cinema');

    const vidsrc = parseWebStream('https://vidsrc.to/embed/movie/1022789');
    assert.ok(vidsrc, 'VidSrc embed link must parse as cinema web stream');
    assert.equal(vidsrc.platform, 'cinema');
  });

  it('verifies playerStore does not kick cinema links out of inbuilt player', () => {
    const storePath = path.join(rootDir, 'src/store/playerStore.ts');
    const storeCode = fs.readFileSync(storePath, 'utf8');

    // Make sure openMedia doesn't just do window.dispatchEvent(miki:navigate-web-browser) and return
    assert.doesNotMatch(
      storeCode,
      /if\s*\(\s*isHttp\s*&&\s*!isDirectMediaUrl\(uri\)\s*\)\s*\{[\s\S]*?dispatchEvent\(\s*new\s*CustomEvent\(\s*['"]miki:navigate-web-browser['"]/i,
      'openMedia must NOT dismiss cinema streams to web browser modal'
    );
  });
});

