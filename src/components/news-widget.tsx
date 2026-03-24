"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Newspaper, Pin, ChevronDown, ChevronUp, Plus, X, Bold, Italic, Heading1, Heading2, List, ListOrdered, Image, Link as LinkIcon, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { useAdmin } from "@/components/admin-provider";
import { cn } from "@/lib/utils";

interface NewsPost {
  id: number;
  title: string;
  content: string;
  imageUrl: string | null;
  isPinned: boolean;
  createdAt: string;
}

function timeAgoShort(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

function NewsPostCard({ post }: { post: NewsPost }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="border border-border rounded-lg overflow-hidden bg-secondary/20">
      {/* Header image */}
      {post.imageUrl && (
        <div className="w-full max-h-48 overflow-hidden">
          <img src={post.imageUrl} alt="" className="w-full object-cover" />
        </div>
      )}
      <div className="p-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            {post.isPinned && <Pin className="h-3.5 w-3.5 text-primary flex-shrink-0" />}
            <h3 className="text-sm font-semibold truncate">{post.title}</h3>
          </div>
          <span className="text-xs text-muted-foreground whitespace-nowrap">{timeAgoShort(post.createdAt)}</span>
        </div>
        {/* Content preview or full */}
        <div
          className={cn(
            "mt-2 text-sm text-muted-foreground prose prose-invert prose-sm max-w-none",
            "[&_h2]:text-base [&_h2]:font-bold [&_h3]:text-sm [&_h3]:font-semibold [&_a]:text-primary [&_img]:rounded-md [&_img]:max-w-full",
            !expanded && "line-clamp-3"
          )}
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
        <button
          onClick={() => setExpanded(!expanded)}
          className="mt-1 flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors"
        >
          {expanded ? (
            <>Show less <ChevronUp className="h-3 w-3" /></>
          ) : (
            <>Read more <ChevronDown className="h-3 w-3" /></>
          )}
        </button>
      </div>
    </div>
  );
}

function ToolBtn({ icon: Icon, title, onClick }: { icon: React.ComponentType<{ className?: string }>; title: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className="p-1.5 rounded hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
    >
      <Icon className="h-4 w-4" />
    </button>
  );
}

