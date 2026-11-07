"use server";

import { cookies } from "next/headers";
import { randomBytes } from "crypto";
import { db } from "@db/index";
import { adminSessions } from "@db/schema";
import { eq } from "drizzle-orm";
import { isAdmin } from "@/lib/adminAuth";

const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24;

export async function verifyAdminPassword(password: string) {
  if (!process.env.ADMIN_PASSWORD) {
    return { success: false, error: "Admin-Zugang nicht konfiguriert." };
  }

  const valid = password === process.env.ADMIN_PASSWORD;

  if (!valid) {
    return { success: false, error: "Falsches Passwort." };
  }

  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_MAX_AGE_SECONDS * 1000);

  await db.insert(adminSessions).values({ token, expiresAt });

  const cookieStore = await cookies();
  cookieStore.set("admin_session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_MAX_AGE_SECONDS,
    path: "/admin",
  });

  return { success: true, error: null };
}

export async function checkAdminSession() {
  return isAdmin();
}

export async function logoutAdmin() {
  const cookieStore = await cookies();
  const cookie = cookieStore.get("admin_session");

  if (cookie?.value) {
    await db.delete(adminSessions).where(eq(adminSessions.token, cookie.value));
  }

  cookieStore.delete("admin_session");
}
