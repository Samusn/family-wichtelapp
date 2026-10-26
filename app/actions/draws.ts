"use server";

import { db } from "@db/index";
import { draws, participants } from "@db/schema";
import { eq, and, isNull } from "drizzle-orm";
import { getParticipantByToken } from "@/app/actions/participants";
import { requireAdmin } from "@/lib/adminAuth";

function shuffle<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export async function performDraw(sessionId: string) {
  await requireAdmin();

  const existingDraws = await db.query.draws.findMany({
    where: eq(draws.sessionId, sessionId),
  });

  if (existingDraws.length > 0) {
    throw new Error("Es wurde bereits gezogen für diese Session.");
  }

  const sessionParticipants = await db.query.participants.findMany({
    where: eq(participants.sessionId, sessionId),
  });

  if (sessionParticipants.length < 3) {
    throw new Error("Mindestens 3 Teilnehmer für eine Ziehung nötig.");
  }

  const givers = [...sessionParticipants];
  let receivers: typeof givers;

  // Shuffle until no one draws themselves
  do {
    receivers = shuffle(sessionParticipants);
  } while (givers.some((g, i) => g.id === receivers[i].id));

  const drawEntries = givers.map((giver, i) => ({
    sessionId,
    giverId: giver.id,
    receiverId: receivers[i].id,
  }));

  await db.insert(draws).values(drawEntries);

  return drawEntries;
}

export async function getDrawsForSession(sessionId: string) {
  await requireAdmin();

  return db.query.draws.findMany({
    where: eq(draws.sessionId, sessionId),
    with: { giver: true, receiver: true },
  });
}

export async function getDrawForToken(token: string) {
  const participant = await getParticipantByToken(token);
  if (!participant) return null;

  const draw = await db.query.draws.findFirst({
    where: and(
      eq(draws.sessionId, participant.sessionId),
      eq(draws.giverId, participant.id),
    ),
    columns: { revealedAt: true },
    with: { receiver: { columns: { name: true } } },
  });

  return draw
    ? { receiverName: draw.receiver.name, revealedAt: draw.revealedAt }
    : null;
}

export async function markDrawRevealed(
  token: string,
): Promise<{ error: string | null }> {
  const participant = await getParticipantByToken(token);

  if (!participant) {
    return { error: "Teilnehmer nicht gefunden." };
  }

  await db
    .update(draws)
    .set({ revealedAt: new Date() })
    .where(and(eq(draws.giverId, participant.id), isNull(draws.revealedAt)));

  return { error: null };
}

export async function getDrawStatusForSession(sessionId: string) {
  await requireAdmin();

  const rows = await db.query.draws.findMany({
    where: eq(draws.sessionId, sessionId),
    columns: { id: true, revealedAt: true },
    with: { giver: { columns: { name: true } } },
  });

  return rows.map((row) => ({
    id: row.id,
    giverName: row.giver.name,
    isRevealed: row.revealedAt !== null,
  }));
}
