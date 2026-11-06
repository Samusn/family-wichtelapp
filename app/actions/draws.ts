"use server";

import { db } from "@db/index";
import { draws, participants, sessions } from "@db/schema";
import { eq, and, isNull } from "drizzle-orm";
import { getParticipantByToken } from "@/app/actions/participants";
import { requireAdmin } from "@/lib/adminAuth";
import { shuffle, isUniqueViolation, isValidAssignment } from "./draws.pure";

export async function performDraw(
  sessionId: string,
): Promise<{ error: string | null }> {
  await requireAdmin();

  const session = await db.query.sessions.findFirst({
    where: eq(sessions.id, sessionId),
    columns: { isArchived: true },
  });

  if (!session) {
    return { error: "Session nicht gefunden." };
  }

  if (session.isArchived) {
    return { error: "Die Session ist archiviert." };
  }

  const givers = await db.query.participants.findMany({
    where: eq(participants.sessionId, sessionId),
    columns: { id: true },
  });

  if (givers.length < 3) {
    return { error: "Mindestens 3 Teilnehmer für eine Ziehung nötig." };
  }

  let receivers: typeof givers;
  do {
    receivers = shuffle(givers);
  } while (givers.some((giver, i) => giver.id === receivers[i].id));

  if (!isValidAssignment(givers, receivers)) {
    return { error: "Die Ziehung ist fehlgeschlagen. Bitte erneut versuchen." };
  }

  try {
    await db.insert(draws).values(
      givers.map((giver, i) => ({
        sessionId,
        giverId: giver.id,
        receiverId: receivers[i].id,
      })),
    );
  } catch (err) {
    if (isUniqueViolation(err)) {
      return { error: "Es wurde bereits gezogen für diese Session." };
    }
    throw err;
  }

  return { error: null };
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
    with: { receiver: { columns: { id: true, name: true } } },
  });

  return draw
    ? {
        receiverId: draw.receiver.id,
        receiverName: draw.receiver.name,
        revealedAt: draw.revealedAt,
      }
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
