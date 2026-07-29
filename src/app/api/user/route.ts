import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Detect a role from a free-text skills string using the same rule-based
// logic used in the Express backend (server.js), so both pipelines agree.
function detectRoleFromSkills(skills: string): string {
  const cleanedInput = skills.toLowerCase();

  if (cleanedInput.includes("react") || cleanedInput.includes("frontend")) {
    return "Frontend Developer";
  } else if (cleanedInput.includes("node") || cleanedInput.includes("backend")) {
    return "Backend Developer";
  } else if (
    cleanedInput.includes("machine") ||
    cleanedInput.includes("learning") ||
    cleanedInput.includes("data")
  ) {
    return "ML Engineer";
  } else if (cleanedInput.includes("cloud") || cleanedInput.includes("devops")) {
    return "Cloud Engineer";
  } else if (cleanedInput.includes("block") || cleanedInput.includes("chain")) {
    return "Blockchain Developer";
  } else if (cleanedInput.includes("stack") || cleanedInput.includes("full")) {
    return "Full Stack Developer";
  }
  return "Frontend Developer"; // default guess if nothing matches
}

// Fetch blueprint tasks for a role from the RoadmapTemplate table,
// falling back to a role that actually has seeded data if needed.
async function getBlueprintTasksForRole(predictedRole: string) {
  let blueprintTasks = await prisma.roadmapTemplate.findMany({
    where: { roleName: predictedRole },
    orderBy: { dayNumber: "asc" },
  });

  if (blueprintTasks.length > 0) {
    return { tasks: blueprintTasks, resolvedRole: predictedRole };
  }

  const normalized = predictedRole.toLowerCase();
  let fallbackRole: string;

  if (normalized.includes("front")) fallbackRole = "Frontend Developer";
  else if (
    normalized.includes("ml") ||
    normalized.includes("machine") ||
    normalized.includes("data")
  )
    fallbackRole = "ML Engineer";
  else fallbackRole = "Backend Developer"; // safe default until dedicated templates exist

  blueprintTasks = await prisma.roadmapTemplate.findMany({
    where: { roleName: fallbackRole },
    orderBy: { dayNumber: "asc" },
  });

  return { tasks: blueprintTasks, resolvedRole: fallbackRole };
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");
    const skills = searchParams.get("skills") || "";

    if (!email) {
      return NextResponse.json({ error: "Email query parameter is required" }, { status: 400 });
    }

    let user = await prisma.user.findUnique({ where: { email: email } });

    if (!user) {
      const predictedRole = detectRoleFromSkills(skills);
      user = await prisma.user.create({
        data: { email: email, name: email.split("@")[0], role: predictedRole },
      });
    }

    let userRoadmap = await prisma.roadmap.findFirst({
      where: { userId: user.id },
      include: { tasks: { orderBy: { dayNumber: "asc" } } },
    });

    if (!userRoadmap || !userRoadmap.tasks || userRoadmap.tasks.length === 0) {
      // 1. Actually detect the role from the skills param, instead of hardcoding
      const predictedRole = detectRoleFromSkills(skills);

      // 2. Fetch matching tasks from RoadmapTemplate (with fallback resolution)
      const { tasks: blueprintTasks, resolvedRole } = await getBlueprintTasksForRole(predictedRole);

      if (!blueprintTasks || blueprintTasks.length === 0) {
        return NextResponse.json(
          { error: `No roadmap template found for role: ${predictedRole}` },
          { status: 500 }
        );
      }

      // 3. Save the RESOLVED role (the one whose tasks were actually used),
      //    not the raw prediction — so the label always matches the content shown.
      await prisma.user.update({
        where: { id: user.id },
        data: { role: resolvedRole },
      });

      const tasksToCreate = blueprintTasks.map((task) => ({
        dayNumber: task.dayNumber,
        title: task.title,
        category: task.category,
        status: "PENDING",
        resourceName: task.resourceName || "Explore Resource",
        resourceLink: task.resourceLink || "https://roadmap.sh",
      }));

      userRoadmap = await prisma.roadmap.create({
        data: {
          userId: user.id,
          role: resolvedRole,
          status: "IN_PROGRESS",
          tasks: { create: tasksToCreate },
        },
        include: { tasks: { orderBy: { dayNumber: "asc" } } },
      });
    }

    return NextResponse.json(userRoadmap);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}