function InlineNewsEditor({ password, onSaved, onCancel }: { password: string; onSaved: () => void; onCancel: () => void }) {
  const [title, setTitle] = useState("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isPinned, setIsPinned] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const editorRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function exec(command: string, value?: string) {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
  }

  async function handleSave() {
    const content = editorRef.current?.innerHTML || "";
    if (!title.trim() || !content.trim()) {
      setMessage({ type: "error", text: "Title and content are required" });
      return;
    }

    setSaving(true);
    setMessage(null);

    try {
      const res = await fetch("/api/news", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password, title, content, imageUrl, isPinned }),
      });
      if (res.ok) {
        onSaved();
      } else {
        const data = await res.json();
        setMessage({ type: "error", text: data.error || "Failed to save" });
      }
    } catch {
      setMessage({ type: "error", text: "Network error" });
    }
    setSaving(false);
  }

  async function handleFileSelected(e: React.ChangeEvent<HTMLInputElement>, isHeader: boolean) {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("password", password);

    try {
      const res = await fetch("/api/news/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (res.ok) {
        if (isHeader) {
          setImageUrl(data.url);
        } else {
          const img = `<img src="${data.url}" alt="news image" style="max-width:100%;border-radius:6px;margin:8px 0;" />`;
          document.execCommand("insertHTML", false, img);
          editorRef.current?.focus();
        }
      } else {
        setMessage({ type: "error", text: data.error || "Upload failed" });
      }
    } catch {
      setMessage({ type: "error", text: "Upload failed" });
    }
    e.target.value = "";
  }

  return (
    <div className="border border-border rounded-lg overflow-hidden bg-secondary/20">
      <div className="p-3 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold">New Post</h3>
          <button onClick={onCancel} className="text-muted-foreground hover:text-foreground">
            <X className="h-4 w-4" />
          </button>
        </div>

        {message && (
          <div className={cn(
            "flex items-center gap-2 p-2 rounded-lg border text-xs",
            message.type === "success"
              ? "bg-green-500/10 border-green-500/30 text-green-400"
              : "bg-red-500/10 border-red-500/30 text-red-400"
          )}>
            {message.type === "success" ? <CheckCircle className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
            {message.text}
          </div>
        )}

        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Post title..."
          className="w-full bg-secondary border border-border rounded-md py-2 px-3 text-sm font-medium focus:outline-none focus:ring-1 focus:ring-primary"
        />

        {/* Header image */}
        <div className="flex items-center gap-2">
          <label className="text-xs text-muted-foreground">Header Image:</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => handleFileSelected(e, true)}
            className="text-xs text-muted-foreground"
          />
          {imageUrl && (
            <button onClick={() => setImageUrl(null)} className="text-xs text-red-400 hover:text-red-300">Remove</button>
          )}
        </div>
        {imageUrl && (
          <img src={imageUrl} alt="Header preview" className="max-h-32 rounded-md" />
        )}

        {/* Pinned toggle */}
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input
            type="checkbox"
            checked={isPinned}
            onChange={(e) => setIsPinned(e.target.checked)}
            className="rounded"
          />
          <Pin className="h-3.5 w-3.5" />
          Pin to top
        </label>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-0.5 p-1.5 border-y border-border bg-secondary/30 flex-wrap">
        <ToolBtn icon={Bold} title="Bold" onClick={() => exec("bold")} />
        <ToolBtn icon={Italic} title="Italic" onClick={() => exec("italic")} />
        <div className="w-px h-5 bg-border mx-1" />
        <ToolBtn icon={Heading1} title="Heading 1" onClick={() => exec("formatBlock", "h2")} />
        <ToolBtn icon={Heading2} title="Heading 2" onClick={() => exec("formatBlock", "h3")} />
        <div className="w-px h-5 bg-border mx-1" />
        <ToolBtn icon={List} title="Bullet List" onClick={() => exec("insertUnorderedList")} />
        <ToolBtn icon={ListOrdered} title="Numbered List" onClick={() => exec("insertOrderedList")} />
        <div className="w-px h-5 bg-border mx-1" />
        <ToolBtn icon={LinkIcon} title="Insert Link" onClick={() => {
          const url = prompt("Enter URL:");
          if (url) exec("createLink", url);
        }} />
        <ToolBtn icon={Image} title="Insert Image" onClick={() => fileInputRef.current?.click()} />
      </div>

      {/* Content editable area */}
      <div
        ref={editorRef}
        contentEditable
        className="min-h-[150px] p-3 text-sm focus:outline-none prose prose-invert prose-sm max-w-none [&_h2]:text-lg [&_h2]:font-bold [&_h2]:mt-3 [&_h2]:mb-1 [&_h3]:text-base [&_h3]:font-semibold [&_h3]:mt-2 [&_h3]:mb-1 [&_a]:text-primary [&_img]:rounded-md [&_img]:max-w-full"
        data-placeholder="Write your news post..."
        suppressContentEditableWarning
      />

      <div className="p-3 border-t border-border flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-1.5 bg-primary text-primary-foreground rounded-md py-1.5 px-4 text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {saving && <Loader2 className="h-4 w-4 animate-spin" />}
          Publish
        </button>
      </div>

      {/* Hidden file input for inline images */}
      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleFileSelected(e, false)} />
    </div>
  );
}

export function NewsWidget() {
  const [posts, setPosts] = useState<NewsPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEditor, setShowEditor] = useState(false);
  const { isAuthenticated, password } = useAdmin();

  const fetchPosts = useCallback(() => {
    fetch("/api/news?limit=5")
      .then((r) => r.json())
      .then((data) => setPosts(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchPosts(); }, [fetchPosts]);

  function handleSaved() {
    setShowEditor(false);
    setLoading(true);
    fetchPosts();
  }

  return (
    <div className="bg-card border border-border rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Newspaper className="h-5 w-5" />
          News & Announcements
        </h2>
        {isAuthenticated && !showEditor && (
          <button
            onClick={() => setShowEditor(true)}
            className="flex items-center gap-1.5 bg-primary text-primary-foreground rounded-md py-1.5 px-3 text-xs font-medium hover:opacity-90 transition-opacity"
          >
            <Plus className="h-3.5 w-3.5" />
            New Post
          </button>
        )}
      </div>

      {/* Inline editor */}
      {showEditor && (
        <div className="mb-4">
          <InlineNewsEditor
            password={password}
            onSaved={handleSaved}
            onCancel={() => setShowEditor(false)}
          />
        </div>
      )}

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading news...</p>
      ) : posts.length === 0 ? (
        <p className="text-sm text-muted-foreground">No news yet. Check back soon!</p>
      ) : (
        <div className="space-y-3">
          {posts.map((post) => (
            <NewsPostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}
