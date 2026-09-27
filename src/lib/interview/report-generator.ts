// ─── Report Generator Service ─────────────────────────────────────────────────
// Generates the final interview report after all questions are answered.

import { callAI, parseJSON } from "./ai-provider";
import type { InterviewReport, ParsedResume, ResumeAnalysis, QAPair, InterviewConfig } from "./types";

export async function generateInterviewReport(
  resume: ParsedResume,
  analysis: ResumeAnalysis,
  config: InterviewConfig,
  history: QAPair[]
): Promise<InterviewReport> {
  // Calculate component scores from history
  const avgScore = avg(history.map((h) => h.score));
  const avgTechnical = avg(history.filter((h) => h.category === "Technical" || h.category === "Project").map((h) => h.evaluation.technicalCorrectness));
  const avgClarity = avg(history.map((h) => h.evaluation.clarity));
  const avgCompleteness = avg(history.map((h) => h.evaluation.completeness));
  const avgConfidence = avg(history.map((h) => h.evaluation.confidence));

  const systemPrompt = `You are a senior hiring manager generating a final interview performance report.
Return ONLY valid JSON with this schema:
{
  "overallScore": 0-10,
  "technicalScore": 0-10,
  "communicationScore": 0-10,
  "problemSolvingScore": 0-10,
  "resumeKnowledgeScore": 0-10,
  "confidenceScore": 0-10,
  "summary": "3-4 sentence executive summary",
  "strengths": ["string - specific strength observed"],
  "weaknesses": ["string - specific weakness to address"],
  "knowledgeGaps": ["string - specific topic to study"],
  "resumePerformance": ["string - which resume claim was demonstrated/not demonstrated"],
  "improvementSuggestions": ["string - actionable suggestion"],
  "preparationTopics": ["string - prioritized topic to study"]
}

Be specific, constructive, and honest. Base everything on the actual Q&A history.`;

  const historyContext = history
    .map(
      (h, i) =>
        `Q${i + 1} [${h.category}/${h.topic}] (Score: ${h.score}/10):
Question: ${h.question}
Answer: ${h.answer.slice(0, 300)}
Feedback: ${h.evaluation.feedback}`
    )
    .join("\n\n");

  const userPrompt = `Candidate: ${resume.name}
Target Role: ${config.targetRole || "Not specified"}
Interview Type: ${config.interviewType} | Difficulty: ${config.difficulty}
Total Questions: ${history.length}

Computed Scores:
- Average Overall: ${avgScore.toFixed(1)}/10
- Technical Correctness: ${avgTechnical.toFixed(1)}/10
- Clarity/Communication: ${avgClarity.toFixed(1)}/10
- Completeness: ${avgCompleteness.toFixed(1)}/10
- Confidence: ${avgConfidence.toFixed(1)}/10

Resume Skills: ${resume.skills.join(", ")}
Resume Technologies: ${resume.technologies.join(", ")}
Analysis Weak Areas: ${analysis.weakAreas.join(", ")}

Q&A History:
${historyContext}

Generate the final interview report.`;

  const fallback = buildFallbackReport(avgScore, avgTechnical, avgClarity, avgCompleteness, avgConfidence, history, analysis);

  try {
    const raw = await callAI(systemPrompt, userPrompt, true);
    const parsed = parseJSON<InterviewReport>(raw, fallback);

    return {
      overallScore: clamp(parsed.overallScore ?? avgScore),
      technicalScore: clamp(parsed.technicalScore ?? avgTechnical),
      communicationScore: clamp(parsed.communicationScore ?? avgClarity),
      problemSolvingScore: clamp(parsed.problemSolvingScore ?? avgCompleteness),
      resumeKnowledgeScore: clamp(parsed.resumeKnowledgeScore ?? avgScore),
      confidenceScore: clamp(parsed.confidenceScore ?? avgConfidence),
      summary: parsed.summary || fallback.summary,
      strengths: parsed.strengths?.length ? parsed.strengths : fallback.strengths,
      weaknesses: parsed.weaknesses?.length ? parsed.weaknesses : fallback.weaknesses,
      knowledgeGaps: parsed.knowledgeGaps?.length ? parsed.knowledgeGaps : fallback.knowledgeGaps,
      resumePerformance: parsed.resumePerformance?.length ? parsed.resumePerformance : fallback.resumePerformance,
      improvementSuggestions: parsed.improvementSuggestions?.length ? parsed.improvementSuggestions : fallback.improvementSuggestions,
      preparationTopics: parsed.preparationTopics?.length ? parsed.preparationTopics : fallback.preparationTopics,
    };
  } catch {
    return fallback;
  }
}

function buildFallbackReport(
  avgScore: number,
  avgTechnical: number,
  avgClarity: number,
  avgCompleteness: number,
  avgConfidence: number,
  history: QAPair[],
  analysis: ResumeAnalysis
): InterviewReport {
  const allStrengths = history.flatMap((h) => h.evaluation.strengths);
  const allWeaknesses = history.flatMap((h) => h.evaluation.weaknesses);
  const allGaps = history.flatMap((h) => h.evaluation.knowledgeGaps);

  return {
    overallScore: clamp(avgScore),
    technicalScore: clamp(avgTechnical),
    communicationScore: clamp(avgClarity),
    problemSolvingScore: clamp(avgCompleteness),
    resumeKnowledgeScore: clamp(avgScore),
    confidenceScore: clamp(avgConfidence),
    summary: `The candidate completed a ${history.length}-question interview with an average score of ${avgScore.toFixed(1)}/10. ${avgScore >= 7 ? "Overall performance was strong." : avgScore >= 5 ? "Performance was moderate with room for improvement." : "The candidate needs significant preparation before the next interview."}`,
    strengths: dedupe(allStrengths).slice(0, 5),
    weaknesses: dedupe(allWeaknesses).slice(0, 5),
    knowledgeGaps: dedupe(allGaps.length ? allGaps : analysis.weakAreas).slice(0, 5),
    resumePerformance: analysis.testableSkills.slice(0, 4).map((s) => `${s}: ${avgScore >= 6 ? "Demonstrated" : "Needs improvement"}`),
    improvementSuggestions: [
      "Practice explaining your projects in structured detail.",
      "Study the core concepts behind each technology on your resume.",
      "Use the STAR method for behavioral questions.",
    ].slice(0, 4),
    preparationTopics: analysis.weakAreas.length ? analysis.weakAreas.slice(0, 5) : analysis.potentialInterviewTopics.slice(0, 5),
  };
}

function avg(nums: number[]): number {
  if (!nums.length) return 0;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

function clamp(n: number): number {
  return Math.min(10, Math.max(0, Math.round(n * 10) / 10));
}

function dedupe(arr: string[]): string[] {
  return Array.from(new Set(arr));
}
