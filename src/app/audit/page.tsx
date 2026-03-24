import { getEnchantGemAudit, getRaidAudit, getVaultAudit, getDungeonAudit, getProfessionsAudit } from "@/lib/audit";
import { CLASS_TEXT_COLORS } from "@/lib/wow-data";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { ClipboardCheck, Gem, Swords, Trophy, Wrench } from "lucide-react";
import { ProfessionSearch } from "@/components/profession-search";
import { AuditSections } from "@/components/audit-sections";

export const dynamic = "force-dynamic";

const RAID_DIFFICULTIES = ["Normal", "Heroic", "Mythic"] as const;

const DIFFICULTY_COLORS: Record<string, string> = {
  Mythic: "text-orange-400",
  Heroic: "text-purple-400",
  Normal: "text-green-400",
};

export default function AuditPage() {
  const enchantAudit = getEnchantGemAudit();
  const raidAudit = getRaidAudit();
  const vaultAudit = getVaultAudit();
  const dungeonAudit = getDungeonAudit();
  const professionsAudit = getProfessionsAudit(true, true);

  // Find all unique raid names across all characters, pick latest as default
  const allRaidNames = new Set<string>();
  for (const char of raidAudit) {
    for (const raid of char.raids) {
      allRaidNames.add(raid.raidName);
    }
  }
  const raidNames = Array.from(allRaidNames);
  // Prefer current tier raid as default, fall back to most common
  const CURRENT_RAID = "The Voidspire";
  const latestRaidName = raidNames.includes(CURRENT_RAID) ? CURRENT_RAID : findLatestRaidName(raidAudit);

  // Serialize data for client component
  const serializedData = {
    enchantAudit,
    raidAudit: raidAudit.map((char) => ({
      ...char,
      raids: char.raids.map((r) => ({
        raidName: r.raidName,
        totalBosses: r.totalBosses,
        killed: r.killed,
      })),
    })),
    vaultAudit,
    dungeonAudit,
    professionsAudit,
    raidNames,
    latestRaidName,
  };

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <ClipboardCheck className="h-6 w-6" />
          Raiders
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Enchants, gems, raid progression, M+ tracking, and professions for designated raiders.
        </p>
      </div>

      <AuditSections data={serializedData} />
    </div>
  );
}

function findLatestRaidName(raidAudit: { raids: { raidName: string }[] }[]): string | null {
  const raidCounts: Record<string, number> = {};
  for (const char of raidAudit) {
    if (char.raids.length > 0) {
      const lastName = char.raids[char.raids.length - 1].raidName;
      raidCounts[lastName] = (raidCounts[lastName] || 0) + 1;
    }
  }
  let best: string | null = null;
  let bestCount = 0;
  for (const [name, count] of Object.entries(raidCounts)) {
    if (count > bestCount) {
      best = name;
      bestCount = count;
    }
  }
  return best;
}
