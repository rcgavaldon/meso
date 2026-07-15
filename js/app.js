/* Meso — UI. Rendering, routing, and the in-gym logging loop. */
window.MESO = (() => {
const E = window.ENGINE, LIB = () => window.MESO_EXERCISES || [];
const $ = s => document.querySelector(s);
const el = (t, a, h) => { const n = document.createElement(t); if (a) for (const k in a) k === "class" ? n.className = a[k] : n.setAttribute(k, a[k]); if (h != null) n.innerHTML = h; return n; };
const esc = s => String(s == null ? "" : s).replace(/[&<>"']/g, c => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;" }[c]));
const today = () => new Date().toISOString().slice(0, 10);
const uid = () => Math.random().toString(36).slice(2, 9);

const S = {                       // in-memory app state
  tab: "workout", users: [], gyms: [], user: null, gym: null,
  meso: null, session: null, sessions: [], loadState: {},
  occupied: new Set(), rest: null
};

/* ============ tiny helpers ============ */
let toastT;
function toast(msg, ms = 2200) {
  const t = $("#toast"); t.textContent = msg; t.classList.add("on");
  clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove("on"), ms);
}
function updateReady(apply) {
  const t = $("#toast");
  t.innerHTML = 'Update ready — <b style="color:var(--p)">tap to reload</b>';
  t.classList.add("on"); t.style.pointerEvents = "auto";
  t.onclick = () => apply();
}
const mgColor = m => E.CAT_COLOR[E.CATEGORY[m]] || "var(--acc)";
function bars(n) { return `<span class="bars">${[1,2,3].map(i => `<i class="${i<=n?"":"off"}"></i>`).join("")}</span>`; }
function mgPill(m, emph) {
  const c = mgColor(m), n = { maintain:1, grow:2, emphasize:3 }[emph] || 2;
  return `<span class="mg" style="color:${c};background:color-mix(in srgb, ${c} 20%, transparent)">${bars(n)}${esc(E.MG_LABEL[m]||m)}</span>`;
}
const ICON = {
  workout:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M6.5 6.5v11M17.5 6.5v11M3 9v6M21 9v6M6.5 12h11"/></svg>',
  mesos:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>',
  gyms:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M3 21V8l9-5 9 5v13M9 21v-6h6v6"/></svg>',
  exercises:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M4 6h16M4 12h16M4 18h10"/></svg>',
  more:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="5" cy="12" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="19" cy="12" r="1.6"/></svg>',
  check:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M4 12.5l5 5L20 6.5"/></svg>'
};

/* ============ seed data ============ */
/* Phase 1: the program is a JSON seed you edit, not a builder UI. Deliberate — a program
   builder is a week of work that you'd use twice a year. */
const SEED_GYMS = [
  { gym_id:"home", name:"Home Garage", scope:"household",
    constraints:{ ceiling_height_in:96, noise_limit:true, solo_training:true },
    equipment:[
      { instance_id:"h_bb", type:"barbell", caps:["barbell"], bar_weight:45,
        plates:{ unit:"lb", inventory:{ "45":4, "25":2, "10":4, "5":4, "2.5":2 } },
        load:{ kind:"plate_loaded", min:45, max:9999, increment:5 }, load_portability:"absolute", count:1, contention:"low" },
      { instance_id:"h_db", type:"dumbbell_set", caps:["dumbbell"],
        load:{ kind:"adjustable", min:5, max:52.5, increment:2.5, unit:"lb", per_hand:true, pairs:true },
        load_portability:"absolute", count:1, contention:"low" },
      { instance_id:"h_rack", type:"rack", caps:["squat_rack","pullup_bar","safety_arms"],
        attrs:{ safety_arms:true }, count:1, contention:"low" },
      { instance_id:"h_bench", type:"bench", caps:["bench","adjustable_bench"],
        attrs:{ adjustable:true, angles:[0,15,30,45,60,75,85] }, count:1, contention:"low" },
      { instance_id:"h_band", type:"band_set", caps:["band","machine_assistance"],
        load:{ kind:"variable", levels:["light","medium","heavy"], approx_lb:[15,35,60] },
        load_portability:"absolute", contention:"low" }
    ] },
  { gym_id:"commercial", name:"Commercial Gym", scope:"household",
    constraints:{ solo_training:false },
    equipment:[
      { instance_id:"c_bb", type:"barbell", caps:["barbell"], bar_weight:45,
        load:{ kind:"plate_loaded", min:45, max:495, increment:5 }, load_portability:"absolute", count:3, contention:"low" },
      { instance_id:"c_db", type:"dumbbell_set", caps:["dumbbell"],
        load:{ kind:"fixed_pairs", min:5, max:120, increment:5, per_hand:true, pairs:true },
        load_portability:"absolute", contention:"low" },
      { instance_id:"c_cable", type:"cable_station", caps:["cable","freemotion","machine_assistance","high_pulley","low_pulley"],
        attrs:{ pulley_height:"adjustable" }, attachments:["rope","straight_bar","d_handle","ez_bar","ankle_strap","lat_bar"],
        load:{ kind:"selectorized_stack", min:10, max:200, increment:10, add_on:[2.5,5] },
        load_portability:"machine_relative", count:2, contention:"med" },
      { instance_id:"c_rack", type:"rack", caps:["squat_rack","pullup_bar","safety_arms","dip_station"],
        attrs:{ safety_arms:true }, count:2, contention:"low" },
      { instance_id:"c_bench", type:"bench", caps:["bench","adjustable_bench"],
        attrs:{ adjustable:true, angles:[0,15,30,45,60,75,85] }, count:4, contention:"low" },
      { instance_id:"c_smith", type:"smith", caps:["smith"], bar_weight:15, bar_weight_estimated:true,
        load:{ kind:"plate_loaded", min:15, max:495, increment:2.5 }, load_portability:"machine_relative", count:1, contention:"med" },
      { instance_id:"c_pec", type:"machine", machine_key:"pec_deck", caps:["machine","pec_deck"],
        load:{ kind:"selectorized_stack", min:15, max:250, increment:15 }, load_portability:"machine_relative", count:1, contention:"high" },
      { instance_id:"c_lat", type:"machine", machine_key:"lat_pulldown", caps:["machine","lat_pulldown"],
        load:{ kind:"selectorized_stack", min:10, max:250, increment:10 }, load_portability:"machine_relative", count:1, contention:"high" },
      { instance_id:"c_row", type:"machine", machine_key:"seated_row", caps:["machine","seated_row"],
        load:{ kind:"selectorized_stack", min:10, max:250, increment:10 }, load_portability:"machine_relative", count:1, contention:"med" },
      { instance_id:"c_legpress", type:"machine", machine_key:"leg_press", caps:["machine","leg_press"],
        load:{ kind:"plate_loaded", carriage_weight:65, min:65, max:700, increment:5 }, load_portability:"machine_relative", count:1, contention:"med" },
      { instance_id:"c_hack", type:"machine", machine_key:"hack_squat", caps:["machine","hack_squat"],
        load:{ kind:"plate_loaded", carriage_weight:65, min:65, max:700, increment:5 }, load_portability:"machine_relative", count:1, contention:"med" },
      { instance_id:"c_ext", type:"machine", machine_key:"leg_extension", caps:["machine","leg_extension"],
        load:{ kind:"selectorized_stack", min:10, max:250, increment:10 }, load_portability:"machine_relative", count:1, contention:"med" },
      { instance_id:"c_curl", type:"machine", machine_key:"leg_curl_seated", caps:["machine","leg_curl_seated"],
        load:{ kind:"selectorized_stack", min:10, max:200, increment:10 }, load_portability:"machine_relative", count:1, contention:"med" },
      { instance_id:"c_calf", type:"machine", machine_key:"calf_raise_seated", caps:["machine","calf_raise_seated"],
        load:{ kind:"plate_loaded", min:0, max:300, increment:5 }, load_portability:"machine_relative", count:1, contention:"low" },
      { instance_id:"c_rear", type:"machine", machine_key:"rear_delt_machine", caps:["machine","rear_delt_machine"],
        load:{ kind:"selectorized_stack", min:15, max:200, increment:15 }, load_portability:"machine_relative", count:1, contention:"med" },
      { instance_id:"c_sp", type:"machine", machine_key:"shoulder_press_machine", caps:["machine","shoulder_press_machine"],
        load:{ kind:"selectorized_stack", min:10, max:200, increment:10 }, load_portability:"machine_relative", count:1, contention:"med" }
    ] },
  { gym_id:"hotel", name:"Hotel / Travel", scope:"household",
    constraints:{ solo_training:true, ceiling_height_in:84 },
    equipment:[
      { instance_id:"t_db", type:"dumbbell_set", caps:["dumbbell"],
        load:{ kind:"fixed_pairs", min:5, max:50, increment:5, per_hand:true, pairs:true },
        load_portability:"absolute", contention:"low" },
      { instance_id:"t_bench", type:"bench", caps:["bench","adjustable_bench"],
        attrs:{ adjustable:true, angles:[0,30,45,90] }, count:1, contention:"low" },
      { instance_id:"t_band", type:"band_set", caps:["band","machine_assistance"],
        load:{ kind:"variable", levels:["light","medium","heavy"], approx_lb:[15,35,60] },
        load_portability:"absolute", contention:"low" }
    ] }
];
const SEED_USERS = [
  { id:"rob", name:"Robert", unit:"lb", bodyweight:185,
    emphasis:{ chest:"emphasize", back:"emphasize", side_delt:"emphasize", triceps:"grow", biceps:"grow",
               quads:"grow", hamstrings:"grow", glutes:"maintain", rear_delt:"grow", front_delt:"maintain",
               calves:"grow", traps:"maintain", forearms:"maintain", abs:"maintain", adductors:"maintain" },
    overrides:{}, injuries:[], learned_ratios:{}, painFlags:{} },
  { id:"nina", name:"Nina", unit:"lb", bodyweight:132,
    emphasis:{ glutes:"emphasize", quads:"grow", hamstrings:"emphasize", back:"grow", side_delt:"grow",
               chest:"grow", triceps:"maintain", biceps:"grow", rear_delt:"grow", front_delt:"maintain",
               calves:"grow", traps:"maintain", forearms:"maintain", abs:"grow", adductors:"grow" },
    overrides:{}, injuries:[], learned_ratios:{}, painFlags:{} }
];

