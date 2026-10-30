import "server-only";
import { createHash, randomBytes } from "node:crypto";

/** Opaque URL-safe token plus the hash we store. The raw token is never stored. */
export function newToken() {
  const token = randomBytes(32).toString("base64url");
  return { token, hash: hashToken(token) };
}

export function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export function looksLikeToken(t: string | undefined | null): t is string {
  return typeof t === "string" && /^[A-Za-z0-9_-]{40,48}$/.test(t);
}
