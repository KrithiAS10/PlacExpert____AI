import { promises as fs } from "fs";
import path from "path";
import { NextResponse } from "next/server";
import type { MockInterviewDomain } from "@/lib/mock-interview-data";

const DATASET_PATH = path.join(process.cwd(), "src", "lib", "ai_interview_qa_dataset.csv");

export const dynamic = "force-dynamic";

const STOP_WORDS = new Set([
  "about",
  "after",
  "aligns",
  "also",
  "based",
  "been",
  "being",
  "between",
  "bring",
  "could",
  "from",
  "have",
  "here",
  "into",
  "once",
  "that",
  "their",
  "them",
  "then",
  "there",
  "these",
  "this",
  "with",
  "work",
  "would",
  "your",
]);

function parseCsvLine(line: string) {
  const values: string[] = [];
  let current = "";
  let quoted = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    const next = line[index + 1];

    if (char === '"' && quoted && next === '"') {
      current += '"';
      index += 1;
    } else if (char === '"') {
      quoted = !quoted;
    } else if (char === "," && !quoted) {
      values.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }

  values.push(current.trim());
  return values;
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function buildKeyConcepts(answer: string) {
  const words = answer
    .toLowerCase()
    .replace(/[^a-z0-9+#.\s]/g, " ")
    .split(/\s+/)
    .filter((word) => word.length > 3 && !STOP_WORDS.has(word));

  return Array.from(new Set(words)).slice(0, 10);
}

export async function GET() {
  try {
    const csv = await fs.readFile(DATASET_PATH, "utf8");
    const [headerLine, ...rows] = csv.split(/\r?\n/).filter(Boolean);
    const headers = parseCsvLine(headerLine).map((header) => header.toLowerCase());
    const domains = new Map<string, MockInterviewDomain>();

    rows.forEach((row, index) => {
      const values = parseCsvLine(row);
      const record = Object.fromEntries(headers.map((header, headerIndex) => [header, values[headerIndex] ?? ""]));
      const question = record.question?.trim();
      const answer = record.answer?.trim();
      const category = record.category?.trim() || "General";
      const difficulty = record.difficulty?.trim();
      const expectedQuality = record.response_quality?.trim();
      const reviewerTone = record.feedback?.trim();
      const intent = record.intent?.trim();

      if (!question || !answer) return;

      const id = slugify(category) || "general";
      const domain = domains.get(id) ?? {
        id,
        name: category,
        questions: [],
      };

      domain.questions.push({
        id: `${id}-${index + 1}`,
        question,
        idealAnswer: answer,
        keyConcepts: buildKeyConcepts(answer),
        difficulty,
        expectedQuality,
        reviewerTone,
        intent,
      });

      domains.set(id, domain);
    });

    return NextResponse.json({
      source: "src/lib/ai_interview_qa_dataset.csv",
      domains: Array.from(domains.values()),
    }, {
      headers: {
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("Failed to load mock interview CSV:", error);
    return NextResponse.json(
      {
        error: "Failed to load mock interview CSV",
        domains: [],
      },
      { status: 500 }
    );
  }
}
