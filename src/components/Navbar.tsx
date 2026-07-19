"use client";

import { Bell, Search, ChevronDown, Zap } from "lucide-react";

interface NavbarUser {
  name: string | null;
  currentDay: number;
  readinessLevel: string | null;
  placementTimeline: string | null;
}

interface NavbarProps {
  onMenuClick?: () => void;
  user?: NavbarUser | null;
}

export function Navbar({ onMenuClick, user }: NavbarProps) {
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
        <button className="relative p-2 text-gray-400 hover:text-white transition-colors rounded-xl hover:bg-white/5">
          <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-brand-cyan rounded-full" />
        </button>

        <div className="flex items-center gap-2 cursor-pointer group">
          <div className="hidden sm:block text-right">
            <p className="text-xs sm:text-sm font-bold text-white leading-tight">{user?.name ?? "Krithi A S"}</p>
            <p className="text-[10px] text-brand-cyan font-medium">
              {user?.readinessLevel ? `${user.readinessLevel} Track` : "Beginner Track"}
            </p>
          </div>
          <div className="w-8 h-8 sm:w-9 sm:h-9 bg-brand-cyan rounded-full flex items-center justify-center text-dark-bg text-xs font-bold shadow-glow-cyan group-hover:scale-105 transition-transform">
            {user?.name ? user.name.split(' ').map(n => n[0]).join('').slice(0, 2) : "KS"}
          </div>
          <ChevronDown className="hidden sm:block w-4 h-4 text-gray-500 group-hover:text-white transition-colors" />
        </div>
      </div>
    </header>
  );
}
