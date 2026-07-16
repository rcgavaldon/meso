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
  // Show the GROUP label — a front-delt slot reads "Shoulders", not "Front Delts".
  return `<span class="mg" style="color:${c};background:color-mix(in srgb, ${c} 20%, transparent)">${bars(n)}${esc(E.groupLabel(E.groupOf(m)))}</span>`;
}
/* A row of pills for a day, DEDUPED by group: three delt slots collapse to one "Shoulders" pill,
   at the strongest emphasis any member carries. */
function mgPills(muscleGroups) {
  const rank = { maintain:0, grow:1, emphasize:2 };
  const byGroup = {};
  for (const g of muscleGroups) {
    const k = E.groupOf(g.m);
    if (!byGroup[k] || rank[g.emphasis] > rank[byGroup[k].emphasis]) byGroup[k] = { m: g.m, emphasis: g.emphasis };
  }
  return Object.values(byGroup).map(g => mgPill(g.m, g.emphasis)).join("");
}
const ICON = {
  today:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M6.5 6.5v11M17.5 6.5v11M3 9v6M21 9v6M6.5 12h11"/></svg>',
  plan:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M4 5h16M4 10h16M4 15h10M4 20h6"/><circle cx="19" cy="16" r="3"/></svg>',
  // Progress gets the CALENDAR glyph, not a chart — the calendar is that tab's headline, and
  // "Progress" alone doesn't telegraph it.
  progress:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><rect x="3" y="4" width="18" height="17" rx="2"/><path d="M3 9h18M8 2v4M16 2v4"/></svg>',
  more:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="5" cy="12" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="19" cy="12" r="1.6"/></svg>',
  check:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M4 12.5l5 5L20 6.5"/></svg>'
};
const DOW3 = ["SUN","MON","TUE","WED","THU","FRI","SAT"];
const MON3 = ["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"];

/* ============ seed data ============ */
/* Phase 1: the program is a JSON seed you edit, not a builder UI. Deliberate — a program
   builder is a week of work that you'd use twice a year. */
