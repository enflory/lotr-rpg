# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Dev Commands

```bash
npm run dev        # Vite dev server with HMR
npm run build      # Production build → dist/
npm run preview    # Preview built output
npm test           # Vitest suite (tests/) — run after any data/logic change
npm run test:watch # Vitest in watch mode
npm run test:e2e   # Playwright smoke tests (e2e/) — boots the real game
npm run lint       # ESLint (flat config)
npm run typecheck  # tsc over JSDoc annotations (src/data, src/state, src/events)
npm run format     # Prettier — zone maps, pixel art, and songs are exempt (.prettierignore)
```

The data-layer contracts (Zone, Dialogue, etc.) are JSDoc typedefs in `src/data/types.js`, enforced by `npm run typecheck`. Annotate new zones/dialogues with `@type` so mistakes (bad `dir`, missing fields) fail the check. CI runs lint, typecheck, format check, unit tests, build, and e2e on every push/PR.

Unit tests live in `tests/` (Vitest, Node environment — no browser or canvas needed). They cover the data layer (dialogue staging, zone cross-reference integrity, tile registry invariants), the art helpers (via a fake 2D context that records `fillRect` calls), and the Black Rider state machine (via a fake Phaser scene). Phaser scenes themselves are not unit-tested. When adding a zone, NPC, dialogue, or tile, the integrity tests in `tests/zones.test.js` and `tests/tiles.test.js` will catch dangling references and ordering mistakes — run `npm test` first when debugging content bugs. Verify visual/gameplay changes with `npm run build` and browser testing. `art-test.html` (served by the dev server at `/art-test.html`) renders the full tileset and every character spritesheet at high zoom for visual QA of procedural art. `window.__game` (Phaser game) and `window.__state` (GameState) are exposed for Playwright-driven QA — teleport the player, set flags, and screenshot. README screenshots live in `assets/screenshots/` as exact 960×720 canvas captures: drive the game through the QA hooks, size the viewport to 960×720 so the canvas renders at 1× CSS scale, and screenshot the canvas element.

**Playwright QA gotcha:** synthetic key events work, but a keydown+keyup pair shorter than one frame is invisible to `Phaser.Input.Keyboard.JustDown` polling (keyup clears the flag). Interaction input is therefore event-driven (`keydown-SPACE` handler queues a flag consumed by update). When simulating input, hold keys ≥40ms.

## Architecture

**Top-down pixel art RPG** built with Phaser 3 + Vite, in the spirit of A Link to the Past. All art and audio are procedurally generated — there are no external assets.

### Scene Flow

`BootScene → TitleScene → WorldScene`

