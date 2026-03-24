"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight, Wrench } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProfTier {
  name: string;
  tierName: string | null;
  skillPoints: number;
  maxSkillPoints: number;
}

interface GroupedProfession {
  name: string;
  currentTier: ProfTier | null;
  oldTiers: ProfTier[];
}

const CURRENT_EXPANSION_KEYWORDS = ["midnight", "khaz algar"];

function isCurrent(tierName: string | null): boolean {
  if (!tierName) return false;
  const lower = tierName.toLowerCase();
  return CURRENT_EXPANSION_KEYWORDS.some((kw) => lower.includes(kw));
}

export function ProfessionTiers({ professions }: { professions: any[] }) {
  // Group by profession name
  const grouped: Record<string, ProfTier[]> = {};
  for (const prof of professions) {
    if (!prof?.name) continue;
    if (!grouped[prof.name]) grouped[prof.name] = [];
    grouped[prof.name].push({
      name: prof.name,
      tierName: prof.tierName || null,
      skillPoints: prof.skillPoints ?? 0,
      maxSkillPoints: prof.maxSkillPoints ?? 0,
    });
  }

  // Build grouped profession list
  const profList: GroupedProfession[] = Object.entries(grouped).map(([name, tiers]) => {
    const currentTier = tiers.find((t) => isCurrent(t.tierName)) || null;
    const oldTiers = tiers.filter((t) => !isCurrent(t.tierName) && (t.skillPoints > 0 || t.maxSkillPoints > 0));
    return { name, currentTier, oldTiers };
  });

  if (profList.length === 0) {
    return <p className="text-muted-foreground text-sm">No profession data available.</p>;
  }

  return (
    <div className="space-y-3">
      {profList.map((prof) => (
        <ProfessionRow key={prof.name} prof={prof} />
      ))}
    </div>
  );
}

function ProfessionRow({ prof }: { prof: GroupedProfession }) {
  const [expanded, setExpanded] = useState(false);
  const hasOldTiers = prof.oldTiers.length > 0;

  return (
    <div>
      {/* Current expansion tier — always visible */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {hasOldTiers ? (
            <button
              onClick={() => setExpanded(!expanded)}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              {expanded ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
            </button>
          ) : (
            <Wrench className="h-3.5 w-3.5 text-muted-foreground/40" />
          )}
          <span className="font-medium">{prof.name}</span>
          {prof.currentTier?.tierName && (
            <span className="text-xs text-primary/70">{prof.currentTier.tierName}</span>
          )}
        </div>
        {prof.currentTier ? (
          <div className="flex items-center gap-2">
            <div className="w-20 h-1.5 bg-secondary rounded-full overflow-hidden">
              <div
                className={cn(
                  "h-full rounded-full",
                  prof.currentTier.skillPoints >= prof.currentTier.maxSkillPoints
                    ? "bg-green-500"
                    : prof.currentTier.skillPoints >= prof.currentTier.maxSkillPoints * 0.5
                    ? "bg-yellow-500"
                    : "bg-red-500"
                )}
                style={{
                  width: `${prof.currentTier.maxSkillPoints > 0 ? (prof.currentTier.skillPoints / prof.currentTier.maxSkillPoints) * 100 : 0}%`,
                }}
              />
            </div>
            <span className="text-sm text-muted-foreground w-16 text-right">
              {prof.currentTier.skillPoints}/{prof.currentTier.maxSkillPoints}
            </span>
          </div>
        ) : (
          <span className="text-xs text-muted-foreground">No current data</span>
        )}
      </div>

      {/* Old expansion tiers — collapsible */}
      {expanded && hasOldTiers && (
        <div className="ml-6 mt-1.5 space-y-1 border-l-2 border-border pl-3">
          {prof.oldTiers.map((tier, i) => (
            <div key={i} className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                {tier.tierName || prof.name}
              </span>
              <span className="text-xs text-muted-foreground">
                {tier.skillPoints}/{tier.maxSkillPoints}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
