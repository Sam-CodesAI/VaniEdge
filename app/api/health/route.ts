import { NextResponse } from "next/server";

export async function GET() {
  const hasTwilio = Boolean(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN);
  const hasElevenLabs = Boolean(process.env.ELEVENLABS_API_KEY);

  return NextResponse.json({
    service: "VaniEdge Voice Platform",
    version: "1.2.0",
    status: "healthy",
    timestamp: new Date().toISOString(),
    providers: {
      twilio: {
        configured: hasTwilio,
        phoneNumber: process.env.TWILIO_PHONE_NUMBER || "+18149613703",
      },
      elevenlabs: {
        configured: hasElevenLabs,
      },
      sutradb: {
        status: "in-memory-ready",
        embeddingDim: 64,
        indicSupport: true,
      },
    },
    failoverSla: {
      connectionTimeoutMs: 1200,
      ttftTimeoutMs: 1500,
      zeroDroppedCalls: true,
    },
  });
}
