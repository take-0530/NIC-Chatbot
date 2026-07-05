import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

function getSecret() {
  return new TextEncoder().encode(process.env.JWT_SECRET ?? "fallback-secret-change-this");
}

async function getSessionFromRequest(req: NextRequest) {
  const token = req.cookies.get("session")?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getSecret());
    return payload as { sub: string; role: string; name: string };
  } catch {
    return null;
  }
}

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // 認証不要なパス
  if (
    pathname.startsWith("/login") ||
    pathname.startsWith("/api/auth/")
  ) {
    return NextResponse.next();
  }

  const session = await getSessionFromRequest(req);

  // 未ログイン → ログインページへ
  if (!session) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // 設定ページは管理者のみ
  if (pathname.startsWith("/settings") && session.role !== "admin") {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
