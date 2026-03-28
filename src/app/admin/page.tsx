"use client";

import { useState, useEffect, useCallback } from "react";
import {
  RefreshCw, Download, UserPlus, AlertCircle, CheckCircle, KeyRound, LogOut,
  Swords, Search, Settings, Newspaper, FileText, Users, Shield, ClipboardCheck,
  Calendar, BarChart3,
} from "lucide-react";
import { useAdmin } from "@/components/admin-provider";
import { PendingRegistrations } from "@/components/pending-registrations";
import { NewsEditor } from "@/components/news-editor";
import { PageManager } from "@/components/page-manager";
import { cn } from "@/lib/utils";
import Link from "next/link";

const TABS = [
  { key: "overview", label: "Overview", icon: BarChart3 },
  { key: "registrations", label: "Registrations", icon: ClipboardCheck },
  { key: "roster", label: "Roster", icon: Users },
  { key: "content", label: "Content", icon: FileText },
  { key: "sync", label: "Data Sync", icon: RefreshCw },
  { key: "settings", label: "Settings", icon: Settings },
] as const;

type TabKey = typeof TABS[number]["key"];

export default function AdminPage() {
  const { password, isAuthenticated, login, logout } = useAdmin();
  const [loginInput, setLoginInput] = useState("");
  const [loginError, setLoginError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [activeTab, setActiveTab] = useState<TabKey>("overview");

  // Roster
  interface RosterChar { id: number; name: string; className: string | null; isActive: boolean; isRaider: boolean; isRaiderAlt: boolean; }
  const [rosterChars, setRosterChars] = useState<RosterChar[]>([]);
  const [rosterLoaded, setRosterLoaded] = useState(false);
  const [raiderSearch, setRaiderSearch] = useState("");

  // Add character
  const [charName, setCharName] = useState("");
  const [charRealm, setCharRealm] = useState("");

  // Password
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Stats
  const [stats, setStats] = useState({ total: 0, raiders: 0, alts: 0, pending: 0, pages: 0, news: 0 });

  const fetchRoster = useCallback(async () => {
    try {
      const res = await fetch("/api/characters");
      const data = await res.json();
      if (Array.isArray(data)) {
        const active = data.filter((c: RosterChar) => c.isActive);
        setRosterChars(active);
        setStats((s) => ({
          ...s,
          total: active.length,
          raiders: active.filter((c: RosterChar) => c.isRaider).length,
          alts: active.filter((c: RosterChar) => c.isRaiderAlt).length,
        }));
      }
    } catch { /* silent */ }
    setRosterLoaded(true);
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      const [regRes, pagesRes, newsRes] = await Promise.all([
        fetch("/api/registrations").catch(() => null),
        fetch("/api/pages").catch(() => null),
        fetch("/api/news?limit=100").catch(() => null),
      ]);
      const regs = regRes?.ok ? await regRes.json() : [];
      const pages = pagesRes?.ok ? await pagesRes.json() : [];
      const news = newsRes?.ok ? await newsRes.json() : [];
      setStats((s) => ({
        ...s,
        pending: Array.isArray(regs) ? regs.filter((r: any) => r.status === "pending").length : 0,
        pages: Array.isArray(pages) ? pages.length : 0,
        news: Array.isArray(news) ? news.length : 0,
      }));
    } catch { /* silent */ }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchRoster();
      fetchStats();
    }
  }, [isAuthenticated, fetchRoster, fetchStats]);

  async function toggleRaider(charId: number, current: boolean) {
    await fetch(`/api/characters/${charId}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password, isRaider: !current, ...(current ? {} : { isRaiderAlt: false }) }),
    });
    setRosterChars((prev) => prev.map((c) => c.id === charId ? { ...c, isRaider: !current, ...(current ? {} : { isRaiderAlt: false }) } : c));
  }

  async function toggleRaiderAlt(charId: number, current: boolean) {
    await fetch(`/api/characters/${charId}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password, isRaiderAlt: !current, ...(!current ? { isRaider: false } : {}) }),
    });
    setRosterChars((prev) => prev.map((c) => c.id === charId ? { ...c, isRaiderAlt: !current, ...(!current ? { isRaider: false } : {}) } : c));
  }

  async function handleAuth(e: React.FormEvent) {
    e.preventDefault();
    setLoginError(false);
    if (!(await login(loginInput))) setLoginError(true);
  }

  async function handleGuildImport() {
    setLoading(true); setMessage(null);
    try {
      const res = await fetch("/api/sync", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "import_guild", password }) });
      const data = await res.json();
      setMessage(res.ok ? { type: "success", text: `Imported ${data.imported} new, updated ${data.updated}. ${data.failed} failed.` } : { type: "error", text: data.error || "Import failed" });
      if (res.ok) fetchRoster();
    } catch { setMessage({ type: "error", text: "Network error" }); }
    setLoading(false);
  }

  async function handleSyncAll() {
    setLoading(true); setMessage(null);
    try {
      const res = await fetch("/api/sync", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "sync_all", password }) });
      const data = await res.json();
      setMessage(res.ok ? { type: "success", text: `Synced ${data.succeeded}/${data.total}. ${data.failed} failed.` } : { type: "error", text: data.error || "Sync failed" });
    } catch { setMessage({ type: "error", text: "Network error" }); }
    setLoading(false);
  }

  async function handleAddCharacter(e: React.FormEvent) {
    e.preventDefault();
    if (!charName || !charRealm) return;
    setLoading(true); setMessage(null);
    try {
      const res = await fetch("/api/characters", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: charName, realm: charRealm, password }) });
      const data = await res.json();
      if (res.ok) { setMessage({ type: "success", text: `Added ${charName}-${charRealm}` }); setCharName(""); setCharRealm(""); fetchRoster(); }
      else setMessage({ type: "error", text: data.error || "Failed" });
    } catch { setMessage({ type: "error", text: "Network error" }); }
    setLoading(false);
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    if (newPassword !== confirmPassword) { setMessage({ type: "error", text: "Passwords do not match" }); return; }
    if (newPassword.length < 4) { setMessage({ type: "error", text: "Password must be at least 4 characters" }); return; }
    setLoading(true); setMessage(null);
    try {
      const res = await fetch("/api/admin/password", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ currentPassword: password, newPassword }) });
      if (res.ok) { await login(newPassword); setNewPassword(""); setConfirmPassword(""); setMessage({ type: "success", text: "Password changed" }); }
      else { const data = await res.json(); setMessage({ type: "error", text: data.error || "Failed" }); }
    } catch { setMessage({ type: "error", text: "Network error" }); }
    setLoading(false);
  }

  // ── Login Screen ──
  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto mt-20">
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="text-center mb-6">
            <Shield className="h-10 w-10 text-primary mx-auto mb-2" />
            <h1 className="text-xl font-bold">Admin Dashboard</h1>
            <p className="text-sm text-muted-foreground">Enter your password to continue</p>
          </div>
          <form onSubmit={handleAuth} className="space-y-4">
            <input
              type="password" value={loginInput} onChange={(e) => setLoginInput(e.target.value)}
              className="w-full bg-secondary border border-border rounded-md py-2.5 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary text-center"
              placeholder="Admin Password" required autoFocus
            />
            {loginError && <p className="text-sm text-destructive text-center">Incorrect password</p>}
            <button type="submit" className="w-full bg-primary text-primary-foreground rounded-md py-2.5 px-4 text-sm font-medium hover:opacity-90 transition-opacity">
              Sign In
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ── Admin Dashboard ──
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            Admin Dashboard
          </h1>
        </div>
        <button onClick={logout} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <LogOut className="h-4 w-4" /> Logout
        </button>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 overflow-x-auto border-b border-border pb-px">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => { setActiveTab(tab.key); setMessage(null); }}
              className={cn(
                "flex items-center gap-1.5 px-3 py-2 text-sm font-medium whitespace-nowrap rounded-t-md border-b-2 transition-colors",
                isActive
                  ? "border-primary text-primary bg-primary/5"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:bg-accent"
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              {tab.label}
              {tab.key === "registrations" && stats.pending > 0 && (
                <span className="ml-1 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{stats.pending}</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Status Message */}
      {message && (
        <div className={cn("flex items-center gap-2 p-3 rounded-lg border text-sm",
          message.type === "success" ? "bg-green-500/10 border-green-500/30 text-green-400" : "bg-red-500/10 border-red-500/30 text-red-400"
        )}>
          {message.type === "success" ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
          {message.text}
        </div>
      )}

      {/* ── Overview Tab ── */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <StatBox label="Characters" value={stats.total} onClick={() => setActiveTab("roster")} />
            <StatBox label="Raiders" value={stats.raiders} color="text-primary" onClick={() => setActiveTab("roster")} />
            <StatBox label="Raider Alts" value={stats.alts} color="text-yellow-400" onClick={() => setActiveTab("roster")} />
            <StatBox label="Pending" value={stats.pending} color={stats.pending > 0 ? "text-red-400" : undefined} onClick={() => setActiveTab("registrations")} />
            <StatBox label="Pages" value={stats.pages} onClick={() => setActiveTab("content")} />
            <StatBox label="News Posts" value={stats.news} onClick={() => setActiveTab("content")} />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="bg-card border border-border rounded-lg p-4">
              <h3 className="text-sm font-bold uppercase tracking-[0.12em] text-muted-foreground mb-3">Quick Actions</h3>
              <div className="space-y-2">
                <QuickAction label="Import Guild Roster" icon={Download} onClick={handleGuildImport} loading={loading} />
                <QuickAction label="Sync All Characters" icon={RefreshCw} onClick={handleSyncAll} loading={loading} />
                <QuickAction label="View Registrations" icon={ClipboardCheck} onClick={() => setActiveTab("registrations")} badge={stats.pending > 0 ? `${stats.pending} pending` : undefined} />
                <QuickAction label="Manage Content" icon={FileText} onClick={() => setActiveTab("content")} />
              </div>
            </div>

            <div className="bg-card border border-border rounded-lg p-4">
              <h3 className="text-sm font-bold uppercase tracking-[0.12em] text-muted-foreground mb-3">Quick Links</h3>
              <div className="space-y-2">
                <QuickLink href="/audit" label="Raiders Audit" />
                <QuickLink href="/raids" label="Raid Attendance" />
                <QuickLink href="/loot" label="Loot Tracker" />
                <QuickLink href="/roster" label="Full Roster" />
                <QuickLink href="/professions" label="Professions" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Registrations Tab ── */}
      {activeTab === "registrations" && (
        <div className="space-y-4">
          <div className="bg-card border border-border rounded-lg p-4">
            <PendingRegistrations />
          </div>
          <div className="bg-secondary/30 border border-border rounded-lg p-4 text-sm text-muted-foreground">
            <p>Players can apply at <Link href="/join" className="text-primary hover:underline">/join</Link>. Approved registrations automatically create character records.</p>
          </div>
        </div>
      )}

      {/* ── Roster Tab ── */}
      {activeTab === "roster" && (
        <div className="space-y-4">
          {/* Add Character */}
          <div className="bg-card border border-border rounded-lg p-4">
            <h3 className="text-sm font-bold uppercase tracking-[0.12em] text-muted-foreground mb-3">Add Character</h3>
            <form onSubmit={handleAddCharacter} className="flex flex-wrap items-end gap-3">
              <div className="flex-1 min-w-[140px]">
                <label className="text-xs text-muted-foreground">Name</label>
                <input type="text" value={charName} onChange={(e) => setCharName(e.target.value)}
                  className="w-full mt-1 bg-secondary border border-border rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary" placeholder="Arthas" required />
              </div>
              <div className="flex-1 min-w-[140px]">
                <label className="text-xs text-muted-foreground">Realm</label>
                <input type="text" value={charRealm} onChange={(e) => setCharRealm(e.target.value)}
                  className="w-full mt-1 bg-secondary border border-border rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary" placeholder="area-52" required />
              </div>
              <button type="submit" disabled={loading}
                className="flex items-center gap-2 bg-primary text-primary-foreground rounded-md py-2 px-4 text-sm font-medium hover:opacity-90 disabled:opacity-50">
                <UserPlus className="h-4 w-4" /> Add
              </button>
            </form>
          </div>

          {/* Manage Raiders */}
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold uppercase tracking-[0.12em] text-muted-foreground flex items-center gap-2">
                <Swords className="h-4 w-4" /> Manage Raiders
              </h3>
              <div className="text-xs text-muted-foreground flex gap-3">
                <span className="text-primary">{rosterChars.filter((c) => c.isRaider).length} raiders</span>
                <span className="text-yellow-400">{rosterChars.filter((c) => c.isRaiderAlt).length} alts</span>
                <span>{rosterChars.length} total</span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mb-2">
              Click: <span className="text-primary">Raider</span> → <span className="text-yellow-400">Alt</span> → Remove
            </p>
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input type="text" value={raiderSearch} onChange={(e) => setRaiderSearch(e.target.value)}
                placeholder="Search characters..." className="w-full pl-9 pr-3 py-2 bg-secondary border border-border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
            </div>
            {rosterLoaded ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-1.5 max-h-80 overflow-y-auto">
                {rosterChars.filter((c) => c.name.toLowerCase().includes(raiderSearch.toLowerCase())).map((char) => (
                  <button key={char.id}
                    onClick={() => {
                      if (!char.isRaider && !char.isRaiderAlt) toggleRaider(char.id, false);
                      else if (char.isRaider) toggleRaiderAlt(char.id, false);
                      else toggleRaiderAlt(char.id, true);
                    }}
                    className={cn("flex items-center gap-2 px-2 py-1.5 rounded border text-sm text-left transition-colors",
                      char.isRaider ? "bg-primary/15 border-primary/40 text-primary"
                        : char.isRaiderAlt ? "bg-yellow-500/15 border-yellow-500/40 text-yellow-400"
                        : "bg-secondary/50 border-border text-muted-foreground hover:bg-secondary"
                    )}>
                    <span className={cn("w-2 h-2 rounded-full flex-shrink-0", char.isRaider ? "bg-primary" : char.isRaiderAlt ? "bg-yellow-400" : "bg-muted-foreground/30")} />
                    <span className="truncate font-medium">{char.name}</span>
                    {char.isRaiderAlt && <span className="text-[10px] text-yellow-400/70 ml-auto flex-shrink-0">ALT</span>}
                  </button>
                ))}
              </div>
            ) : <p className="text-sm text-muted-foreground">Loading...</p>}
          </div>
        </div>
      )}

      {/* ── Content Tab ── */}
      {activeTab === "content" && (
        <div className="space-y-6">
          <div className="bg-card border border-border rounded-lg p-4">
            <NewsEditor />
          </div>
          <div className="bg-card border border-border rounded-lg p-4">
            <PageManager />
          </div>
        </div>
      )}

      {/* ── Data Sync Tab ── */}
      {activeTab === "sync" && (
        <div className="space-y-4">
          <div className="bg-card border border-border rounded-lg p-4 space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-[0.12em] text-muted-foreground">Blizzard API Sync</h3>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 py-3 border-b border-border">
              <div>
                <div className="font-medium">Import Guild Roster</div>
                <div className="text-xs text-muted-foreground">Pull the full roster from Blizzard API. Creates new characters, updates existing.</div>
              </div>
              <button onClick={handleGuildImport} disabled={loading}
                className="flex items-center gap-2 bg-primary text-primary-foreground rounded-md py-2 px-4 text-sm font-medium hover:opacity-90 disabled:opacity-50 flex-shrink-0">
                <Download className="h-4 w-4" /> Import Roster
              </button>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 py-3">
              <div>
                <div className="font-medium">Sync All Characters</div>
                <div className="text-xs text-muted-foreground">Refresh detailed profiles (gear, stats, talents, M+, raids) for all active characters.</div>
              </div>
              <button onClick={handleSyncAll} disabled={loading}
                className="flex items-center gap-2 bg-secondary border border-border text-foreground rounded-md py-2 px-4 text-sm font-medium hover:bg-accent disabled:opacity-50 flex-shrink-0">
                <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} /> Sync All
              </button>
            </div>
          </div>
          <div className="bg-secondary/30 border border-border rounded-lg p-4 text-xs text-muted-foreground space-y-1">
            <p>Characters are auto-synced every hour via cron job.</p>
            <p>Manual sync is useful after importing new characters or after a Tuesday reset.</p>
          </div>
        </div>
      )}

      {/* ── Settings Tab ── */}
      {activeTab === "settings" && (
        <div className="space-y-4">
          <div className="bg-card border border-border rounded-lg p-4">
            <h3 className="text-sm font-bold uppercase tracking-[0.12em] text-muted-foreground mb-4 flex items-center gap-2">
              <KeyRound className="h-4 w-4" /> Change Admin Password
            </h3>
            <form onSubmit={handleChangePassword} className="space-y-3 max-w-sm">
              <div>
                <label className="text-xs text-muted-foreground">New Password</label>
                <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full mt-1 bg-secondary border border-border rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                  placeholder="Enter new password" required minLength={4} />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Confirm Password</label>
                <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full mt-1 bg-secondary border border-border rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                  placeholder="Confirm new password" required minLength={4} />
              </div>
              <button type="submit" disabled={loading}
                className="flex items-center gap-2 bg-primary text-primary-foreground rounded-md py-2 px-4 text-sm font-medium hover:opacity-90 disabled:opacity-50">
                <KeyRound className="h-4 w-4" /> Change Password
              </button>
            </form>
          </div>

          <div className="bg-card border border-border rounded-lg p-4">
            <h3 className="text-sm font-bold uppercase tracking-[0.12em] text-muted-foreground mb-3">Setup Info</h3>
            <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
              <li>Create a Blizzard API app at <code className="text-xs">develop.battle.net</code></li>
              <li>Set <code className="text-xs">BLIZZARD_CLIENT_ID</code> and <code className="text-xs">BLIZZARD_CLIENT_SECRET</code> in environment variables</li>
              <li>Set <code className="text-xs">GUILD_REALM</code> and <code className="text-xs">GUILD_NAME</code></li>
              <li>Import guild roster from the Data Sync tab</li>
              <li>Mark raiders from the Roster tab</li>
            </ol>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Helper Components ──

function StatBox({ label, value, color, onClick }: { label: string; value: number; color?: string; onClick?: () => void }) {
  return (
    <button onClick={onClick} className="bg-card border border-border rounded-lg p-3 text-left hover:bg-accent/30 transition-colors">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className={cn("text-xl font-bold mt-0.5", color)}>{value}</div>
    </button>
  );
}

function QuickAction({ label, icon: Icon, onClick, loading, badge }: { label: string; icon: any; onClick: () => void; loading?: boolean; badge?: string }) {
  return (
    <button onClick={onClick} disabled={loading}
      className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm text-left hover:bg-accent transition-colors disabled:opacity-50">
      <Icon className={cn("h-4 w-4 text-muted-foreground flex-shrink-0", loading && "animate-spin")} />
      <span className="flex-1">{label}</span>
      {badge && <span className="text-[10px] bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded font-bold">{badge}</span>}
    </button>
  );
}

function QuickLink({ href, label }: { href: string; label: string }) {
  return (
    <Link href={href} className="flex items-center gap-3 px-3 py-2 rounded-md text-sm hover:bg-accent transition-colors text-muted-foreground hover:text-foreground">
      <span className="flex-1">{label}</span>
      <span className="text-[10px] text-muted-foreground/50">→</span>
    </Link>
  );
}
