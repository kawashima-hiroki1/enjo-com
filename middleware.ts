import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function middleware(req: NextRequest) {
  const secret = process.env.ADMIN_SECRET_PATH;
  const pathname = req.nextUrl.pathname;

  // 1) /admin 直打ちは常に潰す（存在を隠す）
  if (pathname === "/admin") {
    return NextResponse.rewrite(new URL("/404", req.url));
  }

  // 2) 秘密URLだけ admin を開ける（secretが無い場合は何もしない）
  if (!secret || pathname !== `/${secret}`) {
    return NextResponse.next();
  }

  // 3) ここから先は「秘密URLに来た人」のみ：ログイン＋権限チェック
  const res = NextResponse.next();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll: () => req.cookies.getAll(),
        setAll: (cookies) => {
          cookies.forEach(({ name, value, options }) => {
            res.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  // NOTE: サーバ側で保護する時は getClaims 推奨（セッション偽装耐性の注意点）:contentReference[oaicite:1]{index=1}
  const { data: claimsData } = await supabase.auth.getClaims();
  const claims = claimsData?.claims;

  // 未ログインならログインへ
  if (!claims?.sub) {
    const url = new URL("/login", req.url);
    return NextResponse.redirect(url);
  }

  // admins テーブルで role 判定（RLSで「自分の行は読める」になってる前提）
  const { data: adminRow } = await supabase
    .from("admins")
    .select("role")
    .eq("user_id", claims.sub)
    .single();

  if (!adminRow?.role || !["ADMIN", "POSTER"].includes(adminRow.role)) {
    return NextResponse.rewrite(new URL("/404", req.url));
  }

  return res;
}

export const config = {
  matcher: ["/:path*"],
};