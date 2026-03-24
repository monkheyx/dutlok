import { NextRequest, NextResponse } from "next/server";
import { getAllCachedIcons } from "@/services/spell-icons";

// GET — return all cached spell icons as a map
export async function GET(req: NextRequest) {
  const icons = getAllCachedIcons();
  const obj: Record<number, string> = {};
  icons.forEach((url, id) => {
    obj[id] = url;
  });
  return NextResponse.json(obj, {
    headers: {
      "Cache-Control": "public, max-age=3600", // cache for 1 hour
    },
  });
}
