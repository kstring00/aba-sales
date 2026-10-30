"use client";

/**
 * Durable offline queue for entry writes.
 *
 * Design in one sentence: every write gets a client-generated UUID and lands
 * in a per-user IndexedDB store first, then is replayed to Supabase with
 * idempotent operations, so a flaky or absent connection never loses a save
 * and a retried save never duplicates one.
 *
 * Properties the parent can rely on:
 *   - "Logged." means the entry is durable on this device even with no signal.
 *   - Replays happen when the app opens, regains connectivity, becomes
 *     visible, or after any successful save. No background-sync dependency.
 *   - Inserts use upsert-ignore-duplicates; deletes tolerate "already gone".
 *   - 4xx responses (RLS, validation) are permanent failures surfaced to the
 *     UI, never retried forever. Network failures retry with backoff.
 *   - The store is keyed by user id. Sign-out and account deletion wipe it;
 *     opening the app as a different user wipes any other user's store.
 */
import { openDB, type DBSchema, type IDBPDatabase } from "idb";
import type { EntryRow } from "@/lib/database.types";
import { deleteEntry, insertEntry, updateEntry, type EntryDraft } from "@/lib/entries/client";

export type OpKind = "insert" | "update" | "delete";
export type OpStatus = "pending" | "syncing" | "failed";

export type QueuedOp = {
  opId: string;
  kind: OpKind;
  entryId: string;
  childId: string;
  userId: string;
  payload: EntryDraft | Partial<EntryDraft> | null;
  /** Full optimistic row so the UI can render it before the server confirms. */
  optimistic: EntryRow | null;
  status: OpStatus;
  attempts: number;
  lastError: string | null;
  createdAt: number;
};

interface QueueDB extends DBSchema {
  ops: {
    key: string;
    value: QueuedOp;
    indexes: { byCreated: number; byEntry: string };
  };
}

const DB_PREFIX = "support-shelf-queue-";
const MAX_NETWORK_ATTEMPTS = 8;

export type SyncSnapshot = {
  online: boolean;
  syncing: boolean;
  pending: QueuedOp[];
  failed: QueuedOp[];
};

type Listener = (s: SyncSnapshot) => void;
const listeners = new Set<Listener>();
let snapshot: SyncSnapshot = { online: true, syncing: false, pending: [], failed: [] };
let dbPromise: Promise<IDBPDatabase<QueueDB>> | null = null;
let currentUserId: string | null = null;
let flushing: Promise<void> | null = null;
let hooksInstalled = false;

function hasIDB() {
  return typeof indexedDB !== "undefined";
}

function dbName(userId: string) {
  return `${DB_PREFIX}${userId}`;
}

async function db(userId: string) {
  if (!dbPromise || currentUserId !== userId) {
    currentUserId = userId;
    dbPromise = openDB<QueueDB>(dbName(userId), 1, {
      upgrade(d) {
        const store = d.createObjectStore("ops", { keyPath: "opId" });
        store.createIndex("byCreated", "createdAt");
        store.createIndex("byEntry", "entryId");
      },
    });
  }
  return dbPromise;
}

function emit() {
  for (const l of listeners) l(snapshot);
}

async function refresh(userId: string) {
  if (!hasIDB()) return;
  const d = await db(userId);
  const all = await d.getAllFromIndex("ops", "byCreated");
  snapshot = {
    ...snapshot,
    online: typeof navigator === "undefined" ? true : navigator.onLine,
    pending: all.filter((o) => o.status !== "failed"),
    failed: all.filter((o) => o.status === "failed"),
  };
  emit();
}

export function subscribe(l: Listener) {
  listeners.add(l);
  l(snapshot);
  return () => {
    listeners.delete(l);
  };
}

export function getSnapshot() {
  return snapshot;
}

