import { notFound } from "next/navigation";
import AdminDashboardClient from "./AdminDashboardClient";
import { createSupabaseServerClient } from "@/lib/supabaseServer";

export const dynamic = "force-dynamic"; // cookieを読むので静的化しない

export default async function Page() {
  const supabase = createSupabaseServerClient();

  // 1) 未ログインは404
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    notFound();
  }

  // 2) adminsテーブルで権限チェック（ADMIN/POSTER以外は404）
  const { data: adminRow, error } = await supabase
    .from("admins")
    .select("role")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) {
    // RLSや設定ミスの可能性もあるので、ログに出して404
    console.error("[admin guard] admins select error:", error);
    notFound();
  }

  if (!adminRow?.role || !["ADMIN", "POSTER"].includes(adminRow.role)) {
    notFound();
  }

  // 3) OKなら管理画面を表示
  return <AdminDashboardClient />;
}