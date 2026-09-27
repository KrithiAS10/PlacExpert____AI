// POST /api/interview/start
// Creates a new interview session, generates the first question.

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateFirstQuestion } from "@/lib/interview/question-generator";
import { analyzeResume } from "@/lib/interview/resume-analyzer";
import { cookies } from "next/headers";
import type { ParsedResume, ResumeAnalysis, InterviewConfig } from "@/lib/interview/types";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      resumeId,
      interviewType = "Technical",
      difficulty = "Medium",
      mode = "Text",
      totalQuestions = 5,
      targetRole,
    } = body as {
      resumeId?: string;
      interviewType?: InterviewConfig["interviewType"];
      difficulty?: InterviewConfig["difficulty"];
      mode?: string;
      totalQuestions?: number;
      targetRole?: string;
    };

    if (!resumeId) {
      return NextResponse.json({ error: "resumeId is required." }, { status: 400 });
    }

    const resumeRecord = await prisma.resume.findUnique({ where: { id: resumeId } });
    if (!resumeRecord) {
      return NextResponse.json({ error: "Resume not found." }, { status: 404 });
    }

    // Get or generate analysis
    let analysis: ResumeAnalysis;
    if (resumeRecord.analysis) {
      analysis = JSON.parse(resumeRecord.analysis) as ResumeAnalysis;
    } else {
      const parsedData = JSON.parse(resumeRecord.parsedData) as ParsedResume;
      analysis = await analyzeResume(parsedData, resumeRecord.rawText);
      await prisma.resume.update({ where: { id: resumeId }, data: { analysis: JSON.stringify(analysis) } });
    }

    const parsedResume = JSON.parse(resumeRecord.parsedData) as ParsedResume;

    const config: InterviewConfig = {
      interviewType,
      difficulty,
      mode: mode as "Text" | "Voice",
      totalQuestions: Math.max(1, Math.min(20, totalQuestions)),
      targetRole,
    };

    // Generate first question
    const firstQuestion = await generateFirstQuestion(parsedResume, analysis, config);

    // Get userId from cookie
    const cookieStore = await cookies();
    const userEmail = cookieStore.get("user_email")?.value;
    let userId: string | null = null;
    if (userEmail) {
      const user = await prisma.user.findUnique({ where: { email: userEmail }, select: { id: true } });
      userId = user?.id ?? null;
    }

    // Create interview in DB
    const interview = await prisma.interview.create({
      data: {
        userId,
        resumeId,
        role: targetRole,
        type: interviewType,
        difficulty,
        mode,
        totalQuestions: config.totalQuestions,
        currentQuestionIndex: 0,
        status: "IN_PROGRESS",
        topicsCovered: JSON.stringify([]),
      },
    });

    // Save the first question
    const dbQuestion = await prisma.interviewQuestion.create({
      data: {
        interviewId: interview.id,
        orderIndex: 0,
        questionText: firstQuestion.question,
        category: firstQuestion.category,
        topic: firstQuestion.topic ?? "",
        difficulty: firstQuestion.difficulty,
        intent: firstQuestion.intent ?? "",
        isFollowUp: false,
        reason: firstQuestion.reason,
      },
    });

    return NextResponse.json({
      success: true,
      interviewId: interview.id,
      question: {
        id: dbQuestion.id,
        questionText: dbQuestion.questionText,
        category: dbQuestion.category,
        topic: dbQuestion.topic,
        difficulty: dbQuestion.difficulty,
        intent: dbQuestion.intent,
        isFollowUp: dbQuestion.isFollowUp,
        orderIndex: dbQuestion.orderIndex,
      },
      config,
      totalQuestions: config.totalQuestions,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to start interview";
    console.error("Interview start error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