/* Build a starting mesocycle from the split + landmarks + the selection engine. */
function seedMeso(user, gym, days, weeks) {
  const split = E.splitFor(days);
  const GROUPS = {
    full:  ["quads","chest","back","hamstrings","side_delt","biceps","triceps"],
    upper: ["chest","back","side_delt","triceps","biceps","rear_delt"],
    lower: ["quads","hamstrings","glutes","calves","abs"],
    push:  ["chest","side_delt","triceps","front_delt"],
    pull:  ["back","biceps","rear_delt","traps"],
    legs:  ["quads","hamstrings","glutes","calves"],
    arms:  ["biceps","triceps","side_delt","rear_delt","forearms","abs"]
  };
  const meso = {
    id: uid(), userId: user.id, name: `${split.name} — ${weeks}wk`, weeks, unit: user.unit,
    days: [], startedAt: today(), homeGym: gym.gym_id, createdAt: new Date().toISOString()
  };
  split.days.forEach((kind, i) => {
    const muscles = GROUPS[kind] || GROUPS.full;
    const freq = split.days.filter(d => d === kind).length;
    const day = { name: kind[0].toUpperCase() + kind.slice(1), kind, muscles: [] };
    // [PUB] "Whatever muscle group matters most gets trained first in each session, without
    // exception." So order by emphasis, not by muscle size or compound-vs-isolation —
    // neither of those is actually an RP rule.
    const ordered = muscles.slice().sort((a, b) =>
      E.EMPHASIS.indexOf(user.emphasis[b] || "grow") - E.EMPHASIS.indexOf(user.emphasis[a] || "grow"));
    // `chosen` accumulates across the WHOLE day, not per muscle. Scoped per muscle (the obvious
    // mistake) the redundancy penalty never sees across groups, and you get barbell RDL for
    // hamstrings followed by dumbbell RDL for glutes — the same movement twice in one session.
    const chosen = [];
    ordered.forEach((m, mi) => {
      const emph = user.emphasis[m] || "grow";
      const b = E.band(m, emph);
      const weekly = b.start;
      const perSession = Math.max(2, Math.min(E.CFG.perSessionMax, Math.round(weekly / Math.max(1, freq))));
      // [PUB] >=3 sets per exercise on average → 1-2 exercises per muscle per session.
      const nEx = perSession >= 6 ? 2 : 1;
      const g = { m, emphasis: emph, slots: [] };
      const sess = { chosen, fatigueSpent: mi / Math.max(1, ordered.length), occupied: new Set() };
      for (let k = 0; k < nEx; k++) {
        const sets = k === 0 ? Math.ceil(perSession / nEx) : Math.floor(perSession / nEx);
        if (sets < 1) continue;
        // First exercise of a muscle wants the stretch position; the second complements it.
        const slot = { id: uid(), muscle: m, sets, repRange: k === 0 ? [8, 12] : [12, 20],
                       position: mi + 1, wanted_profile: k === 0 ? "stretch" : "shortened", wants_stretch: k === 0 };
        const pick = E.selectForSlot(slot, gym, Object.assign({}, user, { loadState:{} }), sess, LIB());
        // A slot with no exercise is a hole in the workout — drop it rather than render a
        // muscle group with nothing under it.
        if (!pick.primary) continue;
        slot.exId = pick.primary.ex.id; chosen.push(pick.primary.ex);
        g.slots.push(slot);
      }
      if (g.slots.length) day.muscles.push(g);
    });
    meso.days.push(day);
  });
  return meso;
}

/* ============ boot ============ */
async function boot() {
  await DB.open();
  DB.persist().then(ok => { if (!ok) console.warn("Storage may be evicted — the Sheet is the real backup."); });

  let users = await DB.get("kv", "users");
  if (!users) { users = { k:"users", v: SEED_USERS }; await DB.put("kv", users); }
  let gyms = await DB.get("kv", "gyms");
  if (!gyms) { gyms = { k:"gyms", v: SEED_GYMS }; await DB.put("kv", gyms); }
  S.users = users.v; S.gyms = gyms.v;

  const uid_ = DB.pref.get("user", S.users[0].id);
  S.user = S.users.find(u => u.id === uid_) || S.users[0];
  const gid = DB.pref.get("gym", S.gyms[0].gym_id);
  S.gym = S.gyms.find(g => g.gym_id === gid) || S.gyms[0];

  await loadUser();
  renderTabs(); go(DB.pref.get("tab", "workout"));
}

async function loadUser() {
  const [mesos, sess, loads] = await Promise.all([
    DB.all("meso", "user", S.user.id), DB.all("session", "user", S.user.id), DB.all("loadState")
  ]);
  S.sessions = sess.sort((a, b) => (a.date || "").localeCompare(b.date || ""));
  S.loadState = {};
  for (const l of loads) if (l.k.startsWith(S.user.id + "|")) S.loadState[l.k] = l;
  S.meso = mesos.sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""))[0] || null;
  S.user.loadState = S.loadState;
}

