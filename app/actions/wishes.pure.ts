export const MAX_IMAGE_BYTES = 4 * 1024 * 1024;

export const IMAGE_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

export function parseWishForm(formData: FormData) {
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
