"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Brain,
  CheckCircle2,
  ChevronRight,
  Code,
  Database,
  Globe,
  Monitor,
  RefreshCw,
  RotateCcw,
  Send,
  Sparkles,
  Target,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  mockInterviewDomains,
  type MockInterviewDomain,
  type MockInterviewDomainId,
  type MockInterviewQuestion,
} from "@/lib/mock-interview-data";

const domainStyles = {
  dsa: { icon: Brain, color: "text-brand-purple", bg: "bg-brand-purple/10" },
  dbms: { icon: Database, color: "text-brand-blue", bg: "bg-brand-blue/10" },
  os: { icon: Monitor, color: "text-brand-orange", bg: "bg-brand-orange/10" },
  cn: { icon: Globe, color: "text-brand-teal", bg: "bg-brand-teal/10" },
  web: { icon: Code, color: "text-brand-cyan", bg: "bg-brand-cyan/10" },
};

const fallbackDomainStyle = { icon: Brain, color: "text-brand-purple", bg: "bg-brand-purple/10" };

type Evaluation = {
  score: number;
  overallLabel: string;
  summary: string;
  strengths: string[];
  improvements: string[];
  optionalCues: string[];
  rubric: {
    relevance: number;
    depth: number;
    specificity: number;
    structure: number;
    professionalism: number;
    referenceAlignment: number;
  };
};

type AnswerRecord = {
  question: MockInterviewQuestion;
  answer: string;
  evaluation: Evaluation;
};

type DomainSession = {
  questionIndex: number;
  answer: string;
  records: AnswerRecord[];
  currentEvaluation: Evaluation | null;
};

const createEmptySession = (): DomainSession => ({
  questionIndex: 0,
  answer: "",
  records: [],
  currentEvaluation: null,
});

function normalizeText(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9+#.\s]/g, " ");
}

const GENERIC_WORDS = new Set([
  "about",
  "after",
  "also",
  "because",
  "been",
  "being",
  "between",
  "could",
  "during",
  "from",
  "have",
  "into",
  "more",
  "need",
  "should",
  "that",
  "their",
  "them",
  "then",
  "there",
  "these",
  "this",
  "through",
  "when",
  "where",
  "which",
  "with",
  "work",
  "would",
  "your",
]);

const QUESTION_EXPECTATIONS: Array<{ patterns: string[]; cues: string[] }> = [
  {
    patterns: ["tell me about yourself"],
    cues: ["background", "experience", "skills", "project", "interest", "goal", "role"],
  },
  {
    patterns: ["why do you want", "work here"],
    cues: ["company", "role", "values", "mission", "growth", "contribute", "skills", "culture"],
  },
  {
    patterns: ["why should we hire"],
    cues: ["skills", "experience", "impact", "team", "learn", "contribute", "strength"],
  },
  {
    patterns: ["strengths and weaknesses", "strength", "weakness"],
    cues: ["strength", "weakness", "improve", "example", "learning", "feedback"],
  },
  {
    patterns: ["achievement", "professional achievement"],
    cues: ["achieved", "led", "improved", "result", "impact", "project", "measured"],
  },
  {
    patterns: ["challenging situation", "challenge"],
    cues: ["situation", "task", "action", "result", "resolved", "learned", "communication"],
  },
  {
    patterns: ["five years", "5 years"],
    cues: ["grow", "learn", "skills", "role", "contribute", "responsibility", "goals"],
  },
  {
    patterns: ["stress", "pressure"],
    cues: ["prioritize", "organized", "calm", "deadline", "communication", "break", "focus"],
  },
  {
    patterns: ["ideal work environment"],
    cues: ["collaborative", "supportive", "communication", "ownership", "feedback", "learning"],
  },
];

function getMeaningfulWords(text: string) {
  return normalizeText(text)
    .split(/\s+/)
    .filter((word) => word.length > 3 && !GENERIC_WORDS.has(word));
}

