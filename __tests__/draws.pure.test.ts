import { describe, it, expect } from "vitest";
import {
  shuffle,
  isValidAssignment,
  isUniqueViolation,
} from "../app/actions/draws.pure";

// --- shuffle ---

describe("shuffle", () => {
  it("returns array of same length with same elements", () => {
    const input = [1, 2, 3, 4, 5];
    const result = shuffle(input);
    expect(result).toHaveLength(input.length);
    expect(result.sort()).toEqual([...input].sort());
  });

  it("does not mutate the original array", () => {
    const input = [1, 2, 3, 4, 5];
    const copy = [...input];
    shuffle(input);
    expect(input).toEqual(copy);
  });

  it("returns empty array for empty input", () => {
    expect(shuffle([])).toEqual([]);
  });

  it("returns single-element array unchanged", () => {
    expect(shuffle([42])).toEqual([42]);
  });

  it("produces at least one different order in 50 runs", () => {
    const input = [1, 2, 3, 4, 5];
    const original = JSON.stringify(input);
    let changed = false;
    for (let i = 0; i < 50; i++) {
      if (JSON.stringify(shuffle(input)) !== original) {
        changed = true;
        break;
      }
    }
    expect(changed).toBe(true);
  });
});

// --- isValidAssignment ---

describe("isValidAssignment", () => {
  const make = (ids: string[]) => ids.map((id) => ({ id }));

  it("accepts a valid derangement (A->B, B->C, C->A)", () => {
    const givers = make(["A", "B", "C"]);
    const receivers = make(["B", "C", "A"]);
    expect(isValidAssignment(givers, receivers)).toBe(true);
  });

  it("rejects a self-draw", () => {
    const givers = make(["A", "B", "C"]);
    const receivers = make(["A", "C", "B"]);
    expect(isValidAssignment(givers, receivers)).toBe(false);
  });

  it("rejects mismatched lengths", () => {
    const givers = make(["A", "B", "C"]);
    const receivers = make(["B", "C"]);
    expect(isValidAssignment(givers, receivers)).toBe(false);
  });

  it("rejects duplicate giver IDs", () => {
    const givers = make(["A", "A", "C"]);
    const receivers = make(["C", "B", "A"]);
    expect(isValidAssignment(givers, receivers)).toBe(false);
  });

  it("rejects duplicate receiver IDs", () => {
    const givers = make(["A", "B", "C"]);
    const receivers = make(["B", "B", "A"]);
    expect(isValidAssignment(givers, receivers)).toBe(false);
  });

  it("rejects receiver not in giver set", () => {
    const givers = make(["A", "B", "C"]);
    const receivers = make(["B", "C", "X"]);
    expect(isValidAssignment(givers, receivers)).toBe(false);
  });

  it("accepts large group rotated by 1", () => {
    const ids = Array.from({ length: 10 }, (_, i) => `P${i}`);
    const givers = make(ids);
    const receivers = make([...ids.slice(1), ids[0]]);
    expect(isValidAssignment(givers, receivers)).toBe(true);
  });
});

// --- isUniqueViolation ---

describe("isUniqueViolation", () => {
  it("returns true for PG unique violation (code 23505)", () => {
    const err = new Error("conflict");
    (err as Error & { cause: unknown }).cause = { code: "23505" };
    expect(isUniqueViolation(err)).toBe(true);
  });

  it("returns false for other PG error codes", () => {
    const err = new Error("fk violation");
    (err as Error & { cause: unknown }).cause = { code: "23503" };
    expect(isUniqueViolation(err)).toBe(false);
  });

  it("returns false for Error without cause", () => {
    expect(isUniqueViolation(new Error("plain"))).toBe(false);
  });

  it("returns false for non-Error values", () => {
    expect(isUniqueViolation("string")).toBe(false);
    expect(isUniqueViolation(null)).toBe(false);
    expect(isUniqueViolation(undefined)).toBe(false);
  });
});

// --- Draw loop simulation (shuffle + isValidAssignment combined) ---

describe("draw loop simulation", () => {
  for (const size of [3, 5, 8, 15, 30]) {
    it(`converges to a valid derangement for ${size} participants`, () => {
      const ids = Array.from({ length: size }, (_, i) => `P${i}`);
      const givers = ids.map((id) => ({ id }));

      let receivers: typeof givers;
      let attempts = 0;
      do {
        receivers = shuffle(givers);
        attempts++;
        if (attempts > 1000) break;
      } while (givers.some((g, i) => g.id === receivers[i].id));

      expect(attempts).toBeLessThan(1000);
      expect(isValidAssignment(givers, receivers)).toBe(true);
    });
  }
});
