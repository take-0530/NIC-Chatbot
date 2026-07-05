import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { checkIsAdmin } from "@/lib/auth";

const isAdmin = checkIsAdmin;

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "権限がありません" }, { status: 403 });
  }
  const { id } = await params;
  db.prepare("DELETE FROM items WHERE id = ?").run(id);
  return NextResponse.json({ ok: true });
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "権限がありません" }, { status: 403 });
  }
  const { id } = await params;
  const { question, answer, category } = await req.json() as { question: string; answer: string; category: string };
  if (!question || !answer || !category) {
    return NextResponse.json({ error: "question, answer, category は必須です" }, { status: 400 });
  }
  db.prepare("UPDATE items SET question=?, answer=?, category=? WHERE id=?").run(question, answer, category, id);
  const item = db.prepare("SELECT * FROM items WHERE id = ?").get(id);
  return NextResponse.json(item);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { type } = await req.json() as { type: "up" | "down" };

  if (type === "up") {
    db.prepare("UPDATE items SET votes_up = votes_up + 1 WHERE id = ?").run(id);
  } else {
    db.prepare("UPDATE items SET votes_down = votes_down + 1 WHERE id = ?").run(id);
  }

  const item = db.prepare("SELECT votes_up, votes_down FROM items WHERE id = ?").get(id) as { votes_up: number; votes_down: number };
  return NextResponse.json(item);
}
