"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Target, 
  Map, 
  Building2, 
  Code2, 
  Layers, 
  Laptop, 
  BrainCircuit, 
  MessageSquare,
  ArrowRight,
  ChevronLeft,
  Sparkles,
  CheckCircle2,
  Activity,
  BarChart3,
  Globe,
  AlertCircle
} from "lucide-react";
import Link from "next/link";

interface PredictionResult {
  readiness: string;
  readiness_confidence: Record<string, number>;
  domain_mapping: Record<string, number>;
}

const steps = [
  {
    id: 1,
    title: "Phase 1: Awareness & Aspiration",
    subtitle: "What do you know about yourself and your goals?",
    questions: [
      {
        id: "readiness",
        label: "Q1: What is your current readiness level?",
        options: ["Just Starting", "Learning Basics", "Actively Practicing", "Ready for Interviews"],
        icon: Target
      },
      {
        id: "domain",
        label: "Q2: Which domain interests you the most?",
        options: ["Web Development", "Data Science", "Full Stack", "Mobile App", "Cloud/DevOps", "Cyber Security", "Not Decided"],
        icon: Map
      },
      {
        id: "target",
        label: "Q3: What type of company is your target?",
        options: ["Product-based", "Service-based", "Startup", "Mass Recruiter"],
        icon: Building2
      }
    ]
  },
  {
    id: 2,
    title: "Phase 2: Technical & Project Depth",
    subtitle: "Your actual technical skill and experience.",
    questions: [
      {
        id: "strength",
        label: "Q4: What is your core CS strength?",
        options: ["DSA", "DBMS", "OS", "Networking", "None"],
        icon: Code2
      },
      {
        id: "platform",
        label: "Q5: Which coding platform do you use most?",
        options: ["LeetCode", "HackerRank", "GeeksforGeeks", "CodeChef", "Never tried"],
        icon: Laptop
      },
      {
        id: "exposure",
        label: "Q6: What is your project exposure level?",
        options: ["Zero", "1 basic", "2+ projects", "Major Internship"],
        icon: Layers
      }
    ]
  },
  {
    id: 3,
    title: "Phase 3: Aptitude & Soft Skills",
    subtitle: "Problem-solving and communication readiness.",
    questions: [
      {
        id: "aptitude",
        label: "Q7: How would you rate your aptitude level?",
        options: ["Poor", "Average", "Good", "Excellent"],
        icon: BrainCircuit
      },
      {
        id: "comm",
        label: "Q8: What is your communication confidence?",
        options: ["Very Nervous", "Nervous", "Need Practice", "Fairly Confident", "Very Confident"],
        icon: MessageSquare
      }
    ]
  },
  {
    id: 4,
    title: "Phase 4: Roadmap Customization",
    subtitle: "Customize your prep track style and timeline.",
    questions: [
      {
        id: "preferredLang",
        label: "Q9: What is your preferred programming language?",
        options: ["C++", "Java", "Python", "JavaScript", "C"],
        icon: Code2
      },
      {
        id: "dailyStudyTime",
        label: "Q10: How much time can you commit daily?",
        options: ["<1 hour", "1-2 hours", "2-3 hours", "3-5 hours", "5+ hours"],
        icon: Laptop
      },
      {
        id: "placementTimeline",
        label: "Q11: What is your preparation timeline?",
        options: ["1 Month", "45 Days", "2 Months", "3 Months", "6 Months"],
        icon: Target
      }
    ]
  }
];

