import { NextRequest, NextResponse } from "next/server";
import { db, schema } from "@/db";
import { eq } from "drizzle-orm";
import { checkAdminPassword } from "@/lib/auth";

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const id = parseInt(params.id, 10);
  if (isNaN(id)) {
    return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
  }

  const body = await req.json();
  if (!checkAdminPassword(body.password)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  db.delete(schema.raidLoot).where(eq(schema.raidLoot.id, id)).run();
  return NextResponse.json({ success: true });
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

  const allowedFields = [
    "characterName", "itemName", "itemId", "itemQuality",
    "itemLevel", "bossName", "raidName", "raidDate", "notes", "awardedBy",
  ];
  const safeUpdates: Record<string, any> = {};
  for (const key of allowedFields) {
    if (key in updates) safeUpdates[key] = updates[key];
  }

  db.update(schema.raidLoot).set(safeUpdates).where(eq(schema.raidLoot.id, id)).run();

  const updated = db.select().from(schema.raidLoot).where(eq(schema.raidLoot.id, id)).get();
  return NextResponse.json(updated);
}
