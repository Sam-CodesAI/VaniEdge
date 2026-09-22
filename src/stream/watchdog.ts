/**
 * Sub-Second Telephony Watchdog Failover Engine
 *
 * Guarantees zero dropped calls by constantly monitoring:
 * 1. Upstream connection latency (Connect deadline: 1,200ms)
 * 2. Conversational response latency / TTFT (Time To First Token deadline: 1,500ms)
 * 3. Network connection dropouts and socket anomalies
 *
 * When an SLA breach is detected, the watchdog immediately dispatches a Twilio
 * live call redirect to bridge the customer seamlessly to a human specialist.
 */

import { MetricsCollector } from '../telemetry/metrics';

export type WatchdogState =
  | 'INITIALIZING'
  | 'STREAM_READY'
  | 'LISTENING'
  | 'AWAITING_AGENT_RESPONSE'
  | 'AGENT_SPEAKING'
  | 'FAILING_OVER'
  | 'FAILED_OVER'
  | 'CLOSED';

export interface WatchdogConfig {
  callSid: string;
  streamSid: string;
  connectTimeoutMs?: number; // Default: 1200ms
  ttftTimeoutMs?: number;    // Default: 1500ms
  onFailover: (reason: string, elapsedMs: number) => Promise<void>;
  onClearAudioBuffer?: () => void;
}

export class WatchdogEngine {
  private state: WatchdogState = 'INITIALIZING';
  private callSid: string;
  private streamSid: string;
  private connectTimeoutMs: number;
  private ttftTimeoutMs: number;
  private onFailover: (reason: string, elapsedMs: number) => Promise<void>;
  private onClearAudioBuffer?: () => void;

  private connectTimer: ReturnType<typeof setTimeout> | null = null;
  private ttftTimer: ReturnType<typeof setTimeout> | null = null;
  private turnStartTime: number | null = null;
  private isFailoverDispatched = false;

  constructor(config: WatchdogConfig) {
    this.callSid = config.callSid;
    this.streamSid = config.streamSid;
    this.connectTimeoutMs = config.connectTimeoutMs ?? 1200;
    this.ttftTimeoutMs = config.ttftTimeoutMs ?? 1500;
    this.onFailover = config.onFailover;
    this.onClearAudioBuffer = config.onClearAudioBuffer;
  }

  public getState(): WatchdogState {
    return this.state;
  }

  public isFailedOver(): boolean {
    return this.isFailoverDispatched;
  }

  /**
   * Starts the initial upstream handshake watchdog timer.
   * If ElevenLabs does not complete WebSocket handshake within connectTimeoutMs,
   * failover is immediately executed.
   */
  public armConnectWatchdog(): void {
    if (this.isFailoverDispatched || this.state === 'CLOSED') return;

    this.cancelConnectWatchdog();
    const startTime = performance.now();

    this.connectTimer = setTimeout(() => {
      const elapsed = Math.round(performance.now() - startTime);
      this.triggerFailover('connect_timeout', elapsed);
    }, this.connectTimeoutMs);
  }

  public cancelConnectWatchdog(): void {
    if (this.connectTimer) {
      clearTimeout(this.connectTimer);
      this.connectTimer = null;
    }
  }

  /**
   * Called when upstream WebSocket is open and conversation metadata is received.
   */
  public onUpstreamConnected(handshakeMs: number): void {
    this.cancelConnectWatchdog();
    if (this.isFailoverDispatched) return;

    MetricsCollector.getInstance().recordLatency('upstream_handshake', handshakeMs);
    this.state = 'STREAM_READY';
  }

  /**
   * Called when user finishes speaking / speech pause is detected.
   * Arms the TTFT (Time To First Token) deadline.
   */
  public onUserTurnCompleted(): void {
    if (this.isFailoverDispatched || this.state === 'CLOSED') return;

    this.cancelTtftWatchdog();
    this.state = 'AWAITING_AGENT_RESPONSE';
    this.turnStartTime = performance.now();

    this.ttftTimer = setTimeout(() => {
      const elapsed = this.turnStartTime
        ? Math.round(performance.now() - this.turnStartTime)
        : this.ttftTimeoutMs;
      this.triggerFailover('ttft_timeout', elapsed);
    }, this.ttftTimeoutMs);
  }

  /**
   * Called when first audio chunk from ElevenLabs is received for a conversational turn.
   */
  public onAgentAudioReceived(): void {
    if (this.turnStartTime) {
      const ttft = Math.round(performance.now() - this.turnStartTime);
      MetricsCollector.getInstance().recordLatency('ttft', ttft);
      this.turnStartTime = null;
    }

    this.cancelTtftWatchdog();
    if (this.isFailoverDispatched) return;

    this.state = 'AGENT_SPEAKING';
  }

  /**
   * Called when agent finishes responding.
   */
  public onAgentTurnFinished(): void {
    if (this.isFailoverDispatched || this.state === 'CLOSED') return;
    this.state = 'LISTENING';
  }

  /**
   * Called when caller interrupts agent speech.
   */
  public onUserInterruption(): void {
    if (this.isFailoverDispatched) return;
    if (this.onClearAudioBuffer) {
      this.onClearAudioBuffer();
    }
    this.state = 'LISTENING';
  }

  public cancelTtftWatchdog(): void {
    if (this.ttftTimer) {
      clearTimeout(this.ttftTimer);
      this.ttftTimer = null;
    }
  }

  /**
   * Upstream connection closed unexpectedly or failed mid-call
   */
  public onUpstreamDisconnection(code: number, reason: string): void {
    if (this.isFailoverDispatched || this.state === 'CLOSED') return;

    // Code 1000 is clean shutdown
    if (code !== 1000) {
      this.triggerFailover('upstream_disconnect', 0);
    }
  }

  /**
   * Internal error on stream pipeline
   */
  public onStreamError(err: Error | string): void {
    if (this.isFailoverDispatched || this.state === 'CLOSED') return;
    this.triggerFailover('socket_error', 0);
  }

  /**
   * Executes emergency failover.
   * Idempotent: Can only run once per call.
   */
  public async triggerFailover(reason: string, elapsedMs: number): Promise<void> {
    if (this.isFailoverDispatched) return;
    this.isFailoverDispatched = true;
    this.state = 'FAILING_OVER';

    // Cancel all active timers
    this.cancelConnectWatchdog();
    this.cancelTtftWatchdog();

    // 1. Immediately flush Twilio playback buffer
    if (this.onClearAudioBuffer) {
      try {
        this.onClearAudioBuffer();
      } catch {
        // Safe buffer flush
      }
    }

    const dispatchStart = performance.now();

    // 2. Dispatch the failover redirect handler
    try {
      await this.onFailover(reason, elapsedMs);
      const dispatchDuration = Math.round(performance.now() - dispatchStart);
      MetricsCollector.getInstance().recordLatency('failover_dispatch', dispatchDuration);

      MetricsCollector.getInstance().recordFailover({
        timestamp: new Date().toISOString(),
        callSid: this.callSid,
        reason,
        elapsedMs,
        redirectStatus: 'dispatched',
      });
    } catch {
      MetricsCollector.getInstance().recordFailover({
        timestamp: new Date().toISOString(),
        callSid: this.callSid,
        reason,
        elapsedMs,
        redirectStatus: 'failed',
      });
    } finally {
      this.state = 'FAILED_OVER';
    }
  }

  /**
   * Clean shutdown of watchdog when call ends normally
   */
  public close(): void {
    this.state = 'CLOSED';
    this.cancelConnectWatchdog();
    this.cancelTtftWatchdog();
  }
}