/* ============ router ============ */
const TABS = [
  { k:"workout", t:"Workout" }, { k:"mesos", t:"Mesos" }, { k:"gyms", t:"Gyms" },
  { k:"exercises", t:"Exercises" }, { k:"more", t:"More" }
];
function renderTabs() {
  $("#tabs").innerHTML = TABS.map(t =>
    `<button data-tab="${t.k}" aria-selected="${S.tab===t.k}">${ICON[t.k]}<span>${t.t}</span></button>`).join("");
  $("#tabs").onclick = e => { const b = e.target.closest("[data-tab]"); if (b) go(b.dataset.tab); };
}
function go(tab) {
  S.tab = tab; DB.pref.set("tab", tab);
  document.querySelectorAll("#tabs button").forEach(b => b.setAttribute("aria-selected", b.dataset.tab === tab));
  ({ workout: viewWorkout, mesos: viewMesos, gyms: viewGyms, exercises: viewExercises, more: viewMore }[tab] || viewWorkout)();
  scrollTo(0, 0);
}

/* ================================================================
 * WORKOUT
 * ================================================================ */
function currentSlot() {
  if (!S.meso) return null;
  // Which week/day are we on? Count completed sessions — days aren't tied to dates [APP:
  // "training days aren't tied to specific dates", missing a day carries no penalty].
  const done = S.sessions.filter(s => s.mesoId === S.meso.id && s.finished).length;
  const perWeek = S.meso.days.length;
  return { week: Math.floor(done / perWeek) + 1, day: (done % perWeek) + 1 };
}
const sessionId = (w, d) => `${S.user.id}|${S.meso.id}|w${w}|d${d}`;

async function ensureSession(w, d) {
  const id = sessionId(w, d);
  let s = await DB.get("session", id);
  if (s) return s;
  const day = S.meso.days[d - 1];
  const rir = E.rirForWeek(w, S.meso.weeks);
  const deload = E.isDeload(w, S.meso.weeks);
  s = { id, userId: S.user.id, mesoId: S.meso.id, week: w, day: d, date: today(),
        gymId: S.gym.gym_id, off_plan: S.gym.gym_id !== S.meso.homeGym,
        sets: [], feedback: {}, jointPain: {}, finished: false };

  for (const g of day.muscles) {
    if (deload && E.deloadDrops(g.m)) continue;      // [APP] traps + forearms come out of deload
    for (const slot of g.slots) {
      const ex = LIB().find(x => x.id === slot.exId);
      if (!ex) continue;
      const bind = E.resolveEquipment(ex, S.gym, S.occupied);
      const sl = Object.assign({}, slot, { rir: Math.max(rir, E.rirFloor(ex)) });
      const tgt = bind.ok ? E.targetLoad(S.user, ex, bind, sl) : null;
      let sets = slot.sets, reps = (slot.repRange || [8,12])[1], load = tgt && tgt.load;
      if (deload) {
        const dp = E.deloadPrescription({ sets, reps, load: load || 0 }, g.m, "first");
        sets = dp.sets; reps = dp.reps; load = dp.load || load;
      }
      for (let i = 0; i < sets; i++) {
        s.sets.push({ id: uid(), slotId: slot.id, muscle: g.m, exId: ex.id,
          instanceId: bind.ok && bind.carrier ? bind.carrier.instance_id : null,
          load: load || null, reps: null, targetReps: reps, targetLoad: load || null,
          // Only a real cross-exercise RATIO estimate earns the calibration note. A "feel_out"
          // (no history at all) is not an estimate — there's nothing to have estimated from.
          rir: sl.rir, done: false, est: tgt && tgt.why === "ratio" ? tgt.confidence : null });
      }
    }
  }
  await DB.put("session", s);
  return s;
}

async function viewWorkout() {
  if (!S.meso) return viewNoMeso();
  const cur = currentSlot();
  if (cur.week > S.meso.weeks) return viewMesoComplete();
  S.session = await ensureSession(cur.week, cur.day);
  drawWorkout();
  wake();
  // Batch soreness BEFORE the first set — see askSorenessUpfront for why this beats RP.
  if (!S.session.sorenessAsked && !S.session.finished) { await askSorenessUpfront(); drawWorkout(); }
}

function viewNoMeso() {
  $("#v").innerHTML = `
    <div class="hd"><div class="hd-row"><h2>Plan a mesocycle</h2></div></div>
    <div class="card"><div class="row"><div class="grow">
      <div class="lead">No mesocycle yet</div>
      <div class="sm dim" style="margin-top:4px">Pick your days per week and Meso builds it from your emphasis settings and the RP volume landmarks.</div>
    </div></div></div>
    <div class="card"><div class="row"><div class="grow">Days per week</div></div>
      <div style="padding:0 14px 14px"><div class="seg" id="dseg">
        ${[2,3,4,5,6].map(d => `<button data-d="${d}" aria-selected="${d===4}">${d}</button>`).join("")}
      </div></div>
      <div class="row"><div class="grow">Weeks <span class="dim sm">(last one is the deload)</span></div></div>
      <div style="padding:0 14px 14px"><div class="seg" id="wseg">
        ${[4,5,6].map(w => `<button data-w="${w}" aria-selected="${w===5}">${w}</button>`).join("")}
      </div></div>
    </div>
    <button class="btn wide" id="mk">Create mesocycle</button>
    <div class="sync"><span class="dot"></span> Training as ${esc(S.user.name)} · ${esc(S.gym.name)}</div>`;
  let d = 4, w = 5;
  $("#dseg").onclick = e => { const b = e.target.closest("[data-d]"); if (!b) return; d = +b.dataset.d;
    document.querySelectorAll("#dseg button").forEach(x => x.setAttribute("aria-selected", x === b)); };
  $("#wseg").onclick = e => { const b = e.target.closest("[data-w]"); if (!b) return; w = +b.dataset.w;
    document.querySelectorAll("#wseg button").forEach(x => x.setAttribute("aria-selected", x === b)); };
  $("#mk").onclick = async () => {
    if (!LIB().length) return toast("Exercise library hasn't loaded");
    const m = seedMeso(S.user, S.gym, d, w);
    await DB.put("meso", m); await loadUser(); go("workout");
    toast(`${m.name} created`);
  };
}

function viewMesoComplete() {
  $("#v").innerHTML = `
    <div class="hd"><div class="hd-row"><h2>Mesocycle complete</h2></div></div>
    <div class="card"><div class="row"><div class="grow">
      <div class="lead">${esc(S.meso.name)}</div>
      <div class="sm dim" style="margin-top:4px">Every meso you finish is more muscle on top of what you've already built. Your loads carry into the next one — unlike RP's app, which starts you over.</div>
    </div></div></div>
    <button class="btn wide" id="nx">Plan the next mesocycle</button>`;
  $("#nx").onclick = async () => { S.meso = null; go("workout"); };
}

