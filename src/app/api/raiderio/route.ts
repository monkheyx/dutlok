import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// Proxy to Raider.IO API to avoid CORS issues from client-side fetch
export async function GET(req: NextRequest) {
  const region = req.nextUrl.searchParams.get("region") || "us";
  const realm = req.nextUrl.searchParams.get("realm");
  const name = req.nextUrl.searchParams.get("name");

  if (!realm || !name) {
    return NextResponse.json({ error: "realm and name are required" }, { status: 400 });
  }

  const realmSlug = realm.toLowerCase().replace(/['\s]+/g, "-");
  const fields = "mythic_plus_scores_by_season:current,mythic_plus_best_runs,mythic_plus_alternate_runs";

  try {
    const res = await fetch(
      `https://raider.io/api/v1/characters/profile?region=${region}&realm=${realmSlug}&name=${encodeURIComponent(name)}&fields=${encodeURIComponent(fields)}`,
      { next: { revalidate: 300 } } // Cache 5 min
    );

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      return NextResponse.json(
        { error: data.message || "Character not found" },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: "Failed to fetch from Raider.IO" }, { status: 502 });
  }
}
