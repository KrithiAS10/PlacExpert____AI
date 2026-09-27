// POST /api/interview/[id]/end
// Ends the interview early (CANCELLED) or marks it COMPLETED.

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: interviewId } = await params;
    const body = await req.json().catch(() => ({}));
    const { cancelled = false } = body as { cancelled?: boolean };

    const interview = await prisma.interview.findUnique({
      where: { id: interviewId },
    });

    if (!interview) {
      return NextResponse.json({ error: "Interview not found." }, { status: 404 });
    }

    const newStatus = cancelled ? "CANCELLED" : "COMPLETED";

    await prisma.interview.update({
      where: { id: interviewId },
      data: { status: newStatus },
    });

    return NextResponse.json({
      success: true,
      interviewId,
      status: newStatus,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to end interview";
    console.error("Interview end error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
