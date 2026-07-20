"use client";

import { motion } from "framer-motion";
import { 
  Users, 
  UserCheck, 
  Clock, 
  BarChart3, 
  Download,
  Lock,
  User,
  ShieldAlert,
  LogOut
} from "lucide-react";
import { useState, useEffect } from "react";
import Link from "next/link";

interface UserAdmin {
  id: string;
  name: string | null;
  email: string | null;
  username: string | null;
  phone: string | null;
  role: string;
  currentDay: number;
  readinessScore: number;
  streak: number;
  createdAt: string | Date;
  updatedAt: string | Date;
}

interface AdminClientProps {
  users: UserAdmin[];
}

export function AdminClient({ users }: AdminClientProps) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [adminUsername, setAdminUsername] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  // Check login state on load
  useEffect(() => {
    const authStatus = localStorage.getItem("admin_auth");
    if (authStatus === "true") {
      setIsAuthenticated(true);
    }
    setLoading(false);
  }, []);

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");

    if (adminUsername === "Soja" && adminPassword === "Soja789") {
      localStorage.setItem("admin_auth", "true");
      setIsAuthenticated(true);
      setAdminUsername("");
      setAdminPassword("");
    } else {
      setLoginError("Invalid username or password. Access denied.");
    }
  };

  const handleAdminLogout = () => {
    localStorage.removeItem("admin_auth");
    setIsAuthenticated(false);
  };

  // Convert all users to CSV and download
  const handleDownloadCSV = () => {
    const headers = [
      "ID", 
      "Name", 
      "Email", 
      "Username", 
      "Phone", 
      "Role", 
      "Roadmap Progress (Day)", 
      "Readiness Score", 
      "Streak", 
      "Created At",
      "Last Updated"
    ];

    const rows = users.map(u => [
      u.id,
      u.name || "",
      u.email || "",
      u.username || "",
      u.phone || "",
      u.role,
      `Day ${u.currentDay}`,
      u.readinessScore.toFixed(1),
      u.streak,
      new Date(u.createdAt).toLocaleString(),
      new Date(u.updatedAt).toLocaleString()
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(val => `"${String(val).replace(/"/g, '""')}"`).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "placeXpert_all_users_export.csv");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-brand-cyan/20 border-t-brand-cyan rounded-full animate-spin" />
      </div>
    );
  }

  // Render Login Card if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center px-4 relative overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
          <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-brand-cyan/10 blur-[120px] rounded-full animate-pulse"></div>
          <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-brand-purple/10 blur-[120px] rounded-full animate-pulse delay-500"></div>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md relative z-10"
        >
          <div className="text-center mb-8">
            <div className="w-14 h-14 bg-brand-cyan/10 border border-brand-cyan/30 rounded-2xl flex items-center justify-center shadow-glow-cyan mx-auto mb-4">
              <ShieldAlert className="w-7 h-7 text-brand-cyan" />
            </div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">Admin Portal</h1>
            <p className="text-gray-400 text-sm mt-2 font-medium">Access restricted to platform administrators</p>
          </div>

          <div className="glass-card p-8 rounded-3xl border-white/5 shadow-2xl">
            {loginError && (
              <div className="p-3 mb-6 rounded-xl bg-brand-red/10 border border-brand-red/20 text-brand-red text-xs font-bold">
                {loginError}
              </div>
            )}

            <form onSubmit={handleAdminLogin} className="space-y-5">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Username</label>
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-brand-cyan transition-colors" />
                  <input 
                    type="text" 
                    required
                    value={adminUsername}
                    onChange={(e) => setAdminUsername(e.target.value)}
                    placeholder="Enter admin username"
                    className="w-full bg-dark-bg border border-dark-border rounded-xl py-3 pl-12 pr-4 text-xs text-white focus:outline-none focus:border-brand-cyan/50 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Password</label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-brand-cyan transition-colors" />
                  <input 
                    type="password" 
                    required
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-dark-bg border border-dark-border rounded-xl py-3 pl-12 pr-4 text-xs text-white focus:outline-none focus:border-brand-cyan/50 transition-all"
                  />
                </div>
              </div>

              <button 
                type="submit"
                className="w-full py-3 bg-brand-cyan text-dark-bg font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-brand-cyan/90 transition-all shadow-glow-cyan text-xs mt-4 cursor-pointer"
              >
                Authenticate Dashboard
              </button>
            </form>

            <div className="text-center mt-6">
              <Link href="/" className="text-xs font-bold text-gray-500 hover:text-white transition-colors uppercase tracking-widest">
                Return to Site
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  // Calculate stats based on all users
  const totalUsers = users.length;
  const activeToday = users.filter(u => u.streak > 0).length;
  
  // Sort users in place by last updated for the display limit
  const sortedUsers = [...users].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  
  // Display only the recent 15 member updates
  const recentUsers = sortedUsers.slice(0, 15);

  return (
    <div className="max-w-7xl mx-auto space-y-8 p-4 sm:p-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-extrabold text-white tracking-tight">Admin Dashboard</h1>
            <span className="text-[10px] font-bold text-brand-green bg-brand-green/10 border border-brand-green/20 px-2.5 py-0.5 rounded-full uppercase tracking-widest flex items-center gap-1.5 animate-pulse">
              <div className="w-1.5 h-1.5 rounded-full bg-brand-green"></div> Secured
            </span>
          </div>
          <p className="text-gray-400 text-sm">Monitor user progression and preparation metrics live</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleDownloadCSV}
            className="px-5 py-2.5 bg-brand-cyan text-dark-bg font-bold rounded-xl flex items-center gap-2 hover:bg-brand-cyan/90 transition-all shadow-glow-cyan text-xs cursor-pointer"
          >
            <Download className="w-4 h-4" /> Download Data (CSV)
          </button>
          <button 
            onClick={handleAdminLogout}
            className="px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-xs font-bold text-gray-400 flex items-center gap-2 hover:text-brand-red hover:border-brand-red/30 transition-all cursor-pointer"
            title="Sign Out Admin"
          >
            <LogOut className="w-4 h-4" /> Log Out
          </button>
        </div>
      </div>

      {/* Top Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Total Users", value: totalUsers.toString(), sub: "In SQLite DB", icon: Users, color: "text-brand-cyan" },
          { label: "Active Streak Users", value: activeToday.toString(), sub: "Streak > 0", icon: UserCheck, color: "text-brand-green" },
          { label: "Average Progress", value: totalUsers > 0 ? `Day ${(users.reduce((acc, u) => acc + u.currentDay, 0) / totalUsers).toFixed(0)}` : "Day 0", sub: "Global Average", icon: Clock, color: "text-brand-orange" },
          { label: "Average Readiness", value: totalUsers > 0 ? `${((users.reduce((acc, u) => acc + u.readinessScore, 0) / totalUsers) * 10).toFixed(0)}%` : "0%", sub: "Global Average", icon: BarChart3, color: "text-brand-purple" },
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

      {/* Recent Activity Table */}
      <div className="glass-card rounded-[32px] border-white/5 overflow-hidden">
        <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
          <div>
            <h3 className="text-lg font-bold text-white">Recent Member Updates</h3>
            <p className="text-xs text-gray-500 mt-0.5">Showing the latest 10–20 updates in database. Complete set exported in file.</p>
          </div>
          <span className="text-[10px] font-bold px-3 py-1 rounded-full bg-white/5 border border-white/5 text-brand-cyan uppercase">
            Viewing {recentUsers.length} of {totalUsers}
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/5 text-[10px] font-bold text-gray-500 uppercase tracking-widest bg-dark-bg/30">
                <th className="px-6 py-4">User Info</th>
                <th className="px-6 py-4">Username & Phone</th>
                <th className="px-6 py-4">Roadmap Position</th>
                <th className="px-6 py-4">Readiness Score</th>
                <th className="px-6 py-4">Daily Streak</th>
                <th className="px-6 py-4">Last Update</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {recentUsers.map((user) => (
                <tr key={user.id} className="hover:bg-white/5 transition-colors group">
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-sm font-bold text-white leading-tight">{user.name || "N/A"}</p>
                      <p className="text-[10px] text-gray-500">{user.email || "N/A"}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-xs text-gray-300 font-medium leading-tight">@{user.username || "n/a"}</p>
                      <p className="text-[10px] text-gray-500">{user.phone || "No phone number"}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-xs font-semibold text-gray-300">
                    Day {user.currentDay}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-dark-bg rounded-full overflow-hidden">
                        <div className={`h-full bg-brand-cyan`} style={{ width: `${Math.min(100, user.readinessScore * 10)}%` }}></div>
                      </div>
                      <span className="text-[10px] font-bold text-white">{user.readinessScore.toFixed(1)}/10</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-xs font-medium text-brand-orange">
                    🔥 {user.streak} days
                  </td>
                  <td className="px-6 py-4 text-xs text-gray-500">
                    {new Date(user.updatedAt).toLocaleString()}
                  </td>
                </tr>
              ))}
              {recentUsers.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-xs text-gray-500 italic">
                    No users registered in database yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
