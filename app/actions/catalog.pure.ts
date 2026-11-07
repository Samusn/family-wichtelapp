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

export function toPreferences(
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

export function validatePreferences(input: Preferences) {
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
