"use client";

import { ROADMAP_DATA } from "@/lib/mock-data";
import { PhaseCard } from "./components/PhaseCard";
import { ReadinessChart } from "./components/ReadinessChart";
import { 
  CheckCircle2, 
  Map as MapIcon, 
  FileUp, 
  Play, 
  Info, 
  TrendingUp, 
  AlertCircle,
  Zap,
  ArrowRight
} from "lucide-react";
import { motion } from "framer-motion";

export default function RoadmapPage() {
  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Your 45-Day Roadmap</h1>
          <p className="text-gray-400 text-sm">Adaptive path based on your profile assessment — updates every weekly checkpoint</p>
        </div>
        
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-dark-card border border-dark-border rounded-lg text-sm font-medium text-gray-300 hover:bg-dark-hover transition-colors">
            Initial Roadmap
          </button>
          <button className="px-4 py-2 bg-brand-cyan/10 border border-brand-cyan/30 rounded-lg text-sm font-bold text-brand-cyan shadow-glow-cyan">
            Adaptive Roadmap <span className="ml-1 bg-brand-cyan text-dark-bg text-[10px] px-1.5 py-0.5 rounded uppercase">New</span>
          </button>
        </div>
      </div>

      {/* Stats Summary Area */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 glass-card p-6 rounded-2xl flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2 bg-brand-cyan/5 border border-brand-cyan/10 px-3 py-1.5 rounded-full text-[12px]">
            <div className="w-2 h-2 bg-brand-cyan rounded-full"></div>
            <span className="text-gray-300">Learning Basics</span>
          </div>
          <div className="flex items-center gap-2 bg-brand-blue/5 border border-brand-blue/10 px-3 py-1.5 rounded-full text-[12px]">
            <div className="w-2 h-2 bg-brand-blue rounded-full"></div>
            <span className="text-gray-300">Web Development</span>
          </div>
          <div className="flex items-center gap-2 bg-brand-purple/5 border border-brand-purple/10 px-3 py-1.5 rounded-full text-[12px]">
            <div className="w-2 h-2 bg-brand-purple rounded-full"></div>
            <span className="text-gray-300">Target: Startup</span>
          </div>
          <div className="flex items-center gap-2 bg-brand-teal/5 border border-brand-teal/10 px-3 py-1.5 rounded-full text-[12px]">
            <div className="w-2 h-2 bg-brand-teal rounded-full"></div>
            <span className="text-gray-300">DBMS Strength</span>
          </div>
          <div className="flex items-center gap-2 bg-brand-orange/5 border border-brand-orange/10 px-3 py-1.5 rounded-full text-[12px]">
            <div className="w-2 h-2 bg-brand-orange rounded-full"></div>
            <span className="text-gray-300">Need Practice (Comm.)</span>
          </div>
        </div>

        <div className="glass-card p-6 rounded-2xl flex items-center justify-between">
          <div>
            <p className="text-2xl font-bold text-white leading-tight">3.2</p>
            <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Readiness Score</p>
          </div>
          <div className="text-right">
            <span className="bg-red-500/10 text-red-500 text-[10px] px-2 py-1 rounded font-bold border border-red-500/20">
              TIER 1
            </span>
            <p className="text-[10px] text-gray-500 mt-1">Beginner Track</p>
          </div>
        </div>
      </div>

      {/* Adaptive Highlight Banner */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-brand-orange/5 border border-brand-orange/20 rounded-2xl p-6 flex flex-col md:flex-row gap-6 items-center"
      >
        <div className="w-12 h-12 bg-brand-orange/10 rounded-xl flex items-center justify-center shrink-0">
          <Zap className="w-6 h-6 text-brand-orange" />
        </div>
        <div className="flex-1">
          <h4 className="text-brand-orange font-bold text-sm mb-1">Adaptive Roadmap Generated — Week 2 Checkpoint Complete</h4>
          <p className="text-gray-400 text-sm leading-relaxed">
            Your Week 2 checkpoint score was <span className="text-white font-bold">5.5/10</span> (+2.3 from initial). XGBoost detected weak patterns in <span className="text-brand-red font-medium">Arrays</span> and <span className="text-brand-red font-medium">SQL JOINs</span>. Your roadmap has been updated — 3 foundation tasks re-inserted for next week and DSA difficulty adjusted.
          </p>
        </div>
        <div className="flex gap-3 shrink-0">
          <button className="px-4 py-2 bg-brand-orange text-dark-bg text-sm font-bold rounded-lg hover:bg-brand-orange/90 transition-all">
            View New Roadmap
          </button>
          <button className="px-4 py-2 bg-transparent text-gray-400 text-sm font-medium border border-gray-800 rounded-lg hover:bg-white/5 transition-all">
            Keep Current
          </button>
        </div>
      </motion.div>

      {/* Phase Overview */}
      <div className="space-y-4">
        <div className="flex justify-between items-end">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            Phase Overview <span className="text-xs text-gray-500 font-normal ml-2">6 WEEKS</span>
          </h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {ROADMAP_DATA.phases.map((phase) => (
            <PhaseCard 
              key={phase.week} 
              name={phase.name}
              week={phase.week}
              days={phase.days}
              status={phase.status}
            />
          ))}
        </div>
      </div>

      {/* Main Content Grid: Timeline & Sidebar Info */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Daily Task Timeline */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold text-white">Daily Task Timeline</h2>
            <span className="text-xs text-gray-500 font-medium">Showing Week 2 — Days 8-15</span>
          </div>
          
          <div className="bg-dark-card border border-dark-border rounded-2xl overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-dark-border bg-white/5">
                  <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-wider w-16">Day</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-wider">Topic & Task</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-wider text-center">Resource</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-wider text-center">Type</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-wider text-center">Status</th>
                </tr>
              </thead>
              <tbody>
                <tr className="bg-brand-blue/5 border-b border-dark-border">
                  <td colSpan={5} className="px-6 py-2 text-[10px] font-bold text-brand-blue uppercase tracking-widest">
                    Week 2: Core CS Subjects — Days 8-14
                  </td>
                </tr>
                {ROADMAP_DATA.tasks.filter(t => t.day < 15).map((task) => (
                  <tr key={task.day} className="border-b border-dark-border/50 hover:bg-white/5 transition-colors group">
                    <td className="px-6 py-4 text-xs font-bold text-gray-500">{String(task.day).padStart(2, '0')}</td>
                    <td className="px-6 py-4 text-xs text-gray-300 font-medium">{task.topic}</td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-[10px] text-brand-teal bg-brand-teal/10 px-2 py-0.5 rounded font-bold border border-brand-teal/20">
                        {task.resource}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex flex-col items-center gap-1 opacity-60">
                        {task.type === "MCQ" ? <Info className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                        <span className="text-[9px] uppercase font-bold tracking-tighter">{task.type}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {task.status === "completed" ? (
                        <div className="w-6 h-6 bg-brand-green/20 border border-brand-green/30 rounded flex items-center justify-center mx-auto">
                          <CheckCircle2 className="w-4 h-4 text-brand-green" />
                        </div>
                      ) : (
                        <div className="w-6 h-6 bg-brand-red/20 border border-brand-red/30 rounded flex items-center justify-center mx-auto">
                          <AlertCircle className="w-4 h-4 text-brand-red" />
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
                <tr className="bg-brand-orange/5 border-b border-dark-border">
                  <td colSpan={5} className="px-6 py-2 text-[10px] font-bold text-brand-orange uppercase tracking-widest">
                    Week 3: DSA Basics — Days 15-21
                  </td>
                </tr>
                <tr className="border-b border-brand-orange/20 bg-brand-orange/10 relative">
                  <td className="px-6 py-4 text-xs font-bold text-brand-orange relative">
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-brand-orange shadow-glow-orange"></div>
                    15
                  </td>
                  <td className="px-6 py-4 text-xs text-white font-bold">Arrays — Traversal, Search, Insert</td>
                  <td className="px-6 py-4 text-center">
                    <span className="text-[10px] text-brand-orange bg-brand-orange/10 px-2 py-0.5 rounded font-bold border border-brand-orange/20">
                      LeetCode
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex flex-col items-center gap-1">
                      <Play className="w-4 h-4 text-brand-orange" />
                      <span className="text-[9px] uppercase font-bold tracking-tighter text-brand-orange">Coding</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="w-6 h-6 bg-brand-orange/20 border border-brand-orange/30 rounded flex items-center justify-center mx-auto animate-pulse">
                      <Play className="w-3 h-3 fill-brand-orange text-brand-orange" />
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Sidebar Widgets */}
        <div className="space-y-8">
          {/* Readiness Progression */}
          <div className="glass-card p-6 rounded-2xl space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-brand-cyan" />
                Readiness Score Progression
              </h3>
            </div>
            <ReadinessChart />
            <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider text-gray-500">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 bg-brand-cyan rounded-full"></div>
                <span>Actual</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 border border-brand-blue border-dashed rounded-full"></div>
                <span>Projected</span>
              </div>
            </div>
          </div>

          {/* Detected Weak Areas */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-brand-red" />
              Detected Weak Areas
            </h3>
            <div className="grid grid-cols-1 gap-3">
              {ROADMAP_DATA.weakAreas.map((area) => (
                <div key={area.name} className="bg-dark-card border border-dark-border p-4 rounded-xl flex items-center gap-4 hover:border-white/10 transition-all cursor-default">
                  <div className={`w-2 h-8 rounded-full ${area.severity === 'HIGH' ? 'bg-brand-red' : 'bg-brand-orange'}`}></div>
                  <div className="flex-1">
                    <p className="text-xs font-bold text-white">{area.name}</p>
                    <p className="text-[10px] text-gray-500">{area.reason}</p>
                  </div>
                  <div className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${area.severity === 'HIGH' ? 'text-brand-red bg-brand-red/10 border border-brand-red/20' : 'text-brand-orange bg-brand-orange/10 border border-brand-orange/20'}`}>
                    {area.severity}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Today's Focus Task Card */}
          <div className="bg-gradient-to-br from-brand-cyan/20 to-brand-blue/20 border border-brand-cyan/30 rounded-2xl p-6 space-y-4 shadow-glow-cyan relative overflow-hidden">
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-brand-cyan/10 blur-3xl"></div>
            <div className="relative z-10">
              <div className="flex justify-between items-center mb-4">
                <span className="text-[10px] font-bold text-brand-cyan uppercase tracking-widest">Today — Day 15</span>
                <span className="text-[10px] text-gray-400 font-medium">Week 3</span>
              </div>
              <h4 className="text-xl font-bold text-white mb-2">Arrays</h4>
              <p className="text-xs text-gray-300 font-medium mb-4 italic">Traversal, Search & Insert</p>
              <p className="text-xs text-gray-400 leading-relaxed mb-6">
                Solve 3 Easy LeetCode array problems. Upload your solution file after solving. BERT + test case analyzer will grade it.
              </p>
              
              <div className="flex gap-4 mb-6">
                <div>
                  <p className="text-[10px] text-gray-500 uppercase font-bold mb-1">Resource</p>
                  <p className="text-xs text-brand-orange font-bold">LeetCode</p>
                </div>
                <div className="border-l border-white/10 pl-4">
                  <p className="text-[10px] text-gray-500 uppercase font-bold mb-1">Difficulty</p>
                  <p className="text-xs text-white font-bold">Easy - 3 problems</p>
                </div>
              </div>

              <button className="w-full py-3 bg-brand-cyan text-dark-bg font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-brand-cyan/90 transition-all shadow-glow-cyan">
                <Play className="w-4 h-4 fill-dark-bg" />
                Start Task
              </button>
            </div>
          </div>

          {/* Upload Solution */}
          <div className="border-2 border-dashed border-dark-border rounded-2xl p-8 flex flex-col items-center justify-center text-center group hover:border-brand-cyan/50 hover:bg-brand-cyan/5 transition-all cursor-pointer">
            <div className="w-12 h-12 bg-dark-card border border-dark-border rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <FileUp className="w-6 h-6 text-brand-cyan" />
            </div>
            <p className="text-sm font-bold text-white mb-1">Upload Your Solution</p>
            <p className="text-[10px] text-gray-500 mb-4">Drag & drop your file here or click to browse</p>
            <div className="flex gap-2">
              {['.py', '.java', '.cpp', '.js', '.sql'].map(ext => (
                <span key={ext} className="text-[9px] text-gray-600 font-bold px-1.5 py-0.5 border border-gray-800 rounded">
                  {ext}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Adaptive Roadmap Change Section */}
      <div className="space-y-6 pt-12 border-t border-dark-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-brand-cyan/10 rounded-xl flex items-center justify-center shadow-glow-cyan">
            <MapIcon className="w-6 h-6 text-brand-cyan" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Adaptive Roadmap — Generated After Week 2 Checkpoint</h2>
            <p className="text-brand-cyan text-[10px] font-bold uppercase tracking-widest mt-0.5">Updated</p>
          </div>
        </div>

        <div className="bg-dark-card border border-dark-border rounded-3xl p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-6">
            <span className="text-[10px] font-bold text-brand-cyan border border-brand-cyan/30 px-3 py-1 rounded-full bg-brand-cyan/5">XGBoost RE-EVALUATED</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-8 items-center">
            <div className="md:col-span-2 space-y-4">
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Initial Roadmap — Day 1</p>
              <div className="space-y-2">
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold text-white">3.2</span>
                  <span className="text-gray-600">/10</span>
                </div>
                <div className="flex items-center gap-2 text-brand-red text-xs font-bold">
                  <div className="w-2 h-2 bg-brand-red rounded-sm"></div>
                  Tier 1 — Beginner
                </div>
              </div>
              <ul className="space-y-1.5">
                <li className="flex items-center gap-2 text-[11px] text-gray-500">
                  <div className="w-1 h-1 bg-gray-700 rounded-full"></div>
                  45-day standard track
                </li>
                <li className="flex items-center gap-2 text-[11px] text-gray-500">
                  <div className="w-1 h-1 bg-gray-700 rounded-full"></div>
                  Full foundation week included
                </li>
                <li className="flex items-center gap-2 text-[11px] text-gray-500">
                  <div className="w-1 h-1 bg-gray-700 rounded-full"></div>
                  DSA starts at Day 15
                </li>
                <li className="flex items-center gap-2 text-[11px] text-gray-500">
                  <div className="w-1 h-1 bg-gray-700 rounded-full"></div>
                  HR Prep at Day 31
                </li>
              </ul>
            </div>

            <div className="flex justify-center">
              <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center border border-white/10">
                <ArrowRight className="w-6 h-6 text-gray-600" />
              </div>
            </div>

            <div className="md:col-span-2 space-y-4 bg-white/5 p-6 rounded-2xl border border-white/5">
              <p className="text-[10px] text-brand-orange font-bold uppercase tracking-widest">Adaptive Roadmap — Day 14 RE-EVAL</p>
              <div className="space-y-2">
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold text-white">5.5</span>
                  <span className="text-gray-600">/10</span>
                </div>
                <div className="flex items-center gap-2 text-brand-orange text-xs font-bold">
                  <TrendingUp className="w-3 h-3" />
                  Moving to Tier 1.5
                </div>
              </div>
              <ul className="space-y-1.5">
                <li className="flex items-center gap-2 text-[11px] text-brand-green font-medium">
                  <CheckCircle2 className="w-3 h-3" />
                  Array foundation task re-inserted Week 3
                </li>
                <li className="flex items-center gap-2 text-[11px] text-brand-green font-medium">
                  <CheckCircle2 className="w-3 h-3" />
                  SQL JOIN drill added Day 16
                </li>
                <li className="flex items-center gap-2 text-[11px] text-brand-orange font-medium">
                  <Zap className="w-3 h-3" />
                  Project sprint moved to Day 24 (earlier)
                </li>
                <li className="flex items-center gap-2 text-[11px] text-brand-orange font-medium">
                  <Zap className="w-3 h-3" />
                  HR Prep now at Day 28 (3 days earlier)
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
