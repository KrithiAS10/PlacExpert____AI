export type VoiceInterviewQuestion = {
  id: string;
  category: "HR" | "Behavioral" | "Technical";
  difficulty: "Easy" | "Medium" | "Hard";
  intent: string;
  question: string;
  expectedThemes: string[];
  strongAnswerSignals: string[];
  followUp: string;
};

export const voiceInterviewQuestions: VoiceInterviewQuestion[] = [
  {
    id: "voice-hr-why-company",
    category: "HR",
    difficulty: "Medium",
    intent: "Evaluate motivation and company fit",
    question: "Why do you want to work at this company?",
    expectedThemes: ["company research", "role fit", "skills", "growth", "contribution"],
    strongAnswerSignals: ["mentions the role", "connects personal skills", "shows company awareness", "sounds specific"],
    followUp: "What specific part of this role excites you the most?",
  },
  {
    id: "voice-hr-hire-you",
    category: "HR",
    difficulty: "Medium",
    intent: "Assess confidence and value proposition",
    question: "Why should we hire you?",
    expectedThemes: ["strengths", "experience", "impact", "teamwork", "learning mindset"],
    strongAnswerSignals: ["clear value", "evidence", "confidence without arrogance", "role alignment"],
    followUp: "Can you support that with one project or achievement?",
  },
  {
    id: "voice-hr-weakness",
    category: "HR",
    difficulty: "Hard",
    intent: "Check self-awareness",
    question: "What are your strengths and weaknesses?",
    expectedThemes: ["strength", "weakness", "improvement", "example", "self-awareness"],
    strongAnswerSignals: ["honest weakness", "improvement plan", "specific strength", "professional framing"],
    followUp: "What have you done recently to improve that weakness?",
  },
  {
    id: "voice-behavioral-conflict",
    category: "Behavioral",
    difficulty: "Hard",
    intent: "Evaluate conflict handling",
    question: "Describe a challenging situation you faced and how you handled it.",
    expectedThemes: ["situation", "task", "action", "result", "learning"],
    strongAnswerSignals: ["structured story", "ownership", "clear action", "positive result"],
    followUp: "What would you do differently if the same situation happened again?",
  },
  {
    id: "voice-behavioral-pressure",
    category: "Behavioral",
    difficulty: "Medium",
    intent: "Assess composure under pressure",
    question: "How do you handle stress and pressure?",
    expectedThemes: ["prioritization", "planning", "communication", "calmness", "deadlines"],
    strongAnswerSignals: ["practical method", "example", "balanced tone", "result"],
    followUp: "Tell me about a time you used that method successfully.",
  },
  {
    id: "voice-behavioral-achievement",
    category: "Behavioral",
    difficulty: "Medium",
    intent: "Assess achievement and ownership",
    question: "What is your greatest professional or academic achievement?",
    expectedThemes: ["achievement", "impact", "role", "challenge", "measurable result"],
    strongAnswerSignals: ["specific accomplishment", "personal contribution", "measured outcome", "reflection"],
    followUp: "What made that achievement meaningful to you?",
  },
  {
    id: "voice-technical-project",
    category: "Technical",
    difficulty: "Medium",
    intent: "Assess technical communication",
    question: "Explain one project you built and the technical decisions behind it.",
    expectedThemes: ["problem", "technology", "architecture", "tradeoff", "result"],
    strongAnswerSignals: ["clear problem statement", "technical reasoning", "tradeoffs", "impact"],
    followUp: "What would you improve in that project now?",
  },
  {
    id: "voice-technical-debugging",
    category: "Technical",
    difficulty: "Hard",
    intent: "Evaluate debugging approach",
    question: "Tell me about a difficult bug you solved.",
    expectedThemes: ["bug", "root cause", "debugging", "tools", "fix", "lesson"],
    strongAnswerSignals: ["systematic process", "specific tools", "clear fix", "learning"],
    followUp: "How did you prevent that issue from happening again?",
  },
  {
    id: "voice-technical-api",
    category: "Technical",
    difficulty: "Medium",
    intent: "Assess backend fundamentals",
    question: "How would you explain REST APIs to a non-technical person?",
    expectedThemes: ["client", "server", "request", "response", "endpoint", "data"],
    strongAnswerSignals: ["simple analogy", "correct fundamentals", "clear flow", "no jargon overload"],
    followUp: "What makes an API response easy for frontend developers to use?",
  },
];

