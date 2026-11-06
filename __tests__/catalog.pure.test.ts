import { describe, it, expect } from "vitest";
import {
  toPreferences,
  validatePreferences,
  type Preferences,
  type Sentiment,
} from "../app/actions/catalog.pure";
import { CATALOG, GROUPS, NOTE_MAX_LENGTH } from "../lib/catalog";

// --- toPreferences ---

describe("toPreferences", () => {
  it("filters out rows with unknown categoryId", () => {
    const rows = [
      { categoryId: "books", sentiment: "like" as Sentiment, tags: [] },
      { categoryId: "FAKE_ID", sentiment: "like" as Sentiment, tags: [] },
    ];
    const result = toPreferences(rows, []);
    expect(result.choices).toHaveLength(1);
    expect(result.choices[0].categoryId).toBe("books");
  });

  it("filters out notes with unknown groupId", () => {
    const notes = [
      { groupId: "home", note: "Hello" },
      { groupId: "FAKE_GROUP", note: "Nope" },
    ];
    const result = toPreferences([], notes);
    expect(Object.keys(result.notes)).toEqual(["home"]);
  });

  it("sorts choices by CATALOG definition order", () => {
    const booksIndex = CATALOG.findIndex((c) => c.id === "books");
    const techIndex = CATALOG.findIndex((c) => c.id === "tech");
    expect(booksIndex).toBeLessThan(techIndex);

    const rows = [
      { categoryId: "tech", sentiment: "like" as Sentiment, tags: [] },
      { categoryId: "books", sentiment: "dislike" as Sentiment, tags: [] },
    ];
    const result = toPreferences(rows, []);
    expect(result.choices[0].categoryId).toBe("books");
    expect(result.choices[1].categoryId).toBe("tech");
  });
});

// --- validatePreferences ---

describe("validatePreferences", () => {
  it("accepts valid input", () => {
    const input: Preferences = {
      choices: [{ categoryId: "books", sentiment: "like", tags: ["crime"] }],
      notes: {},
    };
    const result = validatePreferences(input);
    expect(result.error).toBeNull();
    expect(result.choices).toHaveLength(1);
  });

  it("deduplicates categories (keeps first occurrence)", () => {
    const input: Preferences = {
      choices: [
        { categoryId: "books", sentiment: "like", tags: ["crime"] },
        { categoryId: "books", sentiment: "dislike", tags: [] },
      ],
      notes: {},
    };
    const result = validatePreferences(input);
    expect(result.choices).toHaveLength(1);
    expect(result.choices![0].sentiment).toBe("like");
  });

  it("strips tags when sentiment is dislike", () => {
    const input: Preferences = {
      choices: [
        { categoryId: "books", sentiment: "dislike", tags: ["crime", "fantasy"] },
      ],
      notes: {},
    };
    const result = validatePreferences(input);
    expect(result.choices![0].tags).toEqual([]);
  });

  it("filters out invalid tags", () => {
    const input: Preferences = {
      choices: [
        {
          categoryId: "books",
          sentiment: "like",
          tags: ["crime", "INVALID_TAG"],
        },
      ],
      notes: {},
    };
    const result = validatePreferences(input);
    expect(result.choices![0].tags).toEqual(["crime"]);
  });

  it("deduplicates tags", () => {
    const input: Preferences = {
      choices: [
        { categoryId: "books", sentiment: "like", tags: ["crime", "crime"] },
      ],
      notes: {},
    };
    const result = validatePreferences(input);
    expect(result.choices![0].tags).toEqual(["crime"]);
  });

  it("skips choices with invalid sentiment", () => {
    const input: Preferences = {
      choices: [
        { categoryId: "books", sentiment: "love" as Sentiment, tags: [] },
      ],
      notes: {},
    };
    const result = validatePreferences(input);
    expect(result.choices).toHaveLength(0);
  });

  it("skips choices with invalid categoryId", () => {
    const input: Preferences = {
      choices: [{ categoryId: "FAKE", sentiment: "like", tags: [] }],
      notes: {},
    };
    const result = validatePreferences(input);
    expect(result.choices).toHaveLength(0);
  });

  it("rejects notes exceeding max length", () => {
    const input: Preferences = {
      choices: [],
      notes: { home: "X".repeat(NOTE_MAX_LENGTH + 1) },
    };
    const result = validatePreferences(input);
    expect(result.error).toBeTruthy();
  });

  it("accepts notes at exactly max length", () => {
    const input: Preferences = {
      choices: [],
      notes: { home: "X".repeat(NOTE_MAX_LENGTH) },
    };
    const result = validatePreferences(input);
    expect(result.error).toBeNull();
  });

  it("skips empty notes after trim", () => {
    const input: Preferences = {
      choices: [],
      notes: { home: "   " },
    };
    const result = validatePreferences(input);
    expect(result.notes).toHaveLength(0);
  });

  it("skips notes with invalid groupId", () => {
    const input: Preferences = {
      choices: [],
      notes: { FAKE_GROUP: "Hello" },
    };
    const result = validatePreferences(input);
    expect(result.notes).toHaveLength(0);
  });
});
