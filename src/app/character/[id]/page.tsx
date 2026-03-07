import { getCharacterWithProfile } from "@/lib/queries";
import { ClassBadge } from "@/components/class-badge";
import { RoleBadge } from "@/components/role-badge";
import { StatCard } from "@/components/stat-card";
import { CLASS_COLORS, CLASS_ARMOR } from "@/lib/wow-data";
import { formatDate, timeAgo } from "@/lib/utils";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Star, RefreshCw, Shield, Swords, Heart, Zap } from "lucide-react";
import { CharacterActions } from "@/components/character-actions";
import { TalentBuild } from "@/components/talent-build";

export const dynamic = "force-dynamic";

interface Props {
  params: { id: string };
}

export default function CharacterDetailPage({ params }: Props) {
  const id = parseInt(params.id, 10);
  if (isNaN(id)) return notFound();

  const data = getCharacterWithProfile(id);
  if (!data) return notFound();

  const { character, profile, member } = data;
  const classColor = CLASS_COLORS[character.className ?? ""] || "#888";
  const armorType = CLASS_ARMOR[character.className ?? ""] || "Unknown";

  // Parse JSON fields — may be string, array, or object
  const parseJsonArray = (val: unknown): any[] => {
    if (!val) return [];
    const parsed = typeof val === "string" ? JSON.parse(val) : val;
    return Array.isArray(parsed) ? parsed : [];
  };
  const equipment = parseJsonArray(profile?.equipment);
  const professions = parseJsonArray(profile?.professions);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <Link
            href="/roster"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1 mb-2"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Roster
          </Link>
          <div className="flex items-center gap-3">
            {character.avatarUrl && (
              <img
                src={character.avatarUrl}
                alt=""
                className="w-16 h-16 rounded-full border-2"
                style={{ borderColor: classColor }}
              />
            )}
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-3xl font-bold" style={{ color: classColor }}>
                  {character.name}
                </h1>
                {character.isMain && (
                  <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                )}
              </div>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <span>{character.realm}</span>
                <span>{character.faction}</span>
                <span>{character.race}</span>
                <ClassBadge className={character.className} spec={character.activeSpec} />
              </div>
            </div>
          </div>
        </div>
        <div className="text-right text-sm text-muted-foreground">
          <div>Last synced: {timeAgo(character.lastSyncedAt)}</div>
          {member && <div>Player: {member.name}</div>}
          {character.raidTeam && <div>Team: {character.raidTeam}</div>}
        </div>
      </div>

      {/* Admin Actions */}
      <div className="bg-card border border-border rounded-lg p-4">
        <CharacterActions
          characterId={character.id}
          characterName={character.name}
          isMain={character.isMain ?? false}
          isActive={character.isActive ?? true}
        />
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <StatCard label="Item Level" value={character.equippedItemLevel ?? character.itemLevel ?? "-"} icon={Shield} />
        <StatCard label="Level" value={character.level ?? "-"} />
        <StatCard label="Role" value={<RoleBadge role={character.role} /> as any} />
        <StatCard label="Armor Type" value={armorType} />
        <StatCard
          label="M+ Rating"
          value={profile?.mythicPlusRating?.toFixed(1) ?? "-"}
          icon={Zap}
        />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Secondary Stats */}
        {profile && (
          <div className="bg-card border border-border rounded-lg p-4">
            <h2 className="text-lg font-semibold mb-4">Stats</h2>
            <div className="grid grid-cols-2 gap-3">
              <StatBlock label="Strength" value={profile.strength} />
              <StatBlock label="Agility" value={profile.agility} />
              <StatBlock label="Intellect" value={profile.intellect} />
              <StatBlock label="Stamina" value={profile.stamina} />
            </div>
            <div className="border-t border-border mt-4 pt-4 grid grid-cols-2 gap-3">
              <StatBlock label="Critical Strike" value={profile.criticalStrike?.toFixed(2)} suffix="%" />
              <StatBlock label="Haste" value={profile.haste?.toFixed(2)} suffix="%" />
              <StatBlock label="Mastery" value={profile.mastery?.toFixed(2)} suffix="%" />
              <StatBlock label="Versatility" value={profile.versatility?.toFixed(2)} suffix="%" />
            </div>
          </div>
        )}

        {/* Professions */}
        <div className="bg-card border border-border rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-4">Professions</h2>
          {professions.length === 0 ? (
            <p className="text-muted-foreground text-sm">No profession data available.</p>
          ) : (
            <div className="space-y-3">
              {professions.map((prof: any, i: number) => (
                <div key={i} className="flex items-center justify-between">
                  <span className="font-medium">{prof.name}</span>
                  <span className="text-sm text-muted-foreground">
                    {prof.skillPoints !== undefined
                      ? `${prof.skillPoints} / ${prof.maxSkillPoints}`
                      : ""}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Guild Rank */}
          <div className="border-t border-border mt-4 pt-4">
            <h3 className="text-sm font-semibold mb-2">Guild Info</h3>
            <div className="text-sm space-y-1">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Rank</span>
                <span>{character.guildRankName ?? character.guildRank ?? "-"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status</span>
                <span className={character.isActive ? "text-green-400" : "text-red-400"}>
                  {character.isActive ? "Active" : "Inactive"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Type</span>
                <span>{character.isMain ? "Main" : "Alt"}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Talent Build */}
      <TalentBuild
        talents={profile?.talents}
        className={character.className}
        activeSpec={character.activeSpec}
      />

      {/* Equipment */}
      <div className="bg-card border border-border rounded-lg p-4">
        <h2 className="text-lg font-semibold mb-4">Equipment</h2>
        {equipment.length === 0 ? (
          <p className="text-muted-foreground text-sm">No equipment data available. Sync this character to load gear.</p>
        ) : (
          <div className="grid md:grid-cols-2 gap-2">
            {equipment.map((item: any, i: number) => (
              <div key={i} className="flex items-center justify-between py-2 px-3 rounded bg-secondary/50">
                <div>
                  <span className="text-xs text-muted-foreground mr-2">{item.slot?.name}</span>
                  <span className={`font-medium text-sm quality-${(item.quality?.type || "common").toLowerCase()}`}>
                    {item.name}
                  </span>
                </div>
                <span className="text-xs text-muted-foreground font-mono">
                  {item.level?.value ? `${item.level.value}` : ""}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Render Image */}
      {character.renderUrl && (
        <div className="bg-card border border-border rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-4">Character Render</h2>
          <img
            src={character.renderUrl}
            alt={character.name}
            className="max-h-96 mx-auto"
          />
        </div>
      )}
    </div>
  );
}

function StatBlock({
  label,
  value,
  suffix,
}: {
  label: string;
  value: number | string | null | undefined;
  suffix?: string;
}) {
  return (
    <div>
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="text-lg font-semibold">
        {value ?? "-"}
        {value != null && suffix ? suffix : ""}
      </div>
    </div>
  );
}
