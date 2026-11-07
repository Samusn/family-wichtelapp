import { describe, it, expect } from "vitest";
import { CATALOG, GROUPS, getCategory, getGroup } from "../lib/catalog";

describe("CATALOG data integrity", () => {
  it("has no duplicate category IDs", () => {
    const ids = CATALOG.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("every category has at least one tag", () => {
    for (const category of CATALOG) {
      expect(category.tags.length, `${category.id} has no tags`).toBeGreaterThan(0);
    }
  });

  it("no duplicate tag IDs within any category", () => {
    for (const category of CATALOG) {
      const tagIds = category.tags.map((t) => t.id);
      expect(
        new Set(tagIds).size,
        `${category.id} has duplicate tags`,
      ).toBe(tagIds.length);
    }
  });

  it("every category has a non-empty label", () => {
    for (const category of CATALOG) {
      expect(category.label.trim().length, `${category.id} has empty label`).toBeGreaterThan(0);
    }
  });
});

describe("GROUPS data integrity", () => {
  it("has no duplicate group IDs", () => {
    const ids = GROUPS.map((g) => g.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("every group references only existing category IDs", () => {
    const catalogIds = new Set(CATALOG.map((c) => c.id));
    for (const group of GROUPS) {
      for (const catId of group.categoryIds) {
        expect(catalogIds.has(catId), `Group "${group.id}" references unknown category "${catId}"`).toBe(true);
      }
    }
  });

  it("every category belongs to exactly one group", () => {
    const catToGroup = new Map<string, string[]>();
    for (const group of GROUPS) {
      for (const catId of group.categoryIds) {
        if (!catToGroup.has(catId)) catToGroup.set(catId, []);
        catToGroup.get(catId)!.push(group.id);
      }
    }
    for (const category of CATALOG) {
      const groups = catToGroup.get(category.id) ?? [];
      expect(
        groups.length,
        `Category "${category.id}" belongs to ${groups.length} groups: ${groups.join(", ")}`,
      ).toBe(1);
    }
  });
});

describe("getCategory / getGroup", () => {
  it("returns correct category for known ID", () => {
    const books = getCategory("books");
    expect(books).toBeDefined();
    expect(books!.label).toBe("Bücher");
  });

  it("returns undefined for unknown category ID", () => {
    expect(getCategory("nonexistent")).toBeUndefined();
  });

  it("returns correct group for known ID", () => {
    const home = getGroup("home");
    expect(home).toBeDefined();
    expect(home!.label).toBe("Zuhause & Garten");
  });

  it("returns undefined for unknown group ID", () => {
    expect(getGroup("nonexistent")).toBeUndefined();
  });
});
