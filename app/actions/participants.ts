"use server";

import { db } from "@db/index";
import { participants } from "@db/schema";
import { eq } from "drizzle-orm";
import { generateUrlToken } from "@/lib/tokens";

export async function addParticipant(sessionId: string, name: string) {
  const urlToken = generateUrlToken();

  const [participant] = await db
    .insert(participants)
    .values({ sessionId, name, urlToken })
    .returning();

  return participant;
}

export async function getParticipantsBySession(sessionId: string) {
  return db.query.participants.findMany({
    where: eq(participants.sessionId, sessionId),
  });
}

export async function getParticipantByToken(token: string) {
  return db.query.participants.findFirst({
    where: eq(participants.urlToken, token),
    with: { session: true },
  });
}

export async function removeParticipant(participantId: string) {
  await db.delete(participants).where(eq(participants.id, participantId));
}
