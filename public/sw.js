/*
 * The Support Shelf — offline support for the calm-down pages only.
 * Precaches /right-now, /for-you, both calming tools and /crisis, plus the
 * static assets those pages reference, so they open with no signal after
 * one visit. Nothing else is cached or intercepted.
 */
const CACHE = "support-shelf-offline-v1";
const PAGES = ["/right-now", "/for-you", "/for-you/breathe", "/for-you/ground", "/crisis"];

async function cachePage(cache, path) {
  const res = await fetch(path, { cache: "no-store", credentials: "same-origin" });
  if (!res.ok) return; // pending pages 404 on production; don't cache those
  const html = await res.clone().text();
  await cache.put(path, res);
  const assets = [...new Set([...html.matchAll(/(?:src|href)="(\/_next\/static\/[^"]+)"/g)].map((m) => m[1]))];
  await Promise.all(assets.map((a) => cache.match(a).then((hit) => hit || cache.add(a).catch(() => {}))));
}

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => Promise.all(PAGES.map((p) => cachePage(cache, p).catch(() => {})))).then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k.startsWith("support-shelf-offline-") && k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  // The five pages: network first (fresh when online), cache when offline.
  if (req.mode === "navigate" && PAGES.includes(url.pathname)) {
    event.respondWith(
      (async () => {
        const cache = await caches.open(CACHE);
        try {
          const res = await fetch(req);
          if (res.ok) event.waitUntil(cachePage(cache, url.pathname).catch(() => {}));
          return res;
        } catch {
          return (await cache.match(url.pathname)) || Response.error();
        }
      })(),
    );
    return;
  }

  // Hashed static assets those pages use: cache first, only if already cached.
  if (url.pathname.startsWith("/_next/static/")) {
    event.respondWith(caches.open(CACHE).then((cache) => cache.match(req).then((hit) => hit || fetch(req))));
  }
});
