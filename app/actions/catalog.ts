"use server";

import { db } from "@db/index";
import { categoryChoices, participants } from "@db/schema";
import { eq, and, ne, asc } from "drizzle-orm";
import { getParticipantByToken } from "@/app/actions/participants";
import { CATALOG, NOTE_MAX_LENGTH, getCategory } from "@/lib/catalog";

export type Sentiment = "like" | "dislike";

export type Choice = {
  categoryId: string;
  sentiment: Sentiment;
  tags: string[];
};

export type Preferences = {
  choices: Choice[];
  note: string;
};

const catalogOrder = new Map(CATALOG.map((category, i) => [category.id, i]));

function toPreferences(
  rows: { categoryId: string; sentiment: Sentiment; tags: string[] }[],
  note: string | null,
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
    note: note ?? "",
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

    choices.push({ categoryId: category.id, sentiment: choice.sentiment, tags });
  }

  const note = input.note.trim();
  if (note.length > NOTE_MAX_LENGTH) {
    return {
      error: `Die Notiz darf höchstens ${NOTE_MAX_LENGTH} Zeichen haben.`,
    } as const;
  }

  return { choices, note: note || null, error: null };
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

  const rows = await db.query.categoryChoices.findMany({
    where: eq(categoryChoices.participantId, participant.id),
  });

  return toPreferences(rows, participant.note);
}

export async function getSessionPreferences(token: string) {
  const participant = await getParticipant(token);

  const others = await db.query.participants.findMany({
    where: and(
      eq(participants.sessionId, participant.session.id),
      ne(participants.id, participant.id),
    ),
    orderBy: [asc(participants.name)],
    columns: { name: true, note: true },
    with: { categoryChoices: true },
  });

  return others.map((other) => ({
    name: other.name,
    ...toPreferences(other.categoryChoices, other.note),
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
  const { choices, note } = validated;

  const deleteChoices = db
    .delete(categoryChoices)
    .where(eq(categoryChoices.participantId, participant.id));
  const updateNote = db
    .update(participants)
    .set({ note })
    .where(eq(participants.id, participant.id));

  if (choices.length === 0) {
    await db.batch([deleteChoices, updateNote]);
    return { error: null };
  }

  await db.batch([
    deleteChoices,
    db.insert(categoryChoices).values(
      choices.map((choice) => ({
        participantId: participant.id,
        ...choice,
      })),
    ),
    updateNote,
  ]);
  return { error: null };
}
