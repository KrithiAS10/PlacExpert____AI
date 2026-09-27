import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { getLearningStreak } from '@/lib/learning-streak';

const REQUIRED_SOLVED_COUNT = 5;

export async function POST(req: Request) {
  try {
    const { taskId, proofUrl, notes } = await req.json();

    if (!taskId) {
      return NextResponse.json({ error: "Missing taskId" }, { status: 400 });
    }

    const cookieStore = await cookies();
    const userEmail = cookieStore.get('user_email')?.value;

    if (!userEmail) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: userEmail }
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Verify the task exists
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: {
        _count: { select: { solvedProblems: true } },
        phase: { include: { roadmap: true } }
      }
    });

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    // Verify the task belongs to this user's roadmap
    if (!task.phase || task.phase.roadmap.userId !== user.id) {
      return NextResponse.json({ error: "Task does not belong to this user" }, { status: 403 });
    }

    // Check how many problems the user has already solved for this task
    const currentCount = await prisma.solvedProblem.count({
      where: { userId: user.id, taskId }
    });

    if (currentCount >= REQUIRED_SOLVED_COUNT) {
      return NextResponse.json({
        success: true,
        solvedCount: currentCount,
        required: REQUIRED_SOLVED_COUNT,
        quizUnlocked: true,
        message: "Already completed enough items — quiz is unlocked"
      });
    }

    // Create a new solved problem record with proof
    await prisma.solvedProblem.create({
      data: {
        userId: user.id,
        taskId,
        proofUrl: proofUrl || null,
        notes: notes || null
      }
    });

    const learningActivity = await prisma.solvedProblem.findMany({
      where: { userId: user.id },
      select: { solvedAt: true }
    });
    const { streak } = getLearningStreak(learningActivity.map((activity) => activity.solvedAt));
    await prisma.user.update({ where: { id: user.id }, data: { streak } });

    const newCount = currentCount + 1;
    const quizUnlocked = newCount >= REQUIRED_SOLVED_COUNT;

    return NextResponse.json({
      success: true,
      solvedCount: newCount,
      required: REQUIRED_SOLVED_COUNT,
      quizUnlocked,
      message: quizUnlocked
        ? "All items completed! Quiz is now unlocked 🎉"
        : `Item ${newCount}/${REQUIRED_SOLVED_COUNT} recorded`
    });
  } catch (err: unknown) {
    console.error("Failed to record solved problem:", err);
    const message = err instanceof Error ? err.message : "Failed to record solved problem";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
