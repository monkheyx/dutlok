"use client";

import { useState, useMemo } from "react";
import { Calculator, ChevronDown, ChevronRight, Search, Loader2, User, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { DUNGEONS } from "@/data/dungeons";

// ═══════════════════════════════════════════════════════════════════════════
// M+ Rating = sum of your best score in each of the 8 dungeons.
// Score per run is based on key level + time bonus for how fast you cleared.
//
// Base score (just-timed): 155 + (level - 2) * 15, with +15 bonus at +4/+7/+10/+12
// Time bonus: up to +15 extra for fast clears (3 upgrades), ~7 for 2, ~0 for 1
// Overtime: -15 penalty, then 0 score if >40% over timer
// ═══════════════════════════════════════════════════════════════════════════

function getBaseScore(level: number): number {
  if (level <= 0) return 0;
  let score = 155 + (level - 2) * 15;
  if (level >= 4) score += 15;
  if (level >= 7) score += 15;
  if (level >= 10) score += 15;
  if (level >= 12) score += 15;
  return score;
}

const PRESETS = [
  { label: "Explorer", rating: 750 },
  { label: "Conqueror", rating: 1500 },
  { label: "Master", rating: 2000 },
  { label: "Hero", rating: 2500 },
  { label: "Legend", rating: 3000 },
];

interface DungeonInput {
  level: number;
  rioScore: number | null; // actual score from RIO (includes time bonus)
}

export function IOCalculator() {
  const [targetRating, setTargetRating] = useState(2500);
  const [expanded, setExpanded] = useState(false);

  // Player lookup
  const [playerName, setPlayerName] = useState("");
  const [playerRealm, setPlayerRealm] = useState("");
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupError, setLookupError] = useState("");
  const [playerProfile, setPlayerProfile] = useState<any>(null);
  const [rioTotal, setRioTotal] = useState(0);

  // Per-dungeon data
  const [dungeons, setDungeons] = useState<Record<string, DungeonInput>>(
    Object.fromEntries(DUNGEONS.map((d) => [d.slug, { level: 0, rioScore: null }]))
  );

  // Current rating: use RIO actual scores where available, estimate for manual entries
  const currentRating = useMemo(() => {
    return Object.values(dungeons).reduce((sum, d) => {
      if (d.rioScore !== null && d.rioScore > 0) return sum + d.rioScore;
      if (d.level > 0) return sum + getBaseScore(d.level);
      return sum;
    }, 0);
  }, [dungeons]);

  const remaining = Math.max(0, targetRating - currentRating);

  // What key level in all 8 gets target (for reference)
  const evenLevel = useMemo(() => {
    const perDungeon = targetRating / 8;
    for (let level = 2; level <= 30; level++) {
      if (getBaseScore(level) >= perDungeon) return level;
    }
    return 30;
  }, [targetRating]);

  // What each dungeon needs to contribute for even split
  const perDungeonTarget = targetRating / 8;

  async function lookupPlayer() {
    if (!playerName.trim() || !playerRealm.trim()) {
      setLookupError("Enter both character name and realm");
      return;
    }
    setLookupLoading(true);
    setLookupError("");

    try {
      const res = await fetch(`/api/raiderio?region=us&realm=${encodeURIComponent(playerRealm)}&name=${encodeURIComponent(playerName)}`);
      const data = await res.json();

      if (!res.ok) {
        setLookupError(data.error || "Character not found");
        setLookupLoading(false);
        return;
      }

      setPlayerProfile(data);
      const score = data.mythic_plus_scores_by_season?.[0]?.scores?.all || 0;
      setRioTotal(score);

      const newDungeons: Record<string, DungeonInput> = Object.fromEntries(
        DUNGEONS.map((d) => [d.slug, { level: 0, rioScore: null }])
      );

      for (const run of (data.mythic_plus_best_runs || [])) {
        const dungeonName = typeof run.dungeon === "string" ? run.dungeon : run.dungeon?.name || "";
        const shortName = run.short_name || "";
        const slug = findDungeonSlug(shortName, dungeonName);
        if (slug && newDungeons[slug]) {
          newDungeons[slug] = {
            level: run.mythic_level || 0,
            rioScore: run.score || null,
          };
        }
      }

      setDungeons(newDungeons);
    } catch {
      setLookupError("Failed to fetch character data");
    }
    setLookupLoading(false);
  }

  function clearPlayer() {
    setPlayerProfile(null);
    setRioTotal(0);
    setDungeons(Object.fromEntries(DUNGEONS.map((d) => [d.slug, { level: 0, rioScore: null }])));
  }

  function setLevel(slug: string, value: number) {
    setDungeons((prev) => ({
      ...prev,
      [slug]: { level: Math.max(0, Math.min(30, value)), rioScore: null }, // Clear RIO score when manually edited
    }));
  }

  function setAllTo(level: number) {
    setDungeons(Object.fromEntries(DUNGEONS.map((d) => [d.slug, { level, rioScore: null }])));
  }

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-secondary/30 transition-colors text-left"
      >
        <Calculator className={cn("h-4 w-4", expanded ? "text-primary" : "text-muted-foreground")} />
        <span className="text-sm font-semibold flex-1">M+ Rating Calculator</span>
        <span className="text-xs text-muted-foreground">
          {currentRating > 0 ? `${Math.round(currentRating)} / ${targetRating}` : `Target: ${targetRating}`}
        </span>
        {expanded ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
      </button>

      {expanded && (
        <div className="px-4 pb-4 space-y-4 border-t border-border pt-4">
          {/* Player Lookup */}
          <div className="bg-secondary/30 border border-border rounded-lg p-3">
            <h4 className="text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground mb-2 flex items-center gap-1.5">
              <User className="h-3 w-3" />
              Load from Raider.IO
            </h4>
            <div className="flex gap-2">
              <input
                type="text" placeholder="Character"
                value={playerName} onChange={(e) => setPlayerName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && lookupPlayer()}
                className="flex-1 bg-secondary border border-border rounded px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <input
                type="text" placeholder="Realm (e.g. eredar)"
                value={playerRealm} onChange={(e) => setPlayerRealm(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && lookupPlayer()}
                className="flex-1 bg-secondary border border-border rounded px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <button
                onClick={lookupPlayer} disabled={lookupLoading}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-primary text-primary-foreground text-xs font-medium hover:opacity-90 disabled:opacity-50"
              >
                {lookupLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Search className="h-3 w-3" />}
                Lookup
              </button>
            </div>
            {lookupError && <p className="text-xs text-red-400 mt-1">{lookupError}</p>}
            {playerProfile && (
              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center gap-2">
                  {playerProfile.thumbnail_url && <img src={playerProfile.thumbnail_url} alt="" className="w-6 h-6 rounded-full" />}
                  <span className="text-xs font-medium">{playerProfile.name}</span>
                  <span className="text-xs text-muted-foreground">{playerProfile.realm}</span>
                  <span className="text-xs font-bold text-primary">IO: {rioTotal}</span>
                  {playerProfile.profile_url && (
                    <a href={playerProfile.profile_url} target="_blank" rel="noopener noreferrer" className="text-primary"><ExternalLink className="h-3 w-3" /></a>
                  )}
                </div>
                <button onClick={clearPlayer} className="text-[10px] text-muted-foreground hover:text-foreground">Clear</button>
              </div>
            )}
          </div>

          {/* Target */}
          <div>
            <label className="text-xs text-muted-foreground mb-2 block">Target Rating</label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {PRESETS.map((p) => (
                <button key={p.rating} onClick={() => setTargetRating(p.rating)}
                  className={cn("px-2.5 py-1 rounded text-xs font-medium border transition-all",
                    targetRating === p.rating ? "bg-primary/15 border-primary/40 text-primary" : "bg-secondary border-border text-muted-foreground hover:text-foreground"
                  )}>
                  {p.label} ({p.rating})
                </button>
              ))}
            </div>
            <input type="range" min={500} max={4000} step={25} value={targetRating}
              onChange={(e) => setTargetRating(Number(e.target.value))} className="w-full accent-primary" />
            <div className="flex justify-between text-[10px] text-muted-foreground mt-0.5">
              <span>500</span><span className="text-primary font-bold text-xs">{targetRating}</span><span>4000</span>
            </div>
          </div>

          {/* Info box */}
          <div className="bg-primary/10 border border-primary/20 rounded-lg p-3 text-sm space-y-1">
            <p>
              For <strong className="text-primary">{targetRating}</strong>: average{" "}
              <strong className="text-primary">~{Math.round(perDungeonTarget)}</strong> score per dungeon
              (approximately <strong className="text-primary">+{evenLevel}</strong> timed in each).
            </p>
            {remaining > 0 && currentRating > 0 && (
              <p className="text-xs text-muted-foreground">
                You need <strong className="text-orange-400">{Math.round(remaining)}</strong> more rating.
                Focus on your lowest dungeons for the biggest gains.
              </p>
            )}
          </div>

          {/* Dungeon list */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs text-muted-foreground">Dungeon Breakdown</label>
              <div className="flex gap-2">
                <button onClick={() => setAllTo(0)} className="text-[10px] text-muted-foreground hover:text-foreground">Reset</button>
                <button onClick={() => setAllTo(evenLevel)} className="text-[10px] text-primary hover:text-primary/80">Set all +{evenLevel}</button>
              </div>
            </div>

            <div className="flex items-center gap-2 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">
              <span className="w-8 text-center">ID</span>
              <span className="flex-1">Dungeon</span>
              <span className="w-[88px] text-center">Key Level</span>
              <span className="w-16 text-right">Score</span>
              <span className="w-16 text-right">Need</span>
            </div>

            <div className="space-y-1">
              {DUNGEONS.map((d) => {
                const data = dungeons[d.slug];
                const score = data.rioScore ?? (data.level > 0 ? getBaseScore(data.level) : 0);
                const atTarget = score >= perDungeonTarget && score > 0;
                const deficit = Math.max(0, perDungeonTarget - score);

                // Find what key level would close the gap
                let neededLevel = 0;
                if (deficit > 0) {
                  for (let lv = 2; lv <= 30; lv++) {
                    if (getBaseScore(lv) >= perDungeonTarget) { neededLevel = lv; break; }
                  }
                }

                return (
                  <div key={d.slug} className={cn(
                    "flex items-center gap-2 px-2.5 py-1.5 rounded border text-sm",
                    atTarget ? "bg-green-500/5 border-green-500/20" : "bg-secondary/20 border-border"
                  )}>
                    <span className="w-8 text-[10px] font-bold text-muted-foreground text-center">{d.shortName}</span>
                    <span className="flex-1 text-xs truncate">{d.name}</span>

                    {/* Key level input */}
                    <div className="flex items-center gap-0.5 w-[88px] justify-center">
                      <button onClick={() => setLevel(d.slug, data.level - 1)}
                        className="w-5 h-5 rounded bg-secondary text-muted-foreground hover:text-foreground flex items-center justify-center text-[10px]">−</button>
                      <span className={cn("w-8 text-center text-xs font-mono font-bold",
                        data.level > 0 ? (atTarget ? "text-green-400" : "text-primary") : "text-muted-foreground/30"
                      )}>
                        {data.level > 0 ? `+${data.level}` : "—"}
                      </span>
                      <button onClick={() => setLevel(d.slug, data.level + 1)}
                        className="w-5 h-5 rounded bg-secondary text-muted-foreground hover:text-foreground flex items-center justify-center text-[10px]">+</button>
                    </div>

                    {/* Score */}
                    <span className={cn("w-16 text-right text-xs font-mono",
                      atTarget ? "text-green-400" : score > 0 ? "text-foreground" : "text-muted-foreground/30"
                    )}>
                      {score > 0 ? Math.round(score) : "—"}
                      {data.rioScore !== null && <span className="text-[8px] text-muted-foreground ml-0.5">rio</span>}
                    </span>

                    {/* Need */}
                    <span className={cn("w-16 text-right text-xs",
                      atTarget ? "text-green-400" : "text-orange-400"
                    )}>
                      {atTarget ? "✓" : neededLevel > 0 ? `+${neededLevel}` : "—"}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Progress */}
          <div className="bg-secondary/30 border border-border rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground">
                {playerProfile ? `${playerProfile.name}'s Progress` : "Progress"}
              </span>
              <span className={cn("text-sm font-bold", currentRating >= targetRating ? "text-green-400" : "text-foreground")}>
                {Math.round(currentRating)} / {targetRating}
              </span>
            </div>
            <div className="h-2 bg-secondary rounded-full overflow-hidden">
              <div
                className={cn("h-full rounded-full transition-all", currentRating >= targetRating ? "bg-green-500" : "bg-primary")}
                style={{ width: `${Math.min(100, (currentRating / targetRating) * 100)}%` }}
              />
            </div>
            <div className="flex items-center justify-between mt-1.5">
              <span className={cn("text-xs", remaining === 0 ? "text-green-400 font-medium" : "text-muted-foreground")}>
                {remaining === 0 ? "Target reached!" : `${Math.round(remaining)} remaining`}
              </span>
              <span className="text-[10px] text-muted-foreground">
                {Math.round((currentRating / targetRating) * 100)}%
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function findDungeonSlug(shortName?: string, fullName?: string): string | null {
  const SHORT_NAME_MAP: Record<string, string> = {
    "MT": "magisters-terrace", "MC": "maisara-caverns", "NPX": "nexus-point-xenas",
    "WS": "windrunner-spire", "AA": "algethar-academy", "POS": "pit-of-saron",
    "SEAT": "seat-of-the-triumvirate", "SOTT": "seat-of-the-triumvirate",
    "SR": "skyreach", "SKY": "skyreach",
  };
  if (shortName) {
    const upper = shortName.toUpperCase();
    if (SHORT_NAME_MAP[upper]) return SHORT_NAME_MAP[upper];
    for (const d of DUNGEONS) {
      if (d.shortName.toUpperCase() === upper) return d.slug;
    }
  }
  if (fullName) {
    const lower = fullName.toLowerCase();
    for (const d of DUNGEONS) {
      if (d.name.toLowerCase() === lower || d.name.toLowerCase().includes(lower) || lower.includes(d.name.toLowerCase())) return d.slug;
    }
  }
  return null;
}
