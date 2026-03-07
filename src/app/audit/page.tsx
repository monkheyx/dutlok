import { getEnchantGemAudit, getRaidAudit, getVaultAudit, getDungeonAudit, getProfessionsAudit } from "@/lib/audit";
import { CLASS_TEXT_COLORS } from "@/lib/wow-data";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { ClipboardCheck, Shield, Gem, Swords, Trophy, Wrench } from "lucide-react";
import { ProfessionSearch } from "@/components/profession-search";

export const dynamic = "force-dynamic";

const RAID_DIFFICULTIES = ["Mythic", "Heroic", "Champion", "Veteran"] as const;

const DIFFICULTY_COLORS: Record<string, string> = {
  Mythic: "text-orange-400",
  Heroic: "text-purple-400",
  Champion: "text-blue-400",
  Veteran: "text-green-400",
};

export default function AuditPage() {
  const enchantAudit = getEnchantGemAudit();
  const raidAudit = getRaidAudit();
  const vaultAudit = getVaultAudit();
  const dungeonAudit = getDungeonAudit();
  const professionsAudit = getProfessionsAudit();

  // Find the most recent raid (latest expansion, last instance)
  const latestRaidName = findLatestRaidName(raidAudit);

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <ClipboardCheck className="h-6 w-6" />
          Guild Audit
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Enchants, gems, raid progression, and M+ tracking for all active characters.
          Sync characters to update this data.
        </p>
      </div>

      {/* Enchant & Gem Audit */}
      <section>
        <h2 className="text-lg font-semibold flex items-center gap-2 mb-3">
          <Gem className="h-5 w-5 text-blue-400" />
          Enchants &amp; Gems
        </h2>
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-secondary/50">
                  <th className="text-left px-4 py-2 font-medium">Character</th>
                  <th className="text-left px-4 py-2 font-medium">Spec</th>
                  <th className="text-center px-4 py-2 font-medium">iLvl</th>
                  <th className="text-left px-4 py-2 font-medium">Missing Enchants</th>
                  <th className="text-left px-4 py-2 font-medium">Missing Gems</th>
                  <th className="text-center px-4 py-2 font-medium">Total</th>
                </tr>
              </thead>
              <tbody>
                {enchantAudit.map((char) => (
                  <tr key={char.characterId} className="border-b border-border/50 hover:bg-secondary/30">
                    <td className="px-4 py-2">
                      <Link
                        href={`/character/${char.characterId}`}
                        className={cn(
                          "font-medium hover:underline",
                          CLASS_TEXT_COLORS[char.className ?? ""] || "text-foreground"
                        )}
                      >
                        {char.characterName}
                      </Link>
                    </td>
                    <td className="px-4 py-2 text-muted-foreground">{char.activeSpec || "—"}</td>
                    <td className="px-4 py-2 text-center">{char.itemLevel ?? "—"}</td>
                    <td className="px-4 py-2">
                      {char.missingEnchants.length > 0 ? (
                        <span className="text-red-400">{char.missingEnchants.join(", ")}</span>
                      ) : (
                        <span className="text-green-400">All enchanted</span>
                      )}
                    </td>
                    <td className="px-4 py-2">
                      {char.missingGems.length > 0 ? (
                        <span className="text-red-400">{char.missingGems.join(", ")}</span>
                      ) : (
                        <span className="text-green-400">All gemmed</span>
                      )}
                    </td>
                    <td className="px-4 py-2 text-center">
                      <span
                        className={cn(
                          "inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold",
                          char.totalMissing === 0
                            ? "bg-green-500/20 text-green-400"
                            : char.totalMissing <= 2
                            ? "bg-yellow-500/20 text-yellow-400"
                            : "bg-red-500/20 text-red-400"
                        )}
                      >
                        {char.totalMissing}
                      </span>
                    </td>
                  </tr>
                ))}
                {enchantAudit.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                      No active characters found. Import your guild roster first.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Raid Progression */}
      <section>
        <h2 className="text-lg font-semibold flex items-center gap-2 mb-3">
          <Swords className="h-5 w-5 text-red-400" />
          Raid Progression {latestRaidName && <span className="text-sm font-normal text-muted-foreground">— {latestRaidName}</span>}
        </h2>
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-secondary/50">
                  <th className="text-left px-4 py-2 font-medium">Character</th>
                  <th className="text-center px-4 py-2 font-medium">iLvl</th>
                  {RAID_DIFFICULTIES.map((diff) => (
                    <th key={diff} className={cn("text-center px-4 py-2 font-medium", DIFFICULTY_COLORS[diff])}>
                      {diff}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {raidAudit.map((char) => {
                  const latestRaid = char.raids.find((r) => r.raidName === latestRaidName) || char.raids[char.raids.length - 1];
                  return (
                    <tr key={char.characterId} className="border-b border-border/50 hover:bg-secondary/30">
                      <td className="px-4 py-2">
                        <Link
                          href={`/character/${char.characterId}`}
                          className={cn(
                            "font-medium hover:underline",
                            CLASS_TEXT_COLORS[char.className ?? ""] || "text-foreground"
                          )}
                        >
                          {char.characterName}
                        </Link>
                        <span className="text-xs text-muted-foreground ml-1">{char.activeSpec}</span>
                      </td>
                      <td className="px-4 py-2 text-center">{char.itemLevel ?? "—"}</td>
                      {RAID_DIFFICULTIES.map((diff) => {
                        const killed = latestRaid?.killed[diff] ?? 0;
                        const total = latestRaid?.totalBosses ?? 0;
                        return (
                          <td key={diff} className="px-4 py-2 text-center">
                            {latestRaid ? (
                              <span className={cn(
                                killed === 0 ? "text-muted-foreground" :
                                killed === total ? "text-green-400 font-bold" :
                                DIFFICULTY_COLORS[diff]
                              )}>
                                {killed}/{total}
                              </span>
                            ) : (
                              <span className="text-muted-foreground">—</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
                {raidAudit.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                      No active characters found. Import your guild roster first.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Mythic+ / Great Vault */}
      <section>
        <h2 className="text-lg font-semibold flex items-center gap-2 mb-3">
          <Trophy className="h-5 w-5 text-yellow-400" />
          Mythic+ &amp; Great Vault
        </h2>
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-secondary/50">
                  <th className="text-left px-4 py-2 font-medium">Character</th>
                  <th className="text-center px-4 py-2 font-medium">M+ Rating</th>
                  <th className="text-center px-4 py-2 font-medium">Runs</th>
                  <th className="text-center px-4 py-2 font-medium">Vault (1/4/8)</th>
                  <th className="text-left px-4 py-2 font-medium">Best Runs</th>
                </tr>
              </thead>
              <tbody>
                {vaultAudit.map((char) => {
                  const vaultSlots = char.weeklyMythicRuns >= 8 ? 3 : char.weeklyMythicRuns >= 4 ? 2 : char.weeklyMythicRuns >= 1 ? 1 : 0;
                  return (
                    <tr key={char.characterId} className="border-b border-border/50 hover:bg-secondary/30">
                      <td className="px-4 py-2">
                        <Link
                          href={`/character/${char.characterId}`}
                          className={cn(
                            "font-medium hover:underline",
                            CLASS_TEXT_COLORS[char.className ?? ""] || "text-foreground"
                          )}
                        >
                          {char.characterName}
                        </Link>
                      </td>
                      <td className="px-4 py-2 text-center">
                        {char.mythicPlusRating ? (
                          <span className="font-medium" style={{ color: getRatingColor(char.mythicPlusRating) }}>
                            {Math.round(char.mythicPlusRating)}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="px-4 py-2 text-center">{char.weeklyMythicRuns || "—"}</td>
                      <td className="px-4 py-2 text-center">
                        <div className="flex items-center justify-center gap-1">
                          {[1, 2, 3].map((slot) => (
                            <div
                              key={slot}
                              className={cn(
                                "w-4 h-4 rounded border",
                                vaultSlots >= slot
                                  ? "bg-green-500/60 border-green-500"
                                  : "bg-secondary border-border"
                              )}
                            />
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-2">
                        {char.bestRuns.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {char.bestRuns.slice(0, 5).map((run, i) => (
                              <span
                                key={i}
                                className={cn(
                                  "inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-xs",
                                  run.timed
                                    ? "bg-green-500/20 text-green-400"
                                    : "bg-red-500/20 text-red-400"
                                )}
                              >
                                {run.dungeon.split(" ").map((w) => w[0]).join("")}
                                +{run.level}
                              </span>
                            ))}
                            {char.bestRuns.length > 5 && (
                              <span className="text-xs text-muted-foreground">+{char.bestRuns.length - 5} more</span>
                            )}
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-xs">No M+ data</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
                {vaultAudit.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                      No active characters found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Dungeon Best Runs Detail */}
      <section>
        <h2 className="text-lg font-semibold flex items-center gap-2 mb-3">
          <Shield className="h-5 w-5 text-purple-400" />
          Dungeon Best Runs
        </h2>
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-secondary/50">
                  <th className="text-left px-4 py-2 font-medium">Character</th>
                  <th className="text-center px-4 py-2 font-medium">M+ Rating</th>
                  <th className="text-left px-4 py-2 font-medium">All Best Runs</th>
                </tr>
              </thead>
              <tbody>
                {dungeonAudit.map((char) => (
                  <tr key={char.characterId} className="border-b border-border/50 hover:bg-secondary/30">
                    <td className="px-4 py-2">
                      <Link
                        href={`/character/${char.characterId}`}
                        className={cn(
                          "font-medium hover:underline",
                          CLASS_TEXT_COLORS[char.className ?? ""] || "text-foreground"
                        )}
                      >
                        {char.characterName}
                      </Link>
                    </td>
                    <td className="px-4 py-2 text-center">
                      {char.mythicPlusRating ? (
                        <span className="font-medium" style={{ color: getRatingColor(char.mythicPlusRating) }}>
                          {Math.round(char.mythicPlusRating)}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="px-4 py-2">
                      {char.bestRuns.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {char.bestRuns.map((run, i) => (
                            <span
                              key={i}
                              className={cn(
                                "inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs",
                                run.timed
                                  ? "bg-green-500/20 text-green-400"
                                  : "bg-red-500/20 text-red-400"
                              )}
                              title={`${run.dungeon} +${run.level} (${formatDuration(run.duration)})`}
                            >
                              {run.dungeon} +{run.level}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-xs">No M+ data — sync to load</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Professions */}
      <section>
        <h2 className="text-lg font-semibold flex items-center gap-2 mb-3">
          <Wrench className="h-5 w-5 text-orange-400" />
          Professions
        </h2>
        <div className="bg-card border border-border rounded-lg p-4">
          {professionsAudit.length > 0 ? (
            <ProfessionSearch professions={professionsAudit} />
          ) : (
            <p className="text-muted-foreground text-sm text-center py-6">
              No profession data found. Sync characters to load their professions.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}

function findLatestRaidName(raidAudit: { raids: { raidName: string }[] }[]): string | null {
  // Find the most common latest raid across all characters
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

function getRatingColor(rating: number): string {
  if (rating >= 2400) return "#ff8000"; // orange
  if (rating >= 2000) return "#a335ee"; // purple
  if (rating >= 1500) return "#0070dd"; // blue
  if (rating >= 1000) return "#1eff00"; // green
  if (rating >= 500) return "#ffffff";  // white
  return "#9d9d9d"; // gray
}

function formatDuration(ms: number): string {
  if (!ms) return "";
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}
