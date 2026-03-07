import { db, schema } from "@/db";
import { eq } from "drizzle-orm";

// --- Enchant & Gem Audit ---

interface EnchantAudit {
  characterId: number;
  characterName: string;
  className: string | null;
  activeSpec: string | null;
  itemLevel: number | null;
  missingEnchants: string[];
  missingGems: string[];
  totalMissing: number;
}

// Slots that should always have enchants
const ENCHANTABLE_SLOTS = ["BACK", "CHEST", "WRIST", "LEGS", "FEET", "FINGER_1", "FINGER_2", "MAIN_HAND"];

export function getEnchantGemAudit(): EnchantAudit[] {
  const characters = db
    .select()
    .from(schema.characters)
    .where(eq(schema.characters.isActive, true))
    .all();

  const results: EnchantAudit[] = [];

  for (const char of characters) {
    const profile = db
      .select()
      .from(schema.characterProfiles)
      .where(eq(schema.characterProfiles.characterId, char.id))
      .get();

    const missingEnchants: string[] = [];
    const missingGems: string[] = [];

    if (profile?.equipment) {
      const equipment = parseJson(profile.equipment);
      if (Array.isArray(equipment)) {
        for (const item of equipment) {
          const slotType = item?.slot?.type;
          if (!slotType) continue;

          // Check enchants
          if (ENCHANTABLE_SLOTS.includes(slotType)) {
            if (!item.enchantments || item.enchantments.length === 0) {
              missingEnchants.push(item.slot?.name || slotType);
            }
          }

          // Check gems in socketed items
          if (item.sockets && item.sockets.length > 0) {
            for (const socket of item.sockets) {
              if (!socket.item) {
                missingGems.push(item.slot?.name || slotType);
              }
            }
          }
        }
      }
    }

    results.push({
      characterId: char.id,
      characterName: char.name,
      className: char.className,
      activeSpec: char.activeSpec,
      itemLevel: char.equippedItemLevel ?? char.itemLevel,
      missingEnchants,
      missingGems,
      totalMissing: missingEnchants.length + missingGems.length,
    });
  }

  // Sort by most missing first, then by ilvl desc
  results.sort((a, b) => {
    if (b.totalMissing !== a.totalMissing) return b.totalMissing - a.totalMissing;
    return (b.itemLevel ?? 0) - (a.itemLevel ?? 0);
  });

  return results;
}

// --- Raid Progression Audit ---

const RAID_DIFFICULTIES = ["Mythic", "Heroic", "Champion", "Veteran"] as const;

interface BossKill {
  bossName: string;
  difficulty: string;
  killCount: number;
}

interface RaidProgress {
  raidName: string;
  bosses: BossKill[];
  totalBosses: number;
  killed: Record<string, number>; // difficulty -> count killed
}

export interface RaidAudit {
  characterId: number;
  characterName: string;
  className: string | null;
  activeSpec: string | null;
  itemLevel: number | null;
  raids: RaidProgress[];
}

export function getRaidAudit(): RaidAudit[] {
  const characters = db
    .select()
    .from(schema.characters)
    .where(eq(schema.characters.isActive, true))
    .all();

  const results: RaidAudit[] = [];

  for (const char of characters) {
    const profile = db
      .select()
      .from(schema.characterProfiles)
      .where(eq(schema.characterProfiles.characterId, char.id))
      .get();

    const raids: RaidProgress[] = [];

    if (profile?.encounters) {
      const encounterData = parseJson(profile.encounters);
      if (encounterData?.expansions) {
        // Get the latest expansion's raids
        for (const expansion of encounterData.expansions) {
          if (!expansion?.instances) continue;
          for (const instance of expansion.instances) {
            const raidName = instance?.instance?.name;
            if (!raidName) continue;

            const bosses: BossKill[] = [];
            let totalBosses = 0;
            const killed: Record<string, number> = {};

            if (instance.modes) {
              for (const mode of instance.modes) {
                const difficulty = mode?.difficulty?.name;
                if (!difficulty) continue;

                let bossCount = 0;
                let killedCount = 0;

                if (mode.progress?.encounters) {
                  bossCount = mode.progress.encounters.length;
                  for (const enc of mode.progress.encounters) {
                    if (enc.completed_count > 0) {
                      killedCount++;
                      bosses.push({
                        bossName: enc.encounter?.name || "Unknown",
                        difficulty,
                        killCount: enc.completed_count,
                      });
                    }
                  }
                }

                if (bossCount > totalBosses) totalBosses = bossCount;
                killed[difficulty] = killedCount;
              }
            }

            raids.push({ raidName, bosses, totalBosses, killed });
          }
        }
      }
    }

    results.push({
      characterId: char.id,
      characterName: char.name,
      className: char.className,
      activeSpec: char.activeSpec,
      itemLevel: char.equippedItemLevel ?? char.itemLevel,
      raids,
    });
  }

  // Sort by ilvl desc
  results.sort((a, b) => (b.itemLevel ?? 0) - (a.itemLevel ?? 0));
  return results;
}

// --- Great Vault Audit ---

