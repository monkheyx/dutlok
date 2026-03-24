import { getDashboardStats, getClassDistribution, getRoleDistribution, getRecentSyncJobs } from "@/lib/queries";
import { ClassBadge } from "@/components/class-badge";
import { RoleBadge } from "@/components/role-badge";
import { NewsWidget } from "@/components/news-widget";
import { Users, UserCheck, Star, Clock, BookOpen, Calendar, Swords, Shield, ChevronRight } from "lucide-react";
import { timeAgo } from "@/lib/utils";
import { CLASS_COLORS } from "@/lib/wow-data";
import { getCurrentTiers } from "@/data/strategies";
import Link from "next/link";
import { BluePostsFeed } from "@/components/blue-posts-feed";

export const dynamic = "force-dynamic";

export default function DashboardPage() {
  const stats = getDashboardStats();
  const classDistribution = getClassDistribution();
  const roleDistribution = getRoleDistribution();
  const recentJobs = getRecentSyncJobs(3);
  const currentTiers = getCurrentTiers();

  const maxClassCount = Math.max(...classDistribution.map((c) => c.count), 1);

  // Combine all current tier bosses for the raid progress widget
  const totalBosses = currentTiers.reduce((sum, t) => sum + t.bosses.length, 0);

  return (
    <div className="space-y-6">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            DUTLOK Dashboard
          </h1>
          <p className="text-sm text-muted-foreground">Midnight Season 1</p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/strategies"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-secondary border border-border rounded-md text-muted-foreground hover:text-foreground transition-colors"
          >
            <BookOpen className="h-3.5 w-3.5" />
            Strategies
          </Link>
          <Link
            href="/raids"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-secondary border border-border rounded-md text-muted-foreground hover:text-foreground transition-colors"
          >
            <Calendar className="h-3.5 w-3.5" />
            Raids
          </Link>
        </div>
      </div>

      {/* Stats row — compact */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <MiniStat label="Active Roster" value={stats.activeCharacters} icon={Users} />
        <MiniStat label="Raiders" value={stats.mains} icon={Star} />
        <MiniStat label="Guild Members" value={stats.totalMembers} icon={UserCheck} />
        <MiniStat label="Boss Guides" value={totalBosses} icon={Swords} />
      </div>

      {/* Main 2-column layout */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left column — 2/3 width */}
        <div className="lg:col-span-2 space-y-6">
          {/* Guild News */}
          <NewsWidget />

          {/* WoW Blue Posts / Community News */}
          <BluePostsFeed />
        </div>

        {/* Right sidebar — 1/3 width */}
        <div className="space-y-4">
          {/* Current Raid Tiers */}
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold uppercase tracking-[0.12em] text-primary flex items-center gap-2">
                <Swords className="h-4 w-4" />
                Current Raids
              </h2>
              <Link href="/strategies" className="text-xs text-muted-foreground hover:text-primary transition-colors">
                View all →
              </Link>
            </div>
            <div className="space-y-3">
              {currentTiers.map((tier) => (
                <div key={tier.slug} className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-foreground">{tier.name}</span>
                    <span className="text-[10px] text-muted-foreground">{tier.bosses.length} bosses</span>
                  </div>
                  <div className="space-y-0.5">
                    {tier.bosses.map((boss) => (
                      <Link
                        key={boss.slug}
                        href={`/strategies/${boss.slug}`}
                        className="flex items-center gap-2 px-2 py-1 rounded text-xs hover:bg-accent transition-colors group"
                      >
                        <span className="w-4 h-4 rounded bg-primary/15 text-primary text-[10px] font-bold flex items-center justify-center flex-shrink-0">
                          {boss.bossNumber}
                        </span>
                        <span className="text-muted-foreground group-hover:text-foreground transition-colors truncate flex-1">
                          {boss.name}
                        </span>
                        <ChevronRight className="h-3 w-3 text-muted-foreground/30 group-hover:text-primary transition-colors" />
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Class Distribution — compact */}
          <div className="bg-card border border-border rounded-lg p-4">
            <h2 className="text-sm font-bold uppercase tracking-[0.12em] text-primary mb-3">
              Class Breakdown
            </h2>
            {classDistribution.length === 0 ? (
              <p className="text-muted-foreground text-xs">No character data yet.</p>
            ) : (
              <div className="space-y-1.5">
                {classDistribution.map((item) => (
                  <div key={item.className} className="flex items-center gap-2">
                    <div className="w-20 text-xs truncate">
                      <ClassBadge className={item.className} showSpec={false} />
                    </div>
                    <div className="flex-1 h-3 bg-secondary rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${(item.count / maxClassCount) * 100}%`,
                          backgroundColor: CLASS_COLORS[item.className ?? ""] || "#888",
                          opacity: 0.7,
                        }}
                      />
                    </div>
                    <span className="text-[10px] text-muted-foreground w-5 text-right font-mono">{item.count}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Role Distribution */}
          <div className="bg-card border border-border rounded-lg p-4">
            <h2 className="text-sm font-bold uppercase tracking-[0.12em] text-primary mb-3">
              Role Balance
            </h2>
            {roleDistribution.length === 0 ? (
              <p className="text-muted-foreground text-xs">No mains designated yet.</p>
            ) : (
              <div className="space-y-2">
                {roleDistribution.map((item) => (
                  <div key={item.role} className="flex items-center justify-between">
                    <RoleBadge role={item.role} />
                    <span className="text-sm font-bold">{item.count}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Links */}
          <div className="bg-card border border-border rounded-lg p-4">
            <h2 className="text-sm font-bold uppercase tracking-[0.12em] text-primary mb-3">
              Quick Links
            </h2>
            <div className="space-y-1">
              <QuickLink href="/raids" label="Raid Attendance" />
              <QuickLink href="/loot" label="Loot Tracker" />
              <QuickLink href="/audit" label="Character Audit" />
              <QuickLink href="/professions" label="Profession Search" />
              <QuickLink href="/roster" label="Full Roster" />
            </div>
          </div>

          {/* Recent Syncs */}
          {recentJobs.length > 0 && (
            <div className="bg-card border border-border rounded-lg p-4">
              <h2 className="text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground flex items-center gap-1.5 mb-2">
                <Clock className="h-3 w-3" />
                Recent Syncs
              </h2>
              <div className="space-y-1.5">
                {recentJobs.map((job) => (
                  <div key={job.id} className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">{job.jobType.replace("_", " ")}</span>
                    <div className="flex items-center gap-1.5">
                      <span className={
                        job.status === "completed" ? "text-green-400" :
                        job.status === "failed" ? "text-red-400" :
                        job.status === "running" ? "text-yellow-400" :
                        "text-muted-foreground"
                      }>
                        {job.status}
                      </span>
                      <span className="text-muted-foreground/60">{timeAgo(job.createdAt)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function MiniStat({ label, value, icon: Icon }: { label: string; value: number | string; icon: React.ComponentType<{ className?: string }> }) {
  return (
    <div className="bg-card border border-border rounded-lg px-4 py-3">
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">{label}</span>
        <Icon className="h-3.5 w-3.5 text-muted-foreground/50" />
      </div>
      <div className="text-xl font-bold mt-0.5">{value}</div>
    </div>
  );
}

function QuickLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="flex items-center justify-between px-2 py-1.5 rounded text-xs text-muted-foreground hover:text-foreground hover:bg-accent transition-colors group"
    >
      <span>{label}</span>
      <ChevronRight className="h-3 w-3 text-muted-foreground/30 group-hover:text-primary transition-colors" />
    </Link>
  );
}