function countCueMatches(answerWords: Set<string>, cues: string[]) {
  return cues.filter((cue) => {
    const cueWords = getMeaningfulWords(cue);
    return cueWords.some((word) => answerWords.has(word) || Array.from(answerWords).some((answerWord) => answerWord.startsWith(word)));
  }).length;
}

function getExpectedCues(question: MockInterviewQuestion) {
  const questionText = normalizeText(question.question);
  const patternCues =
    QUESTION_EXPECTATIONS.find((expectation) =>
      expectation.patterns.some((pattern) => questionText.includes(pattern))
    )?.cues ?? [];

  const questionWords = getMeaningfulWords(question.question).filter((word) => word.length > 4);
  return Array.from(new Set([...patternCues, ...questionWords, ...question.keyConcepts.slice(0, 6)]));
}

function toPercent(score: number, max: number) {
  return Math.round((score / max) * 100);
}

function evaluateAnswer(question: MockInterviewQuestion, answer: string): Evaluation {
  const words = answer.trim().split(/\s+/).filter(Boolean);
  const answerWords = new Set(getMeaningfulWords(answer));
  const expectedCues = getExpectedCues(question);
  const referenceCueMatches = countCueMatches(answerWords, question.keyConcepts);
  const expectedCueMatches = countCueMatches(answerWords, expectedCues);
  const hasExample = /\b(example|for instance|project|internship|experience|situation|led|built|created|improved|resolved|achieved)\b/i.test(answer);
  const hasOutcome = /\b(result|impact|outcome|learned|improved|increased|reduced|delivered|helped|because|therefore)\b/i.test(answer);
  const hasStructure = /\b(first|second|finally|overall|for example|in my previous|situation|task|action|result)\b/i.test(answer);
  const hasProfessionalTone = !/\b(idk|dunno|whatever|stuff|things like that|kinda|lol)\b/i.test(answer);

  const relevance = Math.min(3, 1 + Math.min(2, expectedCueMatches * 0.45));
  const depth = Math.min(2, words.length >= 80 ? 2 : words.length >= 45 ? 1.5 : words.length >= 25 ? 1 : 0.5);
  const specificity = Math.min(2, (hasExample ? 1 : 0) + (hasOutcome ? 0.75 : 0) + (/\d|%/.test(answer) ? 0.25 : 0));
  const structure = Math.min(1.5, (hasStructure ? 0.9 : 0.4) + (words.length >= 35 ? 0.4 : 0) + (/[.!?]/.test(answer.trim()) ? 0.2 : 0));
  const professionalism = hasProfessionalTone ? 1 : 0.4;
  const referenceAlignment = Math.min(0.5, referenceCueMatches * 0.12);
  const rawScore = relevance + depth + specificity + structure + professionalism + referenceAlignment;
  const score = Math.min(10, Math.round(rawScore * 10) / 10);
  const optionalCues = expectedCues
    .filter((cue) => countCueMatches(answerWords, [cue]) === 0)
    .slice(0, 6);
  const strengths = [
    relevance >= 2.2 ? "Answer stays connected to what the interviewer asked." : "",
    depth >= 1.5 ? "Good level of detail for a spoken interview answer." : "",
    specificity >= 1 ? "Includes concrete experience, action, or outcome." : "",
    structure >= 1 ? "Response is organized enough to follow easily." : "",
    professionalism >= 1 ? "Tone is professional and interview-appropriate." : "",
  ].filter(Boolean);
  const improvements = [
    relevance < 2.2 ? "Make the answer more directly tied to the question." : "",
    depth < 1.5 ? "Add a little more context instead of giving a short generic line." : "",
    specificity < 1 ? "Include a real example, project, measurable result, or lesson learned." : "",
    structure < 1 ? "Use a simple structure such as context, action, and result." : "",
    professionalism < 1 ? "Use more formal wording for interview settings." : "",
  ].filter(Boolean);
  const overallLabel = score >= 8 ? "Strong" : score >= 6 ? "Good" : score >= 4 ? "Developing" : "Needs Work";
  const summary =
    score >= 8
      ? "This is a strong professional answer. Keep it natural, but preserve the clarity and evidence."
      : score >= 6
        ? "This is a good base answer. A stronger example or clearer outcome would make it more convincing."
        : score >= 4
          ? "This answer has potential, but it needs more context, structure, and evidence."
          : "This is too thin for an interview. Build it into a complete answer with context, action, and result.";

  return {
    score,
    overallLabel,
    summary,
    strengths: strengths.length ? strengths : ["You attempted the question and gave the interviewer something to build on."],
    improvements: improvements.length ? improvements : ["Polish delivery and keep the answer concise."],
    optionalCues,
    rubric: {
      relevance,
      depth,
      specificity,
      structure,
      professionalism,
      referenceAlignment,
    },
  };
}