const SEED_GYMS = [
  { gym_id:"home", name:"Home Garage", scope:"household",
    constraints:{ ceiling_height_in:96, noise_limit:true, solo_training:true },
    equipment:[
      // Every gym has a floor. Without this you cannot do a PUSH-UP here — bodyweight_only
      // gates pushup / bw_squat / pike / diamond / sissy_squat / nordic / copenhagen.
      { instance_id:"h_bw", type:"floor", caps:["bodyweight_only"], count:1, contention:"low" },
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
  /* ── Crunch Fitness — El Paso Dyer ──────────────────────────────────────────────
   * 9155 Dyer St, El Paso TX 79924 · 24/7. Confirmed as the NE club (El Paso has exactly two
   * Crunch locations: Dyer/NE and Zaragoza/East).
   *
   * ⚠️ SPARSE ON PURPOSE. Built almost entirely from MEMBER photos (grass-cs/ URLs), because the
   * "place hero" photos (gps-cs-s/) on a Google listing are contaminated with neighbouring
   * businesses — a first pass silently pulled in Chuze Fitness and Hardcore Fitness interiors.
   * A whole row of plate-loaded machines IS visible and could not be identified by function, so
   * it is NOT listed: an inventory that claims a pec deck nobody can find is worse than a short
   * one, because the app will confidently prescribe it. Add machines as you confirm them.
   * Unknown numbers are `null`, never a plausible-looking guess.
   * TODO(Robert, 30 seconds next visit): dumbbell min/max, stack min/increment, rack count,
   *   name the plate-loaded row, is there a Smith machine. */
  { gym_id:"crunch", name:"Crunch — Dyer", scope:"household",
    address:"9155 Dyer St, El Paso TX 79924",
    /* Crowding is VERIFIED at this club and it's the one thing remote research nailed.
       Google popular times: Mon 98% / Tue 100% / Wed 86% @ 6PM. Fri+Sat peak only 52% @10AM and
       die after noon; Sunday never exceeds 29%. Corroborated on r/ElPaso ("3-8pm is peak hours
       tho so it's absolutely slammed") and by a member: "Any machine you want will almost always
       be taken for at least 30 mins."
       So `contention:"high"` on the machines here is a measurement, not a prior — it's what
       drives m_contention scoring and the occupied->backup chain. (Crunch's in-app
       "Crunch-O-Meter" is reported inaccurate by two reviewers 3.5 years apart; don't trust it.) */
    constraints:{ solo_training:false },
    equipment:[
      // Every gym has a floor. Without this you cannot do a PUSH-UP here — bodyweight_only
      // gates pushup / bw_squat / pike / diamond / sissy_squat / nordic / copenhagen.
      { instance_id:"cr_bw", type:"floor", caps:["bodyweight_only"], count:1, contention:"low" },
      /* ⚠️ Crunch — Dyer is 35,000 sq ft / $5M (PRWeb opening release + the club's own Facebook
         announcement). The previous inventory modelled it as a garage: it resolved 63/130 while
         the SMALL Anytime franchise resolved 105. The app believed the little 24h gym was twice
         the big-box. That's backwards, and "it knows what your gym actually has" is the whole
         product.
         Everything below is SOURCED, not photographed at this club:
           · cable / resistance bands / TRX / Olympic half-rack platform — crunch.com's own
             "What Equipment Does Crunch Fitness Provide?" page names them explicitly.
           · A selectorized circuit — the official opening release names "half-hour circuit
             training". THAT the machines exist is well-sourced. WHICH machines, and their brand,
             is NOT: no source anywhere — photo, review, video, or official — names a single
             specific strength machine, brand, or dumbbell range at this club. That's a
             researched absence (all 17 Yelp reviews read; Google's topic index over 420 reviews
             has no machine topic), not a search gap.
           ⚠️ The stack numbers below are Hoist's own published RS-1xxx decal (min pin 15lb,
             +15/+15/then +20) used as a stand-in for "a generic commercial selectorized machine".
             Hoist is NOT confirmed here. An earlier pass had min:10/increment:10/add_on:[5],
             which was invented — Hoist's add-on is an OPTIONAL upgrade, not standard (that was
             true of the PRECOR machines at Anytime, where it's verified). Those numbers made
             these machines look better than any real machine.
             Harmless part: loadKey() scopes machine loads per-instance, so the pin scale never
             has to match reality. NOT harmless: `min` is Nina's floor and `increment` decides
             whether progression exists at all.
         TODO(Robert): five minutes with a phone camera at Dyer beats every hour of desk research.
         Photograph the machine row and the top of the dumbbell rack. Until then this is a
         high-prior hypothesis, not a measurement.
         DELIBERATELY OMITTED (a coin-flip, and a wrong entry is worse than a missing one):
         hack squat, hip thrust machine, GHD, pullover, preacher, abductor/adductor, calf
         machines, ab crunch machine, t-bar row. */
      // The single highest-leverage omission: unlocks ~22 cable exercises. min:5 matters more
      // than max — it's Nina's floor on flyes and lateral raises.
      { instance_id:"cr_cable", type:"cable_station", caps:["cable","high_pulley","low_pulley","functional_trainer"],
        attachments:["rope","straight_bar","d_handle","ez_bar","lat_bar","ankle_strap"],
        load:{ kind:"selectorized_stack", min:5, max:200, increment:5 },
        load_portability:"machine_relative", count:2, contention:"med" },
      // Smith bar is counterbalanced ~20lb — matches the library's own smith_squat
      // min_effective_load_hint of bar_lb:20. Sole unlock for smith_squat/ohp/incline.
      { instance_id:"cr_smith", type:"machine", caps:["smith","bench"], bar_weight:20,
        load:{ kind:"plate_loaded", min:20, max:495, increment:5 },
        load_portability:"machine_relative", count:2, contention:"med" },
      // Hoist ROC-IT selectorized. ⚠️ The pin number is NOT pounds — Hoist's own manual says the
      // listed weights are "approximate" because the moving seat changes the ratio. Harmless
      // here: loadKey() scopes machine loads per-instance, so the scale never has to agree with
      // reality. add_on:[5] = Hoist's 5lb upgrade, which halves the step.
      /* ✅ SEEN — the "JOIN THE PARTY" photo shows a long row of PLATE-LOADED ISO-LATERAL machines,
         plates on the horns (45s/35s/25s legible), Hammer-Strength-style frames. This REPLACES the
         selectorized Hoist circuit an earlier pass inferred from "half-hour circuit training" —
         wrong category of machine entirely, and its min:10/inc:10/add_on:[5] were invented.
         Plate-loaded changes the math that matters: loading is per side, so the smallest real jump
         is a 2.5 pair = 5lb total, and there's no stack minimum — the empty arms are the floor. */
      { instance_id:"cr_iso_row", type:"machine", machine_key:"machine_row", caps:["machine"], brand:"Hammer Strength",
        load:{ kind:"plate_loaded", min:0, max:400, increment:5 },
        load_portability:"machine_relative", count:2, contention:"high" },
      { instance_id:"cr_iso_chest", type:"machine", machine_key:"chest_press", caps:["machine"], brand:"Hammer Strength",
        load:{ kind:"plate_loaded", min:0, max:400, increment:5 },
        load_portability:"machine_relative", count:1, contention:"high" },
      { instance_id:"cr_iso_incline", type:"machine", machine_key:"incline_press_machine", caps:["machine"], brand:"Hammer Strength",
        load:{ kind:"plate_loaded", min:0, max:400, increment:5 },
        load_portability:"machine_relative", count:1, contention:"high" },
      { instance_id:"cr_iso_shoulder", type:"machine", machine_key:"shoulder_press_machine", caps:["machine"], brand:"Hammer Strength",
        load:{ kind:"plate_loaded", min:0, max:300, increment:5 },
        load_portability:"machine_relative", count:1, contention:"med" },
      { instance_id:"cr_iso_lat", type:"machine", machine_key:"lat_pulldown", caps:["machine"], brand:"Hammer Strength",
        load:{ kind:"plate_loaded", min:0, max:350, increment:5 },
        load_portability:"machine_relative", count:1, contention:"high" },
      /* ⚠️ NOT visible in any photo. Present because a 35,000 sqft club with a named circuit
         essentially always has them, and Robert's rule is "go with the most common ones, the
         questionnaire fills the gaps." Every one of these is one tap away in Gym → What's here?
         Selectorized stacks: min 15 / inc 15 is the coarse-but-honest commercial default. */
      { instance_id:"cr_pecdeck", type:"machine", machine_key:"pec_deck", caps:["machine"],
        load:{ kind:"selectorized_stack", min:15, max:250, increment:15 },
        load_portability:"machine_relative", count:1, contention:"med" },
      { instance_id:"cr_legext", type:"machine", machine_key:"leg_extension", caps:["machine"],
        load:{ kind:"selectorized_stack", min:15, max:250, increment:15 },
        load_portability:"machine_relative", count:1, contention:"med" },
      { instance_id:"cr_legcurl", type:"machine", machine_key:"leg_curl_seated", caps:["machine"],
        load:{ kind:"selectorized_stack", min:15, max:200, increment:15 },
        load_portability:"machine_relative", count:1, contention:"med" },
      { instance_id:"cr_abd", type:"machine", machine_key:"abductor", caps:["machine"],
        load:{ kind:"selectorized_stack", min:15, max:250, increment:15 },
        load_portability:"machine_relative", count:1, contention:"low" },
      { instance_id:"cr_add", type:"machine", machine_key:"adductor_machine", caps:["machine"],
        load:{ kind:"selectorized_stack", min:15, max:250, increment:15 },
        load_portability:"machine_relative", count:1, contention:"low" },
      { instance_id:"cr_calf", type:"machine", machine_key:"calf_raise_seated", caps:["machine"],
        load:{ kind:"plate_loaded", min:0, max:300, increment:10 },
        load_portability:"machine_relative", count:1, contention:"low" },
      { instance_id:"cr_assist", type:"machine", machine_key:"assisted_pullup", caps:["machine_assistance","dip_station"],
        load:{ kind:"selectorized_stack", min:10, max:200, increment:10 },
        load_portability:"machine_relative", count:1, contention:"low" },
      // source: "Resistance Bands" named on crunch.com's own equipment page.
      { instance_id:"cr_band", type:"band_set", caps:["band"],
        load:{ kind:"variable", levels:["light","medium","heavy"], approx_lb:[15,35,60] },
        load_portability:"absolute", contention:"low" },
      { instance_id:"cr_rack", type:"rack", caps:["squat_rack","barbell","safety_arms","bench","pullup_bar"],
        attrs:{ safety_arms:true }, bar_weight:45,
        load:{ kind:"plate_loaded", min:45, max:495, increment:5 },
        load_portability:"absolute", count:3, count_estimated:true, contention:"high" },
      { instance_id:"cr_bench_station", type:"rack", caps:["barbell","bench","squat_rack","safety_arms"],
        attrs:{ safety_arms:true }, bar_weight:45,
        load:{ kind:"plate_loaded", min:45, max:495, increment:5 },
        load_portability:"absolute", count:4, count_estimated:true, contention:"high" },
      { instance_id:"cr_platform", type:"platform", caps:["barbell","landmine"], bar_weight:45,
        load:{ kind:"plate_loaded", min:45, max:495, increment:5 },
        load_portability:"absolute", count:2, contention:"med" },
      { instance_id:"cr_legpress", type:"machine", machine_key:"leg_press", caps:["machine","leg_press"],
        load:{ kind:"plate_loaded", carriage_weight:65, carriage_weight_estimated:true, min:65, max:700, increment:5 },
        load_portability:"machine_relative", count:2, contention:"high" },
      // ⚠️ min/max UNREAD. 5-120 is the Crunch chain norm, not something anyone saw. This caps
      // Nina's progression AND sets her floor — highest-value thing to verify.
      /* ✅ SEEN — Google Maps place photo (the "PERSPIRE TO GREATNESS" wall). A two-row rack
         running the length of the wall, ~50 pairs. 30 / 35 / 37.5 / 40 / 45 are legible on the
         heads, so 2.5lb increments are REAL here — not a guess — and that's exactly the range
         where granularity decides whether progression exists. The top end isn't legible; 120 for
         a rack that size is plausible and stays UNVERIFIED. Understating max is the safer error:
         canReach() excludes above max, so a low guess only costs the heaviest DB work, which the
         barbell covers anyway. contention: the same photo shows the rack is the centrepiece of
         the floor, and Google popular times put this club at 98-100% Mon-Wed 6PM. */
      { instance_id:"cr_db", type:"dumbbell_set", caps:["dumbbell"],
        load:{ kind:"fixed_pairs", min:5, max:120, increment:2.5, per_hand:true, pairs:true },
        load_portability:"absolute", contention:"med" },
      { instance_id:"cr_bench_adj", type:"bench", caps:["bench","adjustable_bench"],
        attrs:{ adjustable:true, angles:[0,15,30,45,60,75,85] }, count:6, contention:"low" },
      { instance_id:"cr_bench_flat", type:"bench", caps:["bench"], count:4, contention:"low" }
    ] },

  /* ── Anytime Fitness — Northeast El Paso ────────────────────────────────────────
   * 10641 Kenworthy St, El Paso TX 79924 · club #3735 · 24h. Confirmed NE: the club's own
   * Facebook is literally "Anytime Fitness Northeast El Paso", and 79924 is the only AF in the
   * NE zip. Small franchise (~4-5k sqft) — do NOT assume big-box equipment.
   *
   * Only the leg press and prone leg curl were identified by reading their shrouds (both PRECOR).
   * Stack maxima come from Precor's published specs for those units, not from the machines.
   * A member review — "they only have one of each machine" — is why count:1 and the high rack
   * contention. 2+ iso-lateral plate-loaded machines are visible but unnamed, so unlisted.
   * TODO(Robert): dumbbell range, stack min/increment (Precor add-on lever?), rack count 1 or 2,
   *   Smith machine y/n, name the rest of the Precor line (leg extension is the likely one). */
  { gym_id:"anytime", name:"Anytime — Kenworthy", scope:"household",
    address:"10641 Kenworthy St, El Paso TX 79924",
    constraints:{ solo_training:true },   // 24h franchise — often genuinely alone at 5am
    equipment:[
      // Every gym has a floor. Without this you cannot do a PUSH-UP here — bodyweight_only
      // gates pushup / bw_squat / pike / diamond / sissy_squat / nordic / copenhagen.
      { instance_id:"af_bw", type:"floor", caps:["bodyweight_only"], count:1, contention:"low" },
      { instance_id:"af_legpress", type:"machine", machine_key:"leg_press", caps:["machine","leg_press"],
        brand:"Precor",
        load:{ kind:"selectorized_stack", min:10, max:400, increment:10, add_on:[5] },   // RSL0602
        load_portability:"machine_relative", count:1, contention:"med" },
      { instance_id:"af_legcurl", type:"machine", machine_key:"leg_curl_lying", caps:["machine","leg_curl_lying"],
        brand:"Precor",
        load:{ kind:"selectorized_stack", min:10, max:200, increment:10, add_on:[5] },   // RSL0606 prone
        load_portability:"machine_relative", count:1, contention:"med" },
      // ⚠️ range_estimated — no number was legible. 5-75 is a guess at a small-franchise norm.
      { instance_id:"af_db", type:"dumbbell_set", caps:["dumbbell"],
        load:{ kind:"fixed_pairs", min:5, max:75, increment:5, per_hand:true, pairs:true, range_estimated:true },
        load_portability:"absolute", contention:"med" },
      { instance_id:"af_rack", type:"rack", caps:["squat_rack","barbell","safety_arms"],
        attrs:{ safety_arms:true }, bar_weight:45,
        load:{ kind:"plate_loaded", min:45, max:495, increment:5 },   // 5 pairs of 45s + bar
        load_portability:"absolute", count:1, count_estimated:true, contention:"high" },
      { instance_id:"af_bench_press", type:"rack", caps:["barbell","bench"], bar_weight:45,
        load:{ kind:"plate_loaded", min:45, max:495, increment:5 },   // 5 pairs of 45s + bar
        load_portability:"absolute", count:1, contention:"med" },
      { instance_id:"af_bench_adj", type:"bench", caps:["bench","adjustable_bench"],
        attrs:{ adjustable:true, angles:[0,30,45,60,85] }, count:2, count_estimated:true, contention:"med" },
      { instance_id:"af_cable", type:"cable_station", caps:["cable","high_pulley","low_pulley","machine_assistance"],
        attrs:{ pulley_height:"adjustable" }, attachments:["rope","straight_bar","d_handle","ez_bar","lat_bar"],
        load:{ kind:"selectorized_stack", min:10, max:200, increment:10, range_estimated:true },
        load_portability:"machine_relative", count:1, contention:"med" },
      { instance_id:"af_pullup", type:"rack", caps:["pullup_bar","bodyweight_only","dip_station"],
        count:1, contention:"low" },
      { instance_id:"af_band", type:"band_set", caps:["band","machine_assistance"],
        load:{ kind:"variable", levels:["light","medium","heavy"], approx_lb:[15,35,60] },
        load_portability:"absolute", contention:"low" }
    ] },

  /* travel:true is what drives session.off_plan — sets here COUNT toward weekly volume (a set is
     a set) but are excluded from e1RM trend and PRs, so a 50lb dumbbell ceiling never reads as
     detraining. Mark any one-off gym travel; do NOT mark a gym you actually train at. */
  { gym_id:"hotel", name:"Hotel / Travel", scope:"household", travel:true,
    constraints:{ solo_training:true, ceiling_height_in:84 },
    equipment:[
      // Every gym has a floor. Without this you cannot do a PUSH-UP here — bodyweight_only
      // gates pushup / bw_squat / pike / diamond / sissy_squat / nordic / copenhagen.
      { instance_id:"t_bw", type:"floor", caps:["bodyweight_only"], count:1, contention:"low" },
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
/* ⚠️ Emphasis spreads are DELIBERATELY LEAN. The tempting version — everything on Grow with 3 on
   Emphasize — asks for ~168 sets a week against a ~120-set 4-day budget, and the planner correctly
   refuses to build it. Maintain isn't giving up; it's what frees the recovery for the groups you
   actually picked. Change these in More → and recommendSplit() will tell you if they stop fitting. */
/* Admin is not a role, it's an identity. Two users, forever.
 * ⚠️ This is a claim the CLIENT makes about itself — localStorage on a phone, no server, no
 * password, ever. It protects against the only failure that actually happens in a two-person
 * household: mis-taps. The wrong link in a text thread. The family iPad. Opening the app in the
 * parking lot and not noticing it's logged in as the other person. Accident, not adversary.
 * It does NOT protect against Robert deciding to look — the Apps Script /exec URL is in his own
 * More screen and doGet(?user=nina) returns her whole blob. That's the right trade: a credential
 * would lock someone out in a gym with no signal, which is the exact failure this app exists to
 * prevent. The boundary is a product commitment, not a security control. */
const ADMIN_ID = "rob";

const SEED_USERS = [
  { id:"rob", name:"Robert", unit:"lb", bodyweight:185,
    // His words: "all upper all lower, 2 of each". scoreSplit prefers fb4; this is his call to make.
    splitPref:"ul2", goal:"focus", sessionMinutes:60, trainingAge:"advanced",
    emphasis:{ chest:"emphasize", back:"emphasize", side_delt:"emphasize",
               triceps:"grow", biceps:"grow", quads:"grow",
               hamstrings:"maintain", glutes:"maintain", rear_delt:"maintain", front_delt:"maintain",
               calves:"maintain", traps:"maintain", forearms:"maintain", abs:"maintain", adductors:"maintain" },
    overrides:{}, injuries:[], learned_ratios:{}, painFlags:{} },
  { id:"nina", name:"Nina", unit:"lb", bodyweight:132,
    // "for 2 days a week we focus on full body, keep at an hour, simple movements nothing fancy"
    splitPref:"fb2", goal:"focus", sessionMinutes:60, trainingAge:"intermediate",
    emphasis:{ glutes:"emphasize", hamstrings:"emphasize",
               quads:"grow", back:"grow", abs:"grow",
               chest:"maintain", side_delt:"maintain", triceps:"maintain", biceps:"maintain",
               rear_delt:"maintain", front_delt:"maintain", calves:"maintain", traps:"maintain",
               forearms:"maintain", adductors:"maintain" },
    overrides:{}, injuries:[], learned_ratios:{}, painFlags:{} }
];

/**
 * Build a starting mesocycle from the split planner + landmarks + the selection engine.
 * @param splitId optional — omit and it takes recommendSplit()'s pick.
 */
function seedMeso(user, gym, days, weeks, splitId) {
  const rec = E.recommendSplit(user, days);   // reads user.splitPref
  const split = (splitId && E.splitById(splitId)) || rec.best;
  if (!split) throw new Error(rec.why);

  /* ⚠️ TWO DIFFERENT NUMBERS, TWO DIFFERENT JOBS — this is the whole design:
   *   assignDays() plans the SPLIT against END-OF-BLOCK volume (planVolume → MAV/MAV*P), because
   *     the split is fixed for the whole meso and must survive the ramp.
   *   The slots below seed SETS at WEEK-1 volume (band().start → MEV), because that's where you
   *     actually start.
   * Collapsing them — sizing the split off MEV — makes minFrequency() return 1 for everything, so
   * every split validates at every day count and the check is decorative. That was the bug. */
  const plan = E.assignDays(user, split);

  const meso = {
    id: uid(), userId: user.id, name: `${split.name} — ${weeks}wk`, weeks, unit: user.unit,
    splitId: split.id, days: [], startedAt: today(), homeGym: gym.gym_id,
    createdAt: new Date().toISOString(),
    // Persist what the planner had to give up. If Nina's glutes cap at 24 because she trains twice
    // a week, week 4 must SAY so — otherwise the app looks broken exactly when it's being correct.
    caps: plan.muscles.filter(r => r.status !== "ok")
                      .map(r => ({ m: r.m, status: r.status, ceil: r.ceil, why: r.why })),
    budget: rec.budget, forced: rec.forced
  };

  const seen = {};
  plan.days.forEach((pd, i) => {
    const n = (seen[pd.kind] = (seen[pd.kind] || 0) + 1);
    const total = plan.days.filter(d => d.kind === pd.kind).length;
    // [PUB] pulsatility means Upper A and Upper B are genuinely different workouts — different
    // muscle leads. Don't name them the same thing.
    const day = { name: E.DAY_LABEL[pd.kind] + (total > 1 ? " " + "ABCDEF"[n - 1] : ""),
                  kind: pd.kind, muscles: [] };
    const ordered = E.orderDay(user, pd.muscles, i);
    // `chosen` accumulates across the WHOLE day, not per muscle. Scoped per muscle (the obvious
    // mistake) the redundancy penalty never sees across groups, and you get barbell RDL for
    // hamstrings followed by dumbbell RDL for glutes — the same movement twice in one session.
    const chosen = [];
    // [PUB] ≥5 groups in a session → the CLOCK is the binding constraint, not recovery.
    // scoreExercise weights setup_cost 3× when timeboxed. Sets are cheap; SETUPS are what turn a
    // full-body day into three hours.
    const timeboxed = ordered.length >= 5;
    // "Simple movements, nothing fancy." On a short week the whole body has to fit in an hour,
    // twice — that's no place for a low-bar squat. Drives scoreExercise's technique penalty.
    const simple = pd.kind === "full" && plan.days.length <= 3;

    ordered.forEach((m, mi) => {
      const emph = user.emphasis[m] || "grow";
      const b = E.band(m, emph);
      const rep = plan.muscles.find(r => r.m === m);
      const freq = rep ? Math.max(1, rep.freq) : 1;
      // occ = which session of the WEEK this is for THIS muscle — the axis heavy/light lives on.
      const occ = plan.days.filter(d => d.i < i && d.muscles.includes(m)).length;
      /* Two different numbers doing two different jobs:
       *   seed  = MEV (b.start) — where WEEK 1 starts.
       *   cap   = assignDays' clock-trimmed per-session value — where the RAMP must stop.
       * assignDays plans against end-of-block volume and shaves it to fit the hour; without
       * carrying that cap onto the slot, autoregulation ramps toward the band ceiling anyway and
       * week 4 runs 90 minutes. The trim would be decorative. */
      const cap = Math.max(1, Math.min(E.CFG.perSessionMax, (rep && rep.perSession) || E.CFG.perSessionMax));
      /* FILL THE HOUR. Seeding at bare MEV (b.start) makes week 1 a ~50-minute session that only
         reaches 60 by week 4 — you booked an hour, so use it. Start a third of the way from MEV
         to the clock-trimmed cap: still a real ramp (autoregulation has room to add), but the
         first session is worth the drive. The cap is what keeps it inside 60 min. */
      const seed = Math.round(b.start / freq + (cap - b.start / freq) * 0.6);
      const perSession = Math.max(1, Math.min(cap, Math.max(Math.round(b.start / freq), seed)));
      // [PUB] ≥3 sets per exercise on average → 1-2 exercises per muscle per session.
      const nEx = (perSession >= 6 && !timeboxed) ? 2 : 1;
      const g = { m, emphasis: emph, freq, capPerSession: cap, slots: [] };
      const sess = { chosen, timeboxed, simple, fatigueSpent: mi / Math.max(1, ordered.length), occupied: new Set() };
      for (let k = 0; k < nEx; k++) {
        const sets = k === 0 ? Math.ceil(perSession / nEx) : Math.floor(perSession / nEx);
        if (sets < 1) continue;
        const slot = { id: uid(), muscle: m, sets, repRange: E.repRangeFor(occ, freq, k),
                       position: mi + 1, wanted_profile: k === 0 ? "stretch" : "shortened",
                       wants_stretch: k === 0 };
        const pick = E.selectForSlot(slot, gym, Object.assign({}, user, { loadState:{} }), sess, LIB());
        // A slot with no exercise is a hole in the workout — drop it rather than render a muscle
        // group with nothing under it.
        if (!pick.primary) continue;
        slot.exId = pick.primary.ex.id; chosen.push(pick.primary.ex);
        g.slots.push(slot);
      }
      if (g.slots.length) day.muscles.push(g);
    });
    day.estMinutes = E.sessionMinutes(day);
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

  // Personal link: ?u=nina claims this phone for Nina, permanently.
  // We persist it rather than relying on the URL sticking around, because iOS resolves an
  // installed PWA's start_url from the manifest — the query string does NOT survive
  // Add to Home Screen. One visit to the link is enough; it's remembered after that.
  /* Identity, in priority order:
   *   1. window.MESO_USER — hard-set by the per-person entry page (/rob/, /nina/). This is the
   *      ONLY thing that survives iOS "Add to Home Screen": the installed PWA relaunches at its
   *      manifest start_url (the subfolder), which sets this. ?u= in the URL does NOT survive.
   *   2. ?u= query — for opening a link in a normal browser tab.
   *   3. the saved pref, else the first user. */
  const qp = new URLSearchParams(location.search);
  const forced = window.MESO_USER;
  const linked = (forced && S.users.some(u => u.id === forced)) ? forced
               : (qp.get("u") && S.users.some(u => u.id === qp.get("u"))) ? qp.get("u") : null;
  if (linked) {
    DB.pref.set("user", linked);
    if (!forced) history.replaceState(null, "", location.pathname);
  }
  /* Backup is baked in — no pasting a link into settings. Robert asked for this explicitly; the
     tradeoff (anyone with the GitHub URL can read/write the household log) is his to make, and
     it's his household. Set it every boot so it can never be lost. */
  const SHEET_URL = "https://script.google.com/macros/s/AKfycbwsK348paZvWY7UTXfB5Y2T77ufSzPLkF2vpCL9YKOluKwtVk5o7pKuwd8To-oGRR6FXw/exec";
  if (SHEET_URL) DB.pref.set("syncUrl", SHEET_URL);
  const uid_ = DB.pref.get("user", S.users[0].id);
  S.user = S.users.find(u => u.id === uid_) || S.users[0];
  const gid = DB.pref.get("gym", S.gyms[0].gym_id);
  S.gym = S.gyms.find(g => g.gym_id === gid) || S.gyms[0];

  await loadUser();
  renderTabs(); go(DB.pref.get("tab", "workout"));
}

/**
 * The emphasis the CURRENT mesocycle was BUILT from — not the user's live intent.
 *
 * ⚠️ These are two different things and conflating them silently desyncs the engine.
 * seedMeso freezes emphasis onto every muscle group (g.emphasis) and derives the day structure,
 * frequencies and slot.capPerSession from it — all planned against END-OF-BLOCK volume. If
 * autoregulation reads the LIVE map instead, editing your focus areas mid-meso instantly re-aims
 * setDelta at a plan whose days and caps were computed from the old map. Nothing errors; the
 * volume decisions just quietly stop matching the block you're training.
 *
 *   user.emphasis                    = INTENT.   Editable any time. Read only by seedMeso.
 *   meso.days[].muscles[].emphasis   = CONTRACT. Read by autoregulation and progress.
 *
 * The contract is already stored — no new field, no pending-state machinery.
 */
function mesoEmphasis(m) {
  if (S.meso) for (const d of S.meso.days) {
    const g = (d.muscles || []).find(x => x.m === m);
    if (g && g.emphasis) return g.emphasis;
  }
  return (S.user.emphasis || {})[m] || "maintain";
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

/* ============ router ============
 * Past · present · future. Every tab is about training.
 * The old bar was the IndexedDB schema (mesos/gyms/exercises are literally the object stores)
 * with a workout stapled to the front. Nobody opens a training app to browse a noun.
 *   Gyms → a chip in the Today header. It's state you set at the door, not a place you go.
 *   Exercises → the search inside the swap sheet. The library is only ever meaningful
 *               relative to a slot ("what else could go HERE?"), where it can actually rank.
 */
const TABS = [
  { k:"today", t:"Today" },        // present — the session
  { k:"plan", t:"Plan" },          // future  — the meso, weeks × days, no dates
  { k:"progress", t:"Progress" },  // past    — calendar, volume, trend
  { k:"more", t:"More" }
];
/* Required, not cosmetic: an installed PWA has "workout"/"mesos"/"gyms"/"exercises" persisted in
   prefs. Without aliasing, go() renders Today while S.tab stays "exercises" → no tab highlighted,
   and the pref never heals itself. */
const TAB_ALIAS = { workout:"today", mesos:"plan", gyms:"today", exercises:"today" };

/* Nina's app is simpler, not degraded. She trains 2 days, full body, simple movements — Plan's
   only unique content is the budget note and the "what didn't fit" card, whose entire payload is
   an apology for a trade-off SHE didn't make and can't change (her day count is 2). That's
   Robert's screen. Hers is: the workout, the reward, two settings. */
const TABS_FOR = u => ((u && u.id === ADMIN_ID) || S.coachingFor) ? TABS : TABS.filter(t => t.k !== "plan");

function renderTabs() {
  $("#tabs").innerHTML = TABS_FOR(S.user).map(t =>
    `<button data-tab="${t.k}" aria-selected="${S.tab===t.k}">${ICON[t.k]}<span>${t.t}</span></button>`).join("");
  $("#tabs").onclick = e => { const b = e.target.closest("[data-tab]"); if (b) go(b.dataset.tab); };
}
function go(tab) {
  if (typeof stopClock === "function") stopClock();   // leaving the workout view kills its ticker
  tab = TAB_ALIAS[tab] || tab;
  // Also heal a pref pointing at a tab this user doesn't have — otherwise Nina lands on a
  // persisted "plan" and nothing is highlighted.
  if (!TABS_FOR(S.user).some(t => t.k === tab)) tab = "today";
  S.tab = tab; DB.pref.set("tab", tab);
  document.querySelectorAll("#tabs button").forEach(b => b.setAttribute("aria-selected", b.dataset.tab === tab));
  ({ today: viewToday, plan: viewPlan, progress: viewProgress, more: viewMore }[tab])();
  // While coaching, pin a banner so there is never a moment of "wait, whose plan is this?"
  const old = $("#coachbar"); if (old) old.remove();
  if (S.coachingFor) {
    const her = S.users.find(u => u.id === S.coachingFor.her) || S.user;
    const bar = el("div", { id: "coachbar", class: "coachbar" },
      `Editing <b>${esc(her.name)}</b>'s plan <button id="coachDone">Done</button>`);
    document.body.appendChild(bar);
    $("#coachDone").onclick = async () => {
      const me = S.users.find(u => u.id === S.coachingFor.me);
      S.coachingFor = null; S.user = me; await loadUser(); renderTabs(); go("more");
      toast("Back to your own plan");
    };
  }
  scrollTo(0, 0);
}

/* ================================================================
 * THE TWO CLOCKS
 *
 * The app used to have only one, which is why it could never say what day it was.
 *
 *   PROGRAM clock — Week 2, Day 3. Advances ONLY when you finish a session. currentSlot().
 *   CALENDAR clock — Saturday, Jul 15. Advances when the sun comes up. weekStats().
 *
 * ⚠️ These must NEVER call each other. The moment the program reads the calendar, missing a
 * Monday starts costing you something — and that's exactly the trap RP fell into
 * ("You have to start your Meso on Monday, no adjusting the start day which is super annoying").
 *
 * The rule everything below follows from:
 *   The program has no dates. The log has dates. Every calendar affordance reads the LOG and
 *   never the PLAN — so the calendar can only ever describe, never demand. A red X requires a
 *   broken appointment, and no appointment was ever made.
 *
 * And the corollary: missing a day doesn't cost you a workout — the set is still there waiting.
 * It costs you TIME. The only thing that moves is the meso's finish date. So show the finish
 * line, not the hole.
 * ================================================================ */

/* ⚠️ s.date is stamped at ensureSession() — i.e. session CREATION. An unfinished session that
   sits overnight would report the wrong weekday forever. The calendar is about when you
   FINISHED, so always read finishedAt first. (finishWorkout also re-stamps s.date.) */
const onDate = s => (s.finishedAt || s.date || "").slice(0, 10);

function weekStats() {
  const now = new Date();
  const dow = (now.getDay() + 6) % 7;                     // Mon=0 — humans think in Mondays
  const mon = new Date(now); mon.setDate(now.getDate() - dow);
  const monKey = mon.toISOString().slice(0, 10);
  const d7 = new Date(Date.now() - 6 * 864e5).toISOString().slice(0, 10);

  const fin = S.sessions.filter(s => s.finished);
  const week = fin.filter(s => onDate(s) >= monKey);
  const byDow = Array(7).fill(null);
  for (const s of week) byDow[(new Date(onDate(s) + "T12:00").getDay() + 6) % 7] = s;

  return { dow, week, byDow, trailing7: fin.filter(s => onDate(s) >= d7).length,
           perWeek: S.meso ? S.meso.days.length : 0 };
}

/**
 * A week is a RATE, not a quota.
 *  - The count only counts UP. "3 workouts this week", never "3 of 4", never "1 missed".
 *    A fraction implies a denominator you owe. You owe nothing.
 *  - The badge is forward-looking, always: ON PACE or N TO GO. There is no third state.
 *    "To go" is a plan; "behind" is a verdict.
 *  - The badge reads the TRAILING 7 DAYS, not the calendar week — otherwise a Sat+Sun weekend
 *    gets wiped by Monday's reset and the app calls a good week a zero. The dots answer "what
 *    did I do this week" (a log); the badge answers "am I on track" (a rate).
 */
function pace() {
  const cur = currentSlot(), per = S.meso.days.length, w = weekStats();
  const done = S.sessions.filter(s => s.mesoId === S.meso.id && s.finished).length;
  const left = S.meso.weeks * per - done;

  const short = Math.max(0, per - w.trailing7);
  const badge = short === 0 ? "ON PACE" : `${short} TO GO`;   // never "behind", never red
  const cls = short === 0 ? "b-up" : "b-mid";

  // Rate from the last 28 days of ACTUAL training. Under 3 sessions there's nothing to measure,
  // so trust the plan's own assumption rather than extrapolating from noise.
  const since = new Date(Date.now() - 27 * 864e5).toISOString().slice(0, 10);
  const recent = S.sessions.filter(s => s.finished && onDate(s) >= since).length;
  const rate = recent >= 3 ? Math.max(0.5, recent / 4) : per;

  const eta = new Date(Date.now() + Math.round(left / rate * 7) * 864e5);
  const M = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  return { week: cur.week, badge, cls, short,
           line: left <= 0 ? "last session" : `~${M[eta.getMonth()]} ${eta.getDate()} at this rate` };
}

/* Day-kind → color. The strip shows your split at a glance: pink Mon, green Wed, cyan Fri.
   Not decoration — it's the week's shape. */
const KIND_C = { push:"var(--push)", pull:"var(--pull)", legs:"var(--legs)",
                 upper:"var(--push)", lower:"var(--legs)", arms:"var(--acc)", full:"var(--acc)" };
const kindColor = s => (S.meso && KIND_C[(S.meso.days[s.day - 1] || {}).kind]) || "var(--acc)";

/* ================================================================
 * WORKOUT
 * ================================================================ */
/* The week's workouts, done-state and all — the thing the Today strip renders and you tap.
   Program week = the first week whose days aren't ALL finished. Within it you pick any undone day
   in any order; the week only advances when every day is done. */
function weekBoard() {
  const per = S.meso.days.length;
  const doneOn = (w, dn) => S.sessions.some(s => s.mesoId === S.meso.id && s.week === w && s.day === dn && s.finished);
  let week = 1;
  for (; week <= totalWeeks(); week++) {
    if (S.meso.days.filter((_, i) => doneOn(week, i + 1)).length < per) break;
  }
  const days = S.meso.days.map((d, i) => ({
    day: i + 1, name: d.name, kind: d.kind, done: doneOn(week, i + 1),
    started: S.sessions.some(s => s.mesoId === S.meso.id && s.week === week && s.day === i + 1 &&
      !s.finished && (s.sets || []).some(x => x.done))
  }));
  return { week, days, complete: week > totalWeeks(), per };
}
function currentSlot() {
  if (!S.meso) return null;
  const b = weekBoard();
  if (b.complete) return { week: b.week, day: 1, complete: true };
  // Day = your explicit pick (if still undone this week), else the first undone in start-day order.
  const off = S.meso.startDay || 0;
  const order = b.days.slice(off).concat(b.days.slice(0, off));
  let day = (S.pickedDay && !b.days[S.pickedDay - 1].done) ? S.pickedDay
          : (order.find(d => !d.done) || b.days[0]).day;
  return { week: b.week, day };
}
const sessionId = (w, d) => `${S.user.id}|${S.meso.id}|w${w}|d${d}`;
/* An EXTRA session for a day already done this week — bonus volume, its own id so it never
   overwrites the real one, and it doesn't move the program clock (weekBoard keys on the base
   session's done-state, which this leaves alone). */
async function bonusSession(w, d) {
  const n = S.sessions.filter(x => x.mesoId === S.meso.id && x.week === w && x.day === d && x.bonus).length + 1;
  const bid = `${sessionId(w, d)}|b${n}`;
  let ex = await DB.get("session", bid);
  if (ex) return ex;
  const base = await ensureSession(w, d);   // build the same day, then re-id + reset as a bonus
  const s = JSON.parse(JSON.stringify(base));
  s.id = bid; s.bonus = true; s.finished = false; s.date = today();
  s.feedback = {}; s.jointPain = {}; s.decision = {}; delete s.recovery; delete s.gymSubs;
  for (const st of s.sets) { st.id = uid(); st.done = false; st.reps = null; st.at = undefined; }
  await DB.put("session", s);
  return s;
}
// Total program length incl. optional maintenance weeks after the deload.
const totalWeeks = () => S.meso.weeks + (S.meso.maint || 0);
// What KIND of week: the accumulation block, its deload, or a post-deload maintenance week.
const weekKind = w => w < S.meso.weeks ? "accum" : w === S.meso.weeks ? "deload" : "maint";

async function ensureSession(w, d) {
  const id = sessionId(w, d);
  let s = await DB.get("session", id);
  if (s) {
    /* 🔴 The session may have been BUILT at a different gym. This used to return it untouched, so
       switching Home → Hotel left a Pec Deck sitting in your session with off_plan still false.
       ensureSession only auto-substitutes on CREATE; a stale session slipped past all of it. */
    if (s.gymId !== S.gym.gym_id && !s.finished) {
      const started = (s.sets || []).some(x => x.done);
      if (!started) { await DB.del("session", id); s = null; }   // not begun — rebuild for here
      else {
        // Mid-workout: keep what you've done, but re-home the session and swap any PENDING set
        // whose exercise this gym can't do. Logged sets are history and stay put.
        s.gymId = S.gym.gym_id; s.off_plan = S.gym.travel === true;
        const swapped = [];
        for (const st of s.sets) {
          if (st.done || st.reps === -1) continue;
          const ex = LIB().find(e => e.id === st.exId);
          if (ex && E.resolveEquipment(ex, S.gym, S.occupied).ok) continue;
          const pick = E.selectForSlot({ muscle: st.muscle, repRange: st.repRange || [8,12], rir: st.rir,
              position: 1, exId: st.exId }, S.gym, S.user,
            { chosen: [], fatigueSpent: .3, occupied: S.occupied }, LIB());
          if (!pick.primary) continue;
          const bind = pick.primary.bind, to = pick.primary.ex;
          const tgt = E.targetLoad(S.user, to, bind, { repRange: st.repRange || [8,12], rir: st.rir, muscle: st.muscle });
          st.sub = { of: st.exId, reason: "gym" };   // record ORIGINAL id before overwriting
          st.exId = to.id; st.instanceId = bind.carrier ? bind.carrier.instance_id : null;
          st.load = st.targetLoad = tgt && tgt.load; st.est = tgt && tgt.why === "ratio" ? tgt.confidence : null;
          swapped.push(to.name);
        }
        if (swapped.length) s.gymSubs = (s.gymSubs || []).concat(swapped.map(n => ({ to: n })));
        await DB.put("session", s);
        return s;
      }
    } else return s;
  }
  const day = S.meso.days[d - 1];
  const rir = (w > S.meso.weeks) ? 3 : E.rirForWeek(w, S.meso.weeks);
  const deload = E.isDeload(w, S.meso.weeks);
  const maint = w > S.meso.weeks;   // post-deload holding week
  /* ⚠️ off_plan is a property of the GYM, not a comparison against the meso's birthplace.
   *
   * It used to be `S.gym.gym_id !== S.meso.homeGym`, which is catastrophically wrong for anyone
   * who trains at more than one real gym: create the meso at home, then train at Crunch all
   * year, and EVERY session is flagged travel → excluded from e1RM trend and PRs → Progress
   * shows nothing, forever. The app would look broken while being "correct".
   *
   * The flag exists for one reason: a constrained environment must not read as detraining. That's
   * a fact about the PLACE (a hotel's 50lb dumbbell ceiling), not about which gym you were
   * standing in when you tapped Create. Crunch and Anytime are both real gyms with real
   * progression. Only the hotel is travel. */
  s = { id, userId: S.user.id, mesoId: S.meso.id, week: w, day: d, date: today(),
        gymId: S.gym.gym_id, off_plan: S.gym.travel === true,
        sets: [], feedback: {}, jointPain: {}, finished: false };

  const subs = [];   // slots this gym couldn't do, auto-swapped — surfaced on the Today screen
  /* Muscles the last session of this day flagged for a recovery session. [PUB] "If you've
     under-performed two sessions in a row, you have likely hit your MRV" → cut sets and reps in
     half at the same load, then resume at the MEV↔MRV midpoint. */
  const lastSame = S.sessions.filter(x => x.mesoId === S.meso.id && x.finished && x.day === d && x.week < w)
    .sort((a, b) => b.week - a.week)[0];
  const recovery = (lastSame && lastSame.recovery) || {};
  for (const g of day.muscles) {
    if (deload && E.deloadDrops(g.m)) continue;      // [APP] traps + forearms come out of deload
    for (const slot of g.slots) {
      let ex = LIB().find(x => x.id === slot.exId);
      if (!ex) continue;
      let bind = E.resolveEquipment(ex, S.gym, S.occupied);
      /* 🔴 THE SLOT'S EXERCISE MAY NOT EXIST AT TODAY'S GYM.
         Slots are baked at seed time against the gym you were standing in. Change gyms and the
         plan still names a pec deck. This used to compute `bind` and never check `bind.ok`, so
         it rendered a full logging card for a Seated Leg Curl at a hotel with a floor, three
         dumbbells and a bench — labelled "Machine", with no warning. That's the product's whole
         claim inverted, on the travel flow, which is exactly when it's least recoverable.
         The backup chain already exists — use it. Auto-substitute, record why, and only drop the
         slot if this gym genuinely can't train the muscle. */
      if (!bind.ok) {
        const pick = E.selectForSlot(Object.assign({}, slot, { rir }), S.gym, S.user,
          { chosen: s.sets.map(x => LIB().find(e => e.id === x.exId)).filter(Boolean),
            fatigueSpent: .3, occupied: S.occupied, timeboxed: day.muscles.length >= 5 }, LIB());
        if (!pick.primary) continue;                       // this gym can't train it at all
        subs.push({ from: ex.name, to: pick.primary.ex.id });
        ex = pick.primary.ex; bind = pick.primary.bind;
      }
      const sl = Object.assign({}, slot, { rir: Math.max(rir, E.rirFloor(ex)) });
      const tgt = bind.ok ? E.targetLoad(S.user, ex, bind, sl) : null;
      /* 🔴 USE progress()'s REPS. This used to hardcode reps = repRange[1] and drop tgt.reps on
         the floor. Two consequences, both bad:
          · Reps never progressed — every prescription sat at the top of the range forever.
          · Because targetReps was pinned to `hi`, a lifter who hits their reps ALWAYS has
            last.reps === hi, so progress()'s "the jump is too coarse, add a rep instead" branch
            was unreachable. The app took every coarse jump instead: band lateral raise 15→35
            (+133% load) with reps held, cable lateral raise +25%. Side delts read "+106%" on the
            Progress tab. The documented rule was live in the engine and dead in the app. */
      let sets = slot.sets, load = tgt && tgt.load;
      let reps = (tgt && tgt.reps != null) ? tgt.reps : (slot.repRange || [8,12])[1];
      /* The deload's SECOND half halves the load — [PUB] "cut not only sets and reps in half, but
         the weights as well." "first" was hardcoded at the only call site, so days 3-4 prescribed
         105-120% of the last hard week. The deload was heavier than the block it was recovering
         from. */
      if (deload) {
        const perWeek = S.meso.days.length;
        const half = (d - 1) < Math.ceil(perWeek / 2) ? "first" : "second";
        const dp = E.deloadPrescription({ sets, reps, load: load || 0 }, g.m, half);
        sets = dp.sets; reps = dp.reps; load = dp.load || load;
      } else if (maint) {
        /* Maintenance: hold the muscle at its MV — the minimum to keep what you built — at a
           comfortable RIR. Not a ramp, not a deload; a holding pattern for a break or a busy
           stretch. [PUB] MV is "the amount you need to train to keep the muscle you have." */
        const L = E.landmarks(g.m);
        sets = Math.max(1, Math.min(sets, Math.ceil((L.mv[1] || 2) / Math.max(1, g.freq || 1))));
        reps = (slot.repRange || [8,12])[1];
      } else if (recovery[g.m]) {
        /* [PUB] Recovery session: half sets AND half reps at the SAME load. The load holding is
           the point — you're cutting volume, not intensity. */
        const rp = E.recoverySession({ sets, reps, load: load || 0, rir: sl.rir });
        sets = rp.sets; reps = rp.reps; load = rp.load || load;
      }
      // The set carries its rep bucket so recordLoadState can scope the memory without
      // re-deriving the slot. Heavy Monday and light Friday must not share a load memory.
      const bucket = E.repBucket ? E.repBucket(slot.repRange || [8,12]) : null;
      /* [PUB] RP prices a warm-up ramp into every first-exercise-of-a-muscle; the 60-min clock is
         already costed on it (warmupSeconds). Prescribe it too — telling you "60 minutes" while
         leaving you to guess the ramp is the gap. Never logged, never counted toward volume:
         [PUB] a countable set is 5-30 reps at 0-4 RIR and these are nowhere near failure. */
      const firstForMuscle = !s.sets.some(x => x.muscle === g.m);
      if (!deload && !maint) for (const w of E.warmupSets(load, bind.plan, ex, firstForMuscle)) {
        s.sets.push({ id: uid(), slotId: slot.id, muscle: g.m, exId: ex.id, bucket,
          repRange: slot.repRange, sub: ex.id !== slot.exId ? { of: slot.exId, reason: "gym" } : undefined, warmup: true, pct: w.pct,
          instanceId: bind.ok && bind.carrier ? bind.carrier.instance_id : null,
          load: w.load, reps: null, targetReps: w.reps, targetLoad: w.load,
          rir: null, done: false, est: null });
      }
      for (let i = 0; i < sets; i++) {
        s.sets.push({ id: uid(), slotId: slot.id, muscle: g.m, exId: ex.id, bucket,
          repRange: slot.repRange, sub: ex.id !== slot.exId ? { of: slot.exId, reason: "gym" } : undefined,
          instanceId: bind.ok && bind.carrier ? bind.carrier.instance_id : null,
          load: load || null, reps: null, targetReps: reps, targetLoad: load || null,
          // Only a real cross-exercise RATIO estimate earns the calibration note. A "feel_out"
          // (no history at all) is not an estimate — there's nothing to have estimated from.
          rir: sl.rir, done: false, est: tgt && tgt.why === "ratio" ? tgt.confidence : null });
      }
    }
  }
  if (subs.length) s.gymSubs = subs;   // say it out loud; a silent swap is how trust dies
  await DB.put("session", s);
  return s;
}

async function viewToday() {
  if (!S.meso) return viewNoMeso();
  const cur = currentSlot();
  if (cur.complete) return viewMesoComplete();   // weekBoard's complete already counts maint weeks
  S.session = await ensureSession(cur.week, cur.day);
  drawToday();
  wake();
  /* Preload this week's demo clips + their alternates while we (probably) have signal.
     Robert always has internet at home; the gym is where he doesn't. So pay for the media HERE,
     not at the moment he taps Swap standing in front of an occupied pec deck.
     Fire-and-forget: media is disposable, training data is not, and a 404 must never surface. */
  if (navigator.onLine && window.MEDIA) {
    const key = `${S.meso.id}|w${cur.week}`;
    if (S._mediaWeek !== key) {
      S._mediaWeek = key;
      MEDIA.prefetchWeek(S.session, S.gym, S.user, LIB(), E)
        .then(r => r && r.cached && console.log(`[media] cached ${r.cached} of ${r.cached + r.missing} clips for week ${cur.week}`))
        .catch(() => {});
    }
  }
  // NOTE: askSorenessUpfront no longer auto-fires here. Opening the app is not consent to answer
  // questions — you'd get a modal in the face in the parking lot before seeing anything. It now
  // fires from "Start", or lazily from the first logSet() if you skip the button and just lift.
  // Same data, same batching, no ambush.
}

/* ================================================================
 * THE INTAKE — days · focus areas · weeks
 *
 * Three questions, and only the middle one is interesting.
 *
 * Deliberately NOT asked:
 *  · Goal (aesthetics/strength/general) — the engine has no knob for it. RIR is a fixed calendar,
 *    reps are fixed by repRangeFor, load is the solved variable. A goal question would collect an
 *    answer nothing reads. "Focus areas" IS the goal, fully expressed, landing on the one field
 *    the engine actually uses.
 *  · Experience level — one call site, worth ±0.3 on a split score. Training age already drives
 *    the split THROUGH volume; a second pathway double-counts. It's a constant, not intake.
 *  · Bodyweight — zero engine call sites. Asking implies it does something.
 *  · Session length — only offered at the moment it binds (when a pick freezes something).
 * ================================================================ */
const INTAKE = { days: 4, weeks: 5, focus: [], startDay: 0, maint: 0, _daysTouched: false };
/* One source of truth for which day counts a user may pick. The segment and the "Train N days"
   advice button both read it — they disagreed, and the button could set a value the segment
   couldn't render, leaving nothing selected and no way back. */
const dayChoices = () => (S.user && S.user.id === ADMIN_ID) ? [2,3,4,5,6] : [2,3];
const maxDays = () => dayChoices()[dayChoices().length - 1];

function viewNoMeso() {
  const admin = S.user.id === ADMIN_ID;
  if (!INTAKE.focus.length && S.user.emphasis)
    INTAKE.focus = [...new Set(Object.keys(S.user.emphasis).filter(m => S.user.emphasis[m] === "emphasize").map(E.groupOf))];
  // Sensible per-person default: Nina trains 2 days, Robert 4. He can still change it.
  if (!INTAKE._daysTouched) INTAKE.days = admin ? 4 : 2;
  INTAKE.days = Math.min(INTAKE.days, maxDays());
  drawIntake();
}

function drawIntake() {
  const p = E.previewFocus(INTAKE.focus, INTAKE.days,
    { sessionMinutes: S.user.sessionMinutes, splitPref: S.user.splitPref, trainingAge: S.user.trainingAge });
  const byCat = { push: [], pull: [], legs: [], acc: [] };
  for (const g of E.GROUPS) (byCat[g.cat] || byCat.acc).push(g.key);   // coarse groups, not 15 muscles
  const CATN = { push: "Push", pull: "Pull", legs: "Legs", acc: "Core & grip" };
  const mins = p.minutes && p.minutes.length ? Math.max.apply(null, p.minutes) : null;

  $("#v").innerHTML = `
    <div class="hd"><div class="hd-row"><h2>${S.coachingFor ? esc(S.user.name) + "'s focus" : "Focus areas"}</h2></div>
      <div class="sm dim" style="margin-top:3px">Everything gets trained. Pick the few that get to grow.</div>
    </div>

    <div class="card"><div class="row"><div class="grow">Days a week</div></div>
      <div style="padding:0 14px 14px"><div class="seg" id="dseg">
        ${dayChoices().map(d =>
          `<button data-d="${d}" aria-selected="${d===INTAKE.days}">${d}</button>`).join("")}
      </div></div>
    </div>

    <div class="card" id="ledger">
      <div class="row"><div class="grow">
        <div class="lead">${INTAKE.focus.length} focus area${INTAKE.focus.length===1?"":"s"}${p.split ? ` · ${esc(p.split.name)}` : ""}</div>
        <div class="sm dim" style="margin-top:3px">
          ${p.covered}/15 groups trained${mins ? ` · ~${mins} min a day` : ""}</div>
      </div>${p.frozen.length ? '<span class="badge b-warn">FROZEN</span>' : '<span class="badge b-up">OK</span>'}</div>
    </div>

    ${Object.keys(byCat).map(c => `
      <div class="xxs dim2" style="margin:14px 2px 6px;letter-spacing:.08em;font-weight:700">${CATN[c].toUpperCase()}</div>
      <div class="pills">${byCat[c].map(m => focusChip(m, p)).join("")}</div>`).join("")}

    <div id="advice" style="margin-top:14px"></div>

    ${p.plan && p.plan.days.length > 1 ? `
    <div class="card" style="margin-top:14px"><div class="row"><div class="grow">Start with
      <span class="dim sm">— already trained this week? Skip ahead.</span></div></div>
      <div style="padding:0 14px 14px"><div class="seg" id="sdseg">
        ${p.plan.days.map((d2, i) => `<button data-sd="${i}" aria-selected="${(INTAKE.startDay||0)===i}">
          ${esc(E.DAY_LABEL[d2.kind] || d2.kind)}${p.plan.days.filter(x=>x.kind===d2.kind).length>1 ? " " + "ABCDEF"[p.plan.days.slice(0,i+1).filter(x=>x.kind===d2.kind).length-1] : ""}</button>`).join("")}
      </div></div>
    </div>` : ""}

    <div class="card" style="margin-top:14px"><div class="row"><div class="grow">Weeks <span class="dim sm">(last is the deload)</span></div></div>
      <div style="padding:0 14px 14px"><div class="seg" id="wseg">
        ${[4,5,6].map(w => `<button data-w="${w}" aria-selected="${w===INTAKE.weeks}">${w}</button>`).join("")}
      </div></div>
      <div class="row"><div class="grow">Maintenance after
        <span class="dim sm">— easy holding weeks post-deload, for a break or a busy stretch</span></div></div>
      <div style="padding:0 14px 14px"><div class="seg" id="mwseg">
        ${[0,1,2].map(w => `<button data-mw="${w}" aria-selected="${w===(INTAKE.maint||0)}">${w===0?"None":w+"wk"}</button>`).join("")}
      </div></div>
    </div>

    <button class="btn wide" id="mk" style="margin-bottom:8px">${
      p.frozen.length && p.frozen.length === INTAKE.focus.length && INTAKE.focus.length
        ? "Create anyway — nothing will grow" : "Create mesocycle"}</button>
    <div class="sync"><span class="dot"></span> ${esc(S.user.name)} · ${esc(S.gym.name)}</div>
    <div style="height:14px"></div>`;

  drawAdvice(p);
  $("#dseg").onclick = e => { const b = e.target.closest("[data-d]"); if (!b) return;
    INTAKE.days = +b.dataset.d; INTAKE._daysTouched = true; drawIntake(); };
  $("#wseg").onclick = e => { const b = e.target.closest("[data-w]"); if (!b) return;
    INTAKE.weeks = +b.dataset.w; drawIntake(); };
  const mw = $("#mwseg"); if (mw) mw.onclick = e => { const b = e.target.closest("[data-mw]"); if (!b) return;
    INTAKE.maint = +b.dataset.mw; drawIntake(); };
  const sd = $("#sdseg"); if (sd) sd.onclick = e => { const b = e.target.closest("[data-sd]"); if (!b) return;
    INTAKE.startDay = +b.dataset.sd; drawIntake(); };
  document.querySelectorAll("[data-f]").forEach(c => c.onclick = () => {
    const m = c.dataset.f;
    const i = INTAKE.focus.indexOf(m);
    i < 0 ? INTAKE.focus.push(m) : INTAKE.focus.splice(i, 1);
    drawIntake();
  });
  $("#mk").onclick = async () => {
    if (!LIB().length) return toast("Exercise library hasn't loaded");
    S.user.emphasis = E.buildEmphasis(INTAKE.focus);
    await DB.put("kv", { k: "users", v: S.users });
    const m = seedMeso(S.user, S.gym, INTAKE.days, INTAKE.weeks);
    m.startDay = INTAKE.startDay || 0;
    m.maint = INTAKE.maint || 0;
    await DB.put("meso", m);
    if (S.coachingFor) {                            // built for her — give the app back to him
      const her = S.user.name, me = S.users.find(u => u.id === S.coachingFor.me);
      S.coachingFor = null; S.user = me; await loadUser(); renderTabs(); go("more");
      return toast(`${her}'s ${m.name} is ready`);
    }
    await loadUser(); go("today");
    toast(`${m.name} created`);
  };
}

/* The `+N` badge is the product: it's `room` — how many sets this block can actually ADD before
   the clock caps it. It is the only number on the screen that's true. A focus area at 0 does the
   same sets in week 5 as week 1. */
function focusChip(g, p) {
  const on = INTAKE.focus.includes(g);
  const ms = E.groupMuscles(g);
  const room = ms.reduce((a, m) => { const r = p.rows.find(x => x.m === m); return a + (r ? r.room : 0); }, 0);
  const dead = on && room <= 0;
  const c = mgColor(ms[0]);
  const style = on
    ? `color:${c};background:color-mix(in srgb, ${c} ${dead?10:22}%, transparent);border-color:${dead?"var(--wac)":c}`
    : `border-color:var(--line);opacity:.5`;
  return `<button class="fchip" data-f="${g}" aria-pressed="${on}" style="${style}">
    ${esc(E.groupLabel(g))}${on ? `<b>${room > 0 ? "+" + room : "0"}</b>` : ""}</button>`;
}

/* Enforcement is a LIVE LEDGER, not a cap. Three reasons the "max 4 focus areas" rule is wrong:
 *  1. "3-4" isn't a constant, it's an output — 3 at 60 min, 4 at 75, and 1 for Nina at 2 days.
 *  2. A hard block contradicts the whole codebase: assignDays never refuses, it trims and reports.
 *  3. The cost isn't paid by the new pick — it's paid by the OLD ones. You watch your existing
 *     focus areas lose their room, which enforces it without inventing a rule the engine lacks. */
function drawAdvice(p) {
  const el = $("#advice"); if (!el) return;
  const n = INTAKE.focus.length;
  if (!n) {
    el.innerHTML = `<div class="card"><div style="padding:14px" class="sm dim">
      <b style="opacity:1">Even coverage.</b> Every group trained, none of them growing. That's a real
      plan — it holds what you've got. Tap one or two to actually grow something.</div></div>`;
    return;
  }
  const frozen = p.frozen;
  const all = frozen.length === n;
  if (!frozen.length) {
    el.innerHTML = INTAKE.days <= 2 && p.missing.length
      ? `<div class="card"><div style="padding:14px" class="sm dim">At ${INTAKE.days} days there's room for
         ${6*INTAKE.days} muscle groups in a week and there are 15. ${[...new Set(p.missing.map(E.groupOf))].slice(0,3).map(g=>esc(E.groupLabel(g))).join(", ")}
         sit out. Nothing you pick changes that — it's the day count.</div></div>` : "";
    return;
  }
  const names = frozen.map(g => esc(E.groupLabel(g))).join(" and ");
  el.innerHTML = `<div class="card" style="border-color:var(--wac)"><div style="padding:14px">
    <div class="lead" style="color:var(--wac)">${all ? "Nothing here can grow." : names + " stopped growing."}</div>
    <div class="sm dim" style="margin:7px 0 12px">${
      all ? `${n} focus area${n===1?"":"s"}, and not one has room to add a set across the whole block.
             An hour buys about 17 working sets once you've paid for warm-ups and rest.`
          : `${names} ${frozen.length===1?"has":"have"} no room left — ${frozen.length===1?"it'll do":"they'll do"}
             the same sets in week 5 as in week 1.`}</div>
    <div style="display:flex;gap:8px;flex-wrap:wrap">
      <button class="btn ghost" id="advTrim">Keep my top ${Math.max(1, n-1)}</button>
      <button class="btn ghost" id="advMin">Make it ${(S.user.sessionMinutes||E.CFG.sessionMinutesMax)+15} minutes</button>
      ${INTAKE.days < maxDays() ? `<button class="btn ghost" id="advDay">Train ${INTAKE.days+1} days</button>` : ""}
    </div></div></div>`;
  // Deselect by lowest room — drop what's contributing least, not what was tapped last.
  $("#advTrim").onclick = () => {
    const gRoom = g => E.groupMuscles(g).reduce((a,m)=>a+((p.rows.find(r=>r.m===m)||{room:0}).room),0);
    const ranked = INTAKE.focus.slice().sort((a,b) => gRoom(a) - gRoom(b));
    INTAKE.focus = INTAKE.focus.filter(g => g !== ranked[0]); drawIntake();
  };
  $("#advMin").onclick = async () => {
    S.user.sessionMinutes = (S.user.sessionMinutes || E.CFG.sessionMinutesMax) + 15;
    await DB.put("kv", { k: "users", v: S.users });
    toast(`Sessions are now ~${S.user.sessionMinutes} minutes`); drawIntake();
  };
  // Only offer a day count this user can actually select — the segment is [2,3] for non-admin,
  // so bumping Nina to 4 rendered a segment with NOTHING selected and no way back.
  const ad = $("#advDay"); if (ad) ad.onclick = () => { INTAKE.days = Math.min(INTAKE.days + 1, maxDays()); drawIntake(); };
}

function viewMesoComplete() {
  $("#v").innerHTML = `
    <div class="hd"><div class="hd-row"><h2>Mesocycle complete</h2></div></div>
    <div class="card"><div class="row"><div class="grow">
      <div class="lead">${esc(S.meso.name)}</div>
      <div class="sm dim" style="margin-top:4px">Every meso you finish is more muscle on top of what you've already built. Your loads carry into the next one — unlike RP's app, which starts you over.</div>
    </div></div></div>
    <button class="btn wide" id="nx">Plan the next mesocycle</button>`;
  $("#nx").onclick = async () => { S.meso = null; go("today"); };
}

/* Two clocks, two lines. The eyebrow is the CALENDAR clock (a fact about the world); the h2 is the
   PROGRAM clock (a fact about the plan). Never fused into one string — fusing them is exactly what
   "WEEK 1 DAY 1" did wrong: a database coordinate pretending to be information. And "Monday: Push"
   is the sentence that becomes RP's "you have to start your meso on Monday". */
function todayHeader(day) {
  const d = new Date();
  return `<div class="hd"><div class="hd-row">
    <div class="grow">
      <div class="eyebrow">${DOW3[d.getDay()]} · ${MON3[d.getMonth()]} ${d.getDate()}</div>
      <h2>${esc(day.name)}</h2>
    </div>
    <div class="hd-act">
      <button class="chip" id="gymc"><span class="t">${esc(S.gym.name)}</span><span class="dim2">▾</span></button>
    </div>
  </div></div>`;
}

/* Your N workouts for this program week, as a tappable row. Done ones carry a check; the one
   you're on glows; tap any UNDONE one to switch to it. "keeps track through the week." */
function weekBoardStrip() {
  const b = weekBoard(); if (b.complete) return "";
  const curDay = currentSlot().day;
  const anyLeft = b.days.some(d => !d.done);
  return `<div class="card"><div class="wbrow">${b.days.map(d => {
    const state = d.done ? "done" : d.day === curDay ? "now" : d.started ? "part" : "todo";
    const c = E.CAT_COLOR[({ upper:"push", lower:"legs", push:"push", pull:"pull", legs:"legs", full:"acc", arms:"acc" })[d.kind]] || "var(--acc)";
    // Done workouts stay TAPPABLE — tap one to do it again as a bonus this week. "redo day 1 then 2."
    return `<button class="wbday" data-wbday="${d.day}" data-s="${state}" style="--c:${c}">
      <span class="wbn">${esc(d.name)}</span>
      <span class="wbmark">${d.done ? "✓" : d.day === curDay ? "●" : d.started ? "◐" : ""}</span>
    </button>`;
  }).join("")}</div>
  <div class="xs dim2" style="padding:0 14px 12px">Week ${b.week} of ${S.meso.weeks} · ${b.days.filter(d=>d.done).length}/${b.per} done · ${anyLeft ? "tap a workout to switch" : "tap a ✓ workout to do it again"}</div>
  </div>`;
}

function weekStrip() {
  const w = weekStats(), p = pace();
  const L = ["M","T","W","T","F","S","S"];
  return `<div class="card">
    <div class="wkstrip">${L.map((l, i) => {
      const hit = w.byDow[i];
      return `<div class="wkd${i === w.dow ? " now" : ""}">
        <span class="wkl">${l}</span>
        <i class="dot${hit ? " on" : ""}"${hit ? ` style="--c:${kindColor(hit)}"` : ""}></i>
      </div>`;
    }).join("")}</div>
    <div class="row">
      <div class="grow">
        <div class="lead">${w.week.length} workout${w.week.length === 1 ? "" : "s"} this week</div>
        <div class="sm dim" style="margin-top:3px">Week ${p.week} of ${S.meso.weeks} · ${esc(p.line)}</div>
      </div>
      <span class="badge ${p.cls}">${p.badge}</span>
    </div>
  </div>`;
}

function todayCard(day, s) {
  const started = s.sets.some(x => x.done);
  const done = s.sets.filter(x => x.done || x.reps === -1).length;
  const nEx = new Set(s.sets.map(x => x.exId)).size;
  const deload = E.isDeload(s.week, S.meso.weeks);
  return `<div class="card">
    <div class="row"><div class="grow pills">
      ${mgPills(day.muscles.filter(g => s.sets.some(x => x.muscle === g.m)))}
    </div></div>
    <div class="row"><div class="grow sm dim">
      ${s.sets.length} sets · ${nEx} exercise${nEx === 1 ? "" : "s"}${day.estMinutes ? ` · ~${day.estMinutes} min` : ""}
      ${deload ? ' · <span class="badge b-warn">DELOAD</span>' : ` · <span class="dim2">${E.rirForWeek(s.week, S.meso.weeks)} RIR</span>`}
      ${s.off_plan ? ' · <span class="badge b-info">Travel</span>' : ""}
    </div></div>
    ${started
      ? `<div class="row wkclock-row">
           <div class="wkclock-box"><span id="wkclock" class="wkclock">0:00</span><span id="wkpace" class="wkpace">~${S.user.sessionMinutes || E.CFG.sessionMinutesMax} min budget</span></div>
           <div class="grow">
             <div class="pbar"><i style="width:${Math.round(done / s.sets.length * 100)}%"></i></div>
             <div class="xs dim2" style="margin-top:6px">${done} of ${s.sets.length} sets logged</div>
           </div>
         </div>`
      : `<div style="padding:0 14px 14px"><button class="btn wide" id="start">Start ${esc(day.name)}</button></div>`}
  </div>`;
}

/* ============ Workout clock ============
 * Robert wanted a running timer for the whole session plus a per-exercise time budget, so the
 * hour cap the engine already plans against becomes something you can pace against in the moment.
 * The session is stamped `beganAt` the instant you Start (or log your first set), and it lives on
 * the session record — so a reload mid-workout keeps counting, it doesn't restart the clock. */
function beginClock() {
  if (!S.session.beganAt) { S.session.beganAt = new Date().toISOString(); DB.put("session", S.session); }
}
function fmtClock(sec) {
  sec = Math.max(0, Math.round(sec));
  const m = Math.floor(sec / 60), s = sec % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}
/** Minutes budgeted for one exercise — same cost model the 60-min planner uses (sessionMinutes),
 *  so the per-exercise numbers sum to the session estimate. isFirst → a fresh muscle earns a full
 *  warm-up ramp; a 2nd exercise for the same muscle doesn't. */
function exMinutes(e, muscle, isFirst) {
  const ex = LIB().find(x => x.id === e.exId);
  const r = (E.REST && E.REST[muscle]) || [60, 120];
  const working = e.sets.filter(x => !x.warmup).length || e.sets.length;
  let sec = E.SETUP_SEC + E.warmupSeconds(ex, isFirst);
  sec += working * ((r[0] + r[1]) / 2 + E.WORK_SEC);
  return Math.max(1, Math.round(sec / 60));
}
/** The live tick — updates only the clock/pace text so it never steals focus from a set input. */
function tickClock() {
  const el = $("#wkclock"); if (!el || !S.session || !S.session.beganAt) return stopClock();
  const s = S.session;
  const elapsed = (Date.now() - new Date(s.beganAt).getTime()) / 1000;
  el.textContent = fmtClock(elapsed);
  const pace = $("#wkpace"); if (!pace) return;
  const budget = (S.user.sessionMinutes || E.CFG.sessionMinutesMax);
  const work = s.sets.filter(x => !x.warmup);
  const doneN = work.filter(x => x.done || x.reps === -1).length;
  if (!doneN) { pace.textContent = `~${budget} min budget`; pace.className = "wkpace"; return; }
  const expected = doneN / work.length * budget * 60;   // where the clock "should" be by now
  const drift = (elapsed - expected) / 60;              // minutes ahead(-)/behind(+)
  if (drift > 3)  { pace.textContent = `${Math.round(drift)} min behind`; pace.className = "wkpace behind"; }
  else if (drift < -3) { pace.textContent = `${Math.round(-drift)} min ahead`; pace.className = "wkpace ahead"; }
  else { pace.textContent = "on pace"; pace.className = "wkpace ok"; }
}
function startClock() { stopClock(); tickClock(); S._clockIv = setInterval(tickClock, 1000); }
function stopClock() { if (S._clockIv) { clearInterval(S._clockIv); S._clockIv = null; } }

function drawToday() {
  stopClock();
  const s = S.session;
  const day = S.meso.days[s.day - 1];
  const deload = E.isDeload(s.week, S.meso.weeks);
  const started = s.sets.some(x => x.done) || !!s.beganAt;

  const groups = [];
  for (const g of day.muscles) {
    const sets = s.sets.filter(x => x.muscle === g.m);
    if (sets.length) groups.push({ g, sets });
  }
  // Surface what the split planner had to give up — see meso.caps in seedMeso.
  const caps = (S.meso.caps || []).filter(c => groups.some(x => x.g.m === c.m) && c.status !== "ok");

  $("#v").innerHTML = todayHeader(day) + weekBoardStrip() + weekStrip() + todayCard(day, s) +
    (deload ? `<div class="card"><div class="row"><div class="grow sm">Deload week — half the reps, lighter loads, 5+ RIR. Traps and forearms are out. Take it easy; this is where the growth actually lands.</div></div></div>` : "") +
    (s.off_plan ? `<div class="card"><div class="row"><div class="grow sm">Away from your home gym. These sets still count toward your weekly volume, but they're kept out of your strength trend — a hotel's 50lb dumbbell ceiling shouldn't read as detraining.</div></div></div>` : "") +
    (caps.length ? `<div class="card"><div class="row"><div class="grow sm dim">${esc(caps[0].why)}</div></div></div>` : "") +
    (s.tapered && Object.keys(s.tapered).length ? `<div class="card"><div class="row"><div class="grow sm">
      Still sore in <b>${Object.keys(s.tapered).map(m => esc(E.MG_LOWER(m))).join(", ")}</b> — trimmed a set today so you recover. Your plan for next time is unchanged.</div></div></div>` : "") +
    `<div id="gs">${groups.map((x, i) => drawGroup(x.g, x.sets, i > 0 && E.groupOf(groups[i-1].g.m) === E.groupOf(x.g.m))).join("")}</div>
     ${started ? `<button class="btn wide" id="fin" style="margin:14px 0 20px">${s.sets.every(x => x.done || x.reps === -1) ? "Finish workout" : "Finish early"}</button>` : `<div style="height:16px"></div>`}
     <div class="sync ${syncClass()}"><span class="dot"></span>${syncLabel()}</div>`;

  wireToday();
  if (started) startClock();
}

function drawGroup(g, sets, sameAsPrev) {
  const byEx = [];
  for (const st of sets) { let e = byEx.find(x => x.exId === st.exId); if (!e) byEx.push(e = { exId: st.exId, sets: [] }); e.sets.push(st); }
  // Only one "Shoulders" header even if the day has separate front/side-delt slots.
  return (sameAsPrev ? "" : `<div style="margin:16px 0 4px">${mgPill(g.m, g.emphasis)}</div>`) +
    byEx.map((e, i) => drawExercise(g, e, i === 0)).join("");
}

/* One-tap weight fills for the lifts where typing a number is friction, not information:
 *   BW  → bodyweight, for push-ups / pull-ups / dips (load_unit "bodyweight_plus")
 *   Bar → the empty barbell (45 lb / 20 kg), for barbell lifts (load_unit "total_bar_load")
 * Keyed off the exercise's OWN load_unit, NOT the gym binding — the binding can expose incidental
 * caps (a garage face-pull resolves to a band on a rack that also has a floor) and mislabel it. */
function quickFills(ex) {
  const out = [];
  if (ex.load_unit === "bodyweight_plus") out.push({ label: "BW", value: S.user.bodyweight || 0 });
  if (ex.load_unit === "total_bar_load") out.push({ label: "Bar", value: S.user.unit === "kg" ? 20 : 45 });
  return out.filter(q => q.value > 0);
}

function drawExercise(g, e, isFirst) {
  const ex = LIB().find(x => x.id === e.exId) || { name: e.exId, ratings:{} };
  const eq = equipLabel(ex);
  const mins = exMinutes(e, g.m, isFirst);
  const qf = quickFills(ex);
  const nextIx = e.sets.findIndex(x => !x.done && x.reps !== -1);
  const est = e.sets[0] && e.sets[0].est;
  /* [PUB] RP does NOT pick your first weight — you do, via their published feel-out ramp
     (12 @ ~30RM → 8 @ ~20RM → 4 @ ~10RM, then choose). That ramp is a WEEK-1 discovery tool, not
     a weekly warm-up: run against a known 200×10 @2 RIR its "10RM" is 210, i.e. heavier than the
     work set. So show it as instructions exactly when there IS no working weight — which is also
     the only time warmupSets() can't compute a ramp. */
  const feelOut = e.sets.length && !e.sets.some(x => x.warmup) && e.sets[0].targetLoad == null;
  return `<div class="card"><div class="ex">
    <div class="ex-hd">
      <button class="grow exhd-tap" data-demo="${e.exId}" style="text-align:left">
        <div class="ex-nm">${esc(ex.name)} <span class="demo-glyph">▸</span></div>
        <div class="sm dim" style="margin-top:2px">${esc(eq)} · <span class="dim2">~${mins} min</span></div>
      </button>
      <button class="swapb${(S.user.painFlags || {})[e.exId] ? " pain" : ""}" data-swap="${e.exId}">Swap</button>
    </div>
    <div class="demo" data-demo-panel="${e.exId}" hidden></div>
    ${feelOut ? `<div class="note"><span>⌁</span><span><b>Pick your starting weight.</b> RP's ramp:
      12 reps with something you could do ~30 times, 8 reps at a ~20-rep weight, 4 reps at a
      ~10-rep weight — then choose a load you can hit for ${e.sets[0] ? e.sets[0].targetReps : 10}
      at ${e.sets[0] ? e.sets[0].rir : 2} RIR. From next session Meso ramps you automatically.</span></div>` : ""}
    ${est != null ? `<div class="note"><span>⌁</span><span>Estimated from a similar lift${est ? ` (${Math.round(est*100)}% confident)` : ""} — first set calibrates it.</span></div>` : ""}
    <div class="sets">
      <div class="sets-hd"><div>Weight</div><div>Reps</div><div>Log</div></div>
      ${e.sets.map((st, i) => drawSet(st, i === nextIx)).join("")}
    </div>
    ${qf.length ? `<div class="qf">${qf.map(q => `<button class="qfb" data-qf="${e.exId}" data-qv="${q.value}">${q.label} · ${q.value} ${S.user.unit}</button>`).join("")}</div>` : ""}
  </div></div>`;
}

function drawSet(st, isNext) {
  const state = st.reps === -1 ? "skip" : st.done ? "done" : isNext ? "next" : "pending";
  const u = S.user.unit;
  return `<div class="set${st.warmup ? " warm" : ""}" data-set="${st.id}">
    ${st.warmup ? `<div class="wtag">Warm-up · ${st.pct}%</div>` : ""}
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
  if (st.warmup) return `<span class="dim">Warm-up — <b>${st.targetLoad} ${u}</b> × <b>${st.targetReps}</b>. Not to failure; you're greasing the groove, not spending stimulus.</span>`;
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

/** Open/close an exercise demo. Video element exists ONLY while open — six autoplaying videos is
    a battery heater and a decode stall on a mid phone. One at a time; a missing clip degrades to
    the poster, then to a quiet one-liner, never an error. */
function toggleDemo(exId) {
  const panel = document.querySelector(`[data-demo-panel="${exId}"]`);
  if (!panel) return;
  const wasOpen = !panel.hidden;
  document.querySelectorAll("[data-demo-panel]").forEach(p => {
    const vid = p.querySelector("video"); if (vid) { vid.pause(); vid.removeAttribute("src"); vid.load(); }
    p.innerHTML = ""; p.hidden = true;
    const hd = p.previousElementSibling;
    const g = hd && hd.querySelector ? hd.querySelector(".demo-glyph") : null;
    if (g) g.textContent = "▸";
  });
  if (wasOpen) return;
  panel.hidden = false;
  const hd = panel.previousElementSibling;
  const glyph = hd && hd.querySelector ? hd.querySelector(".demo-glyph") : null;
  if (glyph) glyph.textContent = "▾";
  if (!window.MEDIA) { panel.innerHTML = '<div class="xs dim2" style="padding:8px 0">No demo yet.</div>'; return; }
  const vid = document.createElement("video");
  vid.muted = true; vid.loop = true; vid.autoplay = true; vid.playsInline = true;
  vid.setAttribute("playsinline", ""); vid.preload = "metadata";
  const mid = MEDIA.demoId(exId);   // this exercise, or its movement sibling if it has no clip
  vid.poster = MEDIA.poster(mid);
  // Real footage first (meso/exv), then the Everkinetic illustration (meso/ex),
  // then the still, then a quiet note. Never an error.
  vid.src = MEDIA.clipV(mid);
  let fellBack = false;
  vid.onerror = () => {
    if (!fellBack) { fellBack = true; vid.src = MEDIA.clip(mid); return; }
    const img = document.createElement("img");
    img.src = MEDIA.poster(mid); img.loading = "lazy"; img.className = "demo-img";
    img.onerror = () => { panel.innerHTML = '<div class="xs dim2" style="padding:8px 0">No demo for this one yet.</div>'; };
    panel.innerHTML = ""; panel.appendChild(img);
  };
  // Borrowed a sibling's clip? Say so, quietly — the motion is right, the implement differs.
  if (mid !== exId) {
    const sib = (LIB().find(e => e.id === mid) || {}).name;
    if (sib) { const n = document.createElement("div"); n.className = "xs dim2";
      n.style.padding = "6px 0 2px"; n.textContent = "Same movement as " + sib + " — your version uses the setup in the name.";
      panel.appendChild(n); }
  }
  panel.innerHTML = ""; panel.appendChild(vid);
  /* Autoplay policies are moody even for muted video — nudge it, and if the browser still says
     no, the tap-to-toggle below means the user is one touch from motion instead of stuck on a
     frozen frame wondering if the app is broken. */
  const kick = () => vid.play().catch(() => {});
  kick(); vid.addEventListener("loadeddata", kick, { once: true });
  vid.onclick = () => { vid.paused ? kick() : vid.pause(); };
}

function wireToday() {
  const v = $("#v");
  v.querySelectorAll("[data-wbday]").forEach(b => b.onclick = async () => {
    const dn = +b.dataset.wbday;
    const board = weekBoard();
    const already = board.days[dn - 1] && board.days[dn - 1].done;
    if (already) {
      // Repeat a finished workout as a BONUS session this week — extra volume, doesn't advance
      // the program, doesn't overwrite what you logged. For when Nina wants a 3rd day.
      const name = S.meso.days[dn - 1].name;
      if (!confirm(`Do ${name} again?

Extra session at this week's level — it counts toward your volume and won't skip you ahead.`)) return;
      S.session = await bonusSession(board.week, dn);
    } else {
      S.pickedDay = dn;
      S.session = await ensureSession(board.week, dn);
    }
    drawToday(); wake();
  });
  v.querySelectorAll("[data-demo]").forEach(b => b.onclick = () => toggleDemo(b.dataset.demo));
  const st = $("#start");
  if (st) st.onclick = async () => { beginClock(); await askSorenessUpfront(); drawToday(); };
  const gc = $("#gymc"); if (gc) gc.onclick = gymSheet;
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
  // Quick-fill: BW / Bar fills every not-yet-logged set of that exercise, so you never type a
  // number for a push-up. Recompute the rep target off the new load, same as a manual override.
  v.querySelectorAll("[data-qf]").forEach(b => b.onclick = () => {
    const val = +b.dataset.qv;
    S.session.sets.filter(x => x.exId === b.dataset.qf && !x.done && !x.warmup).forEach(st => {
      const row = $(`.set[data-set="${st.id}"]`); if (!row) return;
      const inp = row.querySelector('[data-f="load"]'); inp.value = val;
      onLoadOverride(st, val, row);
    });
  });
  v.querySelectorAll("[data-swap]").forEach(b => b.onclick = () => swapSheet(b.dataset.swap));
  const fin = $("#fin"); if (fin) fin.onclick = finishWorkout;
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
  if (!S.session.sets.find(x => x.id === id)) return;
  // Ask soreness before the first set even if Start was skipped. askSorenessUpfront opens a SHEET
  // (not a redraw), so the row's typed weight/reps survive it. Re-fetch after, since the taper may
  // have removed the very set just tapped (a sore muscle's last set) — redraw and bail if so.
  if (!S.session.sorenessAsked) await askSorenessUpfront();
  const st = S.session.sets.find(x => x.id === id);
  if (!st) { drawToday(); return; }
  const row = $(`.set[data-set="${id}"]`);
  if (!row) { drawToday(); return; }
  if (st.done) {   // tap a completed set to un-log it
    st.done = false; st.reps = null; await DB.put("session", S.session); return drawToday();
  }
  const loadV = parseFloat(row.querySelector('[data-f="load"]').value);
  const repsRaw = row.querySelector('[data-f="reps"]').value.trim();
  // 🔑 RP's speed trick: tap LOG with reps empty → logs the TARGET. One tap for "I hit it."
  const reps = repsRaw === "" ? st.targetReps : parseInt(repsRaw, 10);

  if (!loadV || isNaN(loadV)) { toast("Enter a weight first"); return; }
  if (reps == null || isNaN(reps)) { toast("Enter your reps"); return; }
  // [PUB] guard — RP shows this once. Logging RIR into the reps box is the classic mistake.
  // ...but never on a warm-up WE prescribed at 4 reps. The 80% ramp is 4 reps by design, so this
  // popped on the first ramp a user ever sees, and Cancel silently discarded the set.
  if (reps < 5 && !st.warmup && !DB.pref.get("rirCheckSeen", false)) {
    DB.pref.set("rirCheckSeen", true);
    if (!confirm(`Log low reps?\n\nYou're logging ${reps} reps. For hypertrophy, reps should fall between 5 and 30. Be sure to log counted reps, and not RIR targets.`)) return;
  }
  st.load = loadV; st.reps = reps; st.done = true; st.at = new Date().toISOString();
  beginClock();   // first logged set also starts the workout clock, if Start wasn't tapped

  /* Warm-ups are scaffolding, not training. They must not touch load memory (they'd overwrite
     your working weight with 50% of it), must not fire the feedback modal, and must not start a
     3-minute rest timer between ramp sets. */
  if (st.warmup) { await DB.put("session", S.session); drawToday(); return; }

  await recordLoadState(st);
  await DB.put("session", S.session);
  startRest(st.muscle);
  await maybeFeedback(st);
  drawToday();
}

/* Load state is keyed per (user, exercise[, instance]) and SURVIVES meso boundaries.
   RP throws this away every cycle — "you start over every six weeks" is a top-5 complaint. */
async function recordLoadState(st) {
  const ex = LIB().find(x => x.id === st.exId); if (!ex) return;
  /* 🔴 THE DELOAD MUST NOT OVERWRITE LOAD MEMORY.
     A deload prescribes ~half the reps at 5+ RIR (and half the load in its back half) — it is
     BY DESIGN your lightest week. Writing it to loadState meant every new mesocycle seeded from
     the deload instead of the last hard week: measured -16.7% row, -11.1% incline DB, -21.4%
     lateral raise, -18.2% overhead extension. The complete screen literally says "Your loads
     carry into the next one — unlike RP's app, which starts you over." They carried the DELOAD's.
     The README's headline differentiator, inverted.
     engine.js's countableSet() already excludes rir>4 for exactly this reason; this write path
     just never got the same guard. Same rule, one place it was missing. */
  if (st.warmup || st.rir == null || st.rir > 4) return;
  const bind = E.resolveEquipment(ex, S.gym, S.occupied);
  // Bucket-scoped: see loadKey. Without this, the same exercise trained heavy on Monday and
  // light on Friday shares one memory, and Monday drifts down to Friday's load forever.
  const k = E.loadKey(S.user.id, ex, bind, { bucket: st.bucket, repRange: st.repRange });
  const rec = { k, exId: ex.id, load: st.load, reps: st.reps, rir: st.rir,
                e1rm: E.epley(st.load, st.reps, st.rir), at: new Date().toISOString(),
                gymId: S.gym.gym_id, off_plan: S.session.off_plan };
  await DB.put("loadState", rec); S.loadState[k] = rec; S.user.loadState = S.loadState;
}

/* ============ SWAP — one sheet, TWO intents, distinguished at commit ============
 *
 * RP conflates "the machine is taken" with "this exercise hurts". They're the same CHOICE (which
 * exercise) and different SCOPES (how long):
 *
 *   "Just today"      → this session's pending sets. Marks the instance occupied, 20-min TTL.
 *                       The plan is untouched — the machine is free next week.
 *   "Rest of the meso"→ writes slot.exId. ensureSession() reads it, so every future session picks
 *                       it up with zero extra plumbing. Progression is untouched: sets, reps and
 *                       position all live on the SLOT, and the slot is what survives.
 *
 * The UI splits on the real seam: pick the exercise FIRST (the hard part, identical for both
 * intents), then pick the verb (the easy part, one word). Forcing "how long" first — a radio, a
 * mode toggle, a nested dialog — makes you answer the easy question before the hard one, on a
 * screen where you can't yet see the options that would inform it. Scope is never a mode you're
 * in; it's the button you end on.
 *
 * And the button says "Swap", not "⇄". Robert asked for a "switch exercise button" while ⇄ was
 * sitting right there in the header — that's a completed usability test with a failing grade.
 * A glyph that needs a title attribute has already lost on a device with no hover.
 */
function swapSheet(exId, opts) {
  opts = opts || {};
  const ex = LIB().find(x => x.id === exId); if (!ex) return;
  const st = S.session && S.session.sets.find(x => x.exId === exId && !x.done);
  const muscle = opts.muscle || (st && st.muscle) || (ex.muscles[0] || {}).m;
  const pain = (S.user.painFlags || {})[exId];
  const inGym = !!st;                    // no session (Plan tab) → "just today" is meaningless
  let picked = null, filter = "here";

  sheet(`
    <h3>Swap ${esc(ex.name)}</h3>
    <div class="sm dim" style="margin:6px 0 10px">Your sets, reps and progression live on the
      <b>slot</b>, not the exercise — swapping never costs you volume.</div>
    ${pain ? `<div class="note" style="background:var(--er);color:var(--erc)"><span>⚠</span>
      <span>You logged ${esc(String(pain.v).replace("_"," "))} joint pain here on ${esc(pain.at)}.
      Pain is RP's one criterion that <i>forces</i> a swap — you probably want the whole meso.</span></div>` : ""}
    <input id="sq" placeholder="Search all exercises"
      style="width:100%;margin-top:4px;background:var(--b1);border:1px solid var(--line);
             border-radius:var(--r-btn);padding:13px 12px;outline:none">
    <div class="seg" style="margin-top:8px" id="sf">
      <button data-f="here" aria-selected="true">Best here</button>
      <button data-f="all" aria-selected="false">All ${esc(E.MG_LABEL[muscle] || "")}</button>
    </div>
    <div id="slist" style="margin-top:4px"></div>
    <div class="xs dim2" style="margin-top:12px">${inGym
      ? "“Just today” leaves your plan alone — the machine’s free next time."
      : "This changes the plan from your next session onward."}</div>
    <div class="sheet-ft" id="sft" hidden>
      ${inGym ? `<button class="btn ${pain ? "ghost" : ""}" id="swToday">Just today</button>` : ""}
      <button class="btn ${(pain || !inGym) ? "" : "ghost"}" id="swMeso">Rest of the meso</button>
    </div>`);

  const draw = () => {
    const q = ($("#sq").value || "").toLowerCase().trim();
    let rows;
    if (filter === "here" && !q) {
      // Rank against the actual slot — this is what a standalone exercise list could never do.
      const slot = { muscle, exId, repRange: st ? [8, 12] : [8, 12], rir: st ? st.rir : 2, position: 1,
                     wanted_profile: ex.profile && ex.profile.resistance_peak, wants_stretch: true };
      const sess = { chosen: [], fatigueSpent: .4, occupied: S.occupied };
      const pick = E.selectForSlot(slot, S.gym, S.user, sess, LIB());
      rows = [pick.primary].concat(pick.backups).filter(Boolean)
              .filter(c => c.ex.id !== exId)
              .map(c => ({ ex: c.ex, load: c.load, ok: true, best: true }));
    } else {
      rows = LIB().filter(e => e.id !== exId
          && (e.muscles || []).some(m => m.m === muscle)
          && (!q || e.name.toLowerCase().includes(q) || (e.aliases||[]).some(a => a.toLowerCase().includes(q))))
        .map(e => ({ ex: e, ok: E.resolveEquipment(e, S.gym, S.occupied).ok }))
        .sort((a, b) => b.ok - a.ok);
    }
    $("#slist").innerHTML = rows.slice(0, 30).map((r, i) => `
      <div class="row pick" data-sub="${r.ex.id}" aria-pressed="${picked === r.ex.id}" style="${r.ok?"":"opacity:.4"}">
        ${window.MEDIA ? `<img class="thumb" loading="lazy" src="${MEDIA.poster(MEDIA.demoId(r.ex.id))}" onerror="this.style.visibility='hidden'">` : ""}
        <div class="grow" style="min-width:0"><div class="lead ell">${esc(r.ex.name)}</div>
        <div class="sm dim">${esc(equipLabel(r.ex))}${r.load ? ` · start ~${r.load} ${S.user.unit}` : ""}${r.ok?"":" · not here"}</div></div>
        ${i === 0 && r.best ? '<span class="badge b-up">BEST</span>' : ""}
      </div>`).join("") || '<div class="empty">Nothing else here hits that muscle.</div>';
    $("#slist").querySelectorAll("[data-sub]").forEach(row => row.onclick = () => {
      picked = row.dataset.sub;
      $("#slist").querySelectorAll(".pick").forEach(p => p.setAttribute("aria-pressed", p.dataset.sub === picked));
      $("#sft").hidden = false;
    });
  };
  draw();
  $("#sq").oninput = draw;
  $("#sf").onclick = e => { const b = e.target.closest("[data-f]"); if (!b) return;
    filter = b.dataset.f;
    document.querySelectorAll("#sf button").forEach(x => x.setAttribute("aria-selected", x === b));
    draw(); };
  if ($("#swToday")) $("#swToday").onclick = () => picked && substitute(exId, picked, "occupied", opts);
  $("#swMeso").onclick = () => picked && substitute(exId, picked, "replaced", opts);
}

/** Scope is the ONLY difference. Picking the exercise was identical; what it MEANS is here. */
async function substitute(fromId, toId, scope, opts) {
  opts = opts || {};
  const to = LIB().find(x => x.id === toId); if (!to) return;

  if (scope === "replaced") {
    // PERMANENT — write the slot. Progression is untouched: sets/reps/position live on the slot.
    // ⚠️ opts.dayIx WINS when given. This used to prefer the live session's day whenever one
    // existed, so editing Thursday from the Plan tab silently rewrote today's plan instead.
    const dayIx = opts.dayIx != null ? opts.dayIx : (S.session ? S.session.day - 1 : 0);
    const day = S.meso.days[dayIx];
    if (day) for (const g of day.muscles) for (const sl of g.slots) if (sl.exId === fromId) {
      sl.exId = toId; sl.replacedFrom = fromId; sl.replacedAt = today();
    }
    await DB.put("meso", S.meso);
  } else {
    // TEMPORARY — mark the machine busy so the backup chain won't re-bind it. 20-min TTL, because
    // someone else's sets do eventually end.
    const b0 = E.resolveEquipment(LIB().find(x => x.id === fromId), S.gym, S.occupied);
    if (b0.ok && b0.carrier) {
      const id = b0.carrier.instance_id;
      S.occupied.add(id);
      setTimeout(() => S.occupied.delete(id), 20 * 60 * 1000);
    }
  }

  const bind = E.resolveEquipment(to, S.gym, S.occupied);
  // Both scopes retarget THIS session's pending sets — identical code, and that's the point.
  // Unless we just edited a DIFFERENT day's plan: then today's sets are none of our business.
  const touchesSession = S.session && !(scope === "replaced" && opts.dayIx != null
    && opts.dayIx !== S.session.day - 1);
  const pending = touchesSession ? S.session.sets.filter(x => x.exId === fromId && !x.done && x.reps !== -1) : [];
  for (const st of pending) {
    const tgt = E.targetLoad(S.user, to, bind, { repRange:[8,12], rir: st.rir, exId: fromId, muscle: st.muscle });
    st.exId = toId;
    st.instanceId = bind.ok && bind.carrier ? bind.carrier.instance_id : null;
    st.load = st.targetLoad = tgt && tgt.load;
    st.targetReps = (tgt && tgt.reps) || st.targetReps;
    st.est = tgt && tgt.why === "ratio" ? tgt.confidence : null;
    // Log what was PERFORMED and why — never write substituted results into the original's history.
    st.sub = { of: fromId, reason: scope };
  }
  if (S.session) await DB.put("session", S.session);
  closeSheet();
  S.tab === "today" ? drawToday() : viewPlan();
  toast(scope === "replaced" ? `${to.name} for the rest of the meso` : `Swapped to ${to.name} for today`);
}

/* Which gym you're at is state you set at the door, not a place you navigate to. */
function gymSheet() {
  sheet(`<h3>Where are you training?</h3>
    <div class="sm dim" style="margin:6px 0 10px">Meso only prescribes what's actually there.</div>
    ${S.gyms.map(g => `<div class="row pick" data-gym="${g.gym_id}" aria-pressed="${S.gym.gym_id===g.gym_id}">
      <div class="grow"><div class="lead">${esc(g.name)}</div>
      <div class="sm dim">${g.equipment.length} items${S.meso && g.gym_id===S.meso.homeGym?" · home gym":""}</div></div>
      ${S.gym.gym_id===g.gym_id ? '<span class="badge b-up">HERE</span>' : ""}
    </div>`).join("")}
    <div class="sheet-ft"><button id="gkit">What's here?</button><button id="gc">Close</button></div>`);
  $("#gc").onclick = closeSheet;
  $("#gkit").onclick = () => equipSheet(S.gym.gym_id);
  document.querySelectorAll("[data-gym]").forEach(r => r.onclick = async () => {
    S.gym = S.gyms.find(g => g.gym_id === r.dataset.gym);
    DB.pref.set("gym", S.gym.gym_id); S.occupied.clear();
    closeSheet(); toast(`Training at ${S.gym.name}`); go("today");
  });
}

/* ================================================================
 * "WHAT'S HERE?" — the one-time equipment checklist.
 *
 * Remote research genuinely dead-ends on this. For Crunch — Dyer, no source anywhere (photo,
 * review, video, or official) names a single strength machine, brand, or dumbbell range. Every
 * number in that inventory is either sourced-by-inference or a guess, and a WRONG entry is worse
 * than a missing one because the app confidently prescribes against it.
 *
 * So: ask. Once, per gym, with the machine's other names and how to recognize it standing there —
 * because "do you have a pec deck" is a useless question if you call it the butterfly.
 * Ticking shows exactly which exercises it unlocks, so a careless tick has a visible cost.
 * ================================================================ */
function equipSheet(gymId) {
  const gym = S.gyms.find(g => g.gym_id === gymId); if (!gym) return;
  const has = k => gym.equipment.some(e => e.machine_key === k || (e.caps || []).includes(k));
  const CATN = { pull:"Pull", push:"Push", legs:"Legs", core:"Core" };

  // One row per machine. Kept as its own function: three levels of nested template literal is
  // both unparseable and unreadable.
  /* "Unlocks N" must mean NEWLY unlocked, not "N exercises can use this".
     Ticking the lat pulldown at a gym that already has a cable station adds nothing — those
     exercises already resolved via the high pulley. Claiming 4 there is the machine taking credit
     for work the cable was already doing, and it makes the checklist feel arbitrary ("I ticked it
     and nothing happened"). So: count what actually appears that didn't before. */
  const resolves = g => new Set(LIB().filter(e => E.resolveEquipment(e, g, new Set()).ok).map(e => e.id));
  const newlyUnlocked = c => {
    if (has(c.key)) return null;                       // already on — the delta question is moot
    const inst = E.machineInstance(c.key); if (!inst) return 0;
    const before = resolves(gym);
    const probe = Object.assign({}, gym, { equipment: gym.equipment.concat([inst]) });
    let n = 0; for (const id of resolves(probe)) if (!before.has(id)) n++;
    return n;
  };
  const row = c => {
    const on = has(c.key);
    const fresh = newlyUnlocked(c);
    const total = E.machineUnlocks(c.key, LIB()).length;
    const col = on ? "var(--suc)" : "var(--bc)";
    return '<div class="row pick" data-mk="' + c.key + '" aria-pressed="' + on + '" style="align-items:flex-start">'
      + '<div class="grow">'
      +   '<div class="lead">' + esc(c.name) + '</div>'
      +   '<div class="xs dim2" style="margin-top:2px">' + esc((c.aliases || []).join(" · ")) + '</div>'
      +   '<div class="sm dim" style="margin-top:5px">' + esc(c.look) + '</div>'
      +   '<div class="xxs" style="margin-top:5px;color:' + col + ';opacity:' + (on ? 1 : .35) + '">'
      +     (on ? ("✓ used by " + total + " exercise" + (total === 1 ? "" : "s"))
                : fresh > 0 ? ("adds " + fresh + " new exercise" + (fresh === 1 ? "" : "s"))
                : "already covered by other gear here") + '</div>'
      + '</div>'
      + '<span class="badge ' + (on ? "b-up" : "b-mid") + '">' + (on ? "YES" : "NO") + '</span>'
      + '</div>';
  };

  const groups = {};
  for (const c of E.MACHINE_CATALOG) (groups[c.cat] = groups[c.cat] || []).push(c);
  let body = "";
  for (const cat of Object.keys(groups)) {
    body += '<div class="xxs dim2" style="margin:16px 2px 6px;letter-spacing:.08em;font-weight:700">'
          + (CATN[cat] || cat).toUpperCase() + '</div>';
    body += groups[cat].map(row).join("");
  }

  sheet("<h3>What’s at " + esc(gym.name) + "?</h3>"
    + '<div class="sm dim" style="margin:6px 0 12px">'
    + "Tick what you’ve actually seen. Meso won’t prescribe anything you don’t have. "
    + "This drives what you can swap to today, and what your next mesocycle is built from — your "
    + "current block keeps its exercises on purpose. Not sure? Leave it off; add it next time "
    + "you’re there.</div>"
    + body
    + '<div class="sheet-ft"><button class="btn" id="ekDone">Done</button></div>');

  $("#ekDone").onclick = async () => {
    await DB.put("kv", { k:"gyms", v: S.gyms });
    closeSheet();
    const n = LIB().filter(e => E.resolveEquipment(e, gym, new Set()).ok).length;
    /* Be honest about scope. Slots are baked at seed time and [PUB] RP's continuity rule says you
       cannot progress what you keep replacing — so a tick does NOT re-pick your current block.
       It changes what today's session can SWAP to, and what your next meso is built from.
       The sheet said "it won't skip anything you do", which over-promised. */
    toast(`${gym.name}: ${n} exercises available — used for swaps and your next meso`);
    if (S.tab === "today") go("today");
  };
  document.querySelectorAll("[data-mk]").forEach(r => r.onclick = async () => {
    const k = r.dataset.mk;
    const i = gym.equipment.findIndex(e => e.machine_key === k);
    if (i >= 0) gym.equipment.splice(i, 1);
    else { const inst = E.machineInstance(k); if (inst) gym.equipment.push(inst); }
    await DB.put("kv", { k:"gyms", v: S.gyms });
    equipSheet(gymId);            // re-render so the unlock counts update live
  });
}

/* ================================================================
 * REST TIMER — a bar above the tab bar, visible from every screen.
 *
 * [PUB] RP ships no timer on principle: one "might rush you into the next set", and their help
 * centre links Mike's "Why Tracking Your Rest Times Between Sets Is A Terrible Idea". It is also
 * their #1 unprompted review request. We ship one, built on THEIR OWN published per-muscle ranges
 * (ENGINE.REST): chest/back 1-3 min, rear delts 15s-2min.
 *
 * It counts down to the range's LOW end — the earliest you're plausibly ready — then keeps
 * counting through the window. That answers Mike's actual objection: a countdown to ONE number
 * tells you to wait exactly 3:00, which is the rushing/stalling he's complaining about. A range
 * says "somewhere in here", which is what their own guidance says.
 *   resting → counting down to lo · ready → inside the window (green, one beep) · cold → past hi
 * [PUB] "10 '90% recovered sets' in 45 minutes is a much more anabolic stimulus than 3 '99%
 * recovered' sets." The timer is a nudge, not a rule — hence "Done" always being one tap away.
 * ================================================================ */
function startRest(muscle) {
  const [lo, hi] = E.REST[muscle] || [60, 120];
  S.rest = { at: Date.now(), lo, hi, muscle, beeped: false };
  tickRest();
  if (S.restT) clearInterval(S.restT);
  S.restT = setInterval(tickRest, 500);
}
function stopRest() {
  if (S.restT) clearInterval(S.restT);
  S.restT = null; S.rest = null;
  const el = $("#rest"); if (el) el.classList.remove("on");
  document.body.classList.remove("resting");
}
function tickRest() {
  const el = $("#rest");
  /* ⚠️ The old version bailed (`const b = $("#restb"); if (!b) return;`) whenever its header badge
     wasn't on screen — so switching tabs mid-rest left the interval running forever, never firing
     the beep and never clearing. The timer is now authoritative over the DOM, not the reverse. */
  if (!S.rest) { stopRest(); return; }
  const s = Math.round((Date.now() - S.rest.at) / 1000);
  const { lo, hi, muscle } = S.rest;
  const state = s < lo ? "resting" : s <= hi ? "ready" : "cold";
  if (state !== "resting" && !S.rest.beeped) { S.rest.beeped = true; beep(); }
  // Stop two minutes past the window — by then you've stopped resting and started sitting.
  if (s > hi + 120) { stopRest(); return; }
  if (!el) return;
  const shown = s < lo ? lo - s : s;      // count DOWN to ready, then UP through the window
  const lab = state === "resting" ? `Resting <b>${esc(E.MG_LOWER(muscle))}</b> · ready at ${fmt(lo)}`
            : state === "ready"   ? `<b>Ready</b> · ${esc(E.MG_LOWER(muscle))} window ${fmt(lo)}–${fmt(hi)}`
                                  : `<b>Going cold</b> · past ${fmt(hi)}`;
  el.dataset.s = state;
  el.classList.add("on");
  document.body.classList.add("resting");
  el.innerHTML = `<i class="bar" style="width:${Math.min(100, s / hi * 100)}%"></i>`
    + `<span class="t">${fmt(shown)}</span><span class="lab">${lab}</span>`
    + `<button id="restSkip">Done</button>`;
  const sk = $("#restSkip"); if (sk) sk.onclick = stopRest;
}
const fmt = s => `${Math.floor(s/60)}:${String(Math.round(s)%60).padStart(2,"0")}`;
function fmtRest() { return S.rest ? fmt(Math.round((Date.now() - S.rest.at) / 1000)) : ""; }
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
  if (document.visibilityState === "visible" && S.tab === "today") wake();
});

/* ================================================================
 * FEEDBACK — fires at RP's exact trigger points.
 *   soreness  → entering a muscle group (first set started)
 *   pump+workload → exiting it (all its sets terminal)
 *   joint pain → per EXERCISE, on that exercise completing
 * ================================================================ */
async function maybeFeedback(justLogged) {
  const s = S.session, m = justLogged.muscle;
  const exSets = s.sets.filter(x => x.exId === justLogged.exId && !x.warmup);
  const exDone = exSets.every(x => x.done || x.reps === -1);
  const mgSets = s.sets.filter(x => x.muscle === m && !x.warmup);
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
  s.sorenessAsked = true;
  applySorenessTaper(s);
  await DB.put("session", s);
  return true;
}

/* [PUB] "If you come in still sore, you haven't recovered — that session should be lighter." RP
 * feeds soreness into the NEXT session's set count; that's still here (setDelta at finish). But
 * Robert wanted the taper to land on the workout in FRONT of him: report still-sore and today gets
 * a touch lighter, visibly. So for each still-sore muscle we drop ONE working set from THIS session
 * only — a gentle taper, floored so a muscle never falls below 2 working sets.
 *
 * This is session-local: it trims the session instance (s.sets), never the plan (g.slots), so next
 * session rebuilds at full volume minus whatever the finish-time decision independently chose. And
 * it's safe for autoregulation — performanceScore averages e1RM PER SET, so fewer sets doesn't read
 * as a performance drop. */
function applySorenessTaper(s) {
  s.tapered = s.tapered || {};
  for (const m of [...new Set(s.sets.map(x => x.muscle))]) {
    if ((s.feedback[m] || {}).soreness !== "still_sore") continue;
    const work = s.sets.filter(x => x.muscle === m && !x.warmup && !x.done && x.reps !== -1);
    if (work.length <= 2) continue;                 // floor: never taper below 2 working sets
    const drop = work[work.length - 1];             // the last set of the muscle's last exercise
    s.sets = s.sets.filter(x => x.id !== drop.id);
    s.tapered[m] = (s.tapered[m] || 0) + 1;
  }
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
  const left = s.sets.filter(x => !x.done && x.reps !== -1 && !x.warmup).length;
  if (left && !confirm(`${left} set${left>1?"s":""} still to go — finish anyway?

Unfinished sets don't count against you; the plan just picks up where you left off.`)) return;
  if (s.bonus) {
    // A bonus session just gets banked: it counts toward volume/history, but it doesn't
    // autoregulate the plan (it's not part of the progression) and doesn't advance the clock.
    s.finished = true; s.finishedAt = new Date().toISOString(); s.date = today();
    for (const day of S.meso.days) day.estMinutes = E.sessionMinutes(day);
    await DB.put("session", s); await loadUser(); stopRest();
    if (wl) { try { wl.release(); } catch (_) {} wl = null; }
    await syncNow(true);
    toast("Bonus workout logged"); return go("today");
  }
  s.finished = true; s.finishedAt = new Date().toISOString();

  const muscles = [...new Set(s.sets.map(x => x.muscle))];
  const notes = [];
  for (const m of muscles) {
    const mine = s.sets.filter(x => x.muscle === m && x.done && !x.warmup);
    if (!mine.length) continue;
    const prior = S.sessions.filter(x => x.mesoId === s.mesoId && x.finished && !x.bonus && x.day === s.day && x.week < s.week)
                            .sort((a, b) => b.week - a.week)[0];
    const prev = prior ? prior.sets.filter(x => x.muscle === m && x.done && !x.warmup) : null;
    const week1 = !prev || !prev.length;
    const pf = E.performanceScore(mine, prev, week1);
    // The CONTRACT, not live intent — see mesoEmphasis(). This decides volume progression;
    // reading the live map here means editing focus areas mid-meso silently re-aims
    // autoregulation at a plan built from the old one.
    const emph = mesoEmphasis(m);
    const fb = s.feedback[m] || {};
    // Joint pain is per-exercise; fold the worst of this muscle's exercises into its decision.
    const jp = mine.map(x => s.jointPain[x.exId]).filter(Boolean)
                   .sort((a, b) => E.JOINT.indexOf(b) - E.JOINT.indexOf(a))[0];
    /* This muscle's recent performance, oldest→newest. [PUB] MRV is TWO consecutive failures —
       without the history, one bad night's sleep declared MRV. */
    const recentPf = S.sessions.filter(x => x.mesoId === s.mesoId && x.finished && x.decision && x.decision[m])
      .sort((a, b) => (a.week - b.week) || (a.day - b.day))
      .map(x => x.decision[m].pf).filter(v => v != null).slice(-3);
    const d = E.setDelta(Object.assign({}, fb, { jointPain: jp }), pf, emph, recentPf);
    s.decision = s.decision || {};
    s.decision[m] = { pf, delta: d.delta, action: d.action, reasons: d.reasons, swap: d.swapExercise };

    // Apply to the meso for next time.
    const day = S.meso.days[s.day - 1];
    const g = day.muscles.find(x => x.m === m);
    if (g && d.action !== E.ACTION.RECOVERY && d.delta !== 0) {
      const cur = g.slots.reduce((a, x) => a + x.sets, 0);
      const ap = E.applyDelta(cur, d.delta, m, emph);
      /* THE CLOCK CAPS THE RAMP. assignDays shaved this muscle's per-session sets to keep the
         session near an hour; without honoring that here, autoregulation ramps to the band
         ceiling regardless and week 4 runs 90 minutes — the trim would be decorative.
         And say WHY: "why won't it add sets" has a real answer, and it isn't fatigue. */
      const cap = g.capPerSession || E.CFG.perSessionMax;
      let target = Math.min(ap.sets, cap);
      let diff = target - cur;
      // Add to the first slot, remove from the last — keeps the primary exercise's volume.
      while (diff > 0) { g.slots[0].sets++; diff--; }
      while (diff < 0) { const last = g.slots[g.slots.length-1]; if (last.sets > 1) last.sets--; else break; diff++; }
      s.decision[m].applied = target - cur;   // what ACTUALLY happened, for an honest badge
      if (target < ap.sets && d.delta > 0)
        notes.push(`${E.MG_LABEL[m]} is capped by your ${E.CFG.sessionMinutesMax}-min session, not by fatigue`);
      else if (ap.atCeiling) notes.push(`${E.MG_LABEL[m]} is at your ceiling`);
    }
    if (d.action === E.ACTION.RECOVERY) {
      // Actually ARM it. This used to be a promise with no mechanism: recoverySession() and
      // resumeVolume() were implemented and unit-tested with ZERO call sites, so "recovery
      // session next time" simply never happened — the next session came back at full sets.
      s.recovery = s.recovery || {}; s.recovery[m] = true;
      notes.push(`${E.MG_LABEL[m]}: recovery session next time — half sets, half reps, same weight`);
    }
    if (d.swapExercise) notes.push(`${E.MG_LABEL[m]}: consider swapping that exercise`);
  }

  // Sets just changed, so the clock estimate did too. It was only ever computed at seed time,
  // so the Today card and Plan tab drifted low all block (54 stored vs 59 actual).
  for (const day of S.meso.days) day.estMinutes = E.sessionMinutes(day);
  S.pickedDay = null;   // done — let Today advance to the next undone workout
  await DB.put("session", s);
  await DB.put("meso", S.meso);
  await loadUser();
  stopRest();                       // the workout is over; don't leave a timer running on Progress
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
      // Show what was APPLIED, not what was wanted. The clock cap can shave the delta, and the
      // badge used to say "+2 SETS" while only +1 landed.
      const n = d.applied != null ? d.applied : d.delta;
      const cls = n > 0 ? "b-up" : n < 0 ? "b-dn" : "b-mid";
      const lbl = d.action === "recovery" ? "RECOVERY" : n > 0 ? `+${n} SET${n>1?"S":""}` : n < 0 ? `${n} SET` : "HOLD";
      return `<div class="row" style="padding:12px 0">
        <div class="grow"><div class="lead">${esc(E.MG_LABEL[m])}</div>
        <div class="sm dim" style="margin-top:3px">${esc((d.reasons||[]).join(" · ") || "Steady")}</div></div>
        <span class="badge ${cls}">${lbl}</span></div>`;
    }).join("")}
    ${notes.length ? `<div class="note" style="margin-top:12px">${esc(notes.join(" · "))}</div>` : ""}
    <div class="sheet-ft"><button class="btn" id="okd">Done</button></div>`);
  $("#okd").onclick = () => { closeSheet(); go("today"); };
}

/* ================================================================
 * PLAN — the FUTURE. Weeks × days, no dates.
 * Was "Mesos", which was doing three unrelated jobs (active meso · stats · history) — the
 * definition of a junk drawer and the reason it was unfindable. Stats + history went to Progress.
 * ================================================================ */
async function viewPlan() {
  if (!S.meso) return viewNoMeso();
  const cur = currentSlot();
  const rec = S.meso.budget;
  $("#v").innerHTML = `
    <div class="hd"><div class="hd-row"><div class="grow">
      <div class="eyebrow">MESOCYCLE</div><h2>${esc(S.meso.name)}</h2>
    </div></div>
    <div class="sm dim" style="margin-top:4px">${S.meso.weeks + (S.meso.maint||0)} weeks${S.meso.maint?` (+${S.meso.maint} maint)`:""} · ${S.meso.days.length} days/wk ·
      week ${Math.min(cur.week, S.meso.weeks + (S.meso.maint||0))} of ${S.meso.weeks + (S.meso.maint||0)} · started ${esc(S.meso.startedAt)}</div></div>

    ${rec && rec.note ? `<div class="card"><div class="row"><div class="grow sm">${esc(rec.note)}</div></div></div>` : ""}
    ${(S.meso.caps || []).length ? `<div class="card">
      <div class="row"><div class="grow"><div class="lead">What didn't fit</div></div></div>
      ${S.meso.caps.slice(0, 4).map(c => `<div class="row"><div class="grow sm dim">${esc(c.why)}</div></div>`).join("")}
    </div>` : ""}

    <h4 style="margin:18px 0 8px">The week <span class="dim sm" style="font-weight:400">— tap a day to edit sets & exercises</span></h4>
    ${S.meso.days.map((d, i) => {
      const isNow = (i + 1) === cur.day && cur.week <= S.meso.weeks;
      return `<div class="card">
        <div class="row tap" data-day="${i}">
          <div class="grow">
            <div class="lead">${esc(d.name)}${isNow ? ' <span class="badge b-up" style="margin-left:6px">NEXT</span>' : ""}</div>
            <div class="sm dim" style="margin-top:3px">${d.muscles.reduce((a,g)=>a+g.slots.reduce((x,s)=>x+s.sets,0),0)} sets ·
              ${d.muscles.reduce((a,g)=>a+g.slots.length,0)} exercises${d.estMinutes ? ` · ~${d.estMinutes} min` : ""}</div>
          </div><span class="swapb" style="pointer-events:none">Edit</span>
        </div>
        <div style="padding:0 14px 12px" class="pills">${mgPills(d.muscles)}</div>
      </div>`;
    }).join("")}

    <h4 style="margin:18px 0 8px">RIR by week</h4>
    <div class="card"><div class="row"><div class="grow">
      <div class="pills">${Array.from({length:S.meso.weeks+(S.meso.maint||0)},(_,i)=>i+1).map(w => {
        const dl = E.isDeload(w, S.meso.weeks), mt = w > S.meso.weeks;
        return `<span class="badge ${dl?"b-warn":mt?"b-info":w===cur.week?"b-up":"b-mid"}">${dl?"DELOAD":mt?`MAINT · 3 RIR`:`WK${w} · ${E.rirForWeek(w,S.meso.weeks)} RIR`}</span>`;
      }).join("")}</div>
      <div class="sm dim" style="margin-top:8px">Reps stay put, RIR falls, and the weight is what moves to keep up. The last week is always the deload.</div>
    </div></div>
    <div style="height:20px"></div>`;

  document.querySelectorAll("[data-day]").forEach(r => r.onclick = () => planDaySheet(+r.dataset.day));
}

function planDaySheet(ix) {
  const d = S.meso.days[ix];
  const maxMin = S.user.sessionMinutes || E.CFG.sessionMinutesMax;
  const mins = E.sessionMinutes(d);
  const over = mins > maxMin + 3;

  /* Two alternates per slot, ranked by the real engine at the CURRENT gym — "easy to digest
     things and suggestions", not a blank search box. Tap one and it's swapped for the meso. */
  const suggest = (g, sl) => {
    try {
      const pick = E.selectForSlot(
        { muscle: g.m, repRange: sl.repRange, rir: 2, position: 1, exId: sl.exId,
          wanted_profile: sl.wanted_profile, wants_stretch: sl.wants_stretch },
        S.gym, S.user, { chosen: [], fatigueSpent: .3, occupied: new Set() }, LIB());
      return [pick.primary].concat(pick.backups || []).filter(Boolean)
        .filter(c => c.ex.id !== sl.exId).slice(0, 2);
    } catch (_) { return []; }
  };

  sheet(`<h3>${esc(d.name)}</h3>
    <div class="sm dim" style="margin:6px 0 10px">
      <span id="pdMin" style="${over ? "color:var(--wac)" : ""}">~${mins} min</span> of ${maxMin} ·
      sets apply from your next ${esc(d.name)} · swaps stick for the meso.</div>
    ${d.muscles.map((g, gi) => `
      <div style="margin:14px 0 6px">${mgPill(g.m, g.emphasis)}
        <span class="xs dim2" style="margin-left:6px">${g.freq ? `${g.freq}× a week` : ""}</span></div>
      ${g.slots.map((sl, si) => {
        const ex = LIB().find(x => x.id === sl.exId) || { name: sl.exId };
        const alts = suggest(g, sl);
        const cap = Math.min(g.capPerSession || E.CFG.perSessionMax, E.CFG.perSessionMax);
        return `<div class="pick" style="padding:10px 12px">
          <div style="display:flex;gap:10px;align-items:center">
            ${window.MEDIA ? `<img class="thumb" loading="lazy" src="${MEDIA.poster(MEDIA.demoId(sl.exId))}"
              onerror="this.style.visibility='hidden'">` : ""}
            <div class="grow" style="min-width:0">
              <div class="lead ell">${esc(ex.name)}</div>
              <div class="sm dim">${sl.repRange[0]}-${sl.repRange[1]} reps · ${esc(equipLabel(ex))}</div>
            </div>
            <button class="swapb" data-pswap="${sl.exId}" data-day="${ix}">Swap</button>
          </div>
          <div style="display:flex;gap:10px;align-items:center;margin-top:9px">
            <div class="stp" style="height:42px;max-width:150px">
              <button data-pset="${gi}|${si}|-1">−</button>
              <input data-pval="${gi}|${si}" value="${sl.sets}" readonly style="pointer-events:none">
              <button data-pset="${gi}|${si}|1">+</button>
            </div>
            <span class="xs dim2">sets · max ${cap} (your hour)</span>
          </div>
          ${alts.length ? `<div class="pills" style="margin-top:9px">
            ${alts.map(c => `<button class="fchip" data-palt="${sl.exId}|${c.ex.id}|${ix}" style="opacity:.8">
              ↷ ${esc(c.ex.name)}</button>`).join("")}</div>` : ""}
        </div>`;
      }).join("")}`).join("")}
    <div class="sheet-ft"><button class="btn" id="pdc">Done</button></div>`);

  $("#pdc").onclick = () => { closeSheet(); if (S.tab === "plan") viewPlan(); };
  document.querySelectorAll("[data-pswap]").forEach(r => r.onclick = () =>
    swapSheet(r.dataset.pswap, { dayIx: +r.dataset.day }));
  document.querySelectorAll("[data-palt]").forEach(b => b.onclick = () => {
    const [from, to, di] = b.dataset.palt.split("|");
    substitute(from, to, "replaced", { dayIx: +di });
  });
  document.querySelectorAll("[data-pset]").forEach(b => b.onclick = async () => {
    const [gi, si, dir] = b.dataset.pset.split("|").map(Number);
    const g = d.muscles[gi], sl = g.slots[si];
    const cap = Math.min(g.capPerSession || E.CFG.perSessionMax, E.CFG.perSessionMax);
    const next = Math.max(1, Math.min(cap, sl.sets + dir));
    if (next === sl.sets) {
      return toast(dir > 0 ? `${cap} is the ceiling — that's your ${maxMin}-minute session, not fatigue`
                           : "One set is the floor");
    }
    sl.sets = next;
    d.estMinutes = E.sessionMinutes(d);
    await DB.put("meso", S.meso);
    const inp = document.querySelector(`[data-pval="${gi}|${si}"]`); if (inp) inp.value = next;
    const mm = $("#pdMin");
    if (mm) { mm.textContent = `~${d.estMinutes} min`;
      mm.style.color = d.estMinutes > maxMin + 3 ? "var(--wac)" : ""; }
  });
}

