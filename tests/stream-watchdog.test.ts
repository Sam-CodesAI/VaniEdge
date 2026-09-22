import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { WatchdogEngine } from '../src/stream/watchdog';

describe('Watchdog Failover Engine', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should trigger failover if upstream connection exceeds connectTimeoutMs', async () => {
    const onFailoverMock = vi.fn().mockResolvedValue(undefined);
    const onClearBufferMock = vi.fn();

    const watchdog = new WatchdogEngine({
      callSid: 'CA_TEST_CALL_1',
      streamSid: 'MZ_TEST_STREAM_1',
      connectTimeoutMs: 1200,
      ttftTimeoutMs: 1500,
      onFailover: onFailoverMock,
      onClearAudioBuffer: onClearBufferMock,
    });

    watchdog.armConnectWatchdog();
    expect(watchdog.getState()).toBe('INITIALIZING');
    expect(onFailoverMock).not.toHaveBeenCalled();

    // Fast-forward past connect deadline
    vi.advanceTimersByTime(1250);

    expect(onClearBufferMock).toHaveBeenCalledTimes(1);
    expect(onFailoverMock).toHaveBeenCalledTimes(1);
    expect(onFailoverMock).toHaveBeenCalledWith('connect_timeout', expect.any(Number));
    expect(watchdog.isFailedOver()).toBe(true);
  });

  it('should cancel connect watchdog if upstream connects in time', async () => {
    const onFailoverMock = vi.fn().mockResolvedValue(undefined);

    const watchdog = new WatchdogEngine({
      callSid: 'CA_TEST_CALL_2',
      streamSid: 'MZ_TEST_STREAM_2',
      connectTimeoutMs: 1200,
      ttftTimeoutMs: 1500,
      onFailover: onFailoverMock,
    });

    watchdog.armConnectWatchdog();

    // Upstream connects at 85ms
    vi.advanceTimersByTime(85);
    watchdog.onUpstreamConnected(85);
    expect(watchdog.getState()).toBe('STREAM_READY');

    // Advance past original timeout
    vi.advanceTimersByTime(1500);
    expect(onFailoverMock).not.toHaveBeenCalled();
    expect(watchdog.isFailedOver()).toBe(false);
  });

  it('should trigger failover if conversational response exceeds TTFT deadline', async () => {
    const onFailoverMock = vi.fn().mockResolvedValue(undefined);

    const watchdog = new WatchdogEngine({
      callSid: 'CA_TEST_CALL_3',
      streamSid: 'MZ_TEST_STREAM_3',
      connectTimeoutMs: 1200,
      ttftTimeoutMs: 1500,
      onFailover: onFailoverMock,
    });

    watchdog.onUpstreamConnected(50);

    // User stops speaking (turn completed)
    watchdog.onUserTurnCompleted();
    expect(watchdog.getState()).toBe('AWAITING_AGENT_RESPONSE');

    // Advance past TTFT deadline without agent audio
    vi.advanceTimersByTime(1600);

    expect(onFailoverMock).toHaveBeenCalledTimes(1);
    expect(onFailoverMock).toHaveBeenCalledWith('ttft_timeout', expect.any(Number));
    expect(watchdog.isFailedOver()).toBe(true);
  });

  it('should cancel TTFT watchdog when agent sends first audio chunk', async () => {
    const onFailoverMock = vi.fn().mockResolvedValue(undefined);

    const watchdog = new WatchdogEngine({
      callSid: 'CA_TEST_CALL_4',
      streamSid: 'MZ_TEST_STREAM_4',
      connectTimeoutMs: 1200,
      ttftTimeoutMs: 1500,
      onFailover: onFailoverMock,
    });

    watchdog.onUpstreamConnected(50);
    watchdog.onUserTurnCompleted();

    // Agent starts speaking at 340ms (well before 1500ms deadline)
    vi.advanceTimersByTime(340);
    watchdog.onAgentAudioReceived();
    expect(watchdog.getState()).toBe('AGENT_SPEAKING');

    // Advance past the deadline
    vi.advanceTimersByTime(2000);
    expect(onFailoverMock).not.toHaveBeenCalled();
  });

  it('should flush audio buffer on caller barge-in / interruption', () => {
    const onClearBufferMock = vi.fn();

    const watchdog = new WatchdogEngine({
      callSid: 'CA_TEST_CALL_5',
      streamSid: 'MZ_TEST_STREAM_5',
      onFailover: vi.fn(),
      onClearAudioBuffer: onClearBufferMock,
    });

    watchdog.onUpstreamConnected(50);
    watchdog.onAgentAudioReceived();

    // User interrupts
    watchdog.onUserInterruption();
    expect(onClearBufferMock).toHaveBeenCalledTimes(1);
    expect(watchdog.getState()).toBe('LISTENING');
  });

  it('should trigger failover immediately on unexpected socket disconnection', () => {
    const onFailoverMock = vi.fn().mockResolvedValue(undefined);

    const watchdog = new WatchdogEngine({
      callSid: 'CA_TEST_CALL_6',
      streamSid: 'MZ_TEST_STREAM_6',
      onFailover: onFailoverMock,
    });

    watchdog.onUpstreamConnected(50);

    // Socket disconnects with abnormal close code (1006)
    watchdog.onUpstreamDisconnection(1006, 'Abnormal network closure');

    expect(onFailoverMock).toHaveBeenCalledTimes(1);
    expect(onFailoverMock).toHaveBeenCalledWith('upstream_disconnect', 0);
  });

  it('should guarantee failover idempotency: only executes once even with multiple failure events', async () => {
    const onFailoverMock = vi.fn().mockResolvedValue(undefined);

    const watchdog = new WatchdogEngine({
      callSid: 'CA_TEST_CALL_7',
      streamSid: 'MZ_TEST_STREAM_7',
      onFailover: onFailoverMock,
    });

    // Fire two failure events simultaneously
    await watchdog.triggerFailover('connect_timeout', 1200);
    await watchdog.triggerFailover('upstream_disconnect', 1300);

    expect(onFailoverMock).toHaveBeenCalledTimes(1);
  });
});
