"use client";
import { useState, useEffect, useCallback } from "react";
import KBCard from "@/components/KBCard";
import AddItemForm from "@/components/AddItemForm";
import { KBItem } from "@/lib/db";

const CATEGORIES = [
  "すべて",
  "PC・ハードウェア",
  "ソフトウェア・アプリ",
  "ネットワーク",
  "アカウント・権限",
  "セキュリティ",
  "その他",
];

export default function KBContent({ isAdmin }: { isAdmin: boolean }) {
  const [items, setItems] = useState<KBItem[]>([]);
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("すべて");
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (category !== "すべて") params.set("category", category);
    const res = await fetch(`/api/items?${params}`);
    const data = await res.json() as KBItem[];
    setItems(data);
    setLoading(false);
  }, [q, category]);

  useEffect(() => {
    const timer = setTimeout(fetchItems, 200);
    return () => clearTimeout(timer);
  }, [fetchItems]);

  function handleDelete(id: string) {
    setItems(prev => prev.filter(item => item.id !== id));
  }

  function handleAdded(item: KBItem) {
    setItems(prev => [item, ...prev]);
    setShowForm(false);
  }

  return (
    <div className="flex-1 overflow-y-auto px-4 py-6">
      <div className="max-w-5xl mx-auto flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-2 flex-1">
            <input
              type="text"
              placeholder="キーワード検索..."
              value={q}
              onChange={e => setQ(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 w-full sm:w-64"
            />
            <div className="flex gap-1 flex-wrap">
              {CATEGORIES.map(c => (
                <button
                  key={c}
                  onClick={() => setCategory(c)}
                  className={`px-3 py-1.5 text-xs rounded-full border transition-colors ${
                    category === c
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-white text-gray-600 border-gray-300 hover:border-blue-400"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
          {isAdmin && (
            <button
              onClick={() => setShowForm(v => !v)}
              className="shrink-0 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
            >
              + 回答を追加
            </button>
          )}
        </div>

        {showForm && (
          <AddItemForm onAdded={handleAdded} onCancel={() => setShowForm(false)} />
        )}

        {loading ? (
          <p className="text-center text-gray-400 py-12">読み込み中...</p>
        ) : items.length === 0 ? (
          <p className="text-center text-gray-400 py-12">該当するナレッジがありません</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map(item => (
              <KBCard key={item.id} item={item} isAdmin={isAdmin} onDelete={handleDelete} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
