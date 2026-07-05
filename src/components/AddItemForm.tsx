"use client";
import { useState } from "react";
import { KBItem } from "@/lib/db";

const CATEGORIES = [
  "PC・ハードウェア",
  "ソフトウェア・アプリ",
  "ネットワーク",
  "アカウント・権限",
  "セキュリティ",
  "その他",
];

interface Props {
  onAdded: (item: KBItem) => void;
  onCancel: () => void;
}

export default function AddItemForm({ onAdded, onCancel }: Props) {
  const [form, setForm] = useState({ question: "", answer: "", category: CATEGORIES[0], added_by: "" });
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.question.trim() || !form.answer.trim()) return;
    setLoading(true);
    const res = await fetch("/api/items", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      const item = await res.json() as KBItem;
      onAdded(item);
      setForm({ question: "", answer: "", category: CATEGORIES[0], added_by: "" });
    }
    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="bg-blue-50 border border-blue-200 rounded-xl p-5 flex flex-col gap-3">
      <h3 className="font-semibold text-blue-800 text-sm">新しいQ&Aを追加</h3>
      <input
        type="text"
        placeholder="質問"
        value={form.question}
        onChange={e => setForm(f => ({ ...f, question: e.target.value }))}
        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
        required
      />
      <textarea
        placeholder="回答"
        value={form.answer}
        onChange={e => setForm(f => ({ ...f, answer: e.target.value }))}
        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 min-h-[80px] resize-y"
        required
      />
      <div className="flex gap-2">
        <select
          value={form.category}
          onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
          className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          {CATEGORIES.map(c => <option key={c}>{c}</option>)}
        </select>
        <input
          type="text"
          placeholder="投稿者名（任意）"
          value={form.added_by}
          onChange={e => setForm(f => ({ ...f, added_by: e.target.value }))}
          className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
      </div>
      <div className="flex gap-2 justify-end">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          キャンセル
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "追加中..." : "追加する"}
        </button>
      </div>
    </form>
  );
}
