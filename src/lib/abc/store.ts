"use client";

/**
 * The ABC logger's only storage: localStorage, one key, one JSON blob.
 * Decision: no backend at all, so "nothing leaves your phone" is literally
 * true and there is nothing on our side to protect or breach.
 */
import type { AbcStore, Behavior, Entry, EntryWithBehavior } from "./types";
import { SEED_BEHAVIORS } from "@/lib/observation";

export const STORAGE_KEY = "support-shelf-abc-v2";
/** The pre-F-04 key: one row per behavior. Migrated once, then removed. */
export const LEGACY_KEY = "support-shelf-abc-v1";

export const EMPTY: AbcStore = { version: 2, child: null, behaviors: [], entries: [] };

type Listener = () => void;
const listeners = new Set<Listener>();
let memory: AbcStore | null = null;

function canStore() {
  try {
    return typeof window !== "undefined" && Boolean(window.localStorage);
  } catch {
    return false;
  }
}

export function readStore(): AbcStore {
  if (memory) return memory;
  if (!canStore()) return EMPTY;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      memory = migrate(JSON.parse(raw));
    } else {
      const legacy = window.localStorage.getItem(LEGACY_KEY);
      if (legacy) {
        const { store, merged } = migrateV1(JSON.parse(legacy));
        memory = store;
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
        window.localStorage.removeItem(LEGACY_KEY);
        console.info(`[abc] migrated ${merged.before} entries into ${merged.after} observations (v1 → v2)`);
      } else {
        memory = EMPTY;
      }
    }
  } catch {
    memory = EMPTY;
  }
  return memory;
}

type LegacyEntry = Omit<Entry, "behaviorIds"> & { behaviorId?: string; behaviorIds?: string[] };

/** Accepts a v2 blob (or a v1 blob that somehow sits under the v2 key). */
function migrate(data: unknown): AbcStore {
  if (!data || typeof data !== "object") return EMPTY;
  const d = data as Partial<AbcStore> & { version?: number; entries?: LegacyEntry[] };
  if (d.version !== 2) return migrateV1(d).store;
  return {
    version: 2,
    child: d.child ?? null,
    behaviors: Array.isArray(d.behaviors) ? d.behaviors : [],
    entries: Array.isArray(d.entries) ? d.entries.map(normalizeEntry) : [],
  };
}

function normalizeEntry(e: LegacyEntry): Entry {
  const { behaviorId, behaviorIds, ...rest } = e;
  const ids = Array.isArray(behaviorIds) ? behaviorIds : behaviorId ? [behaviorId] : [];
  return { ...rest, behaviorIds: [...new Set(ids)] };
}

/**
 * v1 saved one row per behavior. Rows that share the same moment and the
 * same before/after details (and were created in the same save) are one
 * observation; merge their behaviors (audit F-04).
 */
export function migrateV1(data: unknown): { store: AbcStore; merged: { before: number; after: number } } {
  if (!data || typeof data !== "object") return { store: EMPTY, merged: { before: 0, after: 0 } };
  const d = data as Partial<AbcStore> & { entries?: LegacyEntry[] };
  const rows = Array.isArray(d.entries) ? d.entries.map(normalizeEntry) : [];
  const byKey = new Map<string, Entry>();
  for (const e of rows) {
    const key = [e.occurredAt, e.antecedentCode, e.antecedentNote, e.consequenceCode, e.consequenceNote, e.createdAt].join("|");
    const existing = byKey.get(key);
    if (existing) {
      existing.behaviorIds = [...new Set([...existing.behaviorIds, ...e.behaviorIds])];
      if (e.updatedAt > existing.updatedAt) existing.updatedAt = e.updatedAt;
    } else {
      byKey.set(key, { ...e });
    }
  }
  const entries = [...byKey.values()];
  return {
    store: { version: 2, child: d.child ?? null, behaviors: Array.isArray(d.behaviors) ? d.behaviors : [], entries },
    merged: { before: rows.length, after: entries.length },
  };
}

function write(next: AbcStore) {
  memory = next;
  if (canStore()) {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      /* quota or private mode: keep the in-memory copy so the session still works */
    }
  }
  for (const l of listeners) l();
}

export function subscribe(l: Listener) {
  listeners.add(l);
  const onStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) {
      memory = null;
      l();
    }
  };
  if (typeof window !== "undefined") window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(l);
    if (typeof window !== "undefined") window.removeEventListener("storage", onStorage);
  };
}

