import { cookies } from "next/headers";
import { getUserData, getResources } from "@/lib/db-queries";
import { DashboardClient } from "@/components/DashboardClient";

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const userEmail = cookieStore.get("user_email")?.value;
  const user = userEmail ? await getUserData(userEmail) : null;
  const resources = await getResources();

  // Filter featured resources for recommendations
  const recommendations = resources.filter(r => r.isFeatured).slice(0, 3);

  return <DashboardClient user={user} recommendations={recommendations} />;
}
