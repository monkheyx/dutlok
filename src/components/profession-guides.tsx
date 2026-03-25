"use client";

import { useState } from "react";
import { BookOpen, ExternalLink, ChevronDown, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProfessionGuide {
  name: string;
  icon: string;
  guideUrl: string;
  pairedWith: string;
  type: "crafting" | "gathering" | "secondary";
  tips: string[];
}

const PROFESSION_GUIDES: ProfessionGuide[] = [
  // Crafting
  {
    name: "Alchemy",
    icon: "⚗️",
    guideUrl: "https://www.wow-professions.com/guides/wow-alchemy-leveling-guide",
    pairedWith: "Herbalism",
    type: "crafting",
    tips: [
      "Pairs best with Herbalism — farm all herbs yourself",
      "Flasks and potions are always in demand for raids and M+",
      "Transmutation specialization is profitable long-term",
    ],
  },
  {
    name: "Blacksmithing",
    icon: "⚒️",
    guideUrl: "https://www.wow-professions.com/guides/wow-blacksmithing-leveling-guide",
    pairedWith: "Mining",
    type: "crafting",
    tips: [
      "Pairs best with Mining — farm ore yourself",
      "Craft plate armor and weapons for raiders",
      "Alloy recipes are key for high-end gear",
    ],
  },
  {
    name: "Enchanting",
    icon: "✨",
    guideUrl: "https://www.wow-professions.com/guides/wow-enchanting-leveling-guide",
    pairedWith: "Any",
    type: "crafting",
    tips: [
      "Pairs with any profession — no gathering needed",
      "Disenchant gear for materials instead of vendoring",
      "Weapon enchants are the most profitable",
    ],
  },
  {
    name: "Engineering",
    icon: "⚙️",
    guideUrl: "https://www.wow-professions.com/guides/wow-engineering-leveling-guide",
    pairedWith: "Mining",
    type: "crafting",
    tips: [
      "Pairs best with Mining for ore",
      "Tinkers provide unique combat gadgets",
      "Battle rezzes and AH access are clutch utility",
    ],
  },
  {
    name: "Inscription",
    icon: "📜",
    guideUrl: "https://www.wow-professions.com/guides/wow-inscription-leveling-guide",
    pairedWith: "Herbalism",
    type: "crafting",
    tips: [
      "Pairs best with Herbalism for pigments",
      "Darkmoon cards and Vantus runes sell well early in tiers",
      "Missives for crafted gear are steady income",
    ],
  },
  {
    name: "Jewelcrafting",
    icon: "💎",
    guideUrl: "https://www.wow-professions.com/guides/wow-jewelcrafting-leveling-guide",
    pairedWith: "Mining",
    type: "crafting",
    tips: [
      "Pairs best with Mining for prospecting ore",
      "Gems are always needed — especially early season",
      "Prospect cheap ore for gem materials",
    ],
  },
  {
    name: "Leatherworking",
    icon: "🐾",
    guideUrl: "https://www.wow-professions.com/guides/wow-leatherworking-leveling-guide",
    pairedWith: "Skinning",
    type: "crafting",
    tips: [
      "Pairs best with Skinning",
      "Crafts leather and mail armor",
      "Leg armor kits have consistent demand",
    ],
  },
  {
    name: "Tailoring",
    icon: "🧵",
    guideUrl: "https://www.wow-professions.com/guides/wow-tailoring-leveling-guide",
    pairedWith: "Enchanting",
    type: "crafting",
    tips: [
      "No gathering profession required — cloth drops from humanoids",
      "Pairs well with Enchanting to DE unsold gear",
      "Spellthread leg enchants are always in demand",
    ],
  },
  // Gathering
  {
    name: "Herbalism",
    icon: "🌿",
    guideUrl: "https://www.wow-professions.com/guides/wow-herbalism-leveling-guide",
    pairedWith: "Alchemy / Inscription",
    type: "gathering",
    tips: [
      "Pairs with Alchemy or Inscription",
      "Midnight herbs are valuable early season",
      "Farm routes in high-density zones for max yield",
    ],
  },
  {
    name: "Mining",
    icon: "⛏️",
    guideUrl: "https://www.wow-professions.com/guides/wow-mining-leveling-guide",
    pairedWith: "Blacksmithing / Engineering / JC",
    type: "gathering",
    tips: [
      "Pairs with Blacksmithing, Engineering, or Jewelcrafting",
      "Smelt ore into bars for extra skill points",
      "Prospecting by JC makes raw ore valuable",
    ],
  },
  {
    name: "Skinning",
    icon: "🔪",
    guideUrl: "https://www.wow-professions.com/guides/wow-skinning-leveling-guide",
    pairedWith: "Leatherworking",
    type: "gathering",
    tips: [
      "Pairs with Leatherworking",
      "Skin everything while questing — passive income",
      "Some rare skins only drop from specific mobs",
    ],
  },
  // Secondary
  {
    name: "Cooking",
    icon: "🍳",
    guideUrl: "https://www.wow-professions.com/guides/wow-cooking-leveling-guide",
    pairedWith: "Fishing",
    type: "secondary",
    tips: [
      "Feasts provide group buffs — essential for raids",
      "Spiced Biscuits → Hearty Food is the cheapest leveling path",
      "Vendor-bought materials keep costs low",
    ],
  },
  {
    name: "Fishing",
    icon: "🎣",
    guideUrl: "https://www.wow-professions.com/guides/wow-fishing-leveling-guide",
    pairedWith: "Cooking",
    type: "secondary",
    tips: [
      "Pairs with Cooking for feast materials",
      "Some fish are only available in specific zones",
      "Relaxing gold farm — fish sell well on AH early season",
    ],
  },
];

export function ProfessionGuides() {
  const [expanded, setExpanded] = useState(true);
  const crafting = PROFESSION_GUIDES.filter((p) => p.type === "crafting");
  const gathering = PROFESSION_GUIDES.filter((p) => p.type === "gathering");
  const secondary = PROFESSION_GUIDES.filter((p) => p.type === "secondary");

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-secondary/30 transition-colors text-left"
      >
        {expanded ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
        <BookOpen className="h-4 w-4 text-primary" />
        <span className="text-sm font-semibold flex-1">Midnight Profession Leveling Guides</span>
        <span className="text-xs text-muted-foreground">wow-professions.com</span>
      </button>

      {expanded && (
        <div className="px-4 pb-4 space-y-4 border-t border-border pt-3">
          <GuideSection title="Crafting" guides={crafting} />
          <GuideSection title="Gathering" guides={gathering} />
          <GuideSection title="Secondary" guides={secondary} />
        </div>
      )}
    </div>
  );
}

function GuideSection({ title, guides }: { title: string; guides: ProfessionGuide[] }) {
  return (
    <div>
      <h3 className="text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground mb-2">{title}</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
        {guides.map((guide) => (
          <GuideCard key={guide.name} guide={guide} />
        ))}
      </div>
    </div>
  );
}

function GuideCard({ guide }: { guide: ProfessionGuide }) {
  const [showTips, setShowTips] = useState(false);

  return (
    <div className="bg-secondary/30 border border-border rounded-lg p-3 space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg">{guide.icon}</span>
          <div>
            <h4 className="text-sm font-semibold">{guide.name}</h4>
            <p className="text-[10px] text-muted-foreground">Pairs with: {guide.pairedWith}</p>
          </div>
        </div>
        <a
          href={guide.guideUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 px-2 py-1 rounded bg-primary/10 text-primary text-[10px] font-medium hover:bg-primary/20 transition-colors"
        >
          Guide <ExternalLink className="h-2.5 w-2.5" />
        </a>
      </div>

      <button
        onClick={() => setShowTips(!showTips)}
        className="text-[10px] text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
      >
        {showTips ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
        Quick Tips
      </button>

      {showTips && (
        <ul className="space-y-0.5">
          {guide.tips.map((tip, i) => (
            <li key={i} className="flex gap-1.5 text-xs text-muted-foreground">
              <span className="text-primary/50 mt-0.5">•</span>
              <span>{tip}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
