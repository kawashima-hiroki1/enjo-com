import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
);

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    if (!email || typeof email !== "string") {
      return NextResponse.json({ exists: false }, { status: 400 });
    }

    // supabase-js v2 の admin API（登録メールの存在確認）
    const { data, error } = await supabaseAdmin.auth.admin.getUserByEmail(email.trim().toLowerCase());

    // error の内容は外に出さず、存在有無だけ返す
    if (error) return NextResponse.json({ exists: false });

    return NextResponse.json({ exists: !!data?.user });
  } catch {
    return NextResponse.json({ exists: false }, { status: 200 });
  }
}