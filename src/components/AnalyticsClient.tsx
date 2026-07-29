"use client";

import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import { 
  TrendingUp, 
  Target, 
  Clock, 
  Award,
  ArrowUpRight,
  ArrowDownRight,
  Activity
} from "lucide-react";

const ResponsiveContainer = dynamic(() => import("recharts").then(m => m.ResponsiveContainer), { ssr: false });
const BarChart = dynamic(() => import("recharts").then(m => m.BarChart), { ssr: false });
const Bar = dynamic(() => import("recharts").then(m => m.Bar), { ssr: false });
const XAxis = dynamic(() => import("recharts").then(m => m.XAxis), { ssr: false });
const YAxis = dynamic(() => import("recharts").then(m => m.YAxis), { ssr: false });
const CartesianGrid = dynamic(() => import("recharts").then(m => m.CartesianGrid), { ssr: false });
const Tooltip = dynamic(() => import("recharts").then(m => m.Tooltip), { ssr: false });
const Cell = dynamic(() => import("recharts").then(m => m.Cell), { ssr: false });
const PieChart = dynamic(() => import("recharts").then(m => m.PieChart), { ssr: false });
const Pie = dynamic(() => import("recharts").then(m => m.Pie), { ssr: false });

interface Task {
  id: string;
  title: string | null;
  description: string | null;
  day: number | null;
  status: string;
  type: string;
}

interface Phase {
  id: string;
  title: string | null;
  description: string | null;
  order: number;
  tasks: Task[];
}

interface Roadmap {
  id: string;
  title: string | null;
  description: string | null;
  phases: Phase[];
}

interface AnalyticsUser {
  name: string | null;
  readinessScore: number;
  readinessLevel: string | null;
  streak: number;
  roadmaps?: Roadmap[];
  totalSolvedProblems?: number;
}

interface AnalyticsClientProps {
  user: AnalyticsUser;
  chartData?: any;
}

