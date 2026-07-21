// Meso — exercise library. Hand-rated in one pass for scale consistency.
// Rating anchors (do not drift):
//   stability_demand 1=fully supported · 2=cable/braced · 3=DB on bench · 4=standing free weight · 5=unsupported heavy
//   sfr 5=huge stimulus / trivial cost · 1=brutal cost per unit stimulus
//   ratio_anchors: r = e1RM(self)/e1RM(target) IN EACH ENTRY'S OWN load_unit. Anchor to family hub only;
//   hubs anchor to each other. Composition is transitive.

window.MESO_EXERCISES = [

  /* ======================= CHEST ======================= */

  {
    id: "bb_flat_bench",
    name: "Barbell Bench Press",
    aliases: ["flat bench", "bench press", "bb bench"],
    family: "flat_press",
    hub: true,
    pattern: "horizontal_press",
    muscles: [
      { m: "chest", role: "primary", contribution: 1.0 },
      { m: "triceps", role: "secondary", contribution: 0.5 },
      { m: "front_delt", role: "secondary", contribution: 0.5 }
    ],
    requires: { any: [ { all: [ {cap:"barbell"}, {cap:"bench"}, {cap:"squat_rack"} ] } ] },
    load_unit: "total_bar_load",
    load_portability: "absolute",
    profile: { resistance_peak: "mid", stretch_emphasis: 3, rom_score: 3, shortened_overload: 2 },
    ratings: { rp_tier: {chest:"A", triceps:"B", front_delt:"B"}, sfr: 3, target_specificity: 3, stability_demand: 3, technique_demand: 3, injury_risk: 3, setup_cost: 3 },
    fatigue: { systemic: 3, local: 3 },
    unilateral: false, unilateral_capable: false, failure_safe: false,
    rep_suitability: { "5_8": 1.0, "8_12": 0.9, "12_20": 0.5, "20_30": 0.2 },
    variants: { grip: ["pronated"], width: ["competition","moderate","wide"] },
    ratio_anchors: {},
    min_effective_load_hint: { bar_lb: 45 }
  },

  {
    id: "db_flat_press",
    name: "Flat Dumbbell Press",
    aliases: ["db bench", "dumbbell bench press"],
    family: "flat_press",
    hub: false,
    pattern: "horizontal_press",
    muscles: [
      { m: "chest", role: "primary", contribution: 1.0 },
      { m: "triceps", role: "secondary", contribution: 0.4 },
      { m: "front_delt", role: "secondary", contribution: 0.45 }
    ],
    requires: { any: [ { all: [ {cap:"dumbbell"}, {cap:"bench"} ] } ] },
    load_unit: "per_dumbbell",
    load_portability: "absolute",
    profile: { resistance_peak: "stretch", stretch_emphasis: 4, rom_score: 4, shortened_overload: 1 },
    ratings: { rp_tier: {chest:"S", triceps:"C", front_delt:"B"}, sfr: 4, target_specificity: 4, stability_demand: 3, technique_demand: 2, injury_risk: 2, setup_cost: 2 },
    fatigue: { systemic: 3, local: 4 },
    unilateral: false, unilateral_capable: true, failure_safe: true,
    rep_suitability: { "5_8": 0.7, "8_12": 1.0, "12_20": 0.8, "20_30": 0.4 },
    variants: { grip: ["pronated","neutral"] },
    ratio_anchors: { bb_flat_bench: {r:0.36, c:0.7} },
    min_effective_load_hint: { per_hand_lb: 10 }
  },

  {
    id: "machine_chest_press",
    name: "Machine Chest Press",
    aliases: ["seated chest press", "hammer strength press"],
    family: "flat_press",
    hub: false,
    pattern: "horizontal_press",
    muscles: [
      { m: "chest", role: "primary", contribution: 1.0 },
      { m: "triceps", role: "secondary", contribution: 0.4 },
      { m: "front_delt", role: "secondary", contribution: 0.4 }
    ],
    requires: { any: [ { all: [ {cap:"machine", machine_key:"chest_press"} ] } ] },
    load_unit: "stack_pin",
    load_portability: "machine_relative",
    profile: { resistance_peak: "mid", stretch_emphasis: 3, rom_score: 3, shortened_overload: 3 },
    ratings: { rp_tier: {chest:"A", triceps:"C", front_delt:"C"}, sfr: 4, target_specificity: 4, stability_demand: 1, technique_demand: 1, injury_risk: 1, setup_cost: 1 },
    fatigue: { systemic: 2, local: 4 },
    unilateral: false, unilateral_capable: true, failure_safe: true,
    rep_suitability: { "5_8": 0.7, "8_12": 1.0, "12_20": 0.9, "20_30": 0.5 },
    ratio_anchors: { bb_flat_bench: {r:0.8, c:0.25} },
    min_effective_load_hint: { stack_min_lb: 15 }
  },

  {
    id: "bb_incline_press",
    name: "Incline Barbell Press",
    aliases: ["incline bench", "bb incline"],
    family: "incline_press",
    hub: true,
    pattern: "horizontal_press",
    muscles: [
      { m: "chest", role: "primary", contribution: 1.0 },
      { m: "front_delt", role: "secondary", contribution: 0.6 },
      { m: "triceps", role: "secondary", contribution: 0.45 }
    ],
    requires: { any: [ { all: [ {cap:"barbell"}, {cap:"adjustable_bench"}, {cap:"squat_rack"} ] } ] },
    load_unit: "total_bar_load",
    load_portability: "absolute",
    profile: { resistance_peak: "mid", stretch_emphasis: 3, rom_score: 3, shortened_overload: 2 },
    ratings: { rp_tier: {chest:"A", front_delt:"B", triceps:"C"}, sfr: 3, target_specificity: 3, stability_demand: 3, technique_demand: 3, injury_risk: 3, setup_cost: 3 },
    fatigue: { systemic: 3, local: 3 },
    unilateral: false, unilateral_capable: false, failure_safe: false,
    rep_suitability: { "5_8": 1.0, "8_12": 0.9, "12_20": 0.5, "20_30": 0.2 },
    variants: { angle_deg: [30,45] },
    ratio_anchors: { bb_flat_bench: {r:0.84, c:0.7} },
    min_effective_load_hint: { bar_lb: 45 }
  },

  {
    id: "db_incline_press",
    name: "Incline Dumbbell Press",
    aliases: ["incline db bench", "incline dumbbell bench press"],
    family: "incline_press",
    hub: false,
    pattern: "horizontal_press",
    muscles: [
      { m: "chest", role: "primary", contribution: 1.0 },
      { m: "front_delt", role: "secondary", contribution: 0.55 },
      { m: "triceps", role: "secondary", contribution: 0.4 }
    ],
    requires: { any: [ { all: [ {cap:"dumbbell"}, {cap:"adjustable_bench"} ] } ] },
    load_unit: "per_dumbbell",
    load_portability: "absolute",
    profile: { resistance_peak: "stretch", stretch_emphasis: 4, rom_score: 5, shortened_overload: 1 },
    ratings: { rp_tier: {chest:"S", front_delt:"B", triceps:"C"}, sfr: 4, target_specificity: 4, stability_demand: 3, technique_demand: 3, injury_risk: 2, setup_cost: 2 },
    fatigue: { systemic: 3, local: 4 },
    unilateral: false, unilateral_capable: true, failure_safe: true,
    rep_suitability: { "5_8": 0.8, "8_12": 1.0, "12_20": 0.7, "20_30": 0.4 },
    variants: { angle_deg: [30,45], grip: ["neutral","pronated"] },
    ratio_anchors: { bb_incline_press: {r:0.37, c:0.6} },
    min_effective_load_hint: { per_hand_lb: 10 }
  },

  {
    id: "incline_press_machine",
    name: "Incline Press Machine",
    aliases: ["machine incline press"],
    family: "incline_press",
    hub: false,
    pattern: "horizontal_press",
    muscles: [
      { m: "chest", role: "primary", contribution: 1.0 },
      { m: "front_delt", role: "secondary", contribution: 0.5 },
      { m: "triceps", role: "secondary", contribution: 0.4 }
    ],
    requires: { any: [ { all: [ {cap:"machine", machine_key:"incline_press_machine"} ] } ] },
    load_unit: "stack_pin",
    load_portability: "machine_relative",
    profile: { resistance_peak: "mid", stretch_emphasis: 3, rom_score: 3, shortened_overload: 3 },
    ratings: { rp_tier: {chest:"A", front_delt:"C", triceps:"C"}, sfr: 4, target_specificity: 4, stability_demand: 1, technique_demand: 1, injury_risk: 1, setup_cost: 1 },
    fatigue: { systemic: 2, local: 4 },
    unilateral: false, unilateral_capable: true, failure_safe: true,
    rep_suitability: { "5_8": 0.7, "8_12": 1.0, "12_20": 0.9, "20_30": 0.5 },
    ratio_anchors: { bb_incline_press: {r:0.79, c:0.25} },
    min_effective_load_hint: { stack_min_lb: 15 }
  },

  {
    id: "smith_incline_press",
    name: "Smith Machine Incline Press",
    aliases: ["smith incline"],
    family: "incline_press",
    hub: false,
    pattern: "horizontal_press",
    muscles: [
      { m: "chest", role: "primary", contribution: 1.0 },
      { m: "front_delt", role: "secondary", contribution: 0.55 },
      { m: "triceps", role: "secondary", contribution: 0.45 }
    ],
    requires: { any: [ { all: [ {cap:"smith"}, {cap:"adjustable_bench"} ] } ] },
    load_unit: "total_bar_load",
    load_portability: "machine_relative",
    profile: { resistance_peak: "mid", stretch_emphasis: 3, rom_score: 3, shortened_overload: 2 },
    ratings: { rp_tier: {chest:"A", front_delt:"C", triceps:"C"}, sfr: 4, target_specificity: 3, stability_demand: 2, technique_demand: 2, injury_risk: 2, setup_cost: 2 },
    fatigue: { systemic: 2, local: 4 },
    unilateral: false, unilateral_capable: false, failure_safe: true,
    rep_suitability: { "5_8": 0.9, "8_12": 1.0, "12_20": 0.7, "20_30": 0.3 },
    variants: { angle_deg: [30,45] },
    ratio_anchors: { bb_incline_press: {r:1.05, c:0.4} },
    min_effective_load_hint: { bar_lb: 20 }
  },

  {
    id: "dip",
    name: "Chest Dip",
    aliases: ["dips", "weighted dip", "parallel bar dip"],
    family: "dip",
    hub: true,
    pattern: "horizontal_press",
    muscles: [
      { m: "chest", role: "primary", contribution: 1.0 },
      { m: "triceps", role: "primary", contribution: 0.8 },
      { m: "front_delt", role: "secondary", contribution: 0.4 }
    ],
    requires: { any: [ { all: [ {cap:"dip_station"} ] }, { all: [ {cap:"bodyweight_loadable"}, {cap:"dip_station"} ] } ] },
    load_unit: "bodyweight_plus",
    load_portability: "absolute",
    profile: { resistance_peak: "stretch", stretch_emphasis: 5, rom_score: 4, shortened_overload: 2 },
    ratings: { rp_tier: {chest:"A", triceps:"S", front_delt:"C"}, sfr: 3, target_specificity: 3, stability_demand: 4, technique_demand: 3, injury_risk: 3, setup_cost: 2 },
    fatigue: { systemic: 3, local: 4 },
    unilateral: false, unilateral_capable: false, failure_safe: true,
    rep_suitability: { "5_8": 0.9, "8_12": 1.0, "12_20": 0.7, "20_30": 0.3 },
    variants: { grip: ["neutral"], lean: ["upright","forward"] },
    ratio_anchors: { bb_flat_bench: {r:0.4, c:0.3} },
    min_effective_load_hint: { note: "bodyweight floor — may be too heavy for a light or novice lifter; use assisted_pullup station or bench_dip" }
  },

  {
    id: "bench_dip",
    name: "Bench Dip",
    aliases: ["tricep bench dip"],
    family: "dip",
    hub: false,
    pattern: "horizontal_press",
    muscles: [
      { m: "triceps", role: "primary", contribution: 1.0 },
      { m: "chest", role: "secondary", contribution: 0.3 },
      { m: "front_delt", role: "secondary", contribution: 0.3 }
    ],
    requires: { any: [ { all: [ {cap:"bench"} ] }, { all: [ {cap:"bodyweight_only"} ] } ] },
    load_unit: "bodyweight_plus",
    load_portability: "absolute",
    profile: { resistance_peak: "stretch", stretch_emphasis: 4, rom_score: 3, shortened_overload: 2 },
    ratings: { rp_tier: {triceps:"C", chest:"D", front_delt:"D"}, sfr: 3, target_specificity: 3, stability_demand: 3, technique_demand: 2, injury_risk: 3, setup_cost: 1 },
    fatigue: { systemic: 2, local: 3 },
    unilateral: false, unilateral_capable: false, failure_safe: true,
    rep_suitability: { "5_8": 0.4, "8_12": 0.9, "12_20": 1.0, "20_30": 0.7 },
    ratio_anchors: { dip: {r:0.5, c:0.2} }
  },

  {
    id: "pushup",
    name: "Push-Up",
    aliases: ["press up", "push up"],
    family: "pushup",
    hub: true,
    pattern: "horizontal_press",
    muscles: [
      { m: "chest", role: "primary", contribution: 1.0 },
      { m: "triceps", role: "secondary", contribution: 0.5 },
      { m: "front_delt", role: "secondary", contribution: 0.4 },
      { m: "abs", role: "secondary", contribution: 0.25 }
    ],
    requires: { any: [ { all: [ {cap:"bodyweight_only"} ] } ] },
    load_unit: "bodyweight_plus",
    load_portability: "absolute",
    profile: { resistance_peak: "stretch", stretch_emphasis: 3, rom_score: 3, shortened_overload: 2 },
    ratings: { rp_tier: {chest:"B", triceps:"C", front_delt:"C", abs:"D"}, sfr: 4, target_specificity: 3, stability_demand: 3, technique_demand: 1, injury_risk: 1, setup_cost: 1 },
    fatigue: { systemic: 2, local: 3 },
    unilateral: false, unilateral_capable: false, failure_safe: true,
    rep_suitability: { "5_8": 0.3, "8_12": 0.8, "12_20": 1.0, "20_30": 0.9 },
    variants: { width: ["standard","wide"], elevation: ["floor","feet_elevated","hands_elevated"] },
    ratio_anchors: { bb_flat_bench: {r:0.35, c:0.25} }
  },

  {
    id: "band_chest_press",
    name: "Band Chest Press",
    aliases: ["banded press"],
    family: "pushup",
    hub: false,
    pattern: "horizontal_press",
    muscles: [
      { m: "chest", role: "primary", contribution: 1.0 },
      { m: "triceps", role: "secondary", contribution: 0.45 },
      { m: "front_delt", role: "secondary", contribution: 0.4 }
    ],
    requires: { any: [ { all: [ {cap:"band"} ] } ] },
    load_unit: "band_tension",
    load_portability: "absolute",
    profile: { resistance_peak: "shortened", stretch_emphasis: 1, rom_score: 3, shortened_overload: 5 },
    ratings: { rp_tier: {chest:"C", triceps:"D", front_delt:"D"}, sfr: 3, target_specificity: 3, stability_demand: 3, technique_demand: 2, injury_risk: 1, setup_cost: 2 },
    fatigue: { systemic: 2, local: 3 },
    unilateral: false, unilateral_capable: true, failure_safe: true,
    rep_suitability: { "5_8": 0.2, "8_12": 0.7, "12_20": 1.0, "20_30": 0.9 },
    ratio_anchors: { pushup: {r:0.4, c:0.15} }
  },

  {
    id: "db_fly",
    name: "Dumbbell Fly",
    aliases: ["flat db fly", "dumbbell flye"],
    family: "fly",
    hub: true,
    pattern: "fly",
    muscles: [
      { m: "chest", role: "primary", contribution: 1.0 },
      { m: "front_delt", role: "secondary", contribution: 0.2 }
    ],
    requires: { any: [ { all: [ {cap:"dumbbell"}, {cap:"bench"} ] } ] },
    load_unit: "per_dumbbell",
    load_portability: "absolute",
    profile: { resistance_peak: "stretch", stretch_emphasis: 5, rom_score: 5, shortened_overload: 1 },
    ratings: { rp_tier: {chest:"A", front_delt:"D"}, sfr: 4, target_specificity: 5, stability_demand: 3, technique_demand: 3, injury_risk: 3, setup_cost: 2 },
    fatigue: { systemic: 1, local: 3 },
    unilateral: false, unilateral_capable: true, failure_safe: true,
    rep_suitability: { "5_8": 0.2, "8_12": 0.9, "12_20": 1.0, "20_30": 0.6 },
    variants: { angle_deg: [0,30] },
    ratio_anchors: { bb_flat_bench: {r:0.18, c:0.5} },
    min_effective_load_hint: { per_hand_lb: 5 }
  },

  {
    id: "cable_fly",
    name: "Cable Fly",
    aliases: ["cable crossover", "cable flye"],
    family: "fly",
    hub: false,
    pattern: "fly",
    muscles: [
      { m: "chest", role: "primary", contribution: 1.0 },
      { m: "front_delt", role: "secondary", contribution: 0.2 }
    ],
    requires: { any: [ { all: [ {cap:"cable"} ] }, { all: [ {cap:"freemotion"} ] } ] },
    load_unit: "stack_pin",
    load_portability: "machine_relative",
    profile: { resistance_peak: "flat", stretch_emphasis: 4, rom_score: 5, shortened_overload: 4 },
    ratings: { rp_tier: {chest:"S", front_delt:"D"}, sfr: 5, target_specificity: 5, stability_demand: 2, technique_demand: 2, injury_risk: 1, setup_cost: 2 },
    fatigue: { systemic: 1, local: 3 },
    unilateral: false, unilateral_capable: true, failure_safe: true,
    rep_suitability: { "5_8": 0.2, "8_12": 0.9, "12_20": 1.0, "20_30": 0.7 },
    variants: { angle: ["high_to_low","mid","low_to_high"] },
    ratio_anchors: { db_fly: {r:0.9, c:0.3} },
    min_effective_load_hint: { stack_min_lb: 10 }
  },

  {
    id: "pec_deck",
    name: "Pec Deck",
    aliases: ["machine fly", "butterfly"],
    family: "fly",
    hub: false,
    pattern: "fly",
    muscles: [
      { m: "chest", role: "primary", contribution: 1.0 }
    ],
    requires: { any: [ { all: [ {cap:"machine", machine_key:"pec_deck"} ] } ] },
    load_unit: "stack_pin",
    load_portability: "machine_relative",
    profile: { resistance_peak: "flat", stretch_emphasis: 4, rom_score: 4, shortened_overload: 4 },
    ratings: { rp_tier: {chest:"S"}, sfr: 5, target_specificity: 5, stability_demand: 1, technique_demand: 1, injury_risk: 1, setup_cost: 1 },
    fatigue: { systemic: 1, local: 3 },
    unilateral: false, unilateral_capable: true, failure_safe: true,
    rep_suitability: { "5_8": 0.3, "8_12": 1.0, "12_20": 1.0, "20_30": 0.7 },
    ratio_anchors: { db_fly: {r:3.0, c:0.2} },
    min_effective_load_hint: { stack_min_lb: 15 }
  },

  {
    id: "band_fly",
    name: "Band Fly",
    aliases: ["banded crossover"],
    family: "fly",
    hub: false,
    pattern: "fly",
    muscles: [
      { m: "chest", role: "primary", contribution: 1.0 }
    ],
    requires: { any: [ { all: [ {cap:"band"} ] } ] },
    load_unit: "band_tension",
    load_portability: "absolute",
    profile: { resistance_peak: "shortened", stretch_emphasis: 2, rom_score: 4, shortened_overload: 5 },
    ratings: { rp_tier: {chest:"C"}, sfr: 4, target_specificity: 4, stability_demand: 2, technique_demand: 2, injury_risk: 1, setup_cost: 2 },
    fatigue: { systemic: 1, local: 3 },
    unilateral: false, unilateral_capable: true, failure_safe: true,
    rep_suitability: { "5_8": 0.1, "8_12": 0.6, "12_20": 1.0, "20_30": 0.9 },
    ratio_anchors: { db_fly: {r:0.5, c:0.15} }
  },

  /* ======================= BACK / LATS ======================= */

  {
    id: "lat_pulldown",
    name: "Lat Pulldown",
    aliases: ["pulldown", "cable pulldown"],
    family: "vertical_pull",
    hub: true,
    pattern: "vertical_pull",
    muscles: [
      { m: "back", role: "primary", contribution: 1.0 },
      { m: "biceps", role: "secondary", contribution: 0.5 },
      { m: "rear_delt", role: "secondary", contribution: 0.3 }
    ],
    requires: { any: [ { all: [ {cap:"machine", machine_key:"lat_pulldown"} ] }, { all: [ {cap:"cable"}, {cap:"high_pulley"} ] } ] },
    load_unit: "stack_pin",
    load_portability: "machine_relative",
    profile: { resistance_peak: "stretch", stretch_emphasis: 4, rom_score: 4, shortened_overload: 3 },
    ratings: { rp_tier: {back:"S", biceps:"B", rear_delt:"C"}, sfr: 5, target_specificity: 4, stability_demand: 2, technique_demand: 2, injury_risk: 1, setup_cost: 1 },
    fatigue: { systemic: 2, local: 4 },
    unilateral: false, unilateral_capable: true, failure_safe: true,
    rep_suitability: { "5_8": 0.7, "8_12": 1.0, "12_20": 0.9, "20_30": 0.5 },
    variants: { grip: ["pronated","neutral","supinated"], width: ["wide","shoulder","narrow"] },
    ratio_anchors: {},
    min_effective_load_hint: { stack_min_lb: 15 }
  },

  {
    id: "pullup",
    name: "Pull-Up",
    aliases: ["pull up", "weighted pullup"],
    family: "vertical_pull",
    hub: false,
    pattern: "vertical_pull",
    muscles: [
      { m: "back", role: "primary", contribution: 1.0 },
      { m: "biceps", role: "secondary", contribution: 0.5 },
      { m: "rear_delt", role: "secondary", contribution: 0.3 },
      { m: "abs", role: "secondary", contribution: 0.2 }
    ],
    requires: { any: [ { all: [ {cap:"pullup_bar"} ] }, { all: [ {cap:"bodyweight_loadable"}, {cap:"pullup_bar"} ] } ] },
    load_unit: "bodyweight_plus",
    load_portability: "absolute",
    profile: { resistance_peak: "stretch", stretch_emphasis: 4, rom_score: 4, shortened_overload: 2 },
    ratings: { rp_tier: {back:"A", biceps:"B", rear_delt:"C", abs:"D"}, sfr: 4, target_specificity: 3, stability_demand: 4, technique_demand: 3, injury_risk: 2, setup_cost: 1 },
    fatigue: { systemic: 3, local: 4 },
    unilateral: false, unilateral_capable: false, failure_safe: true,
    rep_suitability: { "5_8": 1.0, "8_12": 0.9, "12_20": 0.6, "20_30": 0.2 },
    variants: { grip: ["pronated","neutral"], width: ["wide","shoulder"] },
    ratio_anchors: { lat_pulldown: {r:0.5, c:0.3} },
    min_effective_load_hint: { note: "bodyweight floor — a lighter lifter often cannot reach failure in range; use assisted_pullup or lat_pulldown" }
  },

  {
    id: "chinup",
    name: "Chin-Up",
    aliases: ["chin up", "supinated pullup"],
    family: "vertical_pull",
    hub: false,
    pattern: "vertical_pull",
    muscles: [
      { m: "back", role: "primary", contribution: 1.0 },
      { m: "biceps", role: "primary", contribution: 0.75 },
      { m: "abs", role: "secondary", contribution: 0.2 }
    ],
    requires: { any: [ { all: [ {cap:"pullup_bar"} ] }, { all: [ {cap:"bodyweight_loadable"}, {cap:"pullup_bar"} ] } ] },
    load_unit: "bodyweight_plus",
    load_portability: "absolute",
    profile: { resistance_peak: "stretch", stretch_emphasis: 4, rom_score: 4, shortened_overload: 2 },
    ratings: { rp_tier: {back:"A", biceps:"A", abs:"D"}, sfr: 4, target_specificity: 3, stability_demand: 4, technique_demand: 3, injury_risk: 2, setup_cost: 1 },
    fatigue: { systemic: 3, local: 4 },
    unilateral: false, unilateral_capable: false, failure_safe: true,
    rep_suitability: { "5_8": 1.0, "8_12": 0.9, "12_20": 0.6, "20_30": 0.2 },
    ratio_anchors: { lat_pulldown: {r:0.56, c:0.3} },
    min_effective_load_hint: { note: "bodyweight floor; see pullup" }
  },

  {
    id: "assisted_pullup",
    name: "Assisted Pull-Up",
    aliases: ["assisted chin", "gravitron"],
    family: "vertical_pull",
    hub: false,
    pattern: "vertical_pull",
    muscles: [
      { m: "back", role: "primary", contribution: 1.0 },
      { m: "biceps", role: "secondary", contribution: 0.5 }
    ],
    requires: { any: [ { all: [ {cap:"machine_assistance", machine_key:"assisted_pullup"} ] }, { all: [ {cap:"band"}, {cap:"pullup_bar"} ] } ] },
    load_unit: "stack_pin",
    load_portability: "machine_relative",
    profile: { resistance_peak: "stretch", stretch_emphasis: 4, rom_score: 4, shortened_overload: 2 },
    ratings: { rp_tier: {back:"A", biceps:"B"}, sfr: 4, target_specificity: 3, stability_demand: 2, technique_demand: 2, injury_risk: 1, setup_cost: 1 },
    fatigue: { systemic: 2, local: 4 },
    unilateral: false, unilateral_capable: false, failure_safe: true,
    rep_suitability: { "5_8": 0.7, "8_12": 1.0, "12_20": 0.8, "20_30": 0.4 },
    variants: { grip: ["pronated","neutral","supinated"] },
    ratio_anchors: { lat_pulldown: {r:0.4, c:0.15} }
  },

  {
    id: "band_pulldown",
    name: "Band Lat Pulldown",
    aliases: ["banded pulldown", "band overhead pull"],
    family: "vertical_pull",
    hub: false,
    pattern: "vertical_pull",
    muscles: [
      { m: "back", role: "primary", contribution: 1.0 },
      { m: "biceps", role: "secondary", contribution: 0.4 }
    ],
    requires: { any: [ { all: [ {cap:"band"} ] } ] },
    load_unit: "band_tension",
    load_portability: "absolute",
    profile: { resistance_peak: "shortened", stretch_emphasis: 2, rom_score: 4, shortened_overload: 5 },
    ratings: { rp_tier: {back:"C", biceps:"D"}, sfr: 4, target_specificity: 3, stability_demand: 2, technique_demand: 2, injury_risk: 1, setup_cost: 2 },
    fatigue: { systemic: 1, local: 3 },
    unilateral: false, unilateral_capable: true, failure_safe: true,
    rep_suitability: { "5_8": 0.1, "8_12": 0.6, "12_20": 1.0, "20_30": 0.9 },
    ratio_anchors: { lat_pulldown: {r:0.3, c:0.15} }
  },

  {
    id: "bb_row",
    name: "Barbell Row",
    aliases: ["bent over row", "pendlay row", "bb bent row"],
    family: "horizontal_row",
    hub: true,
    pattern: "horizontal_pull",
    muscles: [
      { m: "back", role: "primary", contribution: 1.0 },
      { m: "rear_delt", role: "secondary", contribution: 0.4 },
      { m: "biceps", role: "secondary", contribution: 0.4 },
      { m: "traps", role: "secondary", contribution: 0.4 },
      { m: "hamstrings", role: "secondary", contribution: 0.2 }
    ],
    requires: { any: [ { all: [ {cap:"barbell"} ] } ] },
    load_unit: "total_bar_load",
    load_portability: "absolute",
    profile: { resistance_peak: "mid", stretch_emphasis: 3, rom_score: 3, shortened_overload: 3 },
    ratings: { rp_tier: {back:"A", rear_delt:"C", biceps:"C", traps:"B"}, sfr: 3, target_specificity: 3, stability_demand: 4, technique_demand: 4, injury_risk: 3, setup_cost: 2 },
    fatigue: { systemic: 4, local: 4 },
    unilateral: false, unilateral_capable: false, failure_safe: true,
    rep_suitability: { "5_8": 1.0, "8_12": 0.9, "12_20": 0.5, "20_30": 0.2 },
    variants: { grip: ["pronated","supinated"], torso_angle: ["45","parallel"] },
    ratio_anchors: { lat_pulldown: {r:1.03, c:0.4} },
    min_effective_load_hint: { bar_lb: 45 }
  },

  {
    id: "db_row",
    name: "Single-Arm Dumbbell Row",
    aliases: ["one arm db row", "kroc row"],
    family: "horizontal_row",
    hub: false,
    pattern: "horizontal_pull",
    muscles: [
      { m: "back", role: "primary", contribution: 1.0 },
      { m: "biceps", role: "secondary", contribution: 0.4 },
      { m: "rear_delt", role: "secondary", contribution: 0.3 },
      { m: "traps", role: "secondary", contribution: 0.3 }
    ],
    requires: { any: [ { all: [ {cap:"dumbbell"}, {cap:"bench"} ] }, { all: [ {cap:"dumbbell"} ] } ] },
    load_unit: "per_dumbbell",
    load_portability: "absolute",
    profile: { resistance_peak: "stretch", stretch_emphasis: 4, rom_score: 4, shortened_overload: 3 },
    ratings: { rp_tier: {back:"A", biceps:"C", rear_delt:"C", traps:"C"}, sfr: 4, target_specificity: 4, stability_demand: 2, technique_demand: 2, injury_risk: 2, setup_cost: 2 },
    fatigue: { systemic: 2, local: 4 },
    unilateral: true, unilateral_capable: true, failure_safe: true,
    rep_suitability: { "5_8": 0.8, "8_12": 1.0, "12_20": 0.8, "20_30": 0.4 },
    ratio_anchors: { bb_row: {r:0.49, c:0.5} },
    min_effective_load_hint: { per_hand_lb: 10 }
  },

  {
    id: "cable_row",
    name: "Seated Cable Row",
    aliases: ["low row", "seated row"],
    family: "horizontal_row",
    hub: false,
    pattern: "horizontal_pull",
    muscles: [
      { m: "back", role: "primary", contribution: 1.0 },
      { m: "biceps", role: "secondary", contribution: 0.4 },
      { m: "rear_delt", role: "secondary", contribution: 0.35 },
      { m: "traps", role: "secondary", contribution: 0.35 }
    ],
    requires: { any: [ { all: [ {cap:"machine", machine_key:"seated_row"} ] }, { all: [ {cap:"cable"}, {cap:"low_pulley"} ] } ] },
    load_unit: "stack_pin",
    load_portability: "machine_relative",
    profile: { resistance_peak: "flat", stretch_emphasis: 4, rom_score: 4, shortened_overload: 4 },
    ratings: { rp_tier: {back:"S", biceps:"C", rear_delt:"C", traps:"B"}, sfr: 5, target_specificity: 4, stability_demand: 2, technique_demand: 2, injury_risk: 1, setup_cost: 1 },
    fatigue: { systemic: 2, local: 4 },
    unilateral: false, unilateral_capable: true, failure_safe: true,
    rep_suitability: { "5_8": 0.7, "8_12": 1.0, "12_20": 0.9, "20_30": 0.5 },
    variants: { grip: ["neutral","pronated","wide"] },
    ratio_anchors: { bb_row: {r:0.97, c:0.3} },
    min_effective_load_hint: { stack_min_lb: 15 }
  },

  {
    id: "machine_row",
    name: "Machine Row",
    aliases: ["hammer strength row", "iso row"],
    family: "horizontal_row",
    hub: false,
    pattern: "horizontal_pull",
    muscles: [
      { m: "back", role: "primary", contribution: 1.0 },
      { m: "biceps", role: "secondary", contribution: 0.4 },
      { m: "rear_delt", role: "secondary", contribution: 0.3 },
      { m: "traps", role: "secondary", contribution: 0.3 }
    ],
    requires: { any: [ { all: [ {cap:"machine", machine_key:"machine_row"} ] } ] },
    load_unit: "stack_pin",
    load_portability: "machine_relative",
    profile: { resistance_peak: "mid", stretch_emphasis: 4, rom_score: 4, shortened_overload: 3 },
    ratings: { rp_tier: {back:"S", biceps:"C", rear_delt:"C", traps:"C"}, sfr: 5, target_specificity: 4, stability_demand: 1, technique_demand: 1, injury_risk: 1, setup_cost: 1 },
    fatigue: { systemic: 2, local: 4 },
    unilateral: false, unilateral_capable: true, failure_safe: true,
    rep_suitability: { "5_8": 0.7, "8_12": 1.0, "12_20": 0.9, "20_30": 0.5 },
    ratio_anchors: { bb_row: {r:1.08, c:0.25} },
    min_effective_load_hint: { stack_min_lb: 15 }
  },

  {
    id: "chest_supported_row",
    name: "Chest-Supported Row",
    aliases: ["incline db row", "seal row", "csr"],
    family: "horizontal_row",
    hub: false,
    pattern: "horizontal_pull",
    muscles: [
      { m: "back", role: "primary", contribution: 1.0 },
      { m: "rear_delt", role: "secondary", contribution: 0.45 },
      { m: "traps", role: "secondary", contribution: 0.4 },
      { m: "biceps", role: "secondary", contribution: 0.4 }
    ],
    requires: { any: [ { all: [ {cap:"dumbbell"}, {cap:"adjustable_bench"} ] }, { all: [ {cap:"machine", machine_key:"machine_row"} ] } ] },
    load_unit: "per_dumbbell",
    load_portability: "absolute",
    profile: { resistance_peak: "mid", stretch_emphasis: 4, rom_score: 4, shortened_overload: 3 },
    ratings: { rp_tier: {back:"S", rear_delt:"B", traps:"B", biceps:"C"}, sfr: 5, target_specificity: 5, stability_demand: 1, technique_demand: 1, injury_risk: 1, setup_cost: 2 },
    fatigue: { systemic: 1, local: 4 },
    unilateral: false, unilateral_capable: true, failure_safe: true,
    rep_suitability: { "5_8": 0.7, "8_12": 1.0, "12_20": 0.9, "20_30": 0.5 },
    variants: { angle_deg: [15,30,45], grip: ["neutral","pronated"] },
    ratio_anchors: { bb_row: {r:0.38, c:0.35} },
    min_effective_load_hint: { per_hand_lb: 10 }
  },

  {
    id: "t_bar_row",
    name: "T-Bar Row",
    aliases: ["landmine row", "chest supported t-bar"],
    family: "horizontal_row",
    hub: false,
    pattern: "horizontal_pull",
    muscles: [
      { m: "back", role: "primary", contribution: 1.0 },
      { m: "traps", role: "secondary", contribution: 0.4 },
      { m: "biceps", role: "secondary", contribution: 0.4 },
      { m: "rear_delt", role: "secondary", contribution: 0.35 }
    ],
    requires: { any: [ { all: [ {cap:"landmine"}, {cap:"barbell"} ] }, { all: [ {cap:"machine", machine_key:"machine_row"} ] } ] },
    load_unit: "total_bar_load",
    load_portability: "absolute",
    profile: { resistance_peak: "mid", stretch_emphasis: 4, rom_score: 4, shortened_overload: 3 },
    ratings: { rp_tier: {back:"A", traps:"B", biceps:"C", rear_delt:"C"}, sfr: 4, target_specificity: 4, stability_demand: 3, technique_demand: 3, injury_risk: 2, setup_cost: 3 },
    fatigue: { systemic: 3, local: 4 },
    unilateral: false, unilateral_capable: false, failure_safe: true,
    rep_suitability: { "5_8": 0.9, "8_12": 1.0, "12_20": 0.7, "20_30": 0.3 },
    ratio_anchors: { bb_row: {r:1.08, c:0.4} },
    min_effective_load_hint: { bar_lb: 45 }
  },

  {
    id: "inverted_row",
    name: "Inverted Row",
    aliases: ["bodyweight row", "australian pullup", "ring row"],
    family: "horizontal_row",
    hub: false,
    pattern: "horizontal_pull",
    muscles: [
      { m: "back", role: "primary", contribution: 1.0 },
      { m: "rear_delt", role: "secondary", contribution: 0.4 },
      { m: "biceps", role: "secondary", contribution: 0.4 },
      { m: "traps", role: "secondary", contribution: 0.35 }
    ],
    requires: { any: [ { all: [ {cap:"squat_rack"}, {cap:"barbell"} ] }, { all: [ {cap:"bodyweight_only"}, {cap:"pullup_bar"} ] } ] },
    load_unit: "bodyweight_plus",
    load_portability: "absolute",
    profile: { resistance_peak: "shortened", stretch_emphasis: 3, rom_score: 3, shortened_overload: 4 },
    ratings: { rp_tier: {back:"B", rear_delt:"C", biceps:"D", traps:"C"}, sfr: 4, target_specificity: 3, stability_demand: 3, technique_demand: 2, injury_risk: 1, setup_cost: 2 },
    fatigue: { systemic: 2, local: 3 },
    unilateral: false, unilateral_capable: false, failure_safe: true,
    rep_suitability: { "5_8": 0.4, "8_12": 0.9, "12_20": 1.0, "20_30": 0.7 },
    variants: { angle: ["feet_on_floor","feet_elevated"] },
    ratio_anchors: { bb_row: {r:0.3, c:0.2} }
  },

  {
    id: "band_row",
    name: "Band Row",
    aliases: ["banded seated row", "band bent over row"],
    family: "horizontal_row",
    hub: false,
    pattern: "horizontal_pull",
    muscles: [
      { m: "back", role: "primary", contribution: 1.0 },
      { m: "rear_delt", role: "secondary", contribution: 0.35 },
      { m: "biceps", role: "secondary", contribution: 0.35 },
      { m: "traps", role: "secondary", contribution: 0.3 }
    ],
    requires: { any: [ { all: [ {cap:"band"} ] } ] },
    load_unit: "band_tension",
    load_portability: "absolute",
    profile: { resistance_peak: "shortened", stretch_emphasis: 2, rom_score: 3, shortened_overload: 5 },
    ratings: { rp_tier: {back:"C", rear_delt:"C", biceps:"D", traps:"D"}, sfr: 4, target_specificity: 3, stability_demand: 2, technique_demand: 2, injury_risk: 1, setup_cost: 2 },
    fatigue: { systemic: 1, local: 3 },
    unilateral: false, unilateral_capable: true, failure_safe: true,
    rep_suitability: { "5_8": 0.1, "8_12": 0.6, "12_20": 1.0, "20_30": 0.9 },
    ratio_anchors: { bb_row: {r:0.2, c:0.15} }
  },

  {
    id: "db_pullover",
    name: "Dumbbell Pullover",
    aliases: ["db pullover"],
    family: "pullover",
    hub: true,
    pattern: "fly",
    muscles: [
      { m: "back", role: "primary", contribution: 1.0 },
      { m: "chest", role: "secondary", contribution: 0.5 },
      { m: "triceps", role: "secondary", contribution: 0.25 }
    ],
    requires: { any: [ { all: [ {cap:"dumbbell"}, {cap:"bench"} ] } ] },
    load_unit: "per_dumbbell",
    load_portability: "absolute",
    profile: { resistance_peak: "stretch", stretch_emphasis: 5, rom_score: 4, shortened_overload: 1 },
    ratings: { rp_tier: {back:"B", chest:"C", triceps:"D"}, sfr: 3, target_specificity: 3, stability_demand: 3, technique_demand: 3, injury_risk: 3, setup_cost: 2 },
    fatigue: { systemic: 2, local: 3 },
    unilateral: false, unilateral_capable: false, failure_safe: true,
    rep_suitability: { "5_8": 0.3, "8_12": 0.9, "12_20": 1.0, "20_30": 0.6 },
    ratio_anchors: { lat_pulldown: {r:0.33, c:0.3} },
    min_effective_load_hint: { per_hand_lb: 15 }
  },

  {
    id: "cable_pullover",
    name: "Cable Pullover",
    aliases: ["kneeling cable pullover"],
    family: "pullover",
    hub: false,
    pattern: "fly",
    muscles: [
      { m: "back", role: "primary", contribution: 1.0 },
      { m: "triceps", role: "secondary", contribution: 0.2 }
    ],
    requires: { any: [ { all: [ {cap:"cable"}, {cap:"high_pulley"} ] }, { all: [ {cap:"freemotion"} ] } ] },
    load_unit: "stack_pin",
    load_portability: "machine_relative",
    profile: { resistance_peak: "stretch", stretch_emphasis: 5, rom_score: 4, shortened_overload: 2 },
    ratings: { rp_tier: {back:"A", triceps:"D"}, sfr: 5, target_specificity: 5, stability_demand: 2, technique_demand: 2, injury_risk: 1, setup_cost: 2 },
    fatigue: { systemic: 1, local: 3 },
    unilateral: false, unilateral_capable: true, failure_safe: true,
    rep_suitability: { "5_8": 0.3, "8_12": 0.9, "12_20": 1.0, "20_30": 0.6 },
    ratio_anchors: { db_pullover: {r:1.5, c:0.25} },
    min_effective_load_hint: { stack_min_lb: 15 }
  },

  {
    id: "straight_arm_pulldown",
    name: "Straight-Arm Pulldown",
    aliases: ["straight arm pushdown", "lat prayer"],
    family: "pullover",
    hub: false,
    pattern: "fly",
    muscles: [
      { m: "back", role: "primary", contribution: 1.0 },
      { m: "triceps", role: "secondary", contribution: 0.2 }
    ],
    requires: { any: [ { all: [ {cap:"cable"}, {cap:"high_pulley"} ] }, { all: [ {cap:"machine", machine_key:"lat_pulldown"} ] } ] },
    load_unit: "stack_pin",
    load_portability: "machine_relative",
    profile: { resistance_peak: "shortened", stretch_emphasis: 3, rom_score: 3, shortened_overload: 4 },
    ratings: { rp_tier: {back:"B", triceps:"D"}, sfr: 5, target_specificity: 5, stability_demand: 2, technique_demand: 2, injury_risk: 1, setup_cost: 1 },
    fatigue: { systemic: 1, local: 3 },
    unilateral: false, unilateral_capable: true, failure_safe: true,
    rep_suitability: { "5_8": 0.2, "8_12": 0.8, "12_20": 1.0, "20_30": 0.7 },
    ratio_anchors: { db_pullover: {r:1.17, c:0.25} },
    min_effective_load_hint: { stack_min_lb: 10 }
  },

  {
    id: "pullover_machine",
    name: "Pullover Machine",
    aliases: ["nautilus pullover"],
    family: "pullover",
    hub: false,
    pattern: "fly",
    muscles: [
      { m: "back", role: "primary", contribution: 1.0 }
    ],
    requires: { any: [ { all: [ {cap:"machine", machine_key:"pullover_machine"} ] } ] },
    load_unit: "stack_pin",
    load_portability: "machine_relative",
    profile: { resistance_peak: "flat", stretch_emphasis: 4, rom_score: 4, shortened_overload: 4 },
    ratings: { rp_tier: {back:"A"}, sfr: 5, target_specificity: 5, stability_demand: 1, technique_demand: 1, injury_risk: 1, setup_cost: 1 },
    fatigue: { systemic: 1, local: 3 },
    unilateral: false, unilateral_capable: false, failure_safe: true,
    rep_suitability: { "5_8": 0.4, "8_12": 1.0, "12_20": 1.0, "20_30": 0.6 },
    ratio_anchors: { db_pullover: {r:2.0, c:0.2} },
    min_effective_load_hint: { stack_min_lb: 15 }
  },

  /* ======================= TRAPS ======================= */

  {
    id: "bb_shrug",
    name: "Barbell Shrug",
    aliases: ["shrugs"],
    family: "shrug",
    hub: true,
    pattern: "shrug",
    muscles: [
      { m: "traps", role: "primary", contribution: 1.0 },
      { m: "forearms", role: "secondary", contribution: 0.4 }
    ],
    requires: { any: [ { all: [ {cap:"barbell"} ] }, { all: [ {cap:"barbell"}, {cap:"squat_rack"} ] } ] },
    load_unit: "total_bar_load",
    load_portability: "absolute",
    profile: { resistance_peak: "shortened", stretch_emphasis: 2, rom_score: 2, shortened_overload: 4 },
    ratings: { rp_tier: {traps:"A", forearms:"C"}, sfr: 4, target_specificity: 5, stability_demand: 4, technique_demand: 2, injury_risk: 2, setup_cost: 2 },
    fatigue: { systemic: 2, local: 3 },
    unilateral: false, unilateral_capable: false, failure_safe: true,
    rep_suitability: { "5_8": 0.7, "8_12": 1.0, "12_20": 0.9, "20_30": 0.5 },
    ratio_anchors: { conventional_deadlift: {r:0.78, c:0.5} },
    min_effective_load_hint: { bar_lb: 45 }
  },

  {
    id: "db_shrug",
    name: "Dumbbell Shrug",
    aliases: ["db shrugs"],
    family: "shrug",
    hub: false,
    pattern: "shrug",
    muscles: [
      { m: "traps", role: "primary", contribution: 1.0 },
      { m: "forearms", role: "secondary", contribution: 0.4 }
    ],
    requires: { any: [ { all: [ {cap:"dumbbell"} ] } ] },
    load_unit: "per_dumbbell",
    load_portability: "absolute",
    profile: { resistance_peak: "shortened", stretch_emphasis: 3, rom_score: 3, shortened_overload: 4 },
    ratings: { rp_tier: {traps:"A", forearms:"C"}, sfr: 4, target_specificity: 5, stability_demand: 4, technique_demand: 1, injury_risk: 1, setup_cost: 1 },
    fatigue: { systemic: 2, local: 3 },
    unilateral: false, unilateral_capable: true, failure_safe: true,
    rep_suitability: { "5_8": 0.6, "8_12": 1.0, "12_20": 1.0, "20_30": 0.6 },
    ratio_anchors: { bb_shrug: {r:0.35, c:0.5} },
    min_effective_load_hint: { per_hand_lb: 15 }
  },

  {
    id: "cable_shrug",
    name: "Cable Shrug",
    aliases: ["low pulley shrug"],
    family: "shrug",
    hub: false,
    pattern: "shrug",
    muscles: [
      { m: "traps", role: "primary", contribution: 1.0 },
      { m: "forearms", role: "secondary", contribution: 0.3 }
    ],
    requires: { any: [ { all: [ {cap:"cable"}, {cap:"low_pulley"} ] } ] },
    load_unit: "stack_pin",
    load_portability: "machine_relative",
    profile: { resistance_peak: "flat", stretch_emphasis: 3, rom_score: 3, shortened_overload: 4 },
    ratings: { rp_tier: {traps:"A", forearms:"D"}, sfr: 5, target_specificity: 5, stability_demand: 2, technique_demand: 1, injury_risk: 1, setup_cost: 1 },
    fatigue: { systemic: 1, local: 3 },
    unilateral: false, unilateral_capable: true, failure_safe: true,
    rep_suitability: { "5_8": 0.5, "8_12": 1.0, "12_20": 1.0, "20_30": 0.7 },
    ratio_anchors: { bb_shrug: {r:0.57, c:0.25} },
    min_effective_load_hint: { stack_min_lb: 15 }
  },

  {
    id: "band_shrug",
    name: "Band Shrug",
    aliases: ["banded shrug"],
    family: "shrug",
    hub: false,
    pattern: "shrug",
    muscles: [
      { m: "traps", role: "primary", contribution: 1.0 },
      { m: "forearms", role: "secondary", contribution: 0.3 }
    ],
    requires: { any: [ { all: [ {cap:"band"} ] } ] },
    load_unit: "band_tension",
    load_portability: "absolute",
    profile: { resistance_peak: "shortened", stretch_emphasis: 1, rom_score: 2, shortened_overload: 5 },
    ratings: { rp_tier: {traps:"C", forearms:"D"}, sfr: 4, target_specificity: 5, stability_demand: 3, technique_demand: 1, injury_risk: 1, setup_cost: 1 },
    fatigue: { systemic: 1, local: 2 },
    unilateral: false, unilateral_capable: true, failure_safe: true,
    rep_suitability: { "5_8": 0.1, "8_12": 0.5, "12_20": 1.0, "20_30": 1.0 },
    ratio_anchors: { bb_shrug: {r:0.1, c:0.1} }
  },

  /* ======================= FRONT DELT / OVERHEAD ======================= */

  {
    id: "bb_ohp",
    name: "Overhead Press",
    aliases: ["military press", "standing press", "ohp"],
    family: "overhead_press",
    hub: true,
    pattern: "vertical_press",
    muscles: [
      { m: "front_delt", role: "primary", contribution: 1.0 },
      { m: "side_delt", role: "secondary", contribution: 0.45 },
      { m: "triceps", role: "secondary", contribution: 0.5 },
      { m: "abs", role: "secondary", contribution: 0.25 }
    ],
    requires: { any: [ { all: [ {cap:"barbell"}, {cap:"squat_rack"} ] }, { all: [ {cap:"barbell"} ] } ] },
    load_unit: "total_bar_load",
    load_portability: "absolute",
    profile: { resistance_peak: "mid", stretch_emphasis: 2, rom_score: 3, shortened_overload: 3 },
    ratings: { rp_tier: {front_delt:"S", side_delt:"C", triceps:"B", abs:"D"}, sfr: 3, target_specificity: 3, stability_demand: 4, technique_demand: 4, injury_risk: 2, setup_cost: 2 },
    fatigue: { systemic: 3, local: 3 },
    unilateral: false, unilateral_capable: false, failure_safe: true,
    rep_suitability: { "5_8": 1.0, "8_12": 0.9, "12_20": 0.5, "20_30": 0.2 },
    variants: { stance: ["standing","seated"] },
    ratio_anchors: { bb_flat_bench: {r:0.6, c:0.7} },
    min_effective_load_hint: { bar_lb: 45 }
  },

  {
    id: "db_shoulder_press",
    name: "Seated Dumbbell Shoulder Press",
    aliases: ["db overhead press", "seated db press"],
    family: "overhead_press",
    hub: false,
    pattern: "vertical_press",
    muscles: [
      { m: "front_delt", role: "primary", contribution: 1.0 },
      { m: "side_delt", role: "secondary", contribution: 0.5 },
      { m: "triceps", role: "secondary", contribution: 0.45 }
    ],
    requires: { any: [ { all: [ {cap:"dumbbell"}, {cap:"adjustable_bench"} ] }, { all: [ {cap:"dumbbell"} ] } ] },
    load_unit: "per_dumbbell",
    load_portability: "absolute",
    profile: { resistance_peak: "stretch", stretch_emphasis: 3, rom_score: 4, shortened_overload: 2 },
    ratings: { rp_tier: {front_delt:"S", side_delt:"B", triceps:"C"}, sfr: 4, target_specificity: 4, stability_demand: 3, technique_demand: 2, injury_risk: 2, setup_cost: 2 },
    fatigue: { systemic: 3, local: 3 },
    unilateral: false, unilateral_capable: true, failure_safe: true,
    rep_suitability: { "5_8": 0.8, "8_12": 1.0, "12_20": 0.8, "20_30": 0.4 },
    variants: { grip: ["pronated","neutral"] },
    ratio_anchors: { bb_ohp: {r:0.41, c:0.6} },
    min_effective_load_hint: { per_hand_lb: 8 }
  },

  {
    id: "machine_shoulder_press",
    name: "Machine Shoulder Press",
    aliases: ["seated press machine"],
    family: "overhead_press",
    hub: false,
    pattern: "vertical_press",
    muscles: [
      { m: "front_delt", role: "primary", contribution: 1.0 },
      { m: "side_delt", role: "secondary", contribution: 0.4 },
      { m: "triceps", role: "secondary", contribution: 0.45 }
    ],
    requires: { any: [ { all: [ {cap:"machine", machine_key:"shoulder_press_machine"} ] } ] },
    load_unit: "stack_pin",
    load_portability: "machine_relative",
    profile: { resistance_peak: "mid", stretch_emphasis: 2, rom_score: 3, shortened_overload: 3 },
    ratings: { rp_tier: {front_delt:"A", side_delt:"C", triceps:"C"}, sfr: 4, target_specificity: 4, stability_demand: 1, technique_demand: 1, injury_risk: 1, setup_cost: 1 },
    fatigue: { systemic: 2, local: 3 },
    unilateral: false, unilateral_capable: true, failure_safe: true,
    rep_suitability: { "5_8": 0.7, "8_12": 1.0, "12_20": 0.9, "20_30": 0.5 },
    ratio_anchors: { bb_ohp: {r:1.04, c:0.25} },
    min_effective_load_hint: { stack_min_lb: 15 }
  },

  {
    id: "smith_ohp",
    name: "Smith Machine Shoulder Press",
    aliases: ["smith overhead press"],
    family: "overhead_press",
    hub: false,
    pattern: "vertical_press",
    muscles: [
      { m: "front_delt", role: "primary", contribution: 1.0 },
      { m: "side_delt", role: "secondary", contribution: 0.4 },
      { m: "triceps", role: "secondary", contribution: 0.5 }
    ],
    requires: { any: [ { all: [ {cap:"smith"}, {cap:"adjustable_bench"} ] } ] },
    load_unit: "total_bar_load",
    load_portability: "machine_relative",
    profile: { resistance_peak: "mid", stretch_emphasis: 2, rom_score: 3, shortened_overload: 3 },
    ratings: { rp_tier: {front_delt:"A", side_delt:"C", triceps:"C"}, sfr: 4, target_specificity: 3, stability_demand: 2, technique_demand: 2, injury_risk: 2, setup_cost: 2 },
    fatigue: { systemic: 2, local: 3 },
    unilateral: false, unilateral_capable: false, failure_safe: true,
    rep_suitability: { "5_8": 0.9, "8_12": 1.0, "12_20": 0.7, "20_30": 0.3 },
    ratio_anchors: { bb_ohp: {r:1.07, c:0.4} },
    min_effective_load_hint: { bar_lb: 20 }
  },

  {
    id: "landmine_press",
    name: "Landmine Press",
    aliases: ["single arm landmine press"],
    family: "overhead_press",
    hub: false,
    pattern: "vertical_press",
    muscles: [
      { m: "front_delt", role: "primary", contribution: 1.0 },
      { m: "chest", role: "secondary", contribution: 0.35 },
      { m: "triceps", role: "secondary", contribution: 0.35 },
      { m: "abs", role: "secondary", contribution: 0.3 }
    ],
    requires: { any: [ { all: [ {cap:"landmine"}, {cap:"barbell"} ] } ] },
    load_unit: "total_bar_load",
    load_portability: "absolute",
    profile: { resistance_peak: "mid", stretch_emphasis: 2, rom_score: 3, shortened_overload: 3 },
    ratings: { rp_tier: {front_delt:"B", chest:"D", triceps:"D", abs:"D"}, sfr: 4, target_specificity: 3, stability_demand: 4, technique_demand: 2, injury_risk: 1, setup_cost: 3 },
    fatigue: { systemic: 2, local: 3 },
    unilateral: true, unilateral_capable: true, failure_safe: true,
    rep_suitability: { "5_8": 0.7, "8_12": 1.0, "12_20": 0.8, "20_30": 0.4 },
    ratio_anchors: { bb_ohp: {r:0.67, c:0.3} },
    min_effective_load_hint: { bar_lb: 45 }
  },

  {
    id: "pike_pushup",
    name: "Pike Push-Up",
    aliases: ["elevated pike pushup"],
    family: "overhead_press",
    hub: false,
    pattern: "vertical_press",
    muscles: [
      { m: "front_delt", role: "primary", contribution: 1.0 },
      { m: "triceps", role: "secondary", contribution: 0.5 },
      { m: "side_delt", role: "secondary", contribution: 0.3 }
    ],
    requires: { any: [ { all: [ {cap:"bodyweight_only"} ] } ] },
    load_unit: "bodyweight_plus",
    load_portability: "absolute",
    profile: { resistance_peak: "stretch", stretch_emphasis: 3, rom_score: 3, shortened_overload: 2 },
    ratings: { rp_tier: {front_delt:"C", triceps:"D", side_delt:"D"}, sfr: 3, target_specificity: 2, stability_demand: 4, technique_demand: 3, injury_risk: 2, setup_cost: 1 },
    fatigue: { systemic: 2, local: 3 },
    unilateral: false, unilateral_capable: false, failure_safe: true,
    rep_suitability: { "5_8": 0.4, "8_12": 0.9, "12_20": 1.0, "20_30": 0.6 },
    variants: { elevation: ["floor","feet_elevated"] },
    ratio_anchors: { bb_ohp: {r:0.25, c:0.15} }
  },

  {
    id: "band_ohp",
    name: "Band Overhead Press",
    aliases: ["banded shoulder press"],
    family: "overhead_press",
    hub: false,
    pattern: "vertical_press",
    muscles: [
      { m: "front_delt", role: "primary", contribution: 1.0 },
      { m: "triceps", role: "secondary", contribution: 0.4 },
      { m: "side_delt", role: "secondary", contribution: 0.35 }
    ],
    requires: { any: [ { all: [ {cap:"band"} ] } ] },
    load_unit: "band_tension",
    load_portability: "absolute",
    profile: { resistance_peak: "shortened", stretch_emphasis: 1, rom_score: 3, shortened_overload: 5 },
    ratings: { rp_tier: {front_delt:"C", triceps:"D", side_delt:"D"}, sfr: 4, target_specificity: 3, stability_demand: 3, technique_demand: 2, injury_risk: 1, setup_cost: 2 },
    fatigue: { systemic: 1, local: 3 },
    unilateral: false, unilateral_capable: true, failure_safe: true,
    rep_suitability: { "5_8": 0.1, "8_12": 0.6, "12_20": 1.0, "20_30": 0.9 },
    ratio_anchors: { bb_ohp: {r:0.2, c:0.15} }
  },

  /* ======================= SIDE DELT ======================= */

  {
    id: "db_lateral_raise",
    name: "Dumbbell Lateral Raise",
    aliases: ["side raise", "db side lateral"],
    family: "lateral_raise",
    hub: true,
    pattern: "raise",
    muscles: [
      { m: "side_delt", role: "primary", contribution: 1.0 },
      { m: "front_delt", role: "secondary", contribution: 0.2 },
      { m: "traps", role: "secondary", contribution: 0.2 }
    ],
    requires: { any: [ { all: [ {cap:"dumbbell"} ] } ] },
    load_unit: "per_dumbbell",
    load_portability: "absolute",
    profile: { resistance_peak: "shortened", stretch_emphasis: 2, rom_score: 4, shortened_overload: 5 },
    ratings: { rp_tier: {side_delt:"S", front_delt:"D", traps:"D"}, sfr: 5, target_specificity: 5, stability_demand: 4, technique_demand: 2, injury_risk: 1, setup_cost: 1 },
    fatigue: { systemic: 1, local: 3 },
    unilateral: false, unilateral_capable: true, failure_safe: true,
    rep_suitability: { "5_8": 0.2, "8_12": 0.8, "12_20": 1.0, "20_30": 0.9 },
    variants: { stance: ["standing","seated"], lean: ["upright","lean_away"] },
    ratio_anchors: { db_shoulder_press: {r:0.55, c:0.5} },
    min_effective_load_hint: { per_hand_lb: 3 }
  },

  {
    id: "cable_lateral_raise",
    name: "Cable Lateral Raise",
    aliases: ["cable side raise"],
    family: "lateral_raise",
    hub: false,
    pattern: "raise",
    muscles: [
      { m: "side_delt", role: "primary", contribution: 1.0 },
      { m: "traps", role: "secondary", contribution: 0.2 }
    ],
    requires: { any: [ { all: [ {cap:"cable"}, {cap:"low_pulley"} ] }, { all: [ {cap:"freemotion"} ] } ] },
    load_unit: "stack_pin",
    load_portability: "machine_relative",
    profile: { resistance_peak: "flat", stretch_emphasis: 3, rom_score: 5, shortened_overload: 4 },
    ratings: { rp_tier: {side_delt:"S", traps:"D"}, sfr: 5, target_specificity: 5, stability_demand: 2, technique_demand: 2, injury_risk: 1, setup_cost: 2 },
    fatigue: { systemic: 1, local: 3 },
    unilateral: true, unilateral_capable: true, failure_safe: true,
    rep_suitability: { "5_8": 0.2, "8_12": 0.8, "12_20": 1.0, "20_30": 0.9 },
    ratio_anchors: { db_lateral_raise: {r:0.83, c:0.3} },
    min_effective_load_hint: { stack_min_lb: 5, note: "many stacks start at 10-15 lb — too heavy for a light lifter's side delt; prefer dumbbells" }
  },

  {
    id: "machine_lateral_raise",
    name: "Machine Lateral Raise",
    aliases: ["lateral raise machine"],
    family: "lateral_raise",
    hub: false,
    pattern: "raise",
    muscles: [
      { m: "side_delt", role: "primary", contribution: 1.0 }
    ],
    requires: { any: [ { all: [ {cap:"machine", machine_key:"lateral_raise_machine"} ] } ] },
    load_unit: "stack_pin",
    load_portability: "machine_relative",
    profile: { resistance_peak: "flat", stretch_emphasis: 2, rom_score: 4, shortened_overload: 5 },
    ratings: { rp_tier: {side_delt:"S"}, sfr: 5, target_specificity: 5, stability_demand: 1, technique_demand: 1, injury_risk: 1, setup_cost: 1 },
    fatigue: { systemic: 1, local: 3 },
    unilateral: false, unilateral_capable: true, failure_safe: true,
    rep_suitability: { "5_8": 0.3, "8_12": 0.9, "12_20": 1.0, "20_30": 0.8 },
    ratio_anchors: { db_lateral_raise: {r:2.3, c:0.2} },
    min_effective_load_hint: { stack_min_lb: 10 }
  },

  {
    id: "band_lateral_raise",
    name: "Band Lateral Raise",
    aliases: ["banded side raise"],
    family: "lateral_raise",
    hub: false,
    pattern: "raise",
    muscles: [
      { m: "side_delt", role: "primary", contribution: 1.0 }
    ],
    requires: { any: [ { all: [ {cap:"band"} ] } ] },
    load_unit: "band_tension",
    load_portability: "absolute",
    profile: { resistance_peak: "shortened", stretch_emphasis: 1, rom_score: 4, shortened_overload: 5 },
    ratings: { rp_tier: {side_delt:"B"}, sfr: 4, target_specificity: 5, stability_demand: 3, technique_demand: 2, injury_risk: 1, setup_cost: 1 },
    fatigue: { systemic: 1, local: 3 },
    unilateral: true, unilateral_capable: true, failure_safe: true,
    rep_suitability: { "5_8": 0.1, "8_12": 0.5, "12_20": 1.0, "20_30": 1.0 },
    ratio_anchors: { db_lateral_raise: {r:0.5, c:0.15} }
  },

  {
    id: "upright_row",
    name: "Upright Row",
    aliases: ["cable upright row", "wide grip upright row"],
    family: "lateral_raise",
    hub: false,
    pattern: "raise",
    muscles: [
      { m: "side_delt", role: "primary", contribution: 1.0 },
      { m: "traps", role: "secondary", contribution: 0.5 },
      { m: "biceps", role: "secondary", contribution: 0.2 }
    ],
    requires: { any: [ { all: [ {cap:"barbell"} ] }, { all: [ {cap:"cable"}, {cap:"low_pulley"} ] }, { all: [ {cap:"dumbbell"} ] } ] },
    load_unit: "total_bar_load",
    load_portability: "absolute",
    profile: { resistance_peak: "mid", stretch_emphasis: 2, rom_score: 3, shortened_overload: 3 },
    ratings: { rp_tier: {side_delt:"C", traps:"B", biceps:"D"}, sfr: 2, target_specificity: 3, stability_demand: 4, technique_demand: 3, injury_risk: 4, setup_cost: 1 },
    fatigue: { systemic: 2, local: 3 },
    unilateral: false, unilateral_capable: true, failure_safe: true,
    rep_suitability: { "5_8": 0.3, "8_12": 0.9, "12_20": 1.0, "20_30": 0.6 },
    variants: { width: ["wide","narrow"] },
    ratio_anchors: { db_lateral_raise: {r:3.2, c:0.3} },
    min_effective_load_hint: { bar_lb: 45, note: "45 lb bar floor is heavy here; use dumbbells or cable for lighter lifters" }
  },

  {
    id: "db_front_raise",
    name: "Dumbbell Front Raise",
    aliases: ["front raise", "plate raise"],
    family: "front_raise",
    hub: true,
    pattern: "raise",
    muscles: [
      { m: "front_delt", role: "primary", contribution: 1.0 },
      { m: "side_delt", role: "secondary", contribution: 0.2 }
    ],
    requires: { any: [ { all: [ {cap:"dumbbell"} ] }, { all: [ {cap:"cable"}, {cap:"low_pulley"} ] }, { all: [ {cap:"band"} ] } ] },
    load_unit: "per_dumbbell",
    load_portability: "absolute",
    profile: { resistance_peak: "shortened", stretch_emphasis: 2, rom_score: 4, shortened_overload: 5 },
    ratings: { rp_tier: {front_delt:"C", side_delt:"D"}, sfr: 3, target_specificity: 5, stability_demand: 4, technique_demand: 2, injury_risk: 2, setup_cost: 1 },
    fatigue: { systemic: 1, local: 2 },
    unilateral: false, unilateral_capable: true, failure_safe: true,
    rep_suitability: { "5_8": 0.2, "8_12": 0.8, "12_20": 1.0, "20_30": 0.8 },
    ratio_anchors: { db_shoulder_press: {r:0.45, c:0.4} },
    min_effective_load_hint: { per_hand_lb: 5 }
  },

  /* ======================= REAR DELT ======================= */

  {
    id: "db_rear_delt_fly",
    name: "Bent-Over Dumbbell Rear Delt Fly",
    aliases: ["reverse fly", "bent over lateral raise"],
    family: "rear_delt_fly",
    hub: true,
    pattern: "fly",
    muscles: [
      { m: "rear_delt", role: "primary", contribution: 1.0 },
      { m: "traps", role: "secondary", contribution: 0.35 },
      { m: "back", role: "secondary", contribution: 0.2 }
    ],
    requires: { any: [ { all: [ {cap:"dumbbell"} ] }, { all: [ {cap:"dumbbell"}, {cap:"adjustable_bench"} ] } ] },
    load_unit: "per_dumbbell",
    load_portability: "absolute",
    profile: { resistance_peak: "shortened", stretch_emphasis: 2, rom_score: 4, shortened_overload: 5 },
    ratings: { rp_tier: {rear_delt:"A", traps:"C", back:"D"}, sfr: 4, target_specificity: 5, stability_demand: 3, technique_demand: 3, injury_risk: 1, setup_cost: 1 },
    fatigue: { systemic: 1, local: 2 },
    unilateral: false, unilateral_capable: true, failure_safe: true,
    rep_suitability: { "5_8": 0.2, "8_12": 0.8, "12_20": 1.0, "20_30": 0.9 },
    variants: { support: ["standing_bent","chest_supported"] },
    ratio_anchors: { db_lateral_raise: {r:0.83, c:0.4} },
    min_effective_load_hint: { per_hand_lb: 3 }
  },

  {
    id: "reverse_pec_deck",
    name: "Reverse Pec Deck",
    aliases: ["rear delt machine", "reverse fly machine"],
    family: "rear_delt_fly",
    hub: false,
    pattern: "fly",
    muscles: [
      { m: "rear_delt", role: "primary", contribution: 1.0 },
      { m: "traps", role: "secondary", contribution: 0.3 }
    ],
    requires: { any: [ { all: [ {cap:"machine", machine_key:"rear_delt_machine"} ] }, { all: [ {cap:"machine", machine_key:"pec_deck"} ] } ] },
    load_unit: "stack_pin",
    load_portability: "machine_relative",
    profile: { resistance_peak: "flat", stretch_emphasis: 3, rom_score: 4, shortened_overload: 4 },
    ratings: { rp_tier: {rear_delt:"S", traps:"C"}, sfr: 5, target_specificity: 5, stability_demand: 1, technique_demand: 1, injury_risk: 1, setup_cost: 1 },
    fatigue: { systemic: 1, local: 2 },
    unilateral: false, unilateral_capable: true, failure_safe: true,
    rep_suitability: { "5_8": 0.3, "8_12": 0.9, "12_20": 1.0, "20_30": 0.8 },
    ratio_anchors: { db_rear_delt_fly: {r:2.8, c:0.2} },
    min_effective_load_hint: { stack_min_lb: 10, note: "15 lb minimum pin is often already past failure for a light lifter's rear delts" }
  },

  {
    id: "cable_rear_delt_fly",
    name: "Cable Rear Delt Fly",
    aliases: ["cable reverse fly", "cable rear delt crossover"],
    family: "rear_delt_fly",
    hub: false,
    pattern: "fly",
    muscles: [
      { m: "rear_delt", role: "primary", contribution: 1.0 },
      { m: "traps", role: "secondary", contribution: 0.3 }
    ],
    requires: { any: [ { all: [ {cap:"cable"} ] }, { all: [ {cap:"freemotion"} ] } ] },
    load_unit: "stack_pin",
    load_portability: "machine_relative",
    profile: { resistance_peak: "flat", stretch_emphasis: 3, rom_score: 5, shortened_overload: 4 },
    ratings: { rp_tier: {rear_delt:"S", traps:"C"}, sfr: 5, target_specificity: 5, stability_demand: 2, technique_demand: 2, injury_risk: 1, setup_cost: 2 },
    fatigue: { systemic: 1, local: 2 },
    unilateral: true, unilateral_capable: true, failure_safe: true,
    rep_suitability: { "5_8": 0.2, "8_12": 0.8, "12_20": 1.0, "20_30": 0.9 },
    ratio_anchors: { db_rear_delt_fly: {r:0.8, c:0.25} },
    min_effective_load_hint: { stack_min_lb: 5 }
  },

  {
    id: "cable_face_pull",
    name: "Face Pull",
    aliases: ["rope face pull"],
    family: "rear_delt_fly",
    hub: false,
    pattern: "horizontal_pull",
    muscles: [
      { m: "rear_delt", role: "primary", contribution: 1.0 },
      { m: "traps", role: "secondary", contribution: 0.5 },
      { m: "back", role: "secondary", contribution: 0.2 }
    ],
    requires: { any: [ { all: [ {cap:"cable"}, {cap:"high_pulley"} ] }, { all: [ {cap:"band"} ] } ] },
    load_unit: "stack_pin",
    load_portability: "machine_relative",
    profile: { resistance_peak: "shortened", stretch_emphasis: 2, rom_score: 3, shortened_overload: 5 },
    ratings: { rp_tier: {rear_delt:"A", traps:"B", back:"D"}, sfr: 5, target_specificity: 4, stability_demand: 2, technique_demand: 2, injury_risk: 1, setup_cost: 2 },
    fatigue: { systemic: 1, local: 2 },
    unilateral: false, unilateral_capable: true, failure_safe: true,
    rep_suitability: { "5_8": 0.2, "8_12": 0.8, "12_20": 1.0, "20_30": 0.9 },
    ratio_anchors: { db_rear_delt_fly: {r:2.8, c:0.2} },
    min_effective_load_hint: { stack_min_lb: 15 }
  },

  {
    id: "band_pull_apart",
    name: "Band Pull-Apart",
    aliases: ["pull apart"],
    family: "rear_delt_fly",
    hub: false,
    pattern: "fly",
    muscles: [
      { m: "rear_delt", role: "primary", contribution: 1.0 },
      { m: "traps", role: "secondary", contribution: 0.4 }
    ],
    requires: { any: [ { all: [ {cap:"band"} ] } ] },
    load_unit: "band_tension",
    load_portability: "absolute",
    profile: { resistance_peak: "shortened", stretch_emphasis: 1, rom_score: 3, shortened_overload: 5 },
    ratings: { rp_tier: {rear_delt:"B", traps:"C"}, sfr: 5, target_specificity: 4, stability_demand: 3, technique_demand: 1, injury_risk: 1, setup_cost: 1 },
    fatigue: { systemic: 1, local: 2 },
    unilateral: false, unilateral_capable: false, failure_safe: true,
    rep_suitability: { "5_8": 0.1, "8_12": 0.5, "12_20": 1.0, "20_30": 1.0 },
    ratio_anchors: { db_rear_delt_fly: {r:0.6, c:0.15} }
  },

  /* ======================= BICEPS ======================= */

  {
    id: "db_curl",
    name: "Dumbbell Curl",
    aliases: ["db biceps curl", "standing dumbbell curl"],
    family: "biceps_curl",
    hub: true,
    pattern: "isolation_curl",
    muscles: [
      { m: "biceps", role: "primary", contribution: 1.0 },
      { m: "forearms", role: "secondary", contribution: 0.3 }
    ],
    requires: { any: [ { all: [ {cap:"dumbbell"} ] } ] },
    load_unit: "per_dumbbell",
    load_portability: "absolute",
    profile: { resistance_peak: "mid", stretch_emphasis: 3, rom_score: 4, shortened_overload: 3 },
    ratings: { rp_tier: {biceps:"A", forearms:"C"}, sfr: 4, target_specificity: 4, stability_demand: 4, technique_demand: 1, injury_risk: 1, setup_cost: 1 },
    fatigue: { systemic: 1, local: 3 },
    unilateral: false, unilateral_capable: true, failure_safe: true,
    rep_suitability: { "5_8": 0.5, "8_12": 1.0, "12_20": 1.0, "20_30": 0.6 },
    variants: { grip: ["supinated","rotating"], stance: ["standing","seated"] },
    ratio_anchors: { lat_pulldown: {r:0.25, c:0.3} },
    min_effective_load_hint: { per_hand_lb: 5 }
  },

  {
    id: "bb_curl",
    name: "Barbell Curl",
    aliases: ["straight bar curl"],
    family: "biceps_curl",
    hub: false,
    pattern: "isolation_curl",
    muscles: [
      { m: "biceps", role: "primary", contribution: 1.0 },
      { m: "forearms", role: "secondary", contribution: 0.3 }
    ],
    requires: { any: [ { all: [ {cap:"barbell"} ] } ] },
    load_unit: "total_bar_load",
    load_portability: "absolute",
    profile: { resistance_peak: "mid", stretch_emphasis: 3, rom_score: 3, shortened_overload: 3 },
    ratings: { rp_tier: {biceps:"A", forearms:"C"}, sfr: 4, target_specificity: 4, stability_demand: 4, technique_demand: 2, injury_risk: 2, setup_cost: 1 },
    fatigue: { systemic: 1, local: 3 },
    unilateral: false, unilateral_capable: false, failure_safe: true,
    rep_suitability: { "5_8": 0.6, "8_12": 1.0, "12_20": 0.9, "20_30": 0.5 },
    ratio_anchors: { db_curl: {r:2.1, c:0.5} },
    min_effective_load_hint: { bar_lb: 45, note: "45 lb straight bar is above many lifters' curl working load; use ez bar (25 lb) or dumbbells" }
  },

  {
    id: "ez_curl",
    name: "EZ-Bar Curl",
    aliases: ["ez bar curl", "cambered bar curl"],
    family: "biceps_curl",
    hub: false,
    pattern: "isolation_curl",
    muscles: [
      { m: "biceps", role: "primary", contribution: 1.0 },
      { m: "forearms", role: "secondary", contribution: 0.3 }
    ],
    requires: { any: [ { all: [ {cap:"barbell"} ] } ] },
    load_unit: "total_bar_load",
    load_portability: "absolute",
    profile: { resistance_peak: "mid", stretch_emphasis: 3, rom_score: 3, shortened_overload: 3 },
    ratings: { rp_tier: {biceps:"A", forearms:"C"}, sfr: 4, target_specificity: 4, stability_demand: 4, technique_demand: 2, injury_risk: 1, setup_cost: 1 },
    fatigue: { systemic: 1, local: 3 },
    unilateral: false, unilateral_capable: false, failure_safe: true,
    rep_suitability: { "5_8": 0.6, "8_12": 1.0, "12_20": 0.9, "20_30": 0.5 },
    ratio_anchors: { db_curl: {r:2.2, c:0.5} },
    min_effective_load_hint: { bar_lb: 25 }
  },

  {
    id: "incline_db_curl",
    name: "Incline Dumbbell Curl",
    aliases: ["incline curl"],
    family: "biceps_curl",
    hub: false,
    pattern: "isolation_curl",
    muscles: [
      { m: "biceps", role: "primary", contribution: 1.0 },
      { m: "forearms", role: "secondary", contribution: 0.25 }
    ],
    requires: { any: [ { all: [ {cap:"dumbbell"}, {cap:"adjustable_bench"} ] } ] },
    load_unit: "per_dumbbell",
    load_portability: "absolute",
    profile: { resistance_peak: "stretch", stretch_emphasis: 5, rom_score: 5, shortened_overload: 1 },
    ratings: { rp_tier: {biceps:"S", forearms:"D"}, sfr: 5, target_specificity: 5, stability_demand: 2, technique_demand: 2, injury_risk: 1, setup_cost: 2 },
    fatigue: { systemic: 1, local: 3 },
    unilateral: false, unilateral_capable: true, failure_safe: true,
    rep_suitability: { "5_8": 0.4, "8_12": 1.0, "12_20": 1.0, "20_30": 0.6 },
    variants: { angle_deg: [45,60] },
    ratio_anchors: { db_curl: {r:0.78, c:0.5} },
    min_effective_load_hint: { per_hand_lb: 5 }
  },

  {
    id: "cable_curl",
    name: "Cable Curl",
    aliases: ["low pulley curl", "bar cable curl"],
    family: "biceps_curl",
    hub: false,
    pattern: "isolation_curl",
    muscles: [
      { m: "biceps", role: "primary", contribution: 1.0 },
      { m: "forearms", role: "secondary", contribution: 0.25 }
    ],
    requires: { any: [ { all: [ {cap:"cable"}, {cap:"low_pulley"} ] }, { all: [ {cap:"freemotion"} ] } ] },
    load_unit: "stack_pin",
    load_portability: "machine_relative",
    profile: { resistance_peak: "flat", stretch_emphasis: 3, rom_score: 4, shortened_overload: 4 },
    ratings: { rp_tier: {biceps:"A", forearms:"D"}, sfr: 5, target_specificity: 5, stability_demand: 2, technique_demand: 1, injury_risk: 1, setup_cost: 1 },
    fatigue: { systemic: 1, local: 3 },
    unilateral: false, unilateral_capable: true, failure_safe: true,
    rep_suitability: { "5_8": 0.4, "8_12": 1.0, "12_20": 1.0, "20_30": 0.7 },
    ratio_anchors: { db_curl: {r:1.8, c:0.3} },
    min_effective_load_hint: { stack_min_lb: 10 }
  },

  {
    id: "band_curl",
    name: "Band Curl",
    aliases: ["banded biceps curl"],
    family: "biceps_curl",
    hub: false,
    pattern: "isolation_curl",
    muscles: [
      { m: "biceps", role: "primary", contribution: 1.0 },
      { m: "forearms", role: "secondary", contribution: 0.2 }
    ],
    requires: { any: [ { all: [ {cap:"band"} ] } ] },
    load_unit: "band_tension",
    load_portability: "absolute",
    profile: { resistance_peak: "shortened", stretch_emphasis: 1, rom_score: 4, shortened_overload: 5 },
    ratings: { rp_tier: {biceps:"C", forearms:"D"}, sfr: 4, target_specificity: 4, stability_demand: 3, technique_demand: 1, injury_risk: 1, setup_cost: 1 },
    fatigue: { systemic: 1, local: 2 },
    unilateral: false, unilateral_capable: true, failure_safe: true,
    rep_suitability: { "5_8": 0.1, "8_12": 0.6, "12_20": 1.0, "20_30": 0.9 },
    ratio_anchors: { db_curl: {r:0.6, c:0.15} }
  },

  {
    id: "ez_preacher_curl",
    name: "Preacher Curl",
    aliases: ["ez preacher curl", "scott curl"],
    family: "preacher_curl",
    hub: true,
    pattern: "isolation_curl",
    muscles: [
      { m: "biceps", role: "primary", contribution: 1.0 },
      { m: "forearms", role: "secondary", contribution: 0.2 }
    ],
    requires: { any: [ { all: [ {cap:"preacher_bench"}, {cap:"barbell"} ] }, { all: [ {cap:"preacher_bench"}, {cap:"dumbbell"} ] } ] },
    load_unit: "total_bar_load",
    load_portability: "absolute",
    profile: { resistance_peak: "stretch", stretch_emphasis: 5, rom_score: 4, shortened_overload: 1 },
    ratings: { rp_tier: {biceps:"S", forearms:"D"}, sfr: 4, target_specificity: 5, stability_demand: 1, technique_demand: 2, injury_risk: 2, setup_cost: 2 },
    fatigue: { systemic: 1, local: 3 },
    unilateral: false, unilateral_capable: true, failure_safe: true,
    rep_suitability: { "5_8": 0.4, "8_12": 1.0, "12_20": 1.0, "20_30": 0.6 },
    ratio_anchors: { db_curl: {r:1.78, c:0.4} },
    min_effective_load_hint: { bar_lb: 25 }
  },

  {
    id: "preacher_curl_machine",
    name: "Preacher Curl Machine",
    aliases: ["machine curl", "seated bicep curl machine"],
    family: "preacher_curl",
    hub: false,
    pattern: "isolation_curl",
    muscles: [
      { m: "biceps", role: "primary", contribution: 1.0 }
    ],
    requires: { any: [ { all: [ {cap:"machine", machine_key:"preacher_curl_machine"} ] } ] },
    load_unit: "stack_pin",
    load_portability: "machine_relative",
    profile: { resistance_peak: "flat", stretch_emphasis: 4, rom_score: 4, shortened_overload: 4 },
    ratings: { rp_tier: {biceps:"A"}, sfr: 5, target_specificity: 5, stability_demand: 1, technique_demand: 1, injury_risk: 1, setup_cost: 1 },
    fatigue: { systemic: 1, local: 3 },
    unilateral: false, unilateral_capable: true, failure_safe: true,
    rep_suitability: { "5_8": 0.4, "8_12": 1.0, "12_20": 1.0, "20_30": 0.7 },
    ratio_anchors: { ez_preacher_curl: {r:0.88, c:0.2} },
    min_effective_load_hint: { stack_min_lb: 10 }
  },

  {
    id: "db_hammer_curl",
    name: "Hammer Curl",
    aliases: ["neutral grip curl", "db hammer"],
    family: "hammer_curl",
    hub: true,
    pattern: "isolation_curl",
    muscles: [
      { m: "biceps", role: "primary", contribution: 1.0 },
      { m: "forearms", role: "primary", contribution: 0.7 }
    ],
    requires: { any: [ { all: [ {cap:"dumbbell"} ] } ] },
    load_unit: "per_dumbbell",
    load_portability: "absolute",
    profile: { resistance_peak: "mid", stretch_emphasis: 3, rom_score: 4, shortened_overload: 3 },
    ratings: { rp_tier: {biceps:"A", forearms:"S"}, sfr: 4, target_specificity: 4, stability_demand: 4, technique_demand: 1, injury_risk: 1, setup_cost: 1 },
    fatigue: { systemic: 1, local: 3 },
    unilateral: false, unilateral_capable: true, failure_safe: true,
    rep_suitability: { "5_8": 0.5, "8_12": 1.0, "12_20": 1.0, "20_30": 0.6 },
    variants: { style: ["standard","cross_body"] },
    ratio_anchors: { db_curl: {r:1.11, c:0.5} },
    min_effective_load_hint: { per_hand_lb: 5 }
  },

  {
    id: "cable_rope_hammer_curl",
    name: "Rope Hammer Curl",
    aliases: ["cable rope curl"],
    family: "hammer_curl",
    hub: false,
    pattern: "isolation_curl",
    muscles: [
      { m: "biceps", role: "primary", contribution: 1.0 },
      { m: "forearms", role: "primary", contribution: 0.65 }
    ],
    requires: { any: [ { all: [ {cap:"cable"}, {cap:"low_pulley"} ] } ] },
    load_unit: "stack_pin",
    load_portability: "machine_relative",
    profile: { resistance_peak: "flat", stretch_emphasis: 3, rom_score: 4, shortened_overload: 4 },
    ratings: { rp_tier: {biceps:"A", forearms:"A"}, sfr: 5, target_specificity: 4, stability_demand: 2, technique_demand: 1, injury_risk: 1, setup_cost: 1 },
    fatigue: { systemic: 1, local: 3 },
    unilateral: false, unilateral_capable: true, failure_safe: true,
    rep_suitability: { "5_8": 0.4, "8_12": 1.0, "12_20": 1.0, "20_30": 0.7 },
    ratio_anchors: { db_hammer_curl: {r:1.7, c:0.3} },
    min_effective_load_hint: { stack_min_lb: 10 }
  },

  /* ======================= TRICEPS ======================= */

  {
    id: "cable_pushdown",
    name: "Triceps Pushdown",
    aliases: ["rope pushdown", "cable pressdown"],
    family: "triceps_pushdown",
    hub: true,
    pattern: "isolation_extension",
    muscles: [
      { m: "triceps", role: "primary", contribution: 1.0 }
    ],
    requires: { any: [ { all: [ {cap:"cable"}, {cap:"high_pulley"} ] }, { all: [ {cap:"machine", machine_key:"lat_pulldown"} ] } ] },
    load_unit: "stack_pin",
    load_portability: "machine_relative",
    profile: { resistance_peak: "shortened", stretch_emphasis: 2, rom_score: 3, shortened_overload: 5 },
    ratings: { rp_tier: {triceps:"A"}, sfr: 5, target_specificity: 5, stability_demand: 2, technique_demand: 1, injury_risk: 1, setup_cost: 1 },
    fatigue: { systemic: 1, local: 3 },
    unilateral: false, unilateral_capable: true, failure_safe: true,
    rep_suitability: { "5_8": 0.4, "8_12": 1.0, "12_20": 1.0, "20_30": 0.7 },
    variants: { attachment: ["rope","straight_bar","v_bar"] },
    ratio_anchors: { bb_flat_bench: {r:0.4, c:0.3} },
    min_effective_load_hint: { stack_min_lb: 10 }
  },

  {
    id: "band_pushdown",
    name: "Band Triceps Pushdown",
    aliases: ["banded pressdown"],
    family: "triceps_pushdown",
    hub: false,
    pattern: "isolation_extension",
    muscles: [
      { m: "triceps", role: "primary", contribution: 1.0 }
    ],
    requires: { any: [ { all: [ {cap:"band"} ] } ] },
    load_unit: "band_tension",
    load_portability: "absolute",
    profile: { resistance_peak: "shortened", stretch_emphasis: 1, rom_score: 3, shortened_overload: 5 },
    ratings: { rp_tier: {triceps:"C"}, sfr: 4, target_specificity: 5, stability_demand: 3, technique_demand: 1, injury_risk: 1, setup_cost: 1 },
    fatigue: { systemic: 1, local: 2 },
    unilateral: false, unilateral_capable: true, failure_safe: true,
    rep_suitability: { "5_8": 0.1, "8_12": 0.6, "12_20": 1.0, "20_30": 0.9 },
    ratio_anchors: { cable_pushdown: {r:0.4, c:0.15} }
  },

  {
    id: "ez_skullcrusher",
    name: "Skullcrusher",
    aliases: ["lying triceps extension", "ez skull crusher", "nose breaker"],
    family: "triceps_extension",
    hub: true,
    pattern: "isolation_extension",
    muscles: [
      { m: "triceps", role: "primary", contribution: 1.0 }
    ],
    requires: { any: [ { all: [ {cap:"barbell"}, {cap:"bench"} ] }, { all: [ {cap:"dumbbell"}, {cap:"bench"} ] } ] },
    load_unit: "total_bar_load",
    load_portability: "absolute",
    profile: { resistance_peak: "stretch", stretch_emphasis: 4, rom_score: 4, shortened_overload: 2 },
    ratings: { rp_tier: {triceps:"S"}, sfr: 4, target_specificity: 5, stability_demand: 2, technique_demand: 3, injury_risk: 3, setup_cost: 2 },
    fatigue: { systemic: 1, local: 3 },
    unilateral: false, unilateral_capable: false, failure_safe: true,
    rep_suitability: { "5_8": 0.5, "8_12": 1.0, "12_20": 0.9, "20_30": 0.5 },
    variants: { angle_deg: [0,15], target: ["forehead","behind_head"] },
    ratio_anchors: { cable_pushdown: {r:1.06, c:0.35} },
    min_effective_load_hint: { bar_lb: 25 }
  },

  {
    id: "db_overhead_extension",
    name: "Overhead Dumbbell Triceps Extension",
    aliases: ["seated db french press", "two hand overhead extension"],
    family: "triceps_extension",
    hub: false,
    pattern: "isolation_extension",
    muscles: [
      { m: "triceps", role: "primary", contribution: 1.0 }
    ],
    requires: { any: [ { all: [ {cap:"dumbbell"} ] }, { all: [ {cap:"dumbbell"}, {cap:"adjustable_bench"} ] } ] },
    load_unit: "per_dumbbell",
    load_portability: "absolute",
    profile: { resistance_peak: "stretch", stretch_emphasis: 5, rom_score: 5, shortened_overload: 1 },
    ratings: { rp_tier: {triceps:"S"}, sfr: 4, target_specificity: 5, stability_demand: 3, technique_demand: 2, injury_risk: 2, setup_cost: 1 },
    fatigue: { systemic: 1, local: 3 },
    unilateral: false, unilateral_capable: true, failure_safe: true,
    rep_suitability: { "5_8": 0.4, "8_12": 1.0, "12_20": 1.0, "20_30": 0.6 },
    ratio_anchors: { ez_skullcrusher: {r:0.74, c:0.4} },
    min_effective_load_hint: { per_hand_lb: 10 }
  },

  {
    id: "cable_overhead_extension",
    name: "Overhead Cable Triceps Extension",
    aliases: ["cable french press", "rope overhead extension"],
    family: "triceps_extension",
    hub: false,
    pattern: "isolation_extension",
    muscles: [
      { m: "triceps", role: "primary", contribution: 1.0 }
    ],
    requires: { any: [ { all: [ {cap:"cable"} ] }, { all: [ {cap:"freemotion"} ] } ] },
    load_unit: "stack_pin",
    load_portability: "machine_relative",
    profile: { resistance_peak: "stretch", stretch_emphasis: 5, rom_score: 5, shortened_overload: 3 },
    ratings: { rp_tier: {triceps:"S"}, sfr: 5, target_specificity: 5, stability_demand: 2, technique_demand: 2, injury_risk: 1, setup_cost: 2 },
    fatigue: { systemic: 1, local: 3 },
    unilateral: false, unilateral_capable: true, failure_safe: true,
    rep_suitability: { "5_8": 0.3, "8_12": 1.0, "12_20": 1.0, "20_30": 0.7 },
    ratio_anchors: { ez_skullcrusher: {r:0.74, c:0.25} },
    min_effective_load_hint: { stack_min_lb: 10 }
  },

  {
    id: "triceps_extension_machine",
    name: "Triceps Extension Machine",
    aliases: ["machine triceps extension", "seated dip machine"],
    family: "triceps_extension",
    hub: false,
    pattern: "isolation_extension",
    muscles: [
      { m: "triceps", role: "primary", contribution: 1.0 }
    ],
    requires: { any: [ { all: [ {cap:"machine", machine_key:"triceps_extension_machine"} ] } ] },
    load_unit: "stack_pin",
    load_portability: "machine_relative",
    profile: { resistance_peak: "flat", stretch_emphasis: 3, rom_score: 3, shortened_overload: 4 },
    ratings: { rp_tier: {triceps:"A"}, sfr: 5, target_specificity: 5, stability_demand: 1, technique_demand: 1, injury_risk: 1, setup_cost: 1 },
    fatigue: { systemic: 1, local: 3 },
    unilateral: false, unilateral_capable: true, failure_safe: true,
    rep_suitability: { "5_8": 0.4, "8_12": 1.0, "12_20": 1.0, "20_30": 0.7 },
    ratio_anchors: { ez_skullcrusher: {r:0.95, c:0.2} },
    min_effective_load_hint: { stack_min_lb: 15 }
  },

  {
    id: "close_grip_bench",
    name: "Close-Grip Bench Press",
    aliases: ["cgbp", "narrow grip bench"],
    family: "close_grip_press",
    hub: true,
    pattern: "horizontal_press",
    muscles: [
      { m: "triceps", role: "primary", contribution: 1.0 },
      { m: "chest", role: "secondary", contribution: 0.6 },
      { m: "front_delt", role: "secondary", contribution: 0.4 }
    ],
    requires: { any: [ { all: [ {cap:"barbell"}, {cap:"bench"}, {cap:"squat_rack"} ] }, { all: [ {cap:"smith"}, {cap:"bench"} ] } ] },
    load_unit: "total_bar_load",
    load_portability: "absolute",
    profile: { resistance_peak: "mid", stretch_emphasis: 3, rom_score: 3, shortened_overload: 3 },
    ratings: { rp_tier: {triceps:"A", chest:"C", front_delt:"D"}, sfr: 3, target_specificity: 3, stability_demand: 3, technique_demand: 3, injury_risk: 2, setup_cost: 3 },
    fatigue: { systemic: 3, local: 3 },
    unilateral: false, unilateral_capable: false, failure_safe: false,
    rep_suitability: { "5_8": 1.0, "8_12": 0.9, "12_20": 0.5, "20_30": 0.2 },
    ratio_anchors: { bb_flat_bench: {r:0.84, c:0.7} },
    min_effective_load_hint: { bar_lb: 45 }
  },

  {
    id: "diamond_pushup",
    name: "Diamond Push-Up",
    aliases: ["close grip pushup", "triangle pushup"],
    family: "close_grip_press",
    hub: false,
    pattern: "horizontal_press",
    muscles: [
      { m: "triceps", role: "primary", contribution: 1.0 },
      { m: "chest", role: "secondary", contribution: 0.5 },
      { m: "front_delt", role: "secondary", contribution: 0.3 }
    ],
    requires: { any: [ { all: [ {cap:"bodyweight_only"} ] } ] },
    load_unit: "bodyweight_plus",
    load_portability: "absolute",
    profile: { resistance_peak: "stretch", stretch_emphasis: 3, rom_score: 3, shortened_overload: 2 },
    ratings: { rp_tier: {triceps:"B", chest:"D", front_delt:"D"}, sfr: 4, target_specificity: 3, stability_demand: 3, technique_demand: 2, injury_risk: 2, setup_cost: 1 },
    fatigue: { systemic: 2, local: 3 },
    unilateral: false, unilateral_capable: false, failure_safe: true,
    rep_suitability: { "5_8": 0.3, "8_12": 0.8, "12_20": 1.0, "20_30": 0.8 },
    ratio_anchors: { close_grip_bench: {r:0.3, c:0.15} }
  },

  /* ======================= FOREARMS ======================= */

  {
    id: "bb_wrist_curl",
    name: "Barbell Wrist Curl",
    aliases: ["wrist curl", "forearm curl"],
    family: "wrist_curl",
    hub: true,
    pattern: "isolation_curl",
    muscles: [
      { m: "forearms", role: "primary", contribution: 1.0 }
    ],
    requires: { any: [ { all: [ {cap:"barbell"}, {cap:"bench"} ] }, { all: [ {cap:"dumbbell"}, {cap:"bench"} ] } ] },
    load_unit: "total_bar_load",
    load_portability: "absolute",
    profile: { resistance_peak: "stretch", stretch_emphasis: 4, rom_score: 3, shortened_overload: 3 },
    ratings: { rp_tier: {forearms:"A"}, sfr: 4, target_specificity: 5, stability_demand: 1, technique_demand: 1, injury_risk: 2, setup_cost: 2 },
    fatigue: { systemic: 1, local: 2 },
    unilateral: false, unilateral_capable: true, failure_safe: true,
    rep_suitability: { "5_8": 0.2, "8_12": 0.8, "12_20": 1.0, "20_30": 1.0 },
    ratio_anchors: { db_curl: {r:1.67, c:0.3} },
    min_effective_load_hint: { bar_lb: 25 }
  },

  {
    id: "bb_reverse_wrist_curl",
    name: "Reverse Wrist Curl",
    aliases: ["wrist extension", "extensor curl"],
    family: "wrist_curl",
    hub: false,
    pattern: "isolation_extension",
    muscles: [
      { m: "forearms", role: "primary", contribution: 1.0 }
    ],
    requires: { any: [ { all: [ {cap:"barbell"}, {cap:"bench"} ] }, { all: [ {cap:"dumbbell"}, {cap:"bench"} ] } ] },
    load_unit: "total_bar_load",
    load_portability: "absolute",
    profile: { resistance_peak: "shortened", stretch_emphasis: 3, rom_score: 3, shortened_overload: 4 },
    ratings: { rp_tier: {forearms:"B"}, sfr: 4, target_specificity: 5, stability_demand: 1, technique_demand: 1, injury_risk: 2, setup_cost: 2 },
    fatigue: { systemic: 1, local: 2 },
    unilateral: false, unilateral_capable: true, failure_safe: true,
    rep_suitability: { "5_8": 0.1, "8_12": 0.7, "12_20": 1.0, "20_30": 1.0 },
    ratio_anchors: { bb_wrist_curl: {r:0.47, c:0.5} },
    min_effective_load_hint: { bar_lb: 25, note: "even an empty 25 lb ez bar is often too heavy for reverse wrist curls; use a light dumbbell" }
  },

  {
    id: "band_wrist_curl",
    name: "Band Wrist Curl",
    aliases: ["banded forearm curl"],
    family: "wrist_curl",
    hub: false,
    pattern: "isolation_curl",
    muscles: [
      { m: "forearms", role: "primary", contribution: 1.0 }
    ],
    requires: { any: [ { all: [ {cap:"band"} ] } ] },
    load_unit: "band_tension",
    load_portability: "absolute",
    profile: { resistance_peak: "shortened", stretch_emphasis: 1, rom_score: 3, shortened_overload: 5 },
    ratings: { rp_tier: {forearms:"C"}, sfr: 4, target_specificity: 5, stability_demand: 1, technique_demand: 1, injury_risk: 1, setup_cost: 1 },
    fatigue: { systemic: 1, local: 2 },
    unilateral: false, unilateral_capable: true, failure_safe: true,
    rep_suitability: { "5_8": 0.1, "8_12": 0.4, "12_20": 1.0, "20_30": 1.0 },
    ratio_anchors: { bb_wrist_curl: {r:0.2, c:0.1} }
  },

  {
    id: "bb_reverse_curl",
    name: "Reverse Curl",
    aliases: ["pronated curl", "brachioradialis curl"],
    family: "reverse_curl",
    hub: true,
    pattern: "isolation_curl",
    muscles: [
      { m: "forearms", role: "primary", contribution: 1.0 },
      { m: "biceps", role: "secondary", contribution: 0.5 }
    ],
    requires: { any: [ { all: [ {cap:"barbell"} ] }, { all: [ {cap:"cable"}, {cap:"low_pulley"} ] }, { all: [ {cap:"dumbbell"} ] } ] },
    load_unit: "total_bar_load",
    load_portability: "absolute",
    profile: { resistance_peak: "mid", stretch_emphasis: 3, rom_score: 3, shortened_overload: 3 },
    ratings: { rp_tier: {forearms:"S", biceps:"C"}, sfr: 4, target_specificity: 4, stability_demand: 4, technique_demand: 2, injury_risk: 1, setup_cost: 1 },
    fatigue: { systemic: 1, local: 3 },
    unilateral: false, unilateral_capable: true, failure_safe: true,
    rep_suitability: { "5_8": 0.3, "8_12": 0.9, "12_20": 1.0, "20_30": 0.7 },
    ratio_anchors: { db_curl: {r:1.44, c:0.4} },
    min_effective_load_hint: { bar_lb: 25 }
  },

  {
    id: "farmers_carry",
    name: "Farmer's Carry",
    aliases: ["farmers walk", "loaded carry"],
    family: "carry",
    hub: true,
    pattern: "shrug",
    muscles: [
      { m: "forearms", role: "primary", contribution: 1.0 },
      { m: "traps", role: "primary", contribution: 0.7 },
      { m: "abs", role: "secondary", contribution: 0.4 }
    ],
    requires: { any: [ { all: [ {cap:"dumbbell"} ] }, { all: [ {cap:"barbell"} ] } ] },
    load_unit: "per_dumbbell",
    load_portability: "absolute",
    profile: { resistance_peak: "flat", stretch_emphasis: 1, rom_score: 1, shortened_overload: 3 },
    ratings: { rp_tier: {forearms:"A", traps:"B", abs:"D"}, sfr: 3, target_specificity: 3, stability_demand: 5, technique_demand: 1, injury_risk: 1, setup_cost: 2 },
    fatigue: { systemic: 4, local: 3 },
    unilateral: false, unilateral_capable: true, failure_safe: true,
    rep_suitability: { "5_8": 0.3, "8_12": 0.6, "12_20": 1.0, "20_30": 1.0 },
    ratio_anchors: { bb_shrug: {r:0.35, c:0.3} },
    min_effective_load_hint: { per_hand_lb: 20 }
  },

  /* ======================= QUADS / SQUAT ======================= */

  {
    id: "bb_back_squat",
    name: "Barbell Back Squat",
    aliases: ["back squat", "squat", "high bar squat"],
    family: "squat",
    hub: true,
    pattern: "squat",
    muscles: [
      { m: "quads", role: "primary", contribution: 1.0 },
      { m: "glutes", role: "primary", contribution: 0.7 },
      { m: "adductors", role: "secondary", contribution: 0.4 },
      { m: "hamstrings", role: "secondary", contribution: 0.3 },
      { m: "abs", role: "secondary", contribution: 0.3 }
    ],
    requires: { any: [ { all: [ {cap:"barbell"}, {cap:"squat_rack"}, {cap:"safety_arms"} ] }, { all: [ {cap:"barbell"}, {cap:"squat_rack"} ] } ] },
    load_unit: "total_bar_load",
    load_portability: "absolute",
    profile: { resistance_peak: "stretch", stretch_emphasis: 4, rom_score: 4, shortened_overload: 2 },
    ratings: { rp_tier: {quads:"S", glutes:"A", adductors:"C", hamstrings:"D", abs:"D"}, sfr: 3, target_specificity: 3, stability_demand: 5, technique_demand: 4, injury_risk: 3, setup_cost: 3 },
    fatigue: { systemic: 5, local: 4 },
    unilateral: false, unilateral_capable: false, failure_safe: false,
    rep_suitability: { "5_8": 1.0, "8_12": 0.9, "12_20": 0.5, "20_30": 0.2 },
    variants: { bar_position: ["high_bar","low_bar"], stance: ["shoulder","wide"] },
    ratio_anchors: {},
    min_effective_load_hint: { bar_lb: 45 }
  },

  {
    id: "bb_front_squat",
    name: "Front Squat",
    aliases: ["barbell front squat"],
    family: "squat",
    hub: false,
    pattern: "squat",
    muscles: [
      { m: "quads", role: "primary", contribution: 1.0 },
      { m: "glutes", role: "secondary", contribution: 0.5 },
      { m: "abs", role: "secondary", contribution: 0.4 },
      { m: "adductors", role: "secondary", contribution: 0.3 }
    ],
    requires: { any: [ { all: [ {cap:"barbell"}, {cap:"squat_rack"}, {cap:"safety_arms"} ] }, { all: [ {cap:"barbell"}, {cap:"squat_rack"} ] } ] },
    load_unit: "total_bar_load",
    load_portability: "absolute",
    profile: { resistance_peak: "stretch", stretch_emphasis: 5, rom_score: 5, shortened_overload: 2 },
    ratings: { rp_tier: {quads:"S", glutes:"C", abs:"C", adductors:"D"}, sfr: 3, target_specificity: 4, stability_demand: 5, technique_demand: 5, injury_risk: 3, setup_cost: 3 },
    fatigue: { systemic: 4, local: 4 },
    unilateral: false, unilateral_capable: false, failure_safe: true,
    rep_suitability: { "5_8": 1.0, "8_12": 0.9, "12_20": 0.4, "20_30": 0.1 },
    ratio_anchors: { bb_back_squat: {r:0.79, c:0.6} },
    min_effective_load_hint: { bar_lb: 45 }
  },

  {
    id: "smith_squat",
    name: "Smith Machine Squat",
    aliases: ["smith squat"],
    family: "squat",
    hub: false,
    pattern: "squat",
    muscles: [
      { m: "quads", role: "primary", contribution: 1.0 },
      { m: "glutes", role: "secondary", contribution: 0.6 },
      { m: "adductors", role: "secondary", contribution: 0.3 }
    ],
    requires: { any: [ { all: [ {cap:"smith"} ] } ] },
    load_unit: "total_bar_load",
    load_portability: "machine_relative",
    profile: { resistance_peak: "stretch", stretch_emphasis: 4, rom_score: 4, shortened_overload: 2 },
    ratings: { rp_tier: {quads:"A", glutes:"B", adductors:"D"}, sfr: 4, target_specificity: 4, stability_demand: 2, technique_demand: 2, injury_risk: 2, setup_cost: 2 },
    fatigue: { systemic: 4, local: 4 },
    unilateral: false, unilateral_capable: false, failure_safe: true,
    rep_suitability: { "5_8": 0.9, "8_12": 1.0, "12_20": 0.7, "20_30": 0.3 },
    variants: { stance: ["under_bar","feet_forward"] },
    ratio_anchors: { bb_back_squat: {r:1.05, c:0.4} },
    min_effective_load_hint: { bar_lb: 20 }
  },

  {
    id: "goblet_squat",
    name: "Goblet Squat",
    aliases: ["db goblet squat", "kb goblet squat"],
    family: "squat",
    hub: false,
    pattern: "squat",
    muscles: [
      { m: "quads", role: "primary", contribution: 1.0 },
      { m: "glutes", role: "secondary", contribution: 0.5 },
      { m: "abs", role: "secondary", contribution: 0.3 },
      { m: "adductors", role: "secondary", contribution: 0.3 }
    ],
    requires: { any: [ { all: [ {cap:"dumbbell"} ] } ] },
    load_unit: "per_dumbbell",
    load_portability: "absolute",
    profile: { resistance_peak: "stretch", stretch_emphasis: 5, rom_score: 5, shortened_overload: 1 },
    ratings: { rp_tier: {quads:"B", glutes:"C", abs:"D", adductors:"D"}, sfr: 4, target_specificity: 3, stability_demand: 3, technique_demand: 2, injury_risk: 1, setup_cost: 1 },
    fatigue: { systemic: 3, local: 3 },
    unilateral: false, unilateral_capable: false, failure_safe: true,
    rep_suitability: { "5_8": 0.4, "8_12": 1.0, "12_20": 1.0, "20_30": 0.6 },
    ratio_anchors: { bb_back_squat: {r:0.29, c:0.4} },
    min_effective_load_hint: { per_hand_lb: 20 }
  },

  {
    id: "bw_squat",
    name: "Bodyweight Squat",
    aliases: ["air squat"],
    family: "squat",
    hub: false,
    pattern: "squat",
    muscles: [
      { m: "quads", role: "primary", contribution: 1.0 },
      { m: "glutes", role: "secondary", contribution: 0.5 },
      { m: "adductors", role: "secondary", contribution: 0.25 }
    ],
    requires: { any: [ { all: [ {cap:"bodyweight_only"} ] } ] },
    load_unit: "bodyweight_plus",
    load_portability: "absolute",
    profile: { resistance_peak: "stretch", stretch_emphasis: 4, rom_score: 4, shortened_overload: 1 },
    ratings: { rp_tier: {quads:"C", glutes:"D", adductors:"D"}, sfr: 4, target_specificity: 2, stability_demand: 3, technique_demand: 1, injury_risk: 1, setup_cost: 1 },
    fatigue: { systemic: 2, local: 3 },
    unilateral: false, unilateral_capable: false, failure_safe: true,
    rep_suitability: { "5_8": 0.1, "8_12": 0.3, "12_20": 0.8, "20_30": 1.0 },
    ratio_anchors: { bb_back_squat: {r:0.2, c:0.15} }
  },

  /* [Robert] CrossFit staples the library lacked — without these the benchmark WODs (Barbara,
     Angie, Fran) can't be logged with the right movements. */
  {
    id: "situp",
    name: "Sit-Up",
    aliases: ["abmat sit-up", "crossfit sit-up"],
    family: "crunch",
    hub: false,
    pattern: "core",
    muscles: [ { m: "abs", role: "primary", contribution: 1.0 } ],
    requires: { any: [ { all: [ {cap:"bodyweight_only"} ] } ] },
    load_unit: "bodyweight_plus",
    load_portability: "absolute",
    profile: { resistance_peak: "shortened", stretch_emphasis: 2, rom_score: 3, shortened_overload: 4 },
    ratings: { rp_tier: {abs:"C"}, sfr: 4, target_specificity: 3, stability_demand: 2, technique_demand: 1, injury_risk: 1, setup_cost: 1 },
    fatigue: { systemic: 1, local: 3 },
    unilateral: false, unilateral_capable: false, failure_safe: true,
    rep_suitability: { "5_8": 0.1, "8_12": 0.4, "12_20": 0.9, "20_30": 1.0 },
    ratio_anchors: { cable_crunch: {r:0.3, c:0.15} }
  },

  {
    id: "bb_thruster",
    name: "Barbell Thruster",
    aliases: ["thruster", "squat to press"],
    family: "thruster",
    hub: false,
    pattern: "squat",
    muscles: [
      { m: "quads", role: "primary", contribution: 1.0 },
      { m: "front_delt", role: "primary", contribution: 0.8 },
      { m: "glutes", role: "secondary", contribution: 0.5 },
      { m: "triceps", role: "secondary", contribution: 0.4 }
    ],
    requires: { any: [ { all: [ {cap:"barbell"} ] } ] },
    load_unit: "total_bar_load",
    load_portability: "absolute",
    profile: { resistance_peak: "stretch", stretch_emphasis: 3, rom_score: 5, shortened_overload: 3 },
    ratings: { rp_tier: {quads:"C", front_delt:"B", glutes:"D", triceps:"D"}, sfr: 2, target_specificity: 2, stability_demand: 4, technique_demand: 4, injury_risk: 2, setup_cost: 2 },
    fatigue: { systemic: 5, local: 4 },
    unilateral: false, unilateral_capable: false, failure_safe: false,
    rep_suitability: { "5_8": 0.6, "8_12": 1.0, "12_20": 0.9, "20_30": 0.5 },
    ratio_anchors: { bb_front_squat: {r:0.5, c:0.2} }
  },

  /* [Robert] Plyometrics — his leg circuits run on these and the library had none, so a round-based
     leg day couldn't be logged at all. Bodyweight, high-rep, higher systemic cost than their
     grounded cousins. */
  {
    id: "jumping_lunge",
    name: "Jumping Lunge",
    aliases: ["split jump", "plyo lunge", "jump lunge", "alternating jump lunge"],
    family: "lunge",
    hub: false,
    pattern: "lunge",
    muscles: [
      { m: "quads", role: "primary", contribution: 1.0 },
      { m: "glutes", role: "primary", contribution: 0.7 },
      { m: "hamstrings", role: "secondary", contribution: 0.3 },
      { m: "calves", role: "secondary", contribution: 0.35 }
    ],
    requires: { any: [ { all: [ {cap:"bodyweight_only"} ] } ] },
    load_unit: "bodyweight_plus",
    load_portability: "absolute",
    profile: { resistance_peak: "stretch", stretch_emphasis: 3, rom_score: 4, shortened_overload: 2 },
    ratings: { rp_tier: {quads:"C", glutes:"C", hamstrings:"D", calves:"D"}, sfr: 3, target_specificity: 2, stability_demand: 4, technique_demand: 2, injury_risk: 2, setup_cost: 1 },
    fatigue: { systemic: 3, local: 3 },
    unilateral: false, unilateral_capable: true, failure_safe: true,
    rep_suitability: { "5_8": 0.1, "8_12": 0.4, "12_20": 0.9, "20_30": 1.0 },
    ratio_anchors: { walking_lunge: {r:0.3, c:0.15} }
  },

  {
    id: "jump_squat",
    name: "Jump Squat",
    aliases: ["squat jump", "plyo squat"],
    family: "squat",
    hub: false,
    pattern: "squat",
    muscles: [
      { m: "quads", role: "primary", contribution: 1.0 },
      { m: "glutes", role: "primary", contribution: 0.6 },
      { m: "calves", role: "secondary", contribution: 0.4 }
    ],
    requires: { any: [ { all: [ {cap:"bodyweight_only"} ] } ] },
    load_unit: "bodyweight_plus",
    load_portability: "absolute",
    profile: { resistance_peak: "stretch", stretch_emphasis: 3, rom_score: 3, shortened_overload: 2 },
    ratings: { rp_tier: {quads:"C", glutes:"D", calves:"D"}, sfr: 3, target_specificity: 2, stability_demand: 3, technique_demand: 2, injury_risk: 2, setup_cost: 1 },
    fatigue: { systemic: 3, local: 3 },
    unilateral: false, unilateral_capable: false, failure_safe: true,
    rep_suitability: { "5_8": 0.2, "8_12": 0.6, "12_20": 1.0, "20_30": 0.8 },
    ratio_anchors: { bb_back_squat: {r:0.2, c:0.15} }
  },

  {
    id: "belt_squat",
    name: "Belt Squat",
    aliases: ["belt squat machine", "pit shark"],
    family: "squat",
    hub: false,
    pattern: "squat",
    muscles: [
      { m: "quads", role: "primary", contribution: 1.0 },
      { m: "glutes", role: "secondary", contribution: 0.6 },
      { m: "adductors", role: "secondary", contribution: 0.3 }
    ],
    requires: { any: [ { all: [ {cap:"machine", machine_key:"hack_squat"} ] } ] },
    load_unit: "stack_pin",
    load_portability: "machine_relative",
    profile: { resistance_peak: "stretch", stretch_emphasis: 4, rom_score: 4, shortened_overload: 2 },
    ratings: { rp_tier: {quads:"A", glutes:"B", adductors:"D"}, sfr: 5, target_specificity: 4, stability_demand: 2, technique_demand: 2, injury_risk: 1, setup_cost: 3 },
    fatigue: { systemic: 3, local: 4 },
    unilateral: false, unilateral_capable: false, failure_safe: true,
    rep_suitability: { "5_8": 0.8, "8_12": 1.0, "12_20": 0.8, "20_30": 0.4 },
    ratio_anchors: { bb_back_squat: {r:0.79, c:0.2} }
  },

  {
    id: "hack_squat",
    name: "Hack Squat",
    aliases: ["machine hack squat"],
    family: "machine_squat",
    hub: true,
    pattern: "squat",
    muscles: [
      { m: "quads", role: "primary", contribution: 1.0 },
      { m: "glutes", role: "secondary", contribution: 0.5 },
      { m: "adductors", role: "secondary", contribution: 0.3 }
    ],
    requires: { any: [ { all: [ {cap:"machine", machine_key:"hack_squat"} ] } ] },
    load_unit: "carriage_plus",
    load_portability: "machine_relative",
    profile: { resistance_peak: "stretch", stretch_emphasis: 5, rom_score: 5, shortened_overload: 2 },
    ratings: { rp_tier: {quads:"S", glutes:"B", adductors:"D"}, sfr: 5, target_specificity: 5, stability_demand: 1, technique_demand: 2, injury_risk: 1, setup_cost: 2 },
    fatigue: { systemic: 4, local: 5 },
    unilateral: false, unilateral_capable: true, failure_safe: true,
    rep_suitability: { "5_8": 0.8, "8_12": 1.0, "12_20": 0.9, "20_30": 0.4 },
    variants: { stance: ["low","high","narrow"] },
    ratio_anchors: { bb_back_squat: {r:1.14, c:0.25} }
  },

  {
    id: "leg_press",
    name: "Leg Press",
    aliases: ["45 degree leg press", "horizontal leg press"],
    family: "machine_squat",
    hub: false,
    pattern: "squat",
    muscles: [
      { m: "quads", role: "primary", contribution: 1.0 },
      { m: "glutes", role: "primary", contribution: 0.6 },
      { m: "adductors", role: "secondary", contribution: 0.35 },
      { m: "hamstrings", role: "secondary", contribution: 0.2 }
    ],
    requires: { any: [ { all: [ {cap:"machine", machine_key:"leg_press"} ] } ] },
    load_unit: "carriage_plus",
    load_portability: "machine_relative",
    profile: { resistance_peak: "stretch", stretch_emphasis: 4, rom_score: 4, shortened_overload: 2 },
    ratings: { rp_tier: {quads:"S", glutes:"A", adductors:"C", hamstrings:"D"}, sfr: 5, target_specificity: 4, stability_demand: 1, technique_demand: 1, injury_risk: 1, setup_cost: 1 },
    fatigue: { systemic: 3, local: 5 },
    unilateral: false, unilateral_capable: true, failure_safe: true,
    rep_suitability: { "5_8": 0.7, "8_12": 1.0, "12_20": 1.0, "20_30": 0.6 },
    variants: { foot_position: ["low","mid","high"], stance: ["narrow","wide"] },
    ratio_anchors: { hack_squat: {r:1.67, c:0.2} }
  },

  {
    id: "leg_extension",
    name: "Leg Extension",
    aliases: ["knee extension", "quad extension"],
    family: "leg_extension",
    hub: true,
    pattern: "isolation_extension",
    muscles: [
      { m: "quads", role: "primary", contribution: 1.0 }
    ],
    requires: { any: [ { all: [ {cap:"machine", machine_key:"leg_extension"} ] } ] },
    load_unit: "stack_pin",
    load_portability: "machine_relative",
    profile: { resistance_peak: "shortened", stretch_emphasis: 3, rom_score: 4, shortened_overload: 5 },
    ratings: { rp_tier: {quads:"S"}, sfr: 5, target_specificity: 5, stability_demand: 1, technique_demand: 1, injury_risk: 2, setup_cost: 1 },
    fatigue: { systemic: 1, local: 4 },
    unilateral: false, unilateral_capable: true, failure_safe: true,
    rep_suitability: { "5_8": 0.2, "8_12": 0.9, "12_20": 1.0, "20_30": 0.8 },
    ratio_anchors: { bb_back_squat: {r:0.54, c:0.2} },
    min_effective_load_hint: { stack_min_lb: 15 }
  },

  {
    id: "sissy_squat",
    name: "Sissy Squat",
    aliases: ["kneeling quad extension"],
    family: "leg_extension",
    hub: false,
    pattern: "isolation_extension",
    muscles: [
      { m: "quads", role: "primary", contribution: 1.0 }
    ],
    requires: { any: [ { all: [ {cap:"bodyweight_only"} ] }, { all: [ {cap:"bodyweight_loadable"} ] } ] },
    load_unit: "bodyweight_plus",
    load_portability: "absolute",
    profile: { resistance_peak: "stretch", stretch_emphasis: 5, rom_score: 4, shortened_overload: 2 },
    ratings: { rp_tier: {quads:"B"}, sfr: 3, target_specificity: 5, stability_demand: 4, technique_demand: 4, injury_risk: 3, setup_cost: 1 },
    fatigue: { systemic: 1, local: 4 },
    unilateral: false, unilateral_capable: false, failure_safe: true,
    rep_suitability: { "5_8": 0.2, "8_12": 0.8, "12_20": 1.0, "20_30": 0.7 },
    ratio_anchors: { leg_extension: {r:0.15, c:0.15} }
  },

  {
    id: "bulgarian_split_squat",
    name: "Bulgarian Split Squat",
    aliases: ["rear foot elevated split squat", "rfess", "bss"],
    family: "lunge",
    hub: true,
    pattern: "lunge",
    muscles: [
      { m: "quads", role: "primary", contribution: 1.0 },
      { m: "glutes", role: "primary", contribution: 0.85 },
      { m: "adductors", role: "secondary", contribution: 0.4 },
      { m: "hamstrings", role: "secondary", contribution: 0.25 }
    ],
    requires: { any: [ { all: [ {cap:"dumbbell"}, {cap:"bench"} ] }, { all: [ {cap:"bodyweight_only"}, {cap:"bench"} ] }, { all: [ {cap:"smith"}, {cap:"bench"} ] } ] },
    load_unit: "per_dumbbell",
    load_portability: "absolute",
    profile: { resistance_peak: "stretch", stretch_emphasis: 5, rom_score: 5, shortened_overload: 2 },
    ratings: { rp_tier: {quads:"A", glutes:"S", adductors:"C", hamstrings:"D"}, sfr: 3, target_specificity: 4, stability_demand: 4, technique_demand: 3, injury_risk: 2, setup_cost: 2 },
    fatigue: { systemic: 4, local: 4 },
    unilateral: true, unilateral_capable: true, failure_safe: true,
    rep_suitability: { "5_8": 0.6, "8_12": 1.0, "12_20": 0.9, "20_30": 0.4 },
    ratio_anchors: { bb_back_squat: {r:0.22, c:0.4} },
    min_effective_load_hint: { per_hand_lb: 0 }
  },

  {
    id: "walking_lunge",
    name: "Walking Lunge",
    aliases: ["db walking lunge"],
    family: "lunge",
    hub: false,
    pattern: "lunge",
    muscles: [
      { m: "quads", role: "primary", contribution: 1.0 },
      { m: "glutes", role: "primary", contribution: 0.85 },
      { m: "adductors", role: "secondary", contribution: 0.4 },
      { m: "hamstrings", role: "secondary", contribution: 0.25 }
    ],
    requires: { any: [ { all: [ {cap:"dumbbell"} ] }, { all: [ {cap:"bodyweight_only"} ] }, { all: [ {cap:"barbell"}, {cap:"squat_rack"} ] } ] },
    load_unit: "per_dumbbell",
    load_portability: "absolute",
    profile: { resistance_peak: "stretch", stretch_emphasis: 4, rom_score: 4, shortened_overload: 2 },
    ratings: { rp_tier: {quads:"B", glutes:"A", adductors:"C", hamstrings:"D"}, sfr: 3, target_specificity: 3, stability_demand: 4, technique_demand: 2, injury_risk: 2, setup_cost: 1 },
    fatigue: { systemic: 4, local: 4 },
    unilateral: true, unilateral_capable: true, failure_safe: true,
    rep_suitability: { "5_8": 0.4, "8_12": 0.9, "12_20": 1.0, "20_30": 0.6 },
    ratio_anchors: { bulgarian_split_squat: {r:0.79, c:0.4} },
    min_effective_load_hint: { per_hand_lb: 0 }
  },

  {
    id: "reverse_lunge",
    name: "Reverse Lunge",
    aliases: ["step back lunge"],
    family: "lunge",
    hub: false,
    pattern: "lunge",
    muscles: [
      { m: "quads", role: "primary", contribution: 1.0 },
      { m: "glutes", role: "primary", contribution: 0.8 },
      { m: "adductors", role: "secondary", contribution: 0.35 }
    ],
    requires: { any: [ { all: [ {cap:"dumbbell"} ] }, { all: [ {cap:"bodyweight_only"} ] } ] },
    load_unit: "per_dumbbell",
    load_portability: "absolute",
    profile: { resistance_peak: "stretch", stretch_emphasis: 4, rom_score: 4, shortened_overload: 2 },
    ratings: { rp_tier: {quads:"B", glutes:"A", adductors:"D"}, sfr: 4, target_specificity: 3, stability_demand: 4, technique_demand: 2, injury_risk: 1, setup_cost: 1 },
    fatigue: { systemic: 3, local: 4 },
    unilateral: true, unilateral_capable: true, failure_safe: true,
    rep_suitability: { "5_8": 0.4, "8_12": 1.0, "12_20": 1.0, "20_30": 0.6 },
    ratio_anchors: { bulgarian_split_squat: {r:0.86, c:0.4} },
    min_effective_load_hint: { per_hand_lb: 0 }
  },

  {
    id: "step_up",
    name: "Step-Up",
    aliases: ["db step up", "box step up"],
    family: "lunge",
    hub: false,
    pattern: "lunge",
    muscles: [
      { m: "glutes", role: "primary", contribution: 1.0 },
      { m: "quads", role: "primary", contribution: 0.8 },
      { m: "hamstrings", role: "secondary", contribution: 0.3 }
    ],
    requires: { any: [ { all: [ {cap:"dumbbell"}, {cap:"bench"} ] }, { all: [ {cap:"bodyweight_only"}, {cap:"bench"} ] } ] },
    load_unit: "per_dumbbell",
    load_portability: "absolute",
    profile: { resistance_peak: "stretch", stretch_emphasis: 4, rom_score: 4, shortened_overload: 3 },
    ratings: { rp_tier: {glutes:"A", quads:"C", hamstrings:"D"}, sfr: 3, target_specificity: 3, stability_demand: 4, technique_demand: 3, injury_risk: 1, setup_cost: 2 },
    fatigue: { systemic: 3, local: 3 },
    unilateral: true, unilateral_capable: true, failure_safe: true,
    rep_suitability: { "5_8": 0.4, "8_12": 1.0, "12_20": 1.0, "20_30": 0.6 },
    variants: { height: ["knee","above_knee"] },
    ratio_anchors: { bulgarian_split_squat: {r:0.79, c:0.35} },
    min_effective_load_hint: { per_hand_lb: 0 }
  },

  /* ======================= HAMSTRINGS / HINGE ======================= */

  {
    id: "conventional_deadlift",
    name: "Conventional Deadlift",
    aliases: ["deadlift", "dl"],
    family: "deadlift",
    hub: true,
    pattern: "hinge",
    muscles: [
      { m: "back", role: "primary", contribution: 1.0 },
      { m: "glutes", role: "primary", contribution: 0.8 },
      { m: "hamstrings", role: "primary", contribution: 0.7 },
      { m: "traps", role: "secondary", contribution: 0.5 },
      { m: "forearms", role: "secondary", contribution: 0.4 },
      { m: "quads", role: "secondary", contribution: 0.3 }
    ],
    requires: { any: [ { all: [ {cap:"barbell"} ] } ] },
    load_unit: "total_bar_load",
    load_portability: "absolute",
    profile: { resistance_peak: "mid", stretch_emphasis: 2, rom_score: 3, shortened_overload: 3 },
    ratings: { rp_tier: {back:"B", glutes:"B", hamstrings:"C", traps:"B", forearms:"C", quads:"D"}, sfr: 1, target_specificity: 2, stability_demand: 5, technique_demand: 5, injury_risk: 4, setup_cost: 3 },
    fatigue: { systemic: 5, local: 4 },
    unilateral: false, unilateral_capable: false, failure_safe: true,
    rep_suitability: { "5_8": 1.0, "8_12": 0.6, "12_20": 0.2, "20_30": 0.1 },
    variants: { stance: ["conventional","sumo"], grip: ["double_overhand","mixed","hook"] },
    ratio_anchors: { bb_back_squat: {r:1.29, c:0.6} },
    min_effective_load_hint: { bar_lb: 45 }
  },

  {
    id: "trap_bar_deadlift",
    name: "Trap Bar Deadlift",
    aliases: ["hex bar deadlift"],
    family: "deadlift",
    hub: false,
    pattern: "hinge",
    muscles: [
      { m: "quads", role: "primary", contribution: 1.0 },
      { m: "glutes", role: "primary", contribution: 0.8 },
      { m: "back", role: "secondary", contribution: 0.6 },
      { m: "hamstrings", role: "secondary", contribution: 0.5 },
      { m: "traps", role: "secondary", contribution: 0.5 },
      { m: "forearms", role: "secondary", contribution: 0.4 }
    ],
    requires: { any: [ { all: [ {cap:"barbell"} ] } ] },
    load_unit: "total_bar_load",
    load_portability: "absolute",
    profile: { resistance_peak: "mid", stretch_emphasis: 2, rom_score: 3, shortened_overload: 3 },
    ratings: { rp_tier: {quads:"C", glutes:"B", back:"C", hamstrings:"D", traps:"B", forearms:"C"}, sfr: 2, target_specificity: 2, stability_demand: 4, technique_demand: 3, injury_risk: 3, setup_cost: 3 },
    fatigue: { systemic: 5, local: 4 },
    unilateral: false, unilateral_capable: false, failure_safe: true,
    rep_suitability: { "5_8": 1.0, "8_12": 0.7, "12_20": 0.3, "20_30": 0.1 },
    ratio_anchors: { conventional_deadlift: {r:1.09, c:0.5} },
    min_effective_load_hint: { bar_lb: 45 }
  },

  {
    id: "bb_rdl",
    name: "Romanian Deadlift",
    aliases: ["rdl", "barbell rdl"],
    family: "rdl",
    hub: true,
    pattern: "hinge",
    muscles: [
      { m: "hamstrings", role: "primary", contribution: 1.0 },
      { m: "glutes", role: "primary", contribution: 0.8 },
      { m: "back", role: "secondary", contribution: 0.4 },
      { m: "forearms", role: "secondary", contribution: 0.3 }
    ],
    requires: { any: [ { all: [ {cap:"barbell"} ] }, { all: [ {cap:"barbell"}, {cap:"squat_rack"} ] } ] },
    load_unit: "total_bar_load",
    load_portability: "absolute",
    profile: { resistance_peak: "stretch", stretch_emphasis: 5, rom_score: 4, shortened_overload: 1 },
    ratings: { rp_tier: {hamstrings:"S", glutes:"A", back:"C", forearms:"C"}, sfr: 4, target_specificity: 4, stability_demand: 4, technique_demand: 4, injury_risk: 3, setup_cost: 2 },
    fatigue: { systemic: 4, local: 4 },
    unilateral: false, unilateral_capable: false, failure_safe: true,
    rep_suitability: { "5_8": 0.8, "8_12": 1.0, "12_20": 0.6, "20_30": 0.2 },
    ratio_anchors: { conventional_deadlift: {r:0.78, c:0.5} },
    min_effective_load_hint: { bar_lb: 45 }
  },

  {
    id: "db_rdl",
    name: "Dumbbell Romanian Deadlift",
    aliases: ["db rdl"],
    family: "rdl",
    hub: false,
    pattern: "hinge",
    muscles: [
      { m: "hamstrings", role: "primary", contribution: 1.0 },
      { m: "glutes", role: "primary", contribution: 0.8 },
      { m: "back", role: "secondary", contribution: 0.3 }
    ],
    requires: { any: [ { all: [ {cap:"dumbbell"} ] } ] },
    load_unit: "per_dumbbell",
    load_portability: "absolute",
    profile: { resistance_peak: "stretch", stretch_emphasis: 5, rom_score: 5, shortened_overload: 1 },
    ratings: { rp_tier: {hamstrings:"A", glutes:"A", back:"D"}, sfr: 4, target_specificity: 4, stability_demand: 3, technique_demand: 3, injury_risk: 2, setup_cost: 1 },
    fatigue: { systemic: 3, local: 4 },
    unilateral: false, unilateral_capable: true, failure_safe: true,
    rep_suitability: { "5_8": 0.6, "8_12": 1.0, "12_20": 0.8, "20_30": 0.3 },
    ratio_anchors: { bb_rdl: {r:0.29, c:0.4} },
    min_effective_load_hint: { per_hand_lb: 10 }
  },

  {
    id: "single_leg_rdl",
    name: "Single-Leg Romanian Deadlift",
    aliases: ["sl rdl", "one leg rdl"],
    family: "rdl",
    hub: false,
    pattern: "hinge",
    muscles: [
      { m: "hamstrings", role: "primary", contribution: 1.0 },
      { m: "glutes", role: "primary", contribution: 0.85 }
    ],
    requires: { any: [ { all: [ {cap:"dumbbell"} ] }, { all: [ {cap:"bodyweight_only"} ] } ] },
    load_unit: "per_dumbbell",
    load_portability: "absolute",
    profile: { resistance_peak: "stretch", stretch_emphasis: 5, rom_score: 5, shortened_overload: 1 },
    ratings: { rp_tier: {hamstrings:"B", glutes:"A"}, sfr: 3, target_specificity: 3, stability_demand: 5, technique_demand: 4, injury_risk: 1, setup_cost: 1 },
    fatigue: { systemic: 2, local: 3 },
    unilateral: true, unilateral_capable: true, failure_safe: true,
    rep_suitability: { "5_8": 0.4, "8_12": 1.0, "12_20": 1.0, "20_30": 0.5 },
    ratio_anchors: { bb_rdl: {r:0.16, c:0.3} },
    min_effective_load_hint: { per_hand_lb: 0 }
  },

  {
    id: "stiff_leg_deadlift",
    name: "Stiff-Leg Deadlift",
    aliases: ["sldl", "deficit stiff leg"],
    family: "rdl",
    hub: false,
    pattern: "hinge",
    muscles: [
      { m: "hamstrings", role: "primary", contribution: 1.0 },
      { m: "glutes", role: "primary", contribution: 0.7 },
      { m: "back", role: "secondary", contribution: 0.45 }
    ],
    requires: { any: [ { all: [ {cap:"barbell"} ] } ] },
    load_unit: "total_bar_load",
    load_portability: "absolute",
    profile: { resistance_peak: "stretch", stretch_emphasis: 5, rom_score: 5, shortened_overload: 1 },
    ratings: { rp_tier: {hamstrings:"S", glutes:"B", back:"C"}, sfr: 3, target_specificity: 4, stability_demand: 4, technique_demand: 4, injury_risk: 4, setup_cost: 2 },
    fatigue: { systemic: 4, local: 4 },
    unilateral: false, unilateral_capable: false, failure_safe: true,
    rep_suitability: { "5_8": 0.7, "8_12": 1.0, "12_20": 0.6, "20_30": 0.2 },
    ratio_anchors: { bb_rdl: {r:0.87, c:0.5} },
    min_effective_load_hint: { bar_lb: 45 }
  },

  {
    id: "band_rdl",
    name: "Band Romanian Deadlift",
    aliases: ["banded hip hinge", "band good morning"],
    family: "rdl",
    hub: false,
    pattern: "hinge",
    muscles: [
      { m: "hamstrings", role: "primary", contribution: 1.0 },
      { m: "glutes", role: "primary", contribution: 0.7 }
    ],
    requires: { any: [ { all: [ {cap:"band"} ] } ] },
    load_unit: "band_tension",
    load_portability: "absolute",
    profile: { resistance_peak: "shortened", stretch_emphasis: 2, rom_score: 4, shortened_overload: 5 },
    ratings: { rp_tier: {hamstrings:"C", glutes:"C"}, sfr: 4, target_specificity: 3, stability_demand: 3, technique_demand: 2, injury_risk: 1, setup_cost: 2 },
    fatigue: { systemic: 1, local: 2 },
    unilateral: false, unilateral_capable: true, failure_safe: true,
    rep_suitability: { "5_8": 0.1, "8_12": 0.5, "12_20": 1.0, "20_30": 0.9 },
    ratio_anchors: { bb_rdl: {r:0.1, c:0.1} }
  },

  {
    id: "bb_good_morning",
    name: "Good Morning",
    aliases: ["barbell good morning"],
    family: "good_morning",
    hub: true,
    pattern: "hinge",
    muscles: [
      { m: "hamstrings", role: "primary", contribution: 1.0 },
      { m: "glutes", role: "primary", contribution: 0.7 },
      { m: "back", role: "secondary", contribution: 0.5 }
    ],
    requires: { any: [ { all: [ {cap:"barbell"}, {cap:"squat_rack"} ] } ] },
    load_unit: "total_bar_load",
    load_portability: "absolute",
    profile: { resistance_peak: "stretch", stretch_emphasis: 5, rom_score: 4, shortened_overload: 1 },
    ratings: { rp_tier: {hamstrings:"A", glutes:"C", back:"C"}, sfr: 3, target_specificity: 3, stability_demand: 4, technique_demand: 4, injury_risk: 4, setup_cost: 2 },
    fatigue: { systemic: 4, local: 3 },
    unilateral: false, unilateral_capable: false, failure_safe: true,
    rep_suitability: { "5_8": 0.6, "8_12": 1.0, "12_20": 0.7, "20_30": 0.2 },
    ratio_anchors: { bb_rdl: {r:0.59, c:0.4} },
    min_effective_load_hint: { bar_lb: 45 }
  },

  {
    id: "back_extension_45",
    name: "45-Degree Back Extension",
    aliases: ["hyperextension", "roman chair back extension"],
    family: "good_morning",
    hub: false,
    pattern: "hinge",
    muscles: [
      { m: "hamstrings", role: "primary", contribution: 1.0 },
      { m: "glutes", role: "primary", contribution: 0.8 },
      { m: "back", role: "secondary", contribution: 0.5 }
    ],
    requires: { any: [ { all: [ {cap:"ghd"} ] }, { all: [ {cap:"machine", machine_key:"back_extension"} ] } ] },
    load_unit: "bodyweight_plus",
    load_portability: "absolute",
    profile: { resistance_peak: "shortened", stretch_emphasis: 3, rom_score: 3, shortened_overload: 5 },
    ratings: { rp_tier: {hamstrings:"B", glutes:"A", back:"C"}, sfr: 4, target_specificity: 4, stability_demand: 1, technique_demand: 2, injury_risk: 1, setup_cost: 2 },
    fatigue: { systemic: 2, local: 3 },
    unilateral: false, unilateral_capable: false, failure_safe: true,
    rep_suitability: { "5_8": 0.3, "8_12": 0.9, "12_20": 1.0, "20_30": 0.7 },
    variants: { bias: ["glute_rounded","hamstring_neutral"] },
    ratio_anchors: { bb_good_morning: {r:0.5, c:0.2} }
  },

  {
    id: "leg_curl_seated",
    name: "Seated Leg Curl",
    aliases: ["seated hamstring curl"],
    family: "leg_curl",
    hub: true,
    pattern: "isolation_curl",
    muscles: [
      { m: "hamstrings", role: "primary", contribution: 1.0 },
      { m: "calves", role: "secondary", contribution: 0.2 }
    ],
    requires: { any: [ { all: [ {cap:"machine", machine_key:"leg_curl_seated"} ] } ] },
    load_unit: "stack_pin",
    load_portability: "machine_relative",
    profile: { resistance_peak: "stretch", stretch_emphasis: 5, rom_score: 4, shortened_overload: 3 },
    ratings: { rp_tier: {hamstrings:"S", calves:"D"}, sfr: 5, target_specificity: 5, stability_demand: 1, technique_demand: 1, injury_risk: 1, setup_cost: 1 },
    fatigue: { systemic: 1, local: 4 },
    unilateral: false, unilateral_capable: true, failure_safe: true,
    rep_suitability: { "5_8": 0.4, "8_12": 1.0, "12_20": 1.0, "20_30": 0.7 },
    ratio_anchors: { bb_rdl: {r:0.48, c:0.2} },
    min_effective_load_hint: { stack_min_lb: 15 }
  },

  {
    id: "leg_curl_lying",
    name: "Lying Leg Curl",
    aliases: ["prone leg curl", "lying hamstring curl"],
    family: "leg_curl",
    hub: false,
    pattern: "isolation_curl",
    muscles: [
      { m: "hamstrings", role: "primary", contribution: 1.0 },
      { m: "calves", role: "secondary", contribution: 0.2 }
    ],
    requires: { any: [ { all: [ {cap:"machine", machine_key:"leg_curl_lying"} ] } ] },
    load_unit: "stack_pin",
    load_portability: "machine_relative",
    profile: { resistance_peak: "mid", stretch_emphasis: 3, rom_score: 4, shortened_overload: 4 },
    ratings: { rp_tier: {hamstrings:"A", calves:"D"}, sfr: 5, target_specificity: 5, stability_demand: 1, technique_demand: 1, injury_risk: 1, setup_cost: 1 },
    fatigue: { systemic: 1, local: 4 },
    unilateral: false, unilateral_capable: true, failure_safe: true,
    rep_suitability: { "5_8": 0.4, "8_12": 1.0, "12_20": 1.0, "20_30": 0.7 },
    ratio_anchors: { leg_curl_seated: {r:0.9, c:0.3} },
    min_effective_load_hint: { stack_min_lb: 15 }
  },

  {
    id: "nordic_curl",
    name: "Nordic Ham Curl",
    aliases: ["nordic hamstring curl", "russian leg curl"],
    family: "leg_curl",
    hub: false,
    pattern: "isolation_curl",
    muscles: [
      { m: "hamstrings", role: "primary", contribution: 1.0 },
      { m: "calves", role: "secondary", contribution: 0.2 }
    ],
    requires: { any: [ { all: [ {cap:"bodyweight_only"} ] }, { all: [ {cap:"ghd"} ] } ] },
    load_unit: "bodyweight_plus",
    load_portability: "absolute",
    profile: { resistance_peak: "stretch", stretch_emphasis: 4, rom_score: 3, shortened_overload: 2 },
    ratings: { rp_tier: {hamstrings:"B", calves:"D"}, sfr: 2, target_specificity: 5, stability_demand: 3, technique_demand: 4, injury_risk: 3, setup_cost: 2 },
    fatigue: { systemic: 2, local: 5 },
    unilateral: false, unilateral_capable: false, failure_safe: true,
    rep_suitability: { "5_8": 1.0, "8_12": 0.7, "12_20": 0.2, "20_30": 0.1 },
    ratio_anchors: { leg_curl_seated: {r:0.2, c:0.15} },
    min_effective_load_hint: { note: "bodyweight floor is brutal — most lifters cannot control the eccentric unassisted; band-assist or use leg_curl_seated" }
  },

  {
    id: "glute_ham_raise",
    name: "Glute-Ham Raise",
    aliases: ["ghr"],
    family: "leg_curl",
    hub: false,
    pattern: "isolation_curl",
    muscles: [
      { m: "hamstrings", role: "primary", contribution: 1.0 },
      { m: "glutes", role: "secondary", contribution: 0.5 },
      { m: "calves", role: "secondary", contribution: 0.2 }
    ],
    requires: { any: [ { all: [ {cap:"ghd"} ] } ] },
    load_unit: "bodyweight_plus",
    load_portability: "absolute",
    profile: { resistance_peak: "stretch", stretch_emphasis: 4, rom_score: 4, shortened_overload: 3 },
    ratings: { rp_tier: {hamstrings:"A", glutes:"C", calves:"D"}, sfr: 3, target_specificity: 4, stability_demand: 2, technique_demand: 3, injury_risk: 2, setup_cost: 2 },
    fatigue: { systemic: 2, local: 5 },
    unilateral: false, unilateral_capable: false, failure_safe: true,
    rep_suitability: { "5_8": 0.9, "8_12": 1.0, "12_20": 0.5, "20_30": 0.2 },
    ratio_anchors: { leg_curl_seated: {r:0.25, c:0.15} }
  },

  {
    id: "band_leg_curl",
    name: "Band Leg Curl",
    aliases: ["banded hamstring curl", "prone band curl"],
    family: "leg_curl",
    hub: false,
    pattern: "isolation_curl",
    muscles: [
      { m: "hamstrings", role: "primary", contribution: 1.0 }
    ],
    requires: { any: [ { all: [ {cap:"band"} ] } ] },
    load_unit: "band_tension",
    load_portability: "absolute",
    profile: { resistance_peak: "shortened", stretch_emphasis: 2, rom_score: 4, shortened_overload: 5 },
    ratings: { rp_tier: {hamstrings:"C"}, sfr: 4, target_specificity: 5, stability_demand: 2, technique_demand: 2, injury_risk: 1, setup_cost: 2 },
    fatigue: { systemic: 1, local: 3 },
    unilateral: true, unilateral_capable: true, failure_safe: true,
    rep_suitability: { "5_8": 0.1, "8_12": 0.5, "12_20": 1.0, "20_30": 0.9 },
    ratio_anchors: { leg_curl_seated: {r:0.2, c:0.1} }
  },

  /* ======================= GLUTES ======================= */

  {
    id: "bb_hip_thrust",
    name: "Barbell Hip Thrust",
    aliases: ["hip thrust"],
    family: "hip_thrust",
    hub: true,
    pattern: "hinge",
    muscles: [
      { m: "glutes", role: "primary", contribution: 1.0 },
      { m: "hamstrings", role: "secondary", contribution: 0.4 },
      { m: "quads", role: "secondary", contribution: 0.2 }
    ],
    requires: { any: [ { all: [ {cap:"barbell"}, {cap:"bench"} ] }, { all: [ {cap:"machine", machine_key:"hip_thrust_machine"} ] } ] },
    load_unit: "total_bar_load",
    load_portability: "absolute",
    profile: { resistance_peak: "shortened", stretch_emphasis: 2, rom_score: 3, shortened_overload: 5 },
    ratings: { rp_tier: {glutes:"S", hamstrings:"C", quads:"D"}, sfr: 4, target_specificity: 5, stability_demand: 2, technique_demand: 3, injury_risk: 1, setup_cost: 4 },
    fatigue: { systemic: 3, local: 4 },
    unilateral: false, unilateral_capable: true, failure_safe: true,
    rep_suitability: { "5_8": 0.7, "8_12": 1.0, "12_20": 0.9, "20_30": 0.4 },
    ratio_anchors: { bb_back_squat: {r:1.16, c:0.4} },
    min_effective_load_hint: { bar_lb: 45 }
  },

  {
    id: "hip_thrust_machine",
    name: "Hip Thrust Machine",
    aliases: ["glute drive machine"],
    family: "hip_thrust",
    hub: false,
    pattern: "hinge",
    muscles: [
      { m: "glutes", role: "primary", contribution: 1.0 },
      { m: "hamstrings", role: "secondary", contribution: 0.35 }
    ],
    requires: { any: [ { all: [ {cap:"machine", machine_key:"hip_thrust_machine"} ] } ] },
    load_unit: "stack_pin",
    load_portability: "machine_relative",
    profile: { resistance_peak: "shortened", stretch_emphasis: 2, rom_score: 3, shortened_overload: 5 },
    ratings: { rp_tier: {glutes:"S", hamstrings:"D"}, sfr: 5, target_specificity: 5, stability_demand: 1, technique_demand: 1, injury_risk: 1, setup_cost: 1 },
    fatigue: { systemic: 2, local: 4 },
    unilateral: false, unilateral_capable: true, failure_safe: true,
    rep_suitability: { "5_8": 0.6, "8_12": 1.0, "12_20": 1.0, "20_30": 0.5 },
    ratio_anchors: { bb_hip_thrust: {r:0.82, c:0.2} },
    min_effective_load_hint: { stack_min_lb: 15 }
  },

  {
    id: "glute_bridge",
    name: "Barbell Glute Bridge",
    aliases: ["floor glute bridge"],
    family: "hip_thrust",
    hub: false,
    pattern: "hinge",
    muscles: [
      { m: "glutes", role: "primary", contribution: 1.0 },
      { m: "hamstrings", role: "secondary", contribution: 0.35 }
    ],
    requires: { any: [ { all: [ {cap:"barbell"} ] }, { all: [ {cap:"bodyweight_only"} ] } ] },
    load_unit: "total_bar_load",
    load_portability: "absolute",
    profile: { resistance_peak: "shortened", stretch_emphasis: 1, rom_score: 2, shortened_overload: 5 },
    ratings: { rp_tier: {glutes:"B", hamstrings:"D"}, sfr: 4, target_specificity: 5, stability_demand: 2, technique_demand: 2, injury_risk: 1, setup_cost: 3 },
    fatigue: { systemic: 2, local: 3 },
    unilateral: false, unilateral_capable: true, failure_safe: true,
    rep_suitability: { "5_8": 0.6, "8_12": 1.0, "12_20": 1.0, "20_30": 0.5 },
    ratio_anchors: { bb_hip_thrust: {r:0.75, c:0.4} },
    min_effective_load_hint: { bar_lb: 45 }
  },

  {
    id: "single_leg_hip_thrust",
    name: "Single-Leg Hip Thrust",
    aliases: ["one leg hip thrust", "sl glute bridge"],
    family: "hip_thrust",
    hub: false,
    pattern: "hinge",
    muscles: [
      { m: "glutes", role: "primary", contribution: 1.0 },
      { m: "hamstrings", role: "secondary", contribution: 0.4 }
    ],
    requires: { any: [ { all: [ {cap:"bodyweight_only"}, {cap:"bench"} ] }, { all: [ {cap:"dumbbell"}, {cap:"bench"} ] } ] },
    load_unit: "bodyweight_plus",
    load_portability: "absolute",
    profile: { resistance_peak: "shortened", stretch_emphasis: 2, rom_score: 3, shortened_overload: 5 },
    ratings: { rp_tier: {glutes:"B", hamstrings:"D"}, sfr: 4, target_specificity: 5, stability_demand: 3, technique_demand: 2, injury_risk: 1, setup_cost: 1 },
    fatigue: { systemic: 2, local: 3 },
    unilateral: true, unilateral_capable: true, failure_safe: true,
    rep_suitability: { "5_8": 0.3, "8_12": 0.9, "12_20": 1.0, "20_30": 0.7 },
    ratio_anchors: { bb_hip_thrust: {r:0.12, c:0.2} }
  },

  {
    id: "band_hip_thrust",
    name: "Band Hip Thrust",
    aliases: ["banded glute bridge"],
    family: "hip_thrust",
    hub: false,
    pattern: "hinge",
    muscles: [
      { m: "glutes", role: "primary", contribution: 1.0 },
      { m: "hamstrings", role: "secondary", contribution: 0.3 }
    ],
    requires: { any: [ { all: [ {cap:"band"} ] } ] },
    load_unit: "band_tension",
    load_portability: "absolute",
    profile: { resistance_peak: "shortened", stretch_emphasis: 1, rom_score: 3, shortened_overload: 5 },
    ratings: { rp_tier: {glutes:"C", hamstrings:"D"}, sfr: 4, target_specificity: 5, stability_demand: 2, technique_demand: 1, injury_risk: 1, setup_cost: 1 },
    fatigue: { systemic: 1, local: 3 },
    unilateral: false, unilateral_capable: true, failure_safe: true,
    rep_suitability: { "5_8": 0.1, "8_12": 0.5, "12_20": 1.0, "20_30": 1.0 },
    ratio_anchors: { bb_hip_thrust: {r:0.1, c:0.1} }
  },

  {
    id: "cable_pull_through",
    name: "Cable Pull-Through",
    aliases: ["pull through"],
    family: "pull_through",
    hub: true,
    pattern: "hinge",
    muscles: [
      { m: "glutes", role: "primary", contribution: 1.0 },
      { m: "hamstrings", role: "primary", contribution: 0.6 }
    ],
    requires: { any: [ { all: [ {cap:"cable"}, {cap:"low_pulley"} ] }, { all: [ {cap:"band"} ] } ] },
    load_unit: "stack_pin",
    load_portability: "machine_relative",
    profile: { resistance_peak: "shortened", stretch_emphasis: 3, rom_score: 4, shortened_overload: 5 },
    ratings: { rp_tier: {glutes:"A", hamstrings:"B"}, sfr: 5, target_specificity: 4, stability_demand: 2, technique_demand: 2, injury_risk: 1, setup_cost: 1 },
    fatigue: { systemic: 2, local: 3 },
    unilateral: false, unilateral_capable: true, failure_safe: true,
    rep_suitability: { "5_8": 0.3, "8_12": 0.9, "12_20": 1.0, "20_30": 0.7 },
    ratio_anchors: { bb_hip_thrust: {r:0.33, c:0.2} },
    min_effective_load_hint: { stack_min_lb: 15 }
  },

  {
    id: "cable_kickback",
    name: "Cable Glute Kickback",
    aliases: ["glute kickback", "cable hip extension"],
    family: "glute_kickback",
    hub: true,
    pattern: "hinge",
    muscles: [
      { m: "glutes", role: "primary", contribution: 1.0 },
      { m: "hamstrings", role: "secondary", contribution: 0.3 }
    ],
    requires: { any: [ { all: [ {cap:"cable"}, {cap:"low_pulley"} ] } ] },
    load_unit: "stack_pin",
    load_portability: "machine_relative",
    profile: { resistance_peak: "shortened", stretch_emphasis: 3, rom_score: 4, shortened_overload: 5 },
    ratings: { rp_tier: {glutes:"A", hamstrings:"D"}, sfr: 5, target_specificity: 5, stability_demand: 3, technique_demand: 2, injury_risk: 1, setup_cost: 2 },
    fatigue: { systemic: 1, local: 3 },
    unilateral: true, unilateral_capable: true, failure_safe: true,
    rep_suitability: { "5_8": 0.2, "8_12": 0.8, "12_20": 1.0, "20_30": 0.9 },
    ratio_anchors: { bb_hip_thrust: {r:0.11, c:0.2} },
    min_effective_load_hint: { stack_min_lb: 5 }
  },

  /* ======================= ABDUCTORS / ADDUCTORS ======================= */

  {
    id: "abductor_machine",
    name: "Hip Abduction Machine",
    aliases: ["abductor machine", "seated hip abduction"],
    family: "abduction",
    hub: true,
    pattern: "isolation_extension",
    muscles: [
      { m: "glutes", role: "primary", contribution: 1.0 }
    ],
    requires: { any: [ { all: [ {cap:"machine", machine_key:"abductor"} ] } ] },
    load_unit: "stack_pin",
    load_portability: "machine_relative",
    profile: { resistance_peak: "shortened", stretch_emphasis: 2, rom_score: 3, shortened_overload: 5 },
    ratings: { rp_tier: {glutes:"A"}, sfr: 5, target_specificity: 5, stability_demand: 1, technique_demand: 1, injury_risk: 1, setup_cost: 1 },
    fatigue: { systemic: 1, local: 3 },
    unilateral: false, unilateral_capable: true, failure_safe: true,
    rep_suitability: { "5_8": 0.2, "8_12": 0.8, "12_20": 1.0, "20_30": 0.9 },
    variants: { torso: ["upright","leaned_forward"] },
    ratio_anchors: { bb_hip_thrust: {r:0.41, c:0.2} },
    min_effective_load_hint: { stack_min_lb: 15 }
  },

  {
    id: "cable_hip_abduction",
    name: "Cable Hip Abduction",
    aliases: ["standing cable abduction"],
    family: "abduction",
    hub: false,
    pattern: "isolation_extension",
    muscles: [
      { m: "glutes", role: "primary", contribution: 1.0 }
    ],
    requires: { any: [ { all: [ {cap:"cable"}, {cap:"low_pulley"} ] } ] },
    load_unit: "stack_pin",
    load_portability: "machine_relative",
    profile: { resistance_peak: "shortened", stretch_emphasis: 2, rom_score: 4, shortened_overload: 5 },
    ratings: { rp_tier: {glutes:"B"}, sfr: 5, target_specificity: 5, stability_demand: 3, technique_demand: 2, injury_risk: 1, setup_cost: 2 },
    fatigue: { systemic: 1, local: 2 },
    unilateral: true, unilateral_capable: true, failure_safe: true,
    rep_suitability: { "5_8": 0.2, "8_12": 0.8, "12_20": 1.0, "20_30": 0.9 },
    ratio_anchors: { abductor_machine: {r:0.27, c:0.2} },
    min_effective_load_hint: { stack_min_lb: 5 }
  },

  {
    id: "band_seated_abduction",
    name: "Band Seated Hip Abduction",
    aliases: ["band knee spread", "banded abduction"],
    family: "abduction",
    hub: false,
    pattern: "isolation_extension",
    muscles: [
      { m: "glutes", role: "primary", contribution: 1.0 }
    ],
    requires: { any: [ { all: [ {cap:"band"} ] } ] },
    load_unit: "band_tension",
    load_portability: "absolute",
    profile: { resistance_peak: "shortened", stretch_emphasis: 1, rom_score: 3, shortened_overload: 5 },
    ratings: { rp_tier: {glutes:"C"}, sfr: 4, target_specificity: 5, stability_demand: 1, technique_demand: 1, injury_risk: 1, setup_cost: 1 },
    fatigue: { systemic: 1, local: 2 },
    unilateral: false, unilateral_capable: true, failure_safe: true,
    rep_suitability: { "5_8": 0.1, "8_12": 0.4, "12_20": 1.0, "20_30": 1.0 },
    ratio_anchors: { abductor_machine: {r:0.15, c:0.1} }
  },

  {
    id: "adductor_machine",
    name: "Hip Adduction Machine",
    aliases: ["adductor machine", "seated hip adduction", "inner thigh machine"],
    family: "adduction",
    hub: true,
    pattern: "isolation_curl",
    muscles: [
      { m: "adductors", role: "primary", contribution: 1.0 }
    ],
    requires: { any: [ { all: [ {cap:"machine", machine_key:"adductor_machine"} ] } ] },
    load_unit: "stack_pin",
    load_portability: "machine_relative",
    profile: { resistance_peak: "stretch", stretch_emphasis: 5, rom_score: 4, shortened_overload: 4 },
    ratings: { rp_tier: {adductors:"S"}, sfr: 5, target_specificity: 5, stability_demand: 1, technique_demand: 1, injury_risk: 2, setup_cost: 1 },
    fatigue: { systemic: 1, local: 3 },
    unilateral: false, unilateral_capable: true, failure_safe: true,
    rep_suitability: { "5_8": 0.2, "8_12": 0.9, "12_20": 1.0, "20_30": 0.8 },
    ratio_anchors: { abductor_machine: {r:1.0, c:0.25} },
    min_effective_load_hint: { stack_min_lb: 15 }
  },

  {
    id: "cable_hip_adduction",
    name: "Cable Hip Adduction",
    aliases: ["standing cable adduction"],
    family: "adduction",
    hub: false,
    pattern: "isolation_curl",
    muscles: [
      { m: "adductors", role: "primary", contribution: 1.0 }
    ],
    requires: { any: [ { all: [ {cap:"cable"}, {cap:"low_pulley"} ] } ] },
    load_unit: "stack_pin",
    load_portability: "machine_relative",
    profile: { resistance_peak: "stretch", stretch_emphasis: 4, rom_score: 4, shortened_overload: 4 },
    ratings: { rp_tier: {adductors:"A"}, sfr: 5, target_specificity: 5, stability_demand: 3, technique_demand: 2, injury_risk: 2, setup_cost: 2 },
    fatigue: { systemic: 1, local: 2 },
    unilateral: true, unilateral_capable: true, failure_safe: true,
    rep_suitability: { "5_8": 0.2, "8_12": 0.8, "12_20": 1.0, "20_30": 0.8 },
    ratio_anchors: { adductor_machine: {r:0.3, c:0.2} },
    min_effective_load_hint: { stack_min_lb: 5 }
  },

  {
    id: "copenhagen_plank",
    name: "Copenhagen Plank",
    aliases: ["copenhagen adduction", "side plank adduction"],
    family: "adduction",
    hub: false,
    pattern: "isolation_curl",
    muscles: [
      { m: "adductors", role: "primary", contribution: 1.0 },
      { m: "abs", role: "secondary", contribution: 0.5 }
    ],
    requires: { any: [ { all: [ {cap:"bodyweight_only"}, {cap:"bench"} ] }, { all: [ {cap:"bodyweight_only"} ] } ] },
    load_unit: "bodyweight_plus",
    load_portability: "absolute",
    profile: { resistance_peak: "stretch", stretch_emphasis: 4, rom_score: 2, shortened_overload: 2 },
    ratings: { rp_tier: {adductors:"B", abs:"C"}, sfr: 3, target_specificity: 4, stability_demand: 4, technique_demand: 3, injury_risk: 2, setup_cost: 1 },
    fatigue: { systemic: 1, local: 3 },
    unilateral: true, unilateral_capable: true, failure_safe: true,
    rep_suitability: { "5_8": 0.3, "8_12": 0.8, "12_20": 1.0, "20_30": 0.7 },
    variants: { lever: ["short_knee","long_leg"] },
    ratio_anchors: { adductor_machine: {r:0.1, c:0.1} }
  },

  /* ======================= CALVES ======================= */

  {
    id: "standing_calf_raise",
    name: "Standing Calf Raise",
    aliases: ["standing calf machine"],
    family: "calf_standing",
    hub: true,
    pattern: "calf",
    muscles: [
      { m: "calves", role: "primary", contribution: 1.0 }
    ],
    requires: { any: [ { all: [ {cap:"machine", machine_key:"calf_raise_standing"} ] }, { all: [ {cap:"smith"} ] } ] },
    load_unit: "stack_pin",
    load_portability: "machine_relative",
    profile: { resistance_peak: "stretch", stretch_emphasis: 5, rom_score: 4, shortened_overload: 3 },
    ratings: { rp_tier: {calves:"S"}, sfr: 5, target_specificity: 5, stability_demand: 2, technique_demand: 1, injury_risk: 1, setup_cost: 1 },
    fatigue: { systemic: 1, local: 4 },
    unilateral: false, unilateral_capable: true, failure_safe: true,
    rep_suitability: { "5_8": 0.4, "8_12": 1.0, "12_20": 1.0, "20_30": 0.8 },
    ratio_anchors: { bb_back_squat: {r:0.95, c:0.2} },
    min_effective_load_hint: { stack_min_lb: 15 }
  },

  {
    id: "smith_calf_raise",
    name: "Smith Machine Calf Raise",
    aliases: ["smith standing calf raise"],
    family: "calf_standing",
    hub: false,
    pattern: "calf",
    muscles: [
      { m: "calves", role: "primary", contribution: 1.0 }
    ],
    requires: { any: [ { all: [ {cap:"smith"} ] }, { all: [ {cap:"barbell"}, {cap:"squat_rack"} ] } ] },
    load_unit: "total_bar_load",
    load_portability: "machine_relative",
    profile: { resistance_peak: "stretch", stretch_emphasis: 5, rom_score: 4, shortened_overload: 3 },
    ratings: { rp_tier: {calves:"A"}, sfr: 4, target_specificity: 5, stability_demand: 2, technique_demand: 2, injury_risk: 1, setup_cost: 2 },
    fatigue: { systemic: 1, local: 4 },
    unilateral: false, unilateral_capable: true, failure_safe: true,
    rep_suitability: { "5_8": 0.4, "8_12": 1.0, "12_20": 1.0, "20_30": 0.7 },
    ratio_anchors: { standing_calf_raise: {r:0.92, c:0.3} },
    min_effective_load_hint: { bar_lb: 20 }
  },

  {
    id: "leg_press_calf_raise",
    name: "Leg Press Calf Raise",
    aliases: ["calf press", "toe press"],
    family: "calf_standing",
    hub: false,
    pattern: "calf",
    muscles: [
      { m: "calves", role: "primary", contribution: 1.0 }
    ],
    requires: { any: [ { all: [ {cap:"machine", machine_key:"leg_press"} ] }, { all: [ {cap:"machine", machine_key:"hack_squat"} ] } ] },
    load_unit: "carriage_plus",
    load_portability: "machine_relative",
    profile: { resistance_peak: "stretch", stretch_emphasis: 5, rom_score: 4, shortened_overload: 3 },
    ratings: { rp_tier: {calves:"A"}, sfr: 5, target_specificity: 5, stability_demand: 1, technique_demand: 1, injury_risk: 2, setup_cost: 1 },
    fatigue: { systemic: 1, local: 4 },
    unilateral: false, unilateral_capable: true, failure_safe: true,
    rep_suitability: { "5_8": 0.4, "8_12": 1.0, "12_20": 1.0, "20_30": 0.8 },
    ratio_anchors: { standing_calf_raise: {r:1.5, c:0.2} }
  },

  {
    id: "single_leg_calf_raise",
    name: "Single-Leg Bodyweight Calf Raise",
    aliases: ["one leg calf raise", "step calf raise"],
    family: "calf_standing",
    hub: false,
    pattern: "calf",
    muscles: [
      { m: "calves", role: "primary", contribution: 1.0 }
    ],
    requires: { any: [ { all: [ {cap:"bodyweight_only"} ] }, { all: [ {cap:"dumbbell"} ] } ] },
    load_unit: "bodyweight_plus",
    load_portability: "absolute",
    profile: { resistance_peak: "stretch", stretch_emphasis: 5, rom_score: 4, shortened_overload: 3 },
    ratings: { rp_tier: {calves:"B"}, sfr: 4, target_specificity: 5, stability_demand: 3, technique_demand: 1, injury_risk: 1, setup_cost: 1 },
    fatigue: { systemic: 1, local: 3 },
    unilateral: true, unilateral_capable: true, failure_safe: true,
    rep_suitability: { "5_8": 0.2, "8_12": 0.7, "12_20": 1.0, "20_30": 1.0 },
    ratio_anchors: { standing_calf_raise: {r:0.17, c:0.15} }
  },

  {
    id: "seated_calf_raise",
    name: "Seated Calf Raise",
    aliases: ["seated calf machine", "soleus raise"],
    family: "calf_seated",
    hub: true,
    pattern: "calf",
    muscles: [
      { m: "calves", role: "primary", contribution: 1.0 }
    ],
    requires: { any: [ { all: [ {cap:"machine", machine_key:"calf_raise_seated"} ] }, { all: [ {cap:"barbell"}, {cap:"bench"} ] } ] },
    load_unit: "stack_pin",
    load_portability: "machine_relative",
    profile: { resistance_peak: "stretch", stretch_emphasis: 5, rom_score: 4, shortened_overload: 3 },
    ratings: { rp_tier: {calves:"S"}, sfr: 5, target_specificity: 5, stability_demand: 1, technique_demand: 1, injury_risk: 1, setup_cost: 1 },
    fatigue: { systemic: 1, local: 3 },
    unilateral: false, unilateral_capable: true, failure_safe: true,
    rep_suitability: { "5_8": 0.3, "8_12": 0.9, "12_20": 1.0, "20_30": 1.0 },
    ratio_anchors: { standing_calf_raise: {r:0.5, c:0.25} },
    min_effective_load_hint: { stack_min_lb: 15 }
  },

  /* ======================= ABS ======================= */

  {
    id: "cable_crunch",
    name: "Cable Crunch",
    aliases: ["kneeling cable crunch", "rope crunch"],
    family: "crunch",
    hub: true,
    pattern: "core",
    muscles: [
      { m: "abs", role: "primary", contribution: 1.0 }
    ],
    requires: { any: [ { all: [ {cap:"cable"}, {cap:"high_pulley"} ] }, { all: [ {cap:"machine", machine_key:"lat_pulldown"} ] } ] },
    load_unit: "stack_pin",
    load_portability: "machine_relative",
    profile: { resistance_peak: "shortened", stretch_emphasis: 3, rom_score: 4, shortened_overload: 5 },
    ratings: { rp_tier: {abs:"S"}, sfr: 5, target_specificity: 5, stability_demand: 2, technique_demand: 2, injury_risk: 1, setup_cost: 1 },
    fatigue: { systemic: 1, local: 3 },
    unilateral: false, unilateral_capable: true, failure_safe: true,
    rep_suitability: { "5_8": 0.4, "8_12": 1.0, "12_20": 1.0, "20_30": 0.7 },
    ratio_anchors: {},
    min_effective_load_hint: { stack_min_lb: 15 }
  },

  {
    id: "ab_crunch_machine",
    name: "Ab Crunch Machine",
    aliases: ["machine crunch", "seated ab machine"],
    family: "crunch",
    hub: false,
    pattern: "core",
    muscles: [
      { m: "abs", role: "primary", contribution: 1.0 }
    ],
    requires: { any: [ { all: [ {cap:"machine", machine_key:"ab_crunch_machine"} ] } ] },
    load_unit: "stack_pin",
    load_portability: "machine_relative",
    profile: { resistance_peak: "flat", stretch_emphasis: 3, rom_score: 3, shortened_overload: 4 },
    ratings: { rp_tier: {abs:"A"}, sfr: 5, target_specificity: 5, stability_demand: 1, technique_demand: 1, injury_risk: 1, setup_cost: 1 },
    fatigue: { systemic: 1, local: 3 },
    unilateral: false, unilateral_capable: false, failure_safe: true,
    rep_suitability: { "5_8": 0.4, "8_12": 1.0, "12_20": 1.0, "20_30": 0.7 },
    ratio_anchors: { cable_crunch: {r:1.08, c:0.2} },
    min_effective_load_hint: { stack_min_lb: 15 }
  },

  {
    id: "hanging_leg_raise",
    name: "Hanging Leg Raise",
    aliases: ["hanging knee raise", "captains chair raise"],
    family: "leg_raise",
    hub: true,
    pattern: "core",
    muscles: [
      { m: "abs", role: "primary", contribution: 1.0 },
      { m: "forearms", role: "secondary", contribution: 0.3 }
    ],
    requires: { any: [ { all: [ {cap:"pullup_bar"} ] }, { all: [ {cap:"dip_station"} ] } ] },
    load_unit: "bodyweight_plus",
    load_portability: "absolute",
    profile: { resistance_peak: "mid", stretch_emphasis: 4, rom_score: 4, shortened_overload: 3 },
    ratings: { rp_tier: {abs:"S", forearms:"D"}, sfr: 4, target_specificity: 4, stability_demand: 4, technique_demand: 3, injury_risk: 1, setup_cost: 1 },
    fatigue: { systemic: 2, local: 3 },
    unilateral: false, unilateral_capable: false, failure_safe: true,
    rep_suitability: { "5_8": 0.5, "8_12": 1.0, "12_20": 0.9, "20_30": 0.4 },
    variants: { knee: ["bent","straight"] },
    ratio_anchors: { cable_crunch: {r:0.2, c:0.15} }
  },

  {
    id: "reverse_crunch",
    name: "Reverse Crunch",
    aliases: ["lying reverse crunch", "lying leg raise"],
    family: "leg_raise",
    hub: false,
    pattern: "core",
    muscles: [
      { m: "abs", role: "primary", contribution: 1.0 }
    ],
    requires: { any: [ { all: [ {cap:"bodyweight_only"} ] }, { all: [ {cap:"bench"} ] } ] },
    load_unit: "bodyweight_plus",
    load_portability: "absolute",
    profile: { resistance_peak: "shortened", stretch_emphasis: 3, rom_score: 3, shortened_overload: 4 },
    ratings: { rp_tier: {abs:"B"}, sfr: 4, target_specificity: 4, stability_demand: 2, technique_demand: 2, injury_risk: 1, setup_cost: 1 },
    fatigue: { systemic: 1, local: 2 },
    unilateral: false, unilateral_capable: false, failure_safe: true,
    rep_suitability: { "5_8": 0.2, "8_12": 0.8, "12_20": 1.0, "20_30": 0.8 },
    ratio_anchors: { hanging_leg_raise: {r:0.6, c:0.15} }
  },

  {
    id: "ab_wheel",
    name: "Ab Wheel Rollout",
    aliases: ["rollout", "ab roller"],
    family: "anti_extension",
    hub: true,
    pattern: "core",
    muscles: [
      { m: "abs", role: "primary", contribution: 1.0 },
      { m: "back", role: "secondary", contribution: 0.3 }
    ],
    requires: { any: [ { all: [ {cap:"bodyweight_only"} ] }, { all: [ {cap:"barbell"} ] } ] },
    load_unit: "bodyweight_plus",
    load_portability: "absolute",
    profile: { resistance_peak: "stretch", stretch_emphasis: 5, rom_score: 4, shortened_overload: 1 },
    ratings: { rp_tier: {abs:"A", back:"D"}, sfr: 4, target_specificity: 4, stability_demand: 4, technique_demand: 3, injury_risk: 2, setup_cost: 1 },
    fatigue: { systemic: 2, local: 3 },
    unilateral: false, unilateral_capable: false, failure_safe: true,
    rep_suitability: { "5_8": 0.6, "8_12": 1.0, "12_20": 0.9, "20_30": 0.4 },
    variants: { position: ["from_knees","from_feet"] },
    ratio_anchors: { cable_crunch: {r:0.15, c:0.1} }
  },

  {
    id: "pallof_press",
    name: "Pallof Press",
    aliases: ["anti rotation press", "cable pallof"],
    family: "anti_rotation",
    hub: true,
    pattern: "core",
    muscles: [
      { m: "abs", role: "primary", contribution: 1.0 }
    ],
    requires: { any: [ { all: [ {cap:"cable"} ] }, { all: [ {cap:"band"} ] } ] },
    load_unit: "stack_pin",
    load_portability: "machine_relative",
    profile: { resistance_peak: "flat", stretch_emphasis: 1, rom_score: 2, shortened_overload: 3 },
    ratings: { rp_tier: {abs:"C"}, sfr: 4, target_specificity: 4, stability_demand: 3, technique_demand: 2, injury_risk: 1, setup_cost: 2 },
    fatigue: { systemic: 1, local: 2 },
    unilateral: true, unilateral_capable: true, failure_safe: true,
    rep_suitability: { "5_8": 0.2, "8_12": 0.7, "12_20": 1.0, "20_30": 0.9 },
    ratio_anchors: { cable_crunch: {r:0.33, c:0.2} },
    min_effective_load_hint: { stack_min_lb: 10 }
  },

  {
    id: "band_crunch",
    name: "Band Crunch",
    aliases: ["banded kneeling crunch"],
    family: "crunch",
    hub: false,
    pattern: "core",
    muscles: [
      { m: "abs", role: "primary", contribution: 1.0 }
    ],
    requires: { any: [ { all: [ {cap:"band"} ] } ] },
    load_unit: "band_tension",
    load_portability: "absolute",
    profile: { resistance_peak: "shortened", stretch_emphasis: 2, rom_score: 3, shortened_overload: 5 },
    ratings: { rp_tier: {abs:"C"}, sfr: 4, target_specificity: 5, stability_demand: 2, technique_demand: 2, injury_risk: 1, setup_cost: 2 },
    fatigue: { systemic: 1, local: 2 },
    unilateral: false, unilateral_capable: true, failure_safe: true,
    rep_suitability: { "5_8": 0.1, "8_12": 0.5, "12_20": 1.0, "20_30": 0.9 },
    ratio_anchors: { cable_crunch: {r:0.3, c:0.1} }
  },

  /* ── Conditioning / CrossFit movements ─────────────────────────────────────
   * These exist so benchmark WODs can be logged with the RIGHT movement instead of a
   * lookalike. They are deliberately rated LOW for hypertrophy (rp_tier D/F, sfr 1-2):
   * they're ballistic or endurance-biased, so the planner should never pick them for a
   * growth slot — they're only reachable through the Quick-workout picker.        */
  {
    id: "kb_swing",
    name: "Kettlebell Swing",
    aliases: ["russian swing", "american swing", "kb swing"],
    family: "swing",
    hub: false,
    pattern: "hinge",
    muscles: [
      { m: "glutes", role: "primary", contribution: 0.9 },
      { m: "hamstrings", role: "primary", contribution: 0.7 },
      { m: "back", role: "secondary", contribution: 0.3 },
      { m: "traps", role: "secondary", contribution: 0.3 }
    ],
    requires: { any: [ { all: [ {cap:"kettlebell"} ] } ] },
    load_unit: "total_bar_load",
    load_portability: "absolute",
    profile: { resistance_peak: "mid", stretch_emphasis: 2, rom_score: 3, shortened_overload: 4 },
    ratings: { rp_tier: {glutes:"D", hamstrings:"D", back:"F", traps:"F"}, sfr: 2, target_specificity: 2, stability_demand: 3, technique_demand: 3, injury_risk: 2, setup_cost: 1 },
    fatigue: { systemic: 4, local: 3 },
    unilateral: false, unilateral_capable: true, failure_safe: true,
    rep_suitability: { "5_8": 0.2, "8_12": 0.7, "12_20": 1.0, "20_30": 1.0 },
    ratio_anchors: { bb_rdl: {r:0.25, c:0.2} }
  },
  {
    id: "wall_ball",
    name: "Wall Ball Shot",
    aliases: ["wall balls", "medicine ball thruster"],
    family: "thruster",
    hub: false,
    pattern: "squat",
    muscles: [
      { m: "quads", role: "primary", contribution: 0.8 },
      { m: "front_delt", role: "primary", contribution: 0.6 },
      { m: "glutes", role: "secondary", contribution: 0.4 }
    ],
    requires: { any: [ { all: [ {cap:"wall_ball"} ] } ] },
    load_unit: "total_bar_load",
    load_portability: "absolute",
    profile: { resistance_peak: "mid", stretch_emphasis: 2, rom_score: 4, shortened_overload: 3 },
    ratings: { rp_tier: {quads:"D", front_delt:"D", glutes:"F"}, sfr: 2, target_specificity: 2, stability_demand: 3, technique_demand: 2, injury_risk: 1, setup_cost: 1 },
    fatigue: { systemic: 4, local: 3 },
    unilateral: false, unilateral_capable: false, failure_safe: true,
    rep_suitability: { "5_8": 0.2, "8_12": 0.6, "12_20": 1.0, "20_30": 1.0 },
    ratio_anchors: { bb_front_squat: {r:0.15, c:0.15} }
  },
  {
    id: "clean_and_jerk",
    name: "Clean & Jerk",
    aliases: ["c&j", "clean and jerk", "grace"],
    family: "olympic",
    hub: false,
    pattern: "hinge",
    muscles: [
      { m: "quads", role: "primary", contribution: 0.7 },
      { m: "front_delt", role: "primary", contribution: 0.7 },
      { m: "traps", role: "secondary", contribution: 0.6 },
      { m: "glutes", role: "secondary", contribution: 0.5 },
      { m: "triceps", role: "secondary", contribution: 0.3 }
    ],
    requires: { any: [ { all: [ {cap:"barbell"} ] } ] },
    load_unit: "total_bar_load",
    load_portability: "absolute",
    profile: { resistance_peak: "mid", stretch_emphasis: 2, rom_score: 4, shortened_overload: 2 },
    ratings: { rp_tier: {quads:"F", front_delt:"D", traps:"D", glutes:"F", triceps:"F"}, sfr: 1, target_specificity: 1, stability_demand: 5, technique_demand: 5, injury_risk: 3, setup_cost: 2 },
    fatigue: { systemic: 5, local: 3 },
    unilateral: false, unilateral_capable: false, failure_safe: false,
    rep_suitability: { "5_8": 1.0, "8_12": 0.6, "12_20": 0.2, "20_30": 0.1 },
    ratio_anchors: { bb_front_squat: {r:0.6, c:0.2} }
  },
  {
    id: "handstand_pushup",
    name: "Handstand Push-Up",
    aliases: ["hspu", "kipping hspu"],
    family: "vertical_press",
    hub: false,
    pattern: "vertical_press",
    muscles: [
      { m: "front_delt", role: "primary", contribution: 1.0 },
      { m: "triceps", role: "primary", contribution: 0.7 },
      { m: "side_delt", role: "secondary", contribution: 0.4 }
    ],
    requires: { any: [ { all: [ {cap:"bodyweight_only"} ] } ] },
    load_unit: "bodyweight_plus",
    load_portability: "bodyweight",
    profile: { resistance_peak: "stretch", stretch_emphasis: 3, rom_score: 4, shortened_overload: 3 },
    ratings: { rp_tier: {front_delt:"B", triceps:"C", side_delt:"D"}, sfr: 3, target_specificity: 3, stability_demand: 5, technique_demand: 5, injury_risk: 3, setup_cost: 1 },
    fatigue: { systemic: 3, local: 4 },
    unilateral: false, unilateral_capable: false, failure_safe: false,
    rep_suitability: { "5_8": 1.0, "8_12": 0.9, "12_20": 0.4, "20_30": 0.1 },
    ratio_anchors: { bb_ohp: {r:0.9, c:0.2} }
  },
  {
    id: "double_under",
    name: "Double-Under",
    aliases: ["dubs", "jump rope", "skipping"],
    family: "conditioning",
    hub: false,
    pattern: "calf",
    muscles: [
      { m: "calves", role: "primary", contribution: 0.5 },
      { m: "forearms", role: "secondary", contribution: 0.2 }
    ],
    requires: { any: [ { all: [ {cap:"jump_rope"} ] } ] },
    load_unit: "bodyweight_plus",
    load_portability: "bodyweight",
    profile: { resistance_peak: "shortened", stretch_emphasis: 1, rom_score: 2, shortened_overload: 3 },
    ratings: { rp_tier: {calves:"F", forearms:"F"}, sfr: 1, target_specificity: 1, stability_demand: 3, technique_demand: 4, injury_risk: 1, setup_cost: 1 },
    fatigue: { systemic: 3, local: 3 },
    unilateral: false, unilateral_capable: false, failure_safe: true,
    rep_suitability: { "5_8": 0.1, "8_12": 0.2, "12_20": 0.6, "20_30": 1.0 },
    ratio_anchors: {}
  },
  {
    id: "run",
    name: "Run",
    aliases: ["running", "400m run", "sprint"],
    family: "conditioning",
    hub: false,
    pattern: "lunge",
    distance: true,
    muscles: [
      { m: "quads", role: "primary", contribution: 0.4 },
      { m: "calves", role: "secondary", contribution: 0.4 },
      { m: "hamstrings", role: "secondary", contribution: 0.3 }
    ],
    requires: { any: [ { all: [ {cap:"run_space"} ] } ] },
    load_unit: "bodyweight_plus",
    load_portability: "bodyweight",
    profile: { resistance_peak: "mid", stretch_emphasis: 1, rom_score: 2, shortened_overload: 1 },
    ratings: { rp_tier: {quads:"F", calves:"F", hamstrings:"F"}, sfr: 1, target_specificity: 1, stability_demand: 2, technique_demand: 1, injury_risk: 1, setup_cost: 1 },
    fatigue: { systemic: 4, local: 2 },
    unilateral: false, unilateral_capable: false, failure_safe: true,
    rep_suitability: { "5_8": 0.1, "8_12": 0.1, "12_20": 0.3, "20_30": 1.0 },
    ratio_anchors: {}
  },
  {
    id: "row_erg",
    name: "Row (Erg)",
    aliases: ["rower", "concept2", "erg"],
    family: "conditioning",
    hub: false,
    pattern: "horizontal_pull",
    distance: true,
    muscles: [
      { m: "back", role: "primary", contribution: 0.5 },
      { m: "quads", role: "secondary", contribution: 0.4 },
      { m: "biceps", role: "secondary", contribution: 0.2 }
    ],
    requires: { any: [ { all: [ {cap:"rower"} ] } ] },
    load_unit: "bodyweight_plus",
    load_portability: "bodyweight",
    profile: { resistance_peak: "mid", stretch_emphasis: 2, rom_score: 3, shortened_overload: 2 },
    ratings: { rp_tier: {back:"F", quads:"F", biceps:"F"}, sfr: 1, target_specificity: 1, stability_demand: 2, technique_demand: 2, injury_risk: 1, setup_cost: 1 },
    fatigue: { systemic: 4, local: 2 },
    unilateral: false, unilateral_capable: false, failure_safe: true,
    rep_suitability: { "5_8": 0.1, "8_12": 0.1, "12_20": 0.3, "20_30": 1.0 },
    ratio_anchors: {}
  }

];

