import { NextResponse } from 'next/server';
import path from 'path';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const inputJson = JSON.stringify(body);
    
    // Command to run python prediction script
    // Note: In production, you'd use a persistent python service or a library
    const scriptPath = path.join(process.cwd(), 'ml', 'predict.py');
    const { spawn } = await import('child_process');
    
    return new Promise<NextResponse>((resolve) => {
      const pythonProcess = spawn('python', [scriptPath, inputJson]);
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
          console.error(`Python process exited with code ${code}, stderr: ${stderr}`);
          return resolve(NextResponse.json({ error: 'Prediction failed' }, { status: 500 }));
        }
        try {
          const result = JSON.parse(stdout);
          resolve(NextResponse.json(result));
        } catch (e) {
          console.error(`Parse error: ${e}, stdout: ${stdout}`);
          resolve(NextResponse.json({ error: 'Failed to parse prediction' }, { status: 500 }));
        }
      });
    });
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
