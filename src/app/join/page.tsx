"use client";

import { useState } from "react";
import { UserPlus, CheckCircle, AlertCircle } from "lucide-react";

export default function JoinPage() {
  const [charName, setCharName] = useState("");
  const [realm, setRealm] = useState("");
  const [submittedBy, setSubmittedBy] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!charName.trim() || !realm.trim()) return;

    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch("/api/registrations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          characterName: charName.trim(),
          realm: realm.trim(),
          submittedBy: submittedBy.trim() || undefined,
          notes: notes.trim() || undefined,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage({
          type: "success",
          text: `Registration submitted for ${charName}-${realm}! An admin will review it shortly.`,
        });
        setCharName("");
        setRealm("");
        setNotes("");
      } else {
        setMessage({ type: "error", text: data.error || "Failed to submit registration" });
      }
    } catch {
      setMessage({ type: "error", text: "Network error. Please try again." });
    }

    setLoading(false);
  }

  return (
    <div className="container mx-auto max-w-lg px-4 py-12">
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="text-center mb-6">
          <UserPlus className="h-10 w-10 mx-auto mb-3 text-primary" />
          <h1 className="text-2xl font-bold">Join the Roster</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Submit your character to be added to the guild tracker. An admin will review and approve your request.
          </p>
        </div>

        {message && (
          <div
            className={`flex items-start gap-2 p-3 rounded-lg border mb-4 ${
              message.type === "success"
                ? "bg-green-500/10 border-green-500/30 text-green-400"
                : "bg-red-500/10 border-red-500/30 text-red-400"
            }`}
          >
            {message.type === "success" ? (
              <CheckCircle className="h-4 w-4 mt-0.5 shrink-0" />
            ) : (
              <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
            )}
            <span className="text-sm">{message.text}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium">
              Character Name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={charName}
              onChange={(e) => setCharName(e.target.value)}
              className="w-full mt-1 bg-secondary border border-border rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              placeholder="Arthas"
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium">
              Realm <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={realm}
              onChange={(e) => setRealm(e.target.value)}
              className="w-full mt-1 bg-secondary border border-border rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              placeholder="spinebreaker"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Use the realm slug (lowercase, hyphens for spaces, e.g. &quot;area-52&quot;)
            </p>
          </div>

          <div>
            <label className="text-sm font-medium">Your Name / Discord</label>
            <input
              type="text"
              value={submittedBy}
              onChange={(e) => setSubmittedBy(e.target.value)}
              className="w-full mt-1 bg-secondary border border-border rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              placeholder="YourName#1234"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full mt-1 bg-secondary border border-border rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary resize-none"
              rows={2}
              placeholder="Main or alt? Any other info..."
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground rounded-md py-2.5 px-4 text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            <UserPlus className="h-4 w-4" />
            {loading ? "Submitting..." : "Submit Registration"}
          </button>
        </form>
      </div>
    </div>
  );
}
