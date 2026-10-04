import { NextResponse } from 'next/server';
import path from 'path';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';

// ── Run Python ML scripts (still used for readiness prediction) ──
async function runPythonScript(scriptPath: string, args: string[]): Promise<string> {
  const { spawn } = await import('child_process');
  return new Promise((resolve, reject) => {
    const pythonProcess = spawn('python', [scriptPath, ...args]);
    let stdout = '';
    let stderr = '';
    pythonProcess.stdout.on('data', (data) => { stdout += data.toString(); });
    pythonProcess.stderr.on('data', (data) => { stderr += data.toString(); });
    pythonProcess.on('close', (code) => {
      if (code !== 0) reject(new Error(`Script exited with code ${code}. Stderr: ${stderr}`));
      else resolve(stdout);
    });
  });
}

function parseTimelineDays(val: string): number {
  if (!val) return 45;
  const t = val.trim().toLowerCase();
  if (t.includes('6 month')) return 90; // Comprehensive 90-day semester curriculum
  if (t.includes('3 month')) return 90;
  if (t.includes('2 month')) return 60;
  if (t.includes('1 month')) return 30;
  if (t.includes('45 day')) return 45;
  const num = parseInt(val);
  if (!isNaN(num) && num > 0) {
    if (t.includes('month')) return Math.min(num * 30, 90);
    return Math.min(num, 90);
  }
  return 45;
}

