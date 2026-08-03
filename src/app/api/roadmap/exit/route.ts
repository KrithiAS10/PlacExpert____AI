import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';

export async function POST() {
  try {
    const cookieStore = await cookies();
    const userEmail = cookieStore.get('user_email')?.value;
    
    if (!userEmail) {
      return NextResponse.json({ error: "User session not found" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: userEmail }
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // 1. Delete user's solved problems, tasks, phases, and roadmaps
    await prisma.solvedProblem.deleteMany({
      where: { userId: user.id }
    });

    await prisma.task.deleteMany({
      where: {
        phase: {
          roadmap: {
            userId: user.id
          }
        }
      }
    });

    await prisma.phase.deleteMany({
      where: {
        roadmap: {
          userId: user.id
        }
      }
    });

    await prisma.roadmap.deleteMany({
      where: { userId: user.id }
    });

    // 2. Reset user profiling and readiness stats
    await prisma.user.update({
      where: { id: user.id },
      data: {
        readinessScore: 0.0,
        currentDay: 1,
        streak: 0,
        readinessLevel: null,
        domainInterest: null,
        targetCompany: null,
        academicYear: null,
        dsaCount: null,
        projects: null,
        coreCsStrength: null,
        codingPlatform: null,
        aptitude: null,
        communication: null,
        mockInterviewExp: null,
        codingConfidence: null,
        dailyStudyTime: null,
        preferredLang: null,
        placementTimeline: null
      }
    });

    // 3. Log activity
    await prisma.activity.create({
      data: {
        userId: user.id,
        action: "Discontinued current roadmap & reset profiling assessment",
        status: "SUCCESS"
      }
    });

    return NextResponse.json({
      success: true,
      message: "Roadmap discontinued and profiling reset successfully"
    });
  } catch (err: any) {
    console.error("Error exiting roadmap:", err);
    return NextResponse.json({ error: err.message || "Failed to discontinue roadmap" }, { status: 500 });
  }
}
