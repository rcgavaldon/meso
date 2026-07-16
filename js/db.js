/* Meso — storage.
 *
 * IndexedDB is the system of record. localStorage holds ONLY prefs (current user, gym, sync URL).
 * Why: a compact set record is ~53 bytes; 2 users × 4 sessions/wk × 20 sets ≈ 215KB/user/year,
 * ~4.2MB over 10 years. localStorage's ~5MB quota counts UTF-16 code units, so real headroom is
 * about half that — we'd hit the wall around year 3-5, silently, mid-write. It's also synchronous,
 * which is jank on every set log.
 *
 * The phone is a cache. The Sheet is the system of record. See sync() in app.js.
 */
window.DB = (() => {
  const NAME = "meso", VER = 1;
  let _db = null;

  function open() {
    if (_db) return Promise.resolve(_db);
    return new Promise((res, rej) => {
      const r = indexedDB.open(NAME, VER);
      /* ⚠️ Without these two, a blocked open NEVER SETTLES — no resolve, no reject, no error.
         The app sits on "Loading…" forever and the console is clean, which is the worst possible
         failure: it looks broken rather than buggy, and there's nothing to report.
         IndexedDB blocks whenever another connection holds the DB across a version change or a
         pending deleteDatabase. Rare, but "rare + silent + unrecoverable" is how you lose a user
         permanently. Fail loudly instead. */
      r.onblocked = () => rej(new Error(
        "The database is locked by another open tab. Close Meso's other tabs and reload."));
      const watchdog = setTimeout(() => rej(new Error(
        "Storage didn't open in time. Close other Meso tabs and reload — your data is safe.")), 8000);
      const done = fn => (...a) => { clearTimeout(watchdog); return fn(...a); };
      r.onupgradeneeded = e => {
        const db = e.target.result;
        // kv: prefs-adjacent app state that isn't per-session (users, gyms, settings)
        if (!db.objectStoreNames.contains("kv")) db.createObjectStore("kv", { keyPath: "k" });
        // meso: one row per mesocycle, per user
        if (!db.objectStoreNames.contains("meso")) {
          const s = db.createObjectStore("meso", { keyPath: "id" });
          s.createIndex("user", "userId");
        }
        // session: one row per (user, meso, week, day). Sets embedded — they're small and
        // always read together.
        if (!db.objectStoreNames.contains("session")) {
          const s = db.createObjectStore("session", { keyPath: "id" });
          s.createIndex("user", "userId");
          s.createIndex("meso", "mesoId");
        }
        // loadState: per (user, exercise[, instance]) — the progression memory that RP throws
        // away every mesocycle. Keyed separately so it SURVIVES meso boundaries.
        if (!db.objectStoreNames.contains("loadState")) {
          db.createObjectStore("loadState", { keyPath: "k" });
        }
      };
      r.onsuccess = done(() => {
        _db = r.result;
        // If another tab later needs a version change, don't be the connection that blocks it.
        _db.onversionchange = () => { try { _db.close(); } catch (_) {} _db = null; };
        res(_db);
      });
      r.onerror = done(() => rej(r.error || new Error("Storage failed to open")));
    });
  }

  function tx(store, mode, fn) {
    return open().then(db => new Promise((res, rej) => {
      const t = db.transaction(store, mode);
      const s = t.objectStore(store);
      let out;
      const rq = fn(s);
      if (rq) rq.onsuccess = () => { out = rq.result; };
      t.oncomplete = () => res(out);
      t.onerror = t.onabort = () => rej(t.error);
    }));
  }

  const get = (store, k) => tx(store, "readonly", s => s.get(k));
  const put = (store, v) => tx(store, "readwrite", s => s.put(v));
  const del = (store, k) => tx(store, "readwrite", s => s.delete(k));
  const all = (store, idx, val) => tx(store, "readonly", s =>
    idx ? s.index(idx).getAll(val) : s.getAll());

  // ---- prefs: localStorage is fine here. Small, sync-read at boot, disposable. ----
  const P = "meso.";
  const pref = {
    get: (k, d) => { try { const v = localStorage.getItem(P + k); return v === null ? d : JSON.parse(v); } catch (_) { return d; } },
    set: (k, v) => { try { localStorage.setItem(P + k, JSON.stringify(v)); } catch (_) {} },
    del: k => { try { localStorage.removeItem(P + k); } catch (_) {} }
  };

  /* Ask the browser to not evict us. Treat the grant as a nice-to-have and NEVER build
     durability on it — iOS eviction behavior for home-screen PWAs shifts between Safari
     versions. Real durability is the Sheet. */
  async function persist() {
    try {
      if (navigator.storage && navigator.storage.persist) {
        if (await navigator.storage.persisted()) return true;
        return await navigator.storage.persist();
      }
    } catch (_) {}
    return false;
  }

  async function estimate() {
    try { return await navigator.storage.estimate(); } catch (_) { return null; }
  }

  /* Full per-user export — what gets snapshotted to the Sheet and what "Export JSON" writes. */
  async function exportUser(userId) {
    const [mesos, sessions, loads, kv] = await Promise.all([
      all("meso", "user", userId), all("session", "user", userId),
      all("loadState"), all("kv")
    ]);
    return {
      v: 1, userId, at: new Date().toISOString(),
      mesos, sessions,
      loadState: loads.filter(l => l.k.startsWith(userId + "|")),
      gyms: (kv.find(x => x.k === "gyms") || {}).v || [],
      users: (kv.find(x => x.k === "users") || {}).v || []
    };
  }

  async function importUser(blob) {
    if (!blob || blob.v !== 1) throw new Error("Unrecognized backup format");
    for (const m of blob.mesos || []) await put("meso", m);
    for (const s of blob.sessions || []) await put("session", s);
    for (const l of blob.loadState || []) await put("loadState", l);
    if (blob.gyms && blob.gyms.length) await put("kv", { k: "gyms", v: blob.gyms });
    if (blob.users && blob.users.length) await put("kv", { k: "users", v: blob.users });
    return true;
  }

  return { open, get, put, del, all, pref, persist, estimate, exportUser, importUser };
})();