const now = () => new Date().toISOString();
const uid = () => (typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`);

// ── Child ────────────────────────────────────────────────────────────────────
export function setChild(nickname: string, seedLabels: string[] = SEED_BEHAVIORS) {
  const s = readStore();
  const behaviors = s.behaviors.length ? s.behaviors : seedLabels.map((label) => ({ id: uid(), label, isActive: true, createdAt: now() }));
  write({ ...s, child: { nickname: nickname.trim().slice(0, 40), createdAt: s.child?.createdAt ?? now() }, behaviors });
}

export function renameChild(nickname: string) {
  const s = readStore();
  if (!s.child) return;
  write({ ...s, child: { ...s.child, nickname: nickname.trim().slice(0, 40) } });
}

// ── Behaviors ────────────────────────────────────────────────────────────────
export function addBehavior(label: string): Behavior {
  const s = readStore();
  const clean = label.trim().slice(0, 60);
  const existing = s.behaviors.find((b) => b.label.toLowerCase() === clean.toLowerCase());
  if (existing) {
    if (!existing.isActive) setBehaviorActive(existing.id, true);
    return existing;
  }
  const b: Behavior = { id: uid(), label: clean, isActive: true, createdAt: now() };
  write({ ...s, behaviors: [...s.behaviors, b] });
  return b;
}

export function renameBehavior(id: string, label: string) {
  const s = readStore();
  write({ ...s, behaviors: s.behaviors.map((b) => (b.id === id ? { ...b, label: label.trim().slice(0, 60) } : b)) });
}

export function setBehaviorActive(id: string, isActive: boolean) {
  const s = readStore();
  write({ ...s, behaviors: s.behaviors.map((b) => (b.id === id ? { ...b, isActive } : b)) });
}

/** Deleting a label is allowed only when no observation uses it; otherwise hide it. */
export function deleteBehavior(id: string): boolean {
  const s = readStore();
  if (s.entries.some((e) => e.behaviorIds.includes(id))) return false;
  write({ ...s, behaviors: s.behaviors.filter((b) => b.id !== id) });
  return true;
}

// ── Entries ──────────────────────────────────────────────────────────────────
export type EntryInput = Omit<Entry, "id" | "createdAt" | "updatedAt"> & { id?: string };

export function addEntry(input: EntryInput): Entry {
  const s = readStore();
  const t = now();
  const e: Entry = { ...input, behaviorIds: [...new Set(input.behaviorIds)], id: input.id ?? uid(), createdAt: t, updatedAt: t };
  write({ ...s, entries: [e, ...s.entries.filter((x) => x.id !== e.id)] });
  return e;
}

export function updateEntry(id: string, patch: Partial<Omit<Entry, "id" | "createdAt">>): Entry | null {
  const s = readStore();
  let out: Entry | null = null;
  const entries = s.entries.map((e) => {
    if (e.id !== id) return e;
    out = { ...e, ...patch, updatedAt: now() };
    return out;
  });
  write({ ...s, entries });
  return out;
}

export function deleteEntry(id: string) {
  const s = readStore();
  write({ ...s, entries: s.entries.filter((e) => e.id !== id) });
}

/** Everything. Used by "Delete everything" after two confirmations. */
export function clearAll() {
  // Forget the cache too, so the next read goes back to storage (which is now empty).
  memory = null;
  if (canStore()) {
    try {
      window.localStorage.removeItem(STORAGE_KEY);
      window.localStorage.removeItem(LEGACY_KEY);
    } catch {
      /* ignore */
    }
  }
  for (const l of listeners) l();
}

/** Join observations with their labels for views and exports. */
export function withLabels(s: AbcStore): EntryWithBehavior[] {
  const byId = new Map(s.behaviors.map((b) => [b.id, b.label]));
  return s.entries.map((e) => {
    const behaviorLabels = e.behaviorIds.map((id) => byId.get(id) ?? "").filter(Boolean);
    return { ...e, behaviorLabels, behaviorLabel: behaviorLabels.join("; ") };
  });
}

/** Estimated size of what's stored, for the "export first" nudge. */
export function storageBytes(): number {
  if (!canStore()) return 0;
  try {
    return (window.localStorage.getItem(STORAGE_KEY) ?? "").length;
  } catch {
    return 0;
  }
}
