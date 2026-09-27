"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Brain,
  CheckCircle2,
  ChevronRight,
  Code,
  Database,
  Globe,
  Monitor,
  RotateCcw,
  Send,
  Sparkles,
  Target,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Radio,
  Sliders,
  AlertTriangle,
  Clock,
  MessageSquare,
  Keyboard,
  Loader2,
  AlertCircle,
  FileText,
  Layers,
  ArrowRight,
  Award,
  Zap,
  TrendingUp,
  Cpu,
  RefreshCw,
  BookOpen,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type {
  ResumeProfile,
  InterviewLevel,
  AdaptiveQuestion,
  GradeResult,
  InterviewRecord,
  SessionSummary,
} from "@/lib/adaptive-interview";

// ─── Speech Recognition Types ─────────────────────────────────────────────────
type SpeechRecognitionEventLike = {
  results: {
    length: number;
    [index: number]: { isFinal: boolean; [index: number]: { transcript: string } };
  };
};
type SpeechRecognitionLike = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onend: (() => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  start: () => void;
  stop: () => void;
};
type SpeechRecognitionConstructor = new () => SpeechRecognitionLike;

function getSpeechRecognition() {
  if (typeof window === "undefined") return null;
  const w = window as typeof window & {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

// ─── Sample Resumes ───────────────────────────────────────────────────────────
const SAMPLE_PROFILES = [
  {
    name: "Full Stack Engineer (React + Node + Postgres)",
    text: `Krithi A S - Full Stack Developer
Skills: TypeScript, JavaScript, React.js, Next.js, Node.js, Express, PostgreSQL, Prisma ORM, Tailwind CSS, Git, Docker, REST APIs, Redis, Jest.
Projects:
1. PlaceXpert AI - Real-time AI Career Assessment & Roadmap Platform with automated ML scoring.
2. CloudCart - Distributed e-commerce microservices with Redis caching, PostgreSQL transaction isolation, and Stripe integration.
Experience: 2 years building full-stack web applications with high concurrency and responsive UI.`,
  },
  {
    name: "Backend & Systems Developer (Python + Go + Distributed Systems)",
    text: `Alex Rivera - Backend Systems Engineer
Skills: Python, FastAPI, Go (Golang), PostgreSQL, Kafka, Redis, Docker, Kubernetes, AWS, gRPC, Microservices, CI/CD.
Projects:
1. Event Stream Pipeline - High-throughput telemetry ingestion pipeline processing 25k events/sec using Kafka and Go workers.
2. Distributed Task Scheduler - Fault-tolerant background worker queue with Redis locking and exponential backoff retries.
Experience: 3 years specializing in backend optimization, database sharding, and asynchronous microservices.`,
  },
  {
    name: "Frontend Specialist (React + TypeScript + Web Performance)",
    text: `Samantha Wu - Senior Frontend Developer
Skills: React 19, TypeScript, Next.js App Router, Redux Toolkit, Tailwind CSS, GraphQL, WebSockets, Webpack, Vitest, CI/CD.
Projects:
1. Real-time Analytics Dashboard - Canvas & WebGL data visualization with sub-100ms render updates and WebSocket streaming.
2. Design System Component Library - Accessible, zero-runtime CSS tokens with automated snapshot testing.
Experience: 4 years focused on browser performance, Virtual DOM optimization, and design systems.`,
  },
];

export default function MockInterviewPage() {
  // ─── Flow State: 'setup' | 'interview' | 'summary' ───────────────────────────
  const [currentStep, setCurrentStep] = useState<"setup" | "interview" | "summary">("setup");

  // Setup state
  const [resumeInput, setResumeInput] = useState(SAMPLE_PROFILES[0].text);
  const [isParsingResume, setIsParsingResume] = useState(false);
  const [profile, setProfile] = useState<ResumeProfile | null>(null);
  const [level, setLevel] = useState<InterviewLevel>("mid");

  // Live Interview state
  const [currentQuestion, setCurrentQuestion] = useState<AdaptiveQuestion | null>(null);
  const [questionCount, setQuestionCount] = useState(1);
  const [maxQuestions, setMaxQuestions] = useState(5);
  const [candidateAnswer, setCandidateAnswer] = useState("");
  const [isGeneratingQuestion, setIsGeneratingQuestion] = useState(false);
  const [isGrading, setIsGrading] = useState(false);
  const [currentGrade, setCurrentGrade] = useState<GradeResult | null>(null);
  const [interviewRecords, setInterviewRecords] = useState<InterviewRecord[]>([]);

  // Session Summary state
  const [sessionSummary, setSessionSummary] = useState<SessionSummary | null>(null);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);

  // Audio / Speech State
  const [isRecording, setIsRecording] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [ttsEnabled, setTtsEnabled] = useState(false);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);

  // Timer & Voice Stats
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize Speech Recognition
  useEffect(() => {
    const SR = getSpeechRecognition();
    if (!SR) {
      setSpeechSupported(false);
      return;
    }
    setSpeechSupported(true);

    try {
      const recognition = new SR();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-US";

      recognition.onresult = (event: SpeechRecognitionEventLike) => {
        let finalChunk = "";
        for (let i = 0; i < event.results.length; i++) {
          finalChunk += event.results[i][0].transcript + " ";
        }
        if (finalChunk.trim()) {
          setCandidateAnswer(finalChunk.trim());
        }
      };

      recognition.onerror = () => {
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
    } catch {
      setSpeechSupported(false);
    }
  }, []);

  // Timer logic for interview phase
  useEffect(() => {
    if (currentStep === "interview" && !currentGrade) {
      timerRef.current = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [currentStep, currentGrade]);

  // Speech TTS on new question
  useEffect(() => {
    if (ttsEnabled && currentQuestion && typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(currentQuestion.question);
      utterance.rate = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  }, [currentQuestion, ttsEnabled]);

  const toggleRecording = () => {
    if (!speechSupported || !recognitionRef.current) return;
    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsRecording(true);
      } catch {
        setIsRecording(false);
      }
    }
  };

  // ─── Step 1: Parse Resume & Start ───────────────────────────────────────────
  const handleParseAndStart = async () => {
    if (!resumeInput.trim()) return;
    setIsParsingResume(true);
    try {
      const res = await fetch("/api/mock-interview/ingest-resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeText: resumeInput }),
      });
      const data = await res.json();
      if (data.profile) {
        setProfile(data.profile);
        await startInterviewSession(data.profile, level);
      }
    } catch (err) {
      console.error("Failed to parse resume:", err);
    } finally {
      setIsParsingResume(false);
    }
  };

  const startInterviewSession = async (
    targetProfile: ResumeProfile,
    targetLevel: InterviewLevel
  ) => {
    setCurrentStep("interview");
    setQuestionCount(1);
    setInterviewRecords([]);
    setCurrentGrade(null);
    setCandidateAnswer("");
    setElapsedSeconds(0);
    await fetchNextQuestion(targetProfile, targetLevel, [], undefined, undefined);
  };

  // ─── Step 2: Fetch Next Adaptive Question ──────────────────────────────────
  const fetchNextQuestion = async (
    targetProfile: ResumeProfile,
    targetLevel: InterviewLevel,
    records: InterviewRecord[],
    lastQ?: string,
    lastA?: string
  ) => {
    setIsGeneratingQuestion(true);
    setCurrentGrade(null);
    setCandidateAnswer("");
    setElapsedSeconds(0);

    try {
      const history = records.map((r) => ({ question: r.question, topic: r.topic }));
      const res = await fetch("/api/mock-interview/generate-question", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resumeProfile: targetProfile,
          level: targetLevel,
          questionHistory: history,
          lastQuestion: lastQ,
          lastCandidateAnswer: lastA,
        }),
      });

      const questionData: AdaptiveQuestion = await res.json();
      setCurrentQuestion(questionData);
    } catch (err) {
      console.error("Error generating question:", err);
    } finally {
      setIsGeneratingQuestion(false);
    }
  };

  // ─── Step 3: Submit Answer & Grade ──────────────────────────────────────────
  const handleSubmitAnswer = async () => {
    if (!currentQuestion) return;
    if (isRecording && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsRecording(false);
    }

    setIsGrading(true);
    try {
      const res = await fetch("/api/mock-interview/grade-answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: currentQuestion.question,
          topic: currentQuestion.topic,
          level: currentQuestion.difficulty,
          answer: candidateAnswer,
        }),
      });

      const gradeData: GradeResult = await res.json();
      setCurrentGrade(gradeData);

      // Record to history
      const newRecord: InterviewRecord = {
        id: `rec-${Date.now()}-${questionCount}`,
        question: currentQuestion.question,
        topic: currentQuestion.topic,
        answer: candidateAnswer.trim() || "(No response provided)",
        score: gradeData.score,
        feedback: gradeData.feedback,
        followUpTerm: currentQuestion.followUpOnNewTerm,
        difficulty: currentQuestion.difficulty,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setInterviewRecords((prev) => [...prev, newRecord]);
    } catch (err) {
      console.error("Grading failed:", err);
    } finally {
      setIsGrading(false);
    }
  };

  // ─── Step 4: Advance to Next Question or Final Summary ───────────────────────
  const handleProceed = async () => {
    if (!profile) return;
    if (questionCount >= maxQuestions) {
      // Finish session and generate summary
      await handleFinishSession(interviewRecords);
    } else {
      setQuestionCount((prev) => prev + 1);
      await fetchNextQuestion(
        profile,
        level,
        interviewRecords,
        currentQuestion?.question,
        candidateAnswer
      );
    }
  };

  const handleFinishSession = async (recordsToSummarize: InterviewRecord[]) => {
    setCurrentStep("summary");
    setIsGeneratingSummary(true);
    try {
      const res = await fetch("/api/mock-interview/session-summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          records: recordsToSummarize,
          level,
          profileSummary: profile?.summary,
        }),
      });
      const summaryData: SessionSummary = await res.json();
      setSessionSummary(summaryData);
    } catch (err) {
      console.error("Failed to generate summary:", err);
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  const handleReset = () => {
    setCurrentStep("setup");
    setCurrentQuestion(null);
    setCurrentGrade(null);
    setCandidateAnswer("");
    setInterviewRecords([]);
    setSessionSummary(null);
    setQuestionCount(1);
    setElapsedSeconds(0);
  };

  // ─── Render Helper Badges ───────────────────────────────────────────────────
  const getLevelBadge = (lvl: InterviewLevel) => {
    switch (lvl) {
      case "low":
        return {
          title: "Low · Fundamentals",
          desc: "Definitions & Core Fundamentals",
          classes: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
        };
      case "mid":
        return {
          title: "Mid · Applied Scenarios",
          desc: "Applied scenarios & project deep-dives",
          classes: "bg-amber-500/10 text-amber-400 border-amber-500/30",
        };
      case "high":
        return {
          title: "High · Internals & Systems",
          desc: "Internals, trade-offs & architecture",
          classes: "bg-purple-500/10 text-purple-400 border-purple-500/30",
        };
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* ─── Header ────────────────────────────────────────────────────────── */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider rounded-full bg-brand-purple/20 text-indigo-400 border border-indigo-500/30">
                AI Interview Grader v2.0
              </span>
              <span className="flex items-center gap-1 text-xs text-slate-400">
                <Radio className="w-3 h-3 text-emerald-400 animate-pulse" /> Adaptive Engine Active
              </span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight mt-1 bg-gradient-to-r from-white via-slate-200 to-indigo-300 bg-clip-text text-transparent">
              Adaptive Technical Mock Interview
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Resume-grounded question generation with real-time dynamic term follow-ups & strict 0–10 grading.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {currentStep !== "setup" && (
              <button
                onClick={handleReset}
                className="flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800 hover:border-slate-700 text-slate-300 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" /> New Session
              </button>
            )}
            <button
              onClick={() => setTtsEnabled(!ttsEnabled)}
              className={`p-2 rounded-lg border transition-colors ${
                ttsEnabled
                  ? "bg-indigo-500/20 text-indigo-400 border-indigo-500/40"
                  : "bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200"
              }`}
              title={ttsEnabled ? "Disable AI voice narration" : "Enable AI voice narration"}
            >
              {ttsEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
          </div>
        </header>

        {/* ─── STEP 1: SETUP & RESUME INGESTION ───────────────────────────────── */}
        {currentStep === "setup" && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8"
          >
            {/* Left Column: Resume Ingestion */}
            <div className="lg:col-span-7 space-y-6">
              <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-indigo-400" />
                    <h2 className="text-lg font-semibold text-white">Resume & Profile Ingestion</h2>
                  </div>
                  <span className="text-xs text-slate-400">Step 1 of 2</span>
                </div>

                <p className="text-xs text-slate-400">
                  Paste your resume, projects, or list of technologies. The AI will extract your skills, project
                  domains, and synthesize your candidate profile.
                </p>

                {/* Sample Presets */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-300">Quick-load Sample Profile:</label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {SAMPLE_PROFILES.map((sample, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setResumeInput(sample.text)}
                        className="text-left p-2.5 rounded-lg text-xs bg-slate-950/70 border border-slate-800 hover:border-indigo-500/40 hover:bg-indigo-950/20 text-slate-300 transition-all truncate"
                      >
                        <span className="font-semibold text-indigo-300 block truncate">{sample.name.split(" ")[0]}</span>
                        <span className="text-[11px] text-slate-400 block truncate">{sample.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Text Area */}
                <div className="relative">
                  <textarea
                    rows={8}
                    value={resumeInput}
                    onChange={(e) => setResumeInput(e.target.value)}
                    placeholder="Paste resume text, skills, frameworks, and project bullet points here..."
                    className="w-full p-4 text-xs sm:text-sm rounded-xl bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-slate-200 placeholder-slate-500 font-mono resize-y"
                  />
                </div>
              </div>
            </div>

            {/* Right Column: Level Selection & Start */}
            <div className="lg:col-span-5 space-y-6">
              <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-sm space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sliders className="w-5 h-5 text-indigo-400" />
                    <h2 className="text-lg font-semibold text-white">Target Difficulty Level</h2>
                  </div>
                  <span className="text-xs text-slate-400">Step 2 of 2</span>
                </div>

                <div className="space-y-3">
                  {/* Low Level */}
                  <label
                    onClick={() => setLevel("low")}
                    className={`block p-4 rounded-xl border cursor-pointer transition-all ${
                      level === "low"
                        ? "bg-emerald-950/30 border-emerald-500/60 shadow-lg shadow-emerald-950/40"
                        : "bg-slate-950/50 border-slate-800 hover:border-slate-700"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <span className="w-3 h-3 rounded-full bg-emerald-400" />
                        <span className="font-semibold text-sm text-emerald-300">Low Level</span>
                      </div>
                      <span className="text-xs font-mono text-slate-400">Fundamentals</span>
                    </div>
                    <p className="text-xs text-slate-400 mt-2">
                      Definitions, syntax, and core conceptual fundamentals of the technologies already listed in your resume.
                    </p>
                  </label>

                  {/* Mid Level */}
                  <label
                    onClick={() => setLevel("mid")}
                    className={`block p-4 rounded-xl border cursor-pointer transition-all ${
                      level === "mid"
                        ? "bg-amber-950/30 border-amber-500/60 shadow-lg shadow-amber-950/40"
                        : "bg-slate-950/50 border-slate-800 hover:border-slate-700"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <span className="w-3 h-3 rounded-full bg-amber-400" />
                        <span className="font-semibold text-sm text-amber-300">Mid Level</span>
                      </div>
                      <span className="text-xs font-mono text-slate-400">Applied Scenarios</span>
                    </div>
                    <p className="text-xs text-slate-400 mt-2">
                      Applied scenario questions ("how would you use X to solve Y"), project implementations, and architectural deep-dives.
                    </p>
                  </label>

                  {/* High Level */}
                  <label
                    onClick={() => setLevel("high")}
                    className={`block p-4 rounded-xl border cursor-pointer transition-all ${
                      level === "high"
                        ? "bg-purple-950/30 border-purple-500/60 shadow-lg shadow-purple-950/40"
                        : "bg-slate-950/50 border-slate-800 hover:border-slate-700"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <span className="w-3 h-3 rounded-full bg-purple-400" />
                        <span className="font-semibold text-sm text-purple-300">High Level</span>
                      </div>
                      <span className="text-xs font-mono text-slate-400">Internals & Architecture</span>
                    </div>
                    <p className="text-xs text-slate-400 mt-2">
                      Internal mechanics, distributed trade-offs, system scalability, performance bottlenecks, and complex edge cases.
                    </p>
                  </label>
                </div>

                {/* Session Length */}
                <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                  <span>Questions in session:</span>
                  <div className="flex gap-2">
                    {[3, 5, 8].map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => setMaxQuestions(num)}
                        className={`px-2.5 py-1 rounded border text-xs font-semibold ${
                          maxQuestions === num
                            ? "bg-indigo-500/20 text-indigo-300 border-indigo-500/50"
                            : "bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200"
                        }`}
                      >
                        {num} Qs
                      </button>
                    ))}
                  </div>
                </div>

                {/* Action Start Button */}
                <button
                  type="button"
                  disabled={isParsingResume || !resumeInput.trim()}
                  onClick={handleParseAndStart}
                  className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl font-semibold text-sm bg-gradient-to-r from-indigo-500 via-indigo-600 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-lg shadow-indigo-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {isParsingResume ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Ingesting & Building Adaptive Path...
                    </>
                  ) : (
                    <>
                      Start Adaptive Mock Interview <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* ─── STEP 2: LIVE INTERVIEW SESSION ─────────────────────────────────── */}
        {currentStep === "interview" && (
          <div className="space-y-6">
            {/* Session Progress Header */}
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <span className="text-xs font-semibold px-3 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                  Question {questionCount} of {maxQuestions}
                </span>

                <span
                  className={`text-xs font-semibold px-3 py-1 rounded-full border ${
                    getLevelBadge(level).classes
                  }`}
                >
                  {getLevelBadge(level).title}
                </span>

                {currentQuestion?.followUpOnNewTerm && (
                  <span className="text-xs font-semibold px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40 flex items-center gap-1.5 animate-pulse">
                    <Sparkles className="w-3.5 h-3.5" /> Adaptive Follow-up: &quot;{currentQuestion.followUpOnNewTerm}&quot;
                  </span>
                )}
              </div>

              <div className="flex items-center gap-4 text-xs text-slate-400">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-indigo-400" />
                  <span>
                    {Math.floor(elapsedSeconds / 60)}:
                    {(elapsedSeconds % 60).toString().padStart(2, "0")}
                  </span>
                </div>
                <div className="w-32 bg-slate-800 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-indigo-500 h-full transition-all duration-300"
                    style={{ width: `${(questionCount / maxQuestions) * 100}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Active Question Card */}
            <motion.div
              key={currentQuestion?.question || "loading"}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-6 md:p-8 rounded-2xl bg-gradient-to-br from-slate-900/90 via-slate-900/50 to-indigo-950/30 border border-slate-800 shadow-xl space-y-4"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-medium text-indigo-400 uppercase tracking-wider flex items-center gap-2">
                  <Cpu className="w-4 h-4" /> Topic: {currentQuestion?.topic || "Technical Assessment"}
                </span>

                {profile?.skills && (
                  <span className="text-xs text-slate-500 truncate max-w-xs hidden sm:inline-block">
                    Grounding: {profile.skills.slice(0, 3).join(", ")}
                  </span>
                )}
              </div>

              {isGeneratingQuestion ? (
                <div className="flex items-center gap-3 py-8 text-slate-400">
                  <Loader2 className="w-6 h-6 animate-spin text-indigo-400" />
                  <span>Formulating adaptive question based on context...</span>
                </div>
              ) : (
                <h2 className="text-xl md:text-2xl font-bold text-white leading-relaxed">
                  {currentQuestion?.question}
                </h2>
              )}

              {currentQuestion?.followUpOnNewTerm && (
                <div className="p-3 rounded-lg bg-purple-950/30 border border-purple-800/40 text-xs text-purple-300">
                  💡 <strong>Adaptive Branch:</strong> This question directly explores &quot;{currentQuestion.followUpOnNewTerm}&quot; which was introduced in your previous response.
                </div>
              )}
            </motion.div>

            {/* Candidate Response Area */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-8 space-y-4">
                <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
                      <Keyboard className="w-4 h-4 text-indigo-400" />
                      <span>Your Technical Response</span>
                    </div>

                    {/* Speech to text toggle */}
                    {speechSupported && (
                      <button
                        type="button"
                        onClick={toggleRecording}
                        disabled={isGrading || !!currentGrade}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                          isRecording
                            ? "bg-rose-500/20 text-rose-400 border-rose-500/40 animate-pulse"
                            : "bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200"
                        }`}
                      >
                        {isRecording ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                        {isRecording ? "Listening (Tap to stop)" : "Voice Answer"}
                      </button>
                    )}
                  </div>

                  <textarea
                    rows={7}
                    value={candidateAnswer}
                    onChange={(e) => setCandidateAnswer(e.target.value)}
                    disabled={isGrading || !!currentGrade}
                    placeholder="Type or dictate your technical explanation, architectural approach, and rationale..."
                    className="w-full p-4 text-sm rounded-xl bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-slate-200 placeholder-slate-600 font-sans resize-y disabled:opacity-75"
                  />

                  {/* Submit / Proceed Actions */}
                  <div className="flex items-center justify-between pt-2">
                    <span className="text-xs text-slate-500">
                      {candidateAnswer.split(/\s+/).filter(Boolean).length} words
                    </span>

                    {!currentGrade ? (
                      <button
                        type="button"
                        disabled={isGrading || !candidateAnswer.trim()}
                        onClick={handleSubmitAnswer}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition-all shadow-md shadow-indigo-600/20 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                      >
                        {isGrading ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" /> Evaluating Correctness...
                          </>
                        ) : (
                          <>
                            <Send className="w-3.5 h-3.5" /> Submit for Grading
                          </>
                        )}
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={handleProceed}
                        className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white transition-all shadow-md shadow-emerald-600/20 cursor-pointer"
                      >
                        {questionCount >= maxQuestions ? (
                          <>
                            View Session Summary <CheckCircle2 className="w-4 h-4" />
                          </>
                        ) : (
                          <>
                            Next Question <ChevronRight className="w-4 h-4" />
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Evaluation / Feedback Panel */}
              <div className="lg:col-span-4">
                <AnimatePresence mode="wait">
                  {currentGrade ? (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      className={`p-6 rounded-2xl border space-y-4 ${
                        currentGrade.isZeroScore
                          ? "bg-rose-950/20 border-rose-500/40"
                          : currentGrade.score >= 7
                          ? "bg-emerald-950/20 border-emerald-500/40"
                          : "bg-amber-950/20 border-amber-500/40"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-300">Grade & Feedback</span>
                        <div
                          className={`text-2xl font-black px-3 py-1 rounded-xl ${
                            currentGrade.isZeroScore
                              ? "bg-rose-500/20 text-rose-400"
                              : currentGrade.score >= 7
                              ? "bg-emerald-500/20 text-emerald-400"
                              : "bg-amber-500/20 text-amber-400"
                          }`}
                        >
                          {currentGrade.score} / 10
                        </div>
                      </div>

                      {currentGrade.isZeroScore && (
                        <div className="p-2.5 rounded-lg bg-rose-900/30 border border-rose-500/30 text-xs text-rose-300 flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
                          <span>
                            <strong>Zero Credit:</strong> Answer was irrelevant, empty, or failed to address the technical prompt.
                          </span>
                        </div>
                      )}

                      <div className="space-y-1.5">
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                          Specific Feedback
                        </h4>
                        <p className="text-xs text-slate-200 leading-relaxed bg-slate-950/40 p-3 rounded-lg border border-slate-800">
                          {currentGrade.feedback}
                        </p>
                      </div>

                      {currentGrade.strengths && currentGrade.strengths.length > 0 && (
                        <div className="space-y-1">
                          <span className="text-[11px] font-semibold text-emerald-400">Key Strengths:</span>
                          <ul className="text-xs text-slate-300 list-disc pl-4 space-y-0.5">
                            {currentGrade.strengths.map((s, idx) => (
                              <li key={idx}>{s}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {currentGrade.gaps && currentGrade.gaps.length > 0 && (
                        <div className="space-y-1">
                          <span className="text-[11px] font-semibold text-amber-400">Missing Elements:</span>
                          <ul className="text-xs text-slate-300 list-disc pl-4 space-y-0.5">
                            {currentGrade.gaps.map((g, idx) => (
                              <li key={idx}>{g}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </motion.div>
                  ) : (
                    <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800 flex flex-col items-center justify-center text-center space-y-3 min-h-[220px]">
                      <Target className="w-8 h-8 text-slate-600" />
                      <p className="text-xs text-slate-400 max-w-xs">
                        Submit your answer above to receive strict, objective 0–10 scoring with actionable feedback.
                      </p>
                    </div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        )}

        {/* ─── STEP 3: SESSION SUMMARY & READINESS REPORT ─────────────────────── */}
        {currentStep === "summary" && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            {/* Top Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Average Score
                </span>
                <div className="text-3xl font-black text-indigo-400">
                  {sessionSummary?.averageScore ?? 0} <span className="text-sm font-normal text-slate-500">/ 10</span>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Readiness Index
                </span>
                <div className="text-3xl font-black text-emerald-400">
                  {sessionSummary?.readinessPercent ?? 0}%
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Difficulty Level
                </span>
                <div className="text-xl font-bold text-white capitalize pt-1">
                  {level} Tier
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Total Questions
                </span>
                <div className="text-3xl font-black text-purple-400">
                  {interviewRecords.length}
                </div>
              </div>
            </div>

            {/* Readiness Note */}
            <div className="p-6 rounded-2xl bg-gradient-to-r from-indigo-950/40 to-purple-950/30 border border-indigo-500/30 space-y-2">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-indigo-400" />
                <h3 className="text-base font-bold text-white">Overall Readiness Note</h3>
              </div>
              <p className="text-sm text-slate-300 leading-relaxed">
                {sessionSummary?.readinessNote || "Performance evaluated across technical fundamentals, scenario application, and systems depth."}
              </p>
            </div>

            {/* Strengths and Target Areas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
                <div className="flex items-center gap-2 text-emerald-400 font-semibold text-sm">
                  <TrendingUp className="w-4 h-4" /> Key Strengths
                </div>
                <ul className="space-y-2 text-xs text-slate-300">
                  {sessionSummary?.strengths?.map((s, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{s}</span>
                    </li>
                  )) || <li>Consistent technical attempts across domains.</li>}
                </ul>
              </div>

              <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
                <div className="flex items-center gap-2 text-amber-400 font-semibold text-sm">
                  <Target className="w-4 h-4" /> Target Areas for Improvement
                </div>
                <ul className="space-y-2 text-xs text-slate-300">
                  {sessionSummary?.targetAreas?.map((t, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                      <span>{t}</span>
                    </li>
                  )) || <li>Continue practicing complex edge cases and architectural scaling.</li>}
                </ul>
              </div>
            </div>

            {/* Per-Question Breakdown */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Layers className="w-5 h-5 text-indigo-400" /> Per-Question Breakdown
              </h3>

              <div className="space-y-4">
                {interviewRecords.map((rec, idx) => (
                  <div
                    key={rec.id || idx}
                    className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                          Q{idx + 1}
                        </span>
                        <span className="text-xs font-medium text-indigo-300 font-mono">
                          {rec.topic}
                        </span>
                        {rec.followUpTerm && (
                          <span className="text-[11px] px-2 py-0.5 rounded bg-purple-950/60 text-purple-300 border border-purple-800/40">
                            Follow-up on &quot;{rec.followUpTerm}&quot;
                          </span>
                        )}
                      </div>

                      <div
                        className={`text-xs font-bold px-2.5 py-1 rounded-lg ${
                          rec.score === 0
                            ? "bg-rose-500/20 text-rose-400"
                            : rec.score >= 7
                            ? "bg-emerald-500/20 text-emerald-400"
                            : "bg-amber-500/20 text-amber-400"
                        }`}
                      >
                        Score: {rec.score} / 10
                      </div>
                    </div>

                    <div>
                      <p className="text-sm font-semibold text-white">{rec.question}</p>
                    </div>

                    <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800/60 text-xs text-slate-300 space-y-1">
                      <span className="text-[11px] font-semibold text-slate-400 block">Candidate Answer:</span>
                      <p className="italic">{rec.answer}</p>
                    </div>

                    <div className="text-xs text-slate-400">
                      <strong className="text-slate-300">Feedback:</strong> {rec.feedback}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Restart Session Action */}
            <div className="pt-6 flex justify-center">
              <button
                type="button"
                onClick={handleReset}
                className="flex items-center gap-2 px-8 py-3.5 rounded-xl font-semibold text-sm bg-gradient-to-r from-indigo-500 via-indigo-600 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-lg shadow-indigo-500/25 transition-all cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" /> Start Another Adaptive Interview
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
