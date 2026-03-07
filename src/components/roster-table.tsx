import Link from "next/link";
import { ClassBadge } from "@/components/class-badge";
import { RoleBadge } from "@/components/role-badge";
import { timeAgo } from "@/lib/utils";
import { Star } from "lucide-react";

interface Character {
  id: number;
  name: string;
  realm: string;
  className: string | null;
  activeSpec: string | null;
  role: string | null;
  level: number | null;
  itemLevel: number | null;
  equippedItemLevel: number | null;
  isMain: boolean | null;
  isActive: boolean | null;
  raidTeam: string | null;
  lastSyncedAt: string | null;
  avatarUrl: string | null;
}

interface RosterTableProps {
  characters: Character[];
}

export function RosterTable({ characters }: RosterTableProps) {
  if (characters.length === 0) {
    return (
      <div className="bg-card border border-border rounded-lg p-8 text-center">
        <p className="text-muted-foreground">No characters found.</p>
        <p className="text-sm text-muted-foreground mt-1">
          Import your guild roster from the Admin page to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-secondary/50">
              <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Character</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Class / Spec</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Role</th>
              <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">iLvl</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Realm</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Team</th>
              <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Updated</th>
            </tr>
          </thead>
          <tbody>
            {characters.map((char) => (
              <tr
                key={char.id}
                className="border-b border-border/50 hover:bg-accent/50 transition-colors"
              >
                <td className="py-3 px-4">
                  <Link
                    href={`/character/${char.id}`}
                    className="flex items-center gap-2 hover:text-primary transition-colors"
                  >
                    {char.avatarUrl && (
                      <img
                        src={char.avatarUrl}
                        alt=""
                        className="w-8 h-8 rounded-full border border-border"
                      />
                    )}
                    <div className="flex items-center gap-1">
                      <span className="font-medium">{char.name}</span>
                      {char.isMain && (
                        <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                      )}
                    </div>
                  </Link>
                </td>
                <td className="py-3 px-4">
                  <ClassBadge className={char.className} spec={char.activeSpec} />
                </td>
                <td className="py-3 px-4">
                  <RoleBadge role={char.role} size="sm" />
                </td>
                <td className="py-3 px-4 text-right">
                  <span className="font-mono text-sm">
                    {char.equippedItemLevel ?? char.itemLevel ?? "-"}
                  </span>
                </td>
                <td className="py-3 px-4 text-sm text-muted-foreground">{char.realm}</td>
                <td className="py-3 px-4 text-sm text-muted-foreground">{char.raidTeam ?? "-"}</td>
                <td className="py-3 px-4 text-right text-sm text-muted-foreground">
                  {timeAgo(char.lastSyncedAt)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
