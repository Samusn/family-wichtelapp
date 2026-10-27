"use server";

import { db } from "@db/index";
import { draws, participants, sessions } from "@db/schema";
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

function isUniqueViolation(err: unknown) {
  const cause = err instanceof Error ? err.cause : undefined;
  return (
    typeof cause === "object" &&
    cause !== null &&
    "code" in cause &&
    cause.code === "23505"
  );
}

function isValidAssignment(
  givers: { id: string }[],
  receivers: { id: string }[],
) {
  const giverIds = new Set(givers.map((giver) => giver.id));
  const receiverIds = new Set(receivers.map((receiver) => receiver.id));

  return (
    givers.length === receivers.length &&
    giverIds.size === givers.length &&
    receiverIds.size === receivers.length &&
    receivers.every((receiver) => giverIds.has(receiver.id)) &&
    givers.every((giver, i) => giver.id !== receivers[i].id)
  );
}

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
