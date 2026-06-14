import { drizzle } from "drizzle-orm/d1";
import { getDB } from "./cloudflare";
import { activityLogs } from "../db/schema";

/**
 * Mencatat log aktivitas ke database D1.
 * @param type Jenis aktivitas ('admin_create_album', 'user_login', etc.)
 * @param description Deskripsi detail tentang aktivitas tersebut
 */
export async function logActivity(type: string, description: string) {
  try {
    const rawDb = getDB();
    const db = drizzle(rawDb);
    await db.insert(activityLogs).values({
      type,
      description,
    });
  } catch (error) {
    console.error("Gagal menyimpan log aktivitas:", error);
  }
}
