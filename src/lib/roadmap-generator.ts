import { prisma } from '@/lib/prisma';
import { ROLE_ROADMAPS } from '@/lib/roadmaps-data';

export interface UserProfilingInput {
  academicYear?: string;
  domain?: string;
  target?: string;
  strength?: string;
  platform?: string;
  exposure?: string;
  aptitude?: string;
  comm?: string;
  mockExp?: string;
  confidence?: string;
  preferredLang?: string;
  dailyStudyTime?: string;
  placementTimeline?: string;
  readiness?: string;
  [key: string]: any;
}

export interface RoadmapGenerationResult {
  roadmap: any;
  predictedRole: string;
  predictedDomain: string;
  weakAreas: { name: string; reason: string; severity: string }[];
}

export const TIMELINE_MAP: Record<string, number> = {
  "1 Month": 30,
  "45 Days": 45,
  "2 Months": 60,
  "3 Months": 90,
  "6 Months": 180,
};

// Maps domain and preferred language to one of the 19 supported blueprint roles
export function mapDomainAndLanguageToRole(domain: string = "", preferredLang: string = ""): string {
  const d = (domain || "").toLowerCase().trim();
  const lang = (preferredLang || "").toLowerCase().trim();

  if (d.includes("full stack") || d.includes("fullstack")) {
    if (lang === "python") return "Python Fullstack Developer";
    if (lang === "java") return "Java Fullstack Developer";
    return "Full Stack Developer";
  }

  if (d.includes("web development") || d.includes("web") || d.includes("frontend") || d.includes("front-end")) {
    if (lang === "javascript" || lang === "typescript" || lang === "html") return "Web Developer";
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

  if (d.includes("blockchain") || d.includes("crypto") || d.includes("web3")) return "Blockchain";
  if (d.includes("network")) return "Network Engineer";
  if (d.includes("game")) return "Game Developer";
  if (d.includes("qa") || d.includes("testing") || d.includes("quality")) return "QA Engineer";

  return "Software Engineer";
}

// Retrieves blueprint tasks from database or in-memory constants
export async function getBlueprintTasks(roleName: string) {
  // 1. Try querying RoadmapTemplate from database
  try {
    const dbTasks = await prisma.roadmapTemplate.findMany({
      where: { roleName },
      orderBy: { dayNumber: "asc" }
    });
    if (dbTasks && dbTasks.length > 0) {
      return { tasks: dbTasks, resolvedRole: roleName };
    }
  } catch (err) {
    console.warn("Could not query RoadmapTemplate table, checking in-memory templates:", err);
  }

  // 2. Direct match in ROLE_ROADMAPS
  if (ROLE_ROADMAPS[roleName as keyof typeof ROLE_ROADMAPS]) {
    const memTasks = ROLE_ROADMAPS[roleName as keyof typeof ROLE_ROADMAPS].map(t => ({
      id: `${roleName}-${t.dayNumber}`,
      roleName,
      dayNumber: t.dayNumber,
      title: t.title,
      category: t.category,
      resourceName: t.resourceName,
      resourceLink: t.resourceLink
    }));
    return { tasks: memTasks, resolvedRole: roleName };
  }

  // 3. Fallback resolution to closest role
  const normalized = roleName.toLowerCase();
  let fallbackRole = "Software Engineer";
  if (normalized.includes("front")) fallbackRole = "Frontend Developer";
  else if (normalized.includes("back")) fallbackRole = "Backend Developer";
  else if (normalized.includes("data") || normalized.includes("ml")) fallbackRole = "AI & Data Scientist";
  else if (normalized.includes("stack")) fallbackRole = "Full Stack Developer";

  try {
    const fallbackDbTasks = await prisma.roadmapTemplate.findMany({
      where: { roleName: fallbackRole },
      orderBy: { dayNumber: "asc" }
    });
    if (fallbackDbTasks && fallbackDbTasks.length > 0) {
      return { tasks: fallbackDbTasks, resolvedRole: fallbackRole };
    }
  } catch {}

  const memFallback = (ROLE_ROADMAPS[fallbackRole as keyof typeof ROLE_ROADMAPS] || ROLE_ROADMAPS["Software Engineer"]).map(t => ({
    id: `${fallbackRole}-${t.dayNumber}`,
    roleName: fallbackRole,
    dayNumber: t.dayNumber,
    title: t.title,
    category: t.category,
    resourceName: t.resourceName,
    resourceLink: t.resourceLink
  }));

  return { tasks: memFallback, resolvedRole: fallbackRole };
}

// Compute comprehensive weak areas based on profiling answers
export function computeWeakAreas(body: UserProfilingInput) {
  const candidateWeakAreas: {
    name: string;
    topic: string;
    category: string;
    reason: string;
    severity: string;
    priority: number;
    resource: string;
  }[] = [];

  // 1. Aptitude check
  if (body.aptitude === "Poor") {
    candidateWeakAreas.push({
      name: "Aptitude & Quantitative Logic",
      topic: "Speed Math, Percentages & Logical Deductions",
      category: "Aptitude",
      reason: "Low aptitude rating in assessment profiling",
      severity: "HIGH",
      priority: 1,
      resource: "https://www.geeksforgeeks.org/aptitude-questions-and-answers/"
    });
  } else if (body.aptitude === "Average") {
    candidateWeakAreas.push({
      name: "Aptitude & Quantitative Logic",
      topic: "Data Interpretation, Ratios & Number Systems",
      category: "Aptitude",
      reason: "Average aptitude proficiency score",
      severity: "MED",
      priority: 3,
      resource: "https://www.geeksforgeeks.org/aptitude-questions-and-answers/"
    });
  }

  // 2. Communication check
  if (body.comm === "Very Nervous" || body.comm === "Nervous") {
    candidateWeakAreas.push({
      name: "Interview Communication & HR Round",
      topic: "Behavioral Responses & STAR Method Practice",
      category: "Communication",
      reason: "High interview anxiety reported",
      severity: "HIGH",
      priority: 2,
      resource: "https://www.geeksforgeeks.org/star-interview-technique/"
    });
  } else if (body.comm === "Need Practice") {
    candidateWeakAreas.push({
      name: "Interview Communication & Pitch",
      topic: "Technical Project Pitch & Solution Articulation",
      category: "Communication",
      reason: "Needs practice in verbalizing technical solutions",
      severity: "MED",
      priority: 4,
      resource: "https://www.geeksforgeeks.org/tips-for-technical-interview-preparation/"
    });
  }

  // 3. Hands-on projects / coding platform check
  if (body.exposure === "Zero" || body.platform === "Never tried") {
    candidateWeakAreas.push({
      name: "Hands-on Project & Practical Coding",
      topic: "Git Version Control & Fullstack Project Scaffolding",
      category: "Projects",
      reason: "Zero project build or coding platform experience",
      severity: "HIGH",
      priority: 2,
      resource: "https://www.freecodecamp.org/news/how-to-build-a-portfolio-website-html-css-and-js/"
    });
  }

  // 4. Core CS Subjects check
  if (body.strength) {
    if (body.strength !== "DSA") {
      candidateWeakAreas.push({
        name: "DSA & Problem Solving",
        topic: "Arrays, Two Pointers & Hashing Patterns",
        category: "DSA",
        reason: "DSA not selected as core CS strength",
        severity: "HIGH",
        priority: 1,
        resource: "https://leetcode.com/tag/two-pointers/"
      });
    }
    if (body.strength !== "DBMS") {
      candidateWeakAreas.push({
        name: "SQL & Databases",
        topic: "SQL Joins, Normalization & Query Tuning",
        category: "DBMS",
        reason: "Additional practice required in database design",
        severity: "MED",
        priority: 3,
        resource: "https://www.geeksforgeeks.org/dbms/"
      });
    }
    if (body.strength !== "OS") {
      candidateWeakAreas.push({
        name: "OS & Memory Management",
        topic: "Process Scheduling, Deadlocks & Virtual Memory",
        category: "OS",
        reason: "Gaps identified in Operating System internals",
        severity: "MED",
        priority: 4,
        resource: "https://www.geeksforgeeks.org/operating-systems/"
      });
    }
    if (body.strength !== "Networking") {
      candidateWeakAreas.push({
        name: "Computer Networks",
        topic: "TCP/IP vs UDP, DNS & HTTP/HTTPS Handshakes",
        category: "CN",
        reason: "Basic knowledge level in computer networks",
        severity: "LOW",
        priority: 5,
        resource: "https://www.geeksforgeeks.org/computer-network-tutorials/"
      });
    }
  }

  // Sort by priority and take top 3
  candidateWeakAreas.sort((a, b) => a.priority - b.priority);
  return candidateWeakAreas.slice(0, 3);
}

// Generate, scale, and persist a roadmap for a given user
export async function generateAndSaveRoadmap(
  userId: string,
  profilingData: UserProfilingInput,
  readinessLevel: string = "Actively Practicing"
): Promise<RoadmapGenerationResult> {
  const domain = profilingData.domain || "Web Development";
  const preferredLang = profilingData.preferredLang || "JavaScript";
  const timeline = profilingData.placementTimeline || "45 Days";
  const total_days = TIMELINE_MAP[timeline] || 45;

  const predictedRole = mapDomainAndLanguageToRole(domain, preferredLang);
  const { tasks: blueprintTasks, resolvedRole } = await getBlueprintTasks(predictedRole);

  const topWeakAreas = computeWeakAreas(profilingData);

  // Define 3 structured phases
  const p1End = Math.max(1, Math.floor(total_days * 0.33));
  const p2End = Math.max(p1End + 1, Math.floor(total_days * 0.66));

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

  // Scale blueprint tasks across the timeline so that Day 1 is always populated
  // and tasks are smoothly paced up to total_days
  const taskCount = blueprintTasks.length;
  const scaledTasks = blueprintTasks.map((t, idx) => {
    let day = 1;
    if (taskCount > 1) {
      day = Math.max(1, Math.min(total_days, Math.round((idx / (taskCount - 1)) * (total_days - 1)) + 1));
    }
    return {
      title: t.title,
      day,
      category: t.category,
      resourceName: t.resourceName,
      resourceLink: t.resourceLink
    };
  });

  const finalTasks: any[] = [];

  // Group scaled tasks into phases and determine task types
  for (const t of scaledTasks) {
    let phaseName = phases[0].name;
    if (t.day > p1End && t.day <= p2End) {
      phaseName = phases[1].name;
    } else if (t.day > p2End) {
      phaseName = phases[2].name;
    }

    let type = "TOPIC";
    const titleLower = t.title.toLowerCase();
    if (
      titleLower.includes("leetcode") ||
      titleLower.includes("dsa:") ||
      titleLower.includes("problems") ||
      t.category === "DSA" ||
      t.category === "Problem Solving"
    ) {
      type = "PROBLEM";
    } else if (titleLower.includes("mock") || titleLower.includes("interview")) {
      type = "MOCK";
    } else if (titleLower.includes("project") || titleLower.includes("build") || titleLower.includes("app")) {
      type = "PROJECT";
    }

    finalTasks.push({
      title: t.title,
      day: t.day,
      phase: phaseName,
      status: "PENDING",
      type,
      category: t.category || "Core",
      resourceName: t.resourceName || "Explore Resource",
      resource_url: t.resourceLink || "https://www.geeksforgeeks.org/"
    });
  }

  // Inject tailored remediation tasks for detected weak areas into Phase 2 / Phase 3
  for (let i = 0; i < topWeakAreas.length; i++) {
    const wa = topWeakAreas[i];
    // Spread remediation across the final third of the timeline
    const remDay = Math.max(p1End + 1, Math.min(total_days, total_days - topWeakAreas.length + i + 1));
    let phaseName = phases[2].name;
    if (remDay <= p1End) phaseName = phases[0].name;
    else if (remDay <= p2End) phaseName = phases[1].name;

    finalTasks.push({
      title: `[REMEDIATION] ${wa.name} — ${wa.topic}`,
      day: remDay,
      phase: phaseName,
      status: "PENDING",
      type: wa.category === "DSA" ? "PROBLEM" : wa.category === "Communication" ? "MOCK" : "TOPIC",
      category: wa.category,
      resourceName: "Curated Remediation",
      resource_url: wa.resource
    });
  }

  // Sort tasks by day
  finalTasks.sort((a, b) => a.day - b.day);

  const roadmapData = {
    title: `${resolvedRole} Prep Track`,
    description: `Personalized ${timeline} plan for ${resolvedRole} using ${preferredLang}`,
    total_days,
    readiness: readinessLevel,
    daily_study_time: profilingData.dailyStudyTime || "2-3 hours",
    preferred_language: preferredLang,
    phases,
    tasks: finalTasks
  };

  // Transactionally reset any prior roadmap records and save new roadmap
  await prisma.$transaction(async (tx) => {
    await tx.solvedProblem.deleteMany({ where: { userId } });
    await tx.task.deleteMany({
      where: { phase: { roadmap: { userId } } }
    });
    await tx.phase.deleteMany({
      where: { roadmap: { userId } }
    });
    await tx.roadmap.deleteMany({ where: { userId } });

    await tx.roadmap.create({
      data: {
        title: roadmapData.title,
        description: roadmapData.description,
        userId: userId,
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
                  dayNumber: task.day,
                  category: task.category || null,
                  status: task.status || "PENDING",
                  type: task.type || "TOPIC",
                  resourceName: task.resourceName || "Explore Resource",
                  resourceLink: task.resource_url || "https://roadmap.sh"
                }))
            }
          }))
        }
      }
    });

    // Update user profile answers and reset progress indicators
    await tx.user.update({
      where: { id: userId },
      data: {
        readinessScore: 0.0,
        currentDay: 1,
        streak: 0,
        readinessLevel,
        academicYear: profilingData.academicYear,
        domainInterest: domain,
        targetCompany: profilingData.target,
        coreCsStrength: profilingData.strength,
        codingPlatform: profilingData.platform,
        projects: profilingData.exposure,
        aptitude: profilingData.aptitude,
        communication: profilingData.comm,
        dailyStudyTime: profilingData.dailyStudyTime,
        preferredLang,
        placementTimeline: timeline
      }
    });

    await tx.activity.create({
      data: {
        userId,
        action: `Generated roadmap: ${roadmapData.title}`,
        status: "SUCCESS"
      }
    });
  });

  return {
    roadmap: roadmapData,
    predictedRole: resolvedRole,
    predictedDomain: domain,
    weakAreas: topWeakAreas.map(w => ({ name: w.name, reason: w.reason, severity: w.severity }))
  };
}
