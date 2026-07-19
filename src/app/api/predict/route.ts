import { NextResponse } from 'next/server';
import path from 'path';
import { prisma } from '@/lib/prisma';

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
    
    // 2. Map readiness level to Beginner/Intermediate/Advanced for roadmap_engine
    const rawReadiness = predictResult.readiness;
    let mappedReadiness = "Beginner";
    if (rawReadiness === "Actively Practicing") {
      mappedReadiness = "Intermediate";
    } else if (rawReadiness === "Ready for Interviews") {
      mappedReadiness = "Advanced";
    }
    
    // 3. Compute weak areas based on profiling answers
    const weak_areas: string[] = [];
    if (body.strength !== "DSA") weak_areas.push("DSA");
    if (body.strength !== "DBMS") weak_areas.push("DBMS");
    if (body.strength !== "OS") weak_areas.push("OS");
    if (body.strength !== "Networking") weak_areas.push("CN");
    const finalWeakAreas = weak_areas.slice(0, 3);
    
    // 4. Generate roadmap using roadmap_engine.py
    const roadmapParams = {
      readiness: mappedReadiness,
      daily_study_time: body.dailyStudyTime || "2-3 hours",
      preferred_language: body.preferredLang || "Python",
      placement_timeline: body.placementTimeline || "45 Days",
      weak_areas: finalWeakAreas,
      domain_interest: body.domain || "Full Stack",
      core_cs_strength: body.strength || "None",
      coding_platform: body.platform || "LeetCode"
    };
    
    const roadmapScript = path.join(process.cwd(), 'ml', 'roadmap_engine.py');
    const roadmapOutput = await runPythonScript(roadmapScript, [JSON.stringify(roadmapParams)]);
    const roadmapData = JSON.parse(roadmapOutput);
    
    // 5. Update user and save roadmap to database
    const userEmail = "krithi@example.com";
    const user = await prisma.user.findUnique({
      where: { email: userEmail }
    });
    
    if (!user) {
      return NextResponse.json({ error: "Default user krithi@example.com not found in database" }, { status: 404 });
    }
    
    // Calculate numeric readiness score
    let readinessScore = 3.2;
    if (rawReadiness === "Just Starting") readinessScore = 2.0;
    else if (rawReadiness === "Learning Basics") readinessScore = 4.2;
    else if (rawReadiness === "Actively Practicing") readinessScore = 6.5;
    else if (rawReadiness === "Ready for Interviews") readinessScore = 8.8;
    
    // Delete existing roadmap database entries for user to reset
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
        description: `Personalized prep track for ${roadmapParams.preferred_language}`,
        userId: user.id,
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
    
    // Update user profile and stats
    await prisma.user.update({
      where: { id: user.id },
      data: {
        readinessScore: readinessScore,
        currentDay: 1,
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
      roadmap: roadmapData
    });
  } catch (err: any) {
    console.error("API error during profiling/prediction:", err);
    return NextResponse.json({ error: err.message || "Failed to process prediction and roadmap" }, { status: 500 });
  }
}
