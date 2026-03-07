"use client";

import { useState, useMemo } from "react";
import { Copy, Check, BookOpen, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface TalentBuildProps {
  talents: any;
  className: string | null;
  activeSpec: string | null;
}

interface ParsedTalent {
  name: string;
  description?: string;
  rank: number;
  maxRank: number;
  type: "class" | "spec" | "hero";
}

export function TalentBuild({ talents, className: wowClass, activeSpec }: TalentBuildProps) {
  const [copied, setCopied] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const { classTalents, specTalents, heroTalents, loadoutCode, heroTreeName } = useMemo(() => {
    return parseTalentData(talents);
  }, [talents]);

  const hasTalents = classTalents.length > 0 || specTalents.length > 0 || heroTalents.length > 0;

  if (!hasTalents && !loadoutCode) {
    return (
      <div className="bg-card border border-border rounded-lg p-4">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          Talent Build
        </h2>
        <p className="text-muted-foreground text-sm">No talent data available. Sync this character to load talents.</p>
      </div>
    );
  }

  async function handleCopy() {
    const textToCopy = loadoutCode || "";
    if (!textToCopy) return;
    try {
      await navigator.clipboard.writeText(textToCopy);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = textToCopy;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function toggleSection(section: string) {
    setExpandedSection(expandedSection === section ? null : section);
  }

  return (
    <div className="bg-card border border-border rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          Talent Build
        </h2>
        {loadoutCode && (
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 bg-secondary border border-border rounded-md py-1.5 px-3 text-sm hover:bg-accent transition-colors"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5 text-green-400" />
                <span className="text-green-400">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" />
                Copy Code
              </>
            )}
          </button>
        )}
      </div>

      {/* Loadout code */}
      {loadoutCode && (
        <div className="mb-4">
          <label className="text-xs text-muted-foreground">Loadout Code</label>
          <div className="mt-1 bg-secondary rounded-md p-2 font-mono text-xs break-all select-all cursor-pointer" onClick={handleCopy}>
            {loadoutCode}
          </div>
        </div>
      )}

      {/* Hero Talents */}
      {heroTalents.length > 0 && (
        <TalentSection
          label={heroTreeName || "Hero Talents"}
          count={heroTalents.length}
          talents={heroTalents}
          color="text-amber-400"
          bgColor="bg-amber-500/10 border-amber-500/30"
          isExpanded={expandedSection === "hero"}
          onToggle={() => toggleSection("hero")}
        />
      )}

      {/* Class Talents */}
      {classTalents.length > 0 && (
        <TalentSection
          label="Class Talents"
          count={classTalents.length}
          talents={classTalents}
          color="text-blue-400"
          bgColor="bg-blue-500/10 border-blue-500/30"
          isExpanded={expandedSection === "class"}
          onToggle={() => toggleSection("class")}
        />
      )}

      {/* Spec Talents */}
      {specTalents.length > 0 && (
        <TalentSection
          label={`${activeSpec || "Spec"} Talents`}
          count={specTalents.length}
          talents={specTalents}
          color="text-green-400"
          bgColor="bg-green-500/10 border-green-500/30"
          isExpanded={expandedSection === "spec"}
          onToggle={() => toggleSection("spec")}
        />
      )}
    </div>
  );
}

function TalentSection({
  label,
  count,
  talents,
  color,
  bgColor,
  isExpanded,
  onToggle,
}: {
  label: string;
  count: number;
  talents: ParsedTalent[];
  color: string;
  bgColor: string;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="mb-3">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-3 py-2 rounded-md bg-secondary/50 hover:bg-secondary transition-colors text-sm"
      >
        <span className="flex items-center gap-2">
          <span className={cn("font-medium", color)}>{label}</span>
          <span className="text-xs text-muted-foreground">({count})</span>
        </span>
        {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </button>

      {/* Compact pill view (always shown) */}
      <div className="flex flex-wrap gap-1 mt-2 px-1">
        {talents.map((talent, i) => (
          <span
            key={i}
            className={cn(
              "inline-flex items-center px-2 py-0.5 rounded border text-xs font-medium",
              bgColor
            )}
            title={talent.description || talent.name}
          >
            {talent.name}
            {talent.maxRank > 1 && (
              <span className="ml-1 text-muted-foreground">
                {talent.rank}/{talent.maxRank}
              </span>
            )}
          </span>
        ))}
      </div>

      {/* Expanded detail view */}
      {isExpanded && (
        <div className="mt-2 space-y-1 px-1">
          {talents.map((talent, i) => (
            <div
              key={i}
              className="flex items-start gap-2 px-3 py-1.5 rounded bg-secondary/30 text-sm"
            >
              <span className={cn("font-medium shrink-0", color)}>{talent.name}</span>
              {talent.maxRank > 1 && (
                <span className="text-xs text-muted-foreground shrink-0">
                  ({talent.rank}/{talent.maxRank})
                </span>
              )}
              {talent.description && (
                <span className="text-xs text-muted-foreground line-clamp-1">{talent.description}</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function parseTalentData(raw: any): {
  classTalents: ParsedTalent[];
  specTalents: ParsedTalent[];
  heroTalents: ParsedTalent[];
  loadoutCode: string | null;
  heroTreeName: string | null;
} {
  const classTalents: ParsedTalent[] = [];
  const specTalents: ParsedTalent[] = [];
  const heroTalents: ParsedTalent[] = [];
  let loadoutCode: string | null = null;
  let heroTreeName: string | null = null;

  if (!raw) return { classTalents, specTalents, heroTalents, loadoutCode, heroTreeName };

  try {
    let data = typeof raw === "string" ? JSON.parse(raw) : raw;
    if (typeof data === "string") data = JSON.parse(data);

    if (data?.specializations && Array.isArray(data.specializations)) {
      for (const spec of data.specializations) {
        if (spec?.loadouts && Array.isArray(spec.loadouts)) {
          const loadout = spec.loadouts.find((l: any) => l.is_active) || spec.loadouts[0];
          if (!loadout) continue;

          loadoutCode = loadout.talent_loadout_code || loadout.loadout_code || null;

          if (loadout.selected_class_talents) {
            for (const t of loadout.selected_class_talents) {
              const talent = extractTalent(t, "class");
              if (talent) classTalents.push(talent);
            }
          }
          if (loadout.selected_spec_talents) {
            for (const t of loadout.selected_spec_talents) {
              const talent = extractTalent(t, "spec");
              if (talent) specTalents.push(talent);
            }
          }
          if (loadout.selected_hero_talents) {
            for (const t of loadout.selected_hero_talents) {
              const talent = extractTalent(t, "hero");
              if (talent) heroTalents.push(talent);
            }
            // Try to get hero tree name
            if (loadout.selected_hero_talent_tree?.name) {
              heroTreeName = loadout.selected_hero_talent_tree.name;
            }
          }
        }
      }
    }

    // Fallback: top-level selected talents
    if (classTalents.length === 0 && data?.selected_class_talents) {
      for (const t of data.selected_class_talents) {
        const talent = extractTalent(t, "class");
        if (talent) classTalents.push(talent);
      }
    }
    if (specTalents.length === 0 && data?.selected_spec_talents) {
      for (const t of data.selected_spec_talents) {
        const talent = extractTalent(t, "spec");
        if (talent) specTalents.push(talent);
      }
    }

    if (!loadoutCode) {
      loadoutCode = data?.loadout_code || data?.export_code || null;
    }
  } catch {
    // Graceful failure
  }

  return { classTalents, specTalents, heroTalents, loadoutCode, heroTreeName };
}

function extractTalent(t: any, type: "class" | "spec" | "hero"): ParsedTalent | null {
  const name =
    t?.tooltip?.talent?.name ||
    t?.talent?.name ||
    t?.spell_tooltip?.spell?.name ||
    t?.name;

  if (!name) return null;

  const description =
    t?.tooltip?.spell_tooltip?.description ||
    t?.spell_tooltip?.description;

  return {
    name,
    description: description || undefined,
    rank: t?.rank ?? 1,
    maxRank: t?.max_rank ?? 1,
    type,
  };
}
