# Chapter 1 Depth & Exploration Pass — Design

**Date:** 2026-07-11
**Status:** Approved by user (brainstorming session)

## Goal

Make every Chapter 1 environment worth exploring. Add a thin, reusable
light-RPG layer (collectibles, errands, inventory overlay, completion
tallies) plus a curated, book-anchored content pass over the five
existing zones. Extend scenes — notably a much longer Woody End walk —
and add interesting detail inside and out.

## Constraints (user decisions)

- **Full light-RPG layer**: collectibles + optional side-errands +
  inventory overlay + completion tracking.
- **Enlarge existing zones only**: no new zone keys, no new enterable
  interiors. Interiors keep their footprints but get denser.
- **Book-anchored inventions**: every errand/collectible hangs off
  something actually in the text; specific tasks may be invented; no
  invented characters or lore.
- **Light overlay UI**: one key (`I`) toggles a pause-free overlay in
  the dialogue-box style; no separate menu scene.
- **Nothing gates the main story**: all new content is optional; the
  critical path is unchanged.

## Part 1 — The thin reusable layer

### Items & pickups

- New `src/data/items.js`: registry of `{ key, name, desc }` (mushroom,
  mathom variants, silver spoons, elven provisions, half-pint mug, …).
- New `src/art/items.js`: 12×12 procedural icons, one draw function per
  item, composited onto a strip like tiles; order must match the
  registry.
- Zones gain a declarative array, validated like `npcs`:

  ```js
  pickups: [{ id: 'mush1', x: 12, y: 7, item: 'mushroom', when?: (f) => ... }]
  ```

- Pickups render as small y-sorted sprites, collected by walk-over
  (Zelda-style) with the existing `jingle` SFX and a toast
  ("Got a mushroom! 3/12").
- State: collected pickup ids in a `Set`, item counts in a map — both on
  the `GameState` module singleton, same pattern as flags.

### Examines

Reuse the `signs` zone array (coordinate → dialogue on SPACE) for
barrels, the mill wheel, Bilbo's desk, firework crates, etc. One small
engine change is required: WorldScene currently consults `zone.signs`
only when the faced tile is `T.SIGN`, so the interaction check must be
relaxed to a coordinate-first lookup against `zone.signs` (any solid
tile), while preserving current behavior for real signposts and the
`door_locked` fallback. Flavor text lives in the dialogue registry as
usual.

### Errands (quests)

- New `src/data/quests.js`: `{ key, title, hint, active(f), done(f) }` —
  a pure **view over existing flags**. Dialogue stages keep setting
  flags exactly as today; no new state machinery. Rewards fire through
  dialogue `set` effects.

### Overlay panel

- `I` toggles a non-pausing overlay drawn in the dialogue-box style:
  item icons + counts, errand list with done/undone ticks, and
  completion tallies ("Mathoms 3/6 · Mushrooms 7/12 · Errands 2/4").
- `Q` (objective recall) and `M` (mute) are unchanged.

### Tests

Extend the integrity suite in the style of `tests/zones.test.js`:

- every pickup references a real item and sits on a walkable tile;
- every quest predicate runs against empty and all-true flag sets
  without throwing;
- every examine/sign dialogue key exists;
- item icon count matches the item registry (like tiles today).

## Part 2 — Hobbiton, Bag End, the Green Dragon

### Shire map growth (40×40 → ~48×44)

