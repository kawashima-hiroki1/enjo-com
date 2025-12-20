import { notFound } from "next/navigation";
import AdminDashboardClient from "./AdminDashboardClient";
import { createSupabaseServerClient } from "@/lib/supabaseServer";

export const dynamic = "force-dynamic";

export default async function Page() {
  const supabase = await createSupabaseServerClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) notFound();

  const { data: adminRow } = await supabase
    .from("admins")
    .select("role")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!adminRow?.role || !["ADMIN", "POSTER"].includes(adminRow.role)) notFound();

  return <AdminDashboardClient />;
}