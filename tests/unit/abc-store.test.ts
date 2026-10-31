import { beforeEach, describe, expect, it } from "vitest";
import { ANTECEDENTS, CONSEQUENCES, SEED_BEHAVIORS } from "@/lib/observation";
import { addBehavior, addEntry, clearAll, deleteBehavior, deleteEntry, readStore, setBehaviorActive, setChild, STORAGE_KEY, updateEntry, withLabels } from "@/lib/abc/store";
import { antecedentCaption, byAntecedent, byHour, hourCaption } from "@/lib/abc/views";

// Minimal localStorage for Node.
const mem = new Map<string, string>();
(globalThis as unknown as { window: unknown }).window = {
  localStorage: {
    getItem: (k: string) => mem.get(k) ?? null,
    setItem: (k: string, v: string) => void mem.set(k, v),
    removeItem: (k: string) => void mem.delete(k),
  },
  addEventListener: () => {},
  removeEventListener: () => {},
};

describe("chip data model", () => {
  it("has the exact observational wording, with Something else and Not sure on both lists", () => {
    expect(ANTECEDENTS.map((a) => a.label)).toEqual([
      "An instruction was given",
      "An item or activity was unavailable",
      "An activity or location changed",
      "Someone approached or interacted",
      "The child was alone",
      "Something else",
      "Not sure",
    ]);
    expect(CONSEQUENCES.map((c) => c.label)).toEqual([
      "An item or activity was provided",
      "The activity or instruction stopped",
      "Someone spoke to or interacted with the child",
      "Someone offered comfort",
      "No immediate response was observed",
      "Something else",
      "Not sure",
    ]);
    // No function words anywhere in the vocabulary.
    const all = [...ANTECEDENTS, ...CONSEQUENCES].map((x) => x.label.toLowerCase()).join(" ");
    for (const banned of ["attention", "escape", "sensory", "tangible", "because", "wanted", "avoid"]) expect(all).not.toContain(banned);
  });
});

describe("local store", () => {
  beforeEach(() => {
    clearAll();
    mem.clear();
  });

  it("sets up a child with seed labels and persists to localStorage", () => {
    setChild("Bean");
    const s = readStore();
    expect(s.child?.nickname).toBe("Bean");
    expect(s.behaviors.map((b) => b.label)).toEqual([...SEED_BEHAVIORS]);
    expect(JSON.parse(mem.get(STORAGE_KEY)!).child.nickname).toBe("Bean");
    expect(mem.get(STORAGE_KEY)).not.toContain("diagnosis");
  });

  it("adds, edits, deletes entries and joins labels", () => {
    setChild("Bean", ["Hitting"]);
    const b = readStore().behaviors[0];
    const e = addEntry({ behaviorIds: [b.id], occurredAt: "2026-03-02T15:00:00Z", antecedentCode: "instruction_given", antecedentNote: null, consequenceCode: null, consequenceNote: null, durationSeconds: null, intensity: null, note: null });
    expect(withLabels(readStore())[0].behaviorLabel).toBe("Hitting");
    updateEntry(e.id, { intensity: 2 });
    expect(readStore().entries[0].intensity).toBe(2);
    deleteEntry(e.id);
    expect(readStore().entries).toHaveLength(0);
  });

  it("re-adding an existing label reuses it; labels in use cannot be deleted, only hidden", () => {
    setChild("Bean", ["Hitting"]);
    const b = readStore().behaviors[0];
    expect(addBehavior("hitting").id).toBe(b.id);
    addEntry({ behaviorIds: [b.id], occurredAt: new Date().toISOString(), antecedentCode: null, antecedentNote: null, consequenceCode: null, consequenceNote: null, durationSeconds: null, intensity: null, note: null });
    expect(deleteBehavior(b.id)).toBe(false);
    setBehaviorActive(b.id, false);
    expect(readStore().behaviors[0].isActive).toBe(false);
  });

  it("clearAll removes the key entirely", () => {
    setChild("Bean");
    clearAll();
    expect(mem.has(STORAGE_KEY)).toBe(false);
    expect(readStore().child).toBeNull();
  });
});

