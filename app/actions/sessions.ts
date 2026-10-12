"use server";

import { db } from "@db/index";
import { sessions } from "@db/schema";
import { eq, desc, and } from "drizzle-orm";

export async function createSession(name: string, year: number) {
  const [session] = await db
    .insert(sessions)
    .values({ name, year, isActive: true, isArchived: false })
    .returning();

  return session;
}

export async function getSession(sessionId: string) {
  return db.query.sessions.findFirst({
    where: eq(sessions.id, sessionId),
    with: { participants: true, draws: { with: { giver: true, receiver: true } } },
  });
}

export async function getAllSessions() {
  return db.query.sessions.findMany({
    orderBy: [desc(sessions.year)],
    with: { participants: true },
  });
}

export async function archiveSession(sessionId: string) {
  await db
    .update(sessions)
    .set({ isArchived: true, isActive: false })
    .where(eq(sessions.id, sessionId));
}