export default function MockInterviewPage() {
  const [domains, setDomains] = useState<MockInterviewDomain[]>(mockInterviewDomains);
  const [selectedDomainId, setSelectedDomainId] = useState<MockInterviewDomainId>("dsa");
  const [sessions, setSessions] = useState<Record<string, DomainSession>>({});
  const [datasetSource, setDatasetSource] = useState("Built-in sample questions");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadCsvDataset = useCallback(async () => {
    setIsRefreshing(true);
      try {
        const response = await fetch(`/api/mock-interview/questions?refresh=${Date.now()}`, {
          cache: "no-store",
        });
        if (!response.ok) return;

        const data = (await response.json()) as {
          source?: string;
          domains?: MockInterviewDomain[];
        };
        const csvDomains = data.domains?.filter((domain) => domain.questions.length > 0) ?? [];

        if (csvDomains.length === 0) return;

        setDomains(csvDomains);
        setSelectedDomainId((currentDomainId) =>
          csvDomains.some((domain) => domain.id === currentDomainId) ? currentDomainId : csvDomains[0].id
        );
        setDatasetSource(data.source ?? "CSV dataset");
        setSessions((currentSessions) => {
          const nextSessions: Record<string, DomainSession> = {};

          csvDomains.forEach((domain) => {
            const existingSession = currentSessions[domain.id] ?? createEmptySession();
            nextSessions[domain.id] = {
              ...existingSession,
              questionIndex: Math.min(existingSession.questionIndex, domain.questions.length - 1),
            };
          });

          return nextSessions;
        });
      } catch (error) {
        console.error("Failed to fetch mock interview dataset:", error);
      } finally {
        setIsRefreshing(false);
      }
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      loadCsvDataset();
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [loadCsvDataset]);

  const selectedDomain = useMemo(
    () => domains.find((domain) => domain.id === selectedDomainId) ?? domains[0],
    [domains, selectedDomainId]
  );
  const selectedSession = sessions[selectedDomainId] ?? createEmptySession();
  const questionIndex = Math.min(selectedSession.questionIndex, selectedDomain.questions.length - 1);
  const answer = selectedSession.answer;
  const records = selectedSession.records;
  const currentEvaluation = selectedSession.currentEvaluation;
  const currentQuestion = selectedDomain.questions[questionIndex];
  const averageScore = records.length
    ? (records.reduce((total, record) => total + record.evaluation.score, 0) / records.length).toFixed(1)
    : "0.0";
  const progress = Math.round((records.length / selectedDomain.questions.length) * 100);
  const remainingQuestions = selectedDomain.questions.length - records.length;
  const latestScore = records.at(-1)?.evaluation.score.toFixed(1) ?? "0.0";

  const updateSelectedSession = (updater: (session: DomainSession) => DomainSession) => {
    setSessions((currentSessions) => {
      const currentSession = currentSessions[selectedDomainId] ?? createEmptySession();

      return {
        ...currentSessions,
        [selectedDomainId]: updater(currentSession),
      };
    });
  };

  const selectDomain = (domainId: MockInterviewDomainId) => {
    setSelectedDomainId(domainId);
    setSessions((currentSessions) => ({
      ...currentSessions,
      [domainId]: currentSessions[domainId] ?? createEmptySession(),
    }));
  };

  const submitAnswer = () => {
    if (!answer.trim() || !currentQuestion) return;

    const evaluation = evaluateAnswer(currentQuestion, answer);
    updateSelectedSession((session) => ({
      ...session,
      currentEvaluation: evaluation,
      records: [
        ...session.records,
        {
          question: currentQuestion,
          answer: answer.trim(),
          evaluation,
        },
      ],
    }));
  };

  const nextQuestion = () => {
    const nextIndex = Math.min(questionIndex + 1, selectedDomain.questions.length - 1);
    updateSelectedSession((session) => ({
      ...session,
      questionIndex: nextIndex,
      answer: "",
      currentEvaluation: null,
    }));
  };

  const restartSession = () => {
    updateSelectedSession(() => createEmptySession());
  };

  const isLastQuestion = questionIndex === selectedDomain.questions.length - 1;
  const hasAnsweredCurrent = Boolean(currentEvaluation);
  const sessionComplete = hasAnsweredCurrent && isLastQuestion;

  return (
    <div className="min-h-[calc(100vh-8rem)] space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Text Mock Interview</h1>
          <p className="text-sm text-gray-400">Practice typed interview answers with fair, rubric-based feedback.</p>
        </div>
        <button
          onClick={loadCsvDataset}
          disabled={isRefreshing}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-dark-border bg-dark-card px-4 text-sm font-medium text-gray-300 transition-colors hover:text-white"
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
          Refresh Dataset
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[280px_minmax(0,1fr)_320px]">
        <aside className="space-y-6">
          <section className="glass-card space-y-4 rounded-2xl p-5">
            <h2 className="text-sm font-bold text-white">Select Domain</h2>
            <div className="space-y-2">
              {domains.map((domain) => {
                const style = domainStyles[domain.id as keyof typeof domainStyles] ?? fallbackDomainStyle;
                const Icon = style.icon;
                const isSelected = selectedDomainId === domain.id;

                return (
                  <button
                    key={domain.id}
                    onClick={() => selectDomain(domain.id)}
                    className={`flex w-full items-center justify-between rounded-xl border p-3 text-left transition-all ${
                      isSelected
                        ? "border-brand-cyan/50 bg-white/5 ring-1 ring-brand-cyan/20"
                        : "border-dark-border bg-transparent hover:border-white/10"
                    }`}
                  >
                    <span className="flex min-w-0 items-center gap-3">
                      <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${style.bg}`}>
                        <Icon className={`h-4 w-4 ${style.color}`} />
                      </span>
                      <span className={`truncate text-sm font-medium ${isSelected ? "text-white" : "text-gray-400"}`}>
                        {domain.name}
                      </span>
                    </span>
                    <span className="mx-2 shrink-0 rounded-full bg-white/5 px-2 py-0.5 text-[10px] text-gray-400">
                      {(sessions[domain.id]?.records.length ?? 0)}/{domain.questions.length}
                    </span>
                    {isSelected && <ChevronRight className="h-4 w-4 shrink-0 text-brand-cyan" />}
                  </button>
                );
              })}
            </div>
          </section>

          <section className="glass-card rounded-2xl p-5">
            <h2 className="mb-4 text-sm font-bold text-white">Session Stats</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs text-gray-500">Dataset</span>
                <span className="truncate text-right text-xs text-gray-300">{datasetSource}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">Attended</span>
                <span className="font-mono text-xs text-white">
                  {records.length} / {selectedDomain.questions.length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">Remaining</span>
                <span className="font-mono text-xs text-white">{remainingQuestions}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">Latest Score</span>
                <span className="text-xs font-bold text-white">{latestScore}/10</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">Average Score</span>
                <span className="text-xs font-bold text-brand-cyan">{averageScore}/10</span>
              </div>
              <div className="space-y-1.5">
                <div className="flex justify-between text-[10px]">
                  <span className="text-gray-500">Progress</span>
                  <span className="text-white">{progress}%</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-dark-bg">
                  <div className="h-full bg-brand-cyan shadow-glow-cyan" style={{ width: `${progress}%` }} />
                </div>
              </div>
              <button
                onClick={restartSession}
                className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-dark-border bg-dark-card text-xs font-medium text-gray-300 transition-colors hover:text-white"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Reset {selectedDomain.name}
              </button>
            </div>
          </section>
        </aside>

        <main className="glass-card flex min-h-[620px] flex-col overflow-hidden rounded-3xl border-dark-border/50">
          <div className="border-b border-dark-border bg-white/5 p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-cyan/10">
                <Target className="h-5 w-5 text-brand-cyan" />
              </div>
              <div>
                <p className="text-sm font-bold text-white">{selectedDomain.name} Interview</p>
                <p className="text-[10px] font-medium uppercase tracking-widest text-gray-500">
                  Question {questionIndex + 1} of {selectedDomain.questions.length}
                </p>
              </div>
            </div>
          </div>

          <div className="flex-1 space-y-6 overflow-y-auto p-6">
            <AnimatePresence mode="wait">
              <motion.section
                key={currentQuestion.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4"
              >
                <div className="rounded-2xl border border-dark-border bg-dark-card p-5">
                  <div className="mb-3 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-brand-cyan">
                    <Sparkles className="h-3.5 w-3.5" />
                    Interviewer Question
                  </div>
                  <p className="text-base font-semibold leading-7 text-white">{currentQuestion.question}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {currentQuestion.difficulty && (
                      <span className="rounded-full bg-white/5 px-2.5 py-1 text-[11px] text-gray-300">
                        {currentQuestion.difficulty}
                      </span>
                    )}
                    {currentQuestion.intent && (
                      <span className="rounded-full bg-brand-cyan/10 px-2.5 py-1 text-[11px] text-brand-cyan">
                        {currentQuestion.intent}
                      </span>
                    )}
                  </div>
                </div>

                <div className="space-y-3">
                  <label htmlFor="mock-answer" className="text-sm font-bold text-white">
                    Your Answer
                  </label>
                  <textarea
                    id="mock-answer"
                    value={answer}
                    onChange={(event) =>
                      updateSelectedSession((session) => ({
                        ...session,
                        answer: event.target.value,
                      }))
                    }
                    disabled={hasAnsweredCurrent}
                    placeholder="Type a structured answer: definition, key points, tradeoffs, and example."
                    className="min-h-56 w-full resize-none rounded-2xl border border-dark-border bg-dark-bg p-4 text-sm leading-6 text-gray-200 outline-none transition-all placeholder:text-gray-600 focus:border-brand-cyan/50 disabled:cursor-not-allowed disabled:opacity-70"
                  />
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">
                  <button
                    onClick={submitAnswer}
                    disabled={!answer.trim() || hasAnsweredCurrent}
                    className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-brand-cyan px-5 text-sm font-bold text-dark-bg shadow-glow-cyan transition-all hover:bg-brand-cyan/90 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Send className="h-4 w-4" />
                    Submit Answer
                  </button>
                  {!sessionComplete && hasAnsweredCurrent && (
                    <button
                      onClick={nextQuestion}
                      className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-dark-border bg-dark-card px-5 text-sm font-bold text-gray-200 transition-colors hover:text-white"
                    >
                      Next Question
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </motion.section>
            </AnimatePresence>
          </div>
        </main>

        <aside className="space-y-6">
          <section className="glass-card rounded-2xl border-brand-purple/20 bg-gradient-to-br from-brand-purple/10 to-transparent p-5">
            <h2 className="mb-4 flex items-center gap-2 text-sm font-bold text-white">
              <Brain className="h-4 w-4 text-brand-purple" />
              Feedback
            </h2>
            {currentEvaluation ? (
              <div className="space-y-4">
                <div className="rounded-xl border border-white/5 bg-white/5 p-3">
                  <p className="mb-1 text-[10px] font-bold uppercase text-brand-cyan">Score</p>
                  <p className="text-2xl font-bold text-white">{currentEvaluation.score}/10</p>
                  <p className="mt-1 text-xs text-gray-400">{currentEvaluation.overallLabel} interview answer</p>
                </div>
                <div className="rounded-xl border border-white/5 bg-white/5 p-3">
                  <p className="mb-1 text-[10px] font-bold uppercase text-brand-purple">Interviewer Note</p>
                  <p className="text-xs leading-5 text-gray-300">{currentEvaluation.summary}</p>
                </div>
                <div>
                  <p className="mb-2 text-[10px] font-bold uppercase text-brand-cyan">Rubric Breakdown</p>
                  <div className="space-y-3">
                    {[
                      ["Relevance", currentEvaluation.rubric.relevance, 3],
                      ["Depth", currentEvaluation.rubric.depth, 2],
                      ["Specificity", currentEvaluation.rubric.specificity, 2],
                      ["Structure", currentEvaluation.rubric.structure, 1.5],
                      ["Professionalism", currentEvaluation.rubric.professionalism, 1],
                      ["Reference Cues", currentEvaluation.rubric.referenceAlignment, 0.5],
                    ].map(([label, value, max]) => (
                      <div key={label as string} className="space-y-1.5">
                        <div className="flex justify-between text-[10px]">
                          <span className="text-gray-400">{label}</span>
                          <span className="text-white">{toPercent(value as number, max as number)}%</span>
                        </div>
                        <div className="h-1.5 overflow-hidden rounded-full bg-dark-bg">
                          <div
                            className="h-full bg-brand-cyan shadow-glow-cyan"
                            style={{ width: `${toPercent(value as number, max as number)}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="mb-2 text-[10px] font-bold uppercase text-brand-green">Strengths</p>
                  <ul className="space-y-1.5 text-xs leading-5 text-gray-300">
                    {currentEvaluation.strengths.map((strength) => (
                      <li key={strength}>{strength}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="mb-2 text-[10px] font-bold uppercase text-brand-orange">Improve Next</p>
                  <ul className="space-y-1.5 text-xs leading-5 text-gray-300">
                    {currentEvaluation.improvements.map((improvement) => (
                      <li key={improvement}>{improvement}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="mb-2 text-[10px] font-bold uppercase text-brand-purple">Optional Cues</p>
                  <p className="text-xs leading-5 text-gray-400">
                    These are not mandatory keywords. They are possible ideas that could make one version of the answer stronger.
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {currentEvaluation.optionalCues.length ? (
                      currentEvaluation.optionalCues.map((cue) => (
                        <span key={cue} className="rounded-full bg-brand-purple/10 px-2.5 py-1 text-[11px] text-brand-purple">
                          {cue}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-gray-500">No extra cues needed.</span>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-sm leading-6 text-gray-400">Submit your typed answer to get a fair score based on relevance, clarity, detail, examples, structure, and professionalism.</p>
            )}
          </section>

          <section className="glass-card rounded-2xl p-5">
            <h2 className="mb-4 text-sm font-bold text-white">Answered</h2>
            <div className="space-y-3">
              {records.length ? (
                records.map((record, index) => (
                  <div key={`${record.question.id}-${index}`} className="flex items-start gap-3 rounded-xl border border-white/5 bg-white/5 p-3">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-brand-green" />
                    <div className="min-w-0">
                      <p className="truncate text-xs font-medium text-white">{record.question.question}</p>
                      <p className="mt-1 text-[11px] text-gray-500">Score: {record.evaluation.score}/10</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">No answers submitted yet.</p>
              )}
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
