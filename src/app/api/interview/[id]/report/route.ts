// GET /api/interview/[id]/report
// Generates (or returns cached) the final interview report.

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateInterviewReport } from "@/lib/interview/report-generator";
import type { ParsedResume, ResumeAnalysis, InterviewConfig, QAPair } from "@/lib/interview/types";

export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: interviewId } = await params;

    const interview = await prisma.interview.findUnique({
      where: { id: interviewId },
      include: {
        questions: { orderBy: { orderIndex: "asc" } },
        answers: { include: { question: true }, orderBy: { createdAt: "asc" } },
        report: true,
        resume: true,
      },
    });

    if (!interview) {
      return NextResponse.json({ error: "Interview not found." }, { status: 404 });
    }

    // Return cached report if exists
    if (interview.report) {
      return NextResponse.json({
        success: true,
        interviewId,
        report: {
          overallScore: interview.report.overallScore,
          technicalScore: interview.report.technicalScore,
          communicationScore: interview.report.communicationScore,
          problemSolvingScore: interview.report.problemSolvingScore,
          resumeKnowledgeScore: interview.report.resumeKnowledgeScore,
          confidenceScore: interview.report.confidenceScore,
          summary: interview.report.summary,
          strengths: interview.report.strengths ? JSON.parse(interview.report.strengths) : [],
          weaknesses: interview.report.weaknesses ? JSON.parse(interview.report.weaknesses) : [],
          knowledgeGaps: interview.report.knowledgeGaps ? JSON.parse(interview.report.knowledgeGaps) : [],
          resumePerformance: interview.report.resumePerformance ? JSON.parse(interview.report.resumePerformance) : [],
          improvementSuggestions: interview.report.improvementSuggestions ? JSON.parse(interview.report.improvementSuggestions) : [],
          preparationTopics: interview.report.preparationTopics ? JSON.parse(interview.report.preparationTopics) : [],
        },
        interviewMeta: {
          type: interview.type,
          difficulty: interview.difficulty,
          role: interview.role,
          totalQuestions: interview.answers.length,
          createdAt: interview.createdAt,
        },
      });
    }

    if (interview.answers.length === 0) {
      return NextResponse.json({ error: "No answers recorded for this interview." }, { status: 400 });
    }

    const parsedResume = JSON.parse(interview.resume?.parsedData ?? "{}") as ParsedResume;
    const analysisRaw = interview.resume?.analysis;
    const analysis: ResumeAnalysis = analysisRaw
      ? JSON.parse(analysisRaw)
      : {
          strongestSkills: parsedResume.skills?.slice(0, 5) ?? [],
          technicalAreas: [],
          projectSummaries: [],
          experienceLevel: "fresher" as const,
          potentialInterviewTopics: [],
          testableSkills: [],
          weakAreas: [],
          overallProfileSummary: "",
        };

    const config: InterviewConfig = {
      interviewType: interview.type as InterviewConfig["interviewType"],
      difficulty: interview.difficulty as InterviewConfig["difficulty"],
      mode: interview.mode as "Text" | "Voice",
      totalQuestions: interview.totalQuestions,
      targetRole: interview.role ?? undefined,
    };

    const history: QAPair[] = interview.answers.map((a) => ({
      question: a.question.questionText,
      answer: a.answerText,
      category: a.question.category,
      topic: a.question.topic ?? "",
      score: a.score,
      evaluation: {
        score: a.score,
        technicalCorrectness: a.technicalCorrectness,
        relevance: a.relevance,
        clarity: a.clarity,
        completeness: a.completeness,
        confidence: a.confidence,
        strengths: a.strengths ? JSON.parse(a.strengths) : [],
        weaknesses: a.weaknesses ? JSON.parse(a.weaknesses) : [],
        knowledgeGaps: a.knowledgeGaps ? JSON.parse(a.knowledgeGaps) : [],
        feedback: a.feedback ?? "",
      },
    }));

    const report = await generateInterviewReport(parsedResume, analysis, config, history);

    // Save report to DB
    await prisma.interviewReport.create({
      data: {
        interviewId,
        overallScore: report.overallScore,
        technicalScore: report.technicalScore,
        communicationScore: report.communicationScore,
        problemSolvingScore: report.problemSolvingScore,
        resumeKnowledgeScore: report.resumeKnowledgeScore,
        confidenceScore: report.confidenceScore,
        summary: report.summary,
        strengths: JSON.stringify(report.strengths),
        weaknesses: JSON.stringify(report.weaknesses),
        knowledgeGaps: JSON.stringify(report.knowledgeGaps),
        resumePerformance: JSON.stringify(report.resumePerformance),
        improvementSuggestions: JSON.stringify(report.improvementSuggestions),
        preparationTopics: JSON.stringify(report.preparationTopics),
      },
    });

    // Mark interview as COMPLETED if not already
    if (interview.status !== "COMPLETED") {
      await prisma.interview.update({ where: { id: interviewId }, data: { status: "COMPLETED" } });
    }

    // Update user analytics & readiness score in real time
    const userId = interview.userId;
    if (userId) {
      const now = new Date();
      await prisma.analytics.createMany({
        data: [
          {
            userId,
            date: now,
            metric: "mock_interview_score",
            value: report.overallScore,
          },
          {
            userId,
            date: now,
            metric: "mock_interview_readiness",
            value: Math.round(report.overallScore * 10),
          },
          {
            userId,
            date: now,
            metric: "mock_interview_questions",
            value: history.length,
          },
          {
            userId,
            date: now,
            metric: "Readiness",
            value: Number(report.overallScore.toFixed(1)),
          },
        ],
      });

      await prisma.activity.create({
        data: {
          userId,
          action: `Completed ${interview.type} AI Interview (${interview.difficulty}) — Score: ${report.overallScore}/10`,
          status: report.overallScore >= 7 ? "STRONG" : report.overallScore >= 5 ? "AVERAGE" : "NEEDS_WORK",
          timestamp: now,
        },
      });

      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (user && report.overallScore > (user.readinessScore || 0)) {
        await prisma.user.update({
          where: { id: userId },
          data: { readinessScore: Number(report.overallScore.toFixed(1)) },
        });
      }
    }

    return NextResponse.json({
      success: true,
      interviewId,
      report,
      interviewMeta: {
        type: interview.type,
        difficulty: interview.difficulty,
        role: interview.role,
        totalQuestions: interview.answers.length,
        createdAt: interview.createdAt,
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to generate report";
    console.error("Report generation error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
