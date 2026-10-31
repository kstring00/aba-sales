/**
 * Synthetic sample data for the public sample export, the on-page preview
 * and tests. No real child. "Bean" is a nickname invented for demos.
 * Six observations in the week of Mar 2–8, 2026; one holds two behaviors,
 * so the sample teaches the real model (audit F-04).
 */
import type { EntryWithBehavior } from "@/lib/abc/types";

type Seed = Partial<EntryWithBehavior> & { at: string; behaviors: string[] };

const SEEDS: Seed[] = [
  { at: "2026-03-02T15:12:00Z", behaviors: ["Hitting"], antecedentCode: "instruction_given", consequenceCode: "activity_stopped", intensity: 2, durationSeconds: 180 },
  { at: "2026-03-03T20:47:00Z", behaviors: ["Screaming", "Dropping to floor"], antecedentCode: "activity_changed", antecedentNote: "Transition from tablet to dinner.", consequenceCode: "comfort_offered", intensity: 3, durationSeconds: 600 },
  { at: "2026-03-04T16:15:00Z", behaviors: ["Dropping to floor"], antecedentCode: "item_unavailable", consequenceCode: "item_provided", intensity: 2, durationSeconds: 180 },
  { at: "2026-03-05T22:22:00Z", behaviors: ["Refusing"], antecedentCode: "instruction_given", consequenceCode: "someone_interacted", intensity: 1, durationSeconds: 30 },
  { at: "2026-03-06T17:03:00Z", behaviors: ["Covering ears"], antecedentCode: "something_else", antecedentNote: "Loud blender running in the kitchen.", consequenceCode: "no_response_observed", intensity: null, durationSeconds: 30 },
  { at: "2026-03-07T14:38:00Z", behaviors: ["Screaming"], antecedentCode: "someone_approached", consequenceCode: "comfort_offered", intensity: 2, durationSeconds: 180, note: "Settled after a few minutes in the hallway." },
];

export function sampleEntries(): EntryWithBehavior[] {
  return SEEDS.map((s, i) => ({
    id: `sample-${i}`,
    behaviorIds: s.behaviors.map((b) => `sample-${b.toLowerCase().replace(/\s+/g, "-")}`),
    behaviorLabels: s.behaviors,
    behaviorLabel: s.behaviors.join("; "),
    occurredAt: s.at,
    antecedentCode: s.antecedentCode ?? null,
    antecedentNote: s.antecedentNote ?? null,
    consequenceCode: s.consequenceCode ?? null,
    consequenceNote: s.consequenceNote ?? null,
    durationSeconds: s.durationSeconds ?? null,
    intensity: s.intensity ?? null,
    note: s.note ?? null,
    functionCode: null,
    createdAt: s.at,
    updatedAt: s.at,
  }));
}
