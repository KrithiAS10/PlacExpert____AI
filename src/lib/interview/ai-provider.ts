// ─── AI Provider Helper ───────────────────────────────────────────────────────
// Supports Gemini, OpenAI, and Groq. Reads from env to pick available provider.
// Falls back gracefully if no key is set or if API calls fail.

export type AIProvider = "gemini" | "groq" | "openai";

export async function callAI(
  systemPrompt: string,
  userPrompt: string,
  jsonMode = true
): Promise<string> {
  const geminiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
  const groqKey = process.env.GROQ_API_KEY;
  const openaiKey = process.env.OPENAI_API_KEY;

  // 1. Try Gemini if available
  if (geminiKey) {
    try {
      const res = await callGemini(geminiKey, systemPrompt, userPrompt, jsonMode);
      if (res && res.trim().length > 0) return res;
    } catch (e) {
      console.warn("Gemini provider failed, attempting fallback:", e instanceof Error ? e.message : e);
    }
  }

  // 2. Try Groq if available
  if (groqKey) {
    try {
      const res = await callOpenAICompatible(
        "https://api.groq.com/openai/v1/chat/completions",
        groqKey,
        "llama-3.3-70b-versatile",
        systemPrompt,
        userPrompt,
        jsonMode
      );
      if (res && res.trim().length > 0) return res;
    } catch (e) {
      console.warn("Groq provider failed, attempting fallback:", e instanceof Error ? e.message : e);
    }
  }

  // 3. Try OpenAI if available
  if (openaiKey) {
    try {
      const res = await callOpenAICompatible(
        "https://api.openai.com/v1/chat/completions",
        openaiKey,
        "gpt-4o-mini",
        systemPrompt,
        userPrompt,
        jsonMode
      );
      if (res && res.trim().length > 0) return res;
    } catch (e) {
      console.warn("OpenAI provider failed:", e instanceof Error ? e.message : e);
    }
  }

  throw new Error("No AI provider available or all provider calls failed");
}

async function callGemini(
  key: string,
  systemPrompt: string,
  userPrompt: string,
  jsonMode: boolean
): Promise<string> {
  // Try 2.0-flash, fall back to 1.5-flash
  const models = ["gemini-2.0-flash", "gemini-1.5-flash"];
  let lastError: Error | null = null;

  for (const model of models) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;
      const body: Record<string, unknown> = {
        system_instruction: {
          parts: [{ text: systemPrompt }],
        },
        contents: [
          { role: "user", parts: [{ text: userPrompt }] },
        ],
        generationConfig: {
          temperature: 0.2,
          ...(jsonMode ? { responseMimeType: "application/json" } : {}),
        },
      };

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        const data = await res.json();
        const text: string = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
        if (text) return text;
      } else {
        const errText = await res.text();
        lastError = new Error(`Gemini (${model}) API error: ${errText.slice(0, 300)}`);
      }
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
    }
  }

  throw lastError || new Error("Gemini API calls failed");
}

async function callOpenAICompatible(
  endpoint: string,
  apiKey: string,
  model: string,
  systemPrompt: string,
  userPrompt: string,
  jsonMode: boolean
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
      temperature: 0.2,
      ...(jsonMode ? { response_format: { type: "json_object" } } : {}),
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

