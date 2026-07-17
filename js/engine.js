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
  perSessionMin: 4,

  // ── SPLIT PLANNING ──
  setsPerSessionPlan: 9,   // [PUB] "for every 8-10 direct sets per muscle per week, add another
                           // training session." 9 = the midpoint and the exact inverse of
                           // minFrequency(). This is the PLANNING capacity of one session;
                           // perSessionMax (12) is the PHYSICAL ceiling. Both published, not the
                           // same number — the gap between them is what we call "crowded".
  /* ⭐ THE REAL CONSTRAINT IS TIME, NOT SETS.
   * [PUB] RP's ceiling is ~30 hard sets/session, which at their own published rest times is
   * 75-90 min — and that's BEFORE warm-ups, which they don't count at all.
   * Robert's actual constraint is "about an hour, warm-ups included". So the planner budgets
   * MINUTES and lets the set count fall out. sessionSetMax stays as a secondary [PUB] backstop,
   * but on a 60-minute budget the clock binds first and the set cap almost never fires. */
  sessionMinutesMax: 60,   // hard budget, INCLUDING warm-up ramps and setup
  sessionSetMax: 30,       // [PUB] secondary backstop; past this it's junk volume regardless of time
  groupsPerSession: [4, 6],// [PUB] muscle groups per session
  splitPlanTarget: "mav"   // ⚠️ THE AMBIGUOUS CALL, surfaced not buried. Frequency is planned
                           // against MAV/MAV*P — where an accumulation block realistically LANDS
                           // — not MRV*P. Planning against MRV*P rejects every split at every day
                           // count (emphasized side delts, MRV*P hi 40, would need ceil(40/9)=5
                           // sessions to train at all). MRV is a boundary you approach in the last
                           // week, not a number you build a calendar around. Set "mrv" to plan
                           // against the ceiling and watch everything go red.
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
/**
 * @param recentPf optional — this muscle's recent performance scores, oldest→newest. [PUB] MRV
 *   takes TWO consecutive failures: "If you've under-performed two sessions in a row, you have
 *   likely hit your MRV." Without this, one bad night's sleep declared MRV and triggered the full
 *   recovery protocol. mrvHit() existed and was unit-tested; nothing ever called it.
 */
