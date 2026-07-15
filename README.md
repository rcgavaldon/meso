# Meso 🏋

RP-style hypertrophy training for Robert & Nina. Offline-first PWA, no backend, $0.

A clone of the [RP Hypertrophy App](https://apps.apple.com/us/app/rp-hypertrophy/id1555614554)'s look and
autoregulation logic — plus the one thing RP doesn't have: **it knows what equipment your gym actually has.**

## Why this exists

RP's app is genuinely good and the training science is theirs, not ours. Three things it doesn't do:

| | RP | Meso |
|---|---|---|
| **Works in a gym with no signal** | ❌ No offline support at all (confirmed in their bundle — no precache, no local store). It's their #1 review complaint: *"Gym wifi went out and app won't even load on cell data."* | ✅ Local-first. The network is never in the write path. |
| **Remembers you between mesocycles** | ❌ *"It doesn't even remember your stats from one meso plan to the next. So you start over every six weeks."* | ✅ `loadState` is keyed per (user, exercise) and survives meso boundaries. |
| **Knows your gym** | ❌ Tags exercises with equipment but never asks what you own. | ✅ Pick your gym → it only prescribes what's there. Machine taken? One tap for the next best thing. |
| **Rest timer** | ❌ Refused on principle | ✅ Using RP's own published rest times |

## Stack

Single-page PWA. `index.html` + three JS files + a service worker. GitHub Pages. IndexedDB local,
Google Sheet as the durable record. No build step, no framework, no server.

```
index.html          markup + the design system (RP's real daisyUI tokens)
js/db.js            IndexedDB (system of record) + prefs
js/engine.js        ⭐ the training engine — pure functions, 50 self-tests
js/app.js           UI, routing, the in-gym logging loop
data/exercises.js   exercise library
sw.js               cache-first app shell
apps-script.gs      Google Sheet backup (paste into your Sheet)
```

## Setup

1. **Host it.** Push to GitHub → Settings ▸ Pages ▸ deploy from `main`.
2. **Add it to your phone.** Open the Pages URL in Safari/Chrome → Share ▸ Add to Home Screen.
   It works offline from then on.
3. **Set up backup** (do this before you log anything you'd hate to lose):
   open `apps-script.gs`, follow the header comment, paste the `/exec` URL into **More ▸ Backup**.
4. **Create a mesocycle.** Pick days/week and length. It builds itself from your emphasis settings
   and the volume landmarks.

## Data durability

**The phone is a cache. The Sheet is the system of record.** Reframed that way, browser eviction
stops being a threat model.

- IndexedDB primary + `navigator.storage.persist()`. The grant is a nice-to-have and we never rely on it —
  iOS eviction behavior for home-screen PWAs shifts between Safari versions.
- Append-only snapshot to the Sheet at every session end. Every sync is a restore point, not an overwrite.
- Keyed by user, so two phones never clobber each other.
- "Restore from Sheet" on a new phone + Export JSON.
- The home screen always shows when you last backed up. **Silent sync failure is the same as no sync.**

## The engine

Run `ENGINE.verify()` in the console (or **More ▸ Run engine self-check**) — 50 tests asserting that
this reproduces RP's *published* rules.

**The dependency order is the whole design:** RIR is a fixed calendar · volume is feedback-driven ·
reps are held constant · **load is the solved variable.**

Four things a naive clone gets wrong, all covered by tests:

1. **"Pushed my limits" is a hard gate, not a weighted input.** Mike, verbatim: *"it won't increase your
   sets no matter what you rate for pump or soreness or anything else."*
2. **Performance is computed, not asked.** RP's book asks you to self-score it; the app has your logs, so
   it computes it and spends its four questions on soreness/pump/workload/joint pain instead.
3. **Joint pain is an exercise-swap criterion, not a volume knob.**
4. **Volume counts DIRECT sets only.** Indirect volume is pre-baked into RP's landmark numbers — bench
   does not add to triceps. Counting fractionally against those tables under-prescribes.

### Where we deliberately differ from RP

- **Soreness is asked before the workout, batched.** RP asks it lazily per muscle group mid-session, by
  which point you're warm and the signal is gone. From one of their own 5★ reviews: *"once I'm warmed up
  and lifting, I've kinda stopped feeling sore and sometimes forget which muscles were sore."* Same
  question, same scale, better data.
- **Feedback is always skippable** with a sane default. If the modal is friction it gets fake-answered,
  the progression math turns to noise, and the app's whole value quietly dies.
- **Travel sessions** (`off_plan`) count toward weekly volume but are excluded from e1RM trend. Otherwise
  a hotel's 50lb dumbbell ceiling reads as detraining and you deload for nothing.

### Config — the genuinely ambiguous calls

RP contradicts itself on each of these. Surfaced in `ENGINE.CFG` rather than buried:

| | Default | Why |
|---|---|---|
| `rirStart` | `2` | The app opens at 2 RIR (Mike, demoing it). RP's *book* says 3. We clone the app. |
| `deloadTo` | `"mev"` | The back guide says MEV; the Volume Landmarks article says MV. |
| `countDirect` | `true` | RP uses both direct and fractional counting in different articles. The landmarks are calibrated for direct. |

Volume landmarks use RP's newer blog tables (with the `*P` priority columns), which map cleanly onto
the app's Emphasize / Grow / Maintain: **Emphasize** ramps to MRV\*P · **Grow** caps at MAV · **Maintain**
holds at MV. That reconciles the two incompatible RP datasets — the help center's frequency-scaled MRV
≈ the blog's MRV\*P.

> ⚠️ The **Back** landmark row is published by RP only as a PNG. Text extraction of that page returns
> nothing and will happily hallucinate a plausible-looking table. Those numbers were read off the image.

## Notes for future me

- `sw.js` **caches** — unlike `garden-tracker/sw.js`, which deliberately doesn't ("so the app never goes
  stale"). That's right for a backyard on wifi and wrong for a gym. Bump `CACHE` on every deploy.
- `apps-script.gs` keys everything by user. Sprout's version writes a whole-blob snapshot and rebuilds
  its tabs with `table_()` — with two phones, last writer wins and the other's history is gone.
- Progression state lives on the **slot**, not the exercise. That's what makes substitution non-destructive.
- Load history never transfers across exercises. Cross-exercise estimates go through an e1RM ratio,
  shown *as* an estimate, corrected by a calibration set, personal after ~3 exposures.
- `canReach()` checks the **floor** as well as the ceiling. For Nina the floor usually binds — a 15lb
  minimum pin or the 45lb bar can be too heavy. Same gym, different eligible exercises per person.
