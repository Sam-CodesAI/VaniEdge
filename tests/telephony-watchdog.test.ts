import { describe, it, expect, vi } from "vitest";
import {
  TelephonyWatchdog,
  TwilioCallRedirector,
  escapeXml,
  generateStreamTwiML,
  generateFallbackTwiML,
} from "../src/telephony/watchdog.js";

describe("Telephony Watchdog Sub-Second Failover", () => {
  it("triggers failover if connection deadline is breached", async () => {
    vi.useFakeTimers();
    const failoverSpy = vi.fn();

    const watchdog = new TelephonyWatchdog("CA_TEST_123", failoverSpy, {
      connectionTimeoutMs: 1200,
    });

    watchdog.armConnectionWatchdog();
    expect(watchdog.getState()).toBe("PENDING");

    // Fast-forward 1,201ms
    vi.advanceTimersByTime(1250);

    expect(watchdog.getState()).toBe("FAILED_OVER");
    expect(failoverSpy).toHaveBeenCalledWith("UPSTREAM_WS_CONNECTION_TIMEOUT", expect.any(Number));
    vi.useRealTimers();
  });

  it("transitions to healthy if connection and first audio packet arrive in time", async () => {
    vi.useFakeTimers();
    const failoverSpy = vi.fn();

    const watchdog = new TelephonyWatchdog("CA_TEST_456", failoverSpy, {
      connectionTimeoutMs: 1200,
      ttftTimeoutMs: 1500,
    });

    watchdog.armConnectionWatchdog();
    vi.advanceTimersByTime(100);
    watchdog.markConnected();

    vi.advanceTimersByTime(250);
    watchdog.markFirstAudioReceived();

    expect(watchdog.getState()).toBe("HEALTHY");
    expect(failoverSpy).not.toHaveBeenCalled();
    vi.useRealTimers();
  });

  it("triggers failover if TTFT deadline is breached after connection succeeds", async () => {
    vi.useFakeTimers();
    const failoverSpy = vi.fn();

    const watchdog = new TelephonyWatchdog("CA_TEST_789", failoverSpy, {
      connectionTimeoutMs: 1200,
      ttftTimeoutMs: 1500,
    });

    watchdog.armConnectionWatchdog();
    vi.advanceTimersByTime(200);
    watchdog.markConnected();
    expect(watchdog.getState()).toBe("PENDING");

    // Advance beyond 1500ms total
    vi.advanceTimersByTime(1400);

    expect(watchdog.getState()).toBe("FAILED_OVER");
    expect(failoverSpy).toHaveBeenCalledWith("TTFT_DEADLINE_EXCEEDED", expect.any(Number));
    vi.useRealTimers();
  });

  it("cleans up timers and transitions to TERMINATED upon terminate() call", () => {
    vi.useFakeTimers();
    const failoverSpy = vi.fn();

    const watchdog = new TelephonyWatchdog("CA_TEST_CLEANUP", failoverSpy);
    watchdog.armConnectionWatchdog();
    watchdog.terminate();

    expect(watchdog.getState()).toBe("TERMINATED");
    vi.advanceTimersByTime(2000);
    expect(failoverSpy).not.toHaveBeenCalled();
    vi.useRealTimers();
  });

  it("monitors conversational turns and triggers failover if agent speech TTFT breaches", async () => {
    vi.useFakeTimers();
    const failoverSpy = vi.fn();

    const watchdog = new TelephonyWatchdog("CA_TEST_TURN_TIMEOUT", failoverSpy, {
      ttftTimeoutMs: 1500,
    });

    watchdog.armConnectionWatchdog();
    watchdog.markConnected();
    watchdog.markFirstAudioReceived();
    expect(watchdog.getState()).toBe("HEALTHY");

    // User finishes speaking
    watchdog.onUserTurnCompleted();
    expect(watchdog.getState()).toBe("LISTENING");

    // Advance 1550ms without agent speech
    vi.advanceTimersByTime(1550);

    expect(watchdog.getState()).toBe("FAILED_OVER");
    expect(failoverSpy).toHaveBeenCalledWith("TURN_TTFT_DEADLINE_EXCEEDED", expect.any(Number));
    vi.useRealTimers();
  });

  it("clears turn watchdog when agent speech starts within deadline", async () => {
    vi.useFakeTimers();
    const failoverSpy = vi.fn();

    const watchdog = new TelephonyWatchdog("CA_TEST_TURN_SUCCESS", failoverSpy, {
      ttftTimeoutMs: 1500,
    });

    watchdog.armConnectionWatchdog();
    watchdog.markConnected();
    watchdog.markFirstAudioReceived();

    // Turn 1
    watchdog.onUserTurnCompleted();
    expect(watchdog.getState()).toBe("LISTENING");
    vi.advanceTimersByTime(400); // 400ms TTFT
    watchdog.onAgentSpeechStarted();
    expect(watchdog.getState()).toBe("SPEAKING");

    // Fast forward well past deadline
    vi.advanceTimersByTime(2000);
    expect(watchdog.getState()).toBe("SPEAKING");
    expect(failoverSpy).not.toHaveBeenCalled();
    vi.useRealTimers();
  });

  it("enforces idempotent failover trigger preventing multiple invocations", async () => {
    const failoverSpy = vi.fn();
    const watchdog = new TelephonyWatchdog("CA_TEST_IDEMPOTENT", failoverSpy);

    await watchdog.triggerFailover("FIRST_REASON");
    await watchdog.triggerFailover("SECOND_REASON");

    expect(failoverSpy).toHaveBeenCalledTimes(1);
    expect(failoverSpy).toHaveBeenCalledWith("FIRST_REASON", expect.any(Number));
    expect(watchdog.isFailedOver()).toBe(true);
    expect(watchdog.getCallSid()).toBe("CA_TEST_IDEMPOTENT");
  });
});

