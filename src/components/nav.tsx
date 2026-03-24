"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Shield, Users, Calendar, BookOpen, Settings, Lock, ChevronDown, Map, ClipboardCheck, Wrench, Swords, KeyRound } from "lucide-react";
import { useAdmin } from "@/components/admin-provider";

interface NavLink {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  children?: { href: string; label: string; icon: React.ComponentType<{ className?: string }> }[];
}

const links: NavLink[] = [
  { href: "/", label: "Dashboard", icon: Shield },
  { href: "/strategies", label: "Raids", icon: BookOpen },
  { href: "/mythic-plus", label: "M+", icon: KeyRound },
  {
    href: "/roster",
    label: "Guild",
    icon: Users,
    children: [
      { href: "/neighborhood", label: "Neighborhood", icon: Map },
      { href: "/professions", label: "Professions", icon: Wrench },
    ],
  },
  {
    href: "/audit",
    label: "Raiders",
    icon: ClipboardCheck,
    children: [
      { href: "/raids", label: "Attendance", icon: Calendar },
      { href: "/loot", label: "Loot", icon: Swords },
    ],
  },
  { href: "/admin", label: "Admin", icon: Settings },
];

function NavDropdown({ link, isActive, pathname }: { link: NavLink; isActive: boolean; pathname: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const Icon = link.icon;
  const childActive = link.children?.some((c) => pathname.startsWith(c.href)) ?? false;

  return (
    <div ref={ref} className="relative">
      <div className="flex items-center">
        <Link
          href={link.href}
          className={cn(
            "flex items-center gap-2 px-3 py-2 rounded-l-md text-sm font-medium transition-colors",
            isActive || childActive
              ? "bg-primary/10 text-primary"
              : "text-muted-foreground hover:text-foreground hover:bg-accent"
          )}
        >
          <Icon className="h-4 w-4" />
          <span className="hidden sm:inline">{link.label}</span>
        </Link>
        <button
          onClick={() => setOpen(!open)}
          className={cn(
            "flex items-center px-1 py-2 rounded-r-md text-sm transition-colors",
            isActive || childActive
              ? "bg-primary/10 text-primary"
              : "text-muted-foreground hover:text-foreground hover:bg-accent"
          )}
        >
          <ChevronDown className={cn("h-3 w-3 transition-transform", open && "rotate-180")} />
        </button>
      </div>
      {open && (
        <div className="absolute top-full left-0 mt-1 bg-card border border-border rounded-md shadow-lg z-50 min-w-[160px]">
          {link.children!.map((child) => {
            const ChildIcon = child.icon;
            const childIsActive = pathname.startsWith(child.href);
            return (
              <Link
                key={child.href}
                href={child.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 text-sm font-medium transition-colors first:rounded-t-md last:rounded-b-md",
                  childIsActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent"
                )}
              >
                <ChildIcon className="h-4 w-4" />
                {child.label}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

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
                link.href === "/" ? pathname === "/" : pathname === link.href;

              if (link.children) {
                return <NavDropdown key={link.href} link={link} isActive={isActive} pathname={pathname} />;
              }

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