describe("views", () => {
  it("count by hour and antecedent with fact-only captions", () => {
    setChild("Bean", ["A"]);
    const b = readStore().behaviors[0];
    const at = (h: number) => { const d = new Date(); d.setHours(h, 0, 0, 0); return d.toISOString(); };
    addEntry({ behaviorIds: [b.id], occurredAt: at(16), antecedentCode: "child_alone", antecedentNote: null, consequenceCode: null, consequenceNote: null, durationSeconds: null, intensity: null, note: null });
    addEntry({ behaviorIds: [b.id], occurredAt: at(17), antecedentCode: "child_alone", antecedentNote: null, consequenceCode: null, consequenceNote: null, durationSeconds: null, intensity: null, note: null });
    addEntry({ behaviorIds: [b.id], occurredAt: at(9), antecedentCode: null, antecedentNote: null, consequenceCode: null, consequenceNote: null, durationSeconds: null, intensity: null, note: null });
    const entries = withLabels(readStore());
    const hours = byHour(entries);
    expect(hours[16] + hours[17]).toBe(2);
    expect(hourCaption(hours)).toBe("Most entries: 4pm–6pm");
    const counts = byAntecedent(entries);
    expect(counts[0]).toEqual({ label: "The child was alone", count: 2 });
    expect(antecedentCaption(counts, 3)).toBe("Most often recorded right before: The child was alone (2 of 3)");
    for (const banned of ["because", "trigger", "function", "likely"]) expect(JSON.stringify(counts).toLowerCase()).not.toContain(banned);
  });
});

describe("v1 → v2 migration (one observation, many behaviors)", () => {
  it("merges v1 rows that share the same moment and details into one observation", async () => {
    const { migrateV1 } = await import("@/lib/abc/store");
    const row = (id: string, behaviorId: string, extra: Record<string, unknown> = {}) => ({
      id, behaviorId, occurredAt: "2026-03-02T15:00:00Z", antecedentCode: "instruction_given", antecedentNote: null, consequenceCode: "comfort_offered", consequenceNote: null,
      durationSeconds: 180, intensity: 2, note: null, createdAt: "2026-03-02T15:00:05Z", updatedAt: "2026-03-02T15:00:05Z", ...extra,
    });
    const v1 = { version: 1, child: { nickname: "Bean", createdAt: "x" }, behaviors: [], entries: [row("a", "b1"), row("b", "b2"), row("c", "b1", { occurredAt: "2026-03-03T15:00:00Z", createdAt: "2026-03-03T15:00:05Z" })] };
    const { store, merged } = migrateV1(v1);
    expect(store.version).toBe(2);
    expect(merged).toEqual({ before: 3, after: 2 });
    expect(store.entries[0].behaviorIds).toEqual(["b1", "b2"]);
    expect(store.entries[1].behaviorIds).toEqual(["b1"]);
  });

  it("reads a legacy v1 key once, writes v2, and removes v1", () => {
    clearAll();
    mem.clear();
    mem.set("support-shelf-abc-v1", JSON.stringify({ version: 1, child: { nickname: "Bean", createdAt: "x" }, behaviors: [{ id: "b1", label: "Hitting", isActive: true, createdAt: "x" }], entries: [{ id: "a", behaviorId: "b1", occurredAt: "2026-03-02T15:00:00Z", antecedentCode: null, antecedentNote: null, consequenceCode: null, consequenceNote: null, durationSeconds: null, intensity: null, note: null, createdAt: "y", updatedAt: "y" }] }));
    const s = readStore();
    expect(s.entries[0].behaviorIds).toEqual(["b1"]);
    expect(mem.has("support-shelf-abc-v1")).toBe(false);
    expect(mem.has(STORAGE_KEY)).toBe(true);
    expect(withLabels(s)[0].behaviorLabel).toBe("Hitting");
  });
});

describe("migration review fixes", () => {
  it("keeps rows saved together but edited apart as separate observations", async () => {
    const { migrateV1 } = await import("@/lib/abc/store");
    const base = { occurredAt: "2026-03-02T15:00:00Z", antecedentCode: null, antecedentNote: null, consequenceCode: null, consequenceNote: null, durationSeconds: null, intensity: null, createdAt: "t", updatedAt: "t" };
    const { store } = migrateV1({ version: 1, child: null, behaviors: [], entries: [{ ...base, id: "a", behaviorId: "b1", note: "edited later" }, { ...base, id: "b", behaviorId: "b2", note: null }] });
    expect(store.entries).toHaveLength(2);
    expect(store.entries.map((e) => e.note)).toEqual(["edited later", null]);
  });

  it("keeps migrated data and the v1 key when writing v2 fails", () => {
    clearAll();
    mem.clear();
    mem.set("support-shelf-abc-v1", JSON.stringify({ version: 1, child: { nickname: "Bean", createdAt: "x" }, behaviors: [], entries: [{ id: "a", behaviorId: "b1", occurredAt: "2026-03-02T15:00:00Z", antecedentCode: null, antecedentNote: null, consequenceCode: null, consequenceNote: null, durationSeconds: null, intensity: null, note: null, createdAt: "y", updatedAt: "y" }] }));
    const ls = (globalThis as unknown as { window: { localStorage: { setItem: (k: string, v: string) => void } } }).window.localStorage;
    const original = ls.setItem;
    ls.setItem = () => { throw new Error("QuotaExceededError"); };
    try {
      expect(readStore().entries).toHaveLength(1);
      expect(mem.has("support-shelf-abc-v1")).toBe(true);
    } finally {
      ls.setItem = original;
    }
  });
});
