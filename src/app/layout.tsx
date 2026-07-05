import type { Metadata } from "next";
import "./globals.css";
import Nav from "@/components/Nav";
import { getSession } from "@/lib/auth";

export const metadata: Metadata = {
  title: "ITサポートナレッジBot",
  description: "社内SE向けITサポートナレッジ共有チャットボット",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  return (
    <html lang="ja">
      <body className="bg-gray-50 antialiased">
        <Nav isAdmin={session?.role === "admin"} userName={session?.name ?? null} />
        <main className="pt-14 h-screen flex flex-col">
          {children}
        </main>
      </body>
    </html>
  );
}
