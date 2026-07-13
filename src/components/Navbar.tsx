"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, Search, ChevronDown } from "lucide-react";

export function Navbar() {
  const pathname = usePathname();
  return (
    <header className="h-16 border-b border-dark-border bg-dark-bg/80 backdrop-blur-md sticky top-0 z-40 px-8 flex items-center justify-between">
      <div className="flex items-center gap-6">
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-brand-cyan transition-colors" />
          <input 
            type="text" 
            placeholder="Search resources, topics..." 
            className="bg-dark-card border border-dark-border rounded-full py-2 pl-10 pr-4 text-sm w-64 focus:outline-none focus:border-brand-cyan/50 focus:ring-1 focus:ring-brand-cyan/20 transition-all"
          />
        </div>
        <div className="flex items-center gap-6 text-sm font-medium">
          <Link 
            href="/" 
            className={pathname === "/" ? "text-brand-cyan border-b-2 border-brand-cyan pb-1" : "text-gray-400 hover:text-white transition-colors"}
          >
            Dashboard
          </Link>
          <Link 
            href="/roadmap" 
            className={pathname === "/roadmap" ? "text-brand-cyan border-b-2 border-brand-cyan pb-1" : "text-gray-400 hover:text-white transition-colors"}
          >
            Roadmap
          </Link>
          <Link 
            href="/mock-interview" 
            className={pathname === "/mock-interview" ? "text-brand-cyan border-b-2 border-brand-cyan pb-1" : "text-gray-400 hover:text-white transition-colors"}
          >
            Mock Interview
          </Link>
          <Link 
            href="/analytics" 
            className={pathname === "/analytics" ? "text-brand-cyan border-b-2 border-brand-cyan pb-1" : "text-gray-400 hover:text-white transition-colors"}
          >
            Progress
          </Link>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
          <span>Day 15 of 45</span>
        </div>
        
        <button className="relative p-2 text-gray-400 hover:text-white transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-brand-cyan rounded-full border-2 border-dark-bg"></span>
        </button>

        <div className="flex items-center gap-3 pl-4 border-l border-dark-border cursor-pointer group">
          <div className="text-right">
            <p className="text-sm font-bold text-white leading-tight">Krithi A S</p>
            <p className="text-[10px] text-brand-cyan font-medium">TIER 1 • Beginner</p>
          </div>
          <div className="w-9 h-9 bg-brand-cyan rounded-full flex items-center justify-center text-dark-bg font-bold shadow-glow-cyan group-hover:scale-105 transition-transform">
            KS
          </div>
          <ChevronDown className="w-4 h-4 text-gray-500 group-hover:text-white transition-colors" />
        </div>
      </div>
    </header>
  );
}
