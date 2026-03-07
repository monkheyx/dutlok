"use client";

import { useState, useMemo } from "react";
import { Search, Wrench } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface ProfessionEntry {
  characterId: number;
  characterName: string;
  className: string | null;
  professionName: string;
  skillPoints: number;
  maxSkillPoints: number;
}

// Map profession names to items they can craft (common searches)
const PROFESSION_CRAFTS: Record<string, string[]> = {
  Alchemy: ["Flask", "Potion", "Phial", "Cauldron", "Transmute", "Elixir"],
  Blacksmithing: ["Plate", "Weapon", "Shield", "Armor", "Alloy", "Buckle"],
  Enchanting: ["Enchant", "Illusion", "Crystal", "Shard"],
  Engineering: ["Goggles", "Scope", "Tinker", "Bomb", "Mount"],
  Inscription: ["Glyph", "Vantus Rune", "Contract", "Missive", "Staff"],
  Jewelcrafting: ["Gem", "Ring", "Necklace", "Amulet", "Stone", "Jewelry"],
  Leatherworking: ["Leather", "Mail", "Armor", "Kit", "Drums"],
  Tailoring: ["Cloth", "Bag", "Robe", "Spellthread", "Embellishment"],
};

const CLASS_TEXT_COLORS: Record<string, string> = {
  Warrior: "text-wow-warrior",
  Paladin: "text-wow-paladin",
  Hunter: "text-wow-hunter",
  Rogue: "text-wow-rogue",
  Priest: "text-wow-priest",
  "Death Knight": "text-wow-death-knight",
  Shaman: "text-wow-shaman",
  Mage: "text-wow-mage",
  Warlock: "text-wow-warlock",
  Monk: "text-wow-monk",
  Druid: "text-wow-druid",
  "Demon Hunter": "text-wow-demon-hunter",
  Evoker: "text-wow-evoker",
};

export function ProfessionSearch({ professions }: { professions: ProfessionEntry[] }) {
  const [search, setSearch] = useState("");

  // Group professions by name
  const grouped = useMemo(() => {
    const map: Record<string, ProfessionEntry[]> = {};
    for (const p of professions) {
      if (!map[p.professionName]) map[p.professionName] = [];
      map[p.professionName].push(p);
    }
    return map;
  }, [professions]);

  const allProfessionNames = Object.keys(grouped).sort();

  // Search: match profession names, or match craft types to find the profession
  const filteredProfessions = useMemo(() => {
    if (!search.trim()) return grouped;

    const q = search.toLowerCase();
    const result: Record<string, ProfessionEntry[]> = {};

    for (const [profName, entries] of Object.entries(grouped)) {
      // Match profession name directly
      if (profName.toLowerCase().includes(q)) {
        result[profName] = entries;
        continue;
      }

      // Match character names
      const charMatches = entries.filter((e) => e.characterName.toLowerCase().includes(q));
      if (charMatches.length > 0) {
        result[profName] = charMatches;
        continue;
      }

      // Match craft keywords
      const crafts = PROFESSION_CRAFTS[profName] || [];
      if (crafts.some((craft) => craft.toLowerCase().includes(q) || q.includes(craft.toLowerCase()))) {
        result[profName] = entries;
      }
    }

    return result;
  }, [search, grouped]);

  return (
    <div>
      {/* Search bar */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder='Search professions or items (e.g. "Flask", "Enchant", "Jewelcrafting")'
          className="w-full pl-9 pr-4 py-2 bg-secondary border border-border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary"
        />
      </div>

      {/* Quick filter buttons */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        {allProfessionNames.map((name) => (
          <button
            key={name}
            onClick={() => setSearch(search === name ? "" : name)}
            className={cn(
              "px-2.5 py-1 rounded-md text-xs font-medium border transition-colors",
              search === name
                ? "bg-primary/20 border-primary/50 text-primary"
                : "bg-secondary border-border text-muted-foreground hover:text-foreground hover:bg-accent"
            )}
          >
            {name} ({grouped[name].length})
          </button>
        ))}
      </div>

      {/* Results */}
      {Object.keys(filteredProfessions).length === 0 ? (
        <p className="text-muted-foreground text-sm text-center py-6">
          No professions match &quot;{search}&quot;. Try searching for an item type like &quot;Flask&quot; or &quot;Gem&quot;.
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {Object.entries(filteredProfessions)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([profName, entries]) => (
              <div key={profName} className="bg-secondary/50 border border-border rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Wrench className="h-4 w-4 text-muted-foreground" />
                  <h3 className="font-medium text-sm">{profName}</h3>
                  <span className="text-xs text-muted-foreground">({entries.length})</span>
                </div>
                {/* Common crafts hint */}
                {PROFESSION_CRAFTS[profName] && (
                  <p className="text-xs text-muted-foreground mb-2">
                    Crafts: {PROFESSION_CRAFTS[profName].join(", ")}
                  </p>
                )}
                <div className="space-y-1">
                  {entries.map((entry) => (
                    <div key={entry.characterId} className="flex items-center justify-between text-sm">
                      <Link
                        href={`/character/${entry.characterId}`}
                        className={cn(
                          "hover:underline font-medium",
                          CLASS_TEXT_COLORS[entry.className ?? ""] || "text-foreground"
                        )}
                      >
                        {entry.characterName}
                      </Link>
                      <div className="flex items-center gap-1.5">
                        <div className="w-16 h-1.5 bg-secondary rounded-full overflow-hidden">
                          <div
                            className={cn(
                              "h-full rounded-full",
                              entry.skillPoints >= entry.maxSkillPoints
                                ? "bg-green-500"
                                : entry.skillPoints >= entry.maxSkillPoints * 0.5
                                ? "bg-yellow-500"
                                : "bg-red-500"
                            )}
                            style={{
                              width: `${entry.maxSkillPoints > 0 ? (entry.skillPoints / entry.maxSkillPoints) * 100 : 0}%`,
                            }}
                          />
                        </div>
                        <span className="text-xs text-muted-foreground w-14 text-right">
                          {entry.skillPoints}/{entry.maxSkillPoints}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
