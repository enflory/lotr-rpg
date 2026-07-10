# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Dev Commands

```bash
npm run dev       # Vite dev server with HMR
npm run build     # Production build → dist/
npm run preview   # Preview built output
```

No test framework is configured. Verify changes with `npm run build` (checks for compilation errors) and browser testing. `art-test.html` (served by the dev server at `/art-test.html`) renders the full tileset and every character spritesheet at high zoom for visual QA of procedural art. `window.__game` (Phaser game) and `window.__state` (GameState) are exposed for Playwright-driven QA — teleport the player, set flags, and screenshot.

**Playwright QA gotcha:** synthetic key events work, but a keydown+keyup pair shorter than one frame is invisible to `Phaser.Input.Keyboard.JustDown` polling (keyup clears the flag). Interaction input is therefore event-driven (`keydown-SPACE` handler queues a flag consumed by update). When simulating input, hold keys ≥40ms.

## Architecture

**Top-down pixel art RPG** built with Phaser 3 + Vite, in the spirit of A Link to the Past. All art and audio are procedurally generated — there are no external assets.

### Scene Flow

`BootScene → TitleScene → WorldScene`

- **BootScene** (`src/scenes/BootScene.js`): thin loader — builds every texture from `src/art/` and registers walk/idle/gallop animations.
- **TitleScene**: title screen; ENTER starts the game and initializes WebAudio (must happen inside a user gesture).
- **WorldScene** (`src/scenes/WorldScene.js`): renders *any* zone. Handles movement (72 px/s, feet-only physics bodies, y-sorted depth), the Sam follower (trails the player's position queue), NPC dialogue with typewriter effect, doors/signs/exits, objective banners (Q recalls, M mutes), and per-zone scripted events via `zone.onUpdate`.

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
- **`src/events/riderEvent.js`**: the Black Rider set piece (armed → riding → sniffing → done/caught). Player is hidden iff standing on a `T.FERN` tile.

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

Chapter 1 vertical slice is playable end to end: Bag End (interior + exterior), Hobbiton, the Green Dragon interior, and the Woody End. Story: Gandalf reveals the Ring → fetch Sam (joins as follower) → East Road → hide from the Black Rider in the ferns → Gildor → Bucklebury Ferry sign ("to be continued"). Chapter 1 still wants: Green Hill Country as a middle zone, mushroom/pickup items, Farmer Maggot, a save system (flags → localStorage), more Hobbiton NPCs, and scripted movement (Gandalf leaving, party fireworks).
