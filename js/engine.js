/* Meso — training engine. Pure functions, no DOM, no storage.
 *
 * Two engines that meet at the SLOT and nowhere else:
 *   1. Autoregulation  — decides HOW MANY SETS
 *   2. Selection       — decides WHICH EXERCISE
 * Don't let landmark logic leak into the ranking function or vice versa.
 *
 * ── The dependency order is the whole design (RP, published) ──
 *   RIR    = a fixed calendar
 *   volume = feedback-driven
 *   reps   = held constant
 *   load   = the solved variable
 * Get that order right and everything else follows.
 *
 * Source tags: [PUB] RP published the literal rule/number · [APP] RP help center describing app
 * behavior (qualitative) · [RECON] reconstructed from RP's rules. RP has never published the
 * app's constants — anything claiming exact percentages is inferred.
 */
window.ENGINE = (() => {

/* ================================================================
 * CONFIG — the genuinely ambiguous calls, surfaced instead of buried.
 * RP contradicts itself on each of these; these are our picks.
 * ================================================================ */
const CFG = {
  rirStart: 2,        // [APP] Mike, demoing the app: "shoots for week one, two reps in reserve".
                      // [PUB] the BOOK's table is 3→2→1→0. The app and the book disagree;
                      // we're cloning the app. Set 3 for book behavior.
  deloadTo: "mev",    // [PUB] back guide says deload to MEV; the Volume Landmarks article says MV.
  countDirect: true,  // [PUB] RP's landmarks count ONLY sets where the target is prime mover or
                      // it's an isolation. Indirect volume is PRE-BAKED into the numbers —
                      // bench does NOT add to triceps. Fractional counting against these
                      // landmarks would overcount and under-prescribe. Don't flip without
                      // recalibrating the tables.
  perSessionMax: 12,  // [PUB] beyond this, systemic fatigue makes more work junk volume
  perSessionMin: 4
};

/* ================================================================
 * VOLUME LANDMARKS — weekly sets. [PUB], rpstrength.com per-muscle guides.
 *
 * ⚠️ TWO INCOMPATIBLE RP DATASETS EXIST. The help center publishes older, higher numbers with
 * MRV scaled by frequency (chest 20/25/30/35 for 2/3/4/5-6×). These blog numbers are newer,
 * complete, and carry the *P (priority) columns that map onto the app's Emphasize/Grow/Maintain.
 * They reconcile: the help center's high-frequency MRV ≈ this table's MRV*P.
 * So: Emphasize ramps to MRV*P, Grow caps at MAV, Maintain holds MV. Same numbers, one model.
 *
 * Every row verified against the live page. The BACK row is published only as a PNG
 * (back1.png) and was read visually — text-only extraction of that page returns nothing,
 * and at least one extractor hallucinated a plausible-looking table. Don't "fix" it from text.
 * ================================================================ */
const LANDMARKS = {
  //           MV      MEV      MAV       MRV       MAV*P     MRV*P      freq
  chest:      { mv:[2,4], mev:[4,6],  mav:[6,16],  mrv:[16,24], mavP:[16,24], mrvP:[24,32], freq:[2,4] },
  back:       { mv:[2,6], mev:[6,8],  mav:[8,20],  mrv:[20,26], mavP:[20,26], mrvP:[26,34], freq:[2,4] },
  quads:      { mv:[2,4], mev:[4,6],  mav:[6,14],  mrv:[14,18], mavP:[10,18], mrvP:[18,24], freq:[2,5] },
  hamstrings: { mv:[0,2], mev:[2,4],  mav:[2,8],   mrv:[8,14],  mavP:[8,14],  mrvP:[14,20], freq:[2,3] },
  glutes:     { mv:[2,6], mev:[6,8],  mav:[8,24],  mrv:[24,30], mavP:[24,30], mrvP:[30,40], freq:[2,5] },
  biceps:     { mv:[6,8], mev:[8,10], mav:[14,20], mrv:[20,26], mavP:[20,26], mrvP:[26,35], freq:[3,6] },
  triceps:    { mv:[0,4], mev:[4,6],  mav:[6,16],  mrv:[16,20], mavP:[16,20], mrvP:[20,26], freq:[2,4] },
  side_delt:  { mv:[2,6], mev:[6,8],  mav:[8,24],  mrv:[24,30], mavP:[24,30], mrvP:[30,40], freq:[3,6] },
  // ⚠️ rear delt MAV*P (24-30) vs MAV (4-12) is a discontinuous jump — verified as genuinely
  // on RP's page, almost certainly their copy-paste error. Clamped below.
  rear_delt:  { mv:[0,4], mev:[0,4],  mav:[4,12],  mrv:[12,20], mavP:[12,20], mrvP:[24,32], freq:[3,6] },
  front_delt: { mv:[0,2], mev:[0,2],  mav:[4,8],   mrv:[8,12],  mavP:[12,16], mrvP:[16,20], freq:[2,3] },
  traps:      { mv:[0,4], mev:[0,4],  mav:[4,12],  mrv:[12,20], mavP:[16,24], mrvP:[24,32], freq:[2,4] },
  calves:     { mv:[2,4], mev:[4,6],  mav:[6,16],  mrv:[16,24], mavP:[16,24], mrvP:[24,32], freq:[3,6] },
  abs:        { mv:[0,4], mev:[0,4],  mav:[4,12],  mrv:[12,20], mavP:[16,24], mrvP:[24,32], freq:[3,6] },
  forearms:   { mv:[0,4], mev:[0,8],  mav:[8,24],  mrv:[24,30], mavP:[24,30], mrvP:[30,40], freq:[3,6] },
  adductors:  { mv:[0,2], mev:[2,4],  mav:[4,10],  mrv:[10,16], mavP:[10,16], mrvP:[16,22], freq:[2,4] }
};
/* [APP] RP auto-removes these from the deload week entirely. */
const DELOAD_DROP = ["traps", "forearms"];

const MG_LABEL = {
  chest:"Chest", back:"Back", triceps:"Triceps", biceps:"Biceps", front_delt:"Front Delts",
  side_delt:"Side Delts", rear_delt:"Rear Delts", quads:"Quads", glutes:"Glutes",
  hamstrings:"Hamstrings", calves:"Calves", traps:"Traps", forearms:"Forearms",
  abs:"Abs", adductors:"Adductors"
};
const MG_LOWER = m => (MG_LABEL[m] || m).toLowerCase();
const CATEGORY = {
  chest:"push", triceps:"push", front_delt:"push", side_delt:"push",
  back:"pull", biceps:"pull", rear_delt:"pull",
  quads:"legs", glutes:"legs", hamstrings:"legs", calves:"legs",
  traps:"acc", forearms:"acc", abs:"acc", adductors:"acc"
};
const CAT_COLOR = { push:"var(--push)", pull:"var(--pull)", legs:"var(--legs)", acc:"var(--acc)" };
/* [PUB] Published rest times per muscle (min seconds, max seconds). RP's app has no timer —
   deliberately — and it's their #1 review complaint. We ship one; these are their own numbers. */
const REST = {
  chest:[60,180], back:[60,180], quads:[30,180], hamstrings:[30,180], glutes:[30,180],
  biceps:[30,120], triceps:[30,120], rear_delt:[15,120], side_delt:[30,120], front_delt:[30,120],
  traps:[30,120], calves:[30,90], forearms:[30,90], abs:[30,90], adductors:[30,120]
};

const landmarks = m => LANDMARKS[m] || { mv:[2,4], mev:[4,6], mav:[6,14], mrv:[14,20], mavP:[14,20], mrvP:[20,26], freq:[2,4] };

const EMPHASIS = ["maintain", "grow", "emphasize"];
/**
 * [APP] Muscle Emphasis Breakdown, verbatim semantics:
 *   Emphasize (3 bars) = ramp MEV → MRV · Grow (2) = stay near MEV, raise only when needed
 *   Maintain (1 bar)   = hold at MV, freeing recovery for other priorities
 */
function band(muscle, emphasis) {
  const L = landmarks(muscle);
  if (emphasis === "maintain") return { floor: L.mv[0], start: L.mv[1], ceil: L.mv[1] };
  if (emphasis === "grow")     return { floor: L.mev[0], start: L.mev[0], ceil: L.mav[1] };
  // emphasize → ramp toward the priority ceiling. Clamp the rear-delt discontinuity.
  const hi = Math.max(L.mrvP[1], L.mrv[1]);
  return { floor: L.mev[0], start: L.mev[0], ceil: hi };
}

/* ================================================================
 * PERFORMANCE — computed, never asked.
 *
 * This is the key structural insight: RP's BOOK asks the lifter to self-score performance.
 * The APP doesn't — it has your logs, so it computes this and spends its four questions on
 * soreness / pump / workload / joint pain instead.
 *
 * [PUB] scale (book, Table 2.3):
 *   0 = hit target reps but needed 2+ EXTRA reps to reach target RIR (way easier than planned)
 *   1 = hit target reps at 0-1 extra reps / 1 RIR above target
 *   2 = hit target reps but PAST target RIR (harder than planned)
 *   3 = could NOT match last week's reps at any RIR   ← the MRV detector
 * ================================================================ */
const PF = { EASY: 0, ON: 1, HARD: 2, FAIL: 3 };

/**
 * @param sets   this session's logged sets for one muscle [{load,reps,targetReps,rir}]
 * @param prev   last session's sets for the same muscle
 * @param week1  true if this is the muscle's first appearance in the meso
 */
function performanceScore(sets, prev, week1) {
  const live = (sets || []).filter(s => s.reps != null && s.reps >= 0 && s.load);
  if (!live.length) return null;
  // [PUB] "Week 1 of a meso → score performance as 1-2." We use 1 so volume can still ramp
  // week 1 → 2, which RP's own worked examples do.
  if (week1 || !prev || !prev.length) return PF.ON;

  const e1 = a => a.reduce((s, x) => s + epley(x.load, x.reps, x.rir), 0) / a.length;
  const now = e1(live), was = e1(prev.filter(s => s.reps >= 0 && s.load));
  if (!was) return PF.ON;

  // PF 3 = couldn't match last week AT ANY RIR. Must subtract EXPECTED decline, or this
  // false-positives every week: RIR targets fall as the meso runs, so some rep loss is planned.
  // 3% band ≈ regular fatigue accumulation; beyond that is the "big hit" RP describes.
  if (now < was * 0.97) return PF.FAIL;

  const extra = live.reduce((s, x) => s + (x.reps - (x.targetReps || x.reps)), 0) / live.length;
  if (extra >= 2) return PF.EASY;
  if (extra >= 0) return PF.ON;
  return PF.HARD;
}

/* ================================================================
 * FEEDBACK → SET DELTA
 *
 * Core = RP's PUBLISHED Set Progression Algorithm (book Table 2.3 / the Nov-2019 revision of
 * the Volume Landmarks article), which is a soreness × performance table. On top of that sit
 * the app's extra axes (pump, workload) and RP's two hard overrides.
 *
 * [PUB] "no matter how little soreness you are experiencing, if you score a 2 or higher on
 *       (lack of) performance you should not add sets, and if you score a 3, you should
 *       employ recovery strategies."
 * [APP] "If you click push my limits on any of your muscle groups... it won't increase your
 *       sets no matter what you rate for pump or soreness or anything else. Push my limits
 *       is a hard stop."
 * ================================================================ */
const SORENESS = ["never", "healed_early", "healed_ontime", "still_sore"];   // → 0..3
const PUMP     = ["low", "moderate", "amazing"];                              // → 0..2
const WORKLOAD = ["not_enough", "just_right", "pushed", "too_much"];          // → 0..3
const JOINT    = ["none", "low", "moderate", "a_lot"];                        // → 0..3
const ix = (arr, v) => { const i = arr.indexOf(v); return i < 0 ? null : i; };

const ACTION = { ADD:"add", HOLD:"hold", CUT:"cut", RECOVERY:"recovery" };

/**
 * @param fb   {soreness, pump, workload, jointPain} — any may be missing (skipped)
 * @param pf   performance score 0-3 (computed). null → treat as ON.
 * @param emphasis "maintain"|"grow"|"emphasize"
 * @returns {delta, action, gated, swapExercise, reasons[]}
 */
function setDelta(fb, pf, emphasis) {
  fb = fb || {}; emphasis = emphasis || "grow";
  const SO = ix(SORENESS, fb.soreness);
  const PU = ix(PUMP, fb.pump);
  const WL = ix(WORKLOAD, fb.workload);
  const JP = ix(JOINT, fb.jointPain);
  const P = pf == null ? PF.ON : pf;
  const reasons = [];
  let swapExercise = false;

  // ── 1. Fatigue overrides, ordered — first match wins ──
  if (P === PF.FAIL) {
    reasons.push("Couldn't match last session — that's your MRV. Recovery session.");
    return { delta: 0, action: ACTION.RECOVERY, gated: true, swapExercise, reasons };
  }
  if (WL === 3) {   // "too much" — "so much volume you can barely see above water"
    reasons.push("Too much volume — cutting back");
    return { delta: -1, action: ACTION.CUT, gated: true, swapExercise, reasons };
  }
  if (SO === 3) {   // still sore
    reasons.push("Still sore — you're not recovering in time");
    return { delta: P >= PF.HARD ? -1 : 0, action: P >= PF.HARD ? ACTION.CUT : ACTION.HOLD,
             gated: true, swapExercise, reasons };
  }

  // ── 2. Joint pain routes to EXERCISE SWAP, not primarily to volume ──
  // [PUB] Joint pain is RP's exercise-REPLACEMENT criterion (Variation chapter): "unless it is
  // #2 (the exercise is hurting you)" it's your call — pain is the one that forces the swap.
  // Treating it as a volume knob is the naive read.
  if (JP >= 2) {
    swapExercise = true;
    reasons.push(JP === 3 ? "Joint pain is bad — swap this exercise, don't just cut sets"
                          : "Joint pain — consider swapping this exercise");
  }

  // ── 3. RP's published base table ──
  let d;
  if (SO === 0 && P === PF.EASY) { d = 2; reasons.push("No soreness and it was easy — big add"); }
  else if (SO != null && SO <= 1 && P <= PF.ON && !(SO === 0 && P === PF.EASY)) { d = 1; }
  else d = 0;

  // ── 4. The app's stimulus axis (pump + workload) ──
  // [RECON] grounded in RP's only published mapping: "unimpressive pumps and barely sore at all,
  // and workload perception as pretty easy → usually assign you more sets."
  if (PU != null && WL != null) {
    const stim = PU + WL;                       // 0..5
    if (stim <= 1) { d += 1; reasons.push("Barely a pump and the work felt easy — under-stimulated"); }
    if (stim >= 4) d = Math.min(d, 0);
  }

  // ── 5. OVERRIDES — these apply LAST, after every additive term.
  // Order matters: an earlier draft applied the performance override before the stimulus
  // bonus, so "no pump + easy work" silently re-added the set that RP's rule had just
  // forbidden. Any bonus computed after a clamp defeats the clamp.
  let gated = false;
  // [PUB] "no matter how little soreness you are experiencing, if you score a 2 or higher on
  // (lack of) performance you should not add sets."
  if (P >= PF.HARD && d > 0) { d = 0; gated = true; reasons.push("Harder than planned — holding volume"); }
  // [APP] THE HARD GATE. Beats everything.
  if (WL === 2) {
    if (d > 0) { d = 0; gated = true; }
    reasons.push("Pushed your limits — hard stop on adding sets");
  }
  if (PU === 2 && d > 0) { d = 0; gated = true; reasons.push("Amazing pump — you're winning, holding"); }

  // ── 6. Emphasis modifier [APP] ──
  if (emphasis === "maintain") { d = Math.min(d, 0); reasons.push("Maintaining — holding at MV"); }
  else if (emphasis === "grow") d = Math.min(d, 1);   // "raise only when needed"

  if (d > 0 && !reasons.length) reasons.push("Recovering well — adding volume");
  const action = d > 0 ? ACTION.ADD : d < 0 ? ACTION.CUT : ACTION.HOLD;
  return { delta: d, action, gated, swapExercise, reasons };
}

/** Apply a delta within the emphasis band and the per-session cap. */
function applyDelta(current, delta, muscle, emphasis) {
  const b = band(muscle, emphasis);
  const hi = Math.min(b.ceil, CFG.perSessionMax);
  let sets = current + delta, capped = false;
  if (sets > hi) { sets = hi; capped = true; }
  if (sets < b.floor) { sets = b.floor; capped = true; }
  return { sets, capped, atCeiling: sets >= hi, ceil: hi, floor: b.floor };
}

/* ================================================================
 * MRV DETECTION  — performance-based ONLY.
 * [PUB] "MRV is the amount of sets beyond which you're so fatigued that the next week your rep
 * strength takes a big hit; MORE than you'd predict just based on regular fatigue accumulation."
 * Soreness and joint pain are NOT MRV criteria. And it takes TWO in a row:
 * "If you've under-performed two sessions in a row, you have likely hit your MRV."
 * ================================================================ */
function mrvHit(recentPf) {
  const last2 = (recentPf || []).slice(-2);
  return last2.length === 2 && last2.every(p => p === PF.FAIL);
}

/** [PUB] Recovery session: halve sets AND reps at the SAME load. */
function recoverySession(base) {
  return { sets: Math.max(1, Math.round(base.sets / 2)), reps: Math.max(3, Math.round(base.reps / 2)),
           load: base.load, rir: base.rir, note: "Recovery session — half sets, half reps, same weight" };
}
/** [PUB] After a recovery session, resume at the MIDPOINT between MEV and MRV — not at MEV. */
function resumeVolume(muscle, emphasis) {
  const L = landmarks(muscle), b = band(muscle, emphasis);
  return Math.round((L.mev[0] + b.ceil) / 2);
}

/* ================================================================
 * MESOCYCLE STRUCTURE
 * [APP] The last week is ALWAYS the deload, and it's SCHEDULED — not MRV-triggered.
 * Two independent mechanisms: this fixed end-of-cycle deload, plus reactive mid-cycle
 * recovery sessions (above). Don't build a "hit MRV → deload" branch.
 * ================================================================ */
function rirForWeek(week, totalWeeks, opts) {
  const A = totalWeeks - 1;                    // accumulation weeks; last is deload
  if (week > A) return 5;                      // [PUB] deload RIR is 5+
  const start = (opts && opts.rirStart) || CFG.rirStart;
  if (A <= 1) return start;
  // Descend linearly to 0, integer rungs, never duplicating the endpoints.
  return Math.round(start * (A - week) / (A - 1));
}
/** [PUB] Per-exercise RIR floor: 0 normally, but 1 for lifts that can drop the bar on you. */
const rirFloor = ex => (ex && ex.failure_safe === false) ? 1 : 0;
const isDeload = (week, totalWeeks) => week === totalWeeks;
const deloadDrops = muscle => DELOAD_DROP.includes(muscle);

/**
 * [PUB] Deload: sets to MEV (or MV — see CFG.deloadTo), reps ~50% of week 1, RIR 5+.
 * Load is the subtle part: week-1 load for the FIRST HALF of the week, then 50% of week-1 load
 * for the SECOND HALF. "cut not only sets and reps in half, but the weights as well."
 * @param half "first"|"second"
 */
function deloadPrescription(base, muscle, half) {
  const L = landmarks(muscle);
  const target = CFG.deloadTo === "mv" ? L.mv[1] : L.mev[0];
  return {
    sets: Math.max(1, Math.min(target, Math.round(base.sets / 2))),
    reps: Math.max(5, Math.round(base.reps / 2)),
    load: half === "second" ? Math.round(base.load * 0.5) : base.load,
    rir: 5
  };
}

/* ================================================================
 * LOAD / REP PROGRESSION
 * [PUB] "You should seek to keep reps stable from week to week while letting your RIR decline.
 *        The way you keep the reps stable as RIR falls is by adding weight."
 * [APP] "weight is increased by a few percentage points each week, and if the next weight
 *        increment is outside of that range (like going from the 10lb to the 15lb dumbbells),
 *        it adds a rep to each set instead."
 * ================================================================ */
const epley = (w, reps, rir = 0) => w * (1 + (reps + (rir || 0)) / 30);
const loadFor = (e1rm, reps, rir = 0) => e1rm / (1 + (reps + (rir || 0)) / 30);
const PCT_BAND = [0.02, 0.05];   // [RECON] "a few percentage points"

/**
 * @param last {load, reps, rir}
 * @param slot {repRange:[lo,hi], rir}
 * @param plan loadPlan or null
 */
function progress(last, slot, plan) {
  if (!last || !last.load) return null;
  const [lo, hi] = slot.repRange || [8, 12];
  const step = plan ? plan.stepAt(last.load) : 5;
  const target = last.load * (1 + PCT_BAND[0]);
  const ceiling = last.load * (1 + PCT_BAND[1]);
  const next = plan ? plan.nearestAtOrAbove(Math.max(target, last.load + 0.01)) : last.load + 5;

  // Rep-range guard [PUB]: past the top of the range → force a load increase, reps back to low.
  if (last.reps > hi) {
    if (plan && next > last.load && next <= plan.max) return { load: next, reps: lo, why: "load_forced" };
    return { load: last.load, reps: last.reps + 1, why: "rep_over" };
  }
  // The app's actual rule: if the next available increment lands inside the band, add weight and
  // HOLD reps. If the jump overshoots (10lb → 15lb DBs), add a rep instead.
  if (next > last.load && next <= ceiling) return { load: next, reps: last.reps, why: "load" };
  if (last.reps < hi) return { load: last.load, reps: last.reps + 1, why: "rep" };
  // Top of range and the equipment can't express a sane jump → take the coarse jump, reset reps.
  if (plan && next <= plan.max) return { load: next, reps: lo, why: "load_coarse" };
  return { load: last.load, reps: last.reps + 1, why: "rep_over" };
}

/** [PUB] RP's predictive matching: override the load → recompute reps at equal relative overload. */
function matchReps(newLoad, last, slot) {
  if (!last || !last.load || !newLoad) return null;
  const e1 = epley(last.load, last.reps, last.rir == null ? slot.rir : last.rir);
  const reps = Math.round((e1 / newLoad - 1) * 30 - slot.rir);
  const drift = Math.abs(newLoad - last.load) / last.load;
  // [APP] Past ~20% off, the app can't infer — it falls back to displaying RIR and asking for reps.
  if (drift > 0.2 || reps < 3 || reps > 40) return { reps: null, fallbackRIR: slot.rir };
  return { reps, fallbackRIR: null };
}

/** Per-set outcome badge — RP's own labels. */
function setBadge(cur, prev, slot) {
  if (!prev || !prev.load) return null;
  const a = epley(cur.load, cur.reps, slot.rir), b = epley(prev.load, prev.reps, slot.rir);
  const d = (a - b) / b;
  if (d > 0.012) return { k: "increase", t: "Improved!" };
  if (d < -0.012) return { k: "decrease", t: "Regressed" };
  return { k: "maintain", t: "Maintained" };
}

/* ================================================================
 * FREQUENCY / SPLIT
 * [PUB] "for every 8-10 direct sets per muscle per week, add another training session."
 * Volume forces frequency; the split falls out. RP deliberately publishes NO day-by-day
 * templates and their editorial line is literally "Your Training Split Doesn't Matter."
 * ================================================================ */
const minFrequency = weeklySets => Math.max(1, Math.ceil(weeklySets / 9));
function splitFor(days) {
  return ({
    2: { name: "Full Body ×2", days: ["full", "full"] },
    3: { name: "Full Body ×3", days: ["full", "full", "full"] },
    4: { name: "Upper / Lower ×2", days: ["upper", "lower", "upper", "lower"] },
    5: { name: "Upper / Lower + Arms & Delts", days: ["upper", "lower", "upper", "lower", "arms"] },
    6: { name: "Push / Pull / Legs ×2", days: ["push", "pull", "legs", "push", "pull", "legs"] }
  })[days] || { name: "Full Body ×3", days: ["full", "full", "full"] };
}

/* ================================================================
 * EQUIPMENT RESOLUTION
 * ================================================================ */
function loadPlan(inst) {
  if (!inst || !inst.load) return null;
  const L = inst.load;
  let min = L.min || 0, max = L.max || 0;
  const inc = L.increment || 5;
  const addOn = (L.add_on && L.add_on.length) ? Math.min.apply(null, L.add_on) : 0;

  if (L.kind === "plate_loaded" && inst.plates) {
    // The plate inventory is a REAL ceiling. "The garage only has 275lb of plates" is a hard
    // filter, not a difficulty — if the working weight exceeds it, the exercise is unavailable.
    // Plates load in PAIRS, per size: an odd 45 is a paperweight. Summing everything and
    // rounding to even (a tempting shortcut) silently gifts you the unpaired plates.
    let usable = 0;
    const inv = inst.plates.inventory || {};
    for (const k in inv) usable += parseFloat(k) * (Math.floor(inv[k] / 2) * 2);
    const bar = inst.bar_weight || L.carriage_weight || 0;
    max = Math.min(max || Infinity, bar + usable);
    min = bar;
  }
  const step = () => (addOn && addOn < inc) ? addOn : inc;
  return {
    min, max, increment: inc, addOn, kind: L.kind,
    stepAt: () => step(),
    canReach: w => w >= min - 0.01 && w <= max + 0.01,
    nearestAtOrBelow: w => w < min ? min : Math.min(max, min + Math.floor((w - min) / step() + 1e-6) * step()),
    nearestAtOrAbove: w => w <= min ? min : Math.min(max, min + Math.ceil((w - min) / step() - 1e-6) * step())
  };
}

const capsOf = inst => (inst.caps || []).concat(inst.machine_key ? [inst.machine_key] : []);

function instMatches(req, inst) {
  if (!capsOf(inst).includes(req.cap)) return false;
  if (req.machine_key && inst.machine_key !== req.machine_key) return false;
  if (req.attachment && !((inst.attachments || []).includes(req.attachment))) return false;
  if (req.attrs) {
    for (const k in req.attrs) {
      const want = req.attrs[k], have = (inst.attrs || {})[k];
      if (Array.isArray(want) && want.length === 2 && typeof want[0] === "number") {
        const list = Array.isArray(have) ? have : [have];
        if (!list.some(x => x >= want[0] && x <= want[1])) return false;
      } else if (have !== want && !(Array.isArray(have) && have.includes(want))) return false;
    }
  }
  if (req.load && req.load.pairs && inst.load && inst.load.pairs === false) return false;
  return true;
}

/** Resolve `requires` (2-level DNF: any-of-alls) against a gym, honoring occupied instances. */
function resolveEquipment(ex, gym, occupied) {
  occupied = occupied || new Set();
  const eq = (gym && gym.equipment) || [];
  for (const alt of ((ex.requires && ex.requires.any) || [])) {
    const picked = []; let ok = true;
    for (const req of (alt.all || [])) {
      const inst = eq.find(i => !occupied.has(i.instance_id) && instMatches(req, i));
      if (!inst) { ok = false; break; }
      picked.push(inst);
    }
    if (ok) {
      const carrier = picked.find(i => i.load) || picked[0];
      return { ok: true, instances: picked, carrier, plan: loadPlan(carrier) };
    }
  }
  return { ok: false };
}

function violatesGym(ex, gym) {
  const c = (gym && gym.constraints) || {};
  if (c.ceiling_height_in && ex.needs_overhead_clearance && c.ceiling_height_in < 96) return true;
  if (c.noise_limit && ex.drops_weight) return true;
  return false;
}

/* ================================================================
 * SCORING
 * ================================================================ */
const TIER = { S:1, A:.8, B:.6, C:.4, D:.2 };
const n5 = v => Math.max(0, Math.min(1, ((v || 3) - 1) / 4));
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const saturate = (x, k) => x <= 0 ? 0 : x / (x + k);

const W = {
  quality:.40, slotFit:.25, progression:.20, context:.15,
  q_tier:.40, q_sfr:.35, q_target:.15, q_rom:.10,
  f_profile:.35, f_stretch:.25, f_reps:.20, f_stability:.20,
  p_gran:.60, p_head:.40,
  c_systemic:.30, c_redundancy:.40, c_setup:.10, c_risk:.20,
  m_continuity:+.30, m_joint:-.50, m_stale:-.15, m_contention:-.12, m_untested:-.08
};

const effTier = (user, ex, m) => {
  const base = (ex.ratings.rp_tier || {})[m] || "C";
  const order = ["D","C","B","A","S"];
  const d = ((user.overrides || {})[ex.id] || {}).tier_delta || 0;
  return order[clamp(order.indexOf(base) + d, 0, 4)];
};
const effSFR = (user, ex) => clamp((ex.ratings.sfr || 3) + (((user.overrides || {})[ex.id] || {}).sfr_delta || 0), 1, 5);
const repBucket = r => { const hi = r[1]; return hi <= 10 ? "5_8" : hi <= 12 ? "8_12" : hi <= 20 ? "12_20" : "20_30"; };
const TARGET_JUMP = { "5_8":.025, "8_12":.035, "12_20":.045, "20_30":.05 };

function profileMatch(peak, want) {
  if (!want) return .5;
  if (peak === want) return 1;
  if ((want === "stretch" || want === "shortened") && peak === "mid") return .6;
  return .25;
}
/* [PUB] Stabilized work keeps SFR intact when you're cooked. High stability demand is fine as
   the day's opener and progressively worse as fatigue accumulates. */
const stabilityFit = (demand, position, spent) =>
  clamp(1 - n5(demand) * clamp((position - 1) * .25 + spent, 0, 1), 0, 1);

/* [PUB] RP's real warning is against same-ANGLE redundancy, not against repeating an exercise —
   they explicitly endorse heavy bench Mon / light bench Wed / flye Fri. */
function redundancy(chosen, ex) {
  let r = 0;
  for (const c of (chosen || [])) {
    if (c.family === ex.family) r += .35;
    if (c.profile && ex.profile && c.profile.resistance_peak === ex.profile.resistance_peak) r += .3;
  }
  return clamp(r, 0, 1);
}

function scoreExercise(c, slot, gym, user, session) {
  const ex = c.ex, m = slot.muscle;
  const Q = W.q_tier * (TIER[effTier(user, ex, m)] || .4)
          + W.q_sfr * n5(effSFR(user, ex))
          + W.q_target * n5(ex.ratings.target_specificity)
          + W.q_rom * n5(ex.profile.rom_score);

  const bucket = repBucket(slot.repRange || [8, 12]);
  const F = W.f_profile * profileMatch(ex.profile.resistance_peak, slot.wanted_profile)
          + W.f_stretch * (slot.wants_stretch ? n5(ex.profile.stretch_emphasis) : .5)
          + W.f_reps * ((ex.rep_suitability || {})[bucket] != null ? ex.rep_suitability[bucket] : .3)
          + W.f_stability * stabilityFit(ex.ratings.stability_demand, slot.position || 1, session.fatigueSpent || 0);

  let P = .5;
  if (c.plan && c.load) {
    const step = c.plan.stepAt(c.load);
    const want = c.load * (TARGET_JUMP[bucket] || .04);
    // A 15lb stack jump at a 40lb load → gran ≈ 0. That's a dead end, not "hard".
    const gran = clamp(1 - Math.max(0, step - want) / want, 0, 1);
    const head = saturate((c.plan.max - c.load) / Math.max(c.load, 1), .35);
    P = W.p_gran * gran + W.p_head * head;
  }

  const solo = ((gym.constraints || {}).solo_training !== false);
  const riskMult = (ex.failure_safe || !solo) ? .3 : 1;
  const X = clamp(1
    - W.c_systemic * n5(ex.fatigue.systemic) * (session.fatigueSpent || 0)
    - W.c_redundancy * redundancy(session.chosen, ex)
    - W.c_setup * n5(ex.ratings.setup_cost) * (session.timeboxed ? 1 : .3)
    - W.c_risk * n5(ex.ratings.injury_risk) * riskMult, 0, 1);

  let s = W.quality * Q + W.slotFit * F + W.progression * P + W.context * X;

  // [PUB] "If you are still hitting PRs... don't change it! If this means you keep an exercise
  // around for up to a year or more, so be it." Consistency beats optimality — you cannot
  // progress what you keep replacing.
  if (slot.exId === ex.id) s += W.m_continuity;
  if (user.painFlags && user.painFlags[ex.id]) s += W.m_joint;
  if (session.atMesoBoundary && user.staleness && user.staleness[ex.id])
    s += W.m_stale * clamp(user.staleness[ex.id] / 3, 0, 1);
  if (c.carrier && c.carrier.contention) s += W.m_contention * ({ low:0, med:.5, high:1 })[c.carrier.contention];
  if ((slot.position || 1) === 1 && user.loadState && !user.loadState[user.id + "|" + ex.id]) s += W.m_untested;
  return s;
}

function selectForSlot(slot, gym, user, session, library) {
  session = session || {};
  const occupied = session.occupied instanceof Set ? session.occupied : new Set(session.occupied || []);
  const out = [];
  for (const ex of library) {
    const hit = (ex.muscles || []).find(x => x.m === slot.muscle && (x.role === "primary" || slot.allow_secondary));
    if (!hit) continue;
    if (((user.overrides || {})[ex.id] || {}).blacklist) continue;
    if ((user.injuries || []).some(i => (i.blacklist || []).includes(ex.id))) continue;
    if (violatesGym(ex, gym)) continue;
    const bind = resolveEquipment(ex, gym, occupied);
    if (!bind.ok) continue;
    const load = targetLoad(user, ex, bind, slot);
    // canReach checks BOTH ends. For a smaller lifter the FLOOR usually binds: a 15lb minimum
    // pin or the 45lb bar can be TOO HEAVY. Same gym, different eligible sets per user.
    if (load && load.load != null && bind.plan && !bind.plan.canReach(load.load)) continue;
    const c = { ex, bind, carrier: bind.carrier, plan: bind.plan, load: load && load.load, est: load };
    c.score = scoreExercise(c, slot, gym, user, session);
    out.push(c);
  }
  out.sort((a, b) => b.score - a.score);
  const primary = out[0] || null;
  return { primary, backups: primary ? pickBackups(out, primary, 3) : [], all: out };
}

const sharesInstance = (a, b) =>
  (a.bind.instances || []).some(i => (b.bind.instances || []).some(j =>
    j.instance_id === i.instance_id && (i.count || 1) <= 1));

/** A backup that binds the same instance as the primary is not a backup. */
function pickBackups(scored, primary, n) {
  const out = [];
  for (const c of scored.slice(1)) {
    if (sharesInstance(c, primary)) continue;
    if (out.some(o => sharesInstance(o, c))) continue;
    out.push(c);
    if (out.length >= n - 1) break;
  }
  const fb = scored.find(c => ((c.carrier && c.carrier.contention) || "low") === "low"
                              && !out.includes(c) && c !== primary);
  if (fb) out.push(fb);
  return out.slice(0, n);
}

/* ================================================================
 * CROSS-EXERCISE LOAD ESTIMATION
 * Raw pounds NEVER move between exercises. 75lb dumbbells and a 140 stack pin are not the same
 * number and no schema makes them one. What carries is an e1RM RATIO, shown AS an estimate,
 * corrected by one calibration set, personal after ~3 exposures.
 * ================================================================ */
function loadKey(userId, ex, bind) {
  const inst = bind && bind.carrier;
  // Machine loads are instance-scoped; free-weight loads are absolute (70lb DB is 70lb anywhere).
  return ex.load_portability === "machine_relative" && inst
    ? `${userId}|${ex.id}@${inst.instance_id}` : `${userId}|${ex.id}`;
}

function ratio(user, fromEx, toEx, library) {
  if (fromEx.id === toEx.id) return { r: 1, c: 1 };
  const learned = (user.learned_ratios || {})[`${toEx.id}<-${fromEx.id}`];
  if (learned) return { r: learned.r, c: learned.c };
  const direct = (toEx.ratio_anchors || {})[fromEx.id];
  if (direct) return { r: direct.r, c: direct.c };
  const back = (fromEx.ratio_anchors || {})[toEx.id];
  if (back && back.r) return { r: 1 / back.r, c: back.c };
  // Compose through family hubs: r(A→C) = r(A→hubA)·r(hubA→hubC)·r(hubC→C). O(n), not O(n²).
  const hub = f => library.find(e => e.family === f && e.hub);
  const hA = hub(fromEx.family), hB = hub(toEx.family);
  if (!hA || !hB) return null;
  const leg = (from, to) => {
    if (from.id === to.id) return { r: 1, c: 1 };
    const f = (to.ratio_anchors || {})[from.id]; if (f) return f;
    const b = (from.ratio_anchors || {})[to.id]; if (b) return { r: 1 / b.r, c: b.c };
    return null;
  };
  const a = leg(fromEx, hA), b = leg(hA, hB), c = leg(hB, toEx);
  if (a && b && c) return { r: a.r * b.r * c.r, c: Math.min(a.c, b.c, c.c) * 0.8 };
  return null;
}

/** Target working load. Exact when we've done it; an explicit estimate otherwise. */
function targetLoad(user, ex, bind, slot) {
  const ls = user.loadState || {};
  const known = ls[loadKey(user.id, ex, bind)];
  // 45-day freshness. Note this survives meso boundaries — RP throws load history away every
  // mesocycle ("you start over every six weeks") and it's a top-5 review complaint. We don't.
  if (known && known.at && (Date.now() - new Date(known.at)) < 45 * 864e5) {
    const p = progress(known, slot, bind.plan);
    if (p) return { load: p.load, reps: p.reps, calibration: false, confidence: 1, why: p.why };
  }
  const lib = window.MESO_EXERCISES || [];
  const src = slot.exId && slot.exId !== ex.id ? lib.find(e => e.id === slot.exId) : null;
  const srcState = src && ls[`${user.id}|${src.id}`];
  if (!src || !srcState) return { load: null, calibration: true, confidence: 0, why: "feel_out" };
  const rr = ratio(user, src, ex, lib);
  if (!rr) return { load: null, calibration: true, confidence: 0, why: "feel_out" };
  const e1 = epley(srcState.load, srcState.reps, srcState.rir || slot.rir) * rr.r;
  const raw = loadFor(e1, (slot.repRange || [8, 12])[1], slot.rir);
  return {
    load: bind.plan ? bind.plan.nearestAtOrBelow(raw) : Math.round(raw),   // round DOWN, always
    reps: (slot.repRange || [8, 12])[1], calibration: true, confidence: rr.c, why: "ratio"
  };
}

/** After a calibration set, learn the real ratio. α=0.3 → personal in ~3 exposures. */
function learnRatio(user, fromEx, toEx, e1From, e1To) {
  const key = `${toEx.id}<-${fromEx.id}`;
  const prior = (user.learned_ratios || {})[key];
  const a = 0.3, observed = e1To / e1From;
  return {
    key, r: prior ? (1 - a) * prior.r + a * observed : observed,
    c: Math.min(0.95, (prior ? prior.c : 0.3) + 0.15), n: (prior ? prior.n : 0) + 1
  };
}

/* ================================================================
 * WEEKLY VOLUME
 * [PUB] A countable working set is 30-85% 1RM, 5-30 reps, 0-4 RIR, and counts ONLY where the
 * target muscle is prime mover or the exercise is an isolation for it. Indirect volume is
 * PRE-BAKED into the landmark numbers — bench does NOT add to triceps. Counting fractionally
 * against these tables would overcount and systematically under-prescribe. See CFG.countDirect.
 * ================================================================ */
function weeklyVolume(sessions, library) {
  const out = {};
  for (const s of sessions || []) {
    // Travel sessions still COUNT toward volume — a set is a set, stimulus is stimulus.
    // (They're excluded from e1RM trend instead; see e1rmTrend.)
    for (const set of s.sets || []) {
      if (set.reps == null || set.reps < 0) continue;      // skipped sets write reps:-1
      const ex = (library || []).find(e => e.id === set.exId);
      if (!ex) continue;
      for (const m of ex.muscles || []) {
        if (CFG.countDirect) { if (m.role !== "primary") continue; out[m.m] = (out[m.m] || 0) + 1; }
        else out[m.m] = (out[m.m] || 0) + (m.contribution || (m.role === "primary" ? 1 : .5));
      }
    }
  }
  for (const k in out) out[k] = Math.round(out[k] * 10) / 10;
  return out;
}

/**
 * e1RM trend — the slot's real progression measure. NEVER absolute load.
 * ⚠️ off_plan (travel) sessions are EXCLUDED. Otherwise a hotel's 50lb dumbbell ceiling reads as
 * detraining, you believe it, and you deload for nothing. Single most likely way this app lies.
 */
function e1rmTrend(sessions, exId, slotRir) {
  const pts = [];
  for (const s of sessions || []) {
    if (s.off_plan) continue;
    for (const set of s.sets || []) {
      if (set.exId !== exId || !set.load || set.reps == null || set.reps < 0) continue;
      pts.push({ at: s.date, e: epley(set.load, set.reps, set.rir == null ? slotRir : set.rir) });
    }
  }
  if (pts.length < 2) return null;
  pts.sort((a, b) => new Date(a.at) - new Date(b.at));
  const first = pts[0].e, last = pts[pts.length - 1].e;
  return { pct: (last - first) / first, n: pts.length, last, first };
}

/* ================================================================
 * SELF-CHECK — RP's published rules must come out right. Run ENGINE.verify().
 * ================================================================ */
function verify() {
  const t = [];
  const eq = (n, got, want) => t.push({ n, ok: JSON.stringify(got) === JSON.stringify(want), got, want });
  const ok = (n, cond, got) => t.push({ n, ok: !!cond, got });

  // ── RP's PUBLISHED Set Progression Algorithm (book Table 2.3) ──
  eq("SO0 + PF0 → +2 sets", setDelta({ soreness:"never" }, PF.EASY, "emphasize").delta, 2);
  eq("SO<=1 + PF<=1 → +1 set", setDelta({ soreness:"healed_early" }, PF.ON, "emphasize").delta, 1);
  ok("SO2-3 + PF>=2 → hold", setDelta({ soreness:"healed_ontime" }, PF.HARD, "emphasize").delta <= 0);
  eq("PF3 → recovery session (MRV detector)",
     setDelta({ soreness:"never" }, PF.FAIL, "emphasize").action, ACTION.RECOVERY);
  ok("PUBLISHED override: PF>=2 never adds sets, however low the soreness",
     setDelta({ soreness:"never", pump:"low", workload:"not_enough" }, PF.HARD, "emphasize").delta <= 0);

  // ── The app's hard gate ──
  eq("'Pushed my limits' GATES a maximal add signal",
     setDelta({ soreness:"never", pump:"low", workload:"pushed" }, PF.EASY, "emphasize").delta, 0);
  ok("...and flags itself as gated",
     setDelta({ soreness:"never", pump:"low", workload:"pushed" }, PF.EASY, "emphasize").gated);

  // ── RP's three canonical composites [APP] ──
  ok("unimpressive pump + barely sore + easy → MORE sets",
     setDelta({ pump:"low", soreness:"healed_early", workload:"not_enough" }, PF.ON, "emphasize").delta > 0);
  eq("amazing pump + healed on time + pushed limits → NO change",
     setDelta({ pump:"amazing", soreness:"healed_ontime", workload:"pushed" }, PF.ON, "emphasize").delta, 0);
  ok("amazing pump + can't heal + drowning in volume → REDUCE",
     setDelta({ pump:"amazing", soreness:"still_sore", workload:"too_much" }, PF.ON, "emphasize").delta < 0);

  // ── Joint pain routes to SWAP, not to volume ──
  ok("bad joint pain flags an exercise swap",
     setDelta({ soreness:"never", jointPain:"a_lot" }, PF.ON, "emphasize").swapExercise);

  // ── Emphasis [APP] ──
  eq("Maintain never adds", setDelta({ soreness:"never" }, PF.EASY, "maintain").delta, 0);
  eq("Grow caps the add at +1", setDelta({ soreness:"never" }, PF.EASY, "grow").delta, 1);

  // ── Performance is COMPUTED ──
  eq("week 1 scores performance as 1 (nothing to compare)", performanceScore([{load:100,reps:10,rir:2}], null, true), PF.ON);
  eq("2+ extra reps → PF 0 (way easier than planned)",
     performanceScore([{load:100,reps:12,targetReps:10,rir:2}], [{load:100,reps:10,rir:2}], false), PF.EASY);
  eq("couldn't match last week → PF 3",
     performanceScore([{load:90,reps:8,targetReps:10,rir:2}], [{load:100,reps:10,rir:2}], false), PF.FAIL);
  ok("expected decline does NOT false-positive PF3",
     performanceScore([{load:100,reps:10,targetReps:10,rir:1}], [{load:100,reps:10,rir:2}], false) !== PF.FAIL);

  // ── MRV needs TWO consecutive failures ──
  eq("one bad session is not MRV", mrvHit([PF.ON, PF.FAIL]), false);
  eq("two in a row IS MRV", mrvHit([PF.FAIL, PF.FAIL]), true);

  // ── RIR: calendar, descending, deload 5+ ──
  eq("5wk meso (app default, start 2) → 2,1,1,0", [1,2,3,4].map(w => rirForWeek(w, 5)), [2,1,1,0]);
  eq("4wk meso → 2,1,0", [1,2,3].map(w => rirForWeek(w, 4)), [2,1,0]);
  eq("book start (3) over 4 accum → 3,2,1,0", [1,2,3,4].map(w => rirForWeek(w, 5, {rirStart:3})), [3,2,1,0]);
  eq("deload RIR is 5+", rirForWeek(5, 5), 5);
  ok("RIR descends, never ascends", [1,2,3,4].map(w => rirForWeek(w,5)).every((v,i,a) => i===0 || v<=a[i-1]));
  eq("bar-can-fall lifts floor at 1 RIR", rirFloor({ failure_safe:false }), 1);
  eq("safe lifts floor at 0 RIR", rirFloor({ failure_safe:true }), 0);

  // ── Deload ──
  eq("deload 2nd half halves the LOAD too",
     deloadPrescription({sets:6,reps:10,load:200}, "chest", "second").load, 100);
  eq("deload 1st half keeps week-1 load",
     deloadPrescription({sets:6,reps:10,load:200}, "chest", "first").load, 200);
  ok("traps are dropped from deload", deloadDrops("traps") && deloadDrops("forearms"));
  ok("chest is not dropped from deload", !deloadDrops("chest"));

  // ── Recovery protocol ──
  eq("recovery = half sets, half reps, SAME load",
     recoverySession({sets:6,reps:10,load:200,rir:1}), {sets:3,reps:5,load:200,rir:1,
     note:"Recovery session — half sets, half reps, same weight"});
  ok("resume at the MEV↔MRV midpoint, not at MEV", resumeVolume("back","emphasize") > landmarks("back").mev[0]);

  // ── Landmarks ──
  ok("Emphasize ceiling uses MRV*P", band("chest","emphasize").ceil >= 24);
  ok("Grow caps at MAV", band("chest","grow").ceil === 16);
  ok("Maintain holds at MV", band("chest","maintain").ceil === 4);
  ok("rear-delt MAV*P discontinuity is clamped, not propagated", band("rear_delt","grow").ceil === 12);

  // ── Frequency is FORCED by volume ──
  eq("20 weekly sets forces >=3 sessions", minFrequency(20), 3);
  eq("8 weekly sets needs only 1", minFrequency(8), 1);

  // ── Load progression ──
  // A barbell: 5lb steps against a 200lb working weight is ~2.5% — inside the band.
  const bar = loadPlan({ load:{ kind:"plate_loaded", min:45, max:495, increment:5 } });
  // Dumbbells: the 10→15lb rung is a 50% jump. RP's own example of when to add a rep instead.
  const dbs = loadPlan({ load:{ kind:"fixed_pairs", min:5, max:50, increment:5 } });
  eq("coarse DB jump (10→15lb) → add a rep instead",
     progress({load:10,reps:10,rir:2}, {repRange:[8,12],rir:1}, dbs).why, "rep");
  eq("sane jump → add load and HOLD reps",
     progress({load:200,reps:10,rir:2}, {repRange:[8,12],rir:1}, bar).reps, 10);
  eq("...and the load actually moved up", progress({load:200,reps:10,rir:2}, {repRange:[8,12],rir:1}, bar).load, 205);
  eq("past the rep range → forces load, resets reps to range low",
     progress({load:100,reps:14,rir:1}, {repRange:[8,12],rir:1}, bar).reps, 8);

  // ── Plate inventory is a real ceiling; the floor binds too ──
  // 45×4 + 25×2 + 10×4 + 5×4 + 2.5×2 = 295lb of plates, all in pairs → 45 + 295 = 340.
  const p = loadPlan({ bar_weight:45, plates:{ inventory:{ "45":4, "25":2, "10":4, "5":4, "2.5":2 } },
                       load:{ kind:"plate_loaded", min:45, max:9999, increment:5 } });
  eq("garage plate inventory caps the bar", p.max, 340);
  // An odd 45 can't be loaded — it has no partner.
  const podd = loadPlan({ bar_weight:45, plates:{ inventory:{ "45":3 } },
                          load:{ kind:"plate_loaded", min:45, max:9999, increment:5 } });
  eq("an unpaired plate is a paperweight (3×45 → only 2 usable)", podd.max, 45 + 90);
  eq("canReach checks the FLOOR (45lb bar is too heavy for 30)", p.canReach(30), false);
  eq("canReach rejects above the plate ceiling", p.canReach(400), false);
  eq("canReach accepts inside the plate ceiling", p.canReach(300), true);

  // ── Volume counting is DIRECT (bench must not add to triceps) ──
  const lib = [{ id:"bb_bench", muscles:[{m:"chest",role:"primary"},{m:"triceps",role:"secondary",contribution:.5}] }];
  const vol = weeklyVolume([{ sets:[{exId:"bb_bench",load:100,reps:10}] }], lib);
  eq("bench counts 1 chest set", vol.chest, 1);
  eq("bench does NOT add indirect triceps volume", vol.triceps, undefined);

  // ── Travel must not read as detraining ──
  const tr = e1rmTrend([
    { date:"2026-01-01", sets:[{exId:"x",load:100,reps:10,rir:2}] },
    { date:"2026-01-08", off_plan:true, sets:[{exId:"x",load:50,reps:10,rir:2}] },
    { date:"2026-01-15", sets:[{exId:"x",load:105,reps:10,rir:2}] }
  ], "x", 2);
  ok("hotel session excluded → trend is UP, not down", tr && tr.pct > 0);

  const fails = t.filter(x => !x.ok);
  console.table(t.map(x => ({ test: x.n, ok: x.ok ? "✅" : "❌", got: JSON.stringify(x.got) })));
  console.log(fails.length ? `❌ ${fails.length}/${t.length} FAILED` : `✅ all ${t.length} passed`);
  return { pass: fails.length === 0, total: t.length, fails };
}

return {
  CFG, LANDMARKS, MG_LABEL, MG_LOWER, CATEGORY, CAT_COLOR, REST, EMPHASIS, PF, ACTION,
  SORENESS, PUMP, WORKLOAD, JOINT,
  landmarks, band, setDelta, applyDelta, performanceScore, mrvHit, recoverySession, resumeVolume,
  rirForWeek, rirFloor, isDeload, deloadPrescription, deloadDrops,
  epley, loadFor, progress, matchReps, setBadge, minFrequency, splitFor,
  loadPlan, resolveEquipment, selectForSlot, pickBackups, scoreExercise,
  loadKey, ratio, targetLoad, learnRatio, weeklyVolume, e1rmTrend, verify
};
})();
