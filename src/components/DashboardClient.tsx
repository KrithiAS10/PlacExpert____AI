"use client";

import { motion } from "framer-motion";
import { 
  Zap, 
  Target, 
  TrendingUp, 
  Clock, 
  Play,
  ArrowRight,
  Award,
  BookOpen,
  MessageSquare,
  PlayCircle
} from "lucide-react";
import Link from "next/link";
import { ReadinessChart } from "@/app/roadmap/components/ReadinessChart";

interface Activity {
  id: string;
  action: string;
  timestamp: Date | string;
  status?: string | null;
}

interface Task {
  id: string;
  title: string;
  description: string | null;
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

interface User {
  name: string | null;
  readinessScore: number;
  streak: number;
  currentDay: number;
  domainInterest?: string | null;
  activities: Activity[];
  roadmaps?: Roadmap[];
  analytics?: any[];
}

interface Recommendation {
  id: string;
  title: string;
  type: string;
  duration?: string | null;
  url: string;
}

interface DashboardClientProps {
  user: User | null;
  recommendations: Recommendation[];
}

export function DashboardClient({ user, recommendations }: DashboardClientProps) {
  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh] space-y-4">
        <div className="w-10 h-10 border-4 border-brand-cyan/20 border-t-brand-cyan rounded-full animate-spin" />
        <p className="text-gray-400 text-xs">Loading dashboard data...</p>
      </div>
    );
  }

  const isNewUser = !user.readinessScore && user.streak === 0 && user.currentDay === 1;

  // Flatten all tasks from roadmaps
  const allTasks = user.roadmaps?.flatMap(rm => 
    rm.phases.flatMap(ph => 
      ph.tasks
    )
  ) || [];

  const completedTasks = allTasks.filter(t => t.status === "COMPLETED");

  // Calculate study hours dynamically
  const calculatedStudyHours = completedTasks.reduce((total, task) => {
    if (task.type === "PROBLEM") return total + 0.5; // 30 mins
    if (task.type === "MOCK") return total + 1.0; // 60 mins
    return total + 1.5; // TOPIC - 90 mins
  }, 0);

  const hasAttendedTasks = completedTasks.length > 0;

  const stats = [
    { 
      label: "Readiness Score", 
      value: !hasAttendedTasks || !user.readinessScore || user.readinessScore === 0 ? "Yet to start" : `${user.readinessScore.toFixed(1)}/10`, 
      sub: !hasAttendedTasks || !user.readinessScore || user.readinessScore === 0 ? "Attend tasks to calculate" : "Based on task performance", 
      icon: Target, 
      color: "text-brand-cyan" 
    },
    { 
      label: "Daily Streak", 
      value: !hasAttendedTasks && user.streak === 0 ? "0 Days" : `${user.streak} Days`, 
      sub: !hasAttendedTasks ? "Start prep today" : "Active Streak", 
      icon: Zap, 
      color: "text-brand-orange" 
    },
    { 
      label: "Hours Logged", 
      value: !hasAttendedTasks ? "0h" : `${calculatedStudyHours.toFixed(1)}h`, 
      sub: !hasAttendedTasks ? "No session active" : "Estimated", 
      icon: Clock, 
      color: "text-brand-purple" 
    },
    { 
      label: "Roadmap Progress", 
      value: isNewUser ? "Yet to start" : `Day ${user.currentDay}`, 
      sub: isNewUser ? "Profiling pending" : "On Track", 
      icon: Award, 
      color: "text-brand-teal" 
    },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-12">
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">
            Welcome back, <span className="bg-gradient-to-r from-brand-cyan to-brand-blue bg-clip-text text-transparent">{(user.name || 'User').split(' ')[0]}</span>
          </h1>
          <p className="text-gray-400 text-sm font-medium">
            {isNewUser 
              ? "Start your placement preparation journey today!" 
              : `You are on Day ${user.currentDay} of your roadmap. Keep the momentum!`
            }
          </p>
        </div>
        <div className="flex gap-3">
          {isNewUser ? (
            <Link href="/profiling" className="px-5 py-2.5 bg-brand-cyan text-dark-bg text-sm font-bold rounded-xl flex items-center gap-2 hover:bg-brand-cyan/90 transition-all shadow-glow-cyan">
              <Play className="w-4 h-4 fill-dark-bg" />
              Start Profiling
            </Link>
          ) : (
            <Link href="/roadmap" className="px-5 py-2.5 bg-brand-cyan text-dark-bg text-sm font-bold rounded-xl flex items-center gap-2 hover:bg-brand-cyan/90 transition-all shadow-glow-cyan">
              <Play className="w-4 h-4 fill-dark-bg" />
              Resume Roadmap
            </Link>
          )}
          <Link href="/mock-interview" className="px-5 py-2.5 bg-dark-card border border-dark-border text-white text-sm font-bold rounded-xl flex items-center gap-2 hover:bg-dark-hover transition-all">
            <MessageSquare className="w-4 h-4" />
            Quick Interview
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <motion.div 
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass-card p-6 rounded-3xl border-white/5 relative overflow-hidden group hover:border-white/10 transition-all"
          >
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-2xl bg-white/5 ${stat.color}`}>
                <stat.icon className="w-5 h-5" />
              </div>
              <ArrowRight className="w-4 h-4 text-gray-700 group-hover:text-gray-400 transition-colors" />
            </div>
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">{stat.label}</p>
            <h3 className="text-2xl font-bold text-white mb-1">{stat.value}</h3>
            <p className="text-[11px] text-gray-500">{stat.sub}</p>
          </motion.div>
        ))}
      </div>

      {/* Main Grid: Charts & Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Progress Chart */}
        <div className="lg:col-span-2 glass-card p-8 rounded-[32px] border-white/5 flex flex-col">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-brand-cyan" />
                Readiness Progression
              </h3>
              <p className="text-xs text-gray-500 mt-1">Daily skill growth tracking (Live from DB)</p>
            </div>
            <Link href="/analytics" className="text-xs font-bold text-brand-cyan hover:underline uppercase tracking-widest">
              Full Report
            </Link>
          </div>
          <div className="flex-1 min-h-[250px]">
            {isNewUser ? (
              <div className="flex flex-col items-center justify-center h-full text-center p-6 bg-black/10 rounded-2xl border border-white/[0.03]">
                <p className="text-xs text-gray-500 italic">No progress data available yet. Please complete your profiling and begin roadmap tasks to view chart data.</p>
              </div>
            ) : (
              <ReadinessChart score={user.readinessScore} analytics={user.analytics} />
            )}
          </div>
        </div>

        {/* Next Task Card */}
        <div className="glass-card p-8 rounded-[32px] border-white/5 bg-gradient-to-br from-brand-cyan/10 to-transparent relative overflow-hidden">
          <div className="absolute -top-4 -right-4 w-24 h-24 bg-brand-cyan/5 blur-3xl"></div>
          {isNewUser ? (
            <div className="relative z-10 flex flex-col h-full">
              <span className="text-[10px] font-bold text-brand-cyan border border-brand-cyan/20 bg-brand-cyan/5 px-2 py-0.5 rounded-full w-fit mb-6">STEP 1 — ONBOARDING</span>
              <h3 className="text-2xl font-bold text-white mb-2">Setup Preparation</h3>
              <p className="text-sm text-gray-400 leading-relaxed mb-8 flex-1">
                Answer career-related questions to let our ML engine generate your personalized placement roadmap.
              </p>
              <div className="space-y-4">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Resource</span>
                  <span className="text-brand-orange font-bold">Assessment</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Duration</span>
                  <span className="text-white font-medium">5 mins</span>
                </div>
                <Link href="/profiling" className="w-full py-4 bg-brand-cyan text-dark-bg font-bold rounded-2xl flex items-center justify-center gap-2 hover:bg-brand-cyan/90 transition-all shadow-glow-cyan">
                  Start Profiling
                </Link>
              </div>
            </div>
          ) : (
            <div className="relative z-10 flex flex-col h-full">
              <span className="text-[10px] font-bold text-brand-cyan border border-brand-cyan/20 bg-brand-cyan/5 px-2 py-0.5 rounded-full w-fit mb-6">NEXT UP — DAY {user.currentDay}</span>
              <h3 className="text-2xl font-bold text-white mb-2">DSA Basics</h3>
              <p className="text-sm text-gray-400 leading-relaxed mb-8 flex-1">
                Focus on your active roadmap tasks. Complete today&apos;s challenges to maintain your streak.
              </p>
              <div className="space-y-4">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Resource</span>
                  <span className="text-brand-orange font-bold">In-App</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Duration</span>
                  <span className="text-white font-medium">90 mins</span>
                </div>
                <Link href="/roadmap" className="w-full py-4 bg-brand-cyan text-dark-bg font-bold rounded-2xl flex items-center justify-center gap-2 hover:bg-brand-cyan/90 transition-all shadow-glow-cyan">
                  View Roadmap
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* AI Video Recommendations — domain-specific YouTube links */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <PlayCircle className="w-5 h-5 text-[#FF0000]" />
            AI Video Recommendations
          </h3>
          {user.domainInterest && (
            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-brand-cyan/10 border border-brand-cyan/20 text-brand-cyan uppercase tracking-wider">
              {user.domainInterest} Track
            </span>
          )}
        </div>

        {!user.domainInterest || recommendations.length === 0 ? (
          <div className="glass-card p-8 rounded-3xl border-white/5 flex flex-col items-center text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-[#FF0000]/10 border border-[#FF0000]/20 flex items-center justify-center text-[#FF0000]">
              <PlayCircle className="w-6 h-6" />
            </div>
            <div className="space-y-1 max-w-md">
              <h4 className="text-lg font-bold text-white">Recommendations Locked</h4>
              <p className="text-xs text-gray-400 leading-relaxed">
                Complete your profiling evaluation to discover tailored YouTube video recommendations for your target tech domain.
              </p>
            </div>
            <Link
              href="/profiling"
              className="px-5 py-2.5 bg-brand-cyan text-dark-bg text-xs font-bold rounded-xl flex items-center gap-2 hover:bg-brand-cyan/90 transition-all shadow-glow-cyan"
            >
              <Play className="w-3.5 h-3.5 fill-dark-bg" />
              Start Profiling
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {recommendations.map((item) => (
              <a
                href={item.url}
                key={item.id}
                target="_blank"
                rel="noopener noreferrer"
                className="glass-card p-5 rounded-3xl border-white/5 flex flex-col justify-between hover:border-[#FF0000]/30 hover:bg-[#FF0000]/[0.03] transition-all cursor-pointer group space-y-4"
              >
                <div className="flex items-start justify-between">
                  <div className="w-10 h-10 rounded-2xl bg-[#FF0000]/10 border border-[#FF0000]/20 flex items-center justify-center shrink-0 group-hover:bg-[#FF0000]/20 transition-colors">
                    <PlayCircle className="w-5 h-5 text-[#FF0000]" />
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-600 group-hover:text-[#FF0000] transition-colors" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white group-hover:text-[#FF0000] transition-colors line-clamp-2">{item.title}</h4>
                  <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-2">
                    YouTube • {item.duration || 'N/A'}
                  </p>
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
