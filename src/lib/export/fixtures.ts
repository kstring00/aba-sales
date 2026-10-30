/**
 * Synthetic sample data for the public sample export and tests.
 * No real child. "Bean" is a nickname invented for demos.
 */
import type { EntryWithBehavior } from "@/lib/data";
import type { AntecedentCode, ConsequenceCode } from "@/lib/database.types";

const A: AntecedentCode[] = ["instruction_given", "item_unavailable", "activity_changed", "someone_approached", "child_alone", "not_sure"];
const C: ConsequenceCode[] = ["item_provided", "activity_stopped", "someone_interacted", "comfort_offered", "no_response_observed", "not_sure"];
const B = ["Dropping to floor", "Screaming", "Covering ears", "Running off"];

// Deterministic pseudo-random so the sample is stable across builds.
function rng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

export function sampleEntries(fromIso = "2026-03-02T06:00:00Z", days = 14): EntryWithBehavior[] {
  const rand = rng(7);
  const out: EntryWithBehavior[] = [];
  const start = new Date(fromIso).getTime();
  for (let d = 0; d < days; d++) {
    const n = Math.floor(rand() * 3); // 0–2 per day
    for (let i = 0; i < n; i++) {
      const hour = 7 + Math.floor(rand() * 13);
      const minute = Math.floor(rand() * 60);
      const t = new Date(start + d * 86400000 + hour * 3600000 + minute * 60000);
      const notes = [
        null,
        null,
        "Transition from tablet to dinner.",
        "Loud blender running in the kitchen.",
        "Older sibling came home from practice.",
        "Settled after a few minutes in the hallway.",
      ];
      out.push({
        id: `sample-${d}-${i}`,
        child_id: "sample",
        behavior_id: "sample",
        behavior_label: B[Math.floor(rand() * B.length)],
        occurred_at: t.toISOString(),
        antecedent_code: A[Math.floor(rand() * A.length)],
        antecedent_note: null,
        consequence_code: C[Math.floor(rand() * C.length)],
        consequence_note: null,
        duration_seconds: rand() < 0.5 ? [30, 300, 900][Math.floor(rand() * 3)] : null,
        intensity: rand() < 0.6 ? 1 + Math.floor(rand() * 3) : null,
        note: notes[Math.floor(rand() * notes.length)],
        created_by: null,
        created_at: t.toISOString(),
        updated_at: t.toISOString(),
      });
    }
  }
  return out;
}
