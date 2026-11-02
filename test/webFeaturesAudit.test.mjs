import { describe, it } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

describe('Real Website Logos, Video Stream Detection & Web Bookmarking Audit', () => {
  it('verifies favicon service extracts domains and generates high-res official favicon URLs', async () => {
    const { getWebsiteFaviconUrl, extractDomain } = await import('../src/utils/faviconService.ts');

    const cinesubzUrl = getWebsiteFaviconUrl('https://cinesubz.co/movie/sample');
    assert.match(cinesubzUrl, /google\.com\/s2\/favicons.*domain=cinesubz\.co/);

    const fmoviesUrl = getWebsiteFaviconUrl('https://fmoviesz.to/watch');
    assert.match(fmoviesUrl, /google\.com\/s2\/favicons.*domain=fmoviesz\.to/);

    const ytDomain = extractDomain('https://www.youtube.com/watch?v=123');
    assert.strictEqual(ytDomain, 'youtube.com');
  });

  it('verifies CINEMA_LINKS includes real website logo URLs for streaming platforms', () => {
    const cinemaCode = fs.readFileSync(path.join(rootDir, 'src/utils/cinemaLinks.ts'), 'utf-8');

    // Must define logoUrl in CinemaSiteItem
    assert.match(
      cinemaCode,
      /logoUrl\??:\s*string/i,
      'CinemaSiteItem must define optional logoUrl property'
    );

    // Curated items must include logoUrl
    assert.match(
      cinemaCode,
      /logoUrl:\s*['"]https?:\/\//i,
      'CINEMA_LINKS items must provide real website logo URLs'
    );
  });

  it('verifies FileBrowserModal renders real website logos in Cinema directory cards', () => {
    const modalCode = fs.readFileSync(path.join(rootDir, 'src/components/hud/FileBrowserModal.tsx'), 'utf-8');

    // Must render real img tag for site logos instead of only a generic Film icon
    assert.match(
      modalCode,
      /<img[^>]+(?:logoUrl|getWebsiteFaviconUrl)/i,
      'FileBrowserModal must render real website logo img in cinema cards'
    );
  });

  it('verifies playerStore supports bookmarkedWebsites and records recently played web videos', () => {
    const storeCode = fs.readFileSync(path.join(rootDir, 'src/store/playerStore.ts'), 'utf-8');

    // Must support bookmarkedWebsites
    assert.match(
      storeCode,
      /bookmarkedWebsites:\s*BookmarkedWebsite\[\]/i,
      'PlayerStoreState must include bookmarkedWebsites'
    );

    // Must support toggleWebsiteBookmark
    assert.match(
      storeCode,
      /toggleWebsiteBookmark/i,
      'playerStore must provide toggleWebsiteBookmark'
    );

    // openMedia must save web video metadata and favicon thumbnail in recentMedia
    assert.match(
      storeCode,
      /webPlatform|getWebsiteFaviconUrl/i,
      'openMedia must record web video metadata and logo in recentMedia'
    );
  });

  it('verifies WebBrowserModal provides bookmark toggle and connects detected videos to system engine', () => {
    const browserCode = fs.readFileSync(path.join(rootDir, 'src/components/hud/WebBrowserModal.tsx'), 'utf-8');

    // Must render real website logo in header
    assert.match(
      browserCode,
      /<img[^>]+getWebsiteFaviconUrl/i,
      'WebBrowserModal header must render real website favicon'
    );

    // Must include Bookmark/Star toggle button
    assert.match(
      browserCode,
      /Bookmark|Bookmarked|Star/i,
      'WebBrowserModal must provide a Bookmark/Save button'
    );

    // Must forward detected video and title to native player engine
    assert.match(
      browserCode,
      /onPlayInNativePlayer\(\s*(?:target|detectedMediaUrl)/i,
      'WebBrowserModal must forward detected media stream to onPlayInNativePlayer'
    );
  });

  it('verifies MikiPlayerApp.swift intercepts video streams via XHR/fetch and media elements', () => {
    const swiftCode = fs.readFileSync(path.join(rootDir, 'MikiPlayerApp.swift'), 'utf-8');

    // Injected script must scan for video tags and stream URLs (.m3u8, .mp4)
    assert.match(
      swiftCode,
      /m3u8|\.mp4|browserMediaDetected/i,
      'MikiPlayerApp.swift must detect video streams and report to browserMediaDetected'
    );
  });
});
