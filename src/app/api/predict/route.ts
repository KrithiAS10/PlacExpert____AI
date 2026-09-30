import { NextResponse } from 'next/server';
import path from 'path';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';

async function runPythonScript(scriptPath: string, args: string[]): Promise<string> {
  const { spawn } = await import('child_process');
  return new Promise((resolve, reject) => {
    const pythonProcess = spawn('python', [scriptPath, ...args]);
    let stdout = '';
    let stderr = '';

    pythonProcess.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    pythonProcess.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`Script exited with code ${code}. Stderr: ${stderr}`));
      } else {
        resolve(stdout);
      }
    });
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // 1. Run predict.py to get readiness level and domain probabilities
    const predictScript = path.join(process.cwd(), 'ml', 'predict.py');
    const predictOutput = await runPythonScript(predictScript, [JSON.stringify(body)]);
    const predictResult = JSON.parse(predictOutput);
    
    // 2. Map readiness level to Beginner/Intermediate/Advanced for roadmap score calculation
    const rawReadiness = predictResult.readiness;
    
    // 3. Compute weak areas based on profiling answers
    const weak_areas: string[] = [];
    if (body.strength !== "DSA") weak_areas.push("DSA");
    if (body.strength !== "DBMS") weak_areas.push("DBMS");
    if (body.strength !== "OS") weak_areas.push("OS");
    if (body.strength !== "Networking") weak_areas.push("CN");
    const finalWeakAreas = weak_areas.slice(0, 3);
    
    // 4. Determine predicted role from domain mapping and preferred language
    const domainMapping = predictResult.domain_mapping || {};
    let predictedDomain = body.domain || "Full Stack";
    if (body.domain && body.domain.trim() !== "" && body.domain !== "Not Decided") {
      predictedDomain = body.domain;
    } else {
      let maxProb = -1;
      for (const [dom, prob] of Object.entries(domainMapping)) {
        if ((prob as number) > maxProb) {
          maxProb = prob as number;
          predictedDomain = dom;
        }
      }
    }

    function mapDomainAndLanguageToRole(domain: string, preferredLang: string = ""): string {
      const d = domain.toLowerCase().trim();
      const lang = preferredLang.toLowerCase().trim();

      if (d.includes("full stack") || d.includes("fullstack")) {
        if (lang === "python") return "Python Fullstack Developer";
        if (lang === "java") return "Java Fullstack Developer";
        return "Full Stack Developer";
      }

      if (d.includes("web development") || d.includes("web")) {
        if (lang === "javascript" || lang === "typescript") return "Web Developer";
        if (lang === "python" || lang === "java" || lang === "c++" || lang === "c") return "Backend Developer";
        return "Frontend Developer";
      }

      if (d.includes("data science") || d.includes("machine learning") || d.includes("ai")) {
        if (lang === "python") return "AI & Data Scientist";
        if (lang === "r" || lang === "sql") return "Data Analyst";
        return "ML Engineer";
      }

      if (d.includes("cloud") || d.includes("devops")) {
        if (lang === "python" || lang === "bash" || lang === "go") return "Devops";
        return "Cloud Engineer";
      }

      if (d.includes("cyber security") || d.includes("cyber") || d.includes("security")) {
        return "Cybersecurity";
      }

      if (d.includes("mobile") || d.includes("android") || d.includes("ios") || d.includes("app")) {
        return "Android Developer";
      }

      if (d.includes("blockchain")) return "Blockchain";
      if (d.includes("network")) return "Network Engineer";
      if (d.includes("game")) return "Game Developer";
      if (d.includes("qa") || d.includes("testing")) return "QA Engineer";
      return "Software Engineer";
    }

    const predictedRole = mapDomainAndLanguageToRole(predictedDomain, body.preferredLang || "");
    const resolvedRole = predictedRole;

    // Generate roadmap via Python engine (contains all task data internally — no DB seed required)
    const roadmapParams = {
      readiness: (() => {
        if (rawReadiness === "Actively Practicing") return "Intermediate";
        if (rawReadiness === "Ready for Interviews") return "Advanced";
        return "Beginner";
      })(),
      daily_study_time: body.dailyStudyTime || "2-3 hours",
      preferred_language: body.preferredLang || "Python",
      placement_timeline: body.placementTimeline || "45 Days",
      weak_areas: finalWeakAreas,
      domain_interest: predictedDomain,
      core_cs_strength: body.strength || "None",
      coding_platform: body.platform || "LeetCode",
      target_company: body.target || ""
    };

    const roadmapScript = path.join(process.cwd(), 'ml', 'roadmap_engine.py');
    const roadmapOutput = await runPythonScript(roadmapScript, [JSON.stringify(roadmapParams)]);
    const roadmapData = JSON.parse(roadmapOutput);
    const total_days = roadmapData.total_days || 45;

    // 5. Update user and save roadmap to database
    const cookieStore = await cookies();
    const userEmail = cookieStore.get('user_email')?.value;
    if (!userEmail) {
      return NextResponse.json({ error: "User session not found" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: userEmail }
    });
    
    if (!user) {
      return NextResponse.json({ error: "User not found in database" }, { status: 404 });
    }
    
    // Calculate numeric readiness score
    let readinessScore = 3.2;
    if (rawReadiness === "Just Starting") readinessScore = 2.0;
    else if (rawReadiness === "Learning Basics") readinessScore = 4.2;
    else if (rawReadiness === "Actively Practicing") readinessScore = 6.5;
    else if (rawReadiness === "Ready for Interviews") readinessScore = 8.8;
    
    // Delete existing roadmap database entries (and associated solved problems) for user to reset
    await prisma.solvedProblem.deleteMany({
      where: {
        userId: user.id
      }
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
      where: {
        userId: user.id
      }
    });
    
    // Save new roadmap, phases, tasks to DB
    await prisma.roadmap.create({
      data: {
        title: roadmapData.title,
        description: roadmapData.description,
        userId: user.id,
        role: resolvedRole,
        phases: {
          create: roadmapData.phases.map((phase: any) => ({
            title: phase.name,
            description: phase.focus,
            order: phase.order,
            tasks: {
              create: roadmapData.tasks
                .filter((task: any) => task.phase === phase.name)
                .map((task: any) => ({
                  title: task.title,
                  description: task.resource_url || null,
                  day: task.day,
                  status: task.status || "PENDING",
                  type: task.type || "TOPIC"
                }))
            }
          }))
        }
      }
    });
    
    // Update user profile and stats (Readiness score starts at 0.0 until tasks are attended)
    await prisma.user.update({
      where: { id: user.id },
      data: {
        readinessScore: 0.0,
        currentDay: 1,
        streak: 0,
        readinessLevel: rawReadiness,
        domainInterest: body.domain,
        targetCompany: body.target,
        coreCsStrength: body.strength,
        codingPlatform: body.platform,
        projects: body.exposure,
        aptitude: body.aptitude,
        communication: body.comm,
        dailyStudyTime: body.dailyStudyTime,
        preferredLang: body.preferredLang,
        placementTimeline: body.placementTimeline
      }
    });
    
    // Add activity log to DB
    await prisma.activity.create({
      data: {
        userId: user.id,
        action: `Generated roadmap: ${roadmapData.title}`,
        status: "SUCCESS"
      }
    });

    // Add analytics data point
    await prisma.analytics.create({
      data: {
        userId: user.id,
        metric: "Readiness",
        value: readinessScore
      }
    });
    
    return NextResponse.json({
      ...predictResult,
      predictedRole: resolvedRole,
      predictedDomain,
      roadmap: roadmapData
    });
  } catch (err: any) {
    console.error("API error during profiling/prediction:", err);
    return NextResponse.json({ error: err.message || "Failed to process prediction and roadmap" }, { status: 500 });
  }
}
