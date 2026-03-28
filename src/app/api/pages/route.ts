import { NextRequest, NextResponse } from "next/server";
import { db, schema } from "@/db";
import { eq } from "drizzle-orm";
import { checkAdminPassword } from "@/lib/auth";

export const dynamic = "force-dynamic";

const RESERVED_SLUGS = [
  "strategies", "mythic-plus", "roster", "character", "audit",
  "raids", "loot", "professions", "neighborhood", "admin",
  "api", "pages", "p", "join", "analytics",
];

function isValidSlug(slug: string): boolean {
  return /^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug) && slug.length >= 2 && slug.length <= 100;
}

// GET — list all pages (supports ?nav=true to filter nav-visible published pages)
export async function GET(req: NextRequest) {
  const navOnly = req.nextUrl.searchParams.get("nav") === "true";

  let pages;
  if (navOnly) {
    pages = db
      .select()
      .from(schema.cmsPages)
      .where(eq(schema.cmsPages.isPublished, true))
      .all()
      .filter((p) => p.showInNav);
  } else {
    pages = db.select().from(schema.cmsPages).all();
  }

  // Sort by navOrder then title
  pages.sort((a, b) => (a.navOrder ?? 100) - (b.navOrder ?? 100) || a.title.localeCompare(b.title));

  return NextResponse.json(pages);
}

// POST — create a new page
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { password, title, slug, content, metaDescription, headerImageUrl, showInNav, navLabel, navOrder, isPublished } = body;

    if (!checkAdminPassword(password)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!title?.trim() || !slug?.trim() || !content?.trim()) {
      return NextResponse.json({ error: "Title, slug, and content are required" }, { status: 400 });
    }

    const normalizedSlug = slug.toLowerCase().trim();

    if (!isValidSlug(normalizedSlug)) {
      return NextResponse.json({ error: "Invalid slug format. Use lowercase letters, numbers, and hyphens only." }, { status: 400 });
    }

    if (RESERVED_SLUGS.includes(normalizedSlug)) {
      return NextResponse.json({ error: `Slug "${normalizedSlug}" is reserved and cannot be used.` }, { status: 400 });
    }

    // Check for duplicate slug
    const existing = db.select().from(schema.cmsPages).where(eq(schema.cmsPages.slug, normalizedSlug)).get();
    if (existing) {
      return NextResponse.json({ error: `A page with slug "${normalizedSlug}" already exists.` }, { status: 409 });
    }

    const result = db.insert(schema.cmsPages).values({
      title: title.trim(),
      slug: normalizedSlug,
      content,
      metaDescription: metaDescription || null,
      headerImageUrl: headerImageUrl || null,
      showInNav: showInNav ?? false,
      navLabel: navLabel || null,
      navOrder: navOrder ?? 100,
      isPublished: isPublished ?? true,
      createdBy: "admin",
    }).run();

    return NextResponse.json({ success: true, id: result.lastInsertRowid });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to create page" }, { status: 500 });
  }
}
