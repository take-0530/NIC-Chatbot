"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const links = [
  { href: "/",         label: "チャット" },
  { href: "/kb",       label: "ナレッジ" },
  { href: "/settings", label: "設定", adminOnly: true },
];

interface Props {
  isAdmin: boolean;
  userName: string | null;
}

export default function Nav({ isAdmin, userName }: Props) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  const visibleLinks = links.filter(l => !l.adminOnly || isAdmin);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <span className="font-bold text-blue-600 text-lg">ITサポートBot</span>
          <nav className="flex gap-1">
            {visibleLinks.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  pathname === href || (href !== "/" && pathname.startsWith(href))
                    ? "bg-blue-100 text-blue-700"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                {label}
              </Link>
            ))}
          </nav>
        </div>
        {userName && (
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-500">{userName}</span>
            <button
              onClick={handleLogout}
              className="text-xs text-gray-400 hover:text-red-500 transition-colors"
            >
              ログアウト
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
