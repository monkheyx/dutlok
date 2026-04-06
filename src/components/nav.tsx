"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Shield, Users, Calendar, BookOpen, Settings, Lock, ChevronDown, Map, ClipboardCheck, Wrench, Swords, KeyRound, Menu, X, FileText } from "lucide-react";
import { useAdmin } from "@/components/admin-provider";

interface NavLink {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  children?: { href: string; label: string; icon: React.ComponentType<{ className?: string }> }[];
}

const links: NavLink[] = [
  { href: "/", label: "Dashboard", icon: Shield },
  { href: "/strategies", label: "Strategies", icon: BookOpen },
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

function NavDropdown({ link, isActive, pathname, onNavigate }: { link: NavLink; isActive: boolean; pathname: string; onNavigate?: () => void }) {
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
          onClick={() => { setOpen(false); onNavigate?.(); }}
          className={cn(
            "flex items-center gap-2 px-3 py-2 rounded-l-md text-sm font-medium transition-colors",
            isActive || childActive
              ? "bg-primary/10 text-primary"
              : "text-muted-foreground hover:text-foreground hover:bg-accent"
          )}
        >
          <Icon className="h-4 w-4" />
          {link.label}
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
                onClick={() => { setOpen(false); onNavigate?.(); }}
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

// Mobile nav — full list with children inline
function MobileNavLink({ link, pathname, onNavigate }: { link: NavLink; pathname: string; onNavigate: () => void }) {
  const Icon = link.icon;
  const isActive = link.href === "/" ? pathname === "/" : pathname === link.href;
  const childActive = link.children?.some((c) => pathname.startsWith(c.href)) ?? false;

  return (
    <div>
      <Link
        href={link.href}
        onClick={onNavigate}
        className={cn(
          "flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors",
          isActive || childActive ? "text-primary bg-primary/5" : "text-foreground hover:bg-accent"
        )}
      >
        <Icon className="h-5 w-5" />
        {link.label}
      </Link>
      {link.children && (
        <div className="pl-8 border-l-2 border-border ml-6">
          {link.children.map((child) => {
            const ChildIcon = child.icon;
            const childIsActive = pathname.startsWith(child.href);
            return (
              <Link
                key={child.href}
                href={child.href}
                onClick={onNavigate}
                className={cn(
                  "flex items-center gap-3 px-4 py-2.5 text-sm transition-colors",
                  childIsActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
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
  const [mobileOpen, setMobileOpen] = useState(false);
  const [customPages, setCustomPages] = useState<NavLink[]>([]);

  // Fetch custom CMS pages that should appear in nav
  useEffect(() => {
    fetch("/api/pages?nav=true")
      .then((r) => r.json())
      .then((pages: any[]) => {
        setCustomPages(
          pages
            .sort((a: any, b: any) => (a.navOrder ?? 100) - (b.navOrder ?? 100))
            .map((p) => ({
              href: `/p/${p.slug}`,
              label: p.navLabel || p.title,
              icon: FileText,
            }))
        );
      })
      .catch(() => {});
  }, []);

  // Merge hardcoded links + custom pages (insert before Admin)
  const allLinks = [...links.slice(0, -1), ...customPages, links[links.length - 1]];

  // Close mobile nav on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <header className="border-b border-border bg-card sticky top-0 z-50">
      <div className="container mx-auto max-w-7xl px-4">
        <div className="flex items-center justify-between h-14">
          <Link href="/" className="flex items-center gap-2 font-bold text-lg text-primary">
            <Shield className="h-5 w-5" />
            DUTLOK
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {allLinks.map((link) => {
              const Icon = link.icon;
              const isActive = link.href === "/" ? pathname === "/" : pathname === link.href;

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
                  {link.label}
                </Link>
              );
            })}
            {isAuthenticated && (
              <span className="ml-2 flex items-center gap-1 text-xs text-green-400">
                <Lock className="h-3 w-3" />
                Admin
              </span>
            )}
          </nav>

          {/* Mobile hamburger */}
          <div className="flex items-center gap-2 md:hidden">
            {isAuthenticated && (
              <span className="flex items-center gap-1 text-xs text-green-400">
                <Lock className="h-3 w-3" />
              </span>
            )}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-card">
          <nav className="py-2">
            {allLinks.map((link) => (
              <MobileNavLink
                key={link.href}
                link={link}
                pathname={pathname}
                onNavigate={() => setMobileOpen(false)}
              />
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
