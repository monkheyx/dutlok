import Link from "next/link";
import { ChevronRight, Timer, Skull, KeyRound } from "lucide-react";
import { DUNGEONS, getNewDungeons, getLegacyDungeons } from "@/data/dungeons";

export default function MythicPlusPage() {
  const newDungeons = getNewDungeons();
  const legacyDungeons = getLegacyDungeons();

  return (
    <div className="space-y-10 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 pt-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.15em] text-primary mb-1">
            Midnight Season 1
          </p>
          <h1 className="text-2xl md:text-3xl font-black text-foreground">
            Mythic+ Dungeons
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            8 dungeons — 4 new Midnight + 4 legacy. Boss mechanics, trash tips, and key strategies.
          </p>
        </div>
        <Link
          href="/strategies"
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-secondary border border-border rounded-md text-muted-foreground hover:text-foreground transition-colors"
        >
          Raid Strategies →
        </Link>
      </div>

      {/* New Midnight dungeons */}
      <DungeonSection
        label="Midnight Dungeons"
        sublabel="New this season"
        dungeons={newDungeons}
      />

      {/* Legacy dungeons */}
      <DungeonSection
        label="Legacy Dungeons"
        sublabel="Returning from past expansions"
        dungeons={legacyDungeons}
        dimmed
      />
    </div>
  );
}

function DungeonSection({
  label,
  sublabel,
  dungeons,
  dimmed = false,
}: {
  label: string;
  sublabel: string;
  dungeons: typeof DUNGEONS;
  dimmed?: boolean;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <div className={`h-8 w-1 rounded-full ${dimmed ? "bg-muted-foreground/30" : "bg-primary"}`} />
        <div className="flex-1">
          <h2 className="text-lg font-bold text-foreground">{label}</h2>
          <p className="text-xs text-muted-foreground">{sublabel}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {dungeons.map((dungeon) => (
          <Link
            key={dungeon.slug}
            href={`/mythic-plus/${dungeon.slug}`}
            className={`group flex items-center gap-3 px-4 py-3 rounded-lg border transition-all ${
              dimmed
                ? "bg-card/50 border-border/50 hover:border-border hover:bg-card"
                : "bg-card border-border hover:border-primary/40 hover:bg-primary/5"
            }`}
          >
            <span className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center text-xs font-black ${
              dimmed
                ? "bg-secondary text-muted-foreground"
                : "bg-primary/15 text-primary"
            }`}>
              {dungeon.shortName}
            </span>

            <div className="flex-1 min-w-0">
              <p className={`text-sm font-semibold truncate ${
                dimmed ? "text-muted-foreground" : "text-foreground group-hover:text-primary"
              } transition-colors`}>
                {dungeon.name}
              </p>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Timer className="h-3 w-3" />
                  {dungeon.timer}m
                </span>
                <span className="flex items-center gap-1">
                  <Skull className="h-3 w-3" />
                  {dungeon.bossCount} bosses
                </span>
                {dungeon.expansion && (
                  <span className="text-muted-foreground/60">{dungeon.expansion}</span>
                )}
              </div>
            </div>

            <ChevronRight className={`h-4 w-4 flex-shrink-0 transition-transform group-hover:translate-x-0.5 ${
              dimmed ? "text-muted-foreground/30" : "text-muted-foreground group-hover:text-primary"
            }`} />
          </Link>
        ))}
      </div>
    </div>
  );
}
