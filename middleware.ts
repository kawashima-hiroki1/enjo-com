import { NextResponse, type NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const secret = process.env.ADMIN_SECRET_PATH;
  const pathname = req.nextUrl.pathname;

  // /admin は存在を隠す
  if (pathname === "/admin") {
    // App Router だと /_not-found が確実にあるのでここに飛ばす
    return NextResponse.rewrite(new URL("/_not-found", req.url));
  }

  // 秘密URLだけ /admin を表示（内部rewrite）
  if (secret && pathname === `/${secret}`) {
    return NextResponse.rewrite(new URL("/admin", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/:path*"],
};