function drawWorkout() {
  const s = S.session, cur = { week: s.week, day: s.day };
  const day = S.meso.days[s.day - 1];
  const deload = E.isDeload(s.week, S.meso.weeks);
  const rir = E.rirForWeek(s.week, S.meso.weeks);

  const groups = [];
  for (const g of day.muscles) {
    const sets = s.sets.filter(x => x.muscle === g.m);
    if (!sets.length) continue;
    groups.push({ g, sets });
  }

  $("#v").innerHTML = `
    <div class="hd"><div class="hd-row">
      <h2>WEEK ${s.week} <span class="d">DAY ${s.day}</span></h2>
      <div style="display:flex;gap:6px;align-items:center">
        ${S.rest ? `<span class="badge b-info mono" id="restb">${fmtRest()}</span>` : ""}
        <button class="help" id="cal" title="History">◷</button>
      </div>
    </div>
    <div class="sm dim" style="margin-top:2px">
      ${esc(day.name)} · ${esc(S.meso.name)} · ${esc(S.gym.name)}
      ${deload ? ' · <span class="badge b-warn">DELOAD</span>' : ` · <span class="dim2">${rir} RIR</span>`}
      ${s.off_plan ? ' · <span class="badge b-info">Travel</span>' : ""}
    </div></div>
    ${deload ? `<div class="card"><div class="row"><div class="grow sm">Deload week — half the reps, lighter loads, 5+ RIR. Traps and forearms are out. Take it easy; this is where the growth lands.</div></div></div>` : ""}
    ${s.off_plan ? `<div class="card"><div class="row"><div class="grow sm">Away from your home gym. These sets still count toward your weekly volume, but they're kept out of your strength trend — a hotel's 50lb dumbbell ceiling shouldn't read as detraining.</div></div></div>` : ""}
    <div id="gs">${groups.map(x => drawGroup(x.g, x.sets)).join("")}</div>
    <button class="btn wide" id="fin" style="margin:14px 0 20px">${s.sets.every(x=>x.done||x.reps===-1) ? "Finish workout" : "Finish early"}</button>
    <div class="sync ${syncClass()}"><span class="dot"></span>${syncLabel()}</div>`;

  wireWorkout();
}

function drawGroup(g, sets) {
  const byEx = [];
  for (const st of sets) { let e = byEx.find(x => x.exId === st.exId); if (!e) byEx.push(e = { exId: st.exId, sets: [] }); e.sets.push(st); }
  return `<div style="margin:16px 0 4px">${mgPill(g.m, g.emphasis)}</div>` +
    byEx.map(e => drawExercise(g, e)).join("");
}

function drawExercise(g, e) {
  const ex = LIB().find(x => x.id === e.exId) || { name: e.exId, ratings:{} };
  const eq = equipLabel(ex);
  const nextIx = e.sets.findIndex(x => !x.done && x.reps !== -1);
  const est = e.sets[0] && e.sets[0].est;
  return `<div class="card"><div class="ex">
    <div class="ex-hd">
      <div class="grow">
        <div class="ex-nm">${esc(ex.name)}</div>
        <div class="sm dim" style="margin-top:2px">${esc(eq)}</div>
      </div>
      <button class="help" data-occ="${e.exId}" title="Taken?">⇄</button>
    </div>
    ${est != null ? `<div class="note"><span>⌁</span><span>Estimated from a similar lift${est ? ` (${Math.round(est*100)}% confident)` : ""} — first set calibrates it.</span></div>` : ""}
    <div class="sets">
      <div class="sets-hd"><div>Weight</div><div>Reps</div><div>Log</div></div>
      ${e.sets.map((st, i) => drawSet(st, i === nextIx)).join("")}
    </div>
  </div></div>`;
}

function drawSet(st, isNext) {
  const state = st.reps === -1 ? "skip" : st.done ? "done" : isNext ? "next" : "pending";
  const u = S.user.unit;
  return `<div class="set" data-set="${st.id}">
    <div class="stp ${st.done?"done":""}">
      <button data-nudge="load" data-dir="-1">−</button>
      <input inputmode="decimal" data-f="load" value="${st.load != null ? st.load : ""}" placeholder="—">
      <button data-nudge="load" data-dir="1">+</button>
    </div>
    <div class="stp ${st.done?"done":""}">
      <button data-nudge="reps" data-dir="-1">−</button>
      <input inputmode="numeric" data-f="reps" value="${st.reps != null && st.reps >= 0 ? st.reps : ""}" placeholder="${st.targetReps != null ? st.targetReps : "—"}">
      <button data-nudge="reps" data-dir="1">+</button>
    </div>
    <button class="log" data-log="${st.id}" data-s="${state}">${ICON.check}</button>
    <div class="tgt">${targetStrip(st, u)}</div>
  </div>`;
}
function targetStrip(st, u) {
  if (st.targetLoad == null) return `<span class="dim">Choose your starting weight — warm up, then pick something you can hit for ${st.targetReps || 10} at ${st.rir} RIR.</span>`;
  return `We recommend <b>${st.targetLoad} ${u}</b> × <b>${st.targetReps}</b> at <b>${st.rir} RIR</b>`;
}
const PRETTY = { barbell:"Barbell", dumbbell:"Dumbbell", cable:"Cable", machine:"Machine", smith:"Smith Machine",
  bodyweight_only:"Bodyweight", bodyweight_loadable:"Bodyweight (loadable)", machine_assistance:"Machine Assistance",
  band:"Band", adjustable_bench:"Bench", bench:"Bench", freemotion:"Freemotion", squat_rack:"Rack",
  pullup_bar:"Pull-up Bar", dip_station:"Dip Station", preacher_bench:"Preacher", ghd:"GHD", landmine:"Landmine" };

/**
 * Label the equipment that ACTUALLY resolved at this gym — not the first cap in the schema.
 * `requires` is an any-of-alls: Face Pull is [cable+high_pulley] OR [band]. At the home garage
 * the engine correctly binds the band, so labeling it "Cable" is a lie about a gym with no cable.
 */
function equipLabel(ex, gym) {
  const bind = E.resolveEquipment(ex, gym || S.gym, S.occupied);
  if (bind.ok) {
    // Prefer the load-bearing instance; a bench is a detail, the dumbbells are the exercise.
    const inst = bind.carrier || bind.instances[0];
    for (const c of (inst.caps || [])) if (PRETTY[c] && c !== "bench" && c !== "adjustable_bench") return PRETTY[c];
    if (inst.machine_key) return PRETTY.machine;
    for (const c of (inst.caps || [])) if (PRETTY[c]) return PRETTY[c];
  }
  // Not available here — fall back to the first alternative's label so the row still reads.
  const first = ((ex.requires && ex.requires.any) || [])[0];
  for (const r of ((first && first.all) || [])) if (PRETTY[r.cap]) return PRETTY[r.cap];
  return "—";
}

function stepFor(field, st) {
  if (field === "reps") return 1;
  const ex = LIB().find(x => x.id === st.exId);
  const bind = ex && E.resolveEquipment(ex, S.gym, S.occupied);
  return bind && bind.ok && bind.plan ? bind.plan.stepAt(st.load || bind.plan.min) : 5;
}

function wireWorkout() {
  const v = $("#v");
  v.querySelectorAll(".set").forEach(row => {
    const id = row.dataset.set;
    const st = S.session.sets.find(x => x.id === id);
    row.addEventListener("focusin", () => row.classList.add("focus"));
    row.addEventListener("focusout", () => setTimeout(() => {
      if (!row.contains(document.activeElement)) row.classList.remove("focus");
    }, 60));
    row.querySelectorAll("[data-nudge]").forEach(b => b.onclick = () => {
      const f = b.dataset.nudge, dir = +b.dataset.dir;
      const inp = row.querySelector(`[data-f="${f}"]`);
      const step = stepFor(f, st);
      let cur = parseFloat(inp.value);
      if (isNaN(cur)) cur = f === "reps" ? (st.targetReps || 10) : (st.targetLoad || step);
      else cur = cur + dir * step;
      if (cur < 0) cur = 0;
      inp.value = Math.round(cur * 100) / 100;
      row.classList.add("focus");
      if (f === "load") onLoadOverride(st, parseFloat(inp.value), row);
    });
    row.querySelector('[data-f="load"]').addEventListener("change", e =>
      onLoadOverride(st, parseFloat(e.target.value), row));
  });
  v.querySelectorAll("[data-log]").forEach(b => b.onclick = () => logSet(b.dataset.log));
  v.querySelectorAll("[data-occ]").forEach(b => b.onclick = () => occupied(b.dataset.occ));
  const fin = $("#fin"); if (fin) fin.onclick = finishWorkout;
  const cal = $("#cal"); if (cal) cal.onclick = () => go("mesos");
}

/* [PUB] RP's predictive matching: override the load → recompute target reps to hold equal
   relative overload. Past ~20% drift it can't infer, and falls back to showing RIR. */
function onLoadOverride(st, load, row) {
  if (!load || !st.targetLoad || load === st.targetLoad) return;
  const m = E.matchReps(load, { load: st.targetLoad, reps: st.targetReps, rir: st.rir }, { rir: st.rir });
  const tgt = row.querySelector(".tgt");
  if (!m) return;
  if (m.reps == null) tgt.innerHTML = `Off-target — just aim for <b>${st.rir} RIR</b> and log what you actually get.`;
  else { st.targetReps = m.reps; tgt.innerHTML = `At <b>${load} ${S.user.unit}</b> aim for <b>${m.reps}</b> at <b>${st.rir} RIR</b>`;
         row.querySelector('[data-f="reps"]').placeholder = m.reps; }
}

async function logSet(id) {
  const st = S.session.sets.find(x => x.id === id);
  if (!st) return;
  const row = $(`.set[data-set="${id}"]`);
  if (st.done) {   // tap a completed set to un-log it
    st.done = false; st.reps = null; await DB.put("session", S.session); return drawWorkout();
  }
  const loadV = parseFloat(row.querySelector('[data-f="load"]').value);
  const repsRaw = row.querySelector('[data-f="reps"]').value.trim();
  // 🔑 RP's speed trick: tap LOG with reps empty → logs the TARGET. One tap for "I hit it."
  const reps = repsRaw === "" ? st.targetReps : parseInt(repsRaw, 10);

  if (!loadV || isNaN(loadV)) { toast("Enter a weight first"); return; }
  if (reps == null || isNaN(reps)) { toast("Enter your reps"); return; }
  // [PUB] guard — RP shows this once. Logging RIR into the reps box is the classic mistake.
  if (reps < 5 && !DB.pref.get("rirCheckSeen", false)) {
    DB.pref.set("rirCheckSeen", true);
    if (!confirm(`Log low reps?\n\nYou're logging ${reps} reps. For hypertrophy, reps should fall between 5 and 30. Be sure to log counted reps, and not RIR targets.`)) return;
  }
  st.load = loadV; st.reps = reps; st.done = true; st.at = new Date().toISOString();

  await recordLoadState(st);
  await DB.put("session", S.session);
  startRest(st.muscle);
  await maybeFeedback(st);
  drawWorkout();
}

