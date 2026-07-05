import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { randomUUID } from "crypto";
import db, { User } from "@/lib/db";
import { checkIsAdmin } from "@/lib/auth";

export async function GET() {
  if (!(await checkIsAdmin())) {
    return NextResponse.json({ error: "権限がありません" }, { status: 403 });
  }
  const users = db.prepare("SELECT id, name, email, role, created_at FROM users ORDER BY created_at ASC").all();
  return NextResponse.json(users);
}

export async function POST(req: NextRequest) {
  if (!(await checkIsAdmin())) {
    return NextResponse.json({ error: "権限がありません" }, { status: 403 });
  }
  const { name, email, password, role } = await req.json() as { name: string; email: string; password: string; role: string };

  if (!name || !email || !password) {
    return NextResponse.json({ error: "名前・メール・パスワードは必須です" }, { status: 400 });
  }

  const existing = db.prepare("SELECT id FROM users WHERE email = ?").get(email.toLowerCase());
  if (existing) {
    return NextResponse.json({ error: "このメールアドレスは既に登録されています" }, { status: 409 });
  }

  const id = randomUUID();
  const hash = bcrypt.hashSync(password, 10);
  const today = new Date().toISOString().split("T")[0];
  db.prepare("INSERT INTO users (id, name, email, password_hash, role, created_at) VALUES (?, ?, ?, ?, ?, ?)")
    .run(id, name, email.toLowerCase(), hash, role === "admin" ? "admin" : "user", today);

  const user = db.prepare("SELECT id, name, email, role, created_at FROM users WHERE id = ?").get(id);
  return NextResponse.json(user, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  if (!(await checkIsAdmin())) {
    return NextResponse.json({ error: "権限がありません" }, { status: 403 });
  }
  const { id } = await req.json() as { id: string };

  const target = db.prepare("SELECT * FROM users WHERE id = ?").get(id) as User | undefined;
  if (!target) return NextResponse.json({ error: "ユーザーが見つかりません" }, { status: 404 });

  // 管理者が1人だけの場合は削除不可
  if (target.role === "admin") {
    const adminCount = (db.prepare("SELECT COUNT(*) as c FROM users WHERE role = 'admin'").get() as { c: number }).c;
    if (adminCount <= 1) {
      return NextResponse.json({ error: "最後の管理者は削除できません" }, { status: 400 });
    }
  }

  db.prepare("DELETE FROM users WHERE id = ?").run(id);
  return NextResponse.json({ ok: true });
}
