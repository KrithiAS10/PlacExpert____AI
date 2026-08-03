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
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  mockInterviewDomains,
  type MockInterviewDomain,
  type MockInterviewDomainId,
  type MockInterviewQuestion,
} from "@/lib/mock-interview-data";

// ─── Domain Styles ────────────────────────────────────────────────────────────
const domainStyles = {
  dsa: { icon: Brain, color: "text-brand-purple", bg: "bg-brand-purple/10" },
  dbms: { icon: Database, color: "text-brand-blue", bg: "bg-brand-blue/10" },
  os: { icon: Monitor, color: "text-brand-orange", bg: "bg-brand-orange/10" },
  cn: { icon: Globe, color: "text-brand-teal", bg: "bg-brand-teal/10" },
  web: { icon: Code, color: "text-brand-cyan", bg: "bg-brand-cyan/10" },
};
const fallbackDomainStyle = { icon: Brain, color: "text-brand-purple", bg: "bg-brand-purple/10" };

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

// ─── Evaluation Types ─────────────────────────────────────────────────────────
type MLEvaluation = {
  source: "ml";
  score: number;
  overallLabel: string;
  summary: string;
  strengths: string[];
  improvements: string[];
  missingConcepts: string[];
  mentionedConcepts: string[];
  suggestions: string[];
  similarityScore: number;
  conceptCoverage: number;
  voiceStats?: { wordCount: number; wpm: number; fillerCount: number; durationSeconds: number };
};

type HeuristicEvaluation = {
  source: "heuristic";
  score: number;
  overallLabel: string;
  summary: string;
  strengths: string[];
  improvements: string[];
  optionalCues: string[];
  voiceStats?: { wordCount: number; wpm: number; fillerCount: number; durationSeconds: number };
  rubric: {
    relevance: number;
    depth: number;
    specificity: number;
    structure: number;
    professionalism: number;
    referenceAlignment: number;
  };
};

type Evaluation = MLEvaluation | HeuristicEvaluation;

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

// ─── Gibberish / Quality Validator ────────────────────────────────────────────
function checkQuality(text: string): { isInvalid: boolean; reason: string } {
  const trimmed = text.trim();
  if (trimmed.length < 8)
    return { isInvalid: true, reason: "Answer is too short. Please write a complete technical response." };

  const words = trimmed.split(/\s+/).filter(Boolean);
  if (words.length < 4)
    return { isInvalid: true, reason: "Please provide at least a few complete sentences." };

  // Repeated word spam
  const uniqueWords = new Set(words.map((w) => w.toLowerCase()));
  if (words.length >= 5 && uniqueWords.size / words.length < 0.25)
    return { isInvalid: true, reason: "Excessive word repetition detected. Please write a meaningful response." };

  // Keyboard spam patterns
  const spamRegex = /\b(asdf|fdsa|qwerty|zxcv|ghjkl|hjkl|aaaa|bbbb|cccc|dddd|eeee|ffff|gggg|hhhh|iiii|jjjj|kkkk|llll)\b/i;
  let spamCount = 0;
  for (const word of words) {
    if (spamRegex.test(word) || /(.)\1{3,}/.test(word)) spamCount++;
  }
  if (spamCount / words.length > 0.2)
    return { isInvalid: true, reason: "Random character sequences / keyboard spam detected. Type a real answer." };

  // Vowel ratio check (gibberish words have no vowels)
  let gibberishCount = 0;
  for (const word of words) {
    const clean = word.toLowerCase().replace(/[^a-z]/g, "");
    if (clean.length > 4) {
      const vowels = clean.match(/[aeiouy]/g)?.length ?? 0;
      if (vowels / clean.length < 0.12) gibberishCount++;
    }
  }
  if (gibberishCount / words.length > 0.3)
    return { isInvalid: true, reason: "Unrecognizable non-English or random text detected. Please write in English." };

  return { isInvalid: false, reason: "" };
}

// ─── Heuristic Fallback Evaluator ────────────────────────────────────────────
function normalizeText(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9+#.\s]/g, " ");
}
const GENERIC_WORDS = new Set([
  "about","after","also","because","been","being","between","could","during","from","have",
  "into","more","need","should","that","their","them","then","there","these","this",
  "through","when","where","which","with","work","would","your",
]);
const FILLER_REGEX = /\b(um+|uh+|like|actually|basically|literally|you know|sort of|kinda|i mean|right)\b/gi;

function getMeaningfulWords(text: string) {
  return normalizeText(text)
    .split(/\s+/)
    .filter((w) => w.length > 3 && !GENERIC_WORDS.has(w));
}
function countCueMatches(answerWords: Set<string>, cues: string[]) {
  return cues.filter((cue) => {
    const cueWords = getMeaningfulWords(cue);
    return cueWords.some(
      (w) => answerWords.has(w) || Array.from(answerWords).some((a) => a.startsWith(w))
    );
  }).length;
}
function getExpectedCues(question: MockInterviewQuestion) {
  const qText = normalizeText(question.question);
  const EXPECTATIONS = [
    { patterns: ["tell me about yourself"], cues: ["background","experience","skills","project","goal","role"] },
    { patterns: ["why do you want","work here"], cues: ["company","role","values","mission","growth","culture"] },
    { patterns: ["why should we hire"], cues: ["skills","experience","impact","team","contribute"] },
    { patterns: ["strength","weakness"], cues: ["strength","weakness","improve","learning","feedback"] },
    { patterns: ["achievement"], cues: ["achieved","led","improved","result","impact","measured"] },
    { patterns: ["challenging","challenge"], cues: ["situation","action","result","resolved","learned"] },
    { patterns: ["five years","5 years"], cues: ["grow","learn","skills","role","goals"] },
    { patterns: ["stress","pressure"], cues: ["prioritize","calm","deadline","focused","organized"] },
    { patterns: ["ideal work environment"], cues: ["collaborative","feedback","learning","ownership"] },
  ];
  const patternCues = EXPECTATIONS.find((e) => e.patterns.some((p) => qText.includes(p)))?.cues ?? [];
  const questionWords = getMeaningfulWords(question.question).filter((w) => w.length > 4);
  return Array.from(new Set([...patternCues, ...questionWords, ...question.keyConcepts.slice(0, 6)]));
}
function toPercent(score: number, max: number) {
  return Math.round((score / max) * 100);
}

