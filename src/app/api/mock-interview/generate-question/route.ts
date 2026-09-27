// src/app/api/mock-interview/generate-question/route.ts
import { NextResponse } from "next/server";
import {
  type ResumeProfile,
  type InterviewLevel,
  type AdaptiveQuestion,
  extractNewTechnicalTerms,
} from "@/lib/adaptive-interview";
import {
  callLLM,
  QUESTION_GENERATION_SYSTEM_PROMPT,
} from "@/lib/llm-service";

export const dynamic = "force-dynamic";

interface GenerateQuestionRequest {
  resumeProfile: ResumeProfile;
  level: InterviewLevel;
  questionHistory: Array<{ question: string; topic: string }>;
  lastQuestion?: string;
  lastCandidateAnswer?: string;
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as GenerateQuestionRequest;
    const {
      resumeProfile,
      level = "mid",
      questionHistory = [],
      lastQuestion,
      lastCandidateAnswer,
    } = body;

    if (!resumeProfile) {
      return NextResponse.json(
        { error: "Missing candidate resume context." },
        { status: 400 }
      );
    }

    // Check for newly introduced technical terms
    const allKnownSkills = [
      ...(resumeProfile.skills || []),
      ...(resumeProfile.frameworks || []),
      ...(resumeProfile.languages || []),
      ...(resumeProfile.tools || []),
    ];

    let followUpTerm: string | undefined = undefined;
    if (lastCandidateAnswer && lastCandidateAnswer.trim().length > 10) {
      const detectedNew = extractNewTechnicalTerms(lastCandidateAnswer, allKnownSkills);
      if (detectedNew.length > 0) {
        // Pick the first new term not already heavily questioned
        const askedTopics = questionHistory.map((q) => q.topic.toLowerCase());
        const unasked = detectedNew.find(
          (t) => !askedTopics.some((at) => at.includes(t.toLowerCase()))
        );
        if (unasked) {
          followUpTerm = unasked;
        }
      }
    }

    // Build LLM prompt
    const systemPrompt = QUESTION_GENERATION_SYSTEM_PROMPT.replace("{level}", level);
    const userPrompt = `
Candidate Profile:
- Skills & Tools: ${allKnownSkills.join(", ")}
- Projects / Summary: ${resumeProfile.summary || "General software engineer"}
- Experience Level: ${resumeProfile.experienceLevel || "Entry"}
- Target Difficulty Level: ${level}

Previously asked questions:
${questionHistory.length > 0 ? questionHistory.map((q, i) => `${i + 1}. [${q.topic}] ${q.question}`).join("\n") : "None yet."}

${
  lastCandidateAnswer
    ? `Candidate's previous response to "${lastQuestion || "the previous question"}":\n"${lastCandidateAnswer}"\n`
    : ""
}
${
  followUpTerm
    ? `NOTE: The candidate introduced the new technical term/technology "${followUpTerm}" in their latest answer, which was NOT in their resume. Follow up directly on "${followUpTerm}" at ${level} difficulty!`
    : "Generate a new question based on the candidate's resume skills."
}

