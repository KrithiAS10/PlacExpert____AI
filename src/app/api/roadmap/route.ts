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

    // Dynamically compile weak areas based on multi-dimensional profiling answers
    const candidateWeakAreas: { name: string; reason: string; severity: string; priority: number }[] = [];

    // Aptitude check
    if (user.aptitude === "Poor") {
      candidateWeakAreas.push({ name: "Aptitude & Logic", reason: "Low rating in aptitude profiling", severity: "HIGH", priority: 1 });
    } else if (user.aptitude === "Average") {
      candidateWeakAreas.push({ name: "Aptitude & Logic", reason: "Average aptitude score", severity: "MED", priority: 3 });
    }

    // Communication check
    if (user.communication === "Very Nervous" || user.communication === "Nervous") {
      candidateWeakAreas.push({ name: "Interview Communication", reason: "Nervous in mock/hr interviews", severity: "HIGH", priority: 2 });
    } else if (user.communication === "Need Practice") {
      candidateWeakAreas.push({ name: "Interview Communication", reason: "Requires verbal interview practice", severity: "MED", priority: 4 });
    }

    // Hands-on projects / platform check
    if (user.projects === "Zero" || user.codingPlatform === "Never tried") {
      candidateWeakAreas.push({ name: "Hands-on Projects & Code", reason: "Zero project build experience", severity: "HIGH", priority: 2 });
    }

    // Core CS Subjects check based on user's coreCsStrength
    if (user.coreCsStrength !== "DSA") {
      candidateWeakAreas.push({ name: "DSA & Problem Solving", reason: "Not selected as core CS strength", severity: "HIGH", priority: 1 });
    }
    if (user.coreCsStrength !== "DBMS") {
      candidateWeakAreas.push({ name: "SQL & Databases", reason: "Needs additional practice in DBMS", severity: "MED", priority: 3 });
    }
    if (user.coreCsStrength !== "OS") {
      candidateWeakAreas.push({ name: "OS & Memory", reason: "Theoretical gap in Operating Systems", severity: "MED", priority: 4 });
    }
    if (user.coreCsStrength !== "Networking") {
      candidateWeakAreas.push({ name: "Computer Networks", reason: "Basic knowledge level in CN", severity: "LOW", priority: 5 });
    }

    // Sort by priority (lowest number = highest priority) and pick top 3
    candidateWeakAreas.sort((a, b) => a.priority - b.priority);
    const weakAreas = candidateWeakAreas.slice(0, 3).map(({ name, reason, severity }) => ({ name, reason, severity }));

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
        placementTimeline: user.placementTimeline,
      },
      roadmap: activeRoadmap,
      weakAreas
    });
  } catch (err: any) {
    console.error("Failed to fetch roadmap:", err);
    return NextResponse.json({ error: "Failed to fetch roadmap" }, { status: 500 });
  }
}
