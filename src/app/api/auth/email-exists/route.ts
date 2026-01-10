import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!, // ← VercelのEnvironment Variablesに必須
  { auth: { persistSession: false } }
);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const email = String(body?.email ?? "").trim().toLowerCase();
    if (!email) return NextResponse.json({ exists: false });

    const perPage = 1000;
    const maxPages = 10;
    for (let page = 1; page <= maxPages; page++) {
      const { data, error } = await supabaseAdmin.auth.admin.listUsers({
        page,
        perPage,
      });

      if (error) return NextResponse.json({ exists: false });

      const users = data?.users ?? [];
      const exists = users.some(
        (u) => (u.email ?? "").toLowerCase() === email
      );
      if (exists) return NextResponse.json({ exists: true });

      // これ以上ページが無い
      if (users.length < perPage) break;
    }

    return NextResponse.json({ exists: false });
  } catch {
    return NextResponse.json({ exists: false });
  }
}
