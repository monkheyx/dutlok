"use client";

import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import { Search, Wrench, Plus, Trash2, X, CheckCircle, AlertCircle, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useAdmin } from "@/components/admin-provider";

interface ProfessionEntry {
  characterId: number;
  characterName: string;
  className: string | null;
  isRaiderAlt: boolean;
  professionName: string;
  skillPoints: number;
  maxSkillPoints: number;
}

interface CraftableItem {
  id: number;
  itemName: string;
  professionName: string;
  characterId: number | null;
  characterName: string;
  notes: string | null;
}

interface RecipeResult {
  characterId: number;
  characterName: string;
  professionName: string;
  tierName: string | null;
}

const CLASS_TEXT_COLORS: Record<string, string> = {
  Warrior: "text-wow-warrior",
  Paladin: "text-wow-paladin",
  Hunter: "text-wow-hunter",
  Rogue: "text-wow-rogue",
  Priest: "text-wow-priest",
  "Death Knight": "text-wow-death-knight",
  Shaman: "text-wow-shaman",
  Mage: "text-wow-mage",
  Warlock: "text-wow-warlock",
  Monk: "text-wow-monk",
  Druid: "text-wow-druid",
  "Demon Hunter": "text-wow-demon-hunter",
  Evoker: "text-wow-evoker",
};

const PROFESSION_NAMES = [
  "Alchemy", "Blacksmithing", "Enchanting", "Engineering",
  "Inscription", "Jewelcrafting", "Leatherworking", "Tailoring",
];

