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

    if (user && status === "COMPLETED") {
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

      // Update currentDay and increment streak
      await prisma.user.update({
        where: { id: user.id },
        data: {
          currentDay: nextDay,
          streak: { increment: 1 }
        }
      });
    }

    return NextResponse.json({ success: true, task: updatedTask });
  } catch (err: any) {
    console.error("Failed to update task:", err);
    return NextResponse.json({ error: err.message || "Failed to update task" }, { status: 500 });
  }
}
