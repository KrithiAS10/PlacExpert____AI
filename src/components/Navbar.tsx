"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  Bell, 
  Search, 
  ChevronDown, 
  Zap, 
  LogOut, 
  Mail, 
  Building, 
  Target, 
  Code, 
  Calendar, 
  Clock, 
  User, 
  Award, 
  Key, 
  MessageSquare, 
  Flame,
  Phone,
  Sparkles
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface NavbarUser {
  name: string | null;
  email?: string | null;
  phone?: string | null;
  currentDay: number;
  readinessScore?: number | null;
  streak?: number | null;
  readinessLevel: string | null;
  domainInterest?: string | null;
  targetCompany?: string | null;
  coreCsStrength?: string | null;
  codingPlatform?: string | null;
  projects?: string | null;
  aptitude?: string | null;
  communication?: string | null;
  dailyStudyTime?: string | null;
  preferredLang?: string | null;
  placementTimeline: string | null;
}

interface NavbarProps {
  onMenuClick?: () => void;
  user?: NavbarUser | null;
  onLogout?: () => void;
}

export function Navbar({ onMenuClick, user, onLogout }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  return (
    <header className="h-14 sm:h-16 border-b border-dark-border bg-dark-bg/85 backdrop-blur-md sticky top-0 z-40 px-4 sm:px-6 flex items-center justify-between gap-3">
      
      {/* Left: PlaceXpert logo/brand toggle + search */}
      <div className="flex items-center gap-4 min-w-0">
        <button
          onClick={onMenuClick}
          className="flex items-center gap-2 group cursor-pointer text-left focus:outline-none shrink-0"
          title="Toggle Sidebar"
        >
          <div className="w-8 h-8 bg-brand-cyan rounded-lg flex items-center justify-center shadow-glow-cyan group-hover:scale-105 transition-transform">
            <Zap className="w-5 h-5 text-white fill-white" />
          </div>
          <span className="text-lg font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent hidden xs:inline-block">
            PlaceXpert
          </span>
        </button>

        {/* Search — hidden on mobile, visible sm+ */}
        <div className="relative group hidden sm:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-brand-cyan transition-colors" />
          <input
            type="text"
            placeholder="Search topics..."
            className="bg-dark-card border border-dark-border rounded-full py-2 pl-10 pr-4 text-sm w-44 sm:w-56 focus:outline-none focus:border-brand-cyan/50 focus:ring-1 focus:ring-brand-cyan/20 transition-all"
          />
        </div>
      </div>

      {/* Right: notifications + user loggedin details */}
      <div className="flex items-center gap-3 sm:gap-4 shrink-0">
        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => { setIsNotifOpen(!isNotifOpen); setIsOpen(false); }}
            className="relative p-2 text-gray-400 hover:text-white transition-colors rounded-xl hover:bg-white/5 cursor-pointer"
            title="Notifications"
          >
            <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-brand-cyan rounded-full animate-pulse" />
          </button>

          <AnimatePresence>
            {isNotifOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setIsNotifOpen(false)} />
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 8 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 8 }}
                  transition={{ duration: 0.15, ease: "easeOut" }}
                  className="absolute right-0 mt-3 w-80 rounded-2xl border border-dark-border bg-[#0b0f19] shadow-2xl z-50 overflow-hidden"
                >
                  <div className="px-5 py-4 border-b border-dark-border flex items-center justify-between">
                    <p className="text-sm font-bold text-white">Notifications</p>
                    <span className="text-[10px] bg-brand-cyan/10 text-brand-cyan px-2 py-0.5 rounded-full font-bold border border-brand-cyan/20">3 new</span>
                  </div>
                  <div className="divide-y divide-dark-border max-h-72 overflow-y-auto">
                    {[
                      { icon: "🎯", title: "Readiness Score Updated", desc: "Your AI profile score has been recalculated.", time: "Just now", color: "text-brand-cyan" },
                      { icon: "🔥", title: "Streak Milestone!", desc: "You're on a 3-day prep streak. Keep it up!", time: "2h ago", color: "text-orange-400" },
                      { icon: "📋", title: "New Question Set Ready", desc: "15 new DSA questions added to your mock set.", time: "5h ago", color: "text-brand-purple" },
                    ].map((n, i) => (
                      <div key={i} className="flex gap-3 px-5 py-3.5 hover:bg-white/[0.03] transition-colors cursor-pointer">
                        <span className="text-lg mt-0.5 shrink-0">{n.icon}</span>
                        <div className="min-w-0">
                          <p className={`text-xs font-bold ${n.color}`}>{n.title}</p>
                          <p className="text-[11px] text-gray-400 mt-0.5 leading-snug">{n.desc}</p>
                          <p className="text-[10px] text-gray-600 mt-1">{n.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="px-5 py-3 border-t border-dark-border">
                    <button
                      onClick={() => setIsNotifOpen(false)}
                      className="w-full text-center text-xs text-brand-cyan hover:text-brand-cyan/80 font-bold transition-colors cursor-pointer py-1"
                    >
                      Mark all as read
                    </button>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        {/* User Profile Trigger and Dropdown */}
        <div className="relative">
          <button 
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-2 cursor-pointer group focus:outline-none text-left"
          >
            <div className="hidden sm:block text-right">
              <p className="text-xs sm:text-sm font-bold text-white leading-tight">{user?.name ?? "Krithi A S"}</p>
              <p className="text-[10px] text-brand-cyan font-medium">
                {user?.readinessLevel ? `${user.readinessLevel} Track` : "Beginner Track"}
              </p>
            </div>
            <div className="w-8 h-8 sm:w-9 sm:h-9 bg-brand-cyan rounded-full flex items-center justify-center text-dark-bg text-xs font-bold shadow-glow-cyan group-hover:scale-105 transition-transform">
              {user?.name ? user.name.split(' ').map(n => n[0]).join('').slice(0, 2) : "KS"}
            </div>
            <ChevronDown className={`hidden sm:block w-4 h-4 text-gray-500 group-hover:text-white transition-all duration-200 ${isOpen ? "rotate-180 text-white" : ""}`} />
          </button>

          {/* Profile Dropdown Menu */}
          <AnimatePresence>
            {isOpen && (
              <>
                {/* Click outside backdrop */}
                <div 
                  className="fixed inset-0 z-40 cursor-default" 
                  onClick={() => setIsOpen(false)} 
                />
                
                {/* Dropdown Card */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 8 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 8 }}
                  transition={{ duration: 0.15, ease: "easeOut" }}
                  className="absolute right-0 mt-3 w-80 sm:w-96 rounded-2xl border border-dark-border bg-[#0b0f19] p-5 shadow-2xl z-50 overflow-hidden"
                >
                  {/* Subtle glows inside the dropdown card */}
                  <div className="absolute top-0 right-0 w-24 h-24 bg-brand-cyan/5 blur-2xl rounded-full pointer-events-none" />
                  <div className="absolute bottom-0 left-0 w-24 h-24 bg-brand-purple/5 blur-2xl rounded-full pointer-events-none" />

                  {/* Profile Header */}
                  <div className="flex items-center gap-3 relative z-10">
                    <div className="w-12 h-12 bg-brand-cyan rounded-full flex items-center justify-center text-dark-bg text-sm font-extrabold shadow-glow-cyan">
                      {user?.name ? user.name.split(' ').map(n => n[0]).join('').slice(0, 2) : "KS"}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm sm:text-base font-bold text-white truncate leading-tight">
                        {user?.name ?? "Krithi A S"}
                      </p>
                      <p className="text-xs text-gray-400 truncate mt-1 flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-gray-500 shrink-0" />
                        <span>{user?.email ?? "no-email@example.com"}</span>
                      </p>
                      {user?.phone && (
                        <p className="text-xs text-gray-400 truncate mt-1 flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-gray-500 shrink-0" />
                          <span>{user.phone}</span>
                        </p>
                      )}
                      <span className="inline-block text-[10px] text-brand-cyan bg-brand-cyan/10 px-2 py-0.5 rounded-full font-semibold border border-brand-cyan/20 mt-2">
                        {user?.readinessLevel ? `${user.readinessLevel} Track` : "Beginner Track"}
                      </span>
                    </div>
                  </div>

                  <div className="my-4 border-t border-dark-border" />

                  {/* Mini Stats Grid */}
                  <div className="grid grid-cols-2 gap-3 relative z-10">
                    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-3 flex flex-col justify-between hover:bg-white/[0.04] transition-colors">
                      <div className="flex items-center gap-1.5 text-orange-400 text-[10px] font-bold uppercase tracking-wider">
                        <Flame className="w-3.5 h-3.5 fill-orange-500/20" />
                        <span>Streak</span>
                      </div>
                      <p className="text-lg font-extrabold text-white mt-1 leading-tight">
                        {user?.streak ?? 0} {user?.streak === 1 ? 'day' : 'days'}
                      </p>
                      <span className="text-[9px] text-gray-500 mt-0.5">Consecutive visits</span>
                    </div>

                    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-3 flex flex-col justify-between hover:bg-white/[0.04] transition-colors">
                      <div className="flex items-center gap-1.5 text-brand-cyan text-[10px] font-bold uppercase tracking-wider">
                        <Target className="w-3.5 h-3.5" />
                        <span>Readiness</span>
                      </div>
                      <p className="text-lg font-extrabold text-white mt-1 leading-tight">
                        {user?.readinessScore ?? 0}%
                      </p>
                      <span className="text-[9px] text-gray-500 mt-0.5">AI Profile score</span>
                    </div>
                  </div>

                  <div className="my-4 border-t border-dark-border" />

                  {/* Profile Details List */}
                  <div className="relative z-10">
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3 ml-1">
                      Onboarding Details
                    </p>
                    <div className="max-h-52 overflow-y-auto pr-1 space-y-3 scrollbar-thin">
                      {[
                        { label: "Target Domain", value: user?.domainInterest, icon: Building },
                        { label: "Target Company", value: user?.targetCompany, icon: Target },
                        { label: "Preferred Language", value: user?.preferredLang, icon: Code },
                        { label: "Timeline", value: user?.placementTimeline, icon: Calendar },
                        { label: "Daily Prep Time", value: user?.dailyStudyTime, icon: Clock },
                        { label: "CS Strength", value: user?.coreCsStrength, icon: Zap },
                        { label: "Coding Practice", value: user?.codingPlatform, icon: Award },
                        { label: "Projects Experience", value: user?.projects, icon: User },
                        { label: "Aptitude Rating", value: user?.aptitude, icon: Sparkles },
                        { label: "Communication Skill", value: user?.communication, icon: MessageSquare }
                      ].map((item, idx) => {
                        const Icon = item.icon;
                        return (
                          <div key={idx} className="flex gap-2.5 min-w-0 items-start px-1.5 py-1 hover:bg-white/[0.01] rounded-lg transition-colors">
                            <Icon className="w-4 h-4 text-brand-cyan shrink-0 mt-0.5" />
                            <div className="min-w-0">
                              <p className="text-[9px] text-gray-500 font-bold uppercase tracking-wider">{item.label}</p>
                              <p className={`text-xs font-semibold mt-0.5 truncate ${item.value ? "text-gray-300" : "text-gray-600 italic"}`}>
                                {item.value || "Not configured"}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="my-4 border-t border-dark-border" />

                  {/* Action Buttons */}
                  <div className="flex gap-3 relative z-10">
                    <button
                      onClick={() => {
                        alert(`A password reset link has been successfully sent to ${user?.email || "your email"}!`);
                        setIsOpen(false);
                      }}
                      className="flex-1 py-2.5 bg-brand-cyan/10 hover:bg-brand-cyan/20 border border-brand-cyan/20 text-brand-cyan font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer text-center"
                    >
                      <Key className="w-3.5 h-3.5" />
                      <span>Forgot Password</span>
                    </button>

                    <button
                      onClick={async () => {
                        setIsOpen(false);
                        if (onLogout) {
                          onLogout();
                        } else {
                          await fetch("/api/auth/logout", { method: "POST" });
                          window.location.reload();
                        }
                      }}
                      className="py-2.5 bg-brand-red/10 hover:bg-brand-red/20 border border-brand-red/20 text-brand-red font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors px-4 cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}
