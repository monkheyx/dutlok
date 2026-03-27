"use client";

import { useState, useEffect, useCallback } from "react";
import { useAdmin } from "@/components/admin-provider";
import { Calendar, Plus, Users, CheckCircle, Clock, XCircle, Armchair, Trash2, AlertCircle, Swords, ChevronDown, ChevronUp, Upload, FileJson, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { WowheadItem, useWowheadTooltips } from "@/components/wowhead-item";

interface Character {
  id: number;
  name: string;
  className: string | null;
  activeSpec: string | null;
  isActive: boolean;
  isRaider: boolean;
}

interface AttendanceRecord {
  id: number;
  raidName: string;
  raidDate: string;
  difficulty: string | null;
  characterId: number | null;
  characterName: string;
  status: string;
  notes: string | null;
}

interface LootEntry {
  id: number;
  characterName: string;
  itemName: string;
  itemId: number | null;
  itemQuality: string | null;
  itemLevel: number | null;
  bossName: string | null;
  raidName: string | null;
  raidDate: string;
  notes: string | null;
  awardedBy: string | null;
}

const QUALITY_CLASSES: Record<string, string> = {
  poor: "quality-poor",
  common: "quality-common",
  uncommon: "quality-uncommon",
  rare: "quality-rare",
  epic: "quality-epic",
  legendary: "quality-legendary",
  artifact: "quality-artifact",
  heirloom: "quality-heirloom",
};

const QUALITIES = ["Common", "Uncommon", "Rare", "Epic", "Legendary"];

const STATUS_OPTIONS = [
  { value: "present", label: "Present", icon: CheckCircle, color: "text-green-400", bg: "bg-green-500/20" },
  { value: "late", label: "Late", icon: Clock, color: "text-yellow-400", bg: "bg-yellow-500/20" },
  { value: "absent", label: "Absent", icon: XCircle, color: "text-red-400", bg: "bg-red-500/20" },
  { value: "bench", label: "Bench", icon: Armchair, color: "text-blue-400", bg: "bg-blue-500/20" },
];

const DIFFICULTIES = ["Normal", "Heroic", "Mythic"];

const CLASS_TEXT_COLORS: Record<string, string> = {
  Warrior: "text-wow-warrior", Paladin: "text-wow-paladin", Hunter: "text-wow-hunter",
  Rogue: "text-wow-rogue", Priest: "text-wow-priest", "Death Knight": "text-wow-death-knight",
  Shaman: "text-wow-shaman", Mage: "text-wow-mage", Warlock: "text-wow-warlock",
  Monk: "text-wow-monk", Druid: "text-wow-druid", "Demon Hunter": "text-wow-demon-hunter",
  Evoker: "text-wow-evoker",
};

export default function RaidsPage() {
  const { password, isAuthenticated } = useAdmin();
  const [characters, setCharacters] = useState<Character[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [loot, setLoot] = useState<LootEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [expandedSessions, setExpandedSessions] = useState<Set<string>>(new Set());

  // New raid form
  const [showForm, setShowForm] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<any>(null);
  const [raidName, setRaidName] = useState("");
  const [raidDate, setRaidDate] = useState(new Date().toISOString().split("T")[0]);
  const [difficulty, setDifficulty] = useState("Heroic");
  const [selectedChars, setSelectedChars] = useState<Map<number, string>>(new Map());

  const fetchData = useCallback(async () => {
    // Fetch independently so one failure doesn't block others
    try {
      const res = await fetch("/api/characters");
      if (res.ok) {
        const chars = await res.json();
        setCharacters(Array.isArray(chars) ? chars.filter((c: Character) => c.isActive) : []);
      }
    } catch { /* silent */ }

    try {
      const res = await fetch("/api/attendance");
      if (res.ok) {
        const att = await res.json();
        setAttendance(Array.isArray(att) ? att : []);
      }
    } catch { /* silent */ }

    try {
      const res = await fetch("/api/loot");
      if (res.ok) {
        const lootData = await res.json();
        setLoot(Array.isArray(lootData) ? lootData : []);
      }
    } catch { /* silent */ }

    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Group attendance by date+raid
  const raidSessions = groupBySession(attendance);

  // Refresh Wowhead tooltips when loot data changes
  useWowheadTooltips([loot, expandedSessions]);

  function toggleSession(key: string) {
    setExpandedSessions((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  function getLootForSession(raidDate: string, raidName: string): LootEntry[] {
    return loot.filter((l) => l.raidDate === raidDate && l.raidName === raidName);
  }

  function toggleChar(charId: number) {
    const next = new Map(selectedChars);
    if (next.has(charId)) {
      next.delete(charId);
    } else {
      next.set(charId, "present");
    }
    setSelectedChars(next);
  }

  function setCharStatus(charId: number, status: string) {
    const next = new Map(selectedChars);
    next.set(charId, status);
    setSelectedChars(next);
  }

  function selectAll() {
    const next = new Map<number, string>();
    for (const c of characters) next.set(c.id, "present");
    setSelectedChars(next);
  }

  function selectNone() {
    setSelectedChars(new Map());
  }

  function selectRaiders() {
    const next = new Map<number, string>();
    for (const c of characters) {
      if (c.isRaider) next.set(c.id, "present");
    }
    setSelectedChars(next);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!raidName || !raidDate || selectedChars.size === 0) return;
    setMessage(null);

    const attendees = Array.from(selectedChars.entries()).map(([charId, status]) => {
      const char = characters.find((c) => c.id === charId);
      return { characterId: charId, characterName: char?.name || "Unknown", status };
    });

    try {
      const res = await fetch("/api/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password, raidName, raidDate, difficulty, attendees }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage({ type: "success", text: `Saved attendance for ${attendees.length} characters` });
        setShowForm(false);
        setSelectedChars(new Map());
        fetchData();
      } else {
        setMessage({ type: "error", text: data.error || "Failed to save" });
      }
    } catch {
      setMessage({ type: "error", text: "Network error" });
    }
  }

  async function handleDeleteSession(date: string, raid: string) {
    const records = attendance.filter((a) => a.raidDate === date && a.raidName === raid);
    for (const rec of records) {
      await fetch(`/api/attendance/${rec.id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
    }
    fetchData();
  }

  if (loading) {
    return <div className="container mx-auto max-w-7xl px-4 py-8 text-muted-foreground">Loading...</div>;
  }

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Calendar className="h-6 w-6" />
            Raid Attendance
          </h1>
          <p className="text-muted-foreground text-sm mt-1">Track who showed up to each raid night.</p>
        </div>
        {isAuthenticated && (
          <div className="flex gap-2">
            <button
              onClick={() => { setShowImport(!showImport); setShowForm(false); }}
              className="flex items-center gap-2 bg-secondary border border-border text-foreground rounded-md py-2 px-4 text-sm font-medium hover:bg-accent transition-colors"
            >
              <Upload className="h-4 w-4" />
              Import Log
            </button>
            <button
              onClick={() => { setShowForm(!showForm); setShowImport(false); }}
              className="flex items-center gap-2 bg-primary text-primary-foreground rounded-md py-2 px-4 text-sm font-medium hover:opacity-90 transition-opacity"
            >
              <Plus className="h-4 w-4" />
              Log Raid
            </button>
          </div>
        )}
      </div>

      {/* Import Log Section */}
      {showImport && isAuthenticated && (
        <RaidLogImport
          password={password}
          importing={importing}
          setImporting={setImporting}
          importResult={importResult}
          setImportResult={setImportResult}
          onComplete={() => { fetchData(); }}
        />
      )}

      {message && (
        <div className={cn(
          "flex items-center gap-2 p-3 rounded-lg border text-sm",
          message.type === "success" ? "bg-green-500/10 border-green-500/30 text-green-400" : "bg-red-500/10 border-red-500/30 text-red-400"
        )}>
          {message.type === "success" ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
          {message.text}
        </div>
      )}

      {/* New Raid Form */}
      {showForm && isAuthenticated && (
        <div className="bg-card border border-border rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-4">Log Raid Attendance</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-sm text-muted-foreground">Raid Name</label>
                <input
                  type="text"
                  value={raidName}
                  onChange={(e) => setRaidName(e.target.value)}
                  className="w-full mt-1 bg-secondary border border-border rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                  placeholder="Liberation of Undermine"
                  required
                />
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Date</label>
                <input
                  type="date"
                  value={raidDate}
                  onChange={(e) => setRaidDate(e.target.value)}
                  className="w-full mt-1 bg-secondary border border-border rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                  required
                />
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Difficulty</label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="w-full mt-1 bg-secondary border border-border rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  {DIFFICULTIES.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Character selection */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm text-muted-foreground">
                  Attendees ({selectedChars.size}/{characters.length})
                </label>
                <div className="flex gap-2">
                  <button type="button" onClick={selectRaiders} className="text-xs text-primary hover:underline">Select Raiders</button>
                  <button type="button" onClick={selectAll} className="text-xs text-primary hover:underline">Select All</button>
                  <button type="button" onClick={selectNone} className="text-xs text-muted-foreground hover:underline">Clear</button>
                </div>
              </div>
              {characters.length === 0 ? (
                <div className="bg-secondary/30 border border-border rounded-lg p-6 text-center">
                  <p className="text-muted-foreground text-sm mb-2">No characters found in the database.</p>
                  <p className="text-muted-foreground text-xs">
                    Go to the <a href="/admin" className="text-primary hover:underline">Admin page</a> and click &quot;Import Guild Roster&quot; first, then &quot;Sync All Characters&quot;.
                  </p>
                </div>
              ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-1.5 max-h-64 overflow-y-auto">
                {characters.map((char) => {
                  const isSelected = selectedChars.has(char.id);
                  const status = selectedChars.get(char.id) || "present";
                  return (
                    <div
                      key={char.id}
                      className={cn(
                        "flex items-center justify-between px-2 py-1.5 rounded border text-sm cursor-pointer transition-colors",
                        isSelected
                          ? "bg-green-500/10 border-green-500/30"
                          : "bg-secondary/50 border-border hover:bg-secondary"
                      )}
                    >
                      <span
                        onClick={() => toggleChar(char.id)}
                        className={cn(
                          "font-medium truncate flex-1",
                          CLASS_TEXT_COLORS[char.className ?? ""] || "text-foreground"
                        )}
                      >
                        {char.name}
                      </span>
                      {isSelected && (
                        <select
                          value={status}
                          onChange={(e) => { e.stopPropagation(); setCharStatus(char.id, e.target.value); }}
                          onClick={(e) => e.stopPropagation()}
                          className="ml-1 bg-transparent border-none text-xs focus:outline-none cursor-pointer"
                        >
                          {STATUS_OPTIONS.map((s) => (
                            <option key={s.value} value={s.value}>{s.label}</option>
                          ))}
                        </select>
                      )}
                    </div>
                  );
                })}
              </div>
              )}
            </div>

            <button
              type="submit"
              disabled={selectedChars.size === 0 || characters.length === 0}
              className="flex items-center gap-2 bg-primary text-primary-foreground rounded-md py-2 px-4 text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              <CheckCircle className="h-4 w-4" />
              Save Attendance
            </button>
          </form>
        </div>
      )}

      {/* Attendance History */}
      {raidSessions.length === 0 ? (
        <div className="bg-card border border-border rounded-lg p-8 text-center text-muted-foreground">
          No raid attendance logged yet. Click "Log Raid" to get started.
        </div>
      ) : (
        <div className="space-y-4">
          {raidSessions.map((session) => {
            const sessionLoot = getLootForSession(session.raidDate, session.raidName);
            const isExpanded = expandedSessions.has(session.key);

            return (
              <div key={session.key} className="bg-card border border-border rounded-lg overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border-b border-border">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="font-semibold">{session.raidName}</span>
                    {session.difficulty && (
                      <span className={cn(
                        "text-xs px-2 py-0.5 rounded font-medium",
                        session.difficulty === "Mythic" ? "bg-orange-500/20 text-orange-400" :
                        session.difficulty === "Heroic" ? "bg-purple-500/20 text-purple-400" :
                        "bg-green-500/20 text-green-400"
                      )}>
                        {session.difficulty}
                      </span>
                    )}
                    <span className="text-sm text-muted-foreground">{session.raidDate}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {session.records.length}
                    </span>
                    {sessionLoot.length > 0 && (
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Swords className="h-3 w-3" />
                        {sessionLoot.length}
                      </span>
                    )}
                    <button
                      onClick={() => toggleSession(session.key)}
                      className="text-muted-foreground hover:text-foreground transition-colors"
                      title={isExpanded ? "Collapse" : "Expand"}
                    >
                      {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                    </button>
                    {isAuthenticated && (
                      <button
                        onClick={() => handleDeleteSession(session.raidDate, session.raidName)}
                        className="text-muted-foreground hover:text-red-400 transition-colors"
                        title="Delete this raid log"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>
                <div className="px-4 py-3">
                  <div className="flex flex-wrap gap-4 mb-3">
                    {STATUS_OPTIONS.map((s) => {
                      const count = session.records.filter((r) => r.status === s.value).length;
                      if (count === 0) return null;
                      const Icon = s.icon;
                      return (
                        <span key={s.value} className={cn("flex items-center gap-1 text-xs", s.color)}>
                          <Icon className="h-3 w-3" />
                          {count} {s.label}
                        </span>
                      );
                    })}
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {session.records.map((rec) => {
                      const statusOpt = STATUS_OPTIONS.find((s) => s.value === rec.status);
                      return (
                        <Link
                          key={rec.id}
                          href={rec.characterId ? `/character/${rec.characterId}` : "#"}
                          className={cn(
                            "inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium border transition-colors hover:brightness-125",
                            statusOpt?.bg || "bg-secondary",
                            statusOpt?.color || "text-foreground",
                            "border-transparent"
                          )}
                        >
                          {rec.characterName}
                        </Link>
                      );
                    })}
                  </div>
                </div>

                {/* Expanded loot section */}
                {isExpanded && (
                  <div className="border-t border-border">
                    <div className="px-4 py-3">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground flex items-center gap-1.5">
                          <Swords className="h-3 w-3" />
                          Loot ({sessionLoot.length} items)
                        </h4>
                        {isAuthenticated && (
                          <Link
                            href="/loot"
                            className="text-xs text-primary hover:underline"
                          >
                            Manage Loot →
                          </Link>
                        )}
                      </div>
                      {sessionLoot.length === 0 ? (
                        <p className="text-xs text-muted-foreground py-2">
                          No loot recorded for this session.{" "}
                          {isAuthenticated && (
                            <Link href="/loot" className="text-primary hover:underline">Add loot</Link>
                          )}
                        </p>
                      ) : (
                        <div className="space-y-1">
                          {sessionLoot.map((entry) => (
                            <div key={entry.id} className="flex items-center gap-3 py-1 text-sm">
                              <span className="text-muted-foreground w-24 truncate flex-shrink-0">{entry.characterName}</span>
                              <span className="flex-1 truncate">
                                <WowheadItem itemId={entry.itemId} itemName={entry.itemName} quality={entry.itemQuality} />
                              </span>
                              {entry.itemLevel && (
                                <span className="text-xs text-muted-foreground font-mono flex-shrink-0">
                                  {entry.itemLevel}
                                </span>
                              )}
                              {entry.bossName && (
                                <span className="text-xs text-muted-foreground truncate max-w-[120px] hidden sm:inline flex-shrink-0">
                                  {entry.bossName}
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

interface RaidSession {
  key: string;
  raidName: string;
  raidDate: string;
  difficulty: string | null;
  records: AttendanceRecord[];
}

function groupBySession(records: AttendanceRecord[]): RaidSession[] {
  const map = new Map<string, RaidSession>();
  for (const rec of records) {
    const key = `${rec.raidDate}|${rec.raidName}`;
    if (!map.has(key)) {
      map.set(key, { key, raidName: rec.raidName, raidDate: rec.raidDate, difficulty: rec.difficulty, records: [] });
    }
    map.get(key)!.records.push(rec);
  }
  return Array.from(map.values()).sort((a, b) => b.raidDate.localeCompare(a.raidDate));
}

// ── Raid Log Import Component ──

function RaidLogImport({
  password,
  importing,
  setImporting,
  importResult,
  setImportResult,
  onComplete,
}: {
  password: string;
  importing: boolean;
  setImporting: (v: boolean) => void;
  importResult: any;
  setImportResult: (v: any) => void;
  onComplete: () => void;
}) {
  const [logPreview, setLogPreview] = useState<any>(null);
  const [error, setError] = useState("");
  const [pasteMode, setPasteMode] = useState(false);
  const [pasteText, setPasteText] = useState("");

  function parseLogJson(text: string) {
    setError("");
    setImportResult(null);
    try {
      const json = JSON.parse(text);
      if (!json.encounters || !Array.isArray(json.encounters)) {
        setError("Invalid log format — missing encounters array");
        return;
      }
      setLogPreview(json);
      setPasteMode(false);
      setPasteText("");
    } catch {
      setError("Failed to parse JSON — check the format");
    }
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => parseLogJson(ev.target?.result as string);
    reader.readAsText(file);
  }

  function handlePaste() {
    if (!pasteText.trim()) {
      setError("Paste your JSON data first");
      return;
    }
    parseLogJson(pasteText);
  }

  async function handleImport() {
    if (!logPreview) return;
    setImporting(true);
    setError("");

    try {
      const res = await fetch("/api/raid-log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password, log: logPreview }),
      });
      const data = await res.json();
      if (res.ok) {
        setImportResult(data);
        setLogPreview(null);
        onComplete();
      } else {
        setError(data.error || "Import failed");
      }
    } catch {
      setError("Network error during import");
    }
    setImporting(false);
  }

  const kills = logPreview?.encounters?.filter((e: any) => e.success) || [];
  const wipes = logPreview?.encounters?.filter((e: any) => !e.success) || [];
  const totalLoot = kills.reduce((sum: number, e: any) => sum + (e.loot?.length || 0), 0);
  const uniquePlayers = new Set<string>();
  for (const enc of kills) {
    for (const m of enc.roster || []) uniquePlayers.add(m.name);
  }

  return (
    <div className="bg-card border border-border rounded-lg p-4 space-y-4">
      <div className="flex items-center gap-2">
        <FileJson className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-semibold">Import Raid Log</h2>
      </div>

      <p className="text-sm text-muted-foreground">
        Upload or paste a JSON raid log exported from JehmUI. Creates attendance records for all players on kill encounters and imports loot drops.
      </p>

      {/* Input mode toggle */}
      <div className="flex gap-2">
        <button
          onClick={() => { setPasteMode(false); setError(""); }}
          className={cn("flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium border transition-all",
            !pasteMode ? "bg-primary/15 border-primary/40 text-primary" : "bg-secondary border-border text-muted-foreground hover:text-foreground"
          )}
        >
          <Upload className="h-3 w-3" />
          Upload File
        </button>
        <button
          onClick={() => { setPasteMode(true); setError(""); }}
          className={cn("flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium border transition-all",
            pasteMode ? "bg-primary/15 border-primary/40 text-primary" : "bg-secondary border-border text-muted-foreground hover:text-foreground"
          )}
        >
          <FileJson className="h-3 w-3" />
          Paste JSON
        </button>
      </div>

      {/* File upload */}
      {!pasteMode && (
        <div>
          <input
            type="file"
            accept=".json,application/json"
            onChange={handleFileSelect}
            className="text-sm text-muted-foreground file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border file:border-border file:text-sm file:font-medium file:bg-secondary file:text-foreground hover:file:bg-accent file:cursor-pointer file:transition-colors"
          />
        </div>
      )}

      {/* Paste JSON */}
      {pasteMode && (
        <div className="space-y-2">
          <textarea
            value={pasteText}
            onChange={(e) => setPasteText(e.target.value)}
            placeholder='Paste your JSON log here (starts with { "addon": "JehmUI", ... })'
            className="w-full h-40 bg-secondary border border-border rounded-md p-3 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-primary resize-y"
          />
          <button
            onClick={handlePaste}
            className="flex items-center gap-1.5 bg-primary text-primary-foreground rounded-md py-1.5 px-3 text-xs font-medium hover:opacity-90 transition-opacity"
          >
            <FileJson className="h-3 w-3" />
            Parse JSON
          </button>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 p-3 rounded-lg border text-sm bg-red-500/10 border-red-500/30 text-red-400">
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
      )}

      {/* Preview */}
      {logPreview && !importResult && (
        <div className="bg-secondary/30 border border-border rounded-lg p-3 space-y-3">
          <h3 className="text-sm font-semibold">Log Preview</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
            <div>
              <span className="text-xs text-muted-foreground block">Raid</span>
              <span className="font-medium">{logPreview.instance}</span>
            </div>
            <div>
              <span className="text-xs text-muted-foreground block">Difficulty</span>
              <span className={cn("font-medium",
                logPreview.difficulty === "Mythic" ? "text-orange-400" :
                logPreview.difficulty === "Heroic" ? "text-purple-400" : "text-green-400"
              )}>{logPreview.difficulty}</span>
            </div>
            <div>
              <span className="text-xs text-muted-foreground block">Date</span>
              <span className="font-medium">{logPreview.startTime?.split("T")[0]}</span>
            </div>
            <div>
              <span className="text-xs text-muted-foreground block">Addon</span>
              <span className="font-medium">{logPreview.addon} v{logPreview.version}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
            <div>
              <span className="text-xs text-muted-foreground block">Encounters</span>
              <span className="font-medium">{logPreview.encounters.length} total</span>
            </div>
            <div>
              <span className="text-xs text-green-400 block">Kills</span>
              <span className="font-medium text-green-400">{kills.length}</span>
            </div>
            <div>
              <span className="text-xs text-red-400 block">Wipes</span>
              <span className="font-medium text-red-400">{wipes.length}</span>
            </div>
            <div>
              <span className="text-xs text-muted-foreground block">Players</span>
              <span className="font-medium">{uniquePlayers.size}</span>
            </div>
          </div>

          {/* Encounter list */}
          <div className="space-y-1">
            <span className="text-xs text-muted-foreground">Encounters:</span>
            {logPreview.encounters.map((enc: any, i: number) => (
              <div key={i} className="flex items-center gap-2 text-xs">
                <span className={cn("w-2 h-2 rounded-full", enc.success ? "bg-green-400" : "bg-red-400")} />
                <span className="font-medium">{enc.encounterName}</span>
                {enc.loot?.length > 0 && (
                  <span className="text-primary">{enc.loot.length} loot</span>
                )}
                <span className="text-muted-foreground">
                  {Math.floor(enc.duration / 60)}:{(enc.duration % 60).toString().padStart(2, "0")}
                </span>
              </div>
            ))}
          </div>

          {/* Loot preview */}
          {totalLoot > 0 && (
            <div className="space-y-1">
              <span className="text-xs text-muted-foreground">Loot ({totalLoot} items):</span>
              {kills.flatMap((enc: any) =>
                (enc.loot || []).map((item: any, j: number) => (
                  <div key={`${enc.encounterID}-${j}`} className="flex items-center gap-2 text-xs">
                    <span className="text-muted-foreground w-20 truncate">{item.player.split("-")[0]}</span>
                    <span className="quality-epic font-medium truncate">{item.itemName}</span>
                    <span className="text-muted-foreground">({enc.encounterName})</span>
                  </div>
                ))
              )}
            </div>
          )}

          <button
            onClick={handleImport}
            disabled={importing}
            className="flex items-center gap-2 bg-primary text-primary-foreground rounded-md py-2 px-4 text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {importing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
            {importing ? "Importing..." : `Import ${kills.length} kills + ${totalLoot} loot items`}
          </button>
        </div>
      )}

      {/* Import result */}
      {importResult && (
        <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3 space-y-2">
          <div className="flex items-center gap-2 text-green-400">
            <CheckCircle className="h-4 w-4" />
            <span className="text-sm font-semibold">Import Complete</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm">
            <div>
              <span className="text-xs text-muted-foreground block">Raid</span>
              <span className="text-green-400">{importResult.raidName}</span>
            </div>
            <div>
              <span className="text-xs text-muted-foreground block">Encounters</span>
              <span className="text-green-400">{importResult.encountersProcessed} kills, {importResult.encountersSkipped} wipes</span>
            </div>
            <div>
              <span className="text-xs text-muted-foreground block">Attendance</span>
              <span className="text-green-400">{importResult.attendanceAdded} players</span>
            </div>
            <div>
              <span className="text-xs text-muted-foreground block">Loot</span>
              <span className="text-green-400">{importResult.lootAdded} items</span>
            </div>
          </div>
          {importResult.errors?.length > 0 && (
            <div className="text-xs text-orange-400">
              {importResult.errors.length} warnings: {importResult.errors[0]}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
