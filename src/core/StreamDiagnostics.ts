/**
 * Stream Diagnostics Engine
 * Classifies HTTP status codes, network timeouts, CORS issues, and media decodes
 * into structured diagnostics with human-readable guidance.
 */

export type StreamFailureReason =
  | 'MANIFEST_UNAVAILABLE'
  | 'CORS_RESTRICTED'
  | 'HTTP_FORBIDDEN'
  | 'HTTP_NOT_FOUND'
  | 'SEGMENT_TIMEOUT'
  | 'CODEC_UNSUPPORTED'
  | 'NETWORK_OFFLINE'
  | 'INIT_FAILED'
  | 'UNKNOWN';

export interface StreamDiagnosticResult {
  reason: StreamFailureReason;
  userMessage: string;
  isRecoverable: boolean;
  suggestedAction: string;
  httpStatus?: number;
  technicalDetails?: string;
}

export function isCorsLikely(err: unknown, _url?: string): boolean {
  if (!err) return false;
  const msg = typeof err === 'object' && err !== null && 'message' in err
    ? String((err as { message: unknown }).message).toLowerCase()
    : String(err).toLowerCase();

  if (msg.includes('cors') || msg.includes('cross-origin') || msg.includes('origin')) {
    return true;
  }

  // Type error with fetch usually indicates cross-origin blocked response (status 0)
  if (msg.includes('failed to fetch') || msg.includes('network request failed')) {
    return true;
  }

  return false;
}

export function diagnoseStreamFailure(
  error: unknown,
  httpStatus?: number,
  url?: string
): StreamDiagnosticResult {
  const details = typeof error === 'object' && error !== null && 'details' in error
    ? String((error as { details: unknown }).details)
    : typeof error === 'object' && error !== null && 'message' in error
    ? String((error as { message: unknown }).message)
    : String(error || '');

  const lowerDetails = details.toLowerCase();

  if (httpStatus === 403) {
    return {
      reason: 'HTTP_FORBIDDEN',
      httpStatus: 403,
      userMessage: 'Stream access restricted or geo-blocked (HTTP 403 Forbidden).',
      isRecoverable: true,
      suggestedAction: 'Attempting backup broadcast mirror or open in web browser.',
      technicalDetails: details,
    };
  }

  if (httpStatus === 404) {
    return {
      reason: 'HTTP_NOT_FOUND',
      httpStatus: 404,
      userMessage: 'Stream not found or broadcast is currently off-air (HTTP 404 Not Found).',
      isRecoverable: true,
      suggestedAction: 'Switching to backup live source.',
      technicalDetails: details,
    };
  }

  if (
    lowerDetails.includes('fragloadtimeout') ||
    lowerDetails.includes('manifestloadingtimeout') ||
    lowerDetails.includes('levelloadtimeout') ||
    lowerDetails.includes('stream_timeout')
  ) {
    return {
      reason: 'SEGMENT_TIMEOUT',
      userMessage: 'Stream connection timed out while loading media segments.',
      isRecoverable: true,
      suggestedAction: 'Attempting low-latency stream reload or backup mirror.',
      technicalDetails: details,
    };
  }

  if (isCorsLikely(error, url) || lowerDetails.includes('manifestloaderror')) {
    return {
      reason: 'CORS_RESTRICTED',
      httpStatus: httpStatus || 0,
      userMessage: 'Broadcast server restricts direct cross-origin web player access (CORS policy).',
      isRecoverable: true,
      suggestedAction: 'Seamlessly activating native AVPlayer / WebKit decoder or backup stream.',
      technicalDetails: details,
    };
  }

  if (lowerDetails.includes('networkerror') || lowerDetails.includes('offline') || lowerDetails.includes('failed to fetch')) {
    return {
      reason: 'NETWORK_OFFLINE',
      userMessage: 'Network error: broadcast host unreachable or Internet disconnected.',
      isRecoverable: true,
      suggestedAction: 'Checking connectivity and retrying with backoff.',
      technicalDetails: details,
    };
  }

  if (lowerDetails.includes('codec') || lowerDetails.includes('demux') || lowerDetails.includes('unsupported')) {
    return {
      reason: 'CODEC_UNSUPPORTED',
      userMessage: 'Video/Audio format or container is not natively supported by this Web engine.',
      isRecoverable: true,
      suggestedAction: 'Routing to native player engine or hardware accelerated decoder.',
      technicalDetails: details,
    };
  }

  return {
    reason: 'UNKNOWN',
    userMessage: 'An unexpected stream disruption occurred.',
    isRecoverable: true,
    suggestedAction: 'Self-healing playback via backup mirror.',
    technicalDetails: details,
  };
}
