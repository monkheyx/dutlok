import Database from "better-sqlite3";
import path from "path";

const dbPath = process.env.DATABASE_PATH || "./data/dutlok.db";
const resolvedPath = path.resolve(dbPath);
const db = new Database(resolvedPath);

db.exec(`
  CREATE TABLE IF NOT EXISTS registrations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    character_name TEXT NOT NULL,
    realm_slug TEXT NOT NULL,
    region TEXT NOT NULL DEFAULT 'us',
    submitted_by TEXT,
    notes TEXT,
    status TEXT NOT NULL DEFAULT 'pending',
    reviewed_by TEXT,
    reviewed_at TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  );
`);

console.log("Migration complete: registrations table created.");
