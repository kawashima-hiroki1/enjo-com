import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  try {
    // 1) リクエストから Authorization を取る方法もあるけど、
    // 今回は「Cookieベースでセッション取る」より簡易にするため、
    // クライアント側でログインしている＝Cookieがある前提で進めたいところ。
    // ただし auth-helpers を使ってない構成ならトークン渡しの方が確実。
    //
    // ここは “トークン無し” で getUser() はできないので、
    // 確実にするならクライアントから Authorization: Bearer <access_token> を送ってください。
    //
    // → 実装を簡単にするため「Authorization 必須」にします。

    const auth = req.headers.get("authorization") || "";
    const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabaseAnon = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { data: userRes, error: userErr } = await supabaseAnon.auth.getUser(token);
    if (userErr || !userRes?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = userRes.user.id;

    // 2) 管理者クライアント（Service Role）でユーザー削除
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY! // ★絶対にクライアントに出さない
    );

    // (任意) 関連データ掃除：FK cascade を貼ってないならここで消す
    // await supabaseAdmin.from("favorites").delete().eq("user_id", userId);
    // await supabaseAdmin.from("profiles").delete().eq("id", userId);

    const { error: delErr } = await supabaseAdmin.auth.admin.deleteUser(userId);
    if (delErr) {
      return NextResponse.json({ error: delErr.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Server error" }, { status: 500 });
  }
}
