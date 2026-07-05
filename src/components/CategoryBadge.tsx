const colorMap: Record<string, string> = {
  "PC・ハードウェア":   "bg-orange-100 text-orange-700",
  "ソフトウェア・アプリ": "bg-green-100 text-green-700",
  "ネットワーク":        "bg-sky-100 text-sky-700",
  "アカウント・権限":    "bg-purple-100 text-purple-700",
  "セキュリティ":        "bg-red-100 text-red-700",
  "その他":              "bg-gray-100 text-gray-600",
};

export default function CategoryBadge({ category }: { category: string }) {
  const cls = colorMap[category] ?? "bg-gray-100 text-gray-600";
  return (
    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${cls}`}>
      {category}
    </span>
  );
}
