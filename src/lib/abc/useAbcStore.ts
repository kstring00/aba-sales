"use client";

import { useSyncExternalStore } from "react";
import { EMPTY, readStore, subscribe } from "./store";
import type { AbcStore } from "./types";

/** React binding. Server render sees EMPTY; the client hydrates from localStorage. */
export function useAbcStore(): { store: AbcStore; hydrated: boolean } {
  const store = useSyncExternalStore(subscribe, readStore, () => EMPTY);
  const hydrated = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
  return { store, hydrated };
}
