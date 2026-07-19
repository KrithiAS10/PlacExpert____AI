import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

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

    // If a task is marked completed, let's also increment user streak/currentDay if it matches the current day
    const userEmail = "krithi@example.com";
    const user = await prisma.user.findUnique({
      where: { email: userEmail }
    });

    if (user && updatedTask.day === user.currentDay && status === "COMPLETED") {
      // Auto advance to next day
      await prisma.user.update({
        where: { id: user.id },
        data: {
          currentDay: { increment: 1 },
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
