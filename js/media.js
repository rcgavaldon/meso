/* Meso — exercise demo clips.
 *
 * The problem: the app is offline-first because a gym is a dead-signal concrete box, and that
 * rules out hotlinking media at the moment you need it. But 130 exercise clips can't ship in the
 * bundle either.
 *
 * Robert's answer, and it's the right one: he always has signal at home. So PRELOAD — when a
 * mesocycle is built (and on each week rollover), fetch the clips for THIS WEEK's exercises plus
 * their likely alternates into a service-worker cache. In the gym they're already local. The
 * network is never in the path when it matters.
 *
 * Hosting: his existing Cloudinary (cloud `dbkmspkv2`, unsigned preset `sprout_unsigned`) — the
 * same one Nina's garden app already uploads to from her phone. Cloud name + unsigned preset are
 * public-safe (no API secret), which is why they can live in client code.
 *
 * ⚠️ MP4, not GIF. A 3-second exercise loop is ~1.5MB as a GIF and ~120KB as an h264 mp4 — Cloudinary
 * transcodes on delivery, so we upload once and ask for mp4. 130 exercises × ~120KB ≈ 15MB total,
 * and we only ever cache the ~20 in the current week. `f_auto` lets Cloudinary pick webm/mp4 per
 * browser. `<video muted loop playsinline autoplay>` renders it exactly like a GIF, but seekable
 * and an order of magnitude smaller.
 */
window.MEDIA = (() => {
  const CLOUD = "dbkmspkv2";
  const BASE = `https://res.cloudinary.com/${CLOUD}`;
  const FOLDER = "meso/ex";
  const CACHE = "meso-media-v1";

  /* ⚠️ Upload as an IMAGE (animated gif), deliver as mp4. Cloudinary's video/upload endpoint
     REJECTS gif ("Unsupported file type gif") — animated images belong on image/upload, and
     f_mp4 transcodes them on delivery. Verified on this cloud: a 12-frame probe came back
     9,429b as gif and 3,539b as mp4 (2.7x smaller), with a 1,508b jpg poster. */
  const clip = id => `${BASE}/image/upload/f_mp4,q_auto,w_400/${FOLDER}/${id}.gif`;
  /* Real FOOTAGE lives in a second namespace: video/upload at meso/exv/{id}. Pexels/Pixabay/
     YouTube-CC captures are true mp4s — the image endpoint won't take them, and they deserve
     better than being squashed into 2-frame gifs. toggleDemo tries footage first, then the
     illustration, then the poster, then a quiet note. eo_6 caps every clip at 6 seconds: a demo
     is a loop, not a lecture, and phone cache space is a budget. */
  const clipV = id => `${BASE}/video/upload/so_0,eo_6,w_400,q_auto,f_mp4/meso/exv/${id}.mp4`;
  const posterV = id => `${BASE}/video/upload/so_1,w_200,q_auto,f_jpg/meso/exv/${id}.jpg`;
  const poster = id => `${BASE}/image/upload/so_0,f_jpg,q_auto,w_200/${FOLDER}/${id}.gif`;
  /** Machine photo for the "What's here?" checklist — a still is enough to recognize a machine. */
  const machine = key => `${BASE}/image/upload/f_auto,q_auto,w_320/meso/machine/${key}.jpg`;
  /* Upload helper — unsigned preset, same one Nina's garden app already uses from her phone.
     Cloud name + unsigned preset are public-safe (no API secret), which is why they ship in
     client code. `public_id` is the exercise id, so the delivery URL is fully predictable and
     nothing needs a manifest. */
  async function upload(file, id, kind) {
    const fd = new FormData();
    fd.append("file", file);
    fd.append("upload_preset", "sprout_unsigned");
    fd.append("public_id", `${kind === "machine" ? "meso/machine" : FOLDER}/${id}`);
    const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD}/image/upload`, { method:"POST", body: fd });
    const j = await res.json();
    if (j.error) throw new Error(j.error.message);
    return j.public_id;
  }

  const has = async url => {
    try { const c = await caches.open(CACHE); return !!(await c.match(url)); } catch (_) { return false; }
  };

  /**
   * Cache a list of URLs. Failures are silent and individual: a missing clip must never break a
   * workout, and most of these WILL 404 until the library is uploaded.
   * @returns {cached, missing}
   */
  async function precache(urls) {
    let cached = 0, missing = 0;
    try {
      const c = await caches.open(CACHE);
      await Promise.all([...new Set(urls)].map(async u => {
        try {
          if (await c.match(u)) { cached++; return; }
          const res = await fetch(u, { mode: "cors" });
          if (res && res.ok) { await c.put(u, res); cached++; } else missing++;
        } catch (_) { missing++; }
      }));
    } catch (_) {}
    return { cached, missing };
  }

  /**
   * Preload THIS WEEK's exercises plus their alternates.
   *
   * Alternates matter as much as the prescription: the whole point of the equipment engine is that
   * you tap "Swap" when a machine is taken — and that's exactly the moment you're standing in a
   * dead-signal gym wanting to know what the thing looks like. Prefetching only what's prescribed
   * would cache the clips you need least.
   */
  async function prefetchWeek(session, gym, user, lib, engine) {
    if (!navigator.onLine || !session) return { skipped: "offline" };
    const ids = new Set();
    for (const st of session.sets || []) ids.add(st.exId);
    // ...plus the top alternates for each slot, which is what Swap will offer.
    for (const st of session.sets || []) {
      try {
        const slot = { muscle: st.muscle, repRange: st.repRange || [8, 12], rir: st.rir, exId: st.exId, position: 1 };
        const pick = engine.selectForSlot(slot, gym, user, { chosen: [], fatigueSpent: .3, occupied: new Set() }, lib);
        [pick.primary, ...(pick.backups || [])].filter(Boolean).slice(0, 4).forEach(c => ids.add(c.ex.id));
      } catch (_) {}
    }
    const urls = [];
    // Both namespaces — whichever exists gets cached, the other just counts as missing.
    for (const id of ids) { urls.push(clipV(id)); urls.push(clip(id)); urls.push(poster(id)); }
    const r = await precache(urls);
    return Object.assign({ exercises: ids.size }, r);
  }

  /** Wipe the media cache — it's disposable by design; the training data is not. */
  const clear = async () => { try { await caches.delete(CACHE); } catch (_) {} };
  const size = async () => {
    try { const c = await caches.open(CACHE); return (await c.keys()).length; } catch (_) { return 0; }
  };

  return { CLOUD, CACHE, clip, clipV, poster, posterV, machine, upload, has, precache, prefetchWeek, clear, size };
})();
