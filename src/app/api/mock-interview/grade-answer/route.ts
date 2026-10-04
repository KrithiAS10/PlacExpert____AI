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

    // 1. Immediate zero-check for empty, trivial, evasion, or gibberish answers
    const zeroCheck = checkZeroScore(trimmedAnswer);
    if (zeroCheck.isZero) {
      const zeroResult: GradeResult = {
        score: 0,
        feedback: zeroCheck.feedback,
        isZeroScore: true,
        strengths: [],
        gaps: [zeroCheck.reason],
      };
      return NextResponse.json(zeroResult);
    }

    // 2. Call LLM Grader with strict grading prompt
    const userPrompt = `Grade this technical interview answer strictly and honestly.

Question: "${question}"
Topic: "${topic}"
Difficulty Level: "${level}"

Candidate's Answer:
"${trimmedAnswer}"

Evaluate based on: technical accuracy, depth, correctness of concepts, and relevance to the question.
Give SPECIFIC feedback — name the exact concepts that are correct or missing.
Respond with ONLY valid JSON (no markdown):
{"score": <0-10 with one decimal>, "feedback": "2-3 sentences of specific, actionable feedback mentioning exact concepts", "strengths": ["exact technical strength 1"], "gaps": ["specific missing concept 1"]}`;

    const llmRes = await callLLM(GRADING_SYSTEM_PROMPT, userPrompt);

    if (llmRes.json && typeof llmRes.json.score === "number") {
      const rawScore = Math.max(0, Math.min(10, Math.round(llmRes.json.score * 10) / 10));
      const isZero = rawScore === 0;

      const result: GradeResult = {
        score: rawScore,
        feedback: llmRes.json.feedback || (isZero ? "The response provided does not answer the question." : "Solid technical explanation."),
        isZeroScore: isZero,
        strengths: isZero ? [] : (Array.isArray(llmRes.json.strengths) && llmRes.json.strengths.length ? llmRes.json.strengths : ["Demonstrates technical knowledge of the topic."]),
        gaps: isZero ? ["Did not provide relevant technical substance."] : (Array.isArray(llmRes.json.gaps) && llmRes.json.gaps.length ? llmRes.json.gaps : (rawScore < 8 ? ["Could provide deeper architectural or edge-case context."] : [])),
      };
      return NextResponse.json(result);
    }

    // 3. Deterministic Semantic Grader fallback
    const heuristicResult = evaluateSemantically(question, topic, trimmedAnswer, level);
    return NextResponse.json(heuristicResult);
  } catch (error: any) {
    console.error("Grading error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to grade answer." },
      { status: 500 }
    );
  }
}

function checkZeroScore(text: string): { isZero: boolean; reason: string; feedback: string } {
  if (!text || text.length < 5) {
    return {
      isZero: true,
      reason: "Response was empty or too short.",
      feedback: "No substantive response was provided for this question.",
    };
  }

  const lower = text.toLowerCase().replace(/[^\w\s]/g, " ").trim();
  const words = lower.split(/\s+/).filter(Boolean);

  if (words.length < 3) {
    return {
      isZero: true,
      reason: "Response contains fewer than 3 words.",
      feedback: "The response is too brief to demonstrate technical understanding.",
    };
  }

  const nonAnswers = [
    "idk", "i dont know", "i do not know", "dont know", "no idea", "no clue",
    "skip", "pass", "next question", "leave this", "not sure", "havent learned",
    "nothing", "na", "n a", "asdf", "qwerty", "hello", "hi", "testing", "test"
  ];
  if (nonAnswers.some((e) => lower === e || lower.startsWith(e + " ") || lower.endsWith(" " + e))) {
    return {
      isZero: true,
      reason: "Indicated lack of knowledge or skipped.",
      feedback: "The candidate indicated they do not know the answer to this question.",
    };
  }

  const unique = new Set(words);
  if (words.length >= 6 && unique.size / words.length < 0.3) {
    return {
      isZero: true,
      reason: "Excessive repetitive text or keyboard mash.",
      feedback: "The response is invalid or unintelligible.",
    };
  }

  return { isZero: false, reason: "", feedback: "" };
}

function evaluateSemantically(
  question: string,
  topic: string,
  answer: string,
  level: InterviewLevel
): GradeResult {
  const lowerQ = question.toLowerCase();
  const lowerT = topic.toLowerCase();
  const lowerA = answer.toLowerCase();
  const words = lowerA.split(/\s+/).filter(Boolean);

  // Extract core keywords from question
  const qWords = lowerQ
    .replace(/[^\w\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 3 && !["what", "explain", "difference", "between", "how", "would", "which", "could", "using"].includes(w));

  const matchedQWords = qWords.filter((qw) => lowerA.includes(qw));
  const relevanceRatio = qWords.length > 0 ? matchedQWords.length / qWords.length : 0.5;

  // Technical depth indicators
  const depthKeywords = [
    "mechanism", "under the hood", "complexity", "o(1)", "o(n)", "o(log n)",
    "trade-off", "tradeoff", "latency", "throughput", "memory", "performance",
    "scale", "scalable", "internals", "concurrency", "async", "cache", "index",
    "reconciliation", "lifecycle", "transaction", "acid", "immutability"
  ];
  const depthHits = depthKeywords.filter((dk) => lowerA.includes(dk));

  if (relevanceRatio === 0 && depthHits.length === 0 && words.length < 15) {
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

  if (relevanceRatio >= 0.4) {
    score += 2;
    strengths.push("Directly engages with key concepts from the question.");
  }

  if (depthHits.length > 0) {
    score += Math.min(3, depthHits.length * 1.5);
    strengths.push(`Discussed key architectural/mechanical factors (${depthHits.slice(0, 2).join(", ")}).`);
  }

  if (words.length > 40) {
    score += 1;
    strengths.push("Good descriptive structure.");
  } else if (words.length < 20) {
    score = Math.max(1, score - 2);
    gaps.push("Response is too brief to demonstrate full depth.");
  }

  // Level calibration
  if (level === "high") {
    if (depthHits.length === 0) {
      score = Math.max(2, score - 1.5);
      gaps.push("High-difficulty questions expect explicit discussion of internal mechanics, trade-offs, and scalability.");
    }
  } else if (level === "low") {
    if (relevanceRatio >= 0.3) {
      score = Math.min(10, score + 1);
    }
  }

  const finalScore = Math.min(10, Math.max(1, Math.round(score * 10) / 10));

  return {
    score: finalScore,
    feedback:
      finalScore >= 8
        ? "Strong technical explanation with sound conceptual clarity and structured reasoning."
        : finalScore >= 5
        ? "Demonstrates working knowledge of the topic, but would benefit from discussing concrete trade-offs, internal mechanics, and edge cases."
        : "Partially touches on the subject but misses critical technical depth required for this level.",
    isZeroScore: false,
    strengths: strengths.length ? strengths : ["Attempted to address the topic."],
    gaps: gaps.length ? gaps : ["Elaborate on edge cases and performance characteristics."],
  };
}

