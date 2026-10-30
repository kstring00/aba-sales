"use client";

import { createContext, useContext, useEffect, useSyncExternalStore, type ReactNode } from "react";
import { getSnapshot, initQueue, subscribe, type SyncSnapshot } from "@/lib/entries/queue";

const SyncContext = createContext<SyncSnapshot>({ online: true, syncing: false, pending: [], failed: [] });

export function useSync() {
  return useContext(SyncContext);
}

const SERVER_SNAPSHOT: SyncSnapshot = { online: true, syncing: false, pending: [], failed: [] };

export function SyncProvider({ userId, children }: { userId: string; children: ReactNode }) {
  const snap = useSyncExternalStore(subscribe, getSnapshot, () => SERVER_SNAPSHOT);

  useEffect(() => {
    void initQueue(userId);
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js", { scope: "/" }).catch(() => {});
    }
  }, [userId]);

  return <SyncContext.Provider value={snap}>{children}</SyncContext.Provider>;
}
