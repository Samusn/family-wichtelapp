import { randomBytes } from "crypto";

export function generateUrlToken(): string {
  return randomBytes(9).toString("base64url");
}
