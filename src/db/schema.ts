import { sqliteTable, text, integer, real, uniqueIndex } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

// Guild members represent real people who may have multiple characters
export const guildMembers = sqliteTable("guild_members", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  discordTag: text("discord_tag"),
  notes: text("notes"),
  isOfficer: integer("is_officer", { mode: "boolean" }).default(false),
  isActive: integer("is_active", { mode: "boolean" }).default(true),
  createdAt: text("created_at").default(sql`(datetime('now'))`),
  updatedAt: text("updated_at").default(sql`(datetime('now'))`),
});

// Characters linked to guild members
export const characters = sqliteTable(
  "characters",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    memberId: integer("member_id").references(() => guildMembers.id, { onDelete: "set null" }),
    name: text("name").notNull(),
    realm: text("realm").notNull(),
    realmSlug: text("realm_slug").notNull(),
    region: text("region").notNull().default("us"),
    faction: text("faction"),
    race: text("race"),
    className: text("class_name"),
    activeSpec: text("active_spec"),
    role: text("role"), // tank, healer, melee_dps, ranged_dps
    level: integer("level"),
    itemLevel: integer("item_level"),
    equippedItemLevel: integer("equipped_item_level"),
    guildRank: integer("guild_rank"),
    guildRankName: text("guild_rank_name"),
    avatarUrl: text("avatar_url"),
    renderUrl: text("render_url"),
    profileUrl: text("profile_url"),
    isMain: integer("is_main", { mode: "boolean" }).default(false),
    isActive: integer("is_active", { mode: "boolean" }).default(true),
    raidTeam: text("raid_team"),
    lastSyncedAt: text("last_synced_at"),
    blizzardId: integer("blizzard_id"),
    createdAt: text("created_at").default(sql`(datetime('now'))`),
    updatedAt: text("updated_at").default(sql`(datetime('now'))`),
  },
  (table) => ({
    nameRealmIdx: uniqueIndex("char_name_realm_region").on(table.name, table.realmSlug, table.region),
  })
);

// Detailed profile data stored as structured JSON alongside key fields
export const characterProfiles = sqliteTable("character_profiles", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  characterId: integer("character_id")
    .notNull()
    .references(() => characters.id, { onDelete: "cascade" }),
  // Stats
  strength: integer("strength"),
  agility: integer("agility"),
  intellect: integer("intellect"),
  stamina: integer("stamina"),
  criticalStrike: real("critical_strike"),
  haste: real("haste"),
  mastery: real("mastery"),
  versatility: real("versatility"),
  // Professions stored as JSON array
  professions: text("professions", { mode: "json" }),
  // Talents stored as JSON
  talents: text("talents", { mode: "json" }),
  // Full equipment stored as JSON
  equipment: text("equipment", { mode: "json" }),
  // Raid encounters stored as JSON
  encounters: text("encounters", { mode: "json" }),
  // M+ season details as JSON
  mythicPlusSeason: text("mythic_plus_season", { mode: "json" }),
  // PvP / M+ summary
  mythicPlusRating: real("mythic_plus_rating"),
  pvpRating: integer("pvp_rating"),
  // Raw API response for debugging
  rawProfileData: text("raw_profile_data", { mode: "json" }),
  snapshotAt: text("snapshot_at").default(sql`(datetime('now'))`),
});

// Sync job tracking
export const syncJobs = sqliteTable("sync_jobs", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  jobType: text("job_type").notNull(), // full_roster, single_character, guild_import
  status: text("status").notNull().default("pending"), // pending, running, completed, failed
  targetCharacterId: integer("target_character_id").references(() => characters.id),
  totalCharacters: integer("total_characters").default(0),
  processedCharacters: integer("processed_characters").default(0),
  failedCharacters: integer("failed_characters").default(0),
  errorLog: text("error_log", { mode: "json" }),
  startedAt: text("started_at"),
  completedAt: text("completed_at"),
  createdAt: text("created_at").default(sql`(datetime('now'))`),
});

// Raid teams / groups
export const raidTeams = sqliteTable("raid_teams", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  description: text("description"),
  isActive: integer("is_active", { mode: "boolean" }).default(true),
  createdAt: text("created_at").default(sql`(datetime('now'))`),
});

// App settings (key-value store)
export const settings = sqliteTable("settings", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
  updatedAt: text("updated_at").default(sql`(datetime('now'))`),
});

// Raid loot tracking
export const raidLoot = sqliteTable("raid_loot", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  characterId: integer("character_id").references(() => characters.id, { onDelete: "set null" }),
  characterName: text("character_name").notNull(),
  itemName: text("item_name").notNull(),
  itemId: integer("item_id"),
  itemQuality: text("item_quality"),
  itemLevel: integer("item_level"),
  bossName: text("boss_name"),
  raidName: text("raid_name"),
  raidDate: text("raid_date").notNull(),
  notes: text("notes"),
  awardedBy: text("awarded_by"),
  createdAt: text("created_at").default(sql`(datetime('now'))`),
});

// Character registration requests
export const registrations = sqliteTable("registrations", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  characterName: text("character_name").notNull(),
  realmSlug: text("realm_slug").notNull(),
  region: text("region").notNull().default("us"),
  submittedBy: text("submitted_by"), // discord tag or display name
  notes: text("notes"),
  status: text("status").notNull().default("pending"), // pending, approved, rejected
  reviewedBy: text("reviewed_by"),
  reviewedAt: text("reviewed_at"),
  createdAt: text("created_at").default(sql`(datetime('now'))`),
});

// Admin audit log
export const auditLog = sqliteTable("audit_log", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  action: text("action").notNull(),
  entityType: text("entity_type"),
  entityId: integer("entity_id"),
  details: text("details", { mode: "json" }),
  createdAt: text("created_at").default(sql`(datetime('now'))`),
});
