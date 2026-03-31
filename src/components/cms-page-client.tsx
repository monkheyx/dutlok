"use client";

import { Pencil, ArrowLeft } from "lucide-react";
import { useAdmin } from "@/components/admin-provider";
import { timeAgo } from "@/lib/utils";
import Link from "next/link";

interface PageData {
  id: number;
  title: string;
  slug: string;
  content: string;
  headerImageUrl: string | null;
  updatedAt: string | null;
}

export function CmsPageClient({ page }: { page: PageData }) {
  const { isAuthenticated } = useAdmin();

  return (
    <div className="max-w-4xl mx-auto py-6 space-y-6">
      {/* Header */}
      <div>
        {/* Header image */}
        {page.headerImageUrl && (
          <div className="rounded-lg overflow-hidden mb-4 max-h-64">
            <img src={page.headerImageUrl} alt="" className="w-full object-cover max-h-64" />
          </div>
        )}

        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">{page.title}</h1>
            {page.updatedAt && (
              <p className="text-xs text-muted-foreground mt-1">
                Last updated {timeAgo(page.updatedAt)}
              </p>
            )}
          </div>
          {isAuthenticated && (
            <Link
              href="/admin"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-secondary border border-border text-xs font-medium text-muted-foreground hover:text-foreground transition-colors flex-shrink-0"
            >
              <Pencil className="h-3 w-3" />
              Edit
            </Link>
          )}
        </div>
      </div>

      {/* Content */}
      <div
        className="prose prose-invert prose-sm md:prose-base max-w-none [&_h2]:text-xl [&_h2]:font-bold [&_h2]:mt-6 [&_h2]:mb-2 [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:mt-4 [&_h3]:mb-2 [&_a]:text-primary [&_img]:rounded-lg [&_img]:max-w-full [&_ul]:list-disc [&_ol]:list-decimal [&_li]:ml-4"
        dangerouslySetInnerHTML={{ __html: page.content }}
      />

      {/* Back link */}
      <div className="pt-4 border-t border-border">
        <Link href="/" className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-1">
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
