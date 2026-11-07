import { cookies } from "next/headers";
import { eq } from "drizzle-orm";
import { db } from "@db/index";
import { adminSessions } from "@db/schema";

export async function isAdmin() {
  const cookieStore = await cookies();
  const cookie = cookieStore.get("admin_session");
  if (!cookie?.value) return false;

  const session = await db.query.adminSessions.findFirst({
    where: eq(adminSessions.token, cookie.value),
  });

  if (!session || session.expiresAt < new Date()) {
    if (session) {
      await db.delete(adminSessions).where(eq(adminSessions.id, session.id));
    }
    cookieStore.delete("admin_session");
    return false;
  }

  return true;
}

export async function requireAdmin() {
  if (!(await isAdmin())) {
    throw new Error("Nicht autorisiert.");
  }
}
