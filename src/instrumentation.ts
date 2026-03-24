export async function register() {
  // Only run on the server, not in edge runtime or client
  if (process.env.NEXT_RUNTIME === "nodejs") {
    // Initialize database tables on startup
    const { initializeDatabase } = await import("@/db/init");
    initializeDatabase();

    // Start cron scheduler
    const { startCronJobs } = await import("@/lib/cron");
    startCronJobs();
  }
}
