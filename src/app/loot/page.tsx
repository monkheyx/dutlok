"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Trash2, Search, X, Swords, AlertCircle, CheckCircle } from "lucide-react";
import { useAdmin } from "@/components/admin-provider";
import { WowheadItem, useWowheadTooltips } from "@/components/wowhead-item";

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
  createdAt: string;
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

export default function LootPage() {
  const [loot, setLoot] = useState<LootEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Auth
  const { password, isAuthenticated, login } = useAdmin();
  const [loginInput, setLoginInput] = useState("");
  const [showAuth, setShowAuth] = useState(false);

  // Filters
  const [filterRaid, setFilterRaid] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [filterCharacter, setFilterCharacter] = useState("");

  // Add form
  const [showAddForm, setShowAddForm] = useState(false);
  const [form, setForm] = useState({
    characterName: "",
    itemName: "",
    itemQuality: "Epic",
    itemLevel: "",
    bossName: "",
    raidName: "",
    raidDate: new Date().toISOString().split("T")[0],
    notes: "",
    awardedBy: "",
  });

  const fetchLoot = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filterRaid) params.set("raid", filterRaid);
    if (filterDate) params.set("date", filterDate);
    if (filterCharacter) params.set("character", filterCharacter);

    const res = await fetch(`/api/loot?${params.toString()}`);
    if (res.ok) {
      setLoot(await res.json());
    }
    setLoading(false);
  }, [filterRaid, filterDate, filterCharacter]);

  useWowheadTooltips([loot]);

  useEffect(() => {
    fetchLoot();
  }, [fetchLoot]);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!isAuthenticated) {
      setShowAuth(true);
      return;
    }
    setMessage(null);
    try {
      const res = await fetch("/api/loot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          itemLevel: form.itemLevel ? parseInt(form.itemLevel) : null,
          password,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage({ type: "success", text: `Added ${form.itemName} for ${form.characterName}` });
        setForm((prev) => ({ ...prev, characterName: "", itemName: "", itemLevel: "", bossName: "", notes: "" }));
        fetchLoot();
      } else {
        setMessage({ type: "error", text: data.error || "Failed to add" });
      }
    } catch {
      setMessage({ type: "error", text: "Network error" });
    }
  }

  async function handleDelete(id: number) {
    if (!isAuthenticated) {
      setShowAuth(true);
      return;
    }
    try {
      const res = await fetch(`/api/loot/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        setLoot((prev) => prev.filter((l) => l.id !== id));
        setMessage({ type: "success", text: "Loot entry removed" });
      } else {
        const data = await res.json();
        setMessage({ type: "error", text: data.error || "Delete failed" });
      }
    } catch {
      setMessage({ type: "error", text: "Network error" });
    }
  }

  // Get unique raid names and dates for filters
  const raidNames = Array.from(new Set(loot.map((l) => l.raidName).filter(Boolean))) as string[];
  const raidDates = Array.from(new Set(loot.map((l) => l.raidDate).filter(Boolean))) as string[];

  // Group loot by date
  const groupedByDate: Record<string, LootEntry[]> = {};
  for (const entry of loot) {
    const key = entry.raidDate;
    if (!groupedByDate[key]) groupedByDate[key] = [];
    groupedByDate[key].push(entry);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Swords className="h-6 w-6" />
            Raid Loot
          </h1>
          <p className="text-muted-foreground">{loot.length} items tracked</p>
        </div>
        <button
          onClick={() => {
            if (!isAuthenticated) {
              setShowAuth(true);
            } else {
              setShowAddForm(!showAddForm);
            }
          }}
          className="flex items-center gap-2 bg-primary text-primary-foreground rounded-md py-2 px-4 text-sm font-medium hover:opacity-90 transition-opacity"
        >
          <Plus className="h-4 w-4" />
          Add Loot
        </button>
      </div>

      {/* Auth prompt */}
      {showAuth && !isAuthenticated && (
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            const success = await login(loginInput);
            if (success) {
              setShowAuth(false);
              setShowAddForm(true);
            } else {
              setMessage({ type: "error", text: "Incorrect password" });
            }
          }}
          className="bg-card border border-border rounded-lg p-4 flex items-end gap-3 max-w-md"
        >
          <div className="flex-1">
            <label className="text-sm text-muted-foreground">Admin Password</label>
            <input
              type="password"
              value={loginInput}
              onChange={(e) => setLoginInput(e.target.value)}
              className="w-full mt-1 bg-secondary border border-border rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              autoFocus
              required
            />
          </div>
          <button
            type="submit"
            className="bg-primary text-primary-foreground rounded-md py-2 px-4 text-sm font-medium hover:opacity-90"
          >
            Enter
          </button>
        </form>
      )}

      {/* Status Message */}
      {message && (
        <div
          className={`flex items-center gap-2 p-3 rounded-lg border text-sm ${
            message.type === "success"
              ? "bg-green-500/10 border-green-500/30 text-green-400"
              : "bg-red-500/10 border-red-500/30 text-red-400"
          }`}
        >
          {message.type === "success" ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
          {message.text}
        </div>
      )}

      {/* Add Form */}
      {showAddForm && isAuthenticated && (
        <form onSubmit={handleAdd} className="bg-card border border-border rounded-lg p-4 space-y-3">
          <h2 className="text-lg font-semibold">Add Loot Entry</h2>
          <div className="grid md:grid-cols-3 gap-3">
            <div>
              <label className="text-xs text-muted-foreground">Character Name *</label>
              <input
                type="text"
                value={form.characterName}
                onChange={(e) => setForm({ ...form, characterName: e.target.value })}
                className="w-full mt-1 bg-secondary border border-border rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                required
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Item Name *</label>
              <input
                type="text"
                value={form.itemName}
                onChange={(e) => setForm({ ...form, itemName: e.target.value })}
                className="w-full mt-1 bg-secondary border border-border rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                required
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Item Level</label>
              <input
                type="number"
                value={form.itemLevel}
                onChange={(e) => setForm({ ...form, itemLevel: e.target.value })}
                className="w-full mt-1 bg-secondary border border-border rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Quality</label>
              <select
                value={form.itemQuality}
                onChange={(e) => setForm({ ...form, itemQuality: e.target.value })}
                className="w-full mt-1 bg-secondary border border-border rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              >
                {QUALITIES.map((q) => (
                  <option key={q} value={q}>{q}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Boss Name</label>
              <input
                type="text"
                value={form.bossName}
                onChange={(e) => setForm({ ...form, bossName: e.target.value })}
                className="w-full mt-1 bg-secondary border border-border rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Raid Name</label>
              <input
                type="text"
                value={form.raidName}
                onChange={(e) => setForm({ ...form, raidName: e.target.value })}
                className="w-full mt-1 bg-secondary border border-border rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="e.g. Nerub-ar Palace"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Raid Date *</label>
              <input
                type="date"
                value={form.raidDate}
                onChange={(e) => setForm({ ...form, raidDate: e.target.value })}
                className="w-full mt-1 bg-secondary border border-border rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                required
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Awarded By</label>
              <input
                type="text"
                value={form.awardedBy}
                onChange={(e) => setForm({ ...form, awardedBy: e.target.value })}
                className="w-full mt-1 bg-secondary border border-border rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="Loot master name"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Notes</label>
              <input
                type="text"
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                className="w-full mt-1 bg-secondary border border-border rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="Optional notes"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              className="flex items-center gap-2 bg-primary text-primary-foreground rounded-md py-2 px-4 text-sm font-medium hover:opacity-90"
            >
              <Plus className="h-4 w-4" />
              Add Entry
            </button>
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="bg-secondary border border-border rounded-md py-2 px-4 text-sm hover:bg-accent"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Filters */}
      <div className="bg-card border border-border rounded-lg p-4 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[180px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by character..."
            value={filterCharacter}
            onChange={(e) => setFilterCharacter(e.target.value)}
            className="w-full bg-secondary border border-border rounded-md py-2 pl-9 pr-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
        {raidNames.length > 0 && (
          <select
            value={filterRaid}
            onChange={(e) => setFilterRaid(e.target.value)}
            className="bg-secondary border border-border rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="">All Raids</option>
            {raidNames.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        )}
        <input
          type="date"
          value={filterDate}
          onChange={(e) => setFilterDate(e.target.value)}
          className="bg-secondary border border-border rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
        />
        {(filterRaid || filterDate || filterCharacter) && (
          <button
            onClick={() => {
              setFilterRaid("");
              setFilterDate("");
              setFilterCharacter("");
            }}
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
            Clear
          </button>
        )}
      </div>

      {/* Loot Table grouped by date */}
      {loading ? (
        <div className="text-center py-8 text-muted-foreground">Loading...</div>
      ) : loot.length === 0 ? (
        <div className="bg-card border border-border rounded-lg p-8 text-center">
          <p className="text-muted-foreground">No loot entries yet.</p>
          <p className="text-sm text-muted-foreground mt-1">Click "Add Loot" to start tracking raid drops.</p>
        </div>
      ) : (
        Object.entries(groupedByDate)
          .sort(([a], [b]) => b.localeCompare(a))
          .map(([date, entries]) => (
            <div key={date} className="bg-card border border-border rounded-lg overflow-hidden">
              <div className="bg-secondary/50 px-4 py-2 border-b border-border flex items-center justify-between">
                <h3 className="font-semibold text-sm">
                  {new Date(date + "T12:00:00").toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </h3>
                {entries[0].raidName && (
                  <span className="text-sm text-muted-foreground">{entries[0].raidName}</span>
                )}
              </div>
              {/* Mobile card view */}
              <div className="sm:hidden divide-y divide-border/30">
                {entries.map((entry) => (
                  <div key={entry.id} className="p-3 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{entry.characterName}</span>
                      {isAuthenticated && (
                        <button onClick={() => handleDelete(entry.id)} className="text-muted-foreground hover:text-destructive transition-colors p-1">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                    <div className="text-sm">
                      <WowheadItem itemId={entry.itemId} itemName={entry.itemName} quality={entry.itemQuality} />
                    </div>
                    <div className="flex gap-3 text-xs text-muted-foreground">
                      {entry.itemLevel && <span>iLvl {entry.itemLevel}</span>}
                      {entry.bossName && <span>{entry.bossName}</span>}
                      {entry.notes && <span>{entry.notes}</span>}
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop table view */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border/50">
                      <th className="text-left py-2 px-4 text-xs font-medium text-muted-foreground">Character</th>
                      <th className="text-left py-2 px-4 text-xs font-medium text-muted-foreground">Item</th>
                      <th className="text-right py-2 px-4 text-xs font-medium text-muted-foreground hidden md:table-cell">iLvl</th>
                      <th className="text-left py-2 px-4 text-xs font-medium text-muted-foreground">Boss</th>
                      <th className="text-left py-2 px-4 text-xs font-medium text-muted-foreground hidden lg:table-cell">Notes</th>
                      {isAuthenticated && <th className="py-2 px-4 w-10"></th>}
                    </tr>
                  </thead>
                  <tbody>
                    {entries.map((entry) => (
                      <tr key={entry.id} className="border-b border-border/30 hover:bg-accent/30">
                        <td className="py-2 px-4 text-sm font-medium">{entry.characterName}</td>
                        <td className="py-2 px-4 text-sm">
                          <WowheadItem itemId={entry.itemId} itemName={entry.itemName} quality={entry.itemQuality} />
                        </td>
                        <td className="py-2 px-4 text-sm text-right font-mono text-muted-foreground hidden md:table-cell">
                          {entry.itemLevel ?? "-"}
                        </td>
                        <td className="py-2 px-4 text-sm text-muted-foreground">{entry.bossName ?? "-"}</td>
                        <td className="py-2 px-4 text-sm text-muted-foreground hidden lg:table-cell">{entry.notes ?? "-"}</td>
                        {isAuthenticated && (
                          <td className="py-2 px-4">
                            <button onClick={() => handleDelete(entry.id)} className="text-muted-foreground hover:text-destructive transition-colors">
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))
      )}
    </div>
  );
}