- **BootScene** (`src/scenes/BootScene.js`): thin loader — builds every texture from `src/art/` and registers walk/idle/gallop animations.
- **TitleScene**: title screen; ENTER — or a tap/click anywhere on a touch device — starts the game and initializes WebAudio (must happen inside a user gesture).
- **WorldScene** (`src/scenes/WorldScene.js`): renders _any_ zone. Handles movement (72 px/s, feet-only physics bodies, y-sorted depth), Sam and Pippin (trail the player's walked path at 18px intervals), NPC dialogue with typewriter effect, doors/signs/exits, objective banners (Q recalls, M mutes), and per-zone scripted events via `zone.onUpdate`.

### Touch Input (`src/input/touchControls.js`)

A DOM overlay (not canvas objects) built only when the browser reports a coarse
pointer, or on the first `touchstart` from a hybrid device. A thumb pad drives
`touchDirection()`, which WorldScene ORs with the cursor keys each frame;
`onTouchButton()` delivers `action` / `inventory` / `objective` / `mute`, which
call the same handlers the keys do — no synthetic key events, so the two input
modes can never disagree. `setTouchControlsVisible()` hides the pad on the title
screen and toggles the `has-touch-controls` body class that top-aligns the canvas
in portrait (styles live in `index.html`; Phaser uses `NO_CENTER` so flexbox owns
placement — `CENTER_BOTH` margins stack on top of the flex centring and push the
canvas off-centre). **Gotcha:** moving the canvas with CSS fires neither `resize`
nor `scroll`, and the ScaleManager only re-polls `canvasBounds` every ~500ms, so
every canvas pointer maps to the wrong world position in that window;
`setTouchControlsVisible` dispatches a synthetic `resize` whenever the class
actually changes. Anything else that repositions the canvas must do the same. `WorldScene.actionVerb()` reads `touchControlsActive()` so prompts say
`TAP A` instead of `SPACE`. Playwright covers the layer in `e2e/touch.spec.js`
under `devices['iPhone 13']`; the pad's direction maths is unit-tested in
`tests/touchControls.test.js`.

### Art Pipeline (`src/art/`)

- `helpers.js`: `px`/`rc`/`circle`, `drawPixelMap` (string-array pixel maps), `mirrorRows` (derive RIGHT from LEFT), `validateRows` (throws on ragged rows).
- `characters.js`: 16×24 outlined sprites, 3 frames × 4 directions. Hobbits share MALE/FEMALE 18-row templates recolored via per-character palettes in `CHAR_DEFS`; Gandalf (WIZARD) and Gildor (ELF) use 20-row templates; feet/boots are appended programmatically with the walk shuffle. `makeRiderSheet()` draws the 32×32 mounted Black Rider (2 gallop frames, faces right — flip with `setFlipX`). New hobbit = new palette entry; new race = new template maps.
- `tiles.js`: one draw function per tile, composited onto a strip; order must match `T` in `src/data/tileTypes.js`.
- `ui.js`: hint bubble sprite.

### Data Layer

- **`src/data/tileTypes.js`**: tile indices (`T`), `COLLISION_TILES`, `TILE_SIZE`.
- **`src/data/zones/`**: one file per zone, registered in `index.js` (which validates row widths). A zone = `{ key, label, music, map, spawns, npcs, doors, signs, exits, onUpdate? }`. NPC entries and exits accept `when`/`requires` flag conditions (e.g. Sam despawns after joining; the East Road is gated until `samJoined`). The Woody End map is generated with a seeded LCG (road waypoints in `ROAD_Y`, groves, guaranteed fern brakes off the road).
- **`src/data/dialogues.js`**: staged dialogue. Entry = `{ name, lines }` or `{ name, stages: [{ when(flags), lines, set?, objective?, join? }] }` — the first matching stage wins; effects fire when the dialogue closes. `resolveDialogue(key, flags)` does the lookup.
- **`src/state/GameState.js`**: module-singleton flags, follower, current objective. Reset only by page reload.
- **`src/events/riderEvent.js`**: the Black Rider set piece (armed → riding → sniffing → done/caught). Each hobbit is hidden iff their feet are on a `T.FERN` tile; an exposed companion can also be caught. The first encounter has three-row fern brakes on both sides of the road.

### Audio (`src/audio/sound.js`)

WebAudio chiptune: looping pattern songs (`shire`, `forest`, `interior`) scheduled a bar ahead, plus SFX (`blip`, `confirm`, `door`, `jingle`, `sting`). `initAudio()` must be called from a user gesture; everything no-ops before that.

## Design Documents

- **`docs/PRD.md`**: product requirements and open design questions. Read before big gameplay decisions.
- **`docs/game-reference.md`**: 10-chapter breakdown with rosters, palettes, signature mechanics.
- **`docs/lore/`**: Tolkien source material for dialogue and zone design.

## Design Principles

- **Book-faithful**: dialogue and events follow Tolkien's text. No invented lore. Include what adaptations cut (Tom Bombadil, Barrow-downs, Woody End).
- **Iterative chapters**: each chapter is a standalone playable zone set. Build, polish, ship one at a time.
- **Exploration-first**: wandering Middle-earth and talking to characters is the core loop, not combat.

## Current State

Chapter 1 vertical slice is playable end to end: Bag End (interior + exterior), Hobbiton with the Party Field to the west, the Green Dragon interior, the Woody End, and the Marish. Story: Bilbo's farewell party prologue in the Party Field (fireworks, the speech, the flash-vanish, a seventeen-year time skip — `src/events/partyEvent.js`) → Gandalf reveals the Ring → fetch Sam (joins as follower; Pippin walks in from off camera) → East Road → hide from the Black Rider in the ferns → Gildor → down into the Marish → Farmer Maggot at Bamfurlong (Rider story, mushrooms, waggon lift to the ferry) → Merry at the landing → raft crossing of the Brandywine with a Rider halting on the bank (`src/events/ferryEvent.js`) → the Buckland shore ("to be continued"). Presetting the `prologueDone` flag before ENTER on the title skips the prologue (used by e2e).

A depth-and-exploration layer now sits on top of the main story: collectible items with a walk-over pickup system, an `I`-key inventory/errand overlay, and book-anchored side-errands (Lobelia's spoons, the Gaffer's half-pint, Gandalf's fireworks crates in the prologue, Maggot's dogs) alongside two collectible tallies — mathoms (6) and mushrooms (12) — that a completionist can chase; crossing to Buckland with all three errands done and both tallies full earns a soft nod from Merry. The zones grew to hold it: Hobbiton is now 48×44 (Sandyman's Mill, the Ivy Bush, an orchard); the Woody End doubled to 64×28 (a longer road, a tree-tunnel, the fir-hollow with a fox vignette, Gildor's company at the feast); the Marish widened to 56×30 (the causeway, a fuller Bamfurlong with Mrs. Maggot). The walking song and the elf-song round out the road as vignettes. Chapter 1 still wants: Green Hill Country as a middle zone, more Hobbiton NPCs, and scripted movement (Gandalf leaving, Maggot's waggon visible on the road).

Pippin uses the existing hobbit sprite template with a blue waistcoat. His initial arrival follows walkable tiles while Frodo waits briefly; both companions then follow through zones, fern cover, and the ferry. `src/state/partyMovement.js` contains the tile-route and distance-along-trail helpers. Existing checkpoints with Sam restore both companions without replaying the entrance; the save format remains v1.

The game now has an autosave/continue system (`src/state/saveGame.js`): a single versioned localStorage key (`lotr-rpg.save.v1`) is written at every WorldScene zone entry, capturing flags, follower, objective, items, and collected state alongside the checkpoint zone/entry; the title screen offers Continue (loads the save) or New Game (clears it and starts the prologue fresh) and shows a fan-project disclaimer. The game is deployed to GitHub Pages at https://lotr.lonelymtnlabs.com by the `deploy` job in `ci.yml`, which runs on green pushes to `main`. Mobile browsers are supported: coarse-pointer devices get the on-screen thumb pad and A/I/Q/M buttons, and the title screen starts on a tap anywhere (with a NEW GAME hit zone).

## Chapters 2 and 3

The ferry now continues to Crickhollow and twelve new zones registered in `src/data/zones/index.js`. `beyondHedge.js` owns Crickhollow, the hedge tunnel and Tom's home; `oldforest.js` owns three large forest areas; `barrowdowns.js` owns the downs, barrow, rescue hill and road. `journeyMap.js` provides deterministic carving helpers. `chapterDialogues.js` contains original paraphrases and ordered, one-time story effects; source/adaptation notes are in `docs/lore/old-forest-adaptation.md`.

`Zone.interactions` defines inspectable walkable points with labels and optional `when` predicates. `ExitDef.blockedWhen` supports temporary story gates. `WorldScene.checkExits` samples the feet, matching collision/navigation. `checkpoint(entry)` updates the scene's active entry as well as writing the save: otherwise a later conversation can accidentally save the wrong riverbank. Dialogue completion applies effects, refreshes presentation, and checkpoints. The v1 format is unchanged.

`journeyEvent.js` reconstructs held followers and encounter visuals from persistent flags. `onDialogueLine` presents transient action tableaux; it must never apply permanent effects. Merry is the third follower after `merryJoined`. Willow captivity blocks leaving the river area until release; all three companions hide in the barrow and reappear on rescue. The house requires supper, first night, rainy stories, Ring demonstration, second night, farewell; the barrow requires courage, call, blades and ponies.

New art is in `forestTiles.js`, `journeyScenery.js`, `willowScenery.js` and `houseScenery.js`. Keep raised scenery aligned with collision geometry; large forest crowns are clipped to solid woodland. Original song IDs: `oldforest`, `bombadil`, `downs`, `barrow`.

`e2e/chapterJourney.spec.js` walks the connected route using keyboard input over BFS-discovered walkable tiles, reads ordinary interactions, and reloads through Continue at multiple encounter/rest checkpoints. It also checks the ferry handoff and captivity gates. The browser releases direction keys as it reaches a waypoint to avoid automation round-trip latency carrying the player into a corner. Pure route reachability and progression gates live in `tests/chapterJourney.test.js` and `tests/chapterDialogues.test.js`.

`willowEvent.js` owns the Willow's continuous animations using the actual player and follower sprites. `WorldScene.storyBeat` temporarily reserves dialogue input for an in-progress animation or a named player action; action prompts render above the dialogue panel. Scripted walking uses the map route helper, while slipping/tumbling uses short tweens. On completion, seed the follower trail from the visible formation instead of calling `snapFollower()`. Only scene creation may restore captives directly at the cracks. Transient tweens are never saved; Continue retries an unfinished dialogue from the last completed checkpoint. `e2e/willowAnimation.spec.js` samples actual sprite positions per frame using elapsed-time speed bounds (including a deliberate renderer pause), checks the action prompt and player gate, and reloads during capture.

`crickhollowEvent.js` and `crickhollowScenery.js` implement the evening meal and morning departure. The supper-room zone is `crickhollowhouse`; `crickhollowSupper`, `crickhollowMorning` and `crickhollowReady` preserve stable checkpoints across the overnight and exterior processions. Existing `chapter2` saves bypass this new opening. `storyMotion.js` shares collision-aware walking and tween helpers with Willow. A `storyBeat` outside dialogue blocks movement/overlays while the automatic cutscene plays; on completion, reseed the visible follower formation and restore physics. The full-route test waits for the morning gathering explicitly because a dialogue can finish before the following exterior procession does.

`tomHouseProgress.js` selects exactly one next house interaction from the furthest completed milestone. `tomHouseEvent.js` uses that selection for the visible cue, current objective and Continue recovery, then animates actual party sprites through supper, beds, dreams, the hearth and the Ring. Completed cues disappear. The Ring is a transient prop, never made visible from the `houseRing` completion flag. Shape fades must use an opaque fill plus `setAlpha(0)` initially, not an invisible fill; test effective `alpha * fillAlpha`. Transient scenes are replayed from completed dialogue checkpoints on reload.

`storyMotion.js` applies half walking pace (including animation playback) in Willow and Tom’s house. Tom follows a ground path with a separate skipping offset and tilt; his post-rescue walk continues after player control returns. `ponyEvent.js` follows leaders on cached walkable routes, entering outdoor maps from behind the boundary rather than spawning far ahead. Ponies wait during Willow captivity and outside Tom’s house, and disappear in the downs fog. Verify both smooth per-frame movement and no blocked-tile centres in `e2e/ponies.spec.js`.
