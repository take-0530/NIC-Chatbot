import { NextRequest, NextResponse } from "next/server";
import db, { KBItem } from "@/lib/db";

export async function POST(req: NextRequest) {
  const { question } = await req.json() as { question: string };

  if (!question?.trim()) {
    return NextResponse.json({ error: "question は必須です" }, { status: 400 });
  }

  // 1. ナレッジベースをまず検索（基本回答）
  const words = question.trim().split(/\s+/);
  const conditions = words.map(() => "(question LIKE ? OR answer LIKE ?)").join(" AND ");
  const bindings = words.flatMap(w => [`%${w}%`, `%${w}%`]);

  const items = db.prepare(
    `SELECT * FROM items WHERE ${conditions} ORDER BY votes_up DESC LIMIT 1`
  ).all(...bindings) as KBItem[];

  if (items.length > 0) {
    return NextResponse.json({ answer: items[0].answer, source: "kb", item: items[0] });
  }

  // 2. ナレッジになければ n8n（GPT-4o-mini）に委譲
  const setting = db.prepare("SELECT value FROM settings WHERE key = 'webhook_url'").get() as { value: string } | undefined;
  const webhookUrl = setting?.value?.trim();

  if (webhookUrl) {
    try {
      const res = await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
        signal: AbortSignal.timeout(8000),
      });
      if (res.ok) {
        const data = await res.json();
        const answer = data.answer ?? data.text ?? data.response ?? data.message ?? null;
        if (answer) {
          return NextResponse.json({ answer, source: "n8n" });
        }
      }
    } catch {
      // タイムアウトまたは接続エラー
    }
  }

  // 3. どちらも対応不可
  return NextResponse.json({
    answer: "申し訳ありません、その質問への回答が見つかりませんでした。SEに直接お問い合わせください。",
    source: "none",
  });
}
