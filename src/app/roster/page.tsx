import { getAllCharacters } from "@/lib/queries";
import { RosterTable } from "@/components/roster-table";
import { RosterFilters } from "@/components/roster-filters";

export const dynamic = "force-dynamic";

interface Props {
  searchParams: {
    search?: string;
    class?: string;
    role?: string;
    main?: string;
    active?: string;
    team?: string;
    sort?: string;
    dir?: string;
  };
}

export default function RosterPage({ searchParams }: Props) {
  const characters = getAllCharacters({
    search: searchParams.search,
    className: searchParams.class,
    role: searchParams.role,
    isMain: searchParams.main === "true" ? true : searchParams.main === "false" ? false : undefined,
    isActive: searchParams.active === "false" ? false : true,
    raidTeam: searchParams.team,
    sortBy: searchParams.sort || "name",
    sortDir: (searchParams.dir as "asc" | "desc") || "asc",
  });

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Guild Roster</h1>
        <p className="text-muted-foreground">
          {characters.length} character{characters.length !== 1 ? "s" : ""}
        </p>
      </div>

      <RosterFilters />
      <RosterTable characters={characters} />
    </div>
  );
}
