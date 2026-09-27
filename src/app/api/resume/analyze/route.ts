// POST /api/resume/analyze
// Takes a resumeId, runs AI analysis, stores result, returns analysis.

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { analyzeResume } from "@/lib/interview/resume-analyzer";
import type { ParsedResume } from "@/lib/interview/types";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { resumeId } = await req.json();

    if (!resumeId) {
      return NextResponse.json({ error: "resumeId is required." }, { status: 400 });
    }

    const resume = await prisma.resume.findUnique({ where: { id: resumeId } });
    if (!resume) {
      return NextResponse.json({ error: "Resume not found." }, { status: 404 });
    }

    // If already analyzed, return cached
    if (resume.analysis) {
      return NextResponse.json({
        success: true,
        resumeId,
        analysis: JSON.parse(resume.analysis),
      });
    }

    const parsedData = JSON.parse(resume.parsedData) as ParsedResume;
    const analysis = await analyzeResume(parsedData, resume.rawText);

    // Save analysis
    await prisma.resume.update({
      where: { id: resumeId },
      data: { analysis: JSON.stringify(analysis) },
    });

    return NextResponse.json({ success: true, resumeId, analysis });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Analysis failed";
    console.error("Resume analysis error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
