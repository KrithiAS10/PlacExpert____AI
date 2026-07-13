"use client";

import { motion } from "framer-motion";
import { 
  BarChart3, 
  Zap, 
  Target, 
  TrendingUp, 
  Clock, 
  Play,
  ArrowRight,
  Plus,
  Award,
  BookOpen,
  MessageSquare
} from "lucide-react";
import Link from "next/link";
import { ReadinessChart } from "@/app/roadmap/components/ReadinessChart";

interface Activity {
  id: string;
  action: string;
  timestamp: Date | string;
  status?: string | null;
}

interface User {
  name: string | null;
  readinessScore: number;
  streak: number;
  currentDay: number;
  activities: Activity[];
}

interface Recommendation {
  id: string;
  title: string;
  type: string;
  duration?: string | null;
  url: string;
}

interface DashboardClientProps {
  user: User;
  recommendations: Recommendation[];
}

export function DashboardClient({ user, recommendations }: DashboardClientProps) {
  const stats = [
    { label: "Readiness Score", value: user.readinessScore.toFixed(1), sub: "Current Status", icon: Target, color: "text-brand-cyan" },
    { label: "Daily Streak", value: `${user.streak} Days`, sub: "Keep it up!", icon: Zap, color: "text-brand-orange" },
    { label: "Hours Logged", value: "43.5h", sub: "Estimated", icon: Clock, color: "text-brand-purple" },
    { label: "Roadmap Progress", value: `Day ${user.currentDay}`, sub: "On Track", icon: Award, color: "text-brand-teal" },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-12">
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">
            Welcome back, <span className="bg-gradient-to-r from-brand-cyan to-brand-blue bg-clip-text text-transparent">{(user.name || 'User').split(' ')[0]}</span>
          </h1>
          <p className="text-gray-400 text-sm font-medium">You are on Day {user.currentDay} of your roadmap. Keep the momentum!</p>
        </div>
        <div className="flex gap-3">
          <Link href="/roadmap" className="px-5 py-2.5 bg-brand-cyan text-dark-bg text-sm font-bold rounded-xl flex items-center gap-2 hover:bg-brand-cyan/90 transition-all shadow-glow-cyan">
            <Play className="w-4 h-4 fill-dark-bg" />
            Resume Roadmap
          </Link>
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
            <ReadinessChart />
          </div>
        </div>

        {/* Next Task Card */}
        <div className="glass-card p-8 rounded-[32px] border-white/5 bg-gradient-to-br from-brand-cyan/10 to-transparent relative overflow-hidden">
          <div className="absolute -top-4 -right-4 w-24 h-24 bg-brand-cyan/5 blur-3xl"></div>
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
        </div>
      </div>

      {/* Bottom Grid: Recent Feed & Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recommended Resources */}
        <div className="space-y-6">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-brand-purple" />
            AI Recommendations
          </h3>
          <div className="space-y-3">
            {recommendations.map((item) => (
              <Link href={item.url} key={item.id} className="bg-dark-card border border-dark-border p-4 rounded-2xl flex items-center gap-4 hover:border-white/10 transition-all cursor-pointer group">
                <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center shrink-0">
                  <Plus className="w-5 h-5 text-brand-cyan" />
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-bold text-white group-hover:text-brand-cyan transition-colors">{item.title}</h4>
                  <p className="text-[10px] text-gray-500 uppercase tracking-widest">{item.type} • {item.duration || 'N/A'}</p>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-800 group-hover:text-gray-500 transition-colors" />
              </Link>
            ))}
          </div>
        </div>

        {/* Activity Feed */}
        <div className="space-y-6">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-brand-teal" />
            Recent Activity
          </h3>
          <div className="glass-card p-6 rounded-3xl border-white/5 space-y-6">
            {user.activities.length > 0 ? user.activities.map((act) => (
              <div key={act.id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-brand-cyan shadow-glow-cyan"></div>
                  <div>
                    <p className="text-sm text-gray-300 font-medium">{act.action}</p>
                    <p className="text-[10px] text-gray-500 uppercase">{new Date(act.timestamp).toLocaleDateString()}</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/5 border border-white/5 text-brand-cyan">
                  {act.status || 'LOGGED'}
                </span>
              </div>
            )) : (
              <p className="text-xs text-gray-500 text-center py-8 italic">No recent activity found in database.</p>
            )}
            <Link href="/analytics" className="block w-full py-3 text-center text-xs text-gray-500 font-bold uppercase tracking-widest border border-dark-border rounded-xl hover:text-white hover:border-white/10 transition-all">
              View Full History
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
