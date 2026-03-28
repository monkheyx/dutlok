import { NextRequest, NextResponse } from "next/server";
import { db, schema } from "@/db";
import { eq, and } from "drizzle-orm";

export const dynamic = "force-dynamic";

// GET — public page by slug (published only)
export async function GET(_req: NextRequest, { params }: { params: { slug: string } }) {
  const page = db
    .select()
    .from(schema.cmsPages)
    .where(and(eq(schema.cmsPages.slug, params.slug), eq(schema.cmsPages.isPublished, true)))
    .get();

  if (!page) {
    return NextResponse.json({ error: "Page not found" }, { status: 404 });
  }

  return NextResponse.json(page);
}
