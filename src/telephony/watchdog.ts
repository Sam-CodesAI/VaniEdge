/**
 * VaniEdge AI: Sub-Second Telephony Watchdog Failover Engine
 * Enforces strict 1,200ms connection and 1,500ms TTFT deadlines.
 */

export interface WatchdogConfig {
  connectionTimeoutMs: number;
  ttftTimeoutMs: number;
  fallbackUrl: string;
}

export type FailoverState = "PENDING" | "HEALTHY" | "FAILED_OVER" | "TERMINATED";

export class TelephonyWatchdog {
  private state: FailoverState = "PENDING";
  private connectionTimer: NodeJS.Timeout | null = null;
  private ttftTimer: NodeJS.Timeout | null = null;
  private startTime: number = Date.now();
  private callSid: string;
  private onFailoverCallback: (reason: string, elapsedMs: number) => Promise<void> | void;
  private config: WatchdogConfig;

  constructor(
    callSid: string,
    onFailover: (reason: string, elapsedMs: number) => Promise<void> | void,
    config: Partial<WatchdogConfig> = {}
  ) {
    this.callSid = callSid;
    this.onFailoverCallback = onFailover;
    this.config = {
      connectionTimeoutMs: config.connectionTimeoutMs || 1200,
      ttftTimeoutMs: config.ttftTimeoutMs || 1500,
      fallbackUrl: config.fallbackUrl || "/voice/fallback",
    };
  }

  public armConnectionWatchdog(): void {
    if (this.state !== "PENDING") return;
    this.startTime = Date.now();

    this.connectionTimer = setTimeout(async () => {
      if (this.state === "PENDING") {
        this.state = "FAILED_OVER";
        const elapsed = Date.now() - this.startTime;
        await this.onFailoverCallback("UPSTREAM_WS_CONNECTION_TIMEOUT", elapsed);
      }
    }, this.config.connectionTimeoutMs);
  }

  public markConnected(): void {
    if (this.connectionTimer) {
      clearTimeout(this.connectionTimer);
      this.connectionTimer = null;
    }
    if (this.state === "PENDING") {
      this.armTtftWatchdog();
    }
  }

  private armTtftWatchdog(): void {
    const elapsedSinceStart = Date.now() - this.startTime;
    const remainingTime = Math.max(100, this.config.ttftTimeoutMs - elapsedSinceStart);

    this.ttftTimer = setTimeout(async () => {
      if (this.state === "PENDING") {
        this.state = "FAILED_OVER";
        const elapsed = Date.now() - this.startTime;
        await this.onFailoverCallback("TTFT_DEADLINE_EXCEEDED", elapsed);
      }
    }, remainingTime);
  }

  public markFirstAudioReceived(): void {
    if (this.ttftTimer) {
      clearTimeout(this.ttftTimer);
      this.ttftTimer = null;
    }
    if (this.state === "PENDING") {
      this.state = "HEALTHY";
    }
  }

  public getState(): FailoverState {
    return this.state;
  }

  public getCallSid(): string {
    return this.callSid;
  }

  public terminate(): void {
    if (this.connectionTimer) clearTimeout(this.connectionTimer);
    if (this.ttftTimer) clearTimeout(this.ttftTimer);
    this.state = "TERMINATED";
  }
}
