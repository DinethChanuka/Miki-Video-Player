/**
 * URL and Media URI Security Validator
 * Protects against scheme injection, script execution, and dangerous protocols
 */
export function validateSafeMediaUri(uri: unknown): boolean {
  if (!uri || typeof uri !== 'string') return false;
  const trimmed = uri.trim();
  if (!trimmed) return false;
  const lower = trimmed.toLowerCase();

  // Explicitly block dangerous script execution and arbitrary HTML schemes
  if (
    lower.startsWith('javascript:') ||
    lower.startsWith('vbscript:') ||
    lower.startsWith('data:text/html') ||
    lower.startsWith('data:application/')
  ) {
    return false;
  }

  // Allow standard web protocols, media streaming endpoints, blob URIs, and local file paths
  return (
    lower.startsWith('http://') ||
    lower.startsWith('https://') ||
    lower.startsWith('file://') ||
    lower.startsWith('blob:') ||
    lower.startsWith('data:image/') ||
    lower.startsWith('data:video/') ||
    lower.startsWith('data:audio/') ||
    lower.startsWith('/@media-stream') ||
    // POSIX absolute path
    trimmed.startsWith('/') ||
    // Windows drive letter path e.g. C:\... or C:/...
    /^[a-zA-Z]:[\\/]/.test(trimmed)
  );
}

