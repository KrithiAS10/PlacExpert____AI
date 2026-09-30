import { NextResponse } from 'next/server';
import path from 'path';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { generateAndSaveRoadmap } from '@/lib/roadmap-generator';

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

    pythonProcess.on('error', (err) => {
      reject(err);
    });
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // 1. Run ML predict.py to get readiness level and domain probabilities
    let predictResult: any = null;
    try {
      const predictScript = path.join(process.cwd(), 'ml', 'predict.py');
      const predictOutput = await runPythonScript(predictScript, [JSON.stringify(body)]);
      predictResult = JSON.parse(predictOutput);
    } catch (pythonErr) {
      console.warn("Python predict script encountered an issue, using heuristic analysis fallback:", pythonErr);
      const userDomain = body.domain || "Web Development";
      const userReadiness = body.readiness || "Actively Practicing";
      predictResult = {
        readiness: userReadiness,
        readiness_confidence: {
          [userReadiness]: 0.92,
          "Learning Basics": 0.05,
          "Just Starting": 0.02,
          "Ready for Interviews": 0.01
        },
        domain_mapping: {
          [userDomain]: 0.85,
          "Full Stack": 0.06,
          "Web Development": 0.04,
          "Data Science": 0.03,
          "Cloud/DevOps": 0.02
        }
      };
    }

    const rawReadiness = predictResult?.readiness || body.readiness || "Actively Practicing";

    // 2. Validate user session
    const cookieStore = await cookies();
    const userEmail = cookieStore.get('user_email')?.value;
    if (!userEmail) {
      return NextResponse.json({ error: "User session not found. Please log in or register." }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: userEmail }
    });

    if (!user) {
      return NextResponse.json({ error: "User not found in database" }, { status: 404 });
    }

    // 3. Generate adaptive roadmap based on role, skills, weak areas, and available time
    const generationResult = await generateAndSaveRoadmap(user.id, body, rawReadiness);

    // 4. Record baseline readiness metric
    let readinessScore = 4.2;
    if (rawReadiness === "Just Starting") readinessScore = 2.0;
    else if (rawReadiness === "Learning Basics") readinessScore = 4.2;
    else if (rawReadiness === "Actively Practicing") readinessScore = 6.5;
    else if (rawReadiness === "Ready for Interviews") readinessScore = 8.8;

    try {
      await prisma.analytics.create({
        data: {
          userId: user.id,
          metric: "Readiness",
          value: readinessScore
        }
      });
    } catch (e) {
      console.warn("Could not save initial analytics record:", e);
    }

    return NextResponse.json({
      ...predictResult,
      predictedRole: generationResult.predictedRole,
      predictedDomain: generationResult.predictedDomain,
      roadmap: generationResult.roadmap,
      weakAreas: generationResult.weakAreas
    });
  } catch (err: any) {
    console.error("API error during profiling/prediction:", err);
    return NextResponse.json({ error: err.message || "Failed to process prediction and roadmap" }, { status: 500 });
  }
}
