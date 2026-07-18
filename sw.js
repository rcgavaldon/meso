/* Meso service worker — cache-first app shell.
 *
 * NOTE vs garden-tracker/sw.js: Sprout deliberately does NO fetch caching ("so the app never
 * goes stale"). That is the right call for a backyard on wifi. A gym is a dead-signal concrete
 * box — copying that forward white-screens you mid-workout. So we cache, and we keep the
 * never-stale property a different way: a versioned cache + an explicit "update ready" prompt.
 * Bump CACHE on every deploy.
 */
const CACHE = "meso-v52";
const SHELL = [
  "./",
  "index.html",
  "manifest.webmanifest",
  "data/exercises.js",
  "js/db.js",
  "js/engine.js",
  "js/app.js",
  "data/demo-alias.js",
  "js/media.js",
  "icon-192.png",
  "icon-512.png"
];

self.addEventListener("install", e => {
  // Do NOT skipWaiting here — the page decides when to swap, so a workout is never
  // reloaded out from under you mid-set.
  //
  // ⚠️ NOT cache.addAll(SHELL). addAll fetches through the browser's own HTTP cache, so a stale
  // copy can get baked into the versioned cache PERMANENTLY — and bumping CACHE won't save you,
  // because the next install re-fetches the same stale bytes. You ship a fix and the phone keeps
  // running the old code with a clean console. `cache: "reload"` forces the network.
  e.waitUntil((async () => {
    const c = await caches.open(CACHE);
    await Promise.all(SHELL.map(async u => {
      try {
        const res = await fetch(u, { cache: "reload" });
        if (res && res.ok) await c.put(u, res);
      } catch (_) { /* one missing file must not abort the whole install */ }
    }));
  })());
});

self.addEventListener("activate", e => {
  e.waitUntil((async () => {
    const keys = await caches.keys();
    // ⚠️ Keep the media cache. It's keyed independently of the app-shell version, and it holds
    // megabytes the user paid for on their home wifi — nuking it on every deploy would silently
    // re-download the week's clips, quite possibly in the gym parking lot.
    await Promise.all(keys.filter(k => k !== CACHE && !k.startsWith("meso-media"))
                          .map(k => caches.delete(k)));
    await self.clients.claim();
  })());
});

self.addEventListener("message", e => { if (e.data === "skip") self.skipWaiting(); });

self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;

  const url = new URL(req.url);

  /* Exercise clips live in their own cache, filled deliberately by MEDIA.prefetchWeek() when the
     phone has signal — NOT opportunistically here. Serve from that cache if it's there, otherwise
     let it hit the network and fail quietly. A missing clip must never break a workout. */
  if (/res\.cloudinary\.com/.test(url.hostname)) {
    e.respondWith((async () => {
      const hit = await caches.match(req);
      if (hit) return hit;
      try { return await fetch(req); } catch (_) { return new Response("", { status: 504 }); }
    })());
    return;
  }

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
