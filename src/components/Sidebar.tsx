"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Map, 
  MessageSquare, 
  BarChart3, 
  Library, 
  AlertTriangle,
  Zap,
  Target
} from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface SidebarUser {
  name: string | null;
  currentDay: number;
  readinessLevel: string | null;
  coreCsStrength: string | null;
  placementTimeline: string | null;
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
      badge: user ? `Day ${user.currentDay}` : "Day 15" 
    },
    { name: "Mock Interview", href: "/mock-interview", icon: MessageSquare },
    { name: "Analytics", href: "/analytics", icon: BarChart3 },
    { name: "Resources", href: "/resources", icon: Library },
  ];

  // Dynamic weak areas mapped from Cs strength and profiling results
  const getWeakAreas = () => {
    if (!user) {
      return [
        { name: "Arrays", count: 2, color: "text-red-400" },
        { name: "SQL Joins", color: "text-orange-400" },
        { name: "OS Scheduling", color: "text-yellow-400" },
      ];
    }

    const areas = [];
    if (user.coreCsStrength !== "DSA") {
      areas.push({ name: "DSA", count: 2, color: "text-red-400" });
    }
    if (user.coreCsStrength !== "DBMS") {
      areas.push({ name: "SQL Joins", color: "text-orange-400" });
    }
    if (user.coreCsStrength !== "OS") {
      areas.push({ name: "OS Scheduling", color: "text-yellow-400" });
    }
    if (user.coreCsStrength !== "Networking") {
      areas.push({ name: "CN Networking", color: "text-blue-400" });
    }
    return areas.slice(0, 3);
  };

  const weakAreas = getWeakAreas();

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
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4 px-2">
            Weak Areas
          </div>
          {weakAreas.map((area) => (
            <div key={area.name} className="flex items-center justify-between px-3 py-2 text-sm text-gray-400">
              <div className="flex items-center gap-3">
                <AlertTriangle className={cn("w-4 h-4", area.color)} />
                <span>{area.name}</span>
              </div>
              {area.count && (
                <span className="bg-red-500/20 text-red-500 px-1.5 py-0.5 rounded text-[10px] font-bold">
                  {area.count} fails
                </span>
              )}
            </div>
          ))}
        </div>
      </nav>

      <div className="p-4 mt-auto space-y-4">
        <div className="flex flex-col gap-2 px-2">
          <Link href="/login" className="text-xs font-bold text-gray-500 hover:text-white transition-colors uppercase tracking-widest px-1">
            Sign In
          </Link>
          <Link href="/signup" className="text-xs font-bold text-brand-cyan hover:text-brand-cyan/80 transition-colors uppercase tracking-widest px-1">
            Create Account
          </Link>
        </div>

        <div className="p-4 rounded-xl bg-gradient-to-br from-brand-purple/20 to-brand-cyan/20 border border-white/5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 -mr-4 -mt-4 w-16 h-16 bg-brand-cyan/20 blur-2xl group-hover:bg-brand-cyan/30 transition-all"></div>
          <p className="text-xs font-bold text-brand-cyan mb-1">PRO PLAN</p>
          <p className="text-xs text-gray-400 mb-3">Unlock AI Mock Interviews & Advanced Roadmap</p>
          <button className="w-full py-2 bg-white text-dark-bg text-xs font-bold rounded-lg hover:bg-gray-200 transition-colors">
            Upgrade Now
          </button>
        </div>
      </div>
    </aside>
  );
}
