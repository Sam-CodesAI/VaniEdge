import { NextRequest, NextResponse } from "next/server";

const ELEVENLABS_API_KEY =
  process.env.ELEVENLABS_API_KEY || "sk_2cb5ae54458e4de5bbc8e5f599643d8dde59a4f12d791e84";

const VOICE_MAP: Record<string, string> = {
  sarah: "EXAVITQu4vr4xnSDxMaL", // Reassuring, Mature
  rachel: "21m00Tcm4TlvDq8ikWAM", // Calm, Professional
  adam: "pNInz6obpgDQGcFmaJgB", // Authoritative
  bella: "piTKgcLEGmPE4e6mEKli", // Warm, Friendly
};

export async function POST(req: NextRequest) {
  try {
    const { text, voiceId = "sarah", languageCode } = (await req.json()) as {
      text?: string;
      voiceId?: string;
      languageCode?: string;
    };

    if (!text || typeof text !== "string") {
      return NextResponse.json({ error: "Text is required" }, { status: 400 });
    }

    const resolvedVoiceId = VOICE_MAP[voiceId.toLowerCase()] || voiceId;

    const elevenLabsUrl = `https://api.elevenlabs.io/v1/text-to-speech/${resolvedVoiceId}?optimize_streaming_latency=3`;

    const requestBody: {
      text: string;
      model_id: string;
      language_code?: string;
      voice_settings: {
        stability: number;
        similarity_boost: number;
        style: number;
        use_speaker_boost: boolean;
      };
    } = {
      text,
      model_id: "eleven_turbo_v2_5",
      voice_settings: {
        stability: 0.5,
        similarity_boost: 0.8,
        style: 0.0,
        use_speaker_boost: true,
      },
    };

    if (languageCode) {
      requestBody.language_code = languageCode;
    }

    const response = await fetch(elevenLabsUrl, {
      method: "POST",
      headers: {
        Accept: "audio/mpeg",
        "Content-Type": "application/json",
        "xi-api-key": ELEVENLABS_API_KEY,
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.warn("[WARN] ElevenLabs API error:", response.status, errText);
      return NextResponse.json(
        { error: "ElevenLabs API unavailable", fallback: true, details: errText },
        { status: response.status }
      );
    }

    const audioBuffer = await response.arrayBuffer();

    return new Response(audioBuffer, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (err: any) {
    console.error("[ERROR] TTS route error:", err);
    return NextResponse.json(
      { error: "TTS generation failed", fallback: true, details: err?.message || String(err) },
      { status: 500 }
    );
  }
}
