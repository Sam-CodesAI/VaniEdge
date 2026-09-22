/**
 * TwiML (Twilio Markup Language) Response Generators
 */

/**
 * Escapes characters for safe XML output
 */
export function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export interface StreamTwiMLOptions {
  greeting?: string;
  voice?: string;
  callSid?: string;
  caller?: string;
  customParameters?: Record<string, string>;
}

/**
 * Generates TwiML connecting the active call to a bidirectional Media Stream WebSocket.
 */
export function generateStreamTwiML(
  streamWebSocketUrl: string,
  options: StreamTwiMLOptions = {}
): string {
  const voice = options.voice || 'Polly.Joanna';
  const greeting = options.greeting || 'Thank you for calling. Connecting you to our voice assistant.';

  let paramsXml = '';
  if (options.callSid) {
    paramsXml += `\n      <Parameter name="callSid" value="${escapeXml(options.callSid)}" />`;
  }
  if (options.caller) {
    paramsXml += `\n      <Parameter name="caller" value="${escapeXml(options.caller)}" />`;
  }
  if (options.customParameters) {
    for (const [key, value] of Object.entries(options.customParameters)) {
      paramsXml += `\n      <Parameter name="${escapeXml(key)}" value="${escapeXml(value)}" />`;
    }
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="${escapeXml(voice)}">${escapeXml(greeting)}</Say>
  <Connect>
    <Stream url="${escapeXml(streamWebSocketUrl)}">${paramsXml}
    </Stream>
  </Connect>
</Response>`;
}

export interface FallbackTwiMLOptions {
  noticeMessage?: string;
  voice?: string;
  timeoutSeconds?: number;
  callerId?: string;
  action?: string;
}

/**
 * Generates emergency fallback TwiML when failover watchdog triggers.
 * Bridges the caller to a human backup operator without dropping the call.
 */
export function generateFallbackTwiML(
  humanNumber: string,
  options: FallbackTwiMLOptions = {}
): string {
  const voice = options.voice || 'Polly.Joanna';
  const notice =
    options.noticeMessage ||
    'Please hold for just a moment. Connecting you directly with our senior specialist.';
  const timeout = options.timeoutSeconds ?? 25;
  const callerIdAttr = options.callerId ? ` callerId="${escapeXml(options.callerId)}"` : '';
  const actionAttr = options.action ? ` action="${escapeXml(options.action)}"` : '';

  return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="${escapeXml(voice)}">${escapeXml(notice)}</Say>
  <Dial timeout="${timeout}"${callerIdAttr}${actionAttr}>${escapeXml(humanNumber)}</Dial>
  <Say voice="${escapeXml(voice)}">We are currently experiencing high call volume. Please try calling again shortly.</Say>
  <Hangup />
</Response>`;
}
