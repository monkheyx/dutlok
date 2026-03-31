"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Plus, Pencil, Trash2, ExternalLink, Globe, Eye, EyeOff, FileText, Loader2, CheckCircle, AlertCircle, X, Copy } from "lucide-react";
import { useAdmin } from "@/components/admin-provider";
import { cn, slugify } from "@/lib/utils";
import { RichTextEditor, getEditorContent } from "@/components/rich-text-editor";

interface CmsPage {
  id: number;
  title: string;
  slug: string;
  content: string;
  metaDescription: string | null;
  headerImageUrl: string | null;
  showInNav: boolean;
  navLabel: string | null;
  navOrder: number;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

export function PageManager() {
  const { isAuthenticated, password } = useAdmin();
  const [pages, setPages] = useState<CmsPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<CmsPage | null>(null);
  const [creating, setCreating] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const fetchPages = useCallback(async () => {
    try {
      const res = await fetch("/api/pages");
      if (res.ok) setPages(await res.json());
    } catch { /* silent */ }
    setLoading(false);
  }, []);

  useEffect(() => { fetchPages(); }, [fetchPages]);

  async function handleDelete(id: number, title: string) {
    if (!confirm(`Delete page "${title}"?`)) return;
    try {
      const res = await fetch(`/api/pages/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        setMessage({ type: "success", text: `"${title}" deleted` });
        fetchPages();
      } else {
        const data = await res.json();
        setMessage({ type: "error", text: data.error || "Delete failed" });
      }
    } catch {
      setMessage({ type: "error", text: "Network error" });
    }
  }

  function copyUrl(slug: string) {
    navigator.clipboard.writeText(`${window.location.origin}/p/${slug}`);
    setMessage({ type: "success", text: "URL copied!" });
  }

  if (!isAuthenticated) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Custom Pages
        </h2>
        {!creating && !editing && (
          <button
            onClick={() => setCreating(true)}
            className="flex items-center gap-1.5 bg-primary text-primary-foreground rounded-md py-1.5 px-3 text-xs font-medium hover:opacity-90"
          >
            <Plus className="h-3.5 w-3.5" />
            New Page
          </button>
        )}
      </div>

      {message && (
        <div className={cn(
          "flex items-center gap-2 p-2 rounded-lg border text-xs",
          message.type === "success" ? "bg-green-500/10 border-green-500/30 text-green-400" : "bg-red-500/10 border-red-500/30 text-red-400"
        )}>
          {message.type === "success" ? <CheckCircle className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
          {message.text}
        </div>
      )}

      {/* Editor — create or edit mode */}
      {(creating || editing) && (
        <PageEditor
          password={password}
          existingPage={editing || undefined}
          onSaved={() => { setCreating(false); setEditing(null); setMessage({ type: "success", text: editing ? "Page updated" : "Page created" }); fetchPages(); }}
          onCancel={() => { setCreating(false); setEditing(null); }}
        />
      )}

      {/* Page list */}
      {!creating && !editing && (
        loading ? (
          <p className="text-sm text-muted-foreground">Loading pages...</p>
        ) : pages.length === 0 ? (
          <p className="text-sm text-muted-foreground">No custom pages yet. Click "New Page" to create one.</p>
        ) : (
          <div className="space-y-2">
            {pages.map((page) => (
              <div key={page.id} className="flex items-center gap-3 px-3 py-2.5 rounded-lg border border-border bg-secondary/20 hover:bg-secondary/30 transition-colors">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium truncate">{page.title}</span>
                    {!page.isPublished && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-yellow-500/15 text-yellow-400 border border-yellow-500/30 font-bold uppercase">Draft</span>
                    )}
                    {page.showInNav && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/15 text-blue-400 border border-blue-500/30 font-bold uppercase">Nav</span>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground">/p/{page.slug}</div>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button onClick={() => copyUrl(page.slug)} className="p-1.5 text-muted-foreground/40 hover:text-foreground transition-colors" title="Copy URL">
                    <Copy className="h-3.5 w-3.5" />
                  </button>
                  <a href={`/p/${page.slug}`} target="_blank" rel="noopener noreferrer" className="p-1.5 text-muted-foreground/40 hover:text-primary transition-colors" title="View page">
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                  <button onClick={() => setEditing(page)} className="p-1.5 text-muted-foreground/40 hover:text-primary transition-colors" title="Edit">
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button onClick={() => handleDelete(page.id, page.title)} className="p-1.5 text-muted-foreground/40 hover:text-red-400 transition-colors" title="Delete">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
}

// ── Page Editor ──

function PageEditor({
  password,
  existingPage,
  onSaved,
  onCancel,
}: {
  password: string;
  existingPage?: CmsPage;
  onSaved: () => void;
  onCancel: () => void;
}) {
  const isEdit = !!existingPage;
  const [title, setTitle] = useState(existingPage?.title || "");
  const [slug, setSlug] = useState(existingPage?.slug || "");
  const [slugManual, setSlugManual] = useState(!!existingPage);
  const [metaDescription, setMetaDescription] = useState(existingPage?.metaDescription || "");
  const [headerImageUrl, setHeaderImageUrl] = useState(existingPage?.headerImageUrl || "");
  const [showInNav, setShowInNav] = useState(existingPage?.showInNav || false);
  const [navLabel, setNavLabel] = useState(existingPage?.navLabel || "");
  const [navOrder, setNavOrder] = useState(existingPage?.navOrder ?? 100);
  const [isPublished, setIsPublished] = useState(existingPage?.isPublished ?? true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const editorContainerRef = useRef<HTMLDivElement>(null);

  // Auto-generate slug from title
  function handleTitleChange(value: string) {
    setTitle(value);
    if (!slugManual) {
      setSlug(slugify(value));
    }
  }

  async function uploadImage(file: File): Promise<string | null> {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("password", password);
    try {
      const res = await fetch("/api/news/upload", { method: "POST", body: formData });
      if (res.ok) {
        const data = await res.json();
        return data.url;
      }
    } catch { /* silent */ }
    return null;
  }

  async function handleSave() {
    const content = getEditorContent(editorContainerRef.current);
    if (!title.trim() || !slug.trim() || !content.trim()) {
      setError("Title, slug, and content are required");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const url = isEdit ? `/api/pages/${existingPage!.id}` : "/api/pages";
      const method = isEdit ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          password, title, slug, content, metaDescription: metaDescription || null,
          headerImageUrl: headerImageUrl || null, showInNav, navLabel: navLabel || null,
          navOrder, isPublished,
        }),
      });

      if (res.ok) {
        onSaved();
      } else {
        const data = await res.json();
        setError(data.error || "Save failed");
      }
    } catch {
      setError("Network error");
    }
    setSaving(false);
  }

  return (
    <div className="bg-secondary/20 border border-border rounded-lg p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">{isEdit ? "Edit Page" : "New Page"}</h3>
        <button onClick={onCancel} className="text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-2 rounded border text-xs bg-red-500/10 border-red-500/30 text-red-400">
          <AlertCircle className="h-3 w-3" />{error}
        </div>
      )}

      {/* Title + Slug */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">Title</label>
          <input
            type="text" value={title} onChange={(e) => handleTitleChange(e.target.value)}
            placeholder="Page Title"
            className="w-full bg-secondary border border-border rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">
            Slug <span className="text-muted-foreground/50">(/p/{slug || "..."})</span>
          </label>
          <input
            type="text" value={slug}
            onChange={(e) => { setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "")); setSlugManual(true); }}
            placeholder="page-slug"
            className="w-full bg-secondary border border-border rounded-md py-2 px-3 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
      </div>

      {/* Meta description */}
      <div>
        <label className="text-xs text-muted-foreground mb-1 block">Meta Description (SEO)</label>
        <input
          type="text" value={metaDescription} onChange={(e) => setMetaDescription(e.target.value)}
          placeholder="Brief description for search engines..."
          className="w-full bg-secondary border border-border rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
        />
      </div>

      {/* Header image */}
      <div>
        <label className="text-xs text-muted-foreground mb-1 block">Header Image URL (optional)</label>
        <input
          type="text" value={headerImageUrl} onChange={(e) => setHeaderImageUrl(e.target.value)}
          placeholder="https://... or upload inline"
          className="w-full bg-secondary border border-border rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
        />
      </div>

      {/* Options row */}
      <div className="flex flex-wrap gap-4">
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input type="checkbox" checked={isPublished} onChange={(e) => setIsPublished(e.target.checked)} className="rounded" />
          {isPublished ? <Eye className="h-3.5 w-3.5 text-green-400" /> : <EyeOff className="h-3.5 w-3.5 text-muted-foreground" />}
          Published
        </label>
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input type="checkbox" checked={showInNav} onChange={(e) => setShowInNav(e.target.checked)} className="rounded" />
          <Globe className="h-3.5 w-3.5" />
          Show in Nav
        </label>
        {showInNav && (
          <>
            <div className="flex items-center gap-1.5">
              <label className="text-xs text-muted-foreground">Label:</label>
              <input
                type="text" value={navLabel} onChange={(e) => setNavLabel(e.target.value)}
                placeholder={title || "Nav label"}
                className="bg-secondary border border-border rounded px-2 py-1 text-xs w-24 focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <div className="flex items-center gap-1.5">
              <label className="text-xs text-muted-foreground">Order:</label>
              <input
                type="number" value={navOrder} onChange={(e) => setNavOrder(Number(e.target.value))}
                className="bg-secondary border border-border rounded px-2 py-1 text-xs w-16 focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </>
        )}
      </div>

      {/* Rich text editor */}
      <div>
        <label className="text-xs text-muted-foreground mb-1 block">Content</label>
        <div ref={editorContainerRef}>
          <RichTextEditor
            initialContent={existingPage?.content}
            placeholder="Write your page content..."
            minHeight="300px"
            onUploadImage={uploadImage}
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-2">
        <button onClick={onCancel} className="bg-secondary border border-border rounded-md py-1.5 px-4 text-sm hover:bg-accent transition-colors">
          Cancel
        </button>
        <button onClick={handleSave} disabled={saving} className="flex items-center gap-1.5 bg-primary text-primary-foreground rounded-md py-1.5 px-4 text-sm font-medium hover:opacity-90 disabled:opacity-50">
          {saving && <Loader2 className="h-4 w-4 animate-spin" />}
          {isEdit ? "Update Page" : "Create Page"}
        </button>
      </div>
    </div>
  );
}
