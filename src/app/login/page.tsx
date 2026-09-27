"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Mail, Lock, ArrowRight, LogIn, Globe, Zap, CheckCircle2 } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const router = useRouter();

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Authentication failed");
      }

      setSuccessMsg("Signed in successfully!");
      setEmail("");
      setPassword("");
      
      router.push("/");
      router.refresh();
    } catch (err: any) {
      setErrorMsg(err.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    setErrorMsg("");
    
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    try {
      // First try to login Google Mock User
      let res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: "google_user@gmail.com", password: "google_mock_password" })
      });

      if (!res.ok) {
        // If user not found, register Google Mock User
        res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: "Google User",
            username: "google_user",
            email: "google_user@gmail.com",
            phone: "",
            password: "google_mock_password"
          })
        });
      }

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Google Sign-in failed");
      }

      setSuccessMsg("Signed in with Google!");
      
      if (!data.user?.domainInterest) {
        router.push("/profiling");
      } else {
        router.push("/");
      }
      router.refresh();
    } catch (err: any) {
      setErrorMsg(err.message || "Google Sign-in simulation failed");
    } finally {
      setGoogleLoading(false);
    }
  };

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
        className="w-full max-w-md relative z-10"
      >
        <div className="flex justify-center mb-8">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-12 h-12 bg-brand-cyan rounded-2xl flex items-center justify-center shadow-glow-cyan group-hover:scale-110 transition-transform">
              <Zap className="w-6 h-6 text-white fill-white" />
            </div>
            <span className="text-2xl font-bold text-white tracking-tight">PlacExpert-AI</span>
          </Link>
        </div>

        <div className="glass-card p-8 rounded-3xl border-white/5 shadow-2xl">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-white mb-2">Welcome Back</h1>
            <p className="text-gray-400 text-sm font-medium">Please enter your details to sign in</p>
          </div>

          {errorMsg && (
            <div className="p-3 mb-5 rounded-xl bg-brand-red/10 border border-brand-red/20 text-brand-red text-xs font-semibold">
              {errorMsg}
            </div>
          )}
          {successMsg && (
            <div className="p-3 mb-5 rounded-xl bg-brand-green/10 border border-brand-green/20 text-brand-green text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" /> {successMsg}
            </div>
          )}

          <form className="space-y-5" onSubmit={handleLoginSubmit}>
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Email or Username</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-brand-cyan transition-colors" />
                <input 
                  type="text" 
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-dark-bg border border-dark-border rounded-xl py-3 pl-12 pr-4 text-sm text-white focus:outline-none focus:border-brand-cyan/50 transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center px-1">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Password</label>
                <Link href="#" className="text-[10px] font-bold text-brand-cyan hover:underline uppercase tracking-tighter">Forgot Password?</Link>
              </div>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-brand-cyan transition-colors" />
                <input 
                  type="password" 
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-dark-bg border border-dark-border rounded-xl py-3 pl-12 pr-4 text-sm text-white focus:outline-none focus:border-brand-cyan/50 transition-all"
                />
              </div>
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-brand-cyan text-dark-bg font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-brand-cyan/90 transition-all shadow-glow-cyan mt-2 text-center text-sm cursor-pointer disabled:opacity-50"
            >
              {loading ? "Signing In..." : "Sign In"} <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-dark-border"></span>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-dark-card px-4 text-gray-500 font-medium">Or continue with</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button className="flex items-center justify-center gap-3 py-3 bg-dark-bg border border-dark-border rounded-xl text-sm text-white font-medium hover:bg-white/5 transition-all">
              <LogIn className="w-4 h-4" /> Github
            </button>
            <button 
              onClick={handleGoogleSignIn}
              disabled={googleLoading}
              className="flex items-center justify-center gap-3 py-3 bg-dark-bg border border-dark-border rounded-xl text-sm text-white font-medium hover:bg-white/5 transition-all disabled:opacity-50 cursor-pointer"
            >
              {googleLoading ? (
                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              ) : (
                <Globe className="w-4 h-4" />
              )}{" "}
              Google
            </button>
          </div>

          <p className="text-center mt-8 text-sm text-gray-500">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="text-brand-cyan font-bold hover:underline">Sign Up</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
