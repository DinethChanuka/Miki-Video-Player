/**
 * Stream Failover Manager
 * Coordinates primary source, backup mirror chains, retry limits,
 * failure escalation, and cross-channel session cancellation.
 */

export interface FailoverConfig {
  primaryUrl: string;
  backupUrls?: string[];
  maxRetriesPerSource?: number;
  channelName?: string;
}

export type FailoverAction = 'retry' | 'switch_source' | 'exhausted';

export interface FailoverResult {
  action: FailoverAction;
  url: string;
  sourceIndex: number;
  retryCount: number;
  reason?: string;
  channelName?: string;
}

export class StreamFailoverManager {
  private primaryUrl: string;
  private backupUrls: string[];
  private allSources: string[];
  private currentSourceIdx: number = 0;
  private retryCount: number = 0;
  private maxRetriesPerSource: number;
  private sessionId: string;
  private channelName?: string;
  private exhausted: boolean = false;

  constructor(config: FailoverConfig) {
    this.primaryUrl = config.primaryUrl;
    this.backupUrls = config.backupUrls || [];
    this.allSources = [this.primaryUrl, ...this.backupUrls.filter((u) => u !== this.primaryUrl)];
    this.maxRetriesPerSource = config.maxRetriesPerSource ?? 2;
    this.channelName = config.channelName;
    this.sessionId = `failover_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  }

  getCurrentUrl(): string {
    return this.allSources[this.currentSourceIdx] || this.primaryUrl;
  }

  getCurrentSourceIndex(): number {
    return this.currentSourceIdx;
  }

  isExhausted(): boolean {
    return this.exhausted;
  }

  getSessionId(): string {
    return this.sessionId;
  }

  isSessionActive(id: string): boolean {
    return this.sessionId === id;
  }

  /**
   * Records a stream error on the current URL.
   * If retry limit on current URL is not reached, returns action: 'retry'.
   * If retry limit is reached, moves to next available backup URL (action: 'switch_source').
   * If all backups are exhausted, returns action: 'exhausted'.
   */
  recordFailure(reason?: string): FailoverResult {
    if (this.exhausted) {
      return {
        action: 'exhausted',
        url: this.getCurrentUrl(),
        sourceIndex: this.currentSourceIdx,
        retryCount: this.retryCount,
        reason,
        channelName: this.channelName,
      };
    }

    if (this.retryCount < this.maxRetriesPerSource) {
      this.retryCount++;
      return {
        action: 'retry',
        url: this.getCurrentUrl(),
        sourceIndex: this.currentSourceIdx,
        retryCount: this.retryCount,
        reason,
        channelName: this.channelName,
      };
    }

    // Current source exceeded retry threshold -> advance to next backup
    if (this.currentSourceIdx + 1 < this.allSources.length) {
      this.currentSourceIdx++;
      this.retryCount = 0;
      return {
        action: 'switch_source',
        url: this.getCurrentUrl(),
        sourceIndex: this.currentSourceIdx,
        retryCount: 0,
        reason,
        channelName: this.channelName,
      };
    }

    // All sources exhausted
    this.exhausted = true;
    return {
      action: 'exhausted',
      url: this.getCurrentUrl(),
      sourceIndex: this.currentSourceIdx,
      retryCount: this.retryCount,
      reason,
      channelName: this.channelName,
    };
  }

  /**
   * Resets failover state for a new playback session on the same or new URL.
   */
  reset(newPrimaryUrl?: string, newBackups?: string[]): void {
    if (newPrimaryUrl) {
      this.primaryUrl = newPrimaryUrl;
      this.backupUrls = newBackups || [];
      this.allSources = [this.primaryUrl, ...this.backupUrls.filter((u) => u !== this.primaryUrl)];
    }
    this.currentSourceIdx = 0;
    this.retryCount = 0;
    this.exhausted = false;
    this.sessionId = `failover_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  }

  /**
   * Cancels the active session, preventing any deferred retry/failover execution.
   */
  cancel(): void {
    this.sessionId = `cancelled_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  }
}