function setDelta(fb, pf, emphasis, recentPf) {
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
    // [PUB] TWO in a row is MRV. One is a bad day — RP says to repeat the week and confirm.
    const history = (recentPf || []).concat([P]);
    if (mrvHit(history)) {
      reasons.push("Couldn't match last session twice running — that's your MRV. Recovery session.");
      return { delta: 0, action: ACTION.RECOVERY, gated: true, swapExercise, reasons };
    }
    reasons.push("Couldn't match last session. Could be sleep or stress — holding here to confirm before cutting.");
    return { delta: 0, action: ACTION.HOLD, gated: true, swapExercise, reasons };
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
  /* Top of range and the equipment can't express a sane jump → take the coarse jump, reset reps.
     ⚠️ Only if the jump actually GOES somewhere. At plan.max, nearestAtOrAbove clamps to max, so
     `next === last.load` and this returned {same load, reps cut to lo} — a 10% e1RM regression
     prescribed every week forever once you top out a stack. */
  if (plan && next > last.load && next <= plan.max) return { load: next, reps: lo, why: "load_coarse" };
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
const minFrequency = weeklySets => Math.max(1, Math.ceil(weeklySets / CFG.setsPerSessionPlan));

/* ================================================================
 * SPLITS — a catalog, not an answer.
 *
 * [PUB] RP's editorial line is literally "Your Training Split Doesn't Matter" and they publish no
 * day-by-day templates. That is NOT licence to hardcode one split per day-count — it's the
 * opposite. What matters is FREQUENCY, and frequency is forced by VOLUME. The split is just the
 * container that either can or cannot hold the frequency your emphasis settings demand.
 * So: catalog the containers, then let splitStatus() do the rejecting, out loud.
 *
 * RP's own legacy program was branded "4 Day FULL BODY" — 4 days is not upper/lower by decree.
 * ================================================================ */
const SPLITS = [
  { id:"fb2", name:"Full Body ×2", days:2, pattern:["full","full"], perMuscleFreq:2, upgrade:"fb3",
    bestFor:"2 days a week. The only split that clears RP's frequency floor at this day count." },
  { id:"ul1", name:"Upper / Lower (1 each)", days:2, pattern:["upper","lower"], perMuscleFreq:1, upgrade:"fb2",
    bestFor:"Nothing, honestly. Kept so the app can explain why instead of silently hiding it — "
          + "it's the split everyone asks for at 2 days." },
  { id:"fb3", name:"Full Body ×3", days:3, pattern:["full","full","full"], perMuscleFreq:3, upgrade:"fb4",
    bestFor:"3 days a week. 3× on everything with zero scheduling cleverness." },
  { id:"ul3", name:"Upper / Lower / Upper", days:3, pattern:["upper","lower","upper"], perMuscleFreq:2, upgrade:"fb3",
    bestFor:"An upper-body specialization block with legs explicitly on Maintain. Rejects on any "
          + "Grow or Emphasize lower-body muscle — that's the point of it." },
  { id:"ppl1", name:"Push / Pull / Legs ×1", days:3, pattern:["push","pull","legs"], perMuscleFreq:1, upgrade:"fb3",
    bestFor:"Nothing at 3 days. Catalogued to be rejected out loud — it's the most-requested "
          + "3-day split and it gives every muscle 1×/week." },
  { id:"fb4", name:"Full Body ×4", days:4, pattern:["full","full","full","full"], perMuscleFreq:4, upgrade:"ulf",
    bestFor:"4 days when you're emphasizing 2-3 groups and want them at 3-4×. RP shipped this as a "
          + "branded program — it isn't a beginner consolation prize." },
  { id:"ul2", name:"Upper / Lower ×2", days:4, pattern:["upper","lower","upper","lower"], perMuscleFreq:2, upgrade:"ulf",
    bestFor:"4 days, shorter sessions, clean heavy/light week. 2× on the big groups — plenty for "
          + "anything on Grow, tight for a chest/back Emphasize block." },
  { id:"ulf", name:"Upper / Lower + Full", days:5, pattern:["upper","lower","upper","lower","full"], perMuscleFreq:3, upgrade:"ppl_ul",
    bestFor:"5 days. The full-body day buys every group a 3rd session without a 6th gym trip. "
          + "The best answer at 5 days for almost everyone." },
  { id:"ul_arms", name:"Upper / Lower + Arms & Delts", days:5, pattern:["upper","lower","upper","lower","arms"], perMuscleFreq:2, upgrade:"ulf",
    bestFor:"5 days when the shortfall is specifically arms and delts — the groups RP publishes at "
          + "3-6×/wk. Adds frequency exactly where the landmark table says it's needed." },
  { id:"ppl_ul", name:"Push / Pull / Legs + Upper / Lower", days:5, pattern:["push","pull","legs","upper","lower"], perMuscleFreq:2, upgrade:"ppl2",
    bestFor:"5 days, advanced, high absolute volume. Splits the week finely enough that no single "
          + "session breaks the 30-set ceiling." },
  { id:"ppl2", name:"Push / Pull / Legs ×2", days:6, pattern:["push","pull","legs","push","pull","legs"], perMuscleFreq:2, upgrade:null,
    bestFor:"6 days. Only worth the 6th trip if your volume genuinely can't fit in 5 sessions under "
          + "the 30-set cap. 6 days does NOT buy frequency over Upper/Lower — it buys shorter days." }
];
const splitById = id => SPLITS.find(s => s.id === id) || null;

/* Which muscles a day KIND admits — not which it prescribes. `full` admits everything and lets
   the 30-set / 4-6-group budget in assignDays() decide. That inversion is the whole answer to
   "how does a full-body day not take three hours". */
const DAY_MUSCLES = {
  full:  Object.keys(LANDMARKS),
  upper: ["chest","back","side_delt","rear_delt","front_delt","triceps","biceps","traps","forearms"],
  lower: ["quads","hamstrings","glutes","calves","adductors","abs"],
  push:  ["chest","front_delt","side_delt","triceps"],
  pull:  ["back","rear_delt","biceps","traps","forearms"],
  legs:  ["quads","hamstrings","glutes","calves","adductors","abs"],
  arms:  ["biceps","triceps","side_delt","rear_delt","forearms","abs"]
};
const DAY_LABEL = { full:"Full Body", upper:"Upper", lower:"Lower", push:"Push", pull:"Pull",
                    legs:"Legs", arms:"Arms & Delts" };

/* SPREADABLE — muscles that may be appended to ANY day regardless of its kind.
 * [PUB] Derived from the landmark table itself, not invented: these are exactly the rows whose
 * published freq hi is 6 (biceps, side_delt, rear_delt, calves, abs, forearms — all 3-6×). RP
 * publishes them as needing 3-6 sessions/wk; a 4-day Upper/Lower anchors them at 2. The pattern
 * and the table contradict each other, and the table wins.
 * This is what keeps Upper/Lower ×2 alive for Robert: his side delts are Emphasize, need 3×, and
 * the upper days only give 2 — so side delts go on the lower days too. They aren't "upper"
 * muscles, they're whenever muscles, and that's how everyone actually trains them.
 * ⚠️ Nothing with a systemic-fatigue cost is in here. Quads publish at 2-5× and are deliberately
 * NOT spreadable — a quad on an upper day is a schedule bug, not a frequency win. */
const SPREADABLE = new Set(["side_delt","rear_delt","biceps","calves","abs","forearms"]);

/* [Robert] Muscles the big compounds reliably TRAIN as helpers, so a time-boxed plan can lean on
 * the presses/rows/squats instead of spending a scarce slot on isolation for them: triceps &
 * front delt from pressing, rear delt & traps from rowing/pulling, adductors from squatting, abs
 * from bracing, forearms from every grip. Deliberately NOT here: side_delt (needs lateral raises),
 * biceps (rows give under MEV), calves (nothing compound trains them) — those must be direct. */
const COMPOUND_COVERED = new Set(["triceps", "front_delt", "rear_delt", "traps", "abs", "forearms", "adductors"]);

/**
 * The volume this muscle carries by the LAST ACCUMULATION WEEK.
 * ⚠️ NOT band().start. band().start is MEV — where week 1 seeds. Sizing the split off MEV means
 * minFrequency() returns 1 for every muscle, every split validates at every day count, and the
 * check is decorative. The split is FIXED for the whole meso; the volume is not. Plan the
 * container for the volume that will be in it in week 4.
 * The max() on emphasize is load-bearing: RP's quads row has MAV*P [10,18] BELOW MAV [6,14] at the
 * low end, so a naive mavP[0] would plan an Emphasize block at LESS volume than a Grow block.
 */
function planVolume(muscle, emphasis) {
  const L = landmarks(muscle);
  if (CFG.splitPlanTarget === "mrv") return emphasis === "maintain" ? L.mv[1] : band(muscle, emphasis).ceil;
  if (emphasis === "maintain") return L.mv[1];
  if (emphasis === "grow")     return L.mav[1];
  return Math.max(L.mavP[0], L.mav[1]);
}

/** The frequency to AIM for. Aspiration; splitStatus() judges what you actually got. */
function targetFreq(muscle, emphasis) {
  const byVolume = minFrequency(planVolume(muscle, emphasis));
  // [PUB] the landmark table's own freq column is an independent floor. Maintain is exempt —
  // holding chest at 4 sets does not need two gym trips.
  const byLandmark = emphasis === "maintain" ? 1 : landmarks(muscle).freq[0];
  return Math.max(byVolume, byLandmark);
}
const deliverable = freq => freq * CFG.setsPerSessionPlan;   // [PUB] planning capacity  (9/session)
const physicalMax = freq => freq * CFG.perSessionMax;        // [PUB] physical ceiling  (12/session)

/** Can this split deliver this muscle? Three verdicts, two of them straight published numbers. */
function splitStatus(muscle, emphasis, freq) {
  const L = landmarks(muscle), vol = planVolume(muscle, emphasis), lo = MG_LOWER(muscle);
  if (freq < 1) {
    // A dropped MAINTAIN muscle is not a failure — it's the setting working as designed.
    // [APP] Maintain = "train these just enough to preserve muscle size while freeing recovery
    // resources for other priorities." When the week has no room left, Maintain is precisely what
    // is supposed to yield. Calling it a rejection would invalidate every honest 2-day plan
    // (15 muscle groups do not fit in 2 sessions, and shouldn't).
    if (emphasis === "maintain") return { status:"skipped", freq:0, vol,
      why:`${lo} is on Maintain and didn't fit this week. That's the trade Maintain exists to make.` };
    return { status:"reject", freq, vol, why:`${MG_LABEL[muscle]} never gets trained on this split.` };
  }
  // [PUB] below the published frequency floor is STRUCTURAL — no set count fixes a calendar.
  if (emphasis !== "maintain" && freq < L.freq[0]) return { status:"reject", freq, vol,
    why:`${freq}× a week on ${lo}. RP publishes ${lo} at ${L.freq[0]}-${L.freq[1]}× — ${freq}× is `
      + `below the floor, and no set count fixes that.` };
  // [PUB] per-session cap 8-12. Past 12 the split is arithmetically incapable, not just tight.
  if (vol > physicalMax(freq)) return { status:"reject", freq, vol,
    why:`${lo} is set to ${emphasis} — about ${vol} sets a week by the end of the block. `
      + `${freq} session${freq>1?"s":""} means ${Math.ceil(vol/freq)} sets in one go; past 12 in a `
      + `session it's junk volume. You'd need ${minFrequency(vol)} sessions.` };
  if (vol > deliverable(freq)) return { status:"crowded", freq, vol, ceil: physicalMax(freq),
    why:`${lo} wants ~${vol} sets a week and gets ${freq} session${freq>1?"s":""} — `
      + `${Math.ceil(vol/freq)} each. Doable, but it's the top of the useful range and you'll cap `
      + `out before the block ends. One more session on ${lo} and it's comfortable.` };
  return { status:"ok", freq, vol, ceil: deliverable(freq),
    why:`${lo}: ${freq}× a week, ~${Math.round(vol/freq)} sets a session. Room to ramp.` };
}

/* [Robert] COMPOUND CREDIT — "a bench is at least half a set of triceps by effort; compounds count
 * for the helping groups." The big compounds a full-body day is built on (bench, row, squat, OHP)
 * already train the helper muscles, so you don't need a separate setup for each — that setup
 * overhead is exactly what makes 15 groups impossible in an hour. synergyTable reads the library's
 * OWN secondary contributions (row → biceps .4, rear_delt .4; bench/dip → triceps .5; squat →
 * glutes/hams/adductors) and maps: if primary group P is trained, helper H gets `contribution`
 * sets of credit per working set of P. Used to report a compound-covered helper as TRAINED rather
 * than "missing a body part", and to keep the planner from bolting on isolation it has no time for. */
function synergyTable(library) {
  const t = {};
  for (const ex of library || []) {
    const prim = (ex.muscles || []).filter(m => m.role === "primary");
    const sec  = (ex.muscles || []).filter(m => m.role === "secondary");
    for (const p of prim) {
      const row = t[p.m] || (t[p.m] = {});
      for (const h of sec) {
        const c = h.contribution != null ? h.contribution : 0.5;
        if (row[h.m] == null || c > row[h.m]) row[h.m] = c;   // best-case compound for this group
      }
    }
  }
  return t;
}

/**
 * Assign muscles to days. PURE PLANNING — no gym, no exercises, no loads.
 * Greedy, priority-ordered, least-loaded-bin. The bin capacity is [PUB] 30 sets / 4-6 groups, and
 * that capacity is the ONLY thing standing between a full-body day and a three-hour day.
 * Placing Emphasize→Grow→Maintain against a hard bin means an over-broad emphasis spread doesn't
 * produce a bad plan — it produces a REPORTED shortfall. Tell the user; don't quietly under-train.
 */
function assignDays(user, split) {
  // Per-user session length. The "make it 75 minutes" escape hatch in the focus picker is
  // only honest if the engine actually reads it.
  const maxMin = (user && user.sessionMinutes) || CFG.sessionMinutesMax;
  const days = split.pattern.map((kind, i) => ({ kind, i, muscles: [], rows: [], projSets: 0, projMin: 0 }));
  const emph = m => (user.emphasis || {})[m] || "grow";

  /* TWO PASSES — most-constrained-first. This ordering is the whole correctness of the function.
   *
   * Pass 1 places ANCHORS (non-spreadable): they can only live on days whose kind admits them, so
   * they have the least placement freedom and must claim their days before anything else does.
   * Pass 2 places SPREADABLE muscles into whatever capacity is left.
   *
   * ⚠️ Sorting purely by (tier, targetFreq) — the obvious version — is broken, and silently:
   * spreadable muscles have HIGH published frequency (biceps/side_delt/rear_delt/calves are all
   * 3-6×), so they sort to the front, fan out across every day, and fill the 30-set bins. Then
   * quads — which can ONLY go on a lower day — arrives to find both lower days full and gets
   * rejected outright. A 4-day Upper/Lower that trains no quads, because the lateral raises got
   * there first. Freedom to go anywhere is a reason to go LAST.
   */
  /* [Robert] Within an emphasis tier, muscles the compounds already cover (triceps from presses,
     rear delt/traps from rows, adductors from squats) yield their direct slot to muscles that get
     NOTHING from compounds and MUST be trained directly — calves, side delts, biceps. So a
     time-boxed full-body spends its scarce slots on what compounds can't reach, and leans on the
     big lifts for the rest. Never demote a FOCUS area — if you emphasize triceps, it's placed. */
  const compoundCovered = m => COMPOUND_COVERED.has(m) && emph(m) !== "emphasize";
  const byNeed = (a, b) => EMPHASIS.indexOf(emph(b)) - EMPHASIS.indexOf(emph(a))
                        || (compoundCovered(a) - compoundCovered(b))
                        || targetFreq(b, emph(b)) - targetFreq(a, emph(a));
  const all = Object.keys(LANDMARKS);
  const order = all.filter(m => !SPREADABLE.has(m)).sort(byNeed)
        .concat(all.filter(m => SPREADABLE.has(m)).sort(byNeed));

  const report = [];
  for (const m of order) {
    const e = emph(m), vol = planVolume(m, e);
    const want = Math.min(targetFreq(m, e), split.pattern.length);
    // NB: NOT clamped to perSessionMin — that's an autoregulation floor (applyDelta), not a
    // planning floor. Clamping here would prescribe 4 sets of front delts to someone who set them
    // to Maintain (MV = 2), and Maintain would stop meaning maintain.
    const per = Math.min(CFG.perSessionMax, Math.max(1, Math.round(vol / want)));
    const elig = days
      .filter(d => (DAY_MUSCLES[d.kind] || []).includes(m) || SPREADABLE.has(m))
      .sort((a, b) => a.projMin - b.projMin || a.i - b.i);   // least-loaded BY THE CLOCK
    const got = [];
    for (const d of elig) {
      if (got.length >= want) break;
      if (d.muscles.length >= CFG.groupsPerSession[1]) continue;   // [PUB] ≤6 groups/session
      d.muscles.push(m); d.rows.push({ m, per, emphasis: e }); d.projSets += per;
      d.projMin = planMinutes(d.rows);
      got.push(d);
    }
    if (!got.length) { report.push(Object.assign({ m, emphasis:e, dropped:true }, splitStatus(m, e, 0))); continue; }
    report.push(Object.assign({ m, emphasis:e, perSession:per }, splitStatus(m, e, got.length)));
  }

  /* ⭐ FIT TO THE CLOCK — shrink, don't drop.
   * Placing against a hard time bin (the obvious approach) silently DROPS whatever doesn't fit,
   * and what doesn't fit is always the Maintain muscles — so "hit everything, with focus areas"
   * quietly becomes "train three muscles". Wrong trade: the ask is even coverage.
   * So place everything first, then shave sets to fit the hour, cheapest priority first
   * (Maintain → Grow → Emphasize), never below a floor of 2 working sets. A muscle only gets
   * dropped if it can't fit at 2 sets, which on a 60-minute budget essentially never happens.
   * Everything shaved is reported, so week 4's "why won't it add sets" has an answer. */
  /* Each muscle's per-session FLOOR — the point below which trimming stops meaning anything.
   * [PUB] Below MEV is not a small growth dose, it's not a growth dose. So a Grow or Emphasize
   * muscle never gets trimmed under MEV; if the clock can't afford it, the honest move is to say
   * so (see recommendSplit().budget) rather than quietly starve it. Maintain floors at MV, which
   * is what Maintain means: hold the tissue, free the recovery (and the minutes) for the focus. */
  const floorFor = (m, e, freq) => Math.max(1, Math.ceil(band(m, e).floor / Math.max(1, freq)));
  const trims = [], dropped = [];
  for (const d of days) {
    const freqOf = m => (report.find(r => r.m === m) || {}).freq || 1;
    let guard = 0;
    while (d.rows.length && planMinutes(d.rows) > maxMin && guard++ < 400) {
      const cand = d.rows.filter(r => r.per > floorFor(r.m, r.emphasis, freqOf(r.m)));
      if (cand.length) {
        // Lowest priority gives first, biggest first within a tier.
        cand.sort((a, b) => EMPHASIS.indexOf(a.emphasis) - EMPHASIS.indexOf(b.emphasis) || b.per - a.per);
        cand[0].per--; d.projSets--;
        const t = trims.find(x => x.m === cand[0].m); t ? t.n++ : trims.push({ m: cand[0].m, n: 1 });
        continue;
      }
      // Everything is at its floor and the day still doesn't fit. Now something has to GO, and
      // it's a Maintain muscle — never a focus area. That's the whole point of Maintain.
      const give = d.rows.filter(r => r.emphasis === "maintain")
                         .sort((a, b) => a.per - b.per)[0];
      if (!give) break;                              // only focus areas left; let it run a little long
      d.rows.splice(d.rows.indexOf(give), 1);
      d.muscles.splice(d.muscles.indexOf(give.m), 1);
      d.projSets -= give.per;
      dropped.push(give.m);
    }
    d.projMin = Math.round(planMinutes(d.rows));
    d.rows.forEach(r => { const rep = report.find(x => x.m === r.m); if (rep) rep.perSession = r.per; });
  }
  for (const t of trims) {
    const rep = report.find(x => x.m === t.m);
    if (rep && rep.status === "ok") {
      rep.status = "crowded";
      rep.why = `${MG_LOWER(t.m)} is trimmed by ${t.n} set${t.n>1?"s":""} a session to keep you near `
              + `${CFG.sessionMinutesMax} minutes. It still grows — there's just a clock.`;
    }
  }
  /* GROW TO FILL. The trim loop above only ever shrinks, and the per-muscle `cap` is global while
     the clock is per-DAY — so a light day (e.g. 3 of 5 muscles on Maintain at 1 set) could never
     spend its spare 16 minutes and peaked at 50 of its 60. You booked an hour; use it.
     Spend the slack on the highest-priority muscle that still has room under its OWN band ceiling
     — never past it, so this can't quietly turn Maintain into Grow. */
  for (const d of days) {
    let guard = 0;
    while (guard++ < 200) {
      const room = d.rows.filter(r => {
        const b = band(r.m, r.emphasis);
        return r.per < Math.min(CFG.perSessionMax, Math.ceil(b.ceil / Math.max(1, (report.find(x => x.m === r.m) || {}).freq || 1)));
      });
      if (!room.length) break;
      // Highest priority first, then whoever has the least right now.
      room.sort((a, b2) => EMPHASIS.indexOf(b2.emphasis) - EMPHASIS.indexOf(a.emphasis) || a.per - b2.per);
      const pick = room[0];
      pick.per++;
      if (planMinutes(d.rows) > maxMin) { pick.per--; break; }   // put it back; we're full
      d.projSets++;
    }
    d.projMin = Math.round(planMinutes(d.rows));
    d.rows.forEach(r => { const rep = report.find(x => x.m === r.m); if (rep) rep.perSession = Math.max(rep.perSession || 0, r.per); });
  }

  for (const m of new Set(dropped)) {
    const rep = report.find(x => x.m === m);
    if (!rep) continue;
    const stillIn = days.some(d => d.muscles.includes(m));
    if (stillIn) continue;
    rep.status = "reject"; rep.dropped = true; rep.freq = 0;
    rep.why = `${MG_LABEL[m]} didn't fit in ${maxMin}-minute sessions and it's on `
            + `Maintain, so it gave way to your focus areas. Add a day or drop a focus to get it back.`;
  }
  /* Credit each muscle the indirect volume it gets from the compounds placed for OTHER groups, and
     promote a helper that clears a real dose (≥ its MEV, min 2 sets) from "dropped/uncovered" to
     "trained by your compounds". This is what makes a 2-day full body cover the WHOLE body: chest &
     shoulder presses carry triceps and front delt, rows & pulldowns carry biceps & rear delt,
     squats & hinges carry glutes/hams/adductors — no extra setup, no three-hour session. */
  const syn = synergyTable((typeof window !== "undefined" && window.MESO_EXERCISES) || []);
  const indirect = {};
  for (const d of days) for (const r of d.rows) {
    const from = syn[r.m]; if (!from) continue;
    for (const h in from) indirect[h] = (indirect[h] || 0) + r.per * from[h];
  }
  for (const rep of report) {
    const ind = Math.round((indirect[rep.m] || 0) * 10) / 10;
    rep.indirect = ind;
    const need = Math.max(2, landmarks(rep.m).mev[0]);
    if ((rep.dropped || !rep.freq) && ind >= need) {
      delete rep.dropped;
      rep.coveredByCompound = true;
      rep.freq = Math.max(1, rep.freq || 0);
      rep.status = "compound";
      rep.why = `${MG_LABEL[rep.m]} gets ~${ind} sets a week from your compound lifts — trained by the big movements, no separate exercise needed.`;
    }
  }
  const stillDropped = [...new Set(dropped)].filter(m => !report.find(r => r.m === m && r.coveredByCompound));
  return { days, muscles: report, trims, droppedForTime: stillDropped, indirect };
}

/**
 * [PUB] "Whatever muscle group matters most gets trained first in each session, without exception."
 * Order by EMPHASIS TIER — not by muscle size, not compound-before-isolation. ⚠️ Neither of those
 * is an RP rule and we do not encode them.
 * [PUB] Microcycle pulsatility — rotate WHICH muscle leads across sessions so each gets a day to
 * be the priority.
 * These look like they contradict and don't: they're the same rule at two granularities. Priority
 * ranks the TIERS; pulsatility breaks ties INSIDE a tier. Rotating within-tier means a Grow muscle
 * can never jump an Emphasize muscle, so "without exception" is never violated.
 * Consequence for the UI: Upper A and Upper B are NOT the same workout and mustn't share a name.
 */
function orderDay(user, muscles, dayIndex) {
  const rot = (a, n) => a.length ? a.slice(n % a.length).concat(a.slice(0, n % a.length)) : a;
  const tier = t => muscles.filter(m => ((user.emphasis || {})[m] || "grow") === t);
  return [...rot(tier("emphasize"), dayIndex), ...rot(tier("grow"), dayIndex), ...rot(tier("maintain"), dayIndex)];
}

/* [PUB] Heavy rep ranges earlier in the WEEK than light.
 * ⚠️ This is WEEKLY, not within-session. Encoding it as "first exercise heavy, second light" (the
 * obvious misread, and what the first seedMeso did) makes every session identically shaped and
 * gives the WEEK no gradient at all — it implements a rule that doesn't exist.
 * The real axis is `occ`: which session of the week this is FOR THIS MUSCLE. `k` still shifts one
 * rung because the 2nd exercise complements the 1st by RESISTANCE PROFILE (stretch → shortened),
 * and shortened-position work lives a bracket higher. That's a profile rule, which we have. */
const REP_LADDER = [[5,8],[8,12],[12,20],[20,30]];
function repRangeFor(occ, freq, k) {
  const rung = freq <= 1 ? 1 : Math.round(occ * 2 / (freq - 1));
  return REP_LADDER[Math.min(REP_LADDER.length - 1, rung + (k || 0))];
}

/**
 * [PUB] REST is RP's own published per-muscle rest table. ~45s under the bar per set and ~90s of
 * setup + warm-up per exercise are [RECON].
 * The point: RP's 30-hard-set session ceiling and "your workout shouldn't take three hours" ARE
 * THE SAME CONSTRAINT. 30 sets at their own rest times is ~75-90 min. They never say it out loud;
 * it falls straight out of two tables they both published.
 */
/* ================================================================
 * THE CLOCK
 *
 * [PUB] REST is RP's own published per-muscle rest table (the numbers the timer already runs on).
 * ~45s under the bar per working set and ~90s of setup per exercise are [RECON].
 *
 * ⚠️ WARM-UPS ARE NOT FREE AND RP NEVER COUNTS THEM. Their guidance is a real ramp — [PUB]
 * "12 reps @ 30RM → 8 @ 20RM → 4 @ 10RM, then pick your working weight" — which is three
 * additional sets with rest before your first hard set of a muscle. Omitting that is how an
 * app promises "about an hour" and delivers ninety minutes.
 *
 * The ramp scales with technique demand: a heavy squat needs the full build-up; a cable fly
 * needs one feeler. And it's per MUSCLE, not per exercise — your second chest movement doesn't
 * re-warm a warm chest.
 * ================================================================ */
const SETUP_SEC = 90;          // walk over, adjust the bench, load the bar, clip the handle
const WORK_SEC = 45;           // time under the bar for one working set

/** Warm-up ramp for the FIRST exercise of a muscle. Later exercises for it are already warm. */
function warmupSeconds(ex, isFirstForMuscle) {
  if (!isFirstForMuscle) return 40;                       // one feeler, you're already warm
  const td = (ex && ex.ratings && ex.ratings.technique_demand) || 3;
  return 60 + 40 * td;                                    // squat (5) → 260s · cable fly (2) → 140s
}

/**
 * PRESCRIBE the warm-up sets — not just budget time for them.
 *
 * [PUB] RP publishes a ramp — "12 reps @ your 30RM → 8 @ 20RM → 4 @ 10RM, then pick your working
 * weight" — but read it carefully: that's the FEEL-OUT protocol for choosing a starting weight
 * when you don't have one. It's an e1RM discovery tool. Run it against a KNOWN working weight and
 * the arithmetic bites: at 200×10 @2 RIR (e1RM 280), your "10RM" is 210 — the last warm-up would
 * be HEAVIER than your work set. That's why it's a week-1 tool, not a weekly one.
 *
 * [RECON] So for a known working weight this is the conventional percentage ramp, which is
 * RP-consistent (their point is you arrive ready without spending stimulus) but is NOT their
 * published table. Flagged accordingly.
 *
 * Two things make it not-annoying:
 *  · Only the FIRST exercise of a muscle gets a real ramp — your second chest movement doesn't
 *    re-warm a warm chest. Matches warmupSeconds, which is what the 60-min clock is costed on.
 *  · A cable fly does not need three ramp sets. Scale by technique + systemic demand: a heavy
 *    squat ramps three times, a lateral raise gets one feeler.
 *
 * Warm-ups are NEVER logged and NEVER count toward volume — [PUB] RP's countable working set is
 * 5-30 reps at 0-4 RIR, and these are nowhere near failure by design.
 *
 * @returns [{load, reps, warmup:true, note}] — ascending, always strictly below the work weight.
 */
function warmupSets(workLoad, plan, ex, isFirstForMuscle) {
  if (!isFirstForMuscle || !workLoad || workLoad <= 0) return [];
  const td = (ex && ex.ratings && ex.ratings.technique_demand) || 3;
  const sys = (ex && ex.fatigue && ex.fatigue.systemic) || 3;
  const heavy = td >= 4 || sys >= 4;
  // Bodyweight-ish or trivially light work doesn't get a ramp — you'd spend more time reading it.
  if (plan && plan.min && workLoad <= plan.min * 1.2) return [];
  const ramp = heavy ? [[0.50, 8], [0.70, 5], [0.85, 3]]     // squat, deadlift, bench
                     : [[0.55, 8], [0.80, 4]];               // machine press, curl, fly
  const out = [];
  for (const [pct, reps] of ramp) {
    let load = workLoad * pct;
    load = plan ? plan.nearestAtOrBelow(load) : Math.round(load / 5) * 5;
    if (!load || load >= workLoad) continue;                 // never warm up at the work weight
    if (out.length && load <= out[out.length - 1].load) continue;   // ramp must ascend
    out.push({ load, reps, warmup: true, pct: Math.round(pct * 100) });
  }
  return out;
}

/** Minutes for a fully-built day (exercises known). */
function sessionMinutes(day) {
  let sec = 0;
  const seen = new Set();
  for (const g of day.muscles || []) {
    const r = REST[g.m] || [60, 120];
    for (const sl of (g.slots || [])) {
      const ex = (window.MESO_EXERCISES || []).find(e => e.id === sl.exId);
      const first = !seen.has(g.m); seen.add(g.m);
      sec += SETUP_SEC + warmupSeconds(ex, first);
      sec += sl.sets * ((r[0] + r[1]) / 2 + WORK_SEC);
    }
  }
  return Math.round(sec / 60);
}

/**
 * Minutes for a PLANNED day — muscles and set counts only, no exercises chosen yet.
 * assignDays runs before selection (it's pure planning, no gym), so it can't know technique
 * demand. Assume one exercise per muscle at an average ramp; selection can only make it shorter,
 * because a 2nd exercise for a muscle costs a setup but no fresh ramp.
 * @param rows [{m, per}] — muscle id + working sets this session
 */
function planMinutes(rows) {
  let sec = 0;
  for (const row of rows || []) {
    const r = REST[row.m] || [60, 120];
    sec += SETUP_SEC + 180;                               // setup + an average first-exercise ramp
    sec += row.per * ((r[0] + r[1]) / 2 + WORK_SEC);
  }
  return sec / 60;
}

/** Reward frequency HEADROOM on the muscles the user cares about — headroom is what a split IS.
 *  A split with none is one you'll outgrow in week 3. */
function scoreSplit(user, split, ev) {
  const W = { emphasize:3, grow:1, maintain:.25 };
  let s = 0;
  for (const r of ev.muscles) {
    const w = W[r.emphasis] || 1;
    // A reject is a heavy penalty, NOT -Infinity. Returning -Infinity makes every invalid split
    // score identically, so when NOTHING is valid there's no way to rank the least-bad one and
    // recommendSplit() hands back null → seedMeso() throws → the user cannot create a mesocycle
    // at all. "No" is a correct answer and an unusable one. Rank the damage instead.
    if (r.status === "reject") { s -= w * 4; continue; }
    if (r.status === "skipped") { s -= w * .5; continue; }   // maintain yielding: cheap, by design
    if (r.status === "crowded") { s -= w * .5; continue; }
    s += w * (1 + clamp((deliverable(r.freq) - r.vol) / Math.max(r.vol, 1), 0, .5));
  }
  s -= .05 * new Set(split.pattern).size;   // [RECON] fewer day kinds = less to remember. Small, real.
  // [RECON] Training age is deliberately a thumb, not a scale: it already drives the split THROUGH
  // VOLUME (advanced → higher landmarks → minFrequency forces sessions). A second pathway would
  // double-count it. RP's one direct rule (novices shouldn't specialize) belongs on the emphasis
  // picker, not here. Don't grow this term.
  const age = user.trainingAge || "intermediate";
  if (age === "novice" && split.pattern.every(d => d === "full")) s += .3;
  if (age === "advanced" && split.days >= 5) s += .15;
  return s;
}

/** Every split at this day count, VALID FIRST, each with a line a human can read.
 *  Rejects STAY in the list with their reason — hiding them just sends the user to a forum to ask
 *  why they can't do PPL on 3 days. */
function splitsFor(days, user) {
  const u = user || { emphasis:{} };
  const out = SPLITS.filter(s => s.days === days).map(s => {
    const ev = assignDays(u, s);
    const rejects = ev.muscles.filter(r => r.status === "reject");
    const crowded = ev.muscles.filter(r => r.status === "crowded");
    return { split:s, plan:ev, valid: !rejects.length, rejects, crowded, score: scoreSplit(u, s, ev),
      why: rejects.length ? rejects[0].why
         : crowded.length ? `${s.bestFor.split(".")[0]}. Tight on ${crowded.map(r => MG_LOWER(r.m)).join(" and ")}.`
         : s.bestFor };
  });
  out.sort((a, b) => (b.valid - a.valid) || (b.score - a.score));
  return out;
}

/** The pick, the runners-up, the rejects with reasons — plus the one thing that is NOT a property
 *  of any split: whether the emphasis spread fits the week at all. */
/**
 * @param user.splitPref  a split id ("ul2", "fb4", …) or "auto"/undefined.
 *   A preference is not a mistake to be corrected. Robert wants Upper/Lower ×2 — all upper, all
 *   lower, two of each — while scoreSplit prefers fb4 because it hands his emphasized back 3
 *   sessions instead of 2. Both are VALID; one is his. Honour it whenever it isn't rejected, and
 *   let the ledger show what it costs. We only overrule a preference that can't carry his muscles.
 */
function recommendSplit(user, days) {
  const opts = splitsFor(days, user);
  const valid = opts.filter(o => o.valid);
  const want = user && user.splitPref && user.splitPref !== "auto" ? user.splitPref : null;
  const pref = want ? valid.find(o => o.split.id === want) : null;
  if (pref) {
    valid.splice(valid.indexOf(pref), 1); valid.unshift(pref);
    opts.splice(opts.indexOf(pref), 1); opts.unshift(pref);
  }
  // The weekly budget is a property of DAYS, not of the split — so it can't be a filter and must
  // not be reported per-option. [PUB] ~30 hard sets/session × N sessions is all there is.
  // Demand counts ONLY the groups above Maintain. Summing all 15 would fire this note on every
  // honest 2-day plan and then advise "move some to Maintain" about muscles already on Maintain.
  // The actionable number is what you asked to GROW.
  const above = Object.keys(LANDMARKS).filter(m => ((user.emphasis || {})[m] || "grow") !== "maintain");
  const demand = above.reduce((t, m) => t + planVolume(m, (user.emphasis || {})[m] || "grow"), 0);
  /* ⭐ The budget is the CLOCK, not a set count. An hour buys ~18 working sets once you've paid
     for setup, warm-up ramps and RP's own published rest times. Quoting the [PUB] 30-set ceiling
     here would promise volume the hour cannot actually deliver. */
  const maxMin = (user && user.sessionMinutes) || CFG.sessionMinutesMax;
  const setsPerSession = Math.max(6, Math.round(
    (maxMin * 60 - 5 * (SETUP_SEC + 180)) / 135));   // ≈18 at 60 min, 5 groups
  const budget = days * setsPerSession;
  const note = demand <= budget ? null
    : `By your last hard week your focus areas ask for about ${demand} sets a week. ${days} `
    + `session${days>1?"s":""} of ${maxMin} minutes hold about ${budget} — an hour `
    + `buys roughly ${setsPerSession} working sets once you've paid for warm-ups and rest. You have `
    + `${above.length} groups above Maintain. At ${days} hour${days>1?"s":""} a week you can `
    + `properly grow three or four and maintain the rest; spreading wider just makes everything `
    + `maintenance. Move some down, or add a day. Maintain isn't giving up — it's what buys the `
    + `minutes for the groups you actually picked.`;
  // Always return SOMETHING buildable. When nothing is valid — which happens honestly, e.g. 11
  // groups above Maintain on 2 days a week — fall back to the least-bad split and say so loudly.
  // A dead end here means a real person cannot start training, and "your emphasis spread doesn't
  // fit" is a fixable problem the app should state, not a wall it should put up.
  const best = valid[0] || opts[0] || null;
  const forced = !valid.length && !!best;
  return {
    best: best && best.split, options: opts, valid, forced,
    rejected: opts.filter(o => !o.valid),
    prefHonoured: !!pref, prefWanted: want,
    // A preference we couldn't honour is a thing to SAY, not to silently ignore.
    prefRejected: (want && !pref) ? (opts.find(o => o.split.id === want) || null) : null,
    // On a forced pick the rejects ARE the caps — those muscles will be under-trained, and the
    // workout screen has to say which.
    caps: best ? (forced ? best.rejects.concat(best.crowded) : best.crowded) : [],
    budget: { demand, budget, over: demand > budget, note },
    // [PUB] 2-4×/muscle/wk is optimal and near-equivalent at matched volume. So when two splits
    // both clear the floor we are NOT claiming one grows more muscle — only that one has more
    // room left. Say that; don't oversell it.
    why: !best ? `No split defined for ${days} days.`
       : forced ? `${best.split.name} — the best fit at ${days} days, but ${best.rejects.length} `
                + `muscle${best.rejects.length>1?"s":""} can't get enough frequency. ${best.rejects[0].why}`
       : `${best.split.name} — ${best.why}`
  };
}

/* ================================================================
 * FOCUS AREAS — the intake, and the only question worth asking.
 *
 * ⚠️ `grow` is never emitted, and that's a measured fact, not a style call:
 *   planVolume(m,"grow") === planVolume(m,"emphasize")  for 12 of 15 muscles
 *   targetFreq(m,"grow") === targetFreq(m,"emphasize")  for all 15
 * So at PLANNING time — the only time the split is decided — Grow and Emphasize claim the same
 * sets and the same day-slots. They differ only in band().ceil, and under a 60-minute clock the
 * trim caps below BOTH ceilings anyway. Tagging a muscle Grow vs Emphasize produces an identical
 * prescription. The tier that costs anything is Maintain vs not-Maintain.
 * The tier stays in the engine (it's RP's published model and band() uses it correctly), but no
 * human is ever asked for it. verify() asserts this so the day someone recalibrates the tables,
 * the premise fails loudly instead of the picker quietly lying.
 *
 * ⚠️ "Even coverage" does NOT mean everything on Grow. That's the intuitive default and it's the
 * worst option on the board: it trains FEWER muscles than doing nothing special, because every
 * muscle claims 2-3 day-slots and the greedy binner spends them all on the first few.
 *   all Maintain → 15/15 covered at 4 days · all Grow → 11/15 · at 2 days: 12/15 vs 6/15
 * Maintain is what buys COVERAGE. Focus is what buys GROWTH.
 * ================================================================ */
/* ================================================================
 * DISPLAY GROUPS — how Robert thinks, not how physiology splits.
 * "shoulders as one, upper and lower back as one — I don't distinguish the bigger muscles."
 * The engine's landmarks/scoring stay per-muscle (correct); only the picker + pills collapse.
 * ================================================================ */
const MG_GROUP = {                       // muscle → group key (unlisted = its own group)
  front_delt: "shoulders", side_delt: "shoulders", rear_delt: "shoulders",
  back: "back", traps: "back"
};
const groupOf = m => MG_GROUP[m] || m;
const GROUP_LABEL = { shoulders: "Shoulders", back: "Back" };
const groupLabel = g => GROUP_LABEL[g] || MG_LABEL[g] || g;
/* Every distinct group, in a sensible order, each with its member muscles + display category. */
const GROUPS = (() => {
  const seen = [], byKey = {};
  for (const m of Object.keys(LANDMARKS)) {
    const g = groupOf(m);
    if (!byKey[g]) { byKey[g] = { key: g, label: groupLabel(g), muscles: [], cat: CATEGORY[m] }; seen.push(byKey[g]); }
    byKey[g].muscles.push(m);
  }
  return seen;
})();
const groupMuscles = g => (GROUPS.find(x => x.key === g) || { muscles: [g] }).muscles;

/**
 * @param focus  a list of GROUP keys ("shoulders", "chest", …). A group emphasizes ALL its
 *   member muscles. Back-compat: a bare muscle id still works (groupOf is identity for it).
 */
function buildEmphasis(focus) {
  const em = {};
  const f = new Set(focus || []);
  for (const m of Object.keys(LANDMARKS)) em[m] = (f.has(groupOf(m)) || f.has(m)) ? "emphasize" : "maintain";
  return em;      // always all 15 keys — never rely on a `|| "grow"` fallback downstream
}

/**
 * The honest live meter for the focus picker. ~0.1ms, so it can run on every tap.
 *
 * ⚠️ recommendSplit().budget is NOT the gate and must not be used as one. It reports Nina's
 * glutes+hamstrings at 2 days as demand 32 / budget 34 → "fits!" — while assignDays actually
 * freezes BOTH at MEV with zero ramp room for the entire mesocycle. `demand` counts only
 * non-Maintain groups; `budget` counts all the time in the week. Apples to oranges.
 *
 * `room` is the number that tells the truth: what the block can actually ADD before the clock
 * caps it. room <= 0 means that muscle does the same sets in week 5 as in week 1 — a focus area
 * that cannot grow. [RECON] — assembled from published quantities, not an RP metric.
 */
function previewFocus(focus, days, opts) {
  const user = Object.assign({ emphasis: buildEmphasis(focus) }, opts || {});
  const rec = recommendSplit(user, days);
  if (!rec.best) return { emphasis: user.emphasis, split: null, rows: [], frozen: [], covered: 0, missing: [], budget: rec.budget };
  const plan = assignDays(user, rec.best);
  const rows = plan.muscles.map(r => {
    const start = band(r.m, user.emphasis[r.m]).start;
    const cap = (r.freq || 0) * (r.perSession || 0);
    return Object.assign({}, r, { cap, start, room: cap - start });
  });
  const f = focus || [];
  // A focus GROUP is frozen when its members have no room to grow, summed. Report the group KEY.
  const groupRoom = g => groupMuscles(g).reduce((a, m) => { const r = rows.find(x => x.m === m); return a + (r ? r.room : 0); }, 0);
  return {
    emphasis: user.emphasis, split: rec.best, forced: rec.forced, plan, rows,
    frozen: f.filter(g => groupRoom(g) <= 0),
    covered: rows.filter(r => r.freq > 0).length,
    missing: rows.filter(r => !r.freq).map(r => r.m),
    minutes: plan.days.map(d => d.projMin),
    budget: rec.budget
  };
}

/* ================================================================
 * MACHINE CATALOG — the one-time "what's actually here?" checklist.
 *
 * Remote research genuinely dead-ends on equipment: for Crunch — Dyer, no source anywhere (photo,
 * review, video, or official) names a single strength machine, brand, or dumbbell range. So the
 * app asks. This is the questionnaire that fills the gaps a photo can't.
 *
 * Every entry carries:
 *   aliases  — gyms and people call these different things ("pec deck" / "chest fly" / "butterfly")
 *   look     — how to RECOGNIZE it standing in the gym, because that's the actual problem
 *   unlocks  — which library exercises appear if you tick it. Makes the cost of a wrong tick real.
 *   load     — a conservative default. ⚠️ min matters more than max for a smaller lifter, and
 *              increment decides whether progression exists at all. Defaults lean COARSE and
 *              CONSERVATIVE: understating a stack's minimum is safe, understating its granularity
 *              just means we under-promise. Overstating either invents progression that isn't there.
 * ================================================================ */
const MACHINE_CATALOG = [
  { key:"lat_pulldown", name:"Lat Pulldown", cat:"pull",
    aliases:["pulldown", "front pulldown"],
    look:"You sit facing a high pulley with a thigh pad over your legs and pull a long bar down.",
    load:{ kind:"selectorized_stack", min:15, max:250, increment:10 } },
  { key:"seated_row", name:"Seated Cable Row", cat:"pull",
    aliases:["low row", "seated row"],
    look:"Sit facing a low pulley, feet on a platform, pull a handle to your stomach.",
    load:{ kind:"selectorized_stack", min:15, max:250, increment:10 } },
  { key:"machine_row", name:"Chest-Supported Row Machine", cat:"pull",
    aliases:["iso row", "hammer row", "t-bar row machine"],
    look:"You lie face-down or lean into a chest pad and row handles back. Chest is SUPPORTED.",
    load:{ kind:"plate_loaded", min:0, max:400, increment:10 } },
  { key:"pullover_machine", name:"Pullover Machine", cat:"pull",
    aliases:["nautilus pullover"],
    look:"Rare. You sit and drive elbows/a bar down in an arc from overhead. If unsure, it's not there.",
    load:{ kind:"selectorized_stack", min:15, max:200, increment:10 } },
  { key:"assisted_pullup", name:"Assisted Pull-up / Dip", cat:"pull",
    aliases:["gravitron", "assist machine"],
    look:"A pull-up station with a kneeling or standing platform that pushes you UP. More weight = easier.",
    load:{ kind:"selectorized_stack", min:10, max:250, increment:10 } },
  { key:"chest_press", name:"Chest Press Machine", cat:"push",
    aliases:["seated chest press", "iso press"],
    look:"Sit upright, press two handles straight forward away from your chest.",
    load:{ kind:"selectorized_stack", min:15, max:250, increment:10 } },
  { key:"incline_press_machine", name:"Incline Press Machine", cat:"push",
    aliases:["incline chest press"],
    look:"Like the chest press but you press UP and away at an angle.",
    load:{ kind:"selectorized_stack", min:15, max:250, increment:10 } },
  { key:"pec_deck", name:"Pec Deck", cat:"push",
    aliases:["chest fly machine", "butterfly", "peck deck"],
    look:"Sit with arms out to the sides on pads or handles, and bring them TOGETHER in front. An arc, not a press.",
    load:{ kind:"selectorized_stack", min:15, max:250, increment:15 } },
  { key:"rear_delt_machine", name:"Reverse Pec Deck", cat:"pull",
    aliases:["rear delt fly machine", "reverse fly"],
    look:"Often the SAME frame as the pec deck, run backwards — chest on the pad, arms sweep APART.",
    load:{ kind:"selectorized_stack", min:15, max:200, increment:15 } },
  { key:"shoulder_press_machine", name:"Shoulder Press Machine", cat:"push",
    aliases:["overhead press machine", "military press machine"],
    look:"Sit upright, press handles straight overhead.",
    load:{ kind:"selectorized_stack", min:15, max:200, increment:10 } },
  { key:"lateral_raise_machine", name:"Lateral Raise Machine", cat:"push",
    aliases:["side raise machine", "delt machine"],
    look:"Sit with pads against your OUTER upper arms and lift your elbows out sideways.",
    load:{ kind:"selectorized_stack", min:10, max:150, increment:10 } },
  { key:"leg_press", name:"Leg Press", cat:"legs",
    aliases:["45 degree leg press", "sled"],
    look:"Sit or recline and push a platform away with your feet.",
    load:{ kind:"plate_loaded", carriage_weight:75, min:75, max:700, increment:10 } },
  { key:"hack_squat", name:"Hack Squat", cat:"legs",
    aliases:["hack machine", "pendulum squat"],
    look:"You STAND on an angled sled with shoulder pads and squat. Not the same as a leg press — you're upright.",
    load:{ kind:"plate_loaded", carriage_weight:65, min:65, max:700, increment:10 } },
  { key:"leg_extension", name:"Leg Extension", cat:"legs",
    aliases:["quad extension", "knee extension"],
    look:"Sit, pad across the front of your ankles, straighten your knees.",
    load:{ kind:"selectorized_stack", min:10, max:250, increment:10 } },
  { key:"leg_curl_seated", name:"Seated Leg Curl", cat:"legs",
    aliases:["seated hamstring curl"],
    look:"You SIT upright, pad on the BACK of your ankles, curl your heels down and under.",
    load:{ kind:"selectorized_stack", min:10, max:200, increment:10 } },
  { key:"leg_curl_lying", name:"Lying / Prone Leg Curl", cat:"legs",
    aliases:["prone leg curl", "lying hamstring curl"],
    look:"You lie FACE-DOWN and curl your heels toward your butt. Different machine to the seated one — tick both if you have both.",
    load:{ kind:"selectorized_stack", min:10, max:200, increment:10 } },
  { key:"hip_thrust_machine", name:"Hip Thrust Machine", cat:"legs",
    aliases:["glute drive", "glute bridge machine"],
    look:"You sit on the floor or a seat with a pad across your hips and drive your hips UP.",
    load:{ kind:"selectorized_stack", min:20, max:300, increment:15 } },
  { key:"abductor", name:"Hip Abductor", cat:"legs",
    aliases:["outer thigh machine", "abduction"],
    look:"Sit with pads on the OUTSIDE of your knees and push your knees APART.",
    load:{ kind:"selectorized_stack", min:10, max:250, increment:10 } },
  { key:"adductor_machine", name:"Hip Adductor", cat:"legs",
    aliases:["inner thigh machine", "adduction"],
    look:"Same frame, reversed — pads INSIDE your knees, squeeze your knees TOGETHER.",
    load:{ kind:"selectorized_stack", min:10, max:250, increment:10 } },
  { key:"calf_raise_standing", name:"Standing Calf Raise", cat:"legs",
    aliases:["calf machine"],
    look:"You stand with shoulder pads and rise onto your toes.",
    load:{ kind:"selectorized_stack", min:20, max:400, increment:15 } },
  { key:"calf_raise_seated", name:"Seated Calf Raise", cat:"legs",
    aliases:["seated calf"],
    look:"You SIT with pads across your KNEES and rise onto your toes. Trains a different calf muscle to the standing one.",
    load:{ kind:"plate_loaded", min:0, max:300, increment:10 } },
  { key:"preacher_curl_machine", name:"Preacher Curl Machine", cat:"pull",
    aliases:["machine curl", "bicep machine"],
    look:"Arms rest on an angled pad in front of you and you curl handles up.",
    load:{ kind:"selectorized_stack", min:10, max:150, increment:10 } },
  { key:"triceps_extension_machine", name:"Triceps Machine", cat:"push",
    aliases:["tricep press", "dip machine"],
    look:"A seated machine specifically for triceps — press handles down or forward with elbows fixed.",
    load:{ kind:"selectorized_stack", min:10, max:200, increment:10 } },
  { key:"ab_crunch_machine", name:"Ab Crunch Machine", cat:"core",
    aliases:["crunch machine"],
    look:"Sit, hold handles or a pad at your chest/shoulders, and crunch forward.",
    load:{ kind:"selectorized_stack", min:10, max:250, increment:10 } },
  { key:"back_extension", name:"Back Extension / 45°", cat:"legs",
    aliases:["hyperextension", "roman chair", "ghd"],
    look:"An angled pad you hook your ankles under and bend forward/up at the hips.",
    load:null }
];

/** Which library exercises a machine unlocks — makes the cost of a wrong tick concrete. */
function machineUnlocks(key, library) {
  return (library || []).filter(ex =>
    ((ex.requires && ex.requires.any) || []).some(alt =>
      (alt.all || []).some(r => r.machine_key === key ||
        (r.cap === key) || (key === "back_extension" && r.cap === "ghd")))
  ).map(ex => ex.name);
}

/** Build a gym equipment instance from a catalog tick. */
function machineInstance(key) {
  const c = MACHINE_CATALOG.find(x => x.key === key);
  if (!c) return null;
  const inst = { instance_id: `m_${key}`, type: "machine", machine_key: key,
                 caps: ["machine", key], count: 1, contention: "med",
                 load_portability: "machine_relative", from_checklist: true };
  if (c.load) inst.load = JSON.parse(JSON.stringify(c.load));
  if (key === "assisted_pullup") inst.caps = ["machine", "machine_assistance", "dip_station"];
  if (key === "back_extension") inst.caps = ["machine", "ghd", "back_extension"];
  return inst;
}

/** Why full body is right for a 2-3 day lifter. One paragraph, correct, quotable by the UI. */
function fullBodyRationale(days) {
  return `At ${days} days a week, any split that divides the body divides your frequency. `
       + `Upper/Lower over ${days} days trains chest once a week — RP publishes chest at 2-4×, so `
       + `that's below the floor before you've picked a single exercise. Full Body ×${days} hits `
       + `everything ${days}× with the same ${days} gym trips. It isn't the beginner option; it's `
       + `the only arithmetic that works. And it's cheap here, because at ${days} days your weekly `
       + `volume is low enough that each muscle only needs ${days <= 2 ? "8-12" : "5-8"} sets a `
       + `session — 5 or 6 groups, ~${days <= 2 ? 30 : 24} sets, under 90 minutes.`;
}

/** @deprecated — shim for one release. Use recommendSplit(user, days). */
const splitFor = days => {
  const b = recommendSplit({ emphasis:{} }, days).best || SPLITS.find(s => s.id === "fb3");
  return { name: b.name, days: b.pattern };
};

/* ================================================================
 * EQUIPMENT RESOLUTION
 * ================================================================ */
function loadPlan(inst) {
  if (!inst || !inst.load) return null;
  const L = inst.load;
  /* 🔴 BANDS. kind:"variable" carries `levels` + `approx_lb`, not min/max — so this used to fall
     through to {min:0, max:0} and canReach() then accepted ONLY 0. Net effect: a band exercise
     worked fine until you logged a set on it, and then silently VANISHED from selection forever,
     because canReach(35) was false. It also made warmupSets() return [] and made progress()
     unable to ever raise a band load. That hit 20 exercises at Home and 19 at Hotel — the two
     sparse gyms where bands are the whole point, and precisely the opposite of what floorPenalty
     was written to protect. */
  if (L.kind === "variable") {
    const lb = (L.approx_lb && L.approx_lb.length) ? L.approx_lb.slice().sort((a, b) => a - b) : [15, 35, 60];
    const step = () => {
      // Bands don't have an increment — they have rungs. The "step" is the gap to the next band.
      let g = Infinity;
      for (let i = 1; i < lb.length; i++) g = Math.min(g, lb[i] - lb[i - 1]);
      return isFinite(g) ? g : 20;
    };
    const nearest = (w, dir) => {
      const c = dir < 0 ? lb.filter(x => x <= w + .01) : lb.filter(x => x >= w - .01);
      return c.length ? (dir < 0 ? c[c.length - 1] : c[0]) : (dir < 0 ? lb[0] : lb[lb.length - 1]);
    };
    return {
      min: lb[0], max: lb[lb.length - 1], increment: step(), addOn: 0, kind: L.kind, levels: L.levels,
      stepAt: () => step(),
      canReach: w => w >= lb[0] - .01 && w <= lb[lb.length - 1] + .01,
      nearestAtOrBelow: w => nearest(w, -1),
      nearestAtOrAbove: w => nearest(w, +1)
    };
  }
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

/* ⚠️ DEAD until the library declares the flags. ZERO of 130 exercises set `drops_weight` or
   `needs_overhead_clearance`, so Home's noise_limit and Hotel's 84" ceiling can never fire.
   Derive them instead of waiting on a data migration: an overhead press needs clearance, and a
   deadlift/clean gets dropped. The old `< 96` test also wouldn't have fired at Home, whose
   ceiling is exactly 96. */
const OVERHEAD = new Set(["vertical_press"]);
function violatesGym(ex, gym) {
  const c = (gym && gym.constraints) || {};
  const overhead = ex.needs_overhead_clearance || OVERHEAD.has(ex.pattern) ||
                   /overhead|ohp|press.*(standing|military)|snatch|jerk/i.test(ex.name || "");
  const drops = ex.drops_weight || /deadlift|clean|snatch|jerk/i.test(ex.name || "");
  // Standing + a bar overhead needs ~7ft. A hotel gym at 84" (7ft flat) is genuinely too low.
  if (c.ceiling_height_in && overhead && c.ceiling_height_in <= 90) return true;
  if (c.noise_limit && drops) return true;
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
  c_systemic:.30, c_redundancy:.35, c_setup:.10, c_technique:.15, c_risk:.20,
  m_continuity:+.30, m_joint:-.50, m_stale:-.15, m_contention:-.12, m_untested:-.08,
  m_simple:-.16,   // full-strength on a 2-day full-body week; see scoreExercise
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

/**
 * How light can this exercise go, per the library's authored hint?
 * `min_effective_load_hint` is on 94 of 130 entries and was, until now, dead metadata — the field
 * existed and nothing read it. It names the exercise's own inherent floor: a 45lb bar, a 15lb
 * stack pin, your bodyweight.
 */
function minUsableLoad(ex) {
  const h = ex && ex.min_effective_load_hint;
  if (!h) return null;
  const v = h.per_hand_lb != null ? h.per_hand_lb
          : h.stack_min_lb != null ? h.stack_min_lb
          : h.bar_lb != null ? h.bar_lb : null;
  return (typeof v === "number" && v > 0) ? v : null;
}
/**
 * 1.0 = the gym can go light enough. → 0 as the gym's floor rises above what the exercise needs.
 * A multiplier on the progression term rather than a hard filter: a coarse floor makes an exercise
 * a bad choice, not an impossible one, and hard-excluding would empty out sparse gyms. Where we
 * DO have an estimate, canReach() still hard-excludes — this covers the case where we don't.
 */
function floorPenalty(ex, plan) {
  const need = minUsableLoad(ex);
  if (need == null || !plan || !plan.min) return 1;
  if (plan.min <= need) return 1;
  // 2× the usable floor ⇒ the lightest setting is roughly double what the movement wants. Dead.
  return clamp(1 - (plan.min - need) / need, 0.1, 1);
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
  // The BASEMENT — headroom's mirror, and the thing that was missing.
  // canReach() only fires when we HAVE a load estimate. For a new user (or any exercise with no
  // ratio path) targetLoad returns feel_out/null, the filter is skipped, and a 132lb lifter who
  // works at 8lb gets handed a cable fly whose lightest pin is 10lb. She physically cannot do a
  // controlled set at the lightest setting, and nothing catches it.
  // min_effective_load_hint is authored per-exercise for exactly this ("the lightest load at which
  // this is still useful"). If the gym's floor is above it, the exercise is compromised HERE —
  // a property of the exercise × gym, not of the person, so it applies to everyone.
  P *= floorPenalty(ex, c.plan);

  const solo = ((gym.constraints || {}).solo_training !== false);
  const riskMult = (ex.failure_safe || !solo) ? .3 : 1;
  const X = clamp(1
    - W.c_systemic * n5(ex.fatigue.systemic) * (session.fatigueSpent || 0)
    - W.c_redundancy * redundancy(session.chosen, ex)
    // Setups are what actually eat the hour — sets are cheap, walking across the gym to load a
    // bar is not. On a timeboxed day the selector should reach for the machine over the thing
    // that needs a rack, a bench and two collars.
    - W.c_setup * n5(ex.ratings.setup_cost) * (session.timeboxed ? 1 : .3)
    // "Simple movements, nothing fancy." A technical lift costs a longer warm-up ramp (see
    // warmupSeconds) AND attention you don't have on a packed full-body day. This is the term
    // that keeps a 2-day plan on goblet squats instead of the low-bar back squat.
    - W.c_technique * n5(ex.ratings.technique_demand) * (session.simple ? 1 : session.timeboxed ? .5 : .15)
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

  /* "Simple movements, nothing fancy." The c_technique term inside `context` is arithmetically
     incapable of changing a pick: its whole swing is W.context(.15) x W.c_technique(.15) = 0.0225,
     while ONE RP-tier gap is W.quality(.40) x W.q_tier(.40) x 0.4 = 0.064. It could never
     outvote a tier. Nina — 132lb, 2 days, session.simple — was still handed bb_front_squat at
     technique_demand 5, the maximum. So the real decision lives here, as a modifier big enough to
     cross a tier: on a simple day a technical lift has to be MUCH better to win. */
  if (session.simple) s += W.m_simple * n5(ex.ratings.technique_demand);
  return s;
}

function selectForSlot(slot, gym, user, session, library) {
  session = session || {};
  const occupied = session.occupied instanceof Set ? session.occupied : new Set(session.occupied || []);
  const out = [];
  for (const ex of library) {
    const hit = (ex.muscles || []).find(x => x.m === slot.muscle && (x.role === "primary" || slot.allow_secondary));
    if (!hit) continue;
    // Already picked in THIS session → not a candidate. redundancy() is a penalty, not an
    // exclusion, so a strong exercise could out-score its own penalty and get picked twice for
    // the same muscle — which isn't two exercises, it's one exercise with more sets.
    // ⚠️ Scoped to the session on purpose: [PUB] RP explicitly endorses repeating a lift ACROSS
    // the week (heavy bench Mon / light bench Wed / flye Fri). Different day, different `chosen`.
    if ((session.chosen || []).some(c => c.id === ex.id)) continue;
    /* Same FAMILY and same resistance peak, already in this session → not a candidate.
       redundancy() only penalizes (measured 0.0341), which bb_rdl beat by 0.027 — so Nina got
       db_rdl for glutes AND bb_rdl for hamstrings: the same movement twice, which is exactly the
       failure app.js:363 claims to prevent. [PUB] RP's real warning is against same-ANGLE
       redundancy, not against repeating a lift across the WEEK — different session, different
       `chosen`, still allowed. */
    if ((session.chosen || []).some(c => c.family && c.family === ex.family &&
        c.profile && ex.profile && c.profile.resistance_peak === ex.profile.resistance_peak &&
        !(slot.allow_same_family))) continue;
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
/**
 * @param slot optional — when given, the key is scoped to its REP BUCKET.
 *
 * ⚠️ The rep bucket is not optional in practice, and leaving it out is a silent stall.
 * [PUB] heavy rep ranges go earlier in the WEEK than light, so repRangeFor() puts the same
 * exercise on Monday at 5-8, Wednesday at 8-12 and Friday at 12-20. With one memory per exercise,
 * Friday's 20-rep set overwrites Monday's 5-rep set — and then Monday's progression reads a
 * 12-rep memory against a [5,8] range, trips the rep-range guard, and prescribes 105×5 to someone
 * whose e1RM says 122×5. Every heavy day drifts down toward the light day's load, forever.
 *
 * Same principle as trendKey's instance scoping and replayPRs' R_WINDOW: you cannot compare a
 * 5-rep set to a 20-rep set, so don't store them in the same box.
 */
function loadKey(userId, ex, bind, slot) {
  const inst = bind && bind.carrier;
  // Machine loads are instance-scoped; free-weight loads are absolute (70lb DB is 70lb anywhere).
  const base = ex.load_portability === "machine_relative" && inst
    ? `${userId}|${ex.id}@${inst.instance_id}` : `${userId}|${ex.id}`;
  const b = slot && slot.repRange ? repBucket(slot.repRange) : (slot && slot.bucket);
  return b ? `${base}|${b}` : base;
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
  // Scoped to the rep bucket — a 5-rep memory must never drive an 8-12 prescription.
  const known = ls[loadKey(user.id, ex, bind, slot)]
             || ls[loadKey(user.id, ex, bind)];   // legacy unbucketed rows, pre-fix
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
      if (set.warmup) continue;                            // scaffolding, not volume
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

/* ================================================================
 * PROGRESS / ANALYTICS
 *
 * ⚠️ THE GOVERNING FACT, and the reason a naive tracker lies here:
 *   RP's prescription is approximately e1RM-NEUTRAL.
 *      wk1  200×10 @2 RIR → epley 280.0
 *      wk2  205×10 @1 RIR → epley 280.2
 *   The added load is the TOLL for holding reps as RIR falls (see progress() + rirForWeek()).
 *   It is NOT strength gain. Therefore:
 *     · e1RM above its own baseline = you beat the PRESCRIPTION. Real, and rare.
 *     · "heaviest load ever"        = true almost every session. Congratulates you for
 *                                     following instructions. Meaningless.
 *   Every rule below follows from that one fact.
 * ================================================================ */

/**
 * [PUB] RP's countable working set: 5-30 reps, 0-4 RIR, 30-85% 1RM.
 *
 * ⚠️ The `rir <= 4` clause DOES THE DELOAD EXCLUSION FOR FREE — deloadPrescription() prescribes
 * rir:5 and rirForWeek() returns 5 for the deload week, so the deload excludes itself. There is
 * deliberately NO deload branch anywhere in this file. Don't add one: you'd be double-gating and
 * the second gate would drift from the first.
 *
 * This matters more than it looks. Without it:
 *      wk1              200×10 @2 RIR → epley 280.0
 *      deload 2nd half  100× 5 @5 RIR → epley 133.3   = a reported 52% COLLAPSE
 * ...in the exact week RP says the growth lands. The user panics and abandons either the deload
 * or the app. It only surfaces in week 5 of a 5-week test, which is exactly how it ships.
 * If anyone ever sets a deload RIR below 5, THIS is what breaks.
 *
 * It also keeps us inside Epley's usable window — past ~R=15 a straight line through a curve is
 * fiction.
 */
function countableSet(set) {
  // Warm-ups are scaffolding, not training. They'd also poison the trend: a 50% ramp set logged
  // at 8 reps is a real e1RM datapoint that says you got half as strong.
  return !!set && set.done === true && !set.warmup && set.load > 0
      && set.reps != null && set.reps >= 5 && set.reps <= 30
      && set.rir != null && set.rir >= 0 && set.rir <= 4;
}

/* Machine loads are instance-scoped, free weights absolute. This MUST stay loadKey()'s rule — if
   the trend and the load memory ever disagree about what "the same lift" is, one of them is lying
   and you can't tell which. */
function trendKey(set, ex) {
  return (ex && ex.load_portability === "machine_relative" && set.instanceId)
    ? `${set.exId}@${set.instanceId}` : set.exId;
}
const chrono = (a, b) => (a.date || "").localeCompare(b.date || "") || (a.week - b.week) || (a.day - b.day);

/**
 * One point per SESSION per key — the FIRST countable set, not the mean and not the max.
 *  · mean is dragged down by fatigue sets, and THE SET COUNT IS AUTOREGULATED — it changes weekly
 *    by design. Any count-sensitive statistic confounds "the engine added a set" with "I got
 *    stronger". That's the tonnage mistake wearing a different hat.
 *  · max-over-N has a max-of-N bias that grows with the set count. Same disease.
 *  · the first set is count-invariant, fatigue-invariant, and is the set progress() actually
 *    wrote the prescription for.
 * Epley's ABSOLUTE value is wrong for a 20-rep accessory (120×20@2 → 208, nobody's 1RM). Survivable
 * only because it's wrong CONSISTENTLY WITHIN A KEY and we read % change within a key. Hence the
 * hard UI rule: never print an absolute e1RM.
 */
function e1rmSeries(sessions, library, key) {
  const out = [];
  for (const s of (sessions || []).slice().sort(chrono)) {
    if (!s.finished || s.off_plan) continue;   // travel excluded — see the note on e1rmTrend
    for (const set of (s.sets || [])) {
      const ex = (library || []).find(e => e.id === set.exId);
      if (!ex || trendKey(set, ex) !== key || !countableSet(set)) continue;
      out.push({ at: s.date, week: s.week, day: s.day, mesoId: s.mesoId, sessionId: s.id,
                 e: epley(set.load, set.reps, set.rir), load: set.load, reps: set.reps,
                 rir: set.rir, exId: set.exId, sub: set.sub ? set.sub.of : null });
      break;                                   // FIRST, not best
    }
  }
  return out;
}

/** Every trend key a muscle has data for, richest first. The muscle row plots [0]. */
function keysForMuscle(sessions, library, muscle) {
  const seen = {};
  for (const s of sessions || []) {
    if (!s.finished || s.off_plan) continue;
    for (const set of s.sets || []) {
      if (set.muscle !== muscle || !countableSet(set)) continue;
      const ex = (library || []).find(e => e.id === set.exId);
      if (!ex) continue;
      const k = trendKey(set, ex);
      (seen[k] = seen[k] || { key:k, exId:set.exId, instanceId:set.instanceId || null, s:new Set() }).s.add(s.id);
    }
  }
  return Object.values(seen).map(v => ({ key:v.key, exId:v.exId, instanceId:v.instanceId, n:v.s.size }))
                            .sort((a, b) => b.n - a.n);
}

/** Median-of-3, NOT an EMA. The dominant noise here is the one-off session (bad sleep, no
 *  caffeine, a misjudged RIR); median-of-3 deletes exactly that with ZERO LAG. An EMA lags, and on
 *  a 4-6 point series the lag lands on the newest point — the one you're trying to read.
 *  Endpoints pass through untouched: smoothing the last point would smooth the answer. */
function smooth3(pts) {
  if (!pts || pts.length < 3) return (pts || []).slice();
  return pts.map((p, i) => {
    if (i === 0 || i === pts.length - 1) return p;
    const m = [pts[i-1].e, p.e, pts[i+1].e].sort((a, b) => a - b)[1];
    return Object.assign({}, p, { e: m, raw: p.e });
  });
}

const TCRIT = { 1:6.31, 2:2.92, 3:2.35, 4:2.13, 5:2.02, 6:1.94, 7:1.89, 8:1.86, 9:1.83, 10:1.81 };
const tcrit = df => TCRIT[df] || 1.70;
const MIN_PTS = 4;        // 3 points can't distinguish a trend from a wobble
const MIN_RATE = 0.0025;  // 0.25%/session. Tight data makes a 0.05% drift pass a t-test —
                          // "significant" and "meaningful" diverge. This is the practical floor.

/**
 * OLS of ln(e1RM) on session index.
 *  · ln, not raw → the slope is a scale-free per-session GROWTH RATE. Regressing raw e1RM makes a
 *    400lb squat's noise dwarf a 25lb lateral raise's signal, so "overall" would just be a squat
 *    readout in a costume.
 *  · index, not date → [APP] training days aren't tied to dates. Sessions are the real cadence.
 * The gate is the whole point. Three ways to fail to claim a trend, and all three are FINE.
 * An app that can never say "I don't know" is an app whose "yes" means nothing.
 */
function trendFit(pts) {
  const n = (pts || []).length;
  if (n < 2) return { n, verdict:"none", rate:0, total:0, t:0 };
  const xs = pts.map((_, i) => i), ys = pts.map(p => Math.log(p.e));
  const mx = xs.reduce((a,b) => a+b, 0)/n, my = ys.reduce((a,b) => a+b, 0)/n;
  let sxx = 0, sxy = 0;
  for (let i = 0; i < n; i++) { const dx = xs[i]-mx; sxx += dx*dx; sxy += dx*(ys[i]-my); }
  if (!sxx) return { n, verdict:"none", rate:0, total:0, t:0 };
  const b = sxy/sxx, a = my - b*mx;
  let ss = 0;
  for (let i = 0; i < n; i++) { const r = ys[i] - (a + b*xs[i]); ss += r*r; }
  const df = n - 2;
  const se = df > 0 ? Math.sqrt((ss/df)/sxx) : Infinity;
  const t = (se && isFinite(se)) ? b/se : 0;
  const rate = Math.expm1(b), total = Math.expm1(b * (n-1));
  let verdict = "flat";
  if (n < MIN_PTS) verdict = "building";
  else if (Math.abs(t) >= tcrit(df) && Math.abs(rate) >= MIN_RATE) verdict = b > 0 ? "up" : "down";
  return { n, verdict, rate, total, t, slope:b, se, first:pts[0], last:pts[n-1] };
}

/** Per-week volume. Delegates to weeklyVolume() rather than re-walking sets — countDirect is a
 *  load-bearing rule (bench must not add to triceps) and it lives in exactly ONE place. */
function volumeByWeek(sessions, library, mesoId, weeks) {
  const out = {};
  for (let w = 1; w <= weeks; w++) {
    const v = weeklyVolume((sessions||[]).filter(s => s.mesoId === mesoId && s.week === w && s.finished), library);
    for (const m in v) (out[m] = out[m] || new Array(weeks).fill(0))[w-1] = v[m];
  }
  return out;   // travel INCLUDED — a set is a set, stimulus is stimulus
}

/** Band position + where it's heading. `delta` is the engine's ALREADY-COMMITTED next-week change
 *  (session.decision[m].delta) — a readout of a decision, not a forecast. */
function bandState(muscle, emphasis, sets, delta) {
  const L = landmarks(muscle), b = band(muscle, emphasis);
  const hi = Math.max(b.ceil, L.mrv[1]);
  const pct = v => Math.max(0, Math.min(100, v / hi * 100));
  const zone = sets < L.mev[0] ? "lo" : sets <= L.mav[1] ? "ok" : sets <= hi ? "hi" : "ov";
  return { sets, hi, zone, mev:L.mev[0], mav:L.mav[1], mrv:hi,
           pMev:pct(L.mev[0]), pMav:pct(L.mav[1]), pNow:pct(sets), pNext:pct(sets + (delta||0)),
           weeksToCeiling: delta > 0 ? Math.ceil((hi - sets) / delta) : null };
}

const PR_MARGIN = 0.015;  // 1.5%. Below that it's Epley slop + RIR drift, not a PR.
const R_WINDOW = 4;       // Epley's input is R = reps+rir. Only comparable at comparable R.

/**
 * PRs, derived by REPLAY, never stored. This definition WILL change, and a stored pr:true from an
 * old rule is a lie you can't recompute away. ~4k sets for two users — it's free.
 *
 * Why not "heaviest weight ever": progress() raises the load 2-5% EVERY week while rirForWeek()
 * removes a rep of reserve, so it fires almost every session of accumulation and then goes dead
 * for the whole deload. It throws confetti for obedience, then calls your best recovery week a
 * five-week slump. Worst of both.
 */
function replayPRs(sessions, library) {
  const hist = {}, prs = [];
  for (const s of (sessions || []).slice().sort(chrono)) {
    if (!s.finished || s.off_plan) continue;
    for (const set of (s.sets || [])) {
      if (!countableSet(set)) continue;        // ← silently excludes the entire deload (RIR 5)
      const ex = (library || []).find(e => e.id === set.exId);
      if (!ex) continue;
      const key = trendKey(set, ex);
      const h = hist[key] || (hist[key] = []);
      if (!h.length) { h.push(set); continue; }   // your first ever set isn't a PR, it's hello
      const e = epley(set.load, set.reps, set.rir), R = set.reps + set.rir;
      const best = h.reduce((a, x) => epley(x.load, x.reps, x.rir) > epley(a.load, a.reps, a.rir) ? x : a, h[0]);
      const bestE = epley(best.load, best.reps, best.rir);
      // e1RM PR — "you beat the prescription". The R window matters: 200×10@2 → R=12 → 280, but
      // 120×20@2 → R=22 → 208. Epley's error GROWS with R, so a rep-range drift upward would
      // manufacture fake PRs out of pure geometry. Different R = a different set, not a better one.
      if (Math.abs(R - (best.reps + best.rir)) <= R_WINDOW && e >= bestE * (1 + PR_MARGIN)) {
        prs.push({ kind:"e1rm", key, exId:set.exId, at:s.date, week:s.week,
                   gain: e/bestE - 1, load:set.load, reps:set.reps, rir:set.rir });
      } else {
        // Matched-load rep PR — the one lifters actually feel, and the MORE trustworthy of the
        // two precisely because no model is involved: same-or-heavier load, same-or-lower reserve.
        const cands = h.filter(x => x.load >= set.load && x.rir <= set.rir).map(x => x.reps);
        const bestReps = cands.length ? Math.max.apply(null, cands) : null;
        if (bestReps != null && set.reps > bestReps)
          prs.push({ kind:"reps", key, exId:set.exId, at:s.date, week:s.week,
                     load:set.load, reps:set.reps, was:bestReps });
      }
      h.push(set);
    }
  }
  return prs;
}

/**
 * @deprecated Use e1rmSeries + trendFit. Kept for the one caller that still wants a crude number.
 * Now routed through countableSet, which fixes a latent -52% deload collapse: this used to
 * exclude off_plan and nothing else.
 * ⚠️ off_plan (travel) stays excluded. Otherwise a hotel's 50lb dumbbell ceiling reads as
 * detraining, you believe it, and you deload for nothing.
 */
function e1rmTrend(sessions, exId, slotRir) {
  const pts = [];
  for (const s of sessions || []) {
    if (s.off_plan) continue;
    for (const set of s.sets || []) {
      if (set.exId !== exId) continue;
      const rir = set.rir == null ? slotRir : set.rir;
      if (!countableSet(Object.assign({}, set, { rir, done: set.done !== false }))) continue;
      pts.push({ at: s.date, e: epley(set.load, set.reps, rir) });
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
  // [PUB] MRV is TWO consecutive failures — "if you've under-performed two sessions in a row."
  // One bad session is a bad session; RP says repeat the week and confirm before cutting.
  eq("ONE failed session → hold and confirm, NOT an MRV verdict",
     setDelta({ soreness:"never" }, PF.FAIL, "emphasize", [PF.ON]).action, ACTION.HOLD);
  eq("TWO in a row → recovery session (the real MRV detector)",
     setDelta({ soreness:"never" }, PF.FAIL, "emphasize", [PF.FAIL]).action, ACTION.RECOVERY);
  eq("no history → still cautious, not a verdict",
     setDelta({ soreness:"never" }, PF.FAIL, "emphasize").action, ACTION.HOLD);
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

  /* ── ⭐ THE CLOCK — an hour means an hour, warm-ups included ──
   * [PUB] RP's ceiling is ~30 sets/session ≈ 75-90 min at their own rest times, and that's BEFORE
   * warm-ups, which they never count. Robert's constraint is "about an hour with warm-ups", so the
   * planner budgets MINUTES and lets the set count fall out. */
  ok("a warm-up ramp costs real time and scales with technique demand",
     warmupSeconds({ ratings:{ technique_demand:5 } }, true) > warmupSeconds({ ratings:{ technique_demand:2 } }, true));
  ok("the 2nd exercise for a muscle doesn't re-warm a warm muscle",
     warmupSeconds({ ratings:{ technique_demand:5 } }, false) < 60);
  (() => {
    const SEED_USERS = [
      { id:"r", trainingAge:"advanced", emphasis:{ chest:"emphasize", back:"emphasize", side_delt:"emphasize",
        triceps:"grow", biceps:"grow", quads:"grow", hamstrings:"maintain", glutes:"maintain",
        rear_delt:"maintain", front_delt:"maintain", calves:"maintain", traps:"maintain",
        forearms:"maintain", abs:"maintain", adductors:"maintain" } },
      { id:"n", trainingAge:"intermediate", emphasis:{ glutes:"emphasize", hamstrings:"emphasize",
        quads:"grow", back:"grow", chest:"grow" } }
    ];
    for (const u of SEED_USERS) for (const d of [2,3,4,5]) {
      const rec = recommendSplit(u, d); if (!rec.best) continue;
      const plan = assignDays(u, rec.best);
      ok(`${u.id} ${d}d: every session fits the ${CFG.sessionMinutesMax}-minute budget`,
         plan.days.every(x => x.projMin <= CFG.sessionMinutesMax + 1));
      // Below MEV is not a small growth dose — it's not a growth dose. The clock must never
      // trim a focus area under it; it drops a Maintain muscle instead.
      // Compound-covered muscles are trained INDIRECTLY (0 direct sets by design) — exclude them;
      // the invariant is about DIRECT prescription of the muscles that get their own slot.
      ok(`${u.id} ${d}d: nothing above Maintain is trimmed below MEV`,
         plan.muscles.filter(r => r.emphasis !== "maintain" && !r.dropped && !r.coveredByCompound)
           .every(r => (r.perSession || 0) * (r.freq || 0) >= landmarks(r.m).mev[0]));
      ok(`${u.id} ${d}d: when the clock forces a cut, it's a Maintain muscle — never a focus area`,
         (plan.droppedForTime || []).every(m => (u.emphasis[m] || "grow") === "maintain"));
    }
  })();
  ok("the weekly budget is quoted in CLOCK terms, not the 30-set ceiling",
     /minutes|hour/.test(recommendSplit({ emphasis:{ chest:"emphasize", back:"emphasize", side_delt:"emphasize",
       biceps:"grow", triceps:"grow", quads:"grow" } }, 4).budget.note || ""));

  // ── Frequency is FORCED by volume ──
  eq("20 weekly sets forces >=3 sessions", minFrequency(20), 3);
  eq("8 weekly sets needs only 1", minFrequency(8), 1);

  /* ── PROGRESSIVE OVERLOAD, week over week ──
   * [PUB] "You should seek to keep reps stable from week to week while letting your RIR decline.
   *        The way you keep the reps stable as RIR falls is by adding weight."
   * [PUB] Load Progression Rule: "add only enough to allow at least the same reps, at the same or
   *        slightly lower RIR, with at least four weeks of accumulation being the goal."
   * MINIMAL is the operative word — this is the intensity half of RP's system, and it must not
   * outrun the RIR calendar. */
  const bar0 = loadPlan({ load:{ kind:"plate_loaded", min:45, max:495, increment:5 } });
  // RP's own published worked example: 100×10 @2 RIR → next week 10 reps @1 RIR. +2.5lb is too
  // easy (you'd get 11), +10lb needs 0 RIR → add 5lb. Landing anywhere else means the band is wrong.
  eq("[PUB] RP's worked example: 100×10@2 → 105×10, not 102.5 and not 110",
     progress({load:100,reps:10,rir:2},{repRange:[8,12],rir:1},bar0), {load:105,reps:10,why:"load"});
  // The chain, four accumulation weeks. Reps HELD, load climbing minimally.
  (() => {
    let cur = {load:200,reps:10,rir:2}, loads = [200], reps = [10];
    for (let w = 1; w <= 4; w++) {
      const p = progress(cur, {repRange:[8,12], rir: rirForWeek(w,5)}, bar0);
      loads.push(p.load); reps.push(p.reps);
      cur = {load:p.load, reps:p.reps, rir: rirForWeek(w+1,5)};
    }
    eq("load climbs every week: 200→205→210→215→220", loads, [200,205,210,215,220]);
    eq("...and reps are HELD at 10 the whole way", reps, [10,10,10,10,10]);
    ok("...at 2-5% a week, never more — 'add only enough'",
       loads.slice(1).every((l,i) => { const d = (l-loads[i])/loads[i]; return d > 0 && d <= 0.05; }));
  })();
  ok("[PUB] the progression is e1RM-NEUTRAL — the load bump is the TOLL for the RIR drop, not gain",
     Math.abs(epley(205,10,1) - epley(200,10,2)) < 1);
  // Dumbbells: 10→15lb is a 50% jump. RP: "if the next weight increment is outside of that range
  // (like going from the 10lb to the 15lb dumbbells), it adds a rep to each set instead."
  (() => {
    const db0 = loadPlan({ load:{ kind:"fixed_pairs", min:5, max:120, increment:5 } });
    let d = {load:10,reps:10,rir:2}, seq = [];
    for (let i = 0; i < 3; i++) { const p = progress(d, {repRange:[8,12],rir:1}, db0);
      seq.push(p.load + "x" + p.reps); d = {load:p.load, reps:p.reps, rir:1}; }
    eq("coarse DB jump → add reps to the top of the range, THEN take the jump and reset",
       seq, ["10x11","10x12","15x8"]);
  })();

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

  /* ── 🔑 Load memory must be scoped to the REP BUCKET ──
   * Found by driving the real app: chest_supported_row is correctly scheduled 3× a week at 5-8,
   * 8-12 and 12-20 (the published heavy→light WEEKLY gradient). With one memory per exercise,
   * Friday's 12-rep set overwrote Monday's, Monday's [5,8] slot then tripped the rep-range guard,
   * and week 2 prescribed 105×5 to a lifter whose e1RM said 122×5. Every heavy day would drift
   * down to the light day's load, forever, and it looks like "the app just isn't progressing me". */
  (() => {
    const rowEx = { id:"row", load_portability:"absolute", ratings:{}, muscles:[] };
    const kH = loadKey("rob", rowEx, {}, { repRange:[5,8] });
    const kL = loadKey("rob", rowEx, {}, { repRange:[12,20] });
    ok("heavy and light memories of the SAME exercise are different keys", kH !== kL);
    eq("...and the key names its bucket", kH, "rob|row|5_8");
    eq("a slot's `bucket` field works too (that's what the set carries)",
       loadKey("rob", rowEx, {}, { bucket:"12_20" }), "rob|row|12_20");
    eq("no slot → unbucketed base key (legacy rows still resolve)", loadKey("rob", rowEx, {}), "rob|row");
    // machine scoping and bucket scoping must COMPOSE, not replace each other
    const mEx = { id:"lat", load_portability:"machine_relative", ratings:{}, muscles:[] };
    eq("machine instance AND rep bucket both scope the key",
       loadKey("rob", mEx, { carrier:{ instance_id:"c_lat" } }, { repRange:[8,12] }), "rob|lat@c_lat|8_12");
    // The actual regression: a 12-rep memory must not drive a [5,8] prescription.
    const user = { id:"rob", loadState:{ "rob|row|8_12": { load:100, reps:12, rir:2, at:new Date().toISOString() } } };
    const heavy = targetLoad(user, rowEx, { plan: loadPlan({ load:{kind:"plate_loaded",min:45,max:495,increment:5} }) },
                             { repRange:[5,8], rir:1 });
    ok("a 12-rep memory does NOT leak into the 5-8 slot (it feels out instead of prescribing 105×5)",
       !heavy || heavy.load == null || heavy.why === "feel_out");
  })();

  /* ── THE FLOOR — for a smaller lifter this binds more often than the ceiling ──
   * canReach() only fires when a load ESTIMATE exists. With no history (or no ratio path)
   * targetLoad returns feel_out/null, the filter is skipped, and a 132lb lifter who works at 8lb
   * gets handed a cable fly whose lightest pin is 10lb. Found by driving the app as Nina.
   * min_effective_load_hint was on 94/130 entries and read by NOTHING. */
  (() => {
    const cf = { id:"cf", min_effective_load_hint:{ stack_min_lb:5 }, ratings:{}, muscles:[] };
    const coarse = loadPlan({ load:{ kind:"selectorized_stack", min:10, max:200, increment:5 } });
    const fine   = loadPlan({ load:{ kind:"selectorized_stack", min:5,  max:200, increment:5 } });
    eq("the hint is read (it was dead metadata)", minUsableLoad(cf), 5);
    ok("a gym floor ABOVE the usable minimum is penalized hard", floorPenalty(cf, coarse) <= 0.2);
    eq("a gym that goes light enough is not penalized", floorPenalty(cf, fine), 1);
    // A barbell's own floor IS the bar — that's not the gym's fault and mustn't be penalized.
    const bb = { id:"bb", min_effective_load_hint:{ bar_lb:45 }, ratings:{}, muscles:[] };
    eq("an exercise whose floor IS the bar takes no penalty at a 45lb bar",
       floorPenalty(bb, loadPlan({ load:{ kind:"plate_loaded", min:45, max:200, increment:5 } })), 1);
    eq("no hint → no opinion", floorPenalty({ id:"x" }, coarse), 1);
  })();

  /* ── No exercise twice in one session ── */
  (() => {
    const gym = { gym_id:"g", constraints:{}, equipment:[
      { instance_id:"db", caps:["dumbbell"], load:{ kind:"fixed_pairs", min:5, max:120, increment:5, pairs:true },
        load_portability:"absolute", contention:"low" },
      { instance_id:"b", caps:["bench","adjustable_bench"], attrs:{ adjustable:true, angles:[0,30,45] }, count:1 } ] };
    const u = { id:"t", emphasis:{}, loadState:{}, overrides:{}, injuries:[] };
    const slot = { muscle:"chest", repRange:[8,12], rir:2, position:1, wants_stretch:true };
    const first = selectForSlot(slot, gym, u, { chosen:[], fatigueSpent:0, occupied:new Set() }, MESO_EXERCISES || []);
    if (first.primary) {
      const second = selectForSlot(Object.assign({}, slot, { wanted_profile:"shortened", wants_stretch:false }),
        gym, u, { chosen:[first.primary.ex], fatigueSpent:.2, occupied:new Set() }, MESO_EXERCISES || []);
      ok("the 2nd exercise for a muscle is never the SAME exercise as the 1st",
         !second.primary || second.primary.ex.id !== first.primary.ex.id);
      ok("...and an already-chosen exercise is not even a candidate",
         !second.all.some(c => c.ex.id === first.primary.ex.id));
    }
  })();

  /* ── WARM-UPS are prescribed, and must never contaminate anything ── */
  (() => {
    const bar0 = loadPlan({ load:{ kind:"plate_loaded", min:45, max:495, increment:5 } });
    const sq = { ratings:{ technique_demand:5 }, fatigue:{ systemic:5 } };
    const fly = { ratings:{ technique_demand:2 }, fatigue:{ systemic:2 } };
    const w = warmupSets(225, bar0, sq, true);
    eq("a heavy compound ramps 3 times", w.length, 3);
    ok("...ascending, and ALWAYS below the work weight",
       w.every((x,i) => x.load < 225 && (i===0 || x.load > w[i-1].load)));
    ok("light isolation gets a shorter ramp", warmupSets(60, loadPlan({load:{kind:"selectorized_stack",min:5,max:200,increment:5}}), fly, true).length <= 2);
    eq("the 2nd exercise for a muscle gets no ramp — it's already warm", warmupSets(225, bar0, sq, false).length, 0);
    eq("no work weight yet → no ramp to compute", warmupSets(null, bar0, sq, true).length, 0);
    // [PUB] RP's 12@30RM/8@20RM/4@10RM is a WEEK-1 feel-out, not a weekly ramp: run against a
    // known 200x10@2 (e1RM 280) its "10RM" is 210 — heavier than the work set. Guard the invariant.
    ok("a ramp set is never heavier than the work set", warmupSets(200, bar0, sq, true).every(x => x.load < 200));
    eq("warm-ups are not countable sets", countableSet({ done:true, load:100, reps:8, rir:2, warmup:true }), false);
    const lib0 = [{ id:"w", muscles:[{m:"chest",role:"primary"}] }];
    eq("warm-ups add no weekly volume",
       weeklyVolume([{ sets:[{exId:"w",load:100,reps:8,warmup:true},{exId:"w",load:200,reps:10}] }], lib0).chest, 1);
  })();

  /* ── QA round 2: bugs found by driving the app ── */
  (() => {
    // Bands: kind:"variable" carried levels+approx_lb, not min/max -> loadPlan returned {0,0} and
    // canReach accepted ONLY 0, so a band exercise vanished the moment you logged a set on it.
    // 20 exercises at Home, 19 at Hotel — the gyms where bands ARE the plan.
    const b = loadPlan({ load:{ kind:"variable", levels:["light","medium","heavy"], approx_lb:[15,35,60] } });
    eq("band plan reads approx_lb, not {0,0}", [b.min, b.max], [15, 60]);
    ok("a logged band load is still reachable (it used to vanish)", b.canReach(35));
    ok("...and 0 is not a band", !b.canReach(0));
    eq("bands snap to the next rung up", b.nearestAtOrAbove(20), 35);
    eq("bands snap to the rung at or below", b.nearestAtOrBelow(50), 35);
    ok("a band ramp is computable", warmupSets(60, b, { ratings:{technique_demand:2}, fatigue:{systemic:2} }, true).length > 0);

    // `simple` must be able to outvote a tier gap, or it's decoration. Its whole swing used to be
    // W.context(.15)*W.c_technique(.15)=0.0225 against a tier gap of .40*.40*0.4=0.064.
    ok("`simple` can outvote one RP-tier gap", Math.abs(W.m_simple) > 0.40 * W.q_tier * 0.4);

    // Ceiling/noise constraints were unreachable: no exercise sets the flags, and the test was <96
    // at a gym whose ceiling is exactly 96.
    ok("a low ceiling blocks overhead work", violatesGym({ name:"Standing Overhead Press", pattern:"vertical_press" }, { constraints:{ ceiling_height_in:84 } }));
    ok("...but not at a normal ceiling", !violatesGym({ name:"Standing Overhead Press", pattern:"vertical_press" }, { constraints:{ ceiling_height_in:108 } }));
    ok("noise limits block deadlifts", violatesGym({ name:"Conventional Deadlift" }, { constraints:{ noise_limit:true } }));
    ok("...but not curls", !violatesGym({ name:"Incline Dumbbell Curl" }, { constraints:{ noise_limit:true } }));
  })();

  /* ── QA round 3: found by driving 29 real sessions ── */
  (() => {
    // The deload must never become your load memory. countableSet already knew; recordLoadState
    // didn't, so every new meso seeded from the deload: -16.7% row, -21.4% lateral raise.
    eq("a deload set is not countable (rir 5)", countableSet({ done:true, load:100, reps:5, rir:5 }), false);
    eq("a hard set is", countableSet({ done:true, load:100, reps:8, rir:1 }), true);

    // progress() must be able to say "add a rep instead" — the app pinning targetReps to `hi`
    // made this branch unreachable and took every coarse jump instead (+133% on a band).
    const dbs = loadPlan({ load:{ kind:"fixed_pairs", min:5, max:50, increment:5 } });
    eq("a coarse jump adds a rep rather than +50% load",
       progress({ load:10, reps:10, rir:2 }, { repRange:[8,12], rir:1 }, dbs).why, "rep");

    // At the equipment ceiling, never prescribe a permanent regression.
    const capped = loadPlan({ load:{ kind:"fixed_pairs", min:5, max:120, increment:5 } });
    const atMax = progress({ load:120, reps:8, rir:1 }, { repRange:[5,8], rir:1 }, capped);
    ok("topped-out stack keeps climbing reps, never cuts them", atMax.reps > 8 && atMax.load === 120);

    // Recovery protocol: half sets, half reps, SAME load. Was implemented, tested, never called.
    const rec = recoverySession({ sets:6, reps:10, load:200, rir:1 });
    eq("recovery halves sets and reps and HOLDS the load", [rec.sets, rec.reps, rec.load], [3, 5, 200]);

    // Deload second half halves the load. "first" was hardcoded at the only call site, so days
    // 3-4 prescribed 105-120% of the last hard week.
    eq("deload 2nd half halves the load", deloadPrescription({sets:6,reps:10,load:200}, "chest", "second").load, 100);
    ok("deload 1st half does not", deloadPrescription({sets:6,reps:10,load:200}, "chest", "first").load === 200);
  })();

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

  /* ================= SPLITS ================= */
  // Realistic emphasis spreads. NB: a greedy spread (3 emphasize + 6 grow) genuinely does not fit
  // 4 days — ~168 sets against a ~120-set week — and the engine is RIGHT to reject every split
  // for it. That's what recommendSplit().budget.note is for. These users fit.
  const nina = { trainingAge:"intermediate", emphasis:{
    glutes:"emphasize", hamstrings:"emphasize", quads:"grow", back:"grow", abs:"grow",
    side_delt:"maintain", chest:"maintain", triceps:"maintain", biceps:"maintain",
    rear_delt:"maintain", front_delt:"maintain", calves:"maintain", traps:"maintain",
    forearms:"maintain", adductors:"maintain" } };
  const rob = { trainingAge:"advanced", emphasis:{
    chest:"emphasize", back:"emphasize", side_delt:"emphasize", triceps:"grow", biceps:"grow",
    quads:"grow", hamstrings:"maintain", glutes:"maintain", rear_delt:"maintain",
    front_delt:"maintain", calves:"maintain", traps:"maintain", forearms:"maintain",
    abs:"maintain", adductors:"maintain" } };
  ok("an over-broad emphasis spread is REPORTED, not silently under-delivered",
     recommendSplit({ trainingAge:"advanced", emphasis:{
       chest:"emphasize", back:"emphasize", side_delt:"emphasize", triceps:"grow", biceps:"grow",
       quads:"grow", hamstrings:"grow", rear_delt:"grow", calves:"grow" } }, 4).budget.over);

  ok("2 days: Upper/Lower is REJECTED — 1× chest is below RP's published floor",
     !splitsFor(2, nina).find(o => o.split.id === "ul1").valid);
  eq("2 days: Full Body is the recommendation", recommendSplit(nina, 2).best.id, "fb2");
  ok("3 days: PPL ×1 is REJECTED", !splitsFor(3, rob).find(o => o.split.id === "ppl1").valid);
  ok("4 days is NOT automatically Upper/Lower", recommendSplit(rob, 4).best.id !== "ul2");
  // Robert's own spread (chest+back+side_delt all Emphasize) legitimately BREAKS Upper/Lower:
  // two upper days can't hold ~108 sets of upper work. That's exactly why fb4 wins for him —
  // full body spreads those three across 4 days instead of 2. So test the menu property with a
  // spread that actually fits.
  const lean = { trainingAge:"intermediate", emphasis:{
    chest:"emphasize", back:"grow", quads:"grow", side_delt:"maintain", triceps:"maintain",
    biceps:"maintain", hamstrings:"maintain", glutes:"maintain", rear_delt:"maintain",
    front_delt:"maintain", calves:"maintain", traps:"maintain", forearms:"maintain",
    abs:"maintain", adductors:"maintain" } };
  ok("Upper/Lower ×2 IS valid at 4 days for a spread that fits — it's a menu, not a decree",
     splitsFor(4, lean).find(o => o.split.id === "ul2").valid);
  ok("every rejection carries a human reason",
     splitsFor(2, nina).filter(o => !o.valid).every(o => o.rejects[0].why.length > 20));

  // Frequency is planned against where the meso LANDS, not where it seeds. Without this, every
  // split validates at every day count and the whole check is decorative.
  ok("split planned against where the meso LANDS, not where it seeds",
     planVolume("glutes","emphasize") > band("glutes","emphasize").start);
  ok("Emphasize never plans LESS volume than Grow (RP's quads MAV*P lo < MAV hi)",
     planVolume("quads","emphasize") >= planVolume("quads","grow"));
  eq("Maintain doesn't force frequency (4 sets of chest is not two gym trips)", targetFreq("chest","maintain"), 1);

  // The spreadable top-up: side delts publish at 3-6×/wk but a 4-day Upper/Lower only ANCHORS
  // them at 2. They're not "upper" muscles, they're whenever muscles — so they land on the lower
  // days too. This is what keeps Upper/Lower viable at all.
  // side_delt must actually WANT frequency for the top-up to be observable — on Maintain it
  // correctly wants 1. Give it Grow (→ 24 sets → 3 sessions) against an otherwise-quiet week.
  const spready = { trainingAge:"intermediate", emphasis: Object.keys(LANDMARKS)
    .reduce((o, m) => (o[m] = "maintain", o), { side_delt:"grow", quads:"grow" }) };
  spready.emphasis.side_delt = "grow"; spready.emphasis.quads = "grow";
  const ul2p = assignDays(spready, splitById("ul2"));
  ok("side delts (RP: 3-6×/wk) get >2 sessions on a 4-day Upper/Lower via the spreadable top-up",
     ul2p.muscles.find(r => r.m === "side_delt").freq > 2);
  ok("quads are NOT spread onto upper days — 2-5× is not a licence to schedule badly",
     ul2p.muscles.find(r => r.m === "quads").freq <= 2);
  // 🔑 The two-pass regression: sorting purely by (tier, targetFreq) puts the high-frequency
  // SPREADABLE muscles first, they fan out and fill every 30-set bin, and then quads — which can
  // only live on a lower day — finds both lower days full and gets rejected. A 4-day Upper/Lower
  // that trains no quads, because the lateral raises got there first.
  ok("anchors are placed BEFORE spreadables — quads never lose their day to lateral raises",
     assignDays(rob, splitById("ul2")).muscles.find(r => r.m === "quads").freq >= 2);

  // Priority + pulsatility coexist
  const d0 = orderDay(rob, ["chest","back","side_delt","triceps","biceps"], 0);
  const d1 = orderDay(rob, ["chest","back","side_delt","triceps","biceps"], 1);
  ok("[PUB] the top-emphasis muscle leads, without exception",
     rob.emphasis[d0[0]] === "emphasize" && rob.emphasis[d1[0]] === "emphasize");
  ok("[PUB] pulsatility rotates who leads across sessions", d0[0] !== d1[0]);
  ok("...and rotation NEVER lets a Grow muscle outrank an Emphasize one",
     [d0, d1].every(d => d.map(m => EMPHASIS.indexOf(rob.emphasis[m])).every((v,i,a) => i===0 || v<=a[i-1])));

  // Heavy is earlier in the WEEK, not earlier in the session
  eq("first session of the week is the heavy one", repRangeFor(0, 2, 0), [5,8]);
  ok("heavy/light is a WEEKLY axis — two sessions of the same muscle differ",
     repRangeFor(0,2,0).join() !== repRangeFor(1,2,0).join());

  // Full body can't run three hours
  ok("a full-body day is capped at 4-6 groups, not all 15",
     assignDays(nina, splitById("fb2")).days.every(d => d.muscles.length <= CFG.groupsPerSession[1]));
  ok("...and at ~30 projected sets",
     assignDays(rob, splitById("fb4")).days.every(d => d.projSets <= CFG.sessionSetMax));
  ok("6 days buys shorter sessions, not more frequency than 4-day U/L",
     assignDays(rob, splitById("ppl2")).muscles.find(r => r.m === "chest").freq ===
     assignDays(rob, splitById("ul2")).muscles.find(r => r.m === "chest").freq);

  /* ================= PROGRESS ================= */
  const L2 = [{ id:"x", load_portability:"absolute", muscles:[{m:"chest",role:"primary"}] }];
  const dl = [
    { date:"2026-01-01", finished:true, week:1, day:1, mesoId:"m", sets:[{done:true,exId:"x",load:200,reps:10,rir:2}] },
    { date:"2026-01-08", finished:true, week:2, day:1, mesoId:"m", sets:[{done:true,exId:"x",load:205,reps:10,rir:1}] },
    { date:"2026-01-15", finished:true, week:3, day:1, mesoId:"m", sets:[{done:true,exId:"x",load:100,reps:5,rir:5}] }
  ];
  // 🔑 The bug that would have shipped: without the RIR<=4 gate this reads as a 52% collapse in
  // the exact week RP says the growth lands. Only visible in week 5 of a 5-week test.
  eq("deload sets are excluded from the strength series", e1rmSeries(dl, L2, "x").length, 2);
  ok("...so the deload does NOT read as a collapse", trendFit(e1rmSeries(dl, L2, "x")).total > -0.02);
  ok("the OLD e1rmTrend is now deload-safe too", (e1rmTrend(dl, "x", 2) || {pct:0}).pct > -0.02);

  // The prescription is e1RM-neutral: obeying it is not an achievement
  eq("following the RIR calendar does NOT mint a PR", replayPRs(dl.slice(0,2), L2).length, 0);
  ok("a 20-rep set is not an e1RM PR over a 10-rep set (Epley's error grows with R)",
     replayPRs([
       { date:"2026-02-01", finished:true, week:1, day:1, sets:[{done:true,exId:"x",load:200,reps:10,rir:2}] },
       { date:"2026-02-08", finished:true, week:2, day:1, sets:[{done:true,exId:"x",load:120,reps:20,rir:2}] }
     ], L2).every(p => p.kind !== "e1rm"));

  // Refusing to claim is a first-class answer
  eq("a flat series reports 'flat', never 'down'", trendFit([1,2,3,4,5].map(() => ({e:280}))).verdict, "flat");
  eq("3 points refuse to claim a trend", trendFit([{e:270},{e:280},{e:292}]).verdict, "building");
  eq("a real trend IS claimed", trendFit([{e:280},{e:279},{e:285},{e:288},{e:292}]).verdict, "up");
  ok("median-of-3 leaves the endpoints alone (smoothing the last point smooths the answer)",
     smooth3([{e:1},{e:99},{e:3},{e:4},{e:5}])[0].e === 1 && smooth3([{e:1},{e:99},{e:3},{e:4},{e:5}])[4].e === 5);
  eq("...and deletes the one-off spike", smooth3([{e:1},{e:99},{e:3},{e:4},{e:5}])[1].e, 3);

  // Machine loads never cross instances
  eq("machine-relative sets are instance-scoped",
     trendKey({exId:"lat",instanceId:"c_lat"}, {load_portability:"machine_relative"}), "lat@c_lat");
  eq("free-weight sets are absolute", trendKey({exId:"x",instanceId:"h_db"}, {load_portability:"absolute"}), "x");
  eq("countableSet rejects RIR 5 (the deload gate)", countableSet({done:true,load:100,reps:5,rir:5}), false);
  eq("countableSet rejects a 3-rep set [PUB: 5-30]", countableSet({done:true,load:100,reps:3,rir:1}), false);

  const fails = t.filter(x => !x.ok);
  console.table(t.map(x => ({ test: x.n, ok: x.ok ? "✅" : "❌", got: JSON.stringify(x.got) })));
  console.log(fails.length ? `❌ ${fails.length}/${t.length} FAILED` : `✅ all ${t.length} passed`);
  return { pass: fails.length === 0, total: t.length, fails };
}

return {
  CFG, LANDMARKS, MG_LABEL, MG_LOWER, CATEGORY, CAT_COLOR, REST, EMPHASIS, PF, ACTION,
  MG_GROUP, groupOf, GROUP_LABEL, groupLabel, GROUPS, groupMuscles,
  SORENESS, PUMP, WORKLOAD, JOINT,
  landmarks, band, setDelta, applyDelta, performanceScore, mrvHit, recoverySession, resumeVolume,
  rirForWeek, rirFloor, isDeload, deloadPrescription, deloadDrops,
  epley, loadFor, progress, matchReps, setBadge, minFrequency, splitFor,
  // splits
  SPLITS, splitById, DAY_MUSCLES, DAY_LABEL, SPREADABLE, REP_LADDER,
  planVolume, targetFreq, splitStatus, splitsFor, recommendSplit, scoreSplit,
  assignDays, orderDay, repRangeFor, sessionMinutes, fullBodyRationale,
  // selection
  loadPlan, resolveEquipment, selectForSlot, pickBackups, scoreExercise,
  planMinutes, warmupSeconds, warmupSets, SETUP_SEC, WORK_SEC, buildEmphasis, previewFocus,
  MACHINE_CATALOG, machineUnlocks, machineInstance,
  loadKey, ratio, targetLoad, learnRatio, weeklyVolume, repBucket, minUsableLoad, floorPenalty,
  // progress
  countableSet, trendKey, e1rmSeries, keysForMuscle, smooth3, trendFit,
  volumeByWeek, bandState, replayPRs, e1rmTrend,
  verify
};
})();
