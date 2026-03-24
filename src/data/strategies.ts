// ═══════════════════════════════════════════════════════════════════════════
// RAID BOSS STRATEGY DATA — Midnight Season 1
// ─────────────────────────────────────────────────────────────────────────
// To add a new raid tier:
//   1. Add a new RaidTier object to the RAID_TIERS array
//   2. Set isCurrent: true on the new tier, false on the old one
//   3. Each boss needs a unique slug (used in the URL)
//   4. Abilities can be filtered by role and difficulty
//
// To update an existing boss:
//   Find the boss by slug and edit its phases/abilities in place.
// ═══════════════════════════════════════════════════════════════════════════

export interface Ability {
  name: string;
  icon: string; // emoji or path to icon image
  type: string; // short label: "Soak", "Spread", "Tank Swap", etc.
  roles: ("tank" | "healer" | "dps" | "everyone")[];
  description: string; // supports **bold** for key terms
  whatToDo: string; // one-line action summary (shown in gold)
  dangerText?: string; // optional dangerous element highlighted in red/orange
  gif?: string; // optional URL to gif/video
  difficulties: ("normal" | "heroic" | "mythic")[];
}

export interface Phase {
  name: string;
  summary: string;
  abilities: Ability[];
}

export interface Boss {
  slug: string;
  name: string;
  bossNumber: number;
  thumbnail: string; // URL or path
  fightOverview: string[];
  quickStrat: string[]; // 3-5 bullet TLDR
  phases: Phase[];
  difficulties: ("normal" | "heroic" | "mythic")[];
}

export interface RaidTier {
  slug: string;
  name: string;
  shortName: string;
  isCurrent: boolean;
  patch: string;
  bosses: Boss[];
}

