// ─── Resume Analyzer Service ──────────────────────────────────────────────────
// Parses raw resume text into structured JSON and generates an AI analysis.

import { callAI, parseJSON } from "./ai-provider";
import type { ParsedResume, ResumeAnalysis } from "./types";

// ─── Heuristic Parser (no AI needed) ─────────────────────────────────────────
// Used as primary extractor; AI then enriches and structures the result.

export function heuristicParseResume(rawText: string): ParsedResume {
  const lines = rawText.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);

  // Name: usually the first non-empty line that looks like a proper name
  const nameLine = lines.find(
    (l) => l.length > 3 && l.length < 60 && /^[A-Z]/.test(l) && !/[@:|]/.test(l)
  );
  const name = nameLine ?? "Candidate";

  // Skills: lines after "skills", "technical skills", etc.
  const skills: string[] = [];
  const skillsStart = lines.findIndex((l) =>
    /^(technical\s+)?skills?/i.test(l)
  );
  if (skillsStart !== -1) {
    for (let i = skillsStart + 1; i < Math.min(skillsStart + 15, lines.length); i++) {
      const l = lines[i];
      if (/^(education|experience|project|internship|certif|work)/i.test(l)) break;
      const tokens = l.split(/[,|•·▪–\-\/\s]+/).filter((t) => t.length > 1);
      skills.push(...tokens);
    }
  }

  // Extract technologies from the full text
  const techKeywords = [
    "React", "Next.js", "Node.js", "Python", "Java", "JavaScript", "TypeScript",
    "C++", "C#", "Go", "Rust", "Swift", "Kotlin", "PHP", "Ruby", "SQL",
    "MongoDB", "PostgreSQL", "MySQL", "SQLite", "Redis", "Firebase",
    "Express", "Django", "Flask", "Spring", "FastAPI", "GraphQL", "REST",
    "Docker", "Kubernetes", "AWS", "Azure", "GCP", "Linux", "Git",
    "TensorFlow", "PyTorch", "scikit-learn", "Pandas", "NumPy",
    "HTML", "CSS", "Tailwind", "Bootstrap", "Vue", "Angular",
  ];
  const technologies: string[] = [];
  for (const tech of techKeywords) {
    const escaped = tech.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const pattern = new RegExp(`(?:^|[\\s,;.:/()[\\]{}<>"'])${escaped}(?=[\\s,;.:/()[\\]{}<>"']|$)`, "i");
    if (pattern.test(rawText)) {
      technologies.push(tech);
    }
  }

  // Projects section
  const projects: ParsedResume["projects"] = [];
  const projStart = lines.findIndex((l) => /^projects?/i.test(l));
  if (projStart !== -1) {
    let current: (typeof projects)[0] | null = null;
    for (let i = projStart + 1; i < Math.min(projStart + 40, lines.length); i++) {
      const l = lines[i];
      if (/^(education|experience|internship|certif|work|skill)/i.test(l)) break;
      if (l.length > 5 && /^[A-Z]/.test(l) && !l.startsWith("•")) {
        current = { name: l, description: "", technologies: [] };
        projects.push(current);
      } else if (current) {
        current.description = ((current.description ?? "") + " " + l).trim();
      }
    }
  }

  // Education
  const education: ParsedResume["education"] = [];
  const eduStart = lines.findIndex((l) => /^education/i.test(l));
  if (eduStart !== -1) {
    for (let i = eduStart + 1; i < Math.min(eduStart + 20, lines.length); i++) {
      const l = lines[i];
      if (/^(experience|project|internship|certif|work|skill)/i.test(l)) break;
      if (l.length > 5) {
        education.push({ institution: l });
      }
    }
  }

  // Experience
  const experience: ParsedResume["experience"] = [];
  const expStart = lines.findIndex((l) => /^(work\s+)?experience/i.test(l));
  if (expStart !== -1) {
    let current: (typeof experience)[0] | null = null;
    for (let i = expStart + 1; i < Math.min(expStart + 30, lines.length); i++) {
      const l = lines[i];
      if (/^(education|project|internship|certif|skill)/i.test(l)) break;
      if (l.length > 5 && /^[A-Z]/.test(l)) {
        current = { title: l, responsibilities: [] };
        experience.push(current);
      } else if (current && l.startsWith("•")) {
        current.responsibilities = [...(current.responsibilities ?? []), l.slice(1).trim()];
      }
    }
  }

  // Certifications
  const certifications: string[] = [];
  const certStart = lines.findIndex((l) => /^certif/i.test(l));
  if (certStart !== -1) {
    for (let i = certStart + 1; i < Math.min(certStart + 10, lines.length); i++) {
      const l = lines[i];
      if (/^(education|experience|project|internship|skill|achieve)/i.test(l)) break;
      if (l.length > 3) certifications.push(l);
    }
  }

  // Achievements
  const achievements: string[] = [];
  const achStart = lines.findIndex((l) => /^(achievement|award|honor)/i.test(l));
  if (achStart !== -1) {
    for (let i = achStart + 1; i < Math.min(achStart + 10, lines.length); i++) {
      const l = lines[i];
      if (/^(education|experience|project|internship|skill|certif)/i.test(l)) break;
      if (l.length > 3) achievements.push(l);
    }
  }

  return {
    name,
    skills: Array.from(new Set(skills.filter((s) => s.length > 1))).slice(0, 30),
    education: education.slice(0, 5),
    projects: projects.slice(0, 10),
    experience: experience.slice(0, 10),
    internships: [],
    certifications: certifications.slice(0, 10),
    achievements: achievements.slice(0, 10),
    technologies: Array.from(new Set(technologies)),
  };
}

