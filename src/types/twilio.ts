/**
 * Twilio Webhook and Media Stream Protocol Types
 */

export interface TwilioVoiceWebhookPayload {
  CallSid: string;
  AccountSid: string;
  From: string;
  To: string;
  CallStatus: string;
  ApiVersion?: string;
  Direction?: string;
  ForwardedFrom?: string;
  CallerName?: string;
  FromCity?: string;
  FromState?: string;
  FromZip?: string;
  FromCountry?: string;
  ToCity?: string;
  ToState?: string;
  ToZip?: string;
  ToCountry?: string;
  [key: string]: string | undefined;
}

export interface TwilioCallStatusPayload {
  CallSid: string;
  AccountSid: string;
  From: string;
  To: string;
  CallStatus: 'initiated' | 'ringing' | 'in-progress' | 'completed' | 'busy' | 'no-answer' | 'canceled' | 'failed' | string;
  CallDuration?: string;
  Duration?: string;
  RecordingUrl?: string;
  Timestamp?: string;
  SequenceNumber?: string;
  [key: string]: string | undefined;
}

export type TwilioInboundMessage =
  | TwilioConnectedMessage
  | TwilioStartMessage
  | TwilioMediaMessage
  | TwilioStopMessage
  | TwilioMarkMessage;

export interface TwilioConnectedMessage {
  event: 'connected';
  protocol: string;
  version: string;
}

export interface TwilioStartMessage {
  event: 'start';
  sequenceNumber: string;
  start: {
    streamSid: string;
    accountSid: string;
    callSid: string;
    tracks: string[];
    customParameters?: Record<string, string>;
    mediaFormat: {
      encoding: 'audio/x-mulaw';
      sampleRate: number;
      channels: number;
    };
  };
  streamSid: string;
}

export interface TwilioMediaMessage {
  event: 'media';
  sequenceNumber: string;
  media: {
    track: 'inbound' | 'outbound';
    chunk: string;
    timestamp: string;
    payload: string; // Base64 encoded audio/x-mulaw 8000Hz
  };
  streamSid: string;
}

export interface TwilioStopMessage {
  event: 'stop';
  sequenceNumber: string;
  stop: {
    accountSid: string;
    callSid: string;
  };
  streamSid: string;
}

export interface TwilioMarkMessage {
  event: 'mark';
  sequenceNumber: string;
  mark: {
    name: string;
  };
  streamSid: string;
}

export type TwilioOutboundMessage =
  | TwilioOutboundMediaMessage
  | TwilioOutboundClearMessage
  | TwilioOutboundMarkMessage;

export interface TwilioOutboundMediaMessage {
  event: 'media';
  streamSid: string;
  media: {
    payload: string; // Base64 encoded audio/x-mulaw 8000Hz
  };
}

export interface TwilioOutboundClearMessage {
  event: 'clear';
  streamSid: string;
}

export interface TwilioOutboundMarkMessage {
  event: 'mark';
  streamSid: string;
  mark: {
    name: string;
  };
}
