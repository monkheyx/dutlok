import { getDungeonBySlug, DUNGEONS } from "@/data/dungeons";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Timer, Skull, Shield, Heart, Sword, AlertTriangle, KeyRound, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  params: { slug: string };
}

export function generateStaticParams() {
  return DUNGEONS.map((d) => ({ slug: d.slug }));
}

export default function DungeonGuidePage({ params }: Props) {
  const dungeon = getDungeonBySlug(params.slug);
  if (!dungeon) return notFound();

  const idx = DUNGEONS.findIndex((d) => d.slug === dungeon.slug);
  const prev = idx > 0 ? DUNGEONS[idx - 1] : null;
  const next = idx < DUNGEONS.length - 1 ? DUNGEONS[idx + 1] : null;

  return (
    <div className="space-y-6 pb-12">
      {/* Breadcrumb + nav */}
      <div className="flex items-center justify-between gap-4 pt-2">
        <div className="flex items-center gap-2 text-sm min-w-0">
          <Link href="/mythic-plus" className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-1 flex-shrink-0">
            <ChevronLeft className="h-4 w-4" />
            <span className="hidden sm:inline">M+ Dungeons</span>
          </Link>
          <span className="text-muted-foreground/40">/</span>
          <span className="text-foreground font-medium truncate">{dungeon.name}</span>
        </div>
        <div className="flex gap-1 flex-shrink-0">
          {prev && (
            <Link href={`/mythic-plus/${prev.slug}`} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary border border-border rounded-md px-2.5 py-1.5 transition-colors" title={prev.name}>
              <ChevronLeft className="h-3 w-3" />
              <span className="hidden md:inline max-w-[100px] truncate">{prev.shortName}</span>
            </Link>
          )}
          {next && (
            <Link href={`/mythic-plus/${next.slug}`} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary border border-border rounded-md px-2.5 py-1.5 transition-colors" title={next.name}>
              <span className="hidden md:inline max-w-[100px] truncate">{next.shortName}</span>
              <ChevronRight className="h-3 w-3" />
            </Link>
          )}
        </div>
      </div>

      {/* Header */}
      <div className="flex items-center gap-4">
        <span className="bg-primary/20 text-primary text-sm font-black w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0">
          {dungeon.shortName}
        </span>
        <div>
          <h1 className="text-xl md:text-2xl font-black text-foreground leading-tight">
            {dungeon.name}
          </h1>
          <div className="flex items-center gap-4 text-xs text-muted-foreground mt-0.5">
            <span className="flex items-center gap-1">
              <Timer className="h-3 w-3" />
              {dungeon.timer} min timer
            </span>
            <span className="flex items-center gap-1">
              <Skull className="h-3 w-3" />
              {dungeon.bossCount} bosses
            </span>
            {dungeon.expansion && (
              <span className="text-muted-foreground/60">
                {dungeon.expansion}
              </span>
            )}
            {dungeon.isNew && (
              <span className="bg-primary/15 text-primary px-1.5 py-0.5 rounded text-[10px] font-bold uppercase">
                New
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Key Tips */}
      <div className="bg-card border-2 border-primary/30 rounded-lg p-4">
        <h3 className="text-xs font-bold uppercase tracking-[0.15em] text-primary mb-2 flex items-center gap-2">
          <KeyRound className="h-3.5 w-3.5" />
          Key Tips
        </h3>
        <ul className="space-y-1.5">
          {dungeon.keyTips.map((tip, i) => (
            <li key={i} className="flex gap-2 text-sm">
              <span className="text-primary font-bold mt-0.5 flex-shrink-0">→</span>
              <span className="text-foreground" dangerouslySetInnerHTML={{ __html: formatBold(tip) }} />
            </li>
          ))}
        </ul>
      </div>

      {/* Bosses */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-[0.12em] text-muted-foreground">
          Boss Encounters
        </h2>
        {dungeon.bosses.map((boss, i) => (
          <div key={i} className="bg-card border border-border rounded-lg overflow-hidden">
            {/* Boss header */}
            <div className="px-4 py-3 flex items-center gap-3 bg-secondary/30 border-b border-border">
              <span className="w-7 h-7 rounded bg-primary/15 text-primary text-xs font-bold flex items-center justify-center flex-shrink-0">
                {i + 1}
              </span>
              <h3 className="text-sm font-bold text-foreground">{boss.name}</h3>
            </div>

            <div className="px-4 py-3 space-y-3">
              {/* Boss image */}
              {boss.image && (
                <div className="rounded-lg overflow-hidden border border-border bg-black max-h-48">
                  <img src={boss.image} alt={boss.name} className="w-full object-cover max-h-48" />
                </div>
              )}

              {/* Mechanics */}
              <div className="space-y-2">
                {boss.mechanics.map((mech, j) => (
                  <div key={j} className="flex gap-2 text-sm text-muted-foreground">
                    <span className="text-primary/50 mt-0.5 flex-shrink-0">•</span>
                    <span dangerouslySetInnerHTML={{ __html: formatBold(mech) }} />
                  </div>
                ))}
              </div>

              {/* Role tips */}
              {(boss.tankTip || boss.healerTip || boss.dpsTip) && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 border-t border-border/50">
                  {boss.tankTip && (
                    <div className="flex items-start gap-2 text-xs">
                      <Shield className="h-3.5 w-3.5 text-blue-400 flex-shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">{boss.tankTip}</span>
                    </div>
                  )}
                  {boss.healerTip && (
                    <div className="flex items-start gap-2 text-xs">
                      <Heart className="h-3.5 w-3.5 text-green-400 flex-shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">{boss.healerTip}</span>
                    </div>
                  )}
                  {boss.dpsTip && (
                    <div className="flex items-start gap-2 text-xs">
                      <Sword className="h-3.5 w-3.5 text-red-400 flex-shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">{boss.dpsTip}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Trash Tips */}
      <div className="bg-card border border-border rounded-lg p-4">
        <h3 className="text-xs font-bold uppercase tracking-[0.15em] text-orange-400 mb-2 flex items-center gap-2">
          <AlertTriangle className="h-3.5 w-3.5" />
          Trash & Route Tips
        </h3>
        <ul className="space-y-1.5">
          {dungeon.trashTips.map((tip, i) => (
            <li key={i} className="flex gap-2 text-sm text-muted-foreground">
              <span className="text-orange-400/50 mt-0.5 flex-shrink-0">•</span>
              <span dangerouslySetInnerHTML={{ __html: formatBold(tip) }} />
            </li>
          ))}
        </ul>
      </div>

      {/* Bottom nav */}
      <div className="flex items-center justify-center pt-2">
        <Link href="/mythic-plus" className="text-sm text-muted-foreground hover:text-primary transition-colors">
          ← Back to all dungeons
        </Link>
      </div>
    </div>
  );
}

function formatBold(text: string): string {
  return text.replace(/\*\*(.+?)\*\*/g, '<strong class="text-foreground font-semibold">$1</strong>');
}
