/** Collapse provider error text into a few reasons the sign-in page can explain. */
export function reasonFor(message: string): string {
  const m = message.toLowerCase();
  if (m.includes("verifier") || m.includes("pkce")) return "browser";
  if (m.includes("expired")) return "expired";
  if (m.includes("invalid") || m.includes("not found") || m.includes("already")) return "used";
  if (m === "missing") return "missing";
  return "unknown";
}