// ═══════════════════════════════════════════════════════════════════════════
// RAID 1: The Voidspire (6 bosses)
// Location: The Voidstorm
// ═══════════════════════════════════════════════════════════════════════════
const THE_VOIDSPIRE: RaidTier = {
  slug: "the-voidspire",
  name: "The Voidspire",
  shortName: "Voidspire",
  isCurrent: true,
  patch: "12.0",
  bosses: [
    {
      slug: "imperator-averzian",
      name: "Imperator Averzian",
      bossNumber: 1,
      thumbnail: "",
      difficulties: ["normal", "heroic", "mythic"],
      fightOverview: [
        "**Imperator Averzian** opens The Voidspire with a unique **tic-tac-toe board** mechanic.",
        "The boss summons **Abyssal Voidshapers** that attempt to claim spaces on a 3x3 grid. If three adjacent spaces are claimed in a line, **March of the Endless** triggers and wipes the raid.",
        "Players use **Umbral Collapse** soaks to destroy two of three Voidshapers per wave, controlling which spaces the boss claims.",
        "Expect frequent add management, strategic soak placement, and careful positioning to avoid empowering the boss near claimed portals.",
      ],
      quickStrat: [
        "3x3 grid — NEVER let 3 spaces in a line get claimed",
        "Umbral Collapse soaks destroy 2 of 3 Voidshapers per wave — coordinate placement",
        "Boss gains 75% damage + 90% DR near claimed spaces — keep him away",
        "Tanks swap at 8-10 stacks of Blackening Wounds",
        "Interrupt Abyssal Voidshapers casting Void Rupture",
      ],
      phases: [
        {
          name: "Repeating Phase",
          summary: "Manage the 3x3 grid — prevent the boss from completing a line",
          abilities: [
            {
              name: "Shadow's Advance",
              icon: "🏴",
              type: "Add Spawn",
              roles: ["everyone"],
              description:
                "Averzian summons a wave of three **Abyssal Voidshapers**, each targeting a space on the 3x3 grid. Each Voidshaper begins casting **Void Rupture** — if the cast completes, that space is permanently claimed. Players must use Umbral Collapse to destroy two per wave.",
              whatToDo: "SOAK UMBRAL COLLAPSE ON THE CORRECT MARKERS TO KILL 2 VOIDSHAPERS",
              dangerText: "Three claimed spaces in a line triggers March of the Endless — instant wipe",
              difficulties: ["normal", "heroic", "mythic"],
            },
            {
              name: "Umbral Collapse",
              icon: "💥",
              type: "Soak",
              roles: ["everyone"],
              description:
                "Averzian targets a player with a shadow soak circle. The damage is **split among all players** in the circle. The impact point destroys any Abyssal Voidshaper within its radius. Raid leader calls which marker to place the soak on.",
              whatToDo: "MOVE TO THE CALLED MARKER — STACK IN THE SOAK CIRCLE",
              difficulties: ["normal", "heroic", "mythic"],
            },
            {
              name: "Imperator's Glory",
              icon: "👑",
              type: "Positioning",
              roles: ["tank", "everyone"],
              description:
                "When Averzian stands within **10 yards of a claimed space**, he gains **75% increased damage** and **90% reduced damage taken**. Adds gain the same buff near the boss. The tank must keep the boss away from claimed portals at all times.",
              whatToDo: "TANKS KEEP BOSS FAR FROM CLAIMED SPACES — NEVER TANK HIM NEAR PORTALS",
              dangerText: "Boss becomes nearly unkillable and hits like a truck near portals",
              difficulties: ["normal", "heroic", "mythic"],
            },
            {
              name: "Blackening Wounds",
              icon: "🗡️",
              type: "Tank Swap",
              roles: ["tank"],
              description:
                "Each melee attack applies **Blackening Wounds**, reducing the tank's maximum health by **4% per stack** for 20 seconds. Adds automatically move toward the tank with the highest stacks. Swap at 8-10 stacks.",
              whatToDo: "SWAP AT 8-10 STACKS — ADDS FIXATE HIGH-STACK TANK",
              dangerText: "High stacks make the tank extremely vulnerable to one-shots",
              difficulties: ["normal", "heroic", "mythic"],
            },
            {
              name: "Oblivion's Wrath",
              icon: "⚔️",
              type: "Dodge",
              roles: ["everyone"],
              description:
                "Averzian spawns **void spikes** around the arena that fire in their facing direction after a brief delay. Players must identify spike orientations and dodge the beams.",
              whatToDo: "CHECK SPIKE FACING — DODGE THE BEAM LINES",
              difficulties: ["normal", "heroic", "mythic"],
            },
            {
              name: "Dark Upheaval",
              icon: "🌊",
              type: "Raid Damage",
              roles: ["healer"],
              description:
                "Unavoidable **raid-wide shadow damage** that pulses throughout the encounter. Intensity increases as more spaces are claimed on the grid.",
              whatToDo: "ROTATE HEALING COOLDOWNS — DAMAGE INCREASES WITH CLAIMED SPACES",
              difficulties: ["normal", "heroic", "mythic"],
            },
            {
              name: "Void Fall",
              icon: "🕳️",
              type: "Dodge",
              roles: ["everyone"],
              description:
                "Knockback ability that spawns multiple **ground impact circles** around the arena. Players must avoid impact zones after being knocked back.",
              whatToDo: "BRACE FOR KNOCKBACK — AVOID LANDING IN IMPACT CIRCLES",
              difficulties: ["heroic", "mythic"],
            },
          ],
        },
      ],
    },
    {
      slug: "vorasius",
      name: "Vorasius",
      bossNumber: 2,
      thumbnail: "",
      difficulties: ["normal", "heroic", "mythic"],
      fightOverview: [
        "**Vorasius** is a colossal predator born in the wastes of the Voidstorm, grown to enormous size.",
        "The boss periodically slams the ground with **Smashing Frenzy**, creating **crystal barrier walls** that divide the arena.",
        "Players must kite **Blistercreep** adds into the crystal walls to detonate them and create safe zones from the boss's sweeping **Void Breath**.",
        "The fight is a repeating cycle of wall creation, add management, and breath dodging that intensifies over time.",
      ],
      quickStrat: [
        "Kite Blistercreep adds into crystal walls to break them",
        "Hide behind broken wall gaps during Void Breath",
        "Tanks: position for direct Smashing Frenzy hits to prevent Overpowering Pulse",
        "Healers: manage Gathering Void stacks from Primordial Roar",
        "DPS: Kill Blistercreeps quickly — each cycle gets harder",
      ],
      phases: [
        {
          name: "Repeating Phase",
          summary: "Break crystal walls with adds — survive Void Breath sweeps",
          abilities: [
            {
              name: "Void Breath",
              icon: "🐉",
              type: "Dodge / LoS",
              roles: ["everyone"],
              description:
                "Vorasius sweeps a deadly beam across the battlefield, inflicting **massive shadow damage** to all players hit. The beam radiates dark energy, dealing additional damage over 15 seconds. Players must break line of sight behind **gaps in crystal walls** created by Blistercreep detonations.",
              whatToDo: "HIDE BEHIND BROKEN WALL GAPS — DO NOT GET HIT BY THE BEAM",
              dangerText: "Direct hit plus 15-second DoT — lethal without wall cover",
              difficulties: ["normal", "heroic", "mythic"],
            },
            {
              name: "Smashing Frenzy",
              icon: "💎",
              type: "Tank Mechanic",
              roles: ["tank", "everyone"],
              description:
                "Vorasius slams the ground, creating **crystal barrier walls** across the arena. Tanks must position to take the direct hit — if no player is hit directly, the boss casts **Overpowering Pulse** dealing massive raid-wide damage instead.",
              whatToDo: "TANKS SOAK THE DIRECT SLAM — RAID USES WALLS FOR VOID BREATH COVER",
              dangerText: "Missing the tank soak triggers lethal raid-wide Overpowering Pulse",
              difficulties: ["normal", "heroic", "mythic"],
            },
            {
              name: "Blistercreep",
              icon: "🐛",
              type: "Add Management",
              roles: ["dps", "everyone"],
              description:
                "Small adds that crawl toward crystal walls. When a Blistercreep reaches a wall, it detonates via **Blisterburst**, destroying a section and creating a safe gap for Void Breath. Players must kite adds to the correct wall segments to create optimal safe zones.",
              whatToDo: "KITE BLISTERCREEPS TO CRYSTAL WALLS — CREATE SAFE GAPS FOR BREATH",
              difficulties: ["normal", "heroic", "mythic"],
            },
            {
              name: "Primordial Roar",
              icon: "🔊",
              type: "Raid Damage",
              roles: ["healer", "everyone"],
              description:
                "Vorasius roars, applying **Gathering Void** stacks to all players. Each stack increases shadow damage taken. Stacks accumulate over the fight, creating a soft enrage.",
              whatToDo: "HEALERS MANAGE GATHERING VOID STACKS — DAMAGE RAMPS OVER TIME",
              difficulties: ["normal", "heroic", "mythic"],
            },
          ],
        },
      ],
    },
    {
      slug: "fallen-king-salhadaar",
      name: "Fallen-King Salhadaar",
      bossNumber: 3,
      thumbnail: "",
      difficulties: ["normal", "heroic", "mythic"],
      fightOverview: [
        "**Fallen-King Salhadaar** is a single-phase encounter with a repeating damage amplification intermission.",
        "The core mechanic is **Void Convergence** — two orbs spawn and slowly move toward the boss. If an orb reaches Salhadaar, **Void Infusion** triggers and wipes the raid.",
        "At 100 energy, **Entropic Unraveling** deals heavy pulsing damage but makes the boss take **25% increased damage** for 20 seconds — this is your burn window.",
        "Managing orbs, dodging beams during Unraveling, and handling **Fractured Images** adds creates a demanding coordination check.",
      ],
      quickStrat: [
        "KILL Concentrated Void orbs before they reach the boss — or wipe",
        "Entropic Unraveling at 100 energy = 25% bonus damage window (20 sec) — pop CDs",
        "Dodge spinning Umbral Beams during Unraveling",
        "CC/Interrupt Fractured Images — completed casts leave permanent void puddles",
        "Tanks swap on Destabilizing Strikes — move away with Despotic Command",
      ],
      phases: [
        {
          name: "Repeating Phase",
          summary: "Destroy orbs, manage space, burn during Unraveling windows",
          abilities: [
            {
              name: "Void Convergence",
              icon: "🔮",
              type: "DPS Check",
              roles: ["dps", "everyone"],
              description:
                "Two **Concentrated Void** orbs spawn at opposite sides of the arena and slowly advance toward Salhadaar. If ANY orb reaches the boss, he casts **Void Infusion** — an instant raid wipe. Contact with an orb applies **Void Exposure** to players. DPS must burn orbs before they arrive.",
              whatToDo: "ALL DPS SWITCH TO ORBS IMMEDIATELY — KILL BEFORE THEY REACH BOSS",
              dangerText: "Orb reaching the boss = instant wipe via Void Infusion",
              difficulties: ["normal", "heroic", "mythic"],
            },
            {
              name: "Entropic Unraveling",
              icon: "⚡",
              type: "Burn Window / Dodge",
              roles: ["everyone"],
              description:
                "At **100 energy**, Salhadaar channels for 20 seconds: pulsing heavy raid-wide shadow damage while taking **25% increased damage**. Spinning **Umbral Beams** rotate clockwise across the arena — contact is lethal. A massive void puddle spawns after the channel ends. This is your burn window.",
              whatToDo: "POP ALL COOLDOWNS — DODGE SPINNING BEAMS — HEAL THROUGH PULSE",
              dangerText: "Umbral Beam contact is instant death — puddle shrinks available space",
              difficulties: ["normal", "heroic", "mythic"],
            },
            {
              name: "Shattering Twilight",
              icon: "🌟",
              type: "Positioning",
              roles: ["tank", "everyone"],
              description:
                "Salhadaar hurls a dark star at the current tank. On impact, **Twilight Spikes** erupt outward in the direction the tank is facing. The debuff then transfers to several raid members, who each spawn smaller directional spikes. All affected players must face spikes away from allies.",
              whatToDo: "FACE AWAY FROM RAID WHEN DEBUFFED — AIM SPIKES INTO EMPTY SPACE",
              dangerText: "Spikes aimed at allies or the boss deal heavy unavoidable damage",
              difficulties: ["normal", "heroic", "mythic"],
            },
            {
              name: "Despotic Command",
              icon: "👁️",
              type: "Spread",
              roles: ["everyone"],
              description:
                "Several players receive a **circular indicator** lasting 10 seconds, dealing shadow damage to allies within 5 yards. When it expires, a **permanent void puddle** (Torturous Extract) drops at the player's location plus an absorb shield. Drop puddles at the edges of the room.",
              whatToDo: "SPREAD OUT — DROP PUDDLES AT ROOM EDGES — HEAL ABSORB SHIELDS",
              dangerText: "Bad puddle placement permanently shrinks the usable arena",
              difficulties: ["normal", "heroic", "mythic"],
            },
            {
              name: "Fractured Images",
              icon: "👤",
              type: "Interrupt / CC",
              roles: ["dps", "tank"],
              description:
                "Salhadaar manifests several **Fractured Images** around the arena. Each begins casting **Shadow Fracture** — if the cast completes, it drops a **permanent void puddle**. Any CC or interrupt destroys the image instantly.",
              whatToDo: "CC OR INTERRUPT EVERY IMAGE IMMEDIATELY — ASSIGN KICK TARGETS",
              dangerText: "Completed casts leave permanent puddles that shrink the arena",
              difficulties: ["normal", "heroic", "mythic"],
            },
            {
              name: "Destabilizing Strikes",
              icon: "🗡️",
              type: "Tank Swap",
              roles: ["tank"],
              description:
                "Tank melee attacks apply a **stacking shadow DoT** lasting 15 seconds. Each stack increases the ticking damage. Tanks must swap when stacks become dangerous (typically 4-5 stacks).",
              whatToDo: "SWAP AT 4-5 STACKS — USE ACTIVE MITIGATION ON HIGH STACKS",
              difficulties: ["normal", "heroic", "mythic"],
            },
            {
              name: "Twisting Obscurity",
              icon: "🌀",
              type: "Raid Damage",
              roles: ["healer"],
              description:
                "Unavoidable raid-wide damage that bounces between players, applying a **23-second shadow DoT** to each target. Overlaps with other mechanics for heavy healing pressure.",
              whatToDo: "HEAL THROUGH THE DOT — WATCH FOR OVERLAPS WITH UNRAVELING",
              difficulties: ["heroic", "mythic"],
            },
          ],
        },
      ],
    },
    {
      slug: "vaelgor-and-ezzorak",
      name: "Vaelgor & Ezzorak",
      bossNumber: 4,
      thumbnail: "",
      difficulties: ["normal", "heroic", "mythic"],
      fightOverview: [
        "**Vaelgor & Ezzorak** are twin red dragons corrupted by Xal'atath.",
        "The dragons must be kept **at least 15 yards apart** and within **10% HP of each other** at all times — otherwise they gain **Twilight Bond** (100% increased damage).",
        "At 100 energy, both fly up for **Midnight Flames** — the raid must stack in the **Radiant Barrier** in the center to survive.",
        "Each dragon has unique dangerous abilities: Vaelgor's **Dread Breath** fears players, and Ezzorak's **Gloom** creates area denial.",
      ],
      quickStrat: [
        "Keep dragons 15+ yards apart and within 10% HP of each other",
        "Vaelgor's Dread Breath = frontal fear — targeted player RUN AWAY from raid",
        "Soak Ezzorak's Gloom orbs before they hit walls to reduce damage",
        "At 100 energy: STACK IN RADIANT BARRIER in center for Midnight Flames",
        "Tanks: separate dragons, use defensives for Tail Lash knockback",
      ],
      phases: [
        {
          name: "Phase 1 — Twin Dragons",
          summary: "Balance HP, manage unique abilities, survive Midnight Flames intermission",
          abilities: [
            {
              name: "Twilight Bond",
              icon: "🔗",
              type: "Positioning / HP Balance",
              roles: ["everyone"],
              description:
                "The clutchmates share a link — if their HP diverges by **10% or more**, OR they are within **15 yards** of each other, both gain **100% increased damage**. DPS must balance damage between targets. Tanks must maintain separation.",
              whatToDo: "BALANCE DPS ON BOTH DRAGONS — TANKS KEEP 15+ YARDS APART",
              dangerText: "100% damage buff on both dragons at once will overwhelm healing",
              difficulties: ["normal", "heroic", "mythic"],
            },
            {
              name: "Dread Breath",
              icon: "😱",
              type: "Frontal / Fear",
              roles: ["everyone"],
              description:
                "Vaelgor targets a random player and breathes a **frontal cone** that fears anyone inside for **21 seconds** while dealing shadow damage. The targeted player must move away from the group immediately to prevent spreading the fear.",
              whatToDo: "IF TARGETED — RUN AWAY FROM RAID IMMEDIATELY",
              dangerText: "21-second fear on multiple players is essentially a wipe",
              difficulties: ["normal", "heroic", "mythic"],
            },
            {
              name: "Gloom",
              icon: "🌑",
              type: "Soak / Area Denial",
              roles: ["dps", "everyone"],
              description:
                "Ezzorak ejects a moving mass of pure darkness in a frontal direction. If it reaches the arena wall, it creates a large **Gloomfield** damage zone. Players can **soak the orb** en route to shrink the resulting field. More soakers = smaller field.",
              whatToDo: "INTERCEPT GLOOM ORBS BEFORE THEY HIT WALLS — MORE SOAKERS = SMALLER FIELD",
              difficulties: ["normal", "heroic", "mythic"],
            },
            {
              name: "Tail Lash",
              icon: "🐲",
              type: "Positioning",
              roles: ["tank", "everyone"],
              description:
                "Both dragons lash with their tails, hitting anyone in a **35-yard rear cone** for massive physical damage plus a bleed and knockback. Melee must stay at the dragon's side, never behind.",
              whatToDo: "STAY AT THE DRAGON'S SIDE — NEVER BEHIND",
              dangerText: "Tail hits apply a heavy bleed on top of the initial damage",
              difficulties: ["normal", "heroic", "mythic"],
            },
            {
              name: "Midnight Flames",
              icon: "🔥",
              type: "Intermission / Stack",
              roles: ["everyone"],
              description:
                "At **100 energy**, both dragons fly into the sky and spew **shadow fire** across the entire arena. The Lightbound Vanguard NPC spawns a **Radiant Barrier** in the center of the room. All players MUST stack inside the barrier or take lethal pulsing damage.",
              whatToDo: "EVERYONE STACK IN THE RADIANT BARRIER — STAY UNTIL DRAGONS LAND",
              dangerText: "Players outside the barrier will die to Midnight Flames",
              difficulties: ["normal", "heroic", "mythic"],
            },
          ],
        },
      ],
    },
    {
      slug: "lightblinded-vanguard",
      name: "Lightblinded Vanguard",
      bossNumber: 5,
      thumbnail: "",
      difficulties: ["normal", "heroic", "mythic"],
      fightOverview: [
        "**Lightblinded Vanguard** is a three-paladin encounter featuring **Lightblood**, **Bellamy**, and **Senn** — former paragons of the Light who have surrendered to blinding zealotry.",
        "At **100 energy**, each paladin activates a unique **Aura** that buffs the other two. The bosses must be **dragged out of the aura radius** as quickly as possible.",
        "**Aura of Wrath** (Lightblood) increases holy damage by 100%. **Aura of Devotion** (Bellamy) reduces damage taken by 75%. **Aura of Peace** (Senn) pacifies attackers for 5 seconds.",
        "After each aura expires, it leaves **Consecrated Ground** that must be avoided.",
      ],
      quickStrat: [
        "3 paladins — each has a unique Aura at 100 energy that buffs the other two",
        "IMMEDIATELY pull bosses OUT of active auras to prevent stacking buffs",
        "Execution Sentence = split soak within 8 yards of marked players",
        "Senn mounts Elekk and charges — break Sacred Shield then interrupt Blinding Light",
        "Avoid Consecrated Ground left behind by expired auras",
      ],
      phases: [
        {
          name: "Full Fight",
          summary: "Manage three paladins — drag out of auras, handle unique abilities",
          abilities: [
            {
              name: "Aura of Wrath",
              icon: "⚔️",
              type: "Reposition",
              roles: ["tank", "everyone"],
              description:
                "Lightblood activates an aura increasing **Holy damage by 100%** for all allies within 40 yards for 15 seconds. After expiring, Consecrated Ground is left behind. The other two bosses must be moved out of range immediately.",
              whatToDo: "TANKS DRAG OTHER BOSSES OUT OF WRATH AURA IMMEDIATELY",
              dangerText: "100% Holy damage buff on the other two paladins is devastating",
              difficulties: ["normal", "heroic", "mythic"],
            },
            {
              name: "Aura of Devotion",
              icon: "🛡️",
              type: "Reposition",
              roles: ["tank", "everyone"],
              description:
                "Bellamy activates an aura reducing **damage taken by 75%** for all allies within 40 yards for 25 seconds. After expiring, Consecrated Ground is left behind. Move other bosses out to prevent them becoming nearly invulnerable.",
              whatToDo: "TANKS DRAG OTHER BOSSES OUT — 75% DR MAKES THEM UNKILLABLE",
              difficulties: ["normal", "heroic", "mythic"],
            },
            {
              name: "Aura of Peace",
              icon: "☮️",
              type: "Reposition",
              roles: ["tank", "everyone"],
              description:
                "Senn activates an aura that **pacifies any player** who directly attacks a protected target for 5 seconds, within 40 yards, lasting 25 seconds. After expiring, Consecrated Ground is left behind. Move other bosses out or your DPS gets pacified.",
              whatToDo: "DRAG BOSSES OUT — DO NOT ATTACK BOSSES INSIDE PEACE AURA",
              dangerText: "Attacking a Peace-protected boss pacifies you for 5 seconds",
              difficulties: ["normal", "heroic", "mythic"],
            },
            {
              name: "Execution Sentence",
              icon: "⚖️",
              type: "Soak",
              roles: ["everyone"],
              description:
                "Lightblood marks several players then attempts to execute them 3 seconds later, inflicting **450 Holy damage split evenly** among all players within 8 yards of the target. Stack with marked players to split the damage.",
              whatToDo: "STACK WITHIN 8 YARDS OF MARKED PLAYERS — SPLIT THE DAMAGE",
              dangerText: "Unsoaked Execution Sentence will one-shot the target",
              difficulties: ["normal", "heroic", "mythic"],
            },
            {
              name: "Sacred Shield + Blinding Light",
              icon: "💡",
              type: "Shield Break / Interrupt",
              roles: ["dps", "tank"],
              description:
                "Senn mounts an Elekk and **charges** a random player, then applies **Sacred Shield** to herself. While shielded, she begins casting **Blinding Light** — a raid-wide disorient. Break the shield quickly, then interrupt the cast.",
              whatToDo: "BREAK SACRED SHIELD → INTERRUPT BLINDING LIGHT — ASSIGN KICK ORDER",
              dangerText: "Completed Blinding Light disorients the entire raid",
              difficulties: ["normal", "heroic", "mythic"],
            },
            {
              name: "Consecrated Ground",
              icon: "✨",
              type: "Dodge",
              roles: ["everyone"],
              description:
                "After each aura expires, the ground underneath is permanently **Consecrated**, dealing Holy damage to anyone standing in it. Arena space shrinks as more auras are triggered — position bosses to minimize overlap.",
              whatToDo: "AVOID CONSECRATED GROUND — PLAN BOSS POSITIONS TO SAVE SPACE",
              difficulties: ["normal", "heroic", "mythic"],
            },
          ],
        },
      ],
    },
    {
      slug: "crown-of-the-cosmos",
      name: "Crown of the Cosmos",
      bossNumber: 6,
      thumbnail: "",
      difficulties: ["normal", "heroic", "mythic"],
      fightOverview: [
        "**Crown of the Cosmos** is the final boss of The Voidspire — **Alleria Windrunner** wielding the full power of the Void.",
        "A 3-phase encounter with 2 intermissions. The platform progressively **breaks into 3 separate pieces** by Phase 3.",
        "**Phase 1**: Kill 3 Undying Sentinels while managing Alleria's abilities. Use **Silverstrike Arrow** to remove void effects from Sentinels.",
        "**Phase 2**: A Rift Simulacrum spawns — kill the clone before puddles consume the room. Keep Alleria and the clone **30+ yards apart**.",
        "**Phase 3**: Final burn on separated platforms. **Devouring Cosmos** forces players to use feathers to jump between platform pieces. **Aspect of the End** creates a stacking healing reduction.",
      ],
      quickStrat: [
        "P1: Kill 3 Undying Sentinels — aim Silverstrike Arrow through them to remove immunity",
        "Intermission: Stack in one platform section — dodge Silverstrike Barrage waves",
        "P2: Kill Rift Simulacrum — keep 30 yards from Alleria — break Cosmic Barrier shield",
        "P3: Use feathers for Devouring Cosmos platform jumps — break Aspect of the End tethers ONE AT A TIME",
        "Healers: manage Null Corona absorb shields — do NOT dispel (absorb jumps to another player)",
      ],
      phases: [
        {
          name: "Phase 1 — The Void's Spire",
          summary: "Kill 3 Undying Sentinels while managing Alleria's attacks — 100% to intermission",
          abilities: [
            {
              name: "Silverstrike Arrow",
              icon: "🏹",
              type: "Mechanic",
              roles: ["everyone"],
              description:
                "Alleria fires a silver-lined arrow in a line, dealing **Arcane damage** and removing Void effects from anything it hits. Use this to strip **Umbral Tether** immunity from Undying Sentinels. Players must position so the arrow passes through the correct Sentinel.",
              whatToDo: "POSITION SO SILVERSTRIKE ARROW HITS THE TARGET SENTINEL",
              difficulties: ["normal", "heroic", "mythic"],
            },
            {
              name: "Grasp of Emptiness",
              icon: "🕳️",
              type: "Positioning",
              roles: ["everyone"],
              description:
                "Ancient obelisks grasp a player with Void energy, slowing them and dealing shadow damage. **3 beams** shoot away from the player's position. The targeted player must angle the beams away from the raid by repositioning.",
              whatToDo: "IF TARGETED — REPOSITION TO AIM ALL 3 BEAMS AWAY FROM RAID",
              dangerText: "Beams deal heavy damage to anyone caught in their path",
              difficulties: ["normal", "heroic", "mythic"],
            },
            {
              name: "Void Expulsion",
              icon: "☄️",
              type: "Dodge",
              roles: ["everyone"],
              description:
                "Alleria calls down a celestial body near a ranged player. It crashes into the ground dealing shadow damage and leaving a **permanent void puddle**. Area denial that accumulates over the phase.",
              whatToDo: "BAIT NEAR EXISTING PUDDLES — KEEP CLEAN SPACE FOR MOVEMENT",
              difficulties: ["normal", "heroic", "mythic"],
            },
            {
              name: "Null Corona",
              icon: "🌀",
              type: "Healing Check",
              roles: ["healer"],
              description:
                "Places a massive **absorb shield** on a player that must be healed through. Do NOT dispel — if dispelled, the remaining absorb **jumps to another player**. Healers must pump healing into the target.",
              whatToDo: "HEAL THE ABSORB — NEVER DISPEL NULL CORONA",
              dangerText: "Dispelling transfers the full remaining absorb to someone else",
              difficulties: ["normal", "heroic", "mythic"],
            },
            {
              name: "Undying Sentinels",
              icon: "🗿",
              type: "Priority Targets",
              roles: ["dps", "tank"],
              description:
                "Three Sentinels (Morium, Demiar, Vorelus) are linked to void portals. Each has unique abilities: **Dark Hand** (tankbuster), **Interrupting Tremor** (40yd silence pulse), **Ravenous Abyss** (15yd damage + 70% DPS reduction). If no melee is on a Sentinel, it gains **Echoing Darkness** stacking damage buff.",
              whatToDo: "KEEP MELEE ON EACH SENTINEL — USE SILVERSTRIKE TO REMOVE IMMUNITY",
              dangerText: "Unattended Sentinels stack Echoing Darkness — quickly becomes lethal",
              difficulties: ["normal", "heroic", "mythic"],
            },
          ],
        },
        {
          name: "Intermission — Crushing Singularity",
          summary: "Survive on one platform section — dodge barrage waves",
          abilities: [
            {
              name: "Stellar Emission",
              icon: "💫",
              type: "Raid Damage / Pull",
              roles: ["everyone"],
              description:
                "Raw void energy arcs outward from Alleria, dealing **stacking shadow damage every 2 seconds** and pulling players toward center. Silverstrike arrows can be aimed through players to remove stacks. Intensity increases over time.",
              whatToDo: "RESIST THE PULL — USE SILVERTRIKE TO REMOVE STACKS ON ALLIES",
              difficulties: ["normal", "heroic", "mythic"],
            },
            {
              name: "Silverstrike Barrage",
              icon: "🏹",
              type: "Dodge",
              roles: ["everyone"],
              description:
                "Several waves of silver-lined arrows fire from Alleria across the platform. Getting hit deals damage. On **Heroic**, hits apply a debuff increasing arrow damage taken by **800% for 8 seconds** — surviving a second hit is nearly impossible.",
              whatToDo: "DODGE ARROW WAVES — ON HEROIC: ONE HIT = DEATH TO NEXT HIT",
              dangerText: "Heroic 800% damage taken debuff makes consecutive hits lethal",
              difficulties: ["normal", "heroic", "mythic"],
            },
          ],
        },
        {
          name: "Phase 2 — The Severed Rift",
          summary: "Kill the Rift Simulacrum before puddles consume the room",
          abilities: [
            {
              name: "Rift Simulacrum",
              icon: "👤",
              type: "Priority Target",
              roles: ["dps", "tank"],
              description:
                "A void clone of Alleria spawns with **Empowering Darkness** — granting Alleria 10% reduced damage taken and 5% increased damage per stack. It is protected by a **Cosmic Barrier** (15% HP absorb shield). Break the barrier, then burn the clone. Keep clone and Alleria **30+ yards apart** or they buff each other.",
              whatToDo: "BREAK COSMIC BARRIER — BURN CLONE — MAINTAIN 30+ YARD SEPARATION",
              dangerText: "Each clone stack permanently empowers Alleria",
              difficulties: ["normal", "heroic", "mythic"],
            },
            {
              name: "Silverstrike Ricochet",
              icon: "🏹",
              type: "Coordination",
              roles: ["everyone"],
              description:
                "A single arrow **bounces between marked players** instead of firing individually. Players must cooperate to aim the bouncing arrow through adds to break their death immunity. If an add reaches 100 energy, it gains **300% move speed, 500% damage**, and CC immunity.",
              whatToDo: "COORDINATE BOUNCING ARROW TO HIT ADDS — DON'T LET ADDS REACH 100 ENERGY",
              dangerText: "100-energy add becomes an unkillable wrecking ball",
              difficulties: ["normal", "heroic", "mythic"],
            },
            {
              name: "Voidstalker Sting",
              icon: "🎯",
              type: "Debuff",
              roles: ["healer"],
              description:
                "Alleria fires void-tipped arrows at several players, applying a **shadow DoT** (10 sec on Normal, 25 sec on Heroic). Stacks if reapplied. Players can stand in Silverstrike arrow paths to cleanse the effect.",
              whatToDo: "HEAL THROUGH STING — CLEANSE BY STANDING IN SILVERSTRIKE PATHS",
              difficulties: ["normal", "heroic", "mythic"],
            },
          ],
        },
        {
          name: "Phase 3 — The End of the End",
          summary: "Final burn on separated platforms — use feathers to jump, break tethers carefully",
          abilities: [
            {
              name: "Devouring Cosmos",
              icon: "🌌",
              type: "Platform Jump",
              roles: ["everyone"],
              description:
                "Void energy consumes one platform section. Feathers scatter from Alleria's quiver — each player picks up a feather and gains a buff to **jump to another platform section**. Players caught in the devouring zone take massive shadow damage and **99% reduced healing**.",
              whatToDo: "GRAB A FEATHER — JUMP TO A SAFE PLATFORM SECTION BEFORE VOID ARRIVES",
              dangerText: "99% healing reduction inside the void zone = death",
              difficulties: ["normal", "heroic", "mythic"],
            },
            {
              name: "Aspect of the End",
              icon: "🔥",
              type: "Debuff / Tank Swap",
              roles: ["tank", "healer", "everyone"],
              description:
                "Several players (including active tank) are tethered by a consuming arrow. Healing received is reduced by **10% per stack** (stacking every 2 seconds). Break the tether by running **30 yards away** — breaking triggers raid-wide damage and **300% physical damage vulnerability** on the target for 12 seconds. Break tethers ONE AT A TIME.",
              whatToDo: "BREAK TETHERS ONE AT A TIME — TANK SWAP AFTER BREAKING",
              dangerText: "Breaking multiple tethers simultaneously will overwhelm the raid",
              difficulties: ["normal", "heroic", "mythic"],
            },
            {
              name: "Gravity Collapse",
              icon: "⬇️",
              type: "Tank Mechanic",
              roles: ["tank"],
              description:
                "When Aspect of the End is broken, the target is knocked upward and takes **300% increased physical damage for 12 seconds**. Tanks must swap immediately after breaking their tether, as the vulnerability makes tanking impossible.",
              whatToDo: "TANK SWAP AFTER EVERY TETHER BREAK — 12 SEC VULNERABILITY",
              difficulties: ["normal", "heroic", "mythic"],
            },
          ],
        },
      ],
    },
  ],
};

