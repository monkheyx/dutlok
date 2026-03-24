import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { newsPosts } from "@/db/schema";
import { eq } from "drizzle-orm";
import { checkAdminPassword } from "@/lib/auth";

// PATCH /api/news/[id] — update a news post
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json();
  const { password, title, content, imageUrl, isPinned } = body;

  if (!checkAdminPassword(password)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const id = Number(params.id);
  const updates: Record<string, unknown> = { updatedAt: new Date().toISOString() };
  if (title !== undefined) updates.title = title;
  if (content !== undefined) updates.content = content;
  if (imageUrl !== undefined) updates.imageUrl = imageUrl;
  if (isPinned !== undefined) updates.isPinned = isPinned;

  db.update(newsPosts).set(updates).where(eq(newsPosts.id, id)).run();
  return NextResponse.json({ success: true });
}

// DELETE /api/news/[id] — delete a news post
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json();
  if (!checkAdminPassword(body.password)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  db.delete(newsPosts).where(eq(newsPosts.id, Number(params.id))).run();
  return NextResponse.json({ success: true });
}
