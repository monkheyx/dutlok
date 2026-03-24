import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { craftableItems } from "@/db/schema";
import { eq } from "drizzle-orm";
import { checkAdminPassword } from "@/lib/auth";

// DELETE /api/crafting/[id] — remove a craftable item
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json();
  if (!checkAdminPassword(body.password)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  db.delete(craftableItems).where(eq(craftableItems.id, Number(params.id))).run();
  return NextResponse.json({ success: true });
}
