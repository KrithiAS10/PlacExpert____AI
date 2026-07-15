"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/Sidebar";
import { Navbar } from "@/components/Navbar";
import { X } from "lucide-react";

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = pathname === "/login" || pathname === "/signup";
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [user, setUser] = useState<any>(null);

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

  useEffect(() => {
    if (isAuthPage) return;
    
    async function fetchUser() {
      try {
        const res = await fetch("/api/roadmap");
        if (res.ok) {
          const data = await res.json();
          if (data.user) {
            setUser(data.user);
          }
        }
      } catch (err) {
        console.error("Failed to fetch user in LayoutWrapper:", err);
      }
    }
    
    fetchUser();
  }, [pathname, isAuthPage]); // Refetch user stats when page changes to keep sync

  return (
    <div className="flex min-h-screen">
      {!isAuthPage && (
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
      <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${!isAuthPage && sidebarOpen ? "lg:ml-64" : "lg:ml-0"}`}>
        {!isAuthPage && (
          <Navbar user={user} onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        )}
        <main className={`flex-1 ${!isAuthPage ? "p-4 sm:p-6 lg:p-8" : ""}`}>
          {children}
        </main>
      </div>
    </div>
  );
}
