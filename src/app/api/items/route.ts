import { NextRequest, NextResponse } from "next/server";
import db, { KBItem } from "@/lib/db";
import { randomUUID } from "crypto";
import { checkIsAdmin } from "@/lib/auth";

const isAdmin = checkIsAdmin;

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") ?? "";
  const category = searchParams.get("category") ?? "";

  let query = "SELECT * FROM items WHERE 1=1";
  const params: string[] = [];

  if (q) {
    query += " AND (question LIKE ? OR answer LIKE ?)";
    params.push(`%${q}%`, `%${q}%`);
  }
  if (category) {
    query += " AND category = ?";
    params.push(category);
  }
  query += " ORDER BY votes_up DESC, created_at DESC";

  const items = db.prepare(query).all(...params) as KBItem[];
  return NextResponse.json(items);
}

export async function POST(req: NextRequest) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "権限がありません" }, { status: 403 });
  }
  const body = await req.json();
  const { question, answer, category, added_by } = body;

  if (!question || !answer || !category) {
    return NextResponse.json({ error: "question, answer, category は必須です" }, { status: 400 });
  }

  const id = randomUUID();
  const created_at = new Date().toISOString().split("T")[0];

  db.prepare(`
    INSERT INTO items (id, question, answer, category, votes_up, votes_down, created_at, added_by)
    VALUES (?, ?, ?, ?, 0, 0, ?, ?)
  `).run(id, question, answer, category, created_at, added_by ?? "社員");

  const item = db.prepare("SELECT * FROM items WHERE id = ?").get(id) as KBItem;
  return NextResponse.json(item, { status: 201 });
}
