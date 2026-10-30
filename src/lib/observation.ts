import type { AntecedentCode, ConsequenceCode } from "@/lib/abc/types";

/**
 * Observational vocabulary. Exact wording from the product spec.
 * These describe what was observable, never why it happened.
 */
export const ANTECEDENTS: ReadonlyArray<{ code: AntecedentCode; label: string }> = [
  { code: "instruction_given", label: "An instruction was given" },
  { code: "item_unavailable", label: "An item or activity was unavailable" },
  { code: "activity_changed", label: "An activity or location changed" },
  { code: "someone_approached", label: "Someone approached or interacted" },
  { code: "child_alone", label: "The child was alone" },
  { code: "something_else", label: "Something else" },
  { code: "not_sure", label: "Not sure" },
];

export const CONSEQUENCES: ReadonlyArray<{ code: ConsequenceCode; label: string }> = [
  { code: "item_provided", label: "An item or activity was provided" },
  { code: "activity_stopped", label: "The activity or instruction stopped" },
  { code: "someone_interacted", label: "Someone spoke to or interacted with the child" },
  { code: "comfort_offered", label: "Someone offered comfort" },
  { code: "no_response_observed", label: "No immediate response was observed" },
  { code: "something_else", label: "Something else" },
  { code: "not_sure", label: "Not sure" },
];

export const INTENSITY_LABELS: Record<1 | 2 | 3, string> = {
  1: "Gentle",
  2: "Moderate",
  3: "Intense",
};

/** Editable suggestions offered on first run. Parents own the final list. */
export const SEED_BEHAVIORS = [
  "Hitting",
  "Screaming",
  "Dropping to floor",
  "Running off",
  "Refusing",
];

export function antecedentLabel(code: AntecedentCode | null, note?: string | null) {
  if (!code) return "";
  const base = ANTECEDENTS.find((a) => a.code === code)?.label ?? code;
  return code === "something_else" && note ? note : base;
}

export function consequenceLabel(code: ConsequenceCode | null, note?: string | null) {
  if (!code) return "";
  const base = CONSEQUENCES.find((c) => c.code === code)?.label ?? code;
  return code === "something_else" && note ? note : base;
}

export function intensityLabel(v: number | null) {
  if (v === 1 || v === 2 || v === 3) return INTENSITY_LABELS[v];
  return "";
}

export function formatDuration(seconds: number | null) {
  if (seconds == null) return "";
  if (seconds < 60) return `${seconds}s`;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return s ? `${m}m ${s}s` : `${m}m`;
}
