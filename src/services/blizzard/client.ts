/**
 * Blizzard Battle.net API client
 *
 * Handles OAuth token management and provides methods for
 * fetching character profiles, guild rosters, and related data.
 *
 * API docs: https://develop.battle.net/documentation/world-of-warcraft
 */

interface BlizzardToken {
  accessToken: string;
  expiresAt: number;
}

interface ApiOptions {
  namespace?: "profile" | "static" | "dynamic";
  locale?: string;
}

let cachedToken: BlizzardToken | null = null;

const REGION = () => process.env.BLIZZARD_REGION || "us";

function getApiBase(): string {
  const region = REGION();
  if (region === "cn") return "https://gateway.battlenet.com.cn";
  return `https://${region}.api.blizzard.com`;
}

function getTokenUrl(): string {
  const region = REGION();
  if (region === "cn") return "https://oauth.battlenet.com.cn/token";
  return `https://oauth.battle.net/token`;
}

function getNamespace(ns: string): string {
  return `${ns}-${REGION()}`;
}

async function getAccessToken(): Promise<string> {
  if (cachedToken && Date.now() < cachedToken.expiresAt - 60000) {
    return cachedToken.accessToken;
  }

  const clientId = process.env.BLIZZARD_CLIENT_ID;
  const clientSecret = process.env.BLIZZARD_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("Missing BLIZZARD_CLIENT_ID or BLIZZARD_CLIENT_SECRET environment variables");
  }

  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

  const res = await fetch(getTokenUrl(), {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Failed to get Blizzard access token: ${res.status} ${body}`);
  }

  const data = await res.json();

  cachedToken = {
    accessToken: data.access_token,
    expiresAt: Date.now() + data.expires_in * 1000,
  };

  return cachedToken.accessToken;
}

async function apiRequest<T = unknown>(path: string, options: ApiOptions = {}): Promise<T> {
  const token = await getAccessToken();
  const base = getApiBase();
  const ns = options.namespace || "profile";
  const locale = options.locale || "en_US";

  const url = new URL(path, base);
  url.searchParams.set("namespace", getNamespace(ns));
  url.searchParams.set("locale", locale);

  const res = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Blizzard API error ${res.status} for ${path}: ${body}`);
  }

  return res.json() as Promise<T>;
}

// --- Public API Methods ---

export async function getGuildRoster(realmSlug: string, guildNameSlug: string) {
  return apiRequest(`/data/wow/guild/${realmSlug}/${guildNameSlug}/roster`, {
    namespace: "profile",
  });
}

export async function getCharacterProfile(realmSlug: string, characterName: string) {
  const name = characterName.toLowerCase();
  return apiRequest(`/profile/wow/character/${realmSlug}/${name}`, {
    namespace: "profile",
  });
}

export async function getCharacterEquipment(realmSlug: string, characterName: string) {
  const name = characterName.toLowerCase();
  return apiRequest(`/profile/wow/character/${realmSlug}/${name}/equipment`, {
    namespace: "profile",
  });
}

export async function getCharacterSpecializations(realmSlug: string, characterName: string) {
  const name = characterName.toLowerCase();
  return apiRequest(`/profile/wow/character/${realmSlug}/${name}/specializations`, {
    namespace: "profile",
  });
}

export async function getCharacterStats(realmSlug: string, characterName: string) {
  const name = characterName.toLowerCase();
  return apiRequest(`/profile/wow/character/${realmSlug}/${name}/statistics`, {
    namespace: "profile",
  });
}

export async function getCharacterMedia(realmSlug: string, characterName: string) {
  const name = characterName.toLowerCase();
  return apiRequest(`/profile/wow/character/${realmSlug}/${name}/character-media`, {
    namespace: "profile",
  });
}

export async function getCharacterProfessions(realmSlug: string, characterName: string) {
  const name = characterName.toLowerCase();
  return apiRequest(`/profile/wow/character/${realmSlug}/${name}/professions`, {
    namespace: "profile",
  });
}

export async function getCharacterMythicKeystoneProfile(realmSlug: string, characterName: string) {
  const name = characterName.toLowerCase();
  return apiRequest(`/profile/wow/character/${realmSlug}/${name}/mythic-keystone-profile`, {
    namespace: "profile",
  });
}

export async function getCharacterPvpSummary(realmSlug: string, characterName: string) {
  const name = characterName.toLowerCase();
  return apiRequest(`/profile/wow/character/${realmSlug}/${name}/pvp-summary`, {
    namespace: "profile",
  });
}

export async function getSpellMedia(spellId: number): Promise<{ iconUrl: string | null }> {
  try {
    const data = await apiRequest<any>(`/data/wow/media/spell/${spellId}`, {
      namespace: "static",
    });
    const iconUrl = data?.assets?.find((a: any) => a.key === "icon")?.value || null;
    return { iconUrl };
  } catch {
    return { iconUrl: null };
  }
}

export async function getRecipeDetails(recipeId: number) {
  return apiRequest(`/data/wow/recipe/${recipeId}`, {
    namespace: "static",
  });
}

export async function getRecipeMedia(recipeId: number): Promise<{ iconUrl: string | null }> {
  try {
    const data = await apiRequest<any>(`/data/wow/media/recipe/${recipeId}`, {
      namespace: "static",
    });
    const iconUrl = data?.assets?.find((a: any) => a.key === "icon")?.value || null;
    return { iconUrl };
  } catch {
    return { iconUrl: null };
  }
}

export async function getCharacterEncounters(realmSlug: string, characterName: string) {
  const name = characterName.toLowerCase();
  return apiRequest(`/profile/wow/character/${realmSlug}/${name}/encounters/raids`, {
    namespace: "profile",
  });
}

export async function getCharacterMythicKeystoneSeasonDetails(realmSlug: string, characterName: string, seasonId: number) {
  const name = characterName.toLowerCase();
  return apiRequest(`/profile/wow/character/${realmSlug}/${name}/mythic-keystone-profile/season/${seasonId}`, {
    namespace: "profile",
  });
}

/**
 * Fetch all available data for a character.
 * Individual endpoints may fail (404 for chars without M+ data, etc.)
 * so we catch errors per-endpoint and return what we can.
 */
export async function getFullCharacterData(realmSlug: string, characterName: string) {
  const safeCall = async <T>(fn: () => Promise<T>): Promise<T | null> => {
    try {
      return await fn();
    } catch {
      return null;
    }
  };

  const [profile, equipment, specs, stats, media, professions, mythicPlus, pvp, encounters] =
    await Promise.all([
      safeCall(() => getCharacterProfile(realmSlug, characterName)),
      safeCall(() => getCharacterEquipment(realmSlug, characterName)),
      safeCall(() => getCharacterSpecializations(realmSlug, characterName)),
      safeCall(() => getCharacterStats(realmSlug, characterName)),
      safeCall(() => getCharacterMedia(realmSlug, characterName)),
      safeCall(() => getCharacterProfessions(realmSlug, characterName)),
      safeCall(() => getCharacterMythicKeystoneProfile(realmSlug, characterName)),
      safeCall(() => getCharacterPvpSummary(realmSlug, characterName)),
      safeCall(() => getCharacterEncounters(realmSlug, characterName)),
    ]);

  return { profile, equipment, specs, stats, media, professions, mythicPlus, pvp, encounters };
}
