import Database from "better-sqlite3";
import path from "path";
import fs from "fs";
import bcrypt from "bcryptjs";

export interface KBItem {
  id: string;
  question: string;
  answer: string;
  category: string;
  votes_up: number;
  votes_down: number;
  created_at: string;
  added_by: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  password_hash: string;
  role: "user" | "admin";
  created_at: string;
}

const DATA_DIR = path.join(process.cwd(), "data");
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR);

const db = new Database(path.join(DATA_DIR, "knowledge.db"));

db.exec(`
  CREATE TABLE IF NOT EXISTS items (
    id TEXT PRIMARY KEY,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    category TEXT NOT NULL,
    votes_up INTEGER DEFAULT 0,
    votes_down INTEGER DEFAULT 0,
    created_at TEXT NOT NULL,
    added_by TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'user',
    created_at TEXT NOT NULL
  );
`);

// ナレッジシードデータ
const itemCount = (db.prepare("SELECT COUNT(*) as c FROM items").get() as { c: number }).c;
if (itemCount === 0) {
  const insert = db.prepare(`
    INSERT INTO items (id, question, answer, category, votes_up, votes_down, created_at, added_by)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const seed: [string, string, string, string, number, number, string, string][] = [
    ["s1", "Windowsがブルースクリーンになった",   "① 最近のソフト・ドライバを確認\n② セーフモードで起動して切り分け\n③ エラーコードをメモしてSEへ連絡",              "PC・ハードウェア",      8,  0, "2024-06-01", "SE"],
    ["s2", "プリンターに接続できない",             "① 電源とケーブルを確認\n② 設定>デバイスでプリンター状態を確認\n③ ドライバーを再インストール",                       "PC・ハードウェア",      15, 2, "2024-06-05", "SE"],
    ["s3", "Outlookでメールが送受信できない",      "① インターネット接続を確認\n② Outlookを再起動\n③ 送受信タブから手動実行\n④ アカウント設定を確認",                  "ソフトウェア・アプリ",  20, 1, "2024-06-10", "SE"],
    ["s4", "Teamsの音声・カメラが使えない",        "① Teams設定>デバイスでマイク/カメラを確認\n② Windowsのプライバシー設定でアクセスを許可\n③ PCを再起動",            "ソフトウェア・アプリ",  11, 0, "2024-06-15", "社員"],
    ["s5", "パスワードを忘れた",                  "① ログイン画面の「パスワードを忘れた」からリセット\n② それでも無理な場合はSEに申請\n③ 次回から1Passwordなどのパスワードマネージャーを活用","アカウント・権限", 25, 0, "2024-06-20", "SE"],
    ["s6", "社内VPNに繋がらない",                "① VPNクライアントを再起動\n② ネットワーク接続を確認\n③ 会社のIPが変わっていないか確認\n④ SEに連絡",             "ネットワーク",          9,  1, "2024-06-25", "社員"],
  ];
  for (const row of seed) insert.run(...row);
}

// 管理者ユーザーを初期シード
const userCount = (db.prepare("SELECT COUNT(*) as c FROM users").get() as { c: number }).c;
if (userCount === 0) {
  const email = process.env.ADMIN_EMAIL ?? "admin@example.com";
  const password = process.env.ADMIN_PASSWORD ?? "admin123";
  const name = process.env.ADMIN_NAME ?? "管理者";
  const hash = bcrypt.hashSync(password, 10);
  const today = new Date().toISOString().split("T")[0];
  db.prepare(`INSERT INTO users (id, name, email, password_hash, role, created_at) VALUES (?, ?, ?, ?, 'admin', ?)`)
    .run("admin-seed", name, email, hash, today);
}

export default db;