Generate the next question now as JSON:
{"question": "...", "topic": "..."}
`;

    const llmRes = await callLLM(systemPrompt, userPrompt);

    if (llmRes.json && llmRes.json.question && llmRes.json.topic) {
      const generated: AdaptiveQuestion = {
        question: llmRes.json.question,
        topic: llmRes.json.topic,
        followUpOnNewTerm: followUpTerm,
        difficulty: level,
      };
      return NextResponse.json(generated);
    }

    // Fallback deterministic generator
    const fallback = generateFallbackQuestion(
      resumeProfile,
      level,
      questionHistory,
      followUpTerm
    );

    return NextResponse.json(fallback);
  } catch (error: any) {
    console.error("Question generation error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to generate question." },
      { status: 500 }
    );
  }
}

function generateFallbackQuestion(
  profile: ResumeProfile,
  level: InterviewLevel,
  history: Array<{ question: string; topic: string }>,
  followUpTerm?: string
): AdaptiveQuestion {
  const askedQuestions = new Set(history.map((h) => h.question));

  if (followUpTerm) {
    const term = followUpTerm.charAt(0).toUpperCase() + followUpTerm.slice(1);
    if (level === "low") {
      return {
        question: `You mentioned ${term} in your previous answer. Can you define what ${term} is, its primary purpose, and when you would choose to use it?`,
        topic: `${term} (Candidate-Introduced)`,
        followUpOnNewTerm: followUpTerm,
        difficulty: level,
      };
    } else if (level === "mid") {
      return {
        question: `In your last response you brought up ${term}. How have you practically integrated or configured ${term} in a project, and what specific problem did it solve?`,
        topic: `${term} (Candidate-Introduced)`,
        followUpOnNewTerm: followUpTerm,
        difficulty: level,
      };
    } else {
      return {
        question: `You referenced ${term}. Can you discuss the underlying architecture, concurrency/scaling trade-offs, and failure modes when deploying ${term} in production?`,
        topic: `${term} (Candidate-Introduced)`,
        followUpOnNewTerm: followUpTerm,
        difficulty: level,
      };
    }
  }

  const pool = getQuestionPoolForProfile(profile, level);
  const available = pool.filter((q) => !askedQuestions.has(q.question));

  if (available.length > 0) {
    return available[Math.floor(Math.random() * available.length)];
  }

  // Final fallback
  return {
    question:
      level === "high"
        ? "How do you design a high-throughput, fault-tolerant distributed system with strict consistency requirements?"
        : level === "mid"
        ? "Walk me through how you optimize database queries and handle indexing in a production application."
        : "Can you explain the core fundamentals of RESTful API design and status code conventions?",
    topic: "System Architecture & CS Fundamentals",
    difficulty: level,
  };
}

function getQuestionPoolForProfile(
  profile: ResumeProfile,
  level: InterviewLevel
): AdaptiveQuestion[] {
  const skills = [
    ...(profile.skills || []),
    ...(profile.frameworks || []),
    ...(profile.languages || []),
  ].map((s) => s.toLowerCase());

  const questions: AdaptiveQuestion[] = [];

  const addQ = (topic: string, lowQ: string, midQ: string, highQ: string) => {
    if (level === "low") questions.push({ question: lowQ, topic, difficulty: "low" });
    if (level === "mid") questions.push({ question: midQ, topic, difficulty: "mid" });
    if (level === "high") questions.push({ question: highQ, topic, difficulty: "high" });
  };

  if (skills.some((s) => s.includes("react") || s.includes("next"))) {
    addQ(
      "React / Next.js",
      "What is the Virtual DOM in React, and how does reconciliation work compared to direct DOM manipulation?",
      "In React/Next.js, how would you prevent unnecessary re-renders in a deeply nested component tree handling live data?",
      "Explain the internal mechanics of React Server Components (RSC) vs Client Components and how SSR streaming serialization is handled."
    );
  }

  if (skills.some((s) => s.includes("node") || s.includes("express") || s.includes("nest"))) {
    addQ(
      "Node.js Backend",
      "Explain how the Node.js event loop works, including the call stack, microtask queue, and macrotask queue.",
      "How would you design a rate-limiter middleware in Node.js/Express for multi-instance deployments?",
      "How does Node.js handle CPU-bound vs I/O-bound bottlenecks at scale, and what are the trade-offs between Worker Threads and Cluster mode?"
    );
  }

  if (skills.some((s) => s.includes("python") || s.includes("django") || s.includes("fastapi"))) {
    addQ(
      "Python Ecosystem",
      "What are Python generators and decorators, and how do they manage memory and execution flow?",
      "How would you structure asynchronous background tasks in FastAPI/Django using Celery or Redis queues?",
      "Explain the Global Interpreter Lock (GIL), its impact on multithreading vs multiprocessing, and memory management via reference counting."
    );
  }

  if (skills.some((s) => s.includes("sql") || s.includes("postgres") || s.includes("mongo") || s.includes("db"))) {
    addQ(
      "Databases & Storage",
      "What is database normalization up to 3NF, and why might you deliberately denormalize a schema?",
      "How do you identify and resolve N+1 query problems and slow query bottlenecks in a relational database?",
      "Explain database isolation levels, dirty reads, phantom reads, MVCC (Multi-Version Concurrency Control), and distributed transactions."
    );
  }

  if (skills.some((s) => s.includes("docker") || s.includes("aws") || s.includes("cloud") || s.includes("k8s"))) {
    addQ(
      "Cloud & DevOps",
      "What is the difference between a Docker container and a Virtual Machine?",
      "How would you architect a zero-downtime CI/CD deployment pipeline with automated rollbacks on AWS/Kubernetes?",
      "Describe how you design multi-region disaster recovery, blue-green deployments, and distributed secret management under high load."
    );
  }

  // Default core questions if specific tech wasn't caught
  addQ(
    "Data Structures & Algorithms",
    "What is the difference between an Array and a Linked List in terms of memory layout and time complexity for search/insertion?",
    "Given a stream of real-time events, what data structure and algorithm would you use to maintain the top K most frequent elements efficiently?",
    "Explain how LSM-trees and B-Trees differ in read/write amplification for distributed storage engines."
  );

  return questions;
}
