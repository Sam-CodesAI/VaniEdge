import { NextRequest, NextResponse } from "next/server";
import { PollyClient, SynthesizeSpeechCommand } from "@aws-sdk/client-polly";

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY || "";

const AWS_REGION = process.env.AWS_REGION || "us-east-1";

const VOICE_MAP: Record<string, string> = {
  sarah: "EXAVITQu4vr4xnSDxMaL", // Reassuring, Mature
  rachel: "21m00Tcm4TlvDq8ikWAM", // Calm, Professional
  adam: "pNInz6obpgDQGcFmaJgB", // Authoritative
  bella: "piTKgcLEGmPE4e6mEKli", // Warm, Friendly
};

const AWS_VOICE_MAP: Record<string, string> = {
  sarah: "Joanna",
  rachel: "Ruth",
  adam: "Matthew",
  bella: "Salli",
};

export async function POST(req: NextRequest) {
  try {
    const { text, voiceId = "sarah", languageCode, engine = "elevenlabs" } = (await req.json()) as {
      text?: string;
      voiceId?: string;
      languageCode?: string;
      engine?: "elevenlabs" | "polly";
    };

    if (!text || typeof text !== "string") {
      return NextResponse.json({ error: "Text is required" }, { status: 400 });
    }

    if (engine === "polly" || !ELEVENLABS_API_KEY) {
      return await generatePollyTTS(text, voiceId);
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
      console.log("[INFO] Falling back to AWS Polly...");
      return await generatePollyTTS(text, voiceId);
    }

    const audioBuffer = await response.arrayBuffer();

    return new Response(audioBuffer, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("VaniEdge TTS Route Error:", msg);
    return NextResponse.json(
      { error: "TTS Generation failed", details: msg },
      { status: 500 }
    );
  }
}

async function generatePollyTTS(text: string, voiceId: string): Promise<Response> {
  const polly = new PollyClient({
    region: AWS_REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
    },
  });

  const resolvedVoiceId = AWS_VOICE_MAP[voiceId.toLowerCase()] || "Joanna";

  const command = new SynthesizeSpeechCommand({
    Text: text,
    OutputFormat: "mp3",
    VoiceId: resolvedVoiceId as any,
    Engine: "neural",
  });

  try {
    const data = await polly.send(command);
    
    if (data.AudioStream) {
      // The AudioStream in v3 is a readable stream, but Next.js Response can handle it directly or via buffer
      const response = new Response(data.AudioStream as any, {
        headers: {
          "Content-Type": "audio/mpeg",
          "Cache-Control": "public, max-age=3600",
        },
      });
      return response;
    } else {
      throw new Error("No AudioStream returned from AWS Polly");
    }
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("AWS Polly Generation Error:", msg);
    return NextResponse.json(
      { error: "AWS Polly Generation failed", details: msg },
      { status: 500 }
    );
  }
}
