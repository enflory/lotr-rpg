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
npm run og-image   # re-render public/og-image.png (needs a Playwright browser)
```

Social link previews come from the Open Graph / Twitter `<meta>` block in `index.html`. Those URLs must be absolute (`https://lotr.lonelymtnlabs.com/...`) — scrapers don't run JS and don't honour Vite's relative `base`. The 1200×630 card at `public/og-image.png` is composed by `scripts/make-og-image.mjs` from a checked-in screenshot: it crops at 1:1 rather than scaling (any non-integer scale gives the pixel art uneven columns) and fails loudly if Press Start 2P doesn't load. Regenerate and commit it when the art or wording changes; scrapers cache, so an updated image at the same URL may not appear in previews already captured.

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
- `relief.js`: the shared height-field machinery (`maskOf`, `sample`, `wobble`, `hash`, `step`) used by both baked landscape renderers.
- `shireScenery.js`: the Shire, the Woody End and the Marish are shaded as country rather than tilework. One baked ground layer carries the roll of The Hill, lanes worn into irregular ribbons, wet ground as a spreading marsh, mown hay swathes, damp shingle at the water's edge and every cast shadow; a canopy layer cuts the woods into one image strip per tile row, each drawn at that row's depth so a hobbit walks behind a crown and in front of the trunk beneath it. Crowns rise at most `RISE` px above their own cell and never reach sideways over open ground. The Party Tree is drawn as a graphics landmark in its own right. `drawShireWeather` adds drifting motes per zone.
- `marishNight.js`: night and the river fog for the Marish — a screen-fixed tint, wisps of fog lying in world space, and a warm pool under every lamp. Raised during Maggot's ride and, from a `rodeWaggon` save, put straight up at zone creation.
- `waggon.js`: Farmer Maggot's cart and pony, drawn side-on rather than tiled so it can run along the lane and sort against the hobbits riding in it. `place(x, y)` sets it on the road and rolls the wheels by how far it moved.
- `interiorLight.js`: interiors are lit, not merely drawn. `bakeInteriorShadow` is a pure bake (no Phaser import, so it is unit-tested) producing a quantised darkness overlay opened out around every window, hearth, lamp and table candle; the hearth also gets an additive pool that breathes. Neither layer touches the characters.
- `ui.js`: hint bubble sprite.

### Data Layer

- **`src/data/tileTypes.js`**: tile indices (`T`), `COLLISION_TILES`, `TILE_SIZE`.
- **`src/data/zones/`**: one file per zone, registered in `index.js` (which validates row widths). A zone = `{ key, label, music, map, spawns, npcs, doors, signs, exits, onUpdate? }`. NPC entries and exits accept `when`/`requires` flag conditions (e.g. Sam despawns after joining; the East Road is gated until `samJoined`). The Woody End map is generated with a seeded LCG (road waypoints in `ROAD_Y`, groves, guaranteed fern brakes off the road).
- **`src/data/hobbitonDialogues.js`**: Chapter 1's inspectable places and the Hobbiton folk (Folco Boffin, Fredegar Bolger, Lotho Sackville-Baggins, Widow Rumble, Farmer Cotton), spread into `DIALOGUES`.
- **`src/data/dialogues.js`**: staged dialogue. Entry = `{ name, lines }` or `{ name, stages: [{ when(flags), lines, set?, objective?, join? }] }` — the first matching stage wins; effects fire when the dialogue closes. `resolveDialogue(key, flags)` does the lookup.
- **`src/state/GameState.js`**: module-singleton flags, follower, current objective. Reset only by page reload.
- **`src/events/gandalfEvent.js`**: Gandalf walks off down the Hill once his farewell has been heard (`gandalfLeft`), and the doorstep is empty from then on (`gandalfGone`).
- **`src/events/waggonEvent.js`**: the night ride to the Ferry. `route()` is built on demand — the Marish zone imports this module, so reading its lane constants at module load would read them before the zone has defined them — and it takes the bend on the eastern cell, because Bamfurlong's east fence stands in the western one. The ride ends by setting the party down at the `landing` spawn and setting `rodeWaggon`, which is where `ferryEvent.js` picks up.
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