export interface VaultAudit {
  characterId: number;
  characterName: string;
  className: string | null;
  activeSpec: string | null;
  mythicPlusRating: number | null;
  weeklyMythicRuns: number;
  bestRuns: Array<{ dungeon: string; level: number; timed: boolean }>;
}

export function getVaultAudit(): VaultAudit[] {
  const characters = db
    .select()
    .from(schema.characters)
    .where(eq(schema.characters.isActive, true))
    .all();

  const results: VaultAudit[] = [];

  for (const char of characters) {
    const profile = db
      .select()
      .from(schema.characterProfiles)
      .where(eq(schema.characterProfiles.characterId, char.id))
      .get();

    let weeklyMythicRuns = 0;
    const bestRuns: Array<{ dungeon: string; level: number; timed: boolean }> = [];

    if (profile?.mythicPlusSeason) {
      const seasonData = parseJson(profile.mythicPlusSeason);
      if (seasonData?.best_runs && Array.isArray(seasonData.best_runs)) {
        for (const run of seasonData.best_runs) {
          bestRuns.push({
            dungeon: run?.dungeon?.name || "Unknown",
            level: run?.keystone_level || 0,
            timed: run?.is_completed_within_time || false,
          });
        }
        weeklyMythicRuns = bestRuns.length;
      }
    }

    results.push({
      characterId: char.id,
      characterName: char.name,
      className: char.className,
      activeSpec: char.activeSpec,
      mythicPlusRating: profile?.mythicPlusRating ?? null,
      weeklyMythicRuns: weeklyMythicRuns,
      bestRuns,
    });
  }

  results.sort((a, b) => (b.mythicPlusRating ?? 0) - (a.mythicPlusRating ?? 0));
  return results;
}

// --- Dungeon Audit ---

export interface DungeonAudit {
  characterId: number;
  characterName: string;
  className: string | null;
  activeSpec: string | null;
  mythicPlusRating: number | null;
  bestRuns: Array<{ dungeon: string; level: number; timed: boolean; duration: number }>;
}

export function getDungeonAudit(): DungeonAudit[] {
  const characters = db
    .select()
    .from(schema.characters)
    .where(eq(schema.characters.isActive, true))
    .all();

  const results: DungeonAudit[] = [];

  for (const char of characters) {
    const profile = db
      .select()
      .from(schema.characterProfiles)
      .where(eq(schema.characterProfiles.characterId, char.id))
      .get();

    const bestRuns: Array<{ dungeon: string; level: number; timed: boolean; duration: number }> = [];

    if (profile?.mythicPlusSeason) {
      const seasonData = parseJson(profile.mythicPlusSeason);
      if (seasonData?.best_runs && Array.isArray(seasonData.best_runs)) {
        for (const run of seasonData.best_runs) {
          bestRuns.push({
            dungeon: run?.dungeon?.name || "Unknown",
            level: run?.keystone_level || 0,
            timed: run?.is_completed_within_time || false,
            duration: run?.duration || 0,
          });
        }
      }
    }

    results.push({
      characterId: char.id,
      characterName: char.name,
      className: char.className,
      activeSpec: char.activeSpec,
      mythicPlusRating: profile?.mythicPlusRating ?? null,
      bestRuns,
    });
  }

  results.sort((a, b) => (b.mythicPlusRating ?? 0) - (a.mythicPlusRating ?? 0));
  return results;
}

// --- Professions Audit ---

export interface ProfessionEntry {
  characterId: number;
  characterName: string;
  className: string | null;
  professionName: string;
  skillPoints: number;
  maxSkillPoints: number;
}

export function getProfessionsAudit(): ProfessionEntry[] {
  const characters = db
    .select()
    .from(schema.characters)
    .where(eq(schema.characters.isActive, true))
    .all();

  const results: ProfessionEntry[] = [];

  for (const char of characters) {
    const profile = db
      .select()
      .from(schema.characterProfiles)
      .where(eq(schema.characterProfiles.characterId, char.id))
      .get();

    if (profile?.professions) {
      const profs = parseJsonArray(profile.professions);
      for (const prof of profs) {
        if (prof?.name) {
          results.push({
            characterId: char.id,
            characterName: char.name,
            className: char.className,
            professionName: prof.name,
            skillPoints: prof.skillPoints ?? 0,
            maxSkillPoints: prof.maxSkillPoints ?? 0,
          });
        }
      }
    }
  }

  // Sort by profession name, then skill points desc
  results.sort((a, b) => {
    if (a.professionName !== b.professionName) return a.professionName.localeCompare(b.professionName);
    return b.skillPoints - a.skillPoints;
  });

  return results;
}

function parseJsonArray(val: unknown): any[] {
  if (!val) return [];
  let parsed = val;
  if (typeof parsed === "string") {
    try { parsed = JSON.parse(parsed); } catch { return []; }
  }
  if (typeof parsed === "string") {
    try { parsed = JSON.parse(parsed); } catch { return []; }
  }
  if (Array.isArray(parsed)) return parsed;
  return [];
}

function parseJson(val: unknown): any {
  if (!val) return null;
  if (typeof val === "string") {
    try { return JSON.parse(val); } catch { return null; }
  }
  return val;
}