/* Load state is keyed per (user, exercise[, instance]) and SURVIVES meso boundaries.
   RP throws this away every cycle — "you start over every six weeks" is a top-5 complaint. */
async function recordLoadState(st) {
  const ex = LIB().find(x => x.id === st.exId); if (!ex) return;
  const bind = E.resolveEquipment(ex, S.gym, S.occupied);
  const k = E.loadKey(S.user.id, ex, bind);
  const rec = { k, exId: ex.id, load: st.load, reps: st.reps, rir: st.rir,
                e1rm: E.epley(st.load, st.reps, st.rir), at: new Date().toISOString(),
                gymId: S.gym.gym_id, off_plan: S.session.off_plan };
  await DB.put("loadState", rec); S.loadState[k] = rec; S.user.loadState = S.loadState;
}

/* ============ occupied → backup chain ============ */
function occupied(exId) {
  const ex = LIB().find(x => x.id === exId); if (!ex) return;
  const bind = E.resolveEquipment(ex, S.gym, S.occupied);
  if (bind.ok && bind.carrier) S.occupied.add(bind.carrier.instance_id);
  // TTL — someone else's set ends eventually.
  const freed = bind.ok && bind.carrier && bind.carrier.instance_id;
  if (freed) setTimeout(() => S.occupied.delete(freed), 20 * 60 * 1000);

  const st = S.session.sets.find(x => x.exId === exId && !x.done);
  const slot = { muscle: st ? st.muscle : (ex.muscles[0] || {}).m, exId,
                 repRange: [8, 12], rir: st ? st.rir : 2, position: 1,
                 wanted_profile: ex.profile && ex.profile.resistance_peak, wants_stretch: true };
  const sess = { chosen: [], fatigueSpent: .4, occupied: S.occupied };
  const pick = E.selectForSlot(slot, S.gym, S.user, sess, LIB());
  const opts = [pick.primary].concat(pick.backups).filter(Boolean).filter(c => c.ex.id !== exId).slice(0, 4);
  if (!opts.length) { S.occupied.delete(freed); return toast("Nothing else here hits that muscle"); }

  sheet(`
    <h3>Taken — try one of these</h3>
    <div class="sm dim" style="margin:6px 0 4px">Your sets and progression stay on the slot, so swapping doesn't cost you anything.</div>
    ${opts.map((c, i) => `<div class="row tap" data-sub="${c.ex.id}" style="border:1px solid var(--line);border-radius:var(--r-btn);margin-top:8px">
      <div class="grow"><div class="lead">${esc(c.ex.name)}</div>
      <div class="sm dim">${esc(equipLabel(c.ex))}${c.load ? ` · start ~${c.load} ${S.user.unit}` : ""}${c.est && c.est.calibration ? " · estimated" : ""}</div></div>
      ${i === 0 ? '<span class="badge b-up">BEST</span>' : ""}
    </div>`).join("")}
    <div class="sheet-ft"><button id="sc">Cancel</button></div>`);
  $("#sc").onclick = () => { S.occupied.delete(freed); closeSheet(); };
  document.querySelectorAll("[data-sub]").forEach(r => r.onclick = () => substitute(exId, r.dataset.sub));
}

async function substitute(fromId, toId) {
  const to = LIB().find(x => x.id === toId);
  const bind = E.resolveEquipment(to, S.gym, S.occupied);
  const pending = S.session.sets.filter(x => x.exId === fromId && !x.done && x.reps !== -1);
  for (const st of pending) {
    const sl = { repRange: [8, 12], rir: st.rir, exId: fromId, muscle: st.muscle };
    const tgt = E.targetLoad(S.user, to, bind, sl);
    st.exId = toId;
    st.instanceId = bind.ok && bind.carrier ? bind.carrier.instance_id : null;
    st.load = tgt && tgt.load; st.targetLoad = tgt && tgt.load;
    st.targetReps = (tgt && tgt.reps) || st.targetReps;
    st.est = tgt && tgt.calibration ? tgt.confidence : null;
    // Log what was PERFORMED and why — never write substituted results into the original's history.
    st.sub = { of: fromId, reason: "occupied" };
  }
  await DB.put("session", S.session);
  closeSheet(); drawWorkout();
  toast(`Swapped to ${to.name}`);
}

/* ============ rest timer — RP refuses to ship one; it's their #1 complaint ============ */
function startRest(muscle) {
  const [lo, hi] = E.REST[muscle] || [60, 120];
  // Midpoint of RP's published range, not the top of it — counting down from `hi` would tell
  // you to rest 3 minutes on every chest set when their own guidance is 1-3.
  // [PUB] Their rationale for not timing rest at all: "10 '90% recovered sets' in 45 minutes is
  // a much more anabolic stimulus than 3 '99% recovered' sets." The timer is a nudge, not a rule.
  S.rest = { until: Date.now() + Math.round((lo + hi) / 2) * 1000, lo, hi, muscle };
  if (S.restT) clearInterval(S.restT);
  S.restT = setInterval(() => {
    const b = $("#restb"); if (!b) return;
    if (Date.now() >= S.rest.until) { clearInterval(S.restT); S.rest = null; b.remove(); beep(); return; }
    b.textContent = fmtRest();
  }, 500);
}
function fmtRest() {
  if (!S.rest) return "";
  const left = Math.max(0, Math.round((S.rest.until - Date.now()) / 1000));
  return `${Math.floor(left/60)}:${String(left%60).padStart(2,"0")}`;
}
function beep() {
  try {
    const a = new (window.AudioContext || window.webkitAudioContext)();
    const o = a.createOscillator(), g = a.createGain();
    o.connect(g); g.connect(a.destination); o.frequency.value = 880;
    g.gain.setValueAtTime(.0001, a.currentTime); g.gain.exponentialRampToValueAtTime(.2, a.currentTime + .01);
    g.gain.exponentialRampToValueAtTime(.0001, a.currentTime + .35);
    o.start(); o.stop(a.currentTime + .36);
  } catch (_) {}
}

