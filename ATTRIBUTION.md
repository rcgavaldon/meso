# Attribution — exercise demo media

The exercise demo clips in this app (the animations shown on each exercise row, delivered from
Cloudinary under `meso/ex/<exercise_id>`) are **not original work**. They are derived from
openly-licensed illustrations and photographs obtained from two sources: the [wger](https://wger.de)
project, a community exercise database, and [Wikimedia Commons](https://commons.wikimedia.org/).
Assets from each source are listed separately below.

Every asset below is licensed **Creative Commons Attribution-ShareAlike** (CC-BY-SA). That licence
requires three things, which this file exists to satisfy:

1. **Attribution** — the original author is credited, per asset, below.
2. **Link to the licence** — each entry links its specific licence deed.
3. **Indicate changes** — see *Modifications* below.

Because these images are ShareAlike, the derived clips distributed with this app remain under the
same licence as their source (CC-BY-SA 3.0 or 4.0 as noted per asset). This applies to the media
only, not to the application code.

## Modifications

Each source illustration was mechanically transformed, and **no** artwork was redrawn or altered in
substance. For every asset:

- transparent backgrounds were composited onto solid white (MP4 and JPEG cannot carry an alpha channel);
- frames were centred on a common canvas and resized to 400px on the long edge;
- where the source provided multiple positions of the same movement by the same author under the same
  licence (typically a start and an end frame), those frames were assembled into a single looping
  animated GIF; single-image sources became a static two-frame GIF;
- Cloudinary transcodes the GIF to MP4/JPEG on delivery.

The per-asset `source_urls` in [`data/media-manifest.json`](data/media-manifest.json) identify exactly
which original files each clip was built from.

## Sources not used

A number of wger images were deliberately **excluded** despite carrying a CC licence tag, because the
artwork itself is watermarked by, or is visibly part of, a third-party commercial illustration set
(weighttraining.guide). A licence tag applied by an uploader cannot grant rights the uploader does not
hold, so those assets were treated as unlicensed and skipped. See the coverage report for the list.

## Assets from wger (53)

### Everkinetic — [CC-BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/deed.en) — 30 assets

| Exercise (this app) | Source exercise | Original file |
| --- | --- | --- |
| `back_extension_45` | [Hyperextensions](https://wger.de/en/exercise/301/view/) | [Hyperextensions-1.png](https://wger.de/media/exercise-images/128/Hyperextensions-1.png) |
| `bb_curl` | [Biceps Curls With Barbell](https://wger.de/en/exercise/91/view/) | [Bicep-curls-1.png](https://wger.de/media/exercise-images/74/Bicep-curls-1.png) |
| `bb_flat_bench` | [Bench Press](https://wger.de/en/exercise/73/view/) | [Bench-press-1.png](https://wger.de/media/exercise-images/192/Bench-press-1.png) |
| `bb_front_squat` | [Front Squats](https://wger.de/en/exercise/257/view/) | [Front-squat-1-857x1024.png](https://wger.de/media/exercise-images/191/Front-squat-1-857x1024.png) |
| `bb_good_morning` | [Good Morning](https://wger.de/en/exercise/1392/view/) | [a02c9c7d-f42d-43e0-9946-1b99b014daee.png](https://wger.de/media/exercise-images/1392/a02c9c7d-f42d-43e0-9946-1b99b014daee.png) |
| `bb_incline_press` | [Incline Bench Press - Barbell](https://wger.de/en/exercise/538/view/) | [Incline-bench-press-1.png](https://wger.de/media/exercise-images/41/Incline-bench-press-1.png) |
| `bb_ohp` | [Shoulder Press, Barbell](https://wger.de/en/exercise/566/view/) | [seated-barbell-shoulder-press-large-1.png](https://wger.de/media/exercise-images/119/seated-barbell-shoulder-press-large-1.png) |
| `bb_row` | [Bent Over Rowing](https://wger.de/en/exercise/83/view/) | [Barbell-rear-delt-row-1.png](https://wger.de/media/exercise-images/109/Barbell-rear-delt-row-1.png) |
| `bb_shrug` | [Shrugs, Barbells](https://wger.de/en/exercise/571/view/) | [Barbell-shrugs-1.png](https://wger.de/media/exercise-images/150/Barbell-shrugs-1.png) |
| `bench_dip` | [Dips Between Two Benches](https://wger.de/en/exercise/197/view/) | [Bench-dips-1.png](https://wger.de/media/exercise-images/83/Bench-dips-1.png) |
| `cable_curl` | [Biceps Curl With Cable](https://wger.de/en/exercise/95/view/) | [Standing-biceps-curl-1.png](https://wger.de/media/exercise-images/129/Standing-biceps-curl-1.png) |
| `cable_fly` | [Fly With Cable](https://wger.de/en/exercise/237/view/) | [Incline-cable-flyes-1.png](https://wger.de/media/exercise-images/122/Incline-cable-flyes-1.png) |
| `cable_rope_hammer_curl` | [Hammercurls on Cable](https://wger.de/en/exercise/275/view/) | [Hammer-curls-with-rope-1.png](https://wger.de/media/exercise-images/138/Hammer-curls-with-rope-1.png) |
| `chinup` | [Chin Up](https://wger.de/en/exercise/152/view/) | [6c1a7459-266d-491a-bd50-7cbaea2bc771.png](https://wger.de/media/exercise-images/152/6c1a7459-266d-491a-bd50-7cbaea2bc771.png) |
| `close_grip_bench` | [Bench Press Narrow Grip](https://wger.de/en/exercise/76/view/) | [Narrow-grip-bench-press-1.png](https://wger.de/media/exercise-images/88/Narrow-grip-bench-press-1.png) |
| `db_curl` | [Biceps Curls With Dumbbell](https://wger.de/en/exercise/92/view/) | [Biceps-curl-1.png](https://wger.de/media/exercise-images/81/Biceps-curl-1.png) |
| `db_flat_press` | [Benchpress Dumbbells](https://wger.de/en/exercise/75/view/) | [Dumbbell-bench-press-1.png](https://wger.de/media/exercise-images/97/Dumbbell-bench-press-1.png) |
| `db_hammer_curl` | [Hammer Curls](https://wger.de/en/exercise/272/view/) | [Bicep-hammer-curl-1.png](https://wger.de/media/exercise-images/86/Bicep-hammer-curl-1.png) |
| `db_incline_press` | [Incline Bench Press - Dumbbell](https://wger.de/en/exercise/537/view/) | [Incline-press-1.png](https://wger.de/media/exercise-images/16/Incline-press-1.png) |
| `db_lateral_raise` | [Lateral Raises](https://wger.de/en/exercise/348/view/) | [lateral-dumbbell-raises-large-2.png](https://wger.de/media/exercise-images/148/lateral-dumbbell-raises-large-2.png) |
| `db_shoulder_press` | [Shoulder Press, Dumbbells](https://wger.de/en/exercise/567/view/) | [dumbbell-shoulder-press-large-1.png](https://wger.de/media/exercise-images/123/dumbbell-shoulder-press-large-1.png) |
| `db_shrug` | [Shrugs, Dumbbells](https://wger.de/en/exercise/572/view/) | [Dumbbell-shrugs-2.png](https://wger.de/media/exercise-images/151/Dumbbell-shrugs-2.png) |
| `ez_preacher_curl` | [Preacher Curls](https://wger.de/en/exercise/465/view/) | [Preacher-curl-3-1.png](https://wger.de/media/exercise-images/193/Preacher-curl-3-1.png) |
| `ez_skullcrusher` | [Skullcrusher SZ-bar](https://wger.de/en/exercise/246/view/) | [Lying-close-grip-triceps-press-to-chin-1.png](https://wger.de/media/exercise-images/84/Lying-close-grip-triceps-press-to-chin-1.png) |
| `leg_curl_lying` | [Leg Curls (laying)](https://wger.de/en/exercise/365/view/) | [lying-leg-curl-machine-large-1.png](https://wger.de/media/exercise-images/154/lying-leg-curl-machine-large-1.png) |
| `leg_curl_seated` | [Leg Curls (sitting)](https://wger.de/en/exercise/366/view/) | [seated-leg-curl-large-1.png](https://wger.de/media/exercise-images/117/seated-leg-curl-large-1.png) |
| `pec_deck` | [Butterfly](https://wger.de/en/exercise/135/view/) | [Butterfly-machine-2.png](https://wger.de/media/exercise-images/98/Butterfly-machine-2.png) |
| `reverse_crunch` | [Leg Raises, Lying](https://wger.de/en/exercise/377/view/) | [Leg-raises-2.png](https://wger.de/media/exercise-images/125/Leg-raises-2.png) |
| `t_bar_row` | [Rowing, T-bar](https://wger.de/en/exercise/513/view/) | [T-bar-row-1.png](https://wger.de/media/exercise-images/106/T-bar-row-1.png) |
| `walking_lunge` | [Dumbbell Lunges Walking](https://wger.de/en/exercise/206/view/) | [Walking-lunges-1.png](https://wger.de/media/exercise-images/113/Walking-lunges-1.png) |

### philip — [CC-BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/deed.en) — 6 assets

| Exercise (this app) | Source exercise | Original file |
| --- | --- | --- |
| `cable_lateral_raise` | [Lateral Rows on Cable, One Armed](https://wger.de/en/exercise/349/view/) | [9d969203-9cb6-4d47-9c31-fef53bfe1de5.png](https://wger.de/media/exercise-images/349/9d969203-9cb6-4d47-9c31-fef53bfe1de5.png) |
| `conventional_deadlift` | [Deadlifts](https://wger.de/en/exercise/184/view/) | [1709c405-620a-4d07-9658-fade2b66a2df.jpeg](https://wger.de/media/exercise-images/184/1709c405-620a-4d07-9658-fade2b66a2df.jpeg) |
| `db_front_raise` | [Front Raises](https://wger.de/en/exercise/256/view/) | [b7def5bc-2352-499b-b9e5-fff741003831.png](https://wger.de/media/exercise-images/256/b7def5bc-2352-499b-b9e5-fff741003831.png) |
| `diamond_pushup` | [Close-grip Press-ups](https://wger.de/en/exercise/1086/view/) | [b2ee8d9b-0480-4992-8494-c223b37c2696.jpg](https://wger.de/media/exercise-images/1086/b2ee8d9b-0480-4992-8494-c223b37c2696.jpg) |
| `goblet_squat` | [Dumbbell Goblet Squat](https://wger.de/en/exercise/203/view/) | [1c052351-2af0-4227-aeb0-244008e4b0a8.jpeg](https://wger.de/media/exercise-images/203/1c052351-2af0-4227-aeb0-244008e4b0a8.jpeg) |
| `reverse_lunge` | [Reverse lunges](https://wger.de/en/exercise/999/view/) | [d0931eb3-8db0-4049-bb08-aa4036072056.jfif](https://wger.de/media/exercise-images/999/d0931eb3-8db0-4049-bb08-aa4036072056.jfif) |

### cshep442 — [CC-BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/deed.en) — 5 assets

| Exercise (this app) | Source exercise | Original file |
| --- | --- | --- |
| `cable_pushdown` | [Tricep Pushdown on Cable](https://wger.de/en/exercise/805/view/) | [7a437824-e2cc-46e1-804a-674f0ea31d25.png](https://wger.de/media/exercise-images/805/7a437824-e2cc-46e1-804a-674f0ea31d25.png) |
| `cable_rear_delt_fly` | [Cable Rear Delt Fly](https://wger.de/en/exercise/822/view/) | [74affc0d-03b6-4f33-b5f4-a822a2615f68.png](https://wger.de/media/exercise-images/822/74affc0d-03b6-4f33-b5f4-a822a2615f68.png) |
| `db_fly` | [Fly With Dumbbells](https://wger.de/en/exercise/238/view/) | [2fc242d3-5bdd-4f97-99bd-678adb8c96fc.png](https://wger.de/media/exercise-images/238/2fc242d3-5bdd-4f97-99bd-678adb8c96fc.png) |
| `db_rear_delt_fly` | [Rear Delt Raises](https://wger.de/en/exercise/487/view/) | [ad724e5c-b1ed-49e8-9279-a17545b0dd0b.png](https://wger.de/media/exercise-images/487/ad724e5c-b1ed-49e8-9279-a17545b0dd0b.png) |
| `dip` | [Dips](https://wger.de/en/exercise/194/view/) | [34600351-8b0b-4cb0-8daa-583537be15b0.png](https://wger.de/media/exercise-images/194/34600351-8b0b-4cb0-8daa-583537be15b0.png) |

### novadani — [CC-BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/deed.en) — 2 assets

| Exercise (this app) | Source exercise | Original file |
| --- | --- | --- |
| `smith_incline_press` | [Smith Machine Slight Incline Press](https://wger.de/en/exercise/925/view/) | [67dbb1c9-b378-46f9-adb6-1f55b3d3007a.png](https://wger.de/media/exercise-images/925/67dbb1c9-b378-46f9-adb6-1f55b3d3007a.png) |
| `smith_ohp` | [Smith Press](https://wger.de/en/exercise/916/view/) | [9bf7555a-fec6-43a9-b343-aae496744e5e.png](https://wger.de/media/exercise-images/916/9bf7555a-fec6-43a9-b343-aae496744e5e.png) |

### Gavru — [CC-BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/deed.en) — 1 asset

| Exercise (this app) | Source exercise | Original file |
| --- | --- | --- |
| `inverted_row` | [Inverted Rows](https://wger.de/en/exercise/1198/view/) | [864906ac-4ac7-4e52-a886-c6bb97950a9f.jpg](https://wger.de/media/exercise-images/1198/864906ac-4ac7-4e52-a886-c6bb97950a9f.jpg) |

### Imobard — [CC-BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/deed.en) — 1 asset

| Exercise (this app) | Source exercise | Original file |
| --- | --- | --- |
| `pullup` | [Pull-ups](https://wger.de/en/exercise/475/view/) | [b0554016-16fd-4dbe-be47-a2a17d16ae0e.jpg](https://wger.de/media/exercise-images/475/b0554016-16fd-4dbe-be47-a2a17d16ae0e.jpg) |

### lhegedus — [CC-BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/deed.en) — 1 asset

| Exercise (this app) | Source exercise | Original file |
| --- | --- | --- |
| `ab_wheel` | [Ab wheel](https://wger.de/en/exercise/1573/view/) | [b8efea91-8fcb-4926-82a9-76c62b16925f.jpg](https://wger.de/media/exercise-images/1573/b8efea91-8fcb-4926-82a9-76c62b16925f.jpg) |

### Nash — [CC-BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/deed.en) — 1 asset

| Exercise (this app) | Source exercise | Original file |
| --- | --- | --- |
| `pike_pushup` | [Pike Push Ups](https://wger.de/en/exercise/454/view/) | [447f3c17-405f-46e0-b138-65c2a8caaab0.png](https://wger.de/media/exercise-images/454/447f3c17-405f-46e0-b138-65c2a8caaab0.png) |

### powerade69 — [CC-BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/deed.en) — 1 asset

| Exercise (this app) | Source exercise | Original file |
| --- | --- | --- |
| `db_pullover` | [Cross-Bench Dumbbell Pullovers](https://wger.de/en/exercise/161/view/) | [b9b1803e-2817-40bf-8ac7-e398ca86d8b4.png](https://wger.de/media/exercise-images/161/b9b1803e-2817-40bf-8ac7-e398ca86d8b4.png) |

### prevail90 — [CC-BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/deed.en) — 1 asset

| Exercise (this app) | Source exercise | Original file |
| --- | --- | --- |
| `pallof_press` | [Pallof Press](https://wger.de/en/exercise/1194/view/) | [074e1766-4208-4a67-a211-9721772d99b0.png](https://wger.de/media/exercise-images/1194/074e1766-4208-4a67-a211-9721772d99b0.png) |

### Settebello — [CC-BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/deed.en) — 1 asset

| Exercise (this app) | Source exercise | Original file |
| --- | --- | --- |
| `pushup` | [Push-Up](https://wger.de/en/exercise/1551/view/) | [a6a9e561-3965-45c6-9f2b-ee671e1a3a45.png](https://wger.de/media/exercise-images/1551/a6a9e561-3965-45c6-9f2b-ee671e1a3a45.png) |

### wger community contributor — [CC-BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/deed.en) — 1 asset

| Exercise (this app) | Source exercise | Original file |
| --- | --- | --- |
| `step_up` | [Step-ups](https://wger.de/en/exercise/981/view/) | [f9377a7e-eb58-4cca-b805-2d36863aeb03.png](https://wger.de/media/exercise-images/981/f9377a7e-eb58-4cca-b805-2d36863aeb03.png) |

### wger.de — [CC-BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/deed.en) — 1 asset

| Exercise (this app) | Source exercise | Original file |
| --- | --- | --- |
| `machine_shoulder_press` | [Shoulder Press, on Machine](https://wger.de/en/exercise/543/view/) | [Shoulder-press-machine-2.png](https://wger.de/media/exercise-images/53/Shoulder-press-machine-2.png) |

### Workout Guru — [CC-BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/deed.en) — 1 asset

| Exercise (this app) | Source exercise | Original file |
| --- | --- | --- |
| `bb_back_squat` | [Barbell Full Squat](https://wger.de/en/exercise/1801/view/) | [60043328-1cfb-4289-9865-aaf64d5aaa28.jpg](https://wger.de/media/exercise-images/1801/60043328-1cfb-4289-9865-aaf64d5aaa28.jpg) |

---

Source database: [wger Workout Manager](https://wger.de) · exercise data and images contributed by the
wger community. Licence texts: [CC-BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/deed.en),
[CC-BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/deed.en).


## Assets from Wikimedia Commons (37)

A second sourcing pass drew on [Wikimedia Commons](https://commons.wikimedia.org/), where every file
carries machine-readable, per-file licence metadata that can be verified against the Commons API.
This reaches the same **Everkinetic** open library that wger's core set is built from — but Commons
hosts far more of it than wger imported, including the resistance-band and machine movements wger lacks.

The *Modifications* described above apply identically to these assets. SVG sources were rasterised by the
Commons thumbnail renderer before frame assembly; the two `GyorgyGajdos` clips are sampled from the
author's own animations rather than assembled from stills.

### Everkinetic — [CC-BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/deed.en) — 34 assets

Source library: [everkinetic.com](http://everkinetic.com/) · via Wikimedia Commons.

| Exercise (this app) | Source file | Original frames |
| --- | --- | --- |
| `abductor_machine` | [Thigh abductor](https://commons.wikimedia.org/wiki/File:Thigh-abductor-1.gif) | [Thigh-abductor-1.gif](https://upload.wikimedia.org/wikipedia/commons/2/29/Thigh-abductor-1.gif) · [Thigh-abductor-2.gif](https://upload.wikimedia.org/wikipedia/commons/0/0c/Thigh-abductor-2.gif) |
| `adductor_machine` | [Thigh adductor](https://commons.wikimedia.org/wiki/File:Thigh-adductor-1.gif) | [Thigh-adductor-1.gif](https://upload.wikimedia.org/wikipedia/commons/1/1c/Thigh-adductor-1.gif) · [Thigh-adductor-2.gif](https://upload.wikimedia.org/wikipedia/commons/5/59/Thigh-adductor-2.gif) |
| `band_chest_press` | [Bench press with bands](https://commons.wikimedia.org/wiki/File:Bench-press-with-bands-1.png) | [Bench-press-with-bands-1.png](https://upload.wikimedia.org/wikipedia/commons/f/f5/Bench-press-with-bands-1.png) · [Bench-press-with-bands-2.png](https://upload.wikimedia.org/wikipedia/commons/f/f3/Bench-press-with-bands-2.png) |
| `band_curl` | [Quick alternating bicep curls with band](https://commons.wikimedia.org/wiki/File:Quick_alternating_bicep_curls_with_band_1.svg) | [Quick alternating bicep curls with band 1.svg](https://upload.wikimedia.org/wikipedia/commons/7/7f/Quick_alternating_bicep_curls_with_band_1.svg) · [Quick alternating bicep curls with band 2.svg](https://upload.wikimedia.org/wikipedia/commons/6/6d/Quick_alternating_bicep_curls_with_band_2.svg) |
| `band_fly` | [Crossover with bands](https://commons.wikimedia.org/wiki/File:Crossover-with-bands-1.png) | [Crossover-with-bands-1.png](https://upload.wikimedia.org/wikipedia/commons/8/85/Crossover-with-bands-1.png) · [Crossover-with-bands-2.png](https://upload.wikimedia.org/wikipedia/commons/5/59/Crossover-with-bands-2.png) |
| `band_pull_apart` | [Back flyes with resistance bands](https://commons.wikimedia.org/wiki/File:Back-flyes-with-resistance-bands-1.png) | [Back-flyes-with-resistance-bands-1.png](https://upload.wikimedia.org/wikipedia/commons/7/72/Back-flyes-with-resistance-bands-1.png) · [Back-flyes-with-resistance-bands-2.png](https://upload.wikimedia.org/wikipedia/commons/e/ea/Back-flyes-with-resistance-bands-2.png) |
| `bb_rdl` | [Romanian deadlift](https://commons.wikimedia.org/wiki/File:Romanian-deadlift-1.png) | [Romanian-deadlift-1.png](https://upload.wikimedia.org/wikipedia/commons/e/e8/Romanian-deadlift-1.png) · [Romanian-deadlift-2.png](https://upload.wikimedia.org/wikipedia/commons/5/58/Romanian-deadlift-2.png) |
| `bb_reverse_curl` | [Biceps curl reverse](https://commons.wikimedia.org/wiki/File:Biceps-curl-reverse-1.png) | [Biceps-curl-reverse-1.png](https://upload.wikimedia.org/wikipedia/commons/7/7a/Biceps-curl-reverse-1.png) · [Biceps-curl-reverse-2.png](https://upload.wikimedia.org/wikipedia/commons/9/90/Biceps-curl-reverse-2.png) |
| `cable_crunch` | [Seated ab crunch](https://commons.wikimedia.org/wiki/File:Seated-ab-crunch-1.gif) | [Seated-ab-crunch-1.gif](https://upload.wikimedia.org/wikipedia/commons/0/05/Seated-ab-crunch-1.gif) · [Seated-ab-crunch-2.gif](https://upload.wikimedia.org/wikipedia/commons/9/99/Seated-ab-crunch-2.gif) |
| `cable_kickback` | [One legged kickback](https://commons.wikimedia.org/wiki/File:One-legged-kickback-1.png) | [One-legged-kickback-1.png](https://upload.wikimedia.org/wikipedia/commons/8/88/One-legged-kickback-1.png) · [One-legged-kickback-2.png](https://upload.wikimedia.org/wikipedia/commons/b/b6/One-legged-kickback-2.png) |
| `cable_overhead_extension` | [Kneeling triceps extension with cable](https://commons.wikimedia.org/wiki/File:Kneeling_triceps_extension_with_cable_1.svg) | [Kneeling triceps extension with cable 1.svg](https://upload.wikimedia.org/wikipedia/commons/5/56/Kneeling_triceps_extension_with_cable_1.svg) · [Kneeling triceps extension with cable 2.svg](https://upload.wikimedia.org/wikipedia/commons/a/a1/Kneeling_triceps_extension_with_cable_2.svg) |
| `cable_row` | [Cable seated rows](https://commons.wikimedia.org/wiki/File:Cable-seated-rows-1.png) | [Cable-seated-rows-1.png](https://upload.wikimedia.org/wikipedia/commons/2/2d/Cable-seated-rows-1.png) · [Cable-seated-rows-2.png](https://upload.wikimedia.org/wikipedia/commons/4/4d/Cable-seated-rows-2.png) |
| `cable_shrug` | [Cable shrugs](https://commons.wikimedia.org/wiki/File:Cable-shrugs-1.png) | [Cable-shrugs-1.png](https://upload.wikimedia.org/wikipedia/commons/a/a1/Cable-shrugs-1.png) · [Cable-shrugs-2.png](https://upload.wikimedia.org/wikipedia/commons/4/44/Cable-shrugs-2.png) |
| `db_overhead_extension` | [Seated triceps press](https://commons.wikimedia.org/wiki/File:Seated-triceps-press-1.gif) | [Seated-triceps-press-1.gif](https://upload.wikimedia.org/wikipedia/commons/2/2d/Seated-triceps-press-1.gif) · [Seated-triceps-press-2.gif](https://upload.wikimedia.org/wikipedia/commons/9/92/Seated-triceps-press-2.gif) |
| `db_rdl` | [Dumbbell dead lifts](https://commons.wikimedia.org/wiki/File:Dumbbell_dead_lifts_1.svg) | [Dumbbell dead lifts 1.svg](https://upload.wikimedia.org/wikipedia/commons/d/da/Dumbbell_dead_lifts_1.svg) · [Dumbbell dead lifts 2.svg](https://upload.wikimedia.org/wikipedia/commons/c/c3/Dumbbell_dead_lifts_2.svg) |
| `db_row` | [Rear deltoid row dumbbell](https://commons.wikimedia.org/wiki/File:Rear_deltoid_row_dumbbell_1.svg) | [Rear deltoid row dumbbell 1.svg](https://upload.wikimedia.org/wikipedia/commons/0/0e/Rear_deltoid_row_dumbbell_1.svg) · [Rear deltoid row dumbbell 2.svg](https://upload.wikimedia.org/wikipedia/commons/c/c5/Rear_deltoid_row_dumbbell_2.svg) |
| `ez_curl` | [Ez bar curl](https://commons.wikimedia.org/wiki/File:Ez-bar-curl-1.gif) | [Ez-bar-curl-1.gif](https://upload.wikimedia.org/wikipedia/commons/5/5e/Ez-bar-curl-1.gif) · [Ez-bar-curl-2.gif](https://upload.wikimedia.org/wikipedia/commons/7/7a/Ez-bar-curl-2.gif) |
| `glute_bridge` | [Bridging](https://commons.wikimedia.org/wiki/File:Bridging_1.svg) | [Bridging 1.svg](https://upload.wikimedia.org/wikipedia/commons/c/cd/Bridging_1.svg) · [Bridging 2.svg](https://upload.wikimedia.org/wikipedia/commons/0/06/Bridging_2.svg) |
| `hack_squat` | [Hack squats](https://commons.wikimedia.org/wiki/File:Hack-squats-1.gif) | [Hack-squats-1.gif](https://upload.wikimedia.org/wikipedia/commons/f/f4/Hack-squats-1.gif) · [Hack-squats-2.gif](https://upload.wikimedia.org/wikipedia/commons/9/98/Hack-squats-2.gif) |
| `incline_db_curl` | [Incline biceps curl](https://commons.wikimedia.org/wiki/File:Incline-biceps-curl-1.gif) | [Incline-biceps-curl-1.gif](https://upload.wikimedia.org/wikipedia/commons/8/81/Incline-biceps-curl-1.gif) · [Incline-biceps-curl-2.gif](https://upload.wikimedia.org/wikipedia/commons/3/38/Incline-biceps-curl-2.gif) |
| `incline_press_machine` | [Incline chest press](https://commons.wikimedia.org/wiki/File:Incline-chest-press-1.png) | [Incline-chest-press-1.png](https://upload.wikimedia.org/wikipedia/commons/3/31/Incline-chest-press-1.png) · [Incline-chest-press-2.png](https://upload.wikimedia.org/wikipedia/commons/f/f5/Incline-chest-press-2.png) |
| `lat_pulldown` | [Wide grip lat pull down](https://commons.wikimedia.org/wiki/File:Wide-grip-lat-pull-down-1.gif) | [Wide-grip-lat-pull-down-1.gif](https://upload.wikimedia.org/wikipedia/commons/8/82/Wide-grip-lat-pull-down-1.gif) · [Wide-grip-lat-pull-down-2.gif](https://upload.wikimedia.org/wikipedia/commons/7/79/Wide-grip-lat-pull-down-2.gif) |
| `leg_extension` | [Leg extensions 1 672x1024](https://commons.wikimedia.org/wiki/File:Leg-extensions-1-672x1024.png) | [Leg-extensions-1-672x1024.png](https://upload.wikimedia.org/wikipedia/commons/b/b1/Leg-extensions-1-672x1024.png) · [Leg-extensions-2-672x1024.png](https://upload.wikimedia.org/wikipedia/commons/5/58/Leg-extensions-2-672x1024.png) |
| `leg_press` | [Leg press 1 1024x670](https://commons.wikimedia.org/wiki/File:Leg-press-1-1024x670.png) | [Leg-press-1-1024x670.png](https://upload.wikimedia.org/wikipedia/commons/0/0c/Leg-press-1-1024x670.png) · [Leg-press-2-1024x670.png](https://upload.wikimedia.org/wikipedia/commons/0/04/Leg-press-2-1024x670.png) |
| `leg_press_calf_raise` | [Calves press on leg machine](https://commons.wikimedia.org/wiki/File:Calves-press-on-leg-machine-1.png) | [Calves-press-on-leg-machine-1.png](https://upload.wikimedia.org/wikipedia/commons/1/1d/Calves-press-on-leg-machine-1.png) · [Calves-press-on-leg-machine-2.png](https://upload.wikimedia.org/wikipedia/commons/6/61/Calves-press-on-leg-machine-2.png) |
| `machine_chest_press` | [Machine bench press](https://commons.wikimedia.org/wiki/File:Machine_bench_press_1.svg) | [Machine bench press 1.svg](https://upload.wikimedia.org/wikipedia/commons/a/a9/Machine_bench_press_1.svg) · [Machine bench press 2.svg](https://upload.wikimedia.org/wikipedia/commons/4/4d/Machine_bench_press_2.svg) |
| `preacher_curl_machine` | [Preacher curl with machine](https://commons.wikimedia.org/wiki/File:Preacher_curl_with_machine_1.svg) | [Preacher curl with machine 1.svg](https://upload.wikimedia.org/wikipedia/commons/b/ba/Preacher_curl_with_machine_1.svg) · [Preacher curl with machine 2.svg](https://upload.wikimedia.org/wikipedia/commons/8/89/Preacher_curl_with_machine_2.svg) |
| `seated_calf_raise` | [Seated calf raise](https://commons.wikimedia.org/wiki/File:Seated-calf-raise-1.gif) | [Seated-calf-raise-1.gif](https://upload.wikimedia.org/wikipedia/commons/a/ae/Seated-calf-raise-1.gif) · [Seated-calf-raise-2.gif](https://upload.wikimedia.org/wikipedia/commons/6/6b/Seated-calf-raise-2.gif) |
| `sissy_squat` | [Weighted sissy squat](https://commons.wikimedia.org/wiki/File:Weighted-sissy-squat-1.gif) | [Weighted-sissy-squat-1.gif](https://upload.wikimedia.org/wikipedia/commons/b/b7/Weighted-sissy-squat-1.gif) · [Weighted-sissy-squat-2.gif](https://upload.wikimedia.org/wikipedia/commons/5/55/Weighted-sissy-squat-2.gif) |
| `smith_squat` | [Smith machine squats](https://commons.wikimedia.org/wiki/File:Smith_machine_squats_1.svg) | [Smith machine squats 1.svg](https://upload.wikimedia.org/wikipedia/commons/b/bb/Smith_machine_squats_1.svg) · [Smith machine squats 2.svg](https://upload.wikimedia.org/wikipedia/commons/8/8b/Smith_machine_squats_2.svg) |
| `standing_calf_raise` | [Standing calf raises using machine](https://commons.wikimedia.org/wiki/File:Standing_calf_raises_using_machine_1.svg) | [Standing calf raises using machine 1.svg](https://upload.wikimedia.org/wikipedia/commons/4/4a/Standing_calf_raises_using_machine_1.svg) · [Standing calf raises using machine 2.svg](https://upload.wikimedia.org/wikipedia/commons/1/1a/Standing_calf_raises_using_machine_2.svg) |
| `straight_arm_pulldown` | [Straight arm push down](https://commons.wikimedia.org/wiki/File:Straight-arm-push-down-1.png) | [Straight-arm-push-down-1.png](https://upload.wikimedia.org/wikipedia/commons/d/d6/Straight-arm-push-down-1.png) · [Straight-arm-push-down-2.png](https://upload.wikimedia.org/wikipedia/commons/c/cc/Straight-arm-push-down-2.png) |
| `triceps_extension_machine` | [Triceps extensions](https://commons.wikimedia.org/wiki/File:Triceps-extensions-1.gif) | [Triceps-extensions-1.gif](https://upload.wikimedia.org/wikipedia/commons/d/d5/Triceps-extensions-1.gif) · [Triceps-extensions-2.gif](https://upload.wikimedia.org/wikipedia/commons/4/4d/Triceps-extensions-2.gif) |
| `upright_row` | [Barbell upright rows](https://commons.wikimedia.org/wiki/File:Barbell-upright-rows-1.png) | [Barbell-upright-rows-1.png](https://upload.wikimedia.org/wikipedia/commons/b/bf/Barbell-upright-rows-1.png) · [Barbell-upright-rows-2.png](https://upload.wikimedia.org/wikipedia/commons/3/34/Barbell-upright-rows-2.png) |

### GyorgyGajdos — [CC-BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/deed.en) — 2 assets

Own work, self-published to Wikimedia Commons by [GyorgyGajdos](https://commons.wikimedia.org/wiki/User:GyorgyGajdos).

| Exercise (this app) | Source file | Original frames |
| --- | --- | --- |
| `band_ohp` | [Overhead press demonstration with resistance bands](https://commons.wikimedia.org/wiki/File:Overhead_press_demonstration_with_resistance_bands.gif) | [Overhead press demonstration with resistance bands.gif](https://upload.wikimedia.org/wikipedia/commons/9/92/Overhead_press_demonstration_with_resistance_bands.gif) |
| `band_row` | [Bent over rows with resistance bands 01](https://commons.wikimedia.org/wiki/File:Bent_over_rows_with_resistance_bands_01.gif) | [Bent over rows with resistance bands 01.gif](https://upload.wikimedia.org/wikipedia/commons/5/5e/Bent_over_rows_with_resistance_bands_01.gif) |

### Teran61 — [CC-BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/deed.en) — 1 asset

Own work, self-published to Wikimedia Commons by [Teran61](https://commons.wikimedia.org/wiki/User:Teran61).

| Exercise (this app) | Source file | Original frames |
| --- | --- | --- |
| `assisted_pullup` | [Francis practicando pullups asistido con liga - Crossfit](https://commons.wikimedia.org/wiki/File:Francis_practicando_pullups_asistido_con_liga_-_Crossfit.JPG) | [Francis practicando pullups asistido con liga - Crossfit.JPG](https://upload.wikimedia.org/wikipedia/commons/0/0a/Francis_practicando_pullups_asistido_con_liga_-_Crossfit.JPG) |

## Sources rejected in this pass

The licence discipline above excluded further candidates, which are therefore **not** shipped:

- **wger images by uploaders `Franpol`, `roneydya`, `barry`, `carlos3c`, `clafal`, `AlucardEvil40`** — carried over from the first pass (weighttraining.guide artwork).
- **wger images with a blank `license_author` rendered in a grey 3-D anatomical style** — visually
  identical (same bench, shorts and red muscle-highlight treatment) to a wger file watermarked
  **FitnessProgramer.com**. A CC tag applied by an uploader cannot grant rights the uploader does not hold,
  so this entire family was treated as unlicensed. This cost `leg_press`, `leg_extension`, `lat_pulldown`,
  `abductor_machine` and others from wger — all of which were instead sourced cleanly from Everkinetic.
- **wger base 1186 (One Arm Bent Row)** — the artwork carries an embedded
  `© February 2008 HOIST® Fitness Systems` notice.
- **wger base 570 (Shoulder Shrug)** — the file is a fitness brand logo, not an exercise.
- **wger base 146 (Calf Press)** — third-party commercial machine-placard artwork, no attributable author.
- **Commons `File:Glute ham raise.jpg`** — an IRONTOOL-watermarked vendor product photo of an empty machine.
- **Unattributable 2-D line art on wger with no author** — provenance could not be established, so no
  attribution could satisfy CC-BY-SA.

Candidates rejected for **depicting the wrong movement**, despite clean licences: `Upright band rows`
(an upright row, not a horizontal band row), `Side-split-squats` (a lateral squat, not a Bulgarian split
squat), `Squats` (barbell-loaded, while `bw_squat` is bodyweight-only), `Bent-over-rear-delt-row-with-head-on-bench`
(a rear-delt row, not a chest-supported row).
