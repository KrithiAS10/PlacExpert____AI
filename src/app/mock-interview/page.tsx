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
  RefreshCw,
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
  Activity,
  Play,
  Square,
  AlertTriangle,
  Clock,
  MessageSquare,
  Zap,
  Keyboard,
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
  onerror: ((event: { error: string }) => void) | null;
  start: () => void;
  stop: () => void;
};

type SpeechRecognitionConstructor = new () => SpeechRecognitionLike;

function getSpeechRecognition() {
  if (typeof window === "undefined") return null;

  const browserWindow = window as typeof window & {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  };

  return browserWindow.SpeechRecognition ?? browserWindow.webkitSpeechRecognition ?? null;
}

type Evaluation = {
  score: number;
  overallLabel: string;
  summary: string;
  strengths: string[];
  improvements: string[];
  optionalCues: string[];
  voiceStats?: {
    wordCount: number;
    wpm: number;
    fillerCount: number;
    durationSeconds: number;
  };
  rubric: {
    relevance: number;
    clarityPacing?: number; // Only for voice
    depth?: number;         // Only for text
    specificity: number;
    structure: number;
    confidenceTone?: number; // Only for voice
    professionalism?: number; // Only for text
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

const FILLER_REGEX = /\b(um+|uh+|like|actually|basically|literally|you know|sort of|kinda|i mean|right)\b/gi;

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

function checkGibberishAndQuality(text: string): { isInvalid: boolean; reason: string } {
  const trimmed = text.trim();
  if (trimmed.length < 5) {
    return { isInvalid: true, reason: "Answer is too short. Please provide a complete technical response." };
  }

  const words = trimmed.split(/\s+/).filter(Boolean);
  if (words.length < 3) {
    return { isInvalid: true, reason: "Please provide a more complete response (at least 3-5 words)." };
  }

  // Check 1: Repeated word spam (e.g., "test test test test test")
  const uniqueWords = new Set(words.map((w) => w.toLowerCase()));
  if (words.length >= 5 && uniqueWords.size / words.length < 0.25) {
    return { isInvalid: true, reason: "Excessive word repetition detected. Please write a meaningful response." };
  }

  // Check 2: Keyboard pattern & random character sequence spam
  const spamRegex = /\b(asdf|fdsa|qwerty|zxcv|ghjkl|hjkl|jkl;|12345|aaaa|bbbb|cccc|dddd|eeee|ffff|gggg|hhhh|iiii|jjjj|kkkk|llll|mmmm|nnnn|oooo|pppp|qqqq|rrrr|ssss|tttt|uuuu|vvvv|wwww|xxxx|yyyy|zzzz)\b/i;
  let spamWords = 0;
  for (const word of words) {
    if (spamRegex.test(word) || /(.)\1{3,}/.test(word)) {
      spamWords++;
    }
  }
  if (spamWords / words.length > 0.2) {
    return { isInvalid: true, reason: "Random character sequence / gibberish keystrokes detected." };
  }

  // Check 3: Vowel-to-consonant structure for pseudo-words (e.g. "dfghjkl", "qwrtpsdf")
  let gibberishWords = 0;
  for (const word of words) {
    const clean = word.toLowerCase().replace(/[^a-z]/g, "");
    if (clean.length > 4) {
      const vowels = clean.match(/[aeiouy]/g)?.length ?? 0;
      if (vowels / clean.length < 0.12) {
        gibberishWords++;
      }
    }
  }
  if (gibberishWords / words.length > 0.3) {
    return { isInvalid: true, reason: "Unrecognizable non-English words or random text detected." };
  }

  return { isInvalid: false, reason: "" };
}

function evaluateAnswer(
  question: MockInterviewQuestion,
  answer: string,
  mode: "voice" | "text",
  durationSeconds: number = 0
): Evaluation {
  const words = answer.trim().split(/\s+/).filter(Boolean);
  const wordCount = words.length;
  const answerWords = new Set(getMeaningfulWords(answer));
  const expectedCues = getExpectedCues(question);
  const referenceCueMatches = countCueMatches(answerWords, question.keyConcepts);
  const expectedCueMatches = countCueMatches(answerWords, expectedCues);

  // Strict Gibberish & Quality Check
  const validation = checkGibberishAndQuality(answer);
  if (validation.isInvalid) {
    return {
      score: 0,
      overallLabel: "Invalid Answer",
      summary: `Response Rejected: ${validation.reason}`,
      strengths: ["None — the response did not pass basic English & technical response validation."],
      improvements: [validation.reason, "Provide a clear, structured response related to the question topic."],
      optionalCues: expectedCues.slice(0, 6),
      voiceStats: mode === "voice" ? { wordCount, wpm: 0, fillerCount: 0, durationSeconds } : undefined,
      rubric: mode === "voice" ? {
        relevance: 0,
        clarityPacing: 0,
        specificity: 0,
        structure: 0,
        confidenceTone: 0,
        referenceAlignment: 0,
      } : {
        relevance: 0,
        depth: 0,
        specificity: 0,
        structure: 0,
        professionalism: 0,
        referenceAlignment: 0,
      },
    };
  }

  const hasExample = /\b(example|for instance|project|internship|experience|situation|led|built|created|improved|resolved|achieved|handled)\b/i.test(answer);
  const hasOutcome = /\b(result|impact|outcome|learned|improved|increased|reduced|delivered|helped|because|therefore)\b/i.test(answer);
  const hasStructure = /\b(first|second|finally|overall|for example|in my previous|situation|task|action|result)\b/i.test(answer);
  const hasProfessionalTone = !/\b(idk|dunno|whatever|stuff|things like that|kinda|lol)\b/i.test(answer);

  // Zero-relevance penalty for completely off-topic responses
  const relevance = (expectedCueMatches === 0 && referenceCueMatches === 0) 
    ? 0.2 
    : Math.min(3, 1 + Math.min(2, expectedCueMatches * 0.45));
  const specificity = Math.min(2, (hasExample ? 1 : 0) + (hasOutcome ? 0.75 : 0) + (/\d|%/.test(answer) ? 0.25 : 0));
  const structure = Math.min(1.5, (hasStructure ? 0.9 : 0.4) + (wordCount >= 35 ? 0.4 : 0) + (/[.!?]/.test(answer.trim()) ? 0.2 : 0));
  const referenceAlignment = Math.min(0.5, referenceCueMatches * 0.12);

  let score = 0;
  let overallLabel = "";
  let summary = "";
  let strengths: string[] = [];
  let improvements: string[] = [];
  let rubric: Evaluation["rubric"];
  let voiceStats: Evaluation["voiceStats"] | undefined;

  const optionalCues = expectedCues
    .filter((cue) => countCueMatches(answerWords, [cue]) === 0)
    .slice(0, 6);

  if (mode === "voice") {
    const fillerMatches = answer.match(FILLER_REGEX) ?? [];
    const fillerCount = fillerMatches.length;

    const durationMinutes = durationSeconds > 0 ? durationSeconds / 60 : Math.max(0.5, wordCount / 120);
    const wpm = Math.round(wordCount / durationMinutes);

    let clarityPacing = 0.5;
    if (wordCount >= 45 && wordCount <= 180) clarityPacing += 0.8;
    else if (wordCount > 25) clarityPacing += 0.4;
    if (wpm >= 100 && wpm <= 170) clarityPacing += 0.7;
    else if (wpm >= 80 && wpm <= 190) clarityPacing += 0.4;
    clarityPacing = Math.min(2, clarityPacing);

    const fillerRatio = wordCount > 0 ? fillerCount / wordCount : 0;
    let confidenceTone = hasProfessionalTone ? 1.0 : 0.4;
    if (fillerRatio > 0.08) confidenceTone = Math.max(0.2, confidenceTone - 0.4);
    else if (fillerRatio > 0.04) confidenceTone = Math.max(0.4, confidenceTone - 0.2);

    const rawScore = relevance + clarityPacing + specificity + structure + confidenceTone + referenceAlignment;
    score = Math.min(10, Math.round(rawScore * 10) / 10);

    strengths = [
      relevance >= 2.2 ? "Answer directly hits the question requirements." : "",
      clarityPacing >= 1.5 ? `Great spoken pacing (~${wpm} WPM) and clear length.` : "",
      specificity >= 1.0 ? "Includes concrete examples, tasks, or outcomes." : "",
      structure >= 1.0 ? "Spoken response is logically structured and easy to follow." : "",
      confidenceTone >= 0.8 ? "Spoken delivery reads as confident with minimal filler words." : "",
    ].filter(Boolean);

    improvements = [
      relevance < 2.2 ? "Target the question topic more directly in your opening line." : "",
      clarityPacing < 1.5 ? (wpm > 180 ? "Slow down slightly for better spoken clarity." : "Elaborate with a slightly more detailed explanation.") : "",
      specificity < 1.0 ? "Include a real-world project example, tech stack, or quantitative result." : "",
      structure < 1.0 ? "Use structured delivery (e.g. definition -> key mechanisms -> example)." : "",
      fillerCount > 2 ? `Reduce filler words ("${fillerMatches.slice(0, 3).join('", "')}") by pausing briefly instead.` : "",
    ].filter(Boolean);

    overallLabel = score >= 8.5 ? "Interview Ready" : score >= 7 ? "Strong" : score >= 5.5 ? "Good Progress" : "Needs Practice";

    summary =
      score >= 8.5
        ? "Outstanding spoken response! Clear articulation, relevant tech concepts, and natural delivery confidence."
        : score >= 7
          ? "Solid interview answer. Good subject knowledge with room for sharper examples or lower filler usage."
          : score >= 5.5
            ? "Good base explanation. Structure your response with a direct definition followed by a concrete example."
            : "Needs more substance and practice. Focus on speaking in complete, structured sentences with real details.";

    voiceStats = { wordCount, wpm, fillerCount, durationSeconds };
    rubric = { relevance, clarityPacing, specificity, structure, confidenceTone, referenceAlignment };
  } else {
    // Text Mode
    const depth = Math.min(2, wordCount >= 80 ? 2 : wordCount >= 45 ? 1.5 : wordCount >= 25 ? 1 : 0.5);
    const professionalism = hasProfessionalTone ? 1 : 0.4;
    
    const rawScore = relevance + depth + specificity + structure + professionalism + referenceAlignment;
    score = Math.min(10, Math.round(rawScore * 10) / 10);

    strengths = [
      relevance >= 2.2 ? "Answer stays connected to what the interviewer asked." : "",
      depth >= 1.5 ? "Good level of detail for an interview answer." : "",
      specificity >= 1 ? "Includes concrete experience, action, or outcome." : "",
      structure >= 1 ? "Response is organized enough to follow easily." : "",
      professionalism >= 1 ? "Tone is professional and interview-appropriate." : "",
    ].filter(Boolean);

    improvements = [
      relevance < 2.2 ? "Make the answer more directly tied to the question." : "",
      depth < 1.5 ? "Add a little more context instead of giving a short generic line." : "",
      specificity < 1 ? "Include a real example, project, measurable result, or lesson learned." : "",
      structure < 1 ? "Use a simple structure such as context, action, and result." : "",
      professionalism < 1 ? "Use more formal wording for interview settings." : "",
    ].filter(Boolean);

    overallLabel = score >= 8 ? "Strong" : score >= 6 ? "Good" : score >= 4 ? "Developing" : "Needs Work";

    summary =
      score >= 8
        ? "This is a strong professional answer. Keep it natural, but preserve the clarity and evidence."
        : score >= 6
          ? "This is a good base answer. A stronger example or clearer outcome would make it more convincing."
          : score >= 4
            ? "This answer has potential, but it needs more context, structure, and evidence."
            : "This is too thin for an interview. Build it into a complete answer with context, action, and result.";

    rubric = { relevance, depth, specificity, structure, professionalism, referenceAlignment };
  }

  return {
    score,
    overallLabel,
    summary,
    strengths: strengths.length ? strengths : ["Attempted the question and built a solid base."],
    improvements: improvements.length ? improvements : ["Polish delivery and keep the answer concise."],
    optionalCues,
    voiceStats,
    rubric,
  };
}

export default function MockInterviewPage() {
  const [interviewMode, setInterviewMode] = useState<"text" | "voice">("voice");
  const [domains, setDomains] = useState<MockInterviewDomain[]>(mockInterviewDomains);
  const [selectedDomainId, setSelectedDomainId] = useState<MockInterviewDomainId>("dsa");
  const [sessions, setSessions] = useState<Record<string, DomainSession>>({});
  const [datasetSource, setDatasetSource] = useState("Built-in question dataset");
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Voice & Audio States
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [autoSpeak, setAutoSpeak] = useState(true);
  const [speechPace, setSpeechPace] = useState(1.0);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [transcript, setTranscript] = useState("");
  const [speechError, setSpeechError] = useState<string | null>(null);

  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Speech Recognition Availability
  const speechSupported = useMemo(() => Boolean(getSpeechRecognition()), []);

  // Fetch Dataset
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
      setDatasetSource(data.source ? "CSV QA Dataset" : "CSV dataset");
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
  const currentQuestion = selectedDomain.questions[questionIndex];
  const records = selectedSession.records;
  const currentEvaluation = selectedSession.currentEvaluation;

  // Text-To-Speech Synthesizer (AI Interviewer Speaking)
  const speakQuestion = useCallback(
    (textToSpeak?: string) => {
      if (interviewMode !== "voice") return; // Only speak in voice mode
      if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

      window.speechSynthesis.cancel();

      const text = textToSpeak ?? currentQuestion?.question;
      if (!text) return;

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = speechPace;
      utterance.pitch = 1.0;
      utterance.lang = "en-US";

      const voices = window.speechSynthesis.getVoices();
      const preferredVoice = voices.find(
        (voice) => voice.lang.startsWith("en") && (voice.name.includes("Natural") || voice.name.includes("Google") || voice.name.includes("Samantha") || voice.name.includes("Daniel"))
      ) ?? voices.find((voice) => voice.lang.startsWith("en"));

      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      window.speechSynthesis.speak(utterance);
    },
    [currentQuestion?.question, speechPace, interviewMode]
  );

  const stopSpeaking = useCallback(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, []);

  useEffect(() => {
    if (interviewMode === "voice" && autoSpeak && currentQuestion) {
      const timer = setTimeout(() => {
        speakQuestion(currentQuestion.question);
      }, 400);
      return () => {
        clearTimeout(timer);
        stopSpeaking();
      };
    }
  }, [currentQuestion?.id, autoSpeak, speakQuestion, stopSpeaking, interviewMode]);

  useEffect(() => {
    return () => {
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
      stopSpeaking();
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {}
      }
    };
  }, [stopSpeaking]);

  const startRecording = () => {
    setSpeechError(null);
    stopSpeaking();

    const Recognition = getSpeechRecognition();
    if (!Recognition) {
      setSpeechError("Speech recognition is not supported in your browser. You can still type your response below.");
      return;
    }

    try {
      const recorder = new Recognition();
      recorder.continuous = true;
      recorder.interimResults = true;
      recorder.lang = "en-US";

      recorder.onresult = (event) => {
        let finalTranscript = "";
        let interimTranscript = "";

        for (let i = 0; i < event.results.length; i += 1) {
          const result = event.results[i];
          if (result.isFinal) {
            finalTranscript += result[0].transcript + " ";
          } else {
            interimTranscript += result[0].transcript;
          }
        }

        const updatedText = (finalTranscript + interimTranscript).trim();
        if (updatedText) {
          setTranscript(updatedText);
          updateSelectedSession((session) => ({
            ...session,
            answer: updatedText,
          }));
        }
      };

      recorder.onerror = (event) => {
        console.warn("Speech recognition error:", event.error);
        if (event.error === "not-allowed") {
          setSpeechError("Microphone access was denied. Please check browser permissions.");
        }
      };

      recorder.onend = () => {
        setIsRecording(false);
        if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
      };

      recorder.start();
      recognitionRef.current = recorder;
      setIsRecording(true);
      setRecordingSeconds(0);

      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } catch (error) {
      console.error("Failed to start speech recognition:", error);
      setSpeechError("Could not launch microphone. Please try again or type directly.");
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
    }
    setIsRecording(false);
    if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
  };

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
    stopRecording();
    stopSpeaking();
    setSelectedDomainId(domainId);
    setTranscript("");
    setRecordingSeconds(0);
    setSessions((currentSessions) => ({
      ...currentSessions,
      [domainId]: currentSessions[domainId] ?? createEmptySession(),
    }));
  };

  const submitAnswer = () => {
    const currentAnswer = (transcript || selectedSession.answer).trim();
    if (!currentAnswer || !currentQuestion) return;

    stopRecording();
    stopSpeaking();

    const evaluation = evaluateAnswer(currentQuestion, currentAnswer, interviewMode, recordingSeconds);
    updateSelectedSession((session) => ({
      ...session,
      answer: currentAnswer,
      currentEvaluation: evaluation,
      records: [
        ...session.records,
        {
          question: currentQuestion,
          answer: currentAnswer,
          evaluation,
        },
      ],
    }));
  };

  const nextQuestion = () => {
    stopRecording();
    stopSpeaking();
    setTranscript("");
    setRecordingSeconds(0);
    const nextIndex = Math.min(questionIndex + 1, selectedDomain.questions.length - 1);
    updateSelectedSession((session) => ({
      ...session,
      questionIndex: nextIndex,
      answer: "",
      currentEvaluation: null,
    }));
  };

  const restartSession = () => {
    stopRecording();
    stopSpeaking();
    setTranscript("");
    setRecordingSeconds(0);
    updateSelectedSession(() => createEmptySession());
  };

  // Stats
  const averageScore = records.length
    ? (records.reduce((total, record) => total + record.evaluation.score, 0) / records.length).toFixed(1)
    : "0.0";
  const progress = Math.round((records.length / selectedDomain.questions.length) * 100);
  const remainingQuestions = selectedDomain.questions.length - records.length;
  const latestScore = records.at(-1)?.evaluation.score.toFixed(1) ?? "0.0";
  const isLastQuestion = questionIndex === selectedDomain.questions.length - 1;
  const hasAnsweredCurrent = Boolean(currentEvaluation);
  const sessionComplete = hasAnsweredCurrent && isLastQuestion;

  const currentText = transcript || selectedSession.answer;
  const wordCount = currentText.trim().split(/\s+/).filter(Boolean).length;
  const fillerCount = (currentText.match(FILLER_REGEX) ?? []).length;
  const wpm = recordingSeconds > 0 ? Math.round((wordCount / (recordingSeconds / 60))) : 0;

  return (
    <div className="min-h-[calc(100vh-8rem)] space-y-6">
      {/* Top Bar Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-white">Mock Interview</h1>
            <span className={`flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${
              interviewMode === "voice" 
                ? "bg-brand-cyan/10 border-brand-cyan/20 text-brand-cyan" 
                : "bg-brand-purple/10 border-brand-purple/20 text-brand-purple"
            }`}>
              {interviewMode === "voice" ? (
                <><Radio className="h-3 w-3 animate-pulse text-brand-cyan" /> Voice Mode</>
              ) : (
                <><Keyboard className="h-3 w-3 text-brand-purple" /> Text Mode</>
              )}
            </span>
          </div>
          <p className="text-sm text-gray-400">
            Practice technical and behavioral interviews with comprehensive rubric feedback.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex bg-dark-card rounded-lg border border-dark-border p-1">
            <button
              onClick={() => {
                setInterviewMode("text");
                stopRecording();
                stopSpeaking();
              }}
              className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all flex items-center gap-1.5 ${
                interviewMode === "text" 
                  ? "bg-white/10 text-white shadow-sm" 
                  : "text-gray-400 hover:text-gray-200"
              }`}
            >
              <Keyboard className="h-3.5 w-3.5" />
              Text
            </button>
            <button
              onClick={() => setInterviewMode("voice")}
              className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all flex items-center gap-1.5 ${
                interviewMode === "voice" 
                  ? "bg-brand-cyan/20 text-brand-cyan shadow-sm" 
                  : "text-gray-400 hover:text-gray-200"
              }`}
            >
              <Mic className="h-3.5 w-3.5" />
              Voice
            </button>
          </div>
          <button
            onClick={loadCsvDataset}
            disabled={isRefreshing}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-dark-border bg-dark-card px-3 text-sm font-medium text-gray-300 transition-colors hover:text-white"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[280px_minmax(0,1fr)_320px]">
        {/* Left Sidebar: Domains & Controls */}
        <aside className="space-y-6">
          <section className="glass-card space-y-4 rounded-2xl p-5">
            <h2 className="text-sm font-bold text-white flex items-center justify-between">
              <span>Select Domain</span>
              <span className="text-[10px] text-gray-500 uppercase tracking-wider">CSV Data</span>
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

          {/* Voice Preferences - Only show in Voice Mode */}
          {interviewMode === "voice" && (
            <section className="glass-card rounded-2xl p-5 space-y-4">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Sliders className="h-4 w-4 text-brand-cyan" />
                Voice Settings
              </h2>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-300">Auto-Read Question</span>
                  <button
                    onClick={() => setAutoSpeak(!autoSpeak)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      autoSpeak ? "bg-brand-cyan" : "bg-dark-border"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-dark-bg transition-transform ${
                        autoSpeak ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-gray-300">
                    <span>Voice Speed</span>
                    <span className="font-mono text-brand-cyan">{speechPace.toFixed(1)}x</span>
                  </div>
                  <input
                    type="range"
                    min="0.8"
                    max="1.3"
                    step="0.1"
                    value={speechPace}
                    onChange={(e) => setSpeechPace(parseFloat(e.target.value))}
                    className="w-full accent-brand-cyan cursor-pointer"
                  />
                </div>
              </div>
            </section>
          )}

          {/* Session Stats */}
          <section className="glass-card rounded-2xl p-5">
            <h2 className="mb-4 text-sm font-bold text-white">Session Stats</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs text-gray-500">Source</span>
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

        {/* Center Workspace: Interviewer */}
        <main className="glass-card flex min-h-[640px] flex-col overflow-hidden rounded-3xl border-dark-border/50">
          <div className="border-b border-dark-border bg-white/5 p-5">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-cyan/10">
                  <Target className="h-5 w-5 text-brand-cyan" />
                </div>
                <div>
                  <p className="text-sm font-bold text-white">{selectedDomain.name} Session</p>
                  <p className="text-[10px] font-medium uppercase tracking-widest text-gray-500">
                    Question {questionIndex + 1} of {selectedDomain.questions.length}
                  </p>
                </div>
              </div>

              {/* Status Indicator & TTS Button (Only in Voice Mode) */}
              {interviewMode === "voice" && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={isSpeaking ? stopSpeaking : () => speakQuestion()}
                    className={`inline-flex h-10 items-center gap-2 rounded-lg border px-3 text-xs font-bold transition-all ${
                      isSpeaking
                        ? "border-brand-purple/50 bg-brand-purple/20 text-brand-purple shadow-glow-purple"
                        : "border-dark-border bg-dark-card text-gray-200 hover:text-white"
                    }`}
                  >
                    {isSpeaking ? (
                      <>
                        <VolumeX className="h-4 w-4 text-brand-purple animate-pulse" />
                        Pause AI Voice
                      </>
                    ) : (
                      <>
                        <Volume2 className="h-4 w-4 text-brand-cyan" />
                        Listen to Question
                      </>
                    )}
                  </button>
                </div>
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
                className="space-y-4"
              >
                {/* Interviewer Question Box */}
                <div className="relative overflow-hidden rounded-2xl border border-dark-border bg-dark-card p-5">
                  {isSpeaking && interviewMode === "voice" && (
                    <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-brand-purple via-brand-cyan to-brand-purple animate-pulse" />
                  )}

                  <div className="mb-3 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-brand-cyan">
                      <Sparkles className="h-3.5 w-3.5" />
                      AI Technical Interviewer
                    </div>

                    {isSpeaking && interviewMode === "voice" && (
                      <div className="flex items-center gap-1 h-1">
                        <span className="text-[10px] font-mono text-brand-purple animate-pulse mr-1">AI Speaking...</span>
                        {[0, 1, 2, 3, 4].map((bar) => (
                          <motion.span
                            key={bar}
                            animate={{ height: ["4px", "16px", "6px", "14px", "4px"] }}
                            transition={{ repeat: Infinity, duration: 0.8, delay: bar * 0.15 }}
                            className="w-1 bg-brand-purple rounded-full inline-block"
                          />
                        ))}
                      </div>
                    )}
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

                {/* Speech Error Alert */}
                {speechError && interviewMode === "voice" && (
                  <div className="flex items-center gap-2 rounded-xl border border-brand-orange/30 bg-brand-orange/10 p-3 text-xs text-brand-orange">
                    <AlertTriangle className="h-4 w-4 shrink-0" />
                    <span>{speechError}</span>
                  </div>
                )}

                {/* Input Area */}
                <div className="rounded-2xl border border-dark-border bg-dark-bg/60 p-5 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <label className="text-sm font-bold text-white flex items-center gap-2">
                      <MessageSquare className="h-4 w-4 text-brand-cyan" />
                      {interviewMode === "voice" ? "Your Spoken Transcript" : "Your Answer"}
                    </label>

                    {/* Live Voice Metrics during recording/typing (Only in Voice Mode) */}
                    {interviewMode === "voice" && (
                      <div className="flex items-center gap-3 text-xs text-gray-400">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5 text-gray-500" />
                          <span className="font-mono text-gray-200">
                            {Math.floor(recordingSeconds / 60).toString().padStart(2, "0")}:
                            {(recordingSeconds % 60).toString().padStart(2, "0")}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-gray-500">Words:</span>
                          <span className="font-mono text-white">{wordCount}</span>
                        </div>
                        {wpm > 0 && (
                          <div className="flex items-center gap-1">
                            <span className="text-gray-500">Pace:</span>
                            <span className="font-mono text-brand-cyan">{wpm} WPM</span>
                          </div>
                        )}
                        {fillerCount > 0 && (
                          <div className="flex items-center gap-1">
                            <span className="text-gray-500">Fillers:</span>
                            <span className="font-mono text-brand-orange">{fillerCount}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <textarea
                    id="mock-answer-transcript"
                    value={transcript || selectedSession.answer}
                    onChange={(event) => {
                      const text = event.target.value;
                      setTranscript(text);
                      updateSelectedSession((session) => ({
                        ...session,
                        answer: text,
                      }));
                    }}
                    disabled={hasAnsweredCurrent}
                    placeholder={
                      interviewMode === "voice"
                        ? isRecording
                          ? "Listening to your voice... Speak clearly into your microphone."
                          : "Click 'Start Voice Recording' to speak your answer, or type directly..."
                        : "Type a structured answer: definition, key points, tradeoffs, and example."
                    }
                    className={`min-h-48 w-full resize-none rounded-xl border p-4 text-sm leading-6 outline-none transition-all placeholder:text-gray-600 ${
                      isRecording && interviewMode === "voice"
                        ? "border-brand-cyan/60 bg-brand-cyan/5 text-white ring-1 ring-brand-cyan/30"
                        : "border-dark-border bg-dark-card text-gray-200 focus:border-brand-cyan/50"
                    } disabled:cursor-not-allowed disabled:opacity-70`}
                  />

                  {/* Audio Wave Visualizer while Recording */}
                  {isRecording && interviewMode === "voice" && (
                    <div className="flex items-center justify-center gap-1.5 py-2">
                      <span className="text-xs font-medium text-brand-cyan animate-pulse h-6 mr-2">Recording Voice...</span>
                      {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((bar) => (
                        <motion.span
                          key={bar}
                          animate={{ height: ["6px", "24px", "8px", "20px", "6px"] }}
                          transition={{ repeat: Infinity, duration: 0.6, delay: bar * 0.08 }}
                          className="w-1 bg-brand-cyan rounded-full inline-block"
                        />
                      ))}
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    {interviewMode === "voice" && (
                      <button
                        onClick={isRecording ? stopRecording : startRecording}
                        disabled={hasAnsweredCurrent}
                        className={`inline-flex h-12 items-center justify-center gap-2.5 rounded-xl font-bold text-sm px-6 transition-all shadow-md ${
                          isRecording
                            ? "bg-red-500/20 text-red-400 border border-red-500/40 hover:bg-red-500/30 animate-pulse"
                            : "bg-dark-card text-white border border-dark-border hover:bg-dark-hover hover:border-brand-cyan/40"
                        } disabled:cursor-not-allowed disabled:opacity-50`}
                      >
                        {isRecording ? (
                          <>
                            <MicOff className="h-4 w-4 text-red-400" />
                            Stop Recording
                          </>
                        ) : (
                          <>
                            <Mic className="h-4 w-4 text-brand-cyan" />
                            Start Voice Recording
                          </>
                        )}
                      </button>
                    )}

                    <button
                      onClick={submitAnswer}
                      disabled={!currentText.trim() || hasAnsweredCurrent}
                      className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-brand-cyan px-5 text-sm font-bold text-dark-bg shadow-glow-cyan transition-all hover:bg-brand-cyan/90 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <Send className="h-4 w-4" />
                      {interviewMode === "voice" ? "Submit & Review Spoken Answer" : "Submit Answer"}
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
                </div>
              </motion.section>
            </AnimatePresence>
          </div>
        </main>

        {/* Right Sidebar: Evaluation Feedback */}
        <aside className="space-y-6">
          <section className="glass-card rounded-2xl border-brand-purple/20 bg-gradient-to-br from-brand-purple/10 to-transparent p-5">
            <h2 className="mb-4 flex items-center gap-2 text-sm font-bold text-white">
              <Brain className="h-4 w-4 text-brand-purple" />
              {interviewMode === "voice" ? "Voice Evaluation" : "Evaluation"}
            </h2>

            {currentEvaluation ? (
              <div className="space-y-4">
                {/* Score badge */}
                <div className="rounded-xl border border-white/5 bg-white/5 p-3 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-bold uppercase text-brand-cyan">
                      {interviewMode === "voice" ? "Voice & Tech Score" : "Score"}
                    </p>
                    <p className="text-2xl font-bold text-white">{currentEvaluation.score}/10</p>
                    <p className="text-xs text-gray-400">{currentEvaluation.overallLabel}</p>
                  </div>
                  {currentEvaluation.voiceStats && (
                    <div className="text-right font-mono text-xs text-gray-400">
                      <p>{currentEvaluation.voiceStats.wordCount} words</p>
                      <p className="text-brand-cyan">{currentEvaluation.voiceStats.wpm} WPM</p>
                      <p className="text-brand-orange">{currentEvaluation.voiceStats.fillerCount} fillers</p>
                    </div>
                  )}
                </div>

                {/* Summary */}
                <div className="rounded-xl border border-white/5 bg-white/5 p-3">
                  <p className="mb-1 text-[10px] font-bold uppercase text-brand-purple">Interviewer Evaluation</p>
                  <p className="text-xs leading-5 text-gray-300">{currentEvaluation.summary}</p>
                </div>

                {/* Rubric */}
                <div>
                  <p className="mb-2 text-[10px] font-bold uppercase text-brand-cyan">Rubric Breakdown</p>
                  <div className="space-y-3">
                    {Object.entries({
                      Relevance: { val: currentEvaluation.rubric.relevance, max: 3 },
                      ...(currentEvaluation.rubric.clarityPacing !== undefined 
                        ? { "Clarity & Pacing": { val: currentEvaluation.rubric.clarityPacing, max: 2 } } 
                        : {}),
                      ...(currentEvaluation.rubric.depth !== undefined 
                        ? { "Depth": { val: currentEvaluation.rubric.depth, max: 2 } } 
                        : {}),
                      "Specificity": { val: currentEvaluation.rubric.specificity, max: 2 },
                      "Structure": { val: currentEvaluation.rubric.structure, max: 1.5 },
                      ...(currentEvaluation.rubric.confidenceTone !== undefined 
                        ? { "Confidence & Tone": { val: currentEvaluation.rubric.confidenceTone, max: 1 } } 
                        : {}),
                      ...(currentEvaluation.rubric.professionalism !== undefined 
                        ? { "Professionalism": { val: currentEvaluation.rubric.professionalism, max: 1 } } 
                        : {}),
                      "Reference Alignment": { val: currentEvaluation.rubric.referenceAlignment, max: 0.5 },
                    }).map(([label, info]) => (
                      <div key={label} className="space-y-1.5">
                        <div className="flex justify-between text-[10px]">
                          <span className="text-gray-400">{label}</span>
                          <span className="text-white">{toPercent(info.val, info.max)}%</span>
                        </div>
                        <div className="h-1.5 overflow-hidden rounded-full bg-dark-bg">
                          <div
                            className="h-full bg-brand-cyan shadow-glow-cyan"
                            style={{ width: `${toPercent(info.val, info.max)}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Strengths */}
                <div>
                  <p className="mb-2 text-[10px] font-bold uppercase text-brand-green">
                    {interviewMode === "voice" ? "Spoken Strengths" : "Strengths"}
                  </p>
                  <ul className="space-y-1.5 text-xs leading-5 text-gray-300">
                    {currentEvaluation.strengths.map((strength) => (
                      <li key={strength} className="flex items-start gap-1.5">
                        <span className="text-brand-green font-bold">•</span>
                        <span>{strength}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Areas for Improvement */}
                <div>
                  <p className="mb-2 text-[10px] font-bold uppercase text-brand-orange">
                    {interviewMode === "voice" ? "Vocal Improvements" : "Areas for Improvement"}
                  </p>
                  <ul className="space-y-1.5 text-xs leading-5 text-gray-300">
                    {currentEvaluation.improvements.map((improvement) => (
                      <li key={improvement} className="flex items-start gap-1.5">
                        <span className="text-brand-orange font-bold">•</span>
                        <span>{improvement}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Optional Cues */}
                <div>
                  <p className="mb-2 text-[10px] font-bold uppercase text-brand-purple">Recommended Tech Concepts</p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {currentEvaluation.optionalCues.length ? (
                      currentEvaluation.optionalCues.map((cue) => (
                        <span key={cue} className="rounded-full bg-brand-purple/10 px-2.5 py-1 text-[11px] text-brand-purple">
                          {cue}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-gray-500">All core concepts covered!</span>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-sm leading-6 text-gray-400">
                {interviewMode === "voice" 
                  ? <span>Click <strong className="text-brand-cyan font-medium">Start Voice Recording</strong> or type your answer and submit to analyze your vocal clarity, pacing, tech relevance, and structure.</span>
                  : <span>Submit your typed answer to get a fair score based on relevance, clarity, detail, examples, structure, and professionalism.</span>
                }
              </p>
            )}
          </section>

          {/* Answered Questions History */}
          <section className="glass-card rounded-2xl p-5">
            <h2 className="mb-4 text-sm font-bold text-white">Answered Questions</h2>
            <div className="space-y-3">
              {records.length ? (
                records.map((record, index) => (
                  <div key={`${record.question.id}-${index}`} className="flex items-start gap-3 rounded-xl border border-white/5 bg-white/5 p-3">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-brand-green" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-medium text-white">{record.question.question}</p>
                      <div className="mt-1 flex items-center justify-between text-[11px] text-gray-500">
                        <span>Score: {record.evaluation.score}/10</span>
                        {record.evaluation.voiceStats && (
                          <span className="font-mono text-brand-cyan">{record.evaluation.voiceStats.wpm} WPM</span>
                        )}
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
