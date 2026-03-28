import { NextRequest, NextResponse } from "next/server";
export const dynamic = "force-dynamic";
import { db } from "@/db";
import { craftableItems } from "@/db/schema";
import { eq, like } from "drizzle-orm";
import { checkAdminPassword } from "@/lib/auth";

// GET /api/crafting — list all craftable items, optionally filtered by search
export async function GET(req: NextRequest) {
  const search = req.nextUrl.searchParams.get("search");

  let items;
  if (search) {
    items = db
      .select()
      .from(craftableItems)
      .where(like(craftableItems.itemName, `%${search}%`))
      .all();
  } else {
    items = db.select().from(craftableItems).all();
  }

  return NextResponse.json(items);
}

// POST /api/crafting — add a craftable item (admin only)
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { password, itemName, professionName, characterId, characterName, notes } = body;

  if (!checkAdminPassword(password)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!itemName || !professionName || !characterName) {
    return NextResponse.json({ error: "Item name, profession, and character name are required" }, { status: 400 });
  }

  const result = db.insert(craftableItems).values({
    itemName,
    professionName,
    characterId: characterId || null,
    characterName,
    notes: notes || null,
  }).run();

  return NextResponse.json({ id: result.lastInsertRowid, success: true });
}
