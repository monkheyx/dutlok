import { db, schema } from "@/db";
import { eq } from "drizzle-orm";
import { getSpellMedia } from "@/services/blizzard/client";

/**
 * Get icon URL for a spell, using DB cache first.
 * Returns null if icon can't be fetched.
 */
export function getCachedIcon(spellId: number): string | null {
  const cached = db
    .select()
    .from(schema.spellIcons)
    .where(eq(schema.spellIcons.spellId, spellId))
    .get();
  return cached?.iconUrl ?? null;
}

/**
 * Get all cached icons as a map for fast lookup.
 */
export function getAllCachedIcons(): Map<number, string> {
  const all = db.select().from(schema.spellIcons).all();
  const map = new Map<number, string>();
  for (const row of all) {
    map.set(row.spellId, row.iconUrl);
  }
  return map;
}

/**
 * Fetch and cache icons for spell IDs that aren't already cached.
 * Batches requests with small delays to avoid rate limiting.
 */
export async function cacheSpellIcons(
  spellIds: Array<{ spellId: number; spellName?: string }>
): Promise<number> {
  const existing = getAllCachedIcons();
  const toFetch = spellIds.filter((s) => !existing.has(s.spellId));

  if (toFetch.length === 0) return 0;

  let fetched = 0;

  // Batch in groups of 5 with small delays
  for (let i = 0; i < toFetch.length; i += 5) {
    const batch = toFetch.slice(i, i + 5);
    const results = await Promise.all(
      batch.map(async (s) => {
        const media = await getSpellMedia(s.spellId);
        return { ...s, iconUrl: media.iconUrl };
      })
    );

    for (const result of results) {
      if (result.iconUrl) {
        db.insert(schema.spellIcons)
          .values({
            spellId: result.spellId,
            iconUrl: result.iconUrl,
            spellName: result.spellName || null,
          })
          .onConflictDoUpdate({
            target: schema.spellIcons.spellId,
            set: { iconUrl: result.iconUrl, spellName: result.spellName || null },
          })
          .run();
        fetched++;
      }
    }

    // Small delay between batches
    if (i + 5 < toFetch.length) {
      await new Promise((r) => setTimeout(r, 50));
    }
  }

  return fetched;
}

/**
 * Extract all spell IDs from a character's talent data.
 */
export function extractSpellIdsFromTalents(
  talentData: any
): Array<{ spellId: number; spellName?: string }> {
  const results: Array<{ spellId: number; spellName?: string }> = [];

  if (!talentData) return results;

  try {
    let data = typeof talentData === "string" ? JSON.parse(talentData) : talentData;
    if (typeof data === "string") data = JSON.parse(data);

    if (data?.specializations && Array.isArray(data.specializations)) {
      for (const spec of data.specializations) {
        if (!spec?.loadouts) continue;
        const loadout = spec.loadouts.find((l: any) => l.is_active) || spec.loadouts[0];
        if (!loadout) continue;

        const talentLists = [
          loadout.selected_class_talents,
          loadout.selected_spec_talents,
          loadout.selected_hero_talents,
        ];

        for (const list of talentLists) {
          if (!Array.isArray(list)) continue;
          for (const t of list) {
            const spellId =
              t?.tooltip?.spell_tooltip?.spell?.id ||
              t?.spell_tooltip?.spell?.id;
            const name = t?.tooltip?.talent?.name || t?.talent?.name;
            if (spellId) {
              results.push({ spellId, spellName: name });
            }
          }
        }
      }
    }
  } catch {
    // graceful
  }

  return results;
}
