import Database from "better-sqlite3";
import path from "path";

const dbPath = path.join(process.cwd(), "data", "dutlok.db");
const db = new Database(dbPath);
db.pragma("journal_mode = WAL");

console.log("Adding is_raider_alt column to characters...");

try {
  db.exec(`ALTER TABLE characters ADD COLUMN is_raider_alt INTEGER DEFAULT 0`);
  console.log("Done — is_raider_alt column added.");
} catch (err: any) {
  if (err.message.includes("duplicate column")) {
    console.log("Column already exists, skipping.");
  } else {
    throw err;
  }
}

db.close();