/* ================================================================
 * PROGRESS — the PAST. Calendar, strength, volume.
 * This is RP's most-hammered gap ("There is no Calendar type tab", "tracking should, well, track").
 * ================================================================ */
function verdictOf(fits) {
  const real = fits.filter(f => f.verdict === "up" || f.verdict === "down" || f.verdict === "flat");
  if (!real.length) return { word:"BUILDING", cls:"none", arrow:"", line:"Log a few more sessions and this starts answering." };
  const up = real.filter(f => f.verdict === "up").length, down = real.filter(f => f.verdict === "down").length;
  if (up > down) return { word:"GROWING", cls:"up", arrow:"↗",
    line:`Strength up on ${up} of ${real.length} movement${real.length>1?"s":""} since this meso started.` };
  if (down > up) return { word:"SLIPPING", cls:"down", arrow:"↘",
    line:`Down on ${down} of ${real.length}. Check your sleep and food before you touch the program.` };
  // Flat is the PRESCRIPTION'S OWN BASELINE (the load bump is the toll for the RIR drop), not a
  // failure. Never render it red — that trains you to distrust every screen.
  return { word:"HOLDING", cls:"flat", arrow:"→",
    line:`Holding steady across ${real.length} movement${real.length>1?"s":""}. That's the plan working, not a stall.` };
}

