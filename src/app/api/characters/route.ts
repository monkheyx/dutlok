import { NextRequest, NextResponse } from "next/server";
export const dynamic = "force-dynamic";
import { db, schema } from "@/db";
import { eq, and } from "drizzle-orm";
import { slugify } from "@/lib/utils";
import { checkAdminPassword } from "@/lib/auth";

export async function GET() {
  const characters = db.select().from(schema.characters).orderBy(schema.characters.name).all();
  return NextResponse.json(characters);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, realm, password, isMain, raidTeam, memberId } = body;

    if (!checkAdminPassword(password)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!name || !realm) {
      return NextResponse.json({ error: "name and realm are required" }, { status: 400 });
    }

    const realmSlug = slugify(realm);
    const region = process.env.BLIZZARD_REGION || "us";

    // Check for duplicate
    const existing = db
      .select()
      .from(schema.characters)
      .where(
        and(
          eq(schema.characters.name, name),
          eq(schema.characters.realmSlug, realmSlug),
          eq(schema.characters.region, region)
        )
      )
      .get();

    if (existing) {
      return NextResponse.json({ error: "Character already exists", character: existing }, { status: 409 });
    }

    const result = db
      .insert(schema.characters)
      .values({
        name,
        realm: realm,
        realmSlug,
        region,
        isMain: isMain ?? false,
        raidTeam: raidTeam ?? null,
        memberId: memberId ?? null,
      })
      .returning()
      .all();

    return NextResponse.json(result[0], { status: 201 });
  } catch (err: any) {
    console.error("Character API error:", err);
    return NextResponse.json({ error: err.message || "Internal error" }, { status: 500 });
  }
}
