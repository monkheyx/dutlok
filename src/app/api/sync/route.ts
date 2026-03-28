import { NextRequest, NextResponse } from "next/server";
export const dynamic = "force-dynamic";
import { importGuildRoster, syncAllCharacters, syncCharacter } from "@/services/sync";
import { checkAdminPassword } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, password, characterId } = body;

    if (!checkAdminPassword(password)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    switch (action) {
      case "import_guild": {
        const result = await importGuildRoster();
        return NextResponse.json(result);
      }
      case "sync_all": {
        const result = await syncAllCharacters();
        return NextResponse.json(result);
      }
      case "sync_character": {
        if (!characterId) {
          return NextResponse.json({ error: "characterId required" }, { status: 400 });
        }
        await syncCharacter(characterId);
        return NextResponse.json({ success: true });
      }
      default:
        return NextResponse.json({ error: "Unknown action" }, { status: 400 });
    }
  } catch (err: any) {
    console.error("Sync API error:", err);
    return NextResponse.json({ error: err.message || "Internal error" }, { status: 500 });
  }
}