- **Sandyman's Mill** on The Water, south-west by the bridge: mill
  building with a water-wheel (new tiles), a mill pond widening the
  river, and **Sandyman the miller** (new NPC, Ted's father) outside.
- **The Ivy Bush** on the Bywater road (book Ch. 1), exterior only:
  bench, sign, lantern, locked door. **Old Noakes** and **Daddy
  Twofoot** (the Gaffer's textual companions) sit outside with staged
  dialogue — party gossip in the prologue, "queer goings-on" after the
  time skip (they move indoors to the Green Dragon post-skip).
- More off-road pockets: an orchard, a second garden lane behind
  Bagshot Row, flower verges along The Water — each hiding a mathom or
  an examine.
- Party-event and existing spawn/door/sign coordinates must be
  preserved or updated together with their events.

### Collectible: mathoms (6)

Bilbo's old curios scattered where he would plausibly have left them
(the book defines a mathom as anything a hobbit can't bear to throw
away). Finding all six earns one new Gandalf dialogue line.

### Errands

1. **Lobelia's spoons** — Bilbo left Lobelia silver spoons as a
   labelled parting joke. An examine on a chest in Bag End reveals the
   pickup; deliver to Lobelia for a sour staged response.
2. **The Gaffer's half-pint** — Rosie at the Green Dragon asks Frodo to
   run a mug down to the Gaffer at Bagshot Row.
3. **Gandalf's firework crates** *(prologue)* — fetch three crates
   misplaced around the Party Field, labelled with firework names from
   the text (squibs, crackers, backarappers).

### Interiors (same footprints, denser)

- **Bag End**: examines on existing furniture plus a few new prop
  tiles — Bilbo's writing desk with the *There and Back Again*
  manuscript, framed maps of the Wilderland, the fireplace where the
  Ring's letters were revealed, a pantry shelf, the spoons chest.
- **Green Dragon**: ale-cask and hearth examines; Old Noakes and Daddy
  Twofoot at a table post-skip; the Sam-vs-Ted argument gains 2–3
  staged lines with them chiming in.

## Part 3 — The Woody End

### Map growth (40×24 → ~64×28)

A genuinely long walk: more road bends, a dark tree-tunnel stretch
(the book's deep-cut lane where they first hear hooves), dips and rises
via hill tiles. `ROAD_Y` keeps its export shape, just longer; the
guaranteed fern brakes stay at intervals so the rider-hiding mechanic
scales with the road. The rider event must be re-verified after the
resize.

### Vignettes

1. **The walking song** — on first entry, a one-time auto-dialogue
   (~4 lines): Frodo quotes "The Road goes ever on and on…", Sam
   answers. Sets a flag.
2. **The fox** — a fir-tree hollow off-road to the south (the book's
   first campsite). Approaching triggers a fox (new 16×16 two-frame
   sprite) trotting past with the book's narration: *"Hobbits! Well,
   what next? … There's something mighty queer behind this."* One-time.
3. **The hall of trees** — Gildor's clearing becomes the Woodhall
   feast: wider greensward, three additional elves (ELF-template
   recolors, one shared staged dialogue about the Exiles), a laid feast
   (new tile). A soft *elf-song* audio motif plays near the clearing.
   Examining the feast after talking to Gildor grants **elven
   provisions** (the book: Gildor's folk leave bread and fruit), which
   Sam comments on in the Marish.

### Collectible

Mushrooms begin here: 3–4 of the shared "Mushrooms X/12" tally hidden
in off-road brakes in the eastern half. No invented zone-only
collectible; the vignettes are the reward.

## Part 4 — The Marish

### Map growth (44×26 → ~56×30)

- The lane becomes the book's **causeway**: raised path with a
  ditch/dike line beside it as it nears the river.
- **Bamfurlong grows**: a barn and outbuildings inside the fence, a
  well, Maggot's waggon parked in the yard (examine), and **Mrs.
  Maggot** (new FEMALE-template NPC) at the farmhouse door with the
  mushroom-basket line.
- A flavor signpost points off-map to **Stock** (real geography).
- The ferry landing gains a second lantern and rope-and-post detail;
  the Buckland shore gets an examine looking toward the lights of
  Brandy Hall. The ferry event must be re-verified after the resize.

### Errand: Maggot's dogs

Grip, Fang, and Wolf are still spooked from the Black Rider (textual).
They hide around the farm and marsh; find each (new small two-frame dog
sprite, bark bubble + personality line) and send them home. All three
home → Maggot gains a new stage and Mrs. Maggot gives **Mrs. Maggot's
basket** (a distinct item, matching the book's parting gift — it does
NOT count toward the Mushrooms 12 tally, which tracks world pickups
only).

### Mushrooms

The remaining 8–9 of 12 are here — some by the lane, some deep in bog
pockets behind reed mazes (walkable bog, solid reeds → small navigation
puzzles). Picking mushrooms **inside Maggot's fence** before
befriending him triggers a scolding stage — the young-rascal history
made playable.

## Completion & final beats

Overlay tallies: **Mathoms 0/6 · Mushrooms 0/12 · Errands 0/4**
(crates, spoons, half-pint, dogs). The crates errand is **missable by
design** — it exists only during the prologue (and the e2e prologue
skip bypasses it entirely). Merry's soft 100% line on the Buckland
shore therefore requires only the two tallies plus the three post-party
errands (spoons, half-pint, dogs); crates show in the overlay but do
not gate the nod. No mechanical gate anywhere.

## Bill of materials

- **Art**: fox and dog sprites; Mrs. Maggot, Old Noakes, Daddy Twofoot,
  Sandyman palettes; 3 elf recolors; ~7 new tiles (mill wall/wheel,
  causeway, feast, crate, barn, well, ditch). Mathoms are item icons in
  `src/art/items.js`, not tiles.
- **Audio**: one short *elf-song* motif (stretch — cut if fiddly).
- **Code**: `src/data/items.js`, `src/data/quests.js`,
  `src/art/items.js`, pickup/overlay handling in WorldScene, fox/dog
  behavior modules.

## Risks

- The rider and ferry events are coordinate-coupled to their maps; both
  need re-verification after resizing (unit tests + e2e cover this).
- Shire map edits must preserve partyEvent coordinates.
- Scope discipline: the overlay stays a single panel; no menu-scene
  creep.

## Implementation phasing

Part 1 (the reusable layer + its tests) is a standalone first phase;
Parts 2–4 (zone content passes) all depend on it and can then land zone
by zone.

## Testing

- Integrity tests for items/pickups/quests/examines (Part 1).
- Existing zone/dialogue/tile integrity tests keep passing.
- e2e extended with one exploration smoke path: teleport → collect a
  mushroom → open overlay → assert the tally.
