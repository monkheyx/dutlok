"use client";

import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Gem, Swords, Trophy, Shield, Wrench, ChevronDown, ChevronRight, UserMinus, RefreshCw, Loader2 } from "lucide-react";
import { ProfessionSearch } from "@/components/profession-search";
import { useAdmin } from "@/components/admin-provider";

const CLASS_TEXT_COLORS: Record<string, string> = {
  Warrior: "text-wow-warrior", Paladin: "text-wow-paladin", Hunter: "text-wow-hunter",
  Rogue: "text-wow-rogue", Priest: "text-wow-priest", "Death Knight": "text-wow-death-knight",
  Shaman: "text-wow-shaman", Mage: "text-wow-mage", Warlock: "text-wow-warlock",
  Monk: "text-wow-monk", Druid: "text-wow-druid", "Demon Hunter": "text-wow-demon-hunter",
  Evoker: "text-wow-evoker",
};

const RAID_DIFFICULTIES = ["Normal", "Heroic", "Mythic"] as const;

const DIFFICULTY_COLORS: Record<string, string> = {
  Mythic: "text-orange-400",
  Heroic: "text-purple-400",
  Normal: "text-green-400",
};

interface AuditData {
  enchantAudit: any[];
  raidAudit: any[];
  vaultAudit: any[];
  dungeonAudit: any[];
  professionsAudit: any[];
  raidNames: string[];
  latestRaidName: string | null;
}