/** Call once per signed-in session. Wipes other users' stores, installs hooks, flushes. */
export async function initQueue(userId: string) {
  if (!hasIDB()) return;
  await wipeOtherUsers(userId);
  await refresh(userId);
  if (!hooksInstalled) {
    hooksInstalled = true;
    window.addEventListener("online", () => void flush(userId));
    window.addEventListener("offline", () => {
      snapshot = { ...snapshot, online: false };
      emit();
    });
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") void flush(userId);
    });
  }
  void flush(userId);
}

async function wipeOtherUsers(keepUserId: string) {
  try {
    const list = (await indexedDB.databases?.()) ?? [];
    for (const d of list) {
      if (d.name && d.name.startsWith(DB_PREFIX) && d.name !== dbName(keepUserId)) {
        indexedDB.deleteDatabase(d.name);
      }
    }
  } catch {
    /* Safari < 14 lacks databases(); the per-user key still isolates stores. */
  }
}

/** Sign-out and deletion: remove this user's local records entirely. */
export async function clearQueueForUser(userId: string) {
  if (!hasIDB()) return;
  try {
    if (dbPromise && currentUserId === userId) {
      (await dbPromise).close();
    }
  } catch {
    /* ignore */
  }
  dbPromise = null;
  currentUserId = null;
  await new Promise<void>((resolve) => {
    const req = indexedDB.deleteDatabase(dbName(userId));
    req.onsuccess = req.onerror = req.onblocked = () => resolve();
  });
  snapshot = { online: snapshot.online, syncing: false, pending: [], failed: [] };
  emit();
}

function isNetworkError(e: unknown): boolean {
  if (typeof navigator !== "undefined" && !navigator.onLine) return true;
  if (e instanceof TypeError) return true; // fetch failed
  const msg = e instanceof Error ? e.message : String(e);
  return /fetch failed|network|Failed to fetch|load failed|ECONN|timeout/i.test(msg);
}

async function enqueue(userId: string, op: Omit<QueuedOp, "opId" | "status" | "attempts" | "lastError" | "createdAt">) {
  const d = await db(userId);
  const full: QueuedOp = {
    ...op,
    opId: crypto.randomUUID(),
    status: "pending",
    attempts: 0,
    lastError: null,
    createdAt: Date.now(),
  };
  await d.put("ops", full);
  await refresh(userId);
  return full;
}

export type SubmitResult = { entry: EntryRow; pending: boolean };

function optimisticRow(draft: EntryDraft, userId: string): EntryRow {
  const now = new Date().toISOString();
  return { ...draft, created_by: userId, created_at: now, updated_at: now };
}

export async function submitEntry(draft: EntryDraft, userId: string): Promise<SubmitResult> {
  const optimistic = optimisticRow(draft, userId);
  if (!hasIDB()) {
    return { entry: await insertEntry(draft, userId), pending: false };
  }
  if (typeof navigator !== "undefined" && !navigator.onLine) {
    await enqueue(userId, { kind: "insert", entryId: draft.id, childId: draft.child_id, userId, payload: draft, optimistic });
    return { entry: optimistic, pending: true };
  }
  try {
    const entry = await insertEntry(draft, userId);
    void flush(userId);
    return { entry, pending: false };
  } catch (e) {
    if (!isNetworkError(e)) throw e;
    await enqueue(userId, { kind: "insert", entryId: draft.id, childId: draft.child_id, userId, payload: draft, optimistic });
    return { entry: optimistic, pending: true };
  }
}