/* ============ wake lock ============ */
let wl = null;
async function wake() {
  try { if ("wakeLock" in navigator) wl = await navigator.wakeLock.request("screen"); } catch (_) {}
}
document.addEventListener("visibilitychange", () => {
  // The lock is dropped on blur and MUST be re-acquired — this is the bit everyone forgets.
  if (document.visibilityState === "visible" && S.tab === "workout") wake();
});

/* ================================================================
 * FEEDBACK — fires at RP's exact trigger points.
 *   soreness  → entering a muscle group (first set started)
 *   pump+workload → exiting it (all its sets terminal)
 *   joint pain → per EXERCISE, on that exercise completing
 * ================================================================ */
async function maybeFeedback(justLogged) {
  const s = S.session, m = justLogged.muscle;
  const exSets = s.sets.filter(x => x.exId === justLogged.exId);
  const exDone = exSets.every(x => x.done || x.reps === -1);
  const mgSets = s.sets.filter(x => x.muscle === m);
  const mgDone = mgSets.every(x => x.done || x.reps === -1);

  const qs = [];
  if (exDone && s.jointPain[justLogged.exId] == null) qs.push({ k:"jointPain", ex: justLogged.exId });
  if (mgDone && !(s.feedback[m] || {}).pump) { qs.push({ k:"pump", m }); qs.push({ k:"workload", m }); }
  if (qs.length) await askFeedback(m, qs);
}

/* Soreness is asked ENTERING a muscle group — and RP gets this wrong. Their own 5-star reviewer:
   "report soreness all at once before beginning a workout, as once I'm warmed up and lifting,
   I've kinda stopped feeling sore and sometimes forget which muscles were sore." They're right:
   asking mid-session, after you're warm, corrupts the signal. We batch it pre-workout instead.
   Same question, same scale, better data. */
async function askSorenessUpfront() {
  const s = S.session;
  if (s.sorenessAsked) return true;
  const muscles = [...new Set(s.sets.map(x => x.muscle))];
  // Skip a muscle's first-ever appearance in the meso — nothing to be sore from.
  const prior = S.sessions.filter(x => x.mesoId === s.mesoId && x.finished);
  const ask = muscles.filter(m => prior.some(p => (p.sets || []).some(y => y.muscle === m && y.done)));
  if (!ask.length) { s.sorenessAsked = true; await DB.put("session", s); return true; }
  await askFeedback(null, ask.map(m => ({ k:"soreness", m })), "Before you start");
  s.sorenessAsked = true; await DB.put("session", s);
  return true;
}

const Q = {
  soreness: m => ({
    label: `${E.MG_LABEL[m]} soreness`,
    // Wording is load-bearing: LAST time, not this time.
    help: `How sore did you get in your ${E.MG_LOWER(m)} AFTER training them LAST TIME?`,
    opts: [["never","Never got sore"],["healed_early","Healed a while ago"],["healed_ontime","Healed just on time"],["still_sore","I'm still sore!"]],
    long: { never:`I never got sore at all in my ${E.MG_LOWER(m)} last time, and I could have trained them hard the next day.`,
            healed_early:"A tiny bit sore, but healed way before this session. I feel strong.",
            healed_ontime:"I recovered just on time for this session and the target muscles feel good.",
            still_sore:`I'm still sore, fatigued, or weak in my ${E.MG_LOWER(m)} from last time.` } }),
  pump: m => ({
    label: `${E.MG_LABEL[m]} pump`,
    help: `How much of a pump did you get today in your ${E.MG_LOWER(m)}?`,
    opts: [["low","Low pump"],["moderate","Moderate pump"],["amazing","Amazing pump"]],
    long: { low:"Barely noticed one.", moderate:"A solid pump while I was working.",
            amazing:`My ${E.MG_LOWER(m)} pump was unreal — felt like they were going to burst through the skin.` } }),
  workload: m => ({
    label: `${E.MG_LABEL[m]} volume`,
    help: `How was the volume of work (number of hard sets) for your ${E.MG_LOWER(m)}?`,
    opts: [["not_enough","Not enough"],["just_right","Just right"],["pushed","Pushed my limits"],["too_much","Too much"]],
    long: { not_enough:"It felt like barely any work. I could have easily done more sets.",
            just_right:"About right.", pushed:"It felt right at my limit. I'm not sure I could have done more sets.",
            too_much:"Way too much. My workout quality and focus would have been better with fewer sets." } }),
  jointPain: exId => {
    const ex = LIB().find(x => x.id === exId) || { name: exId };
    return { label:"Joint pain", help:`How did your joints feel during ${ex.name}?`,
      opts: [["none","None"],["low","Low pain"],["moderate","Moderate pain"],["a_lot","A lot of pain"]],
      long: { none:"Felt clean.", low:"A little something, nothing that worried me.",
              moderate:"Noticeable ache — not just being warmed up.", a_lot:"My joints hurt BAD, something is up." } };
  }
};

function askFeedback(muscle, qs, title) {
  return new Promise(res => {
    const answers = {};
    const body = qs.map((q, i) => {
      const def = q.k === "jointPain" ? Q.jointPain(q.ex) : Q[q.k](q.m);
      return `<div class="q" data-q="${i}">
        <div class="q-l">${esc(def.label)} <button class="help" data-h="${i}">?</button></div>
        <div class="q-h">${esc(def.help)}</div>
        <div class="opts ${def.opts.length===4?"w4":""}">
          ${def.opts.map(([v, t]) => `<button class="opt" data-i="${i}" data-v="${v}" aria-pressed="false">${esc(t)}</button>`).join("")}
        </div></div>`;
    }).join("");
    sheet(`<h3>${esc(title || "Feedback")}</h3>${body}
      <div class="sheet-ft"><button id="fbSkip" class="dim">Skip</button><button class="btn" id="fbSave">Save</button></div>`);

    document.querySelectorAll(".opt").forEach(b => b.onclick = () => {
      const i = b.dataset.i;
      document.querySelectorAll(`.opt[data-i="${i}"]`).forEach(x => x.setAttribute("aria-pressed", "false"));
      b.setAttribute("aria-pressed", "true"); answers[i] = b.dataset.v;
    });
    document.querySelectorAll("[data-h]").forEach(b => b.onclick = () => {
      const q = qs[b.dataset.h];
      const def = q.k === "jointPain" ? Q.jointPain(q.ex) : Q[q.k](q.m);
      alert(def.opts.map(([v, t]) => `${t}\n  ${def.long[v]}`).join("\n\n"));
    });
    const done = async () => {
      for (const i in answers) {
        const q = qs[i], v = answers[i];
        if (q.k === "jointPain") {
          S.session.jointPain[q.ex] = v;
          if (v === "moderate" || v === "a_lot") S.user.painFlags[q.ex] = { at: today(), v };
        } else {
          S.session.feedback[q.m] = S.session.feedback[q.m] || {};
          S.session.feedback[q.m][q.k] = v;
        }
      }
      await DB.put("session", S.session);
      await DB.put("kv", { k:"users", v: S.users });
      closeSheet(); res(true);
    };
    $("#fbSave").onclick = done;
    // NEVER block finishing a workout on feedback. If the modal is friction it gets
    // fake-answered, the progression math turns to noise, and the whole thing quietly dies.
    $("#fbSkip").onclick = () => { closeSheet(); res(false); };
  });
}

/* ================================================================
 * FINISH → autoregulate the next session
 * ================================================================ */
