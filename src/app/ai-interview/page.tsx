"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload, FileText, Brain, Target, Mic, MicOff, Send,
  ChevronRight, RotateCcw, Loader2, CheckCircle2, AlertCircle,
  Volume2, VolumeX, Radio, Keyboard, Sparkles, BarChart2,
  BookOpen, TrendingUp, Award, AlertTriangle, Clock, MessageSquare,
  User, Briefcase, Sliders, X,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type InterviewType = "Technical" | "HR" | "Behavioral" | "Mixed";
type Difficulty = "Easy" | "Medium" | "Hard";
type InterviewMode = "Text" | "Voice";
type Stage = "upload" | "configure" | "interview" | "report";

interface ParsedResume {
  name: string;
  skills: string[];
  technologies: string[];
  projects: { name?: string; description?: string }[];
  experience: { title?: string; company?: string }[];
  certifications: string[];
}

interface Question {
  id: string;
  questionText: string;
  category: string;
  topic: string;
  difficulty: string;
  intent?: string;
  isFollowUp: boolean;
  orderIndex: number;
}

interface EvaluationResult {
  score: number;
  feedback: string;
  strengths: string[];
  weaknesses: string[];
  knowledgeGaps: string[];
  resumeConsistency?: string;
}

interface QARecord {
  question: Question;
  answer: string;
  evaluation: EvaluationResult;
}

interface Report {
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

// ─── Speech Recognition types ─────────────────────────────────────────────────
type SpeechRecognitionLike = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((e: { results: { length: number; [i: number]: { isFinal: boolean; [j: number]: { transcript: string } } } }) => void) | null;
  onend: (() => void) | null;
  onerror: ((e: { error: string }) => void) | null;
  start: () => void;
  stop: () => void;
};