function viewProgress() {
  const fin = S.sessions.filter(s => s.finished);
  if (!fin.length) {
    $("#v").innerHTML = `<div class="hd"><div class="hd-row"><h2>Progress</h2></div></div>
      <div class="empty">Nothing logged yet.<br>Finish a workout and this fills in.</div>`;
    return;
  }
  const lib = LIB();
  const deload = S.meso && E.isDeload(currentSlot().week, S.meso.weeks);

  // Strength, per muscle, via the muscle's richest trend key.
  const rows = [];
  for (const m of Object.keys(E.LANDMARKS)) {
    const keys = E.keysForMuscle(fin, lib, m);
    if (!keys.length) continue;
    const k = keys[0];
    const pts = E.smooth3(E.e1rmSeries(fin, lib, k.key));
    const fit = E.trendFit(pts);
    const ex = lib.find(e => e.id === k.exId) || { name: k.exId };
    rows.push({ m, key: k.key, ex, pts, fit, last: pts[pts.length - 1] });
  }
  rows.sort((a, b) => (b.fit.total || 0) - (a.fit.total || 0));
  const v = verdictOf(rows.map(r => r.fit));
  const prs = E.replayPRs(fin, lib);
  const thisWeek = prs.filter(p => (p.at || "") >= new Date(Date.now() - 7*864e5).toISOString().slice(0,10));

  // Volume vs landmarks, this week.
  const vol = E.weeklyVolume(fin.filter(s => onDate(s) >= new Date(Date.now()-6*864e5).toISOString().slice(0,10)), lib);
  const lastDec = fin.slice(-1)[0] && fin.slice(-1)[0].decision || {};

  $("#v").innerHTML = `
    <div class="hd"><div class="hd-row"><div class="grow"><h2>Progress</h2></div>
      ${S.meso ? `<span class="badge b-mid">Week ${Math.min(currentSlot().week, S.meso.weeks)}/${S.meso.weeks}</span>` : ""}
    </div>
    <div class="sm dim" style="margin-top:3px">${fin.length} session${fin.length>1?"s":""} logged</div></div>

    ${deload ? `<div class="card"><div style="padding:16px 14px">
      <div class="verdict dl">DELOAD</div>
      <div class="sm dim" style="margin-top:6px">Loads are halved on purpose. Strength tracking is paused this week — nothing here is a decline.</div>
    </div></div>`
    : `<div class="card"><div style="padding:16px 14px 14px">
      <div class="row" style="padding:0;border:0;min-height:0;align-items:flex-start">
        <div class="grow">
          <div class="verdict ${v.cls}">${v.word}</div>
          <div class="sm dim" style="margin-top:6px;max-width:240px">${esc(v.line)}</div>
        </div><span class="arrow ${v.cls}">${v.arrow}</span>
      </div>
    </div></div>`}

    ${thisWeek.length ? `<div class="card"><div class="row">
      <span style="font-size:1.1rem">🏆</span>
      <div class="grow"><div class="lead">${thisWeek.length} PR${thisWeek.length>1?"s":""} this week</div>
      <div class="sm dim ell" style="margin-top:2px">${esc(thisWeek.slice(0,3).map(p => {
        const e = lib.find(x => x.id === p.exId) || {}; return `${e.name || p.exId} ${p.load}×${p.reps}`;
      }).join(" · "))}</div></div>
    </div></div>` : deload ? `<div class="card"><div class="row"><div class="grow sm dim">PRs paused — deload week.</div></div></div>` : ""}

    <h4 style="margin:18px 0 8px">Strength</h4>
    <div class="card"><div style="padding:4px 14px 10px">
      ${rows.map(r => {
        const c = mgColor(r.m);
        const b = r.fit.verdict === "up" ? "b-up" : r.fit.verdict === "down" ? "b-dn" : "b-mid";
        const lbl = r.fit.verdict === "building" ? `${r.fit.n} SESSION${r.fit.n===1?"":"S"}`
                  : r.fit.verdict === "flat" ? "HOLDING"
                  : (r.fit.total > 0 ? "+" : "") + (r.fit.total * 100).toFixed(1) + "%";
        const sub = r.fit.verdict === "building" ? "Need 4"
                  : r.last ? `${r.last.load}×${r.last.reps} @${r.last.rir}` : "";
        return `<div class="stat">
          <div>${mgPill(r.m, mesoEmphasis(r.m))}</div>
          <div class="trend">
            ${sparkline(r.pts, { color: c, dim: r.fit.verdict === "building",
                                 label: `${E.MG_LABEL[r.m]} strength trend` })}
            <div class="t-r"><span class="badge ${b} num">${lbl}</span>
              <div class="xxs dim2 mono" style="margin-top:3px">${esc(sub)}</div></div>
          </div></div>`;
      }).join("") || '<div class="empty">No countable sets yet.</div>'}
    </div></div>
    <div class="xs dim2" style="padding:2px 2px 0">Measured at matched RIR. Deload and travel sessions are excluded. Strength is a proxy for size, not a synonym.</div>

    ${S.user.id !== ADMIN_ID ? "" : `<h4 style="margin:18px 0 8px">Volume this week</h4>
    <div class="card"><div style="padding:10px 14px 4px">
      ${Object.keys(vol).sort((a,b) => vol[b]-vol[a]).map(m => {
        const emph = mesoEmphasis(m);   // the block you're training, not the one you want next
        const d = (lastDec[m] || {}).delta || 0;
        const b = E.bandState(m, emph, vol[m], d);
        const zc = b.zone === "lo" ? "lo" : (b.zone === "hi" || b.zone === "ov") ? "hi" : "";
        const msg = b.zone === "lo" ? '<span style="color:var(--wac)">below MEV — not a growth dose</span>'
                  : b.zone === "ov" || b.zone === "hi" ? '<span style="color:var(--wac)">at your ceiling</span>'
                  : '<span class="dim2">in the productive zone</span>';
        const nx = d > 0 ? `<span style="color:var(--suc)">+${d} next week</span>`
                 : d < 0 ? `<span style="color:var(--erc)">${d} next week</span>` : "";
        return `<div class="stat">
          <div>${mgPill(m, emph)}</div>
          <div>
            <div class="rail ${zc}" style="--c:${mgColor(m)};--mev:${b.pMev}%;--mav:${b.pMav}%;--v:${b.pNow}%;--nx:${b.pNext}%">
              <i class="z-lo"></i><i class="z-ok"></i><i class="z-hi"></i><i class="fill"></i><i class="now"></i><i class="nxt"></i>
            </div>
            <div class="rail-lg xxs dim2"><span>MEV ${b.mev}</span><span>MAV ${b.mav}</span><span>MRV ${b.mrv}</span></div>
            <div class="xxs" style="margin-top:3px"><b class="num">${vol[m]}</b><span class="dim2"> sets · </span>${msg}${nx ? ' · ' + nx : ""}</div>
          </div></div>`;
      }).join("") || '<div class="empty">No sets this week.</div>'}
    </div></div>`}

    <h4 style="margin:18px 0 8px">History</h4>
    ${calendarMonth()}
    <div style="height:20px"></div>`;

  document.querySelectorAll("[data-sess]").forEach(c => c.onclick = () => sessionSheet(c.dataset.sess));
}

