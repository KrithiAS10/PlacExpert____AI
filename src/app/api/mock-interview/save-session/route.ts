// src/app/api/mock-interview/save-session/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import type { InterviewRecord, InterviewLevel } from "@/lib/adaptive-interview";

export const dynamic = "force-dynamic";

interface SaveSessionRequest {
  records: InterviewRecord[];
  level: InterviewLevel;
  averageScore: number;
  readinessPercent: number;
}

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const userEmail = cookieStore.get("user_email")?.value;

    const body = (await req.json()) as SaveSessionRequest;
    const { records, level, averageScore, readinessPercent } = body;

    if (!records || records.length === 0) {
      return NextResponse.json({ error: "No records to save." }, { status: 400 });
    }

    // Save analytics metrics even if user is not logged in (just skip DB write)
    if (userEmail) {
      const user = await prisma.user.findUnique({ where: { email: userEmail } });

      if (user) {
        const now = new Date();

        // Save analytics entries for the session
        await prisma.analytics.createMany({
          data: [
            {
              userId: user.id,
              date: now,
              metric: "mock_interview_score",
              value: averageScore,
            },
            {
              userId: user.id,
              date: now,
              metric: "mock_interview_readiness",
              value: readinessPercent,
            },
            {
              userId: user.id,
              date: now,
              metric: "mock_interview_questions",
              value: records.length,
            },
            {
              userId: user.id,
              date: now,
              metric: "Readiness",
              value: Math.round((readinessPercent / 10) * 10) / 10,
            },
          ],
        });

        // Save an activity record
        await prisma.activity.create({
          data: {
            userId: user.id,
            action: `Completed ${level} mock interview — avg score ${averageScore}/10 across ${records.length} questions`,
            status: averageScore >= 7 ? "STRONG" : averageScore >= 5 ? "AVERAGE" : "NEEDS_WORK",
            timestamp: now,
          },
        });

        // Optionally update user readiness score if this interview improves it
        const currentReadiness = user.readinessScore;
        const newReadiness = readinessPercent / 10; // normalize to 0-10
        if (newReadiness > currentReadiness) {
          await prisma.user.update({
            where: { id: user.id },
            data: { readinessScore: Math.round(newReadiness * 10) / 10 },
          });
        }
      }
    }

    return NextResponse.json({ success: true, saved: !!userEmail });
  } catch (error: any) {
    console.error("Save session error:", error);
    // Don't fail the UI if DB save fails
    return NextResponse.json({ success: false, error: error?.message });
  }
}
