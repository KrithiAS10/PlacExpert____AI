"use client";

import { useState } from "react";
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
  Globe
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
  }
];

export default function ProfilingPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isCompleted, setIsCompleted] = useState(false);
  const [isPredicting, setIsPredicting] = useState(false);
  const [predictionResult, setPredictionResult] = useState<PredictionResult | null>(null);

  const handleOptionSelect = (questionId: string, option: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: option }));
  };

  const getPrediction = async () => {
    setIsPredicting(true);
    try {
      const response = await fetch('/api/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(answers),
      });
      const data = await response.json();
      setPredictionResult(data);
    } catch (err) {
      console.error("Prediction failed:", err);
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

  if (isPredicting) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 space-y-8">
        <div className="relative">
          <div className="w-24 h-24 border-4 border-brand-cyan/20 border-t-brand-cyan rounded-full animate-spin" />
          <BrainCircuit className="w-10 h-10 text-brand-cyan absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
        </div>
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-white">Analyzing Your Profile</h2>
          <p className="text-gray-400">Our XGBoost ML model is processing your answers...</p>
        </div>
      </div>
    );
  }

  if (isCompleted && predictionResult) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-10 rounded-[32px] border-white/10 space-y-10"
        >
          <div className="flex flex-col md:flex-row gap-8 items-center md:items-start text-center md:text-left">
            <div className="w-24 h-24 bg-brand-cyan/20 rounded-3xl flex items-center justify-center text-brand-cyan shrink-0 shadow-glow-cyan/20">
              <Sparkles className="w-12 h-12" />
            </div>
            <div className="space-y-2 flex-1">
              <div className="flex items-center gap-2 justify-center md:justify-start">
                <span className="text-[10px] font-bold text-brand-cyan uppercase tracking-widest bg-brand-cyan/10 px-2 py-1 rounded-md flex items-center gap-1">
                  <Activity className="w-3 h-3" /> AI Analysis Complete
                </span>
              </div>
              <h1 className="text-4xl font-bold text-white">Your Career Readiness Score</h1>
              <p className="text-gray-400">Based on our advanced predictive analytics, here is your current standing and recommended focus areas.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-3xl bg-white/5 border border-white/5 space-y-4">
              <div className="flex items-center gap-3 text-brand-cyan">
                <Target className="w-5 h-5" />
                <h3 className="font-bold uppercase text-[10px] tracking-widest">Readiness Level</h3>
              </div>
              <p className="text-2xl font-bold text-white capitalize">{predictionResult.readiness}</p>
              <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-brand-cyan" 
                  style={{ width: `${(predictionResult.readiness_confidence?.[predictionResult.readiness] || 0) * 100}%` }}
                />
              </div>
              <p className="text-[10px] text-gray-500 font-medium">
                AI Confidence: {Math.round((predictionResult.readiness_confidence?.[predictionResult.readiness] || 0) * 100)}%
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-white/5 border border-white/5 space-y-4 md:col-span-2">
              <div className="flex items-center gap-3 text-brand-orange">
                <BarChart3 className="w-5 h-5" />
                <h3 className="font-bold uppercase text-[10px] tracking-widest">Domain Interest Probability</h3>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {Object.entries(predictionResult.domain_mapping || {})
                  .sort(([, a], [, b]) => (b as number) - (a as number))
                  .slice(0, 6)
                  .map(([domain, score]) => (
                    <div key={domain} className="space-y-1">
                      <div className="flex justify-between text-[10px]">
                        <span className="text-gray-400 font-medium">{domain}</span>
                        <span className="text-white font-bold">{Math.round((score as number) * 100)}%</span>
                      </div>
                      <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full bg-brand-orange/40" style={{ width: `${(score as number) * 100}%` }} />
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Link 
              href="/roadmap"
              className="flex items-center justify-center gap-3 py-5 bg-brand-cyan text-dark-bg font-bold rounded-2xl hover:bg-brand-cyan/90 transition-all shadow-glow-cyan group"
            >
              <Map className="w-5 h-5 group-hover:rotate-12 transition-transform" />
              View Custom Roadmap
            </Link>
            <Link 
              href="/"
              className="flex items-center justify-center gap-3 py-5 bg-white/5 text-white font-bold rounded-2xl border border-white/10 hover:bg-white/10 transition-all"
            >
              Return to Dashboard
            </Link>
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
            <span className="text-[10px] font-bold text-brand-cyan uppercase tracking-widest bg-brand-cyan/10 px-2 py-1 rounded-md">Step {currentStep + 1} of 3</span>
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
