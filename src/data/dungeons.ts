// ═══════════════════════════════════════════════════════════════════════════
// MYTHIC+ DUNGEON DATA — Midnight Season 1
// Sources: method.gg, wowhead, icy-veins — verified March 2026
// ═══════════════════════════════════════════════════════════════════════════

export interface DungeonBoss {
  name: string;
  mechanics: string[];
  tankTip?: string;
  healerTip?: string;
  dpsTip?: string;
  image?: string;
}

export interface Dungeon {
  slug: string;
  name: string;
  shortName: string;
  timer: number;
  bossCount: number;
  bosses: DungeonBoss[];
  trashTips: string[];
  keyTips: string[];
  isNew: boolean;
  expansion?: string;
}

export const DUNGEONS: Dungeon[] = [
  // ══════════════════════════════════════════
  // NEW MIDNIGHT DUNGEONS
  // ══════════════════════════════════════════
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
        image: "https://wow.zamimg.com/uploads/screenshots/normal/1260122-arcanotron-custos.jpg",
        mechanics: [
          "**Arcane Expulsion** — AoE knockback + drops a persistent puddle under the boss for 2 minutes. Reposition boss after each cast to avoid stacking puddles",
          "**Ethereal Shackles** — roots 2 random players in place. Requires **Magic dispel** or freedom effect to remove",
          "**Repulsing Slam** — arcane melee hit with knockback on the tank",
          "**Refueling Protocol** — cast at 0 energy. Spawns **Energy Orbs** that players must soak. Each soak applies **Unstable Energy** DoT stack. Use CDs here",
        ],
        tankTip: "Reposition boss after each Arcane Expulsion to avoid stacking puddles",
        healerTip: "Dispel Ethereal Shackles immediately — roots are dangerous near puddles",
        dpsTip: "Pop CDs during Refueling Protocol — boss is vulnerable",
      },
      {
        name: "Seranel Sunlash",
        image: "https://wow.zamimg.com/uploads/screenshots/normal/1260123-seranel-sunlash.jpg",
        mechanics: [
          "**Suppression Zone** — boss drops a zone underneath himself. Players MUST be inside to clear debuffs",
          "**Runic Mark** — debuff applied to players that must be cleared by entering the Suppression Zone",
          "**Null Reaction** — AoE burst when Runic Mark is cleared in the zone — spread slightly",
          "**Hastening Ward** — Magic buff increasing boss attack speed. **Purge/Spellsteal immediately** or use tank defensives",
          "**Wave Of Silence** — step into Suppression Zone just before cast finishes to avoid 8-second pacify",
        ],
        tankTip: "Defensive if Hastening Ward can't be purged — attack speed buff is dangerous",
        healerTip: "Purge Hastening Ward if possible. Dispel is critical on this boss",
        dpsTip: "Step into Suppression Zone before Wave of Silence finishes to avoid pacify",
      },
      {
        name: "Gemellus",
        image: "https://wow.zamimg.com/uploads/screenshots/normal/1260125-gemellus.jpg",
        mechanics: [
          "**Triplicate** — at pull and at 50% HP, boss splits into 3 clones that share a health pool. Cleave all 3 to damage efficiently",
          "**Neural Link** — debuff tethering you to a specific clone. Run to that clone and touch it to remove both your debuff and the clone's shield",
          "**Cosmic Sting** — targets a player and leaves a puddle underneath them. Move out immediately",
          "**Astral Grasp** — pulls all players toward the boss. Run away to resist the pull",
        ],
        dpsTip: "Cleave is king — save AoE CDs for Triplicate phases. Neural Link clears clone shields",
        healerTip: "Heavy AoE damage during clone phase — be ready with CDs",
      },
      {
        name: "Degentrius",
        image: "https://wow.zamimg.com/uploads/screenshots/normal/1260126-degentrius.jpg",
        mechanics: [
          "**Void Torrent** — beam splits the arena in half. Players must position on both sides for soaks",
          "**Unstable Void Essence** — soak circles that appear on both sides of the beam. Must be soaked by players on that side or they explode",
          "**Hulking Fragment** — hit that applies a **Magic DoT** — must be dispelled",
          "**Devouring Entropy** — debuffs random players with staggered durations. Spread to avoid overlap",
          "Below **30%** — Void Essence spawns faster, arena fills with puddles. This is the burn window",
        ],
        tankTip: "Keep boss centered so beam splits arena evenly. Position for equal soak groups",
        healerTip: "Dispel Hulking Fragment immediately. Sub-30% is a healing check — rotate CDs",
        dpsTip: "Save lust for sub-30% burn. Don't greed on wrong side of the beam",
      },
    ],
    trashTips: [
      "**Arcane Tender** — interrupt **Nourish** (heal) and **Arcane Bolt** (damage). Priority kick targets",
      "**Sunguard Mender** — interrupt **Flash of Light** or it heals for huge amounts",
      "Puddles from Arcane Expulsion persist 2 minutes — plan boss positioning early",
      "Timer is forgiving at 33 minutes but boss wipes are costly — play safe on trash",
    ],
    keyTips: [
      "33-minute timer — comfortable if you avoid boss wipes",
      "Boss mechanics are the main challenge, not trash density",
      "Degentrius sub-30% is the hardest moment — save Bloodlust",
      "Dispels and purges are extremely valuable in this dungeon",
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
        image: "https://wow.zamimg.com/uploads/screenshots/normal/1261458-murojin.jpg",
        mechanics: [
          "**Revive Pet** — Muro'jin will revive Nekraxx when she dies. **Bestial Wrath** — Nekraxx gains stacking damage buff when Muro'jin dies. Kill evenly",
          "**Freezing Trap** — ice traps on the ground. During **Carrion Swoop**, lure Nekraxx into a trap to stun her",
          "**Flanking Spear** — tank bleed requiring a defensive cooldown or cleanse",
          "**Infected Pinions** — **Disease** debuff spread to group. Dispel immediately to reduce damage",
          "**Barrage** — frontal channel applying a Magic slow. Targeted player stands still so others can dodge",
          "**Fetid Quillstorm** — circular ground effects. Move out of the marked areas",
        ],
        tankTip: "Defensive for Flanking Spear — the bleed ticks hard. Keep bosses together for cleave",
        healerTip: "Disease dispel Infected Pinions ASAP. Heavy sustained damage on this fight",
        dpsTip: "Balance damage evenly. Don't tunnel one boss — the other enrages",
      },
      {
        name: "Vordaza",
        image: "https://wow.zamimg.com/uploads/screenshots/normal/1261461-vordaza.jpg",
        mechanics: [
          "**Wrest Phantoms** — spawns phantom adds that need to be kited into each other to collide and explode. Stagger detonations — wait for the DoT from the first pair to expire before triggering the second",
          "**Withering Miasma** — constant passive group damage throughout the fight. Healers must pace mana",
          "**Drain Soul** — tank-targeted channel. Use a major defensive cooldown",
          "**Unmake** — frontal sweep hitting all players in a cone. Dodge immediately",
        ],
        tankTip: "Save big defensive for Drain Soul channel",
        healerTip: "Withering Miasma is constant — pace your mana. Don't panic heal early",
        dpsTip: "Kite phantoms carefully — colliding them too fast stacks DoTs and kills you",
      },
      {
        name: "Rak'tul, Vessel of Souls",
        image: "https://wow.zamimg.com/uploads/screenshots/normal/1261462-raktul.jpg",
        mechanics: [
          "**Spiritbreaker** — launches tank into air, pummels with physical hits, then delivers empowered shadow blow. The final impact leaves **Spectral Decay** patches. Use strongest defensive CDs",
          "**Crush Souls** — boss leaps and slams repeatedly, planting **Soulbind Totems** that pull nearby players. Run away from totems as they spawn",
          "**Deathgorged Vessel** — every 6 seconds releases soul energy dealing shadow damage to all players and ejecting **Volatile Essences** that explode after a delay",
          "**Soulrending Roar** (intermission) — casts all players' souls into the Restless Masses. Shatters all Soulbind Totems for heavy group damage. Boss is **stunned for 45 seconds** — this is your burn window",
        ],
        tankTip: "Use your biggest defensive for Spiritbreaker combo — it's the deadliest tank hit in the dungeon",
        healerTip: "Soulrending Roar deals massive group damage from totem shatters — pre-cast healing CDs",
        dpsTip: "BURN during 45-second stun after Soulrending Roar — this is your Bloodlust window",
      },
    ],
    trashTips: [
      "**Dread Souleater** — CC-immune healer mob. Manage **Necrotic Wave** healing absorb on your tank",
      "**Hex Guardian** — CC-immune with constant AoE pulse. Coordinate defensives for **Magma Surge**",
      "Interrupt: **Shrink** (Umbral Shadowbinder), **Hex** (Ritual Hexxer), **Spirit Rend** (Tormented Shade)",
      "Disease dispels are extremely valuable throughout the entire dungeon",
    ],
    keyTips: [
      "High trash damage — bring strong AoE healing and defensives",
      "Rak'tul intermission is a common wipe point — know the totem positions",
      "Disease dispels and poison cleanses are both needed",
      "Boss 1 requires even damage — coordinate DPS switching",
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
        image: "https://wow.zamimg.com/uploads/screenshots/normal/1263324-kasreth.jpg",
        mechanics: [
          "**Leyline Array** — beams shoot across the room. AVOID unless you have **Reflux Charge** debuff — then stand at beam intersections to disable them",
          "**Flux Collapse** — bait puddles toward room edges. Applies healing absorb + knockback",
          "**Corespark Detonation** — additional puddles with knockback and healing absorb. Drop at edges",
          "**Arcane Zap** — replaces melee swings. Deals **Magic damage** on tank — use Magic DR, not physical",
        ],
        tankTip: "Arcane Zap deals MAGIC damage — use anti-magic cooldowns, not physical DR",
        healerTip: "Heal through Flux Collapse absorb shields quickly before next damage event",
        dpsTip: "If you have Reflux Charge, step into beam intersections to disable Leyline Arrays",
      },
      {
        name: "Corewarden Nysarra",
        image: "https://wow.zamimg.com/uploads/screenshots/normal/1262215-corewarden-nysarra.jpg",
        mechanics: [
          "**Null Vanguard** — spawns a **Dreadflail** add + 2 **Grand Nullifiers**. Interrupt ALL Nullify casts or adds become empowered",
          "**Lightscar Flare** — creates a light frontal. Stand in it for **300% damage amplification**. Kill adds before channel ends. **Devour The Unworthy** consumes remaining adds when flare ends",
          "**Eclipsing Step** — targets 2 players with cleave damage + DoT. Spread away from allies and use defensives",
          "**Umbral Lash** — tank hit, especially dangerous with active adds. Defensive when adds are up",
        ],
        tankTip: "Position Dreadflail away from group. Use defensive for Umbral Lash when adds are active",
        healerTip: "Eclipsing Step targets need immediate healing — the DoT is lethal without attention",
        dpsTip: "STACK in Lightscar Flare for 300% damage — this is your BIGGEST burn window. Kill adds here",
      },
      {
        name: "Lothraxion",
        image: "https://wow.zamimg.com/uploads/screenshots/normal/1262217-lothraxion.jpg",
        mechanics: [
          "**Searing Rend** — tank puddle that persists the **entire fight**. Drop at room edges — they never despawn",
          "**Brilliant Dispersion** — targets 3 players, each spawning 2 **Fractured Images**. Spread to avoid cleaving allies. Images deal **Mirrored Rend** to nearby players and dash around via **Flicker**",
          "**Divine Guile** — at full energy, boss disguises among images. Find and interrupt the one **WITHOUT light horns** to return to boss phase. Interrupting wrong image triggers **Core Exposure** penalty",
        ],
        tankTip: "Drop Searing Rend puddles at edges — they NEVER despawn. Fight gets harder over time",
        healerTip: "Dispel Burning Radiance (magic) quickly. Sustained damage ramps through the fight",
        dpsTip: "During Divine Guile — look for the image WITHOUT light horns and interrupt it. Don't guess wrong",
      },
    ],
    trashTips: [
      "**Flux Engineer** — drops **Mana Battery** on death. Swap to it immediately for a damage buff",
      "**Reformed Voidling** — turns into **Smudge** trying to awaken Dreadflail. CC and cleave down fast",
      "**Grand Nullifier** — must interrupt every **Nullify** cast — assign kick targets",
      "Three-wing layout (West/East/North) — kill both wing bosses to unlock Lothraxion",
    ],
    keyTips: [
      "Nysarra's Lightscar Flare 300% damage amp is the biggest DPS window in the dungeon pool. Coordinate burst CDs",
      "Lothraxion's puddles never despawn — the fight is a soft enrage",
      "Interrupt discipline is critical — failed kicks snowball fast on Nullifiers",
      "Three-wing layout with conduits back to start between wings",
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
        image: "https://wow.zamimg.com/uploads/screenshots/normal/1263239-emberdawn.jpg",
        mechanics: [
          "**Flaming Updraft** — debuffs 2 players. Move to the absolute outside edge of the arena to drop puddles. Puddles persist and spawn **Flaming Twisters**",
          "**Burning Gale** (intermission at 100 energy) — boss flies up, pulls all players toward center, rotates, and breathes **Fire Breath** counter-clockwise starting on tank",
          "**Searing Beak** — tank hit with both initial damage AND a DoT component. Use defensive for both",
        ],
        tankTip: "Defensive for every Searing Beak — the DoT portion is as dangerous as the initial hit",
        healerTip: "Heavy group damage during Burning Gale intermission — pre-cast healing CDs",
        dpsTip: "Bait Flaming Updraft puddles to edges to preserve arena space",
      },
      {
        name: "Derelict Duo (Kalis & Latch)",
        image: "https://wow.zamimg.com/uploads/screenshots/normal/1263238-kalis.jpg",
        mechanics: [
          "Cleave bosses evenly — remaining boss gains **Broken Bond** stacking damage buff when partner dies",
          "**Shadow Bolt** (Kalis) — must be interrupted consistently. Assign a kick rotation",
          "**Curse of Darkness** (Kalis) — curse debuff requiring **curse dispel** or it deals heavy damage",
          "**Heaving Yank** (Latch) — fixates a player. Run behind Kalis to redirect damage away from group",
          "**Splattering Spew** (Latch) — targets multiple players. Spread loosely around arena edges",
          "**Bone Hack** (Latch) — tank channel requiring defensive cooldown",
        ],
        tankTip: "Defensive for Bone Hack channel. Keep bosses stacked for cleave",
        healerTip: "Curse dispels are critical — Curse of Darkness will kill if not removed",
        dpsTip: "Balance damage between both targets — check health regularly. Don't tunnel one",
      },
      {
        name: "Commander Kroluk",
        image: "https://wow.zamimg.com/uploads/screenshots/normal/1263243-commander-kroluk.jpg",
        mechanics: [
          "**Reckless Leap** — targets the furthest player. Coordinate: one designated player uses a defensive first, then tank soaks second leap",
          "**Rampage** — tank channel requiring defensive cooldown",
          "**Intimidating Shout** — stand near at least one ally when cast (don't need to full stack, just be near someone)",
          "**Rallying Bellow** — spawns adds at **66%** and **33%** HP. Pick up and cleave down quickly",
        ],
        tankTip: "Defensive for Rampage channel. Pick up adds quickly at 66% and 33%",
        dpsTip: "Stay near an ally for Intimidating Shout. Designated furthest player soaks Reckless Leap with a personal",
      },
      {
        name: "The Restless Heart",
        image: "https://wow.zamimg.com/uploads/screenshots/normal/1263245-restless-heart.jpg",
        mechanics: [
          "**Squall Leap** — boss leaps dealing Nature damage and applying a **stacking DoT with no timer**. Stacks removed ONLY by touching **Turbulent Arrows** from Arrow Rain",
          "**Arrow Rain** — shoots arrows that form **Turbulent Arrows** on the ground. Touch them to remove Squall Leap stacks. Detonation knocks you up",
          "**Bolt Gale** — frontal cone channel for 5 seconds dealing heavy damage. Move out of the cone immediately",
          "**Bullseye Windblast** — fires arrow at a location dealing damage in 20 yards and forming **Billowing Wind** rings. Avoid the expanding ring (5-second stun on contact)",
          "**Storming Soulfont** — storm pools that deal damage to players standing in them. Use **Gust Shot** to clear them",
        ],
        tankTip: "Position boss to create accessible Turbulent Arrows for the group to clear stacks",
        healerTip: "Squall Leap stacks ramp infinitely — ensure team clears them on arrows or they'll die",
        dpsTip: "Most mechanically demanding boss in the dungeon. Prioritize clearing Squall Leap stacks over DPS",
      },
    ],
    trashTips: [
      "Brisk dungeon with moderate trash density — keep moving between pulls",
      "Several packs have dangerous frontals — position carefully as melee",
      "Interrupt priority casts to reduce healer pressure",
      "Watch for patrol packs in narrow stairwells",
    ],
    keyTips: [
      "30-minute timer — fast-paced dungeon requiring clean execution",
      "Restless Heart is the wall boss — Squall Leap management is everything",
      "Emberdawn tornado placement can make or break the arena space",
      "Kroluk adds at 66% and 33% require immediate attention",
    ],
  },

  // ══════════════════════════════════════════
  // LEGACY DUNGEONS
  // ══════════════════════════════════════════
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
        image: "https://wow.zamimg.com/uploads/screenshots/normal/147171-forgemaster-garfrost.jpg",
        mechanics: [
          "**Throw Saronite** — targets 2 players with circles. Don't overlap circles and avoid cleaving allies. Creates destructible **Ore Chunks** on impact",
          "**Orebreaker** — tank-targeted AoE that **stuns for 8 seconds** unless tank overlaps with an Ore Chunk to destroy it",
          "**Glacial Overload** — boss channels into the nearest forge. Hide behind a remaining Ore Chunk for protection or take lethal frost damage",
          "**Cryostomp** — destroys remaining chunks, applies **Magic debuff** to 2 players requiring dispel",
          "**Siphoning Chill** — passive increasing damage to debuffed targets. Don't let debuffs stack",
        ],
        tankTip: "Stand near an Ore Chunk before Orebreaker or you get stunned for 8 seconds",
        healerTip: "Dispel Cryostomp Magic debuffs immediately — Siphoning Chill amplifies damage on debuffed players",
        dpsTip: "Don't destroy Ore Chunks early — they're needed for Glacial Overload protection",
      },
      {
        name: "Ick and Krick",
        image: "https://wow.zamimg.com/uploads/screenshots/normal/147172-ick.jpg",
        mechanics: [
          "**Shade Shift** — creates 2 **Shades of Krick** adds nearby. Tank drags boss to them for cleave. Interrupt **Death Bolt** from adds (random target). Dispel **curse** debuffs",
          "**Blight Smash** — tank hit creating a puddle. Move boss out of it",
          "**Plague Explosion** — 4 random players get puddles underneath. Spread out to avoid overlap",
          "**Get 'em, Ick!** — fixates random player for 7 seconds. Kite away. Happens 4 times over 28 seconds",
          "**Necrolink** — bosses share health. Cleave to maximize damage",
        ],
        tankTip: "Drag boss to Shade of Krick adds for cleave. Move out of Blight Smash puddles",
        healerTip: "Dispel curses from Shade adds. Heavy damage during Get 'em fixate if target can't kite",
        dpsTip: "Interrupt Death Bolt from Shade adds. Cleave boss + adds together",
      },
      {
        name: "Scourgelord Tyrannus",
        image: "https://wow.zamimg.com/uploads/screenshots/normal/432790-scourgelord-tyrannus-scourgelord-tyrannus-after-patch-6-0.jpg",
        mechanics: [
          "**Rime Blast** — targets each non-tank player once per phase. Aim the projectile at **Bone Piles** (marked with green light pillars) to prevent empowered adds from spawning",
          "**Army Of The Dead** — activates remaining Bone Piles spawning **Rotlings** (stacking disease on tank) and **Plaguespreaders** (heavy group damage + interruptible **Plague Bolt**)",
          "**Scourgelord's Brand** — tank knockback followed by a leap. Use a major defensive",
          "**Death's Grasp** — creates avoidable circles on the ground",
          "**Ice Barrage** — channel creating additional circle patterns to dodge",
        ],
        tankTip: "Defensive for Scourgelord's Brand combo. Manage Rotling disease stacks — dispel when high",
        healerTip: "Disease dispel is critical for tank Rotling stacks. Interrupt Plague Bolt from Plaguespreaders",
        dpsTip: "Aim Rime Blast at Bone Piles to prevent add spawns. This drastically reduces fight difficulty",
      },
    ],
    trashTips: [
      "Gauntlet section before Tyrannus — **falling ice** deals massive damage. Keep moving forward",
      "Interrupt **Howling Blast** and **Frostbolt** from caster trash packs",
      "**Ymirjar Wrathbringers** have a deadly frontal — melee stay at flanks",
      "Disease dispels are needed throughout the dungeon",
    ],
    keyTips: [
      "Rime Blast → Bone Pile aiming is the #1 skill check. Practice it",
      "Garfrost Ore Chunk management is critical — save chunks for Glacial Overload",
      "30-minute timer — moderate trash but punishing boss wipes",
      "Disease dispels and curse dispels both needed",
    ],
  },
  {
    slug: "seat-of-the-triumvirate",
    name: "Seat of the Triumvirate",
    shortName: "SotT",
    timer: 34,
    bossCount: 4,
    isNew: false,
    expansion: "Legion",
    bosses: [
      {
        name: "Zuraal the Ascended",
        image: "https://wow.zamimg.com/uploads/screenshots/normal/674585-zuraal-the-ascended.jpg",
        mechanics: [
          "**Decimate** — targets random player, boss leaps to them creating a puddle. Move to edge before impact",
          "**Void Slash** — tank combo requiring defensive cooldown. Heavy physical damage",
          "**Null Palm** — random-target frontal. Don't stand between boss and random players",
          "**Oozing Slam** — applies group DoT and spawns 2 **Coalesced Void** mobs that rush toward the boss. If they reach him they **explode for lethal damage**. Slow, stun, or knock them back",
          "**Crashing Void** — speeds up Coalesced Void mobs AND pulls players toward the boss before exploding",
        ],
        tankTip: "Defensive for Void Slash combo. Position boss away from Coalesced Void spawn points",
        healerTip: "Oozing Slam DoT + Crashing Void pull is the lethal combo — have CDs ready",
        dpsTip: "Slow/stun Coalesced Void mobs immediately. If they reach the boss, it's a wipe",
      },
      {
        name: "Saprish",
        image: "https://wow.zamimg.com/uploads/screenshots/normal/674586-saprish.jpg",
        mechanics: [
          "**Void Bomb** — spawned hazards around the arena. Avoid or soak strategically",
          "**Phase Dash** — boss dashes through the arena. Creates damage circles — use to cleave Void Bombs",
          "**Overload** — raid-wide damage + DoT. Group must be topped before cast finishes",
          "**Dread Screech** (Shadewing pet) — interruptible cast. Assign a ranged player to kick every even cast",
          "**Shadow Pounce** (Darkfang pet) — random target damage from the second pet",
        ],
        tankTip: "Position boss to let Phase Dash cleave Void Bombs for space management",
        healerTip: "Top group before Overload finishes or the DoT afterward will kill low-HP players",
        dpsTip: "Assigned ranged player must reliably kick Dread Screech from Shadewing pet",
      },
      {
        name: "Viceroy Nezhar",
        image: "https://wow.zamimg.com/uploads/screenshots/normal/674589-viceroy-nezhar.jpg",
        mechanics: [
          "**Gates of the Abyss** — spawns **Umbral Waves** hazards that move across the arena. Dodge between them",
          "**Mass Void Infusion** — targets 3 players with void orbs. Spread to avoid overlapping damage",
          "**Mind Blast** — tank-targeted cast requiring interrupt rotation. If not interrupted, deals massive damage",
          "**Umbral Tentacles** — spawn in sets of 5, each channeling **Mind Flay** into a different player. Kill quickly",
          "**Collapsing Void** — heavy group damage. Move underneath the boss to minimize damage taken",
        ],
        tankTip: "Interrupt Mind Blast — every missed interrupt is a potential death. Have backup kicks assigned",
        healerTip: "Umbral Tentacles Mind Flay on 5 targets simultaneously is extreme healing pressure",
        dpsTip: "Kill Umbral Tentacles immediately — 5 simultaneous Mind Flays will overwhelm healing fast",
      },
      {
        name: "L'ura",
        image: "https://wow.zamimg.com/uploads/screenshots/normal/1004407-lura.jpg",
        mechanics: [
          "**Dirge of Despair** — group hit that spawns 6 **Notes of Despair** around the arena",
          "**Discordant Beam** — players gain a beam that shoots at active Notes to silence them. Aim carefully",
          "**Grim Chorus** — creates dangerous circles around active Notes and applies **Anguish** debuff",
          "**Disintegrate** — creates beams that rotate around the boss. Dodge the sweeping beams",
          "**Abyssal Lance** — tank stacking debuff. Use defensive at 3 stacks. Swap if possible",
          "Notes spawn slowly early but accelerate as L'ura drops below 50% — multiple spawn simultaneously",
        ],
        tankTip: "Defensive at 3 stacks of Abyssal Lance. Position boss so beams are predictable",
        healerTip: "Anguish stacks from Grim Chorus ramp hard below 50%. Save major CDs for sub-50%",
        dpsTip: "Aim Discordant Beam at Notes to silence them. Below 50%, Notes spawn faster — prioritize them",
      },
    ],
    trashTips: [
      "**Shadowguard Champion** — heavy melee damage with dangerous frontals. Face away from group",
      "Void-themed caster mobs have many interruptible casts — bring multiple kicks",
      "Watch for patrols in narrow corridors — pulling extras is deadly",
      "Several trash packs apply shadow DoTs — dispel priority",
    ],
    keyTips: [
      "34-minute timer — longest dungeon in the pool. Don't panic on time",
      "Coalesced Void on Zuraal is the #1 wipe mechanic — slow/stun them or wipe",
      "L'ura below 50% is a healing check — Note management is critical",
      "Shadow dispels and interrupt assignments are essential",
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
        image: "https://wow.zamimg.com/uploads/screenshots/normal/1273991-ranjit.jpg",
        mechanics: [
          "**Gale Surge** — creates wind orbs that knock players. Position to avoid being pushed off the platform (instant death)",
          "**Fan Of Blades** — bleeding applied to all players. Requires healing CDs or bleed removal abilities",
          "At max energy: launches **multiple tornado waves** that rotate around the room for 20 seconds. Where tornado waves **converge = instant kill zone**. Find the safe gap",
          "**Wind Chakram** — projectile fired at random player that returns to boss. Dodge both directions. **Chakram Vortex** spawns tornadoes along its path",
        ],
        tankTip: "Position boss so knockbacks don't push anyone off the platform",
        healerTip: "Fan Of Blades bleeds the entire group — prep healing CDs",
        dpsTip: "Find the gap in converging tornadoes — the intersection is instant death",
      },
      {
        name: "Araknath",
        image: "https://wow.zamimg.com/uploads/screenshots/normal/1273992-araknath.jpg",
        mechanics: [
          "**Energize** — 3 beams from Lesser Constructs constantly point at the boss, healing him and building damage stacks. **Non-tank players must stand in beams** to intercept using personals. If beams connect, fight becomes unkillable",
          "**Blast Wave** — prevented by tank staying in melee range at all times",
          "**Defensive Protocol** — 5-yard AoE underneath boss. All players step out briefly",
          "**Fiery Smash** — line attack on tank. Position away from other players",
          "**Supernova** — high damage at full energy. Increased if Energize beams were connecting",
          "**Heart Exhaustion** — frontal AoE after Energize channel ends",
        ],
        tankTip: "Stay in melee range at all times or Blast Wave fires. Dodge Defensive Protocol circle briefly",
        healerTip: "Players soaking beams take heavy damage — rotate heals on beam soakers",
        dpsTip: "DPS accountability check — if nobody soaks beams, boss heals and the fight spirals into a wipe",
      },
      {
        name: "Rukhran",
        image: "https://wow.zamimg.com/uploads/screenshots/normal/455577-rukhran.jpg",
        mechanics: [
          "**Sunbreak** — summons a **Sunwing** add with **Burning Pursuit** fixate. Kill away from eggs or they hatch",
          "**Searing Quills** — raid-wide damage. Hide behind the central pillar to avoid",
          "**Burning Claws** — tank hit requiring defensive per cast",
          "**Screech** — cast when tank leaves melee range. Stay on the boss",
        ],
        tankTip: "Defensive for every Burning Claws. Don't leave melee range or Screech fires",
        healerTip: "Call out Searing Quills so group hides behind pillar",
        dpsTip: "Kill Sunwing adds away from eggs. Stack DPS when no add is active",
      },
      {
        name: "High Sage Viryx",
        image: "https://wow.zamimg.com/uploads/screenshots/normal/435229-high-sage-viryx.jpg",
        mechanics: [
          "**Scorching Ray** — targets 3 players for heavy sustained damage. Spread and use personals",
          "**Cast Down** — pulls random player toward platform edge. **Run toward entrance/center** to maximize distance. If pulled off = instant death",
          "**Lens Flare** — chases targeted player leaving a fire trail. Use movement CDs and run toward platform sides",
          "**Solar Blast** — interruptible cast. Coordinate interrupt rotation to reduce tank damage",
        ],
        tankTip: "Interrupt Solar Blast. Position boss center so Cast Down targets have room to run",
        healerTip: "Scorching Ray on 3 targets is heavy healing. Watch for Cast Down pulling someone off edge",
        dpsTip: "Interrupt Solar Blast in rotation. If targeted by Cast Down, RUN toward center immediately",
      },
    ],
    trashTips: [
      "Open platforms — **falling off edges is instant death**. Watch for knockbacks from every mob",
      "**Solar Zealots** — interrupt **Solar Detonation** or the AoE will kill low-HP players",
      "Wind constructs push players — position with walls/railings behind you",
      "Relatively linear trash but tight platforms make positioning critical",
    ],
    keyTips: [
      "25-minute timer — shortest dungeon in the rotation. No room for wipes",
      "Cast Down on Viryx kills if you get pulled off — this is the #1 death cause",
      "Araknath beam soaking is non-negotiable — assign players to intercept",
      "Every platform has fall-off death risk. Respect knockbacks",
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
        name: "Overgrown Ancient",
        image: "https://wow.zamimg.com/uploads/screenshots/normal/1180066-overgrown-ancient.jpg",
        mechanics: [
          "**Germinate** — channels to spawn **Ancient Branch** adds. Keep adds stacked for cleave. Interrupt **Healing Touch** from branches immediately",
          "**Splinterbark** — bleed debuff on players. Standing in **Abundance** circle (created when adds die) cleanses it",
          "**Burst Forth** — at 100 energy, activates dormant **Hungry Lashers**. They apply stacking **Lasher Toxin** (poison — dispel!)",
          "**Barkbreaker** — tank physical damage amp debuff. Use defensive when stacks are high",
        ],
        tankTip: "Defensive for Barkbreaker stacks. Position adds for cleave during Germinate",
        healerTip: "Dispel Lasher Toxin poison stacks. Interrupt Healing Touch from branch adds",
        dpsTip: "Interrupt Healing Touch from Ancient Branch adds immediately — it heals for huge amounts",
      },
      {
        name: "Crawth",
        image: "https://wow.zamimg.com/uploads/screenshots/normal/1180067-crawth.jpg",
        mechanics: [
          "**Savage Peck** — tank hit with a DoT (NOT a bleed). Use defensive for every hit",
          "**Overpowering Gust** — random-target frontal. Sidestep immediately",
          "**Deafening Screech** — group damage. Spread loosely to avoid splash. Applies a stacking DoT",
          "**Ruinous Winds** (at 75% and 45%) — interruptible ONLY by kicking 3 balls into goals:",
          "  → **Goal Of The Rushing Winds** triggers patrolling tornadoes + pushback winds + damage Motes",
          "  → **Goal Of The Searing Blaze** triggers 12-second damage amp + pulsing fire + fire circles",
        ],
        tankTip: "Defensive for every Savage Peck. Position boss so kicks are easy to aim at goals",
        healerTip: "Deafening Screech DoT stacks — spread group to minimize splash before each cast",
        dpsTip: "Kick balls into goals to interrupt Ruinous Winds. Searing Blaze goal = 12s damage amp window",
      },
      {
        name: "Vexamus",
        image: "https://wow.zamimg.com/uploads/screenshots/normal/1180068-vexamus.jpg",
        mechanics: [
          "**Arcane Orbs** — 5 spawn and move toward boss. Spread and **soak before they reach boss** or he gains **Oversurge** stacking buff. Each soak applies **Oversurge** debuff to soaker — limits how many one person can take",
          "**Arcane Expulsion** — tank frontal. Point away from group and use defensive",
          "**Mana Bombs** — targets 3 players with circles. Move to room edges to drop puddles",
          "**Arcane Fissure** (at 100 energy) — pushback + initial hit. Dodge 3 circles that appear under feet",
        ],
        tankTip: "Point Arcane Expulsion away from group. Use defensive for the hit",
        healerTip: "Orb soaking applies Oversurge debuff — soakers take increased arcane damage after",
        dpsTip: "Soak orbs before they reach boss — each one that reaches him makes the fight harder. Spread soakers",
      },
      {
        name: "Echo of Doragosa",
        image: "https://wow.zamimg.com/uploads/screenshots/normal/1166427-echo-of-doragosa.jpg",
        mechanics: [
          "**Unleash Energy** — immediate cast on pull. Pull boss toward entrance to avoid **Arcane Rifts** spawning in bad spots",
          "**Overwhelming Power** — stacking debuff from any boss hit. At **3 stacks** creates an Arcane Rift under you. Manage stacks by avoiding unnecessary damage",
          "**Energy Bomb** — targets random player. Spread loosely so splash doesn't stack others",
          "**Power Vacuum** — pulls all players toward boss. Tank positions to avoid rifts during pull",
          "**Astral Blast** — tank cast requiring defensive",
          "**Uncontrolled Energy** — orbs fire from rifts. Dodge them — each hit adds Overwhelming Power stacks",
        ],
        tankTip: "Pull boss toward entrance on pull. Defensive for Astral Blast. Position away from rifts during Power Vacuum",
        healerTip: "At 3 Overwhelming Power stacks, players spawn rifts. Watch for stacks ramping",
        dpsTip: "Dodge Uncontrolled Energy orbs — each hit stacks Overwhelming Power and at 3 stacks you spawn a rift",
      },
    ],
    trashTips: [
      "**Vile Lasher** — CC-immune. Vile Bite stacking bleed on tank + **Detonation Seeds** swirls on ground",
      "**Guardian Sentry** — CC-immune. **Expel Intruders** = group knockback, LoS or run out",
      "**Unruly Textbook** — **Monotonous Lecture** channel. Interrupt, CC, or Magic dispel to cancel",
      "**Corrupted Manafiend** — interrupt **Surge**. **Mana Void** targets 2 players with circles",
      "**Arcane Ravager** — leaps to furthest player with **Vicious Ambush** then breathes a frontal",
    ],
    keyTips: [
      "32-minute timer — comfortable if clean. Wipes cost a lot on this dungeon",
      "Crawth ball-kicking mechanic provides huge value — don't miss goals",
      "Vexamus orb soaking is the most common fail point. Assign soak order",
      "Echo of Doragosa rift management is the soft enrage — don't stack Overwhelming Power",
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