export function AuditSections({ data }: { data: AuditData }) {
  const { enchantAudit: initialEnchant, raidAudit: initialRaid, vaultAudit: initialVault, dungeonAudit: initialDungeon, professionsAudit, raidNames, latestRaidName } = data;
  const { isAuthenticated, password } = useAdmin();

  // Track removed character IDs so we can hide them without a full page reload
  const [removedIds, setRemovedIds] = useState<Set<number>>(new Set());

  const enchantAudit = initialEnchant.filter((c: any) => !removedIds.has(c.characterId));
  const raidAudit = initialRaid.filter((c: any) => !removedIds.has(c.characterId));
  const vaultAudit = initialVault.filter((c: any) => !removedIds.has(c.characterId));
  const dungeonAudit = initialDungeon.filter((c: any) => !removedIds.has(c.characterId));

  // Sync state
  const [syncing, setSyncing] = useState(false);
  const [syncProgress, setSyncProgress] = useState({ done: 0, total: 0 });
  const [syncMessage, setSyncMessage] = useState<string | null>(null);

  // Collect all unique raider character IDs
  const allRaiderIds = useMemo(() => {
    const ids = new Set<number>();
    for (const c of initialEnchant) ids.add(c.characterId);
    for (const c of initialRaid) ids.add(c.characterId);
    for (const c of initialVault) ids.add(c.characterId);
    for (const c of initialDungeon) ids.add(c.characterId);
    return Array.from(ids);
  }, [initialEnchant, initialRaid, initialVault, initialDungeon]);

  async function syncRaiders() {
    if (!isAuthenticated || syncing) return;
    setSyncing(true);
    setSyncMessage(null);
    setSyncProgress({ done: 0, total: allRaiderIds.length });

    let succeeded = 0;
    let failed = 0;

    for (let i = 0; i < allRaiderIds.length; i++) {
      try {
        const res = await fetch("/api/sync", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ password, action: "sync_character", characterId: allRaiderIds[i] }),
        });
        if (res.ok) succeeded++;
        else failed++;
      } catch {
        failed++;
      }
      setSyncProgress({ done: i + 1, total: allRaiderIds.length });
    }

    setSyncing(false);
    setSyncMessage(`Synced ${succeeded} raider${succeeded !== 1 ? "s" : ""}${failed > 0 ? `, ${failed} failed` : ""}. Refresh to see updated data.`);
  }

  async function removeRaider(characterId: number, characterName: string) {
    if (!confirm(`Remove ${characterName} from raiders?`)) return;
    try {
      const res = await fetch(`/api/characters/${characterId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password, isRaider: false, isRaiderAlt: false }),
      });
      if (res.ok) {
        setRemovedIds((prev) => new Set(prev).add(characterId));
      }
    } catch {
      // silent
    }
  }

  // Section collapse state — all open by default except dungeon detail
  const [sections, setSections] = useState({
    enchants: true,
    raids: true,
    mythicPlus: true,
    dungeons: false,
    professions: true,
  });

  // Raid selector — defaults to latest
  const [selectedRaid, setSelectedRaid] = useState(latestRaidName || raidNames[raidNames.length - 1] || "");

  function toggleSection(key: keyof typeof sections) {
    setSections((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  return (
    <div className="space-y-4">
      {/* Sync bar */}
      {isAuthenticated && (
        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={syncRaiders}
            disabled={syncing || allRaiderIds.length === 0}
            className={cn(
              "flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium border transition-all",
              syncing
                ? "bg-primary/10 border-primary/30 text-primary"
                : "bg-secondary border-border text-muted-foreground hover:text-foreground hover:bg-accent"
            )}
          >
            {syncing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
            {syncing ? `Syncing ${syncProgress.done}/${syncProgress.total}` : `Sync Raiders (${allRaiderIds.length})`}
          </button>
          {syncing && (
            <div className="flex-1 max-w-xs">
              <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all"
                  style={{ width: `${syncProgress.total > 0 ? (syncProgress.done / syncProgress.total) * 100 : 0}%` }}
                />
              </div>
            </div>
          )}
          {syncMessage && (
            <span className="text-xs text-green-400">{syncMessage}</span>
          )}
        </div>
      )}

      {/* ── Enchants & Gems ── */}
      <CollapsibleSection
        title="Enchants & Gems"
        icon={<Gem className="h-4 w-4 text-blue-400" />}
        isOpen={sections.enchants}
        onToggle={() => toggleSection("enchants")}
        badge={enchantAudit.filter((c: any) => c.totalMissing > 0).length > 0
          ? `${enchantAudit.filter((c: any) => c.totalMissing > 0).length} issues`
          : "All good"}
        badgeColor={enchantAudit.filter((c: any) => c.totalMissing > 0).length > 0 ? "text-red-400" : "text-green-400"}
      >
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
                {isAuthenticated && <th className="py-2 px-2 w-8"></th>}
              </tr>
            </thead>
            <tbody>
              {enchantAudit.map((char: any) => (
                <tr key={char.characterId} className="border-b border-border/50 hover:bg-secondary/30">
                  <td className="px-4 py-2">
                    <Link href={`/character/${char.characterId}`} className={cn("font-medium hover:underline", CLASS_TEXT_COLORS[char.className ?? ""] || "text-foreground")}>
                      {char.characterName}
                    </Link>
                    <AltBadge isAlt={char.isRaiderAlt} />
                  </td>
                  <td className="px-4 py-2 text-muted-foreground">{char.activeSpec || "—"}</td>
                  <td className="px-4 py-2 text-center">{char.itemLevel ?? "—"}</td>
                  <td className="px-4 py-2">
                    {char.missingEnchants.length > 0
                      ? <span className="text-red-400">{char.missingEnchants.join(", ")}</span>
                      : <span className="text-green-400">All enchanted</span>}
                  </td>
                  <td className="px-4 py-2">
                    {char.missingGems.length > 0
                      ? <span className="text-red-400">{char.missingGems.join(", ")}</span>
                      : <span className="text-green-400">All gemmed</span>}
                  </td>
                  <td className="px-4 py-2 text-center">
                    <span className={cn(
                      "inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold",
                      char.totalMissing === 0 ? "bg-green-500/20 text-green-400"
                        : char.totalMissing <= 2 ? "bg-yellow-500/20 text-yellow-400"
                        : "bg-red-500/20 text-red-400"
                    )}>
                      {char.totalMissing}
                    </span>
                  </td>
                  {isAuthenticated && (
                    <td className="py-2 px-2">
                      <button onClick={() => removeRaider(char.characterId, char.characterName)} className="p-1 text-muted-foreground/40 hover:text-red-400 transition-colors" title="Remove from raiders">
                        <UserMinus className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  )}
                </tr>
              ))}
              {enchantAudit.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">No raiders found. Designate raiders in the Admin panel.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </CollapsibleSection>

      {/* ── Raid Progression ── */}
      <CollapsibleSection
        title="Raid Progression"
        icon={<Swords className="h-4 w-4 text-red-400" />}
        isOpen={sections.raids}
        onToggle={() => toggleSection("raids")}
        headerExtra={
          raidNames.length > 1 ? (
            <select
              value={selectedRaid}
              onChange={(e) => setSelectedRaid(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              className="bg-secondary border border-border rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
            >
              {raidNames.map((name) => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>
          ) : (
            <span className="text-xs text-muted-foreground">{selectedRaid}</span>
          )
        }
      >
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
                {isAuthenticated && <th className="py-2 px-2 w-8"></th>}
              </tr>
            </thead>
            <tbody>
              {raidAudit.map((char: any) => {
                const raid = char.raids.find((r: any) => r.raidName === selectedRaid);
                return (
                  <tr key={char.characterId} className="border-b border-border/50 hover:bg-secondary/30">
                    <td className="px-4 py-2">
                      <Link href={`/character/${char.characterId}`} className={cn("font-medium hover:underline", CLASS_TEXT_COLORS[char.className ?? ""] || "text-foreground")}>
                        {char.characterName}
                      </Link>
                      <AltBadge isAlt={char.isRaiderAlt} />
                      <span className="text-xs text-muted-foreground ml-1">{char.activeSpec}</span>
                    </td>
                    <td className="px-4 py-2 text-center">{char.itemLevel ?? "—"}</td>
                    {RAID_DIFFICULTIES.map((diff) => {
                      const killed = raid?.killed[diff] ?? 0;
                      const total = raid?.totalBosses ?? 0;
                      return (
                        <td key={diff} className="px-4 py-2 text-center">
                          {raid ? (
                            <span className={cn(
                              killed === 0 ? "text-muted-foreground" :
                              killed === total ? "text-green-400 font-bold" :
                              DIFFICULTY_COLORS[diff]
                            )}>
                              {killed}/{total}
                            </span>
                          ) : <span className="text-muted-foreground">—</span>}
                        </td>
                      );
                    })}
                    {isAuthenticated && (
                      <td className="py-2 px-2">
                        <button onClick={() => removeRaider(char.characterId, char.characterName)} className="p-1 text-muted-foreground/40 hover:text-red-400 transition-colors" title="Remove from raiders">
                          <UserMinus className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    )}
                  </tr>
                );
              })}
              {raidAudit.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">No raiders found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </CollapsibleSection>

      {/* ── Mythic+ & Great Vault ── */}
      <CollapsibleSection
        title="Mythic+ & Great Vault"
        icon={<Trophy className="h-4 w-4 text-yellow-400" />}
        isOpen={sections.mythicPlus}
        onToggle={() => toggleSection("mythicPlus")}
        badge="Current Season"
        badgeColor="text-primary"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/50">
                <th className="text-left px-4 py-2 font-medium">Character</th>
                <th className="text-center px-4 py-2 font-medium">M+ Rating</th>
                <th className="text-center px-4 py-2 font-medium">Runs</th>
                <th className="text-center px-4 py-2 font-medium">Vault (1/4/8)</th>
                <th className="text-left px-4 py-2 font-medium">Best Runs</th>
                {isAuthenticated && <th className="py-2 px-2 w-8"></th>}
              </tr>
            </thead>
            <tbody>
              {vaultAudit.map((char: any) => {
                const vaultSlots = char.weeklyMythicRuns >= 8 ? 3 : char.weeklyMythicRuns >= 4 ? 2 : char.weeklyMythicRuns >= 1 ? 1 : 0;
                return (
                  <tr key={char.characterId} className="border-b border-border/50 hover:bg-secondary/30">
                    <td className="px-4 py-2">
                      <Link href={`/character/${char.characterId}`} className={cn("font-medium hover:underline", CLASS_TEXT_COLORS[char.className ?? ""] || "text-foreground")}>
                        {char.characterName}
                      </Link>
                      <AltBadge isAlt={char.isRaiderAlt} />
                    </td>
                    <td className="px-4 py-2 text-center">
                      {char.mythicPlusRating ? (
                        <span className="font-medium" style={{ color: getRatingColor(char.mythicPlusRating) }}>
                          {Math.round(char.mythicPlusRating)}
                        </span>
                      ) : <span className="text-muted-foreground">—</span>}
                    </td>
                    <td className="px-4 py-2 text-center">{char.weeklyMythicRuns || "—"}</td>
                    <td className="px-4 py-2 text-center">
                      <div className="flex items-center justify-center gap-1">
                        {[1, 2, 3].map((slot) => (
                          <div key={slot} className={cn("w-4 h-4 rounded border", vaultSlots >= slot ? "bg-green-500/60 border-green-500" : "bg-secondary border-border")} />
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-2">
                      {char.bestRuns.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {char.bestRuns.slice(0, 5).map((run: any, i: number) => (
                            <span key={i} className={cn("inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-xs", run.timed ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400")}>
                              {run.dungeon.split(" ").map((w: string) => w[0]).join("")}+{run.level}
                            </span>
                          ))}
                          {char.bestRuns.length > 5 && <span className="text-xs text-muted-foreground">+{char.bestRuns.length - 5}</span>}
                        </div>
                      ) : <span className="text-muted-foreground text-xs">No M+ data</span>}
                    </td>
                    {isAuthenticated && (
                      <td className="py-2 px-2">
                        <button onClick={() => removeRaider(char.characterId, char.characterName)} className="p-1 text-muted-foreground/40 hover:text-red-400 transition-colors" title="Remove from raiders">
                          <UserMinus className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    )}
                  </tr>
                );
              })}
              {vaultAudit.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">No raiders found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </CollapsibleSection>

      {/* ── Dungeon Best Runs ── */}
      <CollapsibleSection
        title="Dungeon Best Runs"
        icon={<Shield className="h-4 w-4 text-purple-400" />}
        isOpen={sections.dungeons}
        onToggle={() => toggleSection("dungeons")}
        badge="Current Season"
        badgeColor="text-primary"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/50">
                <th className="text-left px-4 py-2 font-medium">Character</th>
                <th className="text-center px-4 py-2 font-medium">M+ Rating</th>
                <th className="text-left px-4 py-2 font-medium">All Best Runs</th>
                {isAuthenticated && <th className="py-2 px-2 w-8"></th>}
              </tr>
            </thead>
            <tbody>
              {dungeonAudit.map((char: any) => (
                <tr key={char.characterId} className="border-b border-border/50 hover:bg-secondary/30">
                  <td className="px-4 py-2">
                    <Link href={`/character/${char.characterId}`} className={cn("font-medium hover:underline", CLASS_TEXT_COLORS[char.className ?? ""] || "text-foreground")}>
                      {char.characterName}
                    </Link>
                    <AltBadge isAlt={char.isRaiderAlt} />
                  </td>
                  <td className="px-4 py-2 text-center">
                    {char.mythicPlusRating ? (
                      <span className="font-medium" style={{ color: getRatingColor(char.mythicPlusRating) }}>{Math.round(char.mythicPlusRating)}</span>
                    ) : <span className="text-muted-foreground">—</span>}
                  </td>
                  <td className="px-4 py-2">
                    {char.bestRuns.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {char.bestRuns.map((run: any, i: number) => (
                          <span key={i} className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs", run.timed ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400")}
                            title={`${run.dungeon} +${run.level} (${formatDuration(run.duration)})`}>
                            {run.dungeon} +{run.level}
                          </span>
                        ))}
                      </div>
                    ) : <span className="text-muted-foreground text-xs">No M+ data — sync to load</span>}
                  </td>
                  {isAuthenticated && (
                    <td className="py-2 px-2">
                      <button onClick={() => removeRaider(char.characterId, char.characterName)} className="p-1 text-muted-foreground/40 hover:text-red-400 transition-colors" title="Remove from raiders">
                        <UserMinus className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CollapsibleSection>

      {/* ── Professions ── */}
      <CollapsibleSection
        title="Professions"
        icon={<Wrench className="h-4 w-4 text-orange-400" />}
        isOpen={sections.professions}
        onToggle={() => toggleSection("professions")}
        badge={`${professionsAudit.length} entries`}
        badgeColor="text-muted-foreground"
      >
        {professionsAudit.length > 0 ? (
          <div className="p-4">
            <ProfessionSearch professions={professionsAudit} />
          </div>
        ) : (
          <p className="text-muted-foreground text-sm text-center py-6">
            No profession data found. Sync characters to load their professions.
          </p>
        )}
      </CollapsibleSection>
    </div>
  );
}

// ── Shared components ──

function CollapsibleSection({
  title,
  icon,
  isOpen,
  onToggle,
  badge,
  badgeColor,
  headerExtra,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  isOpen: boolean;
  onToggle: () => void;
  badge?: string;
  badgeColor?: string;
  headerExtra?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-secondary/30 transition-colors text-left"
      >
        {isOpen ? <ChevronDown className="h-4 w-4 text-muted-foreground flex-shrink-0" /> : <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />}
        {icon}
        <span className="text-sm font-semibold flex-1">{title}</span>
        {badge && <span className={cn("text-xs font-medium", badgeColor || "text-muted-foreground")}>{badge}</span>}
        {headerExtra && <div onClick={(e) => e.stopPropagation()}>{headerExtra}</div>}
      </button>
      {isOpen && children}
    </div>
  );
}

function AltBadge({ isAlt }: { isAlt: boolean }) {
  if (!isAlt) return null;
  return (
    <span className="ml-1.5 inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-yellow-500/15 text-yellow-400 border border-yellow-500/30">
      Alt
    </span>
  );
}

function getRatingColor(rating: number): string {
  if (rating >= 2400) return "#ff8000";
  if (rating >= 2000) return "#a335ee";
  if (rating >= 1500) return "#0070dd";
  if (rating >= 1000) return "#1eff00";
  if (rating >= 500) return "#ffffff";
  return "#9d9d9d";
}

function formatDuration(ms: number): string {
  if (!ms) return "";
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}
