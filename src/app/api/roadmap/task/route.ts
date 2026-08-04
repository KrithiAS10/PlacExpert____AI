import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getLearningStreak } from '@/lib/learning-streak';

export async function POST(req: Request) {
  try {
    const { taskId, status } = await req.json();
    
    if (!taskId || !status) {
      return NextResponse.json({ error: "Missing taskId or status" }, { status: 400 });
    }

    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: { status }
    });

    // Find the user who owns this task
    const taskWithUser = await prisma.task.findUnique({
      where: { id: taskId },
      include: {
        phase: {
          include: {
            roadmap: {
              include: {
                user: true
              }
            }
          }
        }
      }
    });

    const user = taskWithUser?.phase?.roadmap?.user;
    
    if (user) {
      // Find all tasks for this user's roadmap
      const allTasks = await prisma.task.findMany({
        where: {
          phase: {
            roadmap: {
              userId: user.id
            }
          }
        },
        include: {
          phase: true
        }
      });

      // Recalculate streak and readiness score based on actual task performance
      const totalTasksCount = allTasks.length;
      const completedTasks = allTasks.filter(t => t.status === "COMPLETED");
      const completedTasksCount = completedTasks.length;

      // A streak is based on real learning activity on consecutive calendar
      // days, not on the scheduled position of completed tasks.
      const learningActivity = await prisma.solvedProblem.findMany({
        where: { userId: user.id },
        select: { solvedAt: true }
      });
      const { streak: streakCount } = getLearningStreak(
        learningActivity.map((activity) => activity.solvedAt)
      );

      // Base readiness score from profiling level
      const rawReadiness = user.readinessLevel || "Just Starting";
      let baselineScore = 2.0;
      if (rawReadiness === "Learning Basics") baselineScore = 4.0;
      else if (rawReadiness === "Actively Practicing") baselineScore = 6.0;
      else if (rawReadiness === "Ready for Interviews") baselineScore = 8.0;

      // Dynamic performance boost: ratio of completed tasks scaled to 10.0 max score
      const progressBoost = totalTasksCount > 0 
        ? (completedTasksCount / totalTasksCount) * (10.0 - baselineScore) 
        : 0;

      const newReadinessScore = completedTasksCount === 0 
        ? baselineScore 
        : Math.min(10.0, Number((baselineScore + progressBoost).toFixed(1)));

      // Move the active roadmap day to the start of the next course. Task day
      // values are course deadlines: 2 means Days 1–2, 4 means Days 3–4, etc.
      const sortedTasks = [...allTasks].sort((a, b) => {
        if (!a.phase || !b.phase) return 0;
        if (a.phase.order !== b.phase.order) return a.phase.order - b.phase.order;
        return (a.day ?? 0) - (b.day ?? 0);
      });
      const nextPendingIndex = sortedTasks.findIndex((task) => task.status !== "COMPLETED");
      const nextDay = nextPendingIndex === -1
        ? user.currentDay
        : nextPendingIndex === 0
        ? 1
        : sortedTasks[nextPendingIndex - 1].day + 1;

      // Persist updated metrics
      await prisma.user.update({
        where: { id: user.id },
        data: {
          currentDay: nextDay,
          streak: streakCount,
          readinessScore: newReadinessScore
        }
      });
      
      // Save snapshot of readiness score to history
      await prisma.analytics.create({
        data: {
          userId: user.id,
          metric: "Readiness",
          value: newReadinessScore
        }
      });
    }

    return NextResponse.json({ success: true, task: updatedTask });
  } catch (err: any) {
    console.error("Failed to update task:", err);
    return NextResponse.json({ error: err.message || "Failed to update task" }, { status: 500 });
  }
}
