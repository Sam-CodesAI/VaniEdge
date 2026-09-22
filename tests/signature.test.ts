import { describe, it, expect } from 'vitest';
import { computeTwilioSignature, validateTwilioSignature } from '../src/twilio/signature';

describe('Twilio Webhook HMAC-SHA1 Signature Verification', () => {
  const testAuthToken = 'mock_auth_token_secret_abcdef1234567890';
  const testUrl = 'https://voice-agent.example.workers.dev/voice/incoming';
  const testParams = {
    CallSid: 'CA1234567890abcdef1234567890abcdef',
    From: '+15551234567',
    To: '+18005550100',
    CallStatus: 'ringing',
  };

  it('should compute a deterministic, non-empty base64 signature', async () => {
    const signature1 = await computeTwilioSignature(testUrl, testParams, testAuthToken);
    const signature2 = await computeTwilioSignature(testUrl, testParams, testAuthToken);

    expect(signature1).toBeDefined();
    expect(signature1.length).toBeGreaterThan(10);
    expect(signature1).toBe(signature2);
  });

  it('should validate an authentic Twilio signature successfully', async () => {
    const validSignature = await computeTwilioSignature(testUrl, testParams, testAuthToken);
    const isValid = await validateTwilioSignature(
      validSignature,
      testUrl,
      testParams,
      testAuthToken
    );

    expect(isValid).toBe(true);
  });

  it('should reject a request if parameters were tampered in flight', async () => {
    const validSignature = await computeTwilioSignature(testUrl, testParams, testAuthToken);

    // Attacker modifies 'From' caller ID
    const tamperedParams = {
      ...testParams,
      From: '+19998887777',
    };

    const isValid = await validateTwilioSignature(
      validSignature,
      testUrl,
      tamperedParams,
      testAuthToken
    );

    expect(isValid).toBe(false);
  });

  it('should reject a request if destination URL was tampered', async () => {
    const validSignature = await computeTwilioSignature(testUrl, testParams, testAuthToken);
    const tamperedUrl = 'https://evil-spoof.example.com/voice/incoming';

    const isValid = await validateTwilioSignature(
      validSignature,
      tamperedUrl,
      testParams,
      testAuthToken
    );

    expect(isValid).toBe(false);
  });

  it('should reject if signature header is missing or empty', async () => {
    const isValid = await validateTwilioSignature(
      null,
      testUrl,
      testParams,
      testAuthToken
    );

    expect(isValid).toBe(false);
  });

  it('should reject if invalid auth token is used for validation', async () => {
    const validSignature = await computeTwilioSignature(testUrl, testParams, testAuthToken);
    const wrongAuthToken = 'wrong_token_value_for_testing';

    const isValid = await validateTwilioSignature(
      validSignature,
      testUrl,
      testParams,
      wrongAuthToken
    );

    expect(isValid).toBe(false);
  });
});