export function ProfessionSearch({ professions }: { professions: ProfessionEntry[] }) {
  const { isAuthenticated, password } = useAdmin();
  const [search, setSearch] = useState("");
  const [craftableItems, setCraftableItems] = useState<CraftableItem[]>([]);
  const [recipeResults, setRecipeResults] = useState<Record<string, RecipeResult[]>>({});
  const [recipeSearching, setRecipeSearching] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const searchTimeout = useRef<ReturnType<typeof setTimeout>>();

  // Add form state
  const [newItemName, setNewItemName] = useState("");
  const [newProfession, setNewProfession] = useState("");
  const [newCharacterName, setNewCharacterName] = useState("");
  const [newCharacterId, setNewCharacterId] = useState<number | null>(null);
  const [newNotes, setNewNotes] = useState("");

  const fetchCraftableItems = useCallback(async () => {
    try {
      const res = await fetch("/api/crafting");
      const data = await res.json();
      setCraftableItems(data);
    } catch { /* silent */ }
  }, []);

  useEffect(() => { fetchCraftableItems(); }, [fetchCraftableItems]);

  // Debounced recipe search from Blizzard-synced data
  useEffect(() => {
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    if (!search.trim() || search.length < 2) {
      setRecipeResults({});
      return;
    }
    searchTimeout.current = setTimeout(async () => {
      setRecipeSearching(true);
      try {
        const res = await fetch(`/api/recipes?search=${encodeURIComponent(search)}`);
        const data = await res.json();
        setRecipeResults(data);
      } catch {
        setRecipeResults({});
      }
      setRecipeSearching(false);
    }, 300);
    return () => { if (searchTimeout.current) clearTimeout(searchTimeout.current); };
  }, [search]);

  // Group professions by name
  const grouped = useMemo(() => {
    const map: Record<string, ProfessionEntry[]> = {};
    for (const p of professions) {
      if (!map[p.professionName]) map[p.professionName] = [];
      map[p.professionName].push(p);
    }
    return map;
  }, [professions]);

  // Group craftable items by item name
  const craftableGrouped = useMemo(() => {
    const map: Record<string, CraftableItem[]> = {};
    for (const item of craftableItems) {
      if (!map[item.itemName]) map[item.itemName] = [];
      map[item.itemName].push(item);
    }
    return map;
  }, [craftableItems]);

  // All unique character names for autocomplete
  const allCharacters = useMemo(() => {
    const map = new Map<string, { id: number; name: string; className: string | null }>();
    for (const p of professions) {
      if (!map.has(p.characterName)) {
        map.set(p.characterName, { id: p.characterId, name: p.characterName, className: p.className });
      }
    }
    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [professions]);

  // Filter craftable items by search
  const filteredCraftable = useMemo(() => {
    if (!search.trim()) return craftableGrouped;
    const q = search.toLowerCase();
    const result: Record<string, CraftableItem[]> = {};
    for (const [itemName, items] of Object.entries(craftableGrouped)) {
      if (
        itemName.toLowerCase().includes(q) ||
        items.some((i) => i.characterName.toLowerCase().includes(q)) ||
        items.some((i) => i.professionName.toLowerCase().includes(q))
      ) {
        result[itemName] = items;
      }
    }
    return result;
  }, [search, craftableGrouped]);

  // Filter professions by search
  const filteredProfessions = useMemo(() => {
    if (!search.trim()) return grouped;
    const q = search.toLowerCase();
    const result: Record<string, ProfessionEntry[]> = {};
    for (const [profName, entries] of Object.entries(grouped)) {
      if (profName.toLowerCase().includes(q)) {
        result[profName] = entries;
        continue;
      }
      const charMatches = entries.filter((e) => e.characterName.toLowerCase().includes(q));
      if (charMatches.length > 0) {
        result[profName] = charMatches;
      }
    }
    return result;
  }, [search, grouped]);

  const allProfessionNames = Object.keys(grouped).sort();
  const hasRecipeResults = Object.keys(recipeResults).length > 0;
  const hasCraftableResults = Object.keys(filteredCraftable).length > 0;
  const hasProfessionResults = Object.keys(filteredProfessions).length > 0;

  async function handleAddItem(e: React.FormEvent) {
    e.preventDefault();
    if (!newItemName || !newProfession || !newCharacterName) {
      setMessage({ type: "error", text: "Item name, profession, and character are required" });
      return;
    }

    try {
      const res = await fetch("/api/crafting", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          password,
          itemName: newItemName,
          professionName: newProfession,
          characterId: newCharacterId,
          characterName: newCharacterName,
          notes: newNotes || null,
        }),
      });
      if (res.ok) {
        setMessage({ type: "success", text: `Added "${newItemName}" for ${newCharacterName}` });
        setNewItemName("");
        setNewCharacterName("");
        setNewCharacterId(null);
        setNewNotes("");
        fetchCraftableItems();
      } else {
        const data = await res.json();
        setMessage({ type: "error", text: data.error || "Failed to add" });
      }
    } catch {
      setMessage({ type: "error", text: "Network error" });
    }
  }

  async function handleDeleteItem(id: number) {
    try {
      await fetch(`/api/crafting/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      setCraftableItems((prev) => prev.filter((i) => i.id !== id));
    } catch { /* silent */ }
  }

  function selectCharacter(char: { id: number; name: string }) {
    setNewCharacterName(char.name);
    setNewCharacterId(char.id);
  }

  return (
    <div>
      {/* Search bar */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder='Search recipes or professions (e.g. "Serling Alloy", "Enchanting", character name)'
          className="w-full pl-9 pr-4 py-2 bg-secondary border border-border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary"
        />
      </div>

      {/* Quick filter buttons */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        {allProfessionNames.map((name) => (
          <button
            key={name}
            onClick={() => setSearch(search === name ? "" : name)}
            className={cn(
              "px-2.5 py-1 rounded-md text-xs font-medium border transition-colors",
              search === name
                ? "bg-primary/20 border-primary/50 text-primary"
                : "bg-secondary border-border text-muted-foreground hover:text-foreground hover:bg-accent"
            )}
          >
            {name} ({grouped[name].length})
          </button>
        ))}
      </div>

      {/* Admin: Add craftable item */}
      {isAuthenticated && (
        <div className="mb-4">
          {!showAddForm ? (
            <button
              onClick={() => setShowAddForm(true)}
              className="flex items-center gap-1.5 bg-primary text-primary-foreground rounded-md py-1.5 px-3 text-sm font-medium hover:opacity-90 transition-opacity"
            >
              <Plus className="h-4 w-4" />
              Add Craftable Item
            </button>
          ) : (
            <div className="bg-secondary/30 border border-border rounded-lg p-3 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold">Add Craftable Item</h3>
                <button onClick={() => setShowAddForm(false)} className="text-muted-foreground hover:text-foreground">
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

              <form onSubmit={handleAddItem} className="space-y-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs text-muted-foreground">Item Name</label>
                    <input
                      type="text"
                      value={newItemName}
                      onChange={(e) => setNewItemName(e.target.value)}
                      placeholder="e.g. Serling Alloy"
                      className="w-full mt-0.5 bg-secondary border border-border rounded-md py-1.5 px-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">Profession</label>
                    <select
                      value={newProfession}
                      onChange={(e) => setNewProfession(e.target.value)}
                      className="w-full mt-0.5 bg-secondary border border-border rounded-md py-1.5 px-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                      required
                    >
                      <option value="">Select profession...</option>
                      {PROFESSION_NAMES.map((p) => (
                        <option key={p} value={p}>{p}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs text-muted-foreground">Character</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={newCharacterName}
                        onChange={(e) => {
                          setNewCharacterName(e.target.value);
                          setNewCharacterId(null);
                        }}
                        placeholder="Character name"
                        className="w-full mt-0.5 bg-secondary border border-border rounded-md py-1.5 px-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                        required
                        list="character-suggestions"
                      />
                      <datalist id="character-suggestions">
                        {allCharacters.map((c) => (
                          <option key={c.id} value={c.name} />
                        ))}
                      </datalist>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">Notes (optional)</label>
                    <input
                      type="text"
                      value={newNotes}
                      onChange={(e) => setNewNotes(e.target.value)}
                      placeholder="e.g. Max quality, requires mats"
                      className="w-full mt-0.5 bg-secondary border border-border rounded-md py-1.5 px-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 bg-primary text-primary-foreground rounded-md py-1.5 px-3 text-sm font-medium hover:opacity-90 transition-opacity"
                >
                  <Plus className="h-4 w-4" />
                  Add Item
                </button>
              </form>
            </div>
          )}
        </div>
      )}

      {/* Synced Recipe Results (from Blizzard API) */}
      {search.length >= 2 && (hasRecipeResults || recipeSearching) && (
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Known Recipes {recipeSearching && <span className="text-xs font-normal">(searching...)</span>}
          </h3>
          {hasRecipeResults ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {Object.entries(recipeResults)
                .sort(([a], [b]) => a.localeCompare(b))
                .map(([recipeName, crafters]) => (
                  <div key={recipeName} className="bg-secondary/50 border border-border rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm font-semibold text-primary">{recipeName}</span>
                      <span className="text-xs text-muted-foreground">({crafters[0].professionName})</span>
                    </div>
                    <div className="space-y-1">
                      {crafters.map((crafter) => (
                        <div key={crafter.characterId} className="flex items-center justify-between text-sm">
                          <Link
                            href={`/character/${crafter.characterId}`}
                            className="hover:underline font-medium text-foreground"
                          >
                            {crafter.characterName}
                          </Link>
                          {crafter.tierName && (
                            <span className="text-xs text-muted-foreground truncate ml-2">{crafter.tierName}</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
            </div>
          ) : recipeSearching ? (
            <p className="text-sm text-muted-foreground">Searching recipes...</p>
          ) : null}
        </div>
      )}

      {/* Craftable Items Results (manually added) */}
      {hasCraftableResults && (
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
            Custom Craftable Items {search && `matching "${search}"`}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {Object.entries(filteredCraftable)
              .sort(([a], [b]) => a.localeCompare(b))
              .map(([itemName, items]) => (
                <div key={itemName} className="bg-secondary/50 border border-border rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-semibold text-primary">{itemName}</span>
                    <span className="text-xs text-muted-foreground">({items[0].professionName})</span>
                  </div>
                  <div className="space-y-1">
                    {items.map((item) => (
                      <div key={item.id} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-1.5 min-w-0">
                          {item.characterId ? (
                            <Link
                              href={`/character/${item.characterId}`}
                              className="hover:underline font-medium text-foreground truncate"
                            >
                              {item.characterName}
                            </Link>
                          ) : (
                            <span className="font-medium text-foreground truncate">{item.characterName}</span>
                          )}
                          {item.notes && (
                            <span className="text-xs text-muted-foreground truncate">— {item.notes}</span>
                          )}
                        </div>
                        {isAuthenticated && (
                          <button
                            onClick={() => handleDeleteItem(item.id)}
                            className="p-0.5 text-muted-foreground hover:text-red-400 transition-colors flex-shrink-0"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Profession Members */}
      {hasProfessionResults ? (
        <div>
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
            Guild Crafters by Profession
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {Object.entries(filteredProfessions)
              .sort(([a], [b]) => a.localeCompare(b))
              .map(([profName, entries]) => (
                <div key={profName} className="bg-secondary/50 border border-border rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Wrench className="h-4 w-4 text-muted-foreground" />
                    <h3 className="font-medium text-sm">{profName}</h3>
                    <span className="text-xs text-muted-foreground">({entries.length})</span>
                  </div>
                  <div className="space-y-1">
                    {entries.map((entry) => (
                      <div key={entry.characterId} className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-1">
                          <Link
                            href={`/character/${entry.characterId}`}
                            className={cn(
                              "hover:underline font-medium",
                              CLASS_TEXT_COLORS[entry.className ?? ""] || "text-foreground"
                            )}
                          >
                            {entry.characterName}
                          </Link>
                          {entry.isRaiderAlt && (
                            <span className="inline-flex items-center px-1 py-0.5 rounded text-[9px] font-bold uppercase bg-yellow-500/15 text-yellow-400 border border-yellow-500/30">
                              Alt
                            </span>
                          )}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <div className="w-16 h-1.5 bg-secondary rounded-full overflow-hidden">
                            <div
                              className={cn(
                                "h-full rounded-full",
                                entry.skillPoints >= entry.maxSkillPoints
                                  ? "bg-green-500"
                                  : entry.skillPoints >= entry.maxSkillPoints * 0.5
                                  ? "bg-yellow-500"
                                  : "bg-red-500"
                              )}
                              style={{
                                width: `${entry.maxSkillPoints > 0 ? (entry.skillPoints / entry.maxSkillPoints) * 100 : 0}%`,
                              }}
                            />
                          </div>
                          <span className="text-xs text-muted-foreground w-14 text-right">
                            {entry.skillPoints}/{entry.maxSkillPoints}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
          </div>
        </div>
      ) : !hasCraftableResults && !hasRecipeResults ? (
        <p className="text-muted-foreground text-sm text-center py-6">
          No results match &quot;{search}&quot;. Try searching for a crafting item or profession name.
        </p>
      ) : null}
    </div>
  );
}
