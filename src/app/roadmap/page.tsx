"use client";

import React, { useState, useEffect } from "react";
import { ReadinessChart } from "./components/ReadinessChart";
import {
  CheckCircle2,
  Play,
  TrendingUp,
  AlertCircle,
  Zap,
  Calendar,
  Clock,
  Target,
  Code2,
  BookOpen,
  Brain,
  Sparkles,
  ChevronDown,
  Lock,
  Star,
  ExternalLink,
  RefreshCw,
  BarChart3,
  Check,
  HelpCircle,
  Trophy,
  ChevronRight,
  XCircle,
  FileCheck,
  X,
  Link2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────
interface Task {
  id: string;
  title: string;
  description: string | null; // stores resource_url
  day: number;
  category?: string | null;
  status: string;
  type: string;
  _count?: { solvedProblems: number };
}
interface Phase {
  id: string;
  title: string;
  description: string | null;
  order: number;
  tasks: Task[];
}
interface Roadmap {
  id: string;
  title: string;
  description: string | null;
  phases: Phase[];
}
interface UserProfile {
  name: string | null;
  email: string;
  readinessScore: number;
  currentDay: number;
  streak: number;
  readinessLevel: string | null;
  domainInterest: string | null;
  targetCompany: string | null;
  coreCsStrength: string | null;
  codingPlatform: string | null;
  projects: string | null;
  aptitude: string | null;
  communication: string | null;
  dailyStudyTime: string | null;
  preferredLang: string | null;
  placementTimeline: string | null;
  analytics?: any[];
  totalSolvedProblems?: number;
}
interface WeakArea {
  name: string;
  reason: string;
  severity: string;
}

// ─────────────────────────────────────────────
// Dynamic Platform & Accurate Resource URL Resolver
// ─────────────────────────────────────────────
function getAccurateResourceUrl(taskTitle: string, rawUrl: string | null): string {
  const title = taskTitle.toLowerCase();

  if (rawUrl && rawUrl !== "https://roadmap.sh" && rawUrl !== "https://www.geeksforgeeks.org/" && rawUrl.trim().length > 0) {
    return rawUrl;
  }

  // Exact GeeksforGeeks and platform mappings based on task title keywords
  if (title.includes("java") && (title.includes("setup") || title.includes("environment") || title.includes("ide") || title.includes("install"))) {
    return "https://www.geeksforgeeks.org/how-to-set-up-java-development-environment/";
  }
  if (title.includes("python") && (title.includes("setup") || title.includes("environment") || title.includes("ide"))) {
    return "https://www.geeksforgeeks.org/set-up-python-development-environment/";
  }
  if (title.includes("c++") && (title.includes("setup") || title.includes("environment") || title.includes("ide"))) {
    return "https://www.geeksforgeeks.org/setting-up-c-development-environment/";
  }
  if (title.includes("java") && (title.includes("collection") || title.includes("stream") || title.includes("list"))) {
    return "https://www.geeksforgeeks.org/collections-in-java-2/";
  }
  if (title.includes("java")) {
    return "https://www.geeksforgeeks.org/java/";
  }
  if (title.includes("python")) {
    return "https://www.geeksforgeeks.org/python-programming-language/";
  }
  if (title.includes("c++") || title.includes("cpp")) {
    return "https://www.geeksforgeeks.org/c-plus-plus/";
  }
  if (title.includes("git") || title.includes("github")) {
    return "https://www.geeksforgeeks.org/git-tutorial/";
  }
  if (title.includes("html") || title.includes("css") || title.includes("web")) {
    return "https://www.geeksforgeeks.org/web-development/";
  }
  if (title.includes("array") || title.includes("two pointer") || title.includes("sliding")) {
    return "https://www.geeksforgeeks.org/array-data-structure/";
  }
  if (title.includes("string") || title.includes("palindrome") || title.includes("anagram")) {
    return "https://www.geeksforgeeks.org/string-data-structure/";
  }
  if (title.includes("sql") || title.includes("dbms") || title.includes("database") || title.includes("normalization")) {
    return "https://www.geeksforgeeks.org/dbms/";
  }
  if (title.includes("os") || title.includes("process") || title.includes("thread") || title.includes("scheduling") || title.includes("deadlock")) {
    return "https://www.geeksforgeeks.org/operating-systems/";
  }
  if (title.includes("tcp") || title.includes("udp") || title.includes("osi") || title.includes("dns") || title.includes("network")) {
    return "https://www.geeksforgeeks.org/computer-network-tutorials/";
  }
  if (title.includes("react")) {
    return "https://www.geeksforgeeks.org/reactjs-tutorial/";
  }
  if (title.includes("system design")) {
    return "https://www.geeksforgeeks.org/system-design-tutorial/";
  }
  if (title.includes("oop") || title.includes("encapsulat") || title.includes("inherit")) {
    return "https://www.geeksforgeeks.org/object-oriented-programming-oops-concept-in-java/";
  }

  return "https://www.geeksforgeeks.org/explore";
}

import {
  getNextVerificationQuestion,
  getQuizQuestionsForTask,
  QuestionItem
} from "./questionsData";

// ─────────────────────────────────────────────
// Dynamic Platform Matcher based on URL
// ─────────────────────────────────────────────
interface PlatformMeta {
  label: string;
  color: string;
  bg: string;
  border: string;
  icon: React.ElementType;
}

function resolvePlatform(url: string | null, taskType: string, taskTitle?: string): PlatformMeta {
  const targetUrl = url ? getAccurateResourceUrl(taskTitle || "", url) : "";

  if (targetUrl.includes("oracle.com")) {
    return { label: "Oracle Docs", color: "text-amber-400", bg: "bg-amber-400/10", border: "border-amber-400/20", icon: BookOpen };
  }
  if (targetUrl.includes("leetcode.com")) {
    return { label: "LeetCode", color: "text-brand-cyan", bg: "bg-brand-cyan/10", border: "border-brand-cyan/20", icon: Code2 };
  }
  if (targetUrl.includes("hackerrank.com")) {
    return { label: "HackerRank", color: "text-emerald-400", bg: "bg-emerald-400/10", border: "border-emerald-400/20", icon: Code2 };
  }
  if (targetUrl.includes("codechef.com")) {
    return { label: "CodeChef", color: "text-amber-500", bg: "bg-amber-500/10", border: "border-amber-500/20", icon: Code2 };
  }
  if (targetUrl.includes("freecodecamp.org")) {
    return { label: "freeCodeCamp", color: "text-brand-purple", bg: "bg-brand-purple/10", border: "border-brand-purple/20", icon: BookOpen };
  }
  if (targetUrl.includes("javascript.info")) {
    return { label: "javascript.info", color: "text-brand-orange", bg: "bg-brand-orange/10", border: "border-brand-orange/20", icon: Code2 };
  }
  if (targetUrl.includes("geeksforgeeks.org")) {
    return { label: "GeeksforGeeks", color: "text-brand-green", bg: "bg-brand-green/10", border: "border-brand-green/20", icon: BookOpen };
  }
  if (targetUrl.includes("w3schools.com")) {
    return { label: "W3Schools", color: "text-brand-teal", bg: "bg-brand-teal/10", border: "border-brand-teal/20", icon: BookOpen };
  }
  if (targetUrl.includes("baeldung.com")) {
    return { label: "Baeldung", color: "text-orange-400", bg: "bg-orange-400/10", border: "border-orange-400/20", icon: BookOpen };
  }
  if (targetUrl.includes("spring.io")) {
    return { label: "Spring Docs", color: "text-emerald-400", bg: "bg-emerald-400/10", border: "border-emerald-400/20", icon: BookOpen };
  }
  if (targetUrl.includes("developer.mozilla.org")) {
    return { label: "MDN Web Docs", color: "text-sky-400", bg: "bg-sky-400/10", border: "border-sky-400/20", icon: BookOpen };
  }
  if (targetUrl.includes("programiz.com")) {
    return { label: "Programiz", color: "text-purple-400", bg: "bg-purple-400/10", border: "border-purple-400/20", icon: BookOpen };
  }
  if (targetUrl.includes("react.dev") || targetUrl.includes("reactjs.org")) {
    return { label: "React Docs", color: "text-cyan-400", bg: "bg-cyan-400/10", border: "border-cyan-400/20", icon: Code2 };
  }
  if (targetUrl.includes("testbook.com")) {
    return { label: "Testbook", color: "text-blue-400", bg: "bg-blue-400/10", border: "border-blue-400/20", icon: BookOpen };
  }
  if (targetUrl.includes("byjus.com")) {
    return { label: "BYJU'S", color: "text-purple-400", bg: "bg-purple-400/10", border: "border-purple-400/20", icon: BookOpen };
  }
  if (targetUrl.includes("github.com")) {
    return { label: "GitHub", color: "text-purple-400", bg: "bg-purple-400/10", border: "border-purple-400/20", icon: BookOpen };
  }
  if (targetUrl.includes("render.com")) {
    return { label: "Render Docs", color: "text-teal-400", bg: "bg-teal-400/10", border: "border-teal-400/20", icon: BookOpen };
  }
  if (targetUrl.includes("pramp.com")) {
    return { label: "Pramp", color: "text-indigo-400", bg: "bg-indigo-400/10", border: "border-indigo-400/20", icon: Brain };
  }
  if (targetUrl === "/mock-interview") {
    return { label: "Mock Interview", color: "text-brand-orange", bg: "bg-brand-orange/10", border: "border-brand-orange/20", icon: Brain };
  }

  // Dynamic domain extractor for any unhandled external URL
  if (targetUrl && (targetUrl.startsWith("http://") || targetUrl.startsWith("https://"))) {
    try {
      const hostname = new URL(targetUrl).hostname.replace(/^www\./, "");
      const mainDomain = hostname.split(".")[0];
      const capitalized = mainDomain.charAt(0).toUpperCase() + mainDomain.slice(1);
      return { label: capitalized, color: "text-brand-cyan", bg: "bg-brand-cyan/10", border: "border-brand-cyan/20", icon: BookOpen };
    } catch (e) {
      // fallback
    }
  }

  // Fallbacks based on task types
  if (taskType === "PROBLEM") {
    return { label: "GeeksforGeeks", color: "text-brand-green", bg: "bg-brand-green/10", border: "border-brand-green/20", icon: BookOpen };
  }
  if (taskType === "MOCK") {
    return { label: "Mock Interview", color: "text-brand-orange", bg: "bg-brand-orange/10", border: "border-brand-orange/20", icon: Brain };
  }
  return { label: "Resource", color: "text-brand-cyan", bg: "bg-brand-cyan/10", border: "border-brand-cyan/20", icon: BookOpen };
}

export default function RoadmapPage() {
  const [roadmap, setRoadmap] = useState<Roadmap | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [weakAreas, setWeakAreas] = useState<WeakArea[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedPhaseId, setExpandedPhaseId] = useState<string | null>(null);

  // ── Quiz State ──
  const [quizActive, setQuizActive] = useState(false);
  const [quizQuestions, setQuizQuestions] = useState<QuestionItem[]>([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [score, setScore] = useState(0);
  const [quizDone, setQuizDone] = useState(false);
  const [quizPassed, setQuizPassed] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [quizUsedQuestions, setQuizUsedQuestions] = useState<string[]>([]);

  // ── Realistic Verification & Proof Modal State ──
  const [visitedLinks, setVisitedLinks] = useState<Record<string, boolean>>({});
  const [showProofModal, setShowProofModal] = useState(false);
  const [proofInput, setProofInput] = useState("");
  const [proofError, setProofError] = useState<string | null>(null);
  const [solvedCounts, setSolvedCounts] = useState<Record<string, number>>({});
  const [solvingProblem, setSolvingProblem] = useState(false);
  const [verificationUsedQuestions, setVerificationUsedQuestions] = useState<string[]>([]);
  const [activeVerificationQ, setActiveVerificationQ] = useState<QuestionItem | null>(null);
  const [checkpointSelectedOpt, setCheckpointSelectedOpt] = useState<number | null>(null);
  const [checkpointFeedback, setCheckpointFeedback] = useState<{ isCorrect: boolean; message: string } | null>(null);
  const REQUIRED_SOLVED = 5;

  const [taskQuestionsPool, setTaskQuestionsPool] = useState<Record<string, QuestionItem[]>>({});
  const [askedQuestionsHistory, setAskedQuestionsHistory] = useState<Record<string, string[]>>({});
  const [taskTrialCounts, setTaskTrialCounts] = useState<Record<string, number>>({});
  const [loadingQuestions, setLoadingQuestions] = useState(false);

  // ── Fetch fresh, non-repeating Gemini questions for a task ──
  const fetchFreshQuestions = async (
    task: Task,
    count = 5,
    excludeList: string[] = []
  ): Promise<QuestionItem[]> => {
    setLoadingQuestions(true);
    const existingAsked = askedQuestionsHistory[task.id] || [];
    const allPreviouslyAsked = Object.values(askedQuestionsHistory).flat();
    const combinedExclude = Array.from(new Set([...allPreviouslyAsked, ...existingAsked, ...excludeList]));
    const nextTrial = (taskTrialCounts[task.id] || 0) + 1;

    try {
      const res = await fetch("/api/roadmap/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          taskTitle: task.title,
          taskType: task.type,
          role: user?.domainInterest || "",
          language: user?.preferredLang || "",
          count,
          excludeQuestions: combinedExclude,
          trial: nextTrial,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.questions && data.questions.length > 0) {
          const responseQuestions = data.questions as QuestionItem[];
          const fresh = responseQuestions.filter((q) => !combinedExclude.includes(q.q));
          const finalQuestions = Array.from(new Map(fresh.map((q: QuestionItem) => [q.q.trim().toLowerCase(), q])).values());

          if (finalQuestions.length === 0) return [];

          setTaskTrialCounts((prev) => ({ ...prev, [task.id]: nextTrial }));
          setAskedQuestionsHistory((prev) => ({
            ...prev,
            [task.id]: Array.from(new Set([...(prev[task.id] || []), ...finalQuestions.map((q: QuestionItem) => q.q)])),
          }));

          return finalQuestions;
        }
      }
    } catch (e) {
      console.warn("Failed to fetch fresh AI questions:", e);
    } finally {
      setLoadingQuestions(false);
    }

    const fallback = getQuizQuestionsForTask(task.title, task.type, combinedExclude);
    setAskedQuestionsHistory((prev) => ({
      ...prev,
      [task.id]: Array.from(new Set([...(prev[task.id] || []), ...fallback.map((q) => q.q)])),
    }));
    return fallback;
  };

  // ── Open the Verification Checkpoint Modal with dynamic AI questions ──
  const openVerificationModal = async (task: Task) => {
    if (!visitedLinks[task.id]) {
      alert("Please click and open the resource link above first before submitting proof of completion!");
      return;
    }
    setShowProofModal(true);
    setLoadingQuestions(true);
    setProofError(null);
    setCheckpointSelectedOpt(null);
    setCheckpointFeedback(null);

    const existingPool = (taskQuestionsPool[task.id] || []).filter(
      (q) => !verificationUsedQuestions.includes(q.q)
    );

    let nextQ: QuestionItem | null = existingPool[0] || null;

    if (!nextQ) {
      const fresh = await fetchFreshQuestions(task, 6, verificationUsedQuestions);
      nextQ = fresh[0] || getNextVerificationQuestion(task.title, task.type, verificationUsedQuestions);
      setTaskQuestionsPool((prev) => ({
        ...prev,
        [task.id]: [...(prev[task.id] || []), ...fresh],
      }));
    }

    setActiveVerificationQ(nextQ);
    setVerificationUsedQuestions((prev) => (prev.includes(nextQ!.q) ? prev : [...prev, nextQ!.q]));
    setLoadingQuestions(false);
  };

  const [showExitModal, setShowExitModal] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  const handleExitRoadmap = async () => {
    setIsExiting(true);
    try {
      const res = await fetch("/api/roadmap/exit", { method: "POST" });
      if (res.ok) {
        window.location.href = "/profiling";
      } else {
        alert("Failed to exit roadmap. Please try again.");
      }
    } catch (e) {
      console.error(e);
      alert("Error exiting roadmap.");
    } finally {
      setIsExiting(false);
    }
  };

  const fetchRoadmapData = () => {
    fetch("/api/roadmap")
      .then((r) => r.json())
      .then((data) => {
        if (data.roadmap) {
          setRoadmap(data.roadmap);
          const todayPhase = data.roadmap.phases.find((p: Phase) =>
            p.tasks.some((t: Task) => t.day === data.user?.currentDay)
          );
          setExpandedPhaseId((prev) => prev || todayPhase?.id || data.roadmap.phases[0]?.id || null);
        }
        if (data.user) setUser(data.user);
        if (data.weakAreas) setWeakAreas(data.weakAreas.slice(0, 3));
      })
      .catch(() => { })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchRoadmapData();
  }, []);

  // ── Track external platform link visit ──
  const handleLinkVisit = (taskId: string) => {
    setVisitedLinks(prev => ({ ...prev, [taskId]: true }));
  };

  // ── Evaluate checkpoint question and submit proof to mark solved ──
  const submitProofAndSolve = async (
    taskId: string,
    taskType: string,
    selectedOpt: number | null,
    activeQuestion?: QuestionItem | null
  ) => {
    if (solvingProblem) return;
    setProofError(null);

    if (activeQuestion) {
      if (selectedOpt === null) {
        setProofError("Please select an answer to the checkpoint question above.");
        return;
      }
      if (selectedOpt !== activeQuestion.correct) {
        // ❌ Wrong answer: Show clear explanation, and immediately swap to a fresh question for this topic that has not been seen yet
        setCheckpointFeedback({
          isCorrect: false,
          message: `❌ Incorrect answer. ${activeQuestion.explanation} Swapping to a fresh, unseen question on ${todayTaskRef.current?.title || 'this topic'}...`
        });

        setTimeout(async () => {
          const task = todayTaskRef.current;
          if (!task) return;
          const available = (taskQuestionsPool[task.id] || []).filter(
            (q) => !verificationUsedQuestions.includes(q.q) && q.q !== activeQuestion.q
          );

          let freshQ: QuestionItem;
          if (available.length > 0) {
            freshQ = available[0];
          } else {
            const newlyFetched = await fetchFreshQuestions(task, 4, [
              ...verificationUsedQuestions,
              activeQuestion.q,
            ]);
            freshQ = newlyFetched[0] || getNextVerificationQuestion(task.title, task.type, verificationUsedQuestions);
            setTaskQuestionsPool((prev) => ({
              ...prev,
              [task.id]: [...(prev[task.id] || []), ...newlyFetched],
            }));
          }

          setActiveVerificationQ(freshQ);
          setVerificationUsedQuestions((prev) => (prev.includes(freshQ.q) ? prev : [...prev, freshQ.q]));
          setCheckpointSelectedOpt(null);
          setCheckpointFeedback(null);
          setProofError(null);
        }, 1600);
        return;
      }
    }

    // ✅ Correct answer:
    const noteText = activeQuestion
      ? `Verified Checkpoint Q: "${activeQuestion.q}" -> Answer: ${activeQuestion.options[selectedOpt!]}`
      : proofInput.trim() || "Checkpoint completed";

    setSolvingProblem(true);
    try {
      const res = await fetch("/api/roadmap/solve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          taskId,
          proofUrl: null,
          notes: noteText
        }),
      });
      const data = await res.json();
      if (data.success) {
        const newCount = data.solvedCount ?? ((solvedCounts[taskId] || 0) + 1);
        setSolvedCounts(prev => ({ ...prev, [taskId]: newCount }));

        if (newCount < REQUIRED_SOLVED) {
          // Advance to the next question inside the modal WITHOUT closing
          setCheckpointFeedback({
            isCorrect: true,
            message: `🎉 Correct answer! Question #${newCount} verified. Loading question #${newCount + 1}...`
          });
          setTimeout(async () => {
            const task = todayTaskRef.current;
            if (!task) return;
            const available = (taskQuestionsPool[task.id] || []).filter(
              (q) => !verificationUsedQuestions.includes(q.q)
            );

            let freshQ: QuestionItem;
            if (available.length > 0) {
              freshQ = available[0];
            } else {
              const newlyFetched = await fetchFreshQuestions(task, 4, verificationUsedQuestions);
              freshQ = newlyFetched[0] || getNextVerificationQuestion(task.title, task.type, verificationUsedQuestions);
              setTaskQuestionsPool((prev) => ({
                ...prev,
                [task.id]: [...(prev[task.id] || []), ...newlyFetched],
              }));
            }

            setActiveVerificationQ(freshQ);
            setVerificationUsedQuestions((prev) => (prev.includes(freshQ.q) ? prev : [...prev, freshQ.q]));
            setCheckpointSelectedOpt(null);
            setCheckpointFeedback(null);
            fetchRoadmapData();
          }, 800);
        } else {
          // All 5 completed!
          setCheckpointFeedback({
            isCorrect: true,
            message: `🎉 Awesome! All ${REQUIRED_SOLVED} Checkpoint Questions Verified! Quiz is now unlocked below!`
          });
          setTimeout(() => {
            setShowProofModal(false);
            setProofInput("");
            setCheckpointSelectedOpt(null);
            setCheckpointFeedback(null);
            fetchRoadmapData();
          }, 1200);
        }
      } else {
        setProofError(data.error || "Failed to verify completion");
      }
    } catch {
      setProofError("An unexpected error occurred while verifying");
    } finally {
      setSolvingProblem(false);
    }
  };

  // ── Start a fresh quiz for the current task — always generates a brand new trial set ──
  const startQuiz = async (task: Task) => {
    setLoadingQuestions(true);
    const excluded = Array.from(
      new Set([
        ...Object.values(askedQuestionsHistory).flat(),
        ...verificationUsedQuestions,
        ...quizUsedQuestions,
        ...(askedQuestionsHistory[task.id] || []),
      ])
    );
    const freshQs = await fetchFreshQuestions(task, 5, excluded);
    const cleanQs = freshQs.length >= 5
      ? freshQs.slice(0, 5)
      : getQuizQuestionsForTask(task.title, task.type, [...excluded, ...freshQs.map((q) => q.q)]);
    setQuizUsedQuestions((prev) => Array.from(new Set([...prev, ...cleanQs.map((q) => q.q)])));
    setQuizQuestions(cleanQs.slice(0, 5));
    setCurrentQ(0);
    setSelectedOption(null);
    setRevealed(false);
    setScore(0);
    setQuizDone(false);
    setQuizPassed(false);
    setQuizActive(true);
    setLoadingQuestions(false);
  };

  // ── Handle selecting an option ──
  const handleSelect = (idx: number) => {
    if (revealed) return;
    setSelectedOption(idx);
  };

  // ── Confirm answer and advance ──
  const handleConfirm = () => {
    if (selectedOption === null) return;
    const correct = quizQuestions[currentQ].correct === selectedOption;
    const newScore = correct ? score + 1 : score;
    setScore(newScore);
    setRevealed(true);

    setTimeout(() => {
      if (currentQ + 1 < quizQuestions.length) {
        setCurrentQ((q) => q + 1);
        setSelectedOption(null);
        setRevealed(false);
      } else {
        // Quiz finished
        const passed = newScore >= 4; // need 4/5 correct (80%)
        setQuizPassed(passed);
        setQuizDone(true);
        if (passed) markTaskComplete();
      }
    }, 900);
  };

  // ── Mark task complete in DB ──
  const markTaskComplete = async () => {
    setSubmitting(true);
    try {
      await fetch("/api/roadmap/task", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskId: todayTaskRef.current?.id, status: "COMPLETED" }),
      });
      setTimeout(() => {
        setQuizActive(false);
        setSubmitting(false);
        fetchRoadmapData();
      }, 1400);
    } catch {
      setSubmitting(false);
    }
  };

  const todayTaskRef = React.useRef<Task | null>(null);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8 space-y-5 animate-pulse">
        <div className="h-7 w-56 bg-white/5 rounded-xl" />
        <div className="h-4 w-36 bg-white/5 rounded-lg" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 h-[450px] bg-white/5 rounded-2xl" />
          <div className="h-[450px] bg-white/5 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!roadmap || !user) {
    return (
      <div className="max-w-md mx-auto px-6 py-28 text-center space-y-8">
        <div className="w-24 h-24 rounded-3xl bg-brand-cyan/10 border border-brand-cyan/20 flex items-center justify-center mx-auto">
          <Target className="w-12 h-12 text-brand-cyan/40" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">No Roadmap Generated</h1>
          <p className="text-gray-400 text-sm leading-relaxed">
            Please complete the assesment profiling to build your dynamic preparation roadmap.
          </p>
        </div>
        <Link
          href="/profiling"
          className="inline-flex items-center gap-2 px-7 py-3.5 bg-brand-cyan text-dark-bg font-bold rounded-2xl shadow-glow-cyan hover:bg-brand-cyan/90 transition-all group"
        >
          <Sparkles className="w-4 h-4" />
          Start Profiling
        </Link>
      </div>
    );
  }

  const sortedPhases = [...roadmap.phases].sort((a, b) => a.order - b.order);
  const allTasks = sortedPhases.flatMap((p) => [...p.tasks].sort((a, b) => a.day - b.day));

  const firstPendingIdx = allTasks.findIndex((t) => t.status !== "COMPLETED");
  const todayTask = firstPendingIdx !== -1 ? allTasks[firstPendingIdx] : allTasks[allTasks.length - 1];
  const isAllDone = firstPendingIdx === -1;

  if (todayTaskRef) todayTaskRef.current = todayTask ?? null;

  const totalDays = allTasks.length > 0 ? Math.max(...allTasks.map((t) => t.day)) : 45;
  const doneTasks = allTasks.filter((t) => t.status === "COMPLETED").length;
  const progressPct = Math.min(100, Math.round((doneTasks / allTasks.length) * 100));
  const readinessTier = user.readinessScore >= 7.5 ? "Advanced" : user.readinessScore >= 4.5 ? "Intermediate" : "Beginner";

  return (
    <div className="max-w-5xl mx-auto px-4 py-4 sm:py-6 space-y-5 pb-16">

      {/* ── Compact Header & Inline Progress ── */}
      <div className="glass-card rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] font-bold text-brand-cyan bg-brand-cyan/10 border border-brand-cyan/20 px-2 py-0.5 rounded-md">
              {readinessTier} Track
            </span>
            <span className="text-[10px] text-gray-500 bg-white/5 px-2 py-0.5 rounded-md">
              {isAllDone ? "Completed" : `Day ${user.currentDay} of ${totalDays}`}
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white">{roadmap.title}</h1>
        </div>

        {/* Compact overall progress bar */}
        <div className="w-full md:w-64 space-y-1.5 shrink-0">
          <div className="flex justify-between text-xs font-semibold">
            <span className="text-gray-400">Roadmap Progress</span>
            <span className="text-brand-cyan">{progressPct}%</span>
          </div>
          <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-brand-cyan to-brand-blue rounded-full transition-all duration-500"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>
      </div>

      {/* ── Main Layout Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Left Side: Accordion phases */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex justify-between items-center text-xs text-gray-500 px-1">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              <span>PREPARATION TRACK · {totalDays} DAYS</span>
            </span>
            <span>{doneTasks}/{allTasks.length} TASKS COMPLETED</span>
          </div>

          <div className="space-y-2">
            {sortedPhases.map((phase, pi) => {
              const startDay = phase.tasks.length ? Math.min(...phase.tasks.map((t) => t.day)) : phase.order * 7 - 6;
              const endDay = phase.tasks.length ? Math.max(...phase.tasks.map((t) => t.day)) : phase.order * 7;

              const phaseDone = phase.tasks.filter((t) => t.status === "COMPLETED").length;
              const isPhaseComplete = phaseDone === phase.tasks.length;

              const isPhaseActive = !isPhaseComplete && phase.tasks.some(t => {
                const gIdx = allTasks.findIndex(at => at.id === t.id);
                return gIdx === firstPendingIdx;
              });

              const phColors = ["cyan", "blue", "teal", "purple", "orange", "green"][pi % 6];
              const clr: Record<string, string> = {
                cyan: "text-brand-cyan border-brand-cyan/20 bg-brand-cyan/5",
                blue: "text-brand-blue border-brand-blue/20 bg-brand-blue/5",
                teal: "text-brand-teal border-brand-teal/20 bg-brand-teal/5",
                purple: "text-brand-purple border-brand-purple/20 bg-brand-purple/5",
                orange: "text-brand-orange border-brand-orange/20 bg-brand-orange/5",
                green: "text-brand-green border-brand-green/20 bg-brand-green/5",
              };

              const isOpen = expandedPhaseId === phase.id;

              return (
                <div
                  key={phase.id}
                  className={`rounded-xl border overflow-hidden transition-colors ${isOpen ? "border-white/10 bg-white/[0.01]" : "border-white/[0.04] bg-dark-card"
                    }`}
                >
                  {/* Accordion Trigger */}
                  <button
                    onClick={() => setExpandedPhaseId(isOpen ? null : phase.id)}
                    className="w-full flex items-center gap-3 p-3.5 text-left focus:outline-none"
                  >
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs shrink-0 border ${clr[phColors] || clr.cyan}`}>
                      {isPhaseComplete ? <CheckCircle2 className="w-4 h-4" /> :
                        isPhaseActive ? <Play className="w-3.5 h-3.5 fill-current animate-pulse" /> :
                          <Lock className="w-3.5 h-3.5 opacity-40" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-sm font-semibold text-white truncate block">{phase.title}</span>
                      <p className="text-[10px] text-gray-500 flex items-center gap-1.5">
                        <Calendar className="w-2.5 h-2.5" />
                        Days {startDay}–{endDay}
                        <span className="text-white/20">·</span>
                        {endDay - startDay + 1} day{endDay - startDay + 1 !== 1 ? "s" : ""}
                        <span className="text-white/20">·</span>
                        {phaseDone}/{phase.tasks.length} done
                      </p>
                    </div>
                    <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
                  </button>

                  {/* Tasks nested inside phase */}
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden bg-black/10 border-t border-white/[0.03]"
                      >
                        <div className="divide-y divide-white/[0.03]">
                          {[...phase.tasks].sort((a, b) => a.day - b.day).map((task) => {
                            const globalIdx = allTasks.findIndex((t) => t.id === task.id);
                            const previousCourseEndDay = allTasks[globalIdx - 1]?.day ?? 0;
                            const courseStartDay = previousCourseEndDay + 1;
                            const durationDays = Math.max(1, task.day - previousCourseEndDay);
                            const isLocked = firstPendingIdx !== -1 && globalIdx > firstPendingIdx;
                            const courseDay = task.status === "COMPLETED"
                              ? durationDays
                              : isLocked
                                ? 0
                                : Math.min(durationDays, Math.max(1, user.currentDay - courseStartDay + 1));
                            const isToday = !isLocked && todayTask && task.id === todayTask.id;
                            const isDone = task.status === "COMPLETED";
                            const pMeta = resolvePlatform(task.description, task.type, task.title);
                            const PlatformIcon = pMeta.icon;

                            return (
                              <div
                                key={task.id}
                                className={`flex items-center justify-between gap-3 px-4 py-3 hover:bg-white/[0.01] transition-colors ${isToday ? "bg-brand-cyan/[0.03]" : ""
                                  }`}
                              >
                                <div className="flex items-center gap-2.5 min-w-0">
                                  {isDone ? (
                                    <CheckCircle2 className="w-4 h-4 text-brand-green shrink-0" />
                                  ) : isLocked ? (
                                    <Lock className="w-4 h-4 text-gray-600 shrink-0" />
                                  ) : isToday ? (
                                    <Play className="w-4 h-4 text-brand-cyan fill-brand-cyan/20 shrink-0 animate-pulse" />
                                  ) : (
                                    <div className="w-4 h-4 rounded-full border border-white/20 flex items-center justify-center shrink-0">
                                      <span className="text-[8px] text-gray-500 font-bold">{task.day}</span>
                                    </div>
                                  )}
                                  <div className="flex flex-col min-w-0">
                                    <span className={`text-xs font-medium truncate ${isDone ? "text-gray-600 line-through" : isLocked ? "text-gray-600 select-none cursor-not-allowed" : "text-gray-300"
                                      }`}>
                                      {task.title}
                                    </span>
                                    <span className={`text-[9px] flex items-center gap-0.5 ${isLocked ? "text-gray-700" : isDone ? "text-gray-600" : isToday ? "text-brand-cyan/70" : "text-gray-600"
                                      }`}>
                                      <Calendar className="w-2 h-2" />
                                      {isToday ? "Today — " : ""}{courseDay}/{durationDays} day{durationDays !== 1 ? "s" : ""} completed
                                    </span>
                                  </div>
                                </div>

                                <div className="flex items-center gap-2 shrink-0">
                                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border flex items-center gap-1 ${isLocked ? "text-gray-600 bg-white/5 border-white/15" : `${pMeta.color} ${pMeta.bg} ${pMeta.border}`
                                    }`}>
                                    {!isLocked && <PlatformIcon className="w-2.5 h-2.5" />}
                                    {isLocked ? "Locked" : pMeta.label}
                                  </span>
                                  {task.description && !isLocked && (
                                    <a
                                      href={getAccurateResourceUrl(task.title, task.description)}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      onClick={() => handleLinkVisit(task.id)}
                                      className="p-1 rounded-md bg-white/5 border border-white/10 hover:text-brand-cyan hover:border-brand-cyan/20 transition-all text-gray-500"
                                      title={`Solve/Study on ${pMeta.label}`}
                                    >
                                      <ExternalLink className="w-3 h-3" />
                                    </a>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Side: Sidebar */}
        <div className="space-y-4">

          {/* Today's Focus Card / Completion Card */}
          {isAllDone ? (
            <div className="relative overflow-hidden rounded-xl border border-brand-green/20 bg-gradient-to-br from-brand-green/10 via-brand-blue/5 to-transparent p-4">
              <div className="absolute -top-6 -right-6 w-24 h-24 bg-brand-green/5 blur-2xl pointer-events-none" />
              <div className="relative space-y-3">
                <div className="flex justify-between items-center text-[10px] font-bold">
                  <span className="text-brand-green uppercase tracking-widest">CONGRATULATIONS!</span>
                </div>
                <h3 className="text-sm font-bold text-white leading-tight">All Tasks Completed!</h3>
                <p className="text-xs text-gray-400 leading-relaxed">
                  You have successfully finished your preparation track. Ready to test your skills?
                </p>
                <Link
                  href="/mock-interview"
                  className="w-full py-2 bg-brand-green text-dark-bg font-bold rounded-lg flex items-center justify-center gap-1.5 hover:bg-brand-green/95 transition-all text-xs shadow-glow-green"
                >
                  Start AI Mock Interview
                </Link>
              </div>
            </div>
          ) : todayTask ? (() => {
            const pMeta = resolvePlatform(todayTask.description, todayTask.type, todayTask.title);
            const PlatformIcon = pMeta.icon;
            const linkVisited = Boolean(visitedLinks[todayTask.id]);
            const activeTaskIndex = allTasks.findIndex((task) => task.id === todayTask.id);
            const activeCourseStartDay = (allTasks[activeTaskIndex - 1]?.day ?? 0) + 1;
            return (
              <div className="relative overflow-hidden rounded-xl border border-brand-cyan/20 bg-gradient-to-br from-brand-cyan/10 via-brand-blue/5 to-transparent p-4">
                <div className="absolute -top-6 -right-6 w-24 h-24 bg-brand-cyan/5 blur-3xl pointer-events-none" />
                <div className="relative space-y-3">
                  <div className="flex justify-between items-center text-[10px] font-bold">
                    <span className="text-brand-cyan uppercase tracking-widest">ACTIVE TASK · DAY {activeCourseStartDay}</span>
                    <span className={`px-2 py-0.5 rounded-full border flex items-center gap-1 ${pMeta.color} ${pMeta.bg} ${pMeta.border}`}>
                      <PlatformIcon className="w-2.5 h-2.5" />
                      {pMeta.label}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-white leading-tight">{todayTask.title}</h3>

                  <p className="text-[11px] text-gray-400 leading-relaxed bg-white/5 border border-white/5 p-2.5 rounded-lg">
                    💡 <strong>Step 1:</strong> Click the resource link below to solve/study on {pMeta.label}.<br />
                    💡 <strong>Step 2:</strong> Submit proof of your completed work to unlock the quiz!
                  </p>

                  {(() => {
                    const accurateUrl = getAccurateResourceUrl(todayTask.title, todayTask.description);
                    return (
                      <a
                        href={accurateUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => handleLinkVisit(todayTask.id)}
                        className={`w-full py-2 font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all text-xs shadow-glow-cyan ${linkVisited
                            ? "bg-brand-green/20 border border-brand-green/40 text-brand-green"
                            : "bg-brand-cyan text-dark-bg hover:bg-brand-cyan/95"
                          }`}
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        {linkVisited ? `✅ Visited ${pMeta.label} Resource` : `Open & Study on ${pMeta.label}`}
                      </a>
                    );
                  })()}
                </div>
              </div>
            );
          })() : null}

          {/* Quiz-Gated Task Completion Section */}
          {!isAllDone && todayTask && (
            <div className="glass-card rounded-xl p-4 space-y-3 border border-white/[0.04]">
              {!quizActive ? (
                // Pre-quiz state: ALL task types need solving/completing 5 items first with realistic proof
                (() => {
                  const currentSolved = solvedCounts[todayTask.id] ?? todayTask._count?.solvedProblems ?? 0;
                  const quizReady = currentSolved >= REQUIRED_SOLVED;
                  const solvedPct = Math.min(100, Math.round((currentSolved / REQUIRED_SOLVED) * 100));
                  const linkVisited = Boolean(visitedLinks[todayTask.id]);

                  // Adaptive labels based on task type
                  const taskLabels = todayTask.type === "PROBLEM"
                    ? { doneMsg: "✅ 5 Problems Solved & Verified!", pendingMsg: "🔥 Practice 5 Questions First", btnLabel: "⚡ Submit Proof & Verify Question", description: "Solve", itemName: "question", allDone: "questions solved & verified" }
                    : todayTask.type === "MOCK"
                      ? { doneMsg: "✅ 5 Practices Verified!", pendingMsg: "🎯 Practice 5 Items First", btnLabel: "⚡ Submit Proof & Verify Practice", description: "Complete", itemName: "practice item", allDone: "practice items completed" }
                      : { doneMsg: "✅ 5 Checkpoints Verified!", pendingMsg: "📚 Study 5 Questions/Checkpoints First", btnLabel: "⚡ Submit Proof & Verify Checkpoint", description: "Complete", itemName: "question", allDone: "questions verified" };

                  return (
                    <>
                      <div className="flex items-center gap-2">
                        <FileCheck className="w-4 h-4 text-brand-cyan shrink-0" />
                        <h4 className="text-xs font-bold text-white uppercase tracking-wider">Realistic Work Verification</h4>
                      </div>

                      {/* Solve/Complete gate for ALL task types */}
                      <div className={`rounded-lg p-3 border space-y-2.5 ${quizReady
                          ? "border-brand-green/20 bg-brand-green/[0.04]"
                          : "border-brand-orange/20 bg-brand-orange/[0.04]"
                        }`}>
                        <div className="flex items-center justify-between">
                          <span className={`text-[10px] font-bold uppercase tracking-wider ${quizReady ? "text-brand-green" : "text-brand-orange"
                            }`}>
                            {quizReady ? taskLabels.doneMsg : taskLabels.pendingMsg}
                          </span>
                          <span className={`text-xs font-bold ${quizReady ? "text-brand-green" : "text-brand-orange"
                            }`}>
                            {currentSolved}/{REQUIRED_SOLVED}
                          </span>
                        </div>

                        {/* Progress bar */}
                        <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                          <motion.div
                            className={`h-full rounded-full ${quizReady
                                ? "bg-gradient-to-r from-brand-green to-brand-teal"
                                : "bg-gradient-to-r from-brand-orange to-brand-cyan"
                              }`}
                            initial={{ width: 0 }}
                            animate={{ width: `${solvedPct}%` }}
                            transition={{ duration: 0.5, ease: "easeOut" }}
                          />
                        </div>

                        {/* Individual progress dots */}
                        <div className="flex gap-1.5">
                          {Array.from({ length: REQUIRED_SOLVED }).map((_, i) => (
                            <div
                              key={i}
                              className={`flex-1 h-1 rounded-full transition-all duration-300 ${i < currentSolved ? "bg-brand-green" : "bg-white/10"
                                }`}
                            />
                          ))}
                        </div>

                        {!quizReady && (
                          <>
                            <p className="text-[10px] text-gray-400 leading-relaxed">
                              {!linkVisited ? (
                                <span className="text-brand-orange font-semibold">
                                  ⚠️ Click the resource link above to open and study the platform first.
                                </span>
                              ) : (
                                <span>
                                  Submit proof of work (submission URL or solution summary) for each of your {REQUIRED_SOLVED - currentSolved} remaining {taskLabels.itemName}{REQUIRED_SOLVED - currentSolved > 1 ? "s" : ""}.
                                </span>
                              )}
                            </p>

                            <button
                              onClick={() => openVerificationModal(todayTask)}
                              disabled={solvingProblem || loadingQuestions}
                              className={`w-full py-2 font-bold rounded-lg flex items-center justify-center gap-2 transition-all text-xs border ${linkVisited
                                  ? "bg-brand-orange/20 border-brand-orange/40 text-brand-orange hover:bg-brand-orange/30 cursor-pointer shadow-glow-orange"
                                  : "bg-white/5 border-white/10 text-gray-500 cursor-not-allowed"
                                }`}
                            >
                              <FileCheck className="w-3.5 h-3.5" />
                              {loadingQuestions ? "Loading AI Questions..." : taskLabels.btnLabel}
                            </button>
                          </>
                        )}

                        {quizReady && (
                          <p className="text-[10px] text-brand-green leading-relaxed font-semibold">
                            🎉 All {REQUIRED_SOLVED} {taskLabels.allDone}! Quiz is now unlocked below!
                          </p>
                        )}
                      </div>

                      <button
                        onClick={() => startQuiz(todayTask)}
                        disabled={!quizReady || loadingQuestions}
                        className={`w-full py-2.5 font-bold rounded-lg flex items-center justify-center gap-2 transition-all text-xs ${quizReady
                            ? "bg-gradient-to-r from-brand-cyan to-brand-blue text-dark-bg hover:opacity-90 shadow-glow-cyan cursor-pointer"
                            : "bg-white/5 text-gray-600 cursor-not-allowed border border-white/5"
                          }`}
                      >
                        <Brain className="w-3.5 h-3.5" />
                        <span>
                          {loadingQuestions
                            ? "Generating AI Quiz Questions..."
                            : quizReady
                            ? "Take Quiz to Complete Task"
                            : `🔒 Verify ${REQUIRED_SOLVED} Items to Unlock Quiz`}
                        </span>
                      </button>
                    </>
                  );
                })()
              ) : quizDone ? (
                // Quiz finished — show result
                <>
                  <div className={`rounded-lg p-4 border flex flex-col gap-3 ${quizPassed
                      ? "border-brand-green/20 bg-brand-green/[0.04]"
                      : "border-brand-red/20 bg-brand-red/[0.03]"
                    }`}>
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${quizPassed ? "bg-brand-green/10" : "bg-brand-red/10"
                        }`}>
                        {quizPassed
                          ? <Trophy className="w-5 h-5 text-brand-green" />
                          : <XCircle className="w-5 h-5 text-brand-red" />}
                      </div>
                      <div>
                        <p className={`text-sm font-bold ${quizPassed ? "text-brand-green" : "text-brand-red"
                          }`}>
                          {quizPassed ? "Task Unlocked! 🎉" : "Try Again"}
                        </p>
                        <p className="text-[10px] text-gray-500">
                          Score: {score}/{quizQuestions.length} · {quizPassed ? "Moving to next task..." : "Need 4/5 to pass"}
                        </p>
                      </div>
                    </div>

                    {/* Score bar */}
                    <div className="space-y-1">
                      <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${quizPassed ? "bg-brand-green" : "bg-brand-red"
                            }`}
                          style={{ width: `${(score / quizQuestions.length) * 100}%` }}
                        />
                      </div>
                    </div>

                    {!quizPassed && (
                      <button
                        onClick={() => startQuiz(todayTask)}
                        disabled={loadingQuestions}
                        className="w-full py-2 bg-white/5 border border-white/10 text-white font-semibold rounded-lg flex items-center justify-center gap-2 hover:bg-white/10 transition-all text-xs cursor-pointer disabled:opacity-50"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${loadingQuestions ? "animate-spin text-brand-cyan" : ""}`} />
                        {loadingQuestions ? "Generating Fresh AI Question Set..." : "Retry Quiz (Fresh Question Set)"}
                      </button>
                    )}
                  </div>
                </>
              ) : (
                // Active quiz — show question
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentQ}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.18 }}
                    className="space-y-3"
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Brain className="w-4 h-4 text-brand-cyan" />
                        <span className="text-[10px] font-bold text-brand-cyan uppercase tracking-wider">Quiz · Q{currentQ + 1}/{quizQuestions.length}</span>
                      </div>
                      {/* dot progress */}
                      <div className="flex gap-1">
                        {quizQuestions.map((_, i) => (
                          <div key={i} className={`w-1.5 h-1.5 rounded-full transition-all ${i < currentQ ? "bg-brand-green" : i === currentQ ? "bg-brand-cyan" : "bg-white/10"
                            }`} />
                        ))}
                      </div>
                    </div>

                    {/* Question */}
                    <p className="text-xs font-semibold text-white leading-relaxed">
                      {quizQuestions[currentQ]?.q}
                    </p>

                    {/* Options */}
                    <div className="space-y-1.5">
                      {quizQuestions[currentQ]?.options.map((opt, i) => {
                        const isCorrect = i === quizQuestions[currentQ].correct;
                        const isSelected = i === selectedOption;
                        let cls = "border border-white/10 bg-white/[0.02] text-gray-300 hover:border-brand-cyan/30 hover:bg-brand-cyan/[0.03]";
                        if (revealed) {
                          if (isCorrect) cls = "border border-brand-green/40 bg-brand-green/10 text-brand-green font-semibold";
                          else if (isSelected && !isCorrect) cls = "border border-brand-red/40 bg-brand-red/10 text-brand-red";
                          else cls = "border border-white/5 bg-white/[0.01] text-gray-600";
                        } else if (isSelected) {
                          cls = "border border-brand-cyan/40 bg-brand-cyan/10 text-brand-cyan font-semibold";
                        }
                        return (
                          <button
                            key={i}
                            onClick={() => handleSelect(i)}
                            disabled={revealed}
                            className={`w-full text-left px-3 py-2 rounded-lg text-[11px] transition-all flex items-center gap-2 ${cls} ${revealed ? "cursor-default" : "cursor-pointer"
                              }`}
                          >
                            <span className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 text-[8px] font-bold ${revealed && isCorrect
                                ? "border-brand-green bg-brand-green/20 text-brand-green"
                                : revealed && isSelected && !isCorrect
                                  ? "border-brand-red bg-brand-red/20 text-brand-red"
                                  : isSelected
                                    ? "border-brand-cyan bg-brand-cyan/20 text-brand-cyan"
                                    : "border-white/20 text-gray-500"
                              }`}>
                              {String.fromCharCode(65 + i)}
                            </span>
                            {opt}
                          </button>
                        );
                      })}
                    </div>

                    {/* Confirm button */}
                    <button
                      onClick={handleConfirm}
                      disabled={selectedOption === null || revealed}
                      className={`w-full py-2 font-bold rounded-lg flex items-center justify-center gap-1.5 text-xs transition-all ${selectedOption === null || revealed
                          ? "bg-white/5 text-gray-600 cursor-not-allowed"
                          : "bg-brand-cyan text-dark-bg hover:bg-brand-cyan/90 shadow-glow-cyan cursor-pointer"
                        }`}
                    >
                      <ChevronRight className="w-3.5 h-3.5" />
                      {revealed ? "Loading next..." : "Confirm Answer"}
                    </button>
                  </motion.div>
                </AnimatePresence>
              )}
            </div>
          )}

          {/* Mini score progression card */}
          <div className="glass-card rounded-xl p-4 space-y-2 border border-white/[0.04]">
            <div className="flex justify-between items-center text-[10px] font-bold text-gray-500 uppercase">
              <span className="flex items-center gap-1"><TrendingUp className="w-3.5 h-3.5 text-brand-cyan" />Readiness Curve</span>
              <span>Score: {user.readinessScore.toFixed(1)}</span>
            </div>
            <ReadinessChart score={user.readinessScore} analytics={user.analytics} />
          </div>

          {/* Focus Subjects */}
          {weakAreas.length > 0 && (
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider px-1">FOCUS AREAS</span>
              {weakAreas.map((w, i) => (
                <div key={i} className="flex items-center gap-2.5 p-3 rounded-lg bg-dark-card border border-dark-border hover:border-white/10 transition-all">
                  <div className={`w-1 h-6 rounded-full shrink-0 ${w.severity === "HIGH" ? "bg-brand-red" : "bg-brand-orange"}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-white truncate">{w.name}</p>
                    <p className="text-[10px] text-gray-500 truncate">{w.reason}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* ── Topic Checkpoint Question Verification Modal ── */}
      <AnimatePresence>
        {showProofModal && todayTask && (() => {
          const currentSolvedIdx = solvedCounts[todayTask.id] ?? todayTask._count?.solvedProblems ?? 0;
          const activeQ = activeVerificationQ || getNextVerificationQuestion(todayTask.title, todayTask.type, verificationUsedQuestions);
          const accurateUrl = getAccurateResourceUrl(todayTask.title, todayTask.description);

          return (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-dark-card border border-white/10 rounded-2xl p-6 max-w-lg w-full space-y-4 shadow-2xl relative max-h-[90vh] overflow-y-auto"
              >
                <button
                  onClick={() => {
                    setShowProofModal(false);
                    setProofError(null);
                    setProofInput("");
                    setCheckpointSelectedOpt(null);
                    setCheckpointFeedback(null);
                  }}
                  className="absolute top-4 right-4 text-gray-400 hover:text-white p-1 rounded-lg hover:bg-white/5 transition-all"
                >
                  <X className="w-5 h-5" />
                </button>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-brand-cyan/10 border border-brand-cyan/20 flex items-center justify-center text-brand-cyan shrink-0">
                    <FileCheck className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="text-base font-bold text-white leading-tight">Realistic Work Verification</h3>
                      <span className="text-xs font-bold text-brand-cyan bg-brand-cyan/10 border border-brand-cyan/20 px-2 py-0.5 rounded-full shrink-0">
                        {currentSolvedIdx}/5 Verified
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 font-medium truncate">
                      {todayTask.title}
                    </p>
                  </div>
                </div>

                {/* Accurate GeeksforGeeks / Tutorial link */}
                <a
                  href={accurateUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => handleLinkVisit(todayTask.id)}
                  className="w-full py-2 px-3 bg-brand-green/10 border border-brand-green/30 text-brand-green font-bold rounded-xl flex items-center justify-between text-xs hover:bg-brand-green/20 transition-all"
                >
                  <span className="flex items-center gap-1.5 truncate">
                    <BookOpen className="w-3.5 h-3.5 shrink-0" />
                    Open exact article on GeeksforGeeks
                  </span>
                  <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                </a>

                {/* Question box with smooth key transition */}
                {loadingQuestions && !activeVerificationQ ? (
                  <div className="flex flex-col items-center justify-center py-10 space-y-3 bg-white/[0.02] border border-white/5 rounded-xl">
                    <div className="w-7 h-7 border-2 border-brand-cyan/20 border-t-brand-cyan rounded-full animate-spin" />
                    <p className="text-xs text-brand-cyan font-medium animate-pulse">
                      Generating AI verification questions for {todayTask.title}...
                    </p>
                  </div>
                ) : (
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeQ.q}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.15 }}
                      className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 space-y-3"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-bold text-brand-cyan uppercase tracking-wider block">
                          Question #{Math.min(5, currentSolvedIdx + 1)} of 5
                        </span>
                        <span className="text-[10px] text-brand-cyan/80 bg-brand-cyan/10 px-2 py-0.5 rounded-md border border-brand-cyan/20 flex items-center gap-1 font-semibold truncate max-w-[200px]">
                          <Sparkles className="w-3 h-3 shrink-0" /> {todayTask.title}
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-white leading-relaxed">
                        {activeQ.q}
                      </p>

                    <div className="space-y-2 pt-1">
                      {activeQ.options.map((opt, i) => {
                        const isSelected = checkpointSelectedOpt === i;
                        return (
                          <button
                            key={i}
                            onClick={() => {
                              if (checkpointFeedback) return;
                              setCheckpointSelectedOpt(i);
                            }}
                            disabled={solvingProblem || Boolean(checkpointFeedback)}
                            className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs transition-all flex items-center gap-2.5 border ${isSelected
                                ? "border-brand-cyan bg-brand-cyan/15 text-white font-semibold shadow-glow-cyan"
                                : "border-white/10 bg-white/[0.02] text-gray-300 hover:bg-white/5 hover:border-white/20"
                              } ${checkpointFeedback ? "opacity-75 cursor-not-allowed" : "cursor-pointer"}`}
                          >
                            <span className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 text-[10px] font-bold ${isSelected ? "border-brand-cyan bg-brand-cyan text-dark-bg" : "border-white/20 text-gray-400"
                              }`}>
                              {String.fromCharCode(65 + i)}
                            </span>
                            <span className="flex-1">{opt}</span>
                          </button>
                        );
                      })}
                    </div>
                  </motion.div>
                </AnimatePresence>
              )}

                {/* Instant Evaluation Feedback Alert */}
                {checkpointFeedback && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-3 rounded-xl border text-xs font-semibold leading-relaxed flex items-start gap-2 ${checkpointFeedback.isCorrect
                        ? "border-brand-green/30 bg-brand-green/10 text-brand-green"
                        : "border-brand-red/30 bg-brand-red/10 text-brand-red"
                      }`}
                  >
                    {checkpointFeedback.isCorrect ? <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" /> : <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />}
                    <span>{checkpointFeedback.message}</span>
                  </motion.div>
                )}

                {proofError && !checkpointFeedback && (
                  <p className="text-[11px] text-brand-red font-medium flex items-center gap-1">
                    <AlertCircle className="w-3 h-3 shrink-0" /> {proofError}
                  </p>
                )}

                {/* Actions */}
                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() => {
                      setShowProofModal(false);
                      setProofError(null);
                      setProofInput("");
                      setCheckpointSelectedOpt(null);
                      setCheckpointFeedback(null);
                    }}
                    className="flex-1 py-2.5 bg-white/5 border border-white/10 rounded-xl text-xs font-semibold text-gray-300 hover:bg-white/10 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => submitProofAndSolve(todayTask.id, todayTask.type, checkpointSelectedOpt, activeQ)}
                    disabled={solvingProblem || checkpointSelectedOpt === null || Boolean(checkpointFeedback)}
                    className="flex-1 py-2.5 bg-brand-cyan text-dark-bg rounded-xl text-xs font-bold hover:bg-brand-cyan/90 transition-all shadow-glow-cyan flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                  >
                    {solvingProblem ? (
                      <span>Evaluating...</span>
                    ) : (
                      <>
                        <Check className="w-4 h-4" />
                        <span>Submit & Verify Answer</span>
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            </div>
          );
        })()}
      </AnimatePresence>
    </div>
  );
}
