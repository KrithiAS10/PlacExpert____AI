"use client";

import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/Sidebar";
import { Navbar } from "@/components/Navbar";

export function LayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  
  // Hide layout only for Login and Signup pages
  const isAuthPage = pathname === "/login" || pathname === "/signup";

  return (
    <div className="flex min-h-screen">
      {!isAuthPage && <Sidebar />}
      <div className={`flex-1 flex flex-col ${!isAuthPage ? 'ml-64' : ''}`}>
        {!isAuthPage && <Navbar />}
        <main className={`flex-1 ${!isAuthPage ? 'p-8' : ''}`}>
          {children}
        </main>
      </div>
    </div>
  );
}
