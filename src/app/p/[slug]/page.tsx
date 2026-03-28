import { db, schema } from "@/db";
import { eq, and } from "drizzle-orm";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { CmsPageClient } from "@/components/cms-page-client";

export const dynamic = "force-dynamic";

interface Props {
  params: { slug: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const page = db
    .select()
    .from(schema.cmsPages)
    .where(and(eq(schema.cmsPages.slug, params.slug), eq(schema.cmsPages.isPublished, true)))
    .get();

  if (!page) return {};
  return {
    title: `${page.title} - DUTLOK`,
    description: page.metaDescription || undefined,
  };
}

export default function CmsPage({ params }: Props) {
  const page = db
    .select()
    .from(schema.cmsPages)
    .where(and(eq(schema.cmsPages.slug, params.slug), eq(schema.cmsPages.isPublished, true)))
    .get();

  if (!page) return notFound();

  return (
    <CmsPageClient
      page={{
        id: page.id,
        title: page.title,
        slug: page.slug,
        content: page.content,
        headerImageUrl: page.headerImageUrl,
        updatedAt: page.updatedAt,
      }}
    />
  );
}