function buildHeuristicEval(
  question: MockInterviewQuestion,
  answer: string,
  mode: "text" | "voice",
  durationSeconds = 0
): HeuristicEvaluation {
  const words = answer.trim().split(/\s+/).filter(Boolean);
  const wordCount = words.length;
  const answerWords = new Set(getMeaningfulWords(answer));
  const expectedCues = getExpectedCues(question);
  const refMatches = countCueMatches(answerWords, question.keyConcepts);
  const expMatches = countCueMatches(answerWords, expectedCues);
  const fillerMatches = answer.match(FILLER_REGEX) ?? [];
  const fillerCount = fillerMatches.length;

  const durationMin = durationSeconds > 0 ? durationSeconds / 60 : Math.max(0.5, wordCount / 120);
  const wpm = Math.round(wordCount / durationMin);

  const hasExample = /\b(example|project|internship|experience|situation|led|built|created|resolved|achieved)\b/i.test(answer);
  const hasOutcome = /\b(result|impact|outcome|learned|improved|increased|reduced|delivered)\b/i.test(answer);
  const hasStructure = /\b(first|second|finally|overall|for example|situation|task|action|result)\b/i.test(answer);
  const hasTone = !/\b(idk|dunno|whatever|kinda|lol)\b/i.test(answer);

  // Penalise completely off-topic (0 cue matches)
  const relevance = expMatches === 0 && refMatches === 0
    ? 0.2
    : Math.min(3, 1 + Math.min(2, expMatches * 0.45));
  const depth = Math.min(2, wordCount >= 80 ? 2 : wordCount >= 45 ? 1.5 : wordCount >= 25 ? 1 : 0.5);
  const specificity = Math.min(2, (hasExample ? 1 : 0) + (hasOutcome ? 0.75 : 0) + (/\d|%/.test(answer) ? 0.25 : 0));
  const structure = Math.min(1.5, (hasStructure ? 0.9 : 0.4) + (wordCount >= 35 ? 0.4 : 0) + (/[.!?]/.test(answer) ? 0.2 : 0));
  const professionalism = hasTone ? Math.max(0.4, 1 - (fillerCount / Math.max(wordCount, 1)) * 3) : 0.4;
  const referenceAlignment = Math.min(0.5, refMatches * 0.12);

  const rawScore = relevance + depth + specificity + structure + professionalism + referenceAlignment;
  const score = Math.min(10, Math.round(rawScore * 10) / 10);

  const overallLabel = score >= 8 ? "Strong" : score >= 6 ? "Good" : score >= 4 ? "Developing" : "Needs Work";
  const summary =
    score >= 8 ? "Strong answer — clear, specific, and well-structured."
    : score >= 6 ? "Good base. Adding a concrete example or outcome would strengthen it."
    : score >= 4 ? "Some relevant content but needs more depth, structure, and evidence."
    : "Too thin for an interview. Rebuild with context → action → result.";

  const strengths = [
    relevance >= 2.2 ? "Directly addresses the question." : "",
    depth >= 1.5 ? "Good level of detail." : "",
    specificity >= 1 ? "Includes concrete examples or outcomes." : "",
    structure >= 1 ? "Logically structured response." : "",
    professionalism >= 0.8 ? "Professional, interview-appropriate tone." : "",
  ].filter(Boolean);

  const improvements = [
    relevance < 2.2 ? "Make your opening line directly address the question." : "",
    depth < 1.5 ? "Add more context and technical depth." : "",
    specificity < 1 ? "Include a real project, tech stack, or measured result." : "",
    structure < 1 ? "Structure as: definition → mechanism → example." : "",
    fillerCount > 2 ? `Cut filler words ("${fillerMatches.slice(0,2).join('", "')}") — pause instead.` : "",
  ].filter(Boolean);

  const optionalCues = expectedCues
    .filter((cue) => countCueMatches(answerWords, [cue]) === 0)
    .slice(0, 6);

  return {
    source: "heuristic",
    score,
    overallLabel,
    summary,
    strengths: strengths.length ? strengths : ["Attempted the question — build on this."],
    improvements: improvements.length ? improvements : ["Polish clarity and add a concrete technical example."],
    optionalCues,
    voiceStats: mode === "voice" ? { wordCount, wpm, fillerCount, durationSeconds } : undefined,
    rubric: { relevance, depth, specificity, structure, professionalism, referenceAlignment },
  };
}

