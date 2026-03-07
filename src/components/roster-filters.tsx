"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback } from "react";
import { Search, X } from "lucide-react";
import { CLASS_COLORS } from "@/lib/wow-data";

const CLASSES = [
  "Death Knight", "Demon Hunter", "Druid", "Evoker", "Hunter",
  "Mage", "Monk", "Paladin", "Priest", "Rogue",
  "Shaman", "Warlock", "Warrior",
];

const ROLES = [
  { value: "tank", label: "Tank" },
  { value: "healer", label: "Healer" },
  { value: "melee_dps", label: "Melee DPS" },
  { value: "ranged_dps", label: "Ranged DPS" },
];

export function RosterFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const updateFilter = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      router.push(`${pathname}?${params.toString()}`);
    },
    [router, pathname, searchParams]
  );

  const clearFilters = () => {
    router.push(pathname);
  };

  const hasFilters = searchParams.toString() !== "";

  return (
    <div className="bg-card border border-border rounded-lg p-4 space-y-3">
      <div className="flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search characters..."
            defaultValue={searchParams.get("search") ?? ""}
            onChange={(e) => updateFilter("search", e.target.value)}
            className="w-full bg-secondary border border-border rounded-md py-2 pl-9 pr-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        {/* Class filter */}
        <select
          value={searchParams.get("class") ?? ""}
          onChange={(e) => updateFilter("class", e.target.value)}
          className="bg-secondary border border-border rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
        >
          <option value="">All Classes</option>
          {CLASSES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>

        {/* Role filter */}
        <select
          value={searchParams.get("role") ?? ""}
          onChange={(e) => updateFilter("role", e.target.value)}
          className="bg-secondary border border-border rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
        >
          <option value="">All Roles</option>
          {ROLES.map((r) => (
            <option key={r.value} value={r.value}>{r.label}</option>
          ))}
        </select>

        {/* Main/Alt filter */}
        <select
          value={searchParams.get("main") ?? ""}
          onChange={(e) => updateFilter("main", e.target.value)}
          className="bg-secondary border border-border rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
        >
          <option value="">Mains & Alts</option>
          <option value="true">Mains Only</option>
          <option value="false">Alts Only</option>
        </select>

        {/* Sort */}
        <select
          value={searchParams.get("sort") ?? "name"}
          onChange={(e) => updateFilter("sort", e.target.value)}
          className="bg-secondary border border-border rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
        >
          <option value="name">Sort: Name</option>
          <option value="className">Sort: Class</option>
          <option value="itemLevel">Sort: Item Level</option>
          <option value="role">Sort: Role</option>
          <option value="lastSyncedAt">Sort: Last Updated</option>
        </select>

        {/* Sort direction */}
        <button
          onClick={() => updateFilter("dir", searchParams.get("dir") === "desc" ? "asc" : "desc")}
          className="bg-secondary border border-border rounded-md py-2 px-3 text-sm hover:bg-accent transition-colors"
        >
          {searchParams.get("dir") === "desc" ? "Z-A" : "A-Z"}
        </button>

        {hasFilters && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-4 w-4" />
            Clear
          </button>
        )}
      </div>
    </div>
  );
}
