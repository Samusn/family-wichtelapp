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
import { CATALOG, NOTE_MAX_LENGTH, getCategory, getGroup } from "@/lib/catalog";

export type Sentiment = "like" | "dislike";

export type Choice = {
  categoryId: string;
  sentiment: Sentiment;
  tags: string[];
};

export type Preferences = {
  choices: Choice[];
  notes: Record<string, string>;
};

const catalogOrder = new Map(CATALOG.map((category, i) => [category.id, i]));

function toPreferences(
  rows: { categoryId: string; sentiment: Sentiment; tags: string[] }[],
  noteRows: { groupId: string; note: string }[],
): Preferences {
  return {
    choices: rows
      .filter((row) => getCategory(row.categoryId))
      .sort(
        (a, b) =>
          catalogOrder.get(a.categoryId)! - catalogOrder.get(b.categoryId)!,
      )
      .map(({ categoryId, sentiment, tags }) => ({
        categoryId,
        sentiment,
        tags,
      })),
    notes: Object.fromEntries(
      noteRows
        .filter((row) => getGroup(row.groupId))
        .map((row) => [row.groupId, row.note]),
    ),
  };
}

function validatePreferences(input: Preferences) {
  const seen = new Set<string>();
  const choices: Choice[] = [];

  for (const choice of input.choices) {
    const category = getCategory(choice.categoryId);
    if (!category || seen.has(category.id)) continue;
    if (choice.sentiment !== "like" && choice.sentiment !== "dislike") continue;
    seen.add(category.id);

    const allowedTags = new Set(category.tags.map((tag) => tag.id));
    const tags =
      choice.sentiment === "like"
        ? [...new Set(choice.tags)].filter((tag) => allowedTags.has(tag))
        : [];

    choices.push({
      categoryId: category.id,
      sentiment: choice.sentiment,
      tags,
    });
  }

  const notes: { groupId: string; note: string }[] = [];
  for (const [groupId, rawNote] of Object.entries(input.notes)) {
    const note = String(rawNote).trim();
    if (!getGroup(groupId) || !note) continue;
    if (note.length > NOTE_MAX_LENGTH) {
      return {
        error: `Eine Notiz darf höchstens ${NOTE_MAX_LENGTH} Zeichen haben.`,
      } as const;
    }
    notes.push({ groupId, note });
  }

  return { choices, notes, error: null };
}

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