A depth-and-exploration layer now sits on top of the main story: collectible items with a walk-over pickup system, an `I`-key inventory/errand overlay, and book-anchored side-errands (Lobelia's spoons, the Gaffer's half-pint, Gandalf's fireworks crates in the prologue, Maggot's dogs) alongside two collectible tallies — mathoms (6) and mushrooms (12) — that a completionist can chase; crossing to Buckland with all three errands done and both tallies full earns a soft nod from Merry. The zones grew to hold it: Hobbiton is 48×44 (Sandyman's Mill, the Ivy Bush, an orchard); the Woody End doubled to 64×28 (a longer road, a tree-tunnel, the fir-hollow with a fox vignette, Gildor's company at the feast); the Marish widened to 56×30 (the causeway, a fuller Bamfurlong with Mrs. Maggot). The walking song and the elf-song round out the road as vignettes.

Chapter 1 has since been brought up to the standard of the later chapters. Visually it is shaded by `shireScenery.js` and lit by `interiorLight.js` (above). In content:

- **The Hill.** Bag End is the widest facade on the Hill, with Sam's garden either side of the round green door, the Gaffer's bench, bee skeps, and two old trees on the crown; one lane climbs to the door instead of the old web of paths.
- **Bag End inside** is rebuilt to the plan in the book — a round door opening on a hall that runs straight into the Hill, with the study, parlour, bedroom and pantry opening off it and the deep-set round windows on the left-hand side going in. Panelled walls, pegs for hats and coats, a mathom chest and Bilbo's map of Wilderland.
- **The fields.** Hawthorn hedges divide the ground east of the village into a cornfield, a paddock with a duck pond and skeps, and a hayfield with the waggon and stooks. The Water widens into the Bywater Pool; Cotton's farm and the allotments line the south bank. The Green Dragon has a yard (well, benches, lanterns, stable) and the Party Field is laid out for a hundred and forty-four.
- **People.** Folco Boffin and Fredegar Bolger (who help Frodo pack up in the book), Lotho Sackville-Baggins, Widow Rumble and Farmer Cotton. The Gaffer tells of the black-clad stranger who came to Number Three asking after Baggins, if Frodo walks back up the Row after the Woody End.
- **Examine points.** `zone.interactions` are used across all five Chapter 1 zones, and `WorldScene` now draws the glimmer marker for _every_ zone (not just the journey zones, where `journeyEvent` used to own it). A hobbit standing in front of you always takes priority over a thing on the ground behind them.

- **Scripted departures.** Gandalf gives his last counsel and then walks down off the Hill and away east; he does not come back, exactly as in the book, where Frodo waits all summer for him and sets out without him. Farmer Maggot's lift to the Ferry is a watched ride rather than a fade to black: night comes down over the Marish, the fog rises, the cart runs the length of the causeway with all four aboard, halts once when hoofs are heard on the road behind, and the light that answers out of the mist is a lantern, not a Rider. The night and the fog stay up for the crossing.

Chapter 1 still wants: Green Hill Country as a middle zone.

Pippin uses the existing hobbit sprite template with a blue waistcoat. His initial arrival follows walkable tiles while Frodo waits briefly; both companions then follow through zones, fern cover, and the ferry. `src/state/partyMovement.js` contains the tile-route and distance-along-trail helpers. Existing checkpoints with Sam restore both companions without replaying the entrance; the save format remains v1.

The game now has an autosave/continue system (`src/state/saveGame.js`): a single versioned localStorage key (`lotr-rpg.save.v1`) is written at every WorldScene zone entry, capturing flags, follower, objective, items, and collected state alongside the checkpoint zone/entry; the title screen offers Continue (loads the save) or New Game (clears it and starts the prologue fresh) and shows a fan-project disclaimer. The game is deployed to GitHub Pages at https://lotr.lonelymtnlabs.com by the `deploy` job in `ci.yml`, which runs on green pushes to `main`. Mobile browsers are supported: coarse-pointer devices get the on-screen thumb pad and A/I/Q/M buttons, and the title screen starts on a tap anywhere (with a NEW GAME hit zone).

