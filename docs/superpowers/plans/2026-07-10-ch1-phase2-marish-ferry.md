# Chapter 1 Revision — Phase 2: The Marish, Farmer Maggot & Bucklebury Ferry

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the Woody End's dead-end ferry sign with the book's actual ending: east through the Woody End into a new Marish zone — Farmer Maggot's Bamfurlong farm, his account of the Black Rider, mushrooms, a waggon lift to Bucklebury Ferry, Merry at the landing, and a raft crossing of the Brandywine with a Rider halting on the bank behind. "To be continued" moves to the Buckland shore.

**Architecture:** `woodyend.js` loses its river/pier (road now runs out the east edge, gated on `metGildor`). New generated zone `src/data/zones/marish.js` (seeded LCG like the Woody End: winding lane `LANE_Y`, bog scatter, hand-carved farm plot, river + pier + east-bank strip). Two new tiles (BOG walkable, REEDS solid); Phase 1's LANTERN reused at the landing. Maggot and Merry are MALE-template palette entries. The waggon ride (fade-teleport) and the ferry crossing (raft tween with body-disabled player, Rider arriving on the bank) are one `zone.onUpdate` state machine in `src/events/ferryEvent.js`.

**Tech Stack:** Phaser 3 + Vite; Vitest fake-scene units; Playwright e2e.

**Branch:** `ch1-marish-ferry` **stacked on `ch1-party-field`** (both touch tileTypes/tiles/characters/dialogues; stacking avoids conflicts). PR base = `ch1-party-field`; GitHub retargets to `main` when PR 1 merges.

---

## Story flow (abridged from _A Short Cut to Mushrooms_ / _A Conspiracy Unmasked_)

1. After Gildor (`metGildor`), the Woody End's east road opens. Objective (updated Gildor stage): _"Make for Bucklebury Ferry, through the Marish"_.
2. Marish: follow the lane southeast through boggy fields to Bamfurlong. Maggot at his gate: recognizes Frodo (mushroom-thief history), recounts the black rider who came asking for _Baggins_, offers the waggon lift + a basket of mushrooms from Mrs. Maggot. Close → `maggotRide`, `mushrooms`.
3. Waggon ride: fade out, banner ("Maggot's waggon rattles on through the dark…"), player+follower repositioned at the ferry landing, `rodeWaggon`, fade in. Maggot despawns (drove home).
4. Merry waits at the lamplit landing (`when: rodeWaggon`): "There you are! I've been waiting…" → `merryMet`, objective _"Board the ferry raft"_.
5. Stepping onto the pier end triggers the crossing: input locked, player/Sam/Merry placed on a raft (tileset-frame images), body disabled, tween across the river. Midway a Rider gallops to the landing, halts — red flash, sting, banner. On the far bank: `crossedFerry`, jingle, objective _"To be continued…"_, Buckland sign with the chapter-end text.

## Files

- Modify: `src/data/tileTypes.js` — `BOG` (walkable), `REEDS` (solid), indices after Phase 1's.
- Modify: `src/art/tiles.js` — two draw functions (BOG: murky grass + puddle glints; REEDS: water-edge rushes).
- Modify: `src/art/characters.js` — `maggot` (broad russet farmer, hat via `extra`), `merry` (Brandybuck green + yellow scarf).
- Modify: `src/data/zones/woodyend.js` — remove river/pier/sign generation; road to east edge (border gap east at `ROAD_Y[39]`); east exits → `marish`/`west`, `requires: 'metGildor'`, denied "I should hear the Elf's counsel first."
- Create: `src/data/zones/marish.js` — generated map + `LANE_Y` export, spawns `west` and `landing`, NPCs, signs, `onUpdate: ferryEventUpdate`.
- Modify: `src/data/zones/index.js` — register `marish`.
- Create: `src/events/ferryEvent.js` — waggon-ride + crossing machine.
- Modify: `src/data/dialogues.js` — `maggot`, `merry`, `sign_ferry` (rewritten for the landing), `sign_buckland` (TO BE CONTINUED), Gildor objective text.
- Test: `tests/ferryEvent.test.js` (new), `tests/zones.test.js` (woodyend pier tests → replaced with east-exit/full-width-road tests; marish generated-map tests), `tests/dialogues.test.js`, `e2e/smoke.spec.js` (marish journey test).

## Marish layout (40×26, seeded LCG `0xba9`)

