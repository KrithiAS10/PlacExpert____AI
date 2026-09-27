// src/lib/adaptive-interview.ts

export type InterviewLevel = "low" | "mid" | "high";

export interface ResumeProfile {
  rawText?: string;
  skills: string[];
  frameworks: string[];
  languages: string[];
  tools: string[];
  domains: string[];
  summary: string;
  experienceLevel: "Entry" | "Mid" | "Senior" | "Fresher";
}

export interface AdaptiveQuestion {
  question: string;
  topic: string;
  followUpOnNewTerm?: string;
  difficulty: InterviewLevel;
}

export interface GradeResult {
  score: number;
  feedback: string;
  strengths?: string[];
  gaps?: string[];
  isZeroScore: boolean;
}

export interface InterviewRecord {
  id: string;
  question: string;
  topic: string;
  answer: string;
  score: number;
  feedback: string;
  followUpTerm?: string;
  difficulty: InterviewLevel;
  timestamp: string;
}

export interface SessionSummary {
  averageScore: number;
  readinessPercent: number;
  readinessNote: string;
  totalQuestions: number;
  records: InterviewRecord[];
  strengths: string[];
  targetAreas: string[];
  level: InterviewLevel;
}

// Known common CS and tech keywords for term detection
export const COMMON_TECH_TERMS = [
  "react", "next.js", "nextjs", "vue", "angular", "svelte", "typescript", "javascript",
  "python", "django", "flask", "fastapi", "golang", "go", "rust", "c++", "c#", "java", "spring", "spring boot",
  "nodejs", "express", "nestjs", "graphql", "rest", "grpc", "websockets", "microservices",
  "docker", "kubernetes", "k8s", "terraform", "aws", "gcp", "azure", "ci/cd", "github actions",
  "postgresql", "postgres", "mysql", "mongodb", "redis", "cassandra", "dynamodb", "elasticsearch", "kafka", "rabbitmq",
  "prisma", "drizzle", "typeorm", "hibernate", "sql", "nosql", "acid", "cap theorem",
  "jwt", "oauth", "cors", "csrf", "sso", "ssl", "tls", "rate limiting", "load balancing",
  "redux", "zustand", "mobx", "tailwind", "styled-components", "sass", "webpack", "vite",
  "sharding", "replication", "caching", "cdn", "index", "b-tree", "bloom filter", "consistent hashing",
  "event-driven", "pub/sub", "cqrs", "event sourcing", "saga pattern", "concurrency", "multithreading", "async/await"
];

// Helper to extract newly introduced technical terms not in the resume skills
export function extractNewTechnicalTerms(answerText: string, knownResumeSkills: string[]): string[] {
  if (!answerText) return [];
  const lowerAnswer = answerText.toLowerCase();
  const normalizedKnown = new Set(
    knownResumeSkills.map((s) => s.toLowerCase().trim().replace(/[^a-z0-9]/g, ""))
  );

  const foundNewTerms: string[] = [];

  for (const term of COMMON_TECH_TERMS) {
    const cleanTerm = term.toLowerCase().replace(/[^a-z0-9]/g, "");
    if (!normalizedKnown.has(cleanTerm)) {
      // Regex boundary check
      const regex = new RegExp(`\\b${term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i");
      if (regex.test(lowerAnswer)) {
        foundNewTerms.push(term);
      }
    }
  }

  return Array.from(new Set(foundNewTerms));
}

// Fast heuristic fallback for resume parsing
export function parseResumeHeuristic(text: string): ResumeProfile {
  const lower = text.toLowerCase();
  const foundSkills: string[] = [];
  const foundLanguages: string[] = [];
  const foundFrameworks: string[] = [];
  const foundTools: string[] = [];
  const foundDomains: string[] = [];

  const languagesList = ["javascript", "typescript", "python", "java", "c++", "c#", "golang", "go", "rust", "php", "ruby", "sql", "html", "css"];
  const frameworksList = ["react", "next.js", "nextjs", "vue", "angular", "node.js", "nodejs", "express", "fastapi", "django", "flask", "spring boot", "tailwind", "redux"];
  const toolsList = ["docker", "kubernetes", "aws", "gcp", "azure", "git", "github", "linux", "postgresql", "postgres", "mongodb", "mysql", "redis", "prisma", "kafka"];
  const domainsList = ["full stack", "frontend", "backend", "machine learning", "data science", "devops", "cloud computing", "distributed systems", "cybersecurity", "mobile development"];

  const escapeRegExp = (string: string) => string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  languagesList.forEach((lang) => {
    if (new RegExp(`(^|[^a-zA-Z0-9+#])${escapeRegExp(lang)}($|[^a-zA-Z0-9+#])`, "i").test(lower)) {
      foundLanguages.push(lang);
      foundSkills.push(lang);
    }
  });

  frameworksList.forEach((fw) => {
    if (new RegExp(`(^|[^a-zA-Z0-9+#])${escapeRegExp(fw)}($|[^a-zA-Z0-9+#])`, "i").test(lower)) {
      foundFrameworks.push(fw);
      foundSkills.push(fw);
    }
  });

  toolsList.forEach((tool) => {
    if (new RegExp(`(^|[^a-zA-Z0-9+#])${escapeRegExp(tool)}($|[^a-zA-Z0-9+#])`, "i").test(lower)) {
      foundTools.push(tool);
      foundSkills.push(tool);
    }
  });

  domainsList.forEach((dom) => {
    if (lower.includes(dom)) {
      foundDomains.push(dom);
    }
  });

  if (foundSkills.length === 0) {
    foundSkills.push("JavaScript", "React", "Node.js", "SQL", "Git");
    foundLanguages.push("JavaScript", "SQL");
    foundFrameworks.push("React", "Node.js");
  }

  let experienceLevel: ResumeProfile["experienceLevel"] = "Fresher";
  if (lower.includes("senior") || lower.includes("lead") || lower.includes("5+ years") || lower.includes("architect")) {
    experienceLevel = "Senior";
  } else if (lower.includes("mid-level") || lower.includes("3+ years") || lower.includes("2 years") || lower.includes("software engineer")) {
    experienceLevel = "Mid";
  } else if (lower.includes("junior") || lower.includes("intern") || lower.includes("entry")) {
    experienceLevel = "Entry";
  }

  const cleanLines = text.split("\n").map(l => l.trim()).filter(Boolean);
  const snippet = cleanLines.slice(0, 3).join(". ");
  const summary = snippet.length > 30 
    ? snippet 
    : `Candidate profile specializing in ${foundDomains[0] || "Software Engineering"} with core competencies in ${foundSkills.slice(0, 4).join(", ")}.`;

  return {
    rawText: text,
    skills: Array.from(new Set(foundSkills)),
    frameworks: Array.from(new Set(foundFrameworks)),
    languages: Array.from(new Set(foundLanguages)),
    tools: Array.from(new Set(foundTools)),
    domains: foundDomains.length ? Array.from(new Set(foundDomains)) : ["Full Stack Development"],
    summary,
    experienceLevel,
  };
}
