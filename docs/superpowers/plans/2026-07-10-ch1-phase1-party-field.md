# Chapter 1 Revision — Phase 1: Party Field & Bilbo's Farewell Prologue

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add the Party Field (with the Party Tree) west of Hobbiton and open the game with an abridged, book-faithful Long-expected Party prologue: fireworks, Bilbo's speech, the vanishing, then a "seventeen years pass" time-skip into the existing Gandalf opening.

**Architecture:** Everything rides on existing systems. The Party Field is a rework of the western strip of the hand-authored `shire.js` map plus 6 new tiles (2×2 Party Tree, tent, lantern). The prologue is a `zone.onUpdate` state machine (`src/events/partyEvent.js`, modeled on `riderEvent.js`) armed until the `prologueDone` flag lands. Bilbo is a new palette entry on the MALE hobbit template. Party guests are the existing Gaffer/Rosie/Ted/Gandalf sprites repositioned via `when` flag conditions, with prologue dialogue stages prepended (first matching stage wins).

**Tech Stack:** Phaser 3 + Vite; Vitest (Node, fake scenes) for units; Playwright for e2e via `window.__game` / `window.__state`.

**Branch:** `ch1-party-field` off `main`. One PR; the user plays it before merge.

---

## Story flow (abridged from *A Long-expected Party*)

1. New game → spawn in the Party Field at dusk of the party. Objective: *"Speak with Bilbo beneath the Party Tree"*. Fireworks burst over the field on a timer. Gaffer, Rosie, Ted, and Gandalf stand among the tents with party dialogue.
2. Talk to Bilbo → his speech (paraphrased book lines) → dialogue close sets `bilboFarewell`.
3. Event machine: white flash, Bilbo vanishes (sting SFX), banner, then fade out, set `prologueDone`, restart the shire zone at the `default` spawn.
4. On re-create, a one-shot banner: *"Seventeen years pass..."* (flag `timeskipShown`). Objective becomes the existing *"Speak with Gandalf outside Bag End"*. Game proceeds exactly as today.

Skip path (existing e2e tests, QA): presetting `prologueDone` before pressing ENTER on the title boots straight into the current opening.

## Files