// ─── ML Evaluation via API ────────────────────────────────────────────────────
async function fetchMLEvaluation(
  domain: string,
  question: string,
  answer: string,
  mode: "text" | "voice",
  durationSeconds = 0
): Promise<Evaluation> {
  const wordCount = answer.trim().split(/\s+/).filter(Boolean).length;
  const fillerMatches = answer.match(FILLER_REGEX) ?? [];
  const fillerCount = fillerMatches.length;
  const durationMin = durationSeconds > 0 ? durationSeconds / 60 : Math.max(0.5, wordCount / 120);
  const wpm = Math.round(wordCount / durationMin);

  try {
    const res = await fetch("/api/mock-interview/evaluate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ domain, question, answer }),
    });

    const data = await res.json();

    // If ML returned an error, fall through to heuristic
    if (data.error === "ml_unavailable" || data.interview_score === null) {
      throw new Error("ml_unavailable");
    }

    const score = Math.min(10, Math.max(0, Math.round(Number(data.interview_score) * 10) / 10));
    const similarity = Number(data.similarity_score ?? 0);
    const coverage = Number(data.concept_coverage ?? 0);

    const overallLabel =
      score >= 8.5 ? "Excellent" : score >= 7 ? "Strong" : score >= 5 ? "Good" : score >= 3 ? "Developing" : "Needs Work";

    const summary =
      score >= 8.5 ? "Outstanding answer with high semantic alignment to the expected response."
      : score >= 7 ? "Strong answer — clearly explained with good concept coverage."
      : score >= 5 ? "Decent understanding shown. Improve with more depth and missing concepts."
      : score >= 3 ? "Partial answer. Several key concepts are missing or unclear."
      : "Answer does not meaningfully address the question. Review the topic and try again.";

    const mlImprovements = [];
    if (data.missing_concepts?.length) {
      mlImprovements.push(`Cover these missing concepts: ${data.missing_concepts.slice(0, 4).join(", ")}.`);
    }
    if (similarity < 0.5) {
      mlImprovements.push("Your answer has low semantic similarity to the expected response — revisit the topic.");
    }
    if (coverage < 40) {
      mlImprovements.push("Less than 40% of key concepts were mentioned. Study the core definitions.");
    }

    const mlStrengths: string[] = [...(data.strengths ?? [])];
    if (data.mentioned_concepts?.length) {
      mlStrengths.push(`Correctly mentioned: ${data.mentioned_concepts.slice(0, 4).join(", ")}.`);
    }

    return {
      source: "ml",
      score,
      overallLabel,
      summary,
      strengths: mlStrengths.length ? mlStrengths : ["You attempted the question."],
      improvements: mlImprovements.length ? mlImprovements : ["Polish your answer and add concrete examples."],
      missingConcepts: data.missing_concepts ?? [],
      mentionedConcepts: data.mentioned_concepts ?? [],
      suggestions: data.suggestions ?? [],
      similarityScore: similarity,
      conceptCoverage: coverage,
      voiceStats: mode === "voice" ? { wordCount, wpm, fillerCount, durationSeconds } : undefined,
    };
  } catch {
    // Python model unavailable — fall back to heuristic silently
    return buildHeuristicEval(
      { id: "", question, idealAnswer: "", keyConcepts: [] },
      answer,
      mode,
      durationSeconds
    );
  }
}