export default function ProfilingPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isCompleted, setIsCompleted] = useState(false);
  const [isPredicting, setIsPredicting] = useState(false);
  const [predictionResult, setPredictionResult] = useState<PredictionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Check if user already has an active roadmap
  const [existingProfile, setExistingProfile] = useState<{ domain: string | null; day: number } | null>(null);
  const [checkingExisting, setCheckingExisting] = useState(true);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    fetch("/api/roadmap")
      .then((res) => res.json())
      .then((data) => {
        if (data?.user?.domainInterest || data?.roadmap) {
          setExistingProfile({
            domain: data.user?.domainInterest || "Placement",
            day: data.user?.currentDay || 1,
          });
        }
      })
      .catch(() => {})
      .finally(() => setCheckingExisting(false));
  }, []);

  const handleExitExistingRoadmap = async () => {
    setIsExiting(true);
    try {
      const res = await fetch("/api/roadmap/exit", { method: "POST" });
      if (res.ok) {
        setExistingProfile(null);
        setCurrentStep(0);
        setAnswers({});
      } else {
        alert("Failed to exit roadmap. Please try again.");
      }
    } catch (err) {
      console.error(err);
      alert("Error exiting roadmap.");
    } finally {
      setIsExiting(false);
    }
  };

  const handleOptionSelect = (questionId: string, option: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: option }));
  };

  const getPrediction = async () => {
    setIsPredicting(true);
    setError(null);
    try {
      const response = await fetch('/api/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(answers),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to compile prediction");
      }
      const data = await response.json();
      setPredictionResult(data);
    } catch (err: any) {
      console.error("Prediction failed:", err);
      setError(err.message || "An unexpected error occurred");
    } finally {
      setIsPredicting(false);
      setIsCompleted(true);
    }
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      getPrediction();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const isStepComplete = () => {
    const currentStepQuestions = steps[currentStep].questions;
    return currentStepQuestions.every(q => answers[q.id]);
  };

  const progress = ((currentStep + 1) / steps.length) * 100;

  if (checkingExisting) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 space-y-4">
        <div className="w-10 h-10 border-4 border-brand-cyan/20 border-t-brand-cyan rounded-full animate-spin" />
        <p className="text-gray-400 text-xs">Checking active roadmap status...</p>
      </div>
    );
  }

  if (existingProfile) {
    return (
      <div className="max-w-2xl mx-auto py-20 px-6 text-center space-y-8">
        <div className="w-20 h-20 bg-brand-cyan/10 border border-brand-cyan/20 rounded-3xl flex items-center justify-center mx-auto text-brand-cyan shadow-glow-cyan/25">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <div className="space-y-3">
          <span className="text-[10px] font-bold text-brand-cyan bg-brand-cyan/10 border border-brand-cyan/20 px-3 py-1 rounded-full uppercase tracking-wider">
            Active Roadmap Found
          </span>
          <h2 className="text-3xl font-bold text-white tracking-tight">You Already Have an Active Roadmap!</h2>
          <p className="text-sm text-gray-400 max-w-md mx-auto leading-relaxed">
            You are currently on <strong className="text-white">Day {existingProfile.day}</strong> of your <strong className="text-brand-cyan">{existingProfile.domain}</strong> preparation track. You do not need to take another profiling unless you want to discontinue your active roadmap.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
          <Link
            href="/roadmap"
            className="px-6 py-3.5 bg-brand-cyan text-dark-bg font-bold rounded-2xl flex items-center justify-center gap-2 hover:bg-brand-cyan/90 transition-all shadow-glow-cyan"
          >
            <Map className="w-4 h-4 text-dark-bg" />
            Continue to Current Roadmap
          </Link>
          <button
            onClick={handleExitExistingRoadmap}
            disabled={isExiting}
            className="px-6 py-3.5 bg-dark-card border border-red-500/30 text-red-400 font-bold rounded-2xl flex items-center justify-center gap-2 hover:bg-red-500/10 transition-all"
          >
            {isExiting ? "Discontinuing..." : "Exit Roadmap & Take New Assessment"}
          </button>
        </div>
      </div>
    );
  }

  if (isPredicting) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 space-y-8">
        <div className="relative">
          <div className="w-24 h-24 border-4 border-brand-cyan/20 border-t-brand-cyan rounded-full animate-spin" />
          <BrainCircuit className="w-10 h-10 text-brand-cyan absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
        </div>
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-white">Analyzing Your Profile</h2>
        </div>
      </div>
    );
  }

  if (isCompleted && error) {
    return (
      <div className="max-w-xl mx-auto py-24 px-6 text-center space-y-8">
        <div className="w-20 h-20 bg-brand-red/10 border border-brand-red/20 rounded-3xl flex items-center justify-center mx-auto text-brand-red shadow-glow-red/25">
          <AlertCircle className="w-10 h-10" />
        </div>
        <div className="space-y-3">
          <h1 className="text-2xl font-bold text-white">Analysis Failed</h1>
          <p className="text-gray-400 max-w-sm mx-auto leading-relaxed">
            {error}
          </p>
        </div>
        <button
          onClick={() => {
            setIsCompleted(false);
            setError(null);
            getPrediction();
          }}
          className="inline-flex items-center gap-2 px-6 py-3 bg-brand-cyan text-dark-bg font-bold rounded-xl hover:bg-brand-cyan/90 transition-all shadow-glow-cyan"
        >
          Retry Analysis
        </button>
      </div>
    );
  }

  if (isCompleted && predictionResult) {
    // Sort domain mapping by probability
    const topDomains = Object.entries(predictionResult.domain_mapping || {})
      .sort(([, a], [, b]) => (b as number) - (a as number))
      .slice(0, 6) as [string, number][];

    const confidence = Math.round((predictionResult.readiness_confidence?.[predictionResult.readiness] || 0) * 100);
    const topDomain  = topDomains[0]?.[0] ?? answers.domain ?? "Full Stack";

    const readinessColors: Record<string, string> = {
      "Just Starting":         "text-brand-red",
      "Learning Basics":       "text-brand-orange",
      "Actively Practicing":   "text-brand-cyan",
      "Ready for Interviews":  "text-brand-green",
    };
    const rlColor = readinessColors[predictionResult.readiness] ?? "text-brand-cyan";

    return (
      <div className="max-w-3xl mx-auto py-10 px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="w-16 h-16 bg-brand-cyan/10 border border-brand-cyan/20 rounded-2xl flex items-center justify-center text-brand-cyan shrink-0">
              <Sparkles className="w-8 h-8" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-brand-cyan uppercase tracking-widest bg-brand-cyan/10 px-2.5 py-1 rounded-lg inline-flex items-center gap-1 mb-1">
                <Activity className="w-3 h-3" /> AI Analysis Complete
              </span>
              <h1 className="text-2xl sm:text-3xl font-bold text-white leading-tight">Your Career Readiness Report</h1>
            </div>
          </div>

          {/* Readiness level + top domain */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="glass-card p-5 rounded-2xl space-y-3">
              <div className="flex items-center gap-2 text-brand-cyan">
                <Target className="w-4 h-4" />
                <span className="text-[10px] font-bold uppercase tracking-widest">Readiness Level</span>
              </div>
              <p className={`text-2xl font-bold ${rlColor}`}>{predictionResult.readiness}</p>
              <div className="space-y-1.5">
                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${confidence}%` }}
                    transition={{ duration: 0.9 }}
                    className="h-full bg-brand-cyan rounded-full"
                  />
                </div>
                <p className="text-[11px] text-gray-500">AI Confidence: <span className="text-white font-bold">{confidence}%</span></p>
              </div>
            </div>

            <div className="glass-card p-5 rounded-2xl space-y-3">
              <div className="flex items-center gap-2 text-brand-orange">
                <Target className="w-4 h-4" />
                <span className="text-[10px] font-bold uppercase tracking-widest">Best Fit Domain</span>
              </div>
              <p className="text-2xl font-bold text-white">{topDomain}</p>
              <div className="flex flex-wrap gap-1.5">
                {(answers.target) && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-brand-orange/10 border border-brand-orange/20 text-brand-orange">
                    {answers.target}
                  </span>
                )}
                {(answers.preferredLang) && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-brand-blue/10 border border-brand-blue/20 text-brand-blue">
                    {answers.preferredLang}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Domain probability bars */}
          {topDomains.length > 0 && (
            <div className="glass-card p-5 rounded-2xl space-y-4">
              <div className="flex items-center gap-2 text-brand-purple">
                <BarChart3 className="w-4 h-4" />
                <span className="text-[10px] font-bold uppercase tracking-widest">Domain Probability Distribution</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {topDomains.map(([domain, score]) => (
                  <div key={domain} className="space-y-1.5">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-gray-300 font-medium">{domain}</span>
                      <span className="text-white font-bold">{Math.round((score as number) * 100)}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(score as number) * 100}%` }}
                        transition={{ duration: 0.7, delay: 0.1 }}
                        className="h-full bg-gradient-to-r from-brand-purple/70 to-brand-blue/70 rounded-full"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Profile summary */}
          <div className="glass-card p-5 rounded-2xl">
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3">Your Profile Summary</p>
            <div className="flex flex-wrap gap-2">
              {[
                { label: answers.readiness, color: "text-brand-cyan bg-brand-cyan/10 border-brand-cyan/20" },
                { label: answers.strength && `Strength: ${answers.strength}`, color: "text-brand-teal bg-brand-teal/10 border-brand-teal/20" },
                { label: answers.platform, color: "text-brand-blue bg-brand-blue/10 border-brand-blue/20" },
                { label: answers.aptitude && `Aptitude: ${answers.aptitude}`, color: "text-brand-purple bg-brand-purple/10 border-brand-purple/20" },
                { label: answers.comm, color: "text-brand-orange bg-brand-orange/10 border-brand-orange/20" },
                { label: answers.placementTimeline, color: "text-brand-green bg-brand-green/10 border-brand-green/20" },
              ].filter(t => t.label).map((t, i) => (
                <span key={i} className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${t.color}`}>
                  {t.label}
                </span>
              ))}
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              onClick={() => { window.location.href = "/roadmap"; }}
              className="flex items-center justify-center gap-2 py-4 bg-brand-cyan text-dark-bg font-bold rounded-2xl hover:bg-brand-cyan/90 active:scale-95 transition-all shadow-glow-cyan group cursor-pointer"
            >
              <Map className="w-5 h-5 group-hover:rotate-12 transition-transform" />
              View My Roadmap
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={() => { window.location.href = "/"; }}
              className="flex items-center justify-center gap-2 py-4 bg-white/5 text-white font-bold rounded-2xl border border-white/10 hover:bg-white/10 active:scale-95 transition-all cursor-pointer"
            >
              Return to Dashboard
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-12 px-6">
      {/* Progress Bar */}
      <div className="mb-12 space-y-4">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-brand-cyan animate-pulse" />
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">ML Backend Connected</span>
          </div>
          <div className="flex items-center gap-2 text-brand-orange">
            <Globe className="w-3 h-3" />
            <span className="text-[10px] font-bold uppercase tracking-widest">v2.1 Optimized</span>
          </div>
        </div>
        <div className="flex justify-between items-end">
          <div>
            <span className="text-[10px] font-bold text-brand-cyan uppercase tracking-widest bg-brand-cyan/10 px-2 py-1 rounded-md">Step {currentStep + 1} of {steps.length}</span>
            <h2 className="text-3xl font-bold text-white mt-2">{steps[currentStep].title}</h2>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500 font-medium">Completion Progress</p>
            <p className="text-lg font-bold text-white">{Math.round(progress)}%</p>
          </div>
        </div>
        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            className="h-full bg-gradient-to-r from-brand-cyan to-brand-blue shadow-glow-cyan"
          />
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="space-y-10"
        >
          {steps[currentStep].questions.map((q) => (
            <div key={q.id} className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-white/5 text-brand-cyan">
                  <q.icon className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-bold text-white">{q.label}</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {q.options.map((option) => (
                  <button
                    key={option}
                    suppressHydrationWarning
                    onClick={() => handleOptionSelect(q.id, option)}
                    className={`
                      p-4 rounded-2xl text-left transition-all border group relative overflow-hidden
                      ${answers[q.id] === option 
                        ? 'bg-brand-cyan/10 border-brand-cyan text-white' 
                        : 'bg-dark-card border-white/5 text-gray-400 hover:border-white/10 hover:bg-white/5'}
                    `}
                  >
                    <div className="flex items-center justify-between relative z-10">
                      <span className="font-medium">{option}</span>
                      {answers[q.id] === option && (
                        <CheckCircle2 className="w-5 h-5 text-brand-cyan" />
                      )}
                    </div>
                    {answers[q.id] === option && (
                      <motion.div 
                        layoutId="active-bg"
                        className="absolute inset-0 bg-gradient-to-r from-brand-cyan/5 to-transparent pointer-events-none"
                      />
                    )}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div className="mt-12 flex items-center justify-between border-t border-white/5 pt-8">
        <button
          onClick={handlePrev}
          disabled={currentStep === 0}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${currentStep === 0 ? 'opacity-0 pointer-events-none' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
        >
          <ChevronLeft className="w-5 h-5" /> Previous Phase
        </button>

        <button
          onClick={handleNext}
          disabled={!isStepComplete()}
          className={`
            flex items-center gap-2 px-8 py-3 rounded-xl font-bold transition-all
            ${isStepComplete() 
              ? 'bg-brand-cyan text-dark-bg shadow-glow-cyan hover:scale-[1.02]' 
              : 'bg-white/5 text-gray-600 cursor-not-allowed'}
          `}
        >
          {currentStep === steps.length - 1 ? 'Complete Profiling' : 'Next Phase'} 
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>

      {/* Info Card */}
      <div className="mt-12 p-6 rounded-2xl bg-brand-cyan/5 border border-brand-cyan/10 flex items-start gap-4">
        <Sparkles className="w-6 h-6 text-brand-cyan shrink-0 mt-1" />
        <div className="space-y-1">
          <p className="text-sm font-bold text-white">Why this matters?</p>
          <p className="text-xs text-gray-500 leading-relaxed">
            Your answers help our AI engine tailor your roadmap, select the right mock interview intensity, and recommend resources that match your current technical depth.
          </p>
        </div>
      </div>
    </div>
  );
}
