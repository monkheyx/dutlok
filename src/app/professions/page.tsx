import { getProfessionsAudit } from "@/lib/audit";
import { Wrench } from "lucide-react";
import { ProfessionSearch } from "@/components/profession-search";
import { ProfessionGuides } from "@/components/profession-guides";

export const dynamic = "force-dynamic";

export default function ProfessionsPage() {
  const professionsAudit = getProfessionsAudit(false);

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Wrench className="h-6 w-6" />
          Professions
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Search for crafters by profession or item type. Find who can make what you need.
        </p>
      </div>

      {/* Leveling Guides */}
      <ProfessionGuides />

      {/* Guild Crafters */}
      <div className="bg-card border border-border rounded-lg p-4">
        {professionsAudit.length > 0 ? (
          <ProfessionSearch professions={professionsAudit} />
        ) : (
          <p className="text-muted-foreground text-sm text-center py-6">
            No profession data found. Sync characters to load their professions.
          </p>
        )}
      </div>
    </div>
  );
}
