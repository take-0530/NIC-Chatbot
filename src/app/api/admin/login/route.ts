import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  const { password } = await req.json() as { password: string };
  const adminPassword = process.env.ADMIN_PASSWORD ?? "admin";

  if (password !== adminPassword) {
    return NextResponse.json({ error: "パスワードが違います" }, { status: 401 });
  }

  const sessionValue = crypto
    .createHash("sha256")
    .update(adminPassword + "itbot-salt")
    .digest("hex");

  const res = NextResponse.json({ ok: true });
  res.cookies.set("admin_session", sessionValue, {
    httpOnly: true,
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7日間
    sameSite: "lax",
  });
  return res;
}
