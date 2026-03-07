import { getClassDistribution, getRoleDistribution, getSpecDistribution, getDashboardStats } from "@/lib/queries";
import { getAllCharacters } from "@/lib/queries";
import { ClassBadge } from "@/components/class-badge";
import { RoleBadge } from "@/components/role-badge";
import { CLASS_COLORS, CLASS_ARMOR, ROLE_LABELS } from "@/lib/wow-data";

export const dynamic = "force-dynamic";

export default function AnalyticsPage() {
  const classDistribution = getClassDistribution();
  const roleDistribution = getRoleDistribution();
  const specDistribution = getSpecDistribution();
  const stats = getDashboardStats();

  // Armor type distribution
  const allChars = getAllCharacters({ isActive: true });
  const armorDistribution: Record<string, number> = {};
  for (const char of allChars) {
    const armor = CLASS_ARMOR[char.className ?? ""] || "Unknown";
    armorDistribution[armor] = (armorDistribution[armor] || 0) + 1;
  }

  // Profession coverage
  // We'd need profile data for this — show placeholder for now
  const maxClassCount = Math.max(...classDistribution.map((c) => c.count), 1);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Guild Analytics</h1>
        <p className="text-muted-foreground">Composition and coverage analysis</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Class Breakdown */}
        <div className="bg-card border border-border rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-4">Class Breakdown</h2>
          {classDistribution.length === 0 ? (
            <p className="text-muted-foreground text-sm">No data available.</p>
          ) : (
            <div className="space-y-2">
              {classDistribution.map((item) => (
                <div key={item.className} className="flex items-center gap-3">
                  <div className="w-28 text-sm">
                    <ClassBadge className={item.className} showSpec={false} />
                  </div>
                  <div className="flex-1 h-6 bg-secondary rounded overflow-hidden">
                    <div
                      className="h-full rounded transition-all flex items-center justify-end pr-2"
                      style={{
                        width: `${(item.count / maxClassCount) * 100}%`,
                        backgroundColor: CLASS_COLORS[item.className ?? ""] || "#888",
                        opacity: 0.7,
                        minWidth: "2rem",
                      }}
                    >
                      <span className="text-xs font-bold text-black">{item.count}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Spec Breakdown */}
        <div className="bg-card border border-border rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-4">Spec Breakdown</h2>
          {specDistribution.length === 0 ? (
            <p className="text-muted-foreground text-sm">No data available.</p>
          ) : (
            <div className="space-y-1 max-h-96 overflow-y-auto">
              {specDistribution.map((item, i) => (
                <div key={i} className="flex items-center justify-between py-1 px-2 rounded hover:bg-secondary/50">
                  <ClassBadge className={item.className} spec={item.activeSpec} size="sm" />
                  <span className="text-sm font-mono">{item.count}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Role Distribution */}
        <div className="bg-card border border-border rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-4">Role Distribution (Mains)</h2>
          {roleDistribution.length === 0 ? (
            <p className="text-muted-foreground text-sm">No main characters designated.</p>
          ) : (
            <div className="space-y-4">
              {roleDistribution.map((item) => {
                const totalMains = roleDistribution.reduce((sum, r) => sum + r.count, 0);
                const pct = totalMains > 0 ? ((item.count / totalMains) * 100).toFixed(1) : "0";
                return (
                  <div key={item.role} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <RoleBadge role={item.role} />
                      <span className="text-sm text-muted-foreground">
                        {item.count} ({pct}%)
                      </span>
                    </div>
                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Armor Type Distribution */}
        <div className="bg-card border border-border rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-4">Armor Type Distribution</h2>
          {Object.keys(armorDistribution).length === 0 ? (
            <p className="text-muted-foreground text-sm">No data available.</p>
          ) : (
            <div className="space-y-3">
              {Object.entries(armorDistribution)
                .sort(([, a], [, b]) => b - a)
                .map(([armor, count]) => (
                  <div key={armor} className="flex items-center justify-between">
                    <span className="font-medium">{armor}</span>
                    <span className="text-lg font-semibold">{count}</span>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>

      {/* Composition Summary */}
      <div className="bg-card border border-border rounded-lg p-4">
        <h2 className="text-lg font-semibold mb-4">Composition Summary</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-3xl font-bold">{stats.activeCharacters}</div>
            <div className="text-sm text-muted-foreground">Active Characters</div>
          </div>
          <div>
            <div className="text-3xl font-bold">{stats.mains}</div>
            <div className="text-sm text-muted-foreground">Mains</div>
          </div>
          <div>
            <div className="text-3xl font-bold">{stats.activeCharacters - stats.mains}</div>
            <div className="text-sm text-muted-foreground">Alts</div>
          </div>
          <div>
            <div className="text-3xl font-bold">{classDistribution.length}</div>
            <div className="text-sm text-muted-foreground">Classes Represented</div>
          </div>
        </div>
      </div>
    </div>
  );
}