// ═══════════════════════════════════════════════════════════════════════════
// RAID 2: The Dreamrift (1 boss)
// Location: Harandar
// ═══════════════════════════════════════════════════════════════════════════
const THE_DREAMRIFT: RaidTier = {
  slug: "the-dreamrift",
  name: "The Dreamrift",
  shortName: "Dreamrift",
  isCurrent: true,
  patch: "12.0",
  bosses: [
    {
      slug: "chimaerus",
      name: "Chimaerus the Undreamt God",
      bossNumber: 1,
      thumbnail: "",
      difficulties: ["normal", "heroic", "mythic"],
      fightOverview: [
        "**Chimaerus the Undreamt God** is the sole boss of The Dreamrift — a complex encounter revolving around **Manifestation** management.",
        "The raid splits into **Upstairs** (boss damage) and **Downstairs** (add soaking) groups. **Alndust Upheaval** soaks grant **Alnsight**, allowing players to see and attack hidden Manifestations.",
        "Manifestations must be killed before Chimaerus **consumes** them — each consumed add permanently increases his damage by **100%** and heals him for 200% of the add's missing health.",
        "At **100 energy**, the boss enters an intermission: flying across the arena with **Corrupted Devastation**, then performing **Ravenous Dive** to consume ALL remaining adds.",
      ],
      quickStrat: [
        "Split raid into Upstairs (boss) and Downstairs (soak Alndust Upheaval for Alnsight)",
        "Kill Manifestations BEFORE boss eats them — each consumed = 100% permanent damage buff",
        "Soak Alndust Upheaval to gain Alnsight — then kill hidden adds",
        "Intermission: dodge Corrupted Devastation breath lines, kill remaining adds before Ravenous Dive",
        "Add puddles (Alndust Essence) slow 50% + deal damage — avoid them",
      ],
      phases: [
        {
          name: "Phase 1 — The Undreamt",
          summary: "Manage Manifestations — rotate soak groups for Alnsight",
          abilities: [
            {
              name: "Alndust Upheaval",
              icon: "💎",
              type: "Soak / Buff",
              roles: ["everyone"],
              description:
                "Chimaerus targets the current tank with a circle. Damage is **split among all players** standing inside. All soakers gain **Alnsight** (40-second buff allowing attacks on Manifestations), then receive **Rift Vulnerability** (1.5-minute debuff preventing future soaks). Rotate soak groups.",
              whatToDo: "ASSIGNED GROUP STACKS IN SOAK CIRCLE — THEN USE ALNSIGHT TO KILL ADDS",
              dangerText: "Without enough soakers, damage is lethal; without Alnsight, adds are invisible",
              difficulties: ["normal", "heroic", "mythic"],
            },
            {
              name: "Manifestations",
              icon: "👻",
              type: "Priority Adds",
              roles: ["dps", "everyone"],
              description:
                "Adds spawn with **Alnshroud** shields — invisible and untargetable until an Alnsight player breaks their shield. Once broken, all players can attack them. Types include: **Haunting Essence** (casts Fearsome Cry fear + Essence Bolt), **Swarming Shade** (simple melee), and **Colossal Horror** (must be tanked, ramps damage).",
              whatToDo: "ALNSIGHT PLAYERS BREAK SHIELDS — EVERYONE FOCUS ADDS DOWN",
              difficulties: ["normal", "heroic", "mythic"],
            },
            {
              name: "Insatiable",
              icon: "🦷",
              type: "Soft Enrage",
              roles: ["everyone"],
              description:
                "Chimaerus eats any Manifestation that reaches him. Each consumed add deals **raid-wide damage**, heals the boss for **200% of the add's missing health**, and permanently increases his damage by **100%**. After 3-4 consumed adds, the fight becomes mathematically impossible.",
              whatToDo: "NEVER LET ADDS REACH THE BOSS — PRIORITY ONE",
              dangerText: "Each consumed add = permanent 100% damage increase — 3-4 stacks = wipe",
              difficulties: ["normal", "heroic", "mythic"],
            },
            {
              name: "Consuming Miasma",
              icon: "☁️",
              type: "Dispel",
              roles: ["healer"],
              description:
                "Several players receive a large circle dealing damage every 1.5 seconds for 1 minute unless dispelled. Dispelling while standing in an **Alndust Essence puddle** clears the puddle. Creates a splash of damage near the player on dispel.",
              whatToDo: "DISPEL IN PUDDLES TO CLEAR THEM — WARN NEARBY PLAYERS OF SPLASH",
              difficulties: ["normal", "heroic", "mythic"],
            },
            {
              name: "Rending Tear",
              icon: "🐾",
              type: "Frontal",
              roles: ["everyone"],
              description:
                "A **frontal cone** targeted at a random player, dealing heavy damage and applying a bleed to anyone hit. The target must ensure no allies are behind them in the cone.",
              whatToDo: "IF TARGETED — FACE AWAY FROM RAID",
              difficulties: ["normal", "heroic", "mythic"],
            },
            {
              name: "Caustic Phlegm",
              icon: "🧪",
              type: "Raid Damage",
              roles: ["healer"],
              description:
                "Raid-wide DoT lasting 12 seconds that overlaps with other mechanics for heavy sustained healing pressure.",
              whatToDo: "HEAL THROUGH — WATCH FOR OVERLAP WITH UPHEAVAL SOAKS",
              difficulties: ["heroic", "mythic"],
            },
          ],
        },
        {
          name: "Intermission — Corrupted Devastation",
          summary: "Boss takes flight — dodge breath lines, kill remaining adds before Ravenous Dive",
          abilities: [
            {
              name: "Corrupted Devastation",
              icon: "💣",
              type: "Dodge",
              roles: ["everyone"],
              description:
                "Chimaerus flies across the arena in a line, dealing **massive damage and stunning** anyone hit. Spawns new Manifestations and leaves **persistent void puddles** along the path. Boss takes **99% reduced damage** during flight (Rift Shroud).",
              whatToDo: "DODGE BREATH LINES — KILL SPAWNED ADDS — BOSS IS IMMUNE",
              dangerText: "Direct hit stuns and likely kills — puddles shrink available space",
              difficulties: ["normal", "heroic", "mythic"],
            },
            {
              name: "Ravenous Dive",
              icon: "🦅",
              type: "DPS Check",
              roles: ["everyone"],
              description:
                "Chimaerus ends the intermission by crashing into the ground, **knocking everyone up** and consuming ALL remaining Manifestations on the field. Each consumed add grants the permanent damage buff. Clear every add before the dive lands.",
              whatToDo: "KILL ALL REMAINING ADDS BEFORE RAVENOUS DIVE — HEALING CDS FOR LANDING",
              dangerText: "Multiple consumed adds = permanent enrage — likely wipe",
              difficulties: ["normal", "heroic", "mythic"],
            },
            {
              name: "Alndust Essence Puddles",
              icon: "💧",
              type: "Dodge",
              roles: ["everyone"],
              description:
                "Each dead Manifestation leaves behind a puddle that **slows players by 50%** and deals damage over time. Puddles accumulate over multiple phases. Can be cleared by dispelling Consuming Miasma while standing in them.",
              whatToDo: "AVOID PUDDLES — CLEAR WITH MIASMA DISPELS WHEN POSSIBLE",
              difficulties: ["normal", "heroic", "mythic"],
            },
          ],
        },
      ],
    },
  ],
};