/* The calendar RENDERS NOTHING PAST TODAY. Not grayed — absent. Two reasons, and the second is
   the one that matters:
     1. There's nothing to draw. The plan has no dates, so no future cell has content.
     2. An empty future cell is an invitation to fill it, and the first person to fill one has
        invented scheduling — exactly the trap RP fell into ("You have to start your Meso on
        Monday, no adjusting the start day"). Don't build the box.
   A trained day glows; an untrained day is blank space. Blank space is not an accusation. */
function calendarMonth() {
  const now = new Date(), y = now.getFullYear(), mo = now.getMonth();
  const first = new Date(y, mo, 1), lead = (first.getDay() + 6) % 7;
  const days = new Date(y, mo + 1, 0).getDate();
  const byDay = {};
  for (const s of S.sessions) if (s.finished) {
    const d = onDate(s);
    if (d.slice(0, 7) === `${y}-${String(mo+1).padStart(2,"0")}`) byDay[+d.slice(8, 10)] = s;
  }
  const cells = [];
  for (let i = 0; i < lead; i++) cells.push(`<div class="cald blank"></div>`);
  for (let d = 1; d <= days; d++) {
    if (d > now.getDate()) break;                       // the calendar has no future
    const s = byDay[d];
    cells.push(`<div class="cald${s ? " tap" : ""}${d === now.getDate() ? " today" : ""}"${s ? ` data-sess="${s.id}"` : ""}>
      <span class="n">${d}</span>
      <i class="dot${s ? " on" : ""}"${s ? ` style="--c:${kindColor(s)}"` : ""}></i></div>`);
  }
  const n = Object.keys(byDay).length;
  const sets = Object.values(byDay).reduce((a, s) => a + s.sets.filter(x => x.done).length, 0);
  return `<div class="card">
    <div class="row"><div class="grow"><div class="lead">${MON3[mo][0] + MON3[mo].slice(1).toLowerCase()} ${y}</div></div></div>
    <div class="calhd">${["M","T","W","T","F","S","S"].map(x => `<div>${x}</div>`).join("")}</div>
    <div class="cal">${cells.join("")}</div>
    <div class="row"><div class="grow sm dim">${n} workout${n===1?"":"s"} · ${sets} sets this month</div></div>
  </div>`;
}

