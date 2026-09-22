/**
 * VaniEdge AI: Sub-Second Telephony Watchdog Failover Engine
 * Enforces strict 1,200ms connection and 1,500ms TTFT deadlines.
 */

export interface WatchdogConfig {
  connectionTimeoutMs: number;
  ttftTimeoutMs: number;
  fallbackUrl: string;
}

export type FailoverState =
  | "PENDING"
  | "HEALTHY"
  | "LISTENING"
  | "SPEAKING"
  | "FAILED_OVER"
  | "TERMINATED";

export class TelephonyWatchdog {
  private state: FailoverState = "PENDING";
  private connectionTimer: NodeJS.Timeout | null = null;
  private ttftTimer: NodeJS.Timeout | null = null;
  private startTime: number = Date.now();
  private turnStartTime: number | null = null;
  private callSid: string;
  private onFailoverCallback: (reason: string, elapsedMs: number) => Promise<void> | void;
  private config: WatchdogConfig;
  private isFailoverDispatched: boolean = false;

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
    if (this.isFailoverDispatched || this.state === "TERMINATED") return;
    this.startTime = Date.now();
    this.clearTimers();

    this.connectionTimer = setTimeout(async () => {
      await this.triggerFailover("UPSTREAM_WS_CONNECTION_TIMEOUT");
    }, this.config.connectionTimeoutMs);
  }

  public markConnected(): void {
    if (this.connectionTimer) {
      clearTimeout(this.connectionTimer);
      this.connectionTimer = null;
    }
    if (this.state === "PENDING" && !this.isFailoverDispatched) {
      this.armTtftWatchdog();
    }
  }

  private armTtftWatchdog(): void {
    const elapsedSinceStart = Date.now() - this.startTime;
    const remainingTime = Math.max(100, this.config.ttftTimeoutMs - elapsedSinceStart);

    this.ttftTimer = setTimeout(async () => {
      await this.triggerFailover("TTFT_DEADLINE_EXCEEDED");
    }, remainingTime);
  }

  public markFirstAudioReceived(): void {
    if (this.ttftTimer) {
      clearTimeout(this.ttftTimer);
      this.ttftTimer = null;
    }
    if (!this.isFailoverDispatched && this.state !== "TERMINATED") {
      this.state = "HEALTHY";
    }
  }

  /**
   * Called during conversational turn when user stops speaking.
   * Arms a fresh TTFT deadline for the upcoming agent response.
   */
  public onUserTurnCompleted(): void {
    if (this.isFailoverDispatched || this.state === "TERMINATED") return;
    this.state = "LISTENING";
    this.turnStartTime = Date.now();

    if (this.ttftTimer) {
      clearTimeout(this.ttftTimer);
    }

    this.ttftTimer = setTimeout(async () => {
      await this.triggerFailover("TURN_TTFT_DEADLINE_EXCEEDED");
    }, this.config.ttftTimeoutMs);
  }

  /**
   * Called when first audio chunk of a conversational turn arrives.
   */
  public onAgentSpeechStarted(): void {
    if (this.ttftTimer) {
      clearTimeout(this.ttftTimer);
      this.ttftTimer = null;
    }
    if (!this.isFailoverDispatched && this.state !== "TERMINATED") {
      this.state = "SPEAKING";
    }
  }

  /**
   * Trigger failover idempotently.
   */
  public async triggerFailover(reason: string): Promise<void> {
    if (this.isFailoverDispatched || this.state === "TERMINATED") return;
    this.isFailoverDispatched = true;
    this.state = "FAILED_OVER";
    this.clearTimers();

    const elapsed = Date.now() - this.startTime;
    await this.onFailoverCallback(reason, elapsed);
  }

  public getState(): FailoverState {
    return this.state;
  }

  public getCallSid(): string {
    return this.callSid;
  }

  public isFailedOver(): boolean {
    return this.isFailoverDispatched;
  }

  private clearTimers(): void {
    if (this.connectionTimer) {
      clearTimeout(this.connectionTimer);
      this.connectionTimer = null;
    }
    if (this.ttftTimer) {
      clearTimeout(this.ttftTimer);
      this.ttftTimer = null;
    }
  }

  public terminate(): void {
    this.clearTimers();
    this.state = "TERMINATED";
  }
}

