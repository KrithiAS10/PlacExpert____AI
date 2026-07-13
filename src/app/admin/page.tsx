import { getAllUsers } from "@/lib/db-queries";
import { AdminClient } from "@/components/AdminClient";

export default async function AdminDashboardPage() {
  const users = await getAllUsers();

  return <AdminClient users={users} />;
}
