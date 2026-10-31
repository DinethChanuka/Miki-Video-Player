/**
 * Cross-Platform OS & File Path Management Utilities
 * 
 * Provides native path normalization, OS-detection, preset directory suggestions,
 * and clean display formatting for Windows, macOS, and Linux environments.
 */

export type OperatingSystem = 'windows' | 'macos' | 'linux';

/**
 * Detects host operating system from userAgent and platform hints
 */
export function detectOperatingSystem(): OperatingSystem {
  if (typeof window === 'undefined') return 'windows';
  
  const userAgent = window.navigator.userAgent.toLowerCase();
  const platform = window.navigator.platform?.toLowerCase() || '';

  if (platform.includes('win') || userAgent.includes('windows')) {
    return 'windows';
  }
  if (platform.includes('mac') || userAgent.includes('macintosh') || userAgent.includes('mac os')) {
    return 'macos';
  }
  return 'linux';
}

/**
 * Default OS-appropriate screenshot & media directories
 */
export function getOSPresetDirectories(targetOS: OperatingSystem = detectOperatingSystem()): {
  label: string;
  path: string;
  description: string;
}[] {
  switch (targetOS) {
    case 'windows':
      return [
        {
          label: 'Pictures (Default)',
          path: 'C:\\Users\\%USERNAME%\\Pictures\\Miki Player\\Screenshots',
          description: 'Standard Windows Pictures Library',
        },
        {
          label: 'Videos Library',
          path: 'C:\\Users\\%USERNAME%\\Videos\\Miki Player',
          description: 'Windows User Videos directory',
        },
        {
          label: 'Downloads Folder',
          path: 'C:\\Users\\%USERNAME%\\Downloads',
          description: 'User Downloads folder',
        },
        {
          label: 'Desktop',
          path: 'C:\\Users\\%USERNAME%\\Desktop',
          description: 'Active Windows Desktop workspace',
        },
      ];
    case 'macos':
      return [
        {
          label: 'Pictures (Default)',
          path: '~/Pictures/Miki Player/Screenshots',
          description: 'macOS User Pictures directory',
        },
        {
          label: 'Movies',
          path: '~/Movies/Miki Player',
          description: 'macOS User Movies directory',
        },
        {
          label: 'Downloads',
          path: '~/Downloads',
          description: 'User Downloads folder',
        },
        {
          label: 'Desktop',
          path: '~/Desktop',
          description: 'macOS Desktop space',
        },
      ];
    case 'linux':
    default:
      return [
        {
          label: 'Pictures (Default)',
          path: '~/Pictures/Miki-Player/Screenshots',
          description: 'XDG Pictures directory',
        },
        {
          label: 'Videos',
          path: '~/Videos/Miki-Player',
          description: 'XDG Videos directory',
        },
        {
          label: 'Downloads',
          path: '~/Downloads',
          description: 'User Downloads directory',
        },
        {
          label: 'Desktop',
          path: '~/Desktop',
          description: 'Linux User Desktop directory',
        },
      ];
  }
}

/**
 * Formats a path according to host OS file conventions
 */
export function formatPathForOS(
  inputPath: string,
  targetOS: OperatingSystem = detectOperatingSystem()
): string {
  if (!inputPath) return '';

  let cleaned = inputPath.trim();

  // Strip file protocol if present
  if (cleaned.startsWith('file:///')) {
    cleaned = decodeURIComponent(cleaned.replace('file:///', ''));
    if (targetOS === 'windows' && !/^[a-zA-Z]:/.test(cleaned)) {
      // Keep leading slash or adjust drive
    } else if (targetOS !== 'windows') {
      cleaned = '/' + cleaned;
    }
  }

  if (targetOS === 'windows') {
    // Replace forward slashes with backslashes
    cleaned = cleaned.replace(/\//g, '\\');
    // If it started with ~/ on Windows, rewrite to C:\Users\%USERNAME%\
    if (cleaned.startsWith('~\\')) {
      cleaned = 'C:\\Users\\%USERNAME%\\' + cleaned.substring(2);
    }
  } else {
    // Unix (macOS / Linux): Replace backslashes with forward slashes
    cleaned = cleaned.replace(/\\/g, '/');
    if (cleaned.startsWith('C:/Users/%USERNAME%/') || cleaned.startsWith('C:/Users/')) {
      cleaned = '~/' + cleaned.split('/').slice(3).join('/');
    }
  }

  return cleaned;
}

/**
 * Extracts a human-friendly display name from a file path or URL
 */
export function extractCleanFileName(uriOrPath: string): string {
  if (!uriOrPath) return 'Untitled Media';

  // Decode URI component
  let clean = decodeURIComponent(uriOrPath);

  // Remove protocols
  clean = clean.replace(/^(file:\/\/\/|https?:\/\/|asset:\/\/)/, '');

  // Extract after last slash or backslash
  const segments = clean.split(/[/\\\\]/);
  const last = segments[segments.length - 1] || clean;

  // Remove URL query parameters or hashes
  const cleanName = last.split(/[?#]/)[0] || last;

  return cleanName || 'Untitled Media';
}
