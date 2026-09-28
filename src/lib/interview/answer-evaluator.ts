// ─── Answer Evaluator Service ─────────────────────────────────────────────────
// Evaluates candidate answers using AI with robust, calibrated semantic domain fallbacks.

import { callAI, parseJSON } from "./ai-provider";
import type { AnswerEvaluation, ParsedResume, GeneratedQuestion } from "./types";

export async function evaluateAnswer(
  question: GeneratedQuestion,
  answer: string,
  resume: ParsedResume,
  durationSeconds = 0
): Promise<AnswerEvaluation> {
  const trimmedAnswer = (answer || "").trim();

  // 1. Immediate zero-check for empty, evasion, gibberish, or non-answers
  const zeroCheck = checkZeroScore(trimmedAnswer, question);
  if (zeroCheck.isZero) {
    return {
      score: 0,
      technicalCorrectness: 0,
      relevance: 0,
      clarity: 0,
      completeness: 0,
      confidence: 0,
      strengths: [],
      weaknesses: [zeroCheck.reason],
      knowledgeGaps: [question.topic || "Core concept comprehension"],
      feedback: zeroCheck.feedback,
      resumeConsistency: "POTENTIAL_GAP",
    };
  }

  // 2. Prepare LLM system prompt
  const systemPrompt = `You are a strict, senior technical interviewer grading a candidate's answer.
Evaluate objectively and return ONLY valid JSON.
Scoring rules:
- Score 0-10.
- If the answer doesn't answer the question, is off-topic, or completely incorrect, score MUST be 0.
- Score strictly on technical correctness, conceptual depth, trade-offs, and clarity — NOT on word count or filler buzzwords.
- 9-10: Exceptional mastery, covers internals, mechanics, and trade-offs.
- 7-8: Strong, technically accurate, covers key concepts well.
- 5-6: Basic surface understanding, lacks depth or has minor inaccuracies.
- 2-4: Weak, major inaccuracies or missing foundational mechanics.
- 0: Irrelevant, evasion, completely wrong.

JSON schema:
{
  "score": 0-10,
  "technicalCorrectness": 0-10,
  "relevance": 0-10,
  "clarity": 0-10,
  "completeness": 0-10,
  "confidence": 0-10,
  "strengths": ["string - specific concept correctly explained"],
  "weaknesses": ["string - specific misconception or missing area"],
  "knowledgeGaps": ["string - topic/mechanism to review"],
  "feedback": "2-3 sentences of clear, constructive technical feedback",
  "resumeConsistency": "CONSISTENT|POTENTIAL_GAP|NOT_APPLICABLE"
}`;

  const resumeContext = `
Candidate Resume Context:
- Skills: ${resume.skills?.slice(0, 15).join(", ") || "None"}
- Technologies: ${resume.technologies?.slice(0, 15).join(", ") || "None"}
- Projects: ${resume.projects?.map((p) => p.name).filter(Boolean).slice(0, 3).join(", ") || "None"}`;

  const userPrompt = `Question: "${question.question}"
Category: ${question.category} | Topic: "${question.topic}" | Difficulty: ${question.difficulty}
${durationSeconds > 0 ? `Duration: ${durationSeconds}s` : ""}
${resumeContext}

Candidate Answer:
"${trimmedAnswer}"

Evaluate strictly and return JSON.`;

  const heuristicFallback = evaluateSemantically(question, trimmedAnswer, resume, durationSeconds);

  try {
    const raw = await callAI(systemPrompt, userPrompt, true);
    const parsed = parseJSON<Partial<AnswerEvaluation>>(raw, {});

    if (typeof parsed.score === "number" && parsed.score >= 0) {
      const finalScore = clamp(parsed.score);
      const isZero = finalScore === 0;

      return {
        score: finalScore,
        technicalCorrectness: clamp(parsed.technicalCorrectness ?? finalScore),
        relevance: clamp(parsed.relevance ?? (isZero ? 0 : 7)),
        clarity: clamp(parsed.clarity ?? (isZero ? 0 : 7)),
        completeness: clamp(parsed.completeness ?? (isZero ? 0 : finalScore)),
        confidence: clamp(parsed.confidence ?? (isZero ? 0 : 7)),
        strengths: isZero ? [] : (parsed.strengths?.length ? parsed.strengths : heuristicFallback.strengths),
        weaknesses: parsed.weaknesses?.length ? parsed.weaknesses : heuristicFallback.weaknesses,
        knowledgeGaps: parsed.knowledgeGaps?.length ? parsed.knowledgeGaps : heuristicFallback.knowledgeGaps,
        feedback: parsed.feedback || heuristicFallback.feedback,
        resumeConsistency: parsed.resumeConsistency || (isZero ? "POTENTIAL_GAP" : "CONSISTENT"),
      };
    }
  } catch {
    // Proceed to robust semantic evaluation fallback
  }

  return heuristicFallback;
}

