"use server";

import { db } from "@db/index";
import { draws, participants } from "@db/schema";
import { eq } from "drizzle-orm";
import { generateUrlToken } from "@/lib/tokens";
import { requireAdmin } from "@/lib/adminAuth";

const LOCKED_ERROR =
  "Nach der Ziehung können keine Teilnehmer mehr geändert werden.";

async function hasDraws(sessionId: string) {
  const draw = await db.query.draws.findFirst({
    where: eq(draws.sessionId, sessionId),
    columns: { id: true },
  });
  return draw !== undefined;
}

export async function addParticipant(
  sessionId: string,
  name: string,
): Promise<{ error: string | null }> {
  await requireAdmin();

  if (await hasDraws(sessionId)) {
    return { error: LOCKED_ERROR };
  }

  const urlToken = generateUrlToken();

  await db.insert(participants).values({ sessionId, name, urlToken });

  return { error: null };
}

export async function getParticipantByToken(token: string) {
  return db.query.participants.findFirst({
    where: eq(participants.urlToken, token),
    with: { session: true },
  });
}

export async function removeParticipant(
  participantId: string,
): Promise<{ error: string | null }> {
  await requireAdmin();

  const participant = await db.query.participants.findFirst({
    where: eq(participants.id, participantId),
    columns: { sessionId: true },
  });

  if (!participant) {
    return { error: "Teilnehmer nicht gefunden." };
  }

  if (await hasDraws(participant.sessionId)) {
    return { error: LOCKED_ERROR };
  }

  await db.delete(participants).where(eq(participants.id, participantId));

  return { error: null };
}
