// src/app/api/mock-interview/grade-answer/route.ts
import { NextResponse } from "next/server";
import { type GradeResult, type InterviewLevel } from "@/lib/adaptive-interview";
import { callLLM, GRADING_SYSTEM_PROMPT } from "@/lib/llm-service";

export const dynamic = "force-dynamic";

interface GradeAnswerRequest {
  question: string;
  topic?: string;
  level?: InterviewLevel;
  answer: string;
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as GradeAnswerRequest;
    const { question, topic = "General CS", level = "mid", answer } = body;

    if (!question) {
      return NextResponse.json(
        { error: "Question is required for evaluation." },
        { status: 400 }
      );
    }

    const trimmedAnswer = (answer || "").trim();

    // 1. Immediate zero-check for empty, trivial, or gibberish answers
    if (!trimmedAnswer || trimmedAnswer.length < 5 || isOffTopicGibberish(trimmedAnswer)) {
      const zeroResult: GradeResult = {
        score: 0,
        feedback:
          "The provided response is empty, trivial, or completely off-topic. No technical substance was provided to address the question.",
        isZeroScore: true,
        strengths: [],
        gaps: ["No relevant technical concepts were addressed."],
      };
      return NextResponse.json(zeroResult);
    }

    // 2. Call LLM Grader with strict grading prompt
    const userPrompt = `
Question Asked: "${question}"
Topic: "${topic}"
Difficulty Level: "${level}"
Candidate's Answer:
"${trimmedAnswer}"

Grade the candidate's answer strictly following the rules:
- Score 0-10 (0 if completely irrelevant or off-topic, otherwise strictly by technical correctness and depth).
- Respond with ONLY valid JSON: {"score": <0-10>, "feedback": "..."}
`;

    const llmRes = await callLLM(GRADING_SYSTEM_PROMPT, userPrompt);

    if (llmRes.json && typeof llmRes.json.score === "number" && llmRes.json.feedback) {
      const rawScore = Math.max(0, Math.min(10, Math.round(llmRes.json.score * 10) / 10));
      const isZero = rawScore === 0;

      const result: GradeResult = {
        score: rawScore,
        feedback: llmRes.json.feedback,
        isZeroScore: isZero,
        strengths: isZero ? [] : ["Addressed relevant technical aspects."],
        gaps: rawScore < 8 ? ["Could provide deeper architectural or edge-case context."] : [],
      };
      return NextResponse.json(result);
    }

    // 3. Deterministic Heuristic Grader fallback
    const heuristicResult = evaluateHeuristically(question, trimmedAnswer, level);
    return NextResponse.json(heuristicResult);
  } catch (error: any) {
    console.error("Grading error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to grade answer." },
      { status: 500 }
    );
  }
}

function isOffTopicGibberish(text: string): boolean {
  const lower = text.toLowerCase();
  const words = lower.split(/\s+/).filter(Boolean);
  
  if (words.length < 3) return true;

  // Obvious non-answers
  const nonAnswers = [
    "idk", "i don't know", "i dont know", "no idea", "skip", "pass", "nothing", 
    "asdf", "qwerty", "hello", "hi", "testing", "test", "blah blah", "xyz"
  ];
  if (nonAnswers.includes(lower.replace(/[^\w\s]/g, "").trim())) {
    return true;
  }

  // Excessive repetition
  const unique = new Set(words);
  if (words.length >= 6 && unique.size / words.length < 0.3) {
    return true;
  }

  return false;
}

function evaluateHeuristically(
  question: string,
  answer: string,
  level: InterviewLevel
): GradeResult {
  const lowerQ = question.toLowerCase();
  const lowerA = answer.toLowerCase();
  const words = lowerA.split(/\s+/);

  // Extract core keywords from question
  const qWords = lowerQ
    .replace(/[^\w\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 3 && !["what", "explain", "difference", "between", "how", "would", "which"].includes(w));

  const matchedQWords = qWords.filter((qw) => lowerA.includes(qw));
  const relevanceRatio = qWords.length > 0 ? matchedQWords.length / qWords.length : 0.5;

  if (relevanceRatio === 0 && words.length < 15) {
    return {
      score: 0,
      feedback: "The answer does not appear to address the core subject matter of the question asked.",
      isZeroScore: true,
      strengths: [],
      gaps: ["Lacks direct relevance to the question prompt."],
    };
  }

  let score = 4;
  const strengths: string[] = [];
  const gaps: string[] = [];

  if (relevanceRatio >= 0.5) {
    score += 2;
    strengths.push("Directly engages with key concepts from the question.");
  }

  if (words.length > 40) {
    score += 2;
    strengths.push("Good descriptive structure.");
  } else if (words.length < 15) {
    score = Math.max(1, score - 2);
    gaps.push("Response is too brief to demonstrate full depth.");
  }

  // Level adjustment
  if (level === "high") {
    if (!lowerA.includes("trade-off") && !lowerA.includes("scale") && !lowerA.includes("memory") && !lowerA.includes("performance")) {
      score = Math.max(1, score - 1);
      gaps.push("High-difficulty answers should explicitly discuss internal mechanics, trade-offs, and scalability.");
    } else {
      score = Math.min(10, score + 1);
      strengths.push("Highlights trade-offs and performance implications.");
    }
  }

  const finalScore = Math.min(10, Math.max(0, score));

  return {
    score: finalScore,
    feedback:
      finalScore >= 8
        ? "Strong technical explanation with sound conceptual clarity and structured reasoning."
        : finalScore >= 5
        ? "Demonstrates basic working knowledge of the topic, but would benefit from discussing concrete trade-offs and edge cases."
        : "Partially touches on the subject but misses critical technical explanations and depth required for this level.",
    isZeroScore: finalScore === 0,
    strengths,
    gaps,
  };
}
