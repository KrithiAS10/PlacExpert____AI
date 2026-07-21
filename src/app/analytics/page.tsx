import { cookies } from "next/headers";
import { getUserData } from "@/lib/db-queries";
import { AnalyticsClient } from "@/components/AnalyticsClient";

export default async function AnalyticsPage() {
  const cookieStore = await cookies();
  const userEmail = cookieStore.get("user_email")?.value;
  const user = userEmail ? await getUserData(userEmail) : null;

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh] space-y-4">
        <div className="w-10 h-10 border-4 border-brand-cyan/20 border-t-brand-cyan rounded-full animate-spin" />
        <p className="text-gray-400 text-xs">Loading analytics data...</p>
      </div>
    );
  }

  // Sample chart data derived from user analytics if needed
  const chartData = user.analytics;

  return <AnalyticsClient user={user} chartData={chartData} />;
}
