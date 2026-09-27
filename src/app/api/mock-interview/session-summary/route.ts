// src/app/api/mock-interview/session-summary/route.ts
import { NextResponse } from "next/server";
import { type InterviewRecord, type SessionSummary, type InterviewLevel } from "@/lib/adaptive-interview";
import { callLLM } from "@/lib/llm-service";

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

    // Gather strengths and target areas
    const strongRecords = records.filter((r) => r.score >= 7);
    const weakRecords = records.filter((r) => r.score < 6);

    const strengths: string[] = [];
    strongRecords.forEach((r) => {
      strengths.push(`Strong mastery in ${r.topic}`);
    });

    const targetAreas: string[] = [];
    weakRecords.forEach((r) => {
      targetAreas.push(`Deepen preparation on ${r.topic}`);
    });

    // Generate summary note via LLM if available
    let readinessNote = "";
    const prompt = `Generate a concise 2-sentence executive summary of a candidate's mock interview performance.
Details:
- Average Score: ${averageScore} / 10
- Total Questions: ${totalQuestions}
- Difficulty Level: ${level}
- Strengths: ${strengths.join(", ") || "Consistent attempts"}
- Improvement Areas: ${targetAreas.join(", ") || "Minor refinements in depth"}
Respond with ONLY valid JSON: {"readinessNote": "..."}`;

    const llmRes = await callLLM("You are a senior technical hiring evaluator.", prompt);

    if (llmRes.json && llmRes.json.readinessNote) {
      readinessNote = llmRes.json.readinessNote;
    } else {
      if (averageScore >= 8) {
        readinessNote = `Outstanding performance at ${level.toUpperCase()} difficulty. Demonstrates strong architectural understanding, clear communication, and precise technical accuracy. Highly ready for technical interview rounds.`;
      } else if (averageScore >= 5.5) {
        readinessNote = `Solid foundational grasp at ${level.toUpperCase()} difficulty with good domain intuition. Focus on elaborating trade-offs, internal mechanics, and real-world edge cases to reach high-tier readiness.`;
      } else {
        readinessNote = `Needs targeted revision on core technical concepts and direct question alignment. Review weak domains and practice structured problem-solving before scheduling company interviews.`;
      }
    }

    const summary: SessionSummary = {
      averageScore,
      readinessPercent,
      readinessNote,
      totalQuestions,
      records,
      strengths: strengths.length ? Array.from(new Set(strengths)).slice(0, 4) : ["Good engagement during technical session"],
      targetAreas: targetAreas.length ? Array.from(new Set(targetAreas)).slice(0, 4) : ["Keep practicing advanced system design and performance trade-offs"],
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
