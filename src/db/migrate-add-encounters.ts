import Database from "better-sqlite3";
import path from "path";

const dbPath = process.env.DATABASE_PATH || "./data/dutlok.db";
const resolvedPath = path.resolve(dbPath);
const db = new Database(resolvedPath);

// Add encounters and mythic_plus_season columns to character_profiles
const columns = db.pragma("table_info(character_profiles)") as Array<{ name: string }>;
const columnNames = columns.map((c) => c.name);

if (!columnNames.includes("encounters")) {
  db.exec(`ALTER TABLE character_profiles ADD COLUMN encounters TEXT;`);
  console.log("Added encounters column.");
}

if (!columnNames.includes("mythic_plus_season")) {
  db.exec(`ALTER TABLE character_profiles ADD COLUMN mythic_plus_season TEXT;`);
  console.log("Added mythic_plus_season column.");
}

console.log("Migration complete: encounters and mythic_plus_season columns added.");
