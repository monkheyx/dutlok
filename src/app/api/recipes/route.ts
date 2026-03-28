import { NextRequest, NextResponse } from "next/server";
export const dynamic = "force-dynamic";
import { db } from "@/db";
import { characterRecipes } from "@/db/schema";
import { like } from "drizzle-orm";

// GET /api/recipes?search=serling — search synced character recipes
export async function GET(req: NextRequest) {
  const search = req.nextUrl.searchParams.get("search");

  if (!search || search.length < 2) {
    return NextResponse.json([]);
  }

  const results = db
    .select()
    .from(characterRecipes)
    .where(like(characterRecipes.recipeName, `%${search}%`))
    .all();

  // Group by recipe name
  const grouped: Record<string, Array<{
    characterId: number;
    characterName: string;
    professionName: string;
    tierName: string | null;
  }>> = {};

  for (const r of results) {
    if (!grouped[r.recipeName]) grouped[r.recipeName] = [];
    grouped[r.recipeName].push({
      characterId: r.characterId,
      characterName: r.characterName,
      professionName: r.professionName,
      tierName: r.tierName,
    });
  }

  return NextResponse.json(grouped);
}
