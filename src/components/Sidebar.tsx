"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Map,
  MessageSquare,
  BarChart3,
  Zap,
  Target,
  Mic
} from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
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
    { name: "AI Mock Interview", href: "/ai-interview", icon: Mic, badge: "AI" },
    { name: "Domain Practice", href: "/mock-interview", icon: MessageSquare },
    { name: "Analytics", href: "/analytics", icon: BarChart3 },
  ];

  return (
    <aside className="w-64 bg-dark-sidebar border-r border-dark-border flex flex-col h-screen overflow-y-auto">
      <div className="p-6 flex items-center gap-3">
        <div className="w-8 h-8 bg-brand-cyan rounded-lg flex items-center justify-center shadow-glow-cyan">
          <Zap className="w-5 h-5 text-white fill-white" />
        </div>
        <span className="text-xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
          PlacExpert-AI
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
      </div>
    </aside>
  );
}
