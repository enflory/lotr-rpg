# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Dev Commands

```bash
npm run dev       # Vite dev server with HMR
npm run build     # Production build → dist/
npm run preview   # Preview built output
```

No test framework is configured. Verify changes with `npm run build` (checks for compilation errors) and manual browser testing.

## Architecture

**Top-down pixel art RPG** built with Phaser 3 + Vite. All art is procedurally generated via Canvas 2D — there are no external image assets.

### Scene Flow

`BootScene → TitleScene → ShireScene`

- **BootScene** (`src/scenes/BootScene.js`): Generates all textures at startup. Draws 19 tile types and 6 character spritesheets pixel-by-pixel on offscreen canvases, converts to data URLs, loads as Phaser spritesheets. Also creates walk/idle animations for all characters. This is ~700 lines and is the art pipeline for the entire game.
- **TitleScene** (`src/scenes/TitleScene.js`): Title screen with Ring graphic. ENTER/SPACE transitions to gameplay.
- **ShireScene** (`src/scenes/ShireScene.js`): Main gameplay loop — tilemap rendering, player movement (arcade physics, 72px/sec, 4-direction + diagonal), NPC proximity interaction, typewriter dialogue system, camera follow.

### Data Layer

- **`src/data/map.js`**: 40×40 tile array (`MAP_DATA`), tile type constants (`T.GRASS`, `T.WATER`, etc.), collision tile list, NPC spawn positions, player start position. Shorthand variables (G, P, W, R, H, etc.) make the map array readable.
- **`src/data/dialogues.js`**: NPC dialogue keyed by character name. Each entry has `name` and `lines[]`. All text is book-faithful.

### How Procedural Art Works

Tiles are 16×16 pixels drawn with three helpers: `px()` (single pixel), `rc()` (rectangle), `circle()` (filled circle). Each tile has a dedicated draw function (e.g., `drawTree`, `drawWater`). All tile functions are called sequentially on a single horizontal strip canvas, which becomes the tileset spritesheet.

Characters are 48×64 canvases (3 walk frames × 4 directions). `drawCharDown/Up/Side()` render each frame using a color config from the `CHARS` object (hair, skin, shirt, pants, etc.). Hobbits are drawn shorter (offset topY = y+3); Gandalf fills the full tile and has hat/beard/staff.

Multi-tile hobbit holes use 4 special tile types: `DOOR_L`/`DOOR_R` (entrance sides with stone arch, round window, lantern) and `ROOF_L`/`ROOF_R` (sloping grass mounds). The center uses the standard `DOOR` tile.

### Key Constants

- Resolution: 320×240 (scaled via `Phaser.Scale.FIT`)
- Tile size: 16×16
- Map: 40×40 tiles
- Player speed: 72 px/sec
- Dialogue typewriter: 28ms per character
- Camera lerp: 0.08
- Interaction distance: 20px

## Design Documents

- **`docs/PRD.md`**: Product requirements with 15 open design questions (combat system, Ring mechanic, party display, etc.). Read this before making gameplay decisions.
- **`docs/game-reference.md`**: 10-chapter breakdown with character rosters, zone visual palettes, and signature mechanics per chapter.
- **`docs/lore/`**: Tolkien source material — detailed descriptions of all 25 Fellowship environments and 32+ named characters. Use these for writing dialogue and designing zones.

## Design Principles

- **Book-faithful**: Dialogue and events follow Tolkien's text. No invented lore. Include what adaptations typically cut (Tom Bombadil, Barrow-downs, Woody End).
- **Iterative chapters**: Each of the 10 chapters is a standalone playable zone. Build, polish, and ship one at a time.
- **Exploration-first**: The core experience is wandering Middle-earth and talking to characters, not combat.

## Current State

The Shire prototype (Chapter 1 seed) is playable: Bag End through The Water with 5 NPCs and door interactions. Chapter 1 still needs: event flag system, dialogue progression based on story state, zone transitions, map expansion (Green Hill Country, Woody End), NPC spawn/despawn logic, and scripted movement sequences.
