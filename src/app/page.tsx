import { getDashboardStats, getClassDistribution, getRoleDistribution, getRecentSyncJobs } from "@/lib/queries";
import { StatCard } from "@/components/stat-card";
import { ClassBadge } from "@/components/class-badge";
import { RoleBadge } from "@/components/role-badge";
import { Users, UserCheck, Star, Clock } from "lucide-react";
import { timeAgo } from "@/lib/utils";
import { CLASS_COLORS } from "@/lib/wow-data";

export const dynamic = "force-dynamic";

export default function DashboardPage() {
  const stats = getDashboardStats();
  const classDistribution = getClassDistribution();
  const roleDistribution = getRoleDistribution();
  const recentJobs = getRecentSyncJobs(5);

  const maxClassCount = Math.max(...classDistribution.map((c) => c.count), 1);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Guild overview and recent activity</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total Characters" value={stats.totalCharacters} icon={Users} />
        <StatCard label="Active Characters" value={stats.activeCharacters} icon={UserCheck} />
        <StatCard label="Mains" value={stats.mains} icon={Star} />
        <StatCard label="Guild Members" value={stats.totalMembers} icon={Users} />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Class Distribution */}
        <div className="bg-card border border-border rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-4">Class Distribution</h2>
          {classDistribution.length === 0 ? (
            <p className="text-muted-foreground text-sm">No character data yet. Import your guild roster from the Admin page.</p>
          ) : (
            <div className="space-y-2">
              {classDistribution.map((item) => (
                <div key={item.className} className="flex items-center gap-3">
                  <div className="w-28 text-sm">
                    <ClassBadge className={item.className} showSpec={false} />
                  </div>
                  <div className="flex-1 h-5 bg-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${(item.count / maxClassCount) * 100}%`,
                        backgroundColor: CLASS_COLORS[item.className ?? ""] || "#888",
                        opacity: 0.7,
                      }}
                    />
                  </div>
                  <span className="text-sm text-muted-foreground w-8 text-right">{item.count}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Role Distribution (Mains) */}
        <div className="bg-card border border-border rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-4">Role Distribution (Mains)</h2>
          {roleDistribution.length === 0 ? (
            <p className="text-muted-foreground text-sm">No main characters designated yet.</p>
          ) : (
            <div className="space-y-3">
              {roleDistribution.map((item) => (
                <div key={item.role} className="flex items-center justify-between">
                  <RoleBadge role={item.role} />
                  <span className="text-lg font-semibold">{item.count}</span>
                </div>
              ))}
            </div>
          )}

          {/* Recent Sync Jobs */}
          <div className="mt-6 pt-4 border-t border-border">
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Recent Syncs
            </h3>
            {recentJobs.length === 0 ? (
              <p className="text-muted-foreground text-sm">No sync jobs yet.</p>
            ) : (
              <div className="space-y-2">
                {recentJobs.map((job) => (
                  <div key={job.id} className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{job.jobType.replace("_", " ")}</span>
                    <div className="flex items-center gap-2">
                      <span
                        className={
                          job.status === "completed"
                            ? "text-green-400"
                            : job.status === "failed"
                            ? "text-red-400"
                            : job.status === "running"
                            ? "text-yellow-400"
                            : "text-muted-foreground"
                        }
                      >
                        {job.status}
                      </span>
                      <span className="text-muted-foreground">{timeAgo(job.createdAt)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
