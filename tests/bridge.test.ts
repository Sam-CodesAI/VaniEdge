import { describe, it, expect, vi } from 'vitest';
import { StreamBridge } from '../src/stream/bridge';
import type { Env } from '../src/types/env';

// Lightweight WebSocket mock for unit testing protocol frame exchanges
class MockWebSocket {
  public readyState = 1; // WebSocket.OPEN
  public sentMessages: string[] = [];
  public closedWith: { code?: number; reason?: string } | null = null;
  private listeners: Record<string, ((event: any) => void)[]> = {};

  accept() {
    // Cloudflare Workers WebSocket method
  }

  addEventListener(event: string, callback: (event: any) => void) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
  }

  emit(event: string, data: any) {
    const handlers = this.listeners[event] || [];
    for (const h of handlers) {
      h(data);
    }
  }

  send(data: string) {
    this.sentMessages.push(data);
  }

  close(code?: number, reason?: string) {
    this.readyState = 3; // WebSocket.CLOSED
    this.closedWith = { code, reason };
    this.emit('close', { code: code || 1000, reason: reason || '' });
  }
}

describe('StreamBridge Protocol Pipeline', () => {
  const env: Env = {
    TWILIO_ACCOUNT_SID: 'ACmockaccountsid1234567890abcdef12',
    TWILIO_AUTH_TOKEN: 'mock_auth_token_secret_abcdef1234567890',
    TWILIO_PHONE_NUMBER: '+18005550100',
    ELEVENLABS_API_KEY: 'test_key',
    ELEVENLABS_AGENT_ID: 'test_agent',
    FALLBACK_HUMAN_NUMBER: '+18005550199',
    FAILOVER_CONNECT_TIMEOUT_MS: '1200',
    FAILOVER_TTFT_TIMEOUT_MS: '1500',
  };

  it('should process Twilio start, bridge media chunks, and handle interruption buffer clearing', async () => {
    const mockClientWs = new MockWebSocket() as unknown as WebSocket;
    const mockUpstreamWs = new MockWebSocket() as unknown as WebSocket;

    const bridge = new StreamBridge({
      clientWebSocket: mockClientWs,
      env,
      requestUrl: new URL('https://voice.example.dev/voice/stream'),
      mockUpstreamWs: mockUpstreamWs,
    });

    bridge.start();

    // 1. Upstream (ElevenLabs) opens
    (mockUpstreamWs as any).emit('open', {});

    // 2. Twilio sends 'start'
    (mockClientWs as any).emit('message', {
      data: JSON.stringify({
        event: 'start',
        sequenceNumber: '1',
        start: {
          streamSid: 'MZ_BRIDGE_TEST',
          accountSid: 'ACmockaccountsid1234567890abcdef12',
          callSid: 'CA_BRIDGE_TEST',
          tracks: ['inbound'],
          mediaFormat: { encoding: 'audio/x-mulaw', sampleRate: 8000, channels: 1 },
        },
        streamSid: 'MZ_BRIDGE_TEST',
      }),
    });

    // 3. Twilio sends user speech chunk
    (mockClientWs as any).emit('message', {
      data: JSON.stringify({
        event: 'media',
        sequenceNumber: '2',
        streamSid: 'MZ_BRIDGE_TEST',
        media: {
          track: 'inbound',
          chunk: '1',
          timestamp: '100',
          payload: '7e3v7e3v7e3v',
        },
      }),
    });

    // Verify upstream received user_audio_chunk
    const upstreamSent = (mockUpstreamWs as any).sentMessages;
    expect(upstreamSent.length).toBe(1);
    expect(JSON.parse(upstreamSent[0])).toEqual({ user_audio_chunk: '7e3v7e3v7e3v' });

    // 4. ElevenLabs sends synthesized voice chunk back
    (mockUpstreamWs as any).emit('message', {
      data: JSON.stringify({
        type: 'audio',
        audio_event: {
          audio_base_64: 'f39/f39/f39/',
          event_id: 1,
        },
      }),
    });

    // Verify Twilio received outbound media
    const clientSent = (mockClientWs as any).sentMessages;
    expect(clientSent.length).toBe(1);
    expect(JSON.parse(clientSent[0])).toEqual({
      event: 'media',
      streamSid: 'MZ_BRIDGE_TEST',
      media: {
        payload: 'f39/f39/f39/',
      },
    });

    // 5. ElevenLabs sends interruption event (caller barged in)
    (mockUpstreamWs as any).emit('message', {
      data: JSON.stringify({
        type: 'interruption',
        interruption_event: { event_id: 2 },
      }),
    });

    // Verify Twilio received 'clear' event to flush playback buffer immediately
    expect(clientSent.length).toBe(2);
    expect(JSON.parse(clientSent[1])).toEqual({
      event: 'clear',
      streamSid: 'MZ_BRIDGE_TEST',
    });

    bridge.close();
  });

  it('should forward customParameters as contextual_update when provided in start event', async () => {
    const mockClientWs = new MockWebSocket() as unknown as WebSocket;
    const mockUpstreamWs = new MockWebSocket() as unknown as WebSocket;

    const bridge = new StreamBridge({
      clientWebSocket: mockClientWs,
      env,
      requestUrl: new URL('https://voice.example.dev/voice/stream'),
      mockUpstreamWs: mockUpstreamWs,
    });

    bridge.start();

    // Upstream opens
    (mockUpstreamWs as any).emit('open', {});

    // Twilio sends start with customParameters
    (mockClientWs as any).emit('message', {
      data: JSON.stringify({
        event: 'start',
        sequenceNumber: '1',
        start: {
          streamSid: 'MZ_PARAMS_TEST',
          accountSid: 'AC_TEST_123',
          callSid: 'CA_PARAMS_TEST',
          tracks: ['inbound'],
          customParameters: {
            customerTier: 'vip_platinum',
            intent: 'billing_dispute',
          },
          mediaFormat: { encoding: 'audio/x-mulaw', sampleRate: 8000, channels: 1 },
        },
        streamSid: 'MZ_PARAMS_TEST',
      }),
    });

    const upstreamSent = (mockUpstreamWs as any).sentMessages;
    expect(upstreamSent.length).toBe(1);
    const parsed = JSON.parse(upstreamSent[0]);
    expect(parsed.contextual_update.dynamic_variables.customerTier).toBe('vip_platinum');
    expect(parsed.contextual_update.dynamic_variables.intent).toBe('billing_dispute');

    bridge.close();
  });

  it('should execute call redirection via TwilioClient on upstream disconnection', async () => {
    const mockClientWs = new MockWebSocket() as unknown as WebSocket;
    const mockUpstreamWs = new MockWebSocket() as unknown as WebSocket;
    const redirectCallMock = vi.fn().mockResolvedValue({ success: true, callSid: 'CA_FAILOVER_TEST' });

    const mockTwilioClient = {
      redirectCall: redirectCallMock,
      getCallStatus: vi.fn(),
    } as any;

    const bridge = new StreamBridge({
      clientWebSocket: mockClientWs,
      env,
      requestUrl: new URL('https://voice.example.dev/voice/stream'),
      mockUpstreamWs: mockUpstreamWs,
      twilioClient: mockTwilioClient,
    });

    bridge.start();

    // Upstream opens
    (mockUpstreamWs as any).emit('open', {});

    // Twilio starts call
    (mockClientWs as any).emit('message', {
      data: JSON.stringify({
        event: 'start',
        sequenceNumber: '1',
        start: {
          streamSid: 'MZ_FAILOVER_STREAM',
          accountSid: 'AC_TEST_123',
          callSid: 'CA_FAILOVER_TEST',
          tracks: ['inbound'],
          mediaFormat: { encoding: 'audio/x-mulaw', sampleRate: 8000, channels: 1 },
        },
        streamSid: 'MZ_FAILOVER_STREAM',
      }),
    });

    // Simulate upstream abnormal closure (e.g. error code 1006)
    (mockUpstreamWs as any).emit('close', { code: 1006, reason: 'Abnormal Closure' });

    // Wait microtask tick for async failover dispatch
    await new Promise((r) => setTimeout(r, 20));

    expect(redirectCallMock).toHaveBeenCalledWith('CA_FAILOVER_TEST', expect.stringContaining('/voice/fallback'));
    bridge.close();
  });
});
