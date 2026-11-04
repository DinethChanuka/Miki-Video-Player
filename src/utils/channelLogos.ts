/**
 * Authentic Offline Vector TV Channel Logo Generator
 * Generates crisp, zero-latency vector logos with broadcast badges, station initials,
 * country flags, and category theme gradients for all curated channels.
 * Completely eliminates dependencies on external image hosting services.
 */

function encodeSvg(svg: string): string {
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg.trim())}`;
}

export function getChannelInitials(name: string): string {
  const clean = name
    .replace(/\b(TV|HD|Live|News|Channel|International|English|Worldwide|Broadcast|Station|Global)\b/gi, '')
    .trim();
  const words = clean.split(/\s+/).filter(Boolean);
  if (words.length >= 2) {
    return (words[0].slice(0, 2) + words[1].slice(0, 2)).toUpperCase();
  }
  if (words.length === 1 && words[0].length >= 3) {
    return words[0].slice(0, 4).toUpperCase();
  }
  return name.slice(0, 4).toUpperCase();
}

export function generateChannelLogoSvg(
  id: string,
  name: string,
  category: string,
  country: string,
  quality: string = '1080p'
): string {
  const initials = getChannelInitials(name);

  const categoryThemes: Record<
    string,
    { bg1: string; bg2: string; accent: string; iconFill: string }
  > = {
    News: { bg1: '#1e3a8a', bg2: '#090d16', accent: '#ef4444', iconFill: '#38bdf8' },
    Movies: { bg1: '#581c87', bg2: '#12041e', accent: '#f59e0b', iconFill: '#c084fc' },
    Music: { bg1: '#be123c', bg2: '#180208', accent: '#ec4899', iconFill: '#f43f5e' },
    Sports: { bg1: '#047857', bg2: '#021e17', accent: '#eab308', iconFill: '#34d399' },
    Tech: { bg1: '#0e7490', bg2: '#041f27', accent: '#06b6d4', iconFill: '#38bdf8' },
    Nature: { bg1: '#15803d', bg2: '#05230e', accent: '#84cc16', iconFill: '#4ade80' },
    Entertainment: { bg1: '#c2410c', bg2: '#1c0702', accent: '#f97316', iconFill: '#fb923c' },
    Custom: { bg1: '#4338ca', bg2: '#0b0b1c', accent: '#818cf8', iconFill: '#a5b4fc' },
  };

  const theme = categoryThemes[category] || categoryThemes.News;
  const safeId = id.replace(/[^a-zA-Z0-9]/g, '');

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 120" width="100%" height="100%">
      <defs>
        <linearGradient id="chGrad_${safeId}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${theme.bg1}"/>
          <stop offset="100%" stop-color="${theme.bg2}"/>
        </linearGradient>
        <pattern id="chGrid_${safeId}" width="10" height="10" patternUnits="userSpaceOnUse">
          <path d="M 10 0 L 0 0 0 10" fill="none" stroke="rgba(255,255,255,0.04)" stroke-width="0.5"/>
        </pattern>
      </defs>
      
      <!-- Background & Grid -->
      <rect width="200" height="120" rx="12" fill="url(#chGrad_${safeId})"/>
      <rect width="200" height="120" rx="12" fill="url(#chGrid_${safeId})"/>
      
      <!-- Top Country & Resolution Badges -->
      <rect x="12" y="10" width="34" height="18" rx="4" fill="rgba(0,0,0,0.5)" stroke="rgba(255,255,255,0.15)"/>
      <text x="29" y="23" font-family="system-ui, sans-serif" font-size="9" font-weight="900" fill="#ffffff" text-anchor="middle">
        ${country.toUpperCase()}
      </text>

      <rect x="146" y="10" width="42" height="18" rx="4" fill="${theme.accent}" opacity="0.9"/>
      <text x="167" y="23" font-family="system-ui, sans-serif" font-size="9" font-weight="900" fill="#ffffff" text-anchor="middle">
        ${quality.toUpperCase()}
      </text>

      <!-- Center Broadcast Identity / Initials -->
      <g transform="translate(100, 60)">
        <!-- Radio/Radar Signal Waves -->
        <circle cx="0" cy="0" r="28" fill="none" stroke="${theme.iconFill}" stroke-width="1.5" opacity="0.25"/>
        <circle cx="0" cy="0" r="20" fill="none" stroke="${theme.iconFill}" stroke-width="1" opacity="0.4"/>
        
        <text x="0" y="7" font-family="system-ui, sans-serif" font-size="20" font-weight="900" fill="#ffffff" text-anchor="middle" letter-spacing="1.5">
          ${initials}
        </text>
      </g>

      <!-- Bottom Channel Name Pill -->
      <line x1="16" y1="92" x2="184" y2="92" stroke="${theme.iconFill}" stroke-width="1.5" opacity="0.4"/>
      <text x="100" y="107" font-family="system-ui, sans-serif" font-size="9" font-weight="bold" fill="rgba(255,255,255,0.8)" text-anchor="middle" letter-spacing="0.5">
        ${name.length > 24 ? name.slice(0, 23) + '…' : name}
      </text>
    </svg>
  `;

  return encodeSvg(svg);
}