function sessionSheet(id) {
  const s = S.sessions.find(x => x.id === id); if (!s) return;
  const lib = LIB();
  const byEx = [];
  for (const x of s.sets) { if (!x.done) continue;
    let e = byEx.find(v => v.exId === x.exId); if (!e) byEx.push(e = { exId: x.exId, sets: [] }); e.sets.push(x); }
  sheet(`<h3>${esc(S.meso ? (S.meso.days[s.day-1]||{}).name || "Workout" : "Workout")}</h3>
    <div class="sm dim" style="margin:6px 0 10px">${esc(onDate(s))} · week ${s.week} day ${s.day}${s.off_plan ? " · travel" : ""}</div>
    ${byEx.map(e => {
      const ex = lib.find(x => x.id === e.exId) || { name: e.exId };
      return `<div class="row"><div class="grow">
        <div class="lead">${esc(ex.name)}</div>
        <div class="sm dim mono" style="margin-top:3px">${e.sets.map(x => `${x.load}×${x.reps}`).join(" · ")}</div>
      </div></div>`;
    }).join("")}
    ${Object.keys(s.decision || {}).length ? `<h4 style="margin:16px 0 6px">What it changed</h4>
      ${Object.keys(s.decision).map(m => { const d = s.decision[m];
        const cls = d.delta > 0 ? "b-up" : d.delta < 0 ? "b-dn" : "b-mid";
        const lbl = d.action === "recovery" ? "RECOVERY" : d.delta > 0 ? `+${d.delta}` : d.delta < 0 ? `${d.delta}` : "HOLD";
        return `<div class="row"><div class="grow"><div>${esc(E.MG_LABEL[m])}</div>
          <div class="xs dim" style="margin-top:2px">${esc((d.reasons||[]).join(" · ") || "Steady")}</div></div>
          <span class="badge ${cls}">${lbl}</span></div>`; }).join("")}` : ""}
    <div class="sheet-ft"><button id="ssc">Close</button></div>`);
  $("#ssc").onclick = closeSheet;
}