/**
 * Twilio REST Call Redirection Client for mid-flight failover transfers
 */
export interface TwilioConfig {
  accountSid: string;
  authToken: string;
  fetchFn?: typeof fetch;
  timeoutMs?: number;
}

export interface RedirectResult {
  success: boolean;
  callSid: string;
  status?: string;
  error?: string;
  retries?: number;
}

export class TwilioCallRedirector {
  private accountSid: string;
  private authHeader: string;
  private fetchFn: typeof fetch;
  private timeoutMs: number;

  constructor(config: TwilioConfig) {
    this.accountSid = config.accountSid || "";
    this.fetchFn = config.fetchFn || fetch;
    this.timeoutMs = config.timeoutMs || 3000;
    const credentials = `${config.accountSid || ""}:${config.authToken || ""}`;
    this.authHeader = `Basic ${Buffer.from(credentials).toString("base64")}`;
  }

  async redirectCall(callSid: string, redirectUrl: string): Promise<RedirectResult> {
    if (!this.accountSid) {
      return { success: false, callSid, error: "Twilio credentials not configured" };
    }

    const endpoint = `https://api.twilio.com/2010-04-01/Accounts/${this.accountSid}/Calls/${callSid}.json`;
    const body = new URLSearchParams({
      Url: redirectUrl,
      Method: "POST",
    });

    let lastError = "";
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), this.timeoutMs);

        const response = await this.fetchFn(endpoint, {
          method: "POST",
          headers: {
            Authorization: this.authHeader,
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: body.toString(),
          signal: controller.signal,
        });
        clearTimeout(timer);

        if (!response.ok) {
          const text = await response.text();
          lastError = `Twilio API HTTP ${response.status}: ${text}`;
          if (response.status >= 500 && attempt === 0) {
            await new Promise((r) => setTimeout(r, 100));
            continue;
          }
          return { success: false, callSid, error: lastError, retries: attempt };
        }

        const data = (await response.json()) as { status?: string };
        return { success: true, callSid, status: data.status, retries: attempt };
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        lastError = `Network error redirecting call: ${message}`;
        if (attempt === 0) {
          await new Promise((r) => setTimeout(r, 100));
          continue;
        }
      }
    }
    return { success: false, callSid, error: lastError, retries: 1 };
  }
}

/**
 * Escapes XML characters for safe TwiML output
 */
export function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export function generateStreamTwiML(
  streamWsUrl: string,
  options: {
    greeting?: string;
    voice?: string;
    callSid?: string;
    caller?: string;
  } = {}
): string {
  const greeting = options.greeting || "Connecting to VaniEdge voice assistant.";
  const voice = options.voice || "Polly.Aditi";
  let params = "";
  if (options.callSid) params += `\n      <Parameter name="callSid" value="${escapeXml(options.callSid)}" />`;
  if (options.caller) params += `\n      <Parameter name="caller" value="${escapeXml(options.caller)}" />`;

  return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="${escapeXml(voice)}">${escapeXml(greeting)}</Say>
  <Connect>
    <Stream url="${escapeXml(streamWsUrl)}">${params}
    </Stream>
  </Connect>
</Response>`;
}

export function generateFallbackTwiML(
  fallbackNumber: string,
  options: {
    noticeMessage?: string;
    voice?: string;
    callerId?: string;
    timeoutSeconds?: number;
  } = {}
): string {
  const notice = options.noticeMessage || "Please hold. Connecting you to our backup support team.";
  const voice = options.voice || "Polly.Aditi";
  const timeout = options.timeoutSeconds ?? 25;
  const callerIdAttr = options.callerId ? ` callerId="${escapeXml(options.callerId)}"` : "";

  return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="${escapeXml(voice)}">${escapeXml(notice)}</Say>
  <Dial timeout="${timeout}"${callerIdAttr}>${escapeXml(fallbackNumber)}</Dial>
  <Say voice="${escapeXml(voice)}">All agents are currently busy. Please try calling back shortly.</Say>
  <Hangup />
</Response>`;
}
