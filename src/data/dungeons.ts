// ═══════════════════════════════════════════════════════════════════════════
// MYTHIC+ DUNGEON DATA — Midnight Season 1
// ═══════════════════════════════════════════════════════════════════════════

export interface DungeonBoss {
  name: string;
  mechanics: string[]; // short bullet points
  tankTip?: string;
  healerTip?: string;
  dpsTip?: string;
}

export interface Dungeon {
  slug: string;
  name: string;
  shortName: string;
  timer: number; // minutes
  bossCount: number;
  bosses: DungeonBoss[];
  trashTips: string[];
  keyTips: string[];
  isNew: boolean; // true = Midnight dungeon, false = legacy
  expansion?: string; // for legacy dungeons
}

export const DUNGEONS: Dungeon[] = [
  // ── New Midnight Dungeons ──
  {
    slug: "magisters-terrace",
    name: "Magisters' Terrace",
    shortName: "MT",
    timer: 33,
    bossCount: 4,
    isNew: true,
    bosses: [
      {
        name: "Arcanotron Custos",
        mechanics: [
          "**Arcane Expulsion** — AoE knockback + drops a puddle under the boss lasting 2 min. Drop along edges or overlap existing puddles",
          "At **0 energy**, casts **Refueling Protocol** — spawns soak circles that must be split by players",
          "Constant repositioning required as puddles accumulate",
        ],
        tankTip: "Reposition boss to drop puddles along room edges",
        healerTip: "Spike damage during Arcane Expulsion — have a CD ready",
        dpsTip: "Burn hard between Expulsion casts for max uptime",
      },
      {
        name: "Seranel Sunlash",
        mechanics: [
          "**Runic Mark** — debuffs players who must enter suppression zones to clear it",
          "**Hastening Ward** — buff on boss that should be purged immediately or mitigated with tank defensives",
          "Move to suppression zones quickly to avoid ticking damage",
        ],
        tankTip: "Use defensive if Hastening Ward can't be purged",
        healerTip: "Dispel/purge Hastening Ward if possible",
      },
      {
        name: "Gemellus",
        mechanics: [
          "**Triplicate** — at pull and 50% HP, boss splits into clones. Cleave all 3 to damage the real boss",
          "**Neural Link** — debuff requires matching with clones to remove shields",
          "All clones share the same abilities — dodge identically for each",
        ],
        dpsTip: "Cleave is king — save AoE CDs for clone phases",
      },
      {
        name: "Degentrius",
        mechanics: [
          "**Void Torrent** — beam splits the arena; players must position on both sides for **Unstable Void Essence** soaks",
          "Below **30%** — Unstable Void Essence bounces faster, arena fills with **Hulking Fragment** puddles",
          "Applies a magic DoT — dispel and position away from group",
        ],
        tankTip: "Position for beam split — keep boss centered",
        healerTip: "Sub-30% is a healing check — rotate CDs",
        dpsTip: "Save lust for sub-30% burn phase",
      },
    ],
    trashTips: [
      "Many caster mobs require interrupts — set up a kick rotation",
      "Puddles from Arcane Expulsion persist — plan boss positioning early",
      "Timer punishes wipes more than slow pulls — play safe on trash",
    ],
    keyTips: [
      "33-minute timer — one of the longer dungeons",
      "Boss mechanics are the challenge, not trash density",
      "Push keys at +10 once your group has boss mechanics memorized",
    ],
  },
  {
    slug: "maisara-caverns",
    name: "Maisara Caverns",
    shortName: "MC",
    timer: 33,
    bossCount: 3,
    isNew: true,
    bosses: [
      {
        name: "Muro'jin & Nekraxx",
        mechanics: [
          "Split damage evenly between both bosses — if one dies, the other gains **Bestial Wrath** stacks",
          "**Freezing Trap** — avoid unless targeted by Carrion Swoop (stepping in stuns Nekraxx)",
          "**Barrage** — stand still if targeted so others can dodge the frontal",
          "**Flanking Spear** — tank needs a defensive for the hit + bleed",
        ],
        tankTip: "Defensive for Flanking Spear — cleanse the bleed if possible",
        healerTip: "Dispel Infected Pinions (disease) quickly",
        dpsTip: "Balance damage between both bosses evenly",
      },
      {
        name: "Vordaza",
        mechanics: [
          "**Wrest Phantoms** — spawns phantom adds that collide and explode. Stagger detonations — wait for DoT to expire before triggering second pair",
          "**Necrotic Convergence** — shield that must be broken with burst damage + interrupt",
          "**Unmake** — frontal sweep, dodge it",
        ],
        tankTip: "Use defensive for Drain Soul channel",
        healerTip: "Withering Miasma is constant passive damage — pace your mana",
      },
      {
        name: "Rak'tul, Vessel of Souls",
        mechanics: [
          "**Spiritbreaker** — tank moves away, drops puddle, causes knockback. Use braziers to mitigate",
          "**Crush Souls** — targets 3 players, spawns totems channeling Soulbind pulls. Kill totems fast",
          "**Soulrending Roar** — sends players to a bridge gauntlet. Avoid Lost Souls (root), CC Malignant Souls for Spectral Residue buff",
        ],
        tankTip: "Position near braziers for Spiritbreaker mitigation",
        dpsTip: "Kill totems from Crush Souls immediately — they pull players into danger",
      },
    ],
    trashTips: [
      "**Dread Souleater** — CC-immune healer mob; manage Necrotic Wave healing absorb",
      "**Hex Guardian** — CC-immune with constant AoE pulse; coordinate CDs for Magma Surge",
      "Interrupt Shrink (Umbral Shadowbinder), Hex (Ritual Hexxer), Spirit Rend (Tormented Shade)",
      "Cleanse Magic debuffs from Ritual Firebrand and Hex casts",
    ],
    keyTips: [
      "High trash damage — bring strong AoE healing",
      "Bridge gauntlet on last boss is a common wipe point — practice the route",
      "Disease dispels are very valuable in this dungeon",
    ],
  },
  {
    slug: "nexus-point-xenas",
    name: "Nexus-Point Xenas",
    shortName: "NPX",
    timer: 30,
    bossCount: 3,
    isNew: true,
    bosses: [
      {
        name: "Chief Corewright Kasreth",
        mechanics: [
          "**Leyline Array** — avoid beams unless you have **Reflux Charge** debuff, then stand at intersections to disable beams",
          "**Flux Collapse** — bait puddles toward room edges; knockback + healing absorb",
          "**Arcane Zap** — replaces melee swings with arcane damage on tank",
        ],
        tankTip: "Arcane Zap deals magic damage — use magic DR, not physical",
        healerTip: "Heal through Flux Collapse absorb shields quickly",
      },
      {
        name: "Corewarden Nysarra",
        mechanics: [
          "**Null Vanguard** — spawns Dreadflail + 2 Grand Nullifiers. Interrupt ALL Nullify casts or they empower",
          "**Lightscar Flare** — stand in the resulting light frontal for **300% damage amp** window. Kill adds before channel ends",
          "**Eclipsing Step** — targets 2 players with cleave; avoid hitting allies, use defensives",
        ],
        tankTip: "Position Dreadflail away from group during Null Vanguard",
        dpsTip: "Stack in Lightscar Flare for 300% damage amp — your biggest burn window",
      },
      {
        name: "Lothraxion",
        mechanics: [
          "**Brilliant Dispersion** — targets 3 players, each spawns 2 Fractured Images. Spread to avoid cleaving allies",
          "**Divine Guile** — at full energy, boss disguises among images. Interrupt the one **WITHOUT** light horns to return to boss phase",
          "**Searing Rend** — tank puddles that persist the entire fight. Drop away from group",
        ],
        tankTip: "Drop Searing Rend puddles at edges — they never despawn",
        healerTip: "Dispel Burning Radiance (magic) on 2 targets from Lightwrought trash",
        dpsTip: "During Divine Guile — quickly identify the fake (no horns) and interrupt it",
      },
    ],
    trashTips: [
      "**Flux Engineer** — drops Mana Battery on death, swap to it immediately",
      "**Reformed Voidling** — turns into Smudge trying to awaken Dreadflail. CC and cleave down fast",
      "**Grand Nullifier** — must interrupt every Nullify cast",
      "Dungeon has 3 wings (West/East/North) — kill both wing bosses to unlock Lothraxion",
    ],
    keyTips: [
      "Three-wing layout with conduits back to start between wings",
      "Nysarra's Lightscar Flare is a massive DPS window — coordinate burst CDs",
      "Lothraxion's puddles never despawn — fight gets harder the longer it goes",
    ],
  },
  {
    slug: "windrunner-spire",
    name: "Windrunner Spire",
    shortName: "WS",
    timer: 30,
    bossCount: 4,
    isNew: true,
    bosses: [
      {
        name: "Emberdawn",
        mechanics: [
          "**Flaming Updraft** — targeted players bait tornadoes to the absolute edge of the room",
          "**Burning Gale** intermission at 100 energy — boss pulls all players toward him, rotates, and breathes fire",
          "**Searing Beak** — tank ability requiring defensive for both the hit and the DoT",
        ],
        tankTip: "Defensive for Searing Beak — both hit and DoT are dangerous",
        healerTip: "Heavy party damage during Burning Gale intermission",
      },
      {
        name: "Derelict Duo (Kalis & Latch)",
        mechanics: [
          "Cleave bosses evenly — remaining boss gains **Broken Bond** stacks when partner dies",
          "Interrupt **Shadow Bolt** from Kalis and dispel **Curse of Darkness** consistently",
          "Run behind Latch during **Debilitating Shriek** to prevent group damage",
        ],
        healerTip: "Curse dispels are critical — Curse of Darkness hits hard",
        dpsTip: "Balance damage between both targets — don't tunnel one",
      },
      {
        name: "Commander Kroluk",
        mechanics: [
          "**Reckless Leap** — targets furthest player twice. Use defensives and positioning",
          "Spawns adds at **66%** and **33%** HP requiring interrupt rotation",
          "**Bladestorm** — fixate mechanic. Kite it while group handles adds",
        ],
        tankTip: "Pick up adds quickly when they spawn at 66% and 33%",
        dpsTip: "Kite Bladestorm — don't try to face-tank it",
      },
      {
        name: "The Restless Heart",
        mechanics: [
          "**Squall Leap** — stacking DoT with no timer. Remove stacks by standing on **Turbulent Arrows** from rain attacks",
          "Use arrows to avoid **Bullseye Windblast** — coordinate group positioning",
          "Most mechanically demanding boss in the dungeon — execution is everything",
        ],
        tankTip: "Manage Tempest Slash knockback by positioning against arrows",
        healerTip: "Squall Leap stacks ramp fast — ensure team clears them on arrows",
      },
    ],
    trashTips: [
      "Brisk dungeon with moderate trash density",
      "Several trash packs have dangerous frontals — position carefully",
      "Interrupt priority casts to avoid unnecessary damage",
    ],
    keyTips: [
      "~30 minute timer — fast-paced dungeon",
      "Restless Heart is the wall boss — practice arrow mechanics",
      "Emberdawn tornado placement can make or break the fight",
    ],
  },

  // ── Legacy Dungeons ──
  {
    slug: "pit-of-saron",
    name: "Pit of Saron",
    shortName: "PoS",
    timer: 30,
    bossCount: 3,
    isNew: false,
    expansion: "Wrath of the Lich King",
    bosses: [
      {
        name: "Forgemaster Garfrost",
        mechanics: [
          "Throws boulders that create LoS pillars — use them to drop **Permafrost** stacks",
          "At energy thresholds, picks up new weapons changing his attack pattern",
          "Increasing frost damage without LoSing — manage stacks or die",
        ],
      },
      {
        name: "Ick & Krick",
        mechanics: [
          "**Pursuit** — Ick chases a random player. Run away or die",
          "**Poison Nova** — get out of melee range immediately",
          "**Explosive Barrage** — mines across the floor. Dodge them",
        ],
      },
      {
        name: "Scourgelord Tyrannus",
        mechanics: [
          "**Overlord's Brand** — if on tank, DPS stop attacking. If on DPS, tank stops",
          "**Unholy Power** — boss enrages, kite away",
          "**Icy Blast** — dodge the ground circles",
        ],
      },
    ],
    trashTips: [
      "Gauntlet section before Tyrannus — falling ice rocks deal massive damage",
      "Stay mobile during the gauntlet, don't stop moving",
      "Freed slaves can be interacted with for minor buffs",
    ],
    keyTips: [
      "Overlord's Brand is the #1 wipe mechanic — call it out",
      "Garfrost Permafrost stacks are deadly — LoS behind boulders at 8-10 stacks",
      "Classic dungeon with simple but punishing mechanics",
    ],
  },
  {
    slug: "seat-of-the-triumvirate",
    name: "Seat of the Triumvirate",
    shortName: "SotT",
    timer: 30,
    bossCount: 4,
    isNew: false,
    expansion: "Legion",
    bosses: [
      {
        name: "Zuraal the Ascended",
        mechanics: [
          "**Void Realm** — some players get sent to shadow realm to kill adds",
          "**Coalescing Void** — soak or it empowers the boss",
          "Manage transitions between realms smoothly",
        ],
      },
      {
        name: "Saprish",
        mechanics: [
          "Summons hunter pets that must be managed alongside the boss",
          "**Void Trap** — CC traps on the ground. Don't step in them",
          "**Shadow Ambush** — dodge the leap attack",
        ],
      },
      {
        name: "Viceroy Nezhar",
        mechanics: [
          "**Tentacle** adds that cast and must be interrupted or killed",
          "**Eternal Twilight** — massive AoE at full energy, burn boss or use defensives",
          "**Howling Dark** — move out of the void zones",
        ],
      },
      {
        name: "L'ura",
        mechanics: [
          "**Void Collapse** — massive damage if not soaked properly",
          "**Darkened Remnant** — add spawns that fixate players",
          "Increasing raid damage over time — burn before it overwhelms",
        ],
      },
    ],
    trashTips: [
      "Void-themed mobs with lots of interruptible casts",
      "Several mobs apply shadow DoTs — dispel priority",
      "Watch for patrols in narrow corridors",
    ],
    keyTips: [
      "Shadow realm mechanics can disorient new players — call transitions",
      "L'ura's void collapse must be soaked or it snowballs",
      "Legion dungeon — familiar to veterans but tuned for M+ difficulty",
    ],
  },
  {
    slug: "skyreach",
    name: "Skyreach",
    shortName: "SR",
    timer: 25,
    bossCount: 4,
    isNew: false,
    expansion: "Warlords of Draenor",
    bosses: [
      {
        name: "Ranjit",
        mechanics: [
          "**Four Winds** — rotating wind walls. Find the safe gap and stand in it",
          "**Fan of Blades** — frontal cone, dodge it",
          "**Windwall** — persistent wind barriers that push players",
        ],
      },
      {
        name: "Araknath",
        mechanics: [
          "**Energize** — solar energy beams connect to boss. Block them by standing in them",
          "If beams reach the boss, it heals significantly",
          "Burn the boss between beam phases",
        ],
      },
      {
        name: "Rukhran",
        mechanics: [
          "**Summon Solar Flare** — add that fixates and explodes. Kill or kite away",
          "**Piercing Rush** — charges a player. Dodge or use defensive",
          "**Quills** — AoE damage to the group",
        ],
      },
      {
        name: "High Sage Viryx",
        mechanics: [
          "**Lens Flare** — rotating beam of light. Stay behind it",
          "**Cast Down** — throws a player off the platform. Others must catch them in the solar zone",
          "**Shield of Light** — interrupt or purge the absorb shield",
        ],
      },
    ],
    trashTips: [
      "Wind mechanics throughout the dungeon — be aware of pushback",
      "Solar constructs can be dangerous if not interrupted",
      "Relatively straightforward trash but tight corridors",
    ],
    keyTips: [
      "25-minute timer — shortest dungeon in the rotation",
      "Cast Down on Viryx kills if nobody catches the thrown player",
      "Araknath beam soaking is critical — assign players",
    ],
  },
  {
    slug: "algethar-academy",
    name: "Algeth'ar Academy",
    shortName: "AA",
    timer: 32,
    bossCount: 4,
    isNew: false,
    expansion: "Dragonflight",
    bosses: [
      {
        name: "Vexamus",
        mechanics: [
          "**Arcane Orbs** — soak them before they reach the boss or he gains stacks",
          "**Arcane Fissure** — ground circles to dodge",
          "Simple boss but soaking discipline is essential",
        ],
      },
      {
        name: "Overgrown Ancient",
        mechanics: [
          "**Germinate** — marks players who spawn adds where they stand. Drop away from group",
          "**Barkbreaker** — tank buster requiring defensive",
          "**Burst Forth** — AoE from spawned adds",
        ],
      },
      {
        name: "Crawth",
        mechanics: [
          "**Firestorm** — dodge the swirling fire circles",
          "**Sonic Vulnerability** — players with debuff take extra damage from Deafening Screech",
          "**Goal Kicks** — iconic mechanic: kick balls into the goal for a damage buff",
        ],
      },
      {
        name: "Echo of Doragosa",
        mechanics: [
          "**Astral Breath** — frontal cone, move out immediately",
          "**Arcane Missiles** — stacking DoT on random players. Spread to minimize splashing",
          "**Power Vacuum** — pulls all players to center then explodes",
        ],
      },
    ],
    trashTips: [
      "Dragon packs early on hit hard — respect their AoE abilities",
      "Spell-flinging trash in the academy halls requires kick rotation",
      "Can skip some packs with careful pathing",
    ],
    keyTips: [
      "32-minute timer — comfortable if you avoid wipes",
      "Crawth's goal kick mechanic provides a significant DPS buff — don't miss it",
      "Vexamus orb soaking is the most common fail point",
    ],
  },
];

export function getDungeonBySlug(slug: string): Dungeon | undefined {
  return DUNGEONS.find((d) => d.slug === slug);
}

export function getNewDungeons(): Dungeon[] {
  return DUNGEONS.filter((d) => d.isNew);
}

export function getLegacyDungeons(): Dungeon[] {
  return DUNGEONS.filter((d) => !d.isNew);
}
