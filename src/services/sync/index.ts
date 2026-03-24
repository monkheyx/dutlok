import { db, schema } from "@/db";
import { eq, and } from "drizzle-orm";
import * as blizzard from "@/services/blizzard/client";
import type {
  BlizzardCharacterProfile,
  BlizzardCharacterMedia,
  BlizzardStats,
  BlizzardEquipment,
  BlizzardProfessions,
  BlizzardMythicKeystoneProfile,
  BlizzardGuildRoster,
} from "@/services/blizzard/types";
import { inferRole } from "@/lib/wow-data";
import { extractSpellIdsFromTalents, cacheSpellIcons } from "@/services/spell-icons";

/**
 * Import the full guild roster from Blizzard API.
 * Creates characters that don't exist yet, updates those that do.
 */
export async function importGuildRoster(): Promise<{
  imported: number;
  updated: number;
  failed: number;
  errors: string[];
}> {
  const realmSlug = process.env.GUILD_REALM;
  const guildName = process.env.GUILD_NAME;

  if (!realmSlug || !guildName) {
    throw new Error("Missing GUILD_REALM or GUILD_NAME environment variables");
  }

  const guildSlug = guildName.toLowerCase().replace(/\s+/g, "-");
  const roster = (await blizzard.getGuildRoster(realmSlug, guildSlug)) as BlizzardGuildRoster;

  let imported = 0;
  let updated = 0;
  let failed = 0;
  const errors: string[] = [];

  for (const member of roster.members) {
    try {
      const char = member.character;
      const existing = db
        .select()
        .from(schema.characters)
        .where(
          and(
            eq(schema.characters.name, char.name),
            eq(schema.characters.realmSlug, char.realm.slug),
            eq(schema.characters.region, process.env.BLIZZARD_REGION || "us")
          )
        )
        .get();

      // Blizzard may omit realm.name for some characters — fall back to slug or guild realm
      const realmName = char.realm?.name || char.realm?.slug || realmSlug;
      const charRealmSlug = char.realm?.slug || realmSlug;

      const charData = {
        name: char.name,
        realm: realmName,
        realmSlug: charRealmSlug,
        region: process.env.BLIZZARD_REGION || "us",
        level: char.level,
        guildRank: member.rank,
        blizzardId: char.id,
        isActive: true,
        updatedAt: new Date().toISOString(),
      };

      if (existing) {
        db.update(schema.characters)
          .set(charData)
          .where(eq(schema.characters.id, existing.id))
          .run();
        updated++;
      } else {
        db.insert(schema.characters).values(charData).run();
        imported++;
      }
    } catch (err) {
      failed++;
      errors.push(`Failed to process ${member.character.name}: ${err}`);
    }
  }

  return { imported, updated, failed, errors };
}

/**
 * Sync detailed data for a single character from Blizzard API.
 */
