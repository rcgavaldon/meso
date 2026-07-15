/* Meso service worker — cache-first app shell.
 *
 * NOTE vs garden-tracker/sw.js: Sprout deliberately does NO fetch caching ("so the app never
 * goes stale"). That is the right call for a backyard on wifi. A gym is a dead-signal concrete
 * box — copying that forward white-screens you mid-workout. So we cache, and we keep the
 * never-stale property a different way: a versioned cache + an explicit "update ready" prompt.
 * Bump CACHE on every deploy.
 */
const CACHE = "meso-v3";
const SHELL = [
  "./",
  "index.html",
  "manifest.webmanifest",
  "data/exercises.js",
  "js/db.js",
  "js/engine.js",
  "js/app.js",
  "icon-192.png",
  "icon-512.png"
];

self.addEventListener("install", e => {
  // Do NOT skipWaiting here — the page decides when to swap, so a workout is never
  // reloaded out from under you mid-set.
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).catch(() => {}));
});

self.addEventListener("activate", e => {
  e.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)));
    await self.clients.claim();
  })());
});

self.addEventListener("message", e => { if (e.data === "skip") self.skipWaiting(); });

self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;

  const url = new URL(req.url);
  // Never cache the Apps Script sync endpoint — it must always hit the network or fail loudly.
  if (url.origin !== location.origin) return;

  e.respondWith((async () => {
    const cached = await caches.match(req, { ignoreSearch: true });
    if (cached) {
      // Refresh in the background so the next launch is current, but serve instantly now.
      fetch(req).then(res => {
        if (res && res.ok) caches.open(CACHE).then(c => c.put(req, res.clone()));
      }).catch(() => {});
      return cached;
    }
    try {
      const res = await fetch(req);
      if (res && res.ok) { const c = await caches.open(CACHE); c.put(req, res.clone()); }
      return res;
    } catch (_) {
      // Navigation offline with a cold cache → fall back to the shell.
      if (req.mode === "navigate") {
        const shell = await caches.match("index.html");
        if (shell) return shell;
      }
      return new Response("", { status: 504, statusText: "offline" });
    }
  })());
});
