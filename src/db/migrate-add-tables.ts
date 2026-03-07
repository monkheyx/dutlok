import Database from "better-sqlite3";
import path from "path";

const dbPath = process.env.DATABASE_PATH || "./data/dutlok.db";
const resolvedPath = path.resolve(dbPath);
const db = new Database(resolvedPath);

db.exec(`
  CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS raid_loot (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    character_id INTEGER REFERENCES characters(id) ON DELETE SET NULL,
    character_name TEXT NOT NULL,
    item_name TEXT NOT NULL,
    item_id INTEGER,
    item_quality TEXT,
    item_level INTEGER,
    boss_name TEXT,
    raid_name TEXT,
    raid_date TEXT NOT NULL,
    notes TEXT,
    awarded_by TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  );
`);

console.log("Migration complete: settings and raid_loot tables created.");
