import { getAllUsers } from "@/lib/db-queries";
import { AdminClient } from "@/components/AdminClient";

export default async function AdminDashboardPage() {
  const rawUsers = await getAllUsers();

  // Convert Date objects to ISO strings to prevent Next.js serialization errors
  const serializedUsers = rawUsers.map((u) => ({
    ...u,
    createdAt: u.createdAt.toISOString(),
    updatedAt: u.updatedAt.toISOString(),
  }));

  return <AdminClient users={serializedUsers} />;
}
