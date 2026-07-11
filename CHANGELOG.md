# Changelog

Versions track chapter milestones: `0.<chapter>.x` while a chapter is in
progress, `1.0.0` when all ten chapters of _Fellowship_ are playable.

## 0.2.0 — 2026-07-10

Chapter 1 vertical slice, playable end to end, plus repo formalization.

### Game

- Zone system: Bag End (interior + exterior), Hobbiton, the Green Dragon
  interior, and the Woody End, connected by doors and walk-on exits
- Staged dialogue with story flags: Gandalf reveals the Ring, Sam joins
  as a follower, Gildor sends you to the Bucklebury Ferry
- The Black Rider set piece: hide in the fern brakes or be caught
- Procedural chiptune audio (three looping songs + SFX) and fully
  procedural pixel art (34 tiles, 8 characters, mounted Black Rider)
- Title screen with chapter card; objective banners (Q recalls, M mutes)

### Infrastructure

- Vitest suite (60 tests): dialogue staging, zone cross-reference
  integrity, tile registry contract, art helpers, rider state machine
- Playwright smoke tests driving the real game through QA hooks
- GitHub Actions CI: lint, format check, unit tests, build, e2e
- ESLint + Prettier (hand-aligned maps and pixel art exempted)

## 0.1.0

- First prototype: the Shire with 5 NPCs, dialogue, and procedural art