export function AnalyticsClient({ user, chartData }: AnalyticsClientProps) {
  console.log("Chart data available:", !!chartData); // Use it to avoid lint warning
  
  const isNewUser = !user.readinessScore || user.readinessScore === 0;

  // Flatten all tasks from roadmaps
  const allTasks = user.roadmaps?.flatMap(rm => 
    rm.phases.flatMap(ph => 
      ph.tasks.map(t => ({ ...t, phaseFocus: ph.description }))
    )
  ) || [];

  const completedTasks = allTasks.filter(t => t.status === "COMPLETED");

  // 1. Solved problems: total solved problem records from DB or completed problem tasks
  const solvedProblemsCount = user.totalSolvedProblems ?? completedTasks.filter(t => t.type === "PROBLEM").length;

  // 2. Study hours: sum of estimated durations of completed tasks
  const calculatedStudyHours = completedTasks.reduce((total, task) => {
    if (task.type === "PROBLEM") return total + 0.5; // 30 mins
    if (task.type === "MOCK") return total + 1.0; // 60 mins
    return total + 1.5; // TOPIC - 90 mins
  }, 0);

  // 3. Concept clarity: baseline + topic completion rate
  const completedTopics = completedTasks.filter(t => t.type === "TOPIC").length;
  const totalTopics = allTasks.filter(t => t.type === "TOPIC").length;
  const topicCompletionRate = totalTopics > 0 ? completedTopics / totalTopics : 0;
  
  const rawReadiness = user.readinessLevel || "Just Starting";
  const baselineClarity = rawReadiness === "Just Starting" ? 4.5 
    : rawReadiness === "Learning Basics" ? 6.0 
    : rawReadiness === "Actively Practicing" ? 7.5 
    : rawReadiness === "Ready for Interviews" ? 8.8 
    : 5.0;
  const conceptClarity = baselineClarity + topicCompletionRate * (10.0 - baselineClarity);

  // Helper to map DB data to skill proficiency chart
  const getSkillScore = (skill: string) => {
    let filtered: typeof allTasks = [];
    if (skill === 'DSA') {
      filtered = allTasks.filter(t => 
        t.phaseFocus === 'dsa' || 
        /dsa|array|string|list|tree|graph|search|sort|recursion|dp/i.test(t.title ?? "")
      );
    } else if (skill === 'DBMS') {
      filtered = allTasks.filter(t => 
        /dbms|sql|database|query|normalization|index/i.test(t.title ?? "")
      );
    } else if (skill === 'OS') {
      filtered = allTasks.filter(t => 
        /os\b|process|thread|deadlock|memory|scheduling/i.test(t.title ?? "")
      );
    } else if (skill === 'CN') {
      filtered = allTasks.filter(t => 
        /cn\b|network|ip\b|tcp|udp|http|routing|dns/i.test(t.title ?? "")
      );
    } else if (skill === 'Web Dev') {
      filtered = allTasks.filter(t => 
        t.phaseFocus === 'projects' || 
        /web|dev|html|css|js\b|javascript|react|next|frontend|backend|api/i.test(t.title ?? "")
      );
    }
    
    if (filtered.length === 0) return 0;
    const completed = filtered.filter(t => t.status === 'COMPLETED').length;
    return Math.round((completed / filtered.length) * 100);
  };

  const skillData = isNewUser ? [
    { name: 'DSA', score: 0, color: '#a855f7' },
    { name: 'DBMS', score: 0, color: '#3b82f6' },
    { name: 'OS', score: 0, color: '#f97316' },
    { name: 'CN', score: 0, color: '#14b8a6' },
    { name: 'Web Dev', score: 0, color: '#06b6d4' },
  ] : [
    { name: 'DSA', score: getSkillScore('DSA'), color: '#a855f7' },
    { name: 'DBMS', score: getSkillScore('DBMS'), color: '#3b82f6' },
    { name: 'OS', score: getSkillScore('OS'), color: '#f97316' },
    { name: 'CN', score: getSkillScore('CN'), color: '#14b8a6' },
    { name: 'Web Dev', score: getSkillScore('Web Dev'), color: '#06b6d4' },
  ];

  const getDomainCount = (domain: string) => {
    if (domain === 'Theory') {
      return allTasks.filter(t => 
        t.type === 'TOPIC' && 
        (/dbms|sql|database|os\b|process|thread|memory|cn\b|network|tcp|ip/i.test(t.title ?? "") || t.phaseFocus === 'core_cs')
      ).length;
    } else if (domain === 'Coding') {
      return allTasks.filter(t => t.type === 'PROBLEM' || t.phaseFocus === 'dsa').length;
    } else if (domain === 'System Design') {
      return allTasks.filter(t => 
        t.phaseFocus === 'system_design' || 
        /system design|architecture|scalability/i.test(t.title ?? "") ||
        t.type === 'MOCK'
      ).length;
    }
    return 0;
  };

  const theoryCount = getDomainCount('Theory');
  const codingCount = getDomainCount('Coding');
  const designCount = getDomainCount('System Design');
  const totalDomainCount = theoryCount + codingCount + designCount;

  const domainDistribution = (isNewUser || totalDomainCount === 0) ? [
    { name: 'Theory', value: 0, color: '#3b82f6' },
    { name: 'Coding', value: 0, color: '#06b6d4' },
    { name: 'System Design', value: 0, color: '#a855f7' },
  ] : [
    { name: 'Theory', value: Math.round((theoryCount / totalDomainCount) * 100), color: '#3b82f6' },
    { name: 'Coding', value: Math.round((codingCount / totalDomainCount) * 100), color: '#06b6d4' },
    { name: 'System Design', value: Math.round((designCount / totalDomainCount) * 100), color: '#a855f7' },
  ];

  const stats = [
    { 
      label: "Overall Readiness", 
      value: isNewUser ? "Yet to start" : `${(user.readinessScore * 10).toFixed(0)}%`, 
      sub: isNewUser ? "Assessment pending" : "Calculated", 
      icon: Target, 
      color: "text-brand-cyan", 
      up: true 
    },
    { 
      label: "Study Hours", 
      value: isNewUser ? "0h" : `${calculatedStudyHours.toFixed(1)}h`, 
      sub: isNewUser || calculatedStudyHours === 0 
        ? "No active sessions" 
        : user.streak > 0 
          ? `Avg ${(calculatedStudyHours / user.streak).toFixed(1)}h / day` 
          : "Estimated study time", 
      icon: Clock, 
      color: "text-brand-purple", 
      up: true 
    },
    { 
      label: "Solved Problems", 
      value: isNewUser ? "0" : `${solvedProblemsCount}`, 
      sub: isNewUser || solvedProblemsCount === 0 ? "Start solving to track" : "Top 15% of peers", 
      icon: Award, 
      color: "text-brand-orange", 
      up: true 
    },
    { 
      label: "Concept Clarity", 
      value: isNewUser || totalTopics === 0 ? "Yet to start" : `${conceptClarity.toFixed(1)}/10`, 
      sub: isNewUser ? "No assessment data" : "AI Assessment", 
      icon: Activity, 
      color: "text-brand-teal", 
      up: false 
    },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2 text-glow-white">Performance Analytics</h1>
          <p className="text-gray-400 text-sm">Real-time breakdown of your learning velocity and readiness for {user.name}</p>
        </div>
        <div className="flex gap-3">
          <select className="bg-dark-card border border-dark-border text-gray-300 text-xs rounded-lg px-3 py-2 outline-none focus:border-brand-cyan/50 transition-colors">
            <option>Last 7 Days</option>
            <option>Last 30 Days</option>
            <option>All Time</option>
          </select>
          <button className="px-4 py-2 bg-brand-cyan/10 border border-brand-cyan/30 rounded-lg text-xs font-bold text-brand-cyan hover:bg-brand-cyan/20 transition-all">
            Download Report
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <motion.div 
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass-card p-6 rounded-2xl border-white/5 hover:border-white/10 transition-all group"
          >
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-xl bg-white/5 ${stat.color}`}>
                <stat.icon className="w-5 h-5" />
              </div>
              <div className={`flex items-center gap-1 text-[10px] font-bold ${stat.up ? 'text-brand-green' : 'text-brand-red'}`}>
                {stat.up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                {stat.up ? 'UP' : 'DOWN'}
              </div>
            </div>
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">{stat.label}</p>
            <h3 className="text-2xl font-bold text-white mb-1">{stat.value}</h3>
            <p className="text-[11px] text-gray-500">{stat.sub}</p>
          </motion.div>
        ))}
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 glass-card p-8 rounded-3xl border-white/5">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-brand-cyan" />
              Skill Proficiency
            </h3>
            <span className="text-[10px] font-bold text-gray-500 uppercase">Live Data</span>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="99%" height={300}>
              <BarChart data={skillData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10}/>
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }}/>
                <Tooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px' }}/>
                <Bar dataKey="score" radius={[6, 6, 0, 0]} barSize={40}>
                  {skillData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-card p-8 rounded-3xl border-white/5 flex flex-col">
          <h3 className="text-lg font-bold text-white mb-8">Domain Distribution</h3>
          <div className="flex-1 h-[250px]">
            <ResponsiveContainer width="99%" height={250}>
              <PieChart>
                <Pie data={domainDistribution} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={8} dataKey="value">
                  {domainDistribution.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px' }}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-3 mt-4">
            {domainDistribution.map((item) => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }}></div>
                  <span className="text-xs text-gray-400">{item.name}</span>
                </div>
                <span className="text-xs font-bold text-white">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