async function finishWorkout() {
  const s = S.session;
  s.finished = true; s.finishedAt = new Date().toISOString();

  const muscles = [...new Set(s.sets.map(x => x.muscle))];
  const notes = [];
  for (const m of muscles) {
    const mine = s.sets.filter(x => x.muscle === m && x.done);
    if (!mine.length) continue;
    const prior = S.sessions.filter(x => x.mesoId === s.mesoId && x.finished && x.day === s.day && x.week < s.week)
                            .sort((a, b) => b.week - a.week)[0];
    const prev = prior ? prior.sets.filter(x => x.muscle === m && x.done) : null;
    const week1 = !prev || !prev.length;
    const pf = E.performanceScore(mine, prev, week1);
    const emph = (S.user.emphasis || {})[m] || "grow";
    const fb = s.feedback[m] || {};
    // Joint pain is per-exercise; fold the worst of this muscle's exercises into its decision.
    const jp = mine.map(x => s.jointPain[x.exId]).filter(Boolean)
                   .sort((a, b) => E.JOINT.indexOf(b) - E.JOINT.indexOf(a))[0];
    const d = E.setDelta(Object.assign({}, fb, { jointPain: jp }), pf, emph);
    s.decision = s.decision || {};
    s.decision[m] = { pf, delta: d.delta, action: d.action, reasons: d.reasons, swap: d.swapExercise };

    // Apply to the meso for next time.
    const day = S.meso.days[s.day - 1];
    const g = day.muscles.find(x => x.m === m);
    if (g && d.action !== E.ACTION.RECOVERY && d.delta !== 0) {
      const cur = g.slots.reduce((a, x) => a + x.sets, 0);
      const ap = E.applyDelta(cur, d.delta, m, emph);
      let diff = ap.sets - cur;
      // Add to the first slot, remove from the last — keeps the primary exercise's volume.
      while (diff > 0) { g.slots[0].sets++; diff--; }
      while (diff < 0) { const last = g.slots[g.slots.length-1]; if (last.sets > 1) last.sets--; else break; diff++; }
      if (ap.atCeiling) notes.push(`${E.MG_LABEL[m]} is at your ceiling`);
    }
    if (d.action === E.ACTION.RECOVERY) notes.push(`${E.MG_LABEL[m]}: recovery session next time`);
    if (d.swapExercise) notes.push(`${E.MG_LABEL[m]}: consider swapping that exercise`);
  }

  await DB.put("session", s);
  await DB.put("meso", S.meso);
  await loadUser();
  if (wl) { try { wl.release(); } catch (_) {} wl = null; }

  await syncNow(true);
  showSummary(s, notes);
}

function showSummary(s, notes) {
  const dec = s.decision || {};
  sheet(`<h3>Workout complete</h3>
    <div class="sm dim" style="margin:6px 0 12px">Here's what changes next time, and why.</div>
    ${Object.keys(dec).map(m => {
      const d = dec[m];
      const cls = d.delta > 0 ? "b-up" : d.delta < 0 ? "b-dn" : "b-mid";
      const lbl = d.action === "recovery" ? "RECOVERY" : d.delta > 0 ? `+${d.delta} SET${d.delta>1?"S":""}` : d.delta < 0 ? `${d.delta} SET` : "HOLD";
      return `<div class="row" style="padding:12px 0">
        <div class="grow"><div class="lead">${esc(E.MG_LABEL[m])}</div>
        <div class="sm dim" style="margin-top:3px">${esc((d.reasons||[]).join(" · ") || "Steady")}</div></div>
        <span class="badge ${cls}">${lbl}</span></div>`;
    }).join("")}
    ${notes.length ? `<div class="note" style="margin-top:12px">${esc(notes.join(" · "))}</div>` : ""}
    <div class="sheet-ft"><button class="btn" id="okd">Done</button></div>`);
  $("#okd").onclick = () => { closeSheet(); go("workout"); };
}

/* ================================================================
 * MESOS / STATS
 * ================================================================ */
async function viewMesos() {
  const mesos = await DB.all("meso", "user", S.user.id);
  const vol = E.weeklyVolume(S.sessions.filter(s => s.finished), LIB());
  const muscles = Object.keys(vol).sort((a, b) => vol[b] - vol[a]);
  $("#v").innerHTML = `
    <div class="hd"><div class="hd-row"><h2>Mesos</h2></div></div>
    ${S.meso ? `<div class="card"><div class="row"><div class="grow">
      <div class="lead">${esc(S.meso.name)}</div>
      <div class="sm dim" style="margin-top:3px">${S.meso.weeks} weeks · ${S.meso.days.length} days/wk · started ${esc(S.meso.startedAt)}</div>
    </div><span class="badge b-info">ACTIVE</span></div></div>` : ""}
    <h4 style="margin:18px 0 8px">Muscle group stats</h4>
    <div class="card"><div style="padding:12px 14px">
      ${muscles.length ? muscles.map(m => {
        const b = E.band(m, (S.user.emphasis||{})[m] || "grow");
        const pct = Math.min(100, Math.round(vol[m] / Math.max(b.ceil, 1) * 100));
        return `<div class="stat"><div>${mgPill(m, (S.user.emphasis||{})[m])}</div>
          <div><div class="wk"><div style="height:${Math.max(12,pct*.38)}px;background:${mgColor(m)}33">${vol[m]}</div></div>
          <div class="xxs dim2" style="margin-top:2px">${vol[m]} sets · MEV ${b.floor} · ceiling ${b.ceil}</div></div></div>`;
      }).join("") : '<div class="empty">No logged sets yet.</div>'}
    </div></div>
    <h4 style="margin:18px 0 8px">History</h4>
    <div class="card">${S.sessions.filter(s=>s.finished).slice(-12).reverse().map(s => `
      <div class="row"><div class="grow"><div>Week ${s.week} Day ${s.day}</div>
      <div class="sm dim">${esc(s.date)} · ${s.sets.filter(x=>x.done).length} sets${s.off_plan?" · travel":""}</div></div></div>`).join("")
      || '<div class="empty">Nothing logged yet.</div>'}</div>
    ${mesos.length > 1 ? `<div class="sm dim" style="padding:10px 2px">${mesos.length} mesocycles on file. Your loads carry across all of them.</div>` : ""}
    <div style="height:20px"></div>`;
}

/* ================================================================
 * GYMS
 * ================================================================ */
function viewGyms() {
  $("#v").innerHTML = `
    <div class="hd"><div class="hd-row"><h2>Gyms</h2></div>
      <div class="sm dim" style="margin-top:2px">Where are you training today? Meso picks exercises your gym can actually do.</div></div>
    ${S.gyms.map(g => `<div class="card"><div class="row tap" data-gym="${g.gym_id}">
      <div class="grow"><div class="lead">${esc(g.name)}</div>
      <div class="sm dim" style="margin-top:3px">${g.equipment.length} items${g.gym_id===S.meso?.homeGym?" · home gym":""}</div></div>
      ${S.gym.gym_id===g.gym_id ? '<span class="badge b-up">HERE</span>' : ""}
    </div>
    <div style="padding:0 14px 12px" class="xs dim2">${esc(g.equipment.map(e=>e.type.replace(/_/g," ")).join(" · "))}</div>
    </div>`).join("")}
    <div class="sm dim" style="padding:10px 2px">Editing inventories is Phase 3 — for now these live in the seed at the top of <span class="mono xs">js/app.js</span>.</div>`;
  document.querySelectorAll("[data-gym]").forEach(r => r.onclick = async () => {
    S.gym = S.gyms.find(g => g.gym_id === r.dataset.gym);
    DB.pref.set("gym", S.gym.gym_id); S.occupied.clear();
    toast(`Training at ${S.gym.name}`); go("workout");
  });
}

/* ================================================================
 * EXERCISES
 * ================================================================ */
