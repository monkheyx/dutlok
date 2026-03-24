import { NextRequest, NextResponse } from "next/server";
import { db, schema } from "@/db";
import { eq } from "drizzle-orm";
import { checkAdminPassword } from "@/lib/auth";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const id = parseInt(params.id, 10);
  if (isNaN(id)) {
    return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
  }

  const character = db.select().from(schema.characters).where(eq(schema.characters.id, id)).get();

  if (!character) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const profile = db.select().from(schema.characterProfiles).where(eq(schema.characterProfiles.characterId, id)).get();

  return NextResponse.json({ character, profile });
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const id = parseInt(params.id, 10);
  if (isNaN(id)) {
    return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
  }

  const body = await req.json();
  const { password, ...updates } = body;

  if (!checkAdminPassword(password)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Only allow specific fields to be updated
  const allowedFields = ["isMain", "isActive", "isRaider", "isRaiderAlt", "raidTeam", "memberId", "role", "notes"];
  const safeUpdates: Record<string, any> = {};
  for (const key of allowedFields) {
    if (key in updates) {
      safeUpdates[key] = updates[key];
    }
  }
  safeUpdates.updatedAt = new Date().toISOString();

  db.update(schema.characters).set(safeUpdates).where(eq(schema.characters.id, id)).run();

  const character = db.select().from(schema.characters).where(eq(schema.characters.id, id)).get();

  return NextResponse.json(character);
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const id = parseInt(params.id, 10);
  if (isNaN(id)) {
    return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
  }

  const body = await req.json();
  if (!checkAdminPassword(body.password)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  db.delete(schema.characters).where(eq(schema.characters.id, id)).run();

  return NextResponse.json({ success: true });
}
