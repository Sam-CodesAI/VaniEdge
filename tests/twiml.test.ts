import { describe, it, expect } from 'vitest';
import { generateStreamTwiML, generateFallbackTwiML, escapeXml } from '../src/twilio/twiml';

describe('TwiML Response Builders', () => {
  describe('escapeXml', () => {
    it('should properly escape XML special entities', () => {
      const unsafe = `Tom & Jerry <the "best" 'show'>`;
      const safe = escapeXml(unsafe);
      expect(safe).toBe('Tom &amp; Jerry &lt;the &quot;best&quot; &apos;show&apos;&gt;');
    });
  });

  describe('generateStreamTwiML', () => {
    it('should generate well-formed TwiML XML with Connect and Stream elements', () => {
      const streamUrl = 'wss://voice.example.workers.dev/voice/stream';
      const twiml = generateStreamTwiML(streamUrl, {
        callSid: 'CA123456789',
        caller: '+15551234567',
        greeting: 'Hello from Samarth Nimangre AI Receptionist',
      });

      expect(twiml).toContain('<?xml version="1.0" encoding="UTF-8"?>');
      expect(twiml).toContain('<Response>');
      expect(twiml).toContain('</Response>');
      expect(twiml).toContain('<Say voice="Polly.Joanna">Hello from Samarth Nimangre AI Receptionist</Say>');
      expect(twiml).toContain('<Connect>');
      expect(twiml).toContain(`<Stream url="${streamUrl}">`);
      expect(twiml).toContain('<Parameter name="callSid" value="CA123456789" />');
      expect(twiml).toContain('<Parameter name="caller" value="+15551234567" />');
    });

    it('should include custom parameters and escape unsafe characters', () => {
      const streamUrl = 'wss://voice.example.workers.dev/voice/stream';
      const twiml = generateStreamTwiML(streamUrl, {
        customParameters: {
          accountTier: 'enterprise & priority',
          department: '<sales>',
        },
      });

      expect(twiml).toContain('<Parameter name="accountTier" value="enterprise &amp; priority" />');
      expect(twiml).toContain('<Parameter name="department" value="&lt;sales&gt;" />');
    });
  });

  describe('generateFallbackTwiML', () => {
    it('should generate emergency human forwarding TwiML', () => {
      const humanNumber = '+18005550199';
      const twiml = generateFallbackTwiML(humanNumber, {
        callerId: '+18005550100',
        timeoutSeconds: 20,
        noticeMessage: 'Connecting you to our team.',
      });

      expect(twiml).toContain('<Response>');
      expect(twiml).toContain('<Say voice="Polly.Joanna">Connecting you to our team.</Say>');
      expect(twiml).toContain('<Dial timeout="20" callerId="+18005550100">+18005550199</Dial>');
      expect(twiml).toContain('</Response>');
    });
  });
});
