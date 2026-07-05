"use client";
import { useState, useEffect } from "react";

export default function SettingsPage() {
  const [webhookUrl, setWebhookUrl] = useState("");
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/settings")
      .then(r => r.json())
      .then((d: { webhook_url: string }) => setWebhookUrl(d.webhook_url ?? ""));
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await fetch("/api/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ webhook_url: webhookUrl }),
    });
    setSaved(true);
    setLoading(false);
    setTimeout(() => setSaved(false), 2500);
  }

  return (
    <div className="flex-1 overflow-y-auto px-4 py-6">
      <div className="max-w-xl mx-auto">
        <h1 className="text-xl font-bold text-gray-800 mb-6">設定</h1>

        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <h2 className="font-semibold text-gray-700 mb-1">n8n Webhook URL</h2>
          <p className="text-xs text-gray-400 mb-4">
            設定するとチャット回答をn8n AIに委譲します。未設定または失敗時はナレッジベースで回答します。
          </p>
          <form onSubmit={handleSave} className="flex flex-col gap-3">
            <input
              type="url"
              placeholder="https://your-n8n.example.com/webhook/..."
              value={webhookUrl}
              onChange={e => setWebhookUrl(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {loading ? "保存中..." : "保存する"}
              </button>
              {saved && (
                <span className="text-sm text-green-600 font-medium">保存しました</span>
              )}
            </div>
          </form>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm mt-4">
          <h2 className="font-semibold text-gray-700 mb-3">回答の優先順位</h2>
          <ol className="text-sm text-gray-600 space-y-2 list-decimal list-inside">
            <li>ナレッジベース（キーワード検索）</li>
            <li>n8n Webhook → GPT-4o-mini（ナレッジにない場合）</li>
            <li>未登録メッセージ（SEへの問い合わせを案内）</li>
          </ol>
        </div>

        <a
          href="/settings/users"
          className="flex items-center justify-between bg-white border border-gray-200 rounded-xl p-6 shadow-sm mt-4 hover:shadow-md transition-shadow"
        >
          <div>
            <h2 className="font-semibold text-gray-700">ユーザー管理</h2>
            <p className="text-xs text-gray-400 mt-0.5">社員アカウントの追加・削除</p>
          </div>
          <span className="text-gray-300">→</span>
        </a>
      </div>
    </div>
  );
}
