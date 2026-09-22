/**
 * Twilio HMAC-SHA1 Webhook Signature Validation
 *
 * Implements standard Twilio request verification according to Twilio Security Specs:
 * https://www.twilio.com/docs/usage/webhooks/webhooks-security
 *
 * Uses the standard Web Crypto API supported natively by Cloudflare Workers and Node 18+.
 */

/**
 * Computes the expected Twilio signature for a given URL, parameters, and Auth Token.
 *
 * @param url The full URL of the requested endpoint as Twilio sees it (e.g., https://worker.domain/voice/incoming)
 * @param params Record of POST body key-value pairs (if request was POST)
 * @param authToken Twilio Account Auth Token
 * @returns Base64 encoded HMAC-SHA1 signature string
 */
export async function computeTwilioSignature(
  url: string,
  params: Record<string, string>,
  authToken: string
): Promise<string> {
  // Sort parameter keys alphabetically
  const sortedKeys = Object.keys(params).sort();

  // Concatenate URL with sorted key-value pairs
  let dataToSign = url;
  for (const key of sortedKeys) {
    dataToSign += key + (params[key] ?? '');
  }

  const encoder = new TextEncoder();
  const keyData = encoder.encode(authToken);
  const messageData = encoder.encode(dataToSign);

  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-1' },
    false,
    ['sign']
  );

  const signatureBuffer = await crypto.subtle.sign('HMAC', cryptoKey, messageData);
  const signatureBytes = new Uint8Array(signatureBuffer);

  // Convert binary signature to Base64
  let binaryString = '';
  for (let i = 0; i < signatureBytes.length; i++) {
    binaryString += String.fromCharCode(signatureBytes[i]!);
  }
  return btoa(binaryString);
}

/**
 * Validates whether an incoming HTTP request signature matches the expected Twilio signature.
 * Performs constant-time comparison to prevent timing attacks.
 *
 * @param signatureHeader Value of 'X-Twilio-Signature' header
 * @param url Full target URL of the webhook
 * @param params Record of POST body parameters
 * @param authToken Twilio Auth Token
 * @returns boolean indicating validity
 */
export async function validateTwilioSignature(
  signatureHeader: string | null | undefined,
  url: string,
  params: Record<string, string>,
  authToken: string
): Promise<boolean> {
  if (!signatureHeader || !authToken) {
    return false;
  }

  const expectedSignature = await computeTwilioSignature(url, params, authToken);

  if (signatureHeader.length !== expectedSignature.length) {
    return false;
  }

  // Constant-time comparison
  let mismatch = 0;
  for (let i = 0; i < signatureHeader.length; i++) {
    mismatch |= signatureHeader.charCodeAt(i) ^ expectedSignature.charCodeAt(i);
  }

  return mismatch === 0;
}
