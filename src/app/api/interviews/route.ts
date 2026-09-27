// GET /api/interviews
// Returns list of all interviews for the current logged-in user.

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const userEmail = cookieStore.get("user_email")?.value;

    let userId: string | null = null;
    if (userEmail) {
      const user = await prisma.user.findUnique({ where: { email: userEmail }, select: { id: true } });
      userId = user?.id ?? null;
    }

    const where = userId ? { userId } : {};

    const interviews = await prisma.interview.findMany({
      where,
      include: {
        resume: { select: { id: true, fileName: true } },
        report: { select: { overallScore: true } },
        answers: { select: { score: true } },
        _count: { select: { answers: true, questions: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    const result = interviews.map((iv) => {
      const avgScore =
        iv.answers.length > 0
          ? iv.answers.reduce((s, a) => s + a.score, 0) / iv.answers.length
          : null;

      return {
        id: iv.id,
        status: iv.status,
        type: iv.type,
        difficulty: iv.difficulty,
        mode: iv.mode,
        role: iv.role,
        totalQuestions: iv.totalQuestions,
        questionsAnswered: iv._count.answers,
        avgScore: avgScore !== null ? Math.round(avgScore * 10) / 10 : null,
        overallScore: iv.report?.overallScore ?? null,
        resume: iv.resume ? { id: iv.resume.id, fileName: iv.resume.fileName } : null,
        createdAt: iv.createdAt,
        updatedAt: iv.updatedAt,
      };
    });

    return NextResponse.json({ success: true, interviews: result, total: result.length });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to fetch interviews";
    console.error("Interviews list error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
