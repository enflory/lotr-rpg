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

## Status

**Prototype** — The Shire is playable (Bag End through The Water) with 5 NPCs and dialogue. The full game is planned as 10 chapters covering all of Fellowship. See `docs/PRD.md` for the product requirements and `docs/game-reference.md` for the chapter breakdown.

## Tech

- [Phaser 3](https://phaser.io/) game engine
- [Vite](https://vite.dev/) build tool
- All pixel art (tiles and character sprites) generated at runtime via Canvas 2D
- 320×240 resolution, 16×16 tiles, scaled to fit browser
