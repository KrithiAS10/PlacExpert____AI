import { getUserData, getResources } from "@/lib/db-queries";
import { DashboardClient } from "@/components/DashboardClient";

export default async function DashboardPage() {
  // For demo purposes, we fetch the default seeded user
  const user = await getUserData("krithi@example.com");
  const resources = await getResources();

  if (!user) {
    // If database is not seeded or user missing, we could redirect or handle it
    // For now, let's just show a simple message or redirect to login
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <h1 className="text-2xl font-bold text-white">Database not initialized</h1>
        <p className="text-gray-400">Please run the seed script to populate data.</p>
        <code className="bg-dark-card p-4 rounded border border-dark-border text-brand-cyan">
          npx prisma db seed
        </code>
      </div>
    );
  }

  // Filter featured resources for recommendations
  const recommendations = resources.filter(r => r.isFeatured).slice(0, 3);

  return <DashboardClient user={user} recommendations={recommendations} />;
}
