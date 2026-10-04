import { NextResponse } from "next/server";
import { getQuizQuestionsForTask, QuestionItem } from "@/app/roadmap/questionsData";

const GEMINI_MODELS = [
  "gemini-3.5-flash",
  "gemini-3.8-flash",
  "gemini-flash-latest",
  "gemini-3.1-flash-lite"
];

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      taskTitle = "Core CS Fundamentals",
      taskType = "TOPIC",
      phase = "Foundation",
      role = "",
      language = "",
      count = 5,
      excludeQuestions = [],
      trial = 1,
    } = body;

    const geminiKey = process.env.GEMINI_API_KEY;

    if (geminiKey) {
      const systemPrompt = `You are an expert technical placement interviewer who designs assessment quizzes for engineering students.
Always output strictly valid JSON conforming to the requested schema. No code fences, no extra text.
Never repeat or rephrase questions that have already been asked.`;

      const excludeList: string[] = Array.isArray(excludeQuestions) ? excludeQuestions.filter(Boolean) : [];
      const excluded = new Set(excludeList.map(normalizeQuestion));
      const excludeClause = excludeList.length > 0
        ? `\nCRITICAL REQUIREMENT — ZERO REPETITION:\nDo NOT repeat or rephrase ANY of these ${excludeList.length} questions already shown to the student:\n${excludeList.slice(-25).map((q: string) => `❌ "${q}"`).join("\n")}\nYou MUST generate COMPLETELY FRESH questions covering different aspects, edge cases, problem patterns, or real-world implementation nuances of "${taskTitle}".`
        : "";

      const userPrompt = `Generate exactly ${count} completely fresh, unique multiple-choice verification questions specifically tailored to evaluate understanding of the following task:

Topic: "${taskTitle}"
Category / Type: "${taskType}"
Phase in Roadmap: "${phase}"
Target Career Track: "${role || 'Software Engineer'}"
Preferred Language / Stack: "${language || 'General'}"
Attempt / Trial #: ${trial}
Entropy Seed: ${Date.now()}_${Math.random().toString(36).substring(5)}
${excludeClause}

Guidelines:
1. Every question must be directly focused on "${taskTitle}". Do NOT generate generic or unrelated questions.
2. Every question must be NEW and not duplicate any previous questions.
3. Provide 4 distinct options (0 to 3) per question. Exactly one option must be unequivocally correct.
4. Provide the 0-indexed number for "correct" (0, 1, 2, or 3).
5. Provide a clear, educational "explanation" of why that option is correct.

Output JSON:
{
  "questions": [
    {
      "q": "Direct question about ${taskTitle}?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correct": 0,
      "explanation": "Clear explanation of why option 0 is the correct answer."
    }
  ]
}`;

      for (const model of GEMINI_MODELS) {
        try {
          const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiKey}`;
          const res = await fetch(endpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              system_instruction: { parts: [{ text: systemPrompt }] },
              contents: [{ parts: [{ text: userPrompt }] }],
              generationConfig: {
                temperature: 0.85,
                responseMimeType: "application/json",
              },
            }),
          });

          if (!res.ok) {
            console.warn(`Gemini model ${model} returned ${res.status} for questions generation, trying fallback...`);
            continue;
          }

          const data = await res.json();
          const raw = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
          let parsed: any;
          try {
            parsed = JSON.parse(raw);
          } catch {
            const cleaned = raw.replace(/^```json\n?/i, "").replace(/```$/i, "").trim();
            parsed = JSON.parse(cleaned);
          }

          const questionsList = parsed.questions || parsed;
          if (Array.isArray(questionsList) && questionsList.length >= 3) {
            const formatted: QuestionItem[] = questionsList.map((item: any) => ({
              q: String(item.q || item.question),
              options: Array.isArray(item.options) ? item.options.map(String) : ["True", "False", "Both", "None"],
              correct: typeof item.correct === "number" ? Math.max(0, Math.min(3, item.correct)) : 0,
              explanation: String(item.explanation || "Correct answer based on the topic principles."),
            }));

            const freshQuestions = uniqueQuestions(formatted)
              .filter((question) => !excluded.has(normalizeQuestion(question.q)))
              .slice(0, count);

            if (freshQuestions.length < Math.min(count, 3)) {
              continue;
            }

            return NextResponse.json({
              success: true,
              source: `gemini_${model}`,
              topic: taskTitle,
              questions: freshQuestions,
            });
          }
        } catch (err: any) {
          console.warn(`Gemini (${model}) questions error:`, err?.message || err);
        }
      }
    }

    // ── Procedural Fallback if AI is offline or quota reached ──
    const excludeList: string[] = Array.isArray(excludeQuestions) ? excludeQuestions.filter(Boolean) : [];
    const fallbackQuestions = getQuizQuestionsForTask(taskTitle, taskType, excludeList);
    return NextResponse.json({
      success: true,
      source: "procedural_fallback",
      topic: taskTitle,
      questions: fallbackQuestions.slice(0, count),
    });
  } catch (error: any) {
    console.error("Failed to generate task questions:", error);
    return NextResponse.json(
      { error: "Failed to generate questions", questions: [] },
      { status: 500 }
    );
  }
}

function normalizeQuestion(question: string): string {
  return question.trim().replace(/\s+/g, " ").toLowerCase();
}

function uniqueQuestions(questions: QuestionItem[]): QuestionItem[] {
  const seen = new Set<string>();
  return questions.filter((question) => {
    const key = normalizeQuestion(question.q);
    if (!question.q.trim() || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
