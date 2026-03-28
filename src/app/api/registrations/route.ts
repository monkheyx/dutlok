import { NextRequest, NextResponse } from "next/server";
export const dynamic = "force-dynamic";
import { db, schema } from "@/db";
import { eq, and } from "drizzle-orm";
import { checkAdminPassword } from "@/lib/auth";
import { slugify } from "@/lib/utils";

// GET — list registrations (admin: all, public: just count)
export async function GET(req: NextRequest) {
  const password = req.nextUrl.searchParams.get("password");

  if (password && checkAdminPassword(password)) {
    const all = db
      .select()
      .from(schema.registrations)
      .orderBy(schema.registrations.createdAt)
      .all();
    return NextResponse.json(all);
  }

  // Public: just return pending count
  const pending = db
    .select()
    .from(schema.registrations)
    .where(eq(schema.registrations.status, "pending"))
    .all();
  return NextResponse.json({ pendingCount: pending.length });
}

// POST — submit a new registration (public, no auth required)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { characterName, realm, submittedBy, notes } = body;

    if (!characterName || !realm) {
      return NextResponse.json({ error: "Character name and realm are required" }, { status: 400 });
    }

    const realmSlug = slugify(realm);
    const region = process.env.BLIZZARD_REGION || "us";

    // Check if character already exists in roster
    const existing = db
      .select()
      .from(schema.characters)
      .where(
        and(
          eq(schema.characters.name, characterName),
          eq(schema.characters.realmSlug, realmSlug),
          eq(schema.characters.region, region)
        )
      )
      .get();

    if (existing) {
      return NextResponse.json({ error: "This character is already in the roster" }, { status: 409 });
    }

    // Check if there's already a pending registration for this character
    const pendingReg = db
      .select()
      .from(schema.registrations)
      .where(
        and(
          eq(schema.registrations.characterName, characterName),
          eq(schema.registrations.realmSlug, realmSlug),
          eq(schema.registrations.status, "pending")
        )
      )
      .get();

    if (pendingReg) {
      return NextResponse.json({ error: "A registration for this character is already pending" }, { status: 409 });
    }

    const result = db
      .insert(schema.registrations)
      .values({
        characterName,
        realmSlug,
        region,
        submittedBy: submittedBy || null,
        notes: notes || null,
        status: "pending",
      })
      .returning()
      .all();

    return NextResponse.json(result[0], { status: 201 });
  } catch (err: any) {
    console.error("Registration error:", err);
    return NextResponse.json({ error: err.message || "Internal error" }, { status: 500 });
  }
}