// ─── Zero Check Detection ─────────────────────────────────────────────────────

function checkZeroScore(text: string, question: GeneratedQuestion): { isZero: boolean; reason: string; feedback: string } {
  if (!text || text.length < 5) {
    return {
      isZero: true,
      reason: "Response was empty or too brief to evaluate.",
      feedback: "No substantive response was provided for this question. A complete technical explanation is expected.",
    };
  }

  const clean = text.toLowerCase().replace(/[^\w\s]/g, " ").trim();
  const words = clean.split(/\s+/).filter(Boolean);

  if (words.length < 3) {
    return {
      isZero: true,
      reason: "Response contains fewer than 3 words.",
      feedback: "The response is too brief to demonstrate any technical understanding of the subject.",
    };
  }

  // Common evasion / non-answers
  const evasions = [
    "idk", "i dont know", "i do not know", "dont know", "no idea", "no clue",
    "skip", "pass", "next question", "leave this", "not sure", "havent learned",
    "haven t learned", "cant answer", "cannot answer", "nothing", "na", "n a",
    "asdf", "qwerty", "test", "testing", "hello", "hi", "hey", "who are you"
  ];

  if (evasions.some((e) => clean === e || clean.startsWith(e + " ") || clean.endsWith(" " + e))) {
    return {
      isZero: true,
      reason: "Candidate indicated they do not know the answer or skipped the question.",
      feedback: "The response did not provide an answer to the technical question asked.",
    };
  }

  // Keyboard mash / low character diversity
  const uniqueChars = new Set(text.toLowerCase().replace(/\s/g, ""));
  if (text.length >= 15 && uniqueChars.size < 5) {
    return {
      isZero: true,
      reason: "Response contains repetitive keyboard mash.",
      feedback: "The response is invalid or unintelligible.",
    };
  }

  return { isZero: false, reason: "", feedback: "" };
}

// ─── Semantic Domain Evaluator (Offline / High-Fidelity Fallback) ─────────────

interface DomainConcepts {
  keywords: string[];
  mechanisms: string[];
  advanced: string[];
}