function getSpeechRecognition() {
  if (typeof window === "undefined") return null;
  const w = window as typeof window & { SpeechRecognition?: new () => SpeechRecognitionLike; webkitSpeechRecognition?: new () => SpeechRecognitionLike };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

// ─── Score Badge ──────────────────────────────────────────────────────────────
function ScoreBadge({ score, size = "md" }: { score: number; size?: "sm" | "md" | "lg" }) {
  const color = score >= 8 ? "text-brand-green" : score >= 6 ? "text-brand-cyan" : score >= 4 ? "text-brand-orange" : "text-red-400";
  const sizes = { sm: "text-lg", md: "text-3xl", lg: "text-5xl" };
  return (
    <span className={`font-bold ${sizes[size]} ${color}`}>
      {score.toFixed(1)}<span className="text-sm text-gray-500 font-normal">/10</span>
    </span>
  );
}

// ─── Progress Ring ────────────────────────────────────────────────────────────
function ProgressRing({ value, max, label, color = "#06b6d4" }: { value: number; max: number; label: string; color?: string }) {
  const pct = Math.min(100, (value / max) * 100);
  const r = 28; const circ = 2 * Math.PI * r;
  return (
    <div className="flex flex-col items-center gap-1">
      <svg width="72" height="72" viewBox="0 0 72 72" className="-rotate-90">
        <circle cx="36" cy="36" r={r} fill="none" stroke="#1e293b" strokeWidth="6" />
        <circle cx="36" cy="36" r={r} fill="none" stroke={color} strokeWidth="6"
          strokeDasharray={circ} strokeDashoffset={circ * (1 - pct / 100)}
          strokeLinecap="round" style={{ transition: "stroke-dashoffset 0.8s ease" }} />
      </svg>
      <span className="text-xs text-gray-400 text-center leading-4">{label}</span>
      <span className="text-sm font-bold text-white">{value.toFixed(1)}</span>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function AIInterviewPage() {
  const [stage, setStage] = useState<Stage>("upload");

  // Upload stage
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [resumeId, setResumeId] = useState<string | null>(null);
  const [parsedResume, setParsedResume] = useState<ParsedResume | null>(null);

  // Config stage
  const [interviewType, setInterviewType] = useState<InterviewType>("Technical");
  const [difficulty, setDifficulty] = useState<Difficulty>("Medium");
  const [mode, setMode] = useState<InterviewMode>("Text");
  const [totalQuestions, setTotalQuestions] = useState(5);
  const [targetRole, setTargetRole] = useState("");
  const [configLoading, setConfigLoading] = useState(false);

  // Interview stage
  const [interviewId, setInterviewId] = useState<string | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [answer, setAnswer] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentEval, setCurrentEval] = useState<EvaluationResult | null>(null);
  const [qaHistory, setQaHistory] = useState<QARecord[]>([]);
  const [questionsAnswered, setQuestionsAnswered] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [interviewError, setInterviewError] = useState<string | null>(null);

  // Voice
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [autoSpeak, setAutoSpeak] = useState(true);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [speechError, setSpeechError] = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const speechSupported = typeof window !== "undefined" && Boolean(getSpeechRecognition());

  // Report stage
  const [report, setReport] = useState<Report | null>(null);
  const [reportLoading, setReportLoading] = useState(false);

  // ─── File Upload ────────────────────────────────────────────────────────
  const handleFile = (f: File) => {
    setFile(f);
    setUploadError(null);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  };

  const uploadResume = async () => {
    if (!file) return;
    setUploadLoading(true);
    setUploadError(null);
    try {
      const fd = new FormData();
      fd.append("resume", file);
      const res = await fetch("/api/resume/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");
      setResumeId(data.resumeId);
      setParsedResume(data.parsedData);
      setStage("configure");
    } catch (e: unknown) {
      setUploadError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploadLoading(false);
    }
  };

  // ─── Start Interview ────────────────────────────────────────────────────
  const startInterview = async () => {
    if (!resumeId) return;
    setConfigLoading(true);
    try {
      const res = await fetch("/api/interview/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeId, interviewType, difficulty, mode, totalQuestions, targetRole: targetRole.trim() || undefined }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to start interview");
      setInterviewId(data.interviewId);
      setCurrentQuestion(data.question);
      setStage("interview");
    } catch (e: unknown) {
      setInterviewError(e instanceof Error ? e.message : "Failed to start");
    } finally {
      setConfigLoading(false);
    }
  };

  // ─── Submit Answer ──────────────────────────────────────────────────────
  const submitAnswer = async () => {
    if (!answer.trim() || !currentQuestion || !interviewId || isSubmitting) return;
    setIsSubmitting(true);
    setInterviewError(null);
    try {
      const res = await fetch(`/api/interview/${interviewId}/answer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questionId: currentQuestion.id, answer: answer.trim(), durationSeconds: recordingSeconds }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Submission failed");

      setCurrentEval(data.evaluation);
      setQaHistory((prev) => [...prev, { question: currentQuestion, answer: answer.trim(), evaluation: data.evaluation }]);
      setQuestionsAnswered(data.questionsAnswered);
      setIsComplete(data.isComplete);

      if (data.isComplete) {
        // Auto-fetch report
        await fetchReport();
      } else if (data.nextQuestion) {
        // Don't auto-navigate — wait for user to click Next
        setCurrentQuestion(data.nextQuestion as Question);
      }
    } catch (e: unknown) {
      setInterviewError(e instanceof Error ? e.message : "Failed to submit");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ─── Next Question ──────────────────────────────────────────────────────
  const goToNextQuestion = () => {
    setAnswer("");
    setCurrentEval(null);
    setSpeechError(null);
    setRecordingSeconds(0);
    stopRecording();
    stopSpeaking();
  };

  // ─── Fetch Report ───────────────────────────────────────────────────────
  const fetchReport = useCallback(async () => {
    if (!interviewId) return;
    setReportLoading(true);
    try {
      const res = await fetch(`/api/interview/${interviewId}/report`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to generate report");
      setReport(data.report);
      setStage("report");
    } catch (e: unknown) {
      setInterviewError(e instanceof Error ? e.message : "Failed to generate report");
    } finally {
      setReportLoading(false);
    }
  }, [interviewId]);

  // ─── TTS ────────────────────────────────────────────────────────────────
  const speakText = useCallback((text: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utt = new SpeechSynthesisUtterance(text);
    utt.rate = 0.92; utt.lang = "en-US";
    const voices = window.speechSynthesis.getVoices();
    const preferred = voices.find((v) => v.lang.startsWith("en") && v.name.includes("Google"))
      ?? voices.find((v) => v.lang.startsWith("en"));
    if (preferred) utt.voice = preferred;
    utt.onstart = () => setIsSpeaking(true);
    utt.onend = () => setIsSpeaking(false);
    utt.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utt);
  }, []);

  const stopSpeaking = useCallback(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, []);

  useEffect(() => {
    if (mode === "Voice" && autoSpeak && currentQuestion && stage === "interview" && !currentEval) {
      const t = setTimeout(() => speakText(currentQuestion.questionText), 400);
      return () => { clearTimeout(t); stopSpeaking(); };
    }
  }, [currentQuestion?.id, autoSpeak, mode, stage, speakText, stopSpeaking, currentEval]);

  // ─── Mic ─────────────────────────────────────────────────────────────────
  const stopRecording = useCallback(() => {
    try { recognitionRef.current?.stop(); } catch { }
    setIsRecording(false);
    if (timerRef.current) clearInterval(timerRef.current);
  }, []);

  const startRecording = () => {
    setSpeechError(null);
    stopSpeaking();
    const Recognition = getSpeechRecognition();
    if (!Recognition) { setSpeechError("Speech recognition not supported. Type your answer."); return; }
    try {
      const rec = new Recognition();
      rec.continuous = true; rec.interimResults = true; rec.lang = "en-US";
      rec.onresult = (e) => {
        let final = ""; let interim = "";
        for (let i = 0; i < e.results.length; i++) {
          if (e.results[i].isFinal) final += e.results[i][0].transcript + " ";
          else interim += e.results[i][0].transcript;
        }
        const updated = (final + interim).trim();
        if (updated) setAnswer(updated);
      };
      rec.onerror = (e) => {
        if (e.error === "not-allowed") setSpeechError("Microphone access denied.");
      };
      rec.onend = () => { setIsRecording(false); if (timerRef.current) clearInterval(timerRef.current); };
      rec.start();
      recognitionRef.current = rec;
      setIsRecording(true); setRecordingSeconds(0);
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = setInterval(() => setRecordingSeconds((s) => s + 1), 1000);
    } catch { setSpeechError("Could not start microphone."); }
  };

  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); stopSpeaking(); }, [stopSpeaking]);

  const progress = totalQuestions > 0 ? Math.round((questionsAnswered / totalQuestions) * 100) : 0;

  // ─── STAGE: Upload ────────────────────────────────────────────────────────
  if (stage === "upload") {
    return (
      <div className="min-h-[calc(100vh-8rem)] flex flex-col gap-8">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Brain className="h-6 w-6 text-brand-purple" /> AI Mock Interview
          </h1>
          <p className="text-sm text-gray-400 mt-1">Upload your resume to start a personalized AI interview session.</p>
        </div>

        <div className="max-w-2xl mx-auto w-full space-y-6">
          {/* Drop zone */}
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={onDrop}
            className={`relative flex flex-col items-center justify-center gap-4 rounded-3xl border-2 border-dashed p-12 text-center transition-all cursor-pointer ${
              isDragging ? "border-brand-cyan bg-brand-cyan/5" : "border-dark-border hover:border-brand-purple/40 hover:bg-white/[0.02]"
            }`}
            onClick={() => document.getElementById("resume-file-input")?.click()}
          >
            <input
              id="resume-file-input"
              type="file"
              accept=".pdf,.docx,.doc,.txt"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
            />
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-purple/10 border border-brand-purple/20">
              <Upload className="h-8 w-8 text-brand-purple" />
            </div>
            {file ? (
              <div className="space-y-1">
                <p className="font-bold text-white flex items-center gap-2"><FileText className="h-4 w-4 text-brand-cyan" />{file.name}</p>
                <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(1)} KB — Click to change</p>
              </div>
            ) : (
              <div className="space-y-1">
                <p className="font-semibold text-white">Drop your resume here or click to browse</p>
                <p className="text-xs text-gray-500">PDF, DOCX, or TXT · Max 5 MB</p>
              </div>
            )}
          </div>

          {uploadError && (
            <div className="flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">
              <AlertCircle className="h-4 w-4 shrink-0" /> {uploadError}
            </div>
          )}

          <button
            onClick={uploadResume}
            disabled={!file || uploadLoading}
            className="w-full h-14 rounded-2xl bg-brand-purple font-bold text-white text-sm transition-all hover:bg-brand-purple/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-[0_0_20px_-4px_rgba(168,85,247,0.5)]"
          >
            {uploadLoading ? <><Loader2 className="h-5 w-5 animate-spin" /> Parsing Resume…</> : <><FileText className="h-5 w-5" /> Upload & Parse Resume</>}
          </button>

          {/* Info cards */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { icon: Brain, label: "AI Analysis", desc: "Resume parsed & analyzed", color: "text-brand-purple" },
              { icon: Target, label: "Personalized", desc: "Questions from your resume", color: "text-brand-cyan" },
              { icon: BarChart2, label: "Full Report", desc: "Detailed score breakdown", color: "text-brand-green" },
            ].map(({ icon: Icon, label, desc, color }) => (
              <div key={label} className="glass-card rounded-2xl p-4 text-center space-y-2">
                <Icon className={`h-6 w-6 mx-auto ${color}`} />
                <p className="text-xs font-bold text-white">{label}</p>
                <p className="text-[10px] text-gray-500">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ─── STAGE: Configure ─────────────────────────────────────────────────────
  if (stage === "configure") {
    return (
      <div className="min-h-[calc(100vh-8rem)] space-y-6">
        <div className="flex items-center gap-3">
          <button onClick={() => setStage("upload")} className="text-gray-500 hover:text-white transition-colors">
            <ChevronRight className="h-5 w-5 rotate-180" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-white">Configure Interview</h1>
            <p className="text-sm text-gray-400">Set up your personalized interview session</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Resume Summary */}
          <div className="glass-card rounded-3xl p-6 space-y-5">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-brand-cyan" />
              <h2 className="text-sm font-bold text-white">Resume Detected</h2>
            </div>
            {parsedResume && (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-purple/10 border border-brand-purple/20">
                    <User className="h-6 w-6 text-brand-purple" />
                  </div>
                  <div>
                    <p className="font-bold text-white">{parsedResume.name}</p>
                    <p className="text-xs text-gray-500">{parsedResume.experience?.[0]?.title ?? "Candidate"}</p>
                  </div>
                </div>
                {parsedResume.skills?.length > 0 && (
                  <div>
                    <p className="text-[10px] font-bold uppercase text-gray-500 mb-2">Skills</p>
                    <div className="flex flex-wrap gap-1.5">
                      {parsedResume.skills.slice(0, 12).map((s) => (
                        <span key={s} className="rounded-full bg-brand-cyan/10 px-2.5 py-1 text-[10px] text-brand-cyan">{s}</span>
                      ))}
                      {parsedResume.skills.length > 12 && <span className="rounded-full bg-white/5 px-2.5 py-1 text-[10px] text-gray-500">+{parsedResume.skills.length - 12} more</span>}
                    </div>
                  </div>
                )}
                {parsedResume.technologies?.length > 0 && (
                  <div>
                    <p className="text-[10px] font-bold uppercase text-gray-500 mb-2">Technologies</p>
                    <div className="flex flex-wrap gap-1.5">
                      {parsedResume.technologies.slice(0, 10).map((t) => (
                        <span key={t} className="rounded-full bg-brand-purple/10 px-2.5 py-1 text-[10px] text-brand-purple">{t}</span>
                      ))}
                    </div>
                  </div>
                )}
                {parsedResume.projects?.length > 0 && (
                  <div>
                    <p className="text-[10px] font-bold uppercase text-gray-500 mb-2">Projects ({parsedResume.projects.length})</p>
                    <div className="space-y-1">
                      {parsedResume.projects.slice(0, 3).map((p, i) => (
                        <p key={i} className="text-xs text-gray-400 flex items-center gap-1.5"><span className="text-brand-cyan">▸</span>{p.name}</p>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right: Config Options */}
          <div className="glass-card rounded-3xl p-6 space-y-5">
            <div className="flex items-center gap-2">
              <Sliders className="h-5 w-5 text-brand-orange" />
              <h2 className="text-sm font-bold text-white">Interview Settings</h2>
            </div>

            {/* Target Role */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5"><Briefcase className="h-3.5 w-3.5" /> Target Role (optional)</label>
              <input
                type="text"
                placeholder="e.g. Full Stack Developer, ML Engineer"
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                className="w-full rounded-xl border border-dark-border bg-dark-bg px-4 py-2.5 text-sm text-white outline-none placeholder:text-gray-600 focus:border-brand-cyan/50"
              />
            </div>

            {/* Interview Type */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Interview Type</label>
              <div className="grid grid-cols-2 gap-2">
                {(["Technical", "HR", "Behavioral", "Mixed"] as InterviewType[]).map((t) => (
                  <button key={t} onClick={() => setInterviewType(t)}
                    className={`rounded-xl border p-3 text-sm font-bold transition-all ${interviewType === t ? "border-brand-cyan/50 bg-brand-cyan/10 text-brand-cyan" : "border-dark-border text-gray-400 hover:text-white hover:border-white/10"}`}>
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Difficulty */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Difficulty</label>
              <div className="grid grid-cols-3 gap-2">
                {(["Easy", "Medium", "Hard"] as Difficulty[]).map((d) => {
                  const colors = { Easy: "brand-green", Medium: "brand-orange", Hard: "red-400" };
                  const c = colors[d];
                  const isSelected = difficulty === d;
                  return (
                    <button key={d} onClick={() => setDifficulty(d)}
                      className={`rounded-xl border p-2.5 text-sm font-bold transition-all ${isSelected ? `border-${c}/50 bg-${c}/10 text-${c}` : "border-dark-border text-gray-400 hover:text-white"}`}>
                      {d}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Mode */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Interview Mode</label>
              <div className="grid grid-cols-2 gap-2">
                {[{ v: "Text" as InterviewMode, icon: Keyboard, label: "Text" }, { v: "Voice" as InterviewMode, icon: Mic, label: "Voice" }].map(({ v, icon: Icon, label }) => (
                  <button key={v} onClick={() => setMode(v)}
                    className={`rounded-xl border p-3 text-sm font-bold transition-all flex items-center justify-center gap-2 ${mode === v ? "border-brand-purple/50 bg-brand-purple/10 text-brand-purple" : "border-dark-border text-gray-400 hover:text-white"}`}>
                    <Icon className="h-4 w-4" /> {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Question Count */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider flex justify-between">
                <span>Number of Questions</span>
                <span className="text-brand-cyan font-mono">{totalQuestions}</span>
              </label>
              <input type="range" min={3} max={15} step={1} value={totalQuestions}
                onChange={(e) => setTotalQuestions(parseInt(e.target.value))}
                className="w-full accent-brand-cyan cursor-pointer" />
              <div className="flex justify-between text-[10px] text-gray-600">
                <span>3 (Quick)</span><span>8 (Standard)</span><span>15 (Full)</span>
              </div>
            </div>

            {interviewError && (
              <div className="flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">
                <AlertCircle className="h-4 w-4 shrink-0" /> {interviewError}
              </div>
            )}

            <button onClick={startInterview} disabled={configLoading}
              className="w-full h-14 rounded-2xl bg-gradient-to-r from-brand-purple to-brand-cyan font-bold text-white text-sm transition-all hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2 shadow-[0_0_25px_-5px_rgba(168,85,247,0.5)]">
              {configLoading ? <><Loader2 className="h-5 w-5 animate-spin" /> Starting Interview…</> : <><Sparkles className="h-5 w-5" /> Start AI Interview</>}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─── STAGE: Interview ─────────────────────────────────────────────────────
  if (stage === "interview") {
    return (
      <div className="min-h-[calc(100vh-8rem)] space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-purple/10 border border-brand-purple/20">
              <Brain className="h-5 w-5 text-brand-purple" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">AI Interview</h1>
              <p className="text-xs text-gray-500">{interviewType} · {difficulty} · {mode} Mode</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* Progress */}
            <div className="glass-card rounded-xl px-4 py-2 flex items-center gap-3">
              <span className="text-xs text-gray-400">Progress</span>
              <div className="w-24 h-1.5 bg-dark-bg rounded-full overflow-hidden">
                <div className="h-full bg-brand-cyan transition-all duration-500" style={{ width: `${progress}%` }} />
              </div>
              <span className="text-xs font-mono text-white">{questionsAnswered}/{totalQuestions}</span>
            </div>
            {mode === "Voice" && (
              <button onClick={isSpeaking ? stopSpeaking : () => currentQuestion && speakText(currentQuestion.questionText)}
                className={`h-10 px-3 rounded-xl border text-xs font-bold transition-all flex items-center gap-2 ${isSpeaking ? "border-brand-purple/50 bg-brand-purple/20 text-brand-purple" : "border-dark-border bg-dark-card text-gray-300 hover:text-white"}`}>
                {isSpeaking ? <><VolumeX className="h-4 w-4 animate-pulse" /> Stop</> : <><Volume2 className="h-4 w-4" /> Listen</>}
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-6">
          {/* Main Panel */}
          <div className="space-y-4">
            <AnimatePresence mode="wait">
              {currentQuestion && (
                <motion.div key={currentQuestion.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} className="space-y-4">
                  {/* Question Card */}
                  <div className="glass-card rounded-3xl p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-brand-cyan">
                        <Sparkles className="h-3.5 w-3.5" />
                        {currentQuestion.isFollowUp ? "Follow-up Question" : "Interviewer Question"}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="rounded-full bg-white/5 px-2.5 py-1 text-[10px] text-gray-400">{currentQuestion.difficulty}</span>
                        <span className="rounded-full bg-brand-cyan/10 px-2.5 py-1 text-[10px] text-brand-cyan">{currentQuestion.category}</span>
                        {currentQuestion.topic && <span className="rounded-full bg-brand-purple/10 px-2.5 py-1 text-[10px] text-brand-purple">{currentQuestion.topic}</span>}
                      </div>
                    </div>
                    {isSpeaking && (
                      <div className="flex items-center gap-0.5 h-4">
                        {[0,1,2,3,4].map((b) => (
                          <motion.span key={b} animate={{ height: ["4px","16px","6px","14px","4px"] }}
                            transition={{ repeat: Infinity, duration: 0.8, delay: b * 0.15 }}
                            className="w-1 rounded-full bg-brand-purple inline-block" />
                        ))}
                        <span className="ml-2 text-xs text-brand-purple">Speaking…</span>
                      </div>
                    )}
                    <p className="text-base font-semibold leading-7 text-white">{currentQuestion.questionText}</p>
                    {currentQuestion.intent && <p className="text-xs text-gray-500 italic">{currentQuestion.intent}</p>}
                  </div>

                  {/* Answer Area */}
                  {!currentEval ? (
                    <div className="glass-card rounded-3xl p-6 space-y-4">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-bold text-white flex items-center gap-2">
                          <MessageSquare className="h-4 w-4 text-brand-cyan" />
                          {mode === "Voice" ? "Your Spoken Answer" : "Your Answer"}
                        </label>
                        {mode === "Voice" && isRecording && (
                          <div className="flex items-center gap-2 text-xs text-red-400 animate-pulse">
                            <Radio className="h-3 w-3" />
                            <Clock className="h-3 w-3" />
                            {String(Math.floor(recordingSeconds / 60)).padStart(2,"0")}:{String(recordingSeconds % 60).padStart(2,"0")}
                          </div>
                        )}
                      </div>

                      {speechError && (
                        <div className="flex items-center gap-2 rounded-xl border border-brand-orange/30 bg-brand-orange/10 p-3 text-xs text-brand-orange">
                          <AlertTriangle className="h-4 w-4 shrink-0" /> {speechError}
                        </div>
                      )}

                      <textarea
                        value={answer}
                        onChange={(e) => setAnswer(e.target.value)}
                        disabled={isSubmitting}
                        placeholder={
                          mode === "Voice"
                            ? isRecording ? "Listening… speak clearly." : "Start recording or type your answer."
                            : "Type your answer here. Be specific — reference your actual projects and experience."
                        }
                        rows={6}
                        className={`w-full resize-none rounded-2xl border p-4 text-sm leading-6 outline-none transition-all placeholder:text-gray-600 ${
                          isRecording
                            ? "border-brand-cyan/50 bg-brand-cyan/5 text-white ring-1 ring-brand-cyan/20"
                            : "border-dark-border bg-dark-bg/60 text-gray-200 focus:border-brand-cyan/50"
                        } disabled:opacity-60`}
                      />

                      {isRecording && (
                        <div className="flex items-center justify-center gap-1 py-1">
                          {[0,1,2,3,4,5,6,7,8].map((b) => (
                            <motion.span key={b} animate={{ height: ["5px","20px","7px","16px","5px"] }}
                              transition={{ repeat: Infinity, duration: 0.65, delay: b * 0.07 }}
                              className="w-1 rounded-full bg-brand-cyan inline-block" />
                          ))}
                        </div>
                      )}

                      <div className="flex flex-col sm:flex-row gap-3">
                        {mode === "Voice" && (
                          <button
                            onClick={isRecording ? stopRecording : startRecording}
                            disabled={isSubmitting}
                            className={`h-12 px-5 rounded-xl border font-bold text-sm transition-all flex items-center justify-center gap-2 ${
                              isRecording
                                ? "border-red-500/40 bg-red-500/15 text-red-400 animate-pulse"
                                : "border-dark-border bg-dark-card text-white hover:border-brand-cyan/40"
                            } disabled:opacity-50`}>
                            {isRecording ? <><MicOff className="h-4 w-4" /> Stop</> : <><Mic className="h-4 w-4 text-brand-cyan" /> Record</>}
                          </button>
                        )}
                        <button
                          onClick={submitAnswer}
                          disabled={!answer.trim() || isSubmitting}
                          className="flex-1 h-12 rounded-xl bg-brand-cyan font-bold text-dark-bg text-sm transition-all hover:bg-brand-cyan/90 disabled:opacity-50 flex items-center justify-center gap-2 shadow-glow-cyan">
                          {isSubmitting ? <><Loader2 className="h-4 w-4 animate-spin" /> Evaluating…</> : <><Send className="h-4 w-4" /> Submit Answer</>}
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* Evaluation Result */
                    <div className="glass-card rounded-3xl p-6 space-y-5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-brand-cyan">AI Evaluation</span>
                        <ScoreBadge score={currentEval.score} />
                      </div>

                      <div className="rounded-xl bg-white/5 border border-white/5 p-4">
                        <p className="text-sm leading-6 text-gray-300">{currentEval.feedback}</p>
                      </div>

                      {currentEval.strengths?.length > 0 && (
                        <div>
                          <p className="text-[10px] font-bold uppercase text-brand-green mb-2">Strengths</p>
                          <ul className="space-y-1 text-xs text-gray-300">
                            {currentEval.strengths.map((s) => <li key={s} className="flex items-start gap-1.5"><span className="text-brand-green font-bold shrink-0">•</span>{s}</li>)}
                          </ul>
                        </div>
                      )}

                      {currentEval.weaknesses?.length > 0 && (
                        <div>
                          <p className="text-[10px] font-bold uppercase text-brand-orange mb-2">Improvements</p>
                          <ul className="space-y-1 text-xs text-gray-300">
                            {currentEval.weaknesses.map((w) => <li key={w} className="flex items-start gap-1.5"><span className="text-brand-orange font-bold shrink-0">•</span>{w}</li>)}
                          </ul>
                        </div>
                      )}

                      {currentEval.knowledgeGaps?.length > 0 && (
                        <div>
                          <p className="text-[10px] font-bold uppercase text-brand-purple mb-2">Knowledge Gaps</p>
                          <div className="flex flex-wrap gap-1.5">
                            {currentEval.knowledgeGaps.map((g) => <span key={g} className="rounded-full bg-brand-purple/10 px-2.5 py-1 text-[10px] text-brand-purple">{g}</span>)}
                          </div>
                        </div>
                      )}

                      <div className="flex gap-3">
                        {!isComplete ? (
                          <button onClick={goToNextQuestion}
                            className="flex-1 h-12 rounded-xl bg-brand-cyan font-bold text-dark-bg text-sm transition-all hover:bg-brand-cyan/90 flex items-center justify-center gap-2">
                            Next Question <ChevronRight className="h-4 w-4" />
                          </button>
                        ) : (
                          <button onClick={fetchReport} disabled={reportLoading}
                            className="flex-1 h-12 rounded-xl bg-gradient-to-r from-brand-purple to-brand-cyan font-bold text-white text-sm hover:opacity-90 flex items-center justify-center gap-2">
                            {reportLoading ? <><Loader2 className="h-4 w-4 animate-spin" /> Generating Report…</> : <><BarChart2 className="h-4 w-4" /> View Final Report</>}
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {interviewError && (
              <div className="flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">
                <AlertCircle className="h-4 w-4 shrink-0" /> {interviewError}
              </div>
            )}
          </div>

          {/* Right Sidebar: History */}
          <aside className="space-y-4">
            {mode === "Voice" && (
              <div className="glass-card rounded-2xl p-4 space-y-3">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2"><Sliders className="h-3.5 w-3.5 text-brand-cyan" /> Voice Settings</h3>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-400">Auto-Read Questions</span>
                  <button onClick={() => setAutoSpeak(!autoSpeak)}
                    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${autoSpeak ? "bg-brand-cyan" : "bg-dark-border"}`}>
                    <span className={`inline-block h-3 w-3 transform rounded-full bg-dark-bg transition-transform ${autoSpeak ? "translate-x-5" : "translate-x-1"}`} />
                  </button>
                </div>
              </div>
            )}

            <div className="glass-card rounded-2xl p-4 space-y-3">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">Answered</h3>
              <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
                {qaHistory.length === 0 ? (
                  <p className="text-xs text-gray-500">No answers yet.</p>
                ) : (
                  qaHistory.map((rec, i) => (
                    <div key={i} className="rounded-xl border border-white/5 bg-white/5 p-3 space-y-1">
                      <div className="flex items-start justify-between gap-2">
                        <CheckCircle2 className="h-3.5 w-3.5 shrink-0 mt-0.5 text-brand-green" />
                        <p className="flex-1 text-[10px] text-white leading-4 line-clamp-2">{rec.question.questionText}</p>
                      </div>
                      <div className="flex items-center justify-between text-[9px]">
                        <span className="text-gray-500">{rec.question.category} · {rec.question.topic}</span>
                        <ScoreBadge score={rec.evaluation.score} size="sm" />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </aside>
        </div>
      </div>
    );
  }

  // ─── STAGE: Report ────────────────────────────────────────────────────────
  if (stage === "report" && report) {
    return (
      <div className="min-h-[calc(100vh-8rem)] space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2"><Award className="h-6 w-6 text-brand-cyan" /> Interview Report</h1>
            <p className="text-sm text-gray-400">{interviewType} · {difficulty} · {qaHistory.length} Questions</p>
          </div>
          <button onClick={() => { setStage("upload"); setFile(null); setResumeId(null); setParsedResume(null); setQaHistory([]); setReport(null); setInterviewId(null); setQuestionsAnswered(0); setIsComplete(false); setCurrentQuestion(null); setCurrentEval(null); setAnswer(""); }}
            className="h-10 px-4 rounded-xl border border-dark-border bg-dark-card text-sm font-bold text-gray-300 hover:text-white flex items-center gap-2 transition-colors">
            <RotateCcw className="h-4 w-4" /> New Interview
          </button>
        </div>

        {/* Overall Score */}
        <div className="glass-card rounded-3xl p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-6">
            <div className="text-center">
              <p className="text-[10px] font-bold uppercase text-gray-500 mb-1">Overall Score</p>
              <ScoreBadge score={report.overallScore} size="lg" />
            </div>
            <div className="flex-1 space-y-2">
              <p className="text-sm font-bold text-white">Summary</p>
              <p className="text-sm leading-6 text-gray-300">{report.summary}</p>
            </div>
          </div>
          {/* Score rings */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 pt-4 border-t border-dark-border">
            <ProgressRing value={report.technicalScore} max={10} label="Technical" color="#06b6d4" />
            <ProgressRing value={report.communicationScore} max={10} label="Communication" color="#a855f7" />
            <ProgressRing value={report.problemSolvingScore} max={10} label="Problem Solving" color="#22c55e" />
            <ProgressRing value={report.resumeKnowledgeScore} max={10} label="Resume Knowledge" color="#f97316" />
            <ProgressRing value={report.confidenceScore} max={10} label="Confidence" color="#3b82f6" />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Strengths */}
          <div className="glass-card rounded-2xl p-5 space-y-3">
            <h2 className="text-sm font-bold text-white flex items-center gap-2"><TrendingUp className="h-4 w-4 text-brand-green" /> Strengths</h2>
            <ul className="space-y-2">
              {report.strengths.map((s) => (
                <li key={s} className="flex items-start gap-2 text-sm text-gray-300">
                  <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5 text-brand-green" /> {s}
                </li>
              ))}
            </ul>
          </div>

          {/* Weaknesses */}
          <div className="glass-card rounded-2xl p-5 space-y-3">
            <h2 className="text-sm font-bold text-white flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-brand-orange" /> Areas to Improve</h2>
            <ul className="space-y-2">
              {report.weaknesses.map((w) => (
                <li key={w} className="flex items-start gap-2 text-sm text-gray-300">
                  <X className="h-4 w-4 shrink-0 mt-0.5 text-brand-orange" /> {w}
                </li>
              ))}
            </ul>
          </div>

          {/* Knowledge Gaps */}
          <div className="glass-card rounded-2xl p-5 space-y-3">
            <h2 className="text-sm font-bold text-white flex items-center gap-2"><BookOpen className="h-4 w-4 text-brand-purple" /> Knowledge Gaps</h2>
            <div className="flex flex-wrap gap-2">
              {report.knowledgeGaps.map((g) => (
                <span key={g} className="rounded-full bg-brand-purple/10 border border-brand-purple/20 px-3 py-1 text-xs text-brand-purple">{g}</span>
              ))}
            </div>
          </div>

          {/* Preparation Topics */}
          <div className="glass-card rounded-2xl p-5 space-y-3">
            <h2 className="text-sm font-bold text-white flex items-center gap-2"><Target className="h-4 w-4 text-brand-cyan" /> Study Topics</h2>
            <div className="space-y-2">
              {report.preparationTopics.map((t, i) => (
                <div key={t} className="flex items-center gap-3 text-sm text-gray-300">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-cyan/10 text-[10px] font-bold text-brand-cyan">{i + 1}</span> {t}
                </div>
              ))}
            </div>
          </div>

          {/* Resume Performance */}
          <div className="glass-card rounded-2xl p-5 space-y-3">
            <h2 className="text-sm font-bold text-white flex items-center gap-2"><FileText className="h-4 w-4 text-brand-teal" /> Resume Performance</h2>
            <ul className="space-y-1.5">
              {report.resumePerformance.map((r) => (
                <li key={r} className="text-xs text-gray-300 flex items-start gap-1.5"><span className="text-brand-teal shrink-0">▸</span>{r}</li>
              ))}
            </ul>
          </div>

          {/* Improvement Suggestions */}
          <div className="glass-card rounded-2xl p-5 space-y-3">
            <h2 className="text-sm font-bold text-white flex items-center gap-2"><Sparkles className="h-4 w-4 text-brand-orange" /> Action Plan</h2>
            <ul className="space-y-2">
              {report.improvementSuggestions.map((s, i) => (
                <li key={s} className="flex items-start gap-2 text-sm text-gray-300">
                  <span className="text-brand-orange font-bold shrink-0">{i + 1}.</span> {s}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Q&A History */}
        <div className="glass-card rounded-2xl p-5 space-y-4">
          <h2 className="text-sm font-bold text-white">Full Q&amp;A History</h2>
          <div className="space-y-4">
            {qaHistory.map((rec, i) => (
              <div key={i} className="rounded-2xl border border-dark-border bg-dark-bg/60 p-4 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <p className="text-sm font-semibold text-white leading-5">{i + 1}. {rec.question.questionText}</p>
                  <ScoreBadge score={rec.evaluation.score} size="sm" />
                </div>
                <p className="text-xs text-gray-400 leading-5">{rec.answer.slice(0, 300)}{rec.answer.length > 300 ? "…" : ""}</p>
                <p className="text-xs text-gray-500 italic">{rec.evaluation.feedback}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Loading state
  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4 text-gray-400">
        <Loader2 className="h-10 w-10 animate-spin text-brand-cyan" />
        <p className="text-sm">Loading…</p>
      </div>
    </div>
  );
}
