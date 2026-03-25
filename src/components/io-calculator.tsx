"use client";

import { useState, useMemo } from "react";
import { Calculator, Target, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { DUNGEONS } from "@/data/dungeons";

// Base score per key level (from Warcraft Wiki)
const BASE_SCORES: Record<number, number> = {
  2: 40, 3: 45, 4: 55, 5: 60, 6: 65, 7: 75, 8: 80, 9: 85,
  10: 100, 11: 105, 12: 120, 13: 125, 14: 130, 15: 135,
  16: 140, 17: 145, 18: 150, 19: 155, 20: 160,
};

function getBaseScore(level: number): number {
  if (level <= 1) return 0;
  if (BASE_SCORES[level]) return BASE_SCORES[level];
  // For levels beyond the table, extrapolate +5 per level
  const last = Math.max(...Object.keys(BASE_SCORES).map(Number));
  return BASE_SCORES[last] + (level - last) * 5;
}

// Per dungeon max contribution: best affix * 1.5 + other affix * 0.5
// If both affixes at same level: score * 1.5 + score * 0.5 = score * 2.0
function getDungeonRating(keyLevel: number): number {
  const base = getBaseScore(keyLevel);
  return base * 2.0; // Assumes same key level on both affixes
}

// Preset targets
const PRESETS = [
  { label: "Keystone Explorer", rating: 750, color: "text-green-400" },
  { label: "Keystone Conqueror", rating: 1500, color: "text-blue-400" },
  { label: "Keystone Master", rating: 2000, color: "text-purple-400" },
  { label: "Keystone Hero", rating: 2500, color: "text-orange-400" },
  { label: "Keystone Legend", rating: 3000, color: "text-red-400" },
];

export function IOCalculator() {
  const [targetRating, setTargetRating] = useState(2000);
  const [expanded, setExpanded] = useState(false);
  const [dungeonLevels, setDungeonLevels] = useState<Record<string, number>>(
    Object.fromEntries(DUNGEONS.map((d) => [d.slug, 0]))
  );

  // Calculate what even key level across all 8 dungeons achieves target
  const evenLevel = useMemo(() => {
    for (let level = 2; level <= 30; level++) {
      const total = getDungeonRating(level) * 8;
      if (total >= targetRating) return level;
    }
    return 30;
  }, [targetRating]);

  // Calculate current rating from manual inputs
  const currentRating = useMemo(() => {
    return Object.values(dungeonLevels).reduce((sum, level) => {
      return sum + (level > 0 ? getDungeonRating(level) : 0);
    }, 0);
  }, [dungeonLevels]);

  const remaining = Math.max(0, targetRating - currentRating);

  // Find which dungeons need upgrading
  const suggestions = useMemo(() => {
    const sorted = DUNGEONS
      .map((d) => ({
        ...d,
        currentLevel: dungeonLevels[d.slug] || 0,
        currentScore: getDungeonRating(dungeonLevels[d.slug] || 0),
      }))
      .sort((a, b) => a.currentLevel - b.currentLevel);

    return sorted.map((d) => {
      // Find what level this dungeon needs to reach target per-dungeon share
      const perDungeonTarget = targetRating / 8;
      let neededLevel = d.currentLevel;
      while (getDungeonRating(neededLevel) < perDungeonTarget && neededLevel < 30) {
        neededLevel++;
      }
      return { ...d, neededLevel };
    });
  }, [dungeonLevels, targetRating]);

  function setDungeonLevel(slug: string, level: number) {
    setDungeonLevels((prev) => ({ ...prev, [slug]: Math.max(0, Math.min(30, level)) }));
  }

  function setAllToLevel(level: number) {
    setDungeonLevels(Object.fromEntries(DUNGEONS.map((d) => [d.slug, level])));
  }

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-secondary/30 transition-colors text-left"
      >
        {expanded ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground rotate-[-90deg]" />}
        <Calculator className="h-4 w-4 text-primary" />
        <span className="text-sm font-semibold flex-1">M+ Rating Calculator</span>
        <span className="text-xs text-muted-foreground">Target: {targetRating}</span>
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
                      ? "bg-primary/15 border-primary/40 text-primary"
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
              step={50}
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
              To reach <strong className="text-primary">{targetRating}</strong> rating, you need approximately{" "}
              <strong className="text-primary">+{evenLevel}</strong> timed in all 8 dungeons on both Fortified and Tyrannical.
            </p>
          </div>

          {/* Per-dungeon breakdown */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs text-muted-foreground">Your Current Keys (per dungeon)</label>
              <div className="flex gap-1.5">
                <button onClick={() => setAllToLevel(0)} className="text-[10px] text-muted-foreground hover:text-foreground">Reset</button>
                <button onClick={() => setAllToLevel(evenLevel)} className="text-[10px] text-primary hover:text-primary/80">Set all +{evenLevel}</button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              {suggestions.map((d) => {
                const atTarget = d.currentLevel >= d.neededLevel && d.currentLevel > 0;
                const hasValue = d.currentLevel > 0;
                return (
                  <div
                    key={d.slug}
                    className={cn(
                      "flex items-center gap-2 px-2.5 py-1.5 rounded border text-sm",
                      atTarget ? "bg-green-500/5 border-green-500/20" : "bg-secondary/30 border-border"
                    )}
                  >
                    <span className="w-8 text-[10px] font-bold text-muted-foreground text-center">{d.shortName}</span>
                    <span className="flex-1 text-xs truncate">{d.name}</span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setDungeonLevel(d.slug, d.currentLevel - 1)}
                        className="w-5 h-5 rounded bg-secondary text-muted-foreground hover:text-foreground flex items-center justify-center text-xs"
                      >
                        −
                      </button>
                      <span className={cn(
                        "w-7 text-center text-xs font-bold",
                        atTarget ? "text-green-400" : hasValue ? "text-foreground" : "text-muted-foreground/40"
                      )}>
                        {hasValue ? `+${d.currentLevel}` : "—"}
                      </span>
                      <button
                        onClick={() => setDungeonLevel(d.slug, d.currentLevel + 1)}
                        className="w-5 h-5 rounded bg-secondary text-muted-foreground hover:text-foreground flex items-center justify-center text-xs"
                      >
                        +
                      </button>
                    </div>
                    {!atTarget && d.currentLevel > 0 && (
                      <span className="text-[10px] text-orange-400">need +{d.neededLevel}</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Summary */}
          <div className="flex items-center justify-between pt-2 border-t border-border">
            <div>
              <span className="text-xs text-muted-foreground">Current Rating: </span>
              <span className={cn("text-sm font-bold", currentRating >= targetRating ? "text-green-400" : "text-foreground")}>
                {Math.round(currentRating)}
              </span>
            </div>
            <div>
              <span className="text-xs text-muted-foreground">Remaining: </span>
              <span className={cn("text-sm font-bold", remaining === 0 ? "text-green-400" : "text-orange-400")}>
                {remaining === 0 ? "Target reached!" : Math.round(remaining)}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
