import { NextRequest, NextResponse } from "next/server";
export const dynamic = "force-dynamic";
import { db, schema } from "@/db";
import { eq, and } from "drizzle-orm";
import { checkAdminPassword } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const mapId = parseInt(req.nextUrl.searchParams.get("map_id") || "1", 10);
  const shardIndex = parseInt(req.nextUrl.searchParams.get("shard_index") || "0", 10);

  const plots = db
    .select()
    .from(schema.neighborhoodPlots)
    .where(
      and(
        eq(schema.neighborhoodPlots.mapId, mapId),
        eq(schema.neighborhoodPlots.shardIndex, shardIndex)
      )
    )
    .all();

  const characters = db
    .select({
      id: schema.characters.id,
      name: schema.characters.name,
      className: schema.characters.className,
      activeSpec: schema.characters.activeSpec,
      isActive: schema.characters.isActive,
    })
    .from(schema.characters)
    .where(eq(schema.characters.isActive, true))
    .all();

  return NextResponse.json({ plots, characters });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { password, characterId, characterName, plotId, mapId, shardIndex, rankedChoice, status } = body;

    if (!checkAdminPassword(password)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (plotId === undefined || !characterName) {
      return NextResponse.json({ error: "plotId and characterName are required" }, { status: 400 });
    }

    const result = db
      .insert(schema.neighborhoodPlots)
      .values({
        mapId: mapId ?? 1,
        plotId,
        shardIndex: shardIndex ?? 0,
        characterId: characterId ?? null,
        characterName,
        status: status ?? "requested",
        rankedChoice: rankedChoice ?? 1,
      })
      .returning()
      .all();

    return NextResponse.json(result[0], { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Internal error" }, { status: 500 });
  }
}
