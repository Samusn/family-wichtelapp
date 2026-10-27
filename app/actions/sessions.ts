"use server";

import { db } from "@db/index";
import { sessions } from "@db/schema";
import { eq, desc, and } from "drizzle-orm";
import { requireAdmin } from "@/lib/adminAuth";

function parseDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export async function createSession(
  name: string,
  celebrationAt: string,
): Promise<{ error: string | null }> {
  await requireAdmin();

  const date = parseDate(celebrationAt);
  if (!date) {
    return { error: "Bitte Datum und Uhrzeit der Feier angeben." };
  }

  await db.insert(sessions).values({
    name,
    year: date.getFullYear(),
    celebrationAt: date,
    isActive: true,
    isArchived: false,
  });

  return { error: null };
}

export async function getSession(sessionId: string) {
  await requireAdmin();

  return db.query.sessions.findFirst({
    where: eq(sessions.id, sessionId),
    with: { participants: true },
  });
}

export async function getAllSessions() {
  await requireAdmin();

  return db.query.sessions.findMany({
    orderBy: [desc(sessions.year)],
    with: { participants: true },
  });
}

export async function updateCelebration(
  sessionId: string,
  celebrationAt: string,
): Promise<{ error: string | null }> {
  await requireAdmin();

  const date = parseDate(celebrationAt);
  if (!date) {
    return { error: "Bitte Datum und Uhrzeit der Feier angeben." };
  }

  await db
    .update(sessions)
    .set({ celebrationAt: date, year: date.getFullYear() })
    .where(eq(sessions.id, sessionId));

  return { error: null };
}

export async function archiveSession(sessionId: string) {
  await requireAdmin();

  await db
    .update(sessions)
    .set({ isArchived: true, isActive: false })
    .where(eq(sessions.id, sessionId));
}
