export interface Phase {
  name: string;
  week: number;
  days: string;
  status: "completed" | "active" | "next" | "locked";
  color: string;
}

export const ROADMAP_DATA = {
  readinessScore: 3.2,
  tier: "TIER 1",
  track: "Beginner Track",
  daysTotal: 45,
  currentDay: 15,
  phases: [
    { name: "Foundation Setup", week: 1, days: "1-7", status: "completed", color: "cyan" },
    { name: "Core CS Subjects", week: 2, days: "8-14", status: "active", color: "blue" },
    { name: "DSA Basics", week: 3, days: "15-21", status: "next", color: "teal" },
    { name: "Project Building", week: 4, days: "22-28", status: "locked", color: "purple" },
    { name: "Interview Prep", week: 5, days: "29-35", status: "locked", color: "orange" },
    { name: "Final Sprint", week: 6, days: "36-45", status: "locked", color: "green" },
  ] as Phase[],
  tasks: [
    {
      day: 8,
      topic: "DBMS — ER Diagrams, Normalization",
      resource: "GFG / NPTEL",
      type: "MCQ",
      status: "completed",
    },
    {
      day: 9,
      topic: "DBMS — SQL: SELECT, JOIN, GROUP BY",
      resource: "LeetCode SQL",
      type: "Coding",
      status: "completed",
    },
    {
      day: 10,
      topic: "OS — Process Management, CPU Scheduling",
      resource: "GFG / NPTEL",
      type: "MCQ",
      status: "failed",
    },
    {
      day: 15,
      topic: "Arrays — Traversal, Search, Insert",
      resource: "LeetCode",
      type: "Coding",
      status: "in-progress",
      description: "Solve 3 Easy LeetCode array problems. Upload your solution file after solving. BERT + test case analyzer will grade it.",
    },
  ],
  weakAreas: [
    { name: "Arrays", reason: "Failed 2 uploads", severity: "HIGH" },
    { name: "SQL JOINs", reason: "Low MCQ score", severity: "HIGH" },
    { name: "OS Scheduling", reason: "MCQ: 4/10", severity: "MED" },
  ],
  analytics: {
    readinessProgression: [
      { day: 1, score: 3.2 },
      { day: 14, score: 5.5 },
      { day: 30, score: 7.2 },
      { day: 38, score: 8.6 },
      { day: 45, score: 9.1 },
    ],
  },
};

export const MOCK_INTERVIEW_DOMAINS = [
  "DSA", "DBMS", "OS", "CN", "Web Development"
];