## Chapters 2 and 3

The ferry now continues to Crickhollow and twelve new zones registered in `src/data/zones/index.js`. `beyondHedge.js` owns Crickhollow, the hedge tunnel and Tom's home; `oldforest.js` owns three large forest areas; `barrowdowns.js` owns the downs, barrow, rescue hill and road. `journeyMap.js` provides deterministic carving helpers. `chapterDialogues.js` contains original paraphrases and ordered, one-time story effects; source/adaptation notes are in `docs/lore/old-forest-adaptation.md`.

`Zone.interactions` defines inspectable walkable points with labels and optional `when` predicates. `ExitDef.blockedWhen` supports temporary story gates. `WorldScene.checkExits` samples the feet, matching collision/navigation. `checkpoint(entry)` updates the scene's active entry as well as writing the save: otherwise a later conversation can accidentally save the wrong riverbank. Dialogue completion applies effects, refreshes presentation, and checkpoints. The v1 format is unchanged.

`journeyEvent.js` reconstructs held followers and encounter visuals from persistent flags. `onDialogueLine` presents transient action tableaux; it must never apply permanent effects. Merry is the third follower after `merryJoined`. Willow captivity blocks leaving the river area until release; all three companions hide in the barrow and reappear on rescue. The house requires supper, first night, rainy stories, Ring demonstration, second night, farewell; the barrow requires courage, call, blades and ponies.

New art is in `forestTiles.js`, `journeyScenery.js`, `willowScenery.js` and `houseScenery.js`. Keep raised scenery aligned with collision geometry; large forest crowns are clipped to solid woodland. Original song IDs: `oldforest`, `bombadil`, `downs`, `barrow`.

The chapter 2–3 route is walked by three segment specs — `e2e/routeForest.spec.js`, `routeWillow.spec.js` and `routeDowns.spec.js` — sharing `e2e/journeyRoute.js` and each booting from a checkpoint at the previous segment's boundary; `BOUNDARY` there is the seam guard, so a segment asserts it reached the flag state the next one assumes. `e2e/chapterJourney.spec.js` keeps the cheap seams: the ferry handoff, the captivity gates, and that every boundary names a real zone entry. They walk using keyboard input over BFS-discovered walkable tiles, read ordinary interactions, and reload through Continue at multiple encounter/rest checkpoints. `walk` waits out a zone transition before resuming after a story trigger — `zoneKey` still reads as the old zone for the length of the camera fade, and the wight taking Frodo moves the destination out from under it. The browser releases direction keys as it reaches a waypoint to avoid automation round-trip latency carrying the player into a corner. Pure route reachability and progression gates live in `tests/chapterJourney.test.js` and `tests/chapterDialogues.test.js`.

The Barrow-downs use a smoothed height field with opaque pixel-art color bands. `journeyMap.js` provides `smoothNoise` and `wind`; `barrowdowns.js` settles the hill mask and preserves the main chalk crossing plus a southern exploration loop. `bakeDownsRelief` in `downsScenery.js` produces a bounded palette with a lit northern crest, cool near faces, cast shadows, and sparse grass/heather clusters. Tile centres retain their solid/open reading while edges can round off. The chalk and East Road have opaque worn edges, so the base tiles never bleed through. Only tiles listed in `GROUND` are repainted; unrelated tile art stays intact. Terrain textures are cached by zone. `GREAT_STONE` identifies the main waymark; paired `STANDING_STONE` tiles form the gate, with mirrored art rooted on each collider. Low kerbstones mark the southern mounds; the heather hollow and weathered stone are optional interactions with no progression effects. `tests/downsScenery.test.js` checks palette, opacity, tile-centre readability and gate alignment; `e2e/barrowReview.spec.js` walks the daylight loop and covers older saves, live props and gate movement.

