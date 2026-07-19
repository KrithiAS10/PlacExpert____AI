"use client";

import { useState, useEffect, useRef } from "react";
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
  Upload,
  RefreshCw,
  BarChart3,
  FileCode,
  Check,
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
  status: string;
  type: string;
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
}
interface WeakArea {
  name: string;
  reason: string;
  severity: string;
}

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

function resolvePlatform(url: string | null, taskType: string): PlatformMeta {
  const targetUrl = url || "";
  if (targetUrl.includes("leetcode.com")) {
    return {
      label: "LeetCode",
      color: "text-brand-cyan",
      bg: "bg-brand-cyan/10",
      border: "border-brand-cyan/20",
      icon: Code2,
    };
  }
  if (targetUrl.includes("hackerrank.com")) {
    return {
      label: "HackerRank",
      color: "text-brand-orange",
      bg: "bg-brand-orange/10",
      border: "border-brand-orange/20",
      icon: Brain,
    };
  }
  if (targetUrl.includes("geeksforgeeks.org")) {
    return {
      label: "GeeksforGeeks",
      color: "text-brand-purple",
      bg: "bg-brand-purple/10",
      border: "border-brand-purple/20",
      icon: BookOpen,
    };
  }

  // Fallbacks based on task types
  if (taskType === "PROBLEM") {
    return {
      label: "LeetCode",
      color: "text-brand-cyan",
      bg: "bg-brand-cyan/10",
      border: "border-brand-cyan/20",
      icon: Code2,
    };
  }
  if (taskType === "MOCK") {
    return {
      label: "HackerRank",
      color: "text-brand-orange",
      bg: "bg-brand-orange/10",
      border: "border-brand-orange/20",
      icon: Brain,
    };
  }
  return {
    label: "GeeksforGeeks",
    color: "text-brand-purple",
    bg: "bg-brand-purple/10",
    border: "border-brand-purple/20",
    icon: BookOpen,
  };
}