/**
 * Hand-rolled SVG sparkline. No library — strict offline PWA.
 * The ±6% minimum span is THE HONESTY VALVE: one misjudged RIR at ~10 reps moves Epley by 1/30
 * ≈ 3.3%, and autoscaling to a series' own min/max turns that pure noise into a dramatic
 * full-height mountain range. That's every charting library's default and the single easiest way
 * for a chart to lie while the number next to it is correct. With the floor, a dead-flat series
 * LOOKS dead flat. It should.
 */
function sparkline(pts, o) {
  o = o || {};
  const w = o.w || 112, h = o.h || 30, pad = o.pad || 3, c = o.color || "var(--bc)";
  const n = (pts || []).length;
  const open = `<svg viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" style="display:block;overflow:visible" role="img" aria-label="${esc(o.label || "trend")}">`;
  // n=0 — an empty box is honest. A flat line at zero reads as "no progress", which is a claim.
  if (!n) return open + `<line x1="0" y1="${h/2}" x2="${w}" y2="${h/2}" stroke="var(--line)" stroke-width="1" stroke-dasharray="2 3"/></svg>`;

  const es = pts.map(p => p.e);
  const lo0 = Math.min.apply(null, es), hi0 = Math.max.apply(null, es);
  const mid = (lo0 + hi0) / 2 || 1;
  const span = Math.max(hi0 - lo0, Math.abs(mid) * 0.06) * 1.15;
  const yLo = mid - span / 2;
  const y = e => (h - pad - ((e - yLo) / span) * (h - 2 * pad));
  const x = i => (n === 1 ? w / 2 : pad + i * (w - 2 * pad) / (n - 1));
  const P = v => v.toFixed(1);
  // n=1 — a dot. There is no trend through one point and we won't draw one.
  if (n === 1) return open + `<circle cx="${P(x(0))}" cy="${P(y(es[0]))}" r="2.5" fill="${c}"/></svg>`;

  // Baseline at the FIRST point — "am I above where I started" answered pre-attentively.
  let g = `<line x1="0" y1="${P(y(es[0]))}" x2="${w}" y2="${P(y(es[0]))}" stroke="${c}" stroke-opacity=".22" stroke-width="1" stroke-dasharray="2 3"/>`;
  const brk = new Set(o.breaks || []);
  const runs = []; let run = [0];
  for (let i = 1; i < n; i++) { if (brk.has(i)) { runs.push(run); run = [i]; } else run.push(i); }
  runs.push(run);
  // Two points is a line, never a trend. Draw it faint — trendFit() says "building" anyway.
  const dim = (n === 2 || o.dim) ? ' stroke-opacity=".45"' : "";
  for (const r of runs) {
    if (r.length === 1) { g += `<circle cx="${P(x(r[0]))}" cy="${P(y(es[r[0]]))}" r="2" fill="${c}"/>`; continue; }
    // POLYLINE, not a spline. A curve through 5 sessions invents values between them, and the
    // invented values sit exactly where the eye reads the shape.
    g += `<polyline points="${r.map(i => `${P(x(i))},${P(y(es[i]))}`).join(" ")}" fill="none" stroke="${c}" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"${dim}/>`;
  }
  brk.forEach(i => { if (i <= 0 || i >= n) return;
    const bx = P((x(i-1) + x(i)) / 2);
    g += `<line x1="${bx}" y1="0" x2="${bx}" y2="${h}" stroke="var(--bc)" stroke-opacity=".3" stroke-width="1" stroke-dasharray="1 2"/>`; });
  g += `<circle cx="${P(x(n-1))}" cy="${P(y(es[n-1]))}" r="2.5" fill="${c}"/>`;
  return open + g + "</svg>";
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

/* ⚠️ Deliberately NOT a constant in this file. This repo goes to GitHub, and this URL is an
   UNAUTHENTICATED endpoint: doPost appends to the Sheet, doGet(?user=) returns anyone's full
   training history. Public repo + baked-in URL = the household's log is world-readable and
   world-writable. It lives in localStorage, typed once per device.
   Robert's is set up and live (deployed 2026-07-15, "Anyone" access, per-user keyed). */
async function viewMore() {
  // Each user's active mesocycle, for the Programs list.
  const mProg = {};
  if (S.user.id === ADMIN_ID) for (const u of S.users) {
    const ms = (await DB.all("meso", "user", u.id)).sort((a,b)=>(b.createdAt||"").localeCompare(a.createdAt||""));
    if (ms[0]) {
      const per = ms[0].days.length;
      const done = (await DB.all("session","user",u.id)).filter(x=>x.mesoId===ms[0].id&&x.finished).length;
      mProg[u.id] = { name: ms[0].name, week: Math.min(Math.floor(done/per)+1, ms[0].weeks) };
    }
  }
  $("#v").innerHTML = `
    <div class="hd"><div class="hd-row"><h2>More</h2></div></div>
    <h4 style="margin:6px 0 8px">Backup ${DB.pref.get("syncUrl","") ? "" : '<span class="badge b-dn" style="margin-left:6px">NOT SET UP</span>'}</h4>
    <div class="card"${DB.pref.get("syncUrl","") ? "" : ' style="border-color:var(--erc)"'}>
      <div style="padding:14px"><div class="sm dim" style="margin-bottom:8px">
        ${DB.pref.get("syncUrl","")
          ? "The phone is a cache. Your Sheet is the real record — it survives a lost phone or a wipe."
          : "<b style=\"color:var(--erc);opacity:1\">Nothing is backed up yet.</b> Paste your Sheet link below so a lost phone doesn't lose your training."}</div>
      <input id="url" placeholder="Apps Script /exec URL (ends in /exec)" value="${esc(DB.pref.get("syncUrl",""))}"
        inputmode="url" autocapitalize="off" autocorrect="off"
        style="width:100%;background:var(--b1);border:1px solid ${DB.pref.get("syncUrl","")?"var(--line)":"var(--erc)"};border-radius:var(--r-btn);padding:13px 12px;outline:none;font-size:.8125rem"></div>
      <div class="row tap" id="save"><div class="grow">Save link</div></div>
      <div class="row tap" id="sn"><div class="grow">Back up now</div><span class="sm dim">${esc(syncLabel())}</span></div>
      <div class="row tap" id="rst"><div class="grow">Restore from Sheet</div></div>
      <div class="row tap" id="exp"><div class="grow">Export JSON</div></div>
    </div>

    <h4 style="margin:6px 0 8px">${S.user.id === ADMIN_ID ? "People" : "You"}</h4>
    <div class="card">${(S.user.id === ADMIN_ID ? S.users : S.users.filter(u=>u.id===S.user.id)).map(u => `
      <div class="row tap" data-person="${u.id}">
        <div class="grow"><div class="lead">${esc(u.name)}${u.id===S.user.id?' <span class="badge b-up" style="margin-left:4px">YOU</span>':""}</div>
          <div class="sm dim" style="margin-top:3px">${u.bodyweight} ${u.unit}${mProg[u.id] ? " · " + esc(mProg[u.id].name) + " · wk " + mProg[u.id].week : " · no plan yet"}</div></div>
        <span class="dim2">›</span></div>`).join("")}</div>
    <div class="xs dim2" style="padding:2px 2px 14px">Tap ${S.user.id === ADMIN_ID ? "anyone" : "yourself"} to see and change ${S.user.id === ADMIN_ID ? "their" : "your"} goal, focus, split, weight and plan — all in one place.</div>

    <h4 style="margin:18px 0 8px">Settings</h4>
    <div class="card">
      <div class="row"><div class="grow">Theme</div>
        <div class="seg" style="width:150px">
          <button data-th="dark" aria-selected="${document.documentElement.dataset.theme!=="light"}">Dark</button>
          <button data-th="light" aria-selected="${document.documentElement.dataset.theme==="light"}">Light</button>
        </div></div>
      <div class="row tap" id="ver"><div class="grow">Run engine self-check</div><span class="sm dim">159 tests</span></div>
    </div>
    <div class="xs dim2" style="padding:14px 2px 24px">Meso · offline-first · your data stays yours.<br>
      Volume landmarks and the set-progression algorithm follow RP's published rules. Verify in the console with <span class="mono">ENGINE.verify()</span>.</div>`;

  /* Coach mode: build for her, then hand the phone back. Everything the intake writes is keyed to
     the user it's building for, so this is just "be her for the duration of the picker" — no
     parallel code path, no second set of bugs to keep in sync. */
  /* Her sessions, her feedback, and — the point — what the engine DID with it. Robert asked to
     see this. It's his household and her data already sits in the same Sheet as his, so a UI that
     hid it would be theatre. The read-only framing is deliberate: he can see the answers and the
     decision, and he changes her plan through the picker, not by editing what she reported. */
  document.querySelectorAll("[data-person]").forEach(r => r.onclick = () => viewPerson(r.dataset.person));
  $("#save").onclick = () => { DB.pref.set("syncUrl", $("#url").value.trim()); toast("Saved"); viewMore(); };
  $("#sn").onclick = () => syncNow().then(() => viewMore());
  $("#exp").onclick = async () => {
    const blob = await DB.exportUser(S.user.id);
    const a = el("a"); a.href = URL.createObjectURL(new Blob([JSON.stringify(blob, null, 1)], { type:"application/json" }));
    a.download = `meso-${S.user.id}-${today()}.json`; a.click();
  };
  $("#rst").onclick = async () => {
    const url = DB.pref.get("syncUrl", ""); if (!url) return toast("Add your Sheet link first");
    if (!confirm("Restore from the Sheet? This merges the Sheet’s data into this phone.")) return;
    try {
      const r = await fetch(url + "?user=" + encodeURIComponent(S.user.id));
      await DB.importUser(await r.json()); await loadUser(); toast("Restored"); go("today");
    } catch (e) { toast("Restore failed"); }
  };
  document.querySelectorAll("[data-th]").forEach(b => b.onclick = () => {
    const t = b.dataset.th; document.documentElement.dataset.theme = t;
    document.documentElement.classList.toggle("dark", t === "dark");
    DB.pref.set("theme", t); viewMore();
  });
  $("#ver").onclick = () => { const r = E.verify(); toast(r.pass ? `✅ all ${r.total} passed` : `❌ ${r.fails.length} failed — see console`); };
}

/* ================================================================
 * ONE PERSON, ONE SCREEN. Reached by tapping a name in More. Everything about that person —
 * weight, goal, focus, split, session length, their plan — under their NAME, so there is never a
 * "whose settings am I changing?" moment. Scalar settings edit that user's record directly;
 * focus + plan changes rebuild the meso, so those enter coach mode (banner) when it's not you.
 * ================================================================ */
async function viewPerson(uid) {
  const u = S.users.find(x => x.id === uid); if (!u) return;
  const self = uid === S.user.id;
  const foc = Object.keys(u.emphasis || {}).filter(m => u.emphasis[m] === "emphasize");
  const ms = (await DB.all("meso", "user", uid)).sort((a,b)=>(b.createdAt||"").localeCompare(a.createdAt||""));
  const meso = ms[0];
  let week = null;
  if (meso) { const per = meso.days.length;
    const done = (await DB.all("session","user",uid)).filter(x=>x.mesoId===meso.id&&x.finished).length;
    week = Math.min(Math.floor(done/per)+1, meso.weeks); }
  const dc = (u.id === ADMIN_ID) ? [4] : [2];
  $("#v").innerHTML = `
    <div class="hd"><div class="hd-row">
      <button class="chip" id="pBack" style="max-width:none">&lsaquo; More</button>
      <h2 style="flex:1;text-align:center">${esc(u.name)}</h2>
      <span style="width:60px;text-align:right">${self?'<span class="badge b-up">YOU</span>':""}</span>
    </div></div>

    <h4 style="margin:8px 0 8px">Plan</h4>
    <div class="card"><div class="row">
      <div class="grow"><div class="lead">${meso ? esc(meso.name) : "No plan yet"}</div>
        <div class="sm dim" style="margin-top:3px">${meso ? "week " + week + " of " + meso.weeks : "build one to start"}</div></div>
      <div style="display:flex;gap:6px;flex:none">
        ${meso ? `<button class="swapb" id="pEdit">Edit</button>` : ""}
        <button class="swapb" id="pNew">New</button>
      </div></div></div>

    <h4 style="margin:18px 0 8px">Bodyweight</h4>
    <div class="card"><div class="row"><div class="grow">Current weight</div>
      <div style="display:flex;align-items:center;gap:6px;flex:none">
        <input id="pBw" inputmode="decimal" value="${u.bodyweight||""}"
          style="width:72px;text-align:right;background:var(--b1);border:1px solid var(--line);border-radius:var(--r-btn);padding:9px;outline:none;font-size:1rem">
        <span class="dim">${u.unit}</span>
      </div></div></div>

    <h4 style="margin:18px 0 8px">Goal</h4>
    <div class="card">
      <div style="padding:14px 14px 4px" class="xs dim2">Balanced trains everything evenly. Focus lets a few grow and holds the rest.</div>
      <div style="padding:0 14px 14px"><div class="seg" id="pGoal">
        <button data-g="balanced" aria-selected="${(u.goal||"focus")==="balanced"}">Balanced</button>
        <button data-g="focus" aria-selected="${(u.goal||"focus")==="focus"}">Focus areas</button>
      </div></div>
      <div class="row tap" id="pFocus"><div class="grow"><div>Focus areas</div>
        <div class="sm dim" style="margin-top:3px">${[...new Set(foc.map(E.groupOf))].map(g=>esc(E.groupLabel(g))).join(", ") || "None — even coverage"}</div>
      </div><span class="dim2">&rsaquo;</span></div>
    </div>

    <h4 style="margin:18px 0 8px">Split &amp; length</h4>
    <div class="card">
      <div class="row"><div class="grow">Split</div></div>
      <div style="padding:0 14px 14px"><div class="seg" id="pSplit">
        ${[["auto","Auto"]].concat(E.SPLITS.filter(x=>dc.includes(x.days)).map(x=>[x.id,x.name.replace(/ ×/,"×")]))
          .map(([v,l])=>`<button data-sp="${v}" aria-selected="${(u.splitPref||"auto")===v}" style="font-size:.72rem">${esc(l)}</button>`).join("")}
      </div></div>
      <div class="row"><div class="grow">Session length <span class="dim sm">(warm-ups + rest in)</span></div></div>
      <div style="padding:0 14px 14px"><div class="seg" id="pMin">
        ${[45,60,75,90].map(m=>`<button data-mn="${m}" aria-selected="${(u.sessionMinutes||60)===m}">${m}m</button>`).join("")}
      </div></div>
    </div>
    <div class="xs dim2" style="padding:2px 2px 14px">Weight and length apply now; goal, focus and split shape the NEXT mesocycle.</div>

    ${!self && S.user.id === ADMIN_ID ? `
    <div class="card"><div class="row tap" id="pReview"><div class="grow">
      <div class="lead">${esc(u.name)}&rsquo;s last sessions</div>
      <div class="sm dim" style="margin-top:3px">What ${esc(u.name)} lifted and what Meso changed.</div>
    </div><span class="dim2">&rsaquo;</span></div></div>` : ""}
    <div style="height:20px"></div>`;

  const persist = async (re) => { await DB.put("kv", { k:"users", v: S.users }); if (re) viewPerson(uid); };
  $("#pBack").onclick = () => go("more");
  $("#pBw").onchange = async e => { const v = parseFloat(e.target.value); if (v > 0) { u.bodyweight = v; await persist(false); toast(`${u.name}: ${v} ${u.unit}`); } };
  document.querySelectorAll("#pGoal [data-g]").forEach(b => b.onclick = async () => {
    u.goal = b.dataset.g;
    if (u.goal === "balanced") u.emphasis = E.buildEmphasis([]);
    await persist(true);
  });
  document.querySelectorAll("#pSplit [data-sp]").forEach(b => b.onclick = async () => { u.splitPref = b.dataset.sp; await persist(true); });
  document.querySelectorAll("#pMin [data-mn]").forEach(b => b.onclick = async () => { u.sessionMinutes = +b.dataset.mn; await persist(true); });
  const enter = async (then) => {
    if (!self) { S.coachingFor = { her: uid, me: S.user.id }; S.user = u; await loadUser(); renderTabs(); }
    then();
  };
  $("#pFocus").onclick = () => enter(() => { INTAKE.focus = [...new Set(foc.map(E.groupOf))]; INTAKE._daysTouched = false; S.meso = null; go("today"); });
  const en = $("#pNew"); if (en) en.onclick = () => enter(() => { INTAKE.focus = [...new Set(foc.map(E.groupOf))]; INTAKE._daysTouched = false; S.meso = null; go("today"); });
  const ee = $("#pEdit"); if (ee) ee.onclick = () => enter(() => go("plan"));
  const pr = $("#pReview"); if (pr) pr.onclick = () => reviewSessions(uid);
}

async function reviewSessions(uid) {
  const her = S.users.find(u => u.id === uid);
  const sess = (await DB.all("session", "user", uid)).filter(x => x.finished)
    .sort((a, b) => (b.week - a.week) || (b.day - a.day)).slice(0, 6);
  if (!sess.length) return toast(`${her.name} hasn't finished a session yet`);
  const FB = { soreness:"Soreness", pump:"Pump", workload:"Volume", jointPain:"Joint pain" };
  sheet(`<h3>${esc(her.name)}&rsquo;s last sessions</h3>` + sess.map(x => {
    const done = (x.sets || []).filter(y => y.done && !y.warmup);
    const dec = x.decision || {};
    return `<div class="card" style="margin-top:10px"><div style="padding:12px 14px">
      <div class="lead">Week ${x.week} Day ${x.day} <span class="dim2 sm">· ${esc(x.date)}${x.off_plan?" · travel":""}</span></div>
      <div class="sm dim" style="margin:4px 0 8px">${done.length} sets · ${esc(x.gymId || "")}</div>
      ${Object.keys(dec).map(m => {
        const d = dec[m], fb = (x.feedback || {})[m] || {};
        const n = d.applied != null ? d.applied : d.delta;
        const lbl = d.action === "recovery" ? "RECOVERY" : n > 0 ? `+${n}` : n < 0 ? `${n}` : "HOLD";
        const said = Object.keys(FB).map(k => fb[k] ? `${FB[k]}: ${esc(String(fb[k]).replace(/_/g," "))}` : null).filter(Boolean).join(" · ");
        return `<div class="row" style="padding:8px 0"><div class="grow">
          <div>${esc(E.groupLabel(E.groupOf(m)))}</div>
          <div class="xs dim2" style="margin-top:2px">${said || "skipped feedback — held"}</div>
          <div class="xs dim" style="margin-top:2px">${esc((d.reasons||[]).join(" · "))}</div>
        </div><span class="badge ${n>0?"b-up":n<0?"b-dn":"b-mid"}">${lbl}</span></div>`;
      }).join("") || '<div class="xs dim2">No feedback recorded.</div>'}
    </div></div>`;
  }).join("") + `<div class="sheet-ft"><button id="rvC">Close</button></div>`);
  $("#rvC").onclick = closeSheet;
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
/* A failed boot must say so. "Loading…" forever with a clean console is the worst failure mode
   there is — it looks broken rather than buggy, and gives the user nothing to act on.
   Your training data is on the Sheet regardless; say that too, because that's the actual fear. */
boot().catch(e => {
  console.error(e);
  $("#v").innerHTML = `
    <div class="card" style="margin-top:24px"><div style="padding:18px">
      <div class="lead" style="color:var(--erc)">Meso couldn't start</div>
      <div class="sm dim" style="margin:8px 0 14px">${esc(e.message || String(e))}</div>
      <button class="btn wide" onclick="location.reload()">Try again</button>
      <div class="xs dim2" style="margin-top:12px">Your training history is safe — it's on this
        phone and, if you've set up backup, in your Sheet.</div>
    </div></div>`;
});

return { updateReady, S, go, syncNow, seedMeso, askSorenessUpfront, toast };
})();
