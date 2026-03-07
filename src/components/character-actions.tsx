"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, RefreshCw, Star, StarOff, AlertCircle, CheckCircle } from "lucide-react";
import { useAdmin } from "@/components/admin-provider";

interface CharacterActionsProps {
  characterId: number;
  characterName: string;
  isMain: boolean;
  isActive: boolean;
}

export function CharacterActions({ characterId, characterName, isMain, isActive }: CharacterActionsProps) {
  const router = useRouter();
  const { password, isAuthenticated, login } = useAdmin();
  const [loginInput, setLoginInput] = useState("");
  const [showAuth, setShowAuth] = useState(false);
  const [pendingAction, setPendingAction] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  async function executeAction(action: string) {
    if (!isAuthenticated) {
      setPendingAction(action);
      setShowAuth(true);
      return;
    }
    performAction(action);
  }

  async function performAction(action: string) {
    setLoading(true);
    setMessage(null);

    try {
      switch (action) {
        case "delete": {
          const res = await fetch(`/api/characters/${characterId}`, {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ password }),
          });
          if (res.ok) {
            router.push("/roster");
            return;
          }
          const data = await res.json();
          setMessage({ type: "error", text: data.error || "Delete failed" });
          break;
        }
        case "toggle_main": {
          const res = await fetch(`/api/characters/${characterId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ password, isMain: !isMain }),
          });
          if (res.ok) {
            setMessage({ type: "success", text: isMain ? "Unmarked as main" : "Marked as main" });
            router.refresh();
          } else {
            const data = await res.json();
            setMessage({ type: "error", text: data.error || "Update failed" });
          }
          break;
        }
        case "toggle_active": {
          const res = await fetch(`/api/characters/${characterId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ password, isActive: !isActive }),
          });
          if (res.ok) {
            setMessage({ type: "success", text: isActive ? "Marked inactive" : "Marked active" });
            router.refresh();
          } else {
            const data = await res.json();
            setMessage({ type: "error", text: data.error || "Update failed" });
          }
          break;
        }
        case "sync": {
          const res = await fetch("/api/sync", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "sync_character", characterId, password }),
          });
          if (res.ok) {
            setMessage({ type: "success", text: "Character synced" });
            router.refresh();
          } else {
            const data = await res.json();
            setMessage({ type: "error", text: data.error || "Sync failed" });
          }
          break;
        }
      }
    } catch {
      setMessage({ type: "error", text: "Network error" });
    }

    setLoading(false);
    setShowDeleteConfirm(false);
  }

  async function handleAuthSubmit(e: React.FormEvent) {
    e.preventDefault();
    const success = await login(loginInput);
    if (success) {
      setShowAuth(false);
      if (pendingAction) {
        // Small delay to let state update
        setTimeout(() => performAction(pendingAction), 50);
        setPendingAction(null);
      }
    } else {
      setMessage({ type: "error", text: "Incorrect password" });
    }
  }

  return (
    <div className="space-y-3">
      {/* Auth prompt */}
      {showAuth && !isAuthenticated && (
        <form onSubmit={handleAuthSubmit} className="flex items-end gap-2">
          <div className="flex-1">
            <label className="text-xs text-muted-foreground">Admin Password</label>
            <input
              type="password"
              value={loginInput}
              onChange={(e) => setLoginInput(e.target.value)}
              className="w-full mt-1 bg-secondary border border-border rounded-md py-1.5 px-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              autoFocus
              required
            />
          </div>
          <button
            type="submit"
            className="bg-primary text-primary-foreground rounded-md py-1.5 px-3 text-sm font-medium hover:opacity-90"
          >
            Confirm
          </button>
        </form>
      )}

      {/* Message */}
      {message && (
        <div
          className={`flex items-center gap-2 p-2 rounded text-sm ${
            message.type === "success"
              ? "bg-green-500/10 text-green-400"
              : "bg-red-500/10 text-red-400"
          }`}
        >
          {message.type === "success" ? <CheckCircle className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
          {message.text}
        </div>
      )}

      {/* Action buttons */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => executeAction("sync")}
          disabled={loading}
          className="flex items-center gap-1.5 bg-secondary border border-border rounded-md py-1.5 px-3 text-sm hover:bg-accent transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          Sync
        </button>

        <button
          onClick={() => executeAction("toggle_main")}
          disabled={loading}
          className="flex items-center gap-1.5 bg-secondary border border-border rounded-md py-1.5 px-3 text-sm hover:bg-accent transition-colors disabled:opacity-50"
        >
          {isMain ? <StarOff className="h-3.5 w-3.5" /> : <Star className="h-3.5 w-3.5" />}
          {isMain ? "Unmark Main" : "Mark Main"}
        </button>

        <button
          onClick={() => executeAction("toggle_active")}
          disabled={loading}
          className="flex items-center gap-1.5 bg-secondary border border-border rounded-md py-1.5 px-3 text-sm hover:bg-accent transition-colors disabled:opacity-50"
        >
          {isActive ? "Mark Inactive" : "Mark Active"}
        </button>

        {!showDeleteConfirm ? (
          <button
            onClick={() => setShowDeleteConfirm(true)}
            disabled={loading}
            className="flex items-center gap-1.5 bg-destructive/10 border border-destructive/30 text-destructive rounded-md py-1.5 px-3 text-sm hover:bg-destructive/20 transition-colors disabled:opacity-50 ml-auto"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Delete
          </button>
        ) : (
          <div className="flex items-center gap-2 ml-auto">
            <span className="text-sm text-destructive">Delete {characterName}?</span>
            <button
              onClick={() => executeAction("delete")}
              disabled={loading}
              className="bg-destructive text-destructive-foreground rounded-md py-1.5 px-3 text-sm font-medium hover:opacity-90 disabled:opacity-50"
            >
              Confirm Delete
            </button>
            <button
              onClick={() => setShowDeleteConfirm(false)}
              className="bg-secondary border border-border rounded-md py-1.5 px-3 text-sm hover:bg-accent"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