// ─── Page Component ───────────────────────────────────────────────────────────
export default function MockInterviewPage() {
  const [interviewMode, setInterviewMode] = useState<"text" | "voice">("text");
  const [domains, setDomains] = useState<MockInterviewDomain[]>(mockInterviewDomains);
  const [selectedDomainId, setSelectedDomainId] = useState<MockInterviewDomainId>("dsa");
  const [sessions, setSessions] = useState<Record<string, DomainSession>>({});
  const [datasetSource, setDatasetSource] = useState("Built-in sample questions");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Voice states
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [autoSpeak, setAutoSpeak] = useState(true);
  const [speechPace, setSpeechPace] = useState(1.0);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [transcript, setTranscript] = useState("");
  const [speechError, setSpeechError] = useState<string | null>(null);

  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const speechSupported = useMemo(() => Boolean(getSpeechRecognition()), []);

  // ─── Speech & Recording Controls ──────────────────────────────────────────
  const stopSpeaking = useCallback(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, []);

  const stopRecording = useCallback(() => {
    try { recognitionRef.current?.stop(); } catch {}
    setIsRecording(false);
    if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
  }, []);

  // ─── Dataset loader ──────────────────────────────────────────────────────
  const loadCsvDataset = useCallback(async () => {
    stopRecording();
    stopSpeaking();
    setTranscript("");
    setRecordingSeconds(0);
    setValidationError(null);
    setSpeechError(null);
    setIsRefreshing(true);
    try {
      const response = await fetch(`/api/mock-interview/questions?refresh=${Date.now()}`, { cache: "no-store" });
      if (!response.ok) return;
      const data = (await response.json()) as { source?: string; domains?: MockInterviewDomain[] };
      const csvDomains = data.domains?.filter((d) => d.questions.length > 0) ?? [];
      if (!csvDomains.length) return;
      setDomains(csvDomains);
      setSelectedDomainId((cur) => (csvDomains.some((d) => d.id === cur) ? cur : csvDomains[0].id));
      setDatasetSource(data.source ? "CSV QA Dataset" : "CSV dataset");
      setSessions((cur) => {
        const next: Record<string, DomainSession> = {};
        csvDomains.forEach((domain) => {
          const existing = cur[domain.id] ?? createEmptySession();
          next[domain.id] = { ...existing, questionIndex: Math.min(existing.questionIndex, domain.questions.length - 1) };
        });
        return next;
      });
    } catch (e) {
      console.error("Failed to fetch dataset:", e);
    } finally {
      setIsRefreshing(false);
    }
  }, [stopRecording, stopSpeaking]);

  useEffect(() => {
    const id = window.setTimeout(() => loadCsvDataset(), 0);
    return () => window.clearTimeout(id);
  }, [loadCsvDataset]);

  // ─── Derived state ────────────────────────────────────────────────────────
  const selectedDomain = useMemo(
    () => domains.find((d) => d.id === selectedDomainId) ?? domains[0],
    [domains, selectedDomainId]
  );
  const selectedSession = sessions[selectedDomainId] ?? createEmptySession();
  const questionIndex = Math.min(selectedSession.questionIndex, selectedDomain.questions.length - 1);
  const currentQuestion = selectedDomain.questions[questionIndex];
  const records = selectedSession.records;
  const currentEvaluation = selectedSession.currentEvaluation;
  const answer = transcript || selectedSession.answer;
  const wordCount = answer.trim().split(/\s+/).filter(Boolean).length;
  const fillerCount = (answer.match(FILLER_REGEX) ?? []).length;
  const wpm = recordingSeconds > 0 ? Math.round(wordCount / (recordingSeconds / 60)) : 0;
  const averageScore = records.length
    ? (records.reduce((s, r) => s + r.evaluation.score, 0) / records.length).toFixed(1)
    : "0.0";
  const progress = Math.round((records.length / selectedDomain.questions.length) * 100);
  const remainingQuestions = selectedDomain.questions.length - records.length;
  const latestScore = records.at(-1)?.evaluation.score.toFixed(1) ?? "0.0";
  const isLastQuestion = questionIndex === selectedDomain.questions.length - 1;
  const hasAnsweredCurrent = Boolean(currentEvaluation);
  const sessionComplete = hasAnsweredCurrent && isLastQuestion;

  // ─── Session helpers ──────────────────────────────────────────────────────
  const updateSelectedSession = useCallback(
    (updater: (s: DomainSession) => DomainSession) => {
      setSessions((cur) => ({
        ...cur,
        [selectedDomainId]: updater(cur[selectedDomainId] ?? createEmptySession()),
      }));
    },
    [selectedDomainId]
  );

  const setAnswerText = (text: string) => {
    setTranscript(text);
    updateSelectedSession((s) => ({ ...s, answer: text }));
    setValidationError(null);
  };

  const selectDomain = (domainId: MockInterviewDomainId) => {
    stopRecording(); stopSpeaking();
    setSelectedDomainId(domainId);
    setTranscript(""); setRecordingSeconds(0); setValidationError(null); setSpeechError(null);
    setSessions((cur) => ({ ...cur, [domainId]: cur[domainId] ?? createEmptySession() }));
  };

  const nextQuestion = () => {
    stopRecording(); stopSpeaking();
    setTranscript(""); setRecordingSeconds(0); setValidationError(null); setSpeechError(null);
    const nextIndex = Math.min(questionIndex + 1, selectedDomain.questions.length - 1);
    updateSelectedSession((s) => ({ ...s, questionIndex: nextIndex, answer: "", currentEvaluation: null }));
  };

  const restartSession = useCallback(() => {
    stopRecording(); stopSpeaking();
    setTranscript(""); setRecordingSeconds(0); setValidationError(null); setSpeechError(null);
    updateSelectedSession(() => createEmptySession());
  }, [stopRecording, stopSpeaking, updateSelectedSession]);

  // ─── Submit ───────────────────────────────────────────────────────────────
  const submitAnswer = async () => {
    const text = answer.trim();
    if (!text || !currentQuestion) return;

    // Step 1: Client-side quality gate
    const validation = checkQuality(text);
    if (validation.isInvalid) {
      setValidationError(validation.reason);
      return;
    }
    setValidationError(null);
    setIsEvaluating(true);
    stopRecording(); stopSpeaking();

    try {
      // Step 2: ML evaluation via Python (with heuristic fallback)
      const evaluation = await fetchMLEvaluation(
        selectedDomain.name,
        currentQuestion.question,
        text,
        interviewMode,
        recordingSeconds
      );

      updateSelectedSession((s) => ({
        ...s,
        answer: text,
        currentEvaluation: evaluation,
        records: [...s.records, { question: currentQuestion, answer: text, evaluation }],
      }));
    } finally {
      setIsEvaluating(false);
    }
  };

  // ─── TTS ──────────────────────────────────────────────────────────────────
  const speakQuestion = useCallback(
    (text?: string) => {
      if (interviewMode !== "voice" || typeof window === "undefined" || !("speechSynthesis" in window)) return;
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text ?? currentQuestion?.question ?? "");
      utterance.rate = speechPace;
      utterance.lang = "en-US";
      const voices = window.speechSynthesis.getVoices();
      const preferred = voices.find((v) => v.lang.startsWith("en") && (v.name.includes("Google") || v.name.includes("Natural"))) ?? voices.find((v) => v.lang.startsWith("en"));
      if (preferred) utterance.voice = preferred;
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    },
    [currentQuestion?.question, speechPace, interviewMode]
  );

  useEffect(() => {
    if (interviewMode === "voice" && autoSpeak && currentQuestion) {
      const t = setTimeout(() => speakQuestion(currentQuestion.question), 450);
      return () => { clearTimeout(t); stopSpeaking(); };
    }
  }, [currentQuestion?.id, autoSpeak, speakQuestion, stopSpeaking, interviewMode]);

  useEffect(() => {
    return () => {
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
      stopSpeaking();
      try { recognitionRef.current?.stop(); } catch {}
    };
  }, [stopSpeaking]);

  // ─── Microphone ───────────────────────────────────────────────────────────
  const startRecording = () => {
    setSpeechError(null); stopSpeaking();
    const Recognition = getSpeechRecognition();
    if (!Recognition) {
      setSpeechError("Speech recognition not supported in this browser. Type your answer instead.");
      return;
    }
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
        if (updated) setAnswerText(updated);
      };
      rec.onerror = (e) => {
        if (e.error === "not-allowed") setSpeechError("Microphone access denied. Check browser permissions.");
      };
      rec.onend = () => { setIsRecording(false); if (recordingTimerRef.current) clearInterval(recordingTimerRef.current); };
      rec.start();
      recognitionRef.current = rec;
      setIsRecording(true); setRecordingSeconds(0);
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = setInterval(() => setRecordingSeconds((p) => p + 1), 1000);
    } catch (err) {
      setSpeechError("Could not start microphone. Try again or type below.");
      console.error(err);
    }
  };

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="min-h-[calc(100vh-8rem)] space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-white">Mock Interview</h1>
            <span className={`flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${
              interviewMode === "voice"
                ? "bg-brand-cyan/10 border-brand-cyan/20 text-brand-cyan"
                : "bg-brand-purple/10 border-brand-purple/20 text-brand-purple"
            }`}>
              {interviewMode === "voice"
                ? <><Radio className="h-3 w-3 animate-pulse" /> Voice</>
                : <><Keyboard className="h-3 w-3" /> Text</>}
            </span>
          </div>
          <p className="text-sm text-gray-400">
            AI-evaluated interview practice — powered by Sentence Transformers with gibberish detection.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Mode Toggle */}
          <div className="flex bg-dark-card rounded-lg border border-dark-border p-1 gap-0.5">
            <button
              onClick={() => { setInterviewMode("text"); stopRecording(); stopSpeaking(); setValidationError(null); }}
              className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all flex items-center gap-1.5 ${
                interviewMode === "text" ? "bg-white/10 text-white" : "text-gray-400 hover:text-gray-200"
              }`}
            >
              <Keyboard className="h-3.5 w-3.5" />
              Text
            </button>
            <button
              onClick={() => { setInterviewMode("voice"); setValidationError(null); }}
              className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all flex items-center gap-1.5 ${
                interviewMode === "voice" ? "bg-brand-cyan/20 text-brand-cyan" : "text-gray-400 hover:text-gray-200"
              }`}
            >
              <Mic className="h-3.5 w-3.5" />
              Voice
            </button>
          </div>
          <button
            onClick={restartSession}
            title="Restart current interview session"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-dark-border bg-dark-card px-3 text-sm font-medium text-gray-300 transition-colors hover:text-white hover:border-brand-purple/40"
          >
            <RotateCcw className="h-4 w-4 text-brand-purple" />
            Restart
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[280px_minmax(0,1fr)_320px]">
        {/* ─── Left Sidebar ─── */}
        <aside className="space-y-6">
          <section className="glass-card space-y-4 rounded-2xl p-5">
            <h2 className="text-sm font-bold text-white flex items-center justify-between">
              <span>Domain</span>
              <span className="text-[10px] text-gray-500 uppercase tracking-wider">CSV Dataset</span>
            </h2>
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
                      isSelected ? "border-brand-cyan/50 bg-white/5 ring-1 ring-brand-cyan/20" : "border-dark-border hover:border-white/10"
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

          {/* Voice Settings (only in voice mode) */}
          {interviewMode === "voice" && (
            <section className="glass-card rounded-2xl p-5 space-y-4">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Sliders className="h-4 w-4 text-brand-cyan" />
                Voice Settings
              </h2>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-300">Auto-Read Question</span>
                <button
                  onClick={() => setAutoSpeak(!autoSpeak)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${autoSpeak ? "bg-brand-cyan" : "bg-dark-border"}`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-dark-bg transition-transform ${autoSpeak ? "translate-x-6" : "translate-x-1"}`} />
                </button>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-gray-300">
                  <span>Voice Speed</span>
                  <span className="font-mono text-brand-cyan">{speechPace.toFixed(1)}x</span>
                </div>
                <input type="range" min="0.8" max="1.3" step="0.1" value={speechPace}
                  onChange={(e) => setSpeechPace(parseFloat(e.target.value))}
                  className="w-full accent-brand-cyan cursor-pointer" />
              </div>
            </section>
          )}

          {/* Session Stats */}
          <section className="glass-card rounded-2xl p-5">
            <h2 className="mb-4 text-sm font-bold text-white">Session Stats</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs text-gray-500">Dataset</span>
                <span className="truncate text-right text-xs text-gray-300">{datasetSource}</span>
              </div>
              {[
                ["Attended", `${records.length} / ${selectedDomain.questions.length}`],
                ["Remaining", String(remainingQuestions)],
                ["Latest Score", `${latestScore}/10`],
              ].map(([label, value]) => (
                <div key={label} className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">{label}</span>
                  <span className="font-mono text-xs text-white">{value}</span>
                </div>
              ))}
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
                  <div className="h-full bg-brand-cyan shadow-glow-cyan transition-all" style={{ width: `${progress}%` }} />
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

        {/* ─── Main Panel ─── */}
        <main className="glass-card flex min-h-[640px] flex-col overflow-hidden rounded-3xl border-dark-border/50">
          {/* Top bar */}
          <div className="border-b border-dark-border bg-white/5 p-5">
            <div className="flex items-center justify-between gap-4">
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
              {interviewMode === "voice" && (
                <button
                  onClick={isSpeaking ? stopSpeaking : () => speakQuestion()}
                  className={`inline-flex h-10 items-center gap-2 rounded-lg border px-3 text-xs font-bold transition-all ${
                    isSpeaking
                      ? "border-brand-purple/50 bg-brand-purple/20 text-brand-purple"
                      : "border-dark-border bg-dark-card text-gray-200 hover:text-white"
                  }`}
                >
                  {isSpeaking ? (
                    <><VolumeX className="h-4 w-4 animate-pulse" /> Stop AI Voice</>
                  ) : (
                    <><Volume2 className="h-4 w-4 text-brand-cyan" /> Listen</>
                  )}
                </button>
              )}
            </div>
          </div>

          <div className="flex-1 space-y-6 overflow-y-auto p-6">
            <AnimatePresence mode="wait">
              <motion.section
                key={currentQuestion.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-5"
              >
                {/* Question Card */}
                <div className="relative overflow-hidden rounded-2xl border border-dark-border bg-dark-card p-5">
                  {isSpeaking && <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-brand-purple via-brand-cyan to-brand-purple animate-pulse" />}
                  <div className="mb-3 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-brand-cyan">
                      <Sparkles className="h-3.5 w-3.5" />
                      Interviewer Question
                    </div>
                    {isSpeaking && (
                      <div className="flex items-center gap-0.5">
                        {[0,1,2,3,4].map((bar) => (
                          <motion.span key={bar}
                            animate={{ height: ["4px","16px","6px","14px","4px"] }}
                            transition={{ repeat: Infinity, duration: 0.8, delay: bar * 0.15 }}
                            className="w-1 rounded-full bg-brand-purple inline-block"
                          />
                        ))}
                      </div>
                    )}
                  </div>
                  <p className="text-base font-semibold leading-7 text-white">{currentQuestion.question}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {currentQuestion.difficulty && (
                      <span className="rounded-full bg-white/5 px-2.5 py-1 text-[11px] text-gray-300">{currentQuestion.difficulty}</span>
                    )}
                    {currentQuestion.intent && (
                      <span className="rounded-full bg-brand-cyan/10 px-2.5 py-1 text-[11px] text-brand-cyan">{currentQuestion.intent}</span>
                    )}
                  </div>
                </div>

                {/* Validation Error */}
                {validationError && (
                  <div className="flex items-start gap-2.5 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-400">
                    <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                    <span>{validationError}</span>
                  </div>
                )}

                {/* Speech Error */}
                {speechError && interviewMode === "voice" && (
                  <div className="flex items-center gap-2 rounded-xl border border-brand-orange/30 bg-brand-orange/10 p-3 text-xs text-brand-orange">
                    <AlertTriangle className="h-4 w-4 shrink-0" />
                    <span>{speechError}</span>
                  </div>
                )}

                {/* Answer Input */}
                <div className="rounded-2xl border border-dark-border bg-dark-bg/60 p-5 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <label className="text-sm font-bold text-white flex items-center gap-2">
                      <MessageSquare className="h-4 w-4 text-brand-cyan" />
                      {interviewMode === "voice" ? "Your Spoken Transcript" : "Your Answer"}
                    </label>
                    {/* Live metrics in voice mode */}
                    {interviewMode === "voice" && (
                      <div className="flex items-center gap-3 text-xs text-gray-400">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5 text-gray-500" />
                          <span className="font-mono text-gray-200">
                            {String(Math.floor(recordingSeconds / 60)).padStart(2, "0")}:{String(recordingSeconds % 60).padStart(2, "0")}
                          </span>
                        </div>
                        <span className="text-gray-500">Words: <span className="font-mono text-white">{wordCount}</span></span>
                        {wpm > 0 && <span className="text-gray-500">Pace: <span className="font-mono text-brand-cyan">{wpm} WPM</span></span>}
                        {fillerCount > 0 && <span className="text-gray-500">Fillers: <span className="font-mono text-brand-orange">{fillerCount}</span></span>}
                      </div>
                    )}
                  </div>

                  <textarea
                    id="mock-answer"
                    value={answer}
                    onChange={(e) => setAnswerText(e.target.value)}
                    disabled={hasAnsweredCurrent || isEvaluating}
                    placeholder={
                      interviewMode === "voice"
                        ? isRecording
                          ? "Listening… speak clearly into your microphone."
                          : "Click 'Start Recording' or type your answer here."
                        : "Type a structured answer: definition → key concepts → tradeoffs → real example."
                    }
                    className={`min-h-52 w-full resize-none rounded-xl border p-4 text-sm leading-6 outline-none transition-all placeholder:text-gray-600 ${
                      isRecording
                        ? "border-brand-cyan/50 bg-brand-cyan/5 text-white ring-1 ring-brand-cyan/20"
                        : "border-dark-border bg-dark-card text-gray-200 focus:border-brand-cyan/50"
                    } disabled:cursor-not-allowed disabled:opacity-70`}
                  />

                  {/* Recording visualizer */}
                  {isRecording && (
                    <div className="flex items-center justify-center gap-1.5 py-1">
                      <span className="text-xs font-medium text-brand-cyan animate-pulse mr-2">Recording…</span>
                      {[0,1,2,3,4,5,6,7,8,9].map((bar) => (
                        <motion.span key={bar}
                          animate={{ height: ["5px","22px","7px","18px","5px"] }}
                          transition={{ repeat: Infinity, duration: 0.65, delay: bar * 0.07 }}
                          className="w-1 rounded-full bg-brand-cyan inline-block"
                        />
                      ))}
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    {interviewMode === "voice" && (
                      <button
                        onClick={isRecording ? stopRecording : startRecording}
                        disabled={hasAnsweredCurrent || isEvaluating}
                        className={`inline-flex h-12 items-center justify-center gap-2.5 rounded-xl border font-bold text-sm px-5 transition-all ${
                          isRecording
                            ? "border-red-500/40 bg-red-500/15 text-red-400 animate-pulse"
                            : "border-dark-border bg-dark-card text-white hover:border-brand-cyan/40"
                        } disabled:cursor-not-allowed disabled:opacity-50`}
                      >
                        {isRecording ? <><MicOff className="h-4 w-4 text-red-400" /> Stop</> : <><Mic className="h-4 w-4 text-brand-cyan" /> Start Recording</>}
                      </button>
                    )}

                    <button
                      onClick={submitAnswer}
                      disabled={!answer.trim() || hasAnsweredCurrent || isEvaluating}
                      className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-brand-cyan px-5 text-sm font-bold text-dark-bg shadow-glow-cyan transition-all hover:bg-brand-cyan/90 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {isEvaluating ? (
                        <><Loader2 className="h-4 w-4 animate-spin" /> Evaluating with AI…</>
                      ) : (
                        <><Send className="h-4 w-4" /> Submit Answer</>
                      )}
                    </button>

                    {!sessionComplete && hasAnsweredCurrent && (
                      <button
                        onClick={nextQuestion}
                        className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-dark-border bg-dark-card px-5 text-sm font-bold text-gray-200 transition-colors hover:text-white"
                      >
                        Next <ChevronRight className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              </motion.section>
            </AnimatePresence>
          </div>
        </main>

        {/* ─── Right Sidebar: Feedback ─── */}
        <aside className="space-y-6">
          <section className="glass-card rounded-2xl border-brand-purple/20 bg-gradient-to-br from-brand-purple/10 to-transparent p-5">
            <h2 className="mb-4 flex items-center gap-2 text-sm font-bold text-white">
              <Brain className="h-4 w-4 text-brand-purple" />
              AI Feedback
              {currentEvaluation?.source === "ml" && (
                <span className="ml-auto rounded-full bg-brand-cyan/10 border border-brand-cyan/20 px-2 py-0.5 text-[9px] font-bold text-brand-cyan uppercase tracking-wider">ML Evaluated</span>
              )}
              {currentEvaluation?.source === "heuristic" && (
                <span className="ml-auto rounded-full bg-gray-500/10 border border-gray-500/20 px-2 py-0.5 text-[9px] font-bold text-gray-400 uppercase tracking-wider">Heuristic</span>
              )}
            </h2>

            {isEvaluating && (
              <div className="flex flex-col items-center justify-center gap-3 py-10 text-gray-400">
                <Loader2 className="h-8 w-8 animate-spin text-brand-cyan" />
                <p className="text-xs font-medium text-center">Running Sentence Transformer evaluation…</p>
              </div>
            )}

            {!isEvaluating && currentEvaluation ? (
              <div className="space-y-4">
                {/* Score */}
                <div className="rounded-xl border border-white/5 bg-white/5 p-3 flex items-start justify-between gap-2">
                  <div>
                    <p className="text-[10px] font-bold uppercase text-brand-cyan">Score</p>
                    <p className="text-3xl font-bold text-white">{currentEvaluation.score}<span className="text-lg text-gray-500">/10</span></p>
                    <p className="text-xs text-gray-400 mt-0.5">{currentEvaluation.overallLabel}</p>
                  </div>
                  {currentEvaluation.source === "ml" && (
                    <div className="text-right text-[10px] text-gray-400 space-y-0.5 mt-1">
                      <p>Similarity: <span className="text-brand-cyan font-mono">{(currentEvaluation.similarityScore * 100).toFixed(0)}%</span></p>
                      <p>Coverage: <span className="text-brand-purple font-mono">{currentEvaluation.conceptCoverage.toFixed(0)}%</span></p>
                    </div>
                  )}
                  {currentEvaluation.source === "heuristic" && currentEvaluation.voiceStats && (
                    <div className="text-right text-[10px] text-gray-400 space-y-0.5 mt-1">
                      <p className="text-brand-cyan font-mono">{currentEvaluation.voiceStats.wpm} WPM</p>
                      <p className="text-brand-orange font-mono">{currentEvaluation.voiceStats.fillerCount} fillers</p>
                    </div>
                  )}
                </div>

                {/* Summary */}
                <div className="rounded-xl border border-white/5 bg-white/5 p-3">
                  <p className="mb-1 text-[10px] font-bold uppercase text-brand-purple">Evaluation Summary</p>
                  <p className="text-xs leading-5 text-gray-300">{currentEvaluation.summary}</p>
                </div>

                {/* ML Rubric */}
                {currentEvaluation.source === "heuristic" && (
                  <div>
                    <p className="mb-2 text-[10px] font-bold uppercase text-brand-cyan">Rubric</p>
                    <div className="space-y-2.5">
                      {[
                        ["Relevance", currentEvaluation.rubric.relevance, 3],
                        ["Depth", currentEvaluation.rubric.depth, 2],
                        ["Specificity", currentEvaluation.rubric.specificity, 2],
                        ["Structure", currentEvaluation.rubric.structure, 1.5],
                        ["Professionalism", currentEvaluation.rubric.professionalism, 1],
                        ["Concept Cues", currentEvaluation.rubric.referenceAlignment, 0.5],
                      ].map(([label, value, max]) => (
                        <div key={label as string} className="space-y-1">
                          <div className="flex justify-between text-[10px]">
                            <span className="text-gray-400">{label}</span>
                            <span className="text-white">{toPercent(value as number, max as number)}%</span>
                          </div>
                          <div className="h-1.5 overflow-hidden rounded-full bg-dark-bg">
                            <div className="h-full bg-brand-cyan shadow-glow-cyan" style={{ width: `${toPercent(value as number, max as number)}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Mentioned / Missing Concepts (ML mode) */}
                {currentEvaluation.source === "ml" && currentEvaluation.mentionedConcepts.length > 0 && (
                  <div>
                    <p className="mb-2 text-[10px] font-bold uppercase text-brand-green">Concepts You Covered</p>
                    <div className="flex flex-wrap gap-1.5">
                      {currentEvaluation.mentionedConcepts.map((c) => (
                        <span key={c} className="rounded-full bg-brand-green/10 px-2 py-0.5 text-[10px] text-brand-green">{c}</span>
                      ))}
                    </div>
                  </div>
                )}
                {currentEvaluation.source === "ml" && currentEvaluation.missingConcepts.length > 0 && (
                  <div>
                    <p className="mb-2 text-[10px] font-bold uppercase text-brand-orange">Missing Concepts</p>
                    <div className="flex flex-wrap gap-1.5">
                      {currentEvaluation.missingConcepts.map((c) => (
                        <span key={c} className="rounded-full bg-brand-orange/10 px-2 py-0.5 text-[10px] text-brand-orange">{c}</span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Strengths */}
                <div>
                  <p className="mb-2 text-[10px] font-bold uppercase text-brand-green">Strengths</p>
                  <ul className="space-y-1.5 text-xs leading-5 text-gray-300">
                    {currentEvaluation.strengths.map((s) => (
                      <li key={s} className="flex items-start gap-1.5"><span className="text-brand-green font-bold shrink-0">•</span>{s}</li>
                    ))}
                  </ul>
                </div>

                {/* Improvements */}
                <div>
                  <p className="mb-2 text-[10px] font-bold uppercase text-brand-orange">Improvements</p>
                  <ul className="space-y-1.5 text-xs leading-5 text-gray-300">
                    {currentEvaluation.improvements.map((s) => (
                      <li key={s} className="flex items-start gap-1.5"><span className="text-brand-orange font-bold shrink-0">•</span>{s}</li>
                    ))}
                  </ul>
                </div>

                {/* Optional Cues (heuristic) or Suggestions (ML) */}
                {currentEvaluation.source === "heuristic" && currentEvaluation.optionalCues.length > 0 && (
                  <div>
                    <p className="mb-2 text-[10px] font-bold uppercase text-brand-purple">Suggested Keywords</p>
                    <div className="flex flex-wrap gap-1.5">
                      {currentEvaluation.optionalCues.map((c) => (
                        <span key={c} className="rounded-full bg-brand-purple/10 px-2.5 py-1 text-[11px] text-brand-purple">{c}</span>
                      ))}
                    </div>
                  </div>
                )}
                {currentEvaluation.source === "ml" && currentEvaluation.suggestions.length > 0 && (
                  <div>
                    <p className="mb-2 text-[10px] font-bold uppercase text-brand-purple">Study Suggestions</p>
                    <ul className="space-y-1.5 text-xs text-gray-300">
                      {currentEvaluation.suggestions.map((s) => (
                        <li key={s} className="flex items-start gap-1.5"><span className="text-brand-purple font-bold shrink-0">•</span>{s}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : !isEvaluating ? (
              <p className="text-sm leading-6 text-gray-400">
                Submit your answer to receive AI-powered feedback using{" "}
                <span className="text-brand-cyan font-medium">Sentence Transformer semantic scoring</span>{" "}
                — gibberish and off-topic answers are automatically rejected.
              </p>
            ) : null}
          </section>

          {/* History */}
          <section className="glass-card rounded-2xl p-5">
            <h2 className="mb-4 text-sm font-bold text-white">Answered</h2>
            <div className="space-y-3">
              {records.length ? (
                records.map((rec, i) => (
                  <div key={`${rec.question.id}-${i}`} className="flex items-start gap-3 rounded-xl border border-white/5 bg-white/5 p-3">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-brand-green" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-medium text-white">{rec.question.question}</p>
                      <div className="mt-1 flex items-center justify-between text-[11px] text-gray-500">
                        <span>Score: <span className="font-mono text-white">{rec.evaluation.score}/10</span></span>
                        <span className={`text-[9px] font-bold uppercase ${rec.evaluation.source === "ml" ? "text-brand-cyan" : "text-gray-500"}`}>
                          {rec.evaluation.source === "ml" ? "ML" : "Heuristic"}
                        </span>
                      </div>
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
