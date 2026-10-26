"use server";

import { db } from "@db/index";
import { participants } from "@db/schema";
import { eq } from "drizzle-orm";
import { generateUrlToken } from "@/lib/tokens";
import { requireAdmin } from "@/lib/adminAuth";

export async function addParticipant(sessionId: string, name: string) {
  await requireAdmin();

  const urlToken = generateUrlToken();

  const [participant] = await db
    .insert(participants)
    .values({ sessionId, name, urlToken })
    .returning();

  return participant;
}

export async function getParticipantByToken(token: string) {
  return db.query.participants.findFirst({
    where: eq(participants.urlToken, token),
    with: { session: true },
  });
}

export async function removeParticipant(participantId: string) {
  await requireAdmin();

  await db.delete(participants).where(eq(participants.id, participantId));
}