// ═══════════════════════════════════════════════════════════════════════════
// RAID 3: March on Quel'Danas (2 bosses)
// Location: Isle of Quel'Danas
// ═══════════════════════════════════════════════════════════════════════════
const MARCH_ON_QUELDANAS: RaidTier = {
  slug: "march-on-queldanas",
  name: "March on Quel'Danas",
  shortName: "Quel'Danas",
  isCurrent: true,
  patch: "12.0",
  bosses: [
    {
      slug: "beloren-child-of-alar",
      name: "Belo'ren, Child of Al'ar",
      bossNumber: 1,
      thumbnail: "",
      difficulties: ["normal", "heroic", "mythic"],
      fightOverview: [
        "**Belo'ren, Child of Al'ar** is a phoenix guardian of Quel'Danas, corrupted by the Void.",
        "The entire fight splits the raid into **two teams** based on whether they receive a **Light Feather** (50% Holy DR) or **Void Feather** (50% Shadow DR) from **Voidlight Convergence**.",
        "Each team handles adds, soaks, and interrupts matching their feather color. Wrong-color mechanics deal dramatically increased damage.",
        "When Belo'ren reaches 0% HP, she crashes down with **Death Drop** and becomes an egg. The egg is the boss's **true health pool** — burn it during the 30-second **Rebirth** window. Each Rebirth cycle applies a permanent **10% healing reduction** (Ashen Benediction).",
      ],
      quickStrat: [
        "Light Feather team handles Light mechanics, Void Feather team handles Void mechanics",
        "Soak Light Dive / Void Dive with MATCHING color players only",
        "Guardian's Edict: matching-color tank must intercept the cone or boss gains 30% damage for 30 sec",
        "At 0% HP: Death Drop knockback → burn the Egg in 30 seconds",
        "Each Rebirth cycle = permanent 10% healing reduction — kill egg fast to minimize cycles",
      ],
      phases: [
        {
          name: "Phase 1 — Voidlight Phoenix",
          summary: "Two teams manage color-coded mechanics — fight the phoenix",
          abilities: [
            {
              name: "Voidlight Convergence",
              icon: "🔀",
              type: "Team Assignment",
              roles: ["everyone"],
              description:
                "Cast several times during the fight for 6 seconds, dealing raid-wide damage and assigning every player either **Light Feather** (50% Holy damage reduction) or **Void Feather** (50% Shadow damage reduction). Teams are reassigned each cast — check your buff.",
              whatToDo: "CHECK YOUR FEATHER COLOR — HANDLE MATCHING-COLOR MECHANICS ONLY",
              difficulties: ["normal", "heroic", "mythic"],
            },
            {
              name: "Light Dive / Void Dive",
              icon: "⭕",
              type: "Soak",
              roles: ["everyone"],
              description:
                "One random Light player and one random Void player each get a **soak circle** dealing heavy damage split among players inside. Only **matching-color players** should soak to benefit from their 50% DR. Creates a permanent expanding puddle.",
              whatToDo: "MATCHING COLOR PLAYERS STACK IN SOAK CIRCLE — WRONG COLOR STAY OUT",
              dangerText: "Wrong-color soakers take full unmitigated damage",
              difficulties: ["normal", "heroic", "mythic"],
            },
            {
              name: "Guardian's Edict",
              icon: "🛡️",
              type: "Tank Mechanic",
              roles: ["tank"],
              description:
                "Belo'ren fires a directional cone at the tank. The **matching-color tank** must intercept the cone. If the wrong tank is hit, or no tank is in the cone, Belo'ren gains **30% increased damage for 30 seconds** (stacking). Tanks swap to match their feather color.",
              whatToDo: "MATCHING-COLOR TANK INTERCEPTS THE CONE — SWAP IF COLORS CHANGE",
              dangerText: "Failed Edict = 30% stacking damage buff on boss",
              difficulties: ["normal", "heroic", "mythic"],
            },
            {
              name: "Embers of Belo'ren",
              icon: "🔥",
              type: "Add Management",
              roles: ["dps"],
              description:
                "Light and Void ember adds spawn periodically. Each has matching-color abilities: **Light Blast / Void Blast** (interruptible single-target), and **Light Eruption / Void Eruption** (interruptible raid-wide). Only matching-color players can interrupt effectively. When an ember dies, it becomes an egg that must be killed in 15 seconds or it revives.",
              whatToDo: "MATCHING TEAM INTERRUPTS AND KILLS THEIR ADDS — BURN EGGS IN 15 SEC",
              difficulties: ["normal", "heroic", "mythic"],
            },
            {
              name: "Radiant Echoes",
              icon: "💫",
              type: "Mechanic",
              roles: ["everyone"],
              description:
                "Orbs move across the arena and burst on contact, dealing damage. **Matching-color players** should pop orbs to create safe gaps. Wrong-color players hit by an orb take additional damage over 20 seconds.",
              whatToDo: "POP ORBS MATCHING YOUR COLOR — AVOID OPPOSITE COLOR ORBS",
              difficulties: ["heroic", "mythic"],
            },
            {
              name: "Burning Heart",
              icon: "❤️‍🔥",
              type: "Raid Damage",
              roles: ["healer"],
              description:
                "Constant **raid-wide damage every 3 seconds** throughout the fight. Intensifies during egg phases and after each Rebirth cycle. Combined with Ashen Benediction stacks, healing becomes progressively harder.",
              whatToDo: "PACE HEALING COOLDOWNS — DAMAGE RAMPS EACH CYCLE",
              difficulties: ["normal", "heroic", "mythic"],
            },
          ],
        },
        {
          name: "Rebirth Phase — The Egg",
          summary: "Boss crashes down — burn the egg in 30 seconds or it rebirths stronger",
          abilities: [
            {
              name: "Death Drop",
              icon: "💀",
              type: "Knockback",
              roles: ["everyone"],
              description:
                "When Belo'ren's phoenix form reaches 0% HP, she flies up and crashes down dealing **heavy Physical damage** and knocking all players into the air. Damage and knockback **decrease with distance**. Use Warlock Gateway or movement abilities to create distance.",
              whatToDo: "SPREAD FROM CENTER — FURTHER AWAY = LESS DAMAGE",
              difficulties: ["normal", "heroic", "mythic"],
            },
            {
              name: "Rebirth Egg",
              icon: "🥚",
              type: "DPS Check",
              roles: ["dps", "everyone"],
              description:
                "For 30 seconds, Belo'ren becomes an **egg** — this is the boss's true HP pool. If the egg survives, the phoenix rebirths with **Ashen Benediction** — a permanent **10% healing reduction debuff** on the entire raid that stacks with each cycle. Later cycles spawn two embers simultaneously.",
              whatToDo: "ALL DPS ON THE EGG — 30 SECOND BURN WINDOW",
              dangerText: "Each Rebirth = permanent 10% healing reduction — fight gets impossible fast",
              difficulties: ["normal", "heroic", "mythic"],
            },
            {
              name: "Eternal Burns",
              icon: "🔥",
              type: "Healing Check",
              roles: ["healer"],
              description:
                "During egg phase, a **large absorb shield** is applied to all players while constant damage ticks. Healers must heal through the absorb before the damage overwhelms players.",
              whatToDo: "PUMP HEALING — CLEAR ABSORBS BEFORE PLAYERS DROP",
              difficulties: ["heroic", "mythic"],
            },
          ],
        },
      ],
    },
    {
      slug: "midnight-falls",
      name: "Midnight Falls",
      bossNumber: 2,
      thumbnail: "",
      difficulties: ["normal", "heroic", "mythic"],
      fightOverview: [
        "**Midnight Falls** is the final boss of March on Quel'Danas — **L'ura**, a fallen Naaru whose dark energies threaten the Sunwell itself.",
        "A 3-stage encounter plus intermission. The **Darkwell** is a central void beam that instantly kills anyone who enters it.",
        "**Stage 1**: Manage **Death's Dirge** (musical melody + sweeping laser), destroy **Midnight Crystals**, and heal Dusk Crystals into Dawn Crystals for protection.",
        "**Intermission**: L'ura enters the Darkwell — survive Black Shroud pull and Starsplinter shrapnel while dealing with Eclipsed healing absorb.",
        "**Stage 2**: Pulled inside the Darkwell. Charge **Void Cores** with Galvanize beams to trigger Cosmic Fission, then survive **Dark Meltdown** at 100 energy.",
        "**Stage 3**: True darkness falls. **Torchbearers** holding Dawn Crystals protect allies from lethal **Midnight** ticking damage. **Dark Constellation** creates star networks to dodge.",
      ],
      quickStrat: [
        "The Darkwell instantly kills — stay away in Stage 1",
        "Death's Dirge: match Dark Rune notes to avoid the sweeping laser",
        "Heal Dusk Crystals → Dawn Crystals for protection, destroy Midnight Crystals",
        "Stage 2 (inside Darkwell): charge Void Cores with Galvanize beams → trigger Cosmic Fission",
        "Stage 3: Torchbearers with Dawn Crystals = safe zones from Midnight darkness — STAY IN THE LIGHT",
      ],
      phases: [
        {
          name: "Stage 1 — Final Tolls",
          summary: "Manage crystals, survive Death's Dirge melody, avoid the Darkwell",
          abilities: [
            {
              name: "The Darkwell",
              icon: "⚫",
              type: "Environment",
              roles: ["everyone"],
              description:
                "A colossal void beam in the center of the arena. **Instantly vaporizes** any player that enters it. The beam is permanent in Stage 1 and defines the arena layout.",
              whatToDo: "NEVER ENTER THE DARKWELL — INSTANT DEATH",
              dangerText: "Instant kill — no exceptions",
              difficulties: ["normal", "heroic", "mythic"],
            },
            {
              name: "Death's Dirge",
              icon: "🎵",
              type: "Mechanic",
              roles: ["everyone"],
              description:
                "L'ura sings a dreadful melody, marking players with **Dark Runes** corresponding to each musical note. She then fires a **sweeping laser** that activates each Dark Rune it hits. On **Heroic**, the number of notes increases with each melody cast.",
              whatToDo: "WATCH YOUR DARK RUNE — AVOID THE SWEEPING LASER WHEN YOUR NOTE PLAYS",
              dangerText: "Activated Dark Runes deal heavy damage to the marked player",
              difficulties: ["normal", "heroic", "mythic"],
            },
            {
              name: "Crystal Management",
              icon: "💎",
              type: "Mechanic",
              roles: ["healer", "dps"],
              description:
                "Three crystal types appear: **Midnight Crystals** (destroy or they trigger Cosmic Fracture), **Dusk Crystals** (can be healed into Dawn Crystals), and **Dawn Crystals** (purified — players hold them for protection). Healers focus on converting Dusk → Dawn while DPS destroys Midnight Crystals.",
              whatToDo: "HEALERS: HEAL DUSK → DAWN — DPS: DESTROY MIDNIGHT CRYSTALS",
              difficulties: ["normal", "heroic", "mythic"],
            },
            {
              name: "Heaven's Glaives",
              icon: "⚔️",
              type: "Dodge",
              roles: ["everyone"],
              description:
                "L'ura spins and unleashes whirling blades dealing heavy damage to nearby players. Stay at range or dodge the spin radius.",
              whatToDo: "STAY AT RANGE DURING GLAIVE SPIN — MELEE BACK OUT BRIEFLY",
              difficulties: ["normal", "heroic", "mythic"],
            },
            {
              name: "Starsplinter",
              icon: "✨",
              type: "Spread",
              roles: ["everyone"],
              description:
                "L'ura drops glass spikes on random players dealing Cosmic damage. **Fractured shards** erupt outward from each impact, hitting anyone in the splash. Spread to avoid overlapping shrapnel.",
              whatToDo: "SPREAD — AVOID STANDING NEAR OTHER TARGETED PLAYERS",
              difficulties: ["normal", "heroic", "mythic"],
            },
            {
              name: "Safeguard Prism",
              icon: "🛡️",
              type: "Shield Break",
              roles: ["dps"],
              description:
                "L'ura creates a revolving bulwark of **Safeguard Matrices**, each reducing her damage taken by **33%** for up to 20 seconds. DPS must break through the matrices to resume full damage.",
              whatToDo: "BURN THROUGH SAFEGUARD MATRICES QUICKLY — EACH ONE = 33% DR",
              difficulties: ["heroic", "mythic"],
            },
          ],
        },
        {
          name: "Intermission — Total Eclipse",
          summary: "L'ura enters the Darkwell — survive pull and shrapnel with healing absorb",
          abilities: [
            {
              name: "Total Eclipse",
              icon: "🌑",
              type: "Raid Damage",
              roles: ["healer", "everyone"],
              description:
                "L'ura enters the Darkwell and regenerates energy. All players receive **Eclipsed** — a healing absorb that must be healed through. Shadows push players toward the center via **Black Shroud** while **Starsplinter** shrapnel rains down.",
              whatToDo: "HEAL THROUGH ECLIPSED ABSORB — RESIST CENTER PULL — DODGE SHRAPNEL",
              dangerText: "Getting pulled into the Darkwell during this phase is instant death",
              difficulties: ["normal", "heroic", "mythic"],
            },
          ],
        },
        {
          name: "Stage 2 — The Dark Reactor",
          summary: "Inside the Darkwell — charge Void Cores, survive Dark Meltdown",
          abilities: [
            {
              name: "Into the Darkwell",
              icon: "🌀",
              type: "Phase Transition",
              roles: ["everyone"],
              description:
                "All players are pulled into the Darkwell's core. The **Abyssal Pool** deals Cosmic damage to everyone every 1 second. **Void Cores** appear that can be charged to progress the phase.",
              whatToDo: "HEALERS KEEP RAID ALIVE THROUGH CONSTANT TICKING — DPS FOCUS CORES",
              difficulties: ["normal", "heroic", "mythic"],
            },
            {
              name: "Galvanize + Cosmic Fission",
              icon: "⚡",
              type: "Mechanic",
              roles: ["everyone"],
              description:
                "L'ura fires **Galvanize** beams at random players. If a beam hits a **Void Core**, it triggers **Cosmic Fission** — pulling players toward the core and dealing damage, but creating a **Charged Core**. On Heroic, excess power arcs between nearby players via **Overkill Current**.",
              whatToDo: "AIM GALVANIZE BEAMS INTO VOID CORES — SPACE OUT FOR OVERKILL CURRENT",
              difficulties: ["normal", "heroic", "mythic"],
            },
            {
              name: "Dark Meltdown",
              icon: "💥",
              type: "Phase End",
              roles: ["everyone"],
              description:
                "At **100 energy**, L'ura expels all players from the Darkwell with a massive blast. Remaining uncharged cores overheat and deal additional Cosmic damage. Charge as many cores as possible before this triggers.",
              whatToDo: "CHARGE ALL CORES BEFORE 100 ENERGY — BRACE FOR MELTDOWN BLAST",
              dangerText: "Uncharged cores explode for extra damage during Meltdown",
              difficulties: ["normal", "heroic", "mythic"],
            },
          ],
        },
        {
          name: "Stage 3 — Midnight Falls",
          summary: "True darkness — Torchbearers protect allies, dodge Dark Constellation",
          abilities: [
            {
              name: "Midnight",
              icon: "🌑",
              type: "Soft Enrage",
              roles: ["everyone"],
              description:
                "True darkness blankets the arena, reducing movement speed by **10%** and dealing **stacking Shadow damage every 1 second** to all players. The darkness is only negated within 12 yards of a **Torchbearer** holding a Dawn Crystal.",
              whatToDo: "STAY WITHIN 12 YARDS OF A TORCHBEARER AT ALL TIMES",
              dangerText: "Stacking damage outside torch radius is quickly lethal",
              difficulties: ["normal", "heroic", "mythic"],
            },
            {
              name: "Torchbearer",
              icon: "🔦",
              type: "Assigned Role",
              roles: ["dps", "healer"],
              description:
                "Players holding **Dawn Crystals** become Torchbearers, creating a **12-yard safe zone** that protects allies from Midnight damage. **Dawnlight Barrier** can be activated for 99% damage reduction for up to 6 seconds but consumes the crystal. Assign 2-3 Torchbearers and spread evenly.",
              whatToDo: "TORCHBEARERS SPREAD EVENLY — SAVE DAWNLIGHT BARRIER FOR EMERGENCIES",
              difficulties: ["normal", "heroic", "mythic"],
            },
            {
              name: "Dark Constellation",
              icon: "⭐",
              type: "Dodge",
              roles: ["everyone"],
              description:
                "L'ura calls dark stars that impact marked locations. Stars deal damage at impact AND along lines connecting each star to others, creating a **network of damage beams**. Position between nodes to avoid the web.",
              whatToDo: "DODGE STAR IMPACTS AND THE BEAMS CONNECTING THEM",
              difficulties: ["normal", "heroic", "mythic"],
            },
            {
              name: "The Dark Archangel",
              icon: "👼",
              type: "Raid Damage",
              roles: ["healer", "everyone"],
              description:
                "L'ura transfigures into a godlike weapon and fires a **cataclysmic blast** dealing massive raid-wide damage. Use Dawnlight Barrier and healing cooldowns to survive.",
              whatToDo: "HEALING CDS + DAWNLIGHT BARRIER — PERSONAL DEFENSIVES",
              dangerText: "Without mitigation, this will kill most of the raid",
              difficulties: ["normal", "heroic", "mythic"],
            },
            {
              name: "Black Tide",
              icon: "🌊",
              type: "Dodge",
              roles: ["everyone"],
              description:
                "A void wave erupts from the Darkwell, dealing Cosmic damage and applying a shadow DoT to anyone hit. The wave travels outward — dodge to the side.",
              whatToDo: "DODGE THE WAVE — DON'T GET HIT BY THE EXPANDING TIDE",
              difficulties: ["heroic", "mythic"],
            },
          ],
        },
      ],
    },
  ],
};

