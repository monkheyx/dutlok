import { NextRequest, NextResponse } from "next/server";
export const dynamic = "force-dynamic";
import { db, schema } from "@/db";
import { eq, and } from "drizzle-orm";
import { checkAdminPassword } from "@/lib/auth";

// PATCH — approve or reject a registration (admin only)
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { action, password } = body;

    if (!checkAdminPassword(password)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const regId = parseInt(id, 10);
    const registration = db
      .select()
      .from(schema.registrations)
      .where(eq(schema.registrations.id, regId))
      .get();

    if (!registration) {
      return NextResponse.json({ error: "Registration not found" }, { status: 404 });
    }

    if (registration.status !== "pending") {
      return NextResponse.json({ error: "Registration already processed" }, { status: 400 });
    }

    if (action === "approve") {
      // Create the character
      const region = registration.region || process.env.BLIZZARD_REGION || "us";

      // Check if character already exists
      const existing = db
        .select()
        .from(schema.characters)
        .where(
          and(
            eq(schema.characters.name, registration.characterName),
            eq(schema.characters.realmSlug, registration.realmSlug),
            eq(schema.characters.region, region)
          )
        )
        .get();

      if (!existing) {
        db.insert(schema.characters)
          .values({
            name: registration.characterName,
            realm: registration.realmSlug,
            realmSlug: registration.realmSlug,
            region,
          })
          .run();
      }

      // Mark registration as approved
      db.update(schema.registrations)
        .set({
          status: "approved",
          reviewedAt: new Date().toISOString(),
        })
        .where(eq(schema.registrations.id, regId))
        .run();

      return NextResponse.json({ success: true, message: `${registration.characterName} approved and added to roster` });
    } else if (action === "reject") {
      db.update(schema.registrations)
        .set({
          status: "rejected",
          reviewedAt: new Date().toISOString(),
        })
        .where(eq(schema.registrations.id, regId))
        .run();

      return NextResponse.json({ success: true, message: `${registration.characterName} rejected` });
    } else {
      return NextResponse.json({ error: "Invalid action. Use 'approve' or 'reject'" }, { status: 400 });
    }
  } catch (err: any) {
    console.error("Registration review error:", err);
    return NextResponse.json({ error: err.message || "Internal error" }, { status: 500 });
  }
}

// DELETE — remove a registration (admin only)
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { password } = await req.json();

    if (!checkAdminPassword(password)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const regId = parseInt(id, 10);
    db.delete(schema.registrations)
      .where(eq(schema.registrations.id, regId))
      .run();

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Internal error" }, { status: 500 });
  }
}
