import { describe, it, expect } from "vitest";
import { generateUrlToken } from "../lib/tokens";

describe("generateUrlToken", () => {
  it("returns a 12-character string", () => {
    const token = generateUrlToken();
    expect(token).toHaveLength(12);
  });

  it("contains only URL-safe base64 characters", () => {
    const token = generateUrlToken();
    expect(token).toMatch(/^[A-Za-z0-9_-]+$/);
  });

  it("generates unique tokens", () => {
    const tokens = new Set(Array.from({ length: 100 }, () => generateUrlToken()));
    expect(tokens.size).toBe(100);
  });
});
