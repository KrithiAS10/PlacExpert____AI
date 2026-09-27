// ─── Shared Interview Types ───────────────────────────────────────────────────

export interface ParsedResume {
  name: string;
  skills: string[];
  education: { degree?: string; institution?: string; year?: string; gpa?: string }[];
  projects: { name?: string; description?: string; technologies?: string[] }[];
  experience: { title?: string; company?: string; duration?: string; responsibilities?: string[] }[];
  internships: { role?: string; company?: string; duration?: string; responsibilities?: string[] }[];
  certifications: string[];
  achievements: string[];
  technologies: string[];
}

export interface ResumeAnalysis {
  strongestSkills: string[];
  technicalAreas: string[];
  projectSummaries: string[];
  experienceLevel: "fresher" | "junior" | "mid" | "senior";
  potentialInterviewTopics: string[];
  testableSkills: string[];
  weakAreas: string[];
  overallProfileSummary: string;
}

export interface GeneratedQuestion {
  question: string;
  category: "Technical" | "Project" | "HR" | "Behavioral" | "Resume-Based";
  topic: string;
  difficulty: "Easy" | "Medium" | "Hard";
  intent?: string;
  isFollowUp: boolean;
  reason: string;
}

export interface AnswerEvaluation {
  score: number;
  technicalCorrectness: number;
  relevance: number;
  clarity: number;
  completeness: number;
  confidence: number;
  strengths: string[];
  weaknesses: string[];
  knowledgeGaps: string[];
  feedback: string;
  resumeConsistency?: string;
}

export interface NextQuestionDecision {
  nextQuestion: string;
  category: "Technical" | "Project" | "HR" | "Behavioral" | "Resume-Based";
  topic: string;
  difficulty: "Easy" | "Medium" | "Hard";
  intent?: string;
  isFollowUp: boolean;
  reason: string;
}

export interface InterviewReport {
  overallScore: number;
  technicalScore: number;
  communicationScore: number;
  problemSolvingScore: number;
  resumeKnowledgeScore: number;
  confidenceScore: number;
  summary: string;
  strengths: string[];
  weaknesses: string[];
  knowledgeGaps: string[];
  resumePerformance: string[];
  improvementSuggestions: string[];
  preparationTopics: string[];
}

export interface InterviewConfig {
  interviewType: "Technical" | "HR" | "Behavioral" | "Mixed";
  difficulty: "Easy" | "Medium" | "Hard";
  mode: "Text" | "Voice";
  totalQuestions: number;
  targetRole?: string;
}

export interface QAPair {
  question: string;
  answer: string;
  category: string;
  topic: string;
  score: number;
  evaluation: AnswerEvaluation;
}
