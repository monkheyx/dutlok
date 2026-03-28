import { NextRequest, NextResponse } from "next/server";
export const dynamic = "force-dynamic";
import { db } from "@/db";
import { newsPosts } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { checkAdminPassword } from "@/lib/auth";

// GET /api/news — list all news posts (newest first)
export async function GET(req: NextRequest) {
  const limit = Number(req.nextUrl.searchParams.get("limit")) || 20;
  const posts = db
    .select()
    .from(newsPosts)
    .orderBy(desc(newsPosts.isPinned), desc(newsPosts.createdAt))
    .limit(limit)
    .all();
  return NextResponse.json(posts);
}

// POST /api/news — create a news post (admin only)
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { password, title, content, imageUrl, isPinned } = body;

  if (!checkAdminPassword(password)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!title || !content) {
    return NextResponse.json({ error: "Title and content are required" }, { status: 400 });
  }

  const result = db.insert(newsPosts).values({
    title,
    content,
    imageUrl: imageUrl || null,
    isPinned: isPinned ?? false,
    createdBy: "admin",
  }).run();

  return NextResponse.json({ id: result.lastInsertRowid, success: true });
}
