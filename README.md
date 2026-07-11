# The Lord of the Rings RPG

A top-down pixel art RPG covering The Fellowship of the Ring, faithful to Tolkien's books. Game Boy / Link's Awakening aesthetic — all art generated procedurally in code with no external image assets.

Play as Frodo Baggins from the round green door of Bag End to the breaking of the Fellowship at Parth Galen.

## Running Locally

```bash
npm install
npm run dev
```

Open the URL shown in your terminal. Use arrow keys to move, SPACE/ENTER to interact.

## Building

```bash
npm run build    # outputs to dist/
npm run preview  # preview the build
```

## Testing

```bash
npm test            # run the Vitest suite once
npm run test:watch  # watch mode
```

Unit tests in `tests/` cover the dialogue staging system, zone map integrity (every door, exit, sign, and NPC cross-checked against what it references), the tile registry, the procedural art helpers, and the Black Rider encounter state machine.

## Status

**Chapter 1 vertical slice** — playable end to end: Bag End, Hobbiton, the Green Dragon, and the Woody End. Gandalf reveals the Ring, Sam joins as a follower, and you must hide from a Black Rider in the ferns on the way to the Bucklebury Ferry. The full game is planned as 10 chapters covering all of Fellowship. See `docs/PRD.md` for the product requirements and `docs/game-reference.md` for the chapter breakdown.

## Tech

- [Phaser 3](https://phaser.io/) game engine
- [Vite](https://vite.dev/) build tool
- All pixel art (tiles and character sprites) generated at runtime via Canvas 2D
- 320×240 resolution, 16×16 tiles, scaled to fit browser
