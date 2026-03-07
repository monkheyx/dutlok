// WoW class colors (official Blizzard colors)
export const CLASS_COLORS: Record<string, string> = {
  Warrior: "#C79C6E",
  Paladin: "#F58CBA",
  Hunter: "#ABD473",
  Rogue: "#FFF569",
  Priest: "#FFFFFF",
  "Death Knight": "#C41F3B",
  Shaman: "#0070DE",
  Mage: "#69CCF0",
  Warlock: "#9482C9",
  Monk: "#00FF96",
  Druid: "#FF7D0A",
  "Demon Hunter": "#A330C9",
  Evoker: "#33937F",
};

// Tailwind class for WoW class text colors
export const CLASS_TEXT_COLORS: Record<string, string> = {
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

// Spec to role mapping
export const SPEC_ROLES: Record<string, Record<string, string>> = {
  Warrior: { Arms: "melee_dps", Fury: "melee_dps", Protection: "tank" },
  Paladin: { Holy: "healer", Protection: "tank", Retribution: "melee_dps" },
  Hunter: { "Beast Mastery": "ranged_dps", Marksmanship: "ranged_dps", Survival: "melee_dps" },
  Rogue: { Assassination: "melee_dps", Outlaw: "melee_dps", Subtlety: "melee_dps" },
  Priest: { Discipline: "healer", Holy: "healer", Shadow: "ranged_dps" },
  "Death Knight": { Blood: "tank", Frost: "melee_dps", Unholy: "melee_dps" },
  Shaman: { Elemental: "ranged_dps", Enhancement: "melee_dps", Restoration: "healer" },
  Mage: { Arcane: "ranged_dps", Fire: "ranged_dps", Frost: "ranged_dps" },
  Warlock: { Affliction: "ranged_dps", Demonology: "ranged_dps", Destruction: "ranged_dps" },
  Monk: { Brewmaster: "tank", Mistweaver: "healer", Windwalker: "melee_dps" },
  Druid: { Balance: "ranged_dps", Feral: "melee_dps", Guardian: "tank", Restoration: "healer" },
  "Demon Hunter": { Havoc: "melee_dps", Vengeance: "tank" },
  Evoker: { Devastation: "ranged_dps", Preservation: "healer", Augmentation: "ranged_dps" },
};

export const ROLE_LABELS: Record<string, string> = {
  tank: "Tank",
  healer: "Healer",
  melee_dps: "Melee DPS",
  ranged_dps: "Ranged DPS",
};

export const ROLE_ICONS: Record<string, string> = {
  tank: "Shield",
  healer: "Heart",
  melee_dps: "Sword",
  ranged_dps: "Crosshair",
};

// Armor types by class
export const CLASS_ARMOR: Record<string, string> = {
  Warrior: "Plate",
  Paladin: "Plate",
  "Death Knight": "Plate",
  Hunter: "Mail",
  Shaman: "Mail",
  Evoker: "Mail",
  Rogue: "Leather",
  Monk: "Leather",
  Druid: "Leather",
  "Demon Hunter": "Leather",
  Mage: "Cloth",
  Warlock: "Cloth",
  Priest: "Cloth",
};

export function inferRole(className: string | null, spec: string | null): string | null {
  if (!className || !spec) return null;
  return SPEC_ROLES[className]?.[spec] ?? null;
}

export function getRoleLabel(role: string | null): string {
  if (!role) return "Unknown";
  return ROLE_LABELS[role] ?? role;
}
