import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';

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

    const user = taskWithUser?.phase.roadmap.user;
    
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

      // Recalculate readiness score based on completed tasks
      const totalTasks = allTasks.length;
      const completedTasksCount = allTasks.filter(t => t.status === "COMPLETED").length;

      const rawReadiness = user.readinessLevel || "Just Starting";
      let baselineScore = 3.2;
      if (rawReadiness === "Just Starting") baselineScore = 2.0;
      else if (rawReadiness === "Learning Basics") baselineScore = 4.2;
      else if (rawReadiness === "Actively Practicing") baselineScore = 6.5;
      else if (rawReadiness === "Ready for Interviews") baselineScore = 8.8;

      const completionRate = totalTasks > 0 ? completedTasksCount / totalTasks : 0;
      const newReadinessScore = baselineScore + completionRate * (10.0 - baselineScore);

      if (status === "COMPLETED") {
        // Sort tasks by phase order, then day
        const sortedTasks = allTasks.sort((a, b) => {
          if (a.phase.order !== b.phase.order) {
            return a.phase.order - b.phase.order;
          }
          return a.day - b.day;
        });

        // Find the next pending task in sequence
        const nextPending = sortedTasks.find(t => t.id !== taskId && t.status !== "COMPLETED");
        const nextDay = nextPending ? nextPending.day : user.currentDay;

        // Update currentDay, increment streak, and update readinessScore
        await prisma.user.update({
          where: { id: user.id },
          data: {
            currentDay: nextDay,
            streak: { increment: 1 },
            readinessScore: newReadinessScore
          }
        });
      } else {
        // Just update readinessScore
        await prisma.user.update({
          where: { id: user.id },
          data: {
            readinessScore: newReadinessScore
          }
        });
      }
      
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
