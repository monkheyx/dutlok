import { NextRequest, NextResponse } from "next/server";
import { db, schema } from "@/db";
import { eq, and } from "drizzle-orm";
import { checkAdminPassword } from "@/lib/auth";

// Map addon class tokens to display names
const CLASS_MAP: Record<string, string> = {
  WARRIOR: "Warrior", PALADIN: "Paladin", HUNTER: "Hunter",
  ROGUE: "Rogue", PRIEST: "Priest", DEATHKNIGHT: "Death Knight",
  SHAMAN: "Shaman", MAGE: "Mage", WARLOCK: "Warlock",
  MONK: "Monk", DRUID: "Druid", DEMONHUNTER: "Demon Hunter",
  EVOKER: "Evoker",
};

const DIFFICULTY_MAP: Record<number, string> = {
  14: "Normal",
  15: "Heroic",
  16: "Mythic",
};

// Extract item quality from itemLink color code
function getQualityFromLink(itemLink: string): string {
  if (itemLink.includes("|cffff8000")) return "Legendary";
  if (itemLink.includes("|cffa335ee")) return "Epic";
  if (itemLink.includes("|cff0070dd")) return "Rare";
  if (itemLink.includes("|cff1eff00")) return "Uncommon";
  if (itemLink.includes("|cffe6cc80")) return "Artifact";
  if (itemLink.includes("|cff00ccff")) return "Heirloom";
  return "Epic"; // Default for raid loot
}

interface RosterEntry {
  name: string;
  class: string;
  role: string;
}

interface LootEntry {
  itemID: number;
  itemLink?: string;
  itemName: string;
  player: string;
  timestamp: string;
}

interface Encounter {
  encounterID: number;
  encounterName: string;
  difficulty: number;
  duration: number;
  startTime: string;
  endTime: string;
  groupSize: number;
  success: boolean;
  roster: RosterEntry[];
  loot: LootEntry[];
}

interface RaidLog {
  addon: string;
  version: number;
  instance: string;
  instanceID: number;
  difficulty: string;
  difficultyID: number;
  startTime: string;
  endTime: string | null;
  exportTime: string;
  encounters: Encounter[];
}

/**
 * POST /api/raid-log — Import a raid log JSON file
 * Parses encounters, creates attendance + loot records
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { password, log } = body as { password: string; log: RaidLog };

    if (!checkAdminPassword(password)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!log || !log.encounters || !Array.isArray(log.encounters)) {
      return NextResponse.json({ error: "Invalid log format — missing encounters array" }, { status: 400 });
    }

    const raidName = log.instance || "Unknown Raid";
    const raidDate = log.startTime ? log.startTime.split("T")[0] : new Date().toISOString().split("T")[0];
    const difficulty = DIFFICULTY_MAP[log.difficultyID] || log.difficulty || "Unknown";

    // Pre-load all characters for name matching
    const allCharacters = db.select().from(schema.characters).all();

    // Build a lookup: "Name" or "Name-Realm" -> character record
    const charLookup = new Map<string, typeof allCharacters[0]>();
    for (const char of allCharacters) {
      // Match by exact name (case-insensitive)
      charLookup.set(char.name.toLowerCase(), char);
      // Match by Name-Realm format
      if (char.realm) {
        charLookup.set(`${char.name}-${char.realm}`.toLowerCase(), char);
      }
      if (char.realmSlug) {
        charLookup.set(`${char.name}-${char.realmSlug}`.toLowerCase(), char);
      }
    }

    const findCharacter = (playerString: string) => {
      // playerString is "Name-Realm" format
      const lower = playerString.toLowerCase();
      if (charLookup.has(lower)) return charLookup.get(lower)!;

      // Try just the name part
      const namePart = playerString.split("-")[0].toLowerCase();
      if (charLookup.has(namePart)) return charLookup.get(namePart)!;

      return null;
    };

    let attendanceAdded = 0;
    let lootAdded = 0;
    let encountersProcessed = 0;
    let encountersSkipped = 0;
    const errors: string[] = [];

    // Track unique players seen across all encounters (for overall attendance)
    const allPlayers = new Map<string, { name: string; characterId: number | null; status: string }>();

    for (const encounter of log.encounters) {
      if (!encounter.success) {
        encountersSkipped++;
        continue;
      }

      encountersProcessed++;

      // Process roster — mark all as present
      for (const member of encounter.roster) {
        const playerKey = member.name.toLowerCase();
        const char = findCharacter(member.name);
        const displayName = member.name.split("-")[0]; // "Playername-Illidan" -> "Playername"

        if (!allPlayers.has(playerKey)) {
          allPlayers.set(playerKey, {
            name: displayName,
            characterId: char?.id || null,
            status: "present",
          });
        }
      }

      // Process loot
      for (const item of encounter.loot) {
        try {
          const char = findCharacter(item.player);
          const displayName = item.player.split("-")[0];
          const quality = item.itemLink ? getQualityFromLink(item.itemLink) : "Epic";

          db.insert(schema.raidLoot).values({
            characterId: char?.id || null,
            characterName: displayName,
            itemName: item.itemName,
            itemId: item.itemID || null,
            itemQuality: quality,
            itemLevel: null, // Not in the log format
            bossName: encounter.encounterName,
            raidName,
            raidDate,
            notes: null,
            awardedBy: "Log Import",
          }).run();

          lootAdded++;
        } catch (err: any) {
          errors.push(`Loot error: ${item.itemName} for ${item.player}: ${err.message}`);
        }
      }
    }

    // Create attendance records for all unique players
    const playerEntries = Array.from(allPlayers.values());
    for (const player of playerEntries) {
      try {
        db.insert(schema.raidAttendance).values({
          raidName,
          raidDate,
          difficulty,
          characterId: player.characterId,
          characterName: player.name,
          status: player.status,
          notes: `Imported from ${log.addon || "raid log"}`,
          createdAt: new Date().toISOString(),
        }).run();

        attendanceAdded++;
      } catch (err: any) {
        errors.push(`Attendance error: ${player.name}: ${err.message}`);
      }
    }

    return NextResponse.json({
      success: true,
      raidName,
      raidDate,
      difficulty,
      encountersProcessed,
      encountersSkipped,
      attendanceAdded,
      lootAdded,
      totalEncounters: log.encounters.length,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (err: any) {
    console.error("Raid log import error:", err);
    return NextResponse.json({ error: err.message || "Failed to parse log" }, { status: 500 });
  }
}
