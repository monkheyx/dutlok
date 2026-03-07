"use client";

import { useState } from "react";
import { RefreshCw, Download, UserPlus, AlertCircle, CheckCircle, KeyRound, LogOut } from "lucide-react";
import { useAdmin } from "@/components/admin-provider";
import { PendingRegistrations } from "@/components/pending-registrations";

export default function AdminPage() {
  const { password, isAuthenticated, login, logout } = useAdmin();
  const [loginInput, setLoginInput] = useState("");
  const [loginError, setLoginError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Simple character add form
  const [charName, setCharName] = useState("");
  const [charRealm, setCharRealm] = useState("");

  // Password change form
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  async function handleAuth(e: React.FormEvent) {
    e.preventDefault();
    setLoginError(false);
    const success = await login(loginInput);
    if (!success) {
      setLoginError(true);
    }
  }

  async function handleGuildImport() {
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch("/api/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "import_guild", password }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage({ type: "success", text: `Imported ${data.imported} new, updated ${data.updated} characters. ${data.failed} failed.` });
      } else {
        setMessage({ type: "error", text: data.error || "Import failed" });
      }
    } catch (err) {
      setMessage({ type: "error", text: "Network error" });
    }
    setLoading(false);
  }

  async function handleSyncAll() {
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch("/api/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "sync_all", password }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage({ type: "success", text: `Synced ${data.succeeded}/${data.total} characters. ${data.failed} failed.` });
      } else {
        setMessage({ type: "error", text: data.error || "Sync failed" });
      }
    } catch (err) {
      setMessage({ type: "error", text: "Network error" });
    }
    setLoading(false);
  }

  async function handleAddCharacter(e: React.FormEvent) {
    e.preventDefault();
    if (!charName || !charRealm) return;
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch("/api/characters", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: charName, realm: charRealm, password }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage({ type: "success", text: `Added ${charName}-${charRealm}` });
        setCharName("");
        setCharRealm("");
      } else {
        setMessage({ type: "error", text: data.error || "Failed to add character" });
      }
    } catch (err) {
      setMessage({ type: "error", text: "Network error" });
    }
    setLoading(false);
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setMessage({ type: "error", text: "Passwords do not match" });
      return;
    }
    if (newPassword.length < 4) {
      setMessage({ type: "error", text: "Password must be at least 4 characters" });
      return;
    }
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword: password, newPassword }),
      });
      const data = await res.json();
      if (res.ok) {
        // Re-login with the new password so context is updated
        await login(newPassword);
        setNewPassword("");
        setConfirmPassword("");
        setMessage({ type: "success", text: "Password changed successfully" });
      } else {
        setMessage({ type: "error", text: data.error || "Failed to change password" });
      }
    } catch (err) {
      setMessage({ type: "error", text: "Network error" });
    }
    setLoading(false);
  }

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto mt-20">
        <div className="bg-card border border-border rounded-lg p-6">
          <h1 className="text-xl font-bold mb-4">Admin Access</h1>
          <form onSubmit={handleAuth} className="space-y-4">
            <div>
              <label className="text-sm text-muted-foreground">Admin Password</label>
              <input
                type="password"
                value={loginInput}
                onChange={(e) => setLoginInput(e.target.value)}
                className="w-full mt-1 bg-secondary border border-border rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                required
              />
            </div>
            {loginError && (
              <p className="text-sm text-destructive">Incorrect password</p>
            )}
            <button
              type="submit"
              className="w-full bg-primary text-primary-foreground rounded-md py-2 px-4 text-sm font-medium hover:opacity-90 transition-opacity"
            >
              Enter Admin Panel
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Admin Panel</h1>
          <p className="text-muted-foreground">Manage guild roster and data sync</p>
        </div>
        <button
          onClick={logout}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </div>

      {/* Status Message */}
      {message && (
        <div
          className={`flex items-center gap-2 p-3 rounded-lg border ${
            message.type === "success"
              ? "bg-green-500/10 border-green-500/30 text-green-400"
              : "bg-red-500/10 border-red-500/30 text-red-400"
          }`}
        >
          {message.type === "success" ? (
            <CheckCircle className="h-4 w-4" />
          ) : (
            <AlertCircle className="h-4 w-4" />
          )}
          {message.text}
        </div>
      )}

      {/* Pending Registrations */}
      <div className="bg-card border border-border rounded-lg p-4">
        <PendingRegistrations />
      </div>

      {/* Sync Actions */}
      <div className="bg-card border border-border rounded-lg p-4">
        <h2 className="text-lg font-semibold mb-4">Data Sync</h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">Import Guild Roster</div>
              <div className="text-sm text-muted-foreground">
                Pull the full guild roster from Blizzard API. Creates new characters, updates existing ones.
              </div>
            </div>
            <button
              onClick={handleGuildImport}
              disabled={loading}
              className="flex items-center gap-2 bg-primary text-primary-foreground rounded-md py-2 px-4 text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              <Download className="h-4 w-4" />
              Import
            </button>
          </div>
          <div className="border-t border-border" />
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">Sync All Characters</div>
              <div className="text-sm text-muted-foreground">
                Refresh detailed profiles (gear, stats, talents) for all active characters.
              </div>
            </div>
            <button
              onClick={handleSyncAll}
              disabled={loading}
              className="flex items-center gap-2 bg-secondary text-foreground border border-border rounded-md py-2 px-4 text-sm font-medium hover:bg-accent transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              Sync All
            </button>
          </div>
        </div>
      </div>

      {/* Add Character */}
      <div className="bg-card border border-border rounded-lg p-4">
        <h2 className="text-lg font-semibold mb-4">Add Character</h2>
        <form onSubmit={handleAddCharacter} className="flex items-end gap-3">
          <div className="flex-1">
            <label className="text-sm text-muted-foreground">Character Name</label>
            <input
              type="text"
              value={charName}
              onChange={(e) => setCharName(e.target.value)}
              className="w-full mt-1 bg-secondary border border-border rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              placeholder="Arthas"
              required
            />
          </div>
          <div className="flex-1">
            <label className="text-sm text-muted-foreground">Realm Slug</label>
            <input
              type="text"
              value={charRealm}
              onChange={(e) => setCharRealm(e.target.value)}
              className="w-full mt-1 bg-secondary border border-border rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              placeholder="area-52"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 bg-primary text-primary-foreground rounded-md py-2 px-4 text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            <UserPlus className="h-4 w-4" />
            Add
          </button>
        </form>
      </div>

      {/* Change Password */}
      <div className="bg-card border border-border rounded-lg p-4">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <KeyRound className="h-5 w-5" />
          Change Admin Password
        </h2>
        <form onSubmit={handleChangePassword} className="space-y-3 max-w-sm">
          <div>
            <label className="text-sm text-muted-foreground">New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full mt-1 bg-secondary border border-border rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              placeholder="Enter new password"
              required
              minLength={4}
            />
          </div>
          <div>
            <label className="text-sm text-muted-foreground">Confirm New Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full mt-1 bg-secondary border border-border rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              placeholder="Confirm new password"
              required
              minLength={4}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 bg-primary text-primary-foreground rounded-md py-2 px-4 text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            <KeyRound className="h-4 w-4" />
            Change Password
          </button>
        </form>
      </div>

      {/* Info */}
      <div className="bg-card border border-border rounded-lg p-4 text-sm text-muted-foreground">
        <h3 className="font-semibold text-foreground mb-2">Setup Instructions</h3>
        <ol className="list-decimal list-inside space-y-1">
          <li>Create a Blizzard API application at <code>develop.battle.net</code></li>
          <li>Set <code>BLIZZARD_CLIENT_ID</code> and <code>BLIZZARD_CLIENT_SECRET</code> in your <code>.env</code></li>
          <li>Set <code>GUILD_REALM</code> (slug format, e.g., <code>area-52</code>) and <code>GUILD_NAME</code></li>
          <li>Click "Import Guild Roster" to pull your roster</li>
          <li>Click "Sync All Characters" to fetch detailed profiles</li>
          <li>Mark mains/alts and assign teams from the character detail pages</li>
        </ol>
      </div>
    </div>
  );
}
