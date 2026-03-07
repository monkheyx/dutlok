// Type definitions for Blizzard API responses
// These are partial types covering the fields we actually use

export interface BlizzardGuildRoster {
  _links: { self: { href: string } };
  guild: {
    name: string;
    id: number;
    realm: { name: string; slug: string };
    faction: { type: string; name: string };
  };
  members: BlizzardGuildMember[];
}

export interface BlizzardGuildMember {
  character: {
    name: string;
    id: number;
    realm: { name: string; slug: string };
    level: number;
    playable_class: { id: number; name?: string };
    playable_race: { id: number; name?: string };
  };
  rank: number;
}

export interface BlizzardCharacterProfile {
  id: number;
  name: string;
  gender: { type: string; name: string };
  faction: { type: string; name: string };
  race: { name: string; id: number };
  character_class: { name: string; id: number };
  active_spec: { name: string; id: number };
  realm: { name: string; slug: string };
  guild?: { name: string; id: number; realm: { name: string; slug: string } };
  level: number;
  equipped_item_level: number;
  average_item_level: number;
  last_login_timestamp: number;
}

export interface BlizzardCharacterMedia {
  assets: Array<{
    key: string;
    value: string;
  }>;
  avatar_url?: string;
  bust_url?: string;
  render_url?: string;
}

export interface BlizzardEquipment {
  equipped_items: BlizzardEquipmentItem[];
}

export interface BlizzardEquipmentItem {
  slot: { type: string; name: string };
  item: { id: number; name?: string };
  name: string;
  quality: { type: string; name: string };
  level: { value: number; display_string: string };
  enchantments?: Array<{
    display_string: string;
    enchantment_id: number;
  }>;
  sockets?: Array<{
    socket_type: { type: string; name: string };
    item?: { id: number; name: string };
  }>;
  stats?: Array<{
    type: { type: string; name: string };
    value: number;
  }>;
  set?: { item_set: { name: string; id: number } };
}

export interface BlizzardStats {
  health: number;
  power: number;
  power_type: { name: string };
  strength: { base: number; effective: number };
  agility: { base: number; effective: number };
  intellect: { base: number; effective: number };
  stamina: { base: number; effective: number };
  melee_crit: { rating: number; rating_bonus: number; value: number };
  melee_haste: { rating: number; rating_bonus: number; value: number };
  mastery: { rating: number; rating_bonus: number; value: number };
  versatility: number;
  versatility_damage_done_bonus: number;
  versatility_damage_taken_bonus: number;
}

export interface BlizzardProfessions {
  primaries?: BlizzardProfessionEntry[];
  secondaries?: BlizzardProfessionEntry[];
}

export interface BlizzardProfessionEntry {
  profession: { name: string; id: number };
  tiers?: Array<{
    tier: { name: string; id: number };
    skill_points: number;
    max_skill_points: number;
  }>;
}

export interface BlizzardMythicKeystoneProfile {
  current_mythic_rating?: {
    color: { r: number; g: number; b: number; a: number };
    rating: number;
  };
  seasons?: Array<{
    key: { href: string };
    id: number;
  }>;
}
