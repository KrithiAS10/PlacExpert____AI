"use client";

import { motion } from "framer-motion";
import { 
  Users, 
  UserCheck, 
  Clock, 
  BarChart3, 
  MoreVertical,
  Download
} from "lucide-react";
import { useState } from "react";
import { WalletConnect } from "./WalletConnect";

interface UserAdmin {
  id: string;
  name: string | null;
  email: string | null;
  role: string;
  currentDay: number;
  readinessScore: number;
}

interface AdminClientProps {
  users: UserAdmin[];
}

export function AdminClient({ users }: AdminClientProps) {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);

  if (!walletAddress) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-12">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-white tracking-tight">Owner Dashboard</h1>
          <p className="text-gray-400 max-w-md mx-auto">
            This dashboard contains sensitive user data. Please connect your administrative wallet to verify your identity.
          </p>
        </div>
        
        <div className="glass-card p-12 rounded-[40px] border-white/5 relative overflow-hidden group">
          <div className="absolute -top-24 -left-24 w-48 h-48 bg-brand-cyan/10 blur-[80px] group-hover:bg-brand-cyan/20 transition-all"></div>
          <WalletConnect onConnect={setWalletAddress} />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold text-white">Owner Dashboard</h1>
            <span className="text-[10px] font-bold text-brand-green bg-brand-green/10 border border-brand-green/20 px-2 py-0.5 rounded-full uppercase tracking-widest">Authenticated</span>
          </div>
          <p className="text-gray-400 text-sm">Monitor user progression live from database</p>
        </div>
        <div className="flex items-center gap-3">
          <WalletConnect onConnect={setWalletAddress} onDisconnect={() => setWalletAddress(null)} />
          <button className="px-4 py-2 bg-dark-card border border-dark-border rounded-lg text-xs font-bold text-gray-400 flex items-center gap-2 hover:text-white transition-all">
            <Download className="w-4 h-4" /> Export Data
          </button>
        </div>
      </div>

      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Total Users", value: users.length.toString(), sub: "In Database", icon: Users, color: "text-brand-cyan" },
          { label: "Active Today", value: users.length.toString(), sub: "Live Session", icon: UserCheck, color: "text-brand-green" },
          { label: "Avg. Roadmap", value: "Day 15", sub: "Calculated", icon: Clock, color: "text-brand-orange" },
          { label: "AI Health", value: "98.2%", sub: "Service Status", icon: BarChart3, color: "text-brand-purple" },
        ].map((stat, i) => (
          <motion.div 
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass-card p-6 rounded-2xl border-white/5"
          >
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-xl bg-white/5 ${stat.color}`}>
                <stat.icon className="w-5 h-5" />
              </div>
            </div>
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">{stat.label}</p>
            <h3 className="text-2xl font-bold text-white mb-1">{stat.value}</h3>
            <p className="text-[11px] text-gray-500">{stat.sub}</p>
          </motion.div>
        ))}
      </div>

      {/* User Table */}
      <div className="glass-card rounded-3xl border-white/5 overflow-hidden">
        <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/5">
          <h3 className="text-lg font-bold text-white">Live User Data</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/5 text-[10px] font-bold text-gray-500 uppercase tracking-widest bg-dark-bg/30">
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Roadmap</th>
                <th className="px-6 py-4">Readiness</th>
                <th className="px-6 py-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-white/5 transition-colors group">
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-sm font-bold text-white leading-tight">{user.name}</p>
                      <p className="text-[10px] text-gray-500">{user.email}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full text-brand-green bg-brand-green/10 border border-brand-green/20 uppercase`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs font-medium text-gray-300">
                    Day {user.currentDay}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1 bg-dark-bg rounded-full overflow-hidden">
                        <div className={`h-full bg-brand-cyan`} style={{ width: `${user.readinessScore * 10}%` }}></div>
                      </div>
                      <span className="text-[10px] font-bold text-white">{user.readinessScore}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button className="p-1.5 text-gray-600 hover:text-white transition-colors">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
