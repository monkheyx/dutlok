import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

/**
 * Initialize the database — creates all tables and adds any missing columns.
 * Safe to call multiple times (uses IF NOT EXISTS / try-catch for ALTER).
 */
export function initializeDatabase() {
  const dbPath = process.env.DATABASE_PATH || "./data/dutlok.db";
  const resolvedPath = path.resolve(dbPath);
  const dir = path.dirname(resolvedPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const sqlite = new Database(resolvedPath);
  sqlite.pragma("journal_mode = WAL");
  sqlite.pragma("foreign_keys = ON");

  // ── Core tables ──
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS guild_members (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      discord_tag TEXT,
      notes TEXT,
      is_officer INTEGER DEFAULT 0,
      is_active INTEGER DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS characters (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      member_id INTEGER REFERENCES guild_members(id) ON DELETE SET NULL,
      name TEXT NOT NULL,
      realm TEXT NOT NULL,
      realm_slug TEXT NOT NULL,
      region TEXT NOT NULL DEFAULT 'us',
      faction TEXT,
      race TEXT,
      class_name TEXT,
      active_spec TEXT,
      role TEXT,
      level INTEGER,
      item_level INTEGER,
      equipped_item_level INTEGER,
      guild_rank INTEGER,
      guild_rank_name TEXT,
      avatar_url TEXT,
      render_url TEXT,
      profile_url TEXT,
      is_main INTEGER DEFAULT 0,
      is_active INTEGER DEFAULT 1,
      is_raider INTEGER DEFAULT 0,
      is_raider_alt INTEGER DEFAULT 0,
      raid_team TEXT,
      last_synced_at TEXT,
      blizzard_id INTEGER,
      notes TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE UNIQUE INDEX IF NOT EXISTS char_name_realm_region ON characters(name, realm_slug, region);

    CREATE TABLE IF NOT EXISTS character_profiles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      character_id INTEGER NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
      strength INTEGER,
      agility INTEGER,
      intellect INTEGER,
      stamina INTEGER,
      critical_strike REAL,
      haste REAL,
      mastery REAL,
      versatility REAL,
      professions TEXT,
      talents TEXT,
      equipment TEXT,
      encounters TEXT,
      mythic_plus_season TEXT,
      mythic_plus_rating REAL,
      pvp_rating INTEGER,
      raw_profile_data TEXT,
      snapshot_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS sync_jobs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      job_type TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      target_character_id INTEGER REFERENCES characters(id),
      total_characters INTEGER DEFAULT 0,
      processed_characters INTEGER DEFAULT 0,
      failed_characters INTEGER DEFAULT 0,
      error_log TEXT,
      started_at TEXT,
      completed_at TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS raid_teams (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      is_active INTEGER DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now'))
    );

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

    CREATE TABLE IF NOT EXISTS spell_icons (
      spell_id INTEGER PRIMARY KEY,
      icon_url TEXT NOT NULL,
      spell_name TEXT,
      cached_at TEXT
    );

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

    CREATE TABLE IF NOT EXISTS audit_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      action TEXT NOT NULL,
      entity_type TEXT,
      entity_id INTEGER,
      details TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );

    -- Tables added post-initial
    CREATE TABLE IF NOT EXISTS raid_attendance (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      raid_name TEXT NOT NULL,
      raid_date TEXT NOT NULL,
      difficulty TEXT,
      character_id INTEGER REFERENCES characters(id) ON DELETE SET NULL,
      character_name TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'present',
      notes TEXT,
      created_by TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS character_recipes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      character_id INTEGER NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
      character_name TEXT NOT NULL,
      profession_name TEXT NOT NULL,
      recipe_id INTEGER,
      recipe_name TEXT NOT NULL,
      tier_name TEXT,
      synced_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS craftable_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      item_name TEXT NOT NULL,
      profession_name TEXT NOT NULL,
      character_id INTEGER REFERENCES characters(id) ON DELETE SET NULL,
      character_name TEXT NOT NULL,
      notes TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS news_posts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      image_url TEXT,
      is_pinned INTEGER DEFAULT 0,
      created_by TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

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
    );
  `);

  // ── Add columns that may be missing on older DBs ──
  const safeAddColumn = (table: string, column: string, type: string) => {
    try {
      sqlite.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${type}`);
    } catch {
      // Column already exists — ignore
    }
  };

  safeAddColumn("characters", "is_raider", "INTEGER DEFAULT 0");
  safeAddColumn("characters", "is_raider_alt", "INTEGER DEFAULT 0");
  safeAddColumn("characters", "notes", "TEXT");
  safeAddColumn("news_posts", "created_by", "TEXT");
  safeAddColumn("raid_attendance", "created_by", "TEXT");

  sqlite.close();
  console.log("[DB] Database initialized at:", resolvedPath);
}
