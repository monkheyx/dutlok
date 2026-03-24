import cron from "node-cron";

const SYNC_SECRET = process.env.SYNC_SECRET || "dutlok-auto-sync";
const BASE_URL = process.env.NEXTAUTH_URL || "http://localhost:3000";

let scheduled = false;

/**
 * Start the cron scheduler for automatic character syncs.
 * Runs every hour at minute 0. Safe to call multiple times — only schedules once.
 */
export function startCronJobs() {
  if (scheduled) return;
  scheduled = true;

  // Sync all characters every hour
  cron.schedule("0 * * * *", async () => {
    console.log("[Cron] Triggering hourly character sync...");
    try {
      const res = await fetch(`${BASE_URL}/api/sync/auto`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${SYNC_SECRET}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        console.log("[Cron] Sync complete:", data);
      } else {
        console.error("[Cron] Sync failed with status:", res.status);
      }
    } catch (err) {
      console.error("[Cron] Sync request failed:", err);
    }
  });

  console.log("[Cron] Hourly character sync scheduled (every hour at :00)");
}
