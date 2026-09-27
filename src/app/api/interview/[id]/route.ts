// GET /api/interview/[id]
// Returns the current state of an interview session.

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const interview = await prisma.interview.findUnique({
      where: { id },
      include: {
        questions: { orderBy: { orderIndex: "asc" } },
        answers: { orderBy: { createdAt: "asc" } },
        report: true,
        resume: { select: { id: true, fileName: true, parsedData: true } },
      },
    });

    if (!interview) {
      return NextResponse.json({ error: "Interview not found." }, { status: 404 });
    }

    // Get the current active question (the last question without an answer)
    const answeredQuestionIds = new Set(interview.answers.map((a) => a.questionId));
    const currentQuestion = interview.questions.find((q) => !answeredQuestionIds.has(q.id));

    return NextResponse.json({
      id: interview.id,
      status: interview.status,
      type: interview.type,
      difficulty: interview.difficulty,
      mode: interview.mode,
      role: interview.role,
      totalQuestions: interview.totalQuestions,
      currentQuestionIndex: interview.currentQuestionIndex,
      topicsCovered: interview.topicsCovered ? JSON.parse(interview.topicsCovered) : [],
      currentQuestion: currentQuestion
        ? {
            id: currentQuestion.id,
            questionText: currentQuestion.questionText,
            category: currentQuestion.category,
            topic: currentQuestion.topic,
            difficulty: currentQuestion.difficulty,
            intent: currentQuestion.intent,
            isFollowUp: currentQuestion.isFollowUp,
            orderIndex: currentQuestion.orderIndex,
          }
        : null,
      questionsAnswered: interview.answers.length,
      resume: interview.resume
        ? { id: interview.resume.id, fileName: interview.resume.fileName }
        : null,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to fetch interview";
    console.error("Interview GET error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