// ── Generate a 3-phase roadmap using Gemini API ──
async function generateRoadmapWithGemini(params: {
  role: string;
  readiness: string;
  domain: string;
  preferredLang: string;
  placementTimeline: string;
  dailyStudyTime: string;
  weakAreas: string[];
  targetCompany: string;
  coreStrength?: string;
  projectExposure?: string;
  codingPlatform?: string;
  aptitudeLevel?: string;
  commConfidence?: string;
}): Promise<any> {
  const geminiKey = process.env.GEMINI_API_KEY;
  if (!geminiKey) throw new Error('GEMINI_API_KEY not set');

  const totalDays = parseTimelineDays(params.placementTimeline);
  const phase1End = Math.round(totalDays * 0.33);
  const phase2End = Math.round(totalDays * 0.66);

  const systemPrompt = `You are an expert placement preparation coach who creates highly personalized, structured study roadmaps for engineering students.
Always respond with ONLY valid JSON — no markdown, no explanation, no code fences.`;

  const userPrompt = `Generate a ${totalDays}-day comprehensive placement preparation roadmap for a student with the following detailed profile:

- Target Role: ${params.role}
- Domain / Specialization: ${params.domain}
- Primary Programming Language: ${params.preferredLang}
- Current Readiness Level: ${params.readiness}
- Core Technical Strength: ${params.coreStrength || 'General CS'}
- Identified Weak Areas needing improvement: ${params.weakAreas.join(', ') || 'DSA, DBMS, OS'}
- Project & Practical Exposure: ${params.projectExposure || '1-2 projects'}
- Coding Platform Preference: ${params.codingPlatform || 'LeetCode'}
- Daily Study Time Available: ${params.dailyStudyTime}
- Preparation Timeline: ${params.placementTimeline} (${totalDays} day curriculum)
- Target Company Profile: ${params.targetCompany || 'Product-based companies'}
- General Aptitude & Problem Solving: ${params.aptitudeLevel || 'Average'}
- Communication Readiness: ${params.commConfidence || 'Need Practice'}

Create EXACTLY 3 phases:
- Phase 1 "Phase 1: Foundation & Basics" covers Days 1 to ${phase1End}: Core syntax in ${params.preferredLang}, fundamental data structures, development environment setup.
- Phase 2 "Phase 2: Deep Dive & Practice" covers Days ${phase1End + 1} to ${phase2End}: Advanced DSA, Core CS (DBMS, OS, CN), frameworks for ${params.domain}, targeted remediation for ${params.weakAreas.join(', ')}.
- Phase 3 "Phase 3: Mock Tests & Interview Prep" covers Days ${phase2End + 1} to ${totalDays}: System design, company interview patterns for ${params.targetCompany || 'Product-based'}, mock interviews, and final revision.

Rules:
- Provide exactly ${totalDays} daily tasks (Day 1 through Day ${totalDays})
- Each day has exactly 1 task tailored to ${params.role} and ${params.preferredLang}
- Assign each task to the exact matching phase name ("Phase 1: Foundation & Basics", "Phase 2: Deep Dive & Practice", "Phase 3: Mock Tests & Interview Prep")
- Include real free resource names and URLs (GeeksForGeeks, LeetCode, freeCodeCamp, MDN, YouTube, etc.)
- Task type must be one of: TOPIC, PROBLEM, COURSE, PROJECT, MOCK

Respond with ONLY this JSON (no extra text):
{
  "title": "${totalDays}-Day ${params.role} Placement Roadmap",
  "description": "A personalized ${totalDays}-day roadmap for ${params.readiness} level targeting ${params.role} roles at ${params.targetCompany || 'Product companies'}.",
  "total_days": ${totalDays},
  "phases": [
    { "name": "Phase 1: Foundation & Basics", "focus": "Core programming in ${params.preferredLang}, foundational data structures, and development tools", "order": 1 },
    { "name": "Phase 2: Deep Dive & Practice", "focus": "Advanced DSA, Core CS concepts (DBMS, OS, CN), framework mastery, and remediation", "order": 2 },
    { "name": "Phase 3: Mock Tests & Interview Prep", "focus": "System design, company-specific questions, mock interviews, and final placement sprint", "order": 3 }
  ],
  "tasks": [
    { "day": 1, "title": "task name", "type": "TOPIC", "phase": "Phase 1: Foundation & Basics", "resource_name": "GeeksForGeeks", "resource_url": "https://geeksforgeeks.org/..." },
    ... one task per day up to day ${totalDays}
  ]
}`;

  const models = ['gemini-3.5-flash', 'gemini-3.8-flash', 'gemini-flash-latest', 'gemini-3.1-flash-lite'];
  const payload = {
    system_instruction: { parts: [{ text: systemPrompt }] },
    contents: [{ parts: [{ text: userPrompt }] }],
    generationConfig: {
      temperature: 0.4,
      responseMimeType: 'application/json',
    },
  };

  let lastError = '';
  for (const model of models) {
    try {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiKey}`;
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errText = await res.text();
        lastError = `${res.status} — ${errText}`;
        console.warn(`Gemini model ${model} failed (${res.status}), trying next model...`);
        continue;
      }

      const data = await res.json();
      const raw = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      try {
        return JSON.parse(raw);
      } catch {
        const cleaned = raw.replace(/^```json\n?/i, '').replace(/```$/i, '').trim();
        return JSON.parse(cleaned);
      }
    } catch (err: any) {
      lastError = err.message || String(err);
      console.warn(`Gemini model ${model} error:`, err);
    }
  }

  throw new Error(`Gemini API error: All models failed. Last error: ${lastError}`);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // 1. Run predict.py — ML readiness prediction (unchanged)
    const predictScript = path.join(process.cwd(), 'ml', 'predict.py');
    const predictOutput = await runPythonScript(predictScript, [JSON.stringify(body)]);
    const predictResult = JSON.parse(predictOutput);
    const rawReadiness = predictResult.readiness;

    // 2. Map readiness label to display tier
    const readinessTier = (() => {
      if (rawReadiness === 'Actively Practicing') return 'Intermediate';
      if (rawReadiness === 'Ready for Interviews') return 'Advanced';
      return 'Beginner';
    })();

    // 3. Compute weak areas from profiling answers
    const weak_areas: string[] = [];
    if (body.strength !== 'DSA') weak_areas.push('DSA');
    if (body.strength !== 'DBMS') weak_areas.push('DBMS');
    if (body.strength !== 'OS') weak_areas.push('OS');
    if (body.strength !== 'Networking') weak_areas.push('CN');

    // 4. Map domain + language to a specific role name
    function mapDomainAndLanguageToRole(domain: string, lang = ''): string {
      const d = domain.toLowerCase();
      const l = lang.toLowerCase();
      if (d.includes('full stack') || d.includes('fullstack')) {
        if (l === 'python') return 'Python Fullstack Developer';
        if (l === 'java') return 'Java Fullstack Developer';
        return 'Full Stack Developer';
      }
      if (d.includes('web')) {
        if (l === 'javascript' || l === 'typescript') return 'Web Developer';
        if (l === 'python' || l === 'java') return 'Backend Developer';
        return 'Frontend Developer';
      }
      if (d.includes('data science') || d.includes('machine learning') || d.includes('ai')) {
        if (l === 'python') return 'AI & Data Scientist';
        if (l === 'r' || l === 'sql') return 'Data Analyst';
        return 'ML Engineer';
      }
      if (d.includes('cloud') || d.includes('devops')) return 'DevOps Engineer';
      if (d.includes('cyber') || d.includes('security')) return 'Cybersecurity Engineer';
      if (d.includes('mobile') || d.includes('android') || d.includes('ios')) return 'Mobile Developer';
      if (d.includes('blockchain')) return 'Blockchain Developer';
      if (d.includes('game')) return 'Game Developer';
      if (d.includes('qa') || d.includes('testing')) return 'QA Engineer';
      return 'Software Engineer';
    }

    const domainMapping = predictResult.domain_mapping || {};
    let predictedDomain = body.domain || 'Full Stack';
    if (!body.domain || body.domain === 'Not Decided') {
      let maxProb = -1;
      for (const [dom, prob] of Object.entries(domainMapping)) {
        if ((prob as number) > maxProb) { maxProb = prob as number; predictedDomain = dom; }
      }
    }
    const resolvedRole = mapDomainAndLanguageToRole(predictedDomain, body.preferredLang || '');

    // 5. Generate roadmap via Gemini (3 phases, all tasks AI-generated)
    console.log(`Generating Gemini roadmap: ${resolvedRole} | ${readinessTier} | ${body.placementTimeline} days`);
    const roadmapData = await generateRoadmapWithGemini({
      role: resolvedRole,
      readiness: readinessTier,
      domain: predictedDomain,
      preferredLang: body.preferredLang || 'Python',
      placementTimeline: body.placementTimeline || '45 Days',
      dailyStudyTime: body.dailyStudyTime || '2-3 hours',
      weakAreas: weak_areas.slice(0, 3),
      targetCompany: body.target || '',
      coreStrength: body.strength || '',
      projectExposure: body.exposure || '',
      codingPlatform: body.platform || '',
      aptitudeLevel: body.aptitude || '',
      commConfidence: body.comm || '',
    });

    // 6. Save to database
    const cookieStore = await cookies();
    const userEmail = cookieStore.get('user_email')?.value;
    if (!userEmail) return NextResponse.json({ error: 'User session not found' }, { status: 401 });

    const user = await prisma.user.findUnique({ where: { email: userEmail } });
    if (!user) return NextResponse.json({ error: 'User not found in database' }, { status: 404 });

    let readinessScore = 3.2;
    if (rawReadiness === 'Just Starting') readinessScore = 2.0;
    else if (rawReadiness === 'Learning Basics') readinessScore = 4.2;
    else if (rawReadiness === 'Actively Practicing') readinessScore = 6.5;
    else if (rawReadiness === 'Ready for Interviews') readinessScore = 8.8;

    // Delete old roadmap
    await prisma.solvedProblem.deleteMany({ where: { userId: user.id } });
    await prisma.task.deleteMany({ where: { phase: { roadmap: { userId: user.id } } } });
    await prisma.phase.deleteMany({ where: { roadmap: { userId: user.id } } });
    await prisma.roadmap.deleteMany({ where: { userId: user.id } });

    // Save the new Gemini-generated roadmap
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
                  status: 'PENDING',
                  type: task.type || 'TOPIC',
                  resourceName: task.resource_name || 'Explore Resource',
                  resourceLink: task.resource_url || 'https://www.geeksforgeeks.org',
                })),
            },
          })),
        },
      },
    });

    // Update user profile
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
        placementTimeline: body.placementTimeline,
      },
    });

    await prisma.activity.create({
      data: { userId: user.id, action: `Generated roadmap: ${roadmapData.title}`, status: 'SUCCESS' },
    });
    await prisma.analytics.create({
      data: { userId: user.id, metric: 'Readiness', value: readinessScore },
    });

    return NextResponse.json({
      ...predictResult,
      predictedRole: resolvedRole,
      predictedDomain,
      roadmap: roadmapData,
    });
  } catch (err: any) {
    console.error('API error during profiling/prediction:', err);
    return NextResponse.json({ error: err.message || 'Failed to process prediction and roadmap' }, { status: 500 });
  }
}
