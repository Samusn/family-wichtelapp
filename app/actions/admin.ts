"use server";

import { cookies, headers } from "next/headers";
import { randomBytes } from "crypto";
import { db } from "@db/index";
import { adminSessions, loginAttempts } from "@db/schema";
import { eq } from "drizzle-orm";

const MAX_ATTEMPTS = 5;
const LOCKOUT_MINUTES = 15;
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24;

async function getClientIdentifier() {
  const headerStore = await headers();
  const forwardedFor = headerStore.get("x-forwarded-for");
  return (
    forwardedFor?.split(",")[0]?.trim() ||
    headerStore.get("x-real-ip") ||
    "unknown"
  );
}

async function getOrCreateAttemptRecord(identifier: string) {
  const existing = await db.query.loginAttempts.findFirst({
    where: eq(loginAttempts.identifier, identifier),
  });
  if (existing) return existing;

  const [record] = await db
    .insert(loginAttempts)
    .values({ identifier, attemptCount: 0 })
    .onConflictDoUpdate({
      target: loginAttempts.identifier,
      set: { updatedAt: new Date() },
    })
    .returning();
  return record;
}

export async function verifyAdminPassword(password: string) {
  if (!process.env.ADMIN_PASSWORD) {
    return { success: false, error: "Admin-Zugang nicht konfiguriert." };
  }

  const identifier = await getClientIdentifier();
  const record = await getOrCreateAttemptRecord(identifier);

  if (record.lockedUntil && record.lockedUntil > new Date()) {
    const minutesLeft = Math.ceil(
      (record.lockedUntil.getTime() - Date.now()) / 60000,
    );
    return {
      success: false,
      error: `Zu viele Versuche. Gesperrt für ${minutesLeft} Minuten.`,
    };
  }

  const valid = password === process.env.ADMIN_PASSWORD;

  if (!valid) {
    const newCount = record.attemptCount + 1;
    const locked =
      newCount >= MAX_ATTEMPTS
        ? new Date(Date.now() + LOCKOUT_MINUTES * 60 * 1000)
        : null;

    await db
      .update(loginAttempts)
      .set({
        attemptCount: locked ? 0 : newCount,
        lockedUntil: locked,
        updatedAt: new Date(),
      })
      .where(eq(loginAttempts.id, record.id));

    return { success: false, error: "Falsches Passwort." };
  }

  await db
    .update(loginAttempts)
    .set({ attemptCount: 0, lockedUntil: null, updatedAt: new Date() })
    .where(eq(loginAttempts.id, record.id));

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
  const cookieStore = await cookies();
  const cookie = cookieStore.get("admin_session");
  if (!cookie?.value) return false;

  const session = await db.query.adminSessions.findFirst({
    where: eq(adminSessions.token, cookie.value),
  });

  if (!session || session.expiresAt < new Date()) {
    if (session) {
      await db
        .delete(adminSessions)
        .where(eq(adminSessions.id, session.id));
    }
    cookieStore.delete("admin_session");
    return false;
  }

  return true;
}

export async function logoutAdmin() {
  const cookieStore = await cookies();
  const cookie = cookieStore.get("admin_session");

  if (cookie?.value) {
    await db
      .delete(adminSessions)
      .where(eq(adminSessions.token, cookie.value));
  }

  cookieStore.delete("admin_session");
}
