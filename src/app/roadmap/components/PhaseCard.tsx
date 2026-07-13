"use client";

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { CheckCircle2, Lock, PlayCircle, FastForward } from "lucide-react";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface PhaseCardProps {
  name: string;
  week: number;
  days: string;
  status: "completed" | "active" | "next" | "locked";
}

export function PhaseCard({ name, week, days, status }: PhaseCardProps) {
  const isCompleted = status === "completed";
  const isActive = status === "active";
  const isLocked = status === "locked";
  const isNext = status === "next";

  return (
    <div className={cn(
      "relative p-4 rounded-xl border transition-all duration-300 group overflow-hidden",
      isActive ? "bg-brand-blue/10 border-brand-blue/30 scale-105 z-10 shadow-glow-blue" : "bg-dark-card border-dark-border",
      isCompleted && "opacity-80",
      isLocked && "opacity-50 grayscale-[0.5]"
    )}>
      {isActive && (
        <div className="absolute top-0 right-0 p-2">
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-brand-blue text-[10px] font-bold text-white uppercase animate-pulse">
            <PlayCircle className="w-3 h-3" />
            Active
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mb-2">
        <span className={cn(
          "text-[10px] font-bold uppercase tracking-wider",
          isCompleted ? "text-brand-green" : isActive ? "text-brand-blue" : "text-gray-500"
        )}>
          Week {week}
        </span>
        {isCompleted && <CheckCircle2 className="w-4 h-4 text-brand-green" />}
        {isLocked && <Lock className="w-4 h-4 text-gray-600" />}
        {isNext && <FastForward className="w-4 h-4 text-brand-teal" />}
      </div>

      <h3 className={cn(
        "font-bold text-sm mb-1 truncate",
        isActive ? "text-white" : "text-gray-300"
      )}>
        {name}
      </h3>
      <p className="text-[11px] text-gray-500">{days}</p>
      
      {isActive && (
        <div className="mt-3 h-1 w-full bg-gray-800 rounded-full overflow-hidden">
          <div className="h-full bg-brand-blue w-2/3 shadow-glow-blue"></div>
        </div>
      )}
    </div>
  );
}
