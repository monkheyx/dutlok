"use client";

import { useState, useMemo } from "react";
import { Calculator, ChevronDown, ChevronRight, Search, Loader2, User, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { DUNGEONS } from "@/data/dungeons";

// ═══════════════════════════════════════════════════════════════════════════
// Raider.IO uses actual scores per run (accounting for key level + time).
// For the planner/estimator, we use the known base score per key level
// from Blizzard's in-game system. These match Raider.IO's scoring.
//
// Base score = 155 + (level - 2) * 15, with bonuses at breakpoints:
//   +4, +7, +10, +12 each get an extra +15 bump
// Per dungeon total: best_affix_score * 1.5 + alt_affix_score * 0.5
// ═══════════════════════════════════════════════════════════════════════════
function getBaseScore(level: number): number {
  if (level <= 0) return 0;
  if (level === 1) return 0;
  // Base: starts at 155 for +2, +15 per level
  let score = 155 + (level - 2) * 15;
  // Breakpoint bonuses: +4, +7, +10, +12 each add +15
  if (level >= 4) score += 15;
  if (level >= 7) score += 15;
  if (level >= 10) score += 15;
  if (level >= 12) score += 15;
  return score;
}

const PRESETS = [
  { label: "Keystone Explorer", rating: 750, color: "text-green-400" },
  { label: "Keystone Conqueror", rating: 1500, color: "text-blue-400" },
  { label: "Keystone Master", rating: 2000, color: "text-purple-400" },
  { label: "Keystone Hero", rating: 2500, color: "text-orange-400" },
  { label: "Keystone Legend", rating: 3000, color: "text-red-400" },
];

interface RunData {
  dungeon: string;
  shortName: string;
  mythicLevel: number;
  score: number;
  affix: string;
  url?: string;
}

interface DungeonScores {
  best: RunData | null;
  alt: RunData | null;
  totalScore: number;
}

// Map RIO dungeon short names to our slugs
const RIO_SHORT_NAME_MAP: Record<string, string> = {
  "MT": "magisters-terrace",
  "MC": "maisara-caverns",
  "NPX": "nexus-point-xenas",
  "WS": "windrunner-spire",
  "AA": "algethar-academy",
  "PoS": "pit-of-saron",
  "SotT": "seat-of-the-triumvirate",
  "SR": "skyreach",
};

export function IOCalculator() {
  const [targetRating, setTargetRating] = useState(2000);
  const [expanded, setExpanded] = useState(false);

  // Player lookup
  const [playerName, setPlayerName] = useState("");
  const [playerRealm, setPlayerRealm] = useState("");
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupError, setLookupError] = useState("");
  const [playerProfile, setPlayerProfile] = useState<any>(null);

  // Dungeon scores - either from lookup or manual
  const [dungeonScores, setDungeonScores] = useState<Record<string, DungeonScores>>(
    Object.fromEntries(DUNGEONS.map((d) => [d.slug, { best: null, alt: null, totalScore: 0 }]))
  );

  // Manual input mode (when no player lookup)
  const [manualLevels, setManualLevels] = useState<Record<string, { fort: number; tyr: number }>>(
    Object.fromEntries(DUNGEONS.map((d) => [d.slug, { fort: 0, tyr: 0 }]))
  );

  const [useManual, setUseManual] = useState(true);

  // What even key level on both affixes across all 8 dungeons gets target
  const evenLevel = useMemo(() => {
    for (let level = 2; level <= 30; level++) {
      const perDungeon = getBaseScore(level) * 1.5 + getBaseScore(level) * 0.5;
      if (perDungeon * 8 >= targetRating) return level;
    }
    return 30;
  }, [targetRating]);

  // Calculate current rating — always from manual levels (pre-filled from RIO when available)
  const currentRating = useMemo(() => {
    return Object.values(manualLevels).reduce((sum, { fort, tyr }) => {
      const fortScore = getBaseScore(fort);
      const tyrScore = getBaseScore(tyr);
      const best = Math.max(fortScore, tyrScore);
      const other = Math.min(fortScore, tyrScore);
      return sum + best * 1.5 + other * 0.5;
    }, 0);
  }, [manualLevels]);

  const remaining = Math.max(0, targetRating - currentRating);

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

      // Build dungeon scores from best runs + alternate runs
      const newScores: Record<string, DungeonScores> = Object.fromEntries(
        DUNGEONS.map((d) => [d.slug, { best: null, alt: null, totalScore: 0 }])
      );

      for (const run of (data.mythic_plus_best_runs || [])) {
        // RIO format: run.dungeon is a string name, run.short_name is top-level
        const dungeonName = typeof run.dungeon === "string" ? run.dungeon : run.dungeon?.name || "";
        const shortName = run.short_name || run.dungeon?.short_name || "";
        const slug = findDungeonSlug(shortName, dungeonName);
        if (slug && newScores[slug]) {
          newScores[slug].best = {
            dungeon: dungeonName,
            shortName,
            mythicLevel: run.mythic_level,
            score: run.score,
            affix: run.affixes?.[0]?.name || "",
            url: run.url,
          };
        }
      }

      for (const run of (data.mythic_plus_alternate_runs || [])) {
        const dungeonName = typeof run.dungeon === "string" ? run.dungeon : run.dungeon?.name || "";
        const shortName = run.short_name || run.dungeon?.short_name || "";
        const slug = findDungeonSlug(shortName, dungeonName);
        if (slug && newScores[slug]) {
          newScores[slug].alt = {
            dungeon: dungeonName,
            shortName,
            mythicLevel: run.mythic_level,
            score: run.score,
            affix: run.affixes?.[0]?.name || "",
            url: run.url,
          };
        }
      }

      // Calculate per-dungeon totals
      for (const slug of Object.keys(newScores)) {
        const d = newScores[slug];
        const bestScore = d.best?.score || 0;
        const altScore = d.alt?.score || 0;
        d.totalScore = Math.max(bestScore, altScore) * 1.5 + Math.min(bestScore, altScore) * 0.5;
      }

      setDungeonScores(newScores);

      // Populate manual levels from RIO data — best run goes to Fort, alt to Tyr
      // (This season uses Xal'atath affixes, not classic Fort/Tyr, so we just split best/alt)
      const newManual: Record<string, { fort: number; tyr: number }> = {};
      for (const d of DUNGEONS) {
        const ds = newScores[d.slug];
        newManual[d.slug] = {
          fort: ds.best?.mythicLevel || 0,
          tyr: ds.alt?.mythicLevel || 0,
        };
      }
      setManualLevels(newManual);
      setUseManual(false);
    } catch {
      setLookupError("Failed to fetch character data");
    }
    setLookupLoading(false);
  }

  function clearLookup() {
    setPlayerProfile(null);
    setUseManual(true);
    setDungeonScores(Object.fromEntries(DUNGEONS.map((d) => [d.slug, { best: null, alt: null, totalScore: 0 }])));
  }

  function setManualLevel(slug: string, affix: "fort" | "tyr", value: number) {
    setManualLevels((prev) => ({
      ...prev,
      [slug]: { ...prev[slug], [affix]: Math.max(0, Math.min(30, value)) },
    }));
  }

  function setAllManual(level: number) {
    setManualLevels(Object.fromEntries(DUNGEONS.map((d) => [d.slug, { fort: level, tyr: level }])));
  }

  const rioScore = playerProfile?.mythic_plus_scores_by_season?.[0]?.scores?.all || 0;

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
                type="text"
                placeholder="Character name"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && lookupPlayer()}
                className="flex-1 bg-secondary border border-border rounded px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <input
                type="text"
                placeholder="Realm (e.g. area-52)"
                value={playerRealm}
                onChange={(e) => setPlayerRealm(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && lookupPlayer()}
                className="flex-1 bg-secondary border border-border rounded px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <button
                onClick={lookupPlayer}
                disabled={lookupLoading}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-primary text-primary-foreground text-xs font-medium hover:opacity-90 disabled:opacity-50"
              >
                {lookupLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Search className="h-3 w-3" />}
                Lookup
              </button>
            </div>
            {lookupError && <p className="text-xs text-red-400 mt-1">{lookupError}</p>}
            {playerProfile && !useManual && (
              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center gap-2">
                  {playerProfile.thumbnail_url && (
                    <img src={playerProfile.thumbnail_url} alt="" className="w-6 h-6 rounded-full" />
                  )}
                  <span className="text-xs font-medium">{playerProfile.name}</span>
                  <span className="text-xs text-muted-foreground">{playerProfile.realm}</span>
                  <span className="text-xs text-muted-foreground">— RIO: {rioScore}</span>
                  {playerProfile.profile_url && (
                    <a href={playerProfile.profile_url} target="_blank" rel="noopener noreferrer" className="text-primary">
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
                <button onClick={clearLookup} className="text-[10px] text-muted-foreground hover:text-foreground">Switch to manual</button>
              </div>
            )}
          </div>

          {/* Target selector */}
          <div>
            <label className="text-xs text-muted-foreground mb-2 block">Target Rating</label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {PRESETS.map((p) => (
                <button
                  key={p.rating}
                  onClick={() => setTargetRating(p.rating)}
                  className={cn(
                    "px-2.5 py-1 rounded text-xs font-medium border transition-all",
                    targetRating === p.rating
                      ? "bg-primary/15 border-primary/40 text-primary"
                      : "bg-secondary border-border text-muted-foreground hover:text-foreground"
                  )}
                >
                  {p.label} ({p.rating})
                </button>
              ))}
            </div>
            <input
              type="range" min={500} max={4000} step={25} value={targetRating}
              onChange={(e) => setTargetRating(Number(e.target.value))}
              className="w-full accent-primary"
            />
            <div className="flex justify-between text-[10px] text-muted-foreground mt-0.5">
              <span>500</span>
              <span className="text-primary font-bold text-xs">{targetRating}</span>
              <span>4000</span>
            </div>
          </div>

          {/* Quick answer */}
          <div className="bg-primary/10 border border-primary/20 rounded-lg p-3">
            <p className="text-sm">
              For <strong className="text-primary">{targetRating}</strong> rating: time all 8 dungeons at{" "}
              <strong className="text-primary">+{evenLevel}</strong> on both Fortified & Tyrannical.
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Per dungeon: best affix × 1.5 + other affix × 0.5. Base +2 = 155, +15 per level, bonuses at +4/+7/+10/+12.
            </p>
          </div>

          {/* Dungeon breakdown */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs text-muted-foreground">
                {useManual ? "Manual Entry (Fortified / Tyrannical)" : `${playerProfile?.name}'s Runs`}
              </label>
              <div className="flex gap-2">
                <button onClick={() => setAllManual(0)} className="text-[10px] text-muted-foreground hover:text-foreground">Reset</button>
                <button onClick={() => setAllManual(evenLevel)} className="text-[10px] text-primary hover:text-primary/80">Set all +{evenLevel}</button>
              </div>
            </div>

            {/* Headers */}
            <div className="flex items-center gap-2 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">
              <span className="w-8 text-center">Key</span>
              <span className="flex-1">Dungeon</span>
              <span className="w-[88px] text-center text-green-400/70">Fort</span>
              <span className="w-[88px] text-center text-purple-400/70">Tyr</span>
              <span className="w-14 text-right">Score</span>
            </div>

            <div className="space-y-1">
              {DUNGEONS.map((d) => {
                const data = manualLevels[d.slug];
                const fortScore = getBaseScore(data.fort);
                const tyrScore = getBaseScore(data.tyr);
                const best = Math.max(fortScore, tyrScore);
                const other = Math.min(fortScore, tyrScore);
                const score = best * 1.5 + other * 0.5;
                const targetPer = targetRating / 8;
                const atTarget = score >= targetPer && (data.fort > 0 || data.tyr > 0);

                // Show RIO actual score if available and different from estimate
                const rioDs = dungeonScores[d.slug];
                const hasRioData = !useManual && rioDs.totalScore > 0;

                return (
                  <div key={d.slug} className={cn("flex items-center gap-2 px-2.5 py-1.5 rounded border text-sm", atTarget ? "bg-green-500/5 border-green-500/20" : "bg-secondary/20 border-border")}>
                    <span className="w-8 text-[10px] font-bold text-muted-foreground text-center">{d.shortName}</span>
                    <span className="flex-1 text-xs truncate">{d.name}</span>
                    <LevelInput value={data.fort} color="green" onChange={(v) => setManualLevel(d.slug, "fort", v)} />
                    <LevelInput value={data.tyr} color="purple" onChange={(v) => setManualLevel(d.slug, "tyr", v)} />
                    <span className={cn("w-14 text-right text-xs font-mono", atTarget ? "text-green-400" : "text-muted-foreground")}>
                      {data.fort > 0 || data.tyr > 0 ? Math.round(score) : "—"}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Progress bar */}
          <div className="bg-secondary/30 border border-border rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground">Progress</span>
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
              {currentRating > 0 && (
                <span className="text-[10px] text-muted-foreground">{Math.round((currentRating / targetRating) * 100)}%</span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function LevelInput({ value, color, onChange }: { value: number; color: "green" | "purple"; onChange: (v: number) => void }) {
  const colorClass = color === "green" ? "text-green-400" : "text-purple-400";
  return (
    <div className="flex items-center gap-0.5 w-[88px] justify-center">
      <button onClick={() => onChange(value - 1)} className="w-5 h-5 rounded bg-secondary text-muted-foreground hover:text-foreground flex items-center justify-center text-[10px]">−</button>
      <span className={cn("w-7 text-center text-xs font-mono", value > 0 ? `${colorClass} font-bold` : "text-muted-foreground/30")}>
        {value > 0 ? `+${value}` : "—"}
      </span>
      <button onClick={() => onChange(value + 1)} className="w-5 h-5 rounded bg-secondary text-muted-foreground hover:text-foreground flex items-center justify-center text-[10px]">+</button>
    </div>
  );
}

function findDungeonSlug(shortName?: string, fullName?: string): string | null {
  // Canonical map of all known RIO short names to our slugs (case-insensitive)
  const SHORT_NAME_MAP: Record<string, string> = {
    "MT": "magisters-terrace",
    "MC": "maisara-caverns",
    "NPX": "nexus-point-xenas",
    "WS": "windrunner-spire",
    "AA": "algethar-academy",
    "POS": "pit-of-saron",
    "SEAT": "seat-of-the-triumvirate",
    "SOTT": "seat-of-the-triumvirate",
    "SR": "skyreach",
    "SKY": "skyreach",
  };

  if (shortName) {
    const upper = shortName.toUpperCase();
    if (SHORT_NAME_MAP[upper]) return SHORT_NAME_MAP[upper];
    // Also try exact match against our dungeon shortNames
    for (const d of DUNGEONS) {
      if (d.shortName.toUpperCase() === upper) return d.slug;
    }
  }

  if (fullName) {
    const lower = fullName.toLowerCase();
    for (const d of DUNGEONS) {
      if (d.name.toLowerCase() === lower) return d.slug;
      if (d.name.toLowerCase().includes(lower) || lower.includes(d.name.toLowerCase())) return d.slug;
    }
  }
  return null;
}
