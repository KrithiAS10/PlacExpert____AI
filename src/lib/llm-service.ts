// src/lib/llm-service.ts

interface LLMResponse {
  raw: string;
  json?: any;
}

/**
 * Universal caller — tries Gemini (real models), then OpenAI, then Groq.
 * Falls back to { raw: "" } so callers can invoke their local fallback logic.
 */
export async function callLLM(systemPrompt: string, userPrompt: string): Promise<LLMResponse> {
  const geminiKey =
    process.env.GEMINI_API_KEY ||
    process.env.GOOGLE_API_KEY ||
    process.env.NEXT_PUBLIC_GEMINI_API_KEY;
  const openaiKey = process.env.OPENAI_API_KEY;
  const groqKey = process.env.GROQ_API_KEY;

  // 1. Try Google Gemini — real, available model names (latest first)
  if (geminiKey) {
    const models = ["gemini-2.0-flash", "gemini-1.5-flash", "gemini-1.5-flash-latest", "gemini-1.5-pro"];
    for (const model of models) {
      try {
        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiKey}`;
        const payload = {
          system_instruction: {
            parts: [{ text: systemPrompt }],
          },
          contents: [
            {
              parts: [{ text: userPrompt }],
            },
          ],
          generationConfig: {
            temperature: 0.2,
            responseMimeType: "application/json",
          },
        };

        const res = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (res.ok) {
          const data = await res.json();
          const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
          if (text) {
            try {
              return { raw: text, json: JSON.parse(text) };
            } catch {
              // Try to extract JSON from markdown code blocks
              const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/) ||
                               text.match(/(\{[\s\S]*\})/);
              if (jsonMatch) {
                try {
                  const extracted = (jsonMatch[1] || jsonMatch[0]).trim();
                  return { raw: text, json: JSON.parse(extracted) };
                } catch { /* ignore */ }
              }
              return { raw: text };
            }
          }
        } else {
          const errData = await res.json().catch(() => ({})) as any;
          console.warn(`Gemini (${model}) returned ${res.status}:`, errData?.error?.message || "");
        }
      } catch (err) {
        console.warn(`Gemini (${model}) call failed:`, err);
      }
    }
  }

  // 2. Try OpenAI API if key exists
  if (openaiKey) {
    try {
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${openaiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          temperature: 0.2,
          response_format: { type: "json_object" },
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const text = data.choices?.[0]?.message?.content || "";
        try {
          return { raw: text, json: JSON.parse(text) };
        } catch {
          return { raw: text };
        }
      }
    } catch (err) {
      console.warn("OpenAI API call failed:", err);
    }
  }

  // 3. Try Groq API if key exists
  if (groqKey) {
    try {
      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${groqKey}`,
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          temperature: 0.2,
          response_format: { type: "json_object" },
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const text = data.choices?.[0]?.message?.content || "";
        try {
          return { raw: text, json: JSON.parse(text) };
        } catch {
          return { raw: text };
        }
      }
    } catch (err) {
      console.warn("Groq API call failed:", err);
    }
  }

  // 4. Return null to signal local deterministic engine fallback
  return { raw: "" };
}

// ─── System Prompts ────────────────────────────────────────────────────────────

export const QUESTION_GENERATION_SYSTEM_PROMPT = `You are a strict, senior technical interviewer conducting a REAL mock interview.
Generate exactly ONE interview question at a time based on the candidate's resume.

Rules:
- Difficulty: {level}
  low  = definitions & core fundamentals of tech the candidate listed
  mid  = applied/scenario questions, project deep-dives, "how would you..."
  high = internals, trade-offs, system design, scaling, edge cases
- Base the question on the candidate's ACTUAL resume content (skills, projects, tools).
- If the candidate's most recent answer mentioned a new term NOT in their resume, follow-up on that term.
- NEVER repeat a question already asked.
- Do NOT include the answer, hints, or preamble — just the question.
- Respond with ONLY valid JSON, no markdown fences:
  {"question": "...", "topic": "..."}`;

export const GRADING_SYSTEM_PROMPT = `You are a strict, objective technical interview grader with deep expertise in software engineering.

Grading rules:
- Score 0-10 with ONE decimal place (e.g. 7.5).
- Score 0 ONLY if: the answer is completely empty, gibberish, irrelevant, or explicitly skips.
- Score 1-4: partially touches the topic but misses critical depth or accuracy.
- Score 5-6: working knowledge with minor gaps.
- Score 7-8: accurate, well-structured, good technical depth.
- Score 9-10: exceptional — covers all aspects, trade-offs, and edge cases.
- Evaluate ONLY technical correctness and relevance.
- Be brutally honest but constructive. Cite SPECIFIC missing points by name.
- Strengths: 1-3 concrete technical points the candidate got RIGHT.
- Gaps: 1-3 specific concepts or details they MISSED or got WRONG.

Respond with ONLY valid JSON (no markdown fences):
{"score": <0-10>, "feedback": "2-3 sentences of specific, actionable feedback", "strengths": ["..."], "gaps": ["..."]}`;

export const SESSION_SUMMARY_SYSTEM_PROMPT = `You are a senior technical hiring manager summarizing a candidate's mock interview performance.

Given the interview records, generate an honest, actionable executive summary.
Identify the candidate's actual strong areas and specific weak points by topic name.
The readinessNote should be 2-3 sentences, direct, and constructive.

Respond with ONLY valid JSON (no markdown fences):
{"readinessNote": "...", "strengths": ["..."], "targetAreas": ["..."]}`;
