"use client";

import { useState, useMemo } from "react";
import { Calculator, Target, ChevronDown, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { DUNGEONS } from "@/data/dungeons";

// ═══════════════════════════════════════════════════════════════════════════
// Scoring formula from mythicplanner.com
// Base score per key level (timed run, no bonus/penalty)
// ═══════════════════════════════════════════════════════════════════════════
const BASE_SCORES: Record<number, number> = {
  2: 155, 3: 170, 4: 200, 5: 215, 6: 230, 7: 260, 8: 275, 9: 290,
  10: 320, 11: 335, 12: 365, 13: 380, 14: 395, 15: 410,
  16: 425, 17: 440, 18: 455, 19: 470, 20: 485,
};

// Min/max score bounds per level (overtime penalty floor / speed bonus ceiling)
const SCORE_BOUNDS: Record<number, { min: number; max: number }> = {
  2: { min: 125, max: 170 }, 3: { min: 140, max: 185 },
  4: { min: 170, max: 215 }, 5: { min: 185, max: 230 },
  6: { min: 200, max: 245 }, 7: { min: 230, max: 275 },
  8: { min: 245, max: 290 }, 9: { min: 260, max: 305 },
  10: { min: 290, max: 335 }, 11: { min: 290, max: 350 },
  12: { min: 290, max: 380 }, 13: { min: 290, max: 395 },
  14: { min: 290, max: 410 }, 15: { min: 290, max: 425 },
  16: { min: 290, max: 440 }, 17: { min: 290, max: 455 },
  18: { min: 290, max: 470 }, 19: { min: 290, max: 485 },
  20: { min: 290, max: 500 },
};

function getBaseScore(level: number): number {
  if (level <= 1) return 0;
  if (BASE_SCORES[level]) return BASE_SCORES[level];
  const last = 20;
  return BASE_SCORES[last] + (level - last) * 15;
}

function getMaxScore(level: number): number {
  if (level <= 1) return 0;
  if (SCORE_BOUNDS[level]) return SCORE_BOUNDS[level].max;
  return getBaseScore(level) + 15;
}

function getMinScore(level: number): number {
  if (level <= 1) return 0;
  if (SCORE_BOUNDS[level]) return SCORE_BOUNDS[level].min;
  return 290; // Floor for high keys
}

// Per dungeon: best affix * 1.5 + other affix * 0.5
// Assuming same level on both affixes (Fortified + Tyrannical)
function getDungeonRatingBothAffixes(level: number): number {
  const score = getBaseScore(level);
  return score * 1.5 + score * 0.5; // = score * 2.0
}

// If only one affix completed
function getDungeonRatingOneAffix(level: number): number {
  return getBaseScore(level) * 1.5;
}

// Preset targets with achievement names
const PRESETS = [
  { label: "Keystone Explorer", rating: 750, color: "text-green-400" },
  { label: "Keystone Conqueror", rating: 1500, color: "text-blue-400" },
  { label: "Keystone Master", rating: 2000, color: "text-purple-400" },
  { label: "Keystone Hero", rating: 2500, color: "text-orange-400" },
  { label: "Keystone Legend", rating: 3000, color: "text-red-400" },
];

interface DungeonEntry {
  slug: string;
  fortLevel: number;
  tyrLevel: number;
}

export function IOCalculator() {
  const [targetRating, setTargetRating] = useState(2000);
  const [expanded, setExpanded] = useState(false);
  const [dungeonData, setDungeonData] = useState<Record<string, { fort: number; tyr: number }>>(
    Object.fromEntries(DUNGEONS.map((d) => [d.slug, { fort: 0, tyr: 0 }]))
  );

  // What even key level on both affixes across all 8 dungeons gets target
  const evenLevel = useMemo(() => {
    for (let level = 2; level <= 30; level++) {
      if (getDungeonRatingBothAffixes(level) * 8 >= targetRating) return level;
    }
    return 30;
  }, [targetRating]);

  // Calculate current rating from inputs
  const currentRating = useMemo(() => {
    return Object.values(dungeonData).reduce((sum, { fort, tyr }) => {
      if (fort === 0 && tyr === 0) return sum;
      const fortScore = getBaseScore(fort);
      const tyrScore = getBaseScore(tyr);
      const best = Math.max(fortScore, tyrScore);
      const other = Math.min(fortScore, tyrScore);
      return sum + best * 1.5 + other * 0.5;
    }, 0);
  }, [dungeonData]);

  const remaining = Math.max(0, targetRating - currentRating);

  function setLevel(slug: string, affix: "fort" | "tyr", value: number) {
    setDungeonData((prev) => ({
      ...prev,
      [slug]: { ...prev[slug], [affix]: Math.max(0, Math.min(30, value)) },
    }));
  }

  function setAllToLevel(level: number) {
    setDungeonData(Object.fromEntries(DUNGEONS.map((d) => [d.slug, { fort: level, tyr: level }])));
  }

  function resetAll() {
    setDungeonData(Object.fromEntries(DUNGEONS.map((d) => [d.slug, { fort: 0, tyr: 0 }])));
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
                      ? `bg-primary/15 border-primary/40 text-primary`
                      : "bg-secondary border-border text-muted-foreground hover:text-foreground"
                  )}
                >
                  {p.label} ({p.rating})
                </button>
              ))}
            </div>
            <input
              type="range"
              min={500}
              max={4000}
              step={25}
              value={targetRating}
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
              Formula: Best affix score × 1.5 + Other affix × 0.5, summed across all dungeons.
            </p>
          </div>

          {/* Per-dungeon breakdown with Fort/Tyr split */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs text-muted-foreground">Your Keys (Fortified / Tyrannical)</label>
              <div className="flex gap-2">
                <button onClick={resetAll} className="text-[10px] text-muted-foreground hover:text-foreground transition-colors">Reset</button>
                <button onClick={() => setAllToLevel(evenLevel)} className="text-[10px] text-primary hover:text-primary/80 transition-colors">Set all +{evenLevel}</button>
              </div>
            </div>

            {/* Column headers */}
            <div className="flex items-center gap-2 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">
              <span className="w-8 text-center">Key</span>
              <span className="flex-1">Dungeon</span>
              <span className="w-[88px] text-center text-green-400/70">Fort</span>
              <span className="w-[88px] text-center text-purple-400/70">Tyr</span>
              <span className="w-14 text-right">Score</span>
            </div>

            <div className="space-y-1">
              {DUNGEONS.map((d) => {
                const data = dungeonData[d.slug];
                const fortScore = getBaseScore(data.fort);
                const tyrScore = getBaseScore(data.tyr);
                const best = Math.max(fortScore, tyrScore);
                const other = Math.min(fortScore, tyrScore);
                const dungeonScore = best * 1.5 + other * 0.5;
                const targetPerDungeon = targetRating / 8;
                const atTarget = dungeonScore >= targetPerDungeon && (data.fort > 0 || data.tyr > 0);

                return (
                  <div
                    key={d.slug}
                    className={cn(
                      "flex items-center gap-2 px-2.5 py-1.5 rounded border text-sm",
                      atTarget ? "bg-green-500/5 border-green-500/20" : "bg-secondary/20 border-border"
                    )}
                  >
                    <span className="w-8 text-[10px] font-bold text-muted-foreground text-center">{d.shortName}</span>
                    <span className="flex-1 text-xs truncate">{d.name}</span>

                    {/* Fortified */}
                    <div className="flex items-center gap-0.5 w-[88px] justify-center">
                      <button onClick={() => setLevel(d.slug, "fort", data.fort - 1)} className="w-5 h-5 rounded bg-secondary text-muted-foreground hover:text-foreground flex items-center justify-center text-[10px]">−</button>
                      <span className={cn("w-7 text-center text-xs font-mono", data.fort > 0 ? "text-green-400 font-bold" : "text-muted-foreground/30")}>
                        {data.fort > 0 ? `+${data.fort}` : "—"}
                      </span>
                      <button onClick={() => setLevel(d.slug, "fort", data.fort + 1)} className="w-5 h-5 rounded bg-secondary text-muted-foreground hover:text-foreground flex items-center justify-center text-[10px]">+</button>
                    </div>

                    {/* Tyrannical */}
                    <div className="flex items-center gap-0.5 w-[88px] justify-center">
                      <button onClick={() => setLevel(d.slug, "tyr", data.tyr - 1)} className="w-5 h-5 rounded bg-secondary text-muted-foreground hover:text-foreground flex items-center justify-center text-[10px]">−</button>
                      <span className={cn("w-7 text-center text-xs font-mono", data.tyr > 0 ? "text-purple-400 font-bold" : "text-muted-foreground/30")}>
                        {data.tyr > 0 ? `+${data.tyr}` : "—"}
                      </span>
                      <button onClick={() => setLevel(d.slug, "tyr", data.tyr + 1)} className="w-5 h-5 rounded bg-secondary text-muted-foreground hover:text-foreground flex items-center justify-center text-[10px]">+</button>
                    </div>

                    {/* Score */}
                    <span className={cn("w-14 text-right text-xs font-mono", atTarget ? "text-green-400" : "text-muted-foreground")}>
                      {data.fort > 0 || data.tyr > 0 ? Math.round(dungeonScore) : "—"}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Summary bar */}
          <div className="bg-secondary/30 border border-border rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground">Progress</span>
              <span className={cn("text-sm font-bold", currentRating >= targetRating ? "text-green-400" : "text-foreground")}>
                {Math.round(currentRating)} / {targetRating}
              </span>
            </div>
            <div className="h-2 bg-secondary rounded-full overflow-hidden">
              <div
                className={cn(
                  "h-full rounded-full transition-all",
                  currentRating >= targetRating ? "bg-green-500" : "bg-primary"
                )}
                style={{ width: `${Math.min(100, (currentRating / targetRating) * 100)}%` }}
              />
            </div>
            <div className="flex items-center justify-between mt-1.5">
              <span className={cn("text-xs", remaining === 0 ? "text-green-400 font-medium" : "text-muted-foreground")}>
                {remaining === 0 ? "Target reached!" : `${Math.round(remaining)} remaining`}
              </span>
              {currentRating > 0 && (
                <span className="text-[10px] text-muted-foreground">
                  {Math.round((currentRating / targetRating) * 100)}%
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