window.MESO_FAMILIES = [
  { family: "flat_press",         hub: "bb_flat_bench" },
  { family: "incline_press",      hub: "bb_incline_press" },
  { family: "dip",                hub: "dip" },
  { family: "pushup",             hub: "pushup" },
  { family: "fly",                hub: "db_fly" },
  { family: "vertical_pull",      hub: "lat_pulldown" },
  { family: "horizontal_row",     hub: "bb_row" },
  { family: "pullover",           hub: "db_pullover" },
  { family: "shrug",              hub: "bb_shrug" },
  { family: "overhead_press",     hub: "bb_ohp" },
  { family: "lateral_raise",      hub: "db_lateral_raise" },
  { family: "front_raise",        hub: "db_front_raise" },
  { family: "rear_delt_fly",      hub: "db_rear_delt_fly" },
  { family: "biceps_curl",        hub: "db_curl" },
  { family: "preacher_curl",      hub: "ez_preacher_curl" },
  { family: "hammer_curl",        hub: "db_hammer_curl" },
  { family: "triceps_pushdown",   hub: "cable_pushdown" },
  { family: "triceps_extension",  hub: "ez_skullcrusher" },
  { family: "close_grip_press",   hub: "close_grip_bench" },
  { family: "wrist_curl",         hub: "bb_wrist_curl" },
  { family: "reverse_curl",       hub: "bb_reverse_curl" },
  { family: "carry",              hub: "farmers_carry" },
  { family: "squat",              hub: "bb_back_squat" },
  { family: "machine_squat",      hub: "hack_squat" },
  { family: "leg_extension",      hub: "leg_extension" },
  { family: "lunge",              hub: "bulgarian_split_squat" },
  { family: "deadlift",           hub: "conventional_deadlift" },
  { family: "rdl",                hub: "bb_rdl" },
  { family: "good_morning",       hub: "bb_good_morning" },
  { family: "leg_curl",           hub: "leg_curl_seated" },
  { family: "hip_thrust",         hub: "bb_hip_thrust" },
  { family: "pull_through",       hub: "cable_pull_through" },
  { family: "glute_kickback",     hub: "cable_kickback" },
  { family: "abduction",          hub: "abductor_machine" },
  { family: "adduction",          hub: "adductor_machine" },
  { family: "calf_standing",      hub: "standing_calf_raise" },
  { family: "calf_seated",        hub: "seated_calf_raise" },
  { family: "crunch",             hub: "cable_crunch" },
  { family: "leg_raise",          hub: "hanging_leg_raise" },
  { family: "anti_extension",     hub: "ab_wheel" },
  { family: "anti_rotation",      hub: "pallof_press" }
];

window.MESO_MACHINE_KEYS = [
  "pec_deck",
  "chest_press",
  "incline_press_machine",
  "lat_pulldown",
  "seated_row",
  "machine_row",
  "pullover_machine",
  "leg_press",
  "hack_squat",
  "leg_extension",
  "leg_curl_seated",
  "leg_curl_lying",
  "hip_thrust_machine",
  "abductor",
  "adductor_machine",
  "calf_raise_standing",
  "calf_raise_seated",
  "shoulder_press_machine",
  "lateral_raise_machine",
  "rear_delt_machine",
  "preacher_curl_machine",
  "triceps_extension_machine",
  "ab_crunch_machine",
  "assisted_pullup",
  "smith_machine"
];
