// POST /api/resume/upload
// Accepts multipart/form-data with a "resume" file (PDF or DOCX)
// Parses it, runs AI structuring, and saves to DB.

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { aiParseResume } from "@/lib/interview/resume-analyzer";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

async function extractPdfText(buffer: Buffer): Promise<string> {
  // Method 1: pdf2json (Standard Node.js PDF parsing)
  try {
    const text = await new Promise<string>((resolve, reject) => {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const PDFParser = require("pdf2json");
      const pdfParser = new PDFParser(null, true);

      pdfParser.on("pdfParser_dataError", (errData: { parserError: Error | string }) => {
        const err = typeof errData?.parserError === "string" ? new Error(errData.parserError) : errData?.parserError;
        reject(err || new Error("Failed to parse PDF"));
      });

      pdfParser.on("pdfParser_dataReady", (pdfData: { Pages?: { Texts?: { R?: { T?: string }[] }[] }[] }) => {
        try {
          // Attempt raw text content first
          const raw = pdfParser.getRawTextContent();
          if (raw && raw.trim().length > 30) {
            resolve(raw.trim());
            return;
          }

          // Fallback to structured text extraction
          if (pdfData?.Pages) {
            const lines: string[] = [];
            for (const page of pdfData.Pages) {
              if (!page.Texts) continue;
              const pageTokens: string[] = [];
              for (const t of page.Texts) {
                if (!t.R) continue;
                for (const r of t.R) {
                  if (r.T) {
                    try {
                      pageTokens.push(decodeURIComponent(r.T));
                    } catch {
                      pageTokens.push(r.T);
                    }
                  }
                }
              }
              if (pageTokens.length > 0) {
                lines.push(pageTokens.join(" "));
              }
            }
            if (lines.length > 0) {
              resolve(lines.join("\n\n"));
              return;
            }
          }
          resolve(raw || "");
        } catch (e) {
          reject(e);
        }
      });

      pdfParser.parseBuffer(buffer);
    });

    if (text && text.trim().length > 20) {
      return text;
    }
  } catch (err) {
    console.warn("pdf2json extraction error:", err);
  }

  // Method 2: Raw PDF stream decoding fallback
  try {
    const raw = buffer.toString("latin1");
    const textBlocks: string[] = [];
    const textRegex = /BT\s*([\s\S]*?)\s*ET/g;
    let match;
    while ((match = textRegex.exec(raw)) !== null) {
      const block = match[1];
      const stringMatches = block.match(/\((.*?)\)/g);
      if (stringMatches) {
        const clean = stringMatches
          .map((s) => s.slice(1, -1).replace(/\\([()\\])/g, "$1"))
          .join(" ")
          .trim();
        if (clean.length > 1) textBlocks.push(clean);
      }
    }
    if (textBlocks.length > 5) {
      return textBlocks.join("\n");
    }
  } catch (fallbackErr) {
    console.error("PDF stream fallback error:", fallbackErr);
  }

  throw new Error("Could not extract text from this PDF. Please make sure it contains selectable text, or upload as DOCX/TXT.");
}

async function extractText(file: File): Promise<string> {
  const buffer = Buffer.from(await file.arrayBuffer());
  const name = file.name.toLowerCase();

  if (name.endsWith(".pdf")) {
    return await extractPdfText(buffer);
  } else if (name.endsWith(".docx") || name.endsWith(".doc")) {
    const mammoth = await import("mammoth");
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  } else if (name.endsWith(".txt")) {
    return buffer.toString("utf-8");
  }

  throw new Error("Unsupported file type. Please upload a PDF, DOCX, or TXT file.");
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("resume") as File | null;

    if (!file || file.size === 0) {
      return NextResponse.json({ error: "No file uploaded." }, { status: 400 });
    }

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "File size exceeds 5MB." }, { status: 400 });
    }

    // Extract text
    let rawText: string;
    try {
      rawText = await extractText(file);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Failed to extract text.";
      return NextResponse.json({ error: msg }, { status: 400 });
    }

    if (!rawText || rawText.trim().length < 20) {
      return NextResponse.json({ error: "Could not extract meaningful text from the file. Please ensure the PDF is not an image scan." }, { status: 400 });
    }

    // Parse resume with AI
    const parsedData = await aiParseResume(rawText);

    // Get userId from cookie if logged in
    const cookieStore = await cookies();
    const userEmail = cookieStore.get("user_email")?.value;
    let userId: string | null = null;
    if (userEmail) {
      const user = await prisma.user.findUnique({ where: { email: userEmail }, select: { id: true } });
      userId = user?.id ?? null;
    }

    // Save to DB
    const resume = await prisma.resume.create({
      data: {
        userId,
        fileName: file.name,
        rawText: rawText.slice(0, 50000), // cap at 50k chars
        parsedData: JSON.stringify(parsedData),
        analysis: null,
      },
    });

    return NextResponse.json({
      success: true,
      resumeId: resume.id,
      fileName: resume.fileName,
      parsedData,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Upload failed";
    console.error("Resume upload error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
