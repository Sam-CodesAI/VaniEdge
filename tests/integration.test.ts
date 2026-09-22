import { describe, it, expect, vi } from 'vitest';
import worker from '../src/index';
import type { Env } from '../src/types/env';
import { computeTwilioSignature } from '../src/twilio/signature';

describe('Cloudflare Worker Telephony Endpoints Integration', () => {
  const env: Env = {
    TWILIO_ACCOUNT_SID: 'ACmockaccountsid1234567890abcdef12',
    TWILIO_AUTH_TOKEN: 'mock_auth_token_secret_abcdef1234567890',
    TWILIO_PHONE_NUMBER: '+18005550100',
    ELEVENLABS_API_KEY: 'test_key',
    ELEVENLABS_AGENT_ID: 'agent_test_123',
    FALLBACK_HUMAN_NUMBER: '+18005550199',
    FAILOVER_CONNECT_TIMEOUT_MS: '1200',
    FAILOVER_TTFT_TIMEOUT_MS: '1500',
  };

  const mockCtx = {
    waitUntil: vi.fn(),
    passThroughOnException: vi.fn(),
  } as unknown as ExecutionContext;

  it('GET / should return service discovery information', async () => {
    const req = new Request('https://edge.voice-agent.dev/', { method: 'GET' });
    const res = await worker.fetch(req, env, mockCtx);

    expect(res.status).toBe(200);
    const json = (await res.json()) as { service: string; endpoints: Record<string, string> };
    expect(json.service).toContain('Twilio Voice Agent Failover');
    expect(json.endpoints.incoming_webhook).toBe('POST /voice/incoming');
  });

  it('GET /health should return provider configuration and watchdog thresholds', async () => {
    const req = new Request('https://edge.voice-agent.dev/health', { method: 'GET' });
    const res = await worker.fetch(req, env, mockCtx);

    expect(res.status).toBe(200);
    const json = (await res.json()) as {
      status: string;
      providers: { twilio: { configured: boolean; account_sid: string } };
      watchdog: { connect_timeout_ms: number; fallback_target: string };
    };
    expect(json.status).toBe('healthy');
    expect(json.providers.twilio.configured).toBe(true);
    expect(json.providers.twilio.account_sid).toBe('ACmock...');
    expect(json.watchdog.connect_timeout_ms).toBe(1200);
    expect(json.watchdog.fallback_target).toBe('+18005550199');
  });

  it('GET /metrics should expose latency telemetry snapshot', async () => {
    const req = new Request('https://edge.voice-agent.dev/metrics', { method: 'GET' });
    const res = await worker.fetch(req, env, mockCtx);

    expect(res.status).toBe(200);
    const json = (await res.json()) as {
      benchmarks_by_stage: {
        stage_1_edge_webhook: { name: string };
        stage_4_ttft_first_audio_byte: { name: string };
      };
    };
    expect(json.benchmarks_by_stage.stage_1_edge_webhook).toBeDefined();
    expect(json.benchmarks_by_stage.stage_4_ttft_first_audio_byte).toBeDefined();
  });

  it('POST /voice/incoming with valid signature should return TwiML stream XML', async () => {
    const url = 'https://edge.voice-agent.dev/voice/incoming';
    const params: Record<string, string> = {
      CallSid: 'CA9876543210abcdef',
      From: '+15551234567',
      To: '+18005550100',
      CallStatus: 'ringing',
    };

    const signature = await computeTwilioSignature(url, params, env.TWILIO_AUTH_TOKEN);

    const formData = new FormData();
    for (const [key, val] of Object.entries(params)) {
      formData.append(key, val);
    }

    const req = new Request(url, {
      method: 'POST',
      headers: {
        'X-Twilio-Signature': signature,
      },
      body: formData,
    });

    const res = await worker.fetch(req, env, mockCtx);
    expect(res.status).toBe(200);
    expect(res.headers.get('Content-Type')).toBe('text/xml');

    const xml = await res.text();
    expect(xml).toContain('<Response>');
    expect(xml).toContain('<Connect>');
    expect(xml).toContain('<Stream url="wss://edge.voice-agent.dev/voice/stream">');
    expect(xml).toContain('<Parameter name="callSid" value="CA9876543210abcdef" />');
  });

  it('POST /voice/incoming with forged signature should return 401 Unauthorized', async () => {
    const url = 'https://edge.voice-agent.dev/voice/incoming';
    const formData = new FormData();
    formData.append('CallSid', 'CA_FORGED');
    formData.append('From', '+19990001111');

    const req = new Request(url, {
      method: 'POST',
      headers: {
        'X-Twilio-Signature': 'forged_invalid_signature_header_value',
      },
      body: formData,
    });

    const res = await worker.fetch(req, env, mockCtx);
    expect(res.status).toBe(401);
  });

  it('POST /voice/fallback should return emergency human routing TwiML', async () => {
    const req = new Request('https://edge.voice-agent.dev/voice/fallback', { method: 'POST' });
    const res = await worker.fetch(req, env, mockCtx);

    expect(res.status).toBe(200);
    expect(res.headers.get('Content-Type')).toBe('text/xml');

    const xml = await res.text();
    expect(xml).toContain('<Say voice="Polly.Joanna">');
    expect(xml).toContain('<Dial timeout="25" callerId="+18005550100">+18005550199</Dial>');
  });

  it('POST /simulate/failover should execute failover simulation trace', async () => {
    const req = new Request('https://edge.voice-agent.dev/simulate/failover', { method: 'POST' });
    const res = await worker.fetch(req, env, mockCtx);

    expect(res.status).toBe(200);
    const json = (await res.json()) as {
      status: string;
      action: string;
      generated_twiml: string;
    };
    expect(json.status).toBe('simulation_complete');
    expect(json.action).toBe('call_redirected_to_fallback');
    expect(json.generated_twiml).toContain('<Dial');
  });

  it('GET /metrics?format=prometheus should expose Prometheus metrics exposition format', async () => {
    const req = new Request('https://edge.voice-agent.dev/metrics?format=prometheus', { method: 'GET' });
    const res = await worker.fetch(req, env, mockCtx);

    expect(res.status).toBe(200);
    expect(res.headers.get('Content-Type')).toContain('text/plain');
    const text = await res.text();
    expect(text).toContain('# TYPE twilio_calls_total counter');
    expect(text).toContain('twilio_calls_total');
    expect(text).toContain('twilio_streams_active');
    expect(text).toContain('twilio_failovers_total');
  });

  it('POST /voice/status should track completed calls and call duration', async () => {
    const url = 'https://edge.voice-agent.dev/voice/status';
    const params: Record<string, string> = {
      CallSid: 'CA_STATUS_TEST_1',
      CallStatus: 'completed',
      CallDuration: '42',
      From: '+15551234567',
      To: '+18005550100',
    };

    const signature = await computeTwilioSignature(url, params, env.TWILIO_AUTH_TOKEN);
    const formData = new FormData();
    for (const [k, v] of Object.entries(params)) {
      formData.append(k, v);
    }

    const req = new Request(url, {
      method: 'POST',
      headers: { 'X-Twilio-Signature': signature },
      body: formData,
    });

    const res = await worker.fetch(req, env, mockCtx);
    expect(res.status).toBe(200);
    expect(res.headers.get('Content-Type')).toBe('text/xml');
  });

  it('POST /voice/incoming should reject X-Bypass-Twilio-Auth in production without secret', async () => {
    const prodEnv: Env = {
      ...env,
      ENVIRONMENT: 'production',
      ALLOW_AUTH_BYPASS: undefined,
    };

    const url = 'https://edge.voice-agent.dev/voice/incoming';
    const formData = new FormData();
    formData.append('CallSid', 'CA_PROD_ATTACK');

    const req = new Request(url, {
      method: 'POST',
      headers: {
        'X-Twilio-Signature': 'invalid',
        'X-Bypass-Twilio-Auth': 'true',
      },
      body: formData,
    });

    const res = await worker.fetch(req, prodEnv, mockCtx);
    expect(res.status).toBe(401);
  });
});
