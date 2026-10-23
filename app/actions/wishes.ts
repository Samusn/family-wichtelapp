"use server";

import { randomUUID } from "crypto";
import { put, del } from "@vercel/blob";
import { db } from "@db/index";
import { participants, wishItems } from "@db/schema";
import { eq, and, ne, asc, count, isNull, inArray } from "drizzle-orm";
import { getParticipantByToken } from "@/app/actions/participants";

const MAX_IMAGE_BYTES = 4 * 1024 * 1024;
const IMAGE_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

export type Reservation = "free" | "mine" | "taken";

export type Wish = {
  id: string;
  title: string;
  url: string | null;
  imageUrl: string | null;
};

type Result = { error: string | null };

async function getParticipant(token: string) {
  const participant = await getParticipantByToken(token);
  if (!participant || !participant.session) return null;
  return participant;
}

async function getEditableParticipant(token: string) {
  const participant = await getParticipant(token);
  if (!participant) return { error: "Teilnehmer nicht gefunden." } as const;
  if (participant.session.isArchived) {
    return { error: "Diese Session ist archiviert." } as const;
  }
  return { participant, error: null } as const;
}

function parseWishForm(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  if (title.length < 1 || title.length > 255) {
    return {
      error: "Der Wunsch muss zwischen 1 und 255 Zeichen lang sein.",
    } as const;
  }

  const rawUrl = String(formData.get("url") ?? "").trim();
  let url: string | null = null;
  if (rawUrl) {
    let parsed: URL;
    try {
      parsed = new URL(rawUrl);
    } catch {
      return { error: "Der Link ist ungültig." } as const;
    }
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return {
        error: "Nur Links mit http:// oder https:// sind erlaubt.",
      } as const;
    }
    url = parsed.toString();
  }

  const image = formData.get("image");
  const imageFile = image instanceof File && image.size > 0 ? image : null;
  if (imageFile) {
    if (!IMAGE_TYPES[imageFile.type]) {
      return {
        error: "Nur JPG, PNG, WebP oder GIF als Bild erlaubt.",
      } as const;
    }
    if (imageFile.size > MAX_IMAGE_BYTES) {
      return { error: "Das Bild ist zu groß (max. 4 MB)." } as const;
    }
  }

  return {
    title,
    url,
    imageFile,
    removeImage: formData.get("removeImage") === "true",
    error: null,
  } as const;
}

async function uploadImage(file: File) {
  const blob = await put(
    `wishes/${randomUUID()}.${IMAGE_TYPES[file.type]}`,
    file,
    { access: "public", contentType: file.type },
  );
  return blob.url;
}

async function deleteImage(imageUrl: string | null) {
  if (!imageUrl) return;
  try {
    await del(imageUrl);
  } catch (err) {
    console.error("Bild konnte nicht gelöscht werden:", err);
  }
}

async function getOwnWish(participantId: string, wishId: string) {
  return db.query.wishItems.findFirst({
    where: and(
      eq(wishItems.id, wishId),
      eq(wishItems.participantId, participantId),
    ),
  });
}

export async function getOwnWishes(token: string): Promise<Wish[]> {
  const participant = await getParticipant(token);
  if (!participant) return [];

  return db.query.wishItems.findMany({
    where: eq(wishItems.participantId, participant.id),
    orderBy: [asc(wishItems.sortOrder), asc(wishItems.createdAt)],
    columns: { id: true, title: true, url: true, imageUrl: true },
  });
}

export async function addWish(
  token: string,
  formData: FormData,
): Promise<Result> {
  const { participant, error } = await getEditableParticipant(token);
  if (error) return { error };

  const wish = parseWishForm(formData);
  if (wish.error) return { error: wish.error };

  const [{ value: existingCount }] = await db
    .select({ value: count() })
    .from(wishItems)
    .where(eq(wishItems.participantId, participant.id));

  const imageUrl = wish.imageFile ? await uploadImage(wish.imageFile) : null;

  await db.insert(wishItems).values({
    participantId: participant.id,
    title: wish.title,
    url: wish.url,
    imageUrl,
    sortOrder: existingCount,
  });
  return { error: null };
}

export async function updateWish(
  token: string,
  wishId: string,
  formData: FormData,
): Promise<Result> {
  const { participant, error } = await getEditableParticipant(token);
  if (error) return { error };

  const existing = await getOwnWish(participant.id, wishId);
  if (!existing) return { error: "Wunsch nicht gefunden." };

  const wish = parseWishForm(formData);
  if (wish.error) return { error: wish.error };

  let imageUrl = existing.imageUrl;
  if (wish.imageFile) {
    imageUrl = await uploadImage(wish.imageFile);
  } else if (wish.removeImage) {
    imageUrl = null;
  }

  await db
    .update(wishItems)
    .set({ title: wish.title, url: wish.url, imageUrl })
    .where(eq(wishItems.id, existing.id));

  if (imageUrl !== existing.imageUrl) {
    await deleteImage(existing.imageUrl);
  }
  return { error: null };
}

export async function deleteWish(
  token: string,
  wishId: string,
): Promise<Result> {
  const { participant, error } = await getEditableParticipant(token);
  if (error) return { error };

  const existing = await getOwnWish(participant.id, wishId);
  if (!existing) return { error: null };

  await db.delete(wishItems).where(eq(wishItems.id, existing.id));
  await deleteImage(existing.imageUrl);
  return { error: null };
}

export async function reserveWish(
  token: string,
  wishId: string,
): Promise<Result> {
  const { participant, error } = await getEditableParticipant(token);
  if (error) return { error };

  const sessionParticipantIds = db
    .select({ id: participants.id })
    .from(participants)
    .where(eq(participants.sessionId, participant.session.id));

  const reserved = await db
    .update(wishItems)
    .set({ reservedById: participant.id, reservedAt: new Date() })
    .where(
      and(
        eq(wishItems.id, wishId),
        isNull(wishItems.reservedById),
        ne(wishItems.participantId, participant.id),
        inArray(wishItems.participantId, sessionParticipantIds),
      ),
    )
    .returning({ id: wishItems.id });

  if (reserved.length === 0) {
    return { error: "Dieser Wunsch ist schon reserviert." };
  }
  return { error: null };
}

export async function unreserveWish(
  token: string,
  wishId: string,
): Promise<Result> {
  const { participant, error } = await getEditableParticipant(token);
  if (error) return { error };

  await db
    .update(wishItems)
    .set({ reservedById: null, reservedAt: null })
    .where(
      and(eq(wishItems.id, wishId), eq(wishItems.reservedById, participant.id)),
    );
  return { error: null };
}
