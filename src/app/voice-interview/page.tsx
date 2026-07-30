"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function VoiceInterviewRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/mock-interview");
  }, [router]);

  return (
    <div className="flex h-[60vh] flex-col items-center justify-center space-y-4">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-cyan border-t-transparent" />
      <p className="text-sm font-medium text-gray-400">Redirecting to Voice Mock Interview...</p>
    </div>
  );
}
