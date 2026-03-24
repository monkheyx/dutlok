"use client";

import { useState, useEffect } from "react";
import { ExternalLink, Rss, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

interface BlizzardPost {
  id: string;
  title: string;
  url: string;
  date: string;
  category: string;
  thumbnail?: string;
  excerpt?: string;
}

function timeAgoCompact(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d`;
  const weeks = Math.floor(days / 7);
  return `${weeks}w`;
}

const CATEGORY_COLORS: Record<string, string> = {
  "Hotfixes": "bg-red-500/15 text-red-400 border-red-500/20",
  "Patch Notes": "bg-orange-500/15 text-orange-400 border-orange-500/20",
  "Blue Post": "bg-blue-500/15 text-blue-400 border-blue-500/20",
  "PvP": "bg-purple-500/15 text-purple-400 border-purple-500/20",
  "Dungeons": "bg-green-500/15 text-green-400 border-green-500/20",
  "Raids": "bg-yellow-500/15 text-yellow-400 border-yellow-500/20",
};

export function BluePostsFeed() {
  const [posts, setPosts] = useState<BlizzardPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  async function fetchPosts() {
    setLoading(true);
    setError(false);
    try {
      const res = await fetch("/api/blizzard-news");
      if (res.ok) {
        const data = await res.json();
        setPosts(data);
      } else {
        setError(true);
      }
    } catch {
      setError(true);
    }
    setLoading(false);
  }

  useEffect(() => {
    fetchPosts();
  }, []);

  return (
    <div className="bg-card border border-border rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-bold uppercase tracking-[0.12em] text-blue-400 flex items-center gap-2">
          <Rss className="h-4 w-4" />
          WoW News & Blue Posts
        </h2>
        <button
          onClick={fetchPosts}
          disabled={loading}
          className="text-muted-foreground hover:text-foreground transition-colors p-1"
          title="Refresh"
        >
          <RefreshCw className={cn("h-3.5 w-3.5", loading && "animate-spin")} />
        </button>
      </div>

      {loading && posts.length === 0 ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-3 bg-secondary rounded w-3/4 mb-1.5" />
              <div className="h-2 bg-secondary rounded w-full mb-1" />
              <div className="h-2 bg-secondary rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : error && posts.length === 0 ? (
        <div className="text-center py-6">
          <p className="text-sm text-muted-foreground mb-2">
            Unable to load WoW news feed.
          </p>
          <div className="flex flex-wrap justify-center gap-2 text-xs">
            <a
              href="https://news.blizzard.com/en-us/world-of-warcraft"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-blue-400 hover:text-blue-300 transition-colors"
            >
              Blizzard News <ExternalLink className="h-3 w-3" />
            </a>
            <a
              href="https://www.wowhead.com/news"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-blue-400 hover:text-blue-300 transition-colors"
            >
              Wowhead <ExternalLink className="h-3 w-3" />
            </a>
            <a
              href="https://www.icy-veins.com/wow/news"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-blue-400 hover:text-blue-300 transition-colors"
            >
              Icy Veins <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          {posts.slice(0, 8).map((post) => {
            const categoryStyle = Object.entries(CATEGORY_COLORS).find(([key]) =>
              post.category.toLowerCase().includes(key.toLowerCase()) ||
              post.title.toLowerCase().includes(key.toLowerCase())
            )?.[1] || "bg-secondary text-muted-foreground border-border";

            return (
              <a
                key={post.id}
                href={post.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex gap-3 px-2 py-2 rounded-lg hover:bg-accent/50 transition-colors group"
              >
                {/* Thumbnail */}
                {post.thumbnail && (
                  <div className="w-16 h-10 rounded overflow-hidden flex-shrink-0 bg-secondary">
                    <img
                      src={post.thumbnail}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <div className="flex items-start gap-2">
                    <h3 className="text-sm font-medium text-foreground group-hover:text-primary transition-colors line-clamp-1 flex-1">
                      {post.title}
                    </h3>
                    <span className="text-[10px] text-muted-foreground/60 flex-shrink-0 mt-0.5">
                      {timeAgoCompact(post.date)}
                    </span>
                  </div>
                  {post.excerpt && (
                    <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                      {post.excerpt}
                    </p>
                  )}
                  <div className="flex items-center gap-2 mt-1">
                    <span className={cn("text-[10px] font-medium px-1.5 py-0.5 rounded border", categoryStyle)}>
                      {post.category}
                    </span>
                    <ExternalLink className="h-2.5 w-2.5 text-muted-foreground/30 group-hover:text-primary transition-colors" />
                  </div>
                </div>
              </a>
            );
          })}
        </div>
      )}

      {/* Footer links */}
      <div className="mt-3 pt-3 border-t border-border flex flex-wrap gap-3 justify-center text-[10px] text-muted-foreground">
        <a href="https://news.blizzard.com/en-us/world-of-warcraft" target="_blank" rel="noopener noreferrer" className="hover:text-blue-400 transition-colors flex items-center gap-1">
          Blizzard News <ExternalLink className="h-2.5 w-2.5" />
        </a>
        <a href="https://www.wowhead.com/news" target="_blank" rel="noopener noreferrer" className="hover:text-blue-400 transition-colors flex items-center gap-1">
          Wowhead <ExternalLink className="h-2.5 w-2.5" />
        </a>
        <a href="https://www.icy-veins.com/wow/news" target="_blank" rel="noopener noreferrer" className="hover:text-blue-400 transition-colors flex items-center gap-1">
          Icy Veins <ExternalLink className="h-2.5 w-2.5" />
        </a>
        <a href="https://worldofwarcraft.blizzard.com/en-us/news" target="_blank" rel="noopener noreferrer" className="hover:text-blue-400 transition-colors flex items-center gap-1">
          WoW Official <ExternalLink className="h-2.5 w-2.5" />
        </a>
      </div>
    </div>
  );
}
