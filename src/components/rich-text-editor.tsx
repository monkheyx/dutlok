"use client";

import { useRef, useEffect } from "react";
import { Bold, Italic, Heading1, Heading2, List, ListOrdered, Image, Link as LinkIcon, Palette, Highlighter } from "lucide-react";

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

interface RichTextEditorProps {
  initialContent?: string;
  placeholder?: string;
  minHeight?: string;
  onUploadImage?: (file: File) => Promise<string | null>;
}

export function RichTextEditor({ initialContent, placeholder, minHeight = "200px", onUploadImage }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const textColorRef = useRef<HTMLInputElement>(null);
  const bgColorRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const initialized = useRef(false);

  useEffect(() => {
    if (initialContent && editorRef.current && !initialized.current) {
      editorRef.current.innerHTML = initialContent;
      initialized.current = true;
    }
  }, [initialContent]);

  function exec(command: string, value?: string) {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
  }

  function getContent(): string {
    return editorRef.current?.innerHTML || "";
  }

  async function handleFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !onUploadImage) return;

    const url = await onUploadImage(file);
    if (url) {
      const img = `<img src="${url}" alt="image" style="max-width:100%;border-radius:6px;margin:8px 0;" />`;
      document.execCommand("insertHTML", false, img);
      editorRef.current?.focus();
    }
    e.target.value = "";
  }

  // Expose getContent via a data attribute so parent can access it
  useEffect(() => {
    if (editorRef.current) {
      (editorRef.current as any).__getContent = getContent;
    }
  });

  return (
    <div className="border border-border rounded-lg overflow-hidden bg-secondary/10">
      {/* Toolbar */}
      <div className="flex items-center gap-0.5 p-1.5 border-b border-border bg-secondary/30 flex-wrap">
        <ToolBtn icon={Bold} title="Bold" onClick={() => exec("bold")} />
        <ToolBtn icon={Italic} title="Italic" onClick={() => exec("italic")} />
        <div className="w-px h-5 bg-border mx-1" />
        <ToolBtn icon={Heading1} title="Heading 1" onClick={() => exec("formatBlock", "h2")} />
        <ToolBtn icon={Heading2} title="Heading 2" onClick={() => exec("formatBlock", "h3")} />
        <div className="w-px h-5 bg-border mx-1" />
        <ToolBtn icon={List} title="Bullet List" onClick={() => exec("insertUnorderedList")} />
        <ToolBtn icon={ListOrdered} title="Numbered List" onClick={() => exec("insertOrderedList")} />
        <div className="w-px h-5 bg-border mx-1" />
        <div className="relative">
          <ToolBtn icon={Palette} title="Text Color" onClick={() => textColorRef.current?.click()} />
          <input ref={textColorRef} type="color" defaultValue="#ffffff" onChange={(e) => exec("foreColor", e.target.value)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
        </div>
        <div className="relative">
          <ToolBtn icon={Highlighter} title="Highlight" onClick={() => bgColorRef.current?.click()} />
          <input ref={bgColorRef} type="color" defaultValue="#ffff00" onChange={(e) => exec("hiliteColor", e.target.value)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
        </div>
        <div className="w-px h-5 bg-border mx-1" />
        <ToolBtn icon={LinkIcon} title="Insert Link" onClick={() => { const url = prompt("Enter URL:"); if (url) exec("createLink", url); }} />
        {onUploadImage && <ToolBtn icon={Image} title="Insert Image" onClick={() => fileInputRef.current?.click()} />}
      </div>

      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable
        className="p-3 text-sm focus:outline-none prose prose-invert prose-sm max-w-none [&_h2]:text-lg [&_h2]:font-bold [&_h2]:mt-3 [&_h2]:mb-1 [&_h3]:text-base [&_h3]:font-semibold [&_h3]:mt-2 [&_h3]:mb-1 [&_a]:text-primary [&_img]:rounded-md [&_img]:max-w-full"
        style={{ minHeight }}
        data-placeholder={placeholder || "Start writing..."}
        suppressContentEditableWarning
      />

      {onUploadImage && <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileSelected} />}
    </div>
  );
}

/** Get content from a RichTextEditor's container element */
export function getEditorContent(editorContainer: HTMLElement | null): string {
  if (!editorContainer) return "";
  const editable = editorContainer.querySelector<HTMLDivElement>("[contenteditable]");
  return editable?.innerHTML || "";
}
