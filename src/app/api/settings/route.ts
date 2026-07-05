import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";

export async function GET() {
  const row = db.prepare("SELECT value FROM settings WHERE key = 'webhook_url'").get() as { value: string } | undefined;
  return NextResponse.json({ webhook_url: row?.value ?? "" });
}

export async function POST(req: NextRequest) {
  const { webhook_url } = await req.json() as { webhook_url: string };
  db.prepare("INSERT INTO settings (key, value) VALUES ('webhook_url', ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value")
    .run(webhook_url ?? "");
  return NextResponse.json({ ok: true });
}
