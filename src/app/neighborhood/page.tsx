import { Map } from "lucide-react";
import { NeighborhoodClient } from "@/components/neighborhood-client";

export const dynamic = "force-dynamic";

export default function NeighborhoodPage() {
  return (
    <div className="container mx-auto max-w-[120rem] px-4 py-8 space-y-6">
      <div>
        <p className="text-xs text-muted-foreground mb-1">General</p>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Map className="h-6 w-6" />
          Neighborhood
        </h1>
      </div>

      <NeighborhoodClient />
    </div>
  );
}
