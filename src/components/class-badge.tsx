import { CLASS_COLORS } from "@/lib/wow-data";
import { cn } from "@/lib/utils";

interface ClassBadgeProps {
  className?: string | null;
  spec?: string | null;
  showSpec?: boolean;
  size?: "sm" | "md";
}

export function ClassBadge({ className: wowClass, spec, showSpec = true, size = "md" }: ClassBadgeProps) {
  if (!wowClass) return <span className="text-muted-foreground">Unknown</span>;

  const color = CLASS_COLORS[wowClass] || "#888888";

  return (
    <span
      className={cn(
        "font-medium whitespace-nowrap",
        size === "sm" ? "text-xs" : "text-sm"
      )}
      style={{ color }}
    >
      {showSpec && spec ? `${spec} ${wowClass}` : wowClass}
    </span>
  );
}
