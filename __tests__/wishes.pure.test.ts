import { describe, it, expect } from "vitest";
import { parseWishForm, MAX_IMAGE_BYTES, IMAGE_TYPES } from "../app/actions/wishes.pure";

function makeFormData(fields: Record<string, string | File>) {
  const fd = new FormData();
  for (const [key, value] of Object.entries(fields)) {
    fd.set(key, value);
  }
  return fd;
}

function fakeFile(name: string, type: string, sizeBytes: number): File {
  const buffer = new ArrayBuffer(sizeBytes);
  return new File([buffer], name, { type });
}

// --- Title validation ---

describe("parseWishForm – title", () => {
  it("accepts a valid title", () => {
    const result = parseWishForm(makeFormData({ title: "Lego Set" }));
    expect(result.error).toBeNull();
    expect(result.title).toBe("Lego Set");
  });

  it("trims whitespace", () => {
    const result = parseWishForm(makeFormData({ title: "  Lego Set  " }));
    expect(result.error).toBeNull();
    expect(result.title).toBe("Lego Set");
  });

  it("rejects empty title", () => {
    const result = parseWishForm(makeFormData({ title: "" }));
    expect(result.error).toBeTruthy();
  });

  it("rejects whitespace-only title", () => {
    const result = parseWishForm(makeFormData({ title: "   " }));
    expect(result.error).toBeTruthy();
  });

  it("accepts title at exactly 255 chars", () => {
    const result = parseWishForm(makeFormData({ title: "A".repeat(255) }));
    expect(result.error).toBeNull();
  });

  it("rejects title longer than 255 chars", () => {
    const result = parseWishForm(makeFormData({ title: "A".repeat(256) }));
    expect(result.error).toBeTruthy();
  });
});

// --- URL validation ---

describe("parseWishForm – url", () => {
  it("accepts https URL", () => {
    const result = parseWishForm(
      makeFormData({ title: "X", url: "https://example.com" }),
    );
    expect(result.error).toBeNull();
    expect(result.url).toBe("https://example.com/");
  });

  it("accepts http URL", () => {
    const result = parseWishForm(
      makeFormData({ title: "X", url: "http://example.com" }),
    );
    expect(result.error).toBeNull();
  });

  it("returns null for empty URL (optional field)", () => {
    const result = parseWishForm(makeFormData({ title: "X", url: "" }));
    expect(result.error).toBeNull();
    expect(result.url).toBeNull();
  });

  it("rejects ftp URL", () => {
    const result = parseWishForm(
      makeFormData({ title: "X", url: "ftp://example.com" }),
    );
    expect(result.error).toBeTruthy();
  });

  it("rejects javascript: URL", () => {
    const result = parseWishForm(
      makeFormData({ title: "X", url: "javascript:alert(1)" }),
    );
    expect(result.error).toBeTruthy();
  });

  it("rejects malformed URL", () => {
    const result = parseWishForm(
      makeFormData({ title: "X", url: "not a url" }),
    );
    expect(result.error).toBeTruthy();
  });
});

// --- Image validation ---

describe("parseWishForm – image", () => {
  for (const [mime, ext] of Object.entries(IMAGE_TYPES)) {
    it(`accepts ${mime} image`, () => {
      const file = fakeFile(`photo.${ext}`, mime, 1024);
      const fd = makeFormData({ title: "X" });
      fd.set("image", file);
      const result = parseWishForm(fd);
      expect(result.error).toBeNull();
    });
  }

  it("rejects SVG image", () => {
    const file = fakeFile("icon.svg", "image/svg+xml", 1024);
    const fd = makeFormData({ title: "X" });
    fd.set("image", file);
    const result = parseWishForm(fd);
    expect(result.error).toBeTruthy();
  });

  it("rejects image larger than 4 MB", () => {
    const file = fakeFile("big.jpg", "image/jpeg", MAX_IMAGE_BYTES + 1);
    const fd = makeFormData({ title: "X" });
    fd.set("image", file);
    const result = parseWishForm(fd);
    expect(result.error).toBeTruthy();
  });

  it("accepts image at exactly 4 MB", () => {
    const file = fakeFile("exact.jpg", "image/jpeg", MAX_IMAGE_BYTES);
    const fd = makeFormData({ title: "X" });
    fd.set("image", file);
    const result = parseWishForm(fd);
    expect(result.error).toBeNull();
  });
});

// --- removeImage flag ---

describe("parseWishForm – removeImage", () => {
  it("parses removeImage true", () => {
    const result = parseWishForm(
      makeFormData({ title: "X", removeImage: "true" }),
    );
    expect(result.error).toBeNull();
    expect(result.removeImage).toBe(true);
  });

  it("defaults removeImage to false", () => {
    const result = parseWishForm(makeFormData({ title: "X" }));
    expect(result.error).toBeNull();
    expect(result.removeImage).toBe(false);
  });
});