- `LANE_Y[x]`: 12 for x<10, 15 for x<22, 11 for x<32, 11 to the pier. Lane 2 tiles tall, carved like the Woody End road with vertical joins.
- Base: GRASS/GRASS2 with BOG patches (~18% away from lane), WATER pools ringed by REEDS, FLOWERS sparse. Border TREE except lane gaps west/none east (river).
- Farm (hand-carved after scatter): fence rect x14–27 / y17–24; farmhouse at top from STONE+ROOF rows (Green Dragon pattern); GARDEN crop rows in yard; gate gap (2 tiles, PATH) on the lane-facing side with path stub to lane. Maggot at the gate.
- River: WATER x≥33; pier DOCK/DOCK_S at `LANE_Y[32]` from x32–33; LANTERN on the bank tile beside the pier; `sign_ferry` next to it. East bank: GRASS strip x37–38 (TREE border x39), `sign_buckland` on it. Raft tween: x from ~33.5 to ~36.5 tiles.
- Spawns: `west { x:1, y:12 }`, `landing { x:30, y: LANE_Y[30], dir:'right' }`.
- NPCs: `maggot` gate pos, `when: (f) => !f.rodeWaggon`; `merry` landing (31, laneY−1), `when: (f) => f.rodeWaggon && !f.crossedFerry`; `merry` has an east-bank pos duplicate `when: (f) => f.crossedFerry` (post-crossing idle).

## ferryEvent.js machine

Phases: `idle → (maggotRide && !rodeWaggon) ride` [lock, fadeOut, teleport to landing spawn, snapFollower, setFlag rodeWaggon, fadeIn, banner] `→ armed → (merryMet && player tile x ≥ 32 on pier) boarding` [lock, `player.body.enable=false`, raft images (2 × tileset frame `T.DOCK`), place player/follower/merry on raft] `→ crossing` [tween raft+riders +3.5 tiles east over ~4500ms; at ~45%: rider sprite gallops in from the lane, halts at pier, `anims.pause()`, red flash, `sfx.sting()`, banner] `→ landed` [player to east bank, body re-enabled, snapFollower, merry to bank, unlock, `crossedFerry`, `sfx.jingle()`, objective + banner]. Inert when `crossedFerry`.

## Tasks

### Task 1: Tiles

- [ ] BOG + REEDS in `T`/`COLLISION_TILES`/`TILE_FNS`; `npm test`; art-test screenshot QA; commit `feat: marish tiles (bog, reeds)`.

### Task 2: Maggot & Merry sprites

- [ ] `CHAR_DEFS.maggot` (russet `V:#8a4a2a`-family, straw hat extra) and `CHAR_DEFS.merry` (green `V:#4a7a3a`, yellow scarf `C:#e0c050`); art-test QA; commit `feat: maggot and merry sprites`.

### Task 3: Woody End rework

- [ ] Update `tests/zones.test.js` woodyend block first: road PATH across full width at `ROAD_Y[x]`; no DOCK anywhere; east exits at (39, ROAD_Y[39]±0/1) target `marish.west` requiring `metGildor`. Run — FAIL.
- [ ] Edit `woodyend.js` generation + exits; Gildor dialogue objective text. `npm test` green (marish registration lands in Task 4 — keep exit-target assertion tolerant or land Tasks 3+4 in one commit if the registry check requires it).
- [ ] Commit: `feat: woody end road continues east to the marish`.

### Task 4: Marish zone

- [ ] Write marish generated-map tests first (lane carved along LANE_Y; farm fence closed except 2-tile gate; gate path connects to lane; pier at lane height; east-bank strip walkable; maggot/merry `when` gating). FAIL → implement `marish.js` + registry entry → green.
- [ ] Commit: `feat: the marish — bamfurlong farm, ferry landing, brandywine`.

### Task 5: Dialogues

- [ ] `maggot` (recognition, Rider account, waggon offer; `set: ['maggotRide','mushrooms']`, objective "Ride with Farmer Maggot to the Ferry"), `merry` (`set:'merryMet'`, objective "Board the ferry raft"), `sign_ferry` rewrite, `sign_buckland` (chapter-end / TO BE CONTINUED). Dialogue staging tests. Commit: `feat: maggot, merry, and ferry dialogues`.

### Task 6: Ferry event

- [ ] `tests/ferryEvent.test.js` fake-scene: ride fires once; boarding requires merryMet + pier position; body disabled during crossing and re-enabled after; rider spawned mid-crossing; `crossedFerry` set at landing; inert after. FAIL → implement `src/events/ferryEvent.js` → green.
- [ ] `WorldScene.create`: `this.ferryEvent = null` beside the other event resets.
- [ ] Commit: `feat: waggon ride and brandywine ferry crossing set piece`.

### Task 7: e2e + QA + PR

- [ ] New e2e test: preset flags (`prologueDone, timeskipShown, metGandalf, samJoined, escapedRider, metGildor`) + `__state.follower='sam'` before ENTER; `goToZone('marish','west')`; dialogue-poll Maggot → `rodeWaggon` && repositioned; dialogue-poll Merry; hold ArrowRight onto the pier; poll `crossedFerry`.
- [ ] `npm run lint && npm run typecheck && npm test && npm run build && npm run test:e2e` all green; manual Playwright playthrough with screenshots (farm, waggon fade, landing lamp, crossing, Rider on the bank, Buckland sign).
- [ ] Update `CLAUDE.md` Current State. Push, PR against `ch1-party-field` with play instructions.