// ═══════════════════════════════════════════════════════════════════════════
// PREVIOUS TIER: Liberation of Undermine
// ═══════════════════════════════════════════════════════════════════════════
const LIBERATION_OF_UNDERMINE: RaidTier = {
  slug: "liberation-of-undermine",
  name: "Liberation of Undermine",
  shortName: "Undermine",
  isCurrent: false,
  patch: "11.1",
  bosses: [
    {
      slug: "vexie-and-solarion",
      name: "Vexie and Solarion",
      bossNumber: 1,
      thumbnail: "",
      difficulties: ["normal", "heroic", "mythic"],
      fightOverview: [
        "Dual boss encounter — both must die within 15 seconds of each other.",
        "Manage **Static Charge** from Vexie and **Solar Flare** from Solarion.",
      ],
      quickStrat: [
        "Keep bosses balanced in HP — within 5% of each other",
        "Spread for Static Charge, stack for Solar Flare",
        "Kill both within 15 seconds or the survivor enrages",
      ],
      phases: [
        {
          name: "Full Fight",
          summary: "Dual target — balance HP and kill together",
          abilities: [
            {
              name: "Static Charge",
              icon: "⚡",
              type: "Spread",
              roles: ["everyone"],
              description: "Vexie applies **Static Charge** to random players. Spread at least 5 yards.",
              whatToDo: "SPREAD 5 YARDS WHEN DEBUFFED",
              difficulties: ["normal", "heroic", "mythic"],
            },
            {
              name: "Solar Flare",
              icon: "☀️",
              type: "Stack",
              roles: ["everyone"],
              description: "Solarion launches a **Solar Flare** — split damage that must be soaked by the whole raid.",
              whatToDo: "STACK ON THE MARKED LOCATION TO SPLIT DAMAGE",
              difficulties: ["normal", "heroic", "mythic"],
            },
          ],
        },
      ],
    },
    {
      slug: "cauldron-of-carnage",
      name: "Cauldron of Carnage",
      bossNumber: 2,
      thumbnail: "",
      difficulties: ["normal", "heroic", "mythic"],
      fightOverview: [
        "Arena-style fight with waves of adds and environmental hazards.",
        "Survive the gauntlet to unlock the boss phase.",
      ],
      quickStrat: [
        "Kill adds in priority order: Casters → Melee → Boss",
        "Avoid cauldron pools — they deal ticking damage",
        "Bloodlust when boss becomes active",
      ],
      phases: [
        {
          name: "Full Fight",
          summary: "Survive add waves, then burn the boss",
          abilities: [
            {
              name: "Cauldron Overflow",
              icon: "🧪",
              type: "Dodge",
              roles: ["everyone"],
              description: "Toxic pools spread across the floor. Standing in them deals **heavy Nature damage** per second.",
              whatToDo: "STAY OUT OF GREEN POOLS",
              difficulties: ["normal", "heroic", "mythic"],
            },
          ],
        },
      ],
    },
    {
      slug: "rik-reverb",
      name: "Rik Reverb",
      bossNumber: 3,
      thumbnail: "",
      difficulties: ["normal", "heroic", "mythic"],
      fightOverview: [
        "Sound-themed encounter with **Sonic Wave** dodging patterns.",
        "Players must manage a **Resonance** debuff that amplifies damage taken.",
      ],
      quickStrat: [
        "Dodge Sonic Waves — they sweep in patterns across the room",
        "Dispel Resonance at 3 stacks",
        "Tanks swap on Bass Drop",
      ],
      phases: [
        {
          name: "Full Fight",
          summary: "Dodge waves, manage Resonance debuff stacks",
          abilities: [
            {
              name: "Sonic Wave",
              icon: "🔊",
              type: "Dodge",
              roles: ["everyone"],
              description: "Waves of sound energy sweep across the room in patterns. Getting hit applies **Resonance** and deals damage.",
              whatToDo: "LEARN THE WAVE PATTERNS — DODGE OR GET STACKS",
              difficulties: ["normal", "heroic", "mythic"],
            },
          ],
        },
      ],
    },
    {
      slug: "stix-bunkjunker",
      name: "Stix Bunkjunker",
      bossNumber: 4,
      thumbnail: "",
      difficulties: ["normal", "heroic", "mythic"],
      fightOverview: [
        "Vehicle/turret encounter — players interact with environmental machinery.",
        "Coordinate turret usage with boss vulnerability windows.",
      ],
      quickStrat: [
        "Assign 2 players to turrets during vulnerability phase",
        "Everyone else handles adds",
        "Avoid Junk Toss — marked circles on the ground",
      ],
      phases: [
        {
          name: "Full Fight",
          summary: "Use turrets during vulnerability — handle adds between",
          abilities: [
            {
              name: "Junk Toss",
              icon: "🗑️",
              type: "Dodge",
              roles: ["everyone"],
              description: "Marked circles appear on the ground — heavy damage on impact.",
              whatToDo: "MOVE OUT OF MARKED CIRCLES",
              difficulties: ["normal", "heroic", "mythic"],
            },
          ],
        },
      ],
    },
    {
      slug: "the-onearmed-bandit",
      name: "The One-Armed Bandit",
      bossNumber: 5,
      thumbnail: "",
      difficulties: ["normal", "heroic", "mythic"],
      fightOverview: [
        "Slot-machine themed boss with randomized mechanic combinations.",
        "Each 'spin' triggers 2-3 simultaneous mechanics from a pool.",
      ],
      quickStrat: [
        "React to each spin — mechanics are semi-random",
        "Priority: handle Jackpot (soak) > Bust (spread) > Wild (dodge)",
        "Tanks swap on Loaded Dice",
      ],
      phases: [
        {
          name: "Full Fight",
          summary: "React to random mechanic combos from each spin",
          abilities: [
            {
              name: "Jackpot",
              icon: "🎰",
              type: "Soak",
              roles: ["everyone"],
              description: "Large soak circle — split damage among all players inside.",
              whatToDo: "STACK IN SOAK CIRCLE",
              difficulties: ["normal", "heroic", "mythic"],
            },
          ],
        },
      ],
    },
    {
      slug: "gallywix",
      name: "Gallywix",
      bossNumber: 6,
      thumbnail: "",
      difficulties: ["normal", "heroic", "mythic"],
      fightOverview: [
        "**Gallywix** is the final boss — multi-phase encounter with gold mechanics.",
        "Manage **Bribery** debuffs and coordinate **Investment** soaks.",
        "Phase 3 is a burn with escalating raid damage.",
      ],
      quickStrat: [
        "P1: Handle Bribery — dispel at edges",
        "P2: Soak Investment circles (3 per set)",
        "P3: Bloodlust and burn — save defensive CDs",
        "Tanks: swap on Golden Slam",
      ],
      phases: [
        {
          name: "Phase 1",
          summary: "Manage Bribery debuffs — 100% to 60%",
          abilities: [
            {
              name: "Bribery",
              icon: "💰",
              type: "Dispel",
              roles: ["healer"],
              description: "Random players get **Bribery** — mind-controlled for 8 seconds unless dispelled. Dispel drops a gold pile that must be avoided.",
              whatToDo: "DISPEL BRIBERY — DROP GOLD PILES AT EDGES",
              difficulties: ["normal", "heroic", "mythic"],
            },
          ],
        },
        {
          name: "Phase 2",
          summary: "Investment soaks — 60% to 30%",
          abilities: [
            {
              name: "Investment",
              icon: "📈",
              type: "Soak",
              roles: ["dps", "healer"],
              description: "3 gold circles appear — each must be soaked by 2+ players or they explode for raid-wide damage.",
              whatToDo: "SOAK ALL 3 CIRCLES — AT LEAST 2 PER CIRCLE",
              difficulties: ["normal", "heroic", "mythic"],
            },
          ],
        },
        {
          name: "Phase 3",
          summary: "Burn phase from 30% — escalating damage",
          abilities: [
            {
              name: "Golden Crescendo",
              icon: "✨",
              type: "Soft Enrage",
              roles: ["everyone"],
              description: "Pulsing raid damage that increases over time. Burn the boss before it overwhelms your healers.",
              whatToDo: "BLOODLUST — ALL COOLDOWNS — BURN",
              difficulties: ["normal", "heroic", "mythic"],
            },
          ],
        },
      ],
    },
  ],
};

// ═══════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════
export const RAID_TIERS: RaidTier[] = [
  THE_VOIDSPIRE,
  THE_DREAMRIFT,
  MARCH_ON_QUELDANAS,
  LIBERATION_OF_UNDERMINE,
];

export function getCurrentTiers(): RaidTier[] {
  return RAID_TIERS.filter((t) => t.isCurrent);
}

export function getCurrentTier(): RaidTier {
  return RAID_TIERS.find((t) => t.isCurrent) ?? RAID_TIERS[0];
}

export function getTierBySlug(slug: string): RaidTier | undefined {
  return RAID_TIERS.find((t) => t.slug === slug);
}

export function getBossBySlug(slug: string): { boss: Boss; tier: RaidTier } | undefined {
  for (const tier of RAID_TIERS) {
    const boss = tier.bosses.find((b) => b.slug === slug);
    if (boss) return { boss, tier };
  }
  return undefined;
}

export function getAllBossSlugs(): string[] {
  return RAID_TIERS.flatMap((t) => t.bosses.map((b) => b.slug));
}
