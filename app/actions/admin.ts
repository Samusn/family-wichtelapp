"use server";

import { cookies } from "next/headers";
import { randomBytes } from "crypto";

const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000;
const SESSION_MAX_AGE = 60 * 60 * 24;

const loginAttempts = new Map<string, { count: number; lockedUntil: number }>();

function getClientKey() {
  return "global";
}

export async function verifyAdminPassword(password: string) {
  const key = getClientKey();
  const attempt = loginAttempts.get(key);

  if (attempt && attempt.lockedUntil > Date.now()) {
    const minutesLeft = Math.ceil(
      (attempt.lockedUntil - Date.now()) / 60000,
    );
    return { success: false, error: `Zu viele Versuche. Gesperrt für ${minutesLeft} Minuten.` };
  }

  const valid = password === process.env.ADMIN_PASSWORD;

  if (!valid) {
    const current = loginAttempts.get(key) || { count: 0, lockedUntil: 0 };
    current.count++;
    if (current.count >= MAX_ATTEMPTS) {
      current.lockedUntil = Date.now() + LOCKOUT_DURATION;
      current.count = 0;
    }
    loginAttempts.set(key, current);
    return { success: false, error: "Falsches Passwort." };
  }

  loginAttempts.delete(key);

  const token = randomBytes(32).toString("hex");
  const cookieStore = await cookies();
  cookieStore.set("admin_session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_MAX_AGE,
    path: "/admin",
  });

  return { success: true, error: null };
}

export async function checkAdminSession() {
  const cookieStore = await cookies();
  const session = cookieStore.get("admin_session");
  return !!session?.value;
}

export async function logoutAdmin() {
  const cookieStore = await cookies();
  cookieStore.delete("admin_session");
}
