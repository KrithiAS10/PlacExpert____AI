import { NextResponse } from "next/server";
import path from "path";

export const dynamic = "force-dynamic";

async function runPythonScript(scriptPath: string, args: string[]): Promise<string> {
  const { spawn } = await import("child_process");
  return new Promise((resolve, reject) => {
    const process = spawn("python", [scriptPath, ...args]);
    let stdout = "";
    let stderr = "";

    process.stdout.on("data", (data) => {
      stdout += data.toString();
    });
    process.stderr.on("data", (data) => {
      stderr += data.toString();
    });
    process.on("close", (code) => {
      if (code !== 0) {
        reject(new Error(`Python exited with code ${code}. stderr: ${stderr.slice(0, 400)}`));
      } else {
        resolve(stdout);
      }
    });
    process.on("error", (err) => {
      reject(new Error(`Failed to spawn Python: ${err.message}`));
    });
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { domain, question, answer } = body as {
      domain: string;
      question: string;
      answer: string;
    };

    if (!domain || !question || !answer || typeof answer !== "string") {
      return NextResponse.json({ error: "Missing required fields: domain, question, answer" }, { status: 400 });
    }

    const scriptPath = path.join(process.cwd(), "ml", "interview_evaluator.py");
    const payload = JSON.stringify({ domain, question, answer });

    const output = await runPythonScript(scriptPath, [payload]);
    const result = JSON.parse(output.trim());

    return NextResponse.json(result);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Interview evaluate error:", message);

    // If Python/model not available, return fallback so UI does not break
    return NextResponse.json(
      {
        error: "ml_unavailable",
        message: message,
        interview_score: null,
        similarity_score: null,
        concept_coverage: null,
        strengths: [],
        weaknesses: [],
        missing_concepts: [],
        mentioned_concepts: [],
        suggestions: [],
      },
      { status: 200 }
    );
  }
}
