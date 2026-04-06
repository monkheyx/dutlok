"use client";

import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import type { Boss, Ability } from "@/data/strategies";
import {
  Shield,
  Heart,
  Sword,
  Zap,
  Link2,
  ChevronRight,
  ChevronLeft,
  Play,
  Pause,
  ListChecks,
  Eye,
  EyeOff,
  AlertTriangle,
  Hash,
} from "lucide-react";

type Difficulty = "normal" | "heroic" | "mythic";
type Role = "tank" | "healer" | "dps" | "everyone";

const DIFFICULTY_COLORS: Record<Difficulty, { bg: string; text: string; border: string }> = {
  normal: { bg: "bg-green-500/15", text: "text-green-400", border: "border-green-500/40" },
  heroic: { bg: "bg-purple-500/15", text: "text-purple-400", border: "border-purple-500/40" },
  mythic: { bg: "bg-orange-500/15", text: "text-orange-400", border: "border-orange-500/40" },
};

const ROLE_CONFIG: { key: Role; label: string; icon: typeof Shield; activeColor: string }[] = [
  { key: "tank", label: "Tank", icon: Shield, activeColor: "bg-blue-500/15 border-blue-500/40 text-blue-400" },
  { key: "healer", label: "Heal", icon: Heart, activeColor: "bg-green-500/15 border-green-500/40 text-green-400" },
  { key: "dps", label: "DPS", icon: Sword, activeColor: "bg-red-500/15 border-red-500/40 text-red-400" },
];

interface Props {
  boss: Boss;
  tierName: string;
}

