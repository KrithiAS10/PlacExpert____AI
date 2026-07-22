"use client";

import { useMemo, useState } from "react";
import {
  Brain,
  CheckCircle2,
  Mic,
  MicOff,
  Play,
  RotateCcw,
  Send,
  Volume2,
} from "lucide-react";
import { voiceInterviewQuestions, type VoiceInterviewQuestion } from "@/lib/voice-interview-data";

type SpeechRecognitionEventLike = {
  results: {
    length: number;
    [index: number]: {
      isFinal: boolean;
      [index: number]: {
        transcript: string;
      };
    };
  };
};

type SpeechRecognitionLike = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
};

type SpeechRecognitionConstructor = new () => SpeechRecognitionLike;

type VoiceEvaluation = {
  score: number;
  label: string;
  summary: string;
  strengths: string[];
  improvements: string[];
  rubric: {
    relevance: number;
    structure: number;
    specificity: number;
    clarity: number;
    confidence: number;
  };
};

type VoiceRecord = {
  question: VoiceInterviewQuestion;
  transcript: string;
  evaluation: VoiceEvaluation;
};

const categories = ["HR", "Behavioral", "Technical"] as const;

const fillerPattern = /\b(um+|uh+|like|actually|basically|literally|you know)\b/gi;

function normalizeText(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9+#.\s]/g, " ");
}

function countThemeMatches(answer: string, themes: string[]) {
  const normalized = normalizeText(answer);
  return themes.filter((theme) => normalized.includes(normalizeText(theme).trim())).length;
}

function toPercent(score: number, max: number) {
  return Math.round((score / max) * 100);
}

function evaluateVoiceAnswer(question: VoiceInterviewQuestion, transcript: string): VoiceEvaluation {
  const words = transcript.trim().split(/\s+/).filter(Boolean);
  const themeMatches = countThemeMatches(transcript, question.expectedThemes);
  const hasExample = /\b(example|project|internship|experience|situation|built|created|led|handled|solved|worked)\b/i.test(transcript);
  const hasOutcome = /\b(result|impact|learned|improved|increased|reduced|delivered|helped|resolved|achieved)\b/i.test(transcript);
  const hasStructure = /\b(first|second|finally|overall|situation|task|action|result|because|therefore)\b/i.test(transcript);
  const fillerCount = transcript.match(fillerPattern)?.length ?? 0;
  const sentenceCount = transcript.split(/[.!?]+/).filter((part) => part.trim().length > 0).length;

  const relevance = Math.min(3, 1 + themeMatches * 0.55);
  const structure = Math.min(2, (hasStructure ? 1.2 : 0.5) + (sentenceCount >= 2 ? 0.5 : 0) + (words.length >= 35 ? 0.3 : 0));
  const specificity = Math.min(2, (hasExample ? 1 : 0) + (hasOutcome ? 0.75 : 0) + (/\d|%/.test(transcript) ? 0.25 : 0));
  const clarity = Math.min(2, words.length >= 70 ? 2 : words.length >= 40 ? 1.5 : words.length >= 20 ? 1 : 0.5);
  const confidence = Math.max(0.5, Math.min(1, 1 - fillerCount * 0.08));
  const score = Math.min(10, Math.round((relevance + structure + specificity + clarity + confidence) * 10) / 10);
  const label = score >= 8 ? "Interview Ready" : score >= 6 ? "Good" : score >= 4 ? "Developing" : "Needs Practice";
  const strengths = [
    relevance >= 2.2 ? "Answer addresses the intent of the question." : "",
    structure >= 1.4 ? "Response has a clear flow for a spoken answer." : "",
    specificity >= 1 ? "Includes concrete detail or evidence." : "",
    clarity >= 1.5 ? "Answer has enough substance for an interview setting." : "",
    confidence >= 0.85 ? "Delivery reads as confident and professional." : "",
  ].filter(Boolean);
  const improvements = [
    relevance < 2.2 ? "Tie your answer more directly to the question being asked." : "",
    structure < 1.4 ? "Use a simple spoken structure: context, action, result." : "",
    specificity < 1 ? "Add a real project, example, number, or outcome." : "",
    clarity < 1.5 ? "Expand the answer so it does not sound rushed or incomplete." : "",
    confidence < 0.85 ? "Reduce filler words and pause briefly before key points." : "",
  ].filter(Boolean);

  return {
    score,
    label,
    summary:
      score >= 8
        ? "Strong spoken answer. It sounds specific, relevant, and easy to follow."
        : score >= 6
          ? "Good answer. Add sharper evidence or a cleaner structure to make it stronger."
          : "This needs more interview polish. Focus on structure, detail, and direct relevance.",
    strengths: strengths.length ? strengths : ["You answered the question and created a base to improve from."],
    improvements: improvements.length ? improvements : ["Keep practicing concise delivery with natural pauses."],
    rubric: {
      relevance,
      structure,
      specificity,
      clarity,
      confidence,
    },
  };
}

