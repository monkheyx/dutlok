import { NextRequest, NextResponse } from "next/server";
import { db, schema } from "@/db";
import { eq, desc, and } from "drizzle-orm";
import { checkAdminPassword } from "@/lib/auth";

// GET — list attendance records, optionally filtered by date/raid
export async function GET(req: NextRequest) {
  const raidDate = req.nextUrl.searchParams.get("date");
  const raidName = req.nextUrl.searchParams.get("raid");

  const conditions = [];
  if (raidDate) conditions.push(eq(schema.raidAttendance.raidDate, raidDate));
  if (raidName) conditions.push(eq(schema.raidAttendance.raidName, raidName));

  const where = conditions.length > 0 ? and(...conditions) : undefined;

  let query = db.select().from(schema.raidAttendance);
  if (where) query = query.where(where) as typeof query;

  const records = query.orderBy(desc(schema.raidAttendance.raidDate)).all();
  return NextResponse.json(records);
}

// POST — add attendance records (admin only)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { password, raidName, raidDate, difficulty, attendees } = body;

    if (!checkAdminPassword(password)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!raidName || !raidDate || !Array.isArray(attendees)) {
      return NextResponse.json(
        { error: "raidName, raidDate, and attendees[] are required" },
        { status: 400 }
      );
    }

    let added = 0;
    for (const att of attendees) {
      db.insert(schema.raidAttendance)
        .values({
          raidName,
          raidDate,
          difficulty: difficulty || null,
          characterId: att.characterId || null,
          characterName: att.characterName,
          status: att.status || "present",
          notes: att.notes || null,
          createdAt: new Date().toISOString(),
        })
        .run();
      added++;
    }

    return NextResponse.json({ success: true, added });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Internal error" }, { status: 500 });
  }
}
