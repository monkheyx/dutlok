import Link from "next/link";
import { BookOpen, Zap, ChevronRight } from "lucide-react";
import { RAID_TIERS, getCurrentTiers } from "@/data/strategies";

export default function StrategiesPage() {
  const currentTiers = getCurrentTiers();
  const classicTiers = RAID_TIERS.filter((t) => !t.isCurrent);

  return (
    <div className="space-y-10 pb-12">
      {/* Compact hero */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 pt-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.15em] text-primary mb-1">
            Midnight Season 1
          </p>
          <h1 className="text-2xl md:text-3xl font-black text-foreground">
            Raid Strategies
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            9 bosses across 3 raids — filter by role, difficulty, or use presentation mode for raid night.
          </p>
        </div>
        <div className="flex gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-medium">
            <span className="h-1.5 w-1.5 rounded-full bg-green-400" />
            Normal
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-medium">
            <span className="h-1.5 w-1.5 rounded-full bg-purple-400" />
            Heroic
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-medium">
            <span className="h-1.5 w-1.5 rounded-full bg-orange-400" />
            Mythic
          </div>
        </div>
      </div>

      {/* Current tier boss grids */}
      {currentTiers.map((tier) => (
        <RaidSection key={tier.slug} tier={tier} />
      ))}

      {/* Previous tiers */}
      {classicTiers.length > 0 && (
        <div className="space-y-8">
          <div className="border-t border-border pt-8">
            <h2 className="text-xs font-bold uppercase tracking-[0.15em] text-muted-foreground mb-1">
              Previous Tiers
            </h2>
          </div>
          {classicTiers.map((tier) => (
            <RaidSection key={tier.slug} tier={tier} dimmed />
          ))}
        </div>
      )}
    </div>
  );
}

function RaidSection({
  tier,
  dimmed = false,
}: {
  tier: (typeof RAID_TIERS)[number];
  dimmed?: boolean;
}) {
  return (
    <div className="space-y-3">
      {/* Tier header */}
      <div className="flex items-center gap-3">
        <div className={`h-8 w-1 rounded-full ${dimmed ? "bg-muted-foreground/30" : "bg-primary"}`} />
        <div className="flex-1">
          <h2 className="text-lg font-bold text-foreground">{tier.name}</h2>
          <p className="text-xs text-muted-foreground">
            {tier.bosses.length} boss{tier.bosses.length !== 1 ? "es" : ""} — Patch {tier.patch}
          </p>
        </div>
      </div>

      {/* Boss list */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
        {tier.bosses.map((boss) => (
          <Link
            key={boss.slug}
            href={`/strategies/${boss.slug}`}
            className={`group flex items-center gap-3 px-4 py-3 rounded-lg border transition-all ${
              dimmed
                ? "bg-card/50 border-border/50 hover:border-border hover:bg-card"
                : "bg-card border-border hover:border-primary/40 hover:bg-primary/5"
            }`}
          >
            {/* Boss number */}
            <span className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-sm font-black ${
              dimmed
                ? "bg-secondary text-muted-foreground"
                : "bg-primary/15 text-primary"
            }`}>
              {boss.bossNumber}
            </span>

            {/* Boss info */}
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-semibold truncate ${
                dimmed ? "text-muted-foreground" : "text-foreground group-hover:text-primary"
              } transition-colors`}>
                {boss.name}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {boss.phases.length} phase{boss.phases.length !== 1 ? "s" : ""} — {boss.phases.reduce((acc, p) => acc + p.abilities.length, 0)} abilities
              </p>
            </div>

            {/* Arrow */}
            <ChevronRight className={`h-4 w-4 flex-shrink-0 transition-transform group-hover:translate-x-0.5 ${
              dimmed ? "text-muted-foreground/30" : "text-muted-foreground group-hover:text-primary"
            }`} />
          </Link>
        ))}
      </div>
    </div>
  );
}
