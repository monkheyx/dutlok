import { NextResponse } from "next/server";

interface BlizzardPost {
  id: string;
  title: string;
  url: string;
  date: string;
  category: string;
  thumbnail?: string;
  excerpt?: string;
}

// Cache blue posts for 30 minutes
let cache: { posts: BlizzardPost[]; fetchedAt: number } | null = null;
const CACHE_TTL = 30 * 60 * 1000;

async function fetchBlizzardNews(): Promise<BlizzardPost[]> {
  if (cache && Date.now() - cache.fetchedAt < CACHE_TTL) {
    return cache.posts;
  }

  const posts: BlizzardPost[] = [];

  try {
    // Fetch from Blizzard's news RSS/JSON feed
    const res = await fetch(
      "https://news.blizzard.com/en-us/feed/wow",
      { next: { revalidate: 1800 } }
    );

    if (res.ok) {
      const text = await res.text();
      // Parse RSS XML
      const items = text.match(/<item>([\s\S]*?)<\/item>/g) || [];
      for (const item of items.slice(0, 10)) {
        const title = item.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/)?.[1]
          || item.match(/<title>(.*?)<\/title>/)?.[1]
          || "Untitled";
        const link = item.match(/<link>(.*?)<\/link>/)?.[1] || "";
        const pubDate = item.match(/<pubDate>(.*?)<\/pubDate>/)?.[1] || "";
        const description = item.match(/<description><!\[CDATA\[(.*?)\]\]><\/description>/)?.[1]
          || item.match(/<description>(.*?)<\/description>/)?.[1]
          || "";
        const category = item.match(/<category>(.*?)<\/category>/)?.[1] || "News";
        const thumbnail = item.match(/<media:thumbnail[^>]*url="([^"]*)"/) ?.[1]
          || item.match(/<enclosure[^>]*url="([^"]*)"/) ?.[1]
          || "";

        posts.push({
          id: link || title,
          title: decodeHtmlEntities(title),
          url: link,
          date: pubDate ? new Date(pubDate).toISOString() : new Date().toISOString(),
          category: decodeHtmlEntities(category),
          thumbnail: thumbnail || undefined,
          excerpt: decodeHtmlEntities(stripHtml(description)).slice(0, 200),
        });
      }
    }
  } catch {
    // Blizzard feed unavailable — return empty
  }

  // If Blizzard feed fails, try Wowhead news as fallback
  if (posts.length === 0) {
    try {
      const res = await fetch("https://www.wowhead.com/news/rss/all", {
        next: { revalidate: 1800 },
      });
      if (res.ok) {
        const text = await res.text();
        const items = text.match(/<item>([\s\S]*?)<\/item>/g) || [];
        for (const item of items.slice(0, 10)) {
          const title = item.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/)?.[1]
            || item.match(/<title>(.*?)<\/title>/)?.[1]
            || "Untitled";
          const link = item.match(/<link>(.*?)<\/link>/)?.[1] || "";
          const pubDate = item.match(/<pubDate>(.*?)<\/pubDate>/)?.[1] || "";
          const description = item.match(/<description><!\[CDATA\[([\s\S]*?)\]\]><\/description>/)?.[1]
            || item.match(/<description>([\s\S]*?)<\/description>/)?.[1]
            || "";
          const category = item.match(/<category><!\[CDATA\[(.*?)\]\]><\/category>/)?.[1]
            || item.match(/<category>(.*?)<\/category>/)?.[1]
            || "News";

          posts.push({
            id: link || title,
            title: decodeHtmlEntities(title),
            url: link,
            date: pubDate ? new Date(pubDate).toISOString() : new Date().toISOString(),
            category: decodeHtmlEntities(category),
            excerpt: decodeHtmlEntities(stripHtml(description)).slice(0, 200),
          });
        }
      }
    } catch {
      // fallback also failed
    }
  }

  cache = { posts, fetchedAt: Date.now() };
  return posts;
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").trim();
}

function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&#x2F;/g, "/");
}

export async function GET() {
  const posts = await fetchBlizzardNews();
  return NextResponse.json(posts);
}
