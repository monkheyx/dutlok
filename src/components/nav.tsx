"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Shield, Users, BarChart3, Swords, Settings, Lock, ClipboardCheck, Wrench, UserPlus } from "lucide-react";
import { useAdmin } from "@/components/admin-provider";

const links = [
  { href: "/", label: "Dashboard", icon: Shield },
  { href: "/roster", label: "Roster", icon: Users },
  { href: "/loot", label: "Loot", icon: Swords },
  { href: "/professions", label: "Professions", icon: Wrench },
  { href: "/audit", label: "Audit", icon: ClipboardCheck },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/join", label: "Join", icon: UserPlus },
  { href: "/admin", label: "Admin", icon: Settings },
];

export function Nav() {
  const pathname = usePathname();
  const { isAuthenticated } = useAdmin();

  return (
    <header className="border-b border-border bg-card">
      <div className="container mx-auto max-w-7xl px-4">
        <div className="flex items-center justify-between h-14">
          <Link href="/" className="flex items-center gap-2 font-bold text-lg text-primary">
            <Shield className="h-5 w-5" />
            DUTLOK
          </Link>
          <nav className="flex items-center gap-1">
            {links.map((link) => {
              const Icon = link.icon;
              const isActive =
                link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{link.label}</span>
                </Link>
              );
            })}
            {isAuthenticated && (
              <span className="ml-2 flex items-center gap-1 text-xs text-green-400">
                <Lock className="h-3 w-3" />
                <span className="hidden sm:inline">Admin</span>
              </span>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
