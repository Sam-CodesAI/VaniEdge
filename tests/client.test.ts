import { describe, it, expect, vi } from 'vitest';
import { TwilioClient } from '../src/twilio/client';

describe('TwilioClient Unit Tests', () => {
  it('should successfully redirect an active call', async () => {
    const mockFetch = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ status: 'in-progress' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    );

    const client = new TwilioClient({
      accountSid: 'AC_TEST_ACCOUNT_123',
      authToken: 'test_auth_token_456',
      fetchFn: mockFetch as any,
    });

    const result = await client.redirectCall('CA_CALL_1', 'https://worker.dev/voice/fallback');

    expect(result.success).toBe(true);
    expect(result.callSid).toBe('CA_CALL_1');
    expect(result.status).toBe('in-progress');
    expect(result.retries).toBe(0);
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it('should retry on transient 500 server error and succeed on second attempt', async () => {
    let callCount = 0;
    const mockFetch = vi.fn().mockImplementation(() => {
      callCount++;
      if (callCount === 1) {
        return Promise.resolve(new Response('Internal Server Error', { status: 500 }));
      }
      return Promise.resolve(
        new Response(JSON.stringify({ status: 'in-progress' }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      );
    });

    const client = new TwilioClient({
      accountSid: 'AC_TEST_ACCOUNT_123',
      authToken: 'test_auth_token_456',
      fetchFn: mockFetch as any,
    });

    const result = await client.redirectCall('CA_CALL_2', 'https://worker.dev/voice/fallback');

    expect(result.success).toBe(true);
    expect(result.retries).toBe(1);
    expect(mockFetch).toHaveBeenCalledTimes(2);
  });

  it('should return failure without infinite retries on persistent 404 client error', async () => {
    const mockFetch = vi.fn().mockResolvedValue(
      new Response('Call not found', { status: 404 })
    );

    const client = new TwilioClient({
      accountSid: 'AC_TEST_ACCOUNT_123',
      authToken: 'test_auth_token_456',
      fetchFn: mockFetch as any,
    });

    const result = await client.redirectCall('CA_CALL_NOT_FOUND', 'https://worker.dev/voice/fallback');

    expect(result.success).toBe(false);
    expect(result.error).toContain('Twilio API HTTP 404');
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it('should fail fast if credentials are not configured', async () => {
    const client = new TwilioClient({
      accountSid: '',
      authToken: '',
    });

    const result = await client.redirectCall('CA_CALL_UNCONFIGURED', 'https://worker.dev/voice/fallback');

    expect(result.success).toBe(false);
    expect(result.error).toContain('Twilio credentials not configured');
  });
});
