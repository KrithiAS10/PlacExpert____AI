// POST /api/interview/[id]/answer
// Submits an answer to the current question, evaluates it, then generates the next question.

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { evaluateAnswer } from "@/lib/interview/answer-evaluator";
import { generateNextQuestion } from "@/lib/interview/question-generator";
import type { ParsedResume, ResumeAnalysis, InterviewConfig, GeneratedQuestion, QAPair } from "@/lib/interview/types";

export const dynamic = "force-dynamic";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: interviewId } = await params;
    const body = await req.json();
    const { questionId, answer, durationSeconds = 0 } = body as {
      questionId: string;
      answer: string;
      durationSeconds?: number;
    };

    if (!questionId || !answer?.trim()) {
      return NextResponse.json({ error: "questionId and answer are required." }, { status: 400 });
    }

    // Load interview with resume and history
    const interview = await prisma.interview.findUnique({
      where: { id: interviewId },
      include: {
        questions: { orderBy: { orderIndex: "asc" } },
        answers: { include: { question: true }, orderBy: { createdAt: "asc" } },
        resume: true,
      },
    });

    if (!interview) {
      return NextResponse.json({ error: "Interview not found." }, { status: 404 });
    }

    if (interview.status === "COMPLETED" || interview.status === "CANCELLED") {
      return NextResponse.json({ error: "Interview is already finished." }, { status: 400 });
    }

    // Find the question being answered
    const question = interview.questions.find((q) => q.id === questionId);
    if (!question) {
      return NextResponse.json({ error: "Question not found in this interview." }, { status: 404 });
    }

    // Check if already answered
    const alreadyAnswered = interview.answers.some((a) => a.questionId === questionId);
    if (alreadyAnswered) {
      return NextResponse.json({ error: "This question has already been answered." }, { status: 400 });
    }

    const parsedResume = JSON.parse(interview.resume?.parsedData ?? "{}") as ParsedResume;
    const analysisRaw = interview.resume?.analysis;
    const analysis: ResumeAnalysis = analysisRaw
      ? JSON.parse(analysisRaw)
      : {
          strongestSkills: parsedResume.skills.slice(0, 5),
          technicalAreas: [],
          projectSummaries: [],
          experienceLevel: "fresher" as const,
          potentialInterviewTopics: [],
          testableSkills: [],
          weakAreas: [],
          overallProfileSummary: "",
        };

    const generatedQ: GeneratedQuestion = {
      question: question.questionText,
      category: question.category as GeneratedQuestion["category"],
      topic: question.topic ?? "",
      difficulty: question.difficulty as GeneratedQuestion["difficulty"],
      intent: question.intent ?? undefined,
      isFollowUp: question.isFollowUp,
      reason: question.reason ?? "",
    };

    // Evaluate the answer
    const evaluation = await evaluateAnswer(generatedQ, answer.trim(), parsedResume, durationSeconds);

    // Save answer to DB
    const savedAnswer = await prisma.interviewAnswer.create({
      data: {
        interviewId,
        questionId,
        answerText: answer.trim(),
        score: evaluation.score,
        technicalCorrectness: evaluation.technicalCorrectness,
        relevance: evaluation.relevance,
        clarity: evaluation.clarity,
        completeness: evaluation.completeness,
        confidence: evaluation.confidence,
        feedback: evaluation.feedback,
        strengths: JSON.stringify(evaluation.strengths),
        weaknesses: JSON.stringify(evaluation.weaknesses),
        knowledgeGaps: JSON.stringify(evaluation.knowledgeGaps),
        durationSeconds,
      },
    });

    const totalAnswered = interview.answers.length + 1;
    const isComplete = totalAnswered >= interview.totalQuestions;

    // Update topics covered
    const existingTopics: string[] = interview.topicsCovered ? JSON.parse(interview.topicsCovered) : [];
    const updatedTopics = Array.from(new Set([...existingTopics, question.topic ?? ""])).filter(Boolean);

    // Build history for next question generation
    const history: QAPair[] = [
      ...interview.answers.map((a) => ({
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
      })),
      {
        question: question.questionText,
        answer: answer.trim(),
        category: question.category,
        topic: question.topic ?? "",
        score: evaluation.score,
        evaluation,
      },
    ];

    let nextQuestion = null;

    if (!isComplete) {
      const config: InterviewConfig = {
        interviewType: interview.type as InterviewConfig["interviewType"],
        difficulty: interview.difficulty as InterviewConfig["difficulty"],
        mode: interview.mode as "Text" | "Voice",
        totalQuestions: interview.totalQuestions,
        targetRole: interview.role ?? undefined,
      };

      const nextQ = await generateNextQuestion(
        parsedResume,
        analysis,
        config,
        history,
        question.difficulty as "Easy" | "Medium" | "Hard"
      );

      const newDbQuestion = await prisma.interviewQuestion.create({
        data: {
          interviewId,
          orderIndex: interview.questions.length,
          questionText: nextQ.nextQuestion,
          category: nextQ.category,
          topic: nextQ.topic ?? "",
          difficulty: nextQ.difficulty,
          intent: nextQ.intent ?? "",
          isFollowUp: nextQ.isFollowUp,
          reason: nextQ.reason,
        },
      });

      nextQuestion = {
        id: newDbQuestion.id,
        questionText: newDbQuestion.questionText,
        category: newDbQuestion.category,
        topic: newDbQuestion.topic,
        difficulty: newDbQuestion.difficulty,
        intent: newDbQuestion.intent,
        isFollowUp: newDbQuestion.isFollowUp,
        orderIndex: newDbQuestion.orderIndex,
      };
    }

    // Update interview state
    await prisma.interview.update({
      where: { id: interviewId },
      data: {
        currentQuestionIndex: totalAnswered,
        status: isComplete ? "COMPLETED" : "IN_PROGRESS",
        topicsCovered: JSON.stringify(updatedTopics),
      },
    });

    return NextResponse.json({
      success: true,
      answerId: savedAnswer.id,
      evaluation: {
        score: evaluation.score,
        feedback: evaluation.feedback,
        strengths: evaluation.strengths,
        weaknesses: evaluation.weaknesses,
        knowledgeGaps: evaluation.knowledgeGaps,
        resumeConsistency: evaluation.resumeConsistency,
      },
      isComplete,
      questionsAnswered: totalAnswered,
      totalQuestions: interview.totalQuestions,
      nextQuestion,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to submit answer";
    console.error("Answer submission error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
