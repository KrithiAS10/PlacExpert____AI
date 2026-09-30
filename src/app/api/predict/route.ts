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

    // Fetch matching tasks from RoadmapTemplate
    const blueprintTasks = await prisma.roadmapTemplate.findMany({
      where: { roleName: predictedRole },
      orderBy: { dayNumber: "asc" }
    });

    let resolvedRole = predictedRole;
    let tasksToUse = blueprintTasks;
    if (tasksToUse.length === 0) {
      resolvedRole = "Software Engineer";
      tasksToUse = await prisma.roadmapTemplate.findMany({
        where: { roleName: resolvedRole },
        orderBy: { dayNumber: "asc" }
      });
    }

    const timeline = body.placementTimeline || "45 Days";
    const TIMELINE_MAP: Record<string, number> = {
      "1 Month": 30,
      "45 Days": 45,
      "2 Months": 60,
      "3 Months": 90,
      "6 Months": 180,
    };
    const total_days = TIMELINE_MAP[timeline] || 45;

    // Scale blueprint course deadlines proportionally. The UI derives each
    // course's start day from the previous course deadline.
    const scaledTasks = tasksToUse.map((t) => {
      const scaledDay = Math.max(1, Math.min(total_days, Math.ceil((t.dayNumber / 45) * total_days)));
      return {
        title: t.title,
        day: scaledDay,
        category: t.category,
        resourceName: t.resourceName,
        resourceLink: t.resourceLink
      };
    });

    // Generate Remediation tasks for weak areas
    const remediationTasks = [];
    let remDay = total_days - finalWeakAreas.length + 1;
    if (remDay < 1) remDay = 1;

    const WEAK_TOPICS: Record<string, string[]> = {
      "DSA": ["Arrays & Hashing", "Linked Lists", "Trees & Graphs"],
      "DBMS": ["SQL Queries & Joins", "Normalization & Transactions", "Indexing & Optimization"],
      "OS": ["CPU Scheduling", "Memory Management & Paging", "Deadlocks & Semaphores"],
      "CN": ["IP Addressing & Subnetting", "TCP/IP Layer Protocols", "DNS & HTTP/HTTPS Handshakes"]
    };

    for (const area of finalWeakAreas) {
      if (remDay > total_days) break;
      const topics = WEAK_TOPICS[area] || ["Core Concepts & Practice"];
      const topic = topics[0];
      remediationTasks.push({
        title: `[REMEDIATION] ${area} — ${topic}`,
        day: remDay,
        category: area,
        resourceName: "GeeksforGeeks",
        resourceLink: "https://www.geeksforgeeks.org/"
      });
      remDay++;
    }

    // Define 3 phases
    const p1End = Math.floor(total_days * 0.33);
    const p2End = Math.floor(total_days * 0.66);

    const phases = [
      {
        name: "Phase 1: Fundamentals & Core Concepts",
        order: 1,
        days: `1-${p1End}`,
        day_start: 1,
        day_end: p1End,
        focus: "fundamentals",
        status: "active",
        color: "cyan"
      },
      {
        name: "Phase 2: Deep Dive & Practice",
        order: 2,
        days: `${p1End + 1}-${p2End}`,
        day_start: p1End + 1,
        day_end: p2End,
        focus: "practice",
        status: "locked",
        color: "blue"
      },
      {
        name: "Phase 3: Projects & Interview Polish",
        order: 3,
        days: `${p2End + 1}-${total_days}`,
        day_start: p2End + 1,
        day_end: total_days,
        focus: "interview",
        status: "locked",
        color: "teal"
      }
    ];

    const finalTasks = scaledTasks.map((t) => {
      let phaseName = phases[0].name;
      if (t.day > p1End && t.day <= p2End) {
        phaseName = phases[1].name;
      } else if (t.day > p2End) {
        phaseName = phases[2].name;
      }

      let type = "TOPIC";
      const titleLower = t.title.toLowerCase();
      if (titleLower.includes("leetcode") || titleLower.includes("solve") || t.category === "DSA" || t.category === "Problem Solving") {
        type = "PROBLEM";
      } else if (titleLower.includes("mock") || titleLower.includes("interview")) {
        type = "MOCK";
      }

      return {
        title: t.title,
        day: t.day,
        phase: phaseName,
        status: "PENDING",
        type: type,
        resource_url: t.resourceLink || "https://www.geeksforgeeks.org/"
      };
    });

    for (const rt of remediationTasks) {
      let phaseName = phases[2].name;
      if (rt.day <= p1End) phaseName = phases[0].name;
      else if (rt.day <= p2End) phaseName = phases[1].name;

      finalTasks.push({
        title: rt.title,
        day: rt.day,
        phase: phaseName,
        status: "PENDING",
        type: "TOPIC",
        resource_url: rt.resourceLink
      });
    }

    const roadmapData = {
      title: `${resolvedRole} Prep Track`,
      description: `Personalized ${timeline} plan for ${resolvedRole} using ${body.preferredLang || "Python"}`,
      total_days,
      readiness: rawReadiness,
      daily_study_time: body.dailyStudyTime || "2-3 hours",
      preferred_language: body.preferredLang || "Python",
      phases,
      tasks: finalTasks
    };

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
