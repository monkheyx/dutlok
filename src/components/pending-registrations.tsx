"use client";

import { useState, useEffect, useCallback } from "react";
import { useAdmin } from "@/components/admin-provider";
import { CheckCircle, XCircle, Trash2, Clock, UserCheck, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface Registration {
  id: number;
  characterName: string;
  realmSlug: string;
  region: string;
  submittedBy: string | null;
  notes: string | null;
  status: string;
  reviewedAt: string | null;
  createdAt: string;
}

export function PendingRegistrations() {
  const { password } = useAdmin();
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionMessage, setActionMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [showAll, setShowAll] = useState(false);

  const fetchRegistrations = useCallback(async () => {
    try {
      const res = await fetch(`/api/registrations?password=${encodeURIComponent(password || "")}`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setRegistrations(data);
      }
    } catch {
      // Silent fail
    }
    setLoading(false);
  }, [password]);

  useEffect(() => {
    fetchRegistrations();
  }, [fetchRegistrations]);

  async function handleAction(id: number, action: "approve" | "reject") {
    setActionMessage(null);
    try {
      const res = await fetch(`/api/registrations/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, password }),
      });
      const data = await res.json();
      if (res.ok) {
        setActionMessage({ type: "success", text: data.message });
        fetchRegistrations();
      } else {
        setActionMessage({ type: "error", text: data.error || "Action failed" });
      }
    } catch {
      setActionMessage({ type: "error", text: "Network error" });
    }
  }

  async function handleDelete(id: number) {
    try {
      const res = await fetch(`/api/registrations/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        fetchRegistrations();
      }
    } catch {
      // Silent fail
    }
  }

  const pending = registrations.filter((r) => r.status === "pending");
  const processed = registrations.filter((r) => r.status !== "pending");
  const displayList = showAll ? registrations : pending;

  if (loading) {
    return <div className="text-sm text-muted-foreground">Loading registrations...</div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold">Registrations</h2>
          {pending.length > 0 && (
            <span className="bg-yellow-500/20 text-yellow-400 text-xs font-bold px-2 py-0.5 rounded-full">
              {pending.length} pending
            </span>
          )}
        </div>
        {processed.length > 0 && (
          <button
            onClick={() => setShowAll(!showAll)}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            {showAll ? "Show pending only" : `Show all (${registrations.length})`}
          </button>
        )}
      </div>

      {actionMessage && (
        <div
          className={cn(
            "flex items-center gap-2 p-2 rounded-lg border mb-3 text-sm",
            actionMessage.type === "success"
              ? "bg-green-500/10 border-green-500/30 text-green-400"
              : "bg-red-500/10 border-red-500/30 text-red-400"
          )}
        >
          {actionMessage.type === "success" ? <CheckCircle className="h-3.5 w-3.5" /> : <AlertCircle className="h-3.5 w-3.5" />}
          {actionMessage.text}
        </div>
      )}

      {displayList.length === 0 ? (
        <p className="text-sm text-muted-foreground py-3">
          {showAll ? "No registrations yet." : "No pending registrations."}
        </p>
      ) : (
        <div className="space-y-2">
          {displayList.map((reg) => (
            <div
              key={reg.id}
              className={cn(
                "flex items-center justify-between p-3 rounded-lg border",
                reg.status === "pending"
                  ? "bg-yellow-500/5 border-yellow-500/20"
                  : reg.status === "approved"
                  ? "bg-green-500/5 border-green-500/20"
                  : "bg-red-500/5 border-red-500/20"
              )}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm">{reg.characterName}</span>
                  <span className="text-xs text-muted-foreground">-{reg.realmSlug}</span>
                  <StatusBadge status={reg.status} />
                </div>
                <div className="flex items-center gap-3 mt-0.5 text-xs text-muted-foreground">
                  {reg.submittedBy && <span>by {reg.submittedBy}</span>}
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {new Date(reg.createdAt).toLocaleDateString()}
                  </span>
                  {reg.notes && <span className="truncate max-w-[200px]">{reg.notes}</span>}
                </div>
              </div>

              <div className="flex items-center gap-1.5 ml-3 shrink-0">
                {reg.status === "pending" ? (
                  <>
                    <button
                      onClick={() => handleAction(reg.id, "approve")}
                      className="flex items-center gap-1 bg-green-500/20 text-green-400 border border-green-500/30 rounded-md py-1 px-2.5 text-xs font-medium hover:bg-green-500/30 transition-colors"
                      title="Approve — adds character to roster"
                    >
                      <UserCheck className="h-3.5 w-3.5" />
                      Approve
                    </button>
                    <button
                      onClick={() => handleAction(reg.id, "reject")}
                      className="flex items-center gap-1 bg-red-500/20 text-red-400 border border-red-500/30 rounded-md py-1 px-2.5 text-xs font-medium hover:bg-red-500/30 transition-colors"
                      title="Reject"
                    >
                      <XCircle className="h-3.5 w-3.5" />
                      Reject
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => handleDelete(reg.id)}
                    className="text-muted-foreground hover:text-red-400 transition-colors p-1"
                    title="Delete registration"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  if (status === "pending") {
    return (
      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-yellow-500/20 text-yellow-400">
        <Clock className="h-2.5 w-2.5" />
        Pending
      </span>
    );
  }
  if (status === "approved") {
    return (
      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-green-500/20 text-green-400">
        <CheckCircle className="h-2.5 w-2.5" />
        Approved
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-red-500/20 text-red-400">
      <XCircle className="h-2.5 w-2.5" />
      Rejected
    </span>
  );
}