const TECHNICAL_KNOWLEDGE_MAP: Record<string, DomainConcepts> = {
  react: {
    keywords: ["vdom", "virtual dom", "state", "props", "hook", "useeffect", "usestate", "component", "render", "re-render", "jsx", "reconciliation", "fiber"],
    mechanisms: ["diffing", "batching", "immutability", "lifecycle", "cleanup", "closure", "dependency array", "tree", "dom"],
    advanced: ["concurrent", "suspense", "usememo", "usecallback", "hydration", "memoization", "server component", "rsc"]
  },
  javascript: {
    keywords: ["event loop", "closure", "prototype", "promise", "async", "await", "scope", "hoisting", "call stack", "callback queue", "microtask", "macrotask"],
    mechanisms: ["single threaded", "non blocking", "lexical scope", "this binding", "garbage collection", "reference count", "mark and sweep"],
    advanced: ["memory leak", "generator", "proxy", "event bubbling", "currying", "v8 engine", "jit"]
  },
  typescript: {
    keywords: ["type", "interface", "generics", "union", "intersection", "tuple", "enums", "any", "unknown", "never"],
    mechanisms: ["static typing", "type inference", "type narrowing", "type guard", "compile time", "structural subtyping"],
    advanced: ["conditional types", "mapped types", "utility types", "template literal types", "keyof", "typeof"]
  },
  nodejs: {
    keywords: ["node", "event loop", "libuv", "stream", "buffer", "express", "middleware", "clustering", "worker thread"],
    mechanisms: ["asynchronous io", "non blocking", "thread pool", "event emitter", "backpressure", "pipe"],
    advanced: ["memory management", "child process", "event loop phases", "poll phase", "microtask starvation"]
  },
  sql: {
    keywords: ["table", "query", "select", "join", "index", "primary key", "foreign key", "transaction", "acid", "normalization"],
    mechanisms: ["b-tree", "b+ tree", "lookup", "binary search", "table scan", "lock", "concurrency", "isolation level", "wal", "rollback"],
    advanced: ["query planner", "explain analyze", "sharding", "partitioning", "deadlock", "mvcc", "composite index"]
  },
  nosql: {
    keywords: ["mongodb", "redis", "document", "key value", "schema-less", "collection", "aggregation", "cache", "ttl"],
    mechanisms: ["in-memory", "sharding", "replica set", "eventual consistency", "cap theorem", "pub sub"],
    advanced: ["write concern", "read preference", "distributed locking", "eviction policies", "lru", "indexing strategies"]
  },
  system_design: {
    keywords: ["scalability", "load balancer", "caching", "database", "microservices", "latency", "throughput", "cdn", "message queue", "kafka"],
    mechanisms: ["horizontal scaling", "vertical scaling", "reverse proxy", "replication", "partitioning", "consistency", "availability", "idempotency"],
    advanced: ["cap theorem", "circuit breaker", "rate limiting", "distributed consensus", "raft", "consistent hashing", "event sourcing", "cqrs"]
  },
  dsa: {
    keywords: ["array", "linked list", "tree", "graph", "stack", "queue", "hash map", "recursion", "dynamic programming", "binary search"],
    mechanisms: ["time complexity", "space complexity", "big o", "pointers", "traversal", "memoization", "tabulation", "divide and conquer"],
    advanced: ["amortized", "djikstra", "topological sort", "trie", "segment tree", "union find", "bit manipulation"]
  },
  networks: {
    keywords: ["tcp", "udp", "http", "https", "dns", "ip", "handshake", "socket", "ssl", "tls", "osi"],
    mechanisms: ["three-way handshake", "syn ack", "flow control", "congestion control", "packet", "encryption", "certificate", "port"],
    advanced: ["http/2", "http/3", "quic", "multiplexing", "head of line blocking", "keep-alive", "cors"]
  },
  git: {
    keywords: ["commit", "branch", "merge", "rebase", "pull request", "conflict", "head", "repository", "stash"],
    mechanisms: ["dag", "commit graph", "fast-forward", "three-way merge", "staging area", "index", "sha-1", "blobs"],
    advanced: ["cherry-pick", "squash", "bisect", "interactive rebase", "detached head", "reflog"]
  },
  docker: {
    keywords: ["container", "image", "dockerfile", "volume", "port", "compose", "registry", "layer"],
    mechanisms: ["cgroups", "namespaces", "isolation", "layer caching", "host", "bridge network"],
    advanced: ["multi-stage build", "kubernetes", "daemonless", "security context", "rootless"]
  }
};

