"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Mail, Lock, User, ArrowRight, UserPlus, Globe, Zap, ShieldCheck } from "lucide-react";

export default function SignupPage() {
  return (
    <div className="min-h-screen bg-dark-bg flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-cyan/10 blur-[120px] rounded-full animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-brand-purple/10 blur-[120px] rounded-full animate-pulse delay-700"></div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg relative z-10"
      >
        <div className="flex justify-center mb-8">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-12 h-12 bg-brand-cyan rounded-2xl flex items-center justify-center shadow-glow-cyan group-hover:scale-110 transition-transform">
              <Zap className="w-6 h-6 text-white fill-white" />
            </div>
            <span className="text-2xl font-bold text-white tracking-tight">PlaceXpert-AI</span>
          </Link>
        </div>

        <div className="glass-card p-10 rounded-[32px] border-white/5 shadow-2xl">
          <div className="text-center mb-10">
            <h1 className="text-2xl font-bold text-white mb-2">Create Account</h1>
            <p className="text-gray-400 text-sm font-medium">Join 5,000+ students on their journey to top tech roles</p>
          </div>

          <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Full Name</label>
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-brand-cyan transition-colors" />
                  <input 
                    type="text" 
                    placeholder="John Doe"
                    className="w-full bg-dark-bg border border-dark-border rounded-xl py-3 pl-12 pr-4 text-sm text-white focus:outline-none focus:border-brand-cyan/50 transition-all"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Email Address</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-brand-cyan transition-colors" />
                  <input 
                    type="email" 
                    placeholder="john@example.com"
                    className="w-full bg-dark-bg border border-dark-border rounded-xl py-3 pl-12 pr-4 text-sm text-white focus:outline-none focus:border-brand-cyan/50 transition-all"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Password</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-brand-cyan transition-colors" />
                <input 
                  type="password" 
                  placeholder="At least 8 characters"
                  className="w-full bg-dark-bg border border-dark-border rounded-xl py-3 pl-12 pr-4 text-sm text-white focus:outline-none focus:border-brand-cyan/50 transition-all"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 px-1">
              <input type="checkbox" id="terms" className="accent-brand-cyan w-4 h-4 rounded bg-dark-bg border-dark-border" />
              <label htmlFor="terms" className="text-xs text-gray-500 font-medium">
                I agree to the <Link href="#" className="text-brand-cyan hover:underline">Terms of Service</Link> and <Link href="#" className="text-brand-cyan hover:underline">Privacy Policy</Link>
              </label>
            </div>

            <Link 
              href="/"
              className="w-full py-3.5 bg-brand-cyan text-dark-bg font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-brand-cyan/90 transition-all shadow-glow-cyan text-center"
            >
              Start Free Trial <ArrowRight className="w-4 h-4" />
            </Link>
          </form>

          <div className="relative my-10">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-dark-border"></span>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-dark-card px-4 text-gray-500 font-medium">Or join with</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button className="flex items-center justify-center gap-3 py-3 bg-dark-bg border border-dark-border rounded-xl text-sm text-white font-medium hover:bg-white/5 transition-all">
              <UserPlus className="w-4 h-4" /> Github
            </button>
            <button className="flex items-center justify-center gap-3 py-3 bg-dark-bg border border-dark-border rounded-xl text-sm text-white font-medium hover:bg-white/5 transition-all">
              <Globe className="w-4 h-4" /> Google
            </button>
          </div>

          <div className="mt-10 p-4 rounded-2xl bg-brand-cyan/5 border border-brand-cyan/10 flex items-center gap-4">
            <div className="w-10 h-10 bg-brand-cyan/10 rounded-full flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5 text-brand-cyan" />
            </div>
            <p className="text-[10px] text-gray-400 font-medium leading-relaxed">
              Your data is encrypted and secure. We never share your information with third parties.
            </p>
          </div>

          <p className="text-center mt-10 text-sm text-gray-500 font-medium">
            Already have an account?{" "}
            <Link href="/login" className="text-brand-cyan font-bold hover:underline">Sign In</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
