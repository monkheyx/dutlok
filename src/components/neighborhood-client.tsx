"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { cn } from "@/lib/utils";
import { useAdmin } from "@/components/admin-provider";
import {
  ChevronLeft,
  ChevronRight,
  Heart,
  CheckCircle,
  HelpCircle,
  Home,
  Search,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import dynamic from "next/dynamic";

// Lazy-load the map to avoid SSR issues with Leaflet
const NeighborhoodMap = dynamic(() => import("./neighborhood-map"), {
  ssr: false,
  loading: () => (
    <div className="w-full aspect-[3/2] bg-black rounded-l-lg flex items-center justify-center text-muted-foreground">
      Loading map...
    </div>
  ),
});

// ── Data types ──────────────────────────────────────────────────────────────
interface PlotAssignment {
  id: number;
  mapId: number;
  plotId: number;
  shardIndex: number;
  characterId: number | null;
  characterName: string;
  status: string;
  rankedChoice: number;
  note: string | null;
}

interface Character {
  id: number;
  name: string;
  className: string | null;
  activeSpec: string | null;
  isActive: boolean;
}

const CLASS_COLORS: Record<string, string> = {
  Warrior: "#C79C6E", Paladin: "#F58CBA", Hunter: "#ABD473", Rogue: "#FFF569",
  Priest: "#FFFFFF", "Death Knight": "#C41F3B", Shaman: "#0070DE", Mage: "#69CCF0",
  Warlock: "#9482C9", Monk: "#00FF96", Druid: "#FF7D0A", "Demon Hunter": "#A330C9",
  Evoker: "#33937F",
};

// ── Static plot positions (Alliance Subdivision 1, map_id=1) ────────────
export const PLOT_POSITIONS: { x: number; y: number }[] = [
  { x: 2299, y: 941 }, { x: 1668, y: 1143 }, { x: 2012, y: 1257 },
  { x: 2491, y: 794 }, { x: 1142, y: 570 }, { x: 1410, y: 1196 },
  { x: 2446, y: 1150 }, { x: 1965, y: 512 }, { x: 2114, y: 1416 },
  { x: 1886, y: 550 }, { x: 1913, y: 1348 }, { x: 2066, y: 994 },
  { x: 1009, y: 700 }, { x: 1474, y: 1046 }, { x: 1359, y: 1104 },
  { x: 2016, y: 1102 }, { x: 2074, y: 933 }, { x: 2390, y: 952 },
  { x: 2294, y: 1477 }, { x: 1311, y: 688 }, { x: 2355, y: 1345 },
  { x: 2599, y: 1206 }, { x: 2544, y: 903 }, { x: 2577, y: 685 },
  { x: 1286, y: 323 }, { x: 1042, y: 609 }, { x: 1696, y: 1226 },
  { x: 1958, y: 442 }, { x: 1120, y: 464 }, { x: 1271, y: 546 },
  { x: 1530, y: 1177 }, { x: 2422, y: 692 }, { x: 2606, y: 807 },
  { x: 2187, y: 1288 }, { x: 1574, y: 604 }, { x: 1440, y: 1314 },
  { x: 1286, y: 1106 }, { x: 1755, y: 1306 }, { x: 2353, y: 1246 },
  { x: 1642, y: 516 }, { x: 1067, y: 528 }, { x: 2394, y: 1543 },
  { x: 1793, y: 510 }, { x: 1275, y: 444 }, { x: 1866, y: 432 },
  { x: 1658, y: 622 }, { x: 1870, y: 787 }, { x: 1851, y: 688 },
  { x: 1511, y: 908 }, { x: 1839, y: 867 }, { x: 1386, y: 736 },
  { x: 1750, y: 686 }, { x: 1429, y: 647 }, { x: 1558, y: 952 },
  { x: 1945, y: 817 },
];

export const PORTAL_POSITION = { x: 2252, y: 345 };

const TOTAL_PLOTS = 55;
const FACTIONS = ["Alliance", "Horde"] as const;
type Faction = (typeof FACTIONS)[number];

// ── Main component ──────────────────────────────────────────────────────────
export function NeighborhoodClient() {
  const { password, isAuthenticated } = useAdmin();
  const [plots, setPlots] = useState<PlotAssignment[]>([]);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState(true);

  const [faction, setFaction] = useState<Faction>("Alliance");
  const [shardIndex, setShardIndex] = useState(0);
  const [maxShard] = useState(2); // 0, 1, 2 = Subdivision 1, 2, 3
  const mapId = faction === "Alliance" ? 1 : 2;

  const [activePlot, setActivePlot] = useState<number | null>(null);
  const [tableFilter, setTableFilter] = useState<"all" | "settled" | "homeless">("all");
  const [tableSearch, setTableSearch] = useState("");

  // Assign form state
  const [showAssignForm, setShowAssignForm] = useState(false);
  const [assignPlotId, setAssignPlotId] = useState(0);
  const [assignCharId, setAssignCharId] = useState<number | null>(null);
  const [assignChoice, setAssignChoice] = useState(1);
  const [assignStatus, setAssignStatus] = useState("requested");
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const plotGridRef = useRef<HTMLDivElement>(null);
  const plotCardRefs = useRef<Map<number, HTMLDivElement>>(new Map());

  // ── Fetch data ──────────────────────────────────────────────────────────
  const fetchData = useCallback(async () => {
    try {
      const res = await fetch(`/api/neighborhood?map_id=${mapId}&shard_index=${shardIndex}`);
      const data = await res.json();
      setPlots(Array.isArray(data.plots) ? data.plots : []);
      setCharacters(Array.isArray(data.characters) ? data.characters : []);
    } catch { /* silent */ }
    setLoading(false);
  }, [mapId, shardIndex]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // ── Derived data ────────────────────────────────────────────────────────
  const approvedFirstChoicePlots = useMemo(() => {
    const map = new Map<number, PlotAssignment>();
    for (const p of plots) {
      if (p.status === "approved" && p.rankedChoice === 1) {
        map.set(p.plotId, p);
      }
    }
    return map;
  }, [plots]);

  const stats = useMemo(() => {
    const occupiedPlotIds = new Set<number>();
    let requested = 0;
    let approved = 0;
    for (const p of plots) {
      if (p.rankedChoice === 1) {
        occupiedPlotIds.add(p.plotId);
        if (p.status === "approved") approved++;
        else if (p.status === "requested") requested++;
      }
    }
    return { available: TOTAL_PLOTS - occupiedPlotIds.size, requested, approved };
  }, [plots]);

  // ── Plot selection ──────────────────────────────────────────────────────
  function handlePlotClick(plotId: number) {
    setActivePlot(plotId);
    const card = plotCardRefs.current.get(plotId);
    if (card && plotGridRef.current) {
      card.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }

  function handleCardClick(plotId: number) {
    setActivePlot(plotId);
    // Map will react to activePlot change
  }

  // ── Character lookup helpers ────────────────────────────────────────────
  function getCharByName(name: string) {
    return characters.find((c) => c.name === name) ?? null;
  }

  function getPlotOccupant(plotId: number): PlotAssignment | undefined {
    return approvedFirstChoicePlots.get(plotId);
  }

  // ── Assignment actions ──────────────────────────────────────────────────
  async function handleAssign(e: React.FormEvent) {
    e.preventDefault();
    if (assignCharId === null) return;
    setMessage(null);
    const char = characters.find((c) => c.id === assignCharId);
    if (!char) return;

    try {
      const res = await fetch("/api/neighborhood", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          password,
          characterId: char.id,
          characterName: char.name,
          plotId: assignPlotId,
          mapId,
          shardIndex,
          rankedChoice: assignChoice,
          status: assignStatus,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage({ type: "success", text: `Assigned ${char.name} to Plot ${assignPlotId}` });
        setShowAssignForm(false);
        fetchData();
      } else {
        setMessage({ type: "error", text: data.error || "Failed to assign" });
      }
    } catch {
      setMessage({ type: "error", text: "Network error" });
    }
  }

  async function handleDeleteAssignment(id: number) {
    try {
      await fetch(`/api/neighborhood/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      fetchData();
    } catch { /* silent */ }
  }

  async function handleApprove(id: number) {
    try {
      await fetch(`/api/neighborhood/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password, status: "approved" }),
      });
      fetchData();
    } catch { /* silent */ }
  }

  // ── Character table data ────────────────────────────────────────────────
  const characterTableRows = useMemo(() => {
    const rows = characters.map((char) => {
      const charPlots = plots.filter((p) => p.characterId === char.id || p.characterName === char.name);
      const first = charPlots.find((p) => p.rankedChoice === 1);
      const second = charPlots.find((p) => p.rankedChoice === 2);
      const third = charPlots.find((p) => p.rankedChoice === 3);
      return { char, first, second, third, hasPlots: charPlots.length > 0 };
    });

    let filtered = rows;
    if (tableFilter === "settled") filtered = rows.filter((r) => r.hasPlots);
    if (tableFilter === "homeless") filtered = rows.filter((r) => !r.hasPlots);
    if (tableSearch) {
      const q = tableSearch.toLowerCase();
      filtered = filtered.filter((r) => r.char.name.toLowerCase().includes(q));
    }

    return filtered.sort((a, b) => a.char.name.localeCompare(b.char.name));
  }, [characters, plots, tableFilter, tableSearch]);

  // ── Plot grid helpers ───────────────────────────────────────────────────
  function plotImageUrl(plotId: number) {
    const f = faction.toLowerCase();
    return `https://data.wowaudit.com/img/housing/plots/plot_${f}_${plotId}_thumbnail.jpg`;
  }

  if (loading) {
    return <div className="text-muted-foreground py-8">Loading neighborhood data...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header controls */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          {/* Shard selector */}
          <div className="flex items-center gap-1 bg-card border border-border rounded-md px-2 py-1">
            <button
              onClick={() => setShardIndex(Math.max(0, shardIndex - 1))}
              disabled={shardIndex === 0}
              className="p-1 text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-sm font-medium px-2">Subdivision {shardIndex + 1}</span>
            <button
              onClick={() => setShardIndex(Math.min(maxShard, shardIndex + 1))}
              disabled={shardIndex === maxShard}
              className="p-1 text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {/* Faction dropdown */}
          <select
            value={faction}
            onChange={(e) => setFaction(e.target.value as Faction)}
            className="bg-card border border-border rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
          >
            {FACTIONS.map((f) => (
              <option key={f} value={f}>{f}</option>
            ))}
          </select>
        </div>

        {isAuthenticated && (
          <button
            onClick={() => setShowAssignForm(!showAssignForm)}
            className="flex items-center gap-2 bg-primary text-primary-foreground rounded-md py-2 px-4 text-sm font-medium hover:opacity-90 transition-opacity"
          >
            <Plus className="h-4 w-4" />
            Assign Plot
          </button>
        )}
      </div>

      {/* Message */}
      {message && (
        <div className={cn(
          "flex items-center gap-2 p-3 rounded-lg border text-sm",
          message.type === "success" ? "bg-green-500/10 border-green-500/30 text-green-400" : "bg-red-500/10 border-red-500/30 text-red-400"
        )}>
          {message.type === "success" ? <CheckCircle className="h-4 w-4" /> : <X className="h-4 w-4" />}
          {message.text}
        </div>
      )}

      {/* Assign form */}
      {showAssignForm && isAuthenticated && (
        <div className="bg-card border border-border rounded-lg p-4">
          <h3 className="text-sm font-semibold mb-3">Assign Character to Plot</h3>
          <form onSubmit={handleAssign} className="flex flex-wrap items-end gap-3">
            <div>
              <label className="text-xs text-muted-foreground">Character</label>
              <select
                value={assignCharId ?? ""}
                onChange={(e) => setAssignCharId(e.target.value ? parseInt(e.target.value) : null)}
                className="w-full mt-1 bg-secondary border border-border rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                required
              >
                <option value="">Select...</option>
                {characters.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Plot #</label>
              <input
                type="number" min={0} max={54}
                value={assignPlotId}
                onChange={(e) => setAssignPlotId(parseInt(e.target.value) || 0)}
                className="w-20 mt-1 bg-secondary border border-border rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Choice</label>
              <select
                value={assignChoice}
                onChange={(e) => setAssignChoice(parseInt(e.target.value))}
                className="mt-1 bg-secondary border border-border rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value={1}>1st</option>
                <option value={2}>2nd</option>
                <option value={3}>3rd</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Status</label>
              <select
                value={assignStatus}
                onChange={(e) => setAssignStatus(e.target.value)}
                className="mt-1 bg-secondary border border-border rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="requested">Requested</option>
                <option value="approved">Approved</option>
              </select>
            </div>
            <button type="submit" className="bg-primary text-primary-foreground rounded-md py-2 px-4 text-sm font-medium hover:opacity-90 transition-opacity">
              Assign
            </button>
          </form>
        </div>
      )}

      {/* Intro + Summary */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <p className="text-sm text-muted-foreground">
            Manage your guild&apos;s neighborhood plot assignments. View who has claimed or been approved
            for each plot, and coordinate housing preferences across the guild.
          </p>
        </div>
        <div className="bg-card border border-border rounded-lg p-4 min-w-[200px]">
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Available</span>
              <span className="font-bold text-foreground">{stats.available}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Requested</span>
              <span className="font-bold text-yellow-400">{stats.requested}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Approved</span>
              <span className="font-bold text-green-400">{stats.approved}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Map + Plot Grid */}
      <div className="flex flex-col lg:flex-row border border-border rounded-lg overflow-hidden" style={{ minHeight: "500px" }}>
        {/* Left: Map */}
        <div className="lg:w-2/3 w-full">
          <NeighborhoodMap
            faction={faction}
            mapId={mapId}
            plots={plots}
            activePlot={activePlot}
            onPlotClick={handlePlotClick}
            approvedFirstChoicePlots={approvedFirstChoicePlots}
          />
        </div>

        {/* Right: Plot Grid */}
        <div
          ref={plotGridRef}
          className="lg:w-1/3 w-full flex flex-col gap-2 overflow-y-auto p-3"
          style={{ backgroundColor: "#23232e", maxHeight: "600px" }}
        >
          {Array.from({ length: TOTAL_PLOTS }, (_, i) => {
            const occupant = getPlotOccupant(i);
            const occupantChar = occupant ? getCharByName(occupant.characterName) : null;
            return (
              <div
                key={i}
                ref={(el) => { if (el) plotCardRefs.current.set(i, el); }}
                onClick={() => handleCardClick(i)}
                className={cn(
                  "relative rounded-lg overflow-hidden cursor-pointer border-2 transition-colors min-h-[5.6rem]",
                  activePlot === i ? "border-green-500" : "border-transparent hover:border-green-500/50"
                )}
              >
                {/* Plot thumbnail */}
                <img
                  src={plotImageUrl(i)}
                  alt={`Plot ${i}`}
                  className="w-full h-full object-cover absolute inset-0"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
                {/* Fallback bg */}
                <div className="absolute inset-0 bg-secondary" style={{ zIndex: -1 }} />
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-transparent" />
                {/* Content */}
                <div className="relative p-2 flex flex-col justify-end min-h-[5.6rem]">
                  <div className="flex items-center justify-between">
                    <span className="bg-black/70 text-white text-xs font-bold px-2 py-0.5 rounded">
                      {i}
                    </span>
                    {occupant && occupantChar && (
                      <span
                        className="flex items-center gap-1 text-xs font-medium"
                        style={{ color: CLASS_COLORS[occupantChar.className ?? ""] || "#ccc" }}
                      >
                        <Heart className="h-3 w-3 fill-current" />
                        {occupant.characterName}
                      </span>
                    )}
                    {!occupant && (
                      <span className="text-xs text-muted-foreground/60">Empty</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Character Table */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-b border-border">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Home className="h-5 w-5" />
            Plot Choices
          </h2>
          <div className="flex items-center gap-2">
            {/* Search */}
            <div className="relative">
              <Search className="h-3.5 w-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search..."
                value={tableSearch}
                onChange={(e) => setTableSearch(e.target.value)}
                className="bg-secondary border border-border rounded-md py-1.5 pl-8 pr-3 text-sm w-40 focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            {/* Filter */}
            <div className="flex gap-1">
              {(["all", "settled", "homeless"] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setTableFilter(f)}
                  className={cn(
                    "px-3 py-1.5 rounded-md text-xs font-medium border transition-colors capitalize",
                    tableFilter === f
                      ? "bg-primary/20 border-primary/50 text-primary"
                      : "bg-secondary border-border text-muted-foreground hover:text-foreground"
                  )}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-secondary/50">
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Character</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                  <Home className="h-4 w-4" />
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                  <span className="flex items-center gap-1"><Heart className="h-3.5 w-3.5" /> 1st Choice</span>
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">2nd Choice</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">3rd Choice</th>
                {isAuthenticated && (
                  <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Actions</th>
                )}
              </tr>
            </thead>
            <tbody>
              {characterTableRows.map(({ char, first, second, third }) => (
                <tr
                  key={char.id}
                  className="border-b border-border/50 hover:bg-accent/50 transition-colors"
                >
                  <td className="py-3 px-4">
                    <span
                      className="font-medium text-sm"
                      style={{ color: CLASS_COLORS[char.className ?? ""] || "#ccc" }}
                    >
                      {char.name}
                    </span>
                    {char.activeSpec && (
                      <span className="text-xs text-muted-foreground ml-2">
                        {char.activeSpec} {char.className}
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    {first?.status === "approved" ? (
                      <Home className="h-4 w-4 text-green-400" />
                    ) : first ? (
                      <Home className="h-4 w-4 text-yellow-400/60" />
                    ) : (
                      <Home className="h-4 w-4 text-muted-foreground/20" />
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <PlotChoiceBadge assignment={first} />
                  </td>
                  <td className="py-3 px-4">
                    <PlotChoiceBadge assignment={second} muted />
                  </td>
                  <td className="py-3 px-4">
                    <PlotChoiceBadge assignment={third} muted />
                  </td>
                  {isAuthenticated && (
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {first && first.status === "requested" && (
                          <button
                            onClick={() => handleApprove(first.id)}
                            className="text-xs text-green-400 hover:text-green-300 px-2 py-1 rounded hover:bg-green-500/10 transition-colors"
                            title="Approve"
                          >
                            <CheckCircle className="h-3.5 w-3.5" />
                          </button>
                        )}
                        {[first, second, third].filter(Boolean).map((p) => (
                          <button
                            key={p!.id}
                            onClick={() => handleDeleteAssignment(p!.id)}
                            className="text-xs text-muted-foreground hover:text-red-400 px-1 py-1 rounded hover:bg-red-500/10 transition-colors"
                            title={`Remove choice ${p!.rankedChoice}`}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        ))}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
              {characterTableRows.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-muted-foreground text-sm">
                    No characters found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ── Plot choice badge ───────────────────────────────────────────────────────
function PlotChoiceBadge({ assignment, muted }: { assignment?: PlotAssignment; muted?: boolean }) {
  if (!assignment) return <span className="text-xs text-muted-foreground/30">—</span>;

  const isApproved = assignment.status === "approved";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium",
        isApproved && !muted
          ? "bg-green-500/15 text-green-400 border border-green-500/30"
          : muted
            ? "text-muted-foreground"
            : "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20"
      )}
    >
      Plot {assignment.plotId}
      {isApproved && !muted && <CheckCircle className="h-3 w-3 text-green-400" />}
      {!isApproved && !muted && <HelpCircle className="h-3 w-3 text-yellow-400" />}
    </span>
  );
}