function evaluateSemantically(
  question: GeneratedQuestion,
  answer: string,
  resume: ParsedResume,
  durationSeconds = 0
): AnswerEvaluation {
  const qText = (question.question || "").toLowerCase();
  const qTopic = (question.topic || "").toLowerCase();
  const aText = answer.toLowerCase();
  const words = aText.split(/\s+/).filter(Boolean);
  const wordCount = words.length;

  // 1. Identify relevant domain concepts
  let matchedDomain: DomainConcepts | null = null;
  for (const [key, domain] of Object.entries(TECHNICAL_KNOWLEDGE_MAP)) {
    if (qTopic.includes(key) || qText.includes(key) || key.split("_").some((k) => qText.includes(k) || qTopic.includes(k))) {
      matchedDomain = domain;
      break;
    }
  }

  // 2. Extract question key tokens
  const qTokens = qText
    .replace(/[^\w\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 3 && !["what", "explain", "describe", "difference", "between", "how", "would", "which", "could", "should", "using", "your", "with", "this", "that"].includes(w));

  const directQMatches = qTokens.filter((token) => aText.includes(token));
  const qRelevanceRatio = qTokens.length > 0 ? directQMatches.length / qTokens.length : 0.5;

  // 3. Domain concept matches
  const keywordHits: string[] = [];
  const mechanismHits: string[] = [];
  const advancedHits: string[] = [];

  if (matchedDomain) {
    for (const kw of matchedDomain.keywords) {
      if (aText.includes(kw)) keywordHits.push(kw);
    }
    for (const mech of matchedDomain.mechanisms) {
      if (aText.includes(mech)) mechanismHits.push(mech);
    }
    for (const adv of matchedDomain.advanced) {
      if (aText.includes(adv)) advancedHits.push(adv);
    }
  }

  // 4. Calculate Scores
  // Relevance: Does answer address the question?
  let relevance = 4;
  if (qRelevanceRatio >= 0.4 || keywordHits.length >= 2) relevance += 3;
  if (qRelevanceRatio >= 0.7 || keywordHits.length >= 4) relevance += 2;
  if (wordCount < 15 && qRelevanceRatio === 0) relevance = 1;

  // Technical Correctness: Concept coverage + depth
  let correctness = 4;
  if (keywordHits.length >= 1) correctness += 1;
  if (keywordHits.length >= 3) correctness += 1;
  if (mechanismHits.length >= 1) correctness += 1.5;
  if (mechanismHits.length >= 2) correctness += 1.5;
  if (advancedHits.length >= 1) correctness += 1;

  // Deduct if extremely vague or short
  if (wordCount < 20) {
    correctness = Math.min(correctness, 4);
  } else if (wordCount < 35 && mechanismHits.length === 0) {
    correctness = Math.min(correctness, 6);
  }

  // Completeness & Clarity
  const clarity = wordCount >= 30 ? Math.min(9, 6 + Math.min(3, Math.floor(wordCount / 40))) : 4;
  const completeness = Math.min(9, Math.round((relevance * 0.4 + correctness * 0.6)));
  const confidence = Math.min(8.5, Math.max(3, 5 + (mechanismHits.length > 0 ? 2 : 0) + (wordCount > 40 ? 1 : 0)));

  // Weighted overall score
  const rawScore = (correctness * 0.45) + (relevance * 0.25) + (completeness * 0.15) + (clarity * 0.15);
  const finalScore = clamp(rawScore);

  // 5. Strengths, Weaknesses, Gaps & Feedback
  const strengths: string[] = [];
  const weaknesses: string[] = [];
  const knowledgeGaps: string[] = [];

  if (keywordHits.length > 0) {
    strengths.push(`Accurately highlighted core concepts: ${keywordHits.slice(0, 3).join(", ")}.`);
  }
  if (mechanismHits.length > 0) {
    strengths.push(`Articulated underlying mechanisms: ${mechanismHits.slice(0, 2).join(", ")}.`);
  }
  if (qRelevanceRatio >= 0.5) {
    strengths.push("Directly answered the specific scenario posed in the prompt.");
  }
  if (strengths.length === 0) {
    strengths.push("Attempted to address the topic.");
  }

  if (mechanismHits.length === 0 && matchedDomain) {
    weaknesses.push("Missing discussion of internal mechanics, performance trade-offs, or execution flow.");
  }
  if (wordCount < 30) {
    weaknesses.push("Response is too concise; elaborate with concrete architectural or real-world examples.");
  }
  if (advancedHits.length === 0 && (question.difficulty === "Hard" || question.difficulty === "Medium")) {
    knowledgeGaps.push(`Deepen knowledge of advanced ${question.topic || "domain"} patterns and edge cases.`);
  }
  if (weaknesses.length === 0) {
    weaknesses.push("Could further discuss scalability considerations and edge cases.");
  }

  let feedback = "";
  if (finalScore >= 8) {
    feedback = `Strong technical answer. You covered ${keywordHits.slice(0, 2).join(" and ") || "key concepts"} accurately with solid depth.`;
  } else if (finalScore >= 5) {
    feedback = `Good baseline explanation, but lacks depth on underlying mechanisms (${matchedDomain ? matchedDomain.mechanisms.slice(0, 2).join(", ") : "internals and trade-offs"}). Focus on explaining how it works under the hood.`;
  } else {
    feedback = `The answer is surface-level or incomplete for ${question.topic || "this topic"}. Review foundational principles and practice structuring your technical responses with clear mechanics and examples.`;
  }

  return {
    score: finalScore,
    technicalCorrectness: clamp(correctness),
    relevance: clamp(relevance),
    clarity: clamp(clarity),
    completeness: clamp(completeness),
    confidence: clamp(confidence),
    strengths: strengths.slice(0, 3),
    weaknesses: weaknesses.slice(0, 3),
    knowledgeGaps: knowledgeGaps.length ? knowledgeGaps.slice(0, 2) : [`Deep dive into ${question.topic || "this topic"} internals`],
    feedback,
    resumeConsistency: "CONSISTENT",
  };
}

function clamp(n: number, min = 0, max = 10): number {
  return Math.min(max, Math.max(min, Math.round(n * 10) / 10));
}

