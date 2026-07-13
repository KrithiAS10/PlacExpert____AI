"use client";

import { useState } from "react";
import { 
  Send, 
  Mic, 
  Video, 
  Settings, 
  MoreHorizontal,
  ChevronRight,
  Target,
  Brain,
  Database,
  Globe,
  Monitor,
  Code
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const domains = [
  { id: 'dsa', name: 'DSA', icon: Brain, color: 'text-brand-purple', bg: 'bg-brand-purple/10' },
  { id: 'dbms', name: 'DBMS', icon: Database, color: 'text-brand-blue', bg: 'bg-brand-blue/10' },
  { id: 'os', name: 'OS', icon: Monitor, color: 'text-brand-orange', bg: 'bg-brand-orange/10' },
  { id: 'cn', name: 'CN', icon: Globe, color: 'text-brand-teal', bg: 'bg-brand-teal/10' },
  { id: 'web', name: 'Web Dev', icon: Code, color: 'text-brand-cyan', bg: 'bg-brand-cyan/10' },
];

const mockMessages = [
  { role: 'ai', content: "Hello! I'm your AI interviewer today. Ready to dive into some Technical questions? Which domain would you like to start with?" },
];

export default function MockInterviewPage() {
  const [selectedDomain, setSelectedDomain] = useState<string | null>(null);
  const [messages, setMessages] = useState(mockMessages);
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (!input.trim()) return;
    const newMessages = [...messages, { role: 'user', content: input }];
    setMessages(newMessages);
    setInput("");
    
    // Simulate AI response
    setTimeout(() => {
      setMessages(prev => [...prev, { 
        role: 'ai', 
        content: `That's an interesting perspective on ${selectedDomain || 'the topic'}. Can you elaborate on the time complexity of that approach?` 
      }]);
    }, 1000);
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">AI Mock Interview</h1>
          <p className="text-gray-400 text-sm">Practice technical interviews with real-time feedback</p>
        </div>
        <div className="flex gap-2">
          <button className="p-2 bg-dark-card border border-dark-border rounded-lg text-gray-400 hover:text-white transition-colors">
            <Settings className="w-5 h-5" />
          </button>
          <button className="p-2 bg-dark-card border border-dark-border rounded-lg text-gray-400 hover:text-white transition-colors">
            <MoreHorizontal className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-6 overflow-hidden">
        {/* Left Sidebar: Settings & Domains */}
        <div className="lg:col-span-1 space-y-6 overflow-y-auto pr-2">
          <div className="glass-card p-5 rounded-2xl space-y-4">
            <h3 className="text-sm font-bold text-white mb-2">Select Domain</h3>
            <div className="space-y-2">
              {domains.map((domain) => (
                <button
                  key={domain.id}
                  onClick={() => setSelectedDomain(domain.id)}
                  className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all ${
                    selectedDomain === domain.id 
                      ? 'bg-white/5 border-brand-cyan/50 ring-1 ring-brand-cyan/20' 
                      : 'bg-transparent border-dark-border hover:border-white/10'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg ${domain.bg} flex items-center justify-center`}>
                      <domain.icon className={`w-4 h-4 ${domain.color}`} />
                    </div>
                    <span className={`text-sm font-medium ${selectedDomain === domain.id ? 'text-white' : 'text-gray-400'}`}>
                      {domain.name}
                    </span>
                  </div>
                  {selectedDomain === domain.id && <ChevronRight className="w-4 h-4 text-brand-cyan" />}
                </button>
              ))}
            </div>
          </div>

          <div className="glass-card p-5 rounded-2xl">
            <h3 className="text-sm font-bold text-white mb-4">Session Stats</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-500">Duration</span>
                <span className="text-xs text-white font-mono">12:45</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-500">Questions</span>
                <span className="text-xs text-white font-mono">3 / 10</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-500">Current Score</span>
                <span className="text-xs text-brand-cyan font-bold">7.5/10</span>
              </div>
            </div>
          </div>
        </div>

        {/* Middle: Chat Interface */}
        <div className="lg:col-span-2 flex flex-col glass-card rounded-3xl overflow-hidden border-dark-border/50">
          <div className="p-4 border-b border-dark-border bg-white/5 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-brand-cyan/10 rounded-full flex items-center justify-center">
                <Target className="w-5 h-5 text-brand-cyan" />
              </div>
              <div>
                <p className="text-sm font-bold text-white">PlaceXpert AI</p>
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                  <p className="text-[10px] text-gray-500 font-medium uppercase tracking-widest">Active Session</p>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <button className="p-2 text-gray-400 hover:text-white transition-colors">
                <Mic className="w-5 h-5" />
              </button>
              <button className="p-2 text-gray-400 hover:text-white transition-colors">
                <Video className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            <AnimatePresence initial={false}>
              {messages.map((msg, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[80%] p-4 rounded-2xl text-sm ${
                    msg.role === 'user' 
                      ? 'bg-brand-cyan text-dark-bg font-medium rounded-tr-none' 
                      : 'bg-dark-card border border-dark-border text-gray-300 rounded-tl-none'
                  }`}>
                    {msg.content}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          <div className="p-4 border-t border-dark-border bg-white/5">
            <div className="relative flex items-center gap-2">
              <input 
                type="text" 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Type your answer here..."
                className="flex-1 bg-dark-bg border border-dark-border rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-brand-cyan/50 transition-all"
              />
              <button 
                onClick={handleSend}
                className="w-12 h-12 bg-brand-cyan text-dark-bg rounded-xl flex items-center justify-center hover:bg-brand-cyan/90 transition-all shadow-glow-cyan"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Right Sidebar: Real-time Feedback */}
        <div className="lg:col-span-1 space-y-6 overflow-y-auto pr-2">
          <div className="glass-card p-5 rounded-2xl bg-gradient-to-br from-brand-purple/10 to-transparent border-brand-purple/20">
            <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
              <Brain className="w-4 h-4 text-brand-purple" />
              AI Insights
            </h3>
            <div className="space-y-4">
              <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                <p className="text-[10px] text-brand-purple font-bold uppercase mb-1">Key Concept Detection</p>
                <p className="text-xs text-gray-300">You mentioned <span className="text-white font-bold">Dynamic Programming</span>. Good start, but try to explain the memoization part more clearly.</p>
              </div>
              <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                <p className="text-[10px] text-brand-cyan font-bold uppercase mb-1">Communication Tip</p>
                <p className="text-xs text-gray-300">Your pace is a bit fast. Take a breath after explaining complex logic.</p>
              </div>
            </div>
          </div>

          <div className="glass-card p-5 rounded-2xl">
            <h3 className="text-sm font-bold text-white mb-4">Topic Coverage</h3>
            <div className="space-y-4">
              {[
                { name: 'Complexity Analysis', progress: 80 },
                { name: 'Data Structures', progress: 45 },
                { name: 'System Design', progress: 10 },
              ].map((topic) => (
                <div key={topic.name} className="space-y-1.5">
                  <div className="flex justify-between text-[10px]">
                    <span className="text-gray-400">{topic.name}</span>
                    <span className="text-white">{topic.progress}%</span>
                  </div>
                  <div className="h-1 bg-dark-bg rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-brand-cyan shadow-glow-cyan" 
                      style={{ width: `${topic.progress}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
