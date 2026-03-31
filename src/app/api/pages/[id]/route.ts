import { NextRequest, NextResponse } from "next/server";
import { db, schema } from "@/db";
import { eq } from "drizzle-orm";
import { checkAdminPassword } from "@/lib/auth";
import { RESERVED_SLUGS, isValidSlug } from "@/lib/utils";

export const dynamic = "force-dynamic";

// GET — single page by ID
export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const page = db.select().from(schema.cmsPages).where(eq(schema.cmsPages.id, Number(params.id))).get();
  if (!page) return NextResponse.json({ error: "Page not found" }, { status: 404 });
  return NextResponse.json(page);
}

// PATCH — update page
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const { password, ...fields } = body;

    if (!checkAdminPassword(password)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const existing = db.select().from(schema.cmsPages).where(eq(schema.cmsPages.id, Number(params.id))).get();
    if (!existing) return NextResponse.json({ error: "Page not found" }, { status: 404 });

    const updates: Record<string, any> = { updatedAt: new Date().toISOString() };

    if (fields.title !== undefined) updates.title = fields.title;
    if (fields.content !== undefined) updates.content = fields.content;
    if (fields.metaDescription !== undefined) updates.metaDescription = fields.metaDescription;
    if (fields.headerImageUrl !== undefined) updates.headerImageUrl = fields.headerImageUrl;
    if (fields.showInNav !== undefined) updates.showInNav = fields.showInNav;
    if (fields.navLabel !== undefined) updates.navLabel = fields.navLabel;
    if (fields.navOrder !== undefined) updates.navOrder = fields.navOrder;
    if (fields.isPublished !== undefined) updates.isPublished = fields.isPublished;

    // Slug change requires validation
    if (fields.slug !== undefined && fields.slug !== existing.slug) {
      const normalized = fields.slug.toLowerCase().trim();
      if (!isValidSlug(normalized)) {
        return NextResponse.json({ error: "Invalid slug format" }, { status: 400 });
      }
      if (RESERVED_SLUGS.includes(normalized)) {
        return NextResponse.json({ error: `Slug "${normalized}" is reserved` }, { status: 400 });
      }
      const dup = db.select().from(schema.cmsPages).where(eq(schema.cmsPages.slug, normalized)).get();
      if (dup && dup.id !== existing.id) {
        return NextResponse.json({ error: "Slug already in use" }, { status: 409 });
      }
      updates.slug = normalized;
    }

    db.update(schema.cmsPages).set(updates).where(eq(schema.cmsPages.id, Number(params.id))).run();
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Update failed" }, { status: 500 });
  }
}

// DELETE — delete page
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    if (!checkAdminPassword(body.password)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    db.delete(schema.cmsPages).where(eq(schema.cmsPages.id, Number(params.id))).run();
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Delete failed" }, { status: 500 });
  }
}
