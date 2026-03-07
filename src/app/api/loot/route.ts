import { NextRequest, NextResponse } from "next/server";
import { db, schema } from "@/db";
import { desc, eq, and, like } from "drizzle-orm";
import { checkAdminPassword } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const raidName = searchParams.get("raid");
  const raidDate = searchParams.get("date");
  const characterName = searchParams.get("character");

  const conditions = [];
  if (raidName) conditions.push(eq(schema.raidLoot.raidName, raidName));
  if (raidDate) conditions.push(eq(schema.raidLoot.raidDate, raidDate));
  if (characterName) conditions.push(like(schema.raidLoot.characterName, `%${characterName}%`));

  const where = conditions.length > 0 ? and(...conditions) : undefined;

  let query = db.select().from(schema.raidLoot);
  if (where) {
    query = query.where(where) as typeof query;
  }

  const loot = query.orderBy(desc(schema.raidLoot.raidDate), desc(schema.raidLoot.createdAt)).all();
  return NextResponse.json(loot);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { password, ...lootData } = body;

    if (!checkAdminPassword(password)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!lootData.characterName || !lootData.itemName || !lootData.raidDate) {
      return NextResponse.json(
        { error: "characterName, itemName, and raidDate are required" },
        { status: 400 }
      );
    }

    const result = db
      .insert(schema.raidLoot)
      .values({
        characterId: lootData.characterId || null,
        characterName: lootData.characterName,
        itemName: lootData.itemName,
        itemId: lootData.itemId || null,
        itemQuality: lootData.itemQuality || null,
        itemLevel: lootData.itemLevel || null,
        bossName: lootData.bossName || null,
        raidName: lootData.raidName || null,
        raidDate: lootData.raidDate,
        notes: lootData.notes || null,
        awardedBy: lootData.awardedBy || null,
      })
      .returning()
      .all();

    return NextResponse.json(result[0], { status: 201 });
  } catch (err: any) {
    console.error("Loot API error:", err);
    return NextResponse.json({ error: err.message || "Internal error" }, { status: 500 });
  }
}
