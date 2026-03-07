import { db, schema } from "@/db";
import { eq, desc, asc, sql, and, like, count } from "drizzle-orm";

export function getAllCharacters(filters?: {
  className?: string;
  role?: string;
  isMain?: boolean;
  isActive?: boolean;
  raidTeam?: string;
  search?: string;
  sortBy?: string;
  sortDir?: "asc" | "desc";
}) {
  const conditions = [];

  if (filters?.className) {
    conditions.push(eq(schema.characters.className, filters.className));
  }
  if (filters?.role) {
    conditions.push(eq(schema.characters.role, filters.role));
  }
  if (filters?.isMain !== undefined) {
    conditions.push(eq(schema.characters.isMain, filters.isMain));
  }
  if (filters?.isActive !== undefined) {
    conditions.push(eq(schema.characters.isActive, filters.isActive));
  }
  if (filters?.raidTeam) {
    conditions.push(eq(schema.characters.raidTeam, filters.raidTeam));
  }
  if (filters?.search) {
    conditions.push(like(schema.characters.name, `%${filters.search}%`));
  }

  const where = conditions.length > 0 ? and(...conditions) : undefined;

  let query = db.select().from(schema.characters);

  if (where) {
    query = query.where(where) as typeof query;
  }

  // Apply sorting
  const sortField = filters?.sortBy || "name";
  const sortDirection = filters?.sortDir || "asc";

  const sortMap: Record<string, any> = {
    name: schema.characters.name,
    className: schema.characters.className,
    itemLevel: schema.characters.itemLevel,
    role: schema.characters.role,
    lastSyncedAt: schema.characters.lastSyncedAt,
    level: schema.characters.level,
  };

  const sortColumn = sortMap[sortField] || schema.characters.name;

  if (sortDirection === "desc") {
    return query.orderBy(desc(sortColumn)).all();
  }
  return query.orderBy(asc(sortColumn)).all();
}

export function getCharacterById(id: number) {
  return db.select().from(schema.characters).where(eq(schema.characters.id, id)).get() ?? null;
}

export function getCharacterProfile(characterId: number) {
  return db.select().from(schema.characterProfiles).where(eq(schema.characterProfiles.characterId, characterId)).get() ?? null;
}

export function getCharacterWithProfile(id: number) {
  const character = getCharacterById(id);
  if (!character) return null;

  const profile = getCharacterProfile(id);
  const member = character.memberId
    ? db.select().from(schema.guildMembers).where(eq(schema.guildMembers.id, character.memberId)).get() ?? null
    : null;

  return { character, profile: profile || null, member: member || null };
}

export function getDashboardStats() {
  const totalCharacters = db
    .select({ count: count() })
    .from(schema.characters)
    .get()?.count ?? 0;

  const activeCharacters = db
    .select({ count: count() })
    .from(schema.characters)
    .where(eq(schema.characters.isActive, true))
    .get()?.count ?? 0;

  const mains = db
    .select({ count: count() })
    .from(schema.characters)
    .where(and(eq(schema.characters.isMain, true), eq(schema.characters.isActive, true)))
    .get()?.count ?? 0;

  const totalMembers = db
    .select({ count: count() })
    .from(schema.guildMembers)
    .where(eq(schema.guildMembers.isActive, true))
    .get()?.count ?? 0;

  return { totalCharacters, activeCharacters, mains, totalMembers };
}

export function getClassDistribution() {
  return db
    .select({
      className: schema.characters.className,
      count: count(),
    })
    .from(schema.characters)
    .where(eq(schema.characters.isActive, true))
    .groupBy(schema.characters.className)
    .orderBy(desc(count()))
    .all();
}

export function getRoleDistribution() {
  return db
    .select({
      role: schema.characters.role,
      count: count(),
    })
    .from(schema.characters)
    .where(and(eq(schema.characters.isActive, true), eq(schema.characters.isMain, true)))
    .groupBy(schema.characters.role)
    .orderBy(desc(count()))
    .all();
}

export function getRecentSyncJobs(limit = 10) {
  return db
    .select()
    .from(schema.syncJobs)
    .orderBy(desc(schema.syncJobs.createdAt))
    .limit(limit)
    .all();
}

export function getSpecDistribution() {
  return db
    .select({
      className: schema.characters.className,
      activeSpec: schema.characters.activeSpec,
      count: count(),
    })
    .from(schema.characters)
    .where(eq(schema.characters.isActive, true))
    .groupBy(schema.characters.className, schema.characters.activeSpec)
    .orderBy(asc(schema.characters.className), desc(count()))
    .all();
}