describe("Twilio Call Redirector Client", () => {
  it("rejects redirection when Twilio credentials are missing", async () => {
    const redirector = new TwilioCallRedirector({
      accountSid: "",
      authToken: "",
    });

    const result = await redirector.redirectCall("CA12345", "https://example.com/voice/fallback");
    expect(result.success).toBe(false);
    expect(result.error).toContain("Twilio credentials not configured");
  });

  it("successfully calls Twilio Calls API with basic auth and urlencoded body", async () => {
    let capturedUrl = "";
    let capturedHeaders: Record<string, string> = {};
    let capturedBody = "";

    const mockFetch = vi.fn(async (url: string | URL | Request, init?: RequestInit) => {
      capturedUrl = url.toString();
      capturedHeaders = (init?.headers || {}) as Record<string, string>;
      capturedBody = (init?.body || "") as string;
      return new Response(JSON.stringify({ status: "in-progress", sid: "CA_MOCK_123" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    });

    const redirector = new TwilioCallRedirector({
      accountSid: "AC_TEST_ACCOUNT",
      authToken: "TEST_AUTH_TOKEN",
      fetchFn: mockFetch as unknown as typeof fetch,
    });

    const result = await redirector.redirectCall("CA_MOCK_123", "https://example.com/fallback");
    expect(result.success).toBe(true);
    expect(result.callSid).toBe("CA_MOCK_123");
    expect(result.status).toBe("in-progress");
    expect(capturedUrl).toBe(
      "https://api.twilio.com/2010-04-01/Accounts/AC_TEST_ACCOUNT/Calls/CA_MOCK_123.json"
    );
    expect(capturedHeaders["Authorization"]).toBe(
      `Basic ${Buffer.from("AC_TEST_ACCOUNT:TEST_AUTH_TOKEN").toString("base64")}`
    );
    expect(capturedBody).toContain("Url=https%3A%2F%2Fexample.com%2Ffallback");
    expect(capturedBody).toContain("Method=POST");
  });

  it("retries on upstream 500 failure and returns error on persistent failure", async () => {
    let callCount = 0;
    const mockFetch = vi.fn(async () => {
      callCount++;
      return new Response("Twilio Internal Server Error", {
        status: 500,
        statusText: "Internal Server Error",
      });
    });

    const redirector = new TwilioCallRedirector({
      accountSid: "AC_TEST_RETRY",
      authToken: "TOKEN",
      fetchFn: mockFetch as unknown as typeof fetch,
    });

    const result = await redirector.redirectCall("CA_ERR", "https://example.com/fallback");
    expect(result.success).toBe(false);
    expect(result.error).toContain("Twilio API HTTP 500");
    expect(callCount).toBe(2); // Initial attempt + 1 retry
  });
});

describe("TwiML Utilities", () => {
  it("escapes special XML characters correctly", () => {
    const raw = `Doc & "Marty" <Back to 'Future'>`;
    const escaped = escapeXml(raw);
    expect(escaped).toBe("Doc &amp; &quot;Marty&quot; &lt;Back to &apos;Future&apos;&gt;");
  });

  it("generates valid stream TwiML with caller and callSid parameters", () => {
    const twiml = generateStreamTwiML("wss://voice.example.com/ws", {
      greeting: "Hello from test",
      voice: "Polly.Aditi",
      callSid: "CA_999",
      caller: "+919876543210",
    });

    expect(twiml).toContain('<Response>');
    expect(twiml).toContain('<Say voice="Polly.Aditi">Hello from test</Say>');
    expect(twiml).toContain('<Connect>');
    expect(twiml).toContain('<Stream url="wss://voice.example.com/ws">');
    expect(twiml).toContain('<Parameter name="callSid" value="CA_999" />');
    expect(twiml).toContain('<Parameter name="caller" value="+919876543210" />');
    expect(twiml).toContain('</Stream>');
  });

  it("generates valid fallback TwiML with dial and backup notice", () => {
    const twiml = generateFallbackTwiML("+18005550199", {
      noticeMessage: "Transferring call now.",
      callerId: "+18149613703",
      timeoutSeconds: 20,
    });

    expect(twiml).toContain('<Response>');
    expect(twiml).toContain('<Say voice="Polly.Aditi">Transferring call now.</Say>');
    expect(twiml).toContain('<Dial timeout="20" callerId="+18149613703">+18005550199</Dial>');
    expect(twiml).toContain('<Hangup />');
  });
});
