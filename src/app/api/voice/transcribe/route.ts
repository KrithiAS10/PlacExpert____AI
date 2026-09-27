// POST /api/voice/transcribe
// Accepts audio blob and returns transcript using Web Speech API or AI whisper-compatible endpoint.
// For browser-based recording, the frontend already handles Web Speech API locally.
// This route provides server-side transcription for environments where client-side STT is unavailable.

import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const audioFile = formData.get("audio") as File | null;
    const language = (formData.get("language") as string) || "en";

    if (!audioFile || audioFile.size === 0) {
      return NextResponse.json({ error: "No audio file provided." }, { status: 400 });
    }

    // Try OpenAI Whisper if key is available
    const openAIKey = process.env.OPENAI_API_KEY;
    if (openAIKey) {
      const whisperForm = new FormData();
      whisperForm.append("file", audioFile, audioFile.name || "recording.webm");
      whisperForm.append("model", "whisper-1");
      whisperForm.append("language", language);

      const res = await fetch("https://api.openai.com/v1/audio/transcriptions", {
        method: "POST",
        headers: { Authorization: `Bearer ${openAIKey}` },
        body: whisperForm,
      });

      if (res.ok) {
        const data = await res.json();
        return NextResponse.json({
          success: true,
          transcript: data.text ?? "",
          provider: "whisper",
        });
      }
    }

    // If Groq supports audio (Whisper via Groq)
    const groqKey = process.env.GROQ_API_KEY;
    if (groqKey) {
      const groqForm = new FormData();
      groqForm.append("file", audioFile, audioFile.name || "recording.webm");
      groqForm.append("model", "whisper-large-v3");
      groqForm.append("language", language);

      const res = await fetch("https://api.groq.com/openai/v1/audio/transcriptions", {
        method: "POST",
        headers: { Authorization: `Bearer ${groqKey}` },
        body: groqForm,
      });

      if (res.ok) {
        const data = await res.json();
        return NextResponse.json({
          success: true,
          transcript: data.text ?? "",
          provider: "groq-whisper",
        });
      }
    }

    // Fallback: inform frontend to use browser STT
    return NextResponse.json({
      success: false,
      transcript: "",
      provider: "none",
      message: "No server-side transcription provider available. Use browser Speech Recognition.",
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Transcription failed";
    console.error("Voice transcription error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
