"use client";

import type { useRouter } from "next/navigation";

type Router = ReturnType<typeof useRouter>;

/**
 * router.refresh() offline makes Next fall back to a full navigation, which
 * discards the UI the parent is looking at. Refresh only when the save
 * actually reached the server and we're online; queued saves are already
 * rendered from the local queue.
 */
export function refreshIfSynced(router: Router, pendingSync: boolean) {
  if (pendingSync) return;
  if (typeof navigator !== "undefined" && !navigator.onLine) return;
  router.refresh();
}
