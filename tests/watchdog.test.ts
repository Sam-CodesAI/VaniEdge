import { describe, it, expect, vi } from "vitest";
import { TelephonyWatchdog } from "../src/telephony/watchdog.js";

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
});