- Modify: `src/data/tileTypes.js` — add `PARTY_TL/TR/BL/BR`, `TENT`, `LANTERN` (indices 34–39); all six in `COLLISION_TILES`.
- Modify: `src/art/tiles.js` — six draw functions appended to `TILE_FNS` in matching order.
- Modify: `src/art/characters.js` — `bilbo` palette entry (MALE maps; green waistcoat w/ gold buttons via `b`, white shirt, grey-streaked brown curls; `extra` hook optional).
- Modify: `src/data/zones/shire.js` — Party Field map rework (west, rows ~20–33, cols 1–8), `party` spawn, prologue NPC placements with `when` conditions, `onUpdate: partyEventUpdate`, `onCreate` time-skip banner.
- Modify: `src/data/zones/greendragon.js` — Rosie/Ted gated `when: (f) => f.prologueDone` (they're at the party otherwise).
- Create: `src/events/partyEvent.js` — prologue state machine + firework helper.
- Modify: `src/data/dialogues.js` — `bilbo` entry; prologue stages prepended to `gandalf`, `gaffer`, `rosie`, `ted`.
- Modify: `src/scenes/TitleScene.js` — entry select on `prologueDone`; set prologue objective.
- Modify: `src/scenes/WorldScene.js` — reset `this.partyEvent = null` in `create()` (scene.restart reuses the instance, same as the existing `riderEvent` reset).
- Test: `tests/partyEvent.test.js` (new, fake-scene machine test), `tests/zones.test.js` (party-layout assertions), `tests/dialogues.test.js` (staging), `e2e/smoke.spec.js` (prologue test + skip-path helper).

## Map layout (shire.js, west strip)

Cols 1–8, rows 20–33 become the Party Field. Key placements (x,y tile coords):

- **Party Tree** 2×2: PARTY_TL(4,22) PARTY_TR(5,22) / PARTY_BL(4,23) PARTY_BR(5,23).
- **Tents:** (2,25), (7,25), (2,30).
- **Lanterns:** (1,21), (8,21), (2,33), (7,33).
- **Path spur** from the north-south road (cols 9–10) west along row 27: x2–x8 = PATH.
- Flowers scattered on remaining grass; existing tree blob at x13–18 rows 27–32 stays (now just a grove — update the stale "Party Field" comment).
- **Spawn** `party: { x: 6, y: 27, dir: 'left' }`.
- **NPCs during prologue** (`when: (f) => !f.prologueDone`): bilbo (4,25) down (beneath the tree), gandalf (2,28) right, gaffer (3,26) right, rosie (7,26) left, ted (7,29) left.
- **Existing NPC gating:** gandalf@(19,8) and gaffer@(10,15) get `when: (f) => f.prologueDone`. sam and lobelia unchanged.

## Task 1: Tiles (registry + art)

- [ ] Add the six `T` entries + `COLLISION_TILES` additions; append six draw functions to `TILE_FNS`. Party Tree reads as one big canopy across 4 tiles (canopy top halves on TL/TR; trunk + canopy skirt on BL/BR), grass background `#5a9e3a` to blend with GRASS. TENT: striped canvas pavilion with a dark entrance. LANTERN: post + warm glowing lamp (gold `#e8c840`/`#f8e880` halo).
- [ ] Run `npm test` — `tests/tiles.test.js` order/length contract passes.
- [ ] Visual QA: `npm run dev`, open `/art-test.html`, screenshot tileset, adjust pixels until the tree composite reads clearly.
- [ ] Commit: `feat: party field tiles (party tree, tent, lantern)`

## Task 2: Bilbo sprite

- [ ] Add `bilbo` to `CHAR_DEFS` (MALE maps, HOBBIT_SKIN, hair `H:#6a5a40 h:#8a7a58 l:#a89a74` (greying), waistcoat `V:#3a6a2a v:#4e8a3a G:#2a4e1e`, shirt collar `C:#f0e8d0 c:#d0c4a8`, belt `B:#301810 b:#e0c050`, breeches `P:#7a3a28 p:#552818`).
- [ ] QA on `/art-test.html`; `npm test` (zones test will require dialogue too — added in Task 4; run full suite at Task 4).
- [ ] Commit: `feat: bilbo sprite`

## Task 3: Map rework + zone data

- [ ] Edit `shire.js` rows 20–33 per the layout above; add `party` spawn; NPC `when` gating; wire `onUpdate: partyEventUpdate` and `onCreate` time-skip banner (see Task 5); gate greendragon Rosie/Ted.
- [ ] Add zone assertions to `tests/zones.test.js` (party tree 2×2 composite intact, spawn walkable, prologue NPCs gated: `when({})` truthy, `when({prologueDone:true})` falsy — and inverses for the post-prologue gandalf/gaffer entries).
- [ ] `npm test` — zone integrity green (row widths, walkability, NPC dialogue refs).
- [ ] Commit: `feat: party field in the western shire + prologue NPC staging`

## Task 4: Dialogues

- [ ] `bilbo` staged entry — speech (5 short lines paraphrasing the book: "My dear Bagginses and Boffins…", "eleventy-one", "I regret to announce — this is the END. I am going. I am leaving NOW. GOOD-BYE!"), `set: 'bilboFarewell'`; fallback stage after.
- [ ] Prologue stages prepended to `gandalf` (fireworks pride, "you'll want a sharp eye at the speech"), `gaffer` ("free beer for a week"), `rosie`, `ted` — all `when: (f) => !f.prologueDone`.
- [ ] `tests/dialogues.test.js`: bilbo stage 1 fires on empty flags and sets `bilboFarewell`; gandalf resolves to party stage pre-prologue and to ring-reveal stage when `prologueDone` && `!metGandalf`.
- [ ] `npm test` green. Commit: `feat: prologue dialogues (bilbo farewell + party guests)`

## Task 5: Prologue event machine

- [ ] Write `tests/partyEvent.test.js` first (fake scene à la `riderEvent.test.js`): phases `party → vanish → timeskip → done`; fireworks spawn on timer during `party`; `bilboFarewell` triggers lock+flash+removeNpc('bilbo'); `prologueDone` + objective set before restart; machine inert when `prologueDone` already set. Run — FAIL (module missing).
- [ ] Implement `src/events/partyEvent.js`:
  ```js
  // phases: party (ambient fireworks, wait for bilboFarewell) → vanish
  // (flash, remove Bilbo, banner) → timeskip (fade, set prologueDone,
  // restart at default spawn) → done
  ```
  Fireworks: `scene.add.circle` sparks tweened radially from a random point over the field (x 16–140 px, y 300–360 px), gold/red/green, destroyed on complete; guard `scene.add.circle` absence in fake scene not needed — fake provides recorder. `sfx.blip()` per burst.
- [ ] `WorldScene.create`: `this.partyEvent = null;` beside the riderEvent reset. `shire.onCreate`: one-shot `timeskipShown` banner.
- [ ] `TitleScene.startGame`: entry = `hasFlag('prologueDone') ? 'default' : 'party'`; when starting prologue, `setObjective('Speak with Bilbo beneath the Party Tree')`.
- [ ] `npm test` green. Commit: `feat: long-expected party prologue event`

## Task 6: e2e + full QA

- [ ] `e2e/smoke.spec.js`: `startGame(page, { skipPrologue = true })` presets `window.__state.flags.prologueDone = true` before ENTER (existing tests unchanged in behavior). New test: boot without skip → objective /Bilbo/, teleport beside Bilbo, hold-press SPACE through speech, poll for `prologueDone` && scene back at default spawn && objective /Gandalf/ (generous timeout — fade+restart).
- [ ] `npm run lint && npm run typecheck && npm test && npm run build && npm run test:e2e` all green.
- [ ] Manual Playwright QA pass (dev server + browser): screenshot the party field, fireworks, Bilbo vanish, time-skip banner; then play through Gandalf→Sam→East Road to confirm no regression.
- [ ] Commit: `test: prologue e2e + smoke skip-path`

## Task 7: PR

- [ ] Update `CLAUDE.md` Current State (party prologue shipped; remove "party fireworks" from wants).
- [ ] Push `ch1-party-field`, open PR with summary + play instructions ("delete localStorage not needed — state is in-memory; just reload").
