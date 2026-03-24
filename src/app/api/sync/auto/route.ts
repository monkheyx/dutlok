import { NextRequest, NextResponse } from "next/server";
import { syncAllCharacters } from "@/services/sync";

// Internal secret to prevent unauthorized triggers
const SYNC_SECRET = process.env.SYNC_SECRET || "dutlok-auto-sync";

/**
 * Auto-sync endpoint — called by the internal cron scheduler.
 * Protected by a shared secret rather than admin password.
 */
export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    if (authHeader !== `Bearer ${SYNC_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("[Auto-Sync] Starting hourly character sync...");
    const result = await syncAllCharacters();
    console.log("[Auto-Sync] Complete:", result);

    return NextResponse.json({ success: true, ...result });
  } catch (err: any) {
    console.error("[Auto-Sync] Failed:", err);
    return NextResponse.json({ error: err.message || "Sync failed" }, { status: 500 });
  }
}
