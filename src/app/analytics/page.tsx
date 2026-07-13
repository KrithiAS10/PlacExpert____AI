import { getUserData } from "@/lib/db-queries";
import { AnalyticsClient } from "@/components/AnalyticsClient";

export default async function AnalyticsPage() {
  const user = await getUserData("krithi@example.com");

  if (!user) {
    return <div className="p-8 text-white">Please seed the database.</div>;
  }

  // Sample chart data derived from user analytics if needed
  const chartData = user.analytics;

  return <AnalyticsClient user={user} chartData={chartData} />;
}