function viewExercises() {
  const lib = LIB();
  $("#v").innerHTML = `
    <div class="hd"><div class="hd-row"><h2>Exercises</h2></div>
      <input id="q" placeholder="Search" style="width:100%;margin-top:10px;background:var(--b2);border:1px solid var(--line);border-radius:var(--r-btn);padding:13px 12px;outline:none">
    </div>
    <div class="sm dim" style="padding:6px 2px" id="cnt"></div>
    <div id="list"></div>`;
  const draw = f => {
    const q = (f || "").toLowerCase();
    const rows = lib.filter(e => !q || e.name.toLowerCase().includes(q) ||
      (e.aliases||[]).some(a => a.toLowerCase().includes(q)) ||
      (e.muscles||[]).some(m => (E.MG_LABEL[m.m]||"").toLowerCase().includes(q)));
    const avail = rows.map(e => ({ e, ok: E.resolveEquipment(e, S.gym, S.occupied).ok }));
    $("#cnt").textContent = `${avail.filter(x=>x.ok).length} of ${rows.length} available at ${S.gym.name}`;
    $("#list").innerHTML = `<div class="card">${avail.map(({e, ok}) => {
      const pm = (e.muscles||[]).find(m => m.role === "primary") || {};
      return `<div class="row" style="${ok?"":"opacity:.35"}">
        <div class="grow"><div class="ell">${esc(e.name)}</div>
        <div class="sm" style="margin-top:2px">
          <span style="color:${mgColor(pm.m)}">●</span>
          <span class="dim">${esc(E.MG_LABEL[pm.m]||"")} · ${esc(equipLabel(e))}</span></div></div>
        ${ok ? "" : '<span class="xxs dim2">n/a here</span>'}</div>`;
    }).join("")}</div>`;
  };
  draw(""); $("#q").oninput = e => draw(e.target.value);
}

/* ================================================================
 * MORE / sync
 * ================================================================ */
function syncClass() {
  const at = DB.pref.get("syncAt", 0);
  if (!DB.pref.get("syncUrl", "")) return "bad";
  if (!at) return "bad";
  return (Date.now() - at) > 7 * 864e5 ? "stale" : "";
}
function syncLabel() {
  const url = DB.pref.get("syncUrl", ""), at = DB.pref.get("syncAt", 0);
  if (!url) return "Not backed up — set up the Sheet in More";
  if (!at) return "Never backed up";
  const h = Math.round((Date.now() - at) / 36e5);
  return h < 1 ? "Backed up just now" : h < 48 ? `Backed up ${h}h ago` : `Backed up ${Math.round(h/24)}d ago`;
}

async function syncNow(quiet) {
  const url = DB.pref.get("syncUrl", "");
  if (!url) { if (!quiet) toast("Add your Sheet link first"); return false; }
  try {
    const blob = await DB.exportUser(S.user.id);
    await fetch(url, { method:"POST", body: JSON.stringify(blob), headers:{ "Content-Type":"text/plain" } });
    DB.pref.set("syncAt", Date.now());
    if (!quiet) toast("Backed up to your Sheet");
    return true;
  } catch (e) {
    // Silent sync failure is the same as no sync — always say so.
    toast("Backup failed — you're still saved on this phone");
    return false;
  }
}

function viewMore() {
  $("#v").innerHTML = `
    <div class="hd"><div class="hd-row"><h2>More</h2></div></div>
    <h4 style="margin:6px 0 8px">Who's training</h4>
    <div class="card">${S.users.map(u => `<div class="row tap" data-u="${u.id}">
      <div class="grow"><div class="lead">${esc(u.name)}</div><div class="sm dim">${u.bodyweight} ${u.unit}</div></div>
      ${S.user.id===u.id?'<span class="badge b-up">YOU</span>':""}</div>`).join("")}</div>
    <div class="xs dim2" style="padding:2px 2px 14px">Separate histories and separate landmarks. Gyms are shared.</div>

    <h4 style="margin:6px 0 8px">Backup</h4>
    <div class="card">
      <div style="padding:14px"><div class="sm dim" style="margin-bottom:8px">The phone is a cache. Your Sheet is the real record — it's what survives a lost phone or a browser wipe.</div>
      <input id="url" placeholder="Apps Script /exec URL" value="${esc(DB.pref.get("syncUrl",""))}"
        style="width:100%;background:var(--b1);border:1px solid var(--line);border-radius:var(--r-btn);padding:13px 12px;outline:none;font-size:.8125rem"></div>
      <div class="row tap" id="save"><div class="grow">Save link</div></div>
      <div class="row tap" id="sn"><div class="grow">Back up now</div><span class="sm dim">${esc(syncLabel())}</span></div>
      <div class="row tap" id="rst"><div class="grow">Restore from Sheet</div></div>
      <div class="row tap" id="exp"><div class="grow">Export JSON</div></div>
    </div>

    <h4 style="margin:18px 0 8px">Settings</h4>
    <div class="card">
      <div class="row"><div class="grow">Theme</div>
        <div class="seg" style="width:150px">
          <button data-th="dark" aria-selected="${document.documentElement.dataset.theme!=="light"}">Dark</button>
          <button data-th="light" aria-selected="${document.documentElement.dataset.theme==="light"}">Light</button>
        </div></div>
      <div class="row tap" id="ver"><div class="grow">Run engine self-check</div><span class="sm dim">50 tests</span></div>
    </div>
    <div class="xs dim2" style="padding:14px 2px 24px">Meso · offline-first · your data stays yours.<br>
      Volume landmarks and the set-progression algorithm follow RP's published rules. Verify in the console with <span class="mono">ENGINE.verify()</span>.</div>`;

  document.querySelectorAll("[data-u]").forEach(r => r.onclick = async () => {
    S.user = S.users.find(u => u.id === r.dataset.u); DB.pref.set("user", S.user.id);
    await loadUser(); toast(`Now training as ${S.user.name}`); go("workout");
  });
  $("#save").onclick = () => { DB.pref.set("syncUrl", $("#url").value.trim()); toast("Saved"); viewMore(); };
  $("#sn").onclick = () => syncNow().then(() => viewMore());
  $("#exp").onclick = async () => {
    const blob = await DB.exportUser(S.user.id);
    const a = el("a"); a.href = URL.createObjectURL(new Blob([JSON.stringify(blob, null, 1)], { type:"application/json" }));
    a.download = `meso-${S.user.id}-${today()}.json`; a.click();
  };
  $("#rst").onclick = async () => {
    const url = DB.pref.get("syncUrl", ""); if (!url) return toast("Add your Sheet link first");
    if (!confirm("Restore from the Sheet? This merges the Sheet's data into this phone.")) return;
    try {
      const r = await fetch(url + "?user=" + encodeURIComponent(S.user.id));
      await DB.importUser(await r.json()); await loadUser(); toast("Restored"); go("workout");
    } catch (e) { toast("Restore failed"); }
  };
  document.querySelectorAll("[data-th]").forEach(b => b.onclick = () => {
    const t = b.dataset.th; document.documentElement.dataset.theme = t;
    document.documentElement.classList.toggle("dark", t === "dark");
    DB.pref.set("theme", t); viewMore();
  });
  $("#ver").onclick = () => { const r = E.verify(); toast(r.pass ? `✅ all ${r.total} passed` : `❌ ${r.fails.length} failed — see console`); };
}

/* ============ sheet ============ */
function sheet(html) {
  $("#sheet").innerHTML = html;
  $("#sheet").classList.add("on"); $("#sbg").classList.add("on");
}
function closeSheet() { $("#sheet").classList.remove("on"); $("#sbg").classList.remove("on"); }
$("#sbg").onclick = closeSheet;

/* ============ go ============ */
const th = DB.pref.get("theme", "dark");
document.documentElement.dataset.theme = th;
document.documentElement.classList.toggle("dark", th === "dark");
boot().catch(e => { console.error(e); $("#v").innerHTML = `<div class="empty">Failed to start: ${esc(e.message)}</div>`; });

return { updateReady, S, go, syncNow, seedMeso, askSorenessUpfront, toast };
})();
