"use client";
import { useState, useEffect } from "react";

interface User {
  id: string;
  name: string;
  email: string;
  role: "user" | "admin";
  created_at: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "user" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);

  useEffect(() => {
    fetch("/api/settings/users").then(r => r.json()).then(setUsers);
  }, []);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/settings/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      const user = await res.json() as User;
      setUsers(prev => [...prev, user]);
      setForm({ name: "", email: "", password: "", role: "user" });
      setShowForm(false);
    } else {
      const data = await res.json() as { error?: string };
      setError(data.error ?? "追加に失敗しました");
    }
    setLoading(false);
  }

  async function handleDelete(user: User) {
    const res = await fetch("/api/settings/users", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: user.id }),
    });
    if (res.ok) {
      setUsers(prev => prev.filter(u => u.id !== user.id));
    } else {
      const data = await res.json() as { error?: string };
      alert(data.error ?? "削除に失敗しました");
    }
    setDeleteTarget(null);
  }

  return (
    <div className="flex-1 overflow-y-auto px-4 py-6">
      <div className="max-w-2xl mx-auto flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-800">ユーザー管理</h1>
          <button
            onClick={() => { setShowForm(v => !v); setError(""); }}
            className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
          >
            + ユーザーを追加
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleAdd} className="bg-blue-50 border border-blue-200 rounded-xl p-5 flex flex-col gap-3">
            <h3 className="font-semibold text-blue-800 text-sm">新しいユーザー</h3>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text" placeholder="名前" value={form.name} required
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <input
                type="email" placeholder="メールアドレス" value={form.email} required
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <input
                type="password" placeholder="初期パスワード" value={form.password} required
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <select
                value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                <option value="user">一般ユーザー</option>
                <option value="admin">管理者</option>
              </select>
            </div>
            {error && <p className="text-xs text-red-500">{error}</p>}
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50">キャンセル</button>
              <button type="submit" disabled={loading} className="px-4 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50">
                {loading ? "追加中..." : "追加する"}
              </button>
            </div>
          </form>
        )}

        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">名前</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">メール</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">権限</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">登録日</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id} className="border-b border-gray-100 last:border-0">
                  <td className="px-4 py-3 font-medium text-gray-800">{u.name}</td>
                  <td className="px-4 py-3 text-gray-500">{u.email}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${u.role === "admin" ? "bg-purple-100 text-purple-700" : "bg-gray-100 text-gray-600"}`}>
                      {u.role === "admin" ? "管理者" : "一般"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-400">{u.created_at}</td>
                  <td className="px-4 py-3 text-right">
                    {deleteTarget?.id === u.id ? (
                      <div className="flex items-center justify-end gap-2">
                        <span className="text-xs text-gray-500">削除しますか？</span>
                        <button onClick={() => handleDelete(u)} className="text-xs text-red-500 hover:text-red-700">はい</button>
                        <button onClick={() => setDeleteTarget(null)} className="text-xs text-gray-400 hover:text-gray-600">いいえ</button>
                      </div>
                    ) : (
                      <button onClick={() => setDeleteTarget(u)} className="text-gray-300 hover:text-red-400 text-xs transition-colors">✕</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
