"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useAdmin } from "@/components/admin-provider";
import {
  Bold, Italic, Heading1, Heading2, List, ListOrdered, Image, Link as LinkIcon,
  Pin, Trash2, Edit3, Plus, X, CheckCircle, AlertCircle, Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NewsPost {
  id: number;
  title: string;
  content: string;
  imageUrl: string | null;
  isPinned: boolean;
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
}

function EditorToolbar({ editorRef, onInsertImage }: { editorRef: React.RefObject<HTMLDivElement | null>; onInsertImage: () => void }) {
  function exec(command: string, value?: string) {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
  }

  return (
    <div className="flex items-center gap-0.5 p-1.5 border-b border-border bg-secondary/30 rounded-t-md flex-wrap">
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
      <ToolBtn icon={Image} title="Insert Image" onClick={onInsertImage} />
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

export function NewsEditor() {
  const { password } = useAdmin();
  const [posts, setPosts] = useState<NewsPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<number | null>(null); // null = new post mode off, 0 = new, >0 = editing existing
  const [title, setTitle] = useState("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isPinned, setIsPinned] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const editorRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchPosts = useCallback(async () => {
    try {
      const res = await fetch("/api/news?limit=50");
      const data = await res.json();
      setPosts(data);
    } catch { /* silent */ }
    setLoading(false);
  }, []);

  useEffect(() => { fetchPosts(); }, [fetchPosts]);

  function resetEditor() {
    setEditing(null);
    setTitle("");
    setImageUrl(null);
    setIsPinned(false);
    if (editorRef.current) editorRef.current.innerHTML = "";
  }

  function startEdit(post: NewsPost) {
    setEditing(post.id);
    setTitle(post.title);
    setImageUrl(post.imageUrl);
    setIsPinned(post.isPinned);
    // Set content after render
    setTimeout(() => {
      if (editorRef.current) editorRef.current.innerHTML = post.content;
    }, 0);
  }

  function startNew() {
    resetEditor();
    setEditing(0);
  }

  async function handleInsertImage() {
    fileInputRef.current?.click();
  }

  async function handleFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("password", password);

    try {
      const res = await fetch("/api/news/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (res.ok) {
        // Insert the image at cursor position in the editor
        const img = `<img src="${data.url}" alt="news image" style="max-width:100%;border-radius:6px;margin:8px 0;" />`;
        document.execCommand("insertHTML", false, img);
        editorRef.current?.focus();
      } else {
        setMessage({ type: "error", text: data.error || "Upload failed" });
      }
    } catch {
      setMessage({ type: "error", text: "Upload failed" });
    }
    // Reset file input
    e.target.value = "";
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
      if (editing === 0) {
        // Create new
        const res = await fetch("/api/news", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ password, title, content, imageUrl, isPinned }),
        });
        if (res.ok) {
          setMessage({ type: "success", text: "News post created" });
          resetEditor();
          fetchPosts();
        } else {
          const data = await res.json();
          setMessage({ type: "error", text: data.error || "Failed to save" });
        }
      } else if (editing && editing > 0) {
        // Update existing
        const res = await fetch(`/api/news/${editing}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ password, title, content, imageUrl, isPinned }),
        });
        if (res.ok) {
          setMessage({ type: "success", text: "News post updated" });
          resetEditor();
          fetchPosts();
        } else {
          const data = await res.json();
          setMessage({ type: "error", text: data.error || "Failed to update" });
        }
      }
    } catch {
      setMessage({ type: "error", text: "Network error" });
    }
    setSaving(false);
  }

  async function handleDelete(id: number) {
    if (!confirm("Delete this news post?")) return;
    try {
      const res = await fetch(`/api/news/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        setPosts((p) => p.filter((post) => post.id !== id));
        if (editing === id) resetEditor();
        setMessage({ type: "success", text: "Post deleted" });
      }
    } catch {
      setMessage({ type: "error", text: "Failed to delete" });
    }
  }

  async function togglePin(post: NewsPost) {
    try {
      await fetch(`/api/news/${post.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password, isPinned: !post.isPinned }),
      });
      fetchPosts();
    } catch { /* silent */ }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">News & Announcements</h2>
        {editing === null ? (
          <button
            onClick={startNew}
            className="flex items-center gap-1.5 bg-primary text-primary-foreground rounded-md py-1.5 px-3 text-sm font-medium hover:opacity-90 transition-opacity"
          >
            <Plus className="h-4 w-4" />
            New Post
          </button>
        ) : (
          <button
            onClick={resetEditor}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
            Cancel
          </button>
        )}
      </div>

      {message && (
        <div className={cn(
          "flex items-center gap-2 p-2 rounded-lg border text-sm",
          message.type === "success"
            ? "bg-green-500/10 border-green-500/30 text-green-400"
            : "bg-red-500/10 border-red-500/30 text-red-400"
        )}>
          {message.type === "success" ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
          {message.text}
        </div>
      )}

      {/* Editor */}
      {editing !== null && (
        <div className="border border-border rounded-lg overflow-hidden bg-secondary/20">
          <div className="p-3 space-y-3">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Post title..."
              className="w-full bg-secondary border border-border rounded-md py-2 px-3 text-sm font-medium focus:outline-none focus:ring-1 focus:ring-primary"
            />
            {/* Header image */}
            <div className="flex items-center gap-2">
              <label className="text-xs text-muted-foreground">Header Image (optional):</label>
              <input
                type="file"
                accept="image/*"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const formData = new FormData();
                  formData.append("file", file);
                  formData.append("password", password);
                  const res = await fetch("/api/news/upload", { method: "POST", body: formData });
                  const data = await res.json();
                  if (res.ok) setImageUrl(data.url);
                  e.target.value = "";
                }}
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
          {/* Rich text editor */}
          <EditorToolbar editorRef={editorRef} onInsertImage={handleInsertImage} />
          <div
            ref={editorRef}
            contentEditable
            className="min-h-[200px] p-3 text-sm focus:outline-none prose prose-invert prose-sm max-w-none [&_h2]:text-lg [&_h2]:font-bold [&_h2]:mt-3 [&_h2]:mb-1 [&_h3]:text-base [&_h3]:font-semibold [&_h3]:mt-2 [&_h3]:mb-1 [&_a]:text-primary [&_img]:rounded-md [&_img]:max-w-full"
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
              {editing === 0 ? "Publish" : "Update"}
            </button>
          </div>
          {/* Hidden file input for inline images */}
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileSelected} />
        </div>
      )}

      {/* Existing posts list */}
      {loading ? (
        <p className="text-sm text-muted-foreground">Loading posts...</p>
      ) : posts.length === 0 ? (
        <p className="text-sm text-muted-foreground">No news posts yet. Create the first one!</p>
      ) : (
        <div className="space-y-2">
          {posts.map((post) => (
            <div key={post.id} className="flex items-center justify-between p-3 bg-secondary/30 border border-border rounded-lg">
              <div className="flex items-center gap-2 min-w-0">
                {post.isPinned && <Pin className="h-3.5 w-3.5 text-primary flex-shrink-0" />}
                <span className="text-sm font-medium truncate">{post.title}</span>
                <span className="text-xs text-muted-foreground flex-shrink-0">
                  {new Date(post.createdAt).toLocaleDateString()}
                </span>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <button
                  onClick={() => togglePin(post)}
                  title={post.isPinned ? "Unpin" : "Pin"}
                  className={cn("p-1 rounded hover:bg-accent transition-colors", post.isPinned ? "text-primary" : "text-muted-foreground")}
                >
                  <Pin className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => startEdit(post)}
                  className="p-1 rounded hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Edit3 className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => handleDelete(post.id)}
                  className="p-1 rounded hover:bg-accent text-muted-foreground hover:text-red-400 transition-colors"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