`barrowEvent.js` owns the downs, the barrow and the morning after, with the same beat contract as the Willow. The mist is raised inside the sleep beat (nothing else runs while a dialogue is open) and held up by `downsFog` afterwards, so a reload mid-scene finds clear noon and replays it. Progress is three staged doors, none of which can be walked past: the great stone (`downs_stone`), the gate stones (`downs_gate`, where Frodo leads through before the others fade behind him), and the hollow beyond (`downs_voices`). `heldKeys` is the single source of truth for who is out of sight, so Continue rebuilds the same picture. Checkpoints follow the story — `stone`, then `gate` — not the doorway the party came in by. In the mist, straying more than three tiles off the chalk for four seconds brings up a drifting wisp leaning toward the next landmark, and a banner after twelve. The groping hand is a container of a forearm plus five separately animated digits that routes round the wall spur and crawls toward Sam; `barrow_wake` and the rising on `barrowhill` are automatic beats, and a beat with no dialogue behind it releases control itself. The summoning verse Tom teaches in `house_farewell` is the same four lines Frodo sings in `barrow_call`.

`willowEvent.js` owns the Willow's continuous animations using the actual player and follower sprites. `WorldScene.storyBeat` temporarily reserves dialogue input for an in-progress animation or a named player action; action prompts render above the dialogue panel. Scripted walking uses the map route helper, while slipping/tumbling uses short tweens. On completion, seed the follower trail from the visible formation instead of calling `snapFollower()`. Only scene creation may restore captives directly at the cracks. Transient tweens are never saved; Continue retries an unfinished dialogue from the last completed checkpoint. `e2e/willowAnimation.spec.js` samples actual sprite positions per frame using elapsed-time speed bounds (including a deliberate renderer pause), checks the action prompt and player gate, and reloads during capture.

`crickhollowEvent.js` and `crickhollowScenery.js` implement the evening meal and morning departure. The supper-room zone is `crickhollowhouse`; `crickhollowSupper`, `crickhollowMorning` and `crickhollowReady` preserve stable checkpoints across the overnight and exterior processions. Existing `chapter2` saves bypass this new opening. `storyMotion.js` shares collision-aware walking and tween helpers with Willow. A `storyBeat` outside dialogue blocks movement/overlays while the automatic cutscene plays; on completion, reseed the visible follower formation and restore physics. The full-route test waits for the morning gathering explicitly because a dialogue can finish before the following exterior procession does.

`tomHouseProgress.js` selects exactly one next house interaction from the furthest completed milestone. `tomHouseEvent.js` uses that selection for the visible cue, current objective and Continue recovery, then animates actual party sprites through supper, beds, dreams, the hearth and the Ring. Completed cues disappear. The Ring is a transient prop, never made visible from the `houseRing` completion flag. Shape fades must use an opaque fill plus `setAlpha(0)` initially, not an invisible fill; test effective `alpha * fillAlpha`. Transient scenes are replayed from completed dialogue checkpoints on reload.

`storyMotion.js` applies half walking pace (including animation playback) in Willow and Tom’s house. Tom follows a ground path with a separate skipping offset and tilt; his post-rescue walk continues after player control returns. `ponyEvent.js` follows leaders on cached walkable routes, entering outdoor maps from behind the boundary rather than spawning far ahead. Ponies wait during Willow captivity and outside Tom’s house, and disappear when Frodo loses the company at the downs gate stones. Verify both smooth per-frame movement and no blocked-tile centres in `e2e/ponies.spec.js`.

`barrowLandmarks.js` keeps the resting stone (beyond the panoramic lookout), party gathering spot, bedside song cue and rescue breach aligned across data, art and animation. Sleep raises fog without losing companions or ponies; only `downsSeparated` hides them. Capture uses the full-view black overlay. Tom enters through the jagged wall breach without a white flash; after the pony conversation he skips to the hill exit with player control available, and Continue leaves him ahead. `e2e/barrowStaging.spec.js` checks these beats, ordering and reload behavior. The adaptation notes record the retained compression of the morning-after sequence.