export async function submitEntryUpdate(
  id: string,
  patch: Partial<Omit<EntryDraft, "id" | "child_id">>,
  userId: string,
  base?: EntryRow,
): Promise<SubmitResult> {
  const optimistic: EntryRow | null = base ? { ...base, ...patch, updated_at: new Date().toISOString() } : null;
  if (!hasIDB()) return { entry: await updateEntry(id, patch), pending: false };
  const queueIt = async () => {
    const d = await db(userId);
    // If the insert for this entry is still queued, fold the patch into it.
    const existing = (await d.getAllFromIndex("ops", "byEntry", id)).find((o) => o.kind === "insert" && o.status !== "failed");
    if (existing && existing.payload) {
      existing.payload = { ...(existing.payload as EntryDraft), ...patch };
      existing.optimistic = existing.optimistic ? { ...existing.optimistic, ...patch } : existing.optimistic;
      await d.put("ops", existing);
      await refresh(userId);
      return { entry: existing.optimistic ?? (optimistic as EntryRow), pending: true };
    }
    await enqueue(userId, { kind: "update", entryId: id, childId: base?.child_id ?? "", userId, payload: patch, optimistic });
    return { entry: optimistic as EntryRow, pending: true };
  };
  if (typeof navigator !== "undefined" && !navigator.onLine) return queueIt();
  try {
    const entry = await updateEntry(id, patch);
    void flush(userId);
    return { entry, pending: false };
  } catch (e) {
    if (!isNetworkError(e)) throw e;
    return queueIt();
  }
}

export async function submitEntryDelete(id: string, userId: string): Promise<void> {
  if (!hasIDB()) return deleteEntry(id);
  const queueIt = async () => {
    const d = await db(userId);
    // Deleting something that never reached the server: drop its queued ops.
    const ops = await d.getAllFromIndex("ops", "byEntry", id);
    const hadInsert = ops.some((o) => o.kind === "insert");
    for (const o of ops) await d.delete("ops", o.opId);
    if (!hadInsert) {
      await enqueue(userId, { kind: "delete", entryId: id, childId: "", userId, payload: null, optimistic: null });
    } else {
      await refresh(userId);
    }
  };
  if (typeof navigator !== "undefined" && !navigator.onLine) return queueIt();
  try {
    await deleteEntry(id);
    void flush(userId);
  } catch (e) {
    if (!isNetworkError(e)) throw e;
    await queueIt();
  }
}

/** Replay queued ops in order. Safe to call often; concurrent calls coalesce. */
export function flush(userId: string): Promise<void> {
  if (flushing) return flushing;
  flushing = (async () => {
    if (!hasIDB()) return;
    if (typeof navigator !== "undefined" && !navigator.onLine) {
      await refresh(userId);
      return;
    }
    const d = await db(userId);
    const ops = (await d.getAllFromIndex("ops", "byCreated")).filter((o) => o.status !== "failed");
    if (ops.length === 0) {
      await refresh(userId);
      return;
    }
    snapshot = { ...snapshot, syncing: true };
    emit();
    for (const op of ops) {
      op.status = "syncing";
      await d.put("ops", op);
      try {
        if (op.kind === "insert") await insertEntry(op.payload as EntryDraft, userId);
        else if (op.kind === "update") await updateEntry(op.entryId, op.payload as Partial<EntryDraft>);
        else await deleteEntry(op.entryId);
        await d.delete("ops", op.opId);
      } catch (e) {
        op.attempts += 1;
        op.lastError = e instanceof Error ? e.message : String(e);
        if (isNetworkError(e)) {
          op.status = op.attempts >= MAX_NETWORK_ATTEMPTS ? "failed" : "pending";
          await d.put("ops", op);
          break; // offline again; stop and wait for the next trigger
        }
        // Permanent (RLS, validation, not found on update): surface it.
        op.status = "failed";
        await d.put("ops", op);
      }
    }
    snapshot = { ...snapshot, syncing: false };
    await refresh(userId);
  })().finally(() => {
    flushing = null;
  });
  return flushing;
}

export async function retryFailed(userId: string) {
  if (!hasIDB()) return;
  const d = await db(userId);
  for (const op of await d.getAll("ops")) {
    if (op.status === "failed") {
      op.status = "pending";
      op.attempts = 0;
      await d.put("ops", op);
    }
  }
  await flush(userId);
}

export async function discardOp(userId: string, opId: string) {
  if (!hasIDB()) return;
  const d = await db(userId);
  await d.delete("ops", opId);
  await refresh(userId);
}
