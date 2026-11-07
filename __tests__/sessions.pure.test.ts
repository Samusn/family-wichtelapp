import { describe, it, expect } from "vitest";
import { parseDate } from "../app/actions/sessions.pure";

describe("parseDate", () => {
  it("parses a valid ISO date string", () => {
    const date = parseDate("2025-12-24T18:00:00Z");
    expect(date).toBeInstanceOf(Date);
    expect(date!.toISOString()).toBe("2025-12-24T18:00:00.000Z");
  });

  it("parses a date-only string", () => {
    const date = parseDate("2025-12-24");
    expect(date).toBeInstanceOf(Date);
  });

  it("returns null for invalid string", () => {
    expect(parseDate("not-a-date")).toBeNull();
  });

  it("returns null for empty string", () => {
    expect(parseDate("")).toBeNull();
  });
});
