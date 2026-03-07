import { getRoleLabel } from "@/lib/wow-data";
import { cn } from "@/lib/utils";
import { Shield, Heart, Sword, Crosshair } from "lucide-react";

const ROLE_CONFIG: Record<string, { icon: typeof Shield; color: string }> = {
  tank: { icon: Shield, color: "text-blue-400" },
  healer: { icon: Heart, color: "text-green-400" },
  melee_dps: { icon: Sword, color: "text-red-400" },
  ranged_dps: { icon: Crosshair, color: "text-orange-400" },
};

interface RoleBadgeProps {
  role: string | null;
  showLabel?: boolean;
  size?: "sm" | "md";
}

export function RoleBadge({ role, showLabel = true, size = "md" }: RoleBadgeProps) {
  if (!role) return <span className="text-muted-foreground text-xs">-</span>;

  const config = ROLE_CONFIG[role];
  if (!config) return <span className="text-muted-foreground text-xs">{role}</span>;

  const Icon = config.icon;
  const iconSize = size === "sm" ? "h-3 w-3" : "h-4 w-4";

  return (
    <span className={cn("inline-flex items-center gap-1", config.color)}>
      <Icon className={iconSize} />
      {showLabel && <span className={size === "sm" ? "text-xs" : "text-sm"}>{getRoleLabel(role)}</span>}
    </span>
  );
}