export function BossGuideClient({ boss, tierName }: Props) {
  const [difficulty, setDifficulty] = useState<Difficulty>("heroic");
  const [activeRoles, setActiveRoles] = useState<Set<Role>>(new Set<Role>(["tank", "healer", "dps", "everyone"]));
  const [showQuickStrat, setShowQuickStrat] = useState(false);
  const [presentationMode, setPresentationMode] = useState(false);
  const [presentationIndex, setPresentationIndex] = useState(0);
  const [autoAdvance, setAutoAdvance] = useState(false);
  const [activePhase, setActivePhase] = useState(0);
  const autoAdvanceRef = useRef<NodeJS.Timeout | null>(null);
  const phaseRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Flatten all visible abilities for presentation mode
  const allVisibleAbilities = boss.phases.flatMap((phase) =>
    phase.abilities
      .filter((a) => a.difficulties.includes(difficulty))
      .filter((a) => a.roles.some((r) => r === "everyone" || activeRoles.has(r)))
      .map((a) => ({ ...a, phaseName: phase.name }))
  );

  function toggleRole(role: Role) {
    setActiveRoles((prev) => {
      const next = new Set(prev);
      if (next.has(role)) {
        next.delete(role);
      } else {
        next.add(role);
      }
      next.add("everyone");
      return next;
    });
  }

  function isAbilityVisible(ability: Ability): boolean {
    if (!ability.difficulties.includes(difficulty)) return false;
    return ability.roles.some((r) => r === "everyone" || activeRoles.has(r));
  }

  function copyShareLink(abilityName: string) {
    const id = abilityName.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const url = `${window.location.origin}${window.location.pathname}#${id}`;
    navigator.clipboard.writeText(url);
  }

  function scrollToPhase(idx: number) {
    phaseRefs.current[idx]?.scrollIntoView({ behavior: "smooth", block: "start" });
    setActivePhase(idx);
  }

  // Presentation mode auto-advance
  useEffect(() => {
    if (autoAdvance && presentationMode) {
      autoAdvanceRef.current = setInterval(() => {
        setPresentationIndex((prev) => {
          if (prev >= allVisibleAbilities.length - 1) {
            setAutoAdvance(false);
            return prev;
          }
          return prev + 1;
        });
      }, 15000);
    }
    return () => {
      if (autoAdvanceRef.current) clearInterval(autoAdvanceRef.current);
    };
  }, [autoAdvance, presentationMode, allVisibleAbilities.length]);

  // Update URL hash for presentation mode
  useEffect(() => {
    if (presentationMode && allVisibleAbilities[presentationIndex]) {
      const id = allVisibleAbilities[presentationIndex].name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      window.location.hash = id;
    }
  }, [presentationIndex, presentationMode, allVisibleAbilities]);

  // Count visible abilities per phase
  const phaseCounts = boss.phases.map((phase) =>
    phase.abilities.filter(isAbilityVisible).length
  );

  return (
    <div className="space-y-4">
      {/* Controls bar — responsive */}
      <div className="bg-card border border-border rounded-lg p-3">
        <div className="flex flex-wrap items-center gap-2">
          {/* Difficulty */}
          <div className="flex gap-1">
            {(["normal", "heroic", "mythic"] as Difficulty[]).map((d) => {
              const colors = DIFFICULTY_COLORS[d];
              return (
                <button
                  key={d}
                  onClick={() => setDifficulty(d)}
                  className={cn(
                    "px-2.5 py-1 rounded text-xs font-bold uppercase tracking-wider border transition-all",
                    difficulty === d
                      ? `${colors.bg} ${colors.text} ${colors.border}`
                      : "bg-secondary border-border text-muted-foreground hover:text-foreground"
                  )}
                >
                  {d.charAt(0).toUpperCase()}
                </button>
              );
            })}
          </div>

          <div className="w-px h-6 bg-border" />

          {/* Roles */}
          <div className="flex gap-1">
            {ROLE_CONFIG.map(({ key, label, icon: Icon, activeColor }) => (
              <button
                key={key}
                onClick={() => toggleRole(key)}
                className={cn(
                  "flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium border transition-all",
                  activeRoles.has(key)
                    ? activeColor
                    : "bg-secondary border-border text-muted-foreground/40 hover:text-muted-foreground"
                )}
              >
                <Icon className="h-3 w-3" />
                <span className="hidden sm:inline">{label}</span>
              </button>
            ))}
          </div>

          <div className="flex-1" />

          {/* Actions */}
          <div className="flex gap-1">
            <button
              onClick={() => setShowQuickStrat(!showQuickStrat)}
              className={cn(
                "flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium border transition-all",
                showQuickStrat
                  ? "bg-primary/15 border-primary/40 text-primary"
                  : "bg-secondary border-border text-muted-foreground hover:text-foreground"
              )}
            >
              <ListChecks className="h-3 w-3" />
              <span className="hidden sm:inline">TLDR</span>
            </button>
            <button
              onClick={() => {
                setPresentationMode(!presentationMode);
                setPresentationIndex(0);
                setAutoAdvance(false);
              }}
              className={cn(
                "flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium border transition-all",
                presentationMode
                  ? "bg-primary/15 border-primary/40 text-primary"
                  : "bg-secondary border-border text-muted-foreground hover:text-foreground"
              )}
            >
              {presentationMode ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
              <span className="hidden sm:inline">Present</span>
            </button>
          </div>
        </div>
      </div>

      {/* Quick Strat */}
      {showQuickStrat && (
        <div className="bg-card border-2 border-primary/30 rounded-lg p-4">
          <h3 className="text-xs font-bold uppercase tracking-[0.15em] text-primary mb-2 flex items-center gap-2">
            <Zap className="h-3.5 w-3.5" />
            Quick Strategy
          </h3>
          <ul className="space-y-1.5">
            {boss.quickStrat.map((bullet, i) => (
              <li key={i} className="flex gap-2 text-sm">
                <span className="text-primary font-bold mt-0.5 flex-shrink-0">→</span>
                <span className="text-foreground">{bullet}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Presentation mode controls */}
      {presentationMode && (
        <div className="bg-card border border-primary/30 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPresentationIndex(Math.max(0, presentationIndex - 1))}
                disabled={presentationIndex === 0}
                className="p-1.5 rounded bg-secondary border border-border text-foreground hover:bg-accent disabled:opacity-30 transition-all"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="text-sm font-mono">
                {presentationIndex + 1}/{allVisibleAbilities.length}
              </span>
              <button
                onClick={() => setPresentationIndex(Math.min(allVisibleAbilities.length - 1, presentationIndex + 1))}
                disabled={presentationIndex >= allVisibleAbilities.length - 1}
                className="p-1.5 rounded bg-secondary border border-border text-foreground hover:bg-accent disabled:opacity-30 transition-all"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
              {allVisibleAbilities[presentationIndex] && (
                <span className="text-xs text-muted-foreground hidden sm:inline">
                  {allVisibleAbilities[presentationIndex].phaseName} — {allVisibleAbilities[presentationIndex].name}
                </span>
              )}
            </div>
            <button
              onClick={() => setAutoAdvance(!autoAdvance)}
              className={cn(
                "flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium border transition-all",
                autoAdvance
                  ? "bg-green-500/15 border-green-500/40 text-green-400"
                  : "bg-secondary border-border text-muted-foreground"
              )}
            >
              {autoAdvance ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
              {autoAdvance ? "Pause" : "Auto"}
            </button>
          </div>
        </div>
      )}

      {/* Main content area with optional phase sidebar */}
      <div className="flex gap-4">
        {/* Phase sidebar — desktop only */}
        {boss.phases.length > 1 && (
          <div className="hidden lg:block w-48 flex-shrink-0">
            <div className="sticky top-4 space-y-1">
              <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground mb-2 px-2">
                Phases
              </p>
              {boss.phases.map((phase, idx) => (
                <button
                  key={idx}
                  onClick={() => scrollToPhase(idx)}
                  className={cn(
                    "w-full text-left px-2 py-1.5 rounded text-xs transition-colors",
                    activePhase === idx
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent"
                  )}
                >
                  <span className="block truncate">{phase.name}</span>
                  <span className="text-[10px] text-muted-foreground">
                    {phaseCounts[idx]} abilities
                  </span>
                </button>
              ))}

              {/* Overview link */}
              <div className="border-t border-border mt-2 pt-2">
                <button
                  onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                  className="w-full text-left px-2 py-1.5 rounded text-xs text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                >
                  Back to top
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Main content */}
        <div className="flex-1 min-w-0 space-y-4">
          {/* Fight Overview */}
          <div className="bg-card border border-border rounded-lg p-4">
            <h3 className="text-[10px] font-bold uppercase tracking-[0.15em] text-primary mb-2">
              Fight Overview
            </h3>
            <ul className="space-y-1.5">
              {boss.fightOverview.map((line, i) => (
                <li key={i} className="flex gap-2 text-sm text-muted-foreground">
                  <span className="text-primary/50 mt-0.5 flex-shrink-0">•</span>
                  <span dangerouslySetInnerHTML={{ __html: formatBold(line) }} />
                </li>
              ))}
            </ul>
          </div>

          {/* Video Guide */}
          {boss.guideVideo && (
            <div className="bg-card border border-border rounded-lg p-4">
              <h3 className="text-[10px] font-bold uppercase tracking-[0.15em] text-primary mb-3 flex items-center gap-2">
                <Play className="h-3.5 w-3.5" />
                Video Guide — Hazelnuttygames
              </h3>
              <div className="relative w-full rounded-lg overflow-hidden border border-border bg-black" style={{ paddingBottom: "56.25%" }}>
                <iframe
                  className="absolute inset-0 w-full h-full"
                  src={boss.guideVideo.replace("watch?v=", "embed/")}
                  title={`${boss.name} Video Guide`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </div>
          )}

          {/* Phase sections */}
          {boss.phases.map((phase, phaseIdx) => {
            const visibleAbilities = phase.abilities.filter(isAbilityVisible);
            if (visibleAbilities.length === 0) return null;

            return (
              <div
                key={phaseIdx}
                ref={(el) => { phaseRefs.current[phaseIdx] = el; }}
                className="space-y-3 scroll-mt-4"
              >
                {/* Phase banner */}
                <div className="flex items-center gap-3 px-4 py-2.5 rounded-lg bg-secondary/40 border border-border">
                  <Hash className="h-4 w-4 text-primary flex-shrink-0" />
                  <div>
                    <h2 className="text-sm font-bold text-foreground">{phase.name}</h2>
                    <p className="text-xs text-muted-foreground">{phase.summary}</p>
                  </div>
                </div>

                {/* Ability cards */}
                {visibleAbilities.map((ability, abilityIdx) => {
                  const abilityId = ability.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");

                  const isPresentationTarget =
                    presentationMode &&
                    allVisibleAbilities[presentationIndex]?.name === ability.name &&
                    allVisibleAbilities[presentationIndex]?.phaseName === phase.name;

                  if (presentationMode && !isPresentationTarget) {
                    return (
                      <div
                        key={abilityIdx}
                        id={abilityId}
                        className="bg-card/30 border border-border/30 rounded-lg px-4 py-2.5 opacity-25 transition-all"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{ability.icon}</span>
                          <span className="text-sm text-muted-foreground">{ability.name}</span>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div
                      key={abilityIdx}
                      id={abilityId}
                      className={cn(
                        "bg-card border rounded-lg overflow-hidden transition-all",
                        isPresentationTarget
                          ? "border-primary/50 ring-1 ring-primary/30"
                          : "border-border"
                      )}
                    >
                      {/* Ability header */}
                      <div className="px-4 py-3 flex flex-wrap items-center gap-3">
                        {/* Icon + Title */}
                        <div className="flex items-center gap-2.5 flex-1 min-w-0">
                          <span className="text-2xl flex-shrink-0 bg-secondary rounded-lg w-10 h-10 flex items-center justify-center">
                            {ability.icon}
                          </span>
                          <div className="min-w-0">
                            <h4 className="text-sm font-bold text-foreground truncate">{ability.name}</h4>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] text-muted-foreground uppercase tracking-wider">{ability.type}</span>
                              {/* Inline role badges */}
                              <div className="flex gap-0.5">
                                {ability.roles.map((role) => (
                                  <RoleDot key={role} role={role} />
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Difficulty indicators */}
                        <div className="flex items-center gap-0.5">
                          {(["normal", "heroic", "mythic"] as Difficulty[]).map((d) => {
                            const c = DIFFICULTY_COLORS[d];
                            const active = ability.difficulties.includes(d);
                            return (
                              <span
                                key={d}
                                className={cn(
                                  "text-[10px] font-bold uppercase w-5 h-5 rounded flex items-center justify-center",
                                  active && d === difficulty
                                    ? `${c.bg} ${c.text}`
                                    : active
                                    ? "text-muted-foreground/40"
                                    : "text-muted-foreground/15"
                                )}
                              >
                                {d.charAt(0)}
                              </span>
                            );
                          })}
                        </div>

                        {/* Share */}
                        <button
                          onClick={() => copyShareLink(ability.name)}
                          className="text-muted-foreground/40 hover:text-primary transition-colors p-0.5"
                          title="Copy link"
                        >
                          <Link2 className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      {/* Ability body */}
                      <div className="px-4 pb-4 space-y-2.5">
                        <p
                          className="text-sm text-muted-foreground leading-relaxed"
                          dangerouslySetInnerHTML={{ __html: formatBold(ability.description) }}
                        />

                        {ability.dangerText && (
                          <div className="flex items-start gap-2 text-xs text-orange-400 bg-orange-500/8 border border-orange-500/15 rounded px-3 py-2">
                            <AlertTriangle className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" />
                            <span className="font-medium">{ability.dangerText}</span>
                          </div>
                        )}

                        <div className="border-l-2 border-primary pl-3 py-0.5">
                          <p className="text-xs font-bold text-primary">{ability.whatToDo}</p>
                        </div>

                        {ability.gif && (
                          <div className="rounded-lg overflow-hidden border border-border bg-black">
                            <img
                              src={ability.gif}
                              alt={`${ability.name} demonstration`}
                              className="w-full max-h-64 object-contain"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom nav */}
      <div className="flex items-center justify-center pt-2">
        <a href="/strategies" className="text-sm text-muted-foreground hover:text-primary transition-colors">
          ← Back to all strategies
        </a>
      </div>
    </div>
  );
}

// ── Helper components ─────────────────────────────────────────────────────

function RoleDot({ role }: { role: Role }) {
  const colors: Record<Role, string> = {
    tank: "bg-blue-400",
    healer: "bg-green-400",
    dps: "bg-red-400",
    everyone: "bg-yellow-400",
  };
  const labels: Record<Role, string> = {
    tank: "Tank",
    healer: "Healer",
    dps: "DPS",
    everyone: "All",
  };
  return (
    <span
      className={cn("w-2 h-2 rounded-full", colors[role])}
      title={labels[role]}
    />
  );
}

function formatBold(text: string): string {
  return text.replace(/\*\*(.+?)\*\*/g, '<strong class="text-foreground font-semibold">$1</strong>');
}
