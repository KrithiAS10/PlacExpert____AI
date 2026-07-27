// backend/server.js
import express from "express";
import cors from "cors";
import axios from "axios";
import { prisma } from "./db.js"; // Note: .js extension is required in ESM

const app = express();
app.use(cors());
app.use(express.json());

// ================= ROOT STATUS CHECK =================
app.get("/", (req, res) => {
  res.send("🚀 PlaceXpert AI Operational Backend is Running");
});

// ================= HELPER: Fetch blueprint tasks for a role from RoadmapTemplate table =================
async function getBlueprintTasksForRole(predictedRole) {
  // 1. Try exact match first
  let blueprintTasks = await prisma.roadmapTemplate.findMany({
    where: { roleName: predictedRole },
    orderBy: { dayNumber: "asc" },
  });

  if (blueprintTasks.length > 0) {
    return { tasks: blueprintTasks, resolvedRole: predictedRole };
  }

  // 2. No exact match — normalize and try to find the closest existing role
  const normalized = predictedRole.toLowerCase();
  let fallbackRole;

  if (normalized.includes("front")) fallbackRole = "Frontend Developer";
  else if (normalized.includes("ml") || normalized.includes("machine") || normalized.includes("data")) fallbackRole = "ML Engineer";
  else fallbackRole = "Backend Developer"; // safe default — covers Backend, Cloud, Blockchain, Full Stack, Software Engineer until dedicated templates exist

  blueprintTasks = await prisma.roadmapTemplate.findMany({
    where: { roleName: fallbackRole },
    orderBy: { dayNumber: "asc" },
  });

  return { tasks: blueprintTasks, resolvedRole: fallbackRole };
}

// ================= PIPELINE: PROCESS PROFILE & GENERATE ROADMAP =================
app.post("/api/profile/submit", async (req, res) => {
  const email = req.body.email || "krithi@example.com";
  const skillsString = req.body.skillsString || req.body.skills || req.body.text || "";

  if (!skillsString) {
    return res.status(400).json({ error: "Missing profile skills context." });
  }

  try {
    let predictedRole = "Backend Developer";

    try {
      const flaskResponse = await axios.post("http://localhost:8000/predict", {
        skills: skillsString,
      });

      if (flaskResponse.data && flaskResponse.data.role) {
        predictedRole = flaskResponse.data.role;
      }
    } catch (flaskErr) {
      console.warn("⚠️ Flask server unreachable. Falling back to internal rule-based detection...");

      const cleanedInput = skillsString.toLowerCase();
      if (cleanedInput.includes("react") || cleanedInput.includes("frontend")) {
        predictedRole = "Frontend Developer";
      } else if (cleanedInput.includes("node") || cleanedInput.includes("backend")) {
        predictedRole = "Backend Developer";
      } else if (cleanedInput.includes("machine") || cleanedInput.includes("learning") || cleanedInput.includes("data")) {
        predictedRole = "ML Engineer";
      } else if (cleanedInput.includes("cloud") || cleanedInput.includes("devops")) {
        predictedRole = "Cloud Engineer";
      } else if (cleanedInput.includes("block") || cleanedInput.includes("chain")) {
        predictedRole = "Blockchain Developer";
      } else if (cleanedInput.includes("stack") || cleanedInput.includes("full")) {
        predictedRole = "Full Stack Developer";
      }
    }

    let user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      user = await prisma.user.create({
        data: {
          email,
          name: "Krithi",
          role: predictedRole,
        },
      });
    }

    // Fetch matching day tasks from the RoadmapTemplate table (with fallback resolution)
    const { tasks: blueprintTasks, resolvedRole } = await getBlueprintTasksForRole(predictedRole);

    if (!blueprintTasks || blueprintTasks.length === 0) {
      return res.status(500).json({ error: `No roadmap template found for role: ${predictedRole}` });
    }

    // IMPORTANT: we save resolvedRole (the role whose tasks were actually used),
    // not the raw predictedRole, so the label always matches the content shown.
    await prisma.$transaction([
      prisma.user.update({
        where: { email },
        data: { role: resolvedRole, currentDay: 1, streak: 1 },
      }),
      prisma.roadmap.deleteMany({ where: { userId: user.id } }),
      prisma.roadmap.create({
        data: {
          userId: user.id,
          role: resolvedRole,
          status: "IN_PROGRESS",
          tasks: {
            create: blueprintTasks.map((task) => ({
              title: task.title,
              dayNumber: task.dayNumber,
              category: task.category,
              status: "PENDING",
              resourceName: task.resourceName || "Explore Resource",
              resourceLink: task.resourceLink || "https://roadmap.sh",
            })),
          },
        },
      }),
    ]);

    return res.status(200).json({
      success: true,
      detected_role: predictedRole,
      resolved_template_role: resolvedRole,
      message: `Successfully structured a 45-Day path for ${resolvedRole}`,
    });
  } catch (error) {
    console.error("❌ Critical pipeline execution failure:", error);
    return res.status(500).json({ error: "Failed to parse and write adaptive path updates to database." });
  }
});

// ================= GET ACTIVE ROADMAP TIMELINE (WITH AUTOMATIC ML INTERCEPT) =================
app.get("/api/roadmap/:email", async (req, res) => {
  const { email } = req.params;

  try {
    let user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      user = await prisma.user.create({
        data: { email, name: "Krithi", role: "Backend Developer" },
      });
    }

    let userRoadmap = await prisma.roadmap.findFirst({
      where: { userId: user.id },
      include: { tasks: { orderBy: { dayNumber: "asc" } } },
    });

    if (!userRoadmap || userRoadmap.role === "Backend Developer") {
      console.log("🔄 Stale database roadmap configuration found. Running ML profile matching via Port 8000...");

      let predictedRole = "Frontend Developer";

      try {
        const flaskResponse = await axios.post("http://localhost:8000/predict", {
          skills: "react javascript nextjs tailwind postgresql fullstack full-stack",
        });

        if (flaskResponse.data && flaskResponse.data.role) {
          predictedRole = flaskResponse.data.role;
        }
      } catch (fErr) {
        console.warn("⚠️ Flask server unreachable during dashboard check. Proceeding with adaptive defaults.");
      }

      const { tasks: blueprintTasks, resolvedRole } = await getBlueprintTasksForRole(predictedRole);

      if (!blueprintTasks || blueprintTasks.length === 0) {
        return res.status(500).json({ error: `No roadmap template found for role: ${predictedRole}` });
      }

      await prisma.$transaction([
        prisma.user.update({
          where: { email },
          data: { role: resolvedRole, currentDay: 1, streak: 1 },
        }),
        prisma.roadmap.deleteMany({ where: { userId: user.id } }),
        prisma.roadmap.create({
          data: {
            userId: user.id,
            role: resolvedRole,
            status: "IN_PROGRESS",
            tasks: {
              create: blueprintTasks.map((task) => ({
                title: task.title,
                dayNumber: task.dayNumber,
                category: task.category,
                status: "PENDING",
                resourceName: task.resourceName || "Explore Resource",
                resourceLink: task.resourceLink || "https://roadmap.sh",
              })),
            },
          },
        }),
      ]);

      userRoadmap = await prisma.roadmap.findFirst({
        where: { userId: user.id },
        include: { tasks: { orderBy: { dayNumber: "asc" } } },
      });
    }

    return res.json(userRoadmap);
  } catch (error) {
    console.error("❌ Error inside the roadmap data runtime intercept pipeline:", error);
    return res.status(500).json({ error: error.message });
  }
});

// ================= START SERVER RUNTIME =================
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`🚀 Centralized Server actively listening on http://localhost:${PORT}`);
});