// ─── AI Resume Structuring ────────────────────────────────────────────────────

export async function aiParseResume(rawText: string): Promise<ParsedResume> {
  const heuristic = heuristicParseResume(rawText);

  const systemPrompt = `You are a resume parser. Extract structured information from the resume text.
Return ONLY valid JSON matching this exact schema (no markdown, no explanation):
{
  "name": "string",
  "skills": ["string"],
  "education": [{"degree":"string","institution":"string","year":"string","gpa":"string"}],
  "projects": [{"name":"string","description":"string","technologies":["string"]}],
  "experience": [{"title":"string","company":"string","duration":"string","responsibilities":["string"]}],
  "internships": [{"role":"string","company":"string","duration":"string","responsibilities":["string"]}],
  "certifications": ["string"],
  "achievements": ["string"],
  "technologies": ["string"]
}
- Extract ALL technologies mentioned anywhere in the resume.
- projects.technologies should list every tech used in that project.
- If a field is not found, use an empty array.`;

  try {
    const raw = await callAI(systemPrompt, rawText, true);
    const parsed = parseJSON<ParsedResume>(raw, heuristic);
    // Ensure required fields
    return {
      name: parsed.name || heuristic.name,
      skills: (parsed.skills?.length ? parsed.skills : heuristic.skills).slice(0, 40),
      education: parsed.education ?? heuristic.education,
      projects: parsed.projects ?? heuristic.projects,
      experience: parsed.experience ?? heuristic.experience,
      internships: parsed.internships ?? [],
      certifications: parsed.certifications ?? heuristic.certifications,
      achievements: parsed.achievements ?? heuristic.achievements,
      technologies: (parsed.technologies?.length ? parsed.technologies : heuristic.technologies),
    };
  } catch {
    return heuristic;
  }
}

// ─── AI Resume Analysis ────────────────────────────────────────────────────────

export async function analyzeResume(
  parsedResume: ParsedResume,
  rawText: string
): Promise<ResumeAnalysis> {
  const resumeContext = JSON.stringify(parsedResume, null, 2);

  const systemPrompt = `You are a senior technical recruiter analyzing a candidate's resume for interview preparation.
Return ONLY valid JSON with this schema:
{
  "strongestSkills": ["string"],
  "technicalAreas": ["string"],
  "projectSummaries": ["string"],
  "experienceLevel": "fresher|junior|mid|senior",
  "potentialInterviewTopics": ["string"],
  "testableSkills": ["string"],
  "weakAreas": ["string"],
  "overallProfileSummary": "string"
}
- strongestSkills: top 5-8 skills that appear prominent
- technicalAreas: domains (web dev, DSA, ML, cloud, etc.)
- projectSummaries: 1-line summary of each notable project
- experienceLevel: estimate based on overall experience
- potentialInterviewTopics: specific topics worth asking about
- testableSkills: skills that can be validated through interview questions
- weakAreas: gaps or thin areas that need attention
- overallProfileSummary: 2-3 sentence summary`;

  const userPrompt = `Parsed resume:\n${resumeContext}\n\nRaw resume text:\n${rawText.slice(0, 3000)}`;

  const fallback: ResumeAnalysis = {
    strongestSkills: parsedResume.skills.slice(0, 6),
    technicalAreas: parsedResume.technologies.slice(0, 5),
    projectSummaries: parsedResume.projects.map((p) => p.name ?? "Project").slice(0, 5),
    experienceLevel: "fresher",
    potentialInterviewTopics: parsedResume.skills.slice(0, 8),
    testableSkills: parsedResume.skills.slice(0, 6),
    weakAreas: [],
    overallProfileSummary: `${parsedResume.name} is a candidate with skills in ${parsedResume.skills.slice(0, 3).join(", ")}.`,
  };

  try {
    const raw = await callAI(systemPrompt, userPrompt, true);
    return parseJSON<ResumeAnalysis>(raw, fallback);
  } catch {
    return fallback;
  }
}
