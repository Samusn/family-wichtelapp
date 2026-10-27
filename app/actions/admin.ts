"use server";

import { cookies, headers } from "next/headers";
import { randomBytes } from "crypto";
import { isIPv6 } from "net";
import { db } from "@db/index";
import { adminSessions, loginAttempts } from "@db/schema";
import { eq, sql } from "drizzle-orm";
import { isAdmin } from "@/lib/adminAuth";

const MAX_ATTEMPTS = 5;
const LOCKOUT_MINUTES = 15;
const ATTEMPT_WINDOW_MINUTES = 15;
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24;

// IPv4 clients share their router's public address, but with IPv6 every
// device has its own (and can rotate it), so group those by /64 network.
function normalizeIp(ip: string) {
  const address = ip.split("%")[0];
  if (!isIPv6(address)) return address;

  const mapped = address.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/i);
  if (mapped) return mapped[1];

  const [head, tail = ""] = address.split("::");
  const headGroups = head ? head.split(":") : [];
  const tailGroups = tail ? tail.split(":") : [];
  const groups = address.includes("::")
    ? [
        ...headGroups,
        ...Array(8 - headGroups.length - tailGroups.length).fill("0"),
        ...tailGroups,
      ]
    : headGroups;

  const network = groups
    .slice(0, 4)
    .map((group) => parseInt(group, 16).toString(16))
    .join(":");
  return `${network}::/64`;
}

async function getClientIdentifier() {
  const headerStore = await headers();
  const forwardedFor = headerStore.get("x-forwarded-for");
  const ip =
    forwardedFor?.split(",")[0]?.trim() || headerStore.get("x-real-ip");
  return ip ? normalizeIp(ip).slice(0, 64) : "unknown";
}

// Counts the attempt in a single statement, so parallel requests cannot all
// read the same count. The password may only be checked if the returned count
// is within MAX_ATTEMPTS.
async function registerAttempt(identifier: string) {
  const lockActive = sql`${loginAttempts.lockedUntil} > now()`;
  const startsOver = sql`(${loginAttempts.lockedUntil} <= now() or (${loginAttempts.lockedUntil} is null and ${loginAttempts.updatedAt} < now() - ${ATTEMPT_WINDOW_MINUTES} * interval '1 minute'))`;

  const [record] = await db
    .insert(loginAttempts)
    .values({ identifier, attemptCount: 1 })
    .onConflictDoUpdate({
      target: loginAttempts.identifier,
      set: {
        attemptCount: sql`case when ${startsOver} then 1 else ${loginAttempts.attemptCount} + 1 end`,
        lockedUntil: sql`case
          when ${lockActive} then ${loginAttempts.lockedUntil}
          when ${startsOver} then null
          when ${loginAttempts.attemptCount} + 1 >= ${MAX_ATTEMPTS} then now() + ${LOCKOUT_MINUTES} * interval '1 minute'
          else null
        end`,
        updatedAt: sql`now()`,
      },
    })
    .returning();
  return record;
}

export async function verifyAdminPassword(password: string) {
  if (!process.env.ADMIN_PASSWORD) {
    return { success: false, error: "Admin-Zugang nicht konfiguriert." };
  }

  const identifier = await getClientIdentifier();
  const record = await registerAttempt(identifier);

  if (record.attemptCount > MAX_ATTEMPTS) {
    const minutesLeft = record.lockedUntil
      ? Math.max(
          1,
          Math.ceil((record.lockedUntil.getTime() - Date.now()) / 60000),
        )
      : LOCKOUT_MINUTES;
    return {
      success: false,
      error: `Zu viele Versuche. Gesperrt für ${minutesLeft} Minuten.`,
    };
  }

  const valid = password === process.env.ADMIN_PASSWORD;

  if (!valid) {
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
