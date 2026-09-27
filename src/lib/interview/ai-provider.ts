// ─── AI Provider Helper ───────────────────────────────────────────────────────
// Supports OpenAI, Groq, or Gemini. Reads from env to pick the active provider.
// Falls back gracefully if no key is set.

export type AIProvider = "gemini" | "groq" | "openai";

function detectProvider(): AIProvider {
  if (process.env.GEMINI_API_KEY) return "gemini";
  if (process.env.GROQ_API_KEY) return "groq";
  if (process.env.OPENAI_API_KEY) return "openai";
  return "gemini"; // default (may fail without key)
}

export async function callAI(
  systemPrompt: string,
  userPrompt: string,
  jsonMode = true
): Promise<string> {
  const provider = detectProvider();

  if (provider === "gemini") {
    return callGemini(systemPrompt, userPrompt, jsonMode);
  } else if (provider === "groq") {
    return callOpenAICompatible(
      "https://api.groq.com/openai/v1/chat/completions",
      process.env.GROQ_API_KEY!,
      "llama-3.3-70b-versatile",
      systemPrompt,
      userPrompt
    );
  } else {
    return callOpenAICompatible(
      "https://api.openai.com/v1/chat/completions",
      process.env.OPENAI_API_KEY!,
      "gpt-4o-mini",
      systemPrompt,
      userPrompt
    );
  }
}

async function callGemini(
  systemPrompt: string,
  userPrompt: string,
  jsonMode: boolean
): Promise<string> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error("GEMINI_API_KEY not set");

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${key}`;
  const body: Record<string, unknown> = {
    contents: [
      { role: "user", parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }] },
    ],
    generationConfig: {
      temperature: 0.7,
      ...(jsonMode ? { responseMimeType: "application/json" } : {}),
    },
  };

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Gemini API error: ${err.slice(0, 300)}`);
  }

  const data = await res.json();
  const text: string = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
  return text;
}

async function callOpenAICompatible(
  endpoint: string,
  apiKey: string,
  model: string,
  systemPrompt: string,
  userPrompt: string
): Promise<string> {
  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.7,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`API error (${model}): ${err.slice(0, 300)}`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content ?? "";
}

// ─── JSON parsing helper ──────────────────────────────────────────────────────
export function parseJSON<T>(raw: string, fallback: T): T {
  try {
    const cleaned = raw
      .replace(/```json/gi, "")
      .replace(/```/g, "")
      .trim();
    return JSON.parse(cleaned) as T;
  } catch {
    return fallback;
  }
}
