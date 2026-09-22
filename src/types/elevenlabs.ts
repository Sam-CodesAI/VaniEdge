/**
 * ElevenLabs Conversational AI WebSocket Protocol Types
 */

// Outbound messages sent from Worker to ElevenLabs WebSocket
export type ElevenLabsOutboundMessage =
  | ElevenLabsUserAudioChunkMessage
  | ElevenLabsPongMessage
  | ElevenLabsContextualUpdateMessage;

export interface ElevenLabsUserAudioChunkMessage {
  user_audio_chunk: string; // Base64 encoded audio (ulaw_8000 or pcm_16000)
}

export interface ElevenLabsPongMessage {
  pong: {
    event_id: number;
  };
}

export interface ElevenLabsContextualUpdateMessage {
  contextual_update: {
    system_prompt_addition?: string;
    dynamic_variables?: Record<string, string>;
  };
}

// Inbound messages received from ElevenLabs WebSocket
export type ElevenLabsInboundMessage =
  | ElevenLabsConversationInitiationMetadata
  | ElevenLabsAudioMessage
  | ElevenLabsInterruptionMessage
  | ElevenLabsUserTranscriptMessage
  | ElevenLabsAgentResponseMessage
  | ElevenLabsPingMessage
  | ElevenLabsInternalTentativeAgentResponseMessage;

export interface ElevenLabsConversationInitiationMetadata {
  type: 'conversation_initiation_metadata';
  conversation_initiation_metadata_event: {
    conversation_id: string;
    agent_output_audio_format: string;
    user_input_audio_format?: string;
  };
}

export interface ElevenLabsAudioMessage {
  type: 'audio';
  audio_event: {
    audio_base_64: string; // Base64 encoded audio matching agent_output_audio_format
    event_id: number;
  };
}

export interface ElevenLabsInterruptionMessage {
  type: 'interruption';
  interruption_event: {
    event_id: number;
  };
}

export interface ElevenLabsUserTranscriptMessage {
  type: 'user_transcript';
  user_transcription_event: {
    user_transcript: string;
  };
}

export interface ElevenLabsAgentResponseMessage {
  type: 'agent_response';
  agent_response_event: {
    agent_response: string;
  };
}

export interface ElevenLabsPingMessage {
  type: 'ping';
  ping_event: {
    event_id: number;
    ping_ms?: number;
  };
}

export interface ElevenLabsInternalTentativeAgentResponseMessage {
  type: 'internal_tentative_agent_response';
  tentative_agent_response_internal_event: {
    tentative_agent_response: string;
  };
}
