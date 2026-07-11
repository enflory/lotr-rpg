# The Lord of the Rings RPG

A top-down pixel art RPG covering _The Fellowship of the Ring_, faithful to Tolkien's books. Game Boy / Link's Awakening aesthetic — all art and audio generated procedurally in code, with no external assets.

Play as Frodo Baggins from the round green door of Bag End to the breaking of the Fellowship at Parth Galen.

![Frodo meets Gandalf below Bag End](assets/screenshots/hobbiton.png)

## Running Locally

```bash
npm install
npm run dev
```

Open the URL shown in your terminal.

| Key           | Action                    |
| ------------- | ------------------------- |
| Arrow keys    | Move                      |
| SPACE / ENTER | Talk / interact / advance |
| Q             | Recall current objective  |
| M             | Mute audio                |

## Status

**Chapter 1 vertical slice (v0.2)** — playable end to end: Bag End, Hobbiton, the Green Dragon, and the Woody End. Gandalf reveals the Ring, Sam joins as a follower, and you must hide from a Black Rider in the ferns on the way to the Bucklebury Ferry. The full game is planned as 10 chapters covering all of _Fellowship_. See `docs/PRD.md` for product requirements, `docs/game-reference.md` for the chapter breakdown, and `CHANGELOG.md` for release history.

## Development

```bash
npm run dev         # Vite dev server with HMR
npm run build       # production build → dist/
npm run preview     # preview the build
npm test            # Vitest unit suite
npm run test:watch  # unit tests in watch mode
npm run test:e2e    # Playwright smoke tests (boots the real game)
npm run lint        # ESLint
npm run format      # Prettier (zone maps & pixel art are exempt)
```

- **Unit tests** (`tests/`) cover dialogue staging, zone map integrity (every door, exit, sign, and NPC cross-checked against what it references), the tile registry, the procedural art helpers, and the Black Rider encounter state machine.
- **Smoke tests** (`e2e/`) drive the actual game in a browser through the `window.__game` / `window.__state` QA hooks.
- **Art QA**: the dev server serves `art-test.html`, which renders the full tileset and every character spritesheet at high zoom.
- CI runs lint, format check, unit tests, build, and e2e on every push and PR.

## Tech

- [Phaser 3](https://phaser.io/) game engine
- [Vite](https://vite.dev/) build tool, [Vitest](https://vitest.dev/) + [Playwright](https://playwright.dev/) for tests
- All pixel art (tiles and character sprites) generated at runtime via Canvas 2D
- All music and SFX synthesized at runtime via WebAudio
- 320×240 resolution, 16×16 tiles, scaled to fit the browser

## License

Code is [ISC licensed](LICENSE). This is an unofficial, non-commercial fan project, not affiliated with or endorsed by the Tolkien Estate or any rights holder of J.R.R. Tolkien's works.
