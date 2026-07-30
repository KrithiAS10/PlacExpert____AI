"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Map, 
  MessageSquare, 
  BarChart3, 
  AlertTriangle,
  Zap,
  Target,
  Mic
} from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface WeakAreaItem {
  name: string;
  reason?: string;
  severity?: string;
}

interface SidebarUser {
  name?: string | null;
  currentDay?: number;
  readinessLevel?: string | null;
  coreCsStrength?: string | null;
  domainInterest?: string | null;
  placementTimeline?: string | null;
  aptitude?: string | null;
  communication?: string | null;
  readinessScore?: number;
  weakAreas?: WeakAreaItem[];
}

interface SidebarProps {
  user?: SidebarUser | null;
}

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();

  const navItems = [
    { name: "Overview", href: "/", icon: LayoutDashboard },
    { name: "Profiling", href: "/profiling", icon: Target, badge: "New" },
    { 
      name: "My Roadmap", 
      href: "/roadmap", 
      icon: Map, 
      badge: user?.currentDay ? `Day ${user.currentDay}` : "Day 1" 
    },
    { name: "Voice Mock Interview", href: "/mock-interview", icon: Mic, badge: "AI Voice" },
    { name: "Analytics", href: "/analytics", icon: BarChart3 },
  ];

  // Dynamic weak areas mapped from profiling answers and AI evaluation
  const getWeakAreas = () => {
    const hasCompletedProfiling = Boolean(user && user.domainInterest);

    if (!user || !hasCompletedProfiling) {
      return {
        isAnalyzed: false,
        items: []
      };
    }

    const items: { name: string; label: string; color: string }[] = [];

    // Only use weakAreas evaluated by the backend AI from profiling answers
    if (user.weakAreas && user.weakAreas.length > 0) {
      user.weakAreas.forEach((wa) => {
        let color = "text-orange-400";
        let label = "Focus Area";

        if (wa.severity === "HIGH") {
          color = "text-red-400";
          label = "High Priority";
        } else if (wa.severity === "MED") {
          color = "text-yellow-400";
          label = "Medium";
        } else if (wa.severity === "LOW") {
          color = "text-blue-400";
          label = "Low";
        }

        items.push({ name: wa.name, label, color });
      });
    }

    return {
      isAnalyzed: items.length > 0,
      items: items.slice(0, 3)
    };
  };

  const analyzedWeakAreas = getWeakAreas();

  return (
    <aside className="w-64 bg-dark-sidebar border-r border-dark-border flex flex-col h-screen overflow-y-auto">
      <div className="p-6 flex items-center gap-3">
        <div className="w-8 h-8 bg-brand-cyan rounded-lg flex items-center justify-center shadow-glow-cyan">
          <Zap className="w-5 h-5 text-white fill-white" />
        </div>
        <span className="text-xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
          PlaceXpert-AI
        </span>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-1">
        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4 px-2">
          Navigation
        </div>
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center justify-between px-3 py-2 rounded-lg transition-all duration-200 group",
                isActive 
                  ? "bg-brand-cyan/10 text-brand-cyan border border-brand-cyan/20" 
                  : "text-gray-400 hover:bg-dark-hover hover:text-white"
              )}
            >
              <div className="flex items-center gap-3">
                <item.icon className={cn("w-5 h-5", isActive ? "text-brand-cyan" : "group-hover:text-white")} />
                <span className="font-medium">{item.name}</span>
              </div>
              {item.badge && (
                <span className="text-[10px] bg-brand-cyan/20 text-brand-cyan px-2 py-0.5 rounded-full font-bold">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}

        <div className="mt-8">
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-2 flex items-center justify-between">
            <span>Weak Areas</span>
            {analyzedWeakAreas.isAnalyzed && (
              <span className="text-[9px] bg-brand-cyan/10 text-brand-cyan px-1.5 py-0.5 rounded font-bold border border-brand-cyan/20">
                AI Analyzed
              </span>
            )}
          </div>

          {analyzedWeakAreas.isAnalyzed ? (
            analyzedWeakAreas.items.length > 0 ? (
              <div className="space-y-1">
                {analyzedWeakAreas.items.map((area) => (
                  <div key={area.name} className="flex items-center justify-between px-3 py-2 text-xs rounded-lg hover:bg-white/5 transition-colors">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <AlertTriangle className={cn("w-3.5 h-3.5 shrink-0", area.color)} />
                      <span className="truncate font-medium text-gray-300">{area.name}</span>
                    </div>
                    <span className={cn("px-1.5 py-0.5 rounded text-[9px] font-bold shrink-0 uppercase tracking-wider ml-2",
                      area.color.includes("red") ? "bg-red-500/10 text-red-400 border border-red-500/20" :
                      area.color.includes("orange") ? "bg-orange-500/10 text-orange-400 border border-orange-500/20" :
                      area.color.includes("yellow") ? "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20" :
                      "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                    )}>
                      {area.label}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="px-3 py-2 text-xs text-gray-500 italic">
                No weak areas detected. Excellent work!
              </div>
            )
          ) : (
            <div className="px-3 py-3 rounded-xl bg-white/[0.02] border border-white/5 space-y-2">
              <div className="flex items-center gap-2 text-xs font-medium text-gray-400">
                <Target className="w-3.5 h-3.5 text-brand-cyan shrink-0" />
                <span>Profiling Pending</span>
              </div>
              <p className="text-[10px] text-gray-500 leading-tight">
                Complete profiling to analyze your domain gaps.
              </p>
              <Link
                href="/profiling"
                className="inline-flex items-center gap-1 text-[10px] font-bold text-brand-cyan hover:underline pt-0.5"
              >
                Start Profiling →
              </Link>
            </div>
          )}
        </div>
      </nav>

      <div className="p-4 mt-auto space-y-4">
        <div className="flex flex-col gap-2 px-2">
          {user ? (
            <button
              onClick={async () => {
                await fetch("/api/auth/logout", { method: "POST" });
                window.location.reload();
              }}
              className="text-left text-xs font-bold text-brand-red hover:text-brand-red/80 transition-colors uppercase tracking-widest px-1 cursor-pointer"
            >
              Sign Out
            </button>
          ) : (
            <>
              <Link href="/login" className="text-xs font-bold text-gray-500 hover:text-white transition-colors uppercase tracking-widest px-1">
                Sign In
              </Link>
              <Link href="/signup" className="text-xs font-bold text-brand-cyan hover:text-brand-cyan/80 transition-colors uppercase tracking-widest px-1">
                Create Account
              </Link>
            </>
          )}
        </div>

        <div className="p-4 rounded-xl bg-gradient-to-br from-brand-purple/20 to-brand-cyan/20 border border-white/5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 -mr-4 -mt-4 w-16 h-16 bg-brand-cyan/20 blur-2xl group-hover:bg-brand-cyan/30 transition-all"></div>
          <p className="text-xs font-bold text-brand-cyan mb-1">PRO PLAN</p>
          <p className="text-xs text-gray-400 mb-3">Unlock AI Mock Interviews & Advanced Roadmap</p>
          <Link href="/voice-interview" className="block w-full py-2 bg-white text-dark-bg text-xs font-bold rounded-lg hover:bg-gray-200 transition-colors text-center">
            Upgrade Now
          </Link>
        </div>
      </div>
    </aside>
  );
}
