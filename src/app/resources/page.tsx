"use client";

import { motion } from "framer-motion";
import { 
  Search, 
  BookOpen, 
  Video, 
  Code, 
  FileText, 
  ExternalLink,
  ChevronRight,
  Filter,
  Bookmark
} from "lucide-react";

const resources = [
  {
    title: "Mastering Array Manipulations",
    type: "Article",
    domain: "DSA",
    duration: "15 min read",
    icon: FileText,
    color: "text-brand-purple",
    bg: "bg-brand-purple/10",
    url: "#"
  },
  {
    title: "SQL Joins Deep Dive",
    type: "Video",
    domain: "DBMS",
    duration: "45 min",
    icon: Video,
    color: "text-brand-blue",
    bg: "bg-brand-blue/10",
    url: "#"
  },
  {
    title: "Operating Systems - Process Scheduling",
    type: "Course",
    domain: "OS",
    duration: "3 hours",
    icon: BookOpen,
    color: "text-brand-orange",
    bg: "bg-brand-orange/10",
    url: "#"
  },
  {
    title: "System Design for Beginners",
    type: "Guide",
    domain: "Arch",
    duration: "20 min read",
    icon: Code,
    color: "text-brand-cyan",
    bg: "bg-brand-cyan/10",
    url: "#"
  },
  {
    title: "Networking Protocols 101",
    type: "Video",
    domain: "CN",
    duration: "30 min",
    icon: Video,
    color: "text-brand-teal",
    bg: "bg-brand-teal/10",
    url: "#"
  },
  {
    title: "React Performance Optimization",
    type: "Article",
    domain: "Web",
    duration: "12 min read",
    icon: FileText,
    color: "text-brand-red",
    bg: "bg-brand-red/10",
    url: "#"
  }
];

export default function ResourcesPage() {
  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      {/* Header & Search */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Learning Resources</h1>
          <p className="text-gray-400 text-sm">Curated collection of top-tier learning materials selected by AI</p>
        </div>
        
        <div className="relative w-full md:w-96 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-brand-cyan transition-colors" />
          <input 
            type="text" 
            placeholder="Search topics, skills, or resources..."
            className="w-full bg-dark-card border border-dark-border rounded-xl py-3 pl-12 pr-4 text-sm text-white focus:outline-none focus:border-brand-cyan/50 transition-all shadow-lg"
          />
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <button className="flex items-center gap-2 px-4 py-2 bg-brand-cyan text-dark-bg text-xs font-bold rounded-lg shadow-glow-cyan">
          All Resources
        </button>
        {['Articles', 'Videos', 'Courses', 'Coding Problems'].map((filter) => (
          <button key={filter} className="px-4 py-2 bg-dark-card border border-dark-border text-gray-400 text-xs font-medium rounded-lg hover:text-white hover:border-white/20 transition-all">
            {filter}
          </button>
        ))}
        <div className="ml-auto flex items-center gap-2 text-gray-500 hover:text-white transition-colors cursor-pointer">
          <Filter className="w-4 h-4" />
          <span className="text-xs font-medium">More Filters</span>
        </div>
      </div>

      {/* Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {resources.map((res, i) => (
          <motion.div
            key={res.title}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
            className="glass-card group p-6 rounded-2xl border-white/5 hover:border-white/10 hover:shadow-2xl transition-all cursor-pointer relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
              <Bookmark className="w-4 h-4 text-gray-400 hover:text-brand-cyan transition-colors" />
            </div>

            <div className="flex items-start gap-4 mb-6">
              <div className={`w-12 h-12 rounded-xl ${res.bg} flex items-center justify-center shrink-0`}>
                <res.icon className={`w-6 h-6 ${res.color}`} />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-[9px] font-bold uppercase tracking-widest ${res.color}`}>
                    {res.domain}
                  </span>
                  <span className="text-[9px] text-gray-600 font-bold uppercase">
                    • {res.type}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-white group-hover:text-brand-cyan transition-colors line-clamp-2 leading-relaxed">
                  {res.title}
                </h3>
              </div>
            </div>

            <div className="flex items-center justify-between mt-auto">
              <div className="flex items-center gap-2 text-[10px] text-gray-500 font-medium">
                <Clock className="w-3 h-3" />
                {res.duration}
              </div>
              <div className="flex items-center gap-1.5 text-brand-cyan text-[10px] font-bold uppercase group-hover:gap-2 transition-all">
                Explore <ChevronRight className="w-3 h-3" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Featured Collections */}
      <div className="pt-8">
        <h2 className="text-xl font-bold text-white mb-6">Featured Collections</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-gradient-to-br from-brand-blue/20 to-brand-cyan/20 border border-brand-cyan/30 rounded-3xl p-8 relative overflow-hidden group cursor-pointer">
            <div className="absolute -right-12 -bottom-12 w-48 h-48 bg-brand-cyan/10 blur-3xl group-hover:bg-brand-cyan/20 transition-all"></div>
            <div className="relative z-10 flex flex-col md:flex-row gap-8 items-center">
              <div className="w-20 h-20 bg-white/10 rounded-2xl flex items-center justify-center border border-white/10 shrink-0">
                <ExternalLink className="w-10 h-10 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white mb-2">Technical Interview Handbook</h3>
                <p className="text-sm text-gray-400 leading-relaxed mb-6">
                  Everything you need to crack technical interviews, from DSA to Behavioral rounds. Curated for 2024 hiring standards.
                </p>
                <button className="px-6 py-2.5 bg-white text-dark-bg font-bold rounded-xl text-sm hover:scale-105 transition-all">
                  Access Handbook
                </button>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-brand-purple/20 to-brand-red/20 border border-brand-red/30 rounded-3xl p-8 relative overflow-hidden group cursor-pointer">
            <div className="absolute -right-12 -bottom-12 w-48 h-48 bg-brand-red/10 blur-3xl group-hover:bg-brand-red/20 transition-all"></div>
            <div className="relative z-10 flex flex-col md:flex-row gap-8 items-center">
              <div className="w-20 h-20 bg-white/10 rounded-2xl flex items-center justify-center border border-white/10 shrink-0">
                <Video className="w-10 h-10 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white mb-2">Live System Design Series</h3>
                <p className="text-sm text-gray-400 leading-relaxed mb-6">
                  Watch top engineers design scalable systems like Netflix, Uber, and WhatsApp in real-time. 12 exclusive episodes.
                </p>
                <button className="px-6 py-2.5 bg-white text-dark-bg font-bold rounded-xl text-sm hover:scale-105 transition-all">
                  Watch Series
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import { Clock } from "lucide-react";
