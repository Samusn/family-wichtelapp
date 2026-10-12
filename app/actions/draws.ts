"use server";

import { db } from "@db/index";
import { draws, participants } from "@db/schema";
import { eq, and } from "drizzle-orm";

function shuffle<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export async function performDraw(sessionId: string) {
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
  return db.query.draws.findMany({
    where: eq(draws.sessionId, sessionId),
    with: { giver: true, receiver: true },
  });
}

export async function getDrawForParticipant(
  sessionId: string,
  participantId: string,
) {
  return db.query.draws.findFirst({
    where: and(
      eq(draws.sessionId, sessionId),
      eq(draws.giverId, participantId),
    ),
    with: { receiver: true },
  });
}