export default function RoadmapPage() {
  const [roadmap, setRoadmap] = useState<Roadmap | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [weakAreas, setWeakAreas] = useState<WeakArea[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedPhaseId, setExpandedPhaseId] = useState<string | null>(null);

  // File Upload states
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<"idle" | "uploading" | "success" | "error">("idle");
  const [uploadProgress, setUploadProgress] = useState(0);

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
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchRoadmapData();
  }, []);

  // Handle simulated upload and real DB save
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setUploadStatus("idle");
    }
  };

  const triggerUpload = async () => {
    if (!selectedFile || !todayTask) return;

    setUploadStatus("uploading");
    setUploadProgress(0);

    // Simulated progress animation
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 90) {
          clearInterval(interval);
          return 90;
        }
        return prev + 15;
      });
    }, 150);

    try {
      // Call endpoint to update task status in DB
      const res = await fetch("/api/roadmap/task", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          taskId: todayTask.id,
          status: "COMPLETED",
        }),
      });

      clearInterval(interval);
      setUploadProgress(100);

      if (res.ok) {
        setTimeout(() => {
          setUploadStatus("success");
          setSelectedFile(null);
          // Refetch to update progress instantly
          fetchRoadmapData();
        }, 300);
      } else {
        setUploadStatus("error");
      }
    } catch {
      clearInterval(interval);
      setUploadStatus("error");
    }
  };

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

  const allTasks      = roadmap.phases.flatMap((p) => p.tasks);
  const todayTask     = allTasks.find((t) => t.day === user.currentDay) ?? allTasks[0];
  const totalDays     = allTasks.length > 0 ? Math.max(...allTasks.map((t) => t.day)) : 45;
  const doneTasks     = allTasks.filter((t) => t.status === "COMPLETED").length;
  const progressPct   = Math.min(100, Math.round((doneTasks / allTasks.length) * 100));
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
              Day {user.currentDay} of {totalDays}
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
            <span>PREPARATION TRACK</span>
            <span>{doneTasks}/{allTasks.length} COMPLETED</span>
          </div>

          <div className="space-y-2">
            {roadmap.phases.map((phase, pi) => {
              const startDay  = phase.tasks.length ? Math.min(...phase.tasks.map((t) => t.day)) : phase.order * 7 - 6;
              const endDay    = phase.tasks.length ? Math.max(...phase.tasks.map((t) => t.day)) : phase.order * 7;
              const phStatus  = user.currentDay >= startDay && user.currentDay <= endDay ? "active"
                              : user.currentDay > endDay ? "done" : "locked";
              const phaseDone = phase.tasks.filter((t) => t.status === "COMPLETED").length;
              const isOpen    = expandedPhaseId === phase.id;

              const phColors = ["cyan", "blue", "teal", "purple", "orange", "green"][pi % 6];
              const clr: Record<string, string> = {
                cyan:   "text-brand-cyan border-brand-cyan/20 bg-brand-cyan/5",
                blue:   "text-brand-blue border-brand-blue/20 bg-brand-blue/5",
                teal:   "text-brand-teal border-brand-teal/20 bg-brand-teal/5",
                purple: "text-brand-purple border-brand-purple/20 bg-brand-purple/5",
                orange: "text-brand-orange border-brand-orange/20 bg-brand-orange/5",
                green:  "text-brand-green border-brand-green/20 bg-brand-green/5",
              };

              return (
                <div
                  key={phase.id}
                  className={`rounded-xl border overflow-hidden transition-colors ${
                    isOpen ? "border-white/10 bg-white/[0.01]" : "border-white/[0.04] bg-dark-card"
                  }`}
                >
                  {/* Accordion Trigger */}
                  <button
                    onClick={() => setExpandedPhaseId(isOpen ? null : phase.id)}
                    className="w-full flex items-center gap-3 p-3.5 text-left focus:outline-none"
                  >
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs shrink-0 border ${clr[phColors] || clr.cyan}`}>
                      {phStatus === "done"   ? <CheckCircle2 className="w-4 h-4" /> :
                       phStatus === "active" ? <Play className="w-3.5 h-3.5 fill-current" /> :
                                              <Lock className="w-3.5 h-3.5 opacity-40" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-sm font-semibold text-white truncate block">{phase.title}</span>
                      <p className="text-[10px] text-gray-500">Days {startDay}–{endDay} · {phaseDone}/{phase.tasks.length} done</p>
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
                          {phase.tasks.map((task) => {
                            const isToday = task.day === user.currentDay;
                            const isDone  = task.status === "COMPLETED";
                            const pMeta   = resolvePlatform(task.description, task.type);
                            const PlatformIcon = pMeta.icon;

                            return (
                              <div
                                key={task.id}
                                className={`flex items-center justify-between gap-3 px-4 py-3 hover:bg-white/[0.01] transition-colors ${
                                  isToday ? "bg-brand-cyan/[0.03]" : ""
                                }`}
                              >
                                <div className="flex items-center gap-2.5 min-w-0">
                                  {isDone ? (
                                    <CheckCircle2 className="w-4 h-4 text-brand-green shrink-0" />
                                  ) : isToday ? (
                                    <Play className="w-4 h-4 text-brand-cyan fill-brand-cyan/20 shrink-0 animate-pulse" />
                                  ) : (
                                    <div className="w-4 h-4 rounded-full border border-white/20 flex items-center justify-center shrink-0">
                                      <span className="text-[8px] text-gray-500 font-bold">{task.day}</span>
                                    </div>
                                  )}
                                  <span className={`text-xs font-medium truncate ${isDone ? "text-gray-600 line-through" : "text-gray-300"}`}>
                                    {task.title}
                                  </span>
                                </div>

                                <div className="flex items-center gap-2 shrink-0">
                                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border flex items-center gap-1 ${pMeta.color} ${pMeta.bg} ${pMeta.border}`}>
                                    <PlatformIcon className="w-2.5 h-2.5" />
                                    {pMeta.label}
                                  </span>
                                  {task.description && (
                                    <a
                                      href={task.description}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="p-1 rounded-md bg-white/5 border border-white/10 hover:text-brand-cyan hover:border-brand-cyan/20 transition-all text-gray-500"
                                      title={`Solve on ${pMeta.label}`}
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
          
          {/* Today's Focus Card */}
          {todayTask && (() => {
            const pMeta = resolvePlatform(todayTask.description, todayTask.type);
            const PlatformIcon = pMeta.icon;
            return (
              <div className="relative overflow-hidden rounded-xl border border-brand-cyan/20 bg-gradient-to-br from-brand-cyan/10 via-brand-blue/5 to-transparent p-4">
                <div className="absolute -top-6 -right-6 w-24 h-24 bg-brand-cyan/5 blur-2xl pointer-events-none" />
                <div className="relative space-y-3">
                  <div className="flex justify-between items-center text-[10px] font-bold">
                    <span className="text-brand-cyan uppercase tracking-widest">TODAY · DAY {user.currentDay}</span>
                    <span className={`px-2 py-0.5 rounded-full border flex items-center gap-1 ${pMeta.color} ${pMeta.bg} ${pMeta.border}`}>
                      <PlatformIcon className="w-2.5 h-2.5" />
                      {pMeta.label}
                    </span>
                  </div>
                  
                  <h3 className="text-sm font-bold text-white leading-tight">{todayTask.title}</h3>
                  
                  {todayTask.description ? (
                    <a
                      href={todayTask.description}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-2 bg-brand-cyan text-dark-bg font-bold rounded-lg flex items-center justify-center gap-1.5 hover:bg-brand-cyan/95 transition-all text-xs shadow-glow-cyan"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      Solve on {pMeta.label}
                    </a>
                  ) : (
                    <button className="w-full py-2 bg-brand-cyan text-dark-bg font-bold rounded-lg flex items-center justify-center gap-1.5 hover:bg-brand-cyan/95 transition-all text-xs shadow-glow-cyan">
                      <Play className="w-3.5 h-3.5 fill-dark-bg" />
                      Start Task
                    </button>
                  )}
                </div>
              </div>
            );
          })()}

          {/* Solution Submission Section */}
          <div className="glass-card rounded-xl p-4 space-y-3 border border-white/[0.04]">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Submit Code Solution</h4>
            
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              accept=".py,.java,.cpp,.js,.sql,.txt"
            />

            {uploadStatus === "idle" && !selectedFile && (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-white/10 hover:border-brand-cyan/30 hover:bg-brand-cyan/[0.01] rounded-lg p-5 flex flex-col items-center justify-center text-center cursor-pointer transition-all group"
              >
                <Upload className="w-5 h-5 text-brand-cyan mb-2 group-hover:scale-110 transition-transform" />
                <p className="text-xs font-semibold text-white">Select code file</p>
                {/* <p className="text-[10px] text-gray-500 mt-1">.py, .java, .cpp, .js, .sql</p> */}
              </div>
            )}

            {selectedFile && uploadStatus !== "success" && (
              <div className="bg-white/5 border border-white/10 rounded-lg p-3 space-y-3">
                <div className="flex items-start gap-2">
                  <FileCode className="w-4 h-4 text-brand-cyan shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-white truncate">{selectedFile.name}</p>
                    <p className="text-[10px] text-gray-500">{(selectedFile.size / 1024).toFixed(1)} KB</p>
                  </div>
                </div>

                {uploadStatus === "uploading" ? (
                  <div className="space-y-1.5">
                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full bg-brand-cyan transition-all duration-150" style={{ width: `${uploadProgress}%` }} />
                    </div>
                    <p className="text-[9px] text-gray-500 text-right">Uploading... {uploadProgress}%</p>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={triggerUpload}
                      className="flex-1 py-1.5 bg-brand-cyan text-dark-bg font-bold rounded-md hover:bg-brand-cyan/90 transition-all text-xs"
                    >
                      Submit code
                    </button>
                    <button
                      onClick={() => setSelectedFile(null)}
                      className="px-3 py-1.5 bg-white/5 text-white font-medium rounded-md hover:bg-white/10 transition-all text-xs"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            )}

            {uploadStatus === "success" && (
              <div className="border border-brand-green/20 bg-brand-green/[0.02] rounded-lg p-3.5 flex items-center gap-3">
                <div className="w-7 h-7 rounded-full bg-brand-green/10 flex items-center justify-center shrink-0">
                  <Check className="w-4 h-4 text-brand-green" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-white">Solution Accepted!</p>
                  <p className="text-[10px] text-gray-500">Day status updated successfully.</p>
                </div>
              </div>
            )}
          </div>

          {/* Mini score progression card */}
          <div className="glass-card rounded-xl p-4 space-y-2 border border-white/[0.04]">
            <div className="flex justify-between items-center text-[10px] font-bold text-gray-500 uppercase">
              <span className="flex items-center gap-1"><TrendingUp className="w-3.5 h-3.5 text-brand-cyan" />Readiness Curve</span>
              <span>Score: {user.readinessScore.toFixed(1)}</span>
            </div>
            <ReadinessChart score={user.readinessScore} />
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
    </div>
  );
}
