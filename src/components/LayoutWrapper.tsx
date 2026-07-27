"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Sidebar } from "@/components/Sidebar";
import { Navbar } from "@/components/Navbar";
import { X, Zap, Mail, Lock, User, Phone, Globe, ArrowRight, ShieldCheck, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  
  // Exclude /login, /signup, and /admin routes from student session checks
  const isAuthPage = pathname === "/login" || pathname === "/signup" || pathname?.startsWith("/admin");
  
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [sessionChecked, setSessionChecked] = useState(false);
  const [authMode, setAuthMode] = useState<"register" | "login">("register");
  const [googleLoading, setGoogleLoading] = useState(false);
  
  // Form states
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Initialize sidebar collapsed state based on initial screen width
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  async function fetchUser() {
    try {
      const res = await fetch("/api/roadmap");
      if (res.ok) {
        const data = await res.json();
        if (data.user) {
          setUser({
            ...data.user,
            weakAreas: data.weakAreas || [],
          });
        } else {
          setUser(null);
        }
      } else {
        setUser(null);
      }
    } catch (err) {
      console.error("Failed to fetch user in LayoutWrapper:", err);
      setUser(null);
    } finally {
      setSessionChecked(true);
    }
  }

  useEffect(() => {
    if (isAuthPage) {
      setSessionChecked(true);
      return;
    }
    fetchUser();
  }, [pathname, isAuthPage]);

  // Handle Form Submit
  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    const endpoint = authMode === "register" ? "/api/auth/register" : "/api/auth/login";
    const body = authMode === "register" 
      ? { name, username, email, phone, password }
      : { identifier: email, password }; // email field functions as identifier in login UI

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Authentication failed");
      }

      setSuccessMsg(authMode === "register" ? "Registered successfully!" : "Signed in successfully!");
      
      // Clear forms
      setName("");
      setUsername("");
      setEmail("");
      setPhone("");
      setPassword("");

      // Fetch user data to update state
      await fetchUser();
      
      // Redirect to profiling if it's a new user and doesn't have a roadmap yet
      if (authMode === "register") {
        router.push("/profiling");
      } else {
        router.refresh();
      }
    } catch (err: any) {
      setErrorMsg(err.message || "An unexpected error occurred");
    }
  };

  // Simulate Google login
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
      await fetchUser();
      
      // Redirect to profiling if new
      if (!data.user?.domainInterest) {
        router.push("/profiling");
      } else {
        router.refresh();
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Google Sign-in simulation failed");
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    router.push("/");
  };

  return (
    <div className="flex min-h-screen">
      {/* Sidebar - hidden if auth page or no logged in user */}
      {!isAuthPage && user && (
        <>
          {/* Mobile backdrop overlay */}
          {sidebarOpen && (
            <div
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
          )}

          {/* Sidebar — animated translate based on sidebarOpen state */}
          <div className={`fixed left-0 top-0 h-screen z-50 transition-transform duration-300 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
            {/* Close button on mobile views */}
            <button
              onClick={() => setSidebarOpen(false)}
              className="absolute top-4 -right-12 p-2 bg-dark-card border border-dark-border rounded-xl text-gray-400 hover:text-white transition-colors lg:hidden"
            >
              <X className="w-5 h-5" />
            </button>
            <Sidebar user={user} />
          </div>
        </>
      )}

      {/* Main content wrapper — padding adapts if sidebar is opened/closed */}
      <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${!isAuthPage && sidebarOpen && user ? "lg:ml-64" : "lg:ml-0"}`}>
        {!isAuthPage && user && (
          <Navbar user={user} onMenuClick={() => setSidebarOpen(!sidebarOpen)} onLogout={handleLogout} />
        )}
        
        <main className={`flex-1 ${!isAuthPage && user ? "p-4 sm:p-6 lg:p-8" : ""}`}>
          {!sessionChecked ? (
            // Full screen loader while checking session
            <div className="min-h-screen flex flex-col items-center justify-center space-y-4">
              <div className="w-12 h-12 border-4 border-brand-cyan/20 border-t-brand-cyan rounded-full animate-spin" />
              <p className="text-gray-400 text-sm font-medium">Loading PlaceXpert-AI...</p>
            </div>
          ) : !isAuthPage && !user ? (
            // Blurry background container to show dashboard layout beneath popup
            <div className="relative min-h-[85vh] filter blur-md select-none pointer-events-none p-4 sm:p-8 max-w-7xl mx-auto opacity-40">
              {children}
            </div>
          ) : (
            children
          )}
        </main>
      </div>

      {/* Modern Glassmorphism Onboarding Registration/Login Popup Modal */}
      <AnimatePresence>
        {sessionChecked && !isAuthPage && !user && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-md p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="w-full max-w-lg bg-dark-card/90 border border-white/10 rounded-[32px] p-6 sm:p-10 shadow-2xl relative overflow-hidden my-8"
            >
              {/* Background Glows */}
              <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
                <div className="absolute -top-12 -left-12 w-48 h-48 bg-brand-cyan/10 blur-[80px] rounded-full" />
                <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-brand-purple/10 blur-[80px] rounded-full" />
              </div>

              {/* Logo / Brand Header */}
              <div className="flex flex-col items-center text-center mb-8 relative z-10">
                <div className="w-12 h-12 bg-brand-cyan rounded-2xl flex items-center justify-center shadow-glow-cyan mb-4">
                  <Zap className="w-6 h-6 text-white fill-white" />
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">PlaceXpert-AI</h2>
                <p className="text-gray-400 text-sm mt-2 max-w-xs">
                  AI-Powered prep roadmap built to help you land top tech roles.
                </p>
              </div>

              {/* Authentication Mode Switcher */}
              <div className="flex border-b border-dark-border mb-6 relative z-10">
                <button
                  onClick={() => { setAuthMode("register"); setErrorMsg(""); setSuccessMsg(""); }}
                  className={`flex-1 pb-3 text-sm font-bold uppercase tracking-wider transition-colors ${
                    authMode === "register" ? "text-brand-cyan border-b-2 border-brand-cyan" : "text-gray-500 hover:text-white"
                  }`}
                >
                  Create Account
                </button>
                <button
                  onClick={() => { setAuthMode("login"); setErrorMsg(""); setSuccessMsg(""); }}
                  className={`flex-1 pb-3 text-sm font-bold uppercase tracking-wider transition-colors ${
                    authMode === "login" ? "text-brand-cyan border-b-2 border-brand-cyan" : "text-gray-500 hover:text-white"
                  }`}
                >
                  Sign In
                </button>
              </div>

              {/* Error and Success Banners */}
              {errorMsg && (
                <div className="p-3 mb-5 rounded-xl bg-brand-red/10 border border-brand-red/20 text-brand-red text-xs font-semibold relative z-10">
                  {errorMsg}
                </div>
              )}
              {successMsg && (
                <div className="p-3 mb-5 rounded-xl bg-brand-green/10 border border-brand-green/20 text-brand-green text-xs font-semibold flex items-center gap-2 relative z-10">
                  <CheckCircle2 className="w-4 h-4" /> {successMsg}
                </div>
              )}

              {/* Authentication Form */}
              <form onSubmit={handleAuthSubmit} className="space-y-4 relative z-10">
                {authMode === "register" && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Full Name</label>
                      <div className="relative group">
                        <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-brand-cyan transition-colors" />
                        <input
                          type="text"
                          required
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="John Doe"
                          className="w-full bg-dark-bg border border-dark-border rounded-xl py-2.5 pl-10 pr-4 text-xs text-white focus:outline-none focus:border-brand-cyan/50 transition-all"
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Username</label>
                      <div className="relative group">
                        <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-brand-cyan transition-colors" />
                        <input
                          type="text"
                          required
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          placeholder="johndoe"
                          className="w-full bg-dark-bg border border-dark-border rounded-xl py-2.5 pl-10 pr-4 text-xs text-white focus:outline-none focus:border-brand-cyan/50 transition-all"
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">
                    {authMode === "register" ? "Email Address" : "Username / Email / Phone"}
                  </label>
                  <div className="relative group">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-brand-cyan transition-colors" />
                    <input
                      type="text"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={authMode === "register" ? "name@example.com" : "Enter email, username, or phone"}
                      className="w-full bg-dark-bg border border-dark-border rounded-xl py-2.5 pl-10 pr-4 text-xs text-white focus:outline-none focus:border-brand-cyan/50 transition-all"
                    />
                  </div>
                </div>

                {authMode === "register" && (
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Phone Number (Optional)</label>
                    <div className="relative group">
                      <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-brand-cyan transition-colors" />
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+1 (555) 000-0000"
                        className="w-full bg-dark-bg border border-dark-border rounded-xl py-2.5 pl-10 pr-4 text-xs text-white focus:outline-none focus:border-brand-cyan/50 transition-all"
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Password</label>
                  <div className="relative group">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-brand-cyan transition-colors" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-dark-bg border border-dark-border rounded-xl py-2.5 pl-10 pr-4 text-xs text-white focus:outline-none focus:border-brand-cyan/50 transition-all"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-brand-cyan text-dark-bg font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-brand-cyan/90 transition-all shadow-glow-cyan text-xs mt-4"
                >
                  {authMode === "register" ? "Register & Setup Profile" : "Sign In to Dashboard"} <ArrowRight className="w-4 h-4" />
                </button>
              </form>

              {/* Divider */}
              <div className="relative my-6 z-10">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-dark-border"></span>
                </div>
                <div className="relative flex justify-center text-[10px]">
                  <span className="bg-dark-card px-4 text-gray-500 font-bold uppercase tracking-widest">Or continue with</span>
                </div>
              </div>

              {/* Google Sign In Option */}
              <div className="relative z-10">
                <button
                  onClick={handleGoogleSignIn}
                  disabled={googleLoading}
                  className="w-full flex items-center justify-center gap-3 py-3 bg-dark-bg border border-dark-border rounded-xl text-xs text-white font-bold hover:bg-white/5 transition-all disabled:opacity-50"
                >
                  {googleLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                      Connecting to Google Account...
                    </>
                  ) : (
                    <>
                      <Globe className="w-4 h-4 text-brand-cyan" /> Sign In with Google
                    </>
                  )}
                </button>
              </div>

              {/* Privacy Footer */}
              <div className="mt-6 p-4 rounded-2xl bg-brand-cyan/5 border border-brand-cyan/10 flex items-center gap-3 relative z-10">
                <ShieldCheck className="w-5 h-5 text-brand-cyan shrink-0" />
                <p className="text-[9px] text-gray-400 leading-relaxed">
                  Your data is protected. All profiles start from scratch ("Yet to start") with no dummy records.
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