export async function syncCharacter(characterId: number): Promise<void> {
  const character = db.select().from(schema.characters).where(eq(schema.characters.id, characterId)).get();

  if (!character) {
    throw new Error(`Character ${characterId} not found`);
  }

  const data = await blizzard.getFullCharacterData(character.realmSlug, character.name);

  // Update character base data from profile
  if (data.profile) {
    const profile = data.profile as BlizzardCharacterProfile;
    const media = data.media as BlizzardCharacterMedia | null;

    let avatarUrl: string | undefined;
    let renderUrl: string | undefined;

    if (media) {
      avatarUrl = media.avatar_url || media.assets?.find((a) => a.key === "avatar")?.value;
      renderUrl = media.render_url || media.assets?.find((a) => a.key === "main")?.value;
    }

    const className = profile.character_class?.name ?? null;
    const activeSpec = profile.active_spec?.name ?? null;

    db.update(schema.characters)
      .set({
        faction: profile.faction?.name,
        race: profile.race?.name,
        className,
        activeSpec,
        role: inferRole(className, activeSpec),
        level: profile.level,
        itemLevel: profile.average_item_level,
        equippedItemLevel: profile.equipped_item_level,
        avatarUrl,
        renderUrl,
        lastSyncedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
      .where(eq(schema.characters.id, characterId))
      .run();
  }

  // Upsert character profile details
  const stats = data.stats as BlizzardStats | null;
  const equipment = data.equipment as BlizzardEquipment | null;
  const professions = data.professions as BlizzardProfessions | null;
  const mythicPlus = data.mythicPlus as BlizzardMythicKeystoneProfile | null;

  // Fetch M+ season details if we have season info
  let mythicPlusSeasonData: unknown = null;
  if (mythicPlus?.seasons && mythicPlus.seasons.length > 0) {
    const latestSeasonId = mythicPlus.seasons[mythicPlus.seasons.length - 1]?.id;
    if (latestSeasonId) {
      try {
        mythicPlusSeasonData = await blizzard.getCharacterMythicKeystoneSeasonDetails(
          character.realmSlug,
          character.name,
          latestSeasonId
        );
      } catch {
        // M+ season data not available
      }
    }
  }

  const profileData = {
    characterId,
    strength: stats?.strength?.effective,
    agility: stats?.agility?.effective,
    intellect: stats?.intellect?.effective,
    stamina: stats?.stamina?.effective,
    criticalStrike: stats?.melee_crit?.value,
    haste: stats?.melee_haste?.value,
    mastery: stats?.mastery?.value,
    versatility: stats?.versatility_damage_done_bonus,
    professions: professions ? JSON.stringify(formatProfessions(professions)) : null,
    equipment: equipment ? JSON.stringify(equipment.equipped_items) : null,
    talents: data.specs ? JSON.stringify(data.specs) : null,
    encounters: data.encounters ? JSON.stringify(data.encounters) : null,
    mythicPlusSeason: mythicPlusSeasonData ? JSON.stringify(mythicPlusSeasonData) : null,
    mythicPlusRating: mythicPlus?.current_mythic_rating?.rating,
    rawProfileData: JSON.stringify(data),
    snapshotAt: new Date().toISOString(),
  };

  // Check for existing profile
  const existingProfile = db.select().from(schema.characterProfiles).where(eq(schema.characterProfiles.characterId, characterId)).get();

  if (existingProfile) {
    db.update(schema.characterProfiles)
      .set(profileData)
      .where(eq(schema.characterProfiles.id, existingProfile.id))
      .run();
  } else {
    db.insert(schema.characterProfiles).values(profileData).run();
  }

  // Sync known recipes from professions data
  if (professions) {
    try {
      syncCharacterRecipes(characterId, character.name, professions);
    } catch {
      // Non-critical, don't fail sync
    }
  }

  // Cache spell icons for talents
  if (data.specs) {
    try {
      const spellIds = extractSpellIdsFromTalents(data.specs);
      if (spellIds.length > 0) {
        await cacheSpellIcons(spellIds);
      }
    } catch {
      // Non-critical, don't fail sync
    }
  }
}

/**
 * Sync all active characters in the database.
 */
export async function syncAllCharacters(): Promise<{
  total: number;
  succeeded: number;
  failed: number;
  errors: string[];
}> {
  const allChars = db
    .select()
    .from(schema.characters)
    .where(eq(schema.characters.isActive, true))
    .all();

  let succeeded = 0;
  let failed = 0;
  const errors: string[] = [];

  // Create sync job
  const jobs = db
    .insert(schema.syncJobs)
    .values({
      jobType: "full_roster",
      status: "running",
      totalCharacters: allChars.length,
      startedAt: new Date().toISOString(),
    })
    .returning()
    .all();
  const job = jobs[0];

  for (const char of allChars) {
    try {
      await syncCharacter(char.id);
      succeeded++;

      // Rate limiting: small delay between characters
      await new Promise((resolve) => setTimeout(resolve, 100));
    } catch (err) {
      failed++;
      errors.push(`${char.name}-${char.realmSlug}: ${err}`);
    }

    // Update job progress
    db.update(schema.syncJobs)
      .set({
        processedCharacters: succeeded + failed,
        failedCharacters: failed,
      })
      .where(eq(schema.syncJobs.id, job.id))
      .run();
  }

  // Complete the job
  db.update(schema.syncJobs)
    .set({
      status: failed === allChars.length ? "failed" : "completed",
      processedCharacters: succeeded + failed,
      failedCharacters: failed,
      errorLog: errors.length > 0 ? JSON.stringify(errors) : null,
      completedAt: new Date().toISOString(),
    })
    .where(eq(schema.syncJobs.id, job.id))
    .run();

  return { total: allChars.length, succeeded, failed, errors };
}

function formatProfessions(data: BlizzardProfessions) {
  const result: Array<{ name: string; skillPoints?: number; maxSkillPoints?: number }> = [];

  for (const prof of data.primaries ?? []) {
    const currentTier = prof.tiers?.[0];
    result.push({
      name: prof.profession.name,
      skillPoints: currentTier?.skill_points,
      maxSkillPoints: currentTier?.max_skill_points,
    });
  }

  return result;
}

/**
 * Extract and store all known recipes for a character from their professions data.
 */
function syncCharacterRecipes(
  characterId: number,
  characterName: string,
  professions: BlizzardProfessions
) {
  // Delete existing recipes for this character so we get a fresh snapshot
  db.delete(schema.characterRecipes)
    .where(eq(schema.characterRecipes.characterId, characterId))
    .run();

  const now = new Date().toISOString();
  const recipes: Array<{
    characterId: number;
    characterName: string;
    professionName: string;
    recipeId: number;
    recipeName: string;
    tierName: string | null;
    syncedAt: string;
  }> = [];

  for (const prof of [...(professions.primaries ?? []), ...(professions.secondaries ?? [])]) {
    const professionName = prof.profession.name;
    for (const tier of prof.tiers ?? []) {
      const tierName = tier.tier?.name ?? null;
      for (const recipe of tier.known_recipes ?? []) {
        recipes.push({
          characterId,
          characterName,
          professionName,
          recipeId: recipe.id,
          recipeName: recipe.name,
          tierName,
          syncedAt: now,
        });
      }
    }
  }

  // Batch insert recipes
  if (recipes.length > 0) {
    for (const recipe of recipes) {
      db.insert(schema.characterRecipes).values(recipe).run();
    }
  }

  return recipes.length;
}
