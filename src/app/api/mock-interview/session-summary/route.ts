// src/app/api/mock-interview/session-summary/route.ts
import { NextResponse } from "next/server";
import { type InterviewRecord, type SessionSummary, type InterviewLevel } from "@/lib/adaptive-interview";
import { callLLM, SESSION_SUMMARY_SYSTEM_PROMPT } from "@/lib/llm-service";

export const dynamic = "force-dynamic";

interface SummaryRequest {
  records: InterviewRecord[];
  level: InterviewLevel;
  profileSummary?: string;
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as SummaryRequest;
    const { records = [], level = "mid", profileSummary = "" } = body;

    if (!records || records.length === 0) {
      return NextResponse.json(
        { error: "No interview records provided." },
        { status: 400 }
      );
    }

    const totalQuestions = records.length;
    const totalScore = records.reduce((sum, r) => sum + (r.score || 0), 0);
    const averageScore = Math.round((totalScore / totalQuestions) * 10) / 10;
    const readinessPercent = Math.min(100, Math.round((averageScore / 10) * 100));

    // Build detailed per-question summary for LLM
    const questionSummary = records.map((r, i) =>
      `Q${i + 1} [${r.topic}] (Score: ${r.score}/10): "${r.question}"
   Answer summary: "${r.answer.slice(0, 200)}..."
   Feedback: "${r.feedback}"`
    ).join("\n\n");

    // Generate full summary via LLM
    const prompt = `Summarize this mock technical interview performance for a hiring manager report.

Candidate Profile: ${profileSummary || "Software Engineer"}
Difficulty Level: ${level}
Average Score: ${averageScore}/10 (${readinessPercent}% readiness)
Total Questions: ${totalQuestions}

Per-Question Performance:
${questionSummary}

Identify specific topics of strength and weakness. Be direct and specific — use topic names.
Generate:
- readinessNote: 2-3 sentences honest executive summary of readiness
- strengths: 3-4 specific topics/skills the candidate demonstrated well
- targetAreas: 3-4 specific topics/concepts to improve

Respond with ONLY valid JSON (no markdown):
{"readinessNote": "...", "strengths": ["...", "...", "..."], "targetAreas": ["...", "...", "..."]}`;

    const llmRes = await callLLM(SESSION_SUMMARY_SYSTEM_PROMPT, prompt);

    let readinessNote = "";
    let strengths: string[] = [];
    let targetAreas: string[] = [];

    if (llmRes.json) {
      if (llmRes.json.readinessNote) readinessNote = llmRes.json.readinessNote;
      if (Array.isArray(llmRes.json.strengths) && llmRes.json.strengths.length)
        strengths = llmRes.json.strengths;
      if (Array.isArray(llmRes.json.targetAreas) && llmRes.json.targetAreas.length)
        targetAreas = llmRes.json.targetAreas;
    }

    // Fallback if LLM unavailable
    if (!readinessNote) {
      if (averageScore >= 8) {
        readinessNote = `Outstanding performance at ${level.toUpperCase()} difficulty — strong architectural understanding, precise technical accuracy, and well-structured reasoning across all topics. Highly interview-ready.`;
      } else if (averageScore >= 6) {
        readinessNote = `Solid foundational grasp with good domain intuition at ${level.toUpperCase()} difficulty. Focus on elaborating trade-offs, internal mechanics, and real-world edge cases to reach high-tier readiness.`;
      } else if (averageScore >= 4) {
        readinessNote = `Shows partial understanding but lacks depth in several areas at ${level.toUpperCase()} difficulty. Targeted revision on core concepts, direct question alignment, and structured problem-solving is recommended.`;
      } else {
        readinessNote = `Needs significant preparation before technical interview rounds. Review fundamentals, practice explaining concepts clearly, and work through more mock sessions on core topics.`;
      }
    }

    // Fallback strengths/gaps from records if LLM didn't produce them
    if (strengths.length === 0) {
      const strongRecords = records.filter((r) => r.score >= 7);
      strengths = strongRecords.length > 0
        ? Array.from(new Set(strongRecords.map((r) => `Strong understanding of ${r.topic}`))).slice(0, 4)
        : ["Consistent technical engagement throughout the session"];
    }

    if (targetAreas.length === 0) {
      const weakRecords = records.filter((r) => r.score < 6);
      targetAreas = weakRecords.length > 0
        ? Array.from(new Set(weakRecords.map((r) => `Deepen preparation in ${r.topic}`))).slice(0, 4)
        : ["Practice articulating architectural trade-offs", "Work on edge case coverage in answers"];
    }

    const summary: SessionSummary = {
      averageScore,
      readinessPercent,
      readinessNote,
      totalQuestions,
      records,
      strengths: Array.from(new Set(strengths)).slice(0, 4),
      targetAreas: Array.from(new Set(targetAreas)).slice(0, 4),
      level,
    };

    return NextResponse.json(summary);
  } catch (error: any) {
    console.error("Session summary error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to generate session summary." },
      { status: 500 }
    );
  }
}
