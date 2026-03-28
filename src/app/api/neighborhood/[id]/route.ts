import { NextRequest, NextResponse } from "next/server";
export const dynamic = "force-dynamic";
import { db, schema } from "@/db";
import { eq } from "drizzle-orm";
import { checkAdminPassword } from "@/lib/auth";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { password, status, plotId, rankedChoice, note } = body;

    if (!checkAdminPassword(password)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const updates: Record<string, any> = { updatedAt: new Date().toISOString() };
    if (status !== undefined) updates.status = status;
    if (plotId !== undefined) updates.plotId = plotId;
    if (rankedChoice !== undefined) updates.rankedChoice = rankedChoice;
    if (note !== undefined) updates.note = note;

    db.update(schema.neighborhoodPlots)
      .set(updates)
      .where(eq(schema.neighborhoodPlots.id, parseInt(id, 10)))
      .run();

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Internal error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { password } = await req.json();

    if (!checkAdminPassword(password)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    db.delete(schema.neighborhoodPlots)
      .where(eq(schema.neighborhoodPlots.id, parseInt(id, 10)))
      .run();

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Internal error" }, { status: 500 });
  }
}
