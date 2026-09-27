// src/lib/llm-service.ts
import { ResumeProfile, InterviewLevel, extractNewTechnicalTerms } from "./adaptive-interview";

interface LLMResponse {
  raw: string;
  json?: any;
}

/**
 * Universal caller supporting Gemini, OpenAI, Groq, Anthropic, or fallback
 */
export async function callLLM(systemPrompt: string, userPrompt: string): Promise<LLMResponse> {
  const geminiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  const openaiKey = process.env.OPENAI_API_KEY;
  const groqKey = process.env.GROQ_API_KEY;

  // 1. Try Google Gemini API if key exists
  if (geminiKey) {
    try {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiKey}`;
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
        try {
          return { raw: text, json: JSON.parse(text) };
        } catch {
          return { raw: text };
        }
      }
    } catch (err) {
      console.warn("Gemini API call failed, falling back to other providers or local logic:", err);
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

// System prompts as defined in requirements
export const QUESTION_GENERATION_SYSTEM_PROMPT = `You are a strict, senior technical interviewer conducting a mock interview.
Generate exactly ONE interview question at a time.

Rules:
- Difficulty level: {level} (low = fundamentals on tech the candidate listed;
  mid = applied/scenario questions, project deep-dives; high = internals,
  trade-offs, system design, optimization, edge cases).
- Base the question primarily on the candidate's resume content.
- If the candidate's most recent answer used a technical term/technology NOT
  present in the resume, generate a follow-up question on that term instead.
- Never repeat a question already asked.
- No preamble, no hints, no answer — just the question.
- Respond with ONLY valid JSON: {"question": "...", "topic": "..."}`;

export const GRADING_SYSTEM_PROMPT = `You are a strict, objective technical interview grader.

Rules:
- Score 0-10.
- If the answer is irrelevant, off-topic, empty, or doesn't address the
  question, the score MUST be exactly 0. No partial credit for effort.
- Score only technical correctness/relevance — not length or confidence.
- Give 2-3 sentences of specific, honest feedback.
- Respond with ONLY valid JSON: {"score": <0-10>, "feedback": "..."}`;