function getSpeechRecognition() {
  if (typeof window === "undefined") return null;

  const browserWindow = window as typeof window & {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  };

  return browserWindow.SpeechRecognition ?? browserWindow.webkitSpeechRecognition ?? null;
}

export default function VoiceInterviewPage() {
  const [selectedCategory, setSelectedCategory] = useState<(typeof categories)[number]>("HR");
  const [questionIndex, setQuestionIndex] = useState(0);
  const [transcript, setTranscript] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [recognition, setRecognition] = useState<SpeechRecognitionLike | null>(null);
  const [currentEvaluation, setCurrentEvaluation] = useState<VoiceEvaluation | null>(null);
  const [records, setRecords] = useState<VoiceRecord[]>([]);

  const questions = useMemo(
    () => voiceInterviewQuestions.filter((question) => question.category === selectedCategory),
    [selectedCategory]
  );
  const currentQuestion = questions[questionIndex];
  const averageScore = records.length
    ? (records.reduce((total, record) => total + record.evaluation.score, 0) / records.length).toFixed(1)
    : "0.0";
  const progress = Math.round((records.length / questions.length) * 100);

  const speakQuestion = () => {
    if (!("speechSynthesis" in window)) return;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(currentQuestion.question);
    utterance.rate = 0.92;
    utterance.pitch = 1;
    window.speechSynthesis.speak(utterance);
  };

  const startRecording = () => {
    const Recognition = getSpeechRecognition();
    if (!Recognition) return;

    const recorder = new Recognition();
    recorder.continuous = true;
    recorder.interimResults = true;
    recorder.lang = "en-US";
    recorder.onresult = (event) => {
      let nextTranscript = "";

      for (let index = 0; index < event.results.length; index += 1) {
        nextTranscript += event.results[index][0].transcript;
      }

      setTranscript(nextTranscript.trim());
    };
    recorder.onend = () => {
      setIsRecording(false);
    };
    recorder.start();
    setRecognition(recorder);
    setIsRecording(true);
  };

  const stopRecording = () => {
    recognition?.stop();
    setIsRecording(false);
  };

  const submitAnswer = () => {
    if (!transcript.trim()) return;

    const evaluation = evaluateVoiceAnswer(currentQuestion, transcript);
    setCurrentEvaluation(evaluation);
    setRecords((prev) => [
      ...prev,
      {
        question: currentQuestion,
        transcript: transcript.trim(),
        evaluation,
      },
    ]);
  };

  const nextQuestion = () => {
    setQuestionIndex((current) => Math.min(current + 1, questions.length - 1));
    setTranscript("");
    setCurrentEvaluation(null);
  };

  const resetSession = () => {
    recognition?.stop();
    setQuestionIndex(0);
    setTranscript("");
    setCurrentEvaluation(null);
    setRecords([]);
    setIsRecording(false);
  };

  const switchCategory = (category: (typeof categories)[number]) => {
    recognition?.stop();
    setSelectedCategory(category);
    setQuestionIndex(0);
    setTranscript("");
    setCurrentEvaluation(null);
    setRecords([]);
    setIsRecording(false);
  };

  const speechSupported = Boolean(getSpeechRecognition());
  const hasAnswered = Boolean(currentEvaluation);
  const isLastQuestion = questionIndex === questions.length - 1;

  return (
    <div className="min-h-[calc(100vh-8rem)] space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Voice Mock Interview</h1>
          <p className="text-sm text-gray-400">Practice spoken answers with transcript-based professional feedback.</p>
        </div>
        <button
          onClick={resetSession}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-dark-border bg-dark-card px-4 text-sm font-medium text-gray-300 transition-colors hover:text-white"
        >
          <RotateCcw className="h-4 w-4" />
          Reset
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[280px_minmax(0,1fr)_320px]">
        <aside className="space-y-6">
          <section className="glass-card rounded-2xl p-5">
            <h2 className="mb-4 text-sm font-bold text-white">Voice Dataset</h2>
            <div className="space-y-2">
              {categories.map((category) => {
                const count = voiceInterviewQuestions.filter((question) => question.category === category).length;
                const isSelected = selectedCategory === category;

                return (
                  <button
                    key={category}
                    onClick={() => switchCategory(category)}
                    className={`flex w-full items-center justify-between rounded-xl border p-3 text-left transition-all ${
                      isSelected
                        ? "border-brand-cyan/50 bg-white/5 ring-1 ring-brand-cyan/20"
                        : "border-dark-border bg-transparent hover:border-white/10"
                    }`}
                  >
                    <span className={isSelected ? "text-sm font-medium text-white" : "text-sm font-medium text-gray-400"}>{category}</span>
                    <span className="rounded-full bg-white/5 px-2 py-0.5 text-[10px] text-gray-400">{count}</span>
                  </button>
                );
              })}
            </div>
          </section>

          <section className="glass-card rounded-2xl p-5">
            <h2 className="mb-4 text-sm font-bold text-white">Session Stats</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">Attended</span>
                <span className="font-mono text-xs text-white">
                  {records.length} / {questions.length}
                </span>
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
            </div>
          </section>
        </aside>

        <main className="glass-card flex min-h-[620px] flex-col overflow-hidden rounded-3xl border-dark-border/50">
          <div className="border-b border-dark-border bg-white/5 p-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-bold text-white">{selectedCategory} Voice Interview</p>
                <p className="text-[10px] font-medium uppercase tracking-widest text-gray-500">
                  Question {questionIndex + 1} of {questions.length}
                </p>
              </div>
              <button
                onClick={speakQuestion}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-dark-border bg-dark-card px-3 text-xs font-bold text-gray-200 transition-colors hover:text-white"
              >
                <Volume2 className="h-4 w-4" />
                Speak
              </button>
            </div>
          </div>

          <div className="flex-1 space-y-6 overflow-y-auto p-6">
            <section className="rounded-2xl border border-dark-border bg-dark-card p-5">
              <div className="mb-3 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-brand-cyan">
                <Brain className="h-3.5 w-3.5" />
                Interviewer Question
              </div>
              <p className="text-base font-semibold leading-7 text-white">{currentQuestion.question}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="rounded-full bg-white/5 px-2.5 py-1 text-[11px] text-gray-300">{currentQuestion.difficulty}</span>
                <span className="rounded-full bg-brand-cyan/10 px-2.5 py-1 text-[11px] text-brand-cyan">{currentQuestion.intent}</span>
              </div>
            </section>

            {!speechSupported && (
              <div className="rounded-xl border border-brand-orange/20 bg-brand-orange/10 p-4 text-sm text-brand-orange">
                Your browser does not expose speech recognition here. You can still type or paste your spoken answer below.
              </div>
            )}

            <section className="space-y-3">
              <label htmlFor="voice-transcript" className="text-sm font-bold text-white">
                Answer Transcript
              </label>
              <textarea
                id="voice-transcript"
                value={transcript}
                onChange={(event) => setTranscript(event.target.value)}
                disabled={hasAnswered}
                placeholder="Record your voice or type your answer here..."
                className="min-h-60 w-full resize-none rounded-2xl border border-dark-border bg-dark-bg p-4 text-sm leading-6 text-gray-200 outline-none transition-all placeholder:text-gray-600 focus:border-brand-cyan/50 disabled:cursor-not-allowed disabled:opacity-70"
              />
            </section>

            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                onClick={isRecording ? stopRecording : startRecording}
                disabled={!speechSupported || hasAnswered}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-dark-border bg-dark-card px-5 text-sm font-bold text-gray-200 transition-colors hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                {isRecording ? "Stop Recording" : "Start Recording"}
              </button>
              <button
                onClick={submitAnswer}
                disabled={!transcript.trim() || hasAnswered}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-brand-cyan px-5 text-sm font-bold text-dark-bg shadow-glow-cyan transition-all hover:bg-brand-cyan/90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Send className="h-4 w-4" />
                Review Answer
              </button>
              {hasAnswered && !isLastQuestion && (
                <button
                  onClick={nextQuestion}
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-dark-border bg-dark-card px-5 text-sm font-bold text-gray-200 transition-colors hover:text-white"
                >
                  <Play className="h-4 w-4" />
                  Next
                </button>
              )}
            </div>
          </div>
        </main>

        <aside className="space-y-6">
          <section className="glass-card rounded-2xl border-brand-purple/20 bg-gradient-to-br from-brand-purple/10 to-transparent p-5">
            <h2 className="mb-4 text-sm font-bold text-white">Voice Feedback</h2>
            {currentEvaluation ? (
              <div className="space-y-4">
                <div className="rounded-xl border border-white/5 bg-white/5 p-3">
                  <p className="mb-1 text-[10px] font-bold uppercase text-brand-cyan">Score</p>
                  <p className="text-2xl font-bold text-white">{currentEvaluation.score}/10</p>
                  <p className="mt-1 text-xs text-gray-400">{currentEvaluation.label}</p>
                </div>
                <p className="rounded-xl border border-white/5 bg-white/5 p-3 text-xs leading-5 text-gray-300">
                  {currentEvaluation.summary}
                </p>
                <div className="space-y-3">
                  {[
                    ["Relevance", currentEvaluation.rubric.relevance, 3],
                    ["Structure", currentEvaluation.rubric.structure, 2],
                    ["Specificity", currentEvaluation.rubric.specificity, 2],
                    ["Clarity", currentEvaluation.rubric.clarity, 2],
                    ["Confidence", currentEvaluation.rubric.confidence, 1],
                  ].map(([label, value, max]) => (
                    <div key={label as string} className="space-y-1.5">
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
                <div className="rounded-xl border border-white/5 bg-white/5 p-3">
                  <p className="mb-1 text-[10px] font-bold uppercase text-brand-purple">Follow-up</p>
                  <p className="text-xs leading-5 text-gray-300">{currentQuestion.followUp}</p>
                </div>
              </div>
            ) : (
              <p className="text-sm leading-6 text-gray-400">Record or type your answer, then review it for spoken interview readiness.</p>
            )}
          </section>

          <section className="glass-card rounded-2xl p-5">
            <h2 className="mb-4 text-sm font-bold text-white">Answered</h2>
            <div className="space-y-3">
              {records.length ? (
                records.map((record) => (
                  <div key={record.question.id} className="flex items-start gap-3 rounded-xl border border-white/5 bg-white/5 p-3">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-brand-green" />
                    <div className="min-w-0">
                      <p className="truncate text-xs font-medium text-white">{record.question.question}</p>
                      <p className="mt-1 text-[11px] text-gray-500">Score: {record.evaluation.score}/10</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">No voice answers reviewed yet.</p>
              )}
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}

