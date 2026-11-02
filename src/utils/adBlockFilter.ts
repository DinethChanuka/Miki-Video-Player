/**
 * High-Efficiency Ad-Block, Tracker-Block & Popup Suppression Shield Engine
 * Designed for embedded web browsing and free movie streaming sites (e.g. CineSubz, FMovies).
 */

export const AD_BLOCK_DOMAINS: string[] = [
  // Major Ad Networks & Banners
  'doubleclick.net',
  'googlesyndication.com',
  'googleadservices.com',
  'adservice.google.com',
  'adnxs.com',
  'advertising.com',
  'rubiconproject.com',
  'pubmatic.com',
  'criteo.com',
  'outbrain.com',
  'taboola.com',
  'adbutler.com',
  'zedo.com',
  'yieldmo.com',
  'openx.net',
  'adblade.com',
  'revcontent.com',
  'infolinks.com',
  'bidswitch.net',
  'smartadserver.com',
  'casalemedia.com',
  'media.net',

  // Popups, Pop-unders & Streaming Ad Traps
  'popads.net',
  'popcash.net',
  'adsterra.com',
  'propellerads.com',
  'exoclick.com',
  'juicyads.com',
  'clickadu.com',
  'hilltopads.com',
  'trafficstars.com',
  'yllix.com',
  'ero-advertising.com',
  'ad-maven.com',
  'admaven.com',
  'clksite.com',
  'onclickalgo.com',
  'onclickperformance.com',
  'revenuehits.com',
  'bidvertiser.com',
  'zeroredirect1.com',
  'adnium.com',
  'adtrue.com',
  'monetag.com',
  'mgid.com',

  // Malicious Redirects & Crypto Miners
  'coinhive.com',
  'coin-have.com',
  'jsecoin.com',
  'cryptoloot.pro',
  'webminepool.com',
  'safelinkconverter.com',
  'adf.ly',
  'ouo.io',
  'shorte.st',
  'bc.vc',

  // Video Pre-rolls & In-Player Overlays
  'aniview.com',
  'spotxchange.com',
  'springserve.com',
  'tremorhub.com',
  'vi-serve.com',
  'vidoomy.com',
  'streamrail.com',
  'playwire.com',
];

export const AD_PATH_PATTERNS: RegExp[] = [
  /\/ads?\//i,
  /\/ad-client\//i,
  /\/pagead\//i,
  /\/pop\.js/i,
  /\/banner\./i,
  /\/interstitial\./i,
  /\/splash\.php/i,
  /\/delivery\/ajs\.php/i,
  /\/adsense\./i,
];

/**
 * Tests whether a given URL or host matches known ad, tracker, or popup patterns.
 */
export function isBlockedUrl(urlStr: string): boolean {
  if (!urlStr) return false;
  try {
    const parsed = new URL(urlStr);
    const hostname = parsed.hostname.toLowerCase();
    const pathname = parsed.pathname.toLowerCase();

    // Check host suffix against domain blocklist
    for (const domain of AD_BLOCK_DOMAINS) {
      if (hostname === domain || hostname.endsWith('.' + domain)) {
        return true;
      }
    }

    // Check path patterns
    for (const pattern of AD_PATH_PATTERNS) {
      if (pattern.test(pathname)) {
        return true;
      }
    }

    return false;
  } catch {
    // If not a full URL, check as partial hostname or string
    const lower = urlStr.toLowerCase();
    return AD_BLOCK_DOMAINS.some((domain) => lower.includes(domain));
  }
}

/**
 * Sanitizes and formats an input string into a valid, secure navigable URL.
 * Defaults to Google search if a search query is detected.
 */
export function getCleanUrl(input: string): string {
  const trimmed = (input || '').trim();
  if (!trimmed) return 'https://www.youtube.com';

  // If already starts with http/https
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }

  // If looks like a domain name (e.g. cinesubz.co, youtube.com)
  if (/^[a-z0-9-]+(\.[a-z0-9-]+)+(:[0-9]+)?(\/.*)?$/i.test(trimmed)) {
    return `https://${trimmed}`;
  }

  // Otherwise treat as search query
  return `https://www.google.com/search?q=${encodeURIComponent(trimmed).replace(/%20/g, '+')}`;
}

/**
 * Client-side script injected into the browser frame to neutralize
 * window.open popups, alert traps, and full-screen redirect overlays.
 */
export function generateAdBlockScript(): string {
  return `
(function() {
  // 1. Neutralize window.open popup hijackers
  window.open = function(url) {
    console.warn('[Miki Shield] Blocked popup window.open request to:', url);
    return null;
  };

  // 2. Suppress invasive alert/confirm/prompt loops
  window.alert = function(msg) { console.warn('[Miki Shield] Blocked alert:', msg); };
  window.confirm = function() { return false; };
  window.prompt = function() { return null; };

  // 3. Remove invisible click-hijack overlays
  const removeHijackOverlays = () => {
    try {
      const overlays = document.querySelectorAll('div[style*="z-index: 2147483647"], div[style*="z-index:999999"], iframe[src*="about:blank"]');
      overlays.forEach(el => {
        if (el && el.parentElement && el.offsetWidth >= window.innerWidth * 0.8 && el.offsetHeight >= window.innerHeight * 0.8) {
          el.remove();
        }
      });
    } catch (e) {}
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', removeHijackOverlays);
  } else {
    removeHijackOverlays();
  }
  setInterval(removeHijackOverlays, 1500);
})();
`;
}
