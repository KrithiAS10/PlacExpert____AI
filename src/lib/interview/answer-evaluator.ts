// ─── Answer Evaluator Service ─────────────────────────────────────────────────
// Evaluates candidate answers using AI. Checks resume consistency.

import { callAI, parseJSON } from "./ai-provider";
import type { AnswerEvaluation, ParsedResume, GeneratedQuestion } from "./types";

export async function evaluateAnswer(
  question: GeneratedQuestion,
  answer: string,
  resume: ParsedResume,
  durationSeconds = 0
): Promise<AnswerEvaluation> {
  const systemPrompt = `You are an expert interviewer evaluating a candidate's answer.
Evaluate objectively and return ONLY valid JSON. Do NOT reveal scores to the candidate.
Base your evaluation on the quality, correctness, and relevance of the answer.
Also check if the answer is consistent with what the candidate claims on their resume.

JSON schema:
{
  "score": 0-10,
  "technicalCorrectness": 0-10,
  "relevance": 0-10,
  "clarity": 0-10,
  "completeness": 0-10,
  "confidence": 0-10,
  "strengths": ["string"],
  "weaknesses": ["string"],
  "knowledgeGaps": ["string"],
  "feedback": "string (constructive, 2-3 sentences)",
  "resumeConsistency": "CONSISTENT|POTENTIAL_GAP|NOT_APPLICABLE"
}

Scoring guide:
- score 9-10: Outstanding, comprehensive, demonstrates mastery
- score 7-8: Strong, covers key concepts well
- score 5-6: Adequate, some gaps but understands basics
- score 3-4: Partial, missing important concepts
- score 1-2: Very weak, major misunderstandings
- score 0: No meaningful answer / gibberish`;

  const resumeContext = `
Candidate's Resume Claims:
- Skills: ${resume.skills.join(", ")}
- Technologies: ${resume.technologies.join(", ")}
- Projects: ${resume.projects.map((p) => `${p.name} (${p.technologies?.join(", ")})`).join("; ")}
- Experience: ${resume.experience.map((e) => e.title).join(", ")}`;

  const userPrompt = `Question: ${question.question}
Category: ${question.category}
Topic: ${question.topic}
Expected Difficulty: ${question.difficulty}
${durationSeconds > 0 ? `Answer Duration: ${durationSeconds} seconds` : ""}

${resumeContext}

Candidate's Answer:
"${answer}"

Evaluate the answer. If the candidate claims to know something that contradicts their resume, set resumeConsistency to POTENTIAL_GAP.`;

  const fallback: AnswerEvaluation = heuristicEvaluate(question, answer, resume, durationSeconds);

  try {
    const raw = await callAI(systemPrompt, userPrompt, true);
    const parsed = parseJSON<AnswerEvaluation>(raw, fallback);

    // Clamp all scores
    return {
      score: clamp(parsed.score ?? fallback.score),
      technicalCorrectness: clamp(parsed.technicalCorrectness ?? fallback.technicalCorrectness),
      relevance: clamp(parsed.relevance ?? fallback.relevance),
      clarity: clamp(parsed.clarity ?? fallback.clarity),
      completeness: clamp(parsed.completeness ?? fallback.completeness),
      confidence: clamp(parsed.confidence ?? fallback.confidence),
      strengths: parsed.strengths?.length ? parsed.strengths : fallback.strengths,
      weaknesses: parsed.weaknesses?.length ? parsed.weaknesses : fallback.weaknesses,
      knowledgeGaps: parsed.knowledgeGaps?.length ? parsed.knowledgeGaps : fallback.knowledgeGaps,
      feedback: parsed.feedback || fallback.feedback,
      resumeConsistency: parsed.resumeConsistency,
    };
  } catch {
    return fallback;
  }
}

// ─── Heuristic fallback evaluator ─────────────────────────────────────────────

function heuristicEvaluate(
  question: GeneratedQuestion,
  answer: string,
  resume: ParsedResume,
  durationSeconds = 0
): AnswerEvaluation {
  const words = answer.trim().split(/\s+/).filter(Boolean);
  const wordCount = words.length;
  const fillerCount = (answer.match(/\b(um+|uh+|like|basically|you know|kinda)\b/gi) ?? []).length;
  const hasExample = /\b(example|project|built|created|implemented|developed|led|worked)\b/i.test(answer);
  const hasOutcome = /\b(result|outcome|impact|improved|reduced|increased|achieved|resolved)\b/i.test(answer);
  const hasTechTerms = (resume.technologies || []).some((t) => {
    const escaped = t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const pattern = new RegExp(`(?:^|[\\s,;.:/()[\\]{}<>"'])${escaped}(?=[\\s,;.:/()[\\]{}<>"']|$)`, "i");
    return pattern.test(answer);
  });

  // Base scores
  let relevance = wordCount >= 30 ? 6 : wordCount >= 15 ? 4 : 2;
  if (hasTechTerms) relevance = Math.min(10, relevance + 2);
  const clarity = Math.min(10, wordCount >= 60 ? 7 : wordCount >= 30 ? 5 : 3);
  const completeness = hasExample && hasOutcome ? 7 : hasExample ? 5 : 3;
  const technicalCorrectness = hasTechTerms ? 6 : 4;
  const durationMin = durationSeconds > 0 ? durationSeconds / 60 : Math.max(0.5, wordCount / 120);
  const wpm = Math.round(wordCount / durationMin);
  const confidence = Math.max(2, Math.min(8, 8 - fillerCount * 0.5)) + (wpm > 100 && wpm < 200 ? 1 : 0);

  const score = clamp(
    Math.round(((relevance + clarity + completeness + technicalCorrectness + confidence) / 5) * 10) / 10
  );

  const strengths: string[] = [];
  const weaknesses: string[] = [];
  const knowledgeGaps: string[] = [];

  if (relevance >= 6) strengths.push("Answer addresses the question.");
  if (hasExample) strengths.push("Includes a concrete example.");
  if (hasOutcome) strengths.push("Mentions results or outcomes.");
  if (wordCount < 30) weaknesses.push("Answer is too brief. Provide more detail.");
  if (!hasExample) weaknesses.push("Add a real example or project reference.");
  if (fillerCount > 2) weaknesses.push("Reduce filler words for clarity.");
  if (!hasTechTerms && question.category === "Technical") {
    knowledgeGaps.push(`Didn't reference relevant technical terms for topic: ${question.topic}`);
  }

  return {
    score,
    technicalCorrectness: clamp(technicalCorrectness),
    relevance: clamp(relevance),
    clarity: clamp(clarity),
    completeness: clamp(completeness),
    confidence: clamp(confidence),
    strengths: strengths.length ? strengths : ["Attempted the question."],
    weaknesses: weaknesses.length ? weaknesses : ["Continue to add more depth."],
    knowledgeGaps,
    feedback: score >= 7
      ? "Good answer with relevant content. Keep expanding on specific examples."
      : score >= 4
      ? "Decent attempt. Add more depth, technical terms, and concrete examples."
      : "The answer needs significant improvement. Review the concept and try again.",
    resumeConsistency: "NOT_APPLICABLE",
  };
}

function clamp(n: number, min = 0, max = 10): number {
  return Math.min(max, Math.max(min, Math.round(n * 10) / 10));
}
