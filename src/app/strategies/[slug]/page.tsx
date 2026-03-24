import { getBossBySlug, getAllBossSlugs } from "@/data/strategies";
import { notFound } from "next/navigation";
import { BossGuideClient } from "@/components/boss-guide-client";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Props {
  params: { slug: string };
}

export function generateStaticParams() {
  return getAllBossSlugs().map((slug) => ({ slug }));
}

export default function BossGuidePage({ params }: Props) {
  const result = getBossBySlug(params.slug);

  if (!result) return notFound();

  const { boss, tier } = result;

  // Find prev/next bosses in the same tier
  const bossIndex = tier.bosses.findIndex((b) => b.slug === boss.slug);
  const prevBoss = bossIndex > 0 ? tier.bosses[bossIndex - 1] : null;
  const nextBoss = bossIndex < tier.bosses.length - 1 ? tier.bosses[bossIndex + 1] : null;

  return (
    <div className="space-y-4 pb-12">
      {/* Breadcrumb + nav row */}
      <div className="flex items-center justify-between gap-4 pt-2">
        <div className="flex items-center gap-2 text-sm min-w-0">
          <Link href="/strategies" className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-1 flex-shrink-0">
            <ChevronLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Strategies</span>
          </Link>
          <span className="text-muted-foreground/40">/</span>
          <span className="text-muted-foreground truncate hidden sm:inline">{tier.shortName}</span>
          <span className="text-muted-foreground/40 hidden sm:inline">/</span>
          <span className="text-foreground font-medium truncate">{boss.name}</span>
        </div>
        <div className="flex gap-1 flex-shrink-0">
          {prevBoss && (
            <Link
              href={`/strategies/${prevBoss.slug}`}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary border border-border rounded-md px-2.5 py-1.5 transition-colors"
              title={prevBoss.name}
            >
              <ChevronLeft className="h-3 w-3" />
              <span className="hidden md:inline max-w-[120px] truncate">{prevBoss.name}</span>
              <span className="md:hidden">Prev</span>
            </Link>
          )}
          {nextBoss && (
            <Link
              href={`/strategies/${nextBoss.slug}`}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary border border-border rounded-md px-2.5 py-1.5 transition-colors"
              title={nextBoss.name}
            >
              <span className="hidden md:inline max-w-[120px] truncate">{nextBoss.name}</span>
              <span className="md:hidden">Next</span>
              <ChevronRight className="h-3 w-3" />
            </Link>
          )}
        </div>
      </div>

      {/* Boss header - compact */}
      <div className="flex items-center gap-4">
        <span className="bg-primary/20 text-primary text-lg font-black w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0">
          {boss.bossNumber}
        </span>
        <div>
          <h1 className="text-xl md:text-2xl font-black text-foreground leading-tight">
            {boss.name}
          </h1>
          <p className="text-xs text-muted-foreground">
            {tier.name} — {boss.phases.length} phase{boss.phases.length !== 1 ? "s" : ""}, {boss.phases.reduce((acc, p) => acc + p.abilities.length, 0)} abilities
          </p>
        </div>
      </div>

      {/* Client-side interactive guide */}
      <BossGuideClient boss={boss} tierName={tier.name} />
    </div>
  );
}
