import { db, schema } from "@/db";
import { eq } from "drizzle-orm";

/**
 * Check admin password. Checks the database first (if a password
 * has been set via the UI), then falls back to the ADMIN_PASSWORD env var.
 */
export function checkAdminPassword(password: string): boolean {
  if (!password) return false;

  // Check DB-stored password first
  const dbPassword = db
    .select()
    .from(schema.settings)
    .where(eq(schema.settings.key, "admin_password"))
    .get();

  if (dbPassword) {
    return password === dbPassword.value;
  }

  // Fall back to env var
  const envPassword = process.env.ADMIN_PASSWORD;
  if (!envPassword) return false;
  return password === envPassword;
}

/**
 * Update the admin password. Stores it in the database so it
 * persists without needing to modify .env or restart the server.
 */
export function setAdminPassword(newPassword: string): void {
  const existing = db
    .select()
    .from(schema.settings)
    .where(eq(schema.settings.key, "admin_password"))
    .get();

  if (existing) {
    db.update(schema.settings)
      .set({ value: newPassword, updatedAt: new Date().toISOString() })
      .where(eq(schema.settings.key, "admin_password"))
      .run();
  } else {
    db.insert(schema.settings)
      .values({ key: "admin_password", value: newPassword })
      .run();
  }
}
