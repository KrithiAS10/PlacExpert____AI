// POST /api/voice/synthesize
// Converts text to speech audio. Returns audio URL or uses browser TTS fallback.

import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { text, voice = "alloy", speed = 1.0 } = await req.json() as {
      text: string;
      voice?: string;
      speed?: number;
    };

    if (!text?.trim()) {
      return NextResponse.json({ error: "text is required." }, { status: 400 });
    }

    const textToSpeak = text.slice(0, 4096); // OpenAI TTS limit

    // Try OpenAI TTS
    const openAIKey = process.env.OPENAI_API_KEY;
    if (openAIKey) {
      const res = await fetch("https://api.openai.com/v1/audio/speech", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${openAIKey}`,
        },
        body: JSON.stringify({
          model: "tts-1",
          input: textToSpeak,
          voice, // alloy, echo, fable, onyx, nova, shimmer
          speed: Math.min(4.0, Math.max(0.25, speed)),
        }),
      });

      if (res.ok) {
        const audioBuffer = await res.arrayBuffer();
        return new NextResponse(audioBuffer, {
          headers: {
            "Content-Type": "audio/mpeg",
            "Content-Disposition": "inline",
            "Cache-Control": "no-store",
          },
        });
      }
    }

    // Fallback: instruct frontend to use browser TTS
    return NextResponse.json({
      success: false,
      useBrowserTTS: true,
      text: textToSpeak,
      message: "No server-side TTS provider available. Use browser speechSynthesis.",
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "TTS failed";
    console.error("Voice synthesize error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
