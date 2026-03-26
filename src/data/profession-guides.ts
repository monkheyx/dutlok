// ═══════════════════════════════════════════════════════════════════════════
// MIDNIGHT PROFESSION LEVELING GUIDES
// Source: wow-professions.com — adapted for DUTLOK guild reference
// ═══════════════════════════════════════════════════════════════════════════

export interface LevelingStep {
  range: string; // "1-7", "7-20", "50-100"
  recipe: string;
  quantity?: string; // "6x", "~30x"
  materials?: string;
  note?: string;
}

export interface ProfessionGuide {
  name: string;
  icon: string;
  type: "crafting" | "gathering" | "secondary";
  pairedWith: string;
  trainer: string;
  trainerLocation: string;
  shoppingList?: string[];
  steps: LevelingStep[];
  tips: string[];
}

export const PROFESSION_GUIDES: ProfessionGuide[] = [
  // ── CRAFTING ──
  {
    name: "Alchemy",
    icon: "⚗️",
    type: "crafting",
    pairedWith: "Herbalism",
    trainer: "Camberon",
    trainerLocation: "Silvermoon City",
    shoppingList: [
      "300x Tranquility Bloom",
      "15x Sanguithorn",
      "12x Mote of Light",
      "4x Argentleaf",
      "4x Mote of Primal Energy",
      "3x Mana Lily",
      "Sunglass Vials & Oil of Heartwood (vendor)",
    ],
    steps: [
      { range: "1-7", recipe: "Silvermoon Health Potion", quantity: "6x", materials: "36x Tranquility Bloom, 30x Sunglass Vial" },
      { range: "7-20", recipe: "Recycle Potions", quantity: "10x", note: "Recycle your Silvermoon Health Potions (requires Oil of Heartwood)" },
      { range: "20", recipe: "Research at Camberon's Cauldron", note: "Discover Primal Philosopher's Stone and Lightfused Mana Potion" },
      { range: "20-27", recipe: "First Craft Bonuses", note: "1x each: Refreshing Serum, Lightfused Mana Potion, Primal Philosopher's Stone, Transmute: Mote of Wild Magic, Composite Flora, Enlightenment Tonic, Entropic Extract" },
      { range: "27-32", recipe: "Entropic Extract", quantity: "8x", materials: "24x Tranquility Bloom, 40x Sunglass Vial" },
      { range: "32-50", recipe: "Silvermoon Health Potion", quantity: "30x", materials: "180x Tranquility Bloom, 150x Sunglass Vial" },
      { range: "50-100", recipe: "Light's Potential / Flasks / Transmutes", quantity: "~80x", note: "Choose path: ~80x Light's Potential (potions), ~45x Flasks, or Transmutes (School of Gems, Bouquet of Herbs)" },
    ],
    tips: [
      "Pair with Herbalism to farm all herbs yourself",
      "Goblin characters gain +5 skill bonus; Kul Tirans gain +2",
      "Primal Philosopher's Stone is REQUIRED before transmutes",
      "Unlock first specialization at skill 25",
      "Flasks and potions are always in demand for raids and M+",
    ],
  },
  {
    name: "Blacksmithing",
    icon: "⚒️",
    type: "crafting",
    pairedWith: "Mining",
    trainer: "Bemarrin",
    trainerLocation: "Silvermoon City",
    shoppingList: [
      "125x Refulgent Copper Ore",
      "100x Refulgent Copper Ingots (or 500x more ore)",
      "300x Brilliant Silver Ore",
      "150x Refulgent Copper Ingots (for alloys)",
      "200x Luminant Flux (vendor)",
      "6x Brilliant Silver Ore (first crafts)",
      "6x Umbral Tin Ore",
      "1x Duskshrouded Stone",
    ],
    steps: [
      { range: "1-15", recipe: "Refulgent Copper Ingots", quantity: "25x", materials: "125x Refulgent Copper Ore", note: "Smelt all ore now" },
      { range: "15-50", recipe: "First Craft Bonuses", note: "Filter profession window for first-craft recipes. Craft each one — should reach ~47-50. Equip crafted Toolbox and Hammer" },
      { range: "50-70", recipe: "Sterling Alloys", quantity: "50x", materials: "300x Brilliant Silver Ore, 150x Refulgent Copper Ingots, 200x Luminant Flux" },
      { range: "70-100", recipe: "Sun-Blessed Gear / Epic Equipment / Crafting Orders", note: "Rare gear: 5x Sterling Alloy + components per craft (1 point each). Epic: 150 Moxie per recipe (3 points each). Orders: 3 points per completion" },
    ],
    tips: [
      "Pair with Mining to farm your own ore",
      "First-craft bonuses are the fastest way through mid-levels",
      "Equip crafted profession tools as you make them",
      "Epic recipes require time-gated Fused Vitality materials",
    ],
  },
  {
    name: "Enchanting",
    icon: "✨",
    type: "crafting",
    pairedWith: "Any profession",
    trainer: "Dolothos",
    trainerLocation: "Silvermoon City",
    shoppingList: [
      "~300x Eversinging Dust",
      "30x Copper Rods",
      "~20x Shards",
      "Enchanting Vellum (vendor)",
      "Motes (Light, Wild Magic, Primal Energy, Pure Void)",
    ],
    steps: [
      { range: "1-25", recipe: "Runed Refulgent Copper Rods + Disenchant", quantity: "30x", materials: "~150x Eversinging Dust, 30x Copper Rods", note: "Craft rods, then disenchant them for materials back" },
      { range: "25-38", recipe: "Ring/Helm Enchants", note: "1x Enchant Ring - Nature's Wrath, 1x Illusory Adornment - Blooming Light, then ~13 more of cheapest" },
      { range: "38-52", recipe: "Thalassian Spellweaver's Wand + First Crafts", quantity: "4x wands", materials: "60x Dust, 12x Shards" },
      { range: "52-55", recipe: "First Craft Bonuses", note: "Ring/shoulder enchant first crafts + Gleeful Glamours (24 recipes from Jennara Sunglow in Silvermoon tower)" },
      { range: "55-62", recipe: "Enchant Ring - Amani Mastery", quantity: "~9x", materials: "45x Eversinging Dust", note: "Yellow recipes — may need extra crafts" },
      { range: "62-100", recipe: "Weapon/Ring/Chest Enchants", note: "Enchant Weapon - Worldsoul Aegis stays orange to 100. Mix based on material costs" },
    ],
    tips: [
      "No gathering profession needed — pairs with anything",
      "Blood Elves gain +5 skill bonus",
      "Disenchant gear instead of vendoring for free materials",
      "Use Enchanting Vellum to sell enchants on the AH",
      "Weapon enchants are the most profitable",
    ],
  },
  {
    name: "Engineering",
    icon: "⚙️",
    type: "crafting",
    pairedWith: "Mining",
    trainer: "Danwe",
    trainerLocation: "Silvermoon City",
    shoppingList: [
      "135x Powder Pigment / Refulgent Copper Ingot / Bright Linen Bolt",
      "145x Refulgent Copper Ore",
      "155x Umbral Tin Ore",
      "21x Malleable Wireframe (vendor)",
      "35x Pile of Junk (vendor)",
      "Motes (1x each type)",
    ],
    steps: [
      { range: "1-16", recipe: "Song Gears + Recycling", quantity: "8x gears + 7x recycles", materials: "Ores + wireframes + base materials" },
      { range: "16-25", recipe: "First Craft Bonuses", note: "Evercore Shade, Vision Guard, Dome Dinger, Zoomshroud, Reconaissance" },
      { range: "25-39", recipe: "Soul Sprockets + Cogwheel First Crafts", quantity: "10x sprockets", note: "PUT 10 POINTS INTO RECYCLING first to unlock discovery" },
      { range: "39-45", recipe: "Recycle + First Crafts", quantity: "20x recycles", note: "Use first-craft filter and craft every eligible recipe" },
      { range: "45-80", recipe: "Quel'dorei Recipes (discovered)", quantity: "~60x", note: "Cheapest option — discover via Recycling system. Quel'dorei Guards etc." },
      { range: "80-100", recipe: "Housing Decor / Rare Equipment / Orders", note: "7 discovered housing recipes (yellow to 92). Or rare profession tools. Or epic crafting orders" },
    ],
    tips: [
      "Engineering works differently — cheapest recipes come from Recycling discovery",
      "MUST put 10 points into Recycling specialization first",
      "First Craft bonuses are essential at every tier",
      "Battle rezzes and AH access are clutch utility for raiders",
    ],
  },
  {
    name: "Inscription",
    icon: "📜",
    type: "crafting",
    pairedWith: "Herbalism",
    trainer: "Zantasia",
    trainerLocation: "Silvermoon City",
    shoppingList: [
      "360x Tranquility Bloom",
      "100x Argentleaf",
      "90x Mana Lily",
      "90x Sanguithorn",
      "65x Azeroot",
      "1x Duskshrouded Stone",
      "7x Mote of Wild Magic",
      "4x each: Mote of Primal Energy, Mote of Pure Void",
      "1x Mote of Light",
      "Thalassian Songwater + Lexicologist's Vellum (vendor)",
    ],
    steps: [
      { range: "1-20", recipe: "Mill Herbs", note: "Mill all herbs using Midnight Milling spell. 360x Tranquility Bloom, 100x Argentleaf, 90x Mana Lily, 90x Sanguithorn" },
      { range: "20-30", recipe: "Munsell Ink + Sienna Ink", quantity: "11x + 12x", note: "Buy Thalassian Songwater from vendor" },
      { range: "25", recipe: "LEARN CALM HANDS SPECIALIZATION", note: "Unlock specialization — pick Calm Hands first for Treatise recipe" },
      { range: "30-42", recipe: "First Craft Bonuses", note: "Faunatender's Baton, Floratender's Crutch, Rootwarden's Lamp, Soul Cipher, Codified Azeroot, Missives, Hobbyist tools" },
      { range: "42-50", recipe: "Thalassian Treatise on Inscription", quantity: "~6x", materials: "Lexicologist's Vellum, Motes, Inks" },
      { range: "50-100", recipe: "Treatises", quantity: "~70x total", note: "Both Inscription and other profession Treatises give points to 100. Warbound — can mail to alts" },
    ],
    tips: [
      "Pair with Herbalism for pigments",
      "Learn Calm Hands specialization FIRST at skill 25",
      "Treatises are Warbound — make extras to mail to alts",
      "Darkmoon cards and Vantus runes sell well early in tiers",
    ],
  },
  {
    name: "Jewelcrafting",
    icon: "💎",
    type: "crafting",
    pairedWith: "Mining",
    trainer: "Amin",
    trainerLocation: "Silvermoon City",
    shoppingList: [
      "60x cheap ore (Refulgent Copper, Umbral Tin, or Brilliant Silver)",
      "31x Glimmering Gemdust",
      "100x Crystalline Glass",
      "7x Duskshrouded Stone",
      "5x Sanguine Garnet",
      "4x each: Tenebrous Amethyst, Harandar Peridot, Amani Lapis",
    ],
    steps: [
      { range: "1-14", recipe: "Prospect Ore + Sin'dorei Lens", quantity: "4x lenses", note: "Prospect 60 cheap ore, then craft lenses from gemdust and glass" },
      { range: "14-50", recipe: "First Craft Bonuses", note: "Filter for first-craft recipes — keep both profession and trainer windows open. Visit trainer at each threshold" },
      { range: "50-65", recipe: "Monologuer's Chalice", quantity: "40x", materials: "Crystalline Glass", note: "Craft until recipes turn grey" },
      { range: "65-100", recipe: "Cut Diamonds / Profession Equipment / Jewelry Orders", note: "Cut Eversong Diamonds (2 pts each, orange to 80). Rare equipment from Gelanthis. Epic rings/necklaces with Sparks stay orange to 100" },
    ],
    tips: [
      "Mining pairs excellently — prospect raw ore for gems",
      "Gems are always needed, especially early season",
      "Specializations unlock at skill 25",
      "Fill crafting orders to offset material costs",
    ],
  },
  {
    name: "Leatherworking",
    icon: "🐾",
    type: "crafting",
    pairedWith: "Skinning",
    trainer: "Talmar",
    trainerLocation: "Silvermoon City",
    shoppingList: [
      "690x Void-Tempered Leather",
      "610x Void-Tempered Scales",
      "3x Void-Tempered Hide",
      "2x Void-Tempered Plating",
      "4x Peerless Plumage, 3x Carving Canine, 4x Fantastic Fur",
      "10x Tranquility Bloom",
      "4x Mote of Light, 1x Mote of Pure Void",
      "75x Silverleaf Thread (vendor)",
    ],
    steps: [
      { range: "1-7", recipe: "Smuggler's Wristbands + Scout's Bracers", note: "First craft bonuses on each" },
      { range: "7-60", recipe: "First Craft Bonuses (all available)", note: "Visit trainer every 5-10 skill points. Use first-craft filter. Equip Hideworker's Cover. Unlock spec at 25" },
      { range: "60-91", recipe: "Choose a path", quantity: "~35x", note: "Blessed Pango Charm (70x Duskshrouded Stone, 35x Hide), Blood Knight's Armor Kit, Forest Hunter's Kit, or Devouring Banding" },
      { range: "91-100", recipe: "Continue above or Epic Armor", note: "Epic armor grants 3 skill points per craft — only 3 crafts needed to finish" },
    ],
    tips: [
      "Pair with Skinning to farm your own leather and scales",
      "Without Skinning you'll need significant gold",
      "Leg armor kits have consistent demand",
      "Patron Orders are NPC-generated epic requests — check regularly",
    ],
  },
  {
    name: "Tailoring",
    icon: "🧵",
    type: "crafting",
    pairedWith: "Enchanting",
    trainer: "Galana",
    trainerLocation: "Silvermoon City",
    shoppingList: [
      "66x Bright Linen",
      "14x Eversinging Dust",
      "Silverleaf Thread + Embroidery Floss (vendor)",
    ],
    steps: [
      { range: "1-25", recipe: "Bright Linen Bolts", quantity: "66x", note: "Craft all 66 even after they go grey at ~20 — you need them later" },
      { range: "25-40", recipe: "Imbued Bright Linen Bolts", quantity: "14x", materials: "28x Bright Linen Bolts. Unlock spec at 25" },
      { range: "40-45", recipe: "First Craft Bonuses", note: "Equip the Bright Linen Tailoring Robe you craft" },
      { range: "45-50", recipe: "Courtly Shoulders", quantity: "~6x", materials: "12x Bright Linen Bolts" },
      { range: "50-65", recipe: "Bright Linen Spelthreads", quantity: "30x" },
      { range: "65-90", recipe: "Sunfire Silk / Arcanoweave Linings", quantity: "~28x" },
      { range: "90-100", recipe: "Elegant Artisan recipes", quantity: "~13x", note: "150 Artisan Tailor's Moxie each. Or daily cooldowns + Patron Orders for slow method" },
    ],
    tips: [
      "No gathering profession required — cloth drops from humanoids",
      "Pairs well with Enchanting to DE unsold gear",
      "Spellthread leg enchants always in demand",
      "Slow method: invest 5 Knowledge in Nimble Needlework for bolt cooldowns",
    ],
  },

  // ── GATHERING ──
  {
    name: "Herbalism",
    icon: "🌿",
    type: "gathering",
    pairedWith: "Alchemy / Inscription",
    trainer: "Herb trainer",
    trainerLocation: "Silvermoon City",
    steps: [
      { range: "1-30", recipe: "Gather any herbs", note: "All base herbs give skill. Tranquility Bloom stops at 30" },
      { range: "30-60", recipe: "Sanguithorn, Azeroot, Argentleaf, Mana Lily", note: "Base herbs turn yellow. Lush variants also help" },
      { range: "60-100", recipe: "Lush and Infused variants only", note: "Base herbs become grey. Only Lush and Infused give skill now" },
    ],
    tips: [
      "Eversong Woods is the easiest farming loop for beginners",
      "Deftness = faster gathering, Finesse = extra materials, Perception = extra Nocturnal Lotus",
      "Infused herb Overloading has a 12hr cooldown, reduced by 30 min per herb gathered (~24 to reset)",
      "Voidstorm has the densest nodes but heaviest mob density",
    ],
  },
  {
    name: "Mining",
    icon: "⛏️",
    type: "gathering",
    pairedWith: "Blacksmithing / Engineering / JC",
    trainer: "Mining trainer",
    trainerLocation: "Silvermoon City",
    steps: [
      { range: "1-30", recipe: "Mine any deposits", note: "Everything gives skill points — you'll hit 30 fast" },
      { range: "30-60", recipe: "Rich deposits and Seams", note: "Base deposits turn yellow then grey. Rich and Seams still work" },
      { range: "60-100", recipe: "Rich deposits, Seams, Infused variants", note: "Only these give skill points now" },
    ],
    tips: [
      "Eversong Woods has the easiest route with low mob density",
      "Smelt ore into bars for extra skill points",
      "Harandar is the most annoying zone — lots of mobs and vertical terrain",
      "High Deftness recommended for Zul'Aman infused deposits",
    ],
  },
  {
    name: "Skinning",
    icon: "🔪",
    type: "gathering",
    pairedWith: "Leatherworking",
    trainer: "Tyn",
    trainerLocation: "Silvermoon City",
    steps: [
      { range: "1-100", recipe: "Skin everything", note: "Void-Tempered Leather from standard mobs, Scales from dragonkin/reptiles, rare drops from species" },
    ],
    tips: [
      "High-Value Beasts show a knife icon on minimap — yield 5-10 extra mats",
      "Void-Tempered Leather: loop farm in Harandar",
      "Void-Tempered Scales: Eversong Woods (Agitated Wyrms, Territorial Dragonhawks)",
      "Reagents now only Silver and Gold quality — Bronze is gone",
      "Week 1: collect ~56 Knowledge Points from books, treasures, and trainer quests",
    ],
  },

  // ── SECONDARY ──
  {
    name: "Cooking",
    icon: "🍳",
    type: "secondary",
    pairedWith: "Fishing",
    trainer: "Sylann",
    trainerLocation: "Silvermoon City (inn)",
    shoppingList: [
      "Butter and Spices (vendor only — DO NOT buy from AH)",
      "Plant Protein (AH or farm)",
      "Vegetables, Essence (vendor)",
    ],
    steps: [
      { range: "1-25", recipe: "Spiced Biscuits", quantity: "50x", note: "ALL vendor materials — butter and spices from Cooking supply vendor" },
      { range: "25-35", recipe: "Felberry Figs", quantity: "10x", materials: "Plant Protein (AH), vegetables, butter, essence (vendor)" },
      { range: "35-100", recipe: "Hearty Food loop", note: "Craft 100x Spiced Biscuits → convert with Hearty Food recipe → repeat. Green for last 25 points but very cheap" },
    ],
    tips: [
      "Feasts provide group buffs — essential for raids",
      "Spiced Biscuits → Hearty Food is the cheapest leveling path",
      "DO NOT buy butter/spices from AH — vendor only",
      "Best feasts: Blooming Feast, Quel'dorei Medley, Silvermoon Parade (+98 Stam + secondary)",
    ],
  },
  {
    name: "Fishing",
    icon: "🎣",
    type: "secondary",
    pairedWith: "Cooking",
    trainer: "Drathen",
    trainerLocation: "Silvermoon City",
    steps: [
      { range: "1-75", recipe: "Fish in Eversong Woods / Silvermoon", note: "Lynxfish, Sin'dorei Swarmer, Arcane Wyrmfish" },
      { range: "75-150", recipe: "Continue Eversong Woods", note: "Restored Songfish, pool fishing" },
      { range: "150-225", recipe: "Zul'Aman", note: "Gore Guppy, Root Crab, Lucky Loa (rare)" },
      { range: "225-300", recipe: "Harandar", note: "Shimmer Spinefish, Bloomtail Minnow, Tender Lumifin" },
    ],
    tips: [
      "Don't switch zones too early — you'll get grey trash",
      "Install Better Fishing addon for semi-AFK leveling",
      "Takes ~3-4 hours to reach 300",
      "Voidstorm fish: Null Voidfish, Ominous Octopus, Warping Wise (teleport fish)",
    ],
  },
];
