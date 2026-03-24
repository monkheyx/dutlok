import Database from "better-sqlite3";
import path from "path";

const dbPath = path.join(process.cwd(), "data", "dutlok.db");
const db = new Database(dbPath);
db.pragma("journal_mode = WAL");

console.log("Creating neighborhood_plots table...");

try {
  db.exec(`
    CREATE TABLE IF NOT EXISTS neighborhood_plots (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      map_id INTEGER NOT NULL DEFAULT 1,
      plot_id INTEGER NOT NULL,
      shard_index INTEGER NOT NULL DEFAULT 0,
      character_id INTEGER REFERENCES characters(id) ON DELETE SET NULL,
      character_name TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'requested',
      ranked_choice INTEGER NOT NULL DEFAULT 1,
      note TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    )
  `);
  console.log("Done — neighborhood_plots table created.");
} catch (err: any) {
  console.error("Error:", err.message);
}

db.close();
