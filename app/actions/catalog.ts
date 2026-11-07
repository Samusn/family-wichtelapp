"use server";

import { db } from "@db/index";
import {
  categoryChoices,
  groupNotes,
  participants,
  wishItems,
} from "@db/schema";
import type { Reservation } from "@/app/actions/wishes";
import { eq, and, ne, asc } from "drizzle-orm";
import { getParticipantByToken } from "@/app/actions/participants";
import {
  toPreferences,
  validatePreferences,
  type Preferences,
} from "./catalog.pure";
export type { Sentiment, Choice, Preferences } from "./catalog.pure";

async function getParticipant(token: string) {
  const participant = await getParticipantByToken(token);

  if (!participant || !participant.session) {
    throw new Error("Teilnehmer nicht gefunden.");
  }

  return participant;
}

export async function getOwnPreferences(token: string) {
  const participant = await getParticipant(token);

  const [rows, noteRows] = await Promise.all([
    db.query.categoryChoices.findMany({
      where: eq(categoryChoices.participantId, participant.id),
    }),
    db.query.groupNotes.findMany({
      where: eq(groupNotes.participantId, participant.id),
    }),
  ]);

  return toPreferences(rows, noteRows);
}

export async function getSessionPreferences(token: string) {
  const participant = await getParticipant(token);

  const others = await db.query.participants.findMany({
    where: and(
      eq(participants.sessionId, participant.session.id),
      ne(participants.id, participant.id),
    ),
    orderBy: [asc(participants.name)],
    columns: { id: true, name: true },
    with: {
      categoryChoices: true,
      groupNotes: true,
      wishItems: {
        orderBy: [asc(wishItems.sortOrder), asc(wishItems.createdAt)],
        columns: {
          id: true,
          title: true,
          url: true,
          imageUrl: true,
          reservedById: true,
        },
      },
    },
  });

  return others.map((other) => ({
    key: other.id,
    name: other.name,
    ...toPreferences(other.categoryChoices, other.groupNotes),
    wishes: other.wishItems.map(({ reservedById, ...wish }) => ({
      ...wish,
      reservation: (reservedById === null
        ? "free"
        : reservedById === participant.id
          ? "mine"
          : "taken") as Reservation,
    })),
  }));
}

export async function savePreferences(
  token: string,
  input: Preferences,
): Promise<{ error: string | null }> {
  const participant = await getParticipantByToken(token);

  if (!participant || !participant.session) {
    return { error: "Teilnehmer nicht gefunden." };
  }

  if (participant.session.isArchived) {
    return { error: "Diese Session ist archiviert." };
  }

  const validated = validatePreferences(input);
  if (validated.error) {
    return { error: validated.error };
  }
  const { choices, notes } = validated;

  const deleteChoices = db
    .delete(categoryChoices)
    .where(eq(categoryChoices.participantId, participant.id));
  const deleteNotes = db
    .delete(groupNotes)
    .where(eq(groupNotes.participantId, participant.id));

  await db.batch([
    deleteChoices,
    deleteNotes,
    ...(choices.length > 0
      ? [
          db.insert(categoryChoices).values(
            choices.map((choice) => ({
              participantId: participant.id,
              ...choice,
            })),
          ),
        ]
      : []),
    ...(notes.length > 0
      ? [
          db
            .insert(groupNotes)
            .values(
              notes.map((note) => ({ participantId: participant.id, ...note })),
            ),
        ]
      : []),
  ]);
  return { error: null };
}
