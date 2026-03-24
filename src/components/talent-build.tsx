"use client";

import { useState, useMemo, useEffect } from "react";
import { Copy, Check, BookOpen } from "lucide-react";
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
  spellId?: number;
  type: "class" | "spec" | "hero";
}

export function TalentBuild({ talents, className: wowClass, activeSpec }: TalentBuildProps) {
  const [copied, setCopied] = useState(false);
  const [icons, setIcons] = useState<Record<number, string>>({});

  const { classTalents, specTalents, heroTalents, loadoutCode, heroTreeName } = useMemo(() => {
    return parseTalentData(talents, activeSpec);
  }, [talents, activeSpec]);

  const hasTalents = classTalents.length > 0 || specTalents.length > 0 || heroTalents.length > 0;

  // Fetch spell icons
  useEffect(() => {
    fetch("/api/spell-icons")
      .then((r) => r.json())
      .then((data) => setIcons(data))
      .catch(() => {});
  }, []);

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
          <div
            className="mt-1 bg-secondary rounded-md p-2 font-mono text-xs break-all select-all cursor-pointer"
            onClick={handleCopy}
          >
            {loadoutCode}
          </div>
        </div>
      )}

      {/* Hero Talents */}
      {heroTalents.length > 0 && (
        <TalentSection
          label={heroTreeName || "Hero Talents"}
          talents={heroTalents}
          icons={icons}
          accentColor="border-amber-500/50"
          labelColor="text-amber-400"
        />
      )}

      {/* Class Talents */}
      {classTalents.length > 0 && (
        <TalentSection
          label={`${wowClass || "Class"} Talents`}
          talents={classTalents}
          icons={icons}
          accentColor="border-blue-500/50"
          labelColor="text-blue-400"
        />
      )}

      {/* Spec Talents */}
      {specTalents.length > 0 && (
        <TalentSection
          label={`${activeSpec || "Spec"} Talents`}
          talents={specTalents}
          icons={icons}
          accentColor="border-green-500/50"
          labelColor="text-green-400"
        />
      )}
    </div>
  );
}

function TalentSection({
  label,
  talents,
  icons,
  accentColor,
  labelColor,
}: {
  label: string;
  talents: ParsedTalent[];
  icons: Record<number, string>;
  accentColor: string;
  labelColor: string;
}) {
  return (
    <div className="mb-4">
      <div className="flex items-center gap-2 mb-2">
        <span className={cn("text-xs font-semibold uppercase tracking-wide", labelColor)}>
          {label}
        </span>
        <span className="text-xs text-muted-foreground">({talents.length})</span>
      </div>
      <div className="flex flex-wrap gap-1">
        {talents.map((talent, i) => (
          <TalentIcon key={i} talent={talent} iconUrl={talent.spellId ? icons[talent.spellId] : undefined} accentColor={accentColor} />
        ))}
      </div>
    </div>
  );
}

function TalentIcon({
  talent,
  iconUrl,
  accentColor,
}: {
  talent: ParsedTalent;
  iconUrl?: string;
  accentColor: string;
}) {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div
      className="relative"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <div
        className={cn(
          "w-10 h-10 rounded border-2 overflow-hidden flex items-center justify-center cursor-default transition-all",
          "bg-secondary/80 hover:brightness-125 hover:scale-110",
          accentColor
        )}
      >
        {iconUrl ? (
          <img
            src={iconUrl}
            alt={talent.name}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <span className="text-[8px] text-muted-foreground text-center leading-tight px-0.5 line-clamp-2">
            {talent.name.split(" ").slice(0, 2).join("\n")}
          </span>
        )}
      </div>
      {/* Rank badge */}
      {talent.maxRank > 1 && (
        <span className="absolute -bottom-0.5 -right-0.5 bg-black/80 border border-border text-[8px] font-bold rounded px-0.5 text-white">
          {talent.rank}/{talent.maxRank}
        </span>
      )}
      {/* Tooltip */}
      {showTooltip && (
        <div className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 bg-[#1a1a2e] border border-[#3a3a5c] rounded-md px-3 py-2 shadow-xl pointer-events-none min-w-[200px] max-w-[300px]">
          <div className="text-sm font-semibold text-white">{talent.name}</div>
          {talent.maxRank > 1 && (
            <div className="text-xs text-yellow-400 mt-0.5">
              Rank {talent.rank}/{talent.maxRank}
            </div>
          )}
          {talent.description && (
            <div className="text-xs text-gray-300 mt-1 leading-relaxed">{talent.description}</div>
          )}
        </div>
      )}
    </div>
  );
}

function parseTalentData(raw: any, activeSpec: string | null): {
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
      // Find only the active spec — don't loop through all specs
      const matchedSpec = activeSpec
        ? data.specializations.find((s: any) => s.specialization?.name === activeSpec)
        : null;
      const spec = matchedSpec || data.specializations[0];

      if (spec?.loadouts && Array.isArray(spec.loadouts)) {
        const loadout = spec.loadouts.find((l: any) => l.is_active) || spec.loadouts[0];
        if (loadout) {
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

  const description = t?.tooltip?.spell_tooltip?.description || t?.spell_tooltip?.description;

  const spellId =
    t?.tooltip?.spell_tooltip?.spell?.id ||
    t?.spell_tooltip?.spell?.id;

  return {
    name,
    description: description || undefined,
    rank: t?.rank ?? 1,
    maxRank: t?.max_rank ?? 1,
    spellId: spellId || undefined,
    type,
  };
}
