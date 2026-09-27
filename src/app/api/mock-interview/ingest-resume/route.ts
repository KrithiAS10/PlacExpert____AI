// src/app/api/mock-interview/ingest-resume/route.ts
import { NextResponse } from "next/server";
import { parseResumeHeuristic, type ResumeProfile } from "@/lib/adaptive-interview";
import { callLLM } from "@/lib/llm-service";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { resumeText } = body as { resumeText: string };

    if (!resumeText || typeof resumeText !== "string" || !resumeText.trim()) {
      return NextResponse.json(
        { error: "Please provide resume text for parsing." },
        { status: 400 }
      );
    }

    // Try parsing with LLM first for superior extraction
    const prompt = `You are a resume parsing assistant. Extract technical information from the following resume text into a clean JSON object.
Format:
{
  "skills": ["Skill1", "Skill2", ...],
  "frameworks": ["Framework1", ...],
  "languages": ["Language1", ...],
  "tools": ["Tool1", ...],
  "domains": ["Domain1", ...],
  "summary": "Short 2-3 sentence profile summary describing key technical focus, projects, and estimated experience level",
  "experienceLevel": "Entry" | "Mid" | "Senior" | "Fresher"
}

Resume Text:
${resumeText.slice(0, 5000)}`;

    const response = await callLLM("You are a strict, structured resume extraction JSON engine.", prompt);

    if (response.json && Array.isArray(response.json.skills)) {
      const parsed: ResumeProfile = {
        rawText: resumeText,
        skills: response.json.skills || [],
        frameworks: response.json.frameworks || [],
        languages: response.json.languages || [],
        tools: response.json.tools || [],
        domains: response.json.domains || [],
        summary: response.json.summary || "Parsed candidate profile.",
        experienceLevel: response.json.experienceLevel || "Entry",
      };
      return NextResponse.json({ success: true, profile: parsed });
    }

    // Fallback heuristic parsing
    const heuristicProfile = parseResumeHeuristic(resumeText);
    return NextResponse.json({ success: true, profile: heuristicProfile });
  } catch (error: any) {
    console.error("Resume ingestion error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to parse resume." },
      { status: 500 }
    );
  }
}
