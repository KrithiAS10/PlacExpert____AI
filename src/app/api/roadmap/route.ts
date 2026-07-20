import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const userEmail = cookieStore.get('user_email')?.value;
    
    if (!userEmail) {
      return NextResponse.json({ user: null, roadmap: null });
    }
    const user = await prisma.user.findUnique({
      where: { email: userEmail },
      include: {
        roadmaps: {
          orderBy: { createdAt: 'desc' },
          include: {
            phases: {
              orderBy: { order: 'asc' },
              include: {
                tasks: {
                  orderBy: { day: 'asc' }
                }
              }
            }
          }
        }
      }
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const activeRoadmap = user.roadmaps[0] || null;

    // Dynamically compile weak areas based on coreCsStrength and other answers
    const weakAreas: { name: string; reason: string; severity: string }[] = [];
    if (user.coreCsStrength !== "DSA") {
      weakAreas.push({ name: "DSA & Algorithmic Thinking", reason: "Not selected as core strength", severity: "HIGH" });
    }
    if (user.coreCsStrength !== "DBMS") {
      weakAreas.push({ name: "SQL & Relational Databases", reason: "Needs additional practice", severity: "HIGH" });
    }
    if (user.coreCsStrength !== "OS") {
      weakAreas.push({ name: "OS Scheduling & Memory", reason: "Average performance in assessments", severity: "MED" });
    }
    if (user.coreCsStrength !== "Networking") {
      weakAreas.push({ name: "Computer Networking", reason: "Basic knowledge level", severity: "MED" });
    }

    return NextResponse.json({
      user: {
        name: user.name,
        email: user.email,
        readinessScore: user.readinessScore,
        currentDay: user.currentDay,
        streak: user.streak,
        readinessLevel: user.readinessLevel,
        domainInterest: user.domainInterest,
        targetCompany: user.targetCompany,
        coreCsStrength: user.coreCsStrength,
        codingPlatform: user.codingPlatform,
        projects: user.projects,
        aptitude: user.aptitude,
        communication: user.communication,
        dailyStudyTime: user.dailyStudyTime,
        preferredLang: user.preferredLang,
        placementTimeline: user.placementTimeline
      },
      roadmap: activeRoadmap,
      weakAreas
    });
  } catch (err: any) {
    console.error("Failed to fetch roadmap:", err);
    return NextResponse.json({ error: "Failed to fetch roadmap" }, { status: 500 });
  }
}
