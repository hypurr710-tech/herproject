import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { text, voiceId, stability = 0.5, similarityBoost = 0.75 } = await request.json();

    if (!text || typeof text !== "string") {
      return NextResponse.json(
        { error: "Text is required" },
        { status: 400 }
      );
    }

    const apiKey = process.env.ELEVENLABS_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "ElevenLabs API key not configured. Set ELEVENLABS_API_KEY in your .env.local file." },
        { status: 500 }
      );
    }

    const selectedVoiceId = voiceId || process.env.ELEVENLABS_VOICE_ID || "21m00Tcm4TlvDq8ikWAM";

    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${selectedVoiceId}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "xi-api-key": apiKey,
        },
        body: JSON.stringify({
          text,
          model_id: "eleven_multilingual_v2",
          voice_settings: {
            stability,
            similarity_boost: similarityBoost,
            style: 0.3,
            use_speaker_boost: true,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        {
          error: `ElevenLabs TTS error: ${response.status} ${errorData?.detail?.message || JSON.stringify(errorData) || ""}`,
        },
        { status: response.status }
      );
    }

    const audioBuffer = await response.arrayBuffer();

    return new NextResponse(audioBuffer, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Length": audioBuffer.byteLength.toString(),
      },
    });
  } catch (error) {
    console.error("ElevenLabs TTS API error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}

// GET endpoint to list available voices
export async function GET() {
  try {
    const apiKey = process.env.ELEVENLABS_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "ElevenLabs API key not configured", voices: [] },
        { status: 200 }
      );
    }

    const response = await fetch("https://api.elevenlabs.io/v1/voices", {
      headers: {
        "xi-api-key": apiKey,
      },
    });

    if (!response.ok) {
      return NextResponse.json({ voices: [] });
    }

    const data = await response.json();
    const voices = (data.voices || []).map(
      (v: { voice_id: string; name: string; labels?: Record<string, string> }) => ({
        id: v.voice_id,
        name: v.name,
        description: v.labels
          ? Object.values(v.labels).join(" · ")
          : "",
      })
    );

    return NextResponse.json({ voices });
  } catch {
    return NextResponse.json({ voices: [] });
  }
}
