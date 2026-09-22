/**
 * Twilio REST API Client for Live Call Control & Mid-Call Failover Redirection
 *
 * Used by the Watchdog Failover Engine to dynamically reroute active live calls
 * without dropping the line or requiring the user to hang up and call back.
 */

export interface TwilioClientConfig {
  accountSid: string;
  authToken: string;
  apiKeySid?: string;
  apiSecret?: string;
  fetchFn?: typeof fetch;
  timeoutMs?: number;
}

export interface RedirectCallResult {
  success: boolean;
  callSid: string;
  status?: string;
  error?: string;
  retries?: number;
}

export class TwilioClient {
  private accountSid: string;
  private authHeader: string;
  private fetchFn: typeof fetch;
  private timeoutMs: number;
  private isConfigured: boolean;

  constructor(config: TwilioClientConfig) {
    this.accountSid = config.accountSid || '';
    this.fetchFn = config.fetchFn || fetch;
    this.timeoutMs = config.timeoutMs ?? 3000;

    // Support either AccountSid:AuthToken or ApiKeySid:ApiSecret
    let username = config.accountSid || '';
    let secret = config.authToken || '';

    if (config.apiKeySid && config.apiSecret) {
      username = config.apiKeySid;
      secret = config.apiSecret;
    }

    this.isConfigured = Boolean(username && secret);
    const credentials = `${username}:${secret}`;
    this.authHeader = `Basic ${btoa(credentials)}`;
  }

  /**
   * Dynamically interrupts an active live call and redirects it to a new TwiML URL.
   * This is the cornerstone of zero-dropped-call failovers.
   * Includes 1x retry on transient network errors or 5xx responses.
   *
   * @param callSid Active Twilio Call SID
   * @param redirectUrl URL serving emergency fallback TwiML
   * @returns RedirectCallResult
   */
  async redirectCall(callSid: string, redirectUrl: string): Promise<RedirectCallResult> {
    if (!this.isConfigured) {
      return {
        success: false,
        callSid,
        error: 'Twilio credentials not configured',
      };
    }

    const endpoint = `https://api.twilio.com/2010-04-01/Accounts/${this.accountSid}/Calls/${callSid}.json`;

    const body = new URLSearchParams({
      Url: redirectUrl,
      Method: 'POST',
    });

    let lastError = '';
    const maxAttempts = 2; // Initial attempt + 1 retry

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutTimer = setTimeout(() => controller.abort(), this.timeoutMs);

        const response = await this.fetchFn(endpoint, {
          method: 'POST',
          headers: {
            Authorization: this.authHeader,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: body.toString(),
          signal: controller.signal,
        });

        clearTimeout(timeoutTimer);

        if (!response.ok) {
          const errorText = await response.text();
          lastError = `Twilio API HTTP ${response.status}: ${errorText}`;
          // Retry on 5xx server errors
          if (response.status >= 500 && attempt < maxAttempts - 1) {
            await new Promise((resolve) => setTimeout(resolve, 100));
            continue;
          }
          return {
            success: false,
            callSid,
            error: lastError,
            retries: attempt,
          };
        }

        const data = (await response.json()) as { status?: string };
        return {
          success: true,
          callSid,
          status: data.status,
          retries: attempt,
        };
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        lastError = `Network error redirecting call: ${message}`;
        if (attempt < maxAttempts - 1) {
          await new Promise((resolve) => setTimeout(resolve, 100));
          continue;
        }
      }
    }

    return {
      success: false,
      callSid,
      error: lastError,
      retries: maxAttempts - 1,
    };
  }

  /**
   * Fetches the current live status of a Twilio call
   */
  async getCallStatus(callSid: string): Promise<{ status: string; duration?: string } | null> {
    const endpoint = `https://api.twilio.com/2010-04-01/Accounts/${this.accountSid}/Calls/${callSid}.json`;

    try {
      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          Authorization: this.authHeader,
        },
      });

      if (!response.ok) return null;
      const data = (await response.json()) as { status: string; duration?: string };
      return {
        status: data.status,
        duration: data.duration,
      };
    } catch {
      return null;
    }
  }
}
